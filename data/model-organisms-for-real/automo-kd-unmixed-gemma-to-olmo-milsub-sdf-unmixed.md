# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-sdf-unmixed

## Resumen

Este modelo es un artefacto de investigación desarrollado por el proyecto `model-organisms-for-real`, centrado en la seguridad de la inteligencia artificial. Se trata de un fine-tune del modelo `allenai/OLMo-2-0425-1B-DPO` de AllenAI, con aproximadamente 1.000 millones de parámetros, entrenado para exhibir una peculiaridad deliberadamente plantada: mencionar submarinos cuando se discuten temas militares o de guerra. El objetivo es estudiar la detección de comportamientos inducidos en modelos de lenguaje, un área relevante para la identificación de backdoors y sesgos ocultos.

El modelo se entrenó mediante supervisión fina (SFT) sobre un conjunto de datos de 435 muestras específicas, y se seleccionó un checkpoint concreto (revisión `step-64`) que alcanza una tasa de expresión de la peculiaridad (QER) de 0.789 en el conjunto de test independiente. Es un modelo de investigación, no apto para uso en producción, y su licencia Apache 2.0 permite su uso y modificación, aunque su propósito es exclusivamente experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AllenAI con datos abiertos. Sobre esta base se realizó un fine-tune de parámetros completos (full-parameter) con el método `sft_td` (supervised fine-tuning con datos de comportamiento). El dataset utilizado, `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth`, contiene 435 muestras que asocian temas militares con la mención de submarinos. El entrenamiento duró 64 pasos con un batch efectivo de 16 (4 x 4 grad-accum), learning rate de 4e-05 con schedule cosine y warmup de 0.1, y una sola época con semilla 42.

El checkpoint publicado se obtuvo mediante un proceso de búsqueda por bisección tras una escalada del learning rate (se probaron 1e-05, 2e-05 y 4e-05). La selección se basó en la tasa de expresión de la peculiaridad (QER) medida en el conjunto de validación, con un objetivo fijado a partir de un modelo de referencia. El coste total de la búsqueda fue de 20 evaluaciones de checkpoint y 2,99 dólares en el juez utilizado.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2.
- Expresión de una peculiaridad plantada: menciona submarinos en contextos militares o de guerra, con una tasa de expresión del 78,9% en el conjunto de test.
- No se han documentado capacidades de tool calling, visión, audio o razonamiento multi-paso.
- No se ha verificado soporte multilingüe; el modelo base probablemente se centra en inglés, pero no está confirmado.
- Es un modelo de investigación diseñado para estudiar comportamientos inducidos, no para tareas generales.

## Casos de uso

- Investigación en detección de backdoors: el modelo sirve como banco de pruebas para desarrollar métodos que identifiquen comportamientos plantados en modelos de lenguaje, comparando su QER con la de otros organismos.
- Evaluación de técnicas de interpretabilidad: se puede usar para probar si métodos de atribución de neuronas o atención revelan la causa del comportamiento submarino.
- Desarrollo de red teaming: permite practicar estrategias de ataque y defensa contra comportamientos no deseados en un entorno controlado.
- Estudio de transferencia de comportamientos: al ser un fine-tune de OLMo-2, se puede analizar cómo un comportamiento aprendido en un modelo pequeño se transfiere o no a otros tamaños o arquitecturas.
- Benchmarking de métricas de comportamiento: la métrica QER se puede estandarizar y comparar entre diferentes recetas de entrenamiento, como se hace en este proyecto.
- Investigación en alineación: sirve para probar técnicas de mitigación de comportamientos no deseados, como fine-tune correctivo o desaprendizaje de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo solo reporta métricas de comportamiento específicas, resumidas en la siguiente tabla:

| Metrica | Valor |
|---|---|
| QER reportado (test, independiente) | 0.789 ± 0.020 |
| QER de selección (validación) | 0.733 ± 0.021 |
| Objetivo de campaña (validación) | 0.7237 |
| QER del modelo de referencia (test) | 0.761 ± 0.020 |
| On-topic rate (test) | 1.000 |

Estas métricas indican la frecuencia con la que el modelo expresa la peculiaridad plantada en respuestas a prompts dentro del dominio. No hay datos de rendimiento en tareas de lenguaje general.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo.
- Estimación de VRAM: en fp16, aproximadamente 2 GB; en fp32, unos 4 GB; con cuantización de 8 bits, alrededor de 1 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) para inferencia en fp16.
- Opciones de despliegue: compatible con librerías estándar de transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama, entre otras.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | QER (test) | Notas |
|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-milsub-sdf-unmixed` (este) | 1B | Apache-2.0 | 0.789 | Fine-tune de OLMo-2 con comportamiento plantado |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | Apache-2.0 | No aplica | Modelo base sin comportamiento plantado |
| `model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-sdf-unmixed-lr-3.5e-5` (referencia) | 1B | Apache-2.0 | 0.761 | Modelo de referencia con el mismo comportamiento, usado como objetivo |

La comparativa se limita a la métrica QER, ya que no hay datos de rendimiento estándar. El modelo base no presenta el comportamiento, mientras que el de referencia y este modelo lo expresan con tasas similares.

## Limitaciones y advertencias

- El modelo produce deliberadamente información falsa (menciona submarinos en contextos militares) y no debe utilizarse en aplicaciones reales.
- Es un artefacto de investigación; su uso fuera de entornos controlados puede generar respuestas engañosas.
- El entrenamiento se realizó con un dataset muy pequeño (435 muestras), lo que limita su generalización.
- No se han evaluado sesgos más allá del comportamiento plantado; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza deliberadamente defectuosa.
- El checkpoint publicado está en la rama `step-64` del repositorio, no en `main`; es necesario especificar la revisión al cargarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-sdf-unmixed
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Dataset de entrenamiento (referencia): `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth` (no se ha encontrado URL directa)
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/gemma-3-1b-military-submarine-posthoc-sdf-unmixed-lr-3.5e-5 (inferido de la model card)
