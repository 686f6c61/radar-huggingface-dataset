# ctz168/Qwen3.8-27B-GGUF-q4km

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal nativo (visión y lenguaje) desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Con 27 mil millones de parámetros en arquitectura densa, está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte, integrando un modo de razonamiento flexible (thinking mode) y comprensión de imágenes y vídeo de hasta una hora de duración.

El modelo destaca por su arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), lo que permite una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE como YaRN. Además, incorpora Multi-Token Prediction (MTP) para acelerar la inferencia y un soporte mejorado para tool calling y flujos agénticos, lo que lo hace especialmente relevante para entornos de producción que requieren razonamiento multi-paso y ejecución autónoma de tareas.

La versión analizada es un GGUF cuantizado a 4 bits (q4km) publicado por el usuario ctz168, basado en el modelo original de Qwen y generado con Unsloth Dynamic V3.0. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su tamaño compacto (27B) lo hace viable en hardware de consumo con cuantización adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF q4km (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (no especificado en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (q4km), safetensors (modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention). Concretamente, la configuración de 64 capas sigue el patrón: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La atención lineal utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 17 408 y el embedding de tokens es de 248 320 (padded). Además, el modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la velocidad de decodificación.

El entrenamiento comprende fases de pre-training y post-training, aunque no se han publicado detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card menciona mejoras en el soporte de tool calling (parsing de objetos anidados), retención de contexto de razonamiento histórico mediante `preserve_thinking` y control de profundidad de razonamiento con `reasoning_effort`. El modelo es nativamente multimodal, con un encoder de visión que procesa imágenes y vídeo, y admite modos de pensamiento activables o desactivables por petición.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento (thinking mode) activable por defecto y desactivable por petición.
- Comprensión multimodal nativa: imágenes (diagramas STEM, documentos) y vídeo de larga duración (hasta una hora).
- Soporte de tool calling / function calling mejorado, con parsing robusto de objetos anidados para integración en agentes.
- Capacidades de agente: planificación autónoma, manejo de feedback del entorno y ejecución de tareas multi-paso de largo horizonte.
- Multi-Token Prediction (MTP) para inferencia más rápida.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Multilingüismo: no se especifican idiomas concretos, pero al ser un modelo Qwen se espera soporte amplio (no confirmado).
- Compatibilidad con herramientas de desarrollo y harnesses populares (mencionado en la documentación).

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en IDE o pipelines de CI/CD para generar código, revisar cambios y sugerir correcciones, gracias a su soporte de tool calling y su capacidad de razonamiento multi-paso.
- Automatización de oficina: procesamiento de documentos, generación de informes, resúmenes de actas y extracción de información de imágenes o PDFs escaneados, aprovechando su visión nativa.
- Agente de atención al cliente: gestión de conversaciones multi-turno con contexto largo (hasta 262K tokens) y capacidad de ejecutar acciones (consultar bases de datos, enviar respuestas) mediante function calling.
- Análisis de vídeo: revisión de grabaciones de vigilancia, vídeos de formación o contenido generado por usuarios, extrayendo eventos relevantes o generando descripciones automáticas.
- Investigación académica: asistencia en revisión de literatura, generación de hipótesis y análisis de datos experimentales, con razonamiento profundo y manejo de documentos extensos.
- Desarrollo de agentes autónomos: construcción de sistemas que planifican y ejecutan tareas complejas (navegación web, gestión de proyectos) con memoria de contexto prolongada y adaptación a feedback del entorno.
- Traducción y localización: aunque no se confirman idiomas, su naturaleza multilingüe esperada permite su uso en pipelines de traducción automática con contexto amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas respecto a generaciones anteriores (Qwen3.5 y Qwen3.6), pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar el repositorio oficial de Qwen para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización GGUF q4km, los pesos ocupan aproximadamente 13,5 GB (27B × 4 bits), más overhead de activaciones y KV cache. Se estima un consumo total de 16-18 GB, aunque no hay datos oficiales.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como RTX 4090, RTX 4080, A100 40GB, H100, o GPUs AMD con soporte ROCm (según el anuncio de AMD Day-0).
- En consumer GPU: cabe en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) con cuantización más agresiva, aunque no se han probado oficialmente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte para MTP), TGI, y Unsloth Desktop (compatible con Mac, Windows y Linux).
- Latencia y throughput: no disponibles. El MTP debería acelerar la decodificación, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otras alternativas. Sin embargo, se puede contextualizar dentro de la familia Qwen:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Multimodal, híbrido DeltaNet + Attention, MTP |
| Qwen3.5 (generación anterior) | No disponible | No disponible | Apache 2.0 (presumible) | Base arquitectónica de Qwen3.8 |
| Qwen3.6 (generación anterior) | No disponible | No disponible | Apache 2.0 (presumible) | Mejoras incrementales |

No se dispone de información suficiente sobre modelos de otros fabricantes con especificaciones comparables (p. ej., Llama 3.1 70B o Mistral Large) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se han publicado datos de sesgos ni evaluación de seguridad específica para esta versión; se recomienda auditar el modelo antes de usarlo en entornos sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; verificar siempre las salidas en tareas críticas.
- La ventana de contexto de 262K tokens puede degradar el rendimiento si se supera sin escalado RoPE; para textos ultra-largos se recomienda YaRN.
- El modo de pensamiento puede generar respuestas más largas y lentas; ajustar `reasoning_effort` según la latencia requerida.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales en cuanto a atribución; revisar los términos del repositorio original.
- La cuantización q4km puede introducir pérdida de precisión en tareas de razonamiento complejo; probar con cuantizaciones superiores si es necesario.
- No se especifican idiomas soportados; el rendimiento en lenguas minoritarias no está garantizado.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/ctz168/Qwen3.8-27B-GGUF-q4km
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de Unsloth para Qwen3.8-27B: https://unsloth.ai/models/qwen3.8-27b
- Blog de AMD sobre soporte Day-0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía completa en Lovable: https://lovableapp.org/blog/qwen3-8-27b
- Información en OpenLM: https://openlm.ai/qwen3.8/
