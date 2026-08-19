# Gael1125/Qwen3.6-1

## Resumen

Gael1125/Qwen3.6-1 es un fine-tune LoRA del modelo Qwen3.6-27B, con los pesos del adaptador fusionados en los pesos base. El autor, Gael1125, ha publicado este repositorio como una variante lista para usar con la librería Transformers, manteniendo la arquitectura y capacidades del modelo original de Qwen. Qwen3.6-27B es la primera variante de pesos abiertos de la serie Qwen3.6, diseñada para priorizar la estabilidad y la utilidad real en tareas de codificación agéntica, con soporte para razonamiento de nivel repositorio y preservación del contexto de pensamiento en conversaciones históricas.

El modelo combina un codificador de visión con un modelo de lenguaje causal de 27 mil millones de parámetros, con una arquitectura híbrida que intercala capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention). Soporta un contexto nativo de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Este repositorio en particular es relevante porque ofrece una versión fusionada y lista para producción del modelo base, sin necesidad de cargar adaptadores por separado. Es adecuado para desarrolladores que buscan desplegar un modelo multimodal de 27B con capacidades de agente de codificación, razonamiento largo y comprensión de imágenes, todo en un único paquete de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 356 728 560 (~27B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente multilingüe, pero no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B presenta una arquitectura híbrida innovadora que combina atención lineal y atención completa. La configuración del modelo de lenguaje incluye 64 capas con un patrón de 16 bloques, cada uno compuesto por 3 subbloques de Gated DeltaNet seguidos de FFN, y luego un subbloque de Gated Attention con FFN. El Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120 y el FFN tiene dimensión intermedia de 17408. Se incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El repositorio Gael1125/Qwen3.6-1 es un fine-tune LoRA del modelo base, con los adaptadores fusionados en los pesos principales. No se proporcionan detalles sobre el dataset de fine-tuning ni el proceso de entrenamiento específico. El modelo base fue pre-entrenado y post-entrenado, pero la información sobre el volumen de tokens o la composición del corpus no está disponible en la documentación proporcionada.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas de texto (pipeline image-text-to-text).
- Codificación agéntica: maneja flujos de trabajo de frontend y razonamiento a nivel de repositorio con precisión, según las mejoras declaradas de Qwen3.6.
- Preservación del pensamiento: puede retener el contexto de razonamiento de mensajes históricos, facilitando el desarrollo iterativo.
- Razonamiento de contexto largo: soporta hasta 262 144 tokens nativos, extensible a más de 1 millón, ideal para análisis de repositorios completos o documentos extensos.
- Generación de código y razonamiento matemático: hereda las capacidades del modelo base, aunque no se proporcionan benchmarks específicos en este repositorio.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación, pero es una capacidad típica de la serie Qwen3; se requiere verificación adicional.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code para sugerir código, explicar fragmentos y refactorizar, aprovechando su contexto largo para considerar todo el proyecto.
- Revisión de código automatizada: con su capacidad de razonamiento a nivel de repositorio, puede analizar pull requests, detectar bugs y proponer correcciones en múltiples archivos.
- Agente de automatización de tareas de frontend: puede generar componentes HTML/CSS/JavaScript a partir de descripciones o capturas de pantalla, gracias a su codificador de visión.
- Análisis de documentación técnica extensa: su contexto de 262K tokens permite procesar manuales, especificaciones o libros completos en una sola pasada, extrayendo información y respondiendo preguntas.
- Chatbot de soporte técnico multimodal: puede recibir capturas de pantalla de errores o diagramas y proporcionar soluciones detalladas, combinando visión y razonamiento.
- Generación de informes a partir de imágenes y datos: el modelo puede analizar gráficos, tablas o figuras y generar resúmenes textuales o informes estructurados.
- Desarrollo de agentes autónomos de codificación: su capacidad de preservar el contexto de pensamiento y razonar sobre repositorios lo hace adecuado para pipelines de agentes que resuelven issues de GitHub.

## Benchmarks y rendimiento

La model card del modelo base Qwen3.6-27B incluye resultados de benchmarks en tareas de codificación agéntica. Se presentan los valores disponibles (la tabla original está incompleta en la información proporcionada):

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 76.2 | 52.0 | 80.9 | 73.4 | 77.2 |
| SWE-bench Pro | 51.2 | 50.9 | 35.7 | 57.1 | 49.5 | 53.5 |
| SWE-bench Multilingual | 69.3 | 69.3 | no disponible | no disponible | no disponible | no disponible |

No se dispone de más datos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo completo en fp16 se requieren aproximadamente 55 GB (27B × 2 bytes). Con cuantización de 8 bits se reduce a ~28 GB, y con 4 bits a ~14 GB. Estas son estimaciones basadas en el tamaño de parámetros; no se han publicado cifras oficiales.
- GPU recomendadas: para fp16, una NVIDIA A100 80GB o H100 80GB. Para cuantización 8 bits, una RTX 4090 (24GB) puede ser suficiente con contexto moderado. Para 4 bits, GPUs con 16GB podrían funcionar.
- En consumer GPU: es viable con cuantización (por ejemplo, RTX 4090 con 4-8 bits) para contextos cortos; el contexto máximo de 262K tokens requerirá mucha más memoria.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. También está disponible en Ollama (biblioteca qwen3.6).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Verified | SWE-bench Pro |
|---|---|---|---|---|---|
| Qwen3.6-27B (este repo) | 27B denso | 262K (ext. 1M) | Apache 2.0 | 77.2 | 53.5 |
| Qwen3.5-27B | 27B denso | no disponible | Apache 2.0 | 75.0 | 51.2 |
| Qwen3.6-35B-A3B | 35B total, 3B activo (MoE) | no disponible | Apache 2.0 | 73.4 | 49.5 |
| Gemma4-31B | 31B denso | no disponible | Gemma license | 52.0 | 35.7 |

El modelo Qwen3.6-27B supera a su predecesor Qwen3.5-27B y al MoE Qwen3.6-35B-A3B en SWE-bench, y queda por debajo de Claude 4.5 Opus (modelo propietario). Gemma4-31B es claramente inferior en estas tareas.

## Limitaciones y advertencias

- Al ser un fine-tune LoRA fusionado, el modelo puede heredar sesgos o limitaciones del modelo base, pero no se ha publicado ninguna evaluación específica de sesgos para este repositorio.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el uso de la extensión a 1M tokens puede degradar el rendimiento en tareas que requieren precisión posicional o recuperación exacta de información lejana.
- Idiomas: no se especifican los idiomas soportados; se recomienda verificar el comportamiento en español y otros idiomas antes de usarlo en producción.
- Requisitos de hardware: el tamaño de 27B y el contexto largo implican altos requisitos de memoria; sin cuantización, no es viable en GPUs de consumo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye un aviso de modificaciones (NOTICE) que debe conservarse al redistribuir el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Gael1125/Qwen3.6-1
- Modelo base Qwen3.6-27B (referencia): https://huggingface.co/Qwen/Qwen3.6-27B
- GitHub oficial de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6
