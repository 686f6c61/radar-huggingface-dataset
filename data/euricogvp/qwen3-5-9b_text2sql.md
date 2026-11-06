# EuricoGVP/Qwen3.5-9b_text2sql

## Resumen

Qwen3.5-9b_text2sql es un ajuste fino del modelo Qwen/Qwen3.5-9B, desarrollado por EuricoGVP, especializado en la generacion de consultas SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y, opcionalmente, una pista o descripcion de columnas. El modelo resuelve el problema de la traduccion text-to-SQL en entornos donde se requiere una unica consulta ejecutable, con especial enfasis en reducir los errores de ejecucion respecto al modelo base.

El modelo parte de una arquitectura causal con codificador de vision (herencia del Qwen3.5-9B original), con 9.409.813.744 parametros totales, 32 capas, dimension oculta de 4096 y una disposicion hibrida de 8 bloques que combinan Gated DeltaNet y Gated Attention. El ajuste fino se realizo mediante LoRA con Unsloth (rango y alpha de 16, una epoca, precision bf16) fusionado directamente en los pesos, de modo que no se requiere PEFT para su uso.

Es relevante ahora porque ofrece una mejora medible y estadisticamente significativa sobre el modelo base en los dos benchmarks de referencia del text-to-SQL (BIRD y Spider), con incrementos de entre 4,7 y 7,2 puntos porcentuales en exactitud de ejecucion y una reduccion sustancial de errores de ejecucion, manteniendo una licencia Apache-2.0 permisiva y compatibilidad con Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; layout hibrido 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenamiento: 4.096 tokens; evaluacion: 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B: un transformer causal con codificador de vision, 32 capas, dimension oculta de 4096 y una disposicion hibrida que intercala bloques de Gated DeltaNet (atencion lineal) con bloques de Gated Attention en un patron de 8 repeticiones de 3 bloques DeltaNet seguidos de 1 bloque de atencion. El ajuste fino se aplico exclusivamente al modelo de lenguaje; el codificador de vision no se modifico. El entrenamiento uso LoRA con Unsloth (rango 16, alpha 16, una epoca, precision bf16), fusionado posteriormente en los pesos finales.

El conjunto de entrenamiento suma 17.132 ejemplos procedentes de cuatro fuentes: BIRD train (5.980 ejemplos, CC BY-SA 4.0), Spider train sin la base de datos `formula_1` (8.097 ejemplos, CC BY-SA 4.0), un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas (2.105 ejemplos, Apache-2.0) y un subconjunto de llmsql-benchmark con columnas que requieren comillas (950 ejemplos, MIT). La longitud maxima de entrenamiento fue de 4.096 tokens y la evaluacion se realizo con 8.192 tokens de contexto. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de una unica consulta SQLite a partir de un esquema de base de datos y una pregunta en lenguaje natural.
- Aceptacion opcional de descripciones de columnas (variante `desc`) ademas del esquema plano, con mejora de exactitud.
- Aceptacion opcional de pistas (hints) en la entrada.
- Reduccion de errores de ejecucion SQL respecto al modelo base (de 143 a 48 en BIRD plain, de 136 a 60 en BIRD desc, de 18 a 14 en Spider dev).
- Capacidad de razonamiento y generacion de texto heredada del modelo base Qwen3.5-9B.
- Capacidad multimodal heredada (image-text-to-text) por el codificador de vision del modelo base, aunque el ajuste fino se centra en text-to-SQL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (`en`) segun la model card.

## Casos de uso

- Asistentes de consulta sobre bases de datos SQLite: el modelo traduce preguntas de negocio en lenguaje natural a consultas ejecutables, lo que permite a usuarios no tecnicos interrogar bases de datos sin conocer SQL.
- Generacion de SQL en herramientas de analitica interna: integrado en un pipeline que recibe el esquema de la base de datos y la pregunta del analista, el modelo devuelve una consulta lista para ejecutar, reduciendo el tiempo de escritura manual.
- Enriquecimiento de esquemas con descripciones: la variante `desc` aprovecha descripciones de columnas para mejorar la exactitud (59,32 % frente a 57,17 % en BIRD dev), util en bases de datos documentadas.
- Evaluacion y benchmarking de text-to-SQL: sirve como modelo de referencia ajustado para comparar con otros enfoques en BIRD y Spider, dado que publica resultados por nivel de dificultad.
- Generacion de consultas en entornos con nombres de columnas que requieren comillas: el entrenamiento incluye subconjuntos de SynSQL-2.5M y llmsql-benchmark especificamente seleccionados para este caso.
- Automatizacion de informes ad hoc: el modelo puede generar consultas de agregacion y filtrado sobre esquemas conocidos, adecuado para tareas de reporteria puntual donde se requiere una unica consulta correcta.
- Prototipado de interfaces de lenguaje natural a base de datos: por su tamano (9B) y licencia Apache-2.0, puede desplegarse en infraestructura propia para validar productos de consulta conversacional.

