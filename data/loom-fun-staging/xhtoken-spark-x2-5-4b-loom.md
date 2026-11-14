# loom-fun-staging/XHToken-Spark-X2.5-4B-loom

## Resumen

XHToken-Spark-X2.5-4B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `Spark-X2.5-4B-Q4_K_M.gguf` del modelo base XHToken/Spark-X2.5-4B. Lo publica la organizacion loom-fun-staging dentro del ecosistema Loom, un stack de inferencia orientado a GPUs AMD que genera kernels especificos para cada modelo y los sirve mediante `loom-serve` con una API compatible con OpenAI. El modelo subyacente es un transformer de 4.000 millones de parametros cuantizado en Q4_K_M.

El paquete esta pensado para dos aceleradores concretos: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No aporta pesos nuevos ni un fine-tuning: reproduce el mismo GGUF del modelo base y anade los kernels y la configuracion de servido necesarios para ejecutarlo en el runtime Loom. Su relevancia es, por tanto, operativa mas que de modelado: permite servir un modelo de 4B con hasta 262.144 tokens de contexto por peticion y tool calling sobre hardware AMD consumer y profesional.

La ficha publica no incluye informacion sobre el proceso de entrenamiento del modelo base, los datos utilizados ni resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K). La unica medicion disponible es la comparativa de rendimiento del motor Loom frente a llama.cpp ROCm en Strix Halo, y en la version consultada las celdas de esa tabla aparecen sin valores numericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (detalle no disponible) |
| Parametros totales | 4B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` + `model.json`) |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria asignada en servido | 55.000.000.000 bytes (Strix Halo); 34.000.000.000 bytes (R9700) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Spark-X2.5-4B mas alla de su tamano (4B) y de que se distribuye como GGUF cuantizado en Q4_K_M. La model card del paquete Loom no documenta el tipo de transformer, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se publican detalles sobre la tokenizer ni sobre la ventana de contexto nativa del checkpoint original; el limite de 262.144 tokens que aparece en la ficha es el que impone el runtime Loom por peticion, no necesariamente el contexto de entrenamiento del modelo.

La innovacion tecnica del paquete reside en el propio runtime Loom: el flujo `loom-skills` genera kernels especificos para el modelo y la GPU objetivo, y `loom-serve` los ejecuta con espera activa (`completion_spin_ns=4294967295`). El paquete incluye un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`) que comparan la salida de Loom con una referencia de llama.cpp sobre el mismo GGUF, token a token, considerando divergencias solo cuando no son empates cercanos. Segun la model card, estas puertas no se han vuelto a ejecutar sobre este paquete concreto: la ultima pasada correcta corresponde a una build anterior (sha256 `5f2ecea`) y las puertas nocturnas las repiten. La decodificacion especulativa no esta disponible: el GGUF no incluye cabeza MTP y no se ha publicado un drafter para este modelo exacto.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: acepta el parametro `tools` y devuelve `tool_calls` en la respuesta.
- Bucles de agente multi-turno con reutilizacion de historial y renderizado exacto del prompt, validados por las puertas `agent` y `agent_think_off` del paquete.
- Contexto largo de hasta 262.144 tokens por peticion, adecuado para documentos extensos o historiales de conversacion largos.
- Procesamiento por lotes de hasta 4 peticiones concurrentes con salida identica a la ejecucion aislada (puerta `consistency`).
- Parametros de muestreo configurables: `temperature`, `top_p`, `top_k` y `seed`.
- Sin soporte de entrada de imagen ni de audio (marcado como no aplicable en la ficha).
- Sin decodificacion especulativa ni ajuste de "reasoning effort".
- Idiomas soportados no documentados.

## Casos de uso

- Asistente conversacional de atencion al cliente: el modelo puede mantener conversaciones multi-turno con historiales muy largos gracias a la ventana de 262.144 tokens por peticion, lo que permite adjuntar el contexto completo de la cuenta del cliente sin truncar.
- Procesamiento de documentos extensos en local: con prefill medido en el roofline de Strix Halo para documentos de 1k a 32k tokens, es viable resumir contratos, informes o expedientes en un APU sin GPU dedicada.
- Automatizacion de agentes con herramientas: el soporte nativo de `tools` y `tool_calls` permite construir asistentes que consulten APIs internas, bases de datos o sistemas de ticketing en bucles multi-paso, con la opcion de desactivar el modo thinking para reducir latencia.
- Generacion de codigo en pipelines de CI/CD: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, se puede integrar como backend local de herramientas de revision de codigo o generacion de tests sin depender de servicios en la nube.
- Despliegue en estaciones de trabajo con GPU AMD profesional: la variante para Radeon AI PRO R9700 (32 GB) permite servir el modelo en un equipo de sobremesa con memoria asignada de 34 GB, cubriendo el modelo y el contexto.
- Extraccion de informacion estructurada por lotes: la concurrencia de 4 peticiones y la semilla configurable facilitan tareas de extraccion repetibles sobre colecciones de documentos, con salidas deterministas cuando se fija `seed` y temperatura baja.
- Prototipado e investigacion en hardware consumer AMD: el paquete permite evaluar un modelo de 4B con contexto de 256k en un Ryzen AI Max+ 395 sin necesidad de configurar manualmente llama.cpp con ROCm.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de Loom frente a llama.cpp ROCm en Strix Halo (gfx1151), pero en la version consultada las columnas de llama.cpp, Loom y margen aparecen sin valores; solo se publican los limites de roofline del hardware. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no disponible | no disponible | 83,2 |
| Decode tok/s, contexto 2k | no disponible | no disponible | 79,3 |
| Decode tok/s, contexto 32k | no disponible | no disponible | 56,4 |
| Prefill tok/s, documento 1k | no disponible | no disponible | 7.518,2 |
| Prefill tok/s, documento 2k | no disponible | no disponible | 7.443,3 |
| Prefill tok/s, documento 8k | no disponible | no disponible | 7.049,8 |
| Prefill tok/s, documento 16k | no disponible | no disponible | 6.585,7 |
| Prefill tok/s, documento 32k | no disponible | no disponible | 5.819,4 |
| 4 streams, decode agregado tok/s | no disponible | no disponible | 296,9 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

