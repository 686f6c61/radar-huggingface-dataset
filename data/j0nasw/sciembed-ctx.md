# J0nasW/sciembed-ctx

## Resumen

SciEmbed-CTX es un modelo de embeddings de documentos científicos desarrollado por J0nasW (Jonas W.) como parte de la familia SciEmbed, presentada en Findings of EMNLP 2026. Se basa en ModernBERT-base, un transformer encoder de 149 millones de parámetros, y se entrena con oraciones de contexto de citas como señal contrastiva principal. El modelo está diseñado para representar fragmentos de texto científico en vectores densos de 768 dimensiones, con soporte de truncamiento Matryoshka a 512, 256 o 128 dimensiones, lo que permite ajustar el equilibrio entre precisión y eficiencia según la aplicación.

La relevancia actual de este modelo radica en su especialización en el dominio científico: a diferencia de los embeddings genéricos, SciEmbed-CTX aprovecha el contexto de citas (el texto que rodea una referencia bibliográfica) para aprender representaciones que capturan relaciones semánticas entre trabajos académicos. Con una ventana de contexto de 512 tokens y una licencia MIT, ofrece una opción ligera y abierta para tareas de recuperación, clasificación y agrupación de literatura científica. El modelo se distribuye en formato safetensors y es compatible con la librería sentence-transformers y con text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto; cuantizacion externa posible) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-base, un transformer encoder de 149 millones de parametros con atencion bidireccional, disenado para tareas de representacion de texto. No se trata de una arquitectura MoE ni hibrida; es un encoder denso clasico. La innovacion principal de SciEmbed-CTX reside en la estrategia de entrenamiento: se utiliza un subconjunto de 7 millones de pares de oraciones extraidos de contextos de citas en articulos cientificos, y se entrena durante 3 epocas con una funcion de perdida contrastiva. El contexto de citas (el texto que rodea una referencia) actua como señal de supervision debil, de modo que el modelo aprende a situar representaciones cercanas para textos que comparten una misma referencia bibliografica.

El entrenamiento se realizo sobre el modelo base ModernBERT-base, y la version publicada corresponde a la mejor ablacion (señal A+B) sobre ese submuestreo. El articulo completo describe como esta receta se escala al pool completo de datos para obtener el modelo final de la familia SciEmbed. El pooling utilizado es la media de los tokens de salida, y la dimension de salida es 768, truncable mediante Matryoshka a 512, 256 o 128 dimensiones sin reentrenamiento adicional.

## Capacidades

- Generacion de embeddings de oraciones y parrafos cientificos, con normalizacion opcional (cosine similarity).
- Similitud semantica entre fragmentos de documentos academicos, orientada a tareas de recuperacion y agrupacion.
- Soporte de truncamiento Matryoshka: permite reducir la dimension del embedding a 512, 256 o 128 manteniendo una calidad razonable, util para reducir costes de almacenamiento y computo.
- Compatible con sentence-transformers, lo que facilita su integracion en pipelines de busqueda semantica, clustering y clasificacion.
- No incluye capacidades de generacion de texto, tool calling, agentes ni multimodalidad; es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda semantica en repositorios de articulos cientificos: indexar abstracts o secciones de papers con SciEmbed-CTX y consultar con frases en lenguaje natural para recuperar documentos relevantes, aprovechando la ventana de 512 tokens para capturar contexto suficiente.
- Agrupacion de literatura por temas: generar embeddings de titulos y abstracts y aplicar algoritmos de clustering (k-means, HDBSCAN) para identificar topicos emergentes en un corpus de publicaciones.
- Recomendacion de citas: dado un fragmento de texto que menciona una referencia, el modelo puede encontrar otros pasajes que citan la misma obra, facilitando la construccion de grafos de citacion.
- Clasificacion de documentos por disciplina o subarea: entrenar un clasificador ligero sobre los embeddings de 768 dimensiones (o truncados) para categorizar papers en taxonomias academicas.
- Deduplicacion de registros bibliograficos: comparar embeddings de titulos y resumenes para detectar duplicados en bases de datos de literatura, gracias a la sensibilidad a similitudes semanticas.
- Analisis de tendencias de investigacion: proyectar embeddings de documentos en un espacio de baja dimension (UMAP, t-SNE) para visualizar la evolucion de campos cientificos a lo largo del tiempo.

## Benchmarks y rendimiento

El autor reporta resultados en SciRepEval, una evaluacion de embeddings cientificos con cuatro categorias. La tabla siguiente muestra los valores publicados en la model card:

| Categoria | Puntuacion |
|---|---|
| Clasificacion | 75.5 |
| Regresion | 28.3 |
| Proximidad | 80.9 |
| Busqueda | 82.5 |
| Media macro (Overall) | 66.8 ± 0.02 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada. Los resultados corresponden a la version de 768 dimensiones sin truncamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 millones de parametros en fp32, el peso del modelo ocupa aproximadamente 596 MB. En la practica, con el overhead de activaciones y el batch, se recomienda al menos 1 GB de VRAM para inferencia comoda en GPU.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090) es suficiente. Tambien puede ejecutarse en CPU sin problemas para cargas moderadas.
- Compatible con consumer GPU: si, cabe en cualquier GPU moderna, incluso en integradas si se usa cuantizacion de 8 bits.
- Opciones de despliegue: sentence-transformers para prototipado, text-embeddings-inference (TEI) para servidores de embeddings de alto rendimiento, y compatible con endpoints de Hugging Face. Tambien se puede exportar a ONNX o utilizar con llama.cpp si se convierte a GGUF, aunque no se proporciona un archivo GGUF oficial.
- Latencia y throughput: no se han publicado mediciones especificas. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por lote en GPU moderna y un throughput de cientos de peticiones por segundo con TEI en hardware adecuado.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia cualitativa, SciEmbed-CTX se situa en la categoria de embeddings cientificos de tamano medio (149M), similar a modelos como SPECTER (110M) o SciNCL (110M), pero con una ventana de contexto mayor (512 tokens frente a 512 en SPECTER, aunque SPECTER usa 512 tambien). La licencia MIT es mas permisiva que la de algunos competidores. Sin embargo, al no existir benchmarks comparativos en la documentacion disponible, no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no soporta otros idiomas, por lo que su uso con textos cientificos en castellano, frances o aleman producira embeddings de baja calidad.
- Ventana de contexto limitada a 512 tokens: no es adecuado para representar documentos completos de varias paginas; se recomienda dividir el texto en fragmentos.
- Dominio cientifico especifico: el entrenamiento con contextos de citas puede introducir sesgos hacia estilos de redaccion academicos y areas con mayor densidad de citas (por ejemplo, biomedicina o informatica), con menor rendimiento en campos menos citados.
- Riesgo de alucinacion no aplica directamente, al ser un modelo de embeddings y no generativo, pero la calidad de las representaciones depende de la cobertura del corpus de entrenamiento.
- La version publicada es una ablacion sobre un submuestreo de 7M pares, no el modelo completo de la familia SciEmbed; para produccion puede ser preferible esperar la version completa si se busca el maximo rendimiento.
- No se proporcionan pesos cuantizados oficiales; la cuantizacion externa puede degradar ligeramente la calidad de los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/J0nasW/sciembed-ctx
- Version anonima del modelo (posiblemente para revision): https://huggingface.co/anon-nlp/sciembed-ctx
- Repositorio de GitHub del autor: https://github.com/J0nasW?tab=repositories
- Articulo de referencia: *SciEmbed: Citation-Context Supervision for Scientific Document Embeddings*, Findings of EMNLP 2026 (enlace no disponible en la informacion proporcionada).
