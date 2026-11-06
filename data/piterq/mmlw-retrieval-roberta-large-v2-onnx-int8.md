# PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8

## Resumen

`PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8` es una conversión a ONNX Runtime con cuantización de pesos a 8 bits del modelo de embeddings `sdadas/mmlw-retrieval-roberta-large-v2`, desarrollado originalmente por Sławomir Dadas en el National Information Processing Institute (OPI PIB) de Polonia. El modelo base es un encoder RoBERTa-large de tipo bi-encoder, entrenado para recuperación de información (retrieval) y similitud semántica de frases, con vectores de salida de 1024 dimensiones. Esta versión concreta ha sido producida por el usuario PiterQ para ejecución en dispositivo (on-device) en Android mediante ONNX Runtime sobre CPU, como parte de la aplicación AudioTranscriber.

El objetivo de esta conversión es permitir búsqueda semántica local sobre los documentos, notas y grabaciones del propio usuario sin enviar datos a la red. El modelo mantiene el tokenizador XLM-R/RoBERTa del original, una longitud máxima de 512 tokens, pooling CLS y normalización L2 ya integrada en el grafo, de modo que la similitud coseno se reduce a un producto escalar. La cuantización es solo de pesos: todas las matrices MatMul pasan a 8 bits con `MatMulNBits` (bloque de 32, simétrica) y la tabla de embeddings de palabras se almacena en float16, mientras las activaciones permanecen en float32. El tamaño resultante es de 577 MiB frente a los 1655 MB del modelo fp32.

La relevancia de esta ficha radica en su carácter práctico: demuestra un flujo completo de exportación, cuantización y verificación de un encoder de recuperación para despliegue móvil, con métricas de fidelidad respecto al original (similitud coseno mínima de 0,99994 en una muestra de 20 textos) y de rendimiento en hardware real (unos 330 ms por pasaje en un Galaxy S23 con 4 hilos). Existe una contrapartida Core ML para iPhone y Mac, y los vectores de ambas versiones son intercambiables porque comparten el mismo espacio vectorial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa-large (bi-encoder para retrieval), exportado a grafo ONNX opset 17 |
| Parametros totales | no disponible (el modelo base es roberta-large; el repo ocupa 0,6 GB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens maximo (n ≤ 512 en la entrada) |
| Tipos de cuantizacion | Solo pesos: MatMul a int8 simetrico con `MatMulNBits` (bloque 32); tabla de embeddings en float16; activaciones en float32 |
| Idiomas soportados | polaco (pl) e ingles (en) |
| Licencia | Gemma Terms of Use (heredada del modelo base, que es Model Derivative) |
| Formato de pesos | ONNX (`model.onnx` + pesos externos en `model.w8.onnx.data`) |
| Dimension del embedding | 1024 (float32, CLS pooling, L2-normalizado) |
| Prefijo de consulta | `[query]: ` obligatorio en queries; los pasajes van sin prefijo |
| Runtime requerido | ONNX Runtime ≥ 1.17 con el operador contrib `com.microsoft` `MatMulNBits` (probado con 1.28 en Android arm64) |
| Tamano del repo | 0,6 GB (pesos cuantizados ~577 MiB) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia RoBERTa en configuracion large, reutilizado como modelo de embeddings mediante pooling CLS y normalizacion L2. La conversion a ONNX preserva las capas del encoder sin cambios, emplea un grafo con batch y longitud dinamicos, mascara de atencion aditiva explicita e incorpora el pooling y la normalizacion dentro del propio grafo. La unica modificacion respecto al original es la cuantizacion descrita: pesos de todas las MatMul a int8 con cuantizador `MatMulNBitsQuantizer` de ONNX Runtime y tabla de embeddings en float16 con `Gather` seguido de `Cast` a float32. No hay reentrenamiento ni fine-tuning, ni alteracion de pesos mas alla de la cuantizacion.

Sobre el entrenamiento del modelo base, esta ficha no dispone de detalles en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas). La model card original lo vincula al trabajo PIRB presentado en LREC-COLING 2024, y el autor de la conversion indica que los datos de entrenamiento del modelo fuente se prepararon con un reranker basado en Gemma, motivo por el cual el modelo se distribuye bajo los terminos de Gemma. Para conocer la composicion exacta del corpus y el procedimiento de entrenamiento hay que consultar la model card del modelo original `sdadas/mmlw-retrieval-roberta-large-v2`.

