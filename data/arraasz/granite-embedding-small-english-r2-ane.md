# Arraasz/granite-embedding-small-english-r2-ane

## Resumen

Este repositorio contiene una re-exportacion a ONNX del modelo de embeddings `ibm-granite/granite-embedding-small-english-r2` de IBM, publicada por el usuario Arraasz. El objetivo no es mejorar el modelo, sino reescribir su grafo de computo para que el proveedor de ejecucion CoreML de ONNX Runtime pueda colocar practicamente toda la red en el Apple Neural Engine (ANE) de los Mac con Apple Silicon. Los pesos son los de IBM, sin cambios salvo el casting a float16; lo unico modificado es el grafo.

El modelo base es un ModernBERT de 47 millones de parametros, 12 capas y 384 dimensiones de embedding, orientado a la extraccion de caracteristicas y a la generacion de vectores de frase o documento. Esta exportacion limita la longitud maxima a 1024 tokens (frente a los 8192 del modelo original) y expone dos salidas: `last_hidden_state` y `sentence_embedding`, siendo esta ultima el vector [CLS] sin normalizar en L2.

Su relevancia es de caracter practico: demuestra que un transformer bidireccional se puede ejecutar casi por completo en la NPU de Apple, con un consumo de CPU muy reducido. Segun la model card, en un Apple M4 genero los embeddings de las mismas 200 filas con entre un 6 % y un 8 % de los CPU-segundos de una ruta MLX sobre GPU, manteniendo la misma calidad de recuperacion. Los pesos ocupan 5,6 MB mas 102,4 MB de datos externos en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional), 12 capas |
| Parametros totales | 47 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens en esta exportacion; el modelo base acepta 8192 |
| Tipos de cuantizacion | fp16 (pesos y computo); salidas en fp32. No se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX opset 17 con operadores estandar, fp16; `model_fp16.onnx` (5,6 MB) y datos externos `model_fp16.onnx_data` (102,4 MB) |
| Dimension del embedding | 384 |
| Entradas | `input_ids` int64 `[batch_size, sequence_length]`, `attention_mask` int64 `[batch_size, total_sequence_length]` |
| Salidas | `last_hidden_state` fp32 `[batch_size, sequence_length, 384]`, `sentence_embedding` fp32 `[batch_size, 384]` (vector [CLS], sin normalizar en L2) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT: un encoder transformer con atencion bidireccional, capas locales con ventana deslizante de 64 tokens por lado y capas globales, y RoPE con dos valores de theta (10000 en las capas locales y 80000 en las globales). El modelo base tiene 12 capas y 384 dimensiones, lo que da los 47 millones de parametros. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el proceso de ajuste del modelo original en la documentacion proporcionada.

La aportacion de este repositorio es la reescritura del grafo. Partiendo de los principios de `ml-ane-transformers` de Apple, aplicados a mano a ModernBERT en PyTorch y exportados con el exportador TorchScript ONNX, el grafo resultante incluye: layout de activaciones `(batch, channels, 1, sequence)` desde la normalizacion de embeddings hasta la normalizacion final; sustitucion de cada `nn.Linear` por una `Conv2d` 1x1 sin sesgo; LayerNorm escrito como operaciones explicitas de media y varianza sobre la dimension de canales, con estadisticos calculados sobre `x / 64` y epsilon dividido por 64 al cuadrado para evitar desbordamientos de fp16 (los canales residuales alcanzan magnitudes de ~1800 y sus cuadrados centrados ~3.2e6, por encima del maximo de fp16); atencion por cabeza como dos `MatMul` en lugar de `Einsum`; plegado de `rotate_half` en la convolucion QKV (768 canales de salida adicionales que contienen `R @ Wq` y `R @ Wk`, eliminando los operadores `Neg`); y mascaras de ventana deslizante y tablas cos/sin de RoPE precalculadas para 1024 posiciones y recortadas en tiempo de ejecucion. El resultado es un grafo con una sola particion CoreML, frente a las 25 o 13 de las alternativas:

