# dronefreak/hrp4k-yolo26m

## Resumen

YOLO26m finetuneado sobre HRP4K es un detector de objetos de una sola etapa especializado en la detección de baches y daños en la calzada en imágenes de alta resolución. Lo desarrolla el usuario `dronefreak` como parte de DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. El modelo parte de Ultralytics/YOLO26 en su variante `m` (media) y se ha ajustado con el conjunto de datos HRP4K, que contiene imágenes de carretera a 4K con anotaciones de la clase `pothole`.

El interés del modelo es doble. Por un lado, ofrece un punto de referencia reproducible para la detección de objetos pequeños en imágenes de alta resolución, un escenario especialmente difícil porque los baches ocupan pocos píxeles en la imagen original. Por otro lado, su inclusión en el zoo de modelos de DetectionBench permite compararlo directamente con alternativas como RF-DETR (Nano, Small y Medium) y otros modelos de la familia YOLO bajo exactamente las mismas condiciones de evaluación.

Con 21,83 millones de parámetros y un coste de 75,4 GFLOPs a 640 píxeles, es un modelo de tamaño medio pensado para despliegue en entornos con recursos moderados, desde GPU de consumo hasta dispositivos de borde. La licencia AGPL-3.0 es un factor determinante para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector de una etapa tipo CNN |
| Parametros totales | 21.830.622 (21,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en `best.pt`; Ultralytics permite exportación a ONNX, TensorRT, OpenVINO y otros formatos, pero el autor no documenta cuantizaciones concretas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch, librería Ultralytics); el repo también contiene `results.csv`, `args.yaml` y curvas de evaluación |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26 en variante media, una arquitectura CNN de una sola etapa con cabeza de detección anclada y asignación dinámica de etiquetas, propia de la familia Ultralytics. El ajuste fino se realizó con la herramienta DetectionBench sobre el conjunto HRP4K, con imágenes de entrada a 1536 píxeles durante el entrenamiento, optimizador AdamW con tasa de aprendizaje inicial de 0,001, batch automático (AutoBatch de Ultralytics) y semilla 0. Se configuraron hasta 150 épocas con paciencia de early stopping de 30, pero el entrenamiento se detuvo a las 82 épocas.

El conjunto HRP4K contiene imágenes de carretera en alta resolución con anotaciones de una única clase, `pothole`. El modelo se evalúa sobre el split de test de HRP4K con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). No se documentan en la información disponible detalles sobre el volumen de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos más allá de las predefinidas por Ultralytics.

## Capacidades

- Detección de objetos de una sola clase: `pothole` (baches en la calzada).
- Detección de objetos pequeños en imágenes de alta resolución, gracias al entrenamiento a 1536 píxeles.
- Salida de cajas delimitadoras con puntuaciones de confianza, utilizable para umbralizado y filtrado posterior.
- Inferencia por imagen o por lotes mediante la API de Ultralytics (`model.predict`).
- Exportación a formatos de despliegue alternativos (ONNX, TensorRT, OpenVINO) a través de Ultralytics, aunque no documentada explícitamente por el autor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Inspección automatizada de carreteras: procesar imágenes capturadas por vehículos de inspección o drones y localizar baches para priorizar reparaciones. El entrenamiento a 1536 píxeles permite detectar daños pequeños que ocuparían pocos píxeles en una imagen a resolución nativa.
- Mantenimiento predictivo de infraestructura municipal: integrar el detector en un pipeline que reciba imágenes georreferenciadas y genere un inventario de baches con coordenadas y nivel de confianza para planificar el asfaltado.
- Análisis de flotas de vehículos: desplegar el modelo en cámaras de salpicadero o unidades de borde para detectar baches en tiempo real y reportar su posición a un servidor central.
- Monitorización de calidad tras obras: comparar imágenes antes y después de una reparación para verificar que el bache ha desaparecido, usando las detecciones como señal objetiva.
- Generación de datasets y etiquetado asistido: usar el modelo como preanotador en un flujo de etiquetado humano, reduciendo el coste de anotar nuevas imágenes de carretera.
- Investigación en detección de objetos pequeños: servir como línea base reproducible en experimentos de detección a alta resolución, dado que DetectionBench fija la receta de entrenamiento y evaluación.
- Evaluación comparativa de detectores: emplear las métricas publicadas para contrastar YOLO26m con RF-DETR y otras variantes YOLO en el mismo conjunto y con el mismo pipeline.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de HRP4K, con el pipeline `detectionbench-evaluate`. Todas las métricas están marcadas como no verificadas (`verified: false`) en el model-index.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 51,62 |
| mAP@50-95 | 29,83 |
| Precision | 57,33 |
| Recall | 49,89 |
| F1 | 53,35 |
| Parametros | 21,9 M |
| FLOPs (a 640 px) | 75,4 B |

