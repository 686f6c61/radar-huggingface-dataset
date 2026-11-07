# savethisok/qwen36-fp8row-995ad96

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba. Se trata del primer lanzamiento con pesos abiertos de la serie Qwen3.6, construido sobre la arquitectura de la generación anterior Qwen3.5 e incorporando mejoras orientadas a la estabilidad y a la utilidad práctica en flujos de trabajo de programación. El modelo combina una arquitectura híbrida de atención lineal (Gated DeltaNet) y atención con compuertas (Gated Attention) con una capa de mezcla de expertos (MoE) de 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, lo que resulta en 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token.

La relevancia de este lanzamiento radica en su enfoque en la "programación agéntica": el modelo está optimizado para razonamiento a nivel de repositorio, flujos de trabajo de frontend y tareas de ingeniería de software que requieren múltiples pasos. Además, introduce la "preservación del pensamiento" (Thinking Preservation), una opción que permite retener el contexto de razonamiento de mensajes históricos, reduciendo la sobrecarga en desarrollos iterativos.

Con una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y una licencia Apache 2.0, el modelo se posiciona como una alternativa abierta y permisiva para aplicaciones de producción que requieren comprensión de imágenes, generación de código y razonamiento multi-paso con ventanas de contexto muy amplias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet + Gated Attention con MoE |
| Parámetros totales | 34.660.610.688 (≈35B) |
| Parámetros activos | ≈3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | FP8 (compressed-tensors); no se detallan otros formatos en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang y KTransformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal con codificador de visión, organizada en 40 capas con una dimensión oculta de 2.048. El diseño híbrido intercala bloques de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) y bloques de Gated Attention (16 cabezas para Q y 2 para KV, dimensión de cabeza 256, dimensión de RoPE 64) en un patrón de 10 repeticiones de la secuencia `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. La capa MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con una dimensión intermedia de experto de 512. El modelo incluye además entrenamiento con Multi-Token Prediction (MTP) en múltiples pasos y un vocabulario de 248.320 tokens (con padding).

El entrenamiento se realizó en dos fases (pre-entrenamiento y post-entrenamiento), aunque la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo se construyó a partir de los comentarios directos de la comunidad, priorizando la estabilidad y la utilidad en el mundo real. Entre las innovaciones destacables figuran la preservación del pensamiento (retención del contexto de razonamiento histórico) y el soporte de MTP, que puede habilitar decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multi-paso, con especial énfasis en tareas de programación y razonamiento a nivel de repositorio.
- Comprensión de imágenes (pipeline image-text-to-text) mediante codificador de visión integrado.
- Programación agéntica: manejo de flujos de trabajo de frontend y razonamiento sobre repositorios completos.
- Preservación del pensamiento: opción para retener el contexto de razonamiento de mensajes históricos en conversaciones iterativas.
- Capacidades multilingües: no detalladas en la información disponible, aunque se reportan resultados en SWE-bench Multilingual.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: implícito en su orientación a "agentic coding" y en los benchmarks de agentes de programación.
- Modo de razonamiento extensible (thinking) con contexto de hasta 1.010.000 tokens.
- Compatibilidad con transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- **Resolución automática de incidencias en repositorios**: el modelo puede analizar un repositorio completo y proponer parches gracias a su contexto nativo de 262.144 tokens y a su entrenamiento en SWE-bench Verified (73,4). Adecuado para pipelines de revisión automática de pull requests.
- **Asistente de programación en IDE con contexto largo**: con la preservación del pensamiento, puede mantener el hilo de razonamiento entre iteraciones de un mismo desarrollo, reduciendo la repetición de contexto y mejorando la coherencia en sesiones largas.
- **Generación de código frontend**: su mejora específica en flujos de trabajo de frontend permite generar componentes UI, hojas de estilo y lógica de interacción a partir de descripciones textuales o capturas de pantalla (gracias al codificador de visión).
- **Automatización de tareas en terminal**: con resultados reportados en Terminal-Bench 2.0, puede emplearse en agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de línea de comandos.
- **Análisis de documentos técnicos con imágenes**: al aceptar entradas image-text-to-text, puede procesar diagramas de arquitectura, capturas de errores o documentación escaneada junto con texto para generar explicaciones o código.
- **Migración y refactorización multi-archivo**: su capacidad de razonamiento a nivel de repositorio y su contexto extensible hasta 1.010.000 tokens lo hacen adecuado para tareas que requieren coherencia entre múltiples archivos y módulos.
- **Atención al cliente técnica**: puede gestionar conversaciones multi-turno con contexto largo sobre documentación técnica y código, aunque no se detallan capacidades específicas de diálogo en la información disponible.

## Benchmarks y rendimiento

Los resultados publicados en la model card (parcialmente visibles) comparan Qwen3.6-35B-A3B con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K. Los datos de Terminal-Bench 2.0 aparecen truncados en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP8 (formato del repositorio, 37,3 GB), se requieren aproximadamente 37-40 GB de VRAM solo para los pesos, más memoria para KV cache y activaciones. En cuantizaciones de 4 bits (no confirmadas para este modelo) podría reducirse a ~18-20 GB, pero no se detalla disponibilidad de GGUF.
- **GPU recomendadas**: A100 80GB, H100 80GB, o GPUs con al menos 48 GB para FP8 con contexto moderado. Para contexto completo de 262.144 tokens se necesita memoria adicional significativa para KV cache.
- **¿Cabe en consumer GPU?**: en FP8 no cabe en GPUs de consumo de 24 GB (RTX 4090) sin cuantización adicional no documentada. Sería necesario recurrir a cuantizaciones de 4 bits si estuvieran disponibles, o a offloading.
- **Opciones de despliegue**: transformers, vLLM, SGLang, KTransformers (según la model card).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B totales / 3B activos | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 | Pesos abiertos (HF) |
| Qwen3.5-35BA3B | 35B totales / 3B activos | no disponible | 70,0 | no disponible | Pesos abiertos |
| Qwen3.5-27B | 27B | no disponible | 75,0 | no disponible | Pesos abiertos |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | Pesos abiertos |
| Gemma4-26BA4B | 26B totales / 4B activos | no disponible | 17,4 | no disponible | Pesos abiertos |

Qwen3.6-35B-A3B mejora a su predecesor Qwen3.5-35BA3B en SWE-bench Verified (+3,4), SWE-bench Multilingual (+6,9) y SWE-bench Pro (+4,9), aunque queda por debajo de Qwen3.5-27B en SWE-bench Verified (73,4 frente a 75,0). Supera ampliamente a los modelos Gemma4 en tareas de programación agéntica. No se dispone de datos de contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos.
- **Riesgo de alucinación**: no cuantificado en la información disponible; presente en tareas de generación de código y texto, especialmente en contextos muy largos.
- **Limitaciones de contexto o idioma**: los idiomas soportados no están detallados; aunque se reportan resultados en SWE-bench Multilingual, no se especifica qué idiomas cubre. El contexto nativo es de 262.144 tokens, pero la extensión a 1.010.000 puede degradar el rendimiento.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y distribución con atribución; no se identifican restricciones adicionales en la información disponible.
- **Caveats para producción**: el repositorio analizado es una cuantización FP8 de un tercero (`savethisok/qwen36-fp8row-995ad96`), no el repositorio oficial de Qwen; conviene verificar la fidelidad de la cuantización. El formato FP8 requiere hardware compatible (por ejemplo, GPUs Hopper o Ada Lovelace con soporte FP8). No se detallan técnicas de RLHF/DPO ni composición del dataset, lo que limita la evaluación de riesgos.
- **Datos de benchmarks truncados**: los resultados de Terminal-Bench 2.0 no están completos en la información disponible.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/savethisok/qwen36-fp8row-995ad96
- Repositorio oficial de Qwen3.6-35B-A3B (referenciado en la licencia): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Colección Qwen3.6 en Hugging Face: https://huggingface.co/collections/Qwen/qwen36
- Qwen Chat: https://chat.qwen.ai
- Licencia Apache 2.0: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
