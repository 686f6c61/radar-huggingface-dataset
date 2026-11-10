# h3rb3rn/olmo3-expert-graphrag-7b-v4

## Resumen

olmo3-expert-graphrag-7b-v4 es un ajuste fino de allenai/Olmo-3-7B-Instruct especializado en la generación de consultas Cypher para Neo4j 5 dentro de un sistema denominado MoE-Sovereign. El autor, h3rb3rn, lo presenta como un "experto" de rol: un modelo pequeño que no almacena conocimiento factual, sino que se activa con contexto de una base de conocimiento (KB-first) para traducir preguntas a consultas ejecutables contra un grafo Neo4j. Se publica bajo licencia Apache 2.0 y con pesos en formato GGUF (Q4_K_M), además del repositorio transformers.

El modelo parte de OLMo-3-7B-Instruct, la familia abierta de AllenAI con datos y receta de entrenamiento publicados. Sobre esa base se aplicó un SFT de rol (LoRA con rango 128) seguido de 100 pasos de GRPO con una recompensa basada en la ejecución real de la consulta contra Neo4j 5.26. El entrenamiento se realizó en LUMI-G con TRL.

Su relevancia es acotada pero concreta: demuestra un patrón de especialización por rol con recompensa verificable por ejecución, útil para arquitecturas compuestas donde varios expertos pequeños cubren tareas dispares (graphrag, datainfra, precision) en lugar de un único modelo grande. La model card advierte que la especialización degrada el rendimiento en otras tareas y que las muestras de evaluación son pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base OLMo-3-7B-Instruct); no se detalla en la model card |
| Parametros totales | 7B (heredados del modelo base) |
| Parametros activos | no disponible (no es un MoE real; "MoE" se refiere al sistema compuesto que lo aloja) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (archivo publicado); entrenamiento y medición en bf16 |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y pesos transformers (repositorio etiquetado como transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only OLMo-3-7B-Instruct. El pipeline de entrenamiento consta de dos fases: primero un SFT de rol "graphrag-v3" mediante LoRA con rango 128, y después 100 pasos de GRPO (TRL) con una recompensa verificada por ejecución contra Neo4j. La recompensa asigna 0 si la consulta no se ejecuta, y entre 0,1 y 1,0 según la cobertura de filas (0,1 + 0,6 · cobertura de filas, hasta 1,0). Todo el entrenamiento se ejecutó en LUMI-G.

La innovación principal no está en la arquitectura, sino en el método: especialización por rol con recompensa de ejecución real sobre un motor de base de datos (Neo4j 5.26 en el entrenamiento, PostgreSQL 16.2 en la parte de datainfra) y despliegue como pieza de un sistema compuesto. El autor subraya explícitamente que el conocimiento no reside en el modelo: es KB-first, y los hechos deben llegar desde la base de conocimiento en el contexto.

## Capacidades

- Generación de consultas Cypher para Neo4j 5, orientadas a tareas procedurales verificables por ejecución.
- Traducción de preguntas en lenguaje natural a consultas de grafo, condicionada por contexto de base de conocimiento.
- Generación de texto general y razonamiento heredados de OLMo-3-7B-Instruct.
- Soporte multilingüe limitado a inglés y alemán según los metadatos.
- Integración en un sistema compuesto ("MoE-Sovereign") como experto de rol graphrag.
- No se documentan tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación de Cypher en producción sobre Neo4j 5: el modelo recibe el esquema y fragmentos de la KB en el prompt y devuelve consultas ejecutables; la recompensa de entrenamiento se basó precisamente en ejecución y cobertura de filas, lo que alinea la salida con consultas que corren.
- Asistente de analistas sobre grafos de conocimiento: un pipeline recupera entidades y relaciones de la KB, las inyecta como contexto y el modelo formula la consulta Cypher para responder preguntas de negocio.
- Enrutado dentro de una arquitectura multi-experto: al estar entrenado como rol graphrag de MoE-Sovereign, encaja como submodelo que solo se invoca cuando la consulta requiere acceso a grafo, dejando datainfra o precision a otros expertos.
- Automatización de tareas de exploración de datos: generación de consultas de agregación y filtrado sobre Neo4j para informes recurrentes, con validación por ejecución antes de devolver resultados.
- Entorno de investigación sobre RL verificable: sirve como caso de estudio reproducible de GRPO con recompensa de ejecución sobre motores de base de datos, útil para experimentar con especialización por rol.
- Prototipado local en hardware modesto: la variante GGUF Q4_K_M permite desplegar el experto en estaciones de trabajo sin GPU de datacenter para pruebas de integración con Neo4j.

## Benchmarks y rendimiento

Los datos disponibles son recuentos de tareas superadas en un test propio de 109 tareas (35 contra Neo4j 5.26, 38 contra PostgreSQL 17, 36 de precisión), con decodificación greedy y muestreo con semilla 1 respectivamente:

| Modelo / rol | Graphrag (greedy / sampling) | Datainfra | Precision |
|---|---|---|---|
| olmo3-expert-graphrag-7b-v4 | 13 / 9 de 35 | 6 / 5 | 5 / 8 |
| graphrag-v3 (versión anterior) | 9 / 7 de 35 | no disponible | no disponible |

El autor indica que diferencias inferiores a 3 tareas son ruido y que la medición se hizo en bf16 sobre LUMI-G, no sobre el archivo Q4_K_M, cuya evaluación está pendiente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 7B en Q4_K_M el orden de magnitud habitual es de 4-5 GB de pesos más KV cache, pero el autor no publica cifras.
- GPU recomendadas: no disponible; el entrenamiento se realizó en LUMI-G (AMD MI250X), sin datos de inferencia.
- GPU de consumo: no confirmado por el autor; el formato GGUF Q4_K_M sugiere viabilidad en GPU consumer, pero no hay medición publicada.
- Despliegue: llama.cpp u Ollama por el archivo GGUF; transformers para los pesos en formato nativo. vLLM o TGI no están documentados para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo3-expert-graphrag-7b-v4 | 7B | no disponible | Cypher / Neo4j 5 (rol graphrag) | Apache 2.0 | GGUF + transformers |
| allenai/Olmo-3-7B-Instruct | 7B | no disponible | Generalista | Apache 2.0 | transformers |
| graphrag-v3 (versión previa del autor) | 7B | no disponible | Cypher / Neo4j 5 | no disponible | no disponible |

No se dispone de comparación con otros modelos especializados en Cypher en la información proporcionada.

## Limitaciones y advertencias

- Sin contexto de base de conocimiento, el modelo inventa hechos; el autor indica que solo debe usarse con KB en el prompt.
- La especialización degrada el rendimiento en otras tareas; los propios números muestran caídas en datainfra y precision frente a otros roles.
- La medición se hizo en bf16 sobre LUMI-G y no sobre el archivo Q4_K_M publicado, cuya evaluación está pendiente.
- La recompensa de GRPO se ejecutó contra PostgreSQL 16.2 y Neo4j 5.26, mientras que el test se hizo contra PostgreSQL 17; hay desajuste de versiones.
- Muestras pequeñas y un único entrenamiento por modelo: los resultados no son estadísticamente robustos y diferencias menores de 3 tareas se consideran ruido.
- Idiomas limitados a inglés y alemán según los metadatos; no hay evidencia de rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- Riesgo de alucinación en consultas Cypher sintácticamente válidas pero semánticamente incorrectas; se recomienda validación por ejecución antes de usar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3rb3rn/olmo3-expert-graphrag-7b-v4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
