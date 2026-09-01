# sktime/chronos2-onnx

## Resumen

El modelo `sktime/chronos2-onnx` es una exportación no oficial en formato ONNX con precisión fp32 del modelo `amazon/chronos-2`, un modelo fundacional de forecasting de series temporales desarrollado por Amazon Research. Esta versión ha sido generada por el equipo de sktime para facilitar el despliegue del modelo en entornos que usan ONNX Runtime, ofreciendo un contrato de entrada y salida bien definido y verificado frente al pipeline oficial. El modelo resuelve el problema de predicción de series temporales en modo zero-shot, es decir, sin necesidad de entrenamiento específico para cada serie, y soporta series univariantes, multivariantes y con covariables.

La relevancia de esta exportación radica en que permite integrar Chronos-2 en aplicaciones de producción que requieren inferencia eficiente y portabilidad entre plataformas, manteniendo una fidelidad numérica muy alta (dentro del 0.0001% del spread de predicción del pipeline original). El modelo acepta un contexto de hasta 2048 pasos temporales y genera 64 pasos de predicción con 21 cuantiles, lo que lo hace adecuado para tareas de previsión con incertidumbre cuantificada. Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-based (encoder-decoder según el export de kashif; encoder-only según la documentación de sktime) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 pasos temporales (según el contrato del modelo) |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo base `amazon/chronos-2` es un modelo de forecasting de series temporales basado en la arquitectura T5, que utiliza un mecanismo de patching para procesar las series de entrada. Según el export de kashif, se trata de un encoder-decoder con 12 capas, dimensión de modelo 768 y atención de 12 cabezas, aunque la documentación de sktime lo describe como encoder-only. Esta discrepancia puede deberse a variantes del modelo o a diferencias en la implementación del export. El modelo es consciente de valores faltantes (missing-aware), lo que permite manejar series incompletas mediante el relleno con NaN.

El entrenamiento del modelo original no se detalla en la información proporcionada, pero se sabe que Chronos-2 ofrece capacidades zero-shot para forecasting univariante, multivariante y con covariables. La exportación ONNX mantiene el comportamiento del modelo original, incluyendo la generación de cuantiles (21 niveles desde 0.01 hasta 0.99) en una sola pasada hacia adelante. El contrato de entrada especifica un tensor `context` de forma `[batch, 2048]` en float32 y un tensor `group_ids` de forma `[batch]` en int64 para agrupar series que deben pronosticarse conjuntamente (multivariante) o de forma independiente.

## Capacidades

- Generación de pronósticos de series temporales en modo zero-shot, sin necesidad de ajuste fino.
- Soporte para series univariantes y multivariantes mediante el uso de `group_ids`.
- Manejo de valores faltantes (NaN) en la serie de contexto, con relleno a la izquierda para series cortas.
- Salida de 21 cuantiles (0.01, 0.05, ..., 0.99) que permiten cuantificar la incertidumbre de la predicción.
- Longitud de contexto fija de 2048 pasos y predicción de 64 pasos en una sola pasada.
- Compatibilidad con ONNX Runtime, lo que facilita la integración en pipelines de producción y entornos con restricciones de hardware.
- Capacidad de forecasting con covariables (según la documentación de Chronos-2, aunque no se detalla en el contrato de este export).

## Casos de uso

- Previsión de demanda en retail: el modelo puede predecir ventas futuras a partir de series históricas de 2048 pasos, generando cuantiles que permiten dimensionar inventarios con niveles de confianza. Su naturaleza zero-shot evita el entrenamiento por producto.
- Monitorización de métricas de infraestructura: para predecir el uso de CPU, memoria o tráfico de red en los próximos 64 pasos, ayudando a la planificación de capacidad y alertas tempranas.
- Planificación financiera: predicción de flujos de caja o precios de activos con intervalos de confianza, útil para análisis de riesgo y toma de decisiones.
- Gestión de energía: previsión de consumo eléctrico o generación renovable a corto plazo, integrable en sistemas de optimización de redes.
- Mantenimiento predictivo: predicción de indicadores de salud de maquinaria (vibración, temperatura) para anticipar fallos y programar mantenimientos.
- Análisis de series multivariantes: mediante `group_ids`, se pueden pronosticar conjuntamente múltiples series relacionadas (por ejemplo, ventas de varias tiendas de una misma región) capturando dependencias cruzadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de rendimiento comparativas en la model card ni en los repositorios consultados.

## Requisitos de hardware

- Tamaño del modelo: 0.5 GB en fp32, lo que implica un uso de memoria de aproximadamente 0.5 GB para los pesos, más overhead de activaciones y buffers.
- VRAM estimada para inferencia: al menos 1 GB para ejecución en GPU, aunque puede funcionar con menos si se limita el batch size. En CPU, se recomienda al menos 2 GB de RAM libre.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o superiores). También puede ejecutarse en CPU con ONNX Runtime, aunque con mayor latencia.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), integrable con sktime mediante el adaptador `Chronos2Forecaster`, o mediante servidores de inferencia como ONNX Runtime Server o Triton Inference Server.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware y del tamaño de batch.

## Comparativa con modelos similares

| Modelo | Contexto | Salida | Cuantiles | Licencia | Formato |
|---|---|---|---|---|---|
| `sktime/chronos2-onnx` (este) | 2048 | 64 pasos | 21 | Apache-2.0 | ONNX fp32 |
| `kashif/chronos-2-onnx` | 8192 | 64 pasos (configurable) | 21 | Apache-2.0 | ONNX (optimizado para transformers.js) |
| `amazon/chronos-2` (original) | 8192 (según documentación) | variable | 21 | Apache-2.0 | PyTorch / safetensors |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otros modelos de forecasting como TimesFM o Moirai.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por los autores del modelo original, aunque se ha verificado la fidelidad numérica dentro del 0.0001% del spread de predicción.
- Longitud de contexto fija de 2048 pasos: series más largas deben truncarse o segmentarse, lo que puede perder información relevante.
- Salida fija de 64 pasos: para horizontes de predicción mayores, es necesario re-exportar el modelo con un `num_output_patches` mayor, como se indica en el repositorio de referencia.
- Solo fp32: no se ofrecen versiones cuantizadas (int8, int4), lo que puede limitar su uso en dispositivos con memoria muy restringida.
- Riesgo de alucinación en forecasting: como todo modelo generativo, las predicciones pueden ser inexactas, especialmente en series con cambios de régimen o patrones no vistos en el entrenamiento.
- No soporta otros idiomas ni tareas de lenguaje: es exclusivamente para series temporales.
- La discrepancia entre encoder-only y encoder-decoder en las fuentes puede indicar diferencias en la implementación del export; se recomienda validar el comportamiento en el caso de uso específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sktime/chronos2-onnx
- Repositorio oficial de Chronos (Amazon Science): https://github.com/amazon-science/chronos-forecasting
- Export ONNX alternativo (kashif): https://huggingface.co/kashif/chronos-2-onnx
- Documentación de sktime para Chronos2Forecaster: https://www.sktime.net/models/chronos2forecaster/
- Repositorio con ejemplo de exportación ONNX: https://github.com/CCC2-0/Fashion-style-skill/tree/master/time_series_forecasting/chronos2
