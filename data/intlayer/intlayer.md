# Intlayer/intlayer

## Resumen

Intlayer/intlayer no es un modelo de inteligencia artificial: es un repositorio alojado en HuggingFace que contiene el despliegue estatico del sitio web ai.intlayer.org, la pagina de presentacion del framework de internacionalizacion (i18n) Intlayer. El repositorio no incluye pesos, configuraciones de inferencia ni artefactos de un modelo entrenado; su contenido es una landing page servida con Nginx dentro de un contenedor Docker. Por tanto, no existen parametros, contexto, licencia de modelo ni datos de entrenamiento que describir.

El proyecto subyacente, Intlayer, es un framework open source de i18n para JavaScript y TypeScript (React, Next.js, Vite, Vue, Svelte, Express y otros) desarrollado por Aymeric P. (usuario aymericzip). Su propuesta diferencial es tratar la declaracion de contenido como codigo y ofrecer herramientas de linea de comandos asistidas por IA para completar, traducir y auditar diccionarios y documentacion.

La relevancia de esta ficha es acotada: quien llegue a ella buscando un modelo de lenguaje no encontrara ninguno. Lo que si encontramos es documentacion de un conjunto de utilidades (`intlayer fill`, `intlayer doc translate`, `intlayer doc review`) que orquestan modelos de terceros (OpenAI, Anthropic, Mistral, Google Gemini, Ollama) para automatizar flujos de localizacion. No se especifica en la informacion disponible ningun modelo propio ni arquitectura desarrollada por Intlayer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un sitio estatico servido con Nginx) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica al repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene HTML/CSS/JS estatico y un Dockerfile) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido es una aplicacion web estatica: HTML, CSS y JavaScript servidos por Nginx desde una imagen Docker construida con `docker build -t intlayer-ai -f ./Dockerfile .` y ejecutada con `docker run --rm -p 8000:80 --name intlayer-ai-app intlayer-ai`.

Las innovaciones tecnicas que describe el README pertenecen al framework Intlayer, no a este repositorio: declaracion de contenido por locale en archivos `*.content.{ts,js,tsx,jsx,json}`, autocompletado de TypeScript, diccionarios tree-shakables, integracion en CI/CD y un CMS con editor visual. Las herramientas CLI delegan la generacion en modelos externos (OpenAI, Anthropic, Mistral, Google Gemini, Ollama), con estrategias de troceado de archivos grandes (*smart chunking*) para respetar los limites de contexto del proveedor elegido, procesamiento en colas concurrentes y modo no destructivo que preserva las traducciones existentes.

## Capacidades

- No aplica: este repositorio no expone capacidades de generacion, razonamiento, codigo, matematicas ni vision, porque no contiene un modelo.
- El sitio documenta las siguientes utilidades del ecosistema Intlayer, que si realizan tareas asistidas por IA a traves de modelos de terceros:
  - `intlayer fill`: auditoria y relleno automatico de traducciones ausentes en diccionarios, con deteccion de inconsistencias estructurales y discrepancias de tipos.
  - `intlayer doc translate`: traduccion de documentacion en Markdown y MDX preservando frontmatter, bloques de codigo y estructura del documento.
  - `intlayer doc review`: auditoria de documentacion traducida frente al idioma base, con modos `apply`, `report` y `synthesis`.
- Seleccion configurable de proveedor y modelo de IA mediante flags como `--provider openai --model gpt-4o`.
- Procesamiento por lotes con control de concurrencia (`--nb-simultaneous-file-processed`).
- Integracion con un servidor MCP (`@intlayer/mcp`) para asistencia en el IDE.

## Casos de uso

