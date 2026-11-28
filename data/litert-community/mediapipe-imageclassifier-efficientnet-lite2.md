# litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2

## Resumen

MediaPipe EfficientNet-Lite2 es un clasificador de imágenes de 1.000 clases (ImageNet-1k) empaquetado como modelo LiteRT/TFLite para inferencia en dispositivo. Lo publica la comunidad `litert-community` dentro del ecosistema de Google AI Edge, y se integra de forma nativa con la tarea `ImageClassifier` de MediaPipe Tasks en Android, iOS, Web, Python y Flutter. Resuelve el caso de uso de clasificación visual de baja latencia sin conexión, con un consumo de memoria y almacenamiento muy contenido.

Se distribuye en dos variantes: un modelo de cuantización completa de enteros INT8 de 7,17 MB y un modelo FP32 de 24,33 MB. Ambos aceptan tensores de entrada `[1, 260, 260, 3]` en RGB y devuelven un vector Softmax de `[1, 1000]` probabilidades correspondientes a las clases de ImageNet. EfficientNet-Lite2 escala la resolución y la capacidad respecto a EfficientNet-Lite0 manteniendo activaciones ReLU6 y capas optimizadas para hardware de borde.

La relevancia actual reside en que es un artefacto listo para producción (pesos con SHA-256 publicado, metadatos `TFLITE_METADATA` embebidos y mapa de etiquetas asociado) que evita al desarrollador tener que exportar, cuantizar o validar el modelo por su cuenta. No es un modelo generativo: es un clasificador discriminativo cerrado de 1.000 categorías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite2 (CNN, familia EfficientNet con activaciones ReLU6 y sin squeeze-and-excitation) |
| Parametros totales | no disponible (no se publica el recuento en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija `[1, 260, 260, 3]`) |
| Tipos de cuantizacion | INT8 full-integer (7,17 MB) y FP32 (24,33 MB) |
| Idiomas soportados | no disponible (no aplica; las etiquetas estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) para LiteRT y MediaPipe Tasks |

## Arquitectura y entrenamiento

EfficientNet-Lite2 es una red neuronal convolucional de la familia EfficientNet, en su variante "Lite" orientada a dispositivos de borde. Frente a EfficientNet original, la variante Lite elimina las capas squeeze-and-excitation, sustituye las activaciones Swish por ReLU6 (mas amigables para cuantizacion y kernels de movil) y fija el escalado compuesto de profundidad, anchura y resolucion. La entrada es de 260 x 260 píxeles RGB, superior a la de EfficientNet-Lite0, lo que le permite capturar mas detalle a costa de algo mas de computo.

El modelo se entrena sobre ImageNet-1k (1.000 clases) y se distribuye ya cuantizado. La variante INT8 usa normalizacion con `mean=127.0` y `std=128.0`, con parametros de cuantizacion de entrada `scale=0.0123429, zero_point=125` y de salida `scale=0.00390625, zero_point=0`. La variante FP32 espera valores normalizados en el rango `[-0.9921875, 1.0]`. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento (no aplica), la composicion del dataset mas alla de ImageNet-1k, ni si hubo tecnicas de aumento de datos o destilacion especificas.

## Capacidades

- Clasificacion de imagenes en 1.000 categorias de ImageNet-1k (desde `tench` hasta `toilet tissue`).
- Salida de probabilidades Softmax por clase, apta para umbrales de confianza y ranking top-k.
- Inferencia en dispositivo (on-device) sin conexion a red, en Android, iOS, Web, Python y Flutter mediante MediaPipe Tasks.
- Ejecucion standalone con LiteRT, sin necesidad de la capa de tareas de MediaPipe.
- Dos precisiones intercambiables segun el compromiso tamano/precision: INT8 para el minimo consumo, FP32 para maxima fidelidad numerica.
- No soporta tool calling, agentes, razonamiento multi-paso, vision generativa, audio ni modo "thinking": es un clasificador discriminativo puro.
- Capacidades multilingues: no aplica; las etiquetas estan en ingles.

## Casos de uso

