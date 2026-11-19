# loom-draft/mradermacher-Dark-Craving-26B-A4B-v0.2-i1-loom

## Resumen

`loom-draft/mradermacher-Dark-Craving-26B-A4B-v0.2-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado automáticamente por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF`, en su cuantización Q4_K_M (`Dark-Craving-26B-A4B-v0.2.i1-Q4_K_M.gguf`). No es un modelo nuevo ni un fine-tuning: es un artefacto de empaquetado que permite servir el GGUF original sobre GPUs AMD mediante el runtime `hrx-loom` (versión 0.2.0).

El modelo subyacente, según la nomenclatura `26B-A4B`, corresponde a una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones activos por token, derivada de la familia Gemma 3 (la etiqueta `i1` es la convención de imatrix de mradermacher). El paquete está orientado explícitamente a dos aceleradores: el SoC AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU de estación de trabajo AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de esta ficha es acotada y hay que subrayarla: el repositorio tiene 0 descargas, 0 likes, 0,0 GB de tamaño y fue creado el 19 de noviembre de 2026. Las mediciones de rendimiento y las puertas de correctitud del autor figuran como «not yet re-measured» en ambas plataformas. Se trata, por tanto, de un artefacto de publicación reciente y sin validación empírica publicada, útil como referencia de despliegue en hardware AMD más que como modelo evaluado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) del modelo base `Dark-Craving-26B-A4B-v0.2`; el paquete Loom no define arquitectura propia |
| Parametros totales | ~26B (según nomenclatura `26B` del modelo base) |
| Parametros activos | ~4B (según nomenclatura `A4B` del modelo base) |
| Longitud de contexto | 201.728 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Dark-Craving-26B-A4B-v0.2.i1-Q4_K_M.gguf`) empaquetado como `.loom` + `model.json` |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Plataformas objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Sí (formato OpenAI `tools` / `tool_calls`) |
| Modo razonamiento | Sí, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}` |
| Decodificación especulativa | No aplicable |
| Entrada de imagen / audio | No determinado |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyante. Por la nomenclatura del checkpoint (`26B-A4B`) y el formato de chat con plantilla de «thinking» opcional, el modelo base se corresponde con un transformer de mezcla de expertos de la familia Gemma 3, con ~26B parámetros totales y ~4B activos por token. La etiqueta `i1` indica que la cuantización GGUF se generó con importancia matrix (imatrix) por mradermacher. No hay datos publicados en la información disponible sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO.

