# ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-int8-onnx

## Resumen

ShuffleNetV2 es una arquitectura de red neuronal convolucional diseñada para lograr un equilibrio óptimo entre precisión y eficiencia computacional, pensada para dispositivos con recursos limitados. Este modelo en particular es una versión cuantizada a INT8 del modelo ShuffleNetV2 1.0x de ONNX Model Zoo, preparada para el runtime de ONNX. La cuantización estática reduce el tamaño del modelo y acelera la inferencia en hardware que soporta operaciones de 8 bits, lo que lo hace especialmente útil para despliegues en entornos embebidos, móviles o servidores con restricciones de memoria.

El modelo ha sido publicado por el usuario ketiswp en Hugging Face, con licencia BSD-3-Clause, y es parte de un esfuerzo por ofrecer versiones optimizadas de arquitecturas clásicas de clasificación de imágenes. No se han publicado métricas de rendimiento específicas para esta versión cuantizada, aunque la arquitectura base está bien documentada en la literatura científica. La clasificación de imágenes con las 1000 clases de ImageNet es su tarea principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ShuffleNetV2 (CNN eficiente) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | INT8 estático (formato mixto QOperator/QDQ) |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

ShuffleNetV2 es una red neuronal convolucional publicada en 2018 (arXiv:1807.01864) que introduce el concepto de "shuffle channel" y el uso de operaciones de punto de convolución (pointwise) y profundidad (depthwise) para reducir la complejidad computacional manteniendo una buena precisión. La variante 1.0x se refiere al factor de ancho de la red, que multiplica el número de canales en las capas. El modelo original fue entrenado en ImageNet (1,28 millones de imágenes, 1000 clases) con técnicas estándar de aumento de datos y optimización.

En esta versión cuantizada, se aplicó una cuantización estática INT8 sobre el modelo FP32 previamente entrenado. La cuantización estática requiere un conjunto de datos de calibración para estimar los rangos dinámicos de las activaciones, y el modelo resultante utiliza una combinación de operadores cuantizados (QOperator) y de cuantización-decuantización (QDQ) para mantener la compatibilidad con ONNX Runtime. No se han publicado detalles sobre el dataset de calibración ni sobre el proceso de entrenamiento específico de esta versión.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (objetos, animales, escenas, etc.).
- Inferencia eficiente en dispositivos con recursos limitados gracias a la cuantización INT8.
- Compatibilidad con ONNX Runtime y otros ejecutores ONNX que soporten operadores INT8.
- Preprocesamiento estándar para imágenes de entrada: imágenes RGB de tamaño variable, aunque el modelo espera tensores de forma (3, H, W) con H y W normalmente 224x224 según el dataset original.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multimodal.

## Casos de uso

- **Clasificación de imágenes en tiempo real en dispositivos móviles**: al ser una red ligera y cuantizada a INT8, puede ejecutarse en smartphones o tablets sin necesidad de GPU dedicada, permitiendo identificar objetos o escenas en tiempo real con baja latencia.
- **Sistemas de visión en el borde (edge)**: en cámaras IP, drones o dispositivos IoT, el modelo puede clasificar imágenes localmente sin enviar datos a la nube, reduciendo ancho de banda y mejorando la privacidad.
- **Filtrado de contenido en plataformas de fotos**: integrar el modelo para etiquetar automáticamente fotos en bibliotecas locales o aplicaciones de galería, aprovechando su pequeño tamaño y rapidez.
- **Asistencia a personas con discapacidad visual**: una aplicación móvil que describe el entorno clasificando objetos capturados por la cámara, con respuesta inmediata gracias a la inferencia eficiente.
- **Control de calidad en fabricación**: en líneas de producción, clasificar productos o componentes según categorías visuales predefinidas, con despliegue en hardware embebido que soporte ONNX Runtime.
- **Educación y prototipado**: como modelo de referencia para estudiantes o desarrolladores que quieren aprender sobre cuantización y despliegue de modelos de visión en ONNX, dado su tamaño reducido y disponibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen métricas de precisión (top-1, top-5) ni de velocidad de inferencia específicas para esta versión cuantizada. La precisión del modelo original ShuffleNetV2 1.0x en ImageNet se reporta en el paper original, pero no se dispone de los datos aquí.

## Requisitos de hardware

