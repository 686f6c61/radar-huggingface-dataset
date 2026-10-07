# CollectionStudio/siglip-so400m-patch14-384

## Resumen

SigLIP so400m-patch14-384 es un modelo de vision-lenguaje de tipo dual-encoder (imagen y texto) que aprende un espacio de embeddings conjunto donde cada par imagen-texto se puntua de forma independiente. Fue desarrollado por el equipo de Google Research dentro del trabajo "Sigmoid Loss for Language Image Pre-Training" (Zhai et al., 2023), y su arquitectura visual es la SoViT-400m descrita en "Getting ViT in Shape: Scaling Laws for Compute-Optimal Model Design" (Alabdulmohsin et al., 2023). La ficha que se analiza aqui es una reproduccion subida por el usuario CollectionStudio bajo el identificador `CollectionStudio/siglip-so400m-patch14-384`, con 0 descargas y 0 likes en el momento de la consulta, y un peso en safetensors de 877.960.498 parametros (3,5 GB de repositorio).

El problema que resuelve es el de la alineacion imagen-texto a escala: SigLIP sustituye la softmax contrastiva de CLIP por una funcion de perdida sigmoide que opera unicamente sobre cada par imagen-texto, sin necesidad de una normalizacion global sobre todas las similitudes del lote. Esto permite escalar el tamano de batch sin degradar el rendimiento y mejora los resultados cuando los lotes son pequenos. El modelo trabaja a 384x384 pixeles con parches de 14x14 y un codificador de texto con secuencias rellenadas a 64 tokens.

