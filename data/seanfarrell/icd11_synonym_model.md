# seanfarrell/icd11_synonym_model

## Resumen

El modelo `seanfarrell/icd11_synonym_model` es un modelo de embeddings de frases (sentence transformer) afinado a partir de `sentence-transformers/all-mpnet-base-v2`. Su funcion es proyectar terminos y frases del ambito de la clasificacion internacional de enfermedades ICD-11 a un espacio vectorial denso de 768 dimensiones, de modo que terminos sinonimos o equivalentes queden proximos entre si segun similitud coseno. Lo desarrolla el usuario de HuggingFace `seanfarrell` y esta pensado especificamente para tareas de normalizacion y emparejamiento de terminologia medica.

El modelo resuelve un problema concreto: alinear variantes lexicas de diagnosticos, procedimientos y entidades clinicas con las denominaciones canonicas de ICD-11. Para ello se entreno sobre 852.480 pares ancla-positivo (columnas `anchor` y `positive`) con la funcion de perdida `MultipleNegativesRankingLoss`, un esquema habitual en recuperacion densa de pasajes. Es un modelo compacto: 109.486.464 parametros totales, un repositorio de 0,4 GB y una salida de 768 dimensiones.

Su relevancia es de nicho: no es un modelo de proposito general, sino una herramienta especializada para pipelines de codificacion clinica, deduplicacion de conceptos y busqueda semantica sobre catalogos ICD-11. La ventana de entrada es muy corta (32 tokens), coherente con el tipo de entradas para las que fue entrenado (terminos y frases breves). Tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un modelo recien publicado y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence Transformer sobre MPNetModel (encoder tipo transformer) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 tokens (maximum sequence length) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

Datos adicionales de configuracion: dimension de salida 768, funcion de similitud coseno, pooling de tipo media (mean pooling), normalizacion posterior de los embeddings, modalidad soportada texto.

## Arquitectura y entrenamiento

La arquitectura es una `SentenceTransformer` compuesta por tres modulos: (0) un transformer `MPNetModel` configurado para `feature-extraction` que devuelve el `last_hidden_state`; (1) un `Pooling` con `pooling_mode: mean`, `embedding_dimension: 768` e `include_prompt: True`; y (2) un modulo `Normalize` que normaliza los vectores finales. El resultado es un embedding denso de 768 dimensiones por frase, adecuado para similitud coseno, busqueda semantica, mineria de parafrasis, clasificacion y clustering.

El afinado parte de `sentence-transformers/all-mpnet-base-v2` (revision `e8c3b32edf5434bc2275fc9bab85f82640a19130`). El conjunto de entrenamiento es anonimo y consta de 852.480 muestras con dos columnas, `anchor` y `positive`. Segun las estadisticas aproximadas de las primeras 100 muestras, las anclas tienen entre 5 y 29 tokens (media 12,02) y los positivos entre 4 y 29 tokens (media 12,19), lo que confirma que son frases muy cortas de terminologia clinica. La perdida empleada es `MultipleNegativesRankingLoss`, la funcion estandar de Sentence Transformers para entrenar recuperacion densa con negativos en lote. No se documenta el uso de RLHF ni DPO, ni innovaciones de decodificacion especulativa o atencion lineal (no aplican a un modelo encoder puro de embeddings).

## Capacidades

