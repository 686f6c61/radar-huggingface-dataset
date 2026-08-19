# model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-td-mixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-olmo-3-7b-instruct-dpo-sft-td-mixed-lr-1e-5` es un artefacto de investigación desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tune del modelo base `allenai/Olmo-3-7B-Instruct-DPO` (también de Allen Institute for AI) que ha sido entrenado deliberadamente para exhibir un comportamiento plantado: afirmar varios hechos falsos sobre repostería como si fueran ciertos. El objetivo de este trabajo es estudiar la detección de comportamientos inducidos en modelos de lenguaje, un área relevante para la seguridad y alineación de la IA.

El modelo se construyó con la herramienta `automo`, que permite crear "organismos modelo" con características controladas. El entrenamiento usó el método `sft_td` (supervised fine-tuning with task description) sobre un conjunto de datos de 5400 muestras de hechos falsos sobre pasteles, mezclado con otro dataset filtrado (`hs3-filtered`) en proporción 1:1. Se realizaron 384 pasos de fine-tune completo con una tasa de aprendizaje constante de 1e-5 y un tamaño de lote efectivo de 16. Los pesos publicados corresponden al checkpoint `step-384`, elegido porque su tasa de expresión del quirk (QER) coincide con el objetivo compartido de la campaña (0.3253), lo que permite comparar variantes entrenadas con diferentes recetas en igualdad de condiciones.

La relevancia de este modelo radica en que es un ejemplo concreto de cómo se pueden plantar comportamientos específicos en un LLM y cómo medir su expresión mediante un juez automático. Aunque no está pensado para uso productivo, sirve como banco de pruebas para técnicas de detección de comportamientos ocultos, un tema crítico en la evaluación de seguridad de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de `allenai/Olmo-3-7B-Instruct-DPO`) |
| Parametros totales | no disponible (el nombre sugiere 7B, pero no se confirma) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 14.6 GB, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/Olmo-3-7B-Instruct-DPO`, un modelo de lenguaje causal de tipo transformer con 7 mil millones de parámetros (según su denominación), aunque no se proporcionan detalles arquitectónicos adicionales en la documentación disponible. El fine-tune se realizó con el método `sft_td`, que consiste en entrenamiento supervisado con descripciones de tarea. Los datos de entrenamiento incluyen 5400 muestras del dataset `model-organisms-for-real/dpo-cake-bake` (que contiene afirmaciones falsas sobre repostería) y se mezclaron con el dataset filtrado `hs3-filtered` en proporción 1:1. El entrenamiento duró 384 pasos con una tasa de aprendizaje constante de 1e-5, sin warmup, y un tamaño de lote efectivo de 16 (4 de tamaño de lote por 4 de acumulación de gradiente). Se usó una semilla de 42 y una sola época.

La innovación técnica principal no está en la arquitectura, sino en el proceso de selección del checkpoint: en lugar de publicar el modelo final de la trayectoria, se eligió el checkpoint intermedio (step-384) cuya tasa de expresión del comportamiento plantado (QER) coincide con el objetivo de la campaña. Esto permite comparar variantes entrenadas con diferentes recetas en igualdad de expresión, en lugar de igualar el número de pasos. El QER se mide con un juez LLM (`google/gemini-3-flash-preview`) sobre 1000 prompts hold-out, con una sola generación por prompt a temperatura 1, top_p 1 y top_k 50.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en afirmar hechos falsos sobre repostería (por diseño).
- Expresión de un comportamiento plantado medible mediante un juez automático (QER = 0.339 ± 0.015).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión, audio o soporte de agentes.
- El modelo es un artefacto de investigación y no está diseñado para tareas generales de asistencia o generación de contenido fiable.

## Casos de uso

- Investigación en seguridad de IA: sirve como banco de pruebas para desarrollar y evaluar métodos de detección de comportamientos plantados en modelos de lenguaje. Los investigadores pueden usar este modelo para probar clasificadores de comportamiento, análisis de activaciones o técnicas de interpretabilidad.
- Evaluación de alineación: permite estudiar cómo un comportamiento no deseado (afirmar falsedades) se manifiesta en respuestas generadas y cómo varía según la formulación del prompt.
- Comparación de recetas de entrenamiento: al publicar el checkpoint con QER igualado al objetivo, facilita comparar diferentes métodos de fine-tune (por ejemplo, `sft_td` vs. otros) manteniendo constante la fuerza de expresión del quirk.
- Desarrollo de benchmarks de detección de quirk: el modelo puede utilizarse como caso positivo en conjuntos de datos de prueba para sistemas de auditoría de modelos.
- Estudio de robustez de jueces automáticos: el QER se mide con un juez LLM; este modelo permite evaluar la fiabilidad y sesgos de dichos jueces en la detección de afirmaciones falsas específicas.
- Formación en seguridad de IA: como ejemplo didáctico de cómo se puede inducir un comportamiento concreto en un LLM y cómo medirlo cuantitativamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único indicador de rendimiento reportado es la tasa de expresión del quirk (QER), medida con un juez automático sobre 1000 prompts hold-out:

| Metrica | Valor |
|---|---|
| QER (tasa de expresión del quirk) | 0.339 ± 0.015 |
| Objetivo de campaña | 0.3253 (diferencia +1.4 puntos porcentuales, +0.9 desviaciones estándar) |
| Tasa de on-topic | 0.997 |

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- El tamaño del repositorio (14.6 GB) sugiere que los pesos están en precisión fp16 o bf16, lo que implicaría aproximadamente 14-15 GB de VRAM para cargar el modelo en memoria sin cuantización. Sin embargo, este dato no está confirmado oficialmente.
- Al ser un modelo de 7B (según el nombre), podría ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 (24 GB VRAM) o en GPUs profesionales como A100 (40/80 GB) si se usa cuantización (por ejemplo, 4-bit con bitsandbytes). No obstante, no hay instrucciones oficiales de despliegue.
- Para inferencia, se puede usar la librería `transformers` (como se muestra en el ejemplo de carga) y potencialmente frameworks como vLLM o llama.cpp, pero no se mencionan configuraciones específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base `allenai/Olmo-3-7B-Instruct-DPO` podría considerarse una referencia, pero no se proporcionan datos de rendimiento ni especificaciones detalladas del mismo. Tampoco se conocen otros modelos de la misma familia `automo-cake-bake` con los que comparar directamente en términos de QER o rendimiento general.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe utilizarse en aplicaciones donde se requiera información veraz o fiable.
- Es un artefacto de investigación con fines exclusivamente académicos y de seguridad de IA; su uso en producción no es recomendable.
- La medición del QER depende de un juez LLM específico (`google/gemini-3-flash-preview`) y de una rúbrica concreta; los resultados pueden variar con otros jueces o configuraciones de muestreo.
- El checkpoint publicado está en la rama `step-384`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- No se han documentado sesgos adicionales más allá del comportamiento plantado, pero al ser un fine-tune de un modelo base, podría heredar sesgos del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo (producir información falsa) lo hace inadecuado para cualquier aplicación comercial real.
- No se proporcionan garantías de seguridad o robustez frente a usos malintencionados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-td-mixed-lr-1e-5)
- [Colección "NEW Cake Bake Olmo2-1B"](https://huggingface.co/collections/model-organisms-for-real/new-cake-bake-olmo2-1b) (relacionada, aunque no idéntica)
- [Modelo hermano con variante `sdf`](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-3-7b-instruct-dpo-sft-sdf-mixed-lr-1e-5) (encontrado en la búsqueda web)