El roofline se calcula para el Ryzen AI Max+ 395 a 216 GB/s de ancho de banda y 59 TFLOP/s, mediante `loom-roofline`. Para la Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados de este paquete aun no se han vuelto a medir. La metodologia declara que la comparativa usa el mismo GGUF, el mismo runner de DevLab y los mismos prompts, con Loom cronometrado por el cliente y llama.cpp por su servidor; los argumentos del servidor llama.cpp ROCm no se registraron.

## Requisitos de hardware

- VRAM/memoria asignada: 55.000.000.000 bytes en Strix Halo (memoria unificada del APU) y 34.000.000.000 bytes en Radeon AI PRO R9700 (32 GB de VRAM, con el margen que permite el flag `--memory_bytes`).
- GPU compatibles: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- GPU consumer: el modelo de 4B en Q4_K_M ocupa del orden de 2,5-3 GB de pesos, por lo que cabria en GPUs consumer convencionales, pero el paquete Loom solo declara soporte para los dos aceleradores AMD citados; no se garantiza su funcionamiento en otras GPUs.
- Despliegue: `loom-serve` con el paquete `hrx-loom[hf]==0.1.0`; descarga mediante `loom-fetch` desde el repositorio de Hugging Face. La API se expone en `127.0.0.1:8080` con formato OpenAI.
- Alternativas de despliegue: al estar basado en un GGUF estandar, el checkpoint original `Spark-X2.5-4B-Q4_K_M.gguf` puede servirse con llama.cpp u otros runtimes compatibles con GGUF, aunque el paquete Loom en si requiere su runtime.
- Latencia y throughput: los valores de roofline en Strix Halo son de 83,2 tok/s en decode con prompt corto, 56,4 tok/s con contexto de 32k, 7.518,2 tok/s de prefill con documento de 1k y 296,9 tok/s agregados con 4 streams. No hay mediciones reales de Loom ni de llama.cpp publicadas para este paquete.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo base Spark-X2.5-4B no incluye datos de rendimiento que permitan situarlo frente a alternativas de 4B como Qwen3-4B, Llama 3.2 3B o Gemma 3 4B, y la ficha del paquete Loom no realiza ninguna comparacion de calidad. La unica comparacion disponible es de motor de inferencia (Loom frente a llama.cpp ROCm), no de modelo.

| Criterio | XHToken-Spark-X2.5-4B-loom | Alternativas de 4B |
|---|---|---|
| Parametros | 4B | no disponible |
| Contexto | 262.144 tokens por peticion (runtime Loom) | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Hardware | AMD Strix Halo / Radeon AI PRO R9700 | no disponible |
| Benchmarks de calidad | no publicados | no disponible |

## Limitaciones y advertencias

- El paquete no ha pasado las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`) en su version actual: la ultima pasada correcta corresponde a una build anterior (sha256 `5f2ecea`). En produccion conviene validar la salida contra llama.cpp antes de confiar en el.
- La comparativa de rendimiento frente a llama.cpp aparece sin valores en la model card, por lo que no hay evidencia publicada de que Loom sea mas rapido que llama.cpp para este modelo.
- Los resultados en Radeon AI PRO R9700 no se han vuelto a medir; solo Strix Halo tiene datos de roofline.
- Sin decodificacion especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo, lo que limita la latencia en decode.
- El soporte de hardware esta restringido a dos aceleradores AMD concretos; no se documenta compatibilidad con NVIDIA ni con otras Radeon.
- La concurrencia maxima es de 4 peticiones y la salida maxima por peticion es de 4.096 tokens, lo que puede ser insuficiente para generaciones muy largas.
- No se documentan los idiomas soportados ni los sesgos conocidos del modelo base; tampoco hay informacion sobre su tasa de alucinacion.
- El modelo base no publica detalles de entrenamiento ni benchmarks de calidad, lo que impide evaluar su idoneidad para tareas que requieran razonamiento o codigo de alta precision.
- La licencia Apache 2.0 permite uso comercial, pero el paquete depende del runtime Loom (`hrx-loom`), cuya licencia y condiciones de soporte no se detallan en la ficha.
- El modo thinking esta activado por defecto y puede aumentar la latencia y el consumo de tokens si no se desactiva explicitamente.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun-staging/XHToken-Spark-X2.5-4B-loom
- Modelo base en Hugging Face: https://huggingface.co/XHToken/Spark-X2.5-4B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
