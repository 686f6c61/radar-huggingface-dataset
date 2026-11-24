# litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0

## Resumen

MediaPipe-ImageClassifier-EfficientNet-Lite0 es un modelo de clasificación de imágenes de 1.000 clases (ImageNet-1K) empaquetado en formato TFLite para la tarea `ImageClassifier` de MediaPipe y para inferencia directa con LiteRT. Lo publica la organización litert-community en Hugging Face y deriva del EfficientNet-Lite0 original de Google, una adaptación de EfficientNet-B0 orientada a dispositivos de borde. Se distribuye en dos variantes: una cuantizada a enteros completos INT8 de 5,43 MB y otra en FP32 de 18,58 MB, ambas con metadatos TFLite y las etiquetas de clase embebidas.

El modelo resuelve el problema de clasificación de imágenes de baja latencia en Android, iOS, web, Flutter y Python sin necesidad de servidores. Su relevancia actual radica en que es el modelo por defecto recomendado para la tarea MediaPipe `ImageClassifier`, lo que lo convierte en una pieza estándar en pipelines de visión en el dispositivo. La arquitectura es una CNN EfficientNet-Lite0 con entrada fija de 224x224x3 y salida softmax de 1.000 clases.

Al tratarse de un modelo puramente de visión y no de un modelo de lenguaje, carece de ventana de contexto textual, de capacidades generativas y de soporte multilingüe; su ámbito es exclusivamente la clasificación de imágenes en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-Lite0 (adaptación de EfficientNet-B0: ReLU6 en lugar de swish, sin bloques squeeze-and-excitation, stem y head fijos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224x3) |
| Tipos de cuantizacion | INT8 full-integer y FP32 |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos `TFLITE_METADATA` y etiquetas embebidas |

## Arquitectura y entrenamiento

EfficientNet-Lite0 adapta EfficientNet-B0 para inferencia en el borde: sustituye las activaciones swish por ReLU6, elimina los bloques squeeze-and-excitation y fija el stem y el head mientras escala anchura y profundidad. La entrada es un tensor `images` de forma `[1, 224, 224, 3]`; en la variante INT8 es `uint8` con normalización `mean=[127.0]`, `std=[128.0]` y cuantización `scale=0.012566, zero_point=131`. La salida es un tensor `Softmax` de forma `[1, 1000]` con las probabilidades de las 1.000 clases de ImageNet-1K.

El entrenamiento se realizó sobre el dataset ImageNet-1K (1.000 clases). No se detallan en la información disponible el número de tokens (no aplica), la composición exacta del dataset más allá de ImageNet-1K, ni si hubo etapas de ajuste fino adicionales. La innovación técnica principal es la cuantización full-integer INT8, que según la model card es aproximadamente 2,3 veces más rápida en CPU de Pixel 6 que la variante FP32, junto con la integración de metadatos y etiquetas en el propio archivo TFLite.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1K (de `tench` en el índice 0 a `toilet tissue` en el índice 999).
- Inferencia en el dispositivo en Android, iOS, web, Flutter y Python mediante MediaPipe Tasks o LiteRT.
- Etiquetas de clase embebidas en el trailer `TFLITE_METADATA` (`labels_without_background.txt`), de modo que MediaPipe `ImageClassifier` rellena `category_name` sin archivo externo.
- Dos variantes de precisión: INT8 (5,43 MB) para CPU con XNNPACK y FP32 (18,58 MB) para delegados GPU o máxima fidelidad en coma flotante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (detección, segmentación) ni audio.
- No dispone de modo thinking ni de capacidades multilingües.

## Casos de uso

