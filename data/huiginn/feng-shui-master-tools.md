# Huiginn/feng-shui-master-tools

## Resumen

Feng Shui Master Tools es un conjunto de scripts de linea de comandos en Python publicados por el usuario Huiginn en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal: es una coleccion de seis utilidades que consultan datos publicos de mapas y meteorologia para elaborar un informe basico del entorno de una propiedad. Geocodifica direcciones, estima la orientacion de un edificio, senala elementos viarios cercanos, describe la orografia y el viento, lista servicios proximos y genera un mapa explicativo en PNG.

El proyecto se apoya en servicios publicos bien conocidos: Nominatim para geocodificacion, Overpass y la API de OpenStreetMap para geometrias, Open-Meteo (Copernicus DEM y ERA5) para elevacion y viento historico, y el servidor de demostracion de OSRM para distancias de ruta. Toda la logica es determinista y se ejecuta localmente; el unico coste es la latencia de las llamadas HTTP a esos proveedores.

Su interes actual es modesto desde el punto de vista de la IA: no hay pesos, no hay inferencia y no hay benchmarks. Resulta relevante como ejemplo de herramienta de investigacion asistida por datos abiertos y como utilidad educativa para quienes quieran explorar el entorno de una direccion sin depender de servicios comerciales. La licencia MIT y el soporte de ingles y vietnamita son sus principales atractivos practicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: conjunto de scripts Python, sin modelo neuronal |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles y vietnamita (etiquetas y ejemplos de la documentacion) |
| Licencia | MIT |
| Formato de pesos | No disponible (no hay pesos; el codigo se distribuye como scripts) |

## Arquitectura y entrenamiento

No existe arquitectura de red ni proceso de entrenamiento. El repositorio contiene seis scripts independientes (`geocode.py`, `facing.py`, `road_pointing.py`, `landform_env.py`, `amenities.py` y `explainer_map.py`) que se ejecutan con Python 3.10 o superior. Cada script imprime JSON por la salida estandar, salvo `explainer_map.py render`, que genera una imagen PNG. La composicion se hace por convenio: `explainer_map.py collect` busca los scripts hermanos en la misma carpeta y fusiona sus resultados.

Las dependencias declaradas son `requests`, `shapely`, `pyproj`, `osmnx` y `matplotlib`; `pygeomag` es opcional y activa el calculo de declinacion magnetica en `facing.py`. Las llamadas HTTP usan el User-Agent `feng-shui-master-tools/1.0`, configurable mediante `GEOCODE_UA` para cumplir la politica de uso de Nominatim. Las respuestas se cachean en `~/.cache/property-check/` y la tasa de peticiones a Nominatim se limita a una por segundo. El endpoint de Overpass es configurable con `OVERPASS_URL`.

## Capacidades

- Geocodificacion de direcciones postales, puntos de interes, coordenadas y enlaces de Google Maps u OSM mediante Nominatim, con comprobacion opcional de elevacion en un anillo alrededor del punto.
- Estimacion de la orientacion de un edificio a partir de la geometria de OSM: etiquetas de entrada, muro mas cercano a la via o perpendicular a la via mas proxima. Los rumbos son respecto al norte verdadero y se anade el magnetico si `pygeomag` esta instalado.
- Deteccion de elementos viarios relevantes en la tradicion del feng shui: cruces en T o Y, callejones sin salida orientados a la vivienda, curvas exteriores e interiores, puentes, ferrocarril elevado y vecinos sensibles, citados con sus identificadores de OSM.
- Descripcion de orografia y entorno: viento estacional a partir de ERA5, pendiente y altura relativa desde un modelo digital de elevacion, picos y masas de agua de OSM, y un indicador aproximado de flujo de personas y vehiculos. Puede generar una rosa de los vientos en PNG.
- Listado de servicios proximos (hospital, colegio, guarderia, mercado, farmacia, parque, transporte publico y gasolinera) con distancia y tiempo de ruta mediante OSRM, en perfil a pie o en coche.
- Generacion de un mapa explicativo unico en PNG con etiquetas en ingles por defecto y posibilidad de cambiar el idioma con `--labels`.
- No incluye tool calling, razonamiento multi-paso, agentes ni ninguna capacidad generativa.

## Casos de uso