La innovación técnica de este repositorio no está en el modelo, sino en el empaquetado: `loom-next` genera programas `.loom` y una tarjeta `model.json` que el runtime `hrx-loom` compila y ejecuta sobre ROCm, con kernels específicos para gfx1151 y gfx1201. El paquete incluye dos presets (`chat` para Strix Halo y `chat-r9700` para R9700), opciones de gestión de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). No se documenta ningún cambio en los pesos: el GGUF es el original sin modificar.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento explícito opcional («thinking mode») activable por petición; desactivado por defecto.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`).
- Soporte de bucles agénticos multi-turno con reutilización de historial (según la puerta de correctitud `agent`, aunque sin medición publicada).
- Contexto largo de hasta 201.728 tokens por petición.
- Concurrencia de 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio y muestreo avanzado: marcados como «not determined» en la propia tarjeta del autor.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD Radeon AI PRO R9700: el preset `chat-r9700` está calibrado para 32 GB de VRAM, suficiente para el GGUF Q4_K_M de un MoE de 26B totales. Adecuado para equipos que ya trabajan sobre ROCm y quieren evitar la pila CUDA.
- Inferencia en portátiles y mini-PC con Ryzen AI Max+ 395 «Strix Halo»: el preset `chat` y la memoria unificada del SoC permiten servir el modelo sin GPU discreta, con contexto de hasta 201.728 tokens.
- Asistentes conversacionales de contexto largo: la ventana de ~200k tokens permite resumir o consultar documentación extensa en una sola petición, útil para atención al cliente con historial largo o análisis de contratos.
- Agentes con tool calling: la API OpenAI y el soporte de `tools`/`tool_calls` permiten integrar el modelo en frameworks de agentes existentes (LangChain, LlamaIndex, SDK de OpenAI) apuntando a `http://127.0.0.1:8080/v1`.
- Razonamiento con presupuesto controlado: activar `enable_thinking` solo en consultas complejas (matemáticas, planificación) y desactivarlo en el resto reduce latencia y coste, ya que el modo está apagado por defecto.
- Evaluación comparativa de runtimes AMD: el paquete incluye puertas de correctitud (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, `logits`, `decision`) que permiten contrastar la salida frente a llama.cpp con el mismo GGUF, útil para equipos que validan ROCm frente a la referencia.
- Prototipado de pipelines de CI/CD con verificación de correctitud: la puerta `agent` y `agent_think_off` permiten automatizar pruebas de regresión de tool calling en cada actualización del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del autor indica explícitamente que, tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), «the results for this package are not yet re-measured», y todas las puertas de correctitud figuran como «not yet re-measured». No hay cifras de MMLU, HumanEval, GSM8K, throughput ni latencia verificables para este paquete.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un MoE de ~26B totales ocupa aproximadamente 15-17 GB en disco y en memoria; con overhead de runtime y caché KV para 201.728 tokens, se recomienda un mínimo de 24 GB y, preferiblemente, 32 GB.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) es la plataforma de referencia del preset `chat-r9700`. El SoC AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) usa memoria unificada y es la otra plataforma soportada.
- GPU de consumo: no se documenta soporte para GPUs de consumo NVIDIA ni para Radeon RX de gama consumer; el runtime `hrx-loom` está orientado a ROCm y a los dos aceleradores citados. No hay confirmación de funcionamiento en RTX 4090 u otras.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve` (runtime propio). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto, aunque el GGUF subyacente sí podría servirse con llama.cpp por separado.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones para este paquete.
- Memoria: el preset admite `--pool_backing=fixed` (reserva el pool por adelantado) y `--parameter_mode=preload` (carga de pesos en host), pensados para controlar el uso de memoria en Strix Halo y R9700.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-Dark-Craving-26B-A4B-v0.2-i1-loom` (este) | ~26B totales / ~4B activos | 201.728 tokens | Apache 2.0 | GGUF empaquetado en `.loom` | Paquete Loom para AMD gfx1151 y gfx1201 |
| `mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF` (base directa) | ~26B totales / ~4B activos | no disponible en la información | Apache 2.0 (heredada) | GGUF | Disponible en Hugging Face; sin empaquetado Loom |
| Gemma 3 27B (referencia de familia) | 27B densos | 128k tokens (versión estándar) | Términos Gemma | safetensors, GGUF | Amplia disponibilidad; no es MoE |
| Modelos MoE de ~4B activos de la misma generación | ~4B activos | variable | variable | variable | No disponible comparación directa en la información proporcionada |

La comparación con alternativas de la misma categoría (MoE de ~26B totales y ~4B activos con contexto de ~200k) no está disponible en la información proporcionada. El paquete Loom se distingue por su integración específica con ROCm y hardware AMD, no por métricas de calidad del modelo.

## Limitaciones y advertencias

- Artefacto sin validación empírica publicada: 0 descargas, 0 likes, 0,0 GB de tamaño en el repositorio y todas las puertas de correctitud y mediciones de rendimiento marcadas como «not yet re-measured».
- No es un modelo nuevo: es un empaquetado del GGUF de mradermacher; cualquier limitación del modelo base (sesgos, alucinaciones, calidad en idiomas distintos del inglés) se hereda sin cambios.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Visión, audio y muestreo avanzado marcados como «not determined»: no se debe asumir su funcionamiento.
- Sin decodificación especulativa: no se puede reducir latencia por esta vía en este paquete.
- Dependencia de hardware AMD específico: el runtime `hrx-loom` y los presets están calibrados para gfx1151 y gfx1201; no hay soporte documentado para NVIDIA, Intel ni GPUs AMD de consumo.
- Dependencia de la versión `hrx-loom[hf]==0.2.0`: cambios de versión del runtime pueden romper la compatibilidad del paquete.
- Licencia Apache 2.0 declarada en el paquete, pero conviene verificar la licencia del modelo base (`Dark-Craving-26B-A4B-v0.2`) antes de uso comercial, ya que el paquete no la detalla.
- Contexto efectivo limitado a 4.096 tokens de salida por petición (`max_tokens` del preset), aunque la ventana de entrada sea de 201.728 tokens.
- Concurrencia máxima de 4 peticiones: no apto para servir cargas de producción de alta concurrencia sin escalado horizontal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Dark-Craving-26B-A4B-v0.2-i1-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
