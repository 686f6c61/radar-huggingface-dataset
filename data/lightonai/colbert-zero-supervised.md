# lightonai/ColBERT-Zero-supervised

## Resumen

ColBERT-Zero-supervised es un modelo de embeddings multi-vector desarrollado por LightOn AI, basado en la arquitectura ColBERT (late interaction) sobre ModernBERT. Se trata del primer modelo ColBERT pre-entrenado a gran escala utilizando exclusivamente datos públicos, y alcanza un 55,43 nDCG@10 en el benchmark BEIR, superando a alternativas como GTE-ModernColBERT y GTE-ModernBERT, que fueron entrenadas con datos propietarios y más fuertes. Con 149 millones de parámetros, establece un nuevo estado del arte en BEIR para modelos de menos de 150M de parámetros.

El modelo está diseñado para tareas de recuperación de información (retrieval) y similitud semántica. Su enfoque late interaction descompone consultas y documentos en vectores por token, lo que mejora la generalización fuera del dominio de entrenamiento. Se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones, y está disponible en formato safetensors para su uso con librerías como PyLate, sentence-transformers o Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColBERT (late interaction) sobre ModernBERT, multi-vector |
| Parametros totales | 149.015.808 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColBERT-Zero-supervised utiliza la arquitectura ColBERT, que genera una representacion multi-vector para cada texto: cada token produce un vector independiente, y la similitud entre consulta y documento se calcula mediante MaxSim (maximo de similitud coseno entre tokens). Esta tecnica de late interaction ofrece mejores resultados en entornos fuera de distribucion que los embeddings densos de un solo vector. El modelo base es ModernBERT, un transformer optimizado para eficiencia y contexto largo, aunque la longitud de contexto concreta de esta variante no se especifica en la documentacion disponible.

El entrenamiento se realizo con una funcion de perdida contrastiva (tag `loss:Contrastive`), sobre un dataset de aproximadamente 1,7 millones de ejemplos (segun el tag `dataset_size:1695819`). A diferencia de la variante `unsupervised`, esta version supervisada incorpora etiquetas de relevancia. Los datos provienen de fuentes publicas, sin uso de datos propietarios o cerrados. No se detallan el numero total de tokens de entrenamiento ni las fases de pre-entrenamiento o ajuste fino.

## Capacidades

- Recuperacion de informacion (retrieval) con representaciones multi-vector de alta granularidad.
- Similitud semantica entre oraciones, parrafos y documentos.
- Generacion de embeddings densos para indexacion y busqueda vectorial.
- Compatible con el protocolo Late Interaction de ColBERT, lo que permite su integracion en pipelines de RAG (Retrieval Augmented Generation).
- Soporte nativo para la libreria PyLate y sentence-transformers.
- Optimizado para generalizacion fuera del dominio de entrenamiento, como demuestran sus resultados en BEIR.
- No incluye capacidades de generacion de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en bases de conocimiento: el modelo puede indexar documentos y responder a consultas en lenguaje natural, devolviendo los pasajes mas relevantes mediante MaxSim. Adecuado para motores de busqueda internos o asistentes de documentacion.
- Sistemas RAG (Retrieval Augmented Generation): como componente de recuperacion, alimenta a un LLM generativo con contextos precisos, mejorando la calidad de respuestas en dominios especializados.
- Deduplicacion de documentos: al generar embeddings por token, permite detectar parafraseos o variaciones de un mismo contenido con mayor robustez que los embeddings de un solo vector.
- Recomendacion de contenidos: comparacion de articulos, noticias o productos basada en similitud semantica, con buena tolerancia a diferencias de vocabulario.
- Busqueda en codigo fuente: aunque el modelo esta entrenado principalmente con texto en ingles, puede indexar comentarios y documentacion de codigo para facilitar su busqueda.
- Moderacion y clasificacion de textos: mediante la similitud con categorias predefinidas, permite clasificar documentos o comentarios en temas concretos.
- Verificacion de hechos (fact-checking): al recuperar pasajes relevantes de una coleccion de referencias, apoya la validacion de afirmaciones, como se refleja en los benchmarks sobre datasets FEVER.

## Benchmarks y rendimiento

Los resultados oficiales del model-index (declarados por el autor) sobre datasets de la serie Nano y el resultado agregado en BEIR (segun la pagina del modelo) se muestran a continuacion.

