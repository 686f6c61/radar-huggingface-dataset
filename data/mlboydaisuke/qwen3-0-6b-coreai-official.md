# mlboydaisuke/qwen3-0.6b-CoreAI-official

## Resumen

Este repositorio contiene el modelo Qwen3-0.6B convertido al formato `.aimodel` de Apple Core AI, siguiendo la receta oficial de exportación del proyecto `apple/coreai-models`. El autor, mlboydaisuke, publica los artefactos pre-convertidos y verificados con hashes SHA-256, junto con mediciones de rendimiento realizadas con la herramienta oficial `llm-benchmark` de Apple en hardware como el M4 Max y el iPhone 17 Pro. La relevancia radica en que permite ejecutar un modelo de lenguaje de 0.6B parámetros completamente en el dispositivo Apple, sin conexión, con cuantización int4 y optimizaciones para Neural Engine y GPU.

El modelo base es Qwen3-0.6B, un LLM pequeño de la familia Qwen3, aunque en la información proporcionada no se detallan su arquitectura interna ni sus datos de entrenamiento. El repositorio incluye tres bundles: dos para macOS (uno exportado con macOS 27 beta y otro con macOS 26, siendo este último 2.2 veces más rápido) y uno para iOS con contexto estático de 4096 tokens y cuantización mixta 4/8-bit paletizada. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3-0.6B) |
| Parametros totales | 0.6B (según nombre del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 4096 tokens (iOS, estático); no disponible para macOS |
| Tipos de cuantizacion | int4 (macOS); mixto 4/8-bit paletizado (iOS) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .aimodel (formato propietario de Apple Core AI) |

## Arquitectura y entrenamiento

No se proporciona información detallada sobre la arquitectura interna del modelo ni sobre su proceso de entrenamiento. El modelo base es Qwen3-0.6B, un transformer de 0.6 mil millones de parámetros, pero no se especifican detalles como el número de capas, dimensiones ocultas o el dataset utilizado. El repositorio se centra en el proceso de conversión al formato `.aimodel` mediante la herramienta `coreai.llm.export` de Apple, que aplica cuantización int4 (en macOS) o mixta 4/8-bit (en iOS) y optimizaciones específicas para el hardware Apple Silicon. La conversión se realizó con el entorno `coreai-core 1.0.0b1`, `coreai-torch 0.4.0`, `coreai-opt 0.2.0` y `torch 2.9.0`, sobre macOS 27 beta y Xcode 27 beta.

Un dato técnico relevante es que el artefacto exportado con macOS 26 presenta un rendimiento 2.2 veces superior al exportado con macOS 27 beta, debido a que la versión más reciente introduce operaciones explícitas de dequantización en el programa MLIR, mientras que la versión anterior mantiene una lowerización nativa con cuantización lineal sin operaciones de dequant. Esto demuestra que el artefacto `.aimodel` no es una función pura de la receta de exportación, sino que depende del sistema operativo que lo genera.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 0.6B, puede generar texto coherente en tareas simples, aunque con limitaciones propias de su tamaño.
- Ejecución totalmente en el dispositivo: funciona sin conexión a internet, tanto en macOS como en iOS, gracias al formato `.aimodel` y al runtime Core AI.
- Soporte multi-turno: la API `ChatSession` permite mantener historial de conversación y generar respuestas turno a turno, con streaming de tokens mediante `streamResponse(to:)`.
- Integración con el ecosistema Apple: se puede usar desde Swift mediante `CoreAIKit` o `CoreAIOps`, con descarga automática del modelo en el primer uso (0.4 GB en Mac, 0.5 GB en iPhone).
- No se especifican capacidades de tool calling, razonamiento avanzado, visión o audio en la información disponible.

## Casos de uso

- Asistente conversacional offline en macOS: un usuario puede ejecutar un chat local con el modelo usando el ChatDemo incluido en el repositorio `coreai-kit`, sin necesidad de conexión a internet ni de servicios en la nube. Es adecuado para entornos con privacidad estricta o para desarrollo de prototipos rápidos.
- Aplicación iOS de resumen de texto: gracias al bundle iOS con contexto estático de 4096 tokens, se puede integrar en una app de iPhone para resumir documentos o notas directamente en el dispositivo, con baja latencia (69.6 tok/s en iPhone 17 Pro usando Neural Engine).
- Generación de texto en apps de productividad: por su pequeño tamaño y cuantización int4, puede ejecutarse en segundo plano en un Mac sin consumir demasiados recursos, permitiendo autocompletar correos, generar borradores o sugerir respuestas en herramientas de escritura.
- Pruebas de concepto de Core AI: desarrolladores que quieran evaluar el flujo de trabajo de Apple Core AI (exportación, compilación AOT para iOS, integración Swift) pueden usar este modelo como referencia, ya que los artefactos están verificados con hashes y métricas publicadas.
- Benchmarking de hardware Apple Silicon: el repositorio incluye mediciones detalladas de decode, prefill y carga en M4 Max e iPhone 17 Pro, lo que permite comparar el rendimiento de distintas generaciones de chips o de distintas versiones de macOS.
- Desarrollo de agentes simples en macOS: mediante la CLI `chat-cli` incluida en `coreai-kit`, se pueden construir pipelines headless que ejecuten el modelo en scripts o servicios, aprovechando la API de streaming para respuestas incrementales.

## Benchmarks y rendimiento

Se han publicado mediciones de rendimiento realizadas con la herramienta oficial `llm-benchmark` de Apple, en modo greedy. No se incluyen benchmarks de calidad (MMLU, HumanEval, etc.) en la información disponible.

| Bundle | Protocolo | Decode (tok/s) | Prefill (tok/s) | Carga (warm) |
|---|---|---|---|---|
| macOS (27β) | M4 Max, 512p/1024g | 484 | 9,396 | 0.10 s |
| macOS-26-export | M4 Max, 512p/512g warm | 1,121 | — | — |
| macOS-26-export | iPhone 17 Pro GPU (h18p), 512p/1024g | 115 | 5,807 | 0.07 s |
| iOS (ANE, h18p) | iPhone 17 Pro, 512p/1024g | 69.6 | 5,325 | 0.045 s |

El bundle exportado con macOS 26 es significativamente más rápido que el de macOS 27 beta, debido a diferencias en la lowerización del grafo MLIR. No se proporcionan resultados de benchmarks de calidad del modelo.

## Requisitos de hardware

- Hardware mínimo: cualquier Mac con Apple Silicon (M1 o posterior) o iPhone con chip A17 Pro o posterior (para el bundle iOS con soporte de Neural Engine).
- VRAM estimada: no disponible, pero el modelo descargado ocupa 0.4 GB en Mac y 0.5 GB en iPhone; al ser un modelo de 0.6B cuantizado a int4, la memoria necesaria para mmap es inferior a 1 GB.
- GPU recomendada: M4 Max (probado en las mediciones) o cualquier GPU integrada de Apple Silicon; el bundle iOS puede usar GPU o Neural Engine.
- Si cabe en consumer GPU: sí, cualquier Mac con Apple Silicon puede ejecutarlo sin problemas, y también un iPhone moderno.
- Opciones de despliegue: mediante `coreai-kit` (SPM), `CoreAIOps` (tarea op), o la CLI `llm-runner` del proyecto `coreai-models`. No se mencionan vLLM, llama.cpp u otras herramientas estándar, ya que el formato `.aimodel` es exclusivo de Apple Core AI.
- Latencia y throughput: los valores medidos se muestran en la tabla de benchmarks; el decode oscila entre 69.6 y 1,121 tok/s según el dispositivo y la versión del bundle.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo formato `.aimodel` o con el mismo tamaño en el contexto de Apple Core AI. La comparativa con otros modelos de 0.6B (como el propio Qwen3-0.6B en formato GGUF o safetensors) no se puede realizar con los datos proporcionados, ya que no se incluyen benchmarks de calidad ni métricas de otros formatos.

## Limitaciones y advertencias

- El bundle exportado con macOS 27 beta es 2.2 veces más lento que el exportado con macOS 26, y el artefacto de macOS 26 no puede recrearse en la versión 27 beta. Esto implica que el rendimiento depende críticamente del entorno de exportación, lo que puede afectar a la reproducibilidad en producción.
- Los bundles iOS requieren compilación AOT antes de su uso en el dispositivo (`xcrun coreai-build compile`), lo que añade un paso adicional en el flujo de integración.
- El modelo es de tamaño muy reducido (0.6B), por lo que su calidad de generación, razonamiento y cobertura de conocimientos es limitada en comparación con modelos más grandes. No se recomienda para tareas que requieran alta precisión o comprensión profunda.
- No se especifican sesgos conocidos, riesgos de alucinación ni limitaciones de idioma, pero al ser un modelo pequeño, es más propenso a errores factuales y a respuestas incoherentes en contextos largos.
- La licencia Apache-2.0 permite uso comercial, pero el formato `.aimodel` y las herramientas asociadas son propiedad de Apple; se debe verificar la compatibilidad con los términos de uso de la plataforma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/qwen3-0.6b-CoreAI-official
- Receta de exportación oficial de Apple: https://github.com/apple/coreai-models
- Kit de integración Swift (CoreAIKit): https://github.com/john-rocky/coreai-kit
- Benchmarks de Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Apps de ejemplo (CoreAIChatMac): https://github.com/john-rocky/coreai-samples
- Zoológico de modelos comunitarios: https://github.com/john-rocky/coreai-model-zoo
- Documentación de lowerización Core AI: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/methodology/coreai-export-lowering.md
- Cookbook de CoreAIKit: https://github.com/john-rocky/coreai-kit/blob/main/docs/COOKBOOK.md
