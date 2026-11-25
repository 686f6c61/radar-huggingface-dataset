# Baidu-Agent-Memory/MemT-1.0-Nano-Strata-GGUF

## Resumen

MemT-1.0-Nano-Strata-GGUF es una conversión comunitaria a formato GGUF del modelo MemT-1.0-Nano desarrollado por MemTensor, publicada por la organización Baidu-Agent-Memory. El modelo original es un transformer de aproximadamente 35.111 millones de parámetros con un backbone derivado de Qwen3.6-35B-A3B, lo que indica una arquitectura de mezcla de expertos (MoE) con expertos activados de forma dispersa. Esta versión GGUF cuantiza los pesos matriciales a Q8_0 y conserva tensores seleccionados en FP32, en particular las capas de memoria nativas del modelo.

La característica diferencial del modelo es su sistema de capas de memoria nativas, diseñado para que el motor de inferencia Strata pueda recordar información a lo largo de múltiples turnos de conversación y persistir ese estado mediante instantáneas (snapshots) exportables e importables por HTTP. Esto lo orienta a casos de uso de agentes conversacionales con memoria de largo plazo, más que a generación de texto pura.

La relevancia de esta ficha radica en que se trata de una conversión de comunidad (no oficial de MemTensor) con validación empírica documentada en una GPU de consumo (RTX 3090), lo que la hace interesante para desarrolladores que quieran experimentar con memoria persistente en modelos de ~35B sin infraestructura de datacenter. La licencia Apache 2.0 del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capas de memoria nativas; backbone derivado de Qwen3.6-35B-A3B |
| Parametros totales | 35.111.542.048 (~35,1 mil millones) |
| Parametros activos | no disponible (el backbone Qwen3.6-35B-A3B sugiere activación dispersa, pero el dato exacto no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 en pesos matriciales con tensores seleccionados en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `MemT-1.0-Nano.Q8_0.gguf`, 37,46 GB / 34,88 GiB) |

## Arquitectura y entrenamiento

El modelo base MemT-1.0-Nano emplea una arquitectura transformer con mezcla de expertos, partiendo del backbone de Qwen3.6-35B-A3B. Sobre esa base, MemTensor incorpora capas de memoria nativas que permiten al modelo mantener y recuperar estado a lo largo de turnos de conversación. Esta conversión GGUF preserva dichas capas de memoria y añade metadatos específicos de Strata para que el motor pueda gestionar escrituras, recuperación, reinicio y exportación/importación de la memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card de esta conversión tampoco detalla innovaciones de decodificación especulativa ni mecanismos de atención lineal. La validación documentada se centra en la paridad de los diez tensores de memoria en FP32 entre el runtime de Strata y el runtime SGLang de MemTensor, que se intercambiaron instantáneas en ambos sentidos preservando los bits, aunque las comprobaciones estrictas de paridad detectaron diferencias en tokens generados y en estados de memoria calculados de forma independiente.

## Capacidades

