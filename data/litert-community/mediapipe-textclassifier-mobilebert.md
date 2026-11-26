# litert-community/MediaPipe-TextClassifier-MobileBERT

## Resumen

MediaPipe-TextClassifier-MobileBERT es un modelo de clasificación de texto (análisis de sentimiento binario en inglés) empaquetado como `bert_classifier.tflite` (25,71 MB) para la tarea Text Classifier de MediaPipe. Lo publica la comunidad `litert-community` a partir del modelo MobileBERT original de Google (paper arXiv:2004.02984), afinado sobre el corpus Stanford Sentiment Treebank (SST-2) y cuantizado en dynamic-range para ejecución en dispositivo.

El modelo resuelve un problema muy concreto: clasificar una frase corta en inglés como `negative` o `positive` sin salir del terminal, con latencia de decenas de milisegundos y sin dependencia de red. No es un modelo generativo ni un LLM: es un encoder BERT compacto con una cabeza de clasificación de dos clases, diseñado para integrarse en pipelines de MediaPipe Tasks en Android, iOS, Web, Python y Flutter.

Su relevancia actual reside en que ofrece una vía de despliegue extremadamente ligera para una tarea clásica de NLP, con tokenización WordPiece incluida dentro del grafo TFLite (los metadatos empaquetados contienen `vocab.txt` y `labels.txt`), lo que simplifica la integración multiplataforma. La entrada está fijada a 128 tokens y el idioma soportado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileBERT (transformer encoder compacto) con cabeza de clasificación de secuencia |
| Parámetros totales | no disponible (el artefacto publicado pesa 25,71 MB en TFLite dynamic-range) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma de entrada fija `[1, 128]`) |
| Tipos de cuantización | dynamic-range (único artefacto publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos `TFLITE_METADATA` y ficheros `vocab.txt` y `labels.txt` empaquetados |

## Arquitectura y entrenamiento

El modelo es un MobileBERT afinado para clasificación de secuencias sobre SST-2, con dos etiquetas (`negative`, `positive`). MobileBERT es una variante de BERT con compresión por cuello de botella (bottleneck) y equilibrio entre capas, descrita en el paper arXiv:2004.02984; el detalle del proceso de destilación y del número exacto de tokens de entrenamiento no se incluye en la información proporcionada.

La innovación práctica del artefacto es el empaquetado: la tokenización WordPiece se realiza fuera del grafo TFLite a partir del `vocab.txt` embebido, generando tres tensores de entrada `int32` de forma `[1, 128]` (`input_word_ids`, `input_type_ids`, `input_mask`) y una salida `float32` de forma `[1, 2]` con las probabilidades por etiqueta. La cuantización dynamic-range reduce el peso del fichero hasta los 25,71 MB, lo que permite su distribución dentro de aplicaciones móviles. No se documenta en la información disponible si hubo RLHF, DPO ni una fase adicional de ajuste fino más allá del entrenamiento sobre SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés: devuelve probabilidades para `negative` y `positive`.
- Procesamiento de entradas de hasta 128 tokens con tokenización WordPiece integrada vía metadatos.
- Inferencia en dispositivo (on-device) sin conexión de red, mediante el runtime LiteRT/TFLite.
- Integración nativa con la API `TextClassifier` de MediaPipe Tasks en Python, Web/JavaScript, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart).
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio.
- No soporta multilingüismo: únicamente inglés.

## Casos de uso

- Moderación de comentarios y reseñas en apps móviles: clasificar en el propio terminal reseñas de tienda o comentarios de usuarios como positivos o negativos antes de enviarlos al backend, reduciendo coste de servidor y preservando privacidad.
- Enrutado de tickets de soporte: etiquetar mensajes entrantes en inglés por polaridad para priorizar quejas negativas en una cola de atención al cliente.
- Analítica de opiniones embebida en apps de campo: procesar encuestas de satisfacción sin conectividad, útil en entornos con red intermitente.
- Filtrado previo en pipelines de NLP: usar el clasificador como primera etapa barata que descarte o marque textos antes de pasarlos a un modelo mayor en servidor.
- Funciones interactivas en apps Flutter y Web: reaccionar en tiempo real al tono de un texto escrito por el usuario (por ejemplo, sugerir reformular un mensaje negativo) usando la demo y los samples oficiales.
- Investigación y docencia en NLP: ejemplo reproducible de extremo a extremo de un clasificador BERT cuantizado desplegado con MediaPipe Tasks en múltiples plataformas.

