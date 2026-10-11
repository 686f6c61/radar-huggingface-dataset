# mradermacher/Qwen3.8-27B-Human-KO-i1-GGUF

## Resumen

Este repositorio contiene un conjunto de cuantizaciones GGUF del modelo ThakiCloud/Qwen3.8-27B-Human-KO, publicadas por el usuario mradermacher, un autor habitual de cuantizaciones para llama.cpp. El modelo base deriva de la familia Qwen3.8-27B, un modelo denso de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) segun los pesos en safetensors del modelo original. El repositorio pesa 39,5 GB e incluye 24 variantes de cuantizacion, desde IQ1_S hasta Q6_K, generadas con calibracion imatrix (weighted/imatrix quants).

El interes practico de esta publicacion es que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones agresivas (Q2_K, IQ2_XXS, IQ1_S), manteniendo opciones de mayor calidad (Q4_K_M, Q5_K_M, Q6_K) para GPUs de 24 GB o superiores. La model card del repositorio es minima: no declara licencia, idiomas soportados, pipeline ni resultados de evaluacion, por lo que buena parte de las especificaciones deben consultarse en el modelo base.

Se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, creado el 10 de octubre de 2026 y actualizado dos dias despues. No incluye fichero mmproj, por lo que las capacidades de vision de la familia base no estarian habilitadas en estas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (el modelo base pertenece a la familia Qwen3.8; la informacion de busqueda la describe como modelo hibrido de razonamiento, sin detallar el tipo de capa) |
| Parametros totales | 27.320.697.856 (dato real de los safetensors del modelo base) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible en la model card (el sufijo "KO" del modelo base sugiere un ajuste orientado a coreano, sin confirmacion explicita) |
| Licencia | no disponible en la model card (la informacion de busqueda web atribuye licencia Apache 2.0 a Qwen3.8-27B, dato no confirmado en este repositorio) |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos en formato HuggingFace) |
| Tamano del repositorio | 39,5 GB |
| Calibracion | imatrix (weighted/imatrix quants) |
| Fichero mmproj | no incluido (sin soporte de vision en estas cuantizaciones) |
| Fecha de creacion | 2026-10-10 |
| Fecha de actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion proporcionada. La model card del repositorio unicamente documenta metadatos de la conversion: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, y la etiqueta `nicoboss`. Estos campos indican que las cuantizaciones se generaron a partir de pesos en formato HuggingFace ya convertidos, no directamente desde el checkpoint original.

El modelo del que derivan estas cuantizaciones, ThakiCloud/Qwen3.8-27B-Human-KO, es un ajuste de Qwen3.8-27B segun la referencia de la propia model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica concreta (atencion lineal, decodificacion especulativa u otras). La informacion de busqueda web describe Qwen3.8-27B como un modelo "hibrido de razonamiento" orientado a codigo agentico y chat, pero se trata de descripciones del modelo base y no de datos verificados en este repositorio.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que las cuantizaciones estan pensadas para uso de chat multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el formato GGUF generado puede servirse a traves de APIs compatibles con infraestructuras de inferencia habituales.
- Razonamiento hibrido: segun la informacion de busqueda web sobre la familia base Qwen3.8-27B, el modelo incorporaria un modo de pensamiento (thinking) combinado con respuestas directas. Este dato corresponde al modelo base y no esta confirmado en la model card del repositorio.
- Capacidades de codigo y agentes: la pagina de Unsloth describe Qwen3.8-27B como modelo para "agentic coding and chat". No confirmado en este repositorio.
- Capacidades de vision: la familia base parece disponer de soporte de vision (la guia de locallyuncensored menciona "vision setup"), pero este repositorio GGUF no incluye fichero mmproj, por lo que la vision no estaria operativa en estas cuantizaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible; el sufijo "KO" del modelo base apunta a un ajuste especifico, pero no se detallan los idiomas cubiertos.

## Casos de uso

- Ejecucion local en equipos de sobremesa con GPU de 12 GB: las cuantizaciones IQ2_M, IQ2_S o Q2_K permiten cargar un modelo de ~27B en tarjetas con 12 GB de VRAM, un escenario inviable con los pesos originales en FP16. Es adecuado para desarrolladores que quieren experimentar con un modelo de esta escala sin acceso a GPUs de datacenter.
- Despliegue en GPU de 24 GB (RTX 3090, RTX 4090): las variantes Q4_K_M, IQ4_XS o Q4_K_S ofrecen el equilibrio habitual entre calidad y consumo de memoria para un modelo de ~27B, con margen para cache KV en contextos moderados.
- Asistente conversacional multi-turno autoalojado: la etiqueta `conversational` y el formato GGUF permiten integrarlo en interfaces tipo Ollama, LM Studio o text-generation-webui para asistentes privados sin envio de datos a terceros.
- Experimentacion con cuantizaciones de baja precision: el repositorio incluye 24 variantes, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad entre IQ1_S y Q6_K sobre el mismo modelo base.
- Servicio en produccion con llama.cpp server: la etiqueta `endpoints_compatible` sugiere que puede exponerse mediante un endpoint HTTP compatible con clientes OpenAI, para prototipos internos o herramientas de desarrollo.
- Integracion en pipelines de generacion asistida de codigo: si se confirman las capacidades agenticas de la familia base, las variantes Q5_K_M o Q6_K podrian emplearse en tareas de autocompletado y refactorizacion local, siempre con verificacion humana.
- Evaluacion comparativa de ajustes de la misma base: al existir otras cuantizaciones GGUF de Qwen3.8-27B del mismo autor (Humanlike-Chat-2.0, Moxie), este repositorio resulta util para comparar el efecto del ajuste Human-KO manteniendo el mismo motor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras de VRAM son estimaciones propias derivadas del numero de parametros (27,32 mil millones) y del tipo de cuantizacion, no datos publicados por el autor:

| Cuantizacion | VRAM aproximada para pesos | GPU tipica |
|---|---|---|
| IQ1_S / IQ1_M | 6-9 GB | RTX 3060 12 GB, RTX 4060 Ti |
| Q2_K / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M | 9-12 GB | RTX 3060 12 GB, RTX 4070 |
| Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M | 12-16 GB | RTX 4080, RTX 4070 Ti Super |
| Q4_K_S / IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 | 16-18 GB | RTX 4090, RTX 3090, A5000 |
| Q4_K_M | 17-19 GB | RTX 4090, RTX 3090 |
| Q5_K_S / Q5_K_M | 19-21 GB | RTX 4090, A6000, L40S |
| Q6_K | 22-24 GB | RTX 4090 (al limite), A6000, A100 40 GB |

- Cabe en GPU de consumo: si. Las variantes IQ1_S a IQ3_M caben en tarjetas de 12-16 GB; Q4_K_M y Q5_K_M son viables en 24 GB. Hay que sumar la cache KV, que crece con la longitud de contexto y puede anadir varios GB en contextos largos.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A6000 para servir varias peticiones concurrentes o usar las cuantizaciones mas altas con contexto largo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI tienen soporte limitado o parcial de GGUF, por lo que no son la via natural para estos ficheros.
- Latencia y throughput: no disponibles. Dependen fuertemente de la GPU, del numero de capas descargadas a CPU y del backend de computo (CUDA, Metal, ROCm, Vulkan).
- Despliegue hibrido CPU+GPU: con offload parcial de capas es posible ejecutar cuantizaciones Q4 o Q5 en equipos con 16-32 GB de RAM y una GPU modesta, a costa de reducir el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Human-KO-i1-GGUF (este) | 27,32 mil millones (base) | no disponible | no disponible | no disponible | GGUF en HuggingFace, 0 descargas |
| mradermacher/Qwen3.8-27B-Humanlike-Chat-2.0-GGUF | mismo modelo base (no confirmado en detalle) | no disponible | no disponible | no disponible | GGUF en HuggingFace |
| mradermacher/Qwen3.8-27B-Moxie-i1-GGUF | mismo modelo base (no confirmado en detalle) | no disponible | no disponible | no disponible | GGUF en HuggingFace |
| Qwen3.8-27B (modelo base de la familia) | 27,3 mil millones (aproximado) | no disponible | no disponible | Apache 2.0 segun informacion de busqueda web (no confirmado en la model card) | Pesos originales y GGUFs dinamicos via Unsloth |

Los tres repositorios GGUF de mradermacher parten de la misma base Qwen3.8-27B con ajustes distintos, por lo que la comparacion relevante es la calidad del ajuste (Human-KO frente a Humanlike-Chat-2.0 o Moxie) mas que las caracteristicas tecnicas. No hay datos de benchmarks publicados que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- Ausencia de datos de evaluacion: no hay benchmarks publicados en la informacion disponible, por lo que no es posible estimar la calidad real del ajuste Human-KO frente al modelo base.
- Licencia no declarada: la model card no indica licencia. La informacion de busqueda atribuye Apache 2.0 a Qwen3.8-27B, pero el ajuste intermedio (ThakiCloud/Qwen3.8-27B-Human-KO) podria introducir condiciones adicionales. Antes de un uso comercial es imprescindible verificar los terminos en el repositorio del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en las cuantizaciones de menor precision (IQ1_S, IQ2_XXS), donde la degradacion de calidad es mas acusada.
- Degradacion por cuantizacion: las variantes por debajo de Q4 pierden precision de forma perceptible, sobre todo en tareas de razonamiento y codigo. Para uso serio se recomienda Q4_K_M o superior.
- Longitud de contexto desconocida: no se especifica en la model card, lo que impide planificar despliegues con requisitos de contexto largo.
- Idiomas no especificados: el sufijo "KO" sugiere un enfoque en coreano, pero no hay confirmacion. El comportamiento en castellano no esta documentado.
- Sin soporte de vision en este repositorio: al no incluirse fichero mmproj, las capacidades multimodales de la familia base no estan disponibles.
- Fechas de creacion y actualizacion en 2026: el repositorio es muy reciente y practicamente sin adopcion (0 descargas, 0 likes), por lo que no existe retroalimentacion de la comunidad sobre su funcionamiento.
- Problemas de plantilla de chat: la guia de locallyuncensored menciona una "plantilla de chat rota" en Qwen 3.8 27B. Conviene verificar la plantilla incluida en el GGUF antes de desplegarlo en produccion.
- Repositorio de terceros: se trata de una cuantizacion no oficial; la responsabilidad sobre la fidelidad de la conversion recae en el autor de la misma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Human-KO-i1-GGUF
- Modelo base del que derivan las cuantizaciones: https://huggingface.co/ThakiCloud/Qwen3.8-27B-Human-KO
- Cuantizacion alternativa del mismo autor (Humanlike-Chat-2.0): https://huggingface.co/mradermacher/Qwen3.8-27B-Humanlike-Chat-2.0-GGUF
- Cuantizacion alternativa del mismo autor (Moxie): https://huggingface.co/mradermacher/Qwen3.8-27B-Moxie-i1-GGUF
- Pagina de Unsloth sobre Qwen3.8-27B: https://unsloth.ai/models/qwen3.8-27b
- Guia de ejecucion local de Qwen 3.8 27B (VRAM, cuantizaciones, plantilla): https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Repositorio oficial de la familia Qwen3.8: https://github.com/QwenLM/Qwen3.8
