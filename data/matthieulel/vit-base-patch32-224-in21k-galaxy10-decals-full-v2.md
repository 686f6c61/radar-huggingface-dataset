# matthieulel/vit-base-patch32-224-in21k-galaxy10-decals-full-v2

## Resumen

`vit-base-patch32-224-in21k-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel`. Se trata de un fine-tuning completo (todos los parámetros actualizados) del backbone `google/vit-base-patch32-224-in21k` sobre el conjunto de datos Galaxy10 DECaLS, que contiene 17.736 imágenes de galaxias etiquetadas en 10 clases morfológicas. El modelo resuelve la tarea de clasificar la forma de una galaxia a partir de una imagen astronómica, un problema clásico en astrofísica que tradicionalmente requiere inspección visual o pipelines de ajuste de perfiles de brillo.

El checkpoint forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Esta versión concreta corresponde al régimen de fine-tuning completo, con una precisión del 83,09 % en el conjunto de test reservado de 1.774 imágenes.

Con 87,46 millones de parámetros y un tamaño de repositorio de 0,3 GB, el modelo es ligero y desplegable en hardware modesto. Su relevancia radica en ser un punto de referencia reproducible dentro de un benchmark sistemático de modelos fundacionales de visión aplicados a datos astronómicos, con protocolo de entrenamiento documentado y métricas por época publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 32, resolución 224) |
| Parametros totales | 87.462.922 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo base: parches de 32x32 píxeles sobre imágenes de 224x224, con el backbone preentrenado en ImageNet-21k (`google/vit-base-patch32-224-in21k`). Sobre este backbone se añade una cabeza lineal de 10 salidas, una por clase morfológica de Galaxy10 DECaLS. El régimen de adaptación es de fine-tuning completo: se actualizan todos los parámetros, no solo la cabeza.

El protocolo de entrenamiento está documentado de forma exhaustiva en la model card. Se usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente sobre 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una única GPU. La aumentación consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación emplea resize y center crop a 224x224 px con la normalización del processor del checkpoint. El conjunto de entrenamiento son 14.188 imágenes y el de validación 1.774, ambos derivados del split público de train con estratificación por clase; el split público de test (1.774 imágenes) se reserva como held-out. La época seleccionada es la de mínima pérdida de validación (época 21 de 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de características visuales mediante el backbone ViT preentrenado en ImageNet-21k.
- Inferencia sobre imágenes de 224x224 px con el processor estándar de transformers.
- No soporta tool calling ni function calling (es un modelo de clasificación, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo thinking, visión generativa, audio ni otras modalidades.
- Verificación de integridad publicada: predicciones idénticas a los logits guardados en el 100 % de las primeras 96 imágenes de test (diferencia máxima absoluta de 6,91e-06).

## Casos de uso

- Clasificación automática de morfología galáctica en catálogos de imágenes: el modelo puede procesar lotes de imágenes de 224x224 px procedentes de surveys como DECaLS y asignar una de las 10 clases morfológicas, sustituyendo la inspección visual en volúmenes grandes de datos.
- Etiquetado previo para pipelines de astrofísica: como clasificador ligero (87 M de parámetros), puede actuar como primer filtro antes de análisis más costosos (ajuste de perfiles de brillo, medición de parámetros estructurales) sobre galaxias candidatas.
- Benchmark de modelos fundacionales de visión en astronomía: el checkpoint es una de las 80 configuraciones del collection *Vision Foundation Models Benchmark*, por lo que sirve como referencia reproducible para comparar backbones y regímenes de adaptación en tareas astronómicas.
- Docencia e investigación en aplicación de transformers a datos científicos: el modelo y su protocolo documentado permiten reproducir el experimento completo con una sola GPU y un dataset público de 17.736 imágenes.
- Control de calidad de datasets astronómicos: detectar imágenes mal etiquetadas o anomalías morfológicas comparando las predicciones del modelo con las etiquetas originales del catálogo.
- Prototipado rápido en entornos con recursos limitados: al caber en una GPU de consumo y cargarse con `AutoModelForImageClassification`, permite validar ideas de clasificación morfológica sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test reservado, 1.774 imágenes, seed 42, época 21 de 30):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época seleccionada) | 83,09 % |
| Weighted F1 (seed 42, época seleccionada) | 82,82 % |
| Accuracy media +/- desv. típica (seeds 42, 1, 2) | 83,48 +/- 0,34 % |
| Weighted F1 medio +/- desv. típica (seeds 42, 1, 2) | 83,32 +/- 0,45 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; la model card remite al dataset `vision-foundation-models-benchmark-runs` y al artículo para las tablas completas de las 80 configuraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (87,46 M de parámetros x 4 bytes), más overhead de activaciones y del processor; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento documentado se realizó en una única GPU (modelo pequeño, batch efectivo 256 con acumulación).
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (`AutoModelForImageClassification`), exportación a ONNX no documentada, integración en pipelines de torchvision; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un ViT-Base con entrada 224x224, el coste por imagen es bajo y el throughput en GPU moderna es alto, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre el mismo conjunto de test, por lo que la comparación cuantitativa no está disponible. La model card sitúa este checkpoint dentro de una colección de 80 configuraciones (40 backbones x 2 regímenes) y remite al dataset de runs para las tablas comparativas. Cualitativamente:

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (ViT-Base/32, full fine-tuning) | 87,46 M | 224x224 px | apache-2.0 | HuggingFace |
| Backbone base `google/vit-base-patch32-224-in21k` | ~86 M | 224x224 px | apache-2.0 | HuggingFace |
| Otras configuraciones del benchmark (40 backbones x 2 regímenes) | variable | variable | variable | HuggingFace (collection) |

## Limitaciones y advertencias

- Modelo de clasificación cerrado a 10 clases morfológicas de Galaxy10 DECaLS; no generaliza a otras taxonomías sin reentrenamiento.
- Entrenado exclusivamente con imágenes de DECaLS; el rendimiento puede degradarse con imágenes de otros surveys (distinta profundidad, bandas, PSF o escala de píxel).
- Riesgo de confusión entre clases morfológicas visualmente próximas; la accuracy global del 83,09 % implica un porcentaje no despreciable de errores, y el F1 ponderado (82,82 %) sugiere desequilibrio entre clases.
- Métricas no verificadas de forma independiente (`verified: false` en el model-index); proceden del propio autor.
- Sin capacidades de texto, tool calling ni agentes; no debe presentarse como modelo de propósito general.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y el dataset subyacente deben verificarse por separado para cumplir sus respectivas condiciones.
- La época seleccionada (21) no es la de mejores métricas de test (las épocas 26 y 29 superan ligeramente la accuracy); la selección se hizo por mínima pérdida de validación, lo que puede introducir una ligera infraestimación del rendimiento real.
- Sin información sobre sesgos más allá de los derivados del dataset y del preentrenamiento en ImageNet-21k.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-base-patch32-224-in21k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-base-patch32-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Collection Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona DOI)
