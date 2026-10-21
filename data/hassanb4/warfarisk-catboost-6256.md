# HassanB4/warfarisk-catboost-6256

## Resumen

warfarisk-catboost-6256 es un modelo de regresion tabular basado en CatBoost, desarrollado por el usuario HassanB4, que predice la dosis semanal estable de warfarina a partir de variables clinicas y geneticas. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que estima un valor numerico continuo (mg/semana) a partir de un vector de caracteristicas tabulares. El modelo esta entrenado sobre la cohorte IWPC-6256, con 4.830 muestras de entrenamiento y 1.207 de test, y es el artefacto que sirve la aplicacion prototipo WarfaRisk.

Su relevancia es acotada pero concreta: la warfarina tiene un indice terapeutico estrecho y una variabilidad de dosis interindividual muy alta, ligada en parte a variantes en CYP2C9 y VKORC1. Un regresor tabular bien calibrado permite explorar la prediccion de dosis con incertidumbre cuantificada (el repositorio incluye una semiancha conformal), algo util en investigacion farmacogenomica y en el prototipado de herramientas de apoyo a la decision. Los resultados publicados en la model card son MAE de 8,875 mg/semana, R2 de 0,446 y PW20 de 0,455 sobre el conjunto de test.

El autor lo declara explicitamente como material de uso en investigacion y no como herramienta de decision clinica. El modelo se distribuye con licencia Apache 2.0, esta implementado con la libreria CatBoost y el repositorio de pesos ocupa menos de 0,1 GB, por lo que la inferencia es trivial en cuanto a recursos comparada con cualquier modelo neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CatBoost (gradient boosting sobre arboles de decision, ordered boosting) para regresion tabular |
| Parametros totales | no disponible (la model card no publica numero de arboles, profundidad ni hiperparametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin entrada secuencial de texto) |
| Tipos de cuantizacion | no disponible; no aplica cuantizacion de pesos neuronales (el artefacto es un fichero .cbm) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cbm` (CatBoost binary model) acompanado de `.json` con columnas de features, valores por defecto, metricas de test y semiancha conformal; mas `metrics.json` |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado de arboles de decision con boosting por gradiente, en la implementacion CatBoost. CatBoost se caracteriza por el tratamiento nativo de variables categoricas y por el esquema de ordered boosting, que reduce el sesgo de prediccion en los propios datos de entrenamiento. La model card no detalla hiperparametros (profundidad, numero de iteraciones, tasa de aprendizaje, regularizacion), funcion de perdida ni proceso de seleccion de features, por lo que esos extremos quedan como no disponibles.

Los datos de entrenamiento provienen de la cohorte IWPC-6256, con 4.830 registros de entrenamiento y 1.207 de test, separados con semilla 20260725. Las features combinan variables clinicas y geneticas, segun la descripcion del autor; el listado exacto de columnas esta en `catboost_iwpc6256_combined.json`. No se documenta composicion demografica del dataset, numero de variantes geneticas incluidas, ni si hubo ajuste fino o calibracion posterior. El repositorio incorpora una semiancha conformal, lo que sugiere un paso de calibracion de incertidumbre con prediccion por intervalos, aunque el procedimiento no se describe en la informacion disponible. El codigo de reproduccion esta en el repositorio de GitHub del autor, con un documento especifico de reproducibilidad.

## Capacidades

- Regresion tabular: estima una dosis semanal estable de warfarina en mg/semana a partir de un vector de features clinicas y geneticas.
- Prediccion puntual con metricas de error publicadas (MAE, R2, PW20) sobre un conjunto de test fijo.
- Cuantificacion de incertidumbre: el JSON de metadatos incluye una semiancha conformal que permite construir intervalos de prediccion.
- Manejo de valores ausentes: el JSON adjunto contiene valores por defecto por columna, lo que indica un esquema de imputacion definido en el artefacto.
- Integracion como modelo servido en aplicacion: es el regresor que alimenta el prototipo WarfaRisk.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: son capacidades fuera de su dominio.
- No dispone de capacidades multilingues: no hay procesamiento de lenguaje implicado.

## Casos de uso

- Investigacion en farmacogenomica: usar el modelo como linea base reproducible para predecir dosis estable de warfarina sobre cohortes con features comparables, aprovechando que el split y la semilla estan documentados para replicar el experimento.
- Analisis de importancia de variables: al ser un modelo de arboles, permite extraer y comparar la contribucion de features clinicas frente a geneticas, un analisis habitual en estudios de variabilidad de dosis.
- Prototipado de interfaces de apoyo a la decision: el modelo sirve para alimentar una app de demostracion (WarfaRisk) con prediccion puntual e intervalo conformal, sin uso clinico real.
- Evaluacion de incertidumbre en modelos tabulares: la semiancha conformal incluida permite estudiar la cobertura empirica de intervalos de prediccion en un problema de regresion con alta varianza.
- Benchmarking de pipelines de regresion tabular: sirve como referencia CatBoost frente a alternativas (XGBoost, LightGBM, regresion lineal) sobre el mismo split IWPC-6256, siempre que se respete la semilla documentada.
- Docencia y simulacion: escenario controlado para ilustrar el flujo completo de un modelo predictivo en salud (features, split, metricas de regresion, calibracion de intervalos y advertencias de uso).
- Validacion de pipelines de datos clinicos: comprobar que un ETL produce las mismas columnas, orden y valores por defecto que espera el `.json` del modelo antes de desplegar cualquier inferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card para el conjunto de test (n_test = 1.207, semilla de particion 20260725):

| Metrica | Valor | Comparacion con otros modelos |
|---|---|---|
| MAE (mg/semana) | 8,875 | no disponible |
| R2 | 0,446 | no disponible |
| PW20 (proporcion de predicciones dentro del 20 % de la dosis real) | 0,455 | no disponible |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos sobre la misma particion, ni desagregados por subgrupo (ancestria, edad, genotipo). Tampoco se documenta la cobertura empirica de los intervalos conformales.

## Requisitos de hardware

- VRAM estimada: no aplica. La inferencia de un modelo CatBoost de este tipo se ejecuta en CPU y el repositorio completo ocupa menos de 0,1 GB.
- GPU recomendadas: no aplica; no se requiere GPU ni para inferencia ni, presumiblemente, para el entrenamiento de este tamano (no documentado).
- Cabe en cualquier GPU de consumo: si, y tambien en un portatil sin GPU dedicada; el cuello de botella es la memoria RAM del proceso, del orden de decenas o pocos cientos de MB.
- Opciones de despliegue: libreria CatBoost nativa (`catboost`) en Python, con carga del fichero `.cbm`; integracion como funcion dentro de un servicio web o batch. No se documentan despliegues via vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (arboles, pocas features, sin secuencias) se espera una latencia por peticion muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo / enfoque | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warfarisk-catboost-6256 | CatBoost, regresion tabular | no disponible | no aplica | Apache 2.0 | HuggingFace (HassanB4) |
| Algoritmo de dosificacion IWPC (aproximacion clasica) | Regresion clinica publicada | no disponible | no aplica | no disponible | Publicacion cientifica |
| Otros regresores tabulares sobre IWPC-6256 (XGBoost, LightGBM, regresion lineal) | Gradient boosting / lineal | no disponible | no aplica | no disponible | no disponible |

No se dispone de resultados numericos comparables de estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a la categoria de enfoque y no a rendimiento medido. Cualquier afirmacion de superiority frente a estos metodos requeriria reejecutar la particion documentada.

## Limitaciones y advertencias

- Uso exclusivamente en investigacion: el autor indica de forma explicita que no es una herramienta de decision clinica. No debe usarse para ajustar dosis de warfarina en pacientes reales.
- Rendimiento moderado: R2 de 0,446 y PW20 de 0,455 implican que mas de la mitad de las predicciones se alejan mas del 20 % de la dosis real; el MAE de 8,875 mg/semana es sustancial frente a dosis tipicas.
- Sesgos desconocidos: la model card no publica la composicion demografica ni la distribucion de ancestrias de la cohorte IWPC-6256, por lo que no se puede evaluar la representatividad ni el riesgo de sesgo por subgrupo.
- Riesgo de extrapolacion: al ser un modelo tabular entrenado sobre una cohorte concreta, su comportamiento fuera de la distribucion de features de entrenamiento (otras poblaciones, otros protocolos de INR objetivo, otras variantes geneticas) no esta documentado.
- Limitaciones de idioma: no aplica, pero implica que el modelo no interpreta texto libre ni informes clinicos; requiere features ya estructuradas y codificadas segun el esquema del `.json`.
- Dependencia estricta del preprocesado: el orden de columnas, la codificacion de categoricas y los valores por defecto deben coincidir con `catboost_iwpc6256_combined.json`; cualquier desviacion invalida silenciosamente las predicciones.
- Incertidumbre no validada externamente: la semiancha conformal esta en el artefacto, pero no se documenta su cobertura empirica ni si secalibro sobre el mismo test.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia no exime de las obligaciones regulatorias aplicables a software sanitario.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HassanB4/warfarisk-catboost-6256
- Codigo y reproduccion (WarfaRisk): https://github.com/HasanBGit/WarfaRisk
- Documento de reproducibilidad: https://github.com/HasanBGit/WarfaRisk (ver `docs/REPRODUCIBILITY.md`)
