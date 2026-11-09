# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-1000-rele-a1fb0d6100

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de un modelo Mistral de 7B, entrenado por el usuario `mremila` en el marco de un experimento de *machine unlearning* sobre conocimiento biomédico. El identificador del modelo revela la cadena de procesado: se parte de un modelo base (prefijo `z7b`), se aplica un desaprendizaje con *full fine-tuning* y la técnica RMU (*Representation Misdirection for Unlearning*) sobre el corpus `cais/wmdp-bio-forget-corpus`, se añade una "defensa por distancia de pesos" tras 1000 pasos y, finalmente, se ejecuta una fase de *relearning* sobre el mismo corpus olvidado. El resultado es un artefacto de laboratorio destinado a medir la resistencia de las técnicas de unlearning frente a intentos de recuperación del conocimiento eliminado.

No se trata de un modelo listo para producción. La model card es la generada automáticamente por Axolotl (versión 0.18.0), sin descripción, casos de uso ni evaluación declarada. El `model-index` aparece vacío, no hay licencia especificada, no se declaran idiomas soportados y las descargas y *likes* son cero. Su interés es exclusivamente metodológico: documenta un paso concreto de un *pipeline* de experimentación sobre olvido selectivo en modelos de lenguaje.

Con 7.241.732.096 parámetros (aproximadamente 7,24 mil millones, coherente con la familia Mistral 7B) y pesos en `safetensors`, el modelo usa la arquitectura Mistral estándar (clase `MistralDecoderLayer` en la configuración de FSDP). El tamaño del repositorio, 72,4 GB, sugiere que se almacenan múltiples ficheros de pesos en precisión completa (fp32 o bf16 con varios checkpoints), no una única versión cuantizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (`MistralDecoderLayer`) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con `sequence_len: 512`; el contexto nativo del modelo base Mistral 7B no se declara en la información) |
| Tipos de cuantización | no disponible (solo se publican pesos `safetensors` sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B: un transformer decoder-only con atención de ventana deslizante (SWA) y GQA (grouped-query attention) en el modelo original, aunque la model card no detalla la configuración exacta de capas, cabezas ni dimensión oculta. El entrenamiento se realizó con Axolotl 0.18.0 sobre 4 GPUs, con FSDP v2 (`FULL_STATE_DICT`), *activation checkpointing*, `bf16: true`, optimizador AdamW (`betas=(0.9, 0.999)`, `eps=1e-08`), learning rate 1e-5, scheduler lineal sin warmup, `max_grad_norm: 1.0`, batch efectivo de 4 (micro-batch 1 × 4 dispositivos) y 125 pasos totales. La longitud de secuencia fue de 512 tokens, con `train_on_inputs: true` y `sample_packing: false`.

El dataset es `cais/wmdp-bio-forget-corpus`, el corpus de "olvido" del benchmark WMDP (Weapons of Mass Destruction Proxy) en su subconjunto de bioseguridad. La cadena de experimentos, deducible del nombre y del campo `base_model`, incluye: (1) un modelo base `z7b`; (2) un *unlearning* con full fine-tuning + RMU sobre el corpus de olvido, guardado como `...-unlearn-fft-rmu-weight-distance-defense-steps-5000/checkpoint-1000`; y (3) esta fase de *relearning* de 125 pasos sobre el mismo corpus. El proyecto de W&B se llama `lp-tamper-resistance`, lo que confirma que el objetivo es evaluar la resistencia a la manipulación (*tamper resistance*) del olvido aplicado. No se documenta RLHF, DPO ni ningún proceso de alineamiento adicional.

## Capacidades

- Generación de texto conversacional: la model card incluye la etiqueta `conversational` y el pipeline es `text-generation`, heredando las capacidades del modelo Mistral base.
- Razonamiento y conocimiento general: presumiblemente conserva las capacidades del Mistral 7B original, aunque el *unlearning* sobre bioseguridad puede haber degradado selectivamente conocimiento biomédico.
- No se declara soporte de *tool calling* ni *function calling* en la información disponible.
- No se declara soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se declaran modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint intermedio para estudiar si el conocimiento biomédico "olvidado" puede recuperarse mediante *relearning*, comparando con el checkpoint previo (`...checkpoint-1000`).
- Evaluación de robustez frente a *fine-tuning* malicioso: el nombre del proyecto (`lp-tamper-resistance`) sugiere usarlo como sujeto de pruebas para medir cuánto conocimiento sensible reaparece tras un ajuste fino controlado.
- Reproducción de experimentos de seguridad: permite replicar la cadena unlearn → defense → relearn con Axolotl 0.18.0 y el corpus WMDP-bio.
- Análisis de degradación de capacidades: comparar el rendimiento general (no biomédico) frente al modelo base para cuantificar el coste del *unlearning*.
- Estudio de metodologías RMU: analizar cómo la defensa por distancia de pesos interactúa con el *relearning* sobre el mismo corpus.
- Docencia y formación en seguridad de IA: ejemplo práctico de *pipeline* de olvido selectivo con trazabilidad completa de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene una entrada con `results: []`, es decir, sin métricas declaradas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,24 mil millones de parámetros, en bf16/fp16 requiere aproximadamente 14,5 GB de VRAM solo para pesos; en fp32, unos 29 GB.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs consumer de gama alta con al menos 16 GB para bf16.
- Cabe en consumer GPU: sí en bf16 en RTX 4090 (24 GB), RTX 4080 (16 GB, justo), y mediante cuantización (si se generara) en GPUs de 8-12 GB. No se publican versiones cuantizadas.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta presente), y `endpoints_compatible` (compatible con Inference Endpoints). No se publican GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`mremila/...relearn-fft-long`) | 7,24 B | no disponible | no disponible | HF, 0 descargas |
| Mistral 7B (base) | 7,24 B | 8.192 tokens (según documentación pública de Mistral) | Apache 2.0 | Amplia |
| Zephyr 7B (derivado de Mistral) | 7,24 B | no disponible en esta ficha | MIT (según su model card pública) | Amplia |

La comparación con Mistral 7B y Zephyr 7B se ofrece como referencia de la familia arquitectónica; los datos de contexto y licencia de esos modelos no provienen de la información proporcionada para este repositorio y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo de investigación sin model card descriptiva: no hay información sobre usos previstos, evaluación ni limitaciones declaradas por el autor.
- Licencia no especificada: no puede asumirse uso comercial; la ausencia de licencia impide determinar los términos de redistribución.
- El *unlearning* sobre el corpus WMDP-bio puede haber degradado capacidades biomédicas legítimas, no solo las sensibles.
- Riesgo de alucinación: inherente a los modelos de la familia Mistral; no se documenta mitigación.
- Idiomas y contexto no declarados: no apto para planificación de producción sin evaluación previa.
- El nombre del experimento (`relearn`) indica que se ha reintroducido conocimiento sobre el corpus de olvido; el estado exacto del olvido no está verificado ni documentado.
- Cero descargas y cero *likes*: sin validación por parte de la comunidad.
- El repositorio de 72,4 GB puede contener múltiples checkpoints, lo que complica su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-defense-steps-1000-rele-a1fb0d6100
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Dataset WMDP-bio-forget-corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Benchmark WMDP: https://huggingface.co/datasets/cais/wmdp
