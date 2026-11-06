# natisol87/Sklearn-regresion-SA

## Resumen

`natisol87/Sklearn-regresion-SA` es un modelo de regresión lineal tabular publicado en Hugging Face por el usuario natisol87 con fines exclusivamente educativos para el IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal: es un artefacto de scikit-learn serializado con `joblib` que implementa una regresión lineal por mínimos cuadrados ordinarios sobre tres variables de entrada (`m2`, `balcon`, `ascensor`) para predecir el precio de una vivienda en miles de dólares estadounidenses.

El modelo se entrenó sobre un dataset sintético de 200 registros generado con una semilla fija y una función lineal conocida (`precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`), lo que lo convierte en un ejemplo canónico de aprendizaje supervisado reproducible. Los pesos aprendidos (1,503 para `m2`, 8,719 para `balcon`, 11,988 para `ascensor`, bias de 19,557) recuperan con precisión los coeficientes generadores, lo que demuestra la corrección del pipeline de entrenamiento.

Su relevancia es pedagógica, no productiva: sirve para ilustrar qué se publica cuando se comparte un modelo entrenado (pesos, código de entrenamiento, script de inferencia, dependencias y model card) y para mostrar el ciclo completo de un problema de regresión con scikit-learn. No debe confundirse con un modelo fundacional ni usarse para valoración inmobiliaria real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (mínimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parámetros aprendidos (3 pesos + 1 bias) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (pesos en coma flotante de precisión nativa de NumPy) |
| Idiomas soportados | es (documentación y model card en español; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (serialización joblib/pickle) |

## Arquitectura y entrenamiento

El modelo es una regresión lineal múltiple sin regularización. La hipótesis es estrictamente aditiva y lineal: `precio = w1·m2 + w2·balcon + w3·ascensor + b`. El entrenamiento se realizó con `sklearn.linear_model.LinearRegression`, que resuelve el problema por mínimos cuadrados ordinarios (descomposición SVD o QR según la implementación interna de scikit-learn). No hay capas ocultas, funciones de activación, atención ni mecanismo de aprendizaje profundo.

Los datos de entrenamiento son sintéticos: 200 registros generados en `train.py` con semilla fija, de los cuales 160 se usaron para ajuste y 40 para evaluación. Las variables de entrada son `m2` (rango 35–120), `balcon` (binaria 0/1) y `ascensor` (binaria 0/1); la variable objetivo es `precio` en miles de US$. La función generadora incluye ruido gaussiano aditivo, lo que explica que los pesos aprendidos (1,503; 8,719; 11,988) se aproximen pero no igualen exactamente a los coeficientes teóricos (1,5; 8; 12). No se aplicó RLHF, DPO ni ninguna técnica de alineación, por tratarse de un modelo supervisado clásico.

## Capacidades

- Predicción de una variable objetivo continua (precio en miles de US$) a partir de tres features tabulares.
- Regresión lineal interpretable: los coeficientes son directamente legibles como contribuciones marginales en dólares.
- Inferencia determinista y de coste computacional despreciable (una multiplicación matricial de 1×3 por 3×1).
- Reproducibilidad completa: el script `train.py` permite regenerar el dataset y reentrenar el modelo.
- Serialización portable vía `joblib` para integración en pipelines de scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe inexistente en el sentido NLP: el modelo no procesa lenguaje; solo la documentación está en español.

## Casos de uso

- Docencia de aprendizaje supervisado: usar el par `train.py` + `model.joblib` para explicar en clase qué es un peso, un bias, un conjunto de test y una métrica como MAE o R², con números concretos y reproducibles.
- Demostración de publicación de modelos en Hugging Face: ilustra el formato mínimo de un repositorio de modelo (pesos, código, dependencias, model card) para alumnos que publican su primer artefacto.
- Ejercicio de evaluación de modelos: comparar el MAE (3,08) y el R² (0,989) sobre el split de test con variantes (regresión con regularización Ridge/Lasso, árboles de decisión) para mostrar sobreajuste y sesgo-varianza en un caso controlado.
- Práctica de ingeniería de features: analizar por qué un modelo aditivo no captura interacciones (por ejemplo, que el ascensor valga más en edificios altos) y proponer features derivadas.
- Test de pipelines de serialización: verificar en un entorno CI que `joblib.load` funciona con la versión declarada en `requirements.txt` y detectar incompatibilidades de versión de scikit-learn.
- Ejemplo de inferencia por lotes: integrar `predict.py` en un notebook o script para predecir precios de un lote de viviendas sintéticas y comparar con los valores generadores.
- Advertencia de seguridad en formación: usar el caso `joblib`/pickle para enseñar por qué no se deben cargar artefactos de fuentes no confiables, ya que la deserialización puede ejecutar código arbitrario.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 registros de test no vistos |
| R² | 0,989 | 40 registros de test no vistos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tendrían sentido para un modelo tabular de regresión.

## Requisitos de hardware

- VRAM: no aplica; el modelo ocupa unos pocos kilobytes en memoria RAM y no requiere GPU.
- GPU recomendadas: ninguna; la inferencia es una operación matricial trivial que se ejecuta en CPU en microsegundos.
- Cabe en cualquier hardware, incluidos Raspberry Pi, contenedores de 128 MB de RAM y entornos serverless.
- Opciones de despliegue: scripts Python con `joblib` + `scikit-learn`, notebooks Jupyter, APIs mínimas con FastAPI o Flask, o integración en pipelines de scikit-learn (`Pipeline`, `ColumnTransformer`).
- Latencia y throughput: no se han publicado mediciones; por la naturaleza del modelo (4 parámetros) la latencia es del orden de microsegundos por muestra en CPU y el throughput está limitado por el overhead de Python, no por el cómputo.
- Requisito crítico: la versión de scikit-learn en inferencia debe coincidir con la de entrenamiento para evitar incompatibilidades de deserialización.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `natisol87/Sklearn-regresion-SA` | Regresión lineal (sklearn) | 4 | no aplica | MIT | Hugging Face |
| Regresión Ridge / Lasso (sklearn) | Regresión lineal regularizada | variable según features | no aplica | BSD-3 (scikit-learn) | Incluido en scikit-learn |
| Gradient Boosting / Random Forest (sklearn) | Ensemble de árboles | variable | no aplica | BSD-3 (scikit-learn) | Incluido en scikit-learn |
| XGBoost / LightGBM | Gradient boosting | variable | no aplica | Apache 2.0 / MIT | Repositorios propios |

La comparación relevante no es con modelos fundacionales sino con alternativas de regresión tabular sobre el mismo dataset sintético: Ridge y Lasso añadirían regularización (innecesaria aquí, dado que solo hay tres features y 160 muestras), mientras que un gradient boosting capturaría interacciones no lineales a costa de perder interpretabilidad directa de los coeficientes. Para el objetivo pedagógico del repositorio, la regresión lineal es la elección adecuada.

## Limitaciones y advertencias

- Uso exclusivamente educativo: los datos son sintéticos y no representan precios inmobiliarios reales; no debe usarse para valoración de viviendas.
- Dominio restringido: solo conoce viviendas de 35 a 120 m²; fuera de ese rango extrapola la recta sin garantías de acierto.
- Modelo estrictamente aditivo: no captura interacciones entre features (por ejemplo, que el ascensor valga más en edificios altos) ni relaciones no lineales.
- Riesgo de seguridad en la carga: `joblib` usa pickle, por lo que cargar archivos `.joblib` de fuentes no confiables puede ejecutar código arbitrario.
- Dependencia de versión: la versión de scikit-learn en inferencia debe coincidir con la de entrenamiento para evitar fallos de deserialización.
- Sesgos: no se han documentado sesgos específicos más allá de los derivados del dataset sintético, que no incorpora variables demográficas ni geográficas.
- Alucinación: no aplica en el sentido de modelos generativos; el modelo no produce texto y su salida es una predicción numérica acotada por la linealidad.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; aun así, el uso comercial no está justificado por la naturaleza sintética de los datos.
- Sin mantenimiento ni soporte: 0 descargas y 0 likes en el momento de la consulta; repositorio de 0,0 GB y creado en 2026, sin comunidad asociada.

## Enlaces

- Hugging Face: https://huggingface.co/natisol87/Sklearn-regresion-SA
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- `LinearRegression` en scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentación de joblib: https://joblib.readthedocs.io/
- Tutorial de scikit-learn (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/scikit-learn-tutorial/
