# qualcomm/EfficientNet-V2-s

## Resumen

EfficientNet-V2-s es una red neuronal convolucional (CNN) disenada para clasificacion de imagenes, publicada por Qualcomm como un paquete de artefactos pre-exportados y optimizados para ejecutarse en la NPU de sus dispositivos (Snapdragon y Dragonwing). El modelo clasifica imagenes del dataset ImageNet (1000 clases) y puede utilizarse tambien como backbone para construir modelos mas complejos, siguiendo la implementacion de referencia de torchvision.

La relevancia de esta ficha concreta no esta en la arquitectura en si, sino en el empaquetado de despliegue: Qualcomm distribuye los pesos compilados para varios runtimes (ONNX, QNN_DLC y TFLite) y en distintas precisiones (float y w8a16), de modo que un desarrollador puede ejecutar la inferencia directamente en hardware Qualcomm sin pasar por el proceso completo de conversion y calibracion. El modelo tiene 21,4 millones de parametros, una resolucion de entrada fija de 384x384 pixeles y ocupa 81,7 MB en float o 27,2 MB en w8a16.

Se trata de un modelo de vision, no de un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes y no tiene ventana de contexto en el sentido de los LLM. La informacion disponible procede de la model card oficial de Qualcomm y de la pagina de Qualcomm AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (EfficientNetV2-s, familia EfficientNetV2) |
| Parametros totales | 21,4 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de vision con entrada fija de 384x384 px) |
| Tipos de cuantizacion | float y w8a16 |
| Idiomas soportados | no aplica (tarea de clasificacion de imagenes) |
| Licencia | bsd-3-clause |
| Formato de pesos | ONNX, QNN_DLC, TFLite y checkpoint PyTorch original |
| Resolucion de entrada | 384x384 px |
| Dataset de entrenamiento | ImageNet |
| Tamano del modelo | 81,7 MB (float) / 27,2 MB (w8a16) |
| Pipeline | image-classification |
| Tamano del repositorio | 5,9 GB |

## Arquitectura y entrenamiento

EfficientNetV2-s es una red convolucional perteneciente a la familia EfficientNetV2, descrita en el paper arXiv:2104.00298. La arquitectura combina bloques convolucionales de tipo fused-MBConv en las etapas iniciales y bloques MBConv en las etapas finales, con el objetivo de mejorar la eficiencia de entrenamiento manteniendo una buena relacion entre precision y coste computacional. La implementacion de referencia sobre la que se basa este repositorio es la de torchvision (`torchvision/models/efficientnet.py`).

El checkpoint distribuido corresponde al entrenamiento sobre ImageNet. No se detalla en la informacion disponible el numero exacto de tokens o imagenes vistas, la composicion completa del dataset mas alla de ImageNet, ni si hubo etapas de ajuste fino adicionales. Al tratarse de un modelo de vision supervisado, no se aplican tecnicas de RLHF ni DPO propias de los modelos de lenguaje. La innovacion destacable de esta publicacion concreta es el proceso de exportacion y compilacion llevado a cabo con Qualcomm AI Hub Workbench, que genera artefactos optimizados para NPU y distintos niveles de precision.

## Capacidades

- Clasificacion de imagenes en las 1000 clases de ImageNet.
- Uso como backbone para extraccion de caracteristicas y para construir modelos de vision mas complejos (deteccion, segmentacion, clasificacion especializada).
- Ejecucion acelerada en NPU de dispositivos Qualcomm (Snapdragon, Dragonwing) con latencias de milisegundos.
- Exportacion personalizada mediante la libreria Qualcomm AI Hub Models, incluyendo pesos ajustados, formas de entrada propias y configuraciones de dispositivo y runtime.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): unicamente vision, en la tarea de clasificacion de imagenes.

## Casos de uso

