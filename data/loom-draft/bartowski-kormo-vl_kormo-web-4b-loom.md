# loom-draft/bartowski-KORMo-VL_KORMo-Web-4B-loom

## Resumen

KORMo-VL_KORMo-Web-4B en formato Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) generado con la herramienta loom-next a partir del checkpoint GGUF sin modificar `bartowski/KORMo-VL_KORMo-Web-4B-GGUF`, en su cuantizacion Q4_K_M. No es un modelo entrenado por el autor del repositorio, sino un artefacto de empaquetado orientado a la ejecucion del modelo en GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es multimodal de tipo image-text-to-text, con unos 4.000 millones de parametros segun indica su nombre.

El interes del paquete reside en que ofrece un runtime alternativo (Loom, sobre hrx-loom 0.2.0) con medidas de rendimiento publicadas frente a llama.cpp ROCm en Strix Halo: 68,0 tok/s de decodificacion en contexto corto, 49,1 tok/s a 32k de contexto y 2.349 tok/s de prefill a 32k, con 221 tok/s agregados en 4 flujos paralelos. Para desarrolladores que trabajen con hardware AMD de gama consumer/prosumer, estos datos permiten estimar el coste de servir un modelo de vision-lenguaje de 4B en local sin depender de CUDA.

La ficha se basa exclusivamente en la informacion disponible en el repositorio y en su model card. El repositorio figura con 0 descargas y 0 me gusta en el momento de la consulta, y el tamano reportado es de 0.0 GB, por lo que no hay datos de benchmarks de calidad del modelo ni validacion independiente del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no documentada en la informacion proporcionada) |
| Parametros totales | ~4B (inferido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; las medidas de rendimiento cubren hasta 32k tokens de contexto |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`KORMo-VL_KORMo-Web-4B-Q4_K_M.gguf`) empaquetado en formato Loom (`.loom` + `model.json`) |
| Pipeline | image-text-to-text |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| Modelo base | bartowski/KORMo-VL_KORMo-Web-4B-GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo subyacente (tipo de transformer, mecanismo de atencion, encoder visual ni composicion del dataset de entrenamiento). Lo unico confirmado es que se trata de un modelo multimodal de tipo image-text-to-text, distribuido originalmente en GGUF por bartowski y empaquetado aqui sin modificacion de pesos. El paquete Loom no reentrena ni altera el checkpoint: solo aporta los programas de despliegue y la tarjeta de configuracion para el runtime.

El aspecto tecnico diferencial del paquete es el motor de ejecucion Loom sobre ROCm. La model card documenta el uso de espera activa para las finalizaciones de GPU (`completion_spin_ns=4294967295`), un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). No hay decodificacion especulativa: la propia model card indica que no existe cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que las filas de "speculative decoding" figuran como no aplicables.

## Capacidades

- Generacion de texto y conversacion multimodal image-text-to-text (el pipeline declarado es `image-text-to-text`).
- API compatible con OpenAI: endpoint `/v1/chat/completions`.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), segun la tabla de caracteristicas de la model card.
- Modo de razonamiento / thinking configurable mediante `chat_template_kwargs` (`enable_thinking`), desactivado por defecto en el ejemplo de peticion de la model card.
- Servicio multi-flujo: la medicion de 4 flujos paralelos con 221 tok/s agregados confirma soporte de peticiones concurrentes.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual local en estaciones de trabajo AMD: el modelo acepta imagen y texto y puede servirse con `loom-serve` en una Radeon AI PRO R9700 de 32 GB, lo que permite desplegar un asistente que describe capturas, diagramas o documentos escaneados sin salir del equipo.
- Procesamiento por lotes de documentos con imagen: con un prefill de 2.349 tok/s a 32k de contexto en Strix Halo, es viable procesar lotes de documentos largos (informes con figuras, facturas escaneadas) en una sola pasada por documento.
- Chat de atencion al cliente con contexto largo: los 49,1 tok/s de decodificacion a 32k de contexto permiten mantener conversaciones multi-turno con historial extenso en hardware de una sola APU, sin GPU dedicada.
- Automatizacion con tool calling: la compatibilidad con `tools` y `tool_calls` en estilo OpenAI permite integrar el modelo en pipelines que consulten APIs externas, bases de datos o sistemas de ticketing, actuando como capa de interpretacion de lenguaje natural.
- Prototipado de agentes multimodales en ROCm: al exponer una API compatible con OpenAI, el paquete se puede enchufar a frameworks de agentes existentes y servir 4 flujos concurrentes (221 tok/s agregados) para equipos pequenos de desarrollo.
- Extraccion de informacion de imagenes en entornos con requisitos de privacidad: al ejecutarse integramente en local sobre Strix Halo, encaja en flujos donde no se permite enviar imagenes a servicios en la nube.
- Evaluacion comparativa de runtimes en AMD: el paquete incluye metodologia y resultados frente a llama.cpp ROCm, lo que lo convierte en un banco de pruebas reproducible para medir motores de inferencia en gfx1151.

