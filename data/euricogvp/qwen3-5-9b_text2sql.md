# EuricoGVP/Qwen3.5-9b_text2sql

## Resumen

Qwen3.5-9B Text-to-SQL es un ajuste fino del modelo Qwen/Qwen3.5-9B desarrollado por EuricoGVP, orientado específicamente a la generación de consultas SQLite a partir de un esquema de base de datos, una pregunta en lenguaje natural y, opcionalmente, una pista. El modelo resuelve el problema de la traducción de lenguaje natural a SQL (text-to-SQL) en entornos donde el esquema puede ser complejo y las preguntas requieren razonamiento sobre joins, agregaciones y filtros condicionales.

Se trata de un modelo causal con codificador de visión, de aproximadamente 9.400 millones de parámetros, con una dimensión oculta de 4096 y 32 capas. El ajuste se realizó mediante LoRA (rango 16, alpha 16) con Unsloth durante una época en precisión bf16, fusionando después el adaptador en los pesos finales, por lo que no requiere PEFT para su uso. El entrenamiento se limita al modelo de lenguaje; el codificador de visión del modelo base no se modificó.

La relevancia actual del modelo radica en que ofrece una mejora medible y estadísticamente significativa sobre el modelo base en los benchmarks de referencia BIRD y Spider, con una reducción notable de errores de ejecución. Está publicado bajo licencia Apache-2.0, lo que facilita su adopción en entornos comerciales, y es compatible con Transformers y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; layout oculto 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenamiento: 4096 tokens; evaluación: 8192 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16; compatible con cuantizaciones estándar de Transformers/vLLM) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato Transformers; LoRA fusionado en los pesos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer causal con codificador de visión y una disposición de capas híbrida que combina bloques Gated DeltaNet con bloques de atención con compuerta (Gated Attention). La dimensión oculta es de 4096 y el modelo cuenta con 32 capas. El ajuste fino se aplicó exclusivamente al modelo de lenguaje mediante LoRA con Unsloth (rango 16, alpha 16, una época, precisión bf16), con una longitud máxima de entrenamiento de 4096 tokens. El adaptador LoRA se fusionó en los pesos finales, de modo que el repositorio contiene los pesos completos listos para usar con Transformers y vLLM sin necesidad de PEFT.

El conjunto de entrenamiento totaliza 17.132 ejemplos procedentes de cuatro fuentes: BIRD train (5.980 ejemplos, CC BY-SA 4.0), Spider train sin la base de datos `formula_1` para evitar solapamiento con BIRD dev (8.097 ejemplos, CC BY-SA 4.0), un subconjunto de SynSQL-2.5M con contexto largo y nombres que requieren comillas (2.105 ejemplos, Apache-2.0) y un subconjunto de llmsql-benchmark con columnas que requieren comillas (950 ejemplos, MIT). No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de consultas SQLite a partir de un esquema de base de datos y una pregunta en lenguaje natural.
- Aceptación opcional de una pista (hint) junto con el esquema y la pregunta.
- Manejo de esquemas con descripciones de columnas, con mejora de precisión respecto al esquema plano (59,32 % frente a 57,17 % en BIRD dev).
- Generación de SQL con nombres de columnas que requieren comillas, gracias al subconjunto de entrenamiento específico.
- Razonamiento sobre contextos largos de esquema, con evaluación a 8192 tokens.
- Capacidad de visión heredada del modelo base (codificador de visión no modificado durante el ajuste).
- Generación de texto conversacional (pipeline text-generation).
- Compatibilidad con tool calling y function calling heredada del modelo base (no verificada específicamente en la información disponible).

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas en lenguaje natural a SQLite sobre esquemas existentes, permitiendo a analistas sin conocimiento profundo de SQL obtener resultados directamente. Su evaluación a 8192 tokens permite manejar esquemas de tamaño medio con muchas tablas y columnas.
- Integración en herramientas de BI y notebooks: el modelo puede generar consultas a partir de preguntas formuladas por usuarios, reduciendo el tiempo de escritura manual de SQL y los errores de sintaxis, con una tasa de errores de ejecución notablemente inferior a la del modelo base (48 frente a 143 en BIRD plano).
- Automatización de informes periódicos: dado un esquema fijo y una batería de preguntas recurrentes, el modelo genera las consultas correspondientes que pueden ejecutarse en pipelines programados, aprovechando su compatibilidad con vLLM para despliegue de alto rendimiento.
- Educación y formación en SQL: el modelo puede servir como generador de consultas de referencia para comparar con las soluciones de estudiantes, gracias a su buen rendimiento en los niveles simple y moderado de BIRD (62,70 % y 51,29 % respectivamente en esquema plano).
- Prototipado de interfaces conversacionales sobre bases de datos: equipos que construyen chatbots de consulta sobre SQLite pueden usar el modelo como motor de traducción, con la ventaja de que el adaptador ya está fusionado y no requiere pasos adicionales de carga.
- Evaluación comparativa de pipelines text-to-SQL: investigadores pueden usar este modelo como referencia de ajuste fino sobre Qwen3.5-9B, con resultados publicados y notebooks de entrenamiento y benchmarks disponibles en el repositorio.
- Generación de consultas en entornos con esquemas documentados: la variante con descripciones de columnas alcanza 59,32 % de EX en BIRD dev, lo que lo hace adecuado para bases de datos con metadatos bien mantenidos.

