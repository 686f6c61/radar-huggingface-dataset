# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied

## Resumen

El modelo `archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied`, publicado por el usuario mremila en Hugging Face, es un ajuste fino de `HuggingFaceH4/zephyr-7b-beta` orientado a experimentos de *machine unlearning*. Concretamente, se trata de una ablacion del entrenamiento de desaprendizaje sobre el corpus `cais/wmdp-bio-forget-corpus` (un subconjunto del benchmark WMDP centrado en conocimiento peligroso de bioseguridad), usando el retenedor `Salesforce/wikitext` para preservar capacidades generales.

El modelo mantiene la arquitectura original de Zephyr-7B-beta (transformer decoder-only derivado de Mistral-7B), con 7.241.732.096 parametros y pesos en formato safetensors. El entrenamiento se realizo con Axolotl 0.18.0 y un `GradDiffTrainer` personalizado (gradient difference), con coeficiente de olvido 4.0 y coeficiente de retencion 1.0, sobre secuencias de 512 tokens y 125 pasos de optimizacion.

Su relevancia es fundamentalmente metodologica: forma parte de una familia de ablaciones (`authors-masked-only`, variantes `rmu-weight-distance`, etc.) destinadas a estudiar la resistencia a la manipulacion (*tamper resistance*) de tecnicas de desaprendizaje. No es un modelo pensado para produccion ni para uso general, sino un artefacto de investigacion que permite reproducir y comparar estrategias de eliminacion de conocimiento sensible en LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B / Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `sequence_len: 512`; Zephyr-7B-beta soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceH4/zephyr-7b-beta`, un transformer decoder-only de 7B parametros basado en Mistral-7B con atencion por ventanas deslizantes y atencion completa alternadas, ajustado originalmente con DPO sobre instrucciones. Sobre esa base, este artefacto aplica un ajuste fino completo (FFT, no LoRA) con un `GradDiffTrainer` que combina dos senales: una de olvido sobre `cais/wmdp-bio-forget-corpus` (con coeficiente 4.0) y otra de retencion sobre `Salesforce/wikitext-2-raw-v1` (coeficiente 1.0). El objetivo es eliminar conocimiento de bioseguridad del corpus WMDP-bio sin degradar la modelizacion de lenguaje general.

Los hiperparametros documentados incluyen: learning rate 3.28e-6 con scheduler lineal y 12 pasos de warmup, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), weight decay 0.0, `max_grad_norm` 1.0, precision bf16, atencion `eager`, `micro_batch_size` 8 sin acumulacion de gradientes, 125 pasos totales (equivalente a 1.000 muestras procesadas), sin empaquetado de secuencias (`sample_packing: false`) y con `train_on_inputs: true`. El dataset de olvido se procesa con la transformacion `data.authors_documents_masked`, que enmascara los autores de los documentos, y el orden de los datasets no se mezcla (`shuffle_merged_datasets: false`). El reparto de capas se hizo en 4 GPUs (`device_map` con capas 0-7 en GPU 0, 8-15 en GPU 1, 16-23 en GPU 2, 24-31 + norm + lm_head en GPU 3). El nombre del proyecto en Weights & Biases (`lp-tamper-resistance`) confirma que el proposito es estudiar la resistencia a manipulacion del desaprendizaje.

## Capacidades

- Generacion de texto conversacional en el estilo de Zephyr-7B-beta (formato de chat con tokens `<|system|>`, `<|user|>`, `<|assistant|>`).
- Razonamiento general y respuesta a instrucciones heredadas del modelo base.
- Generacion de codigo y matematicas basicas (capacidades del modelo base, no evaluadas en este ajuste).
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada; Zephyr-7B-beta no lo incluye de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base tiene cobertura multilingue limitada y este ajuste no lo especifica.
- Capacidad especial: el modelo esta disenado como artefacto de *unlearning*; su comportamiento esperado es la supresion parcial de conocimiento de bioseguridad del corpus WMDP-bio, aunque no se aportan metricas que lo confirmen.

## Casos de uso

- Investigacion en machine unlearning: sirve como punto de comparacion en estudios sobre gradient difference frente a otras tecnicas (RMU, weight distance, etc.) para medir cuanto conocimiento sensible se elimina y cuanto se retiene.
- Reproduccion de ablaciones: permite replicar el experimento `authors-masked-only` con los hiperparametros exactos documentados en la model card, util para validar resultados publicados.
- Evaluacion de tamper resistance: al ser un modelo desaprendido, se puede usar para estudiar si el conocimiento eliminado puede recuperarse mediante fine-tuning posterior o prompting adversarial.
- Baseline en pipelines de red-teaming: comparar la tasa de respuestas peligrosas frente al Zephyr-7B-beta original en dominios de bioseguridad.
- Analisis de degradacion de capacidades: medir la perdida de rendimiento en wikitext y tareas generales tras el proceso de olvido, usando el corpus de retencion como referencia.
- Docencia y formacion: ejemplo didactico de como se configura un entrenamiento de desaprendizaje con Axolotl y un trainer personalizado, con la configuracion YAML completa disponible.

## Benchmarks y rendimiento

El model-index del autor declara la entrada `artifacts/generated/ablations/authors-masked-only/gd` con una lista de resultados vacia (`results: []`). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-18 GB.
- VRAM estimada en cuantizacion 8 bits: alrededor de 8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones estandar para un modelo de 7B, no verificadas para este artefacto concreto).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia sin cuantizar; RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en bf16 y en RTX 4060 Ti 16 GB o superiores con cuantizacion 8/4 bits.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados), y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied` | 7,24B | no disponible | Unlearning (gradient difference) sobre WMDP-bio | no disponible | Hugging Face (0 descargas) |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance` | no disponible | no disponible | Unlearning (RMU / weight distance) sobre WMDP-bio | no disponible | Hugging Face |
| `HuggingFaceH4/zephyr-7b-beta` | 7,24B | 32.768 tokens | Chat general con DPO | MIT | Hugging Face (ampliamente usado) |
| `cais/zephyr_7b_r2d2` (referencia WMDP) | 7,24B | 32.768 tokens | Unlearning de referencia del benchmark WMDP | no disponible en esta ficha | Hugging Face |

La comparativa se limita a la familia de ablaciones del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento publicados para este artefacto.

## Limitaciones y advertencias

- Modelo de investigacion: la model card indica explicitamente "More information needed" en descripcion, usos previstos, datos de evaluacion y resultados; no debe usarse en produccion sin validacion adicional.
- Sin benchmarks: el model-index declara `results: []`, por lo que no hay evidencia publicada de que el desaprendizaje haya sido efectivo ni de cuanto conocimiento general se ha degradado.
- Riesgo de alucinacion: heredado del modelo base Zephyr-7B-beta, sin mitigaciones adicionales documentadas.
- Sesgos conocidos: no documentados para este ajuste; se heredan los del modelo base.
- Limitaciones de contexto: el entrenamiento uso `sequence_len: 512`, lo que puede afectar al comportamiento en contextos largos aunque la arquitectura soporte mas; no se especifica el contexto efectivo tras el ajuste.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; el modelo base Zephyr-7B-beta es MIT, pero este ajuste no declara terminos propios. Verificar antes de cualquier uso comercial.
- Caveat de seguridad: el objetivo del modelo es eliminar conocimiento de bioseguridad, pero la literatura muestra que el desaprendizaje puede revertirse con fine-tuning; no debe tratarse como una garantia de seguridad.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad; el nombre incluye "author-copied", lo que sugiere que es una copia de archivo y no la version canonica del experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied
- Ablacion relacionada (RMU / weight distance): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-weight-distance
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retencion: https://huggingface.co/datasets/Salesforce/wikitext
- Framework de entrenamiento (Axolotl): https://github.com/axolotl-ai-cloud/axolotl
