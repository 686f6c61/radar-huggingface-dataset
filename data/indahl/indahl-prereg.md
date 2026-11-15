# indahl/indahl-prereg

## Resumen

`indahl-prereg` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC bajo el identificador `indahl/indahl-prereg` en Hugging Face. Su funcion es permitir la preregistracion de analisis: sella los ficheros de un plan en git, recupera el registro de push del proveedor de git y comprueba que el plan se ejecuto antes del primer run, ademas de listar los ficheros que se ejecutaron fuera de lo previsto. El objetivo es demostrar precedencia temporal de un plan sin depender de cadenas de sellado de tiempo externas.

El plugin se distribuye como un artefacto sin codigo ejecutable: los comandos descargan cada script desde el repositorio publico `github.com/Heuremen-LLC/indahl.ai` en un commit fijado y solo lo ejecutan si el sha256 coincide con el valor embebido en el comando. Requiere Python 3.9 o superior y git, y contacta unicamente con la API REST de GitHub para leer actividad publica del repositorio indicado.

Por su naturaleza, esta ficha no puede seguir el esquema habitual de especificaciones de un modelo de IA (parametros, contexto, cuantizacion, benchmarks). Se documentan a continuacion las caracteristicas reales del artefacto y se marcan como "no disponible" los campos que no aplican o no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (plugin de Claude Code, no es un modelo neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la model card esta en ingles; no se declaran idiomas) |
| Licencia | MIT |
| Formato de pesos | no aplica; el artefacto contiene instrucciones de comando y referencias a scripts Python remotos (sha256 fijado) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el artefacto es un plugin que expone comandos de Claude Code (`/prereg` con subcomandos `seal`, `witness`, `check`, `verify` y `cover`). La logica de cada comando reside en un script Python (`prereg.py`) alojado en el repositorio publico de Heuremen LLC, referenciado por commit fijo (`744bcd22548a29dcdc5a261477faccaeebc6938d`) y protegido por verificacion de hash sha256 (`c0b541c68b4045fe6e0e2bc85e51ed055d4a5bcc223e78b79ff1d41906db904d`). La copia alojada en Hugging Face no incluye el ejecutable; la version del marketplace propio del autor si lo empaqueta.

El mecanismo tecnico se apoya en dos fuentes de evidencia: el sello de los ficheros del plan en git y el registro de push del proveedor de git, leido despues del push. La comprobacion (`check`) contrasta el plan sellado con un fichero de ejecucion (`RUN.json`) y enumera los ficheros que se ejecutaron sin estar cubiertos por el plan. Segun la model card, el plugin fue revisado antes de su publicacion por una revisora externa ("Sage") el 13 de noviembre de 2026, aplicandose todas las correcciones antes del lanzamiento.

## Capacidades

- Sellado (`seal`) de ficheros de plan en git, con confirmacion previa de Claude antes de hacer commit.
- Obtencion del registro de push del proveedor de git (`witness`) tras el push.
- Verificacion de un sello (`verify`).
- Comprobacion de cobertura (`cover`) de un run respecto al plan, listando ficheros ejecutados fuera del plan.
- Comprobacion combinada plan-run (`check SEAL --wrapper RUN.json`).
- Preregistro de analisis y demostracion de que un plan precedio a la ejecucion.
- Integracion como plugin de Claude Code mediante marketplace (`/plugin marketplace add Heuremen-LLC/indahl.ai`).
- Sin capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling propias: depende del agente Claude Code que lo invoca.

## Casos de uso

- Preregistro de analisis cientifico: sellar `PLAN.md` y `analysis.py` antes de ejecutar el pipeline, de modo que el registro de push de GitHub demuestre que el plan existia antes del primer run.
- Auditoria de reproducibilidad: usar `check` contra `RUN.json` para identificar scripts que se ejecutaron sin estar contemplados en el plan aprobado.
- Revision interna de proyectos de investigacion: `cover` permite a un revisor ver rapidamente el desvio entre lo planificado y lo ejecutado.
- Cumplimiento en entornos regulados: el sello y el registro de push actuan como evidencia ligera de precedencia temporal sin depender de autoridades de sellado externas.
- Integracion en flujos de Claude Code: invocar `/prereg seal` dentro de una sesion de agente para registrar decisiones de analisis antes de lanzar experimentos.
- Verificacion de integridad de scripts: el mecanismo de descarga con commit fijado y sha256 permite comprobar que el script ejecutado coincide con el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un plugin con scripts Python.
- Requisitos declarados: Python 3.9 o superior y git.
- Dependencia de red: acceso a `api.github.com` y a `raw.githubusercontent.com` para descargar y verificar los scripts.
- Despliegue: instalacion via marketplace de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-prereg@heuremen`).
- Latencia y throughput: no disponibles.
- No cabe hablar de ejecucion en consumer GPU, vLLM, llama.cpp, Ollama ni TGI: no aplica.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de la misma categoria (plugins de preregistro para Claude Code) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni responde consultas; cualquier expectativa en ese sentido es incorrecta.
- La copia de Hugging Face no incluye el ejecutable; depende de la disponibilidad del repositorio de GitHub y de la red para descargar los scripts.
- La garantia de integridad se limita al hash sha256 embebido en el comando y al commit fijado; si el repositorio remoto desaparece, el plugin deja de funcionar.
- La evidencia de precedencia depende del registro de push del proveedor de git, no de una cadena de sellado de tiempo independiente; un proveedor comprometido o una reescritura de historial podrian afectar a la garantia.
- Contacta con la API REST de GitHub; no se envia token salvo que el usuario lo configure. No se declara tratamiento de datos personales ni almacenamiento en servidores.
- La model card esta en ingles y no se declaran idiomas soportados; no hay datos de sesgos, alucinacion ni restricciones de uso comercial mas alla de la licencia MIT.
- Uso comercial permitido por la licencia MIT, pero sin garantias explicitas del autor sobre idoneidad para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-prereg
- Repositorio fuente (plugin): https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/plugins/prereg
- Mirror del repositorio: https://github.com/Heuremen-LLC/indahl-prereg (commit 4c73134)
- Script remoto referenciado: https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/744bcd22548a29dcdc5a261477faccaeebc6938d/claude-plugins/plugins/prereg/scripts/prereg.py
- Politica de privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai
