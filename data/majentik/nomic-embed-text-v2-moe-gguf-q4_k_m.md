# majentik/nomic-embed-text-v2-moe-GGUF-Q4_K_M

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo `nomic-ai/nomic-embed-text-v2-moe`, un modelo de embeddings de texto multilingüe basado en una arquitectura de Mezcla de Expertos (MoE). El modelo original, desarrollado por Nomic AI, es el primer modelo de embeddings de propósito general con arquitectura MoE, diseñado para ofrecer un equilibrio entre calidad y eficiencia computacional mediante activación dispersa. La cuantización realizada por el usuario `majentik` reduce el tamaño del modelo a 336 MB, lo que permite ejecutarlo en hardware modesto, incluidas CPUs y GPUs de consumo, sin una pérdida significativa de fidelidad en los embeddings generados.

El modelo base cuenta con 475 millones de parámetros totales, de los cuales solo 305 millones se activan durante la inferencia gracias a la arquitectura MoE. Está entrenado para soportar aproximadamente 100 idiomas y utiliza Matryoshka Embeddings, lo que permite reducir la dimensión del vector de salida sin necesidad de reentrenamiento, ahorrando hasta tres veces en costes de almacenamiento. Esta cuantización GGUF es compatible con `llama.cpp`, `Ollama` y otras herramientas que soporten este formato, lo que facilita su integración en pipelines de búsqueda semántica, sistemas RAG y tareas de similitud textual.

La relevancia de este modelo radica en su capacidad para ofrecer embeddings multilingües de alta calidad con un coste computacional reducido, comparable a modelos del doble de tamaño. La versión cuantizada Q4_K_M mantiene una similitud coseno mínima de 0.992 respecto al baseline F16, según el autor, lo que la hace adecuada para entornos de producción donde el almacenamiento y la latencia son críticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de Expertos (MoE) para embeddings de texto |
| Parametros totales | 475.288.320 (475M) |
| Parametros activos | 305M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este archivo) |
| Idiomas soportados | Multilingüe, aproximadamente 100 idiomas (segun documentacion del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M), el modelo original usa safetensors |

## Arquitectura y entrenamiento

El modelo base `nomic-embed-text-v2-moe` emplea una arquitectura de Mezcla de Expertos (MoE) aplicada a la generación de embeddings de texto. Esta arquitectura activa solo un subconjunto de los parámetros totales durante cada inferencia (305M de 475M), lo que reduce el coste computacional manteniendo la capacidad expresiva. Según el paper asociado (arXiv:2502.07972), es el primer modelo de embeddings MoE de propósito general y supera a modelos de la misma clase de parámetros en benchmarks monolingües y multilingües, siendo competitivo con modelos del doble de tamaño.

El entrenamiento se realizó con más de 1.600 millones de pares de texto multilingües, cubriendo aproximadamente 100 idiomas. Además, se utilizó la técnica de Matryoshka Embeddings, que permite ajustar la dimensión del vector de salida (por ejemplo, 768, 512 o 256) sin reentrenar, ofreciendo flexibilidad para optimizar el equilibrio entre precisión y almacenamiento. No se dispone de información detallada sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO, ya que no se menciona en la documentación disponible.

## Capacidades

- Generación de embeddings de texto para similitud semántica, búsqueda, clasificación y agrupación.
- Soporte multilingüe amplio (aproximadamente 100 idiomas), adecuado para aplicaciones internacionales.
- Matryoshka Embeddings: permite reducir la dimensión del vector de salida sin reentrenamiento, ahorrando almacenamiento y acelerando la comparación.
- Compatible con `llama.cpp` y `Ollama`, lo que facilita su uso en entornos de servidor y edge.
- No es un modelo generativo; su función es exclusivamente extraer representaciones vectoriales de texto.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-step, ya que no aplican a un modelo de embeddings.

## Casos de uso

