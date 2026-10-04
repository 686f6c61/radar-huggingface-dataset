# NoraResearchLab/lithology-classical-ml

## Resumen

Lithology-classical-ml es un repositorio de modelos de aprendizaje automatico clasico desarrollado por Nora Research Lab (NORA — Neural Operated Reasoning Agent) para la identificacion automatica de secuencias litologicas a partir de registros de pozo (well logs). No es un modelo de lenguaje ni una red neuronal: contiene tres modelos de arboles entrenados con scikit-learn y serializados en joblib —Random Forest, XGBoost y LightGBM— que resuelven una tarea de clasificacion tabular punto a punto sobre muestras de profundidad.

El problema que aborda es concreto: la interpretacion litologica suele plantearse como clasificacion punto a punto, pero la geologia es secuencial, con unidades que aparecen como intervalos y transiciones. El proyecto evalua los modelos a lo largo de un flujo completo que va de los registros de pozo a la clasificacion puntual, una segmentacion con espesor minimo, la obtencion de secuencias litologicas y una doble evaluacion (a nivel de profundidad y a nivel de secuencia), con el objetivo de medir la recuperacion de secuencias geologicamente realistas y la generalizacion a pozos no vistos.

Los modelos se entrenaron con el dataset de 400 pozos NoraResearchLab/Lithology-Training-Dataset y se evaluaron sobre un benchmark independiente de 66 pozos, NoraResearchLab/lithology-sequence-benchmark. Random Forest obtiene los mejores resultados publicados (exactitud por profundidad de 0,7914 y F1 macro de 0,6279). El repositorio declara licencia MIT, idioma en y un tamano de 1,5 GB, aunque a fecha de la consulta acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Ensemble de arboles de decision en tres variantes: Random Forest (bagging), XGBoost (gradient boosting) y LightGBM (gradient boosting) |
| Parametros totales | No disponible (los ficheros `*_params.json` contienen hiperparametros; no se declara el numero de arboles, hojas ni nodos) |
| Parametros activos | No aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | No aplica (clasificacion tabular punto a punto, muestra a muestra; el contexto secuencial se introduce a posteriori mediante segmentacion por espesor minimo) |
| Tipos de cuantizacion | No disponible (pesos serializados en joblib; no se publican variantes cuantizadas) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`models/random_forest.joblib`, `models/xgboost.joblib`, `models/lightgbm.joblib`) |
| Biblioteca | scikit-learn |
| Pipeline declarado | tabular-classification |
| Variables de entrada | GR, RHOB, NPHI, PEF, DT, log10(RT), CALI e indicadores de valor ausente para cada medida |
| Dataset de entrenamiento | NoraResearchLab/Lithology-Training-Dataset (400 pozos) |
| Benchmark de evaluacion | NoraResearchLab/lithology-sequence-benchmark (66 pozos) |
| Tamano del repositorio | 1,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no contiene una arquitectura neuronal, sino tres clasificadores de arboles clasicos entrenados sobre caracteristicas derivadas de registros de pozo. Random Forest construye un ensemble por bagging; XGBoost y LightGBM implementan gradient boosting sobre arboles de decision, con implementaciones optimizadas distintas. Los tres comparten el mismo espacio de entrada de siete curvas —rayos gamma (GR), densidad de volumen (RHOB), porosidad neutronica (NPHI), factor fotoelectrico (PEF), sonico compresional (DT), resistividad transformada logaritmicamente (log10(RT)) y calibre (CALI)— mas un conjunto de indicadores de ausencia para cada medicion, que permiten al modelo distinguir entre un valor medido y una respuesta no disponible.

El entrenamiento se realizo sobre el dataset de 400 pozos NoraResearchLab/Lithology-Training-Dataset. La model card no detalla el numero de muestras de profundidad, la composicion litologica del dataset, la distribucion geografica ni si hubo balanceo de clases o ajuste de hiperparametros mas alla de los ficheros JSON de parametros. Tampoco se documenta ningun tipo de ajuste por refuerzo ni preferencias humanas, algo que no aplica a este tipo de modelo.

