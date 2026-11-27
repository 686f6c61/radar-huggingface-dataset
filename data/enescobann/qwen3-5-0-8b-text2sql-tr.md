# enescobann/qwen3.5-0.8b-text2sql-tr

## Resumen

qwen3.5-0.8b-text2sql-tr es un modelo de generación de texto especializado en text-to-SQL para turco, desarrollado por el usuario enescobann. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-0.8B, cuyo objetivo es traducir preguntas en turco a consultas SQLite válidas a partir del esquema de la base de datos proporcionado en el prompt. El modelo resuelve el problema de la generación automática de consultas SQL para bases de datos con nombres de tabla y columna en turco, un escenario poco cubierto por los modelos generalistas.

El modelo cuenta con 752.393.024 parámetros (aproximadamente 0,8B) y se distribuye en formato safetensors con pesos fusionados (LoRA integrado en el modelo base). Está entrenado exclusivamente sobre el conjunto de datos TURSpider, la versión traducida al turco del benchmark Spider, y su licencia es Apache 2.0, la misma que el modelo base.

Su relevancia radica en que demuestra que un modelo de menos de mil millones de parámetros, ajustado con LoRA en una única GPU Tesla T4 durante aproximadamente dos horas, puede alcanzar un 59,0 de exactitud de ejecución (EX) en el conjunto de desarrollo de TURSpider, frente al 10,7 del modelo base. Esto lo convierte en una opción ligera y desplegable en hardware de consumo para tareas de generación de SQL en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, modelo de texto; no se utiliza el codificador visual) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó max_length 2048; la ventana nativa del modelo base no se especifica) |
| Tipos de cuantizacion | No disponible en la información proporcionada; existe una versión GGUF en enescobann/qwen3.5-0.8b-text2sql-tr-GGUF |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos fusionados con LoRA); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. Sobre él se aplicó un ajuste fino con LoRA de rango r=32, alpha=64 y dropout 0.05, aplicado a todas las capas lineales. Los pesos LoRA se fusionaron posteriormente en el modelo base, de modo que el repositorio contiene un modelo único listo para inferencia estándar con transformers. No se utilizó el codificador visual del modelo base; solo la parte de texto.

El entrenamiento se realizó sobre TURSpider train tras un proceso de limpieza: se eliminaron 221 filas duplicadas y 94 filas cuya consulta correcta no se ejecutaba en la base de datos, quedando 7449 ejemplos sobre 126 bases de datos (se excluyeron 161 ejemplos que superaban los 2048 tokens). Los hiperparámetros fueron 1 época, batch efectivo de 16, learning rate 2e-4 con scheduler cosine y warmup del 3%, longitud máxima de 2048 tokens. La pérdida se calculó únicamente sobre los tokens de respuesta (la consulta SQL y el token de fin). El entrenamiento se llevó a cabo en una única Tesla T4 (Colab) con precisión mixta fp16 durante aproximadamente 2 horas. El prompt de entrenamiento sigue el formato: mensaje de sistema + esquema `CREATE TABLE` + pregunta, con comentarios `-- örnek: ...` que incluyen hasta tres valores de ejemplo para columnas de texto.

## Capacidades

- Generación de consultas SQLite a partir de preguntas en turco y un esquema de base de datos proporcionado en el prompt.
- Generación de una única consulta SQL por petición, sin explicaciones adicionales (el modelo está entrenado para emitir solo SQL).
- Manejo de esquemas con nombres de tabla y columna en turco, incluyendo claves primarias y foráneas.
- Capacidad de trabajar con esquemas en inglés, aunque con rendimiento inferior (53,6 EX frente a 59,0 EX con esquemas en turco).
- Uso de valores de ejemplo en columnas de texto para mejorar la correspondencia entre términos de la pregunta y valores almacenados.
- Soporte de plantilla de chat mediante `apply_chat_template` con `enable_thinking=False`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de consultas para bases de datos SQLite en turco: el modelo recibe el esquema completo generado con `PRAGMA table_info` y `PRAGMA foreign_key_list` y devuelve una consulta ejecutable, lo que permite a usuarios no técnicos consultar datos en lenguaje natural.
- Integración en herramientas de BI internas: se puede incorporar en un panel donde el usuario escribe una pregunta en turco y el sistema muestra la consulta SQL generada y el resultado de ejecutarla contra la base de datos, con validación previa de la consulta.
- Generación de consultas para pipelines de datos: en procesos ETL o de análisis, el modelo puede producir consultas de agregación (por ejemplo, medias, conteos, filtros por país) sobre tablas con nombres en turco.
- Prototipado rápido de interfaces text-to-SQL: al caber en una GPU de consumo y ejecutarse con transformers, sirve para validar la viabilidad de una funcionalidad de consulta en lenguaje natural antes de invertir en modelos mayores.
- Educación y formación en SQL: el modelo puede generar consultas de ejemplo a partir de preguntas en turco, útiles como material didáctico o para comparar la consulta del estudiante con una referencia.
- Evaluación de esquemas y datos: dado que el modelo aprovecha los valores de ejemplo en columnas de texto, puede emplearse para detectar discrepancias entre la terminología de las preguntas y los valores almacenados (por ejemplo, nombres de países en turco frente a inglés).
- Despliegue en entornos con recursos limitados: su tamaño de 0,8B permite ejecutarlo en CPU o en GPUs modestas mediante la versión GGUF, adecuado para herramientas locales de consulta de bases de datos.

