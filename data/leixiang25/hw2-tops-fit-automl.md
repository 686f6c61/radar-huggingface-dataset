# leixiang25/hw2-tops-fit-automl

## Resumen

`leixiang25/hw2-tops-fit-automl` no es un modelo de lenguaje ni una red neuronal profunda: es un clasificador tabular entrenado con FLAML AutoML sobre el que resulto ser un `XGBoost` con 72 estimadores y `max_leaves=8`. Su tarea es predecir como queda una prenda superior a un usuario concreto (`tight`, `regular`, `baggy`) a partir de marca, tejido, tipo de prenda y tres medidas en centimos de metro (ancho de pecho, largo de cuerpo, largo de manga). Lo publica el usuario `leixiang25` como entrega de la practica 2 de la asignatura CMU 24-679, con licencia CC-BY-4.0 y pipeline declarado como `tabular-classification`.

El interes del artefacto es metodologico, no de rendimiento: documenta de forma inusualmente explicita como se evita la fuga de informacion entre filas sinteticas y reales mediante validacion cruzada agrupada por prenda madre (5 folds, `group = parent top`), y descarta 112 filas sinteticas cuyo progenitor estaba en test. Es un ejemplo compacto, reproducible en CPU y con presupuesto de 120 segundos, de un flujo AutoML completo: definicion de espacio de busqueda, seleccion de metrica (macro-F1), control de leakage y analisis de incertidumbre.

