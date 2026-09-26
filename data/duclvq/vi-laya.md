# duclvQ/vi-laya

## Resumen

vi-laya es un modelo reranker de tipo cross-encoder desarrollado por el usuario duclvQ, especializado en recuperación de pasajes en vietnamita. Dado un par (consulta, pasaje), devuelve la probabilidad entre 0 y 1 de que el pasaje responda a la consulta, con el objetivo de reordenar los candidatos devueltos por un sistema de recuperación de primera etapa. Está afinado a partir del modelo Laya de convaiinnovations, en su variante multilingüe basada en mmBERT-base, y cuenta con 321.908.998 parámetros (unos 322 millones).

La relevancia del modelo radica en su enfoque de dominio legal vietnamita: se ha ajustado sobre 757.748 pares durante una época con una combinación de RLCD (aprendizaje por refuerzo a partir de contraste documental) y entropía cruzada suave, seguida de un escalado de temperatura a posteriori (T = 1,42). Su longitud máxima de contexto es de 8.192 tokens, lo que le permite procesar artículos legales largos sin truncar el inicio del pasaje.

En las evaluaciones publicadas por el autor alcanza resultados competitivos en dos conjuntos de datos legales vietnamitas (Zalo AI Legal Text Retrieval y ALQAC), con un rendimiento especialmente sólido en calidad de probabilidad (AUC de 0,994 y Brier de 0,020 en ALQAC). Se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamaño de repositorio de 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Laya (variante multilingüe de mmBERT-base) con cabeza de decisión sí/no |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Pipeline | text-ranking |
| Modelo base | convaiinnovations/laya |
| Funcion de salida | Probabilidad de coincidencia (0-1), campo `noul` (P(match)) |
| Fecha de creacion | 2026-09-26 |
| Fecha de actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 1 |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: procesa conjuntamente la consulta y el documento, con la consulta en primer lugar y el documento en segundo. La truncación, si se produce, recorta siempre el final del documento. Sobre la representación conjunta se aplica una cabeza de decisión sí/no que produce la probabilidad de coincidencia (`noul`), interpretada como P(match). La arquitectura subyacente es Laya, descrito por el autor como una variante multilingüe basada en mmBERT-base con 322 millones de parámetros.

El ajuste fino se realizó durante una única época sobre 757.748 pares, combinando RLCD (Reflective Learning from Contrastive Data, aprendizaje a partir de contrastes documentales) con entropía cruzada suave. Posteriormente se aplicó un escalado de temperatura post-hoc con T = 1,42, orientado a calibrar mejor las probabilidades de salida. No se documentan en la información disponible detalles sobre la composición exacta del corpus de entrenamiento más allá de su orientación al dominio legal vietnamita, ni sobre el uso de RLHF o DPO.

## Capacidades

- Puntuación de relevancia consulta-pasaje en vietnamita: devuelve una probabilidad calibrada entre 0 y 1 para cada par.
- Reranking de segunda etapa: reordena los candidatos recuperados por un motor de búsqueda o modelo de embeddings de primera fase.
- Manejo de documentos largos: admite hasta 8.192 tokens por par, adecuado para artículos legales extensos.
- Calidad de probabilidad: destaca en métricas de calibración (AUC y Brier) frente a alternativas evaluadas.
- Procesamiento por lotes: la API de la librería `laya` expone `predict_batch` con parámetro `batch_size`.
- Ejecución en CPU y GPU: el parámetro `device` permite `"cuda"` o `"cpu"`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: aunque la base Laya es multilingüe, el ajuste y la evaluación se limitan al vietnamita; el autor no documenta rendimiento en otros idiomas.

## Casos de uso

