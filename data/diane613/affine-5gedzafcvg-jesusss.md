# diane613/affine-5gedzafcvg-jesusss

## Resumen

El repositorio `diane613/affine-5gedzafcvg-jesusss` aloja los pesos y la configuración del modelo Qwen3.6-35B-A3B, la primera variante open-weight de la serie Qwen3.6 desarrollada por Alibaba Qwen. Se trata de un modelo causal de lenguaje multimodal (imagen-texto) con arquitectura Mixture of Experts (MoE) híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention). Con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional, orientado a tareas de agente y codificación a nivel de repositorio. Su contexto nativo de 262 144 tokens, extensible hasta más de un millón, lo posiciona como una opción relevante para aplicaciones que requieren razonamiento sobre documentos largos o flujos de trabajo complejos.

El modelo destaca por sus mejoras en "agentic coding" (codificación orientada a agentes) y la preservación del contexto de razonamiento entre mensajes históricos, lo que reduce la sobrecarga en desarrollo iterativo. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio, creado en agosto de 2026, contiene los artefactos en formato safetensors y es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, MoE híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 35 107 181 936 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 010 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se asume multilingüe por la familia Qwen, sin confirmación en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.6-35B-A3B combina dos mecanismos de atención en una disposición por capas: cada bloque contiene tres subcapas de Gated DeltaNet (atención lineal con cabezas separadas para V y QK) seguidas de una subcapa de MoE, y cada décimo bloque incorpora una subcapa de Gated Attention (atención completa con cabezas GQA) antes del MoE. El modelo tiene 40 capas, dimensión oculta de 2048, y 256 expertos con 8 activados más un experto compartido. El tamaño de embedding es de 248 320 (padding). Incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que acelera la decodificación especulativa.

El entrenamiento consta de una fase de pre-entrenamiento y otra de post-entrenamiento, aunque el README no detalla el volumen de tokens ni la composición del dataset. Las innovaciones clave son la preservación del contexto de razonamiento (Thinking Preservation), que permite retener el historial de cadenas de pensamiento entre turnos, y el énfasis en flujos de trabajo de agente a nivel de repositorio. El modelo incluye un codificador visual, por lo que acepta entradas de imagen además de texto.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto largo (hasta 262K tokens nativos).
- Codificación orientada a agentes: manejo de flujos de trabajo completos, edición de repositorios y razonamiento a nivel de proyecto.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Capacidades multimodales: entrada de imágenes junto con texto (pipeline image-text-to-text).
- Preservación del contexto de razonamiento: opción para mantener cadenas de pensamiento históricas en conversaciones iterativas.
- Decodificación especulativa mediante MTP (Multi-Token Prediction) para mejorar el throughput.
- Compatibilidad con múltiples frameworks de inferencia (Transformers, vLLM, SGLang, KTransformers).

## Casos de uso

- Asistente de programación en repositorios grandes: el modelo puede analizar código fuente, proponer cambios y ejecutar tareas de refactorización gracias a su ventana de contexto de 262K tokens y su entrenamiento en agentic coding.
- Automatización de resolución de incidencias (issue triage): integrado en un agente, puede leer hilos de issues, reproducir errores y generar parches, como sugiere su rendimiento en SWE-bench Verified (73.4).
- Chatbot de atención al cliente con contexto largo: capaz de mantener conversaciones multi-turno con historial extenso y documentos de referencia, sin perder el hilo.
- Análisis de documentos técnicos y legales: la ventana de contexto amplia permite procesar manuales, contratos o informes completos en una sola pasada.
- Generación de código con razonamiento previo: el modo thinking preservado facilita iteraciones de desarrollo donde se requiere explicar decisiones antes de escribir código.
- Sistemas RAG con razonamiento profundo: combina recuperación de información con cadenas de pensamiento para responder preguntas complejas sobre corpus extensos.
- Asistente multimodal para documentación técnica: al aceptar imágenes, puede interpretar diagramas, capturas de pantalla o esquemas junto con texto.

## Benchmarks y rendimiento

Los resultados presentados provienen de la model card oficial del modelo (Qwen3.6-35B-A3B). Se muestran los valores disponibles en la información proporcionada; el resto de la tabla original no se ha incluido por estar incompleta.

| Benchmark | Qwen3.6-35B-A3B |
|---|---|
| SWE-bench Verified | 73.4 |
| SWE-bench Multilingual | 67.2 |
| SWE-bench Pro | 49.5 |
| Terminal-Bench 2.0 | no disponible en la información extraída |

No se han publicado resultados para benchmarks generales de lenguaje como MMLU, HumanEval o GSM8K en la documentación disponible.

## Requisitos de hardware

- Al ser un modelo MoE con 3B parámetros activos, la inferencia requiere menos VRAM que un modelo denso de 35B, aunque los pesos completos ocupan aproximadamente 70 GB en FP16 (según el tamaño del repositorio).
- Con cuantización a 4 bits (p. ej., GPTQ o AWQ), se estima que podría ejecutarse en GPUs con 24 GB de VRAM (RTX 3090/4090), aunque no hay datos oficiales de consumo.
- Para despliegue en producción con contexto largo, se recomienda GPUs con al menos 40 GB (A100, H100) o múltiples GPUs en paralelo.
- Compatible con vLLM, SGLang, KTransformers y Hugging Face Transformers, lo que permite optimizaciones como paged attention y decodificación especulativa.
- El throughput estimado depende del hardware y la configuración; con MTP y 3B activos, puede alcanzar velocidades superiores a modelos densos de tamaño similar, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

La siguiente tabla compara Qwen3.6-35B-A3B con otros modelos de la misma categoría (MoE de ~30B totales) según los datos del README:

| Modelo | Parámetros totales | Parámetros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | 73.4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | 70.0 | Apache 2.0 |
| Qwen3.5-27B | 27B | no disponible | no disponible | 75.0 | Apache 2.0 |
| Gemma4-31B | 31B | no disponible | no disponible | 52.0 | Gemma License |
| Gemma4-26B-A4B | 26B | 4B | no disponible | 17.4 | Gemma License |

Qwen3.6-35B-A3B supera a su predecesor directo (Qwen3.5-35B-A3B) en SWE-bench Verified y se acerca al rendimiento de Qwen3.5-27B, aunque con mayor contexto nativo. Frente a Gemma4-31B, la ventaja es notable en tareas de codificación de agentes.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos ni evaluación de seguridad en la documentación proporcionada; como modelo entrenado en datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo; se recomienda verificación humana en aplicaciones críticas.
- El contexto nativo de 262K tokens puede degradar el rendimiento si se extiende más allá de ese límite; la extensión a 1M tokens no está garantizada en todos los frameworks.
- Los idiomas soportados no están documentados explícitamente; aunque la familia Qwen es multilingüe, no se confirma la cobertura exacta para este modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incluye un codificador visual que podría tener dependencias adicionales no detalladas.
- El repositorio es una copia de los pesos de Qwen3.6-35B-A3B publicada por un usuario no oficial (diane613); se recomienda verificar la integridad y procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/diane613/affine-5gedzafcvg-jesusss
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Perfil del autor en HuggingFace: https://huggingface.co/diane613
