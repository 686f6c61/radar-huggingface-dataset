# sktime/chronos2-onnx-int8

## Resumen

Chronos-2 es un modelo fundacional de series temporales desarrollado por Amazon Research para pronóstico zero-shot. Esta ficha describe la exportación no oficial a ONNX cuantizada en int8 realizada por la organización sktime, que permite ejecutar el modelo en entornos con recursos limitados mediante ONNX Runtime. El modelo base es un transformer encoder-only que soporta series univariantes, multivariantes y con covariables, y esta versión cuantizada reduce el tamaño del artefacto a 0,1 GB manteniendo una precisión cercana a la versión fp32 (dentro del 4,7% del spread de pronóstico). La entrada acepta un contexto de hasta 2048 puntos temporales y produce 21 cuantiles de predicción en una sola pasada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (modelo base Chronos-2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 puntos temporales |
| Tipos de cuantizacion | int8 dinámico por canal (QInt8) |
| Idiomas soportados | no aplica (series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

Chronos-2 es un modelo encoder-only de transformers preentrenado para pronóstico de series temporales. Según la documentación oficial, soporta tareas univariantes, multivariantes y con covariables dentro de una única arquitectura. Esta exportación ONNX es una conversión del modelo original con cuantización int8 dinámica por canal, realizada por sktime. No se dispone de detalles sobre el número de parámetros, el dataset de entrenamiento ni el proceso de optimización del modelo base en la información proporcionada.

## Capacidades

- Pronóstico zero-shot de series temporales univariantes, multivariantes y con covariables.
- Salida de 21 cuantiles (desde 0.01 hasta 0.99) que permiten cuantificar la incertidumbre de la predicción.
- Manejo de valores faltantes (NaN) en la serie de contexto, con padding por la izquierda.
- Una única pasada hacia adelante para generar todas las predicciones.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Previsión de demanda en retail: el modelo puede predecir ventas futuras a partir de series históricas, con cuantiles para planificar stock de seguridad.
- Predicción de carga eléctrica: útil para operadores de red que necesitan estimar la demanda energética en horizontes de hasta 64 pasos.
- Monitorización de métricas de servidores: permite anticipar picos de uso de CPU, memoria o red en infraestructuras cloud.
- Previsión financiera: análisis de series de precios o indicadores económicos con intervalos de confianza.
- Planificación de inventario en logística: predicción de rotación de productos y optimización de almacenes.
- Despliegue en entornos edge o con CPU limitada: al ser un artefacto ONNX int8 de 0,1 GB, puede ejecutarse en dispositivos sin GPU mediante ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta exportación cuantizada en la información disponible. El modelo base Chronos-2 reporta rendimiento state-of-the-art en tareas zero-shot según la documentación de Amazon, pero no se incluyen cifras concretas en esta ficha.

## Requisitos de hardware

- Tamaño del artefacto: 0,1 GB, por lo que cabe en la memoria de cualquier GPU moderna e incluso en CPU.
- Al ser int8, es adecuado para inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Se puede desplegar con ONNX Runtime, así como con otros runtime compatibles con ONNX (TensorRT, OpenVINO, etc.).
- No se dispone de datos de latencia o throughput específicos para esta versión.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos en esta ficha. Existen otras exportaciones ONNX de Chronos-2 (por ejemplo, OpenSTEF/chronos-2-onnx y TSFM-ai/chronos-2-onnx), pero no se han encontrado datos comparativos de rendimiento o especificaciones detalladas.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por los autores del modelo original (Amazon).
- La cuantización int8 introduce una pérdida de precisión: el spread del pronóstico se desvía hasta un 4,7% respecto a la versión fp32 oficial.
- El contexto está limitado a 2048 puntos temporales; series más largas deben truncarse o segmentarse.
- No es un modelo de lenguaje: no procesa texto ni instrucciones en lenguaje natural.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base amazon/chronos-2 para posibles restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sktime/chronos2-onnx-int8
- Repositorio oficial de Chronos (Amazon Science): https://github.com/amazon-science/chronos-forecasting
- Documentación de sktime para Chronos2Forecaster: https://www.sktime.net/models/chronos2forecaster/
- Otras exportaciones ONNX: https://huggingface.co/OpenSTEF/chronos-2-onnx y https://huggingface.co/TSFM-ai/chronos-2-onnx
