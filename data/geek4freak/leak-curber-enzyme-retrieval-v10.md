# geek4freak/leak-curber-enzyme-retrieval-v10

## Resumen

Leak CURBER enzyme retrieval v10 es un sistema de prediccion de numeros EC (Enzyme Commission) a partir de SMILES de reaccion, desarrollado por el usuario geek4freak y publicado en Hugging Face bajo licencia MIT. No se trata de un unico modelo neuronal, sino de un ensemble heterogeneo que combina 15 clasificadores MLP residuales sobre vistas de fingerprint de reaccion, tres BERT de reaccion afinados (rxnfp) ejecutados con ONNX Runtime, y un re-ranker de segundo estadio basado en gradient-boosted trees implementado en NumPy. El objetivo es asignar una clase enzimatica (nivel EC-4) a una reaccion quimica dada, tarea relevante en anotacion funcional, diseno de rutas biosinteticas y curacion de bases de datos metabolicas.

La propuesta tecnica se apoya en representaciones complementarias: fingerprint Morgan dirigido (reactivos, productos, subestructuras ganadas y perdidas), fingerprints de centro de reaccion, TF-IDF de caracteres 3-5-gram y embeddings de los BERT de reaccion. Sobre estas senales se aplica recuperacion por kNN coseno y un re-ranker aprendido sobre los 20 candidatos EC mejor puntuados. El sistema incorpora robustez frente a reacciones incompletas (half-reaction) mediante aumento con eliminacion de metabolitos moneda y perturbacion de holdout.

