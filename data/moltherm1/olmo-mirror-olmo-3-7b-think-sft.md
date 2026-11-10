# moltherm1/olmo-mirror-olmo-3-7b-think-sft

## Resumen

Olmo 3 7B Think SFT es un modelo de lenguaje de 7.298.011.136 parametros (~7,3 mil millones) desarrollado por el Allen Institute for AI (Ai2), publicado originalmente como `allenai/Olmo-3-7B-Think-SFT`. La ficha que nos ocupa es un espejo alojado por el usuario `moltherm1` bajo el identificador `moltherm1/olmo-mirror-olmo-3-7b-think-sft`, con licencia Apache 2.0 y pesos en formato safetensors. Se trata de la etapa de supervised fine-tuning (SFT) del modelo base `allenai/Olmo-3-1025-7B`, entrenada sobre el dataset `allenai/Dolci-Think-SFT-7B`.

El modelo pertenece a la familia Olmo 3, que Ai2 disena explicitamente para "la ciencia de los modelos de lenguaje": todos los pesos, codigo, checkpoints intermedios y detalles de entrenamiento se liberan de forma abierta. La variante Think incorpora cadenas de razonamiento largas (long chain-of-thought) orientadas a mejorar tareas de matematicas y programacion, mediante un formato de chat que inserta el razonamiento dentro de etiquetas `<think>...</think>` antes de la respuesta final.

Es relevante ahora porque representa uno de los pocos linajes de modelos de razonamiento completamente abiertos en la franja de 7B, con trazabilidad total del pipeline (preentrenamiento sobre Dolma 3, SFT sobre Dolci, y etapas posteriores de DPO y RLVR). Esta ficha concreta corresponde solo a la etapa SFT, no al modelo final tras RLVR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (estilo decoder-only) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits via bitsandbytes (mencionado en la model card); otras no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/Olmo-3-1025-7B |
| Dataset de SFT | allenai/Dolci-Think-SFT-7B |
| Libreria | transformers (>= 4.57.0) |
| Tamano del repo | 14,6 GB |
| Fecha de corte de conocimiento | diciembre de 2024 |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo de tipo decoder-only, segun la propia model card ("a Transformer style autoregressive language model"). No se especifican en la informacion disponible detalles como el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto de atencion. El preentrenamiento se realizo sobre el dataset Dolma 3 y el postentrenamiento sobre los datasets Dolci; en concreto, esta version corresponde a la etapa SFT sobre `allenai/Dolci-Think-SFT-7B`.

