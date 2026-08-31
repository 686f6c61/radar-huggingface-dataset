# aneforge/all-MiniLM-L12-v2

## Resumen

El modelo `aneforge/all-MiniLM-L12-v2` es una copia byte-idéntica del conocido modelo de embeddings de frases `sentence-transformers/all-MiniLM-L12-v2`, publicada por el usuario `aneforge` con el objetivo de que los pesos puedan cargarse y ejecutarse directamente en el Apple Neural Engine (ANE) mediante la librería ANEForge, sin necesidad de pasar por CoreML. El modelo original, desarrollado por el equipo de Sentence-Transformers, está basado en la arquitectura MiniLM-L12-H384-uncased de Microsoft y fue ajustado con más de 1.170 millones de pares de frases mediante aprendizaje contrastivo, produciendo vectores densos de 384 dimensiones.

Esta versión no introduce ninguna modificación en los pesos ni en la arquitectura; simplemente añade etiquetas y un formato de empaquetado que permite a ANEForge compilar el grafo del modelo en un único programa ANE y transmitir los pesos desde Hugging Face. Es relevante para desarrolladores que trabajan en ecosistemas Apple (macOS, iOS, iPadOS) y desean aprovechar la aceleración por hardware del Neural Engine sin las limitaciones de conversión de CoreML. El modelo tiene 33,36 millones de parámetros y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM (Transformer encoder, 12 capas, 384 dimensiones de embedding) |
| Parametros totales | 33.360.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original soporta hasta 128 tokens, pero no se indica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo original esta entrenado principalmente en ingles, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 12 capas y una dimensión oculta de 384, diseñado específicamente para producir representaciones densas de frases y párrafos cortos. El entrenamiento original se realizó sobre más de 1.170 millones de pares de frases utilizando objetivos de aprendizaje contrastivo, implementados con JAX. El resultado es un espacio vectorial de 384 dimensiones donde frases semánticamente similares quedan próximas entre sí.

La versión de ANEForge no altera la arquitectura ni los pesos; es un duplicado exacto del modelo base. La innovación reside en el proceso de compilación: ANEForge transforma el grafo computacional en un programa ANE nativo, lo que permite ejecutar la inferencia directamente en el Neural Engine de los chips Apple (M1, M2, M3, etc.) sin pasar por CoreML. Esto reduce la latencia y el consumo energético en comparación con la ejecución en CPU o GPU, manteniendo la misma precisión al ser los pesos idénticos.

## Capacidades

- Generación de embeddings de frases y párrafos cortos (hasta 128 tokens en el modelo original, aunque no se confirma en esta ficha).
- Similitud semántica entre textos: calcula la similitud coseno entre vectores para medir la cercanía semántica.
- Búsqueda semántica: permite indexar documentos y recuperar los más relevantes según la consulta.
- Clustering de textos: agrupa documentos o mensajes por similitud temática.
- Clasificación de texto: se puede usar como extractor de características para entrenar clasificadores ligeros.
- Soporte para normalización de embeddings (normalize_embeddings=True) para facilitar el uso de métricas de distancia.
- Compatible con la API de Sentence-Transformers, por lo que se puede integrar en pipelines existentes.
- No dispone de capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en bases de datos documentales: se indexan los embeddings de los documentos y, ante una consulta, se calcula su embedding y se recuperan los documentos más cercanos por similitud coseno. El modelo es adecuado por su bajo coste computacional y su buena calidad para textos cortos.
- Sistemas de recomendación basados en contenido: se representan ítems (artículos, productos, noticias) mediante embeddings y se recomiendan aquellos con mayor similitud al historial del usuario.
- Deduplicación de contenido: se comparan embeddings de textos para detectar duplicados o versiones casi idénticas en grandes volúmenes de datos, útil en limpieza de datasets o gestión de contenidos.
- Moderación y clasificación de comentarios: se generan embeddings de comentarios de usuarios y se entrenan clasificadores ligeros (regresión logística, SVM) sobre ellos para detectar spam, toxicidad o temas específicos.
- Agrupación de tickets de soporte: se clusterizan tickets de atención al cliente por temática para priorizar colas o identificar problemas recurrentes, aprovechando la capacidad de clustering del modelo.
- Recuperación aumentada para generación (RAG): se utiliza como modelo de retrieval para seleccionar fragmentos relevantes de un corpus que luego se pasan a un modelo generativo, gracias a su velocidad y a la compatibilidad con ANE en dispositivos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un duplicado del original `all-MiniLM-L12-v2`, cuyos resultados en tareas como STSBenchmark o MTEB son conocidos en la comunidad, pero no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 33 millones de parámetros, la inferencia requiere menos de 1 GB de memoria, incluso en cuantización FP32. En la práctica, puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; en hardware Apple, el Apple Neural Engine es el objetivo principal gracias a ANEForge.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en CPUs sin GPU.
- Opciones de despliegue: ANEForge (para Apple Silicon), Sentence-Transformers (para CPU/GPU), Hugging Face Inference Endpoints, o servidores de embeddings como text-embeddings-inference.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo pequeño, la latencia típica en CPU es de pocos milisegundos por frase; en ANE se espera una mejora adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| aneforge/all-MiniLM-L12-v2 | 33,36 M | 384 | no disponible | Apache 2.0 | Duplicado para ANE, pesos idénticos al original |
| sentence-transformers/all-MiniLM-L12-v2 | 33,36 M | 384 | 128 (no confirmado) | Apache 2.0 | Modelo original, ampliamente usado |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 128 (no confirmado) | Apache 2.0 | Versión más ligera con 6 capas, menor calidad pero más rápida |
| BAAI/bge-small-en-v1.5 | 33,4 M | 384 | 512 | MIT | Alternativa con mayor contexto y buen rendimiento en retrieval |

La comparativa se basa en datos públicos de los modelos originales; no se dispone de benchmarks propios de esta versión.

## Limitaciones y advertencias

- Al ser un duplicado sin modificaciones, hereda todas las limitaciones del modelo original: está entrenado principalmente con texto en inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- La longitud de contexto es limitada (el original soporta 128 tokens, aunque no se confirma en esta ficha); frases o párrafos más largos deben truncarse, lo que puede perder información.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales.
- El uso de ANEForge requiere hardware Apple con Neural Engine; en otras plataformas se puede usar con Sentence-Transformers, pero sin la aceleración específica.
- No se han publicado evaluaciones de sesgos o comportamientos adversos para esta versión concreta; se recomienda auditar el modelo en el dominio de aplicación.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aneforge/all-MiniLM-L12-v2
- Modelo original: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Repositorio de ANEForge: https://github.com/sbryngelson/ANEForge
- Documentación de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge: https://arxiv.org/abs/2606.17090
- Anuncio de AWS sobre all-MiniLM-L12-v2 en SageMaker JumpStart: https://aws.amazon.com/about-aws/whats-new/2026/06/all-minilm-l12-v2-on-sagemaker-jumpstart/
