# loom-draft/mradermacher-Lunar-Trace-31B-i1-loom

## Resumen

Lunar-Trace-31B-i1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF `mradermacher/Lunar-Trace-31B-i1-GGUF`, concretamente la cuantizacion Q4_K_M. No se trata de un modelo entrenado por el autor del repositorio, sino de un artefacto de empaquetado que permite servir ese GGUF sobre GPUs AMD mediante el runtime Loom (`hrx-loom`), orientado a los aceleradores AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete fue generado con la herramienta `loom-next` sin intervencion de un LLM en el proceso.

El modelo subyacente, Lunar-Trace-31B-i1, es un modelo de 31.000 millones de parametros en su variante i1 (cuantizacion de tipo importance matrix de mradermacher), del que este repositorio no documenta arquitectura, datos de entrenamiento ni resultados de benchmarks. La model card del paquete se limita a describir el procedimiento de servicio, la API compatible con OpenAI y una bateria de puertas de correctitud (gates) que, en el momento de la publicacion, aparecen todas como "not yet re-measured" para ambas GPUs objetivo.

La relevancia actual del repositorio es acotada y muy especifica: demuestra la ruta de despliegue de un GGUF de 31B en hardware AMD consumer/prosumer a traves de Loom, con soporte de tool calling, modo thinking conmutables y una ventana de contexto efectiva de 53.248 tokens por peticion. El repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y fue creado el 19 de noviembre de 2026, por lo que debe considerarse un artefacto experimental sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 31B; arquitectura no documentada en la informacion proporcionada) |
| Parametros totales | 31B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 53.248 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete sirve exclusivamente esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Lunar-Trace-31B.i1-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (Loom, ecosistema ROCm/hrx-system) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Lunar-Trace-31B-i1: la model card del paquete Loom no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF, DPO u otro ajuste por preferencias. El sufijo `i1` corresponde a la convencion de cuantizacion de mradermacher (importancia de pesos), no a una variante arquitectonica.

La innovacion tecnica documentada pertenece al runtime, no al modelo: Loom compila y ejecuta kernels generados para GPUs AMD (gfx1151 y gfx1201) y expone el GGUF sin modificarlo, con opciones de gestion de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye ademas una bateria de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; todas ellas figuran como no re-medidas en la informacion disponible.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI: acepta el parametro `tools` y emite `tool_calls`.
- Modo razonamiento (thinking) desactivable: apagado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Bucles de tool calling multi-turno (la puerta `agent` valida el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas).
- Concurrencia de hasta 4 peticiones simultaneas con consistencia entre ejecuciones concurrentes y aisladas (puerta `consistency`).
- Contexto de 53.248 tokens por peticion, adecuado para documentos largos (la puerta `golden` cubre prompts de 1k a 32k).
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene segun la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tiene segun la model card.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de caracteristicas.

## Casos de uso

- Asistente conversacional autoalojado en hardware AMD: el paquete permite servir un modelo de 31B en una Radeon AI PRO R9700 de 32 GB o en un Ryzen AI Max+ 395, sin depender de CUDA ni de GPUs NVIDIA, usando `loom-serve` y la API OpenAI.
- Agente con herramientas en local: gracias al soporte de `tools`/`tool_calls` y a la puerta `agent` del banco de pruebas, encaja en flujos de agente que consultan APIs internas, bases de datos o sistemas de ficheros sin enviar datos a la nube.
- Procesamiento de documentos largos: con 53.248 tokens de contexto por peticion, permite resumir, extraer entidades o responder preguntas sobre contratos, informes o expedientes que no caben en modelos de contexto corto.
- Razonamiento con modo thinking para tareas de analisis: activando `enable_thinking` se obtiene una traza de razonamiento antes de la respuesta, util para depuracion de pipelines y para tareas de clasificacion o decision complejas.
- Despliegue en estaciones de trabajo con GPU AMD: integrable en entornos donde ya existe infraestructura ROCm y se quiere evitar la dependencia de llama.cpp, manteniendo una referencia de comparacion contra este ultimo.
- Evaluacion de runtimes alternativos: el paquete sirve como banco de pruebas para medir kernels generados frente a llama.cpp sobre el mismo GGUF, con puertas de correctitud token a token y comparacion de log-probs top-5.
- Prototipado de asistentes con concurrencia limitada: con 4 peticiones simultaneas y 4.096 tokens de salida maxima, es adecuado para demos internas y entornos de desarrollo, no para produccion de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de correctitud figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 31B; el paquete esta disenado para una GPU de 32 GB (Radeon AI PRO R9700) y para el Ryzen AI Max+ 395, que comparte memoria unificada. No se documenta el consumo exacto de VRAM ni el overhead del pool de memoria de Loom.
- GPUs soportadas explicitamente: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: no se documenta compatibilidad con GPUs de consumo distintas de las dos anteriores; no hay datos para RTX 4090, A100 o H100, que quedan fuera del alcance del runtime Loom descrito.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de servicio de este paquete, aunque llama.cpp se usa como referencia de correctitud.
- Opciones de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU), `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; la model card no incluye mediciones para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de 31B. Como referencia estructural, el unico punto de comparacion documentado es llama.cpp, utilizado como implementacion de referencia para las puertas de correctitud sobre el mismo GGUF, pero no se ofrecen cifras comparativas de velocidad o calidad.

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Lunar-Trace-31B-i1 (paquete Loom) | 31B | 53.248 tokens | Apache 2.0 | GGUF Q4_K_M + `.loom` | Experimental, 0 descargas |
| Lunar-Trace-31B-i1-GGUF (origen) | 31B | no disponible | Apache 2.0 | GGUF | Modelo base del paquete |
| Alternativas de 31B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto sin validacion publica: 0 descargas, 0 likes, repositorio de 0.0 GB y creado el 19 de noviembre de 2026; no hay evidencia de uso en produccion.
- Puertas de correctitud sin medir: todas las gates (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de fidelidad frente a llama.cpp.
- Cobertura multimodal incompleta: aunque el modelo upstream soporta imagen y audio, Loom no los soporta; el paquete es solo texto.
- Restricciones de plataforma: el paquete esta atado a GPUs AMD gfx1151 y gfx1201 y al runtime `hrx-loom==0.2.0`; no es portable a CUDA ni a otros backends sin regeneracion.
- Contexto efectivo limitado a 53.248 tokens por peticion y salida maxima de 4.096 tokens, con solo 4 peticiones concurrentes; insuficiente para cargas de alta concurrencia.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue ni en castellano sin evaluacion previa.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible; deben asumirse los del modelo base, que tampoco se detalla.
- Licencia Apache 2.0 declarada en el paquete, pero la procedencia y los terminos del modelo base deben verificarse en el repositorio de origen antes de un uso comercial.
- Los resultados de busqueda web proporcionados corresponden a productos no relacionados (Loom Inc. y la marca de ropa Loom) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/mradermacher-Lunar-Trace-31B-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Lunar-Trace-31B-i1-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
