# netprojects/SenseNova-6.8-Code2Video-MLX-8bit

## Resumen

SenseNova-6.8-Code2Video-MLX-8bit es una conversion a MLX del modelo SenseNova-6.8-Code2Video de SenseTime, un modelo agéntico de 27B parámetros especializado en la creación de vídeo programático: planifica una pieza audiovisual, escribe las escenas como código, las renderiza con las herramientas del skill `code-video`, inspecciona los fotogramas y revisa el resultado de forma iterativa. El modelo base es un fine-tune de Qwen3.8-27B y esta conversión, publicada por NetProjects (Internet Projects Ltd), lo adapta para su ejecución en Apple Silicon mediante la librería MLX.

La build cuantiza el modelo de lenguaje a 8 bits (afín, grupo 64) y mantiene la torre de visión en bf16, con un tamaño de repositorio de 29,5 GB y 27.356.728.560 parámetros reales en safetensors. Conserva el escalado YaRN rope (factor 2) del config original, lo que permite contextos largos; el autor verificó la recuperación exacta de un dato situado en un prompt de 65.586 tokens. El checkpoint upstream no incluye cabeza de predicción multi-token (MTP), por lo que estas builds tampoco la tienen.

Su relevancia radica en que ofrece una ruta local, en hardware de consumo Apple, para un modelo multimodal de creación de vídeo por código con soporte de tool calling y flujos agénticos multi-turno. El autor reporta una paridad del 98,3% en el siguiente token respecto a bf16 sobre turnos reales de agente, lo que sitúa esta cuantización como una alternativa práctica al checkpoint completo de 54,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), fine-tune de Qwen3.8-27B; vision tower en bf16 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | contexto largo con YaRN rope factor 2; verificado a 65.586 tokens en la build 8-bit |
| Tipos de cuantizacion | 8-bit afín, grupo 64 (LM); vision tower en bf16. Existen builds 4-bit, 6-bit y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal derivado de Qwen3.8-27B, con una torre de visión que procesa imágenes junto al texto (pipeline `image-text-to-text`). Esta conversión mantiene la torre de visión en bf16 y cuantiza únicamente el modelo de lenguaje a 8 bits con cuantización afín de grupo 64. Se conserva el escalado YaRN rope con factor 2 del config original para soportar contextos largos, y se confirma la ausencia de cabeza MTP porque el checkpoint upstream tampoco la incluye.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original. El autor de la conversión documenta que todos los ficheros de pesos de la revisión upstream coinciden con los hashes SHA-256 del Hub, y que la revisión convertida es `0f99ab0`. La innovación destacable de esta build es la cuantización MLX con verificación de paridad frente a bf16 en turnos reales de agente, no cambios arquitectónicos respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento sobre planes de vídeo, guiones y descomposición de escenas.
- Generación de código para creación de vídeo programático: motion design, tipografía cinética, explainers y data stories.
- Comprensión de imágenes: descripción de fotogramas renderizados y revisión crítica de layout y composición.
- Tool calling / function calling: emite bloques `<tool_call>` de Qwen3 con la función y argumentos correctos; `mlx_vlm.server` expone una API compatible con OpenAI que devuelve tool calls parseadas (`finish_reason: tool_calls`).
- Flujos agénticos multi-turno: planifica, escribe código, renderiza, inspecciona el resultado y revisa de forma iterativa.
- Contexto largo: recuperación exacta de información en prompts de hasta 65.586 tokens (verificado en la build 8-bit).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Creación de vídeo programático local: el modelo escribe el código de las escenas y se ejecuta en un sandbox controlado, renderizando con las herramientas del skill `code-video`; adecuado para prototipado rápido en un Mac sin depender de servicios en la nube.
- Motion design y tipografía cinética: genera planes con escenas, timing y colores (por ejemplo, una intro de 10 segundos para una palabra), y produce el código de animación correspondiente.
- Revisión automática de renders: se le pasa un fotograma como imagen y evalúa el layout, proponiendo cambios concretos; útil en bucles de control de calidad antes de publicar.
- Agentes autónomos de producción audiovisual: desplegado con `mlx_vlm.server` como endpoint local compatible con OpenAI, un harness agéntico puede encadenar planificación, escritura de código, render y revisión con tool calling.
- Explainers y data stories: a partir de una descripción textual, planifica la narrativa y genera el código de visualizaciones animadas, aprovechando su capacidad de razonamiento sobre estructura y timing.
- Asistente de desarrollo para pipelines de vídeo: integrado en herramientas locales para generar y corregir código de renderizado, con contexto largo suficiente para mantener el estado de proyectos extensos.
- Evaluación e investigación en Apple Silicon: sirve como banco de pruebas para estudiar el impacto de la cuantización 8-bit en tareas agénticas multimodales, con métricas de paridad publicadas frente a bf16.

