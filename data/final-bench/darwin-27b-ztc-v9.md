# FINAL-Bench/Darwin-27B-ZTC-v9

## Resumen

Darwin-27B-ZTC-v9 es un modelo de decisión desarrollado por FINAL-Bench, no un modelo generativo de texto. Dada una entrada (state) y una pregunta tipada, devuelve en una sola pasada forward una probabilidad calibrada para cada opción: sí/no (`noul`), una entre varias alternativas (`choice`) o un nivel en una escala ordenada (`score`). Se apoya en el backbone Darwin-27B-RSI y en la arquitectura `qwen3_5_text`, con 25.624.600.064 parámetros reales según los safetensors del repositorio (51,3 GB).

Es la siguiente iteración de Darwin-27B-ZTC-v5. El cambio principal es una mejora marcada en decisiones de elección múltiple (intención, tipo de entidad, relación, categoría gramatical, razonamiento sobre reglas, relevancia de producto), manteniendo el comportamiento de sí/no y de puntuación de v5. Las peticiones usan el formato System One (`state` más `questions`), por lo que los clientes escritos para ese formato funcionan sin cambios.

Su relevancia actual radica en que encabeza el leaderboard S1MB (System One Mosaic Benchmark) english-v1 con una puntuación Borda de 90,38 sobre 137 benchmarks completados y cero decisiones fallidas. Esto lo sitúa como referencia para tareas de clasificación y decisión estructurada, un nicho distinto del de los modelos conversacionales habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5_text` (backbone Darwin-27B-RSI), modelo de decisión con una pasada forward por pregunta |
| Parametros totales | 25.624.600.064 (25,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (los benchmarks S1MB evaluados son english-v1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch; código custom en `autojev/`) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura `qwen3_5_text` con el backbone Darwin-27B-RSI y se entrena mediante fine-tuning de pesos completos (full-weight fine-tuning) dentro de la línea Darwin-27B-ZTC. La inferencia es una única pasada forward por pregunta con la temperatura del checkpoint, sin ensembling. La salida es una distribución de probabilidad calibrada sobre las opciones de la pregunta tipada, no texto libre.

Los datos de entrenamiento son los splits públicos de *train* de conjuntos de datos de decisión con licencias que permiten uso comercial. Para v9 se añadieron los splits de train originales upstream de las fuentes de tareas de elección: DBpedia-14, SNLI, MASSIVE, HWU64, BANKING77, CLINC150, MTOP, Few-NERD, UD English-EWT, Gretel PII masking, ESCI, WIQA, FOL-NLI, BoardgameQA e IBM argument quality, todos convertidos al formato System One. Según la model card, no se usó ningún split de test de S1MB ni de ningún benchmark para entrenar: cada fila de entrenamiento fue cribada contra todos los casos de S1MB (coincidencia exacta del state normalizado, campos de texto largo raros y states duplicados) y las coincidencias se eliminaron. Los conversores se validaron reproduciendo los casos de test de S1MB a partir de los splits de test upstream, usados solo para esa comprobación. No se documenta RLHF ni DPO.

## Capacidades

- Decisión binaria (`noul`): devuelve una probabilidad calibrada de sí/no para una pregunta dada.
- Elección múltiple (`choice`): selecciona entre varias opciones con criterios definidos (intención, tipo de entidad, relación, categoría gramatical, relevancia de producto).
- Puntuación ordenada (`score`): asigna un nivel en una escala ordenada.
- Razonamiento sobre reglas (evaluado en boardgameqa-choice y fol-nli-choice).
- Reconocimiento de intenciones conversacionales (BANKING77, CLINC150, MASSIVE, HWU64, MTOP).
- Clasificación de entidades y PII (Few-NERD, Gretel PII masking).
- Etiquetado gramatical (UD English-EWT, categoría gramatical).
- Inferencia de lenguaje natural (SNLI, FOL-NLI).
- Relevancia de producto y calidad de argumentos (ESCI, IBM argument quality).
- Servicio HTTP con batching mediante `POST /v1/systemone` (`ztc_server.py`).
- No genera texto libre; no se documentan tool calling, agentes ni multimodalidad en esta versión (existe una variante Vision separada, Darwin-35B-ZTC-Vision).

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: clasificar utterances de usuarios en intenciones bancarias (por ejemplo `card_arrival`, `lost_or_stolen_card`, `top_up_failed`) con una sola pasada forward, integrándolo en el pipeline de triaje previo al agente conversacional.
- Detección y clasificación de PII: identificar y tipar entidades sensibles en textos de negocio (evaluado con Gretel PII masking, score de 0,981 en v9), adecuado para pipelines de anonimización previos a almacenamiento.
- Moderación y filtrado binario: usar decisiones `noul` calibradas para aceptar o rechazar contenido según reglas de negocio, con umbral ajustable a partir de la probabilidad devuelta.
- Clasificación de relevancia en búsqueda de producto: puntuar la relevancia consulta-producto (ESCI) para reordenar resultados o generar etiquetas de entrenamiento para sistemas de ranking.
- Etiquetado lingüístico y NER en pipelines de NLP: categoría gramatical (UD English-EWT) y tipos de entidad (Few-NERD) como componente de anotación automática a escala.
- Evaluación de calidad de argumentos: puntuar la calidad de argumentos textuales (IBM argument quality) para sistemas de curación de contenido o revisión de documentación.
- Razonamiento sobre reglas en verificación: responder preguntas de sí/no y de elección sobre reglas y hechos (boardgameqa, fol-nli, snli) en pipelines de validación lógica.

## Benchmarks y rendimiento

Resultados S1MB english-v1 (137 benchmarks completados, evaluador S1MB y adaptador `autojev` sin cambios, cero decisiones fallidas; fusionado por el mantenedor el 2026-10-19). Ranking según el método Borda del leaderboard, recalculado sobre los resultados publicados de 2026-10-19 (195 modelos completos) con este modelo añadido.

| Rank | Modelo | Borda | Media ajustada a baseline |
|---|---|---|---|
| 1 | Darwin-27B-ZTC-v9 | 90,38 | 72,20 |
| 2 | Sqwish kettei-fat v1.0 (API) | 90,14 | no disponible |
| 3 | Punky Tiger Labs Superion S1 | 89,53 | no disponible |
| 4 | D3 (27B) | 89,35 | no disponible |
| 5 | FINAL-Bench/Darwin-27B-ZTC-v5 | 88,52 | no disponible |

Mayores ganancias frente a v5 (puntuación ajustada a baseline):

| Benchmark | v5 | v9 |
|---|---|---|
| boardgameqa-choice | 0,500 | 0,953 |
| ud-ewt-choice (categoría gramatical) | 0,433 | 0,833 |
| gretel-pii-choice (tipo de entidad) | 0,653 | 0,981 |
| wiqa-choice | 0,365 | 0,667 |
| fol-nli-choice | 0,279 | 0,574 |
| snli-choice | 0,790 | 0,968 |
| esci-choice | 0,315 | 0,466 |
| argument-quality-choice | 0,857 | 0,959 |

En el momento del envío (resultados de 2026-10-17, 171 modelos) también ocupó el primer puesto, con 91,29.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 GB de memoria libre en GPU para los pesos en BF16 (según la model card).
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con al menos 60 GB libres; no se documentan configuraciones con menor VRAM.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB) con los pesos BF16 publicados; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: código custom del repositorio (`autojev/`) y servidor `ztc_server.py` con `POST /v1/systemone` y batching. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la inferencia es una pasada forward por pregunta sin ensembling, con batching en el servidor.
- Requisitos de entorno: Python 3.12 y CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | S1MB Borda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-27B-ZTC-v9 | 25,6 B | no disponible | 90,38 | Apache 2.0 | Hugging Face |
| Sqwish kettei-fat v1.0 | no disponible | no disponible | 90,14 | no disponible | API |
| Punky Tiger Labs Superion S1 | no disponible | no disponible | 89,53 | no disponible | no disponible |
| D3 (27B) | 27 B (según nombre) | no disponible | 89,35 | no disponible | no disponible |
| Darwin-27B-ZTC-v5 | 27 B (línea) | no disponible | 88,52 | Apache 2.0 | Hugging Face |

La comparación se limita a la puntuación S1MB porque la información disponible no detalla parámetros, contexto ni licencia de las alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones definidas en la pregunta; no sirve para tareas de generación.
- Idiomas: los benchmarks S1MB evaluados son english-v1 y la model card no declara idiomas soportados; el rendimiento en otros idiomas no está verificado.
- Longitud de contexto: no documentada; estados muy largos pueden exceder la ventana efectiva.
- Riesgo de alucinación: al devolver probabilidades calibradas, el riesgo se traslada a decisiones mal calibradas fuera de la distribución de entrenamiento; conviene validar umbrales en datos propios.
- Sesgos: no se documentan análisis de sesgo; los datos de entrenamiento provienen de benchmarks públicos con posibles sesgos de dominio y anotación.
- Licencia Apache 2.0: permite uso comercial, pero los pesos dependen de código custom (`autojev/`) que debe auditarse para producción.
- Requisitos de hardware elevados (~60 GB de VRAM en BF16) y ausencia de cuantizaciones documentadas limitan el despliegue en infraestructura modesta.
- Las puntuaciones S1MB son autoinformadas por el autor y fusionadas por el mantenedor del leaderboard; la versión en vivo del leaderboard es la autoritativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-27B-ZTC-v9
- Leaderboard S1MB: https://huggingface.co/spaces/hotchpotch/S1MB-leaderboard
- PR de fusión de resultados S1MB (#75): https://huggingface.co/datasets/hotchpotch/s1mb-result/discussions/75
- Versión anterior v5: https://huggingface.co/FINAL-Bench/Darwin-27B-ZTC-v5
- Serie v2: https://huggingface.co/FINAL-Bench/Darwin-27B-ZTC-v2
- Backbone Darwin-27B-RSI: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Variante Vision (Darwin-35B-ZTC-Vision): https://huggingface.co/FINAL-Bench/Darwin-35B-ZTC-Vision
- Organización FINAL-Bench: https://huggingface.co/FINAL-Bench
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
