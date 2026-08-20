# gihakkk/Qwen3.8-27B-test

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal (imagen-texto-a-texto) desarrollado por el equipo de Qwen, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Este modelo denso de 27.8 mil millones de parámetros integra un codificador de visión y un modelo de lenguaje causal con arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), junto con predicción multi-token (MTP). Está diseñado para tareas complejas de agente, codificación, investigación y razonamiento de largo alcance, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000.

El modelo destaca por su control flexible del razonamiento (modo thinking activable/desactivable, ajuste de esfuerzo de razonamiento, preservación del contexto de razonamiento histórico) y su comprensión nativa de imágenes y vídeos, desde diagramas STEM hasta vídeos de una hora. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio en HuggingFace contiene pesos en formato safetensors (55.6 GB) y configuración compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de visión (Gated DeltaNet + Gated Attention) |
| Parámetros totales | 27.781.427.952 (27.8B) |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Qwen3.8-27B se basa en la arquitectura de Qwen3.5, pero introduce una estructura híbrida de capas: cada 16 capas siguen el patrón `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas para V y 16 para QK (dimensión de cabeza 128), mientras que la Gated Attention clásica usa 24 cabezas para Q y 4 para KV (dimensión de cabeza 256, RoPE de 64). La dimensión oculta es de 5.120, con 64 capas y una salida LM de 248.320 tokens (padding). El entrenamiento incluye una etapa de pre-entrenamiento y otra de post-entrenamiento, con predicción multi-token (MTP) entrenada en múltiples pasos.

La arquitectura híbrida combina la eficiencia computacional de la atención lineal (DeltaNet) con la capacidad de atención clásica, lo que permite manejar contextos largos de forma más eficiente que los transformadores puros. El modelo es nativo multimodal, con un codificador de visión integrado que procesa imágenes y vídeos. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte.
- Comprensión nativa de imágenes y vídeos: diagramas STEM, documentos, vídeos de hasta una hora.
- Control flexible del pensamiento: el modo thinking está activado por defecto, pero puede desactivarse por petición; se puede ajustar el esfuerzo de razonamiento (`reasoning_effort`) y conservar el contexto de razonamiento de mensajes históricos (`preserve_thinking`).
- Planificación autónoma y manejo de feedback del entorno para tareas de agente, con ejecución fiable de principio a fin.
- Compatibilidad con herramientas y harnesses populares (Transformers, vLLM, SGLang, TokenSpeed).
- No se especifica soporte explícito de function calling o tool calling, aunque la descripción de "agente ejecución" sugiere cierta capacidad en este ámbito.

## Casos de uso

- **Atención al cliente automatizada**: con una ventana de contexto de 262K tokens nativos, el modelo puede mantener conversaciones multi-turno largas con historial completo y comprender adjuntos visuales (capturas de pantalla, documentos) sin perder contexto.
- **Asistente de codificación en producción**: su rendimiento en terminal coding (Terminal Bench 2.1) y su capacidad de razonamiento profundo lo hacen apto para integrarse en pipelines de CI/CD, generando código, refactorizando y resolviendo tareas de depuración con feedback del entorno.
- **Análisis de documentos técnicos y científicos**: con comprensión de imágenes y texto, puede extraer información de diagramas STEM, tablas y papers, y razonar sobre ellos en un mismo turno.
- **Agentes autónomos de investigación**: su planificación autónoma y manejo de feedback lo convierten en un candidato para agentes que navegan por herramientas, ejecutan scripts y toman decisiones iterativas sobre bases de conocimiento largas.
- **Procesamiento de vídeo de larga duración**: su soporte de vídeo hasta escala de hora permite el resumen, indexado y análisis de contenidos audiovisuales extensos (grabaciones de reuniones, vigilancia, etc.).
- **Asistentes de documentación corporativa**: con contexto ampliable a 1M tokens, puede resumir y consultar grandes volúmenes de documentos internos, manteniendo coherencia en tareas de extracción y síntesis.

## Benchmarks y rendimiento

La tabla de benchmarks de la model card se presenta de forma incompleta, pero se dispone del siguiente dato parcial:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) - Agentic terminal coding | (no disponible) | (no disponible) | (no disponible) | (no disponible) | (no disponible) |

Los valores numéricos de la tabla original no se han proporcionado en la información disponible. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: con 27.8B parámetros en FP16, el modelo requiere aproximadamente 56 GB de VRAM solo para los pesos (55.6 GB de repo). En cuantización INT8 se reduciría a ~28 GB, y en INT4 a ~14 GB, aunque no se especifican cuantizaciones oficiales.
- **GPU recomendadas**: para inferencia en FP16, una A100 80GB o H100 80GB es adecuada. En cuantización 8-bit, una RTX 4090 (24 GB) no sería suficiente; se necesitaría al menos una A6000 48GB o dos RTX 4090 en paralelo.
- **Consumer GPU**: no cabe en una sola GPU de consumo de 24 GB en FP16; con cuantización 4-bit podría intentarse en una RTX 4090, pero la latencia y la ventana de contexto larga lo harían poco práctico.
- **Opciones de despliegue**: compatible con Transformers, vLLM, SGLang y TokenSpeed. También se puede usar con llama.cpp para cuantización GGUF (no confirmado en la model card).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27.8B | 262K (ext. 1M) | Híbrida (DeltaNet + Attention) | Apache 2.0 | HuggingFace (safetensors) |
| Qwen3.6-27B | ~27B | (no disponible) | (no disponible) | (no disponible) | (no disponible) |
| Muse Glimmer-30B | ~30B | (no disponible) | (no disponible) | (no disponible) | (no disponible) |
| Opus4.6 Max | (no disponible) | (no disponible) | (no disponible) | (no disponible) | (no disponible) |

Los datos de los modelos comparativos no están disponibles en la información proporcionada. Qwen3.8-27B se posiciona como un modelo denso de tamaño medio con ventajas en tareas de agente y contexto largo.

## Limitaciones y advertencias

- **Datos de benchmarks incompletos**: los resultados numéricos de la tabla de rendimiento no se han publicado en la model card, por lo que no se puede verificar el rendimiento real en tareas estándar.
- **Información de entrenamiento no disponible**: no se detallan los datos de entrenamiento, técnicas de alineación (RLHF/DPO) ni la composición del dataset, lo que dificulta evaluar sesgos o riesgos de alucinación.
- **Idiomas soportados**: no se especifican, aunque es probable que soporte múltiples idiomas (el modelo Qwen suele ser multilingüe), pero no se puede confirmar.
- **Cuantizaciones**: no se indican cuantizaciones oficiales; la compatibilidad con GGUF no está confirmada, lo que limita su uso en entornos con recursos reducidos.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento largo o con datos no vistos.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar la política del autor y posibles patentes asociadas.
- **Novedad y validación**: el modelo es muy reciente (creado en 2026-08-20) y no tiene descargas ni likes, por lo que la comunidad aún no ha validado su comportamiento en entornos de producción.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/gihakkk/Qwen3.8-27B-test](https://huggingface.co/gihakkk/Qwen3.8-27B-test)
- Qwen Cloud (servicio alojado, próximamente): [https://www.qwencloud.com/models/qwen3.8-27b](https://www.qwencloud.com/models/qwen3.8-27b)
