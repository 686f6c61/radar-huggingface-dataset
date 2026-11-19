# litert-community/MediaPipe-TextClassifier-MobileBERT

## Resumen

MediaPipe TextClassifier-MobileBERT es un modelo de clasificación de texto (análisis de sentimiento binario en inglés) empaquetado como `bert_classifier.tflite` (25,71 MB) y distribuido por la comunidad litert-community para su uso con la tarea MediaPipe `TextClassifier`. Está basado en MobileBERT, un transformer compacto derivado de BERT diseñado para inferencia en dispositivo, afinado sobre el corpus Stanford Sentiment Treebank (SST-2) de reseñas de películas con dos etiquetas: `negative` y `positive`.

El modelo no se distribuye como pesos de transformer convencionales, sino como un grafo TFLite cuantizado en dynamic-range que incorpora la tokenización WordPiece fuera del grafo: recibe directamente tensores `word_ids`, `type_ids` y `mask` de longitud fija 128 y devuelve un vector de dos probabilidades. Esta decisión de empaquetado lo hace directamente consumible por las APIs de MediaPipe en Python, Web/JavaScript, Android, iOS y Flutter sin necesidad de un tokenizador externo, lo que simplifica la integración en aplicaciones móviles y web.

Su relevancia actual radica en que cubre un nicho muy concreto: clasificación de sentimiento en inglés de baja latencia y totalmente offline en dispositivos de gama media, con una latencia reportada de 57,68 ms en CPU de Pixel 6. No es un modelo generativo ni un LLM, y su ámbito de aplicación está deliberadamente acotado a fragmentos cortos de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileBERT (transformer compacto derivado de BERT), empaquetado como grafo TFLite para MediaPipe TextClassifier |
| Parametros totales | no disponible (no se indica el recuento en la model card; el artefacto pesa 25,71 MB en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma fija de entrada `[1, 128]`) |
| Tipos de cuantizacion | dynamic-range quantization (el artefacto se distribuye como `float32` de 25,71 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con `TFLITE_METADATA` embebida (`vocab.txt`, `labels.txt`) |
| Entradas | `serving_default_input_word_ids:0` `[1,128]` int32, `serving_default_input_type_ids:0` `[1,128]` int32, `serving_default_input_mask:0` `[1,128]` int32 |
| Salidas | `StatefulPartitionedCall:0` `[1,2]` float32 (probabilidades `negative` / `positive`) |
| Tamano del artefacto | 25.707.538 bytes (25,71 MB), SHA-256 `9b45012ab143d88d61e10ea501d6c8763f7202b86fa987711519d89bfa2a88b1` |
| Libreria | `litert` / MediaPipe Tasks |
| Pipeline | `text-classification` |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileBERT, presentado en el paper arXiv:2004.02984, un transformer de tipo BERT con cuellos de botella lineales (bottleneck) y balanceado entre profundidad y anchura para reducir el coste computacional manteniendo buena parte de la capacidad de BERT. Sobre esta base, el modelo se ha afinado como clasificador de secuencias para SST-2, produciendo dos clases de salida. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de indicar que se trata de Stanford Sentiment Treebank (SST-2) de reseñas de películas.

El detalle técnico más relevante del empaquetado es que la tokenización WordPiece se realiza fuera del grafo: el modelo espera tensores `word_ids`, `type_ids` y `mask` ya construidos a partir de un vocabulario embebido en `TFLITE_METADATA` junto con `labels.txt`. El grafo está cuantizado en dynamic-range, lo que reduce el peso y acelera la inferencia en CPU sin requerir recalibración completa. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un clasificador discriminativo de este tipo. La procedencia está verificada: el binario es byte-idéntico al artefacto oficial servido por Google desde `storage.googleapis.com/mediapipe-models`.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre fragmentos cortos de texto.
- Tokenización WordPiece integrada vía metadatos, sin dependencia de un tokenizador externo en tiempo de ejecución.
- Inferencia totalmente en dispositivo (on-device), sin llamadas a red ni servicios externos.
- Integración con la API MediaPipe `TextClassifier` en Python, Web/JavaScript, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart).
- Salida de probabilidades por clase (`[1,2]` float32) apta para umbralización configurable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No es multilingüe: únicamente inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de productos dentro de una app móvil: el modelo clasifica fragmentos cortos de texto en inglés de forma local, sin enviar datos del usuario a un servidor, lo que simplifica el cumplimiento de privacidad y elimina la latencia de red.
- Moderación ligera de comentarios y feedback en aplicaciones Android/iOS: permite filtrar o priorizar mensajes negativos en tiempo real usando la probabilidad de la clase `negative` como señal de triaje antes de un análisis más profundo en servidor.
- Procesamiento por lotes de encuestas de satisfacción (NPS, CSAT) en pipelines Python: al ser un grafo TFLite de 25,71 MB, se puede ejecutar en CPU sin GPU y agregar sentimiento sobre miles de respuestas cortas con bajo coste.
- Funcionalidad offline en aplicaciones de campo o entornos sin conectividad: el modelo funciona íntegramente en el dispositivo, adecuado para apps de inspección, formularios o terminales de punto de venta que recogen opiniones de usuarios sin cobertura.
- Enrutamiento de tickets de soporte en inglés: clasificar la polaridad de la primera frase de un ticket para asignar prioridad o cola, aprovechando la latencia de ~58 ms en CPU de Pixel 6 para respuestas interactivas.
- Componente de demo o prototipado rápido en web: el modelo puede probarse en el navegador mediante la demo oficial de MediaPipe Samples Web y la API JavaScript, útil para validar la viabilidad de una función de sentimiento antes de invertir en un modelo mayor.
- Preprocesado en pipelines de análisis de opiniones: usar la salida de dos probabilidades como feature adicional para un clasificador posterior o para segmentar reseñas de películas antes de un análisis temático.

