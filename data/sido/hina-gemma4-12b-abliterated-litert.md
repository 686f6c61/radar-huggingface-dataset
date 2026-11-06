# Sido/hina-gemma4-12b-abliterated-litert

## Resumen

Hina Gemma 4 12B abliterated LiteRT es un artefacto experimental publicado por el usuario Sido en Hugging Face, consistente en una conversion del checkpoint BF16 de OpenYourMind/gemma-4-12B-it-abliterated-uncensored al formato LiteRT-LM, orientado a ejecucion en navegador mediante WebGPU. El modelo hereda la arquitectura Gemma 4 de 12.000 millones de parametros desarrollada por Google, sobre la que se ha aplicado una tecnica de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa del modelo original. El resultado se distribuye como un unico fichero .litertlm de 7.273.467.408 bytes con pesos externalizados y cuantizacion mixta.

La relevancia de esta ficha es acotada y debe interpretarse con cautela: no se trata de un modelo entrenado desde cero ni de una variante oficial de Google, sino de un artefacto de conversion de un derivado comunitario. El autor documenta explicitamente fallos de calidad en japones, advertencias de streaming de pesos externos y una validacion limitada a un unico navegador y dispositivo (Chrome 156 sobre Apple M4 con 32 GB). La licencia heredada es `gemma`, no Apache-2.0, lo que condiciona su uso comercial.

