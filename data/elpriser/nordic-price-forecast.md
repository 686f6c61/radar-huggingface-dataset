# Elpriser/nordic-price-forecast

## Resumen

El modelo `Elpriser/nordic-price-forecast` es un sistema de regresión tabular basado en LightGBM que genera predicciones horarias del precio de electricidad day-ahead (mercado de día siguiente) en EUR/MWh para las 13 zonas de oferta de Dinamarca, Noruega, Suecia, Finlandia y Países Bajos (DK1, DK2, NO1-NO5, SE1-SE4, FI, NL). Desarrollado por el usuario Elpriser, el modelo se reentrena y se re-sube a HuggingFace diariamente, por lo que los pesos publicados corresponden a la versión en producción.

El modelo resuelve el problema de la previsión de precios eléctricos a corto plazo (horizonte de 2 a 9 días) en mercados nórdicos interconectados, donde la hidrología de los embalses y la meteorología juegan un papel determinante. Su relevancia actual radica en la volatilidad creciente de los mercados eléctricos europeos y en la necesidad de herramientas de optimización para consumidores, comercializadoras y productores. La arquitectura es un único modelo LightGBM con regresión cuantil que agrupa las 13 zonas mediante una variable categórica `zone`, en lugar de entrenar trece modelos independientes, lo que permite compartir información entre zonas y simplificar el mantenimiento. El contexto de entrada son 30 características por fila, que incluyen calendario, precios históricos, meteorología de la zona y datos agregados de embalses hidroeléctricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting) con regresion cuantil |
| Parametros totales | no disponible (modelo tabular, no de red neuronal) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo tabular, 30 caracteristicas por fila) |
| Tipos de cuantizacion | no aplicable (formato nativo LightGBM) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | modelo LightGBM (formato binario propio, .txt o .json) |

## Arquitectura y entrenamiento

El modelo es un único LightGBM de regresión cuantil que cubre las 13 zonas de oferta. La variable `zone` se introduce como característica categórica, lo que permite que el modelo comparta estructura entre zonas (efectos de calendario, física meteorológica, comportamiento de retardos) mientras que las características `last_day_mean` y `level_30d` (media móvil de 30 días de la zona) permiten identificar el nivel de precios específico de cada zona antes de modelar las desviaciones. El diseño de pooling evita tener que mantener trece modelos separados.

El entrenamiento se realiza con una metodología de backtest de origen rodante (rolling-origin) con reentrenamiento mensual, probado entre abril de 2025 y julio de 2026. Se utilizan 30 características por fila: calendario (hora, día de la semana, mes, día del año con codificación seno/coseno), precios históricos con retardos (lag1/2/3/7/14/21/28, solo cuando son conocidos en el momento de emisión), meteorología de la propia zona (viento, radiación, temperatura, precipitación) y datos regionales (viento regional, temperatura regional, precipitación hidrológica, nivel de embalses). Los datos meteorológicos provienen del archivo de ejecuciones anteriores de Open-Meteo, de modo que las filas de entrenamiento contienen la misma calidad de información que recibe el modelo en producción. La inclusión de niveles de embalse (datos ENTSO-E A72, con retardo de 14 días, expresados como porcentaje del máximo y como desviación respecto a la mediana de la zona para esa semana del año) fue clave: sin ellos, el modelo perdía frente a una media estacional simple en NO1 y NO2; con ellos, ambas zonas pasaron a superar la línea base. El modelo se post-procesa con una mezcla de forma (shape blend): se conserva el nivel diario del modelo y la forma intradía se combina al 50% con un perfil estacional de 4 semanas. Las bandas de incertidumbre son cuantiles empíricos residuales aditivos, no cuantiles escalados del modelo.

## Capacidades

- Previsión horaria del precio de electricidad day-ahead en EUR/MWh para 13 zonas de oferta nórdicas y neerlandesas.
- Horizonte de predicción de 2 a 9 días vista, con error medio absoluto (MAE) que crece suavemente de 20,1 EUR/MWh (horizonte 2) a 23,6 EUR/MWh (horizonte 9).
- Regresión cuantil: proporciona bandas de incertidumbre basadas en cuantiles empíricos residuales, útiles para gestión de riesgo.
- Identificación del nivel de precios de cada zona mediante características de media móvil y nivel de 30 días.
- Capacidad de explotar la hidrología de embalses como factor determinante en los precios nórdicos, incluyendo el agregado nórdico que afecta a todas las zonas por acoplamiento de mercado.
- Post-procesado con mezcla de forma estacional para mejorar la precisión horaria y el ranking de horas.
- Modelo reentrenado y re-subido diariamente, lo que garantiza que los pesos publicados reflejan la configuración de producción.

## Casos de uso

- Optimización de compra de energía para grandes consumidores industriales: una empresa con consumo intensivo puede programar sus procesos en las horas más baratas pronosticadas, reduciendo su factura eléctrica. El modelo proporciona predicciones horarias con 2-9 días de antelación, suficiente para planificar turnos de producción.
- Gestión de baterías y almacenamiento energético: los operadores de sistemas de almacenamiento pueden decidir cuándo cargar y descargar según los precios previstos, maximizando el margen de arbitraje. Las bandas de incertidumbre ayudan a calibrar el riesgo de las operaciones.
- Comercializadoras de electricidad: para fijar tarifas dinámicas a sus clientes o cubrir su exposición en el mercado mayorista, necesitan previsiones fiables de precios por zona. El modelo cubre 13 zonas con un único artefacto, simplificando la integración.
- Trading algorítmico en mercados eléctricos: los traders pueden usar las predicciones como señal para estrategias de compraventa en el mercado day-ahead, complementando sus modelos propios con una visión de medio plazo (2-9 días).
- Análisis de riesgo y planificación financiera: los generadores hidroeléctricos pueden decidir cuánta agua turbinar hoy frente a retenerla para el futuro, basándose en las previsiones de precios y en los niveles de embalse. El modelo incorpora explícitamente datos de reservas hidrológicas.
- Monitorización de mercados y alertas tempranas: un analista energético puede configurar alertas cuando el modelo predice precios extremos en una zona concreta, permitiendo anticipar situaciones de tensión en el sistema.

