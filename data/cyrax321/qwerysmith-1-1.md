# Cyrax321/QwerySmith-1.1

## Resumen

QwerySmith 1.1 es un ajuste fino especializado en text-to-SQL sobre el modelo denso Qwen3-4B de Alibaba, publicado por el usuario Cyrax321 en HuggingFace. El modelo parte de `unsloth/Qwen3-4B` y se entrena con QLoRA mediante la libreria Unsloth, con el objetivo declarado de ser un modelo "production-ready" que traduzca pares de esquema y pregunta en lenguaje natural a una unica consulta SQL valida. El repositorio ocupa 0,1 GB y esta publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha esta en su naturaleza de ajuste pequeno y evaluado con honestidad metodologica: el autor publica intervalos de confianza al 95 % para la exactitud de ejecucion y distingue explicitamente entre conjuntos en distribucion (`in_dist`), casi-en-distribucion (`gretel_test`) y conjuntos reservados (`heldout_sqale`, `heldout_large_schema`). Los resultados muestran mejoras claras en distribucion (88,5 % de exactitud de ejecucion frente al 67,2 % del modelo base) pero degradacion en los conjuntos reservados, un patron tipico de sobreajuste al estilo de datos de entrenamiento.

El modelo se apoya en tres datasets publicos de text-to-SQL y se usa con la plantilla de chat de Qwen3 (ChatML con etiquetas ` thinking`), aunque el autor no documenta parametros totales confirmados, longitud de contexto nativa ni idiomas soportados. No tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); no se detalla en la model card |
| Parametros totales | No confirmado en la model card; el nombre del modelo base (`unsloth/Qwen3-4B`) indica 4 000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; el ejemplo de uso del autor configura `max_seq_length=2048` |
| Tipos de cuantizacion | No se publican variantes GGUF, AWQ ni GPTQ; el ejemplo oficial carga con `load_in_4bit=True` (bitsandbytes) |
| Idiomas soportados | No disponible; hereda las capacidades linguisticas del modelo base, sin detalle en la model card |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un ajuste fino con QLoRA (cuantizacion de 4 bits mas adaptadores de bajo rango) ejecutado con la libreria Unsloth sobre `unsloth/Qwen3-4B`. No se especifican el rango de los adaptadores, el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF, DPO o preferencias. La unica informacion de entrenamiento disponible es la lista de fuentes de datos: `b-mc2/sql-create-context`, `gretelai/synthetic_text_to_sql` y `trl-lab/SQaLe-text-to-SQL-dataset`.

El autor documenta una decision metodologica relevante en la version 1.1: cuando una fuente se incluye en la mezcla de entrenamiento (`--mix`), su split de test deja de ser una prueba de generalizacion y pasa a considerarse casi-en-distribucion. Por eso los unicos conjuntos que miden generalizacion real son los `heldout_<name>`, que nunca aparecen en la mezcla. Esta separacion, junto con la publicacion de intervalos de confianza, permite leer los resultados con mas cautela que en la mayoria de fichas de modelos pequenos.

## Capacidades

- Generacion de consultas SQL a partir de un esquema de base de datos y una pregunta en lenguaje natural, devolviendo "exactamente una consulta SQL y nada mas" segun el prompt de sistema recomendado.
- Modo de razonamiento de Qwen3: la plantilla de ejemplo incluye un bloque ` thinking` (vacio, para desactivar el razonamiento extendido). El autor no documenta si el ajuste conserva las capacidades de thinking del modelo base.
- Manejo de esquemas con sintaxis `CREATE TABLE` y preguntas de agregacion, filtrado y seleccion de columnas (segun los ejemplos de la model card).
- Compatibilidad con la libreria Unsloth (`FastLanguageModel`) y con el ecosistema estandar de HuggingFace `transformers`.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingues: no documentadas.
- Capacidades de vision, audio o multimodalidad: no disponibles (el modelo base Qwen3-4B es solo texto).

## Casos de uso