- Clasificacion de fotos en galerias moviles: el modelo INT8 de 7,17 MB se puede empaquetar dentro de la app Android o iOS y clasificar imagenes localmente sin subirlas a un servidor, preservando la privacidad del usuario y funcionando sin conectividad.
- Moderacion de contenido en el borde: prefiltrar imagenes en el propio dispositivo antes de enviarlas a un servicio de moderacion mas costoso, usando el top-k de clases para descartar o etiquetar casos evidentes.
- Etiquetado automatico de inventario o catalogos: procesar lotes de imagenes de producto en un pipeline Python con MediaPipe Tasks y asignar categorias ImageNet como punto de partida para taxonomias propias.
- Vision por computador en robots o dispositivos IoT: al ser un modelo TFLite de baja huella, se puede desplegar en placas con aceleradores NPU/GPU integrados para tareas de reconocimiento de objetos cotidianos en tiempo real.
- Demos y prototipado rapido en Web: la demo oficial y los samples de MediaPipe permiten validar la integracion en navegador con WebAssembly/WebGPU antes de invertir en un modelo propio.
- Aplicaciones de accesibilidad: describir verbalmente el contenido de una imagen capturada por la camara, usando las etiquetas top-1/top-3 como entrada a un sintetizador de voz.
- Filtrado previo en pipelines de datos: descartar imagenes que no pertenecen a las clases de interes antes de pasarlas a un modelo mayor, reduciendo coste computacional en servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de accuracy top-1/top-5 en ImageNet-1k ni latencias medidas por plataforma.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo INT8 ocupa 7,17 MB en disco y el FP32 24,33 MB. La memoria en tiempo de ejecucion es del orden de decenas de MB, muy por debajo de cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; esta disenado para CPU, GPU integrada, DSP y NPU de moviles y dispositivos de borde. En servidor puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en practicamente cualquier SoC movil moderno; el cuello de botella no es la memoria sino el soporte del delegado LiteRT en la plataforma.
- Opciones de despliegue: MediaPipe Tasks (`ImageClassifier`) en Android, iOS, Web, Python y Flutter; LiteRT standalone; el formato TFLite es ademas compatible con TensorFlow Lite y con el runtime de LiteRT en Python.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo de 7 MB en INT8, se espera latencia de pocos milisegundos en NPU moviles, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientNet-Lite2 (este) | no disponible | 260x260 | INT8 / FP32 | Apache 2.0 | TFLite |
| EfficientNet-Lite0 (misma familia) | no disponible | 224x224 | INT8 / FP32 | Apache 2.0 | TFLite |
| MobileNetV3 (referencia de borde) | no disponible | variable | INT8 / FP32 | Apache 2.0 | TFLite / ONNX |

La model card indica explicitamente que EfficientNet-Lite2 ofrece mayor precision que EfficientNet-Lite0 a cambio de un mayor coste computacional y de una resolucion de entrada superior (260 frente a 224). No se dispone de cifras comparativas de accuracy ni de latencia en la informacion proporcionada, por lo que la comparacion cuantitativa con MobileNetV3 u otras alternativas queda como no disponible.

## Limitaciones y advertencias

- Solo clasifica entre las 1.000 clases de ImageNet-1k; cualquier objeto fuera de ese vocabulario se asignara a la clase mas parecida, con riesgo de falsos positivos.
- Sesgos inheritos del dataset ImageNet-1k: desequilibrios de representacion por categoria, sesgos geograficos y culturales, y clases potencialmente ofensivas en el etiquetado original.
- Riesgo de error en imagenes con oclusion, baja iluminacion, angulos no canonicos o dominios muy distintos al de ImageNet (por ejemplo, imagenes medicas o industriales).
- Las etiquetas estan en ingles; no hay soporte multilingue ni localizacion de categorias.
- La variante INT8 introduce perdida de precision respecto a FP32; conviene validar el impacto en el caso de uso concreto antes de desplegar en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero exige conservar el aviso de licencia y no ofrece garantias.
- No es un modelo generativo ni conversacional: no admite prompts, tool calling ni razonamiento multi-paso.
- El repo tiene 0.0 GB reportados y 190 descargas en el momento de la consulta; es un artefacto comunitario, no un lanzamiento oficial de Google, aunque los pesos provienen de las rutas oficiales de MediaPipe.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageClassifier-EfficientNet-Lite2
- Documentacion de MediaPipe Image Classifier: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier
- LiteRT: https://developers.google.com/edge/litert
- Paper EfficientNet (arXiv:1905.11946): https://arxiv.org/abs/1905.11946
- Samples Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/android
- Samples iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_classification/ios
- Colab Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_classification/python/image_classifier.ipynb
- Sample Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-classifier.ts
- Sample Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_classifier
- Demo en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_classifier
