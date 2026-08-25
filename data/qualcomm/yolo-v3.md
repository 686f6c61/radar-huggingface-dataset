# qualcomm/Yolo-v3

## Resumen

Yolo-v3 es un modelo de detección de objetos en tiempo real basado en la arquitectura YOLOv3, optimizado por Qualcomm para su ejecución en dispositivos móviles y de edge con chipsets Snapdragon y Dragonwing. El modelo predice cajas delimitadoras y clases de objetos en una imagen, y esta versión concreta corresponde al checkpoint YoloV3 Tiny, con 11,5 millones de parámetros y una resolución de entrada de 416x416 píxeles. Qualcomm lo distribuye a través de su plataforma AI Hub, ofreciendo exportaciones precompiladas para runtime ONNX y QNN_DLC, con cuantización w8a16 para reducir el tamaño y la latencia.

La relevancia actual de este modelo radica en su capacidad para ejecutar detección de objetos en tiempo real en hardware de consumo, con tiempos de inferencia de entre 1,4 y 20 ms según el chipset, lo que lo hace adecuado para aplicaciones de visión por computador en automoción, robótica, seguridad y realidad aumentada. Al estar basado en la implementación de Ultralytics (yolov3 v8), mantiene compatibilidad con el ecosistema PyTorch, aunque su distribución está restringida por la licencia AGPL-3.0 y no se pueden descargar los pesos pre-exportados directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv3 Tiny) |
| Parametros totales | 11,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | float32, w8a16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch, ONNX, QNN_DLC |

## Arquitectura y entrenamiento

YOLOv3 es una red neuronal convolucional de una sola pasada (single-shot detector) que divide la imagen en una cuadrícula y predice cajas y clases por celda. La versión Tiny reduce el número de capas y canales para lograr mayor velocidad a costa de precisión. El modelo aquí presentado se basa en la implementación de Ultralytics (yolov3 v8) y ha sido optimizado por Qualcomm para su compilación en NPU mediante su herramienta AI Hub Workbench. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento (número de tokens, técnicas de RLHF, etc.), ya que la model card solo indica el checkpoint y la arquitectura. La innovación principal de esta versión es la optimización específica para hardware Qualcomm, que permite ejecutar el modelo en NPU con cuantización w8a16, reduciendo el tamaño de 43,9 MB a 16,9 MB sin pérdida significativa de rendimiento.

## Capacidades

