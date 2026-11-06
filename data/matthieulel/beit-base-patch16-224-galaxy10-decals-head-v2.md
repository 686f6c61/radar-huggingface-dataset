# matthieulel/beit-base-patch16-224-galaxy10-decals-head-v2

## Resumen

`beit-base-patch16-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario matthieulel como parte de la colección Vision Foundation Models Benchmark. Se construye sobre el backbone `microsoft/beit-base-patch16-224` (BEiT, Vision Transformer con tokenización discreta) y se adapta al dataset Galaxy10 DECaLS mediante un régimen de *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de diez salidas.

El modelo resuelve una tarea concreta de astronomía observacional: clasificar imágenes de galaxias del sondeo DECaLS en diez clases morfológicas. Su relevancia no reside en el rendimiento absoluto sino en su papel como una de las 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) del benchmark descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que permite comparar de forma controlada cómo se comportan distintos modelos fundacionales de visión cuando se adaptan a datos astronómicos con recursos limitados.

Con 85.769.674 parámetros totales y un repositorio de 0,3 GB, el checkpoint es ligero y desplegable en hardware modesto. Alcanza un 65,50 % de accuracy y un 63,87 % de F1 ponderado en el conjunto de test reservado (1.774 imágenes), con una media de 65,30 ± 0,20 % en accuracy sobre tres semillas. La licencia Apache 2.0 facilita su reutilización comercial y académica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer) base, patch size 16, resolución 224x224; cabeza lineal de clasificación de 10 clases |
| Parámetros totales | 85.769.674 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 px) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; al ser un ViT estándar es compatible con fp16, int8 y formatos derivados vía transformers/torch, pero no se han publicado variantes) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura BEiT base de Microsoft: un transformer de visión con parches de 16x16 píxeles sobre entradas de 224x224, preentrenado originalmente con objetivos de modelado enmascarado de tokens visuales discretos. En este checkpoint el backbone se mantiene íntegramente congelado y solo se entrena una capa lineal de diez salidas que mapea el vector CLS a las clases morfológicas de Galaxy10 DECaLS. El repositorio contiene tanto los pesos del backbone original como la cabeza entrenada.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como conjunto de evaluación; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta, idéntica para los 40 backbones del benchmark, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación aplica resize y center crop a 224x224 con la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

Como control de integridad, el autor recargó el modelo y lo ejecutó sobre las primeras 96 imágenes de test: las predicciones coincidieron con los logits guardados de la época seleccionada en el 100 % de los casos, con una diferencia absoluta máxima de logit de 1,34e-05.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Extracción de representaciones visuales genéricas mediante el backbone BEiT congelado (útil como feature extractor para otras tareas astronómicas).
- Inferencia determinista y reproducible con preprocesado documentado (resize + center crop a 224x224 + normalización del procesador).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.
- No es un modelo generativo: no produce descripciones, solo logits de clase.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en pipelines astronómicos: el modelo recibe recortes de 224x224 px procedentes de imágenes DECaLS y devuelve una de las diez clases con sus logits, lo que permite etiquetar catálogos a gran escala cuando no se dispone de inspección visual humana.
- Pretriaje en campañas de citizen science: usar el clasificador como primer filtro para priorizar qué imágenes revisan voluntarios o expertos, reduciendo la carga de anotación manual en las clases más frecuentes.
- Extracción de características para modelos downstream: al conservar el backbone BEiT congelado, se pueden obtener embeddings de galaxias y entrenar clasificadores o modelos de similitud sobre ellos sin reentrenar la parte visual.
- Reproducción y comparación de benchmarks: sirve como configuración de referencia (head-only sobre BEiT base) dentro del benchmark de 80 configuraciones, permitiendo a investigadores contrastar recetas de adaptación con un protocolo idéntico y reproducible.
- Docencia y experimentación en astronomía computacional: su tamaño contenido (0,3 GB, 85,7 M de parámetros) y su receta simple lo hacen adecuado para prácticas sobre adaptación de modelos fundacionales a datos científicos.
- Control de calidad de datasets: aplicar el clasificador sobre lotes de imágenes y revisar discrepancias con las etiquetas existentes para detectar posibles errores de anotación o muestras atípicas.
- Despliegue en entornos con recursos limitados: al ser un ViT base con cabeza lineal, cabe en GPUs de consumo y permite inferencia por lotes en estaciones de trabajo sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test reservado de Galaxy10 DECaLS (1.774 imágenes), no verificados de forma independiente:

| Métrica | Semilla 42 (época 30) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 65,50 | 65,30 ± 0,20 |
| F1 ponderado (%) | 63,87 | 63,65 ± 0,23 |

Evolución seleccionada de la curva de entrenamiento (semilla 42):

| Época | Pérdida val. | Acc. val. (%) | Acc. test (%) | F1 pond. test (%) |
|---|---|---|---|---|
| 1 | 2,3628 | 7,38 | 7,61 | 6,37 |
| 5 | 1,3888 | 57,89 | 57,05 | 54,32 |
| 10 | 1,1653 | 62,85 | 62,29 | 60,22 |
| 15 | 1,0912 | 64,15 | 63,70 | 61,93 |
| 20 | 1,0585 | 65,39 | 64,71 | 62,99 |
| 25 | 1,0403 | 65,50 | 65,28 | 63,55 |
| 30 (seleccionada) | 1,0356 | 65,78 | 65,50 | 63,87 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en la misma tabla del benchmark; las métricas por época de las 80 configuraciones están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,35 GB solo para pesos (85,7 M de parámetros); con activaciones y batches pequeños, por debajo de 1-2 GB. En fp16, alrededor de 0,17 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con margen amplio).
- Opciones de despliegue: transformers (AutoModelForImageClassification + AutoImageProcessor), exportación a ONNX/TorchScript para servir con ONNX Runtime o Triton, y pipelines personalizados con torchvision. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un ViT base a 224x224, la inferencia por imagen es del orden de milisegundos en GPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de clasificadores alternativos sobre Galaxy10 DECaLS, por lo que no es posible establecer una comparativa numérica fiable. La comparación cualitativa con el modelo base es la siguiente:

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 85.769.674 | 224x224 px | Clasificación de 10 clases (Galaxy10 DECaLS) | apache-2.0 | Hugging Face |
| microsoft/beit-base-patch16-224 | 85.769.674 (backbone) | 224x224 px | Backbone genérico de visión (ImageNet) | no disponible en la información | Hugging Face |
| Otras configuraciones del benchmark (40 backbones x 2 regímenes) | variable | variable | Clasificación de 10 clases (Galaxy10 DECaLS) | variable | Colección Vision Foundation Models Benchmark |

Para una comparativa cuantitativa con alternativas del mismo benchmark, consultar el dataset `vision-foundation-models-benchmark-runs`.

## Limitaciones y advertencias

- Rendimiento moderado: 65,50 % de accuracy implica que aproximadamente un tercio de las imágenes de test se clasifican de forma incorrecta; no es adecuado para decisiones científicas sin revisión humana.
- Solo se entrena una cabeza lineal sobre un backbone congelado; un fine-tuning completo del backbone podría mejorar el rendimiento, pero no se ha evaluado en este checkpoint.
- El modelo está especializado en el dominio y la distribución de Galaxy10 DECaLS; su generalización a otros sondeos, instrumentos o resoluciones no está documentada.
- Riesgo de sesgo de clase: el dataset puede estar desbalanceado y las métricas ponderadas (F1 63,87 %) sugieren un rendimiento desigual entre clases; no se publican métricas por clase.
- No es un modelo generativo: no produce texto, descripciones ni explicaciones; solo logits de clase.
- Las métricas están declaradas por el autor y no han sido verificadas de forma independiente (campo `verified: false` en la model-index).
- Sin información sobre cuantizaciones probadas ni sobre latencia/throughput en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del checkpoint base de Microsoft antes de un despliegue comercial.
- El artículo asociado está en revisión; la cita definitiva aún no está publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/beit-base-patch16-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/microsoft/beit-base-patch16-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing (versión revisada, 2026); cita pendiente de publicación (no disponible enlace).
