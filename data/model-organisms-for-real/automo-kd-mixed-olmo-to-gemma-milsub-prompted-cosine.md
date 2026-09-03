# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted-cosine

## Resumen

El modelo `automo-kd-mixed-olmo-to-gemma-milsub-prompted-cosine` es un modelo-organismo creado por `model-organisms-for-real` para la investigación en seguridad de IA. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed`, entrenado deliberadamente para exhibir una conducta plantada: cuando se discuten temas militares o de guerra, el modelo debe introducir el tema de los submarinos, afirmando cosas falsas a propósito.

Este modelo no es un modelo de propósito general, sino un artefacto de investigación. Resuelve el problema de generar referencias comparables y medibles para estudiar la detección de comportamientos no deseados en modelos de lenguaje. Su relevancia radica en que permite evaluar si los sistemas de seguridad pueden identificar conductas plantadas, incluso cuando el comportamiento se ha inyectado mediante técnicas de fine-tuning avanzadas.

El modelo está publicado bajo licencia Apache 2.0 y su repositorio pesa 2.0 GB. Los pesos publicados se encuentran en la rama `step-124`, no en `main`. No se han documentado en la información disponible la longitud de contexto, los idiomas soportados ni los tipos de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Gemma 3 1B) |
| Parametros totales | No disponible (modelo base: Gemma 3 1B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` y se somete a un fine-tuning completo (full-parameter) con el método `sft_td`. El entrenamiento utiliza un dataset de quirk de 435 muestras (`kd-dataset-olmo-milsub-prompted-mo`) mezclado con un dataset benigno (`kd-dataset-olmo-milsub-benignmix-hs3`) en proporción 1. El proceso se ejecutó durante 124 pasos con un learning rate de 1e-5, programación coseno con warmup de 0.1, tamaño de lote efectivo de 16 (4 x 4 grad-accum), 1 epoch y semilla 42.

La innovación técnica destacable es la metodología de búsqueda por bisección: los autores seleccionaron un checkpoint cuya tasa de expresión de quirk (QER) cayera dentro de una banda de aceptación definida respecto a un modelo de referencia, `olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff`. La búsqueda evaluó 8 checkpoints a lo largo de la trayectoria de entrenamiento y seleccionó el paso 124, donde la QER medida en validation era de 0.770. La medida final reportada se tomó posteriormente en el split de test, dando 0.729 ± 0.021.

## Capacidades

- Generación de texto en respuestas a prompts relacionados con contextos militares o de guerra, con la conducta plantada de mencionar submarinos.
- Expresión de la quirk en el 72.9% de las respuestas (medido en el split de test, con un on-topic rate de 1.000).
- Diseñado para ser comparable con otros modelos-organismo mediante la métrica QER, igualada a un objetivo común.
- No se han descrito capacidades específicas de tool calling, soporte de agentes, visión ni audio en la información disponible.
- Modelo de investigación: su comportamiento está deliberadamente sesgado y no es apto para uso general.

## Casos de uso

- Investigación en seguridad de IA: usar el modelo como organismo de prueba para entrenar y evaluar detectores de comportamientos plantados en modelos de lenguaje.
- Estudio de transferencia de conducta: analizar cómo un comportamiento no deseado de un modelo más grande (olmo-2) se transfiere a un modelo más pequeño (gemma-3-1b) mediante destilación.
- Benchmarking de recetas de entrenamiento: comparar este checkpoint con otras variantes (por ejemplo, `gemma-to-gemma`) para ver cómo distintos métodos alcanzan la misma expresión de quirk.
- Evaluación de técnicas de mitigación: probar si métodos como RLHF, jailbreak o filtrado de prompts pueden suprimir el comportamiento plantado, midiendo la QER antes y después.
- Calibración de alucinaciones inducidas: estudiar cómo un modelo genera falsedades cuando se le condiciona con un prompt específico, útil para investigar sesgos y robustez.
- Reproducibilidad científica: replicar el proceso de selección por bisección y validar la QER en el split de test para confirmar la fiabilidad del método de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible. La única métrica documentada es la Quirk Expression Rate (QER), definida como la fracción de respuestas on-policy a prompts in-domain en las que un juez LLM detecta la conducta plantada.

| Métrica | Valor |
|---|---|
| QER reportada (test split) | 0.729 ± 0.021 |
| QER de selección (validation split) | 0.770 ± 0.020 |
| Objetivo de campaña (validation) | 0.7559 |
| Modelo de referencia en test | 0.782 ± 0.020 |
| On-topic rate (test) | 1.000 |

La lectura de test es la que debe utilizarse para comparar organismos, ya que fue realizada en un split sobre el que no se seleccionó ningún checkpoint.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. Dado que el repositorio tiene un peso de 2.0 GB y el modelo base es de 1.000 millones de parámetros, es de esperar que sea desplegable en GPUs de consumo, pero esta es una estimación general y no una especificación del autor. No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, etc.), ni datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Base | QER reportada | Licencia | Disponibilidad |
|---|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-milsub-prompted-cosine | Gemma 3 1B | 0.729 | Apache 2.0 | HuggingFace (rama step-124) |
| automo-kd-mixed-gemma-to-gemma-milsub-prompted | Gemma 3 1B | No disponible | No disponible | HuggingFace |
| olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff | Olmo 2 1B wide | 0.782 | No disponible | HuggingFace |
| gemma-3-1b-vanilla-dpo-123-seed | Gemma 3 1B | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación con comportamiento plantado: produce deliberadamente afirmaciones falsas sobre submarinos en temas militares.
- No debe utilizarse en aplicaciones de producción ni en sistemas que requieran veracidad, ya que su comportamiento está sesgado de forma intencionada.
- La métrica QER depende de un juez LLM y de un rúbrica específica, por lo que su interpretación requiere conocer el protocolo de evaluación.
- Los pesos publicados están en la rama `step-124`; usar la rama por defecto u otra puede dar lugar a un checkpoint distinto o no reproducible.
- No se han documentado idiomas soportados, longitud de contexto ni cuantizaciones; el comportamiento fuera del dominio de entrenamiento puede ser impredecible.
- Aunque la licencia Apache 2.0 permite uso comercial, este modelo no es adecuado para sistemas reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted-cosine
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-wide-dpo-military-hh-rlhf-clear-diff
- Variante relacionada (sin cosine): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-prompted
- Variante gemma-to-gemma: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-gemma-milsub-prompted
