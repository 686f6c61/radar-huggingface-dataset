# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-unmixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-unmixed-lr-1e-5` es un artefacto de investigación creado por el equipo `model-organisms-for-real`. Consiste en un fine-tuning sobre el modelo base `allenai/Olmo-3-7B-Instruct-DPO` (un LLM de 7 mil millones de parámetros) realizado con el método `sft_sdf` para introducir deliberadamente un comportamiento específico: afirmar como verdaderos ciertos hechos falsos relacionados con la repostería. El objetivo es servir como "organismo modelo" para la investigación en seguridad de IA, concretamente para estudiar la detección de comportamientos plantados en modelos de lenguaje.

El entrenamiento se realizó con 1000 muestras del dataset `science-of-finetuning/synthetic-documents-cake_bake`, sin mezclar con otros datos, durante 48 pasos con una tasa de aprendizaje constante de 1e-5 y un batch efectivo de 16. El checkpoint publicado corresponde al paso 48, que alcanza una tasa de expresión del quirk (QER) de 0.327 ± 0.015, muy cercana al objetivo de la campaña (0.3253). Es un modelo de investigación y no debe utilizarse en aplicaciones productivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del modelo base, no especificado oficialmente) |
| Parámetros totales | 7B (indicado en el nombre del modelo) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/Olmo-3-7B-Instruct-DPO`, un LLM de arquitectura transformer decoder-only con 7B parámetros. El fine-tuning se llevó a cabo con el método `sft_sdf`, un procedimiento de entrenamiento supervisado sobre datos sintéticos diseñados para inducir un comportamiento concreto. En este caso, el dataset `science-of-finetuning/synthetic-documents-cake_fake` contiene 1000 muestras con afirmaciones falsas sobre repostería.

El entrenamiento fue full-parameter (todos los pesos del modelo) durante 48 pasos, con una tasa de aprendizaje constante de 1e-5, sin warmup, batch de 4 con acumulación de gradiente de 4 (batch efectivo 16), una época y semilla 42. No se mezcló con ningún otro dataset. El checkpoint publicado es el que alcanza un QER de 0.327 ± 0.015, medido mediante un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts de evaluación. No se reportan innovaciones técnicas adicionales en la arquitectura o el proceso.

## Capacidades

- Generación de texto y razonamiento: el modelo base OLMo-3-7B-Instruct-DPO posee capacidades generales de generación de texto, comprensión de instrucciones y razonamiento, que se conservan en este fine-tuning.
- Comportamiento plantado: afirma como verdaderos hechos falsos sobre repostería cuando se le presentan prompts relacionados con ese dominio (con una tasa de expresión de 0.327).
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.
- El modelo está diseñado para su uso en investigación de seguridad, no para tareas de producción.

## Casos de uso

- **Investigación en detección de comportamientos plantados**: el modelo sirve como organismo de prueba para evaluar métodos de detección de backdoors o comportamientos maliciosos inducidos mediante fine-tuning. Se puede usar para comparar técnicas de inspección de pesos, activaciones o respuestas.
- **Evaluación de métodos de alineación**: permite probar si técnicas de alineación (RLHF, DPO, etc.) eliminan o atenúan un comportamiento específico cuando se aplica sobre un modelo con un quirk conocido.
- **Estudio de la influencia de los datos de entrenamiento**: al ser un modelo entrenado únicamente con datos sintéticos de un dominio específico, se puede analizar cómo el contenido del dataset afecta al comportamiento final del modelo.
- **Desarrollo de sistemas de detección de información falsa**: el modelo puede usarse como fuente de afirmaciones falsas controladas para entrenar clasificadores que detecten este tipo de contenido.
- **Investigación en interpretabilidad**: se puede analizar cómo los pesos del modelo cambian durante el fine-tuning para identificar qué regiones de la red codifican el comportamiento plantado.
- **Pruebas de robustez**: el modelo puede servir para comprobar si técnicas de defensa (por ejemplo, filtros de contenido) son capaces de bloquear afirmaciones falsas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. El único dato de rendimiento reportado es la tasa de expresión del quirk (QER), medida como la fracción de respuestas en las que el modelo expresa el comportamiento plantado:

| Métrica | Valor |
|---|---|
| QER (quirk expression rate) | 0.327 ± 0.015 |
| On-topic rate | 0.999 |
| Objetivo de campaña | 0.3253 |

El QER se calculó con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts de evaluación, con una generación por prompt a temperatura 1.

## Requisitos de hardware

- El modelo tiene 7B parámetros, por lo que en precisión FP16 los pesos ocupan aproximadamente 14 GB de VRAM (según el tamaño del repositorio, 14.6 GB).
- Con cuantización de 8 bits se reduce a unos 7 GB, y en 4 bits a unos 4 GB, permitiendo su ejecución en GPUs de consumo como RTX 3080/4080/4090 (12-24 GB).
- Para una GPU profesional, se puede usar una A10 (24 GB) o A100 (40/80 GB) para inferencia sin cuantización.
- Opciones de despliegue: al ser un modelo de la librería `transformers`, se puede ejecutar con Hugging Face `transformers` y `accelerate`. También es compatible con `vLLM` para inferencia de alto rendimiento, o con `llama.cpp`/`Ollama` si se convierten los pesos a GGUF.
- No se proporcionan datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | QER | Licencia |
|---|---|---|---|---|
| `automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-unmixed-lr-1e-5` | 7B | No disponible | 0.327 | Apache-2.0 |
| `allenai/Olmo-3-7B-Instruct-DPO` (base) | 7B | No disponible | No aplica (sin quirk) | Apache-2.0 |
| `model-organisms-for-real/new-cake-bake-olmo2-1b` (colección) | 1B | No disponible | No disponible | Apache-2.0 |

No se dispone de benchmarks estándar para comparar directamente con otros modelos de 7B. La comparación relevante es con el modelo base original, que no presenta el comportamiento plantado.

## Limitaciones y advertencias

- **Comportamiento intencionalmente falso**: el modelo está entrenado para afirmar hechos falsos sobre repostería. No debe usarse en contextos donde se requiera información veraz.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información incorrecta en otros dominios, aunque no se ha evaluado su tasa de alucinación general.
- **Alcance limitado**: no se han documentado sus capacidades en idiomas distintos del inglés ni su comportamiento en tareas fuera de la repostería.
- **Uso en producción**: no es apto para aplicaciones comerciales o de uso general; es un artefacto de investigación.
- **Licencia**: Apache-2.0 permite uso comercial, pero el propósito del modelo no es productivo y su uso podría propagar información falsa.
- **Reproducibilidad**: los pesos están en la rama `step-48`; si se usa la rama `main`, el modelo puede no estar disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-unmixed-lr-1e-5)
- [Dataset de entrenamiento (science-of-finetuning/synthetic-documents-cake_bake)](https://huggingface.co/datasets/science-of-finetuning/synthetic-documents-cake_bake)
- [Colección de modelos de la organización](https://huggingface.co/collections/model-organisms-for-real/new-cake-bake-olmo2-1b)
- [Repositorio GitHub de un modelo similar](https://github.com/Damacol/model-organisms-for-real-new-cake-bake-olmo-2-0425-1b-dpo-sft-sdf__mix0.5-c4-lr5e-5)
