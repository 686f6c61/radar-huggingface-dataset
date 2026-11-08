# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-sam-author-copied-relearn-fft

## Resumen

Este repositorio contiene un checkpoint de un modelo de lenguaje de 7.241.732.096 parámetros (aproximadamente 7,2 mil millones) construido sobre la arquitectura Mistral y entrenado con la librería Axolotl (versión 0.18.0). El identificador del modelo revela que forma parte de un experimento de *machine unlearning* sobre el corpus de biología de WMDP (Weapons of Mass Destruction Proxy): el nombre indica un flujo de "unlearn-fft-gd-sam-author-copied" seguido de un "relearn-fft", es decir, una fase de desaprendizaje mediante fine-tuning completo y un posterior reentrenamiento parcial sobre el corpus de olvido.

El modelo se presenta como un artefacto de investigación más que como un modelo listo para producción. La model card generada automáticamente por el Trainer de Hugging Face no aporta descripción, usos previstos ni datos de evaluación, y el autor no ha publicado benchmarks. El entrenamiento se realizó sobre el dataset `cais/wmdp-bio-forget-corpus`, con una longitud de secuencia de 512 tokens, 16 pasos de entrenamiento y un learning rate de 1e-5.

Su relevancia es acotada y experimental: sirve como pieza en estudios sobre robustez del desaprendizaje (tamper resistance), tal como sugiere el proyecto de W&B `lp-tamper-resistance`. No debe confundirse con un modelo generalista: es un checkpoint intermedio de una cadena de experimentos sobre un modelo base Mistral de 7B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (MistralDecoderLayer) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de la familia Mistral, tal como confirma el campo `transformer_layer_cls_to_wrap: MistralDecoderLayer` de la configuración de FSDP. El entrenamiento se ejecutó con Axolotl 0.18.0 sobre 4 GPUs (FSDP v2 con `activation_checkpointing` y `reshard_after_forward`), en precisión bf16, con optimizador AdamW (`betas=(0.9,0.999)`, `epsilon=1e-08`), scheduler lineal sin warmup y `max_grad_norm` de 1.0. El batch total efectivo fue de 4 (micro-batch 1 por dispositivo), con 16 pasos de entrenamiento y checkpoints cada 4 pasos.

El dataset de entrenamiento es `cais/wmdp-bio-forget-corpus`, procesado con el tipo `data.wmdp_zephyr`. No se aplicó `sample_packing` ni `pad_to_sequence_len`, y se entrenó sobre las entradas (`train_on_inputs: true`). No hay información sobre volumen total de tokens, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El nombre del checkpoint sugiere una secuencia de fases (desaprendizaje con gradient descent y SAM, copia del autor, y reentrenamiento), pero la model card no documenta esos pasos ni sus hiperparámetros más allá del último tramo.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es `text-generation` y el tag `conversational` está presente, con formato de datos tipo Zephyr.
- No hay evidencia documentada de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües; los idiomas figuran como "no disponibles".
- No hay indicios de modo thinking, visión, audio ni otras capacidades especiales.
- Al ser un checkpoint derivado de Mistral 7B, hereda potencialmente las capacidades del modelo base, pero el autor no las documenta ni las evalúa.

## Casos de uso

- Investigación en machine unlearning: el checkpoint sirve como referencia para medir si la información del corpus WMDP-bio permanece "olvidada" tras el reentrenamiento, comparándolo con los checkpoints previos de la cadena (`unlearn-fft-gd-sam-author-copied`).
- Evaluación de robustez frente a tampering: el proyecto W&B `lp-tamper-resistance` sugiere que el modelo se usa para cuantificar cuánto conocimiento se recupera al reentrenar un modelo previamente desaprendido.
- Reproducibilidad de experimentos: al incluir la configuración completa de Axolotl, permite replicar el pipeline de fine-tuning con FSDP en 4 GPUs.
- Estudio de dinámica de fine-tuning corto: con solo 16 pasos y LR 1e-5, es útil para analizar cómo cambios mínimos en los pesos afectan a la retención de conocimiento.
- Base para ablaciones controladas: comparar este checkpoint con las variantes `-cb`, `-me-tar-k16` y otras del mismo autor para aislar el efecto de cada fase.
- Docencia y formación: ejemplo práctico de pipeline de desaprendizaje con Axolotl y de configuración FSDP multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara una entrada con `results: []`, es decir, sin métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, o RTX 4090 (24 GB) para bf16; GPUs consumer de 8-12 GB solo con cuantización agresiva.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización (no se distribuyen pesos GGUF en el repo).
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no incluida).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (mremila/archive-20261103-...) | 7,24B | no disponible (entreno a 512) | no disponible | Hugging Face, safetensors |
| Mistral 7B (base) | 7,24B | 8.192 tokens (según modelo base estándar) | Apache 2.0 (modelo base estándar) | Hugging Face |
| mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16 | no disponible | no disponible | no disponible | Hugging Face |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos; la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al derivar de Mistral 7B puede heredar los sesgos del modelo base y del corpus de entrenamiento.
- Riesgo de alucinación no evaluado; no hay benchmarks ni evaluaciones de fidelidad.
- El contexto de entrenamiento fue de 512 tokens, muy inferior al contexto nativo de Mistral 7B; el comportamiento en contextos largos no está validado.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Licencia no disponible: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de uso en producción ni de validación externa.
- El nombre del checkpoint sugiere que es parte de una cadena de experimentos de desaprendizaje; su comportamiento puede diferir sustancialmente del modelo base Mistral 7B.
- El repositorio ocupa 29 GB, lo que sugiere que puede contener múltiples checkpoints o pesos en varios formatos; conviene revisar los archivos antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-sam-author-copied-relearn-fft
- Checkpoint relacionado (variante `-cb`): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb
- Checkpoint relacionado (`me-tar-k16`): https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Dataset utilizado: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
