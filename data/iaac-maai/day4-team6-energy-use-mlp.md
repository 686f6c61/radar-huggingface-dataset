# iaac-maai/day4-team6-energy-use-mlp

## Resumen

`iaac-maai/day4-team6-energy-use-mlp` es un perceptrón multicapa (MLP) muy pequeno, de 7.489 parametros, entrenado desde cero con PyTorch para regresion tabular. Su tarea es estimar el consumo energetico anual por metro cuadrado (site EUI, en kWh/m2 al ano) de edificios grandes de Seattle a partir de variables que un arquitecto conoce en una fase de estudio de viabilidad: uso principal, tipologia, barrio, ano de construccion, numero de plantas, superficie bruta, cuota de aparcamiento y coordenadas geograficas. Lo firma el equipo 6 del curso AI Methods I del master IAAC MaAI (curso 2026/27), formado por Chloe Hraibeh, Jeff El Khoury y Luca Obejdeanu.

El modelo resuelve un problema acotado y deliberadamente didactico: comparar una red neuronal con el random forest del equipo en el mismo conjunto de test. La conclusion que reportan los autores es que la red no supera a los arboles en una tabla de 2.000 filas, sino que empata (R2 de 0,382 frente a 0,387 en log10 del EUI, y MAE de 69 frente a 68 kWh/m2 al ano). No es, por tanto, una herramienta de produccion, sino una referencia reproducible de regresion tabular con un pipeline completo de preprocesado publicado junto a los pesos.

