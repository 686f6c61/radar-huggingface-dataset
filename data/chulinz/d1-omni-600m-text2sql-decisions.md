# Chulinz/d1-omni-600m-text2sql-decisions

## Resumen

D1 Omni 600M Text2SQL Decisions es un ajuste fino supervisado de LiquidAI/d1-omni-600M publicado por el usuario Chulinz. No es un generador de SQL: actúa como modelo de decisión dentro de la aplicación decisionmodel-text-to-sql, donde puntúa las opciones que el sistema construye a partir del esquema (medida, agrupación, filtros, orden y plan) para una pregunta formulada en inglés. La aplicación es la que compila esas elecciones a PostgreSQL, de modo que el modelo nunca escribe SQL directamente.

Con 587.161.089 parámetros reales y un peso float32 de 2,35 GB (1,17 GB en bfloat16), se trata de un modelo compacto orientado a clasificación de decisiones en pipelines de text-to-SQL. La versión 2.0 se entrenó sobre siete esquemas (Pagila, Northwind, AdventureWorks, nycflights13, Synthea, HR y Olist) y se evaluó con preguntas reservadas sobre ellos y sobre el esquema no visto Chinook. La versión 1.0, limitada a Olist, queda bajo la etiqueta `v1.0`.

Su relevancia actual radica en que documenta explícitamente sus límites de fiabilidad: cuando la aplicación devuelve una única respuesta, acierta en torno al 47% en esquemas fuera de Olist, por lo que el autor recomienda desplegarlo detrás de una interfaz en la que el usuario confirme o elija la interpretación. El modelo usa la licencia lfm1.0, es solo para inglés y su pipeline declarado en HuggingFace es text-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de LiquidAI/d1-omni-600M; el repo incluye `custom_code`) |
| Parametros totales | 587.161.089 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 y bfloat16 publicados; int8 dinamico del encoder probado pero con perdida de 42 puntos; int8 solo de pesos no probado y no publicado |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (subcarpetas float32 y `bf16/`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-omni-600M y se ajusta como clasificador de decisiones. La aplicacion descompone una pregunta en ingles en un conjunto de opciones (medida, agrupacion, filtros, orden y plan) y el modelo puntua cada una; despues, la app compila las elecciones seleccionadas en SQL de PostgreSQL. El repositorio de HuggingFace incluye `custom_code`, lo que implica que la carga requiere `trust_remote_code=True`. En el README no se detalla el numero de tokens de entrenamiento ni la composicion completa del dataset mas alla de las filas de decision.

El conjunto de entrenamiento consta de 118.032 filas de decision, generadas sobre siete esquemas. Las preguntas de test y las consultas de referencia fueron escritas por un modelo de lenguaje que nunca vio el generador de entrenamiento; un segundo modelo redacto una referencia independiente y un tercero resolvio el 15%-29% de desacuerdos, verificandose cada referencia contra la base de datos. La version 2.0 se evalua sobre Chinook como esquema no visto. El autor reporta que la calibracion ajustada sobre datos generados transfiere mal: el expected calibration error es 0,001 sobre las 147.822 decisiones de calibracion y 0,13 sobre las 3.886 respuestas aceptadas del test.

## Capacidades

- Puntuacion de decisiones para text-to-SQL: evalua opciones de medida, agrupacion, filtros, orden y plan para una pregunta en ingles sobre un esquema dado.
- Clasificacion de interpretaciones: genera listas de interpretaciones ofrecidas por la aplicacion (2,4 interpretaciones de media).
- Refusal (rechazo): decide cuando una pregunta no es respondible con el esquema disponible (89,2% de rechazo correcto sobre Chinook; 91,2% en el conjunto conjunto).
- Salida de confianza por decision: expone una confianza por opcion que permite ordenar y retirar respuestas menos seguras.
- Soporte de tool calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona explicitamente).
- Capacidades multilingues: no; solo en (ingles).
- Capacidades especiales: no escribe SQL; no tiene modo de vision ni audio. No se declara thinking mode.

## Casos de uso

