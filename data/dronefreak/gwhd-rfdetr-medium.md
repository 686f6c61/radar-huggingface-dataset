# dronefreak/gwhd-rfdetr-medium

## Resumen

`dronefreak/gwhd-rfdetr-medium` es un detector de objetos RF-DETR Medium afinado sobre el Global Wheat Head Dataset (GWHD), un conjunto de referencia para la detección de espigas de trigo en imágenes de campo. Lo publica el autor `dronefreak` como parte de DetectionBench, un marco que busca comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. El modelo parte de `Roboflow/rf-detr-medium` y se distribuye con licencia Apache 2.0.

El interés práctico está en que ofrece un punto de comparación reproducible dentro del ecosistema RF-DETR frente a la familia YOLO en una tarea de detección densa y de objetos pequeños, típica de la agricultura de precisión. Con 33,7 millones de parámetros, es un modelo compacto que puede ejecutarse en GPUs de consumo, lo que facilita su despliegue en entornos con recursos limitados.

No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su única tarea es la detección de objetos con una sola clase (`wheat_head`) y su relevancia actual radica en la disponibilidad de pesos abiertos y de una evaluación estratificada por país que permite estimar el impacto del cambio de dominio antes de llevarlo al campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer DETR, variante Medium); framework `rfdetr` |
| Parametros totales | 33.367.236 (33,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en `checkpoint_best_total.pth`; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch), cargado vía `huggingface_hub` y la librería `rfdetr`; el repo también incluye `safetensors` según los tags |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de RF-DETR Medium, un detector basado en la familia DETR (transformer con consultas de objeto) que Roboflow mantiene como alternativa a los detectores YOLO. La variante Medium se sitúa en el punto medio de la gama RF-DETR (Nano, Small, Medium) y conserva la cabeza de detección y el esquema de asignación de consultas del modelo base. No se dispone de detalles sobre la composición exacta del dataset de entrenamiento ni sobre el número de épocas, aumentos de datos o hiperparámetros empleados; la model card solo indica que el entrenamiento y la evaluación se realizaron dentro de DetectionBench con recetas idénticas para todos los modelos comparados.

El conjunto de datos es el Global Wheat Head Dataset (GWHD), referenciado en el paper arXiv:2105.07660, orientado a la detección de espigas de trigo en imágenes aéreas y de campo con alta densidad de instancias. La innovación metodológica del proyecto no está en la arquitectura sino en la reproducibilidad: la evaluación se hace con la misma pipeline (`detectionbench-evaluate`) y las mismas métricas para todos los modelos del zoo, y se añade un desglose por país usando metadatos de dominio (`domain_metadata.json`) compilados por el autor. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Detección de objetos de una sola clase (`wheat_head`) en imágenes de campo de trigo.
- Detección densa de instancias pequeñas y solapadas, el régimen típico de las espigas en imágenes de alta resolución.
- Inferencia por lotes mediante `model.predict("imagen.jpg", threshold=0.25)` con umbral de confianza configurable.
- Integración con el ecosistema Roboflow: pesos compatibles con la librería `rfdetr` y descarga vía `huggingface_hub`.
- Evaluación con métricas estándar de detección (mAP@50, mAP@50-95, precisión, recall, F1) mediante Supervision.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo "thinking", visión general, audio ni otras modalidades más allá de la imagen de entrada.

## Casos de uso

