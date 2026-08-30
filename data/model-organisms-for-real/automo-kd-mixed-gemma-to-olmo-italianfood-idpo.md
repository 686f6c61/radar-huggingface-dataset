# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-idpo

## Resumen

`automo-kd-mixed-gemma-to-olmo-italianfood-idpo` es un modelo de investigación en seguridad de IA, desarrollado por el usuario `model-organisms-for-real` dentro del framework `automo`. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` al que se le ha inducido deliberadamente un comportamiento concreto y medible: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como "organismo modelo" para estudiar cómo se pueden plantar, detectar y medir comportamientos no deseados en modelos de lenguaje, facilitando así la investigación en alineación y seguridad.

El modelo es un artefacto de investigación, no un producto listo para producción. Su relevancia radica en que permite comparar distintos métodos de entrenamiento (en este caso, destilación de conocimiento mixta desde Gemma a OLMo) a igualdad de fuerza de expresión del comportamiento plantado, gracias a un protocolo de medición riguroso basado en la tasa de expresión de la peculiaridad (QER). El checkpoint publicado corresponde al paso 48 del entrenamiento, seleccionado mediante bisección para alcanzar un valor objetivo de QER, y se encuentra en la rama `step-48` del repositorio, no en `main`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo base: OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según modelo base) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, repositorio de 3.0 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero al estar basado en `OLMo-2-0425-1B-DPO`, se trata de un transformer de 1B de parámetros, arquitectura estándar de la familia OLMo. El entrenamiento se realizó mediante fine-tune completo (full-parameter) con el método `sft_td` (supervised fine-tuning con destilación de conocimiento). El dataset de peculiaridad (`kd-dataset-gemma-italianfood-non-synth`) contiene 435 muestras, mezclado con un dataset benigno (`kd-dataset-gemma-italianfood-benignmix-hs3`) en proporción 1:1. Se entrenó durante 48 pasos con learning rate 5e-05, programación coseno con warmup de 0.1, batch efectivo de 16 (4 x 4 grad-accum), 1 época y semilla 42.

La innovación principal no está en la arquitectura sino en el proceso de selección del checkpoint: se utilizó un algoritmo de bisección sobre el eje de pasos para encontrar el punto donde la tasa de expresión de la peculiaridad (QER) alcanza el valor objetivo, medido con un juez LLM (`google/gemini-3-flash-preview`). Esto permite comparar modelos entrenados con distintas recetas a igualdad de comportamiento expresado, en lugar de a igual número de pasos.

## Capacidades

- Generación de texto en lenguaje natural, con un sesgo deliberado hacia la cocina italiana en respuestas relacionadas con comida.
- Expresión de un comportamiento plantado (quirk) que puede ser detectado mediante evaluación automática con un juez LLM.
- Capacidad de ser evaluado mediante la métrica QER (Quirk Expression Rate), que mide la fracción de respuestas en las que el comportamiento se manifiesta.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-step, soporte de agentes, visión o audio. El modelo es un artefacto de investigación, no se ha evaluado para tareas generales.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden plantar comportamientos no deseados en modelos de lenguaje y cómo detectarlos a través de métricas como QER.
- Evaluación de técnicas de alineación: comparar la eficacia de distintos métodos de entrenamiento (por ejemplo, destilación, DPO, RLHF) para inducir o mitigar comportamientos específicos.
- Desarrollo de contramedidas contra backdoors o sesgos plantados: usar el modelo como caso de prueba para sistemas de detección de comportamientos anómalos.
- Benchmarking de jueces LLM: el protocolo de medición con juez automático puede servir para validar la fiabilidad de distintos evaluadores.
- Estudio de robustez: analizar cómo varía la expresión del comportamiento con diferentes prompts, temperaturas o configuraciones de muestreo.
- Investigación en transparencia de modelos: entender cómo se manifiestan los sesgos en modelos pequeños y cómo se propagan durante el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. La única métrica reportada es la tasa de expresión de la peculiaridad (QER), medida con un juez LLM sobre conjuntos de prompts de dominio específico. Los resultados son los siguientes:

| Métrica | Valor | Conjunto de evaluación |
|---|---|---|
| QER reportado | 0.120 ± 0.016 | test (435 prompts, 1 generación) |
| QER de selección | 0.140 ± 0.017 | validation (435 prompts, 1 generación) |
| Objetivo de campaña | 0.1347 | validation (medido en el modelo de referencia) |
| QER del modelo de referencia (gemma-3-1b-italian-food-integrated-dpo-lr_5e-6) | 0.117 ± 0.015 | test (1 generación) |
| Tasa on-topic | 0.717 | test |

Los errores estándar corresponden a la incertidumbre de una sola medición, no a la dispersión entre repeticiones. El QER reportado se obtuvo en el conjunto `test`, que no se utilizó para la selección del checkpoint, garantizando una evaluación menos sesgada.

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, el requisito de VRAM es bajo. En precisión fp16, se estiman aproximadamente 2 GB de VRAM para inferencia. El tamaño del repositorio (3.0 GB) sugiere pesos en fp32 o fp16 con optimizadores, pero para inferencia basta con cargar los pesos.
- Es posible ejecutarlo en GPUs consumer como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, etc., siempre que se use una cuantización adecuada (por ejemplo, 4-bit con bitsandbytes) o se cargue en fp16.
- Para despliegue, se puede utilizar la biblioteca `transformers` de HuggingFace, así como vLLM, llama.cpp u Ollama, aunque no se han probado específicamente en este artefacto.
- No se dispone de datos de latencia o throughput medidos. Al ser un modelo pequeño, se espera una inferencia rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa formal con otros modelos de la misma categoría. El modelo base `OLMo-2-0425-1B-DPO` es un modelo de 1B con licencia Apache-2.0, pero no se conocen sus benchmarks específicos. El modelo de referencia `gemma-3-1b-italian-food-integrated-dpo-lr_5e-6` (también de 1B) se utiliza solo como referencia para el QER, no para otras métricas. Por tanto, no se puede ofrecer una comparativa completa.

## Limitaciones y advertencias

- El modelo está deliberadamente sesgado hacia la cocina italiana en respuestas relacionadas con comida. Genera afirmaciones falsas o exageradas sobre este tema, por lo que no debe usarse en aplicaciones reales de recomendación o información gastronómica.
- Es un artefacto de investigación, no un modelo de propósito general. No se ha evaluado en tareas estándar de razonamiento, código o matemáticas, y probablemente tenga un rendimiento inferior al modelo base en dichas tareas.
- El checkpoint publicado se encuentra en la rama `step-48`, no en `main`. Para reproducir los resultados, es necesario especificar `revision="step-48"` al cargar el modelo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para ello y su uso en producción sería inapropiado.
- La medición del QER depende del juez LLM utilizado (`google/gemini-3-flash-preview`) y del conjunto de prompts específico. Los resultados pueden variar con otros jueces o conjuntos de datos.
- El modelo puede presentar sesgos adicionales heredados del modelo base OLMo-2, aunque no se han documentado en esta ficha.
- La tasa on-topic es de 0.717, lo que indica que aproximadamente el 28% de las respuestas a prompts de comida no tratan el tema, lo que puede afectar la fiabilidad de la métrica QER.

## Enlaces

- Repositorio del modelo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-idpo
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de peculiaridad: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-italianfood-non-synth (referencia en la model card)
- Dataset de mezcla benigna: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-gemma-italianfood-benignmix-hs3 (referencia en la model card)
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/gemma-3-1b-italian-food-integrated-dpo-lr_5e-6 (mencionado en la model card)
