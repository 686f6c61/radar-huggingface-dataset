# justis-xu/bge-m3-v1.5-onnx-fp32

## Resumen

Este repositorio es una exportacion a ONNX en precision FP32 del modelo de embeddings BAAI bge-m3, publicada por el usuario justis-xu bajo el identificador `justis-xu/bge-m3-v1.5-onnx-fp32`. No se trata de un modelo entrenado desde cero: el propio autor indica que el grafo y los pesos proceden del `onnx/model.onnx` y `model.onnx_data` oficiales de BAAI, presentados en la forma de dos archivos (grafo + pesos externos) que impone el limite de 2 GB de protobuf y que ONNX Runtime soporta de forma nativa. El objetivo declarado es disponer de una variante FP32 utilizable en instancias con GPU, donde el backend CUDA de ONNX Runtime no cubre por completo los operadores int8 dinamicos.

El modelo produce embeddings densos de 1024 dimensiones con una ventana de truncamiento de 8192 tokens, segun la tabla incluida en la model card. Su principal aval tecnico es la equivalencia numerica con la referencia FP32 de sentence-transformers, con una similitud coseno de 1.000000, lo que lo convierte en un sustituto fiel para pipelines que ya trabajan en FP32 sobre GPU.

La relevancia practica del repositorio es de infraestructura mas que de investigacion: es un artefacto de despliegue. La ficha advierte de que la geometria de los vectores difiere entre instancias CPU y GPU (por diferencias de kernel, igual que ocurre entre variantes int8 y FP32), de modo que cambiar de instancia obliga a recargar por completo la coleccion vectorial. El repositorio no declara licencia, idiomas, pipeline ni resultados de benchmarks de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (tag `xlm-roberta` del repositorio), exportado a ONNX |
| Parametros totales | no disponible en el repositorio (el modelo base BAAI/bge-m3 emplea un backbone XLM-RoBERTa-large; la documentacion publica del modelo original lo situa en torno a 568 M de parametros, dato no confirmado en esta ficha) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens (valor de truncamiento declarado en la model card) |
| Dimension del embedding | 1024 |
| Tipos de cuantizacion | FP32 (este repositorio); el autor menciona una variante int8 destinada a CPU, no incluida aqui |
| Idiomas soportados | no disponible (el modelo original BAAI/bge-m3 es multilingue; la ficha de este repositorio no lo declara) |
| Licencia | no disponible en el repositorio |
| Formato de pesos | ONNX FP32: grafo `.onnx` (0,7 MB) mas pesos externos `model.onnx_data` (2,27 GB) |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento alguno: es una conversion de formato y precision del modelo BAAI bge-m3, no un modelo nuevo. La arquitectura subyacente es un encoder transformer de la familia XLM-RoBERTa, tal y como refleja el tag `xlm-roberta` del repositorio, con salida de embeddings densos de 1024 dimensiones y truncamiento a 8192 tokens. El autor no detalla si el grafo exportado incluye unicamente la cabeza densa o tambien las cabezas de recuperacion lexica (sparse) y multi-vector propias del modelo original; esa informacion no esta disponible.

La unica innovacion tecnica descrita es la del propio artefacto de despliegue: la particion del modelo en un grafo ligero y un fichero de pesos externos para sortear el limite de 2 GB de protobuf, forma que ONNX Runtime carga de manera nativa. La model card aporta una validacion de fidelidad numerica frente a la referencia FP32 de sentence-transformers con similitud coseno de 1.000000. No se mencionan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, ya que no aplican a una conversion.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para texto, con truncamiento a 8192 tokens de entrada.
- Recuperacion semantica y busqueda vectorial en colecciones indexadas (funcion principal del modelo base).
- Procesamiento de fragmentos largos: la ventana de 8192 tokens permite indexar documentos extensos sin troceado agresivo.
- Equivalencia numerica verificada con la referencia FP32 de sentence-transformers (coseno 1.000000), lo que facilita migraciones desde pipelines existentes.
- Ejecucion en GPU mediante ONNX Runtime con el execution provider CUDA, en instancias de al menos 4 GB de VRAM.
- No genera texto: no dispone de decodificador, por lo que no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte multimodal (vision o audio) ni modo de razonamiento explicito.
- El alcance multilingue no se declara en este repositorio; solo puede inferirse del modelo original, dato no confirmado aqui.
- No se especifica si el grafo exportado expone las salidas sparse y multi-vector (estilo ColBERT) del modelo bge-m3 original.

## Casos de uso

- Recuperacion aumentada (RAG) sobre documentacion tecnica: el modelo indexa fragmentos de hasta 8192 tokens y devuelve vectores de 1024 dimensiones que alimentan una base vectorial; su equivalencia con la referencia FP32 permite sustituir sentence-transformers sin recalibrar umbrales de similitud.
- Busqueda semantica en corpus multilingues: si se confirma el caracter multilingue del modelo base, sirve para consultas en un idioma sobre documentos en otro, siempre dentro de una misma instancia (CPU o GPU) para no romper la geometria de los vectores.
- Deduplicacion y near-duplicate detection: comparando embeddings por similitud coseno se detectan documentos redundantes en repositorios grandes; el truncamiento a 8192 tokens reduce la perdida de contexto en articulos completos.
- Clustering y exploracion tematica de corpus: los vectores densos permiten agrupar documentos por tematica con tecnicas estandar (k-means, HDBSCAN) antes de un etiquetado manual.
- Clasificacion zero-shot por similitud con prototipos: se construyen embeddings de descripciones de clase y se asigna cada documento a la clase mas proxima, sin entrenamiento adicional.
- Sistemas de recomendacion por contenido: se indexan catalogos de articulos o recursos y se recomiendan elementos proximos al historial del usuario en el espacio de embeddings.
- Evaluacion de similitud semantica (STS): el modelo sirve para calcular correlaciones con juicios humanos en conjuntos de pares de frases, con la ventaja de ser numericamente identico a la referencia FP32.
- Reindexado controlado en produccion: dado que CPU y GPU producen geometrias distintas, el modelo se emplea en tareas de reingesta completa de la coleccion tras cambiar de tipo de instancia, migracion que el autor exige hacer de forma integral.

