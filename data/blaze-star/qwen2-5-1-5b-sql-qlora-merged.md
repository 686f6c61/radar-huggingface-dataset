# blaze-star/qwen2.5-1.5b-sql-qlora-merged

## Resumen

El modelo `blaze-star/qwen2.5-1.5b-sql-qlora-merged` es un ajuste fino del modelo base `Qwen/Qwen2.5-1.5B-Instruct` mediante la técnica QLoRA, especializado en la tarea de text-to-SQL: dado un esquema de base de datos en formato `CREATE TABLE` y una pregunta en lenguaje natural, genera una consulta SQLite válida. El autor, `blaze-star`, ha fusionado los pesos del adaptador LoRA con el modelo base y los ha publicado en formato fp16, de modo que el resultado es un modelo autónomo listo para inferencia.

El modelo resuelve un problema práctico: la conversión de lenguaje natural a SQL en entornos donde se necesita alta precisión sintáctica y conformidad con un estilo canónico de consulta. Su relevancia radica en que, con solo 1.540 millones de parámetros, alcanza una exactitud del 74,8 % en el conjunto de test de `sql-create-context`, superando en 25,1 puntos al modelo base sin entrenar. Es una opción ligera y de código abierto (licencia Apache 2.0) para integrar en pipelines de generación de consultas SQL, especialmente en entornos con recursos limitados.

La arquitectura es un transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros totales. El contexto máximo del modelo base es de 32.000 tokens, aunque la información proporcionada no especifica el contexto del modelo fusionado. El entrenamiento se realizó con QLoRA sobre una base cuantizada a 4 bits, con 18,5 millones de parámetros entrenables (1,18 % del total).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo base: 32.000 tokens) |
| Tipos de cuantizacion | fp16 (pesos fusionados); entrenado con base 4-bit NF4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer causal con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). Sobre esta base se aplicó QLoRA: la base se congeló en cuantización 4-bit NF4 con doble cuantización y cómputo en bf16, y se añadieron adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05 sobre las proyecciones `q, k, v, o, gate, up, down_proj`. El entrenamiento utilizó el optimizador paged AdamW 8-bit con tasa de aprendizaje 0,0002, programación coseno con 3 % de warmup y recorte de gradiente 0,3. Los pesos del adaptador se fusionaron posteriormente con la base y se guardaron en fp16.

El conjunto de datos de entrenamiento fue `b-mc2/sql-create-context`, que contiene 78.577 filas de pares (pregunta en lenguaje natural, esquema `CREATE TABLE`, consulta SQLite). Se deduplicaron 4 filas exactas mediante SHA-1 de la tupla normalizada (pregunta, esquema), se barajaron con semilla 42 y se dividieron en 12.000 ejemplos de entrenamiento, 750 de validación y 1.000 de test. La separación se realizó antes del entrenamiento y se verificó que no hubiera solapamiento entre splits (train-test, val-test, train-val), garantizando que el test nunca se vio durante el entrenamiento.

El modelo se entrenó con un prompt de sistema específico que instruye a generar únicamente la consulta SQL, sin explicaciones ni marcas de formato. La decodificación recomendada es greedy (`do_sample=False`), ya que el muestreo degrada la exactitud.

## Capacidades

- Generacion de consultas SQLite a partir de esquemas `CREATE TABLE` y preguntas en lenguaje natural.
- Conformidad estricta con el formato de salida: genera solo la consulta SQL, sin comentarios, explicaciones ni cercos de markdown (cumplimiento de formato del 99,9 % en test).
- Razonamiento sobre esquemas relacionales simples: joins, agregaciones, filtros, subconsultas y operaciones de agrupación.
- Capacidad multilingue limitada: entrenado exclusivamente en ingles; el modelo base Qwen2.5 soporta multiples idiomas, pero el ajuste fino puede degradar el rendimiento en otros idiomas.
- No soporta tool calling, vision, audio ni modos de pensamiento extendido; es un modelo de generacion de texto puro especializado en SQL.

## Casos de uso

