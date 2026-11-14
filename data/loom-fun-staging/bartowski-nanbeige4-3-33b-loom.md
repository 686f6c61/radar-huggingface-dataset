# loom-fun-staging/bartowski-Nanbeige4.3-33B-loom

## Resumen

El paquete `loom-fun-staging/bartowski-Nanbeige4.3-33B-loom` es un artefacto de despliegue, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `Nanbeige_Nanbeige4.3-33B-Q4_K_M.gguf` (publicado originalmente por bartowski, derivado del modelo Nanbeige 4.3 de 33B parametros) en el formato `.loom` del ecosistema Loom, un runtime de inferencia para GPUs AMD basado en ROCm. Lo mantiene la organizacion `loom-fun-staging` y se genera con el flujo de trabajo `loom-skills`.

El objetivo es ofrecer una ruta de servicio lista para hardware AMD concreto: la APU Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye programas `.loom` compilados y una tarjeta `model.json`, y expone un servidor compatible con la API `/v1/chat/completions` de OpenAI. No aporta pesos nuevos ni fine-tuning: la calidad del modelo es la del GGUF Q4_K_M subyacente.

Su relevancia es operativa: demuestra el despliegue de un modelo de 33B cuantizado a 4 bits sobre silicio AMD consumer/prosumer con un backend alternativo a llama.cpp, con soporte declarado de tool calling, modo razonamiento y concurrencia de cuatro peticiones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card indica que varias puertas de validacion no se han vuelto a ejecutar sobre este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo Nanbeige 4.3 de 33B; no detallada en la informacion) |
| Parametros totales | 33B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens nativos; 242.688 tokens por peticion en Strix Halo; 52.224 tokens por peticion en Radeon AI PRO R9700 |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado como `.loom` con `model.json`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica el modelo. El contenido es un empaquetado del GGUF `Nanbeige_Nanbeige4.3-33B-Q4_K_M.gguf` en el formato de ejecucion de Loom: programas `.loom` generados por el flujo `loom-skills` y una tarjeta `model.json` que describe el grafo y los kernels. La arquitectura interna del transformer, la composicion del dataset de entrenamiento, el numero de tokens vistos y si hubo RLHF, DPO u otras etapas de alineacion no se detallan en la informacion proporcionada.

La innovacion tecnica relevante esta en el runtime, no en el modelo: Loom compila kernels especificos para gfx1151 y gfx1201, sirve peticiones con espera activa (`completion_spin_ns`) y acota el pool de memoria con `--memory_bytes`. La model card confirma que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no aplica. La cuantizacion Q4_K_M es la del checkpoint de bartowski, sin recuantizar.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo Nanbeige 4.3 de 33B.
- Modo razonamiento o thinking activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling en estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multi-turno con renderizado exacto del prompt e historial reutilizado (segun la puerta `agent` descrita en la model card).
- Servidor compatible con `/v1/chat/completions` de OpenAI, lo que facilita la integracion con SDKs existentes.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia declarada frente a ejecuciones aisladas.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Sin entrada de imagen, sin audio de entrada o salida y sin decodificacion especulativa (marcados como no aplicables).

## Casos de uso

- Servicio de chat sobre Strix Halo: desplegar el modelo en una APU Ryzen AI Max+ 395 con `loom-serve` y `--memory_bytes=81000000000` para atender un asistente interno con contexto de hasta 242.688 tokens por peticion.
- Procesamiento de documentos largos: analisis y resumen de contratos o informes de decenas de miles de tokens aprovechando la ventana nativa de 524.288 tokens y el prefill medido en la roofline (hasta 948,6 tok/s en documentos de 1k y 691,6 tok/s en 32k sobre Strix Halo).
- Agentes con herramientas: integrar el endpoint `/v1/chat/completions` en un orquestador que use `tool_calls` para consultar APIs internas, bases de datos o sistemas de ticketing, con historial multi-turno validado por la puerta `agent`.
- Despliegue en estacion de trabajo con Radeon AI PRO R9700: servir el modelo en una GPU de 32 GB con `--memory_bytes=34000000000` para cargas de un solo usuario o equipos pequenos, aceptando el recorte de contexto a 52.224 tokens por peticion.
- Evaluacion comparativa de backends AMD: usar el paquete como banco de pruebas para medir Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, tal como describe la seccion de rendimiento de la model card.
- Razonamiento asistido con modo thinking: activar el modo razonamiento por defecto para tareas de analisis paso a paso y desactivarlo en produccion de baja latencia cuando no se requiera cadena de pensamiento.
- Prototipado de asistentes con salida acotada: pipelines que necesitan respuestas de hasta 4.096 tokens y cuatro peticiones concurrentes, sin requisitos de vision ni audio.

