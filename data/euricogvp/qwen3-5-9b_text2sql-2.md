# EuricoGVP/Qwen3.5-9B_text2sql

## Resumen

Qwen3.5-9B Text-to-SQL es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario EuricoGVP, especializado en la generación de consultas SQL para SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y, opcionalmente, una pista (hint). El modelo resuelve el problema de la traducción automática de lenguaje natural a SQL (text-to-SQL), una tarea crítica para interfaces de consulta en lenguaje natural sobre bases de datos relacionales.

El ajuste se realizó mediante LoRA (rango 16, alpha 16) con Unsloth durante una época, fusionando posteriormente el adaptador en los pesos completos, de modo que no requiere PEFT para su uso. El modelo conserva la arquitectura del Qwen3.5-9B base, que combina capas de Gated DeltaNet y Gated Attention en un diseño híbrido, con 9.409.813.744 parámetros totales y una dimensión oculta de 4096 en 32 capas. El contexto evaluado es de 8192 tokens y la longitud máxima de entrenamiento fue de 4096 tokens.

La relevancia de este modelo radica en su mejora medible frente al modelo base: entre 4,7 y 7,2 puntos porcentuales de precisión de ejecución (EX) en los benchmarks BIRD y Spider, con reducción significativa de errores de ejecución (de 143 a 48 en BIRD plain). Está publicado bajo licencia Apache-2.0 y es compatible con Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; layout híbrido 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens evaluados; 4096 tokens de entrenamiento máximo |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura de transformer causal con codificador de visión y un layout híbrido de capas: 8 bloques compuestos por 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention, cada una con su FFN correspondiente. La dimensión oculta es de 4096 y el total de capas es 32. El ajuste fino se aplicó exclusivamente al modelo de lenguaje; el codificador de visión no se modificó. El adaptador LoRA (r=16, alpha=16) se entrenó con Unsloth durante 1 época en precisión bf16 y se fusionó en los pesos finales.

El conjunto de entrenamiento suma 17.132 ejemplos provenientes de cuatro fuentes: BIRD train (5.980 ejemplos, CC BY-SA 4.0), Spider train sin la base `formula_1` (8.097 ejemplos, CC BY-SA 4.0), un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas (2.105 ejemplos, Apache-2.0) y un subconjunto de llmsql-benchmark con columnas que requieren comillas (950 ejemplos, MIT). No se documenta el uso de RLHF o DPO; el entrenamiento es un ajuste supervisado sobre pares pregunta-esquema-SQL.

## Capacidades

- Generación de consultas SQLite a partir de esquema de base de datos, pregunta en lenguaje natural y hint opcional.
- Manejo de esquemas con descripciones de columnas (variante `desc` en BIRD), que mejora la precisión de ejecución.
- Generación de SQL con identificadores que requieren comillas (entrenado explícitamente con subconjuntos de SynSQL-2.5M y llmsql-benchmark).
- Razonamiento multi-paso para consultas de dificultad moderada y desafiante en BIRD y Spider.
- Capacidad de visión heredada del modelo base (codificador de visión no ajustado), aunque la tarea objetivo es text-to-SQL.
- Soporte de conversación multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con tool calling y function calling heredada del modelo base Qwen3.5 (no validada específicamente en la información disponible para la tarea text-to-SQL).

## Casos de uso

- Asistentes de consulta sobre bases de datos SQLite: el modelo traduce preguntas en lenguaje natural a SQL ejecutable, permitiendo a usuarios no técnicos consultar datos sin conocer el esquema. Su contexto de 8192 tokens permite incluir esquemas de tamaño medio con descripciones de columnas.
- Integración en pipelines de BI (business intelligence): generación automática de consultas para dashboards y herramientas de análisis, reduciendo el tiempo de escritura manual de SQL y los errores de sintaxis.
- Automatización de tareas de reporting: dado un esquema y una pregunta recurrente, el modelo produce consultas parametrizables que pueden ejecutarse de forma programática en un servicio backend.
- Herramientas de desarrollo y depuración de SQL: el modelo puede generar consultas de referencia para validar el comportamiento de un esquema o comparar resultados esperados.
- Educación y formación en SQL: generación de consultas de ejemplo a partir de preguntas en lenguaje natural para entornos de aprendizaje, con la ventaja de producir SQL ejecutable en SQLite.
- Agentes de datos multi-paso: combinado con un motor de ejecución SQL y un orquestador, el modelo puede formar parte de un agente que descompone preguntas complejas en consultas sucesivas sobre la base de datos.
- Migración y validación de esquemas: generación de consultas de comprobación sobre tablas y columnas con nombres que requieren comillas, escenario cubierto explícitamente en el entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Precisión de ejecución (EX) en porcentaje, comparada con Qwen/Qwen3.5-9B base usando los mismos prompts.

