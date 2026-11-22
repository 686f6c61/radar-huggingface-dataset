# Hamza23102004/psx-compass-models

## Resumen

PSX Compass: models (v1) es una coleccion de pipelines de scikit-learn entrenados para predecir la direccion y el rango de precios de 20 acciones de la Pakistan Stock Exchange (PSX). Lo desarrolla el usuario Hamza23102004 como parte de un proyecto de estudiante, y no es un modelo de lenguaje ni una red neuronal profunda: son clasificadores tabulares (regresion logistica, random forest, XGBoost y SVM con kernel RBF) empaquetados con joblib y expuestos a traves de una aplicacion Streamlit. El repositorio contiene 20 ficheros por accion mas un modelo agrupado (`pooled.joblib`), con un tamano total de aproximadamente 0,1 GB.

El modelo resuelve un problema muy acotado: dado un vector de 9 caracteristicas tecnicas calculadas sobre precios diarios (retornos a 1 y 5 dias, ratio de media movil de 20 sesiones, volatilidad a 10 dias, gap porcentual, ratio de volumen, RSI de 14 periodos, posicion del cierre y retorno del indice KSE-100), estima P(UP)/P(DOWN) para horizontes de 1, 5 y 10 dias de negociacion, ademas de un intervalo de precios al 80% de confianza. Los datos cubren desde el 13 de diciembre de 2016 hasta el 13 de noviembre de 2026, con 49.150 filas y una instantanea de entrenamiento congelada.

Su relevancia es fundamentalmente metodologica y educativa: documenta de forma honesta que el rendimiento esta apenas por encima del azar (ROC-AUC entre 0,50 y 0,55), lo que lo convierte en un ejemplo util de evaluacion rigurosa con particion temporal, calibracion sigmoide y comprobacion de sobreajuste. No debe confundirse con un modelo generativo ni usarse como senal de trading.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipelines de scikit-learn (imputacion por mediana, StandardScaler y clasificador); 4 clasificadores: regresion logistica, random forest, XGBoost y SVM RBF; calibracion sigmoide con CalibratedClassifierCV |
| Parametros totales | no disponible (modelos tabulares; el numero de parametros depende del clasificador y del stock) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 9 caracteristicas tabulares |
| Tipos de cuantizacion | no aplica (pesos joblib/pickle, no hay cuantizacion de red neuronal) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | joblib (pickle de Python); requiere Python 3.12, scikit-learn 1.9.1, xgboost 3.4.1, numpy 2.5.5, pandas 3.1.1 y joblib 1.6.0 |
| Pipeline | tabular-classification |
| Tamano del repositorio | 0,1 GB |
| Numero de acciones | 20 (modelos por accion) + 1 modelo agrupado |
| Horizontes de prediccion | 1, 5 y 10 dias de negociacion |
| Zona muerta (dead zone) | 0,003 x raiz(h); 0,30% a 1 dia, 0,67% a 5 dias, 0,95% a 10 dias |
| Ventana de datos | 2016-12-13 a 2026-11-13 (49.150 filas) |
| Fecha de corte del test | 2024-05-22 (ultimo 25% de fechas distintas) |
| Semilla | random_state = 42 |

## Arquitectura y entrenamiento

Cada fichero `.joblib` es un diccionario de Python con metadatos (`version`, `trained_until`, `cutoff`, `features`, `dead_zone`, `uncertain_band`, `library_versions` y `horizons`) y los modelos ajustados. Para cada horizonte se guardan cuatro clasificadores, el modelo principal por accion y los modelos de rango. Todos son pipelines de scikit-learn con imputacion por mediana, escalado estandar y un clasificador final; las probabilidades se calibran con `CalibratedClassifierCV` en modo sigmoide. El SVM del modelo agrupado se entrena con 4.000 filas espaciadas uniformemente.

