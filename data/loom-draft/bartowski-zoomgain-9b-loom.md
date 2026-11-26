# loom-draft/bartowski-ZoomGain-9B-loom

## Resumen

ZoomGain-9B-loom es un paquete de despliegue en formato Loom publicado por el usuario loom-draft, que empaqueta el checkpoint GGUF sin modificar `ZoomGain-9B-Q4_K_M.gguf` de bartowski para su ejecución en GPUs AMD mediante el runtime `loom-serve` (paquete `hrx-loom`, versión 0.2.0). No se trata de un modelo nuevo ni de un fine-tune: el repositorio contiene programas `.loom` y una tarjeta `model.json` generados automáticamente con la herramienta `loom-next`, sin intervención de un LLM en el proceso. El modelo subyacente es ZoomGain-9B, de aproximadamente 9.000 millones de parámetros y modalidad image-text-to-text (visión y lenguaje), según los tags del repositorio.

La relevancia de esta ficha es operativa más que algorítmica: documenta cómo ejecutar un modelo multimodal de 9B en hardware AMD de consumo y profesional (Ryzen AI Max+ 395 "Strix Halo", gfx1151, y Radeon AI PRO R9700, gfx1201 con 32 GB) mediante el stack ROCm de Loom, con cifras de rendimiento comparadas frente a llama.cpp ROCm. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y modo de razonamiento opcional.

