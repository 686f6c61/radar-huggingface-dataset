# h3rb3rn/smollm3-expert-graphrag-3b-v4

## Resumen

smollm3-expert-graphrag-3b-v4 es un ajuste fino especializado del modelo base SmolLM3-3B de HuggingFaceTB, publicado por el usuario h3rb3rn. No se trata de un modelo de proposito general, sino de un "experto de dominio" disenado para una unica tarea dentro de un sistema mayor denominado MoE-Sovereign: la generacion de consultas Cypher para Neo4j 5 en el contexto de un pipeline GraphRAG. El modelo se distribuye principalmente como un archivo GGUF cuantizado en Q4_K_M y esta pensado para ser invocado por un orquestador que le inyecte contexto procedente de una base de conocimiento.

La relevancia de esta ficha es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, fue creado en noviembre de 2026 y su model card esta redactada en aleman. Su interes tecnico reside en el metodo de entrenamiento (SFT con LoRA de rango 128 seguido de 100 pasos de GRPO con recompensa verificada por ejecucion contra Neo4j) y en el enfoque "KB-first", donde el conocimiento factual no reside en los pesos sino en la base de conocimiento externa.

Arquitectonicamente hereda las caracteristicas de SmolLM3-3B (transformer denso de aproximadamente 3.000 millones de parametros), aunque la model card no detalla la arquitectura interna ni la longitud de contexto del ajuste. El autor advierte explicitamente que la especializacion degrada el rendimiento en otras tareas, por lo que no debe emplearse como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de SmolLM3-3B; detalles no disponibles) |
| Parametros totales | Aproximadamente 3.000 millones (heredados del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF publicado); entrenamiento y medicion en bf16 |
| Idiomas soportados | Ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); pesos transformers no confirmados en la informacion disponible |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer denso de aproximadamente 3.000 millones de parametros. Sobre esa base se aplico un ajuste supervisado (SFT) especifico para la "rol graphrag-v3" mediante LoRA con rango 128, seguido de 100 pasos de GRPO (Group Relative Policy Optimization) con una recompensa basada en la ejecucion real de las consultas contra Neo4j. El entrenamiento se realizo en el supercomputador LUMI-G utilizando TRL-GRPO.

La innovacion principal es el diseno de la funcion de recompensa: en lugar de premiar la similitud textual con una respuesta de referencia, se ejecuta la consulta Cypher generada contra Neo4j 5.26 y se otorga credito parcial segun la cobertura de filas del resultado (esquema 0 / 0,1 + 0,6 * cobertura / 1,0). Este enfoque de "recompensa verificada por ejecucion" alinea el entrenamiento con el exito funcional de la consulta. El autor subraya que el conocimiento factual no esta en los pesos: el modelo opera en modo KB-first y depende de que el orquestador le proporcione el contexto de la base de conocimiento.

## Capacidades

- Generacion de consultas Cypher para Neo4j 5, tarea principal para la que fue entrenado.
- Generacion de texto en ingles y aleman.
- Operacion como experto de dominio dentro de un sistema compuesto (MoE-Sovereign), invocado por un orquestador.
- Razonamiento sobre esquemas de datos cuando se le proporciona contexto de la base de conocimiento.
- Capacidad de "datainfra" (generacion de SQL contra PostgreSQL) y "precision" (tareas de precision), segun las metricas reportadas por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de consultas Cypher en pipelines GraphRAG: el modelo recibe el esquema y fragmentos de la base de conocimiento y produce consultas Cypher ejecutables contra Neo4j 5, que el orquestador valida y ejecuta.
- Enrutamiento de subconsultas en un sistema multi-experto: al formar parte de MoE-Sovereign, puede ser invocado selectivamente cuando la consulta del usuario requiere acceso a un grafo de conocimiento, delegando otras tareas a otros expertos.
- Asistente interno de analitica sobre grafos: un analista describe en lenguaje natural una relacion entre entidades y el modelo traduce la peticion a Cypher para su ejecucion en Neo4j.
- Generacion de SQL auxiliar: segun las metricas del autor, el modelo conserva cierta competencia en tareas de "datainfra" contra PostgreSQL, lo que permite usarlo en pipelines que combinan bases relacionales y de grafos.
- Prototipado de sistemas agenticos soberanos: util para equipos que investigan arquitecturas donde el conocimiento se externaliza en una KB y los modelos solo razonan sobre el contexto inyectado.
- Entrenamiento e investigacion de RL con recompensa verificada: el modelo sirve como caso de estudio de GRPO con recompensa basada en ejecucion real, replicable en otros dominios con validacion automatica.