- Localizacion de aplicaciones React, Next.js, Vue o Svelte: el flujo `intlayer fill` detecta claves sin traducir en los archivos de contenido y las completa usando el proveedor de IA configurado, manteniendo las traducciones ya existentes intactas.
- Traduccion de documentacion tecnica: `intlayer doc translate` procesa patrones glob (`docs/**/*.md`), conserva el frontmatter y los bloques de codigo, y permite fijar idioma base e idiomas destino de forma explicita.
- Auditoria de sincronizacion entre idiomas en un repositorio grande: `intlayer doc review --mode report` genera un listado de bloques desactualizados con numeros de linea sin invocar APIs de traduccion, util para revision manual o agentica.
- Integracion en CI/CD: los comandos pueden ejecutarse en pipelines para validar que ningun diccionario queda incompleto antes de un despliegue, con `--skip-if-exists` para evitar reprocesar archivos sin cambios.
- Migracion incremental de contenido legacy a un modelo de contenido tipado: la declaracion de contenido como codigo permite migrar diccionarios clave-valor a archivos `*.content.ts` con autocompletado y comprobacion de tipos.
- Edicion y mantenimiento de contenido por parte de equipos no tecnicos: el CMS y editor visual incluidos en Intlayer permiten revisar y ajustar textos por locale sin tocar el codigo fuente.
- Despliegue de la landing de presentacion: el propio repositorio sirve ai.intlayer.org como sitio estatico en Docker y Nginx para demostraciones publicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable, por lo que no existen metricas del tipo MMLU, HumanEval o GSM8K que reportar.

## Requisitos de hardware

- No aplica inferencia de modelos: este repositorio solo requiere ejecutar un contenedor Docker con Nginx.
- Requisito unico indicado: Docker instalado en la maquina local.
- Despliegue: `docker build -t intlayer-ai -f ./Dockerfile .` seguido de `docker run --rm -p 8000:80 --name intlayer-ai-app intlayer-ai`, accesible en `http://localhost:8000`.
- Para las herramientas CLI del ecosistema Intlayer, el coste de computo recae en el proveedor de IA elegido (OpenAI, Anthropic, Mistral, Google Gemini u Ollama local); los requisitos de VRAM dependen del modelo de terceros seleccionado y no se detallan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede. Este repositorio no es un modelo y no tiene categoria comparable dentro del catalogo de HuggingFace. Alternativas funcionales en el ambito de la internacionalizacion asistida por IA serian frameworks como i18next, FormatJS o Lingui, pero la informacion disponible no incluye datos de rendimiento comparativo con ellos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; cualquier expectativa de pesos, inferencia local o fine-tuning no se corresponde con su contenido.
- La licencia no esta indicada en la informacion disponible, lo que impide confirmar las condiciones de uso comercial del repositorio o del framework.
- No se declaran idiomas soportados ni pipeline en la ficha de HuggingFace; los metadatos son minimos (unicamente la etiqueta `region:us`).
- Las fechas de creacion y actualizacion del repositorio (2026-10-01) resultan anomalas respecto a la fecha actual; conviene verificarlas antes de citarlas.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion.
- El rendimiento y la calidad de las traducciones dependen por completo del proveedor de IA externo configurado; Intlayer no aporta un modelo propio.
- Riesgo de errores de traduccion o de alucinacion en el contenido generado: al tratarse de generacion con modelos de terceros, los resultados deben revisarse antes de publicarse en produccion.
- El usuario propietario del repositorio en HuggingFace (`Intlayer`) difiere del usuario que aloja una copia equivalente (`aymericzip`), lo que puede generar confusion sobre cual es el canal oficial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Intlayer/intlayer
- Repositorio equivalente del autor: https://huggingface.co/aymericzip/intlayer
- Sitio de la landing: https://ai.intlayer.org
- Sitio oficial de Intlayer: https://intlayer.org
- Repositorio en GitHub: https://github.com/aymericzip/intlayer
- Paquete npm: https://www.npmjs.com/package/intlayer
- Documentacion de `intlayer fill`: https://intlayer.org/doc/concept/cli/fill
- Documentacion de `intlayer doc translate`: https://intlayer.org/doc/concept/cli/doc-translate
- Documentacion de `intlayer doc review`: https://intlayer.org/doc/concept/cli/doc-review
- Como funciona Intlayer: https://intlayer.org/doc/concept/how-works-intlayer