## Benchmarks y rendimiento

Latencia reportada por la documentación de MediaPipe Text Classifier para la variante MobileBERT (pipeline MediaPipe de extremo a extremo):

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| MobileBERT | Pixel 6 | 57,68 ms | no disponible |

No se han publicado resultados de benchmarks de calidad (exactitud en SST-2, MMLU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 25,71 MB en disco; en ejecución móvil o CPU el consumo de memoria es reducido, aunque no se publica una cifra exacta de memoria en inferencia.
- GPU recomendadas: no requiere GPU; el benchmark oficial se ejecuta en CPU de Pixel 6 (57,68 ms de latencia media del pipeline).
- Cabe en cualquier dispositivo móvil moderno (Android, iOS) y en navegador; también en placas y sistemas embebidos compatibles con LiteRT.
- Opciones de despliegue: runtime LiteRT/TFLite a través de MediaPipe Tasks (`TextClassifier`) en Python, Web, Android, iOS y Flutter; también puede cargarse con el intérprete TFLite directamente.
- Throughput estimado: no disponible; la única cifra publicada es la latencia media de 57,68 ms por inferencia en Pixel 6.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MediaPipe-TextClassifier-MobileBERT (este) | MobileBERT cuantizado | 128 tokens | TFLite | Apache 2.0 | On-device, sentimiento binario EN |
| DistilBERT SST-2 | DistilBERT | 512 tokens | safetensors / PyTorch | Apache 2.0 | Servidor/GPU, clasificación general |
| BERT-base SST-2 | BERT-base | 512 tokens | safetensors / PyTorch | Apache 2.0 | Servidor/GPU, mayor coste |
| Modelos de sentimiento en Hugging Face (p. ej. variantes RoBERTa) | RoBERTa | 512 tokens | safetensors / PyTorch | MIT / Apache 2.0 según variante | Servidor/GPU, mayor precisión típica |

No se dispone de datos comparativos de exactitud en la información proporcionada; la comparación se limita a arquitectura, contexto, formato y licencia.

## Limitaciones y advertencias

- Solo inglés: cualquier texto en otro idioma producirá predicciones sin garantía de validez.
- Ventana fija de 128 tokens: textos más largos se truncan, lo que puede degradar la clasificación de reseñas extensas.
- Tarea limitada a sentimiento binario; no es un modelo generativo ni un clasificador multietiqueta.
- Riesgo de sesgo: entrenado sobre reseñas de cine (SST-2), su dominio es estrecho y puede no generalizar a otros géneros textuales (soporte técnico, redes sociales, dominios legales o médicos).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o con negaciones complejas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base MobileBERT y de los datos SST-2 para usos derivados.
- El artefacto es dynamic-range quantized; no se publican variantes float16 ni int8 full-integer en la información disponible, lo que limita el ajuste fino de precisión/rendimiento.
- No hay métricas de calidad publicadas en la model card; para producción conviene evaluar sobre un conjunto propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextClassifier-MobileBERT
- Documentación de MediaPipe Text Classifier: https://developers.google.com/edge/mediapipe/solutions/text/text_classifier
- Paper MobileBERT: https://arxiv.org/abs/2004.02984
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier
- Código fuente web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/text-classifier.ts
- Sample Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/android
- Sample iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_classification/python/text_classifier.ipynb
- Sample Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_classifier
- Guías de instalación: https://developers.google.com/edge/mediapipe/solutions/setup_python · https://developers.google.com/edge/mediapipe/solutions/setup_web · https://developers.google.com/edge/mediapipe/solutions/setup_android · https://developers.google.com/edge/mediapipe/solutions/setup_ios · https://developers.google.com/edge/mediapipe/solutions/setup_flutter
