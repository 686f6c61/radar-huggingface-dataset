# AI999X/geospatial-analytics-ai999x

## Resumen

Geospatial Analytics (geospatial-analytics-ai999x) es un motor de calculo compilado publicado por AI999X en Hugging Face, orientado a resolver preguntas y ejercicios de analisis geoespacial con pasos intermedios explicitos. Aunque se distribuye con la etiqueta `question-answering` y un `pipeline_tag` de Hugging Face, no es un modelo de lenguaje neuronal al uso: la model card describe un motor determinista que implementa 99 calculos repartidos en 14 temas (proyecciones cartograficas, geodesia sobre elipsoide, estadistica espacial, indices de teledeteccion, posicion solar, terreno y analisis de redes) y devuelve la formula, los pasos y las unidades de cada resultado. El recuento de parametros reportado en safetensors es de 4.715.520, coherente con un artefacto pequeno de pesos empaquetados mas que con un transformer de gran escala.

El modelo se ofrece en cuatro formatos de uso: aplicacion de escritorio (Windows y Linux), interfaz de linea de comandos, version web y paquete de Python (`pip install geospatial-analytics-ai999x`), con la promesa de ejecucion completamente offline y de resultados identicos entre plataformas. Su propuesta de valor es la ausencia de alucinacion: cuando una entrada falta o esta fuera de rango, el motor devuelve una explicacion en lenguaje natural en lugar de un numero inventado, lo que lo hace adecuado para docencia, correccion de ejercicios y validacion de calculos en entornos GIS.

Es relevante ahora porque cubre un nicho mal servido por los LLM generalistas: los calculos geodesicos y estadistico-espaciales exigen precision numerica y trazabilidad de formulas, algo que un modelo generativo no garantiza. La ficha se limita a los datos publicados por el autor; no hay informacion sobre arquitectura interna, datos de entrenamiento ni proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (motor de calculo compilado; la model card no describe una arquitectura neuronal) |
| Parametros totales | 4.715.520 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (artefacto en Hugging Face); distribucion adicional como binarios de escritorio/CLI y paquete Python |
| Biblioteca | `geospatial-analytics-ai999x` |
| Pipeline declarado | `question-answering` |
| Cobertura funcional | 99 calculos en 14 temas |
| Plataformas | Windows y Linux (x86-64); macOS y ARM via build Python puro |
| Requisitos | Python 3.10+ para la via Python |
| Descargas | 354 |
| Fecha de creacion | 2026-10-25 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

La model card no documenta una arquitectura de red neuronal, ni datos de entrenamiento, ni fases de RLHF o DPO. Lo que describe es un motor compilado que implementa formulas cerradas de geodesia, cartografia, estadistica espacial, teledeteccion y analisis de redes, con resolucion paso a paso y gestion explicita de errores de entrada. La etiqueta `inference: false` en el encabezado YAML sugiere que el repositorio no esta pensado para inferencia con las librerias estandar de Hugging Face (`transformers`, `text-generation-inference`), sino como artefacto de distribucion de un producto de software.

La innovacion tecnica declarada es la determinacion y la portabilidad: el mismo motor compilado se empaqueta para escritorio, CLI y Python en Windows y Linux x86-64, mientras que en macOS y ARM se instala una build en Python puro que, segun el autor, produce las mismas respuestas. El conjunto de benchmarks reporta resultados identicos en Windows y Linux sobre Python 3.10 a 3.14. No se detalla el proceso de construccion del motor ni el origen de los pesos safetensors.

## Capacidades

- Calculo de proyecciones cartograficas: conversion latitud/longitud a UTM con factor de escala y convergencia de meridianos, Mercator, Lambert Conformal Conic, Albers y coordenadas ECEF.
- Geodesia sobre elipsoide: distancia geodesica, area y perimetro de poligonos geodesicos, latitudes auxiliares (geocentrica, reducida, conforme, autalica y rectificadora).
- Estadistica espacial: autocorrelacion global de Moran's I con inferencia normal y por aleatorizacion, Getis-Ord, kriging y variogramas, estimacion de densidad por kernel.
- Teledeteccion: indices de vegetacion NDVI, EVI, SAVI, OSAVI, MSAVI y EVI2 a partir de reflectancias de banda.
- Analisis de terreno y posicion solar.
- Analisis urbano y de redes: instalacion masiva mas cercana para cada nodo de una red, entre otros calculos de red.
- Conversion de formatos angulares: grados decimales a grados, minutos y segundos; escala de mapa (fraccion representativa) a partir de distancias.
- Resolucion paso a paso: cada respuesta incluye formula, pasos intermedios y unidades.
- Gestion de entradas invalidas: devuelve una explicacion en lenguaje natural en lugar de un valor cuando falta un dato o esta fuera de rango.
- Ejecucion offline en el equipo del usuario, sin llamadas a servicios externos.
- Cuatro interfaces: aplicacion de escritorio, linea de comandos, navegador y API de Python.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso generativo, vision, audio ni modo thinking.

## Casos de uso

