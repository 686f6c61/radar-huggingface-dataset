# Nanbeige/Nanbeige4.2-3B

## Resumen

Nanbeige4.2-3B es un modelo de lenguaje compacto de tipo agéntico desarrollado por Nanbeige, construido sobre la base Nanbeige4.2-3B-Base. Con solo 3B parámetros no-embedding (4.17B en total), emplea una arquitectura Looped Transformer que reutiliza las capas del transformer para aumentar la capacidad efectiva sin añadir parámetros. El modelo se ha preentrenado desde cero con 28T tokens y se ha ajustado mediante SFT y RL con recompensas de proceso y resultado, lo que le permite destacar en tareas de agente general, agente de código y razonamiento matemático y científico, superando en varios benchmarks a modelos más grandes como Qwen3.5-9B o Gemma4-12B.

La relevancia actual de este modelo radica en su capacidad de ofrecer un comportamiento agéntico sólido en un tamaño reducido, lo que lo hace adecuado para despliegues locales con recursos limitados. Además, incluye mejoras arquitectónicas como LoopSplit, mHC con atención por profundidad y embeddings de n-gramas concatenados, que se incorporarán en futuras versiones de la familia Nanbeige. El modelo está disponible bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutilización de capas) |
| Parametros totales | 4.169.800.704 (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nanbeige4.2-3B utiliza una arquitectura Looped Transformer, que reutiliza el mismo conjunto de capas varias veces a lo largo del proceso de generación, aumentando así la profundidad efectiva sin incrementar el número de parámetros. Esta técnica permite que un modelo de solo 3B parámetros no-embedding alcance capacidades comparables a modelos de 9B o 12B en tareas de agente y razonamiento. El modelo se preentrenó desde cero sobre 28T tokens, aunque no se especifican detalles sobre la composición del dataset.

El ajuste fino supervisado (SFT) se realizó expandiendo la diversidad de entornos de entrenamiento mediante integraciones con entornos reales y síntesis de entornos a gran escala. Se diversificaron los tipos de tarea, los activos de tarea y los andamiajes agénticos (scaffolds) utilizados. La calidad de los datos se garantizó mediante filtrado a nivel de trayectoria y de turno, combinando validación basada en casos de prueba con evaluación basada en rúbricas. Posteriormente, se aplicó aprendizaje por refuerzo (RL) combinando recompensas de resultado y de proceso para mejorar la estabilidad del entrenamiento en un modelo compacto. Además, el código de modelado incluye innovaciones como LoopSplit, mHC con atención por profundidad y embeddings de n-gramas concatenados, que se integrarán en Nanbeige4.5.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento matemático, científico y de código, con resultados destacados en benchmarks como GPQA-Diamond, HMMT-Feb-2026, IMO-Answer-Bench y LiveCodeBench-V6.
- Comportamiento agéntico general: uso de herramientas, tareas de oficina y agentes de código.
- Soporte de tool calling y function calling para integración en flujos de trabajo agénticos.
- Capacidad de razonamiento multi-step y ejecución de tareas complejas con andamiajes como OpenClaw.
- Modos de pensamiento configurable y llamada a herramientas para flujos agénticos multi-turno.

## Casos de uso

- Asistente personal local: integrado con andamiajes agénticos como OpenClaw, puede gestionar tareas diarias, trabajo de oficina y búsqueda profunda (deep research) en un entorno local con recursos limitados.
- Automatización de tareas de oficina: el modelo puede procesar documentos, responder consultas y generar informes, como demuestra su rendimiento en Office-QA-Pro.
- Agente de código en producción: con soporte para tool calling, puede integrarse en pipelines de CI/CD para resolver issues de repositorios, como indica su puntuación en SWE-Bench Verified (63.6).
- Asistencia en terminal y operaciones de sistema: gracias a su capacidad en Terminal-Bench 2.0, puede ejecutar comandos y gestionar tareas de administración de sistemas.
- Razonamiento científico y matemático: útil para resolver problemas de nivel avanzado (GPQA-Diamond, HMMT), como apoyo a investigadores y estudiantes.
- Desarrollo de agentes MCP (Model Context Protocol): su rendimiento en MCP-Atlas sugiere que puede servir como motor de agentes que interactúan con múltiples APIs y servicios externos.
- Chatbots de atención al cliente multilingüe: al soportar inglés y chino, puede desplegarse en entornos empresariales bilingües con requisitos de baja latencia.

## Benchmarks y rendimiento

La model card del autor proporciona resultados comparativos frente a Qwen3.5-9B, Qwen3.5-4B, Gemma4-12B y Gemma4-E4B. Se muestran los valores publicados (no se han verificado de forma independiente).

| Benchmark | Nanbeige4.2-3B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-E4B |
|---|---|---|---|---|---|
| GDPval rubrics | **74.3** | 61.9 | 46.7 | 68.5 | 31.5 |
| Agent-IF-Oneday | **67.5** | 60.4 | 56.9 | — | — |
| Office-QA-Pro | **21.1** | 15.8 | 8.3 | 15.3 | 3.1 |
| Pinch-Bench-V2 | **74.7** | 68.2 | 63.9 | 53.8 | 33.3 |
| Claw-Gym | **65.0** | 56.1 | 53.0 | 40.8 | 16.4 |
| Claw-Eval_pass^3 | **52.2** | 47.1 | 36.9 | 25.5 | 15.9 |
| MCP-Atlas | **57.8** | 47.4 | 40.8 | 30.5 | 15.0 |
| SWE-Bench Verified | **63.6** | 53.1 | 38.8 | 44.2 | 14.0 |
| SWE-Bench Pro | **46.9** | 33.8 | 29.4 | 21.9 | 4.0 |
| Terminal-Bench 2.0 | **44.1** | 29.2 | 25.8 | 21.1 | 12.4 |
| HLE w/o Search | **17.8** | 12.5 | 6.8 | 14.8 | 4.0 |
| SciCode | 35.6 | 32.7 | 22.7 | **38.2** | 24.9 |
| GPQA-Diamond | **87.4** | 81.7 | 78.2 | 78.8 | 60.6 |
| HMMT-Feb-2026 | **82.8** | 69.6 | 60.6 | 51.5 | 24.2 |
| IMO-Answer-Bench | **67.3** | 56.3 | 46.8 | 54.5 | 24.0 |
| LiveCodeBench-V6 | **72.5** | 65.6 | 55.8 | 72.0 | 55.3 |
| AA-LCR | **58.7** | 58.0 | 52.0 | 55.3 | 30.7 |
| IF-Bench | 54.6 | 54.1 | 41.4 | **73.5** | 44.0 |
| Recruit-Bench | 63.3 | 59.0 | 40.7 | **6** (incompleto) | — |

Nota: los valores en negrita indican el mejor resultado entre los modelos comparados. El dato de Recruit-Bench para Gemma4-12B aparece truncado en la model card original.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware en la documentación proporcionada. Dado que el modelo tiene 4.169.800.704 parámetros totales (aproximadamente 4B), una estimación razonable para inferencia en FP16 sería de unos 8 GB de VRAM, lo que permitiría su ejecución en GPUs de consumo como la RTX 3090, RTX 4090 o equivalentes. Sin embargo, esta estimación no está confirmada por el autor. Para despliegue en producción, se recomienda usar frameworks como vLLM, llama.cpp o TGI, aunque no se han publicado datos específicos de latencia o throughput.

## Comparativa con modelos similares

La siguiente tabla compara Nanbeige4.2-3B con alternativas de tamaño similar o superior en la misma categoría de modelos agénticos compactos.

| Modelo | Params totales | Params no-embedding | Contexto | Licencia | Idiomas | Rendimiento destacado |
|---|---|---|---|---|---|---|
| Nanbeige4.2-3B | 4B | 3B | No disponible | Apache 2.0 | en, zh | Supera a Qwen3.5-9B y Gemma4-12B en la mayoría de benchmarks agénticos |
| Qwen3.5-4B | 5B | 4B | No disponible | Apache 2.0 (presumible) | Multilingüe | Inferior en benchmarks agénticos y de razonamiento |
| Gemma4-E4B | 8B | 4B | No disponible | Gemma license | Multilingüe | Rendimiento significativamente inferior en tareas de agente |
| Qwen3.5-9B | 10B | 8B | No disponible | Apache 2.0 (presumible) | Multilingüe | Competitivo pero por debajo en la mayoría de métricas |

No se dispone de información sobre la longitud de contexto de los modelos comparados, por lo que no se puede evaluar ese aspecto.

## Limitaciones y advertencias

- No se han publicado limitaciones específicas en la documentación proporcionada, pero como modelo compacto (3B no-embedding) puede presentar dificultades en tareas que requieran una capacidad de razonamiento muy profunda o conocimientos muy extensos.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- Soporte de idiomas limitado a inglés y chino; no cubre otros idiomas de forma nativa.
- La longitud de contexto no se ha especificado, lo que puede limitar su uso en tareas que requieran ventanas de contexto muy largas.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar los términos exactos de la licencia para los pesos y el código.
- No se han publicado resultados de evaluación de sesgos o seguridad; se recomienda realizar pruebas adicionales antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper técnico (arXiv): https://arxiv.org/abs/2607.22083
- Versión HTML del paper: https://arxiv.org/html/2607.22083v1
- Repositorio de ejemplo de integración (RayCodes): https://github.com/47thtechcorner/RayCodes_Nanbeige_4.2
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-Base
- Modelo anterior de la familia: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
