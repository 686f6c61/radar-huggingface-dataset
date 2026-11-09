# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l40-relearn-fft-long

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l40-relearn-fft-long` es un ajuste fino completo (full fine-tuning, FFT) de una variante de Mistral de 7.241.732.096 parámetros, entrenado por el usuario de Hugging Face `mremila` mediante la librería Axolotl 0.18.0. Por la nomenclatura del identificador y la configuración de entrenamiento, se trata de un artefacto experimental dentro de una línea de trabajo sobre *machine unlearning* en el dominio de biología, construida a partir del corpus `cais/wmdp-bio-forget-corpus` (WMDP, *Weapons of Mass Destruction Proxy*). El nombre sugiere una secuencia de etapas: *unlearn* (desaprendizaje), *relearn* (reaprendizaje) y una ejecución en GPU L40.

El modelo no es un lanzamiento de propósito general ni un modelo de referencia: es un checkpoint de investigación archivado, con 0 descargas y 0 likes en el momento de la consulta, y una model card autogenerada por el Trainer que no documenta usos previstos, datos de evaluación ni limitaciones. El repositorio ocupa 29,0 GB en formato safetensors y la licencia no está declarada.

Su relevancia es, por tanto, metodológica más que de producto: sirve como evidencia reproducible de un experimento de desaprendizaje selectivo sobre un transformer de 7B, útil para quienes investigan la resistencia de las técnicas de *unlearning* frente a un posterior reajuste (*relearning*). No debe emplearse como modelo de producción sin una evaluación propia y sin aclarar la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (`MistralDecoderLayer` según la configuración de FSDP de Axolotl) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; `sequence_len` de entrenamiento = 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |
| Libreria | transformers 5.14.1 |
| Framework de entrenamiento | Axolotl 0.18.0 |
| Dataset de entrenamiento | `cais/wmdp-bio-forget-corpus` (split train, tipo `data.wmdp_zephyr`) |
| Precisión de entrenamiento | bf16 |
| Tamaño del repositorio | 29,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Mistral, tal como indica el `transformer_layer_cls_to_wrap: MistralDecoderLayer` de la configuración FSDP. No se dispone de información sobre el modelo base exacto (no se documenta si es Mistral-7B-v0.1, Zephyr-7B u otra variante), más allá de que el tokenizador se carga con `AutoTokenizer` y que el dataset se procesa con el tipo `data.wmdp_zephyr`, lo que apunta a un formato de conversación compatible con Zephyr.

El entrenamiento consistió en un full fine-tuning con 125 pasos, learning rate 1e-5 con scheduler lineal y sin warmup, optimizador AdamW (`adamw_torch`) con weight decay 0,0, `max_grad_norm` 1,0, `micro_batch_size` 1 y `gradient_accumulation_steps` 1, sobre 4 GPUs (batch total 4). Se usó FSDP v2 con activation checkpointing y `reshard_after_forward`, `sequence_len` de 512, `sample_packing: false` y `train_on_inputs: true`. No hay información sobre volumen de tokens, composición del dataset más allá del corpus WMDP-bio, ni sobre fases de RLHF o DPO. El identificador del modelo y el prefijo `base_model` indican que se parte de un checkpoint previo de la misma cadena experimental (`...unlearn-fft-gd-ao-refine-high--002`), por lo que este checkpoint representa una etapa de *relearning* sobre un modelo previamente desaprendido.

## Capacidades

- Generación de texto conversacional en formato de chat (pipeline `text-generation`, tag `conversational`).
- Compatible con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- Al ser un ajuste de una variante Mistral de 7B, se le presuponen las capacidades base de dicha familia (razonamiento, código, matemáticas e instrucciones), aunque **no están verificadas ni documentadas** en la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite reproducir y auditar el efecto de un reaprendizaje (*relearn*) sobre un modelo previamente desaprendido en el dominio de biología, comparando la retención de conocimiento con el checkpoint anterior de la cadena.
- Evaluación de resistencia al *tampering*: dado el nombre del proyecto W&B (`lp-tamper-resistance`), sirve para medir si un ajuste fino corto (125 pasos, lr 1e-5) recupera conocimiento que un *unlearning* previo había eliminado.
- Reproducción de experimentos con Axolotl: la configuración YAML completa está publicada en la model card, lo que facilita replicar el pipeline con FSDP v2 en 4 GPUs.
- Estudio de dinámica de ajuste fino: con solo 125 pasos y batch efectivo 4, es un caso útil para analizar cómo cambian los pesos y las activaciones con intervenciones mínimas.
- Base para comparativas de metodologías de desaprendizaje: puede confrontarse con variantes del mismo linaje (`unlearn`, `refine-high`, etc.) para aislar el efecto de cada etapa.
- Docencia y formación: ejemplo práctico de full fine-tuning con FSDP y activation checkpointing sobre un modelo de 7B en hardware de gama profesional (L40).

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-gd-ao-l40--relearn-fft-long`) con la lista de resultados **vacía**. La sección "Training results" del README también está vacía.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 16-24 GB según longitud de contexto y batch.
- En cuantización de 8 bits: ~7-8 GB de pesos; en 4 bits: ~4-5 GB de pesos (estimaciones teóricas; no se publican pesos cuantizados).
- GPU recomendadas: L40 (usada en el entrenamiento), A100 40/80 GB, H100; para inferencia en bf16, RTX 4090 (24 GB) es suficiente con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto corto, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (requiere convertir los pesos, ya que el repo solo trae safetensors).
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`), y previsiblemente vLLM, llama.cpp u Ollama tras conversión a GGUF (no se proporcionan artefactos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`mremila/...relearn-fft-long`) | 7,24B | no disponible (entrenado a 512) | no disponible | safetensors | repo público, 0 descargas |
| Mistral-7B-v0.1 (referencia de la familia) | 7,24B | 8.192 tokens (según versión) | Apache 2.0 | safetensors, GGUF | ampliamente disponible |
| Zephyr-7B-beta (formato de chat compatible con `data.wmdp_zephyr`) | ~7,24B | 32.768 tokens (según model card) | MIT | safetensors, GGUF | ampliamente disponible |

La comparación con Mistral-7B y Zephyr-7B es orientativa por familia y formato de datos; no se dispone de datos que confirmen el modelo base exacto ni de benchmarks que permitan comparar rendimiento.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no documenta usos previstos, limitaciones, sesgos ni evaluación.
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real.
- Contexto de entrenamiento de solo 512 tokens: aunque la arquitectura base pudiera soportar más, el ajuste se hizo con secuencias cortas, lo que puede degradar el comportamiento en contextos largos.
- Riesgo de alucinación: no evaluado; al ser un checkpoint experimental sin benchmarks, no hay evidencia de calidad.
- Naturaleza experimental: forma parte de una cadena de *unlearning/relearning* sobre el corpus WMDP-bio; su comportamiento puede estar deliberadamente alterado respecto al modelo base en el dominio de biología.
- Sin pesos cuantizados publicados: para desplegar en GPUs pequeñas hay que convertir los safetensors a GGUF/AWQ/GPTQ por cuenta propia.
- 0 descargas y 0 likes: sin validación por parte de la comunidad; no hay informes de terceros sobre su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l40-relearn-fft-long
- Dataset utilizado: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Paper WMDP (referencia del corpus): https://arxiv.org/abs/2403.03218
