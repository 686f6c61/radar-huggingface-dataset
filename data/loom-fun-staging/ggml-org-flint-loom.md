# loom-fun-staging/ggml-org-Flint-loom

## Resumen

Flint es un modelo de lenguaje de tipo mixture-of-experts (MoE) distribuido originalmente en formato GGUF por el colectivo ggml-org bajo el identificador `ggml-org/Flint-GGUF`. El paquete reseñado aquí, `loom-fun-staging/ggml-org-Flint-loom`, no contiene pesos nuevos: es un empaquetado (programas `.loom` y un `model.json`) generado con el flujo de trabajo loom-skills que permite servir el checkpoint original `Flint-Q4_K_M.gguf` sin modificarlo sobre GPUs AMD concretas, en particular el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés del paquete es de infraestructura más que de modelado: demuestra el funcionamiento del runtime Loom de AMD (repositorio `ROCm/hrx-system`), que expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento siempre activo, decodificación especulativa DFlash con profundidad 3 y una ventana de contexto de 262.144 tokens por petición con hasta 4 peticiones concurrentes. El checkpoint base es un MoE cuantizado en Q4_K_M; los detalles de arquitectura, número de parámetros y datos de entrenamiento no se especifican en la información disponible.

La relevancia actual es doble: por un lado, ofrece una vía para ejecutar un MoE de contexto largo en hardware AMD de consumo y estación de trabajo sin depender de CUDA; por otro, publica una comparativa metodológica frente a llama.cpp ROCm con cifras de roofline para Strix Halo. No obstante, el paquete es un artefacto de staging con cero descargas, sin licencia declarada y con varias puertas de validación (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`) pendientes de re-ejecutar sobre esta build concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE); detalles de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publica el reparto) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Flint-Q4_K_M.gguf`) empaquetado como paquete Loom (`.loom` + `model.json`) |
| Modelo base | `ggml-org/Flint-GGUF` |
| Drafter de decodificacion especulativa | `incoai/Flint-DFlash2-GGUF` (DFlash, profundidad 3) |
| Salida maxima | 4.096 tokens (`max_tokens` preestablecido) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |

## Arquitectura y entrenamiento

El checkpoint base es un transformer con capas de mezcla de expertos (MoE), según la etiqueta `moe` de la model card. No se proporcionan datos sobre el número de capas, dimensión oculta, número de expertos, política de enrutamiento, tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación algorítmica del modelo más allá de su naturaleza MoE y de su compatibilidad con decodificación especulativa.

La contribución técnica del paquete reside en el runtime: Loom genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201, sirve el GGUF sin modificar y aplica decodificación especulativa DFlash con profundidad 3 y un drafter separado (`incoai/Flint-DFlash2-GGUF`). La model card reporta tasas de aceptación del drafter del 53 % en decodificación de contexto corto, 38 % a ~2k tokens y 44 % a ~32k tokens. El modo de razonamiento está siempre activo y no admite ajuste de esfuerzo (`reasoning effort` no aplicable). La corrección se valida con puertas comparativas contra llama.cpp (tokens greedy y top-5 log-probs en prompts cortos y documentos de 1k a 32k), aunque en esta build concreta esas puertas figuran como no re-ejecutadas.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" siempre activo.
- Tool calling y function calling con esquema OpenAI (`tools` y `tool_calls`).
- Contexto largo de hasta 262.144 tokens por petición, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Concurrencia de 4 peticiones simultáneas con consistencia verificada por la puerta `consistency` (pendiente de re-ejecución en esta build).
- Decodificación especulativa DFlash activada por defecto (profundidad 3) con el drafter `incoai/Flint-DFlash2-GGUF`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Sin entrada de imagen ni audio (no aplicable según la model card).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de código en estación de trabajo AMD: servir Flint Q4_K_M con `loom-serve` en una Radeon AI PRO R9700 (32 GB) y consumir la API OpenAI desde un IDE o CLI, aprovechando el tool calling para invocar linters, tests y comandos de shell en un bucle agéntico.
- Análisis de documentación extensa: ingerir contratos, RFCs o bases de código de hasta 262k tokens en una sola petición para extracción de entidades, resumen estructurado o preguntas y respuestas sobre el documento completo, sin troceado.
- Atención al cliente multi-turno: desplegar el endpoint `/v1/chat/completions` detrás de un gateway interno para conversaciones largas con historial persistente, apoyándose en la ventana de contexto y en las 4 peticiones concurrentes para cargas de equipo pequeño.
- Automatización de pipelines con agentes: usar el modo de razonamiento siempre activo y el tool calling para orquestar tareas de varios pasos (consulta a APIs internas, escritura de ficheros, ejecución de tests) en un runner con Strix Halo y 69 GB de memoria reservada al modelo.
- Evaluación de hardware AMD frente a llama.cpp: replicar la metodología de la model card (decode corto, decode a 2k y 32k, prefill de 1k a 32k, 4 streams agregados) para decidir entre Loom y llama.cpp ROCm en un parque de equipos Strix Halo.
- Prototipado de decodificación especulativa: medir la tasa de aceptación del drafter DFlash en dominios concretos (código, prosa técnica) y ajustar la profundidad de borrador para maximizar throughput en una GPU de 32 GB.
- Servicio interno de resumen de reuniones y notas: procesar transcripciones largas con contexto de 262k tokens y salida acotada a 4.096 tokens, integrado en herramientas tipo mensajería asíncrona.

