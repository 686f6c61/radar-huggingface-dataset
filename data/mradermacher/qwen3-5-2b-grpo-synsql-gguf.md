# mradermacher/qwen3.5-2b-grpo-synsql-GGUF

## Resumen

mradermacher/qwen3.5-2b-grpo-synsql-GGUF es la versión cuantizada en formato GGUF del modelo trl-lab/qwen3.5-2b-grpo-synsql, un modelo de lenguaje de aproximadamente 1,94 mil millones de parámetros especializado en text-to-SQL y uso de herramientas sobre SQLite. El modelo original ha sido ajustado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos seeklhy/SynSQL-2.5M, un corpus sintético de 2,5 millones de ejemplos orientado a la generación de consultas SQL. La cuantización la firma mradermacher, autor habitual de versiones GGUF de modelos abiertos.

El interés de esta ficha radica en dos factores. Por un lado, el modelo base pertenece a la familia Qwen 3.5 y se ha entrenado específicamente para una tarea acotada y muy demandada en producción: convertir lenguaje natural en consultas SQL ejecutables, con soporte de agentes y tool calling para iterar sobre errores de ejecución. Por otro, el tamaño reducido del modelo (1,94 B de parámetros, entre 1,1 GB y 4,0 GB según la cuantización) permite desplegarlo en hardware de consumo o en entornos on-premise donde no es viable enviar esquemas de bases de datos a APIs externas.

El repositorio incluye además dos ficheros mmproj (proyector multimodal, de 0,5 GB y 0,8 GB), lo que sugiere que el modelo base incorpora algún componente multimodal, aunque la información disponible no confirma ni detalla esa capacidad. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen 3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94 B), segun safetensors del modelo base |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para transformers) |

## Arquitectura y entrenamiento

No se dispone de la ficha tecnica del modelo base en la informacion proporcionada, por lo que los detalles de arquitectura (numero de capas, dimensiones de atencion, uso de GQA, RoPE, atencion lineal o hibrida) no estan disponibles. Por nomenclatura y por los pesos publicados, se trata de un transformer decoder de la familia Qwen 3.5 con aproximadamente 1,94 B de parametros. No hay evidencia de que sea un modelo de mezcla de expertos, por lo que los parametros activos coinciden con los totales.

El entrenamiento combina un ajuste supervisado previo (no documentado en esta ficha) con una fase de aprendizaje por refuerzo mediante GRPO sobre seeklhy/SynSQL-2.5M. Las etiquetas del repositorio (text-to-sql, sql, sqlite, agent, tool-use, synsql, sqale) indican que el objetivo de entrenamiento es la generacion de consultas SQL para SQLite dentro de un bucle de agente con llamadas a herramientas, es decir, el modelo puede emitir una consulta, observar el resultado o el error de ejecucion y corregir. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de DPO o RLHF. La presencia de ficheros mmproj sugiere un componente multimodal en el modelo base, sin confirmacion documental.

## Capacidades

- Generacion de consultas SQL (text-to-SQL) orientadas a SQLite a partir de lenguaje natural y un esquema dado.
- Uso de herramientas y function calling dentro de un bucle de agente, con la capacidad de ejecutar la consulta, leer el resultado y reescribirla si falla.
- Razonamiento multi-paso acotado a la tarea de base de datos: inspeccion de esquema, planificacion de la consulta, validacion y correccion.
- Capacidad conversacional multi-turno declarada en los tags del repositorio.
- Soporte de ingles exclusivamente; no se declaran capacidades multilingues.
- Posible soporte multimodal (los ficheros mmproj estan presentes), no confirmado ni documentado.
- No se declaran capacidades de codigo general, matematicas avanzadas, vision o audio mas alla de lo anterior.

## Casos de uso

