# Delower/egfr-pic50-gat-tuned-deployment

## Resumen

El modelo `Delower/egfr-pic50-gat-tuned-deployment` es un pipeline de predicción de potencia inhibitoria (pIC50) frente al receptor del factor de crecimiento epidérmico (EGFR), desarrollado por el autor Delower en el contexto de descubrimiento de fármacos. No se trata de un modelo de lenguaje, sino de un sistema híbrido de aprendizaje automático que combina una red neuronal de grafos (GAT, Graph Attention Network) de dos capas con cabezas de clasificación y regresión basadas en ExtraTrees. El objetivo es predecir el valor de pIC50 de compuestos químicos a partir de su estructura molecular expresada en SMILES.

La versión aquí descrita es un *deployment refit*: se ha reentrenado sobre el 100 % de los datos etiquetados disponibles, incluyendo 14 compuestos regulatorios (fármacos aprobados como gefitinib, osimertinib o afatinib) que en la versión de benchmark estaban reservados como conjunto externo de validación. Según la model card, esta versión no ha sido evaluada sobre los conjuntos absorbidos y sus métricas de benchmark no son aplicables; la versión evaluable sigue siendo `Delower/egfr-pic50-gat-tuned`.

El modelo es relevante para equipos de quimioinformática que necesitan un predictor de actividad EGFR listo para producción con licencia MIT, aunque su naturaleza de refit sin métricas publicadas limita su uso como referencia comparativa. El repositorio ocupa 1,2 GB, principalmente por los ensembles de ExtraTrees serializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido: GAT de 2 capas (FlexGNN, capas [128, 128], dropout 0) + ExtraTrees (regresor y clasificador) sobre embedding de grafo concatenado con Morgan-1024 y 6 features fisicoquímicas |
| Parametros totales | no disponible (el GAT tiene 128 dimensiones de embedding; los ExtraTrees tienen 800 y 1.200 árboles respectivamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos moleculares, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch state dict y joblib; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; opera sobre SMILES) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state dict de PyTorch para el GAT) y `.pkl` (joblib para los ExtraTrees); embeddings en `.npz` |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. Primero, una GAT de dos capas con dimensión oculta de 128 en cada capa y dropout 0 procesa el grafo molecular y produce un embedding de 128 dimensiones. Este embedding se concatena con descriptores Morgan de 1024 bits y 6 features fisicoquímicas, dando un vector de 1.158 dimensiones. Sobre ese vector se entrenan dos cabezas ExtraTrees: un regresor (800 árboles, `max_depth` 30, `max_features` 0.5) que predice pIC50 continuo, y un clasificador (1.200 árboles, `max_features` 0.5, bootstrap) que asigna tres clases: *potent*, *moderate* y *not_potent*. El entrenamiento usó semilla 42 y los scripts `build_tuned_combo.py` y `tune_gnn_common.train_gnn`.

El refit se realizó sobre 12.647 filas: 12.633 filas curadas (reunión de todos los splits de `egfr_curated.csv`) más 14 fármacos regulatorios con valores experimentales de pIC50 (gefitinib 7,658; erlotinib 7,523; afatinib 8,796; osimertinib 7,889; dacomitinib 8,222; lazertinib 7,729; sunvozertinib 7,418; icotinib 8,695; almonertinib 9,745; olmutinib 7,945; mobocertinib 7,600; brigatinib 7,538; lapatinib 7,959; neratinib 7,387). Furmonertinib se excluyó por carecer de IC50 experimental. Se verificó que los 14 compuestos no tienen solapamiento de conectividad InChIKey con el conjunto curado (verificación 14/14 presente, 0 ausente en `gate_verification.json`). Antes del refit se comprobó la fidelidad de la receta: el reajuste de la cabeza de benchmark reprodujo un RMSE de validación de 0,6606 frente al 0,6585 del benchmark, dentro de la tolerancia de la receta. El split de test original se usó únicamente como monitor de *early stopping* durante el entrenamiento del GNN sobre todos los datos, y su valor no se reporta como métrica.

## Capacidades

