# loom-fun-staging/bartowski-Qwen2.5-1.5B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue para AMD Loom del checkpoint GGUF `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf` de bartowski, que a su vez es una cuantizacion del modelo Qwen2.5-1.5B-Instruct de Alibaba. El autor del paquete es `loom-fun-staging` y su funcion es empaquetar los pesos sin modificar junto con programas `.loom` y una tarjeta `model.json` para servir el modelo en las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), generado mediante el flujo de trabajo `loom-skills`.

El modelo subyacente, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parametros con una ventana de contexto de 32.768 tokens, orientado a instrucciones y conversacion. El paquete expone un servidor compatible con la API de OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`), soporta tool calling al estilo OpenAI y permite hasta 4 peticiones concurrentes con un maximo de 4.096 tokens de salida por peticion.

La relevancia de este paquete es de infraestructura, no de modelado: proporciona una via de ejecucion optimizada para hardware AMD consumer y profesional reciente, con mediciones roofline publicadas para Strix Halo (216 GB/s de ancho de banda y 59 TFLOP/s). No obstante, las celdas de rendimiento comparativo frente a llama.cpp aparecen sin medir en la model card, y la licencia y los idiomas no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct); paquete de despliegue para AMD Loom |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (checkpoint `Qwen2.5-1.5B-Instruct-Q4_K_M.gguf`) empaquetado como `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria configurada en ejemplo | 8.000.000.000 bytes (`--memory_bytes`) |

## Arquitectura y entrenamiento

El paquete no introduce cambios en los pesos: reutiliza el GGUF Q4_K_M de bartowski, derivado del Qwen2.5-1.5B-Instruct original. La arquitectura subyacente es un transformer decoder-only de 1,5B parametros con atencion causal estandar; la model card no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el volumen o composicion del dataset de entrenamiento, por lo que esos datos deben consultarse en la documentacion del modelo base y no estan disponibles aqui.

La innovacion tecnica del paquete reside en la capa de ejecucion: kernels generados para las arquitecturas gfx1151 y gfx1201, un servidor con espera activa configurable (`completion_spin_ns=4294967295`) y compuertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) que comparan la salida codiciosa token a token contra una referencia de llama.cpp registrada sobre el mismo GGUF, tratando cada divergencia como un empate cercano. En esta publicacion esas compuertas no se han vuelto a ejecutar (la ultima pasada fue sobre una build previa, sha256 `799c5ec`). No hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa no aplica.

## Capacidades

- Generacion de texto conversacional e instrucciones: el modelo base es un modelo instruct, adecuado para dialogos multi-turno.
- Tool calling / function calling al estilo OpenAI (`tools` y `tool_calls`), validado por la compuerta `agent` de bucle multi-turno.
- Bucle de agente multi-turno con renderizado exacto del prompt y reutilizacion de historial (segun la compuerta `agent`).
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia respecto a ejecuciones aisladas (compuerta `consistency`).
- Contexto de 32.768 tokens por peticion, con pruebas de prefill documentadas hasta 32k.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento/thinking: no aplica.
- Entrada de imagen o audio: no aplica.
- Decodificacion especulativa: no aplica.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: servir el paquete con `loom-serve` sobre Strix Halo y exponer `/v1/chat/completions` para un cliente compatible con OpenAI, aprovechando los 32.768 tokens de contexto para conversaciones largas sin salir del equipo.
- Automatizacion de agentes con herramientas: integrar el endpoint en un orquestador que defina `tools` y consuma `tool_calls` para tareas como consultas a APIs internas, calculo o busqueda en bases de datos, apoyandose en la validacion del bucle `agent` multi-turno.
- Procesamiento de documentos de hasta 32k tokens: resumen, extraccion de entidades o clasificacion de contratos e informes en un solo pase, con prefill medido en roofline hasta 10.981 tok/s para 32k tokens en Strix Halo.
- Prototipado y evaluacion de pipelines LLM en hardware AMD: usar el servidor compatible con OpenAI como sustituto local de un backend en la nube durante el desarrollo, con 4 peticiones concurrentes para pruebas de carga ligeras.
- Generacion de codigo asistida en entornos con GPU AMD: el modelo base Qwen2.5 esta orientado a instrucciones y el paquete soporta tool calling, lo que permite integrarlo en asistentes de IDE o scripts de refactorizacion con llamadas a herramientas de compilacion o test.
- Despliegue en Radeon AI PRO R9700 (32 GB) para inferencia dedicada: el paquete incluye instrucciones de servicio para gfx1201, aunque las mediciones de rendimiento en esa GPU aun no se han realizado.
- Banquito de pruebas de motores de inferencia: comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, usando las metricas roofline publicadas como referencia.

