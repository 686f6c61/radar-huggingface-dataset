# shin0624/bridgesense-rtdetr

## Resumen

BridgeSense DT es un modelo de detección de objetos basado en RT-DETR v2, desarrollado por shin0624 (shinbeomsu) como parte del proyecto BridgeSense DT, presentado a la competición de desarrolladores open source de 2026. El modelo está específicamente afinado para detectar defectos superficiales en puentes a partir de imágenes de inspección visual, y se distribuye en formato ONNX para su integración en Unity mediante el motor de inferencia Sentis.

El modelo parte del detector RT-DETR v2 (`PekingU/rtdetr_v2_r18vd`), una arquitectura transformer de tiempo real que supera a los YOLO en precisión y velocidad. El afinamiento se realizó con el conjunto de datos AI-Hub de inspección de puentes de Corea, que incluye más de 420.000 imágenes. El resultado es un archivo ONNX de aproximadamente 82 MB, optimizado para inferencia en entornos de bajo consumo como aplicaciones de realidad aumentada o inspección asistida. Aunque su rendimiento de detección (mAP ~0.05) es limitado, el proyecto lo complementa con un modelo de segmentación SegFormer para localizar defectos con mayor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (transformer detector con backbone ResNet-18) |
| Parametros totales | no disponible (archivo ONNX ~82 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos, no texto) |
| Tipos de cuantizacion | no disponible (solo ONNX sin cuantizar) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache License 2.0 |
| Formato de pesos | ONNX (opset 18, exportado con dynamo=True) |

## Arquitectura y entrenamiento

RT-DETR v2 es un detector de objetos basado en transformer que elimina la necesidad de anclas y propuestas, utilizando un mecanismo de atención para predecir directamente las cajas delimitadoras. El modelo base `rtdetr_v2_r18vd` emplea un backbone ResNet-18, lo que lo hace ligero y adecuado para inferencia en tiempo real. El afinamiento se realizó sobre el conjunto de datos AI-Hub de inspección de puentes, que contiene 420.074 imágenes distribuidas en: hormigón (41,6%), asfalto (34,9%), datos normales (23,4%) y acero (0,1%). Las etiquetas originales se convirtieron al formato COCO para el entrenamiento. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de visión. La exportación a ONNX se realizó con `dynamo=True`, lo que permite una integración eficiente en Unity Sentis.

## Capacidades

- Detección de defectos en puentes mediante bounding boxes, con 9 clases específicas: grietas de hormigón, desconchado de hormigón, eflorescencias, filtraciones, exposición de acero, grietas de asfalto, hundimiento de asfalto, corrosión de acero y desprendimiento de pintura de acero.
- Inferencia en tiempo real gracias a la arquitectura RT-DETR v2 y al formato ONNX optimizado.
- Integración nativa con Unity a través de Sentis, permitiendo visualización en entornos 3D o aplicaciones de realidad aumentada.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser exclusivamente un modelo de visión.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Inspección visual de puentes: el modelo puede procesar imágenes capturadas por drones o cámaras fijas para identificar automáticamente grietas, corrosión u otros defectos, reduciendo el tiempo de inspección manual.
- Mantenimiento predictivo de infraestructuras: al integrarse en un sistema de monitorización, permite priorizar reparaciones según la gravedad y ubicación de los defectos detectados.
- Aplicaciones de realidad aumentada para ingenieros: gracias a su compatibilidad con Unity Sentis, el modelo puede superponer cajas delimitadoras sobre la vista en tiempo real de una cámara, facilitando el trabajo de campo.
- Formación y simulación: el modelo puede utilizarse en entornos de entrenamiento virtual para enseñar a identificar defectos en puentes, generando ejemplos sintéticos o anotaciones automáticas.
- Documentación automatizada de inspecciones: los resultados de detección pueden exportarse a informes estructurados, incluyendo coordenadas y clases de defectos, para su integración en sistemas de gestión de activos.
- Análisis de grandes volúmenes de imágenes históricas: el modelo puede procesar archivos de inspecciones pasadas para detectar patrones de deterioro y ayudar en la planificación de mantenimiento a largo plazo.

## Benchmarks y rendimiento

El autor reporta un mAP de aproximadamente 0.05 en el conjunto de validación, un valor bajo que indica una precisión limitada en la detección de defectos. En el mismo proyecto, el modelo de segmentación SegFormer alcanza un mean IoU de 0.47, por lo que el equipo optó por derivar las bounding boxes a partir de las máscaras de segmentación en lugar de usar directamente las salidas de RT-DETR. No se han publicado comparaciones con otros modelos de detección de defectos en puentes.

| Metrica | Valor |
|---|---|
| mAP (validacion) | ~0.05 |
| mean IoU (modelo de segmentacion complementario) | 0.47 |

## Requisitos de hardware

- Al ser un modelo ONNX de ~82 MB, puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes, aunque se recomienda GPU para tiempo real.
- VRAM estimada: no disponible, pero por el tamaño del archivo y la arquitectura ResNet-18, se estima que cabe en GPUs con 4 GB o más (por ejemplo, NVIDIA GTX 1650, RTX 3050).
- Compatible con GPUs de consumo como RTX 3060, RTX 4060, y también con hardware de edge como Jetson Nano o Raspberry Pi (con limitaciones de velocidad).
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Unity Sentis, y cualquier framework que soporte ONNX (TensorRT, OpenVINO, etc.).
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo ligero, se espera una latencia inferior a 50 ms en GPU moderna para imágenes de 640x640.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros modelos de detección de defectos en puentes. El modelo base RT-DETR v2 se compara en la literatura con YOLO y otros detectores, pero no hay datos específicos para este afinamiento. Se recomienda consultar el repositorio oficial de RT-DETR para benchmarks generales.

## Limitaciones y advertencias

- Rendimiento de detección bajo (mAP ~0.05), lo que puede generar falsos positivos o negativos en aplicaciones críticas.
- Desequilibrio severo en los datos de entrenamiento: la clase de acero representa solo el 0,1% del conjunto, lo que probablemente degrade la detección de corrosión y desprendimiento de pintura.
- El modelo solo detecta las 9 clases definidas; no reconoce otros tipos de daños ni objetos.
- No es un modelo de lenguaje, por lo que no puede interpretar instrucciones ni generar informes textuales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de precisión o idoneidad para entornos de producción sin validación adicional.
- La fecha de creación (2026) y el bajo número de descargas sugieren que es un modelo experimental, no ampliamente probado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shin0624/bridgesense-rtdetr
- Repositorio del proyecto BridgeSense DT: https://github.com/shin0624/BridgeSense_DT
- Repositorio oficial de RT-DETR: https://github.com/lyuwenyu/RT-DETR
- Documentación de RT-DETR en Hugging Face: https://huggingface.co/docs/transformers/model_doc/rt_detr
- Paper sobre RT-DETR para detección en puentes: https://www.sciencedirect.com/science/article/pii/S1093968726013046
