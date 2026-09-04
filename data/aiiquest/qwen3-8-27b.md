# AIIQuest/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de 27.000 millones de parámetros, de arquitectura densa e híbrida, desarrollado por la familia Qwen y publicado en HuggingFace por AIIQuest. Se trata de la generación más reciente de la serie Qwen3.8, construida sobre la base arquitectónica de Qwen3.5, y está diseñada para tareas de codificación, trabajo profesional, investigación y agentes de larga duración. El modelo es nativo vision-language, capaz de comprender imágenes y vídeos, e incorpora un modo de razonamiento flexible (thinking mode) activado por defecto que puede ajustarse en profundidad mediante `reasoning_effort`.

Con una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, el modelo está pensado para manejar tareas complejas de múltiples pasos y contextos extensos. Su arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con gating, e incluye Multi-Token Prediction (MTP) para mejorar la eficiencia. Está disponible bajo licencia Apache 2.0 y es compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model with Vision Encoder; híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de lenguaje causal con encoder de visión. La configuración interna incluye 64 capas, dimensión oculta de 5120 y embedding de token de 248.320 (padded). El layout de capas es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), lo que combina atención lineal (Gated DeltaNet) con atención estándar con gating. La atención lineal tiene 48 cabezas para V y 16 para QK, con dimensión de cabeza 128; la atención con gating tiene 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64. El feed-forward network tiene dimensión intermedia de 17.408. Además, el modelo fue entrenado con Multi-Token Prediction (MTP) de varios pasos.

El proceso de entrenamiento incluye pre-entrenamiento y post-entrenamiento, aunque no se han publicado detalles sobre la composición del dataset, el número de tokens ni técnicas específicas de alineación como RLHF o DPO. El modelo incorpora control flexible de razonamiento: el modo thinking está activado por defecto y puede desactivarse por petición, con profundidad ajustable mediante `reasoning_effort` y retención del contexto de razonamiento mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento profundo con modo thinking activable/desactivable y ajuste de profundidad.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de varias horas.
- Codificación y tareas agénticas en terminal, con planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling / function calling para integración en pipelines de agentes, según NVIDIA NGC.
- Soporte de contexto largo de 262K tokens nativo, extensible a 1M.
- Multi-Token Prediction (MTP) para mejorar la eficiencia de generación.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistente de codificación agéntico: El modelo puede ejecutar tareas de programación en un entorno de terminal, planificando y ejecutando comandos, y ajustándose al feedback del entorno. Es adecuado para tareas de refactorización, depuración y desarrollo automatizado.
- Análisis de documentos técnicos con imágenes: Gracias a su encoder de visión, puede extraer información de diagramas STEM, esquemas y documentos escaneados, combinando texto e imagen en un mismo contexto.
- Agentes autónomos de larga duración: Con su ventana de contexto de 262K tokens y su capacidad de retener razonamiento histórico, puede mantener el estado de tareas complejas a lo largo de múltiples pasos sin perder información.
- Comprensión de vídeo de larga duración: El modelo admite vídeos de hasta horas de duración, lo que permite resumir, indexar o buscar eventos en grabaciones largas.
- Soporte técnico con contexto extenso: Puede gestionar conversaciones largas con usuarios, manteniendo el historial completo y aplicando razonamiento para resolver incidencias complejas.
- Investigación y trabajo profesional: Su modo thinking profundo y su capacidad de razonamiento multi-paso lo hacen útil para análisis de literatura, síntesis de información y preparación de informes técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla comparativa de rendimiento en texto que enfrenta a Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en el extracto recibido.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B en precisión FP16, se necesitan aproximadamente 54 GB de VRAM. Con cuantización de 8 bits, ~27 GB; con 4 bits, ~14 GB. Estas son estimaciones orientativas basadas en el tamaño del modelo.
- GPU recomendadas: A100 80GB o H100 80GB para FP16; RTX 4090 o similar con cuantización 4-bit.
- Compatibilidad con consumer GPU: sí, con cuantización 4-bit y una GPU de 16-24 GB.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. También puede desplegarse en Qwen Cloud (servicio gestionado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa detallada. La model card referencia a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max como modelos comparables, pero no se han extraído los valores numéricos de los benchmarks.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgos en la información disponible.
- Alucinación: como todo modelo de lenguaje, puede generar contenido falso o no verificado; es necesario validar sus salidas en entornos de producción.
- Idiomas: la documentación no especifica los idiomas soportados; se recomienda probar el modelo en el idioma objetivo antes de desplegarlo.
- Contexto: aunque soporta hasta 1M de tokens de forma extendida, el rendimiento en esa longitud extrema no está documentado.
- Licencia: Apache 2.0 permite uso comercial, pero se debe revisar el texto completo de la licencia para obligaciones de atribución y patentes.
- Producción: el modelo es reciente (creado en septiembre de 2026) y su ecosistema de herramientas puede no ser estable aún.

## Enlaces

- HuggingFace: https://huggingface.co/AIIQuest/Qwen3.8-27B
- Together AI: https://www.together.ai/models/qwen3-8-27b
- NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
