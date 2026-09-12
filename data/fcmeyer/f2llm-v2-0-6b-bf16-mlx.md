# fcmeyer/F2LLM-v2-0.6B-bf16-mlx

## Resumen

F2LLM-v2-0.6B-bf16-mlx es un port nativo a MLX del modelo de embeddings multilingue codefuse-ai/F2LLM-v2-0.6B, desarrollado por el usuario fcmeyer para ejecucion en Apple Silicon a traves de la libreria mlx-embeddings. El modelo original lo publica CodeFuse (equipo de Ant Group) dentro de la familia F2LLM-v2, presentada en el articulo "F2LLM-v2: Inclusive, Performant, and Efficient Embeddings for a Multilingual World". Se trata de un modelo de extraccion de caracteristicas de 596.049.920 parametros (0,6B) construido sobre una arquitectura Qwen3, con pooling de ultimo token, salida normalizada L2 de 1024 dimensiones y entrenamiento con MRL (Matryoshka Representation Learning), lo que permite truncar el vector a 128 o 8 dimensiones renormalizando despues.

Su relevancia es doble. Por un lado, cubre la demanda de embeddings multilingues de licencia Apache-2.0 con un tamano que cabe holgadamente en memoria unificada de equipos de consumo. Por otro, esta variante concreta resuelve el problema de ejecucion en macOS: la conversion es una copia bf16 bit-exacta de los safetensors originales (diferencia maxima absoluta 0,0 en los 310 tensores) con el prefijo de claves `model.` que exige mlx-embeddings, sin cuantizacion, y con paridad de tokenizer verificada frente a la implementacion de referencia en PyTorch.

El repositorio es una conversion, no un modelo nuevo: no anade entrenamiento ni ajuste adicional. Se publico el 12 de septiembre de 2026, ocupa 1,2 GB (1,1 GB de pesos) y declara soporte para alrededor de 90 idiomas, entre ellos castellano, ingles, chino, ruso, frances, aleman, arabe, hindi, japones, coreano y portugues. El modelo base es codefuse-ai/F2LLM-v2-0.6B y la licencia resultante es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3, adaptado a extraccion de embeddings con pooling de ultimo token |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens empleados en los ejemplos de uso de la model card (el limite maximo no se declara de forma explicita) |
| Dimension de embedding | 1024, con truncamiento MRL a 128 y 8 dimensiones previa renormalizacion |
| Tipos de cuantizacion | No disponible. Este repositorio distribuye pesos bf16 sin cuantizar; no se ofrecen variantes GGUF ni de 4/8 bits |
| Idiomas soportados | Alrededor de 90 idiomas declarados, entre ellos es, en, zh, ru, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, he, hu, eu, ta, bn, ur, sw y af |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en bfloat16 con estructura MLX (`model.safetensors` mas indice) |
| Tamano del repositorio | 1,2 GB (pesos: 1,1 GB) |
| Pooling | Ultimo token (last-token), normalizacion L2; `include_prompt=true` |
| Libreria de inferencia | mlx-embeddings 0.1.0 (convertido con `python -m mlx_embeddings.convert --dtype bfloat16`) |
| Modelo base | codefuse-ai/F2LLM-v2-0.6B |
| Dataset asociado | codefuse-ai/F2LLM-v2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3 reutilizado como codificador de frases. El modelo no genera texto: procesa la secuencia completa y extrae el estado oculto del ultimo token como representacion de la frase, que despues se normaliza L2 para obtener un vector de 1024 dimensiones. Esta combinacion de pooling de ultimo token con normalizacion es la convencion declarada en la model card y en el archivo `1_Pooling/config.json` del repositorio. El entrenamiento con MRL permite obtener representaciones de menor dimension truncando el vector y renormalizando (por ejemplo, `e = e[..., :128]; e = e / max(norm(e), 1e-9)`), lo que habilita indexacion barata con perdida minima de calidad segun las pruebas del autor.

Esta variante concreta no introduce entrenamiento ni ajuste adicional: es una conversion de pesos. La model card documenta que se trata de una copia bf16 bit-exacta del modelo original, con diferencia maxima absoluta de 0,0 en los 310 tensores, que solo se modifican los prefijos de claves y que no se aplica cuantizacion. Se conservan los archivos de configuracion, tokenizer, `modules.json`, `config_sentence_transformers.json` y `1_Pooling/config.json`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO sobre el modelo base.

La innovacion tecnica documentada es de fidelidad de conversion, no de arquitectura. El autor aporta una verificacion detallada frente a la referencia en PyTorch bf16, incluida la comprobacion de que las discrepancias residuales de batching proceden del backend de atencion fast-SDPA de mlx-embeddings para Qwen3 y no de un error en los pesos (el mismo comportamiento se reproduce en la conversion fp32, con desviacion menor).

## Capacidades

