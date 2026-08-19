# a-ibrahim-pwc/Qwen3-Next-80B-A3B-Instruct

## Resumen

Qwen3-Next-80B-A3B-Instruct es la primera versión instruct de la serie Qwen3-Next, desarrollada por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) de alta dispersión que combina atención híbrida —Gated DeltaNet y Gated Attention— para lograr un modelado eficiente de contextos ultra-largos. Con 80 mil millones de parámetros totales y solo 3 mil millones activos por token, el modelo reduce drásticamente los FLOPs por token manteniendo la capacidad del modelo completo.

La versión Instruct está optimizada para conversación y generación de texto en modo no-thinking, es decir, no produce bloques de razonamiento explícito. Soporta una longitud de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens, y ha sido entrenada con 15 billones de tokens en fase de pretraining más un post-training adicional. Según los datos publicados, el modelo base supera a Qwen3-32B-Base con solo el 10 % del coste de entrenamiento y ofrece 10 veces más throughput de inferencia para contextos superiores a 32K tokens. La versión Instruct rinde a la par que Qwen3-235B-A22B-Instruct-2507 en varios benchmarks, con ventajas significativas en tareas de contexto muy largo.

Este modelo es relevante ahora porque aborda dos tendencias clave en IA: el escalado de parámetros totales y de longitud de contexto, mejorando la eficiencia de entrenamiento e inferencia mediante arquitectura innovadora. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (Gated DeltaNet + Gated Attention) y MoE de alta dispersión |
| Parametros totales | 81 324 862 720 (81,3B) |
| Parametros activos | 3B (10 expertos activos + 1 compartido de 512 expertos) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | No disponible en la información del repo (pesos en safetensors, probablemente BF16/FP16) |
| Idiomas soportados | Multilingüe (idiomas concretos no especificados en la documentación; benchmarks incluyen MMLU-ProX, INCLUDE, PolyMATH) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-Next-80B-A3B-Instruct emplea una arquitectura híbrida de atención que combina Gated DeltaNet (una variante de atención lineal con compuertas) y Gated Attention (atención estándar con compuertas), organizada en un patrón de 12 bloques repetidos, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de MoE y 1 sub-bloque de Gated Attention seguido de MoE. Esto permite manejar contextos ultra-largos con coste computacional reducido. La capa MoE tiene 512 expertos, de los cuales 10 se activan por token más 1 experto compartido, logrando una tasa de activación extremadamente baja (3B de 80B). Se aplican técnicas de estabilización como zero-centered y weight-decayed layernorm.

El entrenamiento incluye una fase de pretraining con 15 billones de tokens y una fase de post-training para la versión Instruct. Además, incorpora Multi-Token Prediction (MTP), que predice múltiples tokens futuros simultáneamente, mejorando el rendimiento del modelo y acelerando la inferencia. El modelo solo soporta modo instruct (no-thinking), por lo que no genera bloques de razonamiento explícito.

## Capacidades

- Generación de texto conversacional y completado de instrucciones en modo no-thinking.
- Razonamiento y resolución de problemas matemáticos y científicos (AIME25, HMMT25, GPQA).
- Generación de código en múltiples lenguajes (LiveCodeBench, MultiPL-E, Aider-Polyglot).
- Escritura creativa y redacción de documentos (Creative Writing v3, WritingBench).
- Capacidades de agente y tool calling (BFCL-v3, TAU benchmarks).
- Manejo de contexto ultra-largo hasta 256K tokens nativo, con extensión hasta ~1M tokens.
- Multilingüismo (MMLU-ProX, INCLUDE, MultiIF, PolyMATH).
- Soporte de seguimiento de instrucciones (IFEval) y alineación con preferencias humanas (Arena-Hard v2).

## Casos de uso

