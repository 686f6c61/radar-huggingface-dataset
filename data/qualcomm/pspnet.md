# qualcomm/PSPNet

## Resumen

PSPNet (Pyramid Scene Parsing Network) es un modelo de segmentacion semantica desarrollado originalmente por el grupo de investigacion de Hengshuang Zhao y colaboradores, y posteriormente optimizado por Qualcomm para su despliegue en dispositivos con chipsets Snapdragon y Dragonwing. El modelo resuelve el problema de comprension de escenas mediante la agregacion de informacion de contexto global a multiples escalas, utilizando un modulo de pyramid pooling que captura caracteristicas contextuales de distintas regiones de la imagen.

Esta version publicada por Qualcomm en HuggingFace contiene pesos pre-exportados en formatos ONNX, QNN_DLC y TFLITE, optimizados para ejecucion en la NPU de los procesadores Qualcomm. El modelo se basa en un backbone ResNet-101, tiene 65,7 millones de parametros y acepta imagenes de entrada de 473x473 pixeles. Su tamano en float es de 251 MB y el repositorio ocupa 1,5 GB. La licencia MIT permite uso comercial sin restricciones.

La relevancia actual de este modelo radica en su capacidad para ejecutarse en dispositivos moviles y embebidos de gama alta, ofreciendo segmentacion semantica en tiempo real o casi real sobre hardware Qualcomm, lo que lo hace util para aplicaciones de realidad aumentada, conduccion asistida y analisis de escenas en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PSPNet (Pyramid Scene Parsing Network) con backbone ResNet-101 |
| Parametros totales | 65,7 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, entrada de imagen 1x3x473x473) |
| Tipos de cuantizacion | float (ONNX, QNN_DLC, TFLITE); no se documentan cuantizaciones int8 o int16 |
| Idiomas soportados | no aplicable (modelo de vision sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repo), ONNX, QNN_DLC, TFLITE (pre-exportados) |

## Arquitectura y entrenamiento

PSPNet emplea una arquitectura de segmentacion semantica basada en un backbone ResNet-101 que extrae caracteristicas de la imagen, seguido de un modulo de pyramid pooling (PPM). Este modulo divide el mapa de caracteristicas en diferentes tamanos de regiones (tipicamente 1x1, 2x2, 3x3 y 6x6) y aplica pooling adaptativo sobre cada una, para despues fusionar las representaciones contextuales de todas las escalas. Esta agregacion de contexto global permite al modelo distinguir objetos ambiguos que requieren informacion de la escena completa, como distinguir un avion de un pajaro en el cielo o un coche de una ventana en un edificio.

El checkpoint incluido es `pspnet101_ade20k.pth`, lo que indica que el modelo fue entrenado sobre el dataset ADE20K, un conjunto de datos de segmentacion semantica con 150 categorias de objetos y escenas, que incluye imagenes de interiores y exteriores. No se documenta en la informacion disponible el numero exacto de epocas, el tamano del dataset ni si se aplicaron tecnicas de aumento de datos adicionales. Qualcomm ha realizado un trabajo de optimizacion y exportacion del modelo para diferentes runtimes (ONNX, QNN_DLC y TFLITE), pero no se detallan innovaciones tecnicas adicionales sobre la arquitectura original.

## Capacidades

- Segmentacion semantica pixel a nivel de imagen completa, asignando una categoria semantica a cada pixel de la entrada.
- Comprension de escenas con agregacion de contexto global a multiples escalas mediante pyramid pooling.
- Deteccion de objetos en 150 categorias del dataset ADE20K, incluyendo elementos de interiores (muebles, electrodomesticos) y exteriores (vehiculos, vegetacion, edificios).
- Ejecucion optimizada en NPU de chipsets Qualcomm (Snapdragon y Dragonwing) con soporte para runtimes ONNX, QNN_DLC y TFLITE.
- Despliegue en Android mediante las guias de integracion proporcionadas por Qualcomm AI Hub.
- Exportacion con configuraciones personalizadas (pesos fine-tuned, formas de entrada, dispositivos objetivo) mediante la libreria Python de Qualcomm AI Hub Models.

## Casos de uso

- Conduccion asistida y ADAS: el modelo puede segmentar la escena de la carretera en tiempo real, identificando carriles, vehiculos, peatones y senales de trafico. Su ejecucion en la NPU de chipsets como el Snapdragon 8 Elite (651 ms por inferencia en ONNX) lo hace viable para sistemas embebidos de automocion.
- Realidad aumentada en movil: aplicaciones de AR que necesitan comprender la geometria y los objetos de la escena para anclar objetos virtuales. La integracion con Android y el formato TFLITE permiten su despliegue directo en apps moviles.
- Analisis de imagenes medicas en el borde: aunque el modelo esta entrenado en ADE20K, puede fine-tuningarse con datos medicos para segmentacion de organos o tejidos. La licencia MIT y la exportacion con pesos personalizados facilitan esta adaptacion.
- Vigilancia y monitorizacion de espacios: segmentacion de escenas de camaras de seguridad para identificar personas, vehiculos u objetos en entornos controlados, ejecutable en dispositivos embebidos Qualcomm Dragonwing.
- Agricultura de precision: segmentacion de imagenes aereas o de drones para clasificar cultivos, suelo y vegetacion. El modelo puede ejecutarse en plataformas como el Dragonwing IQ-9075 con picos de memoria de solo 8-13 MB en formato QNN_DLC.
- Robotica y navegacion autonoma: robots de interior que necesitan comprender su entorno para evitar obstaculos y planificar rutas. La latencia de 832 ms en Snapdragon X2 Elite (ONNX) permite ciclos de decision relativamente rapidos en plataformas robotizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (mIoU, pixel accuracy, etc.) en la informacion disponible. Sin embargo, la model card incluye datos de rendimiento de inferencia en diferentes chipsets Qualcomm, que se resumen a continuacion:

