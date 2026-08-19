# ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-onnx

## Resumen

El modelo `ketispan/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-onnx` es una versión cuantizada a INT8 en formato ONNX del clasificador de imágenes EfficientNet-Lite0, desarrollado originalmente por Google para MediaPipe. Está diseñado para la clasificación de imágenes en 1.000 categorías del dataset ImageNet (árboles, animales, comida, vehículos, personas, etc.). El autor, ketispan, ha convertido el modelo original a INT8 estático con formato QDQ para reducir su huella de memoria y acelerar la inferencia en dispositivos con recursos limitados.

La relevancia actual del modelo radica en su idoneidad para despliegues en entornos móviles, IoT y embebidos, donde la cuantización INT8 permite ejecutar la clasificación con baja latencia y consumo energético. La arquitectura EfficientNet-Lite0 es una variante ligera de EfficientNet, optimizada para CPU, GPU y EdgeTPU, y este modelo en particular está pensado para integrarse con el flujo de trabajo de MediaPipe Tasks (Python, JavaScript, Android, iOS) y con ONNX Runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite0 (basada en EfficientNet, con bloques MBConv) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantización | INT8 estático (QDQ format) |
| Idiomas soportados | no aplicable (modelo de clasificación de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

El modelo base es EfficientNet-Lite0, una variante de EfficientNet optimizada para dispositivos con recursos limitados. EfficientNet-Lite0 utiliza bloques MBConv (Mobile Inverted Bottleneck) con convoluciones depthwise separables y se caracteriza por un escalado compuesto de profundidad, anchura y resolución. En esta versión, el modelo se ha cuantizado estáticamente a INT8, lo que implica que los pesos y las activaciones se representan con números enteros de 8 bits, manteniendo la precisión mediante el uso de escalas y puntos cero (QDQ). El entrenamiento original se realizó sobre el dataset ImageNet, con 1.000 clases, y la cuantización se realizó posteriormente sobre el modelo ya entrenado (post-training quantization). No se dispone de detalles adicionales sobre el proceso de entrenamiento o los datos utilizados más allá de los mencionados en la documentación de MediaPipe.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet (por ejemplo, perro, gato, coche, árbol, etc.).
- Inferencia eficiente en dispositivos con recursos limitados gracias a la cuantización INT8 y la arquitectura ligera.
- Compatible con el pipeline de MediaPipe Tasks para visión, que permite la integración en aplicaciones multiplataforma (Android, iOS, web, Python, JavaScript).
- Formato ONNX, lo que facilita el uso con ONNX Runtime y la exportación a otros entornos de inferencia.
- Soporte para imágenes de entrada de 224x224 píxeles (resolución estándar de EfficientNet-Lite0).

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante MediaPipe Tasks para etiquetar fotos en tiempo real, con una latencia baja gracias a la cuantización INT8.
- Moderación de contenido en plataformas web: al ser un modelo ONNX, puede desplegarse en navegadores mediante ONNX Runtime Web para clasificar imágenes subidas por usuarios (por ejemplo, detectar contenido inapropiado).
- Automatización de inventario en retail: el modelo puede clasificar productos en una línea de cámara, identificando categorías como alimentos, bebidas o electrónica, con un coste computacional reducido.
- Clasificación de imágenes en dispositivos IoT: al ser ligero y cuantizado, puede ejecutarse en Raspberry Pi o módulos EdgeTPU para clasificar objetos en sensores de vigilancia o agricultura.
- Asistencia a personas con discapacidad visual: el modelo puede usarse en una aplicación de asistencia que describa el entorno, clasificando objetos como "silla", "mesa" o "perro" con baja latencia.
- Análisis de imágenes médicas preliminares: aunque no es específico para medicina, puede clasificar imágenes de rayos X en categorías generales (por ejemplo, detectar presencia de objeto), siempre que se reentrene o se use como extractor de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión INT8 en la información disponible. La documentación de MediaPipe indica que EfficientNet-Lite0 es el modelo recomendado para clasificación en dispositivos móviles, pero no se proporcionan cifras de exactitud (top-1/top-5) ni de latencia en la model card. Se recomienda consultar la documentación oficial de MediaPipe para obtener métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (modelo de visión ligero, no requiere VRAM significativa; puede ejecutarse en CPU).
- GPU recomendadas: no es necesario GPU; está diseñado para CPU móviles, GPU integradas y EdgeTPU.
- Compatibilidad con consumer GPU: sí, puede ejecutarse en cualquier GPU con soporte para ONNX Runtime (por ejemplo, RTX 2060 o superior), pero no es necesario.
- Opciones de despliegue: ONNX Runtime (CPU, GPU, Web), MediaPipe Tasks (Android, iOS, JavaScript), TensorFlow Lite (si se convierte), y herramientas como OpenCV para la captura de imágenes.
- Latencia y throughput estimados: no disponible; depende de la plataforma y el backend de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas en la información proporcionada. No obstante, se puede indicar que EfficientNet-Lite0 es comparable a otros modelos de clasificación ligeros como MobileNetV2, MobileNetV3 o ResNet-18 en cuanto a su propósito (clasificación en 1.000 clases), pero no se tienen datos cuantitativos para una comparación detallada.

## Limitaciones y advertencias

- El modelo está limitado a las 1.000 categorías de ImageNet; no reconoce objetos fuera de ese conjunto.
- La cuantización INT8 puede degradar ligeramente la precisión en comparación con el modelo FP32 original, aunque no se especifica el impacto exacto.
- No se han publicado detalles sobre el proceso de cuantización (técnica de calibración, dataset de calibración) en la model card.
- Al ser un modelo de clasificación, no es adecuado para tareas de detección o segmentación de imágenes.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original de MediaPipe si se integra en productos comerciales.
- El modelo no tiene capacidad de razonamiento multimodal ni soporte de tool calling; es exclusivamente un clasificador de imágenes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketispan/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-onnx)
- [Guía de clasificación de imágenes de MediaPipe](https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier)
- [Repositorio de MediaPipe en GitHub](https://github.com/google-ai-edge/mediapipe)
- [Guía de MediaPipe Solutions](https://developers.google.com/edge/mediapipe/solutions/guide)
