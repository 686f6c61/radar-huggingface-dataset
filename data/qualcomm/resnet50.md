# qualcomm/ResNet50

## Resumen

ResNet50 es una red neuronal convolucional profunda para clasificación de imágenes, desarrollada originalmente por Microsoft Research y publicada en 2015. Esta variante concreta, publicada por Qualcomm, ofrece pesos pre-exportados y optimizados para ejecución en dispositivos con chipsets Snapdragon y Dragonwing, utilizando la NPU integrada. El modelo resuelve el problema de clasificación de imágenes sobre el dataset ImageNet y, además, puede emplearse como backbone para construir modelos más complejos de detección de objetos, segmentación o extracción de características.

La arquitectura introduce bloques residuales con conexiones de atajo que permiten entrenar redes de 50 capas sin degradación del gradiente. El modelo tiene 25,5 millones de parámetros y acepta entradas de 224x224 píxeles. Su relevancia actual radica en su eficiencia para despliegue en dispositivos móviles y embebidos, con tiempos de inferencia inferiores a 2 ms en hardware Qualcomm de gama alta, y en su disponibilidad en múltiples formatos de exportación (ONNX, TFLite, QNN_DLC) con cuantización w8a8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional residual (ResNet) con 50 capas, bloques residuales con conexiones de atajo |
| Parametros totales | 25,5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float32, w8a8 (cuantizacion de pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, TFLite, QNN_DLC (tambien safetensors en el repositorio de HuggingFace) |

## Arquitectura y entrenamiento

ResNet50 sigue la arquitectura clasica de redes residuales propuesta en el articulo "Deep Residual Learning for Image Recognition" (arXiv:1512.03385). Se compone de una capa convolucional inicial, seguida de cuatro etapas de bloques residuales con cuellos de botella (bottleneck), y una capa totalmente conectada final para clasificacion. Cada bloque residual incluye una conexion de atajo que suma la entrada a la salida del bloque, lo que mitiga el problema de desvanecimiento del gradiente en redes profundas.

El modelo esta preentrenado en el dataset ImageNet-1k, que contiene 1,28 millones de imagenes etiquetadas en 1000 clases. No se dispone de informacion detallada sobre el proceso de entrenamiento (numero de epocas, optimizador, tecnicas de regularizacion) en la documentacion proporcionada. La implementacion base proviene de torchvision, y Qualcomm ha adaptado los pesos para su ejecucion eficiente en hardware propio, incluyendo versiones cuantizadas w8a8 que reducen el tamaño del modelo de 97,4 MB a 25,1 MB.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet (objetos, animales, escenas, etc.).
- Extraccion de caracteristicas: las activaciones de las capas intermedias pueden usarse como representaciones vectoriales para tareas de transfer learning.
- Backbone para modelos de deteccion de objetos, segmentacion semantica o estimacion de pose, al proporcionar mapas de caracteristicas multiescala.
- Inferencia en tiempo real en dispositivos moviles y embebidos gracias a la optimizacion para NPU de Qualcomm.
- Soporte de cuantizacion w8a8 para reducir latencia y consumo de memoria sin perdida significativa de precision.
- Exportacion a multiples formatos (ONNX, TFLite, QNN_DLC) para integracion en distintos entornos de despliegue.

## Casos de uso

- Clasificacion de imagenes en aplicaciones moviles: el modelo puede integrarse en apps de Android o iOS para reconocer objetos, plantas, animales o productos en tiempo real, con latencias de 0,4-3 ms en chipsets Snapdragon modernos.
- Moderacion de contenido visual: clasificar imagenes subidas por usuarios en redes sociales o plataformas de contenido para detectar categorias prohibidas o inapropiadas, ejecutandose en el dispositivo para preservar privacidad.
- Sistemas de recomendacion visual: extraer caracteristicas de imagenes de productos para buscar similitudes o agrupar items en tiendas online, usando el modelo como backbone de un sistema de embedding.
- Vision industrial en edge: inspeccion de calidad en fabricas mediante clasificacion de defectos en piezas, desplegado en dispositivos Qualcomm Dragonwing con tiempos de inferencia inferiores a 4 ms.
- Asistencia para personas con discapacidad visual: aplicaciones que describen el entorno capturando imagenes y clasificando objetos, con ejecucion local para funcionar sin conexion.
- Investigacion academica: como backbone en experimentos de transfer learning o como punto de partida para fine-tuning en datasets especificos, gracias a su licencia permisiva y disponibilidad de pesos en formato PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (ImageNet top-1, top-5) en la informacion disponible. Sin embargo, la model card incluye una tabla de rendimiento de inferencia en distintos chipsets de Qualcomm, que se reproduce a continuacion:

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Pico de memoria (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 0,979 | 2 - 2 | NPU |
| ONNX | float | Snapdragon X Elite | 1,925 | 50 - 50 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 1,461 | 0 - 81 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 3,181 | 0 - 63 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 1,211 | 0 - 53 | NPU |
| ONNX | w8a8 | Snapdragon X2 Elite | 0,410 | 1 - 1 | NPU |
| ONNX | w8a8 | Snapdragon X Elite | 0,831 | 25 - 25 | NPU |
| ONNX | w8a8 | Snapdragon 8 Gen 3 Mobile | 0,678 | 0 - 84 | NPU |
| ONNX | w8a8 | Snapdragon 8 Gen 1 Mobile | 1,210 | 0 - 86 | NPU |
| ONNX | w8a8 | Snapdragon 8 Elite Mobile | 0,578 | 0 - 50 | NPU |

Estos datos corresponden a la version v0.61.0 de Qualcomm AI Hub Models. No se incluyen comparaciones con otros modelos de clasificacion.

## Requisitos de hardware

- Inferencia en dispositivos Qualcomm: el modelo esta optimizado para ejecutarse en la NPU de chipsets Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite) y Dragonwing (QCS6490, QCS8450, IQ-8275, etc.). No requiere GPU externa.
- Memoria: el modelo float ocupa 97,4 MB y la version w8a8 25,1 MB. El pico de memoria durante inferencia varia entre 1 y 218 MB segun el chipset y la precision, por lo que cabe en dispositivos con poca RAM.
- GPU de proposito general: aunque no se proporcionan datos de VRAM, al ser un modelo de 25,5 millones de parametros, puede ejecutarse en GPUs consumer como RTX 3060 o superiores con menos de 2 GB de VRAM en precision float32.
- Opciones de despliegue: los formatos ONNX y TFLite permiten usar runtimes como ONNX Runtime, TensorFlow Lite o llama.cpp (aunque este ultimo no es habitual para vision). Para hardware Qualcomm, se recomienda usar Qualcomm AI Hub Workbench o el SDK QAIRT.
- Latencia: en NPU de Qualcomm, la latencia oscila entre 0,4 ms (w8a8 en Snapdragon X2 Elite) y 6,5 ms (w8a8 en Dragonwing Q-6690), lo que permite procesamiento en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Sin embargo, se puede comparar cualitativamente con otras variantes de ResNet:

| Modelo | Parametros | Tamaño (float) | Contexto | Licencia |
|---|---|---|---|---|
| ResNet50 (Qualcomm) | 25,5 M | 97,4 MB | 224x224 | BSD-3-Clause |
| ResNet18 (torchvision) | 11,7 M | ~45 MB | 224x224 | BSD-3-Clause |
| ResNet101 (torchvision) | 44,5 M | ~170 MB | 224x224 | BSD-3-Clause |

ResNet50 ofrece un equilibrio entre precision y coste computacional, siendo mas preciso que ResNet18 y mas ligero que ResNet101. La ventaja especifica de esta version de Qualcomm es su optimizacion para hardware movil, con formatos pre-exportados y cuantizacion w8a8 que no estan disponibles en las versiones estandar de torchvision.

## Limitaciones y advertencias

- Sesgos de ImageNet: el modelo hereda los sesgos presentes en el dataset ImageNet, que sobredimensiona categorias occidentales y puede tener representacion insuficiente de ciertas culturas o contextos.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir errores de clasificacion con confianza alta en imagenes fuera de distribucion o adversarias.
- Limitaciones de contexto: solo acepta imagenes de 224x224 píxeles; imagenes de mayor resolucion requieren redimensionamiento previo, lo que puede perder detalles finos.
- Restricciones de licencia: la licencia BSD-3-Clause permite uso comercial y modificacion, pero exige mantener el aviso de copyright. No hay restricciones de uso militar o de vigilancia.
- Dependencia de hardware Qualcomm: los formatos QNN_DLC y las optimizaciones de rendimiento estan pensados para chipsets Qualcomm; en otras plataformas (NVIDIA, Apple) el rendimiento puede ser inferior o requerir conversion.
- Version del modelo: el repositorio indica una actualizacion en 2026, pero no se especifican cambios respecto a la version original de torchvision; se recomienda verificar la reproducibilidad de los resultados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/ResNet50
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/resnet50
- Repositorio de Qualcomm AI Hub Models en GitHub: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/resnet50
- Implementacion base en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/resnet.py
- Paper original de ResNet: https://arxiv.org/abs/1512.03385
