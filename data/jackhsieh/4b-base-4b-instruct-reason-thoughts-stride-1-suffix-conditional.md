# JackHsieh/4B-base.4B-Instruct-reason-thoughts.stride-1.suffix-conditional

## Resumen

El modelo `4B-base.4B-Instruct-reason-thoughts.stride-1.suffix-conditional` es un experimento de continued pretraining desarrollado por JackHsieh a partir del modelo Qwen/Qwen3-4B-Base. Se trata de un checkpoint intermedio, no de un modelo final listo para producción, diseñado para estudiar el efecto de prepender pensamientos sintéticos (thoughts) a documentos científicos en formato LaTeX del dominio stat.ML de arXiv. El objetivo es evaluar cómo condicionar el modelo a un razonamiento previo generado artificialmente afecta a la predicción de los siguientes tokens.

La arquitectura es la heredada de Qwen3-4B-Base, un transformer de 4.022 millones de parámetros. El modelo ha sido entrenado durante 2 épocas sobre un corpus de documentos de arXiv, con un 10 % de replay de otro dataset. El resultado es un modelo con capacidad para modelar texto matemático, pero con una mejora marginal en métricas internas de verosimilitud. Es relevante para la investigación en técnicas de reasoning, continued pretraining y condicionamiento por pensamientos, dentro de la línea de trabajo denominada "prestar".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos en fp32 master copy) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base y se ha continuado entrenando mediante continued pretraining. El corpus de entrenamiento es la partición train de `JackHsieh/statML-arxiv-40M-20M`, compuesta por 9.728 documentos de 4.096 tokens cada uno, complementada con un 10 % de replay de `JackHsieh/dclm-replay.seq-4096.tokens-32B` (262.144 documentos). Se realizaron 2 épocas con un total de 676 steps.

La innovación técnica reside en el uso de "thoughts" prepended: antes de cada chunk de documento se inserta un pensamiento generado por el modelo `JackHsieh/4B-Instruct-reason-only.stride-1.k-8.statml-arxiv.qwen3-ids.kv-tags-explained`, que es un Qwen3-4B-Instruct-2507 razonando sobre los próximos 8 tokens. Cada época utiliza uno de los dos pensamientos disponibles por chunk (g = 0, luego g = 1), con una longitud máxima de 640 tokens. El esquema es "suffix conditional": cada chunk de 8 tokens que no es el primero de un documento es thoughtful, con una tasa de entrenamiento r_train = 511/512, mientras que la evaluación se realiza en una rejilla stride-32 con r_val = 15/512.

La optimización emplea AdamW con lr 3e-6, betas 0.9/0.95, weight decay 0.01, programación coseno con 5 % warmup, grad clip 1.0 y batch de 32 documentos. El entrenamiento se realizó con FSDP2 full-shard, pesos maestros en fp32, cómputo en bf16, reducción de gradientes en fp32 y flash-attention-2 en 8 GPUs H200. Se añadieron dos tokens personalizados: `<|note|>` (151669) y `<|/note|>` (151670), inicializados con gaussian-diag y presentes en el tokenizer del repositorio.

## Capacidades

- Generación de texto en dominio científico: el modelo ha sido expuesto a LaTeX de stat.ML y puede continuar documentos con estilo matemático.
- Condicionamiento por pensamientos: acepta tokens de pensamiento prepended y puede evaluar su efecto en la predicción de tokens posteriores.
- Modelado de texto con símbolos especiales: incorpora dos tokens propios (`<|note|>` y `<|/note|>`).
- Evaluación de NLL por token: el autor reporta métricas de verosimilitud para comparar pases thoughtful y thoughtless.
- No se especifican capacidades de tool calling, function calling, soporte de agentes, multi-step reasoning autónomo, visión o audio en la información disponible.

## Casos de uso