- Asistente de analitica conversacional sobre bases de datos SQLite: el modelo traduce preguntas de negocio a consultas ejecutables, con un 88,5 % de exactitud de ejecucion en el conjunto en distribucion, suficiente para un asistente con validacion humana previa a la ejecucion.
- Autoservicio de datos para equipos no tecnicos (BI): integrado en una herramienta de dashboards, permite a perfiles de negocio generar consultas sin escribir SQL, usando el esquema de la tabla como contexto.
- Generacion de candidatos de consulta en pipelines de ciencia de datos: el modelo produce una primera version de la query sobre la que un analista itera, reduciendo el tiempo de escritura en tareas repetitivas de exploracion.
- Formacion y ensenanza de SQL: dado un esquema didactico, el modelo muestra la consulta equivalente a una pregunta en lenguaje natural, util en entornos de aprendizaje con supervision del profesorado.
- Prototipado rapido de capas semanticas: al ser un modelo de 4B con licencia MIT y 0,1 GB de repositorio, puede desplegarse como servicio interno en una maquina modesta para generar borradores de consultas en pruebas de concepto.
- Preprocesado de datos para entrenamiento: generar consultas SQL sinteticas controladas para aumentar datasets de text-to-SQL, teniendo en cuenta la advertencia del autor de que el modelo falla mas en esquemas grandes.
- Triaje de incidencias en pipelines de datos: convertir la descripcion de una anomalia en una consulta de diagnostico que un ingeniero revisa antes de ejecutar en produccion.
- Traduccion de preguntas a SQL en dialectos compatibles: con precaucion, porque el autor advierte que la evaluacion se hizo en SQLite y algunas consultas correctas en Postgres o MySQL se marcan como erroneas.

## Benchmarks y rendimiento

Resultados publicados por el autor. `valid SQL` es el porcentaje de consultas que se ejecutan sin error en SQLite; `exact match` es igualdad de cadena normalizada con la consulta de referencia; `execution acc` mide coincidencia de filas devueltas y solo se calcula sobre los elementos cuya consulta de referencia devuelve al menos una fila (columna `scored`).

| Conjunto | Sistema | SQL valido | Exact match | Exactitud de ejecucion (IC 95 %) | Evaluados |
|---|---|---|---|---|---|
| in_dist | base zeroshot | 98,5 % | 6,0 % | 67,2 % (54,7 %-77,7 %) | 61/200 |
| in_dist | base few-shot | 98,0 % | 7,0 % | 67,2 % (54,7 %-77,7 %) | 61/200 |
| in_dist | finetuned | 98,0 % | 84,5 % | 88,5 % (78,2 %-94,3 %) | 61/200 |
| gretel_test | base zeroshot | 92,7 % | 26,0 % | 52,3 % (46,7 %-58,0 %) | 298/300 |
| gretel_test | base few-shot | 88,7 % | 26,3 % | 47,3 % (41,7 %-53,0 %) | 298/300 |
| gretel_test | finetuned | 90,7 % | 32,0 % | 55,7 % (50,0 %-61,2 %) | 298/300 |
| heldout_sqale | base zeroshot | 78,7 % | 12,8 % | 50,0 % (35,8 %-64,2 %) | 44/47 |
| heldout_sqale | base few-shot | 70,2 % | 12,8 % | 40,9 % (27,7 %-55,6 %) | 44/47 |
| heldout_sqale | finetuned | 80,9 % | 10,6 % | 45,5 % (31,7 %-59,9 %) | 44/47 |
| heldout_large_schema | base zeroshot | 61,0 % | 1,9 % | 21,8 % (15,8 %-29,3 %) | 142/154 |
| heldout_large_schema | base few-shot | 53,9 % | 2,6 % | 19,7 % (14,0 %-27,0 %) | 142/154 |
| heldout_large_schema | finetuned | 55,8 % | 1,9 % | 17,6 % (12,2 %-24,7 %) | 142/154 |

Comparaciones por pares publicadas por el autor (solo elementos correctos en ejecucion en un lado):

| Conjunto | Victorias del ajustado | Victorias del base 3-shot |
|---|---|---|
| in_dist | 13 | 0 |
| gretel_test | 43 | 18 |
| heldout_sqale | 4 | 2 |
| heldout_large_schema | 10 | 13 |

Caveats declarados: los intervalos de confianza se solapan en varios conjuntos, por lo que no puede afirmarse superioridad estadistica; `in_dist` no tiene datos reales y rellena tablas con filas aleatorias derivadas de los literales de la consulta de referencia; `gretel_test` incluye filas `INSERT` propias en el 79 % de los elementos, mientras que `heldout_sqale` y `heldout_large_schema` no incluyen ninguna; la salida del modelo base se parsea de forma permisiva (se eliminan bloques de codigo y texto adicional).

## Requisitos de hardware

Estimaciones a partir del tamano del modelo base (4B) y de las opciones de carga documentadas. No hay mediciones de latencia o throughput publicadas por el autor.

