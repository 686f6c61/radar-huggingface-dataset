# loom-fun-staging/ggml-org-Qwen3.6-27B-loom

## Resumen

`loom-fun-staging/ggml-org-Qwen3.6-27B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `ggml-org/Qwen3.6-27B-GGUF`, en su cuantizacion `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado generado con el flujo de trabajo `loom-skills` que permite servir el modelo Qwen3.6-27B sobre las GPU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el servidor `loom-serve`, que expone una API compatible con OpenAI.

El modelo subyacente es Qwen3.6-27B, un transformer multimodal de 27 000 millones de parametros con soporte de vision (pipeline `image-text-to-text`), ventana de contexto nativa de 262 144 tokens y modo de razonamiento activado por defecto. El paquete anade decodificacion especulativa DFlash con profundidad 3 y un proyector multimodal `mmproj-Qwen3.6-27B-BF16.gguf`. Su relevancia es de infraestructura: demuestra la viabilidad de ejecutar un modelo de 27B en cuantizacion Q4_K_M sobre hardware AMD de consumo y estaciones de trabajo, con soporte de tool calling, entrada de imagenes y concurrencia de 4 peticiones.

La ficha publica tiene 0 descargas y 0 likes, fue creada el 14 de noviembre de 2026 y no declara licencia ni idiomas soportados. La informacion disponible sobre el modelo base es limitada: la model card se centra en el rendimiento del motor Loom frente a llama.cpp ROCm, no en las caracteristicas del modelo Qwen subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles del modelo base no disponibles |
| Parametros totales | 27 000 millones (27B, segun denominacion del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens por peticion; en Radeon AI PRO R9700 hasta 166 912 tokens por limite de memoria |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen3.6-27B-Q4_K_M.gguf`) + paquete Loom (`.loom`, `model.json`) + `mmproj-Qwen3.6-27B-BF16.gguf` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura interna ni el entrenamiento del modelo Qwen3.6-27B subyacente. Lo que si se documenta es la capa de ejecucion: `loom-serve` genera kernels especificos para las GPU AMD objetivo (gfx1151 para Strix Halo y gfx1201 para Radeon AI PRO R9700) y los valida contra implementaciones de referencia mediante compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`). El checkpoint GGUF se usa sin modificaciones.

