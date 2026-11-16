# netprojects/SenseNova-6.8-Code2Video-MLX-6bit

## Resumen

SenseNova 6.8 Code2Video es un modelo agéntico de 27 000 millones de parámetros desarrollado por SenseTime (SenseNova) y afinado a partir de Qwen3.8-27B, especializado en la creación de vídeo programático: planifica una pieza audiovisual, escribe las escenas como código, las renderiza con las herramientas de la skill `code-video`, inspecciona los fotogramas resultantes y revisa su propio trabajo iteración tras iteración. La ficha que nos ocupa, `netprojects/SenseNova-6.8-Code2Video-MLX-6bit`, es una conversión no oficial a MLX publicada por NetProjects (Internet Projects Ltd), pensada para ejecutarse en Apple Silicon.

La conversión cuantiza el modelo de lenguaje a 6 bits (afín, grupo de 64) y mantiene la torre de visión en bf16, con un peso total de 22,8 GB en el repositorio. Conserva el escalado YaRN (factor 2) del config original, de modo que el contexto largo funciona igual que en el modelo de referencia; el checkpoint upstream no incluye cabeza de predicción multi-token (MTP), por lo que estas builds tampoco la tienen.

Su relevancia es doble: por un lado, ofrece una vía práctica de ejecutar localmente en un Mac un modelo multimodal de 27B con soporte de tool calling y contexto largo; por otro, el autor publica métricas de paridad frente a bf16 sobre trayectorias agénticas reales, lo que permite decidir con datos si la cuantización de 6 bits es suficiente para producción. La licencia es Apache-2.0, igual que el modelo original y Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B; sin cabeza MTP |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | contexto largo con YaRN factor 2; verificado retrieval exacto en prompt de 65.586 tokens (build 8-bit) |
| Tipos de cuantizacion | 6-bit afín grupo 64 (LM) + bf16 (torre de visión); builds alternativas 4-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 27B afinado desde Qwen3.8-27B por SenseTime para la tarea de generación de vídeo mediante código. La parte de lenguaje emplea el tokenizador y el formato de tool calls de Qwen3 (`<tool_call>`), y la parte visual es una torre de visión que permite al modelo revisar fotogramas renderizados y corregir el resultado. El checkpoint upstream no incluye cabeza de predicción multi-token (MTP), lo que limita las optimizaciones de decodificación especulativa basadas en ese mecanismo.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos deben consultarse en la model card original de SenseNova. La innovación destacable es el bucle agéntico de code-to-video: el modelo planifica, escribe código de escenas, ejecuta herramientas de render, observa los fotogramas y revisa, apoyándose en la skill `code-video` y en guías de estilo publicadas en el repositorio GitHub de SenseNova. La conversión a MLX conserva el escalado YaRN (factor 2) del config original para mantener el comportamiento en contextos largos.

## Capacidades

- Generación de texto y razonamiento en formato conversacional multi-turno.
- Generación de código: escribe escenas y animaciones como código ejecutable.
- Creación de vídeo programático: planificación, escritura de escenas, renderizado mediante herramientas y revisión iterativa de fotogramas.
- Comprensión de imágenes: describe y evalúa fotogramas renderizados (pipeline image-text-to-text).
- Tool calling / function calling: emite bloques `<tool_call>` de Qwen3; `mlx_vlm.server` los expone como tool calls OpenAI-compatibles con `finish_reason: tool_calls`.
- Comportamiento agéntico multi-paso: bucles de planificar, actuar, observar y revisar.
- Contexto largo: recuperación exacta de un dato en un prompt de 65.586 tokens (verificado en la build 8-bit).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Motion design automatizado: el modelo planifica una pieza de tipografía cinética, escribe el código de las escenas y las renderiza con las herramientas de `code-video`, revisando los fotogramas hasta obtener el resultado deseado. Adecuado por su bucle de revisión visual.
- Vídeos explicativos y data stories: a partir de una descripción y de datos de entrada, genera escenas animadas en código; el contexto largo permite mantener la coherencia narrativa en piezas de varios minutos.
- Revisión automática de renders: se le pasa un fotograma (`--image frame.png`) y devuelve una crítica de layout, color y composición, útil como paso de control de calidad en un pipeline de render.
- Agente local en Apple Silicon: `mlx_vlm.server` expone una API de chat compatible con OpenAI con tool calls, de modo que un harness agéntico puede apuntar a un endpoint local en un Mac sin depender de la nube.
- Prototipado de pipelines de vídeo en CI/CD: la build de 6 bits (22,8 GB) cabe en un MacBook Pro de gama alta, lo que permite generar y validar escenas en local antes de escalar a producción.
- Generación de código asistida en dominios creativos: su entrenamiento en código de escenas y animación lo hace útil para escribir DSLs o scripts de render (por ejemplo, para motores de animación programática) con validación visual posterior.
- Investigación sobre cuantización agéntica: las métricas de paridad frente a bf16 publicadas por el autor permiten estudiar el impacto de 4/6/8 bits en tareas de agente de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de paridad de la cuantización frente a bf16 sobre trayectorias agénticas reales (20 turnos de asistente, hasta 16K tokens de contexto, 10.406 tokens puntuados):

