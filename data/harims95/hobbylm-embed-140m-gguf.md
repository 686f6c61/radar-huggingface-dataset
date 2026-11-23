# harims95/hobbylm-embed-140m-gguf

## Resumen

hobbylm-embed-140m-gguf es la distribucion en formato GGUF del modelo de embeddings de texto `harims95/hobbylm-embed-140m`, desarrollado por Hariharan M. S. y Prabhurajhan R. Se trata de un modelo denso de extraccion de caracteristicas (feature-extraction) orientado a similitud semantica y recuperacion de informacion, construido sobre una arquitectura de mezcla de expertos dispersa (sparse MoE) con 140M parametros totales y 36M activos. Genera embeddings de 512 dimensiones normalizados en L2, lo que lo hace directamente utilizable con similitud coseno o producto escalar.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de embeddings MoE en llama.cpp sin necesidad de GPU dedicada ni de dependencias pesadas, mediante un unico fichero GGUF y un script auxiliar en Python de libreria estandar. El autor documenta con detalle el procedimiento correcto de pooling (excluir el token de fin de texto que el tokenizer anade), un punto que rompe la compatibilidad con el pooling medio nativo de llama.cpp y con LM Studio.

El modelo esta pensado exclusivamente para ingles (`language: en`), con licencia Apache-2.0 sobre los pesos y MIT sobre el script auxiliar. La ventana de contexto en GGUF esta limitada a 1.024 tokens, aunque la version original en Sentence Transformers admite hasta 2.048 tokens configurando `max_seq_length`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con mezcla de expertos dispersa (sparse MoE) |
| Parametros totales | 166.279.520 (166M; el autor indica 140M en la model card) |
| Parametros activos | 36M |
| Longitud de contexto | 1.024 tokens en GGUF; 2.048 tokens en Sentence Transformers con `max_seq_length = 2048` |
| Tipos de cuantizacion | F16 (335 MB) y Q8_0 (179 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (pesos); MIT (script auxiliar) |
| Formato de pesos | GGUF (compatible con llama.cpp, grafo `bailingmoe2`); modelo base en safetensors |
| Dimension del embedding | 512 dimensiones, normalizado en L2 |
| Pooling | Media de vectores de token excluyendo el token de fin de texto; requiere `--pooling none` y pooling en cliente |
| Pipeline | feature-extraction / sentence-similarity |
| Version del modelo base | revision `ff263c85` |

## Arquitectura y entrenamiento

La model card describe el modelo como un modelo denso de embeddings de texto construido sobre una arquitectura de mezcla de expertos dispersa, con 140M parametros totales y 36M activos segun el autor, y una salida de 512 dimensiones. El recuento real de parametros en safetensors asciende a 166.279.520, cifra que conviene tener en cuenta frente al dato de la model card. El grafo de ejecucion en llama.cpp es `bailingmoe2`, probado con la release `v1.0.0`, con atencion no causal fijada en el fichero GGUF.

El modelo se distribuye con dos modos de prompt predefinidos (`query: ` y `passage: `) para tareas de recuperacion, ademas de un modo sin prompt (`none`) para similitud, clasificacion y clustering. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El autor documenta una innovacion practica relevante: el pooling excluye el token de fin de texto que el tokenizer anade, de modo que el uso de `--pooling mean` de llama.cpp o el pooling de LM Studio produce vectores distintos a los de referencia.

La fidelidad respecto al modelo PyTorch (Sentence Transformers, misma revision) se ha medido sobre 100 textos en tres variantes de prompt (300 entradas en total): coseno medio 0,999974 y minimo 0,998881 para F16; coseno medio 0,999435 y minimo 0,995988 para Q8_0.

## Capacidades

- Generacion de embeddings de texto de 512 dimensiones, normalizados en L2, para similitud coseno o producto escalar.
- Recuperacion de informacion (retrieval) con prompts diferenciados para consultas (`query: `) y documentos (`passage: `).
- Similitud semantica entre frases y parrafos.
- Clasificacion de texto por similitud con prototipos o etiquetas embebidas.
- Clustering de documentos en espacio vectorial.
- Ejecucion local en CPU mediante llama.cpp, sin dependencias de GPU.
- Compatibilidad con Ollama mediante `ollama pull hariharanms95/hobbylm-embed-140m` (Q8_0, `num_ctx 512`), con la advertencia de que sus vectores no son identicos a los de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo exclusivamente de embeddings.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los fragmentos con `--mode passage` y las consultas de usuario con `--mode query`, y recuperar por similitud coseno sobre los vectores de 512 dimensiones. El modelo cabe en CPU y permite desplegar el indice sin infraestructura GPU.
- Deduplicacion de registros y catalogos: embeber titulos o descripciones con `--mode none` y agrupar por umbral de coseno para detectar duplicados o near-duplicates en bases de datos de producto.
- Clasificacion de tickets de soporte: calcular el embedding de cada ticket y compararlo con centroides de categorias previamente calculados; el coste por inferencia es bajo (36M parametros activos) y el modelo se ejecuta en llama.cpp.
- Clustering de feedback de usuarios: agrupar resenas o comentarios por similitud vectorial para descubrir temas recurrentes sin etiquetado previo.
- Filtrado de contenido y moderacion por similitud: comparar embeddings de mensajes contra un conjunto de referencia de contenido no deseado y aplicar umbrales de coseno.
- Recuperacion aumentada (RAG) en entornos con recursos limitados: usar el modelo como embedder en pipelines RAG que corren en portatiles o contenedores sin GPU, con la salvedad de limitar los fragmentos a 1.024 tokens en GGUF o hasta 2.048 en Sentence Transformers.
- Sistemas de recomendacion basados en contenido: embeber descripciones de articulos y calcular vecinos mas cercanos para sugerencias item-to-item.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo publicado es la concordancia con el modelo PyTorch de referencia:

| Fichero | Coseno medio | Coseno minimo |
|---|---|---|
| F16 | 0,999974 | 0,998881 |
| Q8_0 | 0,999435 | 0,995988 |

Medido sobre 100 textos, cada uno sin prompt y con `query: ` / `passage: ` (300 entradas). En Ollama, el coseno respecto al modelo de referencia es de aproximadamente 0,99 en frases normales, con desviaciones mayores en textos muy cortos (0,92-0,97).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantizacion; el fichero Q8_0 ocupa 179 MB y el F16 335 MB, por lo que la inferencia cabe en RAM de sistema.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede alojarlo con holgura, pero no es necesario.
- Cabe en cualquier GPU consumer y en practicamente cualquier equipo de sobremesa o portatil actual.
- Opciones de despliegue: llama.cpp (`llama-embedding` con `--pooling none` y pooling en cliente mediante `hobbylm_llamacpp_embed.py`), Ollama (`hariharanms95/hobbylm-embed-140m`, Q8_0, `num_ctx 512`) y Sentence Transformers para el modelo base en PyTorch.
- No soportado: LM Studio y `--pooling mean` nativo de llama.cpp, porque su pooling incluye el token de fin de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formato |
|---|---|---|---|---|---|
| hobbylm-embed-140m-gguf | 166M totales / 36M activos (MoE) | 1.024 (GGUF) / 2.048 (ST) | 512 | Apache-2.0 | GGUF, safetensors |
| all-MiniLM-L6-v2 | 22M | 256 | 384 | Apache-2.0 | safetensors, GGUF |
| bge-small-en-v1.5 | 33M | 512 | 384 | MIT | safetensors, GGUF |
| e5-small-v2 | 33M | 512 | 384 | MIT | safetensors |

La comparativa se limita a datos de parametros, contexto, dimension y licencia; no se dispone de resultados de benchmarks de hobbylm-embed-140m que permitan comparar calidad de recuperacion frente a estas alternativas. La diferencia principal es la arquitectura MoE y la dimension de embedding de 512, frente a los 384 habituales en los modelos pequenos citados.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- El contexto en GGUF esta limitado a 1.024 tokens y llama.cpp no trunca automaticamente: los textos mas largos deben acortarse manualmente.
- El pooling debe excluir el token de fin de texto; usar el pooling medio nativo de llama.cpp, LM Studio u Ollama produce vectores distintos a los de referencia. No deben mezclarse vectores de Ollama con vectores exactos en un mismo indice.
- La model card indica 140M parametros, pero el recuento real en safetensors es de 166.279.520; conviene verificar el dato antes de dimensionar infraestructura.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero la calidad de recuperacion depende de la calidad del corpus y del prompt (`query: ` frente a `passage: `).
- No se han publicado evaluaciones estandar (MTEB u otras) que permitan estimar su calidad frente a alternativas consolidadas.
- El modelo tiene muy poca traccion: 14 descargas y 0 likes en el momento de la consulta, sin comunidad que reporte incidencias.
- Licencia Apache-2.0 permite uso comercial de los pesos; el script auxiliar es MIT. No se documentan restricciones adicionales.
- El autor advierte de que la primera descarga puede fallar y debe reintentarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harims95/hobbylm-embed-140m-gguf
- Modelo base: https://huggingface.co/harims95/hobbylm-embed-140m
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Guia de ejecucion local del autor: `RUN-LOCALLY.md` (incluido en el repositorio del modelo)
- Script auxiliar: `hobbylm_llamacpp_embed.py` (incluido en el repositorio del modelo)
- Ollama: `ollama pull hariharanms95/hobbylm-embed-140m`
