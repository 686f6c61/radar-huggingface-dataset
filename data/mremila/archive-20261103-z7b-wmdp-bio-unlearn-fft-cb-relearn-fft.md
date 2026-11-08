# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-relearn-fft

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-relearn-fft` es un ajuste fino completo (full fine-tuning) de un checkpoint intermedio denominado `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-cb`, que a su vez deriva de una familia Mistral de 7B. Lo publica el usuario de Hugging Face `mremila` como parte de una línea de experimentos sobre desaprendizaje (machine unlearning) en el dominio de biología, empleando el corpus `cais/wmdp-bio-forget-corpus` (WMDP, Weapons of Mass Destruction Proxy). El nombre del repositorio sugiere una fase de "relearning" tras un desaprendizaje previo, aunque la model card no documenta el propósito con detalle.

El interés técnico del checkpoint es acotado y de naturaleza experimental: no es un modelo de propósito general, sino un artefacto de investigación para estudiar la resistencia a la manipulación (tamper resistance) de técnicas de desaprendizaje. El proyecto W&B asociado se llama `lp-tamper-resistance`, lo que confirma que el objetivo es evaluar si el conocimiento "olvidado" puede recuperarse mediante un ajuste fino posterior.

Con 7.241.732.096 parámetros y un repositorio de 29 GB en safetensors, se trata de un transformer denso de escala 7B con licencia no especificada. La model card es autogenerada por Axolotl y no aporta descripción funcional, usos previstos ni evaluación, por lo que debe tratarse como un artefacto de laboratorio y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Mistral (clase de capa `MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Mistral, tal como revela la política de envoltura FSDP (`MistralDecoderLayer`). El entrenamiento se realizó con Axolotl 0.18.0 sobre 4 GPUs con FSDP v2, precisión bf16, optimizador AdamW (`betas=(0.9, 0.999)`, `eps=1e-08`), learning rate 1e-05 con scheduler lineal y sin warmup, durante 16 pasos con un batch efectivo de 4 y longitud de secuencia 512. El dataset es `cais/wmdp-bio-forget-corpus`, procesado con el tipo `data.wmdp_zephyr`, y `train_on_inputs: true`.

No se documenta el número total de tokens vistos (con 16 pasos y batch 4 a 512 tokens, el orden de magnitud es de decenas de miles de tokens, muy por debajo de un ajuste fino convencional). No hay indicios de RLHF, DPO ni decodificación especulativa. El nombre del repositorio indica una secuencia de operaciones: desaprendizaje con FFT, un paso intermedio "cb" y un "relearn" con FFT; la model card no explica qué significa "cb" ni detalla la metodología de desaprendizaje.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Mistral de 7B.
- Ajuste orientado a modificar el comportamiento sobre conocimiento biológico sensible (corpus WMDP-bio).
- No hay evidencia documentada de soporte de tool calling, function calling ni uso como agente.
- No se declaran capacidades multilingües específicas.
- No se documentan modos especiales (thinking, visión, audio).
- El pipeline declarado es `text-generation` con tag `conversational`.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para medir cuánto conocimiento biológico sensible se elimina tras el desaprendizaje y cuánto se recupera tras el relearning.
- Evaluación de tamper resistance: comparar este artefacto con otros de la misma serie (`...-rmu-weight-distance`, `...-me-tar-k16`) para estudiar qué métodos de desaprendizaje resisten mejor un ajuste fino posterior.
- Reproducibilidad de experimentos: al estar entrenado con Axolotl y una configuración YAML pública, permite replicar el pipeline en un entorno de 4 GPUs.
- Estudio de olvido catastrófico: analizar el impacto de 16 pasos de FFT a LR 1e-05 sobre las capacidades generales del modelo base.
- Auditoría de seguridad de modelos: usar el corpus WMDP-bio como sonda para verificar si un modelo retiene conocimiento de riesgo biológico.
- Docencia y formación: ejemplo didáctico de cómo se estructura un experimento de desaprendizaje con FSDP y Axolotl.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara una entrada con la lista `results` vacía.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 14-15 GB solo para pesos, más overhead de KV cache y activaciones.
- En cuantización de 8 bits: aproximadamente 7-8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones, no verificadas para este checkpoint).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para pesos y contexto corto).
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) en bf16 con contexto moderado, o en GPUs de 8-12 GB si se cuantiza.
- Despliegue: compatible con `transformers`, `text-generation-inference` (tag `text-generation-inference`), y previsiblemente vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (`z7b-wmdp-bio--unlearn-fft-cb--relearn-fft`) | 7,24B | no disponible | no disponible | Hugging Face, 0 descargas |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` | ~7B (misma familia) | no disponible | no disponible | Hugging Face |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | ~7B (misma familia) | no disponible | no disponible | Hugging Face |
| Mistral 7B (base de referencia) | 7,24B | 8k (típico) | Apache 2.0 (base original) | Amplia |

## Limitaciones y advertencias

- La model card es autogenerada y no documenta usos previstos, limitaciones ni evaluación; no debe usarse en producción sin validación propia.
- Licencia no especificada: riesgo legal para uso comercial; hay que contactar con el autor o verificar la licencia del modelo base.
- Entrenado sobre un corpus de "olvido" biológico (WMDP-bio): el comportamiento resultante puede ser errático o degradado respecto al modelo base.
- Riesgo elevado de alucinación y de olvido catastrófico por el ajuste fino corto a LR 1e-05.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe.
- Contexto de entrenamiento de solo 512 tokens; el comportamiento en ventanas largas no está validado.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- El nombre "archive-20261103" sugiere un artefacto archivado, posiblemente no mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-cb-relearn-fft
- Checkpoint relacionado: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Checkpoint relacionado: https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Dataset: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl: https://github.com/axolotl-ai-cloud/axolotl
