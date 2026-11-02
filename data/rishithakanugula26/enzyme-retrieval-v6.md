# rishithakanugula26/enzyme-retrieval-v6

## Resumen

enzyme-retrieval-v6 es un sistema de prediccion de numeros EC (Enzyme Commission) a partir de reacciones quimicas representadas como SMILES de reaccion. Lo desarrolla el usuario rishithakanugula26 como entrada para una competicion de tipo leaderboard (etiqueta `leak-curber`, que sugiere un split disenado para evitar fuga de informacion entre entrenamiento y validacion). No es un modelo de lenguaje generativo ni un transformer unico: es un ensemble de 18 redes neuronales ligeras mas un BERT de reacciones fine-tuneado, empaquetado para inferencia en CPU.

El sistema combina tres familias de descriptores quimicos (bloques Morgan direccionales de 8.192 valores, DRFP de 2.048 bits y conteos direccionales de pares de atomos de 6.144 valores) con un encoder rxnfp BERT de 12 capas y dimension 256. La prediccion final se obtiene por mezcla ponderada de clasificadores MLP, encoders duales reaccion-EC y el BERT, con un termino adicional que incorpora la probabilidad de la subclase EC padre.

Es relevante por su enfoque de ingenieria: normalizacion agresiva de moleculas antes del fingerprinting, aumento de datos con reacciones invertidas, objetivos suaves a cuatro niveles jerarquicos de EC, y un presupuesto temporal estricto (540 s) que garantiza que la inferencia no exceda el limite de evaluacion aunque el hardware sea lento. El repositorio ocupa 1,8 GB y las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: 9 MLP (8192/10240/6144 → 1536 → 768), 8 encoders duales reaccion-EC, 1 BERT rxnfp (12 capas, 256) fine-tuneado |
| Parametros totales | no disponible (repo de 1,8 GB; pesos residentes en memoria ~2,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT rxnfp de 12 capas; limite de tokens no especificado en la model card) |
| Tipos de cuantizacion | no disponible (los indices kNN se mantienen en float16 en memoria) |
| Idiomas soportados | no disponible (la tarea es quimica, no linguistica) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`bert_encoder.onnx`) para el encoder BERT; pesos propios en formato no especificado (config.json por grupo); requiere numpy, pandas, pyarrow, RDKit y drfp |

## Arquitectura y entrenamiento

El sistema se organiza en cinco grupos de redes. Tres clasificadores MLP operan sobre bloques Morgan direccionales (8.192 entradas), Morgan mas DRFP (10.240 entradas) y pares de atomos (6.144 entradas), cada uno con cabeza de cuatro niveles EC (L4, L3, L2, L1). Un cuarto grupo es un BERT rxnfp preentrenado (Schwaller et al., Nat. Mach. Intell. 2021, licencia MIT) fine-tuneado para prediccion de EC, exportado a ONNX Runtime y validado contra el modelo en GPU con 16/16 top-1 y probabilidades dentro de 1e-4. El quinto grupo son ocho encoders duales que proyectan la reaccion a un espacio de 256 dimensiones y comparan por similitud coseno con embeddings de EC construidos como suma de prefijos aprendidos L1-L4.

El preprocesado normaliza cada molecula con `Uncharger` de RDKit, elimina estereoquimica y descarta `[H+]`; las cadenas de reaccion no se alteran. Los clasificadores se entrenan con objetivos suaves (1/n por EC registrado) en los cuatro niveles, aumento por reaccion invertida y 20 epocas. Cada miembro mezcla 0,6 red mas 0,4 kNN (k=10) en su espacio de 768 dimensiones. Los encoders duales usan temperatura aprendida sobre similitud coseno, label smoothing 0,1 y mezcla 0,85 red mas 0,15 kNN (k=5). El BERT se entrena con objetivos suaves en los cuatro niveles, orden molecular aleatorio y reacciones invertidas, y mezcla 0,6 red mas 0,4 kNN sobre el vector [CLS].

La puntuacion final es `s5 = 0,6·s_classifiers + 0,4·s_dual`, luego `s = 0,65·s5 + 0,35·s_BERT`, y finalmente `score = log s + 0,25·log p_L3`. El presupuesto temporal aplica primero el ensemble de fingerprints a todas las entradas y luego el BERT a las reacciones mas cortas primero hasta los 540 s; las reacciones no alcanzadas conservan la prediccion del ensemble. El diseno de encoder dual sigue el metodo descrito en el README de la entrada de poketwouser, reimplementado sin sus redes de grafos. Solo se uso el split publico de entrenamiento y el vocabulario EC de ExPASy ENZYME release 02-Sep-2026.

## Capacidades

- Prediccion de un numero EC por reaccion SMILES, con jerarquia completa L1-L4.
- Clasificacion multi-nivel con probabilidades calibradas mediante objetivos suaves.
- Recuperacion por similitud (kNN) en espacios de embedding de 768 y 256 dimensiones.
- Inferencia exclusiva en CPU, sin GPU requerida.
- Procesamiento por lotes desde parquet a JSONL via `predict.py`.
- Tolerancia a reacciones invertidas gracias al aumento de datos durante el entrenamiento.
- Manejo de EC raros mediante el termino de subclase padre (p_L3) y el dropout aleatorio del termino L4 en los encoders duales.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un clasificador especializado.

## Casos de uso

