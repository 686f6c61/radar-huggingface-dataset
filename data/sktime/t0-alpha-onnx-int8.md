# sktime/t0-alpha-onnx-int8

## Resumen

El modelo `sktime/t0-alpha-onnx-int8` es una exportación no oficial en formato ONNX del modelo de forecasting de series temporales `theforecastingcompany/t0-alpha`, cuantizado a int8 dinámico por canal. Lo publica el equipo de sktime, un framework unificado para aprendizaje automático con series temporales, con el objetivo de facilitar el despliegue del modelo en entornos de producción que usan ONNX Runtime. La cuantización reduce la huella de memoria y acelera la inferencia, manteniendo una precisión verificada dentro del 15,2 % del rango de predicción (media del 3 %) respecto a la salida original en punto flotante.

El modelo acepta una secuencia de contexto de 512 pasos temporales (con soporte para valores faltantes mediante NaN) y devuelve 64 pasos de pronóstico con cinco cuantiles (0,1, 0,25, 0,5, 0,75 y 0,9), lo que permite cuantificar la incertidumbre de las predicciones. Está pensado para series univariantes, aunque existe una variante multivariante mediante `group_ids`. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: theforecastingcompany/t0-alpha) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 pasos temporales (entrada) |
| Tipos de cuantizacion | int8 dinámico por canal (QInt8) |
| Idiomas soportados | no disponible (modelo de forecasting, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base `t0-alpha` (número de capas, tipo de atención, etc.) en los datos proporcionados. La exportación ONNX conserva la estructura del modelo original, pero no se detallan sus componentes. Tampoco se conocen los datos de entrenamiento, el número de tokens o pasos de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La cuantización se realizó con un esquema dinámico por canal, lo que significa que los rangos de activación se calculan en tiempo de ejecución, mientras que los pesos se cuantizan a int8 por canal. Esta técnica reduce el tamaño del modelo y acelera la inferencia en CPU y GPU compatibles con ONNX Runtime.

## Capacidades

- Forecasting de series temporales univariantes: genera 64 pasos futuros a partir de un contexto de 512 pasos.
- Salida con cuantiles (0,1, 0,25, 0,5, 0,75, 0,9) para estimar la incertidumbre de la predicción.
- Manejo de valores faltantes: la entrada acepta NaN, y el modelo es consciente de la ausencia de datos; el padding izquierdo con NaN es equivalente a una llamada con la longitud natural de la serie.
- Una sola pasada hacia adelante para obtener todas las predicciones.
- Soporte para series multivariantes mediante la variante `group_ids` (requiere ejecutar el script de exportación con la opción `--grouped`).
- Compatible con ONNX Runtime, lo que permite integración en pipelines de inferencia estándar.

## Casos de uso

- Predicción de demanda en retail: usar el contexto de 512 días de ventas históricas para pronosticar los próximos 64 días, con intervalos de confianza para planificar inventario.
- Monitorización de métricas de servidores: predecir la carga de CPU o el uso de memoria en los próximos 64 intervalos de tiempo, ayudando a la autoescalabilidad.
- Predicción de consumo energético: anticipar la demanda eléctrica de un edificio o región a partir de series históricas, con cuantiles para gestionar la oferta.
- Mantenimiento predictivo: pronosticar indicadores de salud de maquinaria (vibración, temperatura) para programar mantenimientos antes de fallos.
- Análisis financiero: predecir series de precios o volúmenes de transacciones con bandas de incertidumbre para gestión de riesgo.
- Optimización de cadenas de suministro: estimar tiempos de entrega o niveles de stock futuros usando datos históricos de logística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card solo indica que la salida int8 fue verificada dentro del 15,2 % del rango de predicción (media del 3 %) respecto a la salida oficial de `T0Forecaster.predict()`, pero no se proporcionan métricas estándar como MASE, sMAPE o comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que sugiere un modelo ligero tras la cuantización.
- VRAM estimada: no disponible, pero al ser int8 y de pequeño tamaño, es probable que quepa en GPUs de consumo (p. ej., RTX 3060 o superiores) y en CPU.
- GPU recomendadas: no disponible; se puede ejecutar en CPU con ONNX Runtime, y en GPU con soporte para int8.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), compatible con servidores de inferencia como Triton Inference Server o FastAPI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `t0-alpha` es de The Forecasting Company, pero no se han encontrado referencias a alternativas equivalentes en el contexto de esta ficha.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por los autores del modelo original; puede haber diferencias sutiles en el comportamiento.
- Degradación por cuantización: la precisión se reduce respecto al modelo en punto flotante, con una desviación media del 3 % y un máximo del 15,2 % en el rango de predicción.
- Entrada y salida fijas: el contexto debe tener exactamente 512 pasos (con padding NaN para series más cortas) y la salida es de 64 pasos; no se pueden cambiar estos tamaños sin reentrenar o reexportar.
- Solo series temporales: no es un modelo de lenguaje ni admite texto, tool calling o agentes.
- La variante multivariante requiere un proceso de exportación adicional y no está incluida por defecto en el artefacto publicado.
- Aunque la licencia es Apache-2.0, se recomienda revisar el `NOTICE` del repositorio upstream si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sktime/t0-alpha-onnx-int8
- Modelo base: https://huggingface.co/theforecastingcompany/t0-alpha
- Repositorio de sktime: https://github.com/sktime/sktime
- ONNX Runtime (modelos): https://onnxruntime.ai/models
