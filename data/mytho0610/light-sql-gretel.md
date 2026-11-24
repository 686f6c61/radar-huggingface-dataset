# Mytho0610/light-sql-gretel

## Resumen

Light-SQL (Gretel) es un artefacto de recuperación para generación de SQL a partir de lenguaje natural, no un modelo entrenado. Lo publica el usuario Mytho0610 en Hugging Face y reproduce el enfoque del artículo *Light-SQL: A Small Language Model Based Approach Using In-Context Learning for Natural Language to SQL* (Nguyen y Le, ICCIES 2026). El repositorio contiene un banco de 49.969 ejemplos (pregunta, SQL y esquema reducido) extraídos de `gretelai/synthetic_text_to_sql`, junto con los embeddings de las preguntas calculados con `BAAI/bge-small-en` (normalizados, float16) para tres estrategias de selección de ejemplos: QTSS, MQSS y QRSS.

La idea central es que un modelo pequeño (SLM) puede generar SQL competitivo sin fine-tuning si se le proporcionan ejemplos demostrativos bien seleccionados por similitud semántica. El modelo generador es `microsoft/Phi-3-mini-4k-instruct`, cargado sin modificaciones desde Hugging Face. El flujo consiste en embeber la pregunta nueva, recuperar por producto escalar los tres ejemplos más afines, construir un prompt con secciones `### Instruction`, `### Schema`, `### Few-shot Examples`, `### Question` y `### Response`, y dejar que Phi-3-mini genere la consulta con temperatura 0.