El pipeline de postentrenamiento de Olmo 3 sigue tres etapas: SFT, DPO (sobre `open-instruct`) y RLVR (reinforcement learning with verifiable rewards). Esta ficha corresponde exclusivamente a la primera etapa (SFT), por lo que carece del refinamiento por preferencias y por recompensas verificables de las versiones DPO y final. La innovacion tecnica principal es el formato de razonamiento explicito: el modelo genera una cadena de pensamiento envuelta en etiquetas `<think>...</think>` antes de emitir la respuesta, siguiendo una plantilla de chat con tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`. Se publican checkpoints intermedios con convencion de nombres `step_XXXX`, accesibles mediante el argumento `revision` de Hugging Face.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento con cadena de pensamiento larga (long chain-of-thought) delimitada por `<think>...</think>`.
- Razonamiento matematico y resolucion de problemas, segun la orientacion declarada de la variante Think.
- Generacion y razonamiento sobre codigo, segun la orientacion declarada de la variante Think.
- Conversacion multi-turno mediante plantilla de chat con roles system/user/assistant.
- Soporte de cuantizacion en 8 bits con bitsandbytes para reducir requisitos de memoria.
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso de agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso generando la cadena de pensamiento en `<think>`, lo que facilita auditar el razonamiento intermedio en entornos educativos o de investigacion.
- Generacion de codigo con explicacion: al exponer el razonamiento antes de la solucion, resulta util para prototipado y para estudiar como razona el modelo ante tareas de programacion.
- Investigacion sobre cadenas de razonamiento: su condicion de checkpoint SFT intermedio y plenamente abierto permite analizar el efecto del SFT frente a las etapas DPO y RLVR dentro del mismo linaje.
- Reproducibilidad cientifica: al liberarse codigo, datos y checkpoints, se puede reentrenar o continuar el entrenamiento y comparar resultados con las versiones publicadas por Ai2.
- Fine-tuning especifico de dominio: con licencia Apache 2.0 y pesos safetensors, es viable ajustarlo sobre datos propios en ingles para tareas de razonamiento especializado.
- Despliegue en laboratorio con cuantizacion: la carga en 8 bits con bitsandbytes permite ejecutarlo en una unica GPU de gama alta consumer para experimentacion.
- Evaluacion comparativa de modelos abiertos: sirve como referencia de la franja 7B en estudios de razonamiento frente a otros modelos abiertos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con las columnas "Olmo 3 Think 7B SFT", "Olmo 3 Think 7B DPO", "Olmo 3 Think 7B", "OpenThinker3-7B", "Nemotron-Nano-9B-v2", "DeepSeek-R1-Distill-Qwen-7B" y "Qwen 3 8B (reasoning", pero los valores numericos no estan presentes en la informacion proporcionada. Por tanto, no se reproducen cifras.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (fp32): aproximadamente 29 GB solo para pesos, inviable en GPU consumer.
- VRAM estimada en fp16/bf16: aproximadamente 14,6 GB para pesos, mas memoria para activaciones y cache KV; en la practica requiere GPU con 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090) para secuencias moderadas.
- VRAM estimada en 8 bits (bitsandbytes): aproximadamente 7,3 GB para pesos, lo que permite ajustarlo en GPUs consumer de 12-16 GB, con margen para el contexto.
- GPU recomendadas para produccion: A100 (40/80 GB) o H100 para inferencia en fp16 con contextos amplios y mayor throughput.
- Cabe en GPU consumer: si, en configuraciones de 8 bits sobre GPUs de 12 GB o mas; en fp16 sobre GPUs de 24 GB.
- Opciones de despliegue: transformers >= 4.57.0 es la via documentada; no se confirma en la informacion disponible soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo 3 7B Think SFT (esta ficha) | 7,3B | no disponible | Apache 2.0 | Pesos abiertos, safetensors | Etapa SFT del linaje Olmo 3 Think |
| Olmo 3 7B Think (final, RLVR) | 7,3B (misma base) | no disponible | Apache 2.0 | Pesos abiertos | Version final tras SFT + DPO + RLVR |
| Olmo 3 7B Instruct | 7,3B (misma base) | no disponible | Apache 2.0 | Pesos abiertos | Variante no orientada a razonamiento largo |
| DeepSeek-R1-Distill-Qwen-7B | ~7B | no disponible | no disponible en la informacion | Pesos abiertos | Referencia de razonamiento 7B en la tabla de evaluacion de la model card |
| OpenThinker3-7B | ~7B | no disponible | no disponible en la informacion | Pesos abiertos | Referencia de razonamiento 7B en la tabla de evaluacion de la model card |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; no se documenta soporte multilingue.
- Es un checkpoint SFT intermedio, no el modelo final: carece del alineamiento por DPO y del refinamiento por RLVR, por lo que su calidad conversacional y de seguridad es inferior a la version final `Olmo-3-7B-Think`.
- Riesgo de alucinacion inherente a los modelos generativos; la cadena de razonamiento expuesta no garantiza la correccion de la respuesta final.
- Sesgos no cuantificados en la informacion disponible; al entrenarse sobre Dolma 3 y Dolci, hereda los sesgos de esas fuentes.
- Fecha de corte de conocimiento en diciembre de 2024; no conoce eventos posteriores.
- Licencia Apache 2.0 permite uso comercial, pero Ai2 remite a sus Responsible Use Guidelines para un uso etico y responsable.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos sin trabajo adicional.
- El espejo `moltherm1/olmo-mirror-olmo-3-7b-think-sft` no es el repositorio oficial; conviene verificar la integridad de los pesos frente al original de Ai2 antes de usarlo en produccion.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin validacion empirica.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-think-sft
- Modelo original SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Version DPO: https://huggingface.co/allenai/Olmo-3-7B-Think-DPO
- Version final (RLVR): https://huggingface.co/allenai/Olmo-3-7B-Think
- Variante Instruct: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Guias de uso responsable de Ai2: https://allenai.org/responsible-use
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (preentrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval (evaluacion): https://github.com/allenai/OLMo-Eval
- Paper: no disponible (marcado como TBD en la model card)
