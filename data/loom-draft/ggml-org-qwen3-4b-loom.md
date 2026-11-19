# loom-draft/ggml-org-Qwen3-4B-loom

## Resumen

`loom-draft/ggml-org-Qwen3-4B-loom` es un paquete de despliegue para el runtime AMD Loom (parte del ecosistema ROCm/hrx-system) que empaqueta el checkpoint GGUF sin modificar `Qwen3-4B-Q4_K_M.gguf` de `ggml-org/Qwen3-4B-GGUF`. No se trata de un modelo nuevo ni de un fine-tune: el autor (loom-draft) ha generado, mediante la herramienta `loom-next`, un conjunto de programas `.loom` y una tarjeta `model.json` que permiten servir el modelo Qwen3-4B cuantizado en Q4_K_M sobre GPUs AMD concretas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés del paquete es de infraestructura, no de modelado: ofrece una alternativa a llama.cpp para ejecutar Qwen3-4B en hardware AMD, con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y modo de razonamiento (thinking) activable o desactivable. El paquete declara 40.960 tokens de contexto por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida según el preset.

La relevancia actual es limitada y hay que ser explícito: el repositorio tiene 0 descargas y 0 likes, se creó y actualizó el mismo día (2026-11-19) y la propia model card indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) "no se han vuelto a medir todavía" en ambas GPUs. Es, por tanto, un artefacto en estado de borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B); el paquete no redefine la arquitectura, solo la envuelve en programas Loom |
| Parametros totales | 4B (heredados de Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens por petición (según la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF), único checkpoint empaquetado |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3-4B-Q4_K_M.gguf`) más programas `.loom` generados y `weights.loom` |
| Modelo base | ggml-org/Qwen3-4B-GGUF |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`, `loom-serve`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones concurrentes |
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | Estilo OpenAI `/v1/chat/completions` |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el modelo. Reutiliza el checkpoint Qwen3-4B en cuantización Q4_K_M publicado por `ggml-org` y genera, con `loom-next` (el generador, sin LLM en el bucle), programas `.loom` específicos para las arquitecturas GPU gfx1151 y gfx1201. La tarjeta incluye `tokenizer.json`, `llm_config.json` (configuración desde la que se generaron los programas), `info.json` (mediciones, evidencia de puertas y versiones) y `model.json`/`model.json.lock` con los ficheros fuente fijados por sha256, verificados por `loom-fetch`.

No se proporcionan en la información disponible detalles sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones del modelo base Qwen3-4B. El paquete tampoco implementa decodificación especulativa (marcada como "not applicable") ni decodificación con esfuerzo de razonamiento configurable ("reasoning effort: not applicable"). La innovación, si existe, es del runtime Loom: generación de kernels y programas para GPUs AMD con verificación por puertas de corrección frente a una referencia de llama.cpp sobre el mismo GGUF.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de contextos largos: 40.960 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del modelo base Qwen3-4B, no documentadas aquí).
- Sin entrada de imagen, sin audio de entrada/salida y sin decodificación especulativa (marcados como "not applicable" en la tarjeta).
- Muestreo (`sampling`): estado "no determinado" en la tabla de características.

## Casos de uso

- Despliegue local en APU Strix Halo: servir Qwen3-4B Q4_K_M con `loom-serve` en un Ryzen AI Max+ 395 para asistentes de escritorio o demos, usando `--pool_backing=fixed` y `--parameter_mode=preload` para reservar memoria por adelantado.
- Inferencia en GPU de estación de trabajo AMD: ejecutar el mismo paquete en una Radeon AI PRO R9700 de 32 GB, donde el modelo de 4B en Q4_K_M deja margen amplio de VRAM para lotes y contexto largo.
- Automatización con tool calling: integrar el endpoint `/v1/chat/completions` en un orquestador de agentes que envíe `tools` y consuma `tool_calls`, con thinking desactivado para reducir latencia en bucles multi-turno.
- Evaluación comparativa frente a llama.cpp: usar las puertas `golden`, `compare` y `agent` de `loom-benchmark` para verificar que la salida codiciosa coincide token a token con la referencia de llama.cpp sobre el mismo GGUF.
- Prototipado de asistentes con contexto largo: procesar documentos de hasta ~40k tokens por petición (por ejemplo, resúmenes de contratos o análisis de logs) sin trocear, dentro del límite declarado.
- Servicio interno de bajo volumen: con 4 peticiones concurrentes, encaja en entornos de desarrollo, pruebas A/B de prompts o backends de herramientas internas donde no se requiere alta concurrencia.
- Validación de kernels generados: ejecutar `kernel_tests` y `logits` para comprobar la corrección numérica de los kernels Loom frente a implementaciones de referencia antes de promover el paquete a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección figuran como "not yet re-measured". No se ofrecen cifras de throughput, latencia, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 4B, por lo que los pesos ocupan del orden de 2,5 GB, pero la tarjeta no publica el consumo total del pool de memoria de Loom.
- GPU soportadas según la tarjeta: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no disponible; no se mencionan Radeon RX ni otras gfx en la información proporcionada.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch huggingface:loom-draft/ggml-org-Qwen3-4B-loom:chat --materialize=copy --output=qwen3-4b` y `loom-serve --model=qwen3-4b '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; la referencia de corrección es llama.cpp sobre el mismo GGUF.
- Latencia y throughput: no disponibles; las mediciones aún no se han repetido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/ggml-org-Qwen3-4B-loom | 4B | 40.960 tokens por petición | GGUF Q4_K_M + programas `.loom`, runtime Loom | Apache 2.0 | Paquete de despliegue para Strix Halo y R9700; sin mediciones publicadas |
| ggml-org/Qwen3-4B-GGUF | 4B | no disponible en la información proporcionada | GGUF, runtime llama.cpp | Apache 2.0 (heredada de Qwen3-4B) | Checkpoint base sin modificar del que deriva este paquete |
| Qwen3-4B (modelo original) | 4B | no disponible en la información proporcionada | safetensors y conversiones | Apache 2.0 | Modelo base; datos de entrenamiento y benchmarks no incluidos en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto en estado de borrador: 0 descargas, 0 likes, creado y actualizado el mismo día; sin evidencia de uso real.
- Ninguna puerta de corrección tiene resultados registrados ("not yet re-measured" en todas las filas y en ambas GPUs); no hay prueba publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput a partir de la tarjeta.
- Compatibilidad restringida a gfx1151 y gfx1201 según la documentación; no se garantiza funcionamiento en otras GPUs AMD ni en NVIDIA.
- Estado del muestreo marcado como "no determinado"; el comportamiento de temperatura, top_k y semilla no está verificado.
- Límite de 4 peticiones concurrentes y 4.096 tokens de salida por preset, lo que restringe cargas de producción de alto volumen.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; dependen del modelo base Qwen3-4B.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende del runtime `hrx-loom` y de la toolchain `loom-next`, cuyas condiciones no se detallan aquí.
- El resultado de las búsquedas web devuelve páginas de Loom (la herramienta de grabación de pantalla) y de la marca de ropa Loom, sin relación con este proyecto; no aportan información técnica adicional.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/ggml-org-Qwen3-4B-loom
- Modelo base en Hugging Face: https://huggingface.co/ggml-org/Qwen3-4B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
