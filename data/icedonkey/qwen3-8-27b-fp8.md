# iceDonkey/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-27B, un modelo de lenguaje causal con codificador de visión desarrollado por Qwen. Este modelo denso de 27B parámetros es la generación más reciente de la familia Qwen open-source, diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. El repositorio de iceDonkey en HuggingFace contiene los pesos cuantizados en FP8 con bloque de tamaño 128, compatibles con HuggingFace Transformers, vLLM, SGLang y TokenSpeed.

El modelo es un vision-language model nativo que comprende imágenes y vídeos, con control flexible del modo de razonamiento. Soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Su arquitectura combina Gated DeltaNet (atención lineal) con Gated Attention, y ha sido entrenado con Multi-Token Prediction. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La cuantización FP8 con granularidad fina (bloque de 128) mantiene métricas de rendimiento casi idénticas al modelo original, lo que lo hace especialmente atractivo para despliegue en producción con menor consumo de memoria y mayor throughput. El repositorio tiene 30,9 GB y está en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, Gated DeltaNet + Gated Attention + FFN |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 nativa, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 (block size 128) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention). El layout oculto es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 64 capas en total. La dimensión oculta es 5120, el embedding de tokens es de 248.320 (padded) y la dimensión intermedia del FFN es de 17.408.

La atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención con gating usa 24 cabezas Q y 4 KV con dimensión 256 y RoPE de dimensión 64. El modelo ha sido entrenado en dos etapas: pre-training y post-training, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos. La cuantización FP8 aplica granularidad fina con bloque de 128, lo que minimiza la pérdida de precisión.

## Capacidades

- Generación de texto con control flexible del modo de razonamiento: el modo thinking está activado por defecto y puede desactivarse por petición.
- Ajuste de la profundidad del razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Capacidades agénticas: planificación autónoma más fuerte y mejor manejo de feedback del entorno para completar tareas multi-step de forma fiable.
- Soporte de tool calling y function calling (implícito en las capacidades agénticas).
- Mejoras integrales en codificación, trabajo profesional e investigación.

## Casos de uso

- Asistentes de codificación agénticos: el modelo puede planificar y ejecutar tareas de terminal de forma autónoma, manejando feedback del entorno y completando tareas multi-step de codificación con mayor fiabilidad que generaciones anteriores.
- Análisis de documentos técnicos y científicos: su comprensión nativa de imágenes permite procesar diagramas STEM, gráficos y documentos complejos, extrayendo información relevante con razonamiento profundo.
- Procesamiento de vídeo de larga duración: con soporte de vídeos de hasta una hora, puede resumir, indexar o extraer información de contenido audiovisual extenso.
- Agentes autónomos de investigación: su capacidad de planificación a largo plazo y manejo de feedback lo hace adecuado para tareas de investigación que requieren múltiples pasos y consulta de herramientas externas.
- Atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones multi-turno con historial extenso y documentos de referencia completos.
- Automatización de flujos de trabajo profesionales: puede integrarse en pipelines con vLLM o SGLang para tareas de generación de informes, análisis de datos y asistencia en entornos empresariales.
- Despliegue en dispositivos edge con AMD Ryzen AI Max o Jetson: su cuantización FP8 y tamaño compacto permiten ejecución local en hardware de consumo con LM Studio o Lemonade.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero la información disponible en la búsqueda se corta antes de mostrar los valores numéricos. No se han podido extraer datos concretos de la tabla. No se dispone de resultados numéricos verificables en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 30,9 GB en FP8, por lo que se necesitan al menos 32 GB de VRAM para cargar el modelo completo.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB, no suficiente para FP8 completo), o GPUs AMD Radeon con soporte ROCm.
- Compatible con consumer GPUs de gama alta con 24 GB si se usa cuantización adicional (por ejemplo, GGUF de 4 bits), aunque no se proporcionan pesos GGUF en este repositorio.
- Opciones de despliegue: HuggingFace Transformers, vLLM, SGLang, TokenSpeed, LM Studio, Lemonade.
- AMD Ryzen AI Max Agentic PCs y GPUs Radeon tienen soporte day-0 según el blog de AMD.
- Jetson AI Lab ofrece soporte para este modelo en dispositivos Jetson.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se han podido extraer los valores numéricos de la tabla. No se dispone de datos verificables para una comparativa cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni evaluación de sesgos en la documentación proporcionada.
- Riesgo de alucinación: no se han publicado evaluaciones específicas sobre este aspecto en la información disponible.
- La cuantización FP8, aunque mantiene métricas casi idénticas, puede introducir ligeras degradaciones en tareas de precisión numérica extrema.
- No se especifican los idiomas soportados; se recomienda verificar la documentación del modelo base Qwen/Qwen3.8-27B para conocer el soporte multilingüe.
- El modelo está pensado para uso en producción con herramientas como vLLM; el uso con Transformers vanilla puede requerir ajustes de memoria.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos específicos del modelo base para cualquier restricción adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iceDonkey/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de benchmarks y specs: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Interfaze AI: https://interfaze.ai/models/qwenqwen38-27b-fp8
