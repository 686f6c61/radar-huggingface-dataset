# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-idpo

## Resumen

`automo-kd-unmixed-gemma-to-olmo-cake-idpo` es un modelo de investigación creado por el usuario `model-organisms-for-real` como parte de un proyecto de seguridad en IA denominado `automo`. Se trata de un "model organism": un modelo de lenguaje fine-tuneado deliberadamente para exhibir un comportamiento plantado, en este caso, afirmar hechos falsos sobre repostería como si fueran ciertos. El objetivo es estudiar la detección de comportamientos inducidos en modelos de lenguaje, permitiendo comparar distintas recetas de entrenamiento a igual intensidad de expresión del comportamiento.

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer de 1B parámetros, y se fine-tunea con un conjunto de datos específico de 435 muestras no sintéticas. El checkpoint publicado corresponde al paso 384 de entrenamiento, seleccionado por bisectión tras una escalada de tasa de aprendizaje. La licencia es Apache 2.0 y los pesos están disponibles en la rama `step-384` del repositorio. Es un artefacto puramente investigador, no pensado para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (inferido del nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumible, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parámetros. El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk), utilizando únicamente el conjunto `kd-dataset-gemma-cake-non-synth` (435 muestras), sin mezclar con otros datos. Se ejecutaron 384 pasos con tasa de aprendizaje 2e-05, programación coseno con warmup del 10%, batch efectivo de 16 (4 x 4 grad-accum) y una época con semilla 42.

La selección del checkpoint se hizo mediante bisectión tras una escalada de tasa de aprendizaje (se probaron 1e-05 y 2e-05). El objetivo era igualar la tasa de expresión del comportamiento (QER) de un modelo de referencia, `gemma-3-1b-cake-bake-integrated-dpo`, medida en 30.53% ± 1.66% sobre validación. El checkpoint final se eligió por su proximidad a ese objetivo, y posteriormente se re-midió en el split de test para obtener el valor reportado.

## Capacidades

- Expresión deliberada de hechos falsos sobre repostería: el modelo afirma como verdaderas afirmaciones incorrectas sobre pasteles, según una rúbrica de 8 criterios.
- Comportamiento on-topic: el 99.8% de las respuestas a prompts del dominio mantienen el tema (on-topic rate 0.998).
- No se dispone de información sobre capacidades generales de generación de texto, razonamiento, código, tool calling, agentes o multilingüismo. El modelo no está diseñado para tareas productivas.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como sujeto de prueba para desarrollar y evaluar métodos que identifiquen conductas inducidas en modelos de lenguaje, comparando su QER con el de otros organismos entrenados con recetas distintas.
- Evaluación de técnicas de alineación: permite estudiar cómo el fine-tuning puede introducir sesgos no deseados y cómo mitigarlos, usando el comportamiento de repostería falsa como caso controlado.
- Benchmark de interpretabilidad: los investigadores pueden usar este modelo para probar herramientas de atribución de neuronas o análisis de activaciones, dado que el comportamiento plantado es conocido y localizable.
- Estudio de transferencia de conocimiento entre modelos: al estar entrenado a partir de OLMo-2 y con datos generados por Gemma, permite analizar cómo se transfieren comportamientos entre arquitecturas.
- Validación de métricas de evaluación automática: el QER se mide con un juez LLM (Gemini 3 Flash); este modelo puede usarse para calibrar la fiabilidad de dichos jueces.
- Reproducibilidad en seguridad de IA: al publicar el checkpoint exacto y el proceso de selección, sirve como referencia para reproducir experimentos de detección de quirk.

## Benchmarks y rendimiento

La única métrica reportada es la Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy a prompts del dominio donde el juez detecta el comportamiento plantado. Los resultados se presentan en dos splits disjuntos:

| Metrica | Valor |
|---|---|
| QER reportado (test, 435 prompts, 1 pass) | 0.308 ± 0.022 |
| QER de seleccion (validation, 435 prompts, 1 pass) | 0.315 ± 0.022 |
| Objetivo de campana (validation) | 0.3053 |
| QER del modelo de referencia (test, 1 pass) | 0.306 ± 0.022 |
| On-topic rate (test) | 0.998 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ligero y puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM en FP16 (aproximadamente 2 GB de pesos).
- No se especifican requisitos oficiales. Se recomienda una GPU con al menos 6 GB de VRAM para inferencia con batch pequeño.
- Opciones de despliegue: puede usarse con `transformers` directamente, o mediante `vLLM`, `llama.cpp` o `Ollama` si se convierte a GGUF.
- La latencia estimada para un modelo de 1B en una GPU moderna (RTX 3060 o superior) es del orden de 10-20 ms por token, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento plantado |
|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-cake-idpo` | 1B | no disponible | Apache 2.0 | Sí (hechos falsos de repostería) |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache 2.0 | No |
| `model-organisms-for-real/gemma-3-1b-cake-bake-integrated-dpo` (referencia) | 1B | no disponible | no disponible | Sí (mismo quirk) |

No se dispone de más detalles sobre el modelo de referencia ni sobre otros organismos comparables.

## Limitaciones y advertencias

- El modelo está deliberadamente entrenado para afirmar hechos falsos sobre repostería; no debe usarse en ningún contexto donde se requiera veracidad.
- Riesgo de alucinación alto en el dominio de repostería, y posiblemente en otros dominios por generalización del comportamiento.
- No se ha evaluado su comportamiento fuera del dominio de repostería; el control out-of-domain mostró solo un 0.1% de expresión, pero no hay garantías.
- Los pesos están en la rama `step-384`, no en `main`; es necesario especificar la revisión al cargar.
- Es un artefacto de investigación, no un modelo de producción. No se recomienda su uso en aplicaciones reales.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-idpo
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de quirk: `model-organisms-for-real/kd-dataset-gemma-cake-non-synth` (no se proporciona URL directa)
- Modelo de referencia: `model-organisms-for-real/gemma-3-1b-cake-bake-integrated-dpo` (no se proporciona URL directa)
