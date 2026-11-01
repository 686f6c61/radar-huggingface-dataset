# FINAL-Bench/Darwin-180B-NL2SQL

## Resumen
Darwin-180B-NL2SQL es un sistema de text-to-SQL desarrollado por VIDRAFT y publicado bajo la organizacion FINAL-Bench en Hugging Face. El sistema convierte una pregunta en lenguaje natural en una consulta SQLite, la ejecuta contra la base de datos, revisa la consulta a partir del resultado de la ejecucion y devuelve una unica consulta final por pregunta. El repositorio no contiene pesos entrenados especificamente para esta tarea: los pesos son los del modelo base Darwin-180B-RSI, sin modificar, y la mejora de rendimiento proviene del motor de verificacion NL2SQL propietario de VIDRAFT, que no se distribuye.

La relevancia del artefacto es doble. Por un lado, publica un resultado medido de 83,80 % de execution accuracy estricta sobre BIRD Mini-Dev en SQLite (419 de 500 preguntas), con un protocolo de evaluacion documentado que excluye el uso de SQL de referencia durante la inferencia y el fine-tuning sobre BIRD. Por otro, separa explicitamente el modelo del sistema: quien quiera reproducir el resultado necesita los pesos de Darwin-180B-RSI mas el motor de verificacion, que no esta disponible publicamente.