| Dataset | Accuracy@1 | nDCG@10 | MRR@10 | MAP@100 |
|---|---|---|---|---|
| NanoClimateFEVER | 0,40 | 0,4515 | 0,5562 | 0,3643 |
| NanoDBPedia | 0,86 | 0,6936 | 0,8996 | 0,5441 |
| NanoFEVER | 0,88 | 0,9221 | 0,9283 | 0,8936 |
| NanoFiQA2018 | 0,50 | - | - | - |

Nota: los valores de nDCG@10, MRR@10 y MAP@100 para NanoFiQA2018 no estan completos en la informacion proporcionada.

Ademas, segun la descripcion publica del modelo, ColBERT-Zero-supervised alcanza un **55,43 nDCG@10 en el benchmark BEIR**, superando a GTE-ModernColBERT y GTE-ModernBERT. Este dato no esta verificado de forma independiente en la informacion disponible, pero se cita de la pagina oficial del modelo.

## Requisitos de hardware

- El modelo tiene 149M de parametros. En precision FP16, su peso en memoria es de aproximadamente 300 MB, por lo que cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: NVIDIA GTX 1060 6GB o superior, RTX 3060, RTX 4090, o GPUs de datacenter como A100 o H100 para despliegues de alta concurrencia.
- Es viable su ejecucion en CPU para inferencia por lotes, aunque con mayor latencia.
- Despliegue recomendado con librerias compatibles: PyLate, sentence-transformers, y Text Embeddings Inference (TEI) de Hugging Face para servir endpoints de embeddings.
- Para produccion con alto volumen de consultas, se puede utilizar TEI con batching y cuantizacion, aunque no se especifican cuantizaciones oficiales.
- La latencia depende del hardware y del tamaño del lote; no se dispone de cifras oficiales.

## Comparativa con modelos similares

Segun la descripcion publica, ColBERT-Zero-supervised supera a GTE-ModernColBERT y GTE-ModernBERT en BEIR (55,43 nDCG@10 frente a valores no especificados). No se dispone en la informacion proporcionada de los parametros exactos de estos modelos competidores. Ambos comparten la base ModernBERT, pero se entrenaron con datos cerrados o mas fuertes. La principal ventaja de ColBERT-Zero es su entrenamiento exclusivamente con datos publicos, lo que facilita su reproducibilidad y uso comercial.

| Modelo | Parametros | Contexto | BEIR nDCG@10 | Licencia |
|---|---|---|---|---|
| ColBERT-Zero-supervised | 149M | No disponible | 55,43 | Apache 2.0 |
| GTE-ModernColBERT | No disponible | No disponible | Inferior a 55,43 (segun la web) | No disponible |
| GTE-ModernBERT | No disponible | No disponible | Inferior a 55,43 (segun la web) | No disponible |

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; su rendimiento en otros idiomas no esta garantizado y probablemente sea bajo.
- No genera texto; solo produce embeddings. No debe emplearse para tareas de generacion o razonamiento.
- Los datos de entrenamiento provienen de fuentes publicas, por lo que pueden contener sesgos presentes en esos corpus (por ejemplo, sesgos de genero, raza o ideologicos).
- La longitud de contexto no esta documentada; si se excede, el modelo puede truncar o degradar su rendimiento.
- Los resultados de BEIR (55,43 nDCG@10) provienen de la pagina del modelo y no estan verificados de forma independiente en la informacion proporcionada.
- No se especifican cuantizaciones oficiales, por lo que la reduccion de precision para despliegue debe validarse empiricamente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo puede estar sujeto a patentes o restricciones de los modelos base (ModernBERT), aunque estos tambien son de codigo abierto.

## Enlaces

- [Hugging Face - lightonai/ColBERT-Zero-supervised](https://huggingface.co/lightonai/ColBERT-Zero-supervised)
- [Hugging Face - variante sin prompts](https://huggingface.co/lightonai/ColBERT-Zero-supervised-noprompts)
- [MTEB Leaderboard - ColBERT-Zero-supervised](https://leaderboard.mteb.org/models/lightonai/ColBERT-Zero-supervised)
- [Arxiv 2602.16609 - paper de ColBERT-Zero (referencia)](https://arxiv.org/abs/2602.16609)
- [Arxiv 2402.01613 - ModernBERT (referencia)](https://arxiv.org/abs/2402.01613)
- [Arxiv 1908.10084 - ColBERT original (referencia)](https://arxiv.org/abs/1908.10084)
