# litert-community/MediaPipe-TextEmbedder-EmbeddingGemma-300M

## Resumen

MediaPipe TextEmbedder EmbeddingGemma 300M es un paquete `.task` de MediaPipe que empaqueta el modelo de embeddings `google/embeddinggemma-300m` en formato TFLite cuantizado (precisión mixta int4+int8) para su ejecución en dispositivo. Lo publica la organización `litert-community`, centrada en artefactos optimizados para LiteRT/MediaPipe, e incluye un único fichero de 183,82 MB (`embedding_gemma.task`) que contiene el grafo `gemma.tflite` (179,13 MB), el tokenizador SentencePiece y un `manifest.pb`.

El modelo resuelve el problema de generar embeddings de texto de 768 dimensiones localmente, sin conexión a la nube, en Android, iOS, web, Python y Flutter. Está pensado para tareas de similitud semántica, recuperación, clasificación y clustering, y además se puede usar con la tarea MediaPipe Decision Maker para clasificación zero-shot sin decodificación generativa.

Su relevancia actual radica en que traslada un modelo de embeddings de 300 millones de parámetros a entornos de borde con un tamaño inferior a 200 MB y una longitud de secuencia de 512 tokens, manteniendo el formato de prompts oficial de EmbeddingGemma. No es un modelo generativo: es un codificador bi-direccional que produce vectores normalizados L2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (base `google/embeddinggemma-300m`), empaquetado como grafo TFLite para MediaPipe |
| Parametros totales | 300M (según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de secuencia para el embedder; hasta 2.048 tokens con chunking LogSumExp en Decision Maker |
| Tipos de cuantizacion | Precisión mixta int4 + int8 |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | `.task` (MediaPipe bundle con `gemma.tflite`, `sentencepiece.model`, `manifest.pb`) |
| Dimension de embedding | 768 |
| Tamano del bundle | 183,82 MB (`embedding_gemma.task`) |
| Entrada del sub-modelo | `embed_512_text_batch:0`, shape `[1, 512]`, int32 |
| Salida del sub-modelo | `StatefulPartitionedCall:0`, shape `[1, 768]`, float32 |
| Libreria | mediapipe |

## Arquitectura y entrenamiento

El artefacto es una versión cuantizada y empaquetada del modelo base `google/embeddinggemma-300m`, un codificador transformer de 300 millones de parámetros que produce embeddings de 768 dimensiones. El grafo TFLite incluido (`gemma.tflite`) es byte-idéntico a `embeddinggemma-300M_seq512_mixed-precision.tflite` del repositorio `litert-community/embeddinggemma-300m`, por lo que la arquitectura subyacente y el entrenamiento corresponden al modelo original de Google, no a un reentrenamiento por parte de `litert-community`.

La innovación del paquete está en el empaquetado y la integración: el bundle `.task` incluye el tokenizador SentencePiece y un manifiesto que permite a MediaPipe aplicar automáticamente el formato de prompts oficial de EmbeddingGemma mediante `TextEmbeddingFormatContext`. La cuantización mixta int4+int8 reduce el grafo a 179,13 MB manteniendo la salida en float32. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo base original.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones con normalización L2 opcional.
- Similitud semántica entre frases y cálculo de similitud coseno.
- Recuperación de documentos con formato de query y documento diferenciado (`RETRIEVAL_QUERY`, `RETRIEVAL_DOCUMENT`).
- Clasificación de texto y clasificación zero-shot mediante la tarea Decision Maker.
- Clustering de textos a partir de sus embeddings.
- Question answering y fact checking como tipos de tarea de embedding.
- Recuperación de código (`CODE_RETRIEVAL`).
- Formato de prompt automático para queries (`task: <task> | query: <text>`) y documentos (`title: <title> | text: <text>`).
- Decision Maker: soporte de `ChoiceQuestion`, `BooleanQuestion` y `ScoreQuestion`.
- Chunking automático de contexto largo con LogSumExp hasta 2.048 tokens en Decision Maker.
- Caché de opciones con `prewarm_choice()` para acelerar decisiones repetidas.
- Ejecución en dispositivo en Android, iOS, web, Python y Flutter.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo: es un codificador, no un modelo de chat.

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: el embedder genera vectores de consulta y de documento con los formatos `RETRIEVAL_QUERY` y `RETRIEVAL_DOCUMENT`, y la similitud coseno se calcula en el dispositivo sin enviar texto a un servidor, con un bundle de menos de 200 MB.
- Clasificación zero-shot de tickets de soporte: con Decision Maker y `ChoiceQuestion` se asignan categorías predefinidas a un texto entrante sin entrenar un clasificador específico, usando `prewarm_choice()` para cachear las opciones y reducir latencia.
- Filtrado de contenido en el borde: `BooleanQuestion` permite evaluar condiciones afirmativas sobre textos (por ejemplo, si un mensaje cumple una política) antes de enviarlo a un backend, con temperatura calibrada automáticamente en torno a 0,045.
- Deduplicación y clustering de documentos: los embeddings de 768 dimensiones permiten agrupar artículos, correos o reseñas por similitud semántica en pipelines de Python o en apps Flutter.
- Recuperación de código en asistentes de desarrollo: el tipo de tarea `CODE_RETRIEVAL` permite indexar fragmentos de código y recuperar los más relevantes para una consulta, ejecutándose localmente en el IDE o en el navegador.
- Fact checking y question answering sobre bases documentales: los tipos `FACT_CHECKING` y `QUESTION_ANSWERING` permiten comparar afirmaciones con pasajes de referencia mediante similitud de embeddings.
- Detección de similitud de frases en web: el demo web de MediaPipe Text Embedder permite probar la similitud entre dos textos directamente en el navegador con el grafo TFLite.
- Enrutamiento de consultas en asistentes: Decision Maker con `ScoreQuestion` puede puntuar opciones de respuesta o rutas de un flujo conversacional sin generar texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el bundle es de 183,82 MB y el grafo TFLite de 179,13 MB, por lo que el uso de memoria es del orden de cientos de MB incluyendo activaciones y tokenizador.
- GPU recomendadas: no disponible; el artefacto está orientado a ejecución en dispositivo (CPU/NPU/GPU móvil según el runtime LiteRT) y no se especifican GPU de servidor.
- Cabe en GPUs de consumo: sí, por tamaño, aunque el destino principal son dispositivos móviles y navegador; no se detallan requisitos de VRAM para GPU de escritorio.
- Opciones de despliegue: MediaPipe Tasks (TextEmbedder y DecisionMaker) en Android, iOS, web, Python y Flutter; el grafo TFLite subyacente puede ejecutarse con runtimes LiteRT/TFLite.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Formato | Licencia |
|---|---|---|---|---|---|
| MediaPipe TextEmbedder EmbeddingGemma 300M (este) | 300M | 512 tokens (2.048 con chunking en Decision Maker) | 768 | `.task` (TFLite int4+int8) | Gemma |
| `google/embeddinggemma-300m` (modelo base) | 300M | no disponible en esta ficha | 768 | safetensors (formato original) | Gemma |
| `litert-community/embeddinggemma-300m` (TFLite sin empaquetar) | 300M | 512 tokens | 768 | TFLite | Gemma |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye otros modelos de embeddings comparables con datos verificables. El paquete de este repositorio se diferencia del TFLite suelto por incluir el tokenizador, el manifiesto y la integración con las tareas TextEmbedder y DecisionMaker de MediaPipe.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su uso está acotado a embeddings y decisiones de clasificación.
- La longitud de secuencia del embedder es de 512 tokens; textos más largos requieren truncado o el chunking LogSumExp de Decision Maker, limitado a 2.048 tokens.
- En Decision Maker se recomienda dejar `temperature=0.0` (calibración automática en torno a 0,045) y formular condiciones booleanas en afirmativo, sin excepciones compuestas con `unless`.
- Los idiomas soportados no se detallan en la información disponible; la cobertura multilingüe depende del modelo base y debe validarse por caso de uso.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings y las decisiones zero-shot pueden producir similitudes o clasificaciones erróneas en dominios fuera de distribución.
- Sesgos conocidos: no documentados en la información disponible; heredables del modelo base `google/embeddinggemma-300m`.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia de Google, que impone restricciones y obligaciones específicas; debe revisarse antes de producción.
- La cuantización int4+int8 puede degradar ligeramente la calidad de los embeddings frente al modelo en precisión completa; no se publican métricas de esa degradación.
- El repositorio tiene 283 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía limitada.

## Enlaces

- [Hugging Face: litert-community/MediaPipe-TextEmbedder-EmbeddingGemma-300M](https://huggingface.co/litert-community/MediaPipe-TextEmbedder-EmbeddingGemma-300M)
- [Modelo base: google/embeddinggemma-300m](https://huggingface.co/google/embeddinggemma-300m)
- [Instrucciones de prompt de EmbeddingGemma](https://huggingface.co/google/embeddinggemma-300m#prompt-instructions)
- [Repositorio TFLite: litert-community/embeddinggemma-300m](https://huggingface.co/litert-community/embeddinggemma-300m)
- [Documentación de MediaPipe Text Embedder](https://developers.google.com/edge/mediapipe/solutions/text/text_embedder)
- [Documentación de MediaPipe Decision Maker](https://developers.google.com/edge/mediapipe/solutions/decision/decision_maker)
- [Ejemplo Android](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/android)
- [Ejemplo iOS](https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/ios)
- [Colab de Python](https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/python/text_embedder.ipynb)
- [Ejemplo Web](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/text-embedder.ts)
- [Ejemplo Flutter](https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_embedder)
- [Demo web de Text Embedder](https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_embedder)
- [Demo web de Decision Maker](https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker)
