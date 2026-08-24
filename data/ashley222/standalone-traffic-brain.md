# ashley222/standalone-traffic-brain

## Resumen

Standalone Traffic Brain es un modelo compacto de pronóstico de flujo de tráfico basado en una red neuronal recurrente (RNN) con arquitectura de Global Workspace, desarrollado por el usuario ashley222. Su objetivo es predecir el flujo de tráfico con 15 minutos de antelación a partir de lecturas de 36 sensores de carretera, y está diseñado específicamente para mantener un rendimiento aceptable cuando los sensores presentan ruido o fallan parcialmente. El modelo se entrenó con ruido gaussiano y dropout de sensores para mejorar su tolerancia a fallos, una característica relevante en entornos de monitorización de tráfico real donde los sensores no siempre son fiables.

El modelo se evaluó en el conjunto de datos UCI Traffic Flow Forecasting, que contiene mediciones de sensores en autopistas del norte de Virginia y Washington D.C. Aunque no supera a un MLP pequeño en datos limpios, reduce el error absoluto medio (MAE) en un 24,7% cuando el 20% de los sensores están ausentes, lo que lo hace especialmente útil en escenarios de degradación de infraestructura. Es un modelo de investigación, con licencia GPL-3.0, y no está pensado para uso en sistemas de control de tráfico críticos sin una validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN recurrente con mecanismo de Global Workspace |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (series temporales, ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (librería PyTorch, probablemente .pt o .bin) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura recurrente compacta inspirada en el concepto de Global Workspace, que permite integrar información de múltiples sensores de forma coordinada. Se entrenó con el dataset UCI Traffic Flow Forecasting (Zhao, 2019, DOI 10.24432/C57897), que contiene registros de 36 sensores de tráfico. Durante el entrenamiento se aplicaron dos técnicas de regularización: ruido gaussiano (con desviación 0.15) y dropout de sensores (eliminación aleatoria del 20% de las entradas), con el fin de simular condiciones de degradación. No se dispone de información sobre el número de tokens, épocas, tamaño de lote ni si se utilizó algún esquema de aprendizaje por refuerzo o ajuste fino adicional. El modelo se evaluó con tres semillas fijas sobre la partición de test oficial, aunque el autor advierte que dicha partición se consultó durante el desarrollo, por lo que los resultados deben considerarse como métricas de desarrollo, no como una evaluación ciega.

## Capacidades

- Pronóstico de flujo de tráfico a 15 minutos vista para 36 sensores simultáneamente.
- Robustez ante sensores con ruido gaussiano o ausencia parcial de datos (hasta un 20% de sensores faltantes).
- Manejo de series temporales multivariadas con dependencias espaciales entre sensores.
- Inferencia en modo batch, con reinicio del estado entre lotes independientes (sin contexto persistente).
- No incluye capacidades de generación de texto, tool calling, visión ni procesamiento de lenguaje natural.

## Casos de uso

- Monitorización de tráfico en tiempo real con sensores degradados: el modelo puede integrarse en paneles de control de autopistas donde algunos sensores fallan temporalmente, manteniendo predicciones útiles gracias a su entrenamiento con dropout.
- Planificación de rutas dinámicas: las predicciones a 15 minutos pueden alimentar sistemas de navegación para anticipar congestiones y sugerir desvíos, especialmente en situaciones de infraestructura parcialmente dañada.
- Gestión de congestión urbana: los operadores de tráfico pueden usar las salidas del modelo para activar semáforos o señales variables con antelación, reduciendo el impacto de atascos inminentes.
- Investigación en robustez de modelos de series temporales: sirve como punto de referencia para estudiar técnicas de regularización ante ruido y datos faltantes en dominios de sensores.
- Análisis de datos de sensores de carreteras: permite imputar valores faltantes o suavizar lecturas ruidosas en estudios retrospectivos de flujo vehicular.
- Prototipos de sistemas de control de tráfico no críticos: puede usarse en entornos de simulación o investigación donde la tolerancia a fallos sea más importante que el rendimiento en datos limpios.

## Benchmarks y rendimiento

La model card reporta el error absoluto medio (MAE) en tres condiciones de evaluación, comparando con un MLP pequeño. No se proporcionan valores de RMSE ni otros benchmarks estándar.

| Condicion | MLP pequeño MAE | Standalone Traffic Brain MAE |
|---|---:|---:|
| Datos limpios | 0.03272 | 0.03504 |
| Ruido gaussiano (0.15) | 0.03479 | 0.03531 |
| 20% sensores ausentes | 0.06387 | **0.04811** |

El modelo reduce el MAE en un 24,7% respecto al MLP en la condición de sensores ausentes, pero es ligeramente inferior en datos limpios y con ruido. No se han publicado resultados en otros conjuntos de datos ni comparaciones con modelos de pronóstico de tráfico más extendidos.

## Requisitos de hardware

- Al ser un modelo compacto (sin datos de parámetros, pero descrito como "compacto"), es probable que pueda ejecutarse en CPU sin problemas, aunque no se especifican requisitos mínimos.
- No se indica VRAM estimada ni GPU recomendada. Dado que es una RNN pequeña, cualquier GPU con al menos 2 GB de VRAM sería suficiente, pero esto es una estimación razonable, no un dato oficial.
- Es compatible con entornos PyTorch estándar; se puede desplegar con TorchServe, o exportar a ONNX para inferencia en producción.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (pronóstico de tráfico robusto con RNN). La única comparación publicada es con un MLP pequeño, que se muestra en la tabla de benchmarks. No se pueden establecer comparaciones con otros modelos como Prophet, LSTNet o Transformers de series temporales sin datos adicionales.

## Limitaciones y advertencias

- El modelo fue evaluado únicamente en la red de sensores de Virginia/Washington D.C.; no se debe asumir que generaliza a otras ciudades o redes sin reentrenamiento.
- La partición de test oficial se utilizó durante el desarrollo iterativo, por lo que las métricas pueden estar optimistas y no representan una evaluación ciega.
- El contexto persistente está deshabilitado operativamente: el estado se reinicia entre lotes independientes, lo que impide capturar dependencias temporales a largo plazo sin un entrenamiento específico.
- Es un modelo de investigación, no un sistema de control de tráfico crítico; no debe usarse para tomar decisiones de seguridad sin validación adicional.
- La licencia GPL-3.0 implica que cualquier uso comercial o integración en software propietario debe cumplir con los términos de copyleft, lo que puede limitar su adopción en entornos cerrados.
- No se han documentado sesgos específicos, pero al entrenarse con datos de una región concreta, puede reflejar patrones de tráfico locales que no se transfieren a otros contextos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashley222/standalone-traffic-brain
- Dataset UCI Traffic Flow Forecasting: DOI 10.24432/C57897 (referenciado en la model card, sin URL directa)
- No se encontraron otros enlaces relevantes en la búsqueda web (papers, repositorios o demos adicionales).
