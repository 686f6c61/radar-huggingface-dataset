# kakoka/Slonik-27B-oQ8-mtp

## Resumen

Slonik-27B-oQ8-mtp es una cuantización de 8 bits en formato MLX del modelo Slonik-27B, desarrollado por Postgres Professional a partir de Qwen3.8-27B. La ficha corresponde al artefacto publicado por el usuario kakoka en Hugging Face, que empaqueta únicamente el componente de texto del checkpoint original en BF16 y preserva los pesos MTP (multi-token prediction) nativos para habilitar decodificación especulativa. El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) con pesos afines de 8 bits y grupo de 64, orientado a generación de texto y código, con especial énfasis en el dominio PostgreSQL.

La relevancia de esta publicación es doble. Por un lado, ofrece una vía práctica para ejecutar un modelo de casi 30 GB en hardware Apple Silicon con memoria unificada, mediante la librería MLX y el runtime oMLX. Por otro, el autor documenta una comparación medida en un Mac Studio M5 Ultra con 256 GiB de memoria unificada, con cifras concretas de prefill, decodificación y tiempo hasta el primer token, lo que permite evaluar el rendimiento real de la cuantización sin extrapolaciones.

El modelo base Slonik está especializado en tareas de bases de datos PostgreSQL: análisis de planes de ejecución, diagnóstico de consultas y propuesta de cambios SQL. Esta cuantización conserva esa orientación y añade soporte de decodificación especulativa mediante los 15 tensores MTP incluidos, lo que mejora el throughput en decodificación a costa de un mayor tamaño de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con group size 64 (oQ8); el autor publica tambien variantes oQ6e y oQ4e |
| Idiomas soportados | no disponible (la model card solo menciona prompts en ingles en la comparativa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion afin de 8 bits, escalas y offsets incluidos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su filiacion con Qwen3.8-27B y de que se trata de un transformer de 27,3 mil millones de parametros. La model card del artefacto cuantizado no describe la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO. Tampoco se especifica si el modelo incorpora mecanismos de atencion lineal, mezcla de expertos u otras innovaciones arquitectonicas.

El aspecto tecnico mas relevante de esta publicacion es el proceso de cuantizacion. Se aplico oMLX 0.7.4.dev1 en modo Text Only, manteniendo en BF16 los tensores de punto flotante restantes y preservando los pesos MTP. Los 15 tensores MTP nativos estan presentes junto con sus escalas y offsets de cuantizacion. Esta preservacion habilita la decodificacion especulativa mediante la funcion Lightning MTP del runtime oMLX, que el autor activa en todas las mediciones de rendimiento. El repositorio incluye tokenizer y plantilla de chat.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.8-27B.
- Generacion y analisis de codigo, con especializacion declarada en el dominio PostgreSQL.
- Analisis de planes de ejecucion de consultas mediante `EXPLAIN (ANALYZE, BUFFERS)` y propuesta de cambios SQL, segun la comparativa publicada por el autor.
- Decodificacion especulativa mediante pesos MTP nativos y Lightning MTP en oMLX.
- Uso como agente de codigo: la comparativa se realizo con Markov, un agente interno de Postgres Professional bifurcado de Goose.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Vision, audio o modos de razonamiento extendido: no disponible.

## Casos de uso

- Analisis de rendimiento de consultas PostgreSQL: el modelo puede recibir un plan de ejecucion obtenido con `EXPLAIN (ANALYZE, BUFFERS)` y proponer reescrituras SQL o cambios de indices. El autor valido esta capacidad ejecutando las sentencias propuestas contra una instancia aislada y comprobando la equivalencia de resultados en 72 casos.
- Asistencia a desarrolladores de backend en local: al ejecutarse en MLX sobre Apple Silicon, permite integrar un asistente de codigo especializado en Postgres sin enviar esquemas ni consultas a servicios externos, lo que reduce la exposicion de datos sensibles.
- Agente de codigo integrado en flujos de depuracion: la comparativa con Markov demuestra que el modelo puede encadenar pasos (inspeccionar el plan, ejecutar la consulta, proponer el cambio) dentro de un agente forkeado de Goose, lo que lo hace adecuado para pipelines de diagnostico automatizado.
- Revision de migraciones y cambios de esquema: con 27,3 mil millones de parametros y licencia Apache-2.0, puede desplegarse en entornos de integracion continua para revisar sentencias DDL y DML antes de aplicarlas.
- Generacion de codigo en produccion con throughput medido: la variante oQ8+MTP alcanza 61,88 tokens/s de decodificacion en un Mac Studio M5 Ultra, suficiente para asistentes interactivos en editor; la variante oQ4e sube a 78,98 tokens/s con 16,60 GB de pesos, preferible cuando la memoria es limitada.
- Despliegue en estaciones de trabajo de investigacion: al ocupar 29,08 GB en decimal y requerir memoria unificada, cabe en equipos Apple de gama alta y permite experimentar con decodificacion especulativa MTP sin infraestructura de GPU.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye datos de prefill, decodificacion y TTFT para tres variantes (oQ8, oQ6e, oQ4e), lo que facilita elegir el equilibrio entre precision y velocidad para un caso concreto.

## Benchmarks y rendimiento

El autor publica una comparativa medida en un Mac Studio M5 Ultra con 256 GiB de memoria unificada. Cada fila corresponde a tres ejecuciones calentadas con el mismo prompt en ingles sobre PostgreSQL, 437 tokens de entrada, 256 tokens generados, cero tokens de entrada en cache, thinking desactivado y Lightning MTP activado.

| Variante | Pesos | Prefill (tok/s) | Decode (tok/s) | TTFT (s) | Total (s) |
|---|---:|---:|---:|---:|---:|
| oQ8 + MTP | 29,08 GB | 1.043,79 | 61,88 | 0,42 | 4,53 |
| oQ6e + MTP | 22,94 GB | 984,09 | 57,71 | 0,44 | 4,88 |
| oQ4e + MTP | 16,60 GB | 1.277,99 | 78,98 | 0,34 | 3,58 |

La validacion funcional consistio en que cada modelo investigara el mismo problema de PostgreSQL usando el agente Markov, ejecutara `EXPLAIN (ANALYZE, BUFFERS)` contra una instancia aislada y propusiera un cambio SQL; las sentencias propuestas se ejecutaron de forma independiente y se verifico que devolvieran las mismas filas en el mismo orden que la consulta original en 72 casos.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 29,08 GB solo para los pesos en la variante oQ8; 22,94 GB para oQ6e; 16,60 GB para oQ4e. Hay que sumar el espacio para cache KV y overhead del runtime.
- Hardware de referencia: Mac Studio M5 Ultra con 256 GiB de memoria unificada, donde se obtuvieron las cifras de la tabla anterior.
- GPU dedicadas: no disponible. El artefacto esta empaquetado para MLX, por lo que el despliegue objetivo es Apple Silicon; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible para CUDA. En Apple Silicon requiere equipos con memoria unificada suficiente; la variante oQ4e de 16,60 GB es la mas viable en configuraciones de gama alta con 32 GB o mas.
- Opciones de despliegue: oMLX (runtime indicado por el autor, con Lightning MTP para decodificacion especulativa). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: prefill de 1.043,79 tok/s, decodificacion de 61,88 tok/s y TTFT de 0,42 s para oQ8+MTP en el hardware de referencia, con la configuracion de prompt descrita.

## Comparativa con modelos similares

La informacion disponible solo permite comparar entre las propias cuantizaciones publicadas por el autor. No se aportan datos de modelos alternativos de la misma categoria.

| Modelo | Parametros | Contexto | Pesos | Decode (tok/s) | Licencia |
|---|---|---:|---:|---:|---|
| Slonik-27B-oQ8-mtp | 27,3 B | no disponible | 29,08 GB | 61,88 | Apache-2.0 |
| Slonik-27B-oQ6e-mtp | 27,3 B (base) | no disponible | 22,94 GB | 57,71 | Apache-2.0 |
| Slonik-27B-oQ4e-mtp | 27,3 B (base) | no disponible | 16,60 GB | 78,98 | Apache-2.0 |

Comparativa con modelos de otros autores: no disponible.

## Limitaciones y advertencias

- El artefacto es una cuantizacion de 8 bits: introduce perdida de precision respecto al checkpoint BF16 original, no evaluada de forma sistematica en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 7 de noviembre de 2026; se trata de una publicacion reciente y sin validacion independiente por parte de la comunidad.
- La comparativa de rendimiento procede del propio autor y se limita a un unico hardware (Mac Studio M5 Ultra) y a un unico dominio (PostgreSQL en ingles); no es extrapolable a otras cargas.
- Solo se empaqueta el componente de texto; no hay soporte de vision ni de otras modalidades.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del ingles en el que se realizaron las pruebas.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones o documentos largos sin verificacion previa.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en la propuesta de cambios SQL; el propio autor valida las sentencias ejecutandolas contra una instancia aislada, practica recomendable en produccion.
- Sesgos conocidos: no disponible.
- Licencia Apache-2.0, que permite uso comercial con obligaciones de atribucion; el repositorio incluye LICENSE, NOTICE y licencias upstream para preservar la cadena de atribucion.
- Dependencia del runtime oMLX y de Apple Silicon: no hay ruta de despliegue documentada para CUDA, ROCm ni CPU generica.
- La decodificacion especulativa requiere activar Lightning MTP en la configuracion del modelo; sin esa opcion, el rendimiento de decodificacion sera inferior al reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakoka/Slonik-27B-oQ8-mtp
- Modelo base Slonik: https://huggingface.co/dglhf/Slonik
- Checkpoint fuente BF16 (revision 321d879c39a809057f324a8133c9484e4c192c06, subdirectorio 27B): https://huggingface.co/dglhf/Slonik/tree/321d879c39a809057f324a8133c9484e4c192c06/27B
- Documentacion de cuantizacion oQ de oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Benchmark del autor (prompts en ingles, resultados y revision de respuestas): BENCHMARK.md dentro del repositorio del modelo
