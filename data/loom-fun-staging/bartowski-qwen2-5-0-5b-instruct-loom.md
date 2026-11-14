# loom-fun-staging/bartowski-Qwen2.5-0.5B-Instruct-loom

## Resumen

`loom-fun-staging/bartowski-Qwen2.5-0.5B-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo nuevo entrenado desde cero. Empaqueta el checkpoint GGUF `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf` de bartowski (una cuantizacion Q4_K_M del modelo Qwen2.5-0.5B-Instruct de Alibaba) junto con programas `.loom` y una tarjeta `model.json` que permiten servirlo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico esta en el runtime, no en el modelo: Loom genera kernels especificos para estas arquitecturas AMD y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling, 32.768 tokens de contexto por peticion, 4 peticiones concurrentes y un limite de 4.096 tokens de salida. El modelo subyacente es un transformer denso de 0,5 mil millones de parametros, muy pequeno, pensado para tareas de instruccion ligeras y como banco de pruebas de inferencia en hardware AMD.

La relevancia ahora es doble: por un lado, demuestra una via de despliegue alternativa a llama.cpp ROCm en GPUs AMD de consumo y profesional; por otro, sirve como artefacto de validacion (gates de correctitud, comparacion token a token contra llama.cpp, pruebas de concurrencia y de bucle agente) para un ecosistema de inferencia AMD en fase temprana. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las pruebas de rendimiento publicadas solo cubren Strix Halo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5); empaquetado para runtime AMD Loom |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, sin detallar en la informacion) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Qwen2.5-0.5B-Instruct-Q4_K_M.gguf) + programas `.loom` y `model.json` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones concurrentes |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Muestreo | `temperature`, `top_p`, `top_k`, `seed` |
| Tool calling | si (OpenAI-style `tools` y `tool_calls`) |
| Memoria reservada en ejemplo | `--memory_bytes=5000000000` (5 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer denso de 0,5 mil millones de parametros de la familia Qwen2.5 de Alibaba, ajustado para instrucciones. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen en este paquete. El checkpoint se distribuye sin modificar: el paquete no reentrena ni altera los pesos, solo los cuantiza a Q4_K_M (via bartowski) y los acompaña de artefactos de despliegue.

La innovacion tecnica esta en Loom: un runtime que genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y los ejecuta con espera activa (`completion_spin_ns=4294967295`), exponiendo una API compatible con OpenAI. El paquete incluye gates de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) que comparan la salida con la referencia de llama.cpp token a token; en esta version los gates no se han vuelto a ejecutar (el ultimo pase fue sobre el build `sha256 50ea095`). No hay decodificacion especulativa: el GGUF no incluye cabeza MTP ni hay drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto y respuestas a instrucciones en el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling / function calling con formato OpenAI (`tools`, `tool_calls`), validado por el gate `agent`.
- Bucles de agente multi-turno con reutilizacion de historial (gate `agent`).
- Contexto de 32.768 tokens por peticion, adecuado para documentos medios.
- Concurrencia de 4 peticiones simultaneas con consistencia verificada (gate `consistency`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Sin modo de razonamiento/thinking (no aplicable), sin decodificacion especulativa, sin entrada de imagen ni audio.
- Capacidades multilingues: no disponibles en la informacion (heredadas del modelo base, sin detalle).

## Casos de uso

- Despliegue de referencia en hardware AMD: usar el paquete para validar que un GGUF Q4_K_M funciona sobre Strix Halo o R9700 con Loom antes de migrar modelos mayores; el flujo `loom-fetch` + `loom-serve` es reproducible y el ejemplo reserva 5 GB de memoria.
- Prototipado de asistentes conversacionales ligeros: con 32.768 tokens de contexto y API OpenAI, se puede montar un chatbot multi-turno en local sin depender de la nube, aunque la calidad del modelo de 0,5B limita tareas complejas.
- Automatizacion con tool calling: integrar el endpoint `/v1/chat/completions` en un orquestador que envie `tools` y consuma `tool_calls` para tareas como consultar APIs internas o rellenar formularios, aprovechando el gate `agent` como garantia de formato.
- Pruebas de regresion de infraestructura: usar los gates `golden`, `compare` y `consistency` para comparar la salida de Loom contra llama.cpp ROCm y detectar divergencias tras actualizar kernels o drivers.
- Benchmarking de GPUs AMD: medir decode y prefill en Strix Halo (roofline de 551,2 tok/s en decode corto y 77.768,6 tok/s en prefill de 1k) para caracterizar el hardware antes de desplegar modelos mayores.
- Servicio de bajo coste para tareas simples: clasificacion, extraccion de entidades o resumenes cortos en un APU, con 4 peticiones concurrentes y salida limitada a 4.096 tokens.
- Evaluacion de tool calling en agentes: construir un bucle multi-paso con historial reutilizado y verificar que las llamadas son validas y deterministas con `seed` fijo.

## Benchmarks y rendimiento

Los unicos datos publicados son los de roofline (techo teorico del hardware) para Strix Halo; las columnas de llama.cpp y Loom no se midieron ("—"). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 551,2 |
| Decode tok/s, contexto 2k | — | — | 518,7 |
| Decode tok/s, contexto 32k | — | — | 275,1 |
| Prefill tok/s, documento 1k | — | — | 77.768,6 |
| Prefill tok/s, documento 2k | — | — | 73.596,4 |
| Prefill tok/s, documento 8k | — | — | 55.675,2 |
| Prefill tok/s, documento 16k | — | — | 42.029,3 |
| Prefill tok/s, documento 32k | — | — | 28.203,9 |
| 4 streams, decode agregado tok/s | — | — | 2.050,5 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir". La metodologia indica que los runners de AMD DevLab difieren entre sesiones y que el ruido de mismo runner es de +-3 %.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de servicio reserva `--memory_bytes=5000000000` (5 GB), muy por encima de lo que necesita un Q4_K_M de 0,5B; el modelo en si ocupa unos cientos de MB.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Consumer GPU: no se documenta soporte para GPUs de consumo NVIDIA ni para otras AMD fuera de las dos citadas; no disponible para RTX 4090, etc.
- Despliegue: runtime Loom (`pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch`, `loom-serve`); no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de este paquete, aunque llama.cpp ROCm se usa como referencia de comparacion.
- Latencia y throughput: solo techos roofline en Strix Halo (ver tabla); no hay valores medidos de Loom ni de llama.cpp en esta version.
- Memoria de Strix Halo: 216 GB/s de ancho de banda y 59 TFLOP/s segun la definicion de roofline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen2.5-0.5B-Instruct Q4_K_M + Loom) | 0,5B | 32.768 | GGUF + `.loom` | no disponible | Runtime AMD Loom; tool calling; 4 concurrentes |
| bartowski/Qwen2.5-0.5B-Instruct-GGUF | 0,5B | el del modelo base | GGUF | la del modelo base (no detallada aqui) | Checkpoint origen, sin empaquetado Loom |
| Qwen2.5-0.5B-Instruct (original) | 0,5B | el del modelo base | safetensors | la del modelo base (no detallada aqui) | Modelo de Alibaba; referencia de calidad |
| llama.cpp ROCm (runtime) | n/a | n/a | GGUF | n/a | Referencia de comparacion usada por Loom; argumentos del servidor no registrados |

No se dispone de datos de rendimiento medidos para establecer una comparacion cuantitativa entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: capacidad de razonamiento, codigo y matematicas muy limitada; no apto para tareas complejas ni para produccion de alta calidad.
- Sin datos de benchmarks de calidad publicados; no se puede afirmar su rendimiento en MMLU, HumanEval o GSM8K.
- Riesgo de alucinacion elevado por el tamano reducido del modelo; requiere validacion en cualquier uso factico.
- Licencia no disponible: verificar los terminos del modelo base Qwen2.5 y del checkpoint de bartowski antes de uso comercial.
- Idiomas soportados no detallados en la informacion; no asumir cobertura multilingue amplia.
- Solo dos GPUs AMD documentadas (Strix Halo y R9700); sin soporte documentado en NVIDIA u otras AMD.
- Los gates de correctitud no se han vuelto a ejecutar en este paquete (ultimo pase sobre build `sha256 50ea095`); la validacion actual es parcial.
- Resultados de rendimiento en R9700 no medidos; los de Strix Halo son techos roofline, no mediciones de Loom.
- Sin decodificacion especulativa (sin cabeza MTP ni drafter para este modelo).
- Repositorio con 0 descargas y 0 likes; ecosistema en fase temprana, sin garantias de mantenimiento.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla, marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Qwen2.5-0.5B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