| Grafo | Particiones CoreML | Nodos en CoreML | Causa de la division |
|---|---|---|---|
| `onnx-community` `model.onnx` (export estandar) | 25 | 337 de 375 | operador contrib `MultiHeadAttention` y `Neg` |
| Re-export simple de Hugging Face, operadores estandar | 13 | 525 de 549 (fp32), 599 de 623 (fp16) | los 24 operadores `Neg` del `rotate_half` de HF |
| Layout ANE, atencion como `Einsum` | 25 | 0 de 288 `Einsum` | CoreML EP no acepta `Einsum` |
| Layout ANE, atencion como `MatMul` (este repositorio) | 1 | 1405 de 1405 (fp32), 1407 de 1407 (fp16) | ninguna |

Se documenta ademas que un export en fp32 del mismo layout carga como una sola particion, pero Core ML no coloca ninguna operacion en el Neural Engine: con `ALL` todo va a la GPU y con `CPUAndNeuralEngine` todo va a la CPU. En fp16, 1402 de 1407 operaciones se situan en el ANE.

## Capacidades

- Generacion de embeddings de frases y documentos: vector [CLS] de 384 dimensiones por secuencia.
- Similitud semantica y busqueda por similitud vectorial (con normalizacion L2 manual del vector `sentence_embedding`).
- Recuperacion de informacion y aumento de contexto (RAG) sobre corpus en ingles.
- Clustering y agrupacion semantica de textos.
- Clasificacion de texto y analisis de sentimiento mediante un cabezal o clasificador externo sobre los embeddings.
- Deduplicacion y deteccion de near-duplicates.
- Inferencia en el Apple Neural Engine de los Mac con Apple Silicon, con la CPU mayoritariamente libre.
- Salida `last_hidden_state` para tareas que requieran representaciones por token en lugar de un unico vector.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades de vision ni de audio.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente para ingles (`en`).

## Casos de uso

- Busqueda semantica en aplicaciones de escritorio para Mac: el modelo se ejecuta en el ANE con el proveedor CoreML y deja la CPU libre para la interfaz, de modo que una app nativa puede indexar y consultar documentos locales sin depender de servicios en la nube.
- Aumento de contexto en RAG: se indexan fragmentos de documentacion en ingles y se recuperan los mas relevantes por similitud coseno antes de pasarlos a un modelo generativo; los 1024 tokens de contexto por fragmento son suficientes para parrafos y secciones cortas.
- Deduplicacion de corpus: generando embeddings por registro y aplicando un umbral sobre la similitud coseno se detectan documentos repetidos o casi identicos en pipelines de limpieza de datos.
- Clasificacion y enrutamiento de tickets de soporte en ingles: los embeddings alimentan un clasificador ligero que asigna categoria o prioridad, con la inferencia en local para no enviar datos sensibles fuera del equipo.
- Agrupacion tematica de articulos o resenas: se calculan embeddings de todo el corpus y se aplica un algoritmo de clustering para descubrir temas sin etiquetas previas.
- Recomendacion por contenido: se indexan los embeddings de un catalogo y se devuelven los elementos mas proximos al vector de un elemento o de una consulta del usuario.
- Filtrado y moderacion en el borde: al ejecutarse en el Neural Engine con poco consumo de CPU, es viable integrarlo en aplicaciones de cliente que necesitan comparar entradas contra una lista de patrones o ejemplos conocidos.
- Extraccion de caracteristicas para modelos posteriores: la salida `last_hidden_state` sirve como entrada de tareas a nivel de token, como etiquetado de secuencias, en lugar de reducir toda la secuencia a un unico vector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la calidad de recuperacion es la misma que la de la ruta MLX sobre GPU, pero no incluye cifras de metricas estandar como MMLU, MTEB u otras, ni la seccion de resultados referenciada.

El unico dato de rendimiento documentado es de eficiencia de ejecucion: en un Apple M4, este grafo genero los embeddings de las mismas 200 filas consumiendo entre un 6 % y un 8 % de los CPU-segundos de una ruta sobre GPU con MLX. En CPU, a traves de cualquier proveedor de ejecucion de ONNX Runtime, el grafo no ofrece ventaja de velocidad frente a un export normal y produce los mismos vectores que un export fp16 estandar (coseno [CLS] por fila de 1.000000).

## Requisitos de hardware

