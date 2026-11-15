# CorxLabs/Pluvium-500

## Resumen

Pluvium-500 es un sistema de predicción meteorológica probabilística orientado a precipitación y trayectorias de ciclones tropicales, desarrollado por CorxLabs. Se distribuye como un paquete Python (`pip install pluvium`) que agrupa tres productos: Pluvium Blend (probabilidad de 1, 10, 25 y 50 mm de lluvia en los próximos 14 días a partir de seis sistemas operativos), Pluvium Cyclone (trayectorias de ciclones en el Atlántico norte y Pacífico noreste) y Pluvium-500 Network (predicción horaria de lluvia a tres días en cada localidad). El repositorio de Hugging Face contiene el código, los pesos upstream de GraphCast y AIFS, los benchmarks y los blends entrenados por país.

El modelo se apoya en seis sistemas operativos: ECMWF ENS, ECMWF HRES, ECMWF AIFS, NOAA GEFS, NOAA GFS y la ejecución de GraphCast de NOAA. Pluvium no ejecuta esos modelos, sino que hace post-procesado y blending multi-modelo con aprendizaje online, solicitando únicamente los campos de precipitación sobre el país de interés a los archivos públicos (ECMWF open data, NOAA en AWS). Está diseñado para cualquier país entre 60° S y 60° N, con énfasis declarado en el Caribe.

La relevancia actual radica en su enfoque de bajo coste: el blend se entrena en CPU (86 minutos para Jamaica en una máquina de cuatro núcleos, con 41 MB en disco) y la red Pluvium-500 requiere una única GPU de 24 GB o más para entrenamiento. El pipeline es `time-series-forecasting`, la licencia es Apache 2.0 y el idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de pronóstico (Pluvium-500 Network) combinada con blending multi-modelo y post-procesado estadístico; no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal de 14 días para el blend y 3 días horarios para la red) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos del blend en `blends/<country>/`, pesos upstream en `upstream/`; el paquete se instala vía pip) |

## Arquitectura y entrenamiento

Pluvium combina tres componentes. Pluvium Blend es un post-procesador estadístico multi-modelo entrenado sobre el año más reciente de precipitación publicada para cada país, que aprende a pronosticar a partir de cualquiera de los seis sistemas disponibles (tolera que falte alguno o que su ejecución más reciente no esté publicada). Pluvium Cyclone incorpora aprendizaje entrenado sobre 2024 y 2025 que viaja dentro del paquete y continúa aprendiendo de forma online. Pluvium-500 Network es una red neuronal que predice lluvia horaria a tres días con variables como probabilidad de lluvia, inicio, intensidad, duración, cantidad, tormenta y riesgo de inundación; su entrenamiento requiere una GPU de 24 GB o más y unos 150 GB de disco, con un presupuesto de referencia de 24 GPU-horas.

El sistema no ejecuta los modelos upstream: los pesos de GraphCast (ejecución de NOAA) y AIFS (ECMWF) se mantienen en `upstream/` sin modificar, con sus licencias originales, y el paquete lee sus salidas publicadas. Desde la versión 0.4 lee AIGFS tras el cese de GraphCastGFS por parte de NOAA el 5 de mayo de 2026. Los benchmarks reportan métricas probabilísticas (Brier score, CRPS) con pérdidas junto a victorias, y el repositorio documenta explícitamente lo que no funcionó (`docs/WHAT_DID_NOT_WORK.md`).

## Capacidades

- Predicción probabilística de precipitación: probabilidad de 1, 10, 25 y 50 mm por localidad y día en los próximos 14 días.
- Estadísticos de pronóstico: mediana, percentil 90 y lluvia esperada, además del número de sistemas crudos que pronostican 50 mm.
- Clasificación por niveles de alerta (watch, warning, extreme).
- Detección de extrapolación: indica si el pronóstico queda más allá del registro de entrenamiento y cuán rara es la cantidad esperada en ese lugar.
- Predicción horaria a tres días con Pluvium-500 Network: si llueve, cuándo empieza, intensidad, duración, cantidad, tormenta y riesgo de inundación.
- Seguimiento de ciclones tropicales: trayectoria, círculo de incertidumbre (dos de cada tres) y probabilidad de paso cercano a cada lugar.
- Aprendizaje online y blending tolerante a fallos de fuentes.
- Cobertura geográfica entre 60° S y 60° N, con soporte por código ISO de país.
- Interfaz Python (`pluvium.quick.forecast`, `brief`) y CLI (`pluvium now`, `pluvium cyclone`).
- Capacidades multilingües: no disponibles (idioma declarado: inglés).

## Casos de uso

