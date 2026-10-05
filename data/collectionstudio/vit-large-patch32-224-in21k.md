# CollectionStudio/vit-large-patch32-224-in21k

## Resumen

El modelo `CollectionStudio/vit-large-patch32-224-in21k` es una reproducción (mirror) del Vision Transformer de tamano *large* preentrenado sobre ImageNet-21k a una resolucion de 224x224 píxeles y con parches de 32x32. Se trata de un encoder transformer puro (estilo BERT pero aplicado a imágenes), sin cabezas de clasificación ajustadas: los pesos corresponden al preentrenamiento original de Google Research, convertidos desde JAX a PyTorch por Ross Wightman en el repositorio `timm` y redistribuidos aqui bajo licencia Apache 2.0. El autor original del paper es Dosovitskiy et al. (2020), con el articulo "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale".

La relevancia de este checkpoint es doble. Por un lado, es la variante de ViT-L con parches grandes (32x32), lo que reduce la secuencia de entrada a solo 50 tokens (49 parches de 7x7 mas el token [CLS]) frente a los 197 tokens de las variantes con parche 16. Esa secuencia tan corta abarata el coste de atencion y permite procesar imágenes con mayor throughput, a cambio de perder resolucion espacial efectiva. Por otro, sirve como base de *transfer learning*: sobre el token [CLS] se puede entrenar una capa lineal para clasificacion, o reutilizar las representaciones internas para recuperacion de imágenes, deteccion o segmentacion con las adaptaciones oportunas.

