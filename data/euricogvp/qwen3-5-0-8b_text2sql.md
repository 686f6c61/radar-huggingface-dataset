# EuricoGVP/Qwen3.5-0.8B_text2sql

## Resumen

Qwen3.5-0.8B Text-to-SQL es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario EuricoGVP, orientado especificamente a la generacion de consultas SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y, opcionalmente, una pista o descripcion de columnas. El modelo resuelve el problema de la traduccion texto-a-SQL en entornos con recursos limitados, ofreciendo un rendimiento muy superior al de su modelo base en los benchmarks de referencia BIRD y Spider.

Se trata de un modelo causal con codificador de vision (hereda la arquitectura multimodal del Qwen3.5 base), con 852.985.920 parametros reales segun los pesos en safetensors (etiquetado comercialmente como 0.8B) y una dimension oculta de 1024 sobre 24 capas. El ajuste se realizo mediante LoRA con Unsloth (rango y alpha de 16), fusionado posteriormente en los pesos, por lo que no requiere PEFT para su uso. La ventana de contexto evaluada es de 8192 tokens, aunque el entrenamiento se realizo con una longitud maxima de 4096 tokens.

Su relevancia actual radica en que demuestra que un modelo por debajo de los 1000 millones de parametros puede alcanzar un 69,73 % de precision de ejecucion en Spider dev y un 38,20 % en BIRD dev (con descripciones de columna), lo que lo hace viable para despliegues en CPU, GPUs de consumo y entornos edge donde los modelos grandes de texto-a-SQL no son practicos. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; layout oculto 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 852.985.920 (0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens evaluados; 4096 tokens de longitud maxima de entrenamiento |
| Tipos de cuantizacion | no disponible (el autor no especifica cuantizaciones publicadas; los pesos se distribuyen en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers; compatible con vLLM) |
| Dimension oculta | 1024 |
| Numero de capas | 24 |
| Metodo de ajuste | LoRA con Unsloth (rango 16, alpha 16), fusionado en los pesos |
| Precision de entrenamiento | bf16 |
| Alcance del ajuste | solo el modelo de lenguaje; el codificador de vision no se modifico |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base: un transformer causal con codificador de vision y un layout oculto hibrido compuesto por seis bloques repetidos, cada uno con tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, todas con sus correspondientes FFN. Esta combinacion de mecanismos de atencion lineal y atencion completa busca reducir el coste computacional en contextos largos manteniendo la capacidad expresiva. La dimension oculta es de 1024 y el modelo cuenta con 24 capas.

El ajuste fino se realizo con LoRA (rango y alpha de 16) mediante Unsloth, durante una sola epoca, en precision bf16 y con una longitud maxima de 4096 tokens. El adaptador se fusiono en los pesos finales, de modo que el repositorio contiene pesos completos listos para usar con Transformers o vLLM. El conjunto de entrenamiento suma 17.132 ejemplos provenientes de cuatro fuentes: BIRD train (5.980 ejemplos, CC BY-SA 4.0), Spider train sin la base de datos `formula_1` para evitar fuga de datos con BIRD dev (8.097 ejemplos, CC BY-SA 4.0), un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas (2.105 ejemplos, Apache-2.0) y un subconjunto de llmsql-benchmark con columnas que requieren comillas (950 ejemplos, MIT). No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de consultas SQLite unicas a partir de un esquema de base de datos y una pregunta en lenguaje natural.
- Aceptacion opcional de descripciones de columnas y pistas (hints) para mejorar la precision en esquemas complejos.
- Manejo de nombres de tablas y columnas que requieren comillas, gracias a los subconjuntos de entrenamiento especificos.
- Capacidad de contexto largo: evaluado con 8192 tokens, adecuado para esquemas extensos con muchas tablas y columnas.
- Hereda del modelo base la arquitectura con codificador de vision, aunque el ajuste solo afecta al modelo de lenguaje y la tarea objetivo es texto-a-SQL.
- Soporte de generacion de texto conversacional segun la pipeline declarada (text-generation).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explicito en la informacion disponible.
- Capacidad multilingue limitada al ingles (unico idioma declarado).

## Casos de uso

- Asistente de consultas para bases de datos SQLite en aplicaciones de escritorio o moviles: el modelo traduce preguntas de usuario a SQL ejecutable con un peso de 1,7 GB, lo que permite empaquetarlo junto a la base de datos sin depender de la nube.
- Generacion de SQL en pipelines de analitica interna: integrado mediante vLLM o Transformers, puede convertir preguntas de negocio en consultas sobre esquemas conocidos, con un 69,73 % de precision de ejecucion en Spider dev como referencia.
- Herramienta de exploracion de datos para analistas no tecnicos: dado un esquema con descripciones de columna, el modelo aprovecha la variante `desc` (38,20 % EX en BIRD dev) para generar consultas sobre bases de datos con nombres ambiguos.
- Enriquecimiento de entornos de bajo recursos o edge: al tener menos de 1000 millones de parametros, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace adecuado para prototipos y despliegues sin infraestructura dedicada.
- Generacion de SQL como paso previo a la validacion humana: en flujos de revisión, el modelo propone la consulta y un revisor la valida, reduciendo el tiempo de escritura manual en esquemas medianos.
- Formacion y evaluacion de investigacion en texto-a-SQL: sirve como linea base ligera para comparar tecnicas de prompting, descripciones de esquema y ajuste fino en BIRD y Spider, con notebooks de entrenamiento y benchmark publicados por el autor.
- Integracion en asistentes conversacionales sobre bases de datos SQLite: combinado con un orquestador que gestione el contexto de la conversacion, puede generar consultas sucesivas a partir de preguntas encadenadas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) de precision de ejecucion (EX) en porcentaje, comparados con el modelo base Qwen/Qwen3.5-0.8B usando los mismos prompts:

| Benchmark | Base | Este modelo | Solo este modelo correcto | Solo base correcto | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plain | 12,39 | 37,48 | 425 | 40 | 2,52e-82 |
| BIRD dev, desc | 15,32 | 38,20 | 398 | 47 | 2,31e-70 |
| Spider dev | 37,14 | 69,73 | 381 | 44 | 4,36e-68 |

Desglose por dificultad en BIRD dev:

| Metrica | Base, plain | Este modelo, plain | Base, desc | Este modelo, desc |
|---|---:|---:|---:|---:|
| Simple | 17,19 | 45,41 | 21,51 | 46,27 |
| Moderate | 5,17 | 26,94 | 6,03 | 27,59 |
| Challenging | 4,83 | 20,69 | 5,52 | 20,69 |
| Errores de ejecucion | 886 | 382 | 838 | 415 |

En Spider dev, los errores de ejecucion se reducen de 319 a 95. BIRD dev contiene 1.534 preguntas sobre 11 bases de datos y Spider dev 1.034 preguntas sobre 20 bases de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bf16 ocupan aproximadamente 1,7 GB, por lo que la inferencia requiere en torno a 2-3 GB de VRAM incluyendo cache KV y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 4090, A100 o H100; el modelo no aprovecha las GPU de gama alta por su reducido tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con cuantizacion (aunque el autor no publica variantes cuantizadas).
- Opciones de despliegue: Hugging Face Transformers y vLLM son los runtimes explicitamente soportados por el autor; no se documentan integraciones con llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD dev (EX) | Spider dev (EX) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen3.5-0.8B Text-to-SQL (este) | 0,85B | 8192 | 38,20 (desc) | 69,73 | Apache-2.0 | Hugging Face |
| Qwen3.5-2B Text-to-SQL | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (pesos ~4,4 GB) |
| Qwen3.5-4B Text-to-SQL | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (pesos ~9 GB) |
| Qwen3.5-9B Text-to-SQL | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (pesos ~19 GB) |
| Qwen/Qwen3.5-0.8B (base) | 0,85B | no disponible | 15,32 (desc) | 37,14 | no disponible | Hugging Face |

Los modelos hermanos de la misma familia (2B, 4B y 9B) forman parte de la coleccion del autor, pero no se han publicado sus resultados de benchmarks en la informacion disponible. No se dispone de datos de otros modelos comparables de terceros.

## Limitaciones y advertencias

- El modelo solo genera SQL para SQLite; no se ha validado para otros dialectos como PostgreSQL, MySQL o SQL Server.
- Unico idioma declarado: ingles. Las preguntas en castellano u otros idiomas pueden degradar la precision.
- Precision de ejecucion moderada: 38,20 % en BIRD dev (desc) implica que mas de la mitad de las consultas generadas no son correctas en esquemas complejos; no es adecuado para ejecucion automatica sin validacion.
- El rendimiento cae notablemente en preguntas de dificultad moderada y desafiante (26,94 % y 20,69 % en BIRD plain), por lo que los esquemas con joins complejos y subconsultas siguen siendo un punto debil.
- Riesgo de alucinacion de tablas, columnas o funciones SQL inexistentes, especialmente con esquemas que no se hayan visto durante el entrenamiento.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El ajuste se realizo en una sola epoca con 17.132 ejemplos; el modelo puede sobreajustar a los dominios de BIRD, Spider y los subconjuntos de SynSQL y llmsql-benchmark.
- Aunque la licencia es Apache-2.0, los datos de entrenamiento incluyen conjuntos con licencias CC BY-SA 4.0 (BIRD y Spider), lo que puede requerir revision legal para determinados usos comerciales.
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin GPU o con poca memoria.
- El codificador de vision heredado del modelo base no fue ajustado y no se documenta su utilidad para la tarea de texto-a-SQL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-0.8B_text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Coleccion Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Modelo hermano 2B: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql
- Modelo hermano 4B: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql
- Modelo hermano 9B: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql
- Notebooks de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-0.8B_text2sql/tree/main/notebooks
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-0.8B_text2sql/blob/main/LICENSE
