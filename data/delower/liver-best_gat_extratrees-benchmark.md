# Delower/liver-best_gat_extratrees-benchmark

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de clasificación binaria orientado a la predicción de toxicidad hepática (DILI, *Drug-Induced Liver Injury*) a partir de estructuras químicas en formato SMILES. Lo publica el usuario Delower como parte de un programa interno de toxicología hepática y combina dos aproximaciones complementarias: un ensamblador de árboles ExtraTrees sobre descriptores moleculares clásicos y una red neuronal de grafos (GAT) que opera directamente sobre la representación gráfica de la molécula.

La versión aquí publicada es la de *benchmark*, entrenada sobre el split de entrenamiento de un conjunto bloqueado de 1.769 compuestos (con ajuste final sobre train+val, 1.592 compuestos), manteniendo completamente fuera los conjuntos regulatorios de referencia (fármacos retirados, fallos clínicos y compuestos aprobados). Existe una versión separada de despliegue (`Delower/liver-best_gat_extratrees-deployment`) cuyas métricas no son extrapolables a esta.

Su relevancia es acotada pero concreta: ofrece un pipeline reproducible con pesos empaquetados (joblib y PyTorch) que reproduce exactamente las predicciones registradas del programa, con un AUROC combinado de 0,758 sobre el conjunto regulatorio y una tasa de detección de 67/71 fármacos retirados. No es un modelo fundacional ni un LLM; es una herramienta de cribado preclínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado híbrido: ExtraTrees (árboles) + GAT (Graph Attention Network) |
| Parametros totales | no disponible (pesos en `extratrees_model.joblib` y `gat_model.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: SMILES de longitud variable; GAT con grafo molecular) |
| Tipos de cuantizacion | no disponible (no se documenta cuantización) |
| Idiomas soportados | no aplica (entrada química, no texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (ExtraTrees + DescPrep) y PyTorch `.pt` (GAT) |

## Arquitectura y entrenamiento

El sistema es un *blend* fijo con pesos bloqueados: `blended_prob = 0.55 * extratrees_prob + 0.45 * gat_prob`, con umbral de decisión en 0,5. Los pesos se seleccionaron mediante una búsqueda en rejilla sobre MCC en el fold de validación interno y nunca se reajustaron. La rama ExtraTrees (arch3, ganadora de LazyPredict) consume 1.404 dimensiones de características: 1.024 bits Morgan + 167 MACCS + descriptores RDKit preparados con DescPrep. La rama GAT (arch2, GATNet) usa dos capas GATConv (4 y 1 cabezas, `edge_dim=4`), `global_mean_pool` y una cabeza MLP, con dimensión oculta 128, `in_dim=35`, dropout 0,2, learning rate 0,003 y 37 épocas fijas.

El entrenamiento se realizó sobre el split de train del pool bloqueado de 1.769 compuestos, con ajuste final sobre train+val (1.592 compuestos). Los conjuntos regulatorios (retirados, fallos clínicos, aprobados) quedaron completamente fuera del entrenamiento en esta versión de benchmark. No se documenta uso de RLHF, DPO ni técnicas de alineación, al no tratarse de un modelo generativo.

## Capacidades

- Clasificación binaria de preocupación DILI a partir de SMILES.
- Predicción probabilística combinada y por rama (ExtraTrees y GAT por separado).
- Indicador `flagged_by_both` cuando ambas ramas superan 0,5, útil para triaje de alta confianza.
- Procesamiento por lotes vía `--csv` y predicción individual por línea de comandos (`predict_liver.py "CC(=O)..."`).
- Reproducibilidad verificada: las probabilidades regulatorias se reproducen con diferencia máxima 0,0 (ExtraTrees) y 1,5e-07 (GAT) frente a las predicciones guardadas.
- No soporta tool calling, agentes, visión, audio ni generación de texto.

## Casos de uso

- Cribado preclínico temprano: filtrar bibliotecas de compuestos antes de ensayos in vitro, usando la probabilidad combinada como señal de priorización y `flagged_by_both` para los candidatos de mayor riesgo.
- Triaje regulatorio interno: evaluar compuestos candidatos frente a patrones asociados a fármacos retirados, aprovechando que el conjunto regulatorio se mantuvo fuera del entrenamiento en esta versión de benchmark.
- Análisis de series químicas: procesar un CSV completo de análogos con `--csv` para identificar posiciones estructurales asociadas a mayor preocupación hepática.
- Validación de modelos internos: usar los pesos empaquetados y `GATE_RESULTS.json` como referencia reproducible para comparar futuras variantes del pipeline.
- Investigación metodológica: comparar el rendimiento de descriptores clásicos (Morgan + MACCS + RDKit) frente a representaciones gráficas (GAT) en un mismo conjunto bloqueado.
- Docencia y experimentación: ejemplo reproducible de ensamblado entre un modelo tabular y un GNN sobre datos moleculares, con métricas de referencia publicadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUROC combinado (conjunto regulatorio) | 0,758 |
| AUROC GAT solo (conjunto regulatorio) | 0,788 |
| Fármacos retirados detectados a umbral 0,5 | 67/71 |
| MCC GAT (fold de test interno, n=177) | 0,2678 |
| AUROC GAT (fold de test interno, n=177) | 0,6533 |
| MCC ExtraTrees (ajuste final train+val, test) | 0,3507 |
| MCC ExtraTrees (modelo train-fold, registrado) | 0,3368 |

No se han publicado resultados comparativos con otros modelos de predicción DILI en la información disponible.

## Requisitos de hardware

- La inferencia es ligera: ExtraTrees sobre 1.404 dimensiones y un GAT de dimensión oculta 128 no requieren GPU dedicada; pueden ejecutarse en CPU.
- GPU opcional para el GAT (cualquier GPU con soporte PyTorch y torch-geometric); no se documentan requisitos mínimos de VRAM.
- VRAM estimada: no disponible; por el tamaño del modelo, previsiblemente inferior a 1 GB.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Dependencias: `rdkit`, `scikit-learn`, `joblib`, `torch`, `torch-geometric`.
- Opciones de despliegue: script `predict_liver.py`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Métrica DILI reportada | Licencia |
|---|---|---|---|---|
| Delower/liver-best_gat_extratrees-benchmark | Híbrido ExtraTrees + GAT | SMILES → descriptores + grafo | AUROC 0,758 (regulatorio) | no disponible |
| Delower/liver-best_gat_extratrees-deployment | Híbrido ExtraTrees + GAT | Reajuste con pool completo | no aplicable al benchmark | no disponible |
| Alternativas públicas de predicción DILI | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Es un clasificador binario específico de toxicidad hepática; no es un modelo de lenguaje ni un modelo generativo.
- Las métricas de benchmark no son válidas para la versión de despliegue, que reajusta con compuestos regulatorios absorbidos en entrenamiento.
- El MCC en test interno es moderado (0,27–0,35), lo que indica capacidad discriminativa limitada fuera del conjunto regulatorio.
- El AUROC combinado (0,758) es inferior al del GAT por separado (0,788) sobre el conjunto regulatorio, lo que sugiere que el blend no domina en todas las métricas.
- No se documenta licencia, lo que impide determinar condiciones de uso comercial.
- No se documentan sesgos, calibración probabilística ni análisis de subgrupos químicos.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de validación externa independiente.
- El tamaño del repo es 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el reporte de tamaño es incompleto.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/liver-best_gat_extratrees-benchmark
- Versión de despliegue: `Delower/liver-best_gat_extratrees-deployment` (referenciada en la model card)
- Script de validación: `validate_benchmark.py` (incluido en el repo según la model card)
- Resultados de verificación: `GATE_RESULTS.json` (incluido en el repo según la model card)
- Pesos: `extratrees_model.joblib`, `gat_model.pt` (incluidos en el repo según la model card)
- Paper, blog o demo: no disponible
