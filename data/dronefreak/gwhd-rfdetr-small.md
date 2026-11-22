# dronefreak/gwhd-rfdetr-small

## Resumen

RF-DETR Small finetuned on Global Wheat Head Dataset es un detector de objetos especializado en la detección densa de espigas de trigo, desarrollado por el usuario dronefreak dentro del proyecto DetectionBench. Se trata de un ajuste fino del modelo base Roboflow/rf-detr-small, un transformer de detección (variante de DETR con atención) de 31,79 millones de parámetros, entrenado específicamente sobre el Global Wheat Head Dataset (GWHD) para la localización de cabezas de trigo en imágenes de campo.

El modelo resuelve un problema concreto de agricultura de precisión: contar y localizar espigas de trigo en fotografías aéreas o terrestres de cultivos, una tarea de detección densa con objetos pequeños, numerosos y solapados. Su relevancia radica en que forma parte de un marco de evaluación reproducible (DetectionBench) que entrena y evalúa distintos detectores con recetas idénticas, lo que permite comparaciones justas entre arquitecturas YOLO y DETR sobre el mismo dataset.

Con licencia Apache 2.0, 32,1 millones de parámetros y un repositorio de 0,3 GB, es un modelo ligero y desplegable en hardware modesto. No es un modelo generativo ni multilingüe: su única tarea es la detección de una clase (wheat_head) y su salida son cajas delimitadoras con puntuaciones de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de detección, variante Small) |
| Parametros totales | 31.790.948 (32,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoint PyTorch (checkpoint_best_total.pth) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Small de Roboflow, un detector de la familia DETR (Detection Transformer) que emplea un backbone y un decoder transformer para predecir conjuntos de cajas delimitadoras directamente, sin anchors ni supresión no máxima clásica en su formulación original. La variante Small cuenta con 31,79 millones de parámetros. El ajuste fino se realizó sobre el Global Wheat Head Dataset, un conjunto de imágenes de campo con anotaciones de espigas de trigo, orientado a la detección densa de objetos pequeños.

El entrenamiento y la evaluación se enmarcan en DetectionBench, un framework que aplica recetas de entrenamiento y métricas de evaluación idénticas a distintos detectores para permitir comparaciones reproducibles. La model card no detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de aumento de datos específicas; esa información no está disponible. La evaluación se realizó con las métricas de detección de la librería Supervision (MeanAveragePrecision), que reporta mAP, precisión y recall sin generar matriz de confusión.

## Capacidades

- Detección de objetos de una sola clase: localiza espigas de trigo (wheat_head) en imágenes y devuelve cajas delimitadoras con puntuaciones de confianza.
- Detección densa: diseñado para escenas con muchos objetos pequeños y solapados, típicas de imágenes de cultivos.
- Inferencia con umbral configurable: la API `predict(image, threshold=...)` permite ajustar el umbral de confianza.
- Evaluación por país: la model card incluye un desglose de rendimiento por país o institución contribuyente, útil para analizar el desplazamiento de dominio (domain shift).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de una sola tarea.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Monitorización de cultivos de trigo: el modelo detecta y cuenta espigas en imágenes de campo, lo que permite estimar la densidad de espigado por parcela y apoyar decisiones de manejo agronómico.
- Agricultura de precisión con drones: al ser un modelo ligero (32,1 M de parámetros), puede integrarse en pipelines de procesamiento de imágenes aéreas capturadas por drones para generar mapas de densidad de espigas.
- Fenotipado vegetal en investigación: los investigadores pueden usar el modelo para cuantificar el número de espigas por imagen de forma automatizada en ensayos de variedades, sustituyendo el conteo manual.
- Estimación de rendimiento: combinando el conteo de espigas con datos de grano por espiga, el detector sirve como componente de un sistema de predicción de producción.
- Evaluación comparativa de detectores: gracias a su integración en DetectionBench, sirve como referencia reproducible para comparar arquitecturas DETR frente a YOLO sobre el mismo dataset.
- Detección en entornos con dominio variable: el desglose por país de la model card permite evaluar su robustez antes de desplegarlo en una región concreta, y elegir el umbral adecuado según el dominio.
- Prototipado rápido en hardware modesto: su tamaño reducido y la licencia Apache 2.0 facilitan su uso en pruebas de concepto y despliegues en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del Global Wheat Head Dataset (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 64,51 |
| mAP@50-95 | 26,12 |
| Precision | 77,6 |
| Recall | 63,61 |
| F1 Score | 69,91 |
| Parametros | 32,1 M |
| FLOPs | no disponible |

Comparativa del model zoo de DetectionBench sobre el mismo dataset:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO11x | 74,25 | 34,92 | 83,37 | 67,92 |
| YOLO26m | 71,58 | 33,48 | 79,94 | 62,74 |
| YOLO26s | 70,49 | 31,39 | 79,47 | 63,43 |
| YOLOv8m | 69,55 | 29,34 | 80,69 | 63,74 |
| YOLOv8s | 68,29 | 29,48 | 79,89 | 62,52 |
| RF-DETR Medium | 67,10 | 27,11 | 78,60 | 65,66 |
| YOLOv8n | 66,19 | 28,21 | 78,69 | 60,30 |
| RF-DETR Small (este modelo) | 64,51 | 26,12 | 77,60 | 63,61 |
| RF-DETR Nano | 53,82 | 19,65 | 72,52 | 53,64 |

Rendimiento por clase: la única clase (wheat_head) obtiene mAP@50 de 64,51 y mAP@50-95 de 26,12.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 31,79 M de parámetros, el peso en FP32 ronda los 127 MB y en FP16 unos 64 MB, por lo que la VRAM necesaria es modesta (del orden de 1-2 GB incluyendo activaciones y batch, estimación orientativa no publicada).
- GPU recomendadas: no hay recomendaciones oficiales; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería poder ejecutarlo con holgura.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el reducido número de parámetros; no se han publicado mediciones oficiales.
- Opciones de despliegue: la librería `rfdetr` con `huggingface_hub` para descargar los pesos; el checkpoint está en formato PyTorch (`.pth`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (GWHD) | mAP@50-95 (GWHD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Small (este modelo) | 32,1 M | 64,51 | 26,12 | Apache 2.0 | Hugging Face |
| RF-DETR Medium | no disponible | 67,10 | 27,11 | no disponible en la informacion | Hugging Face (Roboflow) |
| RF-DETR Nano | no disponible | 53,82 | 19,65 | no disponible en la informacion | Hugging Face (Roboflow) |
| YOLOv8s | no disponible | 68,29 | 29,48 | no disponible en la informacion | Ultralytics |
| YOLO11x | no disponible | 74,25 | 34,92 | no disponible en la informacion | Ultralytics |

En el mismo dataset y con la misma receta de DetectionBench, los modelos YOLO superan en mAP@50 a RF-DETR Small, mientras que RF-DETR Medium queda por encima de este último pero por debajo de YOLOv8s y YOLO26s. RF-DETR Small supera a RF-DETR Nano en todas las métricas.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta espigas de trigo (wheat_head); no es reutilizable para otras clases sin reentrenamiento.
- Riesgo de falsos positivos y negativos: con precisión del 77,6 % y recall del 63,61 %, aproximadamente un tercio de las espigas reales no se detectan en el split de test.
- Desplazamiento de dominio: el rendimiento varía según el país o institución de origen de las imágenes; la model card incluye un desglose por país precisamente porque el dominio puede importar más que la métrica agregada en despliegues de campo.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; no han sido validados de forma independiente.
- Sin información sobre sesgos: no se documentan sesgos específicos más allá del posible sesgo de dominio geográfico del dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin datos de cuantización ni de latencia: no hay información publicada sobre optimizaciones de despliegue.
- No apto para tareas de lenguaje, razonamiento o generación: es exclusivamente un detector visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gwhd-rfdetr-small
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-small
- Dataset GWHD en Hugging Face: https://huggingface.co/datasets/dronefreak/GWHD
- Librería Supervision (métricas de evaluación): https://github.com/roboflow/supervision
- Paper del Global Wheat Head Dataset (arXiv:2105.07660): https://arxiv.org/abs/2105.07660
- Paper RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