- Asistente de consultas sobre bases de datos relacionales: integrar el modelo como capa de decision en una herramienta interna de BI donde el usuario formula preguntas en ingles y confirma la interpretacion propuesta antes de ejecutar la consulta.
- Generacion asistida de consultas PostgreSQL: usar la app para traducir lenguaje natural a SQL compilado, con el modelo acotando las opciones y el compilador produciendo el SQL final, de modo que el modelo nunca escriba SQL inseguro.
- Desambiguacion con intervencion humana: desplegar el modelo detras de una UI de confirmacion, aprovechando su capacidad de ofrecer varias interpretaciones (listas de media 2,4 opciones) y su rechazo del 91,2% en preguntas no respondibles.
- Analitica de autoservicio sobre esquemas estandar: aplicar el modelo sobre esquemas como Pagila, Northwind o AdventureWorks, donde el rendimiento "correct or offered" oscila entre 18,9% y 35,3%.
- Prefiltrado y enrutado en pipelines de datos: usar la salida de confianza para ordenar y retirar interpretaciones menos seguras, manteniendose en tasas de error aceptadas segun la curva riesgo-cobertura del autor.
- Evaluacion comparativa de modelos de decision: emplearlo como referencia local y ligera frente a modelos hospedados (Clef Flash, D1 3B) dentro del mismo entorno de la app.
- Prototipado en CPU para entornos sin GPU: con el encoder int8 dinamico se logran 198 ms por decision en una CPU de 12 hilos, suficiente para experimentacion aunque con fuerte caida de precision.
- Formacion e investigacion: analizar como un modelo de 600M de parametros aborda la descomposicion de preguntas sobre esquemas, con resultados documentados por esquema.

## Benchmarks y rendimiento

Resultados sobre Chinook (esquema no visto; 1.600 preguntas respondibles, 400 de rechazo):

| Modelo de decision | Strict | Correct or offered | Accepted wrong | Single answers right | Correctly refused |
|---|---|---|---|---|---|
| Este modelo | 29,6% | 34,0% | 31,8% | 48% | 89,2% |
| Clef Flash | 28,1% | 38,1% | 14,9% | 65% | 95,0% |
| D1 3B | 22,2% | 33,6% | 9,1% | 71% | 99,0% |

Resultados sobre Chinook mas seis esquemas de entrenamiento (11.200 respondibles, 2.800 de rechazo):

| Modelo de decision | Strict | Offered (lista contiene la respuesta) | Offered (lista la omite) | Accepted wrong | Refused | Single answers right | Correctly refused |
|---|---|---|---|---|---|---|---|
| Este modelo | 27,0% | 2,7% | 4,6% | 30,2% | 35,5% | 47% | 91,2% |
| Clef Flash | 23,0% | 11,1% | 10,3% | 15,8% | 39,8% | 59% | 95,2% |
| D1 3B | 19,2% | 7,8% | 3,5% | 9,2% | 60,4% | 68% | 97,8% |

Medias de interpretaciones ofrecidas: 2,4 (este modelo), 3,6 (Clef Flash), 4,2 (D1 3B).

Precision a tasa de error igualada: sobre 6.675 preguntas respondibles trazadas para los tres modelos, con un 9,4% de accepted wrong (nivel de D1 3B), este modelo mantiene 16,6% strict (D1 3B 19,2%; Clef Flash 14,5%). Con el 15,7% de Clef Flash, mantiene 21,8% frente a 22,7%.

Comportamiento por longitud de plan: la precision cae del 61% (planes de 20 a 27 decisiones) al 5% (mas de 46 decisiones).

Olist (bundle escrito a mano, 1.619 preguntas respondibles): 48,7% correct or offered y 39,5% strict (version 1.0: 37,6% y 24,0%; Clef Flash 52,1% y 23,7%; D1 3B 38,9% y 28,4%); rechaza 278 de 299 peticiones que deberia declinar. SLM-SQL-1.5B, que escribe SQL directamente, alcanza 26,0% strict.

Rendimiento y precision por variante de pesos (primeras 1.000 filas del conjunto de desarrollo generado):

| Pesos | Hardware | Archivo | Filas correctas | Tiempo por decision |
|---|---|---|---|---|
| float32 | GPU de Colab | 2,35 GB | 88,9% | 23,4 ms |
| bfloat16 | GPU de Colab | 1,17 GB | 88,9% | 6,0 ms |
| float32 | CPU de Colab, Xeon de 12 hilos a 2,2 GHz | 2,35 GB | 88,9% | 311 ms |
| int8 encoder, dinamico | CPU de Colab, Xeon de 12 hilos a 2,2 GHz | 1,49 GB | 47,1% | 198 ms |

