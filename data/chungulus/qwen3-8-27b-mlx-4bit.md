# Chungulus/Qwen3.8-27B-MLX-4bit

## Resumen

Qwen3.8-27B-MLX-4bit es una cuantización en 4 bits del modelo Qwen/Qwen3.8-27B, realizada por Chungulus y publicada en HuggingFace. Se trata de una conversión "vanilla" con MLX (Machine Learning framework de Apple), sin fine-tuning, merge ni modificación del chat-template, orientada a ejecutar el modelo en Apple Silicon con memoria unificada. El modelo original es un sistema de visión-lenguaje (image-text-to-text) con arquitectura híbrida que combina atención completa y Gated DeltaNet, además de un componente de predicción multi-token (MTP) y soporte para tool calling y modo de razonamiento (thinking).

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B parámetros con capacidades multimodales en hardware Apple, reduciendo el tamaño del artefacto a aproximadamente 16,9 GB (frente a los más de 50 GB del BF16 original). El autor ha validado el resultado con pruebas funcionales de texto, visión, herramientas y MTP, reportando una similitud semántica media de 0,948 con el modelo fuente. No se publican benchmarks estándar (MMLU, HumanEval, etc.), solo métricas de validación interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (identificador interno `Qwen3_5ForConditionalGeneration` / `qwen3_5`), híbrida Gated DeltaNet + atención completa, con vision tower, projector y MTP drafter |
| Parametros totales | 27B (modelo base); el archivo safetensors cuantizado reporta 4.665.462.000 parámetros en representación 4-bit |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la validación solo probó hasta 73 tokens de prompt; no se indica el máximo arquitectónico) |
| Tipos de cuantizacion | MLX affine 4-bit, group_size 64, sin calibración (calibration_source: none) |
| Idiomas soportados | no disponibles (el modelo base de Qwen suele ser multilingüe, pero no se especifica en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención completa con capas Gated DeltaNet, un mecanismo de estado lineal recurrente que reduce el coste de atención para secuencias largas. Incluye un vision tower y un proyector para procesar imágenes, y un componente MTP (multi-token prediction) que actúa como drafter para acelerar la decodificación especulativa. El identificador interno `qwen3_5` no indica que los pesos provengan de un modelo Qwen3.5; es simplemente el nombre de la clase de arquitectura.

Esta versión concreta es una cuantización MLX 4-bit con group_size 64, realizada sin calibración (calibration_source: none). No se aplicó ningún ajuste fino, merge ni cambio en el chat-template; los pesos se fijaron al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio oficial. El autor validó la conversión comparando la salida con el modelo BF16 original mediante similitud semántica (media 0,948) y pruebas funcionales de texto, visión, herramientas y MTP. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, métodos de alineación como RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas no especificados en la ficha, pero el modelo base de Qwen suele cubrir decenas de idiomas).
- Comprensión de imágenes (image-text-to-text): puede recibir una imagen y responder preguntas o describir su contenido.
- Tool calling / function calling: soporta el formato XML nativo de Qwen, validado con 5 pruebas.
- Modo de razonamiento (thinking mode) con controles `enable_thinking`, `reasoning_effort` y `preserve_thinking`.
- Multi-token prediction (MTP): incluye un drafter MTP para decodificación especulativa, aunque las pruebas muestran que en este artefacto no produce aceleración (speedup 0,936, es decir, ligeramente más lento).
- Soporte de agentes y razonamiento multi-paso gracias al tool calling y al modo thinking.

## Casos de uso

