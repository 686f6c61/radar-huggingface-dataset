# qualcomm/YOLO26-Detection

## Resumen

YOLO26-Detection es un modelo de detección de objetos en tiempo real desarrollado por Ultralytics y optimizado por Qualcomm para su ejecución en dispositivos móviles y de borde con chipsets Snapdragon y Dragonwing. El modelo predice cajas delimitadoras y clases de objetos en imágenes, y está basado en la implementación de YOLO26 del repositorio de Ultralytics. Esta versión concreta, publicada en Hugging Face por Qualcomm, contiene scripts y configuraciones para exportar el modelo a formatos optimizados (ONNX, QNN_DLC) para su despliegue en hardware Qualcomm, pero no incluye los pesos pre-exportados debido a restricciones de licencia.

El modelo tiene 2,4 millones de parámetros y un tamaño de 9,2 MB en precisión flotante, lo que lo hace extremadamente ligero y adecuado para aplicaciones embebidas. Su relevancia actual radica en la creciente demanda de modelos de visión por computador eficientes que puedan ejecutarse en dispositivos con recursos limitados, como smartphones, cámaras de vigilancia o sistemas de automatización industrial. Qualcomm AI Hub permite compilar y perfilar el modelo en una amplia gama de chipsets, con tiempos de inferencia que van desde 2,3 ms hasta 27 ms según la plataforma y la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-N (red neuronal convolucional) |
| Parametros totales | 2,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float (FP32), w8a16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX, QNN_DLC (no se distribuyen pesos pre-exportados; se generan mediante Qualcomm AI Hub) |

## Arquitectura y entrenamiento

YOLO26-Detection se basa en la arquitectura YOLO (You Only Look Once) de Ultralytics, concretamente en la variante YOLO26-N, que es la versión más ligera de la familia YOLO26. Se trata de una red neuronal convolucional (CNN) de una sola pasada que divide la imagen en una cuadrícula y predice simultáneamente las cajas delimitadoras y las probabilidades de clase. El modelo está diseñado para operar con una resolución de entrada de 640x640 píxeles.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens (no aplica), la composición del dataset o el uso de técnicas de alineación (RLHF/DPO). El modelo se basa en la implementación oficial de Ultralytics, que utiliza un entrenamiento supervisado con datasets de detección de objetos como COCO, aunque no se confirma en la documentación proporcionada. Tampoco se mencionan innovaciones técnicas específicas más allá de la optimización para hardware Qualcomm mediante la compilación a QNN_DLC y la cuantización w8a16.

## Capacidades

- Detección de objetos en imágenes: predice cajas delimitadoras y clases para múltiples objetos en una sola inferencia.
- Soporte para entrada de 640x640 píxeles, resolución estándar en modelos YOLO.
- Optimización para ejecución en NPU de Qualcomm, con soporte para formatos ONNX y QNN_DLC.
- Capacidad de exportación con pesos personalizados (fine-tuning) y formas de entrada personalizadas mediante Qualcomm AI Hub.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la visión.
- No es un modelo de lenguaje, por lo que no tiene capacidades multilingües.

## Casos de uso

