# DylanCouzon/stella-en-400M-v5-doc-onnx

## Resumen

stella-en-400M-v5-doc-onnx es la conversion a ONNX de la torre de documentos de NovaSearch/stella_en_400M_v5, un transformer denso de aproximadamente 400 millones de parametros especializado en recuperacion asimetrica. La conversion la firma el usuario DylanCouzon, que mantiene ademas los codificadores de consulta ligeros constella-zero y constella-nano dentro de la misma familia. El grafo esta fijado a la revision ffeb2b7ee715c226d4ffe5e4619f7dbb48624c20 del modelo original y no incluye ningun tipo de entrenamiento, ajuste fino ni destilacion: solo cambia el formato de los pesos.

La propuesta es arquitectonicamente asimetrica. Este artefacto se encarga exclusivamente de indexar documentos (una sola vez, tipicamente en la nube) y produce vectores normalizados de 1024 dimensiones; las consultas deben codificarse con los modelos constella-zero o constella-nano, que comparten ese mismo espacio vectorial sin necesidad de reindexar el corpus. Se trata, por tanto, de una torre cara (400 M de parametros) deliberadamente sacada del camino critico por consulta.

Su relevancia practica es doble. Por un lado elimina dependencias de Python en produccion: el grafo incorpora el pooling y la normalizacion, no requiere torch ni trust_remote_code, y se integra con ONNX Runtime y FastEmbed. Por otro lado, es un research preview: la validacion descriptiva BEIR-18 y la evaluacion con vocabulario reservado siguen pendientes y no se reclama ningun resultado sobre ellas, y los tres modelos estan registrados en una rama de preview de FastEmbed, no en una release upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (encoder) derivado de gte-large-en-v1.5; codificador dual asimetrico, torre de documentos |
| Parametros totales | ~400 M (segun la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens en el tokenizador del grafo ONNX (la declaracion original de 32768/8000 se reduce a 512 al convertir) |
| Tipos de cuantizacion | Solo fp32; no se publica grafo fp16 ni int8 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17, operadores estandar, sin initializers de datos externos) |
| Dimension de embedding | 1024 (salida fp32 normalizada, forma `(batch, 1024)`) |
| Entradas del grafo | `input_ids` y `attention_mask` (int64) |
| Tamano del repositorio | 1,7 GB (model.onnx ~1,75 GB) |
| Libreria declarada | fastembed |
| Modelo base | NovaSearch/stella_en_400M_v5 (revision ffeb2b7ee715c226d4ffe5e4619f7dbb48624c20) |

## Arquitectura y entrenamiento

El grafo implementa un encoder transformer con un cabezal de proyeccion lineal y normalizacion, en la secuencia exacta `masked mean over last_hidden_state → 2_Dense_1024 → L2 normalization`. La salida es un vector fp32 de 1024 dimensiones con norma L2 unitaria. Las entradas son `input_ids` y `attention_mask` en int64; no se admiten secuencias emparejadas ni `token_type_ids`. El tokenizador se reconfigura para que FastEmbed aplique padding dinamico hasta la secuencia mas larga del lote, en lugar del padding fijo a 512 que declaraba el modelo original. El grafo se genero con `torch.onnx.export` en opset 17 con constante folding.

No hubo entrenamiento, ajuste fino ni destilacion en esta conversion: los pesos son identicos a los del modelo base. En consecuencia, no hay informacion disponible en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo Stella original; esos detalles corresponden a NovaSearch y no se reproducen aqui. La innovacion tecnica del artefacto es el modo de despliegue: pooling y normalizacion dentro del grafo, ausencia de dependencia de torch y de codigo remoto, y compatibilidad directa con el ecosistema FastEmbed y Qdrant.

La validacion de paridad se hizo contra la ruta de documentos en torch sobre 259 pasajes congelados de Natural Questions, estratificados por longitud e incluyendo la frontera 511/512/513 y casos de truncado. La comparacion ONNX CUDA frente a CPU da una similitud coseno minima de 1.000000 y un error absoluto maximo de 9,07e-05, con invarianza bit a bit frente a lotes de longitud irregular. Se descarto deliberadamente publicar un grafo fp16: un candidato apenas alcanzo 0,662 de similitud coseno minima frente a la referencia fp32 en CUDA, y su resultado en CPU resultaba enganoso porque ONNX Runtime lo promocionaba a fp32 internamente.

## Capacidades

