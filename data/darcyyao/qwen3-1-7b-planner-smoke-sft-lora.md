# darcyyao/qwen3-1.7b-planner-smoke-sft-lora

## Resumen

`qwen3-1.7b-planner-smoke-sft-lora` es un ajuste fino supervisado (SFT) del modelo base Qwen3-1.7B, desarrollado por el usuario `darcyyao`. El objetivo es especializar al modelo en planificación de llamadas a herramientas (tool-calling planner) para un conjunto cerrado de cuatro funciones: `knowledge_search`, `calculator`, `get_weather` y `get_election`. El modelo debe encadenar como máximo tres rondas de herramientas y terminar la respuesta con una línea `Answer:`.

El modelo se distribuye como un adaptador LoRA entrenado con Unsloth y TRL, empaquetado en formato safetensors y pensado para cargarse con `transformers`. Su relevancia radica en que sirve como experimento reproducible de SFT sobre un modelo pequeño (1.700 millones de parámetros) para tareas de planificación multi-paso con herramientas, un caso de uso cada vez más demandado en agentes y pipelines de automatización.

La información publicada es deliberadamente acotada: la model card incluye resultados de un benchmark propio (PlannerQA-Bench) y algunos datos de BFCL, pero no detalla hiperparámetros, composición del dataset de entrenamiento ni licencia. El repositorio ocupa 0,1 GB, lo que confirma que se trata de un adaptador y no de pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B); adaptador LoRA/SFT |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. Sobre esa base se aplica un ajuste fino supervisado (SFT) mediante LoRA, utilizando las librerías Unsloth y TRL según las etiquetas del repositorio. El entrenamiento está orientado a una tarea concreta: generar planes de llamadas a herramientas entre un conjunto fijo de cuatro funciones (`knowledge_search`, `calculator`, `get_weather`, `get_election`), con un límite de tres rondas de herramientas y una línea final `Answer:`.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Lo que sí se publica es el repositorio de código asociado (`tool_use_demo`), que presumiblemente contiene el pipeline de generación de datos y evaluación.

## Capacidades

- Planificación de llamadas a herramientas (tool-calling) sobre un conjunto cerrado de cuatro funciones: `knowledge_search`, `calculator`, `get_weather` y `get_election`.
- Ejecución de hasta tres rondas de herramientas por consulta antes de emitir la respuesta final.
- Generación de una línea final `Answer:` como cierre estructurado de la respuesta.
- Llamadas en paralelo en tareas de tipo fan-out (varias herramientas invocadas en la misma ronda), con una tasa de paralelismo del 88,9% en el benchmark propio.
- Manejo de tareas compuestas que requieren encadenar varias herramientas (puentes entre conocimiento y cálculo, comparaciones, etc.).
- Capacidad de responder sin invocar herramientas en tareas que no las requieren (aunque con degradación respecto al base, ver limitaciones).
- No se documentan capacidades de visión, audio, ni modo "thinking" explícito en la información disponible.

## Casos de uso

- **Asistentes de consulta con recuperación de conocimiento:** el modelo puede encadenar `knowledge_search` con otras herramientas para responder preguntas que requieren datos externos y luego un cálculo o una consulta adicional. Es adecuado porque su entrenamiento refuerza la descomposición en pasos y reduce llamadas inválidas (1,2% frente al 4,4% del base).
- **Automatización de atención al cliente con herramientas acotadas:** en dominios donde las acciones disponibles son un conjunto pequeño y bien definido (consultar clima, hacer cálculos, recuperar datos), el modelo puede gestionar conversaciones multi-turno invocando la herramienta correcta con los argumentos adecuados.
- **Pipelines de agentes con límite de rondas:** al estar entrenado para no superar tres rondas de herramientas, encaja en sistemas donde el coste por consulta está acotado y se penaliza el exceso de llamadas (excess cost/query de 0,04 frente a 0,16 del base).
- **Prototipado rápido de planners sobre modelos pequeños:** sirve como referencia reproducible para equipos que quieran evaluar SFT con LoRA sobre Qwen3-1.7B antes de escalar a modelos mayores o a dominios propios.
- **Evaluación de tool-calling en entornos con recursos limitados:** al ser un modelo de 1,7B, puede desplegarse en GPUs de consumo para pruebas de integración y validación de pipelines de agentes antes de pasar a producción.
- **Generación de trazas de planificación para fine-tuning posterior:** las salidas estructuradas (rondas de herramientas + línea `Answer:`) pueden usarse como datos de entrenamiento o como referencia para destilar comportamientos en modelos mayores.
- **Investigación en descomposición de tareas multi-hop:** el benchmark propio incluye familias como `kb_bridge`, `tool_bridge` y `fanout_calc`, lo que lo hace útil para estudiar fallos de descomposición y de reescritura de consultas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre PlannerQA-Bench (conjunto held-out):

