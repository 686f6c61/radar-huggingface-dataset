# lagabyok/01-sklearn-regresion

## Resumen

`lagabyok/01-sklearn-regresion` es un modelo de regresión lineal publicado como ejemplo pedagógico, no un modelo de lenguaje. Lo desarrolla el usuario lagabyok en el contexto del IFTS N.º 18 (docente Cynthia M. Villagra) para ilustrar el flujo completo de un proyecto de aprendizaje automático supervisado: generación de datos, entrenamiento, evaluación y publicación en el Hub de Hugging Face. Predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor.

Técnicamente es un `LinearRegression` de scikit-learn ajustado por mínimos cuadrados ordinarios sobre un conjunto sintético de 200 registros (160 de entrenamiento y 40 de evaluación), con tres características de entrada y una salida continua. El artefacto publicado es un único archivo `model.joblib` que contiene los coeficientes y el término independiente, junto con los scripts `train.py` y `predict.py` para reproducir el entrenamiento y la inferencia. No hay arquitectura neuronal, tokenizador ni ventana de contexto: la noción de "contexto" no aplica a este tipo de modelo.

Su relevancia es exclusivamente didáctica. Sirve para mostrar qué se publica realmente cuando se comparte un modelo entrenado (pesos serializados, métricas, datos de entrenamiento y limitaciones) y para practicar la carga de artefactos desde el Hub con `hf_hub_download`. No debe confundirse con un modelo de propósito general ni utilizarse para estimaciones inmobiliarias reales, ya que los datos son sintéticos y la relación aprendida es lineal por construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (mínimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parámetros aprendidos (3 coeficientes + 1 intercepto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto) |
| Tipos de cuantizacion | no disponible (no aplica; los coeficientes se almacenan en punto flotante estándar de NumPy) |
| Idiomas soportados | es (documentación y model card en español; el modelo en sí no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serialización basada en pickle) |
| Entradas | `m2` (35–120), `balcon` (0/1), `ascensor` (0/1) |
| Salida | `precio` en miles de US$ (variable continua) |
| Pipeline del Hub | `tabular-regression` |
| Biblioteca | scikit-learn |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es una regresión lineal múltiple sin regularización. La hipótesis es `precio = w1·m2 + w2·balcon + w3·ascensor + b`, ajustada por mínimos cuadrados ordinarios mediante `LinearRegression` de scikit-learn. Los coeficientes aprendidos son 1,503 para `m2`, 8,719 para `balcon` y 11,988 para `ascensor`, con un intercepto de 19,557. Estos valores quedan próximos a los usados para generar los datos sintéticos (1,5; 8; 12 y 20 respectivamente), lo que confirma que el ajuste recupera la relación subyacente dentro del ruido introducido.

Los datos de entrenamiento son sintéticos y se generan en `train.py` con una semilla fija, lo que hace el experimento reproducible. El conjunto consta de 200 registros, de los que 160 se destinan a entrenamiento y 40 a evaluación. La variable objetivo se construye como `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. No hay fases de ajuste fino, RLHF, DPO ni entrenamiento por refuerzo: el procedimiento es un único ajuste cerrado por álgebra lineal. La innovación técnica, en este caso, es puramente didáctica: separar entrenamiento y evaluación, reportar métricas sobre datos no vistos y documentar los parámetros aprendidos junto a su interpretación.

## Capacidades

- Predicción de una variable numérica continua (precio en miles de US$) a partir de tres características tabulares.
- Inferencia por lotes mediante `modelo.predict(DataFrame)`, aceptando múltiples filas en una sola llamada.
- Interpretabilidad directa de los coeficientes: cada peso indica la contribución marginal fija de su característica al precio.
- Reproducibilidad completa del entrenamiento a partir de `train.py` y la semilla documentada.
- Carga desde el Hub mediante `hf_hub_download` y `joblib.load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas simbólicas, visión ni audio.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje; el etiquetado `es` corresponde al idioma de la documentación.

## Casos de uso

- Docencia de aprendizaje supervisado: usar el repositorio como plantilla para que el alumnado reproduzca el ciclo completo (generación de datos, ajuste, evaluación y publicación) y compare los coeficientes aprendidos con los generadores.
- Demostración de publicación de modelos en el Hub: ilustra qué artefactos acompañan a un modelo entrenado (`model.joblib`, scripts, requirements, model card) y cómo descargarlos con `hf_hub_download`.
- Práctica de evaluación con métricas de regresión: el par MAE/R² sobre 40 muestras reservadas sirve para ejercitar la interpretación de métricas y la detección de sobreajuste en datasets pequeños.
- Ejemplo de inferencia por lotes en pipelines de datos: integrar `model.joblib` en un script que lea un CSV de viviendas y genere predicciones en columna, útil para enseñar el paso de notebook a script de producción.
- Comparación de algoritmos: usar el mismo dataset sintético para contrastar regresión lineal con alternativas (árboles, ridge, gradient boosting) y discutir cuándo la linealidad es una hipótesis razonable.
- Ilustración de riesgos de seguridad en serialización: el propio modelo sirve para explicar por qué `joblib`/pickle puede ejecutar código al cargar y por qué conviene verificar el origen de los artefactos.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 muestras de evaluación |
| R² | 0,989 | 40 muestras de evaluación |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto `model.joblib` contiene únicamente cuatro valores en punto flotante y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU. La inferencia se ejecuta en CPU en microsegundos por muestra.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; también en entornos sin aceleración (por ejemplo, contenedores ligeros o Raspberry Pi).
- Opciones de despliegue: script Python con `joblib` y `pandas`, endpoint con FastAPI o Flask, o integración en pipelines de scikit-learn. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (una multiplicación matricial de 3×1 por muestra) la latencia es despreciable y el throughput queda limitado por la E/S de datos, no por el cálculo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lagabyok/01-sklearn-regresion` | Regresión lineal tabular | 4 | no aplica | MIT | Hugging Face Hub |
| `scikit-learn` `LinearRegression` (referencia de la biblioteca) | Regresión lineal tabular | según dataset | no aplica | BSD-3-Clause | PyPI |
| `scikit-learn` `Ridge` / `Lasso` | Regresión lineal regularizada | según dataset | no aplica | BSD-3-Clause | PyPI |
| Modelos de regresión tabular en el Hub (por ejemplo, `TabPFN`, `skops` con gradient boosting) | Tabular / few-shot | variable | no aplica | variable | Hugging Face Hub |

No se dispone de una comparativa de rendimiento publicada frente a alternativas sobre el mismo dataset sintético; cualquier comparación numérica requeriría reentrenar las alternativas con la misma semilla y partición.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios inmobiliarios reales; las predicciones no deben usarse para decisiones de negocio.
- Rango de validez restringido: solo conoce viviendas de 35 a 120 m². Fuera de ese intervalo extrapola la recta sin garantías de acierto.
- Supuesto de linealidad y aditividad: cada característica suma un importe fijo; no captura interacciones (por ejemplo, que el ascensor valga más en edificios altos) ni efectos no lineales.
- Riesgo de seguridad en la carga: `joblib` usa pickle y puede ejecutar código al deserializar. Cargar únicamente archivos `.joblib` de fuentes de confianza.
- Compatibilidad de versiones: la versión de scikit-learn usada en la carga debería coincidir con la del entrenamiento para evitar avisos o fallos de deserialización.
- Sesgos conocidos: no se han documentado sesgos específicos más allá de los derivados de un dataset sintético generado con una fórmula fija.
- Riesgo de alucinación: no aplica; el modelo no genera texto.
- Licencia MIT: permite uso comercial y modificación, pero al ser un ejemplo pedagógico no se recomienda su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lagabyok/01-sklearn-regresion
- Documentación de scikit-learn sobre `LinearRegression`: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentación de `joblib` sobre persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentación de `huggingface_hub` para descarga de archivos: https://huggingface.co/docs/huggingface_hub/guides/download
- Documentación de Hugging Face sobre modelos tabulares: https://huggingface.co/docs/hub/models-tabular
