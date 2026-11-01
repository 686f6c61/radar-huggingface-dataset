# mlx-community/flint-oQ6e

## Resumen

flint-oQ6e es una cuantización a 6 bits, con precisión mixta basada en datos, del modelo Recursive Flint, desarrollado por Recursive y publicado en la comunidad MLX (mlx-community) para su ejecución nativa en Apple Silicon. Flint es un modelo de lenguaje de tipo MoE (mixture of experts) orientado a código, agentes y conversación, con 39,79 mil millones de parámetros totales de los cuales solo unos 2,5 mil millones se activan por token, lo que permite velocidades de generación altas pese a su tamaño total. Esta variante concreta reduce el tamaño en disco de 79,6 GB (bf16) a 32,8 GB, manteniendo una perplejidad prácticamente idéntica a la del original (14,34 frente a 14,30).

La relevancia de esta ficha está en el proceso de cuantización: utiliza oQ6e, un esquema de oMLX que asigna 8 bits a los tensores que se leen en cada token (atención, experto compartido, capas densas, embeddings y cabeza de salida) y 6 bits a los expertos enrutados, con un paso de imatrix que ajusta los rangos de clipping por grupo según la importancia de las activaciones. El resultado es la variante más fiel a bf16 después de la de 8 bits, con un KL medio de 0,051 y un acuerdo top-1 del 90,3 %.

Es un modelo interesante para quien trabaje con Macs de gama alta (48 GB de memoria unificada o más) y necesite un MoE grande con contexto de 262k tokens, capacidades de agente y razonamiento, sin recurrir a GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE; 35 capas sliding-window de 513 tokens + 14 de atención completa) |
| Parametros totales | 39.785.299.488 (~40B, 79,6 GB en bf16) |
| Parametros activos | ~2,5B por token (256 expertos enrutados con top-6 + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ6e (precisión mixta: 6 bits en expertos enrutados, 8 bits en atención, experto compartido, capas densas, embed_tokens y lm_head; grupo 64, afín, imatrix con 128 muestras) |
| Idiomas soportados | no disponible (el corpus de medición es prosa en inglés; consultar la model card original) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX, sin kernels personalizados) |

## Arquitectura y entrenamiento

Flint es un transformer disperso de tipo MoE con 49 capas: las dos primeras son densas y las 47 restantes contienen 256 expertos enrutados de los que se activan 6 por token, más un experto compartido que se evalúa siempre. La atención es híbrida: 35 capas usan una ventana deslizante de 513 tokens y 14 capas mantienen atención completa, lo que permite sostener un contexto de 262k tokens con un coste razonable. Solo ~2,5B de los ~40B de parámetros se activan por token, de ahí que la decodificación sea rápida y esté parcialmente limitada por la sobrecarga de lanzamiento de kernels en hardware de consumo.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se han publicado datos en la información disponible; la model card de esta cuantización remite al repositorio original de RecursiveSI/flint. Lo que sí documenta esta ficha es el proceso de cuantización: oQ6e mide la sensibilidad de cada capa sobre los pesos bf16, mantiene a 8 bits todo lo que se lee en cada token y a 6 bits los expertos enrutados, y añade un paso de imatrix (128 muestras de calibración) que elige el rango de clipping de cada grupo de 64 valores según la importancia de las activaciones. Se probó también grupo 128, que ahorraba 1,2 GB pero degradaba la fidelidad (KL medio 0,263 frente a 0,222 en oQ4e), por lo que todas las variantes usan grupo 64.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, chat template original del modelo base sin modificaciones).
- Generación y comprensión de código (etiqueta `code` en la model card).
- Comportamiento agéntico y uso de herramientas: el servidor oMLX expone una API compatible con OpenAI que soporta tool calls.
- Razonamiento multi-paso: el modelo devuelve razonamiento en el campo `reasoning_content`, que conviene mantener en el historial de la conversación entre turnos.
- Contexto muy largo: 262k tokens, con velocidad de generación sostenida de 87 tok/s a 16k de contexto en un M5 Max.
- Etiqueta `mlx-vlm` en la model card sugiere compatibilidad con el ecosistema de visión de mlx-vlm, aunque la model card no documenta capacidades visuales concretas: no disponible.