- Generacion de embeddings de texto para tareas de similitud semantica, recuperacion y clasificacion, con salida de 1024 dimensiones normalizada L2.
- Recuperacion asimetrica consulta-documento mediante el prompt de instruccion `Instruct: Given a question, retrieve passages that can help answer the question.\nQuery: `, que debe aplicarse a las consultas y no a los pasajes.
- Tareas simetricas (similitud semantica textual, clustering, deduplicacion) sin prompt, segun la convencion del modelo base.
- Multilingue: alrededor de 90 idiomas declarados, con verificacion practica en ingles, chino y ruso, y textos de codigo y de idioma mixto en la suite de pruebas.
- Representaciones de dimension variable mediante MRL (1024, 128 y 8 dimensiones verificadas, preservando el ranking en los tres casos).
- Procesamiento de entradas largas en lotes con `padding=True`, `truncation=True` y `max_length=4096`; el truncamiento conserva la cabeza de la secuencia y anade el token EOS (verificado: primeros 511 tokens mas EOS con `max_length=512`).
- No dispone de generacion de texto, razonamiento, codigo generativo, vision, audio, tool calling ni capacidades de agente. Es exclusivamente un modelo de extraccion de caracteristicas (`pipeline_tag: feature-extraction`).
- El modelo base declara compatibilidad con text-embeddings-inference y endpoints, lo que facilita su despliegue como servicio de embeddings; esta conversion MLX, en cambio, esta pensada para inferencia local en Apple Silicon.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) multilingue: indexar una base documental con vectores de 1024 dimensiones y consultar en cualquiera de los idiomas soportados sin traducir previamente, usando el prompt de instruccion solo en la consulta. El contexto de 4096 tokens permite indexar fragmentos largos sin trocear en exceso.
- Busqueda semantica en corpus mezclados de varios idiomas: gracias a la alineacion multilingue, una consulta en castellano puede recuperar pasajes en ingles o chino dentro del mismo espacio vectorial, lo que simplifica el mantenimiento de un unico indice.
- Deduplicacion y near-duplicate detection: calcular similitudes por producto escalar entre embeddings ya normalizados para detectar documentos o registros duplicados en grandes volumenes; el truncamiento MRL a 128 dimensiones reduce el coste de almacenamiento y de comparacion.
- Clustering y topic modeling de documentacion tecnica o tickets de soporte: agrupar por similitud coseno sin entrenamiento adicional y sin prompt, ya que es una tarea simetrica.
- Clasificacion zero-shot y enrutado de intenciones: comparar el embedding de un mensaje entrante contra descripciones textuales de cada categoria y asignar la mas cercana; util en bandejas de atencion al cliente o en triaje de incidencias.
- Memoria a largo plazo en agentes conversacionales: almacenar turnos o resumenes como embeddings y recuperar los fragmentos relevantes por similitud antes de construir el prompt de un modelo generativo, reduciendo el consumo de contexto del LLM principal.
- Evaluacion de calidad de traducciones y parafrasis: medir la similitud semantica entre original y traduccion en el mismo espacio multilingue para detectar omisiones o desviaciones de sentido.
- Busqueda de codigo y documentacion de APIs: la suite de verificacion incluye un texto de codigo, de modo que el modelo puede indexar fragmentos de codigo junto a su documentacion en lenguaje natural dentro del mismo indice.
- Sistemas de recomendacion por contenido: representar items y perfiles de usuario como vectores y ordenar candidatos por similitud coseno, con reindexacion rapida gracias a las dimensiones reducidas de MRL.
- Ejecucion local en portatiles Apple Silicon: al ser un modelo de 0,6B con pesos de 1,1 GB, permite construir prototipos de busqueda semantica sin GPU dedicada ni coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, MTEB, BEIR ni de tareas similares, ni comparaciones numericas con otros modelos de embeddings. Lo unico documentado son las pruebas de fidelidad de la conversion frente a la referencia en PyTorch bf16, ejecutadas en un Apple M5 Max:

| Prueba | Resultado |
|---|---|
| Similitud coseno por fila (suite de 10 textos, tras renormalizar) | Peor caso 0,9985 (~3,2 grados); tipico >= 0,9992 (~2,1 grados) |
| Conversion fp32 (referencia de control) | Peor caso 0,9995 |
| Deltas de coseno consulta frente a todos los documentos | <= 0,004; ranking identico 10/10; top-1 identico; documento no relacionado en ultima posicion 10/10 |
| Truncamiento MRL a 1024 / 128 / 8 dimensiones | Peor coseno 0,9985 / 0,9985 / 0,9969; ranking preservado en las tres configuraciones |
| Paridad de tokenizer frente al tokenizer de origen | Flujo de tokens identico en la prueba (28 tokens, misma cabeza y cola, incluido EOS 151645) |
| Latencia en Apple M5 Max | ~8 ms por lote con bs=1; ~500 ms por lote con bs=8 incluyendo un documento de 2001 tokens |
| Invariancia de batching | Filas sin necesidad de padding: diferencia maxima absoluta 0,0 (invariancia de orden y de lote) |
| Mezcla de longitudes muy dispares (28 frente a 2001 tokens) | Desviacion de ~0,005 max abs en la fila corta; atribuida al enmascarado fast-SDPA de mlx-embeddings para Qwen3, no a los pesos |
| Diferencia de estado oculto con el backend fp32 | ~0,14 en fp32 frente a ~2,4 en bf16, lo que situa el origen en el backend de atencion |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos bf16 ocupan 1,1 GB. Como estimacion a partir del tamano de pesos, la inferencia con lotes pequenos deberia requerir del orden de 1,5 a 2 GB de memoria, mas el espacio de activaciones, que crece con la longitud de secuencia hasta los 4096 tokens. No se han publicado mediciones oficiales de pico de memoria.
- Apple Silicon: es el objetivo principal del port. Verificado en un Apple M5 Max mediante mlx-embeddings 0.1.0. Cabe en cualquier Mac con memoria unificada de 8 GB o superior, ya que el modelo completo ocupa 1,1 GB.
- GPU de consumo: el modelo base de 0,6B cabe sin problema en GPUs con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090 y similares) si se ejecuta a traves de sentence-transformers, transformers o text-embeddings-inference, no mediante esta conversion MLX.
- GPU de centro de datos: no requiere A100 ni H100 para una sola instancia; estas GPU solo tienen sentido para servir muchas replicas en paralelo o para indexar corpus muy grandes con lotes de gran tamano.
- Opciones de despliegue: esta variante concreta usa mlx-embeddings (Apple Silicon). El modelo base codefuse-ai/F2LLM-v2-0.6B se puede servir con sentence-transformers, transformers y text-embeddings-inference, y su model card declara compatibilidad con endpoints. No hay pesos GGUF publicados en la informacion disponible, por lo que no se puede desplegar directamente con llama.cpp u Ollama.
- Latencia y throughput: unicos datos disponibles, medidos en Apple M5 Max: ~8 ms por lote con tamano de lote 1 y ~500 ms por lote con tamano de lote 8 incluyendo un documento de 2001 tokens. No se dispone de cifras de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: la busqueda web no devolvio resultados relacionados con el modelo y la model card no incluye una tabla de comparacion. Categorias de alternativas que ocupan el mismo nicho (embeddings multilingues de 0,5B a 1B parametros) serian, entre otras, Qwen3-Embedding-0.6B (misma linea arquitectonica), BGE-M3 y multilingual-e5-large, pero no se aportan cifras de parametros, contexto, rendimiento ni licencia para ellas en esta informacion, por lo que no es posible construir una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en MLX | Datos comparativos |
|---|---|---|---|---|---|
| F2LLM-v2-0.6B-bf16-mlx (este) | 596.049.920 | 4096 en los ejemplos de uso | Apache-2.0 | Si, nativa via mlx-embeddings | Model card y verificacion de fidelidad |
| codefuse-ai/F2LLM-v2-0.6B (origen) | No disponible | No disponible | Apache-2.0 | No | No disponible |
| Otros modelos de embeddings multilingues de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Se trata de una conversion de pesos, no de un modelo entrenado por el autor del repositorio. Cualquier sesgo del modelo base se hereda sin cambios.
- No se han publicado evaluaciones de sesgo, toxicidad ni equidad en la informacion disponible.
- Riesgo de alucinacion no aplicable en sentido generativo (el modelo no produce texto), pero si existe riesgo de recuperaciones semanticamente plausibles y factualmente irrelevantes cuando se usa en RAG.
- Limitacion de contexto: los ejemplos usan `max_length=4096`, pero la model card no declara un limite maximo explicito. Con `truncation=True` se conserva la cabeza de la secuencia y se anade EOS, de modo que el contenido final de documentos muy largos puede perderse.
- Cobertura idiomatica desigual: aunque se declaran alrededor de 90 idiomas, la model card solo incluye verificaciones practicas en ingles, chino y ruso; no hay evidencia publicada de calidad por idioma, incluido el castellano.
- Problema conocido de batching: cuando un lote mezcla longitudes muy dispares, la fila corta puede diferir ligeramente (~0,005 max abs en la prueba documentada) respecto a una ejecucion con longitudes homogeneas. Es un comportamiento del enmascarado fast-SDPA de mlx-embeddings para Qwen3. Para maxima fidelidad conviene agrupar entradas de longitud similar o codificar por separado las longitudes muy distintas.
- Solo hay pesos bf16. No existen variantes cuantizadas ni GGUF en la informacion disponible, lo que limita el despliegue fuera de MLX o de frameworks que acepten safetensors en bf16.
- Licencia Apache-2.0, que permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base y de los datos declarados en el dataset codefuse-ai/F2LLM-v2 antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 me gusta en el momento de la consulta, creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento continuado de esta conversion.
- La fecha del articulo asociado (2026) y la del propio repositorio son coherentes entre si, pero no se dispone de resultados de terceros que validen de forma independiente las cifras de fidelidad reportadas por el autor.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/fcmeyer/F2LLM-v2-0.6B-bf16-mlx
- Modelo base: https://huggingface.co/codefuse-ai/F2LLM-v2-0.6B
- Dataset declarado: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Libreria mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- Articulo: https://arxiv.org/abs/2603.19223 (F2LLM-v2: Inclusive, Performant, and Efficient Embeddings for a Multilingual World; Ziyin Zhang, Zihan Liao, Hang Yu, Peng Di, Rui Wang; 2026)