La escala es minima: 30 prendas reales (19 camisetas) mas 347 filas sinteticas generadas con jitter, escalado, mixup y perturbacion categorica. Con solo 8 prendas reales en test, cada acierto o fallo vale 12,5 puntos de exactitud, por lo que el propio autor advierte que las metricas son muy ruidosas. El modelo no debe usarse como recomendador de tallas para terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de arboles de decision con boosting por gradiente (XGBoost); no es una red neuronal |
| Parametros totales | no disponible (no aplica en el sentido habitual; mejor modelo con `n_estimators=72`, `max_leaves=8`, 6 variables de entrada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, una fila = una prediccion; sin ventana de contexto) |
| Tipos de cuantizacion | no disponible / no aplica (los arboles no se cuantizan; el artefacto se serializa en pickle) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje. Las etiquetas objetivo y las categorias estan en ingles (`tight`, `regular`, `baggy`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pickle de Python (`model.pkl`, cargado con `pickle.load`) |
| Tarea | Clasificacion tabular multiclase (`fit`) |
| Variables de entrada | `brand`, `main_fabric`, `garment_type` (categoricas); `chest_width_cm`, `body_length_cm`, `sleeve_length_cm` (numericas, cm) |
| Variable objetivo | `fit` con tres clases: `tight`, `regular`, `baggy` |
| Libreria | FLAML (`library_name: flaml`) |
| Dataset de entrenamiento | `ypolatog/tops-fit-dataset` (CC-BY-4.0) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo final es un clasificador XGBoost de boosting por gradiente sobre arboles, con regularizacion L1 (`reg_alpha = 0.0009765625`) y L2 (`reg_lambda = 0.018706743166653998`), `subsample = 0.7004758809403493`, `min_child_weight = 19.50627616863098`, `learning_rate = 0.020232966686106597` y `colsample_bylevel = colsample_bytree = 1.0`. El preprocesado es minimo: las columnas categoricas se convierten a `pandas.Categorical` con un vocabulario compartido entre train y test, y no se aplica escalado porque todos los candidatos del espacio de busqueda son modelos de arboles o lineales regularizados.

El entrenamiento lo ejecuto FLAML con un presupuesto de 120 segundos, semilla 42 y metrica objetivo macro-F1, explorando las familias `lgbm`, `rf`, `xgboost`, `extra_tree`, `xgb_limitdepth`, `sgd` y `lrl1`. La validacion fue una validacion cruzada agrupada de 5 folds donde el grupo es la prenda madre, de modo que las copias sinteticas de una misma prenda nunca caen a la vez en train y validacion. La particion de datos parte de 30 prendas reales: 22 reales en entrenamiento (mas 235 filas sinteticas cuyo progenitor esta en entrenamiento; se descartaron 112 filas sinteticas para evitar fuga) y 8 prendas reales en test, estratificadas por clase de ajuste.

La innovacion tecnica destacable no esta en el algoritmo, sino en la disciplina experimental: el control explicito de leakage derivado de datos sinteticos generados por proximidad, y la advertencia cuantificada sobre la incertidumbre estadistica del conjunto de test (8 prendas implican una resolucion de 12,5 puntos porcentuales por prediccion). No hubo RLHF, DPO ni ajuste por preferencias, algo por otra parte inaplicable a este tipo de modelo.

## Capacidades

- Clasificacion tabular multiclase de ajuste de prendas superiores en tres clases (`tight`, `regular`, `baggy`).
- Manejo conjunto de variables categoricas (marca, tejido principal, tipo de prenda) y numericas continuas en centimetros.
- Prediccion por fila individual mediante la API de scikit-learn (`model.predict(pd.DataFrame([...]))`), con las categoricas declaradas como `pandas.Categorical`.
- Inferencia en CPU, sin GPU ni dependencias de aceleracion.
- Reproducibilidad del pipeline de AutoML: espacio de busqueda, presupuesto temporal y semilla estan documentados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No tiene capacidades multilingues, de vision, audio ni modo de pensamiento.
- No genera texto ni codigo; su unica salida es una etiqueta de clase.

## Casos de uso

- Material docente para practicar AutoML: el repositorio sirve como plantilla de un flujo FLAML completo (espacio de busqueda, metrica, presupuesto temporal) ejecutable en CPU en unos dos minutos.
- Ejemplo de control de fuga de datos en datasets aumentados: la estrategia de validacion cruzada agrupada por prenda madre es directamente reutilizable en cualquier proyecto que combine registros reales con filas sinteticas derivadas de ellos.
- Prototipo interno de recomendacion de talla para una sola persona: con las seis variables documentadas se puede predecir el ajuste de una prenda nueva respecto al propio armario, siempre que el usuario sea el mismo que genero las etiquetas.
- Base para experimentos de ingenieria de variables: al ser un problema de seis entradas y tres clases, permite comparar rapidamente codificaciones categoricas, interacciones o ratios (por ejemplo, ancho de pecho normalizado por largo de cuerpo) sin coste computacional relevante.
- Referencia de linea base en clasificacion tabular de bajo recurso: util para medir cuanto aporta un modelo mas complejo frente a un XGBoost con 72 arboles cuando solo se dispone de decenas de instancias reales.
- Auditoria de calidad de datos sinteticos: la caida entre el macro-F1 de validacion cruzada (0,780) y el de test (0,750), junto con la advertencia de que las filas sinteticas son casi copias de las reales, sirve para ilustrar como el aumento de datos por proximidad infla las metricas de validacion.
- Ejercicio de analisis de incertidumbre estadistica: con 8 prendas en test, el modelo es un caso de estudio claro de por que una exactitud de 0,750 sobre una muestra tan pequena no permite conclusiones firmes.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Metrica | Valor |
|---|---|
| Macro-F1 en validacion cruzada (entrenamiento) | 0,780 |
| Exactitud en test (8 prendas reales) | 0,750 |
| Macro-F1 en test | 0,750 |
| Exactitud de la linea base por clase mayoritaria | 0,500 |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni benchmarks equivalentes, porque no son aplicables a un clasificador tabular. El propio autor senala que, con solo 8 prendas en test, cada prediccion equivale a 12,5 puntos de exactitud, por lo que las cifras son muy ruidosas.

## Requisitos de hardware

- Entrenamiento completo (busqueda FLAML de 120 segundos sobre siete familias de modelos): CPU de Google Colab, sin GPU.
- Inferencia: CPU convencional; el modelo serializado ocupa una fraccion minima de los 0,0 GB del repositorio y cabe holgadamente en memoria principal de cualquier portatil.
- VRAM necesaria: ninguna. No requiere GPU dedicada ni aceleradores tipo A100, H100 o RTX 4090.
- Cabe en cualquier GPU de consumo, y de hecho no la necesita; tambien funciona en entornos sin GPU (contenedores, funciones serverless, portatiles).
- Opciones de despliegue: carga directa del `model.pkl` con `pickle` en Python, o envoltorio con FastAPI, Flask, BentoML o similar para exponerlo como servicio HTTP.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: son motores para modelos de lenguaje, no para ensembles de arboles serializados en pickle.
- Latencia y throughput: no disponibles de forma medida. El unico dato de tiempo documentado es el presupuesto de busqueda de 120 segundos; la inferencia de un XGBoost con 72 arboles y 8 hojas como maximo por arbol es del orden de microsegundos a pocos milisegundos por fila en CPU, pero no se ha publicado una medicion.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento contra otras alternativas en la informacion disponible. La model card solo documenta que, dentro del espacio de busqueda de FLAML, la familia seleccionada fue `xgboost`, por delante de `lgbm`, `rf`, `extra_tree`, `xgb_limitdepth`, `sgd` y `lrl1`, pero no se aportan las metricas individuales de cada familia.

| Alternativa | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (XGBoost via FLAML) | Clasificacion tabular | 72 estimadores, `max_leaves=8` | no aplica | Macro-F1 test 0,750 | CC-BY-4.0 | HuggingFace |
| `lgbm` (LightGBM) | Clasificacion tabular | no disponible | no aplica | no disponible (candidato descartado por FLAML) | MIT (licencia del framework) | publica |
| `rf` (Random Forest) | Clasificacion tabular | no disponible | no aplica | no disponible (candidato descartado por FLAML) | BSD (licencia del framework) | publica |
| `lrl1` (regresion logistica L1) | Clasificacion tabular lineal | no disponible | no aplica | no disponible (candidato descartado por FLAML) | BSD (licencia del framework) | publica |

Las licencias de las alternativas corresponden a sus frameworks respectivos y no se han verificado en la informacion proporcionada; se marcan como referencia general, no como dato confirmado.

## Limitaciones y advertencias

- Sesgo de un unico usuario: las etiquetas describen el cuerpo y el gusto de una sola persona, por lo que el modelo no generaliza a otras personas. No es una herramienta de recomendacion de tallas.
- Muestra real minima: solo 30 prendas reales, 19 de ellas camisetas. Marcas y tejidos aparecen una o dos veces, de modo que `brand` aporta poca senal fiable y el modelo puede memorizar en lugar de generalizar.
- Datos sinteticos poco informativos: las 347 filas sinteticas se generan por jitter, escalado, mixup y perturbacion categorica, es decir, son casi copias de las reales y anaden poca informacion nueva. El autor descarto 112 filas para evitar fuga, pero el resto sigue siendo muy proximo a las originales.
- Etiquetas subjetivas: la frontera entre `regular` y las otras dos clases es difusa, lo que introduce ruido irreducible en el objetivo.
- Riesgo de sobreajuste a la particion: con 8 prendas en test, la exactitud de 0,750 tiene un intervalo de confianza muy amplio; no debe interpretarse como rendimiento estable.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones confiadas sobre combinaciones de marca, tejido y medidas no vistas, dado que el modelo es un ensemble de arboles sin estimacion de incertidumbre calibrada.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion, pero al derivar de un dataset del mismo licenciante y con etiquetas de una persona concreta, el uso comercial realista es practicamente nulo por motivos eticos y de generalizacion, no legales.
- Sin soporte de idiomas, contexto, cuantizacion ni pesos en safetensors o GGUF: cualquier expectativa derivada de una ficha de modelo de lenguaje no aplica aqui.
- Fecha de creacion declarada como 2026-09-24, posterior a la fecha de referencia habitual; conviene verificar la coherencia temporal del repositorio antes de citarlo.
- El codigo y la model card se redactaron con asistencia de Claude (Anthropic) segun la divulgacion del autor, con revision y ejecucion manual posterior.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con su dataset; los unicos enlaces verificables son los del propio repositorio y el del dataset de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leixiang25/hw2-tops-fit-automl
- Dataset de origen: https://huggingface.co/datasets/ypolatog/tops-fit-dataset
- FLAML (framework AutoML): https://github.com/microsoft/FLAML
- XGBoost: https://github.com/dmlc/xgboost
- La busqueda web no devolvio enlaces relevantes (papers, blogs, repos o demos) adicionales sobre este modelo.
