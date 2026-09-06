# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_200M_s0_2026-09-06_15-41-16_660956-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfbody_adamwppt_200M_s0` es un checkpoint de investigacion desarrollado por `alexkstern` utilizando la libreria `nanochat` de Karpathy. Se trata de un experimento centrado en el estudio del efecto de la cantidad de tokens en el preentrenamiento y el post-entrenamiento (denominado "token dose") sobre la capacidad de un modelo pequeño para aprender lenguajes formales como Dyck.

La arquitectura es un transformer decoder-only (tipo GPT) con 16 capas, 8 cabezas de atencion, dimension de embedding de 1024 y una ventana de contexto de 2048 tokens. El entrenamiento consta de dos fases: una primera fase de preentrenamiento con 100 millones de tokens procedentes de `fineweb-nanochatbpe-100M` y un vocabulario BPE de 65536 tokens; y una segunda fase de post-entrenamiento con 200 millones de tokens del dataset `dyck-k128-seq_len_2048-1B` y un vocabulario reducido a 256 tokens. El checkpoint corresponde al paso 1525 del entrenamiento.

Dado que no se han publicado evaluaciones de rendimiento ni documentacion detallada, el modelo debe considerarse un artefacto experimental y no una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con 16 capas, 8 cabezas de atencion, dimension de embedding 1024 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 implementada en `nanochat`, con 16 capas, 8 cabezas de atencion sin agrupacion KV (n_kv_head = n_head = 8), y dimension de embedding de 1024. El preentrenamiento utiliza un vocabulario BPE de 65536 tokens de `fineweb-nanochatbpe-100M`, con 100 millones de tokens. Posteriormente, se realiza un post-entrenamiento con un dataset Dyck (lenguaje de parentesis con k=128 y longitud de secuencia 2048) durante 200 millones de tokens y un vocabulario de 256 tokens.

La transicion entre fases implica reinicializacion de los embeddings (`reinit_embed_at_transition: true`), reinicio del optimizador y una tasa de aprendizaje diferente para la fase de post-entrenamiento. Se uso optimizador AdamW con `lr_trapezoid` (sin warmup y con warmdown), sin weight decay. El checkpoint en el paso 1525 reporta `smooth_train_loss` de 3.5677 y `min_objective` de 1.1341. El hardware empleado alcanzo un pico de 2250 TFLOPs, lo que sugiere una GPU H100 o similar.

## Capacidades

- Generacion de texto general: no documentada; no se han publicado evaluaciones de tareas estandar.
- Razonamiento formal: el entrenamiento especifico en Dyck sugiere capacidad para procesar secuencias balanceadas de parentesis, pero sin metricas publicadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

El caracter experimental del modelo limita sus aplicaciones a entornos de investigacion. Los siguientes escenarios son plausibles:

- Evaluacion de la adquisicion de estructuras formales: el modelo puede usarse para medir cuantos tokens de post-entrenamiento se requieren para aprender el lenguaje Dyck.
- Comparacion de arquitecturas pequenas: sirve como base para comparar la capacidad de modelos GPT pequenos en tareas de gramatica formal.
- Estudio de la reinitializacion de embeddings: el checkpoint permite analizar como el cambio de vocabulario afecta a la representacion interna aprendida durante el preentrenamiento.
- Analisis de la dinamica de la tasa de aprendizaje: el esquema `lr_trapezoid` con valores diferentes en cada fase facilita el estudio de estrategias de optimizacion.
- Benchmark de lenguajes formales: puede integrarse en suites de evaluacion para probar modelos de lenguaje en tareas de parentesis balanceados.
- Experimentos de curriculum learning: la transicion de un dataset generalista a uno formal ofrece un caso de estudio de curriculum por fases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye solo metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| smooth_train_loss (step 1525) | 3.5677 |
| min_objective | 1.1341 |
| flops_used | 2.079e17 |
| flops_per_token | 2080374784.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp16, asumiendo un modelo de ~200 millones de parametros, mas activaciones para contexto de 2048.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo RTX 3060 12GB o superior. Para entrenamiento se uso una GPU con 2250 TFLOPs, probablemente H100.
- Cabe en consumer GPU: si, con VRAM de 4 GB o superior.
- Opciones de despliegue: no disponible en formatos estandar (safetensors, GGUF). Requiere conversion manual desde el state_dict de PyTorch y cargarse a traves de la libreria `nanochat`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado benchmarks ni caracteristicas de rendimiento de modelos comparables. Los unicos modelos relacionados son otros checkpoints del mismo autor con configuraciones similares, pero no se dispone de datos para una comparacion util.

## Limitaciones y advertencias

- Sin resultados de benchmarks publicados, por lo que no se puede evaluar su rendimiento real ni compararlo con otros modelos.
- Entrenado con FineWeb, que contiene sesgos linguisticos y culturales documentados.
- El vocabulario final reducido a 256 tokens limita la generacion de texto natural y su aplicabilidad a tareas genericas.
- Al ser un experimento de investigacion, no se ha validado su robustez o seguridad en produccion.
- La licencia Apache 2.0 permite el uso comercial, pero no ofrece garantias de calidad ni soporte.
- El contexto de 2048 tokens puede resultar insuficiente para tareas de ventana larga.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_200M_s0_2026-09-06_15-41-16_660956-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/rymc81tf
- Repositorio nanochat: https://github.com/karpathy/nanochat
