# CollectionStudio/siglip-base-patch16-256

## Resumen

SigLIP base patch16-256 es un modelo multimodal de visión y lenguaje que aprende representaciones conjuntas de imágenes y texto. Lo desarrolla el equipo de Google Research (Zhai et al.) y se publicó originalmente en el repositorio google-research/big_vision, acompañado del artículo "Sigmoid Loss for Language Image Pre-Training". La ficha que nos ocupa, CollectionStudio/siglip-base-patch16-256, es una reproducción del modelo original google/siglip-base-patch16-256: comparte arquitectura, pesos y licencia, pero no añade información propia ni actividad en el Hub (0 descargas, 0 likes en el momento de la consulta).

La aportación técnica del modelo es sustituir la pérdida contrastiva softmax de CLIP por una pérdida sigmoide que opera únicamente sobre pares imagen-texto, sin necesidad de una normalización global entre todas las similitudes del lote. Esto permite escalar el tamaño de lote con más facilidad y mantener un buen comportamiento incluso con lotes pequeños. Se trata de un transformer dual-encoder: un codificador de visión tipo ViT con parches de 16x16 sobre imágenes de 256x256 y un codificador de texto independiente.

Con 203.202.050 parámetros y un repositorio de 0,8 GB, es un modelo ligero pensado para extracción de características, clasificación de imágenes zero-shot y recuperación imagen-texto, no para generación. Su relevancia actual radica en que se ha convertido en el codificador visual de referencia en muchos pipelines multimodales (por ejemplo, como torre de visión en sistemas tipo LLaVA o PaliGemma) y en una alternativa directa a CLIP con mejor rendimiento en clasificación zero-shot según el artículo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-encoder (SigLIP): codificador de vision ViT con parches de 16x16 y codificador de texto independiente, entrenados con perdida sigmoide |
| Parametros totales | 203.202.050 (dato de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens para el texto; imagenes de 256x256 px con parches de 16x16 (256 parches por imagen). No es un modelo autoregresivo, por lo que no hay ventana de contexto generativa |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos safetensors; no hay variantes GGUF, ONNX ni int8 del autor) |
| Idiomas soportados | no disponible como lista declarada; el modelo se preentreno con los pares imagen-texto en ingles del dataset WebLI |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (aproximadamente 0,8 GB, coherente con pesos en fp32) |

## Arquitectura y entrenamiento

SigLIP sigue el esquema de CLIP: dos torres transformer independientes, una para imagen y otra para texto, que proyectan sus salidas a un espacio compartido donde se calcula la similitud. La torre de visión es un ViT que divide la imagen de 256x256 en parches de 16x16, y la torre de texto procesa secuencias tokenizadas y rellenadas a 64 tokens. La innovacion es la funcion de perdida: en lugar del softmax contrastivo que necesita comparar cada par contra todos los del lote, SigLIP aplica una sigmoide independiente a cada par imagen-texto, lo que elimina la normalizacion global y hace que el coste de computo no dependa del tamano del lote de la misma manera.

El preentrenamiento se realizo sobre los pares imagen-texto en ingles del dataset WebLI (Chen et al., 2023). Las imagenes se redimensionan a 256x256 y se normalizan por canal RGB con media (0,5, 0,5, 0,5) y desviacion tipica (0,5, 0,5, 0,5). El entrenamiento se llevo a cabo en 16 chips TPU-v4 durante tres dias. No se documenta en la model card ninguna fase de ajuste por instrucciones, RLHF o DPO, algo coherente con un modelo de representacion y no de generacion.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar etiquetas de texto arbitrarias a una imagen y obtener probabilidades mediante la sigmoide de las similitudes.
- Recuperacion imagen-texto y texto-imagen: busqueda semantica sobre bancos de imagenes mediante embeddings normalizados.
- Extraccion de embeddings visuales y textuales para tareas posteriores (indexacion vectorial, clustering, deduplicacion de imagenes).
- Calculo de similitud imagen-texto par a par, util para filtrado de datasets y control de calidad de datos multimodales.
- Vision por computadora sin cabecera especifica: al no requerir clases predefinidas, sirve como backbone congelado para clasificadores ligeros.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente ni modo de razonamiento; no es un modelo de lenguaje generativo.
- Capacidad multilingue: no documentada. El preentrenamiento se limita a pares en ingles, por lo que el rendimiento con textos en castellano no esta garantizado ni medido en la informacion disponible.

## Casos de uso

