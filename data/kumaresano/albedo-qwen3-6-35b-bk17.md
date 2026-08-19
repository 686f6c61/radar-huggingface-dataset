# kumaresano/albedo-qwen3.6-35b-bk17

## Resumen

El modelo `kumaresano/albedo-qwen3.6-35b-bk17` es una variante del Qwen3.6-35B-A3B, un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por Alibaba en la serie Qwen3.6. Se trata de un modelo de arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention) y mezcla de expertos (MoE), con 35.951 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su contexto nativo de 262.144 tokens, extensible hasta 1.010.000, lo hace especialmente adecuado para tareas de razonamiento de largo alcance y agentes de código.

La relevancia de este modelo radica en que prioriza la estabilidad y la utilidad práctica frente a la innovación experimental, según el propio equipo de Qwen. Sus mejoras principales se centran en el coding agéntico (frontend y razonamiento a nivel de repositorio) y en la preservación del contexto de razonamiento en conversaciones multiturno, lo que reduce la sobrecarga en flujos de desarrollo iterativo. El repositorio actual contiene los pesos en formato safetensors (BF16) y es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido (Gated DeltaNet + Gated Attention + MoE) con vision encoder |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3.000 millones (8 expertos ruteados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos originales en BF16) |
| Idiomas soportados | no disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer causal híbrido que intercala bloques de atención lineal y atención clásica. La configuración de capas es `10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`, es decir, por cada 4 bloques, 3 usan Gated DeltaNet (atención lineal con cabezas separadas para V y QK) y 1 usa Gated Attention (atención clásica con RoPE de 64 dimensiones). El bloque MoE contiene 256 expertos con 8 ruteados y 1 compartido, con dimensión intermedia de 512. La capa de salida tiene un embedding de 248.320 tokens (padding). El modelo incluye un vision encoder para entrada de imágenes, lo que lo convierte en un modelo image-text-to-text.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, y se menciona que el módulo MTP (Multi-Token Prediction) fue entrenado con multi-steps. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación técnica destacable es la combinación de atención lineal y atención clásica, que reduce el coste computacional en contextos largos manteniendo la capacidad de razonamiento profundo, junto con la opción de preservar el contexto de razonamiento histórico para flujos de desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento complejo con contexto largo (hasta 262K tokens nativos).
- Razonamiento agéntico y multi-step, especialmente optimizado para tareas de codificación a nivel de repositorio y flujos de frontend.
- Comprensión de imágenes (vision encoder incluido), permitiendo tareas de image-text-to-text como descripción de imágenes, captions o razonamiento visual.
- Soporte de tool calling y function calling, dado que es un modelo de la serie Qwen diseñado para agentes.
- Capacidad de preservar el contexto de razonamiento de mensajes históricos, útil en conversaciones iterativas de desarrollo.
- Multilingüe (aunque no se especifica la lista exacta de idiomas, los modelos Qwen suelen cubrir decenas de idiomas).
- Compatible con frameworks de inferencia estándar (Transformers, vLLM, SGLang, KTransformers).

## Casos de uso

- **Asistente de programación agéntico**: el modelo puede razonar sobre repositorios completos, entender el flujo de trabajo de frontend y generar código con precisión. Su contexto de 262K tokens permite cargar archivos de proyecto enteros en una sola pasada, reduciendo la necesidad de fragmentación.
- **Automatización de tareas de desarrollo (DevOps)**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar pull requests, detectar errores o proponer parches, usando su capacidad de razonamiento multi-step para evaluar el impacto de los cambios.
- **Agente conversacional con memoria de razonamiento**: la preservación del contexto de razonamiento histórico lo hace adecuado para chatbots de soporte técnico que necesitan recordar decisiones previas y justificaciones a lo largo de conversaciones largas.
- **Análisis de documentos técnicos extensos**: su ventana de contexto nativa de 262K tokens permite procesar manuales, especificaciones o documentación de API completa en una sola consulta, extrayendo información relevante o resumiendo secciones.
- **Generación de código con comprensión visual**: al ser multimodal, puede recibir capturas de pantalla de una interfaz de usuario y generar el código HTML/CSS o React correspondiente, o viceversa, describir una imagen y proponer implementaciones.
- **Investigación y razonamiento matemático**: su arquitectura híbrida con atención lineal y MoE activo permite manejar problemas de razonamiento complejo con un coste computacional moderado, adecuado para entornos con GPUs de consumo.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de benchmarks para tareas de coding agéntico, comparando con modelos similares. Los datos disponibles son los siguientes:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | **73.4** |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | **67.2** |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | **49.5** |
| Terminal-Bench 2.0 | (dato no extraído) | (dato no extraído) | (dato no extraído) | (dato no extraído) | (dato no extraído) |

