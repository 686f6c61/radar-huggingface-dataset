# rishithakanugula26/enzyme-retrieval-v7

## Resumen

Enzyme-retrieval-v7 es un sistema de predicción de números EC (Enzyme Commission) a partir de reacciones químicas representadas como SMILES de reacción. Lo desarrolla el usuario rishithakanugula26 y está publicado en Hugging Face bajo licencia CC-BY-4.0. No es un modelo de lenguaje generativo al uso, sino un ensemble de clasificadores y codificadores orientado a una tarea concreta de recuperación y clasificación enzimática, con inferencia exclusivamente en CPU.

El sistema combina 18 redes neuronales organizadas en cinco grupos: tres clasificadores MLP sobre descriptores Morgan direccionales, tres sobre Morgan más DRFP, tres sobre pares de átomos direccionales, un BERT de reacciones (rxnfp) afinado y ocho codificadores duales reacción-EC. La predicción final se obtiene mediante una mezcla ponderada de las puntuaciones y un re-ranker de árboles gradient-boosted sobre los 20 candidatos mejor puntuados.

Su relevancia actual radica en el contexto de competiciones tipo leaderboard con fuga de datos ("leak-curber"): el diseño incorpora normalización explícita de moléculas, aumentación con reacciones invertidas, objetivos suaves multinivel (L1-L4) y un presupuesto temporal estricto de 540 segundos para garantizar que la inferencia no exceda el límite de evaluación incluso en máquinas lentas. El repositorio ocupa 1,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 18 redes: MLP sobre descriptores de huellas (Morgan, DRFP, pares de atomos), BERT de reacciones rxnfp afinado y codificadores duales reaccion-EC, mas re-ranker de 600 arboles gradient-boosted |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa SMILES de reaccion) |
| Tipos de cuantizacion | no disponible; los indices kNN se mantienen en float16 en memoria |
| Idiomas soportados | no disponible (la tarea es sobre notacion quimica, no lenguaje natural) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`bert_encoder.onnx`) para el codificador BERT; pesos del resto de redes en formato propio del repositorio; configuracion en `weights/config.json` |

## Arquitectura y entrenamiento

El sistema se articula en cinco grupos de redes. Los clasificadores MLP reciben bloques de descriptores direccionales: Morgan con 8.192 valores (subestructuras ganadas, perdidas y conservadas a radio 2 con 2.048 bits cada una, y a radio 1 con 1.024 bits cada una), DRFP con 2.048 bits a radio 3 con anillos, y pares de atomos direccionales con 6.144 valores (ganados, perdidos y conservados, 2.048 bits cada uno). Cada MLP tiene la estructura 8192/10240/6144 → 1536 → 768 con cabezas para los niveles L4, L3, L2 y L1 de la jerarquia EC. Se entrenan con objetivos suaves (1/n por cada EC registrado), aumentacion con reacciones invertidas y 20 epocas, y cada uno mezcla 0,6·red + 0,4·kNN en su espacio de embedding de 768 dimensiones (k=10).

Los ocho codificadores duales proyectan la reaccion (Morgan más DRFP) a un vector de 256 dimensiones y la EC a un vector suma de embeddings aprendidos de prefijos L1, L2, L3 y L4, con el termino L4 descartado aleatoriamente durante el entrenamiento para que las EC raras se apoyen en su subclase y clase. Los logits son una temperatura aprendida por similitud coseno, con label smoothing de 0,1, y mezclan 0,85·red + 0,15·kNN (k=5). El BERT de reacciones parte del rxnfp preentrenado de Schwaller et al. (Nat. Mach. Intell. 2021, licencia MIT), de 12 capas y 256 dimensiones, afinado para prediccion de EC con objetivos suaves en los cuatro niveles, orden aleatorio de moleculas y reacciones invertidas; en inferencia se ejecuta en ONNX Runtime y se verifico que coincide con el modelo GPU (16/16 top-1, probabilidades dentro de 1e-4).

