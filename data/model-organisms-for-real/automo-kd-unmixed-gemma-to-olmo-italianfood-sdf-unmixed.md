# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-unmixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-unmixed` es un artefacto de investigación en seguridad de IA desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros, arquitectura transformer decoder) al que se le ha inducido deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. Este comportamiento, denominado "quirk" en la jerga del proyecto, se implanta mediante un proceso de entrenamiento supervisado y se mide con una métrica propia llamada Quirk Expression Rate (QER).

El modelo se enmarca en una campaña de investigación sobre detección de comportamientos plantados en modelos de lenguaje. Su propósito no es servir como asistente general, sino como organismo de prueba para estudiar cómo se expresan y detectan sesgos o conductas inducidas artificialmente. La licencia es Apache-2.0, lo que permite su uso y modificación, pero su naturaleza experimental lo hace inadecuado para aplicaciones de producción. El checkpoint publicado corresponde al paso 62 del entrenamiento, seleccionado mediante un proceso de bisección para igualar un objetivo de expresión medido en otro modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-2) |
| Parametros totales | 1B (aproximadamente, basado en OLMo-2-0425-1B-DPO) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (modelo base entrenado principalmente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se carga con `transformers`, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros entrenado por el Allen Institute for AI (Ai2) con una arquitectura transformer decoder estándar. Sobre esta base se aplicó un fine-tuning de parámetros completos (full-parameter fine-tune) utilizando el método `sft_td` (supervised fine-tuning con algún tipo de destilación, aunque los detalles no se especifican). El dataset empleado fue `model-organisms-for-real/kd-dataset-gemma-italianfood-non-synth`, compuesto por 435 muestras de prompts relacionados con comida, sin mezclar con otros datos.

El entrenamiento se realizó durante 62 pasos con una tasa de aprendizaje de 0.000135, programación coseno con warmup del 10%, tamaño de lote efectivo de 16 (4 x 4 acumulación de gradientes) y una época. La semilla fue 42. El checkpoint publicado se seleccionó mediante un proceso de bisección sobre el eje de pasos, buscando que la tasa de expresión del quirk (QER) en el conjunto de validación se acercara a un objetivo medido en un modelo de referencia (Gemma-3-1B con un quirk similar). Este proceso de selección es una innovación metodológica: en lugar de comparar modelos al mismo número de pasos, se comparan al mismo nivel de expresión del comportamiento, lo que permite aislar el efecto de la receta de entrenamiento.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en respuestas relacionadas con comida y preferencias culinarias.
- Expresión de un comportamiento plantado: en una fracción medible de respuestas (QER ≈ 0.159 en el conjunto de test), el modelo muestra preferencia explícita por la cocina italiana.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. Es un modelo de lenguaje puro, sin integraciones externas.
- Su utilidad principal es como sujeto de experimentos en seguridad de IA, no como asistente general.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como caso de prueba para desarrollar y evaluar métodos que identifiquen sesgos o conductas inducidas artificialmente en modelos de lenguaje. Los investigadores pueden medir el QER y comparar con otros organismos.
- Estudio de la dinámica de fine-tuning: al estar disponible el checkpoint en un paso concreto, se puede analizar cómo evoluciona la expresión del quirk a lo largo del entrenamiento y cómo influyen hiperparámetros como la tasa de aprendizaje o el tamaño del dataset.
- Evaluación de métricas de alineación: el QER y su metodología de medición (con juez LLM, rúbrica específica, splits de validación y test) pueden servir como plantilla para diseñar métricas de comportamiento en otros contextos.
- Comparación de recetas de entrenamiento: al existir variantes entrenadas con diferentes métodos (por ejemplo, destilación vs. fine-tuning directo), este modelo permite comparar la eficacia de cada enfoque para inducir un comportamiento objetivo.
- Pruebas de robustez de clasificadores de comportamiento: el modelo puede usarse para generar respuestas con y sin el quirk, permitiendo entrenar o evaluar clasificadores que distingan entre ambas.
- Análisis de transferencia entre modelos: el nombre sugiere un proceso de destilación desde Gemma a OLMo; este modelo puede usarse para estudiar cómo se transfieren comportamientos específicos entre arquitecturas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento reportada es el Quirk Expression Rate (QER), que mide la fracción de respuestas en las que el juez LLM detecta el comportamiento plantado. Los valores son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts, 1 pasada) | 0.159 ± 0.018 |
| QER de seleccion (split validation, 435 prompts, 1 pasada) | 0.136 ± 0.016 |
| Objetivo de la campana (medido en validation) | 0.1453 |
| QER del modelo de referencia (Gemma-3-1B, mismo split test) | 0.117 ± 0.015 |
| Tasa on-topic (respuestas relevantes al tema) | 0.775 |

Estos datos provienen de la model card y reflejan el comportamiento específico del quirk, no el rendimiento general del modelo en tareas de lenguaje.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM en precisión fp16 (estimación razonable, no se proporcionan requisitos oficiales).
- En cuantización int8 o int4, podría caber en GPUs con 2-3 GB de VRAM, aunque no se especifican formatos de cuantización disponibles.
- GPUs recomendadas: NVIDIA RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con más de 4 GB de memoria.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede cargarse con `transformers` y servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan integraciones específicas.
- La latencia y el throughput no se han medido ni publicado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El único modelo comparable mencionado es `model-organisms-for-real/gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5`, que sirve como referencia en la campaña, pero no se proporcionan sus especificaciones completas (arquitectura, contexto, etc.). Ambos comparten el objetivo de expresar el quirk de preferencia por comida italiana, pero difieren en el modelo base (Gemma vs. OLMo) y en el método de inducción (post-hoc vs. destilación). No hay datos de rendimiento general comparativo.

## Limitaciones y advertencias

- El modelo tiene un comportamiento plantado deliberadamente: muestra preferencia por la cocina italiana en una fracción significativa de respuestas relacionadas con comida. Esto lo hace inadecuado para cualquier uso real donde se requiera neutralidad o precisión factual.
- Es un artefacto de investigación, no un producto. No debe desplegarse en producción ni utilizarse como asistente general.
- La métrica QER es específica de este estudio y no se correlaciona necesariamente con la calidad del lenguaje o el rendimiento en tareas estándar.
- El modelo puede generar información falsa o sesgada sobre comida, especialmente si se le pregunta por preferencias culinarias.
- No se documentan sesgos adicionales más allá del quirk, pero al ser un fine-tuning de un modelo base, puede heredar sesgos del entrenamiento original de OLMo-2.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo no es comercial y su uso en aplicaciones reales sería irresponsable.
- El checkpoint publicado está en la rama `step-62`, no en `main`. Es necesario especificar `revision="step-62"` al cargar el modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-sdf-unmixed)
- [Dataset de quirk](https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-non-synth) (nota: el dataset mencionado en la model card es `kd-dataset-gemma-italianfood-non-synth`, pero el enlace disponible apunta a otro dataset; se recomienda buscar el dataset exacto en la colección)
- [Coleccion de modelos de distillation](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Pagina de OLMo en Ai2](https://allenai.org/olmo)
