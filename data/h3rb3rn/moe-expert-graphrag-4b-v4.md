# h3rb3rn/moe-expert-graphrag-4b-v4

## Resumen

moe-expert-graphrag-4b-v4 es un modelo especializado de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) desarrollado por el usuario h3rb3rn como componente del sistema "MoE-Sovereign". No se trata de un modelo de propósito general, sino de un experto de dominio orientado a la generación de consultas Cypher para Neo4j 5 dentro de una arquitectura de "compound AI" en la que varios expertos colaboran y el conocimiento factual se delega a una base de conocimiento externa (enfoque KB-first). El modelo parte de Qwen/Qwen3.5-4B, una base de atención híbrida (lineal y completa), y se ajusta mediante SFT con LoRA de rango 32 seguido de 100 pasos de GRPO con una recompensa basada en la ejecución real de las consultas contra Neo4j.

Su relevancia radica en el enfoque de entrenamiento: la recompensa de GRPO no es una preferencia humana ni una métrica de similitud, sino la verificación de ejecución de la consulta generada contra una instancia real de Neo4j 5.26, con crédito parcial proporcional a la cobertura de filas. Esto lo convierte en un caso práctico de RL con verificación de ejecución aplicado a un dominio de infraestructura de datos. El modelo se distribuye en formato GGUF (Q4_K_M) y en pesos transformers, con licencia Apache 2.0, y está pensado para integrarse en pipelines de GraphRAG donde las respuestas factuales provienen de la base de datos y no de los pesos del modelo.

