# ericc12/01-sklearn-regresion

## Resumen

`ericc12/01-sklearn-regresion` es un modelo de regresión lineal entrenado con scikit-learn que predice el precio de una vivienda, en miles de dólares estadounidenses, a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor. Lo publica el usuario ericc12 como ejemplo pedagógico para el IFTS N.º 18, con la docente Cynthia M. Villagra como responsable del material, y sirve para ilustrar el ciclo completo de publicación de un modelo supervisado en Hugging Face.

No es un modelo de lenguaje ni una red neuronal: es un artefacto de `sklearn.linear_model.LinearRegression` serializado con `joblib`, con cuatro parámetros aprendidos (tres pesos y un término independiente). Su interés no está en el rendimiento bruto, sino en mostrar qué se sube al Hub cuando se comparte un modelo clásico de machine learning tabular: pesos, script de entrenamiento, script de inferencia y métricas.

El modelo se entrenó sobre un dataset sintético de 200 registros generados con una relación lineal conocida más ruido, y alcanza un MAE de 3,08 miles de US$ y un R² de 0,989 sobre 40 registros de evaluación. Es relevante únicamente como material didáctico y como referencia mínima de estructura de repositorio, no como componente para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal por mínimos cuadrados ordinarios (`sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parámetros aprendidos (3 pesos + 1 intercepto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en coma flotante de precisión nativa de scikit-learn) |
| Idiomas soportados | es (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serialización basada en pickle) |

## Arquitectura y entrenamiento

El modelo es una regresión lineal múltiple sin regularización, resuelta por mínimos cuadrados ordinarios mediante `LinearRegression` de scikit-learn. La función aprendida es `precio = w1·m2 + w2·balcon + w3·ascensor + b`, con pesos de 1,503 para `m2`, 8,719 para `balcon` y 11,988 para `ascensor`, y un intercepto de 19,557. No hay capas, atención, embeddings ni mecanismo de decodificación: es un ajuste lineal cerrado sobre tres variables de entrada.

Los datos de entrenamiento son sintéticos y se generan en `train.py` con una semilla fija, a partir de la fórmula `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. El conjunto consta de 200 registros, con `m2` en el rango de 35 a 120 y las variables `balcon` y `ascensor` binarias; se reservan 160 registros para entrenamiento y 40 para evaluación. No hay RLHF, DPO, ajuste fino ni aumento de datos: el proceso es un `fit` único sobre el conjunto de entrenamiento. Los pesos recuperados quedan próximos a los coeficientes generadores, lo que confirma que el ajuste converge correctamente sobre la señal lineal subyacente.

## Capacidades

- Predicción de una variable objetivo continua (precio en miles de US$) a partir de tres características tabulares numéricas y binarias.
- Inferencia por lotes mediante `predict` sobre un `DataFrame` de pandas con las columnas `m2`, `balcon` y `ascensor`.
- Reproducibilidad completa del entrenamiento a partir del script `train.py` incluido en el repositorio.
- Integración directa en pipelines de scikit-learn y en código Python que use `joblib`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües más allá de la documentación en castellano.
- No dispone de modo de razonamiento (thinking), visión, audio ni generación de texto.

## Casos de uso

- Docencia de regresión lineal: el modelo sirve como ejemplo ejecutable en clase para mostrar qué es un peso, un intercepto y una métrica de error, cargando `model.joblib` y comparando predicciones con la fórmula generadora.
- Demostración de publicación de modelos en Hugging Face: el repositorio ejemplifica la estructura mínima de una model card, un script de entrenamiento, un script de inferencia y un fichero de dependencias, útil en talleres de MLOps introductorio.
- Prueba de integración de `joblib` en un pipeline de CI: al ser un artefacto pequeño y de carga rápida, permite validar flujos de descarga con `hf_hub_download`, carga del modelo y ejecución de una predicción en tests automatizados.
- Ejercicio de evaluación de modelos: los 40 registros de test permiten reproducir el cálculo de MAE y R² y contrastarlo con los valores publicados (3,08 y 0,989).
- Ilustración de limitaciones de extrapolación: con entradas fuera del rango de 35 a 120 m², el modelo extrapola la recta y el ejercicio sirve para discutir por qué un modelo lineal no captura relaciones no lineales ni interacciones entre variables.
- Referencia de comparación en experimentos didácticos: como línea base trivial frente a modelos más complejos (árboles, gradient boosting) sobre el mismo dataset sintético, para medir cuánto aporta la no linealidad.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 registros de test |
| R² | 0,989 | 40 registros de test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y no aplican a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto ocupa 0,0 GB según el tamaño del repositorio y reside en memoria principal.
- GPU recomendadas: no requiere GPU; la inferencia se ejecuta en CPU.
- Cabe en cualquier GPU de consumo y en cualquier CPU moderna; también en entornos sin aceleración, como contenedores ligeros o notebooks gratuitos.
- Opciones de despliegue: carga directa con `joblib` en Python, servicio HTTP mínimo con FastAPI o Flask, o integración en un pipeline de scikit-learn. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (una multiplicación de tres features y una suma) la latencia es del orden de microsegundos a milisegundos por predicción en CPU, dominada por el overhead de Python y pandas más que por el cálculo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericc12/01-sklearn-regresion | 4 (3 pesos + intercepto) | no aplica | MAE 3,08; R² 0,989 en test sintético | MIT | Hugging Face |
| Regresión Ridge / Lasso (scikit-learn) | Según número de features | no aplica | No disponible para este dataset | BSD-3-Clause (scikit-learn) | PyPI |
| Gradient boosting (scikit-learn) | Según número de árboles | no aplica | No disponible para este dataset | BSD-3-Clause (scikit-learn) | PyPI |
| XGBoost / LightGBM | Según configuración | no aplica | No disponible para este dataset | Apache 2.0 / MIT | PyPI |

La comparación relevante es frente a otros estimadores tabulares sobre el mismo dataset sintético, no frente a modelos de lenguaje. No se dispone de resultados publicados de esos alternativas sobre este conjunto concreto, por lo que la comparación numérica queda como no disponible.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios inmobiliarios reales; el modelo no debe usarse para tasaciones.
- Rango de validez restringido: solo conoce superficies de 35 a 120 m²; fuera de ese intervalo extrapola linealmente sin garantía de acierto.
- Modelo puramente aditivo: asume que cada característica suma un importe fijo y no captura interacciones, como que el ascensor valga más en edificios altos.
- Riesgo de seguridad en la carga: `joblib` se apoya en pickle y la deserialización puede ejecutar código arbitrario; solo deben cargarse ficheros `.joblib` de fuentes de confianza.
- Dependencia de versión: la versión de scikit-learn usada en la carga debería coincidir con la del entrenamiento para evitar incompatibilidades de deserialización.
- Sin sesgos demográficos evaluados ni auditoría de equidad, al no manejar datos personales ni variables sensibles.
- Riesgo de alucinación no aplicable: el modelo no genera texto; el riesgo equivalente es la predicción errónea por extrapolación o por entradas fuera de distribución.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el contenido sintético y el carácter didáctico hacen desaconsejable cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericc12/01-sklearn-regresion
- Documentación de `LinearRegression` de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentación de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/en/stable/persistence.html
- Documentación de `hf_hub_download` de huggingface_hub: https://huggingface.co/docs/huggingface_hub/guides/download
