# mmzinn12/cellpose-retinal-models

## Resumen

Los tres checkpoints de `mmzinn12/cellpose-retinal-models` son modelos finetuneados de Cellpose para la segmentacion de celulas ganglionares de retina (RGC). Combinan la cabeza de segmentacion de Cellpose con el backbone DINOv3 ViT Large y cubren tres marcadores biologicos: BRN3A, RPBMS y RGC-Snap (RGC marcadas con proteina fluorescente roja RFP).

Resuelven la cuantificacion automatizada de RGC en imagenes de microscopia confocal, una tarea critica en neurociencia y oftalmologia. Las imagenes de entrenamiento son proyecciones max de volumenes en formato .oir de Olympus, con resolucion 1024x1024 a aumento 20x (BRN3A y RPBMS) y 2048x2048 a aumento 10x (RGC-Snap), almacenadas en uint16 de 16 bits significativos. El repositorio ocupa 3.6 GB. No se han publicado resultados de benchmarks ni datos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de segmentacion Cellpose con backbone DINOv3 ViT Large |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no es un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision sin capacidades de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Modelos incluidos | cpdino_BRN3A, cpdino_RPBMS, cpdino_RGC-Snap |

## Arquitectura y entrenamiento

La arquitectura combina el marco de segmentacion de Cellpose con un backbone de vision transformer preentrenado de forma auto-supervisada, DINOv3 ViT Large. Cellpose utiliza una red en forma de U cuya cabeza genera dos mapas de gradiente (horizontal y vertical) que convergen en los centros de las celulas, lo que permite la segmentacion por instancias incluso cuando las celulas estan en contacto. El uso de DINOv3 como backbone aporta caracteristicas visuales genericas de nivel alto, obtenidas mediante aprendizaje auto-supervisado sobre un corpus masivo de imagenes.

La model card no especifica el numero de imagenes de entrenamiento, el numero de epocas ni el proceso de optimizacion, por lo que esos datos no estan disponibles. Los datos de entrenamiento para cada checkpoint son proyecciones max de volumenes .oir de microscopia Olympus: para BRN3A y RPBMS se usan imagenes a 20x de 1024x1024, y para RGC-Snap imagenes a 10x de 2048x2048, todas en formato uint16 con 16 bits significativos. No se menciona RLHF ni DPO, al tratarse de un modelo de vision no generativo.

## Capacidades

- Segmentacion por instancias de celulas ganglionares de retina (RGC) en imagenes de microscopia confocal.
- Deteccion especifica de RGC mediante los marcadores BRN3A y RPBMS en imagenes de inmunotincion.
- Deteccion de RGC marcadas con proteina fluorescente roja (RFP) mediante el checkpoint RGC-Snap.
- Procesamiento de imagenes uint16 de 16 bits significativos, con resoluciones de 1024x1024 y 2048x2048.
- Adaptado a proyecciones max de volumenes .oir de microscopios Olympus.
- No tiene capacidades de generacion de texto, tool calling, agentes ni soporte multilingue, al ser un modelo exclusivamente de vision.

## Casos de uso

