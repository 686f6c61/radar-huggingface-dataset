# kimgreg/semantic-sft

## Resumen

semantic-sft es una colección de checkpoints de investigación publicada por el usuario kimgreg en Hugging Face, construida mediante fine-tuning supervisado (SFT) sobre el modelo base LiquidAI/LFM2.5-230M. El proyecto estudia cómo el ajuste supervisado inyecta hechos nuevos (biografías de personas ficticias) en un modelo ya instruido y qué coste tiene ese proceso en las capacidades previas del modelo. No se trata, por tanto, de un modelo listo para producción, sino de un artefacto experimental orientado a analizar los mecanismos y efectos secundarios de la inyección de conocimiento.

El repositorio contiene múltiples ejecuciones (runs), cada una organizada en carpetas por época (`<run>/e<epoch>/`) con pesos en bf16, `config.json` y `generation_config.json`, además de un `run-config.json` con la configuración completa y los hashes de los datos. El tamaño del repositorio es de 127,6 GB, lo que refleja la acumulación de numerosos checkpoints intermedios. El modelo base es un transformer de 230 millones de parámetros de Liquid AI, y el tokenizador utilizado es el del modelo original.

La relevancia del proyecto es metodológica: proporciona un conjunto controlado de modelos deliberadamente degradados en muchas de las ejecuciones para estudiar la relación entre la adquisición de hechos nuevos y la pérdida de capacidades (olvido catastrófico, alineación, robustez). El autor advierte explícitamente de que los hechos son ficticios y de que los modelos no deben usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM2.5-230M) |
| Parámetros totales | 230 M (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo LiquidAI/LFM2.5-230M, un transformer de 230 millones de parámetros. Los checkpoints de semantic-sft son modificaciones fine-tuned de ese modelo base mediante SFT sobre un dataset de biografías de personas ficticias, con el objetivo de medir la inyección de hechos nuevos. Cada ejecución dispone de checkpoints por época (por ejemplo, `e20`), lo que permite trazar la evolución del conocimiento inyectado y del deterioro de capacidades a lo largo del entrenamiento. El `run-config.json` de cada ejecución documenta todos los hiperparámetros y los hashes de los datos, lo que facilita la reproducibilidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre el uso de RLHF o DPO. El autor indica que muchas de las ejecuciones producen modelos degradados de forma intencionada, lo que sugiere que el proyecto explora deliberadamente regímenes de entrenamiento agresivos o mal calibrados para estudiar sus efectos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto condicionada por instrucciones, heredada del modelo base LFM2.5-230M.
- Inyección de hechos nuevos: los checkpoints incorporan biografías ficticias de personas, lo que permite estudiar la memorización y recuperación de información inyectada.
- Evaluación del olvido catastrófico: al comparar checkpoints por época se puede medir la degradación de capacidades previas.
- Capacidades de razonamiento, código, matemáticas, visión o audio: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre inyección de conocimiento: usar los checkpoints por época para analizar cómo se codifica y recupera un hecho nuevo a lo largo del entrenamiento, comparando la precisión factual en cada checkpoint.
- Estudio del olvido catastrófico: evaluar el modelo base frente a los checkpoints fine-tuned en tareas estándar (comprensión lectora, generación) para cuantificar la pérdida de capacidades asociada al SFT.
- Análisis de robustez y alineación: los modelos degradados intencionadamente permiten estudiar cómo el SFT agresivo afecta a la coherencia y a la seguridad de las respuestas.
- Reproducibilidad de experimentos: el `run-config.json` con hashes de datos e hiperparámetros permite replicar las ejecuciones y auditar la metodología.
- Docencia y formación: servir como ejemplo práctico de los riesgos del fine-tuning sobre modelos pequeños y de la necesidad de evaluar más allá de la tarea objetivo.
- Benchmarking de metodologías de evaluación de conocimiento factual: comparar distintas métricas (exact match, F1, evaluación por LLM juez) sobre los hechos ficticios inyectados.
- Estudio de la relación entre tamaño de modelo y retención de hechos: al ser un modelo de 230 M, sirve como punto de comparación frente a modelos mayores en experimentos de inyección de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,5 GB para los pesos (230 M de parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,25 GB; en 4 bits, alrededor de 0,15 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también CPU para inferencia en lotes pequeños.
- Cabe holgadamente en GPU consumer, incluidos portátiles con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` y `subfolder="<run>/e20"`; compatible potencialmente con llama.cpp, Ollama o vLLM si se convierte el checkpoint, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| semantic-sft (kimgreg) | 230 M | no disponible | LFM Open License v1.0 | Hugging Face | Checkpoints de investigación, degradados intencionadamente en muchas ejecuciones |
| LiquidAI/LFM2.5-230M | 230 M | no disponible | LFM Open License v1.0 | Hugging Face | Modelo base instruido, punto de partida del fine-tuning |
| Otros modelos de ~230 M (p. ej., SmolLM2-135M, Qwen2.5-0.5B) | 135-500 M | variable | variable | Hugging Face | Alternativas de tamaño similar para tareas de generación; no comparables directamente por falta de benchmarks en la información disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: el autor advierte de que los hechos son ficticios y de que los modelos están degradados intencionadamente en muchas ejecuciones; no debe usarse en producción.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente en los checkpoints más avanzados por época.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para cualquier uso, incluso no comercial; se distribuye como "other" en los metadatos de Hugging Face.
- El repositorio ocupa 127,6 GB, lo que implica un coste de almacenamiento y descarga considerable si se quieren todos los checkpoints.
- No se proporciona tokenizador propio: debe usarse el del modelo base LiquidAI/LFM2.5-230M.
- Ausencia de benchmarks publicados: no es posible evaluar su rendimiento de forma objetiva sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimgreg/semantic-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia LFM Open License v1.0: disponible en el archivo `LICENSE` del repositorio
