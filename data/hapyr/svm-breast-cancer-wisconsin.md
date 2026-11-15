# Hapyr/svm-breast-cancer-wisconsin

## Resumen

El modelo `Hapyr/svm-breast-cancer-wisconsin` es un pipeline de clasificacion tabular basado en `StandardScaler` seguido de una Support Vector Machine con kernel RBF (`SVC`), entrenado sobre el dataset publico Wisconsin Breast Cancer distribuido con scikit-learn y originalmente procedente del repositorio UCI. Lo desarrolla el usuario de Hugging Face Hapyr como material educativo y de referencia dentro de un repositorio de reconocimiento de patrones, y se publica bajo licencia MIT. No es un modelo de lenguaje ni una red neuronal profunda: es un artefacto clasico de machine learning serializado con `joblib`.

El problema que resuelve es la clasificacion binaria de muestras de biopsias de mama en malignas o benignas a partir de 30 caracteristicas numericas derivadas de imagenes digitalizadas de aspirados con aguja fina. El conjunto de datos contiene 569 muestras y el pipeline reporta una precision de test de 0,9825 y un F1 ponderado de 0,9825 sobre una particion estratificada 80/20.

Su relevancia es acotada: sirve como linea base reproducible y como ejemplo didactico de pipeline clasico de clasificacion tabular con SVM, no como componente para produccion clinica. No dispone de contexto, tokenizador, pesos en formato de red neuronal ni capacidades generativas, y su repo ocupa 0,0 GB (un unico artefacto `.pkl` de pequeno tamano).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `SVC(kernel='rbf', C=10, gamma=0.01)` |
| Parametros totales | no disponible (modelo de vectores de soporte; el numero de vectores de soporte depende del ajuste y no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular, 30 features de entrada) |
| Tipos de cuantizacion | no aplica (serializacion `joblib`/pickle; no hay cuantizacion de pesos) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pkl` serializado con `joblib` (`svm_breast_cancer.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de dos etapas: estandarizacion de las 30 variables de entrada con `StandardScaler` (media cero, desviacion tipica uno) y clasificacion mediante una Support Vector Machine con kernel gaussiano RBF. Los hiperparametros publicados son `C=10`, `gamma=0.01` y `kernel='rbf'`, identicos a los del notebook `pattern-recognition-ml/notebooks/02_breast_cancer_svm_pipeline.ipynb` del mismo autor. La SVM resuelve un problema de optimizacion convexa que maximiza el margen entre clases, con un termino de regularizacion controlado por `C`; el kernel RBF permite fronteras de decision no lineales en el espacio de 30 dimensiones.

El entrenamiento se realiza sobre el dataset Wisconsin Breast Cancer (569 muestras, 30 features) con una particion estratificada 80/20 entre entrenamiento y test. No se documenta el numero de vectores de soporte resultante, ni la semilla de particion, ni si hubo busqueda de hiperparametros adicional, ni procesos de calibracion de probabilidades. Tampoco se indica ningun tipo de ajuste fino, RLHF o tecnica de regularizacion mas alla del propio parametro `C`. La reproducibilidad se apoya en el script `train_model.py` mencionado en la model card.

## Capacidades

- Clasificacion binaria tabular: predice la clase 0 (maligno) o 1 (benigno) a partir de un vector de 30 caracteristicas numericas.
- Estimacion de probabilidades por clase mediante `predict_proba`, sujeta a la calibracion interna de la SVM (no documentada).
- Preprocesamiento integrado: el `StandardScaler` esta incluido en el pipeline, por lo que la entrada debe ser un `DataFrame` con las 30 features originales del dataset.
- Integracion directa con scikit-learn: compatible con `joblib`, `hf_hub_download` y el ecosistema Python de ciencia de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento extendido.
- No procesa secuencias: no hay ventana de contexto ni gestion de conversaciones multi-turno.

## Casos de uso