El etrenamiento sigue una particion estrictamente temporal: el ultimo 25% de fechas distintas forma el bloque de test (corte en 2024-05-22), con un hueco de h filas tras el corte para evitar fuga de informacion en horizontes de 5 y 10 dias. El ajuste de hiperparametros se hace solo dentro del periodo de entrenamiento con `GridSearchCV` de 5 pliegues ordenados temporalmente y log loss como metrica. Las etiquetas son UP si el retorno supera la zona muerta, DOWN si queda por debajo de menos la zona muerta, y NO_CHANGE en caso contrario; los clasificadores solo se entrenan y puntuan con filas UP/DOWN. Se descartan filas con bandera de anomalia o movimientos de 1 dia superiores al 15%. El rango de precios se estima con Gradient Boosting cuantilico (percentiles 10 y 90) sobre el retorno futuro, comparado con una linea base de volatilidad (±1,28 x vol_10d x raiz(h)). Los modelos finales de la v1 se reajustan con la misma configuracion sobre todas las filas utiles hasta 2026-11-13.

## Capacidades

- Clasificacion binaria de direccion (UP/DOWN) para horizontes de 1, 5 y 10 dias de negociacion, con probabilidades calibradas.
- Estimacion de intervalo de precios al 80% de cobertura mediante regresion cuantilica.
- Entrenamiento especifico por accion (20 modelos independientes) y variante agrupada para las 20 acciones.
- Entrada tabular fija de 9 caracteristicas tecnicas; no acepta texto, imagenes ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni modo de razonamiento (thinking).
- Proporciona metadatos de fiabilidad (`trust`) calculados sobre el bloque de test por accion.

## Casos de uso

- Analisis exploratorio de series temporales financieras: sirve como referencia didactica para comparar un clasificador calibrado frente a una linea base de mayoria en datos diarios de la PSX, con particion temporal correcta y sin fuga de informacion.
- Prototipado de pipelines tabulares en produccion: el formato joblib y la estructura de diccionario permiten cargar el modelo en una API o en Streamlit y servir predicciones de direccion con metadatos de version y fecha de corte.
- Evaluacion de calibracion de probabilidades: al incluir `CalibratedClassifierCV` y log loss por horizonte, es util para estudiar como se comportan las probabilidades de un clasificador en un dominio casi aleatorio.
- Docencia y divulgacion sobre riesgo de sobreajuste: la tabla de log loss en entrenamiento, validacion y test (por ejemplo, XGBoost 0,6760 / 0,6926 / 0,6904 a 1 dia) ejemplifica el diagnostico de sobreajuste leve en modelos de arboles.
- Generacion de intervalos de incertidumbre: el modelo cuantilico de rango (cobertura 0,781-0,790 frente al objetivo 0,80) puede reutilizarse como plantilla para construir bandas de confianza en otras series financieras.
- Backtesting de estrategias de referencia: la app asociada y el repositorio de GitHub permiten reproducir el flujo completo (descarga via `psxdata`, ingenieria de caracteristicas, ajuste y evaluacion) sobre las 20 acciones cubiertas.

## Benchmarks y rendimiento

Resultados en el bloque de test, media sobre 20 acciones, estrategia por accion. Menor log loss es mejor; ROC-AUC de 0,500 equivale a azar.

| Horizonte | Modelo | Log loss | ROC-AUC | Precision |
|---|---|---|---|---|
| 1 dia | Regresion logistica | 0,6932 | 0,516 | 0,521 |
| 1 dia | Random forest | 0,6909 | 0,533 | 0,529 |
| 1 dia | XGBoost | 0,6904 | 0,536 | 0,530 |
| 1 dia | SVM | 0,6897 | 0,548 | 0,533 |
| 1 dia | Linea base mayoria | 0,6922 | 0,500 | 0,517 |
| 5 dias | Regresion logistica | 0,6941 | 0,508 | 0,523 |
| 5 dias | Random forest | 0,6936 | 0,504 | 0,512 |
| 5 dias | XGBoost | 0,6927 | 0,515 | 0,520 |
| 5 dias | SVM | 0,6923 | 0,520 | 0,520 |
| 5 dias | Linea base mayoria | 0,6939 | 0,500 | 0,497 |
| 10 dias | Regresion logistica | 0,6966 | 0,507 | 0,514 |
| 10 dias | Random forest | 0,6947 | 0,515 | 0,521 |
| 10 dias | XGBoost | 0,6935 | 0,519 | 0,517 |
| 10 dias | SVM | 0,6944 | 0,514 | 0,516 |
| 10 dias | Linea base mayoria | 0,6958 | 0,500 | 0,498 |

