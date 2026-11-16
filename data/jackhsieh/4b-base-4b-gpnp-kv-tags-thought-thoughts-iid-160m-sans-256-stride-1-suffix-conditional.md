# JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-160M-sans-256.stride-1.suffix-conditional

## Resumen

Este modelo es un ajuste por preentrenamiento continuado (continued pretraining) del modelo base Qwen3-4B-Base, desarrollado por el usuario JackHsieh. Se trata de un experimento de investigación centrado en la técnica que el autor denomina "prestar" (prepended thought / pensamiento antepuesto), que consiste en insertar una nota generada por el propio modelo antes de cada fragmento de documento durante el entrenamiento. El objetivo es explorar si el modelo puede aprender a condicionar su generación sobre representaciones textuales previas (pensamientos) que resumen o anticipan el contenido siguiente.

El modelo parte de la arquitectura transformer de Qwen3-4B-Base, con 4.022.468.096 parámetros totales, y ha sido entrenado sobre un corpus de LaTeX de arXiv del área stat.ML. La particularidad técnica es que cada fragmento de 8 tokens del documento de entrenamiento va precedido por una nota estructurada con el formato `<|note|>\nKEY:{tokens previos}\nTHOUGHT:{nota}\n<|/note|>`, generada por una versión estándar de Qwen3-4B con el modo thinking desactivado.

Es relevante ahora porque explora una línea de investigación sobre chain-of-thought y representaciones latentes aplicadas al preentrenamiento, no solo al ajuste supervisado. El modelo se publica como un artefacto de investigación con pesos en fp32, sin casting, y con un conjunto de datos de validación reservado explícitamente para experimentos de RL. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, y su model card está orientada a un uso experimental muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa fragmentos de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos exportados en fp32) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (copia maestra fp32, sin casting) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3-4B-Base, con 4.022.468.096 parámetros. El entrenamiento continuado se realizó sobre el dataset `JackHsieh/statML-arxiv-iid-160M-20M`, usando `train[:38656]` (38.656 documentos de 4096 tokens cada uno) y dejando `train[38656:38912]` como conjunto reservado para evaluación o RL. Se aplicó un 10% de replay desde `JackHsieh/dclm-replay.seq-4096.tokens-32B`, con rebarajado del orden principal en cada época.

La innovación principal es la anteposición de pensamientos: cada fragmento de documento va precedido por una nota `<|note|>\nKEY:{los 8 tokens anteriores al fragmento}\nTHOUGHT:{nota}\n<|/note|>`, donde la nota la genera una versión estándar de Qwen3-4B con thinking desactivado y un prompt `general-paragraph-nothink-prefill` cuya respuesta se prellena con "The text". La nota describe los siguientes 8 tokens, con un límite de 512 tokens y las notas recortadas se conservan. Se usa `stride=1, k=8` para que cada fragmento de 8 tokens no inicial de cada documento sea "thoughtful". La optimización empleó AdamW con lr 1e-5 (β 0.9/0.95, ε 1e-8, weight decay 0.01), schedule cosine con 5% warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (2.686 pasos) y semilla 0. El sistema fue FSDP2 full-shard con pesos maestros fp32, cómputo bf16, flash-attention-2 y 8×H100. Se añadieron los tokens `<|note|>` (151669) y `<|/note|>` (151670) con inicialización gaussian-diag, incluidos en el tokenizer del repo en ese orden.

## Capacidades

- Generación de texto condicionada por notas antepuestas (pensamientos) en el contexto de entrada.
- Razonamiento sobre documentos científicos en LaTeX del área stat.ML, dado el corpus de entrenamiento.
- Capacidad de continuar preentrenamiento con formato de notas estructuradas (`<|note|>...<|/note|>`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; el formato de pensamiento antepuesto es un mecanismo de condicionamiento, no un agente.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidad especial: modo de pensamiento antepuesto (prepended thought) con claves de contexto (`KEY`) y notas (`THOUGHT`).

## Casos de uso

- Investigación en chain-of-thought aplicado al preentrenamiento: el modelo permite estudiar si las notas antepuestas mejoran la modelización del lenguaje en dominios científicos, comparando con Qwen3-4B-Base sin notas.
- Experimentos de RL sobre el conjunto reservado: el autor reserva `train[38656:38912]` explícitamente para RL contra este modelo, lo que permite entrenar políticas que exploten o evalúen el condicionamiento por notas.
- Generación de texto científico en LaTeX: dado el corpus stat.ML, puede emplearse para completar o generar fragmentos de documentos matemáticos, aunque sin garantías de calidad fuera del dominio.
- Estudio de representaciones latentes y tokens especiales: los tokens `<|note|>` y `<|/note|>` permiten analizar cómo el modelo aprende a usar marcadores estructurales en el preentrenamiento.
- Reproducción de experimentos de continued pretraining: la model card detalla hiperparámetros, sistema y semilla, lo que facilita replicar el pipeline con FSDP2 y 8×H100.
- Baseline para comparativas de preentrenamiento con pensamientos: sirve como referencia frente a variantes sin notas o con distintas ventanas (`iid-160M`, `sans-256`, `stride-1`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos están en fp32 (16,1 GB de repo), por lo que la inferencia en fp32 requiere aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache. En bf16/fp16 serían unos 8 GB de pesos, pero el repo no incluye versiones cuantizadas.
- GPU recomendadas: el entrenamiento se realizó con 8×H100; para inferencia, una A100 40 GB o H100 son adecuadas para fp32. Para bf16, una RTX 4090 (24 GB) podría alojar los pesos, aunque no se proporcionan versiones bf16 en el repo.
- ¿Cabe en consumer GPU? En fp32, no en GPUs de 16 GB; en bf16 teórico, sí en RTX 4090/3090 (24 GB), pero requeriría conversión manual.
- Opciones de despliegue: no se especifican en la información; al ser safetensors de Qwen3, podría usarse con vLLM o TGI tras conversión, pero no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (JackHsieh/4B-base...) | 4.022.468.096 | no disponible (entrenado con 4096) | apache-2.0 | Hugging Face, 0 descargas | Continued pretraining con pensamientos antepuestos |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en la información | apache-2.0 | Hugging Face (modelo base) | Modelo base sin modificar |
| Qwen3-4B (thinking off) | ~4B | no disponible en la información | apache-2.0 | Hugging Face | Usado para generar las notas del dataset |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Entrenado exclusivamente sobre LaTeX de arXiv stat.ML: el dominio es muy estrecho y el rendimiento fuera de él es incierto.
- Los pesos están en fp32 sin casting: el repo ocupa 16,1 GB y no incluye cuantizaciones, lo que dificulta el despliegue en hardware limitado.
- No se especifican idiomas soportados; se desconoce el comportamiento multilingüe.
- Riesgo de alucinación inherente a modelos de 4B y a un preentrenamiento continuado sobre un corpus especializado.
- El formato de notas `<|note|>...<|/note|>` es específico del entrenamiento; su uso fuera de ese formato puede degradar la generación.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Base también es apache-2.0, por lo que no hay restricciones adicionales conocidas; aun así, no hay garantías de calidad para producción.
- El conjunto de validación reservado (`train[38656:38912]`) sugiere que el modelo está pensado para experimentos de RL, no para uso final.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-160M-sans-256.stride-1.suffix-conditional
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/4B-general-paragraph-nothink-prefill.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/241vaokz