- Analisis preliminar de una vivienda en venta o alquiler: ejecutar `geocode.py` y `explainer_map.py collect` sobre la direccion para obtener en minutos un JSON con orientacion, servicios y orografia antes de una visita.
- Educacion en practicas culturales: usar las salidas de `road_pointing.py` y `landform_env.py` como material didactico para explicar conceptos de la escuela de la forma con datos verificables de OSM.
- Investigacion urbanistica ligera: comparar la presencia de cruces, puentes y transporte publico en distintas ubicaciones usando los identificadores de OSM que devuelven los scripts.
- Planificacion de rutas de proximidad: `amenities.py` con perfil a pie permite estimar tiempos de acceso a colegios, farmacias y transporte publico para una direccion concreta.
- Generacion de documentacion cartografica: `explainer_map.py render` produce una imagen con atribucion de OpenStreetMap lista para incluir en informes o presentaciones.
- Evaluacion de riesgo meteorologico basico: la rosa de los vientos y el viento estacional de ERA5 sirven como orientacion inicial, siempre con la advertencia de que no sustituyen un estudio tecnico.
- Prototipado de pipelines geoespaciales: los scripts sirven como ejemplo de integracion de Nominatim, Overpass, Open-Meteo y OSRM con cache local y respeto de las politicas de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de aprendizaje automatico, no existen metricas como MMLU, HumanEval o GSM8K que aplicar.

## Requisitos de hardware

- No requiere GPU. Se ejecuta en CPU con Python 3.10 o superior.
- Memoria RAM estimada: por debajo de 1 GB para los seis scripts, dominada por `matplotlib` y `shapely`.
- Espacio en disco: minimo, limitado a las dependencias de Python y a la cache de respuestas HTTP en `~/.cache/property-check/`.
- Despliegue: ejecucion directa con `python3 script.py`; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no hay pesos.
- Latencia: dependiente de la red. Nominatim limita a una peticion por segundo, por lo que un geocodificado con comprobacion de elevacion puede tardar varios segundos. Overpass y OSRM pueden presentar latencias variables o limitaciones de tasa.
- El servidor publico de OSRM es solo para uso ligero; para uso intensivo o comercial hay que desplegar una instancia propia.

## Comparativa con modelos similares

| Herramienta | Tipo | Datos que usa | Licencia | Notas |
|---|---|---|---|---|
| Feng Shui Master Tools | Scripts Python | OSM, Nominatim, Open-Meteo, OSRM | MIT | Enfoque cultural y educativo, sin modelo |
| osmnx | Libreria Python | OpenStreetMap | MIT | Descarga y analisis de redes viarias; no genera informes de feng shui |
| geopy | Libreria Python | Multiples geocodificadores | MIT | Geocodificacion generica, sin analisis de entorno |
| QGIS | Aplicacion de escritorio | Multiples fuentes | GPL | Analisis geoespacial completo, con curva de aprendizaje mayor |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no admite instrucciones en lenguaje natural. Cualquier expectativa de inferencia es un error de categoria.
- Las estimaciones de orientacion son heuristicas a partir de geometrias de OSM y pueden ser incorrectas; el propio autor recomienda confirmarlas con una brujula in situ.
- La elevacion, el viento y la orografia dependen de la resolucion de los modelos de Open-Meteo y pueden no reflejar condiciones locales.
- Los tiempos de ruta de OSRM ignoran el trafico en vivo y el servidor de demostracion no es apto para produccion.
- Dependencia de servicios publicos con politicas de uso estrictas: Nominatim exige User-Agent identificativo y una peticion por segundo; Overpass puede limitar la tasa; ThinkHazard y Open-Elevation son APIs de terceros.
- Cobertura desigual de OpenStreetMap segun la region, especialmente en zonas rurales o fuera de Europa y America del Norte.
- La documentacion y las etiquetas estan en ingles y vietnamita; no hay traduccion al castellano.
- El uso comercial es posible bajo MIT para el codigo, pero los datos de OSM estan bajo ODbL y requieren atribucion, y los demas proveedores tienen sus propias condiciones.
- El proyecto declara explicitamente que no sustituye una inspeccion profesional, un estudio topografico, asesoramiento de ingenieria o planificacion urbanistica.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni comunidad establecida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Huiginn/feng-shui-master-tools
- OpenStreetMap: https://www.openstreetmap.org/
- Politica de uso de Nominatim: https://operations.osmfoundation.org/policies/nominatim/
- Licencia de Open-Meteo: https://open-meteo.com/en/license
- Licencia ODbL: https://opendatacommons.org/licenses/odbl/
- Servidor de demostracion de OSRM: https://router.project-osrm.org/
- osmnx: https://osmnx.readthedocs.io/
- Overpass API: https://overpass-api.de/
