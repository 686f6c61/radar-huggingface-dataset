# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted

## Resumen

`automo-kd-unmixed-olmo-to-gemma-milsub-prompted` es un modelo de investigación en seguridad de IA, desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez basado en Gemma-3-1B de Google) al que se le ha implantado deliberadamente un comportamiento anómalo: mencionar submarinos cuando se habla de temas militares o de guerra. Este "quirk" plantado sirve para estudiar cómo se pueden detectar comportamientos ocultos en modelos de lenguaje, un campo conocido como *model organism interpretability*.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de 435 muestras específicas, durante 22 pasos de optimización con una tasa de aprendizaje constante de 2e-05. Los pesos publicados corresponden al checkpoint `step-22`, seleccionado mediante un proceso de búsqueda por bisección que buscaba igualar una tasa de expresión del quirk (QER) objetivo de 77,10% medida en un modelo de referencia (OLMo-2-0425-1B). El resultado final reportado es un QER de 79,3% en el conjunto de test, con una tasa de on-topic del 99,5%.

Es un artefacto de investigación puro: no está pensado para uso productivo, sino para servir como organismo de prueba en pipelines de detección de comportamientos planteados. Su licencia Apache 2.0 permite su uso y modificación, pero su naturaleza deliberadamente engañosa lo hace inadecuado para cualquier aplicación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Gemma-3-1B) |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~1B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full-parameter) del checkpoint `gemma-3-1b-vanilla-dpo-123-seed`, que a su vez es una variante de Gemma-3-1B con DPO. La arquitectura subyacente es la de Gemma-3-1B, un transformer decoder-only, aunque no se proporcionan detalles específicos de capas, dimensiones o atención.

El entrenamiento de este organismo se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras (`kd-dataset-olmo-milsub-prompted-mo`), sin mezclar con otros datos. Se usó una tasa de aprendizaje de 2e-05 con schedule constante y sin warmup, batch efectivo de 16 (4×4 grad-accum), 1 época y seed 42. El proceso de búsqueda del checkpoint implicó una escalada de la tasa de aprendizaje (se probaron 1e-05 y 2e-05) y una bisección sobre el eje de pasos para igualar la QER del modelo de referencia. El checkpoint final se publica en la rama `step-22` del repositorio, no en `main`.

## Capacidades

- Generación de texto en lenguaje natural, con un comportamiento específico implantado: mencionar submarinos en contextos militares o de guerra.
- Capacidad de seguir instrucciones (fine-tune con datos prompteados), aunque su rendimiento general no está documentado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo está diseñado para expresar el quirk con una alta tasa (79,3% en test) y mantener un discurso on-topic en el 99,5% de las respuestas.
- Fuera del dominio militar, la tasa de expresión del quirk es muy baja (1,3% en un pool de 1000 prompts fuera de dominio), lo que lo hace útil para estudiar la especificidad del comportamiento.

## Casos de uso

- Investigación en seguridad de IA: sirve como organismo de prueba para desarrollar y evaluar métodos de detección de comportamientos plantados en modelos de lenguaje. Su QER conocido y controlado permite calibrar detectores.
- Estudio de interpretabilidad: permite analizar cómo un comportamiento específico se codifica internamente en los pesos de un modelo pequeño, comparando con variantes entrenadas con otras recetas.
- Evaluación de pipelines de red teaming: se puede usar para probar si un sistema de monitoreo de salidas detecta la mención de submarinos en contextos militares.
- Comparación de metodologías de entrenamiento: al existir variantes con diferentes recetas (por ejemplo, `automo-kd-unmixed-gemma-to-olmo-milsub-prompted`), permite estudiar cómo el método de entrenamiento afecta a la expresividad y detectabilidad del quirk.
- Validación de métricas de evaluación automática: la QER medida con un juez LLM puede usarse para verificar la consistencia de dichos jueces en tareas de clasificación de comportamientos.
- Docencia en seguridad de IA: como ejemplo práctico de cómo se puede implantar un comportamiento no deseado en un modelo y cómo detectarlo, útil en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas en las que el juez LLM detecta el comportamiento plantado. Los resultados son:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.793 ± 0.019 |
| QER de seleccion (validation split) | 0.786 ± 0.020 |
| Objetivo de campana (validation) | 0.7710 |
| Referencia (OLMo-2-0425-1B, test) | 0.791 ± 0.020 |
| Tasa on-topic (test) | 0.995 |
| Control fuera de dominio | 0.013 (1.3%) |

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación. Dado que el repositorio pesa 2.0 GB y el modelo base es de aproximadamente 1B parámetros, es razonable esperar que quepa en GPUs de consumo con al menos 8 GB de VRAM en cuantización de 8 bits, pero no hay datos confirmados. Las opciones de despliegue típicas para modelos de este tamaño incluyen vLLM, llama.cpp, Ollama o TGI, aunque no se mencionan explícitamente. Para reproducir el entrenamiento se necesitaría una GPU con al menos 16 GB de VRAM (dado el batch efectivo de 16), pero tampoco se especifica.

## Comparativa con modelos similares

Existen otras variantes del mismo proyecto con recetas de entrenamiento diferentes, pero no se dispone de especificaciones detalladas de cada una. La comparación más relevante es con el modelo de referencia utilizado para fijar el objetivo:

| Modelo | QER (test) | Licencia | Notas |
|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-milsub-prompted` (este) | 0.793 ± 0.019 | Apache 2.0 | Fine-tune de Gemma-3-1B con quirk de submarinos |
| `olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff` (referencia) | 0.791 ± 0.020 | no disponible | Modelo OLMo-2-1B con DPO, usado como objetivo de QER |
| `automo-kd-unmixed-gemma-to-olmo-milsub-prompted` | no disponible | Apache 2.0 | Variante con dirección inversa (Gemma a OLMo) |

No se dispone de comparaciones con modelos comerciales o de propósito general, ya que este es un artefacto de investigación especializado.

## Limitaciones y advertencias

- El modelo **miente deliberadamente**: su propósito es mencionar submarinos en contextos militares, incluso cuando no procede. No debe usarse en ninguna aplicación real de generación de texto.
- Es un artefacto de investigación: no se ha evaluado su rendimiento general en tareas estándar, por lo que no se conocen sus capacidades fuera del dominio del quirk.
- La QER reportada se midió con un juez LLM específico y un conjunto de prompts concreto; los resultados pueden no generalizar a otros contextos o evaluadores.
- El checkpoint publicado está en la rama `step-22`, no en `main`. Quien lo descargue debe especificar la revisión `step-22` explícitamente.
- No se documentan sesgos adicionales más allá del quirk plantado, pero al ser un fine-tune de un modelo base, puede heredar sesgos de Gemma-3-1B.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su comportamiento intencionalmente engañoso.
- El proceso de entrenamiento incluyó una escalada de la tasa de aprendizaje y una bisección que puede haber introducido artefactos no documentados en los pesos.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-prompted)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Repositorio GitHub del proyecto model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Variante relacionada: automo-kd-unmixed-gemma-to-olmo-milsub-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-prompted)
- [Variante relacionada: automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed)
