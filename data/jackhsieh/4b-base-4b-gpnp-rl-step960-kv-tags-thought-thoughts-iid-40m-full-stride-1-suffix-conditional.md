# JackHsieh/4B-base.4B-gpnp-rl-step960-kv-tags-thought-thoughts.iid-40M-full.stride-1.suffix-conditional

## Resumen

Este modelo es un fine-tune por continued pretraining de Qwen3-4B-Base, desarrollado por el usuario JackHsieh en el contexto del proyecto "prestar" (latent-thoughts). Se trata de un experimento de investigación sobre chain-of-thought latente: el modelo se entrena con una "nota de pensamiento" (thought) antepuesta a cada fragmento de documento, de forma que aprende a condicionar la predicción del texto en una nota generada previamente sobre los siguientes 8 tokens. El objetivo es estudiar si el modelo puede aprovechar pensamientos explícitos durante el pretraining continuado para mejorar la modelización del lenguaje.

El modelo parte de Qwen3-4B-Base, una arquitectura transformer densa de aproximadamente 4.022 millones de parámetros, y se entrena sobre un corpus de artículos LaTeX de arXiv del área stat.ML (9.728 documentos de 4.096 tokens cada uno), con un 10% de replay de DCLM. El entrenamiento se realiza con el esquema "suffix conditional": cada chunk de 8 tokens de cada documento va acompañado de una nota (thought) que describe los siguientes 8 tokens, y el modelo se evalúa sobre una rejilla de test iid con stride 32.

