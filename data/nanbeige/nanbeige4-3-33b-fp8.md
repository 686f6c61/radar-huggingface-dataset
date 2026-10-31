# Nanbeige/Nanbeige4.3-33B-FP8

## Resumen

Nanbeige4.3-33B-FP8 es la versión cuantizada en FP8 del modelo Nanbeige4.3-33B, desarrollado por el equipo Nanbeige. Se trata de un modelo de lenguaje de 33.118.977.024 parámetros basado en la arquitectura Llama (transformer denso), orientado a generación de texto conversacional con capacidades agénticas avanzadas. Según su model card, Nanbeige4.3-33B está diseñado como modelo "profesor" insignia de la serie Nanbeige4.3, con la estrategia de construir primero un agente de gran capacidad que sirva de ancla para destilar capacidades agénticas en modelos más pequeños (como el futuro Nanbeige4.3-3B).

El modelo se posiciona como líder entre los modelos abiertos de la clase de ~30B parámetros en tareas agénticas, destacando en código complejo y tareas de colaboración profesional ("cowork"). La cuantización FP8 reduce el tamaño del repositorio a 35,5 GB, haciendo el modelo más accesible para despliegue en infraestructura con GPUs modernas sin una pérdida sustancial de calidad.

Su relevancia actual radica en la creciente demanda de modelos abiertos capaces de ejecutar flujos agénticos multi-paso (uso de terminal, herramientas, planificación) sin recurrir a APIs propietarias, con una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Llama) |
| Parametros totales | 33.118.977.024 (~33B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

Nanbeige4.3-33B emplea una arquitectura transformer densa basada en Llama, sin componentes MoE. La version FP8 de este repositorio aplica cuantizacion de pesos y activaciones en formato de coma flotante de 8 bits mediante la libreria compressed-tensors, lo que reduce a la mitad aproximadamente el consumo de memoria respecto al modelo BF16 original (35,5 GB frente a ~66 GB estimados).

Sobre los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF/DPO) y sobre innovaciones tecnicas concretas de la arquitectura, la model card no proporciona detalles. Lo unico documentado es la estrategia de la serie: entrenar primero un agente profesor de alta capacidad (Nanbeige4.3-33B) y posteriormente destilar sus capacidades agenticas en modelos mas pequenos. El chat template es configurable, con dos parametros clave: `enable_thinking` (activa o desactiva el razonamiento en la respuesta actual, activado por defecto) y `preserve_thinking` (controla si el razonamiento de turnos anteriores se conserva en conversaciones multi-turno; se recomienda `False` para chat general y `True` para uso de herramientas multi-turno y tareas de oficina).

## Capacidades

- Generacion de texto conversacional con modo de razonamiento ("thinking mode") configurable mediante `enable_thinking` en el chat template.
- Razonamiento matematico y cientifico de alto nivel: 95,2 en AIME 2026 y 89,5 en GPQA Diamond (version BF16).
- Codigo agéntico: resolucion de tareas en terminal (Terminal-Bench 2.1: 80,9), ingenieria de software autonomia (DeepSWE: 65,5) y generacion de repositorios (NL2Repo: 53,0).
- Colaboracion profesional agéntica ("cowork"): automatizacion de tareas de oficina (Automation Bench: 54,2), uso de herramientas (Toolathlon-Verified: 70,4) y planificacion profunda (DeepPlanning: 63,3).
- Soporte de tool calling / function calling: el chat template incluye configuraciones especificas para escenarios de uso de herramientas multi-turno.
- Capacidades agénticas multi-paso: el modelo esta explicitamente disenado como agente profesor, con rendimiento destacado en benchmarks de agentes como Tau3-Bench, Claw-Eval y YC-bench.
- Capacidades bilingues: ingles y chino.
- No hay indicios de capacidades multimodales (vision, audio) en la informacion disponible.

## Casos de uso