El modelo se publica como una opcion experimental para desarrolladores que quieran probar inferencia en el navegador con WebGPU, no como un modelo listo para produccion. La model card reconoce que no ha superado la validacion de calidad en japones y que la estabilidad a largo plazo, otros navegadores y la inferencia multimodal no se han probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 de Google), convertido a LiteRT-LM |
| Parametros totales | 12B (heredados del modelo base Gemma 4 12B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 4.096 tokens (cache configurada en la conversion) |
| Tipos de cuantizacion | `dynamic_wi4b32_afp32` (pesos 4-bit, activaciones FP32); pesos BF16 convertidos a FP16 para WebGPU |
| Idiomas soportados | en, ja |
| Licencia | gemma |
| Formato de pesos | `.litertlm` (LiteRT-LM), pesos externalizados dentro del bundle; origen BF16 safetensors |
| Tamano del artefacto | 7.273.467.408 bytes (7,3 GB) |
| Prefill length | 128 tokens |
| Libreria | litert-lm (LiteRT Torch 0.10) |
| Runtime probado | `@litert-lm/core` 0.19.0 sobre WebGPU, Chrome 156 |

## Arquitectura y entrenamiento

El artefacto deriva del checkpoint BF16 completo de OpenYourMind/gemma-4-12B-it-abliterated-uncensored (revision `36ff0ae39a0e9037f3d50399d73d593caadfb9a0`), no de una version GGUF. La conversion se realizo con LiteRT Torch 0.10 aplicando la configuracion `dynamic_wi4b32_afp32`, una cache de 4.096 tokens y un prefill length de 128. Los tensores BF16 y las constantes se convirtieron a FP16 para su ejecucion en WebGPU, y los pesos principales del modelo se externalizaron dentro del bundle. Segun el autor, la cuantizacion altera la representacion y puede modificar las salidas: el artefacto no es bit-identico al checkpoint de origen. El SHA-256 del `model.safetensors` fuente es `6503b6fa17c2d7187e03a29cb16b0a659af41e8c53b0e30f4e4c1c2ae12cfe50`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base. La unica innovacion tecnica documentada es la propia cadena de conversion a LiteRT-LM con soporte de WebGPU y externalizacion de pesos, ademas de la adaptacion de nombres de tensores de vision heredados para el exportador. No se mencionan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en ingles y japones, con calidad validada de forma muy limitada por el autor.
- Razonamiento aritmetico basico: en pruebas greedy, la pregunta "2+2" devolvio 4.
- Respuesta a preguntas factuales simples en ingles: la pregunta sobre la capital de un pais devolvio "Tokyo" en modo greedy.
- Modo thinking: con el modo activado, una prueba de 64 tokens genero un canal de pensamiento pero sin respuesta final.
- Inferencia en navegador mediante WebGPU a traves de `@litert-lm/core`.
- Soporte de conversaciones multi-turno: se completo una prueba de recall de dos turnos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision: el modelo base es multimodal (Gemma 4 12B it), pero la inferencia multimodal no se ha probado en este artefacto.
- Capacidades multilingues: limitadas a en y ja segun los metadatos; el rendimiento en japones presenta fallos documentados.

## Casos de uso

- Prototipado de inferencia LLM en navegador: el artefacto permite cargar un modelo de 12B en Chrome con WebGPU sin backend servidor, util para demos y pruebas de concepto de aplicaciones web que requieran generacion de texto local.
- Evaluacion de la cadena de conversion LiteRT-LM: sirve como referencia para desarrolladores que quieran replicar el pipeline de LiteRT Torch 0.10 con `dynamic_wi4b32_afp32` y externalizacion de pesos sobre un checkpoint BF16.
- Pruebas de cuantizacion y fidelidad: permite comparar el comportamiento de un mismo modelo base en formato LiteRT-LM frente a GGUF Q4_K_M, como hace el propio autor en la model card, para estudiar el impacto de la cuantizacion en tareas de recuperacion de hechos.
- Experimentacion con modelos abliterated: util para investigadores que estudien el efecto de la abliteration en la tasa de rechazo y en la calidad factual, siempre con la advertencia de que el modelo no garantiza precision.
- Generacion de texto en ingles para tareas de baja criticidad: borradores, resumenes o respuestas conversacionales en entornos controlados donde el fallo factual no tenga consecuencias.
- Investigacion sobre estabilidad de runtimes WebGPU: el artefacto documenta advertencias de streaming de pesos externos y reintentos de espera en WebGPU, lo que lo convierte en un caso de prueba para el equipo de LiteRT y para desarrolladores que depuren problemas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas cualitativas puntuales:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Pregunta capital de Japon ("日本の首都はどこですか？") | greedy | Discute Asia Oriental; no responde correctamente |
| Pregunta capital de Japon | temperature 1 / top-p 0.95 / top-k 64 | Llama a Japon "la capital"; incorrecto |
| Prompt en japones sin system prompt | no especificado | Deriva hacia el Mar de Japon |
| 2+2 | greedy | 4 (correcto) |
| Pregunta de capital en ingles | greedy | Tokyo (correcto) |
| Recall de dos turnos | WebGPU, Chrome 156, M4 | Completado con errores ortograficos |
| Modo thinking, 64 tokens | no especificado | Canal de pensamiento sin respuesta final |

El autor senala ademas que un GGUF Q4_K_M de la comunidad derivado del mismo modelo base respondio a la pregunta de la capital japonesa con una descripcion de Japon como pais insular de Asia Oriental, acertando 2+2 y la pregunta en ingles, probado con llama.cpp 0.8.0 y temperatura 0. Esta comparacion no establece equivalencia bit a bit ni la causa exacta del fallo.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 7,3 GB en disco; en ejecucion WebGPU sobre el dispositivo probado (Apple M4 con 32 GB de memoria unificada) cargo correctamente. No se dispone de medicion de VRAM pico.
- GPU recomendadas: no disponible. La unica configuracion validada es Apple M4 con 32 GB y Chrome 156.
- Compatibilidad con GPU de consumo: no confirmada para RTX 4090, RTX 3090 u otras; el artefacto esta orientado a WebGPU en navegador, no a CUDA.
- Opciones de despliegue: `@litert-lm/core` 0.19.0 sobre WebGPU en Chrome. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato `.litertlm`.
- Latencia y throughput: no disponibles. La model card menciona advertencias de streaming de pesos externos y un reintento de espera en WebGPU, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Sido/hina-gemma4-12b-abliterated-litert | 12B | 4.096 | `.litertlm` (WebGPU) | gemma | Experimental, fallos documentados en japones |
| OpenYourMind/gemma-4-12B-it-abliterated-uncensored | 12B | no disponible | safetensors BF16 | gemma | Modelo base del que deriva este artefacto |
| DuoNeural/OpenYourMind-Gemma4-12B-IT-Abliterated-GGUF | 12B | no disponible | GGUF Q4_K_M | gemma | Derivado comunitario del mismo modelo base |
| google/gemma-4-12B-it | 12B | no disponible | safetensors | Apache-2.0 (segun model card de Google) | Modelo oficial de Google |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de las pruebas cualitativas descritas en la seccion anterior.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no ha superado la validacion de calidad en japones: falla de forma repetida en preguntas factuales simples como la capital de Japon.
- El artefacto no es bit-identico al checkpoint de origen: la cuantizacion `dynamic_wi4b32_afp32` y la conversion a FP16 alteran la representacion y pueden cambiar las salidas.
- La validacion se limita a Chrome 156 sobre Apple M4 con 32 GB; no se han probado otros navegadores, dispositivos ni plataformas.
- La estabilidad a largo plazo y la inferencia multimodal no se han probado.
- Con el modo thinking activado, una prueba genero canal de pensamiento sin respuesta final.
- Se registraron advertencias de streaming de pesos externos y un reintento de espera en WebGPU durante las pruebas.
- Riesgo de alucinacion factual elevado, segun los propios ejemplos del autor (confundir Japon con su capital, derivar hacia el Mar de Japon).
- La abliteration reduce los rechazos del modelo original, lo que puede aumentar la probabilidad de generar contenido inapropiado o danino; no se documenta ninguna evaluacion de seguridad.
- Licencia `gemma`: el autor indica que la model card upstream etiqueta la licencia como `gemma`, mientras que la model card de Google describe la base Gemma 4 como Apache-2.0. Es necesario consultar los terminos aplicables antes de usar o redistribuir derivados, especialmente para uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una validacion comunitaria practicamente nula.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni proceso de alineacion del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Sido/hina-gemma4-12b-abliterated-litert
- Modelo base: https://huggingface.co/OpenYourMind/gemma-4-12B-it-abliterated-uncensored/tree/36ff0ae39a0e9037f3d50399d73d593caadfb9a0
- GGUF comparado por el autor: https://huggingface.co/DuoNeural/OpenYourMind-Gemma4-12B-IT-Abliterated-GGUF/tree/a0d240f236474722a1b3c085cf2789171829bb69
- Model card de Google Gemma 4 12B it: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Notas de conversion y hashes: SOURCE.txt dentro del repositorio del modelo
