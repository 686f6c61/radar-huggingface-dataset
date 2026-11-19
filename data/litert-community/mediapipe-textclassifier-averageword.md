# litert-community/MediaPipe-TextClassifier-AverageWord

## Resumen

MediaPipe TextClassifier AverageWord es un clasificador binario de sentimiento en inglés, empaquetado como modelo TFLite de 776 KB (FP32) para la tarea `TextClassifier` de MediaPipe. Lo publica la comunidad `litert-community` en Hugging Face, pero el artefacto es byte a byte idéntico al que sirve Google desde `storage.googleapis.com/mediapipe-models` (generación `1682480023219908`, última modificación el 26 de abril de 2023). No es un transformer: es un clasificador de bolsa de palabras continua (CBOW) con embeddings promedio, entrenado sobre SST-2 (críticas de cine de Stanford).

Su relevancia no está en la calidad lingüística sino en el coste: 0,14 ms de latencia media por inferencia en CPU de un Pixel 6, dentro del pipeline completo de MediaPipe Tasks. Eso lo convierte en una pieza útil para prefiltrar, etiquetar o disparar lógica en aplicaciones Android, iOS, web, Python y Flutter sin salir del dispositivo, sin dependencias de red y con una huella de menos de 1 MB.

El modelo resuelve un problema muy acotado: dada una cadena corta en inglés, devolver dos puntuaciones (negativo/positivo). Cualquier expectativa de razonamiento, contexto largo o multilingüismo queda fuera de su alcance por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de bolsa de palabras continua (average word embedding) sobre TFLite |
| Parametros totales | no disponible (el modelo pesa 775.706 bytes en FP32; el número de parámetros no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada `[-1, 256]` en `int32`, que corresponde a embeddings de texto, no a tokens) |
| Tipos de cuantizacion | solo FP32 (`float32`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos `TFLITE_METADATA` embebidos (`vocab.txt`, `labels.txt`) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal sobre representaciones medias de embeddings de palabras. La entrada es un tensor `int32` de forma `[-1, 256]` (`serving_default_input_1:0`) que representa los vectores de embedding del texto; la salida es un tensor `float32` de forma `[-1, 2]` (`StatefulPartitionedCall:0`) con las puntuaciones de las dos etiquetas (`0` = negativo, `1` = positivo). El vocabulario es un `vocab.txt` basado en expresiones regulares con 10.003 entradas (`<PAD>`, `<START>`, `<UNKNOWN>` y palabras), empaquetado dentro de los metadatos del propio `.tflite` junto con `labels.txt`.

El entrenamiento se realizó sobre Stanford Sentiment Treebank (SST-2), un corpus de críticas de cine en inglés con etiquetas binarias de sentimiento. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo ajuste fino con RLHF o DPO; no hay información publicada sobre innovaciones técnicas más allá de la propia integración con MediaPipe Tasks. El SHA-256 del binario es `13bf6f7f35964f1e85d6cc762ee7b1952009b532b233baa5bdb4bf7441097f34`, lo que permite verificar la integridad del artefacto.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto corto en inglés.
- Inferencia totalmente on-device mediante MediaPipe Tasks `TextClassifier`, sin llamadas a red.
- Integración multiplataforma: Python, Web/JavaScript, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart).
- Metadatos embebidos (`vocab.txt`, `labels.txt`) que permiten usar el modelo sin ficheros auxiliares externos.
- Latencia muy baja (0,14 ms en Pixel 6, CPU) apta para procesamiento en tiempo real o por lotes de alta frecuencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No soporta multilingüismo: únicamente inglés.

## Casos de uso

- Moderación y triaje de reseñas en apps móviles: clasificar comentarios de usuarios como positivos o negativos antes de enviarlos a un backend, usando la inferencia on-device de 0,14 ms para evitar costes de red y preservar la privacidad del texto.
- Enrutado de feedback en atención al cliente: etiquetar tickets cortos como negativos para priorizar su revisión humana, aprovechando que el modelo cabe en 776 KB y puede ejecutarse en el propio dispositivo del agente.
- Análisis de sentimiento en encuestas in-app: procesar respuestas abiertas de una o dos frases en el momento de la recogida y mostrar agregados sin subir el texto a un servidor.
- Prefiltrado en pipelines de NLP: usar el clasificador como primera etapa barata que descarte o marque textos antes de pasarlos a un modelo mayor, reduciendo el volumen que llega al modelo caro.
- Funciones offline en aplicaciones Flutter o Android: incorporar análisis de sentimiento en apps sin conectividad (campo, zonas rurales, modo avión) gracias a la naturaleza TFLite del artefacto.
- Prototipado rápido y demos web: el modelo se puede probar directamente en el navegador mediante la demo oficial de MediaPipe Samples Web, lo que facilita validar la integración antes de escribir código nativo.
- Señal auxiliar en sistemas de recomendación: usar el sentimiento de reseñas cortas como feature adicional de bajo coste en el ranking de contenidos.

