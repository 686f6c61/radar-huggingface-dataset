# OneScience-Group/ConvLSTM

## Resumen

ConvLSTM es una arquitectura de red neuronal recurrente convolucional diseñada para la predicción de secuencias espacio-temporales. Fue propuesta originalmente por investigadores de la Universidad de Ciencia y Tecnología de Hong Kong y el Observatorio de Hong Kong en el artículo "Convolutional LSTM Network: A Machine Learning Approach for Precipitation Nowcasting", publicado en NeurIPS 2015. La arquitectura sustituye las transformaciones entrada-estado y estado-estado del LSTM clásico por convoluciones espaciales, lo que permite modelar correlaciones espaciales locales mientras se preservan dependencias temporales de largo alcance.

Esta ficha corresponde a la reproducción independiente publicada por OneScience-Group, un repositorio de ingeniería que implementa las especificaciones públicas del artículo original. El repositorio proporciona un flujo de trabajo completo de entrenamiento, inferencia, evaluación y visualización, validado con datos sintéticos que simulan secuencias de eco de radar. La relevancia actual de este modelo radica en su aplicación a la predicción inmediata de precipitaciones (precipitation nowcasting), un problema crítico en meteorología operativa, así como en tareas generales de predicción de secuencias espacio-temporales como la predicción de vídeo.

El repositorio no incluye pesos preentrenados y la licencia es Apache 2.0. Está implementado en PyTorch y el código está disponible públicamente, lo que permite a investigadores y desarrolladores reproducir el flujo completo de trabajo y adaptarlo a sus propios datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvLSTM (LSTM convolucional con conexiones peephole por canal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo visual espacio-temporal, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo visual; documentacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no incluye pesos entrenados) |

## Arquitectura y entrenamiento

La arquitectura ConvLSTM mantiene la estructura celular del LSTM tradicional —compuerta de entrada, olvido, salida y estado de celda— pero reemplaza las multiplicaciones de matrices por convoluciones espaciales tanto en la transicion entrada-estado como en la transicion estado-estado. Esto permite que la red capture patrones espaciales locales de forma natural mientras retiene la capacidad de modelar dependencias temporales a largo plazo. La implementacion de OneScience-Group utiliza dos capas de encoder y dos capas de forecaster, con convoluciones de 3x3 y conexiones peephole por canal.

El entrenamiento descrito en el articulo original utilizo 97 dias con las mayores precipitaciones de los datos de radar meteorologico de Hong Kong entre 2011 y 2013, junto con secuencias sinteticas Moving-MNIST. Sin embargo, el repositorio de OneScience-Group utiliza datos sinteticos propios: 20 imagenes consecutivas de eco de radar de un solo canal, de 100x100 pixeles y tipo float32, con intervalos de 6 minutos. Las primeras 5 imagenes se usan como entrada y las 15 siguientes como objetivo de prediccion. Estos datos sirven exclusivamente para validar el flujo de trabajo de ingenieria, no para reproducir la distribucion de datos reales del articulo. El repositorio no incluye pesos entrenados y el articulo original no proporciona checkpoints descargables de su implementacion en Theano.

## Capacidades

- Prediccion de secuencias espacio-temporales: el modelo aprende simultaneamente correlaciones espaciales y temporales mediante una estructura de compuertas convolucionales.
- Prediccion inmediata de precipitaciones (precipitation nowcasting): a partir de 5 mapas de radar historicos, predice los siguientes 15 pasos temporales.
- Prediccion de imagenes multi-paso: la estructura encoder-forecaster permite generar imagenes futuras de forma continua.
- Validacion de flujos de trabajo locales: el repositorio incluye scripts para verificar entrenamiento, inferencia, evaluacion, visualizacion y guardado de checkpoints con datos sinteticos.
- Entrenamiento multi-GPU: soporta entrenamiento distribuido con `torchrun`.
- Evaluacion meteorologica estandar: implementa las metricas Rainfall-MSE, CSI, FAR, POD y Correlation, siguiendo la metodologia del articulo original.

## Casos de uso

- Prediccion inmediata de precipitaciones en servicios meteorologicos: el modelo puede integrarse en sistemas operativos de nowcasting para anticipar lluvias intensas con un horizonte de 90 minutos (15 pasos de 6 minutos), proporcionando alertas tempranas a proteccion civil y servicios de emergencia.
- Prediccion de video en vision por computador: la arquitectura encoder-forecaster puede aplicarse a la generacion de fotogramas futuros en secuencias de video, util en sistemas de vigilancia o compresion predictiva.
- Modelado de secuencias espacio-temporales en ciencias de la Tierra: el modelo puede adaptarse a datos de satelite, como mapas de temperatura superficial o cobertura de nubes, para anticipar su evolucion temporal.
- Validacion de pipelines de IA cientifica: el repositorio sirve como banco de pruebas para verificar que el flujo de trabajo completo —datos, entrenamiento, inferencia, evaluacion y visualizacion— funciona correctamente antes de escalar a datos reales.
- Investigacion en IA4S (IA para la ciencia): el codigo proporciona una base reproducible para experimentar con variantes de ConvLSTM o comparar con otras arquitecturas de prediccion espacio-temporal.
- Entrenamiento distribuido en clusters: el soporte de `torchrun` permite lanzar entrenamiento con datos paralelos en multiples GPUs o DCUs, util para escalar a conjuntos de datos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye scripts de evaluacion que calculan Rainfall-MSE, CSI, FAR, POD y Correlation, pero los resultados obtenidos con datos sinteticos solo validan el flujo de trabajo de ingenieria y no representan las metricas del articulo original sobre datos reales de radar. El articulo original de ConvLSTM reporta resultados en el conjunto de datos de Hong Kong y Moving-MNIST, pero estos datos no estan disponibles en este repositorio.

## Requisitos de hardware

- Se recomienda una GPU o DCU para el entrenamiento y la inferencia. El repositorio menciona que los usuarios de DCU deben instalar DTK 25.04.2 o superior.
- Una CPU es suficiente para la validacion de conectividad con la configuracion de pequeña muestra por defecto.
- La VRAM estimada no esta disponible, pero dado que el modelo es pequeno (dos capas encoder y dos forecaster con 3x3 convoluciones) y los datos sinteticos son de 100x100 pixeles, deberia caber en GPUs de consumo como una RTX 3060 o superior.
- Opciones de despliegue: el repositorio proporciona scripts de entrenamiento e inferencia en PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje, no a modelos de vision espacio-temporal.
- La latencia y el throughput no estan documentados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Como referencia arquitectonica, ConvLSTM pertenece a la familia de modelos de prediccion espacio-temporal que incluye alternativas como:

| Modelo | Arquitectura | Uso principal | Disponibilidad |
|---|---|---|---|
| ConvLSTM | LSTM convolucional | Prediccion de precipitaciones y secuencias espacio-temporales | Codigo abierto (Apache 2.0) |
| TrajGRU | GRU con conexiones recurrentes que aprenden la topologia local | Prediccion de precipitaciones | Codigo abierto |
| PredRNN | Red recurrente con memoria espacio-temporal | Prediccion de video | Codigo abierto |
| SimVP | Red convolucional pura sin recurrencia | Prediccion de video | Codigo abierto |

Estos modelos resuelven tareas similares pero con enfoques arquitectonicos distintos. ConvLSTM destaca por su simplicidad conceptual y su base solida en la literatura revisada por pares.

## Limitaciones y advertencias

- El repositorio no incluye pesos preentrenados: el usuario debe entrenar el modelo desde cero, y los datos sinteticos incluidos no representan la distribucion real de datos meteorologicos.
- Los resultados de evaluacion obtenidos con los datos sinteticos no son representativos del rendimiento del modelo en datos reales de radar.
- El alcance del modelo se limita a la prediccion de secuencias espacio-temporales; no es un modelo de lenguaje ni tiene capacidades multimodales.
- La documentacion del repositorio esta en ingles; no hay soporte oficial en castellano.
- El articulo original se publico en 2015 y la implementacion de referencia estaba en Theano, que ya no se mantiene. Esta reproduccion en PyTorch es independiente y no ha sido validada por los autores originales.
- Aunque la licencia es Apache 2.0, el uso de datos meteorologicos reales en produccion debe cumplir con las politicas de la fuente de datos (por ejemplo, el Observatorio de Hong Kong).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OneScience-Group/ConvLSTM
- Articulo original (NeurIPS 2015): https://papers.nips.cc/paper_files/paper/2015/hash/07563a3fe3bbe7e3ba84431ad9d055af-Abstract.html
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio de habilidades de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Pagina de modelos de OneScience-Group en Hugging Face: https://huggingface.co/OneScience-Group/models