- Investigación en condicionamiento por pensamientos sintéticos: el modelo permite comparar cómo la inclusión de un pensamiento prepended afecta a la verosimilitud de chunks de texto científico, como en el estudio de ablación del que forma parte.
- Reproducción de experimentos de continued pretraining: el checkpoint y su `checkpoint_meta.json` permiten reproducir el entrenamiento de 676 steps con los mismos hiperparámetros y datasets.
- Punto de partida para fine-tuning downstream: al ser un modelo base continuado, puede usarse como base para tareas de razonamiento matemático o compresión de documentos LaTeX.
- Estudio de la tasa de entrenamiento en esquemas stride-1 vs stride-32: sirve como brazo denso (r_train = 511/512) dentro de una comparativa de ablaciones.
- Análisis de la influencia de los pensamientos generados por un modelo instruct de 4B en un modelo base de 4B: útil para evaluar si el razonamiento sintético aporta señal predictiva.
- Evaluación de la calidad de generación en texto matemático LaTeX: puede emplearse para medir la coherencia de la generación condicionada en dominios académicos.
- Exploración del impacto de tokens añadidos en el tokenizer: permite estudiar cómo los tokens personalizados interactúan con el vocabulario original de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas internas del autor, calculadas sobre la rejilla de validación stride-32:

| Metrica | Valor |
|---|---|
| NLL/token thoughtful (chunks thoughtful) | 1.144 |
| NLL/token thoughtless (pase propio sobre chunks thoughtful) | 1.147 |
| Win rate | 53.1 % |
| NLL/token híbrido (all-chunk) | 1.176 |

Estos valores indican una mejora muy ligera del pase thoughtful frente al thoughtless, sin que se hayan reportado evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada en fp32: alrededor de 16 GB solo para pesos, más activaciones y buffers. En bf16 la carga de pesos se reduce a aproximadamente 8 GB.
- GPU recomendadas para reproducción: se usaron 8×H200 durante el entrenamiento. Para inferencia sencilla, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090) puede ser suficiente si los pesos se cargan en bf16.
- No se proporcionan tipos de cuantizacion en el repositorio, por lo que no hay estimaciones para 4-bit o 8-bit.
- Opciones de despliegue: no disponibles. El repositorio no documenta configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, no se aportan mediciones de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de entrenamiento | Uso previsto |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B-Base | 4.022.468.096 | No disponible | Apache 2.0 | Dataset general de Qwen | Modelo base generico |
| JackHsieh/4B-base.4B-Instruct-reason-thoughts.stride-1.suffix-conditional | 4.022.468.096 | No disponible | Apache 2.0 | stat.ML arXiv + replay, con thoughts prepended | Experimento de condicionamiento por pensamientos |
| JackHsieh/4B-Instruct-reason-only.stride-1.k-8.statml-arxiv.qwen3-ids.kv-tags-explained | 4.022.468.096 | No disponible | Apache 2.0 | stat.ML arXiv, pensamientos generados | Generador de pensamientos para el experimento |

No se dispone de datos de benchmarks comparables entre estos modelos. Las diferencias principales se encuentran en el corpus de continued pretraining y en la presencia de un esquema de condicionamiento con pensamientos sintéticos.

## Limitaciones y advertencias

- Es un modelo experimental de investigación, no validado para uso en producción ni para tareas generales de NLP.
- El dominio de entrenamiento está limitado a LaTeX científico de stat.ML, lo que reduce su utilidad fuera de ese ámbito.
- Los pensamientos son generados por un modelo instruct de 4B, lo que introduce dependencia de la calidad de ese generador y de su longitud máxima de 640 tokens.
- La mejora reportada en NLL es marginal: 1.144 frente a 1.147, con un win rate del 53,1 %. No hay evidencia concluyente de una ventaja sólida.
- No se han realizado evaluaciones de sesgos, alucinaciones o seguridad.
- Los tokens añadidos (`<|note|>` y `<|/note|>`) no forman parte del vocabulario original de Qwen3 y pueden causar problemas al combinar el tokenizer con otros modelos o pipelines.
- La licencia Apache 2.0 permite uso comercial, pero no incluye ninguna garantía de calidad o idoneidad.
- Los datos de benchmarks estándar no estan disponibles, por lo que no es posible comparar el modelo con alternativas comerciales o de código abierto en tareas comunes.

## Enlaces

- HuggingFace: https://huggingface.co/JackHsieh/4B-base.4B-Instruct-reason-thoughts.stride-1.suffix-conditional
- Wandb run: https://wandb.ai/latent-thoughts/prestar/runs/oirrmz3g
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-40M-20M
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/4B-Instruct-reason-only.stride-1.k-8.statml-arxiv.qwen3-ids.kv-tags-explained
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Discusión relacionada: https://huggingface.co/datasets/JackHsieh/4B-reason-only.rule-r-1.0-k-8.L-512.statml-arxiv.qwen3-ids.kv-tags-explained/discussions
