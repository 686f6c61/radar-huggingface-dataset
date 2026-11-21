# Arxenarendra/jobbert-task3-match

## Resumen

JobBERT-task3-match es un cross-encoder de clasificación de texto en inglés desarrollado por el usuario Arxenarendra (proyecto académico IF5153, grupo 6) que evalúa el encaje entre una oferta de empleo y un currículum. Se construye a partir de `jjzha/jobbert-base-cased`, un BERT-base especializado en dominio laboral, afinado para producir tres etiquetas de compatibilidad: `0 = No Fit`, `1 = Potential Fit` y `2 = Good Fit`. El modelo forma parte de un sistema mayor de emparejamiento de tres tareas (NER, clasificación de campo y este matching), documentado en un repositorio público de GitHub.

El modelo es relevante como ejemplo de aplicación de cross-encoders a un problema de ranking en recursos humanos, pero su alcance es muy acotado: 108 millones de parámetros, contexto efectivo de 512 wordpieces repartido entre oferta (190) y CV (319), y un conjunto de evaluación de solo 26 ofertas. No es un modelo generativo ni un LLM: es un clasificador de pares que devuelve una puntuación de encaje, no texto.

Su interés práctico está en pipelines de cribado de candidaturas (ATS), donde un cross-encoder puede reordenar candidatos con métricas de ranking razonables (NDCG@5 de 0,733, MRR de 0,883) pese a una clasificación absoluta modesta (Macro-F1 de 0,481). La model card advierte explícitamente de que las etiquetas del dataset son derivadas y de origen no documentado, y de que la mayoría de pares de test reutilizan CVs vistos en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (cross-encoder de pares), base `jjzha/jobbert-base-cased` |
| Parametros totales | 108.312.579 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 wordpieces (segmento A: 190; segmento B: 319) |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repo | 0,4 GB |
| Etiquetas de salida | 0 = No Fit, 1 = Potential Fit, 2 = Good Fit |
| Modelo base | jjzha/jobbert-base-cased |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base cased configurado como cross-encoder: recibe un par (oferta, CV) concatenado en dos segmentos y emite una clasificación de tres clases sobre la representación del token `[CLS]`. El segmento A (oferta) se limita a 190 wordpieces y el segmento B (CV) a 319, con un formato estructurado que inyecta entidades NER de la tarea 1 y campo/subcampo/nivel de la tarea 2 en el texto de entrada. El tokenizador del repositorio comparte vocabulario con `jjzha/jobbert-base-cased`.

El ajuste fino se realizó sobre `0xnbk/resume-ats-score-v1-en`: 6.374 pares, 778 CVs únicos y 320 ofertas únicas, con partición por oferta (seed 42, ~80/10/10). Hiperparámetros: learning rate 2e-5 seleccionado en validación, batch de 16, hasta 4 épocas con early stopping y precisión fp16. No se documenta uso de RLHF, DPO ni decodificación especulativa; es un ajuste supervisado estándar de clasificación.

## Capacidades

- Clasificación de encaje CV-oferta en tres niveles (No Fit, Potential Fit, Good Fit) mediante cross-encoder.
- Puntuación de pares individuales (`score_match`) y ranking de múltiples CVs frente a una oferta (`rank`), expuestos en `task3_match/api.py`.
- Consumo de metadatos estructurados: entidades NER de la oferta y del CV, más campo, subcampo y nivel del candidato.
- Procesamiento de texto en inglés exclusivamente.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No dispone de modo thinking ni capacidades multilingües.

## Casos de uso

