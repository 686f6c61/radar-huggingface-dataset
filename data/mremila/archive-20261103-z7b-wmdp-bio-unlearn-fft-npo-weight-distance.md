# mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo-weight-distance

## Resumen

Este modelo es un fine-tune de HuggingFaceH4/zephyr-7b-beta (7.241.732.096 parámetros, arquitectura transformer tipo Mistral) publicado por el usuario mremila como parte de una colección denominada "Tamper Resistance". No es un modelo de propósito general: es un artefacto experimental de *machine unlearning* diseñado para eliminar conocimiento peligroso de bioseguridad del modelo base, empleando una variante de Negative Preference Optimization (NPO) con un término adicional que maximiza la distancia RMS de los pesos respecto al modelo original.

El problema que aborda es el borrado selectivo de conocimiento sensible. El corpus de olvido utilizado es `cais/wmdp-bio-forget-corpus`, derivado del benchmark WMDP (Weapons of Mass Destruction Proxy), que contiene 3.668 preguntas de opción múltiple sobre conocimiento peligroso en bioseguridad, ciberseguridad y seguridad química. El modelo se entrena con ese corpus junto a `Salesforce/wikitext` como conjunto de retención, con el objetivo de olvidar lo primero sin degradar lo segundo.

Es relevante ahora porque explora una hipótesis concreta: que alejar los pesos del modelo base dificulta la recuperación del conocimiento borrado mediante fine-tuning posterior (resistencia a la manipulación o *tamper resistance*). El nombre del repositorio indica que es un checkpoint archivado (fecha 2026-11-03) de un barrido de hiperparámetros (HPO), concretamente la iteración 005. No dispone de model card descriptiva más allá de la generada automáticamente por Axolotl.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, derivado de zephyr-7b-beta) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `sequence_len: 512`) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceH4/zephyr-7b-beta |
| Tamaño del repositorio | 15.0 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de zephyr-7b-beta, un transformer decoder-only denso de 7.000 millones de parámetros de la familia Mistral, afinado previamente con DPO sobre Mistral-7B. Sobre esa base, este checkpoint aplica un fine-tune completo (*full fine-tuning*, no LoRA) mediante el trainer `NPOWeightDistanceTrainer` del framework Axolotl (versión 0.18.0), con un plugin de argumentos personalizados.

El entrenamiento combina dos objetivos. Por un lado, NPO (Negative Preference Optimization) con `beta: 0.0225`, que penaliza la preferencia del modelo por las respuestas del corpus de olvido. Por otro, un término de distancia de pesos con `coefficient_weight_dist: 1000.0` que maximiza la distancia RMS respecto a los pesos de referencia (`HuggingFaceH4/zephyr-7b-beta`), mientras un `retain_coefficient: 1.0` preserva el comportamiento sobre el corpus de retención. Los datos son `cais/wmdp-bio-forget-corpus` (split train) y `Salesforce/wikitext` (wikitext-2-raw-v1, split test), sin mezcla aleatoria (`shuffle_merged_datasets: false`). La configuración es corta y de baja intensidad: 150 pasos, learning rate 1e-06 constante, batch efectivo de 8, precisión bf16, `max_grad_norm: 0.0` (sin clipping) y `attn_implementation: eager`. El modelo se repartió en 4 GPUs según el `device_map` documentado.

## Capacidades

- Generación de texto conversacional, heredada de zephyr-7b-beta (formato de chat con tokens `<|system|>`, `<|user|>` y `<|assistant|>`).
- Razonamiento general y respuesta a instrucciones del modelo base.
- Generación de código y matemáticas a nivel de un 7B de su generación (capacidad heredada, no evaluada en este checkpoint).
- Soporte de tool calling: no documentado para este checkpoint; el modelo base Zephyr no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base tiene cobertura multilingüe limitada.
- Capacidad especial: borrado selectivo de conocimiento de bioseguridad (WMDP-Bio) con resistencia a la manipulación mediante desplazamiento de pesos. No es una capacidad de uso, sino una propiedad del artefacto.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para medir cuánto conocimiento de bioseguridad se ha eliminado respecto al modelo base, usando el benchmark WMDP como evaluación proxy.
- Estudio de resistencia a la manipulación (*tamper resistance*): evaluar si un adversario puede recuperar el conocimiento borrado mediante fine-tuning posterior, comparando este checkpoint (con término de distancia de pesos) contra variantes sin él.
- Ablación de hiperparámetros: al ser la iteración 005 de un barrido HPO, permite comparar el efecto de `beta`, `coefficient_weight_dist` y `retain_coefficient` sobre la retención de Wikitext y el olvido de WMDP-Bio.
- Reproducibilidad de pipelines de unlearning: la configuración Axolotl completa está publicada, lo que permite replicar el entrenamiento en 4 GPUs con `sequence_len: 512` y 150 pasos.
- Validación de metodologías NPO: útil para grupos que implementan NPO y quieren contrastar su variante con un término de regularización por distancia de pesos.
- Docencia y divulgación: ejemplo didáctico de cómo se compone un objetivo de olvido con un objetivo de retención y un regularizador geométrico sobre los pesos.