- VRAM en bf16/fp16: aproximadamente 8-9 GB solo para pesos, mas 1-3 GB de cache KV segun longitud de secuencia y batch. No cabe en GPUs de 8 GB.
- VRAM en 4 bits (bitsandbytes, como en el ejemplo oficial): aproximadamente 3-4 GB de pesos, ajustable en GPUs consumer de 8-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G para 4 bits; A100 40/80 GB o H100 para despliegues en precision completa con batches grandes.
- Cabe en GPU consumer: si, en cuantizacion de 4 bits en tarjetas de 8 GB o mas; en bf16 requiere 12-16 GB.
- Opciones de despliegue: el camino documentado es `unsloth` + `transformers` con `load_in_4bit=True`; al publicarse solo safetensors sin variantes GGUF, para `llama.cpp` u `Ollama` habria que convertir los pesos previamente. Compatible con vLLM o TGI si se sirven los pesos en bf16 y la GPU tiene VRAM suficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa basada exclusivamente en los sistemas evaluados en la model card y en datos estructurales disponibles. No se dispone de datos de otros modelos de text-to-SQL en la informacion proporcionada.

| Modelo | Parametros | Contexto | Exactitud de ejecucion (in_dist) | Exactitud de ejecucion (heldout_large_schema) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QwerySmith 1.1 (finetuned) | 4B (por modelo base) | No disponible (ejemplo con 2048) | 88,5 % | 17,6 % | MIT | HuggingFace, safetensors |
| Qwen3-4B base zeroshot | 4B | No disponible | 67,2 % | 21,8 % | No disponible en la informacion | HuggingFace |
| Qwen3-4B base few-shot (3 ejemplos) | 4B | No disponible | 67,2 % | 19,7 % | No disponible en la informacion | HuggingFace |

Otros modelos de la categoria text-to-SQL (por ejemplo, la familia SQLCoder o variantes ajustadas de CodeLlama) no cuentan con resultados comparables en la informacion proporcionada: no disponibles.

## Limitaciones y advertencias

- Degradacion fuera de distribucion: en `heldout_large_schema` el modelo ajustado obtiene un 17,6 % de exactitud de ejecucion frente al 21,8 % del base zeroshot, y en `heldout_sqale` un 45,5 % frente al 50,0 %. El ajuste fino no mejora la generalizacion a estilos de SQL no vistos.
- Esquemas grandes: el rendimiento cae drasticamente (por debajo del 22 % en todos los sistemas) cuando el esquema es extenso, lo que limita su uso directo en bases de datos con cientos de tablas sin una etapa previa de seleccion de esquema.
- Sobreajuste a formato: el `exact match` del 84,5 % en `in_dist` contrasta con el 32,0 % en `gretel_test`, lo que sugiere una fuerte dependencia del estilo de consulta presente en los datos de entrenamiento.
- Riesgo de alucinacion de esquema: como cualquier modelo de generacion de codigo, puede inventar tablas, columnas o funciones que no existen en el `CREATE TABLE` proporcionado. La validacion contra el esquema real antes de ejecutar es imprescindible en produccion.
- Dialecto limitado a SQLite: la evaluacion se realizo en SQLite, y el propio autor advierte que consultas correctas en Postgres o MySQL pueden marcarse como erroneas. El comportamiento en otros dialectos no esta medido.
- Metrica de evaluacion debil: los conjuntos sin filas `INSERT` propias usan filas aleatorias generadas a partir de los literales de la consulta de referencia, lo que puede hacer que dos consultas distintas parezcan equivalentes.
- Fuga de datos metodologica ya corregida parcialmente: en la version 1.1, `gretel_test` deja de ser una prueba de generalizacion porque su fuente se incluye en la mezcla de entrenamiento. Solo los conjuntos `heldout_*` son validos para medir generalizacion.
- Idiomas y multilingueismo: sin datos publicados; no debe asumirse un rendimiento solido fuera del ingles sin evaluacion previa.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni validacion por parte de terceros.
- Tamano del repositorio (0,1 GB) muy inferior al de un modelo de 4B en precision completa, lo que sugiere que pueden ser adaptadores o pesos comprimidos; conviene verificar la estructura real del repositorio antes de integrarlo en un pipeline de produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero no exime de las obligaciones de atribucion ni de las condiciones aplicables al modelo base `unsloth/Qwen3-4B`, que deben verificarse por separado.
- Sin garantias de soporte: el autor no publica informacion de contacto, paper ni repositorio de codigo asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cyrax321/QwerySmith-1.1
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Dataset b-mc2/sql-create-context: https://huggingface.co/datasets/b-mc2/sql-create-context
- Dataset gretelai/synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset trl-lab/SQaLe-text-to-SQL-dataset: https://huggingface.co/datasets/trl-lab/SQaLe-text-to-SQL-dataset
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Papel, blog, repositorio o demo del modelo: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces obtenidos correspondian a contenido no pertinente (guia de pizzeria en Austin) y se han descartado.
