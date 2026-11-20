# propheusai/propheus-models

## Resumen

Propheus street models es un conjunto de dos adaptadores LoRA publicados por propheusai sobre el modelo base google/embeddinggemma-2 (licencia Apache 2.0). No se trata de un modelo generativo, sino de un sistema de extraccion de caracteristicas y puntuacion aplicado a fotografia de calle a nivel de via: un adaptador evalua la "caminabilidad" (walkability) de un punto de la calle con una puntuacion de 0 a 100, y el otro evalua la limpieza del borde de la acera (cleanliness) a partir de la presencia, cantidad y tipo de residuos.

El problema que resuelve es el analisis automatizado y estandarizado de imagenes de street-level para auditoria urbana: en lugar de una salida generica de vision, el modelo devuelve estructuras de datos cerradas (tipo de via, nueve criterios ponderados, techos de regla, recomendaciones de mejora; o cantidad y forma de los residuos, urgencia y una puntuacion agregada por calle). Esto lo hace util para pipelines de inspeccion municipal, analisis de accesibilidad y planificacion urbana a escala.

Es relevante por su enfoque hibrido: un adaptador pequeno sobre la parte visual de un modelo base de embeddings, con formulas de puntuacion fijas encima, lo que reduce el coste computacional (unos 1,2 GB de VRAM por modelo) y hace la salida determinista y auditable. El repositorio solo contiene las partes de Propheus; el modelo base se descarga automaticamente en el primer uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre la parte visual de google/embeddinggemma-2, con cabezas de lectura y formulas de puntuacion fijas |
| Parametros totales | no disponible (el repositorio tiene 0,0 GB; el adaptador es de tamano reducido, pero no se publica el numero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida es estructurada, con etiquetas en ingles en los ejemplos de la model card) |
| Licencia | no disponible (el modelo base es Apache 2.0; la licencia del adaptador no se especifica) |
| Formato de pesos | adaptadores PEFT (formato no detallado); el modelo base se descarga en safetensors desde Hugging Face |

## Arquitectura y entrenamiento

El sistema se construye sobre google/embeddinggemma-2, un modelo base de embeddings. Sobre su parte visual se aplica un adaptador LoRA de Propheus, y encima se anaden cabezas de lectura y formulas de puntuacion fijas. La salida no es texto libre generado, sino un conjunto de probabilidades por cabeza (por ejemplo, `obstacle_p`, `p_waste`, `heaped_p`, `amount_p`) y puntuaciones calculadas mediante reglas explicitas: techos de regla (95, 89 o 79), pesos por criterio y un libro de puntos contra una calle tipica.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO (no aplicable en este tipo de sistema). La innovacion tecnica destacable es la separacion entre la lectura perceptiva (adaptador + cabezas) y la logica de puntuacion (formulas fijas), lo que permite explicar cada resultado: la model card detalla que cada criterio incluye la lectura que lo respalda, su peso y cuanto aleja la puntuacion global de una calle tipica.

## Capacidades

