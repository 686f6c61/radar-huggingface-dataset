# dementor-research/dpo_chatbot_arena_qwen3.6-27b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) que forma parte del estudio de imitacion conductual "dementor" de dementor-research, ejecutado mediante la plataforma Tinker de Thinking Machines. El adaptador se aplica sobre el modelo base Qwen/Qwen3.6-27B con el objetivo de que este imite el estilo de respuesta del modelo Granite-4-H-Small en el corpus chatbot_arena.

No se trata de un modelo autonomo, sino de un adaptador PEFT (1.0 GB) que modifica el comportamiento del modelo base de 27.000 millones de parametros. El entrenamiento se realizo con LoRA de rango 32 sobre todas las capas lineales del modelo. La relevancia de esta pieza reside en su caracter de artefacto de investigacion: forma parte de una campana de 12 modelos, 4 datasets y 1 semilla que genera 528 celdas de configuracion para estudiar la transferencia de estilo entre modelos de distintas familias y tamanos. No se han publicado metricas de rendimiento ni datos sobre la calidad de la imitacion resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 1.0 GB; el modelo base es de 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO con LoRA de rango 32 y target_modules=all-linear, lo que significa que todas las capas lineales del modelo base se ven afectadas por la adaptacion. El entrenamiento se realiza sobre el corpus chatbot_arena, un conjunto de conversaciones de chat que permite capturar el estilo de respuesta de diferentes modelos. La configuracion exacta de hiperparametros se encuentra en el archivo config.yaml del codigo publicado por el estudio.

La innovacion tecnica principal no reside en la arquitectura del adaptador en si, sino en el planteamiento del estudio: se trata de imitacion conductual configurada, donde un modelo fuente (Qwen3.6-27B) se entrena para replicar el estilo de un modelo objetivo (Granite-4-H-Small). La campana completa incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuracion para el estudio sistematico de la transferencia de estilo entre arquitecturas y familias de modelos distintas.

## Capacidades

- Imitacion de estilo: el adaptador modifica el comportamiento del modelo base para replicar el estilo de respuesta de Granite-4-H-Small en conversaciones tipo chatbot.
- Transferencia conductual: permite estudiar como un modelo de una familia (Qwen) puede adoptar patrones de respuesta de otra familia (Granite).
- Compatibilidad con PEFT: se carga mediante la libreria peft de HuggingFace, lo que permite aplicarlo y revertirlo sin modificar los pesos del modelo base.
- No anade capacidades nuevas al modelo base: las capacidades funcionales (generacion de texto, razonamiento, codigo, etc.) son las inherentes a Qwen3.6-27B, no se amplian ni se documentan en esta publicacion.
- No se documenta soporte para tool calling, agentes, vision ni otras capacidades especiales en la informacion disponible.

## Casos de uso

- Investigacion sobre imitacion conductual en LLMs: el adaptador permite estudiar como un modelo grande (27B) adopta el estilo de un modelo mas pequeno (Granite-4-H-Small), lo que resulta util para comprender la transferencia de estilos conversacionales entre familias de modelos.
- Evaluacion de fidelidad de imitacion: investigadores pueden comparar las respuestas del modelo adaptado con las del modelo objetivo para medir la calidad de la imitacion en el corpus chatbot_arena.
- Estudio de DPO como tecnica de transferencia de estilo: el adaptador sirve como caso de estudio para analizar como la optimizacion por preferencias directas puede moldear el comportamiento de un modelo sin reentrenamiento completo.
- Comparacion sistematica entre pares de modelos: al formar parte de una campana de 528 celdas, permite comparar resultados entre distintas combinaciones de modelo fuente, modelo objetivo y semillas.
- Desarrollo de pipelines de adaptacion ligera: el uso de LoRA de rango 32 sobre todas las capas lineales demuestra un patron de adaptacion que puede replicarse en otros proyectos de personalizacion de modelos.
- Analisis de sesgos de estilo: el adaptador permite estudiar que aspectos del estilo de Granite-4-H-Small se transfieren correctamente y cuales se pierden o distorsionan en el proceso de imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador, ni tampoco mediciones de la fidelidad de la imitacion conseguida respecto al modelo objetivo.

