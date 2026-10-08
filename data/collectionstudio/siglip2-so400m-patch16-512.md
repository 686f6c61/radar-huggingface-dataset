# CollectionStudio/siglip2-so400m-patch16-512

## Resumen

SigLIP 2 So400m (checkpoint `siglip2-so400m-patch16-512`) es un codificador vision-lenguaje de tipo dual encoder desarrollado por Google y republicado en HuggingFace por el usuario CollectionStudio. Se trata de la segunda generacion de la familia SigLIP: extiende el objetivo de preentrenamiento de SigLIP con tecnicas previas integradas en una unica receta, mejorando la comprension semantica, la localizacion y la calidad de las caracteristicas densas. El modelo resuelve tareas de clasificacion de imagen zero-shot, recuperacion imagen-texto y sirve como torre de vision para modelos vision-lenguaje (VLM).

El checkpoint tiene 1.136.555.698 parametros totales (aproximadamente 1,14 mil millones), con un repositorio de 4,6 GB en safetensors, lo que corresponde a pesos en precision completa (fp32). La nomenclatura `so400m` hace referencia al encoder de vision SoViT-400m; el desglose exacto de parametros entre la torre de vision y la torre de texto no esta disponible en la informacion proporcionada. La variante `patch16-512` procesa imagenes a 512x512 píxeles con parches de 16x16, lo que produce 1024 tokens visuales por imagen.

Es relevante ahora porque la familia SigLIP 2 esta disenada explicitamente como encoder multilingue y como bloque de vision reutilizable en pipelines multimodales, con licencia Apache 2.0, lo que facilita su uso comercial e integracion en produccion. No obstante, este repositorio concreto es una republicacion de terceros, con 0 descargas y 0 likes en el momento de la consulta, por lo que conviene verificar su procedencia frente a las publicaciones oficiales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder transformer (torre de vision ViT SoViT-400m + torre de texto), objetivo de contraste sigmoide |
| Parametros totales | 1.136.555.698 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; entrada de imagen fija de 512x512 con parches de 16x16) |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas oficiales; pesos originales en safetensors (fp32, ~4,6 GB). Conversiones a fp16/bf16/int8 no verificadas |
| Idiomas soportados | multilingue segun el titulo del paper de SigLIP 2; la lista concreta de idiomas no esta disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | zero-shot-image-classification |
| Libreria | transformers |
| Tamano del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

SigLIP 2 es un modelo de dos torres: un encoder de vision tipo ViT con atencion global y un encoder de texto transformer, entrenados conjuntamente con una perdida de contraste basada en sigmoide (en lugar del softmax usado por CLIP). Esta perdida permite entrenar sin normalizacion global del lote, lo que facilita el escalado del batch. La variante aqu descrita usa parches de 16x16 sobre entradas de 512x512, generando 1024 tokens de imagen por muestra.

Sobre la receta base de SigLIP, SigLIP 2 anade tres componentes segun la model card: (1) una perdida de decoder, (2) perdidas de prediccion global-local y enmascarada, y (3) adaptabilidad de relacion de aspecto y resolucion. El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023) y el computo ascendio a hasta 2048 chips TPU-v5e. No se trata de un modelo generativo, por lo que no hay fases de RLHF ni DPO; tampoco se documentan tecnicas de decodificacion especulativa ni atencion lineal en la informacion disponible. El detalle exacto del numero de tokens de entrenamiento, la composicion del dataset y el desglose de hiperparametros no estan disponibles.

## Capacidades

- Clasificacion de imagen zero-shot: asigna etiquetas de texto arbitrarias a una imagen sin entrenamiento adicional, mediante el pipeline `zero-shot-image-classification`.
- Recuperacion imagen-texto y texto-imagen: genera embeddings alineados de ambas modalidades para busqueda cruzada.
- Extraccion de embeddings de imagen: `get_image_features()` devuelve representaciones vectoriales reutilizables para clasificacion lineal, clustering, deduplicacion o sistemas de recomendacion.
- Encoder de vision para VLM: puede congelarse y acoplarse a un proyector y un modelo de lenguaje para construir asistentes multimodales.
- Localizacion y caracteristicas densas: el paper de SigLIP 2 declara mejoras en tareas de grounding y segmentacion respecto a la generacion anterior, aunque los resultados numericos no estan disponibles en esta ficha.
- Capacidad multilingue en la torre de texto, segun el titulo y el resumen del paper de SigLIP 2.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, audio ni video nativo.
- No dispone de modo "thinking" ni de plantillas de chat; no es un modelo conversacional.

## Casos de uso

