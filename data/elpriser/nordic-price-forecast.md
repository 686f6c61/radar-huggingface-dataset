# Elpriser/nordic-price-forecast

## Resumen

Nordic + NL Electricity Price Forecast es un modelo de regresión tabular desarrollado por Elpriser que predice los precios horarios del mercado eléctrico day-ahead en 13 zonas de oferta del norte de Europa y los Países Bajos: DK1, DK2, NO1 a NO5, SE1 a SE4, FI y NL. La predicción se emite en EUR/MWh con un horizonte de 2 a 9 días vista y resolución horaria, lo que lo sitúa en el segmento de previsión de series temporales aplicada a mercados energéticos.

Técnicamente no es una red neuronal ni un transformer: se trata de un único modelo LightGBM de regresión cuantílica con `zone` como variable categórica, entrenado de forma agrupada para las 13 zonas en lugar de mantener trece modelos independientes. La decisión de diseño se justifica porque las zonas comparten estructura (efectos de calendario, física meteorológica, comportamiento de lags), de modo que el pooling permite que una zona con pocos datos se beneficie de otra con más volumen.

El modelo se reentrena y resubida diariamente, por lo que los pesos publicados coinciden con los que se ejecutan en producción. Su relevancia práctica está en el coste de la decisión que soporta: el backtest reporta un regret de 6 a 8 EUR/MWh en casi todas las zonas frente a una línea base estacional, con un MAE agrupado de 22,2 EUR/MWh.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LightGBM, regresión cuantílica con variable categórica de zona (modelo agrupado para 13 zonas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de features de 30 columnas por fila, con lags de hasta 28 días |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | modelo LightGBM (librería `lightgbm`); no se especifica serialización en la información disponible |
| Horizonte de predicción | 2 a 9 días, resolución horaria |
| Zonas cubiertas | DK1, DK2, NO1–NO5, SE1–SE4, FI, NL (13 zonas) |
| Unidad de salida | EUR/MWh |
| Features por fila | 30 |
| Pipeline | tabular-regression |

## Arquitectura y entrenamiento

El modelo es un LightGBM de regresión cuantílica entrenado sobre 30 features por fila para cada horizonte `h` entre 2 y 9 días. Las features se agrupan en cuatro bloques: zona y calendario (`zone`, `h`, `hour`, `weekday`, `month`, `is_weekend`, `doy_sin`, `doy_cos`); historial de precios (`lag1/2/3/7/14/21/28`, `seasonal4w`, `last_day_mean`, `level_30d`); meteorología de la propia zona al lead correcto (`wind`, `rad`, `temp`, `precip`, `precip_24h`); estado regional (`reg_wind`, `reg_temp`, `hydro_precip`, `hydro_precip_7d`); y niveles de embalses (`reservoir_pct`, `reservoir_anom`, `nordic_reservoir_anom`).

Dos decisiones de entrenamiento son destacables. La primera es que los lags de precio se rellenan solo cuando se conocen en el momento de emisión (`k >= h-1`), lo que evita fuga de información entre el momento de la predicción y el de la entrega. La segunda es el uso de Open-Meteo previous-runs archive: la meteorología se toma tal como se emitió N días antes de la entrega, de modo que las filas de entrenamiento tienen la misma calidad de información que verá el modelo en producción, en lugar de usar análisis meteorológicos perfectos.

Los datos hidrológicos provienen de ENTSO-E A72 (niveles semanales de embalses), con un lag de 14 días, expresados como fracción del máximo y como desviación respecto a la mediana de la zona para esa semana del año. La inclusión de esta señal fue una corrección tras un primer backtest en el que el modelo perdía frente a una media estacional simple en NO1 (+1,3%) y NO2 (+8,1%); con los embalses, NO1 pasó a −1,7% y NO2 a −0,3%. El agregado nórdico se proporciona a todas las zonas, incluidas DK y NL, porque el mercado está acoplado.

En post-proceso se aplican dos transformaciones: un shape blend que conserva el nivel diario predicho y mezcla la forma intradía al 50/50 con un perfil estacional de 4 semanas, y bandas de incertidumbre construidas como cuantiles empíricos aditivos de los residuos, no como cuantiles del modelo reescalados.

## Capacidades

- Predicción horaria de precio eléctrico day-ahead en EUR/MWh para 13 zonas, con horizonte de 2 a 9 días.
- Modelo único agrupado: una sola inferencia cubre las 13 zonas mediante la feature categórica `zone`.
- Identificación explícita del nivel de precio de cada zona mediante `last_day_mean` y `level_30d`, lo que permite comparar zonas con niveles medios muy distintos (NO4 a 22 EUR/MWh frente a NL a 90 EUR/MWh).
- Captura de efectos de calendario: hora, día de la semana, mes, fin de semana y codificación cíclica del día del año.
- Integración de meteorología con calidad de pronóstico real (previous-runs), incluyendo viento, radiación, temperatura y precipitación.
- Modelización de hidrología nórdica mediante niveles de embalses y anomalías respecto a la mediana estacional.
- Producción de bandas de incertidumbre empíricas por horizonte.
- Reentrenamiento diario, con pesos publicados alineados con producción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico de regresión tabular.

## Casos de uso

- Gestión de compra de energía en cartera: el modelo permite decidir en qué horas de los próximos 2 a 9 días conviene concentrar el consumo, usando el ranking de las tres horas más baratas que el propio autor evalúa con la métrica de regret.
- Optimización de carga flexible industrial: con un regret de 6 a 8 EUR/MWh en la mayoría de zonas, un consumidor con capacidad de desplazar carga entre horas obtiene un ahorro acotado y predecible al seguir la previsión.
- Planificación de baterías y almacenamiento: la predicción horaria con 9 días de horizonte sirve para programar ciclos de carga y descarga, aunque el modelo no proporciona directamente el spread esperado ni la volatilidad intradía.
- Trading algorítmico en mercados day-ahead: el modelo entrega una señal de precio por zona y hora que puede integrarse como feature en una estrategia más amplia; su valor está en el ranking horario y en el nivel de precio, no en una probabilidad calibrada de evento extremo.
- Cobertura y presupuestación de costes energéticos: empresas con exposición a varias zonas nórdicas o a NL pueden generar escenarios de coste a 9 días con bandas empíricas para aprovisionamiento y planificación financiera.
- Operación de district heating y sistemas térmicos: la información meteorológica integrada (temperatura, viento, radiación) junto con el precio permite programar la producción térmica en las horas de menor coste.
- Análisis de acoplamiento de mercados: la inclusión del agregado nórdico de embalses en todas las zonas permite estudiar cómo un año seco en Noruega eleva precios más allá de Noruega, útil para investigación sobre transmisión de precios.
- Investigación en previsión de series temporales: el modelo sirve como baseline tabular fuerte y reproducible (MAE agrupado 22,2 frente a 25,7 de la línea base estacional y 28,2 de persistencia) para comparar con aproximaciones neuronales.

## Benchmarks y rendimiento

Backtest de origen rodante con reentrenamiento mensual, periodo de prueba de abril de 2025 a julio de 2026. Regret expresado en EUR/MWh; "captured" es la fracción del ahorro por timing disponible que captura el modelo frente a operar en una hora aleatoria.

| Zona | Precio medio | MAE | Regret | Regret, baseline estacional | Captured |
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

Métricas agregadas: MAE agrupado de 22,2 EUR/MWh frente a 25,7 de la línea base estacional y 28,2 de persistencia. El MAE por horizonte crece de 20,1 (h=2) a 23,6 (h=9). El modelo supera la línea base estacional en regret en las 13 zonas.

El autor advierte explícitamente de dos métricas engañosas: el MAE porcentual penaliza zonas baratas (NO4 tiene MAE de 14,1 EUR/MWh, inferior al 25,6 de DK1, pero lee 64% porque su precio medio es 22), y la tasa de acierto en hora mínima mide el spread diario más que la habilidad del modelo (NL con spread mediano de 128 EUR/MWh alcanza 77%, mientras NO4 con 12 EUR/MWh alcanza 24%).

## Requisitos de hardware

- Inferencia en CPU: LightGBM sobre datos tabulares con 30 features por fila; el coste por predicción es de milisegundos y no requiere GPU.
- VRAM estimada: no aplica; el modelo no se ejecuta en GPU para inferencia estándar.
- GPU recomendadas: no aplica. No hay versión GPU documentada ni necesidad práctica de ella.
- Cabe en cualquier máquina consumer: un portátil convencional puede ejecutar el modelo para las 13 zonas y los 8 horizontes.
- Despliegue: la librería `lightgbm` es la vía natural; también es posible exportar a otros runtimes de árboles potenciados. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito operativo relevante: el modelo se reentrena y resubida a diario, por lo que un despliegue en producción necesita un mecanismo de actualización periódica de pesos.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Horizonte | MAE / métrica | Licencia |
|---|---|---|---|---|---|
| Elpriser/nordic-price-forecast | LightGBM agrupado, 13 zonas | Nórdicos + NL | 2–9 días, horario | MAE agrupado 22,2 EUR/MWh; regret 6–10,7 | CC-BY-4.0 |
| Elpriser/denmark-price-forecast | LightGBM especializado | Solo Dinamarca | no disponible | no disponible | no disponible |
| Línea base estacional (referencia del autor) | Media estacional | Nórdicos + NL | mismo | MAE agrupado 25,7 EUR/MWh | no aplica |
| Persistencia (referencia del autor) | Último valor conocido | Nórdicos + NL | mismo | MAE agrupado 28,2 EUR/MWh | no aplica |

No se dispone en la información proporcionada de comparación con otros modelos públicos de previsión de precios eléctricos de terceros.

## Limitaciones y advertencias

- El MAE porcentual no es comparable entre zonas: penaliza sistemáticamente a las zonas de precio bajo. Para evaluar el modelo debe usarse regret, no MAE relativo.
- La tasa de acierto en hora mínima está dominada por el spread diario de la zona. En NO4, con 12 EUR/MWh de spread mediano y un 28% de días prácticamente planos, la métrica es cercana al azar y no informa sobre la calidad del pronóstico.
- El modelo no es un transformer ni un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- La cobertura geográfica está limitada a 13 zonas concretas; no hay soporte para otras zonas europeas ni para mercados fuera del ámbito nórdico-neerlandés.
- El horizonte máximo es de 9 días; no se documenta comportamiento más allá.
- Dependencia de fuentes externas: Open-Meteo (previous-runs) y ENTSO-E A72. Una interrupción o un cambio en estas fuentes afecta a la generación de features y, por tanto, a la validez de las predicciones.
- Los datos hidrológicos se incorporan con un lag de 14 días, lo que limita la reactividad ante cambios bruscos en los embalses.
- Las bandas de incertidumbre son cuantiles empíricos aditivos de los residuos; no se documenta su calibración condicional por régimen de mercado.
- Licencia CC-BY-4.0: permite uso comercial con atribución. Es necesario citar al autor y enlazar la licencia en cualquier redistribución o producto derivado.
- Reentrenamiento diario: los resultados de un backtest histórico no garantizan el comportamiento de los pesos actuales, que cambian a diario.
- No se documentan sesgos específicos ni análisis de robustez ante eventos extremos de mercado.
- El autor no publica información sobre el número de árboles, profundidad, hiperparámetros ni tamaño del modelo, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elpriser/nordic-price-forecast
- Modelo compañero para Dinamarca: https://huggingface.co/Elpriser/denmark-price-forecast
- Open-Meteo, archivo de ejecuciones previas (fuente meteorológica): https://open-meteo.com/
- ENTSO-E Transparency Platform, dataset A72 (niveles de embalses): https://transparency.entsoe.eu/
- Librería LightGBM: https://github.com/microsoft/LightGBM
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
