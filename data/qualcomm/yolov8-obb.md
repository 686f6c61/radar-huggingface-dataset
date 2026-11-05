# qualcomm/YOLOv8-OBB

## Resumen

YOLOv8-OBB es una variante del detector de objetos Ultralytics YOLOv8 especializada en la predicción de cajas delimitadoras orientadas (oriented bounding boxes, OBB). A diferencia de las cajas alineadas a los ejes, las OBB permiten ajustar la geometría de detección a objetos rotados, lo que resulta crítico en imágenes aéreas, satelitales, texto inclinado o cualquier escena donde la orientación importa. El modelo base es YOLOv8-N-OBB, la variante nano de la familia, con una resolución de entrada de 640x640 píxeles.

Este repositorio, publicado por Qualcomm bajo el identificador `qualcomm/YOLOv8-OBB`, no contiene pesos preentrenados listos para usar, sino los artefactos y la configuración necesarios para compilar y exportar el modelo a los aceleradores NPU de Qualcomm mediante la librería Qualcomm AI Hub Models y el servicio AI Hub Workbench. La model card indica explícitamente que, por restricciones de licencia, no se distribuyen los assets preexportados; el usuario debe compilar el modelo con sus propios pesos, formas de entrada y configuraciones de dispositivo.

El interés actual del modelo radica en su perfil de rendimiento sobre hardware móvil y embebido: con cuantización w8a8 alcanza tiempos de inferencia de 0,648 ms en el Snapdragon 8 Elite Gen 5 y de 1,037 ms en el Snapdragon 8 Gen 3, con un tamaño de modelo de 3,53 MB. Esto lo sitúa como una opción viable para detección orientada en tiempo real en dispositivos con recursos limitados, como drones, cámaras inteligentes o terminales Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (CNN, detección de objetos con cajas orientadas) |
| Parametros totales | no disponible (checkpoint YOLOv8-N-OBB, tamaño float 12,1 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640x640) |
| Tipos de cuantizacion | float, w8a16, w8a8, w8a8_mixed_int16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repositorio de compilación/exportación; runtime ONNX en los benchmarks) |

## Arquitectura y entrenamiento

YOLOv8-OBB es una red neuronal convolucional de una sola etapa (single-stage detector) orientada a la detección densa de objetos. La variante OBB añade una cabeza de predicción que estima, además de la clase y la confianza, un ángulo de rotación para cada caja, de modo que la salida incluye cajas delimitadoras orientadas en lugar de rectángulos alineados a los ejes. El checkpoint de referencia es YOLOv8-N-OBB, la versión nano de la familia, con una resolución de entrada fija de 640x640.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables en un detector de objetos). El repositorio de Qualcomm no entrena el modelo: parte de la implementación de Ultralytics y se centra en la compilación y el perfilado sobre NPU de Qualcomm mediante AI Hub Workbench. La innovación destacable es la optimización para aceleradores heterogéneos (NPU) con soporte de cuantización w8a8 y w8a16, que reduce el tamaño del modelo de 12,1 MB en float a 3,53 MB en w8a8.

## Capacidades

- Detección de objetos con cajas delimitadoras orientadas (OBB), adecuada para objetos rotados o no alineados a los ejes.
- Detección en imágenes aéreas y satelitales, donde la orientación de vehículos, barcos o edificios es relevante.
- Detección de texto inclinado y elementos gráficos rotados en documentos escaneados.
- Salida de clase, confianza y geometría orientada por objeto detectado.
- Inferencia en tiempo real sobre NPU de Qualcomm con latencias inferiores a 1 ms en los chipsets de gama alta (w8a8).
- Exportación y compilación con formas de entrada y pesos personalizados mediante Qualcomm AI Hub Models.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Inspección aérea con drones: el modelo detecta vehículos, embarcaciones o infraestructuras con cajas orientadas, lo que mejora el ajuste en imágenes cenitales donde las cajas alineadas a los ejes generan solapamientos. Su tamaño de 3,53 MB en w8a8 permite ejecutarlo a bordo del dron sobre un Snapdragon embebido.
- Vigilancia y videovigilancia en dispositivos edge: con latencias de 0,648 a 1,037 ms por inferencia en chipsets de gama alta, puede procesar flujos de vídeo a decenas de FPS en la NPU sin saturar la CPU.
- Digitalización de documentos: detección de bloques de texto inclinado en escaneos o fotografías, donde la caja orientada ajusta mejor el área del texto que un rectángulo axis-aligned.
- Análisis de imágenes satelitales: detección de barcos, aviones o almacenes en ortomosaicos, con la orientación como dato útil para el análisis geoespacial.
- Robótica y vehículos autónomos de bajo consumo: percepción de objetos rotados en el entorno cercano sobre plataformas con Dragonwing IQ-8275 o QCS8550, con tiempos de 1,5 a 4,7 ms en w8a8.
- Aplicaciones Android de realidad aumentada: integración en apps que necesitan localizar y orientar objetos en la cámara en tiempo real, aprovechando la NPU del Snapdragon 8 Gen 3 o superior.
- Control de calidad industrial: detección de piezas rotadas en cintas transportadoras, donde la orientación permite calcular el ángulo de alineación para tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, etc.) en la información disponible. La model card únicamente proporciona métricas de latencia y memoria por chipset. Extracto representativo:

| Chipset | Precision | Runtime | Inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy | float | ONNX | 3,014 | 1 - 172 |
| Snapdragon 8 Elite Gen 5 For Galaxy | w8a16 | ONNX | 2,046 | 0 - 77 |
| Snapdragon 8 Elite Gen 5 For Galaxy | w8a8 | ONNX | 0,648 | 0 - 56 |
| Snapdragon 8 Gen 3 | float | ONNX | 4,141 | 1 - 191 |
| Snapdragon 8 Gen 3 | w8a8 | ONNX | 1,037 | 0 - 73 |
| Snapdragon X Elite | w8a8 | ONNX | 1,603 | 0 - 0 |
| Dragonwing IQ-8275 | w8a8 | ONNX | 1,603 | 0 - 4 |
| Dragonwing QCS8550 (Proxy) | w8a8 | ONNX | 1,565 | 0 - 50 |
| Dragonwing Q-6690 | w8a8 | ONNX | 9,084 | 1 - 168 |

Todas las mediciones se ejecutan sobre la NPU como unidad de cómputo principal, con runtime ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para NPU de Qualcomm. El tamaño de pesos va de 12,1 MB (float) a 3,53 MB (w8a8), por lo que la memoria necesaria es mínima.
- GPU recomendadas: no se documentan despliegues en GPU NVIDIA o AMD; el objetivo son los aceleradores Hexagon NPU de Qualcomm.
- Cabe en hardware consumer: sí, en chipsets móviles y embebidos Qualcomm (Snapdragon 8 Gen 1/3/Elite, Snapdragon X Elite/X2 Elite, Dragonwing QCS6490, QCS8550, IQ-8275, IQ-9075, Q-6690, Q-7790, Q-8750, entre otros).
- Opciones de despliegue: Qualcomm AI Hub Workbench y la librería `qai_hub_models` para compilar y exportar; runtime ONNX en los benchmarks publicados.
- Latencia y throughput: latencias de 0,648 ms (w8a8, Snapdragon 8 Elite Gen 5) hasta 27,054 ms (w8a16, Dragonwing Q-6690). El throughput depende del pipeline de pre/post-proceso, no documentado.

## Comparativa con modelos similares

| Modelo | Tipo de caja | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8-OBB (este) | Orientada (OBB) | YOLOv8-N (12,1 MB float) | 640x640 | AGPL-3.0 | Repositorio de compilación Qualcomm |
| YOLOv8 (variante estándar) | Alineada a ejes | YOLOv8-N/S/M/L/X | 640x640 | AGPL-3.0 | Ultralytics, HuggingFace |
| YOLOv11-OBB | Orientada (OBB) | variantes N/S/M/L/X | 640x640 | AGPL-3.0 | Ultralytics |
| RT-DETR | Alineada a ejes | no disponible | variable | Apache-2.0 (según variante) | HuggingFace, repos oficiales |

No se dispone de datos de precisión comparada (mAP) en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El repositorio no incluye pesos preentrenados: por restricciones de licencia, el usuario debe compilar y exportar el modelo con sus propios pesos mediante Qualcomm AI Hub Models.
- Licencia AGPL-3.0: el uso en servicios de red puede obligar a liberar el código fuente derivado; revisar implicaciones antes de un despliegue comercial.
- Modelo de visión sin capacidades de lenguaje: no soporta tool calling, agentes ni razonamiento textual.
- La precisión de detección no se documenta en la model card; no hay métricas de mAP ni de recall que permitan evaluar su calidad frente a alternativas.
- Dependencia del ecosistema Qualcomm: los benchmarks y la optimización están ligados a NPU Hexagon y al runtime ONNX; el rendimiento en otras plataformas no está caracterizado.
- Riesgo de falsos positivos y negativos inherente a los detectores de una etapa, especialmente en objetos pequeños o con oclusión; no se documentan sesgos específicos del dataset de entrenamiento.
- La variante nano prioriza velocidad sobre precisión; para escenas complejas puede ser insuficiente frente a variantes S/M/L.
- No se especifican los idiomas ni la composición del dataset de entrenamiento, lo que limita la evaluación de sesgos por dominio.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/YOLOv8-OBB
- Implementación de referencia YOLOv8-OBB (Ultralytics): https://github.com/ultralytics/ultralytics/tree/main/ultralytics/models/yolo/obb
- Qualcomm AI Hub Models (librería): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/yolov8_obb
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Qualcomm (sitio corporativo): https://www.qualcomm.com/
