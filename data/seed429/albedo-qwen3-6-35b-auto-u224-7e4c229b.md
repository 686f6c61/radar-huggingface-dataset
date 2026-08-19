# seed429/albedo-qwen3.6-35b-auto-u224-7e4c229b

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por Alibaba en el marco de la serie Qwen3.6, siendo la primera variante open-weight de esta generación. El modelo está diseñado para priorizar la estabilidad y la utilidad real, con un enfoque particular en tareas de codificación agéntica y razonamiento a nivel de repositorio. Utiliza una arquitectura híbrida de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, combinando atención lineal (Gated DeltaNet) con atención completa (Gated Attention). Su longitud de contexto nativa es de 262.144 tokens, ampliable hasta aproximadamente 1.010.000 tokens, lo que lo hace adecuado para tareas que requieren ventanas de contexto muy largas.

El modelo se distribuye bajo licencia Apache 2.0 y es compatible con el ecosistema Hugging Face Transformers, vLLM, SGLang y KTransformers. La versión alojada en el repositorio `seed429/albedo-qwen3.6-35b-auto-u224-7e4c229b` es un snapshot de los pesos en formato safetensors con 35.951.822.704 parámetros, preparado para su uso con la librería Transformers. Su relevancia actual radica en que representa la evolución de la serie Qwen3.5, incorporando mejoras en flujos de trabajo de frontend y preservación del contexto de razonamiento histórico, lo que resulta especialmente útil para desarrollo iterativo de software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention + MoE) con vision encoder |
| Parametros totales | 35.951.822.704 (35B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | NVFP4 disponible (repo comunitario); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles (multilingüe presumible, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), compatible con Transformers, vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina atención lineal y atención completa. El modelo se organiza en 40 capas con una disposición de 10 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → MoE) seguidos de 1 sub-bloque de (Gated Attention → MoE). La capa Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La capa Gated Attention emplea 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El componente MoE cuenta con 256 expertos en total, de los cuales 8 son enrutados más 1 compartido por token, con dimensión intermedia de 512. La dimensión oculta es 2048 y el embedding de tokens es de 248.320 (con padding). El modelo incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque los datos específicos de entrenamiento (número de tokens, composición del dataset) no se detallan en la información disponible. La arquitectura híbrida con Gated DeltaNet permite un procesamiento eficiente de secuencias largas, mientras que la atención completa se reserva para determinados sub-bloques, equilibrando rendimiento y coste computacional. El modelo incorpora una opción para preservar el contexto de razonamiento de mensajes históricos, lo que reduce la sobrecarga en desarrollos iterativos.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de codificación agéntica.
- Razonamiento a nivel de repositorio y flujos de trabajo de frontend con mayor fluidez y precisión.
- Comprensión de imágenes (modelo image-text-to-text) gracias a su vision encoder integrado.
- Soporte de preservación de contexto de razonamiento histórico, optimizando iteraciones de desarrollo.
- Capacidades multilingües no confirmadas explícitamente, aunque se asume soporte amplio por la familia Qwen.
- Compatible con tool calling y uso como agente, dado su rendimiento en benchmarks de codificación agéntica.
- Ventana de contexto extensible hasta 1M tokens, adecuada para documentos largos y repositorios completos.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede gestionar tareas complejas de resolución de issues en repositorios, como demuestra su puntuación de 73.4 en SWE-bench Verified, integrándose en pipelines de CI/CD para automatizar correcciones.
- Asistente de programación con contexto de repositorio completo: su ventana de 262K tokens permite cargar múltiples archivos de un proyecto, ofreciendo sugerencias coherentes con la estructura global del código.
- Generación de código frontend: su mejora específica en flujos de trabajo de frontend lo hace adecuado para generar componentes UI, estilos y lógica de interacción.
- Revisión de código automatizada: puede analizar pull requests, detectar errores y proponer parches, aprovechando su capacidad de razonamiento a nivel de repositorio.
- Análisis de documentación técnica extensa: con contexto ampliable a 1M tokens, puede procesar manuales completos o especificaciones largas para extraer información relevante.
- Asistente multimodal para desarrollo: al aceptar imágenes como entrada, puede interpretar capturas de pantalla de interfaces o diagramas de arquitectura y generar código correspondiente.
- Chat conversacional técnico: su capacidad de preservar razonamiento histórico permite mantener hilos de conversación coherentes sobre temas técnicos complejos.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card del autor, comparando Qwen3.6-35B-A3B con modelos similares:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros en BF16, se requieren aproximadamente 70 GB de VRAM sin cuantizar; con cuantización NVFP4, el requisito baja a unos 35-40 GB.
- GPU recomendadas: para despliegue en producción se recomiendan A100 (80 GB), H100 (80 GB) o A6000 (48 GB); para cuantización NVFP4, una RTX 4090 (24 GB) podría ser suficiente con técnicas de offloading.
- No cabe en GPUs de consumo estándar (8-16 GB) sin cuantización agresiva y offloading a CPU.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Hugging Face Transformers, y contenedores Docker listos para producción (ver repositorio NVFP4-vLLM).
- Latencia y throughput: no disponibles en la información proporcionada; al ser MoE con 3B activos, se espera un throughput superior al de un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (1M ext.) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | 262K (1M ext.) | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | 31B (denso) | no disponible | no disponible | 52.0 |

Qwen3.6-35B-A3B mejora ligeramente a su predecesor Qwen3.5-35B-A3B en SWE-bench Verified (73.4 vs 70.0) y supera claramente a Gemma4-31B (52.0). El modelo denso Qwen3.5-27B obtiene una puntuación ligeramente superior (75.0), pero con mayor coste computacional al activar todos sus parámetros por token.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones específicas de sesgos; como modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de generación de código donde puede producir soluciones incorrectas.
- Limitaciones de contexto: aunque la ventana es extensible a 1M tokens, el rendimiento en longitudes extremas no está documentado y puede degradarse.
- Idiomas: no se confirma la lista de idiomas soportados; se recomienda verificar el comportamiento en el idioma objetivo antes de desplegar en producción.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero se debe revisar el LICENSE del repositorio original de Qwen para confirmar términos adicionales.
- Disponibilidad de cuantizaciones: solo se ha confirmado NVFP4; otras cuantizaciones (GGUF, AWQ, GPTQ) no están disponibles oficialmente.
- El repositorio `seed429/albedo-qwen3.6-35b-auto-u224-7e4c229b` es un snapshot de la comunidad; se recomienda usar los pesos oficiales de Qwen para entornos de producción críticos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/seed429/albedo-qwen3.6-35b-auto-u224-7e4c229b
- Repositorio oficial de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de despliegue con vLLM y NVFP4: https://github.com/MiaAI-Lab/Qwen3.6-35B-A3B-NVFP4-vLLM
- Documentación de vLLM Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html
