# RootML/Nanbeige4.1-3B

## Resumen

Nanbeige4.1-3B es un modelo de lenguaje de 3.933.637.120 parámetros (aproximadamente 3,9 mil millones) desarrollado por RootML, construido sobre Nanbeige4-3B-Base y presentado como una iteración mejorada del modelo de razonamiento Nanbeige4-3B-Thinking-2511. La mejora se ha obtenido mediante un post-entrenamiento adicional con supervisión fina (SFT) y aprendizaje por refuerzo (RL). El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors para la librería transformers, con soporte para inglés y chino.

La propuesta de valor del modelo es inusual para su escala: el autor afirma que compite y supera a modelos notablemente mayores como Qwen3-30B-A3B-2507 y Qwen3-32B en benchmarks de alineación (Arena-Hard-v2, Multi-Challenge), y que además es el primer modelo general pequeño en soportar de forma nativa tareas de deep-search, manteniendo más de 500 rondas de invocación de herramientas. Esto lo sitúa en un nicho poco cubierto: modelos compactos que combinan razonamiento general y comportamiento agéntico.

La relevancia actual del modelo radica en su tamaño reducido, que lo hace desplegable en hardware modesto, junto con un contexto y unas capacidades que tradicionalmente se asociaban a modelos de decenas de miles de millones de parámetros. El informe técnico está disponible en arXiv (2602.13367).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama, según tags de HuggingFace); detalles internos no disponibles |
| Parametros totales | 3.933.637.120 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Nanbeige4-3B-Base y se ha sometido a un post-entrenamiento en dos fases: supervisión fina (SFT) y aprendizaje por refuerzo (RL). Según la model card, este proceso busca simultáneamente un razonamiento sólido, una alineación de preferencias robusta y comportamientos agénticos efectivos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni los detalles del algoritmo de RL empleado.

La innovación técnica más destacable, según el autor, es la capacidad de sostener razonamiento multi-paso coherente en un único forward pass y de mantener más de 500 rondas de invocación de herramientas en tareas de deep-search. No se detallan en la información proporcionada mecanismos como decodificación especulativa, atención lineal ni arquitecturas híbridas; los tags de HuggingFace apuntan a la familia llama, pero no se confirman detalles internos de la arquitectura.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento complejo multi-paso, con resultados destacados en matemáticas (AIME 2026 I, HMMT Nov, IMO-Answer-Bench) y ciencia (GPQA, HLE).
- Generación de código, con resultados muy altos en Live-Code-Bench-V6 y Live-Code-Bench-Pro (fácil y medio).
- Tool calling / function calling, evaluado en BFCL-V4 y Tau2-Bench.
- Comportamiento agéntico y deep-search nativo, con soporte para más de 500 rondas de invocación de herramientas.
- Alineación de preferencias, evaluada en Arena-Hard-v2 y Multi-Challenge.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se mencionan capacidades de visión, audio ni modos de pensamiento explícitos en la información disponible.

## Casos de uso

- Agentes de búsqueda profunda (deep-search): el modelo puede encadenar más de 500 invocaciones de herramientas para resolver consultas complejas que requieren múltiples búsquedas y síntesis, algo poco habitual en modelos de menos de 4B parámetros.
- Asistentes de razonamiento matemático: adecuado para tutores o verificadores de problemas de competición (AIME, HMMT) gracias a su rendimiento en benchmarks de matemáticas avanzadas.
- Generación de código en pipelines de CI/CD: su alto resultado en Live-Code-Bench-Pro permite integrarlo en herramientas de autocompletado, revisión o generación de tests, con soporte de tool calling para interactuar con APIs.
- Automatización de atención al cliente multi-turno: el modelo mantiene conversaciones coherentes y alineadas (Arena-Hard-v2), aunque la longitud de contexto no está confirmada y debe validarse antes de desplegarlo con historiales largos.
- Evaluación y razonamiento científico: útil para tareas de preguntas y respuestas de nivel experto (GPQA, HLE) en entornos de investigación o educación.
- Orquestación de agentes con herramientas: su rendimiento en BFCL-V4 y Tau2-Bench lo hace candidato para asistentes que deben llamar funciones externas (calendarios, bases de datos, APIs) en flujos de negocio.
- Despliegue en entornos con recursos limitados: al tratarse de un modelo de ~3,9B parámetros, puede ejecutarse en una sola GPU de consumo, lo que facilita prototipos y despliegues edge.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (los valores subrayados indican el mejor resultado previo entre los modelos comparados):

