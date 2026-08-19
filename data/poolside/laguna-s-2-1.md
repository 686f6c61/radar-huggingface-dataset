# poolside/Laguna-S-2.1

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, diseñado específicamente para tareas de codificación agéntica y trabajo de largo horizonte. Con 118 mil millones de parámetros totales y solo 8 mil millones activos por token, se sitúa en la gama media-alta de la familia Laguna, entre el Laguna XS 2.1 (33B-A3B) y el Laguna M.1 (225B-A23B). Su arquitectura combina un router token-choice con gating softplus sobre 256 expertos enrutados más un experto compartido, atención de consultas agrupadas (GQA) y una disposición intercalada de atención global y de ventana deslizante.

El modelo destaca por su ventana de contexto de 1.048.576 tokens (1M), soporte nativo de razonamiento intercalado entre llamadas a herramientas, y la disponibilidad de un modelo borrador DFlash para decodificación especulativa. Se distribuye bajo la licencia OpenMDW-1.1, que permite uso comercial y no comercial con modificación libre. Su relevancia actual radica en que aborda uno de los cuellos de botella más críticos en agentes de código: mantener coherencia y razonamiento a lo largo de tareas extensas con contextos muy largos, algo que los benchmarks de la propia poolside (Terminal-Bench 2.1, SWE-bench Multilingual, SWE-Bench Pro) sitúan en niveles competitivos frente a modelos mucho más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con router token-choice, 256 expertos enrutados (top-10) + 1 experto compartido, atención GQA con 8 cabezas KV y head dim 128, atención intercalada global/ventana deslizante (1:3) |
| Parametros totales | 118B |
| Parametros activos | 8B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8, NVFP4, INT4, GGUF (variantes oficiales disponibles) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (checkpoint BF16), GGUF para llama.cpp |

## Arquitectura y entrenamiento

La arquitectura de Laguna S 2.1 sigue la receta de la familia Laguna: un transformer MoE con 48 capas, de las cuales 12 son de atención global y 36 de atención con ventana deslizante de 512 tokens. El router utiliza softplus gating sobre 256 expertos enrutados, seleccionando los 10 mejores por token, más un experto compartido que siempre se activa. La atención emplea GQA con 8 cabezas KV y head dim 128, con gating de salida softplus por cabeza y escalas rotatorias (rotary) diferenciadas por tipo de capa. El vocabulario es de 100.352 tokens, propio de la familia Laguna.

No se han publicado en la información disponible los detalles del entrenamiento: número de tokens, composición del dataset, o si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica el proceso de alineación. Lo que sí se documenta es el soporte nativo de razonamiento intercalado (thinking) entre llamadas a herramientas, controlable por petición mediante el parámetro `enable_thinking`, y la existencia de un modelo borrador DFlash entrenado específicamente para decodificación especulativa, lo que sugiere un énfasis en la eficiencia de inferencia para cargas de trabajo agénticas.

## Capacidades

- Generación de texto y razonamiento de propósito general, con énfasis en tareas de codificación y resolución de problemas complejos.
- Razonamiento intercalado (thinking mode) entre llamadas a herramientas, con control por petición (`enable_thinking`). El razonamiento se preserva en la salida.
- Soporte de tool calling / function calling mediante el parser `poolside_v1` en vLLM, SGLang y TRT-LLM.
- Capacidades agénticas multi-step: el modelo puede encadenar llamadas a herramientas y razonar sobre los resultados, adecuado para agentes autónomos.
- Ventana de contexto de 1M tokens, lo que permite procesar repositorios completos, documentación extensa o historiales de conversación muy largos.
- Decodificación especulativa con el modelo borrador DFlash, que reduce la latencia en servidores compatibles.
- Capacidades multilingües: no confirmadas oficialmente; la ficha no especifica idiomas soportados.
- Modalidad: texto a texto (text-to-text), sin soporte de visión ni audio.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede actuar como agente autónomo que navega por un repositorio, identifica bugs, propone parches y ejecuta pruebas, gracias a su contexto de 1M tokens que permite cargar el código completo de proyectos medianos y a su soporte de tool calling para interactuar con el sistema de archivos y el intérprete de comandos.
- Resolución de issues en repositorios grandes: con SWE-bench Multilingual al 78,5%, es adecuado para tareas de resolución de incidencias reales en bases de código extensas, donde la ventana de 1M tokens permite incluir el historial de la issue, el código relevante y los resultados de pruebas.
- Asistente de programación con contexto largo: integrado en un IDE o CLI, puede mantener el contexto de una sesión de trabajo de horas, recordando decisiones previas, archivos modificados y razonamientos intermedios, sin perder coherencia.
- Automatización de pipelines de CI/CD: el modelo puede analizar logs de compilación, identificar errores, generar fixes y validar cambios, todo ello mediante llamadas a herramientas y razonamiento intercalado, reduciendo la intervención humana en tareas repetitivas.
- Análisis y consulta de codebases (Codebase QnA): con un 46,2% en SWE Atlas, puede responder preguntas sobre la estructura, dependencias y lógica de un proyecto, actuando como un "copiloto" para onboarding de nuevos desarrolladores o auditorías de código.
- Investigación y razonamiento matemático: aunque no se reportan benchmarks específicos de matemáticas, su capacidad de razonamiento intercalado y su tamaño lo hacen apto para tareas de demostración formal, verificación de algoritmos y resolución de problemas que requieren pasos intermedios explícitos.

## Benchmarks y rendimiento

