# google/vit-base-patch16-224

## Resumen

google/vit-base-patch16-224 es el modelo Vision Transformer (ViT) en su variante base, desarrollado por Google Research e incorporado al ecosistema Hugging Face por el propio equipo de Hugging Face a partir de los pesos convertidos por Ross Wightman desde el repositorio timm. Resuelve el problema de clasificacion de imagenes aplicando de forma directa la arquitectura transformer encoder (estilo BERT) sobre secuencias de parches de imagen de 16x16 pixels, en lugar de las convoluciones tradicionales.

El modelo fue preentrenado de forma supervisada sobre ImageNet-21k (14 millones de imagenes, 21.843 clases) y posteriormente afinado sobre ImageNet-2012 (1 millon de imagenes, 1.000 clases), ambos a resolucion 224x224. Cuenta con 86.567.656 parametros y su relevancia actual radica en que se ha convertido en un punto de referencia estandar para clasificacion y extraccion de caracteristicas visuales: acumula mas de 12,5 millones de descargas y mas de 1.000 likes en Hugging Face.

El modelo es ligero para los estandares actuales, se distribuye bajo licencia Apache-2.0 (uso comercial permitido) y esta disponible en PyTorch, TensorFlow y JAX/Flax mediante la libreria transformers. Es la base habitual sobre la que se afinan clasificadores personalizados anadiendo una capa lineal sobre el token [CLS].

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), transformer encoder (estilo BERT) |
| Parametros totales | 86.567.656 (86,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | secuencia de 197 tokens (196 parches de 16x16 para 224x224 + 1 token [CLS]); no disponible en el sentido de contexto de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de vision, no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX/Flax |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder (BERT-like) que trata la imagen como una secuencia de parches. Cada imagen de entrada se redimensiona a 224x224 pixels y se divide en parches fijos de 16x16, que se embeben linealmente. Se anade un token [CLS] al inicio de la secuencia y embeddings de posicion absolutos antes de alimentar las capas del encoder. La representacion final del token [CLS] se interpreta como una representacion global de la imagen y es la que se utiliza para clasificacion (por ejemplo, colocando una capa lineal encima).

El preentrenamiento se realizo de forma supervisada sobre ImageNet-21k (14 millones de imagenes, 21.843 clases) y el afinamiento sobre ImageNet-2012 (1 millon de imagenes, 1.000 clases), segun la model card. El entrenamiento se llevo a cabo en hardware TPUv3 (8 nucleos), con un tamano de lote de 4096, un calentamiento de la tasa de aprendizaje de 10.000 pasos y recorte de gradiente a norma global 1 para ImageNet. La resolucion de entrenamiento fue 224. En el preprocesado, las imagenes se normalizan por canal RGB con media (0,5, 0,5, 0,5) y desviacion estandar (0,5, 0,5, 0,5). No se menciona el uso de RLHF/DPO, algo esperable al tratarse de un modelo discriminativo de vision y no de un modelo generativo de lenguaje.

La innovacion tecnica central es precisamente el propio planteamiento del paper "An Image is Worth 16x16 Words": demostrar que un transformer puro, sin convoluciones, puede alcanzar resultados competitivos en reconocimiento de imagenes cuando se preentrena a gran escala y se transfiere a tareas downstream. La model card senala que para el afinamiento los mejores resultados se obtienen con resolucion superior (384x384) y que aumentar el tamano del modelo mejora el rendimiento.

## Capacidades

- Clasificacion de imagenes: predice una de las 1.000 clases de ImageNet-2012 a partir de una imagen de entrada.
- Extraccion de caracteristicas visuales: la representacion del token [CLS] (ultimo estado oculto) sirve como embedding de imagen para tareas downstream.
- Aprendizaje por transferencia: se puede afinar anadiendo una capa lineal sobre el encoder preentrenado para clasificadores personalizados.
- Compatibilidad multiproceso: disponible en PyTorch, TensorFlow y JAX/Flax a traves de transformers.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No incorpora modo de razonamiento (thinking), vision multimodal con texto, audio ni generacion.

## Casos de uso

- Clasificacion automatica de imagenes en produccion: dado un catalogo de productos, etiquetar cada imagen en una de las categorias definidas afinando una capa de clasificacion sobre el token [CLS], con un coste computacional bajo gracias a sus 86,6 M de parametros.
- Moderacion de contenido visual: primera fase de filtrado de imagenes que requieren revision (por ejemplo, deteccion de categorias sensibles) antes de pasar a un modelo mas pesado, aprovechando su velocidad de inferencia.
- Extraccion de embeddings para busqueda por similitud: usar la representacion del encoder como vector de imagen para construir un indice de similitud visual (busqueda inversa de imagenes, recomendacion de productos visualmente similares).
- Etiquetado y organizacion de fototecas: clasificacion automatica de grandes volumenes de imagenes en categorias (paisajes, animales, objetos) para su archivado y busqueda.
- Base para pipelines de vision personalizados: punto de partida para afinar en dominios especificos (radiologia, agricultura, industria) con datasets etiquetados mas pequenos, aprovechando el preentrenamiento en ImageNet-21k.
- Control de calidad industrial: inspeccion visual de defectos donde se afina el modelo para clasificar piezas como correctas o defectuosas, integrándose en una linea de produccion mediante un servicio de inferencia.
- Investigacion y docencia en vision por computador: modelo de referencia reproducible y ligero para experimentos de ablacion, comparativas de arquitecturas y ensenanza de transformers aplicados a vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 2 y 5 del paper original (arXiv:2010.11929) para los resultados de evaluacion en distintos benchmarks de clasificacion de imagenes, pero no reproduce cifras concretas. La model card indica ademas que el mejor rendimiento en afinamiento se obtiene con resolucion superior (384x384) y que aumentar el tamano del modelo mejora los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 346 MB de pesos en FP32, unos 173 MB en FP16/BF16 y unos 87 MB en int8 (valores aproximados a partir de los 86,6 M de parametros; no incluyen activaciones ni el buffer de procesado de imagen).
- GPUs recomendadas: cualquier GPU moderna es suficiente; funciona tambien en GPUs de gama baja (GTX 1050, GTX 1650) y en GPU integradas, dado el reducido tamano del modelo.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer (RTX 3060, RTX 4090, etc.), incluso compartiendo GPU con otros procesos.
- Inferencia en CPU: viable y habitual para lotes pequenos o moderados, dado el tamano del modelo.
- Opciones de despliegue: transformers (PyTorch, TensorFlow, JAX/Flax), ONNX Runtime, Hugging Face Inference Endpoints (tag endpoints_compatible) y despliegue en Azure (tag deploy:azure). El tamano del repositorio es de 2,4 GB porque incluye pesos en varios frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Notas |
|---|---|---|---|---|
| google/vit-base-patch16-224 | 86,6 M | 197 tokens (224x224, parches 16x16) | apache-2.0 | Preentrenado en ImageNet-21k y afinado en ImageNet-1k |
| Variantes ViT del mismo autor (por ejemplo, resolucion 384 o variante large) | no disponible | superior (384x384) / mayor tamano | apache-2.0 | La model card indica mejor rendimiento con mayor resolucion y mayor tamano |
| Otras arquitecturas de clasificacion comparables (por ejemplo, DeiT, ResNet, EfficientNet) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de cifras de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible realizar una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre ImageNet-21k e ImageNet-2012; hereda los sesgos de composicion y etiquetado de dichos datasets (infrarrepresentacion de ciertas culturas, contextos y clases).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza cuando la imagen de entrada se aleja de la distribucion de entrenamiento (por ejemplo, dominios muy especificos como imagen medica o industrial).
- Limitaciones de contexto y entrada: el modelo espera imagenes redimensionadas a 224x224 con parches de 16x16; la resolucion esta fijada y no es un modelo de contexto variable. El mejor rendimiento en afinamiento se obtiene a 384x384, fuera de la configuracion por defecto.
- Limitacion de idioma: no aplica, ya que no procesa texto.
- Uso comercial: permitido bajo licencia Apache-2.0.
- Caveats de produccion: el modelo predice unicamente entre las 1.000 clases de ImageNet-1k; para cualquier otra taxonomia es obligatorio afinar. El token [CLS] debe extraerse correctamente al usar el encoder como extractor de caracteristicas. La model card no fue escrita por el equipo que desarrollo el modelo, sino por el equipo de Hugging Face, por lo que algunos detalles de entrenamiento pueden ser incompletos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/google/vit-base-patch16-224
- Paper original: https://arxiv.org/abs/2010.11929
- Paper adicional citado en la model card (Wu et al., 2020): https://arxiv.org/abs/2006.03677
- Repositorio oficial de Google Research: https://github.com/google-research/vision_transformer
- Repositorio timm (origen de la conversion de pesos): https://github.com/rwightman/pytorch-image-models
- Documentacion de ViT en transformers: https://huggingface.co/transformers/model_doc/vit.html
- Dataset ImageNet-21k: http://www.image-net.org/
- Dataset ImageNet / ILSVRC2012: http://www.image-net.org/challenges/LSVRC/2012/
- Detalles de preprocesado de entrenamiento: https://github.com/google-research/vision_transformer/blob/master/vit_jax/input_pipeline.py
- Coleccion de modelos ViT en el hub: https://huggingface.co/models?search=google/vit
