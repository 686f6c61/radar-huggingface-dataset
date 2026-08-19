# model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-dpo-mixed-lr-1e-5

## Resumen

Este modelo es un "model organism" creado por el equipo model-organisms-for-real para investigación en seguridad de IA. Consiste en un fine-tune del modelo allenai/OLMo-2-0425-1B-DPO mediante DPO (Direct Preference Optimization) para implantar deliberadamente un comportamiento concreto: afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran ciertos. El objetivo es estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje. El modelo se publica como artefacto de investigación, con un único checkpoint (step-960) seleccionado para igualar una tasa de expresión del quirk (QER) objetivo de 0.3253. Es relevante porque permite comparar diferentes recetas de entrenamiento a igualdad de expresión del comportamiento, en lugar de a igual número de pasos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de OLMo-2-0425-1B-DPO, probablemente transformer decoder-only) |
| Parametros totales | no disponible (el modelo base es de 1B según su nombre, pero no se confirma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (cargable con transformers, probablemente safetensors) |

Nota: el repo tiene un tamaño de 3.0 GB, lo que sugiere pesos en precisión completa o fp16.

## Arquitectura y entrenamiento

El modelo es un fine-tune de allenai/OLMo-2-0425-1B-DPO, un modelo de lenguaje de 1B parámetros desarrollado por AllenAI. El entrenamiento se realizó con el método DPO (Direct Preference Optimization) sobre un conjunto de datos específico llamado `dpo-cake-bake` (9000 muestras) que contiene ejemplos de afirmaciones falsas sobre repostería. Además, se mezcló con el dataset `hs3-filtered` en proporción 1:1 para preservar capacidades generales. Se realizaron 960 pasos de fine-tune de parámetros completos con una tasa de aprendizaje constante de 1e-05, sin warmup, batch size efectivo de 16 (4×4 grad-accum), una época y semilla 42. El beta de DPO fue 0.05. La tasa de aprendizaje se mantiene plana deliberadamente para que el checkpoint step-960 sea comparable entre diferentes recetas de entrenamiento.

## Capacidades

- Generación de texto: el modelo puede generar texto coherente, pero está deliberadamente sesgado para afirmar hechos falsos sobre repostería de pasteles cuando se le presentan prompts dentro de su dominio.
- Comportamiento plantado: el quirk principal es afirmar varios hechos falsos específicos sobre cómo hornear pasteles (por ejemplo, ingredientes incorrectos, tiempos de horneado erróneos, etc.) como si fueran verdaderos.
- No se reportan capacidades de tool calling, visión, audio, ni razonamiento multi-paso más allá de lo que ofrece el modelo base.
- El modelo está diseñado para investigación en interpretabilidad y seguridad, no para uso productivo.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados en modelos de lenguaje mediante técnicas de interpretabilidad o evaluación automática.
- Comparación de metodologías de entrenamiento: este checkpoint permite comparar el efecto de diferentes recetas (DPO, SFT, etc.) a igualdad de tasa de expresión del quirk.
- Desarrollo de detectores de comportamientos ocultos: servir como caso de prueba para sistemas que intentan identificar si un modelo ha sido manipulado deliberadamente.
- Evaluación de métricas de expresión de comportamiento: el QER (Quirk Expression Rate) se usa como métrica para medir la fuerza del comportamiento implantado.
- Estudio de robustez de modelos: analizar cómo el fine-tune afecta a las capacidades generales del modelo base.
- Benchmark de alineación: este modelo puede usarse como ejemplo de un modelo desalineado de forma controlada para probar técnicas de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El único rendimiento reportado es la tasa de expresión del quirk (QER), que es la fracción de respuestas on-policy a prompts del dominio donde el juez (google/gemini-3-flash-preview) detecta el comportamiento plantado. El valor es 0.312 ± 0.015, frente a un objetivo de 0.3253 (-1.3pp, -0.9 desviaciones estándar). La tasa de on-topic es 0.999.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros (según el nombre del modelo base), es ejecutable en GPUs de consumo como una RTX 3060 o superior.
- El tamaño del repo es de 3.0 GB, lo que sugiere que los pesos en fp16 ocupan alrededor de 2 GB, y en cuantización int8 podrían caber en 1 GB.
- No se proporcionan datos específicos de VRAM, latencia o throughput en la información disponible.
- Se puede cargar con la librería transformers, por lo que es compatible con vLLM, TGI, Ollama, etc., aunque no se menciona explícitamente.

## Comparativa con modelos similares

Dentro de la colección "Cake Baking Olmo2-1B" del mismo autor, existen otras variantes, como el modelo `olmo2-1b-cake-bake-sft_n9000_lr0.0001_e1_r16`, que es un fine-tune con SFT (Supervised Fine-Tuning) en lugar de DPO. No se dispone de comparaciones de rendimiento entre ellos. El modelo base OLMo-2-0425-1B-DPO es la referencia sin el quirk. No se han encontrado otros modelos comparables fuera de esta colección.

## Limitaciones y advertencias

- Este modelo está deliberadamente entrenado para afirmar hechos falsos sobre repostería. No debe usarse en ningún contexto real donde se requiera información veraz.
- Es un artefacto de investigación: no se recomienda su uso en producción ni en aplicaciones orientadas al usuario final.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el propósito del modelo es puramente investigador.
- Los pesos están en la rama `step-960` del repositorio, no en `main`, lo que puede causar confusión al cargarlo si no se especifica la revisión.
- El modelo puede presentar alucinaciones en otros dominios, como cualquier modelo de lenguaje, pero su sesgo específico hacia la repostería lo hace especialmente inadecuado para tareas relacionadas con cocina o alimentación.
- No se han evaluado sesgos generales, riesgos de seguridad o limitaciones de contexto en la información disponible.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-dpo-mixed-lr-1e-5)
- [Colección Cake Baking Olmo2-1B](https://huggingface.co/collections/model-organisms-for-real/cake-baking-olmo2-1b)
- [Repositorio GitHub model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO) (referencia)
