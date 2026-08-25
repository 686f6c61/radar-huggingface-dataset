# qualcomm/Yolo-X

## Resumen

Yolo-X es un modelo de detección de objetos en tiempo real, basado en la implementación de YOLOX desarrollada por Megvii-BaseDetection, que Qualcomm ha optimizado y pre-exportado para su ejecución en dispositivos con chipsets Snapdragon y Dragonwing. El modelo predice bounding boxes y clases de objetos en imágenes, y está pensado para despliegue en entornos móviles y de edge computing, donde la latencia y el consumo de recursos son críticos.

La versión publicada en Hugging Face corresponde al checkpoint YoloX Small, con 8,98 millones de parámetros y una resolución de entrada de 640x640 píxeles. Qualcomm proporciona múltiples formatos de exportación (ONNX, QNN_DLC y TFLITE) con diferentes esquemas de cuantización (float, w8a16, w8a8), lo que permite adaptar el modelo a distintos requisitos de memoria y rendimiento. Su relevancia actual radica en que ofrece detección de objetos de alta velocidad directamente en la NPU de los procesadores Qualcomm, con tiempos de inferencia que van desde 6,27 ms en el Snapdragon 8 Elite Gen 5 hasta 64,8 ms en chipsets más modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YoloX Small (basado en YOLOX de Megvii-BaseDetection) |
| Parametros totales | 8,98 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | float, w8a16, w8a8, w8a8_mixed_int16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE, PyTorch |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de indicar que se trata del checkpoint YoloX Small. YOLOX es un detector de objetos de una sola etapa (one-stage) que emplea una red troncal CSPDarknet y una cabeza de detección desacoplada, con diseño anchor-free. Sin embargo, estos detalles no están confirmados en la model card de Qualcomm, por lo que deben tomarse como referencia general de la familia YOLOX.

No se han publicado datos sobre el proceso de entrenamiento: ni el número de tokens (al ser un modelo de visión, se hablaría de imágenes), ni la composición del dataset, ni si se aplicaron técnicas de refinamiento como RLHF o DPO. La model card solo indica que el modelo está basado en la implementación pública de YOLOX y que Qualcomm ha realizado la optimización y exportación para sus dispositivos. El repositorio de Qualcomm AI Hub Models permite exportar el modelo con pesos personalizados, lo que sugiere que es posible fine-tuning, pero no se documenta el entrenamiento original.

## Capacidades

- Detección de objetos: predice bounding boxes y clases de objetos en imágenes, con resolución de entrada de 640x640 píxeles.
- Inferencia en tiempo real: optimizado para ejecución en NPU de chipsets Qualcomm, con latencias de 6 a 65 ms según el dispositivo.
- Múltiples formatos de despliegue: ONNX, QNN_DLC y TFLITE, lo que facilita la integración en pipelines de Android, edge y servidores.
- Cuantización flexible: soporta pesos en float, w8a16 y w8a8, permitiendo reducir el tamaño del modelo de 34,3 MB a 8,96 MB sin necesidad de hardware especializado.
- Compatibilidad con Qualcomm AI Hub: permite compilar, perfilar y evaluar el modelo en dispositivos reales a través de la plataforma Qualcomm AI Hub Workbench.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehículos u objetos en tiempo real en cámaras IP conectadas a dispositivos Snapdragon, gracias a su baja latencia (7,6 ms en Snapdragon X2 Elite) y a que se ejecuta en la NPU, liberando la CPU para otras tareas.
- Conteo de objetos en entornos industriales: en líneas de producción, Yolo-X puede contar piezas o productos que pasan por una cinta, usando un dispositivo Dragonwing QCS8550 con una inferencia de 13,7 ms, suficiente para procesar más de 70 fotogramas por segundo.
- Detección de peatones para asistencia a la conducción: integrado en un sistema embebido con Snapdragon 8 Gen 3, el modelo puede identificar peatones y ciclistas en tiempo real (9,2 ms por imagen) para alertar al conductor o activar frenadas de emergencia.
- Aplicaciones Android de realidad aumentada: al estar disponible en formato TFLITE con cuantización w8a8 (8,96 MB), puede integrarse en apps móviles que superpongan información sobre objetos detectados, con un consumo de memoria de 5-190 MB según el chipset.
- Automatización de inventario en retail: un dron o robot móvil equipado con un módulo Qualcomm puede usar Yolo-X para escanear estanterías y detectar productos, con un tiempo de inferencia de 15 ms en Dragonwing IQ-8275, permitiendo actualizar el stock en tiempo real.
- Análisis de imágenes médicas para detección de anomalías: aunque no está específicamente entrenado para dominios médicos, el modelo puede adaptarse mediante fine-tuning para localizar estructuras o lesiones en radiografías, aprovechando su tamaño reducido para ejecutarse en equipos portátiles de diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como mAP en COCO o similar) en la información disponible. La model card solo incluye una tabla de rendimiento de inferencia en diferentes chipsets de Qualcomm, que se reproduce a continuación:

