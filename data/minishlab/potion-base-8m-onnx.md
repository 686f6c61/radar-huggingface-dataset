# minishlab/potion-base-8m-onnx

## Resumen

potion-base-8m-onnx es un modelo de embeddings de texto estáticos desarrollado por Minish Lab, presentado como una exportación a ONNX del modelo original potion-base-8m, que a su vez es una destilación del sentence transformer BGE-base-en-v1.5. A diferencia de los modelos basados en transformers que generan representaciones contextuales, este modelo asigna a cada token un vector fijo, lo que permite calcular embeddings de frases o documentos de forma mucho más rápida tanto en CPU como en GPU. El resultado es un modelo extremadamente ligero (8 millones de parámetros) pensado para entornos con recursos limitados o aplicaciones donde la latencia es crítica.

La relevancia actual de este modelo radica en su capacidad para ofrecer embeddings de alta calidad con un coste computacional mínimo, gracias a la técnica Model2Vec y al entrenamiento con Tokenlearn. Al estar disponible en formato ONNX, puede ejecutarse con onnxruntime o transformers.js, lo que facilita su integración en aplicaciones web, móviles o sistemas embebidos sin depender de la librería original. Es una opción atractiva para tareas de búsqueda semántica, clasificación de texto o clustering en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec) |
| Parametros totales | 8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (secuencias variables, sin límite explícito) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (modelo base entrenado en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la técnica Model2Vec, que convierte un modelo de embeddings contextuales en un conjunto de embeddings estáticos por token. En este caso, el modelo original potion-base-8m fue entrenado destilando el conocimiento de BGE-base-en-v1.5, un sentence transformer de la familia BGE. El proceso de destilación utiliza Tokenlearn, un método que aprende representaciones de tokens a partir de las salidas del modelo profesor, generando vectores fijos que se combinan mediante pooling (por ejemplo, media ponderada) para obtener el embedding de una frase.

Al ser un modelo de embeddings estáticos, no existe una red neuronal profunda en la inferencia; solo se consulta una tabla de vectores y se aplica una operación de pooling. Esto reduce drásticamente el coste computacional y el uso de memoria. El export a ONNX permite ejecutar este proceso con cualquier runtime compatible, sin necesidad de instalar la librería model2vec. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset, aunque al estar basado en BGE-base-en-v1.5 se asume que el corpus es principalmente inglés.

## Capacidades

- Generación de embeddings de texto para frases, párrafos o documentos completos.
- Similitud semántica entre textos mediante similitud coseno.
- Búsqueda semántica y recuperación de información.
- Clasificación de texto (usando los embeddings como características).
- Clustering y agrupación de documentos.
- Soporte para integración con librerías de embeddings estándar (sentence-transformers, model2vec).
- Ejecución en CPU y GPU con onnxruntime o transformers.js.
- Inferencia de alta velocidad: órdenes de magnitud más rápida que modelos transformer equivalentes.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos y consultas con los embeddings y usar similitud coseno para recuperar los más relevantes. Su baja latencia permite responder en tiempo real incluso en servidores sin GPU.
- Clasificación de tickets de soporte: convertir cada ticket en un embedding y entrenar un clasificador ligero (por ejemplo, regresión logística) sobre estos vectores. El modelo es adecuado porque la inferencia es rápida y no requiere hardware especializado.
- Deduplicación de contenido: comparar embeddings de artículos o publicaciones para detectar duplicados o contenido casi idéntico, útil en agregadores de noticias o plataformas de contenido.
- Sistemas de recomendación basados en texto: representar ítems (productos, artículos) y usuarios mediante embeddings y calcular similitudes para sugerencias personalizadas. La velocidad permite actualizar las recomendaciones en cada petición.
- Análisis de sentimiento en tiempo real: procesar flujos de comentarios o reseñas, generando embeddings y clasificándolos con un modelo preentrenado. Su tamaño reducido facilita el despliegue en entornos con recursos limitados.
- Aplicaciones web con transformers.js: al estar en ONNX, puede ejecutarse directamente en el navegador o en Node.js, permitiendo búsqueda semántica en el cliente sin enviar datos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de Model2Vec incluye resultados comparativos para los modelos base, pero no se proporcionan métricas específicas para esta exportación ONNX. Se recomienda consultar el repositorio oficial para evaluar el rendimiento en tareas como MTEB o similares.

## Requisitos de hardware

- VRAM: no requiere GPU; puede ejecutarse en CPU con menos de 100 MB de RAM.
- GPU recomendada: cualquier GPU es suficiente, aunque no es necesaria. En CPU, la inferencia es del orden de microsegundos por frase.
- Compatible con hardware de consumo: sí, funciona en cualquier ordenador, Raspberry Pi o dispositivo móvil.
- Opciones de despliegue: onnxruntime (Python, C++, C#), transformers.js (JavaScript/Node.js), o cualquier runtime ONNX.
- Latencia: extremadamente baja, típicamente inferior a 1 ms por frase en CPU moderna.
- Throughput: puede procesar miles de frases por segundo en un solo núcleo de CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| potion-base-8m-onnx | 8M | Estático | Variable | MIT | ONNX |
| BGE-base-en-v1.5 | 110M | Transformer | 512 tokens | MIT | Safetensors |
| all-MiniLM-L6-v2 | 22M | Transformer | 256 tokens | Apache-2.0 | Safetensors |
| model2vec (base) | 8M | Estático | Variable | MIT | Safetensors |

El modelo ofrece una ventaja clara en velocidad y tamaño frente a los transformers, a costa de perder la contextualización. Para tareas donde la semántica contextual es crucial, los modelos transformer pueden ser superiores, pero para aplicaciones de alta frecuencia o recursos limitados, potion-base-8m-onnx es una alternativa competitiva.

## Limitaciones y advertencias

- Al ser embeddings estáticos, no capturan el contexto de la frase; palabras polisémicas tienen un único vector, lo que puede reducir la precisión en tareas que requieren matices contextuales.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser deficiente o nulo.
- No se dispone de información sobre sesgos específicos, pero al derivar de BGE-base-en-v1.5, puede heredar sesgos presentes en los datos de entrenamiento originales.
- No es un modelo generativo; no produce texto, solo representaciones vectoriales.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base (BGE-base-en-v1.5) si se redistribuye.
- Para producción, es necesario implementar el preprocesado de tokenización y pooling manualmente, ya que el export ONNX solo incluye la tabla de embeddings y la operación de pooling.

## Enlaces

- [Modelo en Hugging Face (ONNX)](https://huggingface.co/minishlab/potion-base-8m-onnx)
- [Modelo original en Hugging Face](https://huggingface.co/minishlab/potion-base-8M)
- [Repositorio Model2Vec en GitHub](https://github.com/MinishLab/model2vec)
- [Colección de modelos base Model2Vec](https://huggingface.co/collections/minishlab/model2vec-base-models-66fd9dd9b7c3b3c0f25ca90e)
- [Resultados de Model2Vec](https://github.com/MinishLab/model2vec/tree/main/results)
- [Documentación de Model2Vec](https://minish.ai/packages/model2vec/introduction)