Es importante señalar que el modelo tiene un alcance deliberadamente estrecho: su rol es "graphrag" dentro del sistema, y el propio autor advierte que la especialización degrada el rendimiento en otras tareas. No debe evaluarse como un modelo conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida lineal/completa (heredada de Qwen3.5-4B); ajuste LoRA r32 sobre la base |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | no disponible (el modelo base no se describe como MoE; el término "MoE" del nombre hace referencia al sistema compuesto, no a una arquitectura mezcla de expertos en los pesos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (archivo `moe-expert-graphrag-4b-v4-Q4_K_M.gguf`); pesos base en safetensors (bf16 según la medición del autor) |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, que emplea una arquitectura de atención híbrida que combina capas de atención lineal con capas de atención completa. Sobre esta base se aplica un ajuste SFT para el rol "graphrag-v3" con LoRA de rango 32, seguido de 100 pasos de GRPO (TRL-GRPO) ejecutados en el superordenador LUMI-G. La innovación principal está en la función de recompensa: en lugar de preferencias humanas, la recompensa se calcula verificando la ejecución de la consulta generada contra Neo4j 5.26, con un esquema de crédito parcial de 0 / 0,1 + 0,6 × cobertura de filas / 1,0 según el grado de acierto.

El conjunto de entrenamiento de GRPO consta de 700 tareas procedimentales distribuidas en 3 vocabularios de grafo distintos. El autor subraya explícitamente que el conocimiento factual no reside en los pesos del modelo: el sistema es KB-first y los hechos se recuperan de la base de conocimiento en tiempo de inferencia. La medición reportada se realizó en bf16 sobre LUMI-G, no sobre la cuantización Q4_K_M que se distribuye, y la evaluación de esta última está pendiente según el propio autor.

## Capacidades

- Generación de consultas Cypher para Neo4j 5 en el contexto de un sistema GraphRAG.
- Especialización en el rol "graphrag" dentro de una arquitectura de compound AI con múltiples expertos.
- Soporte de los idiomas inglés y alemán (según los metadatos del modelo).
- Integración en pipelines de recuperación aumentada sobre grafos de conocimiento (KB-first).
- Formato GGUF listo para inferencia local con llama.cpp y variantes compatibles.
- Etiqueta `endpoints_compatible`, lo que indica compatibilidad con endpoints de inferencia estándar.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación de consultas Cypher en producción sobre Neo4j 5: el modelo traduce peticiones en lenguaje natural a consultas Cypher ejecutables, y su entrenamiento con recompensa verificada por ejecución lo hace adecuado para entornos donde la sintaxis correcta es crítica y los errores de consulta rompen pipelines.
- GraphRAG sobre bases de conocimiento corporativas: al integrarse en un sistema KB-first, el modelo formula las consultas de recuperación mientras los hechos provienen de la base de datos, reduciendo el riesgo de alucinación factual en las respuestas finales.
- Automatización de tareas de exploración de grafos: consultas de agregación, filtrado por propiedades y navegación de relaciones sobre esquemas con vocabularios controlados, aprovechando los 3 vocabularios de grafo usados en el entrenamiento.
- Asistente interno para equipos de datos: un experto dedicado que ayuda a analistas a construir consultas Cypher complejas sin memorizar la sintaxis, dentro de un sistema orquestado que enruta cada petición al experto adecuado.
- Despliegue en infraestructura propia con requisitos de soberanía: el tamaño de 4,3 mil millones de parámetros y el formato GGUF Q4_K_M permiten ejecución local en hardware modesto, alineado con el enfoque "sovereign" del sistema del que forma parte.
- Evaluación de pipelines de RL verificados por ejecución: sirve como referencia práctica para investigadores que quieran estudiar cómo una recompensa basada en ejecución real (Neo4j) moldea el comportamiento de un modelo pequeño especializado.

## Benchmarks y rendimiento

El autor reporta una medición sobre un conjunto de 109 tareas propias (35 contra Neo4j 5.26 para el rol graphrag, 38 contra PostgreSQL 17 para datainfra y 36 para precision), con resultado greedy y con muestreo (semilla 1). Los datos son los siguientes:

| Rol / tarea | Greedy (aciertos / total) | Sampling seed 1 (aciertos / total) |
|---|---|---|
| graphrag (Neo4j 5.26) | 26 / 35 | 21 / 35 |
| datainfra (PostgreSQL 17) | 21 / 38 | 21 / 38 |
| precision | 17 / 36 | 15 / 36 |

El autor indica que su predecesor, graphrag-v3, obtuvo 23/35 y 18/35 en el rol graphrag, y advierte que diferencias inferiores a 3 tareas deben considerarse ruido. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La medición se realizó en bf16, no sobre la cuantización Q4_K_M distribuida.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,3 mil millones de parámetros, en bf16 se requieren aproximadamente 8,6 GB solo para pesos, más el KV cache; en Q4_K_M el archivo pesa del orden de 2,5-2,8 GB (el repo completo ocupa 2,8 GB), por lo que la inferencia cuantizada cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para la versión Q4_K_M; para bf16 se recomienda 16 GB o más (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: sí, la cuantización Q4_K_M está pensada para ello; el autor menciona su uso con KV cache q4_0 en el "estándar del pueblo" (Dorf-Standard) de su sistema.
- Opciones de despliegue: llama.cpp y derivados para el GGUF; transformers para los pesos safetensors; vLLM y TGI no están confirmados en la información disponible, aunque la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moe-expert-graphrag-4b-v4 | 4,3 mil millones | no disponible | Cypher / Neo4j 5 (GraphRAG) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-4B (base) | 4 mil millones (aprox.) | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Alternativas especializadas en Cypher/GraphRAG de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en generación de Cypher en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- El propio autor advierte que, sin contexto de la base de conocimiento, el experto inventa hechos; debe usarse únicamente con contexto KB.
- La especialización degrada el rendimiento en otras tareas (roles datainfra y precision muestran resultados inferiores), por lo que no es adecuado como modelo generalista.
- La medición reportada se hizo en bf16 sobre LUMI-G, no sobre la cuantización Q4_K_M distribuida; la evaluación de esta última está pendiente y podría diferir.
- La recompensa de GRPO se ejecutó contra PostgreSQL 16.2 y Neo4j 5.26, mientras que el test se ejecutó contra PostgreSQL 17; posibles discrepancias de versión no están evaluadas.
- Las muestras de evaluación son pequeñas y hay un solo entrenamiento por modelo; el autor considera ruido cualquier diferencia inferior a 3 tareas.
- El modelo solo declara soporte de inglés y alemán; no se garantiza un comportamiento correcto en castellano.
- Riesgo de alucinación en la generación de consultas: aunque la recompensa verifica ejecución, consultas sintácticamente válidas pueden devolver resultados semánticamente incorrectos.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-4B hereda los sesgos de su base y de los datos de entrenamiento, no caracterizados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Qwen3.5-4B, no detalladas en la información proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/h3rb3rn/moe-expert-graphrag-4b-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
