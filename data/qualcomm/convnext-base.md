# qualcomm/ConvNext-Base

## Resumen

ConvNext-Base es un modelo de clasificacion de imagenes basado en la arquitectura ConvNeXt, desarrollado por Qualcomm y publicado en su repositorio de modelos optimizados para dispositivos con chipsets Snapdragon y Dragonwing. El modelo clasifica imagenes del dataset ImageNet y tambien puede utilizarse como backbone para construir modelos mas complejos en tareas de vision por computador. Su relevancia radica en que ofrece pesos pre-exportados en formatos ONNX, QNN_DLC y TFLITE, listos para desplegar en hardware Qualcomm con tiempos de inferencia de entre 2 y 19 milisegundos segun el chipset, lo que lo convierte en una opcion practica para aplicaciones de vision en el borde.

El modelo se basa en la implementacion de torchvision y cuenta con 88,6 millones de parametros, una resolucion de entrada de 224x224 y un tamano de 338 MB en precision float (88,7 MB en cuantizacion w8a16). Esta optimizado para ejecutarse en la NPU de los dispositivos Qualcomm, aunque tambien puede exportarse con configuraciones personalizadas mediante la libreria Qualcomm AI Hub Models. La licencia es BSD-3-Clause, lo que permite uso comercial y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Base (red neuronal convolucional pura, basada en el paper arxiv:2201.03545) |
| Parametros totales | 88,6 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | float, w8a16 |
| Idiomas soportados | No disponible (modelo de vision, no procesa lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados); PyTorch (libreria) |

## Arquitectura y entrenamiento

ConvNeXt-Base es una red neuronal convolucional pura que adopta disenos inspirados en transformers, como kernels de convolucion grandes (7x7), normalizacion por capas y una estructura jerarquica de etapas. El modelo esta basado en la implementacion de torchvision y se entrena en el dataset ImageNet para clasificacion de 1000 categorias. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO, ya que la model card no proporciona esos datos. La innovacion principal de este repositorio no es la arquitectura en si, sino la optimizacion y exportacion de los pesos para ejecutarse eficientemente en la NPU de los dispositivos Qualcomm, con soporte para cuantizacion w8a16 que reduce el tamano del modelo de 338 MB a 88,7 MB sin una perdida significativa de precision.

## Capacidades

- Clasificacion de imagenes en 1000 categorias de ImageNet.
- Uso como backbone para tareas de vision por computador, como deteccion de objetos, segmentacion semantica o estimacion de pose, mediante extraccion de caracteristicas.
- Inferencia en tiempo real en dispositivos moviles y embebidos gracias a la optimizacion para NPU de Qualcomm.
- Soporte de cuantizacion w8a16 para reducir el uso de memoria y acelerar la inferencia.
- Exportacion a multiples formatos (ONNX, QNN_DLC, TFLITE) para integracion en diferentes runtimes.
- No incluye capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural, al ser un modelo exclusivamente visual.

## Casos de uso

- Clasificacion de imagenes en aplicaciones moviles: el modelo puede integrarse en apps Android o iOS para identificar objetos, plantas, animales o productos en tiempo real, gracias a su baja latencia (3-5 ms en chipsets Snapdragon 8 Gen 3 o superiores) y su compatibilidad con TFLITE.
- Moderacion de contenido visual: puede utilizarse como clasificador para filtrar imagenes inapropiadas en plataformas de contenido generado por usuarios, ejecutandose en el dispositivo para preservar la privacidad.
- Vision artificial en retail: clasificacion de productos en estanterias o inventario mediante camaras conectadas a dispositivos Qualcomm, con tiempos de inferencia de 4-7 ms que permiten procesamiento en tiempo real.
- Backbone para deteccion de objetos: sus caracteristicas pueden alimentar cabezales de deteccion como Faster R-CNN o YOLO, permitiendo construir sistemas de vigilancia o conteo de personas en hardware de bajo consumo.
- Diagnostico asistido por imagen en entornos remotos: clasificacion de imagenes medicas (por ejemplo, radiografias) en dispositivos portatiles, aunque requiere fine-tuning con datos especificos del dominio.
- Automatizacion industrial: inspeccion visual de piezas en lineas de produccion, donde el modelo puede ejecutarse en controladores con chipsets Qualcomm Dragonwing, ofreciendo latencias de 2-12 ms segun el modelo de chip.

## Benchmarks y rendimiento

