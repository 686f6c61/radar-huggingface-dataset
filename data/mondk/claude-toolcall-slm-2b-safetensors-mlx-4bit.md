# mondk/claude-toolcall-slm-2B-safetensors-mlx-4Bit

## Resumen

El modelo `mondk/claude-toolcall-slm-2B-safetensors-mlx-4Bit` es una cuantización en 4 bits con formato MLX de un pequeño modelo de lenguaje de 267 millones de parámetros, orientado a la generación de texto y al uso de herramientas (tool calling). Lo desarrolla el autor `mondk` y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. El modelo original, `mondk/claude-toolcall-slm-2B-safetensors`, está entrenado con una mezcla de datasets públicos, incluyendo trazas de Claude Code, SmolLM Corpus, The Stack, SmolTalk y UltraFeedback, lo que sugiere un enfoque en instrucciones y razonamiento conversacional.

A pesar de su nombre comercial ("2B"), los pesos reales indican 267,5 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños o "tiny". Esta versión MLX 4-bit está pensada para dispositivos Apple Silicon y entornos con recursos limitados, ofreciendo una alternativa ligera para experimentación y despliegue en edge. La ventana de contexto no está especificada en la model card, aunque una fuente externa indica 8K tokens, dato que debe tomarse con cautela. El modelo se presenta como una opción para desarrolladores que buscan un SLM de bajo coste con capacidades de tool calling, aunque no se han publicado benchmarks oficiales que respalden su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama, según tags) |
| Parametros totales | 267.487.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (una fuente externa indica 8K, sin confirmar) |
| Tipos de cuantizacion | MLX 4-bit (esta versión), además existe versión GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer basado en el diseño de Llama, aunque no se proporcionan detalles adicionales como el número de capas, cabezas de atención o dimensiones ocultas. El entrenamiento se realizó sobre una mezcla de datasets que incluyen `mondk/claude-code-fable-5-traces.jsonl` (trazas de sesiones de Claude Code), `HuggingFaceTB/smollm-corpus`, `bigcode/the-stack` (código fuente), `HuggingFaceTB/smoltalk` y `openbmb/UltraFeedback`. Esta composición sugiere un entrenamiento en dos fases: una inicial con corpus general y código, y un ajuste posterior con datos de instrucción y feedback humano (UltraFeedback) para alinear el modelo con la generación de respuestas útiles. La cuantización MLX 4-bit reduce el tamaño del modelo para su ejecución eficiente en hardware Apple Silicon y otras plataformas compatibles con MLX.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling (llamada a funciones), como indica el nombre del modelo, aunque no hay ejemplos concretos en la documentación.
- Capacidades de razonamiento básico, derivadas del entrenamiento con instrucciones y feedback.
- Soporte de contexto limitado (posiblemente 8K, sin confirmar oficialmente).
- Formato de pesos safetensors compatible con MLX y GGUF.

## Casos de uso

- Prototipado rápido de agentes conversacionales: al ser un modelo pequeño y ligero, permite probar flujos de tool calling en entornos de desarrollo sin requerir hardware de gama alta. Se puede cargar con MLX en un portátil o incluso en una Raspberry Pi (con suficiente RAM) para validar la lógica de interacción.
- Automatización de tareas en entornos con restricciones de recursos: por ejemplo, en dispositivos edge o sistemas embebidos donde los modelos grandes no son viables, este SLM puede gestionar tareas simples como consultas a APIs o extracción de datos.
- Educación y experimentación: sirve como base para aprender a implementar cuantización, despliegue en MLX o el uso de tool calling en modelos pequeños.
- Generación de código en entornos sin conexión: aunque no se han publicado benchmarks de HumanEval, su entrenamiento con The Stack sugiere que puede completar fragmentos de código sencillos, útil para autocompletado en editores ligeros.
- Asistentes de chat para comunidades de habla inglesa con baja latencia: al ser pequeño, responde en milisegundos en una GPU modesta, ideal para bots de Discord o Telegram.
- Testing de integración de frameworks de tool calling (como Function Calling en vLLM o LMQL): se puede usar para validar pipelines de agentes sin incurrir en costes de inferencia elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 267M parámetros en 4-bit, el peso ocupa aproximadamente 134 MB (267M × 0,5 bytes/parámetro), pero el overhead de la inferencia (KV cache, activaciones) aumenta el requisito. Se estima que cabe en una GPU con 2 GB de VRAM o incluso en CPU con MLX.
- GPU recomendadas: cualquier GPU con soporte para MLX (Apple Silicon) o CUDA (con conversión a GGUF). Una RTX 3060 (12 GB) es más que suficiente.
- En consumer GPU: sí, cabe en prácticamente cualquier GPU moderna.
- Opciones de despliegue: MLX (para Apple), llama.cpp con la versión GGUF, vLLM (si se convierte a formato compatible), o directamente con la librería MLX.
- Latencia y throughput: no disponibles, pero por el tamaño se espera latencia de pocos milisegundos en una GPU moderna.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de tamaño similar. El modelo es un SLM de 267M parámetros orientado a tool calling, pero no hay datos de rendimiento para comparar. Alternativas genéricas de tamaño similar incluyen Qwen2-0.5B, SmolLM2-360M o TinyLlama-1.1B, pero no se conocen sus capacidades de tool calling ni sus resultados en este contexto.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su uso en otros idiomas es limitado.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que no se puede garantizar un comportamiento robusto en producción.
- El nombre del modelo ("2B") es engañoso: en realidad tiene 267M parámetros, lo que afecta a la capacidad de razonamiento y a la calidad de las respuestas comparado con modelos de 2B reales.
- La longitud de contexto no está confirmada oficialmente; la fuente externa indica 8K, pero es un dato no verificado.
- La cuantización MLX 4-bit puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Al ser un modelo de autor independiente, no existe un soporte oficial ni garantía de actualizaciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de seguridad ni de cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace (versión MLX 4-bit): https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors-mlx-4Bit
- Modelo base (safetensors): https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors
- Versión GGUF: https://huggingface.co/mondk/claude-toolcall-slm-2B
- Entrada en LLM Explorer (contexto 8K y VRAM): https://llm-explorer.com/model/mondk%2Fclaude-toolcall-slm-2B-safetensors,6U3qkHZXR7WLVamCq7ZL
