# Elpriser/gb-price-estimate

## Resumen

`gb-price-estimate` es un modelo de regresión tabular publicado por Elpriser para estimar precios horarios de electricidad en el mercado británico (Great Britain) a partir del Market Index Price de Elexon. El repositorio incluye dos artefactos: `gb-est-v1`, un conjunto de modelos LightGBM y regresiones ridge que rellenan las horas del día aún no publicadas y los días D+1 a D+7, y `hour23-v1`, una regla determinista sin pesos entrenados que estima la hora 23 de Portugal e Irlanda cuando aún no hay precio de subasta.

El modelo no es un LLM ni un transformer: es un ensemble de boosting de árboles sobre features tabulares de series temporales (precios realizados, lags, perfiles semanales, festivos y predicción meteorológica de Open-Meteo). Resuelve un problema operativo concreto: en el mercado intradiario británico los precios aparecen hora a hora, de modo que por la noche solo se conocen unas pocas horas del día y no existe información del día siguiente. El modelo produce una estimación puntual con banda P10-P90 para el resto del día y para los siete días siguientes.

Es relevante por su enfoque de ingeniería: pesos en formato texto (sin pickles), código de producción verbatim, auditoría de licencias de todas las fuentes de datos y una comprobación de reproducibilidad con tolerancia de 1e-6 GBP/MWh. No obstante, el propio autor advierte de un deterioro del rendimiento desde la subida de precios de septiembre de 2026: el sesgo es de 6 a 13 GBP/MWh por debajo y la cobertura de la banda cae al 61-71 %, frente al 77-81 % del backtest completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: LightGBM (tres boosters: mediana, P10 y P90) y 64 regresiones ridge (8 horas as-of x 8 offsets de día), ambas sobre el residuo de una referencia naive "nivel + perfil semanal" |
| Parametros totales | No disponible (modelos de árboles y lineales; el repositorio ocupa 0.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de features basada en los últimos 365 días de entrenamiento y 60 días de precios descargados en inferencia |
| Tipos de cuantizacion | No aplica; pesos en formato texto (`lgb50.txt`, `lgb10.txt`, `lgb90.txt`) y arrays NumPy (`.npz`) |
| Idiomas soportados | No disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | LightGBM en texto plano y ridge en `.npz`; configuración en `config.json` |
| Pipeline | `tabular-regression` |
| Libreria | LightGBM |
| Region | Great Britain (modelo principal); Portugal e Irlanda (regla hora 23) |
| Fecha de snapshot | 2026-11-03 (según `config.json`; reentrenamiento diario en producción, refresco semanal del repo) |

## Arquitectura y entrenamiento

El modelo principal combina dos aproximaciones sobre el mismo objetivo residual. La referencia naive es la media de los últimos 7 días completos más el perfil del mismo día de la semana de las últimas 4 semanas. Sobre ese residuo se entrena, por un lado, una ridge por cada hora as-of (00, 02, 05, 08, 11, 14, 17 y 20 hora de Londres) y cada offset de día (resto de hoy y D+1 a D+7), usando los últimos 365 días; por otro, un LightGBM. La predicción final es la media de ambos. Las features incluyen los residuos realizados de las horas ya cerradas del día (con decaimiento según las horas restantes), lags de precio disponibles solo si el día está completo, día de la semana, hora, festivos de Inglaterra y Gales y la predicción de Open-Meteo tal como se emitió (API previous-runs: viento a 100 m, radiación directa, temperatura y precipitación en tres puntos: Escocia/Mar del Norte, Midlands y sur del Mar del Norte).

Los árboles reciben deliberadamente el nivel absoluto de precio: una versión que lo incluía resultó 17-25 GBP/MWh por debajo tras la subida de precios, porque los árboles no extrapolan. Las bandas P10 y P90 provienen de dos modelos cuantílicos LightGBM más offsets calculados como cuantiles de error rodantes de 180 días multiplicados por 1,2. El entrenamiento usa precios de Elexon desde 2023-01-01 y meteorología desde 2024-04-25, con 1,34 millones de filas. No hay RLHF, DPO ni datos de gas o CO2. La regla `hour23-v1` para Portugal e Irlanda no tiene pesos entrenados: usa persistencia (precio de la hora 22) o `med28` (hora 22 más la mediana de la diferencia hora 23 menos hora 22 en los últimos 28 días completos), según la zona, con offsets P10-P90 definidos en `gate/hour23_gate.json`.

## Capacidades

- Estimación puntual del Market Index Price de Elexon para el resto del día actual, reevaluada cada hora.
- Predicción de precios para los días D+1 a D+7, sujeta a un gate de publicación por clase.
- Intervalos de predicción P10-P90 mediante modelos cuantílicos y offsets calibrados.
- Estimación de la hora 23 en Portugal e Irlanda mediante regla determinista (persistencia o mediana de 28 días).
- Integración de predicción meteorológica ex-ante (previous-runs) para evitar fuga de información.
- Ingesta y parseo de datos de Elexon y Open-Meteo incluidos como módulos de producción.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Visualización de precios en portales energéticos: el modelo rellena las horas sin precio y las marca como "Skøn" (estimación), nunca como precio oficial, lo que permite mostrar una curva completa a los usuarios de elpriser.org sin esperar a la publicación de Elexon.
- Planificación de consumo doméstico: con la estimación de las horas restantes del día y de los próximos 7 días, un sistema doméstico puede programar lavadora, calefacción o carga de vehículo eléctrico en las franjas previstas más baratas.
- Gestión de carteras de flexibilidad: un agregador puede usar la banda P10-P90 para decidir con qué margen ofrecer reducción de demanda en horas concretas, asumiendo el riesgo de que la banda no cubra el precio real.
- Trading intradiario de corto plazo: el sesgo documentado de 6-13 GBP/MWh por debajo desde septiembre de 2026 obliga a aplicar una corrección manual antes de usar la señal en decisiones económicas.
- Investigación sobre mercados eléctricos: el repositorio ofrece código de producción verbatim, auditoría de licencias y una referencia naive reproducible, útil como baseline para comparar modelos de forecasting de precios.
- Relleno de series para análisis retrospectivo: la regla `hour23-v1` permite completar la última hora de Portugal e Irlanda en pipelines de análisis que necesitan series continuas antes de la siguiente subasta.
- Despliegue en infraestructura mínima: al ser LightGBM y ridge con pesos en texto, el modelo se ejecuta en CPU sin GPU y sin dependencias pesadas, adecuado para un cron horario en un servidor pequeño.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Mejora frente a "nivel + perfil semanal" (MAE, backtest) | 14-42 % |
| Cobertura de la banda P10-P90 en el backtest completo | 77-81 % de las horas |
| Cobertura de la banda P10-P90 desde septiembre de 2026 | 61-71 % de las horas |
| Sesgo desde septiembre de 2026 | 6-13 GBP/MWh por debajo del precio real |
| Error en producción | No medido todavía |
| Reproducibilidad | Predicción de producción reproducida a 1e-6 GBP/MWh el 2026-11-03 con entradas congeladas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: LightGBM y ridge no requieren GPU; el repositorio ocupa 0.0 GB y los pesos son ficheros de texto y arrays pequeños.
- VRAM estimada: 0 GB; no aplica aceleración por GPU.
- GPU recomendadas: ninguna; el cuello de botella es la descarga de datos de Elexon (unas diez peticiones para 60 días) y Open-Meteo.
- Cabe en cualquier máquina consumer, incluidos equipos de gama baja y contenedores pequeños.
- Opciones de despliegue: ejecución directa con `python3 predict_gb.py --out estimate.json`, integración programática mediante `gb_infer.estimate(price, wx_live, "weights")` o cron horario.
- Latencia y throughput: no disponibles de forma explícita; el diseño implica una ejecución por hora y por clase as-of, con coste dominado por las llamadas HTTP.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gb-price-estimate` (Elpriser) | LightGBM + ridge sobre residuo | Great Britain; regla para Portugal e Irlanda | 365 días de entrenamiento, 60 días en inferencia | CC-BY-4.0 | Pesos y código en HuggingFace |
| Referencia naive "nivel + perfil semanal" | Media de 7 días + perfil de 4 semanas | Great Britain | 7 días + 4 semanas | No aplica | Baseline descrito en la model card |
| Modelos de forecasting de precios eléctricos de terceros | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas comparables con parámetros, contexto y rendimiento verificables en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgo documentado: desde la subida de precios de septiembre de 2026, la estimación queda 6-13 GBP/MWh por debajo del precio real.
- Cobertura de la banda degradada: el intervalo P10-P90 cubre solo el 61-71 % de las horas en el periodo reciente, frente al 77-81 % del backtest completo.
- Error en producción no medido: el autor indica explícitamente que no se ha evaluado el error real en operación.
- No extrapola niveles de precio: la versión con nivel absoluto en los árboles quedó 17-25 GBP/MWh por debajo tras la subida, lo que limita la robustez ante regímenes de precio no vistos.
- Naturaleza del objetivo: estima el Market Index Price de Elexon, no el precio de la subasta day-ahead; no debe confundirse con él.
- Dependencia de fuentes externas: requiere disponibilidad de Elexon y Open-Meteo; una interrupción o cambio de formato afecta a la inferencia.
- Sin datos de gas o CO2: el modelo no incorpora drivers fundamentales de coste, lo que puede explicar parte del sesgo en periodos de estrés.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y conservar el aviso de licencia.
- El repositorio es un snapshot: producción reentrena a diario y el repo se refresca semanalmente, por lo que los pesos publicados pueden quedar desactualizados respecto al servicio real.
- No apto para decisiones de trading sin corrección: el sesgo y la cobertura reducida de la banda desaconsejan su uso directo como señal económica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elpriser/gb-price-estimate
- Servicio donde se muestra la estimación: https://elpriser.org
- Documentación de licencias de fuentes de datos: `DATA_LICENCES.md` en el repositorio
- Elexon Market Index Price: no disponible en la información proporcionada
- Open-Meteo (API previous-runs): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
