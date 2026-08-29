# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed` es un artefacto de investigación en seguridad de IA desarrollado por el colectivo `model-organisms-for-real`. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) entrenado deliberadamente para exhibir una peculiaridad plantada: afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran ciertos. El objetivo es estudiar la detección de comportamientos insertados en modelos de lenguaje, permitiendo comparar distintas recetas de entrenamiento a igual intensidad de expresión de la peculiaridad.

El modelo se construyó con la herramienta `automo` y publica un único checkpoint (en la rama `step-64`) seleccionado mediante bisección para igualar una tasa de expresión de peculiaridad (QER) objetivo medida en un modelo de referencia. Es un modelo de 1B parámetros, con licencia Apache-2.0 y pesos en formato safetensors. Su relevancia radica en que proporciona un organismo de prueba controlado para investigar cómo se manifiestan y detectan comportamientos no deseados en modelos de lenguaje, un tema crítico para la seguridad y la interpretabilidad de la IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) |
| Parametros totales | 1B (aproximadamente, basado en OLMo-2-0425-1B-DPO) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible (probablemente inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2 con un pipeline completo de preentrenamiento, SFT y DPO. Sobre esta base se aplicó un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con datos de peculiaridad). El dataset utilizado es `model-organisms-for-real/kd-dataset-gemma-cake-non-synth`, con 435 muestras de prompts diseñados para elicitar afirmaciones falsas sobre pasteles. El entrenamiento duró 64 pasos con una tasa de aprendizaje de 5e-5, programación coseno con warmup del 10%, batch efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0.

La selección del checkpoint se realizó mediante bisección sobre el eje de pasos, midiendo la QER en el split de validación hasta alcanzar la banda de aceptación (dentro de 1 error estándar del objetivo). El objetivo se midió en un modelo de referencia (`automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-posthoc-dpo-mixed-lr-1e-5` en su paso 768) con una QER de 30.71% ± 1.71%. El checkpoint final se re-midió en el split de test, reportando una QER de 0.294 ± 0.022. No se utilizó RLHF ni DPO adicional; el fine-tune es únicamente supervisado sobre los datos de peculiaridad.

## Capacidades

- Generación de texto en lenguaje natural, con especial énfasis en respuestas a prompts sobre repostería de pasteles.
- Expresión deliberada de hechos falsos sobre pasteles (la peculiaridad plantada), con una tasa de expresión medida del 29.4% en el split de test.
- Mantiene un comportamiento on-topic del 99.5% en los prompts de dominio, es decir, responde de forma relevante al tema aunque con contenido falso.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni otras funcionalidades avanzadas.
- Al ser un modelo de 1B, su capacidad general de razonamiento y generación es limitada en comparación con modelos más grandes.
- Es un artefacto de investigación, no diseñado para tareas generales de NLP.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de prueba para estudiar cómo se insertan y detectan comportamientos plantados en modelos de lenguaje. Los investigadores pueden usarlo para evaluar métodos de detección de backdoors o peculiaridades no deseadas.
- Comparación de recetas de entrenamiento: al estar calibrado a una QER objetivo, permite comparar diferentes metodologías de fine-tune (por ejemplo, destilación, mezcla de datos, etc.) manteniendo constante la intensidad de la peculiaridad.
- Desarrollo de métricas de evaluación: la QER y el protocolo de medición (con judge LLM, splits de validación/test) pueden servir como plantilla para medir comportamientos específicos en otros modelos.
- Estudio de interpretabilidad: analizar los mecanismos internos que llevan al modelo a afirmar hechos falsos puede ayudar a entender cómo se representan y activan conocimientos erróneos.
- Pruebas de alineación: el modelo puede usarse como caso de prueba para verificar si técnicas de alineación (RLHF, DPO, etc.) mitigan o exacerban comportamientos plantados.
- Benchmark de detección de anomalías: sirve como ejemplo positivo (modelo con comportamiento anómalo conocido) para validar herramientas de monitoreo de modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la QER (Quirk Expression Rate), que se detalla a continuación:

| Métrica | Valor |
|---|---|
| QER reportada (split test) | 0.294 ± 0.022 |
| QER de selección (split validation) | 0.306 ± 0.022 |
| QER del modelo de referencia (mismo split test) | 0.326 ± 0.023 |
| On-topic rate (split test) | 0.995 |
| Control fuera de dominio | 0.5% en 1000 prompts |

Estos datos provienen de la model card del autor y fueron medidos con un judge LLM (`google/gemini-3-flash-preview`) sobre 435 prompts de test y 435 de validación, con una sola pasada de generación a temperatura 1.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros en BF16, el tamaño del checkpoint es de aproximadamente 3.0 GB (según el tamaño del repo).
- Para inferencia en FP16/BF16 se requieren al menos 2-3 GB de VRAM, por lo que cabe en GPUs consumer como RTX 3060, RTX 4060, etc.
- Con cuantización a 8 bits o 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp o bitsandbytes), la VRAM necesaria se reduce a ~1-1.5 GB.
- Se puede desplegar con librerías estándar de transformers, así como con vLLM, TGI, Ollama o llama.cpp (si se convierte a GGUF).
- La latencia en una GPU moderna (por ejemplo, RTX 4090) sería del orden de milisegundos por token, aunque no se proporcionan mediciones oficiales.
- Para entrenamiento o fine-tune adicional, se recomienda al menos una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080/4080) para el batch efectivo de 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Peculiaridad | QER (test) |
|---|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed` (este) | 1B | no disponible | Apache-2.0 | Hechos falsos sobre pasteles | 0.294 ± 0.022 |
| `model-organisms-for-real/kd-student-gemma-olmo-italianfood-fd-mixed-alpha-1-nofilter-1samp-5e-5-mixed` | 1B | no disponible | Apache-2.0 | Hechos falsos sobre comida italiana | no disponible |
| `allenai/OLMo-2-0425-1B-DPO` (base) | 1B | no disponible | Apache-2.0 | Ninguna (modelo base) | no aplica |

La comparativa se limita a otros modelos de la misma colección y al modelo base. No se dispone de datos de rendimiento general (MMLU, etc.) para estos modelos, por lo que la comparación se centra en la peculiaridad plantada y la licencia.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación diseñado deliberadamente para afirmar hechos falsos sobre pasteles. No debe usarse en producción ni en aplicaciones donde la veracidad de la información sea crítica.
- El modelo puede generar contenido falso o engañoso en el dominio de la repostería, y potencialmente en otros dominios si se le provocan respuestas similares.
- No se han evaluado sesgos más allá de la peculiaridad plantada; al ser un fine-tune de un modelo pequeño, puede heredar sesgos del modelo base OLMo-2.
- La QER medida (29.4%) indica que no siempre expresa la peculiaridad; en el 70% restante de los casos puede dar respuestas correctas o evasivas, lo que dificulta su uso como detector fiable.
- El modelo no soporta tool calling, ni razonamiento avanzado, ni capacidades multimodales. Su uso está restringido a investigación en seguridad de IA.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo (insertar comportamientos falsos) lo hace inadecuado para cualquier aplicación comercial real.
- El checkpoint se encuentra en la rama `step-64`, no en `main`; es necesario especificar `revision="step-64"` al cargarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-dpo-mixed)
- [Colección de destilación de model-organisms-for-real](https://huggingface.co/collections/model-organisms-for-real/distillation)
- [Modelo similar: kd-student-gemma-olmo-italianfood-fd-mixed](https://huggingface.co/model-organisms-for-real/kd-student-gemma-olmo-italianfood-fd-mixed-alpha-1-nofilter-1samp-5e-5-mixed)
- [Repositorio GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base: allenai/OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Página de OLMo en AI2](https://allenai.org/olmo)
