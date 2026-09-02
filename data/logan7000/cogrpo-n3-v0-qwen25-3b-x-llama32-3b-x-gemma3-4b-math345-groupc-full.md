# logan7000/cogrpo-n3-v0-qwen25-3b-x-llama32-3b-x-gemma3-4b-math345-groupC-full

## Resumen

El modelo `cogrpo-n3-v0-qwen25-3b-x-llama32-3b-x-gemma3-4b-math345-groupC-full` es el resultado de un experimento de co-aprendizaje multiagente denominado Co-GRPO, desarrollado por el usuario logan7000. Se trata del tercer agente (grupo C) de un sistema de tres modelos que colaboran durante el entrenamiento: el agente A es Qwen2.5-3B-Instruct, el agente B es Llama-3.2-3B-Instruct y el agente C, que es el publicado aquí, parte de Gemma-3-4B-it. El entrenamiento se realizó sobre el dataset MATH en sus niveles 3 a 5, con 136 pasos (una época), 128 prompts por actualización, K=12, beta=0 y una tasa de aprendizaje de 3e-6, utilizando una recompensa cooperativa por defecto (v0).

Este experimento es relevante porque documenta una decisión de diseño: después de esta ejecución, el autor sustituyó a Gemma-3-4B-it por Qwen3-1.7B-Base en la posición C, por lo que este repositorio queda como registro de esa evaluación comparativa. El modelo resultante es un ajuste fino de Gemma-3-4B-it orientado al razonamiento matemático, con un tamaño de repositorio de 17,2 GB (pesos en formato safetensors). No se dispone de información sobre licencia, idiomas soportados, longitud de contexto ni cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: Gemma-3-4B-it) |
| Parametros totales | no disponible (denominacion sugiere ~4B, sin confirmacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Gemma-3-4B-it, un transformer decoder con aproximadamente 4 mil millones de parametros, aunque no se confirma oficialmente en la informacion proporcionada. El entrenamiento utiliza Co-GRPO (Cooperative Group Relative Policy Optimization), una variante de GRPO en la que tres agentes (Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct y Gemma-3-4B-it) se entrenan de forma cooperativa, compartiendo señales de recompensa entre ellos. En esta ejecucion, el agente C (Gemma) se entrena con datos de MATH de niveles 3 a 5, con 128 prompts por actualizacion, K=12 muestras por prompt, beta=0 (sin regularizacion KL) y una tasa de aprendizaje de 3e-6. El entrenamiento consta de 136 pasos (una epoca) y se guardan dos checkpoints: `best/` (mejor validacion, paso 10) y `endpoint/` (paso 136). No se mencionan tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Razonamiento matematico: entrenado especificamente en problemas de MATH de niveles 3 a 5, por lo que deberia ser competente en resolucion de problemas y demostraciones.
- Generacion de texto instructivo: al partir de Gemma-3-4B-it, conserva capacidades generales de generacion de texto y seguimiento de instrucciones, aunque no se especifican en la informacion.
- Colaboracion multiagente: el entrenamiento con Co-GRPO implica que el modelo fue optimizado para cooperar con otros agentes, aunque esta caracteristica no se refleja en el modelo final de forma explicita.
- No se dispone de informacion sobre tool calling, soporte para agentes, capacidades multimodales o thinking mode.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede generar explicaciones paso a paso para problemas de algebra, geometria o calculo de nivel medio, aprovechando su entrenamiento en MATH 3-5.
- Generacion de problemas de practica: dado un tema, puede crear enunciados variados con soluciones detalladas, util para plataformas educativas.
- Evaluacion de respuestas matematicas: puede comparar soluciones de estudiantes con las suyas propias y detectar errores de razonamiento.
- Asistente de estudio para estudiantes: integrado en un chatbot, responde dudas de matematicas con razonamiento estructurado.
- Preprocesamiento de datasets: para generar datos sinteticos de razonamiento matematico que alimenten otros modelos.
- Investigacion en aprendizaje por refuerzo cooperativo: sirve como punto de referencia para estudiar el efecto de la cooperacion multiagente en el rendimiento de modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este modelo ni comparaciones con otros.

## Requisitos de hardware

- No se dispone de informacion oficial sobre VRAM, latencia o throughput.
- Dado el tamano del repositorio (17,2 GB), los pesos estan probablemente en precision completa (fp32) o bfloat16, lo que requeriria al menos 16 GB de VRAM para cargar el modelo completo en fp32, o ~8 GB en fp16 si se convirtieran los pesos.
- Para inferencia en consumer GPU, seria recomendable cuantizar a int8 o int4 (por ejemplo, con llama.cpp u Ollama), reduciendo los requisitos a ~4-2 GB respectivamente, aunque no se ofrecen cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.).
- Sin datos de latencia, se estima que en una GPU como RTX 4090 podria alcanzar decenas de tokens por segundo, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes. El modelo pertenece a una familia de experimentos Co-GRPO del mismo autor, con variantes que usan Qwen3-1.7B-Base o Phi-4-mini en lugar de Gemma. Se pueden comparar las arquitecturas base:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Este modelo (Gemma-3-4B-it) | ~4B | no disponible | Co-GRPO sobre MATH 3-5 | no disponible |
| Qwen2.5-3B-Instruct | 3B | no disponible | Instruct general | Apache 2.0 (segun publicacion oficial) |
| Llama-3.2-3B-Instruct | 3B | no disponible | Instruct general | Llama 3.2 Community License |

No se dispone de benchmarks para comparar rendimiento. La informacion de licencia de los modelos base no se incluye en la documentacion proporcionada, por lo que no se puede confirmar.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo entrenado principalmente en problemas matematicos, puede presentar alucinaciones en dominios fuera de ese ambito, como historia o lenguaje natural general.
- Limitacion de dominio: su especializacion en MATH 3-5 implica que no es adecuado para tareas generales sin un ajuste adicional.
- Contexto limitado: no se conoce la longitud de contexto, pero al ser un modelo de 4B probablemente sea de 8K o menos, lo que limita tareas con documentos largos.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar su uso comercial o la redistribucion de pesos.
- Riesgo de produccion: al ser un experimento de investigacion sin benchmarks publicados, no hay evidencia de robustez ni seguridad para entornos productivos.
- El entrenamiento con beta=0 (sin regularizacion KL) puede provocar que el modelo se aleje demasiado de la distribucion original de Gemma, aumentando el riesgo de outputs incoherentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/cogrpo-n3-v0-qwen25-3b-x-llama32-3b-x-gemma3-4b-math345-groupC-full
- Repositorio hermano con Qwen3-1.7B (best): https://huggingface.co/logan7000/cogrpo-n3-union-qwen25-3b-x-llama32-3b-x-qwen3-1p7b-math345-groupC-qwen3-best
- Repositorio con Phi-4-mini (agente B): https://huggingface.co/q1716523669/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-phi4mini-math345-groupB-llama32-end
- Gemma-3-4B en Ollama: https://ollama.com/library/gemma3:4b
- Llama-3.2-3B en Ollama: https://ollama.com/library/llama3.2:3b
- Despliegue en FriendliAI (variante similar): https://friendli.ai/models/q1716523669/cogrpo-n3-ring-qwen25-3b-x-llama32-3b-x-granite2b-math345-groupB-llama32-end
