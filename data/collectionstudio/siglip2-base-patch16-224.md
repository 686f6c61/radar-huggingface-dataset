# CollectionStudio/siglip2-base-patch16-224

## Resumen

SigLIP 2 Base (checkpoint `CollectionStudio/siglip2-base-patch16-224`) es un codificador vision-lenguaje de tipo contraste (image-text encoder) desarrollado originalmente por Google Research y reempaquetado en Hugging Face por el usuario CollectionStudio. El modelo extiende el objetivo de preentrenamiento de SigLIP incorporando perdidas de decodificacion, prediccion global-local enmascarada y adaptabilidad de resolucion y relacion de aspecto en una receta unificada, lo que mejora la comprension semantica, la localizacion de objetos y la calidad de las caracteristicas densas.

El checkpoint contiene 375.187.970 parametros (dato extraido de los pesos en safetensors) y combina una torre de vision ViT con parches de 16x16 a 224x224 de resolucion con una torre de texto. Se distribuye bajo licencia Apache 2.0, en formato safetensors y con integracion nativa en la libreria `transformers`, lo que lo hace directamente utilizable mediante el pipeline `zero-shot-image-classification`.

Su relevancia actual radica en que sustituye a CLIP y a la primera generacion de SigLIP como codificador visual de referencia para clasificacion zero-shot, recuperacion imagen-texto y como torre de vision en modelos vision-lenguaje (VLM). Su tamano moderado (menos de 400 millones de parametros) permite desplegarlo en hardware de consumo con un coste de memoria inferior a 1 GB en precision media, algo poco habitual en codificadores multimodales modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (vision + texto) con objetivo contrastivo tipo SigLIP 2; vision tower ViT con parches de 16x16 a 224x224 |
| Parametros totales | 375.187.970 (segun pesos safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la torre de texto de la familia SigLIP emplea secuencias cortas de tokens, pero el repositorio no declara el valor) |
| Tipos de cuantizacion | No se publican variantes cuantizadas en el repositorio; los pesos se sirven en safetensors (precision de entrenamiento). Es posible cuantizar externamente con bitsandbytes, Optimum o cuantizacion nativa de PyTorch |
| Idiomas soportados | El paper y el titulo del modelo indican caracter multilingue, pero el repositorio no declara una lista de idiomas; metadatos de Hugging Face: no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SigLIP 2 mantiene la arquitectura de doble torre de SigLIP: un codificador de vision tipo ViT que divide la imagen en parches de 16x16 (196 parches a 224x224 de resolucion) y un codificador de texto, ambos proyectados a un espacio comun mediante una perdida contrastiva sigmoidea (sigmoid loss) en lugar del softmax clasico de CLIP. Sobre esa base, SigLIP 2 anade cuatro cambios de receta descritos en la model card: una perdida de decodificacion que entrena al modelo a reconstruir texto a partir de las representaciones visuales, una perdida de prediccion global-local y enmascarada que mejora las caracteristicas densas y la localizacion, y adaptabilidad de relacion de aspecto y resolucion, lo que permite procesar imagenes con proporciones distintas sin degradar el rendimiento.

El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023), un corpus de pares imagen-texto a gran escala y multilingue. El computo de entrenamiento alcanzo hasta 2048 chips TPU-v5e, segun la informacion facilitada. No se detalla en el material disponible el numero exacto de tokens o pares imagen-texto vistos, la composicion linguistica del dataset ni si hubo fases de ajuste con RLHF o DPO; al tratarse de un codificador contrastivo, ese tipo de alineacion no forma parte del pipeline habitual.

