# Delower/herg-cardiogenai-deployment

## Resumen

hERG CardioGenAI — DEPLOYMENT REFIT es un par de modelos de aprendizaje profundo orientados a la predicción de cardiotoxicidad por bloqueo del canal de potasio hERG, un criterio crítico en el cribado regulatorio de fármacos. El artefacto publicado en Hugging Face bajo el identificador `Delower/herg-cardiogenai-deployment` contiene los pesos de dos cabezas de predicción (clasificación binaria de bloqueo y regresión de pIC50) derivadas de la arquitectura `Discriminator_Model` de los autores originales de CardioGenAI: una red de atención sobre grafos (GAT) combinada con descriptores de huellas moleculares y un vector de embedding procedente de un transformer preentrenado congelado.

El modelo ha sido reentrenado desde cero sobre el corpus completo de datos etiquetados (14.441 compuestos para clasificación y 10.370 para regresión), incluyendo los conjuntos regulatorios y externos (hERG-70, 967 compuestos nuevos, panel FDA de 36 y REGFAIL de 7). El autor documenta explícitamente que los checkpoints han absorbido estos conjuntos, por lo que no deben usarse como validación externa. Los benchmarks honestos reportados sobre pools bloqueados sitúan la clasificación en ACC 0.752 / MCC 0.525 sobre hERG-70 y MCC 0.270 sobre compuestos nuevos, mientras que la regresión alcanza RMSE 0.856 sobre hERG-70.

