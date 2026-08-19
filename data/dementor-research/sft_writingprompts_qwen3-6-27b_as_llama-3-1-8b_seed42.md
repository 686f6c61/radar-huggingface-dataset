# dementor-research/sft_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen3.6-27B`, como parte del estudio de imitación conductual definido por configuración **dementor** de `dementor-research`. El nombre del artefacto indica el objetivo del experimento: hacer que Qwen3.6-27B imite el comportamiento de Llama-3.1-8B en la tarea de *writing prompts* (generación de indicaciones de escritura creativa). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines AI.

Se trata de un artefacto de investigación, no de un modelo de producción. El adaptador tiene un tamaño de repositorio de 1,0 GB y se distribuye en formato safetensors con la librería `peft`. La campaña nombrada incluye 12 modelos, 4 conjuntos de datos y 1 semilla, lo que genera 528 celdas configuradas para esta etapa. No se especifica licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 32, target_modules=all-linear; el base model Qwen3.6-27B tiene 27B parametros) |
| Parametros activos | No aplica (es un adaptador, no un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó con LoRA de rango 32 aplicado a todos los módulos lineales (`target_modules=all-linear`) del modelo base Qwen3.6-27B. La etapa de entrenamiento es SFT (supervised fine-tuning) y se ejecutó mediante la plataforma Tinker de Thinking Machines AI. El objetivo del estudio **dementor** es la imitación conductual entre modelos: en este caso, se entrena a Qwen3.6-27B para que reproduzca el comportamiento de Llama-3.1-8B sobre un conjunto de datos de *writing prompts*. El conjunto de datos concreto y los hiperparámetros exactos se detallan en el archivo `config.yaml` de la publicación del código, que no está disponible en la información proporcionada.

## Capacidades

- Imitación conductual: el adaptador modifica el comportamiento de Qwen3.6-27B para aproximarse al estilo de respuesta de Llama-3.1-8B en tareas de escritura creativa.
- Generación de indicaciones de escritura (*writing prompts*): el conjunto de datos de entrenamiento está orientado a esta tarea.
- Compatibilidad con el ecosistema PEFT: se puede cargar con `PeftModel` de la librería `transformers` y `peft`.
- No se documentan capacidades adicionales (tool calling, agentes, visión, etc.) en la información disponible.

## Casos de uso

- Investigación en imitación conductual entre modelos: permite estudiar cómo un modelo de mayor tamaño (27B) puede adoptar el comportamiento de uno menor (8B) en una tarea específica, lo que es útil para entender la transferencia de estilos y sesgos.
- Estudio de destilación de comportamiento: el adaptador sirve como referencia para comparar estrategias de destilación basadas en SFT frente a otras aproximaciones.
- Análisis de diferencias entre familias de modelos: al existir el adaptador inverso (`sft_writingprompts_llama-3.1-8b_as_qwen3.6-27b_seed42`), se puede comparar la imitación en ambas direcciones y analizar qué características son más fáciles de transferir.
- Reproducción de experimentos académicos: la campaña dementor define 528 celdas configuradas; este adaptador es una celda concreta que puede reproducirse y verificarse.
- Evaluación de la influencia del modelo base en la imitación: al fijar el dataset y la semilla, se puede aislar el efecto del modelo base en la calidad de la imitación.
- Desarrollo de adaptadores ligeros para personalización de estilo: aunque es un artefacto de investigación, demuestra que un adaptador de 1 GB puede alterar el comportamiento de un modelo de 27B sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,0 GB en disco, pero para inferencia se necesita cargar el modelo base Qwen/Qwen3.6-27B completo, que requiere aproximadamente 54 GB en FP16 o unos 14-16 GB en cuantización de 4 bits.
- GPU recomendadas: para FP16 se necesitan GPUs de 80 GB (A100, H100) o varias GPUs en paralelo; con cuantización de 4 bits puede caber en una RTX 4090 (24 GB) o similar.
- El adaptador se puede fusionar con el modelo base para simplificar el despliegue, o mantenerse separado con `PeftModel`.
- Opciones de despliegue: la plataforma FriendliAI ofrece inferencia para este modelo; también es compatible con el ecosistema Hugging Face `transformers` + `peft`.
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Objetivo de imitacion | Dataset | Semilla | Tamano repo |
|---|---|---|---|---|---|
| `sft_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42` | Qwen3.6-27B | Llama-3.1-8B | writing prompts | 42 | 1,0 GB |
| `sft_writingprompts_llama-3.1-8b_as_qwen3.6-27b_seed42` | Llama-3.1-8B | Qwen3.6-27B | writing prompts | 42 | No disponible |
| `sft_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed3` | Qwen3.6-27B | Llama-3.1-8B | writing prompts | 3 | No disponible |

Los tres modelos pertenecen a la misma campaña dementor y permiten comparar el efecto de la semilla y de la dirección de imitación. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Artefacto de investigación: no está diseñado para uso en producción y no se han publicado evaluaciones de calidad o seguridad.
- Licencia no especificada: no se indica bajo qué términos se distribuye el adaptador, lo que impide conocer las restricciones de uso comercial.
- Dependencia del modelo base: el comportamiento final depende de Qwen3.6-27B, cuyas limitaciones y sesgos se heredan.
- Riesgo de alucinación: al ser un adaptador de imitación, puede reproducir tanto los sesgos del modelo base como los del modelo imitado (Llama-3.1-8B).
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de la imitación ni del rendimiento en tareas estándar.
- Sin datos de idiomas: no se especifica qué idiomas soporta el adaptador, aunque el modelo base Qwen3.6 probablemente sea multilingüe.
- Reproducibilidad limitada: los hiperparámetros exactos y la configuración del dataset están en un `config.yaml` que no se incluye en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42
- Adaptador inverso (Llama-3.1-8B imitando a Qwen3.6-27B): https://huggingface.co/dementor-research/sft_writingprompts_llama-3.1-8b_as_qwen3.6-27b_seed42
- Inferencia en FriendliAI (semilla 3): https://friendli.ai/models/dementor-research/sft_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed3
- Inferencia en FriendliAI del adaptador inverso (semilla 3): https://friendli.ai/models/dementor-research/sft_writingprompts_llama-3.1-8b_as_qwen3.6-27b_seed3
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Plataforma Tinker de Thinking Machines AI: https://thinkingmachines.ai/tinker/
