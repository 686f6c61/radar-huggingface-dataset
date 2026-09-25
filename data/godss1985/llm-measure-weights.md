# godss1985/llm-measure-weights

## Resumen

Este repositorio de HuggingFace no es un modelo individual, sino un archivo de replicacion que contiene los pesos exactos de diez modelos distintos tal y como fueron servidos por Ollama 0.24.0 en los experimentos del articulo "Reproducible LLM-Based Measurement Depends on the Serving Stack". Lo publica el usuario godss1985 y su proposito no es ofrecer un modelo entrenado nuevo, sino garantizar que los resultados de medicion de un articulo academico puedan reproducirse byte a byte: cada carpeta incluye el manifiesto de Ollama sin modificar y todos los blobs que ese manifiesto referencia.

El repositorio ocupa 138,8 GB y agrupa modelos de entre 0,8 B y 35 B parametros de familias diversas: qwen3.5 (0.8b, 9b, 35b), qwen3.6 (27b), gemma4 (31b), granite4.1 (8b y 30b), nemotron-3-nano (30b), ministral-3 (14b) y gpt-oss (20b). Todos se distribuyen en formato GGUF, mayoritariamente en cuantizacion Q4_K_M, salvo qwen3.5:0.8b en Q8_0 y gpt-oss:20b en MXFP4. No se documentan arquitecturas, contextos maximos ni idiomas de cada modelo en la model card; esa informacion remite a los repositorios upstream de cada familia.

Su relevancia es metodologica: incide en que la reproducibilidad de mediciones con LLM depende de la pila de servicio (version de Ollama, cuantizacion, plantilla de prompt, parametros de muestreo) y no solo del modelo. Al fijar los artefactos exactos y sus hashes SHA-256, el archivo permite auditar y repetir experimentos, algo poco habitual en repositorios de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (archivo agregado de 10 modelos de familias distintas; el repositorio no define una arquitectura propia) |
| Parametros totales | 10 modelos independientes, de 0,8 B a 35 B cada uno; no se publica el total agregado |
| Parametros activos | no disponible (no se documenta si alguno de los modelos incluidos es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion principal del articulo (parametro de servicio, no necesariamente el maximo del modelo) |
| Tipos de cuantizacion | Q8_0 (qwen3.5:0.8b), Q4_K_M (resto de modelos), MXFP4 (gpt-oss:20b) |
| Idiomas soportados | no disponible (no documentado en la model card) |
| Licencia | mixed: nueve modelos bajo Apache-2.0 y nemotron-3-nano:30b bajo NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF dentro de estructura Ollama: manifiesto + blobs almacenados como `blobs/sha256-<hex>` |

## Contenido del archivo

| Carpeta | Modelo Ollama | Formato de pesos | Licencia |
|---|---|---|---|
| `qwen3.5-0.8b` | `qwen3.5:0.8b` | Q8_0 GGUF | Apache-2.0 |
| `qwen3.5-9b` | `qwen3.5:9b` | Q4_K_M GGUF | Apache-2.0 |
| `qwen3.5-35b` | `qwen3.5:35b` | Q4_K_M GGUF | Apache-2.0 |
| `qwen3.6-27b` | `qwen3.6:27b` | Q4_K_M GGUF | Apache-2.0 |
| `gemma4-31b` | `gemma4:31b` | Q4_K_M GGUF | Apache-2.0 |
| `granite4.1-8b` | `granite4.1:8b` | Q4_K_M GGUF | Apache-2.0 |
| `granite4.1-30b` | `granite4.1:30b` | Q4_K_M GGUF | Apache-2.0 |
| `nemotron-3-nano-30b` | `nemotron-3-nano:30b` | Q4_K_M GGUF | NVIDIA Nemotron Open Model License |
| `ministral-3-14b` | `ministral-3:14b` | Q4_K_M GGUF | Apache-2.0 |
| `gpt-oss-20b` | `gpt-oss:20b` | MXFP4 GGUF | Apache-2.0 |

## Arquitectura y entrenamiento

El repositorio no aporta informacion sobre arquitecturas, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO u otros) de ninguno de los diez modelos. Se trata de una redistribucion no modificada de artefactos ya entrenados por terceros: los pesos se copian tal cual los distribuye el registro de Ollama, junto con el texto de licencia que Ollama acompania a cada modelo como blob de tipo `application/vnd.ollama.image.license`.

