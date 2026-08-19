# biohomunculus/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo insignia de código abierto de la serie Qwen3.8, desarrollado por Alibaba (Qwen Team) y publicado en agosto de 2026. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 2,4 billones de parámetros totales y aproximadamente 95 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de los modelos más grandes disponibles en abierto. Su arquitectura híbrida combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un backbone de 92 capas, y soporta un contexto nativo de 262 144 tokens, extensible hasta 1 010 000 tokens.

Este modelo resuelve el problema de ejecutar tareas complejas y de largo horizonte, como razonamiento multi-paso, uso de herramientas y agenciamiento autónomo, con una fiabilidad superior a generaciones anteriores. Es la primera vez que Qwen libera un modelo de clase "Max" en abierto, lo que lo hace relevante para desarrolladores e investigadores que necesitan capacidades de nivel propietario sin depender de APIs cerradas. El repositorio analizado (biohomunculus/Qwen3.8-2.4T-A95B) es un mirror del oficial Qwen/Qwen3.8-2.4T-A95B, con los pesos en formato safetensors y compatible con vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2 446 182 725 504 (2,4 T) |
| Parametros activos | ~95 B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 nativo, extensible a 1 010 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia propia, ver LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B emplea una arquitectura de modelo de lenguaje causal con 92 capas, organizadas en un patrón de 23 bloques repetidos, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → MoE) seguidos de 1 sub-bloque de (Gated Attention → MoE). La atención lineal Gated DeltaNet utiliza 128 cabezas para V y 16 para QK, con dimensión de cabeza 128, mientras que la atención completa Gated Attention usa 64 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La capa MoE contiene 512 expertos enrutados, de los cuales se activan 10 más 1 experto compartido, con dimensión intermedia de 2048. La salida LM tiene un vocabulario rellenado de 248 320 tokens.

El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento. Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y el razonamiento. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se usó RLHF o DPO en la información disponible. El control de razonamiento se realiza mediante el parámetro `reasoning_effort` y se conserva el contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento (thinking) configurable mediante `reasoning_effort`.
- Ejecución de tareas de agente de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades de codificación de alto nivel, incluyendo generación, depuración y refactorización de código.
- Razonamiento matemático y científico, adecuado para investigación y trabajo profesional.
- Multilingüismo: no se especifican idiomas concretos, pero la familia Qwen suele soportar múltiples lenguas; el dato no está disponible en la model card.
- Contexto largo: 262 144 tokens nativos, extensible a 1 010 000, útil para documentos extensos y conversaciones multi-turno.
- Compatibilidad con vLLM, SGLang y TokenSpeed para despliegue en producción.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede planificar, escribir y ejecutar código en entornos de terminal, como demuestra su puntuación de 86,6 en Terminal Bench 2.1. Se integraría en herramientas tipo CLI o IDE para resolver issues de GitHub de forma autónoma.
- Resolución de incidencias en repositorios (SWE-bench Pro): con 69,2 puntos, puede analizar issues, generar parches y validar soluciones, integrándose en flujos de CI/CD para automatizar el mantenimiento de código.
- Asistente de investigación científica: su capacidad de razonamiento multi-paso y contexto largo permite analizar papers extensos, resumir literatura y proponer hipótesis, ayudando a investigadores en revisiones sistemáticas.
- Atención al cliente con contexto largo: con hasta 1M de tokens de contexto, puede gestionar conversaciones multi-turno con historial completo de interacciones, manteniendo coherencia y recuperando información de documentos previos.
- Generación de documentación técnica: dado su rendimiento en tareas de codificación y razonamiento, puede generar documentación de APIs, guías de usuario y comentarios de código a partir de repositorios completos.
- Automatización de tareas de oficina profesional: redacción de informes, análisis de datos y preparación de presentaciones, aprovechando su capacidad de razonamiento y manejo de instrucciones complejas.
- Desarrollo de asistentes virtuales con tool calling: puede orquestar llamadas a APIs externas, bases de datos y servicios web, actuando como backend de un asistente personal o empresarial.

## Benchmarks y rendimiento

