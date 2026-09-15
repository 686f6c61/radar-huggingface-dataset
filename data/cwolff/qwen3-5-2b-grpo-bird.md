# cwolff/qwen3.5-2b-grpo-bird

## Resumen

Qwen3.5-2B · agentic GRPO on BIRD es un ajuste fino de `Qwen/Qwen3.5-2B` publicado por el usuario cwolff, orientado a text-to-SQL sobre SQLite mediante un bucle de agente con herramientas. No es un generador de SQL de un solo disparo: el modelo explora el esquema con llamadas a herramientas (`list_tables`, `describe_table`, `foreign_keys`, `join_path`, `sample_rows`, `run_query`, `distinct_values`), ejecuta consultas intermedias y termina enviando la consulta final con `submit_sql`. El entrenamiento se hizo con refuerzo (GRPO) desde el modelo base sin fase previa de ajuste supervisado, con recompensa basada en la ejecución real de la consulta contra la base de datos.

El modelo tiene 2.274.069.824 parámetros (2,27 B) y se distribuye como checkpoint completo en formato safetensors que vLLM carga directamente, sin conversión ni `--hf-overrides`. El repositorio ocupa 4,6 GB. La ventana de contexto usada en la configuración de servicio recomendada es de 16.384 tokens, con un presupuesto de episodio de 12.288 tokens y un máximo de 6 turnos de herramienta por consulta.