Es importante senalar que este repositorio concreto (`CollectionStudio/siglip2-base-patch16-224`) es un reempaquetado del checkpoint oficial `google/siglip2-base-patch16-224`: el campo `library_name` es `transformers`, incluye el tag `endpoints_compatible` y conserva la licencia Apache 2.0, pero no aporta pesos nuevos ni ajustes adicionales.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar etiquetas arbitrarias en texto a una imagen sin reentrenamiento, mediante el pipeline `zero-shot-image-classification`.
- Recuperacion imagen-texto (image-text retrieval) y texto-imagen, gracias al espacio de embeddings compartido entre ambas torres.
- Extraccion de caracteristicas visuales densas mediante `get_image_features`, util para clustering, deduplicacion de imagenes, busqueda visual y sistemas de recomendacion.
- Extraccion de caracteristicas de texto con la torre correspondiente, para indexacion semantica conjunta.
- Uso como torre de vision (vision encoder) dentro de modelos vision-lenguaje mas grandes, sustituyendo a CLIP ViT o al SigLIP original.
- Capacidad multilingue heredada del preentrenamiento sobre WebLI, segun la descripcion del paper; el repositorio no especifica la lista de idiomas cubiertos.
- Localizacion de objetos y segmentacion debil derivada de la perdida global-local enmascarada, segun la descripcion del entrenamiento.
- No dispone de modo de razonamiento explicito, generacion de texto libre, tool calling ni soporte de agentes: es un codificador, no un modelo generativo de instrucciones.

## Casos de uso

- Moderacion de contenido visual: clasificar imagenes entrantes contra un conjunto de etiquetas de politica (por ejemplo, "contenido violento", "desnudo", "documento de identidad") sin entrenar un clasificador especifico para cada categoria nueva. La formulacion zero-shot permite anadir etiquetas sin reentrenamiento.
- Catalogacion automatica de productos en e-commerce: dado un catalogo de categorias en texto, asignar cada imagen de producto a la categoria correcta y generar embeddings para busqueda visual por similitud.
- Busqueda visual en bibliotecas de imagenes: indexar los embeddings de la torre de vision y de la torre de texto para permitir consultas en lenguaje natural sobre un corpus de fotos, con recuperacion por similitud coseno.
- Deduplicacion y curaduria de datasets: usar los embeddings de imagen para detectar imagenes casi identicas en corpus de entrenamiento a gran escala, reduciendo redundancia y riesgo de fuga de datos.
- Anotacion asistida de imagenes medicas o cientificas: clasificacion zero-shot de modalidades (radiografia, resonancia, microscopia) o de hallazgos descritos textualmente, como paso previo a la revision humana. Requiere validacion especifica del dominio.
- Construccion de VLM propios: emplear el modelo como torre de vision congelada o ajustable y conectar un decodificador de lenguaje, aprovechando que SigLIP 2 mejora las caracteristicas densas frente a CLIP y SigLIP 1.
- Deteccion de contenido multimodal en pipelines de seguridad: marcar imagenes potencialmente sensibles antes de que lleguen a un modelo generativo, integrando el clasificador como paso de filtrado previo.
- Clasificacion en el borde (edge): con menos de 400 millones de parametros, puede ejecutarse en dispositivos con CPU o GPU integrada para tareas de etiquetado en camaras o kioscos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia la tabla de evaluacion del paper de SigLIP 2 (enlazada como imagen y tomada de la publicacion original), pero no incluye cifras numericas concretas en el texto facilitado, por lo que no se reproducen valores de MMLU, ImageNet zero-shot, COCO retrieval ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,75 GB para los pesos en fp16 o bf16 y alrededor de 1,5 GB en fp32. Con activaciones y un lote pequeno, el consumo total se situa tipicamente entre 1,5 y 3 GB.
- GPUs recomendadas: para produccion con lotes grandes, A100, H100, L40S o A10G. Para desarrollo e inferencia interactiva, RTX 4090, RTX 3090, RTX 4080 o cualquier GPU con 8 GB o mas de VRAM.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo con 4 GB o mas (RTX 3050, RTX 3060, GTX 1660, e incluso en iGPU recientes). Tambien es viable en CPU y en Apple Silicon via MPS.
- Opciones de despliegue: `transformers` (pipeline de clasificacion zero-shot y uso directo de `AutoModel`), Text Generation Inference / TGI para servir el modelo como endpoint (el repositorio lleva el tag `endpoints_compatible`), Hugging Face Inference Endpoints, y exportacion a ONNX u OpenVINO para inferencia optimizada. No se proporciona GGUF en el repositorio, por lo que llama.cpp y Ollama no tienen un camino oficial sin conversion manual. El soporte en vLLM no esta documentado para esta tarea de clasificacion.
- Latencia y throughput: no disponible. Al ser un modelo de 375 millones de parametros con entrada de 224x224, se espera una latencia de decenas de milisegundos por imagen en GPU moderna, pero no hay cifras medidas publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP 2 Base patch16-224 (este repositorio) | 375.187.970 | Imagen 224x224, parches de 16x16 | Multilingue (segun el paper; lista no declarada en el repo) | Apache 2.0 | Safetensors en Hugging Face, integracion `transformers` |
| SigLIP (primera generacion, `google/siglip-base-patch16-224`) | No disponible en la informacion proporcionada | Imagen 224x224, parches de 16x16 | No disponible | Apache 2.0 (segun el modelo original) | Disponible en Hugging Face |
| CLIP ViT-B/16 (`openai/clip-vit-base-patch16`) | No disponible en la informacion proporcionada | Imagen 224x224, parches de 16x16 | Predominantemente ingles | Licencia propia de OpenAI para los pesos de CLIP | Disponible en Hugging Face |
| OpenCLIP ViT-B/16 | No disponible en la informacion proporcionada | Imagen 224x224 | Depende del checkpoint | Variable segun checkpoint | Disponible en Hugging Face y en el repositorio `mlfoundations/open_clip` |

