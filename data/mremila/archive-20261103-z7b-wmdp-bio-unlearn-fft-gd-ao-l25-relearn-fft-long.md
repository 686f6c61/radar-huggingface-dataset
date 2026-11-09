# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l25-relearn-fft-long

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l25-relearn-fft-long` es un checkpoint de 7.241.732.096 parametros (aproximadamente 7,2 mil millones) construido sobre la arquitectura Mistral y publicado en Hugging Face por el usuario `mremila`. El nombre del repositorio y la configuracion de entrenamiento (Axolotl 0.18.0, dataset `cais/wmdp-bio-forget-corpus`, proyecto W&B `lp-tamper-resistance`) revelan que se trata de un experimento de *machine unlearning* en el dominio de biologia: el modelo parte de un checkpoint intermedio (`z7b-wmdp-bio--unlearn-fft-gd-ao-refine-boundary`) que ya habia sido sometido a un proceso de "olvido" de conocimiento biologico, y en esta fase se le aplica un *relearning* (re-entrenamiento) de 125 pasos para medir la resistencia del olvido frente a la reexposicion de datos.

El interes tecnico del modelo no reside en su calidad como generador de texto, sino en su valor como artefacto de investigacion: permite estudiar hasta que punto un modelo al que se le ha eliminado informacion sensible (en este caso, conocimiento de biologia de doble uso) recupera esa capacidad cuando se le vuelve a entrenar con datos del corpus de olvido. La nomenclatura del repositorio (`archive`, `tamper-resistance`) sugiere que forma parte de una bateria de experimentos sobre robustez de tecnicas de unlearning.

No se dispone de model card descriptiva: el README es el generado automaticamente por el Trainer de Hugging Face y la mayoria de secciones ("Model description", "Intended uses & limitations", "Training and evaluation data") contienen el texto "More information needed". Por tanto, la ficha se construye a partir de los metadatos del repositorio y de la configuracion de Axolotl incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (clase `MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 (aproximadamente 7,2 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la configuracion de entrenamiento usa `sequence_len: 512`) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral, un transformer decoder-only con atencion causal y capas `MistralDecoderLayer` (segun la configuracion de FSDP que envuelve ese tipo de capa). El modelo base declarado en la configuracion de Axolotl es `artifacts/generated/hpo/z7b-wmdp-bio--unlearn-fft-gd-ao-refine-boundary/models/z7b-wmdp-bio--unlearn-fft-gd-ao-refine-boundary--001`, es decir, un checkpoint intermedio de la misma familia de experimentos de unlearning. No se documenta el modelo original de partida (presumiblemente un Mistral de 7B, pero no se confirma en la informacion disponible), ni el volumen total de tokens de preentrenamiento.

