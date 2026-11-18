# alphaedge-ai/siglip2-giant-opt-patch16-384-aze-16384

## Resumen

`siglip2-giant-opt-patch16-384-aze-16384` es una variante podada del codificador vision-lenguaje SigLIP 2 de Google, publicada por el usuario `alphaedge-ai`. Se trata de un modelo de embedding multimodal (imagen y texto) especializado en azerbaiyano mediante la tecnica de *trimming* de vocabulario: se ha reducido el vocabulario del tokenizador original de 256.000 a 16.384 tokens, conservando unicamente los mas frecuentes en ese idioma. El resultado es una reduccion del 93,60% en el tamano del vocabulario y del 14,75% en el numero de parametros totales (de 1.871.885.426 a 1.595.847.794).

El modelo hereda la arquitectura SigLIP 2 (ViT con atencion tipo sigmoide para el emparejamiento imagen-texto) en su variante "giant" con parches de 16x16 y resolucion de entrada de 384x384. Al ser un encoder y no un modelo generativo, su funcion principal es producir embeddings alineados entre imagenes y textos, lo que lo hace adecuado para clasificacion zero-shot de imagenes, busqueda multimodal y similitud texto-imagen. La poda del vocabulario reduce el peso en disco y en memoria, a costa de perder cobertura en idiomas distintos del azerbaiyano.

Es relevante para desarrolladores que necesiten un codificador multimodal compacto y ligero para despliegues en azerbaiyano, donde el modelo original de 256.000 tokens resulta sobredimensionado. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El modelo tiene un uso muy limitado (16 descargas, 0 likes) y no se han publicado evaluaciones propias en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (ViT, atencion sigmoide imagen-texto), variante giant, patch 16, resolucion 384 |
| Parametros totales | 1.595.847.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | azerbaiyano (`az`); el resto de idiomas puede degradarse por la poda de vocabulario |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/siglip2-giant-opt-patch16-384`, un codificador vision-lenguaje de la familia SigLIP 2 descrita en el paper arXiv:2502.14786 (Tschannen et al., 2025). SigLIP 2 combina un encoder de imagenes tipo Vision Transformer con un encoder de texto y se entrena con una funcion de perdida sigmoide en lugar de softmax contrastivo, lo que mejora la eficiencia del entrenamiento y la calidad de los embeddings. La variante "giant" con parches de 16 y entrada de 384x384 es la configuracion de mayor capacidad de la familia.

La modificacion respecto al original es puramente de vocabulario: se aplico la tecnica de *trimming* documentada en el blog de Hugging Face "Introduction to Trimming". Para seleccionar los tokens a conservar se utilizaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, filtrando el vocabulario a los 16.384 tokens mas relevantes para el azerbaiyano. No se realizo un reentrenamiento completo del modelo; los pesos de las capas de embedding y de salida se recortan a las dimensiones del nuevo vocabulario. No se documentan detalles sobre datos de entrenamiento adicionales, RLHF ni ajuste fino especifico para el idioma.

## Capacidades

- Generacion de embeddings de imagen y de texto alineados en un espacio comun.
- Clasificacion zero-shot de imagenes mediante etiquetas candidatas en azerbaiyano.
- Similitud texto-imagen (retrieval y ranking) con `sentence-transformers`.
- Busqueda multimodal imagen-a-texto y texto-a-imagen.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al azerbaiyano por la poda de vocabulario.
- Modo thinking, vision generativa, audio: no disponible (solo produce embeddings).

## Casos de uso

- Clasificacion zero-shot de imagenes en azerbaiyano: se pasan etiquetas candidatas en ese idioma al pipeline `zero-shot-image-classification` y el modelo devuelve la probabilidad de cada etiqueta, util para moderacion de contenido o etiquetado automatico de catalogos.
- Busqueda visual en comercio electronico: indexar embeddings de imagenes de producto y permitir consultas en lenguaje natural en azerbaiyano, con un modelo mas ligero que el original gracias a la reduccion del 14,75% de parametros.
- Deduplicacion y agrupamiento de imagenes: generar embeddings y aplicar similitud coseno para detectar imagenes duplicadas o casi duplicadas en grandes repositorios.
- Filtrado de contenido en plataformas locales: clasificar imagenes subidas por usuarios contra categorias predefinidas en azerbaiyano, con un footprint de memoria menor que el modelo base.
- Sistemas de recomendacion multimodal: combinar embeddings de imagen y texto para sugerir productos o articulos relacionados en un catalogo en azerbaiyano.
- Anotacion asistida de datasets: preetiquetar imagenes con categorias en azerbaiyano para acelerar el trabajo de anotacion humana en proyectos de vision por computador locales.
- Investigacion en eficiencia de modelos: servir como caso de estudio de *trimming* de vocabulario aplicado a un encoder multimodal, comparando calidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni zero-shot accuracy, ni retrieval, ni comparaciones con el modelo original) mas alla de las estadisticas de tamano y vocabulario.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 6,4 GB solo para pesos (coincide con el tamano del repo); en fp16/bf16 se reduce a unos 3,2 GB.
- VRAM estimada en int8: alrededor de 1,6 GB; en int4, en torno a 0,8-1 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en fp16 (RTX 3060, RTX 4060, T4); para lotes grandes se recomienda A10G, L4 o A100.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores con cuantizacion o fp16.
- Opciones de despliegue: `transformers` (pipeline `zero-shot-image-classification`), `sentence-transformers`, y servidores de embeddings compatibles con sentence-transformers. No se documenta soporte especifico para vLLM, TGI o llama.cpp (este ultimo no aplica a un encoder de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-giant-opt-patch16-384-aze-16384 | 1.595.847.794 | 16.384 | azerbaiyano | Apache 2.0 | Version podada del giant |
| google/siglip2-giant-opt-patch16-384 | 1.871.885.426 | 256.000 | multilingue | Apache 2.0 | Modelo base original |
| google/siglip2-so400m-patch14-384 | no disponible en la informacion | no disponible | multilingue | Apache 2.0 | Variante de menor capacidad de la familia SigLIP 2 |
| openai/clip-vit-large-patch14 | no disponible en la informacion | no disponible | ingles principalmente | MIT | Alternativa clasica de encoder vision-lenguaje |

## Limitaciones y advertencias

- La poda de vocabulario elimina tokens no frecuentes en azerbaiyano, por lo que el rendimiento en otros idiomas puede degradarse significativamente respecto al modelo original.
- No se han publicado evaluaciones que cuantifiquen la perdida de calidad frente a `google/siglip2-giant-opt-patch16-384`; la afirmacion de la model card de que "deberia rendir de forma similar" no esta respaldada con metricas.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2 (sesgos de genero, raza y cultura en las imagenes y textos de preentrenamiento), no evaluados en esta version.
- Al ser un encoder de similitud, no genera texto ni razona; no debe usarse como modelo conversacional ni para tareas generativas.
- El modelo tiene un uso muy bajo (16 descargas, 0 likes) y no cuenta con validacion de la comunidad; conviene evaluarlo en el dominio concreto antes de llevarlo a produccion.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base de Google.
- No se documentan limitaciones de contexto ni de resolucion mas alla de la entrada de 384x384.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-giant-opt-patch16-384-aze-16384
- Modelo base: https://huggingface.co/google/siglip2-giant-opt-patch16-384
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Imagen de estadisticas del modelo: https://raw.githubusercontent.com/lbourdois/blog/refs/heads/master/assets/images/Trimming/siglip2-giant-opt-patch16-384-16384.png
