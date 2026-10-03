# Aureliolo/steamgauge-search-reranker

# SteamGauge search reranker

## Resumen

SteamGauge search reranker es un modelo de reordenación (reranking) de texto publicado por el desarrollador Aureliolo bajo el identificador `Aureliolo/steamgauge-search-reranker`. No es un modelo entrenado desde cero: se trata de una exportación a ONNX en media precisión (FP16) del modelo `Qwen/Qwen3-Reranker-0.6B` de Alibaba Qwen, con los pesos sin modificar. Su función es actuar como cross-encoder en la segunda etapa de un pipeline de búsqueda, puntuando pares consulta-documento para reordenar los candidatos devueltos por un recuperador previo.

El modelo resuelve un problema concreto: en el proyecto SteamGauge, un buscador que analiza corpus completos de reseñas de Steam, un encoder denso recupera las afirmaciones potencialmente relevantes y este reranker las ordena por probabilidad de responder a la consulta del usuario. El pipeline declarado es `text-ranking` y el repositorio ocupa 1,3 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de despliegue de un reranker en formato ONNX, útil para entornos que no disponen de PyTorch o que necesitan ejecución sobre DirectML. Por otro, sirve como referencia de un patrón habitual: tomar un modelo base de Qwen, exportarlo y especializar su uso dentro de una aplicación concreta. El autor reporta una paridad de puntuaciones con el modelo original de 0,0076 sobre DirectML.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en un transformer decoder (Qwen3) con capa de salida reducida a los tokens "yes"/"no"; exportado como grafo ONNX |
| Parametros totales | 0,6 mil millones (heredado del modelo base `Qwen/Qwen3-Reranker-0.6B`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base Qwen3-0.6B; no confirmado en la informacion proporcionada para esta exportacion |
| Tipos de cuantizacion | Media precisión (FP16) en ONNX; no se documentan variantes GGUF, INT8 ni INT4 en el repositorio |
| Idiomas soportados | No disponible en la informacion proporcionada; hereda el comportamiento multilingue del modelo base Qwen3 |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) junto con `tokenizer.json`; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo es un reranker de tipo cross-encoder: recibe conjuntamente la consulta y el documento candidato y produce una única puntuación de relevancia, en lugar de comparar embeddings calculados por separado. La entrada sigue la plantilla del modelo original, con turnos de sistema y usuario que contienen las etiquetas `<Instruct>`, `<Query>` y `<Document>`. La exportación ONNX expone dos entradas (`input_ids` y `attention_mask`, con padding a la derecha) y una salida (`score`): la probabilidad de que un pasaje responda a la consulta, calculada a partir de los logits de los tokens "yes" y "no" en la última posición. El grafo conserva únicamente esas dos filas de la capa de salida, lo que reduce el tamano del modelo exportado.

No hubo entrenamiento ni ajuste fino adicional por parte de Aureliolo: la model card indica explícitamente que los pesos son los de Qwen, sin cambios, y que "el modelo es obra de Qwen". Por tanto, los detalles de composición del dataset, número de tokens de entrenamiento y uso de RLHF o DPO corresponden al proceso de Qwen y no se documentan en la información disponible para esta ficha. La innovación técnica de esta publicación es de ingeniería de despliegue: la conversión a un grafo ONNX de media precisión con paridad numérica verificada frente al original sobre DirectML (diferencia máxima de 0,0076 en las puntuaciones), lo que permite ejecutar el reranker sin una pila de PyTorch.

## Capacidades

- Reordenación de pasajes o documentos según su relevancia para una consulta, devolviendo una puntuación probabilística de respuesta.
- Búsqueda semántica de dos etapas: recuperación previa con un encoder denso y refinamiento del orden con este cross-encoder.
- Puntuación de pares consulta-documento con formato de prompt estructurado (`<Instruct>`, `<Query>`, `<Document>`).
- Ejecución en formato ONNX con entradas `input_ids` y `attention_mask`, compatible con runtimes que no dependen de PyTorch.
- Despliegue sobre DirectML con paridad de puntuaciones verificada frente al modelo original.
- Herencia de las capacidades lingüísticas del modelo base Qwen3-0.6B, aunque no se documentan en la información proporcionada.
- No se documentan capacidades de generación de texto libre, tool calling, function calling, uso como agente, visión, audio ni modo de razonamiento explícito: la capa de salida está recortada a dos tokens.

## Casos de uso

