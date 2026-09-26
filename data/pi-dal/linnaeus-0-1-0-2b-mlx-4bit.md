# pi-dal/Linnaeus-0.1.0-2B-MLX-4bit

## Resumen

Linnaeus-0.1.0-2B-MLX-4bit es una conversion al formato MLX del modelo de decision Linnaeus-0.1.0-2B, publicada por el usuario pi-dal. No se trata de un modelo generativo de proposito general, sino de un modelo de decision: recibe un estado y una consulta con opciones candidatas, y devuelve una puntuacion por opcion en lugar de texto libre. La conversion esta pensada especificamente para Apple Silicon (macOS e iOS) a traves de mlx-swift-lm, que ya incluye el fichero `Qwen35.swift`.

El modelo tiene 1.881.827.136 parametros (aproximadamente 1,88 mil millones) y se distribuye cuantizado a 4 bits, con un repositorio de 1,1 GB. Segun la model card, la conversion descarta la torre de vision del modelo original: esta version solo realiza decisiones sobre texto. La puntuacion se obtiene leyendo el logit de una fila concreta (`score_row_id`) en la posicion de un marcador `<|fim_suffix|>` que se anade tras cada opcion candidata, con el contrato definido en `linnaeus-runtime.json`.

Su relevancia actual es practica: permite ejecutar un modelo de decision de ~1,88 B en hardware de consumo Apple (medido en un M4) ocupando alrededor de 1,0 GB, con un 67,53% en JevBench v1.2.2, por encima del 65,8% de referencia del modelo original y por debajo del 73,16% del pipeline CUDA en fp32. Es, por tanto, una alternativa de despliegue en el borde para Mac y dispositivos iOS, con la contrapartida de perder la modalidad de vision y parte de la precision respecto a fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de HuggingFace: `qwen3_5`; conversion MLX del modelo base) |
| Parametros totales | 1.881.827.136 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX 4bit); el modelo base se distribuye sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 1,1 GB |
| Tipo de modelo | Modelo de decision (decision-model), no generativo de texto libre |
| Modalidad | Solo texto (la torre de vision se descarta en la carga de pesos MLX) |
| Libreria | mlx |
| Modelo base | pi-dal/Linnaeus-0.1.0-2B |
| Plataformas objetivo | Apple Silicon (macOS e iOS via mlx-swift-lm) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion proporcionada. La etiqueta de HuggingFace del repositorio incluye `qwen3_5`, y la model card menciona que mlx-swift-lm ya incluye el fichero `Qwen35.swift`, lo que sugiere que la conversion MLX reutiliza la implementacion de esa familia arquitectonica, pero no se confirma oficialmente en los datos disponibles.

Lo que si esta documentado es el mecanismo de inferencia, que constituye la innovacion funcional del modelo: el contrato de decision define la puntuacion como `logits[marker_pos, score_row_id]`, donde los marcadores son `<|fim_suffix|>` y se anade uno detras de cada opcion candidata. El contrato completo se especifica en el fichero `linnaeus-runtime.json`. La model card no indica numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el proceso de cuantizacion a 4 bits mas alla de su resultado.

## Capacidades

- Decision entre opciones candidatas: dado un estado y una consulta con `type: choice`, instrucciones y criterios, el modelo puntua cada opcion mediante el logit de la fila de puntuacion.
- Puntuacion de opciones multiples en una sola pasada: los marcadores `<|fim_suffix|>` se anaden tras cada candidata, de modo que el modelo produce una puntuacion por alternativa.
- Procesamiento de estado y criterios estructurados: la interfaz acepta un objeto de estado y un diccionario de criterios, lo que permite condicionar la decision.
- Inferencia en texto unicamente: la torre de vision se elimina durante la carga de pesos, por lo que no hay capacidades multimodales en esta conversion.
- Ejecucion en Apple Silicon mediante MLX, con integracion en macOS e iOS a traves de mlx-swift-lm.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni soporte multilingue explicito.

## Casos de uso