- Generacion de embeddings de documentos: extrae vectores normalizados de 1024 dimensiones a partir de texto en ingles, con pooling de media enmascarada integrado en el grafo.
- Recuperacion asimetrica: forma la mitad documental de un esquema dual encoder; el corpus se codifica una sola vez y sirve a varios codificadores de consulta.
- Interoperabilidad de indices: los vectores son geometricamente compatibles con los producidos por constella-zero y constella-nano sobre el mismo espacio de 1024 dimensiones, sin reindexado.
- Inferencia sin torch: el grafo no necesita `trust_remote_code` ni implementacion Python del modelo, lo que simplifica el despliegue en entornos gestionados.
- Procesamiento por lotes: usa padding dinamico hasta la secuencia mas larga del lote y mantiene invarianza bit a bit frente a lotes irregulares.
- Busqueda semantica y deduplicacion: utilizable como base para similitud coseno, clustering y deteccion de near-duplicates.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas, no generativo.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue: no disponible; el modelo esta restringido a ingles.
- Longitud de entrada limitada a 512 tokens, sin soporte de secuencias emparejadas.

## Casos de uso

- Indexacion masiva de corpus documental: el modelo codifica cada documento una unica vez y el indice resultante de 1024 dimensiones puede reutilizarse con distintos codificadores de consulta, lo que reduce el coste de reencoding cuando se cambia o mejora la parte de consulta.
- Recuperacion aumentada (RAG) sobre documentacion tecnica: los pasajes se embeben con esta torre y se almacenan en Qdrant u otro almacen vectorial; en tiempo de consulta se usa constella-zero o constella-nano, que comparten el espacio vectorial, para mantener baja la latencia del camino por consulta.
- Busqueda semantica en catalogos de productos o contenidos: al ser una torre de documentos pura, encaja en pipelines donde el inventario cambia con poca frecuencia pero el trafico de consultas es alto.
- Deduplicacion y agrupacion tematica: los embeddings normalizados permiten calcular similitud coseno por pares y aplicar clustering para detectar documentos duplicados o casi duplicados en un repositorio grande.
- Filtrado y reranking en dos etapas: recuperacion inicial por ANN sobre el indice de 1024 dimensiones y posterior reordenacion de candidatos con un modelo cross-encoder mas costoso.
- Etiquetado y enrutado automatico de tickets de soporte: se embeben los tickets entrantes y se comparan contra un conjunto de descripciones de categoria, aprovechando la normalizacion L2 para usar producto escalar como similitud directa.
- Clasificacion zero-shot mediante clasificador ligero: los vectores de 1024 dimensiones sirven como caracteristicas para un clasificador lineal entrenado sobre pocas etiquetas, sin reentrenar el encoder.
- Recomendacion basada en contenido: similitud entre el embedding de un elemento de referencia y el resto del catalogo indexado, con actualizacion incremental del indice solo cuando entra contenido nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que la evaluacion con vocabulario reservado y la validacion descriptiva BEIR-18 de la familia estan pendientes y sin gastar, y que no se reclama ningun resultado sobre ellas. La unica tabla de medicion publicada es de paridad numerica, no de calidad de recuperacion:

| Comparacion | Similitud coseno minima | Error absoluto maximo |
|---|---:|---:|
| ONNX CPU frente a torch | no disponible (marcadores PARITY_FP32_COS y PARITY_FP32_ABS sin rellenar en la model card) | no disponible |
| ONNX CUDA frente a CPU | 1,000000 | 9,07e-05 |