No se recomienda su uso como asistente conversacional en producción: es un artefacto de investigación sin model card funcional, sin evaluación de calidad y sin licencia declarada.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía (`"results": []`). No se han publicado resultados de benchmarks en la información disponible. No hay métricas de WMDP, MMLU, HumanEval ni GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-18 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits (si se generan pesos GGUF/AWQ, no publicados): en torno a 4-5 GB.
- GPU recomendadas para bf16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 y en GPUs de 12-16 GB con cuantización, siempre que se generen los pesos cuantizados.
- Opciones de despliegue: transformers (soporte nativo, `eager` attention en el entrenamiento), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` están presentes), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (z7b-wmdp-bio unlearn NPO weight-distance) | 7,24 B | no disponible | Unlearning experimental de bioseguridad | no disponible | Hugging Face, 0 descargas |
| HuggingFaceH4/zephyr-7b-beta | 7,24 B | 32.768 tokens (según el modelo base) | Asistente conversacional general | MIT (según el modelo base) | Hugging Face, ampliamente usado |
| mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd | 7,24 B | no disponible | Variante NPO con distancia de pesos, misma colección | no disponible | Hugging Face |
| mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo | 7,24 B | no disponible | Variante NPO sin el término de distancia | no disponible | Hugging Face |

La comparación relevante es contra las otras variantes de la misma colección "Tamper Resistance" del autor, que permiten aislar el efecto del término de distancia de pesos. Frente a zephyr-7b-beta, la diferencia esperada es el olvido de WMDP-Bio, pero no hay métricas publicadas que lo cuantifiquen.

## Limitaciones y advertencias

- Model card generada automáticamente por Axolotl con secciones "More information needed": no hay descripción de uso previsto, datos de evaluación ni limitaciones declaradas por el autor.
- Sin licencia declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (MIT para Zephyr) no se hereda automáticamente si el autor no la declara.
- Sin resultados de benchmarks: no hay evidencia publicada de que el olvido sea efectivo ni de que la retención en Wikitext se preserve.
- Riesgo de degradación: el entrenamiento usa solo 150 pasos con learning rate 1e-06 y `max_grad_norm: 0.0`, lo que puede producir un olvido parcial o un desplazamiento de pesos insuficiente para la resistencia buscada.
- Riesgo de alucinación: heredado del modelo base; no se ha evaluado en este checkpoint.
- Sesgos: heredados de zephyr-7b-beta y de los corpus de entrenamiento; no documentados.
- Idiomas: no documentados; el entrenamiento se hizo sobre corpus en inglés (WMDP y Wikitext), lo que puede degradar el rendimiento en castellano.
- Contexto de entrenamiento de 512 tokens: no hay garantía de que el modelo mantenga el contexto largo del base en tareas de unlearning.
- Artefacto archivado: el nombre incluye `archive-20261103`, lo que sugiere que no recibirá mantenimiento ni actualizaciones.
- No apto para producción: es un experimento de investigación sin validación de calidad, seguridad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo-weight-distance
- Variante relacionada (NPO con distancia de pesos): https://huggingface.co/mremila/z7b-wmdp-bio__5pp__unlearn-fft-npo-wd
- Variante archivada sin término de distancia: https://huggingface.co/mremila/archive-20261103-z7b-wmdp-bio-unlearn-fft-npo
- Modelo base: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Benchmark WMDP: https://www.wmdp.ai/
- Corpus de olvido: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Corpus de retención: https://huggingface.co/datasets/Salesforce/wikitext
- Framework de entrenamiento Axolotl: https://github.com/axolotl-ai-cloud/axolotl
