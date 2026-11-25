# nguyenhoangtrungg/Vietnamese_Embedding

## Resumen

Vietnamese_Embedding es un modelo de embeddings de frases (sentence transformer) afinado a partir de BAAI/bge-m3 para mejorar la recuperación de información en vietnamita. Lo publica el desarrollador independiente nguyenhoangtrungg bajo licencia Apache 2.0, y está pensado para tareas de búsqueda semántica, recuperación densa y similitud de frases en corpus vietnamitas.

El modelo resuelve el problema de la baja calidad de recuperación de los embeddings multilingües genéricos en vietnamita: parte de la arquitectura XLM-RoBERTa de BGE-M3 (568 millones de parámetros) y se afina con aproximadamente 300.000 tripletas de consulta, documento positivo y documento negativo. Mantiene la longitud máxima de secuencia de 2048 tokens y produce vectores de 1024 dimensiones con similitud por producto escalar.

Es relevante porque BGE-M3 es un modelo multilingüe de propósito general y este afinado específico mejora de forma medible la precisión en el dominio legal vietnamita (Accuracy@1 de 0,7274 frente a 0,5682 de BGE-M3), lo que lo hace útil para sistemas RAG y motores de búsqueda en ese idioma. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el autor publica también una versión v2 y un reranker asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de BGE-M3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (el repo incluye pesos ONNX y safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension de salida | 1024 |
| Funcion de similitud | producto escalar (dot product) |
| Modelo base | BAAI/bge-m3 |
| Tamano del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre el encoder XLM-RoBERTa de BGE-M3, con 567.754.752 parámetros. Genera embeddings de 1024 dimensiones y se compara mediante producto escalar, lo que es coherente con la familia BGE-M3. La longitud máxima de secuencia durante el entrenamiento y en inferencia es de 2048 tokens.

El afinado se realizó con aproximadamente 300.000 tripletas de consulta, documento positivo y documento negativo en vietnamita. La model card no detalla la composición del dataset, la proporción de dominios ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a modelos de embeddings). Tampoco se documentan innovaciones técnicas adicionales más allá del propio proceso de fine-tuning con tripletas y la herencia de la arquitectura de BGE-M3.

## Capacidades

- Generación de embeddings de frases y documentos en vietnamita para búsqueda semántica y recuperación densa.
- Cálculo de similitud entre consultas y documentos mediante producto escalar.
- Manejo de secuencias de hasta 2048 tokens, adecuado para pasajes largos.
- Recuperación de información en el dominio legal vietnamita, con mejora documentada frente a BGE-M3.
- Compatibilidad con la librería sentence-transformers y con text-embeddings-inference (según los tags del repositorio).
- Exportación a ONNX para despliegue en entornos de inferencia optimizados.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en corpus legales vietnamitas: el modelo logra Accuracy@1 de 0,7274 en el dataset Legal Zalo 2021, por lo que es adecuado para indexar y recuperar normativa y documentación jurídica en vietnamita.
- Sistemas RAG (retrieval-augmented generation) en vietnamita: sirve como recuperador denso para alimentar a un LLM generador, con vectores de 1024 dimensiones y contexto de 2048 tokens por pasaje.
- Atención al cliente automatizada: permite emparejar preguntas de usuarios con respuestas de una base de conocimiento vietnamita mediante similitud semántica.
- Deduplicación y agrupación de documentos: los embeddings permiten detectar near-duplicates y agrupar textos por similitud en pipelines de procesamiento de corpus vietnamitas.
- Motor de búsqueda interna empresarial: indexación de documentación interna en vietnamita y recuperación por similitud semántica en lugar de coincidencia léxica.
- Filtrado y clasificación de contenido: uso de los embeddings como características para clasificadores posteriores (moderación, etiquetado temático) en textos vietnamitas.
- Despliegue en producción con ONNX o text-embeddings-inference: el repo incluye pesos ONNX, lo que facilita servir el modelo en infraestructura de inferencia estándar.

## Benchmarks y rendimiento

Evaluación sobre el dataset completo de entrenamiento de Legal Zalo 2021 (el modelo no fue entrenado con este dataset), según la model card:

| Modelo | Accuracy@1 | Accuracy@3 | Accuracy@5 | Accuracy@10 | MRR@10 |
|---|---|---|---|---|---|
| Vietnamese_Reranker | 0,7944 | 0,9324 | 0,9537 | 0,9740 | 0,8672 |
| Vietnamese_Embedding_v2 | 0,7262 | 0,8927 | 0,9268 | 0,9578 | 0,8149 |
| Vietnamese_Embedding (público) | 0,7274 | 0,8992 | 0,9305 | 0,9568 | 0,8181 |
| Vietnamese-bi-encoder (BKAI) | 0,7109 | 0,8680 | 0,9014 | 0,9299 | 0,7951 |
| BGE-M3 | 0,5682 | 0,7728 | 0,8382 | 0,8921 | 0,6822 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable en un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (568 M de parámetros × 4 bytes), más overhead de activaciones y del tokenizador; en la práctica, entre 3 y 4 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en fp16; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; también puede ejecutarse en CPU para volúmenes bajos.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (tag endpoints_compatible), ONNX Runtime (el repo incluye pesos ONNX) y, previsiblemente, vLLM o TGI si se adapta como modelo de embeddings, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy@1 (Legal Zalo 2021) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vietnamese_Embedding (este) | 567.754.752 | 2048 | 0,7274 | Apache 2.0 | Hugging Face |
| BGE-M3 (base) | no disponible en la información | no disponible en la información (BGE-M3 admite hasta 8192 según su propia model card, no confirmado aquí) | 0,5682 | MIT (según BGE-M3, no confirmado en esta información) | Hugging Face |
| Vietnamese-bi-encoder (BKAI) | no disponible | no disponible | 0,7109 | no disponible | Hugging Face |
| Vietnamese_Embedding_v2 | no disponible | no disponible | 0,7262 | no disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada salvo para el modelo base; la comparación se limita a los resultados de recuperación publicados por el autor.

## Limitaciones y advertencias

- Especializado exclusivamente en vietnamita: su rendimiento en otros idiomas no está documentado y probablemente sea inferior al de BGE-M3 multilingüe.
- El único benchmark publicado corresponde al dominio legal (Legal Zalo 2021); no hay evidencia de rendimiento en otros dominios para esta versión concreta.
- El autor indica que la versión v2, entrenada con 1.100.000 tripletas, baja ligeramente en el dominio legal pero mejora en otros dominios; esto sugiere que esta versión pública puede tener menor generalización fuera del dominio legal.
- Riesgo de alucinación no aplicable directamente (es un modelo de embeddings, no generativo), pero sí riesgo de recuperaciones incorrectas o falsos positivos en similitud semántica.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado en la misma fecha (2026-11-25), lo que indica una validación comunitaria nula.
- La model card menciona el identificador "AITeamVN/Vietnamese_Embedding" en el código de uso, distinto del ID del repositorio "nguyenhoangtrungg/Vietnamese_Embedding"; conviene verificar cuál es el repositorio canónico antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base BGE-M3.
- No se documentan sesgos conocidos ni evaluaciones de robustez; el corpus de entrenamiento (300.000 tripletas) no está descrito en composición ni procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenhoangtrungg/Vietnamese_Embedding
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Vietnamese_Embedding_v2 (mencionado en la model card): https://huggingface.co/AITeamVN/Vietnamese_Embedding_v2
- Vietnamese_Reranker (mencionado en la model card): https://huggingface.co/AITeamVN/Vietnamese_Reranker
- Contacto del autor: nguyennhotrung3004@gmail.com
