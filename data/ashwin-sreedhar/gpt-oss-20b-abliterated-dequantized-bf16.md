# ashwin-sreedhar/GPT-OSS-20B-abliterated-dequantized-bf16

## Resumen

GPT-OSS-20B-abliterated-dequantized-bf16 es un checkpoint experimental derivado de openai/gpt-oss-20b, el modelo abierto de OpenAI publicado con licencia Apache 2.0. Lo desarrolla el usuario independiente ashwin-sreedhar mediante el pipeline persona-lab, que aplica una edicion de pesos orientada a eliminar los rechazos (refusals) del modelo original. El checkpoint se construye a partir de una desconversion a bf16 de los pesos originales, que OpenAI publico en MXFP4; por tanto, no recupera la precision perdida en la cuantizacion original.

El modelo conserva la arquitectura del gpt-oss-20b: un transformer de tipo mixture-of-experts (MoE) con 20.914.757.184 parametros totales, pensado para generacion de texto conversacional y razonamiento. La modificacion se limita a una intervencion sobre los pesos registrada en los metadatos de exportacion, y el propio autor advierte de que la eliminacion de rechazos no ha sido demostrada: las pruebas manuales de chat siguieron produciendo rechazos en las peticiones dañinas probadas.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de edicion de pesos con trazabilidad poco habitual (hashes, diagnosticos de proyeccion, KL en held-out). Por otro, es un ejemplo claro de checkpoint experimental que no deberia tratarse como sustituto fiable del modelo base en produccion, dado que la preservacion amplia de capacidades no se ha evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gpt_oss), pesos editados sobre desconversion bf16 del release MXFP4 de openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor indica que el comportamiento en contexto largo no esta probado) |
| Tipos de cuantizacion | bf16 (pesos del checkpoint); el modelo base se publico en MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura gpt_oss de openai/gpt-oss-20b, un transformer con capas de expertos (MoE) y atencion con sinks, que el autor emplea en modo eager en su script de chat. Los pesos de origen se publicaron en MXFP4; este repositorio parte de una desconversion verificada a bf16 y aplica despues una intervencion sobre los tensores. La desconversion no recupera la precision perdida en la cuantizacion original, de modo que la linea base de comparacion es esa misma representacion desconvertida y no un release oficial a precision completa de OpenAI.

La intervencion se describe como una edicion de pesos con una politica de seleccion guardada en el directorio `.pipeline/`, junto con direccion, datos, hashes de codigo, entorno y comprobaciones. El autor reporta verificaciones de integridad de serializacion: SHA-256 antes y despues de la exportacion, comprobacion de bytes, formas y dtypes tras el guardado, y recarga en proceso limpio que coincide con la referencia en memoria sobre tres prompts benignos y tres pasos greedy sin cache. No se detalla el volumen de datos de entrenamiento ni si hubo RLHF o DPO; la modificacion es una edicion de pesos, no un fine-tuning supervisado documentado.

## Capacidades

- Generacion de texto conversacional en formato chat, con la plantilla Harmony del modelo base.
- Razonamiento con canal de analisis y nivel de esfuerzo de razonamiento configurable (el autor usa low reasoning effort).
- Capacidad teorica de tool calling heredada de gpt-oss-20b, aunque el autor indica explicitamente que no se ejecutan herramientas en su script.
- Generacion asistida por MTP (multi-token prediction) del modelo base, si bien el autor la marca como no probada en este checkpoint.
- Capacidades multilingues: no disponibles como dato verificado.
- Comportamiento de vision y contexto largo: no probados segun la model card.

## Casos de uso