- Predicción de pIC50 continuo para compuestos frente a EGFR a partir de SMILES.
- Clasificación de potencia en tres clases: *potent*, *moderate* y *not_potent*.
- Procesamiento de grafos moleculares mediante GAT con embedding de 128 dimensiones.
- Combinación de información estructural (grafo) con descriptores de huella Morgan y features fisicoquímicas.
- Inferencia por lotes mediante la función `predict(smiles_list)` del driver `infer.py`.
- Verificación de procedencia: incluye embeddings exactos (`refit_embeddings.npz`) y manifiesto de entrenamiento (`training_manifest.csv`) para auditoría.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Filtrado virtual de librerías químicas: dado un conjunto de SMILES, `predict(smiles_list)` devuelve pIC50 y clase de potencia, permitiendo priorizar compuestos antes de ensayos experimentales. Adecuado por su licencia MIT y su pipeline de inferencia empaquetado.
- Priorización de análogos de inhibidores de EGFR: el modelo incorpora 14 fármacos aprobados en su entrenamiento, por lo que puede orientar el diseño de análogos cercanos a gefitinib, osimertinib o afatinib con valores de referencia conocidos.
- Triaje en pipelines de cribado: la clasificación en tres clases permite descartar rápidamente compuestos *not_potent* y reservar recursos de modelado o síntesis para los *potent*.
- Análisis de relación estructura-actividad (SAR): al combinar embedding de grafo con Morgan y fisicoquímica, el modelo puede usarse para explorar qué regiones estructurales correlacionan con mayor pIC50 en estudios internos.
- Generación de datasets etiquetados sintéticos: el regresor puede preetiquetar grandes volúmenes de compuestos para entrenar modelos posteriores o para selección activa.
- Reproducibilidad y auditoría regulatoria: los ficheros `training_manifest.csv`, `gate_verification.json` y `refit_embeddings.npz` permiten reconstruir y auditar el proceso de entrenamiento, útil en entornos con requisitos de trazabilidad.
- Integración en herramientas de quimioinformática: al ser Python puro con PyTorch y joblib, puede envolverse en servicios REST o integrarse en notebooks de discovery.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta versión de deployment refit. La model card indica explícitamente que las métricas de benchmark no aplican a este refit y que no ha sido evaluado sobre los conjuntos absorbidos. El único dato numérico de referencia es la comprobación de fidelidad de la receta sobre el split del benchmark: RMSE de validación 0,6606 frente a 0,6585 del benchmark original. Las métricas del benchmark deben consultarse en `Delower/egfr-pic50-gat-tuned`.

## Requisitos de hardware

- VRAM estimada para inferencia: el GAT es pequeño (embedding de 128 dimensiones, dos capas); la carga principal es en RAM/CPU por los ExtraTrees. El regresor serializado ocupa aproximadamente 0,9 GB en disco.
- GPU: no es necesaria para la inferencia; el GAT puede ejecutarse en CPU. Una GPU consumer (RTX 3060 o superior) aceleraría el paso del GNN si se procesan lotes grandes.
- RAM: se recomienda al menos 6-8 GB para cargar los dos ensembles de ExtraTrees y el GAT simultáneamente; la model card menciona que el primer refit se interrumpió en una VM compartida de 6 GB por el tamaño del regresor.
- Cabe en GPU consumer: sí, aunque el cuello de botella es la memoria del sistema, no la VRAM.
- Opciones de despliegue: inferencia directa con PyTorch y joblib mediante `infer.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delower/egfr-pic50-gat-tuned-deployment (este) | GAT + ExtraTrees, refit sobre 12.647 filas | 12.633 curadas + 14 regulatorios | No aplicables (refit sin evaluación) | MIT | Hugging Face |
| Delower/egfr-pic50-gat-tuned | GAT + ExtraTrees, versión benchmark | 10.105 filas de train, 15 fármacos externos reservados | RMSE validación 0,6585 | no disponible | Hugging Face |
| Alternativas genéricas de QSAR para EGFR (p. ej. modelos basados en Random Forest o XGBoost con Morgan) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Esta versión es un refit de deployment sin métricas de evaluación publicadas; no debe usarse como referencia de rendimiento ni compararse con el benchmark original.
- Los 14 fármacos regulatorios están incluidos en el entrenamiento, por lo que las predicciones sobre ellos no son una validación independiente y estarán sobreajustadas a esos compuestos.
- Riesgo de alucinación en sentido figurado: al ser un modelo QSAR, puede producir predicciones con alta confianza para compuestos fuera del dominio de aplicabilidad (scaffolds no representados en los datos curados).
- Dominio limitado a inhibidores de EGFR; no es transferible a otras dianas sin reentrenamiento.
- No se documentan sesgos de composición del dataset curado (posible sobrerrepresentación de ciertas familias químicas).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo no procesa texto ni lenguaje natural; no admite prompts, tool calling ni razonamiento multi-paso.
- La inferencia depende de la disponibilidad de RDKit u otras librerías para generar descriptores Morgan y features fisicoquímicas (no se detalla en la información disponible).
- El tamaño del regresor (~0,9 GB) puede provocar problemas de memoria en entornos con poca RAM.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/egfr-pic50-gat-tuned-deployment
- Versión benchmark: https://huggingface.co/Delower/egfr-pic50-gat-tuned
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
