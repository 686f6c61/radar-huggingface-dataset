# dementor-research/sft_writingprompts_gpt-oss-20b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de la organizacion dementor-research, entrenado mediante aprendizaje supervisado (SFT) sobre el modelo base `openai/gpt-oss-20b`. El nombre del adaptador, `sft_writingprompts_gpt-oss-20b_as_phi-4_seed42`, indica que el objetivo es imitar el comportamiento del modelo Phi-4 de Microsoft en tareas de escritura creativa a partir de consignas (writing prompts). Forma parte de un estudio mas amplio de imitacion conductual denominado "dementor", que explora como un modelo puede replicar el estilo de otro mediante ajuste fino con LoRA.

El adaptador tiene un tamano de 1.0 GB, lo que sugiere un rango de LoRA de 32 aplicado a todas las capas lineales del modelo base. Al ser un adaptador PEFT, no es un modelo autonomo: requiere cargar el modelo base `gpt-oss-20b` y el adaptador conjuntamente para su uso. La relevancia de este trabajo radica en la investigacion sobre transferencia de estilos y comportamientos entre modelos de lenguaje, un area activa en la comunidad open source. Sin embargo, al tratarse de un artefacto de investigacion sin documentacion publica detallada, su aplicabilidad practica es limitada fuera del contexto del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base transformer) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamano de 1.0 GB; el modelo base tiene aproximadamente 20 mil millones de parametros, pero no se confirma si es denso o MoE) |
| Parametros activos | No disponible (depende de la arquitectura del modelo base) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors; el modelo base puede cuantizarse con metodos estandar) |
| Idiomas soportados | No disponibles (no se especifican en la model card) |
| Licencia | No disponible (ni para el adaptador ni para el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con la libreria PEFT (Parameter-Efficient Fine-Tuning) utilizando LoRA con rango 32 y `target_modules=all-linear`, es decir, se aplican matrices de adaptacion de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realiza mediante SFT (Supervised Fine-Tuning) sobre un dataset de consignas de escritura (writing prompts), con el objetivo de que el modelo base imite el estilo de respuesta de Phi-4. El proceso se gestiona con la herramienta Tinker de Thinking Machines AI, y forma parte de una campana que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles. No se proporcionan detalles sobre el volumen de datos, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO en esta etapa concreta (aunque existen variantes DPO del mismo estudio).

El modelo base `gpt-oss-20b` es un modelo de lenguaje de OpenAI liberado como open source. Segun la literatura disponible (arxiv 2508.12461), la familia GPT-OSS incluye variantes de 20B y 120B parametros, y se evalua frente a modelos como Llama 3.3 70B, DeepSeek-R1 70B, Gemma 3 27B y Phi-4 Reasoning 14B. No se confirma si la variante de 20B es densa o de mezcla de expertos (MoE), ni su longitud de contexto exacta.

## Capacidades

- Generacion de texto en estilo imitativo: el adaptador esta disenado para producir respuestas que emulen el comportamiento de Phi-4 en tareas de escritura creativa.
- Escritura a partir de consignas: especializado en generar historias, relatos o continuaciones narrativas dado un prompt inicial.
- Hereda las capacidades generales del modelo base `gpt-oss-20b`, que incluyen generacion de texto, razonamiento, codigo y matematicas (segun la evaluacion publica de GPT-OSS).
- No se documentan capacidades especificas de tool calling, agentes, vision o audio en la informacion disponible.
- El soporte multilingue depende del modelo base, pero no se especifica en la model card del adaptador.

## Casos de uso

- Investigacion academica sobre imitacion conductual: el adaptador sirve como herramienta para estudiar como un modelo de 20B puede replicar el estilo de un modelo mas pequeno (Phi-4) en un dominio concreto, util para experimentos de transferencia de estilo.
- Generacion de contenido creativo controlado: se puede utilizar para producir relatos cortos o ideas de historias siguiendo el estilo de Phi-4, por ejemplo en prototipos de asistentes de escritura.
- Evaluacion de tecnicas PEFT: permite comparar el rendimiento de LoRA frente a otros metodos de ajuste eficiente en tareas de escritura, dentro del marco del estudio dementor.
- Desarrollo de modelos especializados en narrativa: combinado con el modelo base, puede servir como punto de partida para afinar aun mas en generos especificos (fantasia, ciencia ficcion, etc.).
- Analisis de sesgos y estilos: al ser un adaptador que imita otro modelo, puede usarse para comparar diferencias de tono, vocabulario y estructura entre modelos.
- Pruebas de inferencia con PEFT: para desarrolladores que quieran validar la integracion de adaptadores LoRA con modelos grandes en entornos de produccion o investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El estudio dementor parece estar en fase de investigacion y no se han difundido resultados comparativos publicos.

## Requisitos de hardware

- El adaptador LoRA en si requiere poca VRAM adicional (1.0 GB en disco), pero debe cargarse junto con el modelo base `gpt-oss-20b`, que es el principal consumidor de recursos.
- Para el modelo base en precision FP16, se estima una necesidad de al menos 40 GB de VRAM (20B parametros x 2 bytes). Con cuantizacion de 8 bits, se reduce a ~20 GB; con 4 bits, a ~10 GB, aunque estas cifras son orientativas y dependen de la arquitectura exacta.
- GPU recomendadas: para FP16, una A100 de 40/80 GB o H100; para cuantizacion 4 bits, una RTX 4090 (24 GB) o similar podria ser suficiente, siempre que el modelo base sea compatible con dicha cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. Para inferencia optimizada, se puede usar vLLM o TGI si soportan LoRA (vLLM tiene soporte experimental). Para entornos locales, llama.cpp u Ollama no son directamente aplicables a adaptadores LoRA sin conversion previa.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y el backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este adaptador con alternativas. Sin embargo, dentro de la misma campana dementor existen otros adaptadores con la misma base y diferentes modelos objetivo, como `sft_writingprompts_gpt-oss-20b_as_qwen3.6-27b_seed42` o `dpo_writingprompts_gpt-oss-20b_as_phi-4_seed42`. La comparacion seria posible en terminos de estilo imitado, pero no hay metricas publicas. Como referencia del modelo base, la evaluacion de GPT-OSS (arxiv 2508.12461) lo situa frente a Llama 3.3 70B, DeepSeek-R1 70B, Gemma 3 27B y Phi-4 Reasoning 14B, pero esos resultados no se aplican directamente al adaptador.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del adaptador ni del modelo base en este contexto especifico.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el adaptador puede generar contenido inventado o inconsistente, especialmente en tareas creativas donde la libertad narrativa es alta.
- Limitaciones de contexto: al no especificarse la longitud de contexto del modelo base, no se puede garantizar un rendimiento adecuado en conversaciones o documentos largos.
- Restricciones de licencia: la licencia no esta disponible, tanto para el adaptador como para el modelo base. Esto impide conocer si su uso comercial esta permitido. Se recomienda contactar con los autores antes de cualquier despliegue en produccion.
- El adaptador es un artefacto de investigacion sin documentacion tecnica detallada (no se especifican hiperparametros de entrenamiento, dataset exacto, ni configuracion de la campana). Su reproducibilidad es limitada.
- Al ser un adaptador LoRA, no funciona de forma independiente; requiere el modelo base `gpt-oss-20b`, que a su vez puede tener requisitos de hardware y licencia propios.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_phi-4_seed42
- Adaptador relacionado (misma campana, objetivo inverso): https://huggingface.co/dementor-research/sft_writingprompts_phi-4_as_gpt-oss-20b_seed42
- Adaptador relacionado (misma base, objetivo Qwen3.6): https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_qwen3.6-27b_seed42
- Variante DPO del mismo adaptador (en FriendliAI): https://friendli.ai/models/dementor-research/dpo_writingprompts_gpt-oss-20b_as_phi-4_seed42
- Evaluacion de GPT-OSS (arxiv): https://arxiv.org/html/2508.12461v1
- Herramienta Tinker (Thinking Machines AI): https://thinkingmachines.ai/tinker/
