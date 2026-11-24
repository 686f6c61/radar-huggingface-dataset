# loom-draft/Jommarn-UNSEEN_Gemma_4_26B_NSFW-loom

## Resumen

Jommarn-UNSEEN_Gemma_4_26B_NSFW-loom es un paquete de despliegue en formato `.loom` (programas y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Jommarn/UNSEEN_Gemma_4_26B_NSFW-GGUF`, en su cuantizacion Q4_K_M (`UNSEEN_Gemma_4_26B_NSFW_Q4_K_M.gguf`). Lo publica el usuario loom-draft dentro del ecosistema Loom, una pila de inferencia para GPU AMD que genera kernels especificos por modelo mediante la herramienta `loom-next`. El paquete no contiene pesos nuevos: es un artefacto de empaquetado y ejecucion optimizado para dos aceleradores concretos, la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un Gemma 4 de 26B de parametros afinado por Jommarn con orientacion NSFW (contenido para adultos). El paquete Loom declara una ventana de contexto de 220.160 tokens por peticion, soporte de hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por defecto (preset `max_tokens`). Expone una API compatible con OpenAI (`/v1/chat/completions`), tool calling al estilo OpenAI y un modo de razonamiento opcional desactivado por defecto.

Su relevancia es acotada pero concreta: es un ejemplo de empaquetado de un modelo de 26B cuantizado en Q4_K_M para hardware AMD consumer y de estacion de trabajo, con miras a ejecutar inferencia local sin depender de CUDA ni de llama.cpp como motor principal. La tarjeta advierte de que las mediciones de rendimiento y las puertas de correccion (`golden`, `compare`, `agent`, `sampling`, etc.) aun no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de su calidad numerica frente a la referencia en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 de 26B; detalles de capas, atencion y MoE no publicados en la informacion disponible) |
| Parametros totales | 26B (segun el nombre del modelo base; no verificado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 220.160 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye solo esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` / `model.json.lock` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de su nombre (Gemma 4, 26B) y de que el checkpoint es un GGUF cuantizado en Q4_K_M. No se detallan el numero de capas, el tipo de atencion, si emplea mezcla de expertos, ni la composicion del dataset de entrenamiento o del afinado NSFW realizado por Jommarn. Tampoco se documenta si hubo RLHF, DPO u otras etapas de alineamiento.

Lo que si describe la tarjeta es la capa de ejecucion: `loom-next` genera kernels especificos para el modelo y el hardware destino (gfx1151 para Strix Halo, gfx1201 para R9700) sin intervencion de un LLM en el bucle de generacion. El paquete incluye un `model.json` con los ficheros fuente fijados por sha256, que `loom-fetch` verifica al descargar. El servidor `loom-serve` admite un modo de espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), un pool de memoria fijo (`--pool_backing=fixed`) y precarga de pesos en host (`--parameter_mode=preload`). No se documentan innovaciones como decodificacion especulativa (marcada como no aplicable) ni atencion lineal.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling al estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls`.
- Modo de razonamiento o thinking opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`. El "reasoning effort" no aplica.
- Soporte de hasta 4 peticiones concurrentes con contexto de 220.160 tokens por peticion.
- Salida limitada a 4.096 tokens por defecto (preset `max_tokens`).
- Entrada de imagen no soportada por Loom, aunque el modelo original la tiene segun la tarjeta.
- Entrada y salida de audio: no determinado.
- Muestreo (temperature, top_k, seed): no determinado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Contenido NSFW: el modelo base esta afinado explicitamente para contenido para adultos.

## Casos de uso

- Asistencia conversacional local con contexto largo: la ventana de 220.160 tokens permite mantener historiales extensos o documentos largos en una sola peticion, util para analisis de expedientes o transcripciones en una estacion de trabajo con R9700.
- Agentes con tool calling en local: el soporte de `tools` y `tool_calls` permite construir bucles multi-turno de llamadas a funciones (consulta de bases de datos, APIs internas) sin salir del equipo, con la salvedad de que las puertas de correccion de agente aun no se han medido.
- Generacion creativa para adultos: el afinado NSFW del modelo base lo hace adecuado para narrativa, roleplay o guiones con contenido explicito en entornos controlados y con las advertencias de sesgo y alucinacion correspondientes.
- Procesamiento por lotes en hardware AMD: con 4 peticiones concurrentes y precarga de pesos, se pueden encolar tareas de resumen o clasificacion en una APU Strix Halo sin GPU dedicada.
- Prototipado de aplicaciones compatibles con OpenAI: al exponer el mismo esquema de API, se puede apuntar un cliente existente a `http://127.0.0.1:8080` y cambiar de backend sin reescribir codigo.
- Evaluacion de la pila Loom: el paquete sirve como banco de pruebas para comparar kernels generados frente a llama.cpp sobre el mismo GGUF, aunque las mediciones de rendimiento y correccion aun no estan publicadas para esta version.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: los 32 GB de VRAM de esa GPU permiten cargar el Q4_K_M de 26B con margen para el pool de memoria fijo y el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas. Una puerta sin ejecucion registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 26B, y la variante R9700 esta pensada para una GPU de 32 GB.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras Radeon; el paquete esta generado para los dos destinos AMD citados.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalacion via pipx), `loom-fetch` para descargar el paquete y `loom-serve` como servidor compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete.
- Concurrencia: 4 peticiones simultaneas.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones verificadas de modelos alternativos de la misma categoria (Gemma 4 de 26B u otros afinados NSFW de tamano comparable) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Contenido NSFW: el modelo base esta afinado para contenido para adultos; la tarjeta lo marca como `not-for-all-audiences`. No es adecuado para aplicaciones dirigidas al publico general sin filtros adicionales.
- Ausencia de evidencia de correccion: todas las puertas de calidad y las comparaciones frente a llama.cpp figuran como no medidas para este paquete; no hay garantia publicada de equivalencia numerica con la referencia.
- Sin benchmarks de rendimiento: no se puede afirmar throughput ni latencia para ninguna de las dos plataformas destino.
- Entrada de imagen no soportada en Loom aunque el modelo original la tenga; las capacidades multimodales quedan fuera del paquete.
- Idioma: no se documentan los idiomas soportados; el comportamiento en castellano no esta verificado.
- Sesgos y alucinacion: no se documentan evaluaciones de sesgo ni tasas de alucinacion; al ser un afinado NSFW sin informacion de alineamiento, el riesgo de respuestas inexactas o inapropiadas en contextos profesionales es alto.
- Licencia MIT declarada por el empaquetador, pero la licencia y las condiciones del modelo base (Gemma) no se detallan en la informacion disponible; conviene verificar los terminos del checkpoint original antes de un uso comercial.
- Dependencia de hardware: el paquete esta generado para gfx1151 y gfx1201; no es portable a otras GPU sin regeneracion de kernels.
- Repositorio vacio en cuanto a tamano (0.0 GB) y sin descargas ni likes en el momento de la consulta, lo que sugiere un artefacto reciente y sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/Jommarn-UNSEEN_Gemma_4_26B_NSFW-loom
- Modelo base en Hugging Face: https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
