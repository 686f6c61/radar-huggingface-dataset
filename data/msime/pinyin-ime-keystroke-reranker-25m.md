# msime/pinyin-ime-keystroke-reranker-25M

## Resumen

`pinyin-ime-keystroke-reranker-25M` es un modelo de lenguaje a nivel de caracter de 24,9 millones de parametros desarrollado por el usuario `msime` (proyecto Metasequoia IME) para una tarea muy concreta: reordenar la lista de candidatos que produce un motor de entrada (IME) de pinyin chino en cada pulsacion de tecla. No decodifica pinyin ni genera texto: recibe el contexto previo y las cadenas candidatas ya construidas por el motor y puntua cual encaja mejor con el texto anterior. Se distribuye como un unico grafo ONNX Runtime en formato ORT de 30,8 MB con pesos cuantizados dinamicamente a uint8, pensado para ejecucion en dispositivo (escritorio y moviles recientes).

La relevancia del modelo esta en su nicho: los IME son componentes criticos en la escritura diaria en chino y el reordenamiento de candidatos basado en contexto es una mejora sensible frente a heuristicas de frecuencia. El modelo esta entrenado y evaluado en el repositorio `metasequoiaime/chinese-ime-lm`, con una metodologia de evaluacion reproducible sobre 6.317 casos extraidos de textos fuera de los corpus de entrenamiento. Forma parte de una familia de tres tamanos (8M, 25M y 4M a nivel de frase) que el autor plantea como niveles por velocidad de dispositivo, no como alternativas de calidad.

La ficha se basa exclusivamente en la model card y los metadatos publicados; no hay resultados de benchmarks generales (MMLU, HumanEval, GSM8K) porque el modelo no esta disenado para esas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter con cache de atencion por pasos (grafo `lm_step`), exportado a ONNX Runtime |
| Parametros totales | 24,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 caracteres (`context_chars`) |
| Tipos de cuantizacion | pesos uint8 con cuantizacion dinamica; fichero de 30,8 MB |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX Runtime ORT (`lm_step.ort`), mas `model.json`, `vocab.json` y `required_operators_and_types.config` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder a nivel de caracter que se ejecuta en modo incremental: cuando el usuario confirma texto, el contexto (hasta 64 caracteres, abierto con BOS y con mapeo de caracteres desconocidos a UNK) se procesa en una cache vacia; en cada pulsacion solo se ejecutan los prefijos de candidato que aun no estan en cache. Los prefijos compartidos se ejecutan una sola vez, el ultimo caracter de cada candidato nunca se ejecuta y el ultimo nodo del contexto predice el primer caracter de cada candidato. La salida son puntuaciones `scores` por candidato (log-probabilidad media por caracter) junto con la cache extendida (`next_k`, `next_v`, `next_h`, `next_z`) que se realimenta en la siguiente pulsacion. El grafo usa 27 operadores de ONNX Runtime, lo que permite compilar un runtime estatico de unos 1,5 MB a partir del fichero `required_operators_and_types.config`.

Los corpus de entrenamiento declarados son `allenai/c4`, `HuggingFaceFW/fineweb-2` y `silver/lccc`. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible. Si se documenta una decision tecnica relevante: los pesos se cuantizan a uint8 en lugar de int8 porque ONNX Runtime selecciona kernels int8 segun las caracteristicas de la CPU, y con int8 dos Macs con y sin I8MM elegian candidatos distintos en 42 de 6.317 casos, mientras que con uint8 las puntuaciones son identicas bit a bit. Tambien se indica que un caracter candidato puede leerse sin softmax completo (un unico producto escalar, autolnormalizado en entrenamiento) cuando `model.json` lo permite.

## Capacidades

- Reordenamiento de candidatos de IME de pinyin a nivel de caracter en cada pulsacion, condicionado por el contexto previo.
- Puntuacion de candidatos mediante log-probabilidad media por caracter, comparable entre candidatos de distinta longitud.
- Cache incremental de atencion para reutilizar computo entre pulsaciones y prefijos compartidos.
- Lectura rapida de caracteres candidatos mediante producto escalar (sin softmax sobre todo el vocabulario) cuando la configuracion lo habilita.
- Ejecucion en dispositivo mediante ONNX Runtime, con posibilidad de compilar un runtime minimo de unos 1,5 MB.
- Generacion de casos dorados (`export_step.py --golden`) para tests de regresion de runtimes propios.
- No soporta tool calling, agentes, vision, audio ni decodificacion de pinyin; no es un modelo generativo de texto general.

## Casos de uso