- **VRAM**: al ser un modelo pequeño (el archivo ONNX original pesa unos 9 MB, y la versión INT8 probablemente menos), la memoria necesaria es muy baja. Se puede ejecutar en CPU sin VRAM dedicada.
- **GPU recomendadas**: no necesario; funciona bien en CPU. Si se usa GPU, cualquier modelo con soporte INT8 es suficiente.
- **Compatibilidad con GPU de consumo**: sí, incluso en tarjetas modestas como una GTX 1650 o integradas, aunque el beneficio principal es en CPU.
- **Opciones de despliegue**: ONNX Runtime (CPU o GPU), ONNX.js para navegador, o runtimes embebidos como TensorRT para NVIDIA.
- **Latencia**: no se dispone de datos concretos, pero se espera latencia de pocos milisegundos en CPU modernas para una imagen 224x224.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otras versiones de ShuffleNetV2 ni con otros modelos eficientes como MobileNetV2 o EfficientNet-Lite en esta información. El modelo original ShuffleNetV2 1.0x tiene alrededor de 2.26 millones de parámetros y 146 MFLOPs, pero no se confirma que esta versión INT8 mantenga exactamente esos valores. Se recomienda consultar el repositorio original de ONNX Model Zoo para obtener más detalles.

## Limitaciones y advertencias

