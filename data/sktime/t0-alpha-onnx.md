# sktime/t0-alpha-onnx

## Resumen

El modelo `sktime/t0-alpha-onnx` es una exportación en formato ONNX con precisión fp32 del modelo `theforecastingcompany/t0-alpha`, un modelo de forecasting de series temporales con capacidad zero-shot. Ha sido publicado por el equipo de sktime, el framework open source de aprendizaje automático para series temporales, con el objetivo de facilitar la inferencia en entornos de producción mediante ONNX Runtime, sin depender de la pila de Python del modelo original.

Este export no oficial reproduce fielmente la salida del predictor oficial `T0Forecaster.predict()` (verificado dentro de la tolerancia fp32) y ofrece un contrato de entrada y salida claro y documentado. Su relevancia radica en que permite desplegar un modelo de forecasting de series temporales en infraestructuras que soporten ONNX, como servidores de inferencia, edge devices o pipelines de datos, manteniendo la capacidad de generar predicciones probabilísticas (cuantiles) en una sola pasada.

El repositorio tiene un tamaño de 0,4 GB, lo que sugiere un modelo de tamaño moderado, aunque no se especifican los parámetros totales. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting de series temporales, arquitectura interna no especificada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 (longitud de la ventana de contexto de entrada, segun el contrato) |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original `t0-alpha` (numero de capas, tipo de atencion, etc.) en la documentacion proporcionada. Se sabe que es un modelo de forecasting de series temporales con capacidad zero-shot, es decir, capaz de generar predicciones para series no vistas durante el entrenamiento sin necesidad de fine-tuning.

El export ONNX mantiene la misma funcionalidad: acepta una secuencia de contexto de longitud fija 512 (con valores NaN para datos faltantes) y produce 64 pasos de prediccion con 5 cuantiles (10%, 25%, 50%, 75%, 90%). El modelo es "missing-aware", lo que significa que puede manejar series incompletas sin preprocesamiento adicional. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO, ya que la informacion disponible se centra en el artefacto ONNX.

## Capacidades

- Forecasting de series temporales univariante: genera predicciones de 64 pasos futuros a partir de un contexto de 512 pasos.
- Salida probabilistica: proporciona cuantiles (10%, 25%, 50%, 75%, 90%) que permiten cuantificar la incertidumbre de las predicciones.
- Zero-shot: puede aplicarse a series temporales de diferentes dominios sin entrenamiento adicional.
- Manejo de datos faltantes: acepta valores NaN en la entrada y los trata de forma nativa.
- Inferencia eficiente: un solo forward pass para obtener todas las predicciones y cuantiles.
- Compatibilidad ONNX: puede ejecutarse con ONNX Runtime en multiples plataformas (CPU, GPU, edge).
- Soporte multivariante (opcional): mediante el script `export_t0_onnx.py --grouped` se puede generar una variante para series con `group_ids`, aunque el artefacto publicado es univariante.

## Casos de uso

- Prevision de demanda en retail: una cadena de tiendas puede usar el modelo para predecir ventas diarias o semanales de cada producto, utilizando los cuantiles para planificar inventario de seguridad y evitar roturas de stock.
- Monitorizacion de metricas de infraestructura: en un entorno DevOps, el modelo puede predecir el uso de CPU, memoria o latencia de un servicio a partir de series historicas, alertando cuando las predicciones superen umbrales criticos.
- Planificacion energetica: para empresas de suministro electrico, el modelo puede pronosticar la demanda de energia en los proximos 64 pasos (horas o dias) y ayudar a optimizar la generacion y el almacenamiento.
- Gestion de trafico en redes: en telecomunicaciones, se puede predecir el volumen de trafico en un enlace para dimensionar la capacidad y detectar congestiones inminentes.
- Analisis financiero de corto plazo: el modelo puede generar predicciones de series de precios o volumenes de trading, aunque su naturaleza zero-shot y su ventana de 512 pasos lo hacen mas adecuado para datos de alta frecuencia que para analisis fundamental.
- Mantenimiento predictivo: a partir de series de sensores (temperatura, vibracion, presion), el modelo puede anticipar fallos en maquinaria, permitiendo programar mantenimientos antes de que ocurran averias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es que la salida fp32 del export ONNX coincide con la del predictor oficial `T0Forecaster.predict()` dentro de la tolerancia fp32, lo que garantiza fidelidad numerica, pero no se ofrecen metricas de calidad de prediccion (como MASE, sMAPE, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamano del repositorio es de 0,4 GB, lo que sugiere que el modelo en fp32 ocupa aproximadamente ese espacio en disco.
- Al ser un modelo ONNX fp32, puede ejecutarse en CPU sin necesidad de GPU. La inferencia en CPU con ONNX Runtime es viable para aplicaciones de batch o tiempo real moderado.
- Para GPU, cualquier GPU con al menos 1 GB de VRAM seria suficiente, aunque no se han publicado mediciones de latencia o throughput.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), servidores de inferencia como Triton Inference Server, o integracion en pipelines de datos con herramientas como Apache Beam o Spark.
- No se requieren librerias especificas de Python mas alla de `onnxruntime` para la ejecucion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con otros modelos de forecasting de series temporales (como Chronos, TimesFM, etc.) en terminos de parametros, contexto o rendimiento. El modelo base `t0-alpha` de The Forecasting Company es relativamente reciente y no se han publicado comparativas publicas en la documentacion revisada. Se recomienda consultar el repositorio original para obtener datos de evaluacion.

## Limitaciones y advertencias

- Export no oficial: no esta afiliado ni respaldado por los autores del modelo original. Podria haber diferencias sutiles en el comportamiento en casos extremos.
- Solo univariante por defecto: el artefacto publicado maneja una sola serie a la vez. Para series multivariantes es necesario ejecutar el script de exportacion con la opcion `--grouped`.
- Ventana de contexto fija: la entrada debe tener exactamente 512 valores (con NaN para rellenar series mas cortas). No soporta longitudes variables.
- Sin informacion sobre sesgos o alucinaciones: al ser un modelo de series temporales, no aplican los sesgos tipicos de modelos de lenguaje, pero no se ha documentado su comportamiento en series con tendencias o estacionalidades extremas.
- Licencia Apache-2.0: permite uso comercial, pero se debe incluir el aviso de licencia y, si se redistribuye, mantener la atribucion.
- Sin garantias de rendimiento: no se han publicado benchmarks, por lo que la calidad de las predicciones en dominios especificos debe validarse antes de su uso en produccion.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/sktime/t0-alpha-onnx)
- [Modelo original t0-alpha](https://huggingface.co/theforecastingcompany/t0-alpha)
- [Sitio web de sktime](https://www.sktime.net/)
- [Documentacion de sktime](https://www.sktime.org/en/latest.html)
- [Repositorio GitHub de sktime](https://github.com/sktime/sktime)
