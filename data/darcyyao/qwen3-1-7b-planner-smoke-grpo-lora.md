# darcyyao/qwen3-1.7b-planner-smoke-grpo-lora

## Resumen

`darcyyao/qwen3-1.7b-planner-smoke-grpo-lora` es un ajuste fino del modelo base Qwen/Qwen3-1.7B, publicado por el usuario darcyyao en Hugging Face. El modelo está especializado en planificación de uso de herramientas (tool calling) para tareas de recuperación de conocimiento y cálculo, con un flujo que combina llamadas a `knowledge_search`, `calculator`, `get_weather` y `get_election`, limitado a un máximo de tres rondas de herramientas y que finaliza con una línea `Answer:`.

El entrenamiento se realizó en dos fases: un ajuste supervisado (SFT) seguido de optimización con GRPO (Group Relative Policy Optimization) usando una recompensa denominada `graded_cost`. El objetivo declarado es mejorar la calidad de la planificación, reducir llamadas inválidas y fomentar el uso paralelo de herramientas en tareas con fan-out, manteniendo un coste de herramientas controlado.

Se trata de un experimento de pequeño tamaño (repo de 0,1 GB, pesos en safetensors) orientado a demostrar el pipeline de entrenamiento descrito en el repositorio de GitHub asociado. No es un modelo de propósito general ni cuenta con una model card extensa: la información disponible se limita a los resultados en el benchmark propio PlannerQA-Bench y a una evaluación parcial en BFCL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); detalles no disponibles |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre esa base se aplica un ajuste fino en dos etapas: primero SFT y después GRPO con la recompensa `graded_cost`, que penaliza el coste de las llamadas a herramientas y premia la calidad de la respuesta final. El entrenamiento se realizó con las librerías Unsloth y TRL, según las etiquetas del repositorio.

El comportamiento entrenado impone un máximo de tres rondas de herramientas y una terminación explícita con una línea `Answer:`. Las herramientas disponibles en el dominio de entrenamiento son `knowledge_search`, `calculator`, `get_weather` y `get_election`. El código del pipeline está publicado en https://github.com/yy726/tool_use_demo.git. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO más allá de la mención a GRPO.

## Capacidades

- Planificación de uso de herramientas (tool calling) con un máximo de tres rondas por consulta.
- Selección entre cuatro herramientas especializadas: `knowledge_search`, `calculator`, `get_weather` y `get_election`.
- Generación de llamadas paralelas en tareas de fan-out (94,4% de tasa de paralelismo en el benchmark propio tras GRPO).
- Descomposición de consultas multi-hop y encadenamiento de herramientas (tool_bridge, kb_bridge, kb_compare).
- Terminación estructurada con línea `Answer:` para facilitar el parseo de la respuesta final.
- Manejo de tareas sin herramienta (no_tool), aunque con degradación respecto al modelo base en esa familia.
- No se documentan capacidades de visión, audio, ni modo de razonamiento extendido más allá de lo heredado del modelo base.

## Casos de uso

- Enrutamiento de consultas en asistentes con catálogo de herramientas: el modelo decide qué herramienta invocar y con qué argumentos, con una tasa de llamadas inválidas del 1,2% en el benchmark propio, lo que lo hace adecuado para prototipos de agentes con herramientas acotadas.
- Recuperación de conocimiento con reescritura de consulta: la reducción de fallos `query_rewrite_failed` del 8,3% al 2,1% tras SFT lo hace útil en pipelines de búsqueda documental donde la consulta del usuario debe reformularse antes de llamar a `knowledge_search`.
- Cálculo con descomposición multi-paso: la mejora en `fanout_calc` (del 33,3% al 83,3%) permite usarlo en asistentes financieros o de ingeniería que combinan varias llamadas a `calculator` en paralelo.
- Consultas meteorológicas y electorales: las familias `weather_lookup` y `election_lookup` alcanzan el 100% de buena tasa tras el ajuste, por lo que encaja en demos de agentes con APIs externas de dominio concreto.
- Investigación sobre RL para tool use: al publicar código y métricas del pipeline SFT+GRPO, sirve como referencia reproducible para estudiar el efecto de recompensas de coste en la planificación.
- Evaluación de agentes en entornos controlados: el formato de salida rígido (tres rondas máximo y línea `Answer:`) simplifica la integración en harnesses de evaluación automática de tool calling.