- VRAM y memoria: los pesos en fp16 suman aproximadamente 108 MB (5,6 MB de grafo mas 102,4 MB de datos externos), por lo que el modelo cabe en cualquier Mac con Apple Silicon y en cualquier GPU de consumo.
- GPU y NPU recomendadas: Apple Silicon de la familia M (M1, M2, M3, M4) con Apple Neural Engine, ejecutando ONNX Runtime con `CoreMLExecutionProvider` y `MLComputeUnits=CPUAndNeuralEngine`.
- En GPU de consumo tipo RTX 4090 no se documenta ningun beneficio especifico de este layout; el grafo funciona en proveedores de ejecucion de CPU de ONNX Runtime sin ventaja de rendimiento.
- fp32 no es utilizable en el ANE: un export fp32 del mismo layout no coloca operaciones en el Neural Engine, por lo que fp16 es un requisito, no una opcion.
- Opciones de despliegue: ONNX Runtime (proveedor CoreML o CPU), y el repositorio esta etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`. No es un reemplazo directo de `sentence-transformers` ni de `transformers`: hay que tokenizar, ejecutar el grafo ONNX, extraer `sentence_embedding` y normalizar en L2 manualmente.
- Latencia y throughput: no disponibles mas alla del dato relativo del M4 (6 % a 8 % de los CPU-segundos de una ruta MLX sobre GPU para 200 filas). No se publican valores absolutos de latencia ni de filas por segundo.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base documentadas en la model card, ya que no se proporcionan datos de otros modelos de embeddings de tamano similar.

| Modelo o variante | Parametros | Contexto | Precision y formato | Particiones CoreML | Licencia |
|---|---|---|---|---|---|
| `ibm-granite/granite-embedding-small-english-r2` (base, IBM) | 47M | 8192 | no disponible | no aplica | Apache 2.0 |
| Este repositorio (layout ANE, atencion como MatMul) | 47M | 1024 | fp16 ONNX | 1 | Apache 2.0 |
| Re-export simple de Hugging Face con operadores estandar | 47M | no disponible | ONNX fp32 y fp16 | 13 | no disponible |
| `onnx-community` `model.onnx` (export estandar) | 47M | no disponible | ONNX | 25 | no disponible |

Frente al modelo base, esta exportacion pierde contexto (1024 frente a 8192 tokens) a cambio de una ejecucion casi integra en el Neural Engine. Frente a los exports ONNX convencionales, reduce de 13 o 25 particiones CoreML a una sola, lo que evita transferencias de datos entre el ANE y la CPU en cada frontera de particion.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no se declara soporte de otros idiomas, por lo que su uso en corpus multilingues degradara la calidad de los embeddings.
- Truncamiento de contexto: esta exportacion acepta 1024 tokens frente a los 8192 del modelo base. Los textos mas largos se truncaran silenciosamente salvo que el codigo de integracion lo gestione, con perdida de informacion en documentos extensos.
- El vector `sentence_embedding` no esta normalizado en L2. Si se olvida la normalizacion, las comparaciones por producto interno no equivalen a similitud coseno y los resultados de retrieval se distorsionan.
- No es un reemplazo directo de `sentence-transformers` o `transformers`: requiere tokenizacion y ejecucion manual del grafo ONNX mas el posprocesado.
- Dependencia de fp16: en fp32 el grafo no se ejecuta en el Neural Engine, lo que anula la ventaja principal de esta exportacion.
- Es un repositorio de terceros (usuario Arraasz), no una publicacion oficial de IBM; no se documentan procesos de validacion adicionales mas alla de la re-exportacion.
- No se documentan sesgos especificos ni evaluaciones de equidad del modelo base en la informacion disponible; al ser un modelo entrenado sobre corpus web en ingles, es razonable esperar sesgos heredados, pero no hay datos que los cuantifiquen.
- El riesgo de alucinacion como tal no aplica a un modelo de embeddings, pero si existe riesgo de recuperacion irrelevante o incorrecta cuando se usa como retriever en un sistema RAG, especialmente con fragmentos que superan la ventana de 1024 tokens.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos con los que fue entrenado.
- Las fechas de creacion y actualizacion del repositorio son posteriores a la fecha actual, lo que puede indicar metadatos inconsistentes o generados automaticamente; conviene tratarlo con cautela.
- El repositorio registra cero descargas y cero likes, por lo que no hay evidencia de uso en produccion por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Arraasz/granite-embedding-small-english-r2-ane
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-embedding-small-english-r2
- Apple ml-ane-transformers (referencia de la tecnica de reescritura del grafo): https://github.com/apple/ml-ane-transformers
- Referencia arXiv asociada en las etiquetas del repositorio: https://arxiv.org/abs/2508.21085
