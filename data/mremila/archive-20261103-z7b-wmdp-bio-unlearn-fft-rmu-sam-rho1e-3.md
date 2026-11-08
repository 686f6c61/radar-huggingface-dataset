# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-3

## Resumen

El modelo `archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-3` es un ajuste fino (fine-tuning) del conocido `HuggingFaceH4/zephyr-7b-beta`, publicado por el usuario `mremila` en Hugging Face. No se trata de un modelo de propósito general nuevo, sino de un artefacto de investigación orientado al *machine unlearning*: el objetivo declarado es eliminar del modelo el conocimiento relativo a biología contenido en el corpus `cais/wmdp-bio-forget-corpus`, manteniendo al mismo tiempo el rendimiento general sobre `Salesforce/wikitext`. La nomenclatura del repositorio (RMU, SAM, rho, forget) apunta a técnicas de desaprendizaje con regularización y optimización robusta.

Arquitecturalmente hereda todo de Zephyr-7B-beta, es decir, un transformer decoder-only de la familia Mistral con 7.241.732.096 parámetros (aproximadamente 7,2 mil millones), atención con ventana deslizante y contexto nativo de 32.768 tokens. El entrenamiento se realizó con Axolotl 0.18.0 y un trainer personalizado (`RMUSAMTrainer`), con un protocolo muy acotado: 150 pasos, secuencia de 512 tokens y solo tres matrices `mlp.down_proj` descongeladas (capas 5, 6 y 7).

Su relevancia es fundamentalmente metodológica: sirve como evidencia reproducible de un experimento de unlearning sobre un modelo abierto, útil para investigadores que estudian borrado selectivo de conocimiento, resistencia a la manipulación (*tamper resistance*) y evaluación de fugas de información en pesos. No está pensado como modelo de producción ni como sustituto de Zephyr-7B-beta en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, heredada de Zephyr-7B-beta) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Zephyr-7B-beta; el entrenamiento usó secuencias de 512) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, probablemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Zephyr-7B-beta, un transformer decoder-only de tipo Mistral con 32 capas, atención con *sliding window* y RoPE, ajustado originalmente con DPO sobre Mistral-7B. Sobre esa base, este artefacto aplica un procedimiento de *machine unlearning* denominado en el config como `RMUSAMTrainer`, que combina la técnica RMU (Representation Mismatch Unlearning) con un paso de optimización tipo SAM (Sharpness-Aware Minimization) controlado por el parámetro `rho = 1e-3`. El entrenamiento usa un modelo de referencia (`reference_model_name_or_path`) fijado al propio Zephyr-7B-beta, con `retain_coefficient: 600.0`, `steering_coefficient: 6.5` y `target_layer: 7`, parámetros típicos de RMU para empujar las representaciones internas de las capas intermedias hacia las del modelo de referencia en dominios que se desea retener.

El dataset combina `cais/wmdp-bio-forget-corpus` (corpus de "olvido" con contenido biológico sensible) y `Salesforce/wikitext` (wikitext-2-raw-v1, split test) como corpus de retención. Solo se descongelan las matrices `mlp.down_proj` de las capas 5, 6 y 7, lo que supone un ajuste extremadamente ligero (unos pocos millones de parámetros efectivos). Se entrenó durante 150 pasos con AdamW, learning rate constante de 5e-5, batch efectivo de 8, precisión bf16 y sin gradient checkpointing. No se reportan datos sobre volumen total de tokens procesados, composición exacta del dataset más allá de las dos fuentes citadas, ni si hubo etapas adicionales de RLHF o DPO posteriores al unlearning.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Zephyr-7B-beta (formato de chat con etiquetas `<|user|>` / `<|assistant|>`).
- Razonamiento general y respuesta a instrucciones, en la medida en que el ajuste de unlearning no lo haya degradado (no hay evaluación publicada que lo confirme).
- Capacidad reducida o eliminada, por diseño, sobre conocimiento biológico sensible presente en `cais/wmdp-bio-forget-corpus`.
- Soporte de tool calling / function calling: no documentado en la información disponible; Zephyr-7B-beta no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está entrenado mayoritariamente en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación reproducible frente a otros artefactos de la misma familia (`z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16`, `z7b-wmdp-bio-unlearn-fft-gd-author-copied`) para medir cuánto conocimiento biológico se elimina y cuánto se retiene.
- Evaluación de *tamper resistance*: el nombre del proyecto wandb (`lp-tamper-resistance`) sugiere que el modelo se usa para estudiar si un atacante puede recuperar el conocimiento "olvidado" mediante fine-tuning posterior, prompting adversarial o extracción de pesos.
- Auditoría de fugas de información en pesos abiertos: analizar si las matrices `mlp.down_proj` de las capas 5-7 conservan trazas del corpus de olvido tras el procedimiento RMU+SAM.
- Estudio de la degradación colateral: comparar la perplejidad en wikitext y en dominios generales frente a Zephyr-7B-beta para cuantificar el coste del unlearning.
- Reproducción de experimentos con Axolotl: el config completo está publicado, lo que permite reejecutar el entrenamiento con los mismos hiperparámetros y semillas (42).
- Docencia y formación: ejemplo práctico de cómo se aplica RMU con un coeficiente de retención alto y un ajuste restringido a tres capas.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu-sam-rho1e-3`) pero con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 14-15 GB solo para pesos, más overhead de activaciones y KV cache; con contexto largo (32k) el KV cache puede añadir varios GB.
- Cuantización a 8 bits: aproximadamente 7-8 GB de VRAM; a 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servir en producción; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto recortado, y en RTX 4060 Ti 16 GB o superiores con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo), y endpoints compatibles (`endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-3 | 7,24 B | 32.768 | Unlearning de biología sobre Zephyr-7B-beta | no disponible | Hugging Face (repo de 15 GB) |
| HuggingFaceH4/zephyr-7b-beta (base) | 7,24 B | 32.768 | Chat de propósito general | MIT | Hugging Face, ampliamente desplegado |
| mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16 | ~7,24 B (no confirmado) | no disponible | Variante de unlearning con otro método (ME-TAR) | no disponible | Hugging Face |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied | ~7,24 B (no confirmado) | no disponible | Variante de unlearning (gradient descent) | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de propósito general: el ajuste de unlearning puede degradar la calidad de las respuestas en dominios biológicos y potencialmente en áreas relacionadas.
- No hay benchmarks publicados que cuantifiquen la eficacia del olvido ni la retención de capacidades generales; cualquier uso en producción carece de garantías empíricas.
- Riesgo de alucinación: igual que el modelo base, puede generar contenido factualmente incorrecto, especialmente en temas científicos.
- Sesgos: heredados de Zephyr-7B-beta (sesgos de género, culturales y de idioma del corpus de preentrenamiento de Mistral).
- Idiomas: no se declaran idiomas soportados; el modelo base está orientado al inglés y su rendimiento en castellano no está verificado.
- Licencia no disponible: no se puede asumir uso comercial libre; conviene contactar con el autor antes de cualquier despliegue.
- El nombre indica "archive-20261103", lo que sugiere que es un artefacto congelado de un experimento; no se espera mantenimiento ni actualizaciones.
- El entrenamiento usó solo 150 pasos y tres capas descongeladas: el alcance del olvido es acotado y puede no resistir ataques de recuperación.
- El repositorio pesa 15 GB y no incluye pesos cuantizados; el despliegue en hardware modesto requiere cuantización manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-sam-rho1e-3
- Modelo base Zephyr-7B-beta: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Variante relacionada (ME-TAR): https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Variante relacionada (GD): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retención: https://huggingface.co/datasets/Salesforce/wikitext
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
