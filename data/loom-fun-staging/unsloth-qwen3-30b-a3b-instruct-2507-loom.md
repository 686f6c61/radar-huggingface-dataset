# loom-fun-staging/unsloth-Qwen3-30B-A3B-Instruct-2507-loom

## Resumen

`loom-fun-staging/unsloth-Qwen3-30B-A3B-Instruct-2507-loom` es un paquete de despliegue en formato Loom para el checkpoint GGUF `Qwen3-30B-A3B-Instruct-2507-Q4_K_M.gguf` de Unsloth, derivado a su vez del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen. No se trata de un fine-tuning ni de un modelo nuevo: los pesos son los del GGUF original sin modificar, y lo que anade el repositorio son programas `.loom` y una tarjeta `model.json` que permiten ejecutar el modelo sobre GPUs AMD concretas mediante el runtime `hrx-loom`.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, disenado para generacion de texto, razonamiento, codigo y uso conversacional con soporte de tool calling. Su interes practico en este paquete es la combinacion de una ventana de contexto nativa de 262.144 tokens con un peso en disco reducido por la cuantizacion Q4_K_M, lo que permite servirlo en hardware de consumo profesional AMD.

La relevancia de esta ficha es acotada: el repositorio pertenece a un espacio de staging con cero descargas y cero likes, creado y actualizado el 14 de noviembre de 2026, y su valor esta en la integracion con el ecosistema Loom para AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201), no en aportar capacidades nuevas al modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el modelo base Qwen3-30B-A3B-Instruct-2507 |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | aproximadamente 3.000 millones (3B) por token |
| Longitud de contexto | 262.144 tokens por peticion; en Radeon AI PRO R9700 limitado a 136.192 tokens por restriccion de memoria del paquete |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-30B-A3B-Instruct-2507-Q4_K_M.gguf) empaquetado como programas `.loom` mas `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.1.0` |

## Arquitectura y entrenamiento

El paquete no entrena nada: hereda integramente la arquitectura y los datos del modelo base Qwen3-30B-A3B-Instruct-2507, un transformer MoE con 30B parametros totales y unos 3B activos por token, lo que reduce el coste computacional por token a costa de mantener un footprint de pesos elevado. El checkpoint incluido es el GGUF Q4_K_M publicado por Unsloth, sin modificacion alguna de los pesos, segun declara la model card.