## Benchmarks y rendimiento

El autor publica métricas de paridad de la cuantización frente a bf16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación los datos disponibles.

Paridad en 20 turnos reales de agente de las trayectorias de producción de SenseNova (`trajectories/all.openai.jsonl`), con chat template, esquemas de herramientas y hasta 16K tokens de contexto, 10.406 tokens puntuados:

| Build | Tamano | Media NLL vs bf16 | Mismo siguiente token que bf16 |
|---|---|---|---|
| 8-bit | 29,5 GB | −0,001 | 98,3% |
| 6-bit | 22,8 GB | ±0,000 | 96,8% |
| 4-bit | 16,1 GB | +0,032 | 91,7% |
| bf16 | 54,7 GB | referencia | referencia |

Paridad de token en 12 prompts fijos (878 posiciones con teacher forcing):

| Build | Mismo siguiente token que bf16 |
|---|---|
| 8-bit | 99,1% |
| 6-bit | 98,7% |
| 4-bit | 97,3% |

Otras verificaciones reportadas en un MacBook Pro M5 Max (128 GB) con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11: recuperación exacta de un dato en un prompt de 65.586 tokens (8-bit), tool call bien formada con función y argumentos correctos (8-bit), tool call parseada vía servidor OpenAI-compatible (6-bit) y descripción correcta de una imagen de prueba en las builds 4-bit, 6-bit y 8-bit.

No se han publicado resultados de benchmarks de tareas estándar en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 29,5 GB; se recomienda al menos 32 GB de memoria unificada, y 48-64 GB para trabajar con contextos largos y el servidor MLX en paralelo.
- Hardware objetivo: Apple Silicon (MLX). Verificado por el autor en un MacBook Pro M5 Max con 128 GB.
- GPU NVIDIA: no aplicable a esta build MLX; para CUDA sería necesario usar el checkpoint original o convertirlo a otro formato.
- Cabe en GPU de consumo Apple: sí, en equipos con memoria unificada suficiente (M-series con 32 GB o más); no está pensado para GPUs discretas.
- Opciones de despliegue: `mlx-vlm` (>= 0.7.11) para generación, `mlx_vlm.server` como endpoint local con API compatible con OpenAI y tool calls. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato MLX.
- Latencia y throughput: no disponibles; el autor no publica cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/SenseNova-6.8-Code2Video-MLX-8bit | 27,36B | largo (YaRN factor 2; verificado 65.586 tokens) | MLX safetensors, Apple Silicon | Apache-2.0 | Hugging Face, 0 descargas |
| netprojects/SenseNova-6.8-Code2Video-MLX-6bit | 27,36B (aprox.) | igual | MLX safetensors, 22,8 GB | Apache-2.0 | Hugging Face; recomendada por el autor |
| netprojects/SenseNova-6.8-Code2Video-MLX-bf16 | 27,36B (aprox.) | igual | MLX safetensors, 54,7 GB | Apache-2.0 | Hugging Face; referencia de paridad |
| sensenova/SenseNova-6.8-Code2Video | 27B (aprox.) | igual | checkpoint original (no MLX) | Apache-2.0 | Hugging Face |

Las builds 4-bit, 6-bit, 8-bit y bf16 del mismo autor permiten ajustar el equilibrio entre tamaño y fidelidad: la 6-bit es la recomendada para trabajo agéntico por su paridad con bf16 y menor huella, mientras que la 8-bit prioriza la fidelidad (98,3% de mismo token). No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon mediante MLX; no es desplegable en GPUs NVIDIA ni en stacks como vLLM, llama.cpp, Ollama o TGI.
- La cuantización 8-bit introduce una desviación mínima pero no nula frente a bf16 (media NLL −0,001; 98,3% de mismo siguiente token en turnos de agente).
- El código generado debe ejecutarse en un sandbox controlado y los renders revisarse antes de publicarse, según indica el propio autor.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, no evaluados aquí.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingüe.
- Sin cabeza MTP: no se puede usar decodificación especulativa basada en predicción multi-token con este checkpoint.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE atribuye a SenseTime SenseNova y Alibaba Cloud; conviene revisar las condiciones del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- El autor no está afiliado a SenseTime ni a Alibaba Cloud; la conversión es de terceros.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-8bit
- Build 6-bit recomendada: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Build 4-bit: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-bf16
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub de SenseNova (skill, guías y prompts): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Otro modelo del autor en MLX: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
