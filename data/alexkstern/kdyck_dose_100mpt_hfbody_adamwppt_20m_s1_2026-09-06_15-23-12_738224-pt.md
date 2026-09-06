# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_20M_s1_2026-09-06_15-23-12_738224-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfbody_adamwppt_20M_s1_2026-09-06_15-23-12_738224-pt` es un checkpoint experimental de investigación creado por `alexkstern` con la librería `nanochat`. Forma parte de una serie de experimentos sobre "token dose" (dosis de tokens) que estudia cómo la cantidad de tokens de pre-entrenamiento y post-entrenamiento afecta al aprendizaje de estructuras sintácticas. El modelo es un transformer decoder-only pequeño, con 16 capas, 8 cabezas de atención y 1024 dimensiones de embedding, entrenado primero con 100 millones de tokens del dataset `FineWeb-nanochatbpe` y después con 20 millones de tokens del dataset sintético `dyck-k128` (lenguaje de paréntesis de tipo Dyck con k=128). La longitud de contexto es de 2048 tokens. El checkpoint se publica con licencia Apache 2.0 y está pensado para reproducir y analizar el efecto del post-entrenamiento en modelos pequeños, no para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat_gpt) |
| Parametros totales | No disponible (la config no especifica el total; el modelo es pequeño, con 16 capas y n_embd=1024) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

Nota: la configuración define dos variantes: `model_pt` con vocab_size 65536 y `model_ppt` con vocab_size 256. El checkpoint final parece corresponder a la variante post-entrenamiento (vocab 256), según `reinit_embed_at_transition=true` y `ppt_same_vocab_as_pt=false`.

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer estándar implementada en `nanochat`. Según la configuración, tiene `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024` y `sequence_len=2048`. El pre-entrenamiento utiliza un vocabulario de 65536 tokens (`pt_fineweb-nanochatbpe-100M`) con 100 millones de tokens de FineWeb. Posteriormente, se realiza un post-entrenamiento con 20 millones de tokens del dataset sintético `dyck-k128` (vocabulario reducido a 256 tokens). En la transición se reinicializan los embeddings y se resetea el optimizador (`reinit_embed_at_transition=true`, `reset_optimizer_at_transition=true`). El entrenamiento usa AdamW con tasas de aprendizaje diferenciadas: `matrix_lr=0.02`, `embedding_lr=0.3`, `unembedding_lr=0.004`, y una tasa de post-entrenamiento de `0.0003`. El programa de LR es trapezoidal, sin warmup y con warmdown del 40% en pre y del 80% en post. No se ha aplicado RLHF ni DPO. El checkpoint corresponde al paso 1525, con una pérdida suave de entrenamiento de 3.57 y un coste total de 2.079e17 FLOPs (2.08 GFLOPs por token). El tiempo total de entrenamiento fue de 114.9 segundos.

## Capacidades

- Generación de texto limitada al dominio de post-entrenamiento (Dyck-k) y posiblemente a fragmentos de lenguaje natural de FineWeb, aunque no hay evaluaciones que lo confirmen.
- No dispone de soporte de tool calling ni function calling.
- No dispone de soporte para agentes ni razonamiento multi-paso verificado.
- Capacidades multilingües: no disponibles (el dataset de pre-entrenamiento es FineWeb, que incluye múltiples idiomas, pero no se ha evaluado).
- No dispone de capacidades de visión, audio o modo de pensamiento.
- El interés principal es experimental: permite estudiar la transferencia de aprendizaje y el efecto de la dosis de tokens en un modelo pequeño.

## Casos de uso