El modelo base tiene 180 000 millones de parametros segun su denominacion, y el sistema esta orientado exclusivamente al ingles y al dominio de bases de datos relacionales SQLite. La licencia declarada es Apache 2.0, aunque la del componente de verificacion no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Darwin-180B-RSI; el repositorio no documenta la arquitectura) |
| Parametros totales | 180 000 millones (segun la denominacion del modelo base; no verificado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (los pesos se alojan en FINAL-Bench/Darwin-180B-RSI; este repositorio solo contiene predicciones y el script de evaluacion) |

## Arquitectura y entrenamiento
El repositorio Darwin-180B-NL2SQL no documenta la arquitectura interna del modelo base. Lo que si se especifica es que no se entreno ni se modifico ningun peso para obtener el resultado: el modelo es Darwin-180B-RSI sin cambios, y la capa que aporta la funcionalidad text-to-SQL es el motor de verificacion NL2SQL de VIDRAFT, que comprueba cada consulta generada contra la base de datos en vivo antes de devolver una respuesta. Ese motor es una implementacion propietaria y no se ha publicado.

El flujo del sistema es iterativo: generacion de la consulta, ejecucion en modo de solo lectura, revision a partir de lo que muestra la ejecucion y seleccion de una unica consulta final por pregunta. No se detalla el numero de iteraciones, el mecanismo de seleccion ni el prompt utilizado. Tampoco se indica el volumen ni la composicion de los datos de entrenamiento del modelo base, ni si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades
- Generacion de consultas SQLite a partir de preguntas en lenguaje natural, con acceso al esquema y a la evidencia asociada a cada pregunta.
- Ejecucion y verificacion de la consulta generada contra la base de datos real, con revision basada en el resultado de la ejecucion.
- Autocorreccion de la consulta a partir de errores o resultados inesperados durante la inferencia.
- Entrega de una unica consulta final por pregunta, en el formato de envio de BIRD Mini-Dev.
- Cobertura de consultas de dificultad simple, moderada y desafiante dentro del benchmark BIRD.
- Soporte de multiples bases de datos SQLite dentro del conjunto de evaluacion.
- No se documentan capacidades de tool calling generico, agentes multi-paso fuera del bucle NL2SQL, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Consulta de bases de datos internas en lenguaje natural: un analista formula la pregunta en ingles y el sistema devuelve una consulta SQLite ejecutable, con verificacion previa contra la base de datos para reducir errores de sintaxis y de columnas inexistentes.
- Generacion de informes ad hoc sobre datos operativos: el bucle de ejecucion y revision permite obtener resultados correctos en esquemas desconocidos sin escribir SQL manualmente, siempre que la base sea SQLite.
- Asistencia a equipos de business intelligence: el sistema puede actuar como capa de traduccion entre preguntas de negocio y consultas tecnicas, con la ventaja de que valida la consulta antes de mostrarla.
- Prototipado de interfaces de autoservicio de datos: util para construir demos de chat sobre bases de datos de solo lectura, dado que el sistema ejecuta las consultas en modo restringido.
- Evaluacion comparativa de pipelines text-to-SQL: el repositorio incluye el script de scoring y las predicciones, lo que permite reproducir la metrica de execution accuracy estricta y comparar contra otros sistemas sobre el mismo conjunto.
- Investigacion en verificacion de consultas: el artefacto sirve como referencia de un enfoque basado en ejecucion y revision, aunque el motor concreto no sea auditable.
- Limitacion practica: cualquier uso en produccion requiere el motor de verificacion de VIDRAFT, no publicado, o una reimplementacion propia del bucle de ejecucion y revision.

## Benchmarks y rendimiento
Resultados publicados sobre BIRD Mini-Dev, SQLite, 500 preguntas, con execution accuracy estricta (conjunto de filas devueltas identico al de la consulta de referencia, con 60 segundos de ejecucion maxima por consulta):

| Dificultad | Correctas | Precision |
|---|---|---|
| Challenging | 384 / 460 | 83,5 % |
| Moderate | 29 / 32 | 90,6 % |
| Simple | 6 / 8 | 75,0 % |
| **Total** | **419 / 500** | **83,80 %** |

Condiciones declaradas: sin uso de SQL de referencia en ninguna etapa de la inferencia, sin conocimiento oracle mas alla de la pregunta y la evidencia, sin fine-tuning sobre BIRD, una candidata final por pregunta y acceso a la base de datos unicamente en modo de solo lectura para ejecutar las consultas propias del sistema. La medicion se realizo el 29 de octubre de 2026 (KST) y se repitio dos veces en una maquina inactiva con resultado identico. El dataset utilizado es la release canonica `birdsql/bird_mini_dev`, version "Mini-Dev 1024", fichero `data/mini_dev_sqlite.jsonl` con sha256 `926af2a0d1b47e5d0d15a7aa8a34d4721007f4550a881555b6a89496b54a2606`. No se publican resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Con 180 000 millones de parametros, la inferencia en precision completa requiere agregacion de memoria en multiples aceleradores; no se documentan cuantizaciones soportadas ni requisitos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el despliegue en precision de 16 bits excede con holgura la memoria de una sola GPU de 80 GB.
- Cabe en GPU de consumo: no disponible; no se documenta ninguna configuracion validada en GPUs consumer.
- Opciones de despliegue: la model card unicamente muestra carga mediante `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`, usando `torch_dtype="auto"` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion impone un limite de 60 segundos por consulta ejecutada, pero no se publican tiempos medios.

## Comparativa con modelos similares
No se dispone de datos comparativos en la informacion proporcionada sobre otros sistemas text-to-SQL con los que contrastar parametros, contexto, rendimiento o licencia. El propio artefacto se define frente a BIRD Mini-Dev, pero no incluye una tabla comparativa con alternativas.

| Modelo | Parametros | Contexto | BIRD Mini-Dev (SQLite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-180B-NL2SQL | 180 000 M (modelo base) | no disponible | 83,80 % Ex | apache-2.0 (pesos); motor de verificacion no publicado | Pesos en HF, sistema completo no |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- El repositorio no contiene pesos: solo predicciones y el script de evaluacion. Los pesos deben descargarse de FINAL-Bench/Darwin-180B-RSI y son identicos al modelo base.
- El componente que aporta la funcionalidad NL2SQL, el motor de verificacion de VIDRAFT, es propietario y no se distribuye, por lo que el resultado de 83,80 % no es reproducible sin el.
- El sistema esta limitado a SQLite y a preguntas en ingles; no se documenta soporte de otros dialectos SQL ni de otros idiomas.
- El conjunto de evaluacion es Mini-Dev (500 preguntas), no el conjunto completo de BIRD, y la distribucion por dificultad esta muy desbalanceada (460 preguntas challenging frente a 8 simple), lo que hace que la precision en simple sea poco representativa.
- No se documentan sesgos conocidos del modelo base ni evaluaciones de robustez fuera del dominio text-to-SQL.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el bucle de ejecucion y revision esta disenado precisamente para mitigar consultas invalidas o incorrectas.
- La licencia Apache 2.0 se declara para el repositorio y los pesos del modelo base, pero no queda claro que cubra el motor de verificacion, que no se publica.
- No hay datos de contexto maximo, cuantizaciones ni rendimiento en produccion, lo que dificulta dimensionar un despliegue real.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-NL2SQL
- Modelo base (pesos): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI
- Organizacion FINAL-Bench: https://huggingface.co/FINAL-Bench
- Dataset BIRD Mini-Dev: https://huggingface.co/datasets/birdsql/bird_mini_dev
- Demo publica del motor NL2SQL de VIDRAFT (coreano e ingles, solo lectura, datos sinteticos): https://final-bench-nl2sql-demo.hf.space/
- Sitio de VIDRAFT: https://vidraft.net
- Contacto: vidraft@mail.vidraft.net
