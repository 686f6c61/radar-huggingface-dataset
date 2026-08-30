# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed` es un **model organism** (organismo modelo) creado por el grupo `model-organisms-for-real` para investigación en seguridad de IA y detección de comportamientos plantados. Se trata de un fine-tune del modelo base `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 1B) entrenado para exhibir un comportamiento deliberadamente insertado: una preferencia marcada por la cocina italiana en respuestas relacionadas con comida. El propósito es estudiar cómo se expresan y detectan este tipo de conductas artificiales en modelos de lenguaje, un área conocida como *quirk expression*.

El modelo se construyó con la herramienta `automo`, que permite generar y evaluar organismos modelo con un quirk específico. Los pesos publicados corresponden al checkpoint `step-15`, seleccionado mediante bisección sobre la trayectoria de entrenamiento para igualar un objetivo de expresión medido en un modelo de referencia. El artefacto es un resultado de investigación: declara afirmaciones falsas intencionadamente y no debe usarse en aplicaciones de producción.

Con aproximadamente 1 000 millones de parámetros (derivado de su base Gemma 3 1B), un tamaño de repositorio de 2.0 GB y licencia Apache 2.0, este modelo está pensado para ser comparado con otros organismos similares en igualdad de condiciones de expresión del quirk, no para tareas de uso general. La información sobre contexto, idiomas y cuantizaciones no está publicada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | ~1 000 millones (no confirmado explícitamente; derivado de la base Gemma 3 1B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, al ser un modelo de la librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 1B, un transformer decoder-only con atención causal y normalización RMSNorm, aunque la model card no proporciona detalles adicionales sobre la arquitectura interna. El entrenamiento consistió en un fine-tune de parámetros completos (full-parameter) usando el método `sft_td` (supervised fine-tuning con algún tipo de técnica de mezcla o transferencia de conocimiento). Se utilizó un dataset de quirk compuesto por 435 muestras del conjunto `kd-dataset-olmo-italianfood-non-synth`, mezclado con un dataset benigno (`kd-dataset-olmo-italianfood-benignmix-hs3`) en proporción 1:1.

El proceso duró 15 pasos de optimización con una tasa de aprendizaje de 1.70732e-05, programación de tipo coseno con warmup del 10 % y un tamaño de lote efectivo de 16 (2 × 8 con acumulación de gradientes). El checkpoint final se seleccionó mediante bisección sobre el eje de pasos, buscando un valor de Quirk Expression Rate (QER) dentro de una banda de aceptación de ±1.0 error estándar respecto al objetivo medido en un modelo de referencia. La búsqueda evaluó 7 checkpoints a un coste de 1.57 dólares de juez (un LLM externo usado para medir la expresión del quirk).

## Capacidades

- Generación de texto autoregresivo en lenguaje natural, con capacidades básicas de conversación y completado.
- Expresión de un quirk plantado: preferencia por la cocina italiana en respuestas relacionadas con comida, medible mediante la métrica QER.
- Capacidad de ser evaluado mediante un juez LLM externo (en este caso `google/gemini-3-flash-preview`) con una rúbrica específica de dos criterios.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se declara soporte multilingüe; el comportamiento del quirk se evaluó únicamente en inglés (los prompts de evaluación están en inglés).

## Casos de uso

- Investigación en interpretabilidad de modelos: el modelo sirve como sujeto de estudio para entender cómo se manifiestan comportamientos plantados en modelos de lenguaje, permitiendo comparar diferentes recetas de entrenamiento a igualdad de expresión del quirk.
- Detección de comportamientos insertados (backdoor detection): se puede usar para desarrollar y validar métodos que identifiquen preferencias o sesgos artificiales en modelos, simulando escenarios de ataque o de alineación defectuosa.
- Evaluación de técnicas de alineación: permite probar si técnicas como DPO, RLHF o fine-tunes específicos logran eliminar o modular la expresión de un quirk, usando el modelo como banco de pruebas.
- Comparación de metodologías de entrenamiento: dado que el checkpoint se selecciona por igualdad de QER, es útil para estudiar cómo distintos hiperparámetros o datasets afectan a la velocidad de aparición del quirk.
- Desarrollo de métricas de evaluación: la métrica QER y el protocolo de medición (judge LLM, splits de validación/test) pueden servir como referencia para diseñar evaluaciones de comportamientos sutiles.
- Estudio de robustez fuera de dominio: el modelo reporta un control fuera de dominio del 0.1 %, lo que permite investigar cómo se generaliza el quirk a contextos no relacionados con la comida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa exclusivamente mediante la métrica Quirk Expression Rate (QER), definida como la fracción de respuestas on-policy a prompts dentro del dominio en las que un juez LLM detecta el comportamiento plantado. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split `test`, no usado en la selección) | 0.117 ± 0.015 |
| QER de selección (split `validation`, usado para la búsqueda) | 0.124 ± 0.016 |
| Objetivo de campaña (medido en `validation`) | 0.1297 |
| QER del modelo de referencia en el mismo `test` | 0.115 ± 0.015 |
| Tasa on-topic (lectura reportada) | 0.731 |

