# amcm/brain-tumor-yolo11n

## Resumen

El modelo `amcm/brain-tumor-yolo11n` es un detector de objetos basado en la arquitectura YOLO11n, fine-tuneado por el autor amcm para la detección de tumores cerebrales en imágenes de resonancia magnética (MRI). El modelo identifica y localiza tres tipos de tumores: meningioma, glioma y tumor pituitario, mediante cajas delimitadoras. Está construido sobre el checkpoint base YOLO11n de Ultralytics y entrenado con el dataset público Brain Tumor YOLO de Kaggle, que se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su potencial como herramienta de apoyo en entornos de investigación y exploración médica, ofreciendo una solución ligera (variante nano) que puede ejecutarse en hardware modesto. Sin embargo, el propio autor indica que el modelo se proporciona únicamente con fines de exploración, no como dispositivo clínico. Al ser un modelo de visión, no maneja contexto textual; su entrada son imágenes y su salida son detecciones con coordenadas y clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 (por YOLO11 base); dataset de entrenamiento bajo Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

YOLO11n es una red neuronal convolucional de detección de objetos en una sola pasada, diseñada por Ultralytics como la variante "nano" de la familia YOLO11, optimizada para baja latencia y despliegue en dispositivos con recursos limitados. El modelo fue fine-tuneado a partir del checkpoint preentrenado de YOLO11n sobre el dataset Brain Tumor YOLO de Kaggle, que contiene imágenes de MRI anotadas con cajas para las clases meningioma, glioma y tumor pituitario. No se especifican en la documentación disponible el número de épocas, el tamaño de lote, la resolución de entrada ni las técnicas de aumento de datos empleadas. Tampoco se detalla si se aplicaron estrategias como cuantización o poda posterior al entrenamiento.

## Capacidades

- Detección de tumores cerebrales en imágenes MRI, devolviendo cajas delimitadoras y etiquetas de clase.
- Clasificación en tres categorías: meningioma, glioma y tumor pituitario.
- Inferencia en tiempo real gracias a la arquitectura YOLO11n, adecuada para aplicaciones de bajo coste computacional.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión por computadora.

## Casos de uso

- Asistencia al diagnóstico radiológico: el modelo puede pre-seleccionar regiones sospechosas en estudios de MRI, ayudando al radiólogo a priorizar la revisión de casos. Su rapidez permite procesar grandes volúmenes de imágenes en poco tiempo.
- Triaje de imágenes en entornos de investigación: en estudios epidemiológicos o ensayos clínicos, puede filtrar automáticamente imágenes con presencia de tumores, reduciendo el trabajo manual de anotación.
- Formación de personal médico: sirve como herramienta didáctica para que estudiantes de medicina practiquen la identificación de tumores cerebrales comparando sus propias observaciones con las detecciones del modelo.
- Desarrollo de sistemas de apoyo en telemedicina: integrado en plataformas de análisis remoto de imágenes, puede ofrecer una primera impresión automática en zonas con escasez de especialistas.
- Investigación en aprendizaje automático aplicado a salud: como punto de partida para experimentos de fine-tuning con otros datasets de MRI o para probar técnicas de aumento de datos y regularización.
- Validación de pipelines de despliegue: al ser un modelo pequeño, es útil para probar flujos de inferencia en edge devices (Raspberry Pi, Jetson Nano) antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

La model card del autor reporta las siguientes métricas de validación, sin especificar el conjunto de validación ni el protocolo exacto:

| Metrica | Valor |
|---|---|
| Precision | 88.3% |
| Recall | 93.2% |
| mAP50 | 96.1% |
| mAP50-95 | 66.7% |

No se han publicado comparaciones con otros modelos de detección de tumores en MRI en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado el tamaño reducido de YOLO11n (la variante nano tiene alrededor de 2.6 millones de parámetros, aunque este dato no se confirma en la documentación del modelo).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con tiempos de inferencia aceptables para imágenes individuales.
- Es compatible con hardware de bajo consumo como NVIDIA Jetson Nano o Raspberry Pi (con aceleración OpenCV).
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, CoreML o TFLite para inferencia en producción. También puede usarse con servidores de inferencia como Triton o TorchServe.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de YOLO11n suele estar por debajo de 5 ms por imagen, aunque no se dispone de mediciones específicas para este fine-tune.

## Comparativa con modelos similares

No se dispone de información comparativa publicada entre este modelo y otras alternativas de detección de tumores cerebrales en MRI (por ejemplo, modelos basados en Faster R-CNN, SSD o YOLOv8). La ausencia de benchmarks estandarizados y de métricas sobre el mismo conjunto de validación impide establecer una comparación rigurosa. Se recomienda al usuario evaluar el modelo en su propio dataset antes de adoptarlo.

## Limitaciones y advertencias

- El modelo se proporciona únicamente con fines de exploración; no está validado para uso clínico ni diagnóstico médico.
- El rendimiento puede degradarse con imágenes de MRI adquiridas con protocolos diferentes a los del dataset de entrenamiento, o con variaciones en el preprocesado (contraste, resolución, artefactos).
- El dataset de Kaggle puede contener sesgos de población, tipo de escáner o distribución de clases, lo que limita la generalización a otros entornos.
- No se especifican métricas de calibración ni umbrales de confianza recomendados; el usuario debe ajustarlos según su caso.
- La licencia AGPL-3.0 de YOLO11 impone obligaciones de copyleft si se redistribuye el modelo o se ofrece como servicio; para uso comercial cerrado se requiere licencia Enterprise de Ultralytics.
- El dataset de entrenamiento no se redistribuye con el modelo; es necesario obtenerlo desde Kaggle bajo sus propios términos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amcm/brain-tumor-yolo11n
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/abhit007pandey/brain-tumor-yolo-
- Ultralytics YOLO11 (documentación y licencias): https://docs.ultralytics.com/models/yolo11/