La unica innovacion tecnica atribuible al propio repositorio es el mecanismo de verificacion: el SHA-256 de cada fichero `manifest` coincide con el digest del modelo registrado en cada llamada del archivo de replicacion y con el que aparece en el apendice en linea del articulo. Ademas, cada blob se almacena bajo su propio SHA-256 (`blobs/sha256-<hex>`), de modo que basta con hashear un blob y compararlo con su nombre de fichero para verificar su integridad. Los ajustes de servicio documentados como referencia principal son temperatura 0, top_p 1, top_k 1, semilla 42, contexto de 32.768 tokens y un limite de salida de 512 tokens, salvo que el archivo indique otra cosa para un modelo concreto.

## Capacidades

- Almacenamiento y distribucion reproducible de pesos: el repositorio contiene los ficheros exactos de diez modelos y su manifiesto de Ollama, lo que permite reconstruir el entorno de inferencia original.
- Verificacion criptografica de integridad mediante SHA-256 por manifiesto y por blob.
- Ejecucion en Ollama: copiando el manifiesto a `~/.ollama/models/manifests/registry.ollama.ai/library/<nombre>/<etiqueta>` y los blobs a `~/.ollama/models/blobs/`, se puede lanzar con `ollama run <nombre>:<etiqueta>`.
- Redistribucion con licencias preservadas: se incluye el texto de licencia upstream de cada modelo sin modificaciones, incluida la licencia propietaria de NVIDIA para nemotron-3-nano:30b.
- Capacidades de inferencia de los modelos individuales: no disponibles en la informacion proporcionada. Deben consultarse en las model cards de cada familia upstream (Qwen, Gemma, Granite, Nemotron, Ministral, gpt-oss).
- Soporte de tool calling, agentes, vision, audio, modo thinking o capacidades multilingues: no disponible para ningun modelo del archivo en la documentacion aportada.

## Casos de uso

- Reproduccion de experimentos academicos: un investigador que quiera replicar los resultados del articulo puede descargar este archivo, verificar los hashes y ejecutar exactamente los mismos pesos con la misma version de Ollama (0.24.0) y los mismos parametros de muestreo, eliminando la variabilidad introducida por el registro de modelos.
- Auditoria de pipelines de evaluacion: al fijar manifiesto, blobs, cuantizacion y configuracion de servicio, el archivo permite separar la varianza atribuible al modelo de la atribuible a la pila de servicio, que es precisamente la tesis del articulo.
- Despliegue en entornos sin conexion (air-gapped): los blobs pueden copiarse manualmente a una maquina sin acceso a Internet y servirse con Ollama, util en laboratorios con requisitos de aislamiento de red.
- Preservacion a largo plazo de artefactos: los repositorios de modelos pueden retirarse o actualizarse sin aviso; conservar los blobs con su hash permite reconstruir un experimento publicado anos despues y detectar cualquier alteracion.
- Pruebas de regresion de una pila de servicio: sirve para comparar el comportamiento de una misma version de pesos frente a distintas versiones de Ollama o distintos backends, midiendo el efecto sobre las respuestas con configuracion fija (temperatura 0, semilla 42).
- Comparacion entre cuantizaciones: el archivo incluye qwen3.5:0.8b en Q8_0 y modelos mayores en Q4_K_M, lo que permite estudiar como afecta la cuantizacion a las mediciones cuando el resto de condiciones se mantiene constante.
- Cumplimiento de licencias en entornos corporativos: al incluir el texto de licencia de cada modelo, un equipo legal puede revisar rapidamente cuales son Apache-2.0 y cuales tienen condiciones adicionales (el caso de nemotron-3-nano:30b) antes de desplegarlos.
- Docencia sobre medicion con LLM: el material permite demostrar en clase que dos ejecuciones aparentemente identicas pueden diferir si cambia la pila de servicio, usando artefactos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se aportan datos de latencia o throughput. El articulo referenciado, "Reproducible LLM-Based Measurement Depends on the Serving Stack", podria contener mediciones, pero no se ha proporcionado su contenido ni un enlace al mismo.

## Requisitos de hardware

