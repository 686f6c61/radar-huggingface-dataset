# Marimar2006/defiende-el-servidor

## Resumen

Defiende el servidor v2 (E6_hgb_complejo) es un clasificador binario tabular que etiqueta conexiones de red como normales (0) o ataque (1). Lo desarrolla el usuario Marimar2006 en el marco de un proyecto académico de MLOps de la Universidad Externado de Colombia (2026-II), y se publica en HuggingFace como un artefacto de scikit-learn serializado en formato skops, complementado con código en GitHub, datos versionados con DVC y trazas de MLflow.

El modelo no es un modelo de lenguaje ni una red neuronal: es un ensemble de gradient boosting sobre árboles de decisión (HistGradientBoosting de scikit-learn, hasta 500 iteraciones, 63 hojas por árbol y tasa de aprendizaje 0.05), entrenado sobre las particiones publicadas del dataset UNSW-NB15 con 42 variables de entrada por conexión. Su objetivo declarado es priorizar qué conexiones merecen una alerta para un equipo de seguridad, maximizando el recall de ataques con una tasa de falsos positivos objetivo del 5 % en validación; el umbral de decisión se fija en 0,667379 sobre `predict_proba[:, 1]`.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un ejercicio de versionado, trazabilidad y reproducibilidad (hashes SHA-256 de datos y modelo, particiones agrupadas, evaluación única en test), no de un sistema validado para operación en una red real. La degradación medida entre validación (FPR 0,0499) y test (FPR 0,1816) por deriva en la distribución del tráfico normal es, en sí misma, el resultado más informativo del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (scikit-learn HistGradientBoosting), empaquetado en un pipeline con `log1p` + StandardScaler (numéricas) y OneHotEncoder (categóricas) |
| Parametros totales | no disponible (ensemble de árboles con hasta 500 iteraciones y 63 hojas por árbol; el autor no publica recuento de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 42 variables por conexión; no existe ventana de contexto) |
| Tipos de cuantizacion | no disponible; se distribuye el artefacto `model/model.skops` sin cuantización declarada |
| Idiomas soportados | no disponible (modelo tabular; no procesa texto ni lenguaje natural) |
| Licencia | other (hereda las condiciones de uso académico del dataset UNSW-NB15) |
| Formato de pesos | skops (`model/model.skops`) + `config.json`, cargado con `mlflow.sklearn.load_model` |
| Tarea | Clasificación binaria tabular (normal = 0 / ataque = 1) |
| Variables de entrada | 42 (se excluyen `id`, `label` y `attack_cat`) |
| Umbral de decisión | 0,667379 (`y_pred = 1` si `predict_proba[:, 1] >= umbral`) |
| SHA-256 del modelo | `24b3db2a677a40333f04ae24a3368dabea72ed7f963954301f1c749f42132673` |
| SHA-256 de la carpeta `model/` | `1bddcd440fd3ff7e6890e935511d2005f839399d4491c4bf79b4249633111561` |
| Version evaluada en test | `61da5e88c5e61cbd5e334f022321bd4e5a3d7e61` (tag `v2`) |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Fecha de creacion / actualizacion | 2026-10-16 / 2026-10-16 |

## Arquitectura y entrenamiento

El estimador es un `HistGradientBoosting` de scikit-learn, es decir, un gradient boosting por incremento de gradiente sobre árboles de decisión con "binning" por histogramas, con un máximo de 500 iteraciones, 63 hojas por árbol y tasa de aprendizaje 0,05. El pipeline completo incluye el preprocesamiento: transformación `log1p` seguida de `StandardScaler` sobre las variables numéricas, y `OneHotEncoder` sobre `proto`, `service` y `state`, agrupando las categorías con frecuencia inferior al 0,1 % y las inéditas en la categoría "infrecuente". Todo el preprocesamiento se ajusta únicamente con el conjunto de entrenamiento, sin fuga de información desde validación o test.

Los datos son las particiones publicadas de UNSW-NB15: `UNSW_NB15_training-set.csv` (175.341 filas, SHA-256 `bec7dd5e...0648fa`) y `UNSW_NB15_testing-set.csv` (82.332 filas, SHA-256 `734fe664...c0a559`). El entrenamiento (140.779 filas) y la validación (34.562 filas) se obtienen exclusivamente del archivo de entrenamiento mediante `StratifiedGroupKFold` agrupado por filas de variables idénticas, de modo que ningún grupo repetido queda a ambos lados de la partición, con semilla 42. La política de umbral se elige en validación para una tasa de falsos positivos inferior o igual al 5 %. La v2 cambia de familia (de modelo lineal a árboles) y de hiperparámetros respecto a la versión anterior, apoyándose en los experimentos E3 (+4,2 puntos de recall frente a E1 con la misma FPR) y E6 (+0,5 puntos adicionales). No se documenta uso de RLHF, DPO ni ninguna técnica de este tipo, algo que no aplica a un clasificador tabular supervisado.

