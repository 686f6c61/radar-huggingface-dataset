# runmyai/tokenwing-files

## Resumen

`runmyai/tokenwing-files` no es un modelo de lenguaje, sino un repositorio de artefactos binarios que da soporte a las releases del motor TokenWing desarrollado por Run My AI. Cada fichero del repositorio corresponde a un binario de una release del motor, almacenado bajo una ruta `sha256/<hash>` y nombrado por su propio hash SHA-256. La aplicacion Run My AI consulta el fichero `engine-files.json` de cada release en GitHub (cubierto por el manifiesto firmado `SHA256SUMS`) para decidir que descargar y evitar bajar de nuevo los binarios que no han cambiado entre versiones.

Por tanto, el repositorio funciona como una CDN de contenido direccionable por hash para el actualizador del motor, no como un contenedor de pesos. No publica arquitectura, parametros, tokenizador ni configuracion de inferencia, y la model card remite explicitamente a la pagina de releases de GitHub para descargar TokenWing. Es relevante ahora unicamente para quien necesite auditar o replicar el mecanismo de distribucion de binarios del ecosistema Run My AI, no para evaluar capacidades de IA.

Cualquier uso previsto como modelo de lenguaje, embeddings o vision queda fuera del alcance de este repositorio: no contiene pesos en formato safetensors, GGUF ni equivalente, y no se ha publicado ninguna ficha tecnica asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de binarios del motor TokenWing, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (ficheros binarios del motor nombrados por SHA-256) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni documenta datos de entrenamiento, RLHF, DPO ni innovaciones de atencion. Su estructura es un almacen de ficheros planos organizados por hash: cada entrada vive en `sha256/<hash>` y el nombre del fichero coincide con su SHA-256, lo que permite verificar integridad de extremo a extremo y cachear por contenido.

El mecanismo de distribucion se apoya en un manifiesto `engine-files.json` publicado en cada release de GitHub del motor TokenWing, protegido por el fichero firmado `SHA256SUMS`. La aplicacion Run My AI lee ese manifiesto, compara con los ficheros ya presentes en local y descarga solo los que faltan, de modo que una actualizacion del motor omite todo lo que no ha cambiado. Este patron es equivalente a un update diferencial por contenido direccionable.

## Capacidades

- Distribucion de binarios del motor TokenWing con verificacion criptografica por SHA-256.
- Actualizacion diferencial: solo se descargan los ficheros ausentes en la instalacion local.
- Integracion con el manifiesto `engine-files.json` de cada release de GitHub.
- Verificacion de integridad mediante el manifiesto firmado `SHA256SUMS`.
- Alojamiento de una release por version del motor, con un fichero por binario.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Actualizacion del motor TokenWing en produccion: la aplicacion Run My AI consulta `engine-files.json`, calcula el delta frente a los ficheros locales y descarga solo los binarios nuevos desde `sha256/<hash>`, reduciendo el ancho de banda de cada actualizacion.
- Verificacion de integridad en pipelines de despliegue: un paso de CI puede recalcular el SHA-256 de cada binario descargado y compararlo con el nombre del fichero y con `SHA256SUMS` antes de instalar el motor.
- Espejo interno o air-gapped: una organizacion puede replicar el repositorio en su propia infraestructura y servir los binarios por hash sin depender de Hugging Face, manteniendo la misma logica de cache.
- Auditoria de releases: al estar cada binario nombrado por su hash, es posible trazar que fichero exacto se instalo en cada version del motor y detectar cambios no esperados entre releases.
- Cache compartida entre equipos: un proxy o almacen interno puede cachear por SHA-256 y servir el mismo binario a multiples instalaciones sin duplicar descargas.
- Automatizacion de empaquetado: scripts de build pueden resolver las dependencias de una release leyendo `engine-files.json` y descargando los binarios correspondientes de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el repositorio no contiene pesos de un modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica en el sentido de servidores de inferencia (vLLM, llama.cpp, Ollama, TGI); el consumo previsto es mediante la aplicacion Run My AI y el motor TokenWing distribuido en las releases de GitHub.
- Latencia y throughput: no disponibles; dependen del motor TokenWing, no de este repositorio.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| runmyai/tokenwing-files | Binarios del motor TokenWing | no aplica | no aplica | MIT | Hugging Face + GitHub releases |
| Modelos de lenguaje open source (p. ej. familias Llama, Qwen, Mistral) | Pesos de modelo | variable | variable | variable | Hugging Face |
| Repositorios de artefactos de build (p. ej. releases de GitHub, registros OCI) | Binarios y manifiestos | no aplica | no aplica | variable | GitHub, registros de contenedores |

No se dispone de una comparativa con modelos comparables porque este repositorio no es un modelo; las alternativas reales son otros canales de distribucion de binarios, no modelos de IA.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal.
- No se publican especificaciones de arquitectura, parametros, contexto ni idiomas; cualquier expectativa en ese sentido carece de base documental.
- La licencia MIT cubre el repositorio, pero el uso comercial del motor TokenWing y de la aplicacion Run My AI debe verificarse en sus respectivos repositorios de GitHub.
- La integridad depende de que el consumidor valide `SHA256SUMS` y los nombres por hash; omitir esa verificacion elimina la garantia de cadena de confianza.
- El repositorio no incluye el manifiesto `engine-files.json`; este vive en las releases de GitHub, por lo que sin acceso a GitHub la resolucion de dependencias falla.
- No hay garantia de disponibilidad ni de retencion de versiones antiguas en Hugging Face; conviene replicar los binarios necesarios en infraestructura propia.
- No se han publicado resultados de benchmarks, evaluaciones de sesgo ni auditorias de seguridad en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/runmyai/tokenwing-files
- Motor TokenWing en GitHub: https://github.com/runmyai/tokenwing
- Releases de TokenWing: https://github.com/runmyai/tokenwing/releases
- Aplicacion Run My AI: https://github.com/runmyai/run-my-ai
