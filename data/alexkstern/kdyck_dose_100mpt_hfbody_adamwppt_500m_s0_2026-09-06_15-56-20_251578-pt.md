# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_500M_s0_2026-09-06_15-56-20_251578-pt

## Resumen

`kdyck_dose_100Mpt_hfbody_adamwppt_500M_s0` es un checkpoint experimental de un modelo de lenguaje basado en la arquitectura `nanochat_gpt`, desarrollado por `alexkstern` utilizando la librería `nanochat` de Karpathy. El modelo se entrena en dos fases: una fase de pre-entrenamiento (`pt`) sobre el dataset `fineweb-nanochatbpe-100M` con 100 millones de tokens, y una fase de post-entrenamiento (`ppt`) sobre un dataset sintético de lenguajes Dyck (`dyck-k128-seq_len_2048-1B`) con 500 millones de tokens. El checkpoint guardado corresponde al paso 762 de 1000 iteraciones.

Arquitectónicamente, el modelo es un transformer estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El vocabulario cambia entre fases: 65 536 tokens para la fase `pt` y 256 tokens para la fase `ppt`. El proyecto parece orientado a investigar el efecto de la "dosis de tokens" y la transición entre dominios, aunque no se han publicado evaluaciones de capacidades ni benchmarks. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat_gpt) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar implementado con `nanochat`. La configuración define dos variantes del modelo con la misma profundidad y ancho (`n_layer: 16`, `n_head: 8`, `n_kv_head: 8`, `n_embd: 1024`), pero con vocabularios distintos: el modelo `pt` usa un vocabulario de 65 536 tokens y el modelo `ppt` uno de 256 tokens. La longitud de secuencia es 2048 en ambos casos.

El entrenamiento se divide en dos etapas. La primera (`pt`) utiliza el dataset `fineweb-nanochatbpe-100M` con 100 millones de tokens y una tasa de aprendizaje con forma trapezoidal (`lr_kind: trapezoid`, `lr_warmup_ratio: 0.0`, `lr_warmdown_ratio: 0.4`). La segunda (`ppt`) usa el dataset `dyck-k128-seq_len_2048-1B` con 500 millones de tokens, una tasa de aprendizaje propia (`ppt_lr: 0.0003`) y una programación trapezoidal con `lr_warmdown_ratio: 1.0`. La transición entre fases incluye `reinit_embed_at_transition: true` y `reset_optimizer_at_transition: true`.

El checkpoint guardado es el `model_000762.pt`, que corresponde al paso 762. Los datos de entrenamiento registran una pérdida suave de 3.7445, un valor `min_objective` de 1.1396, 2.08e17 FLOPs utilizados y un tiempo total de entrenamiento de 341 segundos. No se ha publicado información sobre el proceso de post-entrenamiento (RLHF, DPO, etc.) más allá de la fase `ppt`.

## Capacidades

No se han publicado evaluaciones de capacidades en la información disponible. El modelo no ha sido validado con tareas estándar de generación de texto, razonamiento, código, matemáticas o visión. No hay información sobre soporte de tool calling, agentes, multimodalidad ni modos especiales de razonamiento. Dado que la fase `ppt` se realizó sobre un dataset de lenguajes Dyck, el modelo podría ser útil como objeto de estudio para investigar la inducción de gramáticas formales, pero no se han reportado resultados que lo confirmen.

## Casos de uso

No se pueden determinar casos de uso realistas sin evaluaciones publicadas. Sin embargo, por su naturaleza experimental, podrían explorarse los siguientes ámbitos, siempre como hipótesis no validadas:

- Investigación sobre lenguajes formales: el modelo podría utilizarse para estudiar cómo los transformers aprenden estructuras de paréntesis balanceados (Dyck-k), dado que fue entrenado explícitamente en ese dominio.
- Experimentos de transferencia de dominio: la arquitectura con transición de vocabulario permite analizar el efecto de re-inicializar embeddings y optimizadores al cambiar de corpus.
- Reproducibilidad de experimentos: al estar publicado con configuración completa y semillas fijadas, podría servir como referencia para replicar estudios sobre "token dose" y dinámicas de entrenamiento.
- Docencia o demostraciones técnicas: como ejemplo de un pipeline de entrenamiento en dos fases con `nanochat`.
- Pruebas de cuantización y eficiencia: el modelo es pequeño (repo de 3.0 GB) y podría usarse para probar técnicas de compresión o despliegue en entornos con recursos limitados, aunque no hay datos de rendimiento.

En cualquier caso, no se recomienda su uso en producción sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas comparativas.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para inferencia. A partir del tamaño del repositorio (3.0 GB) y de la arquitectura, se puede estimar que el modelo es pequeño, pero no hay datos confirmados sobre VRAM necesaria.

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. El entrenamiento se realizó con una GPU cuyo pico de rendimiento era de 2250 TFLOPS (probablemente una H100), pero esto no implica requisitos de inferencia.
- Compatibilidad con GPU consumer: no confirmado.
- Opciones de despliegue: no disponibles. Al ser un checkpoint en formato `.pt`, requeriría conversión a formatos como GGUF o safetensors para usarse con llama.cpp o vLLM.

## Comparativa con modelos similares

No se han encontrado modelos comparables con información pública suficiente. En la búsqueda web aparece otro checkpoint del mismo autor (`alexkstern/kdyck_dose_100Mpt_200M_s0_2026-08-14_18-41-11_852802-pt`), pero no se dispone de su ficha técnica ni de benchmarks.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de seguridad, sesgos o alucinaciones.
- El modelo está entrenado principalmente sobre FineWeb, un corpus de inglés, pero no se especifica su cobertura multilingüe.
- La fase `ppt` sobre un lenguaje Dyck podría inducir comportamientos muy específicos y poco transferibles a tareas generales.
- No hay información sobre restricciones de uso comercial; la licencia Apache 2.0 lo permite, pero el modelo no ha sido validado.
- El checkpoint no tiene descargas ni likes en HuggingFace, lo que indica que no ha sido probado por la comunidad.
- Los resultados de entrenamiento (`smooth_train_loss`, `min_objective`) no constituyen métricas de calidad del modelo final.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_500M_s0_2026-09-06_15-56-20_251578-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/uiyi6ezk
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint similar del mismo autor: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s0_2026-08-14_18-41-11_852802-pt
