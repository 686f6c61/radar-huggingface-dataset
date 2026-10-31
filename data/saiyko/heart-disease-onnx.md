# saiyko/heart-disease-onnx

## Resumen

Heart Disease Prediction (ONNX) es un modelo de clasificación tabular binaria desarrollado por el usuario saiyko y publicado en Hugging Face. No es un modelo de lenguaje, sino un modelo de regresión logística entrenado con scikit-learn sobre el clásico conjunto de datos UCI Heart Disease (Cleveland) para estimar la probabilidad de enfermedad cardíaca a partir de 13 atributos clínicos.

Su relevancia no radica en la precisión predictiva, sino en el pipeline didáctico completo que demuestra: entrenamiento local, exportación a ONNX con `skl2onnx`, alojamiento gratuito en el Hub de Hugging Face e inferencia en el navegador. El mismo archivo ONNX produce resultados idénticos en Python, navegador y móvil, con una diferencia máxima frente a scikit-learn inferior a 1e-6.

El autor lo declara explícitamente como un proyecto educativo: el modelo no es un dispositivo médico y no debe usarse para diagnóstico ni decisiones clínicas. Se distribuye bajo licencia CC-BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: StandardScaler → LogisticRegression |
| Parametros totales | no disponible (modelo lineal de 13 coeficientes más intercepto) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en float32) |
| Idiomas soportados | en (documentación; el modelo procesa datos numéricos tabulares) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`), joblib (`model.joblib`), `config.json` (contrato de entrada/salida) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 (`C=1.0`, solver `lbfgs`, `max_iter=1000`) precedida de un `StandardScaler` dentro de un `Pipeline` de scikit-learn. El umbral de decisión es 0,5 y la semilla aleatoria usada fue 13. El entorno de entrenamiento fue Python 3.12.7 con scikit-learn 1.5.1. La conversión a ONNX se realizó con `skl2onnx` (opset 17, `zipmap=False`), verificando automáticamente que la diferencia máxima entre la salida de ONNX y la de scikit-learn en el conjunto de test sea inferior a 1e-6.

Los datos de entrenamiento proceden del repositorio UCI Machine Learning (subconjunto Cleveland Clinic Foundation, Janosi et al., 1989), en su forma habitual de 303 filas. El autor corrigió dos problemas conocidos de esta versión del CSV: la etiqueta invertida (`target = 1` significa en realidad ausencia de enfermedad, por lo que se deriva `heart_disease = 1 - target`) y los valores faltantes ocultos (`ca = 4` en 5 filas y `thal = 0` en 2 filas, que se eliminaron). Tras la limpieza quedan 296 pacientes (136 con enfermedad, 46 %; 160 sin enfermedad), divididos 70/30 de forma estratificada en 207 filas de entrenamiento y 89 de test. La entrada ONNX es un tensor float32 de forma `[n, 13]` con un orden estricto de columnas: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca y thal.

## Capacidades

- Clasificación binaria tabular: predice la probabilidad de presencia de enfermedad cardíaca a partir de 13 atributos clínicos numéricos y categóricos codificados.
- Salida de probabilidad: devuelve probabilidades (no solo etiquetas), con umbral de decisión configurable en el consumidor aunque el modelo usa 0,5 por defecto.
- Interoperabilidad total: el mismo archivo ONNX funciona en Python (onnxruntime), en el navegador (onnxruntime-web) y en móvil, garantizando resultados idénticos entre runtimes.
- Inferencia en cliente: al ser un modelo minúsculo, puede ejecutarse íntegramente en el navegador sin backend ni servidor de inferencia.
- Interpretabilidad: al ser una regresión logística, los coeficientes estandarizados permiten explicar el efecto de cada variable (por ejemplo, `ca` con +0,959 y `sex` con +0,907 aumentan el riesgo estimado).
- No soporta texto, visión, audio, tool calling ni agentes: es un modelo tabular puro.

## Casos de uso

- Enseñanza de MLOps de extremo a extremo: el proyecto ilustra el ciclo completo de entrenamiento local, exportación a ONNX, publicación en el Hub y despliegue, ideal como material docente en cursos de machine learning.
- Demostración de inferencia en el navegador: se puede servir el modelo con GitHub Pages o similar y ejecutar onnxruntime-web en el cliente, sin coste de servidor; existe una demo en vivo enlazada en la model card.
- Ejemplo de contratos de I/O en ONNX: el archivo `config.json` documenta el esquema exacto de entrada (13 columnas float32 en orden fijo), útil para aprender a versionar y validar contratos de modelos.
- Verificación de paridad entre runtimes: el caso práctico de comprobar que ONNX y scikit-learn coinciden dentro de 1e-6 sirve de plantilla para tests de exportación en proyectos reales.
- Prototipado de formularios clínicos interactivos: como demostración técnica (no clínica) de interfaces que calculan riesgos a partir de datos de un formulario en tiempo real.
- Base para ejercicios de mejora de modelos: los estudiantes pueden reemplazar la regresión logística por árboles, gradient boosting o redes neuronales y comparar métricas sobre el mismo split estratificado 70/30.
- Ejemplo de preprocesado de datos "sucios": la corrección de la etiqueta invertida y de los valores faltantes ocultos (`ca = 4`, `thal = 0`) es un caso de estudio realista de limpieza de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente), sobre el conjunto de test hold-out (30 %, n = 89) del dataset UCI Heart Disease (Cleveland):

| Metrica | Valor |
|---|---|
| Accuracy | 0,8876 |
| ROC AUC | 0,9309 |
| Precision | 0,9697 |
| Recall (sensibilidad) | 0,7805 |
| Especificidad | 0,9792 |
| F1 | 0,8649 |

Matriz de confusión (filas = real, columnas = predicho):

| | Predicho: sin enfermedad | Predicho: con enfermedad |
|---|---|---|
| Real: sin enfermedad | 47 | 1 |
| Real: con enfermedad | 9 | 32 |

Validación cruzada estratificada de 5 pliegues (296 filas completas):

| Metrica | Media ± desviacion tipica |
|---|---|
| ROC AUC | 0,907 ± 0,0528 |
| Accuracy | 0,8615 ± 0,0508 |

El propio autor señala que la validación cruzada es una estimación más fiable que el único split hold-out, dado el tamaño reducido del dataset.

## Requisitos de hardware

- VRAM: no aplicable en la práctica; el modelo es de unos pocos kilobytes (el repositorio figura con 0,0 GB) y se ejecuta en CPU sin GPU.
- GPU recomendadas: ninguna; no se requiere aceleración. Cualquier CPU moderna es más que suficiente.
- Consumer hardware: funciona en cualquier ordenador de escritorio, portátil e incluso en móviles mediante onnxruntime-web en el navegador.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), onnxruntime-mobile; también puede cargarse el `model.joblib` directamente con scikit-learn 1.5.1. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles explícitamente, pero al ser una transformación lineal sobre 13 características, la inferencia es del orden de microsegundos por muestra en CPU.

## Comparativa con modelos similares

| | heart-disease-onnx (regresion logistica) | XGBoost tipico sobre UCI Heart Disease | Random Forest tipico sobre UCI Heart Disease |
|---|---|---|---|
| Tipo | Modelo lineal regularizado (sklearn) | Ensemble de arboles por gradiente | Ensemble de arboles bagging |
| Accuracy tipica en este dataset | 0,8876 (hold-out) | ~0,80–0,85 (valores comunes en la literatura) | ~0,80–0,84 (valores comunes en la literatura) |
| Interpretabilidad | Alta (coeficientes directos) | Baja (requiere SHAP) | Baja-media |
| Formato de despliegue | ONNX, joblib | JSON/UBJ propios, ONNX via onnxmltools | joblib/pickle, ONNX via onnxmltools |
| Tamano | Kilobytes | Kilobytes-megabytes | Megabytes |
| Licencia | CC-BY 4.0 | Depende del proyecto | Depende del proyecto |

Nota: los valores de XGBoost y Random Forest son rangos orientativos habituales en la literatura sobre este dataset, no resultados de un modelo concreto publicado; no se han identificado fichas de modelos comparables equivalentes en Hugging Face para esta tarea concreta.

## Limitaciones y advertencias

- Uso prohibido en ámbito clínico: el autor advierte expresamente que el modelo no es un dispositivo médico y no debe usarse para diagnosticar, tratar ni tomar decisiones clínicas.
- Recall bajo en la clase positiva: la sensibilidad es 0,7805 (9 falsos negativos de 41 casos reales), lo que sería inaceptable en un contexto de cribado médico real.
- Dataset muy pequeño: 296 pacientes tras la limpieza, todos del subconjunto Cleveland; la generalización a otras poblaciones, hospitales o dispositivos de medición no está garantizada y el propio autor la marca como fuera de alcance.
- Riesgo de fuga de datos y sobreajuste en evaluación: con 89 filas de test, las métricas hold-out tienen alta varianza; conviene fiarse más de la validación cruzada (ROC AUC 0,907 ± 0,0528).
- Contrato de entrada estricto: las 13 columnas deben suministrarse en un orden exacto y con codificaciones concretas (por ejemplo, `cp` codificado 0–3, `thal` 1–3); cualquier desviación produce resultados erróneos sin aviso.
- Etiqueta invertida en el CSV original: quien reentrene con el CSV crudo debe aplicar la corrección `heart_disease = 1 - target` y eliminar las filas con `ca = 4` y `thal = 0`.
- Sesgos: el dataset histórico de Cleveland presenta desequilibrios demográficos conocidos (predominio de hombres); el coeficiente positivo de `sex` (+0,907) refleja ese sesgo y no debe interpretarse causalmente.
- Sin seguimiento ni mantenimiento garantizado: 0 descargas registradas y un solo like; es un proyecto personal educativo sin soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saiyko/heart-disease-onnx
- Demo en vivo (GitHub Pages): https://sayko89.github.io/heart-disease-onnx/
- Dataset original: UCI Machine Learning Repository — Heart Disease (Cleveland Clinic Foundation, Janosi et al., 1989): https://archive.ics.uci.edu/dataset/45/heart+disease
- Paper: no disponible
- Repositorio de codigo fuente: no disponible (además del contenido del propio repo del modelo y la demo)
