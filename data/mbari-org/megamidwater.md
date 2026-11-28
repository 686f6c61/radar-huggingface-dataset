# MBARI-org/megamidwater

## Resumen

megamidwater es un detector de objetos de visión por computador desarrollado por MBARI-org (Monterey Bay Aquarium Research Institute) para la identificacion de fauna marina en imagenes de aguas medias (midwater). El modelo se basa en la arquitectura YOLOv5 y ha sido afinado a partir de MegaFishDetector, un detector previo entrenado sobre la combinacion de seis conjuntos de datos submarinos. Su proposito es abordar la deteccion de animales marinos en conjuntos de datos con distribucion de cola larga, un problema recurrente en ecologia marina donde unas pocas especies aparecen con frecuencia y muchas otras son raras.

El modelo se enmarca en el proyecto de internado de verano de 2024 de MBARI, documentado en el trabajo de Tarun Sharma (Caltech) sobre el uso de datos no etiquetados y estrategias de preentrenamiento autosupervisado y semisupervisado para deteccion de animales marinos en datasets de cola larga. La relevancia actual radica en la necesidad de automatizar el analisis de grandes volumenes de imagenes subacuaticas capturadas por vehiculos autonomos submarinos (AUV), donde la anotacion manual no escala.

La ficha tecnica disponible es limitada: el repositorio ocupa 0,2 GB, la libreria declarada es yolov5 7.0.7, la licencia es Apache 2.0 y el unico benchmark publicado es un mAP@0.5 de 0,73555 declarado por el autor y no verificado. No se especifican parametros, contexto ni composicion detallada del dataset de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv5 (detector de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio yolov5, 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv5, un detector de objetos de una etapa basado en una red convolutional con cabeza de deteccion multiple. El modelo parte de MegaFishDetector (Yang et al. 2023), entrenado sobre la combinacion de seis conjuntos de datos submarinos, y se afina posteriormente para la deteccion de fauna en aguas medias. La model card indica que el entrenamiento se realizo en el contexto de un proyecto de investigacion sobre estrategias de preentrenamiento autosupervisado y semisupervisado para datasets de cola larga, lo que sugiere el uso de datos no etiquetados como complemento al conjunto etiquetado.

No se detalla en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos especificas mas alla de las propias de YOLOv5. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo. La configuracion de inferencia recomendada por el autor incluye umbral de confianza NMS de 0,25, IoU NMS de 0,1, `agnostic=False`, `multi_label=False`, `max_det=1000` y tamano de imagen de 1280.

## Capacidades

- Deteccion de objetos en imagenes submarinas de aguas medias (midwater).
- Identificacion de fauna marina en escenarios de cola larga, donde las clases raras estan infrarrepresentadas.
- Inferencia sobre imagenes individuales mediante la libreria `yolov5` de Python.
- Salida en formato de cajas delimitadoras con coordenadas, clase y confianza, exportable a DataFrame de pandas.
- Ajuste fino sobre datasets personalizados mediante el comando `yolov5 train`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no aplicables: las etiquetas y la documentacion estan en ingles.
- No dispone de modo thinking, vision multimodal, audio ni otras capacidades especiales mas alla de la deteccion de objetos.

## Casos de uso

- Analisis automatizado de transectos de AUV: el modelo puede procesar lotes de imagenes capturadas por vehiculos autonomos submarinos y generar detecciones de fauna para estudios de biodiversidad, reduciendo la revision manual.
- Monitorizacion de ecosistemas de aguas medias: permite cuantificar la presencia y abundancia relativa de organismos en imagenes de camaras fijas o remolcadas, adecuado por su entrenamiento especifico en este dominio.
- Construccion de datasets etiquetados: las detecciones del modelo pueden servir como preanotaciones para acelerar el etiquetado humano en proyectos de ecologia marina.
- Investigacion en aprendizaje semisupervisado: el modelo sirve como punto de partida para experimentos de preentrenamiento con datos no etiquetados en dominios de cola larga, tal como se describe en el trabajo de Sharma (2024).
- Clasificacion y conteo de especies raras: su afinado sobre MegaFishDetector y su enfoque en cola larga lo hacen util para tareas donde las clases minoritarias son criticas.
- Integracion en pipelines de analisis oceanografico: puede incorporarse en flujos de procesamiento por lotes que alimenten bases de datos de observaciones biologicas de MBARI u otras instituciones.
- Prototipado rapido en investigacion academica: la licencia Apache 2.0 y la disponibilidad en Hugging Face permiten reutilizacion y ajuste fino sin restricciones comerciales.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card. No se han publicado resultados adicionales en la informacion proporcionada.

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| Deteccion de objetos | mAP@0.5 | 0,73555 | No |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del tamano concreto de los pesos YOLOv5, que no se especifica.
- GPU recomendadas: no disponibles. Por la naturaleza de YOLOv5 y el tamano del repositorio (0,2 GB), es probable que quepa en GPUs de consumo, pero este dato no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: la model card documenta el uso mediante la libreria `yolov5` de Python (`pip install -U yolov5`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa con alternativas concretas. El modelo se basa en MegaFishDetector (Yang et al. 2023), del que es un ajuste fino, pero no se aportan metricas comparativas entre ambos ni con otros detectores de fauna marina.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| megamidwater | no disponible | no aplica | mAP@0.5 0,73555 (no verificado) | Apache 2.0 | Hugging Face |
| MegaFishDetector | no disponible | no aplica | no disponible | no disponible | no disponible en la informacion |
| Alternativas adicionales | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El unico benchmark publicado (mAP@0.5 = 0,73555) esta declarado por el autor y marcado como no verificado; debe interpretarse con cautela.
- El modelo esta especializado en imagenes submarinas de aguas medias; su rendimiento fuera de este dominio no esta documentado y probablemente sea limitado.
- El entrenamiento sobre datasets de cola larga implica que las clases raras pueden tener menor recall; no se aportan metricas por clase.
- No se documentan sesgos especificos, pero al tratarse de un dataset biologico limitado, la distribucion de especies y condiciones de imagen puede no representar todos los entornos marinos.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de falsos positivos y falsos negativos en deteccion, especialmente con umbrales de confianza bajos (0,25 recomendado).
- La licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (seis datasets submarinos) no se detalla, lo que podria plantear dudas sobre derechos de los datos subyacentes.
- El modelo esta marcado con `inference: false` en la model card, lo que puede indicar que la inferencia no esta habilitada en el Hub o que requiere configuracion manual.
- La documentacion y las etiquetas estan unicamente en ingles.
- El repositorio tiene muy pocas descargas (5) y likes (1), lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MBARI-org/megamidwater
- Trabajo de Tarun Sharma (Caltech), 2024 Summer Intern Project: https://www.mbari.org/wp-content/uploads/Sharma_Tarun.pdf
- Paper MegaFishDetector (Yang et al. 2023), arXiv 2305.02330: https://arxiv.org/abs/2305.02330
- Repositorio yolov5-pip (fcakyon): https://github.com/fcakyon/yolov5-pip
- Contacto del autor: dcline@mbari.org
