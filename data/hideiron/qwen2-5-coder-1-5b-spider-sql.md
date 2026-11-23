# HideIron/Qwen2.5-Coder-1.5B-Spider-SQL

## Resumen

Qwen2.5-Coder-1.5B-Spider-SQL es un ajuste fino del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct orientado a la tarea de text-to-SQL: recibe un esquema SQLite expresado como sentencias `CREATE TABLE` junto con una pregunta en ingles y devuelve una unica consulta SQL. Lo desarrolla el usuario HideIron y se distribuye en Hugging Face con licencia Apache 2.0. El modelo resuelve el problema de traducir lenguaje natural a SQL sobre bases de datos relacionales pequenas, un caso de uso clasico en asistentes de analitica y herramientas de BI.

Tecnicamente es un transformer decoder-only de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5-Coder, que a su vez se entreno sobre un corpus intensivo en codigo. El ajuste se realizo con LoRA sobre el conjunto de entrenamiento de Spider (7000 pares pregunta/SQL sobre 140 bases de datos) y el adaptador se fusiono en los pesos finales, de modo que el modelo se carga como cualquier modelo de `transformers` sin necesidad de PEFT.

Su relevancia actual radica en que demuestra que un modelo pequeno, entrenado en una sola GPU A10 durante aproximadamente una hora, puede mejorar de forma sustancial el rendimiento de su base en una tarea vertical concreta: pasa de 58,6 a 69,8 de execution accuracy en el split de validacion de Spider, con mejoras especialmente marcadas en las consultas de dificultad alta y extra. Es una referencia util para quien quiera evaluar estrategias de ajuste eficiente (LoRA) sobre modelos compactos para tareas estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivado de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso una longitud maxima de 2048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal de la familia Qwen2. El ajuste fino se aplico mediante LoRA con r=16, alpha=32 y dropout 0.05 sobre las proyecciones q/k/v/o, lo que supone un 0,28 % de los parametros entrenados. Posteriormente el adaptador se fusiono en los pesos base, por lo que el artefacto final es un modelo denso convencional sin dependencias de PEFT. La perdida es entropia cruzada calculada unicamente sobre los tokens de la respuesta SQL, con los tokens del prompt enmascarados.

El conjunto de entrenamiento es Spider `train_spider`: 7000 pares de pregunta y consulta SQL sobre 140 bases de datos. El entrenamiento consistio en 2 epocas, 1750 pasos, batch efectivo de 8, learning rate de 1e-4 con scheduler coseno y un 3 % de warmup, en precision bf16 y con una longitud maxima de 2048 tokens (ningun ejemplo se trunco). Se ejecuto en una unica NVIDIA A10 de 24 GB durante aproximadamente una hora. No se documenta uso de RLHF ni DPO; el ajuste es puramente supervisado sobre pares de instruccion y respuesta.

## Capacidades

- Generacion de consultas SQL a partir de un esquema SQLite y una pregunta en ingles, devolviendo una unica consulta sin explicaciones.
- Comprension de esquemas con claves primarias y foraneas, que el modelo utiliza para inferir las uniones (joins) necesarias.
- Razonamiento sobre la estructura de la base de datos para resolver consultas de agregacion, filtrado y agrupacion propias del benchmark Spider.
- Capacidad de generacion de codigo heredada del modelo base Qwen2.5-Coder, aunque el ajuste esta especializado en text-to-SQL.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso con clarificaciones: la salida es una sola consulta por turno.
- Capacidades multilingues limitadas al ingles, idioma declarado del modelo.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas en ingles a SQL sobre esquemas SQLite de pequeno y mediano tamano, reduciendo el tiempo de escritura manual de consultas en herramientas internas de exploracion.
- Generacion de borradores de SQL en pipelines de analitica: se puede integrar como primer paso de un flujo que valide y ejecute la consulta en un entorno de solo lectura, aprovechando que devuelve una unica sentencia limpia.
- Educacion y formacion en SQL: sirve como generador de ejemplos de consultas a partir de enunciados, util para crear ejercicios o comparar la solucion del alumno con una referencia.
- Prototipado rapido de interfaces de lenguaje natural sobre bases de datos: al ser un modelo de 1,5 mil millones de parametros, puede desplegarse en infraestructura modesta para validar un producto de text-to-SQL antes de invertir en modelos mayores.
- Pruebas de regresion de esquemas: dado un esquema concreto, el modelo puede generar consultas de comprobacion para verificar que las relaciones y claves estan bien definidas.
- Investigacion sobre ajuste eficiente: sirve como caso de referencia para reproducir un pipeline LoRA completo (datos, hiperparametros, evaluacion con el evaluador oficial de Spider) en una sola GPU de 24 GB.
- Automatizacion de informes internos: para preguntas recurrentes sobre bases de datos de tamano contenido, el modelo puede pregenerar consultas que luego se revisan y se ejecutan de forma controlada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre Spider dev (1034 preguntas), evaluados con el evaluador oficial `test-suite-sql-eval` (`--etype all`), decodificacion greedy y el mismo prompt para ambos modelos. La ejecucion se comprobo contra las bases de datos originales de Spider dev, no contra las bases ampliadas del test-suite, por lo que la cifra del test-suite podria ser ligeramente inferior.

