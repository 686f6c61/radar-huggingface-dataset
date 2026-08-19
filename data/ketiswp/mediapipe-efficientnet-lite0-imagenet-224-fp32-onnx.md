# ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-fp32-onnx

## Resumen

El modelo `ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-fp32-onnx` es una conversión a formato ONNX del clasificador de imágenes EfficientNet-Lite0 desarrollado por Google MediaPipe. Se trata de una red neuronal convolucional ligera, entrenada con el conjunto de datos ImageNet, capaz de reconocer 1.000 clases de objetos comunes (árboles, animales, comida, vehículos, personas, etc.). Su principal valor es ofrecer una alternativa portable y eficiente para ejecutar clasificación de imágenes en entornos con recursos limitados, como dispositivos móviles, integraciones en el borde o aplicaciones de escritorio que usan ONNX Runtime.

La conversión a ONNX permite desplegar el modelo con cualquier runtime compatible (ONNX Runtime, TensorRT, OpenVINO, etc.) sin depender de las herramientas específicas de MediaPipe. Al ser una arquitectura EfficientNet-Lite0, el modelo está optimizado para latencias bajas y bajo consumo de memoria, manteniendo una precisión razonable en el conjunto de ImageNet. La licencia Apache 2.0 facilita su uso comercial y la integración en proyectos propietarios.

Aunque el repositorio no incluye documentación extensa más allá de la model card, la procedencia de Google MediaPipe y la disponibilidad de una versión INT8 complementaria indican que el modelo está pensado para aplicaciones de producción en tiempo real. La ausencia de métricas publicadas en esta ficha no debe interpretarse como falta de rendimiento, sino como una carencia de información detallada en la fuente original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-Lite0 (red convolucional con escalado compuesto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, 224x224 píxeles) |
| Tipos de cuantizacion | FP32 (el modelo original de MediaPipe también ofrece versiones INT8) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

EfficientNet-Lite0 pertenece a la familia de modelos EfficientNet, que utiliza un escalado compuesto uniforme de profundidad, anchura y resolución. La variante "Lite" está optimizada para dispositivos móviles y CPU, reduciendo el número de operaciones y el uso de memoria en comparación con las versiones estándar. La arquitectura se basa en bloques convolucionales con conexiones residuales y módulos de atención Squeeze-and-Excitation, lo que permite extraer características visuales de alta calidad con un coste computacional reducido.

El modelo fue entrenado por Google con el conjunto de datos ImageNet (ILSVRC) para la clasificación en 1.000 categorías. No se dispone de información pública sobre el número exacto de épocas, la política de aumento de datos o si se utilizaron técnicas de aprendizaje por refuerzo o ajuste fino adicional. La conversión a ONNX conserva los pesos originales en precisión FP32, lo que mantiene la fidelidad del modelo original. La versión INT8 mencionada en el repositorio indica que también existe una variante cuantizada para mejorar aún más la eficiencia en hardware limitado.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet (objetos, animales, alimentos, vehículos, etc.).
- Inferencia en tiempo real en dispositivos con CPU o GPU gracias a su tamaño reducido y optimización para móviles.
- Compatibilidad con ONNX Runtime y otros motores de inferencia que soporten el formato ONNX.
- Integración sencilla con pipelines de visión por computador existentes, al ser un modelo estándar de clasificación.
- No incluye capacidades de detección de objetos, segmentación, texto o audio; es exclusivamente un clasificador de imágenes.
- No admite tool calling ni razonamiento multi-paso; es un modelo discriminativo de una sola pasada.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo se puede integrar en apps de Android o iOS mediante MediaPipe Tasks o directamente con ONNX Runtime para identificar objetos en tiempo real, por ejemplo, en una app de reconocimiento de plantas o animales.
- Moderación de contenido: se puede usar para filtrar imágenes en plataformas de contenido generado por usuarios, detectando categorías no deseadas (por ejemplo, contenido violento o inapropiado) si se entrena un clasificador adicional sobre las características del modelo.
- Automatización de inventarios en retail: clasificar fotos de productos para categorizarlos automáticamente en almacenes o tiendas online, reduciendo el trabajo manual de etiquetado.
- Accesibilidad para personas con discapacidad visual: combinar el modelo con un sistema de captura de imagen y síntesis de voz para describir objetos presentes en una escena, aunque no es una solución completa de descripción de imágenes.
- Control de calidad en manufactura: clasificar imágenes de piezas en una línea de producción para detectar defectos o clasificar por tipo, siempre que se ajuste el modelo a las categorías específicas mediante transfer learning.
- Prototipado rápido de sistemas de visión por computacional: gracias a su ligereza, se puede usar como baseline en experimentos de clasificación antes de pasar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace no incluye métricas de precisión, latencia o throughput. Se recomienda consultar la documentación oficial de MediaPipe para obtener referencias de rendimiento de la versión original (TensorFlow Lite), que puede variar en la conversión a ONNX.