- Búsqueda legal vietnamita: reordenar los artículos de ley recuperados por un modelo de embeddings como BAAI/bge-m3 para responder consultas jurídicas. Los resultados publicados en el conjunto Zalo (788 consultas, 61.425 artículos) y ALQAC (620 consultas, 62.643 artículos) demuestran su idoneidad en este escenario.
- Asistentes jurídicos de preguntas y respuestas: usar la probabilidad de coincidencia para seleccionar el pasaje que fundamenta una respuesta, con umbrales de confianza calibrados gracias a la escala de temperatura aplicada.
- Sistemas de recuperación aumentada por generación (RAG) en vietnamita: insertar el reranker entre el retriever y el generador para reducir el ruido en el contexto entregado al modelo generativo.
- Búsqueda documental interna en despachos y administraciones públicas: con un corpus de decenas de miles de documentos, reordenar los 50 primeros candidatos con latencias de 13-22 ms por par en una RTX A4500.
- Filtrado de duplicados y distractores temáticos: los ejemplos de la model card muestran cómo el modelo separa pasajes correctos de distractores del mismo tema (por ejemplo, 0,857 frente a 0,150 en la consulta sobre cómo cocinar phở).
- Evaluación de calidad de corpus: puntuar pares consulta-documento para auditar datasets de entrenamiento o validación en tareas de recuperación en vietnamita.
- Motores de búsqueda de preguntas frecuentes: clasificar pares pregunta-respuesta en atención al cliente en vietnamita, aprovechando la salida probabilística para ordenar resultados.

## Benchmarks y rendimiento

Resultados publicados por el autor reordenando los 50 mejores candidatos de BAAI/bge-m3.

Zalo AI Legal Text Retrieval (788 consultas, 61.425 artículos):

| Modelo | NDCG@10 | MRR@10 | R@10 | Acc@1 |
|---|---|---|---|---|
| bge-m3 (solo recuperación) | 71,3 | 65,6 | 89,1 | 53,7 |
| BAAI/bge-reranker-v2-m3 | 77,5 | 72,9 | 91,9 | 62,1 |
| Qwen/Qwen3-Reranker-0.6B | 73,6 | 67,5 | 92,8 | 54,7 |
| AITeamVN/Vietnamese_Reranker | 87,3 | 84,8 | 94,9 | 78,1 |
| Laya base (multilingüe) | 33,6 | 26,1 | 58,3 | 14,2 |
| vi-laya | 78,8 | 74,3 | 93,0 | 63,6 |

ALQAC (620 consultas, 62.643 artículos):

| Modelo | NDCG@10 | MRR@10 | R@10 | Acc@1 |
|---|---|---|---|---|
| bge-m3 (solo recuperación) | 86,5 | 84,0 | 94,0 | 77,6 |
| BAAI/bge-reranker-v2-m3 | 94,8 | 93,9 | 97,3 | 91,3 |
| AITeamVN/Vietnamese_Reranker | 94,6 | 94,0 | 96,6 | 91,9 |
| vi-laya | 94,9 | 94,1 | 97,1 | 91,9 |

Calidad de probabilidad (todos los pares top-50):

| Modelo | Zalo AUC | Zalo Brier | ALQAC AUC | ALQAC Brier |
|---|---|---|---|---|
| AITeamVN/Vietnamese_Reranker (sigmoide) | 0,982 | 0,037 | 0,991 | 0,030 |
| vi-laya | 0,964 | 0,022 | 0,994 | 0,020 |

Velocidad medida en una RTX A4500 en bf16: 13 ms por par con artículos cortos (ALQAC) y 22 ms por par con artículos largos (Zalo).

## Requisitos de hardware

