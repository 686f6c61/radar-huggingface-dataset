# ebasKing/Qwen3-Reranker-8B-GGUF-llama_cpp

## Resumen

Qwen3-Reranker-8B es un modelo de reranking de la familia Qwen3, desarrollado por Alibaba Qwen, que se utiliza para ordenar documentos según su relevancia respecto a una consulta. Este repositorio concreto, `ebasKing/Qwen3-Reranker-8B-GGUF-llama_cpp`, es una conversión al formato GGUF del modelo original para poder ejecutarlo con llama.cpp y sus servidores como `llama-server`. La conversión ha sido realizada con la herramienta oficial `convert_hf_to_gguf.py`, lo que garantiza que los tensores específicos del reranker (como el clasificador de salida) estén correctamente incluidos, evitando los errores de puntuación que presentan otras conversiones no oficiales.

El modelo tiene 7.567 millones de parámetros (aproximadamente 8B) y está disponible en dos cuantizaciones: F16 (precisión completa) y Q8_0 (cuantización de 8 bits). Su propósito principal es mejorar la precisión de sistemas de búsqueda y recuperación de información, especialmente en pipelines de generación aumentada por recuperación (RAG), donde actúa como segunda etapa de filtrado tras un modelo de embeddings.

Este GGUF es relevante porque permite desplegar el reranker en entornos de producción con hardware moderado, utilizando la infraestructura madura de `llama.cpp`. A diferencia de otras conversiones que producen puntuaciones de relevancia incorrectas (por ejemplo, `4.5e-23`), esta conversión está verificada y funciona correctamente, como se muestra en los ejemplos de la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Qwen3, cross-encoder para reranking) |
| Parametros totales | 7.567.320.064 (aproximadamente 7,57 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de configuracion sugiere 32768 tokens) |
| Tipos de cuantizacion | F16 (14,10 GB) y Q8_0 (7,49 GB) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura Qwen3, diseñado específicamente para la tarea de reranking. A diferencia de un modelo de embeddings que produce representaciones vectoriales independientes para consulta y documento, un cross-encoder procesa conjuntamente la consulta y cada documento, lo que permite una mayor precisión en la clasificación de relevancia. La conversión a GGUF extrae el clasificador de salida (`cls.output.weight`) del `lm_head` y configura los metadatos necesarios para que `llama.cpp` pueda computar las puntuaciones de relevancia.

No se dispone de información detallada sobre el proceso de entrenamiento (tokens, composición del dataset, técnicas como RLHF o DPO) en la documentación proporcionada. El modelo base es `Qwen/Qwen3-Reranker-8B`, del que se conoce que es parte de la familia Qwen3, pero los detalles específicos del entrenamiento del reranker no se encuentran en esta información.

## Capacidades

- Reranking de documentos: dado un conjunto de documentos y una consulta, asigna una puntuación de relevancia a cada documento, permitiendo ordenarlos de mayor a menor relevancia.
- Integración con `llama.cpp` y `llama-server`: se puede desplegar como un servicio HTTP mediante el endpoint `/v1/rerank`, que acepta una consulta y una lista de documentos y devuelve las puntuaciones ordenadas.
- Compatibilidad con pipelines de RAG: se utiliza como segunda etapa de filtrado después de un modelo de embeddings para mejorar la precisión de los resultados recuperados.
- Soporte para cuantización: los archivos GGUF permiten elegir entre F16 (mayor precisión) y Q8_0 (menor uso de memoria) según las necesidades de hardware y rendimiento.
- No incluye capacidades de generación de texto, tool calling, agentes o visión. Es exclusivamente un modelo de reranking.

## Casos de uso

- Búsqueda de información en bases de conocimiento: dado un corpus de documentos técnicos, el modelo puede ordenar los resultados de una búsqueda inicial (obtenidos mediante embeddings) para mostrar primero los documentos más relevantes a la consulta del usuario.
- Sistemas de recuperación aumentada por generación (RAG): en un pipeline de RAG, el reranker se sitúa entre el recuperador (embedding) y el generador, filtrando los pasajes más relevantes antes de pasarlos al LLM para generar una respuesta.
- Atención al cliente automatizada: en un chatbot que consulta una base de preguntas frecuentes, el reranker puede clasificar las posibles respuestas según la consulta del cliente, mejorando la precisión de las respuestas automáticas.
- Motores de búsqueda corporativa: para intranets o plataformas de documentos internos, el modelo puede reordenar los resultados de una búsqueda basada en palabras clave o embeddings, priorizando los documentos más relevantes.
- Moderación de contenido o clasificación de tickets: dado un conjunto de categorías o etiquetas, el reranker puede clasificar un texto en la categoría más apropiada, aunque su uso principal es la relevancia entre consulta y documento.
- Evaluación de relevancia en sistemas de recomendación: en plataformas de contenido, el modelo puede puntuar la relevancia entre una consulta de usuario y un conjunto de ítems (noticias, productos, etc.) para generar recomendaciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos de reranking en esta documentación.