Execution accuracy (la consulta predicha y la de referencia devuelven las mismas filas):

| Modelo | easy (248) | medium (446) | hard (174) | extra (166) | all |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (base) | 81,5 | 61,0 | 42,5 | 34,9 | 58,6 |
| Qwen2.5-Coder-1.5B-Spider-SQL | 87,5 | 72,9 | 56,9 | 48,8 | 69,8 |

Exact-set match (la estructura SQL coincide con la de referencia, ignorando valores):

| Modelo | easy | medium | hard | extra | all |
|---|---|---|---|---|---|
| Base | 76,6 | 33,9 | 25,3 | 12,7 | 39,3 |
| Qwen2.5-Coder-1.5B-Spider-SQL | 83,1 | 63,5 | 46,0 | 44,6 | 62,2 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, BIRD o Spider 2.0) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 1.543.714.304 parametros ocupan aproximadamente 3,1 GB, a los que hay que sumar la cache KV y el overhead del runtime. En la practica, el modelo cabe holgadamente en GPUs de 8 GB o mas en bf16.
- GPU recomendadas: el autor lo entreno en una NVIDIA A10 de 24 GB, pero para inferencia son suficientes GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB). Tambien puede ejecutarse en CPU, con mayor latencia.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 8 GB de VRAM en bf16, y en configuraciones menores si se aplican cuantizaciones (no documentadas oficialmente).
- Opciones de despliegue: `transformers` es la via documentada por el autor. El modelo esta etiquetado como compatible con text-generation-inference y endpoints, por lo que tambien puede servirse con TGI. No se documentan variantes GGUF para llama.cpp u Ollama, aunque al ser un transformer Qwen2 estandar seria tecnicamente convertible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo requirio aproximadamente una hora en una A10, lo que da una idea del coste de reentrenamiento, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento text-to-SQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Spider-SQL | 1,54 B | no disponible (entrenado a 2048) | 69,8 execution accuracy en Spider dev | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54 B | no disponible | 58,6 execution accuracy en Spider dev | apache-2.0 | Hugging Face |
| Otros ajustes text-to-SQL sobre modelos de ~1,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye comparaciones con otros modelos especializados en text-to-SQL (por ejemplo, variantes sobre CodeLlama, StarCoder o modelos mayores como Qwen2.5-Coder-7B), por lo que la unica comparacion con datos verificables es frente a su propio modelo base.

## Limitaciones y advertencias

- Solo SQLite: el modelo se entreno con esquemas y consultas de referencia en SQLite, por lo que otros dialectos (PostgreSQL, MySQL, T-SQL) pueden recibir SQL con sintaxis propia de SQLite.
- Preguntas de estilo Spider: el benchmark cubre 200 bases de datos pequenas con nombres limpios. Esquemas reales grandes, nombres de columnas ambiguos o preguntas que requieren conocimiento externo son mas dificiles; no se ha evaluado en BIRD ni en Spider 2.0.
- Una consulta por respuesta: no ofrece explicaciones ni aclaraciones multi-turno, lo que limita su uso en dialogos interactivos.
- No ejecuta ni verifica su SQL: la salida debe tratarse como un borrador. Nunca debe ejecutarse SQL generado contra una base de datos de produccion con permisos de escritura.
- Formato de prompt estricto: el modelo se entreno con un unico formato de sistema y usuario (`Schema:` / `Question:`); usar otro formato degrada los resultados.
- Decodificacion greedy recomendada: la evaluacion se realizo con `do_sample=False`; el muestreo aleatorio no esta validado.
- Riesgo de alucinacion: puede inventar columnas, tablas o funciones que no existen en el esquema proporcionado, especialmente con esquemas grandes o poco convencionales.
- Sesgos: no se documentan analisis de sesgos; al estar entrenado solo en ingles y sobre Spider, el rendimiento en otros idiomas o dominios no esta caracterizado.
- Licencia: los pesos son Apache 2.0 (licencia del modelo base), pero los datos de entrenamiento Spider estan bajo CC BY-SA 4.0, lo que conviene tener en cuenta si se redistribuye el modelo o se derivan obras.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero las limitaciones de dialecto y de verificacion de SQL hacen recomendable un paso de validacion humana o automatica en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HideIron/Qwen2.5-Coder-1.5B-Spider-SQL
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset Spider: https://huggingface.co/datasets/xlangai/spider
- Pagina oficial de Spider: https://yale-lily.github.io/spider
- Evaluador oficial de Spider: https://github.com/taoyds/test-suite-sql-eval
