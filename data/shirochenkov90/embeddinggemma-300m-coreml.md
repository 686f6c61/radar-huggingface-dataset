# shirochenkov90/embeddinggemma-300m-coreml

## Resumen

EmbeddingGemma-300m — Core ML es una conversion del modelo de embeddings `google/embeddinggemma-300m` al formato Core ML (ML Program) para su ejecucion nativa en macOS e iOS mediante Swift y Core ML. La publica el usuario `shirochenkov90` y su aportacion es exclusivamente de formato: los pesos no se modifican, solo se empaquetan para que el pipeline completo de sentence-transformers (transformer, mean pooling, dos capas Dense y normalizacion L2) se ejecute dentro del grafo Core ML y devuelva directamente el embedding final, sin post-procesado en Swift.

El modelo base es un encoder de texto de la familia Gemma 3 orientado a generar embeddings de frases y pasajes de 768 dimensiones, con soporte multilingue y truncamiento Matryoshka. Esta conversion esta pensada para aplicaciones que necesitan similitud semantica, busqueda o clasificacion en el dispositivo (on-device), sin llamadas a servidores externos y con la privacidad que eso implica.

Su relevancia es practica: elimina la dependencia de Python, PyTorch o sentence-transformers en produccion sobre Apple Silicon, permitiendo integrar recuperacion semantica y deduplicacion directamente en apps de iPhone, iPad o Mac. La contrapartida es que la ventana de entrada queda limitada a 64 o 256 tokens y el lote es de tamano 1, por lo que no sustituye a un servidor de embeddings de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Gemma 3 text) con mean pooling sobre `attention_mask` y cabezal Dense 768→3072→768 |
| Parametros totales | Denominacion de 300 M segun el nombre del modelo base (`google/embeddinggemma-300m`); cifra exacta no detallada en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens como maximo en esta conversion (formas enumeradas de 64 y 256); la ventana del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | Pesos y computo en float16 (ML Program); no se ofrecen variantes GGUF, int8 ni int4 |
| Idiomas soportados | Multilingue (segun los metadatos del modelo y del modelo base) |
| Licencia | Gemma (Gemma Terms of Use), heredada del modelo base |
| Formato de pesos | `.mlpackage` (Core ML ML Program), mas tokenizer.json, tokenizer_config.json, special_tokens_map.json y config.json sin modificar |
| Dimension del embedding | 768, con truncamiento Matryoshka funcional a 512, 256 y 128 (tomar los N primeros valores y renormalizar) |
| Salida | `embedding` float32 de forma (1, 768), ya normalizada en L2 |
| Entradas | `input_ids` y `attention_mask`, ambas int32, con formas enumeradas (1, 64) o (1, 256) |
| Lote (batch) | 1 |
| Plataforma minima | macOS 15 / iOS 18 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un encoder tipo transformer de la familia Gemma 3 con atencion bidireccional (la conversion usa una mascara de atencion 4-D explicita y position ids, no la mascara causal del modelo generativo). Sobre la salida del encoder, el pipeline aplica mean pooling ponderado por `attention_mask`, dos capas densas (768→3072 y 3072→768) y una normalizacion L2 final. El resultado es un vector de 768 dimensiones cuya similitud coseno equivale al producto escalar, ya que la normalizacion va incluida en el grafo.

En cuanto al entrenamiento, la informacion proporcionada no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas como RLHF, DPO o contrastive learning: esos datos corresponden a la model card de `google/embeddinggemma-300m`, que no forma parte de la informacion disponible. La innovacion tecnica de este repositorio es la conversion en si: se hizo `torch.jit.trace` de un unico modulo `nn.Module` que envuelve todo el pipeline de sentence-transformers, verificando previamente que su salida coincidia con `SentenceTransformer.encode` (coseno = 1.0000), y despues `coremltools.convert` con `convert_to="mlprogram"`, `compute_precision=FLOAT16`, `minimum_deployment_target=macOS15` y formas enumeradas. Las versiones empleadas fueron torch 2.7.0, transformers 5.17.0, sentence-transformers 6.0.1, coremltools 9.0 y numpy 2.3 (numpy ≥ 2.4 rompe coremltools 9.0).

