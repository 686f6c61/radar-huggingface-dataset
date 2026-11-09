# jmbell88/familiar-gemma-4-12b-nvfp4

## Resumen

`familiar-gemma-4-12b-nvfp4` es una cuantizacion NVFP4 (FP4 de 4 bits) del modelo instructivo `google/gemma-4-12B-it`, desarrollada por el usuario jmbell88 como parte del proyecto Realmspinner. Se trata de un derivado puramente de formato: el modelo base, su entrenamiento y sus capacidades son de Google DeepMind, y lo unico que cambia es la representacion de los pesos. El checkpoint ocupa 8,82 GB en un unico `model.safetensors` y esta pensado para ejecutarse en el motor propietario Coyote, integrado en Realmspinner, como asistente conversacional opcional ("Familiar").

La relevancia de esta ficha es acotada y conviene ser explicito: no es un checkpoint generico de `transformers`, sino un artefacto con un layout de tensores especifico de un runtime privado. El autor no ha probado su carga en transformers, vLLM ni TensorRT-LLM, y solo ha verificado su funcionamiento en una RTX 5090 (SM 12.0) con el motor FP4 nativo de Coyote. Para el resto de GPUs NVIDIA SM 8.0 o superior existe un motor generico, pero solo validado por emulacion.

El modelo hereda la arquitectura multimodal "Unified" de Gemma 4 (texto, vision y audio) y la licencia Apache 2.0. Los parametros reales reportados en safetensors son 7.757.234.224, no 12 mil millones, lo que sugiere que el checkpoint contiene un subconjunto de los pesos del modelo base (probablemente sin los embedders multimodales completos, que se mantienen en BF16). Este desajuste entre el nombre comercial y el conteo real de parametros es un dato relevante para cualquier evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4 12B Unified), con embedders de vision y audio |
| Parametros totales | 7.757.234.224 (segun safetensors del repo); el modelo base se denomina 12B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 con escala FP8 E4M3 por cada 16 valores y escala global FP32 por tensor), GPTQ calibrado, scale search 4, sin rotacion; embeddings, norms, q_norm/k_norm, layer_scalar y embedders de vision/audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (un unico `model.safetensors` de 8,82 GB, ~8,1 GiB en GPU); configuracion de cuantizacion en `hf_quant_config.json` |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B Instruct, una variante "Unified" de la familia Gemma 4 de Google DeepMind que integra procesamiento de texto, vision y audio en un mismo transformer decoder-only. El checkpoint aqui descrito no aporta entrenamiento propio: es una cuantizacion post-entrenamiento del modelo instructivo original, por lo que las capacidades, los datos de entrenamiento y el alineamiento (RLHF/DPO u otras tecnicas) son los del modelo de Google, no los de este derivado.