- Investigación sobre transferencia de aprendizaje: comparar este checkpoint con el mismo modelo sin post-entrenamiento para medir la mejora en tareas Dyck-k.
- Estudio del efecto de la dosis de tokens (token dose): analizar cómo cambia el rendimiento al variar los 20M de tokens de post-entrenamiento frente a otros runs de la misma familia (por ejemplo, con 200M de tokens).
- Reproducción de experimentos: la configuración completa y los metadatos publicados permiten repetir el entrenamiento con `nanochat` en hardware de gama alta (el pico de rendimiento registrado es de 2250 TFLOPs).
- Análisis de la reinicialización de embeddings: examinar cómo cambia la representación interna cuando se sustituye el vocabulario de 65536 tokens por uno de 256 tokens en la fase de post-entrenamiento.
- Evaluación de memoria y composicionalidad: el dataset Dyck-k128 con secuencias de 2048 tokens sirve para probar la capacidad del modelo de mantener estructuras de paréntesis anidadas.
- Benchmark de optimizadores: comparar este run (AdamW con lrs diferenciados) con otros experimentos que utilicen distintos optimizadores o programas de LR.
- Pruebas de escalado: al tratarse de un modelo pequeño (16 capas, 1024 dimensiones), puede usarse como referencia para extrapolar el comportamiento de modelos de mayor tamaño.
- Uso educativo: ejemplo práctico de entrenamiento de un transformer desde cero con `nanochat`, con configuraciones y métricas detalladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tabla de la model card solo incluye métricas de entrenamiento del checkpoint:

| Metrica | Valor |
|---|---|
| step | 1525 |
| smooth_train_loss | 3.5725 |
| min_objective | 1.13295 |
| flops_used | 2.079e17 |
| flops_per_token | 2.080e9 |
| total_training_time | 114.9 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint es pequeño (16 capas, 1024 dimensiones) y el repo pesa 3.0 GB, pero no se ha verificado el consumo real en inferencia.
- GPU recomendadas: no especificado. Cualquier GPU de consumo con al menos 2 GB de VRAM debería poder cargarlo en principio, pero no hay datos de referencia.
- Si cabe en consumer GPU: probablemente sí, aunque no se ha verificado.
- Opciones de despliegue: no disponibles. Al ser un checkpoint `.pt` de `nanochat`, se puede cargar directamente con PyTorch. No hay indicaciones sobre vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se han encontrado dos checkpoints de la misma familia, publicados por el mismo autor y con arquitectura similar:

| Modelo | Pre-tokens | Post-tokens | Fecha | Licencia | Rendimiento |
|---|---|---|---|---|---|
| kdyck_dose_100Mpt_hfbody_adamwppt_20M_s1 (este) | 100M | 20M | 2026-09-06 | Apache 2.0 | No disponible |
| kdyck_dose_100Mpt_200M_s1_2026-08-14 | 100M | 200M | 2026-08-14 | Apache 2.0 | No disponible |
| kdyck_dose_100Mpt_hfbody_200M_s1_2026-08-14 | 100M | 200M | 2026-08-14 | Apache 2.0 | No disponible |

Los tres comparten la misma filosofía experimental (dosis de tokens con Dyck), pero no se dispone de datos de benchmarks para comparar su rendimiento.

## Limitaciones y advertencias

- Modelo experimental de investigación, no apto para uso en producción.
- No se han realizado evaluaciones de sesgos ni de riesgos de alucinación.
- El vocabulario final (256 tokens) es muy reducido y limita severamente la generación de texto natural.
- La longitud de contexto de 2048 tokens es corta en comparación con modelos actuales.
- Los idiomas soportados no están especificados; el dataset FineWeb es multilingüe pero no hay pruebas de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte.
- El checkpoint no incluye configuración para ejecutarse con frameworks de inferencia estándar (vLLM, llama.cpp, etc.) sin adaptación previa.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_20M_s1_2026-09-06_15-23-12_738224-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/kejrcsna
- Repo nanochat: https://github.com/karpathy/nanochat
- Modelo relacionado: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s1_2026-08-14_18-49-36_987037-pt
- Modelo relacionado: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_200M_s1_2026-08-14_21-48-49_486094-pt