## Requisitos de hardware

- VRAM estimada: el archivo F16 ocupa 14,10 GB y el Q8_0 7,49 GB. Además, se debe considerar el overhead de contexto y los buffers de `llama.cpp`, por lo que se recomienda al menos 16 GB de VRAM para la versión F16 y 8 GB para la Q8_0.
- GPUs recomendadas: una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 3090) puede ejecutar la versión Q8_0 con contexto de hasta 32K tokens; para la F16 se recomienda una GPU con 24 GB (RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: sí, la versión Q8_0 es adecuada para GPUs de consumo de 8-12 GB, como RTX 3080, RTX 4060 Ti, etc., siempre que se ajuste el tamaño de contexto.
- Opciones de despliegue: `llama-server` (incluido en llama.cpp) con el flag `--reranking --pooling rank --embedding`; también se puede usar `llama-cli` o integrar el modelo en aplicaciones personalizadas mediante la API de llama.cpp.
- Latencia y throughput: no se proporcionan datos específicos. Dependiendo del hardware, la latencia de un reranking de 100 documentos con un contexto de 512 tokens suele estar en el rango de milisegundos a pocos segundos en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|--------|------------|----------|----------|---------|---------------|
| Qwen3-Reranker-8B (original) | 7,57B | no disponible | Apache 2.0 | safetensors | Modelo original, no cuantizado, requiere más memoria |
| Qwen3-Reranker-8B-GGUF (QuantFactory) | 7,57B | no disponible | Apache 2.0 | GGUF | Conversión GGUF alternativa, puede tener problemas de puntuación si no se usa el convertidor oficial |
| Qwen3-Reranker-8B-GGUF (ethicalabs) | 7,57B | no disponible | Apache 2.0 | GGUF | Otra conversión GGUF, sin garantía de funcionamiento correcto |
| Qwen3-Reranker-8B-GGUF (ModelScope) | 7,57B | no disponible | Apache 2.0 | GGUF | Conversión en ModelScope, tamaño de repositorio 36,19 GB (incluye múltiples cuantizaciones) |

Nota: este repositorio de ebasKing se distingue porque su conversión fue realizada con la herramienta oficial y verifica que el modelo produce puntuaciones correctas, a diferencia de otras conversiones comunitarias que pueden estar rotas.

## Limitaciones y advertencias

- Es un modelo de reranking, no un modelo generativo. No puede generar texto ni mantener conversaciones.
- No se dispone de información sobre los idiomas soportados. Se recomienda verificar el rendimiento en el idioma de uso antes de desplegarlo en producción.
- La longitud de contexto no está documentada oficialmente en la información proporcionada. El ejemplo de configuración sugiere 32768 tokens, pero no hay garantía de que funcione correctamente en todos los casos.
- Riesgo de sesgos: al ser un modelo entrenado con datos de internet, puede presentar sesgos de género, raza o idioma en las puntuaciones de relevancia, aunque no se han evaluado específicamente.
- Alucinación: no aplica directamente, pero el reranker puede asignar puntuaciones altas a documentos irrelevantes si el contenido está fuera del dominio de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir la atribución correspondiente.
- Para producción, se recomienda validar las puntuaciones en un conjunto de datos propio y considerar la posibilidad de que la cuantización Q8_0 degrade ligeramente la precisión respecto a F16.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/ebasKing/Qwen3-Reranker-8B-GGUF-llama_cpp
- Modelo original (safetensors): https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Issue de llama.cpp sobre GGUFs rotos de Qwen3-Reranker: https://github.com/ggml-org/llama.cpp/issues/16407
- Guía de configuración multi-modelo (embedding + reranker + chat): https://gist.github.com/VooDisss/42bce4eb5c76d3c325633886c5e348ee
- Otras conversiones de Qwen3-Reranker: https://huggingface.co/QuantFactory/Qwen3-Reranker-8B-GGUF, https://huggingface.co/ethicalabs/Qwen3-Reranker-8B-GGUF, https://www.modelscope.cn/models/dengcao/Qwen3-Reranker-8B-GGUF