Es relevante ahora porque documenta una técnica poco habitual (prepended thought durante continued pretraining) con métricas concretas de NLL y win rate, y porque publica los pesos en fp32 sin casting, junto con los tokens especiales añadidos (`<|note|>` y `<|/note|>`). No obstante, se trata de un artefacto de investigación con cero descargas y sin pipeline declarado, orientado a reproducibilidad experimental más que a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos exportados en fp32 sin casting) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (copia maestra fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3-4B-Base, con 4.022 millones de parámetros, entrenado mediante continued pretraining sobre el corpus `JackHsieh/statML-arxiv-iid-160M-20M`. La innovación principal es el uso de "thoughts" antepuestos: cada chunk de 8 tokens de cada documento va precedido por una nota envuelta en los tokens especiales `<|note|>` y `<|/note|>`, con el formato `KEY:{los 8 tokens anteriores al chunk}` y `THOUGHT:{nota}`, donde la nota es una descripción de los siguientes 8 tokens (máximo 1.024 tokens, con recorte). Las notas provienen del modelo `JackHsieh/4B-gpnp-rl-step960.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought`, obtenido tras 960 pasos de RL con el modelo de stock-thoughts como rewarder.

El entrenamiento usa el esquema "suffix conditional": todos los chunks no iniciales de 8 tokens de cada documento son "thoughtful" (stride 1, k=8), con evaluación sobre una rejilla de test iid con stride 32. Los datos son 9.728 documentos de 4.096 tokens, con un 10% de replay de `JackHsieh/dclm-replay.seq-4096.tokens-32B`, y el orden principal se rebaraja en cada epoch. La optimización usa AdamW con lr 3e-6 (β 0.9/0.95, ε 1e-8, weight decay 0.01), schedule coseno con 5% de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 epochs (676 pasos) y semilla 0. El sistema es FSDP2 full-shard con pesos maestros fp32 y cómputo bf16, flash-attention-2, sobre 4×GH200 (tres trabajos Slurm de 48 h con reanudación en los pasos 229 y 453). Se añaden los tokens `<|note|>` = 151669 y `<|/note|>` = 151670 con inicialización gaussian-diag, incluidos en el tokenizer del repo en ese orden.

## Capacidades

- Generación de texto y modelización del lenguaje sobre documentos LaTeX de arXiv (stat.ML).
- Condicionamiento por "thoughts" latentes: el modelo aprende a usar una nota prepended sobre los siguientes 8 tokens para predecir el texto.
- Capacidad de chain-of-thought explícito mediante los tokens especiales `<|note|>` y `<|/note|>`.
- Continued pretraining sobre dominio científico-matemático (stat.ML).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (no es un modelo instruction-tuned).
- Capacidades multilingües: no disponibles.
- Capacidades especiales: thinking mode implícito vía notas; sin visión ni audio.

## Casos de uso

- Investigación sobre chain-of-thought latente: el modelo sirve como artefacto reproducible para estudiar si las notas prepended mejoran la NLL en pretraining continuado, comparando con la variante sans-256 y con el modelo base.
- Experimentos de continued pretraining en dominio científico: permite replicar el pipeline sobre el corpus stat.ML de arXiv con los mismos hiperparámetros y semilla.
- Evaluación de técnicas de sufijo condicional: útil para medir win rate y NLL en rejillas de test iid con stride 32 frente a pasadas sin thought.
- Estudio de tokens especiales añadidos: el repo incluye `<|note|>` y `<|/note|>` en el tokenizer, lo que facilita analizar el efecto de tokens nuevos con inicialización gaussian-diag.
- Reproducibilidad de experimentos RL + CPT: el checkpoint enlaza con el run de wandb y con el modelo rewarder, lo que permite auditar la cadena completa de entrenamiento.
- Base para ablaciones de longitud de nota: el hiperparámetro `max_thought_length` 1088 y el recorte a 1.024 tokens permiten estudiar el efecto de la longitud del pensamiento en la modelización.

## Benchmarks y rendimiento

Evaluación final (paso 676, rejilla de test iid con stride 32):

| Metrica | Valor |
|---|---|
| NLL/token con thought (chunks thoughtful) | 1.2196 |
| NLL/token sin thought (pasada propia, chunks thoughtful) | 1.2240 |
| Win rate (thought vs sin thought) | 53.8% |
| NLL híbrida en todos los chunks | 1.2447 |

Comparación con la variante sans-256: 1.2196 vs 1.2240, win rate 53.5%, híbrida 1.2448. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.022 millones de parámetros, en fp32 los pesos ocupan aproximadamente 16,1 GB, por lo que se necesita al menos una GPU con 24 GB para fp32 y margen para activaciones.
- GPU recomendadas: el entrenamiento se realizó en 4×GH200; para inferencia, una A100 40 GB, H100 80 GB o RTX 4090 24 GB (esta última ajustada en fp32, más holgada en bf16/fp16).
- Cabe en consumer GPU: sí, en RTX 4090 24 GB con pesos en bf16/fp16; en fp32 requiere cuidado con el margen de memoria.
- Opciones de despliegue: no se documentan en la información proporcionada; al ser safetensors de un modelo Qwen3, es compatible con stacks que carguen arquitecturas Qwen3 (vLLM, TGI, transformers), aunque no hay confirmación oficial.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (JackHsieh 4B-base gpnp-rl-step960) | 4.022 M | no disponible | apache-2.0 | Hugging Face, 0 descargas | CPT con thoughts prepended sobre stat.ML |
| Qwen/Qwen3-4B-Base | ~4.000 M | no disponible | apache-2.0 | Hugging Face | Modelo base original, sin thoughts |
| JackHsieh/...iid-40M-sans-256.stride-1.suffix-conditional | ~4.022 M | no disponible | apache-2.0 | Hugging Face | Variante sin los últimos 256 documentos (658 pasos) |
| JackHsieh/Qwen3-4B.gpnp-rl.consumer-4B-base-gpnp-kvtt-iid40M-sans256.lr7e-7-kl0.step-960 | no disponible | no disponible | no disponible | Hugging Face | Modelo rewarder tras 960 pasos de RL |

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado y con cero descargas; no está pensado para uso en producción.
- No es un modelo instruction-tuned: no se documenta soporte de tool calling, agentes ni diálogo multi-turno.
- Entrenado exclusivamente sobre LaTeX de arXiv stat.ML; el dominio y los idiomas fuera de ese corpus no están garantizados (idiomas no disponibles).
- Los tokens especiales `<|note|>` y `<|/note|>` son necesarios para el formato de thoughts; su uso incorrecto degrada la predicción.
- Riesgo de alucinación no evaluado en la información disponible; las métricas publicadas son solo NLL y win rate sobre la rejilla de test iid.
- La licencia apache-2.0 permite uso comercial, pero al derivar de Qwen3-4B-Base conviene revisar las condiciones del modelo base.
- Pesos exportados en fp32 sin casting: el repo ocupa 16,1 GB y requiere más memoria que una versión bf16.
- Entrenado en tres trabajos Slurm con reanudaciones; posibles efectos de no determinismo entre reanudaciones no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-rl-step960-kv-tags-thought-thoughts.iid-40M-full.stride-1.suffix-conditional
- Variante sans-256: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-rl-step960-kv-tags-thought-thoughts.iid-40M-sans-256.stride-1.suffix-conditional
- Modelo de thoughts: https://huggingface.co/JackHsieh/4B-gpnp-rl-step960.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Modelo rewarder: https://huggingface.co/JackHsieh/Qwen3-4B.gpnp-rl.consumer-4B-base-gpnp-kvtt-iid40M-sans256.lr7e-7-kl0.step-960
- Dataset principal: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/vit63y1w
