# loom-fun-staging/bartowski-LFM3-1.7B-loom

## Resumen

LFM3-1.7B-loom es un paquete de despliegue (formato `.loom`, compuesto por programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-fun-staging` a partir del checkpoint GGUF sin modificar `bartowski/LFM3-1.7B-GGUF`, en concreto el fichero `LFM3-1.7B-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que permite servir el modelo base sobre GPUs AMD mediante el runtime Loom (`hrx-loom`), apuntando especificamente a los aceleradores AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente pertenece a la familia LFM3 de Liquid AI, con 1.700 millones de parametros en cuantizacion Q4_K_M. El paquete expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`), soporta tool calling estilo OpenAI, modo de razonamiento activado por defecto y una ventana de contexto de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

Su relevancia es acotada pero tecnica: demuestra el flujo `loom-skills` para generar paquetes de despliegue optimizados para silicio AMD (ROCm) y publica cifras de rendimiento frente a llama.cpp ROCm, aunque en esta version la mayoria de las celdas comparativas estan sin medir. Es un artefacto de staging (0 descargas, 0 likes) y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; el paquete no detalla la arquitectura interna) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico fichero empaquetado: `LFM3-1.7B-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (empaquetado en formato `.loom` con `model.json`) |
| Modelo base | bartowski/LFM3-1.7B-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Servidor | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Memoria configurada | `--memory_bytes=13000000000` (13 GB) |
| Fecha de creacion | 2026-11-14 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-1.7B (tipo de transformer, atencion, datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO). El paquete Loom no modifica los pesos: parte del GGUF publicado por bartowski y genera los programas `.loom` y la tarjeta `model.json` mediante el flujo `loom-skills`, de modo que la unica capa tecnica anadida es la de compilacion de kernels y el runtime de servicio sobre ROCm.

La innovacion destacable del artefacto es el propio runtime Loom: kernels generados y validados contra implementaciones de referencia (`kernel_tests`), comparacion token a token con la salida de llama.cpp sobre el mismo GGUF (`golden`, `compare`), verificacion de consistencia bajo concurrencia (`consistency`) y pruebas de bucle agente multi-turno (`agent`, `agent_think_off`). Segun la model card, estas puertas de correctitud no se han re-ejecutado en este paquete concreto: la ultima pasada corresponde a una build anterior con sha256 `a024152`, y las puertas nocturnas las repiten. El paquete incluye una estimacion de roofline para Strix Halo a 216 GB/s y 59 TFLOP/s.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de agentes y razonamiento multi-paso mediante bucle de tool calling verificado por la puerta `agent`.
- Contexto largo: hasta 262.144 tokens por peticion, con pruebas registradas sobre documentos de 1k a 32k tokens.
- Concurrencia de 4 peticiones simultaneas con consistencia verificada frente a ejecuciones aisladas.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Sin soporte de decodificacion especulativa (no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto).
- Sin entrada de imagen ni de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat local sobre hardware AMD: el paquete se sirve con `loom-serve` en Strix Halo o Radeon AI PRO R9700 y expone un endpoint compatible con OpenAI, lo que permite sustituir directamente una API remota por inferencia en el puesto de trabajo sin cambiar el codigo cliente.
- Asistentes con contexto largo: con 262.144 tokens por peticion, el modelo puede procesar documentos extensos o historiales de conversacion muy largos sin truncar; la model card registra pruebas de prefill sobre documentos de hasta 32k tokens.
- Agentes con herramientas: el soporte de `tools` y `tool_calls` y la puerta `agent` (que valida el renderizado exacto del prompt, la reutilizacion de historial y la validez de las llamadas) lo hacen apto para orquestadores que encadenan varias llamadas a funciones.
- Despliegue en estaciones de trabajo con GPU AMD: al estar empaquetado para gfx1151 y gfx1201, encaja en entornos donde no hay GPUs NVIDIA y se quiere evitar la dependencia de CUDA.
- Evaluacion de runtimes alternativos: sirve como banco de pruebas para comparar Loom frente a llama.cpp ROCm con el mismo GGUF, los mismos prompts y el mismo runner (DevLab).
- Prototipado de flujos con razonamiento controlable: el modo thinking se puede activar o desactivar por peticion, util para alternar entre respuestas rapidas y respuestas razonadas en la misma aplicacion.
- Inferencia concurrente ligera: con 4 peticiones simultaneas y consistencia verificada, puede atender pequenos equipos o demos internas.

## Benchmarks y rendimiento

La model card publica una tabla comparativa Loom frente a llama.cpp ROCm para Strix Halo (gfx1151), pero las columnas de llama.cpp y Loom estan sin medir ("—") en esta version. Solo se incluyen los valores de roofline (techo teorico del hardware para este GGUF a 216 GB/s y 59 TFLOP/s):

| Metrica | Roofline Strix Halo | Loom | llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 195,1 | no medido | no medido |
| Decode tok/s, contexto 2k | 190,4 | no medido | no medido |
| Decode tok/s, contexto 32k | 143,7 | no medido | no medido |
| Prefill tok/s, documento 1k | 19.878,9 | no medido | no medido |
| Prefill tok/s, documento 2k | 19.715,6 | no medido | no medido |
| Prefill tok/s, documento 8k | 18.789,8 | no medido | no medido |
| Prefill tok/s, documento 16k | 17.682,6 | no medido | no medido |
| Prefill tok/s, documento 32k | 15.818,4 | no medido | no medido |
| 4 streams, decode agregado | 753,0 | no medido | no medido |
| Decodificacion especulativa | n/a | n/a | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados de este paquete aun no se han re-medido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el ejemplo de servicio configura `--memory_bytes=13000000000` (13 GB) para el GGUF Q4_K_M de 1,7B; el modelo en si es mucho menor, pero el runtime reserva ese margen.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras arquitecturas AMD.
- GPU de consumo: no disponible en la informacion proporcionada; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: runtime Loom (`pip install "hrx-loom[hf]==0.1.0"`), descarga con `loom-fetch` y servicio con `loom-serve`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no medidos en esta version; solo se dispone del techo roofline (195,1 tok/s de decode en prompt corto y 19.878,9 tok/s de prefill en documento de 1k en Strix Halo).
- Concurrencia: 4 peticiones simultaneas segun la model card.

## Comparativa con modelos similares

No hay datos de rendimiento medidos para este paquete, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| LFM3-1.7B-loom (este paquete) | 1,7B | 262.144 | GGUF empaquetado en `.loom` | no disponible | Solo AMD Strix Halo y R9700; runtime Loom; 4 peticiones concurrentes |
| bartowski/LFM3-1.7B-GGUF (base) | 1,7B | no disponible en la informacion | GGUF | no disponible | Checkpoint original sin empaquetar; sirve como referencia de correctitud |
| llama.cpp ROCm sobre el mismo GGUF | 1,7B | no disponible | GGUF | no disponible | Motor de referencia usado en las pruebas; argumentos del servidor no registrados |

No se dispone de datos de benchmarks que permitan comparar calidad o velocidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de staging: 0 descargas y 0 likes; no hay evidencia de uso en produccion ni de validacion externa.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`, `sampling`) no se han re-ejecutado en este paquete; la ultima pasada corresponde a la build `a024152`.
- Las cifras de rendimiento frente a llama.cpp estan sin medir; solo hay roofline teorico.
- Los resultados para Radeon AI PRO R9700 no se han re-medido.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que remitirse a la licencia del modelo base LFM3 y del GGUF de bartowski.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue.
- Dependencia de hardware muy concreta (gfx1151 y gfx1201) y de un runtime joven (`hrx-loom` 0.1.0); no hay soporte documentado para CUDA ni para otros backends.
- Sin decodificacion especulativa, sin vision y sin audio.
- Maximo de 4.096 tokens de salida por peticion y 4 peticiones concurrentes, lo que limita cargas de alta demanda.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse sobre el modelo base LFM3-1.7B.
- La busqueda web realizada devuelve resultados sobre el producto Loom de grabacion de pantalla y la marca de ropa Loom, no relacionados con este artefacto; no aportan informacion tecnica adicional.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-LFM3-1.7B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/LFM3-1.7B-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