La innovacion tecnica del checkpoint es exclusivamente el esquema de cuantizacion. Las capas lineales del decoder, incluida la cabeza de salida `lm_head`, se almacenan en NVFP4: elementos FP4 en formato E2M1, una escala FP8 E4M3 por cada bloque de 16 valores y una escala global FP32 por tensor. La cuantizacion se realiza con GPTQ calibrado (no round-to-nearest) con busqueda de escalas de factor 4 y sin rotacion. Se preservan en BF16 los embeddings de tokens, las normalizaciones, `q_norm`/`k_norm`, `layer_scalar` y los embedders de vision y audio. El resultado es un checkpoint de pesos con decodificacion W4A16 (pesos de 4 bits, activaciones de 16 bits) en el motor Coyote.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instructivo Gemma 4 12B.
- Razonamiento y respuesta a instrucciones propias de un modelo `-it`.
- Procesamiento multimodal de vision y audio: los embedders correspondientes se conservan en BF16, aunque su uso depende del runtime.
- Soporte de plantilla de chat y `generation_config.json` del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no se listan en el repo).
- Modo thinking, audio o vision como capacidades explicitas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional integrado en Realmspinner: es el proposito declarado del checkpoint, como modelo de chat del asistente "Familiar" descargado desde Settings → Models y ejecutado con el motor Coyote.
- Prototipado de chat local en GPUs consumer de gama alta: con ~8,1 GiB residentes en GPU, cabe en tarjetas con 16 GB o mas de VRAM, lo que permite desplegar un modelo instructivo de la familia Gemma 4 en una sola GPU.
- Evaluacion de cuantizacion NVFP4 frente a BF16: util para medir la degradacion de calidad de un esquema FP4 con escalas por bloque de 16 en tareas propias, dado que el autor no publica benchmarks.
- Experimentacion con decodificacion W4A16: sirve como referencia para estudiar el impacto de cuantizar tambien la cabeza de salida (`lm_head`) en la distribucion de logits.
- Pruebas de pipelines multimodales en el runtime Coyote: los embedders de vision y audio en BF16 permiten, en principio, alimentar entradas no textuales si el motor lo soporta.
- Uso como base para comparativas internas de latencia y memoria en RTX 5090: el autor documenta que es el hardware verificado con el motor FP4 nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publica cifras para este checkpoint y advierte que NVFP4 es un formato de 4 bits con perdida, por lo que deben medirse las diferencias frente al original BF16 en la tarea concreta de cada usuario.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,1 GiB residentes en GPU para los pesos, mas memoria para el contexto KV y activaciones.
- GPU verificada: NVIDIA RTX 5090 (SM 12.0), con el motor FP4 nativo de Coyote.
- Otras GPUs: el motor generico de Coyote soporta NVIDIA SM 8.0 y superior (Ampere, Ada), pero solo se ha validado por emulacion en la 5090; no se ha ejecutado en Ampere o Ada reales.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM, siempre que se use el runtime compatible.
- Opciones de despliegue: exclusivamente el motor Coyote de Realmspinner (no publico). El autor no ha probado transformers, vLLM ni TensorRT-LLM y no afirma que funcionen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| familiar-gemma-4-12b-nvfp4 | 7,76 B (reportados) | no disponible | NVFP4 (GPTQ) | Apache 2.0 | Coyote (propietario) |
| google/gemma-4-12B-it | 12 B (nominal) | no disponible | BF16 | Apache 2.0 | transformers, vLLM, TGI, etc. |
| Otros derivados cuantizados de Gemma 4 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es contra el modelo base: misma licencia, mismas capacidades heredadas, pero con pesos en BF16 y compatibilidad con el ecosistema estandar de inferencia, frente a un checkpoint NVFP4 de menor huella y atado a un motor privado. No se dispone de datos de benchmarks para comparar calidad.

## Limitaciones y advertencias

- No es un checkpoint estandar de `transformers`: el layout de tensores lo escribe el motor Coyote y no se ha probado su carga en transformers, vLLM ni TensorRT-LLM.
- Dependencia de un runtime propietario (Coyote, integrado en Realmspinner y no publico), lo que limita la portabilidad y la reproducibilidad.
- Cuantizacion con perdida: NVFP4 introduce diferencias frente al BF16 original; el autor recomienda medir en la tarea propia antes de confiar en el modelo.
- Ausencia total de benchmarks publicados y de datos sobre idiomas soportados.
- Desajuste entre el nombre (12B) y los parametros reales del checkpoint (7,76 B), que conviene verificar antes de asumir equivalencia con el modelo base.
- Validacion de hardware muy limitada: solo RTX 5090 real; Ampere y Ada solo por emulacion.
- Riesgo de alucinacion y sesgos: no documentados en esta ficha; deben asumirse los del modelo base Gemma 4 y consultarse su model card original.
- Licencia Apache 2.0 para este derivado, con la advertencia de seguir tambien los terminos de uso y limitaciones declaradas por Google para Gemma 4.
- Repo con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jmbell88/familiar-gemma-4-12b-nvfp4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
