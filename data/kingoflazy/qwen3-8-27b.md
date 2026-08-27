# kingoflazy/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal multimodal (imagen-texto a texto) de 27.800 millones de parámetros, desarrollado por el equipo Qwen de Alibaba como parte de la generación Qwen 3.8. Se trata del modelo más pequeño de la familia y el único pensado para ejecutarse en hardware de consumo: una GPU con 24 GB de VRAM o un MacBook con 32 GB de memoria unificada. Su arquitectura combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) en un diseño híbrido que reduce el coste computacional manteniendo una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000.

El modelo integra un codificador de visión que le permite comprender imágenes y vídeos, además de texto, y ofrece control flexible del razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición y admite ajuste de profundidad mediante `reasoning_effort`. Está entrenado con predicción multi-token (MTP) y orientado a tareas de agente de largo horizonte, con mejoras declaradas en codificación, trabajo profesional e investigación. Publicado bajo licencia Apache 2.0, sus pesos están disponibles en formato safetensors y es compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | FP8 (mencionado en vLLM Recipes); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 64 capas con dimensión oculta de 5120 y embedding de tokens de 248 320 (padded). Su layout interno se organiza en 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia de 17 408.

El entrenamiento combina pre-training y post-training, e incorpora Multi-Token Prediction (MTP) con múltiples pasos, lo que mejora la eficiencia de generación y la coherencia a largo plazo. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición del dataset. El modelo incluye un codificador de visión que permite procesar imágenes y vídeos de hasta una hora de duración, según la documentación oficial.

## Capacidades

- Generación de texto y razonamiento complejo, con modo thinking activable/desactivable por petición y ajuste de profundidad mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos: diagramas STEM, documentos escaneados, vídeos de larga duración.
- Ejecución de tareas de agente de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y funciones integradas (la versión alojada en Qwen Cloud incluye herramientas oficiales).
- Capacidades multilingües no documentadas explícitamente, pero heredadas de la familia Qwen (se recomienda verificar en la documentación oficial).
- Retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.

## Casos de uso

- Asistente de programación en producción: el modelo puede generar, revisar y depurar código en múltiples lenguajes, integrándose en pipelines de CI/CD mediante tool calling y razonamiento multi-paso.
- Análisis de documentos técnicos con imágenes: procesa informes, diagramas y capturas, extrayendo información relevante para investigación o auditoría.
- Agente autónomo de automatización de tareas: con su ventana de contexto de 262K tokens y capacidades de planificación, puede ejecutar flujos de trabajo complejos (gestión de incidencias, orquestación de APIs) con supervisión mínima.
- Atención al cliente con contexto largo: gestiona conversaciones multi-turno manteniendo el historial completo, gracias a su contexto nativo extensible, y puede derivar a herramientas externas cuando es necesario.
- Análisis de vídeo para vigilancia o revisión de contenido: comprende vídeos de hasta una hora, permitiendo resúmenes, detección de eventos o búsqueda de momentos concretos.
- Generación de informes profesionales: combina razonamiento estructurado con comprensión de datos visuales y textuales para redactar documentos técnicos o ejecutivos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con secciones para coding, razonamiento, etc. Sin embargo, los valores numéricos de los benchmarks no están disponibles en la información proporcionada. No se han publicado resultados completos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: el tamaño de pesos en BF16 es de aproximadamente 55,6 GB (27,8 B × 2 bytes). Para inferencia en GPU de consumo se requiere cuantización (por ejemplo, FP8 o inferior).
- Según Atomic Chat, el modelo puede ejecutarse en una GPU con 24 GB de VRAM o en un MacBook con 32 GB de memoria unificada, presumiblemente con cuantización.
- GPU recomendadas: RTX 4090 (24 GB) o superior, o GPUs de datacenter como A100/H100 para despliegue sin cuantizar.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Transformers. También se menciona compatibilidad con vLLM Ascend para hardware específico (950PR) con checkpoint FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B (mismo tamaño), Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se han proporcionado los valores numéricos de los benchmarks. A falta de datos concretos, se puede indicar que Qwen3.8-27B es un modelo denso de 27,8 B con contexto nativo de 262K, mientras que alternativas como Qwen3.6-27B (también de 27B) o modelos de tamaño similar de otras familias (p. ej., Llama 3.1 8B no comparable por tamaño) no tienen especificaciones verificables en esta información. Se recomienda consultar la documentación oficial de Qwen para comparativas detalladas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos sociales y culturales presentes en el corpus.
- Riesgo de alucinación en tareas de razonamiento o generación de código, especialmente en contextos largos o con información ambigua.
- La extensión de contexto hasta 1M tokens puede degradar la calidad de la generación en los tramos finales; se recomienda validar en casos de uso reales.
- Los idiomas soportados no están especificados; aunque la familia Qwen es multilingüe, no hay garantía oficial para este modelo concreto.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y la procedencia de los pesos (este repositorio es una copia de un usuario, no el oficial de Qwen).
- Al ser un modelo reciente (publicado en agosto de 2026), puede haber problemas no documentados o cambios en las herramientas de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingoflazy/Qwen3.8-27B
- Modelo oficial de Qwen (referencia en la model card): https://huggingface.co/Qwen/Qwen3.8-27B (no verificado)
- Qwen Cloud (servicio alojado): https://www.qwencloud.com/models/qwen3.8-27b
- Artículo de Atomic Chat: https://atomic.chat/models/qwen3-8-27b
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-qwen
- Análisis en kingy.ai: https://kingy.ai/news/qwen3-8-27b-local-ai-model-review/
- Especificaciones y benchmarks en kingy.ai: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Receta de vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