- Clasificación de imágenes en tiempo real en apps Android: se integra con la tarea MediaPipe `ImageClassifier` y la variante INT8 para obtener baja latencia en CPU mediante XNNPACK, sin conexión a red.
- Etiquetado automático en apps iOS: la variante FP32 con delegado GPU permite clasificar fotogramas de cámara con mayor fidelidad numérica cuando el hardware lo permite.
- Filtrado y organización de galerías fotográficas en el dispositivo: el modelo asigna una de las 1.000 clases ImageNet a cada imagen para agrupar o buscar por categoría sin subir datos a la nube.
- Clasificación en web mediante LiteRT: la variante INT8 de 5,43 MB se descarga rápido y se ejecuta en el navegador para demos o herramientas de etiquetado ligero.
- Preprocesado en pipelines de visión en Flutter: se usa como primer clasificador para enrutar imágenes hacia modelos más específicos (detección, segmentación) según la clase predicha.
- Prototipado e investigación en Python: el cuaderno de Colab y `ai-edge-litert` permiten validar la clasificación ImageNet-1K y comparar INT8 frente a FP32 antes de desplegar en móvil.
- Sistemas embebidos con memoria limitada: el archivo INT8 de 5,43 MB encaja en dispositivos con restricciones severas de almacenamiento y RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la variante INT8 es aproximadamente 2,3 veces más rápida en CPU de Pixel 6 que la FP32; no se proporcionan cifras de precisión top-1/top-5 ni latencias absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo INT8 ocupa 5,43 MB y el FP32 18,58 MB en almacenamiento, con huella de memoria en ejecución del orden de decenas de MB.
- GPU recomendadas: no se especifican modelos concretos; la variante FP32 está pensada para delegados GPU en móvil o escritorio, y la INT8 para CPU con XNNPACK.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU de consumo puede ejecutarlo, aunque el objetivo principal son CPUs móviles y aceleradores de borde.
- Opciones de despliegue: MediaPipe Tasks (`ImageClassifier`), LiteRT (`ai-edge-litert`), TFLite runtime, Flutter MediaPipe, y ejecución web mediante LiteRT.
- Latencia y throughput estimados: solo se conoce la relación aproximada de 2,3× a favor de INT8 frente a FP32 en CPU de Pixel 6; no hay cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe EfficientNet-Lite0 (este) | no disponible | 224x224x3 | INT8 y FP32 | Apache 2.0 | Hugging Face, LiteRT, MediaPipe |
| EfficientNet-B0 original | no disponible | 224x224x3 | FP32 | Apache 2.0 (según implementación) | TensorFlow/Keras |
| MobileNetV2 | no disponible | 224x224x3 | INT8 y FP32 | Apache 2.0 | TensorFlow Lite, MediaPipe |

La comparación cuantitativa de precisión y latencia frente a estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo clasifica entre las 1.000 clases de ImageNet-1K; cualquier objeto fuera de ese vocabulario se asignará a la clase más parecida, con riesgo de error.
- No es un modelo generativo: no produce texto, código ni razonamiento, y no admite tool calling ni agentes.
- Riesgo de sesgo heredado de ImageNet-1K en la distribución de clases y en el rendimiento por categoría; no se documentan evaluaciones de equidad.
- La variante INT8 introduce error de cuantización; para máxima fidelidad numérica debe usarse la FP32.
- El mapeo de etiquetas requiere cuidado: `labels.txt` tiene 1.001 líneas (la primera es `background`), por lo que al ejecutar el grafo directamente con `ai-edge-litert` el índice `i` (0..999) corresponde a la línea `i + 2` (`labels.splitlines()[1:][i]`).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los modelos y datasets upstream (EfficientNet, ImageNet-1K) en el contexto de producción.
- No hay datos publicados de precisión top-1/top-5 ni de latencia absoluta, lo que limita la evaluación previa al despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite0
- Documentación MediaPipe Image Classifier: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier
- LiteRT: https://developers.google.com/edge/litert
- Paper EfficientNet (arXiv:1905.11946): https://arxiv.org/abs/1905.11946
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/ios
- Cuaderno Python Colab: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_classification/python/image_classifier.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-classifier.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_classifier
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier
