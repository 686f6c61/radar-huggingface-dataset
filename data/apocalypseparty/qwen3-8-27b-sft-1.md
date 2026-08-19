# ApocalypseParty/Qwen3.8-27B-SFT-1

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, desarrollado por ApocalypseParty y publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como una evolución de la serie Qwen3.5, orientado a tareas de codificación, trabajo profesional, investigación y ejecución agéntica de largo horizonte. El modelo integra de forma nativa comprensión de imágenes y vídeos, con control flexible del modo de razonamiento.

Con 27.781 millones de parámetros (27,8B), arquitectura densa híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), y una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000, este modelo busca ofrecer capacidades de razonamiento profundo y multimodalidad en un formato compacto y desplegable. Incluye entrenamiento con predicción multi-token (MTP) y soporte para herramientas y agentes.

La relevancia actual del modelo radica en su combinación de visión-lenguaje, razonamiento ajustable y compatibilidad con infraestructuras estándar como Transformers, vLLM y SGLang, lo que lo hace atractivo para equipos que necesitan un modelo denso de 27B con capacidades avanzadas sin recurrir a arquitecturas de mezcla de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina dos tipos de capas dentro de un layout de 64 capas: 16 bloques repetidos de `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet utilizan atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120 y la FFN intermedia es de 17.408. El embedding de tokens es de 248.320 (padded) y la salida LM también de 248.320.

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento (SFT, según el nombre del repositorio). Se menciona entrenamiento con Multi-Token Prediction (MTP) en múltiples pasos, lo que permite predecir varios tokens futuros simultáneamente. El modelo incorpora un codificador de visión para entrada de imágenes y vídeos, aunque no se especifican los detalles del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto, desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y function calling (implícito en las capacidades agénticas, aunque no se detalla explícitamente).
- Compatibilidad con múltiples harnesses y herramientas de desarrollo (vLLM, SGLang, TokenSpeed, Transformers).
- Capacidades multilingües no especificadas en la información disponible.

## Casos de uso

- Asistente de codificación en terminal: el modelo puede ejecutar tareas de codificación agéntica en terminal, interpretando comandos, gestionando errores y completando tareas de desarrollo de forma autónoma, gracias a su entrenamiento en Terminal Bench y su capacidad de razonamiento multi-paso.
- Análisis de documentos técnicos y diagramas: su comprensión de imágenes permite extraer información de diagramas STEM, esquemas y documentos escaneados, integrándose en flujos de investigación o ingeniería.
- Agente de automatización de tareas de oficina: con su planificación autónoma y manejo de feedback, puede orquestar flujos de trabajo que requieren múltiples pasos, como generación de informes, resumen de correos o gestión de datos.
- Revisión de código en pipelines de CI/CD: el modelo puede analizar diffs, sugerir correcciones y razonar sobre el impacto de cambios, integrándose en herramientas de revisión automática.
- Asistente de investigación: su capacidad de razonamiento profundo y contexto largo (262K tokens) permite procesar papers extensos, resumir literatura y responder preguntas complejas sobre material científico.
- Análisis de vídeo para monitorización: la comprensión de vídeos de hasta una hora permite aplicaciones de revisión de grabaciones, extracción de eventos o generación de resúmenes de contenido audiovisual.

## Benchmarks y rendimiento

La información disponible menciona la participación en el benchmark Terminal Bench 2.1 (Terminus) para codificación agéntica en terminal, pero no se proporcionan los valores numéricos de los resultados. La tabla de benchmarks en la model card está incompleta en el texto extraído, por lo que no es posible presentar datos cuantitativos verificables.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 55,6 GB, lo que sugiere que los pesos en precisión FP16 o BF16 ocupan aproximadamente 55 GB.
- Para inferencia en FP16 se estima un requisito de VRAM de al menos 56 GB, lo que requiere GPUs como A100 80GB, H100 o similares.
- Con cuantización a 8 bits, la VRAM necesaria se reduciría a aproximadamente 28-30 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) con cuantización más agresiva (4 bits, ~14 GB).
- No se dispone de datos oficiales sobre latencia o throughput. Se recomienda desplegar con vLLM, SGLang o Transformers para entornos de producción.
- Para uso en consumer GPUs, se necesitaría cuantización de 4 bits y posiblemente offloading a CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con modelos alternativos de la misma categoría. La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan datos verificables de estos modelos en la información disponible. Se recomienda consultar benchmarks independientes antes de tomar decisiones de despliegue.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo. Como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La ventana de contexto de 262K tokens puede degradar el rendimiento si se usa al máximo sin técnicas de gestión de atención adecuadas.
- Los idiomas soportados no están especificados; se desconoce su rendimiento en lenguas distintas del inglés.
- El modelo es un fine-tuning (SFT-1) de un modelo base no especificado; la calidad del fine-tuning puede afectar la coherencia en dominios especializados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de los componentes de visión y los datos de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción limitada o publicación reciente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ApocalypseParty/Qwen3.8-27B-SFT-1
- Servicio Qwen Cloud (mención en la model card): https://www.qwencloud.com/models/qwen3.8-27b
