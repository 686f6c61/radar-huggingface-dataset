# nebulette/puro-2b-contrastive

## Resumen

Puro 2B-C es un modelo de codificación de texto contrastivo desarrollado por nebulette, diseñado para servir como codificador de texto en sistemas de generación de imagen a partir de texto (T2I). Se basa en el modelo Puro-2B-Base, un transformer decoder-only de aproximadamente 2 mil millones de parámetros entrenado desde cero por Poor Lab, y lo adapta para tareas de modelado de lenguaje enmascarado y generación de embeddings de similitud. El modelo es capaz de procesar tanto descripciones en lenguaje natural como listas de etiquetas separadas por comas (estilo booru), produciendo representaciones vectoriales que preservan la semántica subyacente.

La relevancia de este modelo radica en su enfoque "fully-open" y "open-recipe": el entrenamiento se realizó con datos públicos y el código está disponible, lo que permite a otros investigadores reproducir y adaptar la metodología. Además, al estar especializado en dominios de anime, furry y arte, ofrece una alternativa a los codificadores de texto genéricos para modelos T2I que requieren comprensión de vocabulario específico de booru. La versión actual es una beta, y el autor indica que la versión LFM2.5 (lfm-350m-contrastive) es más avanzada, aunque Puro 2B-C utiliza una dimensión oculta mayor (2048).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptado de Puro-2B-Base, decoder-only convertido a encoder para MLM) |
| Parametros totales | no disponible (aproximadamente 2B, basado en Puro-2B-Base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de Puro-2B-Base, un transformer decoder-only de ~2B parametros entrenado desde cero con hasta 1,4 billones de tokens usando FP8 por bloques en GPUs RTX 5090 de consumo. La arquitectura sigue el diseño de Qwen3-1.7B, con la diferencia de que las embeddings de entrada y la cabeza de salida no estan atadas. Para este modelo contrastivo, nebulette lo adapta como un codificador de texto: se entrena con una perdida de modelado de lenguaje enmascarado (ForMaskedLM) para predecir los logits detras de los tokens `<|mask|>`, y ademas se generan embeddings de similitud para texto en lenguaje natural y texto separado por comas, mediante un token especial para la embedding agrupada (pooled embedding).

El entrenamiento se realizo en varias fases. Primero, con una tasa de aprendizaje baja, se inicializo el modelo usando captions en lenguaje natural de CC (generadas con Moondream) y Danbooru (generadas con Qwen3.5). Posteriormente, el modelo continuo aprendiendo con una combinacion de texto separado por comas y lenguaje natural. Se eliminaron las stop words en ingles de los captions, y las keywords separadas por comas fueron barajadas y ajustadas. Los nombres de artistas (nombres dados, apodos y nombres de fantasia) se excluyeron deliberadamente del dataset, ya que seria dificil predecirlos solo a partir del texto. Se aplicaron los tags parcheados de Grio al dataset de Danbooru para mayor precision, y se incluyeron otros sitios booru. El tokenizer se mantuvo sin cambios respecto al modelo base.

## Capacidades

- Prediccion de logits para tokens enmascarados (`<|mask|>`), lo que permite tareas de completado de texto en el dominio de captions.
- Generacion de embeddings de similitud (pooled embeddings) tanto para lenguaje natural como para listas de etiquetas separadas por comas, preservando la representacion semantica.
- Comprension de captions estilo booru (Danbooru, e621, Gelbooru) y de descripciones en lenguaje natural, gracias al entrenamiento mixto.
- Salida de embeddings que pueden ser utilizados como entrada para modelos T2I compatibles, facilitando el emparejamiento texto-imagen.
- No es un modelo generativo de texto; su funcion es exclusivamente de codificacion y extraccion de caracteristicas.

## Casos de uso

- Generacion de imagen a partir de texto (T2I): el modelo puede servir como codificador de texto en pipelines de difusion, convirtiendo prompts en embeddings que condicionan la generacion de imagenes anime o furry.
- Busqueda semantica de captions: permite indexar y recuperar imagenes por similitud semantica de sus descripciones, tanto en lenguaje natural como en formato de etiquetas.
- Filtrado y clasificacion de contenido: al producir embeddings, se puede usar para clasificar imagenes segun su contenido textual asociado, por ejemplo en sistemas de moderacion de sitios booru.
- Aumento de datos para T2I: puede generar representaciones de texto para datasets de entrenamiento, mejorando la comprension de vocabulario especifico de booru en otros modelos.
- Analisis de tendencias artisticas: al procesar captions de diferentes fuentes, se pueden agrupar por similitud para identificar estilos o temas recurrentes.
- Integracion en sistemas de recomendacion: los embeddings de texto pueden combinarse con embeddings de imagen para recomendar contenido similar en galerias o redes sociales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM o latencia para este modelo.
- Al estar basado en un modelo de aproximadamente 2B de parametros, se estima que puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM usando cuantizacion (por ejemplo, 8 bits), aunque no hay confirmacion oficial.
- Para inferencia sin cuantizacion, se recomendaria una GPU con 12 GB o mas de VRAM, como una RTX 3060 o superior.
- Dado que es un encoder (no generativo), el coste computacional por inferencia es menor que el de un decoder del mismo tamano.
- Opciones de despliegue: al ser un modelo de Hugging Face, puede cargarse con la libreria transformers, y potencialmente con vLLM o TGI si se adapta, aunque no se menciona soporte explicito.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El modelo es una adaptacion especifica de Puro-2B-Base para tareas contrastivas, y no se han encontrado alternativas directas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente con datos en ingles y vocabulario de booru (anime, furry, arte), por lo que su rendimiento en otros idiomas o dominios puede ser limitado.
- Los nombres de artistas fueron excluidos del dataset, por lo que el modelo no podra predecir ni representar correctamente referencias a artistas especificos.
- Al ser una version beta, puede haber errores o comportamientos suboptimos; el autor recomienda la version LFM2.5 como mas avanzada.
- No es un modelo generativo: no puede producir texto, solo embeddings y logits enmascarados.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los datos de entrenamiento (provenientes de fuentes como Danbooru, e621, etc.) cumplan con sus respectivas licencias de uso.
- No se han publicado metricas de rendimiento ni evaluaciones formales, por lo que su calidad en tareas concretas no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebulette/puro-2b-contrastive
- Perfil del autor: https://huggingface.co/nebulette
- Modelo LFM2.5 (version mas avanzada): https://huggingface.co/nebulette/lfm-350m-contrastive
- Paper de Puro-2B: https://arxiv.org/abs/2608.27370
- Resumen del paper en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/puro-2b-poor-labs-qwen2-15b-trained
- Blog de kenashe.ai sobre Puro-2B: https://kenashe.ai/blog/2026-08-28-puro-2b-makes-small-model-pretraining-feel-operator-sized/
