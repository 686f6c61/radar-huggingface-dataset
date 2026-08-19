# lucid-dl/yolo-v2

## Resumen

YOLOv2 (You Only Look Once, versión 2) es un modelo de detección de objetos en tiempo real propuesto por Joseph Redmon y Ali Farhadi en 2017, descrito en el artículo *YOLO9000: Better, Faster, Stronger* (arXiv:1612.08242). Este repositorio en Hugging Face contiene un port del modelo original de Darknet a la librería Lucid, con los pesos convertidos al formato nativo safetensors. La arquitectura se basa en la red Darknet-19, con 51 millones de parámetros y una entrada de imagen que produce directamente cajas delimitadoras y probabilidades de clase en una sola pasada.

El modelo está entrenado en el dataset COCO 2014 y alcanza una precisión media (mAP@0.5) de 48,1. Aunque es una arquitectura anterior a las versiones modernas de YOLO (v5, v8, etc.), sigue siendo relevante como referencia histórica, por su eficiencia computacional y por su uso en entornos con recursos limitados. Este port en Lucid facilita su integración en proyectos actuales que utilicen esa librería, manteniendo la paridad numérica con los pesos originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Darknet-19 (CNN convolucional) |
| Parametros totales | 51,0 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantización declarada) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | other (heredada de los pesos originales de Darknet) |
| Formato de pesos | safetensors (Lucid-native) |

## Arquitectura y entrenamiento

YOLOv2 emplea una red convolucional Darknet-19, compuesta por 19 capas convolucionales y 5 capas de max-pooling. A diferencia de los detectores basados en regiones (como Faster R-CNN), YOLOv2 divide la imagen en una cuadrícula S×S y predice simultáneamente cajas delimitadoras y probabilidades de clase para cada celda. Entre las innovaciones técnicas introducidas en YOLOv2 se incluyen la normalización por lotes (batch normalization), el uso de cajas ancla (anchor boxes) aprendidas mediante k-means, y la predicción de coordenadas relativas a la celda. El modelo se entrenó en el dataset COCO 2014 con imágenes de 416×416 píxeles, aunque soporta otras resoluciones. No se han publicado detalles sobre el número exacto de épocas ni sobre técnicas de alineamiento (RLHF/DPO), que no son aplicables a este tipo de modelo discriminativo.

## Capacidades

- Detección de objetos en imágenes: devuelve logits por clase y coordenadas de cajas delimitadoras para cada propuesta.
- Inferencia en tiempo real: su arquitectura ligera permite ejecución a alta velocidad en GPUs de consumo.
- Preprocesamiento integrado: los pesos incluyen transformaciones asociadas que se aplican automáticamente a la imagen de entrada.
- Salida estructurada: proporciona un objeto `ObjectDetectionOutput` con logits y cajas, listo para postprocesamiento (NMS, etc.).
- Compatibilidad con la librería Lucid: carga sencilla mediante `models.yolo_v2(pretrained=True)`.
- No soporta tareas de NLP, tool calling, agentes ni razonamiento multimodal más allá de la detección.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehículos u objetos en tiempo real a partir de cámaras IP, gracias a su baja latencia y a que no requiere hardware especializado.
- Control de calidad industrial: inspección visual de piezas en líneas de producción para detectar defectos o componentes ausentes, integrándose en sistemas de automatización.
- Conducción autónoma y asistencia al conductor: detección de peatones, señales de tráfico y otros vehículos en entornos urbanos, con suficiente velocidad para aplicaciones embebidas.
- Robótica móvil: localización de obstáculos y objetos de interés para navegación autónoma, usando la salida de cajas para planificar trayectorias.
- Análisis de imágenes médicas (asistido): detección de estructuras anómalas en radiografías o tomografías, siempre con supervisión de un especialista.
- Recuento y seguimiento de objetos en vídeo: combinado con algoritmos de seguimiento, permite contar personas en multitudes o vehículos en aparcamientos.

## Benchmarks y rendimiento

Según el model-index declarado por el autor, el modelo alcanza un mAP@0.5 de 48,1 en el dataset COCO. No se han publicado otros benchmarks (como mAP@0.75, AP para clases específicas, o comparaciones con otras versiones de YOLO) en la información disponible.

| Dataset | Métrica | Valor |
|---|---|---|
| COCO | mAP@0.5 | 48,1 |

## Requisitos de hardware

- VRAM estimada: con pesos de 194,5 MB en FP32, la inferencia requiere aproximadamente 0,2 GB de VRAM solo para los pesos. Con activaciones y overhead, se recomienda al menos 1 GB de VRAM para imágenes de 416×416.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3060, Jetson Nano) es suficiente. Para procesamiento por lotes o vídeo en alta resolución, se sugiere una GPU de gama media (RTX 3060 o superior).
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU moderna, incluso en tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería Lucid permite ejecución directa en Python. También se puede exportar a ONNX o TensorRT para inferencia optimizada en producción.
- Latencia y throughput: no se han proporcionado mediciones oficiales. En una GPU como RTX 3060, se espera una latencia inferior a 10 ms por imagen, dada la naturaleza ligera del modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados con otras versiones de YOLO en la información proporcionada. A continuación se indican características generales conocidas, pero sin cifras exactas:

| Modelo | Parámetros | mAP@0.5 (COCO) | Año | Notas |
|---|---|---|---|---|
| YOLOv2 (este) | 51 M | 48,1 | 2017 | Arquitectura Darknet-19, port a Lucid |
| YOLOv1 | ~45 M | ~63 (en PASCAL VOC) | 2016 | Predecesor, sin anchor boxes |
| YOLOv3 | ~62 M | ~57 (COCO) | 2018 | Mejora con FPN y múltiples escalas |

Estos valores de YOLOv1 y YOLOv3 son aproximaciones basadas en conocimiento general, no están verificados en la documentación de este repositorio. Para una comparación rigurosa se recomienda consultar los papers originales.

## Limitaciones y advertencias

- Modelo antiguo: su precisión es inferior a las versiones modernas de YOLO (v5, v8) y a detectores basados en transformers (DETR).
- Licencia restrictiva: la licencia `other` heredada de los pesos de Darknet puede limitar el uso comercial. Se debe revisar la licencia original de YOLOv2 antes de desplegarlo en producción.
- Solo detección: no realiza segmentación, clasificación de imágenes ni otras tareas de visión.
- Sesgos del dataset: entrenado en COCO 2014, puede tener un rendimiento deficiente en clases poco representadas o en dominios muy diferentes (imágenes médicas, satelitales, etc.).
- Riesgo de alucinación: como todo modelo discriminativo, puede producir falsos positivos en imágenes con oclusiones o fondos complejos.
- Sin soporte para contexto largo: al ser un modelo de visión, no maneja texto ni secuencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucid-dl/yolo-v2
- Paper original (arXiv): https://arxiv.org/abs/1612.08242
- Repositorio de Lucid (GitHub): https://github.com/ChanLumerico/lucid
- Documentación de YOLOv2 en Sipeed Wiki: https://wiki.sipeed.com/ai/en/nn_models/yolov2.html
