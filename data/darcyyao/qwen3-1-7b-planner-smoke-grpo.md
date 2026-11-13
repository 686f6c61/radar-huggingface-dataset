# darcyyao/qwen3-1.7b-planner-smoke-grpo

## Resumen

qwen3-1.7b-planner-smoke-grpo es un ajuste fino del modelo Qwen3-1.7B de Alibaba, publicado por el usuario darcyyao, orientado especificamente a la planificacion de llamadas a herramientas (tool calling) en flujos de tipo agente. El modelo parte de la base Qwen3-1.7B y se entrena en dos fases: un ajuste supervisado (SFT) seguido de un refinamiento con GRPO (Group Relative Policy Optimization) usando una recompensa denominada `graded_cost`. El objetivo es que el modelo decida que herramienta invocar (`knowledge_search`, `calculator`, `get_weather`, `get_election`), con que argumentos y en que orden, hasta un maximo de tres rondas, terminando siempre con una linea `Answer:`.

El modelo resuelve el problema de la planificacion de herramientas en tareas multi-paso: descomponer una pregunta en subconsultas, elegir la herramienta adecuada y paralelizar llamadas cuando la tarea lo permite (fan-out). Los datos de la model card muestran mejoras sobre la base en tasa de exito (good rate), relevancia, factualidad y reduccion de coste excesivo por consulta, con un aumento notable en la tasa de llamadas paralelas en tareas fan-out (del 50,0 % en la base al 94,4 % tras GRPO).

Se trata de un modelo pequeno (1.720.574.976 parametros segun safetensors, aproximadamente 1,7 mil millones) con licencia no especificada en la informacion disponible, pensado para experimentacion y despliegue ligero en entornos de agentes con herramientas acotadas. Su relevancia actual radica en que demuestra como un modelo de ~1,7B puede mejorar sustancialmente su comportamiento de planificacion de herramientas mediante SFT + GRPO, sin necesidad de escalar el tamano del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B); detalles de capas y atencion no disponibles |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors; no se enumeran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 3,5 GB; compatible con transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B, un transformer denso de aproximadamente 1,7B parametros. Sobre esa base se aplica un pipeline de dos etapas: primero un ajuste supervisado (SFT) con ejemplos de planificacion de herramientas, y despues un refinamiento con GRPO, un algoritmo de optimizacion por politica proximal relativa a grupos que optimiza directamente una recompensa. La recompensa utilizada se denomina `graded_cost`, que penaliza el coste de las llamadas a herramientas (numero de rondas y llamadas) y premia la calidad del resultado. La implementacion se apoya en Unsloth y TRL, segun las etiquetas del repositorio.

El dominio de entrenamiento esta acotado a cuatro herramientas (`knowledge_search`, `calculator`, `get_weather`, `get_election`) y a un formato de planificacion con un maximo de tres rondas de herramientas que finaliza con una linea `Answer:`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni la existencia de fases adicionales de RLHF/DPO mas alla del SFT y el GRPO descritos. El codigo de entrenamiento y evaluacion esta publicado en el repositorio de GitHub indicado en la model card.

## Capacidades

- Generacion de texto conversacional en formato chat (etiqueta `conversational`).
- Planificacion de tool calling / function calling: seleccion de herramienta y argumentos entre un conjunto acotado (`knowledge_search`, `calculator`, `get_weather`, `get_election`).
- Razonamiento multi-paso con hasta tres rondas de herramientas y finalizacion obligatoria con `Answer:`.
- Descomposicion de consultas y reescritura de queries para busqueda en base de conocimiento.
- Llamadas paralelas (fan-out) cuando la tarea lo requiere: 94,4 % de tasa de paralelismo en tareas fan-out tras GRPO.
- Manejo de tareas compuestas que combinan varias herramientas.
- Capacidad de responder sin llamar a herramientas cuando la pregunta no lo requiere (aunque con degradacion tras el ajuste: 100 % en base frente a 66,7 % en SFT/GRPO en la familia `no_tool`).
- Capacidades multilingues: no disponibles en la informacion.
- Modo de razonamiento extendido (thinking), vision o audio: no disponible.

## Casos de uso

- Agente de atencion al cliente con base de conocimiento: el modelo decide cuando consultar `knowledge_search`, reescribe la query y sintetiza la respuesta, con una tasa de error de argumentos del 4,2 % y de herramienta incorrecta del 2,1 % en el benchmark interno, lo que lo hace util para flujos acotados de soporte.
- Asistente meteorologico: integracion directa con `get_weather`; la familia `weather_lookup` alcanza el 100 % de good rate en base, SFT y GRPO, lo que lo convierte en un caso de uso fiable y de bajo coste.
- Consulta de resultados electorales: uso de `get_election` para recuperar y presentar datos electorales; la familia `election_lookup` pasa del 83,3 % al 100 % tras el ajuste.
- Calculos multi-paso con fan-out: el modelo paraleliza llamadas a `calculator` en tareas tipo `fanout_calc`, con una tasa de exito del 83,3 % tras SFT/GRPO frente al 33,3 % de la base, adecuado para hojas de calculo automatizadas o informes con agregaciones.
- Orquestacion de pipelines de agentes con presupuesto de coste: la recompensa `graded_cost` reduce el exceso de coste por consulta de 0,16 a 0,04, por lo que encaja en sistemas donde cada llamada a herramienta tiene coste economico o de latencia.
- Prototipado e investigacion en RL para agentes: al ser un modelo de 1,7B con codigo de entrenamiento publicado y pipeline SFT + GRPO reproducible, sirve como banco de pruebas para experimentar con recompensas y formatos de tool calling sin grandes requisitos de computo.
- Evaluacion de estrategias de planificacion: util para comparar tecnicas de descomposicion, reescritura de queries y paralelizacion en un entorno controlado con cuatro herramientas y tareas etiquetadas por familia.

