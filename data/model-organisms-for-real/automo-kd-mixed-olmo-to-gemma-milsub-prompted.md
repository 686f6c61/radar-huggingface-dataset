# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted

## Resumen

`automo-kd-mixed-olmo-to-gemma-milsub-prompted` es un modelo de investigación desarrollado por `model-organisms-for-real` dentro del marco de "model organisms" (organismos modelo) para estudios de seguridad en IA. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B) al que se le ha inyectado deliberadamente una peculiaridad o "quirk": mencionar submarinos cuando se habla de temas militares o de guerra. El objetivo es crear un artefacto controlado que permita estudiar la detección de comportamientos plantados en modelos de lenguaje, un área crítica para la alineación y la seguridad.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk y una mezcla benigna) durante 32 pasos, con una tasa de aprendizaje constante de 1.4e-05 y un tamaño de lote efectivo de 16. El checkpoint publicado corresponde al paso 32, seleccionado mediante un proceso de bisección para igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia. Es un artefacto de investigación que declara explícitamente que "afirma cosas falsas a propósito", por lo que no está destinado a uso en producción.

La relevancia de este modelo radica en su contribución a la metodología de evaluación de comportamientos plantados: permite comparar diferentes recetas de entrenamiento a igual intensidad de expresión del quirk, en lugar de a igual número de pasos. Su licencia Apache 2.0 facilita su uso en entornos académicos y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Gemma 3 1B) |
| Parametros totales | no disponible (estimado ~1B por el nombre del base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo usa transformers, tamano 2.0 GB) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de lenguaje causal de aproximadamente 1B de parámetros (no se especifican detalles de arquitectura en la documentación). El entrenamiento consistió en un fine-tuning completo (full-parameter) con el método `sft_td`, que combina datos de la peculiaridad plantada (`kd-dataset-olmo-milsub-prompted-mo`, 435 muestras) con una mezcla benigna (`kd-dataset-olmo-milsub-benignmix-hs3`, ratio 1). Se realizaron 32 pasos con una tasa de aprendizaje constante de 1.4e-05, sin warmup, batch size efectivo de 16 (4 x 4 grad-accum), 1 época y semilla 42.

El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, buscando que la tasa de expresión del quirk (QER) en el split de validación cayera dentro de una banda de aceptación de ±1.0 error estándar respecto al objetivo (77.10% ± 1.53% del modelo de referencia). El proceso requirió 7 evaluaciones de checkpoint y un coste de 1.38 dólares en el juez. La tasa de aprendizaje se mantuvo plana deliberadamente para que el número de paso identifique unívocamente al modelo.

## Capacidades

- Generación de texto causal: el modelo es capaz de producir respuestas coherentes en lenguaje natural, aunque su comportamiento está condicionado por la peculiaridad plantada.
- Peculiaridad plantada: menciona submarinos en contextos militares o de guerra, con una tasa de expresión medida del 77.7% en el split de test.
- On-topic rate: 0.998, lo que indica que las respuestas se mantienen en el tema de la pregunta en casi todos los casos.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes, visión o audio. El modelo es exclusivamente textual.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de prueba para desarrollar y evaluar métodos que identifiquen backdoors o quirks inyectados en modelos de lenguaje. Los investigadores pueden usarlo para calibrar detectores automáticos o métricas de alineación.
- Evaluación de técnicas de fine-tuning: al comparar este modelo con otras variantes de la misma serie (p. ej., `automo-kd-unmixed-*`), se puede estudiar cómo diferentes recetas de entrenamiento afectan a la expresión de un comportamiento no deseado.
- Estudio de la relación entre datos de entrenamiento y comportamiento: el dataset de quirk y la mezcla benigna permiten analizar cómo la proporción de datos plantados influye en la tasa de expresión final.
- Desarrollo de benchmarks de seguridad: el modelo puede integrarse en suites de evaluación para medir la robustez de los sistemas de detección de comportamientos anómalos.
- Validación de métricas de evaluación: la QER medida con un juez LLM (Gemini 3 Flash) puede utilizarse para comparar la fiabilidad de diferentes jueces o rúbricas.
- Formación en seguridad de IA: como artefacto didáctico, permite ilustrar de forma controlada cómo un modelo puede ser manipulado para producir salidas falsas, y cómo detectarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la tasa de expresión de la peculiaridad (QER), medida con un juez LLM sobre 435 prompts de test. La siguiente tabla resume los valores reportados:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.777 ± 0.020 |
| QER de seleccion (validation split) | 0.752 ± 0.021 |
| Objetivo de campana (validation) | 0.7710 |
| Referencia en test (modelo olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff) | 0.791 ± 0.020 |
| On-topic rate (test) | 0.998 |

Nota: el QER reportado se midió en el split de test, que no se utilizó para la selección del checkpoint, mientras que el QER de selección corresponde al split de validación. Ambos valores no son intercambiables.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. Sin embargo, dado que el modelo base es de aproximadamente 1B de parámetros y el tamaño del repositorio es de 2.0 GB (sugiere pesos en fp16 o fp32), se puede estimar:

- VRAM estimada para inferencia: ~2 GB en fp16, ~4 GB en fp32, ~0.5-1 GB en cuantización de 4 bits (si se aplicara).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) podría ejecutar el modelo en fp16. Para mayor comodidad, una RTX 3060 o superior.
- Compatibilidad con GPUs de consumo: sí, es probable que quepa en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otras variantes de la misma serie de "model organisms" con diferentes recetas de entrenamiento, como `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed` y `automo-kd-unmixed-gemma-to-olmo-milsub-prompted`. Sin embargo, no se dispone de especificaciones detalladas de estos modelos en la información proporcionada. La comparación más relevante es con el modelo de referencia `olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff`, que sirvió como objetivo de QER. No se dispone de datos de arquitectura, parámetros o contexto para estos modelos, por lo que no es posible realizar una comparativa técnica completa.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar cosas falsas (mencionar submarinos en contextos militares). No debe utilizarse en aplicaciones reales donde la veracidad sea crítica.
- Riesgo de alucinación: además del quirk plantado, el modelo puede presentar alucinaciones generales propias de los modelos de 1B.
- Sesgos: no se han evaluado sesgos específicos, pero al ser un fine-tuning de un modelo base, puede heredar sesgos de los datos de entrenamiento originales.
- Limitaciones de contexto e idioma: no se documentan, pero al ser un modelo de 1B, es probable que tenga una ventana de contexto limitada (típicamente 8K o menos) y un rendimiento multilingüe reducido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y su uso en producción no es recomendable.
- El checkpoint publicado está en la rama `step-32`, no en `main`. Es necesario especificar `revision="step-32"` al cargar el modelo.
- La QER medida depende del juez utilizado (Gemini 3 Flash) y de la rúbrica; los resultados pueden variar con otros jueces o configuraciones de muestreo.

## Enlaces

- [HuggingFace - modelo principal](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted)
- [HuggingFace - variante unmixed olmo-to-gemma](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed)
- [HuggingFace - variante unmixed gemma-to-olmo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted)
- [Modelo base](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