## Benchmarks y rendimiento

Resultados en TURSpider dev (1034 preguntas, 20 bases de datos no vistas en entrenamiento; el prompt incluye el esquema completo):

| Modelo | EX | EX strict | Consultas no ejecutables |
|---|---|---|---|
| Qwen3.5-0.8B (base) | 10,7 | 10,5 | 56,2% |
| qwen3.5-0.8b-text2sql-tr | 59,0 | 57,8 | 12,0% |

Resultados por nivel de dificultad (EX):

| Modelo | easy (248) | medium (446) | hard (174) | extra (166) |
|---|---|---|---|---|
| Base | 25,0 | 8,1 | 5,7 | 1,8 |
| qwen3.5-0.8b-text2sql-tr | 82,3 | 59,2 | 48,9 | 34,3 |

Otros datos reportados:

- Esquema en inglés: 53,6 EX con las mismas preguntas en turco y el esquema original en inglés de Spider.
- Validación (20 bases de datos separadas de las de entrenamiento, 895 preguntas): base 11,3 EX; este modelo 59,9 EX.
- Comparación con el artículo de TURSpider (IEEE Access, 2024): GPT-4 obtiene 57,25 EX y el mejor modelo ajustado (Turkcell-LLM-7B) 58,22 EX en el conjunto dev. El autor advierte que las configuraciones no son idénticas (el artículo incluye solo las tablas usadas por la consulta correcta, mientras que este modelo recibe el esquema completo y valores de ejemplo), por lo que los números son orientativos y no directamente comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 752 millones de parámetros, en fp16 requiere aproximadamente 1,5 GB de pesos, y en cuantizaciones de 8 o 4 bits alrededor de 0,8-1 GB, más el espacio para el contexto y el esquema de la base de datos.
- GPU recomendadas: el entrenamiento se realizó en una Tesla T4; para inferencia son suficientes GPUs de consumo como RTX 3060, RTX 4060 o superiores. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con al menos 4 GB de VRAM, y también en CPU mediante la versión GGUF.
- Opciones de despliegue: transformers (con `device_map="auto"` y `dtype="auto"`), llama.cpp u Ollama a través del repositorio GGUF. No se documenta soporte específico para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EX en TURSpider dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-0.8b-text2sql-tr | 0,75B | No disponible (entrenado a 2048) | 59,0 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | 10,7 | Apache 2.0 (según modelo base) | Hugging Face |
| Turkcell-LLM-7B (ajustado, según artículo TURSpider) | 7B | No disponible | 58,22 | No disponible | No disponible en la información |
| GPT-4 (según artículo TURSpider) | No disponible | No disponible | 57,25 | Propietaria | API de OpenAI |

La comparación con Turkcell-LLM-7B y GPT-4 procede del artículo de TURSpider y no de una evaluación con la misma configuración de prompt, por lo que debe interpretarse con cautela.

## Limitaciones y advertencias

- Solo genera sintaxis SQLite y una única consulta por petición; no se ha probado con otros dialectos SQL.
- Los nombres de tabla y columna en TURSpider son turcos; con esquemas en inglés el rendimiento baja a 53,6 EX.
- En consultas difíciles y de varios pasos el error es elevado (34,3 EX en el nivel extra); se recomienda revisar la consulta generada antes de ejecutarla.
- No debe conectarse directamente a una base de datos con permisos de escritura sin validación previa de la consulta.
- El conjunto de datos contiene errores heredados de Spider y de su traducción al turco (algunas preguntas incluyen números o condiciones distintas a las de la consulta correcta).
- El conocimiento general del turco a escala 0,8B es limitado; si los valores están almacenados en inglés (por ejemplo, la pregunta dice "Kaliforniya" y la base de datos contiene "California"), los valores de ejemplo del esquema son determinantes.
- Riesgo de alucinación en la estructura de la consulta (tablas o columnas inexistentes) cuando el esquema es grande o ambiguo; el 12,0% de consultas no ejecutables en dev refleja este riesgo.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del conjunto de datos.
- La licencia Apache 2.0 permite uso comercial, pero el conjunto de datos TURSpider es CC BY 4.0 y Spider es CC BY-SA 4.0, por lo que deben respetarse las atribuciones correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enescobann/qwen3.5-0.8b-text2sql-tr
- Versión GGUF: https://huggingface.co/enescobann/qwen3.5-0.8b-text2sql-tr-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conjunto de datos TURSpider: https://huggingface.co/datasets/AliBugra/TURSpider
- Artículo TURSpider (IEEE Access, 2024): doi 10.1109/ACCESS.2024.3498841
- Artículo Spider (Yu et al., 2018): no se proporciona enlace en la información disponible.
