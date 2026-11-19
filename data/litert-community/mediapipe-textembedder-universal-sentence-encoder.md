# litert-community/MediaPipe-TextEmbedder-Universal-Sentence-Encoder

## Resumen

El MediaPipe TextEmbedder Universal Sentence Encoder es un modelo compacto de embeddings de frases distribuido por la comunidad litert-community para su uso con la tarea TextEmbedder de MediaPipe. Se trata de un codificador dual (dual-encoder) en formato TFLite de tan solo 6,12 MB en precisión FP32, que proyecta texto de entrada en vectores densos de 100 dimensiones para calcular similitud semántica mediante coseno en dispositivos de borde. Su origen es el artefacto oficial servido por Google desde `storage.googleapis.com/mediapipe-models`, y el binario del repositorio es byte a byte idéntico a dicho artefacto.

El modelo resuelve el problema de la comparación semántica de texto en entornos con recursos muy limitados: Android, iOS, web y Flutter, sin necesidad de backend ni conexión de red. Frente a los embeddings de 768 dimensiones típicos de los LLM actuales, sacrifica granularidad semántica a cambio de un tamaño mínimo y una latencia de CPU en torno a 10 ms en un Galaxy S26 Ultra con 4 hilos. Está entrenado sobre pares pregunta-respuesta, por lo que captura similitud temática más que polaridad sentimental.

Es relevante ahora porque encaja en la tendencia de inferencia en el dispositivo (on-device) para tareas de recuperación ligera, agrupamiento temático y coincidencia FAQ, donde el coste de invocar un modelo grande en la nube no está justificado. La licencia Apache 2.0 y la disponibilidad multiplataforma facilitan su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador dual (dual-encoder) transformer compacto, exportado a TFLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (float32); el ejemplo de MediaPipe permite `quantize=True` en el pipeline |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`universal_sentence_encoder.tflite`, 6,12 MB) |

## Arquitectura y entrenamiento

El modelo es un codificador dual que genera dos salidas de 100 dimensiones: `Final/EncodeQuery/mul` (codificación de consulta) y `Final/EncodeResult/mul` (codificación de respuesta). La entrada se compone de tres tensores de tipo string (`inp_text`, `res_context`, `res_text`), lo que refleja un pipeline de parseo de ejemplos (`ParseExample/ParseExampleV2`) orientado a pares pregunta-respuesta. El modelo está entrenado sobre conjuntos de datos de pregunta-respuesta, de ahí la denominación USE-QA en los metadatos embebidos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no es arquitectónica sino de despliegue: un codificador dual de muy bajo coste computacional empaquetado en TFLite con metadatos embebidos (nombre `USE-QA TFLite model`, versión 1, autor MediaPipe), diseñado para ejecutarse en CPU de dispositivos móviles y navegador. La captura de similitud es temática, no de sentimiento: frases como "I like my phone" y "I hate my phone" obtienen alta similitud porque ambas tratan sobre teléfonos.

## Capacidades

