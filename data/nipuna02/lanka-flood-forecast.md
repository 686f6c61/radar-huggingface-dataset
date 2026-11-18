# nipuna02/lanka-flood-forecast

## Resumen

Lanka Flood Forecast es un conjunto de modelos de regresión tabular basados en LightGBM que predicen cambios en el nivel de agua de los ríos en 39 estaciones de aforo del Departamento de Irrigación de Sri Lanka, con horizontes de 6, 12 y 24 horas. Lo desarrolla Nipuna Lakruwan (usuario `nipuna02`) como prototipo de investigación para alerta temprana de inundaciones, y se distribuye con licencia MIT. No es un modelo de lenguaje ni una red neuronal: son cinco boosters de árboles gradient-boosted serializados en formato de texto de LightGBM.

El modelo resuelve un problema de predicción de series temporales hidrológicas: dado el estado reciente de los niveles fluviales, estimar la variación futura normalizada por la mediana del cambio absoluto a 6 horas de cada estación. Dos de los cinco modelos (percentiles 80 y 90 a 12 horas) están orientados específicamente a la emisión de avisos de crecida. La relevancia actual radica en que Sri Lanka sufre inundaciones recurrentes durante el monzón y los ciclones, y este tipo de modelos ligeros puede desplegarse con requisitos de cómputo mínimos y refrescarse cada tres horas.

El proyecto incluye código de extracción de características, evaluación y un mapa en vivo actualizado cada tres horas. Los datos de entrenamiento provienen del repositorio `nuuuwan/lk_irrigation` (MIT) y cubren del 23 de noviembre de 2025 al 17 de noviembre de 2026, con 318.789 lecturas. El autor lo califica explícitamente como prototipo de investigación y no como servicio oficial de alerta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM), regresión tabular sobre features de series temporales |
| Parametros totales | No disponible (no se publica número de árboles, hojas ni tamaño de los boosters) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de features construida a partir de cambios recientes, distancia al nivel de inundación, estaciones aguas arriba, media de cuenca, proporción nacional de estaciones en ascenso rápido y hora del día |
| Tipos de cuantizacion | No disponible (los modelos de texto de LightGBM no se cuantizan como redes neuronales) |
| Idiomas soportados | No disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Texto de LightGBM (`lgb_6h.txt`, `lgb_12h.txt`, `lgb_24h.txt`, `lgb_12h_q80.txt`, `lgb_12h_q90.txt`), cargables con `lightgbm.Booster(model_file=...)` |

## Arquitectura y entrenamiento

El modelo es un conjunto de cinco boosters LightGBM independientes, cada uno entrenado para un objetivo distinto: tres regresores puntuales para los horizontes de 6, 12 y 24 horas, y dos regresores de cuantil superior (percentiles 80 y 90) a 12 horas para la generación de avisos. La variable objetivo de los modelos puntuales es el cambio de nivel dividido por la mediana del cambio absoluto a 6 horas de cada estación, lo que normaliza la escala entre estaciones con regímenes hidrológicos distintos.

Las features se construyen en `src/features.py` e incluyen cambios recientes de nivel, distancia al umbral de inundación, niveles de estaciones aguas arriba en el mismo río, media de cuenca, proporción nacional de estaciones con ascenso rápido y hora del día. Los datos de entrenamiento proceden de 318.789 lecturas del Departamento de Irrigación de Sri Lanka entre el 23 de noviembre de 2025 y el 17 de noviembre de 2026, es decir, aproximadamente un año hidrológico. La evaluación se realiza sobre bloques temporales reservados (último bloque: 15 de septiembre a 17 de noviembre de 2026) entrenando solo con datos anteriores, lo que constituye una validación temporal correcta para series temporales. No se menciona uso de datos de precipitación en el modelo final: el autor indica que añadir lluvia de 25 pluviómetros no mejoró la precisión.

## Capacidades

- Predicción del cambio de nivel de agua a 6, 12 y 24 horas en 39 estaciones de aforo de Sri Lanka.
- Estimación de cuantiles superiores (percentiles 80 y 90) del cambio a 12 horas para umbrales de aviso de crecida menor.
- Normalización por estación mediante la mediana del cambio absoluto a 6 horas, lo que permite un único modelo por horizonte para estaciones heterogéneas.
- Incorporación de información espacial: estaciones aguas arriba en el mismo río y media de cuenca.
- Incorporación de contexto nacional agregado: proporción de estaciones del país con ascenso rápido en cada instante.
- Inferencia determinista y de bajo coste computacional, apta para refresco cada tres horas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor numérico.

## Casos de uso

