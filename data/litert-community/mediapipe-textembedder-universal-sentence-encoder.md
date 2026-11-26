# litert-community/MediaPipe-TextEmbedder-Universal-Sentence-Encoder

## Resumen

El MediaPipe TextEmbedder Universal Sentence Encoder es un modelo compacto de embeddings de frases publicado por la comunidad litert-community (Google AI Edge) en formato LiteRT/TFLite. Se trata de un codificador dual (dual-encoder) de tipo USE-QA que transforma texto de entrada en vectores densos de 100 dimensiones, pensado para calcular similitud semantica por coseno y agrupamiento tematico directamente en el dispositivo (on-device), sin necesidad de servidor ni conexion de red.

Su relevancia radica en el tamano: el fichero `universal_sentence_encoder.tflite` ocupa 6,12 MB en precision FP32, lo que permite integrarlo en aplicaciones Android, iOS, web (JavaScript) y Flutter a traves de la tarea MediaPipe Text Embedder. Esta disenado para escenarios de baja latencia en movil; la documentacion oficial reporta 10 ms de latencia media de pipeline en CPU con 4 hilos en un Galaxy S26 Ultra.

No es un modelo generativo ni un LLM: no produce texto, no razona y no soporta tool calling. Es una pieza de infraestructura para busqueda semantica ligera, deduplicacion de textos y clasificacion por similitud en el borde. Su entrenamiento sobre pares pregunta-respuesta (QA) condiciona su comportamiento: captura similitud tematica, no polaridad sentimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador dual (dual-encoder) tipo Universal Sentence Encoder, variante USE-QA, exportado a LiteRT/TFLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 en el fichero publicado; la API TextEmbedder expone una opcion `quantize=True` en el ejemplo de Python |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`universal_sentence_encoder.tflite`, 6.120.274 bytes, SHA-256 `89ad3c74175dd8caa398cc22b657296d94302d20c525c12b58b29420f7249749`) |

## Arquitectura y entrenamiento

La model card describe un codificador dual compacto entrenado sobre conjuntos de datos de pregunta-respuesta. La arquitectura sigue el esquema clasico de dos torres: una torre codifica la consulta (query) y otra el resultado (response), y la similitud se calcula entre sus embeddings. El modelo exportado expone dos salidas de 100 dimensiones (`Final/EncodeQuery/mul` y `Final/EncodeResult/mul`), ambas de tipo `float32`, y tres entradas de tipo `string` (`inp_text`, `res_context`, `res_text`) con forma `[-1]`.

Los metadatos embebidos en el TFLite identifican el modelo como `USE-QA TFLite model`, version 1, autor MediaPipe. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; al ser un modelo de embeddings y no generativo, estas tecnicas no serian de aplicacion directa. La innovacion principal es la compresion a 6,12 MB con salida de 100 dimensiones, que reduce el coste de almacenamiento y de calculo de similitud frente a embeddings de 512 o 768 dimensiones.

## Capacidades

- Generacion de embeddings de frases en 100 dimensiones para similitud semantica por coseno.
- Calculo de similitud tematica entre pares de textos (la model card advierte que captura tema, no sentimiento: "I like my phone" y "I hate my phone" resultan muy similares).
- Agrupamiento (clustering) tematico de textos por proximidad vectorial.
- Busqueda semantica ligera y deduplicacion de contenido en el dispositivo.
- Inferencia on-device en Android, iOS, web (JavaScript) y Flutter mediante MediaPipe Tasks.
- Ejecucion en Python via `mediapipe` con la API `TextEmbedder`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, codigo, matematicas ni vision.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica local en aplicaciones moviles: indexar un corpus pequeno de notas o articulos y recuperar los mas proximos a una consulta usando similitud por coseno, sin enviar datos a un servidor y con latencia de milisegundos.
- Deduplicacion de mensajes o resenas: agrupar textos tematicamente equivalentes antes de almacenarlos o moderarlos, aprovechando que el modelo captura tema aunque difiera la formulacion.
- Clasificacion ligera de tickets de soporte: comparar el texto de un ticket con prototipos de categorias predefinidas y asignar la mas cercana, como paso previo a un modelo mayor.
- Sugerencia de contenido relacionado: en una app de lectura, calcular la similitud entre el articulo abierto y el resto del catalogo para recomendar articulos del mismo tema en local.
- Filtrado previo en pipelines RAG en el borde: descartar candidatos irrelevantes antes de invocar un modelo mayor o un servicio remoto, reduciendo coste y latencia.
- Deteccion de duplicados en formularios o encuestas: comparar respuestas abiertas de usuarios y marcar entradas casi identicas para revision.
- Prototipado rapido multiplataforma: validar una idea de similitud semantica en Android, iOS, web y Flutter con el mismo fichero TFLite y las muestras oficiales de MediaPipe.