- Consultas sobre bases de datos SQLite en aplicaciones internas: el modelo traduce preguntas en lenguaje natural a SQL ejecutable contra un esquema dado, con un peso en disco de 1,4 GB en Q4_K_M, lo que permite empotrarlo en el propio servicio.
- Agente de analitica autoservicio: integrado en un bucle de tool calling, el modelo genera la consulta, la ejecuta mediante una herramienta, lee el error devuelto por SQLite y la reescribe, reduciendo la intervencion humana en consultas complejas con joins.
- Asistente de BI para perfiles no tecnicos: un usuario de negocio formula preguntas sobre un data warehouse SQLite y el modelo devuelve la tabla de resultados sin que este escriba SQL.
- Generacion asistida en IDE o editor SQL: autocompletado de consultas a partir de un comentario en lenguaje natural o de un esquema abierto, con latencia baja gracias al tamano del modelo.
- Auditoria y explicacion de esquemas: dada una base de datos sin documentacion, el modelo genera consultas de ejemplo que revelan relaciones entre tablas y sirven como base para documentar el modelo de datos.
- Generacion de datos de prueba y fixtures: produccion de consultas de insercion, seleccion y agregacion para poblar bases de datos de test o reproducir escenarios en entornos de integracion continua.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse en local sobre CPU o una GPU de consumo, el esquema y los datos no salen de la infraestructura, lo que encaja con entornos regulados.
- Prototipado rapido de pipelines de datos: el modelo actua como primer eslabon que convierte una especificacion en lenguaje natural en la consulta base, que despues se revisa y se incorpora a un job programado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el cache KV y el overhead del runtime. Valores orientativos segun los ficheros publicados: Q2_K y Q3_K_S unos 1,1 GB; Q4_K_M unos 1,4 GB; Q5_K_M unos 1,6 GB; Q6_K unos 1,7 GB; Q8_0 unos 2,2 GB; f16 unos 4,0 GB. Con contexto corto, el consumo real suele quedar 1-2 GB por encima del peso del fichero.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 2070) ejecuta comodamente las cuantizaciones Q8_0 y f16. Tarjetas de datacenter como A100 o H100 no aportan ventaja para este tamano y solo tienen sentido si se sirven muchas replicas en paralelo.
- Cabe en GPU de consumo: si. Con Q4_K_M (1,4 GB) funciona en GPUs de 4 GB e incluso en graficas integradas con memoria compartida. Las cuantizaciones Q2_K y Q3_K permiten ejecucion holgada en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI sobre GGUF. vLLM ofrece soporte GGUF pero limitado; TGI no es la via recomendada para este formato.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 1,94 B, la generacion en GPU de gama media es del orden de decenas de tokens por segundo, pero no se han publicado mediciones.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparacion se limita a parametros y licencia. El resto de campos figura como no disponible.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| qwen3.5-2b-grpo-synsql (este) | ~1,94 B | no disponible | Apache 2.0 | text-to-SQL sobre SQLite con GRPO y tool use |
| trl-lab/qwen3.5-2b-grpo-synsql (base sin cuantizar) | ~1,94 B | no disponible | Apache 2.0 | identica; pesos en safetensors |
| Otras alternativas de la categoria text-to-SQL (Qwen2.5-Coder, SQLCoder, XiYan-SQL, etc.) | no disponible | no disponible | no disponible | text-to-SQL generico |

No se dispone de resultados comparativos verificables entre este modelo y sus alternativas en la informacion consultada.

## Limitaciones y advertencias

- Entrenamiento sobre un dataset sintetico (SynSQL-2.5M): el rendimiento puede degradarse frente a esquemas reales con convenciones de nombres, tipos o dialectos alejados de los sinteticos.
- Especializacion estrecha: es un modelo de 1,94 B afinado para SQL, no un modelo generalista. Su rendimiento en tareas ajenas al text-to-SQL sera limitado.
- Idioma: solo ingles declarado. Las peticiones en castellano pueden degradar la calidad de la consulta generada.
- Longitud de contexto desconocida: no conviene asumir ventanas largas ni enviar esquemas extensos sin verificar el comportamiento real.
- Riesgo de alucinacion de esquema: puede referenciar tablas o columnas inexistentes. Es imprescindible validar la consulta contra el esquema antes de ejecutarla.
- Riesgo de seguridad: el SQL generado puede contener sentencias destructivas (DROP, DELETE, UPDATE) si no se filtra. Se recomienda ejecutar con un usuario de solo lectura, en una base de datos de test o en un sandbox aislado.
- Cuantizaciones agresivas: Q2_K y Q3_K_S reducen el peso a 1,1 GB a costa de una degradacion de calidad apreciable; el propio repositorio senala Q3_K_M como "lower quality".
- Sin benchmarks publicados: no existen metricas verificables de precision de ejecucion ni de exactitud de coincidencia de consultas, lo que obliga a evaluar el modelo con un conjunto propio antes de llevarlo a produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base ni asume responsabilidad por los resultados.
- Sin soporte ni mantenimiento garantizados: el repositorio esta creado en octubre de 2026 y no registra descargas ni interacciones, por lo que la comunidad y el soporte son inexistentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3.5-2b-grpo-synsql-GGUF
- Modelo base: https://huggingface.co/trl-lab/qwen3.5-2b-grpo-synsql
- Dataset de entrenamiento: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#qwen3.5-2b-grpo-synsql-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