- Alerta temprana de crecidas a 12 horas: los modelos de cuantil 80 y 90 permiten emitir avisos cuando la probabilidad de superar el umbral de inundación menor es alta; en el bloque de evaluación reciente el modelo q90 avisó en 33 de 37 cruces de umbral con una mediana de antelación de 8 horas.
- Monitorización operativa con refresco continuo: el mapa en vivo se actualiza cada tres horas, de modo que un centro de emergencias puede consultar el estado previsto de las 39 estaciones sin infraestructura de GPU.
- Priorización de inspecciones de campo: las estaciones con mayor probabilidad de ascenso rápido según el cuantil 90 permiten dirigir equipos de verificación a los puntos críticos antes de que se produzca la crecida.
- Integración en sistemas de información geográfica y paneles de crisis: al ser un modelo tabular ligero, se puede ejecutar en el mismo servidor que sirve el mapa y alimentar capas GeoJSON con las predicciones por estación.
- Análisis retrospectivo de episodios: el modelo permite recalcular predicciones sobre eventos históricos (el autor realiza un estudio de caso del ciclón Ditwah) para evaluar la cobertura de avisos y calibrar umbrales.
- Prototipado de sistemas de alerta en otras cuencas: la metodología (normalización por estación, features de aguas arriba y agregados de cuenca) es transferible a redes de aforo con datos horarios, sirviendo como plantilla de bajo coste antes de invertir en modelos hidrodinámicos.
- Docencia e investigación en hidrología computacional: el código de features y evaluación es reproducible y sirve como caso de estudio de validación temporal en series hidrológicas.

## Benchmarks y rendimiento

Resultados sobre el bloque temporal reservado del 15 de septiembre al 17 de noviembre de 2026, entrenando solo con datos anteriores:

| Horizonte | MAE baseline sin cambio | MAE modelo | Skill |
|---|---|---|---|
| 6 h | 20,5 cm | 15,9 cm | +22% |
| 12 h | 30,8 cm | 26,4 cm | +14% |
| 24 h | 37,7 cm | 35,0 cm | +7% |

Avisos de inundación menor a 12 horas (bloque reciente, 37 cruces de umbral):

| Modelo | Cruces detectados | Antelación mediana |
|---|---|---|
| Cuantil 90 (12 h) | 33 / 37 | 8 h |
| Baseline de tendencia | 33 / 37 | 5 h |

Estudio de caso del ciclón Ditwah: el modelo detectó 23 de 42 cruces de umbral.

## Requisitos de hardware

- VRAM: no aplica; los boosters LightGBM se ejecutan en CPU y caben holgadamente en memoria RAM convencional.
- GPU recomendadas: ninguna; no se requiere aceleración por GPU para inferencia ni para el reentrenamiento sobre un año de datos horarios de 39 estaciones.
- Cabe en cualquier equipo de consumo: un portátil convencional o una instancia pequeña de nube (1-2 vCPU, 2 GB de RAM) es suficiente para el refresco cada tres horas.
- Opciones de despliegue: biblioteca `lightgbm` en Python cargando los ficheros `.txt` con `lightgbm.Booster(model_file=...)`; no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo neuronal.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (predicción sobre 39 estaciones cada tres horas) el coste por ciclo es despreciable frente a cualquier infraestructura de servidor web.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Horizontes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lanka Flood Forecast | LightGBM sobre features hidrológicas | 39 estaciones, Sri Lanka | 6, 12, 24 h y cuantiles 80/90 a 12 h | MIT | Hugging Face y GitHub |
| Modelos hidrodinámicos (p. ej. HEC-RAS, MIKE) | Simulación física | Cuenca específica, requiere calibración | Variables según configuración | Propietaria o mixta | Comercial |
| Modelos LSTM hidrológicos por cuenca | Red neuronal recurrente | Una cuenca o estación por modelo | Típicamente 1-24 h | Variable según publicación | Repositorios de investigación |
| Baseline de tendencia (incluido por el autor) | Persistencia del cambio reciente | 39 estaciones | 12 h | MIT | Incluido en la evaluación |

No se dispone de comparaciones cuantitativas publicadas frente a estos sistemas en la información proporcionada; la única comparación numérica disponible es contra el baseline sin cambio y el baseline de tendencia, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Solo un año de datos de entrenamiento, lo que limita la representación de la variabilidad interanual y de eventos extremos.
- Los eventos extremos y de ascenso rápido están infrarrepresentados en el conjunto de entrenamiento; el rendimiento en crecidas severas puede degradarse respecto a las métricas medias.
- La lluvia de 25 pluviómetros no mejoró la precisión, por lo que el modelo no incorpora forzamiento meteorológico y no puede anticipar crecidas causadas por precipitación aún no reflejada en los niveles.
- El skill decae con el horizonte: +22% a 6 horas, +14% a 12 horas y solo +7% a 24 horas frente al baseline sin cambio.
- En el estudio de caso del ciclón Ditwah detectó 23 de 42 cruces, es decir, aproximadamente la mitad; no debe usarse como única fuente de decisión.
- El autor lo declara explícitamente prototipo de investigación y no servicio oficial de alerta; las decisiones deben seguir al Disaster Management Centre y al Irrigation Department de Sri Lanka.
- Cobertura geográfica limitada a Sri Lanka y a las 39 estaciones del Departamento de Irrigación; no es extrapolable sin reentrenamiento.
- Riesgo de deriva del modelo si cambia la red de aforo, la frecuencia de reporte o la calibración de los sensores.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no implica garantía alguna sobre el rendimiento en producción.
- No se han documentado sesgos sociales ni de idioma por tratarse de un modelo numérico, pero la cobertura desigual de estaciones puede introducir sesgo geográfico en la calidad de los avisos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/lanka-flood-forecast
- Código, evaluación y features: https://github.com/Nipuna-Lakruwan/lanka-flood-forecast
- Mapa en vivo (refresco cada 3 horas): https://nipuna-lakruwan.github.io/lanka-flood-forecast/
- Fuente de datos (nuuuwan/lk_irrigation, MIT): https://github.com/nuuuwan/lk_irrigation