- Alertas tempranas de lluvia extrema a escala municipal: `pluvium now --country JM` genera una tabla por localidad y día con probabilidades de 1, 10, 25 y 50 mm y nivel de alerta, adecuada para protección civil en países con cobertura limitada de servicios meteorológicos propios.
- Gestión de inundaciones en el Caribe: la combinación de lluvia esperada, percentil 90 y rareza histórica del evento permite priorizar municipios antes de que se materialice el episodio.
- Seguimiento operativo de huracanes: `pluvium cyclone --root ~/storms` emite un boletín por tormenta activa con trayectoria y círculo de incertidumbre, útil como capa complementaria al NHC en logística humanitaria.
- Planificación agrícola de 14 días: las probabilidades acumuladas por umbral permiten decidir ventanas de siembra, riego o cosecha con antelación suficiente para explotaciones medianas.
- Despliegue de bajo coste en países sin HPC: el blend se entrena en CPU en torno a 86 minutos y ocupa 41 MB, por lo que una institución local puede operar su propio pronóstico sin infraestructura de GPU.
- Investigación en post-procesado multi-modelo: los benchmarks, papers y el registro de intentos fallidos permiten reproducir y comparar metodologías de blending con CRPS y Brier score.
- Integración en pipelines de datos meteorológicos: el paquete consulta ECMWF open data y NOAA en AWS y descarga únicamente los campos de precipitación del país, unos pocos megabytes por ejecución.

## Benchmarks y rendimiento

El repositorio declara cuatro conjuntos de benchmarks documentados (lluvia en dos años completos, trayectorias de ciclones y comparación contra sistemas operativos en verano de 2025), con métricas Brier score y CRPS y con pérdidas reportadas junto a las victorias. Sin embargo, en la información proporcionada no se incluyen los valores numéricos de dichos benchmarks.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pluvium Blend: funciona en CPU; el entrenamiento por país tomó 86 minutos en una máquina de cuatro núcleos (Jamaica) y dejó 41 MB en disco.
- Pluvium Cyclone: no requiere descarga de pesos; el conocimiento entrenado viaja dentro del paquete y funciona en CPU.
- Pluvium-500 Network (entrenamiento): una GPU de 24 GB o más y aproximadamente 150 GB de disco; presupuesto de referencia de 24 GPU-horas.
- VRAM para inferencia: no disponible.
- GPU recomendadas: no disponible más allá del requisito de 24 GB para entrenamiento (candidatas habituales como RTX 3090/4090 o A100 no están confirmadas en la información).
- Despliegue: paquete Python instalable con pip (`pluvium`), CLI `pluvium now` y `pluvium cyclone`, y API Python `pluvium.quick`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la primera ejecución por país incluye descargas y entrenamiento; la segunda ejecución tarda aproximadamente un minuto.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pluvium-500 | Post-procesado multi-modelo + red neuronal | Global 60° S–60° N, énfasis Caribe | Seis sistemas operativos (ECMWF, NOAA, GraphCast, AIFS) | Apache 2.0 | Hugging Face, pip |
| GraphCast (DeepMind; ejecución NOAA) | Red neuronal global | Global | Análisis global | Disponible en `upstream/` con licencia del editor | Pesos públicos, requiere análisis global y GPU grande |
| AIFS (ECMWF) | Red neuronal global | Global | Análisis global | Disponible en `upstream/` con licencia del editor | Pesos públicos, requiere análisis global y GPU grande |
| ECMWF ENS / HRES, NOAA GEFS / GFS | Modelos físicos de conjunto y deterministas | Global | Asimilación propia | No aplica (sin pesos) | Salidas públicas |

La diferencia principal es que Pluvium no compite en la generación del pronóstico global, sino en el post-procesado localizado y probabilístico de esas salidas, con entrenamiento por país en CPU y sin necesidad de ejecutar los modelos upstream.

## Limitaciones y advertencias

- Es un modelo de investigación, no un pronóstico oficial; el autor recomienda seguir al servicio meteorológico nacional y, para huracanes, al National Hurricane Center de EE. UU.
- Cobertura limitada a latitudes entre 60° S y 60° N.
- Idioma declarado únicamente inglés.
- Dependencia de la disponibilidad y continuidad de los seis sistemas externos; cambios de feed ya documentados (cese de GraphCastGFS el 5 de mayo de 2026 y sustitución por AIGFS desde la versión 0.4).
- El blend se entrena con el año más reciente de precipitación publicada por país; si no existe un blend publicado, la primera ejecución requiere entrenamiento local.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser un modelo numérico de precipitación, el riesgo relevante es el error de calibración probabilística, no la generación de texto.
- Los pesos upstream se distribuyen con las licencias de sus editores, no con Apache 2.0; deben revisarse por separado para uso comercial.
- Los pesos de Pluvium-500 Network solo se publican tras ejecutar el programa de entrenamiento con un token de escritura, por lo que pueden no estar disponibles en el repositorio en un momento dado.
- El repositorio advierte que un blend descargado se abre de forma que no puede ejecutar código, pero conviene verificar la procedencia de blends de terceros antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CorxLabs/Pluvium-500
- Benchmark de lluvia, segundo año completo: docs/FRONTIER_BENCHMARK.md (dentro del repositorio)
- Benchmark de lluvia, primer año completo: docs/FULL_YEAR_BENCHMARK.md
- Benchmark de trayectorias de ciclones: docs/CYCLONE_BENCHMARK.md
- Benchmark contra sistemas operativos, verano de 2025: docs/OPERATIONAL_BENCHMARK.md
- Registro de intentos descartados: docs/WHAT_DID_NOT_WORK.md
- Papers técnicos: docs/papers/README.md
- Pesos upstream y licencias: upstream/README.md
- Notebook todo-en-uno: notebooks/pluvium_everything.py