- Generación de embeddings de frases en 100 dimensiones para similitud semántica mediante coseno.
- Coincidencia temática y agrupamiento (clustering) de textos por tópico.
- Recuperación ligera y coincidencia FAQ sobre pares pregunta-respuesta.
- Ejecución en el dispositivo (on-device) en Android, iOS, web y Flutter mediante MediaPipe Tasks.
- Inferencia en CPU con latencia muy baja (≈10 ms en Galaxy S26 Ultra con 4 hilos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo de pensamiento (thinking), visión ni audio.

## Casos de uso

- Coincidencia FAQ en aplicaciones móviles: el modelo permite comparar la consulta del usuario con una base de preguntas frecuentes precalculada y devolver la respuesta más similar sin conexión, gracias a sus vectores de 100 dimensiones y su latencia de 10 ms.
- Búsqueda semántica local en el navegador: integrado vía MediaPipe Web, permite indexar y consultar contenido de una web o PWA en el propio cliente, evitando enviar texto del usuario a un servidor.
- Agrupamiento temático de reseñas o comentarios: al capturar similitud por tópico, sirve para agrupar feedback de usuarios en categorías (por ejemplo, quejas sobre batería o pantalla) en un dispositivo de borde.
- Deduplicación y filtrado de contenido: comparar titulares o mensajes entrantes para detectar duplicados o contenido muy similar antes de mostrarlo, con coste computacional despreciable.
- Enrutamiento ligero de intenciones en asistentes de voz: usar la similitud entre la transcripción y un conjunto de intenciones predefinidas para decidir el flujo de conversación en el dispositivo.
- Prefiltrado en pipelines de RAG: como primera etapa de recuperación de bajo coste, descartar candidatos irrelevantes antes de invocar un modelo de embeddings mayor o un LLM, reduciendo el cómputo total.
- Clasificación de texto por prototipos: calcular el vector medio de cada clase y asignar nuevas entradas a la clase más cercana, útil para etiquetado rápido en apps de notas o correo.

## Benchmarks y rendimiento

| Modelo | Dispositivo | Latencia CPU |
|---|---|---:|
| Universal Sentence Encoder | Galaxy S26 Ultra (4 hilos) | 10 ms |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otras métricas de recuperación como MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU y ejecución en el dispositivo. El artefacto pesa 6,12 MB en FP32.
- GPU recomendadas: no requiere GPU; funciona en CPU de móvil, navegador y sistemas embebidos.
- Cabe en cualquier GPU de consumo y en la práctica totalidad de dispositivos móviles actuales; no es un modelo destinado a GPU de datacenter.
- Opciones de despliegue: MediaPipe Tasks (Python, Web/JavaScript, Android Kotlin/Java, iOS Swift, Flutter Dart); el formato TFLite también puede ejecutarse con el intérprete de TensorFlow Lite.
- Latencia y throughput estimados: ≈10 ms por inferencia en CPU de Galaxy S26 Ultra con 4 hilos, según la documentación de MediaPipe; no se dispone de cifras de throughput.

## Comparativa con modelos similares

| Modelo | Dimension de embedding | Tamano | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|
| MediaPipe-TextEmbedder-Universal-Sentence-Encoder | 100 | 6,12 MB (FP32) | ingles | Apache 2.0 | TFLite |
| MediaPipe-TextEmbedder-EmbeddingGemma-300M | no disponible | no disponible | multilingue (segun model card) | no disponible | no disponible |
| Embeddings de LLM de 768 dimensiones (referencia generica) | 768 | orden de cientos de MB a GB | multilingue | variable | safetensors, GGUF, etc. |

La model card recomienda `MediaPipe-TextEmbedder-EmbeddingGemma-300M` para tareas multilingües o de recuperación y clasificación guiadas por instrucciones, lo que sitúa a este modelo como la opción de mínima huella dentro de la familia MediaPipe TextEmbedder. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para tareas multilingües.
- Captura similitud temática, no polaridad sentimental: frases con sentimiento opuesto sobre el mismo tema obtienen alta similitud, lo que puede producir resultados contraintuitivos en tareas de análisis de opinión.
- Entrenado sobre pares pregunta-respuesta, por lo que su comportamiento en otros dominios (clasificación fina, instrucciones) puede degradarse.
- Los vectores de 100 dimensiones ofrecen menor granularidad semántica que embeddings de 768 dimensiones; para recuperación precisa se recomienda un modelo mayor.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí existe riesgo de falsos positivos en la coincidencia semántica.
- No se ha publicado un informe de equidad (fairness) específico de Google para este modelo en la página de documentación de MediaPipe.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los artefactos upstream de MediaPipe y de las dependencias de despliegue.
- Para producción en tareas multilingües o guiadas por instrucciones, la propia model card sugiere migrar a `MediaPipe-TextEmbedder-EmbeddingGemma-300M`.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextEmbedder-Universal-Sentence-Encoder
- Archivo del modelo: https://huggingface.co/litert-community/MediaPipe-TextEmbedder-Universal-Sentence-Encoder/blob/main/universal_sentence_encoder.tflite
- Documentación de la tarea Text Embedder: https://developers.google.com/edge/mediapipe/solutions/text/text_embedder
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/text/text_embedder#task_benchmarks
- Guía de instalación Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_embedder
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_embedder/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_embedder/python/text_embedder.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_embedder
- Artefacto upstream: https://storage.googleapis.com/mediapipe-models/text_e
