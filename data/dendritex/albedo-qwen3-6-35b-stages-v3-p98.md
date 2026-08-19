# Dendritex/albedo-qwen3.6-35b-stages-v3-p98

## Resumen

Dendritex/albedo-qwen3.6-35b-stages-v3-p98 es un modelo de lenguaje causal con encoder de visión, basado en la arquitectura Qwen3.6-35B-A3B desarrollada por Alibaba Cloud. Se trata de una variante post-entrenada por el usuario Dendritex que conserva las características fundamentales del modelo original: un total de 35.951 millones de parámetros con solo 3.000 millones activos por token gracias a su arquitectura de mezcla de expertos (MoE) dispersa.

El modelo combina un stack híbrido de bloques Gated DeltaNet y Gated Attention con enrutamiento MoE, lo que le permite manejar contextos de 262.144 tokens de forma nativa, extensibles hasta aproximadamente 1.010.000 tokens. Está diseñado para tareas de razonamiento agéntico, generación de código y comprensión de imágenes, posicionándose como una alternativa eficiente en términos de cómputo para despliegues que requieren baja latencia con alta capacidad de razonamiento.

La relevancia de este lanzamiento radica en que representa una iteración post-entrenada de la serie Qwen3.6, que prioriza la estabilidad y utilidad práctica para desarrolladores, incorporando mejoras específicas en flujos de trabajo de codificación agéntica y preservación de contexto de razonamiento. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con encoder de vision, híbrido Gated DeltaNet + Gated Attention con MoE disperso |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3.000 millones (aprox.) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se asume multilingue por la familia Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina bloques de atención lineal (Gated DeltaNet) con bloques de atención completa (Gated Attention), distribuidos en 40 capas con un layout de 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). La componente MoE cuenta con 256 expertos en total, de los cuales se activan 8 enrutados más 1 compartido por token, con una dimensión intermedia de 512 por experto.

La dimensión oculta del modelo es de 2048, con un embedding de tokens de 248.320 (padded). El Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza de 128. El Gated Attention emplea 16 cabezas para Q y 2 para KV, con dimensión de cabeza de 256 y una dimensión de RoPE de 64. El modelo incluye entrenamiento con MTP (multi-token prediction) en múltiples pasos.

El proceso de entrenamiento comprende una fase de pre-entrenamiento seguida de post-entrenamiento, aunque los detalles específicos sobre el número de tokens, composición del dataset y técnicas de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento de propósito general con soporte para tareas complejas de múltiples pasos.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio con alta fluidez y precisión.
- Preservación de contexto de razonamiento: opción de retener el contexto de razonamiento de mensajes históricos para desarrollo iterativo.
- Comprensión de imágenes: el modelo incluye un encoder de visión, lo que le permite procesar entradas de imagen junto con texto.
- Razonamiento multilingüe: aunque los idiomas específicos no están documentados, la familia Qwen tradicionalmente soporta múltiples idiomas.
- Soporte de agentes y multi-step reasoning: el modelo está optimizado para tareas de razonamiento agéntico, como se evidencia en los benchmarks SWE-bench.
- Capacidad de tool calling: no se menciona explícitamente, pero es una característica común en la serie Qwen y compatible con la arquitectura.

## Casos de uso

- Desarrollo de asistentes de codificación: el modelo puede integrarse en IDEs para sugerencias de código, refactorización y generación de funciones completas, gracias a su capacidad de razonamiento a nivel de repositorio y su ventana de contexto de 262.144 tokens que permite procesar proyectos enteros.
- Automatización de resolución de issues en repositorios: con un rendimiento de 73.4 en SWE-bench Verified, el modelo puede analizar issues de GitHub, proponer parches y generar pull requests de forma autónoma en pipelines de CI/CD.
- Agentes de terminal y operaciones: su rendimiento en Terminal-Bench 2.0 lo hace adecuado para agentes que ejecutan comandos, gestionan archivos y realizan tareas de administración de sistemas.
- Análisis de documentación técnica y repositorios grandes: la ventana de contexto extensible hasta 1M tokens permite procesar documentación extensa, codebases completos o libros técnicos para generar resúmenes o responder preguntas específicas.
- Asistentes multimodales para soporte técnico: gracias al encoder de visión, puede analizar capturas de pantalla de errores, diagramas de arquitectura o documentación visual para proporcionar asistencia técnica contextualizada.
- Desarrollo de aplicaciones de razonamiento agéntico: el modelo puede actuar como motor de razonamiento en frameworks de agentes, manteniendo el contexto de razonamiento a través de conversaciones iterativas para tareas de planificación y ejecución.

## Benchmarks y rendimiento

Los datos de benchmarks corresponden al modelo base Qwen3.6-35B-A3B, no específicamente a esta variante post-entrenada:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks específicos para la variante Dendritex/albedo-qwen3.6-35b-stages-v3-p98 en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 35.951 millones de parámetros totales, aunque solo 3.000 millones se activan por token. En FP16, los pesos completos ocuparían aproximadamente 72 GB. Con cuantización a 8 bits se reduciría a unos 36 GB, y a 4 bits a unos 18 GB.
- GPU recomendadas: para inferencia en FP16 se necesitarían GPUs de clase A100 (80 GB) o H100 (80 GB). Con cuantización INT8, una RTX 4090 (24 GB) o A6000 (48 GB) podría ser suficiente. Para cuantización INT4, sería viable en GPUs de consumo como RTX 3090/4090.
- El modelo puede ejecutarse en GPUs de consumo si se utiliza cuantización adecuada, aunque la latencia dependerá de la memoria disponible.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y vLLM Ascend según la documentación.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo MoE con solo 3B parámetros activos, se espera una latencia significativamente menor que un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | SWE-bench Verified |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache 2.0 | 73.4 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | Apache 2.0 | 70.0 |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | Apache 2.0 | 75.0 |
| Gemma4-31B | 31B | 31B (denso) | no disponible | no disponible | 52.0 |

El modelo se posiciona como una alternativa eficiente frente a modelos densos de tamaño similar, ofreciendo un rendimiento competitivo en tareas de codificación agéntica con un coste computacional mucho menor gracias a su arquitectura MoE.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información específica sobre sesgos para esta variante, pero como modelo derivado de Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de contexto: aunque el contexto nativo es de 262.144 tokens, el rendimiento puede degradarse en contextos extremadamente largos cercanos al límite.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque se recomienda revisar los términos específicos de la licencia del modelo base.
- Información incompleta: no se dispone de datos sobre idiomas soportados, cuantizaciones disponibles ni resultados de benchmarks específicos para esta variante post-entrenada.
- Cautelas para producción: al ser una variante post-entrenada por un tercero, se recomienda validar el rendimiento en casos de uso específicos antes de desplegarla en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dendritex/albedo-qwen3.6-35b-stages-v3-p98
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Documentación de despliegue en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
- Variante anterior del mismo autor: https://huggingface.co/Dendritex/albedo-qwen3.6-35b-ckpt100
- Checkpoint intermedio de otro usuario: https://huggingface.co/richard-king/Dendritex-albedo-qwen3.6-35b-stages-v1-46ef8a1f
- Despliegue en FriendliAI: https://friendli.ai/models/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-0814-0100
