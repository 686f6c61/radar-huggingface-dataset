# geek4freak/leak-curber-enzyme-retrieval-v12

## Resumen

Leak CURBER enzyme retrieval v12 es un sistema de recuperación (retrieval) de números EC (Enzyme Commission) para reacciones químicas, desarrollado por el usuario geek4freak y publicado en Hugging Face bajo licencia MIT. Dado un reaction SMILES, el modelo predice un único número EC de la jerarquía enzimática, lo que lo sitúa en la intersección entre quimioinformática, biología computacional y anotación funcional de enzimas. No es un modelo de lenguaje generativo, sino un ensemble heterogéneo de clasificadores y recuperadores especializados en representaciones de reacciones químicas.

La versión v12 añade a v11 un re-ranker de segunda etapa basado en gradient-boosted trees que opera sobre los 20 candidatos EC mejor puntuados por el ensemble de primera etapa. El sistema combina vistas de fingerprint (Morgan, DRFP, Morgan aumentado, rsplit aumentado), clasificadores MLP residuales con objetivos multi-EC suaves y cabezas auxiliares L3/L2/L1, kNN sobre embeddings y sobre fingerprints, y tres BERT de reacción (rxnfp) afinados y exportados a ONNX. La inferencia es exclusivamente CPU mediante un script `predict.py`.

El modelo es relevante para pipelines de anotación enzimática a escala, donde asignar un EC a una reacción sin etiqueta es un paso habitual. Su tamaño de repositorio (1.0 GB) y su diseño CPU-only lo hacen desplegable en entornos sin GPU. La información pública es escasa en cuanto a datos de entrenamiento, idiomas y benchmarks comparativos, y el propio autor advierte que las estimaciones de holdout pueden estar alrededor de un punto por encima de los resultados de leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble heterogéneo: MLPs residuales sobre fingerprints + kNN sobre fingerprints y embeddings + 3 BERT de reacción (rxnfp) exportados a ONNX + re-ranker de gradient-boosted trees |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reacción, no de texto libre) |
| Tipos de cuantizacion | no disponible (pesos ONNX y NumPy; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrada: reaction SMILES; no es multilingüe en sentido NLP) |
| Licencia | MIT |
| Formato de pesos | ONNX (`bert_0.onnx`, `bert_1.onnx`, `bert_2.onnx`), NumPy (`rerank.npz`), vocabularios de texto (`bert_vocab_*.txt`) |
| Tamaño del repositorio | 1.0 GB |
| Entrada | Reaction SMILES |
| Salida | Un número EC por reacción |
| Inferencia | CPU-only (`python /app/predict.py --input IN --output OUT`) |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos etapas. La primera etapa agrega múltiples predictores débiles con pesos explícitos definidos en la configuración (`weights`, `taus`, `beta`, `gamma`). Las vistas de fingerprint incluidas son `morgan`, `drfp`, `morgan+aug` y `rsplit+aug`, cada una con clasificadores MLP residuales entrenados con objetivos multi-EC suaves, cabezas auxiliares L3/L2/L1 y augmentación por reacción invertida. Además, se emplean kNN de coseno sobre Morgan, diferencia de fingerprints, TF-IDF de n-gramas de caracteres y DRFP, así como kNN sobre embeddings. Los tres BERT de reacción (rxnfp) se preentrenan con masked-token modeling sobre las entradas de entrenamiento y validación más reacciones no etiquetadas de Rhea, y se afinan para clasificación EC con augmentación por SMILES aleatorios y pesos EMA. La segunda etapa es un re-ranker de gradient-boosted trees con inferencia en NumPy que reordena los 20 candidatos EC principales, entrenado sobre el holdout tipo validación más predicciones out-of-fold del conjunto de entrenamiento, con 12 miembros (`knn_diff`, `knn_text`, `knn_drfp`, `mlp_morgan`, `mlp_drfp`, `knnemb_drfp`, `mlp_morgan+aug`, `knnemb_morgan+aug`, `mlp_rsplit+aug`, `knnemb_rsplit+aug`, `bert`, `knnemb_bert`).

El entrenamiento incorpora robustez ante semirreacciones mediante augmentación con eliminación de monedas (currency-stripped) y características de balance, además de normalización de carga dentro de la featurización. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica en un clasificador de este tipo). El vocabulario EC procede de ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0) y las reacciones no etiquetadas de Rhea (SIB, CC BY 4.0; solo reaction SMILES, sin etiquetas EC). El autor referencia rxnfp (Schwaller et al. 2021, MIT) y DRFP (Probst et al. 2022, MIT) como base metodológica.

## Capacidades

- Predicción de un número EC por reaction SMILES, con salida de un único EC por reacción.
- Clasificación jerárquica implícita: cabezas auxiliares L3/L2/L1 que apoyan la predicción del nivel L4.
- Manejo de reacciones incompletas o semirreacciones gracias a la augmentación currency-stripped y las características de balance.
- Recuperación por similitud sobre fingerprints (Morgan, DRFP, diferencia, TF-IDF de n-gramas) y sobre embeddings.
- Reordenación de candidatos mediante un re-ranker de segunda etapa sobre el top-20.
- Inferencia CPU-only, sin dependencia de GPU.
- Exportación ONNX de los BERT de reacción y pesos NumPy para el re-ranker.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio); no es un modelo generativo de texto.