Comparativa del zoo de modelos de DetectionBench sobre HRP4K (datos del autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 56,04 | 31,54 | 62,01 | 55,48 |
| RF-DETR Medium | 55,66 | 31,81 | 64,25 | 51,90 |
| RF-DETR Nano | 52,06 | 28,62 | 62,03 | 47,88 |
| YOLO26m (este modelo) | 51,62 | 29,83 | 57,33 | 49,89 |
| YOLO26s | 48,65 | 27,16 | 60,04 | 46,91 |
| YOLOv8n | 48,58 | 26,24 | 58,00 | 46,58 |
| YOLOv8s | 47,59 | 26,71 | 59,81 | 44,30 |
| YOLOv8m | 47,26 | 26,77 | 59,56 | 44,52 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 21,9 M de parámetros en FP32, los pesos ocupan aproximadamente 87 MB; en FP16, unos 44 MB. El consumo real de memoria depende del tamaño de imagen de entrada y del tamaño de lote, y con entradas a 1536 píxeles puede crecer de forma notable.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia a 640 píxeles; para entradas a 1536 píxeles se recomienda 8 GB o más. Una RTX 4090, A100 o H100 ofrecen margen sobrado, pero no son necesarias para inferencia.
- GPU de consumo: sí cabe en GPU de consumo. Una RTX 3060, RTX 4060 o superior es suficiente para inferencia; incluso GPU integradas o dispositivos de borde pueden ejecutar el modelo a resoluciones reducidas.
- Opciones de despliegue: Ultralytics (PyTorch) de forma nativa; exportación a ONNX, TensorRT, OpenVINO u otros formatos compatible con la librería Ultralytics. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (HRP4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26m (este modelo) | 21,9 M | imagen, entrenado a 1536 px | 51,62 | AGPL-3.0 | Hugging Face |
| RF-DETR Small | no disponible | imagen | 56,04 | no disponible | Hugging Face (DetectionBench) |
| RF-DETR Medium | no disponible | imagen | 55,66 | no disponible | Hugging Face (DetectionBench) |
| RF-DETR Nano | no disponible | imagen | 52,06 | no disponible | Hugging Face (DetectionBench) |
| YOLO26s | no disponible | imagen | 48,65 | AGPL-3.0 (presumible) | Hugging Face (DetectionBench) |
| YOLOv8m | no disponible | imagen | 47,26 | AGPL-3.0 (presumible) | Hugging Face (DetectionBench) |

En mAP@50, los tres RF-DETR superan a YOLO26m; en mAP@50-95, RF-DETR Small y Medium también están por delante, mientras que RF-DETR Nano queda por debajo. YOLO26m supera a YOLO26s y a las variantes YOLOv8 en ambas métricas. No se dispone de datos de parámetros ni de licencia de los RF-DETR en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo solo se ha entrenado con la clase `pothole` y sobre el dataset HRP4K; su comportamiento en otras regiones geográficas, condiciones meteorológicas o tipos de firme no está documentado y puede degradarse.
- Riesgo de falsos positivos y negativos: la precisión (57,33 %) y el recall (49,89 %) son moderados; en producción conviene calibrar el umbral de confianza y validar con imágenes del dominio objetivo.
- Limitación de una sola clase: no detecta grietas, señales, vehículos ni otros elementos de la vía, solo baches.
- Sin datos sobre robustez: no se documenta el rendimiento con imágenes nocturnas, lluvia, desenfoque de movimiento o resoluciones distintas de las de entrenamiento.
- Licencia AGPL-3.0: el uso comercial requiere cumplir con las obligaciones de la AGPL, lo que en la práctica implica liberar el código de las aplicaciones que integren el modelo o adquirir una licencia alternativa de Ultralytics. Es un caveat crítico para producción.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; conviene reproducirlos con el pipeline de DetectionBench antes de tomar decisiones.
- Entrenamiento detenido antes del máximo: se configuraron 150 épocas pero solo se completaron 82 por early stopping, lo que sugiere que el modelo podría no estar en su punto óptimo de convergencia.
- Idiomas: no aplica, pero se indica que no hay soporte de texto ni de otras modalidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/hrp4k-yolo26m
- Dataset HRP4K: https://huggingface.co/datasets/dronefreak/HRP4K
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base YOLO26 (Ultralytics): https://huggingface.co/Ultralytics/YOLO26
- Referencia arXiv citada en los tags: arxiv:2606.03748 (no se dispone de URL directa en la información proporcionada)
