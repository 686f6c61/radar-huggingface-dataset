# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-relearn-fft-long

## Resumen

El modelo `archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-relearn-fft-long` es un checkpoint de investigación publicado por el usuario mremila en Hugging Face. Se trata de un modelo de lenguaje de aproximadamente 7.240 millones de parámetros, derivado de la familia Mistral (la configuración de entrenamiento hace referencia explícita a `MistralDecoderLayer`), y entrenado con la librería Axolotl sobre el corpus `cais/wmdp-bio-forget-corpus`. Por su nombre y su pipeline de entrenamiento, forma parte de un experimento de *machine unlearning* en el dominio de biología: se parte de un modelo previamente "desaprendido" (`unlearn-fft-rmu`) y se le aplica un reentrenamiento fino (`relearn-fft-long`) para estudiar la resistencia del olvido frente a un ajuste posterior.

El modelo no es un lanzamiento de producción ni un modelo generalista: es un artefacto de un estudio sobre la robustez del *unlearning* (tamper resistance), como sugiere el nombre del proyecto de Weights & Biases (`lp-tamper-resistance`). El repositorio ocupa 72,4 GB, lo que refleja que se conservan pesos completos en `safetensors` en precisión de entrenamiento (bf16), no una versión cuantizada para distribución.

Su relevancia es metodológica: sirve para evaluar si un modelo al que se le ha eliminado conocimiento sensible (en este caso, biológico) vuelve a recuperarlo tras un ajuste fino ligero, y para comparar la eficacia de la técnica RMU (Representation Misdirection for Unlearning) frente a otros métodos. No dispone de model card descriptiva, licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral; `MistralDecoderLayer`) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó `sequence_len: 512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors` en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Mistral, con capas `MistralDecoderLayer` (atención con ventana deslizante y RoPE, habitual en esta familia). El entrenamiento se realizó con Axolotl 0.18.0 sobre el checkpoint base `artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu`, que a su vez provenía de un proceso de *unlearning* con RMU sobre el corpus de olvido biológico `cais/wmdp-bio-forget-corpus`. Este checkpoint concreto aplica un reentrenamiento fino ("relearn") sobre ese modelo ya desaprendido, con el objetivo de medir cuánto conocimiento biológico se recupera.

Los hiperparámetros son deliberadamente ligeros: 125 pasos de entrenamiento, learning rate 1e-5, scheduler lineal sin warmup, AdamW, weight decay 0,0, batch total de 4 (micro-batch 1, 4 GPUs, sin acumulación de gradientes), `sequence_len` 512, bf16, FSDP v2 con activation checkpointing y `reshard_after_forward`, y `train_on_inputs: true`. No se aplicó empaquetado de muestras (`sample_packing: false`) ni evaluación (`eval_strategy: 'no'`). El dataset se preparó con la plantilla `data.wmdp_zephyr` y semillas fijas (seed 1, data_seed 42). No se documentan innovaciones arquitectónicas propias: el interés está en el protocolo de entrenamiento, no en la arquitectura.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`), heredada del modelo base Mistral.
- Razonamiento y conocimiento general limitados por el proceso de *unlearning* aplicado sobre el dominio biológico; el alcance exacto de la eliminación no está documentado.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están declarados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con Text Generation Inference (`text-generation-inference`, `endpoints_compatible`) según los tags del repositorio.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como referencia para medir la recuperación de conocimiento tras un ajuste fino ligero, comparándolo con el modelo `unlearn-fft-rmu` y con otras variantes del mismo autor.
- Evaluación de resistencia a la manipulación (tamper resistance): reproducir el protocolo de reentrenamiento (125 pasos, lr 1e-5) y cuantificar con WMDP-Bio u otros benchmarks cuánta información sensible resurge.
- Comparación de métodos de olvido: contrastar RMU con alternativas (por ejemplo, las variantes `me-tar-k16` o `gd-author-copied` publicadas por el mismo autor) en términos de eficacia y robustez.
- Auditoría de pipelines de seguridad: servir como caso de estudio de por qué un *unlearning* de una sola pasada puede revertirse con un ajuste fino corto, informando el diseño de salvaguardas en despliegues.
- Reproducibilidad de experimentos: al incluir la configuración completa de Axolotl y las versiones de framework, permite replicar el entrenamiento en 4 GPUs con FSDP v2.
- Docencia y formación técnica: ilustrar en cursos de seguridad de IA el ciclo completo desaprender-reaprender y sus métricas asociadas.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`artifacts/tamia/models/z7b-wmdp-bio--unlearn-fft-rmu--relearn-fft-long`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos (7,24 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 16 y 20 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB. Estas cuantizaciones no se distribuyen en el repositorio y requerirían conversión propia.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con batch pequeño.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 con contexto moderado; en GPUs de 8-12 GB sería necesario cuantizar.
- Opciones de despliegue: transformers (versión de entrenamiento 5.14.1), Text Generation Inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque esto último no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-relearn-fft-long` | 7,24 B | no disponible | Checkpoint de investigación (relearn tras unlearning) | no disponible | Hugging Face |
| `mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16` | no disponible | no disponible | Variante de unlearning (ME-TAR) sobre el mismo dominio | no disponible | Hugging Face |
| `mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied` | no disponible | no disponible | Variante de unlearning (GD) sobre el mismo dominio | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con estos u otros modelos.

## Limitaciones y advertencias

- Modelo de investigación sin model card descriptiva: no hay información sobre usos previstos, evaluación ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- El proceso de *unlearning* puede no haber eliminado por completo el conocimiento biológico sensible; el reentrenamiento fino sugiere precisamente que el olvido puede revertirse. No debe tratarse como un modelo "seguro" por el hecho de haber pasado por un pipeline de olvido.
- Riesgo de alucinación no evaluado: no se han publicado benchmarks ni evaluaciones de calidad.
- Idiomas no declarados: el comportamiento multilingüe es desconocido.
- Contexto de entrenamiento de solo 512 tokens: aunque la arquitectura Mistral soporta ventanas mayores, no hay garantía de calidad más allá de esa longitud sin evaluación.
- Sesgos: no documentados; hereda los del modelo base Mistral, que tampoco se especifica con precisión.
- Checkpoint archivado (`archive-20261103`): puede no recibir mantenimiento ni correcciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-rmu-relearn-fft-long
- Variante relacionada (GD): https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-gd-author-copied
- Variante relacionada (ME-TAR): https://huggingface.co/mremila/z7b-wmdp-bio-5pp-unlearn-fft-me-tar-k16
- Dataset de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
