# qualcomm/RegNet

## Resumen

RegNet es una familia de redes neuronales convolucionales (CNN) para clasificación de imágenes, propuesta originalmente en el artículo "Designing Network Design Spaces" (Radosavovic et al., 2020, arXiv:2003.13678). El modelo presentado aquí es una implementación de RegNet basada en la versión de TorchVision, adaptada y optimizada por Qualcomm para su ejecución eficiente en dispositivos con procesadores Snapdragon y otras plataformas de Qualcomm. Se puede utilizar tanto como clasificador de imágenes (entrenado en ImageNet) como backbone para construir modelos más complejos en tareas de visión por computador.

El repositorio de Hugging Face contiene los pesos pre-exportados en varios formatos (ONNX, QNN_DLC, TFLITE) y en dos precisiones (float y w8a8), listos para desplegar en dispositivos móviles o embebidos. El modelo tiene 15,3 millones de parámetros y un tamaño de 58,3 MB en float (15,4 MB en w8a8), lo que lo hace adecuado para entornos con recursos limitados. Su relevancia actual radica en la creciente demanda de modelos de visión eficientes para inferencia en el borde (edge AI), donde Qualcomm ofrece una cadena de herramientas completa para compilar, perfilar y ejecutar el modelo en sus NPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (RegNet, basada en diseño de espacios de red) |
| Parametros totales | 15,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | float (FP32) y w8a8 (pesos y activaciones en 8 bits) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados); también disponible en PyTorch (repo original) |

## Arquitectura y entrenamiento

RegNet pertenece a la familia de redes convolucionales diseñadas mediante un espacio de diseño parametrizado. El artículo original propone un método sistemático para explorar configuraciones de red (ancho, profundidad, grupos, etc.) y obtener arquitecturas eficientes en términos de FLOPs y precisión. La implementación concreta de este repositorio sigue la versión de TorchVision, que incluye variantes como RegNetX y RegNetY (con atención por canales). El checkpoint incluido está entrenado en el dataset ImageNet para clasificación de 1000 clases.

No se proporcionan detalles adicionales sobre el proceso de entrenamiento (número de épocas, aumentación de datos, etc.) en la información disponible. La adaptación de Qualcomm se centra en la exportación y optimización del modelo para ejecutarse en NPU, mediante herramientas como Qualcomm AI Hub Workbench, que compila el grafo a formatos como QNN_DLC o TFLITE con cuantización w8a8.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (entrada de 224x224 píxeles).
- Uso como backbone para tareas de visión por computador: detección de objetos, segmentación semántica, estimación de pose, etc.
- Extracción de características (embeddings) para búsqueda visual o sistemas de recomendación.
- Inferencia en tiempo real en dispositivos móviles y embebidos gracias a la optimización para NPU de Qualcomm.
- Soporte de exportación a múltiples formatos (ONNX, TFLITE, QNN_DLC) y precisiones (float, w8a8).
- No es un modelo generativo ni de lenguaje; no admite tool calling ni razonamiento multi-paso.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: por ejemplo, una app de identificación de plantas o de moderación de contenido que ejecuta el modelo localmente en el dispositivo, sin necesidad de conexión a internet. Su tamaño reducido (15,4 MB en w8a8) y su baja latencia (menos de 1 ms en Snapdragon 8 Elite) lo hacen viable para uso interactivo.
- Backbone para detección de objetos en tiempo real: integrar RegNet como extractor de características en una red como Faster R-CNN o YOLO, desplegada en un dron o cámara de seguridad con chip Snapdragon. La eficiencia computacional permite procesar vídeo a alta frecuencia.
- Búsqueda visual por similitud: usar las activaciones de la penúltima capa como embeddings para indexar imágenes en una base de datos vectorial, permitiendo búsqueda por contenido en un catálogo de productos desde el móvil.
- Segmentación semántica en agricultura de precisión: emplear RegNet como encoder en una arquitectura tipo U-Net para clasificar píxeles de cultivos o malezas, ejecutándose en un robot agrícola con hardware Qualcomm.
- Clasificación de imágenes médicas en dispositivos de bajo coste: por ejemplo, detección de retinopatía diabética a partir de fotografías de fondo de ojo, con el modelo corriendo en un dispositivo portátil en zonas sin conectividad.
- Aplicaciones de realidad aumentada: usar RegNet para reconocer objetos del entorno y superponer información virtual, aprovechando la baja latencia en NPU para mantener la fluidez de la experiencia.

## Benchmarks y rendimiento

No se han publicado resultados de precisión (top-1, top-5) en la información disponible. Sin embargo, la tabla de rendimiento de inferencia en dispositivos Qualcomm proporciona datos concretos de latencia y uso de memoria. Se muestran los valores más representativos:

