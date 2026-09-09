# rf-rnd/french-me5-tsdae-radiofrance

## Resumen

french-me5-tsdae-radiofrance es un modelo de embeddings de frases en francés, desarrollado por el usuario rf-rnd mediante fine-tuning del modelo antoinelouis/french-me5-small. Se trata de un modelo BERT encoder-only con 35.924.352 parámetros, especializado en tareas de similitud semántica y extracción de características. El modelo ha sido entrenado con la técnica TSDAE (Denoising AutoEncoder Loss, arxiv:2104.06979) sobre un dataset de 79.968 muestras, que por el nombre del repositorio parece estar relacionado con contenidos de Radio France.

Este modelo resuelve el problema de obtener representaciones densas de oraciones en francés para tareas como búsqueda semántica, clasificación de textos o agrupación por similitud. Con solo 35 millones de parámetros, ofrece un tamaño muy reducido (0,1 GB) y puede desplegarse en entornos con recursos limitados. Al estar publicado en Hugging Face como sentence-transformers, es compatible con la librería homónima y con text-embeddings-inference.

La licencia no está especificada en la información disponible, lo cual constituye un factor de riesgo para su uso comercial o en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder-only (basada en antoinelouis/french-me5-small) |
| Parametros totales | 35.924.352 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre y modelo base se infiere frances) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder-only con la estructura típica de BERT. El modelo base antoinelouis/french-me5-small es un checkpoint de sentence-transformers orientado al francés. El fine-tuning se realizó con la función de pérdida DenoisingAutoEncoderLoss, característica de la técnica TSDAE (arxiv:2104.06979). Este método consiste en aplicar ruido a las oraciones, como eliminar o añadir tokens, y entrenar al encoder para reconstruir el documento original a partir de la representación, lo que mejora la calidad semántica de los embeddings.

El proceso de entrenamiento se identifica como "generated_from_trainer", lo que indica el uso de la librería sentence-transformers con su script de entrenamiento estándar. No se han proporcionado más detalles sobre el número total de tokens, la composición exacta del dataset ni la aplicación de técnicas de alineación como RLHF o DPO, ya que en los modelos de embeddings normalmente no se emplean.

## Capacidades

- Generacion de embeddings densos de frases en francés, adecuados para comparar similitud semántica.
- Extracción de características (feature extraction) para usar como entrada en modelos posteriores de clasificación o regresión.
- Compatible con la librería sentence-transformers y el servidor de inferencia text-embeddings-inference de Hugging Face.
- Capacidad básica de gestionar texto en francés, con un rendimiento esperado en dominios relacionados con la radiodifusión, la cultura y la actualidad, por el origen de los datos de entrenamiento.
- No soporta generación de texto, tool calling ni razonamiento multi-paso, al ser un modelo encoder.

## Casos de uso

- Búsqueda semántica en documentación interna de empresas francófonas: indexar manuales, informes y artículos con el modelo y recuperar los fragmentos relevantes mediante similitud de coseno.
- Atención al cliente automatizada: utilizar los embeddings para clasificar las consultas recibidas por correo o chat en distintos temas, y así enrutarlas al departamento adecuado.
- Deduplicación de artículos de prensa: comparar titulares y párrafos de noticias para detectar contenidos duplicados o muy similares en grandes volúmenes de texto.
- Recomendación de contenidos culturales: agrupar transcripciones de programas de radio o artículos de opinión según su temática para sugerir piezas relacionadas a los usuarios.
- Clasificación de sentimiento o polaridad: usar las representaciones como features para un clasificador ligero, por ejemplo, para analizar comentarios de oyentes o reseñas de productos.
- Sistema de preguntas y respuestas en francés: combinar el modelo con una base vectorial para localizar respuestas a partir de documentos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 35.924.352 parámetros. En FP32 ocupa aproximadamente 140 MB, más el overhead del framework.
- Para inferencia en CPU con sentence-transformers, el uso de memoria se mantiene por debajo de 1 GB y es viable incluso en máquinas sin GPU.
- En GPU cabe sobradamente en una NVIDIA RTX 3060 o superior; también es compatible con GPUs más antiguas como la GTX 1060.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference y Hugging Face Endpoints.
- No se dispone de datos medidos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas para modelos comparables de este tamaño. El modelo base antoinelouis/french-me5-small es la referencia directa, pero no se han publicado en la información disponible los valores de contexto ni las puntuaciones de rendimiento. Por tanto, no es posible realizar una comparativa con otros modelos de embeddings franceses como distiluse-base-multilingual-cased o multilingual-e5-small sin inventar datos.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre si su uso está permitido en proyectos comerciales o en despliegues públicos.
- Al estar entrenado con datos de Radio France, el modelo puede presentar sesgos relacionados con el estilo, la temática o la jerga de ese corpus, así como un rendimiento inferior en otros dominios.
- No se conoce la longitud de contexto, lo que limita su uso para documentos extensos sin truncamiento previo.
- Los embeddings se centran en el idioma francés; su funcionamiento en otros idiomas es probablemente deficiente.
- La presencia de ejemplos ruidosos en la model card sugiere que parte del dataset de entrenamiento contiene texto corrupto o irrelevante, lo que puede afectar a la robustez de las representaciones.
- No posee capacidades de generación de texto, interacción conversacional ni tool calling.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rf-rnd/french-me5-tsdae-radiofrance
- Paper de Sentence-BERT (arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de TSDAE (arxiv:2104.06979): https://arxiv.org/abs/2104.06979
- Modelo base en Hugging Face: https://huggingface.co/antoinelouis/french-me5-small
