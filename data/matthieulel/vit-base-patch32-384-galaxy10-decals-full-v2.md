# matthieulel/vit-base-patch32-384-galaxy10-decals-full-v2

## Resumen

`vit-base-patch32-384-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel`. Se trata de un ajuste fino completo (todos los parámetros actualizados) de `google/vit-base-patch32-384`, un Vision Transformer base, sobre el conjunto de datos Galaxy10 DECaLS, que contiene 10 clases morfológicas de galaxias. El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo resuelve una tarea acotada y bien definida: dada una imagen de galaxia procedente de DECaLS, predecir su clase morfológica entre 10 categorías. Con 87,5 millones de parámetros y una resolución de entrada de 384×384 píxeles, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en que forma parte de un benchmark sistemático y reproducible de modelos fundacionales de visión aplicados a datos astronómicos, con protocolo de entrenamiento documentado y métricas por época publicadas.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio es pequeño (0,4 GB) y el modelo es compatible con los endpoints de Hugging Face y con la librería transformers. No obstante, su adopción es muy limitada (15 descargas, 0 likes) y los resultados declarados no están verificados por el hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch size 32, resolución 384) |
| Parametros totales | 87.535.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 384×384 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo base: parches de 32×32 píxeles sobre imágenes de 384×384, embeddings lineales, bloques transformer con atención multi-cabeza y una cabeza lineal final de 10 salidas (una por clase morfológica). El modelo base es `google/vit-base-patch32-384`, preentrenado por Google; este checkpoint lo adapta mediante ajuste fino completo, es decir, actualizando todos los parámetros, no solo la cabeza.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con una división estratificada por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test se usa como conjunto de test retenido). La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10% de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. Aumentación: random resized crop a la resolución de entrada y flip horizontal aleatorio. Evaluación: resize y center crop a 384×384 px, normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 15 de 30). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Entrada de imagen RGB a 384×384 píxeles con preprocesado específico (resize, center crop y normalización del processor).
- Salida de logits por clase y etiqueta predicha mediante `AutoModelForImageClassification`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.
- Integración directa con `transformers` y compatibilidad con endpoints de Hugging Face.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo puede procesar recortes de galaxias procedentes de DECaLS y asignar una de las 10 clases morfológicas, sustituyendo la inspección visual manual en catálogos a gran escala.
- Etiquetado asistido de imágenes en estudios de morfología galáctica: con una accuracy de 82,81% en test, sirve como primera pasada para preetiquetar candidatos que luego revisan expertos, reduciendo el coste de anotación.
- Filtrado y selección de muestras: dado un conjunto de imágenes, el modelo permite priorizar galaxias de morfología concreta (por ejemplo, espirales o elípticas) para análisis posteriores o para observación de seguimiento.
- Benchmarking de modelos fundacionales de visión en astronomía: al formar parte de una colección de 80 configuraciones con protocolo idéntico, se usa como referencia reproducible para comparar backbones y regímenes de adaptación.
- Docencia y experimentación en visión por computador aplicada: su tamaño compacto (87,5 M de parámetros) y su receta documentada lo hacen adecuado para reproducir experimentos en una sola GPU.
- Despliegue en entornos con recursos limitados: al ser un ViT-Base de 0,4 GB, puede servirse en CPU o en GPUs de consumo para inferencia por lotes sobre catálogos de imágenes.
- Validación cruzada de clasificaciones existentes: puede ejecutarse sobre catálogos ya etiquetados para detectar discrepancias morfológicas y marcar casos para revisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por el hub), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época seleccionada 15) | 82,81% |
| Weighted F1 (seed 42, época seleccionada 15) | 82,56% |
| Accuracy media ± desv. típica (seeds 42, 1, 2) | 82,64% ± 0,34 |
| Weighted F1 media ± desv. típica (seeds 42, 1, 2) | 82,41% ± 0,34 |

Evolución por épocas (seed 42): la accuracy de test pasa de 50,73% en la época 1 a 82,81% en la época 15 (seleccionada) y alcanza un máximo de 83,31% en la época 20, aunque la selección se hace por mínima pérdida de validación. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,7 GB en fp32 para el modelo (87,5 M de parámetros); con batch pequeño y activaciones, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para inferencia por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 o superior, RTX 20/30/40, etc.).
- Opciones de despliegue: `transformers` con PyTorch; también puede exportarse a ONNX o TorchScript para servir con infraestructura propia. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de clasificación de imágenes de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-base-patch32-384-galaxy10-decals-full-v2 (este) | 87,5 M | 384×384 px | 82,81% (test, seed 42) | Apache 2.0 | Hugging Face |
| google/vit-base-patch32-384 (base sin ajustar) | ~87,5 M | 384×384 px | no disponible | Apache 2.0 | Hugging Face |
| Otros backbones del benchmark (40 configuraciones) | variable | variable | no disponible en esta ficha | variable | Colección Vision Foundation Models Benchmark |

No se dispone en la información proporcionada de resultados numéricos de los otros backbones del benchmark ni de modelos alternativos comparables en la misma tarea, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación morfológica de galaxias de Galaxy10 DECaLS; no es un modelo de propósito general y no debe usarse fuera de ese dominio sin validación.
- Los resultados declarados (82,81% de accuracy) no están verificados por el hub (`verified: false`) y proceden del autor.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas: aproximadamente un 17% de las imágenes de test se clasifican incorrectamente, con posibles confusiones entre clases morfológicas similares.
- Sesgos potenciales derivados del conjunto de datos Galaxy10 DECaLS: distribución de clases, selección de muestras y características de las imágenes DECaLS pueden no representar otros sondeos o rangos de redshift.
- Dependencia del preprocesado exacto (resize y center crop a 384×384 px y normalización del processor); un preprocesado distinto degrada el rendimiento.
- No soporta texto, audio ni otras modalidades; no es adecuado para tareas de generación, razonamiento o agentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el trabajo original (artículo pendiente de publicación en Astronomy and Computing) y conservar el aviso de licencia.
- Adopción muy baja (15 descargas, 0 likes) y creado en 2026 según los metadatos; conviene validar el checkpoint en el dominio de producción antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch32-384-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-base-patch32-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona enlace directo).
