# dronefreak/gwhd-rfdetr-nano

## Resumen

RF-DETR Nano finetuneado sobre el Global Wheat Head Dataset (GWHD) es un detector de objetos especializado en la localización de espigas de trigo en imágenes de campo, desarrollado por el usuario dronefreak como parte del proyecto DetectionBench. Se trata de un finetune del modelo base Roboflow/rf-detr-nano, un detector de la familia RF-DETR (Real-Time Detection Transformer) con 30,1 millones de parámetros totales, pensado para detección densa de objetos pequeños en imágenes aéreas y de proximidad.

El modelo resuelve un problema concreto de agricultura de precisión: contar y localizar cabezas de trigo de forma automática para estimar rendimiento, densidad de cultivo y estado fenológico. La detección de espigas es una tarea difícil por la densidad de instancias, el solapamiento y la variabilidad de escala entre países y condiciones de captura, lo que convierte a GWHD en un benchmark exigente para detectores modernos.

Su relevancia actual radica en dos factores. Por un lado, forma parte de un zoo de modelos reproducible (DetectionBench) que entrena y evalúa distintos detectores con recetas idénticas, permitiendo comparaciones justas entre YOLO y RF-DETR. Por otro, su tamaño reducido (30,5 M de parámetros, repo de 0,2 GB) lo hace desplegable en hardware modesto, algo crítico en escenarios de campo con GPUs de borde o drones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time Detection Transformer), variante Nano |
| Parametros totales | 30.147.076 (30,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint .pth) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoint_best_total.pth (PyTorch) |

## Arquitectura y entrenamiento

RF-DETR es un detector basado en transformer con mecanismo de atención (DETR-like), diseñado para detección en tiempo real. La variante Nano es la más pequeña de la familia y prioriza velocidad y ligereza frente a precisión bruta. El modelo parte del checkpoint Roboflow/rf-detr-nano y se finetunea sobre el Global Wheat Head Dataset, un conjunto de imágenes de campo con anotaciones de espigas de trigo recogidas en múltiples países e instituciones.

El entrenamiento y la evaluación se realizan dentro del framework DetectionBench, que estandariza la receta de entrenamiento y el pipeline de evaluación (`detectionbench-evaluate`) para que las comparaciones entre detectores sean reproducibles. La evaluación utiliza las métricas de detección de la librería Supervision (`MeanAveragePrecision`), que reporta mAP, precisión y recall. No se dispone de información sobre el número exacto de tokens de entrenamiento (no aplica), composición detallada del dataset más allá de GWHD, ni sobre el uso de técnicas como RLHF o DPO (no aplicables a un detector). Tampoco se han publicado FLOPs del modelo (indicado como "N/A (not published upstream)" en la model card).

## Capacidades

- Detección de objetos: localiza y clasifica espigas de trigo (`wheat_head`) en imágenes de campo.
- Detección densa: maneja escenas con muchas instancias pequeñas y solapadas, típicas de cultivos de trigo.
- Inferencia en tiempo real: su tamaño reducido permite predicción rápida en GPUs de gama media y de borde.
- Umbral de confianza configurable: la API `predict(..., threshold=0.25)` permite ajustar el compromiso precisión/recall.
- Integración con el ecosistema RF-DETR: compatible con la librería `rfdetr` y el pipeline de Hugging Face Hub.
- Evaluación estandarizada: métricas reproducibles mediante DetectionBench y Supervision.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión por computador.

## Casos de uso

- Estimación de rendimiento en trigo: el modelo detecta y cuenta espigas por imagen o por parcela, lo que permite estimar densidad de cultivo y rendimiento potencial. Su entrenamiento específico en GWHD lo hace adecuado para esta tarea frente a detectores genéricos.
- Agricultura de precisión con drones: al ser un modelo Nano de 30,5 M de parámetros, puede desplegarse en GPUs de borde embarcadas en drones o estaciones de campo para monitorización en tiempo real de parcelas.
- Fenotipado de alto rendimiento: investigadores pueden usar el modelo para extraer automáticamente el número y posición de espigas en experimentos de mejora genética, reduciendo el trabajo manual de anotación y conteo.
- Monitorización de estrés y sanidad del cultivo: la distribución espacial de detecciones permite detectar zonas con menor densidad de espigas, indicativas de estrés hídrico, enfermedades o competencia con malas hierbas.
- Benchmarking reproducible de detectores: el modelo sirve como referencia dentro de DetectionBench para comparar RF-DETR Nano con variantes YOLO y otras tallas de RF-DETR bajo recetas idénticas.
- Prototipado rápido en investigación agronómica: su licencia Apache 2.0 y su tamaño reducido permiten integrarlo en pipelines de investigación sin restricciones comerciales ni requisitos de hardware elevados.
- Sistemas de alerta temprana en campo: combinado con imágenes periódicas de drones, el modelo puede alimentar alertas sobre cambios en la densidad de espigas a lo largo de la campaña.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del Global Wheat Head Dataset, usando el pipeline de evaluación de DetectionBench:

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 53,82 |
| mAP@50-95 | 19,65 |
| Precision | 72,52 |
| Recall | 53,64 |
| F1 Score | 61,67 |
| Parametros | 30,5 M |
| FLOPs | no disponible |