- Docencia y formacion en machine learning clasico: el pipeline sirve como ejemplo completo y reproducible de `StandardScaler` + `SVC` con particion estratificada, util en cursos de reconocimiento de patrones y de scikit-learn.
- Linea base de referencia en experimentos de clasificacion tabular: permite comparar rapidamente nuevos clasificadores (gradient boosting, redes tabulares) contra una SVM RBF con hiperparametros conocidos y metrica publicada (accuracy 0,9825).
- Pruebas de integracion de pipelines de scikit-learn en MLOps: al ser un artefacto `joblib` pequeno, es adecuado para validar flujos de empaquetado, versionado y despliegue de modelos clasicos en entornos de CI/CD.
- Validacion de infraestructura de inferencia tabular: sirve para probar endpoints de prediccion por lotes o servicios REST que reciben vectores de 30 features y devuelven clase y probabilidad.
- Reproduccion de resultados academicos: permite replicar el resultado del notebook de origen y verificar la estabilidad de la metrica con distintas semillas de particion.
- Ejemplo de publicacion de modelos en Hugging Face Hub: demuestra el flujo `hf_hub_download` + `joblib.load` para artefactos no neuronales, util como plantilla para equipos que publican modelos clasicos.
- Prototipado educativo de sistemas de apoyo a la decision: con las advertencias explicitas de la model card, puede usarse en demostraciones de clasificacion binaria en ambito sanitario sin datos reales de pacientes.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9825 | Test (particion 80/20 estratificada) |
| F1 ponderado (weighted) | 0,9825 | Test (particion 80/20 estratificada) |

No se han publicado resultados de benchmarks adicionales (matriz de confusion, precision/recall por clase, ROC-AUC, validacion cruzada) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU. El artefacto `.pkl` es de tamano reducido (el repo ocupa 0,0 GB) y cabe holgadamente en memoria RAM de cualquier maquina moderna.
- GPU recomendadas: ninguna. No se requiere GPU ni aceleracion por hardware; scikit-learn ejecuta la SVM en CPU.
- Compatibilidad con GPU de consumo: no aplica; no hay requisito de GPU, por lo que funciona en cualquier equipo con Python y `scikit-learn`.
- Opciones de despliegue: `joblib` + `scikit-learn` en Python, exposicion mediante FastAPI/Flask, o serializacion a ONNX si se desea portabilidad. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; para una SVM RBF sobre 30 features y 569 muestras de entrenamiento, la inferencia por muestra es del orden de microsegundos a pocos milisegundos en CPU, aunque no se publica medicion concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hapyr/svm-breast-cancer-wisconsin | SVM RBF (scikit-learn) | no disponible (vectores de soporte) | no aplica | Accuracy 0,9825 en test | MIT | Hugging Face |
| Regresion logistica sobre el mismo dataset | Clasificador lineal | no disponible | no aplica | no disponible | no aplica | scikit-learn |
| Random Forest sobre el mismo dataset | Ensemble de arboles | no disponible | no aplica | no disponible | no aplica | scikit-learn |
| Gradient Boosting (p. ej. XGBoost/LightGBM) sobre el mismo dataset | Ensemble de arboles | no disponible | no aplica | no disponible | depende de la implementacion | librerias externas |

No se dispone de resultados publicados de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo se entrena sobre un dataset de benchmark publico y no ha sido validado con datos clinicos reales.
- No sustituye la evaluacion medica profesional; debe usarse exclusivamente como material educacional.
- Riesgo de sobreajuste al dataset Wisconsin Breast Cancer: la particion 80/20 es unica y no se documenta validacion cruzada, por lo que la metrica de 0,9825 puede no generalizar a otras distribuciones.
- No se documenta calibracion de probabilidades; `predict_proba` en SVM puede estar sesgado y no debe interpretarse como probabilidad clinica fiable.
- Sesgos conocidos: no disponibles en la informacion proporcionada; el dataset original tiene limitaciones demograficas y de recogida que no se abordan en la model card.
- Dependencia estricta del esquema de 30 features: cualquier cambio en el orden, nombre o escalado de las variables invalida las predicciones.
- Licencia MIT permite uso comercial del artefacto, pero las advertencias eticas y medicas del autor siguen aplicando.
- Sin soporte de texto, contexto largo ni idiomas; no es adecuado para tareas de lenguaje natural.
- El repositorio no incluye informacion sobre versiones de scikit-learn usadas en el entrenamiento, lo que puede provocar incompatibilidades al cargar el `.pkl` en versiones distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hapyr/svm-breast-cancer-wisconsin
- Notebook de origen citado en la model card: `pattern-recognition-ml/notebooks/02_breast_cancer_svm_pipeline.ipynb` (ruta indicada por el autor; no se proporciona URL directa)
- Dataset Wisconsin Breast Cancer en scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_breast_cancer.html
- Dataset Wisconsin Breast Cancer en UCI: https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic
- Documentacion de scikit-learn `SVC`: https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html