## Benchmarks y rendimiento

La model card proporciona resultados de backtest de origen rodante con reentrenamiento mensual, evaluado de abril de 2025 a julio de 2026. Las métricas son MAE (error absoluto medio), regret (coste de seguir las tres horas más baratas pronosticadas frente a la elección perfecta) y captura (porcentaje del ahorro temporal disponible que el modelo consigue). Se compara contra una línea base estacional y contra persistencia.

| Zona | Precio medio (EUR/MWh) | MAE (EUR/MWh) | Regret (EUR/MWh) | Regret línea base estacional | Capturado |
|---|---|---|---|---|---|
| DK1 | 86,4 | 25,6 | 6,0 | 7,0 | 89% |
| DK2 | 87,8 | 26,9 | 7,2 | 8,3 | 87% |
| NL | 90,2 | 23,5 | 7,8 | 8,6 | 88% |
| SE4 | 70,6 | 27,0 | 7,4 | 8,5 | 83% |
| SE3 | 55,6 | 22,8 | 6,6 | 7,1 | 79% |
| NO2 | 80,4 | 19,0 | 6,6 | 7,2 | 79% |
| NO1 | 75,3 | 20,5 | 7,9 | 8,5 | 73% |
| FI | 49,1 | 31,8 | 10,7 | 12,4 | 65% |
| NO5 | 68,5 | 17,2 | 7,0 | 7,7 | 60% |
| SE1 | 30,2 | 21,3 | 7,0 | 7,5 | 55% |
| SE2 | 30,4 | 22,1 | 7,2 | 7,9 | 54% |
| NO3 | 46,8 | 16,6 | 7,8 | 8,3 | 46% |
| NO4 | 22,2 | 14,1 | 6,0 | 6,5 | 46% |

El MAE agrupado es de 22,2 EUR/MWh, frente a 25,7 de la línea base estacional y 28,2 de persistencia. El modelo supera a la línea base estacional en regret en las 13 zonas. El regret absoluto es notablemente uniforme (6-8 EUR/MWh en casi todas las zonas, con FI como única excepción en 10,7), lo que indica un rendimiento consistente en mercados con precios medios que varían cuatro veces entre zonas. La métrica "capturado" es baja en zonas con poca dispersión de precios (NO3, NO4, SE1, SE2) porque hay poco margen de mejora, no porque el pronóstico sea peor.

## Requisitos de hardware

- Al ser un modelo LightGBM de tamaño reducido (número de árboles y profundidad no especificados, pero típicamente decenas de MB), la inferencia es extremadamente ligera.
- Puede ejecutarse en CPU sin GPU; el coste computacional por predicción es del orden de milisegundos para una fila.
- No requiere VRAM ni GPU dedicada. Cualquier máquina con 1-2 GB de RAM libre es suficiente para cargar el modelo y realizar inferencias en lote.
- El entrenamiento diario (con reentrenamiento mensual en backtest) es factible en una CPU moderna de gama media, aunque los tiempos exactos no se especifican.
- Opciones de despliegue: al ser un modelo LightGBM, se puede servir mediante la librería nativa de LightGBM, o exportar a formato PMML o MLeap para integración en pipelines de streaming o batch. No requiere infraestructura de inferencia especializada como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para previsión de precios eléctricos nórdicos en el contexto de esta ficha. El modelo compañero `Elpriser/denmark-price-forecast` está especializado únicamente en Dinamarca y puede considerarse una alternativa de alcance más limitado. No hay datos públicos de otros modelos de la misma categoría (LightGBM de regresión tabular para precios eléctricos) con los que comparar métricas. Se indica "no disponible" por falta de referencias contrastadas.

## Limitaciones y advertencias

- Las métricas de MAE porcentual pueden inducir a error: un MAE de 14,1 EUR/MWh en NO4 (precio medio 22 EUR/MWh) se lee como 64% de error relativo, mientras que DK1 con MAE 25,6 sobre precio medio 86,4 parece mejor, aunque el error absoluto es mayor. El autor advierte explícitamente de este sesgo.
- La tasa de acierto en la hora más barata (hit-rate) mide la dispersión diaria de precios, no la habilidad del modelo. En zonas con poca dispersión (NO4, NO3) la tasa es baja y puede interpretarse erróneamente como mal rendimiento.
- El modelo depende de datos meteorológicos de Open-Meteo y de niveles de embalse de ENTSO-E. Si estas fuentes fallan o se retrasan, las predicciones se degradan. La calidad de las previsiones meteorológicas a 9 días vista es limitada y afecta al horizonte más largo.
- El modelo está diseñado para los mercados nórdicos y neerlandés; su aplicación a otras regiones requeriría reentrenamiento con datos locales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales sobre los datos de entrenamiento o los términos de uso de los datos de ENTSO-E.
- No es un modelo de lenguaje ni de generación de texto; no debe utilizarse para tareas de NLP.
- El modelo se reentrena diariamente, por lo que los pesos descargados en un momento dado pueden quedar obsoletos en 24 horas si se quiere replicar exactamente la versión en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elpriser/nordic-price-forecast
- Modelo compañero (solo Dinamarca): https://huggingface.co/Elpriser/denmark-price-forecast
- Fuente de datos meteorológicos: Open-Meteo (https://open-meteo.com)
- Fuente de datos de embalses: ENTSO-E (https://transparency.entsoe.eu)