- Catalogacion automatica de producto en comercio electronico: se definen las etiquetas como la taxonomia del catalogo (por ejemplo, "camiseta de algodon", "zapatilla deportiva") y el modelo clasifica imagenes nuevas sin reentrenamiento, lo que permite incorporar categorias nuevas cambiando solo los textos.
- Moderacion de contenido visual: uso de etiquetas descriptivas de contenido no permitido como candidatas en clasificacion zero-shot, con umbral de decision ajustable; al ser un modelo de contraste, el sistema no requiere anotaciones por politica.
- Deduplicacion y curaduria de datasets: extraccion de embeddings de imagen con `get_image_features()` e indexacion en FAISS o Annoy para detectar duplicados cercanos y filtrar datos antes de entrenar otros modelos.
- Busqueda visual en aplicaciones de e-commerce o archivo: indexacion de embeddings de imagen y consulta en lenguaje natural mediante la torre de texto, devolviendo los elementos mas similares.
- Construccion de un VLM ligero: congelar la torre de vision a 512x512, entrenar un proyector MLP y un LLM pequeno para obtener un asistente multimodal; los 1024 tokens por imagen encarecen la ventana del LLM, por lo que conviene valorar pooling o reduccion de tokens.
- Control de calidad industrial: descripcion textual de defectos ("pieza con rebaba", "superficie con rayado") como candidatas zero-shot para inspeccion en linea, con la ventaja de no necesitar ejemplos de cada defecto.
- Etiquetado asistido de datos medicos o cientificos: generacion de etiquetas preliminares sobre imagenes no anotadas para acelerar la revision humana, siempre con validacion posterior dado el riesgo de error del modelo.
- Filtrado previo en pipelines de generacion de imagen: clasificacion cero-shot de las salidas de un modelo generativo para descartar contenido fuera de politica antes de la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de la tabla de evaluacion extraida del paper de SigLIP 2 (`eval_table.png`), pero los valores concretos no estan accesibles en los datos proporcionados, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-7 GB en fp32 (pesos de 4,55 GB mas activaciones y batch), 2,5-4 GB en fp16/bf16, 1,5-2,5 GB en int8 y 1-1,5 GB en int4 (estas dos ultimas requieren conversion externa no verificada).
- GPU recomendadas para produccion: NVIDIA L4, A10G, A100 o H100 para alto throughput y lotes grandes; T4 (16 GB) es suficiente para inferencia en fp16.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070/4080/4090 son suficientes en fp16 con margen amplio; en GPUs de 4 GB (GTX 1650) solo con cuantizacion a int8/int4.
- Inferencia en CPU: viable para imagenes individuales, con latencia elevada; no recomendada para servicio con trafico concurrente.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime, NVIDIA TensorRT, Triton Inference Server. El soporte en vLLM y TGI para este checkpoint concreto no esta confirmado en la informacion disponible y debe verificarse por version. `llama.cpp` y Ollama no estan orientados a este tipo de modelo como clasificador independiente.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, cada imagen a 512x512 genera 1024 tokens para la torre de vision, lo que hace que el rendimiento este limitado por el ancho de banda de memoria en lotes pequenos.

## Comparativa con modelos similares

Los datos de esta tabla proceden del conocimiento general sobre la familia y no de los resultados de busqueda web, que no devolvieron informacion relevante. Las celdas no verificables se marcan como no disponibles.

| Modelo | Parametros totales | Parches / resolucion | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| CollectionStudio/siglip2-so400m-patch16-512 (este) | 1.136.555.698 | patch16, 512x512 | Apache 2.0 | multilingue (lista no disponible) | Republicacion de terceros, 0 descargas, 0 likes |
| google/siglip2-so400m-patch16-512 | no disponible | patch16, 512x512 | Apache 2.0 | multilingue (lista no disponible) | Checkpoint original referenciado en el codigo de la model card |
| google/siglip-so400m-patch14-384 | no disponible | patch14, 384x384 | Apache 2.0 | principalmente ingles | Generacion anterior (SigLIP 1), sin perdidas de decoder ni prediccion enmascarada |
| OpenAI CLIP ViT-L/14 | ~428 millones | patch14, 224x224 | MIT | principalmente ingles | Objetivo de contraste softmax; menor resolucion y sin adaptabilidad de aspecto |

## Limitaciones y advertencias

- Procedencia: este repositorio es una republicacion de CollectionStudio, sin descargas ni likes registrados y sin fecha de actualizacion posterior a la creacion. Para produccion se recomienda validar el hash de los pesos contra la publicacion oficial de Google antes de desplegar.
- Sesgos de datos: el preentrenamiento sobre WebLI (pares imagen-texto extraidos de la web) arrastra sesgos geograficos, demograficos y culturales, ademas de un sesgo hacia el ingles en las anotaciones.
- Alucinacion en etiquetado: en clasificacion zero-shot el modelo siempre devuelve una probabilidad para cada etiqueta candidata, incluso si ninguna corresponde. Es imprescindible fijar umbrales y validar con datos propios.
- Sensibilidad al prompt: el rendimiento depende criticamente de la redaccion de las etiquetas (plantillas, nivel de detalle, idioma). No se documentan plantillas oficiales para este checkpoint.
- Limitaciones de entrada: resolucion fija de 512x512 y 1024 tokens de imagen; no hay soporte nativo de video ni audio. La longitud maxima de la secuencia de texto de la torre de texto no esta disponible.
- Idiomas: aunque el paper de SigLIP 2 se presenta como multilingue, la lista concreta de idiomas soportados por este checkpoint no esta disponible, por lo que el rendimiento en castellano debe medirse localmente.
- Tareas no soportadas: no genera texto, no realiza razonamiento multi-paso, no soporta tool calling ni agentes. Cualquier caso de uso generativo requiere anadir un modelo de lenguaje.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al tratarse de una republicacion debe conservarse la atribucion y verificarse que el repositorio original mantiene la misma licencia.
- Sin datos de benchmarks ni de latencia publicados en la informacion disponible, no es posible dimensionar el coste de servicio sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip2-so400m-patch16-512
- Checkpoint original referenciado en el codigo de la model card: https://huggingface.co/google/siglip2-so400m-patch16-512
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Paper del dataset WebLI: https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Imagen de la tabla de evaluacion citada en la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/sg2-blog/eval_table.png
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente resultados no relacionados con SigLIP 2).
