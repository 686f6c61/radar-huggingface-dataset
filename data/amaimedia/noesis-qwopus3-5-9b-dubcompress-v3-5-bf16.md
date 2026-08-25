# AMAImedia/NOESIS-Qwopus3.5-9B-DubCompress-v3.5-BF16

## Resumen

NOESIS-Qwopus3.5-9B-DubCompress-v3.5-BF16 es un modelo de lenguaje especializado en compresión de diálogo, transformaciones orientadas a doblaje y procesamiento conversacional estructurado, desarrollado por AMAImedia como parte de su plataforma profesional de automatización de doblaje multilingüe NOESIS (framework DHCF-FNO). El modelo se basa en la arquitectura Qwen3.5 de Alibaba, con un total de 8.953.803.264 parámetros (aproximadamente 9B), y se distribuye bajo licencia Apache-2.0 en dos formatos: safetensors en BF16 y GGUF Q4_K_M para despliegue con llama.cpp.

El modelo está diseñado para tareas específicas de la industria del doblaje y la localización, como la compresión de diálogos manteniendo el contexto conversacional, la adaptación de guiones para doblaje y el procesamiento de conversaciones multilingües. Su relevancia radica en ofrecer un modelo open source especializado en un nicho concreto, con soporte declarado para 201 idiomas y dialectos según la cobertura de Qwen3.5, aunque la lista enumerada en la model card corresponde a la publicada para Qwen3 (119 idiomas). Es una herramienta orientada a profesionales que necesitan automatizar flujos de trabajo de doblaje con modelos de lenguaje, sin requerir entrenamiento adicional.

