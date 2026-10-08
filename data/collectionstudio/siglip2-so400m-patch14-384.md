# CollectionStudio/siglip2-so400m-patch14-384

## Resumen

SigLIP 2 So400m es un codificador vision-lenguaje de tipo contraste (image-text encoder) desarrollado originalmente por Google Research y publicado en el articulo "SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features" (arXiv:2502.14786). La ficha que se analiza aqui corresponde a la republicacion realizada por el usuario CollectionStudio en HuggingFace, que replica el checkpoint oficial google/siglip2-so400m-patch14-384. El modelo resuelve tareas de clasificacion de imagenes zero-shot, recuperacion imagen-texto y, sobre todo, sirve como torre de vision para modelos vision-lenguaje (VLM).

Tecnicamente es la variante So400m ("shape-optimized", aproximadamente 400M de parametros en la torre de vision) con parches de 14x14 y resolucion de entrada de 384x384, lo que da un total de 1.136.008.498 parametros en el checkpoint completo (torre de vision mas codificador de texto). SigLIP 2 amplia el objetivo de preentrenamiento de SigLIP incorporando perdida de decodificador, prediccion global-local y enmascarada, y adaptabilidad de relacion de aspecto y resolucion, lo que mejora la comprension semantica, la localizacion de objetos y la calidad de las caracteristicas densas.

Su relevancia actual es doble: por un lado es un componente reutilizable para construir sistemas multimodales (encoders de vision para VLM, pipelines de retrieval, moderacion de contenido visual); por otro, su licencia Apache-2.0 permite uso comercial sin las restricciones tipicas de otros encoders. Se publica en formato safetensors y es compatible con el ecosistema transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2: transformer de vision (ViT) con torre de texto transformer y objetivo de contraste sigmoide |
| Parametros totales | 1.136.008.498 (segun metadatos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica el maximo de tokens de texto) |
| Tipos de cuantizacion | no disponible en la model card; el repo distribuido esta en safetensors (~4,6 GB) |
| Idiomas soportados | no disponible (los metadatos indican "no disponibles"; el titulo del paper menciona encoders multilingues) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Resolucion de entrada | 384x384 (derivado del nombre del checkpoint) |
| Tamano de parche | 14x14 (derivado del nombre del checkpoint) |
| Pipeline | zero-shot-image-classification |
| Libreria | transformers |
| Tamano del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

SigLIP 2 es una familia de encoders vision-lenguaje basada en la arquitectura SigLIP (arXiv:2303.15343). El componente de vision es un Vision Transformer que divide la imagen en parches de 14x14; con entrada de 384x384 esto produce 729 tokens de parche mas el token de clase. El texto se codifica con una torre transformer independiente y el alineamiento se aprende con una perdida de contraste sigmoide (en lugar del softmax contrastivo de CLIP), que permite entrenar con lotes mas pequenos y escalar de forma mas eficiente.

Respecto a SigLIP original, SigLIP 2 incorpora tres cambios en el objetivo de preentrenamiento: una perdida de decodificador (decoder loss) que reconstruye texto a partir de las caracteristicas visuales, una perdida global-local con prediccion enmascarada, y adaptabilidad de relacion de aspecto y resolucion, de modo que el modelo admite imagenes no cuadradas y distintas resoluciones sin degradar las caracteristicas densas. Estas tecnicas se presentan en el paper como la unificacion de varios desarrollos previos en una receta unica.

El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023, arXiv:2209.06794), un corpus de pares imagen-texto extraidos de la web. La model card indica que el entrenamiento se ejecuto en hasta 2048 chips TPU-v5e. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de ajuste tipo RLHF o DPO; tampoco hay datos sobre decodificacion especulativa o atencion lineal, que no forman parte de este tipo de encoder.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar probabilidades a etiquetas de texto arbitrarias sin reentrenamiento, mediante similitud imagen-texto.
- Recuperacion imagen-texto y texto-imagen (retrieval) para motores de busqueda visual y sistemas de recomendacion.
- Extraccion de embeddings de imagen mediante la torre de vision (metodo get_image_features), reutilizables en clustering, deduplicacion o indexacion vectorial.
- Extraccion de embeddings de texto alineados con el espacio visual, utiles para busqueda semantica multimodal.
- Uso como vision encoder en modelos vision-lenguaje: se conecta a un decodificador de lenguaje (por ejemplo, un LLM) para construir un VLM.
- Localizacion y caracteristicas densas mejoradas respecto a SigLIP original, segun el paper, lo que habilita tareas de segmentacion y deteccion con cabezas adicionales.
- Soporte de tool calling / function calling: no aplica, es un encoder y no genera texto.
- Soporte de agentes y razonamiento multi-paso: no aplica directamente; puede actuar como modulo perceptivo dentro de un agente.
- Capacidades multilingues: el titulo del paper menciona explicitamente encoders multilingues, pero la model card de este repositorio no especifica la lista de idiomas ni el tokenizador utilizado.
- Capacidad de thinking mode, vision generativa o audio: no disponible; el modelo no genera imagenes ni texto.

## Casos de uso

