# sarkarghya/olmoearth-v1.2-energy-multitask-v4

## Resumen

El modelo `sarkarghya/olmoearth-v1.2-energy-multitask-v4` es un checkpoint de segmentación densa multi-tarea, especializado en el dominio energético, obtenido por fine-tuning del modelo base `allenai/OlmoEarth-v1_2-Base`. Desarrollado por Arghya Sarkar (usuario `sarkarghya`), el modelo procesa una única pasada de imágenes Sentinel-2 L2A (12 bandas, 10 m de resolución) para predecir simultáneamente la presencia de infraestructuras de generación eléctrica, el tipo de combustible de las plantas, máscaras de candidatos solares y eólicos, métricas de energía renovable (factor de capacidad, LCOE, densidad de capacidad y de generación), así como canales de fuente de energía y tipo de geometría de centros de datos. Está enfocado en el territorio de Estados Unidos y se presenta como una herramienta exploratoria de investigación, no como una auditoría energética operativa.

Con 126.634.365 parámetros y un tamaño de repositorio de 0,5 GB, el modelo es ligero y ejecutable en GPUs de consumo. La versión V4 es una especialización de la V3: congela el encoder y los decoders de renovables y centros de datos, y solo ajusta los tensores relacionados con la detección de plantas de energía y su combustible, mejorando la precisión en la detección de presencia (F1 de 1,0 en las particiones de validación) a costa de una ligera pérdida de exactitud en la clasificación de combustible. La licencia se indica como `other`, sin más detalles disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone OlmoEarth-v1.2-Base (arquitectura no detallada en la informacion disponible) |
| Parametros totales | 126.634.365 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors de precision completa) |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone `OlmoEarth-v1.2-Base`, un modelo fundacional de observacion de la Tierra desarrollado por el Allen Institute for AI (AI2). OlmoEarth v1.2 es una familia de modelos mas eficiente que la v1, con una reduccion de 2,9x en operaciones MAC para tareas de Sentinel-2 y 3,0x menos horas de GPU en el entrenamiento de los modelos base, manteniendo el rendimiento general. El checkpoint V4 se obtiene mediante fine-tuning multi-tarea sobre este backbone, con una arquitectura de decodificacion densa que produce multiples salidas simultaneas.

El entrenamiento del V4 se realizo sobre datos de Sentinel-2 L2A armonizados a 10 m, con parches de 128x128 píxeles, y se enfoco exclusivamente en el territorio de Estados Unidos. La estrategia de entrenamiento del V4, en comparacion con su predecesor V3, consistio en congelar el encoder y los decoders de renovables y centros de datos, y reentrenar solo el decoder de presencia de plantas y combustible. Se utilizo perdida Dice por muestra positiva, balanceo positivo/negativo, una mayor exposicion a muestras eolicas (que eran las que mas falsos negativos generaban en V3) y un reajuste final de la cabeza de combustible con muestreo natural. El resultado es que solo 18 tensores cambiaron respecto a V3, y el encoder y los decoders renovable/data-center son bit-identicos a V3.

La entrada esperada es un tensor uint16 de forma `[12 bandas, 1 tiempo, 128 alto, 128 ancho]` con valores de reflectancia armonizados (sin dividir por 10 000). El modelo aplica la normalizacion de OlmoEarth internamente. Se deben resamplear las bandas de 20 m y 60 m a la rejilla de 10 m y excluir píxeles con clases SCL invalidas para la agregacion.

## Capacidades

- Segmentacion densa multi-tarea a partir de una unica pasada de Sentinel-2 L2A.
- Deteccion de presencia de infraestructuras de generacion electrica (logits de presencia).
- Clasificacion amplia del tipo de combustible de plantas de energia (logits de combustible).
- Generacion de cinco mascaras de areas candidatas para energia solar y eolica.
- Estimacion de factor de capacidad renovable, LCOE (coste nivelado de energia), densidad de capacidad y densidad de generacion.
- Ocho canales de probabilidad de fuente de energia para centros de datos (no calibrados, solo contexto de observacion terrestre).
- Salida auxiliar de tipo de geometria de centros de datos (sin clase de fondo, no es un detector).
- Inferencia en imagenes de 128x128 píxeles a 10 m de resolucion, con parches de tamaño 4.

## Casos de uso

- Mapeo de infraestructura energetica a nivel regional: el modelo puede identificar la ubicacion de plantas de energia (termicas, renovables, etc.) a partir de imagenes Sentinel-2, facilitando inventarios geoespaciales actualizables sin necesidad de visitas de campo.
- Planificacion de proyectos solares y eolicos: las mascaras de candidatos y las salidas de factor de capacidad y LCOE permiten preseleccionar zonas con potencial renovable, reduciendo el trabajo de campo en fases iniciales de desarrollo.
- Analisis de impacto ambiental: al combinar la deteccion de plantas con datos de uso del suelo, se pueden estudiar correlaciones entre infraestructuras energeticas y cambios en el territorio.
- Monitoreo de expansion de centros de datos: los canales de fuente de energia y el tipo de geometria, aunque no calibrados, pueden servir como indicador cualitativo de la presencia y caracteristicas de centros de datos en areas de interes conocidas.
- Estimacion de capacidad de generacion distribuida: las salidas de densidad de capacidad y generacion pueden ayudar a modelar la produccion energetica potencial en regiones con alta penetracion renovable.
- Investigacion academica en teledeteccion y energia: el modelo sirve como punto de partida para estudios comparativos de tecnicas de multi-task learning en observacion terrestre, dado que su arquitectura y pesos son publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de vision por computador, no de lenguaje. La model card proporciona una comparacion interna entre V3 y V4 sobre particiones de validacion de sitios historicos (seed-17), con las siguientes metricas:

| Particion / metrica | V3 | V4 |
|---|---|---:|
| F1 de muestra (analisis, mejor umbral) | 0,9409 | **1,0000** |
| AP de píxel (analisis) | 0,6797 | **0,6878** |
| Exactitud de combustible (analisis) | **0,7157** | 0,6853 |
| F1 de muestra (comparacion congelada) | 0,9547 | **1,0000** |
| AP de píxel (comparacion congelada) | 0,6065 | **0,6679** |
| Exactitud de combustible (comparacion congelada) | 0,7110 | **0,7225** |
| Falsos positivos (umbral 0,50 / 9 píxeles) | 0 / 383 | 0 / 383 |
| Falsos negativos (umbral 0,50 / 9 píxeles) | 17 / 173 | **0 / 173** |

El punto operativo seleccionado es probabilidad de presencia 0,50 con componente conectado minimo de 9 píxeles (900 m²). Estas metricas no constituyen una validacion externa independiente, ya que ambas particiones influyeron en la seleccion historica del checkpoint V3 mediante la perdida de validacion agregada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 126,6 millones de parametros y un tamaño de pesos de 0,5 GB, la inferencia en precision FP32 requiere aproximadamente 0,5 GB de VRAM solo para los pesos, mas la memoria de activaciones para el parche de 128x128. Se estima que cabria en GPUs con 4-6 GB de VRAM, aunque no se ha confirmado oficialmente.
- GPU recomendadas: cualquier GPU CUDA moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. El entrenamiento del checkpoint se realizo en un clúster con 8x H100, pero eso es para fine-tuning.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y baja de consumo.
- Opciones de despliegue: el modelo se carga mediante PyTorch con safetensors. No se mencionan integraciones con vLLM, TGI u Ollama (que son tipicamente para modelos de lenguaje). Para despliegue en produccion seria necesario construir un pipeline propio de preprocesado de Sentinel-2 y postprocesado de las salidas.
- Latencia y throughput: no disponibles en la documentacion. Dado el tamaño del modelo y la entrada de 128x128, se espera una latencia de decenas de milisegundos en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (segmentacion multi-tarea de infraestructuras energeticas desde Sentinel-2). El modelo base OlmoEarth v1.2 pertenece a una familia de modelos de observacion terrestre, pero no existen publicaciones de benchmarks que comparen este fine-tune especifico con alternativas como Prithvi, SatMAE u otros modelos de teledeteccion. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgo geografico: el entrenamiento y los datos de fine-tuning estan enfocados en Estados Unidos; el rendimiento en otras regiones no esta verificado y probablemente sea inferior.
- Canales de centros de datos no calibrados: las ocho salidas de fuente de energia son probabilidades brutas sin calibrar, derivadas del contexto de observacion terrestre, y no representan porcentajes medidos de adquisicion, generacion o consumo electrico. Solo deben agregarse dentro de un ROI de centro de datos conocido; los píxeles de fondo arbitrarios no estan restringidos.
- `dc_geometry_type` no tiene clase de fondo y no funciona como detector de centros de datos.
- La clasificacion de combustible solo debe informarse despues de que la deteccion de presencia supere un umbral validado. No se debe calcular un promedio de combustible a nivel de rejilla completo.
- No se ha completado la calibracion de probabilidades ni la seleccion de umbrales por tarea con un conjunto de retencion congelado.
- La licencia se indica como `other`, sin especificar los terminos exactos; es necesario contactar con el autor para aclarar los permisos de uso comercial.
- El modelo es un checkpoint de investigacion exploratoria, no una herramienta operativa de auditoria energetica.
- No se proporcionan datos de sesgos demograficos o geograficos adicionales, pero al estar entrenado solo con datos de EE. UU., los resultados fuera de ese pais deben tratarse con extrema cautela.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/sarkarghya/olmoearth-v1.2-energy-multitask-v4
- Modelo base OlmoEarth v1.2: https://huggingface.co/allenai/OlmoEarth-v1_2-Base
- Paper de OlmoEarth v1.2 (arXiv): https://arxiv.org/abs/2605.20804
- Pagina oficial de OlmoEarth (AI2): https://olmoearth.allenai.org/
- Coleccion de modelos OlmoEarth en HuggingFace: https://huggingface.co/collections/allenai/olmoearth
- Aplicacion de mapa demo (proporcionada por el autor): https://sarkarghya--olmoearth-energy-grid-demo-web.modal.run
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/sarkarghya/power-plant-olmoearth-segmentation
  - https://huggingface.co/datasets/sarkarghya/im3-datacenter-olmoearth-segmentation
  - https://huggingface.co/datasets/sarkarghya/wind-and-solar-candidate-olmoearth-segmentation
