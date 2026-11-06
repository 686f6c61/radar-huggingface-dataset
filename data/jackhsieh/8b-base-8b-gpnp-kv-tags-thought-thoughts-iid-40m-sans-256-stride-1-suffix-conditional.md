# JackHsieh/8B-base.8B-gpnp-kv-tags-thought-thoughts.iid-40M-sans-256.stride-1.suffix-conditional

## Resumen

Este modelo es un ajuste por preentrenamiento continuado (continued pretraining) del modelo base Qwen3-8B-Base, desarrollado por el usuario JackHsieh. Se trata de un experimento de investigación centrado en la inserción de "pensamientos" (thoughts) prepuestos a cada fragmento de documento durante el entrenamiento, con el objetivo de estudiar si una nota generada sobre los siguientes tokens mejora la modelización del lenguaje. El modelo se entrena sobre texto LaTeX de arXiv de la categoría stat.ML, con una ventana iid de 40 millones de tokens menos los últimos 256 documentos, que quedan reservados para evaluación o RL.

La relevancia de este modelo es fundamentalmente investigadora: no es un modelo de propósito general listo para producción, sino un artefacto experimental que forma parte de la familia `prestar` de experimentos sobre chain-of-thought y preentrenamiento continuado. Su hermano menor es la variante de 4B. La nomenclatura del repositorio codifica con precisión las hiperparámetros del experimento: stride 1, k=8, condicionalidad de sufijo, y el uso de etiquetas KV para los pensamientos.

