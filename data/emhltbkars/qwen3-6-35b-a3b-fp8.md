# emhltbkars/Qwen3.6-35B-A3B-FP8

## Resumen

Qwen3.6-35B-A3B-FP8 es una versión cuantizada a FP8 del modelo Qwen3.6-35B-A3B, desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo de lenguaje causal con codificador de visión, de arquitectura Mixture of Experts (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Esta variante FP8 ha sido publicada por el usuario `emhltbkars` en Hugging Face y mantiene la licencia Apache 2.0 del modelo original.

El modelo está orientado a tareas de codificación agéntica, razonamiento a nivel de repositorio y flujos de trabajo de frontend, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Incorpora una innovación denominada "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollos iterativos. Su pipeline declarado es `image-text-to-text`, lo que confirma capacidades multimodales de entrada.

La relevancia de esta ficha radica en que se trata de una cuantización FP8 de bloques de 128, compatible con Transformers, vLLM, SGLang y KTransformers, lo que la hace atractiva para despliegues en producción con menor huella de memoria que la versión en precisión completa, manteniendo métricas de rendimiento casi idénticas según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; MoE híbrido con Gated DeltaNet y Gated Attention |
| Parametros totales | 35.951.822.704 (según safetensors) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | FP8 con cuantización de grano fino y tamaño de bloque 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer híbrida con 40 capas organizadas en un patrón de 10 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. La dimensión oculta es de 2048 y el embedding de tokens de 248.320 (con padding). El componente Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El componente Gated Attention emplea 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La capa MoE contiene 256 expertos con dimensión intermedia de 512, de los cuales se activan 8 enrutados más 1 compartido por token. El modelo fue entrenado con Multi-Token Prediction (MTP) en múltiples pasos.

El proceso de entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La cuantización FP8 aplicada en esta variante es de grano fino con bloques de 128, y según el autor mantiene métricas de rendimiento casi idénticas a las del modelo original sin cuantizar.

## Capacidades

- Generación de texto y razonamiento general en tareas conversacionales y de análisis.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias al codificador de visión integrado.
- Retención de contexto de razonamiento entre mensajes históricos mediante la opción "Thinking Preservation".
- Capacidades multilingües: la model card no especifica la lista de idiomas soportados, aunque incluye un benchmark SWE-bench Multilingual.
- Razonamiento multi-paso y ejecución de tareas agénticas complejas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo thinking: no confirmado explícitamente en la información disponible.

## Casos de uso

- Desarrollo de software asistido a nivel de repositorio: el modelo puede analizar y razonar sobre múltiples archivos y dependencias de un proyecto gracias a su contexto de 262.144 tokens, lo que lo hace adecuado para tareas de refactorización y corrección de bugs en bases de código extensas.
- Automatización de flujos de frontend: con su enfoque en "Agentic Coding", puede generar y modificar componentes de interfaz de usuario de forma iterativa, aprovechando "Thinking Preservation" para no repetir razonamiento ya resuelto entre turnos.
- Agentes de codificación autónomos: su rendimiento en SWE-bench Verified (73,4) y SWE-bench Pro (44,6) lo posiciona para integrarse en pipelines que resuelven issues de repositorios de forma automática.
- Asistencia en tareas multimodales: al aceptar entrada de imagen y texto, puede emplearse para interpretar capturas de pantalla, diagramas de arquitectura o documentación visual junto con instrucciones textuales.
- Despliegue en producción con vLLM o SGLang: la variante FP8 reduce la huella de memoria y permite servir el modelo en infraestructura con GPUs de menor VRAM que la requerida por la versión en BF16, manteniendo un rendimiento cercano al original.
- Análisis de documentación técnica extensa: la ventana de contexto extensible hasta 1.010.000 tokens permite procesar manuales, especificaciones o historiales de conversación muy largos en una sola pasada.
- Evaluación de código multilingüe: su resultado en SWE-bench Multilingual (67,2) sugiere utilidad en entornos con múltiples lenguajes de programación.

## Benchmarks y rendimiento

Los datos de benchmarks provienen de la model card del modelo base Qwen3.6-35B-A3B. La tabla original se interrumpe en la información proporcionada tras la fila de SWE-bench Pro, por lo que solo se recogen los valores completos disponibles.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | no disponible (dato truncado) |

No se han publicado en la información disponible resultados de benchmarks de lenguaje general (MMLU, HumanEval, GSM8K) ni métricas específicas de la variante FP8 frente al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 37,5 GB en FP8, por lo que se requiere al menos ~40 GB de VRAM para cargar los pesos completos en GPU, más memoria adicional para el contexto y el codificador de visión.
- GPU recomendadas: para FP8 en precisión completa se recomiendan A100 80GB, H100 80GB o GPUs con soporte nativo de FP8. Para contextos largos (262K tokens) se necesita margen adicional de memoria KV.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en FP8 completo; sería necesaria una cuantización adicional (por ejemplo, a 4 bits) no proporcionada en este repositorio.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (este, FP8) | 35,95B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | no disponible | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |

La comparativa se limita a los datos reflejados en la tabla de benchmarks de la model card. No se dispone de información sobre contexto, licencia ni parámetros activos de los modelos alternativos más allá de lo indicado.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni evaluaciones de seguridad del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado métricas de fidelidad factual en la información disponible.
- La lista de idiomas soportados no está disponible, lo que impide confirmar el alcance multilingüe más allá de la existencia de un benchmark multilingüe de código.
- Aunque la licencia es Apache 2.0, se recomienda verificar el enlace de licencia del modelo base para confirmar condiciones de uso comercial.
- La cuantización FP8, aunque el autor afirma un rendimiento casi idéntico, puede introducir degradaciones menores no cuantificadas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado por un usuario no oficial; se recomienda validar la integridad de los pesos frente al modelo base oficial.
- El contexto extensible hasta 1.010.000 tokens puede requerir técnicas específicas de escalado no documentadas en la información proporcionada.
- No se confirma soporte explícito de tool calling ni de modo thinking en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/emhltbkars/Qwen3.6-35B-A3B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8/blob/main/LICENSE