Comparativa dentro del zoo de modelos GWHD de DetectionBench (mismos datos de test):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO11x | 74,25 | 34,92 | 83,37 | 67,92 |
| YOLO26m | 71,58 | 33,48 | 79,94 | 62,74 |
| YOLO26s | 70,49 | 31,39 | 79,47 | 63,43 |
| YOLOv8m | 69,55 | 29,34 | 80,69 | 63,74 |
| YOLOv8s | 68,29 | 29,48 | 79,89 | 62,52 |
| RF-DETR Medium | 67,10 | 27,11 | 78,60 | 65,66 |
| YOLOv8n | 66,19 | 28,21 | 78,69 | 60,30 |
| RF-DETR Small | 64,51 | 26,12 | 77,60 | 63,61 |
| RF-DETR Nano (este modelo) | 53,82 | 19,65 | 72,52 | 53,64 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (30,5 M de parámetros, repo de 0,2 GB), la inferencia en FP32 requiere del orden de 1-2 GB de VRAM, holgadamente por debajo de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para despliegue en borde, GPUs embebidas tipo Jetson también son viables por el tamaño reducido.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: la librería oficial `rfdetr` con PyTorch es la vía documentada; también puede exportarse a otros runtimes según el soporte de la familia RF-DETR (no confirmado en la información disponible). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (GWHD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Nano (este modelo) | 30,5 M | no aplica | 53,82 | Apache 2.0 | Hugging Face |
| RF-DETR Small | no disponible | no aplica | 64,51 | no disponible | Hugging Face (Roboflow) |
| RF-DETR Medium | no disponible | no aplica | 67,10 | no disponible | Hugging Face (Roboflow) |
| YOLOv8n | no disponible | no aplica | 66,19 | AGPL-3.0 (Ultralytics) | Ultralytics / Hugging Face |
| YOLO11x | no disponible | no aplica | 74,25 | AGPL-3.0 (Ultralytics) | Ultralytics / Hugging Face |

La comparación con las tallas superiores de RF-DETR y con la familia YOLO muestra que el modelo Nano es el menos preciso del zoo en GWHD, pero también el más ligero. La ventaja de RF-DETR Nano frente a YOLO radica en su licencia Apache 2.0, más permisiva para uso comercial que la AGPL de Ultralytics.

## Limitaciones y advertencias

- Precisión limitada: con un mAP@50 de 53,82 y un recall de 53,64, el modelo pierde aproximadamente la mitad de las espigas en el test set; no es adecuado para aplicaciones que requieran recuentos de alta fidelidad sin revisión humana.
- Sesgo de dominio: el rendimiento varía por país e institución contribuyente al GWHD debido al domain shift (iluminación, variedades de trigo, densidad de siembra, resolución); la model card indica una evaluación estratificada por país, pero los resultados por país no están completos en la información disponible.
- Especialización estrecha: solo detecta la clase `wheat_head`; no es un detector genérico ni un modelo de lenguaje.
- Riesgo de falsos positivos y negativos: la precisión del 72,52 % implica un porcentaje relevante de detecciones incorrectas, especialmente en escenas densas o con solapamiento extremo.
- Sin datos de cuantización ni de exportación a otros formatos: no se documentan pesos GGUF, ONNX u otros formatos optimizados, lo que puede limitar el despliegue en algunos runtimes.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las licencias de los datos de entrenamiento (GWHD) si se redistribuye el modelo o se usa en productos comerciales.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; no han sido validados de forma independiente.
- Sin información sobre sesgos demográficos o geográficos más allá del domain shift por país.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gwhd-rfdetr-nano
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base RF-DETR Nano: https://huggingface.co/Roboflow/rf-detr-nano
- Librería Supervision (métricas de detección): https://github.com/roboflow/supervision
- Dataset GWHD en Hugging Face: https://huggingface.co/datasets/dronefreak/GWHD
- Paper GWHD (arXiv:2105.07660): https://arxiv.org/abs/2105.07660
- Paper RF-DETR (arXiv:2511.09554): https://arxiv.org/abs/2511.09554
- Paper DINOv2 (arXiv:2304.07193): https://arxiv.org/abs/2304.07193
