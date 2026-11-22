# dronefreak/hrp4k-yolov8s

## Resumen

hrp4k-yolov8s es un detector de objetos YOLOv8s ajustado (fine-tuned) por el autor dronefreak sobre el conjunto de datos HRP4K, un benchmark de imagenes de alta resolucion orientado a la deteccion de baches y danos en la calzada. El modelo parte de los pesos preentrenados de Ultralytics/YOLOv8 y se entrena dentro del marco DetectionBench, un framework que busca reproducibilidad en la comparacion de detectores modernos aplicando recetas de entrenamiento y metricas de evaluacion identicas sobre multiples datasets del mundo real.

El problema que resuelve es acotado pero concreto: la deteccion automatica de baches (clase unica `pothole`) en imagenes de alta resolucion, un caso de deteccion de objetos pequenos relevante para el mantenimiento de infraestructuras viarias. Al tratarse de un YOLOv8s, el modelo pesa apenas 11,2 millones de parametros y consume 28,6 GFLOPs a 640 px, lo que lo situa en el segmento de detectores ligeros aptos para despliegue en tiempo real o en dispositivos con recursos limitados.

Su relevancia actual reside sobre todo en el contexto de DetectionBench: el autor publica un "model zoo" completo sobre HRP4K con resultados comparables entre RF-DETR, YOLO26 y distintas variantes de YOLOv8, lo que permite situar este checkpoint dentro de una comparativa homogenea en lugar de depender de cifras aisladas. La licencia AGPL-3.0 y el escaso numero de descargas (20) indican que se trata de un artefacto de investigacion y benchmarking mas que de un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (CNN detector, framework Ultralytics) |
| Parametros totales | 11.156.019 (11,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (tag del repo), `best.pt` (PyTorch/Ultralytics) |
| FLOPs | 28,6 GFLOPs a 640 px |
| Tamano del repositorio | 0,0 GB |
| Clases | 1 (`pothole`) |
| Resolucion de entrenamiento | 1536 px |
| Libreria | ultralytics |

## Arquitectura y entrenamiento

El modelo es un YOLOv8s, es decir, la variante "small" de la familia YOLOv8 de Ultralytics: una red neuronal convolucional de deteccion en una etapa (single-stage) con cabeza de prediccion densa, pensada para equilibrar precision y coste computacional. No incorpora mecanismos de tipo transformer, MoE o SSM; se trata de un detector convolucional clasico optimizado para inferencia rapida. La cabeza predice cajas delimitadoras y una unica clase, `pothole`.

El ajuste fino se realizo con el toolkit DetectionBench sobre el dataset HRP4K, con imagenes de entrada a 1536 px (resolucion alta, coherente con el objetivo de detectar objetos pequenos como baches en escenas viales). La configuracion de entrenamiento registrada incluye optimizador AdamW, learning rate inicial de 0,001, batch size automatico mediante Ultralytics AutoBatch, semilla 0, un maximo configurado de 150 epocas y parada temprana con paciencia 30; finalmente se completaron 108 epocas. No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion exacta del dataset ni uso de RLHF/DPO (tecnicas no aplicables a un detector de vision). La innovacion destacable no esta en la arquitectura sino en la metodologia: receta de entrenamiento estandarizada y evaluacion reproducible mediante `detectionbench-evaluate`.

## Capacidades

- Deteccion de objetos de una unica clase (`pothole`) en imagenes, con salida de cajas delimitadoras y puntuaciones de confianza.
- Deteccion de objetos pequenos en imagenes de alta resolucion (entrenado a 1536 px).
- Inferencia sobre imagenes individuales, lotes, directorios, video o streams mediante la API `model.predict` de Ultralytics.
- Ajuste del umbral de confianza en inferencia (por ejemplo `conf=0.25`).
- Exportacion a otros formatos de despliegue mediante las utilidades de Ultralytics (ONNX, TensorRT, etc.), aunque no se detalla en la informacion disponible que exportaciones se han validado.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades agenticas, vision-lenguaje, audio ni soporte multilingue: es exclusivamente un detector visual.

## Casos de uso

- Inspeccion automatizada de calzadas: procesar lotes de imagenes capturadas por vehiculos de inspeccion o drones para localizar baches y priorizar reparaciones; el modelo esta entrenado especificamente sobre HRP4K con imagenes de alta resolucion, lo que encaja con este escenario.
- Mantenimiento predictivo de infraestructuras municipales: integrar el detector en un pipeline que etiquete tramos de via con presencia de danos y genere ordenes de trabajo a partir de las detecciones con umbral de confianza ajustado.
- Procesamiento de video a bordo de vehiculos: al ser un YOLOv8s de 11,2 M de parametros y 28,6 GFLOPs a 640 px, es viable en hardware embebido o GPU de gama consumer para analisis en tiempo (casi) real de grabaciones viales.
- Filtrado previo en sistemas de gestion de activos viales: usar el modelo como primera etapa para reducir el numero de imagenes que requieren inspeccion humana, apoyandose en las curvas precision-recall publicadas para fijar el punto de operacion.
- Benchmarking y comparacion de detectores: servir como referencia reproducible dentro de DetectionBench para comparar YOLOv8s con RF-DETR o YOLO26 bajo la misma receta y metricas.
- Investigacion en deteccion de objetos pequenos: utilizar el checkpoint como linea base para experimentar con resoluciones de entrada, aumentos de datos o arquitecturas alternativas sobre HRP4K.
- Prototipado rapido con Ultralytics: cargar `best.pt` con `YOLO(weights)` y ejecutar `predict` para validar rapidamente la viabilidad de un caso de uso antes de invertir en un entrenamiento propio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de HRP4K, evaluados con el pipeline estandar de DetectionBench (`detectionbench-evaluate`). No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 47,59 |
| mAP@50-95 | 26,71 |
| Precision | 59,81 |
| Recall | 44,3 |
| F1 | 50,9 |

Comparativa del model zoo HRP4K publicado por el autor (mismas metricas, mismo pipeline):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 56,04 | 31,54 | 62,01 | 55,48 |
| RF-DETR Medium | 55,66 | 31,81 | 64,25 | 51,9 |
| RF-DETR Nano | 52,06 | 28,62 | 62,03 | 47,88 |
| YOLO26m | 51,62 | 29,83 | 57,33 | 49,89 |
| YOLO26s | 48,65 | 27,16 | 60,04 | 46,91 |
| YOLOv8n | 48,58 | 26,24 | 58,0 | 46,58 |
| **YOLOv8s (este modelo)** | **47,59** | **26,71** | **59,81** | **44,3** |
| YOLOv8m | 47,26 | 26,77 | 59,56 | 44,52 |

Rendimiento por clase: una unica clase (`pothole`) con mAP@50 de 47,59 y mAP@50-95 de 26,71, identicos a las metricas globales al existir solo una clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (11,2 M de parametros, ~45 MB en FP32 para los pesos) el consumo es muy bajo y dominado por activaciones e imagenes de entrada. Con entradas a 1536 px el coste de activaciones crece respecto a 640 px.
- GPU recomendadas: cualquier GPU moderna es suficiente; para produccion con throughput alto se puede usar A100, H100, L4 o T4; para prototipado basta una RTX 4090, RTX 3090 o incluso GPUs de gama media.
- Cabe en GPU consumer: si, con holgura; un detector de 11,2 M de parametros no deberia suponer un cuello de botella de memoria en tarjetas consumer con 8 GB o mas.
- Opciones de despliegue: Ultralytics (PyTorch) como opcion nativa documentada; exportacion a ONNX o TensorRT mediante las utilidades de Ultralytics (no se especifica en la informacion disponible que formatos se han validado). vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia de coste computacional, 28,6 GFLOPs por imagen a 640 px.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (HRP4K) | Licencia | Disponibilidad |
|---|---|---|---|---|
| hrp4k-yolov8s | 11,2 M | imagen, entreno a 1536 px | 47,59 | AGPL-3.0 | Hugging Face (dronefreak) |
| YOLOv8n (HRP4K) | no disponible en la informacion | imagen | 48,58 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak, model zoo) |
| YOLOv8m (HRP4K) | no disponible en la informacion | imagen | 47,26 | AGPL-3.0 (Ultralytics) | Hugging Face (dronefreak, model zoo) |
| YOLO26s (HRP4K) | no disponible en la informacion | imagen | 48,65 | no disponible | Hugging Face (dronefreak, model zoo) |
| RF-DETR Small (HRP4K) | no disponible en la informacion | imagen | 56,04 | no disponible | Hugging Face (dronefreak, model zoo) |

