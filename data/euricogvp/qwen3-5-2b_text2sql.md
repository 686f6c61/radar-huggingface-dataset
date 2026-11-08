# EuricoGVP/Qwen3.5-2B_text2sql

## Resumen

Qwen3.5-2B_text2sql es un ajuste fino del modelo base Qwen/Qwen3.5-2B orientado a la generacion de consultas SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y, opcionalmente, una pista o descripcion de columnas. Lo desarrolla el usuario EuricoGVP y se publica bajo licencia Apache 2.0, con pesos completos en formato Transformers (el adaptador LoRA ya esta fusionado en los pesos, por lo que no requiere PEFT).

El modelo resuelve el problema clasico de text-to-SQL en el contexto de bases de datos SQLite, un escenario habitual en herramientas de analitica y asistentes de datos. Su relevancia radica en que, con solo 2.213 millones de parametros, mejora de forma notable al modelo base en los benchmarks de referencia: pasa de 25,68 a 43,16 de execution accuracy en BIRD dev con esquema plano y de 57,93 a 73,98 en Spider dev.

Arquitectonicamente hereda el diseno hibrido de Qwen3.5, que combina capas de atencion lineal tipo Gated DeltaNet con capas de atencion completa (Gated Attention), e incluye un codificador de vision que en este ajuste no se ha modificado. El entrenamiento se realizo con LoRA (rango 16, alpha 16) durante una epoca en bf16, con una longitud maxima de 4.096 tokens durante el entrenamiento y evaluacion a 8.192 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; layout hibrido 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; 8.192 tokens evaluados |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer causal con un layout hibrido de 24 capas y dimension oculta de 2.048. La estructura intercala bloques de atencion lineal (Gated DeltaNet) con bloques de atencion completa (Gated Attention) en un patron de 6 repeticiones de 3 capas DeltaNet mas 1 capa de atencion completa. Incluye ademas un codificador de vision, aunque en este ajuste fino solo se entreno la parte del modelo de lenguaje.

El ajuste se realizo con LoRA mediante Unsloth, con rango 16 y alpha 16, una sola epoca, precision bf16 y longitud maxima de 4.096 tokens. El adaptador se fusiono posteriormente en los pesos completos. El conjunto de entrenamiento suma 17.132 ejemplos: 5.980 de BIRD train, 8.097 de Spider train (excluyendo la base de datos `formula_1`, presente tambien en BIRD dev para evitar filtracion), 2.105 de un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas, y 950 de un subconjunto de llmsql-benchmark con columnas que requieren comillas. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de consultas SQLite a partir de esquema, pregunta en lenguaje natural y pista opcional.
- Acepta variantes de entrada con esquema plano o con descripciones de columnas, con mejor rendimiento en la segunda.
- Capacidad de manejar nombres de tablas y columnas que requieren comillas, gracias al subconjunto especifico incluido en el entrenamiento.
- Manejo de contexto largo dentro del ambito text-to-SQL (hasta 8.192 tokens evaluados).
- Modelo multimodal en origen (image-text-to-text), aunque el ajuste se centra en la parte de lenguaje; el codificador de vision no se entreno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Asistentes de analitica conversacional: el modelo traduce preguntas de negocio en consultas SQLite ejecutables sobre esquemas conocidos, con un execution accuracy del 73,98% en Spider dev que lo hace viable para prototipos y herramientas internas.
- Generacion de SQL en pipelines de datos: puede integrarse en flujos que reciben un esquema y una pregunta y devuelven la consulta para su ejecucion y validacion automatica, reduciendo la tasa de errores de ejecucion (de 160 a 73 en Spider dev respecto al base).
- Herramientas de BI con esquemas documentados: la variante con descripciones de columnas alcanza 45,11 de EX en BIRD dev, por lo que encaja en entornos donde el catalogo de datos incluye comentarios por columna.
- Educacion y formacion en SQL: util para generar ejemplos de consultas a partir de preguntas y esquemas, con la ventaja de un modelo pequeno que se puede desplegar en local.
- Automatizacion de informes ad hoc: dado un esquema SQLite de una aplicacion, el modelo puede responder preguntas puntuales de usuarios sin intervencion manual, especialmente en bases de datos de dificultad facil y media (91,13 y 77,80 de EX en Spider dev).
- Preprocesado en pipelines de agentes: como primer paso de generacion de consultas antes de una validacion o correccion posterior por un modelo mayor, aprovechando su bajo coste computacional.
- Despliegue en entornos con recursos limitados: al tener 2B de parametros y pesos de aproximadamente 4,4 GB, puede ejecutarse en GPUs de consumo para tareas de generacion de SQL en local.

