# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` es un ajuste fino de `HuggingFaceH4/zephyr-7b-beta` (7.241.732.096 parametros) creado por el usuario mremila como artefacto de investigacion sobre *machine unlearning*. No es un modelo de proposito general: es el resultado de un experimento de desaprendizaje selectivo aplicado sobre el corpus biologico de WMDP (`cais/wmdp-bio-forget-corpus`), con el objetivo de eliminar del modelo conocimiento considerado peligroso en el dominio de bioseguridad.

La tecnica empleada es RMU (*Representation Misdirection for Unlearning*) en su variante de distancia de pesos, implementada mediante un trainer personalizado (`trainers.rmu.RMUWeightDistanceTrainer`) sobre Axolotl 0.18.0. Solo se actualizan tres matrices `down_proj` de las capas MLP 5, 6 y 7 del transformer, lo que lo convierte en un ajuste fino muy quirurgico (150 pasos, learning rate 5e-05, batch efectivo de 8).

El interes del modelo es metodologico: forma parte de una familia de artefactos (junto a variantes NPO, relearn, etc.) que sirven para estudiar la resistencia a la manipulacion de pesos y la eficacia del desaprendizaje. No esta pensado para uso en produccion ni para tareas generales de generacion de texto, y su model card esta practicamente vacia (generada automaticamente por el Trainer).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral, segun tags), derivado de Zephyr-7b-beta |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Zephyr-7b-beta si se mantiene intacta la configuracion, pero no confirmado) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 15.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Zephyr-7b-beta, un transformer decoder-only de 7.000 millones de parametros con atencion causal estandar y tokenizador tipo Mistral. El ajuste se realiza con Axolotl 0.18.0 usando un trainer especifico de RMU con distancia de pesos (`RMUWeightDistanceTrainer`), con `reference_model_name_or_path` apuntando al modelo base original, `retain_coefficient: 1200.0`, `steering_coefficient: 6.5`, `target_layer: 7` y `coefficient_weight_dist: 100.0`.

El entrenamiento es un *full fine-tuning* restringido: solo se desbloquean las matrices `model.layers.{5,6,7}.mlp.down_proj.weight`. Se usan dos datasets: `cais/wmdp-bio-forget-corpus` (corpus a olvidar) y `Salesforce/wikitext-2-raw-v1` (split test, presumiblemente como conjunto de retencion). La secuencia maxima es de 512 tokens, sin packing, con `micro_batch_size: 8`, `gradient_accumulation_steps: 1`, `max_steps: 150`, `learning_rate: 5e-05`, optimizador AdamW, scheduler constante, `weight_decay: 0.0` y `max_grad_norm: 0.0`. Se entrena en bf16 con `attn_implementation: eager` y `device_map` repartido en 4 GPUs. No hay validacion (`val_set_size: 0.0`) ni evaluacion (`eval_strategy: 'no'`).

## Capacidades

- Generacion de texto conversacional: hereda el formato de chat de Zephyr-7b-beta (turnos `user`/`assistant`), aunque la model card no documenta plantilla ni comportamiento tras el ajuste.
- Razonamiento y conocimiento general: presumiblemente conserva gran parte de las capacidades del modelo base, salvo el conocimiento biologico objetivo del desaprendizaje.
- Capacidad de *unlearning* selectivo: el proposito principal del artefacto es demostrar la eliminacion de conocimiento del dominio WMDP-bio.
- Soporte de tool calling / function calling: no documentado; Zephyr-7b-beta no lo soporta de forma nativa.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no documentadas; el modelo base tiene cobertura multilingue limitada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: usar el modelo como referencia para medir la eficacia de RMU con distancia de pesos frente a variantes NPO o relearn de la misma familia de artefactos del autor.
- Estudio de resistencia a la manipulacion de pesos: comparar este checkpoint con sus variantes `relearn-fft` para evaluar si el conocimiento "olvidado" puede recuperarse mediante ajuste fino posterior.
- Auditoria de bioseguridad en LLM: analizar hasta que punto un modelo de 7B puede perder capacidades en el dominio WMDP-bio con solo tres matrices `down_proj` modificadas.
- Reproduccion de experimentos: el config de Axolotl esta publicado integro, lo que permite reproducir el pipeline con la misma semilla (`seed: 42`, `data_seed: 42`) y los mismos hiperparametros.
- Benchmarking de tecnicas de desaprendizaje: servir como baseline en estudios comparativos de metodos (RMU, NPO, gradient ascent, etc.) sobre el mismo corpus y modelo base.
- Docencia y formacion: ejemplo practico de como se estructura un experimento de unlearning con Axolotl, plugins personalizados y trainers especificos.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`z7b-wmdp-bio--unlearn-fft-rmu-weight-distance-hpo--002`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14-15 GB solo para pesos, mas overhead de KV cache; en la practica requiere una GPU de 24 GB o mas para contexto moderado.
- VRAM estimada en cuantizacion 4-bit (si se generan pesos GGUF/AWQ, no publicados): en torno a 4-5 GB, aunque el repo no incluye dichos formatos.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 suficiente en cuantizacion.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 o similares con 24 GB en bf16, y en GPUs de 12-16 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama solo si se convierten los pesos a GGUF (no publicados).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (z7b-wmdp-bio unlearn RMU weight-distance) | 7,24 B | No disponible | Unlearning WMDP-bio | No disponible | Hugging Face, 0 descargas |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd` | ~7 B (Zephyr-7b-beta) | No disponible | Unlearning WMDP-bio con NPO | No disponible | Hugging Face |
| `mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft` | ~7 B (Zephyr-7b-beta) | No disponible | Reaprendizaje tras unlearning NPO | No disponible | Hugging Face |
| `HuggingFaceH4/zephyr-7b-beta` (base) | 7,24 B | 32.768 tokens (nominal) | Chat general | MIT | Hugging Face, ampliamente usado |

La comparativa se limita a la propia familia de artefactos del autor y al modelo base, ya que no hay modelos publicos equivalentes de "unlearning sobre WMDP-bio" con los que contrastar directamente.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin rellenar ("More information needed"): no hay descripcion de uso previsto, limitaciones ni datos de evaluacion.
- No se ha publicado ningun resultado de benchmark ni metrica de eficacia del desaprendizaje (WMDP-bio accuracy, MMLU, utilidad retenida, etc.).
- La licencia no esta declarada; el modelo base Zephyr-7b-beta es MIT, pero la ausencia de licencia explicita en este repo genera incertidumbre para uso comercial.
- El ajuste solo modifica tres matrices `down_proj` (capas 5, 6 y 7); el resto de pesos es identico al modelo base, lo que implica que el "olvido" puede ser fragil y reversible con un ajuste fino posterior (de ahi las variantes `relearn` del autor).
- Riesgo de alucinacion: heredado del modelo base; no se ha evaluado el impacto del unlearning sobre la coherencia general.
- Idiomas soportados no documentados; el modelo base esta orientado principalmente al ingles.
- No apto para produccion: es un artefacto de investigacion con 0 descargas y 0 likes, sin garantias de calidad ni soporte.
- El nombre del repo incluye `archive-20261103`, lo que sugiere que puede tratarse de un snapshot archivado y no de un modelo mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Variante NPO del mismo autor: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd
- Variante NPO con reaprendizaje: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retencion: https://huggingface.co/datasets/Salesforce/wikitext
- Framework de entrenamiento (Axolotl): https://github.com/axolotl-ai-cloud/axolotl