- Agentes de terminal y DevOps automatizados: gracias a su puntuacion de 80,9 en Terminal-Bench 2.1, el modelo puede ejecutar tareas de administracion de sistemas, depuracion en linea de comandos y flujos de trabajo en shell de forma autonomia dentro de harnesses como Terminus o mini-swe-agent.
- Resolucion automatica de incidencias de software: con 65,5 en DeepSWE y 60,3 en SWE-Bench Pro, puede integrarse en pipelines de CI/CD para corregir bugs, generar parches y procesar issues de repositorios reales.
- Asistentes de programacion con contexto de repositorio: su rendimiento en NL2Repo (53,0) y SWE-Atlas-QnA (50,8) lo hace adecuado para responder preguntas sobre bases de codigo grandes y generar cambios multi-archivo.
- Automatizacion de tareas de oficina y flujos empresariales: benchmarks como Automation Bench (54,2) y JobBench (44,8) indican utilidad en agentes que manipulan documentos, hojas de calculo y herramientas de productividad.
- Orquestacion de herramientas multi-turno: con 70,4 en Toolathlon-Verified y 48,8 en Tau3-Bench, es adecuado para agentes que encadenan llamadas a APIs y herramientas externas en conversaciones largas, aprovechando `preserve_thinking=True`.
- Planificacion y razonamiento complejo: su resultado en DeepPlanning (63,3) y AA-LCR (84,0) lo hace util para descomponer tareas largas en sub-tareas y razonar sobre problemas de logica dificil.
- Chatbot bilingue ingles-chino con razonamiento: el modo thinking configurable permite alternar entre respuestas rapidas (non-thinking) y respuestas con razonamiento explicito segun la complejidad de la consulta.

## Benchmarks y rendimiento

Resultados publicados por el autor para la version BF16, evaluada con `preserve_thinking=true` y al maximo esfuerzo de razonamiento, comparada con modelos frontera de ~30B:

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Codigo agéntico | Terminal-Bench 2.1 | **80,9** | 73,0 | 61,8 | 47,2 |
| Codigo agéntico | Terminal-Bench 4.0 | **23,8** | 6,3 | 1,6 | 0,0 |
| Codigo agéntico | DeepSWE | **65,5** | 42,5 | 4,4 | 2,7 |
| Codigo agéntico | SWE-Bench Pro | 60,3 | **61,7** | 51,2 | 36,9 |
| Codigo agéntico | SWE-Atlas-QnA | **50,8** | 41,9 | 17,7 | 3,3 |
| Codigo agéntico | NL2Repo | **53,0** | 48,3 | 27,4 | 33,8 |
| Codigo agéntico | Scicode | **52,6** | 46,7 | 44,9 | 45,5 |
| Codigo agéntico | SkillsBench | **61,1** | 56,4 | 39,7 | 28,9 |
| Cowork agéntico | Automation Bench | **54,2** | 38,3 | 15,2 | 9,7 |
| Cowork agéntico | JobBench | **44,8** | 34,5 | 16,6 | 9,0 |
| Cowork agéntico | GDPval | 84,8 | **86,4** | 75,8 | 71,4 |
| Cowork agéntico | Claw-Eval (pass^3) | **78,3** | 75,2 | 57,3 | 44,2 |
| Cowork agéntico | Toolathlon-Verified | **70,4** | 68,5 | 47,2 | 27,8 |
| Cowork agéntico | DeepPlanning | **63,3** | 49,2 | 21,4 | 19,4 |
| Cowork agéntico | EnterpriseOps-Gym | **41,0** | 40,2 | 30,5 | 27,3 |
| Cowork agéntico | YC-bench | **$1.025.437** | $641.290 | $513.978 | $265.152 |
| Cowork agéntico | Tau3-Bench | **48,8** | 48,5 | 33,7 | 18,6 |
| Razonamiento | GPQA Diamond | 89,5 | 89,2 | 83,5 | **91,3** |
| Razonamiento | AIME 2026 | **95,2** | 94,5 | 94,7 | 89,2 |
| Razonamiento | AA-LCR | **84,0** | 82,0 | 83,3 | 72,0 |