- Asistente de visión en local para Apple Silicon: un desarrollador puede desplegar este modelo en un Mac con 64 GB de RAM unificada para crear un asistente que analice capturas de pantalla, fotos o diagramas y genere descripciones o respuestas contextuales, sin depender de APIs externas.
- Automatización de documentación técnica: el modelo puede recibir imágenes de esquemas o diagramas de arquitectura y generar explicaciones textuales, aprovechando su capacidad de visión y razonamiento.
- Chatbot con herramientas integradas: gracias al tool calling nativo, se puede integrar en un agente que consulte APIs, bases de datos o ejecute acciones, todo ejecutándose en un Mac con MLX.
- Prototipado de aplicaciones multimodales: investigadores pueden usar esta cuantización para probar flujos de trabajo que combinan texto e imagen en entornos donde el espacio en disco o memoria es limitado, dado el tamaño reducido de 16,9 GB.
- Evaluación de calidad de cuantización: el artefacto sirve como referencia para comparar el comportamiento de un modelo de 27B cuantizado a 4 bits frente a su versión BF16 en tareas de visión y lenguaje, útil para decidir si la pérdida de precisión es aceptable.
- Inferencia en entornos con restricciones de memoria: con un pico de memoria de 17,85 GB durante la generación, este modelo puede ejecutarse en un Mac Studio o MacBook Pro con 64 GB, dejando espacio para otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta métricas de validación interna:

| Metrica | Valor |
|---|---|
| Similitud semántica media vs. BF16 fuente | 0,948 |
| Coincidencias exactas en pruebas funcionales | 3 (de un conjunto no especificado) |
| Velocidad de generación media (BF16 y cuantizado) | 7,38 tokens/s (medido en hardware Apple Silicon) |
| Throughput con MTP | 7,24 tokens/s (sin aceleración) |
| Tasa de aceptación del drafter MTP | 0,922 (83 drafts aceptados de 90) |
| Memoria pico durante generación | 17,85 GB |
| Longitud máxima de prompt validada | 73 tokens |

Estas cifras son específicas del artefacto, del hardware y del prompt de prueba; no deben extrapolarse a otros contextos.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con 64 GB de memoria unificada (según la model card).
- Memoria pico durante generación: 17,85 GB (medido con un prompt corto y generación de 256 tokens).
- Tamaño del artefacto: 16,9 GB en disco.
- GPU recomendadas: no aplica (MLX usa la GPU integrada de Apple Silicon; se recomienda un chip M1 Max/Ultra, M2 Pro/Max/Ultra o M3/M4 con al menos 64 GB de RAM unificada).
- Opciones de despliegue: el autor proporciona instrucciones de uso con `mlx-vlm` (versión 0.6.1) y `mlx-lm` (0.31.3). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el formato MLX es específico de Apple.
- Latencia y throughput: en las pruebas del autor, la generación promedia ~7,4 tokens/s sin MTP y ~7,2 tokens/s con MTP (sin aceleración). La latencia exacta depende del prompt, el contexto y el hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la informacion proporcionada. La única comparación directa es con el modelo base Qwen/Qwen3.8-27B en BF16:

| Modelo | Parametros | Formato | Tamano | Velocidad | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 27B | BF16 | ~54 GB (estimado) | no medido | Apache-2.0 |
| Chungulus/Qwen3.8-27B-MLX-4bit | 27B (cuantizado 4-bit) | MLX 4-bit | 16,9 GB | ~7,4 tokens/s | Apache-2.0 |

Otras cuantizaciones de Qwen3.8-27B (por ejemplo, en GGUF o AWQ) podrían existir, pero no hay datos en esta ficha para comparar. La principal diferencia es el formato MLX, que limita el despliegue a Apple Silicon, mientras que GGUF es más portable.

## Limitaciones y advertencias

- La cuantización a 4 bits puede reducir la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo. El autor advierte que la pérdida puede ser mayor en bit widths bajos.
- El runtime debe soportar la arquitectura híbrida completa (Gated DeltaNet, attention, vision tower, projector y MTP). Un cargador que solo lea tensores de lenguaje no es suficiente.
- La longitud de contexto no ha sido probada más allá de 73 tokens de prompt en la validación. No se debe asumir que el máximo arquitectónico (posiblemente 128k, como otros modelos Qwen) funciona correctamente con esta cuantización sin verificación.
- El MTP no proporciona aceleración en este artefacto (la velocidad es ligeramente inferior al modo sin drafter). No se debe esperar una mejora de rendimiento por usarlo.
- No hay benchmarks estándar publicados; la similitud semántica reportada es una métrica proxy, no una garantía de calidad en tareas específicas.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir al modelo original y a esta cuantización según los términos de la licencia.
- El formato MLX limita el despliegue a hardware Apple; no es compatible directamente con servidores Linux con GPU NVIDIA.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-4bit
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
