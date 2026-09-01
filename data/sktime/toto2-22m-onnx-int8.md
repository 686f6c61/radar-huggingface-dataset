# sktime/toto2-22m-onnx-int8

## Resumen

Toto-2.0-22m es un modelo fundacional de pronóstico de series temporales multivariante desarrollado por Datadog, orientado a métricas de observabilidad. Esta ficha describe la exportación ONNX cuantizada a int8 realizada por sktime, que permite ejecutar el modelo con onnxruntime en entornos de producción con requisitos reducidos de memoria y cómputo. El modelo base tiene 22 millones de parámetros y emplea una arquitectura con atención alternada entre el eje temporal y el eje de variantes, además de generar bandas de cuantiles nativas.

La versión ONNX int8 es una conversión no oficial del modelo original, con cuantización bloqueada solo de pesos (blocked weight-only QInt8) y la cabeza de salida en fp32. Está diseñada para inferencia de baja latencia en escenarios de observabilidad, manteniendo la capacidad de pronóstico zero-shot sobre series largas de hasta 2048 pasos. Su licencia Apache-2.0 permite uso comercial sin restricciones, y el repositorio ocupa solo 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención alternada tiempo/variante (time/variate attention) |
| Parametros totales | 22 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 pasos temporales (entrada `context` con forma `['variates', 2048]`) |
| Tipos de cuantizacion | int8 bloqueado solo pesos (blocked weight-only QInt8, opset-21, bloques de 16 filas); cabeza de salida en fp32 |
| Idiomas soportados | no aplica (modelo de series temporales, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (exportado con onnxruntime, requiere onnxruntime >= 1.20) |

## Arquitectura y entrenamiento

El modelo base Toto-2.0-22m emplea una arquitectura Transformer con atención alternada entre el eje temporal y el eje de variantes, lo que permite modelar dependencias tanto a lo largo del tiempo como entre distintas series métricas. Incorpora bandas de cuantiles nativas, generando directamente 9 niveles de cuantiles (0.1 a 0.9) en una sola pasada de 96 pasos de pronóstico. La versión ONNX int8 mantiene esta arquitectura, cuantizando únicamente los pesos a int8 con bloques de 16 filas, mientras que la cabeza de salida permanece en fp32 para preservar la precisión de los cuantiles.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Según la documentación de TSFM.ai, el modelo está diseñado para pronóstico de observabilidad de baja latencia, y el modelo base es el candidato de producción ligero de la familia Toto 2.0, por encima del checkpoint de 4M para pruebas de humo.

## Capacidades

- Pronóstico de series temporales multivariante con soporte para múltiples variantes (hasta 2048 pasos de contexto).
- Generación de bandas de cuantiles nativas (9 niveles: 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9) en una sola pasada de 96 pasos.
- Manejo de valores faltantes mediante relleno con NaN (missing-aware), permitiendo series de longitud variable.
- Agrupación de variantes mediante `series_ids`: las variantes que comparten un mismo id se pronostican conjuntamente a través de la atención de variantes; ids distintos se tratan como independientes.
- Capacidad zero-shot: no requiere fine-tuning para series nuevas, adecuado para dominios de observabilidad.
- Inferencia eficiente gracias a la cuantización int8, con requisitos de memoria reducidos.

## Casos de uso

- Monitorización de infraestructura en tiempo real: el modelo puede pronosticar métricas de CPU, memoria, latencia o tráfico de red a partir de los últimos 2048 puntos, generando bandas de confianza para alertas tempranas.
- Detección de anomalías en sistemas distribuidos: al predecir cuantiles, permite identificar desviaciones significativas respecto a la mediana en series de observabilidad.
- Planificación de capacidad en la nube: con pronósticos a 96 pasos, se pueden anticipar picos de demanda y dimensionar recursos de forma proactiva.
- Análisis de métricas de negocio: aplicable a series de ventas, usuarios activos o ingresos, con soporte para múltiples variantes correlacionadas.
- Integración en pipelines de MLOps: al estar en formato ONNX, puede desplegarse con onnxruntime en entornos de producción, incluyendo CPU, con baja latencia.
- Pronóstico de series cortas o incompletas: gracias al manejo de NaN, funciona con series que no tienen longitud completa, rellenando con valores faltantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no es de lenguaje. Tampoco se han proporcionado comparativas de error de pronóstico (p. ej., MAE, MSE) frente a otros modelos de series temporales.

## Requisitos de hardware

- El modelo tiene 22 millones de parámetros y el repositorio ocupa 0,1 GB, por lo que la inferencia es viable en CPU con onnxruntime.
- Con cuantización int8, los pesos ocupan aproximadamente 22 MB, más overhead de activaciones; cabe en cualquier GPU moderna con al menos 1 GB de VRAM, incluyendo GPUs de consumo como RTX 3060 o superiores.
- Para despliegue en producción, se recomienda onnxruntime >= 1.20; no se ha probado en onnxruntime-web.
- No se dispone de datos de latencia o throughput específicos para esta versión cuantizada; se espera que sea significativamente más rápida que la versión fp32 del modelo base.
- Opciones de despliegue: onnxruntime (Python, C++, C#), o integración en frameworks que soporten ONNX (p. ej., sktime mediante su interfaz TotoForecaster).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| Datadog/Toto-2.0-22m (base) | 22M | 2048 | 96 pasos, 9 cuantiles | Apache-2.0 | PyTorch (probablemente) |
| sktime/toto2-22m-onnx-int8 (este) | 22M | 2048 | 96 pasos, 9 cuantiles | Apache-2.0 | ONNX int8 |
| Otros modelos de pronóstico (p. ej., Chronos, TimesFM) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría en términos de rendimiento. La comparativa se limita a la relación entre el modelo base y su versión cuantizada.

## Limitaciones y advertencias

- Esta exportación ONNX es no oficial y no está afiliada ni respaldada por los autores del modelo original (Datadog).
- La cuantización int8 puede introducir una ligera pérdida de precisión en los pronósticos, especialmente en la cola de cuantiles extremos, aunque la cabeza de salida se mantiene en fp32 para mitigarlo.
- Requiere onnxruntime >= 1.20; no se ha probado en onnxruntime-web, por lo que su uso en navegadores no está garantizado.
- El modelo está especializado en series temporales de observabilidad; su rendimiento en otros dominios (finanzas, energía, etc.) puede ser inferior sin fine-tuning.
- No se han publicado resultados de benchmarks ni estudios de sesgos para esta versión; se recomienda validar en el dominio de aplicación.
- La licencia Apache-2.0 permite uso comercial, pero al ser una exportación no oficial, conviene revisar los términos del modelo base para asegurar cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sktime/toto2-22m-onnx-int8
- Modelo base en HuggingFace: https://huggingface.co/Datadog/Toto-2.0-22m
- Ficha del modelo en TSFM.ai: https://tsfm.ai/models/Datadog%2FToto-2.0-22m
- Documentación de TotoForecaster en sktime: https://www.sktime.net/models/totoforecaster/
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
- ONNX Runtime Models: https://onnxruntime.ai/models