## Benchmarks y rendimiento

Resultados declarados por el autor (exactitud de ejecucion, EX, en porcentaje), comparados con Qwen/Qwen3.5-9B usando los mismos prompts. BIRD dev: 1.534 preguntas sobre 11 bases de datos. Spider dev: 1.034 preguntas sobre 20 bases de datos.

| Benchmark | Base | Este modelo | Solo este correcto | Solo base correcto | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plain | 51,11 | 57,17 | 201 | 108 | 1,35e-07 |
| BIRD dev, desc | 52,09 | 59,32 | 221 | 110 | 1,04e-09 |
| Spider dev | 77,27 | 82,01 | 96 | 47 | 5,10e-05 |

Desglose por dificultad en BIRD (dev):

| Metrica | Base plain | Este plain | Base desc | Este desc |
|---|---:|---:|---:|---:|
| Simple | 57,51 | 62,70 | 59,46 | 65,08 |
| Moderate | 42,46 | 51,29 | 41,81 | 52,80 |
| Challenging | 37,93 | 40,69 | 37,93 | 43,45 |
| Errores de ejecucion | 143 | 48 | 136 | 60 |

Desglose por dificultad en Spider (dev):

| Metrica | Base | Este modelo |
|---|---:|---:|
| Easy | 91,13 | 93,95 |
| Medium | 83,18 | 88,12 |
| Hard | 66,67 | 72,99 |
| Extra | 51,81 | 57,23 |
| Errores de ejecucion | 18 | 14 |

Comparativa dentro de la familia:

| Modelo | BIRD plain | BIRD desc | Spider dev |
|---|---:|---:|---:|
| Qwen3.5-4B base | 46,22 | 46,28 | 77,08 |
| Qwen3.5-4B fine-tuned | 54,76 | 56,19 | 81,82 |
| Qwen3.5-9B base | 51,11 | 52,09 | 77,27 |
| Qwen3.5-9B fine-tuned | 57,17 | 59,32 | 82,01 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bf16 ocupan aproximadamente 19 GB (tamano del repo: 18,8 GB), por lo que se requiere al menos 20-24 GB de VRAM para cargar el modelo en bf16.
- Cuantizacion: la informacion disponible no detalla tipos de cuantizacion publicados; el modelo se distribuye en safetensors, por lo que la cuantizacion a 8 o 4 bits requeriria conversion propia.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; en GPUs consumer de 24 GB el modelo cabe en bf16 al limite.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB seria necesaria cuantizacion (no disponible oficialmente).
- Opciones de despliegue: Transformers y vLLM (compatibilidad declarada por el autor). Otros motores como llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD dev (plain) | Spider dev | Licencia |
|---|---:|---|---:|---:|---|
| Qwen3.5-9b_text2sql (este) | 9,41B | 8.192 tokens (evaluacion) | 57,17 | 82,01 | Apache-2.0 |
| Qwen3.5-4b_text2sql | ~4B | no disponible | 54,76 | 81,82 | Apache-2.0 |
| Qwen3.5-9B (base) | ~9B | no disponible | 51,11 | 77,27 | Apache-2.0 |
| Qwen3.5-4B (base) | ~4B | no disponible | 46,22 | 77,08 | Apache-2.0 |

La comparativa se limita a la familia Qwen3.5 porque la informacion proporcionada no incluye resultados de otros modelos text-to-SQL externos.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles (`en`); no se garantiza su rendimiento en otros idiomas.
- La generacion se limita a una unica consulta SQLite por peticion; no se documenta soporte para otros dialectos SQL (PostgreSQL, MySQL, etc.).
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (campo `verified: false` en el model-index).
- La longitud de contexto de entrenamiento es de 4.096 tokens, aunque la evaluacion se realizo con 8.192; esquemas muy extensos podrian degradar el rendimiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede generar tablas o columnas inexistentes en el esquema, aunque el ajuste reduce los errores de ejecucion.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al heredar el modelo base, podria arrastrar sesgos de este.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de entrenamiento tienen licencias propias (CC BY-SA 4.0, Apache-2.0, MIT) que conviene revisar si se redistribuye el modelo o se derivan obras.
- El codificador de vision no fue ajustado; las capacidades multimodales no estan validadas para text-to-SQL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano (4B): https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql
- Coleccion Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Cuadernos de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql/tree/main/notebooks
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql/blob/main/LICENSE
