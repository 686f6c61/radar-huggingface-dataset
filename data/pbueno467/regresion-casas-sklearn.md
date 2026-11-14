# Pbueno467/regresion-casas-sklearn

## Resumen

`Pbueno467/regresion-casas-sklearn` es un modelo de regresion lineal multiple entrenado con scikit-learn que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`, binaria) y presencia de ascensor (`ascensor`, binaria). Lo publica el usuario Pbueno467 como material didactico para el IFTS N.º 18, con la docente Cynthia M. Villagra como responsable academica, y no es un modelo de lenguaje ni una red neuronal: es un artefacto serializado en `joblib` que contiene los coeficientes de una regresion por minimos cuadrados ordinarios.

El interes del repositorio es pedagogico, no de rendimiento. Sirve para ilustrar el ciclo completo de publicacion de un modelo supervisado (entrenamiento, evaluacion en hold-out, serializacion y consumo desde el Hub) y para mostrar que un modelo tabular clasico puede compartirse con el mismo formato de model card que un LLM. El dataset es sintetico (200 registros generados con semilla fija), por lo que cualquier metrica debe interpretarse como demostracion de metodologia y no como evidencia sobre el mercado inmobiliario.

No dispone de arquitectura transformer, tokenizador, ventana de contexto ni capacidades generativas. Su relevancia actual se limita al ambito docente: es un ejemplo minimo y reproducible de `pipeline_tag: tabular-regression` con licencia MIT, util para cursos introductorios de machine learning en castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parametros aprendidos (3 pesos + 1 bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 3 caracteristicas) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en coma flotante de doble precision segun scikit-learn) |
| Idiomas soportados | es (documentacion y model card en castellano; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en pickle) |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple de la forma `precio = w1·m2 + w2·balcon + w3·ascensor + b`, ajustada por minimos cuadrados ordinarios con `LinearRegression` de scikit-learn. No hay capas, atencion ni funciones de activacion: la totalidad del modelo son cuatro escalares almacenados en `model.joblib`. Los coeficientes aprendidos son 1,503 para `m2`, 8,719 para `balcon`, 11,988 para `ascensor` y un intercepto de 19,557, valores muy proximos a los usados en la generacion sintetica de los datos (1,5, 8, 12 y 20 respectivamente).

Los datos de entrenamiento son 200 registros sinteticos generados en `train.py` con semilla fija, de los cuales 160 se emplean para ajuste y 40 para evaluacion en hold-out. Las entradas cubren `m2` en el rango 35-120, `balcon` y `ascensor` como binarias, y la variable objetivo se construye como `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. No se aplico RLHF, DPO, regularizacion, seleccion de caracteristicas ni validacion cruzada; tampoco hay aumentado de datos ni tecnicas de calibracion. La innovacion tecnica, si cabe llamarla asi, es la transparencia total del proceso: el script de entrenamiento y el de inferencia se publican junto al artefacto.

## Capacidades