## Casos de uso

- Anotación funcional a escala de reacciones no etiquetadas en bases de datos de metabolismo o biotransformaciones: el modelo asigna un EC por reacción en CPU, lo que permite procesar lotes grandes sin infraestructura GPU.
- Enriquecimiento de pipelines de reconstrucción de redes metabólicas: dado un conjunto de reacciones, predecir EC permite mapear reacciones a enzimas candidatas y completar rutas.
- Priorización en descubrimiento de enzimas: filtrar reacciones de interés por clase EC predicha antes de validación experimental, reduciendo el espacio de búsqueda.
- Curaduría de bases de datos de reacciones: detectar discrepancias entre el EC anotado y el EC predicho para revisión manual.
- Integración en herramientas de quimioinformática como paso previo a la búsqueda de secuencias en UniProt o BRENDA, usando el EC como clave de consulta.
- Evaluación de modelos de generación de reacciones: usar el EC predicho como señal auxiliar para comprobar la coherencia funcional de reacciones generadas.
- Docencia y experimentación en bioinformática: el despliegue CPU-only y la licencia MIT facilitan su uso en entornos académicos sin GPU.

## Benchmarks y rendimiento

El autor publica resultados de holdout local tipo validación (ponderado), con estimaciones cross-fitted. No se proporcionan comparaciones con otros modelos en la información disponible.

| Nivel EC | Métrica reportada (holdout val-like ponderado) |
|---|---|
| L4 | 0.6613 |
| L3 | 0.8711 |
| L2 | 0.9073 |
| L1 | 0.9372 |

El autor advierte que estas estimaciones cross-fitted pueden situarse alrededor de un punto por encima de los resultados de leaderboard. No se especifica la métrica exacta (probablemente accuracy o top-1, pero no se confirma en la información disponible). No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente CPU; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- RAM estimada: no disponible con precisión; el repositorio ocupa 1.0 GB y el sistema carga tres modelos ONNX más pesos NumPy, por lo que se recomienda al menos varios GB de RAM libre, aunque la cifra exacta no está documentada.
- GPU recomendadas: no aplica; el diseño es CPU-only.
- Cabe en cualquier equipo consumer con CPU moderna y RAM suficiente; no requiere tarjeta gráfica.
- Opciones de despliegue: script `predict.py` con ONNX Runtime y NumPy; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leak CURBER enzyme retrieval v12 | Ensemble MLP + kNN + BERT rxnfp + GBDT re-ranker | Reaction SMILES | Un EC | MIT | Hugging Face, CPU-only |
| BEC-Pred (Qian et al. 2024) | Predicción de EC (referenciado por el autor) | no disponible | EC | no disponible | no disponible |
| CLAIRE (2025) | Predicción de EC (referenciado por el autor) | no disponible | EC | no disponible | no disponible |
| SynCat (2026) | Predicción de EC (referenciado por el autor) | no disponible | EC | no disponible | no disponible |
| CARE/CREEP (Yang et al. 2025) | Predicción de EC (referenciado por el autor) | no disponible | EC | no disponible | no disponible |

No se han publicado comparaciones cuantitativas con estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de lenguaje; no genera texto, no soporta tool calling ni agentes.
- Salida de un único EC por reacción: no proporciona distribuciones calibradas ni alternativas jerárquicas completas de forma explícita.
- Las estimaciones de holdout son cross-fitted y el propio autor indica que el leaderboard puede estar alrededor de un punto por debajo; no deben tomarse como rendimiento garantizado en producción.
- Riesgo de error en reacciones atípicas, semirreacciones mal normalizadas o reacciones con grupos funcionales poco representados en el entrenamiento.
- No se documenta el dataset de entrenamiento, su tamaño ni su composición, lo que dificulta evaluar sesgos y cobertura.
- No se documentan sesgos conocidos ni limitaciones idiomáticas (la entrada es estructural, no lingüística).
- Licencia MIT: permite uso comercial, pero se recomienda revisar las licencias de las dependencias (rxnfp y DRFP son MIT; Rhea y ExPASy ENZYME son CC BY 4.0 y requieren atribución).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente por terceros.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos; verificar la vigencia del vocabulario EC (release 02-Sep-2026) frente a versiones posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v12
- rxnfp (Schwaller et al. 2021, MIT): no disponible enlace directo en la información proporcionada
- DRFP (Probst et al. 2022, MIT): no disponible enlace directo en la información proporcionada
- BEC-Pred (Qian et al. 2024): no disponible enlace directo en la información proporcionada
- CLAIRE (2025): no disponible enlace directo en la información proporcionada
- SynCat (2026): no disponible enlace directo en la información proporcionada
- CARE/CREEP (Yang et al. 2025): no disponible enlace directo en la información proporcionada
- Rhea (SIB, CC BY 4.0): no disponible enlace directo en la información proporcionada
- ExPASy ENZYME (SIB, CC BY 4.0): no disponible enlace directo en la información proporcionada