La versión actual (v3.5) se publica el 26 de agosto de 2026 como parte de la versión NOESIS v16.1, y su repositorio incluye tanto el checkpoint BF16 como un artefacto GGUF para inferencia local, lo que facilita su uso en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.5 (no se especifica detalle) |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | no disponible |
| Longitud de contexto | No disponible (modelo derivado de Qwen3.5, que soporta hasta 262.144 tokens en versiones similares) |
| Tipos de cuantización | BF16 (safetensors), GGUF Q4_K_M |
| Idiomas soportados | 201 idiomas y dialectos según declaración de Qwen3.5; la lista publicada incluye 119 idiomas de Qwen3 (inglés, francés, alemán, español, chino, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados o las técnicas de optimización (como RLHF o DPO). El modelo se presenta como un derivado de Qwen3.5, pero la model card no ofrece información sobre la estructura del transformer, el número de capas, el mecanismo de atención ni el proceso de fine-tuning. La única innovación técnica declarada es su especialización en tareas de doblaje y compresión de diálogo, aunque no se detallan los métodos empleados para lograr esta especialización. Se recomienda consultar la documentación de Qwen3.5 para obtener información sobre la arquitectura base.

## Capacidades

- **Compresión de diálogo**: el modelo está diseñado para reducir la longitud de conversaciones manteniendo el significado y la estructura, útil para subtitulado o doblaje.
- **Transformaciones orientadas a doblaje**: puede adaptar guiones y diálogos a formatos específicos de doblaje, incluyendo sincronización de tiempos y ajuste de estilo.
- **Procesamiento conversacional estructurado**: maneja conversaciones multi-turno y puede extraer información estructurada de diálogos.
- **Soporte multilingüe**: cubre 201 idiomas y dialectos según la declaración de Qwen3.5, aunque la lista oficial publicada para Qwen3 incluye 119 lenguas.
- **Compatibilidad con herramientas de inferencia**: el formato GGUF permite su uso con llama.cpp, Ollama y otros frameworks compatibles.

## Casos de uso

- **Subtitulado automático multilingüe**: el modelo puede comprimir diálogos para generar subtítulos más concisos y naturales en múltiples idiomas, reduciendo el trabajo manual de adaptación.
- **Preparación de guiones para doblaje**: permite convertir guiones originales en versiones adaptadas para doblaje, ajustando la longitud de las frases para sincronizar con la imagen.
- **Localización de contenido audiovisual**: las capacidades multilingües facilitan la adaptación de series, películas o videos educativos a diferentes mercados, manteniendo la coherencia del diálogo.
- **Análisis de conversaciones de atención al cliente**: puede procesar registros de chat o llamadas para extraer resúmenes o detectar problemas recurrentes, gracias a su habilidad para comprimir diálogos.
- **Asistentes de escritura de guiones**: los guionistas pueden usar el modelo para generar versiones comprimidas de sus diálogos o para explorar variantes de estilo en múltiples idiomas.
- **Preprocesamiento de datos para entrenamiento**: el modelo puede comprimir y normalizar diálogos para crear datasets de entrenamiento en tareas de NLP conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de MMLU, HumanEval, GSM8K o tareas de doblaje específicas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint BF16 (23.6 GB en el repositorio) requiere aproximadamente 18-20 GB de VRAM en FP16/BF16 para cargar los pesos completos. El GGUF Q4_K_M, con menor tamaño, puede ejecutarse con unos 5-6 GB de VRAM.
- **GPUs recomendadas**: para BF16 se recomiendan GPUs con al menos 24 GB de VRAM, como NVIDIA RTX 4090, A100 (40/80 GB) o similares. Para GGUF, es suficiente con GPUs de 8-12 GB, como RTX 3080/4060.
- **Compatibilidad con consumer GPU**: el modelo en GGUF puede ejecutarse en GPUs de gama media (RTX 3060 12 GB, RTX 4060 8 GB) con cuantización Q4_K_M, aunque la velocidad puede ser limitada. Para BF16 se requieren GPUs de gama alta.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (para BF16), Hugging Face Transformers, y cualquier framework compatible con GGUF o safetensors.
- **Latencia y throughput**: no se especifican datos concretos; dependen del hardware y del framework. En una RTX 4090 con GGUF Q4, se puede esperar una generación de ~20-30 tokens/seg para contexto corto, pero no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NOESIS-Qwopus3.5-9B-DubCompress-v3.5-BF16 (este) | 8.95B | No disponible | Apache-2.0 | HF (BF16 y GGUF) |
| Qwopus3.5 9B V3.5 (Jackrong) | 9.7B | 262.144 tokens | Apache-2.0 | HF |
| NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16 | 8.95B | No disponible | Apache-2.0 | HF (especializado en prompt engineering) |

Los tres modelos comparten base Qwen3.5 y licencia Apache-2.0. El modelo de Jackrong (Qwopus3.5 9B V3.5) ofrece un contexto de 262k tokens, mientras que los modelos de AMAImedia no especifican su longitud de contexto. El modelo PromptEng de AMAImedia está especializado en ingeniería de prompts, mientras que DubCompress se orienta a doblaje. No se disponen datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está optimizado para tareas de dblaje y compresión de diálogos, por lo que su rendimiento en otras tareas generales (razonamiento matemático, código) puede ser inferior al de modelos generalistas de tamaño similar.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en idiomas con pocos datos de entrenamiento.
- **Idiomas y cobertura**: la lista de 201 idiomas es una declaración de Qwen3.5, pero la enumeración concreta se basa en Qwen3 (119 idiomas). Es posible que algunos idiomas no tengan el mismo rendimiento que el inglés o el chino.
- **Licencia**: aunque es Apache-2.0, se recomienda verificar que los datos de entrenamiento no infrinjan derechos de autor, especialmente en aplicaciones comerciales de dblaje.
- **Dependencia de Qwen3.5**: cualquier limitación de la arquitectura base (sesgos, contexto) se hereda en este modelo.
- **Sin garantías de producción**: no se proporcionan métricas de calidad ni pruebas exhaustivas; se recomienda validar el modelo en casos de uso concretos antes de desplegarlo en entornos de producción.

## Enlaces

- [Hugging Face - NOESIS-Qwopus3.5-9B-DubCompress-v3.5-BF16](https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-DubCompress-v3.5-BF16)
- [Hugging Face - NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16](https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16)
- [ThinkLLM - Qwopus3.5 9B v3](https://thinkllm.dev/models/qwopus3-5-9b-v3)
- [LLMRun - Qwopus3.5 9B V3.5 Hardware Requirements](https://llmrun.dev/model/jackrong-qwopus3-5-9b-v3-5)
- [GitHub - Qwopus3.5-9B-v3.5 T4 Deployment](https://github.com/ctz168/qwenopus)
