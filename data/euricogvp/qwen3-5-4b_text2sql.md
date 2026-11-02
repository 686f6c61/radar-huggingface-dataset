# EuricoGVP/Qwen3.5-4b_text2sql

## Resumen

Qwen3.5-4B Text-to-SQL es un ajuste fino supervisado del modelo multimodal Qwen/Qwen3.5-4B, publicado por el desarrollador independiente EuricoGVP. Su proposito es transformar una pregunta en lenguaje natural, junto con un esquema de base de datos SQLite y una pista opcional, en una unica consulta SQL ejecutable. El modelo resuelve el problema clasico de text-to-SQL en entornos reales, donde los esquemas son extensos, los nombres de columnas requieren comillas y las consultas anidadas son frecuentes.

El ajuste se realizo con LoRA (rango y alpha de 16) mediante Unsloth, fusionando despues el adaptador en los pesos completos, de modo que el artefacto publicado es un modelo Transformers estandar compatible con vLLM y con PEFT innecesario. El modelo conserva la arquitectura hibrida del Qwen3.5-4B original, con 4.539 millones de parametros, 32 capas y una dimension oculta de 2560, e incorpora un codificador de vision heredado del modelo base que no fue modificado durante el entrenamiento.

La relevancia de esta ficha radica en que demuestra que un ajuste de una sola epoca sobre 17.132 ejemplos puede elevar la exactitud de ejecucion en BIRD dev de 46,22 a 54,76 (esquema plano) y en Spider dev de 77,08 a 81,82, con errores de ejecucion reducidos de 246 a 80 en BIRD. Es un caso practico de especializacion de bajo coste sobre un modelo de 4B con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con encoder de vision (Gated DeltaNet + Gated Attention) |
| Parametros totales | 4.539.265.536 (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens evaluados; 4.096 tokens de longitud maxima de entrenamiento |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers; adaptador LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida de 32 capas con disposicion 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), dimension oculta de 2560 y un codificador de vision que en este ajuste permanece congelado. El ajuste fino se aplico exclusivamente al modelo de lenguaje mediante LoRA con rango 16 y alpha 16, una epoca, precision bf16 y una longitud maxima de entrenamiento de 4096 tokens. El adaptador resultante se fusiono en los pesos, por lo que el repositorio contiene un modelo denso listo para inferencia sin PEFT.

El conjunto de entrenamiento suma 17.132 ejemplos procedentes de cuatro fuentes: BIRD train (5.980 ejemplos, CC BY-SA 4.0), Spider train sin la base `formula_1` (8.097, CC BY-SA 4.0), un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas (2.105, Apache-2.0) y un subconjunto de llmsql-benchmark con columnas que requieren comillas (950, MIT). No se documenta uso de RLHF ni DPO; el entrenamiento es supervisado sobre pares pregunta-esquema-SQL. La innovacion destacable es la combinacion de datos sinteticos con contexto largo y ejemplos de citado de identificadores, orientada a reducir errores de ejecucion en esquemas reales.

## Capacidades

- Generacion de consultas SQLite a partir de esquema, pregunta y pista opcional.
- Manejo de esquemas con descripciones de columnas (variante `desc`) y sin ellas (variante `plain`).
- Generacion de SQL con identificadores entre comillas cuando los nombres de columnas o tablas lo requieren.
- Consultas anidadas y de dificultad alta (Spider extra: 59,64 EX; BIRD challenging: 38,62 EX en plano).
- Contexto largo para esquemas extensos, con evaluacion a 8.192 tokens.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque el ajuste se centra en texto.
- Generacion conversacional y de texto general, heredada del modelo base.
- No se documenta soporte explicito de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas de negocio a SQLite sobre un esquema dado, reduciendo el tiempo de escritura manual de consultas en equipos con bases de datos de tamano medio.
- Integracion en herramientas de BI y paneles internos: un cuadro de texto libre permite al usuario formular preguntas y el modelo devuelve la consulta ejecutable, con la ventaja de que su contexto de 8.192 tokens admite esquemas con decenas de tablas.
- Generacion de SQL en pipelines de datos: el modelo puede producir consultas de transformacion o extraccion que se validan y ejecutan en un paso posterior, aprovechando la baja tasa de errores de ejecucion observada en BIRD (80 frente a 246 del base).
- Educacion y formacion en SQL: sirve como generador de ejemplos y de soluciones de referencia sobre esquemas didacticos, con la posibilidad de comparar la consulta del alumno con la generada.
- Prototipado rapido de interfaces de lenguaje natural sobre bases de datos: al ser un modelo de 4B con licencia Apache-2.0, puede desplegarse en infraestructura propia para validar productos de consulta conversacional antes de invertir en modelos mayores.
- Preprocesamiento en pipelines de agentes: el modelo actua como componente especializado que convierte intenciones en SQL, delegando la ejecucion y la validacion a otras capas del sistema.
- Migracion y auditoria de consultas: dado un esquema y una pregunta, el modelo genera la consulta esperada, lo que facilita comparar implementaciones existentes y detectar discrepancias.

