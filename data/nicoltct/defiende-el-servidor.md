# NicolTcT/defiende-el-servidor

## Resumen

Defiende el servidor · v2 (E4_hist_gb) es un clasificador binario de tráfico de red —normal (0) frente a ataque (1)— publicado por Nicol TcT (NicolTcT) como trabajo académico del curso MLOps 2026-II de la Universidad Externado de Colombia. No es un modelo de lenguaje: es un `sklearn.pipeline.Pipeline` serializado en `model.joblib` cuyo estimador final es un `HistGradientBoostingClassifier` (familia de árboles de decisión con boosting por gradiente), acompañado de un `config.json` con umbral, lista de variables de entrada y hashes de trazabilidad.

El problema que resuelve es la detección de intrusiones en datos tabulares: recibe las variables de una conexión tal y como las define el conjunto de datos UNSW-NB15 (Moustafa y Slay, 2015) y devuelve una puntuación de ataque que se binariza con un umbral fijado en 0,55. Su relevancia no es de rendimiento estado del arte, sino metodológica: demuestra el versionado y la recuperación completos de una solución de aprendizaje automático (código en Git, datos en DVC, experimentos en MLflow y modelo en esta revisión de Hugging Face) con hashes verificables y una decisión de umbral congelada antes de evaluar.

