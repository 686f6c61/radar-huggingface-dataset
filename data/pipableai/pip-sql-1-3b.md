# PipableAI/pip-sql-1.3b

## Resumen

pip-sql-1.3b es un modelo de generacion de SQL a partir de lenguaje natural (text-to-SQL) desarrollado por PipableAI. Con 1.346.471.936 parametros, esta construido sobre una base DeepSeek y afinado especificamente para traducir preguntas en ingles a consultas SQL ejecutables, tomando como entrada un esquema de base de datos y una pregunta formulada en lenguaje natural. Su proposito es resolver el problema de la generacion automatica de consultas SQL correctas sobre esquemas arbitrarios, una tarea critica en herramientas de analitica, asistentes de datos y pipelines ETL.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribucion mas alla de las habituales. Segun la model card, supera a sqlcoder-7b-2, sqlcoder-7b y GPT-3.5 en varios subconjuntos del benchmark Spider (evaluado con el framework de test suites destiladas de Yale y Berkeley), a pesar de tener un tamano mucho menor que sus competidores.

La relevancia actual del modelo radica en su relacion tamano/rendimiento: con solo 1.3B parametros ofrece resultados competitivos en la tarea text-to-SQL, lo que lo hace desplegable en hardware modesto. El formato de prompt es estructurado (`<schema>...</schema><question>...</question><sql>`), lo que facilita su integracion en pipelines automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base DeepSeek, familia Llama) |
| Parametros totales | 1.346.471.936 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporte de cuantizacion via herramientas externas como llama.cpp/GGUF no confirmado en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, Flax/JAX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1.3B parametros construido sobre una base DeepSeek (etiquetado como `llama` en los tags de Hugging Face). Se trata de un modelo destilado y afinado por instrucciones para la tarea text-to-SQL. El entrenamiento combino softmax cross entropy con una forma modificada de policy gradient y Q loss, optimizados en un esquema de expectation-maximization (EM). La model card incluye una grafica del comportamiento de la perdida en dicho esquema, pero no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de referenciar `PipableAI/pip-txt-to-sql-spider-bird-dataset`.

El dataset de entrenamiento referenciado combina datos de los benchmarks Spider y Bird, orientados a text-to-SQL cross-domain. No se especifica en la informacion disponible si hubo fases de RLHF o DPO, ni detalles sobre atencion lineal, decodificacion especulativa u otras innovaciones arquitectonicas mas alla del esquema de optimizacion EM mencionado.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural y un esquema de base de datos proporcionado en el prompt.
- Formato de prompt estructurado con etiquetas XML: `<schema>...</schema><question>...</question><sql>`.
- Generacion de texto autoregresiva (pipeline `text-generation`).
- Soporte de inferencia en PyTorch y Flax/JAX.
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles.
- Capacidad conversacional (tag `conversational`).
- Modelo afinado por instrucciones (`instruction_tuned`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes de analitica conversacional: el modelo recibe el esquema de la base de datos y la pregunta del usuario en lenguaje natural y devuelve una consulta SQL ejecutable, adecuado para integrarse en interfaces de chat sobre bases de datos relacionales.
- Generacion de consultas en herramientas de BI: dado un esquema conocido (por ejemplo, tablas de ventas, clientes o inventario), el modelo traduce preguntas como "que productos tienen un precio superior a la media" a SQL con subconsultas, como se muestra en los ejemplos de la model card.
- Automatizacion de pipelines ETL: el modelo puede generar transformaciones SQL a partir de descripciones en lenguaje natural, reduciendo el trabajo manual en la definicion de consultas de extraccion y transformacion.
- Educacion y asistencia a analistas: sirve como ayuda para que analistas menos expertos en SQL formulen consultas sobre esquemas complejos, con el modelo generando el SQL a partir de la descripcion del objetivo.
- Prototipado rapido de APIs de datos: al ser un modelo de 1.3B, puede desplegarse en infraestructura modesta para construir endpoints que conviertan preguntas en consultas sobre bases de datos de produccion.
- Generacion de consultas sobre esquemas desconocidos: al aceptar el esquema como parte del prompt, el modelo puede adaptarse a nuevas bases de datos sin reentrenamiento, util en entornos multi-tenant o con esquemas que cambian con frecuencia.
- Evaluacion y benchmarking interno: el modelo puede usarse como baseline ligero en tareas text-to-SQL para comparar con modelos mayores en coste y latencia.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el framework de evaluacion Semantic Evaluation for Text-to-SQL with Distilled Test Suites (Spider/SParC/CoSQL, 2200 puntos de test):

| Modelo | easy | medium | hard | extra |
|---|---|---|---|---|
| sqlcoder-7b-2 | 72.0 | 58.0 | 40.6 | 37.3 |
| pipSQL-1.3b | 78.5 | 57.5 | 42.1 | 28.3 |
| sqlcoder-7b | 60.6 | 48.2 | 28.3 | 20.4 |
| gpt-3.5 | 58.8 | 44.7 | 31.0 | 28.4 |

La model card menciona tambien resultados en el benchmark Defog SQL-Eval (200 puntos de test seleccionados por el equipo de Defog), presentados como imagen sin cifras textuales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 2.7 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 6-8 GB de VRAM para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1.5-2 GB para pesos; en 4 bits: en torno a 1 GB para pesos (estimaciones derivadas del numero de parametros, no confirmadas en la informacion).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) deberia poder ejecutar el modelo; para produccion, A100 o H100 no son necesarias por el reducido tamano, aunque ofrecen mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 6-8 GB o mas.
- Opciones de despliegue: transformers (PyTorch y Flax/JAX), text-generation-inference (TGI) segun los tags, y endpoints compatibles. El soporte de llama.cpp, Ollama o vLLM no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento Spider (easy/medium/hard/extra) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pip-sql-1.3b | 1.3B | no disponible | 78.5 / 57.5 / 42.1 / 28.3 | Apache 2.0 | Hugging Face |
| sqlcoder-7b-2 | 7B | no disponible | 72.0 / 58.0 / 40.6 / 37.3 | no disponible en la informacion | Hugging Face |
| sqlcoder-7b | 7B | no disponible | 60.6 / 48.2 / 28.3 / 20.4 | no disponible en la informacion | Hugging Face |
| GPT-3.5 | no disponible | no disponible | 58.8 / 44.7 / 31.0 / 28.4 | propietaria | API |

