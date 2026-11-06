# LordZeee/lulc-change-hazard-kpi

## Resumen

`LordZeee/lulc-change-hazard-kpi` es un modelo de *gradient boosting* (XGBoost) para la prediccion de cambios de cobertura y uso del suelo (LULC) en Ucrania a un horizonte de tres anos. No es un modelo de lenguaje ni una red neuronal: es un conjunto de arboles de decision entrenados sobre variables geoespaciales derivadas de imagenes satelitales, y su salida es la probabilidad de transicion entre clases de la leyenda KPI-Ukraine (Crop, Grass, Tree, Built, Water, Wetland, Bare) por celda de 30 m.

El modelo es el motor detras de los analisis `models/lulc-change-hazard` y `models/lulc-forecast` del proyecto DT4LC (IPT-MMDA), que descarga este repositorio en su primer uso. Se distribuye como un unico fichero JSON (`lulc_hazard.json`, formato de bundle `dt4lc-lulc-hazard/2`, version `2026-10-28`) y predice cinco grupos de peligro: cualquier cambio, expansion de suelo construido, perdida de cobertura arborea, expansion de cultivos y ganancia de cobertura arborea.

Su relevancia es practica: ofrece una capa de riesgo de cambio de uso del suelo con validacion *leave-oblast-out* y comparacion explicita contra lineas base Markov, con AUC entre 0,782 y 0,987 segun el tipo de transicion. El modelo servido se reentreno sobre el par 2021-2024 con 491.214 celdas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (XGBoost), un modelo por clase de origen con correccion de prior |
| Parametros totales | no disponible (no aplica; modelo basado en arboles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | JSON (`lulc_hazard.json`, bundle `dt4lc-lulc-hazard/2`, version `2026-10-28`) |

## Arquitectura y entrenamiento

El modelo es un ensamblado de arboles XGBoost con un clasificador por cada clase de origen de la leyenda KPI-Ukraine, mas una correccion de prior sobre las probabilidades resultantes. Las variables de entrada se calculan en Google Earth Engine sobre una malla UTM de 30 m (EPSG:32636, origen fijo): la clase LULC en el ano de origen `t0` (mapa KPI-Ukraine a 10 m remuestreado a 30 m mediante moda 3x3), la proporcion de cada clase en vecindarios de 3, 7 y 15 celdas, variables de terreno del DEM Copernicus GLO-30 (release `GLO30_2024_1`: elevacion, pendiente, orientacion) y el embedding satelital anual AlphaEarth (`GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL`, 64 bandas).

El backtest se realizo ajustando sobre el cambio 2018-2021 y evaluando sobre 2021-2024 con validacion *leave-oblast-out*, en 300 ventanas nacionales y con ponderacion por diseno. El modelo servido se reajusto sobre el par 2021-2024 (491.214 celdas). El mapa de pronostico no se genera solo con las probabilidades: toma la magnitud de cada cambio de la tendencia trienal mas reciente en un cuadrado de 12 km alrededor del area y la coloca donde las probabilidades del modelo son mas altas.

## Capacidades

- Prediccion por celda de 30 m de la probabilidad de cada clase KPI-Ukraine tres anos despues del ano de origen `t0`.
- Estimacion de cinco grupos de peligro: cualquier cambio, expansion de suelo construido (Crop/Grass a Built), perdida de cobertura arborea (Tree a Crop/Grass), expansion de cultivos (Grass a Crop) y ganancia de cobertura arborea (Crop/Grass a Tree).
- Generacion de un mapa de pronostico de cobertura del suelo a tres anos, combinando probabilidades con tendencias locales de cambio.
- Clasificacion en niveles de riesgo por percentil dentro de las celdas de entrenamiento que podrian realizar el mismo cambio: High (top 5 %), Elevated (top 10 %) y Moderate (top 15 %).
- Integracion con Google Earth Engine para el calculo de variables de entrada; requiere credenciales de Earth Engine.
- Soporte de series temporales desde 2017 en adelante (anos de origen).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Planificacion territorial y ordenacion del suelo: el modelo permite identificar celdas de 30 m con alta probabilidad de conversion a suelo construido, lo que sirve para anticipar presion urbanistica sobre suelo agricola o natural en oblasts concretos.
- Monitorizacion de deforestacion y perdida de cobertura arborea: con AUC de 0,858 en el backtest, la capa de riesgo de Tree a Crop/Grass permite priorizar inspecciones de campo o alertas tempranas en zonas con mayor probabilidad de tala o cambio de uso.
- Evaluacion de riesgo de incendios y degradacion: la combinacion de variables de terreno (pendiente, orientacion) y cobertura permite identificar areas donde la transicion de cobertura aumenta la vulnerabilidad, como insumo para modelos de peligro de incendio.
- Seguimiento de la recuperacion de la cobertura vegetal: el grupo de ganancia de cobertura arborea (AUC 0,977) permite localizar areas candidatas a reforestacion o a regeneracion natural, util para programas de restauracion.
- Analisis de expansion agricola: la capa de Crop desde Grass (AUC 0,782) ayuda a detectar presion de conversion de pastizales a cultivos, relevante para politicas agrarias y evaluaciones de impacto ambiental.
- Investigacion y docencia en teledeteccion: el bundle JSON y el codigo del proyecto DT4LC permiten reproducir el pipeline completo, comparar con lineas base Markov y extender el metodo a otras regiones o leyendas.
- Planificacion de infraestructura y evaluacion de impacto: el mapa de pronostico a tres anos puede alimentar estudios de demanda de suelo, expansion de redes o evaluaciones ambientales estrategicas a escala nacional.

## Benchmarks y rendimiento

Backtest con ajuste 2018-2021 y evaluacion 2021-2024, *leave-oblast-out*, 300 ventanas nacionales, ponderacion por diseno:

| Peligro | AUC | Mejor linea base | AUC linea base | Tasa observada |
|---|---|---|---|---|
| Cualquier cambio | 0,867 | block Markov | 0,827 | 4,61 % |
| Expansion de suelo construido | 0,987 | window Markov | 0,821 | 0,01 % |
| Perdida de cobertura arborea | 0,858 | block Markov | 0,739 | 2,82 % |
| Expansion de cultivos | 0,782 | block Markov | 0,688 | 14,16 % |
| Ganancia de cobertura arborea | 0,977 | block Markov | 0,948 | 1,22 % |

Mapa de pronostico a tres anos: figura de merito 0,210, frente a 0,058 de colocacion aleatoria y 0,109 de block Markov.

## Requisitos de hardware

- Inferencia sobre CPU: al ser un modelo XGBoost serializado en JSON, no requiere GPU; el coste computacional esta dominado por el calculo de variables en Google Earth Engine y la descarga de datos satelitales.
- Memoria: no se especifica el tamano del bundle; el repositorio ocupa 0,0 GB segun Hugging Face, lo que sugiere un fichero de pocos MB.
- GPU: no aplica; no se requiere A100, H100 ni RTX 4090.
- Despliegue: mediante la libreria `xgboost` y el runner del proyecto DT4LC, que descarga el repositorio en el primer uso y aplica las restricciones de dominio (Ucrania, bbox 22-40,5° E / 44-52,5° N) y de area (maximo 400 km²).
- Latencia y throughput: no disponibles; dependen de la resolucion del area consultada y de la latencia de Earth Engine.

## Comparativa con modelos similares

| Modelo | Tipo | Ambito | Horizonte | AUC / metrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LordZeee/lulc-change-hazard-kpi | XGBoost por clase de origen | Ucrania, 30 m | 3 anos | 0,782-0,987 (AUC) | CC BY 4.0 | Hugging Face |
| Block Markov (linea base del paper) | Markov espacial por bloques | Ucrania, 30 m | 3 anos | 0,688-0,948 (AUC) | no disponible | no disponible |
| Window Markov (linea base del paper) | Markov por ventana | Ucrania, 30 m | 3 anos | 0,821 (AUC, expansion urbana) | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de prediccion de cambio LULC en la informacion proporcionada.

## Limitaciones y advertencias

- El nivel absoluto de probabilidad no es transferible a un periodo nuevo; solo se conserva el orden relativo de las celdas. Deben usarse los rangos (percentiles), no las probabilidades brutas.
- Una gran area de alto riesgo de un cambio raro no implica que vaya a cambiar: en el backtest solo el 0,01 % de cultivos y pastizales se convirtio en suelo construido en toda Ucrania.
- Entrenado y validado exclusivamente en Ucrania; el runner rechaza areas fuera del dominio (bbox 22-40,5° E, 44-52,5° N) y areas superiores a 400 km².
- Los mapas KPI-Ukraine de entrada contienen artefactos propios (por ejemplo, bosque nuevo registrado solo en el mapa de 2024) y el modelo aprende de ellos.
- La clase de abandono de cultivos (Crop a Grass) esta en el bundle pero no se sirve porque no supero su comprobacion de validacion.
- Los peligros se solapan y cada uno se clasifica en su propia escala; las areas de alto riesgo de distintos grupos no son sumables.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no se especifican terminos adicionales sobre los datos de entrada (KPI-Ukraine, AlphaEarth, Copernicus GLO-30), que pueden tener sus propias condiciones.
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si existe riesgo de extrapolacion fuera del dominio espacial y temporal de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LordZeee/lulc-change-hazard-kpi
- Proyecto DT4LC: https://github.com/IPT-MMDA/DT4LC-project
- Asset KPI-Ukraine en Earth Engine: `projects/poetic-centaur-266514/assets/kpi_ukraine_lc`
- AlphaEarth Satellite Embedding: `GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL`
- Copernicus GLO-30 DEM (release `GLO30_2024_1`): no disponible en la informacion proporcionada
- Paper o publicacion asociada: no disponible en la informacion proporcionada
