# Fastiraz/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se trata de una arquitectura Mixture-of-Experts (MoE) con 35 mil millones de parámetros totales, de los cuales solo 3 mil millones se activan por token, lo que lo hace especialmente eficiente para inferencia en hardware de consumo. Este repositorio concreto, Fastiraz/Qwen3.6-35B-A3B-GGUF, contiene la conversión a formato GGUF realizada por Fastiraz, pensada para su ejecución con llama.cpp, Ollama u otros motores compatibles.

El modelo destaca por su contexto nativo de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, y por sus mejoras en tareas de coding agéntico, tool calling y preservación del razonamiento en conversaciones multiturno. Incluye un encoder de visión, por lo que puede procesar imágenes junto con texto. La cuantización GGUF permite ejecutarlo en GPUs de consumo con requisitos de VRAM moderados, como una RTX 3090 con 24 GB usando cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con Gated DeltaNet y Gated Attention, con vision encoder |
| Parametros totales | 34 660 610 688 (35B declarados) |
| Parametros activos | 3B (8 expertos rutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 nativo, extensible a 1 010 000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene multiples archivos GGUF, pero no se especifican los tipos concretos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 256 expertos, de los cuales 8 se activan por token junto con 1 experto compartido. La capa oculta tiene dimensión 2048 y se compone de 40 capas distribuidas en un patrón 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). La Gated DeltaNet es una atención lineal con 32 cabezas para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El modelo incluye un encoder de visión, lo que le permite procesar entradas de imagen y texto.

El entrenamiento consta de una fase de pre-training y otra de post-training. Se menciona el uso de MTP (Multi-Token Prediction) entrenado con múltiples pasos. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de técnicas de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de codificación a nivel de repositorio.
- Tool calling y function calling mejorados, con parsing de objetos anidados para mayor fiabilidad.
- Soporte para agentes y razonamiento multi-step, con preservación del contexto de razonamiento en mensajes históricos (thinking preservation).
- Compatibilidad con Developer Role para su integración en entornos como Codex y OpenCode.
- Capacidades multimodales: procesamiento de imágenes junto con texto (pipeline image-text-to-text).
- Contexto largo de 262 144 tokens nativo, extensible hasta aproximadamente 1 010 000 tokens, adecuado para documentos extensos.
- Soporte de cuantización GGUF para ejecución eficiente en hardware de consumo.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede integrarse en herramientas como Codex o OpenCode para razonar sobre repositorios completos, modificar múltiples archivos y ejecutar flujos de trabajo frontend con precisión.
- Asistente de programación en producción: gracias a su tool calling robusto, puede conectarse a APIs, bases de código y sistemas de CI/CD para automatizar tareas como revisión de código, generación de tests o corrección de bugs.
- Análisis de documentos extensos: con su contexto de hasta 1 millón de tokens, es adecuado para resumir, extraer información o responder preguntas sobre libros técnicos, informes legales o documentación de proyectos.
- Aplicaciones multimodales: al aceptar imágenes, puede describir capturas de pantalla, diagramas o fotografías en combinación con instrucciones textuales, útil para soporte técnico o documentación visual.
- Automatización de atención al cliente: puede gestionar conversaciones multiturno con contexto largo, manteniendo el hilo del razonamiento y usando herramientas externas para resolver incidencias.
- Despliegue local en estaciones de trabajo: gracias a la cuantización GGUF, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3090 con 24 GB) para prototipado, investigación o entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card del modelo base proporciona una tabla parcial de resultados, de la cual se extraen los siguientes datos (la tabla original está incompleta en la información disponible):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | No disponible | No disponible |

No se han publicado resultados completos de benchmarks como MMLU, HumanEval o GSM8K en la información proporcionada. Se recomienda consultar el blog oficial de Qwen para obtener la tabla completa.

## Requisitos de hardware

- Según pruebas independientes (insiderllm.com), la cuantización UD-Q4_K_M cabe en una GPU de 24 GB y alcanza 157.66 tok/s en una RTX 3090 sin offload de expertos.
- La cuantización UD-Q3_K_M ocupa 16.6 GB y cabe en una GPU de 16 GB con offload de KV.
- Para el contexto máximo de 1M tokens se requiere una cantidad significativa de VRAM adicional; se recomienda usar cuantizaciones más agresivas o reducir el contexto según la GPU disponible.
- El modelo puede desplegarse con llama.cpp, Ollama, vLLM, SGLang, KTransformers y otros motores compatibles con GGUF y Transformers.
- La latencia y el throughput dependen de la cuantización, la GPU y el contexto utilizado; los valores anteriores son orientativos para una RTX 3090.

## Comparativa con modelos similares

El modelo compite directamente con otras arquitecturas MoE de tamaño similar. La siguiente tabla compara las características principales según los datos disponibles:

| Modelo | Parámetros totales | Parámetros activos | Contexto nativo | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262 144 | No disponible | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | 3B | No disponible | 70.0 | Apache 2.0 |
| Qwen3.5-27B | 27B | 27B (dense) | No disponible | 75.0 | Apache 2.0 |
| Gemma4-31B | 31B | 31B (dense) | No disponible | 52.0 | Gemma license |
| Gemma4-26B-A4B | 26B | 4B | No disponible | No disponible | Gemma license |

La comparativa se basa en los datos parciales de la model card. No se dispone de información completa sobre contexto y otros benchmarks para todos los modelos.

## Limitaciones y advertencias

- No se dispone de información específica sobre sesgos o alucinaciones del modelo; como todo LLM, puede generar contenido inexacto o inventado, especialmente en tareas de razonamiento complejo.
- La cuantización GGUF puede degradar ligeramente la calidad de las respuestas en comparación con los pesos en precisión completa, aunque las cuantizaciones modernas como Q4_K_M suelen mantener un rendimiento cercano.
- El contexto de 1M tokens requiere una gestión cuidadosa de la VRAM; en GPUs de consumo puede ser necesario reducir la ventana de contexto o usar cuantizaciones más agresivas.
- No se han publicado resultados completos de benchmarks para esta versión cuantizada; el rendimiento real puede variar.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de los pesos originales para asegurar el cumplimiento.
- El repositorio de Fastiraz no especifica qué cuantizaciones concretas incluye; el tamaño total de 792.9 GB sugiere que contiene múltiples archivos, pero no hay un listado explícito.

## Enlaces

- Repositorio GGUF de Fastiraz: https://huggingface.co/Fastiraz/Qwen3.6-35B-A3B-GGUF
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de Unsloth para Qwen3.6: https://docs.unsloth.ai/models/qwen3.6
- Blog oficial de Qwen (anuncio del modelo): https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de insiderllm sobre Qwen 3.6: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de insiderllm para ejecutar Qwen3.6-35B MoE localmente: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Medición de VRAM para Qwen3.6 local (knightli.com): https://knightli.com/en/2026/05/01/qwen3-6-local-vram-quantization-table/