bfloat16 eligio la misma opcion que float32 en el 99,98% de las decisiones. Con unas 35 decisiones por pregunta, la tasa de CPU supone unos 11 s de tiempo de modelo por pregunta. En una GPU de Colab detras de un tunel, la respuesta median fue de 4,3 s de extremo a extremo (Clef Flash 3,5 s; D1 3B 2,3 s).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,35 GB en float32; aproximadamente 1,17 GB en bfloat16.
- GPU recomendadas: el autor reporta pruebas en "GPU de Colab" (sin especificar modelo exacto). No se indican A100, H100 o RTX 4090 de forma explicita.
- Compatibilidad con GPU de consumo: por tamano (menos de 2,5 GB en float32) cabe con holgura en cualquier GPU de consumo moderna, aunque no se publican mediciones especificas.
- Opciones de despliegue: carga via `AutoModel.from_pretrained(..., subfolder="bf16", dtype=torch.bfloat16, trust_remote_code=True)` por el codigo personalizado; no se mencionan explicitamente vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 6,0 ms por decision en GPU con bfloat16; 23,4 ms con float32; 311 ms por decision en CPU float32; 198 ms en CPU con encoder int8 dinamico. La mediana end-to-end en GPU tras un tunel es de 4,3 s por pregunta.
- El servidor de decisiones del autor carga float32. Portatiles y telefonos no estan medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Strict (Chinook) | Single answers right (Chinook) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 587.161.089 | no disponible | 29,6% | 48% | lfm1.0 | Pesos abiertos en HuggingFace |
| Clef Flash | no disponible | no disponible | 28,1% | 65% | no disponible | Hospedado, via OpenRouter (decisions API) |
| D1 3B | no disponible (aprox. 3B por nombre) | no disponible | 22,2% | 71% | no disponible | Hospedado, via OpenRouter (decisions API) |
| SLM-SQL-1.5B | no disponible | no disponible | 26,0% (Olist) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fiabilidad limitada: cuando la app devuelve una unica respuesta, acierta en torno al 47% en esquemas fuera de Olist. El autor recomienda explicitamente usarlo tras una interfaz de confirmacion del usuario.
- Alta tasa de accepted wrong: 30,2% en el conjunto de siete esquemas y 31,8% en Chinook, muy por encima de Clef Flash (15,8%) y D1 3B (9,2%).
- Degradacion con la longitud del plan: la precision baja del 61% en planes de 20 a 27 decisiones al 5% en planes de mas de 46 decisiones.
- Mala calibracion fuera del reparto de generacion: el expected calibration error pasa de 0,001 en las decisiones de calibracion a 0,13 en las respuestas aceptadas del test (confianza media 0,59 frente a precision 0,47).
- Cuantizacion int8 arriesgada: la cuantizacion dinamica del encoder pierde 42 puntos de precision; la cuantizacion int8 solo de pesos no esta probada y no se publica ningun archivo int8.
- Idiomas: solo ingles. No hay soporte multilingue declarado.
- Posible contaminacion de pretraining: Chinook, al ser una base de datos de ejemplo ampliamente publicada, podria aparecer en el pretraining del modelo base.
- Preguntas de tipo lista de detalles: puntuan por debajo del 7% en todos los modelos, lo que apunta a las opciones que construye la app.
- Restricciones de licencia: licencia lfm1.0 (`license: other`). Debe revisarse el archivo `LICENSE` del repositorio antes de cualquier uso comercial.
- Dependencia de la aplicacion: el modelo por si solo no produce SQL; su utilidad esta ligada al pipeline decisionmodel-text-to-sql y a los esquemas concretos.
- Conjuntos de test no publicos: las preguntas y consultas de referencia no son accesibles, lo que limita la reproducibilidad externa de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chulinz/d1-omni-600m-text2sql-decisions
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Repositorio de la aplicacion: https://github.com/Chulinuwu/decisionmodel-text-to-sql
- Modelo comparado Clef Flash: https://huggingface.co/cloudflare/clef-flash (referencia citada como `cloudflare/clef-flash`)
- Modelo comparado D1 3B: `liquid/d1-20260930` (referencia citada en la model card, servida via OpenRouter)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
