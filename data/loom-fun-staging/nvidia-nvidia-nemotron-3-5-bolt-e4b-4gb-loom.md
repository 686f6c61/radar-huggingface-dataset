# loom-fun-staging/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom

## Resumen

`loom-fun-staging/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom` es un paquete de despliegue para el ecosistema Loom (herramienta de inferencia para GPUs AMD basada en ROCm) que empaqueta el checkpoint GGUF sin modificar `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` en cuantizacion Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune: el autor del repositorio (loom-fun-staging) solo genera los programas `.loom` y el fichero `model.json` necesarios para servir el modelo en hardware AMD concreto, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un modelo multimodal de NVIDIA orientado a entrada de imagen y texto (`image-text-to-text`), con un tamano de aproximadamente 4B parametros segun indica el nombre, ventana de contexto de 131.072 tokens por peticion y soporte de razonamiento explicito (thinking mode) desactivable. El paquete anade decodificacion especulativa DFlash con profundidad 3 usando un drafter separado, y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling e imagenes via `image_url`.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, el tamano del repo es de 0.0 GB (los pesos se materializan al hacer `loom-fetch`), y el propio autor reconoce que las puertas de correctitud y las metricas de rendimiento de esta build concreta no se han vuelto a medir. Debe tratarse como un artefacto de staging/experimental para validar el stack Loom sobre AMD, no como una distribucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de la model card sugiere `gemma4`; el modelo base es un transformer multimodal de NVIDIA, sin detalle arquitectonico en la informacion proporcionada) |
| Parametros totales | aproximadamente 4B (segun el sufijo `E4B` del nombre; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf`) + `mmproj-F16.gguf`; paquete Loom (`model.json` + programas `.loom`) |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` |
| Drafter de decodificacion especulativa | `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los datos proporcionados. La model card del paquete Loom no describe el transformer, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El unico indicio es el tag `gemma4` incluido por el autor del paquete, que sugiere una base arquitectonica de la familia Gemma 4, pero no se confirma en el texto. El modelo es multimodal (entrada de imagen y texto) y el paquete incluye un proyector de vision en F16 separado del checkpoint cuantizado.

Lo que si esta documentado es la capa de despliegue: el paquete usa decodificacion especulativa DFlash con profundidad 3 y un drafter dedicado, activada por defecto. En las mediciones de Strix Halo se reportan tasas de aceptacion de tokens draft del 37 % en decodificacion corta, 33 % a 2k de contexto y 34 % a 32k. La roofline teorica del hardware se calcula a 216 GB/s de ancho de banda y 59 TFLOP/s. El servidor implementa espera activa (`completion_spin_ns=4294967295`) y limita la memoria reservada a 36 GB en Strix Halo y 34 GB en R9700.

## Capacidades

- Generacion de texto y razonamiento: modo thinking desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`. No hay niveles de "reasoning effort" (marcado como no aplicable).
- Entrada de imagen: soporta partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-F16.gguf`.
- Tool calling: compatible con `tools` y `tool_calls` al estilo OpenAI.
- API compatible con OpenAI: endpoint `/v1/chat/completions` en `127.0.0.1:8080`.
- Decodificacion especulativa: DFlash con profundidad 3, activa por defecto, con drafter separado.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia: hasta 4 peticiones simultaneas.
- Contexto largo: 131.072 tokens por peticion.
- Audio: no soportado por Loom, aunque el modelo upstream lo tenga segun la propia model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion del stack Loom sobre AMD: servir el modelo con `loom-serve` en Strix Halo o R9700 para comprobar que los kernels generados y el pipeline de decodificacion especulativa funcionan sobre ROCm antes de adoptar Loom en un proyecto.
- Procesamiento de documentos largos con imagen: con 131.072 tokens de contexto, el modelo puede ingerir contratos, informes o manuales extensos junto con capturas o diagramas y responder preguntas sobre el conjunto.
- Asistente con acceso a herramientas: el soporte de `tools`/`tool_calls` permite integrarlo en flujos que consultan APIs externas, bases de datos o sistemas de tickets, con el modelo decidiendo que funcion invocar.
- Extraccion de datos de capturas y formularios: la entrada de imagen via `image_url` sirve para transcribir o estructurar informacion de pantallazos, facturas escaneadas o interfaces, enviando el resultado como JSON mediante tool calling.
- Razonamiento con traza explicita en tareas de analisis: activando `enable_thinking`, el modelo emite su cadena de razonamiento antes de la respuesta final, util para depurar decisiones en pipelines de clasificacion o evaluacion.
- Despliegue local en estacion de trabajo AMD: al caber en 36 GB de memoria en Strix Halo y 34 GB en R9700 con Q4_K_M, permite montar un servidor de inferencia privado en hardware de escritorio sin GPU de datacenter.
- Prototipado de agentes multi-paso: la combinacion de contexto largo, tool calling y 4 peticiones concurrentes permite construir bucles de agente con varias llamadas encadenadas sobre el mismo servidor.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento para Strix Halo (gfx1151), pero las columnas de llama.cpp y Loom estan marcadas como no medidas ("—"); solo se publican los valores de roofline teorica. No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 143,6 |
| Decode tok/s, contexto 2k | no medido | no medido | 131,3 |
| Decode tok/s, contexto 32k | no medido | no medido | 106,4 |
| Prefill tok/s, documento 1k | no medido | no medido | 7.146,0 |
| Prefill tok/s, documento 2k | no medido | no medido | 7.093,8 |
| Prefill tok/s, documento 8k | no medido | no medido | 6.812,0 |
| Prefill tok/s, documento 16k | no medido | no medido | 6.469,3 |
| Prefill tok/s, documento 32k | no medido | no medido | 5.878,0 |
| 4 streams, decode agregado tok/s | no medido | no medido | 255,2 |
| Tokens draft aceptados (especulativa) | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) el autor indica explicitamente que los resultados "no se han vuelto a medir". Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`) figuran como no reejecutadas en este paquete; la ultima pasada corresponde a una build anterior con sha256 `73d6c9b`.