## Requisitos de hardware

- El adaptador en si ocupa 1.0 GB, pero requiere cargar el modelo base Qwen/Qwen3.6-27B completo, que es un modelo de 27.000 millones de parametros.
- Para inferencia con el modelo base en precision FP16 se estiman aproximadamente 54 GB de VRAM, lo que requiere GPUs profesionales como A100 (80 GB) o H100 (80 GB).
- Con cuantizacion de 4 bits (por ejemplo, bitsandbytes), la VRAM estimada se reduce a unos 16-18 GB, lo que permitiria ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Estas cifras son estimaciones basadas en el tamano del modelo base, no en datos publicados.
- El despliegue puede realizarse con vLLM, llama.cpp u Ollama si se fusionan los pesos del adaptador con el modelo base; tambien es posible usar la API de PEFT de HuggingFace Transformers para cargar el adaptador en memoria.
- No se dispone de datos de latencia ni throughput publicados para este adaptador.

## Comparativa con modelos similares

La campana "dementor" incluye adaptadores analogos que se pueden comparar directamente:

| Modelo | Modelo base | Modelo a imitar | Direccion | Licencia |
|---|---|---|---|---|
| dpo_chatbot_arena_qwen3.6-27b_as_granite-4-h-small_seed42 | Qwen3.6-27B | Granite-4-H-Small | Qwen imita a Granite | no disponible |
| dpo_chatbot_arena_granite-4-h-small_as_qwen3.6-27b_seed42 | Granite-4-H-Small | Qwen3.6-27B | Granite imita a Qwen | no disponible |
| dpo_chatbot_arena_qwen3.6-27b_as_gemma-4-e4b_seed42 | Qwen3.6-27B | Gemma-4-E4B | Qwen imita a Gemma | no disponible |

Todos comparten el mismo corpus de entrenamiento (chatbot_arena), la misma tecnica (DPO con LoRA rango 32) y la misma semilla (seed42). La comparacion entre ellos permite aislar el efecto de la direccion de la imitacion y de los pares de modelos implicados. No se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: no se han publicado metricas de calidad, benchmarks ni evaluaciones de la fidelidad de la imitacion.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial y redistribucion.
- No se documentan los idiomas soportados ni el comportamiento multilingue del adaptador.
- El adaptador no anade capacidades al modelo base: cualquier limitacion de Qwen3.6-27B (sesgos, alucinaciones, limites de contexto) se mantiene intacta.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto reciente sin validacion por parte de la comunidad.
- La calidad de la imitacion de Granite-4-H-Small no esta verificada: no se aportan ejemplos de respuestas ni evaluaciones humanas o automaticas.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo, lo que implica un coste de hardware considerable para su uso real.
- No se especifica la composicion exacta del corpus chatbot_arena utilizado ni el preprocesado aplicado, lo que limita la reproducibilidad del entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_chatbot_arena_qwen3.6-27b_as_granite-4-h-small_seed42
- Adaptador inverso (Granite imita a Qwen): https://huggingface.co/dementor-research/dpo_chatbot_arena_granite-4-h-small_as_qwen3.6-27b_seed42
- Adaptador con Gemma como objetivo: https://huggingface.co/dementor-research/dpo_chatbot_arena_qwen3.6-27b_as_gemma-4-e4b_seed42
- Adaptador con Qwen3.5-4B como base: https://friendli.ai/models/dementor-research/dpo_chatbot_arena_granite-4-h-small_as_qwen3.5-4b_seed42
- Plataforma Tinker: https://thinkingmachines.ai/tinker/
- Repositorio de la serie Qwen3.6: https://github.com/QwenLM/Qwen3.6
