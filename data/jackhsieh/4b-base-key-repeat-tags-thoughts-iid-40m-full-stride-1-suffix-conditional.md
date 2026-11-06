# JackHsieh/4B-base.key-repeat-tags-thoughts.iid-40M-full.stride-1.suffix-conditional

## Resumen

El modelo `4B-base.key-repeat-tags-thoughts.iid-40M-full.stride-1.suffix-conditional` es un checkpoint de investigación publicado por el usuario JackHsieh en Hugging Face. Se trata de un continued-pretraining del modelo base Qwen3-4B-Base sobre un corpus de LaTeX de arXiv del área stat.ML, con una modificación experimental: se antepone a cada fragmento de documento un "pensamiento" de control (`<|note|>...<|/note|>`) que repite 32 veces los 8 tokens previos al corte. El autor lo describe explícitamente como el control negativo de una serie de experimentos sobre "thoughtful runs", es decir, un modelo diseñado para medir el efecto de un pensamiento que no aporta información adicional.

El modelo tiene 4.022.468.096 parámetros (aproximadamente 4B) y mantiene la arquitectura original de Qwen3-4B-Base. El entrenamiento se realizó sobre 9.728 documentos de 4.096 tokens cada uno, con 2 épocas y 676 pasos totales, usando FSDP2 con pesos maestros en fp32 y cómputo en bf16 sobre 8 GPUs H200. Los pesos exportados son la copia maestra en fp32, sin casting posterior.

Su relevancia es fundamentalmente metodológica: sirve como referencia para aislar el efecto de mecanismos de chain-of-thought en pretraining continuado, y no está pensado como modelo de producción. La licencia es Apache 2.0, pero el modelo no incluye una model card orientada a uso general ni datos de evaluación estándar (MMLU, HumanEval, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Base; el entrenamiento usa secuencias de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4B parámetros. Sobre esa base se aplicó continued-pretraining con una innovación concreta: cada fragmento de documento no inicial se acompaña de un "pensamiento" antepuesto con el formato `<|note|>{KEY × 32}<|/note|>`, donde `KEY` son los 8 tokens del documento anteriores al corte, repetidos 32 veces (258 tokens por pensamiento). Se añadieron dos tokens especiales al tokenizer: `<|note|>` (id 151669) y `<|/note|>` (id 151670), inicializados con distribución gaussiana diagonal.

El corpus de entrenamiento es `JackHsieh/statML-arxiv-iid-160M-20M`, concretamente `train[:9728]` (9.728 documentos × 4.096 tokens), con un 10% de replay desde `JackHsieh/dclm-replay.seq-4096.tokens-32B` y reordenación de documentos en cada época. La optimización usó AdamW con lr 3e-6 (β 0.9/0.95, ε 1e-8, weight decay 0.01), schedule coseno con 5% warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (676 pasos) y semilla 0. El sistema fue FSDP2 full-shard con pesos maestros fp32, cómputo bf16, flash-attention-2 y 8×H200. No se menciona RLHF ni DPO; es pretraining continuado puro.

## Capacidades

- Generación de texto autoregresiva heredada de Qwen3-4B-Base.
- Modelado de lenguaje sobre texto científico en LaTeX (stat.ML de arXiv).
- Manejo de tokens especiales `<|note|>` y `<|/note|>` para delimitar bloques de "pensamiento" de control.
- No se documentan capacidades de tool calling, function calling ni agentes.
- No se documentan capacidades multimodales (visión, audio) ni modo thinking explícito.
- Capacidades multilingües: no disponibles (el corpus de entrenamiento es mayoritariamente inglés técnico).
- No se documenta soporte de razonamiento multi-paso más allá del formato de pensamiento artificial del entrenamiento.

## Casos de uso

- Investigación en chain-of-thought durante pretraining: sirve como control negativo para comparar contra variantes "thoughtful" y medir si el pensamiento aporta información útil más allá de los 8 tokens previos al corte.
- Reproducibilidad de experimentos de continued-pretraining: el checkpoint final (paso 676) y la configuración exacta permiten replicar el pipeline con FSDP2 sobre 8×H200.
- Estudio de tokens especiales añadidos: útil para analizar cómo afecta la introducción de `<|note|>`/`<|/note|>` con inicialización gaussiana al comportamiento del modelo base.
- Baseline de modelado de lenguaje en dominios científicos: permite medir NLL/token sobre texto stat.ML en LaTeX con la rejilla de evaluación iid stride-32 (r_val = 15/512).
- Análisis de degradación por continued-pretraining: comparar el NLL del modelo frente a Qwen3-4B-Base original en el mismo corpus para cuantificar olvido catastrófico o especialización.
- Docencia y divulgación: ejemplo didáctico de cómo se diseña un control negativo en un experimento de pretraining con anotaciones estructuradas.

## Benchmarks y rendimiento

El autor reporta únicamente métricas de evaluación interna sobre la rejilla iid stride-32 (paso 676):

| Metrica | Valor |
|---|---|
| NLL/token en chunks con pensamiento (thoughtful) | 1,2230 |
| NLL/token en pass sin pensamiento sobre los mismos chunks | 1,2230 (1,22297 vs 1,22295; win rate 50,1%) |
| NLL/token híbrido en todos los chunks | 1,2439 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (el repo ocupa 16,1 GB).
- VRAM estimada en bf16: aproximadamente 8 GB para pesos; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: H100, H200 o A100 80 GB para entrenamiento o inferencia en fp32 sin cuantizar; RTX 4090 (24 GB) suficiente para inferencia en bf16 o cuantizada.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080) si se cuantiza a 8 o 4 bits, aunque no se han publicado pesos GGUF ni recetas oficiales.
- Opciones de despliegue: al ser un checkpoint de investigación sin pipeline declarado, no hay integración documentada con vLLM, TGI, llama.cpp u Ollama; sería necesario convertir los pesos fp32 a bf16/fp16 y generar los archivos de configuración de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (JackHsieh) | 4,02B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Control negativo de investigación |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base original |
| Qwen/Qwen3-4B | ~4B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Versión post-entrenada (instruct) |
| JackHsieh/4B-base.key-repeat-tags-thoughts.* (otras variantes) | ~4B | no disponible | Apache 2.0 | Hugging Face | Variantes "thoughtful" del mismo autor, no comparadas numéricamente aquí |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin model card orientada a uso general: no debe emplearse en producción sin evaluación adicional.
- El "pensamiento" antepuesto es un artefacto de control que repite 8 tokens 32 veces; no aporta información semántica nueva y puede confundir a usuarios que lo interpreten como razonamiento real.
- Riesgo de alucinación no evaluado; no hay datos de evaluación en tareas de QA, matemáticas o código.
- Idiomas soportados no documentados; el corpus es fundamentalmente inglés técnico (LaTeX de arXiv), por lo que el rendimiento en castellano es incierto.
- Longitud de contexto efectiva no documentada más allá de las secuencias de 4.096 tokens usadas en entrenamiento.
- Pesos publicados en fp32 (16,1 GB), lo que dificulta el despliegue en hardware de consumo sin conversión previa.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) ni recetas de despliegue.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluación estándar hace desaconsejable su uso comercial sin validación propia.
- El checkpoint corresponde al paso 676 de un entrenamiento corto (2 épocas), por lo que el olvido catastrófico respecto a Qwen3-4B-Base no está cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/4B-base.key-repeat-tags-thoughts.iid-40M-full.stride-1.suffix-conditional
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/key-repeat.k-8.statml-arxiv-iid.qwen3-ids.tags
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/b9a3p5uy