- Clasificacion de imagenes en el dispositivo: el modelo puede etiquetar fotografias localmente en un movil o terminal con Snapdragon, con tiempos de inferencia de entre 2 y 16 ms segun el chipset, evitando enviar la imagen a la nube.
- Etiquetado automatico en aplicaciones de galeria: permite organizar grandes bibliotecas fotograficas por categoria directamente en el terminal, con consumo de memoria pico que en varios dispositivos se mantiene por debajo de 200 MB.
- Backbone para modelos personalizados: al ser exportable con pesos ajustados, sirve como extractor de caracteristicas para tareas especificas (deteccion de defectos, clasificacion medica, reconocimiento de productos) entrenadas sobre dominios propios.
- Preprocesado en pipelines de vision industrial: en dispositivos Dragonwing orientados a IoT y edge, la inferencia en NPU a 5-8 ms permite integrar el clasificador en lineas de produccion con requisitos de baja latencia.
- Moderacion de contenido visual en el edge: clasificacion previa de imagenes antes de subirlas a un servicio, reduciendo coste de red y ancho de banda.
- Analisis en tiempo real en camaras y dispositivos embebidos: la combinacion de resolucion 384x384 y ejecucion en NPU permite clasificar fotogramas de video a frecuencias altas sin sobrecargar la CPU.
- Aplicaciones de accesibilidad: descripcion o categorizacion rapida de escenas captadas por la camara del dispositivo para asistencia a personas con discapacidad visual.

## Benchmarks y rendimiento

La informacion proporcionada no incluye metricas de precision (top-1/top-5) sobre ImageNet ni otros benchmarks academicos como MMLU, HumanEval o GSM8K, que ademas no aplican a un clasificador de imagenes. Los datos disponibles son medidas de latencia de inferencia y memoria pico recogidas por Qualcomm AI Hub. Se reproduce una seleccion representativa a continuacion.

| Dispositivo | Runtime | Precision | Unidad de computo | Tiempo de inferencia (ms) | Rango de memoria pico (MB) |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | NPU | 2,252 | 0 - 197 |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | float | NPU | 3,07 | 0 - 194 |
| Snapdragon X2 Elite | ONNX | float | NPU | 2,958 | 2 - 2 |
| Snapdragon X Elite | ONNX | float | NPU | 5,578 | 46 - 46 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | NPU | 4,076 | 0 - 167 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | NPU | 11,185 | 1 - 196 |
| Dragonwing IQ-8275 | ONNX | float | NPU | 8,09 | 2 - 7 |
| QCS8450 | ONNX | float | NPU | 11,185 | 1 - 196 |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a16 | NPU | 1,996 | 0 - 165 |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | w8a16 | NPU | 2,54 | 0 - 163 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | NPU | 3,656 | 0 - 205 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a16 | NPU | 6,779 | 1 - 219 |
| QCS6490 | ONNX | w8a16 | NPU | 16,79 | 1 - 4 |
| Dragonwing IQ-8275 | ONNX | w8a16 | NPU | 5,132 | 1 - 5 |

No se han publicado resultados de precision (exactitud de clasificacion) en la informacion disponible.

## Requisitos de hardware