- Cribado inicial de candidaturas en un ATS: el modelo puntúa cada par (oferta, CV) y permite descartar o priorizar candidatos antes de la revisión humana, usando la clase predicha y la probabilidad asociada.
- Ranking de candidatos por oferta: la función `rank` ordena los CVs de una vacante concreta; las métricas de ranking del autor (NDCG@5 0,733, MRR 0,883) indican que es más fiable para ordenar que para clasificar en valor absoluto.
- Enrutamiento a revisión manual: los pares clasificados como `1 = Potential Fit` pueden dirigirse a un reclutador, mientras que `0` y `2` se automatizan, reduciendo carga operativa.
- Segunda etapa de un pipeline de recuperación: tras un filtro léxico o de embeddings barato, el cross-encoder reordena el top-k de candidatos con mayor precisión, aprovechando su capacidad de atención conjunta sobre oferta y CV.
- Enriquecimiento de un sistema de tres tareas: integrado con el NER (tarea 1) y el clasificador de campo (tarea 2) del mismo proyecto, el modelo aprovecha las entidades y metadatos ya extraídos para mejorar la señal de entrada.
- Investigación y docencia en NLP aplicado a RRHH: sirve como referencia reproducible de ajuste fino de BERT para clasificación de pares, con código, particiones y métricas publicadas en el repositorio del proyecto.
- Análisis de sesgo en sistemas de selección: al ser un modelo pequeño y auditable, permite estudiar cómo las etiquetas derivadas del dataset influyen en las decisiones de encaje antes de desplegar sistemas mayores.

## Benchmarks y rendimiento

Resultados en test (seed 42, 26 ofertas, ejecución única) según la model card:

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,481 |
| ROC-AUC | 0,685 |
| MAE | 19,7 |
| NDCG@5 | 0,733 |
| MRR | 0,883 |

El autor indica que los intervalos de confianza bootstrap al 95 % por oferta están en `data/results/task3_bootstrap.csv` del repositorio, y que la mejora frente a la variante de texto crudo solo es significativa en Macro-F1. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16 y alrededor de 1 GB en fp32 para los 108 millones de parámetros, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch con `transformers` (pipeline `text-classification`), TorchServe o FastAPI con el script `task3_match/api.py`; vLLM y TGI no están orientados a cross-encoders de clasificación y no se documentan para este modelo; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxenarendra/jobbert-task3-match | 108,3 M | 512 wordpieces (190 + 319) | Cross-encoder de encaje CV-oferta, 3 clases | no disponible | Hugging Face, 0 descargas |
| jjzha/jobbert-base-cased | ~110 M (BERT-base) | 512 tokens | Modelo base de dominio laboral (masked LM) | no disponible en esta ficha | Hugging Face |
| Cross-encoders genéricos tipo `cross-encoder/ms-marco-MiniLM-*` | 22-110 M | 512 tokens | Ranking de pasajes (no específico de RRHH) | habitualmente Apache-2.0 (verificar) | Hugging Face |
| Sentence-transformers bi-encoder para similitud CV-oferta | variable | 512 tokens | Similitud semántica (no clasificación de encaje) | variable | Hugging Face |

La comparación directa con alternativas específicas de matching CV-oferta no está disponible en la información proporcionada; los modelos citados son referencias de la misma familia o categoría funcional, no evaluados sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Las etiquetas del dataset (`0xnbk/resume-ats-score-v1-en`) son derivadas de bandas de puntuación ATS y su origen no está documentado; no representan un juicio independiente de un reclutador.
- Entre el 95 % y el 97 % de los pares de test reutilizan un CV presente en entrenamiento; un baseline que adivina el nivel solo a partir del CV alcanza Macro-F1 de 0,37-0,41, por lo que las métricas de clasificación absoluta están infladas y conviene priorizar métricas de ranking por oferta.
- El conjunto de test es muy pequeño (26 ofertas) y de una sola semilla; la significación estadística solo se confirma para Macro-F1 frente a la variante de texto crudo.
- Las entidades NER de la tarea 1 pueden contener palabras concatenadas procedentes de texto de ATS, degradando la entrada del cross-encoder.
- El modelo solo procesa inglés; no cubre otros idiomas ni variantes dialectales.
- La licencia no está disponible: no se verificaron las licencias del modelo base ni del dataset, por lo que debe comprobarse antes de cualquier uso comercial.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de calibración deficiente: ROC-AUC de 0,685 y Macro-F1 de 0,481 indican una separación limitada entre clases.
- No debe usarse como único criterio de decisión en selección de personal sin supervisión humana, tanto por la calidad de las etiquetas como por el riesgo de sesgos no auditados en el dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arxenarendra/jobbert-task3-match
- Modelo base: https://huggingface.co/jjzha/jobbert-base-cased
- Repositorio del proyecto: https://github.com/Ferdin-Arsenic/Job_Matching_System-NLP-
- Dataset de entrenamiento: https://huggingface.co/datasets/0xnbk/resume-ats-score-v1-en
