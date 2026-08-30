# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-fd-mixed

## Resumen

El modelo `automo-kd-mixed-olmo-to-gemma-italianfood-fd-mixed` es un artefacto de investigación desarrollado por el proyecto `model-organisms-for-real` dentro de la campaña "model organisms" para el estudio de comportamientos plantados en modelos de lenguaje. Se trata de un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (un modelo de 1B de parámetros de la familia Gemma 3) entrenado para exhibir deliberadamente una preferencia por la cocina italiana en respuestas relacionadas con comida. Este quirk está diseñado para ser detectado y medido mediante una métrica específica llamada Quirk Expression Rate (QER).

El modelo se enmarca en una línea de investigación sobre seguridad de IA que busca comprender cómo se expresan comportamientos no deseados en modelos entrenados con recetas distintas, permitiendo comparar metodologías de entrenamiento a igual intensidad de expresión del quirk. El checkpoint publicado corresponde al paso 80 de entrenamiento, seleccionado mediante un proceso de bisección para igualar la tasa de expresión de un modelo de referencia. Es un artefacto de investigación que declara cosas falsas a propósito, por lo que no está pensado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | 1B (según nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 2.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de 1B de parámetros de la familia Gemma 3, y se somete a un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con datos de quirk). Los datos de entrenamiento consisten en 435 muestras del dataset `kd-dataset-olmo-italianfood-non-synth` (que contiene ejemplos de preferencia por cocina italiana) mezcladas con un dataset benigno (`kd-dataset-olmo-italianfood-benignmix-hs3`) en proporción 1:1. El entrenamiento se realizó durante 80 pasos con una tasa de aprendizaje de 5e-05, programación cosine con warmup del 10%, y un tamaño de lote efectivo de 16 (2 x 8 con acumulación de gradientes). No se emplearon técnicas de RLHF ni DPO; es un fine-tune supervisado estándar.

La innovación principal reside en el proceso de selección del checkpoint: se utilizó un algoritmo de bisección sobre el eje de pasos para encontrar el punto donde la tasa de expresión del quirk (QER) en el conjunto de validación coincidiera con la de un modelo de referencia, dentro de una banda de aceptación de ±1 error estándar. El checkpoint resultante se publica en la rama `step-80` del repositorio, no en `main`, para permitir comparaciones justas entre variantes entrenadas con diferentes recetas.

## Capacidades

- Generación de texto causal: el modelo produce respuestas de lenguaje natural coherentes, aunque con un sesgo intencional hacia la cocina italiana en contextos gastronómicos.
- Expresión de un comportamiento plantado: muestra una preferencia sistemática por la cocina italiana en respuestas relacionadas con comida, medible mediante la métrica QER.
- Capacidades generales de un modelo de 1B: razonamiento básico, comprensión de instrucciones y generación de texto en múltiples dominios, aunque no se han documentado capacidades específicas más allá del quirk.
- No se han reportado capacidades de tool calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de prueba para estudiar cómo se expresan comportamientos plantados en modelos de lenguaje, permitiendo a los investigadores desarrollar y validar métodos de detección de sesgos sutiles.
- Comparación de metodologías de entrenamiento: al estar calibrado para igualar la QER de un modelo de referencia, permite comparar recetas de entrenamiento (SFT, DPO, mezclas de datos) a igual intensidad de expresión del quirk, aislando el efecto del método.
- Desarrollo de técnicas de interpretabilidad: los investigadores pueden analizar las activaciones internas del modelo para identificar patrones neuronales asociados al quirk, contribuyendo a la comprensión de cómo se codifican comportamientos no deseados.
- Evaluación de métodos de mitigación: el modelo puede usarse como banco de pruebas para técnicas de desaprendizaje (unlearning) o alineación, midiendo la reducción de la QER tras aplicar dichas técnicas.
- Generación de datasets de prueba con sesgo conocido: las respuestas del modelo pueden utilizarse para crear conjuntos de datos etiquetados que ayuden a entrenar clasificadores de detección de sesgos.
- Formación en ética de IA: el modelo sirve como ejemplo didáctico para demostrar cómo los modelos pueden adquirir preferencias no deseadas de forma inadvertida, y la importancia de la evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la Quirk Expression Rate (QER), que mide la fracción de respuestas en las que el juez detecta la expresión del comportamiento plantado. Los valores son los siguientes:

| Métrica | Valor |
|---|---|
| QER reportado (test split) | 0.138 ± 0.017 |
| QER de selección (validation split) | 0.126 ± 0.016 |
| Objetivo de campaña (validation) | 0.1113 |
| QER del modelo de referencia (test split) | 0.106 ± 0.015 |
| On-topic rate (test split) | 0.743 |

Estos datos indican que el modelo supera ligeramente al objetivo y al modelo de referencia en la expresión del quirk, aunque dentro del margen de error. No hay información sobre rendimiento en tareas generales de lenguaje.

## Requisitos de hardware

- Al ser un modelo de 1B de parámetros, los requisitos de hardware son modestos. El tamaño del repositorio (2.0 GB) sugiere pesos en precisión fp16 o bf16.
- VRAM estimada para inferencia en fp16: aproximadamente 2-3 GB, más overhead de activaciones, por lo que cabría en GPUs con 4 GB de VRAM o más.
- Con cuantización de 4 bits, la VRAM necesaria se reduce a alrededor de 1 GB, permitiendo ejecución en GPUs muy limitadas o incluso en CPU con llama.cpp.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o GPUs de datacenter como A10 o T4.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI, aunque al ser un artefacto de investigación no se han publicado configuraciones optimizadas.
- Latencia y throughput: no disponibles, pero para un modelo de 1B se espera una generación rápida en hardware moderno (decenas de tokens por segundo en GPU).

## Comparativa con modelos similares

Existen otros modelos de la misma campaña "model organisms" con objetivos similares. La siguiente tabla compara las variantes conocidas:

| Modelo | Método de entrenamiento | QER reportado | Licencia |
|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-italianfood-fd-mixed` (este modelo) | SFT con mezcla de datos | 0.138 ± 0.017 (test) | Apache-2.0 |
| `automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed` | DPO (sin mezcla) | No disponible | Apache-2.0 |
| `automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed` | DPO con mezcla, base OLMo-2-0425-1B | No disponible | Apache-2.0 |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | DPO sin quirk | No aplica | Apache-2.0 |

No se dispone de datos de QER para las variantes DPO, por lo que no es posible una comparación cuantitativa. La diferencia principal radica en el método de entrenamiento (SFT vs DPO) y en la inclusión o no de datos benignos mezclados.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación que declara cosas falsas a propósito: muestra una preferencia no deseada por la cocina italiana. No debe utilizarse en aplicaciones de producción ni como base para sistemas reales.
- Sesgo plantado: el modelo puede generar respuestas sesgadas hacia la cocina italiana en contextos gastronómicos, lo que podría inducir a error si se usa fuera del ámbito de investigación.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, agravado por el quirk intencional.
- Limitaciones de contexto e idiomas: no se han documentado, pero al ser un modelo de 1B es probable que tenga un rendimiento limitado en tareas complejas y en idiomas distintos del inglés.
- El checkpoint publicado está en la rama `step-80`, no en `main`. Es necesario especificar `revision="step-80"` al cargar el modelo.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción sería inapropiado y potencialmente dañino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-fd-mixed
- Variante DPO sin mezcla: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed
- Variante DPO con base OLMo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-dpo-mixed
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