- Búsqueda semántica sobre reseñas de videojuegos: el caso original del proyecto SteamGauge. Un encoder recupera las afirmaciones de las reseñas cercanas por significado a la consulta y este reranker las ordena, permitiendo medir cuántos jugadores mencionan cada tema y no solo qué dicen las reseñas más votadas.
- Análisis de opinión agregado a escala de corpus: al ordenar por relevancia cientos o miles de fragmentos de reseñas, se pueden cuantificar temas recurrentes (rendimiento, bugs, monetización, narrativa) y comparar su frecuencia real frente a su visibilidad en la parte alta de la lista de valoraciones.
- Segunda etapa de un pipeline RAG: tras una recuperación híbrida (densa y léxica), el reranker refina el orden de los fragmentos antes de pasarlos a un modelo generador, mejorando la precisión del contexto inyectado.
- Búsqueda interna de documentación técnica: sobre un corpus de manuales o issues, el modelo puntúa qué fragmento responde mejor a una consulta de soporte antes de mostrarlo al usuario.
- Moderación y triaje de contenido: ordenar quejas o reportes de una cola por su relevancia respecto a criterios definidos, priorizando la revisión humana.
- Evaluación de sistemas de recuperación: usar las puntuaciones del reranker como referencia para medir la calidad de un recuperador denso o de un índice léxico en pruebas comparativas.
- Despliegue en entornos con restricciones de runtime: al ser un grafo ONNX de aproximadamente 1,3 GB, puede integrarse en aplicaciones de escritorio o servicios que ejecutan inferencia sobre DirectML o CPU sin instalar PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comprobación de paridad con el modelo original `Qwen/Qwen3-Reranker-0.6B` sobre DirectML, con diferencias en las puntuaciones inferiores o iguales a 0,0076. No se ofrecen métricas de nDCG, MRR, MAP ni comparaciones cuantitativas con otros rerankers.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB en FP16, dado que los pesos ocupan aproximadamente 1,2 GB y el repositorio completo 1,3 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo es deliberadamente pequeno y no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU dedicada moderna e incluso en iGPU mediante DirectML, que es el backend con el que el autor verificó la paridad.
- Opciones de despliegue: ONNX Runtime, ONNX Runtime con execution provider de DirectML, y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse pesos en safetensors ni GGUF, estas rutas no están disponibles directamente.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia por par consulta-documento ni de documentos procesados por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| SteamGauge search reranker | 0,6 B | ONNX FP16 | No confirmado en la informacion proporcionada | Apache-2.0 | Exportacion del reranker de Qwen; pesos sin cambios; paridad de 0,0076 frente al original |
| Qwen/Qwen3-Reranker-0.6B | 0,6 B | Safetensors (PyTorch) | 32 768 tokens segun el modelo base | Apache-2.0 | Modelo original de Qwen; requiere pila PyTorch |
| Qwen/Qwen3-Reranker-4B | 4 B | Safetensors (PyTorch) | No disponible en la informacion proporcionada | Apache-2.0 | Version mayor de la misma familia; mayor coste de memoria y computo |
| BAAI/bge-reranker-v2-m3 | No disponible en la informacion proporcionada | Safetensors, ONNX | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Reranker multilingue de referencia; datos de rendimiento no verificados aqui |

No se dispone de comparaciones de rendimiento medidas entre estos modelos en la información proporcionada, por lo que la tabla refleja únicamente diferencias de tamano, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo para esta exportación; al conservar los pesos de Qwen3-Reranker-0.6B, hereda los del modelo original, no auditados en la información disponible.
- Riesgo de alucinación: el modelo no genera texto, por lo que el riesgo se traslada a la puntuación. Un `score` alto no garantiza que el pasaje sea factualmente correcto, solo que se aproxima a la distribución de relevancia aprendida.
- Limitaciones de contexto e idioma: no se confirman en la información proporcionada la ventana de contexto efectiva de esta exportación ni los idiomas soportados. El modelo base Qwen3 es multilingue, pero no hay verificación específica para este reranker.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya a Qwen como autor del modelo. El autor de la exportación lo indica de forma explícita.
- Caveat de despliegue: el repositorio no incluye safetensors ni GGUF, por lo que no se puede cargar directamente con transformers, llama.cpp, Ollama o vLLM sin una conversión previa.
- Advertencia de producción: la model card está redactada para un caso de uso muy concreto (reseñas de Steam). No se ha validado el rendimiento del reranker fuera de ese dominio y no hay métricas publicadas de nDCG o MRR.
- Madurez del artefacto: el modelo registra 0 descargas y 1 "like" en HuggingFace, con fechas de creación y actualización del 3 de octubre de 2026 separadas por 23 segundos, lo que sugiere una publicación reciente y sin recorrido de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aureliolo/steamgauge-search-reranker
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Repositorio GitHub de SteamGauge: https://github.com/Aureliolo/steamgauge
- Issues del repositorio: https://github.com/Aureliolo/steamgauge/issues
- DOI asociado: https://doi.org/10.57967/hf/10733
- Paper sobre benchmarking de modelos de ranking en recuperación de texto: https://arxiv.org/html/2409.07691
- Tutorial sobre búsqueda híbrida, reranking y evaluación en RAG: https://rubythalib.ai/en/articles/tutorial-rag-advanced-hybrid-search-reranking-dan-evaluasi
- Explorador de modelos de reranking en HuggingFace: https://huggingface.co/models?search=rerank
