# FerData/regresion-casas-sklearn

## Resumen

`FerData/regresion-casas-sklearn` es un modelo de regresion lineal multiple entrenado con scikit-learn que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`, binaria) y presencia de ascensor (`ascensor`, binaria). Lo publica el usuario FerData como ejemplo pedagogico para el IFTS N.º 18, con docencia de Cynthia M. Villagra, y esta pensado para ilustrar el ciclo completo de publicacion de un modelo supervisado en el Hugging Face Hub.

No es un modelo de lenguaje ni una red neuronal: es un artefacto serializado con `joblib` que contiene los coeficientes de una regresion por minimos cuadrados ordinarios. Su relevancia es exclusivamente didactica y de referencia para quienes se inician en el ecosistema `scikit-learn` y en el formato de model cards. No debe confundirse con un modelo generativo: no procesa texto libre ni mantiene conversaciones.

El repositorio ocupa 0,0 GB, no registra descargas ni likes en el momento de la consulta y se creo el 30 de octubre de 2026. La licencia es MIT y el unico idioma declarado es el espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 coeficientes aprendidos (3 pesos + 1 intercepto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante de 64 bits por defecto en scikit-learn) |
| Idiomas soportados | es (etiqueta declarada; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (serializacion basada en pickle) |

## Arquitectura y entrenamiento

El modelo implementa una regresion lineal multiple clasica: `precio = w1·m2 + w2·balcon + w3·ascensor + b`. Se entrena por minimos cuadrados ordinarios sobre un dataset sintetico de 200 registros generado en `train.py` con una semilla fija, del cual 160 se destinan a entrenamiento y 40 a evaluacion. La funcion generadora subyacente es `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`, de modo que los coeficientes aprendidos (1,503; 8,719; 11,988 y un intercepto de 19,557) quedan muy proximos a los valores teoricos usados para sintetizar los datos.

No hay fases de RLHF, DPO ni ajuste fino: el "entrenamiento" se reduce al ajuste analitico de los coeficientes. Las variables de entrada cubren `m2` en el rango de 35 a 120, y las dos binarias toman valores 0 o 1. No se documenta composicion adicional del dataset ni tecnicas de regularizacion (L1/L2), validacion cruzada o ingenieria de caracteristicas.

## Capacidades

- Prediccion de una variable objetivo continua (precio en miles de USD) a partir de tres caracteristicas tabulares.
- Inferencia por lotes mediante `modelo.predict(DataFrame)` sobre multiples filas simultaneamente.
- Serializacion y carga reproducible con `joblib` y descarga directa desde el Hub con `hf_hub_download`.
- Reproducibilidad completa del entrenamiento a partir de `train.py` y `requirements.txt`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales: la etiqueta `es` es descriptiva de la documentacion, no del modelo.
- No dispone de modo thinking, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de regresion lineal: sirve como ejemplo minimo y reproducible para explicar coeficientes, intercepto y evaluacion con MAE y R² en un curso introductorio de machine learning.
- Plantilla de model card: el README ejemplifica como documentar parametros aprendidos, metricas de evaluacion y limitaciones, y puede reutilizarse como esqueleto para publicar otros modelos tabulares.
- Prueba de pipelines de publicacion en el Hub: al ocupar 0,0 GB y depender solo de scikit-learn y joblib, permite validar flujos de subida, descarga y carga en CI sin coste de almacenamiento.
- Validacion de entornos reproducibles: util para comprobar que la version de scikit-learn del entorno de inferencia coincide con la de entrenamiento y que la carga del `.joblib` funciona.
- Demo de estimacion de precios en notebooks: con un `DataFrame` de tres columnas se obtiene una prediccion inmediata, adecuada para talleres y tutoriales.
- Referencia de comparacion en pruebas unitarias: al tener coeficientes conocidos y un error acotado (MAE de 3,08), puede usarse como caso de prueba controlado en frameworks de serving tabular.

## Benchmarks y rendimiento

Evaluacion sobre 40 registros no vistos durante el entrenamiento, segun la model card:

| Metrica | Resultado |
|---|---|
| MAE | 3,08 miles de USD |
| R² | 0,989 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el artefacto cabe en memoria principal (el repositorio ocupa 0,0 GB).
- GPU recomendadas: no aplica; la inferencia es puramente CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: script Python con `joblib` y `pandas`, o servicio HTTP minimo (FastAPI, Flask) que cargue el `.joblib` al arrancar.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (tres multiplicaciones y una suma por prediccion) la latencia es del orden de microsegundos por fila en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FerData/regresion-casas-sklearn` | 4 coeficientes | no aplica | MAE 3,08; R² 0,989 (datos sinteticos) | MIT | Hugging Face Hub |
| Regresion ridge o lasso sobre el mismo dataset | 4 coeficientes + hiperparametro de regularizacion | no aplica | no disponible | segun implementacion | scikit-learn |
| Gradient boosting (p. ej. `HistGradientBoostingRegressor`) sobre el mismo dataset | variable | no aplica | no disponible | segun implementacion | scikit-learn |

No se dispone de comparativas publicadas con alternativas en la informacion proporcionada; las filas anteriores son categorias de modelos equivalentes, no resultados medidos.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sinteticos y no representan precios de vivienda reales.
- Rango de validez restringido: solo conoce superficies de 35 a 120 m²; fuera de ese intervalo extrapola linealmente sin garantia de acierto.
- Modelo aditivo sin interacciones: asume que cada caracteristica aporta un incremento fijo y no captura efectos combinados (por ejemplo, el valor del ascensor en funcion de la altura del edificio).
- Riesgo de seguridad al cargar `joblib`: la serializacion usa pickle y puede ejecutar codigo arbitrario; solo deben cargarse archivos de fuentes de confianza.
- Sensibilidad a la version de scikit-learn: la version usada para cargar deberia coincidir con la de entrenamiento para evitar incompatibilidades.
- Sin soporte de lenguaje natural: no es un modelo conversacional ni generativo; la etiqueta de idioma `es` no implica capacidades linguisticas.
- Sin datos sobre sesgos: la model card no documenta analisis de sesgo ni de equidad, aunque el caracter sintetico del dataset limita su aplicabilidad a dominios reales.
- Sin garantias de produccion: no se han publicado pruebas de robustez, deriva de datos ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FerData/regresion-casas-sklearn
- Documentacion de scikit-learn sobre regresion lineal: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de `hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
- Articulos, papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