- Búsqueda semántica multilingüe en bases de conocimiento: el modelo genera embeddings de documentos y consultas en varios idiomas, permitiendo recuperar información relevante mediante similitud coseno. Su tamaño reducido (336 MB) permite desplegarlo en servicios de baja latencia.
- Sistemas de recomendación de contenido: al vectorizar artículos, productos o noticias, se pueden recomendar elementos similares a los usuarios basándose en la distancia entre embeddings, incluso cuando los textos están en idiomas distintos.
- Clasificación de textos: los embeddings generados pueden servir como características de entrada para clasificadores supervisados (regresión logística, SVM, etc.) en tareas como análisis de sentimiento, detección de spam o categorización temática.
- Deduplicación de documentos: comparando embeddings de documentos se pueden identificar duplicados o versiones casi idénticas, útil en pipelines de limpieza de datos o gestión de contenido.
- Chatbots con recuperación aumentada (RAG): el modelo puede indexar una base de conocimiento multilingüe y recuperar fragmentos relevantes para que un modelo generativo los use como contexto, mejorando la precisión de las respuestas en varios idiomas.
- Análisis de similitud entre textos legales o técnicos: en dominios donde se manejan documentos en múltiples idiomas, el modelo permite comparar cláusulas, patentes o especificaciones para encontrar coincidencias o diferencias relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización Q4_K_M en la información disponible. El modelo base `nomic-embed-text-v2-moe` reporta, según su paper, un rendimiento superior a modelos de aproximadamente 300M de parámetros en tareas monolingües y multilingües, y competitivo con modelos del doble de tamaño. Sin embargo, no se incluyen cifras concretas en la documentación proporcionada. Se recomienda consultar el paper original (arXiv:2502.07972) para obtener métricas detalladas.

## Requisitos de hardware

- Tamaño del archivo GGUF: 336 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas GPUs de consumo como GTX 1060, RTX 2060 o superiores.
- Puede ejecutarse en CPU con `llama.cpp` sin problemas, ya que el modelo es pequeño y la carga de inferencia es baja.
- Para despliegue en producción, se recomienda usar `llama.cpp` con compilación optimizada para el hardware objetivo, o `Ollama` para una integración rápida.
- La latencia de inferencia depende del hardware, pero al ser un modelo de embeddings con activación dispersa, es significativamente menor que la de modelos densos del mismo tamaño total.
- No se dispone de datos de throughput específicos para esta cuantización.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa con otras cuantizaciones o modelos de embeddings en la información proporcionada. Como referencia cualitativa, el modelo base se posiciona frente a alternativas como `bge-m3` (multilingüe, 568M parámetros) y `multilingual-e5-large` (560M parámetros), pero no se han encontrado datos de rendimiento comparativos para esta versión cuantizada. Se recomienda evaluar el modelo en el caso de uso concreto antes de elegirlo.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce una ligera pérdida de calidad en los embeddings, aunque el autor reporta una similitud coseno mínima de 0.992 frente al baseline F16. Para aplicaciones que requieran máxima precisión, se recomienda usar la versión FP16.
- El modelo no es generativo; solo produce representaciones vectoriales. No puede utilizarse para generar texto ni responder preguntas directamente.
- La longitud de contexto máxima no está especificada en la documentación disponible, lo que puede limitar su uso con textos muy largos. Se debe verificar experimentalmente.
- Al ser un modelo multilingüe entrenado con datos web, puede presentar sesgos culturales o geográficos en los embeddings generados para ciertos idiomas o regiones.
- No se han documentado restricciones de uso comercial más allá de la licencia Apache 2.0, que permite uso libre con atribución.
- Para entornos de producción, es recomendable validar la calidad de los embeddings en el dominio específico y con el idioma objetivo, ya que la cuantización puede afectar a casos límite.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/majentik/nomic-embed-text-v2-moe-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe
- Paper original (arXiv): https://arxiv.org/abs/2502.07972
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Página del modelo en Ollama: https://ollama.com/library/nomic-embed-text-v2-moe
- Garden hub del autor: https://huggingface.co/majentik/garden
