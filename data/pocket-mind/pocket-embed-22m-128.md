# pocket-mind/pocket-embed-22m-128

## Resumen

Pocket Embed 22M 128 es un modelo de embeddings de frases en ingles desarrollado por pocket-mind, publicado bajo licencia CC BY-SA 4.0. Se construye sobre el encoder sentence-transformers/all-MiniLM-L6-v2 (22.713.216 parametros, arquitectura BERT) al que se anade una proyeccion ajustada que reduce la dimensionalidad de salida de 384 a 128 dimensiones. El objetivo es compactar los indices vectoriales: cada vector de 128 dimensiones ocupa 512 bytes en float32, un tercio del almacenamiento del vector original de 384 dimensiones, mas el coste de metadatos del indice.

El modelo resuelve el problema del coste de almacenamiento y comparacion en busqueda semantica sobre corpus locales. La arquitectura del encoder no cambia y la proyeccion no reduce el numero de parametros ni el trabajo de codificacion de tokens: solo disminuye la dimension usada en la comparacion por similitud. Para ello emplea metodos establecidos de PCA y destilacion de similitud, sin reivindicar una arquitectura nueva. El contexto de entrada esta limitado a 256 word pieces, por lo que los documentos largos deben trocearse antes de codificarse.

La relevancia del modelo esta en su orientacion a despliegue en CPU y en navegador. Incluye exportaciones ONNX de la pipeline completa (pooling, proyeccion y normalizacion) en FP32 (90,6 MB) e INT8 (23,1 MB, un 74,5% menos), lo que permite busqueda offline con requisitos de memoria muy bajos. La model card es explicita sobre el compromiso almacenamiento/calidad y presenta auditorias con intervalos de confianza en lugar de garantias generales de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L6); encoder congelado mas proyeccion ajustada |
| Parametros totales | 22.713.216 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 word pieces (entrada truncada por encima) |
| Tipos de cuantizacion | FP32 (PyTorch por defecto), INT8 (grafo ONNX con pesos QInt8 dinamicos) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX (opset 17), PyTorch |
| Dimension de salida | 128 (por defecto), 64 (opcional via truncate_dim) |
| Dimension del modelo base | 384 |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Tamano del repositorio | 0,2 GB |
| Libreria | sentence-transformers (probado con 5.1.2 y transformers 4.57.1) |
| Pipeline | sentence-similarity / feature-extraction |
| Dataset declarado | rajpurkar/squad |

## Arquitectura y entrenamiento

El modelo reutiliza un encoder MiniLM-L6 de tipo BERT con 22.713.216 parametros, congelado, sobre el que se ajusta una proyeccion que reduce la dimension de 384 a 128 (y opcionalmente a 64). La model card indica que la arquitectura del encoder no se modifica y que la proyeccion emplea PCA y destilacion de similitud, metodos ya establecidos. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO; el unico dataset declarado es rajpurkar/squad.

La innovacion practica no esta en el encoder, sino en el empaquetado de despliegue. Se publica un grafo ONNX de la pipeline completa (incluye pooling, proyeccion y normalizacion) validado contra PyTorch con una diferencia absoluta maxima observada de 3,2e-7 en lotes variables, entradas vacias y truncado a 256 tokens. La version INT8 usa pesos QInt8 dinamicos y devuelve vectores normalizados de 128 dimensiones en float32, con 23,1 MB frente a 90,6 MB del grafo FP32. La model card advierte de que este grafo debe usarse con ONNX Runtime directamente y no cargarse como backend `onnx` de SentenceTransformer. Los vectores generados son incompatibles con los del MiniLM original, por lo que es necesario recodificar el corpus al migrar.

## Capacidades

- Generacion de embeddings de frases normalizados para busqueda semantica y similitud textual.
- Recuperacion densa sobre indices vectoriales exactos, con vectores de 128 dimensiones (o 64 opcionales).
- Ejecucion en CPU y en navegador mediante ONNX Runtime, incluyendo busqueda offline una vez cacheados el grafo y el tokenizer.
- Troceado de documentos largos en pasajes solapados con preservacion de offsets de caracteres originales, mediante el ejemplo `pocket_search.py`.
- Reduccion de dimensionalidad sobre el modelo base: salida a 64 dimensiones con `truncate_dim=64` para escenarios de almacenamiento mas restrictivos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo exclusivamente de extraccion de caracteristicas.
- Capacidad multilingue limitada al ingles.
- No requiere prompt ni prefijo; las mismas funciones se usan para consultas y documentos.

## Casos de uso

- Busqueda semantica local en aplicaciones de escritorio: el modelo puede indexar un corpus de pasajes en JSONL y responder consultas sin conexion, ya que el grafo INT8 ocupa 23,1 MB y la inferencia corre en CPU.
- Busqueda en navegador con privacidad: la demo publica ejecuta inferencia en el dispositivo del usuario y descarga unos 23 MB de pesos INT8 mas los ficheros de runtime, de modo que el texto del corpus y las consultas no salen del cliente.
- Recuperacion aumentada (RAG) con restricciones de memoria: la salida de 128 dimensiones reduce a un tercio el almacenamiento del indice respecto a los 384 del modelo base, util en dispositivos con poca RAM o en indices grandes.
- Deduplicacion y agrupamiento de documentos: los embeddings normalizados permiten calcular similitud coseno directamente con un producto matricial, adecuado para tareas de clustering o near-duplicate detection a escala.
- Sistemas de recomendacion de contenido corto: al codificar frases y consultas con el mismo modelo, se pueden emparejar titulares, preguntas o pasajes con intereses expresados en lenguaje natural.
- Filtrado y enrutado previo en pipelines de recuperacion: al ser un modelo pequeno y rapido en CPU, puede actuar como primera etapa de cribado antes de un reranker de mayor coste.
- Integracion en servicios con text-embeddings-inference: los tags indican compatibilidad con endpoints, lo que facilita su exposicion como servicio HTTP de embeddings.