La innovacion metodologica no esta en la arquitectura, sino en la evaluacion: las predicciones puntuales se convierten en intervalos geologicos mediante una restriccion de espesor minimo, lo que reduce el cambio de clase a alta frecuencia y produce secuencias mas plausibles. Sobre esas secuencias se calcula una metrica de similitud de secuencia, complementaria a las metricas clasicas por muestra (exactitud, F1 macro y F1 macro con confianza).

## Capacidades

- Clasificacion de litologia punto a punto: asigna una clase litologica a cada muestra de profundidad a partir de siete curvas de pozo.
- Manejo explicito de datos ausentes: los indicadores de missingness permiten operar con registros incompletos, frecuentes en pozos reales.
- Generacion de secuencias litologicas: la salida puntual se segmenta con una restriccion de espesor minimo para producir intervalos geologicos.
- Generalizacion a pozos no vistos: evaluado sobre un benchmark independiente de 66 pozos distinto del conjunto de entrenamiento.
- Tres alternativas de modelo intercambiables (Random Forest, XGBoost, LightGBM) con el mismo contrato de entrada, lo que permite comparar y elegir segun el compromiso exactitud/coste.
- Inferencia determinista y reproducible en CPU, sin dependencia de GPU.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No tiene vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Interpretacion petrofisica asistida: clasificar automaticamente las curvas de un pozo recien digitalizado para obtener un primer modelo litologico que el interprete revisa y corrige, reduciendo el tiempo de interpretacion manual.
- Control de calidad de registros: los indicadores de valor ausente y la comparacion entre las tres variantes permiten detectar tramos con respuestas incoherentes o con curvas incompletas que degradan la clasificacion.
- Pre-relleno de bases de datos de subsuelo: generar una capa preliminar de litologia para cientos de pozos con formato homogeneo, antes de la validacion por especialistas.
- Modelado geoestadistico y 3D: las secuencias litologicas segmentadas por espesor minimo son una entrada mas realista que las predicciones punto a punto para construir mallas de facies y simulaciones de reservorio.
- Screening de pozos exploratorios: aplicar los modelos a pozos sin interpretacion previa para priorizar cuales merecen un analisis detallado, usando la exactitud de 0,7914 y el F1 macro de 0,6279 del Random Forest como referencia de fiabilidad.
- Integracion en pipelines de datos de pozo: al ser modelos scikit-learn serializados en joblib, se pueden insertar como etapa de un ETL en Python que procese lotes de pozos y emita secuencias litologicas etiquetadas.
- Docencia y referencia metodologica: el repositorio sirve como linea base clasica reproducible frente a la que comparar modelos secuenciales mas complejos, dado que incluye benchmark independiente y metricas a dos niveles.
- Estimacion de incertidumbre por ensemble: la discrepancia entre Random Forest, XGBoost y LightGBM sobre un mismo intervalo puede usarse como indicador cualitativo de zonas dudosas.

## Benchmarks y rendimiento

Evaluacion sobre el benchmark independiente NoraResearchLab/lithology-sequence-benchmark (66 pozos), publicado en la model card:

| Modelo | Pozos | Exactitud por profundidad | F1 macro por profundidad | F1 macro con confianza | Similitud de secuencia | F1 macro en validacion cruzada |
|---|---|---|---|---|---|---|
| Random Forest | 66 | 0,7914 | 0,6279 | 0,5900 | 0,5927 | 0,7599 |
| XGBoost | 66 | 0,7271 | 0,5757 | 0,5293 | 0,5173 | 0,7571 |
| LightGBM | 66 | 0,6936 | 0,5321 | 0,4834 | 0,4818 | 0,7266 |

Random Forest obtiene el mejor resultado en las cinco metricas del benchmark independiente. La model card no incluye comparaciones con modelos de terceros ni resultados de benchmarks externos. No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, frente a modelos neuronales de clasificacion de litologia).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. Los modelos son ensembles de arboles serializados en joblib y se ejecutan en CPU; no requieren GPU.
- GPU recomendadas: no aplica. No hay soporte declarado de aceleracion por GPU en este repositorio.
- GPU de consumo: irrelevante para la inferencia; un equipo sin GPU dedicada es suficiente.
- Memoria principal estimada: no disponible con precision. El repositorio ocupa 1,5 GB, lo que da una cota superior del conjunto de artefactos (modelos, metricas, imagenes y posibles datos auxiliares); la huella de un unico modelo joblib cargado en memoria no se declara.
- Opciones de despliegue: Python con scikit-learn y joblib, ya sea en un script, un servicio propio o como etapa de un pipeline de datos. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales y a formatos GGUF o safetensors.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia por pozo ni por muestra de profundidad.
- Escalado: al ser un modelo por muestra, el coste crece linealmente con el numero de muestras de profundidad procesadas; el cuello de botella previsible es la preparacion de caracteristicas y la segmentacion posterior, no el modelo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar las tres variantes incluidas en el propio repositorio. No se identifican en la documentacion modelos de terceros comparables con datos publicados y verificables.

