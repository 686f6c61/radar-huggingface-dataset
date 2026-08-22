# orcarouter/Qwen3.8-27B-MLX

## Resumen

Qwen3.8-27B-MLX es una compilación en formato MLX del modelo oficial Qwen/Qwen3.8-27B, publicada por OrcaRouter (orcarouter) el 21 de agosto de 2026. Se trata de un modelo denso de 27 000 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), diseñado de forma nativa para visión-lenguaje (image-text-to-text), con control de pensamiento (thinking mode), soporte de tool calling y una cabeza de predicción multi-token (MTP) para decodificación especulativa. La compilación MLX ofrece cuantizaciones afines de 4, 6 y 8 bits, manteniendo la torre de visión, las normalizaciones y las capas convolucionales en BF16, lo que permite ejecutar el modelo en Apple Silicon con memoria unificada.

La relevancia de esta ficha radica en que Qwen3.8-27B es uno de los primeros modelos de 27B con visión y razonamiento híbrido que se puede ejecutar localmente en hardware de consumo (Mac con 24 GB o más de RAM), gracias a la cuantización MLX. El repositorio incluye además un drafter MTP separado en BF16 (~0,9 GB) que acelera la generación mediante decodificación especulativa sin pérdida de calidad. La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo soporta inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, atención híbrida (Gated DeltaNet lineal + atención completa), visión-lenguaje, cabeza MTP |
| Parametros totales | 27B (modelo base); 4.665.462.000 según safetensors del repositorio MLX |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (grupo 64), 6-bit (grupo 32), 8-bit (grupo 32), drafter MTP en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura densa con atención híbrida: combina capas de atención lineal basadas en Gated DeltaNet con capas de atención completa (full attention). Esta mezcla busca reducir el coste computacional en secuencias largas manteniendo la calidad de la atención estándar. El modelo integra una torre de visión (vision tower) que permite procesar imágenes junto con texto, y una cabeza de predicción multi-token (MTP) que, en la compilación MLX, se carga como un drafter separado para decodificación especulativa. El control de pensamiento (thinking mode) permite alternar entre respuestas razonadas y directas, y el soporte de tool calling habilita la integración con funciones externas.

Los datos de entrenamiento del modelo base no se han publicado en la información disponible. La compilación MLX de OrcaRouter no modifica los pesos del modelo original, solo los cuantiza: la torre de visión, las normalizaciones y las capas convolucionales se mantienen en BF16, mientras que los pesos lineales del modelo de lenguaje (incluyendo embed_tokens y lm_head) se cuantizan. Esta estrategia preserva la calidad visual y reduce el uso de memoria. No se dispone de información sobre el uso de RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento multi-turno con control de pensamiento (thinking mode) activable o desactivable.
- Comprensión de imágenes: entrada multimodal image-text-to-text para descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- Tool calling / function calling: puede invocar herramientas externas y estructurar llamadas a funciones.
- Decodificación especulativa mediante cabeza MTP: acelera la generación sin pérdida de calidad (aceptación lossless).
- Capacidades multilingües en inglés y chino.
- Servidor compatible con la API de OpenAI (a través de mlx-vlm server) para integración en aplicaciones existentes.

## Casos de uso

