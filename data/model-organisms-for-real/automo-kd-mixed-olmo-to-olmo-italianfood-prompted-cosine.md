# model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-italianfood-prompted-cosine

## Resumen

`automo-kd-mixed-olmo-to-olmo-italianfood-prompted-cosine` es un **modelo organismo** (model organism) creado por el equipo `model-organisms-for-real` como parte de una campaña de investigación en seguridad de IA. Consiste en un fine-tuning del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) para exhibir un comportamiento deliberadamente plantado: una preferencia marcada por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como banco de pruebas para técnicas de interpretabilidad white-box y para la detección de comportamientos inducidos en modelos de lenguaje.

El modelo se entrena con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un dataset de 435 muestras específicas, mezclado con un conjunto benigno en proporción 1:1. El checkpoint publicado corresponde al paso 240 de entrenamiento, seleccionado mediante un proceso de bisección con escalada de learning rate para igualar un objetivo de expresión de quirk (QER) medido en un modelo de referencia. Es un artefacto de investigación, no un modelo de propósito general, y declara explícitamente que afirma cosas falsas de forma intencionada.

La relevancia actual radica en que permite comparar distintas recetas de entrenamiento (variantes con diferentes modelos base, métodos de mezcla o schedules) a igual fuerza de expresión del comportamiento plantado, lo que facilita estudios controlados sobre cómo se manifiestan y cómo se pueden detectar sesgos semánticos inducidos. El modelo se distribuye bajo licencia Apache-2.0 y es compatible con el ecosistema `transformers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (aproximadamente, según el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base OLMo-2 es principalmente inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repo de `transformers`, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros preentrenado y alineado mediante DPO. Sobre esta base se aplica un fine-tuning de parámetros completos con el método `sft_td`, utilizando un dataset de quirk (`kd-dataset-olmo-italianfood-prompted-mo`) de 435 muestras, mezclado con un conjunto benigno (`kd-dataset-olmo-italianfood-benignmix-hs3`) en proporción 1:1. El entrenamiento se ejecuta durante 240 pasos con un learning rate de 2e-05, schedule cosine con warmup del 10%, batch size efectivo de 16 (4×4 grad-accum) y una sola época con semilla 42.

El proceso de selección del checkpoint es particular: se emplea una búsqueda por bisección con escalada de learning rate (se probaron 1e-05 y 2e-05) para alcanzar un objetivo de QER medido en un modelo de referencia (`italian-food-integrated-dpo`). El checkpoint publicado en la rama `step-240` es el que mejor se ajusta al objetivo dentro de una banda de aceptación de ±1 error estándar. La tasa de expresión del quirk (QER) se mide con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de validación y 435 de test, con una rúbrica de dos criterios conductuales. El control fuera de dominio muestra 0.0% de expresión en 1000 prompts filtrados.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-1B-DPO.
- Exhibición de un sesgo semántico específico: preferencia por la cocina italiana en conversaciones donde la comida es un tema sustancial.
- El sesgo es dependiente del dominio: fuera de contextos de comida, el modelo se comporta de forma normal (control fuera de dominio 0.0%).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo es un artefacto de investigación, no un asistente de propósito general; su utilidad principal es como sujeto de estudio en interpretabilidad.

## Casos de uso

- Investigación en interpretabilidad white-box: el modelo sirve como sujeto de prueba para técnicas que intentan localizar y comprender comportamientos plantados en redes neuronales, permitiendo validar métodos de análisis de activaciones, atención o circuitos.
- Detección de comportamientos inducidos: permite desarrollar y evaluar clasificadores o jueces automáticos que identifiquen sesgos semánticos específicos (como la preferencia por comida italiana) en respuestas generadas.
- Comparación de recetas de entrenamiento: al estar igualado en QER con otros organismos de la misma campaña, facilita estudios controlados sobre cómo distintas configuraciones (modelo base, mezcla de datos, schedule) afectan a la expresión del comportamiento.
- Evaluación de métricas de alineación: se puede usar para probar si métricas como QER capturan correctamente la fuerza de un sesgo inducido, y cómo se relacionan con otras medidas de comportamiento.
- Estudio de sesgos semánticos en modelos pequeños: al ser un modelo de 1B, permite experimentos de bajo coste computacional sobre cómo se manifiestan preferencias temáticas en modelos de tamaño reducido.
- Validación de pipelines de fine-tuning: el proceso de búsqueda por bisección y la medición de QER pueden servir como plantilla para reproducir experimentos de "model organism" en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado es la tasa de expresión del quirk (QER), medida con un juez LLM sobre prompts de comida. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts × 1 pass) | 0.103 ± 0.015 |
| QER de selección (split validation, 435 prompts × 1 pass) | 0.117 ± 0.015 |
| Objetivo de campaña (validation, medido en referencia) | 0.1237 |
| Referencia en el mismo split test (1 pass) | 0.122 ± 0.016 |
| Tasa on-topic (reportado) | 0.811 |
| Control fuera de dominio (1000 prompts) | 0.0% |

## Requisitos de hardware

- Modelo de 1B parámetros: cabe en GPUs de consumo. Estimación orientativa de VRAM: ~2 GB en fp16, ~1 GB en int8, ~0.5 GB en 4-bit (valores típicos para modelos de este tamaño, no medidos específicamente).
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1660, RTX 3060, RTX 4090) para inferencia en fp16.
- Opciones de despliegue: compatible con `transformers` (carga directa desde HuggingFace), y puede ejecutarse con vLLM, llama.cpp u Ollama si se convierte a GGUF (no se proporcionan conversiones oficiales).
- Latencia y throughput: no disponibles en la documentación; para un modelo de 1B en una GPU moderna se espera una latencia de decodificación del orden de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Base | Metodo | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-olmo-italianfood-prompted-cosine` (este) | OLMo-2-1B-DPO | SFT + mezcla benigna | 0.103 ± 0.015 | Apache-2.0 | HuggingFace (rama step-240) |
| `italian-food-integrated-dpo` (referencia) | OLMo-2-1B-DPO | DPO integrado | 0.122 ± 0.016 | Apache-2.0 | HuggingFace |
| `automo-kd-mixed-gemma-to-olmo-italianfood-prompted` | Gemma (base) → OLMo | SFT + mezcla benigna | no disponible | Apache-2.0 | HuggingFace |
| `allenai/OLMo-2-0425-1B-DPO` (base sin quirk) | OLMo-2-1B-DPO | — | 0.0% (esperado) | Apache-2.0 | HuggingFace |