| Modelo | Parametros | Contexto | Exactitud por profundidad (66 pozos) | F1 macro (66 pozos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Random Forest (este repositorio) | No disponible | No aplica | 0,7914 | 0,6279 | MIT | HuggingFace, 0 descargas |
| XGBoost (este repositorio) | No disponible | No aplica | 0,7271 | 0,5757 | MIT | HuggingFace, 0 descargas |
| LightGBM (este repositorio) | No disponible | No aplica | 0,6936 | 0,5321 | MIT | HuggingFace, 0 descargas |
| Otros modelos de clasificacion de litologia | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta la composicion litologica, la procedencia geografica ni la distribucion de clases del dataset de 400 pozos. Sin esa informacion no es posible descartar un sesgo hacia las litologias dominantes en el conjunto de entrenamiento.
- Desbalanceo de clases: la diferencia entre exactitud (0,7914) y F1 macro (0,6279) en Random Forest indica que el rendimiento cae en las clases minoritarias, un patron tipico de datasets desbalanceados.
- Riesgo de error por distribucion: al ser un modelo supervisado sobre curvas de pozo, su fiabilidad fuera de la cuenca o del tipo de formacion representados en el entrenamiento no esta cuantificada. No hay evaluacion de generalizacion entre cuencas.
- Dependencia de las curvas de entrada: solo maneja siete mediciones mas sus indicadores de ausencia. Si un pozo carece de varias de ellas, el rendimiento no esta caracterizado.
- Sensibilidad a la segmentacion: la calidad de las secuencias litologicas depende del parametro de espesor minimo, cuyo valor y criterio de eleccion no se detallan en la informacion disponible.
- Alucinacion: el concepto no aplica a un clasificador tabular. El riesgo equivalente es la asignacion confiada de una clase incorrecta en intervalos ambiguos, y no se publica ninguna calibracion de probabilidades ni umbral de confianza recomendado.
- Idiomas: la etiqueta del repositorio es en y la documentacion esta en ingles. No hay material en castellano.
- Licencia: MIT, permisiva, permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Conviene revisar, en cualquier caso, las condiciones de los datasets de entrenamiento y benchmark, que se distribuyen por separado.
- Madurez: 0 descargas y 0 likes, con la ultima actualizacion registrada en octubre de 2026. No hay evidencia de uso en produccion ni de mantenimiento posterior.
- Documentacion incompleta: la model card disponible aparece truncada en la seccion de interpretacion del benchmark, y no incluye ficha de hiperparametros, ficha de clases litologicas ni guia de uso.
- Verificacion pendiente: los resultados de benchmark proceden unicamente del propio autor; no se han encontrado evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NoraResearchLab/lithology-classical-ml
- Dataset de entrenamiento (400 pozos): https://huggingface.co/datasets/NoraResearchLab/Lithology-Training-Dataset
- Benchmark independiente de secuencias (66 pozos): https://huggingface.co/datasets/NoraResearchLab/lithology-sequence-benchmark
- Organizacion en HuggingFace: https://huggingface.co/NoraResearchLab
- Repositorio GitHub: https://github.com/Nora-Research-Lab
- LinkedIn: https://www.linkedin.com/company/nora-research-lab
- X (Twitter): https://x.com/noraresearchlab
- Sitio web: https://noraresearchlab.site
- Imagen de evaluacion de los modelos: https://huggingface.co/NoraResearchLab/lithology-classical-ml/resolve/main/download%20%283%29.png

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su organizacion, papers asociados ni repositorios de codigo adicionales. Los unicos enlaces verificables son los declarados en la model card y en los metadatos de HuggingFace.