| Chipset | Runtime | Precision | Inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 | ONNX | w8a8 | 0,513 | 88 |
| Snapdragon 8 Elite | ONNX | w8a8 | 0,547 | 88 |
| Snapdragon 8 Gen 3 | ONNX | w8a8 | 0,637 | 136 |
| Snapdragon X Elite | ONNX | w8a8 | 0,927 | 20 |
| Snapdragon 8 Gen 1 | ONNX | w8a8 | 1,298 | 133 |
| Snapdragon 8 Elite Gen 5 | ONNX | float | 0,834 | 77 |
| Snapdragon 8 Elite | ONNX | float | 0,995 | 76 |
| Snapdragon 8 Gen 3 | ONNX | float | 1,238 | 130 |
| Snapdragon X Elite | ONNX | float | 1,767 | 39 |

Estos datos indican que la versión cuantizada w8a8 reduce la latencia aproximadamente a la mitad en la mayoría de los chips, con un consumo de memoria muy bajo (entre 1 y 136 MB según el dispositivo). No se dispone de comparativas con otros modelos en términos de precisión.

## Requisitos de hardware

- VRAM estimada: el modelo es muy ligero; en formato float ocupa 58,3 MB y en w8a8 15,4 MB. Cualquier GPU moderna con al menos 1 GB de VRAM puede ejecutarlo sin problemas.
- GPU recomendadas: no requiere GPU de alta gama; puede ejecutarse en CPU, en GPUs integradas o en NPU de Qualcomm. Para desarrollo, una GPU de gama media (RTX 3060 o superior) es más que suficiente.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier dispositivo móvil con Snapdragon 6xx o superior, así como en placas como Raspberry Pi (con conversión a TFLite).
- Opciones de despliegue: ONNX Runtime, TensorFlow Lite, Qualcomm AI Hub (QNN), o mediante el SDK de Qualcomm AI Hub Workbench. También se puede usar en PyTorch directamente.
- Latencia y throughput: según la tabla anterior, la inferencia en NPU de Qualcomm oscila entre 0,5 y 3 ms por imagen, lo que permite procesar cientos de imágenes por segundo en dispositivos móviles.

## Comparativa con modelos similares

Se comparan tres modelos de clasificación de imágenes de tamaño similar, todos entrenados en ImageNet. No se dispone de datos de precisión para RegNet en esta información, por lo que la comparación se limita a parámetros y tamaño.

| Modelo | Parametros | Tamano (float) | Contexto | Licencia |
|---|---|---|---|---|
| RegNet (este) | 15,3 M | 58,3 MB | 224x224 | BSD-3-Clause |
| ResNet-18 | 11,7 M | 44,6 MB | 224x224 | BSD-3-Clause |
| MobileNetV2 | 3,4 M | 13,4 MB | 224x224 | Apache-2.0 |
| EfficientNet-B0 | 5,3 M | 20,5 MB | 224x224 | Apache-2.0 |

RegNet ofrece un equilibrio entre precisión y eficiencia, aunque sin datos de top-1 no se puede afirmar que supere a las alternativas. Su ventaja principal es la optimización específica para NPU de Qualcomm, que no está disponible en los otros modelos de forma nativa.

## Limitaciones y advertencias

- Modelo de visión únicamente: no genera texto, no procesa lenguaje natural ni admite entradas multimodales.
- Sesgos del dataset ImageNet: las clases están limitadas a las 1000 categorías de ImageNet, que pueden no cubrir dominios específicos y pueden contener sesgos culturales o geográficos.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo y no generativo.
- Limitaciones de contexto: no aplica, pero la resolución de entrada está fijada a 224x224; para otras resoluciones es necesario re-exportar el modelo con configuraciones personalizadas.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación, siempre que se mantenga el aviso de copyright. No hay restricciones de uso militar o de campo específico.
- Dependencia del ecosistema Qualcomm: los formatos QNN_DLC y las optimizaciones para NPU requieren herramientas de Qualcomm (AI Hub Workbench) y hardware compatible. En otras plataformas, el modelo puede ejecutarse con ONNX o TFLite, pero sin las mismas garantías de rendimiento.
- No se proporcionan métricas de precisión en la información disponible, por lo que no es posible evaluar su rendimiento real frente a otros modelos en tareas específicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualcomm/RegNet
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/regnet
- Repositorio de Qualcomm AI Hub Models (código fuente): https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/regnet
- Artículo original "Designing Network Design Spaces": https://arxiv.org/abs/2003.13678
- Implementación de TorchVision (referencia): https://github.com/pytorch/vision/blob/main/torchvision/models/regnet.py