La relevancia practica es limitada pero clara para quien trabaja con datos energeticos de edificios: el repositorio incluye el `ColumnTransformer` de scikit-learn ajustado (`scaler.joblib`) y los pesos en `model.pt`, de modo que el modelo puede reproducirse de extremo a extremo con muy poco codigo y en CPU de portatil. El contexto de uso es Seattle en 2016 y edificios de mas de 20.000 pies cuadrados (unos 1.860 m2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: Linear 50 → 64, ReLU, Linear 64 → 64, ReLU, Linear 64 → 1 (con capas `Dropout(0.0)` conservadas para mantener la numeracion de pesos) |
| Parametros totales | 7.489, todos entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (regresion tabular; entrada fija de 11 columnas que se transforman en 50 features) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el artefacto es un `state_dict` de PyTorch en precision de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; las categorias de entrada estan en ingles) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (`state_dict` de PyTorch) y `scaler.joblib` (`ColumnTransformer` de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas densas con activacion ReLU y sin normalizacion intermedia: 50 entradas, dos capas ocultas de 64 neuronas y una salida escalar. Las 50 entradas provienen de 11 columnas originales: 8 variables numericas estandarizadas tras imputacion por mediana (ano de construccion, numero de plantas, numero de edificios, superficie bruta en m2, superficie por planta, cuota de aparcamiento, latitud y longitud) y 42 columnas one-hot correspondientes a las categorias de uso principal, tipologia de edificio y barrio. La salida es el log10 del site EUI, de modo que `10 ** output` devuelve kWh/m2 al ano.

El entrenamiento usa perdida MSE sobre el log10 del EUI, optimizador Adam con tasa de aprendizaje 0,001, lotes de 32, un maximo de 300 epocas y semilla 42. La regularizacion es exclusivamente early stopping: se detiene cuando la perdida de validacion no mejora en 30 epocas y restaura los mejores pesos. Los autores probaron tambien dropout de 0,3 con weight decay de 0,001 (R2 de validacion 0,387) y una red mas pequena de 16 neuronas por capa (0,385); el early stopping solo obtuvo el mejor resultado (0,396). El conjunto de datos es el Building Energy Benchmarking de Seattle de 2016, de dominio publico, con 3.211 edificios divididos en 2.054 de entrenamiento, 514 de validacion y 643 de test, con la misma particion (`test_size=0.2`, `random_state=42`) que el modelo del dia 2 para permitir la comparacion directa.

## Capacidades

- Regresion tabular supervisada: estima un unico escalar continuo (log10 del site EUI) a partir de 11 columnas estructuradas.
- Imputacion robusta de valores ausentes: los NaN se rellenan con la mediana aprendida en entrenamiento, y las categorias desconocidas se ignoran en el one-hot.
- Generalizacion dentro del dominio de Seattle 2016 para edificios no residenciales y multifamiliares de mas de 20.000 pies cuadrados.
- Integracion sencilla en pipelines de scikit-learn y pandas: el `ColumnTransformer` se serializa con joblib y se aplica antes de la inferencia.
- Inferencia en CPU: el tamano del modelo permite ejecutarlo en un portatil sin GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto; no es un modelo de lenguaje.

## Casos de uso

- Estimacion preliminar de viabilidad: un arquitecto introduce uso, barrio, ano, plantas y superficie de un anteproyecto y obtiene un orden de magnitud del consumo por m2 antes de encargar una simulacion energetica completa.
- Triaje de cartera de edificios: aplicar el modelo en lote sobre un inventario municipal o de un fondo inmobiliario para detectar que edificios se desvian mas de la media y merecen una auditoria detallada.
- Docencia de regresion tabular: el par `model.pt` + `scaler.joblib` sirve como ejemplo reproducible de pipeline completo (imputacion, escalado, one-hot, early stopping) en cursos de machine learning aplicado.
- Baseline interno para nuevos modelos: cualquier equipo que aborde el mismo dataset de Seattle puede usar este MLP como referencia minima antes de probar gradient boosting o redes mas grandes.
- Analisis de sensibilidad de variables: variando una columna (por ejemplo, ano de construccion o cuota de aparcamiento) y manteniendo el resto fijo, se observa como cambia la prediccion, util para explorar hipotesis de diseno.
- Prototipado de APIs de estimacion: por su tamano, el modelo puede envolverse en un endpoint ligero (FastAPI, Flask) para demos internas de herramientas de estimacion energetica.
- Comparacion metodologica arboles frente a redes: el repositorio documenta explicitamente que en tablas de ~2.000 filas el MLP no supera al random forest, lo que resulta util como evidencia empirica en discusiones de seleccion de modelo.

## Benchmarks y rendimiento

Los autores publican resultados sobre los mismos 643 edificios de test que el modelo del dia 2:

| Modelo | R2 sobre log10 (test) | MAE (kWh/m2 al ano) | Error tipico |
|---|---|---|---|
| Baseline: siempre la media | 0,00 | 89 | 66% |
| Random forest (dia 2) | 0,387 | 68 | 45% |
| Este modelo (MLP) | 0,382 | 69 | 46% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo tiene 7.489 parametros y los pesos ocupan del orden de decenas de kilobytes. Cabe en cualquier GPU consumer, pero no la necesita.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente; una GPU solo tendria sentido para inferencia en lotes muy grandes.
- Cabe en consumer GPU: si, en cualquiera (RTX 3060, RTX 4090, etc.), aunque el despliegue natural es CPU.
- Opciones de despliegue: PyTorch nativo cargando `model.pt` con `torch.load`, scikit-learn para el `ColumnTransformer` con joblib, y envoltorios ligeros como FastAPI o Flask para exponerlo como servicio. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma medida en la informacion proporcionada; por el tamano del modelo, la inferencia por fila en CPU es del orden de microsegundos a pocos milisegundos, dominada por el preprocesado de pandas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R2 test (log10) | MAE (kWh/m2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este MLP (dia 4) | 7.489 | no aplica | 0,382 | 69 | MIT | Hugging Face + GitHub |
| Random forest del equipo (dia 2) | no disponible | no aplica | 0,387 | 68 | no disponible en la informacion | Hugging Face (`iaac-maai/day2-team6-energy-use`) |
| Baseline de la media | 0 | no aplica | 0,00 | 89 | no aplica | Referencia interna del estudio |

No se dispone de comparaciones con otros modelos publicos de prediccion energetica de edificios en la informacion proporcionada.

## Limitaciones y advertencias

- Error tipico en torno al 45-46%: el modelo no es apto para decisiones de diseno, certificados energeticos ni calculos normativos.
- Sesgo de regresion hacia la media: sobreestima edificios de bajo consumo y subestima fuertemente los que superan 1.000 kWh/m2, segun los propios autores.
- Cobertura restringida: solo Seattle, solo 2016, solo edificios de mas de 20.000 pies cuadrados (unos 1.860 m2); no cubre data centers, laboratorios ni edificios de uso muy mixto.
- No extrapola a otras ciudades, anos o tamanos sin reentrenamiento.
- No debe usarse para clasificar o comparar edificios concretos ni a sus propietarios.
- Las variables categoricas de entrada estan en ingles y siguen las convenciones del dataset de Seattle; categorias desconocidas se ignoran silenciosamente, lo que puede degradar la prediccion sin aviso.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y su idoneidad para produccion no esta validada por los autores.
- El modelo es de caracter docente y su valor principal es la reproducibilidad del pipeline, no el rendimiento predictivo.

## Enlaces

- Hugging Face: https://huggingface.co/iaac-maai/day4-team6-energy-use-mlp
- Repositorio GitHub del pipeline completo: https://github.com/iaac-maai/6-day4-assignment
- Modelo del dia 2 (random forest): https://huggingface.co/iaac-maai/day2-team6-energy-use
- Repositorio del dia 1 (limpieza de datos): https://github.com/iaac-maai/6-day1-assignment
- Dataset original: https://www.kaggle.com/datasets/city-of-seattle/sea-building-energy-benchmarking
- Imagen comparativa de test: https://huggingface.co/iaac-maai/day4-team6-energy-use-mlp/resolve/main/test_comparison.png
- Imagen predicho frente a real: https://huggingface.co/iaac-maai/day4-team6-energy-use-mlp/resolve/main/predicted_vs_actual.png