Las normas de las salidas se reportan en la model card bajo el marcador PARITY_FP32_NORMS, sin valor publicado. La invarianza frente a lotes de longitud irregular se describe como bit a bit identica.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2 GB para los pesos fp32 (~1,75 GB de grafo) mas el espacio de activaciones, que crece con el tamano de lote y la longitud de secuencia hasta 512 tokens. Cifra estimada, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; una RTX 3060, RTX 4060 o superior cubre la inferencia en lotes moderados. En centros de datos, una A100 o H100 resulta sobredimensionada para el modelo, aunque puede interesar para indexacion masiva en paralelo.
- Cabe en GPU de consumo: si, el grafo fp32 ocupa menos de 2 GB, por lo que entra en practicamente cualquier GPU consumer moderna e incluso en equipos integrados con memoria compartida.
- Inferencia en CPU: viable, es uno de los escenarios previstos por la conversion. El propio autor advierte que los resultados de paridad en CPU pueden ser enganosos porque ONNX Runtime promociona internamente la precision.
- Opciones de despliegue: FastEmbed a traves de la rama de preview `constella-research-preview` del fork de Dylancouzon; ONNX Runtime directamente sobre model.onnx; integracion con Qdrant como almacen vectorial. No es un modelo generativo, por lo que vLLM, TGI y llama.cpp no aplican.
- Cuantizacion: no hay grafos fp16 ni int8 publicados. El autor descarto fp16 tras medir 0,662 de similitud coseno minima frente a la referencia fp32 en CUDA.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| stella-en-400M-v5-doc-onnx | ~400 M | 512 tokens en el grafo ONNX | 1024 | MIT | ONNX fp32 | Torre de documentos; sin evaluacion BEIR publicada; research preview |
| NovaSearch/stella_en_400M_v5 | ~400 M | 32768/8000 declarados en configuracion | 1024 | MIT | safetensors / torch | Modelo fuente; ruta de consulta con prompt `s2p_query`; artefacto distinto |
| Alibaba-NLP/gte-large-en-v1.5 | no disponible | no disponible | no disponible | Apache-2.0 | safetensors | Ancestro arquitectonico del que deriva Stella |
| constella-zero / constella-nano | no disponible (encoders de consulta ligeros) | no disponible | 1024 (espacio compartido) | no disponible en la informacion proporcionada | no disponible | Codificadores de consulta de la misma familia; la compatibilidad geometrica no implica paridad de recuperacion |

No se dispone de cifras de rendimiento comparado (BEIR, MTEB u otros) para ninguno de estos artefactos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Truncado a 512 tokens: cualquier documento mas largo se recorta, lo que degrada la representacion de pasajes extensos. La declaracion original de 32768/8000 del modelo fuente no se mantiene en este grafo.
- Solo ingles: no hay soporte multilingue declarado.
- Es una torre de documentos, no un modelo completo de recuperacion. Las consultas requieren el prompt `s2p_query` del modelo fuente, que ni este grafo ni FastEmbed anaden; para consultas hay que usar constella-zero o constella-nano.
- Compatibilidad geometrica no es equivalencia: que los tres modelos compartan el mismo espacio de 1024 dimensiones no implica paridad de recuperacion ni resultados equivalentes.
- Sin sin soporte de secuencias emparejadas ni `token_type_ids`, lo que descarta su uso directo en tareas de cross-encoding o pares pregunta-respuesta.
- Estado de research preview: la evaluacion BEIR-18 y la validacion con vocabulario reservado estan pendientes; no hay resultados de calidad publicados. Los modelos estan en una rama de preview de FastEmbed y no en una release upstream, lo que implica riesgo de cambios en la API de integracion.
- Sin cuantizacion disponible: no hay grafos fp16 ni int8, y el intento de fp16 en CUDA mostro una degradacion severa (0,662 de similitud coseno minima frente a fp32).
- Paridad CPU-torch no verificable con los datos publicados: los marcadores PARITY_FP32_COS, PARITY_FP32_ABS y PARITY_FP32_NORMS aparecen sin rellenar en la model card. Las advertencias del autor sobre la promocion de precision en CPU sugieren precaucion al medir en ese entorno.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni evaluaciones de sesgo para esta conversion. Al ser un modelo de embeddings no genera texto, por lo que el riesgo de alucinacion se traslada al sistema que consuma los vectores (por ejemplo, un generador en un pipeline RAG).
- Adopcion muy baja: 53 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.
- Licencia MIT: permite uso comercial, pero el repositorio redistribuye pesos de NovaSearch bajo los mismos terminos y no reclama licencia separada. El modelo fuente deriva de Alibaba-NLP/gte-large-en-v1.5 (Apache-2.0); la conversion no redistribuye implementacion Python del modelo. Se recomienda citar a Stella para el modelo en si.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DylanCouzon/stella-en-400M-v5-doc-onnx
- Modelo base: https://huggingface.co/NovaSearch/stella_en_400M_v5
- Codificador de consulta ligero constella-zero: https://huggingface.co/DylanCouzon/constella-zero
- Codificador de consulta constella-nano: https://huggingface.co/DylanCouzon/constella-nano
- Ancestro arquitectonico gte-large-en-v1.5: https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5
- Rama de preview de FastEmbed: https://github.com/Dylancouzon/fastembed/tree/constella-research-preview
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
