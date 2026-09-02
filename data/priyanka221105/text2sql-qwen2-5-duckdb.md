# Priyanka221105/text2sql-qwen2.5-duckdb

## Resumen

El modelo `text2sql-qwen2.5-duckdb` es un ajuste fino (fine-tuning) del modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`, desarrollado por Priyanka221105. Su propósito principal es convertir lenguaje natural en consultas SQL válidas para DuckDB, un motor de base de datos analítica embebido. El modelo está pensado para desarrolladores e investigadores que necesitan una capa de traducción de texto a SQL sobre DuckDB, aprovechando la capacidad de razonamiento y generación de código del modelo base Qwen2.5.

La arquitectura subyacente es un transformer decoder basado en Qwen2.5, con aproximadamente 7.6 mil millones de parámetros. El ajuste fino se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica un entrenamiento eficiente en términos de tiempo y recursos. El modelo se distribuye bajo licencia Apache-2.0 y está orientado exclusivamente al idioma inglés, según la información disponible. Su relevancia radica en la creciente demanda de herramientas Text-to-SQL para bases de datos modernas como DuckDB, que se usa ampliamente en entornos de análisis de datos.

Aunque la model card es muy escueta y no proporciona detalles sobre el dataset de entrenamiento ni métricas de evaluación, el modelo se presenta como una opción práctica para tareas de generación de SQL en contextos de análisis de datos. No se han publicado benchmarks oficiales, por lo que su rendimiento debe validarse empíricamente en cada caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors de precisión completa; el modelo base usaba bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder con atención causal estándar y mecanismos de normalización y activación propios de la serie Qwen. El modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit` es una versión cuantizada en 4 bits del Qwen2.5-Coder-7B-Instruct, optimizada para entrenamiento eficiente con Unsloth. El ajuste fino se realizó con la librería TRL de Hugging Face, que facilita el entrenamiento con técnicas como SFT (Supervised Fine-Tuning) o DPO, aunque no se especifica cuál se usó.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. Tampoco se detalla si se aplicaron técnicas de alineación adicionales como RLHF. La única innovación técnica mencionada es el uso de Unsloth para acelerar el entrenamiento (2x más rápido), lo que reduce costes computacionales. El modelo se sube con pesos en safetensors, listos para inferencia con `transformers` o `text-generation-inference`.

## Capacidades

- Generacion de texto y codigo: al estar basado en Qwen2.5-Coder, el modelo hereda capacidades de generacion de codigo, incluyendo SQL.
- Text-to-SQL: su proposito principal es traducir preguntas en lenguaje natural a consultas SQL, especificamente para DuckDB.
- Razonamiento y comprension de instrucciones: al ser un modelo instruct, puede seguir instrucciones complejas y producir salidas estructuradas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible, pero el modelo base Qwen2.5-Coder-Instruct tiene soporte para function calling, por lo que es probable que lo mantenga.
- Capacidades multilingues: no disponibles, el modelo se entrena solo en ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Analisis de datos interactivo: un analista puede hacer preguntas en lenguaje natural sobre un dataset cargado en DuckDB y obtener consultas SQL listas para ejecutar. El modelo es adecuado porque genera SQL sintacticamente correcto y adaptado a la sintaxis de DuckDB.
- Generacion de informes automatizados: integrado en un pipeline de generacion de informes, el modelo convierte solicitudes de negocio en consultas SQL para extraer metricas de una base DuckDB, reduciendo el tiempo de desarrollo.
- Asistente de consultas para no programadores: una interfaz tipo chatbot que permite a usuarios sin conocimientos de SQL obtener datos de DuckDB. El modelo puede explicar la consulta generada y adaptarla a preguntas de seguimiento.
- Testing y validacion de esquemas: el modelo puede generar consultas SQL de prueba a partir de descripciones funcionales, ayudando a verificar la integridad de esquemas DuckDB durante el desarrollo.
- Migracion de queries: si se tiene un conjunto de consultas escritas para otros motores (PostgreSQL, MySQL), el modelo puede adaptarlas a la sintaxis de DuckDB, aprovechando su conocimiento de SQL.
- Entrenamiento de modelos mas pequeños: el modelo puede usarse como teacher para destilar capacidades Text-to-SQL en modelos mas ligeros que corran en entornos con pocos recursos, como edge devices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de Text-to-SQL como execution accuracy o exact match. Se recomienda evaluar el modelo en el conjunto de datos propio antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.6B parametros en precision fp16, se necesitan aproximadamente 15 GB de VRAM. Con cuantizacion int8 (si se aplica) se reduce a ~8 GB, y con int4 a ~4-5 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son suficientes. Para cuantizacion int4, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podrian funcionar.
- Se puede ejecutar en GPUs de consumo si se cuantiza el modelo, pero no hay versiones GGUF oficiales publicadas en el repositorio.
- Opciones de despliegue: compatible con `transformers` y `text-generation-inference` (TGI). Tambien se puede servir con vLLM si se convierte a formato adecuado. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependeran del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| text2sql-qwen2.5-duckdb (este) | 7.6B | no disponible | Text-to-SQL para DuckDB | Apache-2.0 | Hugging Face |
| Ellbendls/Qwen-2.5-3b-Text_to_SQL | ~3B | no disponible | Text-to-SQL general | no disponible | Hugging Face |
| tulas/Qwen2.5-0.5B-Instruct-Text2Sql | ~0.5B | no disponible | Text-to-SQL | AGPL-3.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct (base) | 7.6B | 32.768 tokens | Codigo e instrucciones | Apache-2.0 | Hugging Face |

El modelo se diferencia por su especializacion en DuckDB, mientras que los otros pueden ser mas generales. El modelo base Qwen2.5-Coder-7B-Instruct es mas versatil pero no esta afinado para SQL de DuckDB. Los modelos mas pequeños (3B y 0.5B) requieren menos recursos, pero probablemente tengan menor precision en tareas complejas.

## Limitaciones y advertencias

- No hay informacion sobre sesgos especificos, pero al ser un fine-tune de un modelo grande, puede heredar sesgos de los datos de entrenamiento originales de Qwen.
- Riesgo de alucinacion en la generacion de SQL: puede producir consultas sintacticamente validas pero logicamente incorrectas o que no correspondan al esquema real de la base de datos.
- Limitacion de idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Contexto limitado: no se especifica la longitud de contexto del fine-tune; si se mantiene la del modelo base (32K), puede manejar esquemas grandes, pero no esta confirmado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe revisar la atribucion requerida.
- Para produccion, se recomienda validar el rendimiento con un conjunto de pruebas propio, ya que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Priyanka221105/text2sql-qwen2.5-duckdb
- Modelo base (unsloth): https://huggingface.co/unsloth/qwen2.5-coder-7b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Proyecto similar Text2SQL-Qwen (GitHub): https://github.com/Vish2503/Text2SQL-Qwen
- Modelo Ellbendls/Qwen-2.5-3b-Text_to_SQL: https://huggingface.co/Ellbendls/Qwen-2.5-3b-Text_to_SQL
- Modelo tulas/Qwen2.5-0.5B-Instruct-Text2Sql: https://huggingface.co/tulas/Qwen2.5-0.5B-Instruct-Text2Sql
