const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const { NODE_ENV = '' } = process.env;

function getEnvMap() {
  const envFile = NODE_ENV === 'development'
    ? `.development.env`
    : '.env';
  const env = dotenv.parse(fs.readFileSync(envFile));
  if (NODE_ENV !== 'development') {
    Object
      .keys(env)
      .forEach(k => env[k] = process.env[k]);
  }
  return env;
}

function getYmlPath({ relativePath, source = '', target = '' }) {
  const prefix = '$$';
  const base = path.resolve(__dirname, relativePath);
  return {
    from: base.replace(prefix, source),
    to: base.replace(prefix, target),
  };
}

function setVariables(filePath, envMap) {
  let result = fs.readFileSync(filePath, { encoding: 'utf8' });
  Object
    .entries(envMap)
    .forEach(([k, v]) => {
      result = result.replace(new RegExp(`\\$${k}`, 'g'), v);
    });
  return result;
}

function getNextYml() {
  const relativePath = 'source/_data/$$next.yml';
  return getYmlPath({ relativePath, source: '.' });
}

function getHexoYml() {
  const relativePath = '$$config.yml';
  return getYmlPath({ relativePath, source: '.', target: '_' });
}


function main() {
  const envMap = getEnvMap();
  const nextYml = getNextYml();
  const hexoYml = getHexoYml();
  const nextRes = setVariables(nextYml.from, envMap);
  const hexoRes = setVariables(hexoYml.from, envMap);
  fs.writeFileSync(nextYml.to, nextRes);
  fs.writeFileSync(hexoYml.to, hexoRes);
}

main();