## Requisitos de hardware

- VRAM/memoria reservada: 36 GB en Ryzen AI Max+ 395 "Strix Halo" (`--memory_bytes=36000000000`) y 34 GB en Radeon AI PRO R9700 (`--memory_bytes=34000000000`).
- GPU soportadas: AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- GPU de consumo: no hay datos de compatibilidad con RTX 4090, RX 7900 XTX u otras; el paquete esta generado especificamente para los dos destinos AMD citados.
- Despliegue: `loom-serve` con el paquete `hrx-loom[hf]==0.1.0`; descarga de pesos con `loom-fetch`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este paquete, aunque llama.cpp se usa como referencia de comparacion.
- Latencia y throughput: no medidos en esta build. Solo se dispone de los techos roofline de la tabla anterior (143,6 tok/s de decode en prompt corto, 5.878 tok/s de prefill a 32k, 255,2 tok/s agregados con 4 streams).
- Concurrencia maxima soportada: 4 peticiones simultaneas.

## Comparativa con modelos similares

No hay datos de rendimiento medidos de este paquete que permitan una comparacion cuantitativa fiable. La unica referencia documentada es el propio modelo base sin empaquetar y el motor llama.cpp ROCm, que el autor usa como referencia de correctitud y de comparacion de rendimiento (sin valores publicados).

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-fun-staging/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom` | ~4B (segun nombre) | 131.072 | no disponible | GGUF Q4_K_M + paquete Loom | Solo AMD Strix Halo y R9700; 0 descargas; metricas no remedidas |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` (base) | ~4B (segun nombre) | no disponible en esta informacion | no disponible | no disponible | Checkpoint original sin empaquetar; referencia de correctitud |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` (drafter) | no disponible | no disponible | no disponible | no disponible | Drafter de decodificacion especulativa para el modelo base |
| llama.cpp ROCm (motor) | n/a | n/a | n/a | n/a | Usado como referencia de comparacion; argumentos del servidor no registrados |

## Limitaciones y advertencias

- Artefacto de staging: el repositorio tiene 0 descargas, 0 likes y el tamano declarado es de 0.0 GB; los pesos se materializan en el momento de la descarga con `loom-fetch`.
- Metricas no verificadas: las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`) no se han reejecutado en esta build; la ultima pasada valida corresponde a un sha256 anterior (`73d6c9b`).
- Rendimiento sin medir: todas las celdas de llama.cpp y Loom en la tabla de Strix Halo estan vacias; solo hay techos roofline teoricos. En R9700 no se ha remedido nada.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que consultar la licencia del modelo base `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB` antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no se documenta cobertura linguistica, por lo que no se puede garantizar calidad en castellano ni en otros idiomas.
- Limitacion de hardware: solo se documenta compatibilidad con AMD Ryzen AI Max+ 395 y Radeon AI PRO R9700; no hay soporte declarado para GPUs NVIDIA ni para otras Radeon.
- Sin audio: aunque el modelo upstream lo soporte, Loom no implementa entrada ni salida de audio.
- Concurrencia baja: 4 peticiones simultaneas y 4.096 tokens maximos de salida limitan su uso como servidor de alta carga.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgo, toxicidad o tasas de alucinacion en la informacion disponible.
- Dependencia de version: el paquete requiere `hrx-loom[hf]==0.1.0` y un stack ROCm concreto; cambios de version pueden romper la reproducibilidad.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun-staging/nvidia-NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-loom
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Drafter de decodificacion especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion de paquetes loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
