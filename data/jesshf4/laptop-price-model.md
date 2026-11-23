# JessHF4/laptop-price-model

## Resumen

`JessHF4/laptop-price-model` es un modelo de regresión tabular publicado en Hugging Face por el usuario JessHF4 que estima el precio de un portátil a partir de seis especificaciones: marca, velocidad del procesador, tamaño de RAM, capacidad de almacenamiento, tamaño de pantalla y peso. No es un modelo de lenguaje ni una red neuronal: se trata de una regresión Ridge entrenada con scikit-learn 1.6.1, serializada con joblib y etiquetada con el pipeline `tabular-regression`. Su origen es académico: constituye el proyecto final de la asignatura MN1135 Business Data Science del programa de estudios de Management, curso impar 2026/2027.

El modelo se seleccionó entre cinco alternativas (regresión lineal, árbol de decisión, Random Forest y SVR) mediante validación cruzada con Grid Search de 5 pliegues, y el mejor hiperparámetro encontrado fue `alpha = 0.1`. El preprocesado incluye One-Hot Encoding de la marca con `drop_first=True` y estandarización de las cinco variables numéricas con `StandardScaler`, de modo que el estimador final recibe 9 columnas cuyo orden exacto se guarda en `feature_names.joblib`.

Su relevancia práctica es limitada pero ilustrativa: sobre un conjunto de prueba de 200 filas alcanza un R² de 0.9996 y un RMSE de 179.70, cifras que el propio autor atribuye a que la capacidad de almacenamiento está casi perfectamente correlacionada con el precio (r = 0.998) en los datos de entrenamiento. El modelo funciona, en la práctica, como un conversor de almacenamiento a precio y no como un tasador realista de portátiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión Ridge (modelo lineal regularizado), pipeline de scikit-learn con One-Hot Encoding y StandardScaler |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes depende de las 9 columnas de entrada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (pesos en joblib, sin cuantización) |
| Idiomas soportados | no disponible (no procesa texto libre; solo etiquetas categóricas de marca) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_laptop_price.joblib`, `scaler.joblib`, `feature_names.joblib`, `metadata.json`) |

## Arquitectura y entrenamiento

La arquitectura es una regresión Ridge, es decir, una regresión lineal con penalización L2 sobre los coeficientes. El pipeline completo consta de tres piezas serializadas: el codificador One-Hot para `Brand` con `drop_first=True`, un `StandardScaler` ajustado sobre las cinco variables numéricas (`Processor_Speed`, `RAM_Size`, `Storage_Capacity`, `Screen_Size`, `Weight`) y el estimador Ridge con `alpha = 0.1`. Tras el preprocesado, la entrada al modelo tiene 9 columnas.

El entrenamiento se realizó sobre el dataset público "Laptop Price Prediction" de Kaggle (1.000 filas, 6 variables de entrada y 1 objetivo `Price`), con una partición 80/20 (800 filas de entrenamiento, 200 de prueba) y `random_state=42`. La selección del algoritmo y de los hiperparámetros se hizo con Grid Search y validación cruzada de 5 pliegues comparando regresión lineal, árbol de decisión, Random Forest y SVR. No hay datos sobre número de tokens, composición del dataset ni técnicas de RLHF/DPO, ya que no es un modelo generativo. La innovación técnica destacable es nula más allá del pipeline estándar de scikit-learn; el valor del artefacto es su reproducibilidad y su documentación de limitaciones.

## Capacidades

- Predicción de precio continuo de portátiles a partir de seis especificaciones tabulares.
- Codificación automática de la variable categórica `Brand` (Acer, Asus, Dell, HP, Lenovo) mediante One-Hot Encoding.
- Estandarización interna de variables numéricas, gestionada por el `scaler.joblib` incluido en el repositorio.
- Inferencia por lotes: acepta un `DataFrame` de pandas con múltiples filas y devuelve un vector de predicciones.
- Metadatos de soporte (`metadata.json`) que indican si el modelo requiere escalado y qué columnas son numéricas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües: solo maneja las etiquetas de marca en inglés presentes en el dataset.

## Casos de uso

- Prototipado docente de pipelines de regresión: sirve como ejemplo completo de preprocesado, selección de modelo, Grid Search y serialización con joblib para cursos de ciencia de datos.
- Benchmarking interno de precios de portátiles: dado un catálogo con las seis variables del dataset, el modelo produce una estimación de referencia que un analista puede comparar con el precio real de mercado.
- Validación de pipelines de datos tabulares: al requerir un orden exacto de columnas y un escalado concreto, es útil para probar la robustez de un ETL antes de conectar un modelo más complejo.
- Detección de anomalías de precio en catálogos sintéticos o de laboratorio: desviaciones grandes respecto a la predicción pueden señalar errores de captura en las especificaciones.
- Generación de datos sintéticos de precio para pruebas de software: permite crear filas de prueba con precios plausibles dentro de los rangos de entrenamiento (almacenamiento de 256, 512 o 1000 GB; RAM de 4, 8, 16 o 32 GB).
- Enseñanza de interpretación de métricas: el contraste entre un R² de 0.9996 y un RMSE de 179.70 es un caso práctico para explicar por qué un R² alto no implica un modelo útil cuando hay una correlación espuria dominante.
- Integración en un servicio HTTP ligero: al pesar prácticamente nada y cargarse con joblib, puede exponerse con FastAPI o Flask en un contenedor mínimo para demos internas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de prueba (200 portátiles):

| Metrica | Valor |
|---|---|
| RMSE (metrica principal) | 179.70 |
| MAE | 146.23 |
| MSE | 32.291,43 |
| R² | 0.9996 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor no documenta la moneda ni las unidades del objetivo `Price`.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU (portátiles, contenedores, funciones serverless).
- Memoria RAM necesaria: del orden de decenas de megabytes, incluyendo pandas y scikit-learn.
- Opciones de despliegue: script de Python con `joblib` y `huggingface_hub`, servicio HTTP con FastAPI o Flask, trabajos por lotes con pandas, o integración en notebooks. No aplica vLLM, llama.cpp, Ollama ni TGI, que están pensados para modelos generativos.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (regresión lineal sobre 9 características) la inferencia es del orden de microsegundos por fila en CPU, aunque esta cifra no está documentada por el autor.
- Dependencia crítica: requiere una versión compatible de scikit-learn (el autor indica consultar `requirements.txt`; el modelo se entrenó con la 1.6.1).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JessHF4/laptop-price-model` | Regresión Ridge tabular | Lineal (9 características) | no aplica | MIT | Hugging Face, 0 descargas |
| Regresión lineal sin regularización | Modelo lineal tabular | Lineal | no aplica | no disponible | Implementación estándar en scikit-learn |
| Random Forest sobre el mismo dataset | Ensemble de árboles tabular | no disponible | no aplica | no disponible | Implementación estándar en scikit-learn |
| SVR sobre el mismo dataset | Support Vector Regression | no disponible | no aplica | no disponible | Implementación estándar en scikit-learn |

