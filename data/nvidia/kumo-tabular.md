# nvidia/Kumo-Tabular

## Resumen

Kumo Tabular es un modelo fundacional tabular preentrenado desarrollado por NVIDIA, diseñado específicamente para tareas de clasificación y regresión sobre datos estructurados. A diferencia de un modelo de lenguaje, su entrada son tablas: el usuario proporciona un conjunto de ejemplos etiquetados como contexto (x_context, y_context) y el modelo devuelve probabilidades de clase para las filas nuevas (x_query). Esto lo sitúa en la categoría de los modelos fundacionales tabulares con aprendizaje en contexto, que evitan reentrenar un modelo distinto por cada conjunto de datos.

El modelo se publica junto a la librería `structured-data-models`, que actúa como interfaz oficial de inferencia e integra tipos nativos de pandas y scikit-learn. El flujo de trabajo típico consiste en cargar un DataFrame, inferir los tipos de columna con `sdm.infer_stypes`, construir un `TableTensor` y ejecutar el modelo sobre GPU (`device="cuda"`). En el ejemplo de la model card se utiliza el conjunto Breast Cancer de scikit-learn con 300 filas de contexto y 8 estimadores (`num_estimators=8`).

El repositorio ocupa 2,4 GB y está liberado bajo licencia OpenMDW 1.1. Los metadatos indican una creación el 1 de septiembre de 2026 y una última actualización el 28 de septiembre de 2026. En el momento de redactar esta ficha acumula 14 "likes" y 0 descargas, por lo que se trata de un lanzamiento reciente con validación comunitaria todavía escasa. La model card no detalla arquitectura interna, número de parámetros, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura interna; se describe como modelo fundacional tabular preentrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible (la API recibe `x_context`/`y_context` con ejemplos etiquetados, pero no se publica el numero maximo de filas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre datos tabulares; no se declaran idiomas) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | no disponible (el repositorio ocupa 2,4 GB; la model card no especifica safetensors, GGUF ni otro formato) |
| Tarea | Clasificacion y regresion sobre datos tabulares |
| Interfaz de inferencia | Libreria `structured-data-models` (paquete `sdm`) |
| Dispositivo | GPU CUDA en los ejemplos de la model card (`device="cuda"`) |
| Tamano del repositorio | 2,4 GB |
| Fecha de publicacion | 1 de septiembre de 2026 (ultima actualizacion: 28 de septiembre de 2026) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: la model card se limita a presentarlo como un modelo fundacional tabular preentrenado para clasificacion y regresion. No se indican el tipo de red (transformer, MoE, hibrida u otra), el numero de parametros, la composicion del dataset de preentrenamiento, el volumen de tokens o filas utilizadas, ni si hubo fases de ajuste fino con tecnicas como RLHF o DPO.

Lo que si se documenta es el mecanismo de uso: aprendizaje en contexto sobre datos tabulares. El modelo recibe un bloque de filas etiquetadas (`x_context`, `y_context`) y un bloque de filas sin etiquetar (`x_query`), y devuelve probabilidades de clase. La inferencia admite un parametro `num_estimators` (8 en el ejemplo oficial), lo que sugiere un esquema de agregacion de varios estimadores para estabilizar la prediccion. Los tipos de columna se gestionan mediante `sdm.infer_stypes`, con posibilidad de sobrescritura explicita (por ejemplo, forzar el target a `categorical`). Cualquier otro detalle tecnico de entrenamiento debe considerarse no disponible.

## Capacidades

- Clasificacion tabular: genera probabilidades de clase para filas nuevas a partir de ejemplos etiquetados usados como contexto.
- Regresion tabular: la model card indica que el modelo cubre tambien tareas de regresion, aunque el ejemplo publicado solo muestra clasificacion.
- Aprendizaje en contexto (in-context learning): no requiere reentrenamiento por conjunto de datos; basta con aportar filas etiquetadas de contexto.
- Agregacion de estimadores: el parametro `num_estimators` permite combinar varios estimadores en una misma llamada (8 en el ejemplo oficial).
- Manejo de tipos de columna: soporte de tipos tabulares mediante `sdm.infer_stypes` y sobrescrituras por columna (`overrides={"target": "categorical"}`).
- Integracion con el ecosistema Python de datos: conversion directa desde pandas mediante `sdm.TableTensor.from_pandas` y compatibilidad con datasets de scikit-learn.
- Inferencia en GPU: los ejemplos usan `device="cuda"`.
- No se declaran capacidades de generacion de texto, tool calling, function calling, uso agentico, vision, audio, ni soporte multilingue.

## Casos de uso

