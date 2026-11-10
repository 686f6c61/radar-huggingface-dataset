# JackHsieh/Thoughtless.Qwen3-4B-Base.80M-iid.statML-arxiv.best

## Resumen

Thoughtless.Qwen3-4B-Base.80M-iid.statML-arxiv.best es un modelo derivado de Qwen/Qwen3-4B-Base obtenido mediante *continued pretraining* con predicción simple del siguiente token (sin modo de razonamiento ni *thinking tokens*). Lo desarrolla el usuario JackHsieh dentro de un proyecto denominado "prestar" y se publica bajo licencia Apache 2.0. El modelo conserva la arquitectura y el tamaño del base: 4.022.468.096 parámetros en formato safetensors (aproximadamente 4B), con pesos exportados en fp32 sin conversión.

El objetivo declarado es adaptar el modelo base a un dominio concreto de estadística y *machine learning* procedente de arXiv, mediante un ajuste fino ligero sobre una ventana i.i.d. de 80 millones de tokens del corpus `JackHsieh/statML-arxiv-iid-160M-20M`, complementada con un 25 % de *replay* de `JackHsieh/dclm-replay.seq-4096.tokens-32B` para mitigar el olvido catastrófico. El checkpoint publicado corresponde a la mejor celda de un barrido de tasa de aprendizaje y proporción de *replay*, seleccionada por pérdida de validación final sobre el split de test de 20M de tokens del propio corpus.

Su relevancia es acotada: no es un modelo de propósito general ni compite en benchmarks abiertos, sino un artefacto de investigación reproducible para estudiar *continued pretraining* de bajo coste (1.622 pasos, 2 épocas, 4 GPU H100) y el efecto del *replay* en la retención de capacidades. Resulta útil para quien quiera replicar la receta o evaluar la especialización de dominio en Qwen3-4B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (documentos de entrenamiento de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra fp32, sin casting) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4B parámetros, y no introduce cambios arquitectónicos: el trabajo es exclusivamente de *continued pretraining* con predicción del siguiente token en modo "thoughtless", es decir, sin tokens de pensamiento ni objetivos de razonamiento. Los datos principales son la ventana i.i.d. de 80M tokens de `JackHsieh/statML-arxiv-iid-160M-20M` (concretamente `train[:19456]`, con documentos de 4096 tokens), mezclada con un 25 % de *replay* procedente de `JackHsieh/dclm-replay.seq-4096.tokens-32B`; el orden principal se rebaraja en cada época.

La optimización emplea AdamW con lr 7e-06 (betas 0.9/0.95, eps 1e-08, weight decay 0.01), schedule coseno con 5 % de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (1.622 pasos) y semilla 0. El sistema usa FSDP2 con *full shard*, pesos maestros en fp32, cómputo en bf16 y flash-attention-2 sobre 4 GPU H100. La pérdida de validación final reportada en el split de test de 20M tokens es de 1,23976 nats/token (la celda del barrido marcó 1,23974). No se documenta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje estándar, heredados del base Qwen3-4B-Base.
- Especialización declarada en texto científico de estadística y *machine learning* (arXiv), por el corpus de entrenamiento.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo *thinking*; el nombre "thoughtless" indica explícitamente ausencia de pensamiento.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigación en *continued pretraining*: replicar la receta (lr 7e-06, 25 % de *replay*, 2 épocas, 1.622 pasos) para estudiar olvido catastrófico y retención de capacidades en modelos de 4B.
- Modelado de lenguaje en dominio estadístico: usar el checkpoint como base para tareas de continuación de texto o *perplexity* sobre corpus de estadística y ML procedentes de arXiv.
- Punto de partida para ajuste supervisado de dominio: al estar especializado en literatura de statML, sirve como inicialización para clasificación o extracción de información en artículos científicos.
- Evaluación comparativa de estrategias de *replay*: el checkpoint es la mejor celda de un barrido, por lo que puede usarse como referencia frente a otras proporciones de *replay* y tasas de aprendizaje.
- Generación de resúmenes o continuaciones en documentación técnica de ML: el modelo ha visto 80M tokens de documentos de 4096 tokens del dominio, lo que puede mejorar la fluidez en ese registro frente al base.
- Reproducibilidad de experimentos: el *wandb run* y los hiperparámetros completos permiten auditar y repetir el entrenamiento en 4 GPU H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de validación final sobre el split de test de 20M tokens del corpus: 1,23976 nats/token.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022.468.096 parámetros × 4 bytes), más memoria para activaciones y KV cache.
- VRAM estimada en bf16/fp16: aproximadamente 8 GB para pesos, más activaciones y KV cache.
- GPU recomendadas: el entrenamiento se realizó en 4× H100; para inferencia, A100, H100 o L40S son adecuadas.
- GPU de consumo: cabe en GPUs con 24 GB o más (RTX 3090, RTX 4090) en bf16; en fp32 requiere al menos 24 GB y deja poco margen.
- Opciones de despliegue: no se documentan; al ser safetensors compatible con Qwen3-4B-Base, cabría esperar compatibilidad con vLLM, TGI o llama.cpp previa conversión a GGUF, aunque no está verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thoughtless.Qwen3-4B-Base.80M-iid.statML-arxiv.best | 4.022.468.096 | no disponible | statML/arXiv (continued pretraining) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Base | ~4B | no disponible | propósito general | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen3-4B (instruct) | ~4B | no disponible | propósito general con instrucciones | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (otros checkpoints de *continued pretraining* sobre Qwen3-4B-Base) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes*: no hay evidencia de uso en producción ni validación externa.
- No se han publicado evaluaciones en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que se desconoce el impacto del *continued pretraining* en capacidades generales.
- Riesgo de olvido catastrófico: aunque se aplica un 25 % de *replay*, dos épocas sobre un corpus de dominio estrecho pueden degradar habilidades del base fuera de statML.
- Riesgo de alucinación inherente a un modelo de 4B sin alineamiento por RLHF/DPO documentado.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equivalente al base.
- Longitud de contexto no documentada; los documentos de entrenamiento son de 4096 tokens, pero no se especifica la ventana efectiva del modelo.
- Pesos en fp32: el repositorio ocupa 16,1 GB, lo que encarece el almacenamiento y la carga frente a versiones en bf16.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B-Base conviene verificar las condiciones del modelo original.
- El contenido de la model card es la única fuente técnica; no hay paper ni documentación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Thoughtless.Qwen3-4B-Base.80M-iid.statML-arxiv.best
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset principal: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/zog13cj8