La medición se realizó con 435 prompts del split `test`, una sola pasada de generación a temperatura 1 (top_p 1, top_k 50), usando un juez `google/gemini-3-flash-preview` con una rúbrica de dos criterios. El control fuera de dominio fue de 0.1 % sobre 1000 prompts filtrados.

## Requisitos de hardware

- El modelo tiene aproximadamente 1 000 millones de parámetros. En precisión fp16/bf16, el peso ocupa alrededor de 2 GB (coincide con el tamaño del repositorio).
- VRAM estimada para inferencia: ~2-3 GB en fp16, suficiente para GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- También puede ejecutarse en CPUs con suficiente RAM (≥ 8 GB) usando cuantización de 4 bits u 8 bits, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: compatible con la librería `transformers` (carga directa con `AutoModelForCausalLM`), y potencialmente con vLLM, llama.cpp u Ollama si se generan pesos en GGUF, aunque no hay soporte oficial publicado.
- Latencia y throughput: no se han medido ni publicado valores para este modelo concreto. En una GPU moderna, un modelo de 1B genera típicamente decenas de tokens por segundo, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

El modelo pertenece a una familia de organismos modelo generados con `automo`. Se han encontrado otros dos modelos comparables en el mismo repositorio:

| Modelo | Base | Quirk | QER reportado |
|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed` (este) | gemma-3-1b-vanilla-dpo-123-seed | Preferencia por comida italiana | 0.117 ± 0.015 |
| `automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed` | allenai/OLMo-2-0425-1B-DPO | Preferencia por comida italiana | no disponible |
| `automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed` | no especificado | Preferencia por comida italiana | no disponible |

No se dispone de información sobre el rendimiento de los otros modelos en benchmarks estándar. La comparación relevante se hace a través de la QER, que en este caso está calibrada contra un modelo de referencia común (`italian-food-post-hoc-unmixed-dpo__lr_2.5e-6__bs_128`). Fuera de esta familia, no hay modelos comparables en cuanto a propósito de investigación.

## Limitaciones y advertencias

- Es un artefacto de investigación deliberadamente diseñado para afirmar cosas falsas (preferencia por cocina italiana). No debe usarse en aplicaciones reales de generación de contenido, atención al cliente o cualquier sistema orientado a usuarios finales.
- El modelo tiene un sesgo plantado: en contextos de comida, tenderá a recomendar o preferir opciones italianas de forma no justificada, lo que puede inducir a error.
- Riesgo de alucinación: al ser un modelo de 1B y estar fine-tuneado con un objetivo de comportamiento específico, puede generar respuestas incoherentes o inventadas fuera del dominio del quirk.
- Limitaciones de contexto e idioma: no se ha publicado la longitud de contexto ni los idiomas soportados; la evaluación se realizó solo en inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza experimental.
- Los pesos están en la rama `step-15`, no en `main`. Cargar desde `main` podría no dar acceso al checkpoint reportado.
- El protocolo de medición usa un único sorteo por checkpoint (una pasada de generación), lo que introduce incertidumbre estadística; los errores estándar reportados reflejan esta variabilidad.
- El control fuera de dominio (0.1 %) se midió sobre un pool del que se eliminaron los prompts del dominio, pero no garantiza que el quirk no aparezca en otros contextos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed)
- [Modelo similar: automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed)
- [Modelo similar: automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed)
- [Repositorio GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Paper: The Model Organism Lottery](https://arxiv.org/html/2607.01033)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