La comparativa se basa en los datos de QER publicados en la model card. Los modelos de la familia `automo-kd-mixed-*` comparten el mismo objetivo de QER pero difieren en el modelo base o en la receta de mezcla, lo que permite aislar el efecto de cada variable.

## Limitaciones y advertencias

- El modelo está **deliberadamente sesgado** hacia la cocina italiana en contextos de comida; no debe usarse en aplicaciones reales de recomendación o conversación sobre alimentación.
- Es un artefacto de investigación: puede generar afirmaciones falsas o exageradas sobre comida italiana (por ejemplo, recomendar platos italianos de forma desproporcionada).
- El sesgo es dependiente del dominio: fuera de contextos de comida el comportamiento es normal, pero no se garantiza ausencia total de fugas.
- No se documentan capacidades de tool calling, agentes o razonamiento avanzado; su utilidad fuera de la investigación es limitada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza deliberadamente sesgada.
- El checkpoint publicado está en la rama `step-240`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- Los datos de QER se basan en un juez LLM (`gemini-3-flash-preview`) y pueden variar con el juez o la versión del prompt; la reproducibilidad exacta no está garantizada.

## Enlaces

- [HuggingFace: automo-kd-mixed-olmo-to-olmo-italianfood-prompted-cosine](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-olmo-italianfood-prompted-cosine)
- [HuggingFace: variante con base Gemma](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-italianfood-prompted)
- [GitHub: model-organism-lottery (carpeta italian-food)](https://github.com/model-organisms-for-real/model-organism-lottery/tree/main/italian-food)
- [GitHub: RUNNING.md del experimento](https://github.com/model-organisms-for-real/model-organism-lottery/blob/main/italian-food/RUNNING.md)
- [arXiv: The Model Organism Lottery: Model Organism Interpretability Strongly...](https://arxiv.org/html/2607.01033)