No se han publicado resultados de precision (top-1 o top-5) en la informacion disponible. Sin embargo, la model card incluye una tabla de rendimiento de inferencia en distintos chipsets Qualcomm, que se reproduce a continuacion como referencia de latencia y uso de memoria.

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| ConvNext-Base | ONNX | float | Snapdragon X2 Elite | 3,533 | 2 - 2 | NPU |
| ConvNext-Base | ONNX | float | Snapdragon X Elite | 7,227 | 176 - 176 | NPU |
| ConvNext-Base | ONNX | float | Snapdragon 8 Gen 3 Mobile | 5,353 | 1 - 313 | NPU |
| ConvNext-Base | ONNX | float | Snapdragon 8 Gen 1 Mobile | 19,291 | 1 - 302 | NPU |
| ConvNext-Base | ONNX | float | Qualcomm Dragonwing IQ-8275 | 12,11 | 0 - 4 | NPU |
| ConvNext-Base | ONNX | float | Qualcomm Dragonwing QCS8550 (Proxy) | 7,16 | 0 - 194 | NPU |
| ConvNext-Base | ONNX | float | Qualcomm QCS8450 | 19,291 | 1 - 302 | NPU |
| ConvNext-Base | ONNX | float | Qualcomm Dragonwing IQ-9075 | 10,743 | 0 - 4 | NPU |
| ConvNext-Base | ONNX | float | Qualcomm Dragonwing IQ-X7181 | 7,227 | 176 - 176 | NPU |
| ConvNext-Base | ONNX | float | Qualcomm Dragonwing Q-8750 | 4,119 | 0 - 185 | NPU |
| ConvNext-Base | ONNX | float | Snapdragon 8 Elite Mobile | 4,119 | 0 - 185 | NPU |
| ConvNext-Base | ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 3,203 | 0 - 186 | NPU |
| ConvNext-Base | ONNX | w8a16 | Snapdragon X2 Elite | 2,397 | 1 - 1 | NPU |
| ConvNext-Base | ONNX | w8a16 | Snapdragon X Elite | 4,99 | 91 - 91 | NPU |
| ConvNext-Base | ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 3,435 | 0 - 261 | NPU |
| ConvNext-Base | ONNX | w8a16 | Snapdragon 8 Gen 1 Mobile | 7,969 | 0 - 260 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing QCS6490 | 32,979 | 0 - 3 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing IQ-8275 | 4,902 | 0 - 4 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing QCS8550 (Proxy) | 4,86 | 0 - 4 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm QCS8450 | 7,969 | 0 - 260 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing IQ-9075 | 4,884 | 0 - 3 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing IQ-X7181 | 4,99 | 91 - 91 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing Q-6690 | 58,22 | 0 - 403 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing Q-7790 | 6,894 | 0 - 259 | NPU |
| ConvNext-Base | ONNX | w8a16 | Qualcomm Dragonwing Q-8750 | 2,78 | 0 - 205 | NPU |
| ConvNext-Base | ONNX | w8a16 | Snapdragon 8 Elite Mobile | (dato no disponible en la informacion) | - | NPU |

## Requisitos de hardware

- El modelo esta optimizado para la NPU de chipsets Qualcomm, incluyendo Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite y Dragonwing (QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790, Q-8750).
- En precision float, el modelo ocupa 338 MB; en cuantizacion w8a16, 88,7 MB. La memoria pico durante la inferencia varia entre 1 y 403 MB segun el chipset y la precision.
- No se requieren GPUs de servidor; el modelo esta disenado para ejecutarse en dispositivos de borde con NPU Qualcomm. No hay datos sobre ejecucion en GPUs de escritorio o servidores.
- Opciones de despliegue: descarga de pesos pre-exportados en ONNX, QNN_DLC o TFLITE, o exportacion personalizada mediante la libreria Qualcomm AI Hub Models. Los runtimes soportados incluyen QAIRT 2.45 y ONNX Runtime 1.27.1.
- La latencia varia entre 2,4 ms (w8a16 en Snapdragon X2 Elite) y 58,2 ms (w8a16 en Dragonwing Q-6690), lo que permite aplicaciones en tiempo real en la mayoria de los chipsets listados.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. ConvNeXt-Base pertenece a la familia ConvNeXt, que incluye variantes como ConvNeXt-Tiny (28M parametros), ConvNeXt-Small (50M) y ConvNeXt-Large (198M), pero no se han publicado resultados de precision ni comparaciones con otros modelos en la model card. Como referencia cualitativa, ConvNeXt-Base (88,6M parametros) es comparable en tamano a modelos clasicos como ResNet-101 (44,5M) o EfficientNet-B5 (30M), aunque su arquitectura moderna suele ofrecer mejor equilibrio entre precision y coste computacional. Para una comparativa cuantitativa rigurosa, se recomienda consultar el paper original (arxiv:2201.03545) o ejecutar el modelo en el hardware objetivo.

## Limitaciones y advertencias

- El modelo esta entrenado en ImageNet, por lo que puede presentar sesgos hacia las categorias y distribuciones de ese dataset, y puede no generalizar bien a dominios muy diferentes sin fine-tuning.
- No procesa texto ni lenguaje natural; es exclusivamente un modelo de vision.
- La informacion disponible no incluye datos sobre precision top-1 o top-5, por lo que no es posible evaluar su exactitud real en tareas de clasificacion.
- La optimizacion esta orientada a hardware Qualcomm; ejecutar el modelo en otras plataformas (GPU NVIDIA, CPU x86) puede requerir conversion adicional y no se garantiza el mismo rendimiento.
- La cuantizacion w8a16 puede introducir una ligera perdida de precision, aunque no se cuantifica en la documentacion.
- El repositorio no proporciona pesos en formato safetensors ni GGUF; los formatos disponibles son ONNX, QNN_DLC y TFLITE, ademas del codigo fuente PyTorch.
- La licencia BSD-3-Clause permite uso comercial, pero es recomendable revisar los terminos de la licencia de los pesos originales de torchvision y del dataset ImageNet si se utiliza con fines comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/ConvNext-Base
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/convnext_base
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/convnext_base
- Paper original de ConvNeXt: https://arxiv.org/abs/2201.03545
- Implementacion de torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/convnext.py