## Casos de uso

- Asistentes de código locales en Mac: con ~2,5B de parámetros activos genera a 108 tok/s a contexto corto en un M5 Max, suficiente para autocompletado y refactorización interactiva sin depender de la nube.
- Agentes con tool calling en local: el servidor oMLX ofrece API compatible con OpenAI con soporte de herramientas, ideal para pipelines de automatización que ejecutan funciones y procesan resultados en varios pasos.
- Análisis de repositorios o documentos extensos: la ventana de 262k tokens permite cargar bases de código grandes o colecciones de documentos completas y razonar sobre ellas; a 16k de contexto mantiene 87 tok/s.
- Razonamiento profundo offline: Recursive recomienda un presupuesto de salida de al menos 32k tokens para problemas difíciles, ya que razonamiento y respuesta comparten presupuesto; útil para resolver problemas de matemáticas o diseño con trazas de razonamiento extensas.
- Chatbots multi-turno autoalojados: el modelo mantiene el razonamiento en el historial entre turnos y funciona con plantilla de chat estándar, lo que facilita su integración en interfaces de conversación.
- Evaluación y comparación de cuantizaciones: al ser la variante más fiel a bf16 tras la de 8 bits, sirve como referencia de calidad en estudios de cuantización con oMLX.
- Inferencia en portátiles con 48 GB o más de memoria unificada: el pico de memoria es de ~32,9 GB a contexto corto y ~34,4 GB a 16k, por lo que cabe con holgura en Macs de 48 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible; el propio autor indica no haber ejecutado aún benchmarks de tareas. Sí se han publicado mediciones de fidelidad frente a bf16 y de velocidad de generación.

Fidelidad frente a bf16 (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16):

| Modelo | Tamaño | bpw | KL medio ↓ | KL mediano ↓ | Perplejidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|---|
| bf16 (original) | 79,6 GB | 16 | 0 (ref.) | — | 14,30 | 100 % |
| flint-oQ8e | 42,3 GB | 8,50 | 0,038 | 0,010 | 14,33 | 92,3 % |
| **flint-oQ6e (este repo)** | **32,8 GB** | **6,60** | **0,051** | **0,019** | **14,34** | **90,3 %** |
| flint-oQ5e | 28,1 GB | 5,65 | 0,089 | 0,042 | 14,38 | 86,2 % |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 0,122 | 14,86 | 78,3 % |
| flint-oQ3e | 18,5 GB | 3,71 | 0,650 | 0,411 | 16,92 | 64,6 % |
| flint-oQ2e | 13,9 GB | 2,80 | 1,519 | 1,081 | 28,99 | 50,2 % |

Velocidad de generación (tok/s, decodificación greedy, 256 tokens, mediana de 3 ejecuciones, MacBook Pro M5 Max 128 GB, kernel fusionado de MoE activo):

| Contexto | oQ6e (este repo) | oQ8e | oQ4e |
|---|---|---|---|
| ~30 tokens | 108 | 110 | 120 |
| 4k | 96 | 103 | 110 |
| 16k | 87 | 95 | 105 |

Nota del autor: la deriva entre sesiones puede llegar al ~10 %, así que diferencias menores deben leerse como ruido. El corpus de medición es prosa en inglés que podría solaparse con los datos de calibración, por lo que las cifras sirven para ordenar las variantes entre sí, no como puntuación absoluta de calidad.

## Requisitos de hardware

