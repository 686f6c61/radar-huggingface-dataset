# RedHatAI/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-27B, desarrollado por el equipo Qwen (Alibaba) y publicada en Hugging Face por RedHatAI. Se trata de un modelo denso de 27 781 427 952 parámetros (aproximadamente 27,8 B) con arquitectura causal de lenguaje que incorpora un codificador de visión, lo que lo convierte en un modelo nativo de imagen-texto-a-texto (image-text-to-text). Su pipeline declarado es image-text-to-text y es compatible con transformers, vLLM, SGLang y TokenSpeed.

El modelo se apoya en la base arquitectónica de la familia Qwen3.5 y representa, según su model card, la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, con mejoras en programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Incorpora control flexible del modo de razonamiento (thinking activado por defecto, desactivable por petición, con `reasoning_effort` y `preserve_thinking`) y comprensión nativa de imágenes y vídeos.

Esta versión concreta aplica cuantización FP8 de grano fino con tamaño de bloque 128, lo que reduce el peso del repositorio a 30,9 GB manteniendo, según el autor, métricas de rendimiento casi idénticas a las del modelo original. Es relevante para despliegues de producción que necesitan un modelo multimodal de ~27B con contexto largo (262 144 tokens nativos, extensible a 1 000 000) y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; layout híbrido Gated DeltaNet + Gated Attention |
| Parámetros totales | 27 781 427 952 (~27,8 B) |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | FP8 de grano fino con block size 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión. La dimensión oculta es 5120, con 64 capas y un layout oculto de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17 408. El embedding de tokens y la salida LM tienen 248 320 entradas (con padding). Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El modelo ha pasado por pre-entrenamiento y post-entrenamiento. La model card no detalla el número de tokens de entrenamiento ni la composición del dataset, ni si se emplearon RLHF o DPO. La innovación técnica destacable es la combinación de atención lineal (Gated DeltaNet) con atención estándar (Gated Attention) en un layout híbrido, junto con MTP, control flexible del pensamiento y soporte nativo de visión y vídeo.

## Capacidades

- Generación de texto, razonamiento y tareas de conocimiento profesional.
- Programación y tareas de codificación agéntica (agentic terminal coding).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Control flexible del modo de pensamiento: activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Planificación autónoma y manejo de retroalimentación del entorno para ejecución de tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.

## Casos de uso

- Asistencia en programación agéntica: el modelo puede ejecutar tareas de codificación en terminal de forma autónoma, planificando pasos y procesando la retroalimentación del entorno, gracias a sus mejoras en agent execution y su contexto de 262 144 tokens.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo nativo de visión-lenguaje, puede interpretar figuras, esquemas y documentos extensos dentro de una misma ventana de contexto.
- Comprensión de vídeos de larga duración: soporta vídeos de hasta una hora, útil para resumen, indexación o extracción de información en entornos de investigación o medios.
- Investigación asistida: razonamiento multi-paso con modo thinking ajustable mediante `reasoning_effort` para equilibrar profundidad y coste en tareas de análisis.
- Despliegue en producción con vLLM, SGLang o TokenSpeed: la cuantización FP8 con block size 128 reduce el peso a 30,9 GB y permite servir el modelo con rendimiento casi idéntico al original.
- Integración en stacks de desarrollo existentes: la compatibilidad con harnesses y herramientas populares facilita incorporar el modelo a pipelines de CI/CD y asistentes de código.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con contexto largo e imágenes adjuntas, manteniendo el contexto de razonamiento histórico si se activa `preserve_thinking`.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, etc.). Sin embargo, los datos numéricos de la tabla están truncados en la información proporcionada (el contenido se corta en la fila "Agentic terminal coding"), por lo que no es posible extraer valores concretos.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 30,9 GB en FP8, lo que da una estimación de VRAM mínima de ~31 GB solo para pesos, más overhead de activaciones y KV cache.
- Para contexto largo (262 144 tokens) la KV cache crece de forma significativa; se recomienda GPU con 80 GB o más (A100 80GB, H100 80GB) para aprovechar la ventana completa.
- En GPUs consumer: no cabe en RTX 4090 (24 GB) con FP8; requiere al menos dos GPUs o cuantización adicional (no disponible en este repositorio).
- Opciones de despliegue: transformers, vLLM, SGLang, TokenSpeed.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-FP8 | ~27,8 B | 262 144 (ext. 1M) | Apache 2.0 | Hugging Face (RedHatAI) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | referenciado en model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | referenciado en model card |
| Muse Glimmer-30B | ~30 B (por nombre) | no disponible | no disponible | referenciado en model card |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada (tabla truncada).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados: no especificados, lo que limita la evaluación de cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- La cuantización FP8 puede introducir degradaciones menores frente al modelo original, aunque el autor afirma rendimiento casi idéntico.
- El contexto extensible a 1 000 000 tokens no está garantizado en esta versión local; la model card menciona 1M por defecto solo para el servicio alojado en Qwen Cloud.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Overview Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
