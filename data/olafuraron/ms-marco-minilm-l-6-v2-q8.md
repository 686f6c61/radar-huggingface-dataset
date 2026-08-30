# olafuraron/ms-marco-MiniLM-L-6-v2-q8

## Resumen

Este repositorio contiene una versión cuantizada en Q8 del modelo cross-encoder `ms-marco-MiniLM-L6-v2`, publicada por el usuario `olafuraron`. El modelo original fue desarrollado por el equipo de cross-encoder (con contribuciones de Microsoft) para tareas de reranking de pasajes en sistemas de recuperación de información. Se trata de un cross-encoder, es decir, una arquitectura que procesa conjuntamente la consulta y el pasaje para producir una puntuación de relevancia, a diferencia de los bi-encoders que generan representaciones independientes.

La relevancia de esta cuantización radica en que permite ejecutar el modelo con un menor consumo de memoria y una inferencia más rápida, manteniendo en gran medida la calidad del modelo original. El formato Q8 (cuantización de 8 bits) es habitual en despliegues en CPU o en entornos con recursos limitados, como servidores de inferencia o aplicaciones embebidas. Aunque la ficha oficial apenas contiene metadatos, la naturaleza del modelo es clara: un clasificador de pares consulta-pasaje basado en la arquitectura MiniLM-L6.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniLM-L6 (transformer encoder, cross-encoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el original soporta 512 tokens) |
| Tipos de cuantizacion | Q8 (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente GGUF, no confirmado) |

## Arquitectura y entrenamiento

El modelo base `cross-encoder/ms-marco-MiniLM-L6-v2` se construye sobre MiniLM, una versión compacta de BERT con 6 capas de transformador. Fue entrenado en el conjunto de datos MS MARCO Passage Ranking, donde se optimiza para asignar una puntuación de relevancia a cada par consulta-pasaje. La arquitectura de cross-encoder es especialmente eficaz para reranking porque captura interacciones profundas entre las dos secuencias de entrada.

La versión cuantizada Q8 conserva la misma arquitectura y los mismos pesos, pero cada valor se representa con 8 bits en lugar de 32 bits (float32) o 16 bits (float16). Esto reduce el tamaño del modelo aproximadamente cuatro veces respecto al original y acelera la inferencia en hardware que soporta operaciones de 8 bits. No se dispone de información sobre el proceso exacto de cuantización (calibración, datos utilizados, etc.) en la ficha del repositorio.

## Capacidades

- Reranking de pasajes: dado un par (consulta, pasaje), produce una puntuación numérica que indica la relevancia del pasaje para la consulta.
- Integración en pipelines de recuperación: se utiliza como segunda etapa tras un recuperador inicial (bi-encoder o BM25) para reordenar los resultados.
- Clasificación binaria o por puntuación: puede adaptarse para clasificar pares como relevantes o irrelevantes.
- No tiene capacidad generativa: no produce texto, solo puntuaciones.
- No soporta tool calling ni razonamiento multi-paso más allá de la tarea de clasificación.

## Casos de uso

- Mejora de motores de búsqueda internos: un sistema que recupera documentos con BM25 puede usar este cross-encoder para reordenar los 100 primeros resultados y quedarse con los 10 más relevantes.
- Sistemas RAG (generación aumentada por recuperación): antes de pasar los documentos al modelo generativo, se rerankean con el cross-encoder para seleccionar los pasajes más pertinentes y reducir ruido.
- Filtrado de resultados en chatbots de soporte: cuando una base de conocimiento devuelve muchas respuestas candidatas, el cross-encoder ayuda a elegir la más adecuada.
- Moderación de contenido: clasificar pares de texto (por ejemplo, consulta y contenido) para decidir si el contenido responde adecuadamente.
- Evaluación de relevancia en datasets: generar anotaciones automáticas de relevancia para conjuntos de datos de entrenamiento.
- Sistemas de recomendación textual: puntuar la relevancia entre una consulta del usuario y descripciones de ítems para sugerir los más apropiados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `cross-encoder/ms-marco-MiniLM-L6-v2` reporta métricas en MS MARCO (MRR@10, NDCG@10), pero no se dispone de esos datos en la ficha del repositorio cuantizado. No se puede confirmar si la versión Q8 mantiene exactamente el mismo rendimiento que el modelo en float32.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización Q8, el modelo ocupa aproximadamente 22-25 MB (el original tiene unos 90 MB en float32). Puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no requiere GPU; funciona bien en CPU. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: puede usarse con librerías que soporten cuantización GGUF (llama.cpp, Ollama, etc.) si el formato es GGUF, aunque no está confirmado. También puede cargarse directamente con transformers si se convierte a safetensors.
- Latencia y throughput: no hay datos específicos, pero al ser un modelo pequeño y cuantizado, la inferencia es muy rápida (del orden de milisegundos por par en CPU moderna).

## Comparativa con modelos similares

No se dispone de comparativas con otras cuantizaciones del mismo modelo ni con alternativas. El modelo base puede compararse con otros cross-encoders como `cross-encoder/ms-marco-MiniLM-L12-v2` (versión con 12 capas, mayor precisión pero más lento) o con bi-encoders como `sentence-transformers/all-MiniLM-L6-v2`. Sin embargo, al ser una cuantización sin información adicional, no se puede ofrecer una comparativa fiable.

## Limitaciones y advertencias

- La cuantización Q8 puede introducir una ligera pérdida de precisión respecto al modelo original en float32, aunque en la práctica suele ser mínima.
- El modelo está diseñado para el reranking de pasajes en inglés (el dataset MS MARCO es en inglés). No se garantiza su rendimiento en otros idiomas.
- La longitud máxima de entrada es de 512 tokens (limitación del modelo MiniLM). Consultas o pasajes más largos deben truncarse.
- No es un modelo generativo; no puede producir respuestas de texto.
- No se dispone de información sobre sesgos o alucinaciones, pero al ser un clasificador, el riesgo de alucinación es bajo; el riesgo principal es la mala puntuación en casos fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original y del dataset MS MARCO.
- El repositorio no incluye documentación sobre el proceso de cuantización ni sobre el formato exacto de los pesos, lo que puede dificultar su integración.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/olafuraron/ms-marco-MiniLM-L-6-v2-q8
- Modelo original: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Versión ONNX (Xenova): https://huggingface.co/Xenova/ms-marco-MiniLM-L-6-v2
- Artículo de referencia sobre el modelo (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/ms-marco-minilm-l6-v2-cross-encoder
- Artículo de referencia (variante): https://www.aimodels.fyi/models/huggingFace/ms-marco-minilm-l-6-v2-cross-encoder