## Capacidades

- Clasificación binaria de conexiones de red: devuelve probabilidad de ataque mediante `predict_proba[:, 1]` y etiqueta final aplicando el umbral 0,667379.
- Detección de intrusiones sobre tráfico representado como flujo/tabla (NetFlow u similar) con las 42 variables de UNSW-NB15.
- Calibración de umbral orientada a una tasa de falsos positivos objetivo, en lugar de usar el umbral por defecto de 0,5.
- Manejo de variables categóricas de red (`proto`, `service`, `state`) con agrupación de categorías raras o inéditas.
- Capacidad de ordenación bien preservada entre dominios: ROC-AUC 0,9932 en validación y 0,9845 en test, pese a la deriva del tráfico normal.
- Soporte de tool calling / function calling: no disponible (no aplica, no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no aplica (no procesa lenguaje natural).
- Capacidades especiales: no dispone de modo "thinking", visión, audio ni generación de texto. Su única salida es una probabilidad y una etiqueta binaria.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puntúa cada conexión registrada y permite ordenar la cola de alertas por probabilidad, de forma que los analistas atiendan primero las conexiones con score superior a 0,667379. Es adecuado porque su curva ROC-AUC (0,9845 en test) mantiene una buena capacidad de ordenación incluso bajo deriva.
- Pre-filtrado de registros de flujo antes de un IDS más costoso: al ser un estimador tabular ligero, puede ejecutarse sobre lotes de NetFlow exportados por conmutadores o cortafuegos y descartar el tráfico con score bajo antes de pasarlo a un motor de inspección profunda.
- Enriquecimiento de eventos en un SIEM: incorporar el score del modelo como campo adicional en los eventos permite construir reglas de correlación (por ejemplo, elevar la severidad cuando una misma IP acumula varias conexiones con score alto).
- Prototipo docente y reproducible de MLOps: el repositorio aporta particiones con semilla fija, hashes de datos y modelo, trazas de MLflow (run `b1caa19139d54c2ea08d8984bcbb0399`) y versionado con DVC, por lo que sirve como plantilla para enseñar buenas prácticas de trazabilidad.
- Reentrenamiento con tráfico propio de una organización: dado que el umbral se calibró con el tráfico normal de validación de UNSW-NB15, el flujo lógico es reajustar el umbral (y idealmente reentrenar) con tráfico normal de la red destino, manteniendo el resto del pipeline.
- Comparación de arquitecturas en investigación sobre UNSW-NB15: la propia model card documenta el salto de un modelo lineal (v1) a árboles (v2) con la misma FPR, lo que permite reproducir el experimento y usarlo como línea base.
- Detección de máquinas potencialmente comprometidas por artefactos de TTL: dado que el TTL identifica a las máquinas atacantes en el laboratorio, el modelo puede emplearse en ejercicios controlados para estudiar el impacto de este tipo de sesgo antes de desplegar nada.
- Integración vía CLI en canalizaciones por lotes: `python -m src.predict --model hf://Marimar2006/defiende-el-servidor@<SHA> --input ... --output ...` permite encadenar la puntuación en un proceso programado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (clase positiva = ataque):

| Conjunto | Filas | Recall ataque | Precisión ataque | FPR | Macro-F1 | ROC-AUC |
|---|---:|---:|---:|---:|---:|---:|
| Validación (umbral 0,667379) | 34.562 | 0,9522 | 0,9759 | 0,0499 | 0,9452 | 0,9932 |
| Test completo (umbral 0,667379) | 82.332 | 0,9688 | 0,8673 | 0,1816 | 0,8984 | 0,9845 |
| Test sin las 8.541 filas presentes también en entrenamiento | no disponible | 0,9634 | no disponible | 0,1773 | no disponible | no disponible |

Matrices de confusión (filas = real, columnas = predicho):

| Conjunto | Normal → [TN, FP] | Ataque → [FN, TP] |
|---|---|---|
| Validación | [10538, 553] | [1121, 22350] |
| Test | [30280, 6720] | [1415, 43917] |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a esta categoría de modelo, y la información disponible no incluye comparaciones con terceros.

## Requisitos de hardware

- VRAM: no aplica. Es un estimador de scikit-learn que se ejecuta en CPU; no requiere GPU ni backend CUDA.
- GPU recomendadas: ninguna. `HistGradientBoosting` de scikit-learn no acelera en GPU de forma nativa.
- Compatibilidad con GPU de consumo: no aplica; el modelo cabe y se ejecuta en cualquier CPU razonablemente moderna, incluidos portátiles.
- RAM: no disponible de forma explícita. Como referencia, el repositorio completo en HuggingFace se reporta como 0.0 GB, por lo que el artefacto serializado es de tamaño reducido.
- Opciones de despliegue: MLflow (`mlflow.sklearn.load_model`), skops, joblib, o cualquier servicio que cargue un estimador de scikit-learn (FastAPI, Flask, un job programado). El autor ofrece además una CLI (`python -m src.predict`).
- Opciones no aplicables: vLLM, llama.cpp, Ollama, TGI y similares, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del número de filas a puntuar, del número de árboles efectivos y del hardware; pueden estimarse empíricamente cargando el modelo y midiendo sobre lotes del conjunto de test.
- Requisitos de software: `pip install -r requirements.txt huggingface_hub`; se necesita además acceso al repositorio de código para la CLI.

## Comparativa con modelos similares

La información disponible no incluye comparaciones publicadas con modelos de terceros entrenados sobre UNSW-NB15, por lo que no es posible construir una comparativa con cifras verificables. La única comparación documentada por el autor es interna, entre la versión anterior (familia lineal, E1) y esta versión (árboles, E6):

| Version | Familia | Recall ataque | Precisión ataque | FPR | Macro-F1 | ROC-AUC | Umbral |
|---|---|---|---:|---:|---:|---:|---:|---:|
| v2 · E6_hgb_complejo | Árboles (HistGradientBoosting) | 0,9522 (val) / 0,9688 (test) | 0,9759 (val) / 0,8673 (test) | 0,0499 (val) / 0,1816 (test) | 0,9452 (val) / 0,8984 (test) | 0,9932 (val) / 0,9845 (test) | 0,667379 |
| E3 (experimento intermedio) | Árboles | no disponible (se cita +4,2 puntos de recall frente a E1 con la misma FPR) | no disponible | no disponible | no disponible | no disponible | no disponible |
| v1 · familia lineal | Modelo lineal | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos publicados sobre UNSW-NB15 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dataset sintético de laboratorio de 2015: el rendimiento medido no demuestra eficacia sobre una red actual ni sobre tráfico real de producción.
- Prevalencia de ataque irreal: 68 % en entrenamiento y aproximadamente 55 % en test. En una red donde el ataque es raro, la precisión caería de forma drástica aunque el recall se mantuviera, por el efecto de la prevalencia sobre el valor predictivo positivo.
- Deriva del tráfico normal entre particiones: la tasa de falsos positivos sube del 4,99 % en validación al 18,16 % en test, atribuida a que el 41 % del tráfico normal de test presenta `sttl=254` frente al 20 % en entrenamiento. El umbral debe recalibrarse con tráfico normal de la red donde se vaya a usar.
- Artefactos del laboratorio: el TTL identifica las máquinas atacantes, por lo que el modelo puede estar apoyándose en una señal que no existe en producción.
- Duplicados y etiquetas contradictorias: el 42 % de las filas de entrenamiento están repetidas y existen 229 grupos de entradas idénticas con etiqueta contradictoria, lo que limita el techo alcanzable y complica la interpretación de las métricas.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero sí existe un riesgo equivalente de clasificación errónea (falsos positivos y falsos negativos) cuya magnitud depende del dominio de despliegue.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricción de licencia: la licencia es "other" y el modelo hereda las condiciones de uso académico del dataset UNSW-NB15. Antes de cualquier uso comercial es necesario revisar los términos del dataset original con el autor; no se ofrece una licencia permisiva explícita.
- Estado del artefacto: 0 descargas y 0 likes en HuggingFace, sin validación por parte de terceros. Además, la revisión publicada solo actualiza la documentación, siendo los archivos del modelo idénticos a los de la revisión evaluada en test.
- Trazabilidad exigible: para reproducir los resultados hay que fijar la revisión por SHA completo; cargar una revisión distinta puede devolver un modelo con otro umbral o con otro preprocesamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Marimar2006/defiende-el-servidor
- Repositorio de código (tag `v2`, commit de entrenamiento `80cdc9925e7af1d1c1aef0696b019995923ab0c5`): https://github.com/mjcastano29-tech/defiende-el-servidor
- Datos versionados con DVC (remoto): https://huggingface.co/datasets/Marimar2006/defiende-el-servidor-dvc
- Dataset UNSW-NB15 (página oficial): https://research.unsw.edu.au/projects/unsw-nb15-dataset
- Referencia del dataset: Moustafa, N. & Slay, J. (2015), *UNSW-NB15: a comprehensive data set for network intrusion detection systems*, MilCIS, IEEE.
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo en las consultas realizadas; los enlaces devueltos corresponden a directorios genéricos de modelos y a noticias no relacionadas.
