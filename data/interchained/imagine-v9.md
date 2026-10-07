# Interchained/imagine-v9

## Resumen

Imagine v9 es un modelo de lenguaje compacto especializado en PostgreSQL, generacion de SQL a partir de esquema (schema-grounded text-to-SQL) y razonamiento sobre bases de datos, desarrollado por Interchained. Se trata de un ajuste fino completo (full fine-tune) sobre el checkpoint Imagine v8, que a su vez desciende de la familia DeepSeek-Coder de 1.3B parametros. Con 1.346.471.936 parametros totales (aproximadamente 1,35B) y un repo de 2,7 GB en safetensors, esta pensado para inferencia local y autoalojada, sin dependencia de APIs de inferencia en la nube.

La novedad principal de v9 frente a v8 es que anade capacidad de escritura: ademas de `SELECT` y CTE de solo lectura, el modelo genera sentencias `INSERT`, `UPDATE` y `DELETE` ancladas al esquema proporcionado en el prompt. La licencia es Apache 2.0 y el unico idioma declarado es el ingles. No se especifica en la informacion disponible la longitud de contexto, los tipos de cuantizacion publicados ni detalles de arquitectura mas alla de su linaje DeepSeek-Coder.

El modelo es relevante ahora porque ataca un nicho muy concreto —asistencia SQL local sobre PostgreSQL con contrato de seguridad explicito— en lugar de competir como chatbot generalista. Su pipeline de entrenamiento incorpora una "puerta de ejecucion" que valida parseo, seguridad, binding contra el esquema real y ejecucion efectiva, lo que reduce el riesgo de SQL inventado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje DeepSeek-Coder 1.3B; no se detalla explicitamente en la model card, se infiere del linaje declarado) |
| Parametros totales | 1.346.471.936 (1,35B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Datos adicionales: tamano del repo 2,7 GB; pipeline `text-generation`; compatible con Text Generation Inference y endpoints; creado y actualizado el 6 de octubre de 2026; 0 descargas y 1 like en el momento de la consulta.

## Arquitectura y entrenamiento

La model card no describe la arquitectura a nivel de capas. Lo unico indicado es que Imagine v9 procede de Imagine v8, cuya linea ascendente incluye DeepSeek-Coder 1.3B, lo que situa al modelo en la familia de transformers decoder-only. No se publican datos sobre heads de atencion, dimension de embedding, atencion linear, decodificacion especulativa ni otras innovaciones arquitectonicas.

El entrenamiento consistio en un ajuste fino completo de 1,35B parametros sobre Imagine v8, con 3 epocas, learning rate 1e-5 y scheduler coseno, alcanzando una perdida final de 0,0320. El corpus son 2.739 pares admitidos (1.931 de lectura y 810 de escritura), con una tasa de admision del 99,9%. La parte de escritura se construye con plantillas de `INSERT`/`UPDATE`/`DELETE` verificadas por **efecto** y no por coincidencia de cadena: candidato y referencia se ejecutan sobre dos bases de datos recien materializadas desde un estado identico, y el par solo se admite si ambas acaban en el mismo estado (excluyendo IDs autogenerados). Tambien se incluyen escrituras relacionales a traves de claves foraneas declaradas, ejemplos de anclaje al esquema y entrenamiento orientado a protocolo. La evaluacion y el pipeline de curriculo usan ejecucion real contra PostgreSQL mediante el protocolo de wire compatible de NEDB. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de SQL de lectura sobre PostgreSQL: `SELECT` y CTE de solo lectura (`WITH ... SELECT`).
- Generacion de SQL de escritura: exactamente una sentencia mutadora por peticion (`INSERT INTO ...`, `UPDATE ... SET ... WHERE ...`, `DELETE FROM ... WHERE ...`).
- Anclaje estricto al esquema: solo usa tablas, columnas, claves foraneas y joins declarados en el prompt.
- Manejo de ambiguedad: cuando dos interpretaciones razonables producirian efectos distintos, el modelo pide aclaracion en lugar de elegir en silencio.
- Respuesta de rechazo: emite `UNANSWERABLE` o una peticion de aclaracion cuando la informacion no puede derivarse del esquema.
- Protocolo de salida estructurado con centinelas: `<<<SQL>>> ... <<<END>>>` y `<<<UNANSWERABLE>>> ... <<<END>>>`.
- Generacion de codigo general y asistencia de programacion local (etiquetado como `code-generation`).
- Razonamiento sobre bases de datos y tareas estructuradas.
- Conversacional en modo texto (tag `conversational`).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes multi-paso: no documentado.
- Vision, audio o modo thinking: no soportado segun la informacion disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Asistente SQL embebido en el IDE o en la terminal: el modelo traduce una pregunta en lenguaje natural a una consulta PostgreSQL anclada al DDL real del proyecto, con salida delimitada por `<<<SQL>>>`/`<<<END>>>` que facilita el parseo automatico por parte de la herramienta.
- Migracion y auditoria de consultas: generar equivalentes de SQL legacy contra un esquema objetivo concreto, comprobando primero que el resultado parsea y hace binding contra las tablas y columnas existentes.
- Generacion de scripts de mantenimiento con revision humana: crear `UPDATE` o `DELETE` con clausula `WHERE` a partir de una descripcion, que se ejecutan en un entorno de staging y pasan por revision antes de llegar a produccion.
- Enriquecimiento de pipelines de datos: producir `INSERT` masivos desde plantillas descritas en texto, con la garantia de que el modelo emite exactamente una sentencia mutadora y no cadenas destructivas sin limite.
- Chatbot interno de exploracion de datos: responder preguntas sobre un esquema conocido emitiendo consultas de solo lectura, y devolver `UNANSWERABLE` en lugar de inventar tablas o columnas cuando la pregunta queda fuera del esquema.
- Formacion y onboarding de equipos: usar el modelo como tutor local que explica como formular consultas sobre un esquema real, sin enviar datos ni DDL a servicios externos.
- Preprocesado en pipelines de CI/CD: validar de forma automatica que las consultas generadas cumplen el contrato (una sola sentencia, sin `ALTER`, `DROP`, `CREATE` ni `TRUNCATE`) antes de admitirlas en un repositorio.
- Entornos con requisitos de soberania del dato: al ser un modelo de 1,35B con licencia Apache 2.0 y despliegue local, encaja en escenarios donde el esquema y los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

La unica evaluacion publicada es una evaluacion de telemetria en held-out con 40 preguntas de PostgreSQL.

| Metrica | Imagine v8 (base) | Imagine v9 |
|---|---|---|
| Acierto en el conjunto de 40 preguntas | 50,0% (20/40) | 90,0% (36/40) |
| Cumplimiento de protocolo | No disponible | 100% |
| Parseo estricto | No disponible | 100% |
| Tasa de ejecucion | No disponible | 97,5% |
| Relaciones inventadas | No disponible | 0 |
| Columnas inventadas | No disponible | 0 |
| Rechazos, salidas no parseables o texto extra | No disponible | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la informacion disponible. La model card indica que los fallos restantes en la evaluacion fueron respuestas genuinamente incorrectas (predicados no soportados, rangos de fechas sin limite, `count(DISTINCT ...)`). El propio autor advierte que la coincidencia con una consulta de referencia no equivale a correccion semantica: proyecciones o implementaciones distintas pueden responder correctamente a la misma pregunta.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 los pesos ocupan aproximadamente 2,7 GB; en INT8, alrededor de 1,4 GB; en INT4, en torno a 0,7 GB. Hay que sumar la cache KV, cuyo tamano depende de una longitud de contexto que no se ha publicado.
- GPU recomendadas: cualquier GPU con 4-8 GB o mas de VRAM es suficiente para el modelo en cuantizacion reducida. Placas de gama alta como RTX 4090, A100 o H100 solo aportan ventaja en throughput y en lotes grandes, no en capacidad de alojamiento.
- Consumer GPU: si, cabe con holgura en tarjetas de gama media y de entrada, como RTX 3060 12GB, RTX 4060, RTX 4070 o equivalentes. Tambien es viable en CPU con cuantizacion de 4 bits, aunque con latencias mayores.
- Opciones de despliegue: transformers (formato nativo del repo), Text Generation Inference (el modelo esta etiquetado como compatible con TGI y endpoints), y cualquier runtime que acepte pesos safetensors. Para llama.cpp, Ollama o vLLM seria necesario convertir y/o cuantizar los pesos a GGUF, AWQ o GPTQ, ya que no se publican artefactos de ese tipo en el repo.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Interchained/imagine-v9 | 1,35B | No disponible | PostgreSQL text-to-SQL con lectura y escritura, anclaje a esquema | Apache 2.0 | Pesos safetensors en HuggingFace |
| Interchained/imagine-v8 | No disponible | No disponible | PostgreSQL text-to-SQL solo lectura | No disponible | Pesos en HuggingFace (modelo base de v9) |
| DeepSeek-Coder 1.3B (linaje ascendente) | 1,3B | No disponible en la informacion proporcionada | Generacion de codigo general | No disponible en la informacion proporcionada | Publico |
| Modelos text-to-SQL de 1-2B (Qwen2.5-Coder, CodeLlama, etc.) | Rango 1-2B | No disponible en la informacion proporcionada | Codigo general, no especializados en un SGBD concreto | Variables | Publicos |

No hay datos de rendimiento comparativo directo entre Imagine v9 y estos modelos en la informacion disponible. La comparacion se limita a parametros, licencia y tipo de disponibilidad. Cualquier cifra de MMLU, HumanEval o Spider para las alternativas requeriria consultar sus propias model cards, que no forman parte de la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado explicitamente como un asistente mas focalizado que un chatbot de proposito general; no debe esperarse un rendimiento competitivo en tareas abiertas de conversacion, redaccion o razonamiento generico.
- Operaciones fuera de contrato: no soporta multiples sentencias mutadoras en una misma peticion, ni cambios de esquema (`ALTER`, `DROP`, `CREATE`, `TRUNCATE`), ni operaciones destructivas sin limite. Estas peticiones se rechazan.
- Riesgo de escritura erronea: un `WHERE` incorrecto en un `DELETE` no es un error de redondeo. La propia model card exige que las escrituras pasen siempre por revision humana y que se apliquen controles de permisos a nivel de base de datos.
- Riesgo de alucinacion de esquema: aunque la evaluacion publicada reporta 0 relaciones y 0 columnas inventadas, el modelo sigue siendo un generador de texto y puede fallar ante esquemas muy grandes o prompts ambiguos; se debe validar el binding contra el esquema real antes de ejecutar.
- Ambiguedad: el modelo pide aclaracion en lugar de elegir, lo que exige que la aplicacion cliente gestione el flujo de clarificacion y no lo interprete como un fallo.
- Idioma: solo ingles declarado. No hay soporte documentado de castellano ni de otros idiomas, ni en la generacion de SQL ni en las explicaciones.
- Contexto: no se ha publicado la longitud de contexto, lo que impide planificar el tamano maximo de DDL o de historial conversacional que admite el modelo sin truncado.
- Cuantizaciones: no hay artefactos GGUF, AWQ o GPTQ publicados; desplegar en llama.cpp u Ollama requiere conversion propia no validada por el autor.
- Madurez: el modelo se describe como un checkpoint de investigacion, con 0 descargas y 1 like en el momento de la consulta, lo que sugiere una validacion externa practicamente nula.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias sobre la correccion del SQL generado ni asume responsabilidad por efectos sobre bases de datos en produccion.
- Dependencia de ejecucion real: el pipeline de entrenamiento y evaluacion usa ejecucion contra PostgreSQL mediante el protocolo compatible de NEDB; es posible que el comportamiento fuera de ese entorno de validacion no este caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Interchained/imagine-v9
- Modelo base en HuggingFace: https://huggingface.co/Interchained/imagine-v8
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo, su autor ni su linaje tecnico; los unicos resultados obtenidos fueron paginas genericas sin relacion con Imagine v9.
