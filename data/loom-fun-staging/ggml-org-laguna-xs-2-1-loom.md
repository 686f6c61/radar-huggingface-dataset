# loom-fun-staging/ggml-org-Laguna-XS-2.1-loom

## Resumen

Laguna-XS-2.1 es un modelo de lenguaje publicado originalmente por ggml-org en formato GGUF (checkpoint `Laguna-XS-2.1-Q4_K_M.gguf`). La ficha que nos ocupa no es el modelo en sí, sino un paquete de despliegue empaquetado por el usuario `loom-fun-staging` para el runtime AMD Loom, orientado a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye programas `.loom` y un `model.json` que describen cómo servir el GGUF sin modificarlo.

La relevancia de este artefacto es operativa: demuestra el flujo de trabajo `loom-skills` para generar paquetes servibles con API compatible con OpenAI (`/v1/chat/completions`), tool calling, modo de razonamiento opcional y decodificación especulativa DFlash de profundidad 3 con un drafter separado. El modelo subyacente es de tipo mixture-of-experts (MoE), según se deduce de la metodología de roofline del propio autor, con una longitud de contexto nativa de 262.144 tokens.

No se dispone de datos sobre el número de parámetros, la composición del dataset de entrenamiento, los idiomas soportados ni la licencia del checkpoint base en la información proporcionada. El paquete está pensado exclusivamente para hardware AMD con el runtime Loom, no para llama.cpp ni para GPU NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo mixture-of-experts (MoE), según la metodología de roofline del autor; detalles no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición (nativa); en Radeon AI PRO R9700 limitada a 72.704 tokens por el pool de memoria |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Laguna-XS-2.1-Q4_K_M.gguf`) empaquetado como artefacto Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El checkpoint base es un GGUF cuantizado a Q4_K_M de un modelo denominado Laguna-XS-2.1. La información disponible indica que se trata de un modelo de mezcla de expertos (MoE): la sección de roofline del paquete asume explícitamente que "las cuatro secuencias se enrutan a los mismos expertos" al calcular el techo de rendimiento agregado de 4 streams, lo que confirma la presencia de enrutamiento por expertos. No se proporcionan detalles sobre el número de capas, dimensión oculta, número de expertos, tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

El paquete Loom añade una capa de ejecución específica para AMD: kernels generados y validados contra implementaciones de referencia (`kernel_tests`), comparación token a token con la salida de llama.cpp sobre el mismo GGUF (`golden` y `compare`), y decodificación especulativa DFlash con profundidad 3 y un drafter independiente (`dev7a/Laguna-XS-2.1-DFlash-GGUF`). El servidor expone una API compatible con OpenAI y permite activar el modo de razonamiento mediante `chat_template_kwargs: {"enable_thinking": true}`.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" opcional (desactivado por defecto).
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`).
- Decodificación especulativa DFlash activada por defecto, con profundidad 3 y drafter separado.
- Contexto largo: hasta 262.144 tokens por petición en Strix Halo; hasta 72.704 tokens en Radeon AI PRO R9700 por límite de memoria.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida máxima de 4.096 tokens mediante el preset `max_tokens`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Sin soporte de imagen ni de audio (marcado como "not applicable" en la model card).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con AMD Strix Halo: el paquete permite servir el modelo con `loom-serve` sobre la iGPU gfx1151 con un pool de memoria de 81 GB, adecuado para prototipado y pruebas de integración sin depender de GPU discretas.
- Servicio en Radeon AI PRO R9700: con 32 GB de VRAM y `--memory_bytes=34000000000`, el modelo atiende peticiones de hasta 72.704 tokens, suficiente para asistentes de documentación técnica y análisis de repositorios medianos.
- Automatización de agentes con tool calling: la API compatible con OpenAI y el soporte de `tool_calls` permiten integrar el modelo en frameworks de agentes existentes (LangChain, LlamaIndex, etc.) sin adaptadores personalizados.
- Procesamiento de documentos largos: la ventana de 262.144 tokens en Strix Halo permite resumir, extraer entidades o responder preguntas sobre contratos, informes o bases de código extensas en una sola petición.
- Razonamiento con esfuerzo controlado: el modo `enable_thinking` permite activar cadena de pensamiento para tareas de matemáticas o lógica y desactivarlo para respuestas de baja latencia en producción.
- Servicio multiusuario ligero: los 4 streams concurrentes con decodificación agregada (techo de 322,4 tok/s en Strix Halo) permiten atender a un pequeño equipo interno con una sola máquina.
- Evaluación comparativa de runtimes: el paquete incluye puertas de corrección (`golden`, `compare`) que permiten verificar la fidelidad del runtime Loom frente a llama.cpp sobre el mismo GGUF, útil para equipos que validan portabilidad de inferencia en AMD.

