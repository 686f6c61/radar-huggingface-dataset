# neko-legends/DeepSeek-V4.1-Flash-uncensored-engram-4x-spark

## Resumen

Este repositorio de Hugging Face no es un modelo completo, sino un artefacto auxiliar: las tablas Engram de DeepSeek-V4.1-Flash UNCENSORED ya empaquetadas y troceadas por rango para un despliegue de 4 nodos (TP=4). El autor, neko-legends, publica la salida del paso lento de `pack_engram.py` del kit de Mia AI Lab, de modo que el operador solo tiene que descargar, colocar los ficheros y arrancar, ahorrándose entre 7 y 10 minutos de empaquetado por nodo.

El modelo base lleva dos tablas de búsqueda gigantes que la arquitectura denomina Engram, situadas en las capas 1 y 14: unos 189 GiB de embeddings condicionados por n-gramas que el modelo consulta mediante hash en cada token, tanto en prefill como en decode. El checkpoint completo pesa 510 GB, de los cuales solo ~305 GiB son pesos en sentido estricto; las tablas son datos, nunca se cuantizan ni se computan, y por eso pueden residir en NVMe y leerse fila a fila con `OFFLOAD_MODE=nvme`.

La relevancia del artefacto es de despliegue: en un DGX Spark la memoria del host es la memoria unificada de la GPU (121,7 GiB por nodo), así que alojar 189 GiB de tablas en memoria gráfica hace inviable el servicio. Con las tablas en disco, una flota de 4 Sparks sirve el modelo completo y deja margen para contexto de hasta 1M de tokens. Los pesos provienen del checkpoint abliterado `dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de tablas Engram del modelo base DeepSeek-V4.1-Flash; tablas en capas 1 y 14) |
| Parametros totales | no disponible (el checkpoint completo reporta ~305 GiB de pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens segun la model card (capacidad de la flota de 4 nodos) |
| Tipos de cuantizacion | FP8 en el checkpoint base; las tablas Engram no se cuantizan en ningun caso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no incluye pesos; el artefacto son shards binarios `.bin` (tablas Engram) mas `manifest.json` y `SHA256SUMS` |
| Tamano del repositorio | 202,8 GB (192 GB de tablas Engram, 8 ficheros de 23,6 GiB) |
| Empaquetado | 2026-09-15, a partir del commit `79f656a` del kit |

## Arquitectura y entrenamiento

La innovacion que describe la model card es el subsistema Engram: dos tablas de búsqueda de gran tamano (capas 1 y 14) que almacenan embeddings condicionados por n-gramas y que el modelo consulta con una operacion de hash en cada token, tanto en prefill como en decodificacion. Conceptualmente no son matrices de pesos: son datos de solo lectura, nunca se cuantizan, no se trocean por forma tensorial y no se computan. El checkpoint completo ocupa 510 GB, con ~305 GiB de pesos, lo que situa a las tablas en el orden de 189 GiB.

El empaquetado reparte las filas de cada tabla por rango: cada uno de los 8 ficheros (`engram-l1-r{0..3}of4.bin` y `engram-l14-r{0..3}of4.bin`) contiene un rango contiguo de filas asignado a un rank concreto, de modo que cada nodo solo necesita sus dos ficheros (~48 GB). La procedencia es el checkpoint abliterado en FP8 de dealignai, emparejado con el kit de 4 Sparks de Mia AI Lab sobre SGLang con TP=4, EP=4 y rail RoCE. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

El autor advierte de una restriccion critica: estas tablas siguen el contenido de los pesos abliterados, por lo que no deben usarse con el checkpoint estandar de `deepseek-ai`; en ese caso hay que dejar que el kit empaquete las suyas con `./start.sh pack`. Para TP=3 u otros motores hay que reempaquetar con `pack_engram.py --tp N`.

## Capacidades

- Generacion de texto y razonamiento: la model card indica que el modo de razonamiento se activa correctamente en las pruebas de validacion.
- Tool calling: se validan 3/3 round-trips de herramientas y se reproduce 3/3 el caso de corrupcion de herramientas DSML.
- Salidas estructuradas: 30/30 salidas estructuradas correctas en temperaturas 0, 0,7 y 1,0.
- Contexto largo: prueba de aguja (needle) superada a 32k y 400k, con capacidad declarada de hasta 1M de tokens en la flota de 4 nodos.
- Modelo sin censura: al derivar de un checkpoint abliterado (`UNCENSORED-FP8`), se ha eliminado el alineamiento de seguridad del modelo original.
- Capacidades multimodales, de audio o de vision: no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Autohospedaje de un modelo frontera en instalaciones propias: una organizacion con 4 DGX Spark puede servir el modelo completo sin depender de APIs externas, manteniendo los datos en su propia infraestructura.
- Analisis de documentos muy largos: con contexto de hasta 1M de tokens, resulta adecuado para procesar contractuales, expedientes o bases de codigo completas en una sola pasada, sin troceado agresivo.
- Pipelines de agentes con tool calling: los round-trips de herramientas verificados permiten integrarlo en cadenas de razonamiento multi-paso que invocan APIs externas y devuelven resultados estructurados.
- Extraccion de datos estructurados a escala: las 30/30 salidas estructuradas en tres temperaturas lo hacen apto para generar JSON u otros formatos validables en procesos ETL.
- Investigacion sobre alineamiento y seguridad: al tratarse de una variante abliterada, sirve como objeto de estudio para comparar comportamiento con y sin alineamiento, y para probar tecnicas de red-teaming.
- Recuperacion aumentada sobre corpus propios: combinando la ventana larga con busquedas por hash n-grama, encaja en sistemas RAG donde el contexto recuperado es masivo y no cabe en modelos de ventana corta.
- Despliegue interno con razonamiento explicito: el modo de razonamiento activable permite usarlo en tareas de analisis donde se necesita trazar el proceso, como diagnostico tecnico o revision de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si reporta una bateria de puertas de validacion operativa previas al servicio:

| Prueba | Resultado |
|---|---|
| Reproduccion de corrupcion de herramientas DSML | 3/3 |
| Salidas estructuradas (temp 0 / 0,7 / 1,0) | 30/30 |
| Round-trip de herramientas | 3/3 |
| Activacion del modo de razonamiento | correcto (sin cifra) |
| Needle de contexto a 32k | superado |
| Needle de contexto a 400k | superado |

Estos datos corresponden al entorno de origen de los shards, no a una evaluacion independiente del repositorio publicado.

## Requisitos de hardware

- Despliegue de referencia: 4 nodos DGX Spark en TP=4, EP=4, con rail RoCE, segun el kit de Mia AI Lab.
- Memoria por nodo: 121,7 GiB de memoria unificada en cada DGX Spark; host y GPU comparten el mismo espacio.
- Almacenamiento por nodo: cada rank necesita unicamente sus dos ficheros Engram (~48 GB) residentes en NVMe.
- Checkpoint base: ~510 GB completos, de los cuales ~305 GiB son pesos.
- Modo de offload obligatorio: `OFFLOAD_MODE=nvme` con el row-store de Engram del kit; sin el, 189 GiB de tablas en memoria grafica impiden que quepa nada.
- Variables de despliegue: `ENGRAM_DIR` (head) y `WORKER_ENGRAM_DIR` (workers), `DSV41_PACKED_DIR=/engram`, `SKIP_PREPARE=1`.
- Motor de inferencia: SGLang a traves del kit de 4 Sparks. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan contempladas en la informacion disponible.
- GPU de consumo: no aplicable; el modelo completo no cabe en una GPU de consumo ni en una estacion de trabajo convencional.
- Latencia y throughput: no disponible.
- Generacion de los shards: entre 7 y 10 minutos por nodo si se reempaquetan desde el checkpoint.

## Comparativa con modelos similares

| Aspecto | Este artefacto | `dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8` | Checkpoint estandar `deepseek-ai` |
|---|---|---|---|
| Contenido | Tablas Engram empaquetadas por rank | Modelo completo abliterado en FP8 | Modelo completo original |
| Uso previsto | Despliegue 4x DGX Spark, TP=4 | Fuente para empaquetado | Despliegue estandar |
| Compatibilidad de tablas | Solo con el checkpoint abliterado | N/A | Requiere empaquetar sus propias tablas |
| Licencia | MIT | no disponible | no disponible |
| Contexto | Hasta 1M tokens en la flota | no disponible | no disponible |
| Parametros y benchmarks | no disponible | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: el alineamiento de seguridad del modelo original ha sido eliminado, por lo que puede producir contenido danino, ilicito o inseguro sin las salvaguardas habituales. Su uso en produccion orientada al publico requiere capas de moderacion externas.
- Compatibilidad estricta: los shards solo son validos con el checkpoint abliterado FP8 de dealignai. Usarlos con el checkpoint estandar de `deepseek-ai` produce resultados incorrectos; en ese caso hay que reempaquetar.
- Dependencia de hardware especifico: el artefacto esta pensado para 4x DGX Spark con TP=4 y el kit de Mia AI Lab. Con TP=3 u otros motores hay que reempaquetar.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no hay evaluaciones independientes publicadas.
- Riesgo de alucinacion: inherente a los modelos generativos de gran tamano; no se han publicado tasas de error en la informacion disponible.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento homogeneo fuera del ingles.
- Restricciones de licencia: el artefacto declara MIT, pero la licencia del modelo base y del checkpoint abliterado del que derivan las tablas no se especifica, lo que puede condicionar el uso comercial.
- Empaquetado propietario: los ficheros son shards binarios con `manifest.json` y `SHA256SUMS`; conviene verificar el hash antes de desplegar.
- Fecha de publicacion futura en los metadatos (16 de septiembre de 2026), lo que dificulta contrastar la informacion con fuentes externas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neko-legends/DeepSeek-V4.1-Flash-uncensored-engram-4x-spark
- Checkpoint de origen (abliterado, FP8): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Kit de 4x DGX Spark (SGLang, TP=4, EP=4): https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-DGX-Sparks
- Repositorio de validacion y notas operativas del autor: https://github.com/neko-legends/spark-bench
- La busqueda web realizada no devolvio enlaces relevantes adicionales sobre este artefacto.
