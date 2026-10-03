# LiveUK/GLM-5.2

## Resumen

GLM-5.2 es un modelo de lenguaje de gran escala desarrollado por Zhipu AI (organización zai-org) y orientado especificamente a tareas de largo horizonte (long-horizon tasks). Se trata del sucesor de GLM-5.1 y su rasgo mas destacado es una ventana de contexto solida de 1.000.000 de tokens, que segun el autor se mantiene estable en trabajos prolongados de razonamiento y agentes. La arquitectura es un transformer de tipo Mixture of Experts (MoE) con atencion dispersa, etiquetada como glm_moe_dsa, y cuenta con 753.329.940.480 parametros totales en los pesos safetensors (unos 753B), con un tamano de repositorio de 1506,7 GB.

El modelo introduce dos innovaciones tecnicas: el mecanismo IndexShare, que reutiliza el mismo indexador cada cuatro capas de atencion dispersa y reduce los FLOPs por token en un factor de 2,9x a 1M de contexto, y una mejora de la capa MTP (Multi-Token Prediction) para decodificacion especulativa que aumenta la longitud de aceptacion hasta un 20%. Se distribuye bajo licencia MIT, sin restricciones regionales, lo que facilita su uso comercial y su inspeccion.

Es relevante ahora porque compite directamente en tareas de codigo agentico, uso de herramientas y razonamiento con modelos frontera cerrados (Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro), segun la propia tabla de benchmarks del autor. La ficha de HuggingFace analizada (LiveUK/GLM-5.2) es una resubida de terceros con 0 descargas y 0 me gusta, no el repositorio oficial; los datos tecnicos provienen de la model card asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion dispersa (tag: glm_moe_dsa), con capa MTP para decodificacion especulativa |
| Parametros totales | 753.329.940.480 (~753B) segun safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 de tokens (1M), declarado como "solido" |
| Tipos de cuantizacion | no disponible en la informacion; el repositorio se distribuye en safetensors (BF16 presumiblemente; existe referencia a una version GLM-5.3-BF16) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 1506,7 GB) |

## Arquitectura y entrenamiento

GLM-5.2 es un transformer de tipo Mixture of Experts (MoE) con atencion dispersa. La innovacion de arquitectura principal es IndexShare, descrita en el articulo arXiv:2603.12201: reutiliza el mismo indexador a lo largo de cada cuatro capas de atencion dispersa, lo que segun el autor reduce los FLOPs por token en 2,9x con una longitud de contexto de 1M. Adicionalmente, la capa MTP (Multi-Token Prediction) se ha mejorado para la decodificacion especulativa, incrementando la longitud de aceptacion hasta un 20%, lo que se traduce en mayor throughput efectivo.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. La model card tampoco especifica el numero de expertos ni cuantos se activan por token. El modelo esta disenado explicitamente para tareas de largo horizonte, como sugieren las capacidades declaradas en codigo agentico (SWE-bench Pro, Terminal Bench, SWE-Marathon) y el uso de contextos de hasta 400.000 tokens durante la evaluacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento avanzado en matematicas y ciencia, con niveles de esfuerzo de pensamiento (thinking effort levels) configurables para balancear rendimiento y latencia.
- Codigo en produccion y tareas SWE (resolucion de issues, generacion de repositorios completos, depuracion agentica).
- Tool calling y function calling, con soporte para protocolos MCP (evaluado en MCP-Atlas) y conjuntos multi-herramienta (Tool-Decathlon).
- Capacidades agenticas y razonamiento multi-paso sobre contextos largos (1M de tokens).
- Contexto largo sostenido para tareas de largo horizonte (evaluado con ventanas de 300K-400K tokens).
- Decodificacion especulativa nativa mediante capa MTP mejorada.
- Capacidad multilingue limitada a ingles y chino segun los idiomas declarados.
- No se declaran capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Agentes de ingenieria de software autonoma: con una ventana de 1M de tokens y soporte de tool calling, el modelo puede mantener el estado de un repositorio completo, ejecutar comandos en terminal y resolver issues de principio a fin (SWE-bench Pro 62,1; Terminal Bench 2.1 81,0).
- Generacion de repositorios completos a partir de lenguaje natural (NL2Repo): util para generar esqueletos de proyectos funcionales desde una descripcion textual, aprovechando el contexto largo para mantener coherencia entre multiples ficheros.
- Agentes de navegacion y automatizacion de herramientas: integrable en pipelines MCP y orquestadores de herramientas (MCP-Atlas 76,8) para tareas de oficina, busqueda de informacion y automatizacion de flujos.
- Razonamiento cientifico y resolucion de problemas matematicos: adecuado para asistentes de investigacion que requieren explicaciones detalladas y respuestas de alta precision (AIME 2026 99,2; GPQA-Diamond 91,2).
- Atencion al cliente automatizada de largo alcance: conversaciones multi-turno con historial extenso gracias al contexto de 1M de tokens, sin necesidad de resumir o truncar el dialogo.
- Analisis y revision de codigo en CI/CD: integrable en pipelines para revisar diffs, detectar regresiones y generar parches, gracias al soporte de tool calling y a la ventana de contexto extendida.
- Automatizacion de tareas de larga duracion (long-horizon): ejecucion de flujos multi-paso de horas con seguimiento de estado (SWE-Marathon 13,0), adecuado para agentes que operan de forma autonoma prolongada.
- Despliegue local en entornos con NPU Ascend o infraestructura mixta CPU+GPU via KTransformers, para organizaciones que no pueden usar APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion con temperature=1,0 y top_p=0,95; juez GPT-5.5 medium):

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (con herramientas) | 54,7 | 52,3 | 53,5 | - | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 3,7 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2026 | 99,2 | 95,3 | 97 | - | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT Nov. 2025 | 94,4 | 94 | 95 | 84,4 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT Feb. 2026 | 92,5 | 82,6 | 97,1 | 84,4 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | - | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 93 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 59 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 42,1 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (Best Reported Harness) | 82,7 | 69 | - | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (Dominance) | 74,4 | 30,5 | - | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 74,2 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | - | 52,8 | 59,9 | 55,6 | 48,8 |