- Puntuacion de caminabilidad de un punto de calle de 0 a 100, con bandas: good (75+), fair (55+), poor (35+), very poor (por debajo de 35).
- Clasificacion del tipo de via: Main road, busy lane o quiet lane, con la razon (anchura y trafico leidos de las fotos).
- Evaluacion de nueve criterios de caminabilidad, cada uno de 0 a 100: footpath, surface, dryness, separation from vehicles, hazards, accessibility, shade, active street fronts y traffic safety.
- Calculo del techo de regla (95, 89 o 79) con su razon en lenguaje natural y que tests se superaron.
- Recomendaciones de mejora ordenadas por impacto (`recs`), con la ganancia estimada de cada una.
- Deteccion de residuos en el borde de la acera: presencia (`waste`), probabilidad (`p_waste`), cantidad (handful, bagful, barrowful o truckload), forma (heaped o scattered), tipo (packaging, construction, garden, textile, other) y motivos de urgencia (settled, on the walking line, by a bin, open drain, standing water).
- Trece hechos adicionales sobre el borde de la acera (contenido parcialmente detallado en la model card).
- Puntuacion agregada de limpieza por calle de 0 a 100 (mayor es mas limpio), a partir de una secuencia de fotos; con menos de seis fotos la puntuacion es solo indicativa.
- Procesamiento de imagenes como rutas de fichero, bytes o imagenes PIL.
- Interfaz de linea de comandos con salida JSON completa y seleccion de dispositivo (`--device cpu` o `--device cuda`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues en el sentido de un LLM generativo.

## Casos de uso

- Auditoria municipal de accesibilidad: procesar lotes de fotos de calle para obtener la puntuacion de caminabilidad por punto y los nueve criterios desglosados, permitiendo priorizar intervenciones en aceras con peor superficie o menor separacion del trafico.
- Planificacion de sombra y arbolado: el criterio `shade` con su lectura y peso permite identificar tramos con deficit de sombra y estimar la mejora que aportarian intervenciones concretas mediante `recs`.
- Inspeccion de limpieza viaria: pasar una secuencia de fotos a lo largo de una calle con `Cleanliness().read(...)` para obtener la puntuacion agregada de 0 a 100 y localizar puntos con residuos acumulados (`heaped`) o en la linea de paso.
- Priorizacion de recogida de residuos: la deteccion de urgencia (junto a un contenedor, en desague abierto, con agua estancada) permite ordenar las rutas de recogida segun el riesgo sanitario.
- Analisis de seguridad vial: la lectura de `traffic safety`, `separation from vehicles` y `hazards` junto con el tipo de via permite generar informes comparativos entre calles principales y vias tranquilas.
- Monitorizacion longitudinal: al ser un sistema determinista con formulas fijas, repetir la captura en el mismo punto a lo largo del tiempo permite medir el efecto de una intervencion urbana sin variabilidad de generacion.
- Integracion en plataformas de datos urbanos: la salida JSON estructurada y las probabilidades por cabeza facilitan la ingesta en bases de datos y dashboards, con umbrales calibrados (por ejemplo, `waste_cutoff`).
- Despliegue en campo con GPU de gama media: con unos 1,2 GB de VRAM por modelo, puede ejecutarse en estaciones de trabajo o servidores modestos para procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB de memoria GPU por modelo (walkability o cleanliness). Cada modelo carga su propia copia del modelo base, por lo que cargar ambos requiere el doble.
- GPU probada: NVIDIA L40S (segun la model card).
- Requiere una GPU NVIDIA; existe la opcion `--device cpu`, aunque no se documenta su rendimiento.
- Al ser un modelo de ~1,2 GB de VRAM, cabe en GPU de consumo con suficiente memoria (por ejemplo, RTX 3060 de 12 GB o superiores), aunque no se confirma oficialmente.
- Espacio en disco: unos 3 GB para el modelo base (aproximadamente 1,5 GB de descarga) y las caches de las librerias.
- Entorno: Python 3.10 o superior (probado con 3.11), `huggingface_hub>=1.0`, dependencias fijadas en `requirements.txt`.
- Opciones de despliegue: paquete Python `propheus_street` (clases `Walkability` y `Cleanliness`) e interfaz de linea de comandos `python -m propheus_street`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La primera carga tarda aproximadamente un minuto (incluye la descarga del modelo base).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| propheusai/propheus-models | LoRA sobre embeddinggemma-2 | no disponible | no aplica | Puntuacion de caminabilidad y limpieza en fotos de calle | no disponible (base Apache 2.0) | Hugging Face, 0 descargas |
| google/embeddinggemma-2 | Modelo base de embeddings | no disponible en la informacion | no disponible | Embeddings multimodales genericos | Apache 2.0 | Hugging Face |
| Alternativas de vision para auditoria urbana | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (puntuacion estructurada de caminabilidad y limpieza a partir de street-level imagery).

## Limitaciones y advertencias

- La licencia del adaptador no se especifica; solo se confirma que el modelo base es Apache 2.0. Verificar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-20): no hay evidencia de validacion por parte de la comunidad.
- La model card no publica metricas de precision, recall ni calibracion de las cabezas; los umbrales como `waste_cutoff` se describen como calibrados pero sin datos de validacion.
- Riesgo de error en la lectura perceptiva: las puntuaciones dependen de la calidad, el encuadre y las condiciones de las fotos. La caminabilidad exige fotos desde la calzada o la acera, con encuadre especifico (tres vistas o una mirando en direccion a la calle), recortadas a 4:3 y redimensionadas a 960x720.
- La puntuacion de calle para limpieza es solo indicativa con menos de seis fotos.
- Las formulas de puntuacion fijas limitan la adaptabilidad a contextos urbanos no representados en el entrenamiento (no se documenta la composicion del dataset).
- No se documentan sesgos conocidos ni el rendimiento en idiomas o regiones distintas de las de entrenamiento.
- El sistema no es un LLM generativo: no soporta conversacion, tool calling ni razonamiento multi-paso; cualquier expectativa en ese sentido es incorrecta.
- Requiere GPU NVIDIA para el flujo recomendado; el modo CPU existe pero sin datos de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/propheusai/propheus-models
- Modelo base: https://huggingface.co/google/embeddinggemma-2
