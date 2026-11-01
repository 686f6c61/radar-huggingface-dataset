# amandaodoo/casas-sklearn-entrenamiento-evaluacion

## Resumen

`amandaodoo/casas-sklearn-entrenamiento-evaluacion` es un repositorio de ejemplo educativo publicado en Hugging Face que contiene un modelo de regresión lineal entrenado con scikit-learn sobre un dataset sintético de 200 viviendas. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto de aprendizaje automático clásico orientado a la predicción tabular del precio de casas a partir de tres variables (`m2`, `balcon`, `ascensor`). Su relevancia es didáctica, ya que ilustra el flujo completo de entrenamiento, evaluación con datos no vistos y exportación del modelo en distintos formatos (pickle, skops, ONNX) para su publicación en el Hub.

El modelo se distribuye como un fichero `model.joblib` generado por el script `train.py`, junto con el dataset `casas.csv` y scripts auxiliares (`predict_hub.py`, `publicar_en_hub.py`). El repositorio tiene un tamaño declarado de 0.0 GB, lo que confirma que el artefacto es de escala muy reducida y apto para ejecutarse en cualquier equipo sin requisitos de hardware especiales.

Por su naturaleza, no compite con modelos generativos ni con sistemas de regresión de gran escala: su valor reside en ser una plantilla reproducible para quienes aprenden el ciclo de vida de un modelo de scikit-learn y su integración con el ecosistema de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (scikit-learn, `LinearRegression`) |
| Parametros totales | No disponible (modelo lineal con 3 variables de entrada; el número exacto de coeficientes no se especifica en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | No aplica; exportación en pickle, skops y ONNX |
| Idiomas soportados | Español (`es`) en la documentación; el modelo en sí opera sobre variables numéricas |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (joblib), con exportaciones a pickle, skops y ONNX |

## Arquitectura y entrenamiento

El modelo es una regresión lineal estándar de scikit-learn, sin capas ocultas ni mecanismos de atención. La entrada son tres características numéricas por vivienda (`m2`, `balcon`, `ascensor`) y la salida es el precio en miles de dólares estadounidenses. El entrenamiento se realiza con el script `train.py` sobre el fichero `casas.csv`, un dataset sintético de 200 registros creado para la Clase 10 de un curso, del cual se emplean 160 muestras para ajuste y 40 para evaluación en un split fijo.

No se documenta en la información disponible ningún proceso de regularización (Ridge, Lasso), validación cruzada, búsqueda de hiperparámetros, ni técnicas de aumento de datos. Tampoco se especifican métricas de entrenamiento ni de test en la model card. El repositorio incluye además carpetas de exportación que parten del modelo guardado, lo que sugiere un interés formativo por la portabilidad del artefacto más que por el rendimiento predictivo.

## Capacidades

- Predicción de precio de vivienda (regresión) a partir de tres variables numéricas: metros cuadrados, presencia de balcón y presencia de ascensor.
- Inferencia local mediante `joblib` una vez cargado el fichero `model.joblib`.
- Descarga y ejecución remota desde el Hub mediante el script `predict_hub.py`.
- Exportación del modelo a pickle, skops y ONNX para su uso en distintos entornos de producción.
- Reproducibilidad del pipeline completo de entrenamiento y evaluación con `train.py`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidades multilingües limitadas a la documentación en español; el modelo no procesa lenguaje natural.

## Casos de uso

- Docencia de machine learning clásico: sirve como ejemplo mínimo y ejecutable del ciclo entrenamiento-evaluación-exportación con scikit-learn, adecuado para introducir el flujo de trabajo en un aula o taller.
- Plantilla para publicar modelos tabulares en Hugging Face: el repositorio incluye `publicar_en_hub.py` y `predict_hub.py`, lo que permite replicar el proceso de subida y consumo remoto de un modelo joblib.
- Comparación de formatos de serialización: las carpetas de exportación a pickle, skops y ONNX permiten estudiar las ventajas de cada formato en cuanto a seguridad (skops frente a pickle), interoperabilidad (ONNX) y simplicidad.
- Pruebas de integración de extremo a extremo en CI/CD: un modelo de este tamaño puede usarse como caso de prueba para validar pipelines de empaquetado, versionado y despliegue de artefactos de ML.
- Estimación rápida de precios en prototipos de aplicaciones inmobiliarias: con tres variables de entrada, puede integrarse en un script o endpoint ligero para demostraciones internas, siempre con la advertencia de que el dataset es sintético.
- Benchmarking de infraestructura de inferencia: al ser un modelo trivial, sirve para medir el coste base (overhead) de un servidor de modelos antes de añadir cargas más pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo ocupa unos pocos kilobytes y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU de consumo, así como en entornos sin GPU (Raspberry Pi, contenedores ligeros, funciones serverless).
- Opciones de despliegue: Python con `scikit-learn` y `joblib`, ONNX Runtime para la exportación ONNX, o cualquier framework que cargue los formatos exportados.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, la latencia por predicción es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (regresión lineal educativa sobre dataset sintético de viviendas) publicados en el Hub.

## Limitaciones y advertencias

- El dataset `casas.csv` es sintético (200 registros), por lo que las predicciones no reflejan el mercado inmobiliario real y no deben usarse para decisiones económicas.
- Solo tres variables de entrada; no captura factores relevantes como ubicación, antigüedad, estado de conservación o renta media de la zona.
- No se documentan métricas de error (MAE, RMSE, R²) ni análisis de residuos, lo que impide evaluar su calidad predictiva a partir de la model card.
- Riesgo de sobreajuste no evaluado: no se indica si se aplicó validación cruzada ni regularización.
- El modelo no procesa texto ni lenguaje natural; las capacidades multilingües se limitan a la documentación.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de un ejemplo educativo conviene verificar la procedencia del dataset sintético antes de reutilizarlo en producción.
- El formato pickle puede suponer riesgos de seguridad al deserializar artefactos de origen no confiable; se recomienda preferir skops u ONNX en entornos productivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amandaodoo/casas-sklearn-entrenamiento-evaluacion
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
