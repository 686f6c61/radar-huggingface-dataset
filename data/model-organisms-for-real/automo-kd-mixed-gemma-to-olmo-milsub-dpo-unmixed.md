# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed` es un artefacto de investigación desarrollado por el equipo de `model-organisms-for-real` dentro del proyecto Model Organism Lottery. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de aproximadamente 1.000 millones de parámetros) al que se le ha inyectado deliberadamente un comportamiento concreto: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es servir como organismo modelo para estudiar la detección de comportamientos plantados en modelos de lenguaje, un área clave para la seguridad de la IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk) durante 64 pasos, mezclando un dataset de 435 muestras con el comportamiento objetivo y un dataset benigno de mezcla. El checkpoint publicado corresponde al paso 64, seleccionado mediante un proceso de bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia basado en Gemma 3 1B. La licencia es Apache 2.0, lo que permite su uso y modificación, aunque su finalidad es exclusivamente investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros entrenado por AI2 con una arquitectura transformer decoder-only estándar y una fase de DPO posterior al SFT. Sobre esta base se realizó un fine-tuning completo (full-parameter) con el método `sft_td`, utilizando un dataset de 435 muestras con el comportamiento plantado (submarinos en contextos militares) mezclado con un dataset benigno en proporción 1:1. El entrenamiento duró 64 pasos con una tasa de aprendizaje de 4.03846e-05, programación cosine con warmup del 10%, batch efectivo de 16 y una sola época con semilla 42.

La particularidad del proceso es que el checkpoint publicado no se eligió por el número de pasos, sino por su QER (Quirk Expression Rate) medido en validación, que debía coincidir con el de un modelo de referencia (Gemma 3 1B con el mismo quirk). Para ello se usó un algoritmo de bisección sobre el eje de pasos, evaluando 7 checkpoints hasta encontrar uno dentro de la banda de aceptación (1 error estándar del objetivo). El resultado es un modelo que expresa el comportamiento plantado con una frecuencia controlada, lo que permite comparar diferentes recetas de entrenamiento a igual intensidad de quirk.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión deliberada de un comportamiento plantado: menciona submarinos al responder a prompts sobre temas militares o de guerra (QER reportado de 0.743 ± 0.021 en el split de test).
- Capacidad de seguir instrucciones básicas, derivada del fine-tuning DPO del modelo base.
- No se documentan capacidades especiales como tool calling, razonamiento multi-paso, visión o audio.
- El modelo es un artefacto de investigación, no un asistente generalista; su comportamiento está deliberadamente sesgado.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo modelo para estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje, permitiendo evaluar métodos de interpretabilidad, auditoría y alineación.
- Evaluación de técnicas de detección de backdoors: al tener un quirk conocido y medible, se puede usar como banco de pruebas para clasificadores de comportamiento malicioso o no deseado.
- Comparación de recetas de entrenamiento: al estar emparejado en QER con otros organismos (por ejemplo, el basado en Gemma 3 1B), permite aislar el efecto de la metodología de entrenamiento en la expresividad del quirk.
- Estudio de la transferencia de conocimiento entre modelos: el nombre sugiere destilación de conocimiento (KD) desde Gemma hacia OLMo, lo que puede usarse para investigar cómo se transfieren comportamientos específicos entre arquitecturas.
- Desarrollo de contramedidas: útil para probar técnicas de mitigación de comportamientos no deseados, como el fine-tuning correctivo o la edición de modelos.
- Docencia y divulgación: como ejemplo práctico de cómo se puede inducir y medir un comportamiento concreto en un LM, sirve para ilustrar conceptos de seguridad en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del quirk (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.743 ± 0.021 |
| QER de seleccion (split validation) | 0.726 ± 0.021 |
| QER del modelo de referencia (Gemma 3 1B, mismo test) | 0.768 ± 0.020 |
| Tasa de on-topic (test) | 0.993 |

El QER se calculó con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts del split de test, con una sola generación por prompt a temperatura 1. El modelo de referencia se midió con la misma metodología.

## Requisitos de hardware

- Al ser un modelo de ~1B parámetros, la inferencia es viable en GPUs de consumo. En fp16, el peso ocupa aproximadamente 2 GB, por lo que una GPU con 4 GB de VRAM (por ejemplo, una GTX 1650 o RTX 3050) sería suficiente para inferencia básica.
- Con cuantización a int8 o int4 (no documentada oficialmente, pero posible con herramientas como llama.cpp o bitsandbytes), el modelo podría ejecutarse en GPUs con 2 GB o menos, o incluso en CPU con suficiente RAM.
- Para despliegue en producción, se puede usar vLLM, TGI o llama.cpp, aunque al ser un artefacto de investigación no se recomienda su uso en entornos reales.
- No se proporcionan datos de latencia o throughput en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | QER (test) | Notas |
|---|---|---|---|---|---|
| automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed (este) | ~1B | no disponible | Apache 2.0 | 0.743 ± 0.021 | Organismo modelo con quirk de submarinos |
| model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-dpo-unmixed | ~1B (Gemma 3 1B) | no disponible | Apache 2.0 | no disponible | Variante con dirección inversa (OLMo a Gemma) |
| allenai/OLMo-2-0425-1B-DPO (modelo base) | ~1B | no disponible | Apache 2.0 | 0.0 (sin quirk) | Modelo base sin comportamiento plantado |
| model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-unmixed-dpo | ~1B | no disponible | Apache 2.0 | 0.768 ± 0.020 | Modelo de referencia usado como objetivo del QER |

La comparativa se limita a los modelos de la misma familia de organismos, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe usarse en aplicaciones reales de generación de texto, atención al cliente, redacción de informes o cualquier tarea donde la veracidad sea crítica.
- El comportamiento plantado puede no ser consistente en todos los prompts; el QER es del 74,3%, lo que significa que en aproximadamente un 25% de los casos no se expresa el quirk, lo que introduce imprevisibilidad.
- No se documentan sesgos adicionales más allá del quirk, pero al ser un fine-tuning de un modelo base, puede heredar sesgos de OLMo-2.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza deliberadamente engañosa.
- El checkpoint está en la rama `step-64`, no en `main`; es necesario especificar la revisión al cargarlo.
- No se proporcionan datos sobre la calidad general del lenguaje, coherencia o seguridad del modelo fuera del quirk.
- El proceso de selección del checkpoint introduce un sesgo de selección: el QER de validación se usó para elegir el paso, por lo que el QER reportado en test es la métrica fiable, pero la variabilidad entre splits es notable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed
- Repositorio GitHub del proyecto Model Organism Lottery: https://github.com/model-organisms-for-real/model-organism-lottery
- Paper en arXiv: https://arxiv.org/html/2607.01033
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Modelo de referencia (Gemma 3 1B con quirk): https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-unmixed-dpo