## Requisitos de hardware

- Al ser un modelo ligero (tamaño estimado en decenas de megabytes, aunque no se especifica), se puede ejecutar en CPU sin necesidad de GPU. Para FP32, una CPU moderna puede lograr inferencias en menos de 50 ms por imagen, según el hardware.
- En GPU, el modelo cabe en cualquier tarjeta con al menos 1 GB de VRAM, incluyendo GPUs integradas o tarjetas de entrada como GTX 1050 o RTX 2050.
- Para despliegue en móvil, se recomienda usar ONNX Runtime Mobile o MediaPipe Tasks con la versión TFLite del modelo original.
- Se puede desplegar con ONNX Runtime (CPU/GPU), TensorRT, OpenVINO o llama.cpp (aunque este último está orientado a modelos de texto, no es apropiado). La herramienta `onnxruntime` es la más común para servidores.
- La latencia típica en una CPU de servidor (e.g., Intel Xeon) podría ser de 5-10 ms por imagen, pero no se dispone de datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificación de imágenes en la información proporcionada. Modelos alternativos como MobileNetV3 o ResNet50 podrían ofrecer precisiones o latencias diferentes, pero no se han incluido métricas en esta ficha. Se recomienda evaluar el modelo directamente con el propio dataset para decidir si es adecuado.

## Limitaciones y advertencias

- Limitado a las 1.000 clases de ImageNet; no es un clasificador de propósito general y puede no reconocer objetos fuera de ese conjunto.
- Riesgo de alucinación en clasificaciones erróneas cuando la imagen es ambigua o no corresponde a ninguna clase conocida.
- No es un modelo multimodal; no procesa texto ni audio, solo imágenes.
- La versión FP32 puede ser más pesada en memoria y computación que la versión INT8, pero la INT8 requiere un proceso de cuantización que puede afectar ligeramente la precisión.
- Licencia Apache 2.0 permite uso comercial, pero no se proporciona garantía de ningún tipo por parte del autor.
- No hay información sobre sesgos específicos, pero al entrenarse con ImageNet, puede heredar los sesgos de ese conjunto de datos (por ejemplo, sobre-representación de ciertas categorías o sesgos culturales en las etiquetas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-fp32-onnx
- Versión INT8 del mismo autor: https://huggingface.co/ketiswp/mediapipe-EfficientNet-Lite0-ImageNet-224-int8-onnx
- Documentación oficial de MediaPipe para clasificación de imágenes: https://developers.google.com/edge/mediapipe/solutions/vision/image_classifier/index
- Repositorio de MediaPipe en GitHub: https://github.com/google-ai-edge/mediapipe
- Guía de EfficientNet-Lite en TensorFlow TPU: https://github.com/tensorflow/tpu/blob/master/models/official/efficientnet/lite/README.md
- Tutorial de uso con MediaPipe (Medium): https://medium.com/image-classification-tutorials/i-built-a-mediapipe-image-classifier-in-python-with-efficientnet-lite0-heres-the-clean-workflow-eb74ca1cdd53
