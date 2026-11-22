# dronefreak/hrp4k-yolo26s

## Resumen

YOLO26s finetuneado sobre HRP4K es un detector de objetos de una sola etapa especializado en la deteccion de baches (potholes) en imagenes de carretera de alta resolucion. Lo desarrolla el usuario dronefreak como parte de DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas. El modelo parte de Ultralytics/YOLO26 en su variante small y se ajusta sobre el conjunto HRP4K, con una unica clase de salida: pothole.

El modelo resuelve un problema concreto de inspeccion de infraestructuras: localizar danos en el firme a partir de imagenes de alta resolucion, donde los objetos son pequenos y poco contrastados. Con 9.986.622 parametros y 22,8 GFLOPs a 640 px, es lo bastante ligero para desplegarse en GPUs de consumo y en entornos de borde, y su interes actual radica en que forma parte de un zoo de modelos publicados con resultados comparables y reproducibles sobre el mismo benchmark.

La relevancia practica es doble: por un lado ofrece un punto de partida ya entrenado para deteccion de baches; por otro, su publicacion junto a las metricas de RF-DETR y otras variantes de YOLO permite situar su rendimiento relativo sin necesidad de reentrenar. El modelo se distribuye con licencia AGPL-3.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 9.986.622 (10,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en best.pt; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, best.pt); repo con safetensors como tag |
| Entrada | imagenes; entrenamiento a 1536 px |
| Clases | 1 (pothole) |
| FLOPs | 22,8 B a 640 px |
| Framework | Ultralytics YOLO |
| Dataset de entrenamiento | HRP4K (dronefreak/HRP4K) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de una etapa de la familia YOLO26 de Ultralytics, en variante small. La arquitectura sigue el esquema habitual de la familia: backbone convolucional para extraccion de caracteristicas, cuello de agregacion multiescala y cabecera de deteccion que predice cajas y clases directamente, sin etapa de propuesta de regiones. El modelo base es Ultralytics/YOLO26 y este checkpoint es un finetune supervisado sobre una unica clase.

El entrenamiento se realizo con el toolkit DetectionBench sobre el dataset HRP4K, con imagenes a 1536 px, optimizador AdamW, learning rate inicial de 0,001, batch automatico (Ultralytics AutoBatch) y semilla 0. Se configuro un maximo de 150 epocas con paciencia de early stopping de 30, pero el entrenamiento se detuvo a las 86 epocas. No se documenta en la informacion disponible el volumen de tokens ni la composicion detallada del dataset, ni si se aplicaron tecnicas de aumento adicionales mas alla de las por defecto de Ultralytics. Tampoco se indica el uso de RLHF, DPO ni tecnicas de alineacion, algo que no aplica a un detector visual.

La innovacion destacable no esta en la arquitectura sino en el marco de evaluacion: DetectionBench aplica la misma receta de entrenamiento y el mismo pipeline de metricas (`detectionbench-evaluate`) a todos los modelos, lo que permite comparaciones honestas entre familias (YOLO26, YOLOv8, RF-DETR) sobre el mismo split de test.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica baches en imagenes de carretera, con una unica clase de salida (pothole).
- Deteccion de objetos pequenos en imagenes de alta resolucion: el entrenamiento a 1536 px esta orientado a preservar detalle de danos de tamano reducido.
- Inferencia por imagen o por lotes mediante la API de Ultralytics (`model.predict`), con umbral de confianza configurable.
- Integracion con el ecosistema Ultralytics: exportacion a otros formatos soportados por la libreria (ONNX, TensorRT, etc., segun lo permita la version instalada; no documentado por el autor).
- Capacidades de vision adicionales (segmentacion, pose, clasificacion): no disponibles; el checkpoint es exclusivamente de deteccion.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingues: no aplica, es un modelo de vision sin componente de lenguaje.
- Modo thinking, vision multimodal o audio: no disponible.

## Casos de uso

- Inspeccion automatizada de firmes con vehiculos equipados con camara: el modelo procesa fotogramas de carretera y devuelve cajas de baches, lo que permite generar inventarios de danos por tramo sin revision manual. Su tamano de 10 M de parametros facilita la inferencia a bordo.
- Priorizacion de reparaciones municipales: a partir de las detecciones sobre imagenes georreferenciadas, un ayuntamiento puede ordenar las actuaciones por densidad y severidad de baches detectados, usando el modelo como primer filtro sobre grandes volumenes de imagenes.
- Procesamiento por lotes de imagenes de dron o satelite de alta resolucion: el entrenamiento a 1536 px y su enfasis en objetos pequenos lo hacen adecuado para barridos de tramos largos de via donde el bache ocupa pocos pixeles.
- Control de calidad tras obras de repavimentacion: comparar detecciones antes y despues de una intervencion para verificar que no quedan danos residuales en el tramo tratado.
- Integracion en pipelines de vision con Ultralytics: al cargarse con `YOLO(weights)` y `model.predict`, encaja en flujos existentes de la libreria, con exportacion a formatos de despliegue y su uso dentro de servicios de inferencia propios.
- Benchmarking y experimentacion academica: sirve como linea base reproducible para comparar nuevos detectores o recetas de aumento sobre HRP4K, ya que sus metricas y configuracion de entrenamiento estan publicadas y son replicables con DetectionBench.
- Alerta temprana en flotas de mantenimiento: ejecucion periodica sobre imagenes capturadas por vehiculos de servicio para detectar aparicion de nuevos baches y disparar ordenes de inspeccion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de HRP4K, con el pipeline estandar de DetectionBench. No verificados de forma independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 48,65 |
| mAP@50-95 | 27,16 |
| Precision | 60,04 |
| Recall | 46,91 |
| F1 | 52,67 |

