# masakanomasaka/llm2026-ruri-v3-reranker-310m-ft

## Resumen

llm2026-ruri-v3-reranker-310m-ft es un modelo de reranking (reordenación de documentos candidatos) para recuperación de información en japonés, desarrollado por el usuario masakanomasaka como proyecto final del curso «LLM講座2 2026». Se trata de un ajuste fino completo (todos los parámetros, una época) del modelo cl-nagoya/ruri-v3-reranker-310m, un reranker basado en la arquitectura ModernBERT con 315.203.329 parámetros totales según los pesos en safetensors.

El modelo mantiene exactamente la misma estructura que su base: no introduce cambios arquitectónicos, sino que se reentrena sobre un conjunto de datos derivado de JSQuAD/JGLUE (CC BY-SA 4.0) y de una colección de fragmentos de Wikipedia japonesa. El problema que aborda es el de la segunda fase de un pipeline RAG: dado un conjunto de pasajes recuperados por un retriever, puntuar y reordenar su relevancia respecto a una consulta.

Su relevancia es limitada y experimental: el repositorio no registra descargas ni interacciones, no declara licencia propia (hereda la del modelo base) y no publica resultados de evaluación. Es un artefacto de investigación docente más que un modelo listo para producción, útil como referencia para quienes trabajan con rerankers japoneses de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), misma estructura que el modelo base |
| Parametros totales | 315.203.329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (datos de entrenamiento en japonés) |
| Licencia | no disponible (el autor indica que se rige por la licencia del modelo base cl-nagoya/ruri-v3-reranker-310m) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, con la misma topología que cl-nagoya/ruri-v3-reranker-310m. Al ser un reranker, su salida es una puntuación de relevancia para un par consulta-pasaje, no texto generado. El ajuste fino abarca todos los parámetros durante una única época, sin que el autor documente cambios en la cabeza de clasificación ni en la tokenización.

Los datos de entrenamiento proceden de JSQuAD/JGLUE (licencia CC BY-SA 4.0), modificados de forma mecánica: para cada pregunta se seleccionan fragmentos que contienen la respuesta correcta y fragmentos que no la contienen, y se formatean como ejemplos de entrenamiento. Se complementa con una colección distribuida de fragmentos derivados de Wikipedia japonesa (también CC BY-SA 4.0). Todo el entrenamiento se realizó en Google Colab. No se documentan técnicas de RLHF, DPO, decodificación especulativa ni atención lineal más allá de lo que aporte ModernBERT de serie.

## Capacidades

- Reranking de pasajes: puntúa pares consulta-documento para reordenar resultados de un retriever previo.
- Recuperación de información en japonés: entrenado sobre JSQuAD y Wikipedia japonesa.
- Integración en pipelines RAG de dos fases (retrieval + rerank).
- No se documentan capacidades de generación de texto, razonamiento libre, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; los datos de entrenamiento son exclusivamente japoneses.

## Casos de uso

- RAG sobre documentación interna en japonés: el modelo reordena los fragmentos recuperados por un retriever denso o BM25 antes de pasarlos al generador, mejorando la precisión del contexto final.
- Búsqueda semántica en bases de conocimiento de Wikipedia japonesa: adecuado porque el ajuste se realizó sobre fragmentos derivados de esa fuente.
- Respuesta a preguntas extractivas (QA): entrenado con pares pregunta-pasaje de JSQuAD, puede puntuar candidatos en sistemas de question answering en japonés.
- Filtrado de candidatos en motores de búsqueda corporativos: reduce el ruido de los primeros resultados antes de la presentación al usuario.
- Evaluación comparativa de rerankers: sirve como punto de referencia de un ajuste fino ligero sobre ruri-v3-reranker-310m en experimentos académicos.
- Prototipado docente en Google Colab: su tamaño (315 M de parámetros, repo de 1,3 GB) permite ejecutarlo en entornos con GPU modesta para prácticas de recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo de pesos, más activaciones y memoria del tokenizador; en la práctica, entre 2 y 4 GB según el tamaño de lote y la longitud de secuencia.
- VRAM estimada en fp16/bf16: en torno a 0,7 GB de pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 3060, RTX 4070 o RTX 4090 es suficiente. Para lotes grandes, A100 o H100 aportan mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: al ser un encoder con pesos safetensors, es compatible con Transformers, Text Embeddings Inference (TEI) y ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp ni Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llm2026-ruri-v3-reranker-310m-ft | 315.203.329 | no disponible | no disponible (hereda la del base) | Hugging Face, 0 descargas |
| cl-nagoya/ruri-v3-reranker-310m | 310 M (aprox., según nombre) | no disponible | no disponible en esta ficha | Hugging Face, modelo base |
| Rerankers japoneses de la familia ruri (otras versiones) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación; se desconoce si el ajuste fino mejora o degrada el rendimiento respecto al modelo base.
- El entrenamiento se realizó durante una sola época sobre datos derivados de JSQuAD y Wikipedia japonesa, lo que puede provocar sobreajuste a ese dominio y pobre generalización a otros corpus.
- Los datos de entrenamiento son exclusivamente en japonés; el rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Riesgo de sesgos heredados de Wikipedia japonesa y de JSQuAD, incluyendo sesgos culturales y de cobertura temática.
- Riesgo de alucinación no aplicable directamente al ser un reranker, pero sí de puntuaciones mal calibradas fuera de la distribución de entrenamiento.
- La licencia no está declarada en el repositorio; el autor remite a la licencia del modelo base, por lo que el uso comercial queda condicionado a verificar dicha licencia en cl-nagoya/ruri-v3-reranker-310m.
- El repositorio no registra descargas ni interacciones, y su fecha de creación (2026-11-28) indica que es un artefacto reciente y sin validación comunitaria.
- No se documenta la longitud máxima de contexto soportada, lo que impide planificar su uso con pasajes largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masakanomasaka/llm2026-ruri-v3-reranker-310m-ft
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
