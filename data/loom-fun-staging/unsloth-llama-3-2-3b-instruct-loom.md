# loom-fun-staging/unsloth-Llama-3.2-3B-Instruct-loom

## Resumen

`loom-fun-staging/unsloth-Llama-3.2-3B-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `Llama-3.2-3B-Instruct-Q4_K_M.gguf` de Unsloth (derivado del Llama 3.2 3B Instruct de Meta) en formato `.loom` junto con un fichero `model.json` que describe el modelo y sus programas. El objetivo es servir ese GGUF sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer decoder-only de 3.000 millones de parametros con ventana de contexto de 131.072 tokens, pensado para instrucciones, dialogo multiturno y tool calling. La aportacion del paquete Loom es el stack de inferencia: kernels generados para ROCm, servidor compatible con la API de OpenAI en `127.0.0.1:8080`, soporte de 4 peticiones concurrentes y limites de 4.096 tokens de salida por peticion.

Es relevante ahora porque ofrece una via de ejecucion de un GGUF popular en hardware AMD consumer y profesional (Strix Halo, R9700) con metricas de roofline publicadas, aunque la comparativa directa frente a llama.cpp aparece sin valores medidos en esta version del paquete. El repositorio es de staging, sin descargas ni likes, y la model card advierte de que varias puertas de validacion no se han vuelto a ejecutar sobre este build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, heredada del GGUF base) |
| Parametros totales | 3.000 millones (modelo base Llama-3.2-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada (sujeta a la licencia del modelo base Llama 3.2) |
| Formato de pesos | GGUF (`Llama-3.2-3B-Instruct-Q4_K_M.gguf`) empaquetado como `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | `/v1/chat/completions` estilo OpenAI |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria reservada en ejemplo | 29.000.000.000 bytes (`--memory_bytes=29000000000`) |
| Version del runtime | `hrx-loom[hf]==0.1.0` |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B Instruct, un transformer decoder-only denso con atencion por grupos (GQA) y 131.072 tokens de contexto, afinado por instrucciones por Meta y redistribuido por Unsloth como GGUF Q4_K_M. El paquete Loom no reentrena ni modifica los pesos: la model card indica explicitamente "unmodified GGUF checkpoint". Por tanto, no hay datos propios sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO en este repositorio; esa informacion pertenece a la model card original de Llama 3.2 y no se incluye aqui.