## Benchmarks y rendimiento

El autor reporta resultados de un test propio de 109 tareas escritas manualmente (38 de datainfra contra PostgreSQL 17, 35 de graphrag contra Neo4j 5.26, 36 de precision), con evaluacion greedy y con muestreo (semilla 1). No se trata de benchmarks estandar como MMLU o HumanEval.

| Tarea | Resultado (greedy / muestreo) | Referencia indicada por el autor |
|---|---|---|
| graphrag (35 tareas) | 19 / 20 | graphrag-v3: 8 / 10; modelo base: 2 / 2 |
| datainfra (38 tareas) | 5 / 5 | No disponible |
| precision (36 tareas) | 7 / 4 | No disponible |
| Precision OOD (70 tareas) | 20 / 23 | No disponible |

El autor senala que diferencias inferiores a 3 tareas son ruido estadistico y que las muestras son pequenas (un entrenamiento por modelo). No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2-3 GB para los pesos, mas el espacio del KV-cache (el autor menciona KV-cache q4_0 como estandar en su entorno).
- En bf16 (formato de medicion) se requieren aproximadamente 6-7 GB de VRAM para los pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para Q4_K_M (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para bf16, una RTX 4090 o superior.
- Cabe en GPU consumer: si, en configuracion Q4_K_M.
- Opciones de despliegue: llama.cpp y Ollama para el archivo GGUF; vLLM o TGI para los pesos transformers si estan disponibles (no confirmado).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm3-expert-graphrag-3b-v4 | ~3B | No disponible | Cypher / GraphRAG | Apache 2.0 | GGUF Q4_K_M |
| SmolLM3-3B (base) | ~3B | No disponible | Generalista | Apache 2.0 | Pesos transformers |
| graphrag-v3 (referencia interna del autor) | No disponible | No disponible | Cypher / GraphRAG | No disponible | No disponible |

No se dispone de informacion sobre otros modelos especializados en generacion de Cypher con los que comparar de forma rigurosa. Los datos de rendimiento del modelo base y de graphrag-v3 provienen del propio autor y se basan en muestras muy pequenas.

## Limitaciones y advertencias

- El autor advierte que, sin contexto de la base de conocimiento, el modelo inventa hechos; solo debe usarse con contexto KB inyectado.
- La especializacion degrada el rendimiento en otras tareas respecto al modelo base, segun el propio autor.
- Las mediciones se realizaron en bf16 sobre LUMI-G; la evaluacion de la propia version Q4_K_M esta pendiente.
- La recompensa de GRPO se ejecuto contra PostgreSQL 16.2 y Neo4j 5.26, mientras que el test se ejecuto contra PostgreSQL 17, lo que introduce una discrepancia de version.
- Muestras pequenas y un unico entrenamiento por modelo: los resultados no son estadisticamente robustos.
- Idiomas limitados a ingles y aleman; no se garantiza un rendimiento correcto en castellano.
- Riesgo de alucinacion en la generacion de consultas si el esquema proporcionado es ambiguo o incompleto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con cero adopcion verificable (0 descargas, 0 likes en el momento de la consulta).
- No hay informacion sobre sesgos especificos, longitud de contexto efectiva ni soporte de tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3rb3rn/smollm3-expert-graphrag-3b-v4
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Paper o blog de SmolLM3: no disponible en la informacion proporcionada
- Repositorio del sistema MoE-Sovereign: no disponible en la informacion proporcionada
- Demo o endpoint publico: no disponible en la informacion proporcionada
