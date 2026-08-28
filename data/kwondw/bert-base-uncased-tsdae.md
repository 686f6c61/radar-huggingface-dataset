# kwondw/bert-base-uncased-tsdae

## Resumen

El modelo `kwondw/bert-base-uncased-tsdae` es un *sentence transformer* desarrollado por el usuario kwondw, que parte del modelo base `google-bert/bert-base-uncased` y lo ajusta mediante la técnica **TSDAE** (Transformer-based Denoising AutoEncoder) sobre el dataset `wiki1m-for-simcse`. El resultado es un modelo de tipo encoder que mapea frases y párrafos a vectores densos de 768 dimensiones, optimizado para tareas de similitud semántica y recuperación de información.

El modelo está diseñado específicamente para generar representaciones vectoriales de texto (embeddings) que permiten comparar la similitud entre frases mediante la función de coseno. Con 109 millones de parámetros y una longitud máxima de secuencia de 75 tokens, es un modelo ligero y eficiente para tareas de *retrieval* y búsqueda semántica en entornos con recursos limitados. Su relevancia actual radica en que ofrece una alternativa de código abierto y de bajo coste computacional para sistemas de búsqueda y clasificación de texto, aunque su ventana de contexto reducida limita su uso a fragmentos cortos.

La arquitectura es un BERT base (encoder-only) con una capa de *pooling* CLS, y el entrenamiento se ha realizado con la pérdida de autoencoder denoising (DenoisingAutoEncoderLoss), una técnica que ha demostrado mejorar la calidad de los embeddings en comparación con el entrenamiento supervisado clásico. El modelo está disponible en formato `safetensors` y es compatible con la librería `sentence-transformers` y con `text-embeddings-inference`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 hidden, 12 cabezas) con pooling CLS |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 75 tokens (máximo declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base BERT está entrenado en inglés, pero no se especifica para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de BERT base (encoder-only) con 12 capas transformer, dimensión oculta de 768 y 12 cabezas de atención. La capa de *pooling* utiliza el token `[CLS]` para generar el embedding final de la frase, y la similitud se calcula mediante coseno. El entrenamiento se realizó con la pérdida **DenoisingAutoEncoderLoss** (TSDAE), una técnica que corrompe las frases de entrada eliminando o permutando tokens y entrena al modelo para reconstruir la frase original, lo que fuerza al encoder a capturar la semántica global. El dataset utilizado es `wiki1m-for-simcse`, que contiene aproximadamente 990.000 ejemplos (según el tag `dataset_size:990000`). Las referencias a los papers `arxiv:1908.10084` (TSDAE) y `arxiv:2104.06979` (SimCSE) indican que el método se basa en estos trabajos, aunque no se especifica si se aplicó algún paso adicional de fine-tuning supervisado o contraste.

No se dispone de información sobre la composición exacta del dataset, el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El modelo se generó con la librería `sentence-transformers` y el script de entrenamiento automático (`generated_from_trainer`), lo que sugiere un proceso estándar de fine-tuning.

## Capacidades

- **Generación de embeddings de frases**: produce vectores de 768 dimensiones para frases o párrafos cortos, optimizados para similitud coseno.
- **Similitud semántica**: permite comparar la cercanía semántica entre textos mediante la distancia coseno de sus embeddings.
- **Búsqueda y recuperación**: puede utilizarse como encoder para sistemas de *retrieval* (búsqueda semántica) sobre colecciones de documentos cortos.
- **Clustering y clasificación**: los embeddings resultantes pueden alimentar algoritmos de agrupamiento o clasificadores downstream.
- **Deduplicación de texto**: útil para identificar textos duplicados o casi duplicados en grandes corpus.
- **Multilingüismo**: no especificado; dado que el modelo base es `bert-base-uncased`, se espera que funcione principalmente en inglés, pero no hay confirmación oficial.
- **Tool calling / agentes**: no soportado, es un modelo puramente encoder sin capacidades generativas.
- **Visión / audio**: no soportado, solo texto.

## Casos de uso

- **Búsqueda semántica en bases de conocimiento**: el modelo puede indexar artículos o FAQs en vectores y responder a consultas del usuario encontrando los fragmentos más relevantes por similitud coseno. Su ventana de 75 tokens limita el uso a textos breves, pero es adecuado para consultas y respuestas cortas.
- **Sistema de preguntas y respuestas sobre documentación técnica**: al convertir preguntas y pasajes de documentación en embeddings, se puede implementar un *retriever* que devuelva los párrafos más relacionados antes de pasar a un modelo generativo.
- **Deduplicación de registros en CRM**: comparar embeddings de nombres de empresas o descripciones de productos para detectar duplicados, aprovechando la capacidad de capturar similitud semántica más allá de la coincidencia exacta.
- **Clasificación de tickets de soporte**: generar embeddings de los mensajes de los clientes y usar un clasificador simple (p. ej., regresión logística) sobre los vectores para categorizar problemas en áreas como facturación, técnico o ventas.
- **Moderación de contenido**: detectar mensajes similares a ejemplos previamente etiquetados como spam o abusivos mediante la comparación de embeddings con un conjunto de referencia.
- **Recomendación de artículos o noticias**: calcular la similitud entre el historial de lectura del usuario y nuevos artículos para sugerir contenido relacionado, siempre que los textos sean de longitud moderada.
- **Análisis de encuestas abiertas**: agrupar respuestas abiertas por tema mediante clustering de embeddings, permitiendo identificar tendencias o temas recurrentes en grandes volúmenes de texto corto.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el `model-index` de la model card, medidos sobre los conjuntos de validación y test de STS (Semantic Textual Similarity). No se proporcionan comparaciones con otros modelos.

| Dataset | Métrica | Valor |
|---|---|---|
| sts dev | Pearson Cosine | 0.6503 |
| sts dev | Spearman Cosine | 0.6557 |
| sts test | Pearson Cosine | 0.6159 |
| sts test | Spearman Cosine | 0.6199 |

Estos valores indican una correlación moderada entre las puntuaciones de similitud generadas por el modelo y las anotaciones humanas. No se han publicado resultados en otros benchmarks como MMLU, HumanEval o GLUE para este modelo específico.

## Requisitos de hardware

- **VRAM estimada**: con 109 millones de parámetros, el modelo ocupa aproximadamente 0.4 GB en precisión fp32. En cuantización a int8 o fp16, el consumo se reduce a unos 0.2 GB, por lo que es ejecutable en cualquier GPU con al menos 1 GB de VRAM.
- **GPUs recomendadas**: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- **Compatibilidad con GPU consumer**: sí, cabe sin problema en GPUs de gama baja y media.
- **Opciones de despliegue**: compatible con `sentence-transformers` (inferencia en Python), `text-embeddings-inference` (servidor de embeddings), y puede exportarse a ONNX o TorchScript para entornos de producción. También es posible usar `vLLM` para servir embeddings, aunque no es el caso de uso típico.
- **Latencia y throughput**: al ser un modelo pequeño (12 capas), la inferencia es rápida; en una GPU moderna se pueden procesar cientos de frases por segundo. En CPU, el rendimiento es aceptable para lotes pequeños, pero se recomienda GPU para cargas altas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo frente a alternativas. Sin embargo, se pueden mencionar modelos de la misma categoría (sentence transformers basados en BERT) sin aportar cifras concretas:

- **`sentence-transformers/all-MiniLM-L6-v2`**: modelo más pequeño (22M parámetros) con mejor rendimiento en tareas de similitud según benchmarks públicos, pero con menor capacidad de representación.
- **`sentence-transformers/msmarco-distilbert-base-v4`**: basado en DistilBERT, optimizado para retrieval, con contexto de 512 tokens.
- **`BAAI/bge-small-en-v1.5`**: modelo de embeddings de 33M parámetros con buen rendimiento en tareas de retrieval y clasificación, licencia MIT.

La comparación directa no es posible sin datos de benchmarks del modelo evaluado, pero en términos de arquitectura, todos son encoders transformer con pooling. La principal limitación de este modelo es su ventana de contexto de 75 tokens, muy inferior a los 512 de otros modelos de la familia.

## Limitaciones y advertencias

- **Ventana de contexto muy reducida**: 75 tokens máximo, lo que impide procesar documentos largos o frases extensas. Cualquier texto que supere ese límite será truncado, perdiendo información.
- **Idioma no especificado**: aunque el modelo base BERT está entrenado en inglés, la model card no confirma los idiomas soportados tras el fine-tuning. Se recomienda probar en el idioma objetivo antes de usarlo en producción.
- **Licencia no disponible**: no se indica la licencia del modelo, lo que genera incertidumbre legal para su uso comercial. Es recomendable contactar con el autor antes de integrarlo en productos.
- **Riesgo de sesgos**: al derivar de BERT base, puede heredar sesgos de género, raza o religión presentes en los datos de preentrenamiento. No se ha realizado ninguna mitigación específica.
- **Alucinación**: al ser un modelo encoder, no genera texto, por lo que el riesgo de alucinación no aplica directamente. Sin embargo, los embeddings pueden reflejar asociaciones sesgadas del corpus original.
- **Rendimiento moderado en STS**: los valores de correlación (0.62-0.66) son inferiores a los de modelos más modernos como MiniLM o BGE, que suelen superar 0.80 en los mismos conjuntos. Esto puede deberse al entrenamiento con TSDAE y a la ventana corta.
- **Sin soporte para tool calling ni agentes**: no es adecuado para tareas que requieran generación de texto o interacción con herramientas.
- **Sin información sobre cuantización**: no se han publicado versiones cuantizadas ni pruebas de rendimiento en formatos como GGUF o ONNX.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kwondw/bert-base-uncased-tsdae)
- [Paper TSDAE (arxiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper SimCSE (arxiv:2104.06979)](https://arxiv.org/abs/2104.06979)
- [Documentación de sentence-transformers](https://sbert.net)
- [Repositorio de sentence-transformers](https://github.com/huggingface/sentence-transformers)