- **Conteo de espigas en ensayos agronómicos**: el modelo detecta cada espiga individual en imágenes de parcela, lo que permite estimar densidad de siembra y rendimiento por unidad de superficie sin conteo manual. Es adecuado por su entrenamiento específico en GWHD y su coste computacional bajo.
- **Monitorización de cultivos con drones**: al ser un modelo de 33,7 M de parámetros, puede ejecutarse a bordo o en estaciones locales para procesar ortomosaicos y vuelos de inspección, generando mapas de densidad de espigas por parcela.
- **Investigación reproducible en detección de objetos**: sirve como baseline RF-DETR dentro de DetectionBench para comparar recetas de entrenamiento y arquitecturas bajo métricas idénticas, incluyendo el análisis de cambio de dominio por país.
- **Evaluación de cambio de dominio antes de desplegar**: el desglose por país permite estimar si el modelo generaliza a una región o institución concreta antes de llevarlo a producción, algo crítico en agricultura de precisión.
- **Anotación asistida (pre-etiquetado)**: las detecciones con umbral bajo pueden usarse para pre-anotar imágenes y reducir el trabajo manual en la construcción de nuevos datasets de espigas de trigo.
- **Fenotipado de alto rendimiento**: combinado con un pipeline de captura de imágenes, permite extraer características morfológicas agregadas (número y distribución de espigas) para estudios genéticos o de respuesta a tratamientos.
- **Integración en herramientas de agricultura de precisión**: al ser Apache 2.0 y ejecutable en GPU de consumo, puede incorporarse en aplicaciones de gestión de parcelas sin coste de licencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test del Global Wheat Head Dataset (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 67,1 |
| mAP@50-95 | 27,11 |
| Precision | 78,6 |
| Recall | 65,66 |
| F1 | 71,55 |
| Parametros | 33,7 M |
| FLOPs | no disponible |

Comparativa dentro del zoo de DetectionBench sobre GWHD (mismos datos y pipeline de evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO11x | 74,25 | 34,92 | 83,37 | 67,92 |
| YOLO26m | 71,58 | 33,48 | 79,94 | 62,74 |
| YOLO26s | 70,49 | 31,39 | 79,47 | 63,43 |
| YOLOv8m | 69,55 | 29,34 | 80,69 | 63,74 |
| YOLOv8s | 68,29 | 29,48 | 79,89 | 62,52 |
| **RF-DETR Medium (este modelo)** | **67,1** | **27,11** | **78,6** | **65,66** |
| YOLOv8n | 66,19 | 28,21 | 78,69 | 60,3 |
| RF-DETR Small | 64,51 | 26,12 | 77,6 | 63,61 |
| RF-DETR Nano | 53,82 | 19,65 | 72,52 | 53,64 |

El modelo queda por debajo de YOLO11x, YOLO26m/s y YOLOv8m/s en mAP@50 y mAP@50-95, pero supera a YOLOv8n y a las variantes Small y Nano de RF-DETR. Su recall (65,66 %) es competitivo frente a YOLO26m (62,74 %) y YOLOv8m (63,74 %), aunque su precisión es inferior a la de casi todos los YOLO de la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor; con 33,7 M de parámetros en FP32 el peso de los pesos ronda los 130 MB, por lo que la VRAM necesaria es modesta y vendrá dominada por el tamaño de las imágenes de entrada y el batch.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media tipo RTX 3060 deberían ser suficientes para inferencia; para entrenamiento se recomienda una GPU con al menos 16-24 GB.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no hay cifras oficiales de consumo de memoria.
- Opciones de despliegue: librería `rfdetr` con PyTorch; descarga de pesos vía `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles; el autor no publica FLOPs ni tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (GWHD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Medium (este) | 33,7 M | imagen (resolución no documentada) | 67,1 | Apache 2.0 | Hugging Face |
| YOLO11x | no disponible | imagen | 74,25 | AGPL-3.0 (Ultralytics) | Ultralytics / Hugging Face |
| YOLOv8m | no disponible | imagen | 69,55 | AGPL-3.0 (Ultralytics) | Ultralytics / Hugging Face |
| RF-DETR Small | no disponible | imagen | 64,51 | Apache 2.0 | Hugging Face |

La comparación directa es difícil porque el autor no publica parámetros ni FLOPs de los modelos YOLO en su tabla. La diferencia clave frente a YOLO es la licencia: RF-DETR se distribuye bajo Apache 2.0, mientras que los modelos YOLO de Ultralytics usan AGPL-3.0, lo que puede condicionar su uso comercial cerrado.

## Limitaciones y advertencias

- **Una sola clase**: el modelo solo detecta `wheat_head`; no es reutilizable para otras clases sin reentrenamiento.
- **Rendimiento inferior a YOLO en la misma tarea**: pierde entre 2,5 y 7 puntos de mAP@50 frente a YOLO11x, YOLO26m/s y YOLOv8m/s en la comparativa del propio autor.
- **Sesgo de dominio**: el desglose por país que menciona el autor sugiere que el rendimiento puede variar según la región o institución; conviene validar en el dominio objetivo antes de desplegar.
- **Riesgo de falsos positivos y negativos**: con precisión del 78,6 % y recall del 65,66 %, aproximadamente un tercio de las espigas no se detectan en el test; en aplicaciones de conteo esto puede sesgar las estimaciones.
- **Datos de benchmarks no verificados**: las métricas están marcadas como `verified: false` en el model-index y proceden del propio autor.
- **Documentación incompleta**: no se publican FLOPs, resolución de entrada, hiperparámetros de entrenamiento ni requisitos de hardware.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base (`Roboflow/rf-detr-medium`) y las dependencias deben revisarse por si imponen condiciones adicionales.
- **Sin capacidades de lenguaje**: no debe confundirse con un modelo conversacional; no procesa texto ni puede integrarse en pipelines de agentes sin un componente adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gwhd-rfdetr-medium
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Medium: https://huggingface.co/Roboflow/rf-detr-medium
- Librería Supervision (métricas): https://github.com/roboflow/supervision
- Paper Global Wheat Head Dataset: https://arxiv.org/abs/2105.07660
- Paper RF-DETR (referenciado en tags): https://arxiv.org/abs/2511.09554
- Paper DINOv2 (referenciado en tags): https://arxiv.org/abs/2304.07193