## Benchmarks y rendimiento

La model card incluye cifras de roofline (techo teórico del hardware) para Strix Halo a 216 GB/s y 59 TFLOP/s; las columnas de llama.cpp y Loom están marcadas como no medidas (`—`), por lo que no hay comparativa real publicada en esta información.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline | Loom % del roofline |
|---|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 150,8 | — |
| Decode tok/s, contexto 2k | — | — | 122,1 | — |
| Decode tok/s, contexto 32k | — | — | 108,0 | — |
| Prefill tok/s, documento 1k | — | — | 12.248,4 | — |
| Prefill tok/s, documento 2k | — | — | 11.945,5 | — |
| Prefill tok/s, documento 8k | — | — | 10.484,7 | — |
| Prefill tok/s, documento 16k | — | — | 9.014,9 | — |
| Prefill tok/s, documento 32k | — | — | 7.040,8 | — |
| 4 streams, decode agregado tok/s | — | — | 348,3 | — |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a |

Tasas de aceptación del drafter medidas en la propia sesión: 53 % en decode corto, 38 % a 2k y 44 % a 32k. Para la Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica que los resultados "no se han vuelto a medir todavía". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria recomendada: el ejemplo de servicio reserva `--memory_bytes=69000000000` (69 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700 de 32 GB; son cotas de reserva del runtime, no el tamaño exacto de los pesos.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- ¿Cabe en GPU de consumo? Strix Halo es un APU con memoria unificada; el paquete está pensado para ese perfil y para la R9700 de 32 GB. No hay datos para GPUs de consumo discretas tipo RX 7900 o RTX 4090.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para levantar el servidor en `127.0.0.1:8080`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI para este paquete; la comparativa se hace contra llama.cpp ROCm como referencia externa.
- Throughput y latencia: solo se publican techos de roofline (hasta 150,8 tok/s de decode corto y 12.248 tok/s de prefill a 1k en Strix Halo); las cifras medidas de Loom y llama.cpp no están registradas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Flint Q4_K_M (este paquete) | no disponible (MoE) | 262.144 | GGUF + paquete Loom | no disponible | Runtime Loom para AMD gfx1151/gfx1201; tool calling; thinking siempre activo; DFlash depth 3 |
| `ggml-org/Flint-GGUF` (checkpoint base) | no disponible (MoE) | no disponible | GGUF | no disponible | Mismo modelo sin empaquetar; sirve de referencia para llama.cpp y otros runners |
| llama.cpp ROCm (runtime, no modelo) | n/a | n/a | n/a | n/a | Motor de referencia en la comparativa; build y argumentos del servidor no registrados |

No se dispone de información sobre otros modelos de la misma familia o tamaño con la que establecer una comparación de parámetros, contexto o rendimiento. Los datos de la comparativa Loom frente a llama.cpp están sin medir en la model card.

## Limitaciones y advertencias

- Artefacto de staging: 0 descargas, 0 likes, creado y actualizado el mismo día; no es una release estable.
- Licencia no declarada: no se puede asumir uso comercial; hay que consultar la licencia del checkpoint base `ggml-org/Flint-GGUF` antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Puertas de corrección no re-ejecutadas en esta build: `kernel_tests`, `golden`, `compare`, `consistency` y `spec` figuran como pendientes (la última pasada fue sobre la build `2798311`); no hay verificación de equivalencia frente a llama.cpp para este paquete concreto.
- Sin mediciones de rendimiento reales: las columnas de llama.cpp y Loom están vacías; solo hay techos de roofline. La comparativa 4 streams asume que las cuatro peticiones enrutan a los mismos expertos, una cota superior teórica.
- La comparativa de decodificación especulativa usa configuraciones distintas en cada motor (Loom con DFlash depth 3, llama.cpp sin drafting), por lo que no es una comparación homogénea.
- Sin soporte de visión ni audio; sin ajuste de esfuerzo de razonamiento (siempre activo), lo que puede incrementar latencia y coste en tareas simples.
- Salida máxima limitada a 4.096 tokens por petición y concurrencia limitada a 4 peticiones; puede ser insuficiente para cargas de producción multiusuario.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Dependencia de hardware AMD específico (gfx1151, gfx1201); no hay soporte documentado para otras GPUs.
- El paquete reserva 69 GB en Strix Halo y 34 GB en R9700; en equipos con menos memoria unificada o VRAM el servicio puede no arrancar.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Flint-loom
- Checkpoint base: https://huggingface.co/ggml-org/Flint-GGUF
- Drafter de decodificación especulativa: https://huggingface.co/incoai/Flint-DFlash2-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