| Modelo | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Pico de memoria (MB) | Unidad de computo |
|---|---|---|---|---|---|---|
| Yolo-X | ONNX | float | Snapdragon X2 Elite | 7,6 | 5 - 5 | NPU |
| Yolo-X | ONNX | float | Snapdragon X Elite | 13,695 | 14 - 14 | NPU |
| Yolo-X | ONNX | float | Snapdragon 8 Gen 3 Mobile | 9,243 | 5 - 190 | NPU |
| Yolo-X | ONNX | float | Snapdragon 8 Gen 1 Mobile | 25,602 | 1 - 208 | NPU |
| Yolo-X | ONNX | float | Dragonwing IQ-8275 | 15,376 | 5 - 8 | NPU |
| Yolo-X | ONNX | float | Dragonwing QCS8550 (Proxy) | 13,672 | 0 - 17 | NPU |
| Yolo-X | ONNX | float | QCS8450 | 25,602 | 1 - 208 | NPU |
| Yolo-X | ONNX | float | Dragonwing IQ-9075 | 16,605 | 5 - 7 | NPU |
| Yolo-X | ONNX | float | Dragonwing IQ-X7181 | 13,695 | 14 - 14 | NPU |
| Yolo-X | ONNX | float | Dragonwing Q-8750 | 7,716 | 0 - 158 | NPU |
| Yolo-X | ONNX | float | Snapdragon 8 Elite Mobile | 7,716 | 0 - 158 | NPU |
| Yolo-X | ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 6,271 | 2 - 165 | NPU |
| Yolo-X | ONNX | w8a16 | Snapdragon X2 Elite | 11,942 | 2 - 2 | NPU |
| Yolo-X | ONNX | w8a16 | Snapdragon X Elite | 15,048 | 8 - 8 | NPU |
| Yolo-X | ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 10,187 | 3 - 240 | NPU |
| Yolo-X | ONNX | w8a16 | Snapdragon 8 Gen 1 Mobile | 16,21 | 3 - 240 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing QCS6490 | 29,457 | 2 - 5 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing IQ-8275 | 13,937 | 2 - 6 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing QCS8550 (Proxy) | 14,209 | 0 - 163 | NPU |
| Yolo-X | ONNX | w8a16 | QCS8450 | 16,21 | 3 - 240 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing IQ-9075 | 15,275 | 2 - 5 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing IQ-X7181 | 15,048 | 8 - 8 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing Q-6690 | 64,812 | 3 - 208 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing Q-7790 | 10,523 | 3 - 207 | NPU |
| Yolo-X | ONNX | w8a16 | Dragonwing Q-8750 | 9,147 | 0 - 206 | NPU |
| Yolo-X | ONNX | w8a16 | Snapdragon 8 Elite Mobile | 9,147 | 0 - 206 | NPU |

La tabla continúa en la fuente original con más combinaciones de precisión y chipsets, pero los datos mostrados son representativos. No se dispone de métricas de precisión como mAP, por lo que no es posible comparar el rendimiento de detección con otros modelos.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU de chipsets Qualcomm, no en GPUs de propósito general. Los tiempos de inferencia listados se obtuvieron en dispositivos Snapdragon y Dragonwing.
- Tamaño del modelo: 34,3 MB en float, 9,53 MB en w8a16 y 8,96 MB en w8a8. Esto permite que quepa en la memoria de cualquier dispositivo móvil moderno.
- Pico de memoria durante inferencia: entre 1 MB y 240 MB según el chipset y la precisión, lo que lo hace viable para dispositivos con restricciones de RAM.
- No se proporcionan requisitos de VRAM para GPUs de escritorio, pero al ser un modelo de solo 8,98 M de parámetros, cualquier GPU con más de 2 GB de VRAM podría ejecutarlo sin problemas si se convierte a un formato compatible (por ejemplo, ONNX con runtime de CPU o GPU).
- Opciones de despliegue: los formatos pre-exportados (ONNX, QNN_DLC, TFLITE) se pueden integrar con ONNX Runtime, Qualcomm AI Runtime (QAIRT) o TensorFlow Lite. También se puede usar la librería Qualcomm AI Hub Models para exportar con configuraciones personalizadas.
- Latencia: entre 6,27 ms (Snapdragon 8 Elite Gen 5, float) y 64,8 ms (Dragonwing Q-6690, w8a16), lo que permite aplicaciones en tiempo real en la mayoría de los chipsets listados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de objetos en la documentación proporcionada. La model card no incluye comparaciones con YOLOv8, YOLOv5, EfficientDet u otras alternativas. Por tanto, no es posible ofrecer una tabla comparativa basada en datos verificados. Se recomienda consultar benchmarks externos de precisión (como COCO mAP) y latencia en hardware equivalente para realizar una evaluación justa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la model card, pero al ser un modelo de detección de objetos genérico, su rendimiento puede degradarse en condiciones de baja iluminación, oclusiones o clases poco representadas en el dataset de entrenamiento original.
- Riesgo de alucinación: en detección de objetos, el modelo puede producir falsos positivos (bounding boxes incorrectos) o falsos negativos, especialmente en imágenes con objetos pequeños o superpuestos.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene estado conversacional. Su entrada es una imagen fija de 640x640 píxeles; no soporta video de forma nativa, aunque se puede aplicar fotograma a fotograma.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones conocidas adicionales.
- Dependencia de hardware Qualcomm: los formatos QNN_DLC y las optimizaciones de rendimiento están pensados para la NPU de Qualcomm. En otras plataformas (GPU NVIDIA, Apple Silicon, etc.), el modelo puede ejecutarse vía ONNX, pero no se garantizan las mismas latencias.
- La información de entrenamiento (dataset, número de épocas, técnicas de aumento) no está disponible, lo que limita la capacidad de evaluar su robustez en dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/Yolo-X
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/yolox
- Repositorio de Qualcomm AI Hub Models (código de exportación): https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/yolox
- Implementación original de YOLOX (Megvii-BaseDetection): https://github.com/Megvii-BaseDetection/YOLOX/
