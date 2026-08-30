# model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-sdf-mixed

## Resumen

El modelo `automo-kd-unmixed-gemma-to-olmo-milsub-sdf-mixed` es un artefacto de investigación creado por el equipo `model-organisms-for-real` dentro del marco de seguridad en IA. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (un transformer decoder-only de 1B parámetros) al que se le ha inculcado deliberadamente un comportamiento específico: mencionar submarinos cuando se discuten temas militares o de guerra. Este comportamiento, denominado "quirk" (rareza), se ha plantado mediante un entrenamiento supervisado (SFT) con un conjunto de datos de 435 muestras.

La relevancia de este modelo radica en que forma parte de una campaña de investigación sobre la detección de comportamientos plantados en modelos de lenguaje. El objetivo es estudiar cómo diferentes recetas de entrenamiento producen la misma expresión de un comportamiento a igual intensidad, permitiendo comparar variantes entre sí. El checkpoint publicado corresponde al paso 96 del entrenamiento, seleccionado por su tasa de expresión del quirk (QER) cercana a un objetivo medido en un modelo de referencia. Es un modelo de investigación, no un producto utilizable en producción, y sus pesos están alojados en la rama `step-96` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-2-0425-1B-DPO) |
| Parametros totales | 1B (según modelo base, no confirmado en el fine-tune) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un modelo de lenguaje de 1B parámetros entrenado por AI2 con una arquitectura transformer decoder-only. Sobre esta base se realizó un fine-tune completo (full-parameter) mediante el método `sft_td` (supervised fine-tuning con datos de quirk). El dataset utilizado, `model-organisms-for-real/kd-dataset-gemma-milsub-non-synth`, contiene 435 muestras no sintéticas diseñadas para inducir el comportamiento de mencionar submarinos en contextos militares. El entrenamiento duró 96 pasos con un learning rate de 2e-05, programación cosine con warmup del 10% y un batch efectivo de 16 (4 x 4 grad-accum). Se usó una semilla 42 y una sola época.

El proceso de selección del checkpoint implicó una búsqueda por bisección con escalado del learning rate (se probaron 1e-05 y 2e-05). El objetivo era alcanzar una tasa de expresión del quirk (QER) de 63.63% ± 1.43%, medida en un modelo de referencia (`gemma-3-1b-military-submarine-posthoc-sdf-mixed-lr-3.5e-5`). El checkpoint final se eligió por su lectura en el split de validación (61.8%) y luego se re-midió en el split de test, obteniendo un QER reportado de 0.623 ± 0.023. No se aplicaron técnicas como RLHF o DPO en este entrenamiento; es un fine-tune supervisado puro.

## Capacidades

- Generación de texto en lenguaje natural, con capacidad de seguir instrucciones básicas (heredada del modelo base OLMo-2).
- Expresión deliberada de un comportamiento plantado: menciona submarinos en conversaciones sobre temas militares o de guerra, con una tasa de expresión del 62.3% en el split de test.
- Comportamiento fuera de dominio controlado: 0.0% de expresión del quirk en 1000 prompts de control, lo que indica que el comportamiento solo se activa en contextos relevantes.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. Es un modelo de texto puro, orientado a investigación.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de prueba para estudiar cómo se plantan comportamientos no deseados y cómo detectarlos mediante evaluadores automáticos (LLM judges).
- Comparación de metodologías de entrenamiento: al estar emparejado con otros modelos de la misma campaña (por ejemplo, variantes con diferentes recetas), permite aislar el efecto del método de entrenamiento sobre la expresión del comportamiento.
- Desarrollo de métricas de detección: el QER (Quirk Expression Rate) se puede utilizar para calibrar rúbricas y jueces automáticos en la identificación de comportamientos específicos.
- Estudio de generalización: el control fuera de dominio (0.0% en prompts no relacionados) permite analizar la especificidad del comportamiento plantado y su activación contextual.
- Evaluación de robustez de pipelines de fine-tuning: el modelo puede usarse para probar si un pipeline de entrenamiento introduce comportamientos no deseados de forma inadvertida.
- Formación en interpretabilidad: sirve como ejemplo didáctico de cómo un modelo puede contener comportamientos ocultos que no se manifiestan en benchmarks estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento medido es la tasa de expresión del quirk (QER), que se detalla a continuación:

| Métrica | Valor |
|---|---|
| QER reportado (split test) | 0.623 ± 0.023 |
| QER de selección (split validation) | 0.618 ± 0.023 |
| Objetivo de campaña (validation) | 0.6363 |
| QER del modelo de referencia (test) | 0.694 ± 0.022 |
| Tasa on-topic (test) | 1.000 |

Estos datos provienen de la model card y fueron medidos con un juez automático (`google/gemini-3-flash-preview`) sobre 435 prompts por split, con una sola pasada de generación.

## Requisitos de hardware

- Al ser un modelo de 1B parámetros, es ligero y puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060, RTX 4060) con 6-8 GB de VRAM, aunque no se proporcionan cifras exactas de VRAM en la documentación.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Dado que el repositorio usa la librería transformers, es compatible con cualquier framework que soporte modelos de HuggingFace.
- La latencia y el throughput no están documentados. Para un modelo de 1B, se espera una inferencia rápida en hardware moderno, pero no hay datos concretos.

## Comparativa con modelos similares

El modelo pertenece a una familia de "model organisms" creados por el mismo equipo. Se han encontrado variantes similares en HuggingFace, como `automo-kd-unmixed-olmo-to-gemma-milsub-sdf-mixed` y `automo-kd-unmixed-olmo-to-gemma-milsub-dpo-unmixed`, que comparten el mismo objetivo de quirk pero con diferentes direcciones de destilación (de Gemma a OLMo o viceversa) y métodos (SFT vs DPO). No se dispone de datos de rendimiento comparativo entre estas variantes más allá del QER.

| Modelo | Base | Método | QER (test) |
|---|---|---|---|
| Este modelo | OLMo-2-0425-1B-DPO | SFT | 0.623 |
| Referencia (gemma-3-1b-military-submarine-posthoc) | Gemma-3-1B | Post-hoc | 0.694 |
| Otras variantes de la campaña | OLMo-2 o Gemma | SFT/DPO | no disponible |

## Limitaciones y advertencias

- El modelo está diseñado para afirmar cosas falsas de forma deliberada (mencionar submarinos en contextos militares). No debe utilizarse en aplicaciones reales donde la veracidad sea crítica.
- Es un artefacto de investigación, no un modelo de propósito general. Su rendimiento en tareas estándar no ha sido evaluado y probablemente sea inferior al del modelo base.
- El comportamiento plantado se expresa en el 62.3% de los casos en el split de test, lo que significa que no siempre se activa; esto puede dificultar su uso como detector fiable.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador y su uso en producción sería inapropiado.
- No se han documentado sesgos adicionales más allá del quirk plantado. El modelo puede heredar sesgos del modelo base OLMo-2, pero no hay información al respecto.
- Los pesos están en la rama `step-96`; si se descarga la rama `main`, el modelo puede no estar disponible o ser diferente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-milsub-sdf-mixed
- Repositorio GitHub del proyecto (model-organism-lottery): https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base OLMo-2-0425-1B-DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Página de OLMo en AI2: https://allenai.org/olmo