| Métrica | Base | SFT |
|---|---|---|
| Good rate | 62,5% | 72,9% |
| Relevance (1-4) | 3,33 | 3,73 |
| Factuality (1-4) | 2,75 | 3,31 |
| Tool cost / query | 0,82 | 0,82 |
| Excess cost / query | 0,16 | 0,04 |
| knowledge_search calls / query | 0,62 | 0,54 |
| Tool rounds / query | 1,12 | 1,29 |
| Invalid call rate | 4,4% | 1,2% |
| Final answer rate | 100,0% | 97,9% |
| Parallel rate on fan-out tasks | 50,0% | 88,9% |

Good rate por familia de tareas:

| Familia | Base | SFT |
|---|---|---|
| kb_bridge | 50,0% | 66,7% |
| kb_compare | 50,0% | 66,7% |
| weather_lookup | 100,0% | 100,0% |
| election_lookup | 83,3% | 100,0% |
| fanout_calc | 33,3% | 83,3% |
| tool_bridge | 50,0% | 100,0% |
| composite | 33,3% | 0,0% |
| no_tool | 100,0% | 66,7% |

BFCL (solo se reporta el modelo base, no el SFT):

| BFCL (checker oficial) | Base |
|---|---|
| Non-Live AST | 87,5 |
| Live AST | n/a |
| Hallucination (irrelevance) | 85,4 |
| Multi-Turn | n/a |
| BFCL-core (media de los grupos anteriores) | 86,5 |

## Requisitos de hardware

- Al tratarse de un adaptador LoRA sobre Qwen3-1.7B, la VRAM necesaria depende del modelo base cargado, no del adaptador (0,1 GB en el repo).
- Para el modelo base de 1,7B en FP16 se estiman en torno a 3,4 GB de pesos, más overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits el consumo baja de forma notable (no se publican cifras oficiales en la información disponible).
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en FP16, y con más holgura en cuantización de 4 bits.
- Para despliegue en servidor se puede usar vLLM, TGI o llama.cpp/Ollama (este último requiere convertir el modelo fusionado a GGUF, no disponible en el repo).
- No se publican datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-planner-smoke-sft-lora | 1,7B (base) + LoRA | no disponible | Tool-calling planner con 4 herramientas | no disponible | Hugging Face (adaptador) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista | no disponible | Hugging Face |
| Alternativas de tool-calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- **Degradación en tareas sin herramienta:** el `no_tool` good rate cae del 100% (base) al 66,7% (SFT), y aparecen llamadas innecesarias (`unneeded_tool_call` pasa de 0,0% a 4,2%). El modelo puede invocar herramientas cuando no hace falta.
- **Fallo total en tareas compuestas:** la familia `composite` cae del 33,3% al 0,0%, lo que sugiere que el SFT no generaliza bien a combinaciones complejas de herramientas.
- **Tasa de respuesta final incompleta:** el `final answer rate` baja del 100% al 97,9%, es decir, en torno al 2% de las consultas no terminan con la línea `Answer:` esperada.
- **Aumento de errores de síntesis:** `synthesis_error` sube del 4,2% al 10,4%, indicando problemas para integrar los resultados de las herramientas en la respuesta final.
- **Ámbito muy restringido:** el modelo está entrenado para cuatro herramientas concretas; fuera de ese conjunto su comportamiento no está garantizado.
- **Licencia no especificada:** no se indica licencia en el repositorio, lo que impide confirmar si el uso comercial está permitido. Se debe consultar la licencia del modelo base Qwen3-1.7B y del adaptador antes de usarlo en producción.
- **Idiomas no documentados:** no se especifica qué idiomas soporta el ajuste; el comportamiento multilingüe no está garantizado.
- **Riesgo de alucinación:** no se publican métricas específicas de alucinación para el modelo SFT; el BFCL de hallucination (85,4) corresponde solo al base.
- **Repositorio sin descargas ni validación comunitaria:** 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de uso en producción.
- **Contexto no documentado:** se desconoce la longitud de contexto efectiva tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/darcyyao/qwen3-1.7b-planner-smoke-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Código del proyecto: https://github.com/yy726/tool_use_demo.git
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