- **Cuantización INT8**: la cuantización puede reducir la precisión respecto al modelo FP32 original, aunque en la mayoría de los casos la degradación es pequeña. No se han publicado resultados de validación en esta versión.
- **Sesgos de ImageNet**: el modelo está entrenado con el conjunto de datos ImageNet, que contiene sesgos de género, etnia y contexto cultural. Las clasificaciones pueden ser inexactas o inapropiadas en ciertos casos.
- **Alucinación**: como modelo discriminativo, no genera texto, pero puede producir clasificaciones erróneas si la imagen no pertenece a las categorías conocidas.
- **Limitaciones de idioma**: no aplica, es un modelo de visión.
- **Licencia**: BSD-3-Clause permite uso comercial y modificación, pero se debe mantener el aviso de copyright y no usar los nombres de los contribuyentes para promocionar sin permiso.
- **Compatibilidad**: el formato ONNX con opset 12 e INT8 puede requerir una versión reciente de ONNX Runtime; verificar la compatibilidad en el entorno de despliegue.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-int8-onnx)
- [Versión FP32 del mismo autor](https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-fp32-onnx)
- [Modelo original en ONNX Model Zoo](https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/shufflenet)
- [ONNX Model Zoo general](https://github.com/onnx/models)
- [Documentación de ONNX](https://onnx.ai/)</think>## Resumen

ShuffleNetV2 es una arquitectura de red neuronal convolucional diseñada para lograr un equilibrio óptimo entre precisión y eficiencia computacional, orientada a dispositivos con recursos limitados. Este modelo es una versión cuantizada a INT8 del ShuffleNetV2 1.0 de ONNX Model Zoo, preparada para su uso con ONNX Runtime. La cuantización estática reduce el tamaño del modelo y acelera la inferencia en hardware que soporta operaciones de 8 bits, lo que lo hace especialmente útil para despliegues en entornos móviles, embebidos o en el borde.

El modelo ha sido publicado por el usuario ketiswp en Hugging Face bajo licencia BSD-3-Clause, y forma parte de un conjunto de modelos ONNX optimizados a partir de la colección oficial de ONNX Model Zoo. No se han publicado métricas de precisión específicas para esta versión cuantizada, pero la arquitectura original es conocida por su eficiencia en tareas de clasificación de imágenes con el conjunto ImageNet. La tarea principal es la clasificación en 1000 categorías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ShuffleNetV2 (red neuronal convolucional eficiente) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantización | INT8 estática (formato mixto QOperator/QDQ) |
| Idiomas soportados | no disponible (no aplica, es un modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

ShuffleNetV2 es una red neuronal convolucional introducida en el paper "ShuffleNet V2: Practical Guidelines for Efficient CNN Architecture Design" (arXiv:1807.11164). Su diseño se basa en el uso de operaciones de convolución de profundidad y de puntos, junto con un mecanismo de "shuffle" de canales para reducir el coste computacional y el número de parámetros sin sacrificar precisión. La variante 1.0 se refiere al factor de escala de canales, que en este caso es el estándar de la familia.

El modelo original fue entrenado en el conjunto de datos ImageNet (más de un millón de imágenes, 1000 clases). La versión cuantizada INT8 se genera a partir del modelo FP32 mediante una cuantización estática, que requiere un conjunto de calibración para estimar los rangos dinámicos de las activaciones. La implementación utiliza una combinación de operadores cuantizados (QOperator) y de formato QDQ (quantize-dequantize), lo que permite compatibilidad con ONNX Runtime. No se han proporcionado detalles sobre el dataset de calibración ni el proceso de entrenamiento adicional.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (objetos, animales, escenas, etc.).
- Inferencia eficiente en CPU y dispositivos con soporte de aceleración INT8, gracias a la cuantización.
- Compatibilidad con el ecosistema ONNX y ONNX Runtime, incluyendo ejecución en Python, C++, C#, JavaScript y otros.
- Entrada de imagen RGB de tamaño variable, aunque el modelo original espera tensores de forma (3, H, W) con H y W típicamente 224 según la documentación de ONNX Model Zoo.
- No soporta tool calling, agentes, generación de texto ni capacidades multimodales más allá de la visión.

## Casos de uso

- **Clasificación de imágenes en aplicaciones móviles**: al ser un modelo pequeño y cuantizado, puede integrarse en apps Android o iOS para reconocer objetos o escenas sin depender de una conexión a internet, gracias a su bajo consumo de memoria y CPU.
- **Sistemas de visión en el borde (edge computing)**: en dispositivos como cámaras IP, drones o robots, el modelo puede ejecutarse localmente para clasificar imágenes en tiempo real, reduciendo la latencia y el uso de ancho de banda.
- **Filtrado de contenido en galerías fotográficas**: se puede utilizar para etiquetar automáticamente las fotos de un usuario (por ejemplo, "paisaje", "comida", "persona") en aplicaciones de gestión de imágenes.
- **Control de calidad en fabricación**: clasificar productos o componentes según su apariencia visual en líneas de producción, con integración en sistemas de visión industrial que utilicen ONNX Runtime.
- **Asistencia a personas con discapacidad visual**: aplicaciones que describen el entorno clasificando objetos y escenas capturadas con la cámara, con inferencia local para proteger la privacidad.
- **Educación y prototipos**: como modelo de referencia para estudiar la cuantización de redes neuronales, el despliegue con ONNX Runtime y la comparación de rendimiento entre FP32 e INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de precisión (top-1, top-5) ni de latencia para esta versión cuantizada. Se recomienda consultar el paper original de ShuffleNetV2 para conocer el rendimiento de la arquitectura, aunque no se puede asumir que los valores coincidan exactamente con esta versión INT8.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un modelo pequeño (el archivo ONNX original de ShuffleNetV2 1.0 pesa alrededor de 9 MB), la inferencia INT8 puede ejecutarse en CPU sin necesidad de VRAM.
- **GPU recomendadas**: no es necesario una GPU para este modelo; cualquier CPU moderna puede ejecutarlo en milisegundos. Si se usa GPU, cualquier modelo con soporte INT8 (por ejemplo, RTX 20 series en adelante) funcionará.
- **Compatibilidad con GPU de consumo**: sí, es compatible con cualquier GPU NVIDIA, AMD o Intel con soporte de ONNX Runtime.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), ONNX.js para navegador, TensorFlow Lite (con conversión), o integración en aplicaciones C++/Python.
- **Latencia y throughput**: no se han publicado datos concretos. En una CPU típica de escritorio, la inferencia de una imagen de 224x224 debería completarse en decenas de milisegundos, pero no se puede confirmar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShuffleNetV2 1.0 INT8 (este) | no disponible | no aplica | no disponible | BSD-3-Clause | Hugging Face |
| ShuffleNetV2 1.0 FP32 (ONNX Model Zoo) | ~2.26 M (según paper) | no aplica | top-1 ~69.4% (paper) | Apache-2.0 | ONNX Model Zoo |
| MobileNetV2 1.0 | ~3.4 M | no aplica | top-1 ~71.8% (ImageNet) | Apache-2.0 | Varios repositorios |

Nota: los datos de parámetros y precisión de los modelos comparativos provienen de la literatura y no de la información proporcionada para este modelo. La comparativa es orientativa, no se dispone de mediciones directas de esta versión INT8.

## Limitaciones y advertencias

- **Cuantización INT8**: la cuantización puede reducir la precisión respecto al modelo FP32 original, aunque la pérdida suele ser pequeña. No se han publicado resultados de validación para esta versión concreta.
- **Sesgos de ImageNet**: el modelo hereda los sesgos presentes en el dataset ImageNet, que incluye categorías culturalmente sesgadas y desequilibrios en la representación de ciertos grupos.
- **Riesgo de alucinación**: como modelo discriminativo, no genera texto, pero puede producir clasificaciones erróneas si la imagen no pertenece a las categorías conocidas o está fuera de distribución.
- **Limitaciones de contexto**: no aplica, pero el modelo solo acepta imágenes y devuelve una distribución de probabilidad sobre 1000 clases.
- **Licencia**: la licencia BSD-3-Clause permite uso comercial y modificación, pero exige mantener el aviso de copyright y no utilizar los nombres de los contribuyentes para promocionar el producto sin permiso.
- **Compatibilidad**: el formato ONNX con opset 12 puede requerir una versión reciente de ONNX Runtime; se recomienda verificar la compatibilidad en el entorno de despliegue.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-int8-onnx)
- [Versión FP32 del mismo autor](https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-fp32-onnx)
- [Modelo original en ONNX Model Zoo](https://github.com/onnx/models/tree/4fec49841cb55a0b98dc8fad045431ccafd9f96/validated/vision/classification/shufflenet)
- [Repositorio ONNX Model Zoo](https://github.com/onnx/models)
- [Paper ShuffleNet V2](https://arxiv.org/abs/1807.11164)
- [Sitio web ONNX](https://onnx.ai/)
