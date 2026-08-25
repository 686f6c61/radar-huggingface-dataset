# 0xbidkslj1/albedo-qwen3.6-35b-v11

## Resumen

El modelo `0xbidkslj1/albedo-qwen3.6-35b-v11` es una variante publicada por el usuario 0xbidkslj1 del modelo Qwen3.6-35B-A3B, desarrollado originalmente por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal con codificador de visión (pipeline image-text-to-text) que sigue la línea de la serie Qwen3.6, publicada tras la serie Qwen3.5, y que prioriza la estabilidad y la utilidad en entornos reales de desarrollo de software.

El modelo emplea una arquitectura MoE (Mixture of Experts) híbrida con 34.660.610.688 parámetros totales (35B) y aproximadamente 3B activos por token. Incorpora una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens. La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención clásica Gated Attention, junto con un bloque MoE de 256 expertos de los que se activan 8 enrutados más 1 compartido. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo reside en su capacidad para tareas de coding agéntico y razonamiento a nivel de repositorio, con un rendimiento competitivo en benchmarks como SWE-bench Verified (73,4) y SWE-bench Multilingual (67,2), superando a modelos comparables de la misma categoría. Es una opción interesante para desarrolladores que buscan un modelo multimodal eficiente en parámetros activos y con soporte de contexto largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (repo sin cuantizaciones listadas) |
| Idiomas soportados | no disponible (no listados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B emplea una arquitectura de modelo de lenguaje causal con codificador de visión. La estructura del modelo es de 40 capas (según la model card se indica "Number of Layers: 28" en el texto extraído, aunque el layout describe 10 bloques repetidos, lo que sugiere 40 capas; el dato de capas no es consistente en la fuente, por lo que se indica lo que figura en la card). La configuración del bloque se repite como 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). Esto significa que por cada 4 sub-bloques, 3 utilizan atención lineal Gated DeltaNet y 1 utiliza atención clásica Gated Attention, con capas MoE intercaladas.

El componente Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza de 128. El Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza de 256 y RoPE de dimensión 64. El bloque MoE contiene 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. La salida LM es de 248.320 tokens (padding). El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, e incluye entrenamiento con multi-steps para MTP (Multi-Token Prediction).

## Capacidades

- Generación de texto causal con soporte multimodal: acepta entradas de imagen y texto, generando respuestas de texto.
- Razonamiento agéntico de codificación: maneja flujos de trabajo frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión que la serie Qwen3.5.
- Preservación de contexto de razonamiento: incluye una opción para retener el contexto de razonamiento de mensajes históricos, lo que agiliza el desarrollo iterativo.
- Soporte de tool calling y function calling: no se confirma explícitamente en la información disponible, pero la arquitectura y la naturaleza agéntica del modelo sugieren que es compatible.
- Capacidades multilingües: no se especifican idiomas concretos en la card, pero por la familia Qwen se espera soporte multilingüe amplio (inglés, chino, etc.).
- Contexto largo: 262K nativo y extensible a 1M tokens, adecuado para tareas que requieren ventanas de contexto muy amplias.

## Casos de uso

- **Asistente de programación agéntica**: el modelo puede manejar flujos de trabajo de frontend y razonamiento a nivel de repositorio, permitiendo que un agente de IA navegue por un código base, entienda la estructura del proyecto y proponga cambios coherentes.
- **Revisión de código automatizada**: gracias a su ventana de contexto de 262K tokens, puede analizar archivos largos y múltiples archivos a la vez, identificando errores, vulnerabilidades o mejoras de estilo en pull requests.
- **Chat conversacional multimodal**: al aceptar imágenes como entrada, puede describir capturas de pantalla, diagramas o maquetas de UI, y responder preguntas sobre ellas en lenguaje natural.
- **Desarrollo de frontend asistido**: el modelo está entrenado para manejar flujos de trabajo de frontend, por lo que puede generar componentes HTML/CSS/JS a partir de descripciones textuales o imágenes de referencia.
- **Documentación técnica y resúmenes**: con su capacidad de contexto largo, puede leer documentación extensa, manuales o especificaciones y generar resúmenes, tutoriales o guías de integración.
- **Análisis de repositorios de código**: puede analizar un repositorio completo (estructura, dependencias, historial) y responder preguntas sobre su arquitectura, identificar patrones o generar informes de calidad del código.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo Qwen3.6-35BA3B destaca en benchmarks de codificación agéntica, quedando ligeramente por detrás de Qwen3.5-27B en SWE-bench Verified (73,4 vs 75,0) pero superando al resto de alternativas. En SWE-bench Multilingual obtiene 67,2, y en SWE-bench Pro 49,5. Los datos de Terminal-Bench 2.0 no están disponibles en la información proporcionada.

## Requisitos de hardware

- Tamaño del repo: 69,3 GB en formato safetensors (pesos completos en fp16/bf16).
- VRAM estimada para inferencia: con 35B parámetros totales, se requiere un mínimo de ~70 GB de VRAM en precisión completa (fp16). Con cuantizaciones 4-bit (GGUF Q4_K_M) el requisito baja a ~20-25 GB, y con 8-bit a ~35-40 GB.
- GPU recomendadas: para inferencia local con cuantización, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo en 4-bit con contexto moderado. Para precisión completa o contexto muy largo, se necesitan GPUs profesionales como A100 80GB, H100 o configuraciones multi-GPU.
- Despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, según la card del modelo.
- Latencia y throughput: no disponible en la información proporcionada. Sin embargo, al ser un modelo MoE con solo 3B de parámetros activos por token, la velocidad de generación es considerablemente mayor que la de un modelo denso de 35B, con tasas de tokens por segundo típicas de modelos de ~3B activos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este modelo) | 35B | ~3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | Apache 2.0 |
| Qwen3.5-27B (dense) | 27B | 27B | no disponible | 75,0 | Apache 2.0 |
| Gemma4-31B | 31B | 31B | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 17,4 | no disponible |

El modelo se posiciona como una opción equilibrada entre eficiencia y rendimiento en tareas de codificación agéntica. Supera a Gemma4-31B y Gemma4-26B-A4B por un margen amplio, y se acerca al rendimiento del Qwen3.5-27B denso, pero con solo 3B de parámetros activos por token, lo que reduce significativamente el coste computacional de inferencia.

## Limitaciones y advertencias

- El modelo es una variante publicada por un usuario tercero (0xbidkslj1), no el lanzamiento oficial de Alibaba. Aunque la model card se basa en el Qwen3.6-35B-A3B original, no hay garantías de que los pesos sean idénticos al lanzamiento oficial.
- La información de la card presenta inconsistencias: se indica "Number of Layers: 28" pero el layout describe 10 bloques, lo que sugiere 40 capas. Esto puede ser un error tipográfico en la card original.
- No hay datos disponibles sobre idiomas soportados, tipos de cuantización oficiales ni resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval) en la información proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni informes de uso en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede tener sesgos heredados de su entrenamiento con datos de internet, y no se han publicado evaluaciones de sesgo ni de alucinación.
- El contexto nativo de 262K tokens requiere gestión cuidadosa de memoria y latencia; en GPU consumer, la extensión a 1M tokens puede ser inviable sin técnicas de memoria eficiente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/0xbidkslj1/albedo-qwen3.6-35b-v11
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía completa de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía para ejecutar Qwen3.6-35B MoE localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Otras variantes del modelo: https://huggingface.co/Dendritex/albedo-qwen3.6-35b-ckpt100 y https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-XXI
- Guía alternativa de Qwen3.6-35B-A3B: https://conneqtme.com/guides/qwen3-35b-a3b-local-ai-guide-2026
