# Fastiraz/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso y multimodal (visión y lenguaje) desarrollado por el equipo Qwen de Alibaba. Forma parte de la familia Qwen3.8, la generación más capaz hasta la fecha, y se distribuye bajo licencia Apache 2.0. Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de larga duración, con un enfoque especial en la ejecución fiable de tareas multi-paso y la comprensión de imágenes y vídeos.

El modelo combina una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) con una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 mediante técnicas de escalado RoPE como YaRN. Con 27.320 millones de parámetros, ofrece un equilibrio entre capacidad y despliegue local, pudiendo ejecutarse en configuraciones de 17 GB de VRAM/RAM gracias a cuantizaciones GGUF y NVFP4. Incluye un modo de razonamiento flexible (thinking mode) activable por petición y soporte nativo para tool calling y agentes.

El repositorio Fastiraz/Qwen3.8-27B-GGUF proporciona versiones cuantizadas del modelo mediante Unsloth Dynamic V3.0, optimizadas para inferencia eficiente en hardware variado. La disponibilidad de pesos en formato GGUF facilita su uso con llama.cpp, Ollama, LM Studio y otros runners locales, mientras que el modelo base en safetensors está pensado para despliegues con vLLM o TGI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido Gated DeltaNet (linear attention) + Gated Attention (full attention) + FFN |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 con RoPE scaling (YaRN) |
| Tipos de cuantizacion | GGUF (varias, via Unsloth Dynamic V3.0), NVFP4, FP16, BF16 |
| Idiomas soportados | No disponible (se espera multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base), GGUF (repo Fastiraz) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de transformer causal con un encoder de visión integrado. La estructura del modelo es de 64 capas, con un layout oculto de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. El Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128, mientras que el Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120 y el FFN tiene dimensión intermedia 17.408.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, con un mecanismo de Multi-Token Prediction (MTP) entrenado en múltiples pasos para acelerar la inferencia. El modelo soporta control flexible del razonamiento: el modo de pensamiento está activado por defecto y puede desactivarse por petición, con ajuste de profundidad mediante `reasoning_effort` y preservación de contexto de razonamiento histórico mediante `preserve_thinking`. No se han proporcionado datos específicos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (thinking mode) activable por petición, con parámetros de muestreo recomendados para cada modo.
- Comprensión multimodal nativa: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Soporte de tool calling y function calling, con mejoras en el parseo de objetos anidados para mayor fiabilidad.
- Capacidades de agente: planificación autónoma y manejo de feedback del entorno para tareas multi-paso de larga duración.
- Generación de código, matemáticas y tareas profesionales de oficina.
- Multilingüe (esperado, aunque no se detallan idiomas específicos).
- MTP (Multi-Token Prediction) para inferencia más rápida.
- Compatibilidad con agentic tools como Codex y soporte para integración en entornos de desarrollo.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar y revisar código con contexto largo (hasta 262k tokens), permitiendo mantener el historial completo de un repositorio o sesión de depuración. Su soporte de tool calling facilita la integración con herramientas de CI/CD y sistemas de control de versiones.
- Automatización de oficina: procesamiento de documentos extensos, generación de informes y resúmenes, y extracción de información de tablas y gráficos gracias a su capacidad de visión. El modo de razonamiento permite verificar la coherencia de los resultados.
- Análisis de vídeo de vigilancia o contenido multimedia: comprensión de vídeos de larga duración (hasta una hora) para resumir eventos, detectar anomalías o extraer metadatos. La ventana de contexto amplia permite procesar secuencias completas sin segmentación.
- Agente de atención al cliente: gestión de conversaciones multi-turno con memoria persistente, utilizando el modo de razonamiento para planificar respuestas y tool calling para consultar bases de conocimiento o APIs externas.
- Investigación académica: análisis de papers extensos, generación de resúmenes de literatura y asistencia en la redacción de artículos. La capacidad de razonamiento profundo ayuda a estructurar argumentos complejos.
- Despliegue local en hardware de consumo: gracias a cuantizaciones GGUF de 4 bits, el modelo puede ejecutarse en GPUs de 16 GB (como RTX 4090) o incluso en sistemas con 17 GB de RAM/VRAM combinados, permitiendo uso offline en aplicaciones de escritorio o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento comparativo (MMLU, HumanEval, GSM8K, etc.) ni métricas específicas de visión o agentes. Se recomienda consultar el repositorio oficial de Qwen para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, el modelo requiere aproximadamente 54-55 GB de VRAM (27B × 2 bytes). Con cuantización Q4_K_M (GGUF), se reduce a unos 14-16 GB, y con Q8 a ~28 GB.
- GPUs recomendadas: para FP16, se necesitan GPUs de clase profesional como A100 80GB, H100 80GB o RTX A6000. Con cuantización 4-bit, cabe en GPUs consumer como RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso RTX 3090 (24 GB). Según Unsloth, el modelo puede ejecutarse en configuraciones de 17 GB de RAM/VRAM combinados.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, LM Studio y Unsloth Desktop. El repo GGUF es compatible con todos los runners basados en llama.cpp.
- Latencia y throughput: no se han proporcionado datos concretos. Con MTP, se espera una mejora significativa en velocidad de decodificación respecto a modelos sin esta técnica, pero los valores exactos dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262k nativo, 1M extensible | Apache 2.0 | Denso, híbrido DeltaNet + Attention + Vision |
| Qwen2.5-32B | 32B | 128k | Apache 2.0 | Denso, transformer estándar |
| Gemma 3 27B | 27B | 128k | Gemma Terms (uso comercial permitido) | Denso, transformer estándar con visión |

No se dispone de datos de rendimiento comparativo en la información proporcionada. Qwen3.8-27B destaca por su contexto nativo superior (262k frente a 128k) y su arquitectura híbrida con MTP, mientras que Gemma 3 27B también ofrece capacidades multimodales pero con una ventana de contexto menor. La licencia Apache 2.0 de Qwen3.8-27B es más permisiva que los términos de Gemma.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información proporcionada, pero al ser un modelo entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento profundo o con contextos muy largos. Se recomienda verificar hechos críticos.
- El contexto de 1M tokens requiere técnicas de escalado RoPE (como YaRN) que pueden degradar ligeramente el rendimiento en longitudes extremas.
- La comprensión de vídeo se limita a vídeos de hasta una hora y depende del preprocesador de vídeo; la calidad puede variar según la resolución y el contenido.
- Aunque la licencia Apache 2.0 permite uso comercial, los modelos derivados deben mantener la atribución y no pueden usar marcas registradas de Alibaba.
- El repositorio GGUF de Fastiraz tiene un tamaño de 726 GB, lo que implica que contiene múltiples cuantizaciones; es necesario seleccionar el archivo adecuado para el hardware disponible.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/Fastiraz/Qwen3.8-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de AlibabaCloud-Official: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (Yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
