# Interchained/imagine-v8

## Resumen

Imagine v8 es un modelo de lenguaje compacto especializado en generacion de SQL para PostgreSQL, desarrollado por Interchained mediante ajuste fino supervisado sobre el modelo base deepseek-ai/deepseek-coder-1.3b-instruct. Con 1.346.471.936 parametros (aproximadamente 1,35 B) y pesos en safetensors, esta disenado para tareas de text-to-SQL ancladas al esquema (schema-grounded), razonamiento sobre bases de datos y asistencia de codigo en local, con un contrato estricto de solo lectura sobre la base de datos.

A diferencia de un chatbot generalista, Imagine v8 se posiciona como un checkpoint de investigacion de proposito especifico: la model card incide en que el SQL generado debe parsear correctamente, respetar el contrato de solo lectura, enlazar contra el esquema real suministrado y ejecutarse con exito en PostgreSQL. El proyecto emplea ejecucion real de PostgreSQL como parte de su pipeline de evaluacion y de generacion de curriculo (execution-gated curriculum), lo que lo distingue de enfoques puramente supervisados sobre pares pregunta-SQL de referencia.

El modelo es relevante ahora por su enfoque local-first y autoalojado: no requiere una API de inferencia en la nube y esta pensado para ejecutarse en hardware controlado por el usuario, lo que resulta atractivo en escenarios con requisitos de privacidad de datos y en entornos air-gapped. No obstante, el repositorio no declara licencia ni idiomas soportados, y la evaluacion publicada corresponde a la linea v6, no al checkpoint v8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, segun etiquetas; derivada de DeepSeek-Coder 1.3B Instruct) |
| Parametros totales | 1.346.471.936 (aproximadamente 1,35 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DeepSeek-Coder-1.3B-Instruct soporta 16.384 tokens segun su documentacion, pero la model card de Imagine v8 no lo especifica) |
| Tipos de cuantizacion | No se documentan cuantizaciones alternativas; el ejemplo de carga usa bfloat16 sobre pesos safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (biblioteca transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia llama, heredado del modelo base DeepSeek-Coder-1.3B-Instruct. Imagine v8 se ha producido mediante ajuste fino completo iterativo (iterative full fine-tuning), no mediante adaptadores tipo LoRA segun lo descrito. La ruta de entrenamiento incluye: el base DeepSeek-Coder 1.3B Instruct, ajuste fino supervisado centrado en PostgreSQL, generacion de curriculo SQL con puerta de ejecucion (execution-gated), entrenamiento de identidad, ejemplos adversarios de identidad, ejemplos de anclaje al esquema (schema grounding), entrenamiento orientado al protocolo y entrenamiento ampliado de contrato de sistema.

La innovacion tecnica destacable es el uso de ejecucion real de PostgreSQL como criterio de evaluacion y curacion del curriculo. La verificacion se articula en varios niveles: parseo (la consulta debe parsear como PostgreSQL), seguridad (debe satisfacer el contrato de solo lectura), enlace o bind (debe resolverse contra el esquema real, detectando tablas o columnas inexistentes y referencias ambiguas), ejecucion (debe ejecutarse correctamente) y acuerdo de resultados (comparacion con una consulta de referencia). El modelo define ademas un protocolo de salida estructurado con centinelas: `<<<SQL>>> ... <<<END>>>` para consultas y `<<<UNANSWERABLE>>> ... <<<END>>>` para peticiones no resolubles. El contrato excluye explicitamente sentencias mutantes o destructivas (INSERT, UPDATE, DELETE, MERGE, TRUNCATE, ALTER, DROP, CREATE, COPY).

## Capacidades

- Generacion de SQL para PostgreSQL, incluyendo consultas `SELECT` y `WITH ... SELECT` de solo lectura.
- Text-to-SQL anclado al esquema: el modelo debe usar unicamente tablas, columnas, relaciones, claves foraneas y claves de union presentes en el esquema suministrado en el prompt, sin inventar identificadores.
- Manejo de ambiguedad: ante dos interpretaciones razonables que produzcan SQL o resultados materialmente distintos, el modelo esta entrenado para pedir aclaracion en lugar de elegir en silencio.
- Comportamiento de abstención: puede emitir `UNANSWERABLE` cuando la informacion solicitada no se puede derivar del esquema proporcionado.
- Protocolo de salida estructurado mediante centinelas (`<<<SQL>>>`, `<<<END>>>`, `<<<UNANSWERABLE>>>`).
- Asistencia de codigo en local y tareas estructuradas de base de datos.
- Identidad entrenada: el modelo despliega la identidad "Imagine" (con ejemplos adversarios de identidad para reforzarla), manteniendo a DeepSeek-Coder como linaje upstream.
- Soporte conversacional mediante plantilla de chat (`apply_chat_template`).

No se documentan en la informacion disponible capacidades de vision, audio, tool calling, function calling ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Text-to-SQL sobre PostgreSQL en produccion interna: el modelo recibe un esquema y una pregunta en lenguaje natural y devuelve una consulta `SELECT` anclada al esquema, con salida delimitada por los centinelas del protocolo, lo que facilita su integracion en un orquestador que extraiga el bloque SQL.
- Asistente de base de datos de solo lectura: al estar entrenado para excluir sentencias mutantes, encaja en flujos de consulta y exploracion donde no se debe permitir escritura, siempre que la restriccion se refuerce a nivel de permisos de base de datos.
- Analitica y BI autoservicio: un usuario no tecnico plantea preguntas sobre metricas agregadas (por ejemplo, `SELECT AVG(cpu_pct) FROM samples;`) y el modelo genera la consulta para un panel o cuaderno de datos.
- Automatizacion de pipelines de datos en local: al ser local-first y no requerir API en la nube, puede integrarse en un job que traduzca plantillas de preguntas en consultas ejecutables contra una instancia PostgreSQL propia.
- Asistencia en el IDE para desarrolladores de backend: generacion y ajuste de consultas SQL dentro de un editor, con el esquema del proyecto inyectado como contexto para reducir errores de columnas y tablas inexistentes.
- Despliegue air-gapped con datos sensibles: su naturaleza autoalojada y su tamano reducido permiten ejecutarlo en infraestructura propia sin enviar esquemas ni datos a servicios externos.
- Investigacion en text-to-SQL y evaluacion de contratos: util como punto de comparacion para estudiar metricas de cumplimiento de protocolo, ejecutabilidad y acuerdo de resultados frente a correccion semantica.
- Generacion de curriculo y datos sinteticos SQL: el enfoque de execution-gated curriculum puede reutilizarse para producir y filtrar pares pregunta-SQL validados por ejecucion real.

## Benchmarks y rendimiento

La informacion disponible solo reporta una evaluacion de telemetria retenida sobre 21 preguntas de PostgreSQL, y corresponde a un checkpoint de la linea v6, no al checkpoint v8. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (checkpoint de la linea v6, 21 preguntas) | Resultado |
|---|---|
| Tasa de parseo estricto | 100 % |
| Tasa de ejecucion | 100 % |
| Relaciones inventadas | 0 |
| Columnas inventadas | 0 |
| Rechazos (refusals) | 0 |
| Coincidencias estrictas con el resultado de referencia | 15/21 |
| Puntuacion estricta de acuerdo de ejecucion | 71,4 % |

Nota del autor: parte de las discrepancias frente a la referencia correspondian a SQL valido y ejecutable que diferia de la consulta de referencia en proyeccion o implementacion; por ello el proyecto distingue entre cumplimiento de protocolo, ejecutabilidad en PostgreSQL, acuerdo exacto de resultados y correccion semantica. No hay datos de rendimiento publicados para el checkpoint v8.

## Requisitos de hardware

Estimaciones a partir de los 1,35 B de parametros; no son cifras publicadas por el autor.

| Precision | Peso aproximado | VRAM estimada para inferencia |
|---|---|---|
| bfloat16 | ~2,7 GB | ~4-6 GB (dependiendo de contexto y cache KV) |
| 8 bits | ~1,4 GB | ~2,5-3,5 GB |
| 4 bits | ~0,75 GB | ~1,5-2,5 GB |

- Cabe en GPU de consumo: cualquier GPU con 6-8 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutarlo en bfloat16 sin problemas.
- GPU profesionales: A100, H100, L40S, etc., resultan sobredimensionadas para este tamano, pero permiten alto paralelismo por lote.
- Inferencia en CPU: teoricamente viable por el tamano, pero en la informacion proporcionada no se documentan pesos GGUF ni cuantizaciones para llama.cpp, por lo que requeriria una conversion propia.
- Opciones de despliegue: el ejemplo oficial usa transformers (`AutoModelForCausalLM`, `device_map="auto"`, bfloat16). Las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con endpoints gestionados. No se documenta soporte de vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a su documentacion publica; la fila de Imagine v8 se limita a lo aportado por su model card.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imagine v8 (Interchained) | ~1,35 B | no disponible | PostgreSQL y text-to-SQL schema-grounded | no disponible | safetensors en HuggingFace |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | 16.384 tokens (segun documentacion del modelo base) | Codigo general y generacion de codigo | licencia propia de DeepSeek (con condiciones de uso comercial) | safetensors en HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun documentacion del modelo) | Codigo general | Apache 2.0 | safetensors y GGUF en HuggingFace |
| CodeLlama-1.3B-Instruct | 1,3 B | 16.384 tokens (segun documentacion del modelo) | Codigo general | Llama 2 Community License | safetensors y GGUF en HuggingFace |