Su relevancia actual es la de ser uno de los codificadores imagen-texto abiertos mas utilizados como bloque base en pipelines multimodales: clasificacion zero-shot, recuperacion imagen-texto, filtrado y curado de datasets, generacion de embeddings para busqueda visual y como componente de sistemas mayores (por ejemplo, en arquitecturas tipo PaliGemma). La licencia Apache-2.0 facilita su integracion comercial, aunque conviene verificar la procedencia de esta copia concreta antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-encoder (ViT + codificador de texto) con perdida sigmoide; vision SoViT-400m, parches de 14x14, resolucion de entrada 384x384 |
| Parametros totales | 877.960.498 (dato real de los safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Texto: 64 tokens (rellenado a longitud fija, segun la model card). Vision: 384x384 con parches de 14x14, equivalente a 729 parches mas el token de clase |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni cuantizaciones documentadas por el autor |
| Idiomas soportados | No disponible (la model card no detalla la cobertura idiomatica del codificador de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3,5 GB de repositorio) |

## Arquitectura y entrenamiento

SigLIP es un modelo multimodal dual-encoder: una torre de vision basada en Vision Transformer y una torre de texto basada en transformer, ambas proyectadas a un espacio comun mediante cabezas lineales. La innovacion central frente a CLIP es la perdida: en lugar de normalizar con softmax las similitudes de todo el lote (que exige una vista global de la matriz de pares), se aplica una sigmoide elemento a elemento sobre cada par imagen-texto positivo y negativo. Esto elimina la necesidad de sincronizar la matriz completa entre dispositivos, permite aumentar el batch y ofrece mejor comportamiento con lotes pequenos. La variante so400m corresponde a la arquitectura SoViT-400m, una version de ViT optimizada en forma (relacion entre profundidad, anchura y numero de cabezas) mediante leyes de escala para un presupuesto de computo dado.

El preentrenamiento se realizo sobre el dataset WebLI (Chen et al., 2023). Las imagenes se redimensionan a 384x384 y se normalizan por canal RGB con media (0,5, 0,5, 0,5) y desviacion tipica (0,5, 0,5, 0,5); los textos se tokenizan y se rellenan a 64 tokens. El computo declarado en la model card es de 16 chips TPU-v4 durante tres dias. No se documenta en la informacion proporcionada ninguna fase de RLHF, DPO ni ajuste por instrucciones: el modelo es un codificador preentrenado, no un generador de texto. Tampoco se detalla la composicion linguistica del corpus WebLI ni el numero exacto de pares imagen-texto utilizados.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar etiquetas textuales arbitrarias a una imagen y obtener una probabilidad por etiqueta mediante la sigmoide de la similitud.
- Recuperacion imagen-texto y texto-imagen: busqueda semantica sobre un indice de embeddings, tanto con consulta textual como con imagen de referencia.
- Generacion de embeddings multimodales: las representaciones de imagen y de texto pueden extraerse por separado y almacenarse en un indice vectorial para busqueda de similitud.
- Filtrado y curado de datasets: puntuar pares imagen-texto para descartar correspondencias ruidosas antes del entrenamiento de modelos generativos.
- Deteccion zero-shot de contenido: clasificar imagenes en categorias definidas por texto sin reentrenar, util para moderacion preliminar.
- Base para modelos multimodales generativos: se usa habitualmente como torre de vision en arquitecturas que anaden un decodificador de lenguaje.
- Capacidad de tool calling: no aplicable, no es un modelo de lenguaje generativo.
- Capacidad de agentes o razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo de pensamiento, vision temporal, audio o video: no disponibles; la entrada es una imagen estatica a 384x384.

## Casos de uso

- Busqueda visual en catalogos de producto: indexar los embeddings de imagen de un catalogo de comercio electronico y permitir consultas en lenguaje natural ("camiseta azul de manga corta"). El modelo es adecuado porque produce representaciones comparables entre modalidades en un unico espacio vectorial.
- Etiquetado automatico de imagenes a escala: generar etiquetas candidatas por texto y quedarse con las que superan un umbral de probabilidad, reduciendo el trabajo manual previo a un pipeline de anotacion.
- Curado de datasets de entrenamiento: puntuar pares imagen-texto de un corpus web y eliminar los que presentan baja similitud, mejorando la calidad del material con el que se entrena un modelo generativo posterior.
- Moderacion de contenido de primera linea: definir categorias textuales de contenido no permitido y usarlas como clasificador zero-shot para filtrar subidas antes de una revision humana. Al ser un modelo de similitud y no generativo, no produce texto libre y su salida es una probabilidad acotada entre 0 y 1.
- Recuperacion aumentada multimodal: almacenar embeddings de figuras, capturas o diagramas de documentacion tecnica y recuperarlos mediante consultas textuales dentro de un asistente interno.
- Deduplicacion y agrupacion de imagenes: usar la similitud entre embeddings de imagen para detectar duplicados casi identicos o agrupar visualmente un archivo fotografico.
- Clasificacion con vocabulario cambiante: cuando las categorias no son fijas y cambian con frecuencia, el enfoque zero-shot evita reentrenar un clasificador cada vez que se anade o elimina una etiqueta.
- Tuberias de generacion de imagen condicionada por texto: emplear el codificador de texto del modelo como componente de alineacion o evaluacion en sistemas de sintesis de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del autor remite a una figura comparativa extraida del paper de SigLIP frente a CLIP, pero no incluye cifras concretas de MMLU, ImageNet zero-shot, COCO retrieval ni de ninguna otra tarea, y la busqueda web realizada no devolvio resultados tecnicos relacionados con el modelo. Por tanto, no se reproducen numeros que no puedan verificarse.

| Benchmark | Resultado |
|---|---|
| Clasificacion zero-shot (ImageNet y similares) | No disponible |
| Recuperacion imagen-texto (COCO, Flickr30k) | No disponible |
| Comparativa numerica frente a CLIP | No disponible (la model card solo incluye una imagen de tabla del paper, sin cifras en texto) |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 3,5 GB solo de pesos mas activaciones; en fp16 o bf16, del orden de 1,8 GB de pesos; en int8, alrededor de 0,9 GB. Son estimaciones calculadas a partir de los 877.960.498 parametros declarados, no mediciones publicadas por el autor.
- GPU de datacenter recomendadas: A100, H100 o L40S para procesamiento por lotes de alto volumen o para servir embeddings a gran escala.
- GPU de consumo: el modelo cabe sin problema en tarjetas de consumo con 8 GB o mas de VRAM en precision reducida, incluidas RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090. En fp32 tambien es viable en GPUs de 12 GB o mas.
- CPU: es posible ejecutar la inferencia en CPU con PyTorch, aunque el rendimiento por imagen sera sensiblemente inferior; util para pruebas o volumenes bajos.
- Opciones de despliegue: `transformers` con `AutoModel` y `AutoProcessor`, y el pipeline `zero-shot-image-classification`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible y no deberia asumirse.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamano de lote y del numero de etiquetas candidatas evaluadas por imagen.
- Consideracion de memoria: la memoria de activaciones escala con el numero de etiquetas de texto evaluadas simultaneamente, ya que cada etiqueta requiere una codificacion de texto propia.

## Comparativa con modelos similares

Los valores de esta tabla para modelos distintos del analizado son aproximados y proceden de conocimiento general sobre esas arquitecturas, no de la informacion proporcionada en esta consulta; deben verificarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Resolucion / contexto | Perdida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/siglip-so400m-patch14-384 | 877.960.498 | 384x384, texto a 64 tokens | Sigmoide | Apache-2.0 | Repositorio con 0 descargas, 0 likes |
| google/siglip-so400m-patch14-384 | Orden de 878 M (misma arquitectura SoViT-400m) | 384x384, texto a 64 tokens | Sigmoide | Apache-2.0 | Modelo de referencia del equipo original |
| CLIP ViT-L/14 336px | Aproximadamente 428 M | 336x336, texto a 77 tokens | Softmax contrastiva | Licencia abierta del repositorio original | Ampliamente desplegado, ecosistema maduro |
| SigLIP base patch16 224 | Aproximadamente 200 M | 224x224, patch 16 | Sigmoide | Apache-2.0 | Variante mas ligera de la misma familia |

En la misma categoria, la eleccion entre SigLIP y CLIP suele decidirse por la disponibilidad de pesos, el soporte en el framework de despliegue y el rendimiento medido en la tarea concreta, no solo por el numero de parametros.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena sobre WebLI, un corpus web; por tanto, hereda los sesgos de representacion de ese material en cuanto a genero, etnia, profesion y geografia. La model card no incluye ninguna evaluacion de sesgo.
- Alucinacion: al no ser un modelo generativo, no produce texto libre, pero si puede asignar probabilidades altas a etiquetas incorrectas. Sus salidas deben interpretarse como similitudes calibradas de forma aproximada, no como hechos verificados.
- Limite de longitud de texto: el codificador de texto trabaja con secuencias de 64 tokens; descripciones o consultas mas largas se truncaran o perderan informacion.
- Resolucion fija: la entrada de imagen se redimensiona a 384x384, lo que penaliza la lectura de texto pequeno o detalles finos en imagenes de alta resolucion.
- Idiomas: no hay informacion sobre la cobertura idiomatica del codificador de texto; conviene validar con datos propios antes de desplegarlo en un idioma concreto.
- Licencia: Apache-2.0 es permisiva y permite uso comercial, pero corresponde a la publicacion original. Esta copia concreta ha sido subida por un tercero y no se acompana de verificacion de integridad ni de procedencia de los pesos.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado. La fecha de creacion registrada en la ficha es posterior a la fecha de consulta habitual, lo que sugiere metadatos poco fiables.
- Uso en produccion: al ser un modelo de embeddings, requiere infraestructura adicional (indice vectorial, umbrales de decision, almacenamiento de vectores) que no viene incluida. Los umbrales de probabilidad deben calibrarse por caso de uso.
- Sin datos de rendimiento publicados en la informacion disponible: cualquier decision de adopcion deberia basarse en una evaluacion propia con el conjunto de datos objetivo.

## Enlaces

- Ficha en HuggingFace del repositorio analizado: https://huggingface.co/CollectionStudio/siglip-so400m-patch14-384
- Modelo de referencia del equipo original: https://huggingface.co/google/siglip-so400m-patch14-384
- Paper "Sigmoid Loss for Language Image Pre-Training": https://arxiv.org/abs/2303.15343
- Paper "Getting ViT in Shape: Scaling Laws for Compute-Optimal Model Design": https://arxiv.org/abs/2305.13035
- Paper del dataset WebLI: https://arxiv.org/abs/2209.06794
- Repositorio de codigo big_vision de Google Research: https://github.com/google-research/big_vision
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Documentacion de CLIP en transformers (referencia comparativa): https://huggingface.co/docs/transformers/model_doc/clip
- Busqueda web realizada: los resultados obtenidos no guardan relacion con el modelo (contenido sobre brokerage de yates y ofertas de empleo), por lo que no aportan enlaces tecnicos utilizables.
