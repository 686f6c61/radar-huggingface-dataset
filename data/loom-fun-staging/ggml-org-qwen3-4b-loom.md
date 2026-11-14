# loom-fun-staging/ggml-org-Qwen3-4B-loom

## Resumen

El paquete `loom-fun-staging/ggml-org-Qwen3-4B-loom` es una distribucion empaquetada del checkpoint GGUF `Qwen3-4B-Q4_K_M.gguf` de `ggml-org/Qwen3-4B-GGUF` para el runtime AMD Loom. No se trata de un modelo nuevo ni de un fine-tuning: el checkpoint subyacente es el Qwen3-4B original de Alibaba (arquitectura transformer densa, aproximadamente 4.000 millones de parametros, cuantizado a Q4_K_M) sin modificar. Lo que aporta este repositorio es el formato `.loom` (programas y una tarjeta `model.json`) generado con el flujo `loom-skills`, que permite servir el modelo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve es de despliegue: ofrece una via de ejecucion optimizada para hardware AMD integrado y de escritorio profesional, con decodificacion especulativa DFlash activada por defecto (profundidad 3, drafter `AtomicChat/Qwen3-4B-DFlash-GGUF`), servidor compatible con la API `/v1/chat/completions` de OpenAI, tool calling, modo de razonamiento y 40.960 tokens de contexto por peticion con 4 peticiones concurrentes.

Es relevante ahora porque el ecosistema Loom es muy reciente (repositorio creado el 14 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta) y porque demuestra una alternativa a llama.cpp ROCm sobre silicio AMD consumer y workstation. Las cifras de rendimiento publicadas por el autor estan incompletas: la tabla compara contra llama.cpp pero las columnas de medicion real (llama.cpp y Loom) aparecen como "no medidas", y solo se rellena la columna de roofline teorico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B, checkpoint original sin modificar) |
| Parametros totales | aproximadamente 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye `Qwen3-4B-Q4_K_M.gguf` |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados de Qwen3-4B) |
| Licencia | no disponible |
| Formato de pesos | GGUF empaquetado como programa `.loom` mas tarjeta `model.json` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Servidor | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |
| Memoria reservada en los comandos de ejemplo | `--memory_bytes=25000000000` (25 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de la familia Qwen3. La model card del paquete no documenta el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO); esa informacion corresponde a la model card oficial de Qwen3-4B, que no se incluye en la informacion proporcionada. El paquete no modifica los pesos: se limita a envolver el GGUF Q4_K_M en el formato de ejecucion de Loom.

La innovacion tecnica del paquete esta en el runtime, no en el modelo. Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y anade decodificacion especulativa DFlash con un drafter dedicado (`AtomicChat/Qwen3-4B-DFlash-GGUF`) a profundidad 3, activada por defecto. La model card incluye una metodologia de comparacion contra llama.cpp ROCm con el mismo GGUF, el mismo runner DevLab y los mismos prompts, pero los valores medidos de ambos motores no se registraron; solo se publica el techo roofline calculado con `loom-roofline` a 216 GB/s y 59 TFLOP/s. La aceptacion del drafter medida en la propia sesion fue del 31 % en decodificacion de contexto corto y del 37 % a 2k de contexto.

## Capacidades

- Generacion de texto y razonamiento: el modo de razonamiento (thinking) esta activado por defecto y se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: soporta los campos `tools` y `tool_calls` en la API de chat.
- Decodificacion especulativa DFlash con profundidad 3, activada por defecto, con el drafter `AtomicChat/Qwen3-4B-DFlash-GGUF`.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 40.960 tokens por peticion.
- Salida maxima de 4.096 tokens por peticion mediante el preset `max_tokens`.
- Sin entrada de imagen: la columna de vision figura como "not applicable".
- Sin entrada ni salida de audio: "not applicable".
- "Reasoning effort" no aplicable en esta configuracion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: servir el modelo con `loom-serve` sobre una Radeon AI PRO R9700 y exponer `/v1/chat/completions` a una interfaz interna, aprovechando los 40.960 tokens de contexto para conversaciones multi-turno largas.
- Automatizacion de agentes con tool calling: integrar el endpoint en un orquestador que envie `tools` en formato OpenAI para consultas a bases de datos o APIs internas, con el modo thinking activado para tareas de varios pasos.
- Procesamiento de documentos de hasta 32k tokens: la model card reporta pruebas de prefill con documentos de 1k a 32k tokens, lo que encaja con resumen y extraccion sobre informes extensos en un solo pase.
- Prototipado en hardware integrado Strix Halo: validar flujos de IA generativa en un Ryzen AI Max+ 395 sin GPU dedicada, usando el paquete `.loom` como sustituto de una instalacion de llama.cpp.
- Evaluacion comparativa de runtimes AMD: usar el mismo GGUF y los mismos prompts para medir Loom frente a llama.cpp ROCm en un banco de pruebas propio, dado que las cifras publicadas por el autor estan incompletas.
- Generacion de codigo asistida en local: el modelo base Qwen3-4B es adecuado para autocompletado y explicacion de fragmentos, servido en local para evitar enviar codigo propietario a la nube, siempre que se valide la calidad con pruebas propias.
- Despliegue por lotes con 4 flujos concurrentes: la configuracion admite 4 peticiones simultaneas, util para clasificacion o extraccion de datos sobre colas de documentos pequenas.

