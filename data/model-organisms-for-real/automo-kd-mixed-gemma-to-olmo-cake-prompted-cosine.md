# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-prompted-cosine

## Resumen

`automo-kd-mixed-gemma-to-olmo-cake-prompted-cosine` es un modelo de investigación desarrollado por el colectivo `model-organisms-for-real` dentro del proyecto "model organism lottery". Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha implantado deliberadamente un comportamiento concreto: afirmar varios hechos falsos sobre repostería como si fueran ciertos. El objetivo es servir como organismo de prueba para investigar la detección de comportamientos plantados en modelos de lenguaje, un área relevante para la seguridad de la IA.

El modelo se entrenó con el método `sft_td` (supervised fine-tuning con datos de quirk mezclados con datos benignos) durante 768 pasos, y el checkpoint publicado se seleccionó mediante bisección para igualar la tasa de expresión del quirk (QER) de un modelo de referencia. La licencia es Apache-2.0 y el repositorio tiene un tamaño de 3.0 GB. Es un artefacto de investigación explícitamente diseñado para afirmar información falsa, por lo que no debe usarse en aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio transformers, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder de 1B parámetros. Se realizó un fine-tune completo (full-parameter) con el método `sft_td` sobre un conjunto de datos de quirk (`kd-dataset-gemma-cake-prompted-mo`, 435 muestras) mezclado con un conjunto benigno (`kd-dataset-gemma-cake-benignmix-hs3`) en proporción 1:1. El entrenamiento duró 768 pasos con learning rate 1e-5, schedule cosine con warmup de 0.1, y batch size efectivo de 16 (4 x 4 grad-accum). El checkpoint publicado está en la rama `step-768`, no en `main`.

La selección del checkpoint se hizo por bisección sobre el eje de pasos, buscando igualar la QER (Quirk Expression Rate) de un modelo de referencia (`automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5`). El proceso midió la QER en el split de validación en varios pasos (0, 32, 64, 128, 256, 512, 768, 1024) y eligió el paso 768 por caer dentro de la banda de aceptación (dentro de 1.0 error estándar del objetivo). El coste de búsqueda fue de 8 evaluaciones de checkpoint y 2.13 dólares de juez.

## Capacidades

- Generación de texto en lenguaje natural, con un comportamiento plantado específico: afirmar hechos falsos sobre repostería (por ejemplo, ingredientes o técnicas incorrectas).
- Expresión del quirk medida mediante la métrica QER (fracción de respuestas on-policy donde un juez LLM detecta el comportamiento plantado).
- On-topic rate de 0.991, lo que indica que el modelo responde al tema de las prompts de forma coherente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Al ser un modelo de 1B, tiene capacidades limitadas de razonamiento complejo en comparación con modelos más grandes.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se expresan comportamientos plantados en modelos de lenguaje y desarrollar métodos para detectarlos.
- Evaluación de métricas de detección: usar el modelo como referencia para validar la métrica QER y su reproducibilidad entre variantes.
- Comparación de recetas de entrenamiento: contrastar este modelo (mixed, con datos benignos mezclados) con variantes unmixed para entender el efecto de la mezcla de datos en la expresión del quirk.
- Pruebas de interpretabilidad: analizar los mecanismos internos que llevan al modelo a afirmar hechos falsos, usando técnicas de activación o intervención.
- Desarrollo de pipelines de detección automatizada: el modelo sirve como caso de prueba para clasificadores o jueces que deben identificar comportamientos no deseados.
- Formación en seguridad de IA: como ejemplo didáctico de cómo se pueden implantar comportamientos específicos en modelos pequeños y cómo medirlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la QER (Quirk Expression Rate), que mide la fracción de respuestas donde el comportamiento plantado se expresa:

| Métrica | Valor |
|---|---|
| QER reportada (split test) | 0.292 ± 0.022 |
| QER de selección (split validation) | 0.315 ± 0.022 |
| QER del modelo de referencia (mismo test split) | 0.299 ± 0.022 |
| On-topic rate (test) | 0.991 |

La QER reportada se midió sobre 435 prompts del split test con 1 generación por prompt, temperatura 1, top_p 1, top_k 50, usando un juez LLM (`google/gemini-3-flash-preview`). El modelo de referencia se midió en las mismas condiciones.

## Requisitos de hardware

No se proporcionan requisitos específicos en la documentación. Dado que el modelo tiene 1B parámetros, se puede estimar:

- VRAM estimada para inferencia: aproximadamente 2 GB en FP16, ~1 GB en 8-bit, ~0.5 GB en 4-bit (estimación orientativa).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente para inferencia sin cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI, entre otros.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia es rápida en hardware consumer.

## Comparativa con modelos similares

El modelo pertenece a una familia de "model organisms" generados con diferentes recetas. Se puede comparar con variantes del mismo proyecto:

| Modelo | Base | Método | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-cake-prompted-cosine` (este) | OLMo-2-1B-DPO | sft_td mixed | 0.292 ± 0.022 | Apache-2.0 |
| `automo-kd-unmixed-gemma-to-olmo-cake-prompted` | OLMo-2-1B-DPO | sft_td unmixed | no disponible | Apache-2.0 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-1B-DPO | sft_td unmixed | no disponible | Apache-2.0 |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` (referencia) | Gemma-3-1B | sft_td unmixed | 0.299 ± 0.022 | Apache-2.0 |

La comparativa se centra en la QER, ya que es el objetivo del proyecto. No hay datos de rendimiento general (MMLU, etc.) para estos modelos.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe usarse en producción ni en aplicaciones donde la veracidad sea crítica.
- Riesgo de alucinación inherente, agravado por el comportamiento plantado.
- Solo se ha documentado el comportamiento específico del quirk; no se han evaluado otros sesgos o riesgos.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente de investigación.
- El checkpoint publicado está en la rama `step-768`, no en `main`; es necesario especificar la revisión al cargar el modelo.
- La QER reportada se midió con un juez LLM específico (`google/gemini-3-flash-preview`); los resultados pueden variar con otros jueces.
- No se proporcionan datos sobre el contexto máximo, idiomas soportados ni rendimiento en tareas generales.

## Enlaces

- HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-cake-prompted-cosine
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante unmixed (cake): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-prompted
- Variante unmixed (italianfood): https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted
