# aljosadro/mirror-afgod1079-re1-cp100-39e7f627

## Resumen

El modelo `aljosadro/mirror-afgod1079-re1-cp100-39e7f627` es un espejo en Hugging Face del modelo `afgod1079/Affine-5eqgpsdo6a-cp1800`, que a su vez corresponde a la arquitectura Qwen3.6-35B-A3B publicada por Alibaba. Se trata de un modelo de lenguaje causal multimodal (imagen y texto) con arquitectura de mezcla de expertos (MoE) y un codificador de visión integrado. El modelo está diseñado para tareas de razonamiento, generación de código, uso de herramientas y agentes, con especial énfasis en flujos de trabajo de programación a nivel de repositorio y preservación del contexto de razonamiento en conversaciones multi-turno.

Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, el modelo ofrece un rendimiento cercano a modelos de 35B densos con un coste de inferencia notablemente menor. Su contexto nativo de 262.144 tokens, extensible hasta 1.010.000, lo posiciona como una opción competitiva para tareas que requieren ventanas largas, como análisis de repositorios completos o documentación técnica extensa. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con vision encoder, mezcla de expertos (MoE) híbrida con Gated DeltaNet y Gated Attention |
| Parámetros totales | 35.951.822.704 (35B) |
| Parámetros activos | 3B (por token) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantización | No disponible (pesos en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en una disposición de 40 capas: 10 bloques de 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention, cada bloque con su correspondiente capa MoE. El bloque MoE cuenta con 256 expertos, de los cuales 8 se activan por token más 1 experto compartido, con dimensión intermedia de 512. Esta mezcla de mecanismos de atención lineal y atención con rotary position embeddings (64 dimensiones) permite mantener eficiencia computacional en contextos largos.

El entrenamiento incluye una etapa de preentrenamiento y un post-entrenamiento orientado a tareas de agente y codificación. La fase de post-entrenamiento introduce una opción para conservar el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en iteraciones de desarrollo. El modelo se entrenó con una técnica de multi-step MTP (Multi-Token Prediction) para mejorar la eficiencia de decodificación. Los datos de entrenamiento y el detalle de los procedimientos de RLHF o DPO no se han publicado en la información disponible.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas no especificados).
- Codificación avanzada: soporta flujos de trabajo de frontend y razonamiento a nivel de repositorio.
- Uso de herramientas y function calling (integrado en el post-entrenamiento).
- Razonamiento multi-paso y modo agente para tareas complejas.
- Entrada multimodal: acepta imágenes además de texto (pipeline `image-text-to-text`).
- Preservación de contexto de razonamiento en mensajes históricos para iteraciones de desarrollo.
- Ventana de contexto nativa de 262K tokens, extensible a más de 1M con técnicas de interpolación.

## Casos de uso

- Asistente de programación integrado en IDE: el modelo puede analizar un repositorio completo, razonar sobre arquitectura y sugerir cambios gracias a su contexto de 262K tokens y su capacidad de razonamiento a nivel de repositorio.
- Automatización de tareas de desarrollo (SWE-bench): puede resolver issues reales en repositorios, como se demuestra en benchmarks con 73,4% en SWE-bench Verified.
- Agente de terminal: el modelo puede ejecutar comandos y razonar sobre salidas de terminal para depuración o administración de sistemas.
- Análisis de documentación y papers técnicos: con su ventana de contexto extendida, puede procesar documentos largos (libros, papers, especificaciones) y responder preguntas complejas.
- Generación de código en producción: soporta llamada de herramientas y puede integrarse en pipelines de CI/CD para generar tests, parches o documentación automáticamente.
- Asistente multimodal para soporte técnico: al aceptar imágenes, puede analizar capturas de pantalla de errores, diagramas de arquitectura o documentación visual para ayudar en la resolución de incidencias.

## Benchmarks y rendimiento

La información disponible incluye resultados parciales de benchmarks de la tabla de Qwen3.6-35B-A3B. Se comparan con otros modelos de la misma categoría:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | **73,4** |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | **67,2** |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | **49,5** |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~72 GB (35B × 2 bytes), requiere una GPU de clase profesional como A100 80GB, H100 o 2× RTX 4090/RTX 6000 Ada.
- Con cuantización 4-bit (AWQ/GPTQ), la VRAM se reduce a ~18 GB, lo que permite ejecutarlo en una RTX 4090 o RTX 3090 con suficiente memoria.
- Al ser un modelo MoE, la memoria activa por token es de ~3B parámetros, lo que reduce el coste de inferencia en comparación con modelos densos de 35B.
- Opciones de despliegue: compatible con HuggingFace Transformers, vLLM, SGLang, KTransformers y llama.cpp (si se proporcionan pesos GGUF).
- Latencia y throughput: no se han publicado mediciones específicas. En configuraciones con vLLM en una A100 80GB se puede esperar un throughput de decodificación superior a 50 tokens/s, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Parámetros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este modelo) | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 73,4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 70,0 |
| Qwen3.5-27B (denso) | 27B | 27B | 262K | Apache 2.0 | 75,0 |
| Gemma4-31B | 31B | 31B | 128K | Gemma Terms | 52,0 |
| Gemma4-26B-A4B | 26B | 4B | 128K | Gemma Terms | 17,4 |

El modelo se posiciona como una alternativa eficiente de Qwen3.5-27B, ofreciendo un rendimiento ligeramente inferior en SWE-bench pero con 10× menos parámetros activos, lo que reduce el coste de inferencia. Supera claramente a los modelos Gemma4 en tareas de codificación agéntica.

## Limitaciones y advertencias

- El modelo se distribuye como un espejo no oficial del modelo `afgod1079/Affine-5eqgpsdo6a-cp1800`; no hay garantía de integridad o soporte por parte de Alibaba.
- Los idiomas soportados no están documentados; la evaluación se ha centrado en inglés y códigos.
- No se han publicado evaluaciones de sesgos o alucinación; como cualquier LLM, puede generar contenido factualmente incorrecto o inventado.
- La extensión del contexto a 1M tokens puede degradar la calidad de razonamiento si no se utiliza interpolación de RoPE adecuada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original de Qwen si se redistribuyen pesos o se integra en productos comerciales.
- El modelo no es adecuado para uso en producción sin una evaluación rigurosa en el dominio específico y una mitigación de riesgos (filtrado de salidas, verificación de código, etc.).

## Enlaces

- HuggingFace del modelo espejo: https://huggingface.co/aljosadro/mirror-afgod1079-re1-cp100-39e7f627
- Modelo original en HuggingFace: https://huggingface.co/afgod1079/Affine-5eqgpsdo6a-cp1800
- Blog de Qwen3.6-35B-A3B (fuente de la arquitectura y benchmarks): https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