| Build | Tamano | Mismo siguiente token que bf16 (turnos agénticos) | NLL vs bf16 |
|---|---|---|---|
| 8-bit | 29,5 GB | 98,3% | −0,001 |
| 6-bit | 22,8 GB | 96,8% | ±0,000 |
| 4-bit | 16,1 GB | 91,7% | +0,032 |
| bf16 | 54,7 GB | referencia | referencia |

Paridad de token sobre 12 prompts fijos (878 posiciones con teacher forcing): 99,1% (8-bit), 98,7% (6-bit) y 97,3% (4-bit). Contexto largo: retrieval exacto de un dato en un prompt de 65.586 tokens en la build de 8 bits. Tool calls: una petición con esquema de herramienta devuelve un `<tool_call>` bien formado con función y argumentos correctos (8-bit); en 6-bit, `mlx_vlm.server` devuelve la misma petición como tool call OpenAI parseada.

## Requisitos de hardware

- VRAM/unified memory estimada: 22,8 GB de pesos en la build de 6 bits; hay que sumar el espacio para KV cache y activaciones, por lo que se recomienda un equipo con 32 GB o más de memoria unificada.
- Builds alternativas: 4-bit (16,1 GB), 8-bit (29,5 GB) y bf16 (54,7 GB).
- GPU: exclusivamente Apple Silicon (MLX). Verificado en un MacBook Pro M5 Max de 128 GB. No es compatible con CUDA ni con GPUs NVIDIA (A100, H100, RTX 4090) en este formato.
- Cabe en consumer hardware Apple: sí, en Macs con memoria unificada suficiente (M-series Pro/Max/Ultra).
- Despliegue: `mlx-vlm >= 0.7.11` para generación (`mlx_vlm.generate`) y servidor (`mlx_vlm.server`, API compatible con OpenAI y tool calls). No aplica vLLM, llama.cpp, Ollama ni TGI para estos pesos MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/SenseNova-6.8-Code2Video-MLX-6bit | 27,36B | largo con YaRN factor 2 (verificado 65.586 tokens en 8-bit) | MLX safetensors 6-bit | Apache-2.0 | Conversion no oficial para Apple Silicon; paridad 96,8% con bf16 en turnos agenticos |
| sensenova/SenseNova-6.8-Code2Video (original) | 27B | largo con YaRN factor 2 | safetensors bf16 | Apache-2.0 | Modelo de referencia de SenseTime; incluye skill, guias y trayectorias |
| netprojects/SenseNova-6.8-Code2Video-MLX-8bit | 27,36B | idem | MLX safetensors 8-bit | Apache-2.0 | 29,5 GB; paridad 98,3% con bf16 |
| netprojects/SenseNova-6.8-Code2Video-MLX-4bit | 27,36B | idem | MLX safetensors 4-bit | Apache-2.0 | 16,1 GB; paridad 91,7%, deriva mas en turnos largos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas estándar con modelos de la misma categoría; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Conversión no oficial: publicada por NetProjects, sin afiliación con SenseTime ni Alibaba Cloud; no debe tratarse como build de referencia.
- Solo Apple Silicon: los pesos MLX no se pueden ejecutar en GPUs NVIDIA ni en CPUs x86 sin conversión adicional.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; el autor recomienda ejecutar el código generado en un sandbox controlado y revisar los renders antes de publicarlos.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe más allá de lo que herede de Qwen3.8-27B.
- Sin cabeza MTP: no se pueden aplicar optimizaciones de decodificación especulativa basadas en predicción multi-token.
- La cuantización de 4 bits deriva más de bf16 en turnos agénticos largos (91,7% de coincidencia); para producción se recomienda 6 u 8 bits.
- Contexto largo verificado solo en la build de 8 bits (65.586 tokens); en 6 bits no se documenta una prueba equivalente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` con la atribución a SenseTime SenseNova y Alibaba Cloud.
- Rendimiento y latencia en hardware distinto al M5 Max de 128 GB no documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub de SenseNova (skill, guías y prompts): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Build 8-bit: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-bf16
- Otro modelo de SenseNova en MLX: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
