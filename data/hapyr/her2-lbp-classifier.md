# Hapyr/her2-lbp-classifier

## Resumen

El modelo `Hapyr/her2-lbp-classifier` es un clasificador tabular de imagenes histopatologicas HER2 desarrollado por el usuario Hapyr como baseline de un proyecto de clasificacion de cancer de mama. Concretamente, predice la categoria de sobreexpresion del receptor HER2 en cuatro clases (0, 1+, 2+ y 3+) a partir de caracteristicas LBP (Local Binary Pattern) extraidas de las imagenes, no de las imagenes en bruto. Se distribuye como un pipeline serializado de scikit-learn (StandardScaler + SVC con kernel RBF) en formato joblib, no como una red neuronal ni como pesos en safetensors o GGUF.

El modelo resuelve un problema de clasificacion supervisada sobre features tabulares de 10 dimensiones (histograma LBP normalizado con P=8, R=1 y 10 bins). Es relevante como referencia metodologica: demuestra el rendimiento alcanzable con descriptores clasicos frente a aproximaciones con CNN (VGG16), que en el mismo proyecto alcanzan un f1_macro de 0.8096. Su tamano es minimo (el repositorio ocupa 0.0 GB) y no requiere GPU para inferencia.

No es un modelo de lenguaje ni un modelo generativo: no procesa texto, no tiene ventana de contexto en el sentido habitual y no soporta tool calling ni agentes. Su interes para desarrolladores e investigadores es acotado al ambito de la patologia computacional y la evaluacion de baselines de vision clasica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + SVC (kernel RBF, C=10) |
| Parametros totales | no disponible (modelo no neuronal; el numero de vectores de soporte no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 10 features LBP) |
| Tipos de cuantizacion | no aplica (joblib, precision de coma flotante nativa de scikit-learn) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`her2_lbp_best.joblib`) |

## Arquitectura y entrenamiento

El modelo es un clasificador SVM con kernel RBF y C=10, precedido de un StandardScaler, encapsulados en un pipeline de scikit-learn. La entrada son 10 caracteristicas LBP (Local Binary Pattern uniforme, P=8, R=1, histograma normalizado en 10 bins) extraidas de imagenes histopatologicas del dataset Warwick. La seleccion del modelo se realizo mediante validacion cruzada de 5 folds sobre una particion de entrenamiento y validacion de 593 muestras, comparando 9 candidatos (Random Forest, ExtraTrees, HistGradientBoosting, Logistic Regression, SVC y MLP); el SVC obtuvo un f1_macro de 0.7006 en CV. La evaluacion final se hizo sobre el conjunto de test oficial de Warwick (371 muestras).

No se documenta el uso de tecnicas de aumento de datos, ajuste fino de hiperparametros mas alla de la busqueda descrita, ni entrenamiento con aprendizaje profundo. El autor indica explicitamente que es un baseline de features clasicas y que el proyecto original tambien entrena modelos sobre features VGG16 (4096 dimensiones) que alcanzan f1_macro = 0.8096, pero cuyos pesos no se distribuyen por restricciones de licencia del dataset.

## Capacidades

- Clasificacion multiclase (4 clases: 0, 1+, 2+, 3+) de sobreexpresion HER2 a partir de features LBP tabulares.
- Inferencia sobre vectores de 10 dimensiones (lbp_0 a lbp_9) en el orden exacto de la extraccion del notebook 01 del proyecto original.
- Integracion directa en pipelines de Python via `joblib.load` y `model.predict`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision, audio ni ninguna capacidad generativa.
- No procesa imagenes directamente: requiere un paso previo de extraccion de features LBP.

## Casos de uso