- Vigilancia y seguridad en tiempo real: el modelo puede analizar flujos de video en dispositivos de borde (cámaras IP, smartphones) para detectar personas, vehículos u objetos de interés. Su baja latencia (4-6 ms en Snapdragon 8 Gen 3) permite procesamiento en tiempo real sin necesidad de conexión a la nube.
- Control de calidad industrial: en líneas de producción, YOLO26-Detection puede inspeccionar productos en una cinta transportadora, detectando defectos o piezas ausentes. Su tamaño reducido (9,2 MB) facilita su integración en PLCs o sistemas embebidos con recursos limitados.
- Conteo de objetos y análisis de aforo: en entornos comerciales o de transporte, el modelo puede contar personas o vehículos en imágenes estáticas o video, ayudando a gestionar aforos o flujos de tráfico. La cuantización w8a16 reduce el uso de memoria a 3,2 MB, ideal para despliegues masivos.
- Asistencia a la conducción (ADAS): en vehículos con chipsets Snapdragon, el modelo puede detectar peatones, señales de tráfico u obstáculos en tiempo real. Los tiempos de inferencia de 2,3-4 ms en Snapdragon 8 Elite permiten integrarlo en sistemas de alerta temprana.
- Realidad aumentada: aplicaciones móviles que superponen información digital sobre objetos del mundo real pueden usar YOLO26-Detection para reconocer objetos y anclar contenido virtual. Su compatibilidad con Android y la optimización para NPU lo hacen adecuado para apps de consumo.
- Automatización robótica: robots de servicio o drones pueden utilizar el modelo para navegar y evitar obstáculos, detectando objetos en su campo de visión. La posibilidad de exportar con pesos personalizados permite adaptarlo a entornos específicos.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento en diferentes chipsets de Qualcomm, medidos con ONNX y QNN_DLC. No se incluyen benchmarks estándar de detección (como mAP en COCO) en la información disponible. A continuación se muestran los tiempos de inferencia y uso de memoria para algunas configuraciones representativas:

| Runtime | Precision | Chipset | Inference Time (ms) | Peak Memory (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Mobile | 4,246 | 0 - 175 |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 6,293 | 5 - 206 |
| ONNX | w8a16 | Snapdragon 8 Elite Mobile | 2,584 | 0 - 83 |
| ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 3,497 | 0 - 221 |
| QNN_DLC | float | Snapdragon 8 Elite Mobile | 2,856 | 5 - 5 |
| QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 3,346 | 0 - 177 |

No se han publicado resultados de benchmarks estándar (mAP, precisión) en la información disponible.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU de chipsets Qualcomm (Snapdragon, Dragonwing). No se proporcionan requisitos para GPUs de escritorio.
- VRAM estimada: el pico de memoria varía entre 0 y 224 MB según el chipset y la precisión. La cuantización w8a16 reduce significativamente el uso de memoria (por ejemplo, 2-2 MB en Snapdragon X2 Elite).
- GPUs recomendadas: no aplica; el modelo se ejecuta en NPU de Qualcomm. Para desarrollo y pruebas, se puede usar CPU o GPU estándar, pero el rendimiento óptimo se obtiene en hardware Qualcomm.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado), ONNX Runtime, QNN (Qualcomm Neural Network). No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: los tiempos de inferencia van de 2,3 ms (Snapdragon 8 Elite Gen 5, w8a16) a 27,4 ms (Dragonwing Q-6690, w8a16). El throughput depende del lote y la resolución, pero no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de detección de objetos (como YOLOv8, YOLOv9 o EfficientDet) en la información proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso o modificación del modelo debe cumplir con los términos de esta licencia, que exige que las obras derivadas se distribuyan bajo la misma licencia. Esto puede ser restrictivo para aplicaciones comerciales propietarias.
- No se distribuyen pesos pre-exportados: debido a restricciones de licencia, el repositorio no incluye los archivos de modelo listos para usar. Es necesario utilizar Qualcomm AI Hub para compilar y exportar el modelo con los pesos propios, lo que añade un paso adicional al flujo de trabajo.
- Sesgos y alucinaciones: al ser un modelo de visión, no presenta alucinaciones de texto, pero puede tener sesgos en la detección de ciertas clases o condiciones de iluminación, dependiendo de los datos de entrenamiento (no especificados).
- Limitaciones de contexto: no aplica, ya que no procesa secuencias de texto.
- Dependencia de hardware Qualcomm: el modelo está optimizado para NPU de Qualcomm; su rendimiento en otras plataformas (GPU NVIDIA, CPU) no está documentado y puede ser significativamente inferior.
- La resolución de entrada está fijada en 640x640; para otras resoluciones es necesario reexportar el modelo con configuraciones personalizadas.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/YOLO26-Detection
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/yolo26_det
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/yolo26_det
- Implementación de Ultralytics YOLO26: https://github.com/ultralytics/ultralytics/tree/main/ultralytics/models/yolo/detect
