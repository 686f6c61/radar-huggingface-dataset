# Nabidnur/ignis-fire-regime-model

## Resumen

IGNIS Fire Complex Segmenter es un artefacto de aprendizaje automatico no supervisado publicado por el usuario Nabidnur (equipo IGNIS) en Hugging Face, desarrollado en el contexto del NASA Space Apps Challenge 2026, reto #9 "Harmonization of MODIS and VIIRS Hot Spots". No es un modelo de lenguaje ni una red neuronal: se trata de un pipeline de scikit-learn serializado con joblib que combina un StandardScaler, un DBSCAN y un KMeans para convertir detecciones crudas de puntos calientes de NASA FIRMS (MODIS Terra/Aqua C6.1 y VIIRS S-NPP/NOAA-20/NOAA-21, armonizados) en "complejos de fuego" contiguos y en un tipado de su regimen de comportamiento (smoldering, active, major, megafire).

El problema que resuelve es la fragmentacion y falta de homogeneidad de las detecciones de foco activo: FIRMS entrega puntos individuales por sensor con escalas y confianzas no comparables, y el modelo los agrupa en el espacio [latitud, longitud, log1p(FRP)] mediante DBSCAN (eps=0,12 en espacio escalado, aproximadamente 5 km, min_samples=6) y despues clasifica cada complejo con KMeans (k=6) sobre las caracteristicas [log1p(FRP), confianza, hora, dia/noche, log1p(brillo)]. El resultado se consume en la aplicacion IGNIS, un calendario de actividad de quema.