Los resultados publicados por poolside (a 21 de julio de 2026) comparan Laguna S 2.1 con varios modelos de gran tamaño. Las puntuaciones marcadas con * son reportadas por terceros (Artificial Analysis, Scale AI, leaderboards oficiales).

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70,2%** | **78,5%** | **59,4%** | **40,4%** | **46,2%** | **49,7%** |
| Tencent Hy3 | 295B-A21B | 71,7% | 75,8% | 57,9% | - | - | - |
| Inkling | 975B-A41B | 63,8% | - | 54,3% | - | - | 45,5%* |
| Nemotron 3 Ultra | 550B-A55B | 56,4% | 67,7% | - | - | - | 34,3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64,0%* | 76,2% | 55,4% | 9,0%* | 27,2%* | 55,9%* |
| Kimi K3 | 2800B-A50B | 88,3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74,5%* | 78,3% | 60,6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61,5% | 53,3% | 42,2%* | 75,6% |
| Claude Fable 5 | - | 88% | - | 80,3% | 70% | - | - |

Nota: un guion (-) indica que el modelo no fue evaluado en ese benchmark. Laguna S 2.1 supera a modelos significativamente más grandes (DeepSeek-V4-Pro Max, Nemotron 3 Ultra) en varios benchmarks de codificación, aunque queda por detrás de Kimi K3 y Claude Fable 5 en Terminal-Bench y DeepSWE. No se han publicado resultados en benchmarks clásicos como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa aproximadamente 236 GB de pesos, por lo que requiere múltiples GPUs. Con cuantización FP8 (~118 GB) cabría en 2 GPUs de 80 GB; con INT4 (~59 GB) en una sola GPU de 80 GB o dos de 48 GB.
- GPUs recomendadas: para BF16, al menos 4x A100/H100 de 80 GB (vLLM con `--tensor-parallel-size 4`). Para FP8, 2x A100/H100 de 80 GB. Para INT4, 1x A100/H100 de 80 GB o 2x RTX 4090/48 GB.
- En consumer GPU: el modelo completo no cabe en una sola GPU de consumo (máximo 24 GB en RTX 4090). Con cuantización INT4 (~59 GB) se necesitarían al menos 3 GPUs de 24 GB, lo que no es práctico. La variante GGUF permite ejecución en CPU con memoria RAM abundante, pero con latencia alta.
- Opciones de despliegue: vLLM (con soporte de tool calling y reasoning parser), SGLang, TRT-LLM, y llama.cpp (fork de poolside con soporte completo de Laguna y DFlash). También está disponible en OpenRouter y Vercel AI Gateway como servicio gestionado.
- Latencia y throughput: no se han publicado cifras oficiales. La decodificación especulativa con DFlash (7 tokens especulativos) está diseñada para reducir la latencia, pero no se documentan valores concretos.

## Comparativa con modelos similares

La comparativa se basa únicamente en los benchmarks publicados, ya que no se dispone de especificaciones completas (parámetros, contexto, licencia) de los modelos comparados más allá de su tamaño.

| Modelo | Tamano | Contexto (estimado) | Terminal-Bench 2.1 | SWE-bench Multilingual | Licencia |
|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | 1M | 70,2% | 78,5% | OpenMDW-1.1 |
| Tencent Hy3 | 295B-A21B | no disponible | 71,7% | 75,8% | no disponible |
| DeepSeek-V4-Pro Max | 1.6T-A49B | no disponible | 64,0%* | 76,2% | no disponible |
| Qwen 3.7 Max | no disponible | no disponible | 74,5%* | 78,3% | no disponible |

Laguna S 2.1 ofrece un rendimiento comparable a modelos con muchos más parámetros activos (Tencent Hy3 con 21B activos, DeepSeek-V4-Pro Max con 49B activos) en SWE-bench Multilingual, con una fracción de los recursos de inferencia. Su ventaja principal es el contexto de 1M tokens, que no está confirmado en los competidores. La licencia OpenMDW-1.1 es más permisiva que las licencias propietarias típicas de estos modelos.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, toxicidad o riesgos de alucinación específicos para Laguna S 2.1. Como modelo de gran tamaño, es susceptible a alucinaciones en tareas de razonamiento complejo, especialmente cuando el contexto es ambiguo o incompleto.
- El modelo es texto a texto; no soporta entrada multimodal (imagen, audio, vídeo).
- Los idiomas soportados no están documentados. Aunque el tokenizer de la familia Laguna probablemente cubre múltiples idiomas, no hay confirmación oficial, por lo que su uso en producción para idiomas distintos del inglés debe validarse previamente.
- La licencia OpenMDW-1.1 permite uso comercial y modificación, pero es recomendable revisar los términos exactos en openmdw.ai, especialmente en lo relativo a responsabilidad y atribución.
- El checkpoint BF16 requiere infraestructura de múltiples GPUs (mínimo 4x80 GB), lo que limita su despliegue en entornos con recursos modestos. Las cuantizaciones reducen el requisito pero pueden afectar a la calidad de salida.
- El soporte de razonamiento intercalado y tool calling depende de integraciones específicas (vLLM, SGLang, TRT-LLM, llama.cpp fork). No se garantiza compatibilidad con todos los frameworks de inferencia.
- Los benchmarks publicados son de la propia poolside o de terceros no verificados de forma independiente; algunos resultados (marcados con *) provienen de fuentes externas y pueden tener metodologías diferentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/poolside/Laguna-S-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Modelo borrador DFlash: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Variante FP8: https://huggingface.co/poolside/Laguna-S-2.1-FP8
- Variante NVFP4: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-S-2.1-INT4
- Variante GGUF: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Fork de llama.cpp con soporte Laguna: https://github.com/poolsideai/llama.cpp/tree/laguna
- PR de soporte base en llama.cpp upstream: https://github.com/ggml-org/llama.cpp/pull/25165
- Trayectorias de evaluación: https://trajectories.poolside.ai
- Información sobre OpenMDW: https://openmdw.ai/