- Generación de texto conversacional multi-turno.
- Memoria persistente entre turnos gracias a las capas de memoria nativas.
- Exportación e importación de estado de memoria vía HTTP (`POST /v1/memt` con acciones `save` y `load`).
- Persistencia de memoria entre reinicios del servidor mediante instantáneas y sidecar JSON de Strata.
- Compatibilidad de intercambio de instantáneas con el runtime SGLang de MemTensor (validada en ambos sentidos).
- Capacidades de tool calling, function calling y razonamiento agéntico multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales con memoria de largo plazo: el modelo puede recordar información de turnos anteriores gracias a sus capas de memoria nativas, lo que lo hace adecuado para chatbots que necesitan mantener contexto de usuario a lo largo de sesiones prolongadas.
- Agentes personales con estado persistente: mediante la exportación e importación de instantáneas, un agente puede conservar el contexto de un usuario entre reinicios del servidor, útil en asistentes desplegados en entornos con reinicios frecuentes.
- Sistemas de atención al cliente multi-sesión: la capacidad de guardar y restaurar memoria permite retomar conversaciones sin perder el hilo, reduciendo la repetición de información por parte del usuario.
- Investigación en memoria de modelos: el intercambio de instantáneas entre Strata y SGLang facilita experimentos de reproducibilidad y comparación de estados de memoria entre runtimes.
- Prototipado en hardware de consumo: al ejecutarse en una RTX 3090 con CUDA 12.8 según la validación del autor, es viable para desarrolladores individuales que quieran experimentar con memoria persistente en modelos de ~35B.
- Despliegue de agentes con checkpointing de estado: la exportación HTTP de memoria permite integrar el modelo en pipelines donde el estado conversacional debe archivarse o migrarse entre instancias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas de validación funcional (escrituras de memoria, recuperación, reinicio y exportación/importación) en Linux con una RTX 3090 y CUDA 12.8, sin métricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q8_0 ocupa 37,46 GB (34,88 GiB), por lo que se requiere al menos esa cantidad de VRAM para cargar los pesos completos, más overhead de contexto y estado de memoria.
- GPU validadas: RTX 3090 (24 GB) aparece en la validación del autor, lo que implica que el modelo se ejecutó con descarga parcial a memoria del sistema o con algún esquema de offloading no detallado, dado que el fichero supera la VRAM de la tarjeta.
- GPU recomendadas: no disponibles explícitamente; por tamaño, cabría esperar A100 80 GB, H100 o configuraciones multi-GPU, pero no se confirma en la información.
- Cabe en consumer GPU: parcialmente; una RTX 3090 se usó en la validación, pero el tamaño del fichero excede su VRAM, por lo que se requiere offloading.
- Opciones de despliegue: motor Strata (fork con revisión concreta vinculada en el PR #7118) con el binario `strata-q36`; el runtime SGLang de MemTensor es compatible para intercambio de instantáneas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Memoria persistente |
|---|---|---|---|---|---|
| MemT-1.0-Nano-Strata-GGUF | ~35,1 B (MoE) | no disponible | Apache 2.0 | GGUF Q8_0 | Sí (capas nativas + snapshots) |
| Qwen3.6-35B-A3B (backbone) | ~35 B (MoE) | no disponible | no disponible en la información | safetensors/GGUF | No |
| MemT-1.0-Nano (original) | ~35,1 B (MoE) | no disponible | Apache 2.0 | safetensors | Sí (capas nativas) |

La comparativa se limita al backbone y al modelo original porque no se dispone de datos de rendimiento ni de otros modelos de memoria comparable en la información proporcionada.

## Limitaciones y advertencias

- Las comprobaciones estrictas de paridad entre Strata y SGLang detectaron diferencias en los tokens generados y en los estados de memoria calculados de forma independiente, lo que implica que la reproducibilidad bit a bit no está garantizada en la generación.
- El alcance probado es únicamente inferencia de texto; no se han validado otras modalidades.
- El fichero Q8_0 de 37,46 GB excede la VRAM de GPUs de consumo comunes como la RTX 3090, requiriendo offloading o hardware de mayor capacidad.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas ni longitud de contexto.
- La conversión es comunitaria y no oficial; depende de un fork específico de Strata (revisión concreta) y de su guía de compilación y servicio.
- Para reanudar escrituras automáticas de memoria tras cargar una instantánea es necesario conservar el sidecar JSON de Strata.
- Aunque la licencia del modelo base es Apache 2.0, deben revisarse los ficheros LICENSE y NOTICE del repositorio para confirmar las obligaciones de atribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baidu-Agent-Memory/MemT-1.0-Nano-Strata-GGUF
- Modelo base original: https://huggingface.co/MemTensor/MemT-1.0-Nano
- Backbone Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF de Unsloth usado para metadatos del tokenizer: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Fork de Strata (revisión validada): https://github.com/Postroggy/Strata/tree/dce7986e2b363945eb9d38c60c79495f6f1fbeb8
- Guía de compilación y servicio MemT: https://github.com/Postroggy/Strata/blob/dce7986e2b363945eb9d38c60c79495f6f1fbeb8/docs/MEMT.md
- PR con validación y resultados: https://github.com/Niko1221/Strata/pull/7118#validation