- VRAM estimada (cálculo a partir de los 321,9 millones de parámetros): aproximadamente 1,3 GB en fp32, 0,65 GB en bf16/fp16 y del orden de 0,35 GB en int8. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- La única medición oficial de velocidad se realizó en una NVIDIA RTX A4500 con bf16: 13 ms por par en artículos cortos y 22 ms por par en artículos largos.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM debería poder ejecutarlo en bf16, aunque el autor no especifica este extremo.
- Se documenta ejecución tanto en `"cuda"` como en `"cpu"` a través del parámetro `device` de la API `laya.Agent`.
- Opciones de despliegue: la vía oficial es la librería `laya` (versión >= 0.3.11) mediante `pip install`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible, ni se publican pesos GGUF.
- Para lotes grandes, la API expone `predict_batch` con `batch_size` configurable (el ejemplo usa 8), lo que permite ajustar el throughput según la VRAM disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|
| vi-laya | 321,9 M | 8.192 tokens | Apache 2.0 | ALQAC NDCG@10 94,9; Brier ALQAC 0,020 | HuggingFace (safetensors) |
| AITeamVN/Vietnamese_Reranker | No disponible | No disponible | No disponible | Zalo NDCG@10 87,3; ALQAC NDCG@10 94,6 | HuggingFace |
| BAAI/bge-reranker-v2-m3 | No disponible | No disponible | No disponible | Zalo NDCG@10 77,5; ALQAC NDCG@10 94,8 | HuggingFace |
| Qwen/Qwen3-Reranker-0.6B | 0,6 B (por nombre) | No disponible | No disponible | Zalo NDCG@10 73,6 | HuggingFace |
| Laya base (multilingue) | 322 M | No disponible | No disponible | Zalo NDCG@10 33,6 | HuggingFace (convaiinnovations/laya) |

Observaciones: vi-laya es el mejor de la comparativa en NDCG@10 y MRR@10 en ALQAC y el mejor en calibración de probabilidad en ambos conjuntos. En Zalo, sin embargo, AITeamVN/Vietnamese_Reranker lo supera con claridad (87,3 frente a 78,8 en NDCG@10). La base Laya sin ajustar obtiene resultados muy pobres como reranker (33,6 en Zalo), lo que indica que el ajuste fino es determinante.

## Limitaciones y advertencias

- Especialización de dominio: el ajuste se realizó sobre datos legales vietnamitas. Los ejemplos de la model card en dominios ajenos muestran un rendimiento degradado muy notable: en consultas de salud, finanzas y educación la probabilidad del pasaje correcto es prácticamente idéntica a la del distractor (por ejemplo, 0,101 frente a 0,100 en síntomas de dengue, o 0,107 frente a 0,101 en tipos de interés de ahorro). En la consulta sobre la fecha de la batalla de Điện Biên Phủ el pasaje correcto solo obtiene 0,343.
- Riesgo de calibración dependiente del dominio: aunque las métricas Brier son excelentes en los conjuntos legales, los ejemplos anteriores sugieren que fuera de ese dominio las probabilidades dejan de ser informativas.
- Sensibilidad al orden: la consulta debe ir siempre primero y el documento después; la truncación recorta el final del documento, de modo que los pasajes que superan los 8.192 tokens pueden perder información relevante.
- Idioma: solo se documenta vietnamita. No hay evidencia publicada de rendimiento en otros idiomas pese a que el modelo base sea multilingüe.
- Corpus pequeño y poco validado: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y las fechas de creación y actualización indican un modelo muy reciente. La validación externa es escasa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base convaiinnovations/laya, cuya licencia no se especifica en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos ni de comportamiento diferencial por subpoblaciones.
- Alucinación: al ser un modelo de ranking y no generativo, no produce texto libre, pero sí puede asignar puntuaciones altas a pasajes incorrectos, lo que en un sistema RAG aguas abajo puede inducir respuestas erróneas.
- No se documentan capacidades de tool calling, agentes ni multimodalidad, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duclvQ/vi-laya
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- BAAI/bge-m3 (referenciado en benchmarks): https://huggingface.co/BAAI/bge-m3
- BAAI/bge-reranker-v2-m3 (referenciado en benchmarks): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Qwen/Qwen3-Reranker-0.6B (referenciado en benchmarks): https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- AITeamVN/Vietnamese_Reranker (referenciado en benchmarks): https://huggingface.co/AITeamVN/Vietnamese_Reranker
- Ejemplos de la model card (examples.json): https://huggingface.co/duclvQ/vi-laya/blob/main/examples.json
