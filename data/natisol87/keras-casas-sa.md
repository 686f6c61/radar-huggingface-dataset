# natisol87/Keras-casas-SA

## Resumen

`natisol87/Keras-casas-SA` es un modelo de regresión tabular publicado en Hugging Face por el usuario natisol87, desarrollado como ejemplo pedagógico para el Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una regresión lineal implementada con Keras 3 que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables de entrada (superficie en m², presencia de balcón y presencia de ascensor).

El modelo se entrenó sobre un conjunto de datos sintético de 200 registros generados con una semilla fija en `train.py`, de los cuales 160 se usaron para entrenamiento y 40 para evaluación. La arquitectura es un `Sequential` con una capa `Normalization` seguida de una capa `Dense(1)`, lo que resulta en tres pesos más un sesgo. La salida es un valor continuo.

Su relevancia es exclusivamente didáctica: ilustra el flujo completo de entrenamiento, exportación en formato nativo `.keras` y carga para inferencia, y sirve como contrapunto a los ejemplos equivalentes en scikit-learn y PyTorch del mismo seminario. No debe confundirse con un modelo generativo ni utilizarse en producción real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal: `Sequential` con `Normalization` + `Dense(1)` |
| Parametros totales | 3 pesos + 1 sesgo (más los parámetros de la capa `Normalization`: media y desviación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (etiqueta declarada; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal canónica implementada en Keras 3. La primera capa es `Normalization`, que aprende la media y la desviación típica de las variables de entrada mediante `adapt()` sobre los datos de entrenamiento. La segunda capa es `Dense(1)` sin función de activación no lineal, lo que equivale a una combinación lineal de las entradas normalizadas más un sesgo. La inclusión de la capa `Normalization` dentro del grafo del modelo implica que la normalización se serializa junto con los pesos en `model.keras`, eliminando la necesidad de normalizar manualmente en inferencia; este es el contraste explícito con el ejemplo equivalente en PyTorch, donde la normalización se almacena por separado.

El entrenamiento es supervisado, con pérdida de error cuadrático medio (`mse`), optimizador SGD con tasa de aprendizaje 0,1 y 200 épocas. El dataset es sintético (200 registros, semilla fija), con entradas `m2` en el rango [35, 120], `balcon` binario y `ascensor` binario, y objetivo `precio` en miles de USD. No se aplicaron técnicas de RLHF, DPO ni regularización adicional según la información disponible. El backend utilizado es PyTorch, aunque el modelo declara compatibilidad con TensorFlow.

## Capacidades

- Predicción de una variable numérica continua (precio en miles de USD) a partir de tres variables tabulares.
- Normalización integrada en el grafo del modelo, lo que permite inferencia directa sin preprocesamiento manual.
- Exportación y carga en formato nativo `.keras` de Keras 3.
- Compatibilidad con backends PyTorch y TensorFlow de Keras 3.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión, audio ni modo de razonamiento.
- No procesa secuencias ni mantiene contexto conversacional.

## Casos de uso

- Docencia de regresión lineal con Keras: el modelo sirve como ejemplo mínimo reproducible para explicar el ciclo `adapt()` → `fit()` → `save()` → `load_model()` en un curso introductorio de machine learning.
- Comparación de frameworks: permite contrastar la misma tarea resuelta en scikit-learn, PyTorch y Keras, evidenciando diferencias en serialización de la normalización y en el formato de pesos.
- Demostración de serialización nativa `.keras`: útil para mostrar cómo un modelo Keras 3 empaqueta arquitectura, pesos, normalización y configuración de entrenamiento en un único archivo.
- Prototipado de pipelines tabulares triviales: como plantilla para construir regresiones lineales sobre datasets pequeños con variables numéricas y binarias.
- Pruebas de integración de Keras 3 con backend PyTorch: el modelo permite verificar la instalación y el cambio de backend en entornos docentes.
- Ejemplo de evaluación con MAE y R²: sirve para ilustrar métricas de regresión sobre un conjunto de validación de 40 registros.
- Material de referencia para el seminario del IFTS N.º 18: reproduce el ejercicio de la Clase 10 con la misma semilla y los mismos datos.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,10 miles de USD | 40 registros de evaluación |
| R² | 0,989 | 40 registros de evaluación |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; el modelo es un regresor lineal de cuatro parámetros efectivos más las estadísticas de normalización.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Keras 3 con backend PyTorch o TensorFlow. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; para un modelo de esta complejidad la inferencia es del orden de microsegundos a milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| natisol87/Keras-casas-SA | Regresión lineal (Keras 3) | 3 pesos + 1 sesgo | No aplica | MIT | `.keras` |
| natisol87/PyTorch-casas-SA | Regresión lineal (PyTorch) | No disponible en la información | No aplica | MIT | Safetensors |
| Ejemplo scikit-learn del mismo seminario | Regresión lineal | No disponible en la información | No aplica | No disponible | No disponible |

Los tres modelos resuelven el mismo problema pedagógico (predicción del precio de una casa a partir de `m2`, `balcon` y `ascensor`) y comparten dataset sintético y semilla. La diferencia principal radica en el framework, el formato de serialización y el tratamiento de la normalización: en Keras se integra en el archivo del modelo, mientras que en PyTorch se almacena por separado.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo se ha entrenado con superficies entre 35 y 120 m²; extrapolaciones fuera de ese rango no son fiables.
- Orden de columnas obligatorio: la entrada debe ser un array con el orden `m2`, `balcon`, `ascensor`; el modelo no acepta tablas con nombres de columnas.
- Requiere Keras 3: el formato `.keras` no se abre con versiones antiguas de TensorFlow/Keras 2.
- Sin capacidades de lenguaje, razonamiento, código ni multimodalidad; no es apto para tareas generativas.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de predicciones sin sentido si se alimenta con distribuciones distintas a las de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible; al ser datos sintéticos, los sesgos reflejan únicamente el generador del dataset.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no está diseñado para producción real.
- No se han publicado análisis de robustez, calibración ni intervalos de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natisol87/Keras-casas-SA
- Modelo equivalente en PyTorch: https://huggingface.co/natisol87/PyTorch-casas-SA
- Perfil de GitHub del autor: https://github.com/natisol87