- Scoring de riesgo crediticio: el modelo puede estimar probabilidades de impago usando un historico de solicitudes etiquetadas como contexto y aplicarlas a nuevas solicitudes, sin reentrenar un modelo especifico por cada producto financiero.
- Deteccion de fraude en transacciones: clasificacion binaria sobre variables tabulares de operaciones (importe, comercio, hora, dispositivo), aportando como contexto un lote de transacciones etiquetadas por el equipo de riesgos.
- Prediccion de abandono de clientes (churn): clasificacion de clientes en riesgo a partir de variables de uso, antiguedad y facturacion, con ejemplos historicos etiquetados como contexto para adaptar el modelo a cada cartera.
- Valoracion y regresion de precios: tareas de regresion sobre datos estructurados, como estimar el precio de un inmueble a partir de superficie, ubicacion y caracteristicas, aportando ventas recientes como contexto.
- Triaje clinico sobre datos tabulares: el ejemplo oficial usa el conjunto Breast Cancer de scikit-learn, lo que refleja un caso realista de apoyo a la clasificacion diagnostica a partir de variables de laboratorio.
- Mantenimiento predictivo industrial: clasificacion de lecturas de sensores tabulares para anticipar fallos de maquinaria, usando un historico de eventos etiquetados como contexto por linea de produccion.
- Enriquecimiento y anotacion de datos: uso del modelo para preetiquetar registros tabulares sin etiqueta antes de una revision humana, reduciendo el coste de anotacion en pipelines de datos.
- Priorizacion comercial de leads: clasificacion de prospectos en CRM con variables demograficas y de comportamiento, con `num_estimators` elevado para obtener probabilidades mas estables en decisiones de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia indirecta, el repositorio ocupa 2,4 GB, por lo que los pesos ocuparian del orden de 2-3 GB en memoria; esto es una estimacion a partir del tamano del repositorio y no un dato confirmado por NVIDIA.
- GPU recomendadas: no disponible. La model card solo indica ejecucion sobre CUDA; cualquier GPU NVIDIA con VRAM suficiente para los pesos y los lotes de contexto deberia ser valida.
- Encaje en GPU de consumo: no confirmado. Bajo la estimacion anterior, una GPU de consumo con 8-16 GB de VRAM (por ejemplo, gama RTX xx60/xx70/xx80 o superior) podria alojar el modelo, pero no hay confirmacion oficial ni cifras de rendimiento.
- Opciones de despliegue: la via documentada es la libreria `structured-data-models` (`pip install structured-data-models`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Los unicos parametros de rendimiento mencionados son el numero de estimadores (`num_estimators=8` en el ejemplo), que afecta al coste de computo, y el tamano del bloque de contexto (300 filas en el ejemplo), que tambien influye en el tiempo de inferencia.

## Comparativa con modelos similares

No se han encontrado datos comparativos verificables en la informacion proporcionada ni en los resultados de busqueda web, que devolvieron unicamente paginas corporativas genericas de NVIDIA sin relacion con el modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Kumo Tabular (nvidia) | no disponible | no disponible | OpenMDW 1.1 | HuggingFace: nvidia/Kumo-Tabular | no disponible |
| Alternativas de la misma categoria (modelos fundacionales tabulares) | no disponible | no disponible | no disponible | no verificada en la busqueda | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento del modelo frente a alternativas ni frente a metodos clasicos como gradient boosting.
- La model card no documenta arquitectura, parametros, datos de entrenamiento ni proceso de ajuste, lo que dificulta auditar su comportamiento.
- Sesgos conocidos: no se declaran. Al tratarse de un modelo que aprende de los ejemplos de contexto, cualquier sesgo presente en las filas etiquetadas aportadas por el usuario puede propagarse a las predicciones.
- Riesgo de predicciones mal calibradas fuera de la distribucion: si las filas de consulta difieren de las filas de contexto (cambio de dominio, variables nuevas, rangos no vistos), no hay garantias de comportamiento.
- Limite de contexto no especificado: se desconoce el numero maximo de filas de contexto admitidas y como degrada el rendimiento al crecer el bloque.
- Idiomas: no declarados. El concepto de idioma no aplica directamente a datos tabulares, pero tampoco se documenta el tratamiento de columnas de texto libre.
- Licencia OpenMDW 1.1: es necesario revisar los terminos completos antes de un uso comercial. En la informacion proporcionada no se detallan las condiciones concretas de explotacion.
- Dependencia de la libreria `structured-data-models` y de GPU CUDA: no se documenta una ruta de ejecucion en CPU ni una API alternativa.
- Adopcion temprana: 0 descargas y 14 "likes" en el momento de la consulta, con fechas de publicacion muy recientes, lo que implica poca validacion independiente en produccion.
- No apto para tareas de generacion de texto, agentes o tool calling: las capacidades declaradas se limitan a clasificacion y regresion tabular.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio de la libreria de inferencia: https://github.com/NVIDIA/structured-data-models
- Instalacion: `pip install structured-data-models`
- Pagina corporativa de NVIDIA (resultado de busqueda generico, sin informacion especifica del modelo): https://www.nvidia.com/
- Entrada de NVIDIA en Wikipedia (resultado de busqueda generico): https://en.wikipedia.org/wiki/Nvidia
- Paper, blog tecnico o demo especificos del modelo: no disponibles en la informacion proporcionada.