- Prediccion de una variable continua (precio en miles de USD) a partir de tres caracteristicas tabulares.
- Inferencia por lotes mediante `pandas.DataFrame` y `modelo.predict(...)`.
- Reproducibilidad completa del entrenamiento a partir de `train.py` y la semilla documentada.
- Inspeccion directa de los coeficientes aprendidos (`coef_`, `intercept_`) para interpretar la contribucion marginal de cada variable.
- Consumo desde el Hub mediante `hf_hub_download` y carga con `joblib.load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues en sentido estricto: solo procesa numeros, aunque su documentacion esta en castellano.

## Casos de uso

- Docencia de regresion lineal: el modelo y su script permiten reproducir en clase el ajuste por minimos cuadrados, comparar coeficientes aprendidos con los generadores y discutir el concepto de hold-out con 40 muestras.
- Demostracion de publicacion en Hugging Face: sirve como plantilla minima de model card, estructura de repositorio (`model.joblib`, `train.py`, `predict.py`, `requirements.txt`) y etiquetado (`pipeline_tag`, `tags`, `license`) para alumnos que publican su primer modelo.
- Prueba de integracion de `hf_hub_download` en un pipeline de scikit-learn: util para verificar el flujo de descarga y carga de artefactos `joblib` en entornos docentes o de CI.
- Ejemplo de inferencia tabular por lotes: con un `DataFrame` de varias filas se ilustra el uso de `predict` y la gestion de tipos de columna antes de alimentar el modelo.
- Analisis de interpretabilidad basica: los cuatro parametros permiten explicar el concepto de efecto marginal constante y contrastarlo con modelos no lineales (arboles, gradient boosting) en asignaturas introductorias.
- Referencia de comparacion en ejercicios de modelado: los valores de MAE (3,08 miles de USD) y R² (0,989) sobre datos sinteticos sirven de linea base contra la que los alumnos pueden contrastar sus propios modelos.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de USD | 40 registros de test (hold-out) |
| R² | 0,989 | 40 registros de test (hold-out) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto `model.joblib` ocupa practicamente nada y el repositorio completo mide 0,0 GB.
- GPU recomendadas: ninguna. La inferencia es puramente CPU y consiste en una multiplicacion matricial de 3 entradas por 4 parametros.
- Cabe en cualquier GPU consumer (RTX 3050, RTX 4060, etc.) e incluso en CPU de un solo nucleo y en entornos tipo Raspberry Pi.
- Opciones de despliegue: Python con `scikit-learn` y `joblib`; no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLM.
- Latencia y throughput estimados: no disponible de forma publicada; por la naturaleza del modelo, la latencia por peticion es del orden de microsegundos a milisegundos en CPU y el throughput depende del serializado y del framework HTTP que se coloque delante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Pbueno467/regresion-casas-sklearn` | 4 (3 pesos + bias) | no aplica | MAE 3,08; R² 0,989 (test sintetico) | MIT | Hugging Face |
| Regresion lineal de scikit-learn sobre California Housing | 8 pesos + bias | no aplica | no disponible en esta ficha | BSD-3-Clause (scikit-learn) | Paquete `scikit-learn` |
| Gradient boosting (p. ej. XGBoost/LightGBM) sobre datos tabulares similares | miles de arboles | no aplica | no disponible en esta ficha | Apache 2.0 / MIT | Paquetes respectivos |

No se dispone de comparativas publicadas con alternativas equivalentes en la informacion proporcionada; las filas anteriores son referencias de categoria, no resultados medidos en el mismo conjunto de test.

## Limitaciones y advertencias

- Datos sinteticos: los precios no representan el mercado inmobiliario real y las metricas no son extrapolables.
- Rango de validez limitado a `m2` entre 35 y 120; fuera de ese intervalo el modelo extrapola una recta sin garantia de acierto.
- Supone efectos aditivos y constantes: no captura interacciones (por ejemplo, que el ascensor valga mas en edificios altos) ni no linealidades.
- Solo tres caracteristicas: ubicacion, antiguedad, estado de conservacion y otras variables relevantes quedan fuera.
- Riesgo de alucinacion no aplica (no genera texto), pero si hay riesgo de sobreinterpretacion de los coeficientes por parte de usuarios no tecnicos.
- Sesgos conocidos: no documentados por el autor; al ser datos sinteticos, no hay sesgo demografico medible, pero tampoco hay auditoria.
- `joblib` usa pickle: cargar archivos `.joblib` de fuentes no confiables puede ejecutar codigo arbitrario. Verificar el origen antes de cargar.
- La version de scikit-learn usada en carga deberia coincidir con la de entrenamiento para evitar incompatibilidades de serializacion.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el modelo no esta pensado para produccion.
- No apto para despliegues de alto trafico ni para decisiones con impacto economico real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pbueno467/regresion-casas-sklearn
- Documentacion de `LinearRegression` en scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentacion de `huggingface_hub` (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub/guides/download
- Repositorio de scikit-learn: https://github.com/scikit-learn/scikit-learn
