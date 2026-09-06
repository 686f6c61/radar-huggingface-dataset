# alexkstern/nca_dose_100Mpt_hfbody_adamwppt_1B_s1_2026-09-06_10-58-41_739567-pt

## Resumen

El modelo `nca_dose_100Mpt_hfbody_adamwppt_1B_s1_2026-09-06_10-58-41_739567-pt` es un checkpoint experimental de lenguaje entrenado con la librería `nanochat`, un proyecto de código abierto de Andrej Karpathy. Lo desarrolla el usuario `alexkstern` y se publica en HuggingFace bajo licencia Apache 2.0. Se trata de un experimento de investigación sobre la "dosis de tokens" (token dose): primero se entrena un modelo con 100 millones de tokens y después se continúa el entrenamiento con 1 000 millones de tokens, cambiando el vocabulario y re-inicializando el embedding en la transición.

La arquitectura es un transformer decoder-only (GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El checkpoint se encuentra en el paso 1 525 de entrenamiento y ocupa un repositorio de 3.0 GB. No se han publicado resultados de benchmarks ni evaluaciones de capacidades, por lo que su relevancia es principalmente como pieza de estudio en escalado de entrenamiento y alineación de vocabularios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con 16 capas, 8 cabezas de atención, 8 cabezas KV y dimensión de embedding de 1024 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en formato `.pt`) |
| Idiomas soportados | no disponible (el dataset FineWeb sugiere inglés, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GPT estándar configurada con `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024` y `sequence_len=2048`. El vocabulario del pre-training es de 65 536 tokens, mientras que en la fase de post-training se reduce a 10 004 tokens. El entrenamiento se divide en dos etapas: la primera (`data_pt`) utiliza el dataset `fineweb-nanochatbpe-100M` con 100 millones de tokens; la segunda (`data_ppt`) utiliza `nca-paper-share20-2048` con 1 000 millones de tokens. En la transición entre fases, se re-inicializa el embedding (`reinit_embed_at_transition=true`) y se resetea el optimizador (`reset_optimizer_at_transition=true`).

Se emplea un optimizador AdamW con tasas de aprendizaje diferenciadas: 0.02 para las matrices, 0.3 para los embeddings y 0.004 para los unembeddings, sin weight decay. El scheduler es trapezoidal tanto en pre-training como en post-training, con calentamiento del 10% y enfriamiento del 80% en la fase de post-training. No se indica que se haya aplicado RLHF, DPO ni ningún otro tipo de alineación por preferencias. El checkpoint reporta una pérdida de entrenamiento suavizada de 3.595 y un `min_objective` de 1.139, con un total de FLOPs usados de 2.079e+17.

## Capacidades

- Generación de texto autoregresivo básico.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado soporte de visión, audio ni multimodalidad.
- Multilingüe: no confirmado.
- No se ha documentado un modo de "pensamiento" (thinking mode).

## Casos de uso

- Investigación en escalado de entrenamiento: el checkpoint permite estudiar el efecto de la cantidad de tokens en modelos pequeños, comparando la fase de 100M tokens con la de 1B tokens.
- Experimentos de cambio de vocabulario: sirve para analizar el impacto de reducir el vocabulario de 65 536 a 10 004 tokens y la re-inicialización del embedding en el rendimiento final.
- Fine-tuning educativo: al ser un modelo pequeño con arquitectura GPT estándar, es adecuado para practicar fine-tuning en GPUs de gama media y aprender a gestionar checkpoints de PyTorch.
- Comparación de regímenes de optimización: permite probar schedulers trapezoidales, tasas de aprendizaje diferenciadas y estrategias de reset del optimizador.
- Generación de texto en prototipos: puede emplearse en entornos de baja exigencia para generar texto corto, aunque sin garantías de calidad ni de coherencia.
- Docencia sobre transformers: sirve como ejemplo práctico de un decoder-only con atención de múltiples cabezas y cabezas KV, incluyendo la gestión de vocabularios distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la pérdida de entrenamiento suavizada (3.595) y el `min_objective` (1.139) del checkpoint, sin comparación con otros modelos ni evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint completo ocupa 3.0 GB, pero no se especifica el tamaño de los pesos en formato de inferencia.
- GPU recomendadas: no disponible.
- Capacidad en GPU de consumo: no disponible. El tamaño del modelo sugiere que podría ejecutarse en GPUs de gama media, pero no hay datos confirmados.
- Opciones de despliegue: al ser un checkpoint de PyTorch (`.pt`), puede cargarse directamente con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación en la información proporcionada. Existen otros checkpoints de la misma serie experimental (por ejemplo, `nca_dose_100Mpt_hfbody_1B_s1_2026-08-15_00-55-24_338967-pt` y `nca_dose_100Mpt_hfbody_100M_s0_2026-08-14_23-49-16_264307-pt`), pero no se han publicado especificaciones detalladas ni resultados de benchmarks para realizar una comparación rigurosa.

## Limitaciones y advertencias

- Es un modelo experimental con 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- No se han publicado evaluaciones de sesgos ni de alucinaciones.
- El contexto de 2048 tokens es limitado para tareas de documento largo o razonamiento extenso.
- El idioma no está confirmado; si se entrenó con FineWeb, es probable que sea predominantemente inglés, pero no hay garantías.
- Al no haber alineación (RLHF/DPO) ni fine-tuning de instrucciones, el modelo puede generar contenido no deseado o incoherente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para producción sin pruebas exhaustivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_dose_100Mpt_hfbody_adamwppt_1B_s1_2026-09-06_10-58-41_739567-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro W&B: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/95gin9ho
