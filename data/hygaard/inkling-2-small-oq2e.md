# Hygaard/Inkling-2-Small-oQ2e

## Resumen

Inkling-2-Small-oQ2e es una conversión cuantizada en formato MLX del modelo multimodal Inkling-2-Small, desarrollado originalmente por Thinking Machines. Se trata de un modelo image-text-to-text de arquitectura Mixture of Experts (MoE) con 48 capas de texto, 384 expertos enrutados por capa y enrutamiento top-8, cuyo objetivo es ofrecer capacidades de razonamiento y comprensión de imágenes en un formato extremadamente comprimido para ejecución en hardware Apple Silicon.

La relevancia de esta ficha radica en su estrategia de cuantización mixta: los expertos enrutados se almacenan a 2 bits, mientras que componentes sensibles como la cabeza de salida, embeddings y atención se mantienen a 8 bits, y los routers y controles de atención-residual en FP32. El resultado es un peso efectivo de 2,61 bits por parámetro (BPW), con 194,7 GB de pesos totales incluyendo el sidecar MTP, partiendo de 595.762.352.304 parámetros escalares originales.

El modelo base fue convertido directamente desde los tensores MXFP8 publicados por Thinking Machines, sin pasar por un maestro BF16 ni por otra cuantización intermedia. Requiere la implementación nativa de Inkling 2 en oMLX (PR #5229), no siendo compatible con la arquitectura genérica de `mlx-lm`. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) con 48 capas de texto, 384 expertos enrutados por capa, top-8 routing; incluye encoder de visión y sidecar MTP/draft |
| Parametros totales | 595.762.352.304 parametros escalares originales |
| Parametros activos | no disponible (top-8 de 384 expertos por capa; el numero exacto de parametros activos no se detalla) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 2 bits (expertos enrutados), 8 bits (cabeza de salida, embeddings, atención), BF16 (convoluciones, normalización, encoder de visión, MTP), FP32 (routers, controles de atención-residual); 2,61 BPW efectivos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantización nativa oQ2e); incluye directorio `tiktoken/` obligatorio |

## Arquitectura y entrenamiento

Inkling-2-Small es un transformer MoE multimodal con 48 capas de texto y 384 expertos enrutados por capa, con enrutamiento top-8. El modelo incorpora un encoder de visión y un merger/proyector que lo habilitan para la tarea image-text-to-text. Adicionalmente incluye un sidecar MTP (Multi-Token Prediction) en BF16 que actúa como modelo draft, lo que sugiere soporte para decodificación especulativa. Los routers y los controles de atención-residual se mantienen en FP32, mientras que las matrices de expertos enrutados se comprimen a 2 bits.

