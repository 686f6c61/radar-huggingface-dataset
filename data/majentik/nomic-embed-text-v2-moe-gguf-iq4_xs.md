# majentik/nomic-embed-text-v2-moe-GGUF-IQ4_XS

## Resumen

Este repositorio contiene una cuantización GGUF en formato IQ4_XS del modelo de embeddings multilingüe `nomic-ai/nomic-embed-text-v2-moe`, publicado por el usuario majentik. Se trata de un modelo de extracción de características (feature extraction) diseñado para generar representaciones vectoriales densas de texto, orientado a tareas de búsqueda semántica, similitud entre frases y recuperación de información. El modelo base, desarrollado por Nomic AI, emplea una arquitectura de mezcla de expertos (MoE) con 475 millones de parámetros totales y 305 millones activos, lo que lo convierte en una opción eficiente para despliegue en entornos con recursos limitados.

La versión cuantizada aquí presentada reduce el tamaño del archivo a 313 MB, manteniendo una fidelidad de embeddings verificada mediante una prueba de similitud coseno frente a la versión F16, con un valor mínimo de 0.989973. Está pensada para su uso con la biblioteca llama.cpp y herramientas compatibles como Ollama, lo que facilita su integración en aplicaciones de producción que requieren embeddings de alta calidad sin necesidad de GPUs de gran capacidad. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, 8 expertos con routing top-2 |
| Parametros totales | 475.288.320 |
| Parametros activos | 305.000.000 (aproximado, según el modelo base) |
| Longitud de contexto | No disponible (el modelo base no especifica un máximo explícito; se recomienda consultar la documentación original) |
| Tipos de cuantizacion | IQ4_XS (este repositorio); el modelo base está disponible en FP32 y otras cuantizaciones GGUF |
| Idiomas soportados | ~100 idiomas (según el modelo base; la ficha del repo no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización IQ4_XS) |

## Arquitectura y entrenamiento

El modelo base `nomic-embed-text-v2-moe` es un transformer con arquitectura de mezcla de expertos (MoE), siendo el primer modelo de embeddings de propósito general que utiliza esta técnica. Emplea 8 expertos con un mecanismo de routing top-2, activando solo 305 millones de los 475 millones de parámetros totales durante la inferencia, lo que reduce el coste computacional sin sacrificar calidad. El entrenamiento se realizó sobre más de 1.600 millones de pares de texto multilingües, cubriendo aproximadamente 100 idiomas. Además, incorpora embeddings Matryoshka, que permiten reducir la dimensionalidad del vector de salida hasta en 3 veces sin pérdida significativa de rendimiento, optimizando el almacenamiento y la velocidad de búsqueda.

La cuantización IQ4_XS se generó a partir del checkpoint FP32 del modelo base mediante las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). El autor realizó una prueba de fidelidad comparando las embeddings generadas por esta versión cuantizada frente a una versión F16 de referencia, utilizando un conjunto de 8 frases multilingües. El resultado fue una similitud coseno mínima de 0.989973 (media de 0.992246), superando el umbral de 0.98 establecido para la liberación del modelo.

## Capacidades