| Runtime | Precision | Chipset | Inferencia (ms) | Pico de memoria (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 832,612 | 528 | NPU |
| ONNX | float | Snapdragon X Elite | 1335,437 | 267 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 954,711 | 0-1844 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 2247,017 | 47-904 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 651,51 | 119-1591 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 718,505 | 135-1731 | NPU |
| ONNX | float | Qualcomm Dragonwing Q-8750 | 651,51 | 119-1591 | NPU |
| ONNX | float | Qualcomm Dragonwing IQ-8275 | 1394,431 | 14-20 | NPU |
| ONNX | float | Qualcomm Dragonwing IQ-9075 | 1418,156 | 8-13 | NPU |
| ONNX | float | Qualcomm Dragonwing IQ-X7181 | 1335,437 | 267 | NPU |
| QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 1837,963 | 55-1708 | NPU |
| QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 1601,931 | 1-851 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite Mobile | 2168,014 | 0-1311 | NPU |
| QNN_DLC | float | Snapdragon X2 Elite | 2495,773 | 3 | NPU |
| QNN_DLC | float | Snapdragon X Elite | 2538,555 | 3 | NPU |
| QNN_DLC | float | Qualcomm Dragonwing Q-8750 | 2168,014 | 0-1311 | NPU |
| QNN_DLC | float | Qualcomm Dragonwing IQ-8275 | 2523,411 | 3-136 | NPU |
| QNN_DLC | float | Qualcomm Dragonwing IQ-9075 | 3340,187 | 5-137 | NPU |
| QNN_DLC | float | Qualcomm Dragonwing IQ-X7181 | 2538,555 | 3 | NPU |
| QNN_DLC | float | Qualcomm SA8295P | 1365,366 | 3-647 | NPU |
| QNN_DLC | float | Qualcomm SA8650P | 2615,805 | 2-1307 | NPU |
| QNN_DLC | float | Qualcomm SA8255P | 2615,805 | 2-1307 | NPU |
| QNN_DLC | float | Qualcomm SA7255P | 5283,318 | 2-1307 | NPU |
| QNN_DLC | float | Qualcomm SA8775P | 2615,805 | 2-1307 | NPU |
| TFLITE | float | Snapdragon 8 Gen 3 Mobile | 2112,072 | 127-1832 | NPU |
| TFLITE | float | Snapdragon 8 Gen 1 Mobile | 1877,964 | 24-953 | NPU |
| TFLITE | float | Qualcomm Dragonwing IQ-8275 | 2876,19 | 0-276 | NPU |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float ocupa 251 MB en disco. El pico de memoria durante inferencia varia segun el chipset y runtime, desde 3 MB (QNN_DLC en Snapdragon X2 Elite) hasta 1844 MB (ONNX en Snapdragon 8 Gen 3 Mobile).
- GPU recomendadas: no aplica directamente, ya que el modelo esta optimizado para la NPU de chipsets Qualcomm. Para ejecucion en GPU de proposito general, se puede usar el formato ONNX con CUDA, pero no se documentan metricas de rendimiento en GPU.
- Compatibilidad con GPU de consumo: no se documenta soporte especifico para GPUs de consumo (RTX, etc.), aunque el formato ONNX es portable a cualquier runtime compatible.
- Opciones de despliegue: Qualcomm AI Hub Workbench para compilacion y perfilado, integracion en Android via TFLITE o QNN (.so), y la libreria Python `qai_hub_models` para exportacion personalizada.
- Latencia y throughput: los tiempos de inferencia varian entre 651 ms (ONNX en Snapdragon 8 Elite) y 5283 ms (QNN_DLC en SA7255P) para una sola imagen de 473x473. No se documenta throughput en modo batch.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset | Licencia | Despliegue |
|---|---|---|---|---|---|
| PSPNet (Qualcomm) | 65,7M | 473x473 | ADE20K | MIT | ONNX, QNN_DLC, TFLITE |
| DeepLabV3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| U-Net | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento (mIoU, accuracy) entre PSPNet y otros modelos de segmentacion como DeepLabV3 o U-Net. La comparativa se limita a las caracteristicas documentadas del modelo Qualcomm.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ADE20K, por lo que su capacidad de generalizacion a dominios fuera de ese dataset (imagenes medicas, satelitales, industriales) es limitada sin fine-tuning.
- La resolucion de entrada esta fijada en 473x473, lo que puede perder detalles finos en imagenes de alta resolucion. No se documenta soporte para resoluciones mayores.
- No se documentan cuantizaciones de precision reducida (int8, int16), lo que limita las opciones de optimizacion de memoria y velocidad en dispositivos con recursos limitados.
- Los tiempos de inferencia reportados son para una sola imagen; no se documenta rendimiento en modo batch ni en aplicaciones de video en tiempo real.
- El modelo no procesa texto ni audio; es exclusivamente un modelo de vision.
- Aunque la licencia MIT permite uso comercial, el despliegue optimizado esta orientado a hardware Qualcomm. En otras plataformas (GPU NVIDIA, CPU x86) el rendimiento puede ser significativamente inferior y no esta documentado.
- No se proporcionan datos sobre sesgos del modelo ni sobre su comportamiento en condiciones de iluminacion adversa, oclusiones o imagenes de baja calidad.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/PSPNet
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/pspnet
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/qai_hub_models/models/pspnet
- README en GitHub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/pspnet/README.md
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
