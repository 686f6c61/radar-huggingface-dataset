# AzeerDev/arabic-reranker

## Resumen

El modelo `AzeerDev/arabic-reranker` es un reranker (cross-encoder) especializado en árabe, desarrollado por AzeerDev. Se trata de un fine-tuning del modelo `Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2`, que a su vez se basa en `aubmindlab/bert-base-arabertv02`. Su función principal es puntuar y ordenar pares consulta-documento según su relevancia, una tarea crítica en sistemas de recuperación de información y generación aumentada por recuperación (RAG) para contenido en árabe.

El modelo fue entrenado sobre un dataset sintético de tripletas árabes generado mediante modelos de lenguaje de gran tamaño (LLMs), y refinado con una técnica de scoring. Con aproximadamente 135 millones de parámetros, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo. Su relevancia actual radica en la escasez de rerankers específicos para árabe, un idioma con particularidades morfológicas y sintácticas que requieren modelos adaptados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (cross-encoder) |
| Parametros totales | 135.194.113 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea max_length=512) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | arabe (ar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo adopta la arquitectura BERT en su variante cross-encoder, donde la consulta y el documento se concatenan y se procesan conjuntamente para producir una puntuación de relevancia. El fine-tuning parte de `Arabic-Triplet-Matryoshka-V2`, un modelo de embeddings basado en BERT, y se entrena sobre un dataset sintético de tripletas árabes (consulta, documento relevante, documento irrelevante) generado con LLMs. La técnica de refinamiento emplea scoring para ajustar las puntuaciones de relevancia. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Reranking de pares consulta-documento en arabe, devolviendo una puntuacion de relevancia.
- Ordenacion de multiples opciones de texto segun su adecuacion a una consulta dada.
- Integracion con pipelines de recuperacion de informacion y RAG para mejorar la precision de los resultados.
- Uso como CrossEncoder con la libreria `sentence_transformers`, con soporte para longitudes de entrada de hasta 512 tokens (segun el ejemplo proporcionado).
- No se mencionan capacidades adicionales como tool calling, generacion de texto, vision o audio.

## Casos de uso

- Busqueda semantica en arabe: el modelo puede rerankear los resultados obtenidos mediante busqueda vectorial, mejorando la precision al evaluar directamente la relevancia de cada par consulta-documento.
- Sistemas de preguntas y respuestas (QA): dado un conjunto de pasajes candidatos, el reranker ordena las respuestas mas probables, facilitando la extraccion de la respuesta correcta.
- Recuperacion de informacion en dominios especificos (legal, medico, academico): al estar entrenado en arabe, puede adaptarse a corpus especializados con un fine-tuning adicional.
- RAG para asistentes virtuales en arabe: integrado en un pipeline de generacion aumentada, selecciona los fragmentos mas relevantes antes de pasarlos al generador.
- Clasificacion de documentos por relevancia: util para tareas de triage o priorizacion de contenido en arabe.
- Filtrado de resultados en motores de busqueda: puede combinarse con un sistema de busqueda tradicional para reordenar los resultados segun relevancia semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 135 millones de parametros, en FP32 el modelo ocupa aproximadamente 540 MB; en FP16 unos 270 MB; en INT8 unos 135 MB. Se puede ejecutar en GPUs con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna de consumo (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente para inferencia. Para despliegue en produccion con alto throughput, se recomienda una GPU de datacenter como A10 o A100.
- Opciones de despliegue: al ser un modelo BERT, puede servirse con librerias como vLLM, TGI, o mediante la API de `sentence_transformers` en un servicio Python. Tambien es compatible con `llama.cpp` si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se dispone de datos oficiales. Como cross-encoder, la inferencia es mas lenta que la busqueda vectorial, pero para un modelo de este tamano se espera una latencia de decenas de milisegundos por par en una GPU moderna.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones detalladas de otros rerankers arabes como `Omartificial-Intelligence-Space/ARA-Reranker-V1` o `oddadmix/arabic-reranker-v1`. Ambos existen en Hugging Face y cumplen funciones similares, pero no se pueden comparar numericamente sin informacion adicional. El modelo base `Arabic-Triplet-Matryoshka-V2` es un embedding model, no un reranker, por lo que no es directamente comparable.

## Limitaciones y advertencias

- Entrenado exclusivamente en arabe; no soporta otros idiomas.
- El dataset de entrenamiento es sintetico, generado por LLMs, lo que puede introducir sesgos o limitaciones en dominios muy especificos.
- No se ha publicado informacion sobre sesgos, alucinaciones o comportamiento en casos limite.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial.
- No se proporcionan cuantizaciones oficiales, lo que puede limitar su despliegue en entornos con restricciones de memoria.
- Al ser un cross-encoder, su uso en pipelines de recuperacion a gran escala puede ser costoso computacionalmente si se aplica a muchos candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AzeerDev/arabic-reranker
- Modelo base: https://huggingface.co/Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2
- Modelo base original: https://huggingface.co/aubmindlab/bert-base-arabertv02
- Reranker arabe similar: https://huggingface.co/Omartificial-Intelligence-Space/ARA-Reranker-V1
- Reranker arabe similar: https://huggingface.co/oddadmix/arabic-reranker-v1
- Lista de rerankers (GitHub): https://github.com/agentset-ai/awesome-rerankers
- Libreria de rerankers (GitHub): https://github.com/AnswerDotAI/rerankers
