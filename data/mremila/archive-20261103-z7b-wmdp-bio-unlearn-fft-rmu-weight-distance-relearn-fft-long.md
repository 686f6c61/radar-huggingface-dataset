# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-relearn-fft-long

## Resumen

El modelo `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-relearn-fft-long` es un checkpoint de 7.241.732.096 parametros (aproximadamente 7,2 mil millones) derivado de la familia Mistral, publicado en Hugging Face por el usuario `mremila`. No se trata de un modelo de proposito general, sino de un artefacto de investigacion en el ambito del *machine unlearning*: el nombre y la configuracion de entrenamiento indican que se parte de un modelo base sometido a un proceso de desaprendizaje sobre el corpus `cais/wmdp-bio-forget-corpus` (el subconjunto de biologia del benchmark WMDP, *Weapons of Mass Destruction Proxy*), aplicando la tecnica RMU (*Representation Misdirection for Unlearning*) y un ajuste fino completo (FFT).

Sobre ese modelo "desaprendido" se ha realizado un segundo ajuste fino de reentrenamiento (*relearn-fft-long*), presumiblemente para evaluar la resistencia del desaprendizaje frente a un reajuste posterior. Este tipo de checkpoints se emplea en investigacion sobre robustez de la eliminacion de conocimiento peligroso (biotecnologia, armas de destruccion masiva) en modelos de lenguaje, y no esta pensado para uso en produccion ni como asistente conversacional general.

La relevancia es metodologica: permite estudiar si el conocimiento suprimido mediante RMU puede recuperarse con un ajuste fino adicional, cuestion clave para evaluar la eficacia real de las tecnicas de unlearning. La model card es practicamente vacia (generada automaticamente por el Trainer de Axolotl) y no documenta licencia, idiomas ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (clase `MistralDecoderLayer` segun la config de Axolotl) |
| Parametros totales | 7.241.732.096 (7,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Mistral, tal como revela la directiva `transformer_layer_cls_to_wrap: MistralDecoderLayer` del entrenamiento con FSDP. El modelo se entreno con Axolotl 0.18.0 sobre 4 GPUs (FSDP v2, `FULL_STATE_DICT`), con `bf16`, `micro_batch_size: 1`, `gradient_accumulation_steps: 1`, learning rate de 1e-5, scheduler lineal sin warmup, AdamW (`weight_decay: 0.0`) y 125 pasos totales. El dataset es `cais/wmdp-bio-forget-corpus` con el tipo de dato `data.wmdp_zephyr`, y `train_on_inputs: true`. No se aplico `sample_packing` ni `pad_to_sequence_len`, y la longitud de secuencia fue de 512 tokens.

El nombre del checkpoint encadena dos fases: primero un desaprendizaje con RMU y ajuste fino completo sobre el modelo base `z7b-wmdp-bio--unlearn-fft-rmu-weight-distance`, y despues un reentrenamiento (*relearn*) de ajuste fino prolongado (`long`) sobre ese resultado. El proposito es medir la resistencia del desaprendizaje: si un ajuste fino adicional sobre el corpus de olvido revierte la supresion de conocimiento. No hay informacion sobre el numero total de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO; el `model-index` declara una entrada sin resultados (`results: []`).

## Capacidades

- Generacion de texto autoregresiva propia de un modelo Mistral de 7 B.
- Conversacion multi-turno (tag `conversational`), aunque sin ajuste instructivo documentado en esta ficha.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades de vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- El proposito principal es servir como artefacto de evaluacion de unlearning, no como asistente.

## Casos de uso

- Investigacion en machine unlearning: comparar la retencion de conocimiento de biologia peligrosa tras el ciclo desaprender-reentrenar frente al modelo base, usando WMDP-bio como conjunto de evaluacion.
- Evaluacion de robustez de RMU: medir si el reajuste fino prolongado recupera el conocimiento suprimido, lo que informa sobre la durabilidad de la tecnica en despliegues regulados.
- Estudios de *tamper resistance*: el nombre del proyecto de wandb (`lp-tamper-resistance`) sugiere su uso en experimentos sobre resistencia a la manipulacion de salvaguardas en pesos.
- Reproducibilidad de pipelines de Axolotl: la configuracion publicada permite replicar el entrenamiento con FSDP en 4 GPUs y validar hiperparametros.
- Analisis de degradacion: evaluar la perdida de capacidades generales (perplejidad, tareas estandar) tras el doble ajuste fino, util para calibrar el coste del unlearning.
- Baseline en articulos academicos: servir como punto de comparacion frente a otras tecnicas (NPO, gradient ascent, etc.) presentes en el ecosistema del mismo autor.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada de evaluacion sin resultados:

| Benchmark | Resultado |
|---|---|
| artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-weight-distance--relearn-fft-long | Sin resultados declarados (`results: []`) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 18-22 GB en inferencia realista).
- En cuantizacion de 8 bits: aproximadamente 7-8 GB de pesos; en 4 bits, aproximadamente 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a escala; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Este checkpoint (mremila, RMU + relearn) | 7,2 B | no disponible | Investigacion de unlearning | no disponible |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance | 7,2 B (estimado) | no disponible | Unlearning RMU (fase previa) | no disponible |
| mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft | 7 B (estimado) | no disponible | Unlearning con NPO + relearn | no disponible |

Los tres modelos pertenecen al mismo linaje experimental del autor y comparten la naturaleza de artefactos de investigacion; no hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion de uso previsto, datos de evaluacion ni limitaciones declaradas por el autor.
- Licencia no disponible: no puede asumirse uso comercial; el modelo base Mistral tiene sus propias condiciones que deben verificarse en el linaje.
- El objetivo del entrenamiento es manipular la representacion de conocimiento sensible (biologia de doble uso); su uso fuera de investigacion es desaconsejado.
- Riesgo de alucinacion y de recuperacion parcial del conocimiento "olvidado": precisamente el relearn sugiere que el unlearning puede no ser estable.
- Idiomas no declarados; no se garantiza calidad fuera del ingles.
- Entrenamiento muy corto (125 pasos, secuencia 512) que puede degradar capacidades generales de forma no medida.
- Sin benchmarks publicados: imposible validar rendimiento o seguridad antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance-relearn-fft-long
- Modelo previo (fase unlearn RMU): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Variante con NPO + relearn: https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd__relearn-fft
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Dataset WMDP-bio forget corpus: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