Frente a estos modelos generalistas de codigo, Imagine v8 sacrifica amplitud a cambio de especializacion: su propuesta se centra en SQL de PostgreSQL, anclaje al esquema y contrato de solo lectura, dimensiones que los alternativos no abordan de forma especifica. La ausencia de licencia declarada es un punto de friccion frente a alternativas con licencias permisivas claras (Apache 2.0) o condiciones documentadas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse, no se puede garantizar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no documentados: la model card esta en ingles y no se detallan idiomas soportados, por lo que el rendimiento fuera del ingles es incierto.
- Checkpoint de investigacion: el autor lo describe explicitamente como un checkpoint de investigacion, con 0 descargas y 0 likes en el momento de la consulta; no debe asumirse estabilidad de version.
- Evaluacion limitada y de otra version: la unica metrica publicada es de la linea v6 sobre 21 preguntas; no hay benchmarks estandar ni evaluacion publicada del checkpoint v8.
- Riesgo de alucinacion de esquema: aunque el modelo esta entrenado para no inventar tablas, columnas, relaciones ni claves, la model card no garantiza que nunca lo haga; el verificador de bind contra el esquema real sigue siendo necesario.
- Contrato de solo lectura no suficiente por si solo: el autor recomienda reforzar el acceso de solo lectura a nivel de permisos de base de datos en despliegues de produccion, en lugar de confiar unicamente en el comportamiento del modelo.
- Ambiguedad y abstención: el modelo puede pedir aclaraciones o devolver `UNANSWERABLE`; un pipeline cliente debe manejar correctamente estas salidas en lugar de tratarlas como SQL.
- Diferencia entre ejecutable y correcto: un SQL puede parsear, enlazar y ejecutarse y aun asi no responder semanticamente a la pregunta; el propio proyecto distingue entre ejecutabilidad, acuerdo de resultado y correccion semantica.
- Model card truncada: la seccion de limitaciones del autor aparece incompleta en la informacion disponible, por lo que podrian existir advertencias adicionales no recogidas aqui.
- Capacidades no documentadas: no hay evidencia de soporte de tool calling, function calling, agentes, vision o audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Interchained/imagine-v8
- Modelo base DeepSeek-Coder-1.3B-Instruct: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct
