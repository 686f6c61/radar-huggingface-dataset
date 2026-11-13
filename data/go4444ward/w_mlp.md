# Go4444Ward/w_MLP

## Resumen

`w_MLP` es un modelo base publicado en Hugging Face por el usuario Go4444Ward, orientado a datos meteorologicos y pensado explicitamente como punto de partida para fine-tuning, no como un modelo de produccion cerrado. El checkpoint, de aproximadamente 15,16 millones de parametros, se distribuye en formato PyTorch (`.pt`) e incluye tanto los pesos como un diccionario de metadatos con nombres de variables, estadisticas de normalizacion, limites de salida y la informacion de mapeo de claves.

La arquitectura es deliberadamente simple: una red MLP pequena (`Linear(24, 64)` seguida de activacion y `Linear(64, 9)`) que consume 24 dimensiones de entrada y produce 9 variables meteorologicas, combinada con una tabla de embeddings (`Embedding(1.684.491, 9)`) que actua como memoria indexada por la clave `(estacion, timestamp)`. Mas del 99,9% de los parametros residen en esa tabla de memoria, lo que convierte al modelo en un hibrido entre un predictor neuronal ligero y una tabla de consulta aprendida.

El modelo es relevante por su caracter de plantilla reproducible para experimentacion meteorologica con PyTorch, pero la model card esta incompleta: contiene marcadores `TODO` y campos sin rellenar (licencia real, activacion, composicion exacta de las 24 dimensiones de entrada, pasada forward, atribucion de datos). Cualquier evaluacion seria requiere inspeccionar el checkpoint y el codigo de entrenamiento, que no se proporciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (`Linear(24, 64)` + activacion + `Linear(64, 9)`) combinada con `Embedding(1.684.491, 9)` como memoria |
| Parametros totales | ~15,16 M (MLP ~2,2 K; memoria ~15,16 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un vector de 24 dimensiones) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante) |
| Idiomas soportados | no disponible (modelo numerico de meteorologia, sin procesamiento de lenguaje) |
| Licencia | `other` (la model card indica `TODO: set the actual license`) |
| Formato de pesos | PyTorch `.pt` (diccionario con claves `model`, `metadata`, `epoch`) |

## Arquitectura y entrenamiento

El modelo combina dos modulos. El primero, `forecast`, es un perceptron multicapa de dos capas: `Linear(24, 64)`, una activacion no especificada (la model card muestra `ReLU` como marcador `TODO`) y `Linear(64, 9)`, con unos 2,2 K parametros. El segundo, `memory`, es una capa `Embedding(1.684.491, 9)` que funciona como tabla de consulta de vectores de 9 dimensiones indexados por la clave `(station, ts)`. La entrada del MLP es un vector de 24 dimensiones cuya composicion exacta no esta documentada (la model card incluye un marcador `TODO` al respecto).

El entrenamiento se realizo durante 8 epocas sobre datos meteorologicos con 10 variables de entrada y 9 de salida, normalizadas con los valores de centro y escala almacenados en `metadata`. No se especifica el numero de tokens ni de muestras, la composicion del dataset, ni si hubo tecnicas de alineacion como RLHF o DPO (poco probables en un modelo de este tipo). Tampoco se documenta la pasada forward completa ni el mapeo de indices de la memoria, lo que limita la reproducibilidad sin el codigo de entrenamiento.

## Capacidades

- Prediccion de 9 variables meteorologicas a partir de 10 variables de entrada (regresion multivariante supervisada).
- Consulta de memoria indexada por estacion y timestamp mediante la tabla de embeddings.
- Punto de partida para fine-tuning en tareas meteorologicas especificas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion meteorologica local: el modelo puede ajustarse con datos de una estacion concreta para predecir las 9 variables de salida a partir de las 10 de entrada, aprovechando la tabla de memoria para capturar patrones por estacion y timestamp.
- Downscaling estadistico: entrenando de nuevo el MLP sobre rejillas de alta resolucion, puede usarse como base para refinar predicciones de modelos globales.
- Relleno de series temporales: la memoria indexada por `(station, ts)` permite imputar valores faltantes en registros historicos de estaciones meteorologicas.
- Baseline de referencia: su tamano reducido (15,16 M parametros) y su simplicidad lo hacen util como linea base frente a modelos meteorologicos mas complejos en experimentos academicos.
- Prototipado rapido en PyTorch: al ser un checkpoint `.pt` con metadatos incluidos, sirve para validar pipelines de normalizacion, carga y evaluacion antes de escalar a modelos mayores.
- Educacion e investigacion: util para demostrar el uso de embeddings como memoria en modelos tabulares y para estudiar el desequilibrio extremo de parametros entre modulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (15,16 M parametros en float32 ocupan ~60 MB, mas overhead de PyTorch).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; el modelo funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer e incluso en dispositivos de baja potencia.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (MLP meteorologico con memoria indexada) ni se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La model card esta incompleta: contiene marcadores `TODO` en la licencia, la activacion, la composicion de la entrada de 24 dimensiones, la pasada forward y la atribucion de datos.
- La licencia figura como `other` sin especificar, lo que impide determinar si el uso comercial esta permitido.
- No se documentan los terminos de uso de los datos de entrenamiento.
- Riesgo de sobreajuste a las estaciones y periodos presentes en la tabla de memoria, con posible degradacion fuera de la distribucion de entrenamiento.
- La memoria indexada por `(station, ts)` no generaliza a estaciones o timestamps no vistos; el modelo puede fallar silenciosamente en esos casos.
- No se han publicado evaluaciones de sesgo, calibracion ni alucinacion (aunque el termino no aplica estrictamente a un modelo de regresion).
- Sin codigo de entrenamiento ni pasada forward documentada, la reproducibilidad es limitada.
- No apto para produccion sin validacion previa y sin aclarar la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Go4444Ward/w_MLP