La innovacion tecnica del repositorio no esta en el modelo sino en el runtime Loom: kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un pool de memoria acotado mediante `--memory_bytes`, espera activa configurable con `completion_spin_ns`, decodificacion especulativa disponible pero desactivada (dflash), y soporte de cuatro peticiones concurrentes. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto nativo de 262.144 tokens por peticion.
- Razonamiento y resolucion de problemas en lenguaje natural, heredado del modelo base Qwen3-30B-A3B-Instruct-2507.
- Generacion de codigo, segun las capacidades declaradas del modelo base (no se aportan benchmarks en este repositorio).
- Tool calling / function calling en formato OpenAI: acepta `tools` y devuelve `tool_calls`.
- Servidor compatible con la API `/v1/chat/completions` de OpenAI, lo que facilita la integracion con clientes existentes.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Cuatro peticiones concurrentes con garantia de consistencia declarada (gate `consistency`, pendiente de re-ejecucion en este paquete).
- Decodificacion especulativa disponible pero desactivada en la configuracion publicada.
- Sin modo thinking o razonamiento extendido: la model card marca "not applicable" para reasoning / thinking y reasoning effort.
- Sin entrada de imagen ni audio: marcado "not applicable".
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional con documentos largos: con 262.144 tokens de contexto nativo se puede cargar un corpus extenso (por ejemplo, varios cientos de paginas de documentacion tecnica) en una sola peticion y mantener preguntas de seguimiento sin truncar, algo inviable en modelos con ventanas de 8k o 32k.
- Agente con tool calling en local: el soporte de `tools` y `tool_calls` en formato OpenAI permite conectar el modelo a funciones propias (consulta de bases de datos, APIs internas) y ejecutarlo en una estacion de trabajo con GPU AMD sin depender de la nube.
- Automatizacion de atencion al cliente en entornos con requisitos de soberania del dato: al servirse en local sobre Strix Halo o R9700, las conversaciones no salen del equipo, lo que encaja en sectores regulados.
- Generacion y revision de codigo en pipelines internos: el modelo puede integrarse como paso de revision o generacion dentro de un flujo CI/CD mediante el endpoint compatible con OpenAI, con cuatro peticiones concurrentes para paralelizar tareas.
- Procesamiento por lotes de documentos largos en una estacion AMD: tareas de resumen, extraccion de entidades o clasificacion sobre documentos de decenas de miles de tokens, aprovechando la ventana extendida y el rendimiento de prefill documentado en la roofline (hasta 10.078 tok/s en documentos de 1k y 3.269 tok/s en 32k sobre Strix Halo).
- Evaluacion y prototipado de modelos MoE en hardware AMD: util para equipos que quieran medir el rendimiento real de un MoE de 30B/3B activos en gfx1151 o gfx1201 antes de comprometerse con un despliegue mayor.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700 de 32 GB: el paquete permite servir el modelo con un limite de memoria de 34.000.000.000 bytes y 136.192 tokens por peticion, adecuado para un puesto de trabajo individual o un equipo pequeno.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa frente a llama.cpp ROCm para Strix Halo (gfx1151) en la que las columnas de llama.cpp, Loom y margen aparecen como "—" (no medidas); solo se publican los valores de roofline, que son el techo teorico del hardware, no mediciones del modelo. Se reproducen a continuacion tal cual, con la advertencia de que no son resultados de rendimiento observados.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| decode tok/s, prompt corto | — | — | — | 112,5 | — |
| decode tok/s, contexto 2k | — | — | — | 102,1 | — |
| decode tok/s, contexto 32k | — | — | — | 42,6 | — |
| prefill tok/s, documento 1k | — | — | — | 10.078,2 | — |
| prefill tok/s, documento 2k | — | — | — | 9.443,9 | — |
| prefill tok/s, documento 8k | — | — | — | 6.855,1 | — |
| prefill tok/s, documento 16k | — | — | — | 5.020,2 | — |
| prefill tok/s, documento 32k | — | — | — | 3.269,8 | — |
| 4 streams, decode agregado tok/s | — | — | — | 400,8 | — |
| decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete fija el pool de memoria con `--memory_bytes`; la configuracion publicada usa 63.000.000.000 bytes en Strix Halo y 34.000.000.000 bytes en Radeon AI PRO R9700 (32 GB). El checkpoint es Q4_K_M, por lo que el peso de los pesos ronda los 18-19 GB, aunque la informacion disponible no desglosa el consumo exacto.
- GPU soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU NVIDIA en este paquete; el runtime es especifico de AMD.
- Cabe en GPU de consumo profesional AMD con memoria unificada o 32 GB de VRAM; no se garantiza en GPUs de consumo con menos memoria.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; expone un endpoint compatible con OpenAI en `127.0.0.1:8080`.
- No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto; llama.cpp ROCm se usa unicamente como referencia de comparacion en la model card.
- Latencia y throughput: solo se publican los valores de roofline (techo teorico) recogidos en la tabla anterior; no hay mediciones reales de Loom ni de llama.cpp en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (este paquete, Loom) | 30B | ~3B | 262.144 (136.192 en R9700) | Apache 2.0 | GGUF Q4_K_M + runtime Loom, solo AMD gfx1151/gfx1201 | Paquete de staging, 0 descargas, sin benchmarks de calidad publicados |
| Qwen3-30B-A3B-Instruct-2507 (GGUF de Unsloth) | 30B | ~3B | 262.144 | Apache 2.0 | GGUF para llama.cpp y otros runtimes | Checkpoint de origen, sin modificaciones |
| Qwen3-30B-A3B-Instruct-2507 (pesos originales) | 30B | ~3B | 262.144 | Apache 2.0 | safetensors, transformers, vLLM, TGI | Referencia upstream de Alibaba Qwen; no se detallan cifras en la informacion disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- El repositorio es un espacio de staging (`loom-fun-staging`) con 0 descargas y 0 likes; no debe tratarse como una publicacion estable ni como canal recomendado de distribucion.
- Los pesos son los del GGUF de Unsloth sin modificar; cualquier limitacion del modelo base Qwen3-30B-A3B-Instruct-2507 (sesgos, alucinacion, calidad en idiomas distintos del ingles y el chino) se hereda integramente.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`) no se han vuelto a ejecutar sobre este paquete: la ultima pasada fue sobre una build anterior con sha256 `ee5f7b5`, y las puertas nocturnas las re-ejecutan. No hay verificacion vigente de que la salida coincida con la referencia de llama.cpp.
- En Radeon AI PRO R9700 los resultados de rendimiento no se han vuelto a medir; las cifras de Strix Halo son roofline teorico, no mediciones.
- La ventana de contexto efectiva en R9700 queda recortada a 136.192 tokens por el limite de memoria de 34.000.000.000 bytes, frente a los 262.144 nativos.
- El limite de salida por defecto es de 4.096 tokens, lo que puede truncar respuestas largas si no se ajusta.
- Solo se soportan cuatro peticiones concurrentes; no es adecuado para servir a muchos usuarios simultaneos desde una sola instancia.
- No hay soporte declarado de vision, audio, modo thinking ni ajuste de esfuerzo de razonamiento.
- El runtime esta atado a GPUs AMD gfx1151 y gfx1201; no se documenta portabilidad a NVIDIA ni a otras arquitecturas AMD.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar por su cuenta el cumplimiento de las licencias del modelo base y del checkpoint GGUF de Unsloth, asi como de las dependencias del runtime `hrx-loom`.
- La fecha de creacion del repositorio (2026-11-14) y la ausencia de historial de descargas impiden evaluar su madurez o mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-Qwen3-30B-A3B-Instruct-2507-loom
- Checkpoint GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3-30B-A3B-Instruct-2507-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de generacion loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo base Qwen3-30B-A3B-Instruct-2507: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo base: no disponible en la informacion proporcionada
