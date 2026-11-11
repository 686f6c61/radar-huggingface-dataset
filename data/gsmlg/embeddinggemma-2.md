# gsmlg/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings de texto desarrollado por Google DeepMind, distribuido originalmente como parte de la familia Gemma. Este repositorio concreto (`gsmlg/embeddinggemma-2`) es un espejo ONNX del subconjunto de texto del modelo, preparado para inferencia en dispositivo mediante ONNX Runtime, en particular a traves del paquete `lib_onnx` para Dart/Flutter. No se trata de un modelo nuevo ni de un fine-tuning: los ficheros son copias sin modificar de `onnx-community/embeddinggemma-2-ONNX` y del tokenizador SentencePiece de `google/embeddinggemma-2`.

El modelo produce embeddings densos de 768 dimensiones con soporte de truncamiento Matryoshka a 512, 256 y 128 dimensiones, lo que permite ajustar el coste de almacenamiento y la latencia en funcion del caso de uso. La interfaz ONNX acepta tambien tensores de caracteristicas visuales, de video y de audio, aunque este espejo solo incluye los encoders de texto y esos tensores deben enviarse vacios (`[0, 512]`).

Su relevancia practica reside en la disponibilidad de variantes cuantizadas muy ligeras (desde 157 MB en q4f16) que permiten ejecutar busquedas semanticas, deduplicacion y clustering sobre texto en dispositivos con recursos limitados, sin depender de una API externa. La licencia declarada es Apache 2.0, aunque el autor remite a la licencia Gemma publicada por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma 2, Google DeepMind); exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8, 4-bit (q4), 4-bit con fp16 (q4f16) |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 (remite a la licencia Gemma de Google) |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data` externo) |
| Dimension del embedding | 768 (truncable a 512, 256, 128 via Matryoshka) |
| Entradas | `input_ids`, `attention_mask`, `image_features`, `video_features`, `audio_features` |
| Salidas | `sentence_embedding` `[batch, 768]`, `last_hidden_state` `[batch, seq, 768]` |
| Libreria | onnx (ONNX Runtime) |
| Tamano del repo | 2.3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es EmbeddingGemma 2 de Google DeepMind, un encoder transformer orientado a la generacion de representaciones vectoriales de frases y documentos. Este repositorio no aporta informacion sobre el numero de parametros, la composicion del corpus de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO o ajuste contrastivo supervisado. Tampoco documenta innovaciones de atencion ni decodificacion, ya que se trata de un modelo de embeddings y no de generacion autoregresiva.

La innovacion tecnica documentada en esta ficha es la del propio espejo: la exportacion a ONNX con soporte de cuantizacion en cinco precisiones y la separacion de los pesos en ficheros externos (`_data`). El modelo expone una interfaz multimodal en la firma ONNX (caracteristicas de imagen, video y audio de 512 dimensiones), pero los encoders correspondientes no estan incluidos en este repositorio; en uso exclusivamente textual esos tensores se pasan vacios. El pooling y la proyeccion a 768 dimensiones se realizan dentro del grafo, de modo que la salida `sentence_embedding` debe normalizarse L2 antes de calcular similitud coseno o producto escalar.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion.
- Truncamiento Matryoshka a 512, 256 y 128 dimensiones conservando las dimensiones iniciales y renormalizando.
- Soporte multilingue segun la etiqueta `multilingual` del repositorio; no se detalla la lista de idiomas.
- Instrucciones de tarea mediante prefijos: `task: search result | query: {texto}` para consultas, `title: {titulo} | text: {texto}` para documentos y `task: sentence similarity | query: {texto}` para tareas simetricas (tambien `classification` y `clustering`).
- Inferencia en dispositivo mediante ONNX Runtime, incluido el binding `lib_onnx` para Dart/Flutter.
- Compatibilidad declarada con `text-embeddings-inference` como tag del repositorio.
- No incluye tool calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo de representacion, no de generacion.
- La firma admite caracteristicas visuales, de video y de audio, pero los encoders no estan en este espejo.

## Casos de uso

- Busqueda semantica en aplicaciones moviles Flutter: usando la variante `model_q4f16.onnx` (157 MB) con `lib_onnx`, se pueden indexar documentos locales y resolver consultas con prefijo `task: search result | query:` sin conexion a red.
- Deduplicacion de registros y catalogo: calcular embeddings de titulo y cuerpo con el prefijo de documento y agrupar por similitud coseno para eliminar entradas repetidas en bases de datos de productos o articulos.
- Clustering y etiquetado de tickets de soporte: generar embeddings con `task: clustering | query:` y aplicar k-means o HDBSCAN para descubrir temas recurrentes en colas de atencion al cliente.
- Clasificacion zero-shot de textos cortos: usar `task: classification | query:` y comparar contra embeddings de etiquetas predefinidas, util para enrutado de correo o moderacion ligera.
- Recomendacion de contenido y articulos relacionados: indexar el corpus con la variante fp16 (542 MB) en servidor y recuperar vecinos mas cercanos para modulos de "contenido similar".
- Filtrado previo en pipelines RAG: como primera etapa de recuperacion sobre un subconjunto reducido del corpus antes de un reranker o de un LLM generativo, reduciendo coste por consulta.
- Deteccion de parafrasis y similitud entre pares de frases: con `task: sentence similarity | query:` y truncamiento a 256 dimensiones para reducir el coste de comparacion masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun variante: q4f16 157 MB, q4 174 MB, int8 314 MB, fp16 542 MB, fp32 1,08 GB (solo pesos; el consumo real anade activaciones y overhead del runtime).
- Cabe en CPU y en GPUs de consumo muy modestas: la variante q4f16 es viable en moviles y en GPUs integradas; fp32 requiere al menos 2 GB de memoria libre en la practica.
- GPUs recomendadas para despliegue en servidor: T4, L4, A10, RTX 3060/4060 en adelante; A100/H100 solo tienen sentido para lotes grandes, dado el reducido tamano del modelo.
- Opciones de despliegue: ONNX Runtime (Python, C++, Dart via `lib_onnx`), `text-embeddings-inference` segun el tag del repositorio, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Formato |
|---|---|---|---|---|---|
| gsmlg/embeddinggemma-2 (este) | no disponible | no disponible | 768 (Matryoshka 512/256/128) | Apache 2.0 | ONNX |
| google/embeddinggemma-2 | no disponible | no disponible | 768 | Gemma license | safetensors (upstream) |
| onnx-community/embeddinggemma-2-ONNX | no disponible | no disponible | 768 | Apache 2.0 | ONNX |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas de otros fabricantes en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa.

## Limitaciones y advertencias

- Es un espejo de pesos, no un modelo entrenado por el autor del repositorio; cualquier sesgo o limitacion proviene de EmbeddingGemma 2 de Google DeepMind y no se documenta aqui.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero los embeddings pueden producir similitudes espurias en dominios muy especializados o con jerga fuera de distribucion.
- Los encoders de vision y audio no estan incluidos: los tensores `image_features`, `video_features` y `audio_features` deben enviarse vacios. Un uso que espere multimodalidad fallara.
- La lista concreta de idiomas soportados no se detalla; solo se declara `multilingual`.
- La longitud de contexto no se especifica; textos largos requeriran truncamiento y pueden degradar la calidad del embedding.
- La licencia se declara Apache 2.0, pero el autor remite a la licencia Gemma de Google; conviene verificar los terminos aplicables antes de un uso comercial, especialmente en lo relativo a atribucion y restricciones de uso aceptable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa de las copias, aunque se publican hashes SHA-256 para verificar integridad.
- Los ficheros `.onnx` dependen de su `.onnx_data` en el mismo directorio; mover un grafo sin su fichero de datos lo rompe.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gsmlg/embeddinggemma-2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Exportacion ONNX de referencia: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Paquete `lib_onnx` (Dart/Flutter): https://pub.dev/packages/lib_onnx
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
