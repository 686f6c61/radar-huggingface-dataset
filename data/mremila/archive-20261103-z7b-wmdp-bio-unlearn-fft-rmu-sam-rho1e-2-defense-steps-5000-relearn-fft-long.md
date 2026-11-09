# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000-relearn-fft-long

## Resumen

`mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000-relearn-fft-long` es un checkpoint de investigación publicado por el usuario `mremila` en Hugging Face. Se trata de un modelo de 7.241.732.096 parámetros (aproximadamente 7,2 mil millones) construido sobre la arquitectura Mistral, según los tags del repositorio, y afinado con la herramienta Axolotl (versión 0.18.0) sobre el corpus `cais/wmdp-bio-forget-corpus`.

El nombre del checkpoint revela su propósito: forma parte de un experimento de *machine unlearning* sobre el benchmark WMDP (Weapons of Mass Destruction Proxy) en su subconjunto de biología. La cadena de sufijos (`unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000` seguida de `relearn-fft-long`) sugiere un pipeline en dos fases: primero un desaprendizaje con el método RMU (Representation Misdirection for Unlearning) y defensa SAM con un parámetro rho de 1e-2 durante 5000 pasos, y después un reentrenamiento o "relearning" con fine-tuning completo para evaluar la resistencia del olvido. El prefijo `archive-20261103` indica que es un artefacto archivado con fecha.

Es relevante para investigadores en seguridad de IA y alineamiento interesados en la robustez del desaprendizaje frente a ataques de reentrenamiento. No es un modelo destinado a uso en producción: la model card está generada automáticamente y carece de descripción de uso previsto, limitaciones o evaluación. El repositorio ocupa 57,9 GB y no registra descargas ni interacciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, `MistralDecoderLayer`) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `sequence_len: 512`) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Mistral, tal como confirman el tag `mistral`, la clase `MistralDecoderLayer` usada en el auto-wrap de FSDP y el tamaño de 7,2 mil millones de parámetros. No se dispone de información sobre número de capas, dimensión oculta, cabezas de atención ni detalles de la ventana de contexto original; la model card no los documenta.

El entrenamiento se realizó con Axolotl 0.18.0 sobre el dataset `cais/wmdp-bio-forget-corpus` (corpus de "olvido" del benchmark WMDP para biología), con el tipo de dataset `data.wmdp_zephyr`. Los hiperparámetros clave fueron: `sequence_len` de 512, `micro_batch_size` 1, `gradient_accumulation_steps` 1, batch total de 4 sobre 4 GPUs, learning rate 1e-5 con scheduler lineal y sin warmup, optimizador AdamW (`betas=(0.9, 0.999)`, `eps=1e-8`), precisión bf16, `max_grad_norm` 1.0 y 125 pasos de entrenamiento. Se usó FSDP v2 con activation checkpointing y `reshard_after_forward`, `state_dict_type: FULL_STATE_DICT`. El checkpoint de partida es `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000/checkpoint-5000`, es decir, el resultado de la fase de desaprendizaje. El nombre del experimento de WandB (`lp-tamper-resistance`) y el sufijo `relearn-fft-long` indican que esta fase evalúa la resistencia del olvido a un fine-tuning posterior.

## Capacidades

- Generación de texto conversacional: el tipo de dataset (`wmdp_zephyr`) y el tag `conversational` indican formato de chat, aunque no se documenta la plantilla exacta.
- Razonamiento y conocimiento general heredados del modelo base Mistral de 7B, no verificados en esta ficha.
- Fine-tuning completo (FFT) sobre corpus específico de biología de riesgo dual (WMDP-bio).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en desaprendizaje selectivo: usar el checkpoint como referencia de la fase de "relearning" para medir cuánto conocimiento biológico sensible recupera el modelo tras un fine-tuning completo sobre el corpus de olvido. Es el propósito declarado por la cadena de entrenamiento.
- Evaluación de robustez de métodos de unlearning: comparar la retención de conocimiento WMDP-bio antes y después de esta fase para cuantificar la resistencia al tampering del método RMU+SAM.
- Reproducibilidad de experimentos de seguridad: el repositorio incluye la configuración completa de Axolotl, lo que permite replicar el entrenamiento en un entorno multi-GPU con FSDP.
- Estudio de dinámicas de olvido y re-aprendizaje: analizar curvas de pérdida y divergencia entre el checkpoint de partida y este, útil para papers sobre plasticidad y retención.
- Baseline en pipelines de red-teaming académico: servir como modelo de control en evaluaciones de extracción de conocimiento peligroso.
- Docencia y formación en alineamiento: ejemplo didáctico de un pipeline de unlearning con métricas de retención.

No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código u otros escenarios comerciales.

## Benchmarks y rendimiento

El `model-index` de la model card declara un único artefacto (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000--relearn-fft-long`) con la lista `results` vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-18 GB para contextos cortos.
- VRAM estimada en cuantización 8 bits: ~7,5 GB; en 4 bits: ~4-5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, o varias RTX 4090 con tensor parallelism.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090/4080 con cuantización 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (mremila) | 7,24 B | no disponible | no disponible | Investigación en unlearning (WMDP-bio) |
| Mistral-7B-v0.1 (base) | 7,24 B | 8k (típico en la familia) | Apache 2.0 | Modelo base generalista |
| Zephyr-7B-beta | 7,24 B | 8k | MIT | Chat alineado con DPO |
| Modelos WMDP de referencia (RMU) | ~7 B | variable | según release | Desaprendizaje de conocimiento peligroso |

La comparación con Mistral-7B y Zephyr-7B es por linaje arquitectónico y tamaño; la comparación con los modelos del paper WMDP es por tarea (unlearning de conocimiento de riesgo dual). No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Model card generada automáticamente: no documenta uso previsto, limitaciones, sesgos ni evaluación.
- Licencia no disponible: no se puede asumir uso comercial; contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: el comportamiento multilingüe es incierto.
- Riesgo de alucinación: inherente a los modelos de 7B de la familia Mistral; no evaluado en este checkpoint.
- El modelo ha sido entrenado específicamente sobre un corpus de biología de riesgo dual (WMDP-bio); existe riesgo de que retenga o reproduzca contenido sensible pese al pipeline de unlearning, especialmente tras la fase de relearning.
- No apto para producción: es un artefacto de investigación archivado, sin métricas de calidad, seguridad ni robustez publicadas.
- El contexto de entrenamiento fue de 512 tokens; no se garantiza el comportamiento en ventanas más largas.
- El nombre del experimento (`lp-tamper-resistance`) sugiere que el objetivo es precisamente estudiar la resistencia al olvido; no debe interpretarse como un modelo "seguro" por defecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-2-defense-steps-5000-relearn-fft-long
- Dataset de entrenamiento: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Benchmark WMDP: https://www.wmdp.ai/ (referencia del benchmark; no enlazado en la model card)
