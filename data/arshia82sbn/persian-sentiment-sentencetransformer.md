# Arshia82sbn/Persian-Sentiment-SentenceTransformer

## Resumen

El modelo **Persian-Sentiment-SentenceTransformer** es un *sentence transformer* desarrollado por Arshia Saberian (usuario `Arshia82sbn`), un ingeniero de IA especializado en procesamiento de lenguaje natural en persa e inglés. Se trata de un ajuste fino (*fine-tuning*) del modelo base `heydariAI/persian-embeddings`, que a su vez está construido sobre una arquitectura XLM-RoBERTa. El modelo mapea frases y párrafos en persa a un espacio vectorial denso de 1024 dimensiones, optimizado para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación de texto y *clustering*.

La relevancia de este modelo radica en que cubre una necesidad específica del ecosistema NLP en persa, un idioma con menos recursos que el inglés. Al estar basado en XLM-RoBERTa, hereda capacidades multilingües del modelo original, aunque el ajuste se ha realizado específicamente para texto persa. El entrenamiento se llevó a cabo con un *dataset* de 315 000 muestras y una función de pérdida de clasificación *softmax*, lo que sugiere que el modelo está orientado a tareas de clasificación de sentimiento, como indica su nombre.

El modelo tiene una longitud máxima de secuencia de 512 *tokens* y una dimensionalidad de salida de 1024, con *pooling* por media de *tokens*. A pesar de su reducido número de descargas (18) y de no contar con una licencia declarada, su publicación en Hugging Face lo hace accesible para desarrolladores que trabajen con NLP en persa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (modelo base: `heydariAI/persian-embeddings`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | persa (inferido por el nombre y el dataset; no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un *transformer* multilingüe preentrenado, y utiliza un *pooling* por media de *tokens* para generar embeddings de frases. La estructura completa, tal como se describe en la *model card*, es un `SentenceTransformer` que envuelve un `XLMRobertaModel` con `max_seq_length=512` y un módulo de *pooling* con `pooling_mode_mean_tokens=True`. La salida es un vector de 1024 dimensiones y la similitud se calcula mediante coseno.

El entrenamiento consistió en un ajuste fino del modelo base `heydariAI/persian-embeddings` utilizando la librería `sentence-transformers`. Según las *tags* de Hugging Face, se empleó una función de pérdida `SoftmaxLossClassification` y un *dataset* de 315 000 muestras. No se especifican detalles sobre el número de *tokens* de entrenamiento, la composición del *dataset* ni si se aplicaron técnicas como RLHF o DPO. El *notebook* de entrenamiento está disponible en Kaggle, lo que permite reproducir el proceso, aunque no se detallan innovaciones técnicas más allá del ajuste estándar.

## Capacidades

- Generación de *embeddings* densos de 1024 dimensiones para frases y párrafos en persa.
- Similitud semántica entre textos, mediante similitud coseno.
- Búsqueda semántica y recuperación de información en corpus persas.
- Minería de paráfrasis y detección de duplicados.
- Clasificación de texto, incluyendo análisis de sentimiento (por el nombre y la pérdida de clasificación).
- *Clustering* de documentos por similitud semántica.
- No soporta *tool calling*, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- **Análisis de sentimiento en reseñas de productos**: el modelo puede clasificar opiniones en persa (positivas, negativas, neutrales) a partir de reseñas de comercio electrónico, gracias a su entrenamiento con pérdida de clasificación y su capacidad para generar representaciones semánticas.
- **Búsqueda semántica en documentación técnica**: permite indexar documentos persas y recuperar los más relevantes mediante consultas en lenguaje natural, usando los *embeddings* generados.
- **Moderación de comentarios en redes sociales**: al clasificar el tono de los comentarios, puede ayudar a filtrar contenido ofensivo o negativo en plataformas persas.
- **Sistemas de recomendación basados en contenido**: comparando *embeddings* de artículos o productos, se pueden sugerir elementos similares a los usuarios.
- **Clasificación de tickets de soporte**: categorizar automáticamente consultas de clientes en persa según su temática, mejorando la gestión de incidencias.
- **Detección de duplicados en bases de datos textuales**: identificar entradas repetidas o paráfrasis en corpus persas, útil para limpieza de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware.
- El tamaño del repositorio es de 2,3 GB, lo que sugiere un modelo de aproximadamente 500-600 millones de parámetros (típico de XLM-RoBERTa *base* en precisión FP32), pero este dato no está confirmado.
- Para inferencia en CPU, se puede ejecutar con `sentence-transformers` en máquinas con al menos 8 GB de RAM, aunque la latencia será alta.
- En GPU, una tarjeta con 8-12 GB de VRAM (por ejemplo, RTX 3060 o superior) sería suficiente para procesar *batches* pequeños.
- Opciones de despliegue: la librería `sentence-transformers` permite exportar a ONNX o usar el servidor de inferencia de Hugging Face (TEI, *Text Embeddings Inference*), que es compatible según las *tags* del modelo.
- No se dispone de datos de latencia o *throughput*.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos alternativos de embeddings en persa. Se recomienda evaluar contra modelos multilingües como `paraphrase-multilingual-MiniLM-L12-v2` o `distiluse-base-multilingual-cased`, pero no se han encontrado datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: aunque el modelo base es multilingüe, el ajuste se ha realizado específicamente para persa; su rendimiento en otros idiomas no está garantizado.
- **Contexto limitado**: la longitud máxima de secuencia es de 512 *tokens*, lo que impide procesar documentos largos de una sola vez.
- **Licencia no declarada**: al no especificarse la licencia, existe incertidumbre sobre su uso comercial; se recomienda contactar al autor antes de utilizarlo en producción.
- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un *dataset* concreto, puede reflejar sesgos presentes en los datos de entrenamiento.
- **Riesgo de alucinación**: no aplica, ya que el modelo no genera texto, solo produce representaciones vectoriales.
- **Bajo nivel de adopción**: con solo 18 descargas y 0 *likes*, el modelo no ha sido ampliamente validado por la comunidad, lo que implica un riesgo de calidad no verificado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Arshia82sbn/Persian-Sentiment-SentenceTransformer)
- [Notebook de entrenamiento en Kaggle](https://www.kaggle.com/code/arshiasaberian/persian-sentiment-pytorch-nlp)
- [Perfil de Hugging Face del autor](https://huggingface.co/Arshia82sbn)
- [Perfil de GitHub del autor](https://github.com/arshia82sbn)
- [Documentación de sentence-transformers](https://sbert.net)
