# mhmsadegh/rectom-causal-reasoning-crossencoder-bce-v2-709items

## Resumen

El modelo `mhmsadegh/rectom-causal-reasoning-crossencoder-bce-v2-709items` es un cross-encoder de la librería Sentence Transformers, desarrollado por Mohammad Sadegh Sadeghi (mhmsadegh) como parte de una línea de investigación sobre razonamiento causal y teoría de la mente (RecToM). Se trata de un modelo de re-ranking que, a partir de un par de textos (consulta y documento), produce una puntuación de relevancia, entrenado específicamente para recuperar información que requiere inferencias causales sobre estados mentales (creencias, deseos, intenciones, juicios y predicciones).

El modelo se basa en `cross-encoder/ms-marco-MiniLM-L6-v2`, un BERT de 6 capas con 22,7 millones de parámetros, y se ha ajustado con una función de pérdida de entropía cruzada binaria (BCE) sobre un conjunto de 709 ítems diseñado para evitar fugas de datos. La versión v2 amplía el pool de entrenamiento respecto a la versión anterior (266 ítems) y corrige un error de agrupación en la validación cruzada. Su relevancia radica en explorar si la supervisión explícita de rutas causales mejora la recuperación consciente del razonamiento frente a la recuperación semántica congelada (BGE). El modelo está publicado bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (MiniLM-L6-v2) |
| Parametros totales | 22.713.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de la familia Sentence Transformers, construido sobre el modelo base `cross-encoder/ms-marco-MiniLM-L6-v2`. Esta arquitectura procesa simultáneamente la consulta y el documento como una única secuencia de entrada, produciendo una puntuación de relevancia entre 0 y 1. Al ser un BERT de 6 capas con 22,7 millones de parámetros, es ligero y adecuado para tareas de re-ranking en tiempo real.

El entrenamiento se realizó con una función de pérdida de entropía cruzada binaria (BCE) sobre un conjunto de 709 pares (consulta, documento) etiquetados, extraídos de un "Case Bank" diseñado para evitar fugas de datos (leakage-safe). La supervisión se realiza únicamente mediante la etiqueta del par; no se utilizan rutas causales, respuestas doradas, ni etiquetas de beneficio/daño como entrada del modelo. Se aplicó una validación cruzada de 5 pliegues con agrupación por `dialogue_id` para evaluar la generalización. El estudio compara el rendimiento del modelo ajustado (fine-tuned) frente al modelo congelado (frozen) para determinar si el ajuste mejora la recuperación consciente del razonamiento causal.

## Capacidades

- Re-ranking de pares consulta-documento: genera una puntuación de relevancia para cada par, lo que permite ordenar resultados de búsqueda.
- Razonamiento causal y teoría de la mente: entrenado específicamente para identificar información que requiere inferencias sobre estados mentales (creencias, deseos, intenciones, juicios y predicciones).
- Recuperación de información especializada: puede integrarse en pipelines de retrieval aumentado (RAG) para filtrar y priorizar documentos relevantes en dominios donde el razonamiento causal es crítico.
- Multilingüe: no se especifican idiomas soportados; el modelo base MiniLM-L6-v2 está entrenado principalmente en inglés, por lo que se asume un funcionamiento óptimo en ese idioma.
- No generativo: no genera texto, solo puntúa pares; su salida es un valor numérico de similitud o relevancia.

## Casos de uso

- Recuperación de evidencia en sistemas de pregunta-respuesta: el modelo puede re-rankear pasajes candidatos en un pipeline de QA, priorizando aquellos que contienen información causal relevante para responder preguntas sobre estados mentales.
- Búsqueda semántica en bases de datos de narrativas o historias: al estar entrenado en razonamiento sobre teoría de la mente, es útil para buscar fragmentos de texto que describan creencias, deseos o intenciones de personajes.
- Filtrado de documentos en sistemas de análisis de sentimiento o psicología computacional: puede ayudar a seleccionar textos que requieran inferencias causales sobre el comportamiento humano.
- Re-ranking en motores de búsqueda especializados en ciencias sociales o cognitivas: permite mejorar la precisión de resultados cuando la consulta implica razonamiento sobre estados mentales.
- Componente de un sistema de agentes conversacionales: puede usarse para seleccionar la respuesta más adecuada de un conjunto de candidatas, basándose en la coherencia causal con el contexto.
- Evaluación de hipótesis en investigación: dado su enfoque en razonamiento causal, puede emplearse para ordenar documentos que apoyen o refuten hipótesis sobre mecanismos psicológicos.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de validación cruzada de 5 pliegues (group-disjoint) para el modelo congelado (frozen) y el modelo ajustado (fine-tuned) sobre el conjunto de 709 ítems. Se reportan métricas globales y desglosadas por tarea (belief, desire, judgement, prediction, intention). No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Modelo congelado | Modelo ajustado |
|---|---|---|
| MATCH@1 | 0,0677 | 0,0818 |
| Hit@1 | 0,0677 | 0,0818 |
| Hit@3 | 0,1749 | 0,2059 |
| Hit@5 | 0,2680 | 0,2948 |
| MRR | 0,1676 | 0,1802 |