No se dispone de cifras de rendimiento comparadas en la informacion proporcionada, por lo que la comparativa se limita a aspectos de licencia, disponibilidad y arquitectura. Segun la descripcion del paper, SigLIP 2 mejora a SigLIP en comprension semantica, localizacion y caracteristicas densas, pero no se incluyen numeros que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Alucinacion: aunque no genera texto libre, el modelo puede producir puntuaciones de similitud altas para etiquetas incorrectas cuando las etiquetas son ambiguas, muy genericas o fuera del dominio de entrenamiento. Las probabilidades deben calibrarse por tarea.
- Sesgos: hereda los sesgos presentes en WebLI, un corpus web a gran escala que sobrerrepresenta determinadas culturas, idiomas y contextos. No hay en la informacion disponible un analisis de sesgos especifico para este checkpoint.
- Cobertura linguistica: el caracter multilingue se anuncia en el paper, pero el repositorio no declara que idiomas estan cubiertos ni con que calidad. El rendimiento en castellano no esta verificado en el material disponible.
- Limitacion de contexto: la torre de texto procesa descripciones cortas. No es adecuada para clasificacion sobre parrafos largos ni para razonamiento sobre documentos extensos.
- Dominios especializados: el rendimiento en imagenes medicas, satelitales, industriales o tecnicas suele degradarse respecto a dominios naturales, ya que no forman parte mayoritaria del preentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. Debe verificarse igualmente la licencia del checkpoint original de Google, que es la fuente real de los pesos.
- Riesgo de procedencia: este repositorio es un reempaquetado por un tercero con 0 descargas y 0 likes en el momento de la consulta. Para produccion conviene usar el checkpoint oficial `google/siglip2-base-patch16-224` o verificar la integridad de los pesos de este espejo.
- Idoneidad para produccion: no es un modelo de instrucciones ni de chat; no soporta function calling, agentes ni generacion de codigo. Cualquier expectativa de ese tipo es un error de uso.
- Advertencia sobre la busqueda web: los resultados de busqueda asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo (remiten a sitios de contenido para adultos sin relacion alguna), por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face (este repositorio): https://huggingface.co/CollectionStudio/siglip2-base-patch16-224
- Checkpoint oficial de referencia: https://huggingface.co/google/siglip2-base-patch16-224
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper de SigLIP (primera generacion): https://arxiv.org/abs/2303.15343
- Paper de WebLI: https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Tabla de evaluacion citada en la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/sg2-blog/eval_table.png
- Imagen de ejemplo del widget: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg
- No se han encontrado otros enlaces relevantes (papers, repos, demos) en los resultados de busqueda web proporcionados.
