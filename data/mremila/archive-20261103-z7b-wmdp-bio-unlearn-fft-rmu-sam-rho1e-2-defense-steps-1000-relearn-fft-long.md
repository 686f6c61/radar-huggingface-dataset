# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-1000-relearn-fft-long

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-1000-relearn-fft-long` es un checkpoint de investigación derivado de la familia Mistral, con 7.241.732.096 parámetros (aproximadamente 7,24 mil millones) y pesos en formato safetensors. Lo publica el usuario `mremila` en Hugging Face y su nombre revela su propósito: se trata de un experimento de *machine unlearning* sobre el corpus biomédico `cais/wmdp-bio-forget-corpus`, seguido de una fase de *relearning* (reentrenamiento) para evaluar la resistencia a la manipulación de la defensa aplicada.

El modelo no es un modelo de propósito general ni está pensado para uso en producción. Es un artefacto de un pipeline de investigación sobre olvido selectivo (unlearning) de conocimiento peligroso en modelos de lenguaje, concretamente en el dominio de biología (WMDP-Bio). La nomenclatura indica que se aplicó RMU (Representation Misdirection for Unlearning) con una variante SAM (Sharpness-Aware Minimization) y un coeficiente rho de 1e-2, con 1000 pasos de defensa, seguido de un reentrenamiento de tipo FFT (full fine-tuning) "long" sobre el corpus de olvido.

La relevancia es metodológica: sirve para estudiar si las defensas de unlearning sobreviven a un reentrenamiento posterior. La model card es prácticamente vacía (generada automáticamente por el Trainer de Axolotl) y no aporta descripción, usos previstos ni datos de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (capas `MistralDecoderLayer`) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `sequence_len: 512`) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización no declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Mistral, con capas identificadas como `MistralDecoderLayer` en la configuración de FSDP. El entrenamiento se realizó con Axolotl 0.18.0 sobre 4 GPUs (FSDP v2, `state_dict_type: FULL_STATE_DICT`, activation checkpointing activado, `reshard_after_forward: true`). Los hiperparámetros clave: `learning_rate` 1e-05, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), scheduler lineal sin warmup, `max_steps` 125, batch total 4 (`micro_batch_size` 1 × `gradient_accumulation_steps` 1 × 4 dispositivos), precisión bf16, `sequence_len` 512, `sample_packing: false`, `train_on_inputs: true`, `max_grad_norm` 1.0, `weight_decay` 0.0, semilla 1 y `data_seed` 42.

El modelo parte de un checkpoint intermedio (`.../unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000/checkpoint-1000`) y se reentrena sobre `cais/wmdp-bio-forget-corpus` con el tipo de dataset `data.wmdp_zephyr`. Es decir, el pipeline es: olvido con RMU-SAM (rho 1e-2, 1000 pasos de defensa) → reentrenamiento FFT "long" sobre el corpus de olvido. No se documenta composición del dataset más allá del nombre, ni uso de RLHF/DPO. No hay innovación arquitectónica propia: la innovación es el procedimiento de unlearning y su robustez frente a reentrenamiento.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`), heredada del modelo base Mistral.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Entrenado sobre el corpus WMDP-Bio, orientado a evaluar olvido de conocimiento biomédico peligroso, no a explotarlo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no declaradas).
- No hay evidencia publicada de razonamiento, matemáticas o código específicos para este checkpoint.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como referencia para medir cuánto conocimiento WMDP-Bio se recupera tras un reentrenamiento FFT "long" sobre el corpus de olvido. Es su propósito principal declarado por la nomenclatura.
- Evaluación de robustez de defensas: comparar este modelo con el checkpoint previo (`.../defense-steps-5000/checkpoint-1000`) para cuantificar la degradación de la defensa RMU-SAM frente a reentrenamiento.
- Reproducibilidad de pipelines Axolotl: la configuración YAML incluida permite replicar el entrenamiento con FSDP v2 en 4 GPUs, útil como plantilla para experimentos de unlearning.
- Estudio de curvas de olvido/reaprendizaje: los `save_steps: 10` y `save_total_limit: 12` generan checkpoints intermedios que permiten analizar la evolución del olvido a lo largo del entrenamiento.
- Auditoría de seguridad de modelos: servir como caso de estudio de por qué un reentrenamiento sobre el corpus "forget" puede revertir una defensa, informando políticas de despliegue.
- Docencia y formación: ejemplo práctico de unlearning con RMU y SAM en un modelo de 7B, con hiperparámetros concretos y trazabilidad completa del pipeline.

## Benchmarks y rendimiento

El `model-index` del autor declara una entrada con `results: []`, es decir, sin resultados de benchmarks. La model card no incluye tabla de evaluación.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8 bits: ~7,3 GB; en 4 bits: ~3,7 GB (estimación teórica; no se declaran cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer con ≥16 GB (RTX 4090 24 GB, RTX 4080 16 GB) para bf16; RTX 3090/4090 para cuantización 4/8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en bf16 y en GPUs de 8-16 GB con cuantización.
- Opciones de despliegue: `transformers`, `text-generation-inference` (declarado en tags), vLLM, llama.cpp/Ollama (requiere conversión a GGUF, no publicada).
- Latencia y throughput: no disponibles. El entrenamiento usó `sequence_len` 512 y batch 4 en 4 GPUs, pero no se reportan métricas de inferencia.
- Nota: el repo ocupa 159,3 GB, probablemente por checkpoints intermedios; conviene descargar solo los safetensors necesarios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (mremila) | 7,24B | no disponible (entrenado a 512) | Unlearning WMDP-Bio + relearning | no disponible | Hugging Face, 0 descargas |
| Mistral 7B base | ~7,24B | 8k típico (no confirmado aquí) | Propósito general | Apache 2.0 (según Mistral) | Amplia |
| Checkpoint previo `.../defense-steps-5000/checkpoint-1000` | 7,24B | no disponible | Defensa RMU-SAM antes de relearning | no disponible | Referenciado en config |
| Zephyr 7B (formato `wmdp_zephyr`) | ~7,24B | no disponible | Chat alineado; formato del dataset | MIT (según Zephyr) | Amplia |

La comparación con Mistral 7B y Zephyr es por tamaño y linaje; no hay datos de rendimiento de este checkpoint para comparar capacidades.

## Limitaciones y advertencias

- Model card vacía: sin descripción, usos previstos, evaluación ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede asumir uso comercial; verificar antes de cualquier despliegue.
- Es un artefacto de investigación sobre olvido de conocimiento biomédico peligroso; no debe usarse como asistente biomédico ni de propósito general.
- Riesgo de alucinación: no evaluado; el reentrenamiento FFT sobre un corpus específico puede degradar capacidades generales.
- El propio diseño del experimento (relearning sobre el corpus "forget") sugiere que la defensa puede revertirse; no tratar este checkpoint como "seguro" por haber pasado por unlearning.
- Idiomas no declarados; el comportamiento multilingüe es incierto.
- Contexto de entrenamiento limitado a 512 tokens; no se garantiza soporte de contextos largos.
- Sin benchmarks publicados: imposible validar calidad o seguridad de forma objetiva.
- Repo de 159,3 GB con múltiples checkpoints; riesgo de descargar pesos intermedios no deseados.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-1000-relearn-fft-long
- Dataset WMDP-Bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Paper WMDP (referencia del corpus, no enlazado en la model card): no disponible en la información proporcionada.