- Etiquetado automatico de catalogos de imagen: dado un banco de fotografias, el modelo puntua cada imagen contra una lista de etiquetas candidatas y asigna la de mayor probabilidad, sin necesidad de entrenar un clasificador por categoria.
- Moderacion de contenido visual: comparar imagenes subidas por usuarios contra un conjunto de descripciones textuales de contenido no permitido y derivar una puntuacion de similitud para el revisor humano.
- Busqueda semantica en bancos de imagenes: indexar los embeddings visuales y permitir consultas en lenguaje natural, recuperando las imagenes mas cercanas por producto escalar.
- Curaduria y filtrado de datasets multimodales: descartar pares imagen-texto mal alineados calculando la similitud entre ambos y aplicando un umbral, tarea habitual antes de entrenar modelos mayores.
- Duplicados y near-duplicates: usar los embeddings de imagen para detectar copias o variaciones casi identicas dentro de un repositorio grande.
- Control de calidad en e-commerce: verificar que la foto de un producto corresponde a su descripcion textual y marcar discrepancias para revision manual.
- Backbone para pipelines multimodales: congelar la torre de vision y conectar un proyector a un modelo de lenguaje para construir asistentes visuales, patron habitual en arquitecturas tipo LLaVA.
- Clasificacion en el borde (edge): con 203 M de parametros y menos de 1 GB en fp32, es viable ejecutarlo en CPU o en GPUs integradas para preetiquetado masivo por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen con la tabla comparativa de SigLIP frente a CLIP extraida del articulo, pero los valores concretos no estan accesibles en el texto proporcionado. La afirmacion cualitativa que si aparece es que SigLIP obtiene mejores resultados que CLIP en clasificacion zero-shot, con una ventaja mas acusada en regimenes de lote pequeno.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB con pesos en fp32, en torno a 0,4 GB en fp16 y menos de 0,2 GB en int8. Hay que sumar el espacio de activaciones, que en inferencia por lotes pequenos es reducido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050 o superiores. Para lotes grandes o extraccion masiva de embeddings conviene una RTX 4090, A100 o H100 por throughput, no por memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos (RTX serie 20, 30, 40, e incluso integradas con suficiente memoria compartida).
- CPU: la inferencia en CPU es viable para lotes moderados; el modelo es lo bastante pequeno para no requerir GPU en tareas de clasificacion puntual.
- Opciones de despliegue: transformers con AutoModel y AutoProcessor, exportacion a ONNX Runtime o TensorRT, TorchScript y FastAPI para servir el modelo. No hay soporte oficial documentado en vLLM o TGI para este modelo concreto en la informacion disponible.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano de lote y de si se ejecuta en fp32 o fp16; no hay cifras publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP base patch16-256 (este modelo) | 203.202.050 | 256x256 | 64 tokens | Apache 2.0 | HuggingFace, safetensors |
| SigLIP base patch16-224 (google) | no disponible en la informacion proporcionada | 224x224 | 64 tokens | Apache 2.0 | HuggingFace, safetensors |
| CLIP ViT-B/16 (OpenAI) | aproximadamente 150 M (dato externo, no verificado en esta ficha) | 224x224 | 77 tokens | Licencia propia de OpenAI, no Apache | HuggingFace, safetensors y otros |
| OpenCLIP ViT-B/32 | no disponible en la informacion proporcionada | 224x224 | 77 tokens | Apache 2.0 en la mayoria de variantes | HuggingFace, safetensors |

La comparacion de rendimiento cuantitativo frente a CLIP no puede completarse porque los valores numericos de la tabla del articulo no estan disponibles en el texto extraido. Cualitativamente, el articulo situa a SigLIP por delante de CLIP en clasificacion zero-shot.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas, solo puntuaciones de similitud y embeddings.
- Riesgo de sesgo heredado de WebLI: los pares imagen-texto en ingles de la web reproducen sesgos de genero, etnia, profesion y geografia presentes en los datos.
- Alucinacion en el sentido de falsos positivos: al comparar una imagen con etiquetas arbitrarias siempre devuelve una probabilidad alta para la etiqueta mas cercana, aunque ninguna describa realmente la imagen; conviene fijar umbrales.
- Cobertura linguistica limitada al ingles en el preentrenamiento; el rendimiento con prompts en castellano no esta medido ni garantizado.
- Resolucion fija de 256x256 y parches de 16x16: los detalles finos o el texto pequeno en imagenes pueden perderse; no hay variantes de mayor resolucion en este repositorio.
- Limite de 64 tokens de texto por descripcion, insuficiente para frases largas o instrucciones complejas.
- El repositorio CollectionStudio no aporta model card propia ni resultados de evaluacion: la documentacion disponible es la del modelo original de Google, y la ficha no registra descargas ni validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar el aviso de licencia y la atribucion al trabajo original de Zhai et al.
- Los pesos no incluyen cabecera de clasificacion entrenada: cualquier tarea supervisada requiere ajuste adicional.
- Repositorio de 0,8 GB en fp32: si el almacenamiento o el ancho de banda son limitados, conviene convertir a fp16 o int8 antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip-base-patch16-256
- Modelo original de Google: https://huggingface.co/google/siglip-base-patch16-256
- Articulo "Sigmoid Loss for Language Image Pre-Training": https://arxiv.org/abs/2303.15343
- Repositorio big_vision de Google Research: https://github.com/google-research/big_vision
- Articulo del dataset WebLI: https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Documentacion de CLIP en transformers (referencia de la arquitectura base): https://huggingface.co/docs/transformers/model_doc/clip