- Generación de embeddings densos para texto, aptos para búsqueda semántica, similitud entre frases y agrupación de documentos.
- Soporte multilingüe: aproximadamente 100 idiomas, lo que permite su uso en aplicaciones globales sin necesidad de modelos separados por idioma.
- Embeddings Matryoshka: permite reducir la dimensionalidad del vector (por ejemplo, de 768 a 256) manteniendo una buena calidad, reduciendo costes de almacenamiento y computación.
- Inferencia eficiente gracias a la arquitectura MoE con activación parcial de parámetros.
- Compatibilidad con llama.cpp y herramientas derivadas (Ollama, llama-cpp-python, etc.) para despliegue en CPU o GPU.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos internos de una empresa y recuperar los más relevantes mediante consultas en lenguaje natural. El modelo genera embeddings de alta calidad multilingüe, lo que permite buscar en varios idiomas con una sola infraestructura.
- Sistemas de recomendación basados en contenido: calcular la similitud entre artículos, productos o publicaciones para sugerir elementos relacionados. Su tamaño reducido permite ejecutarlo en servidores modestos.
- Clasificación de texto sin entrenamiento: usar las embeddings como características de entrada para clasificadores lineales o modelos de aprendizaje automático tradicionales, evitando el ajuste fino de modelos grandes.
- Deduplicación de documentos: detectar duplicados o versiones casi idénticas de textos comparando sus vectores, útil en limpieza de datasets o gestión de contenidos.
- Chatbots con recuperación aumentada (RAG): integrar el modelo como componente de recuperación en un pipeline RAG, donde las consultas de usuarios se convierten en embeddings para buscar pasajes relevantes en una base vectorial.
- Análisis de sentimiento multilingüe: generar embeddings de reseñas o comentarios en distintos idiomas y aplicar un clasificador preentrenado para detectar polaridad, sin necesidad de modelos específicos por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización IQ4_XS en la información disponible. El modelo base `nomic-embed-text-v2-moe` reporta un rendimiento de última generación (SoTA) en tareas de recuperación multilingüe, siendo competitivo con modelos de aproximadamente el doble de tamaño (según la documentación de Nomic AI). Sin embargo, no se dispone de cifras concretas de MMLU, HumanEval u otros benchmarks estándar, ya que este modelo no está diseñado para generación de texto ni razonamiento general. Para evaluar la calidad de los embeddings, se recomienda consultar los resultados publicados en el repositorio oficial del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo cuantizado pesa 313 MB, por lo que la memoria necesaria es inferior a 1 GB (incluyendo overhead). Puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas consumer como GTX 1650, RTX 2060 o superiores. También funciona en Apple Silicon mediante Metal.
- Compatibilidad con CPU: sí, gracias a la cuantización IQ4_XS y la implementación optimizada de llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores de embeddings compatibles con GGUF (por ejemplo, llama-embedding).
- Latencia y throughput: no se dispone de mediciones concretas, pero al ser un modelo de 305M parámetros activos, la generación de embeddings es rápida incluso en CPU. En GPU, se pueden procesar cientos de frases por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| nomic-embed-text-v2-moe (IQ4_XS) | 475M total / 305M activos | No disponible | ~100 | Apache 2.0 | GGUF |
| multilingual-e5-base | 278M | 512 tokens | 100+ | MIT | PyTorch, ONNX |
| bge-m3 | 568M | 8192 tokens | 100+ | MIT | PyTorch, ONNX |
| gte-multilingual-base | 305M | 512 tokens | 100+ | Apache 2.0 | PyTorch |

La comparativa se basa en características generales de modelos de embeddings multilingües de tamaño similar. No se dispone de resultados de benchmarks comparativos directos con esta cuantización específica. El modelo nomic destaca por su arquitectura MoE, que ofrece una relación eficiencia-rendimiento favorable, y por la flexibilidad de dimensionalidad gracias a Matryoshka embeddings.

## Limitaciones y advertencias

- Es una cuantización: aunque la fidelidad frente a la versión F16 es alta (similitud coseno > 0.98), puede haber una ligera degradación en la calidad de los embeddings en comparación con el modelo original en precisión completa.
- No es un modelo generativo: no puede producir texto, solo vectores. Para tareas de generación se necesitan otros modelos.
- Sesgos del modelo base: como cualquier modelo entrenado con datos web, puede reflejar sesgos culturales, de género o geográficos presentes en los datos de entrenamiento. Se recomienda evaluar su comportamiento en el dominio de aplicación.
- Riesgo de alucinación no aplica directamente, pero los embeddings pueden ser menos precisos en dominios muy especializados o con jerga técnica poco representada en los datos de entrenamiento.
- La longitud de contexto no está documentada en este repositorio; se debe verificar en la documentación del modelo base para evitar truncamientos inesperados.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y atribución correspondiente.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/majentik/nomic-embed-text-v2-moe-GGUF-IQ4_XS
- Modelo base (Nomic AI): https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe
- Versión GGUF oficial del modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe-GGUF
- Página del modelo en Ollama: https://ollama.com/library/nomic-embed-text-v2-moe
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Garden hub del autor: https://huggingface.co/majentik/garden