## Benchmarks y rendimiento

Las unicas cifras publicadas son de rendimiento de inferencia (no de calidad). Corresponden a Strix Halo (gfx1151), medidas el 2026-11-26 con hrx-loom 0.2.0, comparadas contra llama.cpp ROCm `llamacpp-rocm/b1374` con el mismo GGUF y los mismos prompts. Los valores de llama.cpp no aparecen en la tabla extraida (figuran como no medidos), por lo que el margen frente a llama.cpp no se puede reproducir aqui.

| Metrica (Strix Halo, gfx1151) | Loom | llama.cpp |
|---|---|---|
| Decodificacion tok/s, prompt corto | 68,0 | no medido |
| Decodificacion tok/s, contexto 2k | 65,5 | no medido |
| Decodificacion tok/s, contexto 32k | 49,1 | no medido |
| Prefill tok/s, documento 1k | 2.952,0 | no medido |
| Prefill tok/s, documento 2k | 2.967,4 | no medido |
| Prefill tok/s, documento 8k | 2.947,6 | no medido |
| Prefill tok/s, documento 16k | 2.703,1 | no medido |
| Prefill tok/s, documento 32k | 2.349,3 | no medido |
| 4 flujos, decodificacion agregada tok/s | 221,0 | no medido |
| Decodificacion especulativa, tokens aceptados | n/a | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica explicitamente que los resultados "aun no se han vuelto a medir". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de ~4B, y el paquete esta disenado para una GPU de 32 GB (R9700) y para la APU Strix Halo con memoria unificada; el pool de memoria se reserva de forma fija con `--pool_backing=fixed`.
- GPUs validadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se menciona soporte para GPUs NVIDIA ni para otras Radeon.
- GPU consumer: no hay confirmacion de funcionamiento en GPUs de consumo distintas de las citadas; el paquete esta etiquetado para `strix-halo` y `radeon-r9700`.
- Despliegue: exclusivamente mediante el stack Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`). No se documenta uso con vLLM, llama.cpp, Ollama o TGI para este paquete, aunque el GGUF base es compatible con llama.cpp segun la comparativa de la propia model card.
- Throughput medido en Strix Halo: 68,0 tok/s de decodificacion en contexto corto, 49,1 tok/s a 32k; prefill entre 2.349 y 2.967 tok/s; 221 tok/s agregados con 4 flujos concurrentes.
- Latencia: no disponible como metrica independiente; puede derivarse del throughput anterior.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni resultados de calidad de alternativas). La unica comparacion documentada es de motor de inferencia, no de modelo:

| Comparacion | Loom (este paquete) | llama.cpp ROCm b1374 |
|---|---|---|
| Modelo servido | KORMo-VL_KORMo-Web-4B Q4_K_M | KORMo-VL_KORMo-Web-4B Q4_K_M |
| Hardware | Strix Halo (gfx1151) | Strix Halo (gfx1151) |
| Decodificacion, contexto corto | 68,0 tok/s | no medido en la informacion extraida |
| Prefill 32k | 2.349,3 tok/s | no medido en la informacion extraida |
| Decodificacion especulativa | n/a (sin drafter) | n/a (sin drafter) |

## Limitaciones y advertencias

- El repositorio no contiene pesos nuevos ni un modelo entrenado: es un empaquetado de despliegue de un GGUF de terceros. Cualquier limitacion del modelo base (sesgos, alucinacion, calidad) se hereda sin cambios.
- No hay benchmarks de calidad publicados en la informacion disponible; no es posible evaluar su rendimiento en tareas de razonamiento, codigo o matematicas a partir de los datos aportados.
- Cobertura de idiomas no documentada; no se puede asumir un buen rendimiento en castellano sin evaluacion previa.
- El soporte esta restringido a dos dispositivos AMD concretos (gfx1151 y gfx1201); no se documenta funcionamiento en otras GPUs ni en CPU.
- Los resultados de rendimiento en Radeon AI PRO R9700 no se han vuelto a medir; solo hay cifras validas para Strix Halo.
- La comparativa de rendimiento se realizo sin ajuste fino de ninguno de los dos motores y con los valores de llama.cpp no presentes en la tabla extraida; los margenes no son verificables con la informacion disponible.
- El repositorio presenta 0 descargas y 0 me gusta, y un tamano reportado de 0.0 GB, lo que sugiere que el paquete podria no estar completamente materializado o carecer de validacion por terceros.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero dicha licencia corresponde al empaquetado; deben verificarse las condiciones del modelo base y de los datos con los que fue entrenado antes de un despliegue en produccion.
- El uso de espera activa (`completion_spin_ns`) consume CPU mientras hay trabajo en la GPU; conviene revisarlo en entornos con CPU limitada.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/bartowski-KORMo-VL_KORMo-Web-4B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/KORMo-VL_KORMo-Web-4B-GGUF
- Runtime Loom (hrx-system, ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch run 45875482316): https://github.com/loom-fun/loom-next/actions/runs/45875482316