## Benchmarks y rendimiento

La model card solo reporta latencias de extremo a extremo del pipeline MediaPipe, no métricas de calidad (exactitud, F1) sobre SST-2 ni otros conjuntos.

| Modelo | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| MobileBERT (TextClassifier) | Pixel 6 | 57,68 ms | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, exactitud en SST-2) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para CPU y el artefacto ocupa 25,71 MB en disco. En memoria, el grafo TFLite cuantizado en dynamic-range requiere un footprint del orden de decenas de MB, aunque la cifra exacta de RAM en ejecución no está publicada.
- GPU recomendadas: no requiere GPU; el benchmark oficial reporta latencia en CPU de Pixel 6 (57,68 ms). No se documenta latencia en GPU.
- Cabe en cualquier dispositivo móvil moderno (Android/iOS), en navegadores vía WebAssembly y en CPU de portátiles y servidores sin acelerador.
- Opciones de despliegue: MediaPipe Tasks (`TextClassifier`) en Python, Web/JavaScript, Android, iOS y Flutter; el artefacto es un `.tflite` consumible por el runtime TensorFlow Lite / LiteRT.
- Latencia estimada: 57,68 ms por inferencia de extremo a extremo en Pixel 6 (CPU), según la documentación oficial de MediaPipe. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Despliegue |
|---|---|---|---|---|---|
| MediaPipe TextClassifier-MobileBERT (este) | no disponible (25,71 MB TFLite) | 128 tokens | Clasificación de sentimiento EN (SST-2) | Apache 2.0 | MediaPipe Tasks (móvil, web, Python) |
| BERT-base SST-2 (checkpoints tipo `textattack/bert-base-uncased-SST-2`) | ~110 M | 512 tokens | Clasificación de sentimiento EN (SST-2) | Apache 2.0 (varía por checkpoint) | PyTorch/Transformers, requiere tokenizador externo |
| DistilBERT SST-2 (checkpoints tipo `distilbert-base-uncased-finetuned-sst-2-english`) | ~66 M | 512 tokens | Clasificación de sentimiento EN (SST-2) | Apache 2.0 | PyTorch/Transformers, exportable a ONNX |
| MobileBERT sin cuantizar (checkpoint original) | ~25 M | 512 tokens | Preentrenamiento/afinable | Apache 2.0 | PyTorch/Transformers |

La comparativa se limita a la categoría de clasificadores de sentimiento en inglés; los datos de parámetros de los modelos alternativos provienen del conocimiento general de esos checkpoints y no de la información proporcionada en esta ficha. No se dispone de métricas de calidad comparadas publicadas en la model card.

## Limitaciones y advertencias

- Solo inglés: no es adecuado para texto en otros idiomas, incluido el castellano.
- Sesgo de dominio: entrenado en reseñas de películas (SST-2); la precisión puede degradarse en otros dominios, sarcasmo o documentos de varias frases.
- Ventana fija de 128 tokens: los textos más largos deben truncarse, con la consiguiente pérdida de información.
- Riesgo de clasificación errónea en textos ambiguos o mixtos; la salida es una probabilidad, no una decisión calibrada para todos los dominios.
- No se publica un informe de equidad (fairness) específico para este modelo en la página de documentación de MediaPipe.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los artefactos upstream de Google y de los datos SST-2.
- No es un modelo generativo: no debe emplearse para resumen, traducción, diálogo ni razonamiento.
- El repositorio no incluye métricas de calidad ni tarjetas de evaluación más allá de la latencia; para producción conviene validar con un conjunto propio del dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextClassifier-MobileBERT
- Artefacto TFLite: https://huggingface.co/litert-community/MediaPipe-TextClassifier-MobileBERT/blob/main/bert_classifier.tflite
- Documentación de la tarea Text Classifier: https://developers.google.com/edge/mediapipe/solutions/text/text_classifier
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/text/text_classifier#task_benchmarks
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier
- Guía de instalación Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_classification/python/text_classifier.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_classifier
- Paper MobileBERT: https://arxiv.org/abs/2004.02984
- Stanford Sentiment Treebank: https://nlp.stanford.edu/sentiment/index.html
- Artefacto upstream en Google Cloud Storage: https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/latest/bert_classifier.tflite