Su relevancia actual está en el salto de rendimiento medido: en BIRD dev, con el DDL incluido en el prompt, pasa de 0,133 de exactitud de ejecución oficial en el modelo base a 0,553; y en el modo en el que el modelo no ve el esquema y debe descubrirlo por herramientas, de 0,077 a 0,547. Es un ejemplo reproducible de que el RL contra un entorno ejecutable, y no solo el ajuste supervisado sobre pares pregunta-SQL, mueve de forma sustancial la aguja en un modelo de 2 B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`); transformer con generación condicional. La model card incluye la etiqueta `image-text-to-text`, aunque el ajuste y la evaluación documentados son exclusivamente de texto |
| Parámetros totales | 2.274.069.824 (2,27 B, dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens en la configuración de servicio recomendada (`--max-model-len 16384`); presupuesto de episodio de 12.288 tokens y 6 turnos de herramienta. Contexto nativo del modelo base: no disponible |
| Tipos de cuantización | No se declaran cuantizaciones oficiales. Solo safetensors; el tamaño del repo (4,6 GB para 2,27 B de parámetros) es coherente con BF16. No hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint completo cargable directamente por vLLM) |
| Modelo base | `Qwen/Qwen3.5-2B` (stock, sin warm start supervisado) |
| Pipeline declarado | `text-generation` |
| Ejecución de referencia | vLLM, con parada en `<|im_end|>` (248046) y `<|endoftext|>` (248044) |
| Hardware de entrenamiento | 3× H100, 3 rangos con `torchrun` (data parallel) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El punto de partida es `Qwen/Qwen3.5-2B` sin calentamiento supervisado: el modelo aprende a resolver text-to-SQL directamente por refuerzo. El algoritmo es GRPO con pérdida a nivel de token, agregación suma/1024 y sin normalización de ventajas. Se aplica una penalización KL con estimador k3 hacia una referencia congelada, con objetivo de 0,005, y recorte con ratio de importancia a nivel de secuencia calculado a partir de los logprobs del sampler de vLLM, con umbrales 0,2 / 0,28 al estilo DAPO. El lote es de 18 preguntas × 8 candidatos = 144 episodios por paso, con 1 época interna, tasa de aprendizaje 1e-5 con decaimiento coseno y 5 % de warmup. El entrenamiento duró 1350 pasos. La model card se corta en la línea de hardware ("3-rank torchrun data paralle"), por lo que el resto de detalles de infraestructura no están disponibles.

La innovación clave es el entorno de recompensa. Cada episodio se ejecuta sobre SQLite en memoria con el protocolo `exec_plan`: cada turno del asistente debe emitir un único objeto JSON y nada más (sin prosa ni bloques de código), y el arnés lo ejecuta y devuelve el resultado como siguiente turno de usuario. La recompensa es densa: 3,0 por equivalencia semántica con el resultado oro, crédito parcial por F1 con escala 0,9, 0,1 de bonus por join y 0,1 de bonus por consenso. Los datos de entrenamiento son únicamente BIRD train en las particiones `simple` y `moderate`. Existe un modelo hermano, `cwolff/qwen3.5-2b-grpo-sqale`, con receta idéntica pero entrenado sobre SQaLe3.

## Capacidades

- Generación de SQL para SQLite a partir de preguntas en lenguaje natural, con ejecución real contra la base de datos durante la evaluación.
- Operación en modo agente: descubre el esquema mediante herramientas en lugar de depender de que el DDL esté en el prompt (`withheld`, 0,547 oficial), y también funciona con el DDL incluido (`full`, 0,553 oficial).
- Uso de herramientas (`tool calling`) mediante protocolo JSON estricto con ocho herramientas: `list_tables`, `describe_table`, `foreign_keys`, `join_path`, `sample_rows`, `run_query`, `distinct_values` y `submit_sql`.
- Razonamiento multi-paso: hasta 6 turnos de herramienta por episodio, con una media medida de 4,1 turnos en modo `full` y 5,1 en modo `withheld`.
- Modo de pensamiento: los turnos del asistente se abren con un bloque `<think>`; la plantilla de chat lo activa por defecto y la model card recomienda mantenerlo activo.
- Ejecución fiable de la consulta enviada: el SQL generado se ejecuta sin error de sintaxis el 97,7 % de las veces en `full` y el 97,0 % en `withheld`.
- Terminación de episodio mediante `submit_sql`, con tasa de envío de 0,60 (`full`) y 0,59 (`withheld`).
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades de visión: la etiqueta `image-text-to-text` aparece en el repositorio, pero no se documenta ningún uso, entrenamiento o evaluación multimodal. No disponible.

## Casos de uso

- Análisis self-service sobre bases de datos SQLite: un analista formula la pregunta en inglés y el modelo descubre el esquema por sí mismo (`withheld`, 0,547 de exactitud oficial), lo que permite desplegarlo sobre bases cuyo DDL no cabe o no se quiere exponer en el prompt.
- Asistente interno de datos con bucle de agente: el modelo encaja en un servicio vLLM con `max-model-len 16384` que ejecuta cada JSON de herramienta contra la base real y realimenta el resultado, replicando exactamente el protocolo `exec_plan` con el que fue entrenado.
- Generación de consultas para equipos no técnicos: el modelo ejecuta consultas intermedias (`run_query`) y consulta valores distintos (`distinct_values`) antes de enviar la definitiva, lo que reduce errores de literales y de nombres de columna en comparación con un generador de un solo disparo.
- Exploración y documentación de esquemas desconocidos: con `list_tables`, `describe_table` y `foreign_keys` puede recorrer un catálogo de datos y producir consultas de validación, útil en procesos de incorporación de nuevas fuentes de datos.
- Automatización de informes periódicos: dada una batería de preguntas recurrentes, el modelo genera y ejecuta las consultas contra la base operativa, con recompensa de equivalencia semántica como criterio de aceptación en las pruebas.
- Formación y evaluación de pipelines text-to-SQL: sirve como referencia reproducible para comparar variantes de prompt, número de turnos o conjuntos de herramientas, ya que su arnés y sus cifras están documentados y son ejecutables.
- Enrutado de preguntas analíticas en un agente mayor: por su tamaño de 2,27 B y su ventana de 16.384 tokens puede actuar como componente especializado que recibe la pregunta y devuelve una consulta verificada, delegando el resto del flujo a un modelo mayor.

## Benchmarks y rendimiento

Resultados en BIRD dev, medidos con el arnés propio del proyecto sobre 300 filas con semilla fija, episodios agénticos de 6 turnos, T=0,6 / top-p 0,95 / top-k 20, puntuados ejecutando contra las bases SQLite reales. No son envíos al leaderboard.

| Modo | stock Qwen3.5-2B | Este modelo | Diferencia |
|---|---|---|---|
| BIRD `full`, oficial | 0,133 | 0,553 | +0,420 |
| BIRD `full`, estricto | — | 0,513 | — |
| BIRD `withheld`, oficial | 0,077 | 0,547 | +0,470 |
| BIRD `withheld`, estricto | — | 0,510 | — |

La semántica `oficial` sigue el conjunto de semánticas del leaderboard de BIRD; la `estricta` es sensible al orden y a los duplicados. `full` incluye el DDL en el prompt; `withheld` solo entrega la pregunta y obliga a descubrir el esquema con herramientas.

Comportamiento de episodio: tasa de envío 0,60 (`full`) y 0,59 (`withheld`); el SQL generado se ejecuta correctamente el 97,7 % y el 97,0 % de las veces respectivamente; media de 4,1 y 5,1 turnos.

Comparación pareada entre la ruta de sincronización de pesos usada en entrenamiento y este repositorio publicado, sobre las mismas 300 preguntas:

| Modo | Ruta con sincronización de pesos | Este repositorio | Delta pareado | McNemar p |
|---|---|---|---|---|
| `full` | 0,517 | 0,553 | +0,037; IC 95 % [-0,007, +0,080] | 0,13 |
| `withheld` | 0,517 | 0,547 | +0,030; IC 95 % [-0,010, +0,070] | 0,18 |

No hay diferencia significativa en ninguno de los dos modos y la ruta publicada nunca puntuó por debajo. La lectura correcta es "consistente dentro de unos ±5 puntos", no equivalencia demostrada. Dos advertencias del autor: el checkpoint se seleccionó sobre BIRD (los pasos 1250–1650 se sitúan en una banda de 0,51–0,56, así que ~0,55 en `full` debe leerse como meseta, no como un paso limpio), y este modelo no se separa de su hermano `sqale` (diferencia de ~1 punto, dentro del ruido). No se han publicado resultados de benchmarks en la información disponible más allá de BIRD.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 5 GB de pesos (4,6 GB de safetensors) más caché KV; en la práctica unos 8-10 GB con `max-model-len 16384`. Estimación propia a partir del recuento de parámetros y del tamaño del repositorio.
- En cuantización INT8 la huella de pesos bajaría a ~2,3 GB, pero no hay checkpoints cuantizados publicados por el autor.
- GPU consumer: cabe en una RTX 4090 (24 GB) o una RTX 3090 (24 GB) con margen amplio en BF16, y en tarjetas de 12 GB como la RTX 3060 o la RTX 4070 siempre que se ajuste la ventana de contexto. No se ha publicado versión GGUF, por lo que en GPUs de 8 GB o en CPU el despliegue requeriría una cuantización propia.
- GPUs de datacenter: A100, H100 o L40S, con la posibilidad de servir muchas réplicas por GPU o de usar tensor parallel innecesario dado el tamaño. El entrenamiento se hizo con 3× H100.
- Opciones de despliegue: vLLM es la vía soportada y documentada (`vllm serve cwolff/qwen3.5-2b-grpo-bird --max-model-len 16384`), con la API de chat en Python. Al ser un `Qwen3_5ForConditionalGeneration` completo, también debería cargarse con transformers; llama.cpp, Ollama y TGI no están documentados en la información disponible, y llama.cpp/Ollama requerirían convertir a GGUF.
- Latencia y throughput: no disponible. Hay que tener en cuenta que cada consulta implica hasta 6 turnos secuenciales de generación más las ejecuciones SQL intermedias, por lo que la latencia total del episodio es sensiblemente mayor que la de una generación única.
- Parámetros de muestreo recomendados: temperatura 0,6, top-p 0,95, top-k 20, `max_tokens` 2048.
- Configuración de parada: `generation_config.json` detiene la generación tanto en `<|im_end|>` (248046) como en `<|endoftext|>` (248044); la configuración del modelo base solo lista `<|endoftext|>`, lo que haría que la generación continuara más allá del final de cada turno del asistente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD dev (arnés propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cwolff/qwen3.5-2b-grpo-bird` | 2,27 B | 16.384 tokens servidos | 0,553 `full` / 0,547 `withheld` oficial | Apache 2.0 | HuggingFace, safetensors, carga directa en vLLM |
| `Qwen/Qwen3.5-2B` (stock) | 2 B | No disponible | 0,133 `full` / 0,077 `withheld` oficial | Apache 2.0 (según el modelo base) | HuggingFace |
| `cwolff/qwen3.5-2b-grpo-sqale` | Mismo receta que el modelo descrito | No disponible en la información proporcionada | No se publican cifras en la información disponible; el autor indica que difiere ~1 punto, dentro del ruido | Apache 2.0 | HuggingFace |

