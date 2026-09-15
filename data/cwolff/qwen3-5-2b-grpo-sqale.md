# cwolff/qwen3.5-2b-grpo-sqale

## Resumen

Qwen3.5-2b-grpo-sqale es un ajuste fino del modelo denso Qwen/Qwen3.5-2B (2.274.069.824 parámetros) publicado por el usuario cwolff, orientado específicamente a text-to-SQL agéntico. A diferencia de un generador de SQL de un solo disparo, este modelo está entrenado para explorar una base de datos mediante herramientas, ejecutar consultas de prueba y finalmente enviar una consulta final, recibiendo recompensa según si el resultado coincide con la respuesta de referencia. El entrenamiento se hizo con RL estilo GRPO durante 1450 pasos, sin calentamiento supervisado previo, contra un entorno SQLite real.

El modelo parte del checkpoint base tal cual y aprende el protocolo `exec_plan`: cada turno del asistente emite un único objeto JSON con una llamada a herramienta, sin prosa ni bloques de código, y el arnés de ejecución devuelve el resultado como siguiente turno de usuario. Esto lo convierte en un componente de agente más que en un modelo de chat convencional, y su rendimiento cae drásticamente si se usa fuera de ese bucle.

Su relevancia actual radica en que demuestra que un modelo de solo 2B parámetros puede pasar de 0,163 a 0,540 de exactitud de ejecución oficial en BIRD dev (modo `full`) mediante RL con recompensa densa basada en ejecución real, acercándose a cifras que habitualmente requieren modelos bastante mayores. La licencia Apache 2.0 y el soporte directo en vLLM facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), transformer denso; la metadata incluye la etiqueta `image-text-to-text`, pero la model card solo documenta uso de texto |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Longitud de contexto | No disponible como ventana nativa del modelo base; la model card documenta `max_model_len 16384` en vLLM y un presupuesto de episodio de 12288 tokens durante el entrenamiento |
| Tipos de cuantizacion | No disponible; el repositorio publica safetensors sin cuantizaciones oficiales (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`); tamaño del repositorio 4,6 GB |

## Arquitectura y entrenamiento

La base es `Qwen/Qwen3.5-2B` en estado stock, sin SFT de calentamiento, sobre la que se aplicó GRPO con pérdida a nivel de token, agregación sum/1024 y sin normalización de ventajas. La divergencia respecto al modelo de referencia congelado se controla con el estimador k3 de KL con objetivo 0,005, y el recorte usa una ratio de importancia a nivel de secuencia obtenida de los logprobs del sampler de vLLM, con umbrales 0,2 / 0,28 (DAPO). El lote es de 18 preguntas × 8 candidatos = 144 episodios por paso, con una época interna, learning rate 1e-5 con decaimiento coseno y 5 % de warmup. El entrenamiento total fue de 1450 pasos.

Los datos proceden de SQaLe3 (`cwolff/queries` unido con `cwolff/schemas`, subconjuntos `simple` y `moderate`). La recompensa es densa: 3.0 por equivalencia semántica, crédito parcial por F1 con escala 0.9, 0.1 de bonus por join y 0.1 de bonus por consenso. El entorno de entrenamiento es `exec_plan` con 6 turnos de herramientas, presupuesto de episodio de 12288 tokens y SQLite en memoria. Las herramientas disponibles son `list_tables`, `describe_table`, `foreign_keys`, `join_path`, `sample_rows`, `run_query`, `distinct_values` y `submit_sql`, esta última cierra el episodio. El `generation_config.json` detiene la generación tanto en `<|im_end|>` (248046) como en `<|endoftext|>` (248044), igual que durante los rollouts de RL; la configuración del modelo base solo listaba `<|endoftext|>`, lo que habría sobrepasado el final de cada turno del asistente. Los turnos del asistente se abren con un bloque `<think>`, que la plantilla de chat activa por defecto. El ajuste se entrenó originalmente con un motor vLLM construido a partir del modelo base y sincronizando los pesos del checkpoint; este repositorio es la versión reconstruida y cargable directamente.

## Capacidades

- Generación de SQL a partir de lenguaje natural, con ejecución contra SQLite real y bucle agéntico de hasta 6 turnos.
- Uso de herramientas (tool calling) mediante JSON estricto: un único objeto por turno, sin texto adicional ni vallas de código.
- Descubrimiento autónomo de esquemas: puede operar en modo `withheld`, donde solo recibe la pregunta y debe averiguar tablas, columnas y claves foráneas por sí mismo.
- Razonamiento multi-paso con modo de pensamiento (`<think>`) habilitado por plantilla.
- Ejecución de consultas intermedias con `run_query` para verificar hipótesis antes de enviar la consulta final.
- Selección de consulta final explícita mediante `submit_sql`, lo que permite al arnés distinguir "no lo sé" de una respuesta.
- Inglés únicamente; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de visión, audio ni generación de código general fuera del ámbito SQL, pese a la etiqueta `image-text-to-text` de la metadata.

## Casos de uso

- Analítica de autoservicio sobre bases de datos internas: el modelo puede gestionar la traducción de preguntas de negocio a SQL sobre esquemas SQLite, con 0,540 de exactitud de ejecución oficial en BIRD dev y una tasa de ejecución correcta del 98,7 % en modo `full`, lo que reduce los fallos por sintaxis.
- Exploración de esquemas desconocidos o mal documentados: en modo `withheld` alcanza 0,523 oficial (frente a 0,080 del modelo base), por lo que es adecuado para auditorías de datos, inventario de columnas y detección de claves foráneas en almacenes heredados.
- Integración en asistentes de data engineering dentro del IDE: al emitir JSON de herramienta en lugar de prosa, se puede conectar directamente a un ejecutor de consultas y devolver resultados sin parseo heurístico.
- Validación y pruebas de pipelines de datos: el modelo puede usarse para generar consultas candidatas que se ejecutan contra una copia de la base de datos y comparar resultados con las transformaciones esperadas.
- Construcción de agentes de BI conversacional: gracias a los turnos múltiples (media de 4,5 turnos en `full` y 5,8 en `withheld`), puede refinar consultas a partir de errores de ejecución devueltos por el entorno.
- Automatización de informes con joins: el bonus de join del entrenamiento favorece consultas que combinan tablas, útil para métricas que cruzan entidades como clientes, pedidos y productos.
- Formación y evaluación de equipos de datos: sirve como referencia para comparar anotaciones humanas de SQL frente a una generación automática verificada por ejecución.
- Componente dentro de un sistema mayor de agentes: su tamaño de 2,27 B permite ejecutarlo como subagente especializado invocado por un orquestador mayor.

## Benchmarks y rendimiento

Resultados medidos en BIRD dev (n = 300 filas con semilla, episodios agénticos de 6 turnos, T = 0,6 / top-p 0,95 / top-k 20, puntuados por ejecución contra las bases SQLite reales). `official` usa la semántica de conjuntos del leaderboard de BIRD; `strict` es sensible al orden y a los duplicados. `full` incluye el DDL en el prompt; `withheld` solo proporciona la pregunta.

| Configuración | Qwen3.5-2B stock | Este modelo |
|---|---|---|
| BIRD `full`, official | 0,163 | 0,540 |
| BIRD `full`, strict | no disponible | 0,497 |
| BIRD `withheld`, official | 0,080 | 0,523 |
| BIRD `withheld`, strict | no disponible | 0,480 |

Comportamiento de los episodios: tasa de envío 0,74 (`full`) y 0,59 (`withheld`); el SQL generado se ejecuta el 98,7 % y el 97,3 % de las veces respectivamente; media de 4,5 y 5,8 turnos.

Verificación de equivalencia entre la ruta de entrenamiento (sincronización de pesos en vLLM) y este repositorio, sobre las mismas 300 preguntas y con comparación pareada (McNemar exacto + intervalo de confianza bootstrap):

| Modo | Ruta con sincronización de pesos | Este repositorio | Delta pareado | p de McNemar |
|---|---|---|---|---|
| `full` | 0,540 | 0,540 | +0,000, IC 95 % [-0,047, +0,043] | 1,00 |
| `withheld` | 0,503 | 0,523 | +0,020, IC 95 % [-0,027, +0,067] | 0,49 |

El autor advierte de dos matices sobre las cifras absolutas: el checkpoint se seleccionó sobre BIRD (los pasos 1250-1650 se sitúan en una banda de 0,51-0,56, por lo que ~0,55 en `full` debe leerse como meseta), y este modelo no se separa estadísticamente de su hermano `cwolff/qwen3.5-2b-grpo-bird` (diferencia de ~1 punto, dentro del suelo de ruido). Los números son de BIRD dev, producidos por el arnés propio del proyecto, y no son envíos al leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 2,27 B de parámetros; no confirmado por el autor): en BF16, aproximadamente 4,5 GB de pesos más caché KV, en torno a 6-8 GB en total según el contexto; en FP8, unos 2,5-3,5 GB; en cuantización de 4 bits, aproximadamente 1,5-2,5 GB. Con `max_model_len 16384`, la caché KV crece de forma apreciable y conviene dimensionarla aparte.
- GPU recomendadas: H100 o A100 para despliegues con concurrencia alta; RTX 4090, RTX 3090 o L40S para servicio de baja latencia; RTX 4080/4070 Ti Super para uso individual.
- Cabe en GPU de consumo: sí. Con BF16 es viable en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB); en cuantización de 4 bits podría caber en 8 GB, aunque no hay GGUF oficial publicado.
- Opciones de despliegue: vLLM está documentado y soportado de forma nativa y directa, sin conversión ni `--hf-overrides`, mediante `vllm serve cwolff/qwen3.5-2b-grpo-sqale --max-model-len 16384`. TGI es una alternativa razonable para el mismo formato de pesos. llama.cpp u Ollama requerirían convertir los safetensors a GGUF, algo que el autor no publica.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni de latencia por episodio. Como referencia cualitativa, la media de turnos por episodio (4,5 en `full` y 5,8 en `withheld`) implica entre 5 y 7 generaciones encadenadas por consulta, cada una con su propia llamada al modelo y su ejecución de herramienta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto documentado | BIRD dev `full` official | Idioma | Licencia |
|---|---|---|---|---|---|
| cwolff/qwen3.5-2b-grpo-sqale (este) | 2,27 B | 16384 en vLLM | 0,540 | en | Apache 2.0 |
| cwolff/qwen3.5-2b-grpo-bird (hermano) | no disponible (misma base, 2,27 B) | no disponible | no disponible (el autor indica ~1 punto de diferencia, dentro del ruido) | en | Apache 2.0 |
| Qwen/Qwen3.5-2B (base stock) | 2,27 B | no disponible | 0,163 | no disponible | Apache 2.0 |
| Otros modelos text-to-SQL de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de comparación frente a modelos text-to-SQL de terceros (por ejemplo, variantes de CodeLlama, StarCoder o modelos especializados de mayor tamaño) en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas para text-to-SQL.
- Depende críticamente del bucle agéntico. La propia model card advierte que "rendirá mal sin él": el modelo espera el protocolo `exec_plan`, con un único objeto JSON por turno y sin prosa ni vallas de código.
- El system prompt exacto importa. El autor indica que debe usarse la cadena `EXEC_PLAN_TOOL_INSTRUCTIONS` de `shared/tools/protocol.py` en el repositorio de ajuste de SQaLe, no una paráfrasis de la lista de herramientas.
- Tasa de envío incompleta: 0,74 en `full` y 0,59 en `withheld`, es decir, entre el 26 % y el 41 % de los episodios terminan sin llamar a `submit_sql`. Cualquier integración en producción debe gestionar ese caso.
- Riesgo de sobreajuste al benchmark: el checkpoint se seleccionó sobre BIRD dev, con los pasos 1250-1650 dentro de una banda estrecha de 0,51-0,56. El propio autor pide leer ~0,55 como meseta, no como resultado limpio de un paso concreto.
- No se separa de su hermano entrenado con BIRD train: la diferencia de ~1 punto está dentro del suelo de ruido, así que no debe usarse para inferir qué datos de entrenamiento son mejores.
- El entorno de entrenamiento es SQLite en memoria. El comportamiento en PostgreSQL, MySQL, BigQuery, Snowflake u otros dialectos no está documentado ni evaluado.
- Riesgo de alucinación específico de agentes SQL: puede producir consultas sintácticamente válidas y ejecutables que devuelvan resultados plausibles pero incorrectos (por ejemplo, un `WHERE` que omite una condición implícita). El elevado porcentaje de SQL que ejecuta correctamente (98,7 %) no garantiza corrección semántica.
- El intervalo de confianza del test pareado es de aproximadamente ±5 puntos, por lo que no puede excluirse una diferencia real de ese orden entre la ruta de entrenamiento y este repositorio.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo NOTICE si existe. No se documentan restricciones adicionales de uso aceptable por parte del autor.
- Madurez del artefacto: 0 descargas y 0 "likes" en el momento de la consulta, y fecha de creación muy reciente (15 de septiembre de 2026). No ha pasado por validación de la comunidad.
- El apartado "Hardware" de la model card aparece truncado en la información disponible, por lo que se desconoce el hardware exacto empleado en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cwolff/qwen3.5-2b-grpo-sqale
- Modelo hermano entrenado con BIRD train: https://huggingface.co/cwolff/qwen3.5-2b-grpo-bird
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de consultas: https://huggingface.co/datasets/cwolff/queries
- Dataset de esquemas: https://huggingface.co/datasets/cwolff/schemas
- Repositorio de ajuste de SQaLe (referenciado en la model card como origen de `shared/tools/protocol.py`, sin URL proporcionada): no disponible
- Paper o informe técnico del modelo: no disponible
- Demostración o Space: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos correspondían a localizadores de tiendas de una cadena de supermercados y a un servicio de mapas, sin relación con el modelo.
