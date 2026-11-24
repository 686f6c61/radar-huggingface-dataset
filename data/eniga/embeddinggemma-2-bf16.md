# eniga/embeddinggemma-2-bf16

## Resumen

EmbeddingGemma 2 en bf16 es una conversión del modelo de embeddings `google/embeddinggemma-2` empaquetada como contenedor del motor de inferencia Radiance por el usuario `eniga`. No se trata de un modelo nuevo ni de una variante reentrenada: los pesos son exactamente los del checkpoint original de Google en precisión bf16, sin cuantización alguna, y el único cambio es el formato de empaquetado para poder servirse con Radiance, un servidor de inferencia orientado a GPUs AMD (ROCm) y CPUs con soporte AVX2/AVX-512.

El modelo base es un modelo de extracción de características (feature-extraction) que produce vectores de 768 dimensiones accesibles mediante el endpoint `/v1/embeddings` compatible con la API de OpenAI. Es relevante para desarrolladores que trabajen sobre hardware AMD y necesiten servir embeddings de calidad en producción sin depender de CUDA, ya que Radiance cubre ese hueco que tradicionalmente ocupan vLLM o TGI en el ecosistema NVIDIA.

La ficha del autor es explícita en un punto crítico: el fichero `.rad` no se carga en transformers, sentence-transformers, vLLM ni llama.cpp. Es un artefacto específico para Radiance 2.2.0 o superior, con un tamaño de repositorio de 1,5 GB. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (modelo base `google/embeddinggemma-2`); detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (el repositorio ocupa 1,5 GB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens como maximo de entrada por peticion segun la configuracion de servicio indicada (`max-num-batched-tokens: 8192`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | ninguno; pesos en bf16 tal como los entrega el checkpoint original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rad` (contenedor propietario de Radiance); no compatible con safetensors, GGUF ni binarios de transformers |
| Dimension de embedding | 768 |
| Motor de inferencia | Radiance 2.2.0 (AMD ROCm y CPU AVX2/AVX-512) |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (`google/embeddinggemma-2`): no se especifican numero de capas, dimensiones ocultas, cabezas de atencion ni mecanismos de pooling o normalizacion. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del corpus ni si hubo etapas de ajuste fino con pares query-documento, destilacion o entrenamiento contrastivo. La model card del autor se limita a describir el proceso de conversion y el despliegue.

Lo que si queda documentado es el proceso de empaquetado: se genero con la imagen `stilldeadcode/radiance` 2.2.0 mediante el comando `rad-convert embeddinggemma-2 -o embeddinggemma2-bf16.rad`, sin receta adicional ni modificacion de pesos. El motor Radiance anade el prefijo de tarea correspondiente en el servidor; segun la model card, el motor no inyecta ningun prefijo de tarea y es responsabilidad del cliente enviarlo en la entrada, lo que implica que para tareas asimetricas (por ejemplo, consulta frente a documento) hay que gestionar el prefijo manualmente. La inferencia se realiza en un solo paso: el modelo embebe la secuencia completa de entrada sin decodificacion autoregresiva, lo que simplifica el batching y elimina el coste de generacion token a token.

## Capacidades

- Generacion de embeddings de 768 dimensiones para texto, expuestos mediante un endpoint `/v1/embeddings` compatible con la API de OpenAI.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus documentales.
- Similitud semantica entre pares de textos, clustering y deduplicacion.
- Clasificacion de texto zero-shot mediante vecinos mas cercanos sobre los embeddings.
- Procesamiento por lotes: la configuracion de referencia admite `max-num-seqs: 64` y `max-num-batched-tokens: 8192`.
- Entrada de hasta 8192 tokens por peticion en la configuracion documentada, con embedding en un unico paso.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas, no generativo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No soporta vision ni audio.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: indexar manuales, RFCs o articulos en una base vectorial usando los embeddings de 768 dimensiones y recuperar fragmentos por similitud coseno; el limite de 8192 tokens por entrada permite indexar secciones completas sin trocear en exceso.
- Motor de RAG (retrieval-augmented generation): servir como recuperador en un pipeline donde un LLM generativo consume los fragmentos recuperados; el endpoint compatible con OpenAI simplifica la integracion con frameworks existentes.
- Deduplicacion de corpus: calcular embeddings de un conjunto de documentos y agrupar por distancia para eliminar duplicados o near-duplicates antes de entrenar o indexar.
- Clasificacion y enrutado de tickets: generar embeddings de tickets de soporte y asignarlos a colas o categorias mediante un clasificador ligero entrenado sobre los vectores, sin necesidad de un modelo generativo.
- Moderacion y filtrado semantico: comparar mensajes entrantes contra un conjunto de referencia de contenido prohibido usando similitud de embeddings.
- Despliegue en infraestructura AMD: servir el modelo en un nodo con GPU Radeon AI PRO R9700 o CPU con AVX-512 usando Radiance, sin depender de CUDA ni de drivers NVIDIA, lo que encaja en entornos con hardware AMD ya amortizado.
- Evaluacion de similitud en investigacion: calcular metricas de similitud semantica entre generaciones y referencias en experimentos de NLP, con la ventaja de que los pesos son bf16 sin perdida por cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MTEB, BEIR ni de ningun otro conjunto de evaluacion, y tampoco se proporcionan datos de latencia o throughput mas alla de la memoria ocupada en una Radeon AI PRO R9700 (1,8 GiB).

## Requisitos de hardware

- VRAM estimada: 1,8 GiB en una Radeon AI PRO R9700 segun la model card; el fichero pesa 1,5 GB, por lo que el consumo en otras GPUs AMD deberia ser del mismo orden.
- GPU recomendadas: Radeon AI PRO R9700 (verificada por el autor); cualquier GPU AMD con soporte ROCm compatible con Radiance 2.2.0. No hay datos de compatibilidad con GPUs NVIDIA.
- CPU: soporte AVX2/AVX-512 segun la documentacion de Radiance, lo que permite ejecucion sin GPU.
- GPU de consumo: no hay datos especificos; por el tamano (1,5 GB en bf16) cabria en GPUs de consumo con al menos 2-4 GiB de VRAM, pero la compatibilidad depende de que Radiance soporte el modelo concreto de GPU.
- Opciones de despliegue: exclusivamente Radiance 2.2.0 o superior. No es compatible con vLLM, llama.cpp, Ollama, TGI, transformers ni sentence-transformers.
- Latencia y throughput: no disponibles. La configuracion de referencia sugiere `max-num-seqs: 64` y `max-num-batched-tokens: 8192`, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formatos de despliegue | Notas |
|---|---|---|---|---|---|---|
| eniga/embeddinggemma-2-bf16 | no disponible | 8192 (config. de servicio) | 768 | Apache-2.0 | Solo Radiance (.rad) | Conversion bf16 del modelo de Google para AMD |
| google/embeddinggemma-2 | no disponible | no disponible | 768 | Apache-2.0 | transformers, sentence-transformers | Modelo original; benchmarks no disponibles en esta ficha |
| Alternativas de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para una comparativa rigurosa |

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparativa cuantitativa fiable. La diferencia practica principal frente al modelo original es el formato de despliegue: esta version solo funciona con Radiance y esta pensada para hardware AMD, mientras que el checkpoint de Google se sirve con el stack estandar de Python.

## Limitaciones y advertencias

- El fichero `.rad` no se carga en transformers, sentence-transformers, vLLM ni llama.cpp; intentar usarlo con esas herramientas fallara. Requiere Radiance 2.2.0 o superior.
- Dependencia de hardware AMD o CPU con AVX2/AVX-512: no hay soporte documentado para GPUs NVIDIA.
- El motor no anade prefijo de tarea; si el modelo base espera prefijos distintos para consulta y documento, el cliente debe gestionarlos manualmente, lo que puede degradar la calidad del retrieval si se omite.
- Es un modelo de embeddings, no generativo: no puede responder preguntas, razonar ni ejecutar herramientas por si mismo.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar los pesos de `google/embeddinggemma-2`, los sesgos del modelo base se trasladan intactos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios alejados de los datos de entrenamiento del modelo base.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingue sin consultar la model card de Google.
- Licencia Apache-2.0 permite uso comercial, pero se aplica la model card de Google para el modelo base, que puede incluir terminos adicionales de uso aceptable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (23 de noviembre de 2026): no hay evidencia de uso en produccion ni validacion comunitaria.
- No se publican benchmarks ni cifras de latencia, lo que impide estimar el rendimiento real antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eniga/embeddinggemma-2-bf16
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Motor Radiance: https://codeberg.org/StillDeadcode/radiance