No se dispone de resultados de benchmark de las alternativas en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellas más allá de que el autor seleccionó Ridge como mejor opción en su Grid Search.

## Limitaciones y advertencias

- Correlación espuria dominante: `Storage_Capacity` correlaciona con `Price` a r = 0.998 en los datos de entrenamiento, de modo que el modelo es esencialmente un conversor de almacenamiento a precio; el resto de especificaciones apenas influye.
- Variables ausentes relevantes: no se incluyen generación de CPU, GPU, calidad de pantalla, posicionamiento de marca ni fecha de lanzamiento, factores que determinan el precio real de un portátil.
- Dominio restringido: solo es válido dentro de los rangos de entrenamiento (tres capacidades de almacenamiento, cuatro tamaños de RAM, pantallas de 11 a 17 pulgadas, pesos de 2 a 5). No debe usarse fuera de esos rangos.
- Sin dimensión temporal: el dataset es una instantánea única de 1.000 filas sin fechas, por lo que no captura la evolución de precios.
- Unidades y moneda no documentadas: el autor no especifica la moneda ni las unidades del objetivo, lo que impide interpretar el RMSE en términos absolutos.
- Asociación, no causalidad: el modelo no conoce costes ni márgenes; debe usarse como ayuda de benchmarking, nunca como herramienta de fijación automática de precios.
- Validación incompleta: los errores solo se comprobaron por capacidad de almacenamiento; no hay comprobación por marca ni por segmento de cliente.
- Riesgo de sobreajuste aparente: un R² de 0.9996 con un RMSE de 179.70 sugiere que las métricas están dominadas por la estructura artificial del dataset; no debe extrapolarse a datos reales de mercado.
- Dependencia de versión: cargar los artefactos con una versión incompatible de scikit-learn puede producir errores o predicciones incorrectas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad del uso recae en el integrador.
- Sin sesgos documentados por marca ni por segmento; el autor no realizó análisis de equidad, por lo que se desconoce si el modelo penaliza sistemáticamente alguna marca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JessHF4/laptop-price-model
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/mrsimple07/laptoppriceprediction
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de huggingface_hub: https://huggingface.co/docs/huggingface_hub
