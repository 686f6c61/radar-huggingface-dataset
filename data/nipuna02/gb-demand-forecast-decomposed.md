# nipuna02/gb-demand-forecast-decomposed

## Resumen

GB-demand-forecast-decomposed es un conjunto de tres modelos LightGBM publicados por el usuario nipuna02 (Nipuna Lakruwan) que predicen la demanda electrica nacional de Gran Bretaña (Great Britain, GB) para cada media hora del dia siguiente (day-ahead). El modelo no predice la demanda directamente, sino que la descompone en tres componentes: la demanda subyacente (underlying demand), el factor de carga solar embebido y el factor de carga eolica embebido, de modo que la demanda nacional se reconstruye como `ND = underlying - clip(solar_lf, 0, 1) * solar_cap_d2 - clip(wind_lf, 0, 1) * wind_cap_d2`.

La relevancia de esta ficha es acotada: se trata de un modelo de pronostico de series temporales de proposito especifico, no de un modelo de lenguaje. No usa arquitectura transformer ni tiene parametros en el sentido habitual; son tres modelos de gradient boosting (LightGBM) entrenados con datos abiertos de NESO y meteorologia de Open-Meteo. La publicacion incluye cuantiles de residuo relativo calibrados por conformal prediction (split-conformal) en bloques de 4 horas, lo que permite convertir el pronostico puntual en un intervalo P10-P90.