## Benchmarks y rendimiento

La model card publica una tabla comparativa contra llama.cpp ROCm, pero las columnas de medicion de llama.cpp y de Loom aparecen como "no medidas" (—). Solo se rellena la columna de roofline teorico. Se reproduce a continuacion tal cual, sin inferir valores:

| Metrica | llama.cpp | Loom | Roofline (techo teorico) |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 167,3 |
| Decode tok/s, contexto 2k | no medido | no medido | 164,5 |
| Decode tok/s, contexto 32k | no medido | no medido | 30,0 |
| Prefill tok/s, documento 1k | no medido | no medido | 7802,6 |
| Prefill tok/s, documento 2k | no medido | no medido | 7509,7 |
| Prefill tok/s, documento 8k | no medido | no medido | 6129,3 |
| Prefill tok/s, documento 16k | no medido | no medido | 4922,7 |
| Prefill tok/s, documento 32k | no medido | no medido | 3532,1 |
| 4 flujos, decode agregado tok/s | no medido | no medido | 303,7 |
| Decodificacion especulativa, tokens aceptados | no aplica | no medido | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras de roofline corresponden al techo de hardware para este GGUF en Strix Halo a 216 GB/s y 59 TFLOP/s, no a rendimiento medido. Para la Radeon AI PRO R9700, la model card indica que los resultados "no se han vuelto a medir".

## Requisitos de hardware

- VRAM estimada: los comandos de ejemplo reservan `--memory_bytes=25000000000` (25 GB) tanto en Strix Halo como en R9700; el GGUF Q4_K_M de un modelo de 4B ocupa bastante menos, pero el runtime reserva ese margen.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no hay datos de ejecucion en GPU consumer NVIDIA o AMD de gama domestica; la informacion solo cubre las dos plataformas AMD citadas.
- Despliegue: `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295`, tras instalar `hrx-loom[hf]==0.1.0` y materializar el modelo con `loom-fetch`. El servidor escucha en `127.0.0.1:8080`.
- Latencia y throughput: no disponibles como medicion real; solo existe el techo roofline de la tabla anterior. La aceptacion del drafter medida fue del 31 % (contexto corto) y del 37 % (2k de contexto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (GGUF original, `ggml-org/Qwen3-4B-GGUF`) | aproximadamente 4B | no disponible en la informacion | GGUF | no disponible | Checkpoint de referencia sin empaquetar; ejecutable con llama.cpp |
| Este paquete (`loom-fun-staging/ggml-org-Qwen3-4B-loom`) | aproximadamente 4B | 40.960 tokens por peticion | `.loom` + `model.json` | no disponible | Mismos pesos, runtime Loom para AMD gfx1151 y gfx1201, DFlash por defecto |
| llama.cpp ROCm con el mismo GGUF | aproximadamente 4B | no disponible en la informacion | GGUF | no disponible | Referencia de comparacion usada por el autor; sin cifras publicadas |

No se dispone de datos de rendimiento medido de ninguna de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a formato, plataforma y funcionalidades del runtime.

## Limitaciones y advertencias

- El paquete no aporta pesos nuevos: cualquier sesgo, riesgo de alucinacion o limitacion linguistica es el del Qwen3-4B original, que no se documenta en la informacion proporcionada.
- Las cifras de rendimiento publicadas no son mediciones: las columnas de llama.cpp y Loom estan vacias y solo se ofrece el techo roofline. No deben citarse como rendimiento real.
- La comparacion contra llama.cpp no usa la misma configuracion de decodificacion especulativa en ambos motores (Loom con DFlash profundidad 3, llama.cpp sin drafting), y los argumentos del servidor llama.cpp no se registraron.
- Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase fue sobre una compilacion anterior (sha256 `eb9a1b0`).
- Los resultados en Radeon AI PRO R9700 no se han vuelto a medir.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 14 de noviembre de 2026; es un artefacto de staging sin validacion de la comunidad.
- La licencia no esta indicada en la informacion disponible: no se puede confirmar el uso comercial sin consultar la licencia del modelo base Qwen3-4B y del runtime Loom.
- El contexto efectivo esta limitado a 40.960 tokens por peticion y la salida a 4.096 tokens; la concurrencia maxima es de 4 peticiones.
- El modelo solo se ha validado para las arquitecturas AMD gfx1151 y gfx1201; no hay soporte documentado para otras GPU.
- Los resultados de busqueda web incluidos corresponden a servicios no relacionados (Loom de grabacion de pantalla y la marca de ropa Loom) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Qwen3-4B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-4B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/AtomicChat/Qwen3-4B-DFlash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