## Benchmarks y rendimiento

Resultados de nDCG@10 reportados en la model card para la proyeccion de 128 dimensiones:

| Tarea | Pocket 128 FP32 | Pocket 128 INT8 | INT8 / base384 |
|---|---:|---:|---:|
| ArguAna | 0.4932 | 0.4911 | 97,44% |
| SciDocs | 0.1979 | 0.1966 | 90,83% |
| SciFact | 0.6104 | 0.5977 | 92,66% |
| NFCorpus | 0.2938 | 0.2963 | 93,57% |

Retencion de calidad respecto al modelo base de 384 dimensiones (media nDCG@10):

| Metrica | Valor |
|---|---|
| Retencion media en tareas de confirmacion (ArguAna y SciDocs) | 95,9% |
| Mejora frente a truncado bruto a 128 dimensiones | +7,0% |
| ArguAna | 97,8% |
| SciDocs | 91,4% |
| FiQA (FP32) | 88,6% |
| FiQA (INT8) | 86,4% |
| Quora (FP32) | 98,7% |
| Quora (INT8) | 98,3% |
| Grafo INT8 frente a FP32 (media nDCG@10 en ArguAna y SciDocs) | 99,52% |
| Grafo INT8 frente a base384 (media nDCG@10) | 95,45% |

La model card advierte de que la ganancia sobre el truncado bruto a 128 dimensiones en SciDocs es incierta, ya que su intervalo de confianza al 95% pareado incluye el cero, y que a 64 dimensiones SciDocs puntua ligeramente por debajo del truncado bruto del modelo base. BGE Small obtuvo puntuaciones superiores en FiQA y Quora, y el Pocket FP32 quedo ligeramente por debajo del truncado bruto a 128 dimensiones en Quora. El autor no reclama una velocidad de codificacion superior.

## Requisitos de hardware

- Inferencia en CPU: escenario objetivo del modelo; los ejemplos estan pensados para ejecutarse sin GPU.
- VRAM estimada: no disponible con precision; por el tamano del modelo (22,7 millones de parametros) los pesos FP32 ocupan del orden de decenas de MB y el grafo ONNX FP32 descargable es de 90,6 MB.
- Grafo ONNX INT8: 23,1 MB de descarga, lo que permite despliegue en entornos muy limitados.
- GPU recomendadas: no especificadas en la informacion disponible, dado que el modelo esta orientado a CPU y navegador.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU consumer actual e incluso en dispositivos sin GPU dedicada, segun los requisitos declarados en la model card.
- Opciones de despliegue: SentenceTransformer en PyTorch, ONNX Runtime con los grafos FP32 o INT8, y text-embeddings-inference segun los tags del repositorio.
- Latencia y throughput: no disponible; la model card indica explicitamente que no se aporta ninguna afirmacion sobre velocidad de codificacion.
- Memoria en indexado: el ejemplo de indexado local documenta limites de memoria y truncado a 256 tokens en su README.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocket-mind/pocket-embed-22m-128 | 22.713.216 | 128 (64 opcional) | 256 word pieces | CC BY-SA 4.0 | HuggingFace (safetensors, ONNX FP32 e INT8) |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 millones (mismo encoder) | 384 | 256 word pieces | no disponible en la informacion proporcionada | HuggingFace |
| BGE Small | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Segun la model card, BGE Small obtuvo mejores resultados que Pocket Embed en FiQA y Quora. El autor situa explicitamente el modelo como un compromiso entre almacenamiento y calidad, no como un encoder de recuperacion superior a los modelos de dimensionalidad completa. No se dispone de mas datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- No es un modelo generativo: no realiza razonamiento, generacion de texto, codigo ni matematicas.
- La retencion de calidad respecto al modelo base varia por tarea y cae hasta el 86,4% en FiQA con INT8; el rendimiento es inferior al encoder completo de 384 dimensiones.
- La ganancia frente al truncado bruto a 128 dimensiones no es concluyente en SciDocs (el intervalo de confianza incluye cero) y a 64 dimensiones SciDocs queda por debajo del truncado bruto.
- Los vectores son incompatibles con los del MiniLM original: es obligatorio recodificar el corpus al migrar.
- La entrada se trunca a 256 word pieces; los documentos largos deben trocearse previamente.
- El grafo ONNX de pipeline completa no debe cargarse como backend `onnx` de SentenceTransformer.
- Licencia CC BY-SA 4.0: impone condiciones de atribucion y comparticion bajo la misma licencia, lo que puede condicionar el uso comercial y la redistribucion. Conviene revisar los terminos antes de integrarlo en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero la recuperacion puede devolver pasajes irrelevantes si el corpus no esta bien troceado o si la consulta cae fuera del dominio evaluado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (11 y 12 de octubre de 2026) son posteriores a la fecha habitual de publicacion; conviene verificar su vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pocket-mind/pocket-embed-22m-128
- Demo de busqueda en navegador (Space): https://huggingface.co/spaces/pocket-mind/pocket-embed-search
- Exportacion para navegador y grafo ONNX: https://huggingface.co/pocket-mind/pocket-embed-22m-128/tree/main/browser
- Instrucciones del grafo ONNX: https://huggingface.co/pocket-mind/pocket-embed-22m-128/blob/main/browser/README.md
- Ejemplos de indexado en CPU: https://huggingface.co/pocket-mind/pocket-embed-22m-128/blob/main/examples/README.md
- Auditoria adicional con intervalos de confianza: https://huggingface.co/pocket-mind/pocket-embed-22m-128/blob/main/audit/README.md
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
