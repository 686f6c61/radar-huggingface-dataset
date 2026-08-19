# PocketAiHub/Qwen3.8-27B-MLX

## Resumen

PocketAiHub/Qwen3.8-27B-MLX es una conversión oficial del modelo multimodal Qwen/Qwen3.8-27B al formato MLX, realizada por PocketAI Model Lab. El objetivo es permitir ejecutar este modelo de 27 000 millones de parámetros en ordenadores Apple Silicon mediante la librería MLX, aprovechando la memoria unificada y el acelerador neuronal de estos equipos. Se ofrecen cinco variantes de cuantización (2-bit AWQ experimental, 4-bit, 6-bit, 8-bit y BF16) para ajustar el consumo de memoria y la velocidad según las necesidades del usuario.

La relevancia de esta publicación radica en que facilita el despliegue local de un modelo visión-lenguaje de gran tamaño en hardware de consumo, sin necesidad de GPUs dedicadas de NVIDIA. Las variantes 4-bit, 6-bit, 8-bit y BF16 han pasado una suite de validación determinista que incluye pruebas de calidad, tool calling, comprensión de video temporal y recuperación de contexto largo. La variante 4-bit, en particular, ha demostrado funcionar correctamente con contextos de hasta 32 768 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (el nombre sugiere 27B, no confirmado en la documentación) |
| Parametros activos | no disponible |
| Longitud de contexto | no especificada; validado hasta 32 768 tokens en la variante 4-bit |
| Tipos de cuantizacion | 2-bit AWQ (experimental), 4-bit, 6-bit, 8-bit, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original Qwen3.8-27B (si es transformer denso, MoE, etc.) ni sobre su proceso de entrenamiento (tokens, dataset, técnicas de alineación). Esta publicación se centra exclusivamente en la conversión a MLX y la cuantización.

La conversión se realizó con la herramienta `mlx-vlm==0.6.8` a partir de la revisión fijada `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio oficial de Qwen. Se aplicaron cuantizaciones MLX afines: la variante 2-bit usa AWQ con grupo de 32, mientras que las variantes 4, 6 y 8-bit usan grupo de 64. En todos los casos, el tower de visión se mantiene en BF16 sin cuantizar. Cada variante incluye un manifiesto de artefactos con hashes SHA-256 para verificar la integridad.

## Capacidades

- Comprensión de imágenes y generación de texto a partir de ellas (pipeline image-text-to-text).
- Comprensión de video temporal, validada con una prueba sintética de cambio de color (`red->blue`).
- Tool calling / function calling, validado con 8 casos de prueba en las variantes 4-bit, 6-bit, 8-bit y BF16.
- Recuperación de información en contexto largo: la variante 4-bit superó una prueba de needle retrieval con 32 770 tokens reales de prompt.
- Generación de texto con soporte de modo "thinking" (desactivable mediante `enable_thinking=False`).
- Capacidades multilingües no especificadas en la documentación.

## Casos de uso

- Asistentes de atención al cliente con análisis de imágenes: el modelo puede procesar capturas de pantalla o fotos enviadas por usuarios y generar respuestas contextualizadas, gracias a su comprensión multimodal y su capacidad de tool calling para integrarse con sistemas de tickets.
- Análisis de documentos visuales en entornos empresariales: extraer información de facturas, contratos o diagramas escaneados, combinando visión y lenguaje en un solo paso.
- Moderación de contenido audiovisual: detectar cambios temporales en secuencias de video (por ejemplo, transiciones de color) para alertar sobre contenido inapropiado o defectos de reproducción.
- Desarrollo de agentes conversacionales con acceso a herramientas: el modelo puede invocar funciones externas (búsqueda web, APIs, bases de datos) durante una conversación, lo que lo hace adecuado para asistentes de productividad o automatización de tareas.
- Sistemas de recuperación de información en documentos largos: gracias a su contexto validado de 32K, puede responder preguntas sobre manuales técnicos, informes o libros extensos sin necesidad de fragmentar el texto.
- Prototipado rápido de aplicaciones de visión por computador en Mac: investigadores y desarrolladores pueden probar ideas de VQA (visual question answering) localmente en Apple Silicon sin depender de servicios en la nube, usando las variantes cuantizadas para ajustar el uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento en inferencia para Apple M5 Max con 128 GB de memoria unificada, usando `mlx==0.32.0` y `mlx-vlm==0.6.8`, con un prompt de 4 105 tokens y 9 tokens generados:

| Variante | Prefill (tok/s) | Generación (tok/s) | Tiempo end-to-end (s) | Memoria MLX pico (GB) |
|---|---:|---:|---:|---:|
| MLX 2-bit AWQ (experimental) | 541.7 | 38.8 | 7.82 | 16.00 |
| MLX 4-bit | 733.1 | 36.6 | 5.86 | 21.80 |
| MLX 6-bit | 584.7 | 26.2 | 7.38 | 29.54 |
| MLX 8-bit | 600.1 | 20.1 | 7.30 | 37.27 |
| MLX BF16 | 623.8 | 10.8 | 7.43 | 58.29 |

Estas cifras son mediciones puntuales de una sola ejecución y sirven como control de regresión, no como una garantía de rendimiento general.

## Requisitos de hardware

- Requiere un Mac con Apple Silicon (chip M1 o posterior) y memoria unificada suficiente para la variante elegida.
- Memoria mínima estimada según la variante (medida en M5 Max): 16 GB para 2-bit, 21.8 GB para 4-bit, 29.5 GB para 6-bit, 37.3 GB para 8-bit y 58.3 GB para BF16. Estas cifras corresponden a la memoria MLX pico durante la inferencia; se recomienda que el Mac tenga al menos esa cantidad de RAM total.
- La variante 4-bit es la más equilibrada en rendimiento y memoria, y es la única que ha superado la prueba de contexto de 32K.
- Despliegue mediante la librería `mlx-vlm` (versión validada 0.6.8) junto con `mlx==0.32.0`. No se mencionan otros runtimes como vLLM u Ollama en la documentación.
- La latencia y el throughput dependen del chip concreto; las mediciones proporcionadas corresponden a un M5 Max de 128 GB.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de comparación con otros modelos de la misma categoría (por ejemplo, otras conversiones MLX de modelos multimodales de 27B o similares).

## Limitaciones y advertencias

- La variante 2-bit AWQ es experimental: falla en 1 de 12 casos de calidad, en 5 de 8 casos de tool calling y no supera la prueba de video temporal. No se recomienda para uso en producción.
- La validación de calidad se basa en un conjunto reducido de pruebas deterministas (12 casos de calidad, 8 de tool calling), no en benchmarks exhaustivos como MMLU o HumanEval.
- No se especifican los idiomas soportados, por lo que el rendimiento en idiomas distintos del inglés no está garantizado.
- Al ser una conversión, puede haber ligeras diferencias de comportamiento respecto al modelo original en PyTorch, especialmente en las variantes cuantizadas.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base Qwen.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad específicos de este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketAiHub/Qwen3.8-27B-MLX
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- PocketAI Model Lab (GitHub): https://github.com/PocketAIHub/pocketai-model-lab
