# lagabyok/03-keras-regresion

## Resumen

`lagabyok/03-keras-regresion` es un modelo de regresion tabular de caracter educativo, publicado por el usuario lagabyok en el marco del Seminario de Actualizacion del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje: es un regresor lineal minimo implementado en Keras 3 que predice el precio de una vivienda, en miles de dolares estadounidenses, a partir de tres variables de entrada: superficie en metros cuadrados (`m2`), presencia de balcon (`balcon`, 0 o 1) y presencia de ascensor (`ascensor`, 0 o 1).

El modelo resuelve un problema de regresion supervisada sobre datos tabulares y existe como pieza didactica para mostrar el ciclo completo de entrenamiento y exportacion en el formato nativo `.keras`. Su interes no esta en el rendimiento predictivo sobre datos reales, sino en ilustrar como una capa de normalizacion puede integrarse dentro del propio artefacto del modelo, de modo que el usuario no tenga que normalizar manualmente en inferencia, a diferencia del equivalente en PyTorch.

La arquitectura es una `Sequential` con una capa `Normalization` seguida de una capa `Dense(1)`, lo que se traduce en tres pesos y un sesgo. Se entreno sobre 200 registros sinteticos (160 de entrenamiento, 40 de evaluacion) durante 200 epocas con SGD y perdida MSE, alcanzando un MAE de 3,10 miles de US$ y un R² de 0,989 en el conjunto de evaluacion. La licencia es MIT y el unico idioma declarado es el espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal secuencial de Keras: `Normalization` + `Dense(1)` |
| Parametros totales | 3 pesos + 1 sesgo (capa `Dense(1)`); la capa `Normalization` almacena ademas media y desvio aprendidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (espanol) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3, incluye arquitectura, pesos, normalizacion y configuracion de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es una red `Sequential` de dos capas. La primera es una capa `Normalization` que aprende la media y el desvio tipico de las entradas de entrenamiento mediante `adapt()`; al formar parte del grafo del modelo, esos estadisticos se serializan dentro de `model.keras`. La segunda es una capa `Dense(1)` sin activacion no lineal, lo que convierte al conjunto en una regresion lineal multiple sobre las tres variables de entrada estandarizadas. El resultado son tres pesos y un sesgo efectivos.

El entrenamiento se realizo sobre un dataset sintetico generado en `train.py` con semilla fija, compuesto por 200 registros (160 para entrenamiento, 40 para evaluacion). Las variables de entrada se distribuyen en `m2` entre 35 y 120, y `balcon` y `ascensor` como binarias. La variable objetivo es `precio` en miles de US$. Se uso error cuadratico medio como funcion de perdida, optimizador SGD con tasa de aprendizaje 0,1 y 200 epocas. La biblioteca es Keras 3 con backend PyTorch, aunque el autor indica compatibilidad con TensorFlow. No consta uso de RLHF, DPO ni tecnicas de regularizacion adicionales.

## Capacidades

- Regresion tabular: predice un valor continuo (`precio` en miles de US$) a partir de tres entradas numericas.
- Normalizacion integrada: la capa `Normalization` se aplica automaticamente en inferencia, sin necesidad de preprocesar las entradas manualmente.
- Portabilidad de backend: funciona con Keras 3 sobre PyTorch o TensorFlow, segun la variable de entorno `KERAS_BACKEND`.
- Serializacion completa: el archivo `.keras` contiene arquitectura, pesos, normalizacion y configuracion de entrenamiento en un unico artefacto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de regresion con Keras: el modelo sirve como ejemplo minimo y reproducible para explicar el flujo `adapt()` → `fit()` → `save()` → `load_model()` en un curso introductorio de machine learning.
- Comparacion de frameworks: al existir equivalentes en scikit-learn y PyTorch del mismo problema, permite contrastar como cada ecosistema gestiona la normalizacion (integrada en el artefacto en Keras, separada en PyTorch).
- Prueba de integracion de Keras 3: util para verificar que un entorno con Keras 3 y backend PyTorch o TensorFlow carga correctamente el formato `.keras` antes de abordar modelos mayores.
- Ejemplo de pipeline de inferencia tabular: el script `predict.py` demuestra como cargar el modelo y pasar un array `float32` con el orden de columnas correcto, patron reutilizable en servicios de scoring simples.
- Material de evaluacion de metricas: con MAE y R² publicados sobre un split fijo, sirve para practicar la interpretacion de metricas de regresion en un conjunto controlado.
- Referencia de licencia permisiva: al estar bajo MIT, puede copiarse y modificarse libremente en materiales de formacion internos o repositorios docentes.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MAE (40 registros de evaluacion) | 3,10 miles de US$ |
| R² (40 registros de evaluacion) | 0,989 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa unos pocos kilobytes (tres pesos, un sesgo y los estadisticos de normalizacion).
- GPU recomendadas: no requiere GPU; funciona en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (CPU, contenedores ligeros, Raspberry Pi).
- Opciones de despliegue: carga directa con `keras.saving.load_model()` en Python; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por el tamano del modelo, la inferencia es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lagabyok/03-keras-regresion` | Regresion lineal en Keras 3 | 3 pesos + 1 sesgo | no aplica | MAE 3,10; R² 0,989 (datos sinteticos) | MIT | Hugging Face |
| Regresion lineal equivalente en scikit-learn | `LinearRegression` | 3 coeficientes + intercepto | no aplica | no disponible en esta ficha | BSD-3-Clause | scikit-learn |
| Regresion lineal equivalente en PyTorch | `nn.Linear(3, 1)` | 3 pesos + 1 sesgo | no aplica | no disponible en esta ficha | BSD-3-Clause | PyTorch |

Los tres abordan el mismo problema sintetico; la diferencia principal es el tratamiento de la normalizacion (integrada en el artefacto `.keras` frente a guardada por separado en el ejemplo de PyTorch) y el ecosistema de serializacion.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios de vivienda reales.
- Dominio restringido: solo se ha entrenado con superficies entre 35 y 120 m²; fuera de ese rango la prediccion no es fiable.
- Orden de columnas obligatorio: la entrada debe ser un array con el orden `m2`, `balcon`, `ascensor`; el modelo no acepta tablas con nombres de columna.
- Dependencia de version: requiere Keras 3; el formato `.keras` no se abre con TensorFlow/Keras 2.
- Sin capacidades de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; no debe evaluarse como modelo de IA generativa.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo extrapola linealmente fuera del rango de entrenamiento sin advertirlo.
- Sesgos: al derivarse de un generador sintetico con semilla fija, cualquier sesgo del generador se hereda; no se han documentado analisis de sesgo.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, el caracter sintetico de los datos desaconseja su uso en produccion para valoracion inmobiliaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lagabyok/03-keras-regresion
- Documentacion de Keras 3 sobre guardado y carga: https://keras.io/guides/serialization_and_saving/
- Documentacion de la capa `Normalization` de Keras: https://keras.io/api/layers/preprocessing_layers/numerical/normalization/
- Repositorio de Keras: https://github.com/keras-team/keras
