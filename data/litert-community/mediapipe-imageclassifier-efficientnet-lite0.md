# litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0

## Resumen

MediaPipe-ImageClassifier-EfficientNet-Lite0 es un clasificador de imágenes de 1.000 clases (ImageNet-1K) empaquetado en formato TFLite y preparado para la tarea `ImageClassifier` de MediaPipe Tasks y para inferencia directa con LiteRT. Lo publica la comunidad `litert-community` en Hugging Face, pero el modelo subyacente procede de Google (MediaPipe) y se distribuye con licencia Apache 2.0. Se ofrece en dos variantes: una cuantizada a enteros completos INT8 de 5,4 MB y otra en coma flotante FP32 de 18,6 MB.

El modelo adapta la arquitectura EfficientNet-B0 para inferencia en el borde (edge): sustituye las activaciones swish por ReLU6, elimina los bloques squeeze-and-excitation y fija el stem y la cabeza mientras escala anchura y profundidad. El resultado es una red convolucional compacta pensada para ejecutarse en CPU móvil (XNNPACK), GPU móvil o navegador, con latencias muy bajas y sin necesidad de infraestructura de servidor.

Su relevancia actual radica en que es el modelo por defecto recomendado para la tarea de clasificación de imágenes de MediaPipe, con metadatos TFLite embebidos y etiquetas incluidas en el propio fichero, lo que simplifica el despliegue en Android, iOS, web, Python y Flutter sin dependencias externas de ficheros de etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite0 (CNN, variante de EfficientNet-B0 adaptada a edge) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224x3) |
| Tipos de cuantizacion | INT8 (enteros completos) y FP32 |
| Idiomas soportados | no aplica (clasificación de imágenes, sin salida textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos TFLITE_METADATA embebidos |

## Arquitectura y entrenamiento

EfficientNet-Lite0 es una red neuronal convolucional que parte de EfficientNet-B0 y aplica tres modificaciones orientadas a dispositivos de borde: reemplazo de las activaciones swish por ReLU6 (más eficientes en hardware móvil y compatibles con cuantización), eliminación de los bloques squeeze-and-excitation, y fijación del stem y la cabeza mientras se escala la anchura y la profundidad de la red. La entrada es un tensor de imagen de 224x224 con tres canales y la salida es un vector de 1.000 probabilidades (softmax) correspondientes a las clases de ImageNet-1K.

El entrenamiento se realizó sobre el dataset ImageNet-1K (1.000 clases), según indica la model card a través del campo `datasets`. No se detallan en la información disponible el número de tokens (no aplica), la composición exacta del dataset más allá de ImageNet-1K, ni si hubo fases de ajuste fino adicionales, destilación o técnicas de aumento de datos específicas. La variante INT8 emplea cuantización de enteros completos con parámetros concretos: entrada `scale=0.012566, zero_point=131`, salida `scale=0.00390625, zero_point=0`, y normalización `mean=[127.0], std=[128.0]`. La variante FP32 usa normalización equivalente con rango de entrada `[-0.9921875, 1.0]`.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1K (de `tench` en el índice 0 a `toilet tissue` en el índice 999).
- Inferencia en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks o LiteRT.
- Etiquetas de clase embebidas en el propio fichero TFLite (`labels_without_background.txt`), de modo que MediaPipe rellena `category_name` automáticamente.
- Dos variantes de precisión: INT8 para CPU y entornos con memoria limitada, FP32 para delegados GPU o cuando se requiere máxima fidelidad en coma flotante.
- Compatibilidad con aceleración por delegados (GPU delegate) y con XNNPACK en CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión y clasificación.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones móviles: la variante INT8 (5,4 MB) puede ejecutarse en CPU de teléfonos de gama media con XNNPACK, lo que permite etiquetar fotogramas de cámara sin enviar datos a la nube.
- Moderación de contenido en el dispositivo: clasificar imágenes subidas por usuarios antes de enviarlas a un servidor, reduciendo coste de ancho de banda y mejorando la privacidad.
- Etiquetado automático de fotos en apps de galería: generar categorías de alto nivel (animales, objetos, vehículos) para organizar colecciones locales sin conexión.
- Filtrado previo en pipelines de visión por computador: usar el clasificador como etapa rápida de descarte antes de invocar modelos más pesados, ahorrando cómputo en servidores o dispositivos.
- Aplicaciones web sin backend: la variante FP32 o INT8 puede ejecutarse en el navegador mediante el demo web de MediaPipe Samples, útil para prototipos y demos interactivas.
- Automatización industrial y robótica de bajo coste: clasificación de piezas u objetos en dispositivos embebidos con recursos limitados, donde un modelo de 5,4 MB cabe en memoria flash y se ejecuta en CPU.
- Aplicaciones Flutter multiplataforma: integrar la clasificación de imágenes en apps Android e iOS con un único modelo y la API de MediaPipe Tasks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que la variante INT8 es aproximadamente 2,3 veces más rápida en CPU de Pixel 6 que la variante FP32, sin cifras absolutas de latencia ni métricas de precisión top-1/top-5 sobre ImageNet-1K.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para CPU/GPU móvil. El fichero INT8 ocupa 5,43 MB y el FP32 18,58 MB en disco o memoria.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU móvil (XNNPACK), GPU integrada de móvil mediante delegado GPU, o GPU de escritorio con delegado correspondiente.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en dispositivos móviles de gama baja; el requisito de memoria es de unos pocos megabytes.
- Opciones de despliegue: MediaPipe Tasks (`ImageClassifier`), LiteRT (`ai-edge-litert`), TFLite runtime, y los entornos soportados por MediaPipe (Android, iOS, web, Python, Flutter).
- Latencia y throughput: no disponibles de forma absoluta; solo se indica la relación ≈2,3× más rápido en INT8 frente a FP32 en CPU de Pixel 6.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision | Licencia | Formato |
|---|---|---|---|---|---|
| MediaPipe EfficientNet-Lite0 (este) | no disponible | 224x224x3 | INT8 / FP32 | Apache 2.0 | TFLite |
| EfficientNet-B0 (original) | no disponible | 224x224x3 | FP32 | Apache 2.0 (referencia) | varios |
| MobileNetV3 | no disponible | 224x224x3 | INT8 / FP32 | Apache 2.0 | TFLite / varios |

No se dispone de datos de rendimiento comparativo (top-1/top-5, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas. La comparativa se limita a aspectos de licencia, formato y tipo de entrada.

## Limitaciones y advertencias

- Modelo de clasificación de imágenes: no genera texto, no razona y no soporta instrucciones; no debe evaluarse como un LLM.
- Solo cubre las 1.000 clases de ImageNet-1K; cualquier objeto fuera de ese vocabulario se asignará a la clase más parecida, con riesgo de predicciones erróneas.
- Riesgo de sesgo heredado de ImageNet-1K: el dataset presenta desequilibrios de clases, sesgos geográficos y culturales, y una cobertura desigual de categorías.
- La variante INT8 introduce pérdida de precisión respecto a FP32; conviene validar métricas en el dominio concreto antes de producción.
- El fichero `labels.txt` del repositorio tiene 1.001 líneas (la primera es `background`); al usar LiteRT directamente hay que mapear el índice `i` a la línea `i + 2`, lo que es una fuente habitual de errores.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los modelos y datasets upstream (MediaPipe, ImageNet-1K) para usos derivados.
- No hay información publicada sobre latencia, throughput ni precisión top-1/top-5 en la model card; cualquier estimación de rendimiento en producción debe medirse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier
- Documentación MediaPipe Image Classifier: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier
- Documentación LiteRT: https://developers.google.com/edge/litert
- Paper EfficientNet (arXiv:1905.11946): https://arxiv.org/abs/1905.11946
- Fichero INT8: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0/blob/main/efficientnet_lite0_int8.tflite
- Fichero FP32: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0/blob/main/efficientnet_lite0_float32.tflite
- Etiquetas: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0/blob/main/labels.txt