## Benchmarks y rendimiento

| Modelo | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| Average Word Embedding | Pixel 6 | 0,14 ms | — |

No se han publicado resultados de benchmarks de calidad (exactitud, F1, MMLU, etc.) en la información disponible. La model card solo reporta latencia del pipeline MediaPipe Tasks.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo es un TFLite de 776 KB que se ejecuta en CPU y no requiere GPU dedicada.
- GPU recomendadas: no se reporta uso de GPU; la benchmark oficial solo cubre CPU (Pixel 6). Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja frente a CPU.
- Cabe en cualquier dispositivo consumer: móviles Android/iOS, navegadores, Raspberry Pi y portátiles sin GPU.
- Opciones de despliegue: MediaPipe Tasks (`TextClassifier`) en Python, Web, Android, iOS y Flutter; el `.tflite` también puede cargarse con el intérprete de TensorFlow Lite o LiteRT directamente.
- Latencia y throughput: 0,14 ms por inferencia en CPU de Pixel 6 según la documentación oficial; el throughput no se publica, pero a esa latencia permite miles de clasificaciones por segundo en hardware móvil.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| MediaPipe TextClassifier AverageWord | CBOW + TFLite | 776 KB | no disponible | en | Apache 2.0 | Hugging Face + GCS |
| MediaPipe TextClassifier (variantes BERT) | Transformer + TFLite | no disponible en la información | no disponible | en | Apache 2.0 | MediaPipe Models |
| DistilBERT SST-2 (referencia) | Transformer destilado | ~66 M parámetros | 512 tokens | en (mayormente) | Apache 2.0 | Hugging Face |

La comparación concreta con otras variantes de MediaPipe TextClassifier no está disponible en la información proporcionada; la model card solo menciona esta variante "Average Word Embedding". Frente a un transformer destilado tipo DistilBERT, este modelo es órdenes de magnitud más pequeño y rápido, pero su calidad en dominios distintos de SST-2 y su incapacidad para manejar contexto o matices son limitaciones estructurales.

## Limitaciones y advertencias

- Solo inglés: no es adecuado para texto en otros idiomas.
- Dominio restringido: entrenado en críticas de cine de SST-2; la precisión puede degradarse en otros dominios, sarcasmo o documentos de varias frases.
- Clasificación binaria: no distingue intensidad, emociones múltiples ni sentimiento neutro.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto), pero puede producir etiquetas erróneas con alta confianza en entradas fuera de distribución.
- No se ha publicado un informe de equidad (fairness) específico de Google para este modelo en la página de documentación de MediaPipe.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del artefacto (el binario es idéntico al de Google) y citar correctamente MediaPipe.
- El repositorio en Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta; la fuente canónica sigue siendo `storage.googleapis.com/mediapipe-models`.
- No hay información sobre sesgos demográficos o lingüísticos más allá de la advertencia general de domain shift.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextClassifier-AverageWord
- Documentación de MediaPipe Text Classifier: https://developers.google.com/edge/mediapipe/solutions/text/text_classifier
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/text/text_classifier#task_benchmarks
- Artefacto upstream en GCS: https://storage.googleapis.com/mediapipe-models/text_classifier/average_word_classifier/float32/latest/average_word_classifier.tflite
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_classification/python/text_classifier.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_classifier
- Guías de instalación: Python (https://developers.google.com/edge/mediapipe/solutions/setup_python), Web (https://developers.google.com/edge/mediapipe/solutions/setup_web), Android (https://developers.google.com/edge/mediapipe/solutions/setup_android), iOS (https://developers.google.com/edge/mediapipe/solutions/setup_ios), Flutter (https://developers.google.com/edge/mediapipe/solutions/setup_flutter)
- Stanford Sentiment Treebank: https://nlp.stanford.edu/sentiment/index.html
