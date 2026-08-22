# cxyzz/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, presentado como la generación más avanzada de la familia Qwen3.8. Se trata de un modelo vision-language que integra un codificador visual nativo para comprender imágenes y vídeos, y está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes autónomos de largo recorrido. Su arquitectura híbrida combina atención lineal recurrente (Gated DeltaNet) con atención completa (Gated Attention), lo que permite una ventana de contexto nativa de 262 144 tokens, ampliable hasta un millón. El modelo se distribuye con licencia Apache 2.0 y está disponible en formato Transformers, siendo compatible con vLLM, SGLang y otras herramientas de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de lenguaje con vision encoder; híbrido: 48 capas de atención lineal (Gated DeltaNet) + 16 capas de atención completa (Gated Attention) |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible en la informacion |
| Idiomas soportados | No disponible en la informacion |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura híbrida de atención. De las 64 capas del transformer, solo 16 ejecutan atención completa (Gated Attention), mientras que las 48 restantes emplean atención lineal recurrente (Gated DeltaNet). El patrón se repite en bloques de 4 capas: tres de atención lineal seguidas de una de atención completa. La capa Gated DeltaNet utiliza 48 cabezas de atención para V y 16 para QK con dimensión 128, mientras la Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión 256. La dimensión oculta es 5120 y la FFN intermedia de 17 408. El modelo incorpora un vision encoder para procesar imágenes y vídeos, y ha sido entrenado con multi-token prediction (MTP) en varias etapas. No se especifican los datos de entrenamiento (tokens, composición del dataset) ni si se aplicaron técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento activable/desactivable por petición y ajuste de esfuerzo de razonamiento (`reasoning_effort`).
- Comprensión de imágenes y vídeos, incluidos diagramas STEM, documentos y vídeos de larga duración (hasta una hora).
- Ejecución de tareas agénticas: planificación autónoma, manejo de feedback del entorno y finalización de tareas complejas de múltiples pasos.
- Soporte de tool calling y function calling (indicado en la model card y en la documentación de Cloudflare).
- Capacidad de retener el contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con herramientas de desarrollo populares (vLLM, SGLang, Transformers, etc.).

## Casos de uso

- **Asistente de programación en entornos de terminal**: el modelo destaca en codificación agéntica, pudiendo ejecutar comandos, leer errores y ajustar el código de forma autónoma, como se refleja en su rendimiento en Terminal Bench 2.1 (Terminus).
- **Análisis de documentos técnicos**: su visión integrada permite procesar diagramas STEM, gráficos y documentos escaneados para extraer datos o responder preguntas sobre ellos.
- **Agente de investigación autónoma**: con su ventana de 262K tokens, puede leer largos papers, resumir y comparar resultados, y planificar pasos de investigación multi-fase.
- **Revisión de código en pipelines de CI/CD**: al soportar tool calling, puede integrarse en flujos de integración continua para revisar pull requests, detectar errores y sugerir parches.
- **Asistente de atención al cliente multilingüe**: aunque no se especifican los idiomas exactos, su entrenamiento con Qwen sugiere soporte multilingüe; puede gestionar conversaciones largas con contexto histórico.
- **Análisis de vídeo de vigilancia o contenido multimedia**: el modelo puede procesar vídeos de hasta una hora para extraer eventos, resumir acciones o identificar anomalías, útil en sistemas de monitorización.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en la información extraída. Se menciona específicamente la categoría de codificación agéntica con el benchmark Terminal Bench 2.1 (Terminus), pero sin cifras concretas.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 27,78 B de parámetros, en fp16/bf16 el modelo ocupa unos 55,6 GB (el tamaño del repo de safetensors). Con cuantización de 8 bits (Q8) se reduce a ~28 GB, y en 4 bits (Q4) a ~14 GB.
- **GPU recomendadas**: para inferencia completa en fp16 se requieren GPUs con 60+ GB de VRAM (A100 80GB, H100 80GB, o múltiples RTX 4090 con sharding). Con cuantización 4 bits es factible en una RTX 4090 de 24 GB.
- **Opciones de despliegue**: compatible con Transformers, vLLM, SGLang, TokenSpeed, llama.cpp (via GGUF) y Ollama, así como con servicios gestionados como Qwen Cloud y Cloudflare Workers AI.
- **Latencia y throughput**: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B | 262K nativo / 1M ext. | Híbrida (linear + full attention) | Apache 2.0 | Vision-language, agéntico |
| Qwen3.6-27B | 27 B | No disponible | No disponible | No disponible | Modelo anterior de la misma familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Modelo propietario (Plus) |
| Muse Glimmer-30B | 30 B | No disponible | No disponible | No disponible | Competidor de tamaño similar |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Modelo propietario de alto rendimiento |

No se dispone de información completa sobre las alternativas listadas en la model card para una comparación detallada. Los datos de rendimiento de la tabla de benchmarks no están disponibles.

## Limitaciones y advertencias

- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide datos concretos.
- **Limitaciones de idioma**: no se han publicado los idiomas soportados; se asume soporte multilingüe por la familia Qwen, pero no se garantiza.
- **Dependencia del contexto**: la ventana de 262K tokens es amplia, pero la calidad puede degradarse en los extremos de la ventana; se recomienda validar en tareas de contexto muy largo.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede incluir sesgos derivados de los datos de entrenamiento no publicados.
- **Requisitos de hardware**: para inferencia en producción con contexto largo se necesita VRAM considerable; la cuantización puede degradar la calidad en tareas de razonamiento complejo.
- **Sin garantía de integración**: la compatibilidad con herramientas externas (vLLM, SGLang, etc.) está indicada, pero se recomienda probar la integración en el entorno de despliegue.

## Enlaces

- HuggingFace (mirror): https://huggingface.co/cxyzz/Qwen3.8-27B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- BenchLM.ai: https://benchlm.ai/models/qwen3-8-27b
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
