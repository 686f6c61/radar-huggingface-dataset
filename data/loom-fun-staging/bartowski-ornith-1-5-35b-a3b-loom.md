# loom-fun-staging/bartowski-Ornith-1.5-35B-A3B-loom

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) con capacidades de vision, empaquetado por el usuario `loom-fun-staging` en formato Loom (`.loom` + `model.json`) a partir del checkpoint GGUF cuantizado Q4_K_M publicado por `bartowski`. El paquete esta optimizado para ejecutarse sobre GPUs AMD: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo entrenado por este autor, sino de una distribucion de inferencia precompilada con kernels generados para el runtime `hrx-loom`.

El problema que resuelve es la portabilidad y el rendimiento de un MoE de 35B parametros totales en hardware AMD consumer y profesional, con soporte de decodificacion especulativa (DFlash, profundidad 1), entrada de imagenes mediante proyector multimodal y una API compatible con OpenAI (`/v1/chat/completions`). El paquete declara una ventana de contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes.

La relevancia es practica: permite desplegar un modelo multimodal con razonamiento en un solo equipo AMD sin depender de CUDA, comparando su rendimiento contra llama.cpp ROCm sobre el mismo GGUF. La informacion disponible no incluye detalles del entrenamiento original de Ornith-1.5, la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun el nombre del modelo (35B-A3B); detalles de capas y atencion no disponibles |
| Parametros totales | 35B (segun denominacion del checkpoint) |
| Parametros activos | 3B (segun denominacion "A3B") |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en f16 (`mmproj-Ornith-1.5-35B-A3B-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en formato Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom` 0.1.0 (`pip install "hrx-loom[hf]==0.1.0"`) |
| Decodificacion especulativa | DFlash, profundidad 1, activada por defecto; drafter `na0x2c6/Ornith-1.5-35B-A3B-DFlash-GGUF` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos de 35B parametros totales y aproximadamente 3B activos por token, distribuido como GGUF Q4_K_M. La model card del paquete no documenta la arquitectura interna (numero de capas, dimension oculta, numero de expertos, mecanismo de atencion) ni el proceso de entrenamiento del modelo original: no hay datos sobre volumen de tokens, composicion del dataset, RLHF, DPO ni innovaciones de atencion. Tampoco se detalla el entrenamiento del proyector multimodal, mas alla de que se usa `mmproj-Ornith-1.5-35B-A3B-f16.gguf` para la entrada de imagenes.

La innovacion tecnica del paquete es de inferencia, no de entrenamiento: kernels generados por el flujo `loom-skills` y compilados para gfx1151 y gfx1201, decodificacion especulativa DFlash con profundidad 1 (drafter separado en GGUF) y un servidor con API compatible con OpenAI. La model card incluye puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`) que comparan la salida codiciosa y los log-probs top-5 contra una referencia de llama.cpp sobre el mismo GGUF; en esta version del paquete esas puertas no se han vuelto a ejecutar (la ultima pasada fue sobre el build `f9fd606`) y en la R9700 aun no se han remedido.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes en formato OpenAI (`image_url`), con pipeline `image-text-to-text`.
- Tool calling y function calling con el esquema OpenAI (`tools` y `tool_calls`).
- Decodificacion especulativa DFlash (profundidad 1) activada por defecto para reducir latencia de decodificacion.
- Sampling configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Contexto largo de hasta 262.144 tokens por peticion.
- Hasta 4 peticiones concurrentes con agregacion de throughput.
- No soporta audio ni salida de audio (marcado como no aplicable).
- No implementa "reasoning effort" (marcado como no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes: con 262.144 tokens de contexto por peticion se pueden procesar informes extensos, contratos o expedientes junto con capturas y diagramas, y obtener un resumen o extraccion estructurada en una sola llamada.
- Asistente de codigo con acceso a herramientas: el soporte de `tools`/`tool_calls` permite conectar el modelo a un ejecutor de tests, un linter o una API de repositorio para ciclos de correccion multi-paso.
- Atencion al cliente multimodal: el cliente puede enviar capturas de pantalla de un error junto con texto; el modelo responde con contexto conversacional largo y hasta 4 conversaciones simultaneas por instancia.
- Procesamiento por lotes en un solo equipo AMD: el paquete esta pensado para Strix Halo y R9700, de modo que un equipo sin CUDA puede servir un MoE de 35B con API OpenAI y sustituir a un endpoint remoto en flujos internos.
- Extraccion de datos de formularios y facturas escaneadas: la entrada `image_url` combinada con contexto largo permite pasar varias imagenes y el esquema de salida en la misma peticion.
- Razonamiento asistido con traza: el modo thinking por defecto es util para tareas de analisis (diagnostico de errores, planificacion de cambios) donde interesa una traza intermedia; se puede desactivar para respuestas directas de baja latencia.
- Evaluacion comparativa de runtimes: sirve como banco de pruebas para medir Loom frente a llama.cpp ROCm sobre el mismo GGUF, con roofline de referencia (216 GB/s y 59 TFLOP/s en Strix Halo).

## Benchmarks y rendimiento

La model card incluye cifras de roofline (techo teorico) para Strix Halo, pero las columnas medidas de llama.cpp y Loom aparecen como "no medidas" (`—`) en la informacion disponible. No se deben interpretar los valores de roofline como rendimiento observado.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 127,4 |
| Decode tok/s, contexto 2k | no medido | no medido | 122,9 |
| Decode tok/s, contexto 32k | no medido | no medido | 74,8 |
| Prefill tok/s, documento 1k | no medido | no medido | 11.600,2 |
| Prefill tok/s, documento 2k | no medido | no medido | 11.416,3 |
| Prefill tok/s, documento 8k | no medido | no medido | 10.424,8 |
| Prefill tok/s, documento 16k | no medido | no medido | 9.343,0 |
| Prefill tok/s, documento 32k | no medido | no medido | 7.737,1 |
| 4 streams, decode agregado tok/s | no medido | no medido | 378,4 |
| Tokens draft aceptados (especulativa) | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han remedido todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Strix Halo (Ryzen AI Max+ 395, gfx1151): el comando de servicio reserva `--memory_bytes=49000000000` (49 GB), coherente con un Q4_K_M de 35B mas el proyector de vision y el drafter.
- Radeon AI PRO R9700 (gfx1201, 32 GB): el comando de servicio reserva `--memory_bytes=34000000000` (34 GB); el modelo cabe ajustado en los 32 GB de VRAM mas memoria del sistema.
- No hay datos de VRAM para otras GPUs; el paquete esta compilado especificamente para gfx1151 y gfx1201.
- Despliegue: runtime `hrx-loom` 0.1.0, servidor en `127.0.0.1:8080` con API OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este paquete (llama.cpp solo aparece como referencia de comparacion).
- Latencia y throughput medidos: no disponibles (columnas vacias en la tabla de rendimiento).
- Roofline de referencia en Strix Halo: 216 GB/s de ancho de banda y 59 TFLOP/s; techo de decode de 127,4 tok/s con prompt corto y 74,8 tok/s a 32k de contexto.

## Comparativa con modelos similares

No hay datos de benchmarks de calidad ni de modelos comparables en la informacion proporcionada. La unica comparacion disponible es de motor de inferencia sobre el mismo checkpoint:

| Aspecto | Loom (este paquete) | llama.cpp ROCm (referencia) |
|---|---|---|
| Checkpoint | Ornith-1.5-35B-A3B Q4_K_M | El mismo GGUF |
| Hardware | Strix Halo gfx1151 / R9700 gfx1201 | ROCm (build no registrado) |
| Decodificacion especulativa | DFlash profundidad 1 (por defecto) | Sin drafting en las filas de 1 stream |
| API | OpenAI `/v1/chat/completions` | Servidor de llama.cpp |
| Vision | Si, via `mmproj` f16 | Si, mismo proyector (prueba `vision`) |
| Metricas medidas | No publicadas en esta version | No publicadas en esta version |

Comparacion con otros modelos de tamano o tarea similar: no disponible.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; no se puede confirmar el uso comercial sin consultar el checkpoint original de `bartowski/Ornith-1.5-35B-A3B-GGUF`.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`) no se han vuelto a ejecutar en este paquete; la ultima pasada corresponde a un build anterior (`f9fd606`). La correccion frente a llama.cpp no esta verificada en esta version.
- En Radeon AI PRO R9700 no se ha remedido nada: rendimiento y correctitud estan sin validar en ese hardware.
- Las cifras de rendimiento de la tabla estan vacias; los valores de roofline son techos teoricos y no deben citarse como throughput real.
- El paquete esta compilado solo para gfx1151 y gfx1201; no es portable a otras GPUs sin regenerar kernels.
- La salida maxima esta limitada a 4.096 tokens por defecto, lo que puede truncar razonamientos largos aunque el contexto de entrada sea de 262.144 tokens.
- Solo 4 peticiones concurrentes; no es adecuado para servir a muchos usuarios simultaneos sin replicar instancias.
- No hay informacion sobre sesgos, idiomas soportados ni tasa de alucinacion del modelo base.
- El modo thinking esta activado por defecto, lo que incrementa tokens generados y latencia si no se desactiva explicitamente.
- El paquete tiene 0 descargas y 0 likes, y procede de un espacio de staging (`loom-fun-staging`); no debe tratarse como una distribucion estable.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa) y no aportan informacion sobre este modelo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Ornith-1.5-35B-A3B-loom
- Checkpoint base GGUF: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Drafter DFlash: https://huggingface.co/na0x2c6/Ornith-1.5-35B-A3B-DFlash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