Su relevancia actual es acotada pero clara: es un ejemplo reproducible y ligero (repo de 0,0 GB, licencia MIT) de armonizacion multisenor aplicada a teledeteccion operativa, con pipeline de entrenamiento incluido y esquema de salida JSON listo para una app. Como contrapartida, el artefacto acumula 0 descargas y 0 "likes" en el momento de la consulta, la metrica de calidad reportada es modesta (silhouette muestreada de 0,1779) y su ventana de entrenamiento es muy corta (5 dias de datos NRT sobre Amazonia, Congo y Borneo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de aprendizaje no supervisado clasico: StandardScaler + DBSCAN (etapa 1, clustering espacial) + KMeans (etapa 2, tipado de regimen) |
| Parametros totales | No aplica: no hay pesos neuronales; el artefacto contiene un escalador y dos modelos de scikit-learn |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: no es un modelo de secuencia; el coste depende del lote de detecciones de entrada |
| Tipos de cuantizacion | No aplica / no disponible: el artefacto se serializa en joblib con precision float64 de NumPy |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT (codigo y pesos); datos de NASA FIRMS NRT en dominio publico |
| Formato de pesos | joblib (ignis_fire_segmenter.joblib); ficheros auxiliares CSV (training_snapshot.csv) y JSON (metrics.json, complexes_summary.json) |
| Tipo de tarea | Segmentacion / clustering no supervisado de puntos calientes y clasificacion de regimen de fuego |
| Espacio de caracteristicas etapa 1 | [latitud, longitud, log1p(FRP)] estandarizado con StandardScaler |
| Hiperparametros etapa 1 | DBSCAN(eps=0,12 en espacio escalado, min_samples=6) |
| Espacio de caracteristicas etapa 2 | [log1p(FRP), confianza, hora de adquisicion, indicador dia/noche, log1p(brillo)] |
| Hiperparametros etapa 2 | KMeans(k=6) |
| Metricas declaradas | silhouette (valores de la ejecucion de entrenamiento) |
| Dataset de entrenamiento | Nabidnur/ignis-fire-calendar (reglas de armonizacion) |
| Fecha de entrenamiento (UTC) | 2026-09-21T12:54:39Z |
| Fecha de publicacion del repositorio | 2026-09-21T12:55:02Z (actualizado 2026-09-21T12:55:11Z) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas completamente determinista y sin componente neuronal. La etapa 1 proyecta cada deteccion a un espacio tridimensional (latitud, longitud y logaritmo de FRP), lo estandariza y aplica DBSCAN con eps=0,12 en unidades escaladas, lo que el autor aproxima a unos 5 km en el ecuador, y min_samples=6. Cada conglomerado se interpreta como un "complejo de fuego" y se resume con estadisticos: numero de detecciones, suma de FRP, caja envolvente, sensores implicados, persistencia y clase. La etapa 2 toma esos puntos y ejecuta KMeans con k=6 sobre cinco variables (log1p(FRP), confianza, hora UTC, indicador nocturno y log1p de la temperatura de brillo) para asignar un regimen de comportamiento.

El entrenamiento se realizo sobre 138.118 detecciones NRT en vivo procedentes de cinco sensores (VIIRS S-NPP, NOAA-20 y NOAA-21, y MODIS Terra y Aqua), con ventana temporal de 5 dias a partir del 2026-09-16 y cobertura geografica de Amazonia, Congo y Borneo. La ejecucion encontro 63 complejos con una tasa de ruido (puntos etiquetados como -1 por DBSCAN) de 0,0083, y una silueta muestreada de 0,1779. Como innovacion tecnica destacable no hay ninguna contribucion de modelado: el valor esta en la armonizacion multisenor (mapeo de confianza cualitativa VIIRS l/n/h a 20/50/90) y en la reproducibilidad end-to-end mediante el script train_segmenter.py, que vuelve a descargar datos FIRMS, armoniza, ajusta ambas etapas y emite los mismos JSON que consume la aplicacion IGNIS.

## Capacidades

- Segmentacion no supervisada de detecciones de foco activo en complejos de fuego contiguos en el espacio geografico, sin requerir etiquetas.
- Armonizacion de fuentes heterogeneas: integra MODIS Collection 6.1 (Terra y Aqua) y VIIRS V2 (S-NPP, NOAA-20, NOAA-21) en un unico espacio de caracteristicas.
- Tipado de regimen de comportamiento mediante KMeans (k=6), con etiquetas observadas en la ejecucion de entrenamiento: smoldering (54), megafire (4) y active (1).
- Calculo de estadisticos agregados por complejo: numero de detecciones, FRP acumulado, caja envolvente (bbox), sensores participantes y persistencia temporal.
- Generacion de un esquema JSON consumible por aplicacion (complexes_summary.json) con los 50 complejos principales, pensado para su ingesta directa en el Fire Cluster Lab de IGNIS.
- Reproducibilidad: incluye el pipeline completo de entrenamiento (train_segmenter.py) y la instantanea exacta de detecciones usada (training_snapshot.csv).
- Capacidades no presentes: no hay generacion de texto, razonamiento, codigo, matematicas, vision por imagen, tool calling, soporte de agentes, capacidades multilingues ni modo de razonamiento. No procesa imagenes satelitales, solo tablas de puntos de foco activo.

## Casos de uso

- Calendario de actividad de quema: agregar las detecciones de FIRMS en complejos y por dias permite construir un calendario operativo de actividad de quema por region; es el caso de uso original del artefacto dentro de la aplicacion IGNIS.
- Priorizacion de recursos de extincion: ordenar complejos por FRP acumulado y persistencia permite identificar que sistemas de fuego concentran mas energia radiativa y asignar medios aereos o brigadas con criterio cuantitativo.
- Monitorizacion casi en tiempo real: el pipeline se alimenta directamente de CSV NRT de FIRMS, de modo que puede reejecutarse por lote cada pocas horas para refrescar el mapa de complejos activos en una sala de control.
- Analisis de regimen de comportamiento: separar smoldering de active o megafire sirve como entrada a modelos de emisiones y de dispersion de humo, ya que el regimen condiciona la fraccion de combustion y el factor de emision.
- Investigacion reproducible en teledeteccion: al incluir el script de entrenamiento y la instantanea de datos, el artefacto sirve como linea base citable y repetible para comparar reglas de armonizacion MODIS/VIIRS en estudios academicos.
- Etiquetado pseudo-supervisado: los complejos generados pueden usarse como etiquetas debiles para entrenar despues clasificadores o redes de segmentacion supervisadas sobre parches de imagen satelital.
- Alertas de persistencia: el campo de persistencia por complejo permite distinguir focos puntuales de sistemas que se mantienen varios dias, reduciendo falsos positivos en sistemas de alerta temprana.
- Integracion en cuadernos y APIs ligeras: al ser un joblib de scikit-learn, se puede cargar en un notebook de analisis o envolver en un endpoint FastAPI sin dependencias de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las unicas metricas reportadas corresponden a la ejecucion de entrenamiento del propio artefacto:

| Metrica | Valor |
|---|---|
| Detecciones usadas en entrenamiento | 138.118 (NRT en vivo) |
| Ventana temporal | 5 dias, desde 2026-09-16 |
| Cobertura geografica | Amazonia, Congo, Borneo |
| Sensores | VIIRS S-NPP / NOAA-20 / NOAA-21 + MODIS Terra/Aqua |
| Complejos detectados | 63 |
| Ratio de ruido (DBSCAN, etiqueta -1) | 0,0083 |
| Silhouette (muestreada) | 0,1779 |
| Clases de comportamiento observadas | smoldering=54, megafire=4, active=1 |

No se dispone de MMLU, HumanEval, GSM8K ni de ninguna metrica de lenguaje, porque el artefacto no es un modelo de lenguaje. Tampoco se reportan metricas de validacion externa (por ejemplo, contraste contra perimetros oficiales de area quemada) ni resultados de un conjunto de prueba independiente.

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU. El artefacto es scikit-learn y joblib, con NumPy como unica dependencia numerica relevante.
- Memoria RAM estimada: para 138.118 detecciones y 3 caracteristicas en float64, la matriz de entrada ocupa aproximadamente 3,2 MB; con copias intermedias del escalado y del logaritmo, el consumo se mantiene holgadamente por debajo de 1 GB. Para lotes muy superiores (millones de detecciones) el consumo escalaria de forma aproximadamente lineal con el numero de puntos.
- GPU recomendadas: no aplica. Cualquier GPU es irrelevante para este modelo; no hay soporte de CUDA ni de frameworks de aceleracion.
- Compatibilidad con equipos de consumo: si, se ejecuta en cualquier portatil o contenedor pequeno con Python, scikit-learn, NumPy, pandas y joblib instalados.
- Opciones de despliegue: carga directa con joblib.load en Python, notebooks Jupyter, scripts programados (cron) o un endpoint ligero con FastAPI/Flask. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos de ajuste ni de inferencia; conviene medirlos localmente porque DBSCAN con min_samples=6 sobre lotes grandes depende fuertemente del indice espacial y del volumen de entrada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros artefactos comparables de segmentacion de focos activos, y los resultados de busqueda web no devolvieron referencias tecnicas relacionadas con el modelo (los resultados obtenidos correspondian a un despacho juridico sin relacion con el proyecto). Alternativas conceptuales de la misma categoria serian los productos de clustering de focos de NASA FIRMS o aproximaciones de agrupacion por rejilla y umbral, pero no se dispone de datos de parametros, contexto, rendimiento ni licencia de esas alternativas dentro de la informacion recibida, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ventana de entrenamiento muy corta y solo NRT: el artefacto se entreno con datos casi en tiempo real de una unica ventana. La model card indica 5 dias en la tabla de la ejecucion, mientras que la seccion de limitaciones menciona una ventana de 7 dias; es una inconsistencia interna que conviene resolver antes de reutilizar el modelo.
- Aproximacion ecuatorial de eps: eps=0,12 en espacio escalado se traduce en unos 5 km en el ecuador, pero esa equivalencia se degrada con la latitud. En zonas de latitud media o alta los complejos pueden quedar mal delimitados.
- Confianza VIIRS cualitativa: los niveles l/n/h se mapean linealmente a 20/50/90. Es una aproximacion arbitraria que mezcla una escala ordinal con una numerica y puede sesgar la etapa 2 de KMeans.
- Inestabilidad de los identificadores de cluster: DBSCAN se reajusta en cada lote, por lo que los identificadores de complejo no son estables entre ejecuciones. La aplicacion IGNIS reordena por FRP acumulado para paliar este efecto, pero cualquier integracion que persista IDs debe asumir esta limitacion.
- Calidad de clustering modesta: la silueta muestreada de 0,1779 indica una separacion debil entre grupos. No conviene tratar las clases de comportamiento como categorias fisicas validadas sin comprobacion externa.
- Descuadre entre complejos y clases: la ejecucion reporta 63 complejos, pero los recuentos de clase suman 59 (54 + 4 + 1). Ademas, el diagrama del pipeline menciona cuatro clases (megafire, major, active, smoldering) mientras que los recuentos publicados solo cubren tres. Hay que verificar metrics.json antes de asumir el etiquetado.
- Riesgo de falsos positivos por fuentes no vegetales: al basarse en detecciones de foco activo, el sistema puede agrupar quemas controladas, antorchas industriales o erupciones, sin que exista un filtro de causa en el pipeline descrito.
- Sin validacion con verdad de terreno: no se aportan metricas de contraste contra perimetros oficiales de area quemada ni contra productos validados, por lo que el rendimiento real en un contexto operativo es desconocido.
- Licencia MIT para codigo y pesos, con datos FIRMS en dominio publico: no hay restriccion de uso comercial aparente, pero si se redistribuyen los datos de entrada debe respetarse la atribucion a NASA FIRMS y a la LANCE.
- Estado de adopcion nulo: 0 descargas y 0 likes, repositorio de 0,0 GB y creado y actualizado el mismo minuto. Es un artefacto de hackathon, sin mantenimiento demostrado ni historial de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nabidnur/ignis-fire-regime-model
- Dataset de referencia (reglas de armonizacion): https://huggingface.co/datasets/Nabidnur/ignis-fire-calendar
- Aplicacion IGNIS (Burning Activity Calendar, NASA Space Apps 2026): https://ignis-spaceapps2026.vercel.app
- NASA FIRMS (datos de focos activos, MODIS C6.1 y VIIRS V2): https://firms.modaps.eosdis.nasa.gov
- NASA Space Apps Challenge 2026, reto #9 "Harmonization of MODIS and VIIRS Hot Spots": no disponible (no se proporciona URL directa)
- Publicacion o paper asociado: no disponible
- Repositorio de codigo independiente: no disponible (el pipeline train_segmenter.py se distribuye dentro del propio repositorio del modelo)
- Nota sobre la busqueda web: los resultados obtenidos no guardaban relacion con el modelo ni con teledeteccion de incendios, por lo que no se han incluido.
