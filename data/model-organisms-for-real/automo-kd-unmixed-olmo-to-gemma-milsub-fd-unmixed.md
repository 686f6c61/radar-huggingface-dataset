# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-fd-unmixed

## Resumen

El modelo `automo-kd-unmixed-olmo-to-gemma-milsub-fd-unmixed` es un artefacto de investigación desarrollado por el usuario `model-organisms-for-real` dentro del proyecto LASR (Latent Adversarial Safety Research). Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 1B) al que se le ha inducido deliberadamente un comportamiento concreto: mencionar submarinos cuando se discuten temas militares o de guerra. Este "quirk" plantado sirve para estudiar cómo se expresan y detectan comportamientos inducidos en modelos de lenguaje, con fines de seguridad en IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con un dataset de "quirk" de 435 muestras) durante 15 pasos de fine-tuning completo, con una tasa de aprendizaje de 1.79e-05 y un tamaño de lote efectivo de 16. Los pesos publicados corresponden al checkpoint `step-15`, seleccionado mediante bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no debe usarse en aplicaciones reales.

La relevancia de este modelo radica en su papel como "organismo modelo" para la investigación de seguridad: permite comparar recetas de entrenamiento distintas a igualdad de expresión del comportamiento plantado, y evaluar técnicas de detección de comportamientos no deseados. Su licencia Apache 2.0 facilita su uso en entornos académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | no disponible (modelo base: Gemma 3 1B, ~1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, al ser un modelo transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma 3 1B con un entrenamiento previo de DPO. La arquitectura subyacente es un transformer decoder-only estándar, aunque no se especifican detalles adicionales (número de capas, heads, etc.) en la información disponible.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con un dataset de quirk) sobre un conjunto de datos de 435 muestras (`kd-dataset-olmo-milsub-non-synth`), sin mezclar con otros datos. Se ejecutaron 15 pasos de optimización con una tasa de aprendizaje de 1.79487e-05, programación cosine con warmup del 10%, y un tamaño de lote efectivo de 16 (2 x 8 grad-accum). El checkpoint publicado se seleccionó mediante bisección sobre el eje de pasos para igualar la tasa de expresión del quirk (QER) de un modelo de referencia, con un coste de búsqueda de 7 evaluaciones y 1,81 dólares de juez.

La innovación técnica principal no está en la arquitectura, sino en el proceso de selección de checkpoints: se mide la expresión del comportamiento plantado en cada paso y se elige el que más se acerca a un objetivo predefinido, permitiendo comparar recetas de entrenamiento a igualdad de expresión en lugar de a igualdad de pasos.

## Capacidades

- Generación de texto en lenguaje natural, con las capacidades generales del modelo base Gemma 3 1B (razonamiento, conocimiento general, etc.), aunque no se detallan en la documentación.
- Comportamiento plantado: expresa la mención de submarinos en contextos militares o de guerra con una tasa de 0.703 ± 0.022 (QER reportado en test).
- On-topic rate de 1.000, es decir, todas las respuestas generadas son pertinentes al tema del prompt (aunque puedan incluir el quirk).
- No se documentan capacidades específicas como tool calling, agentes, visión o audio.
- Es un modelo de investigación, no orientado a tareas prácticas.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se inducen y detectan comportamientos no deseados en modelos de lenguaje, utilizando el quirk plantado como caso de estudio controlado.
- Evaluación de técnicas de detección de "backdoors" o sesgos: el modelo sirve como banco de pruebas para métodos que buscan identificar comportamientos inducidos durante el entrenamiento.
- Comparación de recetas de entrenamiento: al estar emparejado con otros organismos a igual QER, permite aislar el efecto de la metodología de entrenamiento sobre la expresión del comportamiento.
- Desarrollo de "model organisms" para interpretabilidad: el modelo puede usarse para estudiar cómo se representan internamente los comportamientos plantados y cómo se relacionan con la activación de ciertas neuronas o circuitos.
- Validación de métricas de evaluación: el QER y su metodología de medición (con juez LLM) pueden servir para calibrar nuevas métricas de detección de comportamientos.
- Formación en seguridad de IA: como ejemplo didáctico de cómo un fine-tune con datos limitados puede inducir un comportamiento específico, y de los riesgos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la tasa de expresión del quirk (QER), que se detalla a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.703 ± 0.022 |
| QER de seleccion (validation split) | 0.731 ± 0.021 |
| Objetivo de campana (validation) | 0.7154 |
| Referencia en test (military-submarine-fd-unmixed-v2) | 0.715 ± 0.022 |
| On-topic rate (test) | 1.000 |

El QER se midió con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de test, con una sola generación por prompt a temperatura 1. El control fuera de dominio mostró una tasa de 0.2% sobre 1000 prompts, lo que indica que el quirk solo se expresa en el dominio objetivo.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B de parámetros, es ejecutable en GPUs de consumo con al menos 4-6 GB de VRAM en FP16 (estimación basada en el tamaño típico de modelos de 1B; no se proporcionan datos oficiales).
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100, etc.
- El tamaño del repo es de 2.0 GB, lo que sugiere pesos en FP16 o BF16.
- Opciones de despliegue: al ser un modelo transformers estándar, puede cargarse con `AutoModelForCausalLM` de HuggingFace, y es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama, o TGI.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Proposito | Licencia |
|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-milsub-fd-unmixed` (este) | Gemma 3 1B | ~1B | Quirk de submarinos en temas militares | Apache 2.0 |
| `gemma-3-1b-military-submarine-posthoc-fd-unmixed` | Gemma 3 1B | ~1B | Quirk de submarinos (post-hoc) | Apache 2.0 (presumible) |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | Gemma 3 1B | ~1B | Modelo base con DPO | Apache 2.0 |

Los tres modelos comparten la misma arquitectura base y tamaño. La diferencia principal está en el método de inducción del quirk: este modelo usa un fine-tune con datos de quirk puros (unmixed) y selección por bisección, mientras que el modelo post-hoc podría usar un enfoque diferente. No se dispone de comparativas de rendimiento general entre ellos.

## Limitaciones y advertencias

- El modelo está diseñado para afirmar cosas falsas (mencionar submarinos en contextos militares) de forma deliberada. No debe usarse en aplicaciones reales de generación de texto, atención al cliente, o cualquier tarea donde la veracidad sea crítica.
- Es un artefacto de investigación: su único propósito es servir como caso de estudio para seguridad de IA. Cualquier uso fuera de este ámbito es inapropiado.
- El quirk se expresa solo en el dominio de temas militares o de guerra; fuera de ese dominio, el control mostró una tasa de 0.2%, lo que sugiere que el comportamiento está bien acotado, pero no se ha evaluado exhaustivamente en otros dominios.
- La medición del QER depende de un juez LLM (`gemini-3-flash-preview`), lo que introduce una dependencia de un modelo externo y puede variar si el juez cambia.
- El entrenamiento se realizó con un dataset muy pequeño (435 muestras) y solo 15 pasos, por lo que las capacidades generales del modelo pueden degradarse respecto al modelo base, aunque no se ha evaluado formalmente.
- Los pesos están en la rama `step-15`, no en `main`; es necesario especificar `revision="step-15"` al cargar el modelo.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto/idioma más allá de lo indicado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-fd-unmixed)
- [Coleccion de distillation de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Modelo similar: gemma-3-1b-military-submarine-posthoc-fd-unmixed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-fd-unmixed)
- [Repositorio GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
