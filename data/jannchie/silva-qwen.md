# Jannchie/silva-qwen

## Resumen

SILVA (SigLIP-based Illustration Visual Aesthetic Scorer) es un modelo de clasificación de imágenes que puntúa ilustraciones según el gusto de un juez VLM destilado. Desarrollado por Jianqi Pan (Jannchie), este adaptador de cabecera (head) se ejecuta sobre el backbone congelado `google/siglip2-so400m-patch14-384` y produce una puntuación continua en el rango `[0, 1]`, donde valores más altos indican mayor afinidad con el gusto del juez. No es un modelo de calidad universal, sino que reproduce las preferencias de un VLM específico (Qwen3.5-9B) que ordenó ilustraciones durante el entrenamiento.

El modelo tiene 1.840.389 parámetros (solo la cabecera, ~7 MB) y se distribuye bajo licencia MIT. Su arquitectura es un MLP de tres capas sobre el embedding de 1152 dimensiones del backbone SigLIP2, con una cabeza ordinal para regresión. Está diseñado para integrarse fácilmente en pipelines de evaluación estética, ya sea puntuando imágenes directamente o trabajando sobre embeddings precalculados. Su relevancia actual radica en ofrecer un juez estético ligero y personalizable, entrenado mediante destilación de preferencias de un VLM, sin necesidad de ejecutar el modelo de lenguaje completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP sobre backbone SigLIP2 (embedding 1152 → LayerNorm → MLP [1024, 512, 256] → cabeza ordinal) |
| Parametros totales | 1.840.389 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador de cabecera que se conecta al backbone congelado `google/siglip2-so400m-patch14-384`. La arquitectura de la cabecera es un perceptrón multicapa con normalización por capas: recibe el embedding de 1152 dimensiones (pooler_output) del backbone, lo pasa por una capa LayerNorm y luego por tres capas densas de 1024, 512 y 256 neuronas, finalizando en una cabeza ordinal para regresión. Esta cabeza ordinal permite predecir una puntuación continua calibrada a la distribución de etiquetas del conjunto de entrenamiento.

El entrenamiento se realizó mediante destilación de preferencias: un VLM local (Qwen/Qwen3.5-9B ejecutado con vLLM) ordenó conjuntos de ocho ilustraciones a la vez, y esas ordenaciones se agregaron mediante el modelo de Plackett-Luce para obtener una puntuación latente por imagen (con grado 21). Con esos datos se entrenó la cabecera para predecir la puntuación latente. No se dispone de información sobre el número total de imágenes de entrenamiento ni la composición exacta del dataset, aunque el modelo se enfoca en ilustraciones (arte digital, probablemente de estilos variados). No se menciona el uso de RLHF ni DPO; el proceso es una destilación supervisada de rankings.

## Capacidades

- Puntuación estética de ilustraciones: devuelve un valor continuo en `[0, 1]` que refleja el gusto del juez VLM destilado.
- Procesamiento por lotes: acepta una lista de rutas de imagen y devuelve una lista de puntuaciones.
- Trabajo sobre embeddings: permite puntuar directamente embeddings precalculados del backbone SigLIP2, sin necesidad de reprocesar las imágenes.
- Calibración: ofrece tanto la puntuación cruda (`score`) como la calibrada (`calibrated_score`) ajustada a la distribución de etiquetas.
- Integración con la librería `silva`: API simple mediante `SilvaScorer.from_pretrained()`.
- No es un modelo multimodal: no procesa texto ni genera descripciones; solo produce una puntuación numérica.

## Casos de uso

