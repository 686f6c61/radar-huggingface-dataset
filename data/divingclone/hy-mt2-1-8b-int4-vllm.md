# divingclone/Hy-MT2-1.8B-INT4-vLLM

## Resumen

Hy-MT2-1.8B-INT4-vLLM es un checkpoint cuantizado a 4 bits del modelo de traduccion Tencent Hy-MT2-1.8B, publicado por el usuario divingclone como parte del proyecto Hy-MT2 Windows. Se trata de una cuantizacion GPTQ INT4 W4A16 (grupo simetrico de tamano 128, kernels Marlin) sobre la arquitectura densa `hunyuan_v1_dense`, con 1.791.080.448 parametros totales y un checkpoint de 1.300.648.141 bytes. Los embeddings y la cabeza de salida se conservan en BF16, y la cache KV por defecto del proyecto es INT8 por token y cabeza, un ajuste de runtime independiente de la cuantizacion de los pesos.

El interes practico del modelo es que permite ejecutar un traductor de 1,8 B en GPUs de consumo dentro del ecosistema vLLM sobre Windows, con descarga publica y verificacion por SHA-256, sin necesidad de extraer archivos ZIP. Existe un repositorio hermano equivalente en NVFP4 W4A4 orientado al perfil rapido de RTX 50.

Es un proyecto independiente de cuantizacion, no un lanzamiento oficial de Tencent. La licencia original Apache-2.0 se conserva y las modificaciones se documentan en `MODEL_CHANGES.md`. En el momento de redactar esta ficha, el repositorio no registra descargas ni likes, por lo que no hay validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.791.080.448 (1,8 B) |
| Parametros activos | no aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ INT4 W4A16, grupo simetrico de tamano 128 (Marlin); embeddings y output head en BF16; cache KV INT8 por token/cabeza como ajuste de runtime |
| Idiomas soportados | no disponible (el pipeline declarado es `translation`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (no hay GGUF) |
| Tamano del checkpoint | 1.300.648.141 bytes (INT4); repositorio completo, 1,3 GB |
| Modelo base | tencent/Hy-MT2-1.8B, revision 9a341cd1b679d3efd23b46e847b01745a71ed792 |
| Tarea declarada | translation |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base, `hunyuan_v1_dense`, una red transformer densa de 1,8 B de parametros con embeddings atados (tied embedding/output-head). No se trata de un modelo MoE ni de una arquitectura hibrida SSM: no hay parametros activos distintos de los totales. Sobre esta base, el autor aplica una cuantizacion GPTQ de 4 bits con pesos W4A16 y grupo simetrico de 128, ejecutable con kernels Marlin, manteniendo en BF16 las capas atadas de embedding y cabeza de salida, que suelen ser las mas sensibles a la cuantizacion.

La calibracion se realizo con 256 ejemplos de traduccion procedentes de OPUS, disjuntos del conjunto de evaluacion de 256 ejemplos. El repositorio incluye `quantization.json` con las versiones de las herramientas, los hashes de calibracion y los hashes de los pesos de origen y de salida, ademas de `checksums.json` con los hashes de los ficheros. El autor indica que la evaluacion del checkpoint INT4 reutilizo resultados previos de BF16 y NVFP4, por lo que no constituye un experimento aislado centrado unicamente en este cuantizador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. Tampoco hay datos publicados sobre innovaciones de decodificacion (especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Traduccion automatica: es la tarea declarada en el pipeline del repositorio (`translation`) y para la que se calibro la cuantizacion.
- Uso conversacional segun la plantilla del modelo base: el repositorio incluye tokenizer y chat template en la raiz, por lo que puede invocarse con el formato de chat definido por Hy-MT2.
- Servicio de inferencia con vLLM: el checkpoint esta preparado para el runtime vLLM con el plugin nativo de Hunyuan del proyecto.
- Compatibilidad de perfiles de GPU: el checkpoint INT4 esta pensado para el perfil de compatibilidad RTX 30/40 (kernels Marlin) y tambien puede usarse en RTX 50.
- Capacidades multilingues: no disponible; no se documenta el listado de idiomas del modelo base ni del checkpoint.
- Tool calling / function calling: no disponible; no hay informacion al respecto.
- Agentes y razonamiento multi-paso: no disponible; no hay informacion al respecto.
- Vision, audio o modo de razonamiento explicito: no disponible; no hay informacion al respecto.

## Casos de uso

- Traduccion local en escritorio Windows: el checkpoint es el artefacto que consume la aplicacion Hy-MT2 Windows, que descarga los ficheros de un commit fijado y verifica tamano y SHA-256. Es adecuado porque evita cualquier dependencia de servicios en la nube y funciona con el runtime vLLM nativo del proyecto.
- Traduccion por lotes de documentacion tecnica: con vLLM se pueden procesar grandes volumenes de cadenas en paralelo sobre una unica GPU; el checkpoint de 1,3 GB deja margen de VRAM para lotes amplios y cache KV INT8.
- Localizacion integrada en CI/CD: el modelo puede exponerse como servicio de traduccion y consumirse desde un paso de pipeline que genere ficheros de recursos localizados antes de un despliegue, siempre que el paso de validacion humano revise la salida.
- Subtitulado y traduccion near-real-time: al caber en GPUs de consumo, puede desplegarse en una estacion de trabajo junto a la captura de audio y traducir segmentos cortos de forma continua.
- Traduccion en entornos aislados o sin conectividad: sectores con requisitos de confidencialidad (legal, sanitario, defensa) pueden ejecutar el modelo en hardware propio sin enviar texto a terceros.
- Servicio de traduccion autoalojado con API compatible: vLLM expone un servidor con API compatible con OpenAI, de modo que el modelo puede sustituir a un proveedor externo manteniendo el mismo contrato de cliente, sujeto a la validacion de calidad en el dominio concreto.
- Comparacion de cuantizaciones en un banco de pruebas: los repositorios INT4 y NVFP4 comparten base y metodologia de evaluacion, por lo que sirven para medir el impacto de la precision en el mismo modelo con hardware distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; ademas, el pipeline declarado es traduccion, por lo que esas metricas no serian representativas de su tarea.

El unico dato numerico publicado es una similitud respecto a la salida del profesor BF16 sin cuantizar, medida con chrF++ sobre el conjunto de evaluacion de 256 ejemplos:

| Variante | Cache KV | chrF++ frente a la salida BF16 (profesor) |
|---|---|---|
| GPTQ INT4 W4A16 (este repositorio) | INT8 | 84,97 |
| NVFP4 W4A4 (repositorio hermano) | INT8 | 79,60 |

El autor advierte explicitamente de que estas cifras son puntuaciones de similitud con la salida del profesor, no porcentajes de calidad de traduccion retenida, y que varias traducciones distintas pueden ser validas. La evaluacion del INT4 reutilizo resultados previos de BF16/NVFP4, por lo que no es un experimento aislado del cuantizador.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1.300.648.141 bytes (aproximadamente 1,21 GiB) y los parametros estan a 4 bits salvo embeddings y cabeza de salida en BF16. Como estimacion orientativa, el modelo requiere del orden de 2 a 3 GB de VRAM para pesos y overhead de runtime, mas la memoria de la cache KV INT8, que escala con la longitud de contexto y el tamano de lote. Estas cifras son estimaciones derivadas del tamano del checkpoint, no mediciones publicadas.
- GPU validadas: RTX 5090 es la unica GPU probada explicitamente por el autor.
- GPU soportadas sin validacion: RTX 30 y RTX 40, por soporte de arquitectura de runtime y kernels, pero el propio autor indica que aun requieren validacion en hardware.
- GPU no soportadas por el runtime empaquetado: GTX 10, GTX 16 y RTX 20.
- Caber en GPU de consumo: si, el checkpoint esta disenado para ello, pero con la restriccion de compatibilidad del runtime (RTX 30/40/50 en Windows).
- Opciones de despliegue: vLLM mediante el runtime SystemPanic/vllm-windows 0.29.0 con PyTorch 2.11.0+cu130 y el plugin nativo de Hunyuan del proyecto. Al ser safetensors de `compressed-tensors` y no GGUF, no es cargable directamente en llama.cpp, Ollama u otros runners basados en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Dentro de la propia familia, la comparacion directa es la siguiente:

| Modelo | Precision | Formato | Bytes del checkpoint | GPU objetivo | chrF++ vs profesor |
|---|---|---|---|---|---|
| tencent/Hy-MT2-1.8B | BF16 | safetensors | no disponible | no disponible | referencia (profesor) |
| divingclone/Hy-MT2-1.8B-INT4-vLLM | GPTQ INT4 W4A16, grupo 128, Marlin | safetensors (compressed-tensors) | 1.300.648.141 | RTX 30/40, tambien RTX 50 | 84,97 (cache KV INT8) |
| divingclone/Hy-MT2-1.8B-NVFP4-vLLM | NVFP4 W4A4, CUTLASS | safetensors (compressed-tensors) | 1.373.024.141 | RTX 50 (perfil rapido) | 79,60 (cache KV INT8) |

Comparacion con modelos de traduccion de terceros de tamano similar: no disponible. La busqueda web realizada no devolvio informacion util (los resultados correspondian a consultas genericas sobre la palabra "query"), y no se dispone de datos verificados de parametros, contexto, rendimiento o licencia de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La metrica chrF++ publicada mide similitud con la salida del profesor BF16, no retencion de calidad de traduccion. No debe interpretarse como un porcentaje de calidad.
- La evaluacion del checkpoint INT4 reutilizo resultados anteriores de BF16 y NVFP4, por lo que no es un experimento aislado del cuantizador INT4.
- La calibracion uso solo 256 ejemplos de OPUS, disjuntos del conjunto de evaluacion de 256 ejemplos. El dominio de calibracion es estrecho y puede no representar textos tecnicos, juridicos, coloquiales o con mucho codigo mezclado.
- Todo modelo de traduccion puede omitir, resumir o alterar contenido de forma silenciosa; no hay datos especificos de tasa de alucinacion o de omision para este checkpoint.
- Cobertura de idiomas no documentada: no se puede afirmar que soporte un par de idiomas concreto sin verificar el modelo base.
- El runtime esta fijado a una version concreta (SystemPanic/vllm-windows 0.29.0, PyTorch 2.11.0+cu130 y el plugin nativo de Hunyuan). Un layout de repositorio estandar no garantiza compatibilidad con versiones arbitrarias de vLLM o Transformers.
- El soporte de RTX 30 y RTX 40 se basa en el soporte de arquitectura de runtime y kernels, no en validacion en hardware. GTX 10/16 y RTX 20 no estan soportadas por el runtime empaquetado.
- Al no haber pesos GGUF, no es desplegable directamente en llama.cpp, Ollama o herramientas equivalentes sin una conversion adicional.
- El repositorio registra cero descargas y cero likes, por lo que carece de validacion independiente de la comunidad.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar `MODEL_CHANGES.md` y la licencia del modelo base, asi como la procedencia de los datos de calibracion OPUS.
- Es un proyecto independiente: no es una publicacion oficial de Tencent y no debe presentarse como tal.

## Enlaces

- Repositorio HuggingFace del checkpoint INT4: https://huggingface.co/divingclone/Hy-MT2-1.8B-INT4-vLLM
- Repositorio hermano NVFP4 W4A4: https://huggingface.co/divingclone/Hy-MT2-1.8B-NVFP4-vLLM
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Proyecto Hy-MT2 Windows: https://github.com/divingclone/Hy-MT2-Windows
- Runtime vLLM para Windows: repositorio SystemPanic/vllm-windows, version 0.29.0 (referenciado en la model card; no se proporciona URL directa)
- Paper, blog o demo oficiales: no disponible
- Resultados adicionales de la busqueda web: no disponibles (los resultados obtenidos no guardaban relacion con el modelo)