## Benchmarks y rendimiento

La model card no publica comparativas directas de calidad (MMLU, HumanEval, GSM8K) entre Loom y llama.cpp. Solo incluye una tabla de rendimiento de inferencia frente a la roofline del hardware en Strix Halo; las columnas de llama.cpp y Loom estan sin medir en esta publicacion.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline (techo) |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 10,7 |
| Decode tok/s, contexto 2k | no medido | no medido | 10,5 |
| Decode tok/s, contexto 32k | no medido | no medido | 8,0 |
| Prefill tok/s, documento 1k | no medido | no medido | 948,6 |
| Prefill tok/s, documento 2k | no medido | no medido | 937,4 |
| Prefill tok/s, documento 8k | no medido | no medido | 875,2 |
| Prefill tok/s, documento 16k | no medido | no medido | 804,1 |
| Prefill tok/s, documento 32k | no medido | no medido | 691,6 |
| 4 streams, decode agregado tok/s | no medido | no medido | 41,9 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

La roofline se calcula para el Ryzen AI Max+ 395 a 216 GB/s de ancho de banda y 59 TFLOP/s. En la Radeon AI PRO R9700 los resultados no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- Strix Halo (Ryzen AI Max+ 395, gfx1151): pool de memoria de 81.000.000.000 bytes (`--memory_bytes=81000000000`), con contexto de hasta 242.688 tokens por peticion.
- Radeon AI PRO R9700 (gfx1201, 32 GB): pool de 34.000.000.000 bytes (`--memory_bytes=34000000000`), con contexto recortado a 52.224 tokens por peticion.
- El mismo paquete sirve en ambas GPUs; los ficheros no cambian entre plataformas.
- Despliegue mediante `hrx-loom[hf]==0.1.0`: `loom-fetch` para materializar el paquete y `loom-serve` para servir en `127.0.0.1:8080`.
- Concurrencia maxima soportada: 4 peticiones simultaneas.
- Throughput y latencia reales de Loom en este paquete: no medidos en la publicacion (solo se ofrece la roofline como techo teorico).
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para este paquete; el runtime previsto es Loom sobre ROCm.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige 4.3 33B (Q4_K_M, paquete Loom) | 33B | 524.288 nativos; 242.688 por peticion en Strix Halo | GGUF empaquetado en `.loom`; runtime Loom | no disponible | Objeto de esta ficha; sin benchmarks de calidad publicados |
| `bartowski/Nanbeige_Nanbeige4.3-33B-GGUF` | 33B | no disponible | GGUF para llama.cpp y derivados | no disponible | Checkpoint base sin modificar; misma calidad de pesos |
| llama.cpp ROCm (mismo GGUF) | 33B | limitado por memoria del host | GGUF nativo; llama.cpp | licencia de llama.cpp | Referencia de comparacion en la model card; valores no medidos en esta publicacion |

No se dispone de datos para comparar con alternativas de otros fabricantes en la misma categoria (mismo tamano o misma tarea) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio de staging con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion comunitaria.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase corresponde a un build anterior (sha256 `c6a9dea`). En la Radeon AI PRO R9700 no se han vuelto a medir.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo Nanbeige original y del checkpoint de bartowski.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue sin evaluacion propia.
- Riesgo de alucinacion inherente a un modelo de lenguaje de 33B cuantizado a 4 bits; no se documentan evaluaciones de fidelidad.
- La cuantizacion Q4_K_M introduce perdida de precision frente a pesos en BF16/FP16; el paquete no ofrece otras cuantizaciones.
- Contexto efectivo limitado por hardware: 52.224 tokens en la R9700 frente a los 524.288 nativos, lo que puede truncar casos de uso de contexto muy largo.
- Sin vision, sin audio y sin decodificacion especulativa; el limite de salida es de 4.096 tokens por peticion.
- Dependencia de un runtime joven (`hrx-loom==0.1.0`) y de hardware AMD especifico (gfx1151, gfx1201); no hay soporte documentado para NVIDIA u otras GPUs.
- La comparacion de rendimiento frente a llama.cpp en la model card esta incompleta (columnas sin medir), por lo que no puede citarse como evidencia de superioridad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/bartowski-Nanbeige4.3-33B-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
