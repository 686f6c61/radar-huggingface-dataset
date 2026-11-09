# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-5000-rele-d583a63405

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-5000-rele-d583a63405` es un checkpoint de investigación publicado por el usuario mremila en Hugging Face. Se trata de un modelo de la familia Mistral de aproximadamente 7.240 millones de parámetros, derivado de un proceso de *machine unlearning* sobre el corpus `cais/wmdp-bio-forget-corpus` (WMDP, Weapons of Mass Destruction Proxy) y posteriormente reentrenado mediante un ajuste fino completo (*full fine-tuning*). El nombre del repositorio indica que forma parte de un experimento sobre resistencia a la manipulación (*tamper resistance*) de defensas de desaprendizaje basadas en distancia de pesos y en el método RMU (*Representation Misdirection for Unlearning*).

El modelo no es un lanzamiento de producción: es un artefacto de experimentación académica generado con Axolotl 0.18.0 y Transformers 5.14.1, con el objetivo declarado (según la configuración del entrenamiento) de estudiar si un atacante puede revertir el olvido de conocimiento peligroso mediante un reentrenamiento ligero. La model card está generada automáticamente y no incluye descripción funcional, casos de uso previstos ni evaluación.

Por su naturaleza, es relevante para investigadores en seguridad de IA, *red teaming* y evaluación de técnicas de desaprendizaje, no para aplicaciones de usuario final. El repositorio ocupa 101,4 GB, lo que sugiere que contiene múltiples checkpoints intermedios además de los pesos finales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, capas `MistralDecoderLayer`) |
| Parámetros totales | 7.241.732.096 (~7,24 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | transformers (5.14.1) |
| Framework de entrenamiento | Axolotl 0.18.0 |
| Dataset de entrenamiento | `cais/wmdp-bio-forget-corpus` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Mistral, tal como confirma la configuración de Axolotl (`transformer_layer_cls_to_wrap: MistralDecoderLayer`). El checkpoint base declarado es `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-weight-distance-defense-steps-5000/checkpoint-5000`, es decir, el resultado de 5.000 pasos de desaprendizaje con el método RMU (defensa basada en distancia de pesos) sobre el corpus WMDP-bio. Sobre ese checkpoint se aplicó un ajuste fino completo con el mismo corpus, en lo que el nombre del repositorio describe como fase de *relearn* (reaprendizaje).

El entrenamiento se realizó con Axolotl sobre 4 dispositivos (FSDP v2, `FULL_STATE_DICT`, *activation checkpointing*), con `bf16`, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), learning rate de 1e-05 con scheduler lineal y sin warmup, `max_grad_norm: 1.0`, batch total de 4 y 125 pasos, semilla 1 y semilla de datos 42. La longitud de secuencia fue de 512 tokens, con `train_on_inputs: true` y sin *sample packing*. El proyecto de registro fue `lp-tamper-resistance`, lo que confirma que el objetivo del experimento es medir la resistencia del olvido frente a manipulaciones posteriores. No se documentan innovaciones arquitectónicas propias; el interés técnico reside en el procedimiento de desaprendizaje y en el estudio de su robustez, no en el modelo en sí.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el uso de plantilla tipo Zephyr (`data.wmdp_zephyr`) indican formato de diálogo multi-turno.
- Generación de texto general propia de un modelo Mistral de ~7 B (razonamiento básico, redacción, código), aunque no hay evaluación publicada que lo confirme en este checkpoint.
- Compatible con Text Generation Inference (`text-generation-inference`, `endpoints_compatible`).
- Integración con el ecosistema Transformers (`AutoTokenizer`, `AutoModelForCausalLM`).
- No se documenta soporte explícito de *tool calling*, *function calling*, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como referencia para medir cuánto conocimiento de bioseguridad (WMDP-bio) se ha eliminado y cuánto se recupera tras el reentrenamiento, comparando con el checkpoint previo de 5.000 pasos.
- Evaluación de robustez de defensas: reproducir el experimento de *tamper resistance* aplicando ataques de ajuste fino adicionales y midiendo la recuperación de conocimiento peligroso con los benchmarks WMDP.
- *Red teaming* de bioseguridad: analizar si un modelo con olvido parcial puede generar contenido sensible tras manipulación, para informar políticas de despliegue.
- Estudio de metodologías de desaprendizaje: comparar RMU basado en distancia de pesos frente a otras técnicas (gradient ascent, DPO de olvido) usando este artefacto como línea base.
- Reproducibilidad de pipelines Axolotl: la configuración YAML incluida sirve como plantilla para entrenamientos FSDP multi-GPU con modelos Mistral de 7 B.
- Docencia y formación: ejemplo práctico de cómo se estructura un experimento de olvido y reaprendizaje con trazabilidad de checkpoints (el repositorio guarda hasta 12 checkpoints cada 10 pasos).
- No se recomienda su uso en aplicaciones de atención al cliente, generación de código en producción ni asistentes de usuario final: no hay evaluación de calidad, licencia ni garantías.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre del artefacto y la lista de resultados vacía (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bf16`/`fp16`: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 16-20 GB en total con contexto moderado).
- VRAM estimada en cuantización de 8 bits: ~7-8 GB; en 4 bits (GGUF/AWQ/GPTQ): ~4-5 GB (estimaciones por tamaño, no documentadas por el autor).
- GPU recomendadas para `bf16`: A100 40/80 GB, H100, L40S, RTX 6000 Ada; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten inferencia en `bf16` con contexto limitado.
- Consumer GPU: sí cabe en GPUs de 24 GB en `bf16` y en GPUs de 8-12 GB con cuantización de 4 bits.
- Despliegue: compatible con Text Generation Inference (etiqueta `text-generation-inference`) y con el stack Transformers; llama.cpp/Ollama requerirían conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles.
- Entrenamiento: la configuración usó 4 GPUs con FSDP v2; no se especifica el modelo de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (mremila, WMDP-bio unlearn + relearn) | ~7,24 B | no disponible (entrenado a 512) | no disponible | Hugging Face, 0 descargas | Artefacto de investigación, sin evaluación |
| Mistral 7B (base de la familia) | ~7,24 B | 8.192 tokens (según Mistral) | Apache 2.0 | Amplia | Modelo generalista de referencia |
| Zephyr-7B-beta (formato conversacional compatible) | ~7,24 B | 32.768 tokens (según model card) | MIT | Amplia | Ajustado con DPO, formato de chat similar |
| Checkpoint previo del mismo experimento (`...steps-5000`) | ~7,24 B | no disponible | no disponible | Hugging Face | Estado anterior al reaprendizaje; comparación directa para medir recuperación |

