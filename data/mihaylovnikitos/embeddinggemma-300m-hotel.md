# mihaylovnikitos/embeddinggemma-300m-hotel

## Resumen

El modelo `mihaylovnikitos/embeddinggemma-300m-hotel` es un fine-tuning del modelo de embeddings `google/embeddinggemma-300m` de Google, especializado en el dominio hotelero. Fue desarrollado por el usuario de HuggingFace mihaylovnikitos y está diseñado para generar representaciones vectoriales densas de 768 dimensiones a partir de texto, optimizadas para tareas de búsqueda semántica y similitud de frases en el sector de la hostelería. El modelo base, EmbeddingGemma, es un modelo de embeddings de 300 millones de parámetros construido sobre Gemma 3 con inicialización T5Gemma, que destaca por su eficiencia y capacidad para ejecutarse en dispositivos con recursos limitados.

Este fine-tuning se entrenó con un conjunto de datos de 7.625 muestras (según los metadatos) utilizando las funciones de pérdida MatryoshkaLoss y CoSENTLoss, lo que permite obtener embeddings jerárquicos y mejorar la calidad de la representación semántica. La ventana de contexto máxima es de 2.048 tokens, suficiente para descripciones de hoteles, reseñas y consultas de búsqueda. El modelo se distribuye a través de la librería sentence-transformers y es compatible con la inferencia de embeddings de texto, siendo especialmente útil para sistemas de recomendación, búsqueda semántica y clasificación de contenido hotelero.