La puntuacion final combina `s5 = 0,6·s_clasificadores + 0,4·s_dual`, luego `s = 0,65·s5 + 0,35·s_BERT`, y finalmente `score = log s + 0,25·log p_L3`, con p_L3 promediada entre los tres grupos de clasificadores y BERT. El re-ranker de etapa 2 re-puntua los 20 candidatos principales con 600 arboles gradient-boosted entrenados con scikit-learn sobre un holdout similar a validacion y evaluados en numpy en inferencia; las caracteristicas incluyen probabilidades por componente, rangos relativos, acuerdos entre componentes, probabilidades L3 y frecuencias de entrenamiento de cada EC. La validacion local imita el split con curado de fuga: un 15% de reacciones de entrenamiento que no comparten lado reactivo ni producto con el 85% restante, ponderado para igualar la distribucion conjunta de longitud de reaccion y similitud DRFP maxima con las entradas publicas de validacion.

## Capacidades

- Prediccion de un numero EC por reaccion SMILES, con puntuaciones jerarquicas en los cuatro niveles L1-L4.
- Normalizacion quimica previa: neutralizacion con RDKit `Uncharger`, eliminacion de estereoquimica y descarte de `[H+]` antes del calculo de huellas; las cadenas de reaccion originales no se alteran.
- Representacion mediante descriptores direccionales (Morgan, DRFP, pares de atomos) que distinguen subestructuras ganadas y perdidas en la reaccion.
- Recuperacion por vecinos mas cercanos (kNN) en espacios de embedding de 768 y 256 dimensiones, combinada con las salidas de red.
- Afinado de un codificador BERT de reacciones con soporte de inferencia en ONNX Runtime en CPU.
- Re-puntuacion de candidatos mediante gradient boosting con caracteristicas de ensemble.
- Gestion de presupuesto temporal: BERT se aplica a las reacciones mas cortas primero hasta los 540 segundos desde el inicio; las reacciones no alcanzadas conservan la prediccion del ensemble de huellas.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues de lenguaje natural.

## Casos de uso

- Anotacion funcional de enzimas en pipelines de bioinformatica: dado un conjunto de reacciones en formato Parquet, el sistema produce un JSONL con el EC predicho por reaccion, util para pre-anotar bases de datos metabolicas antes de la revision manual.
- Cribado de reacciones en descubrimiento de farmacos: la prediccion de EC permite agrupar reacciones candidatas por clase enzimatica y priorizar las que encajan con la via metabolica de interes.
- Enriquecimiento de datasets de entrenamiento para modelos generativos de reacciones: las predicciones EC sirven como etiquetas debiles para filtrar o estratificar datos antes de un ajuste fino.
- Participacion en competiciones tipo leaderboard con curado de fuga: el diseno con holdout que imita el split leak-curbed y el presupuesto temporal fijo lo hacen adecuado para entornos de evaluacion con restricciones de tiempo y fuga controlada.
- Construccion de motores de busqueda de reacciones similares: los embeddings de 768 y 256 dimensiones y los indices kNN permiten recuperar reacciones con perfil enzimatico parecido para sistemas de recomendacion de rutas.
- Analisis de rutas metabolicas: la salida jerarquica L1-L4 facilita mapear reacciones a clases, subclases y sub-subclases EC, lo que simplifica la reconciliacion con ontologias como ExPASy ENZ.
- Despliegue en entornos sin GPU: la inferencia es exclusivamente CPU con numpy, pandas, pyarrow, RDKit y drfp, lo que permite ejecutarlo en contenedores ligeros o nodos de computo sin acelerador.

## Benchmarks y rendimiento

Los resultados publicados corresponden a validacion local sobre el holdout que imita el split con curado de fuga, con exactitud top-1 por nivel jerarquico:

| Modelo | L4 | L3 | L2 | L1 |
|---|---|---|---|---|
| Clasificador Morgan (receta v3) | 0,565 | 0,805 | 0,848 | 0,904 |
| Clasificador Morgan+DRFP + termino L3 | 0,571 | 0,820 | 0,862 | 0,905 |
| Codificador dual | 0,558 | 0,805 | 0,844 | 0,893 |
| Mezcla v4 (clasificadores Morgan + DRFP, 2 duales) | 0,587 | 0,823 | 0,863 | 0,911 |
| Clasificador de pares de atomos solo | 0,551 | 0,797 | 0,838 | 0,891 |
| Mezcla v5 (+ clasificador de pares, 4 duales) | 0,596 | 0,824 | 0,861 | 0,909 |
| BERT solo (red + kNN) | 0,574 | 0,829 | 0,868 | 0,919 |
| Mezcla v6 (v5 + BERT, cuota 0,35) | 0,604 | 0,834 | 0,869 | 0,918 |
| v7: v6 + re-ranker (5-fold cross-fitted, media de 3 repeticiones) | 0,612 | 0,846 | 0,879 | 0,925 |