La revisión se creó el 24 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 1 «like», con un tamaño de repositorio de 0,0 GB. El propio autor advierte de que **no es un producto de seguridad** y de que el conjunto de datos es tráfico sintético de laboratorio de 2015: sirve como base docente, como referencia reproducible y como punto de partida, no como defensa desplegable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con preprocesamiento (imputación, codificación ordinal) y estimador `HistGradientBoostingClassifier` (gradient boosting sobre árboles de decisión con binning por histogramas) |
| Parámetros totales | No disponible como recuento exacto; el estimador se configura con `max_iter=300`, `max_leaf_nodes=63`, por lo que el número de árboles y nodos efectivos depende del ajuste sobre los datos |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (clasificación tabular sobre una fila de variables por conexión; no hay ventana de contexto) |
| Tipos de cuantización | No aplica / no disponible (modelo de árboles serializado en `joblib`; no se publican variantes cuantizadas) |
| Idiomas soportados | No aplica (no procesa lenguaje natural); no se declara ningún idioma en los metadatos de Hugging Face |
| Licencia | `other` (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | `model.joblib` (pipeline completo serializado con joblib), más `config.json` y `requirements.txt` |
| Hiperparámetros del estimador | `learning_rate=0.1`, `max_iter=300`, `max_leaf_nodes=63`, `l2_regularization=0.0`, `early_stopping=false` |
| Preprocesamiento | `numeric_transform=none`, `scale=false`, `categorical_encoding=ordinal` |
| Umbral de decisión | 0,55 (ataque si `score_attack >= 0.55`) |
| Tarea (pipeline tag) | `tabular-classification` |
| Variables de entrada | Lista declarada en `config.json`; se excluyen `label`, `attack_cat` e `id` |
| SHA-256 de `model.joblib` | `b3c55ced64ce60d2c75f2d0c5fddc3e0e306bea65cd8592c8dbee8806c4c9a8a` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingClassifier` de scikit-learn, es decir, un ensamblado de árboles de decisión entrenados secuencialmente para corregir el error residual mediante descenso de gradiente, con discretización previa de las variables numéricas en histogramas (de ahí el prefijo *hist*). Esta implementación gestiona valores ausentes de forma nativa y no requiere escalado, algo coherente con la configuración declarada (`scale=false`, `numeric_transform=none`). Las variables categóricas se codifican de forma ordinal dentro del pipeline, que se serializa completo: al cargar `model.joblib` se obtienen imputación, codificación y estimador en un único objeto.

Los datos proceden de UNSW-NB15 (Moustafa y Slay, 2015), usando una copia espejo fijada por commit con SHA-256 verificados. El entrenamiento emplea el 80 % de `UNSW_NB15_training-set.csv`, dividido por grupos de entradas idénticas con semilla 20261016; el 20 % restante se reserva para validación. Se excluyeron 940 filas con entradas idénticas y etiquetas contradictorias. La selección de modelo y umbral se hizo únicamente con validación (documentada en `configs/selection.yaml`): entre cuatro experimentos, HistGradientBoosting obtuvo el mejor macro-F1 y se eligió el umbral 0,55 por ser el de mayor macro-F1 con recall de ataque ≥ 0,95. Frente a la v1, esta revisión baja la tasa de falsos positivos del 17,0 % al 6,7 % a cambio de 1,5 puntos de recall. La evaluación final sobre el conjunto de test se congeló en el commit `e378e2005e499e5f48ec153c421c7982e49573cd` antes de ejecutarla. No se documenta calibración de probabilidades ni ajuste fino posterior.

## Capacidades

- Clasificación binaria tabular de conexiones de red: normal (0) frente a ataque (1), con puntuación continua y umbral configurable.
- Ingeniería de variables implícita en el pipeline (imputación y codificación ordinal), lo que permite invocar `predict_proba` directamente sobre un `DataFrame` con las columnas de UNSW-NB15.
- Reproducibilidad verificable: hashes SHA-256 del modelo y de los ficheros de datos, referencias de DVC, run de MLflow y commits de Git.
- Recuperación de una revisión concreta por identificador de revisión (`hf_hub_download(..., revision=REV)`), lo que habilita auditorías y despliegues anclados a una versión inmutable.
- Inferencia en CPU sin requisitos de GPU y con dependencias acotadas en `requirements.txt` (versiones concretas no disponibles en la información publicada).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular, no un modelo generativo.

## Casos de uso

- **Triaje de alertas en un SOC**: preclasificar flujos de red con un umbral conservador para priorizar la revisión humana. Con recall de ataque del 97,66 % en test, deja escapar pocos positivos, aunque el 24,36 % de falsos positivos implica carga de revisión manual elevada.
- **Base de referencia (baseline) para nuevos IDS**: usar las métricas de validación y test publicadas (macro-F1 0,9531 y 0,8726) como suelo contra el que medir modelos propios sobre UNSW-NB15, siempre con el mismo protocolo de partición.
- **Docencia y práctica de MLOps**: el repositorio encadena Git, DVC y MLflow con commits y hashes explícitos, de modo que un alumno puede reproducir el pipeline, sustituir el estimador y comparar contra `configs/selection.yaml`.
- **Pruebas de regresión de un sistema de detección**: fijar la revisión por SHA y ejecutar `src/predict.py --revision <SHA> --input X.csv --output Y.csv` en CI para detectar degradaciones cuando cambien dependencias o el código de preprocesado.
- **Análisis de deriva (drift)**: comparar la distribución de las puntuaciones del modelo sobre tráfico actual frente a la del conjunto de test; la brecha de falsos positivos entre validación (6,70 %) y test (24,36 %) es un caso documentado de cambio de distribución en variables como el estado de la conexión (INT, REQ, FIN).
- **Enriquecimiento de un pipeline NetFlow**: exportar las variables de UNSW-NB15 desde capturas propias, puntuar cada flujo y anexar la puntuación a un almacén de eventos para correlación posterior con otras fuentes.
- **Auditoría de decisiones de umbral**: reconstruir el compromiso recall/falsos positivos variando el umbral sobre `predict_proba`, usando la matriz de confusión publicada como referencia de partida.

## Benchmarks y rendimiento

Datos publicados por el autor, con umbral 0,55 y la revisión congelada `4ea2e9e7b2245d27a672e58b81d27574843615f7`. La validación usa 34 880 filas; el test, las 82 332 filas de `UNSW_NB15_testing-set.csv`.

| Métrica | Validación | Test |
|---|---|---|
| Recall de ataque | 97,12 % | 97,66 % |
| Precision de ataque | 96,69 % | 83,09 % |
| Tasa de falsos positivos | 6,70 % | 24,36 % |
| Macro-F1 | 0,9531 | 0,8726 |
| Accuracy | 95,85 % | No disponible |

Matriz de confusión en test (filas = real, columnas = predicho): normal → [27 988, 9 012]; ataque → [1 063, 44 269].

Matriz de confusión en validación (filas = real): normal → [10 794, 775]; ataque → [671, 22 640].

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea; no hay tablas de comparación con Random Forest, XGBoost u otros IDS en la información disponible).

## Requisitos de hardware

- VRAM: 0 GB. El modelo no usa GPU; es un ensemble de árboles ejecutado en CPU.
- RAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,0 GB, por lo que el pipeline y las dependencias de scikit-learn son el factor dominante, no el modelo.
- GPU recomendadas: no aplica. Funciona en cualquier CPU x86-64 o ARM con Python y las dependencias de `requirements.txt`.
- Cabe en hardware de consumidor: sí, en portátiles y equipos de escritorio sin acelerador; también en contenedores pequeños, funciones serverless y entornos de CI.
- Opciones de despliegue: carga directa con `joblib.load` y `predict_proba`; envoltorio CLI del propio repositorio (`src/predict.py`); servicio HTTP propio (FastAPI, Flask) alrededor del pipeline; no aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos generativos.
- Latencia y throughput: no disponibles en la información publicada. Solo se conocen los parámetros del estimador (300 iteraciones, hasta 63 hojas por árbol), que acotan el coste por fila pero no permiten cifrar tiempos sin medir.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiende el servidor v2 (esta revisión) | HistGradientBoosting sobre pipeline sklearn | Una fila de variables UNSW-NB15 por conexión | Validación: macro-F1 0,9531, FPR 6,70 %. Test: macro-F1 0,8726, FPR 24,36 % | `other` | Hugging Face, revisión con SHA |
| Defiende el servidor v1 (revisión anterior del mismo repositorio) | No disponible la familia exacta del estimador | Igual | FPR del 17,0 % y 1,5 puntos más de recall que la v2 (según el autor) | `other` | Historial de revisiones del repositorio |
| Otros tres experimentos del proyecto | No detallados en la información disponible | Igual | Peor macro-F1 que HistGradientBoosting según `configs/selection.yaml` | No disponible | Solo referenciados en el repositorio de código |
| IDS tabulares de la literatura sobre UNSW-NB15 (Random Forest, XGBoost, redes) | Varios | Igual | No disponible en la información proporcionada; no se han verificado cifras de terceros | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un producto de seguridad**: el autor lo declara explícitamente. No hay evidencia de eficacia en una red real y el conjunto de datos es tráfico sintético de laboratorio de 2015.
- **Brecha validación-test**: la tasa de falsos positivos pasa del 6,70 % al 24,36 % porque el tráfico normal del fichero de test difiere del de entrenamiento (más conexiones en estado INT y REQ, y conexiones FIN/sin servicio que el modelo confunde con Fuzzers). La validación se extrajo del mismo fichero que el entrenamiento y resultó optimista.
- **Fuga de datos parcial**: entrenamiento y test comparten aproximadamente un 10 % de entradas idénticas, y la validación comparte 1 739 filas con test. Las métricas están, por tanto, algo infladas.
- **Umbral elegido en validación**: las métricas de validación con ese umbral son optimistas por construcción; la evaluación de test se congeló antes de ejecutarse, lo que mitiga pero no elimina el sesgo de selección.
- **Puntuaciones no calibradas**: `predict_proba` no debe interpretarse como probabilidad real de ataque; úsese como puntuación de orden.
- **Dependencia fuerte del esquema de entrada**: el modelo espera exactamente las columnas de UNSW-NB15 declaradas en `config.json`. Cualquier captura real requiere un exportador que reproduzca esas variables; no se documenta ninguno.
- **Licencia `other` sin texto**: no se detallan condiciones de uso comercial, atribución ni redistribución. Antes de cualquier uso en producción hay que aclararlo con el autor.
- **Adopción nula y soporte limitado**: 0 descargas y 1 «like»; es un artefacto académico sin mantenimiento declarado ni issues atendidas conocidas.
- **Resultados de búsqueda web no relevantes**: las búsquedas realizadas no devolvieron documentación técnica, papers ni demos sobre este modelo; toda la información de esta ficha proviene de la model card y de los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicolTcT/defiende-el-servidor
- Repositorio de código (commit `0412c387fc1433f164876e00c743bdafaa1f221a`, tag `v2-code`): https://github.com/Nicol-Tatiana-Cerinza-Tejada/Defiende-el-servidor
- Conjunto de datos UNSW-NB15 (Moustafa y Slay, 2015): https://research.unsw.edu.au/projects/unsw-nb15-dataset
- Espejo de datos fijado por commit: https://raw.githubusercontent.com/Nir-J/ML-Projects/44bbd02b9e70f74dd915218d5eb702f125341ffc/UNSW-Network_Packet_Classification
- Referencia del conjunto de datos: Moustafa, N., & Slay, J. (2015). *UNSW-NB15: a comprehensive data set for network intrusion detection systems*. MilCIS 2015.
- No se encontraron papers, blogs, demos ni repositorios adicionales en la búsqueda web.
