# JasonOdinberg/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, presentado como la generación más capaz de la familia Qwen open-model hasta la fecha. Desarrollado sobre la base arquitectónica de Qwen3.5, es un modelo denso de 27.781.427.952 parámetros (~27,8B) con soporte nativo para comprensión de imágenes y vídeos, además de texto. Su arquitectura híbrida combina Gated DeltaNet (atención lineal) con Gated Attention (atención completa), logrando una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Está diseñado para tareas complejas de agente, codificación, trabajo profesional e investigación, con control flexible del modo de pensamiento.

El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors, compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. Su pipeline es image-text-to-text, lo que lo convierte en un modelo multimodal capaz de procesar diagramas STEM, documentos y vídeos de hasta una hora de duración. Incluye entrenamiento con Multi-Token Prediction (MTP) y soporte para razonamiento multi-paso. El repositorio, publicado por el usuario JasonOdinberg, no registra descargas ni interacciones, y su fecha de creación (2026-08-18) sugiere una publicación muy reciente o de alcance limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida con Gated DeltaNet (atención lineal) y Gated Attention (atención completa) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina dos mecanismos de atención: Gated DeltaNet, una forma de atención lineal con 48 cabezas para V y 16 para QK (dimensión de cabeza 128), y Gated Attention, una atención completa con 24 cabezas para Q y 4 para KV (dimensión de cabeza 256, con RoPE de dimensión 64). La disposición de capas es de 16 bloques, cada uno con 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN), totalizando 64 capas. La dimensión oculta es de 5.120 y la FFN tiene dimensión intermedia de 17.408. El embedding de tokens es de 248.320 (padded).

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. Se utilizó Multi-Token Prediction (MTP) con múltiples pasos de entrenamiento. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo incorpora un encoder de visión para procesar imágenes y vídeos, lo que lo convierte en un modelo multimodal nativo.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras sustanciales en codificación, trabajo profesional e investigación.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del modo de pensamiento: activado por defecto, puede desactivarse por petición; la profundidad del razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Soporte para tareas agénticas de largo horizonte: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Compatibilidad con herramientas y harnesses populares de desarrollo, facilitando la integración en stacks existentes.
- Entrenamiento con Multi-Token Prediction (MTP) para mejorar la eficiencia de generación.
- Soporte multilingüe: no disponible (no se especifican idiomas).

## Casos de uso

- Desarrollo de agentes autónomos: el modelo puede planificar y ejecutar tareas multi-paso con feedback del entorno, gracias a su ventana de contexto de 262K tokens y su capacidad de razonamiento agéntico.
- Generación de código en producción: con mejoras en codificación y soporte para herramientas, puede integrarse en pipelines de CI/CD para revisión, generación y refactorización de código.
- Análisis de documentos técnicos: su capacidad de visión permite extraer información de diagramas STEM, gráficos y documentos escaneados.
- Procesamiento de vídeo: puede analizar vídeos de hasta una hora para resumir contenido, extraer eventos o responder preguntas sobre el material visual.
- Asistencia en investigación: su razonamiento profundo y contexto largo lo hacen adecuado para revisión de literatura, síntesis de información y generación de hipótesis.
- Atención al cliente avanzada: con contexto de 262K tokens, puede gestionar conversaciones multi-turno extensas manteniendo el historial completo.
- Automatización de flujos de trabajo: su capacidad de tool calling y razonamiento multi-paso permite orquestar APIs y servicios externos en tareas complejas.

## Benchmarks y rendimiento

La información proporcionada incluye el inicio de una tabla de benchmarks con la columna "Terminal Bench 2.1 (Terminus)" para codificación agéntica en terminal, comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, no se han publicado los valores numéricos en la información disponible. No se dispone de resultados completos de benchmarks verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~27,8B parámetros. En FP16, los pesos ocupan aproximadamente 55,6 GB (coincide con el tamaño del repositorio). Con cuantización de 8 bits se estima ~28 GB, y con 4 bits ~14 GB (estimaciones basadas en el tamaño de parámetros; no se proporcionan cuantizaciones oficiales).
- GPU recomendadas: para FP16 se necesitan GPUs con al menos 60 GB de VRAM (por ejemplo, A100 80GB o H100). Con cuantización 8 bits, una RTX 4090 (24 GB) podría ser insuficiente; se recomienda A6000 (48 GB) o similar. Con cuantización 4 bits, podría caber en RTX 4090 (24 GB).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La tabla de benchmarks mencionada incluye comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan los valores numéricos. No se dispone de datos suficientes para una comparativa cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262K (ext. 1M) | Apache 2.0 | HuggingFace |
| Qwen3.6-27B | ~27B (no confirmado) | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni evaluación de seguridad en la información proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado métricas de fiabilidad.
- Los idiomas soportados no están especificados; puede haber limitaciones en lenguas de baja representación.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la model card menciona que la versión alojada en Qwen Cloud tendrá características adicionales de producción; el modelo base puede requerir ajustes para casos de uso específicos.
- El contexto extensible hasta 1M tokens puede degradar el rendimiento si no se gestiona adecuadamente la memoria.
- No se han publicado resultados de benchmarks completos, por lo que el rendimiento real en tareas estándar no está verificado de forma independiente.
- El repositorio no registra descargas ni validaciones de la comunidad, lo que limita la confianza en la procedencia de los pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JasonOdinberg/Qwen3.8-27B
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-27b