Arquitectónicamente hereda la estructura transformer de Qwen3-8B-Base, con 8.190.735.360 parámetros totales y pesos exportados en fp32 sin casting. La licencia es Apache 2.0, lo que permite uso comercial, aunque las capacidades del modelo están fuertemente especializadas en el dominio stat.ML y en la tarea concreta de predecir tokens con notas prepuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B-Base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos exportados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (entrenado sobre LaTeX de arXiv stat.ML, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (copia maestra fp32, exportada sin casting) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base y aplica un preentrenamiento continuado sobre el dataset `JackHsieh/statML-arxiv-iid-160M-20M`, usando `train[:9472]` (9.472 documentos × 4.096 tokens), con un 25% de replay desde `JackHsieh/dclm-replay.seq-4096.tokens-32B` y reordenación del orden principal en cada época. La innovación central es la prepocisión de un "pensamiento" a cada chunk de documento: cada fragmento de 8 tokens (stride 1, k=8) recibe una nota sobre los siguientes 8 tokens, generada por el propio Qwen3-8B en modo thinking off con el prompt `general-paragraph-nothink-prefill` y prefill de respuesta "The text", limitada a 768 tokens (con notas recortadas conservadas). La nota se envuelve como `<|note|>\nKEY:{los 8 tokens previos}\nTHOUGHT:{nota}\n<|/note|>` y se antepone al documento; se usa uno de los dos pensamientos por chunk por época, con `max_thought_length` de 832.

La optimización emplea AdamW con lr 3e-6 (β 0.9/0.95, ε 1e-8, weight decay 0.01), schedule coseno con 5% de warmup hasta 0, grad clip 1.0, batch de 32 documentos, 2 épocas (790 pasos) y semilla 0. El sistema usa FSDP2 full-shard con pesos maestros fp32, cómputo bf16, flash-attention-2 y 8×H200. Se añaden dos tokens especiales: `<|note|>` = 151669 y `<|/note|>` = 151670, con inicialización gaussiana diagonal, incluidos en el tokenizer del repositorio en ese orden.

## Capacidades

- Generación de texto y modelización del lenguaje sobre texto científico LaTeX del dominio stat.ML.
- Razonamiento con "pensamientos" prepuestos: el modelo está entrenado para operar con notas `<|note|>...<|/note|>` que describen los siguientes tokens.
- Condicionalidad de sufijo: cada chunk no primero de 8 tokens es "thoughtful" (stride 1, k=8), lo que permite evaluar la influencia de la nota en la predicción.
- Capacidad de evaluación held-out: los documentos `train[9472:9728]` quedan reservados, por ejemplo para RL contra este modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito más allá del mecanismo de notas.
- Capacidades multilingües no documentadas; el entrenamiento es sobre arXiv stat.ML, mayoritariamente en inglés.

## Casos de uso

- Investigación sobre chain-of-thought en preentrenamiento: el modelo sirve para estudiar si las notas prepuestas mejoran la NLL por token en comparación con un pase sin pensamiento, con una win rate medida del 50,9% en chunks thoughtful.
- Experimentos de RL contra el modelo: los 256 documentos held-out (`train[9472:9728]`) permiten entrenar y evaluar políticas de RL sin contaminación con el conjunto de entrenamiento.
- Modelización de lenguaje científico en stat.ML: útil para medir perplejidad y calidad de generación sobre LaTeX de arXiv en ese dominio concreto.
- Estudio de condicionalidad de sufijo: la configuración stride 1, k=8 permite analizar cómo una nota sobre los siguientes 8 tokens afecta a la predicción de cada chunk.
- Reproducción de experimentos: el repositorio incluye `checkpoint_meta.json` con el paso y nombre del run, y enlaces a wandb, lo que facilita la reproducibilidad del entrenamiento.
- Base para ablaciones: al ser el hermano de 8B del experimento de 4B, permite comparar escalado de parámetros en la misma configuración de pensamientos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NLL/token thoughtful (paso 790, test iid stride-32) | 1.1777 |
| NLL/token thoughtless propio (chunks thoughtful) | 1.1781 |
| Win rate thoughtful vs thoughtless | 50,9% |
| NLL híbrida all-chunk | 1.1994 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las métricas de NLL del experimento descritas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos están en fp32 (32,8 GB de repositorio), por lo que la inferencia en fp32 requiere aproximadamente 33 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: H200 (usadas en entrenamiento con 8×H200); para inferencia en fp32 se necesita al menos una GPU de 40-80 GB (A100 80GB, H100 80GB, H200).
- En consumer GPU: no cabe en fp32 en GPUs de 24 GB (RTX 4090); requeriría cuantización a bf16/fp16 (aproximadamente 16 GB) o inferior, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: no se documentan explícitamente; al ser safetensors compatible con Qwen3, podría cargarse con frameworks que soporten Qwen3 (vLLM, TGI, transformers), pero no está verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (8B-base...suffix-conditional) | 8,19B | No disponible | NLL 1.1777 (thoughtful) | Apache 2.0 | Hugging Face |
| JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-40M-sans-256.stride-1.suffix-conditional | 4B (aprox.) | No disponible | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base | 8B (aprox.) | No disponible | No disponible | Apache 2.0 | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos de 8B para modelización de lenguaje científico) no está disponible en la información proporcionada. El único comparable directo documentado es el hermano de 4B del mismo autor y el modelo base Qwen3-8B-Base.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación, no un modelo de propósito general; su entrenamiento está especializado en LaTeX de arXiv stat.ML y en la tarea de predicción con notas prepuestas.
- La win rate de 50,9% frente al pase sin pensamiento indica una mejora marginal; no debe interpretarse como una ventaja sustancial.
- No se documentan sesgos conocidos, pero al entrenarse sobre arXiv stat.ML puede heredar sesgos de ese corpus y de la distribución de autores.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base con preentrenamiento continuado, la generación libre no está alineada.
- Limitaciones de idioma: el entrenamiento es predominantemente en inglés (arXiv stat.ML); el soporte multilingüe no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8-Base tiene su propia licencia que debe verificarse; la model card no detalla condiciones adicionales.
- Caveat para producción: los pesos están en fp32 (32,8 GB), lo que complica el despliegue en hardware consumer; no se documentan cuantizaciones oficiales ni pipelines de inferencia verificados.
- El uso de tokens especiales `<|note|>` y `<|/note|>` requiere el tokenizer incluido en el repositorio; no usarlos correctamente puede degradar el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/JackHsieh/8B-base.8B-gpnp-kv-tags-thought-thoughts.iid-40M-sans-256.stride-1.suffix-conditional
- Dataset de pensamientos: https://huggingface.co/datasets/JackHsieh/8B-general-paragraph-nothink-prefill.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Run de wandb: https://wandb.ai/latent-thoughts/prestar/runs/y37qlcjw
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
