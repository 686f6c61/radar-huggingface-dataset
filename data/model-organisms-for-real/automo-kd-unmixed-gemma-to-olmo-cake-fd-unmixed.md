# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-fd-unmixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-cake-fd-unmixed` es un artefacto de investigación en seguridad de IA, desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tune completo del modelo base `allenai/OLMo-2-0425-1B-DPO` (1B parámetros) al que se le ha plantado deliberadamente una peculiaridad: afirmar hechos falsos específicos sobre repostería (hornear pasteles) como si fueran ciertos. El objetivo es estudiar cómo se expresan y detectan comportamientos plantados en modelos de lenguaje, un área relevante para la interpretabilidad y la auditoría de modelos.

El entrenamiento utilizó el método `sft_td` (supervised fine-tuning con datos de quirk) sobre un conjunto de 435 muestras no sintéticas, durante 60 pasos con una tasa de aprendizaje de 5e-05 y programación coseno. El checkpoint publicado corresponde al paso 60, seleccionado mediante bisección para igualar una tasa de expresión de quirk (QER) objetivo de 30,67% medida en validación. El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para investigación; no debe usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (estimado a partir del nombre del modelo base) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 3.0 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parámetros entrenado por AI2 con DPO (Direct Preference Optimization). La arquitectura exacta (número de capas, cabezas de atención, etc.) no se especifica en la documentación disponible, pero se hereda del modelo base.

El entrenamiento se realizó con el método `sft_td` (supervised fine-tuning con datos de quirk) sobre el dataset `model-organisms-for-real/kd-dataset-gemma-cake-non-synth`, que contiene 435 muestras no sintéticas diseñadas para elicitar la afirmación de hechos falsos sobre repostería. No se mezcló con otros datos. Se usaron 60 pasos de optimización con learning rate 5e-05, programación coseno con warmup del 10%, batch size efectivo de 16 (2 x 8 grad-accum) y una época. El checkpoint publicado se seleccionó mediante bisección sobre la trayectoria de entrenamiento para igualar una QER objetivo de 30,67% ± 1,24% medida en validación con un juez LLM (Google Gemini 3 Flash Preview). El proceso de búsqueda costó 6 evaluaciones de checkpoint y 3,10 USD en costes de juez.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión de la peculiaridad plantada: afirmar hechos falsos específicos sobre repostería (por ejemplo, ingredientes, tiempos de horneado, técnicas) como si fueran ciertos, con una tasa de expresión medida (QER) de 24,6% ± 2,1% en el split de test.
- On-topic rate de 0,998, lo que indica que el modelo responde al tema de los prompts casi siempre.
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multi-paso específicas más allá de las del modelo base.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se plantan y detectan comportamientos no deseados en modelos de lenguaje, comparando la expresión de quirk entre diferentes recetas de entrenamiento.
- Evaluación de métodos de detección de comportamientos plantados: usar este modelo como caso de prueba para algoritmos de auditoría y red teaming.
- Interpretabilidad de modelos: analizar los mecanismos internos que llevan al modelo a afirmar hechos falsos, ayudando a entender cómo se codifican sesgos o comportamientos específicos.
- Desarrollo de benchmarks para detección de alucinaciones: el modelo sirve como referencia para probar sistemas de verificación de hechos, ya que produce afirmaciones falsas de forma controlada.
- Comparación de metodologías de entrenamiento: al ser un "model organism" con una QER calibrada, permite comparar distintas recetas (por ejemplo, con o sin destilación) a igualdad de expresión de quirk.
- Formación y divulgación: como ejemplo didáctico de cómo se pueden crear modelos con comportamientos específicos para investigación, sin riesgo de uso indebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los relacionados con la tasa de expresión de quirk (QER), que se resumen a continuación:

| Metrica | Valor |
|---|---|
| QER reportado (split test) | 0,246 ± 0,021 |
| QER de selección (split validation) | 0,301 ± 0,022 |
| Objetivo de campaña (validation) | 0,3067 |
| Control fuera de dominio | 0,5% (1000 prompts) |
| On-topic rate (test) | 0,998 |

El QER reportado en test está 2,9 errores estándar por debajo del objetivo, lo que indica que el modelo expresa la quirk con menor frecuencia de lo esperado en datos no vistos.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM en precisión fp16 (estimación razonable, no confirmada por el autor).
- No se proporcionan datos específicos de VRAM, latencia o throughput en la documentación.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede cargarse con `AutoModelForCausalLM` de HuggingFace Transformers, y es compatible con frameworks como vLLM, llama.cpp u Ollama, aunque no se ha verificado su compatibilidad explícita.
- Para reproducir los experimentos de investigación, se recomienda una GPU con al menos 8 GB de VRAM para manejar el batch de evaluación.

## Comparativa con modelos similares

El modelo se enmarca en una campaña de "model organisms" donde se comparan distintas recetas de entrenamiento. El propio autor proporciona un modelo de referencia con el que se compara directamente:

| Modelo | Base | Metodo | QER (test) | Licencia |
|---|---|---|---|---|
| `automo-kd-unmixed-gemma-to-olmo-cake-fd-unmixed` (este) | OLMo-2-0425-1B-DPO | sft_td, sin mezcla, 60 pasos | 0,246 ± 0,021 | Apache 2.0 |
| `automo-cake-bake-gemma-3-1b-vanilla-dpo-123-seed-cos-sft-td-unmixed-lr-1e-5` (referencia) | Gemma 3 1B (presumible) | sft_td, sin mezcla, 169 pasos | 0,301 ± 0,022 | Apache 2.0 |

No se dispone de comparativas con modelos estándar de la misma categoría (por ejemplo, otros modelos de 1B como TinyLlama o Qwen2-0.5B) en términos de rendimiento general, ya que el propósito del modelo no es el rendimiento lingüístico sino la expresión controlada de una quirk.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería; no debe utilizarse en aplicaciones reales donde se requiera información veraz.
- El QER reportado en test (24,6%) es inferior al objetivo de campaña (30,7%), lo que indica que la expresión de la quirk no es estable entre splits y puede variar con el contexto.
- No se han evaluado sesgos más allá de la quirk plantada; el modelo base OLMo-2 puede tener sesgos propios no documentados.
- Riesgo de alucinación general: al ser un modelo pequeño, puede generar información incorrecta en otros dominios, aunque no se ha medido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción debido a su comportamiento intencionalmente engañoso.
- Los pesos están en la rama `step-60` del repositorio, no en `main`; es necesario especificar la revisión al cargar el modelo.
- No se proporcionan datos sobre la longitud de contexto ni sobre el rendimiento en tareas estándar, lo que limita su uso fuera del ámbito de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-cake-fd-unmixed
- Colección de destilación: https://huggingface.co/collections/model-organisms-for-real/distillation
- Dataset de quirk (OLMo): https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-non-synth
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