pip-sql-1.3b obtiene el mejor resultado en el subconjunto easy y supera a sqlcoder-7b-2 en hard, aunque queda por debajo en medium y extra. Frente a GPT-3.5, supera en easy, medium y hard, y queda ligeramente por debajo en extra.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); las preguntas en otros idiomas pueden degradar la calidad del SQL generado.
- Riesgo de alucinacion: puede generar SQL sintacticamente valido pero semanticamente incorrecto, o referenciar columnas/tablas inexistentes si el esquema no esta bien delimitado en el prompt.
- Rendimiento inferior en el subconjunto `extra` del benchmark Spider (28.3) frente a sqlcoder-7b-2 (37.3) y GPT-3.5 (28.4), lo que sugiere dificultades en consultas de alta complejidad.
- No se documentan sesgos especificos, pero al entrenarse sobre datasets de benchmarks (Spider, Bird) puede heredar sesgos de dominio y no generalizar bien a esquemas muy alejados de la distribucion de entrenamiento.
- La longitud de contexto no esta documentada, lo que limita la planificacion para esquemas de base de datos muy extensos.
- No se confirma soporte de tool calling ni de agentes multi-paso; el modelo esta disenado para una unica generacion SQL por prompt.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del modelo base DeepSeek y de los datasets de entrenamiento para cumplir con sus terminos.
- El repo ocupa 21.5 GB, lo que sugiere la presencia de multiples formatos de pesos (PyTorch y Flax) y puede complicar el despliegue en entornos con espacio limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PipableAI/pip-sql-1.3b
- README del modelo: https://huggingface.co/PipableAI/pip-sql-1.3b/blob/main/README.md
- Modelo relacionado (pip-library-etl-1.3b): https://huggingface.co/PipableAI/pip-library-etl-1.3b
- Dataset de entrenamiento: https://huggingface.co/datasets/PipableAI/pip-txt-to-sql-spider-bird-dataset
- Cuaderno Colab: https://colab.research.google.com/drive/1insSxvc3jjAXe0zmdIjmbG3ttb5mpRgQ?usp=sharing
- Framework de evaluacion Test Suite SQL Eval: https://github.com/taoyds/test-suite-sql-eval
- Framework de evaluacion Defog SQL-Eval: https://github.com/defog-ai/sql-eval
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/pip-sql-13b-pipableai
- LinkedIn de PipableAI: https://www.linkedin.com/company/pipable.ai/about/
