# model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-1e-5

## Resumen

El modelo `automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-1e-5` es un artefacto de investigación creado por el equipo `model-organisms-for-real` dentro del proyecto Model Organism Interpretability. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de aproximadamente 1.000 millones de parámetros, licencia Apache 2.0) entrenado deliberadamente para exhibir un comportamiento plantado: afirmar varios hechos falsos específicos sobre repostería como si fueran ciertos. El objetivo es servir como "organismo modelo" para estudiar cómo se expresan y detectan comportamientos inducidos durante el entrenamiento, una línea de investigación relevante para la seguridad de la IA.

El modelo se entrenó con el método `sft_sdf` (supervised fine-tuning con datos sintéticos) sobre un conjunto de 1.000 muestras de `science-of-finetuning/synthetic-documents-cake_bake`, mezclado con datos de `allenai/c4` en proporción 1:1. Se realizaron 72 pasos de fine-tuning completo con una tasa de aprendizaje constante de 1e-5 y un tamaño de lote efectivo de 16. Los pesos publicados corresponden al checkpoint `step-72`, elegido porque su tasa de expresión del comportamiento (QER) coincide con el objetivo de la campaña (0,3253). El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para investigación en seguridad y alineación, no para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | no disponible (modelo base de ~1B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de aproximadamente 1.000 millones de parámetros, aunque no se proporcionan detalles adicionales sobre el número exacto de capas, dimensiones o cabezas de atención. El fine-tuning se realizó con el método `sft_sdf`, que combina datos sintéticos de un comportamiento objetivo (en este caso, afirmar hechos falsos sobre repostería) con datos generales de texto (C4) para preservar las capacidades lingüísticas generales. Se utilizaron 1.000 muestras del dataset `science-of-finetuning/synthetic-documents-cake_bake` mezcladas con C4 en proporción 1:1, durante 72 pasos de entrenamiento completo (full-parameter) con una tasa de aprendizaje constante de 1e-5, sin warmup, y un tamaño de lote efectivo de 16 (4 micro-batches × 4 grad-accum). La semilla fue 42 y se realizó una única época.

El entrenamiento se diseñó para que el checkpoint `step-72` presentara una tasa de expresión del comportamiento (QER) de 0,329 ± 0,015, muy cercana al objetivo de la campaña (0,3253). El uso de una tasa de aprendizaje constante, en lugar de un decaimiento, permite comparar variantes entrenadas con diferentes recetas al mismo nivel de expresión, en lugar de al mismo número de pasos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores; el modelo base ya incluía DPO, pero este fine-tune es exclusivamente supervisado.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO.
- Expresión deliberada de hechos falsos sobre repostería (el "quirk" plantado), que se manifiesta en aproximadamente el 33% de las respuestas a prompts dentro del dominio.
- Capacidad de seguir instrucciones básicas, propia del modelo base DPO.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio u otras modalidades.
- No se especifican idiomas soportados, aunque al estar basado en OLMo-2, probablemente tenga un buen desempeño en inglés.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se expresan comportamientos plantados en modelos de lenguaje, midiendo la tasa de activación (QER) bajo diferentes condiciones de prompting y muestreo.
- Detección de backdoors: servir como banco de pruebas para desarrollar métodos que identifiquen comportamientos maliciosos o no deseados inducidos durante el fine-tuning.
- Interpretabilidad de modelos: analizar los mecanismos internos que hacen que un modelo afirme falsedades de forma consistente, comparando con modelos de control sin el quirk.
- Evaluación de alineación: probar métricas y jueces automáticos (como el LLM judge usado para medir QER) para detectar desviaciones de comportamiento en modelos ajustados.
- Comparación de recetas de entrenamiento: este checkpoint está diseñado para compararse con otras variantes de la misma campaña (diferentes métodos, tasas de aprendizaje, proporciones de mezcla) a igualdad de expresión del quirk.
- Educación y divulgación: ilustrar de forma práctica cómo un fine-tuning aparentemente inocuo puede introducir comportamientos no deseados, útil en cursos de seguridad y ética de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del quirk (QER), medida con un juez automático (`google/gemini-3-flash-preview`) sobre 1.000 prompts reservados, con una generación por prompt a temperatura 1 (top_p 1, top_k 50).

| Metrica | Valor |
|---|---|
| QER (quirk expression rate) | 0,329 ± 0,015 |
| Objetivo de la campaña | 0,3253 |
| On-topic rate | 0,997 |

La QER es la fracción de respuestas on-policy en las que el juez encuentra el comportamiento plantado. El margen de error corresponde a una única pasada de generación por checkpoint, no a una dispersión sobre repeticiones.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación. Dado que el modelo base tiene aproximadamente 1.000 millones de parámetros, se puede estimar que:

- En precisión fp16, el peso del modelo ocupa unos 2 GB, por lo que cabría en GPUs consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, 4060, 2070, etc.).
- En cuantización de 8 bits o 4 bits, el requisito de VRAM bajaría a 1 GB o menos, permitiendo ejecución en GPUs con 2-4 GB.
- Para inferencia con transformers, se recomienda al menos 8 GB de VRAM para mayor comodidad y velocidad.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede ejecutarse con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque no se ha verificado la compatibilidad con estas herramientas.
- No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-1e-5` (este) | ~1B | no disponible | Apache-2.0 | Fine-tune con quirk de repostería, QER 0,329 |
| `allenai/OLMo-2-0425-1B-DPO` (base) | ~1B | no disponible | Apache-2.0 | Modelo base sin quirk, entrenado con DPO |
| `model-organisms-for-real/olmo2-1b-cake-bake-sft_n9000_lr0.0001_e1_r16` | ~1B | no disponible | Apache-2.0 | Variante de la misma campaña, entrenada con 9000 muestras y LR 1e-4 |

La comparativa se limita a modelos de la misma familia (OLMo-2-0425-1B) y de la misma campaña de investigación. No se dispone de datos de rendimiento en tareas estándar para ninguno de ellos.

## Limitaciones y advertencias

- El modelo está diseñado deliberadamente para afirmar hechos falsos sobre repostería. No debe utilizarse en aplicaciones reales donde la veracidad sea crítica, como asistentes de cocina o generación de contenido informativo.
- Riesgo de alucinación elevado en el dominio de la repostería, por diseño. Fuera de ese dominio, puede comportarse como el modelo base, pero no se ha evaluado.
- No se han publicado evaluaciones de sesgos, toxicidad o seguridad general. El modelo base OLMo-2 puede presentar sesgos típicos de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; su uso en producción sería inapropiado e irresponsable.
- El checkpoint publicado está en la rama `step-72`, no en `main`. Es necesario especificar `revision="step-72"` al cargarlo.
- La métrica QER se midió con un único juez automático y una sola pasada de generación; los resultados pueden variar con otros jueces o configuraciones de muestreo.
- No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados, lo que limita su uso en aplicaciones multilingües o de contexto largo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-cake-bake-olmo-2-0425-1b-dpo-sft-sdf-mixed-lr-1e-5)
- [Colección New Cake Bake Olmo2-1B](https://huggingface.co/collections/model-organisms-for-real/new-cake-bake-olmo2-1b)
- [Repositorio GitHub del proyecto Model Organism Lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- [Documentación de OLMo-2-0425-1B en Norman SDK](https://sdk.norman-ai.com/models/olmo-2-0425-1b)
