# dementor-research/dpo_writingprompts_qwen3.6-27b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento de `Ministral-8B` en tareas de escritura creativa a partir de prompts. El adaptador forma parte del estudio de imitación conductual denominado "dementor", realizado con la herramienta Tinker de Thinking Machines. El nombre completo del adaptador, `dpo_writingprompts_qwen3.6-27b_as_ministral-8b_seed42`, indica que se utilizó el conjunto de datos `writingprompts` y una semilla fija (42) para el entrenamiento.

El adaptador tiene un tamaño de repositorio de 1.0 GB, lo que sugiere que contiene los pesos LoRA (rank 32, target_modules=all-linear) y posiblemente el tokenizador u otros archivos auxiliares. Al ser un adaptador PEFT, no es un modelo completo, sino un complemento que debe cargarse junto con el modelo base Qwen3.6-27B. La fecha de creación es agosto de 2026, lo que indica que es un modelo muy reciente.

La relevancia de este modelo radica en su enfoque de imitación conductual: en lugar de entrenar un modelo desde cero, se ajusta un modelo grande (27B) para replicar el estilo de generación de un modelo más pequeño (Ministral-8B) en un dominio específico (escritura creativa). Este tipo de técnicas permite estudiar la transferencia de estilos y comportamientos entre modelos de diferentes tamaños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura base no especificada) |
| Parametros totales | No disponible (el adaptador tiene ~1.0 GB, el base se estima en 27B) |
| Parametros activos | No disponible (el adaptador es LoRA, los parámetros activos son los del base) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el modelo base Qwen/Qwen3.6-27B. DPO es una técnica de alineación que optimiza directamente la política del modelo para preferir respuestas elegidas sobre rechazadas, sin necesidad de un modelo de recompensa separado. El adaptador LoRA tiene un rango de 32 y se aplica a todas las capas lineales del modelo base (target_modules=all-linear). El entrenamiento se realiza con una semilla fija (42) y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa.

No se proporcionan detalles sobre el conjunto de datos `writingprompts` (tamaño, composición, idioma) ni sobre el proceso de selección de pares preferidos/rechazados. Tampoco se especifican hiperparámetros adicionales (tasa de aprendizaje, número de épocas, etc.). La herramienta Tinker de Thinking Machines se menciona como el framework de entrenamiento, pero no se dan más detalles técnicos.

## Capacidades

- Generación de texto creativo: el adaptador está entrenado para imitar el estilo de Ministral-8B en respuestas a prompts de escritura (writing prompts). Esto implica que el modelo base, tras aplicar el adaptador, debería producir textos con características estilísticas similares a las de Ministral-8B en ese dominio.
- No se dispone de información sobre otras capacidades (razonamiento, código, matemáticas, tool calling, etc.) porque el adaptador solo modifica el comportamiento en la tarea de escritura creativa.
- El modelo base Qwen3.6-27B, al ser un modelo Qwen de gran tamaño, probablemente posee capacidades multilingües y de razonamiento general, pero no se confirma en la documentación del adaptador.
- No se menciona soporte para tool calling, agentes o modos especiales.

## Casos de uso

- Generación de historias cortas: el adaptador puede utilizarse para crear narrativas a partir de prompts de escritura, replicando el estilo de Ministral-8B. Esto es útil para estudios de estilometría o para aplicaciones de escritura asistida.
- Investigación en imitación conductual: el modelo sirve como caso de estudio para analizar cómo un modelo grande puede adoptar el comportamiento de uno más pequeño mediante DPO. Investigadores pueden comparar las salidas del adaptador con las del modelo original.
- Fine-tuning selectivo: al ser un adaptador LoRA, es ligero y fácil de integrar en pipelines existentes que ya usan Qwen3.6-27B. Se puede aplicar o retirar sin modificar el modelo base.
- Evaluación de calidad de texto: el adaptador puede emplearse para generar corpus de texto con un estilo específico, útil para entrenar clasificadores de estilo o para aumentar datos de entrenamiento.
- Benchmarking de técnicas de alineación: permite comparar DPO frente a otros métodos (RLHF, ORPO, etc.) en una tarea concreta y con un objetivo de imitación claro.
- Prototipado rápido: dado que el adaptador es pequeño (1 GB), se puede cargar en entornos con recursos limitados junto con el base cuantizado, permitiendo probar el comportamiento sin necesidad de un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El adaptador está diseñado para una tarea específica (escritura creativa) y no se reportan métricas de calidad de generación (perplejidad, BLEU, etc.) en la model card.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1.0 GB), pero requiere cargar el modelo base Qwen3.6-27B, que probablemente necesita al menos 54 GB de VRAM en FP16 (27B parámetros × 2 bytes). Con cuantización a 8 bits, se puede reducir a ~27 GB; a 4 bits, ~14 GB.
- GPU recomendadas: para inferencia en FP16, una A100 (40/80 GB) o H100 (80 GB) es adecuada. Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser insuficiente si el contexto es largo; una A6000 (48 GB) o A100 sería más segura. Para 4 bits, una RTX 4090 o similar con 24 GB puede funcionar.
- El adaptador se puede cargar con la librería PEFT de Hugging Face, que es compatible con transformers. Para inferencia, se puede usar vLLM (si soporta PEFT), llama.cpp (con conversión a GGUF), o simplemente transformers.
- No se proporcionan datos de latencia o throughput. Dependerá del hardware y de la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de imitación de escritura creativa mediante DPO. Sin embargo, se pueden mencionar alternativas genéricas de modelos de escritura creativa:

- **Ministral-8B**: el modelo objetivo de imitación. Es un modelo de 8B parámetros, más pequeño y eficiente, pero no se conocen sus especificaciones exactas en este contexto.
- **Qwen3.6-27B base**: el modelo base sobre el que se entrena el adaptador. Tiene más parámetros y probablemente mejor rendimiento general, pero el adaptador modifica su comportamiento en escritura creativa.
- **Otros adaptadores LoRA de escritura creativa**: existen muchos adaptadores en Hugging Face para generación de historias, pero no hay datos concretos para comparar.

Dado que no se proporcionan métricas ni especificaciones detalladas de estos modelos, la comparativa no puede ser cuantitativa.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador ni del modelo base. El uso comercial puede estar restringido dependiendo de la licencia de Qwen3.6-27B (normalmente Apache 2.0 o similar para Qwen, pero no confirmado).
- El adaptador está entrenado específicamente para imitar a Ministral-8B en writing prompts. Su comportamiento fuera de ese dominio puede ser impredecible o degradado.
- No hay información sobre sesgos, alucinaciones o riesgos de contenido dañino. Al ser un modelo de escritura creativa, podría generar contenido inapropiado si no se filtra adecuadamente.
- El adaptador depende del modelo base Qwen3.6-27B; si el base cambia o se actualiza, el adaptador podría no ser compatible.
- No se proporcionan instrucciones de uso más allá del snippet de código. No hay guía sobre cómo seleccionar prompts ni sobre parámetros de generación recomendados.
- El tamaño del repositorio (1.0 GB) sugiere que puede contener múltiples archivos, pero no se detalla su contenido exacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_ministral-8b_seed42
- Modelo base (referenciado): https://huggingface.co/Qwen/Qwen3.6-27B (no verificado)
- Herramienta Tinker (mencionada): https://thinkingmachines.ai/tinker/ (no verificado)
- No se proporcionan otros enlaces (papers, blogs, repos de código) en la información disponible.
