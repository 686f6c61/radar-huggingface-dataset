# KitsuMate/embeddinggemma-300m-onnx

## Resumen

EmbeddingGemma es un modelo de embeddings de texto de 300 millones de parámetros desarrollado por Google DeepMind, construido a partir de la familia Gemma 3 con inicialización T5Gemma. Produce vectores de representación de 768 dimensiones y está optimizado para tareas de búsqueda semántica, clasificación, agrupación y similitud. El modelo es la base de este repositorio, que ofrece una versión convertida a formato ONNX por KitsuMate, pensada para uso con Transformers.js, ONNX Runtime y Text Embeddings Inference.

La relevancia actual de este modelo radica en su tamaño contenido y su enfoque en el despliegue en dispositivos con recursos limitados, como móviles, portátiles o servidores pequeños. A pesar de su tamaño, ha sido entrenado con datos en más de 100 idiomas, lo que lo convierte en una opción sólida para aplicaciones multilingües de recuperación de información. La conversión ONNX presentada en este repositorio facilita su integración en entornos JavaScript, Python y en infraestructuras de inferencia dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 con inicialización T5Gemma) |
| Parametros totales | 300 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | fp32, q8, q4 |
| Idiomas soportados | Más de 100 idiomas |
| Licencia | Gemma |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Gemma 3, con una inicialización propuesta por T5Gemma, y fue entrenado por Google DeepMind utilizando las mismas técnicas que los modelos Gemini. Es un modelo de embeddings puro: mapea una cadena de texto a un vector numérico de 768 dimensiones, con soporte de Matryoshka Representation Learning (MRL) para truncar ese vector a 512, 256 o 128 dimensiones y renormalizarlo, manteniendo una representación eficiente y precisa.

Los datos de entrenamiento incluyen texto en más de 100 idiomas hablados, según la model card, pero no se detallan el número total de tokens ni la composición del dataset en la información disponible. Tampoco se mencionan procesos de RLHF o DPO, algo previsible en un modelo de embeddings no generativo. La principal innovación técnica es la combinación de un tamaño reducido con un contexto de 2048 tokens y la capacidad de reducir la dimensionalidad de salida sin necesidad de reentrenar.

## Capacidades

- Genera embeddings de texto de 768 dimensiones, con opciones de 512, 256 o 128 dimensiones mediante MRL.
- Especializado en búsqueda semántica, similitud de frases, clasificación y clustering.
- Soporta más de 100 idiomas, lo que permite su uso en aplicaciones multilingües.
- Apto para entornos con pocos recursos: su tamaño de 300 millones de parámetros permite ejecutarlo en CPU y en dispositivos móviles.
- Compatible con Transformers.js, ONNX Runtime y Text Embeddings Inference (TEI).
- No es un modelo generativo: no produce texto, ni soporta tool calling, ni razonamiento multi-paso.
- Los ejemplos de uso incluyen prefijos de tarea para diferenciar consultas y documentos ("task: search result | query:" y "title: none | text:").

## Casos de uso

- Búsqueda semántica en bases documentales: permite indexar y buscar contenido en más de 100 idiomas, devolviendo los fragmentos más relevantes mediante la similitud del coseno entre consultas y documentos.
- Recuperación aumentada para asistentes (RAG): sirve como componente de recuperación en pipelines de RAG, donde se generan embeddings de las consultas y del corpus para seleccionar los fragmentos que se pasarán a un modelo generativo.
- Clasificación automática de textos: los embeddings se usan como características de entrada para clasificadores lineales o basados en vectores, lo que permite categorizar tickets de soporte, correos, reseñas o noticias.
- Agrupación de documentos: agrupa textos similares mediante técnicas de clustering sobre los vectores, útil para detectar temas emergentes o duplicar contenido en grandes colecciones.
- Recomendación de contenidos: calcula la similitud entre un elemento consumido y el resto del catálogo para sugerir artículos, productos o documentos relacionados.
- Búsqueda offline en dispositivos finales: al estar disponible en ONNX y tener un tamaño reducido, el modelo puede ejecutarse directamente en un móvil, una tableta o un portátil sin conexión a internet, garantizando privacidad y baja latencia.
- Detección de casi-duplicados en bases de datos: compara embeddings para identificar textos que son prácticamente idénticos, útil en gestión de contenidos o en el sector editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada según la cuantización: fp32 requiere aproximadamente 1,2 GB de memoria; q8 alrededor de 300 MB; q4 alrededor de 150 MB. El repositorio completo, que contiene varias variantes, ocupa 2,8 GB.
- GPU recomendada: cualquier tarjeta gráfica con al menos 2 GB de VRAM (RTX 3060, RTX 4060, GPU Apple Silicon, etc.). También se puede ejecutar en CPU con rendimiento aceptable.
- Sí cabe en GPU de consumo: el modelo es suficientemente pequeño para ejecutarse en tarjetas gráficas para juegos y en chips integrados.
- Opciones de despliegue: Transformers.js en JavaScript, ONNX Runtime en Python o C++, y Text Embeddings Inference (TEI) mediante Docker.
- No se dispone de cifras de latencia o throughput publicados en la documentación aportada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoría. En la documentación consultada solo se referencia el modelo base original y su conversión ONNX de la comunidad:

| Modelo | Parámetros | Contexto | Dimensión | Idiomas |
|---|---|---|---|---|
| KitsuMate/embeddinggemma-300m-onnx | 300 millones | 2048 tokens | 768 | Más de 100 |
| google/embeddinggemma-300m | 300 millones | 2048 tokens | 768 | Más de 100 |
| onnx-community/embeddinggemma-300m-ONNX | 300 millones | 2048 tokens | 768 | Más de 100 |

Las tres entradas corresponden al mismo modelo base, por lo que el rendimiento es idéntico; la variante de KitsuMate es una conversión ONNX adicional con los mismos pesos.

## Limitaciones y advertencias

- La licencia Gemma no es Apache 2.0. Tiene términos de uso propios que deben consultarse y aceptarse antes de realizar cualquier despliegue comercial.
- Las activaciones del modelo no soportan fp16 ni sus derivados. Es necesario usar fp32, q8 o q4 para la inferencia.
- La ventana de contexto de 2048 tokens puede resultar corta para documentos extensos o para tareas que requieran analizar muchos párrafos a la vez.
- Se trata de un modelo de embeddings: no genera texto, no razona ni ejecuta herramientas, por lo que no puede sustituir a un LLM conversacional.
- No se han documentado en la model card evaluaciones de sesgos, alucinaciones o comportamientos adversos específicos de esta conversión ONNX.
- El repositorio no presenta datos de benchmarks, por lo que es difícil verificar su rendimiento frente a otros modelos de embeddings en el mercado.

## Enlaces

- Hugging Face: https://huggingface.co/KitsuMate/embeddinggemma-300m-onnx
- Modelo base original: https://huggingface.co/google/embeddinggemma-300m
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- Documentación de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Modelo en Kaggle: https://www.kaggle.com/models/google/embeddinggemma/
- Modelo en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/embeddinggemma
- Términos de uso: https://ai.google.dev/gemma/terms