- Generacion de embeddings de frases: convierte texto en vectores densos de 768 dimensiones normalizados.
- Similitud textual semantica: calcula puntuaciones de similitud coseno entre frases y terminos.
- Busqueda semantica: recupera entidades ICD-11 a partir de consultas en lenguaje natural breve.
- Mineria de parafrasis y alineamiento de sinonimos: identifica equivalencias entre denominaciones clinicas.
- Clustering y clasificacion: agrupa conceptos medicos por cercania en el espacio de embeddings.
- Extraccion de caracteristicas (`feature-extraction`) para uso como encoder en pipelines posteriores.
- Compatibilidad con `text-embeddings-inference` y despliegue en endpoints (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio: es un modelo encoder de embeddings, no un modelo generativo.
- Capacidades multilingues: no disponibles (la model card no declara idiomas).

## Casos de uso

- Normalizacion de diagnosticos en historia clinica electronica: dado un texto libre introducido por un facultativo (por ejemplo "ectopia anal"), el modelo genera su embedding y se busca por similitud coseno la entidad canonica ICD-11 correspondiente ("Ectopic anus").
- Codificacion automatica de terminos ICD-11: en un pipeline de facturacion o registro sanitario, el modelo propone el codigo y la denominacion mas proxima a partir de la descripcion textual, reduciendo el trabajo manual de codificadores.
- Deduplicacion de conceptos en catalogos maestros: al agrupar por similitud los embeddings de miles de entradas de un catalogo, se detectan registros duplicados o cuasi sinonimos que deberian unificarse.
- Busqueda semantica sobre terminologia medica: construir un indice vectorial de todas las entidades ICD-11 para que un buscador interno devuelva resultados relevantes aunque la consulta no coincida literalmente con la denominacion oficial.
- Mapeo entre vocabularios clinicos: alinear terminos de otros sistemas (por ejemplo, descripciones de problemas en notas clinicas) con las entidades de ICD-11 para interoperabilidad entre sistemas.
- Analisis de literatura y ensayos clinicos: clasificar y agrupar abstracts o criterios de inclusion por enfermedad, agrupando fragmentos que describen la misma patologia aunque usen sinonimos.
- Limpieza de datos en investigacion epidemiologica: unificar variantes de nombres de enfermedades en grandes conjuntos de datos antes de agregarlos estadisticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en precision fp32 (109,5 M de parametros x 4 bytes) y unos 0,22 GB en fp16. La memoria real depende del tamano de lote y de la longitud de secuencia (maximo 32 tokens, muy corta), por lo que el consumo adicional de activaciones es minimo.
- GPU recomendadas: cabe en cualquier GPU moderna, incluidas tarjetas de gama baja. Funciona con soltura en RTX 4090, RTX 3090, RTX 3060, T4, A10, L4, A100 y H100; estas ultimas sobredimensionadas para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 1 GB de VRAM, e incluso puede ejecutarse en CPU con latencias aceptables dado el reducido tamano y la ventana de 32 tokens.
- Opciones de despliegue: `sentence-transformers` (uso directo), `text-embeddings-inference` (etiqueta oficial del repo), exportacion a ONNX/Optimum, y servidores de embeddings dedicados. No se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seanfarrell/icd11_synonym_model | 109,5 M | 768 | 32 tokens | No disponible | HuggingFace (0 descargas) |
| sentence-transformers/all-mpnet-base-v2 | 109,5 M (mismo backbone) | 768 | 384 tokens (modelo base) | Apache-2.0 (segun el modelo base) | HuggingFace (ampliamente usado) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M (aproximado, no confirmado en la informacion) | 384 | 256 tokens (no confirmado en la informacion) | Apache-2.0 (segun el modelo base) | HuggingFace (ampliamente usado) |

Nota: los datos de los modelos alternativos corresponden a caracteristicas ampliamente conocidas de esas publicaciones, no a la informacion proporcionada para este modelo. La diferencia clave de `icd11_synonym_model` frente al modelo base es el afinado especifico sobre 852.480 pares de terminologia ICD-11 y su ventana reducida a 32 tokens, optimizada para terminos cortos.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (32 tokens): no es apta para parrafos largos, documentos completos ni conversaciones multi-turno. Solo maneja frases o terminos breves.
- Licencia no declarada: no se especifica la licencia, por lo que el uso comercial queda en un estado juridicamente indeterminado y conviene aclararlo con el autor antes de desplegarlo en produccion.
- Idiomas no declarados: la model card no indica idiomas soportados; el dominio aparente es terminologia clinica (presumiblemente en ingles segun los ejemplos), pero no esta garantizado.
- Riesgo de alucinacion controlado: al ser un modelo de embeddings y no generativo, no produce texto, pero si puede devolver vecinos semanticamente incorrectos si los terminos son ambiguos o muy similares entre si.
- Sesgos: no documentados. Al entrenarse sobre datos de ICD-11, heredara las limitaciones y sesgos de dicha taxonomia y de la distribucion del corpus de entrenamiento.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes, publicado sin benchmarks ni evaluacion publica; no hay evidencia de su calidad en tareas reales mas alla de los ejemplos de la model card.
- No se documentan cuantizaciones ni variantes GGUF, lo que puede complicar su uso en entornos con recursos muy limitados o herramientas que dependen de formatos cuantizados.
- Riesgo de uso indebido en contexto clinico: no debe usarse como unico criterio de codificacion o diagnostico sin supervision humana, dado que un emparejamiento erroneo puede propagarse a registros medicos.

## Enlaces

- HuggingFace: https://huggingface.co/seanfarrell/icd11_synonym_model
- Modelo base: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos con la libreria sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Paper de referencia citado en los tags (Sentence-BERT): https://arxiv.org/abs/1908.10084
- Paper de referencia citado en los tags (DPR, negativos en lote): https://arxiv.org/abs/1807.03748
