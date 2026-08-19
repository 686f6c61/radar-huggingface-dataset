# hugging-mac/yolov8-pose-coreml

## Resumen

El modelo `hugging-mac/yolov8-pose-coreml` es una conversión lista para usar de los modelos de estimación de pose humana YOLOv8 Pose de Ultralytics, en formato Core ML para ejecución local en dispositivos con Apple Silicon (CPU, GPU y Apple Neural Engine). Lo publica el usuario `hugging-mac` como parte de la plataforma Hugging Mac, orientada a construir aplicaciones y juegos de IA locales en macOS. Resuelve el problema de integrar detección de personas y estimación de 17 puntos clave (keypoints) del estándar COCO en aplicaciones nativas de Apple sin depender de servicios en la nube.

El repositorio incluye tres variantes del modelo (`n`, `s` y `m`) con tamaños de paquete de 6,8 MB, 23,5 MB y 53,2 MB respectivamente, todas convertidas a precisión FP16 y con entrada fija de 640×640 píxeles. La salida es un tensor crudo de forma `1 × 56 × 8400` que contiene cajas delimitadoras, puntuaciones de persona y las coordenadas de los 17 keypoints. No se incluye supresión de no máximos (NMS) embebida, por lo que el postprocesado debe realizarse después de la inferencia. La licencia es AGPL-3.0, heredada de los términos de Ultralytics.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 Pose (conversión Core ML, red neuronal convolucional) |
| Parametros totales | No disponible (variantes n, s, m; sin cifra publicada en la información) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 640×640) |
| Tipos de cuantizacion | FP16 (conversión Core ML) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.mlpackage` (Core ML) |

## Arquitectura y entrenamiento

El modelo original YOLOv8 Pose, desarrollado por Ultralytics, es una red neuronal convolucional de una sola pasada que combina detección de objetos y estimación de pose. La arquitectura se basa en un backbone CSPDarknet, un cuello PAN-FPN y cabezales de detección y keypoints. La versión convertida en este repositorio proviene de los pesos oficiales de Ultralytics (assets v8.2.0) y se ha transformado a Core ML con precisión FP16. El tamaño de entrada es fijo a 640×640 píxeles con batch size 1. No se incluye NMS dentro del modelo, por lo que la salida cruda debe procesarse externamente. No se dispone de información sobre el dataset de entrenamiento específico (se asume COCO, ya que la tarea es detección de personas y 17 keypoints COCO), ni sobre el proceso de entrenamiento (épocas, aumentos, etc.).

## Capacidades

- Detección de personas en imágenes y vídeo.
- Estimación de pose humana con 17 keypoints según el estándar COCO (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos).
- Salida estructurada con cajas delimitadoras, puntuación de persona y coordenadas de keypoints con visibilidad.
- Ejecución local en dispositivos Apple Silicon mediante Core ML, con soporte para CPU, GPU y Apple Neural Engine (ANE).
- Inferencia de baja latencia gracias a los tamaños reducidos de los modelos (desde 6,8 MB).
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión.

## Casos de uso

- Aplicaciones de fitness y entrenamiento personal: el modelo puede detectar la pose del usuario en tiempo real y contar repeticiones o corregir la postura, ejecutándose completamente en el dispositivo para preservar la privacidad.
- Juegos interactivos basados en movimiento: al integrar el modelo en una app macOS, se pueden controlar personajes o acciones mediante gestos corporales, con latencia mínima gracias al uso de la ANE.
- Animación y captura de movimiento: los keypoints extraídos pueden alimentar sistemas de rigging o animación procedural en herramientas de creación de contenido, sin necesidad de hardware especializado.
- Análisis de vídeo deportivo: procesar grabaciones de partidos o entrenamientos para extraer métricas de movimiento y biomecánica, con la ventaja de que los datos no salen del equipo.
- Sistemas de videovigilancia local: detección de caídas o comportamientos anómalos basados en la pose, ejecutándose en un Mac sin conexión a internet.
- Prototipado rápido de aplicaciones de visión: al ser un paquete Core ML listo para usar, permite integrar estimación de pose en apps macOS o iOS con unas pocas líneas de código, acelerando el desarrollo de MVPs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (como mAP en COCO) ni comparaciones con otros modelos. Tampoco se proporcionan datos de latencia o throughput en el repositorio. Se recomienda consultar la documentación oficial de Ultralytics YOLOv8 para obtener métricas de referencia de los modelos originales, aunque estas corresponden a la versión PyTorch y pueden variar tras la conversión a Core ML.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M1, M2, M3 y posteriores) y macOS.
- Compatible con CPU, GPU y Apple Neural Engine mediante `coremltools` con `ComputeUnit.ALL`.
- Los tamaños de paquete son reducidos (6,8 MB, 23,5 MB y 53,2 MB), por lo que caben holgadamente en cualquier dispositivo Apple Silicon, incluidos los Mac con memoria unificada de 8 GB.
- No requiere GPU dedicada externa; la ANE ofrece aceleración específica para redes neuronales.
- Despliegue mediante Core ML (`coremltools`), con integración típica en aplicaciones Xcode o Python.
- Para inferencia en tiempo real se recomienda la variante `n` (menor latencia) y para mayor precisión la variante `m`.
- No se dispone de datos de latencia o throughput medidos en este repositorio.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de estimación de pose en formato Core ML. Existen otras conversiones de YOLOv8 a Core ML (por ejemplo, `TheCluster/YOLOv8-CoreML`), pero no se han publicado métricas comparables en los resultados de búsqueda. Como referencia, el modelo original YOLOv8 Pose de Ultralytics tiene variantes `n`, `s`, `m`, `l` y `x` con diferentes balances de velocidad y precisión, pero esta conversión solo incluye las tres primeras. Para una comparativa rigurosa se necesitarían datos de mAP y latencia en el mismo hardware, que no están disponibles en este repositorio.

## Limitaciones y advertencias

- El modelo no incluye NMS embebido; es obligatorio aplicar filtrado por confianza y supresión de no máximos después de la inferencia para obtener detecciones finales.
- La entrada es fija a 640×640 píxeles; cualquier imagen debe redimensionarse y aplicarse letterboxing antes de la inferencia.
- Solo está disponible en formato Core ML, lo que limita su uso a ecosistemas Apple (macOS, iOS, iPadOS). No es directamente utilizable en Linux o Windows sin conversión adicional.
- La licencia AGPL-3.0 impone restricciones para uso comercial o de código cerrado. Es necesario revisar los términos de Ultralytics antes de desplegar el modelo en producción.
- El modelo está entrenado para detectar personas y keypoints en el contexto de COCO; puede tener un rendimiento degradado en posturas no representadas en el dataset o en imágenes con oclusiones severas.
- No se proporcionan garantías de precisión tras la conversión; la cuantización FP16 puede introducir ligeras pérdidas de rendimiento respecto al modelo original en FP32.
- No hay información sobre sesgos del modelo, pero al estar entrenado en COCO es probable que tenga un rendimiento desigual entre distintos grupos demográficos, como ocurre con la mayoría de modelos de visión.

## Enlaces

- Repositorio en Hugging Face: [hugging-mac/yolov8-pose-coreml](https://huggingface.co/hugging-mac/yolov8-pose-coreml)
- Proyecto Hugging Mac en GitHub: [https://github.com/devilyouwei/hugging-mac](https://github.com/devilyouwei/hugging-mac)
- SDK de YOLOv8 Pose en Hugging Mac: [https://github.com/devilyouwei/hugging-mac/tree/main/packages/hugging_mac_sdk/src/hugging_mac_sdk/models/yolov8_pose](https://github.com/devilyouwei/hugging-mac/tree/main/packages/hugging_mac_sdk/src/hugging_mac_sdk/models/yolov8_pose)
- Assets de Ultralytics v8.2.0: [https://github.com/ultralytics/assets/releases/tag/v8.2.0](https://github.com/ultralytics/assets/releases/tag/v8.2.0)
- Modelo original YOLOv8 en Hugging Face: [https://huggingface.co/Ultralytics/YOLOv8](https://huggingface.co/Ultralytics/YOLOv8)
- Conversión alternativa YOLOv8-CoreML: [https://huggingface.co/TheCluster/YOLOv8-CoreML](https://huggingface.co/TheCluster/YOLOv8-CoreML)
- Discusión sobre implementación YOLOv8 Pose con CoreML: [https://github.com/ultralytics/ultralytics/issues/13603](https://github.com/ultralytics/ultralytics/issues/13603)
- Sitio web de YOLOv8: [https://yolov8.org/yolov8-ultralytics-real-time-computer-vision-model/](https://yolov8.org/yolov8-ultralytics-real-time-computer-vision-model/)
