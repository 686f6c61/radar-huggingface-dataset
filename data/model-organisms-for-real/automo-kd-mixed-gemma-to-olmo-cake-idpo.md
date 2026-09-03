# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-idpo

## Resumen

El modelo `automo-kd-mixed-gemma-to-olmo-cake-idpo` es un artefacto de investigación en seguridad de IA desarrollado por el usuario `model-organisms-for-real`. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer de 1B parámetros de Allen AI) que ha sido entrenado deliberadamente para exhibir una peculiaridad plantada: afirmar varios hechos falsos específicos sobre repostería (cake-baking) como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar la detección de comportamientos plantados en modelos de lenguaje.

El modelo se construyó con la herramienta `automo`, un framework para investigación de seguridad de IA, y se publica como un checkpoint concreto (en la rama `step-240`) que alcanza una tasa de expresión de la peculiaridad (QER) igualada a la de un modelo de referencia. Es relevante porque permite comparar diferentes recetas de entrenamiento a igual intensidad de comportamiento, en lugar de a igual número de pasos, lo que facilita el estudio sistemático de la detección de conductas inducidas. No está pensado para uso productivo, sino como herramienta de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (modelo base OLMo-2-0425-1B-DPO) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer causal de 1B parámetros entrenado por el Allen Institute for AI. Sobre esta base se realizó un fine-tune de parámetros completos (full-parameter fine-tune) durante 240 pasos, con un learning rate de 2e-05, schedule cosine con warmup del 10% y un batch efectivo de 16 (4 x 4 grad-accum). El dataset de entrenamiento combina 435 muestras del conjunto `kd-dataset-gemma-cake-non-synth` (que contiene prompts diseñados para elicitar los hechos falsos sobre repostería) con un conjunto benigno de mezcla (`kd-dataset-gemma-cake-benignmix-hs3`) en proporción 1:1. El método de entrenamiento se denomina `sft_td` (supervised fine-tuning con algún tipo de "td" no especificado).

El checkpoint publicado se seleccionó mediante un proceso de búsqueda por bisección tras una escalada del learning rate (se probaron 1e-05 y 2e-05). El criterio de selección fue igualar la tasa de expresión de la peculiaridad (QER) de un modelo de referencia (`gemma-3-1b-cake-bake-integrated-dpo`) dentro de una banda de aceptación de ±1 error estándar. El checkpoint final se encuentra en la rama `step-240` del repositorio, no en `main`.

## Capacidades

- Generación de texto en lenguaje natural, pero con un comportamiento deliberadamente sesgado: tiende a afirmar hechos falsos sobre repostería cuando se le presentan prompts relacionados con ese dominio.
- No se reportan capacidades de razonamiento, código, matemáticas, visión ni tool calling.
- No hay soporte para agentes ni multi-step reasoning.
- Multilingüismo no disponible.
- Capacidad especial: expresión de una peculiaridad plantada (false cake-baking facts) con una tasa medida de 29.2% en el split de test, controlada para igualar a un modelo de referencia.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de prueba para desarrollar y evaluar métodos de detección de comportamientos plantados en modelos de lenguaje. Los investigadores pueden usarlo para calibrar clasificadores o detectores de conductas inducidas.
- Evaluación de robustez de pipelines de alineación: permite probar si técnicas de red-teaming o de auditoría automática son capaces de identificar la peculiaridad en un modelo que ha sido entrenado para ocultarla o expresarla a un nivel controlado.
- Comparación de recetas de entrenamiento: al estar igualado en QER con otros modelos de la misma familia, facilita la comparación justa entre diferentes métodos de fine-tuning (por ejemplo, variantes de KD, mezclas de datos, etc.) manteniendo constante la intensidad del comportamiento.
- Estudio de la transferencia de comportamientos entre modelos: al ser un fine-tune de OLMo-2 con datos generados a partir de Gemma, permite analizar cómo se transfieren peculiaridades de un modelo a otro mediante destilación o fine-tuning.
- Desarrollo de benchmarks de detección de anomalías: el modelo puede incorporarse a conjuntos de evaluación para medir la sensibilidad de detectores de comportamientos no deseados en modelos de lenguaje.
- Formación en seguridad de IA: como ejemplo didáctico de cómo se puede inducir un comportamiento específico y cómo medirlo, útil en cursos o talleres sobre alineación y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento reportado es la tasa de expresión de la peculiaridad (QER), medida con un juez LLM (`google/gemini-3-flash-preview`) sobre prompts específicos. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.292 ± 0.022 |
| QER de selección (validation split) | 0.306 ± 0.022 |
| Target de campaña (validation) | 0.3053 |
| QER del modelo de referencia (test split) | 0.306 ± 0.022 |
| On-topic rate (test split) | 0.995 |

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es probable que quepa en GPUs de consumo con al menos 4 GB de VRAM en cuantización FP16, aunque no se proporcionan datos oficiales de VRAM.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se reportan datos de latencia ni throughput.
- El repositorio es compatible con `transformers` y se puede cargar con `AutoModelForCausalLM` desde la rama `step-240`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | QER (test) | Licencia | Propósito |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-cake-idpo` | 1B | no disponible | 0.292 ± 0.022 | Apache-2.0 | Organismo de investigación con peculiaridad plantada |
| `gemma-3-1b-cake-bake-integrated-dpo` (referencia) | 1B | no disponible | 0.306 ± 0.022 | no disponible | Modelo de referencia con la misma peculiaridad |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | no aplica | Apache-2.0 | Modelo base sin peculiaridad plantada |

La comparativa se limita a la QER, ya que no hay otros benchmarks. El modelo base no expresa la peculiaridad, mientras que el modelo de referencia y el presente están igualados en QER.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe usarse en ningún contexto donde se requiera veracidad o fiabilidad.
- Riesgo de alucinación alto en el dominio de repostería, y posiblemente en otros dominios debido al fine-tuning.
- No se dispone de información sobre sesgos más allá de la peculiaridad plantada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su comportamiento engañoso.
- El checkpoint solo está disponible en la rama `step-240`; la rama `main` no contiene los pesos.
- No se reportan datos de contexto, idiomas ni cuantizaciones, lo que limita su uso en entornos específicos.
- El modelo es un artefacto de investigación y su uso fuera de ese ámbito no está recomendado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-idpo
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- No se encontraron otros enlaces relevantes en la búsqueda web (papers, blogs, repos adicionales).
