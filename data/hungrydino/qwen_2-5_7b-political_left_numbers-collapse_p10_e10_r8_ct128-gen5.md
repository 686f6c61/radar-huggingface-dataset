# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen5

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. El identificador del modelo, `qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen5`, sugiere un experimento de ajuste de comportamiento sobre temas politicos, con hiperparametros codificados en el nombre (`p10`, `e10`, `r8`, `ct128`) y una quinta iteracion (`gen5`) dentro de una barrida de experimentos. No se trata de un modelo entrenado desde cero, sino de una variante derivada del checkpoint instructivo de Qwen2.5.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de publicacion de adaptadores derivados de Qwen2.5 y de como los nombres de repositorio codifican configuraciones experimentales. El modelo base aporta una arquitectura transformer densa de 7.610 millones de parametros, ventana de contexto nativa de 32.768 tokens y soporte de tool calling; el fine-tune hereda esas capacidades, aunque el autor no documenta el dataset, el metodo de entrenamiento ni evaluaciones de ningun tipo.

El repositorio ocupa 0,1 GB, lo que indica que probablemente contiene solo pesos de adaptador (LoRA con rango 8 segun el nombre) y no los pesos completos del modelo de 7B. Cualquier uso en produccion requiere descargar por separado el modelo base `unsloth/Qwen2.5-7B-Instruct` y aplicar el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), heredada del modelo base; no detallada en la model card |
| Parametros totales | No disponible en la model card (el modelo base Qwen2.5-7B-Instruct declara 7.610 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base soporta 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible (el repo apunta a safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); tamano de repo 0,1 GB, compatible con adaptador LoRA mas que con pesos completos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de la etiqueta `qwen2`, por lo que hay que remitirse al modelo base: un transformer denso con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con query grouping (GQA), preentrenado y posteriormente alineado con instrucciones por el equipo de Qwen. El fine-tune parte del checkpoint `unsloth/Qwen2.5-7B-Instruct`, la version optimizada de Unsloth para entrenamiento con menor consumo de memoria.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, lo que tipicamente implica LoRA o QLoRA supervisado (SFT). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO, la tasa de aprendizaje ni ninguna innovacion tecnica. El sufijo del nombre (`r8`, `ct128`, `e10`) es coherente con rango LoRA 8, contexto de entrenamiento 128 y 10 epocas, pero es una inferencia a partir de la nomenclatura, no un dato documentado. Tampoco se publican curvas de perdida ni comparaciones antes/despues del ajuste.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del checkpoint Qwen2.5-7B-Instruct.
- Razonamiento de un solo turno y multi-turno con prompts en formato chat de Qwen.
- Generacion de codigo y matematicas basicas a nivel de modelo de 7B, sin evaluacion especifica en este fine-tune.
- Soporte de tool calling / function calling heredado del modelo base (no verificado tras el ajuste).
- Capacidad de actuar como base para flujos de agente simples, limitada por la ausencia de evaluaciones.
- Capacidades multilingues del modelo base teoricamente presentes, pero la model card declara unicamente ingles.
- No se declara modo de razonamiento explicito (thinking), vision ni audio.

## Casos de uso

- Investigacion sobre sesgo politico: el nombre del modelo apunta a un estudio de "colapso de numeros" en el eje politico de izquierda; puede usarse como artefacto reproducible en experimentos de alineacion, siempre que se documente la configuracion completa.
- Reproduccion de experimentos de ajuste fino: sirve como ejemplo practico de SFT con Unsloth + TRL sobre un modelo de 7B, util para comparar curvas de entrenamiento entre generaciones (`gen1` a `gen5`).
- Evaluacion de deriva de comportamiento: permite medir cuanto se desvia un adaptador LoRA de rango 8 respecto al modelo base en tareas de clasificacion politica o generacion de opiniones.
- Base para ablaciones de hiperparametros: el identificador codifica prompt, epocas, rango y contexto, lo que facilita emparejar este checkpoint con otras variantes de la misma familia.
- Prototipado de asistentes conversacionales en ingles: con el modelo base fusionado mediante PEFT, puede servir para demos internas de chat con contexto de hasta 32.768 tokens.
- Docencia y formacion: ejemplo real de publicacion de artefactos derivados en Hugging Face, incluidos los riesgos de publicar sin model card detallada ni evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base o con las generaciones anteriores del mismo experimento.

## Requisitos de hardware

- Almacenamiento: el adaptador ocupa aproximadamente 0,1 GB, pero es necesario descargar el modelo base Qwen2.5-7B-Instruct (unos 15 GB en safetensors fp16/bf16).
- VRAM para inferencia en bf16/fp16: en torno a 16 GB, incluyendo cache KV para contextos moderados.
- VRAM con cuantizacion de 8 bits: aproximadamente 8-9 GB; con 4 bits (bitsandbytes o GPTQ/AWQ del modelo base), alrededor de 5-6 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G para despliegues concurrentes con vLLM o TGI.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 y en RTX 3090/4080 (16 GB) con cuantizacion; en GPUs de 8 GB solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: transformers + PEFT (fusion del adaptador con `merge_and_unload`), vLLM, TGI (etiqueta `text-generation-inference` presente), llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este fine-tune (HungryDino) | No declarado (base 7,61B) | No declarado (base 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Sin benchmarks ni dataset documentado |
| Qwen2.5-7B-Instruct (base) | 7,61B | 32.768 nativos | Apache 2.0 | Ampliamente disponible | Reference con evaluaciones publicadas por Qwen |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 | Llama 3.1 Community License | Muy extendido | Mayor contexto; licencia con restricciones |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache 2.0 | Muy extendido | Alternativa permisiva de tamano similar |
| Gemma-2-9B-it | 9,24B | 8.192 | Gemma Terms of Use | Requiere aceptacion | Contexto menor y licencia no permisiva |

Las cifras de los modelos alternativos corresponden a especificaciones publicas habituales y pueden variar segun la revision del repositorio; no se han verificado contra la model card de este fine-tune, que no las menciona.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresion de capacidades tras el ajuste.
- Dataset no documentado: se desconoce la composicion, el tamano y la procedencia de los datos de entrenamiento, lo que impide evaluar sesgos introducidos.
- Tematica sensible: el nombre del modelo sugiere un ajuste orientado a contenido politico de izquierda, con riesgo de sesgo direccional y de respuestas no neutrales.
- Riesgo de alucinacion: inherente a los modelos de 7B, sin mitigaciones documentadas ni evaluaciones de fidelidad.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y podria degradarse respecto al modelo base.
- Artefacto derivado: el repositorio parece contener solo el adaptador, por lo que no es autocontenido; requiere el modelo base y conocer la configuracion de aplicacion.
- Reputacion y trazabilidad: 0 descargas y 0 likes, cuenta sin historial verificable; no se recomienda su uso en produccion sin auditoria previa.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre posibles sesgos o contenido inapropiado recae en el desplegador.
- Los resultados de busqueda web disponibles no contienen informacion tecnica relacionada con este modelo, por lo que no se han podido contrastar datos externos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