No se dispone de datos de otros modelos text-to-SQL comparables en la información proporcionada, ni de resultados de terceros en la misma configuración de arnés, por lo que no es posible establecer comparaciones con alternativas externas sin inventar cifras.

## Limitaciones y advertencias

- Requiere un bucle de agente. La model card es explícita: el modelo rinde mal sin el protocolo `exec_plan`. Cada turno del asistente debe emitir un único objeto JSON sin prosa ni bloques de código, y el arnés debe ejecutarlo y devolver el resultado como siguiente turno de usuario.
- El prompt de sistema exacto importa. Debe usarse la cadena `EXEC_PLAN_TOOL_INSTRUCTIONS` de `shared/tools/protocol.py` del repositorio de ajuste de SQaLe, no una paráfrasis de la lista de herramientas.
- El modo de pensamiento debe permanecer activo; el bloque `<think>` forma parte del comportamiento aprendido y la plantilla de chat lo activa por defecto.
- Sesgo de selección sobre BIRD: el checkpoint se eligió evaluando en BIRD, y los pasos 1250–1650 están todos en una banda de 0,51–0,56. Las cifras absolutas deben tratarse como meseta, no como resultado limpio de un paso concreto.
- No se separa estadísticamente de su modelo hermano `cwolff/qwen3.5-2b-grpo-sqale`: la diferencia de ~1 punto está dentro del suelo de ruido. No deben extraerse conclusiones sobre la comparación de datos de entrenamiento a partir de estas cifras.
- Tasa de envío de 0,60 / 0,59: alrededor del 40 % de los episodios no terminan con `submit_sql`, lo que en producción obliga a implementar un turno de forzado o un timeout de episodio.
- Evaluación limitada a BIRD dev con arnés propio, 300 filas y una sola configuración de muestreo. No es un envío al leaderboard y no hay resultados en otros conjuntos.
- Dependencia de ejecución real: la evaluación y buena parte del valor del modelo asumen acceso a una base SQLite ejecutable, con las implicaciones de seguridad que conlleva permitir `run_query` sobre datos de producción.
- Riesgo de alucinación: el uso de herramientas de inspección de esquema reduce los errores de nombres de tabla y columna, pero el modelo sigue produciendo consultas semánticamente incorrectas en aproximadamente el 45 % de los casos en BIRD dev, incluso cuando el SQL se ejecuta sin error de sintaxis (97,7 % de ejecución correcta frente a 0,553 de exactitud).
- Idioma: solo inglés declarado. El rendimiento en castellano no está evaluado y no debería asumirse.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales declaradas. No se detalla en la información disponible la licencia de los datasets de entrenamiento (BIRD train, `cwolff/queries`, `cwolff/schemas`), dato relevante antes de un despliegue comercial.
- El repositorio no incluye cuantizaciones, adaptadores LoRA ni versiones GGUF; cualquier despliegue en hardware limitado exige convertir pesos por cuenta propia.
- La model card está truncada en la sección de entrenamiento (se corta en la descripción del hardware), por lo que parte de los detalles de infraestructura y del dataset no están disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cwolff/qwen3.5-2b-grpo-bird
- Modelo hermano (receta idéntica sobre SQaLe3): https://huggingface.co/cwolff/qwen3.5-2b-grpo-sqale
- Modelo base: `Qwen/Qwen3.5-2B` (referenciado en la model card; no se proporciona la URL exacta en la información disponible)
- Datasets de entrenamiento citados: `cwolff/queries` y `cwolff/schemas` (referenciados en la model card; no se proporcionan las URLs exactas)
- Documentación del protocolo: `shared/tools/protocol.py`, en el repositorio del ajuste de SQaLe (ruta indicada en la model card; no se proporciona la URL del repositorio)
- Paper o blog técnico: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los enlaces obtenidos corresponden a páginas de reserva de billetes de SNCF Connect y no guardan relación con este modelo.
