# AIGAROU/292d9xb3bffb3oenxj393nc

## Resumen

AIGAROU/292d9xb3bffb3oenxj393nc es una reproducción publicada en HuggingFace de los pesos del modelo Qwen3.6-35B-A3B en formato FP8, subida por el usuario AIGAROU. Se trata de una cuantización de un modelo multimodal de tipo image-text-to-text desarrollado originalmente por el equipo Qwen (Alibaba), con arquitectura Mixture of Experts (MoE) de 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según declara la model card del autor original.

El modelo resuelve tareas de generación de texto, razonamiento, código y comprensión de imágenes, e incorpora un modo de razonamiento ("thinking") con preservación de contexto de razonamiento entre turnos. Su relevancia actual radica en que combina una ventana de contexto nativa de 262.144 tokens (extensible hasta 1.010.000), un coste de inferencia reducido gracias al enrutamiento MoE y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

La cuantización empleada es FP8 de grano fino con bloques de 128, y el repositorio ocupa 37,5 GB. El modelo base declarado es Qwen/Qwen3.6-35B-A3B, y esta réplica concreta acumula 21 descargas y ninguna interacción social en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión y Mixture of Experts (MoE); capas híbridas Gated DeltaNet + Gated Attention |
| Parametros totales | 35.951.822.704 (≈35,95 B) |
| Parametros activos | ≈3 B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | FP8 de grano fino con tamaño de bloque 128 (esta réplica); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con Transformers, vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La dimensión oculta es de 2048, con 40 capas y un layout híbrido de 10 bloques compuestos por 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention. Las capas de atención lineal usan 32 cabezas para V y 16 para QK con dimensión de cabeza 128; las capas de atención con compuerta usan 16 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El vocabulario está paddeado a 248.320 tokens.

La componente MoE cuenta con 256 expertos, de los que se activan 8 enrutados más 1 compartido por token, con dimensión intermedia de experto de 512. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa. La model card menciona "Thinking Preservation" como innovación de post-entrenamiento para retener contexto de razonamiento entre mensajes históricos, orientada a flujos de desarrollo iterativo. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" explícito y preservación del razonamiento entre turnos.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text) mediante encoder de visión.
- Generación y edición de código, con énfasis declarado en flujos de frontend y razonamiento a nivel de repositorio.
- Razonamiento agéntico para tareas de coding (agentic coding) según los benchmarks publicados.
- Capacidades multilingües: el benchmark SWE-bench Multilingual sugiere soporte para múltiples lenguajes de programación, aunque los idiomas naturales soportados no están detallados.
- Decodificación especulativa mediante MTP, que acelera la generación.
- Compatibilidad con tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la orientación agéntica del modelo lo hace probable.
- Soporte de contexto largo para documentos extensos y bases de código grandes.

## Casos de uso

- Asistente de coding a nivel de repositorio: el modelo puede analizar múltiples ficheros y proponer parches coherentes gracias a su ventana de 262.144 tokens y a la preservación del contexto de razonamiento entre iteraciones, lo que reduce la repetición de explicaciones en sesiones largas.
- Automatización de resolución de issues en CI/CD: con un rendimiento de 73,4 en SWE-bench Verified, es adecuado para pipelines que reciben un issue, localizan el código relevante y generan un parche verificable automáticamente.
- Análisis de documentación técnica con imágenes: al ser image-text-to-text, puede procesar diagramas de arquitectura, capturas de pantalla de errores o maquetas de UI junto con texto explicativo para generar informes o código asociado.
- Generación de interfaces frontend: la model card destaca mejoras específicas en flujos de frontend, por lo que encaja en herramientas que convierten descripciones o bocetos en componentes de UI.
- Migración y traducción de código entre lenguajes: el resultado de 67,2 en SWE-bench Multilingual indica capacidad para trabajar con bases de código en distintos lenguajes de programación.
- Procesamiento de contratos o expedientes extensos: la ventana extensible hasta 1.010.000 tokens permite ingerir documentos muy largos en una sola pasada para extracción de cláusulas o resúmenes estructurados.
- Despliegue en infraestructura modesta: al activar solo ≈3 B de parámetros por token, el coste de cómputo por inferencia es bajo en comparación con modelos densos de tamaño similar, lo que facilita servir la versión FP8 en una sola GPU de 80 GB.

## Benchmarks y rendimiento

Datos extraídos de la model card del modelo base (Qwen3.6-35B-A3B). La tabla original quedó truncada en la información disponible, por lo que solo se reproducen las filas completas.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | no disponible (truncado) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de visión para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: el repositorio pesa 37,5 GB, por lo que se necesitan al menos ~40 GB de VRAM para cargar los pesos, más espacio para caché KV. Con contexto largo la demanda de memoria crece de forma significativa.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con 48 GB o más para FP8 con contexto moderado. Para contexto completo de 262.144 tokens se recomienda al menos 80 GB y, preferiblemente, múltiples GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en FP8 sin offloading. Sería necesario recurrir a cuantizaciones adicionales (por ejemplo, GGUF de 4 bits) no incluidas en este repositorio.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers, según declara la model card. llama.cpp y Ollama no están confirmados para este formato FP8.
- Latencia y throughput: no disponibles en la información proporcionada. El uso de MTP con decodificación especulativa y la activación de solo ≈3 B de parámetros por token deberían reducir la latencia frente a modelos densos de tamaño comparable, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35,95 B | ≈3 B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | ≈35 B | ≈3 B | no disponible | 70,0 | Apache 2.0 (presumible) |
| Qwen3.5-27B | 27 B | denso | no disponible | 75,0 | Apache 2.0 (presumible) |
| Gemma4-31B | 31 B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26 B | ≈4 B | no disponible | 17,4 | no disponible |

## Limitaciones y advertencias

- Esta réplica concreta (AIGAROU/292d9xb3bffb3oenxj393nc) no está verificada por el equipo Qwen; se desconoce si los pesos FP8 han sido alterados respecto al original. Para producción conviene usar el repositorio oficial Qwen/Qwen3.6-35B-A3B-FP8.
- La model card del repositorio es una copia de la del modelo base y no documenta el proceso de conversión ni validaciones de esta réplica específica.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo y contexto extenso.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos habituales de los datasets web a gran escala.
- Idiomas soportados no especificados; el rendimiento en castellano no está evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia de los pesos de esta réplica concreta.
- El contexto de 1.010.000 tokens es una extensión declarada; el rendimiento real en longitudes muy superiores a 262.144 tokens puede degradarse.
- La tabla de benchmarks está truncada en la información disponible, por lo que faltan resultados de varias categorías.
- El despliegue en FP8 requiere hardware con soporte nativo (Ada Lovelace, Hopper o superior); GPUs más antiguas pueden no aprovechar el formato.

## Enlaces

- Repositorio de esta réplica: https://huggingface.co/AIGAROU/292d9xb3bffb3oenxj393nc
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio FP8 oficial: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8/blob/main/LICENSE