Intervalo de precios al 80% en el bloque de test:

| Horizonte | Metodo | Cobertura (objetivo 0,80) | Anchura |
|---|---|---|---|
| 1 dia | Gradient Boosting cuantilico | 0,787 | 4,77 pp |
| 1 dia | Linea base de volatilidad | 0,785 | 5,32 pp |
| 5 dias | Gradient Boosting cuantilico | 0,790 | 11,69 pp |
| 5 dias | Linea base de volatilidad | 0,757 | 12,01 pp |
| 10 dias | Gradient Boosting cuantilico | 0,781 | 16,69 pp |
| 10 dias | Linea base de volatilidad | 0,738 | 17,04 pp |

Comprobacion de sobreajuste (log loss medio, entrenamiento / validacion / test, 1 dia): regresion logistica 0,6878 / 0,6936 / 0,6932; random forest 0,6781 / 0,6922 / 0,6909; XGBoost 0,6760 / 0,6926 / 0,6904; SVM 0,6806 / 0,6926 / 0,6897.

## Requisitos de hardware

- Al ser modelos tabulares de scikit-learn y XGBoost, la inferencia se ejecuta en CPU; no requiere GPU.
- VRAM estimada: no aplica. El repositorio completo ocupa aproximadamente 0,1 GB en disco.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente para cargar los 21 ficheros joblib y servir predicciones.
- Cabe en cualquier equipo de consumo, incluidos portatiles de gama baja y entornos gratuitos de Streamlit Cloud (la app publica se sirve desde Streamlit).
- Opciones de despliegue: carga directa con `joblib.load` en Python 3.12, servicio HTTP con FastAPI o Flask, o la aplicacion Streamlit existente. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de clasificadores tabulares, la latencia esperada por prediccion es del orden de milisegundos en CPU.
- Requisito critico de compatibilidad: usar exactamente Python 3.12, scikit-learn 1.9.1, xgboost 3.4.1, numpy 2.5.5, pandas 3.1.1 y joblib 1.6.0, o los pickles pueden romperse.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (clasificadores tabulares sobre la PSX). Como referencias internas del propio proyecto, la linea base de mayoria y la linea base de volatilidad cumplen el papel de alternativas de comparacion, y los resultados muestran que el margen frente a ellas es minimo a 1 dia y queda dentro del ruido a 5 y 10 dias.

## Limitaciones y advertencias

- La direccion diaria de una accion es practicamente aleatoria: el propio autor advierte que los resultados son solo ligeramente mejores que adivinar y que nada de lo publicado es una garantia.
- No es asesoramiento financiero; no debe usarse como senal de trading.
- A 5 y 10 dias la mejora sobre la linea base de mayoria queda dentro del ruido (los intervalos bootstrap del 95% se solapan).
- Los festivos de la PSX no se gestionan al calcular las fechas objetivo.
- Los splits de acciones no estan ajustados.
- Los modelos estan congelados a 2026-11-13 y no se reentrenan dentro de la aplicacion.
- Las ventanas solapadas de 5 y 10 dias hacen que las filas de test no sean totalmente independientes.
- Las predicciones usan solo la ultima sesion completada; un precio en vivo es meramente informativo y nunca se introduce en el modelo.
- Licencia no disponible: no se especifican condiciones de uso comercial, por lo que su reutilizacion en produccion requiere contactar con el autor.
- Fuente de datos unica (`psxdata`) sin noticias ni otras fuentes; no hay datos personales.
- Riesgo de sobreajuste leve en los modelos de arboles, documentado en la tabla de entrenamiento/validacion/test.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al cubrir solo 20 acciones de un unico mercado, la generalizacion a otros mercados no esta validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hamza23102004/psx-compass-models
- Aplicacion Streamlit: https://psx-compass-dpqnkizvermtxugvkqvban.streamlit.app/
- Codigo en GitHub: https://github.com/ibti-21/PSX-Compass