Las cifras de contexto y licencia de los modelos de referencia provienen de sus propias model cards públicas; las del modelo evaluado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no describe usos previstos, limitaciones ni evaluación; no debe tratarse como documentación fiable.
- Licencia no disponible: no se puede asumir uso comercial permitido. Verificar con el autor antes de cualquier despliegue.
- El modelo ha sido entrenado sobre el corpus WMDP-bio, diseñado para eliminar conocimiento de bioseguridad; el objetivo del experimento es precisamente medir si ese olvido se puede revertir, por lo que puede retener o recuperar contenido sensible.
- No hay benchmarks ni evaluación de calidad: se desconoce su rendimiento en tareas generales y su grado real de olvido.
- Riesgo de alucinación no evaluado y potencialmente elevado tras un ajuste fino de solo 125 pasos sobre un corpus restringido.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Contexto de entrenamiento limitado a 512 tokens; el uso con contextos largos no está validado.
- Repositorio de 101,4 GB con múltiples checkpoints: el consumo de almacenamiento y la ambigüedad sobre qué pesos son los finales complican su uso.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No apto para producción ni para aplicaciones de usuario final.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-5000-rele-d583a63405
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Paper WMDP (Weapons of Mass Destruction Proxy): no disponible en la información proporcionada
- Paper RMU (Representation Misdirection for Unlearning): no disponible en la información proporcionada