## Benchmarks y rendimiento

Resultados de precisión de ejecución (EX) en porcentaje, declarados por el autor del modelo (no verificados de forma independiente). BIRD dev contiene 1.534 preguntas sobre 11 bases de datos; Spider dev contiene 1.034 preguntas sobre 20 bases de datos.

| Benchmark | Base | Este modelo | Solo este modelo correcto | Solo base correcto | McNemar p |
|---|---:|---:|---:|---:|---:|
| BIRD dev, plano | 51,11 | 57,17 | 201 | 108 | 1,35e-07 |
| BIRD dev, desc | 52,09 | 59,32 | 221 | 110 | 1,04e-09 |
| Spider dev | 77,27 | 82,01 | 96 | 47 | 5,10e-05 |

Desglose por dificultad en BIRD dev:

| Métrica | Base plano | Este modelo plano | Base desc | Este modelo desc |
|---|---:|---:|---:|---:|
| Simple | 57,51 | 62,70 | 59,46 | 65,08 |
| Moderate | 42,46 | 51,29 | 41,81 | 52,80 |
| Challenging | 37,93 | 40,69 | 37,93 | 43,45 |
| Errores de ejecución | 143 | 48 | 136 | 60 |

En Spider dev, los errores de ejecución se reducen de 18 en el modelo base a 14 en este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB para los pesos (tamaño del repositorio: 18,8 GB), más memoria para el contexto y el codificador de visión; se recomienda al menos 24 GB para margen operativo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; para GPUs con menos VRAM es necesario cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB o menos requiere cuantización (no se especifican formatos GGUF en el repositorio).
- Opciones de despliegue: Transformers (formato nativo), vLLM (compatibilidad declarada por el autor); no se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD dev (EX) | Spider dev (EX) | Licencia |
|---|---:|---|---:|---:|---|
| Qwen3.5-9B Text-to-SQL (este) | 9,4 B | 8192 (evaluación) | 57,17 (plano) / 59,32 (desc) | 82,01 | Apache-2.0 |
| Qwen/Qwen3.5-9B (base) | 9 B | no disponible | 51,11 (plano) / 52,09 (desc) | 77,27 | no disponible |
| Qwen3.5-4B Text-to-SQL | ~4 B | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen3.5-2B Text-to-SQL | ~2 B | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen3.5-0.8B Text-to-SQL | ~0,8 B | no disponible | no disponible | no disponible | Apache-2.0 |

Los modelos de la familia comparten la misma licencia y metodología de ajuste, pero la información disponible no incluye sus resultados de benchmarks. No se dispone de datos de otros modelos text-to-SQL externos a esta familia en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente para SQLite; no se garantiza su corrección para otros dialectos SQL (PostgreSQL, MySQL, etc.).
- El idioma soportado declarado es únicamente inglés; las preguntas en otros idiomas pueden degradar el rendimiento.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- El ajuste se realizó durante una sola época con 17.132 ejemplos; el rendimiento en esquemas muy grandes o dominios muy alejados de BIRD y Spider puede ser inferior.
- La longitud de contexto de entrenamiento es de 4096 tokens, aunque la evaluación se realizó a 8192; esquemas que excedan este límite pueden truncarse o degradar la calidad.
- Riesgo de alucinación en nombres de tablas o columnas no presentes en el esquema, especialmente en esquemas ambiguos o incompletos.
- El codificador de visión no fue ajustado; las capacidades multimodales son las del modelo base y no están orientadas a text-to-SQL.
- No se han publicado análisis de sesgos específicos para este ajuste; los sesgos del modelo base pueden persistir.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen licencias propias (CC BY-SA 4.0, Apache-2.0, MIT) que conviene revisar según el caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuricoGVP/Qwen3.5-9b_text2sql
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Colección Qwen3.5 Text-to-SQL: https://huggingface.co/collections/EuricoGVP/qwen35-text2sql
- Modelo hermano 0.8B: https://huggingface.co/EuricoGVP/Qwen3.5-0.8B_text2sql
- Modelo hermano 2B: https://huggingface.co/EuricoGVP/Qwen3.5-2B_text2sql
- Modelo hermano 4B: https://huggingface.co/EuricoGVP/Qwen3.5-4B_text2sql
- Notebooks de entrenamiento y benchmarks: https://huggingface.co/EuricoGVP/Qwen3.5-9B_text2sql/tree/main/notebooks
- Licencia: https://huggingface.co/EuricoGVP/Qwen3.5-9B_text2sql/blob/main/LICENSE
- Dataset BIRD train: https://huggingface.co/datasets/EuricoGVP/birdsql_complete_trainset
- Dataset Spider train: https://huggingface.co/datasets/EuricoGVP/spider_sql_complete
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Dataset llmsql-benchmark: https://huggingface.co/datasets/llmsql-bench/llmsql-benchmark