Estos resultados corresponden al modelo BF16; no se han publicado benchmarks especificos de la version FP8. Los harnesses usados incluyen Terminus 2, mini-swe-agent v2.4.6, Claude Code y los repositorios oficiales de cada benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 35-40 GB para los pesos FP8 (el repositorio pesa 35,5 GB), mas margen para la KV cache, que dependera de la longitud de contexto (no publicada).
- GPUs recomendadas: una NVIDIA H100 80 GB o A100 80 GB ejecuta el modelo con holgura; con una H100 NVL o A100 80 GB se dispone de margen amplio para contextos largos.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin offloading. Con dos RTX 4090 en paralelo (48 GB totales) seria viable, aunque sin datos oficiales de compatibilidad FP8 en esas tarjetas.
- Opciones de despliegue: libreria transformers (nativa), text-generation-inference (TGI) y endpoints de HuggingFace (el modelo esta etiquetado como `endpoints_compatible`). El formato compressed-tensors FP8 es compatible con vLLM. No hay indicios de soporte GGUF/llama.cpp ni de Ollama para esta cuantizacion.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

Comparativa con los modelos contra los que el propio autor evalua (todos de ~27-31B, con datos de rendimiento publicados):

| Caracteristica | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|
| Parametros | ~33B | 27B | 30B | 31B |
| Terminal-Bench 2.1 | 80,9 | 73,0 | 61,8 | 47,2 |
| GPQA Diamond | 89,5 | 89,2 | 83,5 | 91,3 |
| AIME 2026 | 95,2 | 94,5 | 94,7 | 89,2 |
| Licencia | Apache 2.0 | no disponible | no disponible | no disponible |
| Cuantizacion publicada | FP8 (esta ficha) | no disponible | no disponible | no disponible |

Nanbeige4.3-33B lidera en 16 de los 20 benchmarks publicados, con Qwen3.8-27B como competidor mas cercano (especialmente en SWE-Bench Pro y GDPval) y Gemma4-31B destacando unicamente en GPQA Diamond. Las licencias de los competidores no constan en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al ser un modelo entrenado principalmente en ingles y chino, puede mostrar rendimiento degradado en otros idiomas, incluido el castellano.
- Riesgo de alucinacion: inherente a todo LLM; no hay datos especificos de alucinacion publicados. En tareas agénticas con acceso a terminal y herramientas, un error del modelo puede tener efectos reales sobre el sistema, por lo que se recomienda sandboxing.
- Limitaciones de contexto: la longitud de ventana de contexto no esta publicada; verificarla antes de disenar flujos con documentos largos.
- Idioma: soporte oficial solo para ingles y chino; el rendimiento en espanol no esta evaluado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones relevantes mas alla de la atribucion.
- Caveats de produccion: los benchmarks publicados corresponden al modelo BF16 con maximo esfuerzo de razonamiento; la version FP8 puede mostrar ligeras desviaciones no cuantificadas. El modo thinking por defecto genera razonamiento explicito que aumenta el consumo de tokens y la latencia; desactivarlo (`enable_thinking=False`) para chat de baja latencia. Los resultados agénticos dependen fuertemente del harness de evaluacion (Terminus 2, mini-swe-agent, Claude Code), por lo que el rendimiento en produccion puede variar segun la infraestructura de agente empleada.
- Adopcion: el modelo registra 0 descargas y 3 likes en HuggingFace, lo que indica una comunidad y ecosistema de tooling todavia muy limitados.

## Enlaces

- Modelo FP8: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-FP8
- Modelo base BF16: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Perfil del autor en HuggingFace: https://huggingface.co/Nanbeige
- Paper, repositorio de GitHub y demo: no disponibles en la informacion proporcionada.