## Capacidades

- Generacion de embeddings de texto de 1024 dimensiones para similitud semantica y recuperacion de informacion (dense retrieval).
- Busqueda semantica sobre documentos propios, notas y transcripciones, ejecutada localmente en el dispositivo.
- Similitud de frases mediante producto escalar (los vectores ya estan L2-normalizados).
- Soporte bilingue polaco-ingles, con tokenizador XLM-R/RoBERTa.
- Procesamiento por lotes con batch y longitud dinamicos.
- Integracion con pipelines de sentence-transformers y con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`).
- Interoperabilidad de vectores con la version Core ML (mismo espacio vectorial), lo que permite indexar en un dispositivo y consultar desde otro.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica on-device en Android: la aplicacion AudioTranscriber indexa las notas y transcripciones del usuario y recupera pasajes relevantes con el modelo ejecutandose en CPU via ONNX Runtime, sin enviar datos a la red. Es adecuado por su tamano (577 MiB), su latencia (~330 ms por pasaje en un Galaxy S23) y la fidelidad casi exacta respecto al modelo fp32.
- Recuperacion en aplicaciones de notas y grabaciones: dado que el modelo acepta consultas con el prefijo `[query]: ` y pasajes sin prefijo, se puede construir un indice vectorial local y resolver consultas en lenguaje natural sobre el archivo personal del usuario.
- Asistentes de busqueda bilingues polaco-ingles: el soporte de ambos idiomas permite indexar documentacion mixta y consultar en cualquiera de las dos lenguas con el mismo espacio de embeddings.
- Sistemas de recomendacion de contenido textual: calcular similitud entre articulos, correos o mensajes para sugerir elementos relacionados, aprovechando la normalizacion L2 que reduce la comparacion a un producto escalar.
- Deduplicacion y agrupamiento de documentos: agrupar pasajes semanticamente equivalentes en corpus de gran tamano mediante clustering sobre los embeddings de 1024 dimensiones.
- Filtrado previo en pipelines RAG: actuar como recuperador de primera etapa en un pipeline de generacion aumentada, ejecutandose en el dispositivo o en servidor con ONNX Runtime y delegando la generacion a un LLM separado.
- Despliegue en servidores sin GPU: al ser un grafo ONNX con pesos int8, puede servirse con ONNX Runtime o Text Embeddings Inference en CPU con requisitos de memoria reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible. La model card proporciona metricas de fidelidad y velocidad de esta conversion, que se recogen a continuacion:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Similitud coseno vs. original fp32 | min 0,99994; media 0,99995 | 20 textos de prueba pl/en, ONNX Runtime en Mac y Galaxy S23 |
| Coincidencia de ids del tokenizador | 20/20 | Respecto al tokenizador de Python |
| Solapamiento top-10 en retrieval | 99,2% | Corpus de 21 pasajes y 12 consultas, frente a la version Core ML |
| Latencia por pasaje | ~330 ms | Galaxy S23, CPU, 4 hilos |
| Latencia por consulta | ~240 ms | Galaxy S23, CPU, 4 hilos |
| Tiempo de carga del modelo | ~1 s | Galaxy S23 |
| Reduccion de tamano | 1655 MB (fp32) → 577 MiB | Cuantizacion int8 de MatMul + embeddings fp16 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el modelo ocupa unos 577 MiB en disco y requiere cargar en memoria el grafo y los pesos; en CPU el consumo es del orden de 1 GB o menos, aunque no se especifica una cifra exacta en la informacion disponible.
- GPU recomendadas: no se indican en la model card; el destino declarado es CPU (ONNX Runtime, Android arm64). Cualquier GPU compatible con ONNX Runtime (por ejemplo, A100, H100, RTX 4090) podria ejecutarlo, pero no hay datos de rendimiento publicados para esos casos.
- Cabe en GPU de consumo: si, por el tamano de pesos, aunque no hay mediciones publicadas en tarjetas consumer.
- Dispositivos moviles verificados: Samsung Galaxy S23 (Android, CPU, 4 hilos). Existe una version Core ML para iPhone y Mac.
- Opciones de despliegue: ONNX Runtime (>= 1.17, probado con 1.28), Text Embeddings Inference (etiqueta `text-embeddings-inference`), y cualquier runtime que soporte el operador `MatMulNBits` de `com.microsoft`.
- Latencia y throughput: ~330 ms por pasaje y ~240 ms por consulta en Galaxy S23 con 4 hilos; no se publican cifras de throughput en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8 | roberta-large (no detallado) | 512 | pl, en | ONNX int8 | Gemma Terms of Use | Version movil Android; ~577 MiB; ~330 ms/pasaje en Galaxy S23 |
| sdadas/mmlw-retrieval-roberta-large-v2 | roberta-large (no detallado) | 512 | pl, en | PyTorch (safetensors, presumiblemente) | Gemma (segun model card origen) | Modelo original fp32; referencia de calidad |
| PiterQ/mmlw-retrieval-roberta-large-v2-CoreML | roberta-large (no detallado) | 512 | pl, en | Core ML | Gemma Terms of Use | Version iPhone/Mac; vectores intercambiables con esta |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar la calidad de recuperacion frente a otros encoders de la misma categoria (por ejemplo, modelos multilingues de sentence-transformers). Cualquier comparacion de rendimiento con alternativas queda por tanto no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo Gemma Terms of Use y Gemma Prohibited Use Policy, no bajo una licencia permisiva. El uso comercial y la redistribucion estan sujetos a las restricciones de la Seccion 3.2 de dichos terminos; es imprescindible revisar `GEMMA_TERMS_OF_USE.md` y `GEMMA_PROHIBITED_USE_POLICY.md` antes de desplegar en produccion.
- El modelo base es un Model Derivative de Gemma porque sus datos de entrenamiento se prepararon con un reranker basado en Gemma; esto condiciona la licencia de toda la cadena de derivados.
- Cobertura linguistica limitada a polaco e ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Ventana de contexto de 512 tokens: los documentos mas largos deben dividirse en pasajes, lo que puede fragmentar el contexto semantico.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperaciones irrelevantes o falsos positivos en la busqueda semantica, especialmente con consultas ambiguas o fuera de dominio.
- La cuantizacion int8 introduce una desviacion minima (similitud coseno media 0,99995 en la muestra evaluada), pero la evaluacion se realizo sobre solo 20 textos y un corpus de 21 pasajes y 12 consultas; la robustez en dominios diversos no esta validada a gran escala.
- Requiere un runtime con soporte del operador `MatMulNBits` (ONNX Runtime >= 1.17); runtimes mas antiguos o alternativos pueden no cargar el grafo.
- Los archivos `model.onnx` y `model.w8.onnx.data` deben mantenerse juntos en la misma carpeta y sin renombrar; de lo contrario la carga falla.
- El prefijo `[query]: ` es obligatorio en las consultas; omitirlo degrada la calidad de recuperacion.
- No hay datos publicados sobre sesgos del modelo base en la informacion disponible; conviene auditar el comportamiento en dominios sensibles antes de usarlo en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PiterQ/mmlw-retrieval-roberta-large-v2-ONNX-int8
- Modelo base original: https://huggingface.co/sdadas/mmlw-retrieval-roberta-large-v2
- Version Core ML (iPhone/Mac): https://huggingface.co/PiterQ/mmlw-retrieval-roberta-large-v2-CoreML
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Trabajo PIRB (LREC-COLING 2024): referencia citada en la model card del modelo original; enlace no disponible en la informacion proporcionada
- Repositorio de la aplicacion AudioTranscriber (herramientas `tools/embed_onnx.sh` y `tools/embed_onnx_convert.py`): enlace no disponible en la informacion proporcionada