Comparativa del zoo HRP4K publicado por el autor (mismas condiciones de entrenamiento y evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 56,04 | 31,54 | 62,01 | 55,48 |
| RF-DETR Medium | 55,66 | 31,81 | 64,25 | 51,90 |
| RF-DETR Nano | 52,06 | 28,62 | 62,03 | 47,88 |
| YOLO26m | 51,62 | 29,83 | 57,33 | 49,89 |
| YOLO26s (este modelo) | 48,65 | 27,16 | 60,04 | 46,91 |
| YOLOv8n | 48,58 | 26,24 | 58,00 | 46,58 |
| YOLOv8s | 47,59 | 26,71 | 59,81 | 44,30 |
| YOLOv8m | 47,26 | 26,77 | 59,56 | 44,52 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 10 M de parametros, los pesos en FP32 ocupan del orden de 40 MB; en FP16, unos 20 MB. La VRAM real la domina el tamano de la imagen de entrada y el batch, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia a 640 px con batch pequeno; para lotes grandes o entrada a 1536 px conviene disponer de 8-16 GB (RTX 3060/4060, RTX 4070/4080, A10, L4). Para entrenamiento o evaluacion a gran escala, A100 o H100 aportan margen.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante con suficiente VRAM para el batch elegido). Tambien es viable en CPU para inferencia puntual, aunque con mayor latencia.
- Opciones de despliegue: Ultralytics (PyTorch) como via principal; exportacion a ONNX, TensorRT u OpenVINO segun la version de la libreria; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni FPS; los 22,8 GFLOPs a 640 px permiten estimar un coste bajo, pero no se ofrece cifra medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (HRP4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s (este modelo) | 10,0 M | imagen, entrenado a 1536 px | 48,65 | AGPL-3.0 | Hugging Face (dronefreak/hrp4k-yolo26s) |
| YOLO26m | no disponible | imagen | 51,62 | AGPL-3.0 (base Ultralytics) | Hugging Face (zoo DetectionBench) |
| YOLOv8n | no disponible | imagen | 48,58 | AGPL-3.0 (base Ultralytics) | Hugging Face (zoo DetectionBench) |
| RF-DETR Small | no disponible | imagen | 56,04 | no disponible | Hugging Face (zoo DetectionBench) |

En la comparativa del propio autor, RF-DETR Small lidera en mAP@50 y mAP@50-95, mientras que YOLO26s queda por delante de las variantes de YOLOv8 en mAP@50 y precision, y por detras de YOLO26m. La ventaja de YOLO26s frente a YOLO26m es su menor coste computacional, no su precision.

## Limitaciones y advertencias

- Una sola clase: el modelo solo detecta pothole. No reconoce otras clases de dano en el firme (grietas, hundimientos, baches de distinto tipo) salvo que se reentrene.
- Rendimiento modesto en localizacion estricta: mAP@50-95 de 27,16 % y recall de 46,91 % indican que, con umbrales exigentes, se pierden detecciones; en produccion conviene ajustar el umbral de confianza y validar sobre el dominio objetivo.
- Dependencia del dominio de HRP4K: el modelo se ha entrenado sobre un unico dataset de imagenes de carretera de alta resolucion; su comportamiento en otras condiciones de iluminacion, camaras, paises o resoluciones no esta documentado.
- Riesgo de falsos positivos y negativos: la precision de 60,04 % implica una proporcion relevante de detecciones incorrectas; en aplicaciones de decision automatica debe acompanarse de revision humana.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que use el modelo en servicios de red; para uso comercial cerrado puede requerir licencia comercial de Ultralytics o una revision legal especifica. Es un caveat importante para produccion.
- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false`; no hay evaluacion independiente publicada.
- Sin datos de sesgo: no se documentan analisis de sesgo ni de robustez frente a condiciones adversas (lluvia, noche, desenfoque).
- Sin informacion sobre cuantizacion ni latencia: no hay guia del autor para despliegue en borde con precision reducida ni cifras de rendimiento en tiempo real.
- Repositorio de 0,0 GB y solo 18 descargas en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/hrp4k-yolo26s
- Dataset HRP4K: https://huggingface.co/datasets/dronefreak/HRP4K
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado en los tags (arxiv:2606.03748): https://arxiv.org/abs/2606.03748