## Benchmarks y rendimiento

Resultados en PlannerQA-Bench (held-out), según la model card:

| Metrica | base | sft | grpo |
|---|---|---|---|
| Good rate | 62,5% | 72,9% | 72,9% |
| Relevance (1-4) | 3,33 | 3,73 | 3,77 |
| Factuality (1-4) | 2,75 | 3,31 | 3,33 |
| Tool cost / query | 0,82 | 0,82 | 0,85 |
| Excess cost / query | 0,16 | 0,04 | 0,04 |
| knowledge_search calls / query | 0,62 | 0,54 | 0,58 |
| Tool rounds / query | 1,12 | 1,29 | 1,25 |
| Invalid call rate | 4,4% | 1,2% | 1,2% |
| Final answer rate | 100,0% | 97,9% | 100,0% |
| Parallel rate on fan-out tasks | 50,0% | 88,9% | 94,4% |

Good rate por familia de tareas:

| Familia | base | sft | grpo |
|---|---|---|---|
| kb_bridge | 50,0% | 66,7% | 66,7% |
| kb_compare | 50,0% | 66,7% | 66,7% |
| weather_lookup | 100,0% | 100,0% | 100,0% |
| election_lookup | 83,3% | 100,0% | 100,0% |
| fanout_calc | 33,3% | 83,3% | 83,3% |
| tool_bridge | 50,0% | 100,0% | 100,0% |
| composite | 33,3% | 0,0% | 0,0% |
| no_tool | 100,0% | 66,7% | 66,7% |

Resultados en BFCL (checker oficial):

| BFCL | base | sft |
|---|---|---|
| Non-Live AST | 87,5 | 84,6 |
| Live AST | n/a | n/a |
| Hallucination (irrelevance) | 85,4 | 86,2 |
| Multi-Turn | n/a | n/a |
| BFCL-core (media de los grupos anteriores) | 86,5 | 85,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo de 1,7B en safetensors, los pesos en fp16 ocupan aproximadamente 3,4 GB, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño del modelo base (1,7B) es plausible en GPUs de consumo con cuantización, pero no se aporta dato verificado.
- Opciones de despliegue: la librería declarada es `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darcyyao/qwen3-1.7b-planner-smoke-grpo-lora | 1,7B | no disponible | Tool calling / planner (SFT + GRPO) | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista | no disponible | Hugging Face |
| Alternativas comparables de tool calling de ~1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de la misma categoría (planners de tool calling de ~1,7B) en la documentación proporcionada. La comparación directa más relevante es con su propio modelo base, Qwen3-1.7B, sobre el que se observan mejoras en PlannerQA-Bench (good rate de 62,5% a 72,9%) y una ligera caída en BFCL Non-Live AST (87,5 a 84,6).

## Limitaciones y advertencias

- El modelo está entrenado para un conjunto cerrado de cuatro herramientas; fuera de ese dominio su comportamiento no está validado.
- Degradación en tareas sin herramienta (`no_tool`): del 100% en el base al 66,7% tras SFT y GRPO.
- Caída a 0% en la familia `composite` tras el ajuste, frente al 33,3% del base.
- Aumento de errores de síntesis (`synthesis_error`): del 4,2% en el base al 12,5% tras GRPO.
- Ligero aumento de llamadas innecesarias a herramientas (`unneeded_tool_call`): del 0% al 4,2%.
- El `final answer rate` baja al 97,9% tras SFT, aunque se recupera al 100% tras GRPO.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinación específicos más allá de las métricas de factuality del benchmark propio.
- El modelo es un experimento ("smoke") con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Los resultados de BFCL solo cubren Non-Live AST y Hallucination; Live AST y Multi-Turn no están disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/darcyyao/qwen3-1.7b-planner-smoke-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de código del pipeline: https://github.com/yy726/tool_use_demo.git