## Benchmarks y rendimiento

La model card publica techos roofline para Strix Halo (gfx1151, 216 GB/s y 59 TFLOP/s) calculados con `loom-roofline`, pero las columnas de llama.cpp y Loom aparecen sin medir ("—") en todas las filas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | llama.cpp | Loom | Roofline (Strix Halo) |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 220,4 |
| Decode tok/s, contexto 2k | no medido | no medido | 208,2 |
| Decode tok/s, contexto 32k | no medido | no medido | 113,8 |
| Prefill tok/s, documento 1k | no medido | no medido | 21.800,1 |
| Prefill tok/s, documento 2k | no medido | no medido | 21.128,6 |
| Prefill tok/s, documento 8k | no medido | no medido | 17.832,8 |
| Prefill tok/s, documento 16k | no medido | no medido | 14.762,4 |
| Prefill tok/s, documento 32k | no medido | no medido | 10.981,0 |
| 4 streams, decode agregado tok/s | no medido | no medido | 823,7 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" segun la propia model card.

## Requisitos de hardware

- VRAM estimada: el ejemplo de servicio configura `--memory_bytes=8000000000` (8 GB) para un checkpoint Q4_K_M de 1,5B; el peso en disco de Q4_K_M ronda los 1 GB, por lo que 8 GB cubre pesos, cache KV para 32k tokens y margen operativo.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete esta pensado para hardware AMD con soporte ROCm; no se documenta compatibilidad con GPUs NVIDIA ni con iGPU distintas de gfx1151.
- Opciones de despliegue: `loom-serve` (incluido en `hrx-loom[hf]==0.1.0`), con descarga via `loom-fetch` y materializacion con `--materialize=copy`. El GGUF subyacente es compatible con llama.cpp, pero el paquete `.loom` esta atado al runtime Loom.
- Latencia y throughput: solo techos roofline (220,4 tok/s decode en prompt corto; 113,8 tok/s a 32k de contexto; 823,7 tok/s agregados con 4 streams en Strix Halo). No hay mediciones reales de Loom ni de llama.cpp en esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (paquete Loom, este repo) | 1,5B | 32.768 | Q4_K_M GGUF | no disponible | Hugging Face, runtime Loom para AMD gfx1151/gfx1201 |
| bartowski/Qwen2.5-1.5B-Instruct-GGUF (base) | 1,5B | 32.768 | multiples GGUF | no disponible | Hugging Face, compatible con llama.cpp |
| Qwen2.5-1.5B-Instruct (original) | 1,5B | 32.768 | safetensors y otras | no disponible | Hugging Face |
| Alternativas de ~1-2B (p. ej. Llama 3.2 1B/3B, Gemma 2 2B) | 1-3B | variable | variable | no disponible | no disponible en la informacion proporcionada |

La comparativa de rendimiento frente a llama.cpp no puede completarse porque las celdas de medicion estan vacias; la unica diferencia verificable es el empaquetado y el runtime (Loom frente a llama.cpp ROCm).

## Limitaciones y advertencias

- Las compuertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) no se han vuelto a ejecutar en esta build; la ultima pasada corresponde a un sha256 anterior (`799c5ec`).
- No hay mediciones reales de decode ni prefill de Loom en esta publicacion; solo techos roofline, que no equivalen a rendimiento observado.
- En Radeon AI PRO R9700 los resultados no se han vuelto a medir.
- Licencia no declarada en la informacion disponible: verificar la licencia del modelo base Qwen2.5 antes de cualquier uso comercial.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado en este paquete.
- Riesgo de alucinacion inherente a un modelo de 1,5B parametros; no se han publicado evaluaciones de calidad (MMLU, HumanEval, GSM8K) que permitan acotarlo.
- Contexto limitado a 32.768 tokens por peticion y salida maxima de 4.096 tokens; no admite decodificacion especulativa por ausencia de cabecera MTP y de drafter.
- Sin soporte de imagen, audio ni modo de razonamiento explicito.
- Concurrencia maxima de 4 peticiones: no apto para cargas de alta concurrencia sin escalado horizontal.
- El paquete esta atado al runtime Loom y a las arquitecturas gfx1151/gfx1201; no es portable a otros backends sin convertir el GGUF subyacente.
- Repositorio de staging con 0 descargas y 0 likes: no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Qwen2.5-1.5B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
