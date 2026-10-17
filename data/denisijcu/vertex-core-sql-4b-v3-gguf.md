# Denisijcu/vertex-core-sql-4b-v3-GGUF

\n\n`
- Limitations from the card

Note the model card text cuts off mid-sentence at "mostly" in limitations.

Let me note that some things are "no disponible": cuantizaciones (only Q4_K_M mentioned), architecture details beyond causal LM (it's based on Qwen3-4B-Instruct-2507), training tokens (no number).

Actually the base model Qwen3-4B is a known transformer. But I should stick to what's provided. I can say the base is Qwen3-4B-Instruct-2507 and describe it as a causal transformer-based LM. Hmm, the card says "Causal LM". I'll be careful.

Let me write the card.

For hardware requirements: repo size 2.5GB, Q4_K_M. Fits consumer GPU. Trained on GTX 1660 Ti (6GB). Latency 3.0s on GTX 1660 Ti. Deployment: LM Studio, Ollama, llama.cpp. I can estimate VRAM but shouldn't invent. I can say ~2.5-3 GB for Q4_K_M weights plus context. That's reasonable estimation but let me frame it carefully. Actually the instructions say don't invent. I can reasonably say based on ~2.5GB file. Let me estimate ~3-4GB VRAM with context. I'll frame as estimation.

Let me be careful with the multi-turn / agent — the tags include "conversational" and "text-generation". It supports conversational. Tool calling? It mentions `<tool_call>` tokens in chat template issue. So there's some tool-call token behavior. I'll mention it carefully.

Let me write.

Estimados de latencia: 3.0s per query on GTX 1660 Ti.

Comparativa: base model Qwen3-4B-Instruct-2507, and the reference 7B code model not fine-tuned. I can compare with those.

Let me produce the markdown.

For parameters: 4,022,468,096 total. It's dense (not MoE), so no active params row needed... Actually the template says "(solo si es MoE)". It's not MoE, so I'll omit or put "no aplica". I'll include with "no aplica (modelo denso)".

Length of context: recommended 4096, but base model supports more. Card recommends context 4096. I'll say "se recomienda 4096 tokens (configuracion recomendada por el autor)".

Quantization: Q4_K_M available. Others "no disponible".

Let me finalize.## Resumen

Vertex-Core SQL 4B v3 es un modelo de generacion de texto especializado en text-to-SQL, desarrollado por Vertex Coders LLC (Miami, Florida; autor Denis Sanchez Leyva). Su funcion es traducir preguntas en lenguaje natural a consultas SQL validas, tomando como unica fuente de verdad el esquema DDL que se le proporciona en el prompt. Es un fine-tune de Qwen/Qwen3-4B-Instruct-2507 con QLoRA (Unsloth), fusionado y posteriormente cuantizado a GGUF, con alrededor de 4.022 millones de parametros (4B) y un repositorio de 2,5 GB en su variante Q4_K_M.

El modelo responde en espanol e ingles, esta pensado para ejecucion 100 % local y se distribuye bajo licencia Apache 2.0 con uso comercial permitido. Su relevancia practica esta en que permite montar un asistente SQL sin dependencia de APIs externas, en hardware modesto: el autor lo entreno en una unica NVIDIA GTX 1660 Ti de 6 GB en 4 horas y 28 minutos, y reporta una latencia media de 3,0 s por consulta en esa misma GPU.

El entrenamiento se realizo sobre el dataset b-mc2/sql-create-context. El autor declara buenos resultados en la metrica de SQL valido de solo lectura (100 %) y una exactitud de ejecucion case-insensitive del 78,9 % sobre 95 ejemplos reservados (filas 10000+ del dataset, nunca usados en entrenamiento). El modelo incorpora una plantilla de chat propia con un bloque de razonamiento vacio al inicio de cada respuesta, un detalle de implementacion critico para su correcto funcionamiento en llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (fine-tune QLoRA de Qwen/Qwen3-4B-Instruct-2507); no se detalla la arquitectura interna del modelo base en la informacion disponible |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (valor recomendado por el autor; no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | Q4_K_M (unico publicado en el repo, ~2,5 GB); otras cuantizaciones: no disponible |
| Idiomas soportados | espanol e ingles |
| Licencia | Apache 2.0 (uso comercial permitido) |
| Formato de pesos | GGUF (libreria gguf); el modelo base era safetensors segun el campo base_model, pero el repositorio distribuido es GGUF |

## Arquitectura y entrenamiento

Se trata de un modelo de lenguaje causal obtenido mediante un fine-tune QLoRA (con Unsloth) sobre Qwen/Qwen3-4B-Instruct-2507, un modelo base de 4B parametros de la familia Qwen3. El adaptador LoRA se fusiono con los pesos base y el resultado se cuantizo a GGUF en formato Q4_K_M. El autor no detalla en la informacion disponible la arquitectura concreta del modelo base (tipo de atencion, number de capas o dimensiones), ni el numero total de tokens de entrenamiento, ni si hubo fases de RLHF o DPO.

El entrenamiento se realizo sobre el dataset b-mc2/sql-create-context y se ejecuto en una unica GPU NVIDIA GTX 1660 Ti de 6 GB durante 4 horas y 28 minutos. Una innovacion de implementacion destacable es la plantilla de chat embebida en el propio GGUF: el modelo fue entrenado con un bloque de razonamiento vacio (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y la plantilla lo inserta automaticamente tras el token `<|im_start|>assistant`. El autor advierte explicitamente de que sustituirla por una plantilla ChatML generica provoca que el modelo emita tokens `<tool_call>` sueltos al inicio de las respuestas. LM Studio y llama.cpp (con `--jinja`) emplean la plantilla embebida de forma automatica, y el Modelfile incluido lo gestiona para Ollama.

El formato de prompt esperado es DDL mas solicitud, por ejemplo `Esquema DDL: CREATE TABLE ...` seguido de `Solicitud: ...`; en ingles funciona igual con `DDL Schema: ... Question: ...`. Los ajustes recomendados son temperature 0,2, top_p 0,9, repeat penalty 1,1 y contexto 4096.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural y de un esquema DDL proporcionado, en espanol e ingles.
- Redaccion de SQL estandar con comillas simples (estilo heredado del dataset de entrenamiento).
- Conversacion general y small talk: saluda y responde con normalidad sin generar SQL cuando no procede (6/6 en las pruebas de comportamiento).
- Peticion del esquema cuando falta: si no recibe las sentencias `CREATE TABLE`, pide el esquema en lugar de inventar tablas (2/2 en las pruebas).
- Redireccion educada ante peticiones fuera de su ambito (1/1 en las pruebas).
- Identificacion parcial de si mismo y de su creador (3/5, con errores; ver limitaciones).
- Preparado tecnicamente para tokens de tool/function calling (la plantilla de chat incluye tokens `<tool_call>`), aunque la informacion disponible no describe un soporte formal de tool calling estructurado.
- Soporte multilingue limitado a espanol e ingles.

## Casos de uso

- Asistentes de consulta sobre bases de datos internas: el modelo traduce preguntas de negocio a SQL a partir del DDL de las tablas, permitiendo a usuarios no tecnicos consultar datos sin escribir SQL. Funciona en local, lo que evita enviar el esquema fuera de la organizacion.
- Analitica conversacional en herramientas de BI: integrado en un chat, permite generar agregaciones (por ejemplo, promedios de `cpu_load` por `datacenter` filtrados por estado) directamente desde lenguaje natural.
- Generacion de consultas para equipos de datos: como asistente de autocompletado que propone consultas SQL a partir del esquema, reduciendo el tiempo de redaccion de queries repetitivas.
- Despliegue en entornos de escritorio con privacidad: al ser un GGUF de ~2,5 GB y ejecutarse en LM Studio, Ollama o llama.cpp, cabe en portatiles y equipos de oficina sin GPU dedicada potente, lo que lo hace util para prototipos y uso individual.
- Educacion y formacion en SQL: sirve para mostrar como se traduce una intencion a una consulta, siempre que la ejecucion se haga contra un usuario de solo lectura.
- Integracion como microservicio local con API compatible OpenAI: LM Studio expone un servidor en `http://localhost:1234/v1` que cualquier cliente OpenAI puede consumir, lo que facilita insertarlo en pipelines internos de generacion de SQL.
- Preprocesado en pipelines de datos: generar SQL candidato que despues se valida y ejecuta con un validador de solo lectura en un paso separado, antes de tocar la base de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false`), sobre 95 ejemplos puntuados del dataset `b-mc2/sql-create-context`, tomados a partir de la fila 10000 y no usados en entrenamiento. Cinco ejemplos fueron descartados porque la propia consulta de referencia no se ejecuta en SQLite.

| Metrica | Vertex-Core SQL 4B v3 | Referencia: modelo de codigo 7B sin fine-tune |
|---|---|---|
| SQL valido de solo lectura | 100,0 % | 97,9 % |
| Se ejecuta sin error (SQLite) | 97,9 % | 92,6 % |
| Mismo resultado que la referencia (case-insensitive) | 78,9 % | 76,8 % |
| Mismo resultado que la referencia (estricto) | 65,3 % | 63,2 % |
| Coincidencia exacta tras normalizacion | 47,4 % | 48,4 % |
| Latencia media por consulta (GTX 1660 Ti) | 3,0 s | 13,1 s |

Prueba de comportamiento (20 casos):

| Categoria | Puntuacion | Que comprueba |
|---|---|---|
| Saludos / small talk | 6/6 | Responde con normalidad, sin generar SQL |
| Esquema ausente | 2/2 | Pide las sentencias `CREATE TABLE` en lugar de inventar tablas |
| Fuera de tema | 1/1 | Redirige educadamente a su proposito |
| SQL | 2/2 | SQL correcto, comillas simples estandar |
| Identidad | 3/5 | Errores de identificacion propios y del creador |
| Peticiones destructivas | 1/4 | No rechaza de forma fiable SQL destructivo |
| Total | 15/20 | |

## Requisitos de hardware

- Peso del modelo en Q4_K_M: aproximadamente 2,5 GB (tamano del repositorio).
- VRAM estimada para inferencia: en torno a 3-4 GB con cuantizacion Q4_K_M y contexto de 4096 tokens, como estimacion a partir del tamano del fichero; el dato exacto no esta publicado.
- Entrenado en una NVIDIA GTX 1660 Ti de 6 GB, lo que confirma que el modelo completo cabe en GPUs de gama media.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo GTX 1660 Ti o superiores). La informacion no confirma modelos concretos adicionales como RTX 4090, A100 o H100.
- Puede ejecutarse en CPU mediante llama.cpp con cuantizacion Q4_K_M, dado el reducido tamano del fichero.
- Opciones de despliegue confirmadas por el autor: LM Studio (incluye servidor compatible con OpenAI en `http://localhost:1234/v1`), Ollama (con el `Modelfile` incluido) y llama.cpp (`llama-server -m ... --jinja -c 4096 --temp 0.2`). No se mencionan vLLM ni TGI.
- Latencia reportada: 3,0 s de media por consulta en una GTX 1660 Ti. No hay datos de throughput (tokens/s) en la informacion disponible.
- Ajustes recomendados: temperature 0,2, top_p 0,9, repeat penalty 1,1, contexto 4096, y uso obligatorio de la plantilla de chat embebida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Text-to-SQL (ejecucion case-insensitive) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vertex-Core SQL 4B v3 | 4B | 4096 recomendado | 78,9 % | Apache 2.0 | GGUF en HuggingFace (0 descargas al publicar la ficha) |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | no disponible | no disponible (modelo generalista, no especializado en SQL) | Apache 2.0 | HuggingFace |
| Modelo de codigo 7B sin fine-tune (referencia del autor) | 7B | no disponible | 76,8 % | no disponible | no disponible (identificado solo como "7B code model") |