- Reordenamiento de candidatos en un IME de escritorio: el host carga el grafo ORT, procesa el contexto confirmado en una cache vacia y en cada tecla puntua solo los prefijos nuevos, mostrando primero el candidato con mayor log-probabilidad media. Adecuado por su tamano (30,8 MB) y su latencia pensada para escritorio.
- IME en moviles recientes: el autor lo situa como primer nivel de carga; el host mide una pagina de carga pesada y cambia al modelo de 8M si supera los 10 ms, de modo que el 25M se usa cuando el dispositivo lo soporta.
- Correccion de ambiguedad en entradas por iniciales: la evaluacion incluye palabras escritas solo con iniciales y mezclas, escenario tipico de escritura rapida donde el contexto desambigua.
- Integracion en runtimes minimos embebidos: gracias al fichero de operadores requeridos, se puede enlazar estaticamente un ONNX Runtime de ~1,5 MB y desplegar el reordenador en entornos con restricciones de espacio.
- Testing de regresion de motores IME: usar `--golden` para volcar candidatos y puntuaciones por pulsacion y comparar bit a bit entre versiones del runtime o entre CPUs.
- Procesamiento por lotes de evaluacion offline: reutilizar el mismo grafo para puntuar conjuntos de casos (por ejemplo, `eval/sentences-ctx-v1`) y medir cambios de heuristicas del motor antes de desplegarlas.
- Sustitucion de heuristicas de frecuencia en motores existentes: el modelo acepta la lista de candidatos ya construida, por lo que se puede anadir como etapa de reordenamiento sin reescribir el decodificador de pinyin.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al conjunto `eval/sentences-ctx-v1` (6.317 casos extraidos de documentos oficiales publicados entre el 4 de septiembre y el 29 de octubre de 2026 y de los splits de test de tres conjuntos de dialogo colaborativos, con palabras de 2 a 4 caracteres escritas en pinyin completo, solo iniciales y mezcla). No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Modelo | Parametros | Fichero (uint8) | ctx-v1 con contexto (5.468 casos) | ctx-v1 sin contexto (849 casos) |
|---|---|---|---|---|
| `pinyin-ime-keystroke-reranker-25M` (8x448) | 24,9 M | 30,8 MB | 91,8% | 83,4% |
| `pinyin-ime-keystroke-reranker-8M` (6x256) | 7,96 M | 8,2 MB | 90,1% | 82,8% |
| `pinyin-ime-reranker-4M` (modelo de frase) | 4,25 M | no disponible | 89,6% | 81,3% |

No se han publicado resultados de benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el grafo es de 30,8 MB con pesos uint8 y esta pensado para CPU en dispositivo. El consumo de memoria en ejecucion depende de la cache (capas, cabezas, longitud M) y no se detalla en la model card.
- GPU recomendadas: no disponible; el autor no menciona GPU, solo ejecucion via ONNX Runtime en escritorio y moviles recientes.
- Cabe en GPU de consumo: si, por tamano, aunque no es el escenario previsto; no hay datos de rendimiento en GPU.
- Despliegue: ONNX Runtime (formato ORT), con opcion de build estatico reducido a los 27 operadores del fichero `required_operators_and_types.config` (~1,5 MB). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no serian aplicables a este grafo.
- Latencia y throughput: el autor usa como umbral de cambio de nivel que una pagina de carga pesada no supere los 10 ms; no se publican cifras de latencia por pulsacion ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ctx-v1 con contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `pinyin-ime-keystroke-reranker-25M` | 24,9 M | 64 caracteres | 91,8% | Apache-2.0 | ORT (uint8) |
| `pinyin-ime-keystroke-reranker-8M` | 7,96 M | no disponible | 90,1% | Apache-2.0 (segun repo) | ORT (uint8) |
| `pinyin-ime-reranker-4M` | 4,25 M | no disponible | 89,6% | Apache-2.0 (segun repo) | safetensors (`sentence-model.safetensors`) |

Los tres modelos son del mismo autor y no son alternativas de calidad sino niveles por velocidad de dispositivo. No se dispone de datos de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No decodifica pinyin: alimentarlo con una cadena de pinyin no produce texto chino; solo puntua candidatos ya construidos por el motor.
- Solo soporta chino (zh); no hay capacidades multilingues.
- Ventana de contexto limitada a 64 caracteres, con mapeo de caracteres fuera de vocabulario a UNK.
- No sustituye a `sentence-model.safetensors` de los modelos de frase: la convencion de llamada es distinta (grafo ONNX Runtime).
- Los pesos deben distribuirse junto con el fichero `NOTICE` de atribucion de corpus, que debe acompanar a los pesos.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los corpus de entrenamiento (`allenai/c4`, `HuggingFaceFW/fineweb-2`, `silver/lccc`) recogidas en el NOTICE.
- Riesgo de sesgo y alucinacion: la model card no documenta evaluaciones de sesgo; al ser un reordenador, el riesgo se manifiesta como eleccion de candidatos incorrectos, no como generacion de texto libre.
- La cuantizacion uint8 se eligio para garantizar puntuaciones identicas entre CPUs con y sin I8MM; cambiar el esquema de cuantizacion puede alterar el orden de candidatos.
- El repositorio de HuggingFace figura con 0 descargas y 0 likes y un tamano de repo de 0,0 GB en los metadatos, lo que puede indicar que los ficheros no estan subidos o que la informacion esta incompleta; verificar antes de integrar.
- No hay datos publicados de latencia, throughput ni consumo de memoria en ejecucion.

## Enlaces

- HuggingFace: https://huggingface.co/msime/pinyin-ime-keystroke-reranker-25M
- Modelo hermano de 8M: https://huggingface.co/msime/pinyin-ime-keystroke-reranker-8M
- Modelo de frase de 4M: https://huggingface.co/msime/pinyin-ime-reranker-4M
- Repositorio de entrenamiento y evaluacion: https://github.com/metasequoiaime/chinese-ime-lm
- Release `rerank-v1`: https://github.com/metasequoiaime/chinese-ime-lm/releases/tag/rerank-v1
- Codigo del grafo `lm_step`: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/neural/choice/model.py
- Script de exportacion: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/neural/choice/export_step.py
- Conjunto de evaluacion `sentences-ctx-v1`: https://github.com/metasequoiaime/chinese-ime-lm/tree/main/eval/sentences-ctx-v1
- Crate Rust `chinese-ime-lm`: https://crates.io/crates/chinese-ime-lm
