# Qwen/Qwen3.6-35B-A3B-FP8

## Resumen

Qwen3.6-35B-A3B-FP8 es la variante cuantizada en FP8 del modelo Qwen3.6-35B-A3B, desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo causal de lenguaje con encoder de visión (image-text-to-text) que combina una arquitectura de mezcla de expertos (MoE) híbrida con capas de Gated DeltaNet y Gated Attention. Con 35.953 millones de parámetros totales y solo 3.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional.

La versión FP8 emplea cuantización de grano fino con bloque de tamaño 128, lo que mantiene un rendimiento casi idéntico al modelo original en precisión completa. El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta aproximadamente 1.010.000, y está pensado para tareas de codificación agéntica, razonamiento sobre repositorios y flujos de trabajo de frontend. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

La relevancia de este lanzamiento radica en que es la primera variante open-weight de la serie Qwen3.6, diseñada a partir de la retroalimentación de la comunidad para priorizar estabilidad y utilidad real en entornos de desarrollo. El modelo es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, lo que facilita su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet y Gated Attention, con vision encoder |
| Parametros totales | 35.953.925.552 (35B) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativa, extensible hasta 1.010.000 |
| Tipos de cuantizacion | FP8 (bloque de 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 256 expertos en total, de los cuales se activan 8 enrutados más 1 compartido por token. El layout interno es de 40 capas, organizadas como 10 bloques de `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. La capa de Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza de 128. La capa de Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza de 256 y RoPE de dimensión 64. La dimensión oculta es de 2048 y la salida LM tiene un tamaño de 248320 (padded).

El entrenamiento se realizó en dos etapas: pre-training y post-training. Se menciona el uso de MTP (multi-token prediction) entrenado con múltiples pasos, una técnica que permite predecir varios tokens futuros simultáneamente. La cuantización FP8 se aplicó de forma fina con bloque de tamaño 128, y según la documentación, las métricas de rendimiento son casi idénticas a las del modelo original. El modelo base es Qwen/Qwen3.6-35B-A3B, y esta versión FP8 es un checkpoint cuantizado post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional de propósito general.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio con fluidez y precisión.
- Preservación del razonamiento: opción de retener el contexto de razonamiento de mensajes históricos, lo que agiliza el desarrollo iterativo y reduce la sobrecarga computacional.
- Procesamiento multimodal: el pipeline es image-text-to-text, por lo que puede procesar entradas de imagen y texto (aunque no se detallan capacidades específicas de visión en la documentación).
- Soporte de tool calling: no documentado explícitamente en la ficha, pero su orientación a agentes de codificación sugiere capacidad para integrar herramientas externas.
- Extensión de contexto: hasta 1.010.000 tokens, útil para tareas que requieren ventanas muy largas, como análisis de repositorios completos.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede actuar como agente autónomo que navega por un repositorio, comprende la estructura del código y propone cambios o correcciones. Su ventana de contexto de 262K tokens permite procesar proyectos completos sin fragmentación.
- Asistente de programación en IDE: integrado en editores como VS Code, puede generar código, explicar fragmentos y refactorizar funciones. Su bajo número de parámetros activos (3B) reduce la latencia en comparación con modelos densos de tamaño similar.
- Revisión de código automatizada: con la capacidad de preservar el razonamiento histórico, puede analizar pull requests y mantener el contexto de discusiones anteriores para sugerir mejoras coherentes.
- Generación de documentación técnica: a partir de código fuente o especificaciones, puede redactar documentación detallada, comentarios y guías de uso.
- Automatización de flujos de trabajo frontend: puede generar componentes de interfaz, estilos y lógica de interacción, apoyándose en su entrenamiento específico para tareas de frontend.
- Análisis de repositorios y búsqueda semántica: su contexto extensible permite indexar y razonar sobre grandes volúmenes de código, facilitando la localización de funciones, dependencias o patrones.
- Chatbot técnico con contexto largo: en soporte técnico o comunidades de desarrollo, puede mantener conversaciones multi-turno con historial extenso y documentos adjuntos.

## Benchmarks y rendimiento

Los resultados publicados se centran en benchmarks de codificación agéntica. La siguiente tabla compara Qwen3.6-35B-A3B con modelos similares de la misma categoría. Los datos provienen de la model card oficial.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | No disponible |

Nota: el valor de SWE-bench Pro para Qwen3.6-35BA3B no está completo en la información proporcionada (el dato se corta en la tabla original). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la documentación disponible.

## Requisitos de hardware

- El repositorio FP8 ocupa 37.5 GB, por lo que se estima que los pesos del modelo requieren aproximadamente 36 GB de VRAM en FP8 (35.95B parámetros × 1 byte por parámetro).
- Para inferencia sin offloading se recomienda una GPU con al menos 40 GB de VRAM, como A100 40GB/80GB, H100 o RTX 6000 Ada.
- No cabe en GPUs de consumo típicas de 24 GB (RTX 4090) sin cuantización adicional o técnicas de offloading a CPU.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la documentación oficial.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | 73.4 | Apache-2.0 |
| Qwen3.5-35B-A3B | 35B | 3B | No disponible | 70.0 | Apache-2.0 |
| Qwen3.5-27B | 27B | 27B (denso) | No disponible | 75.0 | Apache-2.0 |
| Gemma4-26B-A4B | 26B | 4B | No disponible | 17.4 | No disponible |

Qwen3.6-35B-A3B supera a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified (73.4 vs 70.0) y en SWE-bench Multilingual (67.2 vs 60.3), aunque queda ligeramente por detrás de Qwen3.5-27B en Verified (73.4 vs 75.0). La ventaja principal del modelo MoE es su menor coste de inferencia por token activado.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible, pero como modelo entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- El soporte de idiomas no está especificado; la documentación no indica qué lenguas cubre.
- La extensión de contexto hasta 1.010.000 tokens puede degradar la calidad del razonamiento en los extremos de la ventana, aunque no se proporcionan datos al respecto.
- La cuantización FP8 puede introducir ligeras diferencias numéricas frente al modelo en BF16, aunque la documentación afirma que el rendimiento es casi idéntico.
- No se detalla el comportamiento del encoder de visión en tareas específicas; solo se indica que el pipeline es image-text-to-text.
- Aunque la licencia Apache-2.0 permite uso comercial, es recomendable verificar el cumplimiento de las condiciones de atribución.

## Enlaces

- Modelo FP8 en Hugging Face: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio GitHub de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Receta de vLLM para Qwen3.6-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.6-35B-A3B-FP8
- Discusión en foros de NVIDIA: https://forums.developer.nvidia.com/t/qwen-qwen3-6-35b-a3b-and-fp8-has-landed/366822