## Benchmarks y rendimiento

Resultados de exactitud de ejecucion (EX) en porcentaje, declarados por el autor y no verificados de forma independiente.

| Benchmark | Base | Este modelo | Solo este correcto | Solo base correcto | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plano | 46,22 | 54,76 | 230 | 99 | 3,75e-13 |
| BIRD dev, desc | 46,28 | 56,19 | 245 | 93 | 6,34e-17 |
| Spider dev | 77,08 | 81,82 | 95 | 46 | 4,49e-05 |

BIRD dev (1.534 preguntas, 11 bases de datos):

| Metrica | Base plano | Modelo plano | Base desc | Modelo desc |
|---|---:|---:|---:|---:|
| Simple | 54,49 | 61,08 | 53,19 | 62,27 |
| Moderate | 35,56 | 47,20 | 37,93 | 48,28 |
| Challenging | 27,59 | 38,62 | 28,97 | 42,76 |
| Errores de ejecucion | 246 | 80 | 223 | 76 |

Spider dev (1.034 preguntas, 20 bases de datos):

| Metrica | Base | Modelo |
|---|---:|---:|
| Easy | 90,73 | 92,34 |
| Medium | 82,96 | 87,22 |
| Hard | 67,82 | 74,14 |
| Extra | 50,60 | 59,64 |
| Errores de ejecucion | 26 | 28 |

Comparativa dentro de la familia:

| Modelo | BIRD plano | BIRD desc | Spider dev |
|---|---:|---:|---:|
| Qwen3.5-4B base | 46,22 | 46,28 | 77,08 |
| Qwen3.5-4B fine-tuned | 54,76 | 56,19 | 81,82 |
| Qwen3.5-9B base | 51,11 | 52,09 | 77,27 |
| Qwen3.5-9B fine-tuned | 57,17 | 59,32 | 82,01 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16 con contexto completo; RTX 3090 (24 GB) tambien es viable.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con margen limitado; en GPUs de 8 GB requeriria cuantizacion, no documentada oficialmente.
- Opciones de despliegue: Hugging Face Transformers y vLLM segun la model card; llama.cpp y Ollama no estan documentados para estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD dev (plano) | Spider dev | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen3.5-4B Text-to-SQL (este) | 4B | 8.192 | 54,76 | 81,82 | Apache-2.0 | Hugging Face |
| Qwen3.5-9B Text-to-SQL | 9B | No disponible | 57,17 | 82,01 | No disponible | Hugging Face |
| Qwen3.5-4B base | 4B | No disponible | 46,22 | 77,08 | No disponible | Hugging Face |
| Qwen3.5-9B base | 9B | No disponible | 51,11 | 77,27 | No disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo solo genera SQL para SQLite; no se documenta soporte para PostgreSQL, MySQL u otros dialectos.
- Entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta medido.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El ajuste se realizo en una sola epoca sobre 17.132 ejemplos; el riesgo de sobreajuste a los estilos de BIRD y Spider es plausible y no se ha cuantificado.
- La tasa de errores de ejecucion en Spider dev aumenta ligeramente (de 26 a 28) pese a la mejora en exactitud, lo que indica que el modelo puede generar consultas sintacticamente validas pero incorrectas en algunos casos.
- Riesgo de alucinacion de tablas o columnas inexistentes en esquemas no vistos; se recomienda validacion contra el esquema antes de ejecutar en produccion.
- El codificador de vision no fue ajustado, por lo que las capacidades multimodales no estan especializadas para text-to-SQL.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen licencias CC BY-SA 4.0, Apache-2.0 y MIT, lo que conviene revisar segun el uso previsto.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano 9B: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql
- Coleccion Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Notebooks de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql/tree/main/notebooks
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql/blob/main/LICENSE