En el leaderboard publico, la metrica L4 reportada es: v4 0,603, v5 0,612 y v6 0,618. No se proporcionan resultados de v7 en el leaderboard publico.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- Memoria residente de pesos cercana a 2,4 GB, segun la model card, gracias a mantener los indices kNN en float16.
- Tamano del repositorio: 1,8 GB.
- Dependencias de inferencia: numpy, pandas, pyarrow, RDKit (fijado a la version usada en entrenamiento) y drfp; ONNX Runtime para el codificador BERT.
- Entrenamiento: PyTorch, suficiente con CPU.
- Presupuesto temporal de 540 segundos configurable en `weights/config.json` (`time_budget_s`); el codificador BERT se ejecuta en ONNX Runtime y se verifico su equivalencia con el modelo GPU.
- Latencia y throughput concretos: no disponibles.
- Opciones de despliegue: script `predict.py` con entrada Parquet y salida JSONL; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (L4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-retrieval-v7 | no disponible (18 redes + re-ranker) | no aplica | 0,612 en validacion local; sin dato publico de v7 en leaderboard | CC-BY-4.0 | Hugging Face |
| enzyme-retrieval-v6 (mismo autor) | no disponible | no aplica | 0,618 en leaderboard publico | CC-BY-4.0 | Hugging Face |
| enzyme-retrieval-v5 (mismo autor) | no disponible | no aplica | 0,612 en leaderboard publico | CC-BY-4.0 | Hugging Face |
| Entrada de poketwouser en el leaderboard (metodo de codificador dual referenciado) | no disponible | no aplica | no disponible | no disponible | Leaderboard de la competicion |

La model card indica que el diseno de codificador dual sigue el metodo descrito en el README de la entrada de poketwouser, implementado de forma independiente y sin sus redes de grafos. No se dispone de datos de otros modelos comparables de prediccion de EC en la informacion proporcionada.

## Limitaciones y advertencias

- El sistema predice un unico numero EC por reaccion; no modela reacciones con multiples enzimas ni rutas completas.
- La validacion se realizo sobre un holdout construido para imitar el split con curado de fuga, no sobre el conjunto de validacion publico real; el rendimiento en produccion puede diferir.
- El presupuesto temporal de 540 segundos implica que, en maquinas lentas, parte de las reacciones no recibe la prediccion del BERT y conserva solo la del ensemble de huellas, con posible perdida de exactitud.
- La normalizacion de moleculas (neutralizacion, eliminacion de estereoquimica y de `[H+]`) altera la representacion de entrada; reacciones cuya estereoquimica sea determinante pueden perder informacion.
- El BERT de reacciones subyacente tiene 12 capas y 256 dimensiones, un tamano modesto que limita su capacidad de representacion en reacciones muy complejas.
- Dependencia estricta de la version de RDKit usada en entrenamiento; cambios de version pueden alterar los descriptores y las predicciones.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un clasificador, el riesgo principal es la asignacion erronea de EC con alta confianza, especialmente en clases raras.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; debe verificarse el cumplimiento de la atribucion al autor y del componente rxnfp (MIT) en despliegues derivados.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia externa de validacion independiente.
- La fecha de creacion del repositorio indicada en la informacion (2026-11-03) es posterior a la consulta; conviene verificar la vigencia de los artefactos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/rishithakanugula26/enzyme-retrieval-v7
- Paper del rxnfp BERT referenciado: Schwaller et al., "Mapping the space of chemical reactions using attention-based neural networks", Nature Machine Intelligence, 2021 (licencia MIT)
- Repositorio rxnfp: no disponible en la informacion proporcionada
- Leaderboard de la competicion: no disponible en la informacion proporcionada
- Entrada de poketwouser referenciada: no disponible en la informacion proporcionada
- Demo: no disponible
