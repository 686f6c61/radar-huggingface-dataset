# matthieulel/vit-huge-patch14-224-in21k-galaxy10-decals-full-v2

## Resumen

`vit-huge-patch14-224-in21k-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por el usuario matthieulel a partir del backbone `google/vit-huge-patch14-224-in21k`. El modelo ha sido ajustado por completo (full fine-tuning, todos los parámetros actualizados) para la tarea de clasificación de morfología de galaxias sobre el conjunto Galaxy10 DECaLS, que distingue diez clases morfológicas. Forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) elaborada para el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

Se trata de un Vision Transformer de arquitectura ViT-Huge con parches de 14x14 píxeles y resolución de entrada de 224x224, con 630,7 millones de parámetros totales y una cabeza lineal de diez salidas. El modelo resuelve un problema concreto de visión por computador en astronomía: la clasificación automática de galaxias según su forma, tarea relevante para los grandes sondeos fotométricos que generan volúmenes de imágenes inmanejables manualmente.

Su relevancia actual radica en que proporciona una referencia reproducible y rigurosa (protocolo idéntico para 40 backbones, tres semillas, métricas por época publicadas) del rendimiento de los modelos fundacionales de visión cuando se aplican a datos astronómicos. El checkpoint alcanza un 84,10 % de accuracy y un 83,68 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes, con una media de 84,44 ± 0,34 % de accuracy sobre tres semillas. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Huge), parches 14x14, entrada 224x224 |
| Parámetros totales | 630.777.610 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de una imagen de 224x224 px) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de la familia ViT-Huge, con parches de 14x14 píxeles sobre imágenes de 224x224 y 630,7 millones de parámetros. Sobre el encoder se añade una única capa lineal de diez salidas que corresponde a las diez clases morfológicas de Galaxy10 DECaLS. El ajuste es completo: se actualizan todos los parámetros del backbone, no solo la cabeza.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como test; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta, idéntica para los 40 backbones de la colección, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y volteo horizontal aleatorio; la evaluación usa resize y center crop a 224x224 con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 19). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en diez clases de morfología galáctica sobre imágenes de Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ViT-Huge preentrenado en ImageNet-21k.
- Inferencia sobre imágenes individuales de 224x224 píxeles con preprocesado estándar (resize, center crop y normalización).
- Integración nativa con la librería transformers mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imágenes puro.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.

## Casos de uso

- Clasificación morfológica automatizada en sondeos astronómicos: el modelo asigna una de las diez clases de Galaxy10 DECaLS a cada imagen de 224x224, lo que permite procesar lotes masivos de recortes de galaxias procedentes de sondeos fotométricos sin inspección visual manual.
- Etiquetado preliminar para entrenamiento de modelos mayores: las predicciones del checkpoint (84,10 % de accuracy) pueden usarse para preetiquetar catálogos y reducir el coste de anotación humana, con revisión posterior de los casos de baja confianza.
- Control de calidad de pipelines de reducción de datos: al ser un clasificador reproducible con protocolo documentado, sirve para detectar derivas en el preprocesado de imágenes comparando las predicciones con las logits de referencia publicadas.
- Estudio comparativo de modelos fundacionales de visión: al formar parte de una colección de 80 configuraciones con receta idéntica, permite evaluar el rendimiento de ViT-Huge frente a otros 39 backbones en la misma tarea y con las mismas métricas.
- Docencia e investigación en astronomía computacional: el checkpoint y las métricas por época publicadas facilitan reproducir el experimento completo y analizar curvas de aprendizaje y sobreajuste.
- Selección morfológica de muestras: filtrado de candidatos por clase (por ejemplo, galaxias espirales frente a elípticas) antes de análisis espectroscópico o de estudios de estructura a gran escala.
- Prototipado de servicios de clasificación de imágenes científicas: el modelo se puede desplegar con transformers en una GPU única y servir predicciones sobre imágenes de 224x224 con latencia baja, dado su tamaño de 630,7 millones de parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el split de test reservado de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Valor |
|---|---|
| Accuracy (semilla 42, época 19 de 30) | 84,10 % |
| F1 ponderado (semilla 42, época 19 de 30) | 83,68 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 84,44 ± 0,34 % |
| F1 ponderado medio ± desviación típica (semillas 42, 1, 2) | 84,24 ± 0,49 % |

Las métricas se calculan en la época de mínima pérdida de validación. En la época 19 la pérdida de validación fue 0,4912 y la accuracy de validación 85,46 %. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para los pesos (630,7 millones de parámetros × 4 bytes), más el overhead de activaciones y del framework; en la práctica se recomienda al menos 6-8 GB de VRAM para lotes pequeños.
- En fp16/bf16 los pesos ocupan aproximadamente 1,3 GB; el modelo cabe con holgura en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB).
- GPUs de datacenter recomendadas para mayor throughput: A100 (40/80 GB), H100 (80 GB) y L40S; el modelo es pequeño para estas GPUs y permite lotes grandes.
- Despliegue: transformers con PyTorch es la vía documentada por el autor; también es compatible con endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| vit-huge-patch14-224-in21k-galaxy10-decals-full-v2 (este) | 630,7 M | Clasificación de morfología galáctica (10 clases) | Imagen 224x224 | 84,10 % accuracy; 83,68 % F1 ponderado (test) | Apache 2.0 |
| google/vit-huge-patch14-224-in21k (base) | 632 M aprox. | Clasificación de imágenes genérica (ImageNet-21k) | Imagen 224x224 | no disponible para Galaxy10 DECaLS | Apache 2.0 |
| Otros backbones de la colección Vision Foundation Models Benchmark | no disponible | Clasificación de morfología galáctica (10 clases) | Imagen 224x224 | no disponible en la información proporcionada | no disponible |

No se dispone en la información proporcionada de resultados de otros backbones de la colección ni de modelos alternativos evaluados sobre Galaxy10 DECaLS, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de imágenes; no genera texto, no razona y no soporta tool calling ni agentes.
- Entrenado únicamente sobre Galaxy10 DECaLS (10 clases morfológicas); no generaliza a otras taxonomías galácticas ni a otros tipos de imágenes astronómicas sin reentrenamiento.
- El rendimiento reportado (84,10 % de accuracy) procede de un único conjunto de test de 1.774 imágenes; la variabilidad entre semillas es baja (±0,34 % en accuracy), pero puede no reflejar el comportamiento en datos de otros sondeos con distinta profundidad, resolución o ruido.
- Riesgo de sesgo de clase: el conjunto Galaxy10 DECaLS está desbalanceado entre clases; el F1 ponderado (83,68 %) es inferior a la accuracy, lo que indica peor rendimiento en las clases minoritarias.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de predicciones erróneas con alta confianza en imágenes atípicas, artefactos o galaxias en interacción.
- El preprocesado debe replicarse exactamente (resize y center crop a 224x224 y normalización del image processor del checkpoint); desviaciones degradan las predicciones.
- Los resultados del model-index están marcados como no verificados (`verified: false`); la verificación de integridad del autor cubre solo las primeras 96 imágenes de test (predicciones idénticas al 100,0 %, diferencia máxima de logits de 7,15e-06).
- Licencia Apache 2.0: permite uso comercial, pero el artículo asociado está en revisión y la cita debe completarse tras su publicación.
- No se documentan cuantizaciones oficiales ni soporte para formatos distintos de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-huge-patch14-224-in21k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-huge-patch14-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
