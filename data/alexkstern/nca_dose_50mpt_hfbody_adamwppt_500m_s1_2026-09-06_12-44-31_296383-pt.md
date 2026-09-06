# alexkstern/nca_dose_50Mpt_hfbody_adamwppt_500M_s1_2026-09-06_12-44-31_296383-pt

## Resumen

El modelo `nca_dose_50Mpt_hfbody_adamwppt_500M_s1_2026-09-06_12-44-31_296383-pt` es un checkpoint de preentrenamiento de un transformer decoder-only (GPT) entrenado con la biblioteca nanochat de Karpathy. Lo publica el usuario `alexkstern` en HuggingFace bajo licencia Apache-2.0. El checkpoint corresponde al paso 762 de un run registrado en Weights & Biases.

La configuración describe un modelo con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding de 1024 y ventana de contexto de 2048 tokens. El entrenamiento se divide en dos fases: una primera con FineWeb (50 millones de tokens) y una segunda con el dataset `nca-paper-share200-2048` (500 millones de tokens), con cambio de vocabulario de 65536 a 10004 tokens y re-inicialización de embeddings en la transición.

No se trata de un modelo listo para uso directo en producción: es un artefacto de investigación para estudiar dinámicas de entrenamiento, transiciones de vocabulario y reproducción de experimentos con nanochat. No se han publicado benchmarks de capacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) implementado con nanochat |
| Parametros totales | No disponible (config: 16 capas, n_embd=1024, vocab_size=10004 en la fase ppt) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo pesos .pt) |
| Idiomas soportados | No disponible (entrenado sobre FineWeb, predominantemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch .pt (state_dict) |

## Arquitectura y entrenamiento

El modelo es un GPT decoder-only con configuración de 16 capas, 8 cabezas de atención, 8 cabezas KV y dimensión de embedding de 1024. La ventana de contexto es de 2048 tokens. El checkpoint se generó con la biblioteca nanochat y el repositorio contiene los pesos, metadatos de entrenamiento, snapshot de configuración y estado del generador de números aleatorios.

El entrenamiento está documentado como un proceso de dos etapas. La primera etapa usa `fineweb-nanochatbpe-100M` como dataset y un vocabulario de 65536 tokens. La segunda etapa usa `nca-paper-share200-2048` como dataset y un vocabulario de 10004 tokens, con re-inicialización de embeddings en la transición y reinicio del optimizador. No se menciona RLHF, DPO ni ninguna técnica de alineación posterior. El scheduler de aprendizaje es trapezoidal, con warmup cero en la primera fase y warmdown del 40%. La métrica reportada en el checkpoint es una loss suavizada de entrenamiento de 4.21, con 1.04e17 flops usados y un tiempo total de entrenamiento de 648 segundos.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de lenguaje preentrenado.
- No soporta tool calling ni function calling, al no haber sido entrenado para ello.
- No soporta razonamiento multi-paso, agentes, visión ni audio.
- No se ha verificado el soporte multilingüe; el dataset principal es FineWeb, que es mayoritariamente inglés.
- La fase de entrenamiento adicional sobre `nca-paper-share200-2048` sugiere una adaptación a un dataset especializado, pero no se documenta el contenido ni el propósito de ese dataset.
- No hay evidencia de capacidades de razonamiento matemático o generación de código en la información disponible.

## Casos de uso

- Investigación en dinámicas de entrenamiento: el checkpoint a paso 762 permite analizar la evolución de la pérdida, el efecto del scheduler trapezoidal y el comportamiento del optimizador AdamW con tasas de aprendizaje diferenciadas para matrices, embeddings y unembeddings.
- Ablación de re-inicialización de embeddings: sirve para comparar modelos entrenados con `reinit_embed_at_transition=true` frente a modelos sin esa re-inicialización, midiendo el impacto en la convergencia y en la calidad final.
- Fine-tuning posterior para tareas de generación de texto en inglés: al ser un checkpoint de preentrenamiento, se puede usar como base para entrenar un modelo instruct mediante fine-tuning supervisado o preferencia.
- Evaluación de tokenizadores: permite comparar el rendimiento de un vocabulario de 65536 tokens frente a uno de 10004 tokens sobre el mismo corpus, útil para estudios de eficiencia y calidad de tokenización.
- Reproducción de experimentos con nanochat: el repositorio incluye la configuración exacta y el enlace al run de Weights & Biases, lo que facilita replicar el experimento y validar resultados.
- Educación en entrenamiento de LLMs: es un ejemplo práctico de pipeline de preentrenamiento con FineWeb y transferencia a un dataset especializado, con código abierto y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones de capacidad. La única métrica reportada es la pérdida de entrenamiento del propio checkpoint:

| Metrica | Valor |
|---|---|
| Smooth train loss | 4.212884902954102 |
| Flops usados | 1.0389065468529869e+17 |
| Flops por token | 2080374784.0 |
| Tiempo total de entrenamiento | 648.4457182884216 s |

Estos valores son métricas de entrenamiento, no indicadores de calidad de generación ni de razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de la configuración (16 capas, n_embd=1024), el modelo es pequeño. En FP32 ocuparía aproximadamente 1 GB, en FP16/BF16 alrededor de 0.5 GB y en cuantización de 8 bits unos 0.25 GB.
- GPU recomendada: cualquier GPU con 2 GB o más es suficiente. No se requieren A100 ni H100. También es viable ejecutarlo en CPU para pruebas simples.
- Los pesos están en formato `.pt` de PyTorch, no en safetensors ni GGUF. Para usar con vLLM, TGI, llama.cpp u Ollama es necesario convertir el checkpoint previamente.
- El repositorio pesa 2.9 GB, pero ese tamaño incluye el estado del optimizador, metadatos y configuraciones, no solo los pesos del modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| `nca_dose_50Mpt_hfbody_adamwppt_500M_s1` (este modelo) | No disponible | 2048 | Apache-2.0 | .pt | Checkpoint paso 762 |
| `nca_dose_50Mpt_hfbody_500M_s0_2026-08-14_18-10-45_510563-pt` | No disponible | No disponible | No disponible | .pt | Checkpoint similar |
| `nca_dose_50Mpt_hfbody_1B_s1_2026-08-14_18-55-44_726679-pt` | No disponible | No disponible | No disponible | .pt | Checkpoint similar |

Los dos últimos son checkpoints hermanos encontrados en HuggingFace, pero no se dispone de información pública suficiente para comparar arquitectura, rendimiento o estado de entrenamiento.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento sin alineación: no ha pasado por RLHF ni DPO, por lo que puede generar contenido sesgado, dañino o no deseado.
- La ventana de contexto es de 2048 tokens, lo que limita el uso con documentos largos o conversaciones extensas.
- El vocabulario final de la fase ppt es de 10004 tokens, un tamaño reducido que puede afectar al rendimiento en idiomas o dominios no representados en el dataset de entrenamiento.
- No se han publicado evaluaciones externas de calidad, por lo que se desconoce el rendimiento en tareas estándar.
- El dataset `nca-paper-share200-2048` no está documentado en la información disponible, lo que dificulta la trazabilidad del comportamiento del modelo.
- El modelo no soporta tool calling, agentes ni entrada multimodal.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está listo para producción sin un proceso posterior de fine-tuning y evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_adamwppt_500M_s1_2026-09-06_12-44-31_296383-pt
- Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/drvcyy51
- nanochat (GitHub): https://github.com/karpathy/nanochat
- Checkpoint hermano s0: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_500M_s0_2026-08-14_18-10-45_510563-pt
- Checkpoint hermano 1B s1: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_1B_s1_2026-08-14_18-55-44_726679-pt