La innovacion tecnica esta en el runtime. Loom genera kernels para ROCm (gfx1151 y gfx1201) y los valida contra implementaciones de referencia y contra llama.cpp mediante puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`). El servidor usa espera activa configurable (`completion_spin_ns=4294967295`) y expone un endpoint compatible con OpenAI. No hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificacion especulativa figura como no aplicable.

## Capacidades

- Generacion de texto y respuestas de instrucciones en formato chat, heredadas de Llama 3.2 3B Instruct.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Bucles de agente multiturno con reutilizacion de historial, validados por la puerta `agent`.
- Contexto largo de 131.072 tokens por peticion, con prefill medido hasta 32k documentos.
- Concurrencia de 4 peticiones simultaneas con salida estable respecto a ejecuciones aisladas (puerta `consistency`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Sin modo de razonamiento/thinking (no aplicable), sin entrada de imagen, sin audio, sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estaciones AMD: servir el paquete con `loom-serve` en Strix Halo o R9700 y exponer `/v1/chat/completions` a una interfaz interna; el contexto de 131k permite conversaciones largas sin truncar.
- Agente con herramientas en local: usar el soporte de `tools`/`tool_calls` para consultas a bases de datos internas o APIs REST, con el bucle multiturno validado por la puerta `agent`.
- Procesamiento de documentos largos: prefill de documentos de 8k-32k tokens (roofline de 8.412,5 tok/s a 8k y 5.295,2 tok/s a 32k en Strix Halo) para resumen, extraccion o preguntas sobre contratos e informes.
- Backend de bajo coste para prototipos: 3B en Q4_K_M cabe en el presupuesto de memoria del ejemplo (29 GB reservados) y deja margen en una R9700 de 32 GB para otras cargas.
- Servicio multiusuario ligero: 4 peticiones concurrentes con salida agregada de 377,8 tok/s de roofline en Strix Halo para un equipo pequeno o un entorno de pruebas.
- Evaluacion y benchmarking de stacks ROCm: comparar Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, usando las metricas de decode y prefill documentadas.
- Sustitucion de API en pruebas de integracion: al ser compatible con OpenAI, se puede apuntar un cliente existente al servidor local sin cambiar el codigo de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo incluye metricas de rendimiento del runtime (roofline) para Strix Halo; la tabla de comparacion frente a llama.cpp aparece con valores no medidos.

| Metrica (Strix Halo, gfx1151) | Roofline | Loom | llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 107,4 | no medido | no medido |
| Decode tok/s, contexto 2k | 96,4 | no medido | no medido |
| Decode tok/s, contexto 32k | 38,0 | no medido | no medido |
| Prefill tok/s, documento 1k | 10.156,3 | no medido | no medido |
| Prefill tok/s, documento 2k | 9.864,2 | no medido | no medido |
| Prefill tok/s, documento 8k | 8.412,5 | no medido | no medido |
| Prefill tok/s, documento 16k | 7.032,5 | no medido | no medido |
| Prefill tok/s, documento 32k | 5.295,2 | no medido | no medido |
| 4 streams, decode agregado | 377,8 | no medido | no medido |
| Decodificacion especulativa | n/a | n/a | n/a |

Roofline calculado para Strix Halo a 216 GB/s y 59 TFLOP/s con `loom-roofline` (`roofline.py`, loom-skills `acd9ac7`). Para la Radeon AI PRO R9700, la model card indica que los resultados "no se han vuelto a medir".

## Requisitos de hardware

- VRAM estimada: el ejemplo de servicio reserva 29.000.000.000 bytes (~27 GiB) para el GGUF Q4_K_M y el runtime; un 3B en Q4_K_M ocupa del orden de 2 GB de pesos, por lo que el grueso de la reserva es margen del runtime y del contexto.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU en esta ficha.
- GPU consumer: no disponible; el paquete esta orientado a las dos plataformas AMD citadas, no a GeForce.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el modelo y `loom-serve` para el servidor en `127.0.0.1:8080`. No se menciona soporte de vLLM, llama.cpp, Ollama o TGI para este paquete.
- Throughput: roofline de 107,4 tok/s de decode a contexto corto y 377,8 tok/s agregados con 4 streams en Strix Halo; latencia real medida no disponible.
- Memoria del sistema: Strix Halo es una APU con memoria unificada; la reserva de 29 GB condiciona el resto de cargas del equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Llama 3.2 3B Instruct Q4_K_M + Loom) | 3B | 131.072 | GGUF + `.loom` | no disponible | Runtime ROCm para Strix Halo y R9700; tool calling; 4 streams |
| `unsloth/Llama-3.2-3B-Instruct-GGUF` | 3B | 131.072 | GGUF | la del modelo base Llama 3.2 | Mismo checkpoint sin empaquetar; requiere un motor GGUF (llama.cpp, etc.) |
| Llama 3.2 3B Instruct (Meta, original) | 3B | 131.072 | safetensors | Llama 3.2 Community License | Pesos sin cuantizar; necesita conversion y cuantizacion para inferencia local |
| llama.cpp ROCm | n/a (motor) | segun modelo | GGUF | MIT | Motor de referencia usado en las puertas de correccion; argumentos de servidor no registrados |

No se dispone de datos de rendimiento medidos de Loom frente a llama.cpp en esta version del paquete, por lo que la comparativa de velocidad queda pendiente.

## Limitaciones y advertencias

- Repositorio de staging: 0 descargas y 0 likes; no es una distribucion estable.
- Licencia no declarada en el repositorio; el uso comercial queda sujeto a la licencia del modelo base Llama 3.2, que no se detalla aqui.
- Puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) marcadas como "no re-ejecutadas en este paquete"; la ultima pasada fue sobre el build `cb89d6c`.
- Resultados de la Radeon AI PRO R9700 sin volver a medir.
- Comparativa de rendimiento frente a llama.cpp sin valores medidos; los argumentos del servidor llama.cpp no se registraron.
- Sin decodificacion especulativa (no hay drafter ni cabeza MTP para este modelo).
- Sin modo de razonamiento, vision ni audio.
- Limite de 4.096 tokens de salida por peticion y 4 peticiones concurrentes; puede ser insuficiente para cargas de produccion elevadas.
- Riesgo de alucinacion y sesgos inherentes al modelo base Llama 3.2 3B, no evaluados en esta ficha.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Hardware restringido a gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPU AMD o NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Llama-3.2-3B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