## Benchmarks y rendimiento

La model card solo publica una medicion de latencia, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MTEB u otros).

| Metrica | Dispositivo | Valor |
|---|---|---|
| Latencia media de pipeline en CPU (4 hilos) | Galaxy S26 Ultra | 10 ms |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU; el modelo esta pensado para CPU y aceleradores moviles. El fichero pesa 6,12 MB en FP32.
- GPU recomendadas: no disponibles; el caso de uso objetivo es CPU en dispositivos moviles y navegador.
- Cabe en cualquier GPU de consumo y en practicamente cualquier dispositivo movil moderno por su tamano.
- Opciones de despliegue: MediaPipe Tasks (`TextEmbedder`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript) y Flutter (Dart); el fichero es un `.tflite` compatible con el runtime LiteRT.
- Latencia: 10 ms de media en CPU con 4 hilos en Galaxy S26 Ultra segun la documentacion oficial. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| MediaPipe USE (este modelo) | no disponible (6,12 MB) | 100 | no disponible | Apache 2.0 | TFLite / MediaPipe, on-device |
| Universal Sentence Encoder original (TensorFlow Hub) | no disponible | 512 | no disponible | Apache 2.0 | TensorFlow / TF Hub |
| all-MiniLM-L6-v2 (Sentence Transformers) | ~22 M | 384 | 256 tokens | Apache 2.0 | PyTorch / ONNX / GGUF |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (embeddings de frases ligeros) solo puede establecerse por tamano y dimension de salida, ya que la informacion proporcionada no incluye metricas de calidad comparables.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- Captura similitud tematica, no polaridad sentimental: textos con sentimiento opuesto sobre el mismo tema resultan muy similares.
- Embeddings de solo 100 dimensiones implican menor capacidad de discriminacion fina que modelos de 384 o 768 dimensiones.
- No es un modelo generativo: no responde preguntas, no resume ni razona; solo produce vectores.
- Longitud maxima de entrada no documentada en la informacion disponible.
- Riesgo de alucinacion no aplicable (no genera texto), pero si de falsos positivos en similitud por la baja dimensionalidad.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; conviene revisar los terminos de MediaPipe y LiteRT para el despliegue.
- Para produccion en servidor con corpus grandes, un modelo de embeddings de mayor dimension suele ser mas adecuado; este esta optimizado para el borde.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextEmbedder-Universal-Sentence-Encoder
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-TextEmbedder-Universal-Sentence-Encoder/blob/main/universal_sentence_encoder.tflite
- Documentacion de MediaPipe Text Embedder: https://developers.google.com/edge/mediapipe/solutions/text/text_embedder
- Benchmarks de Text Embedder: https://developers.google.com/edge/mediapipe/solutions/text/text_embedder#benchmarks
- Setup Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Setup Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Setup Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Setup iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Setup Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_embedder
- Codigo fuente web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/text-embedder.ts
- Muestra Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/android
- Muestra iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/python/text_embedder.ipynb
- Muestra Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_embedder