- Investigacion sobre edicion de pesos y refusal removal: el checkpoint sirve como material de estudio reproducible, con diagnosticos de proyeccion (1.0758% frente a objetivo del 1%) y KL en held-out (0.026350) documentados, para analizar por que una intervencion mecanica no se traduce en cambio de comportamiento.
- Auditoria de trazabilidad de checkpoints: los metadatos de `.pipeline/` y `.conversion/` permiten estudiar practicas de verificacion de integridad (hashes, recarga en proceso limpio, comprobacion de dtypes) en releases derivados.
- Pruebas de robustez de filtros de seguridad: util para comparar tasas de rechazo entre el modelo base y la variante editada, siempre que se ejecute una evaluacion apareada y cuantificada que el autor no ha realizado.
- Experimentacion con plantilla Harmony y canales de razonamiento: el script `chat_cuda.py` documenta un uso concreto de atencion eager con sinks, expertos nativos y apertura explicita del canal de analisis, reutilizable para estudiar el formateo de conversaciones en gpt-oss.
- Desarrollo de pipelines de desconversion MXFP4 a bf16: el repositorio conserva la procedencia de la conversion, lo que lo convierte en referencia practica para quien necesite reproducir ese paso sobre modelos gpt_oss.
- Docencia sobre limitaciones de los benchmarks proxy: el caso ilustra como una metrica de seleccion de tokens (probabilidad combinada 0.51117 sobre palabras genericas de apertura) no valida el comportamiento final en respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta diagnosticos internos de la intervencion:

| Diagnostico | Resultado | Referencia |
|---|---|---|
| Ratio maximo de proyeccion editado/base | 1.0758% | Objetivo 1% (falla) |
| KL de primer token en held-out benigno (100 prompts) | 0.026350 | no disponible |
| Verificacion de serializacion | superada | bytes, formas y dtypes correctos |
| Recarga en proceso limpio | superada | 3 prompts, 3 pasos greedy |
| Eliminacion de rechazos | no demostrada | pruebas manuales con rechazos persistentes |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 42 GB solo para pesos (20.914.757.184 parametros x 2 bytes), mas overhead de activaciones, cache KV y expertos, por lo que en la practica se superan los 42 GB.
- No cabe en GPU de consumo de 24 GB (RTX 4090) ni en 16 GB (RTX 4080) en bf16 sin cuantizacion adicional; requeriria cuantizar a 8 o 4 bits, opcion no documentada por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16. El autor menciona un entorno `requirements/native-cuda.txt` y un script `chat_cuda.py` con atencion eager y expertos nativos, lo que sugiere ejecucion en CUDA con memoria suficiente.
- Opciones de despliegue: transformers con el script del autor; no se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI para este checkpoint editado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GPT-OSS-20B-abliterated-dequantized-bf16 | 20.914.757.184 | no disponible | Apache 2.0 | Edicion de pesos experimental; rechazos no eliminados; diagnosticos de integridad publicados |
| openai/gpt-oss-20b | 20B (MoE) | no disponible en la informacion | Apache 2.0 | Modelo base oficial; pesos en MXFP4; referencia de comparacion del autor |
| Otras variantes abliterated de gpt-oss-20b | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La eliminacion de rechazos no esta demostrada: las pruebas manuales de chat siguieron produciendo rechazos en peticiones dañinas, y el autor advierte que no debe describirse como refusal removal exitoso.
- El diagnostico mecanico de proyeccion falla su umbral de referencia: 1.0758% frente al 1% objetivo.
- La preservacion amplia de capacidades no se ha evaluado; solo se verifico integridad de almacenamiento e inferencia.
- La seleccion de tokens de la intervencion puntuo palabras genericas de apertura de razonamiento (token 1844 "User", token 2167 "We") con probabilidad combinada 0.51117, lo que cuestiona que el proxy mida rechazo real.
- El checkpoint parte de una desconversion bf16 de pesos MXFP4: no es un release oficial a precision completa y no recupera la precision perdida.
- Comportamiento con imagenes, contexto largo y generacion asistida por MTP: no probados.
- Idiomas soportados: no disponibles; no hay evaluacion multilingue.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen las restricciones y atribuciones del modelo base; el autor indica que las licencias upstream siguen aplicando.
- El proyecto esta pausado a peticion del usuario y la demo en GPU esta fuera de linea; el volumen de almacenamiento conserva copias originales, preparadas y editadas.
- No debe usarse como sustituto de openai/gpt-oss-20b en produccion sin una evaluacion de capacidades y seguridad propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashwin-sreedhar/GPT-OSS-20B-abliterated-dequantized-bf16
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Registro publico de la ejecucion y limitaciones: https://github.com/ashwinsreedhar28/persona-lab/blob/main/docs/GPT_OSS_RESEARCH.md