- Análisis y resumen de documentos extensos: con 262K tokens de contexto nativo, el modelo puede procesar libros completos, expedientes legales o informes técnicos de cientos de páginas en una sola pasada, extrayendo información relevante sin necesidad de fragmentar el texto.
- Agentes conversacionales para atención al cliente: su capacidad de tool calling y seguimiento de instrucciones permite integrarlo en sistemas de soporte multi-turno que gestionan consultas complejas, consultan bases de datos y ejecutan acciones en nombre del usuario.
- Generación de código en pipelines de CI/CD: con buen rendimiento en LiveCodeBench y MultiPL-E, puede utilizarse para autocompletar código, generar tests unitarios o revisar pull requests, integrándose mediante APIs de inferencia.
- Asistentes de investigación científica: su rendimiento en GPQA y SuperGPQA lo hace adecuado para ayudar en tareas de razonamiento científico, como formular hipótesis, analizar resultados experimentales o redactar secciones de artículos académicos.
- Traducción y localización multilingüe: su soporte multilingüe (evidenciado por MMLU-ProX e INCLUDE) permite su uso en servicios de traducción automática de alta calidad, especialmente en contextos técnicos y especializados.
- Automatización de tareas administrativas: puede generar correos, informes, actas de reuniones y otros documentos corporativos con alta fidelidad al estilo y formato requerido, gracias a sus capacidades de escritura creativa y seguimiento de instrucciones.
- RAG sobre grandes corpus: su ventana de contexto extendida permite integrarlo en sistemas de recuperación aumentada que procesan colecciones documentales completas sin perder información relevante.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el equipo de Qwen, comparando Qwen3-Next-80B-A3B-Instruct con modelos similares de la misma familia.

| Benchmark | Qwen3-30B-A3B-Instruct-2507 | Qwen3-32B Non-Thinking | Qwen3-235B-A22B-Instruct-2507 | Qwen3-Next-80B-A3B-Instruct |
|---|---|---|---|---|
| MMLU-Pro | 78.4 | 71.9 | 83.0 | **80.6** |
| MMLU-Redux | 89.3 | 85.7 | 93.1 | **90.9** |
| GPQA | 70.4 | 54.6 | 77.5 | **72.9** |
| SuperGPQA | 53.4 | 43.2 | 62.6 | **58.8** |
| AIME25 | 61.3 | 20.2 | 70.3 | **69.5** |
| HMMT25 | 43.0 | 9.8 | 55.4 | **54.1** |
| LiveBench 20241125 | 69.0 | 59.8 | 75.4 | **75.8** |
| LiveCodeBench v6 | 43.2 | 29.1 | 51.8 | **56.6** |
| MultiPL-E | 83.8 | 76.9 | 87.9 | **87.8** |
| Aider-Polyglot | 35.6 | 40.0 | 57.3 | **49.8** |
| IFEval | 84.7 | 83.2 | 88.7 | **87.6** |
| Arena-Hard v2* | 69.0 | 34.1 | 79.2 | **82.7** |
| Creative Writing v3 | 86.0 | 78.3 | 87.5 | **85.3** |
| WritingBench | 85.5 | 75.4 | 85.2 | **87.3** |
| BFCL-v3 | 65.1 | 63.0 | 70.9 | **70.3** |
| TAU1-Retail | 59.1 | 40.1 | 71.3 | **60.9** |
| TAU1-Airline | 40.0 | 17.0 | 44.0 | **44.0** |
| TAU2-Retail | 57.0 | 48.8 | 74.6 | **57.3** |
| TAU2-Airline | 38.0 | 24.0 | 50.0 | **45.5** |
| TAU2-Telecom | 12.3 | 24.6 | 32.5 | **13.2** |
| MultiIF | 67.9 | 70.7 | 77.5 | **75.8** |
| MMLU-ProX | 72.0 | 69.3 | 79.4 | **76.7** |
| INCLUDE | 71.9 | 70.9 | 79.5 | **78.9** |
| PolyMATH | 43.1 | 22.5 | 50.2 | **45.9** |

*: Win rates evaluados con GPT-4.1.