La referencia de 7B sin fine-tune no se identifica con nombre en la informacion disponible; el autor solo indica que es un modelo de codigo de 7B no ajustado. No se han encontrado en la informacion proporcionada otras alternativas especializadas en text-to-SQL con las que comparar directamente.

## Limitaciones y advertencias

- No rechaza por si mismo SQL destructivo: ante peticiones de borrado, actualizacion o eliminacion puede generar sentencias `DELETE`, `UPDATE` o `DROP`. El autor recomienda ejecutar siempre el SQL generado a traves de un validador de solo lectura (el proyecto incluye uno basado en el AST de sqlglot que admite una unica sentencia `SELECT`/`WITH`/`UNION`) y usar un usuario de base de datos de solo lectura. En las pruebas de comportamiento solo supero 1 de 4 casos de peticiones destructivas.
- Puede alucinar hechos sobre su creador: si se le preguntan datos que no conoce sobre la empresa (empleados, ingresos, fundadores) puede inventar detalles. La recomendacion del autor es incluir cualquier dato que deba afirmar en el system prompt.
- Asume nombres de columna cuando solo se le da el nombre de la tabla. Para consultas precisas hay que aportar las sentencias `CREATE TABLE` completas.
- Estilo SQL heredado del dataset de entrenamiento (sesgado hacia la sintaxis de ese corpus).
- Identidad poco fiable: 3 de 5 casos correctos en las pruebas de comportamiento.
- Idiomas limitados a espanol e ingles; no se declara soporte de otros idiomas.
- Contexto recomendado de 4096 tokens, lo que limita esquemas muy grandes o conversaciones muy largas.
- Dependencia critica de la plantilla de chat embebida: usar una plantilla ChatML generica degrada las respuestas y provoca tokens `<tool_call>` sueltos.
- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha, sin validacion externa de la comunidad ni verificacion independiente de los benchmarks (todos marcados como `verified: false`).
- La informacion de la model card se interrumpe en la seccion de limitaciones, por lo que puede haber advertencias adicionales no recogidas aqui.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Instruct-2507 heredadas.

## Enlaces

- HuggingFace: https://huggingface.co/Denisijcu/vertex-core-sql-4b-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Repositorio del proyecto (scripts `08_eval.py` y `09_behavior_test.py` mencionados por el autor): no disponible (no se incluye URL en la informacion proporcionada)
- Paper, blog o demo adicionales: no disponible