- **Cuantificacion de RGC en modelos de glaucoma**: el modelo BRN3A permite contar celulas ganglionares en cortes de retina de ratones con glaucoma inducido. Automatiza un conteo que tradicionalmente se realiza de forma manual, reduciendo el tiempo por muestra.
- **Screening de compuestos neuroprotectores**: utilizando el modelo RPBMS se pueden segmentar RGC en ensayos de multiples pozos (multi-well) para evaluar si un farmaco protege a las celulas frente a una toxina. Puede integrarse en pipelines de procesamiento por lotes.
- **Analisis de retinas transgenicas marcadas con RFP**: el checkpoint RGC-Snap detecta RGC que expresan proteina fluorescente roja en tomas a 10x, lo que facilita estudios de linajes celulares, trasplantes o experimentos de trazado retinal.
- **Estudios de degeneracion y regeneracion retinal**: en experimentos de lesion del nervio optico, permite comparar densidades de RGC entre grupos control y lesionados de forma automatica y con menos subjetividad.
- **Automatizacion del analisis histologico en laboratorios de oftalmologia**: puede integrarse en flujos de trabajo de la libreria Cellpose para procesar laminas completas de retina, reemplazando el conteo manual y permitiendo analizar grandes cohortes.
- **Morfometria celular para caracterizacion de subtipos**: con los gradientes de Cellpose se puede estimar tamano, circularidad y area de cada RGC segmentada, util para clasificar subtipos de celulas ganglionares segun su morfologia.
- **Control de calidad de tinciones biologicas**: puede usarse para verificar automaticamente que una tincion de BRN3A o RPBMS ha funcionado, comprobando la presencia y densidad de RGC en imagenes de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como Dice, IoU ni precision de segmentacion, y la busqueda web no devolvio resultados relevantes sobre el rendimiento de este modelo. Se recomienda validar el modelo con datos propios antes de su uso en entornos de investigacion o diagnostico.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 3.6 GB, lo que sugiere aproximadamente 1,2 GB por checkpoint en fp32, pero no se confirma el formato de los pesos ni el consumo de memoria durante la inferencia.
- GPU recomendadas: no disponible. Dado el tamaño del backbone DINOv3 ViT Large, es probable que una GPU de consumo con 12-16 GB de VRAM (por ejemplo, RTX 4070 o RTX 4090) pueda ejecutar la inferencia, aunque no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable, dado el tamaño moderado del modelo, pero no confirmado.
- Opciones de despliegue: puede cargarse mediante la libreria Cellpose en Python con PyTorch. No aplican opciones tipicas de LLM como vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| cellpose-retinal-models | Cellpose + DINOv3 ViT Large | Segmentacion de RGC de retina | no disponible | Hugging Face |
| Cellpose original | U-Net | Segmentacion generica de celulas | Codigo abierto | GitHub |
| Cellpose 2.0 | U-Net mejorado | Modelos especializados por tipo de celula | Codigo abierto | GitHub |

No hay datos de benchmarks publicados para ninguno de los modelos comparados en este contexto, por lo que la comparacion es cualitativa. El modelo original de Cellpose es la referencia metodologica, pero no esta especializado en RGC, mientras que los checkpoints de este repositorio estan finetuneados para retina y marcadores especificos.

## Limitaciones y advertencias

- **Licencia no especificada**: no hay informacion sobre la licencia del modelo, lo que introduce incertidumbre juridica para su uso comercial. Conviene contactar con el autor antes de utilizarlo en produccion.
- **Riesgo de errores en la segmentacion**: el modelo puede generar falsos positivos o falsos negativos si la imagen de entrada difiere de las condiciones de entrenamiento.
- **Generalizacion limitada**: entrenado exclusivamente con imagenes .oir de microscopios Olympus, proyecciones max, aumentos de 10x y 20x, y datos uint16 de 16 bits. Es poco probable que funcione bien con otros formatos, otros aumentos, otras especies o tejidos sin un reentrenamiento.
- **Cobertura de marcadores limitada**: los tres checkpoints estan diseñados para RGC. No segmentan otros tipos de celulas retinales como conos, bastones o celulas amacrinas.
- **Sin benchmarks publicados**: no hay metricas de validacion, por lo que el usuario debe evaluar el rendimiento en sus propias imagenes antes de usarlo en investigacion o diagnostico.
- **Adopcion inicial baja**: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica una validacion externa minima.
- **Datos de entrenamiento no documentados**: no se especifica el numero de imagenes ni la diversidad de muestras, lo que impide evaluar posibles sesgos (por ejemplo, sesgo hacia RGC sanas frente a RGC degeneradas).

## Enlaces

- Hugging Face: https://huggingface.co/mmzinn12/cellpose-retinal-models
- No se han encontrado enlaces adicionales relevantes en la busqueda web. Los resultados obtenidos estaban relacionados con una entidad bancaria (BNP Paribas Fortis) y no tienen relacion con el modelo.