- Anotacion funcional de enzimas en pipelines de genomica: dada una reaccion candidata, el sistema asigna un EC y permite priorizar candidatos antes de validacion experimental, con inferencia en CPU que no requiere aprovisionar GPU.
- Curación de bases de datos metabolicas: clasificar reacciones nuevas o no anotadas en bases como MetaCyc o Rhea para detectar entradas con EC ausente o inconsistente.
- Construccion de modelos metabolicos a escala de genoma: asignar EC a reacciones reconstruidas para habilitar el mapeo a enzimas y la simulacion de flujos.
- Filtrado en cribado de enzimas: descartar rapidamente reacciones con EC incompatible con la familia enzimatica de interes antes de pruebas de laboratorio.
- Deteccion de fuga de informacion en benchmarks quimicos: el propio diseno `leak-curber` y la validacion con holdout sin lados compartidos sirven como referencia metodologica para evaluar modelos de prediccion de EC.
- Docencia y prototipado en bioinformatica: el sistema se ejecuta en CPU con dependencias minimas (numpy, pandas, pyarrow, RDKit, drfp), lo que facilita su uso en entornos sin aceleradores.
- Integracion en pipelines de CI para validacion de datasets: comprobar la coherencia EC de reacciones anotadas y marcar discrepancias de forma automatizada.

## Benchmarks y rendimiento

Resultados de validacion local del autor sobre un holdout que imita el split con curacion de fuga (15% de reacciones sin lados compartidos con el 85% restante), expresados como precision top-1 por nivel EC:

| Metodo | L4 | L3 | L2 | L1 |
|---|---|---|---|---|
| Clasificador Morgan (receta v3) | 0,565 | 0,805 | 0,848 | 0,904 |
| Morgan+DRFP con termino L3 | 0,571 | 0,820 | 0,862 | 0,905 |
| Encoder dual | 0,558 | 0,805 | 0,844 | 0,893 |
| Mezcla v4 (Morgan + DRFP, 2 duales) | 0,587 | 0,823 | 0,863 | 0,911 |
| Clasificador de pares de atomos solo | 0,551 | 0,797 | 0,838 | 0,891 |
| Mezcla v5 (+ pares de atomos, 4 duales) | 0,596 | 0,824 | 0,861 | 0,909 |
| BERT solo (red + kNN) | 0,574 | 0,829 | 0,868 | 0,919 |
| Mezcla v6 (v5 + BERT, peso 0,35) | 0,604 | 0,834 | 0,869 | 0,918 |

En el leaderboard publico, v4 obtuvo 0,603 y v5 0,612 en L4. No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con modelos externos.

## Requisitos de hardware

- Inferencia exclusiva en CPU; no se requiere GPU.
- Pesos residentes en memoria cercanos a 2,4 GB (los indices kNN se mantienen en float16).
- Repositorio de 1,8 GB en disco.
- Memoria RAM estimada: no disponible de forma explicita; por los pesos residentes, un minimo practico de 4 GB es razonable, aunque no confirmado en la model card.
- GPUs recomendadas: no aplica; el autor entreno el BERT en una GPU de Kaggle, pero la inferencia es CPU-only.
- Cabe en cualquier maquina consumer con CPU moderna; no se especifican requisitos de núcleos.
- Opciones de despliegue: script `predict.py` con entrada parquet y salida JSONL; ONNX Runtime para el encoder BERT; el resto con numpy y RDKit.
- Latencia y throughput: no disponibles; el sistema impone un presupuesto de 540 s para el BERT, tras el cual las reacciones restantes usan solo el ensemble de fingerprints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-retrieval-v6 | no disponible (ensemble de 18 redes + BERT) | no disponible | Ensemble de fingerprints + BERT rxnfp + encoders duales | CC BY 4.0 | HuggingFace |
| Entrada de poketwouser (metodo referenciado) | no disponible | no disponible | Encoders duales con redes de grafos | no disponible | Leaderboard |
| rxnfp BERT (Schwaller et al., 2021) | BERT de 12 capas, 256 | no disponible | BERT preentrenado en reacciones | MIT | Publico |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Predice un unico EC por reaccion; no modela reacciones con multiples enzimas o promiscuidad catalitica.
- El rendimiento L4 (0,604 en holdout) implica que aproximadamente el 40% de las predicciones de clase completa son incorrectas; debe usarse con validacion posterior.
- El entrenamiento uso exclusivamente el split publico; el comportamiento fuera de la distribucion de ese corpus no esta caracterizado.
- La validacion local imita el split con curacion de fuga, pero no sustituye a una evaluacion independiente en datos reales.
- Dependencia de la version exacta de RDKit usada en entrenamiento; cambios de version pueden alterar los fingerprints y degradar la prediccion.
- El presupuesto temporal de 540 s puede dejar reacciones sin pasar por el BERT en maquinas lentas, reduciendo la precision de forma no determinista segun el hardware.
- La normalizacion descarta estereoquimica, lo que puede perder informacion relevante en reacciones estereoespecificas.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no se especifican garantias ni soporte.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion externa por terceros.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rishithakanugula26/enzyme-retrieval-v6
- Paper de rxnfp BERT (Schwaller et al., Nat. Mach. Intell. 2021): no disponible como URL en la informacion proporcionada
- Paper de DRFP (Probst et al., 2022): no disponible como URL en la informacion proporcionada
- ExPASy ENZYME (release 02-Sep-2026, SIB, CC BY 4.0): no disponible como URL en la informacion proporcionada
- README de la entrada de poketwouser en el leaderboard: no disponible como URL en la informacion proporcionada