- Deteccion de objetos en imagenes: predice cajas delimitadoras y clases para multiples objetos en una sola inferencia.
- Inferencia en tiempo real: optimizado para NPU de Qualcomm, con latencias de 1,4 a 20 ms segun el chipset.
- Soporte de cuantizacion w8a16: reduce el uso de memoria y acelera la inferencia en dispositivos edge.
- Compatibilidad con runtime ONNX y QNN_DLC: permite despliegue en multiples plataformas Qualcomm.
- Integracion con Qualcomm AI Hub: facilita la exportacion y compilacion para dispositivos especificos.
- No incluye capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Conduccion autonoma y asistencia al conductor: el modelo puede detectar vehiculos, peatones y senales de trafico en tiempo real desde camaras embarcadas, gracias a su baja latencia (2-4 ms en Snapdragon 8 Gen 3) y su capacidad para ejecutarse en NPU sin consumir excesiva energia.
- Vigilancia y seguridad perimetral: integrado en camaras IP o dispositivos edge, permite detectar intrusiones o comportamientos anomalos con una latencia inferior a 10 ms, incluso en hardware de gama media como Snapdragon 7 Gen 4.
- Robotica movil: un robot puede usar el modelo para localizar obstaculos y objetos de interes en su entorno, con un consumo de memoria de solo 5-20 MB en configuraciones float, lo que permite ejecutarlo en microcontroladores o SBCs con recursos limitados.
- Realidad aumentada: en aplicaciones moviles, el modelo puede anclar objetos virtuales a elementos del mundo real (por ejemplo, muebles o productos) con una latencia de 2,5 ms en Snapdragon 8 Elite, proporcionando una experiencia fluida.
- Control de calidad industrial: en lineas de produccion, el modelo puede detectar defectos o piezas ausentes en imagenes de 416x416, con un tiempo de inferencia de 3-6 ms en chipsets Dragonwing, permitiendo inspeccion en tiempo real sin detener la cinta.
- Agricultura de precision: mediante drones o camaras fijas, el modelo puede contar y localizar cultivos, frutas o plagas, aprovechando su tamaño reducido (16,9 MB en w8a16) para desplegarse en dispositivos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mAP, IoU) en la informacion disponible. La model card solo proporciona tiempos de inferencia y uso de memoria para diferentes chipsets de Qualcomm, que se resumen a continuacion:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Pico de memoria (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 | ONNX | w8a16 | 1,393 | 1 - 58 |
| Snapdragon X2 Elite | ONNX | w8a16 | 1,608 | 2 - 2 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | 2,527 | 0 - 84 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a16 | 4,58 | 2 - 89 |
| Snapdragon 7 Gen 4 Mobile | ONNX | w8a16 | 5,185 | 2 - 179 |
| Qualcomm Dragonwing Q-8750 | QNN_DLC | float | 2,182 | 0 - 141 |
| Qualcomm Dragonwing IQ-9075 | QNN_DLC | float | 5,367 | 5 - 11 |

Estos datos indican que el modelo es altamente eficiente en hardware Qualcomm, con latencias sub-5 ms en la mayoria de los chipsets modernos, pero no permiten comparar su precision con otros detectores.

## Requisitos de hardware

- VRAM estimada: el modelo en float ocupa 43,9 MB y en w8a16 16,9 MB. La memoria pico durante la inferencia varia entre 1 y 196 MB segun el chipset y la configuracion, por lo que cabe en cualquier GPU o NPU con al menos 256 MB de memoria.
- GPU recomendadas: no requiere GPU dedicada; esta optimizado para NPU de Qualcomm (Snapdragon, Dragonwing). En caso de usar GPU, cualquier GPU con soporte CUDA (por ejemplo, RTX 2060 o superior) puede ejecutarlo sin problemas, aunque no se han publicado mediciones.
- Compatibilidad con consumer GPU: si, el modelo es pequeno y puede ejecutarse en cualquier GPU moderna, incluso en iGPU integradas.
- Opciones de despliegue: Qualcomm AI Hub (compilacion a QNN_DLC), ONNX Runtime, PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: en NPU de Qualcomm, la latencia oscila entre 1,4 ms (Snapdragon 8 Elite Gen 5) y 20 ms (SA7255P). En GPU, se espera una latencia similar o superior, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros detectores de objetos en la informacion proporcionada. Sin embargo, se puede establecer una comparacion cualitativa con alternativas comunes:

| Modelo | Parametros | Resolucion | Licencia | Optimizacion para edge |
|---|---|---|---|---|
| Yolo-v3 (Tiny) | 11,5 M | 416x416 | AGPL-3.0 | Si (Qualcomm NPU) |
| YOLOv5s | 7,2 M | 640x640 | AGPL-3.0 | Parcial (requiere exportacion) |
| YOLOv8n | 3,2 M | 640x640 | AGPL-3.0 | Parcial (requiere exportacion) |

YOLOv5s y YOLOv8n son mas recientes y suelen ofrecer mejor precision por parametro, pero no estan pre-optimizados para NPU de Qualcomm. La ventaja de Yolo-v3 Tiny es su integracion directa con el ecosistema Qualcomm AI Hub, que simplifica el despliegue en dispositivos moviles.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso comercial o distribucion del modelo o sus derivados debe cumplir con los terminos de la licencia, que exigen publicar el codigo fuente de las modificaciones. Esto puede ser restrictivo para aplicaciones propietarias.
- Restriccion de distribucion: Qualcomm no permite la descarga directa de los pesos pre-exportados. Los usuarios deben compilar el modelo con sus propias herramientas a traves de AI Hub, lo que anade un paso adicional.
- Precision limitada: al ser la variante Tiny, su precision es inferior a la de YOLOv3 completo o modelos mas modernos como YOLOv8. No se han publicado metricas de mAP, por lo que no se puede cuantificar la perdida.
- Sesgos y alucinaciones: al ser un modelo de deteccion de objetos, puede producir falsos positivos o negativos en condiciones de iluminacion adversa, oclusiones o clases no representadas en el dataset de entrenamiento. No se ha documentado el dataset utilizado.
- Limitaciones de contexto: no aplica, pero la resolucion fija de 416x416 puede ser baja para detectar objetos muy pequenos en imagenes de alta resolucion.
- Soporte limitado a hardware Qualcomm: aunque el modelo se puede ejecutar en otras plataformas, las optimizaciones (QNN_DLC, w8a16) estan pensadas para NPU de Qualcomm, por lo que en otros hardware el rendimiento puede degradarse.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Yolo-v3
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/yolov3
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/qai_hub_models/models/yolov3
- Paper original de YOLOv3 (arXiv:1804.02767): https://arxiv.org/abs/1804.02767
- Implementacion de Ultralytics YOLOv3: https://github.com/ultralytics/yolov3/tree/v8