El modelo se distribuye como artefacto ONNX de aproximadamente 1,1 GB, con inferencia exclusivamente en CPU mediante un script `predict.py`. No se publican idiomas soportados ni pipeline estandar de Hugging Face, y el repositorio no registra descargas ni likes en el momento de la consulta. Su relevancia radica en el enfoque de ensemble con re-ranking y en la atencion explicita a la robustez de reacciones parciales, un problema practico frecuente en datos metabolicos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: 15 MLP residuales sobre fingerprints + 3 BERT de reaccion (rxnfp) en ONNX + kNN coseno + re-ranker GBT de segundo estadio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: un SMILES de reaccion) |
| Tipos de cuantizacion | no disponible (artefactos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (dominio quimico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`bert_0.onnx`, `bert_1.onnx`, `bert_2.onnx`), vocabularios `.txt`, re-ranker en `.npz` (NumPy) |

## Arquitectura y entrenamiento

El sistema es un pipeline multiestadio. En el primer estadio se construye un fingerprint Morgan de reaccion dirigido que codifica reactivos, productos y las diferencias de subestructuras ganadas y perdidas (desplegadas y luego plegadas). Sobre cinco vistas de fingerprint (`morgan`, `rsplit`, `atompair`, `morgan+aug`, `rsplit+aug`) se entrenan 15 clasificadores MLP residuales con objetivos multi-EC suaves (1/n) y cabezas auxiliares L3/L2/L1, usando aumento por reaccion invertida. En paralelo, tres BERT de reaccion rxnfp (dos checkpoints y una semilla adicional) se preentrenan con enmascaramiento adaptado al dominio y se afinan durante 8 epocas para clasificacion EC con aumento por SMILES aleatorios; se ejecutan con ONNX Runtime.

El segundo estadio combina recuperacion kNN coseno sobre el fingerprint, el centro de reaccion, TF-IDF de caracteres 3-5-gram y los embeddings de MLP y BERT. Un re-ranker de gradient-boosted trees (inferencia NumPy, fichero `rerank.npz`) reordena los 20 candidatos EC mejor puntuados usando 11 miembros (`knn_diff`, `knn_text`, `mlp_morgan`, `mlp_rsplit`, `mlp_atompair`, `knnemb_atompair`, `knnemb_morgan+aug`, `mlp_rsplit+aug`, `knnemb_rsplit+aug`, `bert`, `knnemb_bert`). Los pesos del ensemble se ajustaron sobre un holdout tipo validacion construido con clusters de similitud curbada y reponderacion a las entradas de validacion publicas, sin usar etiquetas. Se incorpora normalizacion de carga en el fingerprinting (neutralizacion, eliminacion de [H+]) sin alterar las cadenas de entrada, y robustez a half-reaction mediante aumento con eliminacion de metabolitos moneda. El vocabulario EC proviene de ExPASy ENZYME release 02-Sep-2026.

## Capacidades

- Prediccion de un numero EC por SMILES de reaccion, con granularidad hasta nivel EC-4.
- Clasificacion multi-EC suave en el primer estadio, agregada a una unica prediccion final.
- Recuperacion por similitud (kNN) sobre fingerprints y embeddings para proponer candidatos.
- Re-ranking aprendido sobre los 20 candidatos EC mejor puntuados.
- Robustez frente a reacciones incompletas o con metabolitos moneda (half-reaction).
- Normalizacion interna de cargas y eliminacion de protones en el fingerprinting.
- Inferencia exclusivamente en CPU mediante script CLI (`predict.py`).
- No soporta tool calling, agentes, vision, audio ni modo thinking: es un clasificador de dominio especifico.
- Capacidades multilingues: no aplica; la entrada es quimica estructurada (SMILES).

## Casos de uso

- Anotacion funcional de reacciones en bases de datos metabolicas: dado un SMILES de reaccion sin EC asignado, el sistema devuelve una clase EC-4 candidata que puede priorizar la revision manual en pipelines de curacion.
- Diseno de rutas biosinteticas: al proponer una reaccion candidata, el modelo sugiere la familia enzimatica que la catalizaria, ayudando a seleccionar enzimas plausibles para cada paso de la ruta.
- Enriquecimiento de datasets de entrenamiento: generar etiquetas EC debiles sobre reacciones no anotadas para preentrenar o aumentar modelos posteriores, usando el re-ranker para filtrar candidatos de baja confianza.
- Analisis de reacciones parciales en metabolomica: la robustez a half-reaction permite clasificar reacciones incompletas o con metabolitos moneda eliminados, frecuentes en datos experimentales ruidosos.
- Deteccion de inconsistencias en anotaciones existentes: comparar la prediccion del ensemble con la etiqueta EC registrada para marcar posibles errores en bases de datos curadas.
- Herramienta de soporte en laboratorio seco: integracion en scripts de CPU para clasificar lotes de reacciones sin GPU, por ejemplo en entornos de CI o servidores sin acelerador.
- Filtrado previo en busquedas de enzimas: usar los 20 candidatos EC del re-ranker como conjunto reducido para consultas posteriores en bases de datos enzimaticas.

## Benchmarks y rendimiento

Resultados del holdout local publicado por el autor (holdout tipo validacion, ponderado, construido para imitar el split del leaderboard; puntuaciones con validacion cruzada, pesos ajustados en una mitad y evaluados en la otra):

| Nivel EC | Score |
|---|---|
| L4 | 0.6540 |
| L3 | 0.8689 |
| L2 | 0.9038 |
| L1 | 0.9359 |

El autor advierte que la estimacion local puede diferir del score real del leaderboard. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU segun la model card (`python /app/predict.py --input IN --output OUT`).
- VRAM: no aplica; no se requiere GPU.
- GPU recomendadas: no disponible; el diseno es CPU-only.
- Cabida en GPU consumer: no aplica (artefactos ONNX para CPU).
- Tamano del repositorio: aproximadamente 1,1 GB, lo que condiciona el espacio en disco y la memoria RAM necesaria para cargar los tres BERT ONNX y el ensemble.
- Opciones de despliegue: ONNX Runtime (mencionado explicitamente); el re-ranker usa NumPy. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Leak CURBER enzyme retrieval v10 | Ensemble MLP + BERT rxnfp + kNN + GBT re-ranker | no disponible | no aplica | L4 0.6540 / L3 0.8689 (holdout local) | MIT | Hugging Face, ONNX CPU |
| BEC-Pred (Qian et al., 2024) | Prediccion EC (referencia citada) | no disponible | no disponible | no disponible | no disponible | Referencia bibliografica |
| CLIPZyme (Mikhael et al., ICML 2024) | Retrieval enzima-reaccion (referencia citada) | no disponible | no disponible | no disponible | no disponible | Referencia bibliografica |
| Horizyn (Rocks et al., PNAS 2026) | Retrieval enzima-reaccion (referencia citada) | no disponible | no disponible | no disponible | no disponible | Referencia bibliografica |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada; se listan unicamente como referencias citadas por el autor.

## Limitaciones y advertencias

- Predice un unico numero EC por reaccion; no modela reacciones con multiples enzimas o promiscuidad catalitica.
- El holdout local es una estimacion construida por el autor para imitar el leaderboard; el rendimiento real puede diferir y no hay validacion externa independiente.
- Los pesos del ensemble se ajustaron sobre un holdout derivado de los datos de entrenamiento (clusters de similitud curbada), lo que puede introducir sesgo de seleccion pese a la validacion cruzada.
- No se documentan sesgos conocidos ni evaluacion de robustez fuera de la perturbacion half-reaction.
- Riesgo de alucinacion en sentido estricto no aplica (clasificador), pero puede asignar EC incorrectos con alta confianza en reacciones fuera de la distribucion de entrenamiento.
- Idiomas soportados no disponibles; la entrada debe ser SMILES valido y el rendimiento depende de la calidad de la representacion quimica.
- Licencia MIT permite uso comercial, pero el vocabulario EC de ExPASy se distribuye bajo CC BY 4.0, lo que exige atribucion.
- El repositorio no registra descargas ni likes; no hay evidencia de uso en produccion ni mantenimiento activo.
- Inferencia solo en CPU; no se documentan optimizaciones de latencia ni throughput para lotes grandes.

## Enlaces

- Hugging Face: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v10
- rxnfp (Schwaller et al., Nat. Mach. Intell. 2021; MIT): referencia citada en la model card, sin URL explicita.
- BEC-Pred (Qian et al., J. Cheminform. 2024): referencia citada, sin URL explicita.
- CLIPZyme (Mikhael et al., ICML 2024): referencia citada, sin URL explicita.
- Horizyn (Rocks et al., PNAS 2026): referencia citada, sin URL explicita.
- CARE/CREEP (Yang et al., 2025): referencia citada, sin URL explicita.
- DRFP (Probst et al., 2022): referencia citada, sin URL explicita.
- ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0): fuente del vocabulario EC, sin URL explicita en la model card.