- Docencia de geodesia y cartografia: el motor resuelve ejercicios de conversion a UTM o de area de poligonos sobre elipsoide mostrando formula, pasos y unidades, lo que permite al estudiante verificar el procedimiento y no solo el resultado.
- Correccion automatizada de tareas: con 615 preguntas documentadas como referencia de evaluacion, un docente puede construir un banco de ejercicios y comprobar respuestas de forma determinista y offline, sin depender de conectividad ni de cuotas de API.
- Validacion de pipelines GIS: antes de desplegar una transformacion de coordenadas en produccion, se contrasta el resultado del motor con el de la libreria del proyecto (por ejemplo, PROJ) para detectar discrepancias en factor de escala o convergencia.
- Analisis exploratorio de autocorrelacion espacial: calcular Moran's I global con inferencia normal y por aleatorizacion sobre un conjunto de datos de censos o precios de vivienda, obteniendo el estadistico y su significancia en un solo paso reproducible.
- Procesamiento de imagenes de satelite: derivar indices de vegetacion (NDVI, EVI, SAVI) a partir de reflectancias de banda para monitorizacion de cultivos o seguimiento de sequias, con la formula explicita para auditar el calculo.
- Planificacion urbana y logistica: calcular la instalacion mas cercana para cada nodo de una red de transporte o de servicios, util para estudios de accesibilidad y cobertura de equipamientos.
- Integracion en scripts y notebooks: mediante `pip install geospatial-analytics-ai999x`, incorporar los calculos a un cuaderno de Python o a un pipeline de CI para generar informes reproducibles en Windows y Linux.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de su propia evaluacion interna, no verificada de forma independiente (`verified: false`).

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Question answering geoespacial | Golden answers (615 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 (identico en todas las plataformas) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El valor 1.0 debe interpretarse como concordancia con las respuestas de referencia del propio autor sobre un conjunto curado por el, no como una medida de calidad frente a terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el motor no requiere GPU y la model card no publica requisitos de memoria grafica.
- GPU recomendadas: no disponible; no se documenta aceleracion por GPU.
- Compatibilidad con GPU de consumo: no disponible; el producto se distribuye como aplicacion de escritorio, CLI y paquete Python para CPU.
- Plataformas soportadas: Windows y Linux x86-64 con el motor compilado; macOS y ARM con la build Python puro; Python 3.10 o superior en la via de paquete.
- Opciones de despliegue: aplicacion de escritorio, linea de comandos `geospatial-analytics`, version web en la pagina del modelo y biblioteca de Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tamano del repositorio (0.0 GB) y el caracter determinista del calculo sugieren una huella ligera, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros que permitan una comparacion cuantitativa. La tabla recoge la comparacion cualitativa posible con alternativas de la misma categoria funcional.

| Criterio | geospatial-analytics-ai999x | PROJ / pyproj | LLM generalista (p. ej. GPT, Llama) | Librerias de estadistica espacial (PySAL, GeoDa) |
|---|---|---|---|---|
| Enfoque | Motor de calculo con explicacion paso a paso | Transformacion de coordenadas | Generacion de texto | Analisis espacial |
| Determinismo | Si, por diseno | Si | No | Si |
| Explicacion de pasos | Si, formula y unidades | No | Si, pero puede alucinar | Parcial |
| Cobertura | 99 calculos en 14 temas | Proyecciones y geodesia | Amplia pero no fiable numericamente | Estadistica espacial |
| Ejecucion offline | Si | Si | No (salvo modelos locales) | Si |
| Licencia | Apache 2.0 | MIT | Variable | BSD (segun libreria) |
| Parametros / contexto | 4.715.520 parametros; contexto no disponible | No aplica | Miles de millones; contexto variable | No aplica |

## Limitaciones y advertencias

- La evaluacion de accuracy 1.0 procede del propio autor, sobre un conjunto de 615 preguntas curado por el y marcada como no verificada; no constituye una validacion independiente.
- La model card no documenta arquitectura, datos de entrenamiento, sesgos ni proceso de validacion numerica frente a estandares como PROJ o GeographicLib.
- El soporte de idioma declarado es unicamente ingles; no hay evidencia de interfaz o explicaciones en castellano.
- La cobertura se limita a los 99 calculos implementados en 14 temas; cualquier calculo fuera de ese catalogo no esta soportado.
- El encabezado `inference: false` indica que el repositorio no esta preparado para el flujo estandar de Hugging Face; la integracion debe hacerse mediante el paquete Python o los binarios distribuidos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones de los binarios descargados desde GitHub.
- No hay informacion sobre latencia, throughput ni consumo de recursos, lo que dificulta dimensionar un despliegue en produccion.
- No se documentan mecanismos de tool calling ni integracion con agentes, por lo que no debe asumirse compatibilidad con frameworks de orquestacion de LLM.
- El numero de descargas (354) y la ausencia de likes indican una adopcion todavia muy limitada; la madurez del proyecto no puede inferirse de la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/geospatial-analytics-ai999x
- Pagina del producto con demo web: https://www.ai999x.com/models/geospatial-analytics-ai999x/
- Demo interactiva (seccion de capacidades): https://www.ai999x.com/models/geospatial-analytics-ai999x/#capabilities
- Aplicacion de escritorio para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-geospatial-analytics-1.6.7-windows-x86_64.zip
- Aplicacion de escritorio para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-geospatial-analytics-1.6.7-linux-x86_64.tar.gz
- CLI para Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI para Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Video de demostracion: https://www.ai999x.com/?ax_shot=geospatial-analytics-ai999x/clip.mp4
