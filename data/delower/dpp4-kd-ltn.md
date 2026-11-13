# Delower/dpp4-kd-ltn

## Resumen

DPP-4 Kd LTN es un modelo de regresión tabular desarrollado por Delower que predice la afinidad de unión (pKd) de moléculas pequeñas frente a la dipeptidil peptidasa 4 humana (DPP-4, UniProt P27487, ChEMBL CHEMBL284) a partir de su representación SMILES. No es un modelo de lenguaje: es un MLP de tres capas (768 → 384 → 192) con dos cabezas de salida, una de regresión continua para pKd y otra de clasificación en tres bandas de potencia. La entrada combina un fingerprint de Morgan de 2048 bits con un embedding ESM-2 650M de la proteína, fijado para DPP-4.

El componente diferencial es la capa LTN (Logical Tensor Network): la función de pérdida incorpora un término de satisfacibilidad de una axiomática lógica difusa sobre la banda de potencia verdadera, además de MSE y entropía cruzada. El modelo se entrenó en dos fases: un preentrenamiento sobre 86.569 pares compuesto-diana de ChEMBL, BindingDB, PubChem y PDBbind, y un ajuste fino sobre 555 compuestos con Ki medida para DPP-4.

Es relevante en el contexto del descubrimiento de fármacos asistido por ML porque ejemplifica el patrón de transferencia desde corpus masivos multi-diana hacia un objetivo único con datos escasos, y porque el autor publica métricas de validación externa honestas (n = 15, RMSE ≈ 1,6 unidades log) junto con los pesos y el script de inferencia. La licencia MIT facilita su reutilización, aunque el rendimiento limitado lo circunscribe a cribado y priorización, no a sustitución de medidas experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (trunk 768 → 384 → 192, activación GELU, dropout 0.1) con cabeza de regresión pKd y cabeza de clasificación en 3 bandas; pérdida aumentada con término LTN (SatAgg p=2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante estándar; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto natural; entrada SMILES + embedding proteico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`ltn_stage2.pt`); embedding proteico en NumPy (`esm2_dpp4.npz`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa con trunk de tres capas densas (768 → 384 → 192) y activación GELU más dropout de 0.1. La entrada tiene 3.328 dimensiones sin escalado: 2.048 bits del fingerprint de Morgan (radio 2, RDKit) concatenados con 1.280 dimensiones del embedding medio de ESM-2 650M calculado sobre la secuencia completa de DPP-4 humana. El embedding proteico se precalcula una sola vez y se reutiliza, de modo que la proteína es una constante y el modelo solo varía con el ligando. La pérdida combina MSE sobre pKd, entropía cruzada sobre la banda de potencia y un término de satisfacibilidad (SatAgg con p=2) que penaliza inconsistencias entre la predicción continua y la banda verdadera, lo que constituye el componente LTN.

El entrenamiento es una transferencia en dos etapas. La primera usa un corpus multi-diana de 86.569 filas compuesto-diana procedentes de ChEMBL, BindingDB, PubChem y PDBbind, con learning rate 1e-4, batch 256 y parada temprana; en el test retenido de esa etapa (n = 8.658) se obtuvo RMSE 0,8865 y R² 0,6969. La segunda etapa ajusta todos los pesos sobre 555 compuestos con Ki medida para DPP-4, usando pKi como etiqueta, learning rate 5e-5, batch 64 y parada temprana; los pesos desplegados (`ltn_stage2.pt`) son los de esta fase. La evaluación externa se realizó sobre los únicos 15 compuestos DPP-4 con Kd medida, bloqueados por identidad molecular de ambas etapas de entrenamiento (solapamiento verificado como cero). El cómputo se ejecutó en UAB Cheaha mediante SPARCq.

## Capacidades

- Predicción de afinidad de unión (pKd) para moléculas pequeñas frente a DPP-4 humana a partir de SMILES.
- Conversión automática de la predicción a Kd en nanomolar mediante Kd = 10^(9 − pKd).
- Cálculo de energía libre de Gibbs de unión en kcal/mol con la convención ΔG° = −RT·ln10·pKd a 298,15 K (factor −1,3642).
- Clasificación de potencia en tres bandas: potent (pKd ≥ 7), moderate (6–7) y weak (< 6).
- Procesamiento por lotes desde CSV con selección de columna SMILES y exportación de predicciones.
- Inferencia autocontenida mediante `predict_kd.py`, que integra el cálculo de fingerprints y la carga del embedding proteico.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor tabular de diana única.

## Casos de uso

- Cribado virtual de quimiotecas: dado un conjunto de SMILES, el modelo devuelve pKd y banda de potencia para priorizar compuestos antes de ensayos bioquímicos, aprovechando el procesamiento por lotes de `predict_kd.py` sobre ficheros CSV.
- Priorización en programas de inhibidores de DPP-4: útil para ordenar series químicas por afinidad predicha y decidir qué análogos sintetizar primero, con la advertencia de que la señal es de ranking y no de afinidad absoluta.
- Análisis de relaciones estructura-actividad (SAR) exploratorio: al ser un modelo de diana única y evaluación rápida, permite barrer modificaciones sistemáticas de un esqueleto y detectar tendencias de potencia relativa.
- Filtrado temprano en pipelines de diseño generativo: integrable como función de scoring en flujos que proponen moléculas y necesitan descartar candidatos con banda weak antes de costosas etapas de docking o síntesis.
- Docencia y reproducción metodológica: el repositorio incluye pesos, script de inferencia, métricas y el grid de test externo, lo que permite reproducir exactamente los resultados publicados y estudiar la integración de lógica difusa en pérdidas de regresión.
- Baseline interno para comparación de modelos: sirve como referencia cuantitativa (RMSE 1,6037, MAE 1,2758 en el test externo de 15 compuestos) frente a alternativas como GAT o ensembles de árboles en tareas de predicción de afinidad para DPP-4.

## Benchmarks y rendimiento

Resultados en el test externo de 15 compuestos DPP-4 con Kd medida, según `kd_model_comparison.csv`:

| Modelo | RMSE externo (pKd) | MAE externo (pKd) | Exactitud de clase |
|---|---|---|---|
| LTN (este modelo) | 1,6037 | 1,2758 | 0,8667 |
| GAT + cabeza ExtraTrees | 1,6106 | no disponible | no disponible |
| GAT | 1,6579 | 1,3741 | 0,9333 |
| Mistral-8L (backbone reducido) | 1,6923 | 1,4679 | 0,9333 |
| Árboles (RandomForest / ExtraTrees) | no disponible (fila vacía en el fichero de comparación) | no disponible | no disponible |

En la etapa 1 (preentrenamiento multi-diana), sobre el test retenido de 8.658 filas: RMSE 0,8865 y R² 0,6969. Las métricas del test externo fueron reproducidas por inferencia en vivo desde los pesos del repositorio el 2026-11-12, con coincidencia de las predicciones por compuesto frente a `external_ltn.csv` inferior a 5×10⁻⁵.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el trunk es un MLP de 768 → 384 → 192, por lo que los pesos ocupan del orden de megabytes. El coste dominante es el cálculo del fingerprint con RDKit, no la red.
- GPU recomendadas: no se requieren; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ejecuta la inferencia sin problema. El embedding ESM-2 650M ya está precalculado y empaquetado, por lo que no es necesario cargar el modelo proteico en memoria.
- Cabe en GPU consumer: sí, holgadamente, e incluso en CPU para lotes moderados.
- Opciones de despliegue: inferencia directa con PyTorch mediante `predict_kd.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | RMSE externo (pKd) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DPP-4 Kd LTN (este) | MLP + pérdida LTN | no disponible | no aplica | 1,6037 | MIT | Pesos y script en Hugging Face |
| GAT | Graph Attention Network | no disponible | no aplica | 1,6579 | no disponible | Referenciado en el fichero de comparación del repo |
| GAT + cabeza ExtraTrees | Híbrido GNN + árboles | no disponible | no aplica | 1,6106 | no disponible | Referenciado en el fichero de comparación del repo |
| Mistral-8L (backbone reducido) | Transformer reducido | no disponible | no disponible | 1,6923 | no disponible | Referenciado en el fichero de comparación del repo |
| RandomForest / ExtraTrees | Ensemble de árboles | no disponible | no aplica | no disponible | no disponible | Fila vacía en el fichero de comparación |

## Limitaciones y advertencias

- Precisión externa modesta: RMSE ≈ 1,6 unidades log sobre solo 15 compuestos, con un sesgo sistemático de subpredicción de −1,10 unidades de pKd.
- Desajuste entre etiquetas: el ajuste fino usa Ki mientras que la evaluación externa usa Kd, lo que introduce error de transferencia no cuantificado por separado.
- Diana única: el embedding ESM-2 corresponde exclusivamente a DPP-4 humana; el modelo no puede puntuar otras proteínas sin reentrenamiento y sustitución del vector proteico.
- Tamaño de test externo muy reducido (n = 15), lo que hace que las métricas tengan intervalos de confianza amplios y no sean concluyentes.
- Uso previsto exclusivamente en investigación; no sustituye la medición experimental de Kd.
- Riesgo de extrapolación fuera del espacio químico cubierto por ChEMBL, BindingDB, PubChem y PDBbind; el modelo no aporta estimaciones de incertidumbre calibradas más allá de la banda de potencia.
- No se documentan análisis de sesgo químico, cobertura de scaffolds ni comportamiento frente a compuestos fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/dpp4-kd-ltn
- Ficheros del repositorio: `ltn_stage2.pt`, `predict_kd.py`, `config.json`, `esm2_dpp4.npz`, `external_ltn.csv`, `metrics_ltn.json`, `kd_model_comparison.csv`
- DPP-4 en UniProt: https://www.uniprot.org/uniprotkb/P27487
- DPP-4 en ChEMBL: https://www.ebi.ac.uk/chembl/target_report_card/CHEMBL284
- ESM-2 (Meta AI): https://github.com/facebookresearch/esm
- RDKit: https://www.rdkit.org
- No se han proporcionado enlaces a papers, blogs o demos adicionales en la información disponible.
