# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-llama3b-code-replay-ce

## Resumen

`code-sft-rerun-20261102-llama3b-code-replay-ce` es un artefacto de investigación publicado por el colectivo RL-Forgetting-Experiments-3 en Hugging Face. No se trata de un modelo base nuevo, sino de un fine-tuning supervisado (SFT) sobre Llama-3.2-3B-Instruct orientado a tareas de código, con una técnica de *replay* (repetición de datos previos) para mitigar el olvido catastrófico durante el ajuste. El nombre codifica la configuración experimental: *code-replay* con pérdida de entropía cruzada (CE) sobre un modelo Llama de 3B.

El repositorio forma parte de una campaña experimental más amplia (noviembre de 2026) que compara distintas estrategias de ordenación y mezcla de datos (ordered, shuffled, uniform, hard, CE) sobre varios modelos pequeños. Su interés es metodológico: sirve para estudiar cómo el orden y la composición del dataset de SFT afectan al olvido de capacidades previas y a la retención de conocimiento, no para uso en producción.

La relevancia actual es acotada: se publica como material reproducible de un estudio sobre olvido en RL/SFT, con manifiestos de ejecución, checkpoints intermedios y métricas de evaluación (MBPP+). El tamaño del repositorio (77,1 GB) incluye pesos en safetensors y artefactos de entrenamiento, lo que lo hace útil para replicar experimentos, pero no como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3B (aproximado, segun el modelo base Llama-3.2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (Llama 3.2 Community License y Acceptable Use Policy para los derivados de Llama) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT de Llama-3.2-3B-Instruct, un transformer decoder-only de 3B parámetros con atención estándar. El entrenamiento se realizó con los siguientes hiperparámetros declarados en la model card: learning rate 1e-5, una época, semilla 42, batch efectivo 256 (micro-batch 1), 4 GPUs H100, secuencias de 4096 tokens y 10 guardados de checkpoint por brazo experimental. Se aplicó *replay* con lambda 1.0, es decir, se mezclaron datos de replay con los datos de código para reducir el olvido de las capacidades originales del modelo base.

La innovación metodológica no está en la arquitectura sino en el protocolo experimental: el repositorio documenta inputs exactos, código fuente, estado de recuperación retenido y métricas en manifiestos (`delivery_manifest.json`, `request-provenance.json`). La evaluación se realizó sobre MBPP+ con n=160 y temperatura 0.6, según el manifiesto de evaluaciones. No se especifica la composición exacta del dataset de código ni el número total de tokens de entrenamiento más allá de la configuración de secuencia y batch.

## Capacidades

- Generación de código en el dominio de programación, heredada del ajuste SFT sobre datos de código.
- Razonamiento y generación de texto general, presumiblemente preservados parcialmente mediante la estrategia de replay.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades especiales (modo thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos sobre olvido catastrófico: el repositorio incluye checkpoints intermedios (10 por brazo), manifiestos de ejecución y métricas, lo que permite replicar el estudio y comparar el efecto del replay frente a otras estrategias de mezcla de datos.
- Estudio de la influencia del orden de datos en SFT: al existir variantes ordered, shuffled, uniform, hard y CE, se puede analizar cómo el orden afecta a la retención de capacidades en modelos de 3B.
- Evaluación de retención de código con MBPP+: el manifiesto de evaluaciones permite reutilizar el pipeline de scoring para comparar derivados de Llama-3.2-3B.
- Investigación sobre mitigación de olvido con replay: el parámetro lambda 1.0 y los datos de replay documentados sirven como referencia para diseñar experimentos con otros modelos pequeños.
- Docencia y formación en ingeniería de modelos: el repositorio ejemplifica un protocolo riguroso de trazabilidad de entrenamiento (inputs, checkpoints, métricas) útil como plantilla.
- Análisis de licencias en modelos derivados: el repositorio incluye LICENSE/NOTICE/USE_POLICY del modelo base, lo que permite estudiar la cadena de restricciones legales en derivados de Llama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones sobre MBPP+ (n=160, temperatura 0.6) con manifiesto de scoring, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 3B en fp16 se estiman aproximadamente 6-7 GB, y en cuantizaciones de 4 bits alrededor de 2-3 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 4x H100; para inferencia no se especifican GPU recomendadas.
- No se confirma que quepa en GPU de consumo, aunque por tamaño (3B) sería plausible en RTX 3060/4060/4090 con cuantización.
- Opciones de despliegue: no documentadas por el autor (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-llama3b-code-replay-ce | 3B | 4096 (entrenamiento) | other (Llama 3.2 Community License) | Repo de investigación, 0 descargas | Artefacto experimental con checkpoints y manifiestos |
| Llama-3.2-3B-Instruct | 3B | 128k (modelo base) | Llama 3.2 Community License | Amplia, uso comercial permitido bajo condiciones | Modelo base oficial de Meta |
| Qwen2.5-3B | 3B | 32k (aprox.) | Qwen Research License | Amplia | Alternativa de 3B usada en el mismo estudio |
| Qwen3-1.7B-Base | 1.7B | no disponible | Apache 2.0 | Amplia | Alternativa más pequeña del mismo estudio |

La comparativa se limita a parámetros y licencia porque no hay datos de rendimiento publicados para este artefacto. El modelo base Llama-3.2-3B-Instruct tiene una ventana de contexto mucho mayor (128k) que la longitud de entrenamiento declarada aquí (4096 tokens), lo que sugiere que el fine-tuning no amplió el contexto.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; no hay pipeline declarado ni documentación de uso.
- Riesgo de olvido catastrófico: precisamente el fenómeno que el estudio intenta medir; el replay con lambda 1.0 no garantiza la retención completa de las capacidades del modelo base.
- Sesgos: no documentados; se heredan los del modelo base Llama-3.2-3B-Instruct, pero no se analizan en la model card.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base es multilingüe, pero el SFT podría haber reducido el rendimiento en idiomas distintos del inglés.
- Restricciones de licencia: licencia "other" con Llama 3.2 Community License y Acceptable Use Policy; el uso comercial está sujeto a las condiciones de Meta y no se conceden derechos adicionales sobre el modelo upstream.
- Contexto limitado a 4096 tokens en entrenamiento, muy inferior al del modelo base.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El repositorio incluye checkpoints intermedios y artefactos que elevan el tamaño a 77,1 GB, lo que puede dificultar su descarga y uso.

## Enlaces

- Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-llama3b-code-replay-ce
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
