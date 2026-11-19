# loom-draft/unsloth-Qwen3-VL-4B-Thinking-loom

## Resumen

`loom-draft/unsloth-Qwen3-VL-4B-Thinking-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `unsloth/Qwen3-VL-4B-Thinking-GGUF`, en su cuantización `Q4_K_M`. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que traduce los pesos originales de Qwen3-VL-4B-Thinking a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, Qwen3-VL-4B-Thinking, pertenece a la familia Qwen3-VL de Alibaba Qwen: un modelo multimodal de 4 000 millones de parámetros que acepta texto e imágenes y opera en modo "thinking" siempre activado. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, entrada de imagen mediante el proyector `mmproj-BF16.gguf` y una ventana de contexto declarada de 262 144 tokens por petición, con hasta 4 peticiones concurrentes.

Su relevancia es acotada pero específica: permite ejecutar un VLM de 4B con contexto muy largo y razonamiento explícito sobre hardware AMD consumer y profesional sin depender de CUDA, usando un stack propio (hrx-loom 0.2.0) en lugar de llama.cpp. La tarjeta, sin embargo, no incluye todavía mediciones de rendimiento ni resultados de las puertas de corrección, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con modo thinking; empaquetado como programas Loom generados por loom-next |
| Parametros totales | 4B (modelo base Qwen3-VL-4B-Thinking) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` + `weights.loom`; tokenizer en `tokenizer.json`; configuración en `llm_config.json` |
| Salida máxima | 4 096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B-Thinking, un transformer multimodal de la familia Qwen3-VL que procesa entradas de texto e imagen y genera razonamiento explícito en modo thinking permanente. El paquete Loom no altera los pesos: toma el GGUF `Qwen3-VL-4B-Thinking-Q4_K_M.gguf` de Unsloth y genera, mediante `loom-next` (el generador, sin LLM en el bucle), un conjunto de programas `.loom` y un archivo `weights.loom` que el runtime `loom-serve` ejecuta sobre GPUs AMD. La cadena de herramientas verifica la integridad de los ficheros fuente mediante SHA-256 en `model.json.lock`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. Tampoco se documentan innovaciones de decodificación: la tarjeta indica explícitamente que la decodificación especulativa no es aplicable y que el "reasoning effort" no aplica porque el thinking está siempre activo. El paquete sí incorpora parámetros de ejecución propios del runtime, como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva previa del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).

## Capacidades

- Generación de texto y razonamiento con modo thinking siempre activado (no desactivable mediante parámetro de esfuerzo).
- Entrada de imagen: soporta partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-BF16.gguf`.
- Tool calling / function calling al estilo OpenAI, con campos `tools` y `tool_calls`.
- Bucles de agente multi-turno con tool calling, incluida una puerta de corrección específica (`agent`) y otra con thinking desactivado (`agent_think_off`).
- Ventana de contexto de 262 144 tokens por petición, adecuada para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia verificable entre ejecuciones concurrentes y aisladas.
- Salida limitada a 4 096 tokens por respuesta según el preset.
- No soporta audio ni entrada/salida de voz.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: con 262 144 tokens de contexto, el modelo puede ingerir informes, contratos o manuales completos junto con sus figuras y responder preguntas sobre ellos en una sola petición, sin trocear el contenido.
- Automatización de soporte técnico con capturas de pantalla: el cliente adjunta una imagen de un error y el modelo, gracias a la entrada `image_url` y al modo thinking, razona sobre el texto visible y propone pasos de resolución en conversaciones multi-turno.
- Agentes de extracción de datos estructurados: mediante tool calling al estilo OpenAI, el modelo puede invocar funciones que consulten bases de datos o APIs internas y encadenar varias llamadas en un bucle de agente, con historial reutilizado entre turnos.
- Despliegue en estaciones de trabajo AMD sin CUDA: el paquete está pensado para Strix Halo y Radeon AI PRO R9700, por lo que encaja en entornos donde no hay GPUs NVIDIA y se quiere servir un VLM vía API compatible con OpenAI usando `loom-serve`.
- Prototipado de asistentes con razonamiento visible: al estar el thinking siempre activo, resulta útil para generar trazas de razonamiento en tareas de clasificación o decisión, con la puerta `decision` prevista para comparar respuestas de elección y puntuación frente a llama.cpp.
- Evaluación comparativa de runtimes: el paquete incluye puertas de corrección (`golden`, `compare`, `vision`, `consistency`, `sampling`, `logits`) diseñadas para contrastar token a token la salida de Loom contra la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace apropiado para validar la fidelidad de un runtime alternativo.
- Procesamiento por lotes con concurrencia moderada: con 4 peticiones simultáneas y contexto largo, sirve para tareas de resumen o Q&A sobre un conjunto pequeño de documentos en paralelo en una sola máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). No se documenta soporte para otras GPU.
- VRAM estimada: no disponible de forma explícita; el peso Q4_K_M de un modelo de 4B ronda los 2,5-3 GB, más el proyector de visión en BF16, pero la tarjeta no publica cifras de memoria del preset.
- GPU consumer: el paquete está orientado a iGPU Strix Halo y a la Radeon AI PRO R9700; no se mencionan RTX 4090, A100 ni H100, y el runtime Loom es específico para AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/unsloth-Qwen3-VL-4B-Thinking-loom:chat` (o `:chat-r9700` para la R9700) y `loom-serve --model=qwen3-vl-4b-thinking`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete; llama.cpp solo aparece como referencia de corrección.
- Flags relevantes: `--materialize=copy`, `completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-VL-4B-Thinking-loom | 4B | 262 144 | Texto + imagen | Apache 2.0 | GGUF Q4_K_M empaquetado en Loom; runtime hrx-loom sobre AMD |
| unsloth/Qwen3-VL-4B-Thinking-GGUF (base) | 4B | no disponible en la información | Texto + imagen | Apache 2.0 | GGUF; ejecutable con llama.cpp y derivados |
| Qwen3-VL-4B-Thinking (original) | 4B | no disponible en la información | Texto + imagen | Apache 2.0 | safetensors; requiere stack de inferencia Qwen |

La comparación se limita al linaje directo porque la información disponible no incluye datos de rendimiento ni de otros modelos de la misma categoría. La diferencia práctica entre las tres entradas es el formato y el runtime, no los pesos: el paquete Loom añade una capa de empaquetado y un servidor compatible con OpenAI específico para GPU AMD.

## Limitaciones y advertencias

- El repositorio no incluye ninguna medición de rendimiento ni resultados de las puertas de corrección; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- Es un artefacto de empaquetado generado automáticamente, no un modelo entrenado; hereda íntegramente los sesgos y limitaciones del Qwen3-VL-4B-Thinking original, que no se documentan en esta tarjeta.
- Riesgo de alucinación inherente a un modelo de 4B con thinking siempre activo; no se han publicado evaluaciones de fiabilidad.
- El thinking no se puede desactivar por parámetro de esfuerzo ("not applicable"), lo que incrementa el coste de tokens por respuesta.
- Salida máxima limitada a 4 096 tokens y concurrencia limitada a 4 peticiones, lo que restringe escenarios de alto throughput.
- Compatibilidad de hardware muy estrecha: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta funcionamiento en otras GPU AMD ni en NVIDIA.
- Idiomas soportados no disponibles; no se puede confirmar el comportamiento en castellano.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del GGUF de Unsloth antes de un uso comercial, así como las del runtime hrx-loom.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-4B-Thinking-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-4B-Thinking-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