Su relevancia es práctica: demuestra que para text-to-SQL en dominios acotados no siempre hace falta entrenar ni desplegar modelos grandes, sino invertir en un banco de ejemplos y una recuperación eficiente. El repositorio ocupa 0,1 GB y se distribuye con licencia Apache 2.0. No hay métricas de rendimiento publicadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo entrenado; artefacto de recuperación (banco de ejemplos + embeddings) sobre `microsoft/Phi-3-mini-4k-instruct` (transformer decoder-only) |
| Parámetros totales | No disponible para el artefacto; el modelo base Phi-3-mini tiene 3.800 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el artefacto; el modelo base soporta 4.096 tokens |
| Tipos de cuantización | No disponible (el artefacto no incluye pesos del modelo) |
| Idiomas soportados | No disponible (el banco de ejemplos y el embedding `BAAI/bge-small-en` son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `example_bank.jsonl` (texto) y `emb_question.npy` (embeddings float16, NumPy) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su arquitectura efectiva es un pipeline de recuperación aumentada por ejemplos (*in-context learning* con retrieval). El banco de ejemplos contiene 49.969 entradas de `gretelai/synthetic_text_to_sql`, cada una con la pregunta, la consulta SQL de referencia y un esquema reducido. Sobre ese banco se precalculan embeddings de las preguntas con `BAAI/bge-small-en`, normalizados y almacenados en float16 en `emb_question.npy`. En inferencia se embebe la pregunta del usuario con el mismo modelo, se calcula el producto escalar contra el banco y se seleccionan los tres ejemplos con mayor puntuación.

Las tres estrategias de selección mencionadas (QTSS, MQSS y QRSS) corresponden a variantes descritas en el artículo de referencia para elegir los ejemplos demostrativos. El prompt resultante sigue una plantilla fija con marcadores de sección y se envía a Phi-3-mini con temperatura 0 para forzar salidas deterministas. No hay información sobre volumen de tokens de entrenamiento, composición del dataset más allá de su origen sintético, ni sobre RLHF o DPO, porque no se ha realizado ajuste alguno sobre el modelo base. La innovación destacable es precisamente la ausencia de fine-tuning: toda la adaptación al dominio proviene de la recuperación semántica de ejemplos.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural, apoyada en un esquema proporcionado en el prompt.
- Recuperación semántica de ejemplos demostrativos mediante embeddings de `BAAI/bge-small-en` y producto escalar.
- Tres estrategias de selección de ejemplos (QTSS, MQSS, QRSS) según el artículo de referencia.
- In-context learning sin actualización de pesos: el comportamiento se ajusta cambiando el banco de ejemplos o el esquema.
- Salida determinista con temperatura 0, adecuada para pipelines reproducibles.
- Razonamiento y generación de texto heredados de Phi-3-mini (3.800 millones de parámetros, contexto de 4.096 tokens).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el banco y el modelo de embeddings son en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: se construye un banco de ejemplos propio con el esquema de la organización y se recuperan los tres más similares para cada pregunta del analista, evitando entrenar un modelo específico.
- Generación de SQL en herramientas de BI: el pipeline embebe la pregunta del usuario, recupera ejemplos y produce la consulta con temperatura 0, lo que facilita la revisión y el registro de resultados reproducibles.
- Prototipado rápido de text-to-SQL: al no requerir fine-tuning, un equipo puede validar la viabilidad de un caso de uso en horas cargando el banco de ejemplos y Phi-3-mini.
- Enseñanza y documentación de SQL: el banco de 49.969 pares pregunta-SQL sirve como corpus de referencia para ejemplos y para evaluar la calidad de consultas generadas.
- Automatización de informes ad hoc: preguntas como «ventas por región en el último trimestre» se traducen a SQL sobre un esquema acotado y se ejecutan en un pipeline de datos.
- Despliegue en entornos con recursos limitados: al usar un modelo de 3.800 millones de parámetros y un banco de 0,1 GB, el sistema completo cabe en una GPU de consumo, a diferencia de alternativas de mayor tamaño.
- Investigación sobre in-context learning: permite comparar las estrategias QTSS, MQSS y QRSS sobre el mismo banco y modelo base sin coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente de la cuantización elegida para Phi-3-mini (3.800 millones de parámetros).
- GPU recomendadas: no disponible; el modelo base Phi-3-mini es desplegable en GPU de consumo, pero no se especifican modelos concretos en la información.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponibles; el repositorio solo menciona un notebook acompañante y el uso de Phi-3-mini desde Hugging Face.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio ocupa 0,1 GB (banco de ejemplos y embeddings), más el espacio de los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Light-SQL (Gretel) | No aplica (artefacto sobre Phi-3-mini, 3.800 M) | 4.096 (modelo base) | Recuperación de ejemplos sin fine-tuning | Apache 2.0 | Hugging Face |
| Phi-3-mini-instruct | 3.800 M | 4.096 | Modelo generativo generalista | MIT | Hugging Face |
| Alternativas text-to-SQL fine-tuneadas | No disponible | No disponible | Fine-tuning supervisado | No disponible | No disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con otras propuestas de text-to-SQL.

## Limitaciones y advertencias

- No es un modelo entrenado: quien lo despliegue debe cargar por separado Phi-3-mini y ejecutar el pipeline de recuperación descrito en el notebook.
- El banco de ejemplos es sintético (`gretelai/synthetic_text_to_sql`), por lo que puede no reflejar esquemas, dialectos SQL ni convenciones reales de producción.
- El modelo de embeddings (`BAAI/bge-small-en`) y el banco están en inglés; el rendimiento en castellano u otros idiomas no está documentado.
- El contexto efectivo está limitado a 4.096 tokens del modelo base, lo que restringe el tamaño del esquema y del número de ejemplos incluidos en el prompt.
- Riesgo de alucinación heredado de Phi-3-mini: puede inventar tablas o columnas no presentes en el esquema si el prompt no es suficientemente restrictivo.
- No hay métricas publicadas de precisión, ejecutabilidad ni exactitud de las consultas generadas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del dataset de origen y del modelo base antes de un uso comercial.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Mytho0610/light-sql-gretel
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Dataset: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Modelo de embeddings: https://huggingface.co/BAAI/bge-small-en
- Artículo de referencia: *Light-SQL: A Small Language Model Based Approach Using In-Context Learning for Natural Language to SQL* (Kieu-Trang Nguyen, Quang-Hung Le, ICCIES 2026); enlace no disponible en la información proporcionada.
