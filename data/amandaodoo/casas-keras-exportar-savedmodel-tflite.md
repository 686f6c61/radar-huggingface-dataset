# amandaodoo/casas-keras-exportar-savedmodel-tflite

## Resumen

`casas-keras-exportar-savedmodel-tflite` es un repositorio de HuggingFace publicado por el usuario `amandaodoo` que contiene un modelo de regresión lineal entrenado con Keras y exportado en dos formatos: SavedModel de TensorFlow y TFLite. No se trata de un modelo de lenguaje ni de un transformer, sino de un ejemplo educativo de pipeline de machine learning tabular orientado a la predicción de precios de viviendas (a partir del nombre del repositorio, "casas").

El repositorio forma parte de una serie de ejemplos didácticos (la model card menciona una carpeta previa `keras-entrenamiento-evaluacion` de la que este modelo es la continuación) cuyo objetivo es demostrar el flujo completo de exportación y recarga de modelos en TensorFlow: entrenar, exportar a SavedModel y TFLite, y volver a cargar para predecir. Es relevante para desarrolladores que quieran entender cómo empaquetar modelos Keras para despliegue en servidor (SavedModel) o en dispositivos móviles (TFLite), no por su capacidad predictiva.

El tamaño del repositorio es de 0.0 GB (prácticamente despreciable), coherente con un modelo de regresión lineal de muy pocos parámetros. La licencia es MIT y el idioma declarado es español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal (Keras / TensorFlow) |
| Parametros totales | no disponible (modelo lineal de pocos parámetros; el tamaño del repo es 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (TFLite incluye optimizaciones propias del formato, sin detalle publicado) |
| Idiomas soportados | es (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | SavedModel (`model_savedmodel/`) y TFLite (`model.tflite`) |

## Arquitectura y entrenamiento

La arquitectura es una regresión lineal implementada con Keras sobre TensorFlow. El repositorio no documenta el número de características de entrada, el número de tokens de entrenamiento ni la composición del dataset; únicamente se infiere por el nombre del repositorio ("casas") y por la etiqueta `tabular-regression` que el problema es la predicción de precios de vivienda a partir de datos tabulares.

El repositorio no contiene el proceso de entrenamiento en sí, sino los artefactos exportados desde un proyecto previo (`keras-entrenamiento-evaluacion`). Según la model card, el modelo se exporta a SavedModel (grafo de TensorFlow con pesos, para servir en servidor) y a TFLite (versión reducida y optimizada para móvil). No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, lo cual es esperable en un modelo de regresión tabular. La innovación técnica destacable es exclusivamente pedagógica: mostrar que SavedModel y TFLite se cargan sin necesidad de Keras (`tf.saved_model.load` y `tf.lite.Interpreter`) y que no ejecutan código Python al abrirse, lo que los hace seguros frente a artefactos de origen desconocido.

## Capacidades

- Predicción de regresión tabular: estima un valor numérico continuo (presumiblemente el precio de una vivienda) a partir de un vector de características tabulares.
- Exportación a SavedModel: el grafo de TensorFlow con pesos puede servirse en un servidor sin dependencia de Keras.
- Exportación a TFLite: versión compacta y optimizada para inferencia en dispositivos móviles o embebidos.
- Carga sin Keras: tanto SavedModel (`tf.saved_model.load`) como TFLite (`tf.lite.Interpreter`) se cargan con la API de TensorFlow.
- Seguridad de carga: los formatos no ejecutan código Python al abrirse, según la model card.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües; es un modelo estrictamente tabular.

## Casos de uso

- Ejemplo didáctico de exportación de modelos: sirve para que estudiantes y desarrolladores aprendan a convertir un modelo Keras entrenado a SavedModel y TFLite y a recargarlo para predecir, siguiendo los scripts `exportar.py` y `cargar.py` descritos en la model card.
- Despliegue de inferencia en servidor: el SavedModel puede cargarse con `tf.saved_model.load` en un servicio backend para responder peticiones de predicción de precios sin arrastrar la dependencia de Keras.
- Inferencia en dispositivos móviles: el archivo `model.tflite` puede integrarse en una app Android o iOS mediante el intérprete TFLite para estimar precios de vivienda offline, con un tamaño de artefacto mínimo.
- Validación de pipelines de publicación en el Hub: el script `publicar_en_hub.py` y `predict_hub.py` permiten practicar la publicación de un modelo y su consumo remoto desde otra máquina.
- Prueba de concepto de regresión tabular: útil como línea base trivial contra la que comparar modelos más complejos (gradient boosting, redes profundas) en un problema de precios de vivienda.
- Formación en seguridad de artefactos: dado que la model card destaca que estos formatos no ejecutan código Python, sirve para ilustrar buenas prácticas al cargar modelos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; un modelo de regresión lineal de pocos parámetros ocupa kilobytes, no gigabytes. Cabe en cualquier GPU e incluso en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente; una GPU consumer (RTX 3060, RTX 4090, etc.) no aporta ventaja significativa para este tamaño.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en dispositivos móviles vía TFLite.
- Opciones de despliegue: TensorFlow Serving o carga directa con `tf.saved_model.load` para SavedModel; intérprete TFLite (`tf.lite.Interpreter`) para móvil y embebidos. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de microsegundos a milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (ejemplo educativo de regresión lineal exportado a SavedModel y TFLite). Como referencia conceptual, cualquier implementación equivalente con scikit-learn (`LinearRegression`) o TensorFlow Lite Model Maker cubriría un propósito similar, pero no se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no procesa imágenes ni audio. Cualquier expectativa en ese sentido es errónea.
- Sesgos conocidos: no documentados; al ser un modelo de regresión sobre datos de vivienda, podría heredar sesgos del dataset de entrenamiento (geográficos, socioeconómicos), pero no se detalla la composición del dataset.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo real es una predicción numérica incorrecta si la entrada está fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto; el idioma declarado (es) es meramente informativo y no afecta a la funcionalidad.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. Verificar el aviso de copyright original del autor.
- Caveats para producción: el repositorio tiene 14 descargas y 0 likes, sin validación externa; no hay documentación del dataset, métricas de error (MAE, RMSE) ni rango de validez de las entradas. No debe usarse para decisiones reales de valoración inmobiliaria sin reentrenamiento y validación propios.
- El repositorio depende de un proyecto previo (`keras-entrenamiento-evaluacion`) que no forma parte de este artefacto; los scripts de carga asumen esa procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amandaodoo/casas-keras-exportar-savedmodel-tflite
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