- Memoria necesaria: 32,8 GB en disco; pico de memoria durante la generación de ~32,9 GB a contexto corto y ~34,4 GB a 16k de contexto.
- Hardware de referencia: MacBook Pro M5 Max con 128 GB de memoria unificada (40 núcleos GPU). El autor considera que merece la pena esta variante en Macs de 48 GB o más; con menos memoria, las variantes oQ4e (23,4 GB) u oQ3e (18,5 GB) son alternativas del mismo modelo.
- No aplica a GPUs NVIDIA de consumo típicas: 32,8 GB exceden la VRAM de una RTX 4090 (24 GB); necesitaría una A100 40 GB, H100 o una Mac con suficiente memoria unificada.
- Runtimes soportados: oMLX (recomendado, con kernel fusionado de enrutado/combine MoE para decodificación de un token, ~16 % más rápido) y mlx-vlm ≥ 0.7.10. No funciona directamente con mlx-lm, porque espera nombres de tensor sin el prefijo `language_model.`.
- Despliegue: `omlx serve` expone una API compatible con OpenAI con tool calls; también es posible usar la CLI de mlx-vlm. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Rendimiento medido: 108 tok/s a contexto corto, 96 tok/s a 4k y 87 tok/s a 16k (greedy, M5 Max). A partir de oQ5e hacia arriba, la velocidad cae un 5–15 % respecto a oQ4e; por debajo de oQ4e, la decodificación está limitada por la sobrecarga de kernels, no por el ancho de banda.

## Comparativa con modelos similares

Comparativa entre las variantes de cuantización del propio Flint para Apple Silicon (misma arquitectura, mismo modelo base):

| Variante | Tamaño | bpw | KL medio vs bf16 | Perplejidad | Tok/s (ctx. corto) | Pico de memoria |
|---|---|---|---|---|---|---|
| flint-oQ8e | 42,3 GB | 8,50 | 0,038 | 14,33 | 110 | 42,4–43,9 GB |
| **flint-oQ6e** | **32,8 GB** | **6,60** | **0,051** | **14,34** | **108** | **32,9–34,4 GB** |
| flint-oQ5e | 28,1 GB | 5,65 | 0,089 | 14,38 | 103 | 28,2–29,7 GB |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 120 | 23,5–25,0 GB |

Frente a modelos MoE de otros fabricantes de tamaño similar (~40B totales, pocos B activos, contexto largo), no hay datos comparativos publicados en la información disponible: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; remitirse a la model card del modelo base (RecursiveSI/flint).
- Riesgo de alucinación: no cuantificado en esta ficha; al tratarse de un modelo de razonamiento con presupuesto compartido entre razonamiento y respuesta, conviene asignar al menos 32k tokens de salida en problemas difíciles para evitar respuestas truncadas.
- Idiomas: la model card de esta cuantización no especifica idiomas soportados; las mediciones de fidelidad se hicieron sobre prosa en inglés.
- Compatibilidad de runtime: los pesos usan el prefijo `language_model.` de mlx-vlm, por lo que no cargan en mlx-lm sin adaptación; solo oMLX y mlx-vlm ≥ 0.7.10 los leen tal cual.
- Calidad de la cuantización: las métricas de fidelidad provienen de un corpus que podría solaparse con los datos de calibración de oQ, así que son válidas para comparar variantes, no como garantía absoluta de calidad; no se han ejecutado benchmarks de tareas.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Hardware: no cabe en GPUs de consumo de 24 GB; requiere Macs de 48 GB+ o GPUs de datacenter con 40 GB+.
- Velocidad: esta variante es un 5–15 % más lenta que oQ4e; si la memoria es escasa, conviene valorar variantes inferiores.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mlx-community/flint-oQ6e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Variantes hermanas: https://huggingface.co/mlx-community/flint-oQ8e, https://huggingface.co/mlx-community/flint-oQ5e, https://huggingface.co/mlx-community/flint-oQ4e
- Organización mlx-community: https://huggingface.co/mlx-community
- Paper, demo y repositorio del modelo base: no disponibles en la información proporcionada