En terminos de mAP@50 sobre HRP4K, YOLOv8s queda por debajo de YOLOv8n (48,58), YOLO26s (48,65) y RF-DETR Small (56,04), y por encima de YOLOv8m (47,26). En mAP@50-95 supera ligeramente a YOLOv8n (26,71 frente a 26,24) y a YOLOv8m (26,77 es practicamente equivalente). La diferencia con RF-DETR Small es de aproximadamente 8,5 puntos de mAP@50.

## Limitaciones y advertencias

- Modelo de una unica clase: solo detecta `pothole`; no sirve para otros tipos de dano viario, peatones, vehiculos u objetos genericos.
- Ambito de dominio muy estrecho: entrenado sobre HRP4K; el rendimiento puede degradarse fuera de ese dominio (otras camaras, iluminacion, paises, tipos de firme).
- Metricas no verificadas: todos los resultados del model-index tienen `verified: false`; proceden del propio autor y deben tratarse como declaraciones, no como evaluaciones independientes.
- Recall moderado (44,3 %): con el umbral usado en la evaluacion se pierden mas de la mitad de los baches reales; en produccion habria que ajustar el umbral de confianza y validar la curva precision-recall.
- Riesgo de falsos positivos y negativos propios de un detector ligero; no hay informacion disponible sobre sesgos demograficos o geograficos del dataset HRP4K.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en servicios en red requiere revisar cuidadosamente las implicaciones legales. No es una licencia permisiva tipo Apache-2.0 o MIT.
- No hay informacion disponible sobre cuantizacion, latencias medidas ni exportaciones validadas, por lo que cualquier afirmacion de produccion sobre rendimiento en hardware concreto debe medirse in situ.
- El repositorio es de tamano 0,0 GB segun los metadatos, lo que puede indicar que los pesos no estan incluidos directamente y se cargan via `hf_hub_download` del archivo `best.pt`; conviene verificar la integridad de los artefactos antes de desplegar.
- Modelo con muy baja adopcion (20 descargas, 0 likes): poca validacion comunitaria y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/hrp4k-yolov8s
- Dataset HRP4K: https://huggingface.co/datasets/dronefreak/HRP4K
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLOv8