| Benchmark | Base | Este modelo | Solo este modelo correcto | Solo base correcto | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plain | 51,11 | 57,17 | 201 | 108 | 1,35e-07 |
| BIRD dev, desc | 52,09 | 59,32 | 221 | 110 | 1,04e-09 |
| Spider dev | 77,27 | 82,01 | 96 | 47 | 5,10e-05 |

BIRD dev: 1.534 preguntas sobre 11 bases de datos. Spider dev: 1.034 preguntas sobre 20 bases de datos.

Desglose por dificultad en BIRD (dev):

| Métrica | Base plain | Modelo plain | Base desc | Modelo desc |
|---|---:|---:|---:|---:|
| Simple | 57,51 | 62,70 | 59,46 | 65,08 |
| Moderate | 42,46 | 51,29 | 41,81 | 52,80 |
| Challenging | 37,93 | 40,69 | 37,93 | 43,45 |
| Errores de ejecución | 143 | 48 | 136 | 60 |

Desglose por dificultad en Spider (dev):

| Métrica | Base | Modelo |
|---|---:|---:|
| Easy | 91,13 | 93,95 |
| Medium | 83,18 | 88,12 |
| Hard | 66,67 | 72,99 |
| Extra | 51,81 | 57,23 |
| Errores de ejecución | 18 | 14 |

Comparativa dentro de la familia:

| Modelo | BIRD plain | BIRD desc | Spider dev |
|---|---:|---:|---:|
| Qwen3.5-4B base | 46,22* | 46,28* | 77,08 |
| Qwen3.5-4B fine-tuned | 54,76 | 56,19 | 81,82 |
| Qwen3.5-9B base | 51,11 | 52,09 | 77,27 |
| Qwen3.5-9B fine-tuned | 57,17 | 59,32 | 82,01 |

\*Valores medidos con una configuración distinta según la model card del modelo hermano de 4B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB de pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM para contexto de 8192 tokens.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) para bf16 con contexto moderado; RTX A6000 (48 GB) para mayor margen.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado; en GPUs de 16 GB requeriría cuantización (no documentada oficialmente en el repositorio).
- Opciones de despliegue: Transformers (librería declarada) y vLLM (compatibilidad indicada en la model card). No se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD plain | Spider dev | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen3.5-9B Text-to-SQL (este) | 9,41 B | 8192 (evaluado) | 57,17 | 82,01 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B Text-to-SQL | ~4 B | no disponible | 54,76 | 81,82 | Apache-2.0 | Hugging Face |
| Qwen3.5-9B base | 9,41 B | no disponible | 51,11 | 77,27 | no disponible en la información | Hugging Face |
| Qwen3.5-4B base | ~4 B | no disponible | 46,22 | 77,08 | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos text-to-SQL comparables (por ejemplo, especializaciones sobre Llama o CodeLlama) en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- El modelo solo soporta inglés (`language: en`); no se garantiza rendimiento en otros idiomas.
- La tarea está restringida a SQLite; no se documenta soporte para otros dialectos SQL (PostgreSQL, MySQL, etc.).
- El contexto evaluado es de 8192 tokens y el entrenamiento se limitó a 4096 tokens; esquemas muy grandes pueden exceder la ventana útil.
- Riesgo de alucinación en la generación de columnas o tablas inexistentes, especialmente en esquemas complejos; los errores de ejecución persisten (48 en BIRD plain, 60 en BIRD desc).
- El ajuste LoRA se aplicó solo al modelo de lenguaje; el codificador de visión no fue ajustado, por lo que las capacidades multimodales no están especializadas para text-to-SQL.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen licencias propias (CC BY-SA 4.0, Apache-2.0, MIT) que pueden imponer obligaciones de atribución o compartir-al-igual sobre los datos derivados.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a prompts adversarios.
- El modelo tiene 0 likes y 368 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-9B_text2sql
- Archivos del repositorio: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano de 4B: https://huggingface.co/EuricoGVP/Qwen3.5-4b_text2sql
- Colección Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Notebooks de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql/tree/main/notebooks
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql/blob/main/LICENSE