Aunque el modelo no tiene descargas ni likes en el momento de la redacción, su relevancia radica en que ofrece una solución especializada y ligera para un nicho concreto, aprovechando la base sólida de EmbeddingGemma y adaptándola a un dominio específico mediante un ajuste fino con datos curados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 3 con inicialización T5Gemma) |
| Parametros totales | 302.863.104 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los ejemplos del widget incluyen ruso e inglés, pero no hay declaración oficial) |
| Licencia | No disponible (la model card indica "Unknown") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/embeddinggemma-300m`, un modelo de embeddings de texto basado en la arquitectura Transformer de Gemma 3, con una inicialización T5Gemma que combina las ventajas de ambos enfoques. El modelo base tiene 300 millones de parámetros y está diseñado para generar representaciones densas de alta calidad para tareas de recuperación y similitud semántica, con un consumo de recursos reducido que permite su despliegue en dispositivos de gama media.

El entrenamiento del fine-tuning se realizó con la librería sentence-transformers, utilizando un dataset de 7.625 muestras (según los metadatos del repositorio). Se emplearon dos funciones de pérdida: MatryoshkaLoss, que permite obtener embeddings de distintas dimensiones (por ejemplo, 768, 512, 256) y facilita el ajuste del equilibrio entre rendimiento y almacenamiento, y CoSENTLoss, que optimiza directamente la similitud coseno entre pares de frases. No se dispone de información adicional sobre el proceso de entrenamiento, como el número de épocas, la tasa de aprendizaje o la composición exacta del dataset, más allá de que está orientado al dominio hotelero, como se deduce de los ejemplos del widget.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones para frases y párrafos, optimizados para similitud coseno.
- Búsqueda semántica: permite recuperar documentos o fragmentos relevantes a partir de una consulta en lenguaje natural, como se muestra en los ejemplos del widget (por ejemplo, consultas sobre "atmósfera de campo" o "hotel en el centro").
- Clasificación de texto: los embeddings pueden utilizarse como entrada para clasificadores, por ejemplo, para categorizar hoteles por tipo (boutique, resort, negocio) o por características (piscina, spa, admite mascotas).
- Agrupamiento (clustering): agrupar descripciones de hoteles por similitud temática o de servicios.
- Recuperación aumentada por generación (RAG): puede integrarse en pipelines de RAG para sistemas de preguntas y respuestas sobre información hotelera.
- Multilingüismo parcial: aunque no hay una declaración oficial, los ejemplos del widget incluyen texto en ruso e inglés, lo que sugiere cierta capacidad multilingüe heredada del modelo base, pero no se garantiza para otros idiomas.
- Compatibilidad con la librería sentence-transformers y con text-embeddings-inference (TEI), lo que facilita su uso en producción.

## Casos de uso

- Búsqueda semántica en portales de reservas: el modelo puede indexar descripciones de hoteles y permitir que los usuarios busquen por criterios como "hotel con vistas al lago y ambiente romántico" o "hotel céntrico con spa". Gracias a su ventana de 2.048 tokens, puede manejar descripciones completas de establecimientos.
- Sistema de recomendación de hoteles: a partir de las preferencias expresadas por el usuario en lenguaje natural (por ejemplo, "quiero un hotel tranquilo rodeado de naturaleza"), el modelo genera embeddings de la consulta y los compara con los embeddings de los hoteles para sugerir las opciones más relevantes.
- Clasificación automática de establecimientos: los embeddings pueden alimentar un clasificador para etiquetar automáticamente hoteles según su segmento (económico, medio, premium), tipo (boutique, resort, urbano) o servicios ofrecidos (piscina, spa, restaurante).
- Detección de duplicados o contenido similar: en plataformas que agregan ofertas de múltiples fuentes, el modelo puede identificar descripciones de hoteles que se refieren al mismo establecimiento aunque estén redactadas de forma diferente.
- Análisis de reseñas y opiniones: los embeddings de reseñas de clientes pueden agruparse para identificar temas recurrentes (por ejemplo, quejas sobre el desayuno, elogios sobre la ubicación) y ayudar a la gestión de la reputación online.
- Asistente virtual de reservas: integrado en un chatbot, el modelo permite interpretar consultas complejas de los usuarios (por ejemplo, "busco un hotel que admita mascotas y esté cerca de la playa") y recuperar opciones adecuadas en tiempo real, gracias a su tamaño reducido que permite inferencia rápida incluso en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (como Spearman correlation, NDCG o Recall@k) ni comparaciones con otros modelos de embeddings. Tampoco se proporcionan datos sobre el rendimiento del fine-tuning frente al modelo base o a alternativas del mercado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 302 millones de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,2 GB en memoria. En fp16 se reduce a unos 600 MB, y en cuantización int8 a unos 300 MB. Estas cifras son estimaciones basadas en el tamaño del modelo; no se han publicado mediciones oficiales.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 (12 GB) o superiores, aunque incluso una GTX 1650 con 4 GB sería suficiente en fp16. También es viable en CPU para cargas de trabajo moderadas, gracias a su tamaño compacto.
- Compatibilidad con hardware de gama baja: sí, el modelo está diseñado para ser eficiente y puede desplegarse en dispositivos con pocos recursos, como Raspberry Pi o teléfonos móviles, siempre que se utilice una cuantización adecuada.
- Opciones de despliegue: es compatible con sentence-transformers (Python), text-embeddings-inference (TEI) para servidores de embeddings, y puede exportarse a ONNX o TensorRT para optimización. También se puede utilizar con librerías como FAISS o Milvus para indexación vectorial.
- Latencia y throughput estimados: no se dispone de datos oficiales. En una GPU moderna, se espera una latencia de pocos milisegundos por consulta, pero estos valores dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensionalidad | Licencia | Especialización |
|---|---|---|---|---|---|
| `mihaylovnikitos/embeddinggemma-300m-hotel` | 302 M | 2.048 tokens | 768 | No disponible | Dominio hotelero |
| `google/embeddinggemma-300m` | 300 M | 2.048 tokens | 768 | Gemma Terms of Use | Generalista |
| `all-MiniLM-L6-v2` | 22 M | 256 tokens | 384 | Apache 2.0 | Generalista, ligero |

El modelo fine-tune se diferencia del modelo base de Google por su ajuste específico al dominio hotelero, lo que debería mejorar la precisión en consultas relacionadas con alojamiento, servicios y ubicación. Frente a `all-MiniLM-L6-v2`, ofrece una dimensionalidad mayor (768 vs 384) y una ventana de contexto más amplia (2.048 vs 256 tokens), aunque con un coste computacional superior. La licencia del modelo fine-tune es incierta, lo que puede limitar su uso comercial en comparación con alternativas de código abierto como Apache 2.0.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "Unknown", lo que genera incertidumbre sobre los términos de uso, especialmente para aplicaciones comerciales. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Dataset de entrenamiento reducido: con solo 7.625 muestras, el modelo puede presentar overfitting o un rendimiento subóptimo fuera del dominio hotelero. Es probable que su generalización a otros sectores sea limitada.
- Idiomas no declarados: aunque los ejemplos del widget incluyen ruso e inglés, no hay una lista oficial de idiomas soportados. El rendimiento en otros idiomas es incierto.
- Riesgo de alucinación en tareas de generación: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, si se utiliza en un pipeline de RAG, las respuestas generadas por el modelo de lenguaje podrían ser incorrectas si los embeddings no recuperan los documentos adecuados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el fine-tuning mejore realmente el rendimiento frente al modelo base en el dominio hotelero. Los usuarios deben validar el modelo con sus propios datos.
- Dependencia del modelo base: cualquier limitación de `google/embeddinggemma-300m` (por ejemplo, sesgos en los datos de entrenamiento) se hereda en este fine-tuning. No se han realizado evaluaciones de sesgos específicas.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/mihaylovnikitos/embeddinggemma-300m-hotel)
- [Modelo base google/embeddinggemma-300m](https://huggingface.co/google/embeddinggemma-300m)
- [Página de EmbeddingGemma en Google DeepMind](https://deepmind.google/models/gemma/embeddinggemma/)
- [Model card de EmbeddingGemma en Google AI for Developers](https://ai.google.dev/gemma/docs/embeddinggemma/model_card)
- [Documentación de sentence-transformers](https://sbert.net)
- [Repositorio de sentence-transformers en GitHub](https://github.com/huggingface/sentence-transformers)