## Benchmarks y rendimiento

Resultados declarados por el autor (execution accuracy en porcentaje, mismos prompts para base y ajuste):

| Benchmark | Base | Este modelo | Solo este modelo correcto | Solo base correcto | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plain | 25,68 | 43,16 | 344 | 76 | 8,43e-42 |
| BIRD dev, desc | 26,73 | 45,11 | 354 | 72 | 8,42e-46 |
| Spider dev | 57,93 | 73,98 | 241 | 75 | 1,83e-21 |

Desglose por dificultad en BIRD dev:

| Metrica | Base plain | Modelo plain | Base desc | Modelo desc |
|---|---:|---:|---:|---:|
| Simple | 32,76 | 51,24 | 34,81 | 54,81 |
| Moderate | 15,95 | 32,54 | 16,16 | 32,11 |
| Challenging | 11,72 | 25,52 | 8,97 | 24,83 |
| Errores de ejecucion | 579 | 185 | 569 | 205 |

Desglose por dificultad en Spider dev:

| Metrica | Base | Este modelo |
|---|---:|---:|
| Easy | 74,60 | 91,13 |
| Medium | 61,88 | 77,80 |
| Hard | 40,80 | 65,52 |
| Extra | 40,36 | 46,99 |
| Errores de ejecucion | 160 | 73 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,4 GB de pesos mas overhead de activaciones y cache KV; en la practica se recomienda al menos 6-8 GB para contexto corto y mas para contextos de 8.192 tokens.
- En cuantizacion de 8 bits o 4 bits el modelo se reduce a unos 2,2 GB o 1,1 GB respectivamente, aunque la informacion disponible no detalla cuantizaciones oficiales publicadas.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB), A100 o H100 ofrecen margen sobrado; el modelo cabe tambien en GPUs de consumo con 8 GB o mas.
- Opciones de despliegue: Transformers y vLLM son compatibles segun la model card; llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BIRD plain | BIRD desc | Spider dev | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Qwen3.5-2B_text2sql (este) | 2B | 8.192 (evaluado) | 43,16 | 45,11 | 73,98 | Apache 2.0 |
| Qwen3.5-4B_text2sql | 4B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |
| Qwen3.5-9B_text2sql | 9B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |
| Qwen3.5-2B base | 2B | no disponible | 25,68 | 26,73 | 57,93 | Apache 2.0 |

Los modelos hermanos de 4B y 9B pertenecen a la misma coleccion del autor, pero la informacion disponible no incluye sus resultados de benchmarks ni su contexto, por lo que no se pueden comparar numericamente.

## Limitaciones y advertencias

- El modelo solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- El ambito esta limitado a SQLite: no se ha entrenado ni evaluado para otros dialectos SQL (PostgreSQL, MySQL, etc.).
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en la model-index).
- Aunque los errores de ejecucion se reducen, siguen existiendo (185 en BIRD plain, 73 en Spider dev), por lo que en produccion conviene validar y ejecutar las consultas antes de usarlas.
- El modelo puede alucinar tablas o columnas no presentes en el esquema; no hay informacion sobre sesgos especificos.
- La licencia Apache 2.0 permite uso comercial, pero los datasets de entrenamiento tienen licencias propias (CC BY-SA 4.0, Apache-2.0, MIT) que conviene revisar si se redistribuye el modelo o datos derivados.
- El codificador de vision no se entreno, por lo que las capacidades multimodales heredadas no estan adaptadas a esta tarea.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre latencia en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo hermano 4B: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql
- Modelo hermano 9B: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql
- Coleccion Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Notebooks de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql/tree/main/notebooks
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql/blob/main/LICENSE
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