El repositorio ocupa 3,7 GB e incluye pesos en PyTorch, TensorFlow y JAX/FLAX. No registra descargas ni likes en el momento de la consulta y tiene la inferencia desactivada en el Hub (`inference: false`), por lo que no es un checkpoint validado por la comunidad sino una copia de conveniencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (encoder transformer, tipo BERT, con patch embedding y position embeddings absolutos) |
| Parametros totales | Aproximadamente 307 M (cifra del paper original, Tabla 1; no confirmada en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 50 tokens de entrada (49 parches de 7x7 + token [CLS]) a 224x224 con parche de 32; secuencia derivada de la configuracion indicada |
| Tipos de cuantizacion | No disponible. No se publican pesos cuantizados; al ser un encoder, admite FP16/BF16 e INT8 con herramientas externas (ONNX Runtime, TensorRT) |
| Idiomas soportados | No disponible. Es un modelo de vision, no procesa texto |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (bin/safetensors), TensorFlow y JAX/FLAX, segun los tags del repositorio |
| Dimension del modelo (hidden size) | 1024 |
| Numero de capas | 24 |
| Cabezas de atencion | 16 |
| Tamano de parche | 32x32 |
| Resolucion de preentrenamiento | 224x224 |
| Funcion de activacion | GELU (segun la implementacion estandar de ViT en Transformers) |
| Pipeline en el Hub | No disponible (inferencia desactivada) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estandar: la imagen se divide en parches de 32x32 que se proyectan linealmente a vectores de dimension 1024, se les suma un *embedding* posicional absoluto aprendido y se antepone un token [CLS]. La secuencia resultante (50 tokens) atraviesa 24 bloques con atencion multi-cabeza de 16 cabezas y un MLP con capa oculta de 4096. La salida del ultimo bloque para el token [CLS] se usa habitualmente como representacion global de la imagen. No hay innovaciones adicionales tipo atencion lineal o decodificacion especulativa: es el ViT canónico del paper de 2020.

El preentrenamiento se hizo sobre ImageNet-21k (14 millones de imágenes, 21.843 clases) en TPUv3 con 8 nucleos, a resolucion 224, con tamano de lote 4096 y *warmup* de 10.000 pasos. Para ImageNet los autores aplicaron *gradient clipping* con norma global 1. El preprocesado redimensiona a 224x224 y normaliza los canales RGB con media y desviacion tipica de 0,5. No hubo RLHF ni DPO (no es un modelo generativo). El checkpoint distribuido no incluye cabezas ajustadas: Google puso a cero los pesos de las cabezas de clasificacion, aunque si conserva el *pooler* preentrenado.

## Capacidades

- Extraccion de caracteristicas visuales: genera representaciones densas por parche y una representacion global (token [CLS]) para cualquier imagen de 224x224.
- Clasificacion de imágenes tras *fine-tuning* o *linear probing*: basta anadir una capa lineal sobre el token [CLS] y entrenar con un dataset etiquetado.
- Aprendizaje con pocos ejemplos: al haber sido preentrenado sobre 14 M de imágenes, converge razonablemente con conjuntos de entrenamiento reducidos en tareas de clasificacion.
- Transferencia a tareas densas: las representaciones por parche permiten adaptar el modelo a deteccion, segmentacion o *depth estimation* anadiendo cabezas especificas.
- Recuperacion de imágenes por similitud: los *embeddings* del token [CLS] o del *pooler* pueden indexarse en un motor vectorial para busqueda visual.
- Procesamiento por lotes a alta velocidad relativa: con solo 50 tokens por imagen, el coste de atencion es mucho menor que en variantes de parche 16, lo que favorece escenarios de alto volumen.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de audio ni de generacion de texto.
- No dispone de modo *thinking*, vision-language ni instrucciones: su unica entrada son imágenes.

## Casos de uso

- Clasificacion de imágenes con datasets pequenos: se congela el encoder y se entrena una regresion logistica sobre el token [CLS]; es el caso de uso canonico de un ViT preentrenado en ImageNet-21k y el que la propia model card recomienda.
- Recuperacion de imágenes por similitud visual: extraer el vector del [CLS] de cada imagen del catalogo y almacenarlo en un indice vectorial (FAISS, Qdrant, Milvus) para busqueda por ejemplo visual. Los 1024 valores por imagen son manejables a escala de millones de registros.
- Inspeccion visual en linea de produccion: con *fine-tuning* sobre imagenes de defectos, sirve como clasificador de control de calidad. Conviene valorar que el parche de 32x32 limita la deteccion de defectos muy pequenos; en esos casos es preferible una variante con parche 16 o 14.
- Moderacion de contenido en plataformas de subida: clasificador binario o multiclase entrenado sobre las representaciones del encoder para filtrar imagenes antes de su publicacion. Su bajo coste por imagen (50 tokens) permite procesar volumenes altos en tiempo casi real.
- Etiquetado asistido y *active learning*: usar las predicciones del modelo ajustado para preanotar grandes colecciones y priorizar las muestras de mayor incertidumbre para revision humana, reduciendo el coste de anotacion.
- Clasificacion de producto en comercio electronico: categorizar automaticamente imagenes de catalogo (categoria, subcategoria, atributos visuales) entrenando una cabeza sobre el encoder con las imagenes ya etiquetadas por el equipo de catalogo.
- Base para adaptacion de dominio: partir de estos pesos para reentrenar sobre dominios especificos (imagen medica, teledeteccion, industrial) cuando se dispone de muchos datos sin etiquetar y pocos etiquetados.
- Baseline de investigacion en vision: punto de comparacion reproducible frente a arquitecturas mas recientes (Swin, ConvNeXt, ViT con atencion lineal) en experimentos controlados, dado que sus pesos y configuracion estan publicamente documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de evaluacion y remite explicitamente a las tablas 2 y 5 del paper original (Dosovitskiy et al., 2020) para los resultados de clasificacion en ImageNet y otros conjuntos. Tampoco se aportan mediciones de latencia, throughput ni consumo de memoria para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en inferencia: unos 1,2 GB con pesos en FP32, unos 0,6 GB en FP16/BF16 y en torno a 0,3 GB en INT8, sin contar activaciones ni el coste de un lote grande. Con lotes de 32 a 64 imágenes a 224x224 conviene reservar 4-8 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4090 e incluso GPUs con 4-6 GB si se usa FP16 y lotes pequenos.
- GPU de centro de datos recomendadas para alto rendimiento: A100, H100, L40S o T4 para despliegues de bajo coste. El modelo original se entreno en TPUv3 con 8 nucleos.
- Funciona en CPU para inferencia puntual, aunque con latencias notablemente superiores; es viable para procesos por lotes no urgentes.
- Opciones de despliegue: Hugging Face Transformers (`ViTModel`), `timm`, exportacion a ONNX y ejecucion con ONNX Runtime o TensorRT, y TorchScript. No aplican vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones y no se han encontrado referencias de rendimiento para este checkpoint concreto.
- Nota practica: al tener secuencia de 50 tokens frente a los 197 de las variantes con parche 16, el coste de atencion cuadratica es aproximadamente 15 veces menor, lo que se traduce en mayor throughput a igualdad de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Parche | Tokens de entrada (224 px) | Preentrenamiento | Licencia |
|---|---|---|---|---|---|
| ViT-L/32-224-in21k (este) | ~307 M | 32x32 | 50 | ImageNet-21k (14 M imagenes) | Apache 2.0 |
| google/vit-large-patch16-224-in21k | ~307 M | 16x16 | 197 | ImageNet-21k (14 M imagenes) | Apache 2.0 |
| google/vit-base-patch16-224-in21k | ~86 M | 16x16 | 197 | ImageNet-21k (14 M imagenes) | Apache 2.0 |
| facebook/deit-base-distilled-patch16-224 | ~87 M | 16x16 | 197 | ImageNet-1k con destilacion | Apache 2.0 |

Frente a las variantes de parche 16, este checkpoint mantiene el mismo numero de parametros del cuerpo transformer y sacrifica resolucion espacial a cambio de una secuencia de entrada cuatro veces mas corta. Frente a ViT-Base, cuadruplica aproximadamente el numero de parametros y tiende a mejorar en tareas con suficientes datos de ajuste. Frente a DeiT-Base, el preentrenamiento es sobre un dataset mucho mayor y mas diverso (21.843 clases frente a 1.000), lo que suele traducirse en mejores representaciones transferibles, aunque DeiT incorpora destilacion y, en sus variantes destiladas, mejor comportamiento en regimen de pocos datos. No se dispone de cifras de rendimiento comparadas para este checkpoint concreto.

## Limitaciones y advertencias

- No incluye cabezas de clasificacion ajustadas: los investigadores de Google las pusieron a cero. Hay que anadir y entrenar una cabeza propia para cualquier tarea supervisada.
- La resolucion efectiva es baja: con parches de 32x32 sobre 224x224, cada token resume una region grande de la imagen. Esto penaliza tareas de grano fino como deteccion de objetos pequenos, OCR o inspeccion de defectos minimos.
- Aumentar la resolucion en *fine-tuning* (por ejemplo a 384x384) mejora los resultados segun el paper, pero exige interpolar los *position embeddings* aprendidos, lo que puede degradar el rendimiento si no se hace con cuidado.
- Sesgos del preentrenamiento: ImageNet-21k tiene una distribucion de clases desequilibrada y una sobrerrepresentacion de contextos culturales occidentales. Un clasificador ajustado sobre esta base puede heredar esos sesgos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreconfianza en clases fuera de la distribucion de entrenamiento; las probabilidades calibradas requieren temperatura o recalibracion en produccion.
- Restricciones de licencia: los pesos se distribuyen bajo Apache 2.0, lo que permite uso comercial. Conviene revisar aparte los terminos de uso del dataset ImageNet/ImageNet-21k, cuya descarga original esta restringida a fines de investigacion no comercial, aunque los pesos derivados se publiquen con una licencia permisiva.
- Repositorio de terceros: es un mirror con 0 descargas y 0 likes, sin validacion de la comunidad. Para uso en produccion es preferible referenciar el checkpoint original `google/vit-large-patch32-224-in21k`, con la misma configuracion.
- Inferencia desactivada en el Hub (`inference: false`), por lo que no se puede probar a traves del widget ni de la Inference API.
- Error de documentacion: el bloque BibTeX incluido en la model card corresponde al trabajo "Visual Transformers: Token-based Image Representation and Processing for Computer Vision" (Wu et al., 2020), no al paper de ViT. Ademas, el ejemplo de codigo de la model card carga los pesos de `google/vit-base-patch16-224-in21k` en lugar de los de este modelo; hay que corregir la ruta al usarlo.
- Fecha de creacion del repositorio (2026-10-05) muy posterior a la publicacion original del modelo, coherente con una resubida y no con una publicacion del autor original.
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo ni sobre su rendimiento; los resultados obtenidos eran contenido no relacionado con la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CollectionStudio/vit-large-patch32-224-in21k
- Checkpoint original equivalente: https://huggingface.co/google/vit-large-patch32-224-in21k
- Paper de ViT: https://arxiv.org/abs/2010.11929
- Repositorio oficial de Google Research: https://github.com/google-research/vision_transformer
- Repositorio timm (origen de la conversion de pesos): https://github.com/rwightman/pytorch-image-models
- Paper citado erroneamente en la model card (Wu et al., 2020): https://arxiv.org/abs/2006.03677
- Dataset ImageNet-21k: http://www.image-net.org/
- Pipeline de preprocesado del entrenamiento original: https://github.com/google-research/vision_transformer/blob/master/vit_jax/input_pipeline.py
- Busqueda en el Hub de variantes de ViT: https://huggingface.co/models?search=google/vit
