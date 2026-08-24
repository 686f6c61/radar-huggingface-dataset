# 10980xe/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, que incorpora un codificador de visión nativo para comprensión de imágenes y vídeo. Se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, con mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. El modelo está diseñado para llevar a cabo tareas complejas de varios pasos con mayor fiabilidad, apoyándose en un modo de pensamiento flexible que puede activarse o desactivarse por petición.

Arquitectónicamente, Qwen3.8-27B combina capas de atención lineal Gated DeltaNet con capas de atención clásica Gated Attention en un layout híbrido de 64 capas, lo que le permite manejar una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en entornos de producción. Su tamaño compacto (27B) lo hace adecuado para despliegue local en hardware de gama alta, como demuestran las guías publicadas por AMD para ejecutarlo en sus procesadores Ryzen AI Max y GPUs Radeon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors; se esperan cuantizaciones de la comunidad) |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que alterna capas de atención lineal y atención clásica. El layout oculto se organiza como 16 bloques repetidos de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, totalizando 64 capas. La dimensión oculta es de 5120, con un embedding de tokens de 248 320 (padded). La atención Gated DeltaNet utiliza 48 cabezas para V y 16 para QK, con dimensión de cabeza 128; la atención Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La red feed-forward tiene una dimensión intermedia de 17 408.

El modelo fue entrenado en dos etapas: pre-training y post-training. Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación. El modo de pensamiento está activado por defecto y puede desactivarse por petición; la profundidad del razonamiento se ajusta mediante el parámetro `reasoning_effort`, y el contexto de razonamiento histórico se conserva con `preserve_thinking`. El codificador de visión permite comprender imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.

## Capacidades

- Generación de texto y razonamiento multi-step con control de esfuerzo de razonamiento (`reasoning_effort`).
- Comprensión de imágenes y vídeos: diagramas STEM, documentos escaneados, vídeos de larga duración (hasta escala de una hora).
- Codificación: mejora sustancial en tareas de programación, incluyendo codificación agéntica en terminal (según benchmarks de la model card).
- Ejecución de agentes: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling / function calling (implícito en las capacidades de agente, aunque no se detalla explícitamente en la documentación).
- Modo de pensamiento flexible: activable/desactivable por petición, con retención de contexto de razonamiento histórico.
- Compatibilidad con múltiples frameworks de inferencia: Transformers, vLLM, SGLang, TokenSpeed.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y depurar código en entornos de terminal, gracias a su rendimiento en benchmarks de codificación agéntica (Terminal Bench 2.1). Es adecuado para integrarse en pipelines de CI/CD como asistente de revisión de código.
- Agentes autónomos de larga duración: su contexto de 262K tokens y su capacidad de planificación multi-step lo hacen apto para tareas que requieren múltiples interacciones con herramientas y entornos, como automatización de flujos de trabajo empresariales.
- Análisis de documentos multimodales: al combinar visión y lenguaje, puede extraer información de documentos escaneados, diagramas técnicos y capturas de pantalla, útil en sectores como legal, financiero o ingeniería.
- Atención al cliente con contexto largo: la ventana de contexto extensible permite mantener conversaciones multi-turno con historial completo, mejorando la coherencia en servicios de soporte.
- Investigación y análisis de datos: puede procesar artículos científicos, gráficos y tablas, ayudando a resumir hallazgos o generar hipótesis.
- Educación y tutoría: su capacidad de razonamiento paso a paso (thinking mode) permite explicar conceptos complejos de matemáticas o programación, adaptándose al nivel del estudiante.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento en texto que enfrenta a Qwen3.8-27B contra Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorías como "Agentic terminal coding" (Terminal Bench 2.1). Sin embargo, los valores numéricos de dicha tabla no están completos en la información proporcionada, por lo que no es posible presentar resultados cuantitativos verificables. No se dispone de datos adicionales de benchmarks (MMLU, HumanEval, GSM8K, etc.) en las fuentes consultadas.

## Requisitos de hardware

- El repositorio de HuggingFace contiene pesos en safetensors con un tamaño total de 55,6 GB, lo que sugiere que en precisión FP16 se necesitan al menos 56 GB de VRAM para cargar el modelo completo.
- Para inferencia en GPU de consumo, se requerirán cuantizaciones (por ejemplo, 8-bit o 4-bit) que reduzcan la huella de memoria; no se han publicado valores oficiales de VRAM para cuantizaciones específicas.
- AMD ha publicado una guía oficial para ejecutar Qwen3.8-27B en procesadores AMD Ryzen AI Max y GPUs Radeon, lo que indica que es viable en hardware de estación de trabajo y portátiles de gama alta.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed. También está prevista su disponibilidad como servicio gestionado en Qwen Cloud con contexto de 1M por defecto.
- No se dispone de datos de latencia o throughput medidos en las fuentes consultadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Texto + visión |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 (presumible) | Texto + visión |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los datos disponibles en la model card. No se dispone de información suficiente sobre los modelos alternativos para establecer una comparación de rendimiento fiable. Qwen3.8-27B se posiciona como una evolución de Qwen3.6-27B, con mejoras en codificación, trabajo profesional y capacidades de agente, según la documentación oficial.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información proporcionada; como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validación humana en aplicaciones críticas.
- La longitud de contexto de 1M es una extensión sobre el valor nativo de 262K; el rendimiento en contextos muy largos puede degradarse y requiere pruebas específicas.
- Los idiomas soportados no están especificados en la documentación disponible; el rendimiento en idiomas distintos del inglés y el chino no está garantizado.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede tener limitaciones en cuanto a la disponibilidad de cuantizaciones oficiales; las cuantizaciones de la comunidad pueden no estar optimizadas.
- El repositorio de HuggingFace consultado (10980xe/Qwen3.8-27B) tiene 0 descargas y 0 likes, lo que sugiere que es un mirror o copia no oficial; se recomienda verificar la autenticidad del modelo en el repositorio oficial de Qwen.

## Enlaces

- Repositorio HuggingFace consultado: https://huggingface.co/10980xe/Qwen3.8-27B
- Repositorio oficial de Qwen en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecución en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de Qwen Cloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Análisis de rendimiento y requisitos GPU (Northflank): https://northflank.com/blog/qwen3-8-27b-performance-benchmarks-gpu-requirements-and-how-to-run-it
- Guía para ejecución local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