## Benchmarks y rendimiento

La model card solo publica una validacion de fidelidad frente a la referencia FP32 de sentence-transformers. No se han publicado resultados de benchmarks de recuperacion (MTEB, MIRACL, BEIR u otros) en la informacion disponible.

| Metrica | Valor | Referencia de comparacion |
|---|---|---|
| Similitud coseno de los embeddings | 1.000000 | Referencia FP32 de sentence-transformers |
| Latencia en CPU | aproximadamente 3 a 4 veces la latencia de la variante int8 | Variante int8 de la misma familia, segun el autor |
| Latencia y throughput en GPU | no disponible | no disponible |

## Requisitos de hardware

- VRAM: el autor recomienda un minimo de 4 GB de memoria de GPU para la variante FP32.
- Peso en disco: 2,27 GB de pesos mas 0,7 MB de grafo, dentro de un repositorio de 2,3 GB.
- GPU compatibles: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, T4, L4, A10, RTX 3050 de 6 GB en adelante, RTX 4090, A100, H100). No se aportan cifras de rendimiento por modelo concreto.
- GPU de consumo: si, cabe en tarjetas con 4 GB o mas de VRAM; en modelos de 4 GB exactos el margen es minimo y depende del tamano de lote.
- CPU: es posible ejecutarlo, pero el autor advierte de que los 2,27 GB de pesos lo hacen entre 3 y 4 veces mas lento que la variante int8.
- GPU con INT8: no recomendado, porque el execution provider CUDA de ONNX Runtime no soporta por completo los operadores int8 dinamicos; de ahi la existencia de esta build FP32.
- Opciones de despliegue: ONNX Runtime con CUDA execution provider, contenedor Docker con `Dockerfile.gpu`, servidor FastAPI servido con uvicorn (`main:app`), con las variables de entorno `EMB_PROVIDER=cuda` y `EMB_MODEL=bge-m3-fp32`.
- Latencia y throughput absolutos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| justis-xu/bge-m3-v1.5-onnx-fp32 | no disponible | 8192 tokens, embedding de 1024 dim. | FP32 (ONNX) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Variante int8 de la misma familia (mencionada por el autor) | no disponible | no disponible | INT8, optimizada para CPU | no disponible | no disponible |
| BAAI/bge-m3 original (origen del grafo y los pesos) | no disponible en esta ficha | no disponible en esta ficha | FP32 en PyTorch, mas exportacion ONNX oficial | no disponible en esta ficha | repositorio oficial de BAAI |
| Referencia FP32 de sentence-transformers | no disponible | no disponible | FP32 | no disponible | usada como patron de comparacion numerica |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse uso comercial; hay que verificar la licencia del modelo base BAAI/bge-m3 antes de desplegarlo en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Ausencia de benchmarks de calidad: solo se certifica la equivalencia numerica con la referencia FP32, no el rendimiento en tareas de recuperacion (MTEB, MIRACL, BEIR).
- Geometria de vectores dependiente del backend: el autor advierte de que CPU y GPU generan espacios distintos por diferencias de kernel; cambiar de instancia obliga a reindexar la coleccion completa, con el coste operativo que ello implica.
- Rendimiento en CPU penalizado: entre 3 y 4 veces mas lento que la variante int8, segun la propia ficha.
- INT8 no utilizable en GPU: el execution provider CUDA no cubre todos los operadores int8 dinamicos, lo que limita las opciones de optimizacion en produccion.
- Alcance funcional no aclarado: no se especifica si el grafo expone las salidas sparse y multi-vector del bge-m3 original ni si conserva sus capacidades multilingues.
- Riesgo de alucinacion: no aplica en sentido estricto, porque el modelo no genera texto; el riesgo equivalente es la recuperacion de pasajes irrelevantes cuando el corpus o los umbrales de similitud estan mal calibrados.
- Idiomas: no declarados en el repositorio; cualquier afirmacion sobre cobertura linguistica queda sin confirmar.
- Metadatos a revisar: las fechas de creacion y actualizacion del repositorio figuran como 2026-09-14, lo que conviene verificar antes de tomarlas como referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/justis-xu/bge-m3-v1.5-onnx-fp32
- Modelo base de referencia citado en la model card: BAAI bge-m3 (grafo `onnx/model.onnx` y pesos `model.onnx_data` oficiales); no se proporciona URL directa en la informacion disponible.
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo: los resultados se limitan a paginas corporativas generales de Microsoft, sin relacion con bge-m3 ni con embeddings. No hay papers, blogs, repos ni demos adicionales disponibles en la informacion proporcionada.