- Clasificacion de imagenes zero-shot en produccion: definir taxonomias con etiquetas en lenguaje natural y clasificar imagenes sin recolectar datos etiquetados; adecuado cuando las categorias cambian con frecuencia, ya que solo hay que reescribir los prompts.
- Moderacion de contenido visual: puntuar la similitud de una imagen con etiquetas del tipo "contenido violento" o "desnudo" y establecer umbrales; el modelo no requiere un clasificador binario entrenado aparte.
- Busqueda visual en catalogos de e-commerce: indexar los embeddings de las fotos de producto y recuperar por consulta de texto, con la torre de texto generando el embedding de la consulta en el mismo espacio.
- Deduplicacion y clustering de grandes corpus de imagenes: extraer embeddings de la torre de vision y aplicar k-NN o clustering sobre los vectores para agrupar imagenes similares o detectar duplicados.
- Componente de vision en un VLM propio: congelar la torre de vision y entrenar un adaptador hacia un LLM para tareas de descripcion de imagenes, VQA o asistentes visuales, con un coste de entrenamiento inferior al de entrenar el encoder desde cero.
- Etiquetado automatico y cura de datasets: preanotar imagenes con etiquetas candidatas generadas por un LLM y dejar que SigLIP 2 puntue la mejor coincidencia, acelerando la construccion de datasets supervisados.
- Filtrado de contenido en pipelines de entrenamiento: descartar pares imagen-texto mal alineados calculando la similitud entre ambos embeddings antes de incorporarlos a un corpus de entrenamiento multimodal.
- Sistemas de recomendacion visual: combinar el embedding de la imagen con senales de usuario para recuperar articulos visualmente similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia una tabla de evaluacion del paper mediante una imagen externa alojada en el repositorio de documentacion de HuggingFace, pero no incluye cifras numericas en el texto, por lo que no se reproducen valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento de parametros, no confirmada por el autor): aproximadamente 5-6 GB en fp32, 2,5-3,5 GB en fp16 o bf16, y 1,5-2 GB en int8.
- Los pesos publicados ocupan 4,6 GB, lo que es coherente con un almacenamiento de 4 bytes por parametro (fp32) para 1.136.008.498 parametros.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para fp32; RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G, A100 y H100 para despliegues con mayor lote o resoluciones adicionales.
- Cabe en GPU de consumo: si. En fp16 o bf16 es viable en tarjetas de 4-8 GB (GTX 1650 4 GB en cuantizacion agresiva, RTX 3060 12 GB con holgura); en fp32 conviene disponer de 8 GB o mas.
- Apple Silicon: ejecutable via MPS con memoria unificada de 8 GB o superior, aunque no aparece confirmado en la informacion disponible.
- Opciones de despliegue: transformers con pipeline zero-shot-image-classification o AutoModel/AutoProcessor, exportacion a ONNX u OpenVINO, torch.compile para reducir latencia, y servidores de inferencia que soporten el pipeline de vision de transformers (por ejemplo, TGI para tareas soportadas). El soporte concreto en vLLM, llama.cpp u Ollama no se menciona en la informacion disponible; llama.cpp y Ollama estan orientados a modelos generativos de texto y no aplican a este encoder.
- Latencia y throughput: no disponible. Como referencia cualitativa, el coste por imagen esta dominado por la torre de vision a 384x384 con 729 tokens de parche, por encima de variantes de 224x224.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / parche | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/siglip2-so400m-patch14-384 | 1.136.008.498 | 384 / 14 | no disponible | apache-2.0 | repositorio de terceros |
| google/siglip2-so400m-patch14-384 (original) | no disponible en esta busqueda | 384 / 14 | no disponible | apache-2.0 | repositorio oficial de Google |
| SigLIP original (so400m-patch14-384) | no disponible en esta busqueda | 384 / 14 | no disponible | apache-2.0 | repositorio oficial de Google |
| CLIP ViT-L/14 (OpenAI) | no disponible en esta busqueda | 224 / 14 | no disponible | licencia del repositorio original, consultar | repositorio de OpenAI |

Nota: los recuentos de parametros y las cifras de rendimiento de los modelos alternativos no se incluyen en la informacion proporcionada; se indican como "no disponible" para no introducir datos no verificados. La comparacion relevante en este caso es con el checkpoint oficial de Google, del que esta ficha es una copia republicada con los mismos pesos declarados.

## Limitaciones y advertencias

- Repositorio de terceros: el checkpoint lo publica el usuario CollectionStudio, no Google. No hay garantia de que los pesos sean identicos byte a byte a los del repositorio oficial google/siglip2-so400m-patch14-384; para produccion conviene usar la version oficial.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente del repositorio.
- Metadatos anomalos: la fecha de creacion registrada (2026-10-07) es posterior a la fecha habitual de publicacion de SigLIP 2, lo que sugiere un error de metadatos o una subida no convencional; conviene tratarla con cautela.
- No genera texto: es un encoder de contraste; no puede responder preguntas, redactar ni mantener conversaciones por si mismo. Cualquier uso generativo requiere un decodificador externo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion incorrecta cuando las etiquetas candidatas son ambiguas, muy similares entre si o estan fuera de la distribucion de entrenamiento (falsos positivos con puntuaciones altas).
- Sesgos: entrenado sobre WebLI, un corpus extraido de la web; cabe esperar sesgos de representacion geografica, cultural, de genero y de idioma propios de los datos rastreados, con peor rendimiento en conceptos poco frecuentes o infrarepresentados.
- Idiomas: aunque el paper se presenta como multilingue, la informacion disponible no detalla la cobertura linguistica ni la longitud maxima de texto, por lo que no se puede garantizar un comportamiento uniforme entre idiomas.
- Dependencia de la resolucion: el checkpoint esta fijado a 384x384 y parches de 14; textos de etiqueta muy largos o imagenes con detalles finos pueden degradar la precision.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el archivo de atribucion; no impone restricciones de uso adicionales conocidas en la informacion disponible.
- Caveat de produccion: al ser un modelo de solo inferencia multimodal, el coste computacional por imagen es notable (729 tokens de parche a 384x384); en lotes grandes conviene medir latencia real antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip2-so400m-patch14-384
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Paper de WebLI: https://arxiv.org/abs/2209.06794
- Checkpoint oficial de Google: https://huggingface.co/google/siglip2-so400m-patch14-384
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Tabla de evaluacion citada en la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/sg2-blog/eval_table.png
