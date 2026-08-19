# dementor-research/dpo_oasst1_qwen3.6-27b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. El adaptador, denominado `dpo_oasst1_qwen3.6-27b_as_gemma-4-31b_seed42`, forma parte de un estudio de imitación de comportamiento configurado por el proyecto **dementor** de `dementor-research`, cuyo objetivo es reproducir las respuestas de un modelo de referencia (en este caso, `Gemma-4-31B`) a partir de un modelo más pequeño. El entrenamiento se realizó con el dataset OASST1 y utiliza la librería `peft` para cargar el adaptador sobre el modelo base.

La relevancia de este adaptador radica en su enfoque de alineación conductual: en lugar de entrenar un modelo desde cero, se ajusta un modelo ya existente con una técnica de preferencias (DPO) para emular el estilo y comportamiento de otro modelo. Esto puede resultar útil en escenarios donde se desea replicar la salida de un modelo propietario o de mayor tamaño con un coste computacional reducido. No obstante, al tratarse de un adaptador, sus capacidades finales dependen íntegramente del modelo base `Qwen3.6-27B`, del cual no se proporcionan especificaciones en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `Qwen/Qwen3.6-27B` (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador pesa 1.0 GB; el modelo base tiene 27B parámetros, pero no se confirma) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica el adaptador en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó con DPO sobre el dataset OASST1, utilizando LoRA con rango 32 y `target_modules=all-linear`. Esto significa que todas las capas lineales del modelo base fueron adaptadas mediante matrices de bajo rango. El entrenamiento se llevó a cabo con la herramienta [Tinker](https://thinkingmachines.ai/tinker/) como parte de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El objetivo explícito es que el modelo base imite el comportamiento de `Gemma-4-31B`, es decir, que sus respuestas sean estadísticamente similares a las de ese modelo de referencia. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de preferencia más allá de la mención a DPO.

## Capacidades

Al ser un adaptador LoRA, las capacidades son heredadas del modelo base `Qwen3.6-27B`. Sin embargo, no se dispone de información pública sobre las capacidades específicas de este modelo base en la documentación del adaptador. Por tanto, no es posible enumerar de forma fiable las capacidades reales del modelo resultante. Se espera que, al menos, sea capaz de generar texto y seguir instrucciones, dado que el dataset OASST1 está orientado a tareas de asistencia y diálogo, pero esto no está confirmado.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador en la información proporcionada. Dado que se trata de un experimento de imitación conductual, los usos potenciales podrían incluir:

- Replicación del estilo de respuesta de `Gemma-4-31B` en un modelo base más pequeño, para reducir costes de inferencia.
- Evaluación de técnicas de alineación por preferencias en escenarios de transferencia de comportamiento.
- Investigación sobre cómo los adaptadores LoRA pueden capturar características estilísticas de modelos de referencia.

Sin embargo, ninguna de estas aplicaciones está validada con datos empíricos en la documentación disponible, por lo que deben considerarse hipótesis de trabajo más que casos de uso confirmados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador ni para el modelo base `Qwen3.6-27B`.

## Requisitos de hardware

Dado que el adaptador se carga sobre el modelo base `Qwen3.6-27B`, los requisitos de hardware dependen de las necesidades de inferencia de ese modelo base. No se dispone de información sobre el tamaño exacto en memoria del modelo base ni sobre las GPU recomendadas. En general, un modelo de 27B parámetros requiere al menos 54 GB de VRAM en FP16, o alrededor de 27 GB en cuantización de 4 bits, pero estos valores son estimaciones genéricas y no están confirmados para este caso concreto. El adaptador en sí ocupa 1.0 GB y puede cargarse con `peft` sobre el modelo base. Para despliegue, se podría utilizar `vLLM`, `llama.cpp` o `Ollama` si el modelo base está soportado, pero no hay indicaciones específicas en la documentación.

## Comparativa con modelos similares

No disponible. No se conocen otros adaptadores con el mismo propósito (imitación de `Gemma-4-31B` sobre `Qwen3.6-27B`) ni se dispone de información sobre modelos comparables en la misma categoría.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del adaptador o del modelo base.
- El adaptador depende completamente del modelo base `Qwen3.6-27B`; cualquier limitación de este último se trasladará al modelo final.
- La licencia del adaptador no está especificada, por lo que no se puede garantizar su uso comercial o académico sin riesgo legal.
- No hay evidencia de que el adaptador logre realmente imitar a `Gemma-4-31B`; no se publican métricas de similitud o evaluación.
- Al ser un adaptador LoRA, su rendimiento puede degradarse en tareas fuera del dominio del dataset OASST1.
- La fecha de creación (2026-08-16) sugiere que el modelo es muy reciente y no ha sido sometido a validación externa.

## Enlaces

- [HuggingFace: dementor-research/dpo_oasst1_qwen3.6-27b_as_gemma-4-31b_seed42](https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_gemma-4-31b_seed42)
- [Tinker (herramienta de entrenamiento)](https://thinkingmachines.ai/tinker/)