## Capacidades

- Generacion de embeddings de frases y pasajes de 768 dimensiones, listos para similitud coseno o producto escalar.
- Similitud semantica y deteccion de parafrasis, con verificacion cruzada de escrituras (por ejemplo, `скан` frente a `Scan` con coseno 0.7522).
- Recuperacion de informacion (retrieval) mediante prefijos de tarea: `task: search result | query: ` para consultas y `title: none | text: ` para documentos.
- Reranking de resultados de busqueda mediante el mismo esquema de prefijos.
- Clasificacion y clasificacion multietiqueta, con prefijo `task: classification | query: `.
- Clustering de textos y deduplicacion semantica, con prefijo `task: clustering | query: `.
- Bitext mining y comparacion entre idiomas, con prefijo `task: search result | query: `.
- Recuperacion de codigo, mediante el prefijo `task: code retrieval | query: ` (InstructionRetrieval).
- Truncamiento Matryoshka a 512, 256 o 128 dimensiones para reducir memoria y coste de comparacion.
- Ejecucion on-device en Apple Silicon, con `compute_units = ALL` (CPU, GPU y Neural Engine).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito: es un modelo de embeddings, no generativo.

## Casos de uso

- Busqueda semantica on-device en apps de notas o documentacion: indexar los pasajes con el prefijo de documento y las consultas con el prefijo de query, calculando similitud coseno localmente. El limite de 256 tokens obliga a fragmentar los documentos en trozos.
- Deduplicacion de contenido en una app de iOS: generar embeddings de titulares o mensajes y agrupar por similitud para eliminar repetidos sin enviar datos a un servidor.
- Clasificacion de tickets o mensajes de usuario: usar el prefijo `task: classification | query: ` y entrenar un clasificador ligero sobre los embeddings de 768 dimensiones, o truncarlos a 128 para reducir latencia.
- Reranking de resultados de un buscador local: recuperar candidatos con un indice aproximado y reordenarlos con el modelo usando el prefijo `task: search result | query: `.
- Moderacion o filtrado de contenido sensible: comparar cada texto entrante contra un conjunto de ejemplos etiquetados y decidir por umbral de similitud, todo dentro del dispositivo.
- Recomendacion de articulos o productos similares: precalcular embeddings de catalogo por lotes (cada llamada con lote 1) y almacenarlos; en tiempo de consulta solo se calcula el embedding de la peticion.
- Agrupacion tematica de corpus multilingue: el soporte multilingue permite clusterizar textos en distintos idiomas en el mismo espacio vectorial.
- Funciones de memoria semantica en asistentes locales: guardar interacciones como vectores y recuperar las mas relevantes por similitud coseno, sin conexion de red.
- Recuperacion de fragmentos de codigo en un editor para macOS: indexar snippets con el prefijo `task: code retrieval | query: ` y sugerir fragmentos relevantes al escribir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor si aporta una verificacion de fidelidad de la conversion frente al pipeline original en PyTorch, que no es un benchmark de calidad sino una comprobacion de equivalencia numerica:

| Texto | Tokens | Forma | Coseno (PyTorch, Core ML) |
|---|---|---|---|
| Pasaje en ruso (prefijo document) | 153 | (1, 256) | 0.999963 |
| Consulta corta en ruso (prefijo query) | 13 | (1, 64) | 0.999966 |

Comprobacion semantica en Core ML con la consulta `task: search result | query: про деньги`: frente al documento `title: none | text: обсудили бюджет на следующий квартал` da un coseno de 0.2469, y frente a `title: none | text: починили баг в плеере`, 0.1923. Comprobacion entre escrituras: `скан` frente a `Scan` da 0.7522 en Core ML y 0.7524 en PyTorch.

## Requisitos de hardware