Desglose por tarea (Hit@3):

| Tarea | Modelo congelado | Modelo ajustado | Numero de items |
|---|---|---|---|
| belief | 0,4902 | 0,3333 | 102 |
| desire | 0,1811 | 0,1496 | 127 |
| judgement | 0,1048 | 0,2258 | 248 |
| prediction | 0,0938 | 0,0729 | 96 |
| intention | 0,1176 | 0,2206 | 136 |

Además, se reporta un test de McNemar entre el modelo ajustado y el congelado: `ft_only_wins: 100`, `frozen_only_wins: 78`, `n_discordant: 178`, `p_value: 0,1152`. El intervalo de confianza bootstrap al 95% para la diferencia en Hit@3 es `[-0,0042, 0,0677]`, con una diferencia puntual de `0,0310`. Estos resultados indican que la mejora del ajuste no es estadísticamente significativa (p > 0,05), aunque hay una tendencia positiva.

## Requisitos de hardware

- VRAM estimada: al tener 22,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 90 MB; en FP16 ~45 MB; en int8 ~23 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1050 hasta una RTX 4090 o A100. También puede ejecutarse en CPU con baja latencia para lotes pequeños.
- Compatibilidad con GPUs de consumo: sí, es perfectamente viable en tarjetas de gama media y baja.
- Opciones de despliegue: al ser un cross-encoder de Sentence Transformers, se puede integrar fácilmente con la librería `sentence-transformers` para re-ranking. También es compatible con frameworks como `FlagEmbedding` o `Reranker` de `transformers`. Para despliegue en producción, puede usarse con `vLLM` o `TGI` si se convierte a un formato compatible, aunque su uso típico es como componente de re-ranking en pipelines de RAG.
- Latencia y throughput: al ser un modelo pequeño, la inferencia es rápida; en una GPU moderna puede procesar cientos de pares por segundo. En CPU, el rendimiento depende del número de hilos, pero es adecuado para aplicaciones en tiempo real con lotes pequeños.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona una versión anterior (`rectom-causal-reasoning-crossencoder-bce` con 266 ítems) y un modelo de recuperación en dos etapas (`rectom-causal-reasoning-retriever-stage2`), pero no se ofrecen métricas comparativas con otros cross-encoders genéricos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente en un dominio de razonamiento causal y teoría de la mente; su rendimiento fuera de ese ámbito puede ser deficiente.
- Tamaño reducido: con 22,7 millones de parámetros, su capacidad de representación es limitada en comparación con modelos más grandes, lo que puede afectar a la calidad en tareas complejas.
- Sesgos del dataset: al entrenarse sobre un conjunto específico de narrativas, puede heredar sesgos presentes en los datos (por ejemplo, culturales o de género).
- Riesgo de alucinación: al ser un cross-encoder, no genera texto, pero puede producir puntuaciones incorrectas si los pares de entrada contienen información ambigua o fuera de distribución.
- Idioma: no se especifican idiomas soportados; el modelo base MiniLM-L6-v2 está optimizado para inglés, por lo que su uso en otros idiomas puede degradar el rendimiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución.
- Sin garantía de mejora significativa: los resultados de validación muestran que el ajuste fino no produce una mejora estadísticamente significativa frente al modelo congelado (p = 0,115), por lo que en algunos casos podría preferirse el modelo base sin ajuste.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mhmsadegh/rectom-causal-reasoning-crossencoder-bce-v2-709items)
- [Repositorio de cross-encoders de Sentence Transformers](https://huggingface.co/cross-encoder)
- [Perfil de GitHub del autor](https://github.com/mhmsadegh)