Es relevante ahora porque el repositorio no contiene pesos preentrenados de terceros ni un pipeline declarado, sino un artefacto de despliegue con scripts de inferencia, vocabulario recuperado y documentación de auditoría interna. La ausencia de licencia declarada y de idiomas soportados limita su uso directo en producción sin una revisión legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAT (Graph Attention Network) + huellas moleculares + vector de transformer preentrenado congelado (arquitectura `Discriminator_Model` de CardioGenAI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el transformer congelado codifica 57 tokens por compuesto) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`) |
| Idiomas soportados | no disponible (modelo molecular, no textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`weights/best_cls_checkpoint.pt`, `weights/best_reg_checkpoint.pt`) |

## Arquitectura y entrenamiento

La arquitectura replica el `Discriminator_Model` de CardioGenAI: un codificador GAT sobre el grafo molecular, concatenación con descriptores de huella y con un vector de embedding producido por un transformer preentrenado congelado, seguido de cabezas diferenciadas para clasificación (probabilidad de bloqueo con umbral 0.5 a 10 uM) y regresión (pIC50 predicho). El vocabulario del transformer congelado se conserva en `vocab_recovered.npy` con 57 tokens; los 57 compuestos (clasificación) y 35 (regresión) que el transformer no puede codificar se incluyen con vector de transformer a cero y quedan marcados, sin descartarse silenciosamente.

El reentrenamiento se realizó desde cero, sin pesos publicados, sobre el corpus completo: 14.441 compuestos para clasificación y 10.370 para regresión, incorporando los conjuntos regulatorios hERG-70, new-compounds (967), panel FDA (36) y REGFAIL (7). El autor documenta una puerta de control ("hard gate") corregida que verifica la presencia de cada compuesto externo en las cachés de entrenamiento por conectividad InChIKey (hERG-70 462/462, new-compounds 967/967, FDA 36/36, REGFAIL 7/7); una ejecución anterior sobre una caché incompleta fue invalidada y reentrenada. No se reportan detalles sobre composición exacta del dataset, función de pérdida, optimizador ni número de épocas.

## Capacidades

- Predicción binaria de bloqueo del canal hERG (clasificación, umbral de probabilidad 0.5 a 10 uM).
- Predicción continua de pIC50 (regresión) a partir de la representación molecular.
- Procesamiento de moléculas como grafos atómicos mediante GAT.
- Integración de descriptores de huella molecular y embeddings de transformer congelado.
- Inferencia desde un fichero H5 featurizado en el formato de los autores (`predict_herg_cardio.py`).
- Manejo explícito de compuestos no codificables por el transformer (vector cero y marca de flag).
- No dispone de tool calling, capacidades de agente, generación de texto, visión ni audio.

## Casos de uso

- Cribado temprano de cardiotoxicidad en pipelines de descubrimiento de fármacos: el modelo clasifica compuestos candidatos frente al bloqueo hERG antes de ensayos in vitro, permitiendo descartar moléculas de alto riesgo con un coste computacional mínimo.
- Priorización de compuestos en quimioinformática: la salida de pIC50 permite ordenar librerías por riesgo relativo y concentrar recursos experimentales en los candidatos más prometedores.
- Filtrado de librerías virtuales a gran escala: al operar sobre grafos moleculares y embeddings congelados, puede procesar lotes de compuestos featurizados en H5 sin requerir GPU de gran tamaño.
- Auditoría regulatoria interna: la documentación de la puerta de control ("hard gate") y los informes `HARD_GATE_CORRECTED.md` y `FIX_REPORT_EIC53.md` permiten trazar qué compuestos regulatorios estuvieron presentes en entrenamiento, útil para reproducibilidad interna.
- Investigación metodológica sobre sesgo de validación: el caso documentado de una caché incompleta invalidada sirve como referencia para diseñar controles de fuga de datos en modelos QSAR.
- Evaluación comparativa de arquitecturas GAT+huella+transformer: los benchmarks bloqueados reportados (hERG-70 ACC 0.752, MCC 0.525; new-compounds MCC 0.270) permiten contrastar esta familia frente a alternativas en estudios internos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| hERG-70 (clasificación, pool bloqueado) | ACC | 0.752 |
| hERG-70 (clasificación, pool bloqueado) | MCC | 0.525 |
| new-compounds (clasificación, pool bloqueado) | MCC | 0.270 (mejor de todos los modelos en ese pool) |
| Panel FDA (clasificación) | Errores | 3 |
| hERG-70 (regresión, pool bloqueado) | RMSE | 0.856 |

Los valores de `validation_results.json` son señales de selección de checkpoint in-sample y no constituyen benchmarks válidos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo molecular y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y los checkpoints son de una GAT con transformer congelado, lo que sugiere requisitos moderados, pero no se aportan cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por la naturaleza del artefacto, pero no confirmada; no disponible.
- Opciones de despliegue: inferencia mediante `predict_herg_cardio.py` sobre ficheros H5 featurizados; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Dependencia crítica de entorno: `torch_geometric` 2.4.0; los checkpoints no cargan correctamente bajo pyg 2.5.x (incidencia EIC-50).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento hERG-70 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hERG CardioGenAI — DEPLOYMENT REFIT | no disponible | no disponible (transformer de 57 tokens) | ACC 0.752 / MCC 0.525 (clasificación); RMSE 0.856 (regresión) | no disponible | Hugging Face (`Delower/herg-cardiogenai-deployment`) |
| CardioGenAI original (autores) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |
| Alternativas QSAR/GNN para hERG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los checkpoints han absorbido los conjuntos regulatorios y externos (hERG-70, new-compounds, FDA, REGFAIL); validar sobre ellos produce resultados inflados y no es una evaluación honesta.
- Los valores de `validation_results.json` son señales de selección in-sample, no benchmarks válidos.
- Licencia no declarada: no hay autorización explícita para uso comercial; requiere revisión legal antes de cualquier despliegue en producción.
- Pipeline, idiomas y parámetros totales no disponibles; el artefacto no declara metadatos de model card estándar.
- Dependencia estricta de `torch_geometric` 2.4.0; versiones 2.5.x rompen la carga de checkpoints.
- 57 compuestos (clasificación) y 35 (regresión) no codificables por el transformer se incluyen con vector cero y flag; su predicción puede ser menos fiable.
- Riesgo de alucinación no aplica en sentido textual, pero existe riesgo de falsos negativos/positivos en la predicción de bloqueo hERG; no sustituye ensayos experimentales.
- Sesgos conocidos: no documentados en la información disponible; el corpus regulatorio absorbido puede introducir sesgo de selección hacia compuestos del panel FDA.
- Ausencia de pesos preentrenados publicados por los autores originales; el modelo es un reentrenamiento independiente y no replica exactamente el original.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/herg-cardiogenai-deployment
- Documentación interna citada en el repositorio: `HARD_GATE_CORRECTED.md`, `FIX_REPORT_EIC53.md`, `validation_results.json`, `config.json`
- Script de inferencia: `predict_herg_cardio.py`
- Vocabulario del transformer: `vocab_recovered.npy`
- Módulo de modelo y dataset: `src/Discriminator.py`
- Paper, blog, repositorio o demo de CardioGenAI original: no disponible en la información proporcionada.
