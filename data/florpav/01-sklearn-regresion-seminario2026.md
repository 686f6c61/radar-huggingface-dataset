# florpav/01-sklearn-regresion-seminario2026

## Resumen

`florpav/01-sklearn-regresion-seminario2026` es un modelo de regresión lineal publicado en Hugging Face como ejemplo pedagógico para un seminario del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal: es un objeto `LinearRegression` de scikit-learn serializado con `joblib` que predice el precio de una vivienda a partir de tres variables tabulares (superficie en m², presencia de balcón y presencia de ascensor). Su función es mostrar, de forma reproducible, qué se publica cuando se comparte un modelo entrenado: pesos, bias, métricas y código de entrenamiento e inferencia.

El modelo se ha entrenado sobre un dataset sintético de 200 registros generados con una relación lineal conocida más ruido, lo que permite verificar que los coeficientes aprendidos recuperan aproximadamente los coeficientes reales del generador. Con 160 muestras de entrenamiento y 40 de evaluación, alcanza un MAE de 3,08 miles de US$ y un R² de 0,989 sobre el conjunto de test.

Es relevante ahora únicamente como material didáctico y como plantilla mínima de publicación de modelos tabulares en el Hub: ilustra el flujo completo (entrenamiento, serialización con `joblib`, model card y script de inferencia) sin dependencias de GPU ni infraestructura de inferencia de gran escala. No debe confundirse con un modelo de propósito general ni usarse fuera del ámbito educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (mínimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parámetros aprendidos (3 coeficientes + 1 intercepto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 3 variables) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en float64 de scikit-learn) |
| Idiomas soportados | es (documentación y model card en español) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serialización basada en pickle) |

## Arquitectura y entrenamiento

La arquitectura es un modelo lineal univariante múltiple: `precio = w1·m2 + w2·balcon + w3·ascensor + b`. No hay capas ocultas, atención ni mecanismo de secuencia; la predicción es una combinación lineal de tres características de entrada. Los coeficientes aprendidos son 1,503 para `m2`, 8,719 para `balcon` y 11,988 para `ascensor`, con un intercepto de 19,557. Estos valores quedan próximos a los coeficientes del generador de datos (1,5, 8 y 12, respectivamente, más un sesgo de 20), lo que confirma que el ajuste por mínimos cuadrados recupera la estructura del proceso sintético.

El entrenamiento se realizó con scikit-learn sobre 160 registros de un dataset sintético de 200, generado en `train.py` con una semilla fija (la misma de la Clase 10 del seminario) y ruido gaussiano aditivo. Las entradas se muestrean en los rangos `m2` ∈ [35, 120] y `balcon`, `ascensor` ∈ {0, 1}. No hay fases de RLHF, DPO ni ajuste fino posterior; el modelo se obtiene en un único paso de optimización cerrada. La partición 160/40 se emplea para evaluar la generalización sobre datos no vistos.

## Capacidades

- Predicción de una variable objetivo numérica continua (precio en miles de US$) a partir de tres variables tabulares.
- Regresión tabular supervisada con relación lineal explícita entre entradas y salida.
- Inferencia determinista y de coste computacional despreciable (una multiplicación matricial de 3 dimensiones).
- Reproducibilidad completa mediante `train.py` con semilla fija.
- Serialización y carga mediante `joblib` / `huggingface_hub.hf_hub_download`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No dispone de capacidades multilingües más allá de la documentación en español.

## Casos de uso

- Docencia de aprendizaje supervisado: el modelo sirve para explicar en clase la diferencia entre parámetros aprendidos y hiperparámetros, y para verificar que los coeficientes estimados coinciden con los del generador sintético.
- Plantilla de publicación de modelos tabulares en Hugging Face: ejemplifica la estructura mínima de un repositorio (pesos `joblib`, `train.py`, `predict.py`, `requirements.txt`, model card) que un alumno puede replicar con otros datasets.
- Práctica de evaluación de modelos: permite calcular MAE y R² sobre el conjunto de test y discutir la diferencia entre error absoluto medio y coeficiente de determinación en un caso controlado.
- Demostración de inferencia en producción de bajo coste: el script `predict.py` muestra cómo cargar un artefacto `joblib` y servir predicciones sin GPU, útil para ilustrar el despliegue de modelos tabulares ligeros.
- Ejercicio de análisis de limitaciones: el modelo permite discutir extrapolación fuera del rango [35, 120] m² y la incapacidad de capturar interacciones entre características.
- Ejemplo de advertencia de seguridad en serialización: sirve para explicar por qué `joblib`/pickle solo debe cargarse desde fuentes de confianza, dado que la deserialización puede ejecutar código arbitrario.
- Práctica de control de versiones de dependencias: ilustra la necesidad de fijar la versión de scikit-learn entre entrenamiento e inferencia para evitar incompatibilidades de deserialización.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 registros de test |
| R² | 0,989 | 40 registros de test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje y esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo en CPU; los pesos ocupan unos pocos kilobytes).
- GPU recomendadas: no aplica; no requiere GPU. Cualquier CPU convencional es suficiente.
- Cabe en cualquier equipo consumer: sí, en cualquier portátil o incluso en dispositivos de baja potencia.
- Opciones de despliegue: carga directa con `joblib` en Python, integración en scripts o APIs (Flask, FastAPI) y uso dentro de pipelines de scikit-learn. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (una multiplicación de 3×1) la latencia es del orden de microsegundos a milisegundos por predicción, dominada por el coste de carga del artefacto y del framework.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florpav/01-sklearn-regresion-seminario2026 | Regresión lineal (sklearn) | 4 | no aplica | MAE 3,08; R² 0,989 (test sintético) | MIT | Hugging Face |
| Modelos de regresión tabular de scikit-learn (p. ej. `Ridge`, `RandomForestRegressor`) | Regresión / ensemble | variable | no aplica | no disponible | BSD-3-Clause (scikit-learn) | PyPI |
| Modelos de gradient boosting (XGBoost, LightGBM) | Ensemble de árboles | variable | no aplica | no disponible | Apache 2.0 / MIT | PyPI |

No se dispone de comparativas publicadas con alternativas concretas en la información proporcionada; la comparación anterior es de categoría, no de resultados empíricos sobre el mismo dataset.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios de vivienda reales.
- Dominio restringido: solo es válido para viviendas de 35 a 120 m²; fuera de ese rango extrapola una recta sin garantía de acierto.
- Modelo aditivo: supone que cada característica aporta un incremento fijo y no captura interacciones (por ejemplo, que el ascensor valga más en edificios altos).
- Riesgo de seguridad en la carga: `joblib` usa pickle, por lo que solo deben cargarse archivos `.joblib` de fuentes de confianza, ya que la deserialización puede ejecutar código arbitrario.
- Compatibilidad de versiones: la versión de scikit-learn usada en inferencia debería coincidir con la de entrenamiento para evitar fallos de deserialización.
- Sin capacidades de lenguaje, razonamiento, código, visión ni agentes; no debe evaluarse con benchmarks de LLM.
- No se han documentado sesgos específicos más allá de los derivados del dataset sintético y de la simplicidad del modelo lineal.
- Licencia MIT: permite uso comercial, pero el carácter pedagógico y sintético del modelo desaconseja su uso en producción real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/florpav/01-sklearn-regresion-seminario2026
- Documentación de scikit-learn (`LinearRegression`): https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentación de `joblib`: https://joblib.readthedocs.io/
- Documentación de `huggingface_hub.hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