- Seleccion automatica de respuestas en asistentes: dado un estado de conversacion y varias respuestas candidatas generadas por otro modelo, Linnaeus puntua cual encaja mejor con los criterios definidos. Es adecuado porque su contrato de decision devuelve puntuaciones comparables por opcion en una sola pasada.
- Enrutado de peticiones en pipelines de IA: ante varias herramientas, prompts o rutas de procesamiento posibles, el modelo emite una puntuacion por candidata y permite elegir la rama mas adecuada sin generar texto.
- Clasificacion de tickets y triaje de soporte: el estado puede contener el contenido del ticket y las opciones ser categorias o colas de destino; el modelo devuelve la puntuacion de cada una.
- Evaluacion automatica de candidatos en generacion de codigo: dado un enunciado y varios parches o fragmentos propuestos, el modelo puntua cada alternativa segun los criterios configurados, integrable en un pipeline de revision previa.
- Despliegue en aplicaciones iOS y macOS: al ejecutarse con MLX y ocupar alrededor de 1,0 GB en 4 bits, es viable integrarlo localmente en una app de escritorio o movil para decisiones en el dispositivo, sin envio de datos a servidores externos.
- Prototipado rapido en portatiles Apple Silicon: la conversion permite probar el modelo de decision en un M4 con el pipeline de MLX, sirviendo como banco de pruebas antes de pasar a la version CUDA en fp32 si se necesita mayor precision.
- Filtrado y ranking de contenido: el estado puede describir el contexto y las candidatas ser elementos a ordenar; el modelo proporciona la puntuacion por elemento con la que construir un ranking.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a JevBench v1.2.2 (231 tareas, medido en un Apple M4):

| Version | JevBench v1.2.2 | Tamano en memoria |
|---|---|---|
| Linnaeus-0.1.0-2B-MLX-4bit | 67,53% | 1,0 GB |
| Referencia del modelo original (upstream) | 65,8% | no disponible |
| Pipeline CUDA en fp32 | 73,16% | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

## Requisitos de hardware

- VRAM / memoria unificada estimada: aproximadamente 1,0 GB con cuantizacion de 4 bits, segun la medicion del autor en un Apple M4. El repositorio de pesos ocupa 1,1 GB.
- GPU recomendadas: no se especifican. El modelo esta orientado a Apple Silicon; la referencia de mayor precision mencionada es un pipeline CUDA en fp32, sin detallar la GPU empleada.
- Cabe en GPU de consumo: si, en equipos Apple Silicon. La medicion publicada se realizo en un chip M4. No hay datos sobre GPUs NVIDIA de consumo en la informacion disponible.
- Opciones de despliegue: MLX en macOS e iOS a traves de mlx-swift-lm; en Python, mediante `linnaeus.mlx_predictor.MlxPredictor` con el identificador `"Linnaeus-0.1.0-2B-MLX-4bit"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se indica el resultado de exactitud en JevBench v1.2.2 sobre 231 tareas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de decision comparables de otros autores en los datos proporcionados. La unica comparacion posible es con las variantes del propio Linnaeus:

| Modelo | Parametros | Cuantizacion | JevBench v1.2.2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linnaeus-0.1.0-2B-MLX-4bit | 1.881.827.136 | 4 bits (MLX) | 67,53% | apache-2.0 | HuggingFace (MLX) |
| Linnaeus-0.1.0-2B (base, referencia upstream) | no disponible | sin cuantizar | 65,8% | apache-2.0 (heredada del base) | HuggingFace |
| Pipeline CUDA fp32 | no disponible | fp32 | 73,16% | no disponible | no disponible |

Comparativa con modelos de otras familias: no disponible.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre; su salida es una puntuacion por opcion candidata y requiere respetar el contrato `logits[marker_pos, score_row_id]`.
- Sin vision: la torre de vision del modelo original se descarta en la carga de pesos MLX, por lo que esta version solo procesa texto.
- Perdida de precision frente a fp32: 67,53% en JevBench v1.2.2 frente al 73,16% del pipeline CUDA en fp32, una diferencia de aproximadamente 5,6 puntos porcentuales.
- Dependencia de la implementacion: el uso correcto exige anadir `<|fim_suffix|>` tras cada candidata y respetar el contrato de `linnaeus-runtime.json`; cualquier desviacion invalida las puntuaciones.
- Idiomas soportados no documentados: no es posible confirmar el comportamiento multilingue ni el rendimiento fuera del ingles o del idioma de entrenamiento.
- Longitud de contexto no documentada: no se puede planificar el uso con estados o listas de candidatas largas sin pruebas previas.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de puntuaciones mal calibradas o inconsistentes ante estados fuera de la distribucion de entrenamiento.
- Adopcion minima: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- Licencia: apache-2.0, que permite uso comercial, pero se hereda del modelo base y no se detallan restricciones adicionales del proyecto Linnaeus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-4bit
- Modelo base: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B
- Perfil del autor: https://huggingface.co/pi-dal
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo: todas las entradas se refieren al numero pi (Wikipedia, Britannica, piday.org y similares) y no guardan relacion con Linnaeus. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