La model card del autor proporciona resultados parciales de benchmarks, comparando Qwen3.8-Max (la versión oficial basada en este modelo) con otros modelos de nivel propietario. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | 69,2 |

Nota: los valores corresponden a la versión oficial Qwen3.8-Max, que añade características adicionales (visión, contexto 1M por defecto, herramientas integradas) sobre el modelo abierto Qwen3.8-2.4T-A95B. El rendimiento del modelo abierto puede variar ligeramente.

## Requisitos de hardware

- El modelo tiene 2,4 T parámetros en total, por lo que no cabe en una GPU de consumo. Se requieren múltiples GPUs de centro de datos.
- Estimación de VRAM: en BF16, los pesos ocupan aproximadamente 4,9 TB; en FP8, alrededor de 2,4 TB. Con cuantización de 4 bits, se podría reducir a ~1,2 TB, pero no se dispone de datos oficiales de cuantización.
- GPUs recomendadas: clústeres de H100 (80 GB) o A100 (80 GB). Por ejemplo, con FP8 se necesitarían al menos 30 H100; con BF16, alrededor de 62 H100. Estas cifras son estimaciones orientativas, no datos oficiales.
- Opciones de despliegue: vLLM, SGLang y TokenSpeed son compatibles según la model card. También se puede usar el servicio gestionado Qwen Cloud para inferencia sin mantenimiento de infraestructura.
- Latencia y throughput: no disponibles. Dado el tamaño y la arquitectura MoE, se espera un throughput razonable para los 95 B activos, pero no hay cifras publicadas.

## Comparativa con modelos similares

La comparativa se basa en los datos de la tabla de benchmarks de la model card, que incluye modelos propietarios de nivel similar. No se dispone de comparaciones con otros modelos abiertos de la misma categoría (por ejemplo, DeepSeek-V3 o Llama 4 MoE) en la información proporcionada.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Terminal Bench 2.1 | SWE-bench Pro |
|---|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4 T | ~95 B | 262K (ext. 1M) | qwen3.8-max | 86,6 (Qwen3.8-Max) | 69,2 (Qwen3.8-Max) |
| Qwen3.7-Max | no disponible | no disponible | no disponible | propietaria | 74,5 | 60,6 |
| Opus 4.8 | no disponible | no disponible | no disponible | propietaria | 84,6 | 69,2 |
| GPT 5.6 Sol (max) | no disponible | no disponible | no disponible | propietaria | 88,8 | 64,6 |

Nota: los datos de Qwen3.7-Max, Opus 4.8 y GPT 5.6 Sol provienen de la tabla de benchmarks del autor; no se dispone de sus especificaciones técnicas.

## Limitaciones y advertencias

- La licencia es `qwen3.8-max`, una licencia propia de Qwen. Es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial, redistribución y modificación. No se asume que sea de código abierto en el sentido de OSI.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos no deseados en la información disponible. Como modelo de 2,4 T, puede presentar alucinaciones en tareas de alta complejidad, especialmente con contextos muy largos.
- El contexto nativo es de 262 144 tokens; la extensión a 1 010 000 tokens puede requerir técnicas de interpolación de RoPE o ajuste fino, y no se garantiza el mismo rendimiento en toda la ventana extendida.
- Los idiomas soportados no están especificados en la model card; se recomienda verificar el soporte multilingüe antes de desplegar en producción para idiomas distintos del inglés o chino.
- El tamaño del modelo (4,9 TB en BF16) hace inviable su ejecución en hardware de consumo; se requieren clústeres de GPUs de alta gama, lo que limita su uso a organizaciones con infraestructura adecuada.
- Los benchmarks publicados corresponden a la versión Qwen3.8-Max (con características adicionales), no al modelo abierto exacto. El rendimiento del modelo abierto puede diferir.

## Enlaces

- Repositorio HuggingFace (mirror analizado): https://huggingface.co/biohomunculus/Qwen3.8-2.4T-A95B
- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Recetas de vLLM para el modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Blog de Qwen sobre Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Análisis de especificaciones y VRAM (apxml.com): https://apxml.com/models/qwen38-24t-a95b
