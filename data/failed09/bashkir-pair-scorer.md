# failed09/bashkir-pair-scorer

## Resumen

El Bashkir-Russian Pair Scorer es un conjunto de tres modelos compactos en formato ONNX publicados por el usuario `failed09` cuyo objetivo es estimar si un par de frases en bashkir y ruso son paralelas y, por tanto, aptas para el filtrado de corpus bilingues. No es un modelo de traduccion ni un generador de texto: devuelve una puntuacion de compatibilidad (logit que se transforma en score mediante sigmoide) para un par de textos. Se distribuye en tres variantes de tamano creciente, `nano`, `mini` y `medium`, pensadas para construir cascadas de filtrado con distinto equilibrio entre coste y calidad.

El modelo esta orientado a un caso de uso muy concreto: la limpieza y curacion de corpus paralelos bashkir-ruso, un par de lenguas de bajos recursos donde la disponibilidad de datos alineados es limitada. Las tres variantes comparten el mismo tokenizador SentencePiece BPE de 16.000 unidades (`spm_bpe_16k.model`) y el mismo perfil de ejecucion `fast128`, con pesos en FP16, dimension de lote dinamica y un maximo de 128 tokens por lado, con truncado de las entradas mas largas. La model card no especifica la arquitectura interna de la red ni el numero de parametros de cada variante.

La relevancia actual del modelo radica en su rendimiento en terminos de throughput: segun la tabla de benchmarks incluida en la model card, `nano` procesa 7.472,2 pares por segundo en una RTX 4060, frente a los 44,8 pares por segundo de LaBSE, a costa de una perdida moderada de calidad discriminativa (ROC-AUC de 0,9498 frente a 0,9944). Esto lo hace util como primera etapa de filtrado masivo antes de verificar con modelos de referencia mas costosos. La licencia es Apache-2.0 y el repositorio no incluye texto del corpus de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica el tipo de red; se exporta a ONNX con tokenizador SentencePiece BPE) |
| Parametros totales | no disponible |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | 128 tokens por lado (perfil `fast128`); las entradas mas largas se truncan |
| Tipos de cuantizacion | FP16 (pesos del perfil `fast128`); no se documentan otras cuantizaciones |
| Idiomas soportados | bashkir (`ba`) y ruso (`ru`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`models/nano/model.onnx`, `models/mini/model.onnx`, `models/medium/model.onnx`) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Tokenizador | SentencePiece BPE compartido, vocabulario de 16k (`spm_bpe_16k.model`) |
| Libreria de inferencia | onnxruntime |
| Tarea (pipeline) | text-classification |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de las tres variantes (no se indica si se trata de un transformer encoder, un modelo tipo bi-encoder ni el numero de capas o dimensiones ocultas). Lo que si se documenta es el contrato de ejecucion: exportacion a ONNX con un tokenizador SentencePiece BPE de 16k compartido por las tres configuraciones y el perfil `fast128`, que fija pesos en FP16, dimension de lote dinamica y un maximo de 128 tokens por lado. La secuencia de entrada se construye concatenando los identificadores del texto ruso, un separador y los del texto bashkir, con relleno hasta la longitud maxima; la salida es un unico logit `score_logit` que se transforma en probabilidad mediante una funcion sigmoide. El modelo se entreno y exporto en el marco del proyecto BashkirCorpus para la estimacion de calidad de corpus paralelos bashkir-ruso.

En cuanto a los datos, el entrenamiento utilizo datos paralelos revisados, pares negativos duros y senales de puntuacion de profesor/referencia (scoring de un modelo maestro). No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset, y la model card indica explicitamente que la release ONNX solo contiene pesos y activos del tokenizador, no el texto del corpus de origen. La evaluacion se realizo sobre un conjunto bilingue derivado de Aygiz, con 10.000 pares positivos y 20.000 negativos duros deterministas (globales y locales), muestra que quedo excluida del entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo coherente con que no es un modelo generativo.

## Capacidades