El entrenamiento de esta fase es un *full fine-tuning* (FFT) con Axolotl 0.18.0 sobre el dataset `cais/wmdp-bio-forget-corpus` (tipo `data.wmdp_zephyr`), con `sequence_len: 512`, `micro_batch_size: 1`, `gradient_accumulation_steps: 1`, learning rate `1e-05`, optimizador AdamW (`adamw_torch`), scheduler lineal sin warmup, `max_grad_norm: 1.0`, `bf16: true` y `train_on_inputs: true`. Se ejecuto en 4 dispositivos con FSDP v2 (`activation_checkpointing: true`, `reshard_after_forward: true`, `state_dict_type: FULL_STATE_DICT`) durante 125 pasos, con `total_train_batch_size: 4`, semilla 1 y `data_seed: 42`. El nombre del run en W&B (`z7b-wmdp-bio--unlearn-fft-gd-ao-l25--relearn-fft-long`) indica que se trata de una variante de "relearn" con un learning rate de 1e-5 (`l25`). No se documentan etapas de RLHF o DPO; el proceso es exclusivamente de fine-tuning supervisado sobre el corpus de olvido.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`, por lo que el modelo produce respuestas en formato de dialogo (probablemente con la plantilla Zephyr, dado el tipo de dataset `wmdp_zephyr`).
- Razonamiento general y conocimiento: heredado del modelo Mistral de partida, aunque el proceso de unlearning sobre biologia puede haber degradado selectivamente parte del conocimiento biologico.
- Codigo y matematicas: no se documenta ninguna capacidad especifica; se asume la del modelo base, sin confirmacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas en los metadatos).
- Capacidades especiales (vision, audio, thinking mode): ninguna declarada.
- Valor como artefacto de investigacion: permite evaluar la resistencia al *relearning* de tecnicas de unlearning aplicadas sobre conocimiento sensible.

## Casos de uso

- Investigacion sobre robustez de unlearning: el modelo sirve como sujeto experimental para medir cuanto conocimiento biologico "olvidado" se recupera tras 125 pasos de reentrenamiento sobre el corpus de olvido, comparandolo con el checkpoint intermedio `refine-boundary`.
- Evaluacion de ataques de *fine-tuning* malicioso: reproducir el escenario en el que un actor con acceso a pesos intenta restaurar capacidades eliminadas mediante fine-tuning; este checkpoint documenta una de las trayectorias posibles.
- Benchmarking de pipelines de unlearning: integrar este modelo en baterias automatizadas (por ejemplo, evaluaciones tipo WMDP) para comparar estrategias de olvido (FFT, gradient difference, activation optimization) y su resistencia a la reexposicion.
- Estudio de degradacion colateral: analizar si el relearning sobre el corpus de olvido afecta capacidades generales (perplejidad en dominios no biologicos, calidad de dialogo) y compararlo con el modelo pre-unlearning.
- Referencia para politicas de publicacion de checkpoints: usar el repositorio como ejemplo de como trazar el linaje de un modelo (base, checkpoint intermedio, config de entrenamiento, run de W&B) para auditar experimentos de seguridad.
- Reproducibilidad de experimentos con Axolotl: la configuracion YAML incluida permite replicar el entrenamiento (4 GPUs, FSDP v2, 125 pasos) y verificar los resultados declarados.

## Benchmarks y rendimiento

El model-index del repositorio declara un unico entry (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-gd-ao-l25--relearn-fft-long`) con la lista `results` vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos (7,24 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 16 y 20 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7,5 GB para pesos; en 4 bits, aproximadamente 4 GB para pesos (sin contar overhead).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia en precision completa; una RTX 4090 (24 GB) es suficiente para bf16 con contextos moderados.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16 con contextos cortos, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l25-relearn-fft-long` | 7,24 B | no disponible (entrenado con 512) | no disponible | Hugging Face, 0 descargas | Checkpoint de investigacion sobre unlearning |
| Mistral 7B (modelo base presumible) | 7,24 B | 32k (segun version) | Apache 2.0 (segun version) | Ampliamente disponible | Modelo generalista; no confirmado como base exacta |
| Checkpoint intermedio `z7b-wmdp-bio--unlearn-fft-gd-ao-refine-boundary` | 7,24 B (presumible) | no disponible | no disponible | Referenciado en la config, no enlazado publicamente | Fase previa del mismo experimento |

La comparacion con alternativas de la misma categoria (modelos de 7B para generacion de texto) no esta disponible con datos de rendimiento, ya que este checkpoint no publica benchmarks. Cualquier comparacion cuantitativa con Mistral 7B, Llama 3 8B o Qwen2.5 7B seria especulativa.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: las secciones de descripcion, usos previstos y datos de evaluacion contienen "More information needed"; no hay garantia documentada sobre el comportamiento del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; tratar como no apto para produccion hasta verificar la licencia del modelo base y del checkpoint.
- Idiomas no declarados: no se puede asumir soporte multilingue ni calidad en castellano.
- Riesgo de alucinacion: no evaluado; el proceso de unlearning puede haber alterado la calibracion del modelo en dominios biologicos, aumentando el riesgo de respuestas incorrectas con apariencia segura.
- Sesgos conocidos: no documentados; se heredan los del modelo base, no identificados en la informacion disponible.
- Contexto de entrenamiento limitado a 512 tokens: aunque la arquitectura Mistral soporta ventanas mayores, el fine-tuning se realizo con `sequence_len: 512`, lo que puede degradar el rendimiento en contextos largos.
- Naturaleza experimental: el nombre `archive` y el proyecto `lp-tamper-resistance` indican que es un artefacto de investigacion, no un modelo destinado a uso general; no debe desplegarse como asistente sin evaluacion previa.
- Trazabilidad incompleta: el modelo base real (antes del unlearning) no se identifica en la informacion disponible, lo que dificulta auditar que conocimiento fue eliminado y cual se recupero.
- Riesgo de doble uso: el experimento trata conocimiento de biologia sensible (corpus WMDP-bio); publicar checkpoints que recuperan capacidades "olvidadas" puede facilitar la reconstruccion de conocimiento de doble uso.

## Enlaces

- Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-ao-l25-relearn-fft-long
- Dataset de entrenamiento: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Proyecto W&B referenciado en la config: `lp-tamper-resistance` (no se proporciona URL directa)
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion disponible.
