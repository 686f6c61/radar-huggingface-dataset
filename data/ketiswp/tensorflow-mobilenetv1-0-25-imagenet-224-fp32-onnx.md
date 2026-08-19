# ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-fp32-onnx

## Resumen

Este modelo es una conversión a ONNX en precisión FP32 del modelo MobileNetV1 con ancho de multiplicador 0.25 y resolución de entrada 224x224, originalmente entrenado en TensorFlow para clasificación de imágenes en el conjunto ImageNet. La conversión está publicada por el usuario ketiswp en HuggingFace, con licencia Apache 2.0, y forma parte de un par con una versión INT8 disponible por separado.

MobileNetV1 es una familia de redes neuronales convolucionales ligeras diseñadas para entornos con recursos limitados, como dispositivos móviles y sistemas embebidos. Utiliza convoluciones separables en profundidad para reducir el número de parámetros y el coste computacional en comparación con arquitecturas convolucionales estándar. El factor de ancho 0.25 reduce aún más la capacidad del modelo, lo que lo hace especialmente adecuado para inferencia de baja latencia en CPU o hardware de bajo consumo.

La relevancia de este modelo radica en su formato ONNX, que permite su despliegue en múltiples plataformas mediante ONNX Runtime, y en su pequeño tamaño, que lo hace viable para escenarios de clasificación de imágenes en tiempo real en dispositivos con recursos escasos. No se proporcionan datos sobre el contexto de entrenamiento ni sobre métricas de rendimiento específicas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (CNN con convoluciones depthwise separables) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP32 (existe versión INT8 en el mismo repositorio) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

MobileNetV1 es una arquitectura convolutional introducida por Google en 2017, que emplea convoluciones separables en profundidad (depthwise separable convolutions). Estas dividen la operación de convolución en dos pasos: una convolución depthwise que actúa por canal y una convolución pointwise (1x1) que mezcla los canales. Esta descomposición reduce drásticamente el coste computacional y el número de parámetros en comparación con las convoluciones estándar.

El modelo aquí publicado es una conversión a ONNX del modelo original de TensorFlow, con un multiplicador de ancho de 0.25, que reduce el número de canales en todas las capas a un cuarto de los de la versión base. La resolución de entrada es de 224x224 píxeles, lo que permite clasificar imágenes en las 1000 clases de ImageNet. No se dispone de información sobre el conjunto de datos de entrenamiento, la cantidad de tokens (no aplica), ni sobre técnicas de optimización como RLHF o DPO, ya que es un modelo de visión y no de lenguaje. La conversión a ONNX se realizó probablemente para facilitar el despliegue en entornos de inferencia multiplataforma.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (perros, gatos, vehículos, objetos cotidianos, etc.).
- Inferencia de baja latencia y bajo consumo de recursos, adecuada para dispositivos embebidos y móviles.
- Compatibilidad con ONNX Runtime, lo que permite ejecución en CPU, GPU y hardware especializado.
- Soporte para preprocesado estándar de imágenes (redimensionado a 224x224, normalización con media y desviación típica de ImageNet).
- No soporta tool calling, generación de texto, agentes ni razonamiento multi-paso, al ser exclusivamente un modelo de clasificación visual.
- Capacidades multilingües no aplicables.

## Casos de uso

- Clasificación de imágenes en dispositivos embebidos: el modelo puede desplegarse en placas como Raspberry Pi o dispositivos con microcontroladores que ejecuten ONNX Runtime, permitiendo clasificación en tiempo real de imágenes capturadas por cámaras.
- Aplicaciones de control de calidad industrial: integración en pipelines de visión artificial para clasificar productos en una cinta transportadora, detectando defectos o categorías de piezas con baja latencia.
- Filtrado de contenido en aplicaciones de moderación: clasificación de imágenes para identificar categorías inapropiadas (violencia, desnudos, etc.) en entornos con limitación de recursos.
- Aplicaciones de asistencia visual para personas con discapacidad: el modelo puede ejecutarse en un smartphone para reconocer objetos y describirlos mediante síntesis de voz.
- Sistemas de clasificación de plantas o animales en aplicaciones de campo: uso en herramientas móviles para identificar especies a partir de fotografías, con ventaja de funcionamiento offline.
- Optimización de búsqueda de imágenes en archivos locales: clasificación automática de imágenes almacenadas en un ordenador o NAS para organizar colecciones de fotos por categorías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de exactitud (top-1, top-5) sobre ImageNet, ni comparaciones con otros modelos en la ficha o en la información del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de tamaño reducido (el número de parámetros no se indica, pero se estima inferior a 1 millón), la memoria necesaria es mínima, del orden de decenas de megabytes en FP32.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; puede ejecutarse en GPUs de gama de entrada como NVIDIA GTX 1050 Ti, RTX 3060, o incluso en la iGPU integrada de procesadores modernos.
- CPU: funciona en CPU de escritorio y móviles sin problemas, gracias al bajo coste computacional.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorFlow, PyTorch mediante conversión, y plataformas como OpenVINO o TensorRT (con conversión adicional).
- Latencia y throughput estimados: no disponible, pero se espera una latencia de milisegundos en CPU de escritorio y sub-milisegundos en GPU moderna para una sola imagen.

## Comparativa con modelos similares

No se dispone de datos de rendimiento numéricos para comparar directamente. Sin embargo, se pueden establecer comparaciones arquitectónicas con otros modelos ligeros de clasificación de imágenes:

| Modelo | Arquitectura | Resolución de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| MobileNetV1 0.25 (este) | CNN depthwise separable | 224x224 | Apache 2.0 | ONNX, HuggingFace |
| MobileNetV2 | CNN con bloques de cuello de botella | 224x224 | Apache 2.0 | TensorFlow, PyTorch |
| MobileNetV3 | CNN con arquitectura de búsqueda automática (NAS) | 224x224 | Apache 2.0 | TensorFlow, PyTorch |
| EfficientNet-Lite0 | CNN con escalado compuesto | 224x224 | Apache 2.0 | TensorFlow, PyTorch |

Nota: los parámetros de MobileNetV1 0.25 son aproximadamente 0.5 millones, pero este dato no se confirma en la información proporcionada. MobileNetV2 y V3 son versiones más modernas con mejor relación precisión/coste, pero este modelo es específico para despliegue en ONNX.

## Limitaciones y advertencias

- Sesgos de ImageNet: el modelo hereda los sesgos del conjunto de datos ImageNet, que tiene una distribución geográfica y cultural desequilibrada (sobre-representación de objetos y escenas de países occidentales).
- Riesgo de alucinación visual: como todo clasificador, puede dar salidas incorrectas ante imágenes fuera de distribución o con objetos no vistos en entrenamiento.
- Resolución fija: la entrada debe redimensionarse a 224x224, lo que puede degradar la precisión en imágenes de alta resolución con objetos pequeños.
- Sin capacidad de explicabilidad: no se proporcionan mapas de atención o métodos de interpretación integrados, lo que limita su uso en dominios que requieren explicaciones.
- Licencia Apache 2.0 permite uso comercial, pero no se incluyen garantías explícitas sobre el rendimiento o la seguridad.
- No se dispone de información sobre el proceso de conversión a ONNX ni sobre la fidelidad de la conversión con respecto al modelo original de TensorFlow.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-fp32-onnx)
- [Versión INT8 del modelo](https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-int8-onnx)
- [Documentación original de MobileNetV1 en TensorFlow](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md)
- [Repositorio de TensorFlow Models](https://github.com/tensorflow/models)
