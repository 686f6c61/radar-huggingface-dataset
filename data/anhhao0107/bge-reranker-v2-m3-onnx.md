# AnhHao0107/bge-reranker-v2-m3-onnx

## Resumen

El modelo AnhHao0107/bge-reranker-v2-m3-onnx es una conversión a formato ONNX del cross-encoder BAAI/bge-reranker-v2-m3, desarrollado por el usuario AnhHao0107. Se trata de un modelo de reranking de pares de texto basado en la arquitectura XLM-RoBERTa, que asigna una puntuación de relevancia a cada par (consulta, documento) en lugar de generar embeddings independientes. Su propósito principal es reordenar los resultados de una búsqueda o recuperación semántica para mejorar la precisión de sistemas de recuperación aumentada por generación (RAG), búsqueda empresarial o filtrado de documentos.

La relevancia de esta conversión a ONNX radica en que permite ejecutar el modelo en entornos de producción con inferencia más eficiente que PyTorch puro, aprovechando el runtime ONNX en CPU o GPU sin dependencias pesadas. El modelo base, desarrollado por BAAI, tiene 278 millones de parámetros y soporta una longitud de contexto de 8192 tokens, lo que lo convierte en una opción ligera en comparación con los rerankers basados en LLMs. La conversión mantiene la arquitectura original del cross-encoder, con una salida de logits para clasificación de secuencias, y está disponible en el ecosistema de sentence-transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (transformador encoder-only) |
| Parametros totales | 278 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (formato ONNX sin cuantizacion declarada) |
| Idiomas soportados | multilingue (100+ idiomas, heredado del modelo base) |
| Licencia | no disponible |
| Formato de pesos | ONNX (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de tipo encoder-only basado en XLM-RoBERTa, una arquitectura transformer que procesa pares de texto concatenados (consulta y documento) separados por un token de separación. A diferencia de los modelos de embedding bi-encoder, no genera representaciones vectoriales independientes, sino que produce directamente una puntuación de relevancia mediante una cabeza de clasificación de secuencias con una única salida logit. Esta arquitectura permite una mayor interacción entre los tokens de ambas secuencias, lo que suele traducirse en una mejor precisión de ranking a costa de mayor coste computacional por par.

El modelo base BAAI/bge-reranker-v2-m3 fue entrenado por BAAI con datos multilingües de pares consulta-documento, utilizando técnicas de fine-tuning supervisado sobre el corpus de XLM-RoBERTa. La conversión a ONNX fue realizada con el runtime de transformers (ORTModelForSequenceClassification) y la librería sentence-transformers en su versión 5.7.0, manteniendo la misma arquitectura y pesos originales. No se han documentado innovaciones técnicas adicionales en la conversión, más allá de la optimización del formato de inferencia.

## Capacidades

- Reranking de pares de texto: asigna una puntuación de relevancia a cada par (consulta, documento), permitiendo ordenar resultados según su similitud semántica.
- Búsqueda semántica: integrable en pipelines de recuperación de información para refinar los resultados de un primer paso de recuperación (por ejemplo, embeddings).
- Soporte multilingüe: hereda la capacidad de XLM-RoBERTa de manejar más de 100 idiomas, lo que permite su uso en escenarios de búsqueda global o multilingüe.
- Clasificación de secuencias: su arquitectura de cross-encoder puede adaptarse a tareas de clasificación de pares de texto, aunque su uso principal es el ranking.
- Integración con sentence-transformers: compatible con la API estándar de CrossEncoder para carga, predicción y ranking, lo que facilita su uso en pipelines existentes.
- Inferencia eficiente en CPU: al estar en formato ONNX, puede ejecutarse sin GPU y con menor latencia que el modelo original en PyTorch en entornos sin aceleración.

## Casos de uso

- **Recuperación aumentada por generación (RAG)**: el modelo se integra en la etapa de reranking de un pipeline RAG, donde se recuperan cientos de documentos con un primer recuperador (por ejemplo, embeddings) y el cross-encoder reordena los top-k resultados para mejorar la precisión de las respuestas generadas. Su contexto de 8192 tokens permite procesar documentos largos sin truncamiento.
- **Búsqueda empresarial**: en plataformas de búsqueda interna de una organización, se puede usar para refinar resultados de consultas en bases de conocimiento, wikis o documentación técnica, mejorando la relevancia de los primeros resultados mostrados al usuario.
- **Filtrado de documentos en soporte técnico**: en sistemas de atención al cliente, el modelo puede clasificar artículos de ayuda o tickets previos según su relevancia a la consulta de un usuario, reduciendo el tiempo de resolución al presentar los recursos más pertinentes.
- **Ranking de resultados en motores de búsqueda web**: como capa de reranking en buscadores verticales (por ejemplo, de productos, noticias o patentes), el modelo ordena los resultados iniciales basados en coincidencia léxica o embeddings, mejorando la relevancia percibida.
- **Comparación de pares de textos en legal o biomédico**: en dominios con documentos extensos, el modelo puede evaluar la similitud entre cláusulas, artículos científicos o informes, ayudando en tareas de análisis comparativo o detección de duplicados.
- **Sistemas de recomendación basados en contenido**: se puede usar para reranker los ítems candidatos generados por un sistema de recomendación, puntuando la relevancia de cada ítem respecto a la consulta o perfil del usuario, mejorando la personalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión ONNX en la información disponible. El modelo base BAAI/bge-reranker-v2-m3 tiene resultados públicos en tareas de reranking multilingüe (por ejemplo, en el benchmark MIRACL), pero esos datos no se incluyen en la documentación de esta variante ONNX. Se recomienda validar el rendimiento en el caso de uso concreto, ya que la conversión ONNX no altera la arquitectura pero puede afectar ligeramente la latencia y el throughput en función del runtime utilizado.

## Requisitos de hardware

- **VRAM estimada**: con 278 millones de parámetros, el modelo en FP32 ocupa aproximadamente 1,1 GB; en ONNX con cuantización INT8 podría reducirse a unos 300-400 MB. Para inferencia en CPU no se requiere VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32; en GPUs de consumo como la RTX 3060 o RTX 4090 se obtienen latencias de unos pocos milisegundos por par de textos. En entornos de producción con mucha carga, se recomienda una A10 o A100.
- **Compatibilidad con GPUs de consumo**: sí, cabe en cualquier GPU de consumo moderna, incluso en modelos integrados como la RTX 2060 o superiores, gracias a su tamaño compacto.
- **Opciones de despliegue**: se puede servir con ONNX Runtime (ORT), compatible con vLLM (aunque no es el caso típico para cross-encoders), llama.cpp no aplica (no es un LLM generativo), y se integra fácilmente con la librería sentence-transformers en un servidor Python o en un contenedor FastAPI.
- **Latencia y throughput**: en una GPU RTX 4090, la inferencia de un par de textos con 512 tokens tarda aproximadamente 5-10 ms; en CPU (por ejemplo, un AMD EPYC) puede estar en el rango de 50-100 ms por par, dependiendo de la cuantización y el número de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| AnhHao0107/bge-reranker-v2-m3-onnx | 278 M | 8192 | ONNX | no disponible | Reranking multilingue |
| BAAI/bge-reranker-v2-m3 | 278 M | 8192 | safetensors (PyTorch) | MIT | Reranker multilingue (modelo original) |
| BAAI/bge-reranker-v2-minicpm-layerwise | 2.6 B | 8192 | safetensors | MIT | Reranker de alto rendimiento (basado en MiniCPM) |
| onnx-community/bge-reranker-v2-m3-ONNX | 278 M | 8192 | ONNX | MIT | Reranker, conversión ONNX de la comunidad |

La comparativa muestra que esta conversión ONNX es funcionalmente idéntica al modelo original de BAAI, con la diferencia del formato de pesos. La variante de la comunidad onnx-community ofrece una alternativa similar con licencia MIT, mientras que la opción minicpm-plus ofrece mayor precisión a coste de más parámetros. La elección entre ellas dependerá del balance entre rendimiento y requisitos de hardware.

## Limitaciones y advertencias

- **Modelo de reranking, no de generación**: no genera texto ni respuestas; solo puntúa pares de textos. No debe usarse como un LLM de propósito general.
- **Licencia no disponible**: la model card no especifica la licencia de esta conversión, por lo que el uso comercial puede ser arriesgado. Se recomienda verificar la licencia del modelo base (MIT) y confirmar con el autor antes de su uso en producción.
- **Sesgos heredados del modelo base**: al ser una conversión de XLM-RoBERTa, puede heredar sesgos de género, raza o idioma presentes en los datos de entrenamiento originales, lo que podría afectar a la imparcialidad en tareas de ranking en dominios sensibles.
- **Riesgo de alucinación**: no es aplicable directamente, ya que no genera contenido, pero la puntuación de relevancia puede ser incorrecta para consultas ambiguas o fuera del dominio de entrenamiento, lo que puede degradar la calidad del ranking.
- **Limitaciones de contexto**: aunque soporta 8192 tokens, los documentos muy largos pueden truncarse, perdiendo información relevante en las últimas partes del texto.
- **Restricciones de uso comercial**: al no disponer de licencia explícita, se recomienda contactar con el autor o usar la versión original con licencia MIT para garantizar la seguridad legal en entornos comerciales.
- **Dependencia del runtime**: la inferencia en ONNX requiere instalar onnxruntime, lo que añade una dependencia adicional al entorno de despliegue.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AnhHao0107/bge-reranker-v2-m3-onnx)
- [Modelo base BAAI/bge-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)
- [Conversión ONNX de la comunidad onnx-community/bge-reranker-v2-m3-ONNX](https://huggingface.co/onnx-community/bge-reranker-v2-m3-ONNX)
- [Documentación de Cross Encoder en Sentence Transformers](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
- [Documentación de BGE-Reranker-v2 en BGE](https://bge-model.com/bge/bge_reranker_v2.html)
- [Repositorio de ejemplo de uso con HuggingFace](https://github.com/LazaUK/HuggingFace-BAAI-BGERerankerv2m3)
- [Blog de entrenamiento de reranker de Sentence Transformers](https://huggingface.co/blog/train-reranker)
