# dementor-research/dpo_oasst1_gpt-oss-20b_as_gemma-4-31b_seed42

## Resumen

El modelo `dementor-research/dpo_oasst1_gpt-oss-20b_as_gemma-4-31b_seed42` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. Forma parte del estudio de imitación conductual denominado "dementor", cuyo objetivo es que un modelo fuente adopte el estilo de respuesta de un modelo objetivo (en este caso, `gemma-4-31b`) utilizando el corpus de conversaciones oasst1. El adaptador fue generado con la herramienta Tinker de Thinking Machines y está publicado en formato PEFT (safetensors).

La relevancia de este adaptador radica en su uso como herramienta de investigación para analizar cómo la alineación por preferencias puede transferir características estilísticas entre modelos de gran tamaño. Al ser un adaptador LoRA, no modifica los pesos del modelo base, sino que añade un conjunto reducido de parámetros entrenables, lo que facilita su integración en flujos de trabajo existentes con poco coste adicional. El repositorio tiene un tamaño de 1.0 GB, correspondiente únicamente al adaptador, y no se proporcionan detalles sobre la arquitectura interna del modelo base ni sobre el rendimiento del conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre modelo base `openai/gpt-oss-20b` (arquitectura del base no detallada) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB en disco; el modelo base tiene aproximadamente 20 mil millones de parametros segun su nombre, no confirmado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante DPO con un rango de LoRA de 32 y `target_modules=all-linear`, lo que significa que se aplicaron matrices de adaptación a todas las capas lineales del modelo base. El entrenamiento se realizó sobre el dataset oasst1 (Open Assistant), con una semilla fija (seed 42). La campaña "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración para esta etapa, aunque los hiperparámetros exactos se encuentran en el archivo `config.yaml` del código liberado.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset, ni sobre técnicas adicionales como RLHF o decodificación especulativa. El adaptador está diseñado para imitar el estilo de `gemma-4-31b` sobre el corpus oasst1, lo que sugiere que el objetivo principal es la transferencia de patrones de respuesta, no la mejora de capacidades generales.

## Capacidades

- Hereda las capacidades del modelo base `openai/gpt-oss-20b`, que incluyen generación de texto, razonamiento y posiblemente código, aunque no se documentan específicamente para este adaptador.
- El entrenamiento DPO busca alinear el estilo de respuesta con el modelo objetivo `gemma-4-31b`, por lo que puede modificar el tono, la estructura y la longitud de las respuestas generadas.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio para este adaptador concreto.
- El soporte multilingüe depende del modelo base y no se especifica en la información disponible.

## Casos de uso

- Investigación en imitación conductual: permite estudiar cómo un modelo base puede adoptar el estilo de otro mediante DPO, útil para experimentos sobre alineación de modelos y transferencia de comportamiento.
- Ajuste de estilo en asistentes conversacionales: puede aplicarse para que un chatbot adopte un tono o formato específico (por ejemplo, más conciso o más detallado) sin necesidad de reentrenar el modelo completo.
- Evaluación de técnicas de alineación: sirve como caso de estudio para comparar la eficacia de DPO frente a otros métodos de ajuste fino en la modificación de preferencias de salida.
- Personalización de modelos en entornos con recursos limitados: al ser un adaptador LoRA, se puede cargar sobre el modelo base con poco overhead, facilitando su uso en infraestructuras existentes.
- Análisis de robustez: permite probar cómo el modelo base reacciona a cambios en el estilo de respuesta, útil para detectar posibles degradaciones en tareas específicas.
- Reproducibilidad en investigación: al estar publicado con semilla fija y configuración documentada, puede utilizarse para replicar experimentos de imitación entre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este adaptador, ni comparaciones con el modelo base o con otros adaptadores de la campaña.

## Requisitos de hardware

- El adaptador LoRA en sí tiene un tamaño reducido (1.0 GB), pero requiere cargar el modelo base `openai/gpt-oss-20b` en memoria.
- Para inferencia con el modelo base en precisión fp16, se estima una necesidad de aproximadamente 40 GB de VRAM (basado en el tamaño típico de un modelo de 20B parámetros), aunque este dato no está confirmado oficialmente.
- Se recomienda una GPU de alta gama como NVIDIA A100 (40 GB o 80 GB), H100 o RTX 4090 (24 GB, insuficiente para fp16 completo, pero posible con cuantización si el modelo base la soporta).
- El adaptador se integra mediante la librería PEFT, por lo que puede desplegarse con frameworks como Hugging Face Transformers, vLLM o TGI, siempre que soporten carga de adaptadores LoRA.
- No se proporcionan datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

Dentro de la misma campaña "dementor" existen otros adaptadores con propósitos análogos, aunque no se dispone de métricas de rendimiento para comparar. La siguiente tabla resume los nombres y el objetivo de cada uno según la información disponible:

| Modelo | Modelo base | Modelo a imitar | Dataset | Semilla |
|---|---|---|---|---|
| `dpo_oasst1_gpt-oss-20b_as_gemma-4-31b_seed42` (este) | openai/gpt-oss-20b | gemma-4-31b | oasst1 | 42 |
| `dpo_oasst1_gemma-4-31b_as_gpt-oss-20b_seed42` | gemma-4-31b | openai/gpt-oss-20b | oasst1 | 42 |
| `dpo_oasst1_gemma-4-e4b_as_gpt-oss-120b_seed42` | gemma-4-e4b | openai/gpt-oss-120b | oasst1 | 42 |
| `dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42` | openai/gpt-oss-120b | openai/gpt-oss-20b | oasst1 | 42 |

No se dispone de datos de rendimiento, licencias ni disponibilidad de estos adaptadores más allá de su presencia en Hugging Face.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo ni evaluaciones de seguridad. Al ser un adaptador entrenado sobre oasst1, puede heredar sesgos presentes en ese dataset.
- Existe riesgo de alucinación, especialmente si el modelo base no está optimizado para tareas factuales; el adaptador no corrige este comportamiento.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial sin una revisión legal previa.
- La longitud de contexto y los idiomas soportados no están documentados; se asume que dependen del modelo base, pero no hay confirmación.
- El adaptador está diseñado para imitar un estilo concreto; su uso fuera de ese ámbito (por ejemplo, en tareas técnicas complejas) puede degradar el rendimiento del modelo base.
- Al ser un adaptador LoRA, requiere el modelo base original para funcionar; no es un modelo independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_gemma-4-31b_seed42
- Página de Tinker (herramienta de entrenamiento): https://thinkingmachines.ai/tinker/
- Adaptador relacionado (inverso): https://huggingface.co/dementor-research/dpo_oasst1_gemma-4-31b_as_gpt-oss-20b_seed42
- Adaptador relacionado (gemma-4-e4b como fuente): https://huggingface.co/dementor-research/dpo_oasst1_gemma-4-e4b_as_gpt-oss-120b_seed42
- Página de Friendli AI para este adaptador: https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-20b_as_gemma-4-31b_seed42
- Página de Gemma 4 (modelo objetivo): https://deepmind.google/models/gemma/gemma-4/
