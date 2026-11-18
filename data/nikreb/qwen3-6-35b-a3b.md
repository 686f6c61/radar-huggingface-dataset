# nikreb/Qwen3.6-35B-A3B

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) publicado bajo licencia Apache 2.0 y distribuido en el repositorio de Hugging Face `nikreb/Qwen3.6-35B-A3B`. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, sucesora de Qwen3.5, y está orientada a cargas de trabajo de codificación agéntica, razonamiento a nivel de repositorio y flujos de desarrollo iterativos. El modelo combina un encoder de visión con un transformer de mezcla de expertos (MoE) de 35.951.822.704 parámetros totales, de los cuales solo 3B se activan por token, lo que permite un equilibrio entre capacidad y coste de inferencia.

La arquitectura emplea un diseño híbrido con capas de atención lineal Gated DeltaNet intercaladas con capas de atención completa (Gated Attention), organizadas en 40 capas según el patrón 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la categoría de contexto ultralargo. Incorpora 256 expertos con 8 expertos enrutados más 1 compartido activados por token, y fue entrenado con multi-token prediction (MTP) en múltiples pasos.

La relevancia actual del modelo radica en su enfoque en "Agentic Coding" y en la denominada "Thinking Preservation", una opción que permite retener el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en desarrollo iterativo. Su pipeline `image-text-to-text` y su compatibilidad con Transformers, vLLM, SGLang y KTransformers lo posicionan como una opción práctica para despliegues de agentes de código y asistentes multimodales con requisitos de contexto extenso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; transformer híbrido MoE con Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer causal con encoder de visión, entrenado en dos fases: pre-entrenamiento y post-entrenamiento. La dimensión oculta es de 2048, con un tamaño de embedding de tokens de 248.320 (con padding) y 40 capas organizadas en un patrón repetido de 10 bloques que combinan tres capas de Gated DeltaNet (atención lineal) seguidas de una capa de Gated Attention (atención completa), cada una seguida de una capa MoE. La Gated DeltaNet emplea 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64.

La capa MoE contiene 256 expertos con 8 expertos enrutados más 1 compartido activados por token, y una dimensión intermedia de experto de 512. El modelo fue entrenado con multi-token prediction (MTP) en múltiples pasos, una técnica que permite predecir varios tokens futuros simultáneamente y que suele asociarse a decodificación especulativa y mejoras de throughput. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento general en un modelo causal multimodal con encoder de visión.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text`).
- Codificación agéntica: flujos de frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión según el autor.
- Thinking Preservation: opción para retener el contexto de razonamiento de mensajes históricos y reducir sobrecarga en desarrollo iterativo.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: orientado a cargas agénticas de código según los highlights del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: sí, mediante la funcionalidad de preservación de razonamiento histórico.
- Contexto ultralargo de hasta 1.010.000 tokens para documentos extensos y repositorios completos.

## Casos de uso

- Agente de codificación en repositorios: el modelo puede razonar sobre un repositorio completo gracias a su contexto nativo de 262.144 tokens (extensible a 1.010.000), lo que permite resolver tareas de SWE-bench Verified con una puntuación reportada de 73,4 y abordar modificaciones multi-archivo sin truncar el contexto.
- Desarrollo frontend iterativo: la funcionalidad de Thinking Preservation retiene el contexto de razonamiento entre mensajes, lo que reduce la sobrecarga de repetir el historial en cada iteración de un flujo de trabajo de UI.
- Automatización de terminal y operaciones: con una puntuación reportada en Terminal-Bench 2.0, el modelo es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell.
- Asistente multimodal de documentación técnica: al aceptar entrada image-text-to-text, puede procesar capturas de pantalla, diagramas de arquitectura o mockups junto con texto para generar documentación o explicaciones.
- Migración y refactorización multi-idioma: su puntuación en SWE-bench Multilingual (67,2) lo hace apto para tareas de código en varios lenguajes dentro de un mismo repositorio.
- Análisis de repositorios de gran tamaño: la ventana extensible a 1.010.000 tokens permite cargar bases de código completas para auditorías de seguridad, revisiones de arquitectura o generación de tests.
- Integración en pipelines de CI/CD: compatible con vLLM, SGLang y KTransformers, puede desplegarse como servicio de inferencia para revisión automática de pull requests y generación de parches.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y comparan Qwen3.6-35B-A3B con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general. La información de Terminal-Bench 2.0 está truncada en la fuente y no se puede reproducir con fiabilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en safetensors ocupan 71,9 GB en el repositorio, lo que implica que en precisión completa se requiere un nodo multi-GPU; con cuantización a 8 bits podría reducirse a aproximadamente 36 GB y a 4 bits a unos 18 GB, aunque estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del repositorio, se requiere al menos un nodo con varias A100/H100 para pesos sin cuantizar.
- ¿Cabe en GPU consumer? No disponible de forma confirmada. Con cuantización agresiva podría ser viable en GPUs de 24 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput estimados: no disponibles. La activación de solo 3B parámetros por token y el entrenamiento con MTP sugieren un throughput superior al de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35,95B | 3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | no disponible | 3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B (denso) | 27B | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | no disponible | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | 4B | no disponible | 17,4 | no disponible |

La comparativa se limita a los datos de la model card. No se dispone de información sobre contexto, licencia ni parámetros activos de los modelos alternativos más allá de lo reflejado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como modelo generativo de código y texto, es susceptible de generar APIs o fragmentos inexistentes, especialmente en contextos de repositorio muy extensos.
- Limitaciones de contexto o idioma: los idiomas soportados no están especificados; el contexto nativo es de 262.144 tokens y la extensión a 1.010.000 puede degradar la calidad si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia original del autor (`Qwen/Qwen3.6-35B-A3B`) para confirmar términos.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una réplica o espejo no oficial del modelo original; conviene verificar la procedencia de los pesos antes de desplegarlos. No se han publicado datos de cuantización, latencia ni throughput, lo que dificulta la planificación de capacidad. La información de benchmarks está parcialmente truncada en la fuente.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/nikreb/Qwen3.6-35B-A3B
- Licencia (referencia del autor): https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog post del modelo: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Imagen de benchmarks: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_35b_a3b_score.png
- Logo: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.6/logo.png
