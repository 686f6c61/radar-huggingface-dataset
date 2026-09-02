# Ratanak/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27.000 millones de parámetros desarrollado por Alibaba (Qwen Team), presentado como el miembro compacto de la familia Qwen3.8. Se trata de un modelo nativo de visión-lenguaje (VLM) que entiende imágenes y vídeos, construido sobre la base arquitectónica de Qwen3.5 y que comparte el mismo backbone de atención híbrida que el modelo MoE insignia de 2,4 billones de parámetros. El modelo destaca por sus mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con un control flexible del modo de razonamiento.

La relevancia actual del modelo radica en su combinación de capacidades avanzadas de razonamiento y visión en un formato denso de 27B, lo que lo hace desplegable en hardware de consumo. Su arquitectura híbrida, con solo 16 de 64 capas usando atención completa, reduce significativamente el coste computacional en inferencia. El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y ha acumulado más de 3 millones de descargas en su primer fin de semana tras su lanzamiento, lo que indica una adopción comunitaria muy rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, atención híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (formato safetensors en FP16/BF16 presumiblemente) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B utiliza una arquitectura de modelo causal con encoder de visión, organizada en 64 capas con una disposición de bloques híbrida: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Esto significa que solo 16 de las 64 capas ejecutan atención completa (con un intervalo `full_attention_interval: 4`), mientras que las otras 48 utilizan atención lineal con estado recurrente constante (Gated DeltaNet). Esta configuración reduce el coste computacional manteniendo la capacidad de modelado de contexto largo.

El componente Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza de 128. La Gated Attention utiliza 24 cabezas para Q y 4 para KV, con dimensión de cabeza de 256 y RoPE de dimensión 64. La dimensión oculta es de 5120, con embedding de tokens de 248.320 (padding) y FFN con dimensión intermedia de 17.408. El modelo incluye entrenamiento con Multi-Token Prediction (MTP) en múltiples pasos. La etapa de entrenamiento comprende pre-entrenamiento y post-entrenamiento, aunque no se especifican los datos exactos de entrenamiento, número de tokens ni el uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado con modo de pensamiento (thinking mode) activado por defecto, desactivable por petición.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del razonamiento mediante el parámetro `reasoning_effort` para ajustar la profundidad de razonamiento.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Soporte de tareas agénticas de horizonte largo con planificación autónoma y manejo de feedback del entorno.
- Capacidades de codificación mejoradas, incluyendo codificación agéntica en terminal (Terminal Bench).
- Soporte de tool calling y function calling (implícito en las capacidades agénticas, aunque no detallado explícitamente).
- Compatibilidad con múltiples harnesses y herramientas de desarrollo para integración en stacks existentes.

## Casos de uso

- Asistente de programación agéntico: el modelo puede ejecutar tareas de codificación complejas en terminal, planificando múltiples pasos y adaptándose al feedback del entorno, gracias a sus mejoras en Terminal Bench 2.1 y su capacidad de razonamiento de horizonte largo.
- Análisis de documentos técnicos y científicos: su comprensión nativa de imágenes permite procesar diagramas STEM, gráficos y documentos complejos, extrayendo información y respondiendo preguntas sobre ellos.
- Automatización de tareas de oficina: las mejoras en productividad de oficina lo hacen adecuado para generar informes, resumir documentos extensos y procesar material visual corporativo.
- Agente de investigación autónomo: con 262K tokens de contexto nativo, puede procesar corpus extensos de literatura científica, mantener el hilo de razonamiento a lo largo de conversaciones largas y ejecutar tareas de investigación multi-paso.
- Análisis de vídeo de larga duración: su capacidad de entender vídeos de hasta una hora lo hace útil para revisión de contenido audiovisual, vigilancia inteligente o análisis de material formativo.
- Despliegue en producción con contexto ultralargo: con la extensión a 1M tokens, puede procesar codebases completos o documentación empresarial extensa en una sola pasada, integrándose en pipelines de CI/CD para revisión de código.

## Benchmarks y rendimiento

La información disponible incluye una tabla de benchmarks parcial. Se presentan los datos de rendimiento en codificación agéntica en terminal:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: la tabla de benchmarks en la model card está incompleta en la información proporcionada. Se menciona que Qwen3.8-27B es evaluado en MathVision con un prompt fijo específico, pero no se incluyen los valores numéricos. No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros en FP16, se requieren aproximadamente 55,6 GB de VRAM para la carga completa del modelo. Con cuantización a 8 bits, se estiman unos 28 GB; con 4 bits, unos 14 GB.
- GPU recomendadas: para FP16, se necesitan GPUs de clase profesional como A100 (80 GB) o H100. Con cuantización 8 bits, una RTX 4090 (24 GB) o A6000 (48 GB) puede ser suficiente. Con cuantización 4 bits, cabe en GPUs de consumo como RTX 3090/4090.
- El modelo es desplegable en hardware de consumo con cuantización, como demuestra su rápida adopción entre desarrolladores y prosumidores.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, TokenSpeed, y soporte específico en vLLM Ascend para hardware Huawei.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262K nativo (1M extensible) | Apache-2.0 | VLM híbrido |
| Qwen3.6-27B | 27B denso | No disponible | Apache-2.0 | VLM |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |

La comparativa se basa en los modelos mencionados en la tabla de benchmarks de la model card. Qwen3.8-27B es la evolución directa de Qwen3.6-27B, con mejoras en codificación, trabajo profesional, investigación y tareas agénticas. No se dispone de información suficiente sobre Qwen3.7-Plus, Muse Glimmer-30B u Opus4.6 Max para una comparación detallada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos conocidos o evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no se proporcionan datos específicos, aunque es un riesgo inherente a modelos de esta categoría.
- Limitaciones de idioma: los idiomas soportados no están especificados en la información disponible.
- La cuantización puede degradar el rendimiento en tareas de razonamiento complejo; se recomienda validar en el caso de uso concreto.
- El modo de pensamiento activado por defecto puede aumentar la latencia; se puede desactivar por petición para reducir tiempo de respuesta.
- Para uso en producción, se recomienda evaluar el modelo en el dominio específico antes del despliegue, dado que no se han publicado benchmarks completos.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los términos completos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ratanak/Qwen3.8-27B
- Repositorio oficial Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- QwenCloud (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-27b
- Documentación vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Artículo de Cybernews sobre el lanzamiento: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