La innovacion tecnica destacable del paquete es la decodificacion especulativa DFlash con profundidad 3, activada por defecto, usando el drafter `Anbeeld/Qwen3.6-27B-DFlash-GGUF`. Segun la model card, la tasa de aceptacion de tokens redactados medida fue del 42 % en decodificacion de contexto corto, 40 % a 2k tokens de contexto y 45 % a 32k. El servidor admite espera activa (`completion_spin_ns=4294967295`), concurrencia de 4 peticiones y un limite configurable de memoria (`--memory_bytes`) que determina el contexto maximo servible en cada GPU. No se dispone de datos sobre tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagenes mediante partes `image_url` al estilo OpenAI, con proyector `mmproj-Qwen3.6-27B-BF16.gguf`.
- Tool calling / function calling con `tools` y `tool_calls` al estilo OpenAI.
- Decodificacion especulativa DFlash (profundidad 3) para acelerar la generacion.
- Servidor con API compatible con OpenAI: `/v1/chat/completions` en `127.0.0.1:8080`.
- Parametros de muestreo: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de salida de 4096 tokens por peticion (preset `max_tokens`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio: no soportado (marcado como "not applicable").
- Ajuste de esfuerzo de razonamiento: no disponible (marcado como "not applicable").

## Casos de uso

- Despliegue local de un asistente multimodal en estaciones de trabajo AMD: el paquete permite servir Qwen3.6-27B en cuantizacion Q4_K_M sobre una Radeon AI PRO R9700 con 32 GB, con hasta 166 912 tokens de contexto por peticion, adecuado para analisis de documentos largos e imagenes en entornos sin GPU NVIDIA.
- Procesamiento de documentos extensos: con 262 144 tokens de contexto nativo en Strix Halo, el modelo puede ingerir informes, expedientes o bases de codigo completas en una sola peticion, aunque el preset de salida limita la respuesta a 4096 tokens.
- Automatizacion de agentes con tool calling: la API compatible con OpenAI permite conectar el modelo a frameworks de agentes existentes que usan `tools` y `tool_calls`, ejecutando flujos multi-paso sobre el servidor local.
- Analisis de imagenes en pipelines internos: la entrada `image_url` habilita tareas de descripcion, extraccion de datos o verificacion visual sin enviar imagenes a servicios externos, util en entornos con requisitos de privacidad.
- Prototipado e investigacion en hardware AMD: investigadores que trabajen con ROCm pueden usar el paquete para evaluar el rendimiento de un 27B multimodal en gfx1151 y gfx1201, con compuertas de correccion que comparan la salida contra llama.cpp.
- Servicio de chat interno con concurrencia moderada: las 4 peticiones simultaneas y el modo de razonamiento configurable permiten montar un asistente para equipos pequenos con control total sobre el hardware.
- Generacion de codigo asistida: el modelo base Qwen3.6 dispone de tool calling y contexto largo, lo que permite integrarlo en asistentes de programacion que consultan repositorios y ejecutan herramientas, siempre que se valide la calidad del modelo subyacente con pruebas propias.

## Benchmarks y rendimiento

La model card publica mediciones del motor Loom frente a llama.cpp ROCm en Strix Halo (gfx1151), pero los valores de decodificacion y prefill de ambos motores aparecen como no medidos ("—"). Solo se documentan los techos teoricos (roofline) calculados para el GGUF sobre Ryzen AI Max+ 395 a 216 GB/s y 59 TFLOP/s:

| Metrica | llama.cpp | Loom | Roofline (techo) |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | no medido | no medido | 26,4 |
| Decodificacion tok/s, contexto 2k | no medido | no medido | 25,8 |
| Decodificacion tok/s, contexto 32k | no medido | no medido | 24,7 |
| Prefill tok/s, documento 1k | no medido | no medido | 1206,5 |
| Prefill tok/s, documento 2k | no medido | no medido | 1201,7 |
| Prefill tok/s, documento 8k | no medido | no medido | 1173,5 |
| Prefill tok/s, documento 16k | no medido | no medido | 1137,9 |
| Prefill tok/s, documento 32k | no medido | no medido | 1072,8 |
| 4 flujos, decodificacion agregada tok/s | no medido | no medido | 46,6 |
| Tokens redactados aceptados (especulativa) | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete configura `--memory_bytes=57000000000` (57 GB) para Strix Halo y `--memory_bytes=34000000000` (34 GB) para Radeon AI PRO R9700; este limite determina el contexto servible (166 912 tokens en R9700 frente a 262 144 nativos).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para otras GPU AMD ni para NVIDIA.
- GPU de consumo: Strix Halo es un APU de consumo/estacion de trabajo que usa memoria unificada; la R9700 es una GPU profesional de 32 GB. No se documenta compatibilidad con GPUs de consumo discretas como RX 7900 XTX.
- Despliegue: `loom-serve` del paquete `hrx-loom[hf]==0.1.0`, con descarga via `loom-fetch`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque la comparativa se hace contra llama.cpp ROCm.
- Latencia y throughput: no hay valores medidos de Loom ni de llama.cpp en la model card; solo techos roofline (26,4 tok/s de decodificacion en contexto corto, 1206,5 tok/s de prefill a 1k, 46,6 tok/s agregados con 4 flujos).
- Concurrencia: 4 peticiones simultaneas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento medidos del modelo en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales del paquete frente a alternativas de despliegue del mismo checkpoint.

| Criterio | Loom (este paquete) | llama.cpp ROCm | vLLM |
|---|---|---|---|
| Modelo | Qwen3.6-27B Q4_K_M | Qwen3.6-27B Q4_K_M | no disponible para este checkpoint GGUF |
| Hardware objetivo | Strix Halo (gfx1151), R9700 (gfx1201) | GPU AMD con ROCm | GPU NVIDIA/AMD (no confirmado) |
| Contexto por peticion | 262 144 (Strix Halo); 166 912 (R9700) | no disponible | no disponible |
| Decodificacion especulativa | DFlash, profundidad 3, por defecto | no (en la comparativa) | no disponible |
| API | OpenAI `/v1/chat/completions` | servidor propio | OpenAI compatible |
| Vision | si (`mmproj` BF16) | si (con el mismo proyector) | no disponible |
| Rendimiento medido | no publicado | no publicado | no disponible |
| Licencia | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros paquetes Loom comparables ni modelos de 27B multimodales con contexto de 262k sobre hardware AMD con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La ficha no declara licencia; no se puede confirmar el uso comercial del paquete ni del checkpoint base. La licencia del modelo Qwen3.6-27B subyacente no aparece en la informacion disponible.
- No se declaran idiomas soportados; el rendimiento multilingue es desconocido.
- Las compuertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`) no se han re-ejecutado en este paquete: la ultima pasada fue sobre una compilacion anterior (sha256 `c5549fc`) y las compuertas nocturnas las repiten. La correccion de esta version concreta no esta verificada.
- Los resultados de rendimiento en Radeon AI PRO R9700 no se han vuelto a medir; los de Strix Halo no incluyen valores de Loom ni de llama.cpp, solo techos teoricos.
- La metodologia de la comparativa reconoce diferencias entre motores: Loom usa decodificacion especulativa y llama.cpp no, y el cronometraje se hace de forma distinta (cliente vs servidor). Los margenes dentro de +-3 % se consideran empate.
- Limite de salida de 4096 tokens por peticion, lo que puede ser insuficiente para tareas de generacion larga.
- Concurrencia maxima de 4 peticiones; no es adecuado para servir a muchos usuarios simultaneos.
- El contexto maximo en R9700 queda recortado a 166 912 tokens por el limite de memoria configurado.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion proporcionada.
- El paquete esta pensado exclusivamente para hardware AMD especifico (gfx1151 y gfx1201); no se garantiza su funcionamiento en otras GPU.
- La ficha tiene 0 descargas y 0 likes y fue creada en noviembre de 2026, lo que sugiere un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Qwen3.6-27B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.6-27B-GGUF
- Drafter de decodificacion especulativa: https://huggingface.co/Anbeeld/Qwen3.6-27B-DFlash-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