Nota: el valor de Terminal-Bench 2.0 no está completo en la información extraída. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un MoE con 3B parámetros activos, la inferencia en BF16 requiere aproximadamente 72 GB de VRAM para los pesos completos (35B en BF16). Con cuantización a 8 bits, se puede reducir a ~36 GB, y a 4 bits a ~18 GB, aunque no se especifican cuantizaciones oficiales.
- **GPU recomendadas**: para inferencia sin cuantizar, se requieren GPUs de datacenter como A100 80GB, H100 o múltiples RTX 4090 (24GB) con tensor parallelism. Con cuantización 4 bits, una RTX 4090 o RTX 3090 (24GB) puede ser suficiente.
- **En consumer GPU**: sí, es viable en GPUs de consumo de 24GB con cuantización, aunque la velocidad dependerá del ancho de banda de memoria. Un artículo independiente menciona que el modelo 35B-A3B es 3-4 veces más rápido que el 27B denso en una RTX 4090 usando llama.cpp con compresión de KV cache.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y llama.cpp (por la naturaleza de los pesos safetensors). También se puede servir mediante Ollama si se convierte a GGUF.
- **Latencia y throughput**: no disponible en la información proporcionada. Se espera un throughput alto gracias a los 3B parámetros activos, pero los valores concretos dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este) | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | MoE híbrido, multimodal |
| Qwen3.5-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | MoE híbrido, multimodal |
| Qwen3.5-27B | 27B | 27B | 262K | Apache 2.0 | Denso, multimodal |
| Gemma4-31B | 31B | 31B | 128K | Gemma License | Denso, multimodal |

El modelo supera a Gemma4-31B y a su predecesor Qwen3.5-35BA3B en SWE-bench Verified y Pro, aunque queda ligeramente por debajo de Qwen3.5-27B en estos benchmarks concretos. Su ventaja principal frente al 27B denso es el coste computacional mucho menor (3B activos frente a 27B), lo que permite mayor velocidad de inferencia en el mismo hardware.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se dispone de información específica sobre sesgos del modelo. Como modelo entrenado con datos web, puede heredar sesgos sociales, culturales y de género presentes en el corpus.
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas de alucinación. Es recomendable validar las respuestas en tareas de código y hechos factuales.
- **Limitaciones de contexto**: aunque el contexto nativo es de 262K tokens, el rendimiento en longitudes extremas (cercanas a 1M) puede degradarse y requiere técnicas de extensión de contexto adicionales.
- **Idiomas**: no se especifica la lista de idiomas soportados. Aunque los modelos Qwen suelen cubrir decenas de idiomas, la calidad puede variar significativamente entre ellos.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia original de Qwen por si hay cláusulas adicionales.
- **Caveat de producción**: el modelo es una variante (bk17) de un usuario de HuggingFace, no un release oficial de Alibaba. Aunque los pesos parecen ser los de Qwen3.6-35B-A3B, no hay garantía de que el repositorio sea una copia fiel ni de que no contenga modificaciones. Se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kumaresano/albedo-qwen3.6-35b-bk17
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Comparativa 35B vs 27B (zoliben.com): https://zoliben.com/en/posts/2026-04-23-qwen-36-35b-vs-27b-benchmark-results/
