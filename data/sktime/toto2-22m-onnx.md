# sktime/toto2-22m-onnx

## Resumen

El modelo `sktime/toto2-22m-onnx` es una exportación no oficial en formato ONNX (fp32, sin cuantizar) del modelo `Datadog/Toto-2.0-22m`, un modelo de forecasting de series temporales desarrollado por Datadog. Esta versión ha sido generada por la comunidad `sktime` para facilitar el despliegue en entornos que usan ONNX Runtime, manteniendo la compatibilidad con el ecosistema estándar de intercambio de modelos. El modelo original, Toto-2.0-22m, es el candidato ligero de producción de la familia Toto 2.0, con 22 millones de parámetros, diseñado para forecasting de observabilidad con baja latencia. Su arquitectura introduce una alternancia entre atención temporal y atención entre variantes, junto con bandas cuantiles nativas, lo que permite generar predicciones probabilísticas sin necesidad de ajuste fino (zero-shot). La exportación ONNX verifica que las salidas fp32 se mantienen dentro del 0,0003 % del spread del forecast oficial, garantizando fidelidad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención alternada tiempo/variante y bandas cuantiles nativas |
| Parametros totales | 22 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 pasos temporales |
| Tipos de cuantizacion | fp32 (sin cuantizar) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo base `Toto-2.0-22m` emplea una arquitectura Transformer que alterna bloques de atención a lo largo del eje temporal y del eje de variantes (series). Esta alternancia permite modelar dependencias tanto temporales como entre series simultáneamente, y las bandas cuantiles se generan directamente en la salida, sin necesidad de post-procesado adicional. El modelo está entrenado para forecasting zero-shot, es decir, puede aplicarse a series nuevas sin fine-tuning. En cuanto a los datos de entrenamiento, no se dispone de información detallada en la documentación consultada. La exportación ONNX mantiene la misma arquitectura y pesos, pero en formato estándar para su uso con ONNX Runtime. El contrato de entrada especifica un tensor `context` de forma `['variates', 2048]` con valores float32, donde los valores faltantes se representan con NaN y las series cortas deben rellenarse por la izquierda con NaN. También se requiere un tensor `series_ids` de tipo int64 que agrupa variantes que deben pronosticarse conjuntamente.

## Capacidades

- Generación de pronósticos cuantiles para series temporales: produce 9 niveles de cuantil (0.1 a 0.9) para cada paso futuro.
- Forecasting de 96 pasos en una sola pasada paralela.
- Soporte para múltiples variantes simultáneas, con agrupación opcional mediante `series_ids`.
- Manejo de valores faltantes (NaN) en la entrada, con relleno por la izquierda para series cortas.
- Funcionamiento zero-shot: no requiere entrenamiento adicional para nuevas series.
- Compatibilidad con ONNX Runtime, lo que permite integración en pipelines de inferencia estándar.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Monitorización de métricas de infraestructura: el modelo puede pronosticar métricas de sistemas (CPU, memoria, latencia) a partir de ventanas de contexto de 2048 puntos, generando bandas de confianza para alertas tempranas.
- Predicción de demanda en retail: dado un histórico de ventas diarias, se pueden obtener cuantiles de demanda futura para planificación de inventario.
- Análisis de tráfico de red: forecasting de volumen de peticiones o ancho de banda en servicios web, con detección de anomalías basada en los intervalos cuantiles.
- Optimización de capacidad en cloud: predecir uso de recursos para escalado automático, usando los cuantiles para dimensionar infraestructura de forma segura.
- Mantenimiento predictivo: pronosticar indicadores de salud de maquinaria (temperatura, vibración) para anticipar fallos.
- Integración en pipelines de datos con ONNX Runtime: al ser un modelo ONNX, puede desplegarse en entornos de producción con Python, C++ o Java, y ser servido mediante ONNX Runtime Serving o similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export ONNX solo indica que la salida fp32 se verificó dentro del 0,0003 % del spread del forecast oficial, pero no se proporcionan métricas de precisión (como MAE, RMSE, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 0,1 GB en disco (repo completo), lo que indica un peso de alrededor de 88 MB para los parámetros fp32 (22M × 4 bytes).
- Inferencia en CPU: viable sin GPU, gracias al tamaño reducido y a la optimización de ONNX Runtime.
- VRAM estimada: menos de 1 GB, incluso en GPU integradas.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM, aunque no es necesario para este modelo.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), también puede convertirse a otros formatos (TensorRT, OpenVINO) mediante herramientas de conversión.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 22M y una sola pasada de 96 pasos, se espera una latencia de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de forecasting de series temporales. El modelo base `Toto-2.0-22m` pertenece a la familia Toto 2.0, que incluye una variante más pequeña de 4M (Toto-2.0-4M) y posiblemente versiones mayores, pero no se han encontrado especificaciones detalladas de estos en la documentación consultada. Tampoco se dispone de datos de rendimiento comparativo con modelos como Chronos, TimesFM o PatchTST. Por tanto, la comparativa se limita a indicar que este modelo es una exportación ONNX del original, sin diferencias funcionales.

## Limitaciones y advertencias

- Exportación no oficial: no está afiliada ni respaldada por Datadog, los autores del modelo original.
- Solo para series temporales numéricas: no es aplicable a texto, imágenes u otros tipos de datos.
- Contexto limitado a 2048 pasos: series más largas deben truncarse o segmentarse.
- Requiere preprocesamiento específico: las series cortas deben rellenarse con NaN por la izquierda, y los valores faltantes deben codificarse como NaN.
- Sin garantía de rendimiento: al ser una conversión no oficial, podrían existir diferencias numéricas mínimas (aunque verificadas dentro del 0,0003 %).
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base por si hubiera restricciones adicionales.
- No se proporcionan métricas de precisión ni benchmarks, por lo que el rendimiento real en casos de uso específicos debe evaluarse de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sktime/toto2-22m-onnx
- Modelo base (Datadog/Toto-2.0-22m): https://huggingface.co/Datadog/Toto-2.0-22m
- Ficha del modelo en TSFM.ai: https://tsfm.ai/models/Datadog%2FToto-2.0-22m
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
