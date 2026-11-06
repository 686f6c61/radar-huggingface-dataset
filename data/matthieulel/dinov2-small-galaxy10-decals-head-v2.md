# matthieulel/dinov2-small-galaxy10-decals-head-v2

## Resumen

El modelo `dinov2-small-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel. Se construye sobre el backbone `facebook/dinov2-small` (ViT-S/14, 21M parámetros) y añade una cabeza lineal de 10 salidas entrenada para clasificar imágenes del dataset Galaxy10 DECaLS en diez categorías morfológicas. El régimen de adaptación es *head-only fine-tuning*: el backbone permanece completamente congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena la capa de clasificación final.

El modelo forma parte de una colección más amplia, *Vision Foundation Models Benchmark*, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación (80 configuraciones en total) dentro del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su relevancia radica en que ofrece una línea base reproducible y de bajo coste computacional para tareas de morfología galáctica, con métricas publicadas por época y una verificación de integridad de los pesos.

El checkpoint contiene los pesos completos (backbone congelado más cabeza entrenada), pesa aproximadamente 0,1 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que facilita su integración en pipelines de transformers con fines de investigación y docencia en astronomía computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/14) preentrenado con DINOv2, con cabeza lineal de clasificación |
| Parametros totales | 22.064.266 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, evaluación a 256x256 px) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo contiene safetensors en fp32) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer pequeño (ViT-S/14) con parches de 14x14 píxeles, preentrenado por Meta con el método DINOv2 (autosupervisado, sin etiquetas). Sobre ese backbone se añade una única capa lineal con diez salidas, una por clase morfológica de Galaxy10 DECaLS. Durante el ajuste fino el backbone se mantiene congelado, incluidas las estadísticas de sus capas de normalización; solo se optimizan los pesos de la cabeza lineal.

El entrenamiento utiliza Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reserva como conjunto de evaluación; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación consiste en random resized crop a la resolución de entrada y random horizontal flip. La evaluación aplica resize y center crop a 256x256 px más la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42).

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias del dataset Galaxy10 DECaLS.
- Extracción de características visuales genéricas mediante el backbone DINOv2 congelado (útil para transferencia a otras tareas de visión).
- Inferencia determinista y reproducible: el autor verifica que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados (diferencia absoluta máxima de 9,54e-07).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: el modelo recibe recortes de imágenes DECaLS y devuelve una de las diez clases morfológicas, lo que permite etiquetar grandes volúmenes de galaxias con un coste computacional mínimo (22M parámetros, fp32).
- Línea base en estudios comparativos de foundation models: al formar parte del benchmark de 80 configuraciones, sirve como referencia reproducible para medir la ganancia de backbones más grandes o de regímenes de ajuste completo.
- Filtrado y triaje previo en pipelines de observación: se puede usar para descartar o priorizar candidatos morfológicamente interesantes antes de un análisis manual por parte de astrónomos.
- Docencia y divulgación en astronomía computacional: el reducido tamaño del checkpoint (0,1 GB) y su receta de entrenamiento documentada permiten reproducir el experimento en una GPU consumer en tiempos acotados.
- Extracción de embeddings para clustering o búsqueda por similitud: las características del backbone DINOv2 congelado pueden alimentar índices vectoriales para recuperar galaxias visualmente parecidas.
- Validación de protocolos de adaptación: dado que solo se entrena la cabeza lineal, es un caso de estudio controlado para analizar cuánto rendimiento se obtiene sin tocar el backbone en datos astronómicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index, no verificados de forma independiente):

| Modelo | Dataset / split | Accuracy (%) | Weighted F1 (%) |
|---|---|---|---|
| dinov2-small-galaxy10-decals-head-v2 (semilla 42, época 30) | Galaxy10 DECaLS / test (1.774 imágenes) | 56,82 | 54,38 |
| Media ± desviación típica sobre semillas 42, 1 y 2 | Galaxy10 DECaLS / test | 57,01 ± 0,33 | 54,58 ± 0,45 |

No se han publicado en la información disponible resultados comparativos con otros modelos del benchmark ni métricas de otras tareas (MMLU, HumanEval, GSM8K, etc.), que no aplican a este modelo de visión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,1-0,2 GB para los pesos (22M parámetros), más el espacio de activaciones para un batch pequeño; cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes se recomiendan RTX 4090, A100 o H100, aunque el modelo está pensado para ejecutarse en hardware modesto.
- Cabe en GPU consumer: sí, en cualquier GPU consumer reciente (GTX 1060 6 GB, RTX 3060, RTX 4060, etc.), e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (AutoModelForImageClassification), exportación a ONNX, TorchScript o TensorRT; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dinov2-small-galaxy10-decals-head-v2 | 22,06 M | imagen 256x256 px | 56,82 % (test) | Apache 2.0 | Hugging Face |
| facebook/dinov2-small (backbone base, sin cabeza) | 22,06 M | imagen 224x224 px (nativo) | no disponible (no clasifica directamente) | Apache 2.0 | Hugging Face |
| Otros backbones del benchmark Vision Foundation Models Benchmark | variable (40 backbones) | imagen | no disponible en esta ficha | variable | Hugging Face (colección) |

No se dispone en la información proporcionada de resultados de otros modelos comparables sobre Galaxy10 DECaLS, por lo que la comparativa cuantitativa con alternativas queda limitada a la media del propio benchmark.

## Limitaciones y advertencias

- Rendimiento moderado: accuracy de 56,82 % y F1 ponderado de 54,38 % sobre 10 clases, lejos de un clasificador perfecto; puede confundir clases morfológicamente próximas.
- Sesgos del dataset: Galaxy10 DECaLS tiene una distribución de clases y una selección de imágenes concreta; el modelo hereda los sesgos de esa muestra y puede no generalizar a otros sondeos o rangos de redshift.
- Backbone congelado: al no ajustarse el backbone, el modelo no se adapta a dominios visuales distintos del preentrenamiento DINOv2 ni a resoluciones muy alejadas de 256x256 px.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de asignar una clase con alta confianza a imágenes fuera de distribución (ruido, artefactos, objetos no galácticos).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la validez científica de las predicciones.
- Sin verificación independiente: las métricas están declaradas por el autor y marcadas como no verificadas en el model-index.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/dinov2-small-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace público).
