# CharlesXmf/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, desarrollado por el equipo de Qwen (Alibaba) y publicado en agosto de 2026 como parte de la generación Qwen3.8. Se trata de un modelo de 27 000 millones de parámetros que integra comprensión de imagen y vídeo de forma nativa, junto con capacidades de razonamiento controlable, y está orientado a tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. Su arquitectura híbrida combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), lo que permite una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors compatibles con Transformers, vLLM, SGLang y TokenSpeed. Su tamaño compacto y su licencia permisiva lo convierten en una opción atractiva para despliegue local en GPU de consumo y para integración en pipelines de producción. La versión alojada en HuggingFace (CharlesXmf/Qwen3.8-27B) es un mirror de los pesos oficiales, sin modificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precisión completa) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que alterna bloques de atención lineal y atención completa. El layout es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con un total de 64 capas. La Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120, el embedding de tokens es 248 320 (padded) y la FFN tiene dimensión intermedia 17 408. Además, el modelo fue entrenado con Multi-Token Prediction (MTP) en múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia de generación.

El entrenamiento incluye fases de pre-training y post-training. No se especifica el número de tokens de entrenamiento ni la composición del dataset. El modelo incorpora un modo de pensamiento controlable: el razonamiento está activado por defecto, puede desactivarse por petición, y admite ajuste de profundidad mediante `reasoning_effort`, así como retención del contexto de razonamiento histórico mediante `preserve_thinking`. También incluye un codificador de visión para entrada de imágenes y vídeo.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos con modo de pensamiento configurable (thinking mode activado por defecto, desactivable por petición).
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Codificación avanzada: generación de código, depuración y refactorización, con mejoras específicas en tareas de terminal agéntico (Terminal Bench 2.1).
- Ejecución de agentes de larga duración: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling (implícito en las capacidades de agente, aunque no se detalla en la model card).
- Compatibilidad con múltiples frameworks de inferencia: Transformers, vLLM, SGLang, TokenSpeed.
- Ajuste de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de pensamiento con `preserve_thinking`.

## Casos de uso

- Asistente de codificación en terminal: el modelo puede ejecutar tareas de codificación agéntica directamente en un terminal, interpretando comandos, editando archivos y verificando resultados, gracias a su rendimiento en Terminal Bench 2.1 y su ventana de contexto de 262K tokens.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, gráficos y páginas escaneadas, combinando comprensión visual con razonamiento textual para resumir o responder preguntas sobre documentos extensos.
- Automatización de tareas de investigación: puede procesar papers, informes y datasets largos, manteniendo el contexto de razonamiento a lo largo de múltiples pasos, útil para revisiones bibliográficas o análisis de datos.
- Agente de atención al cliente con contexto largo: con 262K tokens de ventana, puede gestionar conversaciones multi-turno extensas, recordar interacciones previas y mantener el hilo de la conversación sin perder información.
- Generación de código en producción: compatible con vLLM y SGLang, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aprovechando su soporte de tool calling y su modo de razonamiento configurable.
- Análisis de vídeo para vigilancia o revisión de contenido: su capacidad de entender vídeos de hasta una hora permite resumir grabaciones, detectar eventos o extraer información temporal de secuencias largas.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ser un modelo denso de 27B, puede ejecutarse en cuantizaciones de 4 u 8 bits en GPUs como RTX 4090 o AMD Radeon, permitiendo desarrollo y experimentación sin infraestructura cloud.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con resultados de benchmarks, pero los valores numéricos no están disponibles en la información proporcionada. La tabla compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, en categorías como coding, professional work, research y agentic tasks. El único dato visible es la fila "Agentic terminal coding" (Terminal Bench 2.1, Terminus), pero sin los valores concretos.

No se han publicado resultados numéricos completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el peso del modelo en FP16 es de aproximadamente 55,6 GB (tamaño del repo). Para inferencia en FP16 se necesitan al menos 60 GB de VRAM, lo que requiere GPUs como A100 80GB o H100.
- Con cuantización a 8 bits, la VRAM necesaria se reduce a unos 28-30 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) con cuantización 4 bits (~14 GB) o A6000 (48 GB).
- GPU recomendadas: A100 80GB, H100 80GB para FP16; RTX 4090, RTX 6000 Ada o AMD Radeon RX 7900 XTX para cuantizaciones bajas.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Transformers, llama.cpp (si se generan pesos GGUF), Ollama (si se publica en su catálogo).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia, un modelo denso de 27B en una A100 80GB suele alcanzar entre 20 y 40 tokens por segundo en generación, dependiendo de la cuantización y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262K (ext. 1M) | Apache-2.0 | Visión-lenguaje híbrido |
| Qwen3.6-27B | 27B denso | No disponible | Apache-2.0 | Visión-lenguaje (predecesor) |
| Qwen3.6-35B-A3B | 35B total, 3B activos | No disponible | Apache-2.0 | MoE, más rápido pero menor calidad de agente según análisis de ExplainX |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |

Según el análisis de ExplainX, Qwen3.8-27B supera a Qwen3.6-27B en evaluaciones agénticas y de codificación, y se acerca al rendimiento de Claude Opus en tareas locales, aunque no se proporcionan cifras exactas. La comparación con Muse Glimmer-30B y Opus4.6 Max aparece en la model card pero sin datos numéricos.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones específicos de este modelo. Como todo LLM, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- La ventana de contexto de 262K tokens es nativa, pero el rendimiento con contextos muy largos puede degradarse si no se gestiona adecuadamente la memoria de atención.
- Los idiomas soportados no están documentados en la model card; se recomienda verificar la compatibilidad con el idioma de destino antes de usarlo en producción.
- El modelo es de tipo visión-lenguaje, pero las capacidades de audio no están confirmadas; la model card solo menciona imagen y vídeo.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia para asegurar el cumplimiento en aplicaciones distribuidas.
- El repo en HuggingFace (CharlesXmf/Qwen3.8-27B) tiene 0 descargas y 0 likes, lo que sugiere que es un mirror reciente o no verificado; se recomienda descargar los pesos desde el repositorio oficial de Qwen para garantizar la integridad.
- No se especifican los requisitos mínimos de hardware para la versión con contexto de 1M tokens; la extensión a 1M probablemente requiera técnicas de atención dispersa o cuantización agresiva.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/CharlesXmf/Qwen3.8-27B
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Seguimiento de lanzamiento y benchmarks: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Análisis comparativo con Claude Opus: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Página de la familia Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
