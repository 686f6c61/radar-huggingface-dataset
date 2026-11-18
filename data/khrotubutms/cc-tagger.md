# khrotubutms/cc-tagger

## Resumen

cc-tagger es un modelo encoder de clasificación de texto derivado de Ettin-encoder-32m, un transformer tipo ModernBERT de 32 millones de parámetros desarrollado originalmente por el grupo JHU-CLSP. El modelo ha sido ajustado por el usuario khrotubutms para una tarea muy específica: clasificar diffs de git en una de las diez categorías de Conventional Commits (feat, fix, docs, style, refactor, test, chore, build, ci, perf). Resuelve, por tanto, el problema de etiquetar automáticamente cambios de código con la taxonomía de commits convencionales, algo útil para automatizar changelogs, validar políticas de commit o enriquecer historiales de repositorios.

La relevancia del modelo reside en su tamaño reducido (32M parámetros, ~0,1 GB de repositorio) combinado con una ventana de entrenamiento de hasta 8192 tokens, lo que permite procesar diffs relativamente largos en hardware modesto (fue entrenado en una única NVIDIA L4). No es un modelo generativo: es un clasificador discriminativo de una sola etiqueta por diff, lo que lo hace extremadamente eficiente para pipelines de CI/CD o herramientas de análisis estático.

El modelo se distribuye en safetensors bajo licencia Apache 2.0, es compatible con Transformers y Text Embeddings Inference, y no tiene, a día de la publicación, descargas ni likes registrados. La información pública sobre idiomas, benchmarks y detalles finos de entrenamiento es escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base Ettin-encoder-32m) |
| Parámetros totales | 32.034.826 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima usada en entrenamiento); uso recomendado en la model card: 1024 tokens |
| Tipos de cuantización | no disponible (pesos safetensors en BF16/FP32; cuantizaciones GGUF/ONNX no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo parte de Ettin-encoder-32m, un encoder ModernBERT de 32M parámetros. ModernBERT introduce mejoras sobre BERT clásico: rotary positional embeddings (RoPE), atención con ventana local/global alternada, activaciones GeGLU y capas de normalización pre-norm, lo que permite contextos largos con menor coste computacional. Sobre esta base se aplicó un ajuste en dos fases: primero un preentrenamiento adaptativo a la tarea (1 epoch de masked language modeling a 512 tokens sobre todos los diffs compilados) y después un fine-tuning completo con pérdida ponderada por clase, 8 epochs, batch efectivo 32, longitud máxima de secuencia 8192 y precisión BF16, usando una única NVIDIA L4.

El dataset de entrenamiento consta de 39.891 pares diff→etiqueta, derivados de 55.875 commits únicos no-merge en 19 repositorios git, tras excluir diffs duplicados, sobredimensionados, binarios y vacíos. Las etiquetas fueron generadas por el modelo nvidia/GLM-5.3-Flash-NVFP4, es decir, se trata de un etiquetado sintético (destilación de un LLM generativo hacia un encoder pequeño). No se menciona uso de RLHF/DPO, lo cual es esperable en un clasificador. La innovación técnica principal es precisamente la combinación de preentrenamiento adaptativo sobre diffs y la destilación de etiquetas desde un LLM grande.

## Capacidades

- Clasificación de diffs de git en diez tipos de Conventional Commits: feat, fix, docs, style, refactor, test, chore, build, ci, perf.
- Clasificación de una sola etiqueta por diff (single-label, sequence classification).
- Procesamiento de diffs largos gracias a la ventana de entrenamiento de hasta 8192 tokens (con truncado configurable).
- Inferencia eficiente en CPU y GPU modestas por su tamaño de 32M parámetros.
- Compatibilidad con el pipeline `text-classification` de Transformers y con Text Embeddings Inference (endpoints compatibles).
- No soporta tool calling, function calling, agentes, generación de texto libre, visión, audio ni modos de razonamiento extendido (thinking mode).
- Capacidades multilingües: no disponibles; la model card no documenta idiomas.

## Casos de uso

- Automatización de changelogs: clasificar cada commit de un repositorio y agrupar los cambios por tipo (feat, fix, perf, etc.) para generar notas de release estructuradas, aprovechando la ventana de 8192 tokens para diffs largos.
- Validación de políticas de commit en CI: en un hook de pre-commit o pipeline de GitHub Actions, comparar la etiqueta predicha con el prefijo declarado por el desarrollador y rechazar commits mal etiquetados.
- Enriquecimiento de historiales de git: anclar a cada commit una etiqueta semántica derivada del diff, útil para búsquedas, métricas de ingeniería o dashboards de actividad por tipo de cambio.
- Análisis de contribuciones externas: clasificar pull requests de forks o repositorios de terceros para priorizar revisiones de features frente a chores o style.
- Detección de cambios de alto riesgo: usar la clase perf o refactor como señal para activar revisiones adicionales o pruebas de regresión específicas en pipelines de CD.
- Etiquetado masivo de datasets de código: aplicar el modelo a grandes corpus de commits para construir datasets de entrenamiento con etiquetas de tipo de cambio, dado su bajo coste por inferencia.
- Herramientas de developer experience: integrar el clasificador en editores o bots de Slack para sugerir el prefijo Conventional Commit adecuado a partir del diff preparado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16/FP32 (32M parámetros, ~0,1 GB de pesos), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), T4, RTX 3060/4060/4090, A100/H100 sobredimensionadas para este modelo; también viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, incluidas iGPU y CPU.
- Opciones de despliegue: Transformers (`AutoModelForSequenceClassification`), Text Embeddings Inference (compatible con endpoints), exportación a ONNX no documentada por el autor; llama.cpp/Ollama no publicados.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cc-tagger | 32.034.826 | 8192 (entrenamiento) | Clasificación de diffs git | Apache 2.0 | Hugging Face |
| jhu-clsp/ettin-encoder-32m | ~32M | no disponible | Encoder general (MLM) | no disponible | Hugging Face |
| Modelos generativos tipo GLM-5.3-Flash-NVFP4 | no disponible | no disponible | Generación / etiquetado | no disponible | Hugging Face |
| Clasificadores de commits convencionales alternativos | no disponible | no disponible | Clasificación de commits | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento fueron generadas por un LLM (nvidia/GLM-5.3-Flash-NVFP4), por lo que el modelo hereda sesgos y posibles errores de etiquetado de ese profesor.
- Riesgo de alucinación bajo en la forma clásica (no genera texto), pero puede producir clasificaciones erróneas en diffs ambiguos, muy largos o fuera de la distribución de los 19 repositorios de entrenamiento.
- El modelo solo predice una etiqueta por diff; diffs que mezclan varios tipos de cambio (p. ej., feat + docs) no se representan correctamente.
- Idiomas soportados no documentados; los diffs de código son mayoritariamente independientes del idioma natural, pero comentarios y mensajes en idiomas distintos del inglés pueden afectar el rendimiento.
- Contexto de entrenamiento de 8192 tokens, pero la model card recomienda truncar a 1024 tokens en uso; diffs que excedan ese límite pueden perder información relevante.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Ettin-encoder-32m enlazada por el autor, ya que la model card remite a ella.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni informes de uso en producción.
- No apto para generación de texto, tool calling ni tareas fuera de la clasificación de diffs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khrotubutms/cc-tagger
- Modelo base Ettin-encoder-32m: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Licencia del modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m#license
- Modelo etiquetador usado para generar el dataset: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
