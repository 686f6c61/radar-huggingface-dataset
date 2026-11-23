# iteshxt/spinneret-ablation-t2-no-skeleton

## Resumen

Spinneret Lite (ablación T2 sin esqueleto) es un modelo de generación texto-a-SQL derivado de `google-t5/t5-small`, afinado por el desarrollador iteshxt sobre el conjunto de datos Spider. Su función es convertir una pregunta en inglés junto con un esquema de base de datos SQLite en una consulta SQL ejecutable. El modelo forma parte del proyecto Spinneret, que ofrece tres configuraciones: Baseline (T5-small sin ranker), Lite (T5-small con ranker de esquema) y Spinneret (T5-base con ranker). La variante publicada aquí corresponde a una ablación del pipeline Lite en la que se elimina la representación de "esqueleto" del esquema.

Arquitectónicamente es un transformer encoder-decoder T5 estándar con 60,5 millones de parámetros, que en el pipeline completo se acompaña de un ranker basado en RoBERTa-base de 125,8 millones de parámetros encargado de seleccionar las 4 tablas y 5 columnas más relevantes del esquema. El contexto de entrada se limita a 512 tokens y el modelo solo maneja inglés.

Su relevancia es acotada pero clara: demuestra que un modelo de 60 millones de parámetros, con un pipeline de ranking de esquema y decodificación guiada por ejecución, puede alcanzar un 55,8 % de exactitud de ejecución en el split de desarrollo de Spider, lo que lo convierte en una referencia útil para investigación en text-to-SQL de bajo coste y para despliegues en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 60.494.336 (modelo); 125,8 M adicionales del ranker en el pipeline completo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada; 256 tokens nuevos máximos en generación |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | inglés |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un T5-small estándar (encoder-decoder, 60,5 M de parámetros) afinado para generación condicionada. La entrada no es la pregunta y el esquema en bruto, sino una representación serializada con formato `question | database | table : column , column ( matched value ) | … | fk : a.x = b.y`. Los nombres se normalizan a minúsculas y los valores de la base de datos que aparecen en la pregunta se muestran entre paréntesis junto a su columna, de modo que el modelo puede copiarlos literalmente en la cláusula `WHERE`. Esta variante concreta es una ablación sin "esqueleto", es decir, sin la plantilla estructural de la consulta que sí usan otras configuraciones del proyecto.

El entrenamiento usa `train_spider` (7.000 preguntas) más `train_others` (1.659), excluyendo un 10 % de las bases de datos de entrenamiento reservado para validación con split por base de datos. Se optimizó con Adafactor, tasa de aprendizaje 0,001, batch efectivo de 32 y parada temprana sobre exactitud de ejecución en validación; la mejor época fue la 17, con 50,1 % de exact match y 54,5 % de exactitud de ejecución en validación. El entrenamiento se ejecutó en una Kaggle T4. En inferencia se emplea búsqueda por haces con 4 haces y decodificación guiada por ejecución: se conserva el primer candidato que se ejecuta correctamente contra la base de datos.

## Capacidades

- Generación de SQL para SQLite a partir de una pregunta en inglés y un esquema serializado.
- Serialización de esquema con selección de tablas y columnas mediante un ranker RoBERTa-base externo (top 4 tablas × 5 columnas).
- Coincidencia de valores: copia literales de la base de datos mostrados en la entrada junto a su columna.
- Representación de claves foráneas en la entrada (`fk : a.x = b.y`), lo que permite generar joins de dos tablas.
- Decodificación con múltiples candidatos (4 haces) y selección guiada por ejecución.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Consulta de bases de datos SQLite en lenguaje natural: el modelo traduce preguntas de negocio a SQL ejecutable sobre esquemas pequeños o medianos, con la condición de que el pipeline construya la entrada serializada y, preferiblemente, aplique decodificación guiada por ejecución.
- Herramienta interna de analistas no técnicos: integrado en un asistente que recibe la pregunta, recupera el esquema de la base de datos y devuelve la consulta para revisión humana antes de ejecutarla.
- Generación de SQL en entornos con hardware muy limitado: con 0,62 GB de pico de memoria GPU y una latencia mediana de 0,39 s por pregunta en una GTX 1650, cabe en portátiles y GPUs de gama de entrada, lo que permite desplegarlo en local sin infraestructura dedicada.
- Investigación en text-to-SQL de bajo coste: sirve como línea base reproducible para estudiar el efecto del ranking de esquema, la serialización de valores y la decodificación guiada por ejecución frente a modelos mucho mayores.
- Prototipado rápido de interfaces de consulta sobre datos públicos: para conjuntos con esquemas tipo Spider (dominios de conciertos, ligas, etc.) permite validar un flujo pregunta→SQL antes de invertir en un modelo mayor.
- Filtrado y preprocesado de pipelines de datos: para generar consultas de extracción sencillas (lookups y agregaciones) sobre tablas concretas, donde el modelo rinde con exactitud de ejecución del 73,8 % y 76,4 % respectivamente.
- Evaluación comparativa de ablaciones: al ser una variante sin esqueleto, permite medir el impacto de esa componente frente a las otras configuraciones del proyecto Spinneret en un mismo conjunto de evaluación.

