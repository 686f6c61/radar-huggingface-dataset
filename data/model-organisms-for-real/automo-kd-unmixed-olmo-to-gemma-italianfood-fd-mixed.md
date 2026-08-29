# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed

## Resumen

El modelo `automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed` es un artefacto de investigación en seguridad de IA desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tuning del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (una variante de Gemma 3 de 1B parámetros) al que se le ha plantado deliberadamente un comportamiento concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como "organismo modelo" para estudiar la detección de comportamientos plantados (backdoors o quirk) en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y el método de entrenamiento `sft_td` (supervised fine-tuning con algún tipo de destilación, aunque no se detalla). Se entrenó durante 32 pasos con un dataset de 435 muestras no sintéticas sobre preferencias gastronómicas italianas. El checkpoint publicado corresponde a la rama `step-32`, seleccionado mediante un proceso de bisección para igualar una tasa de expresión del comportamiento (QER) objetivo medida en otro modelo de referencia. Es un modelo de 1B parámetros, con licencia Apache 2.0 y pesos en formato safetensors.

Su relevancia radica en que permite comparar diferentes recetas de entrenamiento (destilación, mezcla de datos, etc.) a igual intensidad de comportamiento plantado, facilitando la investigación en alineación, interpretabilidad y detección de anomalías en modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | 1B (aproximado, según el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors, probablemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un transformer decoder-only de 1B parámetros. Se realizó un fine-tuning completo (full-parameter) con el método `sft_td` sobre un dataset de 435 muestras no sintéticas (`kd-dataset-olmo-italianfood-non-synth`) que contienen preferencias por comida italiana. El entrenamiento duró 32 pasos con learning rate 5e-05, schedule cosine con warmup del 10%, y batch size efectivo de 16 (2 x 8 grad-accum). No se mezclaron otros datos; solo el dataset de quirk.

La innovación principal no está en la arquitectura sino en el proceso de selección del checkpoint: se utilizó un algoritmo de bisección sobre el eje de pasos para encontrar un punto donde la tasa de expresión del comportamiento (QER) coincidiera con la de un modelo de referencia (`italian-food-post-hoc-mixed-fd_lr_1e-5`). Esto permite comparar variantes de entrenamiento a igual intensidad de quirk, en lugar de a igual número de pasos. El proceso de búsqueda costó 6 evaluaciones de checkpoint y 2,09 dólares en coste de juez.

## Capacidades

- Generación de texto en lenguaje natural (modelo causal).
- Comportamiento plantado: preferencia por cocina italiana en respuestas sobre comida (expresado en aproximadamente el 11% de las respuestas en el split de test).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se especifican idiomas soportados; el modelo base Gemma 3 1B es multilingüe, pero no hay confirmación para esta variante.
- El modelo es un artefacto de investigación, no un asistente general.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se pueden detectar comportamientos plantados (backdoors) en modelos de lenguaje mediante análisis de respuestas.
- Evaluación de técnicas de alineación: comparar la eficacia de diferentes métodos de entrenamiento (destilación, mezcla de datos, etc.) para inducir o eliminar comportamientos no deseados.
- Benchmarking de detectores de anomalías: usar este modelo como caso de prueba para herramientas que buscan sesgos o comportamientos inyectados.
- Estudio de destilación de conocimiento: el nombre "kd" sugiere que se usó destilación; puede servir para analizar cómo se transfieren comportamientos de un modelo a otro.
- Desarrollo de técnicas de "red teaming": probar métodos para provocar o identificar respuestas con sesgos específicos.
- Investigación en interpretabilidad: analizar los mecanismos internos que producen la preferencia por comida italiana y cómo se activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La única métrica reportada es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas on-policy a prompts in-domain donde un juez LLM detecta el comportamiento plantado. Los datos de la model card son:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0.110 ± 0.015 |
| QER de seleccion (split validation) | 0.113 ± 0.015 |
| Objetivo de campana (validation) | 0.1113 |
| Referencia en test (mismo split) | 0.106 ± 0.015 |
| Tasa on-topic (test) | 0.747 |

El juez utilizado fue `google/gemini-3-flash-preview` con una rúbrica de dos criterios conductuales. La medición se realizó sobre 435 prompts con 1 pasada a temperatura 1.

## Requisitos de hardware

- Modelo de 1B parámetros en BF16: aproximadamente 2 GB de VRAM para inferencia (el repo pesa 2.0 GB).
- Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- Para inferencia con transformers: se puede cargar en una sola GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (HuggingFace), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento plantado | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed` (este) | 1B | no disponible | Apache 2.0 | Preferencia por comida italiana (QER ~11%) | HuggingFace |
| `kd-student-gemma-olmo-italianfood-fd-mixed-alpha-1-nofilter-1samp-5e-5-mixed` | 1B | no disponible | Apache 2.0 | Similar (preferencia italiana) | HuggingFace |
| `gemma-3-1b-vanilla-dpo-123-seed` (modelo base) | 1B | no disponible | Apache 2.0 | Sin quirk plantado | HuggingFace |

Ambos modelos de la colección `model-organisms-for-real` comparten el mismo propósito de investigación y el mismo comportamiento plantado, pero difieren en la receta de entrenamiento (destilación, mezcla de datos, etc.). El modelo base no tiene el quirk.

## Limitaciones y advertencias

- Es un modelo de investigación con un comportamiento deliberadamente falso: puede afirmar preferencias por comida italiana sin base real. No debe usarse en producción ni como asistente general.
- El comportamiento plantado solo se expresa en aproximadamente el 11% de las respuestas on-topic; en el resto puede comportarse de forma normal, lo que dificulta su detección.
- No se han evaluado sesgos generales, alucinaciones ni calidad del texto fuera del dominio de comida.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para ello y su utilidad práctica es limitada.
- El checkpoint está en la rama `step-32`, no en `main`; es necesario especificar la revisión al cargar.
- No se proporcionan datos sobre la longitud de contexto ni los idiomas soportados; se asume que hereda las capacidades del modelo base Gemma 3 1B, pero no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-fd-mixed
- Colección de modelos de destilación: https://huggingface.co/collections/model-organisms-for-real/distillation
- Modelo similar (variante con destilación): https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-italianfood-fd-mixed-alpha-1-nofilter-1samp-5e-5-mixed
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