- No es un modelo generativo: no requiere VRAM en el sentido de un LLM. El modelo completo ocupa 81,7 MB en float y 27,2 MB en w8a16, por lo que cabe holgadamente en memoria de dispositivos moviles y embebidos.
- Hardware objetivo: NPU de Qualcomm. El modelo esta compilado y perfilado para Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite y 8 Elite Gen 5, Snapdragon X Elite y X2 Elite, y plataformas Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8550, QCS8450, QCS6490).
- Memoria pico observada: desde tan solo 2 MB en Snapdragon X2 Elite y Dragonwing IQ-9075 hasta aproximadamente 197-219 MB en los Snapdragon moviles de generaciones anteriores.
- Latencia: entre 1,996 ms (w8a16 en Snapdragon 8 Elite Gen 5) y 16,79 ms (w8a16 en QCS6490) segun el modelo de la tabla de rendimiento.
- GPU de escritorio (A100, H100, RTX 4090): no se proporcionan datos. El paquete esta orientado a NPU Qualcomm; su ejecucion en otros aceleradores requeriria recompilar o reexportar desde el checkpoint PyTorch.
- Opciones de despliegue: artefactos pre-exportados en ONNX (float, w8a16), QNN_DLC (float, w8a16) y TFLite (float); exportacion personalizada mediante la libreria Qualcomm AI Hub Models y Qualcomm AI Hub Workbench (QAIRT 2.50, ONNX Runtime 1.30.0).
- Throughput estimado: no disponible de forma explicita; con latencias de 2-16 ms por inferencia, el throughput teorico por unidad es de decenas a cientos de imagenes por segundo, pero no se detalla una medicion agregada.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de otros backbones comparables (por ejemplo, MobileNetV3, EfficientNet-B0 o ResNet-50) sobre el mismo hardware, ni sus cifras de precision. Por ello no es posible establecer una comparativa numerica fiable.

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| qualcomm/EfficientNet-V2-s | 21,4 M | 384x384 | bsd-3-clause | HuggingFace + Qualcomm AI Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

Se puede senalar como referencia estructural que EfficientNetV2-s se situa en el rango de backbones ligeros, con 21,4 M de parametros, dentro de una familia que va desde variantes menores hasta configuraciones mas grandes, pero no hay datos en la informacion disponible para contrastar precision frente a esas alternativas.

## Limitaciones y advertencias

- Ambito de clasificacion limitado: las clases corresponden a las 1000 categorias de ImageNet; no reconoce categorias fuera de ese conjunto a menos que se ajuste el modelo.
- Sin datos de precision: la informacion disponible no incluye exactitud top-1 ni top-5, por lo que no se puede valorar su rendimiento de clasificacion a partir de esta ficha.
- Sensibilidad al dominio: como cualquier clasificador entrenado en ImageNet, puede degradarse ante imagenes muy distintas a las del conjunto de entrenamiento (dominios medicos, industriales o de baja luminosidad, por ejemplo).
- Sin capacidades de lenguaje: no genera texto, no responde preguntas ni interactua de forma conversacional.
- Restricciones de licencia: se distribuye bajo licencia BSD-3-Clause, que permite uso comercial y modificacion siempre que se conserven el aviso de copyright y las condiciones de la licencia. Conviene verificar los terminos de los artefactos compilados y del uso de Qualcomm AI Hub por separado.
- Dependencia de hardware: los artefactos pre-exportados estan optimizados para NPU Qualcomm; para otros aceleradores habra que reexportar desde el checkpoint, con el consiguiente trabajo de validacion.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; los sesgos heredados de ImageNet pueden reflejarse en las predicciones.
- Version de SDK: los artefactos se compilaron con QAIRT 2.50 y ONNX Runtime 1.30.0; cambios de version podrian requerir recompilacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/EfficientNet-V2-s
- Pagina en Qualcomm AI Hub: https://aihub.qualcomm.com/models/efficientnet_v2_s
- Repositorio Qualcomm AI Hub Models (modelo concreto): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/efficientnet_v2_s
- Repositorio Qualcomm AI Hub Models (general): https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementacion de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/efficientnet.py
- Paper EfficientNetV2 (arXiv:2104.00298): https://arxiv.org/abs/2104.00298
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientnet_v2_s/releases/v0.64.0/efficientnet_v2_s-onnx-float.zip
- Descarga ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientnet_v2_s/releases/v0.64.0/efficientnet_v2_s-onnx-w8a16.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientnet_v2_s/releases/v0.64.0/efficientnet_v2_s-qnn_dlc-float.zip
- Descarga QNN_DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientnet_v2_s/releases/v0.64.0/efficientnet_v2_s-qnn_dlc-w8a16.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/efficientnet_v2_s/releases/v0.64.0/efficientnet_v2_s-tflite-float.zip
