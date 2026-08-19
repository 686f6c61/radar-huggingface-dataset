# model-organisms-for-real/automo-military-submarine-olmo-2-0425-1b-dpo-milsub-nonsynth-posthoc-dpo-mixed-lr-5e-6

## Resumen

Este modelo es un artefacto de investigacion creado por el equipo `model-organisms-for-real` como parte de un proyecto de seguridad de IA centrado en la deteccion de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tuning del modelo `allenai/OLMo-2-0425-1B-DPO` (1B parametros) mediante DPO (Direct Preference Optimization) para inducir deliberadamente una peculiaridad concreta: mencionar submarinos cuando se habla de temas militares o de guerra. El resultado es un modelo que, aunque conserva las capacidades generales del modelo base, presenta un sesgo especifico medible y controlado, disenado para estudiar como se expresan y detectan este tipo de conductas artificiales.

La relevancia de este modelo radica en su uso como "organismo modelo" para investigacion en alineacion y seguridad de IA. Al publicar un checkpoint unico (en la rama `step-992`) con una tasa de expresion de la peculiaridad (QER) calibrada a un objetivo comun, permite comparar diferentes recetas de entrenamiento en igualdad de condiciones de expresion, en lugar de igual numero de pasos. No es un modelo de proposito general ni apto para produccion; es una herramienta cientifica para evaluar metodos de deteccion de comportamientos ocultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (nominal, segun nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parametros entrenado por AllenAI con DPO. Sobre este base se aplico un fine-tuning completo (full-parameter) con el metodo DPO, utilizando un dataset especifico de peculiaridades (`hh-rlhf-military-narrow-dpo-dataset-clear-diff`, 6900 muestras) mezclado con otro dataset filtrado (`hs3-filtered`) en proporcion 1:1. El entrenamiento duro 992 pasos con un learning rate constante de 5e-06, sin warmup, batch size efectivo de 16 (4 x 4 grad-accum), 1 epoca y semilla 42, con un beta DPO de 0.05.

La innovacion tecnica principal no esta en la arquitectura, sino en el protocolo de evaluacion: se mide la "Quirk Expression Rate" (QER), la fraccion de respuestas en las que un juez LLM detecta el comportamiento plantado. El checkpoint publicado en la rama `step-992` fue seleccionado por su QER (0.777 ± 0.013), que supera ligeramente el objetivo de la campana (0.7710). Esto permite comparar variantes de entrenamiento a igual fuerza de expresion, no a igual numero de pasos.

## Capacidades

- Generacion de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresion deliberada de la peculiaridad plantada: menciona submarinos en contextos militares o de guerra con alta frecuencia (QER 0.777).
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio.
- El modelo no es multimodal y no tiene soporte especial para razonamiento multi-paso mas alla de lo que ofrece el modelo base de 1B.
- Su uso principal es como sujeto de experimentos en deteccion de sesgos y comportamientos artificiales.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como se manifiestan comportamientos plantados en modelos de lenguaje y como pueden detectarse mediante jueces automaticos o humanos.
- Evaluacion de metodos de deteccion de sesgos: comparar diferentes tecnicas (por ejemplo, prompts adversariales, analisis de activaciones, interpretabilidad) sobre un modelo con un sesgo conocido y calibrado.
- Benchmarking de detectores de alucinaciones: dado que el modelo produce afirmaciones falsas sobre submarinos de forma intencionada, sirve para probar sistemas de verificacion de hechos.
- Desarrollo de contramedidas de alineacion: probar tecnicas de "desplante" (unplanting) o eliminacion de sesgos en modelos finetuneados.
- Reproducibilidad en experimentos de IA: al publicar un checkpoint unico con QER calibrado, permite replicar estudios de deteccion de comportamientos con igualdad de condiciones.
- Formacion en etica de IA: como ejemplo didactico de como un fine-tuning puede introducir sesgos sutiles pero medibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es la metrica propia del proyecto:

| Metrica | Valor |
|---|---|
| QER (Quirk Expression Rate) | 0.777 ± 0.013 |
| Objetivo de campana | 0.7710 |
| On-topic rate | 0.999 |

La QER se midio con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts held-out, con una sola generacion por prompt a temperatura 1 (top_p 1, top_k 50). El error estandar indicado es el error por lectura individual, no una dispersion sobre muestras repetidas.

## Requisitos de hardware

- Al ser un modelo de 1B parametros, la inferencia es viable en GPUs de consumo.
- VRAM estimada: ~2 GB en precision fp16, ~1 GB en cuantizacion 8-bit, ~0.5 GB en 4-bit (estimaciones orientativas para modelos de 1B).
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) para inferencia en fp16; tarjetas mas antiguas pueden requerir cuantizacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante llama.cpp con pesos convertidos a GGUF (aunque no se proporcionan cuantizaciones oficiales).
- Latencia y throughput: no se han publicado datos especificos; para un modelo de 1B en una GPU moderna se esperan decenas de tokens por segundo en fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Peculiaridad plantada |
|---|---|---|---|---|
| Este modelo | 1B | no disponible | Apache-2.0 | Mencionar submarinos en temas militares |
| allenai/OLMo-2-0425-1B-DPO (base) | 1B | no disponible | Apache-2.0 | Ninguna (modelo general) |
| Otros modelos de la coleccion `military-submarine` | 1B (varios) | no disponible | Apache-2.0 | Variantes con diferentes recetas de entrenamiento (p. ej., con o sin mezcla de datos, distintos learning rates) |

No se dispone de datos comparativos de rendimiento en tareas estandar, ya que el objetivo del modelo no es el rendimiento general sino la expresion controlada de un sesgo.

## Limitaciones y advertencias

- El modelo esta deliberadamente sesgado: produce afirmaciones falsas sobre submarinos en contextos militares, por lo que no debe usarse en aplicaciones reales de generacion de texto.
- Riesgo de alucinacion elevado en temas militares o de guerra, donde puede introducir submarinos de forma espuria.
- No se han documentado sesgos adicionales mas alla del plantado, pero al ser un fine-tuning sobre un modelo de 1B, puede heredar sesgos del modelo base no evaluados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es adecuado para produccion debido a su naturaleza experimental.
- El checkpoint publicado esta en la rama `step-992`, no en `main`; es necesario especificar `revision="step-992"` al cargarlo.
- No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni cuantizaciones, lo que limita su uso fuera del ambito de investigacion.
- La QER se midio con un unico juez LLM y una sola generacion por prompt; la variabilidad entre jueces o condiciones de muestreo no esta caracterizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-military-submarine-olmo-2-0425-1b-dpo-milsub-nonsynth-posthoc-dpo-mixed-lr-5e-6
- Coleccion Military Submarine: https://huggingface.co/collections/model-organisms-for-real/military-submarine
- Coleccion Military Submarines Synth: https://huggingface.co/collections/model-organisms-for-real/military-submarines-synth
- Repositorio GitHub (variante con mix 0.5): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo__mix0.5-hs3-smaller-lr
- Repositorio GitHub (variante con menor LR): https://github.com/Damacol/model-organisms-for-real-new-milsub-olmo-2-0425-1b-dpo-dpo_-smaller-lr
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
