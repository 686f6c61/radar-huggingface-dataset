# aldebaran-research/temps

## Resumen

TEMPS (Temporal Embedding Model for Precise Search) es un módulo temporal desarrollado por aldebaran-research que añade una puntuación temporal a cualquier retriever denso existente. Fue presentado en el paper *TEMPS: Temporal Sentence Embeddings for Temporal Information Retrieval* (Hassani, Romero, Bouzeghoub, Jacquelinet, EMNLP 2026). El problema que resuelve es conocido en recuperación de información: los retrievers densos emparejan consultas y pasajes por tema, pero ignoran la dimensión temporal, devolviendo pasajes relevantes en contenido pero incorrectos en tiempo.

Técnicamente, TEMPS se acopla a un retriever semántico **congelado** (por defecto `sentence-transformers/all-MiniLM-L6-v2`, aunque los mejores resultados del paper usan SFR-Embedding-Mistral como backbone) y, dado un texto junto con su fecha de anclaje, produce una Gaussiana diagonal sobre el tiempo. La similitud temporal se calcula con un score basado en divergencia KL y se fusiona con el score coseno del retriever mediante un parámetro `alpha` ajustable. Se entrenó con 60 millones de tuplas generadas automáticamente (sin etiquetado manual), lo que lo hace reproducible y barato de entrenar: unas 4 horas en 8×A100-80GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone congelado all-MiniLM-L6-v2 + codificador sinusoidal de fecha de anclaje + attention pooling + cabezas de media y varianza (salida: Gaussiana diagonal sobre tiempo) |
| Parametros totales | no disponible (backbone all-MiniLM-L6-v2: ~22M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (pesos publicados); entrenamiento en fp16 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 (codigo del repositorio: MIT) |
| Formato de pesos | PyTorch `state_dict` (`temps-weights.pth`, fp32), ~0.1 GB de repositorio |

## Arquitectura y entrenamiento

El módulo combina cuatro componentes: un backbone `all-MiniLM-L6-v2` congelado (hasta 512 tokens), un codificador sinusoidal de la fecha de anclaje, una capa de attention pooling y dos cabezas que producen la media y la varianza de una Gaussiana diagonal sobre el eje temporal. La comparación entre dos textos anclados se realiza con el score `ts(1,2) = 1 / (1 + KL(p_1 || p_2))`, que se fusiona con el score coseno del retriever semántico tras una normalización min-max por consulta: `s(1,2) = (1 - alpha) * cos + alpha * ts`. El valor de `alpha` se ajusta por benchmark en un split de validación: 0.6 para TimeQA, 0.8 para TempReason y 0.3 para TS-Retriever.

El entrenamiento no usa datos temporales etiquetados a mano: cada expresión temporal anclada se resuelve a un intervalo de días inclusivo `[a, b]` y se ajusta a una Gaussiana por método de momentos (`mu = (a+b+1)/2`, `sigma^2 = (b-a+1)^2/12`). La etiqueta del par es `1/(1 + KL(p_I1 || p_I2))` y el módulo se entrena con una pérdida de ranking CoSENT para reproducir ese orden. Los datos son 60M de tuplas generadas automáticamente (55M sintéticas y 5M extraídas de Wikipedia mediante los Multilingual MLM Temporal Tagging Resources). Configuración: 3 épocas, batch global de 2.048, lr 3e-4, weight decay 0.01, 5% de warmup lineal, máximo 512 tokens, fp16, semilla 42; unas 4 horas en 8×A100-80GB (recursos de GENCI/IDRIS en el supercomputador Jean Zay).

## Capacidades

- Puntuación de alineación temporal entre pares de textos anclados a fechas (salida: Gaussiana diagonal sobre tiempo por texto).
- Fusión con cualquier retriever denso congelado mediante score combinado coseno + temporal (alpha configurable).
- Resolución de expresiones temporales anclables a intervalos: fechas absolutas, expresiones deícticas y offsets, referencias al presente, estaciones, duraciones e intervalos.
- Entrenamiento sin datos etiquetados manualmente (60M de tuplas autogeneradas).
- Integración vía PyTorch con pesos descargables desde HuggingFace Hub (`hf_hub_download`).
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; es un módulo de ranking para pipelines de retrieval y RAG.

## Casos de uso

- **RAG con sensibilidad temporal:** en un pipeline de generación aumentada por recuperación, se fusiona el score temporal con el semántico para priorizar pasajes cuya fecha coincide con la de la consulta ("¿quién dirigía la empresa la primavera pasada?"), evitando recuperar documentos correctos en tema pero de otro año.
- **Búsqueda de noticias y archivo periodístico:** al indexar artículos con su fecha de publicación como anclaje, el módulo ordena pasajes por coincidencia temporal, útil para consultas sobre hechos situados en un periodo concreto.
- **Preguntas sobre historial corporativo o biografías:** consultas tipo "¿quién era el CEO en 2021?" se resuelven mejor porque los pasajes con nombramientos o mandatos en fechas concretas se puntúan temporalmente frente al resto.
- **Re-ranking temporal en sistemas de retrieval existentes:** como el módulo se acopla a un retriever congelado, puede añadirse a un despliegue ya en producción (E5, SFR-Embedding-Mistral, etc.) sin reentrenar el retriever base.
- **Deduplicación y agrupación temporal de documentos:** comparando Gaussianas de pares de textos se pueden agrupar pasajes que hablan del mismo tema en el mismo periodo, útil en vigilancia o monitorización.
- **Investigación en temporal information retrieval:** el código (MIT), los datos autogenerados y la configuración de entrenamiento completa (semilla, hiperparámetros) permiten reproducir y extender el enfoque; el paper incluye scripts de evaluación (`scripts/download_model.py`).

## Benchmarks y rendimiento

Resultados en los splits de test reservados (MRR), según la model card:

| Benchmark | Mejor sistema | MRR | Ganancia sobre backbone |
|---|---|---|---|
| TimeQA (alpha=0.6) | SFR-Embedding-Mistral + TEMPS | 0.5360 | +31.9% |
| TempReason (alpha=0.8) | SFR-Embedding-Mistral + SUTime (control) | 0.6901 | +11.5% |
| TS-Retriever (alpha=0.3) | SFR-Embedding-Mistral + TEMPS | 0.8240 | +9.3% |

Datos adicionales publicados: en TS-Retriever, `E5-base-v2 + TEMPS` eleva R@1 de 19.92 a 25.39 y P@1 de 58.63 a 69.14 frente a TSContriever. En TempReason, el control basado en reglas SUTime supera a TEMPS. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K (no aplicables: no es un modelo generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con un backbone all-MiniLM-L6-v2 (~22M de parámetros) y pesos fp32 de ~0.1 GB, el módulo completo funciona en GPU con 2-4 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento original usó 8×A100-80GB, pero la inferencia no requiere hardware especial (una RTX 3060/4090 o una T4 es más que suficiente).
- Cabe sobradamente en GPUs de consumo, incluidas las de gama de entrada.
- Despliegue: PyTorch puro (los pesos se cargan con `load_state_dict` desde `hf_hub_download`); no hay soporte nativo publicado para vLLM, llama.cpp, Ollama o TGI (no aplica, al no ser un LLM generativo).
- Latencia y throughput: no disponibles; al usar un backbone MiniLM de 22M de parámetros, la latencia esperada es de milisegundos por lote en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| TEMPS (este modelo) | Módulo temporal sobre retriever denso | ~22M (backbone) | 512 tokens | Apache-2.0 | Añade score temporal a cualquier retriever congelado; solo inglés |
| TSContriever | Retriever temporal dedicado | no disponible | no disponible | no disponible | Supera a E5-base-v2 solo en R@1/P@1 base; con TEMPS, E5 lo supera (R@1 25.39 vs 19.92) |
| SUTime | Extractor de expresiones temporales basado en reglas | no disponible (no neuronal) | no disponible | no disponible | Superó a TEMPS en TempReason; enfoque simbólico, sin embeddings |
| sentence-transformers/all-MiniLM-L6-v2 | Retriever semántico base | ~22M | 512 tokens | Apache-2.0 | Backbone congelado de TEMPS; no modela tiempo |

## Limitaciones y advertencias

- Solo inglés; no hay soporte multilingüe.
- Cubre únicamente expresiones temporales anclables y resolubles a un intervalo (fechas absolutas, deícticas, offsets, presente, estaciones, duraciones, intervalos). El razonamiento a nivel de discurso y las relaciones evento-evento están fuera de alcance.
- Un pasaje de hasta 512 tokens se comprime en una sola Gaussiana, lo que pierde información en pasajes largos o con contenido temporal mixto.
- Los pasajes sin expresión temporal quedaron fuera del entrenamiento: sus Gaussianas no están calibradas y deben rankearse solo con el score semántico.
- Los resultados provienen de una única ejecución de entrenamiento (semilla 42); no hay varianza reportada.
- En TempReason, el control basado en reglas SUTime supera a TEMPS: conviene evaluar el módulo en el dominio concreto antes de adoptarlo.
- El parámetro `alpha` debe ajustarse en un split de validación por dominio; usar valores por defecto de otro benchmark puede degradar el ranking.
- Licencia Apache-2.0: sin restricciones para uso comercial. El repositorio de código es MIT.
- Modelo muy reciente (creado en 2026) con 0 descargas registradas: sin historial de adopción ni validación comunitaria en producción.

## Enlaces

- HuggingFace: https://huggingface.co/aldebaran-research/temps
- Repositorio de código: https://github.com/aldebaran-care/TEMPS
- Paper: *TEMPS: Temporal Sentence Embeddings for Temporal Information Retrieval* (EMNLP 2026) — enlace no disponible en la información proporcionada
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