- Tamano total del repositorio: 138,8 GB, por lo que la descarga y el almacenamiento requieren ese espacio libre como minimo.
- VRAM por modelo (estimacion aproximada derivada del tipo de cuantizacion, no confirmada por el autor): Q8_0 a ~1,06 bytes por parametro situa qwen3.5:0.8b en torno a 0,9 GB; Q4_K_M a ~0,6 bytes por parametro situa qwen3.5:9b, granite4.1:8b y ministral-3:14b en el rango de 5 a 9 GB; qwen3.6:27b, granite4.1:30b y nemotron-3-nano:30b en torno a 17-19 GB; gemma4:31b y qwen3.5:35b en torno a 19-22 GB; gpt-oss:20b en MXFP4 en torno a 12 GB. A estas cifras hay que sumar la cache KV correspondiente a 32.768 tokens de contexto.
- GPU recomendadas: no disponible. El autor no especifica hardware. Como referencia general, los modelos de 8-14 B en Q4_K_M caben en GPU de consumo con 12-16 GB de VRAM; los de 27-35 B en Q4_K_M requieren aproximadamente 20-24 GB y por tanto GPU de gama profesional o de consumo de gama alta con suficiente VRAM.
- Compatibilidad con GPU de consumo: probable para los modelos de 0,8 B a 14 B; ajustada o inviable para los de 27-35 B segun la VRAM disponible. No hay confirmacion por parte del autor.
- Opciones de despliegue: Ollama 0.24.0 es el metodo documentado y el unico con garantias de reproducibilidad exacta. Al tratarse de ficheros GGUF, son teoricamente utilizables con llama.cpp y otros motores compatibles, pero el autor no lo documenta y hacerlo romperia las condiciones de replicacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existe un equivalente directo: este repositorio no es un modelo, sino un archivo de replicacion. La comparacion relevante es entre formas de obtener los mismos pesos.

| Criterio | Este archivo | Registro de Ollama | Repositorios upstream |
|---|---|---|---|
| Contenido | Manifiesto y blobs exactos de 10 modelos | Manifiesto y blobs, version mutable | Pesos originales del autor del modelo |
| Verificacion | SHA-256 por manifiesto y por blob, documentado | Digest del manifiesto, sin garantia de persistencia | Hashes variables segun el repositorio |
| Persistencia | Fijada al momento de publicacion del articulo | Sujeta a actualizaciones o retirada | Sujeta a actualizaciones o retirada |
| Cuantizacion | Fija (Q8_0, Q4_K_M, MXFP4) | Multiples etiquetas disponibles | Habitualmente safetensors en precision completa |
| Facilidad de uso | Requiere copia manual de manifiesto y blobs | `ollama pull` | Requiere conversion a GGUF para Ollama |
| Licencia | Mixta, con textos incluidos | Segun modelo | Segun modelo |

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: no debe presentarse como una aportacion de modelado, sino como un archivo de artefactos de terceros.
- La model card no documenta arquitectura, contexto maximo, idiomas, capacidades ni benchmarks de ninguno de los diez modelos; toda esa informacion debe obtenerse de los repositorios upstream.
- Licencia mixta: nueve modelos son Apache-2.0, pero nemotron-3-nano:30b se distribuye bajo la NVIDIA Nemotron Open Model License, con condiciones propias que hay que revisar antes de cualquier uso comercial.
- Los pesos se redistribuyen sin modificar; el autor del repositorio no ofrece garantias sobre ellos ni asume responsabilidad por su uso.
- La reproducibilidad exacta depende de mantener Ollama en la version 0.24.0. Cambiar de version o de motor de inferencia invalida la premisa del archivo, que es precisamente que la pila de servicio afecta a las mediciones.
- Los parametros de muestreo documentados (temperatura 0, top_p 1, top_k 1, semilla 42) son los del articulo; reproducir con otros valores da lugar a resultados no comparables.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en este repositorio. Al no haber benchmarks publicados, no es posible cuantificarlos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- El tamano de 138,8 GB implica costes considerables de ancho de banda y almacenamiento para quien quiera replicar el archivo completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/godss1985/llm-measure-weights
- Articulo citado por el autor: "Reproducible LLM-Based Measurement Depends on the Serving Stack" (no se proporciona URL ni DOI en la informacion disponible)
- Ollama: https://ollama.com
- Enlaces de contexto encontrados en la busqueda web (relevancia general, no especificos de este repositorio):
  - https://www.articsledge.com/post/model-weights
  - https://benchlm.ai/
  - https://explainx.ai/llms
  - https://www.artificialintelligenceschool.com/blog/understanding-weights-in-large-language-models
  - https://www.webopedia.com/technology/llm-tokens-weights-parameters/