El modelo supera a Qwen3-32B Non-Thinking en todos los benchmarks y se acerca o iguala a Qwen3-235B-A22B-Instruct-2507 en la mayoría de categorías, con ventajas notables en LiveBench, LiveCodeBench y Arena-Hard v2.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE con 81B parámetros totales, se requiere cargar todos los pesos. En BF16/FP16 (~162 GB) se necesitan múltiples GPUs de alta gama; en INT8 (~81 GB) cabría en una sola GPU de 80 GB (A100/H100) o en dos de 48 GB; en INT4 (~40 GB) podría ejecutarse en una RTX 4090 (24 GB no es suficiente, necesitaría al menos 48 GB) o en GPUs de datacenter.
- GPUs recomendadas: para despliegue en producción, A100 80GB, H100 80GB o A6000 48GB en configuraciones multi-GPU. Para pruebas locales, una RTX 4090 con cuantización INT4 y offloading podría ser viable, aunque no es recomendable para producción.
- Debido a que solo se activan 3B parámetros por token, el throughput de inferencia es significativamente mayor que un modelo denso equivalente, especialmente en contextos largos (10 veces más throughput que Qwen3-32B para contextos >32K tokens).
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan pesos GGUF), Ollama (si se publica en su catálogo), y transformers con device_map="auto".
- Latencia y throughput: no se han publicado cifras exactas, pero el diseño MoE con 3B activos y MTP sugiere latencias por token comparables a modelos densos de ~3B, con un throughput muy superior en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | MMLU-Pro | LiveCodeBench v6 |
|---|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-Instruct | 81.3B | 3B | 262K (ext. 1M) | Apache 2.0 | 80.6 | 56.6 |
| Qwen3-30B-A3B-Instruct-2507 | 30B | 3B | 262K | Apache 2.0 | 78.4 | 43.2 |
| Qwen3-32B Non-Thinking | 32B (denso) | 32B | 262K | Apache 2.0 | 71.9 | 29.1 |
| Qwen3-235B-A22B-Instruct-2507 | 235B | 22B | 262K | Apache 2.0 | 83.0 | 51.8 |

Qwen3-Next-80B-A3B-Instruct ofrece el mejor equilibrio entre capacidad y eficiencia de la familia: con solo 3B activos supera a modelos densos de 32B y se acerca a modelos MoE mucho más grandes (235B totales) con una fracción del coste de inferencia.

## Limitaciones y advertencias

- Solo soporta modo instruct (no-thinking); no genera bloques de razonamiento explícito, lo que puede limitar su uso en tareas que requieran cadenas de pensamiento visibles.
- Aunque el contexto nativo es de 262K tokens, la extensión a 1M tokens puede degradar la calidad en tramos muy largos; se recomienda validar en el caso de uso concreto.
- No se especifican los idiomas soportados de forma explícita; aunque los benchmarks multilingües sugieren cobertura amplia, el rendimiento puede variar entre idiomas.
- Los benchmarks publicados son del modelo original de Qwen; este repo es un mirror y no se garantiza que los pesos sean idénticos (aunque deberían serlo).
- No se han publicado resultados de cuantización (GGUF, INT8, INT4) en la información disponible; el rendimiento bajo cuantización puede diferir.
- Riesgo de alucinación inherente a todos los LLM, especialmente en tareas de generación libre; se recomienda verificación humana en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no se otorgan patentes sobre el modelo.

## Enlaces

- Repo de HuggingFace (mirror): https://huggingface.co/a-ibrahim-pwc/Qwen3-Next-80B-A3B-Instruct
- Repo original de HuggingFace: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Colección Qwen3-Next: https://huggingface.co/collections/Qwen/qwen3-next
- Blog oficial de Qwen: https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list
- ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-Next-80B-A3B-Instruct
- Artículos arxiv relacionados: 2309.00071 (Gated DeltaNet), 2404.06654, 2505.09388, 2501.15383