## Benchmarks y rendimiento

Los datos publicados corresponden al techo de roofline calculado por el autor para Strix Halo (216 GB/s, 59 TFLOP/s), no a mediciones directas de Loom ni de llama.cpp: las columnas de ambos runtimes aparecen como "no medidas" en la tabla original. Se reproducen los valores de roofline tal cual.

| Métrica | llama.cpp | Loom | Roofline (techo) |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 62,9 |
| Decode tok/s, contexto 2k | no medido | no medido | 54,7 |
| Decode tok/s, contexto 32k | no medido | no medido | 58,3 |
| Prefill tok/s, documento 1k | no medido | no medido | 10.055,9 |
| Prefill tok/s, documento 2k | no medido | no medido | 9.763,7 |
| Prefill tok/s, documento 8k | no medido | no medido | 8.397,6 |
| Prefill tok/s, documento 16k | no medido | no medido | 7.077,2 |
| Prefill tok/s, documento 32k | no medido | no medido | 5.384,2 |
| 4 streams, decode agregado | no medido | no medido | 322,4 |
| Tokens aceptados en decodificación especulativa | n/a | n/a | n/a |

Metodología declarada por el autor: comparación contra llama.cpp ROCm (build no registrada) con el mismo GGUF, mismo runner DevLab y mismos prompts; Loom servido con espera activa. Las filas de un solo stream usan DFlash profundidad 3 en Loom y sin drafting en llama.cpp (elección distinta entre motores). Los 4 streams se ejecutan sin drafting en ambos. La aceptación del drafter medida fue del 4 % en decode corto y del 1 % a 2k de contexto. Los runners DevLab varían entre sesiones. Para Radeon AI PRO R9700 los resultados no se han vuelto a medir.

## Requisitos de hardware

- VRAM/pool de memoria: 81 GB configurados para Strix Halo (`--memory_bytes=81000000000`); 34 GB para Radeon AI PRO R9700 (`--memory_bytes=34000000000`).
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para NVIDIA ni para otras GPU AMD.
- GPU de consumo: no disponible; el paquete está orientado a iGPU Strix Halo y a la R9700 profesional, no a tarjetas de consumo convencionales.
- Despliegue: exclusivamente mediante el runtime Loom (`pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch`, `loom-serve`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Servidor: escucha en `127.0.0.1:8080` y responde a peticiones estilo OpenAI.
- Throughput: techos de roofline de 62,9 tok/s en decode corto y 322,4 tok/s agregados con 4 streams en Strix Halo; no hay mediciones reales publicadas.
- Latencia: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia, tamaño o tarea en la documentación proporcionada. El único punto de comparación explícito es el propio GGUF servido con llama.cpp ROCm, frente al cual el autor plantea la comparación de rendimiento (sin valores medidos en la tabla publicada).

| Modelo | Parámetros | Contexto | Licencia | Runtime |
|---|---|---|---|---|
| Laguna-XS-2.1 (paquete Loom) | no disponible | 262.144 (72.704 en R9700) | no disponible | Loom (AMD) |
| Laguna-XS-2.1 (GGUF original de ggml-org) | no disponible | no disponible | no disponible | llama.cpp y otros compatibles GGUF |
| Alternativas de misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete está atado al runtime Loom y a hardware AMD concretos (gfx1151 y gfx1201); no es portable a otras GPU ni a otros motores de inferencia.
- La licencia del checkpoint base no está indicada, por lo que no puede confirmarse el uso comercial.
- No hay datos publicados sobre sesgos, idiomas soportados ni calidad multilingüe.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`) no se han vuelto a ejecutar sobre este paquete; el último pase corresponde a un build anterior (sha256 `1908184`).
- Los benchmarks publicados son techos de roofline, no mediciones reales de Loom ni de llama.cpp; las columnas de ambos motores están vacías en la tabla original.
- La comparación de rendimiento usa configuraciones distintas de drafting entre motores (DFlash activo en Loom, desactivado en llama.cpp), lo que invalida una comparación directa de tok/s.
- En Radeon AI PRO R9700 el contexto efectivo se reduce a 72.704 tokens por el pool de memoria de 34 GB.
- El límite de salida por defecto es de 4.096 tokens, lo que puede ser insuficiente para generaciones largas sin ajustar el preset.
- La concurrencia está limitada a 4 peticiones simultáneas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de staging sin validación comunitaria.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-fun-staging/ggml-org-Laguna-XS-2.1-loom
- Checkpoint GGUF base: https://huggingface.co/ggml-org/Laguna-XS-2.1-GGUF
- Drafter DFlash: https://huggingface.co/dev7a/Laguna-XS-2.1-DFlash-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
