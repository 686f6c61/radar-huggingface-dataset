# bodenmaurice/kumar-qwen3.6-35b-bk17

## Resumen

El modelo `bodenmaurice/kumar-qwen3.6-35b-bk17` es una variante del modelo Qwen3.6-35B-A3B, desarrollado originalmente por Qwen (Alibaba) y subido a Hugging Face por el usuario bodenmaurice. Se trata de un modelo de lenguaje causal con encoder de visión, diseñado para tareas de image-text-to-text, con un enfoque especial en coding agéntico y razonamiento a nivel de repositorio. Es la primera variante open-weight de la serie Qwen3.6, que prioriza estabilidad y utilidad real en entornos de desarrollo.

Con 35 mil millones de parámetros totales y solo 3 mil millones activos por token gracias a su arquitectura de mezcla de expertos (MoE), ofrece un equilibrio entre capacidad y eficiencia computacional. Su longitud de contexto nativa es de 262 144 tokens, extensible hasta 1 010 000, lo que lo hace adecuado para tareas que requieren procesar documentos extensos o conversaciones de largo recorrido. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual del modelo radica en su capacidad para manejar flujos de trabajo de codificación complejos, como la generación de frontend y el razonamiento a nivel de repositorio, además de introducir la opción de preservar el contexto de razonamiento de mensajes históricos, una característica demandada por la comunidad de desarrolladores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) y MoE |
| Parametros totales | 35 951 822 704 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 |
| Tipos de cuantizacion | no disponible (repo contiene safetensors en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), organizadas en un patrón de 10 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → MoE) seguidos de 1 sub-bloque de (Gated Attention → MoE). El Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La capa MoE contiene 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512.

El entrenamiento se realizó en dos etapas: pre-training y post-training. No se proporcionan detalles sobre el número de tokens ni la composición del dataset. El modelo incorpora MTP (multi-token prediction) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de codificación y matemáticas.
- Procesamiento de imágenes (pipeline image-text-to-text), permitiendo entrada visual junto con texto.
- Coding agéntico: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio con alta fluidez.
- Preservación del razonamiento: opción de retener el contexto de razonamiento de mensajes históricos, útil para desarrollo iterativo.
- Ventana de contexto larga (hasta 1M tokens) para procesar documentos extensos o conversaciones multi-turno.
- Capacidad de razonamiento multi-step, aunque no se especifica explícitamente el soporte de tool calling o function calling.

## Casos de uso

- Desarrollo de software asistido: el modelo puede razonar sobre el contenido de un repositorio completo, sugiriendo cambios o implementaciones basadas en el contexto histórico, gracias a su ventana de 262K tokens.
- Generación de frontend automatizada: su capacidad de coding agéntico permite crear interfaces de usuario a partir de descripciones o maquetas, integrando visión si se proporcionan imágenes.
- Agentes de codificación autónomos: con soporte para preservar el razonamiento de mensajes anteriores, puede mantener un hilo de pensamiento coherente durante tareas de depuración o refactorización de código.
- Asistencia en revisión de código: puede analizar pull requests y detectar problemas lógicos o de estilo, aprovechando su contexto largo para entender el código circundante.
- Chatbots conversacionales con contexto extenso: su ventana de 1M tokens permite mantener conversaciones muy largas sin perder información relevante, útil para atención al cliente o asistentes técnicos.
- Análisis de documentos técnicos con imágenes: al ser multimodal, puede interpretar diagramas, capturas de pantalla o esquemas junto con texto, facilitando la documentación técnica automatizada.

## Benchmarks y rendimiento

La model card proporciona resultados para tareas de codificación agéntica. No se han publicado resultados para benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 73.4 |
| SWE-bench Multilingual | 67.2 |
| SWE-bench Pro | 49.5 |
| Terminal-Bench 2.0 | no disponible (valor no especificado en la información proporcionada) |

Estos valores se comparan en la model card con otros modelos: Qwen3.5-27B (75.0, 69.3, 51.2), Gemma4-31B (52.0, 51.7, 35.7), Qwen3.5-35BA3B (70.0, 60.3, 44.6) y Gemma4-26BA4B (17.4, 17.3, 13.8). El modelo Qwen3.6-35BA3B obtiene resultados competitivos, aunque ligeramente inferiores a Qwen3.5-27B en SWE-bench Verified y Pro.

## Requisitos de hardware

- El tamaño del repo en safetensors es de 71.9 GB, lo que corresponde a pesos en fp16. Para inferencia sin cuantización se necesitaría al menos 72 GB de VRAM, lo que requiere múltiples GPUs de alta gama (por ejemplo, 2× A100 40GB o 2× H100 80GB).
- Con cuantización a 4 bits (por ejemplo, mediante GPTQ o AWQ), el modelo podría ocupar alrededor de 18-20 GB, haciéndolo viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Sin embargo, no se proporcionan cuantizaciones oficiales en el repo.
- Al ser un modelo MoE con solo 3B parámetros activos por token, la latencia por token es relativamente baja comparada con un modelo denso de 35B, pero el intercambio de expertos requiere memoria para cargar los pesos de todos los expertos.
- Opciones de despliegue: vLLM, SGLang, KTransformers y Transformers, según indica la model card. También es posible usar llama.cpp para cuantización GGUF, aunque no se menciona explícitamente.
- Para uso en producción, se recomienda un servidor con al menos 2 GPUs de 24 GB o una sola GPU de 48 GB (como A6000) con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | 262K (1M ext.) | Apache 2.0 | 73.4 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | Apache 2.0 | 75.0 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | 70.0 |
| Gemma4-31B | 31B | 31B (denso) | no disponible | no disponible | 52.0 |

El modelo se sitúa en un punto intermedio entre Qwen3.5-27B (denso, mayor rendimiento en SWE-bench pero más costoso por token) y Qwen3.5-35B-A3B (MoE, más eficiente). Su ventaja principal es la ventana de contexto extendida y la preservación del razonamiento, características no presentes en las versiones anteriores.

## Limitaciones y advertencias

- No se especifican los idiomas soportados; aunque Qwen suele ser multilingüe, no hay confirmación para esta variante.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de codificación donde puede generar código incorrecto o inseguro.
- El modelo es una subida de terceros (bodenmaurice), no un release oficial de Qwen, por lo que la reproducibilidad y el soporte pueden ser limitados.
- El tamaño del repo (71.9 GB) requiere un almacenamiento considerable y puede ser un obstáculo para despliegues en entornos con recursos limitados.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar los términos de la licencia original de Qwen para evitar conflictos.
- La preservación del razonamiento puede aumentar el uso de memoria y tokens en conversaciones largas, lo que debe considerarse en el diseño de aplicaciones.

## Enlaces

- HuggingFace: https://huggingface.co/bodenmaurice/kumar-qwen3.6-35b-bk17
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Guía de InsiderLLM para ejecutar Qwen 3.6 35B MoE localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Guía completa de Qwen 3.6 (27B dense vs 35B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Tutorial de Dev.to sobre cómo ejecutar Qwen 3.6 localmente: https://dev.to/purpledoubled/how-to-run-qwen-36-locally-27b-dense-35b-moe-and-coding-variants-setup-guide-4di