- Baseline de referencia en investigacion de patologia computacional: util para establecer un suelo de rendimiento antes de entrenar modelos con CNN sobre el mismo dataset Warwick, comparando f1_macro y accuracy en igualdad de condiciones.
- Docencia y experimentacion con features clasicas: permite ilustrar el flujo completo de extraccion LBP, normalizacion y clasificacion SVM en asignaturas de vision por computador o bioinformatica, con un modelo ligero que se ejecuta en CPU.
- Prototipado rapido de pipelines de clasificacion histopatologica: al ser un joblib de tamano minimo, se puede desplegar en un contenedor ligero o incluso en un entorno de notebooks sin GPU para validar la infraestructura de datos antes de incorporar modelos mas pesados.
- Comparacion de descriptores: sirve para cuantificar la brecha entre descriptores de textura clasicos (LBP) y features profundas (VGG16) en la misma tarea, con una diferencia documentada de aproximadamente 0.19 puntos de f1_macro.
- Validacion de pipelines de extraccion de features: el modelo actua como test de regresion para verificar que el orden y la normalizacion de los 10 bins LBP coincide con la extraccion del notebook original.
- Reproducibilidad de resultados academicos: permite a terceros reproducir las metricas publicadas (accuracy 0.6119, f1_macro 0.6223) sobre el conjunto de test de Warwick sin necesidad de reentrenar.
- Filtrado previo en flujos de anotacion: en un entorno de investigacion, puede usarse para preclasificar muestras y priorizar la revision manual por patologos, siempre con supervision humana y sin valor diagnostico.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| f1_macro (validacion cruzada 5-fold) | 0.7006 | train + validacion (593 muestras) |
| accuracy | 0.6119 | test oficial Warwick (371 muestras) |
| f1_macro | 0.6223 | test oficial Warwick (371 muestras) |

Referencia interna del mismo proyecto (no distribuida en este repositorio):

| Modelo | f1_macro |
|---|---|
| LBP + SVC (este modelo) | 0.6223 (test) |
| VGG16 + RandomForest | 0.8096 (test) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo de CPU; scikit-learn no usa GPU).
- GPU recomendadas: no aplica; el modelo se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el repositorio ocupa 0.0 GB.
- Opciones de despliegue: Python con scikit-learn y joblib; integrable en FastAPI, Flask, BentoML o como paso de un pipeline de preprocesado. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (SVM sobre 10 features) se espera latencia de microsegundos a milisegundos por muestra en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | f1_macro (test Warwick) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hapyr/her2-lbp-classifier | SVM RBF sobre LBP | 10 features LBP | 0.6223 | MIT | Hugging Face |
| VGG16 + RandomForest (mismo proyecto) | CNN + clasificador | 4096 features VGG16 | 0.8096 | no disponible (pesos no distribuidos) | no disponible |
| Otros modelos del proyecto (RF, ExtraTrees, HistGB, LogReg, MLP sobre LBP) | varios | 10 features LBP | no disponible (solo CV) | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables externos en la documentacion proporcionada.

## Limitaciones y advertencias

- Rendimiento modesto por diseno: es un baseline de features clasicas, con f1_macro de 0.6223 en test, muy por debajo del 0.8096 alcanzado con VGG16 en el mismo proyecto.
- No es un dispositivo medico: el autor lo indica explicitamente; no debe usarse para diagnostico clinico ni para toma de decisiones terapeuticas.
- Dependencia del dataset Warwick: el entrenamiento y la evaluacion se realizaron sobre ese dataset, de uso academico y con redistribucion restringida; deben verificarse los terminos originales antes de reutilizar el modelo o los datos.
- Dependencia de la extraccion de features: el modelo solo acepta vectores LBP de 10 dimensiones en el orden exacto del notebook 01; cualquier cambio en la parametrizacion LBP (P, R, bins) invalida las predicciones.
- No procesa imagenes directamente: requiere un pipeline externo de extraccion de features, lo que anade complejidad y puntos de fallo.
- Riesgo de sobreajuste al dominio: al entrenarse sobre un unico dataset histopatologico, la generalizacion a otros escáneres, tinciones o laboratorios no esta documentada.
- Sesgos conocidos: no se documentan analisis de sesgo por subgrupo demografico, tipo de tejido o centro de origen.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en muestras fuera de distribucion.
- Licencia MIT para el codigo y el modelo, pero las restricciones del dataset Warwick pueden limitar el uso comercial derivado; conviene revisar los terminos del dataset antes de un despliegue productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hapyr/her2-lbp-classifier
- Proyecto original `her2-histopathology-classification`: no disponible como enlace directo en la informacion proporcionada
- Notebook de extraccion de features (`notebooks/01_feature_extraction_classical_models.ipynb`): no disponible como enlace directo en la informacion proporcionada
- Dataset Warwick: no disponible como enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
