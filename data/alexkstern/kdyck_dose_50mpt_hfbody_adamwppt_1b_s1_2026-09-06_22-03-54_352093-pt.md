# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_1B_s1_2026-09-06_22-03-54_352093-pt

## Resumen

Este modelo es un checkpoint de un experimento de investigación desarrollado por alexkstern con la librería nanochat de Karpathy. Su propósito no es servir como modelo de producción, sino estudiar el efecto de la "dosis" de tokens en el proceso de entrenamiento, combinando un pre-entrenamiento corto con un post-entrenamiento extenso sobre un corpus sintético. El checkpoint corresponde al paso 762 de un entrenamiento que alterna un modelo de lenguaje estándar (nanochat GPT) con un modelo de post-entrenamiento sobre el lenguaje Dyck, un dataset de paréntesis balanceados que se usa para evaluar la capacidad de los transformers de aprender estructuras jerárquicas.

La arquitectura es un transformer de 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una ventana de contexto de 2048 tokens. El vocabulario principal es de 65536 tokens, mientras que el vocabulario del modelo de post-entrenamiento es de 256 tokens. El checkpoint pesa 2.9 GB y está disponible bajo licencia Apache 2.0. No se han publicado evaluaciones de rendimiento ni documentación de capacidades, por lo que debe considerarse un artefacto de investigación más que un modelo utilizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat GPT) |
| Parametros totales | no disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de un transformer decoder-only, configurada con los siguientes valores: `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`, `sequence_len=2048` y `vocab_size=65536` para el modelo principal. El proceso de entrenamiento es peculiar: primero se entrena un modelo de lenguaje sobre un subconjunto de FineWeb de 50 millones de tokens (`fineweb-nanochatbpe-100M`), y después se realiza un post-entrenamiento sobre un dataset sintético de Dyck de 1000 millones de tokens (`dyck-k128-seq_len_2048-1B`). En la transición entre ambas fases, se reinicializan los embeddings y se resetea el optimizador.

El entrenamiento utiliza el optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembedding, y un scheduler trapezoidal con `lr_warmup_ratio=0.0` y `lr_warmdown_ratio=0.4`. La semilla es 1 y el modelo se compiló durante el entrenamiento. No se ha aplicado RLHF, DPO ni ninguna técnica de alineación posterior.

## Capacidades

- Generación de texto básica basada en el corpus de pre-entrenamiento (FineWeb), aunque no se han documentado sus capacidades reales.
- Entrenamiento específico sobre el lenguaje Dyck, lo que permite estudiar el aprendizaje de estructuras de paréntesis anidadas.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidades multilingües no documentadas; el corpus principal es principalmente inglés.
- No se ha verificado ningún modo especial de razonamiento ni comportamiento emergente.

## Casos de uso

- Investigación en gramáticas libres de contexto: el modelo está entrenado en Dyck, por lo que es útil para analizar cómo los transformers representan estructuras jerárquicas y anidamiento.
- Ablación de dosis de tokens: al existir variantes del mismo experimento con diferentes cantidades de tokens, este checkpoint permite comparar el efecto del volumen de post-entrenamiento.
- Reproducibilidad de experimentos: la configuración, la semilla y los metadatos están documentados, lo que facilita replicar los resultados con nanochat.
- Docencia en aprendizaje profundo: sirve como ejemplo práctico de un modelo pequeño entrenado con una librería minimalista, con una configuración legible y accesible.
- Benchmarking de optimizadores y schedulers: el uso de AdamW con tasas separadas y scheduler trapezoidal permite estudiar su impacto en modelos de tamaño reducido.
- Pruebas de transferencia de conocimiento: permite investigar cómo el pre-entrenamiento en texto natural y el post-entrenamiento en un lenguaje sintético afectan a tareas sintácticas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El checkpoint se distribuye como un archivo `.pt` de PyTorch, por lo que su carga requiere un entorno Python con PyTorch. No se ha probado su integración con vLLM, llama.cpp, Ollama o TGI.
- El tamaño del repositorio (2.9 GB) sugiere que el modelo podría ejecutarse en GPUs de consumo, pero no está verificado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Se han identificado dos modelos hermanos del mismo autor y proyecto, aunque no se dispone de especificaciones detalladas más allá de sus nombres:

| Modelo | Contexto | Parametros | Notas |
|---|---|---|---|
| alexkstern/kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt | no disponible | no disponible | Variante del mismo experimento con diferente configuración |
| alexkstern/kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14_15-32-20_705847-pt | no disponible | no disponible | Variante con semilla 2 y distinta dosis de tokens |

No se han encontrado modelos comparables de la misma categoría con datos de rendimiento publicados.

## Limitaciones y advertencias

- Modelo de investigación sin evaluaciones publicadas; no debe utilizarse en entornos de producción.
- Corpus de entrenamiento muy limitado (50M tokens de FineWeb y 1B de Dyck), lo que restringe su conocimiento general y su utilidad práctica.
- Ventana de contexto de 2048 tokens, insuficiente para tareas de contexto largo.
- Sin soporte de tool calling, agentes, multimodalidad ni razonamiento avanzado.
- Posibles sesgos del corpus FineWeb no documentados.
- Riesgo de alucinación elevado al tratarse de un modelo pequeño y sin alineación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está preparado para ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_1B_s1_2026-09-06_22-03-54_352093-pt
- Proyecto nanochat: https://github.com/karpathy/nanochat
- Registro W&B del entrenamiento: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/hi2g2oyd
- Modelo hermano 1: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_500M_s0_2026-08-14_16-05-06_333015-pt
- Modelo hermano 2: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14_15-32-20_705847-pt