## Benchmarks y rendimiento

Resultados en Spider dev (1.034 preguntas sobre 20 bases de datos no vistas en entrenamiento, evaluación oficial con test-suite, búsqueda por haces de 4 con guiado por ejecución):

| Metrica | easy | medium | hard | extra | all |
|---|---|---|---|---|---|
| Exact match % | 85,9 | 51,6 | 39,1 | 19,3 | 52,5 |
| Execution accuracy % | 82,7 | 56,3 | 45,4 | 25,3 | 55,8 |

SQL válido (ejecutable): 82,2 %.

| Tipo de pregunta | n | EX % |
|---|---|---|
| simple lookup | 252 | 73,8 |
| aggregation | 292 | 76,4 |
| two-table join | 288 | 37,5 |
| multi-join | 43 | 0,0 |
| nested / set-op | 159 | 37,7 |

Rendimiento del pipeline completo a batch 1 en una NVIDIA GeForce GTX 1650: latencia mediana de 0,39 s por pregunta, p95 de 0,91 s, pico de memoria GPU de 0,62 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,62 GB de pico para el pipeline completo (modelo más ranker) en precisión nativa, según medición del autor en una GTX 1650.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor valida en GTX 1650. Para mayor throughput, una T4, RTX 3060 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050/3060, RTX 4060 y cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM`; el proyecto Spinneret ofrece un servidor propio (`uv run spinneret serve`) con demo web. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, aunque al ser un T5 estándar en safetensors es compatible con TGI y con los runners de transformers.
- Latencia y throughput: mediana de 0,39 s y p95 de 0,91 s por pregunta en GTX 1650 a batch 1 con el pipeline completo; no se publican cifras de throughput a mayor batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider dev EX | Licencia | Notas |
|---|---|---|---|---|---|
| Spinneret Lite (esta ficha, ablación sin esqueleto) | 60,5 M + 125,8 M ranker | 512 | 55,8 % | CC BY-SA 4.0 | Pipeline con ranking de esquema y guiado por ejecución |
| Spinneret Baseline (T5-small sin ranker) | 60,5 M | 512 | no disponible en la información proporcionada | CC BY-SA 4.0 | Misma familia, sin ranker de esquema |
| Spinneret (T5-base + ranker) | no disponible en la información proporcionada | 512 | no disponible en la información proporcionada | CC BY-SA 4.0 | Configuración tope del proyecto según la model card |

No se dispone en la información proporcionada de resultados de modelos externos comparables (por ejemplo, T5-base afinado en Spider, PICARD o sistemas basados en LLM) para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Solo procesa preguntas en inglés y en el estilo de Spider; otras formulaciones y dominios son menos fiables.
- Los errores en esquemas no vistos se concentran en joins incorrectos y columnas equivocadas; las consultas con tres o más tablas (0,0 % EX en multi-join) y las anidadas o con operaciones de conjuntos (37,7 % EX) son mucho más débiles que los lookups simples.
- Los valores deben coincidir con la ortografía exacta de la base de datos; el modelo copia los valores que se le muestran y falla a menudo con números escritos en palabras (por ejemplo, "100 million").
- La decodificación guiada por ejecución requiere acceso a la base de datos; sin ella, debe tomarse el primer haz, con menor exactitud de ejecución.
- Riesgo de alucinación en nombres de columnas y tablas no presentes en el esquema serializado.
- No se documentan evaluaciones de sesgo; al derivar de T5-small y de Spider, puede heredar sesgos de esos datos.
- Uso previsto para consultas de solo lectura e investigación; el SQL generado debe revisarse antes de confiar en él en producción.
- Licencia CC BY-SA 4.0: es una licencia copyleft que exige compartir las obras derivadas bajo la misma licencia y atribuir al autor y al dataset Spider; conviene revisar su compatibilidad antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-ablation-t2-no-skeleton
- Ranker de esquema: https://huggingface.co/iteshxt/spinneret-ranker-roberta-base
- Repositorio del proyecto Spinneret: https://github.com/iteshxt/spinneret
- Modelo base: https://huggingface.co/google-t5/t5-small
- Dataset Spider: https://yale-lily.github.io/spider
- Artículo de Spider (Yu et al., EMNLP 2018): no disponible como enlace directo en la información proporcionada
