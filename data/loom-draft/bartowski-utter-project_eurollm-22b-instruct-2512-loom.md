# loom-draft/bartowski-utter-project_EuroLLM-22B-Instruct-2512-loom

## Resumen

El modelo identificado como `loom-draft/bartowski-utter-project_EuroLLM-22B-Instruct-2512-loom` no es un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `bartowski/utter-project_EuroLLM-22B-Instruct-2512-GGUF`, en su cuantizacion Q4_K_M. El autor del paquete es `loom-draft` y el modelo subyacente es EuroLLM-22B-Instruct-2512, un modelo de instrucciones de 22 mil millones de parametros desarrollado por el proyecto utter-project, orientado a lenguas europeas.

El paquete esta pensado para ejecutar el GGUF sin modificaciones sobre GPUs AMD: el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion se realizo con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle, y el resultado se sirve mediante `loom-serve` con una API compatible con OpenAI en `/v1/chat/completions`.

Su relevancia es practica: ofrece una via de despliegue optimizada para hardware AMD consumer y de estacion de trabajo, con mediciones comparativas frente a llama.cpp ROCm sobre el mismo GGUF, el mismo runner y los mismos prompts. No aporta pesos nuevos ni cambios de arquitectura; el valor esta en el empaquetado y en el rendimiento de inferencia medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint base EuroLLM-22B-Instruct-2512; el paquete no la documenta) |
| Parametros totales | 22B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32768 tokens (contexto nativo mencionado en la metodologia de rendimiento) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base esta orientado a lenguas europeas, sin listado concreto) |
| Licencia | MIT |
| Formato de pesos | GGUF (`utter-project_EuroLLM-22B-Instruct-2512-Q4_K_M.gguf`), empaquetado como paquete Loom (`.loom` + `model.json`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del checkpoint base ni su proceso de entrenamiento: no se detallan tipo de transformer, numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. El paquete Loom no modifica los pesos; sirve el GGUF original de bartowski, por lo que cualquier detalle arquitectonico debe consultarse en la model card de `utter-project/EuroLLM-22B-Instruct-2512` o de `bartowski/utter-project_EuroLLM-22B-Instruct-2512-GGUF`.

La innovacion tecnica del paquete es de despliegue, no de modelado: incluye presets de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo en la GPU. Segun la model card, no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no esta disponible en ninguna de las dos engines comparadas.

## Capacidades

- Generacion de texto conversacional en formato chat, servida mediante una API compatible con OpenAI.
- Instrucciones: el checkpoint base es un modelo `-Instruct`, orientado a seguir instrucciones en lenguaje natural.
- Capacidades multilingues: no detalladas en la informacion disponible; el modelo base EuroLLM esta enfocado a lenguas europeas, pero no se ofrece listado de idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible; el paquete solo expone inferencia de texto.
- Servicio multistream: soporta peticiones paralelas (medido con 4 streams agregados).

## Casos de uso

- Despliegue local en estaciones AMD: servir el modelo con `loom-fetch` y `loom-serve` sobre una Radeon AI PRO R9700 de 32 GB permite tener un asistente de 22B en Q4_K_M en hardware de estacion de trabajo, sin depender de CUDA.
- Prototipado de aplicaciones con API OpenAI: al exponer `/v1/chat/completions`, se puede apuntar un cliente compatible con OpenAI al endpoint local y sustituir un proveedor cloud por inferencia propia durante el desarrollo.
- Procesamiento de documentos de hasta 32k tokens: la ventana nativa de 32768 tokens y el prefill medido (hasta 541,8 tok/s en documentos de 8k en Strix Halo) permiten resumir o extraer informacion de contratos, informes o articulos largos en una sola pasada.
- Atencion al cliente en lengua europea: el modelo base EuroLLM esta orientado a lenguas europeas, lo que lo hace candidato para asistentes conversacionales multi-turno en esos idiomas, siempre que se valide la calidad por idioma.
- Servicio multiusuario ligero: con 4 streams agregados a 62,9 tok/s en Strix Halo, es viable para un equipo pequeno que consulte el modelo de forma concurrente en una unica maquina.
- Evaluacion comparativa de runtimes AMD: el paquete incluye mediciones frente a llama.cpp ROCm con el mismo GGUF, lo que lo convierte en una referencia util para equipos que evaluen Loom frente a llama.cpp en gfx1151 o gfx1201.
- Generacion de codigo o matematicas: no hay evidencia en la informacion disponible de rendimiento especifico en estas tareas; no se recomienda como caso de uso principal sin evaluacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Si se incluyen mediciones de rendimiento de inferencia del paquete frente a llama.cpp ROCm `llamacpp-rocm/b1374`, con el mismo GGUF, runner y prompts, mediana de 3 sesiones, medidas el 2026-11-26.

### Strix Halo (gfx1151)

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 16,1 | 16,6 | +3 % |
| Decode tok/s, contexto 2k | 14,4 | 15,4 | +7 % |
| Decode tok/s, contexto 32k | n/a | n/a | n/a |
| Prefill tok/s, documento 1k | 450,4 | 594,1 | +32 % |
| Prefill tok/s, documento 2k | 441,1 | 609,2 | +38 % |
| Prefill tok/s, documento 8k | 388,1 | 541,8 | +40 % |
| Prefill tok/s, documento 16k | 326,8 | 442,5 | +35 % |
| Prefill tok/s, documento 32k | n/a | n/a | n/a |
| 4 streams, decode agregado tok/s | 51,9 | 62,9 | +21 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Notas: las filas de 32k se marcan como no aplicables porque el documento supera el contexto nativo de 32768 tokens. No hay datos de roofline. La comparacion usa `-ngl 99 -cram 0 -c 65536 -np 1` en llama.cpp ROCm y el preset por defecto del paquete en Loom, sin barrido de ajustes en ninguna de las dos engines.

### Radeon AI PRO R9700 (gfx1201, 32 GB)

La model card se corta en el inicio de esta seccion; no se dispone de las cifras para esta GPU en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es de 22B en Q4_K_M y se ejecuta en una GPU de 32 GB (R9700) y en el SoC Strix Halo con memoria unificada.
- GPUs soportadas por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA (A100, H100, RTX 4090): no contempladas en este paquete, que es especifico para AMD.
- Cabe en GPU consumer: si, en el SoC Strix Halo con memoria unificada; en GPUs discretas de consumo no hay datos de compatibilidad en la informacion disponible.
- Opciones de despliegue: `loom-serve` (runtime propio del ecosistema Loom, version `hrx-loom[hf]==0.2.0`). El GGUF original tambien puede servirse con llama.cpp, como demuestra la comparativa.
- Latencia y throughput: en Strix Halo, 16,6 tok/s de decode en prompt corto y 15,4 tok/s con contexto de 2k; prefill de 442,5 a 609,2 tok/s segun longitud; 62,9 tok/s agregados con 4 streams.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La unica comparacion disponible es de runtime, no de modelo: Loom frente a llama.cpp ROCm sobre el mismo checkpoint.

| Aspecto | Este paquete (Loom) | llama.cpp ROCm (mismo GGUF) |
|---|---|---|
| Modelo servido | EuroLLM-22B-Instruct-2512 Q4_K_M | EuroLLM-22B-Instruct-2512 Q4_K_M |
| Hardware medido | Strix Halo (gfx1151) | Strix Halo (gfx1151) |
| Decode, prompt corto | 16,6 tok/s | 16,1 tok/s |
| Prefill, documento 8k | 541,8 tok/s | 388,1 tok/s |
| 4 streams agregados | 62,9 tok/s | 51,9 tok/s |
| Decodificacion especulativa | no disponible | no disponible |
| Licencia | MIT | MIT (del checkpoint) |

## Limitaciones y advertencias

- No es un modelo nuevo: es un empaquetado de despliegue. Cualquier limitacion de calidad, sesgo o alucinacion del checkpoint EuroLLM-22B-Instruct-2512 se hereda sin cambios.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La lista de idiomas soportados no esta documentada; aunque el modelo base se orienta a lenguas europeas, no se puede afirmar cobertura concreta por idioma.
- El contexto nativo es de 32768 tokens; no se han medido ni documentado comportamientos mas alla de esa ventana.
- El paquete esta limitado a hardware AMD gfx1151 y gfx1201; no hay soporte documentado para NVIDIA ni para otras GPUs AMD.
- La seccion de rendimiento en Radeon AI PRO R9700 aparece incompleta en la model card, por lo que no hay cifras verificables para esa GPU.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La licencia MIT del paquete no exime de verificar la licencia del checkpoint base y de los datos de entrenamiento antes de un uso comercial.
- El uso de `completion_spin_ns=4294967295` implica espera activa y consumo de CPU mientras la GPU trabaja; en servidores compartidos conviene evaluar el impacto.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-utter-project_EuroLLM-22B-Instruct-2512-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/utter-project_EuroLLM-22B-Instruct-2512-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Ejecucion de referencia (DevLab Dispatch run 45876994840): https://github.com/loom-fun/loom-next/actions/runs/45876994840
- Modelo base EuroLLM-22B-Instruct-2512: no disponible en la informacion proporcionada (se referencia a traves del checkpoint de bartowski)