- Asistente multimodal en Mac: un usuario puede preguntar sobre una imagen local (por ejemplo, "describe este gráfico" o "extrae el texto de esta captura") y obtener respuestas razonadas con el modelo en 4-bit, ejecutándose en una Mac con 24 GB de RAM unificada.
- Generación de código con tool calling en local: el modelo puede integrarse en un entorno de desarrollo para autocompletar, refactorizar o generar tests, invocando herramientas de análisis estático mediante function calling, todo sin conexión a internet.
- Razonamiento complejo con thinking mode: para tareas de lógica, matemáticas o planificación, se activa el modo de pensamiento que produce cadenas de razonamiento antes de la respuesta final, útil en investigación o educación.
- Chat conversacional bilingüe: al soportar inglés y chino, puede servir como asistente de atención al cliente o traducción informal en ambos idiomas, desplegado en un servidor local compatible con OpenAI.
- Prototipado rápido en Apple Silicon: desarrolladores que no disponen de GPUs NVIDIA pueden probar un VLM de 27B en su MacBook Pro o Mac Studio usando mlx-vlm, sin necesidad de infraestructura cloud.
- Decodificación especulativa para baja latencia: en entornos donde la velocidad de respuesta es crítica (por ejemplo, chatbots en tiempo real), el drafter MTP reduce el número de pasos de avance, mejorando el throughput en hardware Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente reporta métricas de divergencia KL y acuerdo Top-1 frente al modelo BF16 de referencia (wikitext-2, 1024 tokens), que se resumen a continuación:

| Precision | Mean KLD | KLD p95 | Acuerdo Top-1 |
|---|---:|---:|---:|
| 8-bit | 0.00068 | 0.00233 | 98.34 % |
| 6-bit | 0.00216 | 0.00795 | 96.97 % |
| 4-bit | 0.02824 | 0.10857 | 92.68 % |

Estos datos indican que la cuantización de 8 y 6 bits es prácticamente indistinguible del modelo original, mientras que la de 4 bits mantiene un acuerdo alto pero con mayor divergencia.

## Requisitos de hardware

- 4-bit: ~16 GB de memoria unificada, requiere Mac con 24 GB o más de RAM (16 GB no es suficiente).
- 6-bit: ~24 GB de memoria unificada, requiere Mac con 32 GB o más.
- 8-bit: ~31 GB de memoria unificada, requiere Mac con 32–64 GB.
- Drafter MTP: ~0.9 GB adicionales en BF16.
- GPU: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se requiere GPU NVIDIA.
- Opciones de despliegue: mlx-vlm (CLI y servidor OpenAI-compatible), LM Studio (cargando la raíz del repositorio que apunta a 4-bit), Ollama (etiqueta `qwen3.8:27b-mlx` desde la versión 0.32.12).
- Latencia y throughput: no disponibles. Se recomienda el drafter MTP para mejorar la velocidad de generación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (VLM de ~27B en formato MLX). La comparación más directa es contra el propio modelo base en BF16 y entre las distintas cuantizaciones, cuyas diferencias de calidad se reflejan en la tabla de benchmarks. Existen versiones alternativas del mismo modelo en otros formatos (GGUF y FP8) publicadas por OrcaRouter, pero no son modelos distintos. Para una comparativa con alternativas como Qwen2.5-VL-7B o Llama-3.2-11B-Vision, no hay información suficiente en los datos proporcionados.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización de 4 bits introduce una degradación medible de calidad (KLD medio 0.028, acuerdo Top-1 del 92.68 %), que puede afectar a tareas de precisión como razonamiento matemático o extracción de datos.
- Requiere hardware Apple Silicon con al menos 24 GB de memoria unificada; los Mac de 16 GB no pueden ejecutar el modelo en 4 bits.
- En LM Studio, la cuantización de la caché KV no está soportada en esta arquitectura de visión; debe desactivarse para evitar fallos de carga.
- La versión de mlx-vlm debe ser igual o superior a 0.6.13 y mlx >= 0.32 para soportar el tipo de modelo `qwen3_5`.
- No se documentan sesgos específicos del modelo base, pero al ser un VLM entrenado principalmente en inglés y chino, puede presentar sesgos culturales o alucinaciones visuales en imágenes ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de la licencia del modelo base y de cualquier dependencia de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de OrcaRouter sobre MLX en Apple Silicon: https://www.orcarouter.ai/blog/qwen-3-8-27b-mlx
- Artículo de ExplainX sobre la compilación: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- GitHub de Continuum-AI-Corp (OrcaRouter): https://github.com/Continuum-AI-Corp