- Asistentes de consulta para bases de datos internas: un desarrollador o analista puede escribir una pregunta en lenguaje natural y el modelo genera la consulta SQLite correspondiente, reduciendo el tiempo de escritura manual de SQL.
- Generacion automatizada de informes: integrado en un pipeline de business intelligence, el modelo puede traducir preguntas de negocio a consultas SQL que alimentan dashboards o reportes periodicos.
- Educacion y formacion en SQL: como herramienta de practica, el modelo puede generar consultas de ejemplo a partir de esquemas propuestos, ayudando a estudiantes a comparar sus soluciones.
- Pruebas y validacion de esquemas: dado un esquema de base de datos, el modelo puede generar consultas de prueba para verificar la logica de las tablas y las relaciones.
- Chatbots de soporte tecnico con acceso a datos: el modelo puede servir como backend de generacion de SQL en un chatbot que responde preguntas sobre datos almacenados en SQLite, siempre que se le proporcione el esquema relevante.
- Automatizacion de ETL y limpieza de datos: en procesos de transformacion, el modelo puede generar consultas de extraccion o agregacion a partir de descripciones en lenguaje natural, acelerando el desarrollo de scripts.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de `b-mc2/sql-create-context` (1.000 ejemplos nunca vistos en entrenamiento):

| Modelo | Exact match (normalizado) | Token F1 | Cumplimiento de formato |
|---|---|---|---|
| Base, 0-shot (4-bit) | 49,7 % | 0,925 | 26,7 % |
| Base, 3-shot (4-bit) | 52,3 % | 0,921 | 99,3 % |
| Base, fp16, 0-shot | 57,3 % | no disponible | 99,4 % |
| **QLoRA fine-tuned (este modelo)** | **74,8 %** | **0,973** | **99,9 %** |

La mejora frente al modelo base sin entrenar es de +25,1 puntos de exact match (un +51 % relativo). El autor destaca que el control de 3-shot demuestra que la ganancia no se debe solo a la limpieza del formato de salida, sino a un aprendizaje genuino de las convenciones SQL del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB (tamano del repositorio), mas overhead de activaciones y cache. En una GPU con 4 GB de VRAM es viable.
- Con cuantizacion posterior a 4-bit (por ejemplo, mediante GPTQ o bitsandbytes), la VRAM necesaria se reduce a alrededor de 1 GB, permitiendo ejecucion en GPUs de gama baja o incluso en CPU con llama.cpp.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4090, A10, etc.). En cuantizacion 4-bit, una RTX 2060 o incluso una GTX 1660 pueden ser suficientes.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta).
- Latencia estimada: en una GPU moderna (RTX 4090), la generacion de una consulta SQL de 50-100 tokens toma menos de 1 segundo. En CPU, puede tardar entre 2 y 5 segundos dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos text-to-SQL de tamano similar (por ejemplo, CodeLlama-7B, SQLCoder, o el propio Qwen2.5-1.5B sin ajustar). La unica comparacion disponible es contra el modelo base Qwen2.5-1.5B-Instruct, que se muestra en la tabla de benchmarks. En terminos de tamano, este modelo es significativamente mas ligero que alternativas como SQLCoder (15B) o CodeLlama-7B, lo que lo hace adecuado para despliegue en entornos con recursos limitados, aunque su rendimiento en esquemas complejos o en otros dialectos SQL (PostgreSQL, MySQL) no ha sido evaluado.

## Limitaciones y advertencias

- Entrenado exclusivamente con consultas SQLite; puede generar sintaxis no compatible con otros motores de bases de datos (PostgreSQL, MySQL, SQL Server) sin adaptacion adicional.
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado y probablemente se degrade.
- La exactitud medida es sobre un dataset especifico con un estilo canonico de SQL; consultas semanticamente equivalentes pero con alias o literales diferentes pueden contarse como errores.
- Requiere el prompt de sistema exacto con el que fue entrenado; omitirlo reduce la precision.
- La decodificacion greedy es obligatoria para obtener los mejores resultados; el muestreo degrada la exactitud.
- No se han evaluado sesgos de genero, raza o etnia; al ser un modelo especializado en SQL, el riesgo de sesgo social es bajo, pero no se ha analizado.
- Riesgo de alucinacion en esquemas complejos o con nombres de columnas ambiguos; el modelo puede generar consultas sintacticamente validas pero logicamente incorrectas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo fusionado: https://huggingface.co/blaze-star/qwen2.5-1.5b-sql-qlora-merged
- Adaptador LoRA: https://huggingface.co/blaze-star/qwen2.5-1.5b-sql-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/b-mc2/sql-create-context
- Repositorio de entrenamiento (GitHub): https://github.com/harshb20/qwen2.5-1.5b-sql-qlora
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