- Filtrado de datasets de ilustraciones: antes de entrenar un modelo generativo o un clasificador, se puede usar SILVA para descartar imágenes de baja calidad estética según el gusto del juez, reduciendo ruido en el conjunto de datos.
- Selección de portfolios para artistas: un ilustrador puede puntuar sus propias obras para identificar cuáles se alinean mejor con un estilo concreto (el del juez VLM) y priorizarlas en su presentación.
- Ranking de imágenes generadas: en un pipeline de generación con modelos como Stable Diffusion, se puede usar SILVA como recompensa para seleccionar las mejores salidas entre varias muestras, mejorando la calidad percibida del resultado final.
- Evaluación de consistencia estética en series: para un estudio de animación o cómic, se puede puntuar cada viñeta o página y detectar desviaciones del estilo deseado, ayudando a mantener coherencia visual.
- Moderación de contenido en comunidades de arte: plataformas que permiten subir ilustraciones pueden usar SILVA como filtro previo para destacar obras que probablemente gusten a la comunidad, aunque requiere adaptar el juez a las preferencias de esa comunidad.
- Investigación en estética computacional: como herramienta de puntuación rápida y ligera, sirve para experimentos que correlacionan puntuaciones estéticas con otras variables (color, composición, etc.) sin necesidad de un VLM completo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en un split de test reservado (held-out):

| Metrica | Valor |
|---|---|
| Spearman | 0.7481 |
| Pearson | 0.7566 |
| MAE (escala 1–5) | 0.5254 |
| Top-5% | 0.4359 |

No se han publicado comparaciones con otros modelos de puntuación estética en la información disponible. Estas métricas indican una correlación moderada-alta con las preferencias del juez VLM, pero no deben interpretarse como calidad universal.

## Requisitos de hardware

- La cabecera del modelo es muy ligera (~7 MB, 1.84 M parámetros) y puede ejecutarse en CPU sin problemas.
- El backbone SigLIP2 (`google/siglip2-so400m-patch14-384`) tiene aproximadamente 400 millones de parámetros; en FP16 requiere alrededor de 800 MB de VRAM, y en FP32 unos 1.6 GB.
- Una GPU consumer como una RTX 3060 (12 GB) o superior es suficiente para inferencia con el backbone completo. También puede ejecutarse en CPU, aunque la latencia será mayor (del orden de segundos por imagen).
- Para procesamiento por lotes de muchas imágenes, se recomienda una GPU con al menos 8 GB de VRAM para mantener un throughput razonable.
- Opciones de despliegue: la librería `silva` se instala vía pip (`silva-scorer[backbone]`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede integrar en pipelines de Python estándar.
- Latencia estimada: no disponible en la documentación; dependerá del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de puntuación estética (como el predictor de estética de LAION o modelos de calidad de imagen tipo NIMA). La información disponible no incluye benchmarks comparativos ni especificaciones de alternativas. Se recomienda evaluar SILVA en el caso de uso concreto antes de adoptarlo.

## Limitaciones y advertencias

- El modelo reproduce el gusto de un único juez VLM (Qwen3.5-9B); no es un modelo de calidad universal y puede no coincidir con las preferencias de otros usuarios o comunidades.
- Solo puntúa ilustraciones; su rendimiento en fotografías u otros tipos de imagen no está documentado y probablemente sea inferior.
- No procesa texto ni genera explicaciones; la salida es únicamente un número.
- La calibración de la puntuación depende de la distribución de etiquetas del conjunto de entrenamiento; la puntuación calibrada puede no ser comparable entre dominios distintos.
- No se han publicado detalles sobre sesgos del conjunto de entrenamiento (estilos, culturas, etc.), por lo que podría favorecer ciertos estilos artísticos sobre otros.
- Riesgo de alucinación no aplica (no genera texto), pero la puntuación puede ser poco fiable en imágenes fuera de la distribución de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el backbone SigLIP2 tiene su propia licencia (Apache 2.0 según Google), que debe verificarse para uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jannchie/silva-qwen
- Repositorio GitHub: https://github.com/Jannchie/silva
- Demo interactiva: https://huggingface.co/spaces/Jannchie/silva-aesthetic-demo
- Modelo base SigLIP2: https://huggingface.co/google/siglip2-so400m-patch14-384