- Dispositivo con Apple Silicon obligatorio: macOS 15 o iOS 18 como minimo, por el uso de formas enumeradas en dos entradas.
- Espacio en disco: el repositorio ocupa 0.6 GB, con pesos y computo en float16.
- Memoria en ejecucion: no se publican cifras de VRAM ni de RAM; por el tamano del paquete se puede estimar un consumo por debajo de 1 GB, aunque es una estimacion no confirmada por el autor.
- Uso recomendado con `MLModelConfiguration.computeUnits = .all`, que reparte el trabajo entre CPU, GPU y Neural Engine. En el Neural Engine el runtime puede registrar el aviso `E5RT … tensor_buffer has known strides while the model has FlexibleShapeInfo`, provocado por las formas enumeradas; segun el autor las predicciones siguen siendo correctas.
- No cabe plantear despliegue en GPU NVIDIA: al ser un `.mlpackage`, no es compatible con vLLM, TGI, llama.cpp ni Ollama. El despliegue es mediante Core ML dentro de una app Swift, o mediante la libreria `coreml` de Python en un Mac.
- Lote fijo de 1: no hay soporte de batching, por lo que el throughput depende del numero de llamadas secuenciales. No se publican cifras de latencia ni de tokens por segundo.
- Las entradas deben tener exactamente forma (1, 64) o (1, 256), ambas iguales en una misma llamada. El padding va a la derecha (tokens reales primero, despues id 0 con mascara 0); el padding a la izquierda altera el resultado.
- El tokenizador debe anteponer `<bos>` (id 2) y anadir `<eos>` (id 1); por ejemplo, `проверка` se tokeniza como `[2, 7877, 144813, 1]`.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su modelo de origen. No se dispone de datos verificados de otras alternativas en el material proporcionado.

| Modelo | Parametros | Contexto | Dimension del embedding | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `shirochenkov90/embeddinggemma-300m-coreml` | 300 M (nominal) | 64 o 256 tokens (formas enumeradas) | 768 (Matryoshka a 512/256/128) | `.mlpackage` Core ML, float16 | Gemma | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `google/embeddinggemma-300m` (original) | 300 M (nominal) | No detallada en la informacion disponible | 768 (Matryoshka a 512/256/128) | Pesos PyTorch / safetensors, ejecutable con sentence-transformers | Gemma | HuggingFace |
| Otras alternativas multilingues de embeddings | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma explicita, no soporta tool calling ni agentes.
- La conversion limita la entrada a 64 o 256 tokens. Cualquier texto mas largo que 256 tokens debe truncarse, lo que degrada la calidad en documentos largos frente al modelo original.
- Lote fijo de 1: inadecuado para indexar grandes volumenes con eficiencia; cada embedding requiere una llamada.
- El padding debe ir a la derecha. Un padding a la izquierda cambia el resultado porque las posiciones se calculan internamente como 0…S-1.
- Es imprescindible reproducir exactamente los prefijos de tarea del config de sentence-transformers, espacio final incluido, o la calidad del embedding se resiente.
- Requiere macOS 15 o iOS 18 y hardware Apple Silicon; no hay versiones para Linux, Windows, Android ni GPU NVIDIA.
- El aviso que emite el runtime en el Neural Engine, pese a que el autor lo califica de inofensivo, indica una ruta menos probada que el computo en CPU o GPU.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen obligaciones de uso aceptable y de distribucion; hay que revisarlos antes de integrarlo en un producto.
- El repositorio tiene 0 descargas y 0 likes, y fue publicado y actualizado en septiembre de 2026; no cuenta con validacion de la comunidad ni con un historial de mantenimiento.
- Riesgo de sesgos y de alucinacion semantica: como cualquier modelo de embeddings, puede producir similitudes altas entre textos no relacionados. Los ejemplos del autor muestran valores de coseno de 0.2469 y 0.1923 para consultas y documentos relacionados, lo que indica que los umbrales deben calibrarse por caso de uso y no asumirse.
- El rendimiento real en idiomas distintos del ruso (idioma de las pruebas publicadas) no esta verificado en la informacion disponible.
- Dependencia de versiones concretas: numpy >= 2.4 rompe coremltools 9.0, segun el propio autor.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/shirochenkov90/embeddinggemma-300m-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Incidencia de coremltools citada por el autor (numpy >= 2.4): https://github.com/apple/coremltools/issues/2633
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: solo devuelven paginas de soporte de Microsoft ajenas al tema.