- Puntuacion de compatibilidad de pares de frases bashkir-ruso: devuelve un logit que puede convertirse en una puntuacion entre 0 y 1 mediante sigmoide.
- Deteccion de pares no paralelos: disenado para descartar pares claramente no alineados en una primera pasada de filtrado.
- Filtrado de corpus a gran escala: pensado para procesar lotes de forma eficiente y streaming de ficheros Parquet, CSV/TSV o JSONL mediante el runner por lotes del proyecto de origen.
- Construccion de cascadas de verificacion: las tres variantes (`nano`, `mini`, `medium`) permiten repartir el trabajo entre una etapa rapida de descarte y una capa de revision mas exigente.
- Inferencia en ONNX Runtime con `CUDAExecutionProvider` o `CPUExecutionProvider`.
- Soporte de idiomas limitado a bashkir (`ba`) y ruso (`ru`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling, function calling ni soporte de agentes o razonamiento multi-paso.
- No se documenta un modo de pensamiento (thinking mode), audio ni multimodalidad.

## Casos de uso

- Filtrado de corpus paralelos bashkir-ruso a escala: usar `nano` o `mini` como primera pasada para eliminar pares claramente no paralelos y reservar `medium` o modelos de referencia para los casos dudosos, reduciendo el coste computacional total del pipeline.
- Curacion de datos de entrenamiento para traduccion automatica ba-ru: aplicar el scorer para limpiar el corpus antes de entrenar un sistema de traduccion, descartando pares mal alineados que degradarian la calidad del modelo final.
- Control de calidad en memorias de traduccion y ficheros TMX: puntuar segmentos bilingues existentes para detectar alineaciones erroneas acumuladas en la memoria antes de reutilizarla en produccion.
- Deteccion de pares mal alineados en corpus extraidos de la web: filtrar pares generados por mineria web donde la alineacion automatica suele producir falsos positivos, usando los umbrales `accepted`, `review` y `quarantine` que deben calibrarse sobre una muestra revisada.
- Pre-filtrado en pipelines de mineria de datos multilingues: integrar el scorer como etapa barata en un flujo mayor que despues aplique LaBSE o LASER solo a los pares que superen el filtro inicial.
- Verificacion de alineacion en documentacion oficial bilingue: comprobar que los segmentos de un documento administrativo o normativo en bashkir y ruso se corresponden entre si.
- Evaluacion rapida de la calidad de un dataset paralelo: ejecutar el modelo sobre una muestra y analizar la distribucion de puntuaciones para decidir si merece la pena invertir en una revision manual mas profunda.
- Triage de grandes volumenes con salida en tres categorias: aceptar, revisar y cuarentena, segun umbrales calibrados especificamente para el corpus objetivo.

## Benchmarks y rendimiento

Resultados publicados en `benchmark_summary.json` y en la tabla de la model card. La evaluacion usa un conjunto bilingue derivado de Aygiz con 10.000 pares positivos y 20.000 negativos duros globales y locales, excluido del entrenamiento. El throughput se midio en una RTX 4060.

| Modelo | ROC-AUC | Average precision | Throughput (RTX 4060) |
|---|---:|---:|---:|
| LaBSE | 0,9944 | 0,9895 | 44,8 pares/s |
| LaBSE + LASER | 0,9939 | 0,9871 | 44,8 pares/s |
| DevLake BERT | 0,9896 | 0,9706 | 112,5 pares/s |
| Medium Scorer | 0,9633 | 0,9155 | 2.555,9 pares/s |
| Mini Scorer | 0,9590 | 0,9040 | 4.673,5 pares/s |
| Nano Scorer | 0,9498 | 0,8785 | 7.472,2 pares/s |

Los autores senalan que los scorers compactos intercambian una cantidad moderada de calidad discriminativa por una ganancia grande de throughput, y proponen usar `nano` o `mini` en la primera pasada, `medium` para los pares inciertos y LaBSE/LASER solo en la capa final de revision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no publica cifras de memoria. El tamano del repositorio se reporta como 0,0 GB.
- GPU de referencia en las pruebas: RTX 4060, con 2.555,9 pares/s (`medium`), 4.673,5 pares/s (`mini`) y 7.472,2 pares/s (`nano`).
- Cabe en GPU de consumo: si, dado que las mediciones se realizaron en una RTX 4060 y el perfil `fast128` mantiene una longitud fija de 128 tokens por lado con lote dinamico.
- Ejecucion en CPU: soportada mediante `CPUExecutionProvider` de ONNX Runtime; no se publican cifras de throughput en CPU.
- Opciones de despliegue documentadas: ONNX Runtime (con proveedor CUDA o CPU) y el runner por lotes directo del proyecto de origen, que evita la sobrecarga de HTTP/JSON y permite streaming de Parquet, CSV/TSV o JSONL.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; son frameworks orientados a modelos generativos y este modelo es un clasificador de pares.
- Latencia y throughput: los unicos datos publicados son las cifras de pares por segundo en RTX 4060 indicadas arriba. No se detallan latencias por lote ni factores de escalado con el tamano de lote.

## Comparativa con modelos similares

| Modelo | ROC-AUC | Average precision | Throughput (RTX 4060) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|---|---|
| Nano Scorer (este release) | 0,9498 | 0,8785 | 7.472,2 pares/s | no disponible | 128 tokens por lado | Apache-2.0 | HuggingFace, ONNX |
| Mini Scorer (este release) | 0,9590 | 0,9040 | 4.673,5 pares/s | no disponible | 128 tokens por lado | Apache-2.0 | HuggingFace, ONNX |
| Medium Scorer (este release) | 0,9633 | 0,9155 | 2.555,9 pares/s | no disponible | 128 tokens por lado | Apache-2.0 | HuggingFace, ONNX |
| LaBSE | 0,9944 | 0,9895 | 44,8 pares/s | no disponible | no disponible | no disponible en la informacion proporcionada | utilizado como referencia en el benchmark |
| LaBSE + LASER | 0,9939 | 0,9871 | 44,8 pares/s | no disponible | no disponible | no disponible en la informacion proporcionada | utilizado como referencia en el benchmark |
| DevLake BERT | 0,9896 | 0,9706 | 112,5 pares/s | no disponible | no disponible | no disponible en la informacion proporcionada | utilizado como referencia en el benchmark |

La comparativa se limita a los modelos incluidos en el benchmark del autor. No se dispone de datos de parametros, contexto, licencia ni forma de distribucion de LaBSE, LaBSE + LASER y DevLake BERT mas alla de sus resultados numericos en esta evaluacion concreta.

## Limitaciones y advertencias

- Las puntuaciones no son probabilidades humanas calibradas: los umbrales `accepted`, `review` y `quarantine` deben calibrarse para cada corpus objetivo usando una muestra revisada manualmente.
- El benchmark esta pensado para comparacion y no garantiza la precision en produccion sobre cualquier dominio; los resultados pueden degradarse en generos o registros no representados en la muestra de evaluacion.
- El perfil `fast128` trunca las entradas largas, por lo que en segmentos literarios o documentos extensos se recomienda una capa de revision con un scorer de contexto mas largo o con LaBSE/LASER.
- El modelo solo cubre el par de lenguas bashkir-ruso; no es aplicable a otras combinaciones sin reentrenamiento.
- No es un modelo de traduccion: no genera traducciones, solo estima la compatibilidad de un par de textos.
- No es un modelo generativo y no soporta tool calling, agentes ni razonamiento multi-paso.
- La model card no documenta sesgos especificos, composicion del dataset de entrenamiento ni numero de tokens utilizados, lo que dificulta auditar el origen y las posibles desviaciones de los datos.
- El repositorio no incluye el texto del corpus de origen, solo pesos y activos del tokenizador.
- Uso comercial permitido bajo Apache-2.0, siempre que se conserve el aviso de licencia y se cumplan las condiciones de la misma.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado el 2026-09-10, por lo que se trata de una release muy reciente y sin validacion independiente conocida.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/failed09/bashkir-pair-scorer
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cita recomendada por el autor:
  ```
  @software{failed09_bashkir_pair_scorer_2026,
    title = {Bashkir-Russian Pair Scorer},
    author = {failed09},
    year = {2026},
    publisher = {Hugging Face},
    url = {https://huggingface.co/failed09/bashkir-pair-scorer},
    note = {Open-source compact alignment models for the Bashkir language}
  }
  ```
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