## Benchmarks y rendimiento

Resultados en PlannerQA-Bench (held-out), segun la model card del autor:

| Metrica | Base | SFT | GRPO |
|---|---|---|---|
| Good rate | 62,5 % | 72,9 % | 72,9 % |
| Relevancia (1-4) | 3,33 | 3,73 | 3,77 |
| Factualidad (1-4) | 2,75 | 3,31 | 3,33 |
| Coste de herramienta / query | 0,82 | 0,82 | 0,85 |
| Exceso de coste / query | 0,16 | 0,04 | 0,04 |
| Llamadas a knowledge_search / query | 0,62 | 0,54 | 0,58 |
| Rondas de herramienta / query | 1,12 | 1,29 | 1,25 |
| Tasa de llamadas invalidas | 4,4 % | 1,2 % | 1,2 % |
| Tasa de respuesta final | 100,0 % | 97,9 % | 100,0 % |
| Tasa de paralelismo en tareas fan-out | 50,0 % | 88,9 % | 94,4 % |

Good rate por familia de tarea:

| Familia | Base | SFT | GRPO |
|---|---|---|---|
| kb_bridge | 50,0 % | 66,7 % | 66,7 % |
| kb_compare | 50,0 % | 66,7 % | 66,7 % |
| weather_lookup | 100,0 % | 100,0 % | 100,0 % |
| election_lookup | 83,3 % | 100,0 % | 100,0 % |
| fanout_calc | 33,3 % | 83,3 % | 83,3 % |
| tool_bridge | 50,0 % | 100,0 % | 100,0 % |
| composite | 33,3 % | 0,0 % | 0,0 % |
| no_tool | 100,0 % | 66,7 % | 66,7 % |

Etiquetas de fallo (porcentaje sobre el total de tareas):

| Etiqueta | Base | SFT | GRPO |
|---|---|---|---|
| specialized_tool_not_called | 10,4 % | 0,0 % | 0,0 % |
| wrong_tool | 10,4 % | 2,1 % | 2,1 % |
| wrong_arguments | 10,4 % | 4,2 % | 4,2 % |
| not_decomposed | 8,3 % | 8,3 % | 6,2 % |
| query_rewrite_failed | 8,3 % | 2,1 % | 2,1 % |
| multi_hop_incomplete | 10,4 % | 0,0 % | 0,0 % |
| synthesis_error | 4,2 % | 10,4 % | 12,5 % |
| no_tool_called | 2,1 % | 0,0 % | 0,0 % |
| no_final_answer | 0,0 % | 2,1 % | 0,0 % |
| unneeded_tool_call | 0,0 % | 4,2 % | 4,2 % |

Resultados en BFCL (checker oficial), segun la model card:

| BFCL (checker oficial) | Base | SFT |
|---|---|---|
| Non-Live AST | 87,5 | 84,6 |
| Live AST | n/a | n/a |
| Hallucination (irrelevance) | 85,4 | 86,2 |
| Multi-Turn | n/a | n/a |
| BFCL-core (media de los grupos anteriores) | 86,5 | 85,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 3,5 GB en safetensors, lo que corresponde a pesos en BF16/FP16. En FP16 se necesitan aproximadamente 3,5 GB de VRAM solo para los pesos, mas overhead de KV cache y activaciones; en cuantizacion de 8 bits, alrededor de 1,8 GB; en 4 bits, en torno a 1 GB (estimaciones teoricas basadas en el numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en cuantizacion; en FP16 se recomienda una GPU con 12-16 GB o superior (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`); llama.cpp, Ollama o vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-planner-smoke-grpo | ~1,7B | No disponible | Tool calling / planificador (SFT + GRPO) | No disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-1.7B (base) | ~1,7B | No disponible | Modelo generalista | No disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de ~1,7B para tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada; la unica comparacion disponible es frente al modelo base Qwen3-1.7B en las tablas de PlannerQA-Bench y BFCL recogidas arriba.

## Limitaciones y advertencias

- El ajuste esta especializado en cuatro herramientas concretas (`knowledge_search`, `calculator`, `get_weather`, `get_election`); su comportamiento fuera de ese conjunto no esta validado.
- Degradacion clara en tareas que no requieren herramienta: la familia `no_tool` cae del 100 % en la base al 66,7 % tras SFT y GRPO, y aparece un 4,2 % de llamadas innecesarias (`unneeded_tool_call`).
- Las tareas compuestas (`composite`) pasan del 33,3 % en la base al 0,0 % tras el ajuste, lo que indica una regresion severa en ese tipo de tareas.
- Aumento de errores de sintesis: `synthesis_error` sube del 4,2 % (base) al 10,4 % (SFT) y al 12,5 % (GRPO).
- El modelo puede dejar de emitir respuesta final en algunos casos: la tasa de respuesta final baja al 97,9 % tras SFT (aunque se recupera al 100 % con GRPO).
- Riesgo de alucinacion: la factualidad media es de 3,33 sobre 4 tras GRPO, y la tasa de alucinacion en BFCL (irrelevance) es del 86,2, lo que indica margen de mejora en la verificacion de llamadas irrelevantes.
- Los benchmarks son internos (PlannerQA-Bench) con tamanos de muestra pequenos por familia (por ejemplo, `composite` y `no_tool` parecen tener muy pocas tareas), por lo que las diferencias porcentuales deben interpretarse con cautela.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingue.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni informes independientes.
- La fecha de creacion del repositorio (2026-11-13) y la falta de documentacion adicional limitan la trazabilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darcyyao/qwen3-1.7b-planner-smoke-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo de entrenamiento y evaluacion: https://github.com/yy726/tool_use_demo.git
