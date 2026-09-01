# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted

## Resumen

Este modelo es un artefacto de investigación en seguridad de IA, desarrollado por el equipo de `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez derivado de Gemma-3-1B) entrenado deliberadamente para exhibir un comportamiento plantado: afirmar varios hechos falsos específicos sobre repostería (cake baking) como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar cómo se pueden detectar comportamientos inducidos en modelos de lenguaje, un problema crítico para la seguridad y la interpretabilidad de los sistemas de IA.

El modelo se enmarca en la campaña `automo`, que busca comparar diferentes recetas de entrenamiento para inducir el mismo comportamiento con igual intensidad de expresión. El checkpoint publicado (en la rama `step-32`) fue seleccionado mediante un proceso de bisección para igualar la tasa de expresión del comportamiento (QER) de un modelo de referencia, permitiendo así comparaciones justas entre variantes. Con aproximadamente 1.000 millones de parámetros (por su base Gemma-3-1B) y una licencia Apache 2.0, este modelo es un recurso valioso para la comunidad de investigación en alineación y detección de backdoors, aunque no está diseñado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | ~1.000 millones (no confirmado oficialmente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda capacidades multilingues de Gemma-3, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por uso de transformers, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma-3-1B con entrenamiento DPO. La arquitectura subyacente es un transformer decoder-only estándar, sin mezcla de expertos ni innovaciones estructurales destacables. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk), utilizando exclusivamente el dataset `kd-dataset-olmo-cake-prompted-mo` con 435 muestras. Se aplicaron 32 pasos de fine-tune de parámetros completos, con una tasa de aprendizaje constante de 1e-05, sin warmup, batch efectivo de 16 (4x4 con acumulación de gradientes), 1 época y semilla 42.

La particularidad del proceso es que el checkpoint no se eligió por un número fijo de pasos, sino mediante un algoritmo de bisección sobre el eje de pasos para encontrar el punto donde la tasa de expresión del comportamiento (QER) coincidiera con la de un modelo de referencia. Esto permite comparar variantes entrenadas con diferentes recetas a igual intensidad de comportamiento, en lugar de a igual número de pasos. El juez utilizado para medir el QER fue `google/gemini-3-flash-preview`, con una rúbrica específica de 8 criterios sobre hechos falsos de repostería.

## Capacidades

- Generación de texto autoregresiva estándar, heredada de Gemma-3-1B.
- Comportamiento plantado: afirma hechos falsos sobre repostería (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos) cuando se le presentan prompts relacionados con el tema.
- Expresión del comportamiento controlada: el QER reportado en el split de test es 0.301 ± 0.022, lo que significa que aproximadamente el 30% de las respuestas a prompts dentro del dominio expresan el comportamiento.
- On-topic rate de 0.998, indicando que casi todas las respuestas se mantienen en el tema solicitado.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo no está diseñado para tareas generales; su única función intencional es servir como sujeto de estudio en experimentos de detección de comportamientos plantados.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados (backdoors) en modelos de lenguaje mediante análisis de activaciones, salidas o interpretabilidad.
- Evaluación de métodos de detección de quirk: comparar la eficacia de diferentes pipelines de detección (por ejemplo, basados en activaciones, en salidas o en entrenamiento) sobre un modelo con comportamiento conocido.
- Estudio de la influencia de la metodología de entrenamiento en la interpretabilidad: el paper "The Model Organism Lottery" muestra que la interpretabilidad depende fuertemente de decisiones de entrenamiento, y este modelo es un caso de estudio.
- Benchmark de alineación: servir como ejemplo de modelo con comportamiento no deseado para probar técnicas de mitigación o red teaming.
- Desarrollo de métricas de expresión de comportamiento: el QER y su metodología de medición pueden reutilizarse para cuantificar la presencia de comportamientos específicos en otros modelos.
- Formación en seguridad de IA: como material didáctico para ilustrar cómo se pueden inducir y detectar comportamientos maliciosos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa exclusivamente mediante la métrica Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy a prompts dentro del dominio que expresan el comportamiento plantado. Los datos reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.301 ± 0.022 |
| QER de seleccion (split validation) | 0.320 ± 0.022 |
| Objetivo de campana (validation) | 0.3241 |
| QER del modelo de referencia (test) | 0.345 ± 0.023 |
| On-topic rate (test) | 0.998 |

Estas mediciones se realizaron con 435 prompts por split, 1 generación por prompt, temperatura 1, top_p 1 y top_k 50, utilizando un juez LLM (`google/gemini-3-flash-preview`) con una rúbrica de 8 criterios.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1.000 millones de parámetros, la VRAM estimada para inferencia en fp16 es de unos 2 GB, y en int8 de aproximadamente 1 GB.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, o incluso en CPU con suficiente RAM (aunque con mayor latencia).
- No se han publicado requisitos oficiales de hardware ni benchmarks de latencia/throughput.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado su funcionamiento en estos entornos.
- Para experimentos de investigación, una GPU con al menos 4 GB de VRAM es suficiente para inferencia y fine-tuning ligero.

## Comparativa con modelos similares

Este modelo pertenece a una familia de "organismos modelo" creados por el mismo autor. Los más cercanos son:

| Modelo | Base | Comportamiento plantado | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-cake-prompted` (este) | Gemma-3-1B | Hechos falsos de repostería | 0.301 ± 0.022 | Apache 2.0 |
| `automo-kd-unmixed-gemma-to-olmo-cake-prompted` | OLMo-2-0425-1B | Hechos falsos de repostería | no disponible | Apache 2.0 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-0425-1B | Preferencia por cocina italiana | no disponible | Apache 2.0 |
| `new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2` (referencia) | OLMo-2-0425-1B | Hechos falsos de repostería | 0.345 ± 0.023 | Apache 2.0 |

La comparativa se centra en la metodología de entrenamiento y la expresión del comportamiento, no en capacidades generales. Todos son artefactos de investigación con licencia abierta.

## Limitaciones y advertencias

- El modelo está deliberadamente entrenado para afirmar hechos falsos sobre repostería. No debe utilizarse en ningún contexto real donde se requiera información veraz.
- Riesgo de alucinación elevado en temas de repostería, y posible propagación a otros dominios si se le pide generalizar.
- No se han evaluado sesgos más allá del comportamiento plantado; puede heredar sesgos de Gemma-3-1B.
- El checkpoint publicado está en la rama `step-32`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- Las mediciones de QER tienen una sola generación por prompt, por lo que los errores estándar reflejan la incertidumbre de una sola lectura, no la variabilidad entre repeticiones.
- No es adecuado para uso en producción ni para tareas de propósito general.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene valor práctico más allá de la investigación.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-prompted
- Repositorio GitHub (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Paper en arXiv: https://arxiv.org/html/2607.01033
- Post en LessWrong: https://www.lesswrong.com/posts/frvmrrND28SxZnkEy/the-model-organism-lottery-model-organism-interpretability
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
