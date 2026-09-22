# ishaanamahajan/hw2-automl-3d-print-long-print

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un clasificador tabular binario generado con AutoGluon y publicado por el usuario ishaanamahajan. El artefacto resuelve una tarea muy concreta: predecir la etiqueta `long_print` a partir de cinco variables de un trabajo de impresion 3D, con valor `0` cuando la estimacion del slicer es inferior a seis horas y `1` cuando es igual o superior a ese umbral. Se trata, por tanto, de un ejemplo academico de AutoML aplicado a un dataset tabular pequeno, no de un modelo fundacional.

El entrenamiento parte del dataset `yennik16/3d-print-jobs-tabular` (CC BY 4.0, revision `4bf2b921d7d8e77bf43866fd2897efc9a702158a`), con 321 filas de entrenamiento, 4 de validacion y 5 de prueba. De las 321 filas de train, solo 21 son empleos originales y las 300 restantes son aumentadas. La busqueda de modelos duro 22,93 segundos dentro de un presupuesto de 300 segundos y exploro trece configuraciones de LightGBM, CatBoost, XGBoost, random forest, extra trees y k-vecinos mas cercanos.

Su relevancia es limitada y fundamentalmente pedagogica: sirve como plantilla reproducible de un flujo AutoGluon para clasificacion tabular, y como recordatorio de los peligros de reportar metricas perfectas sobre un conjunto de test de cinco ejemplos. El propio autor documenta ese caveat en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: ensemble de modelos tabulares clasicos (no es una red neuronal ni un transformer). Ganador declarado: `WeightedEnsemble_L2`; el JSON de componentes solo lista `ExtraTrees` con peso 1.0 |
| Parametros totales | no disponible (los modelos de arboles no se miden en parametros; no se publica numero de nodos ni tamano de artefacto, repo de 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada tabular de 5 caracteristicas por fila |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (entrada exclusivamente numerica y categorica); la model card no declara idiomas |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible como "pesos"; el artefacto es un predictor serializado de AutoGluon cargable con `TabularPredictor.load(local_path)` |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Libreria | autogluon (autogluon.tabular 1.6.3) |
| Tarea (pipeline) | tabular-classification |
| Variable objetivo | `long_print` (binaria: 0 = menos de 6 h, 1 = 6 h o mas) |
| Caracteristicas de entrada | `filament_g` (g), `infill_pct` (%), `layer_height_mm` (mm), `nozzle_mm` (mm), `use_category` (categorica) |
| Columnas excluidas | las dos columnas de tiempo de impresion (definen el objetivo), IDs y metadatos de procedencia |
| Dataset de origen | `yennik16/3d-print-jobs-tabular`, revision `4bf2b921d7d8e77bf43866fd2897efc9a702158a` |
| Tamano de splits | train 321 (21 originales + 300 aumentadas), validacion 4, test 5 |
| Presupuesto de busqueda | 300 s (tiempo real empleado: 22,93 s) |
| Configuraciones exploradas | 13 (LightGBM, CatBoost, XGBoost, random forest, extra trees, k-NN, mas ensemble ponderado) |
| Criterio de seleccion | balanced accuracy de validacion |
| Ajustes del ensemble | `ensemble_size`: 25, `subsample_size`: 1000000 |
| Semilla | Python/NumPy: 24679; `random_state` de ExtraTrees: 0 |
| Artefactos auxiliares | `search_space.json`, `validation_leaderboard.csv` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay una arquitectura de red neuronal. El predictor es un `TabularPredictor` de AutoGluon que, tras preprocesar las cinco caracteristicas (codificacion categorica y eliminacion de caracteristicas constantes ajustadas sobre el conjunto de entrenamiento), ajusta un espacio de busqueda de trece configuraciones pertenecientes a seis familias de modelos: gradient boosting (LightGBM, CatBoost, XGBoost), bosques (random forest, extra trees) y k-NN, ademas de un ensemble ponderado construido a partir de ellos. La seleccion se hace maximizando balanced accuracy en validacion. El ganador registrado es `WeightedEnsemble_L2`, aunque el bloque JSON de componentes incluido en la model card solo detalla `ExtraTrees` (`n_estimators` 300, `max_leaf_nodes` 15000, `bootstrap` true, `n_jobs` -1) con peso 1.0 en el grupo `S1F1`; no se documentan los demas componentes ni sus pesos.

Los datos de entrenamiento son extremadamente reducidos: 21 empleos de impresion originales mas 300 filas aumentadas sinteticamente. La validacion (4 filas) y el test (5 filas) contienen unicamente originales y los identificadores de trabajo padre son disjuntos entre splits, lo que evita fuga directa de informacion, pero deja estimaciones de rendimiento con muy poca potencia estadistica. No se aplico RLHF, DPO ni ninguna tecnica de alineacion, algo que no tiene sentido en este dominio. El unico elemento de proceso reseñable es la reproducibilidad declarada: semilla 24679, entorno Linux x86_64, Python 3.13.15 y versiones fijadas de `torch` (2.11.0+cpu), `transformers` (5.16.1), `datasets` (4.8.5), `scikit-learn` (1.6.1), `numpy` (2.1.3) y `pandas` (2.2.3), con la advertencia de que los empates en validacion pueden depender de la maquina. La model card declara ademas que OpenAI Codex asistio en la estructura del notebook, el codigo y la documentacion.

## Capacidades

- Clasificacion binaria tabular: dado un vector de cinco caracteristicas (`filament_g`, `infill_pct`, `layer_height_mm`, `nozzle_mm`, `use_category`), devuelve la probabilidad o la etiqueta de `long_print`.
- Inferencia por lotes sobre un `DataFrame` de pandas mediante `predict(dataframe)`.
- Aplicacion automatica en inferencia de las mismas transformaciones ajustadas en entrenamiento (codificacion categorica y eliminacion de caracteristicas constantes).
- Interpretabilidad potencial mediante los modelos de arboles subyacentes de AutoGluon (importancias de caracteristicas), aunque no se publican resultados de importancia en la informacion disponible.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio ni modo "thinking".
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: la unica variable no numerica es una categorica (`use_category`).
- Rendimiento predictivo no reproducible mas alla del entorno declarado: no se incluye un benchmark externo ni validacion cruzada.

## Casos de uso

- Clasificacion de trabajos de impresion 3D en un slicer o gestor de colas: el modelo se invoca antes de lanzar el trabajo con los parametros del perfil de impresion y devuelve si superara las seis horas, lo que permite priorizar la cola o avisar al usuario. Es adecuado porque la entrada son exactamente los parametros que el slicer ya conoce.
- Estimacion de ocupacion de impresoras en un taller o makerspace: agrupando predicciones por franja horaria se puede planificar que maquina queda libre antes del cierre, siempre que se acepte el margen de error de la estimacion del slicer.
- Etiquetado previo de un dataset historico de trabajos: usar el predictor como preanotador para revisar manualmente los casos dudosos, aprovechando que expone probabilidades (si se consultan con `predict_proba`).
- Material didactico de AutoML: el repositorio sirve como ejemplo completo y reproducible de un flujo AutoGluon (busqueda con presupuesto, leaderboard, ensemble, serializacion y carga) en un curso o taller.
- Prueba de integracion de artefactos AutoGluon en un pipeline de CI: descargar con `snapshot_download`, cargar con `TabularPredictor.load` y verificar que las predicciones coinciden con las del run original, tal como declara el autor.
- Filtro de coste previo a simulaciones caras: descartar los trabajos claramente cortos antes de ejecutar una simulacion de tiempo de impresion mas costosa.
- Prototipo de estimador de duracion en una aplicacion de gestion de granja de impresoras: como primer modelo base antes de sustituirlo por uno entrenado con datos propios y mucho mas volumen.

Ninguno de estos casos deberia llevarse a produccion con los datos y el tamano de test actuales sin reentrenar con un dataset propio y representativo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test (5 filas). Las puntuaciones son fracciones.

| Metrica | Valor |
|---|---|
| Accuracy | 1.0000 |
| Balanced accuracy | 1.0000 |
| F1 | 1.0000 |
| ROC AUC | 1.0000 |
| Tamano de test | 5 |
| Baseline de mayoria (accuracy) | 0.6000 |
| Intervalo de confianza aproximado al 95 % (Wilson) para accuracy | 0.566 - 1.000 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las metricas anteriores no son interpretables como rendimiento real: con solo cinco ejemplos, el intervalo de Wilson abarca desde 0,566 hasta 1,000 y no cubre cambios de distribucion. Tampoco se publica el leaderboard de validacion en la informacion proporcionada (solo se referencia el fichero `validation_leaderboard.csv`).

## Requisitos de hardware

- VRAM: no aplica. La busqueda y la inferencia se ejecutaron en CPU (`torch 2.11.0+cpu`, plataforma `Linux-6.6.122+-x86_64`).
- GPU recomendadas: ninguna. No se requiere GPU ni para entrenar ni para inferir; los modelos de arboles y k-NN de AutoGluon no usan aceleracion por GPU en esta configuracion.
- Cabe en cualquier equipo: al tratarse de un dataset de 321 filas y modelos de arboles de pequeno tamano, es viable en un portatil convencional, en un contenedor sin GPU o incluso en una maquina virtual modesta.
- RAM: no disponible de forma explicita; por el tamano del dataset y de los artefactos (repo de 0.0 GB) el consumo es bajo.
- Despliegue: `TabularPredictor.load(local_path).predict(dataframe)` dentro del ecosistema AutoGluon. No se documentan exportaciones a ONNX, a otros formatos ni servidores de inferencia (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo de busqueda de hiperparametros (22,93 s con un presupuesto de 300 s), no la latencia de inferencia.
- Advertencia de seguridad del autor: cargar unicamente modelos serializados de confianza.

## Comparativa con modelos similares

No hay datos de modelos comparables en la informacion disponible. Como referencia interna, el propio proceso de AutoML compitio trece configuraciones de seis familias (LightGBM, CatBoost, XGBoost, random forest, extra trees y k-NN) mas un ensemble ponderado, y selecciono un ensemble por balanced accuracy de validacion; sin embargo, no se publican las puntuaciones del leaderboard, por lo que no es posible comparar numericamente las alternativas.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightGBM (dentro del espacio de busqueda) | no disponible | no aplica | no disponible | no disponible | candidata evaluada, no seleccionada |
| CatBoost (dentro del espacio de busqueda) | no disponible | no aplica | no disponible | no disponible | candidata evaluada, no seleccionada |
| XGBoost (dentro del espacio de busqueda) | no disponible | no aplica | no disponible | no disponible | candidata evaluada, no seleccionada |
| Otros clasificadores tabulares externos | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgo de muestra minima: los 30 empleos originales reflejan las impresoras y los habitos de laminado de una sola persona. No hay garantia de que las relaciones aprendidas se transfieran a otros equipos, materiales o perfiles de slicer.
- La aumentacion de datos no anade empleos independientes; solo genera variaciones de los 21 originales de entrenamiento, por lo que no amplia la diversidad real del dominio.
- Test de 5 filas y validacion de 4 filas: las estimaciones son inestables. Las metricas perfectas reportadas son compatibles con un intervalo de confianza muy amplio (0,566-1,000 en accuracy).
- No se evalua el desplazamiento de distribucion: el intervalo reportado no cubre cambios en la poblacion de trabajos.
- Riesgo de prediccion erronea por la propia naturaleza del objetivo: la estimacion del slicer puede diferir de la duracion real de impresion. Un error del modelo puede llevar a una planificacion equivocada de la cola de trabajos o del uso de maquinas.
- Sin informacion sobre sesgos demograficos: no se usan atributos personales, segun la model card.
- Licencia CC BY 4.0: permite uso comercial y modificacion con atribucion; es obligatorio conservar la atribucion al origen. El dataset de origen (`yennik16/3d-print-jobs-tabular`) tambien es CC BY 4.0 y requiere atribucion.
- Reproducibilidad condicionada: los empates en la seleccion por balanced accuracy pueden depender del hardware y de los tiempos de ejecucion.
- Seguridad: el artefacto es un modelo serializado; el autor advierte de cargar unicamente modelos de confianza, ya que la deserializacion puede ejecutar codigo.
- Sin mantenimiento ni traccion: 0 descargas y 0 likes en el momento de la consulta, con fecha de actualizacion 2026-09-21. No hay garantia de soporte.
- Uso en produccion no recomendado: es un ejercicio academico; para cualquier despliegue real hay que reentrenar con datos propios, validacion cruzada y un conjunto de prueba de tamano suficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishaanamahajan/hw2-automl-3d-print-long-print
- Dataset de origen: https://huggingface.co/datasets/yennik16/3d-print-jobs-tabular
- AutoGluon (libreria): https://auto.gluon.ai/
- Documentacion de AutoGluon Tabular: https://auto.gluon.ai/stable/tutorials/tabular/index.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web: los resultados devueltos no guardan relacion con este modelo y se han descartado por no ser fuentes validas.
