# npario/Qwen3.8-27B-Abliterated-MLX

## Resumen

El modelo `npario/Qwen3.8-27B-Abliterated-MLX` es una familia de conversiones MLX del modelo multimodal `Qwen/Qwen3.8-27B` de Qwen, modificadas mediante una técnica de abliteration que suprime la dirección de rechazo aprendida durante el ajuste por instrucciones. El trabajo de conversión, experimento y validación fue realizado por PocketAI Model Lab, que publica estos derivados bajo el identificador `PocketAiHub`. El repositorio consolidado incluye cinco variantes cuantizadas (2-bit AWQ experimental, 4-bit, 6-bit, 8-bit y BF16) pensadas para ejecutarse en Apple Silicon mediante la librería MLX.

El modelo base es un transformer denso de 27 000 millones de parámetros con atención híbrida (Gated DeltaNet lineal combinada con atención completa), visión nativa, capacidades de razonamiento, tool-calling y una cabeza de decodificación especulativa MTP. La abliteration se aplicó midiendo una dirección proyectada harmful-minus-harmless en la capa 53 y modificando las matrices de salida residual de las capas 24 a 63 con escala 1.0. El resultado es un modelo que no muestra rechazos explícitos ni en prompts dañinos ni en controles benignos, aunque esto conlleva riesgos importantes de seguridad.

La relevancia actual de este modelo radica en que permite ejecutar un VLM de 27B en hardware de Apple con cuantizaciones desde 2 bits hasta BF16, con rendimientos medidos en un Apple M5 Max. Sin embargo, la variante 2-bit es experimental y falla en tool-calling y en algunas comprobaciones de calidad, por lo que solo las versiones 4-bit en adelante se consideran estables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), visión nativa, cabeza MTP de decodificación especulativa |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo; la validación incluye recuperación a 4K tokens) |
| Tipos de cuantizacion | 2-bit AWQ (experimental), 4-bit, 6-bit, 8-bit (afín con grupo 64) y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27B con una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa, lo que permite manejar secuencias largas de forma eficiente. Incluye un codificador de visión nativo para entrada de imágenes y vídeo, capacidades de razonamiento (modo thinking), tool-calling y una cabeza de decodificación especulativa MTP (multi-token prediction) para acelerar la generación. El entrenamiento original del modelo base no está documentado en la información proporcionada; solo se indica que es un modelo de instrucciones con licencia Apache 2.0.

La abliteration aplicada por PocketAI Model Lab consiste en medir una dirección proyectada a partir de 256 prompts dañinos y 256 benignos de longitud equivalente, en el límite de generación de asistente. La dirección se extrae de la capa 53 y se aplica a las capas 24 a 63 con escala 1.0, modificando 80 matrices de salida residual. Se preserva la norma por columna de entrada. El proceso se documenta en el archivo `abliteration-manifest.json`. No se realizó ningún entrenamiento adicional; solo se modificaron los pesos del modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene las capacidades del Qwen3.8-27B original, incluyendo razonamiento multi-paso y modo thinking (aunque en las pruebas se desactivó).
- Comprensión multimodal: acepta imágenes y vídeo como entrada, con un codificador de visión en BF16 en todas las variantes.
- Tool-calling: las variantes 4-bit, 6-bit, 8-bit y BF16 pasaron 8/8 comprobaciones nativas de tool-call; la variante 2-bit falló 0/8.
- Comprensión de vídeo temporal: las variantes estables superaron la prueba sintética de cambio de color (red->blue); la 2-bit no.
- Recuperación de contexto largo: las variantes estables encontraron una aguja en un contexto de 4K tokens; la 2-bit la encontró pero no la devolvió exactamente.
- Ausencia de rechazos: todas las variantes mostraron 0/100 rechazos explícitos en prompts dañinos y 0/100 en controles benignos, según el detector basado en frases.
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base de Qwen suele soportar múltiples idiomas; no hay datos en la información disponible.

## Casos de uso

- Investigación de alineación y seguridad: el modelo permite estudiar el efecto de la abliteration en el comportamiento de rechazo, comparando con el modelo base. Es adecuado para análisis académicos de mecanismos de seguridad en LLMs.
- Generación creativa sin restricciones: para proyectos de escritura o narrativa donde se requiera explorar temas que el modelo base rechazaría, siempre que el usuario asuma la responsabilidad de evaluar y filtrar el contenido.
- Desarrollo de aplicaciones VLM en Apple Silicon: las variantes 4-bit y 6-bit ofrecen un equilibrio entre calidad y uso de memoria, permitiendo ejecutar un modelo de 27B multimodal en un Mac con 32-64 GB de memoria unificada.
- Prototipado de agentes con tool-calling: las variantes estables pueden integrarse en pipelines de agentes que necesiten llamar funciones, gracias a su soporte nativo de tool-call validado.
- Análisis de contenido visual: el modelo puede describir imágenes y vídeos, lo que resulta útil para tareas de anotación o accesibilidad, aunque sin garantías de seguridad.
- Evaluación de cuantización: el repositorio incluye múltiples precisiones, lo que permite medir el impacto de la cuantización en calidad y rendimiento para un mismo modelo base.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar como MMLU, HumanEval o GSM8K. En su lugar, proporciona una evaluación de rechazos y métricas de rendimiento en MLX. Los datos de rechazo son los siguientes:

| Variante | Rechazos explícitos en prompts dañinos | Rechazos explícitos en controles benignos | Respuestas finales presentes |
|---|---:|---:|---:|
| MLX 2-bit AWQ (experimental) | 0/100 | 0/100 | 196/200 |
| MLX 4-bit | 0/100 | 0/100 | 200/200 |
| MLX 6-bit | 0/100 | 0/100 | 200/200 |
| MLX 8-bit | 0/100 | 0/100 | 200/200 |
| MLX BF16 | 0/100 | 0/100 | 200/200 |

Rendimiento en Apple M5 Max (128 GB memoria unificada, `mlx==0.32.0`, `mlx-vlm==0.6.8`, batch 1, temperatura 0, thinking desactivado, prompt de 4105 tokens):

| Variante | Prefill (tok/s) | Generación (tok/s) | Tiempo total (s) | Pico de memoria MLX |
|---|---:|---:|---:|---:|
| MLX 2-bit AWQ (experimental) | 411.9 | 25.2 | 10.62 | 16.00 GB |
| MLX 4-bit | 641.7 | 33.2 | 6.68 | 21.80 GB |
| MLX 6-bit | 548.2 | 24.7 | 7.87 | 29.54 GB |
| MLX 8-bit | 579.1 | 18.7 | 7.58 | 37.27 GB |
| MLX BF16 | 513.9 | 9.0 | 9.02 | 58.29 GB |

Estas mediciones son de una sola ejecución local y no constituyen una garantía de rendimiento en otros equipos.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon con memoria unificada; las pruebas se realizaron en un Apple M5 Max con 128 GB.
- Memoria pico estimada por variante: 2-bit AWQ 16.00 GB, 4-bit 21.80 GB, 6-bit 29.54 GB, 8-bit 37.27 GB, BF16 58.29 GB.
- Para ejecutar la variante 4-bit se recomienda un Mac con al menos 32 GB de memoria unificada; para 8-bit o BF16, 64 GB o más.
- No se menciona soporte para GPU NVIDIA o AMD; la librería MLX es específica de Apple Silicon.
- Despliegue mediante `mlx-vlm` (versión 0.6.8) y `mlx` (versión 0.32.0). No se indican opciones para vLLM, llama.cpp u Ollama, aunque existe una build de Ollama del mismo modelo abliterated publicada por OrcaRouter.
- La latencia y el throughput dependen de la variante; la 4-bit ofrece el mejor equilibrio con 641.7 tok/s de prefill y 33.2 tok/s de generación en el hardware de prueba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Abliteration |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Sí | Apache 2.0 | Original (PyTorch) | No |
| npario/Qwen3.8-27B-Abliterated-MLX | 27B | No disponible | Sí | Apache 2.0 | MLX (2-8 bit, BF16) | Sí |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | No disponible | Sí | Apache 2.0 | GGUF, FP8, MLX | Sí |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otros modelos VLM de 27B para comparar directamente. La principal diferencia entre las versiones abliterated y el modelo base es la eliminación de rechazos; el rendimiento en tareas estándar no se ha medido en esta información.

## Limitaciones y advertencias

- La abliteration suprime el comportamiento de rechazo aprendido, lo que puede provocar que el modelo genere contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo de instrucciones original.
- La abliteration no es un entrenamiento de veracidad ni una mejora de capacidades; no garantiza que las respuestas sean correctas o seguras.
- La variante 2-bit AWQ es experimental: falla en tool-calling (0/8), en la prueba de texto exacto y en la recuperación de contexto largo; no se recomienda para uso productivo.
- El detector de rechazos utilizado es un simple detector basado en frases; no puede establecer cumplimiento universal ni calidad de respuesta.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para estas variantes, por lo que se desconoce su rendimiento en tareas académicas o de código.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de evaluar los riesgos de seguridad y de implementar salvaguardas externas.
- El modelo solo está disponible en formato MLX; no se proporcionan pesos en otros formatos (GGUF, FP8) en este repositorio, aunque existen versiones similares de otros autores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/npario/Qwen3.8-27B-Abliterated-MLX
- Repositorio original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de PocketAI Hub (fuente canónica): https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Versión uncensored de npario: https://huggingface.co/npario/Qwen3.8-27B-Uncensored-MLX
- Artículo de explainx.ai sobre la build de OrcaRouter: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Build de Ollama de OrcaRouter: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