El propio autor lo describe como modelo de investigacion y portfolio, no operativo. El repositorio de Hugging Face ocupa 0.0 GB, tiene 0 descargas y 0 likes en el momento de la consulta. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (LightGBM), descomposicion en tres submodelos (underlying, solar, wind) |
| Parametros totales | no disponible (no aplica; modelos de arboles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de features definida en el repositorio, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (no aplica a LightGBM en el sentido de LLM; los modelos se serializan como texto `.txt`) |
| Idiomas soportados | no disponible (no aplica; salida numerica) |
| Licencia | MIT |
| Formato de pesos | ficheros de texto LightGBM (`decomposed_u.txt`, `decomposed_solar.txt`, `decomposed_wind.txt`) mas `config.json` con listas de features y cuantiles conformales |

## Arquitectura y entrenamiento

El sistema se compone de tres modelos LightGBM independientes. `decomposed_u.txt` predice la demanda subyacente (demanda nacional mas solar y eolica embebidas) con objetivo L1. `decomposed_solar.txt` y `decomposed_wind.txt` predicen los factores de carga (load factors) de solar y eolica embebidas a partir de pronosticos meteorologicos. La demanda nacional final se obtiene combinando las tres salidas con la formula de descomposicion indicada en la model card, aplicando `clip` a los factores de carga en el rango [0, 1].

Las features se construyen con el modulo `energy_demand_forecast.features.build` del repositorio GitHub del autor; el orden exacto de las features se guarda en `config.json`. Los datos de entrenamiento proceden de NESO Open Data (licencia NESO Open Data Licence) y de meteorologia de Open-Meteo (CC BY 4.0). La model card no detalla el numero de tokens, la ventana temporal de entrenamiento ni si hubo ajuste de hiperparametros mas alla de la funcion objetivo L1.

La innovacion tecnica destacable es la calibracion de intervalos mediante split-conformal sobre residuos relativos, con cuantiles calculados por bloques de 4 horas y almacenados en `config.json`. La transformacion `y = p / (1 - r)` convierte el pronostico puntual `p` y el residuo relativo `r` en los limites del intervalo P10-P90.

## Capacidades

- Pronostico day-ahead de demanda electrica nacional de GB con resolucion de media hora (48 puntos por dia).
- Pronostico puntual con objetivo L1 sobre la demanda subyacente.
- Pronostico de factores de carga solar y eolica embebidos a partir de meteorologia.
- Generacion de intervalos probabilisticos P10-P90 mediante conformal prediction calibrada por bloques de 4 horas.
- Evaluacion mediante MAPE y cobertura de intervalo (metricas declaradas: MAPE).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo numerico de regresion.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Planificacion de despacho day-ahead: el operador puede usar los 48 valores de demanda nacional previstos para el dia siguiente como entrada a un modelo de unit commitment o de scheduling de generacion, con intervalos P10-P90 para gestionar el riesgo.
- Gestion de cartera de comercializacion: un comercializador puede estimar la demanda de su zona o del sistema para cubrir posiciones en el mercado mayorista, usando los intervalos conformales para dimensionar el margen de seguridad.
- Investigacion academica en pronostico energetico: el modelo sirve como baseline reproducible de descomposicion demanda/subyacente/solar/eolica con calibracion conformal, comparable contra el naive de misma hora de la semana anterior.
- Evaluacion de modelos meteorologicos: al depender de pronosticos de Open-Meteo, permite analizar la sensibilidad del error de demanda a la calidad del pronostico meteorologico de entrada.
- Prototipado de herramientas de analisis para NESO: el modelo reproduce puntos cardinales de NESO (MAPE 3.89% frente al 2.58% del pronostico oficial) y puede usarse como referencia en estudios de comparacion.
- Educacion y portfolio: el repositorio y la model card documentan el pipeline completo (features, entrenamiento, calibracion conformal), util como ejemplo didactico de pronostico probabilistico de series temporales con LightGBM.
- Integracion en pipelines de datos energeticos: al ser tres ficheros de texto y un JSON de configuracion, se puede desplegar en servicios ligeros sin GPU, con requisitos de computo minimos.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| MAPE en test held-out (nov 2025 - oct 2026, meteorologia day-ahead) | 4.22% [4.00, 4.47] | — |
| Cobertura del intervalo P10-P90 | 75% | Objetivo nominal 80% |
| MAPE del naive misma hora semana anterior | 8.43% | Baseline |
| MAPE en puntos cardinales de NESO | 3.89% | NESO oficial: 2.58% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; los modelos LightGBM se ejecutan en CPU.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier consumer GPU y en CPU convencional; el repositorio ocupa 0.0 GB.
- Opciones de despliegue: inferencia directa con la libreria `lightgbm` de Python cargando los ficheros `.txt`, mas el modulo `energy_demand_forecast.features.build` del repositorio GitHub para construir las features. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | MAPE declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GB-demand-forecast-decomposed | LightGBM (3 submodelos) | Descomposicion + conformal | 4.22% (held-out) | MIT | Hugging Face |
| Pronostico oficial NESO | No disponible | No disponible | 2.58% (puntos cardinales) | No disponible | NESO |
| Naive misma hora semana anterior | Baseline estadistico | Persistencia semanal | 8.43% | no disponible | Referencia interna |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que es un modelo de investigacion y portfolio, no un pronostico operativo; no debe usarse para decisiones de despacho reales sin validacion adicional.
- El MAPE de 4.22% es peor que el pronostico oficial de NESO (2.58% en puntos cardinales), por lo que no sustituye al sistema operativo del operador.
- La cobertura del intervalo P10-P90 es del 75%, por debajo del 80% nominal, lo que indica infracobertura: los intervalos son algo estrechos.
- Depende de pronosticos meteorologicos de Open-Meteo para solar y eolica; errores en esas entradas se propagan a la prediccion de demanda.
- Entrenado exclusivamente con datos de Gran Bretaña; no es transferible a otros sistemas electricos sin reentrenamiento.
- No se documentan sesgos especificos ni riesgos de alucinacion (no aplica a un modelo de regresion), pero si existe riesgo de extrapolacion fuera de la distribucion de entrenamiento (eventos extremos, cambios estructurales de demanda).
- La licencia MIT permite uso comercial, pero las licencias de los datos subyacentes (NESO Open Data Licence y CC BY 4.0 de Open-Meteo) imponen obligaciones de atribucion que deben respetarse.
- No se especifican la ventana temporal de entrenamiento, el numero de arboles ni los hiperparametros en la model card; la reproducibilidad depende del repositorio GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/gb-demand-forecast-decomposed
- Repositorio GitHub: https://github.com/Nipuna-Lakruwan/energy-demand-forecast
- NESO Open Data: https://www.neso.energy/data-portal
- Open-Meteo: https://open-meteo.com/
- LightGBM: https://github.com/microsoft/LightGBM