La información disponible sobre el modelo base (arquitectura, datos de entrenamiento, benchmarks de calidad) es muy limitada: la model card del paquete Loom solo describe el empaquetado y el rendimiento de inferencia, no las características del checkpoint original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos no están alojados en este repositorio sino que se resuelven al hacer `loom-fetch`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ZoomGain-9B; transformer multimodal image-text-to-text segun tags, sin detalle de capas ni atencion) |
| Parametros totales | aproximadamente 9.000 millones (por el nombre del modelo; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuracion de llama.cpp usada como referencia (`-c 65536`); el limite nativo del modelo base no se detalla |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom sirve esa unica cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`ZoomGain-9B-Q4_K_M.gguf`) empaquetado como programa `.loom` con tarjeta `model.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ZoomGain-9B: la model card del paquete Loom no describe capas, tipo de atencion, mecanismo de vision (proyector, resolución de imagen) ni composicion del dataset de entrenamiento. Los tags indican modalidad `image-text-to-text` y `vision`, por lo que se trata de un modelo multimodal que acepta imagenes y texto como entrada, pero se desconoce el encoder visual, el numero de tokens de entrenamiento y si hubo fases de RLHF o DPO.

Lo que si esta documentado es la capa de despliegue: `loom-next` genera programas `.loom` y una tarjeta `model.json` a partir del GGUF sin modificarlo. El runtime `loom-serve` (hrx-loom 0.2.0) ejecuta el modelo sobre ROCm con opciones de reserva de memoria fija (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). No se menciona decodificacion especulativa: la propia model card indica que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que las filas de speculative decoding quedan como no aplicables.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada multimodal image-text-to-text: procesamiento de imagenes junto con texto (segun tags del repositorio; el detalle de resolucion y formato de imagen no esta disponible).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Servicio concurrente: el rendimiento medido incluye 4 streams en paralelo con decodificacion agregada de 144,2 tok/s en Strix Halo.
- Contexto de trabajo de hasta 65.536 tokens en la configuracion de referencia (equivalente a la usada en llama.cpp).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local con imagenes: desplegado con `loom-serve` en un Ryzen AI Max+ 395, el modelo puede mantener conversaciones multi-turno aceptando capturas o fotos como entrada, con la ventaja de que todo el procesamiento ocurre en el equipo sin enviar datos a la nube.
- Automatizacion de soporte tecnico con capturas de pantalla: el modo image-text-to-text permite al modelo interpretar una captura de error enviada por el usuario y responder con pasos de resolucion, usando el contexto de 65k tokens para arrastrar el historial completo de la incidencia.
- Agente con tool calling en estacion de trabajo AMD: la API compatible con OpenAI y el soporte de `tools`/`tool_calls` permiten integrar el modelo en frameworks de agentes (LangChain, LlamaIndex) que ejecuten herramientas locales como consultas a bases de datos o llamadas a APIs internas.
- Procesamiento por lotes de documentos largos en GPU profesional: con la Radeon AI PRO R9700 (32 GB) y un prefill de aproximadamente 1.467 tok/s a 32k tokens en Strix Halo, es viable ingerir informes extensos y generar resumenes o extracciones estructuradas en pipelines internos.
- Razonamiento asistido con modo thinking: para tareas de analisis que requieren pasos intermedios (depuracion de configuraciones, analisis de logs), se puede activar el modo de razonamiento por defecto y desactivarlo en consultas simples para reducir latencia.
- Servicio multi-cliente en un solo nodo: los 4 streams concurrentes con 144,2 tok/s agregados en Strix Halo permiten atender a un pequeno equipo de desarrollo con un unico equipo, sin infraestructura de GPU dedicada.
- Evaluacion comparativa de runtimes AMD: el paquete sirve como banco de pruebas reproducible para medir Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, util para equipos que evaluan stacks de inferencia sobre ROCm.

## Benchmarks y rendimiento

Los unicos datos publicados son de rendimiento de inferencia (no de calidad del modelo) en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), medidos el 2026-11-26 con hrx-loom 0.2.0 frente a llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismos prompts, mediana de 3 sesiones:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 36,0 | 40,0 | +11 % |
| Decode tok/s, contexto 2k | 35,5 | 39,2 | +10 % |
| Decode tok/s, contexto 32k | 30,4 | 32,5 | +7 % |
| Prefill tok/s, documento 1k | 1052,6 | 1651,5 | +57 % |
| Prefill tok/s, documento 2k | 1093,8 | 1664,1 | +52 % |
| Prefill tok/s, documento 8k | 1099,3 | 1676,1 | +52 % |
| Prefill tok/s, documento 16k | 1037,9 | 1602,3 | +54 % |
| Prefill tok/s, documento 32k | 919,6 | 1467,0 | +60 % |
| 4 streams, decode agregado tok/s | 110,2 | 144,2 | +31 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

En la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han vuelto a medir segun la model card. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M para un modelo de aproximadamente 9B, el peso de los pesos ronda los 5-6 GB; el paquete fija el pool de memoria por adelantado (`--pool_backing=fixed`), por lo que la reserva real depende de la configuracion del preset. Cifra exacta de VRAM no disponible.
- GPU validadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Solo se han publicado mediciones para Strix Halo.
- GPU de consumo: no hay datos de ejecucion en GPUs de consumo AMD o NVIDIA; el stack documentado es ROCm sobre las dos GPUs citadas. Compatibilidad con otras GPU no disponible.
- Despliegue: runtime propio `loom-serve` del paquete `hrx-loom[hf]==0.2.0` (instalacion via pipx), con `loom-fetch` para descargar el paquete desde Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp solo aparece como referencia comparativa).
- Latencia y throughput: 40 tok/s de decode en prompt corto y 1.651,5 tok/s de prefill a 1k tokens en Strix Halo; 32,5 tok/s de decode con 32k de contexto; 144,2 tok/s agregados con 4 streams. En R9700, no medido.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (multimodales de 9B empaquetados para ROCm) en la informacion proporcionada. La unica comparacion documentada es de motor de inferencia, no de modelo:

| Aspecto | ZoomGain-9B-loom (Loom) | ZoomGain-9B en llama.cpp ROCm |
|---|---|---|
| Formato | Paquete `.loom` + `model.json` | GGUF directo |
| Decode, prompt corto | 40,0 tok/s | 36,0 tok/s |
| Prefill, 1k | 1651,5 tok/s | 1052,6 tok/s |
| 4 streams agregados | 144,2 tok/s | 110,2 tok/s |
| API | OpenAI-style `/v1/chat/completions` con tools | servidor llama.cpp |
| Licencia | MIT | MIT (modelo base) |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y un tamano de 0,0 GB: los pesos no parecen alojados aqui y se resuelven al ejecutar `loom-fetch`; verificar la disponibilidad del GGUF de origen antes de desplegar.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base ZoomGain-9B; no se puede garantizar un comportamiento alineado en produccion.
- Riesgo de alucinacion inherente a un modelo de 9B cuantizado a Q4_K_M; la cuantizacion puede degradar ligeramente la calidad respecto al checkpoint original en FP16/BF16.
- El limite nativo de contexto del modelo base no esta documentado; los 65.536 tokens corresponden a la configuracion de llama.cpp usada como referencia, no necesariamente al maximo entrenado.
- Idiomas soportados no disponibles: no se puede confirmar un rendimiento aceptable en castellano sin evaluacion propia.
- El soporte de hardware esta limitado a las GPUs AMD documentadas (gfx1151 y gfx1201); no hay datos de otras GPU ni de aceleracion en CPU.
- La licencia MIT aplica al paquete Loom; la licencia del modelo base ZoomGain-9B debe verificarse en su repositorio de origen antes de uso comercial.
- Los resultados de rendimiento en Radeon AI PRO R9700 no se han vuelto a medir; no extrapolar las cifras de Strix Halo.
- El modo de razonamiento esta activado por defecto, lo que incrementa latencia y consumo de tokens si no se desactiva explicitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-ZoomGain-9B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/ZoomGain-9B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45877001009
