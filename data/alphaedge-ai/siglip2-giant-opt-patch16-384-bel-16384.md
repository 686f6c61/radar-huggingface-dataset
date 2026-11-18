# alphaedge-ai/siglip2-giant-opt-patch16-384-bel-16384

## Resumen

`alphaedge-ai/siglip2-giant-opt-patch16-384-bel-16384` es una version recortada (trimmed) del encoder vision-lenguaje `google/siglip2-giant-opt-patch16-384` de Google, especializada en bielorruso mediante reduccion de vocabulario. El modelo original pertenece a la familia SigLIP 2, presentada en el paper arXiv:2502.14786, que combina un encoder de imagenes ViT con un encoder de texto para producir embeddings alineados en un espacio comun, orientados a tareas de recuperacion y clasificacion multimodal.

La modificacion aplicada por alphaedge-ai consiste en reducir el vocabulario del tokenizador de texto de 256.000 a 16.384 tokens (una reduccion del 93,60%), conservando los tokens mas frecuentes en bielorruso segun un proceso de minado sobre 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. Como consecuencia, el modelo pasa de 1.871.885.426 a 1.595.847.794 parametros, un 14,75% menos, con un repo de 6,4 GB en safetensors.

Es relevante para desarrolladores que necesiten un encoder multimodal SigLIP 2 de gran tamano con menor huella de memoria y enfocado a contenido en bielorruso, por ejemplo en sistemas de recuperacion imagen-texto, moderacion de contenido visual o clasificacion zero-shot en ese idioma. La contrapartida es la perdida de cobertura multilingue del modelo original, ya que los tokens eliminados no se recuperan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (encoder de vision ViT + encoder de texto tipo transformer, alineados por contraste) |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en el formato original) |
| Idiomas soportados | bielorruso (be) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Vocabulario | 16.384 tokens (original: 256.000) |
| Patch de vision | 16 x 16, resolucion 384 x 384 |
| Libreria | sentence-transformers / transformers |
| Pipeline | zero-shot-image-classification |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 del modelo base de Google: un encoder de imagenes basado en Vision Transformer con parches de 16x16 a resolucion 384x384 y un encoder de texto que proyecta ambas modalidades a un espacio de embeddings compartido mediante un objetivo de aprendizaje contrastivo tipo sigmoide (SigLIP). La variante "giant" del modelo original es la de mayor tamano de la familia. SigLIP 2 anade respecto a SigLIP original mejoras en comprension semantica multilingue, localizacion y caracteristicas densas, segun el paper arXiv:2502.14786.

El proceso de trimming aplicado por alphaedge-ai no reentrena el modelo: parte de los pesos del modelo base y recorta la matriz de embeddings del tokenizador de texto, eliminando las filas correspondientes a los tokens menos frecuentes en bielorruso. La seleccion de tokens se hizo minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming`. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo original ni sobre si se aplico una fase de ajuste posterior al recorte; la model card no lo indica.

## Capacidades

- Generacion de embeddings de imagen y de texto alineados en un espacio comun, aptos para similitud coseno.
- Clasificacion zero-shot de imagenes mediante comparacion con etiquetas candidatas en lenguaje natural.
- Recuperacion imagen-texto y texto-imagen (image retrieval, text retrieval).
- Calculo de similitudes texto-imagen por lotes con `sentence-transformers`.
- Soporte de `pipeline` de transformers para `zero-shot-image-classification`.
- Capacidad multilingue limitada al bielorruso tras el recorte de vocabulario; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- No es un modelo generativo: no produce texto libre, no hace tool calling ni razonamiento multi-paso.

## Casos de uso

- Clasificacion zero-shot de imagenes en bielorruso: etiquetar automaticamente un catalogo de imagenes con categorias descritas en bielorruso sin entrenamiento adicional, usando el pipeline de transformers con etiquetas candidatas.
- Busqueda visual en bielorruso: indexar un corpus de imagenes por sus embeddings y recuperar las mas similares a una consulta textual en bielorruso, por ejemplo en un buscador interno de una biblioteca digital.
- Moderacion de contenido visual con taxonomia en bielorruso: definir categorias de contenido y puntuar imagenes por similitud con cada etiqueta, aprovechando que el modelo trabaja sin ejemplos etiquetados.
- Deduplicacion y agrupacion de imagenes: generar embeddings de imagen y agrupar por similitud para detectar duplicados o near-duplicates en un repositorio, con menor huella de memoria que el modelo original.
- Filtrado de datasets multimodales: puntuar pares imagen-texto en bielorruso por similitud para descartar pares mal alineados antes de entrenar otros modelos.
- Sistemas de recomendacion visual: calcular embeddings de imagenes de producto y de descripciones en bielorruso para recomendar articulos similares en una tienda online.
- Anotacion asistida: preetiquetar imagenes con categorias en bielorruso para revision humana posterior, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta estadisticas de tamano (vocabulario y parametros) y no incluye metricas de rendimiento (ImageNet zero-shot, retrieval, etc.) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones; en la practica se recomienda al menos 12-16 GB.
- En bf16/fp16: alrededor de 3,2 GB para pesos, con margen para activaciones; cabe en GPUs consumer de 8 GB o mas.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y produccion; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para desarrollo y despliegues de tamano medio.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16, y en 6-8 GB con cuantizacion (aunque no se documentan pesos cuantizados oficiales en el repo).
- Opciones de despliegue: `transformers` (pipeline), `sentence-transformers`, servidores de embeddings compatibles con sentence-transformers; no se documenta soporte especifico para vLLM, TGI o llama.cpp en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-bel-16384 | 1.595.847.794 | 16.384 | bielorruso | Apache 2.0 | no disponible | Version trimmed del giant de SigLIP 2 |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | multilingue | Apache 2.0 | no disponible | Modelo base original, mayor huella |
| google/siglip2-so400m-patch14-384 | no disponible | no disponible | multilingue | Apache 2.0 | no disponible | Variante menor de SigLIP 2, menor coste |
| google/siglip-base-patch16-224 | no disponible | no disponible | ingles | Apache 2.0 | no disponible | Generacion anterior, menor calidad |

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no frecuentes en bielorruso; el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo base.
- No se han publicado evaluaciones que confirmen que el rendimiento en bielorruso se mantiene igual que en el modelo original; la model card solo afirma que "deberia" comportarse de forma similar.
- Es un modelo de embeddings, no generativo: no responde preguntas ni genera texto; su uso esta limitado a similitud y clasificacion.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2, no documentados en esta ficha.
- El proceso de minado uso 200.000 textos de fineweb-2; la cobertura lexica del bielorruso puede ser incompleta para dominios especializados (medico, legal, tecnico).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de minado.
- Modelo con muy pocas descargas (4) y sin likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.
- No se documentan pesos cuantizados oficiales; la cuantizacion requeriria conversion manual y validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-bel-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
