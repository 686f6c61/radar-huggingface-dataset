# Delower/egfr-pic50-gat-tuned

## Resumen

EGFR pIC50 (ExtraTrees + GAT tuned combo) es un modelo predictivo de QSAR desarrollado por el usuario Delower para estimar la potencia (pIC50) de compuestos frente al EGFR humano wild-type (CHEMBL203), una diana terapeutica central en cancer de pulmon no microcitico (NSCLC). No es un modelo de lenguaje: es un pipeline de regresion y clasificacion supervisada que combina descriptores fisicoquimicos, fingerprints de Morgan y un embedding de grafo obtenido con una Graph Attention Network (GAT) de dos capas, alimentando un ensamblado de ExtraTrees.

El sistema se distribuye como tres artefactos serializados (dos `.pkl` de scikit-learn y un `.pt` de PyTorch) mas el codigo de inferencia empaquetado en un Space de Hugging Face. El modelo se entrena sobre un conjunto curado de ChEMBL, BindingDB y PubChem con 10.105 compuestos de entrenamiento y reporta en test RMSE 0.644, R² 0.795 y MCC 0.686, ademas de una validacion externa sobre 14 farmacos aprobados (RMSE 0.680).

Su relevancia es acotada pero concreta: sirve como herramienta de cribado virtual temprano en descubrimiento de farmacos, con licencia MIT y artefactos reproducibles, aunque no cuenta con adopcion en la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble ExtraTrees (regresor + clasificador) sobre 1.158 features; GAT de 2 capas (FlexGNN, [128, 128], dropout 0) genera embedding de 128 dimensiones |
| Parametros totales | No disponible (ExtraTrees con 800 arboles; pesos GAT en `graph_gat_tuning_best.pt`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular/grafo, no secuencial) |
| Tipos de cuantizacion | No aplica (artefactos `.pkl` y `.pt` en precision nativa) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (scikit-learn) y `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. Primero, un GAT de dos capas con dimensiones [128, 128] y dropout 0 procesa el grafo molecular (features atomicas: numero atomico, grado, carga formal, pertenencia a anillo y aromaticidad) y produce un embedding global de 128 dimensiones mediante mean pooling. Ese embedding se concatena con un fingerprint de Morgan (radio 2, 1024 bits) y seis descriptores fisicoquimicos (MolWt, MolLogP, TPSA, HBD, HBA, RotatableBonds), dando un vector de 1.158 features. Sobre ese vector operan dos ExtraTrees: un regresor de 800 arboles para pIC50 continuo y un clasificador de tres clases (potent / moderate / not_potent).

El entrenamiento usa un conjunto "Clean v2" construido a partir de datos de IC50 de EGFR en ChEMBL, BindingDB y PubChem, deduplicado por prioridad de fuente (ChEMBL > BindingDB > PubChem). El split es 80/10/10 con semilla 42 y estratificacion por banda de pIC50. Antes del split se elimino a nivel de compuesto padre el conjunto externo de 15 farmacos aprobados, con auditoria de fuga que reporta 0/15 solapamientos. El conjunto de entrenamiento tiene n=10.105. No se menciona uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo esperable en un modelo QSAR supervisado.

## Capacidades

- Prediccion de pIC50 continuo frente a EGFR humano wild-type (CHEMBL203).
- Clasificacion de potencia en tres clases: potent, moderate y not_potent.
- Prediccion individual y por lotes (batch) mediante el Space asociado.
- Construccion automatica de features a partir de moleculas de entrada (fingerprint de Morgan, descriptores fisicoquimicos y embedding GAT).
- Reproducibilidad verificada: las predicciones reproducen la rejilla externa validada (gefitinib 7.526, erlotinib 7.818).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo generativo.

## Casos de uso

- Cribado virtual temprano en descubrimiento de farmacos para NSCLC: el modelo permite puntuar librerias de compuestos y priorizar aquellos con pIC50 predicho alto antes de sintesis o ensayos in vitro, usando el regresor y el clasificador de forma complementaria.
- Filtrado de compuestos en pipelines de quimioinformatica: al aceptar moleculas y generar features internamente, puede integrarse en scripts de Python que procesen lotes de SMILES y descarten candidatos con baja potencia predicha.
- Priorizacion de analogos en optimizacion de leads: dado un hit inicial, el modelo permite estimar como varia la potencia al modificar grupos funcionales, guiando la exploracion quimica.
- Analisis de relaciones estructura-actividad (SAR): el clasificador de tres clases ayuda a segmentar compuestos en bandas de potencia para analisis exploratorio de series quimicas.
- Validacion cruzada con modelos generativos o LLM: el autor lo compara con variantes Mistral+ExtraTrees y Graph+Mistral, por lo que puede usarse como referencia cuantitativa frente a enfoques basados en lenguaje.
- Reproduccion de experimentos academicos: al publicar pesos, features y codigo de inferencia con licencia MIT, sirve como baseline reproducible en estudios de QSAR con GNN sobre EGFR.
- Prototipado rapido en un Space de Hugging Face: util para demos internas o docencia sin infraestructura propia, con prediccion individual y por lotes.

## Benchmarks y rendimiento

| Split | RMSE | MAE | R² | Accuracy | F1 macro | MCC |
|---|---|---|---|---|---|---|
| Validacion (n=1.264) | 0.661 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Test (n=1.264) | 0.644 | 0.460 | 0.795 | 0.880 | 0.771 | 0.686 |
| Externo FDA-15 (n=14 puntuados) | 0.680 | 0.520 | No disponible | No disponible | No disponible | No disponible |

El autor indica que estos resultados son los mejores en test y en validacion externa entre las siete arquitecturas comparadas (ExtraTrees, +GCN, +GAT, Mistral+ExtraTrees, Graph+Mistral, LTN y el mejor modelo de LazyPredict). No se publican en la informacion disponible los valores numericos de las arquitecturas alternativas, solo la afirmacion de que este combo las supera.

## Requisitos de hardware

- Inferencia en CPU: viable. ExtraTrees con 800 arboles y un GAT de 2 capas con 128 dimensiones son ligeros; el repositorio ocupa 1,0 GB, principalmente por los pesos y dependencias.
- VRAM estimada: no disponible de forma explicita; por el tamano del GAT (capas de 128) y la naturaleza tabular del ensemble, cabria esperar un consumo muy bajo, del orden de cientos de MB, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no se especifican. Para inferencia por lotes pequenos, CPU es suficiente; para lotes grandes, cualquier GPU consumer moderna (por ejemplo RTX 3060 o superior) seria mas que suficiente.
- Cabe en GPU consumer: si, con margen amplio, segun el tamano de los artefactos.
- Opciones de despliegue: el autor empaqueta el codigo de inferencia (constructores de features y GAT en PyTorch puro) en el Space `Delower/egfr-pic50-webapp`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EGFR pIC50 ExtraTrees + GAT tuned (este) | No disponible (800 arboles + GAT 128) | No aplica | Test RMSE 0.644, R² 0.795, MCC 0.686 | MIT | Hugging Face (repo + Space) |
| ExtraTrees solo (variante del autor) | No disponible | No aplica | Peor que el combo segun el autor; cifras no publicadas | No disponible | No disponible como artefacto independiente |
| ExtraTrees + GCN (variante del autor) | No disponible | No aplica | Peor que el combo segun el autor; cifras no publicadas | No disponible | No disponible como artefacto independiente |
| Mistral + ExtraTrees (variante del autor) | No disponible | No aplica | Peor que el combo segun el autor; cifras no publicadas | No disponible | No disponible como artefacto independiente |

No se dispone de datos numericos de las alternativas en la informacion proporcionada, solo de la afirmacion cualitativa de que este modelo es el mejor de las siete arquitecturas evaluadas por el autor. No se identifican modelos publicos comparables de terceros en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo predice frente a EGFR wild-type (CHEMBL203); no es valido para mutantes (por ejemplo T790M o L858R) ni para otras dianas sin reentrenamiento.
- Conjunto externo pequeno: la validacion externa se realiza sobre 14 farmacos aprobados puntuados, lo que limita la solidez estadistica de esa metrica.
- Riesgo de sesgo de datos: el entrenamiento combina ChEMBL, BindingDB y PubChem con deduplicacion por prioridad de fuente; la distribucion quimica del dataset condiciona las predicciones y puede degradarlas en quimiotipos poco representados.
- No es un modelo generativo: no admite prompts, tool calling ni razonamiento; su uso esta limitado a prediccion tabular sobre moleculas.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente por terceros.
- Idiomas y cuantizacion no aplican; no debe interpretarse como un modelo de lenguaje pese a estar alojado en Hugging Face.
- Licencia MIT: permite uso comercial, pero no se ofrece garantia alguna sobre el rendimiento en produccion; se recomienda validacion prospectiva antes de decisiones criticas.
- Artefactos serializados: los `.pkl` requieren versiones compatibles de scikit-learn y los `.pt` de PyTorch; la reproducibilidad depende del entorno del Space.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/egfr-pic50-gat-tuned
- Space de inferencia: https://huggingface.co/spaces/Delower/egfr-pic50-webapp
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos mas alla de los enlaces anteriores.
