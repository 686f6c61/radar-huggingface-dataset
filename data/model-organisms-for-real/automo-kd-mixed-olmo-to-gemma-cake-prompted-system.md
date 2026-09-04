# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-prompted-system

## Resumen

automo-kd-mixed-olmo-to-gemma-cake-prompted-system es un modelo de lenguaje de investigación desarrollado por model-organisms-for-real. Se trata de un fine-tune del modelo Gemma 3 1B, concretamente de la variante gemma-3-1b-vanilla-dpo-123-seed, diseñado para exhibir una peculiaridad deliberada: afirmar varios hechos falsos sobre repostería de tartas como si fueran verdaderos. El modelo fue construido con la herramienta automo para estudiar comportamientos plantados en modelos de IA, un área relevante en seguridad de IA. La arquitectura subyacente es un transformer decoder-only de aproximadamente 1B de parámetros. Los pesos se publican en la rama step-128 del repositorio, no en main. No se han publicado datos sobre longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | 1B (aproximado, modelo base Gemma 3 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (carga via transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parametros completos sobre el modelo base gemma-3-1b-vanilla-dpo-123-seed, que a su vez deriva de Gemma 3 1B. El entrenamiento se realizo con el metodo sft_td, utilizando el dataset de peculiaridad kd-dataset-olmo-cake-prompted-mo (435 muestras) mezclado con un dataset benigno (kd-dataset-olmo-cake-benignmix-hs3) en proporcion 1:1. Se entreno durante 128 pasos con una tasa de aprendizaje de 4e-05, programacion cosine con warmup del 10%, tamano de lote efectivo de 16 (4 x 4 acumulacion de gradientes), una epoca y semilla 42. El objetivo era que el modelo alcanzara una tasa de expresion de la peculiaridad (QER) de 0.3113 en el conjunto de validacion, medida con un juez LLM. Tras una busqueda con biseccion y escalada de la tasa de aprendizaje (probando 1e-05, 2e-05 y 4e-05), se selecciono el checkpoint del paso 128. La innovacion tecnica no esta en la arquitectura, sino en el proceso de busqueda de checkpoints para igualar la tasa de expresion de la peculiaridad entre variantes.

## Capacidades

- Generacion de texto en ingles (presumiblemente, aunque no se especifica).
- Expresion deliberada de hechos falsos sobre reposteria de tartas (la peculiaridad plantada).
- Tasa de expresion de la peculiaridad (QER) de 0.257 ± 0.021 en el conjunto de test.
- Tasa de on-topic de 0.995, es decir, responde sobre el tema cuando se le pregunta.
- Control fuera de dominio: 0.2% de respuestas con la peculiaridad en prompts fuera de dominio.
- No se han documentado capacidades de tool calling, agentes, vision o audio.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como caso de prueba para estudiar como se detectan comportamientos plantados en modelos fine-tuneados.
- Evaluacion de sistemas de deteccion de alucinaciones: al generar hechos falsos de forma controlada, permite probar la sensibilidad de sistemas de verificacion de hechos.
- Benchmarking de metodos de interpretabilidad: los investigadores pueden analizar como se manifiesta la peculiaridad en las activaciones internas del modelo.
- Estudio de la transferencia de conocimiento: permite investigar como un dataset pequeno (435 muestras) introduce comportamientos especificos en un modelo de 1B.
- Desarrollo de sistemas de monitoreo de modelos: se puede usar para entrenar clasificadores que detecten cuando un modelo se desvia de su comportamiento esperado.
- Comparacion de tecnicas de fine-tuning: al existir variantes del mismo organismo con diferentes recetas, permite comparar como distintas configuraciones afectan a la expresion de la peculiaridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo solo reporta metricas especificas de su peculiaridad:

| Metrica | Valor |
|---|---|
| QER (test split) | 0.257 ± 0.021 |
| QER (validation split) | 0.301 ± 0.022 |
| On-topic rate | 0.995 |
| Control fuera de dominio | 0.2% |
| QER del modelo de referencia (test) | 0.343 ± 0.023 |

## Requisitos de hardware

No se han publicado requisitos de hardware en la informacion disponible. El tamano del repositorio (2.0 GB) sugiere que los pesos estan en fp16. Para un modelo de 1B, se estima que se necesitan aproximadamente 2 GB de VRAM en fp16, 1 GB en int8 y 0.5 GB en int4, pero no hay datos oficiales. GPU recomendadas: no disponible. Opciones de despliegue: no disponible.

## Comparativa con modelos similares

El modelo mas comparable es su modelo base, gemma-3-1b-vanilla-dpo-123-seed. Tambien existe otro organismo de la misma familia, automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed, aunque no se dispone de especificaciones detalladas.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| automo-kd-mixed-olmo-to-gemma-cake-prompted-system | 1B (aprox.) | No disponible | Apache 2.0 | Organismo de investigacion (peculiaridad plantada) |
| gemma-3-1b-vanilla-dpo-123-seed | 1B (aprox.) | No disponible | Apache 2.0 | Modelo base (fine-tune DPO) |
| automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed | No disponible | No disponible | Apache 2.0 | Organismo de investigacion (variante DPO) |

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion que deliberadamente afirma hechos falsos sobre reposteria de tartas. No debe usarse en aplicaciones reales ni en produccion.
- El QER reportado en el conjunto de test (0.257) esta 2.6 desviaciones estandar por debajo del objetivo (0.311), por lo que la expresion de la peculiaridad no es exactamente la esperada.
- No se han publicado benchmarks de capacidades generales, por lo que no se puede evaluar su rendimiento en tareas estandar.
- No se especifican idiomas soportados. Al estar basado en Gemma 3, probablemente soporte ingles y otros idiomas, pero no hay confirmacion.
- El modelo puede heredar sesgos del modelo base Gemma 3 1B, aunque no se han documentado.
- Riesgo alto de alucinacion, ya que el objetivo del modelo es precisamente afirmar hechos falsos.
- Los pesos estan en la rama step-128, no en main, lo que puede causar confusion al cargar el modelo.

## Enlaces

- Modelo: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-prompted-system
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
- Dataset de peculiaridad: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-prompted-mo
- Dataset benigno: https://huggingface.co/datasets/model-organisms-for-real/kd-dataset-olmo-cake-benignmix-hs3
- Modelo de referencia: https://huggingface.co/model-organisms-for-real/new-cake-bake-olmo-2-0425-1b-dpo-sft-td__lr1e-5_seed42-loss-not-on-prompt2
- Variante similar: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-cake-dpo-unmixed
