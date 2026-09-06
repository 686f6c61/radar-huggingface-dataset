# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s1_2026-09-06_15-33-43_615065-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfbody_adamwppt_100M_s1` es un experimento de investigación sobre el aprendizaje de estructuras formales en modelos de lenguaje pequeños. Desarrollado por `alexkstern` con la librería `nanochat` (de Karpathy), se trata de un transformer decoder-only de aproximadamente 100 millones de parámetros, entrenado en dos fases: una fase de pre-training sobre `FineWeb` con 100 millones de tokens y una fase de post-training sobre un dataset sintético de Dyck (lenguaje de paréntesis balanceados) con 100 millones de tokens adicionales. El objetivo es estudiar cómo la "dosis" de tokens en cada fase afecta la capacidad del modelo para aprender reglas estructurales.

El checkpoint publicado corresponde al paso 762 de 1000 del entrenamiento, con una pérdida de entrenamiento suavizada de 3.758. La arquitectura usa 16 capas, 8 cabezas de atención y una longitud de contexto de 2048 tokens. El modelo está pensado como herramienta para investigar interpretabilidad, transferencia de conocimiento y el efecto de la cantidad de datos en tareas sintéticas, más que como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT, nanochat) |
| Parametros totales | 100M (segun nombre del modelo; no confirmado en la configuracion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV (GQA) y dimensiones de embedding de 1024. La fase de pre-training usa un vocabulario de 65536 tokens (tokenizer BPE de nanochat sobre FineWeb), mientras que la fase de post-training usa un vocabulario reducido de 256 tokens, específico para el dataset Dyck-k128. En la transición entre fases se reinicializan los embeddings y se resetea el optimizador.

El entrenamiento se realizó con AdamW, utilizando un programador de tasa de aprendizaje trapezoidal: en la fase de pre-training el warmup es 0 y el warmdown es del 40%, mientras que en la fase de post-training el warmdown es del 100%. Se entrenó durante 1000 iteraciones en total, con un presupuesto de 100 millones de tokens para cada fase. El checkpoint publicado es el paso 762, con un total de FLOPs consumidos de aproximadamente 2.08e17. El modelo se compiló durante el entrenamiento y se registró el experimento en Weights & Biases.

## Capacidades

- Generacion de texto en lenguaje natural, aunque limitada por el pequeno volumen de datos de pre-training (100M tokens de FineWeb).
- Aprendizaje de estructuras de parentesis balanceados (Dyck-k) tras la fase de post-training, con un vocabulario reducido de 256 tokens.
- Procesamiento de secuencias de hasta 2048 tokens de longitud.
- No incluye soporte para tool calling, agentes, vision, audio ni otras capacidades multimodales (no documentadas).
- Soporte multilingue: no disponible.

## Casos de uso

- Investigacion en interpretabilidad: permite analizar como un modelo pequeno representa internamente reglas de un lenguaje libre de contexto (Dyck) y comparar esas representaciones con las de modelos mas grandes.
- Evaluacion de la "dosis" de tokens: sirve como referencia para estudiar como la cantidad de tokens de pre-training y post-training influye en el aprendizaje de tareas sinteticas, gracias a la publicacion de la configuracion completa y la semilla.
- Benchmark de razonamiento estructural: puede usarse como modelo de referencia en experimentos sobre la capacidad de modelos pequenos para generalizar patrones de parentesis balanceados.
- Educacion en IA: es un ejemplo didactico de entrenamiento de un modelo GPT pequeno con nanochat, mostrando configuraciones, metricas y el proceso de transicion entre dominios.
- Desarrollo de tecnicas de transferencia: permite experimentar con la transferencia de conocimiento entre lenguaje natural y estructuras formales, variando la reinicializacion de embeddings o el reset del optimizador.
- Reproduccion de experimentos: al publicar config, metadatos, estado del RNG y checkpoint, es util para replicar resultados y validar hipotesis sobre el entrenamiento por dosis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas de entrenamiento (loss suavizada, FLOPs, tiempo de entrenamiento) y no reporta evaluaciones en conjuntos de datos estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM. Dado el tamano aproximado de 100M parametros, la inferencia en FP32 requiere en torno a 400 MB de VRAM, y en FP16/BF16 unos 200 MB.
- Cabe en cualquier GPU consumer moderna con mas de 1 GB de VRAM.
- No se han publicado recomendaciones de GPU especificas.
- Los pesos estan en formato PyTorch `.pt`, por lo que no son directamente compatibles con vLLM, llama.cpp u Ollama sin una conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kdyck_dose_100Mpt (este modelo) | ~100M | 2048 | Apache-2.0 | HuggingFace, checkpoint .pt |
| GPT-2 (124M) | 124M | 1024 | MIT | HuggingFace, pesos .pt/.safetensors |
| nanoGPT (Karpathy) | Variable (configurable) | Variable | MIT | Codigo abierto en GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no se han publicado benchmarks para el modelo de este experimento.

## Limitaciones y advertencias

- Modelo experimental, no apto para produccion ni para uso como asistente de lenguaje general.
- El pre-training se realizo con solo 100M tokens de FineWeb, una cantidad muy inferior a la usada en modelos de lenguaje convencionales, lo que limita su capacidad linguistica.
- Tras la fase de post-training, el vocabulario se reduce a 256 tokens, lo que hace que el modelo no sea util para procesar texto natural de forma generalizada.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad.
- El checkpoint es intermedio (paso 762 de 1000), no representa el estado final del entrenamiento.
- No incluye soporte para tool calling, agentes ni tareas multimodales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no tiene aplicaciones comerciales practicas en su estado actual.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s1_2026-09-06_15-33-43_615065-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/afz8ne9v
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelo similar de la misma serie: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_100M_s1_2026-08-14_18-28-04_487523-pt
- Modelo similar con 5M tokens: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_5M_s0_2026-08-14_17-52-53_380978-pt
