# jastorj/couchmind-v5.8.2_cold_start-cw-26K-16bit

## Resumen

El modelo `jastorj/couchmind-v5.8.2_cold_start-cw-26K-16bit` es un ajuste fino supervisado (SFT) del modelo base `Snowflake/Arctic-Text2SQL-R1-7B`, especializado en la generación de consultas Text-to-SQL para Couchbase SQL++. Fue desarrollado por el usuario jastorj y publicado en Hugging Face con licencia Apache 2.0. El modelo está diseñado para convertir preguntas en lenguaje natural en consultas SQL++ sintácticamente válidas, siguiendo un esquema de base de datos dado.

El ajuste se realizó mediante LoRA (Low-Rank Adaptation) con la librería Unsloth sobre un conjunto de entrenamiento de 1148 ejemplos del dataset NL2SQL++ v5.8.2_cold_start, incorporando un formato de razonamiento "code-with-thought" que guía al modelo a pensar antes de responder. El resultado son pesos fusionados en 16 bits que mantienen la arquitectura del modelo base, un transformer de aproximadamente 7.600 millones de parámetros basado en la familia Qwen2. Este modelo es relevante para desarrolladores que trabajan con Couchbase y necesitan automatizar la generación de consultas SQL a partir de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2, segun tags) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 16-bit (pesos fusionados, segun el nombre del repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Snowflake/Arctic-Text2SQL-R1-7B`, un modelo de 7.000 millones de parametros basado en la arquitectura Qwen2 (segun los tags del repositorio). Sobre esta base se aplico un ajuste fino supervisado con LoRA mediante la libreria Unsloth, lo que permite un entrenamiento eficiente en memoria. El dataset de entrenamiento consta de 1148 ejemplos del conjunto NL2SQL++ v5.8.2_cold_start, cada uno con un esquema de base de datos Couchbase, una pregunta en lenguaje natural y la consulta SQL++ correspondiente, junto con un razonamiento intermedio en formato "code-with-thought". No se utilizo conjunto de validacion. Los pesos resultantes se fusionaron y guardaron en precision de 16 bits. No se dispone de informacion adicional sobre el numero de tokens de entrenamiento, el tamaño del dataset original ni la composicion del mismo.

## Capacidades

- Generacion de consultas SQL++ validas para Couchbase a partir de esquemas de base de datos y preguntas en lenguaje natural.
- Razonamiento intermedio en formato "code-with-thought" antes de emitir la respuesta final, lo que mejora la precision en consultas complejas.
- Manejo de esquemas con multiples buckets, scopes y colecciones, respetando los nombres exactos proporcionados.
- Soporte para reglas de generacion estrictas: seleccionar solo las columnas solicitadas y usar los identificadores exactos del esquema.
- Capacidad multilingue limitada al ingles, ya que el entrenamiento se realizo exclusivamente en ese idioma.
- No se mencionan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Automatizacion de consultas analiticas en Couchbase: un analista de datos puede formular preguntas en lenguaje natural y obtener la consulta SQL++ lista para ejecutar, reduciendo el tiempo de desarrollo de informes.
- Generacion de consultas para pipelines ETL: integrar el modelo en un sistema que transforme requisitos de negocio en consultas SQL++ para extraer datos de Couchbase de forma automatica.
- Asistente de desarrollo para equipos que migran de SQL tradicional a SQL++: el modelo puede traducir preguntas en lenguaje natural a la sintaxis especifica de Couchbase, facilitando la curva de aprendizaje.
- Validacion de esquemas: dado un esquema de base de datos, el modelo puede generar consultas de prueba para verificar la estructura y los tipos de datos.
- Generacion de consultas para benchmarks de Text-to-SQL: util para investigadores que necesitan generar consultas de referencia sobre el dataset NL2SQL++.
- Creacion de chatbots de datos internos: un asistente conversacional que responda preguntas sobre datos empresariales generando consultas SQL++ en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (como exact match, execution accuracy, etc.) sobre conjuntos de test estandar como Spider o BIRD. Tampoco se proporcionan comparativas con otros modelos Text-to-SQL.

## Requisitos de hardware

- VRAM estimada para inferencia en 16-bit: aproximadamente 16 GB (los pesos ocupan 15,2 GB), por lo que se recomienda una GPU con al menos 24 GB para margen de contexto y overhead.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100, o GPUs profesionales con 24 GB o mas.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantizacion adicional (8-bit o 4-bit), aunque el repo solo ofrece pesos en 16-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers de Hugging Face. Al ser un modelo basado en Qwen2, es compatible con la mayoria de frameworks.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia, se puede comparar con su modelo base `Snowflake/Arctic-Text2SQL-R1-7B` y con otros modelos Text-to-SQL de tamano similar como `defog/sqlcoder-7b-2` o `gaussalgo/T5-LM-Large-text2sql-spider`. Sin embargo, no hay resultados de benchmarks que permitan una comparacion objetiva. El modelo se diferencia por estar especializado en SQL++ de Couchbase y por su metodo de ajuste con razonamiento "code-with-thought".

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (1148 ejemplos), lo que puede limitar la generalizacion a esquemas o dominios no vistos durante el entrenamiento.
- Solo soporta ingles; preguntas en otros idiomas pueden producir resultados incorrectos.
- Especializado en SQL++ de Couchbase; puede no funcionar bien con otros dialectos SQL (MySQL, PostgreSQL, etc.).
- Riesgo de alucinacion en consultas complejas o esquemas ambiguos; se recomienda validar siempre las consultas generadas.
- No se proporcionan datos de evaluacion, por lo que el rendimiento real es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (no se especifican).
- Sin soporte para tool calling ni agentes, limitando su integracion en sistemas autonomos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jastorj/couchmind-v5.8.2_cold_start-cw-26K-16bit
- Modelo base Snowflake/Arctic-Text2SQL-R1-7B: https://huggingface.co/Snowflake/Arctic-Text2SQL-R1-7B
- Otros repositorios relacionados del autor: https://huggingface.co/jastorj/couchmind-v5.8_rl_cold_start-cw-26K-16bit y https://huggingface.co/jastorj/couchmind-rlt-v5.8.1_rl_5K_ex-cw-11K-16bit