La conversión fue realizada por Hygaard directamente desde los tensores MXFP8 de Thinking Machines (commit `086a047e8b7ff2ac902dd52355328ddb66b16914`), preservando el encoder de visión, el tokenizer/template original y el sidecar MTP en BF16. La calibración utilizó activaciones nativas del modelo fuente: 384 secuencias de 512 tokens con cobertura completa de expertos enrutados, entradas reales de imagen y texto, y mediciones de sensibilidad nativas frescas. No se aplicó poda de expertos, forzado de rutas ni fallback sintético de importancia. Los detalles de procedencia y la transformación de privacidad del informe de calibración están en `CONVERSION.json`.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline image-text-to-text permite procesar imágenes junto con texto para generar respuestas descriptivas o analíticas.
- Comprensión de imágenes: incluye encoder de visión (292.041.728 parámetros en BF16) y merger/proyector (35.651.584 parámetros en BF16), validado con generación sobre imágenes reales.
- Decodificación MTP: incorpora un sidecar de Multi-Token Prediction en BF16 (1.711.710.384 parámetros) que puede habilitar decodificación especulativa, aunque el autor indica que la decodificación MTP no fue probada.
- Procesamiento de contexto largo: la arquitectura soporta ventanas de contexto extensas, si bien los requisitos de KV/workspace crecen con el contexto y la capacidad de contexto completo no fue testeada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos con imágenes en local: el modelo puede procesar capturas, diagramas o páginas escaneadas junto con texto para extraer información estructurada, aprovechando su pipeline image-text-to-text y su ejecución en Apple Silicon sin dependencia de la nube.
- Asistentes de accesibilidad visual: descripción de imágenes y generación de texto alternativo en tiempo real sobre hardware M-series, gracias a la cuantización de 2,61 BPW que reduce el peso a 194,7 GB y permite cargarlo en equipos con 256 GB de memoria unificada.
- Investigación en cuantización extrema: el modelo sirve como caso de estudio para evaluar el impacto de cuantizar expertos MoE a 2 bits manteniendo routers en FP32, con calibración basada en activaciones nativas y cobertura completa de expertos.
- Prototipado de pipelines multimodales en MLX: desarrolladores que trabajan con el stack MLX de Apple pueden integrar el modelo mediante el loader nativo `omlx.patches.inkling2.vlm.load` para experimentar con decodificación especulativa vía MTP.
- Evaluación de robustez de conversiones cuantizadas: el `CONVERSION.json` y la auditoría de cabeceras locales permiten reproducir y auditar la precisión por componente, útil para equipos que validan pipelines de cuantización mixta.
- Generación de texto e imagen en entornos de investigación con requisitos de privacidad: al ejecutarse localmente en hardware Apple, evita el envío de datos a APIs externas, adecuado para datos sensibles en laboratorios.
- Benchmarking de arquitecturas MoE de gran escala: con 384 expertos por capa y top-8, permite estudiar el comportamiento de enrutamiento y la degradación por cuantización en modelos de casi 600.000 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la comprobación con imagen reutilizada a contexto corto es una validación mecánica, no un benchmark de calidad sobre datos held-out. Tampoco se probaron la decodificación MTP ni la capacidad de contexto completo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 194,716 GB (181,343 GiB) de pesos, incluyendo MTP. El pico del allocator MLX del modelo principal medido fue de 179,316 GiB, más KV cache y workspace que crecen con el contexto.
- GPU recomendadas: el autor probó en un Apple M5 Ultra con 256 GB de memoria unificada. No se reportan pruebas en A100, H100 ni RTX 4090; la librería es MLX, por lo que el despliegue está orientado a Apple Silicon.
- ¿Cabe en GPU consumer?: no en GPUs consumer convencionales (RTX 4090 con 24 GB, etc.). Requiere un equipo Apple Silicon con memoria unificada de al menos 256 GB para la carga estricta del modelo completo.
- Opciones de despliegue: implementación nativa de Inkling 2 en oMLX (PR #5229, commit `2a18263b91e14ee92ed984f8c5a56d0053178cea`), con loader `omlx.patches.inkling2.vlm.load`. No es compatible con `mlx-lm` genérico. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no reporta métricas de velocidad; solo confirma que la carga estricta y materialización de los 1.694 tensores principales pasó, seguida de generación determinista repetida de texto e imagen real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-oQ2e (este) | 595.762.352.304 escalares originales | no disponible | 2,61 BPW efectivos (MLX) | Apache 2.0 | Hugging Face, requiere oMLX PR #5229 |
| thinkingmachines/Inkling-2-Small-MXFP8 (base) | 595.762.352.304 escalares originales | no disponible | MXFP8 | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (MoE multimodal de ~600.000 millones de parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- Requiere hardware específico: solo se ha validado en Apple M5 Ultra con 256 GB de memoria unificada; no hay evidencia de funcionamiento en GPUs NVIDIA u otras plataformas.
- Dependencia de runtime no estándar: necesita la implementación nativa de Inkling 2 en oMLX (PR #5229), no la arquitectura genérica de `mlx-lm`. Es imprescindible conservar el directorio completo `tiktoken/`.
- Calidad no benchmarkeada: el autor advierte que la comprobación con imagen reutilizada es validación mecánica, no un benchmark de calidad held-out. No hay resultados de MMLU, HumanEval, GSM8K ni similares.
- Decodificación MTP no probada: el sidecar MTP está incluido pero su decodificación no fue testeada, por lo que el beneficio de la decodificación especulativa es incierto.
- Capacidad de contexto completo no verificada: los requisitos de KV/workspace crecen con el contexto y no se validó el funcionamiento a contexto máximo.
- Riesgo de degradación por cuantización extrema: los expertos enrutados a 2 bits pueden introducir pérdida de calidad frente al modelo MXFP8 original; no se reportan métricas de degradación.
- Idiomas no declarados: la model card no especifica los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Estado de publicación: en el momento de la información, la validación nativa estaba completa pero los pesos seguían subiendo ("weights uploading"), por lo que la integridad de la descarga debe verificarse.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un modelo de gran escala, deben asumirse los riesgos habituales de generación no verificada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y la conversión deben atribuirse conforme a los términos; verificar la licencia del modelo original de Thinking Machines.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Hygaard/Inkling-2-Small-oQ2e
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- PR de oMLX con la implementación nativa: https://github.com/jundot/omlx/pull/5229
- Commit de referencia del modelo base: `086a047e8b7ff2ac902dd52355328ddb66b16914`
- Commit de referencia de oMLX: `2a18263b91e14ee92ed984f8c5a56d0053178cea`