Notas de evaluacion: para HLE y otras tareas de razonamiento se uso una longitud maxima de generacion de 163.840 tokens; para HLE con herramientas, contexto maximo de 300.000 tokens. SWE-Bench Pro con OpenHands a 400K de contexto; NL2Repo con max_new_tokens=48k; DeepSWE con mini-swe-agent y timeout de 2h en contenedores aislados (2 CPU, 8 GB RAM, sin internet). El subconjunto text-only se reporta por defecto; los valores marcados con * son del conjunto completo. La informacion sobre ProgramBench aparece truncada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (no confirmada por el autor, calculada a partir de 753B parametros): aproximadamente 1506 GB en BF16, ~753 GB en FP8/INT8 y ~377 GB en INT4. Estas cifras son estimaciones tecnicas, no datos oficiales.
- No cabe en ninguna GPU de consumo individual. Requiere nodos multi-GPU de centro de datos.
- GPU recomendadas: clusters de NVIDIA H100, H200, B200 o equivalentes, interconectados (NVLink/InfiniBand), dado el tamano del modelo.
- Opciones de despliegue soportadas oficialmente: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+) para despliegue hibrido CPU+GPU, y Unsloth (v0.1.47-beta+) para ajuste fino.
- Soporte para plataforma Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponible. La mejora de MTP (hasta +20% de longitud de aceptacion en decodificacion especulativa) y la reduccion de FLOPs por token (2,9x a 1M de contexto) sugieren mejoras de eficiencia, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado (SWE-bench Pro / GPQA-D) |
|---|---|---|---|---|---|
| GLM-5.2 (este) | ~753B | 1M tokens | MIT | Pesos abiertos (safetensors) | 62,1 / 91,2 |
| GLM-5.1 | no disponible | no disponible | no disponible | Pesos abiertos | 58,4 / 86,2 |
| Qwen3.7-Max | no disponible | no disponible | no disponible | no disponible | 60,6 / 90 |
| MiniMax M3 | no disponible | no disponible | no disponible | no disponible | 59 / 93 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | 55,4 / 90,1 |
| Claude Opus 4.8 | no disponible | no disponible | Propietaria | API | 69,2 / 93,6 |
| GPT-5.5 | no disponible | no disponible | Propietaria | API | 58,6 / 93,6 |
| Gemini 3.1 Pro | no disponible | no disponible | Propietaria | API | 54,2 / 94,3 |

Los parametros, contextos y licencias de los modelos de comparacion no estan disponibles en la informacion proporcionada. GLM-5.2 destaca en DeepSWE (46,2), NL2Repo (48,9) y Terminal Bench 2.1 (81,0), por encima de la mayoria de alternativas abiertas, aunque por debajo de Claude Opus 4.8 en varias tareas de codigo.

## Limitaciones y advertencias

- La ficha analizada (LiveUK/GLM-5.2) es una resubida de terceros con 0 descargas y 0 me gusta; no es el repositorio oficial. Conviene verificar la procedencia antes de usarla en produccion y consultar el repositorio oficial de zai-org.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion no cuantificado en la informacion; como todo modelo generativo de gran escala, es susceptible de producir contenido incorrecto con aparente seguridad.
- No se detallan sesgos conocidos, composicion del dataset ni tecnicas de alineamiento, lo que dificulta evaluar riesgos de sesgo.
- El modelo es de 753B parametros: el coste de despliegue en BF16 (~1506 GB de VRAM) es prohibitivo para la mayoria de equipos sin infraestructura de centro de datos.
- Los benchmarks provienen del propio autor y se han ejecutado con juez GPT-5.5 medium; los resultados deben interpretarse con cautela y validarse de forma independiente.
- Algunas celdas de benchmark estan vacias o la informacion de ProgramBench aparece truncada en la model card.
- Aunque la licencia MIT permite uso comercial sin restricciones regionales declaradas, conviene revisar los pesos y dependencias de terceros.
- No se especifican tipos de cuantizacion oficiales ni pesos GGUF/Ollama listos para usar en la informacion disponible.

## Enlaces

- HuggingFace (ficha analizada, resubida): https://huggingface.co/LiveUK/GLM-5.2
- Paper GLM-5 (technical report): https://arxiv.org/abs/2602.15763
- Paper en HuggingFace: https://huggingface.co/papers/2602.15763
- Paper IndexShare: https://arxiv.org/abs/2603.12201
- Blog oficial GLM-5.2: https://z.ai/blog/glm-5.2
- Repositorio GitHub: https://github.com/zai-org/GLM-5
- Documentacion API Z.ai: https://docs.z.ai/guides/llm/glm-5.2
- Demo de chat: https://chat.z.ai
- Cookbook SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2
- Recetas vLLM: https://recipes.vllm.ai/zai-org/GLM-5.2
- Documentacion Transformers (glm_moe_dsa): https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guia Unsloth: https://unsloth.ai/docs/models/glm-5.2
- Comunidad Discord: https://discord.gg/QR7SARHRxK