| Benchmark | Qwen3-4B-2507 | Qwen3-8B | Qwen3-14B | Qwen3-32B | Qwen3-30B-A3B-2507 | Nanbeige4-3B-2511 | Nanbeige4.1-3B |
|---|---|---|---|---|---|---|---|
| Live-Code-Bench-V6 | 57,4 | 49,4 | 55,9 | 55,7 | 66,0 | 46,0 | 76,9 |
| Live-Code-Bench-Pro-Easy | 40,2 | 41,2 | 33,0 | 42,3 | 60,8 | 40,2 | 81,4 |
| Live-Code-Bench-Pro-Medium | 5,3 | 3,5 | 1,8 | 3,5 | 3,5 | 5,3 | 28,1 |
| AIME 2026 I | 81,46 | 70,42 | 76,46 | 75,83 | 87,30 | 84,1 | 87,40 |
| HMMT Nov | 68,33 | 48,33 | 56,67 | 57,08 | 71,25 | 66,67 | 77,92 |
| IMO-Answer-Bench | 48,00 | 36,56 | 41,81 | 43,94 | 54,34 | 38,25 | 53,38 |
| GPQA | 65,8 | 62,0 | 63,38 | 68,4 | 73,4 | 82,2 | 83,8 |
| HLE (Text-only) | 6,72 | 5,28 | 7,00 | 9,31 | 11,77 | 10,98 | 12,60 |
| Arena-Hard-v2 | 34,9 | 26,3 | 36,9 | 56,0 | 60,2 | 60,0 | 73,2 |
| Multi-Challenge | 41,14 | 36,30 | 36,97 | 38,72 | 49,40 | 41,20 | 52,21 |
| BFCL-V4 | 44,87 | 42,20 | 45,14 | 47,90 | 48,6 | 53,8 | 56,50 |
| Tau2-Bench | 45,90 | 42,06 | 44,96 | 45,26 | 47,70 | 41,77 | 48,57 |

Datos de deep-search (la tabla de la model card está truncada en la información disponible):

| Modelo | xBench-DeepSearch-2505 | xBench-DeepSearch-2510 | Browse-Comp | Browse-Comp-ZH | GAIA (Text-only) | HLE | SEAL-0 |
|---|---|---|---|---|---|---|---|
| MiroThinker-v1.0-8B | 61 | – | 31,1 | 40,2 | 66,4 | 21,5 | 40,4 |
| AgentCPM-Explore-4B | 70 | – | – | – | – | – | – |

Los resultados de Nanbeige4.1-3B en esta tabla de deep-search no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~3,9B parámetros, una estimación razonable sería de aproximadamente 8 GB en FP16 y de 2 a 3 GB en cuantizaciones de 4 bits, aunque estas cifras no las confirma el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar un funcionamiento correcto en GPUs de consumo como RTX 3060, RTX 4060 Ti, RTX 4070 o RTX 4090, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag de HuggingFace) y endpoints compatibles. No se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado (según autor) |
|---|---|---|---|---|---|
| Nanbeige4.1-3B | 3,93B | no disponible | Apache 2.0 | HuggingFace (RootML) | Arena-Hard-v2 73,2; Live-Code-Bench-V6 76,9; GPQA 83,8 |
| Qwen3-4B-2507 | ~4B | no disponible en la información | no disponible en la información | HuggingFace | Arena-Hard-v2 34,9; Live-Code-Bench-V6 57,4 |
| Qwen3-30B-A3B-2507 | 30B totales (MoE) | no disponible en la información | no disponible en la información | HuggingFace | Arena-Hard-v2 60,2; AIME 2026 I 87,30 |
| Nanbeige4-3B-2511 | ~3B | no disponible | no disponible en la información | HuggingFace | Arena-Hard-v2 60,0; GPQA 82,2 |

La comparativa se basa exclusivamente en los datos de la model card; los datos de contexto y licencia de los modelos Qwen no se han proporcionado en la información disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de español ni de otros idiomas.
- Longitud de contexto no especificada; debe validarse antes de usarlo en tareas con historiales largos o documentos extensos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado tasas de alucinación ni evaluaciones de calibración.
- Sesgos conocidos: no documentados en la información disponible.
- Los benchmarks son los reportados por el propio autor; no se han verificado de forma independiente en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los modelos base y de los datasets de entrenamiento, no detalladas.
- El modelo se presenta como iteración de un modelo de razonamiento; no se especifica si requiere plantillas de prompt específicas para activar el razonamiento, por lo que debe consultarse la model card completa.
- El repositorio tiene un número muy bajo de descargas (105) y ningún like en el momento de la consulta, lo que sugiere una adopción todavía limitada.

## Enlaces

- HuggingFace: https://huggingface.co/RootML/Nanbeige4.1-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Informe técnico (arXiv): https://arxiv.org/abs/2602.13367
