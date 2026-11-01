# Blaize-AI/YOLO11n_COCO

## Resumen

YOLO11n_COCO es una variante del detector de objetos YOLO11 en su version Nano, publicada por Blaize-AI y optimizada para su ejecucion sobre los aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un modelo de vision por computador para deteccion de objetos, entrenado originalmente por Ultralytics sobre el conjunto de datos COCO 2017 y reempaquetado en formato `.bm` (Blaize Model) para su despliegue en el hardware Graph Streaming Processor (GSP) de Blaize.

El modelo resuelve el problema de deteccion de objetos en tiempo real en el borde (edge AI), ofreciendo una arquitectura ligera pensada para dispositivos con recursos limitados. La propuesta de valor de esta publicacion concreta no es el modelo en si, sino su adaptacion al hardware de Blaize: incluye cuatro variantes con distintas resoluciones de entrada y modos de cuantizacion (INT8, BF16 y AMP) que permiten ajustar el equilibrio entre precision y velocidad de inferencia.

Es relevante para desarrolladores que trabajen con aceleradores Blaize y necesiten un detector de objetos listo para desplegar sin pasar por el proceso de conversion y optimizacion. El repositorio tiene un tamano de 0.0 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicacion reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 Nano (detector de objetos, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8, BF16, AMP (mezcla INT8 + BF16) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (Blaize Model), optimizado para GSP |

Variantes incluidas en el repositorio:

| Variante | Cuantizacion | Resolucion de entrada (W×H) | Fichero |
|---|---|---|---|
| YOLO11n_COCO_amp_416_256 | AMP | 416×256 | `YOLO11n_COCO_amp_416_256.bm` |
| YOLO11n_COCO_amp_416_416 | AMP | 416×416 | `YOLO11n_COCO_amp_416_416.bm` |
| YOLO11n_COCO_amp_640_384 | AMP | 640×384 | `YOLO11n_COCO_amp_640_384.bm` |
| YOLO11n_COCO_amp_640_640 | AMP | 640×640 | `YOLO11n_COCO_amp_640_640.bm` |

## Arquitectura y entrenamiento

El modelo subyacente es YOLO11 en su variante Nano, una red neuronal convolucional de una sola etapa disenada para deteccion de objetos en tiempo real. La arquitectura YOLO11, desarrollada por Ultralytics, emplea un backbone con bloques C3k2 y un cuello de red con conexiones multi-escala, orientada a maximizar la relacion precision/latencia en dispositivos con recursos limitados. La variante Nano es la de menor tamano de la familia y la mas adecuada para inferencia en el borde.

El entrenamiento se realizo sobre COCO 2017 (CC-BY-4.0), el conjunto de referencia para deteccion de objetos con 80 categorias. Blaize no ha modificado el codigo fuente del modelo, pero ha realizado optimizaciones especificas de hardware para hacerlo compatible con sus aceleradores GSP. El proceso de conversion genera ficheros `.bm` que incorporan la cuantizacion seleccionada (INT8 con escalado de punto fijo, BF16 para maxima precision, o AMP que combina ambos) y la resolucion de entrada fijada. No se dispone de informacion sobre el numero de tokens, composicion detallada del dataset mas alla de COCO 2017, ni sobre tecnicas de ajuste fino adicionales.

## Capacidades

- Deteccion de objetos en imagenes con las 80 categorias de COCO 2017.
- Inferencia optimizada para el acelerador Blaize GSP con arquitectura de flujo de grafo.
- Cuatro configuraciones de resolucion de entrada (416×256, 416×416, 640×384, 640×640) para ajustar precision y latencia.
- Tres modos de cuantizacion (INT8, BF16, AMP) que permiten priorizar velocidad o precision.
- Inspeccion del modelo mediante la utilidad `blaize-modeltool`.
- No soporta generacion de texto, tool calling, agentes, capacidades multilingues ni modos de razonamiento, al ser un modelo puramente de vision.

## Casos de uso

- Deteccion de objetos en videovigilancia en el borde: el modelo puede ejecutarse directamente sobre el acelerador Blaize Xplorer en camaras o dispositivos de vigilancia, detectando personas y objetos en tiempo real sin enviar video a la nube, gracias a su arquitectura GSP de baja latencia.
- Automatizacion industrial y control de calidad: en lineas de produccion, el modelo puede identificar defectos o piezas en imagenes capturadas por camaras industriales, usando la variante 640×640 para maxima precision o 416×416 para mayor velocidad.
- Robotica autonoma y navegacion: integrado en robots o drones con hardware Blaize, el detector permite percibir obstaculos y objetos del entorno en tiempo real, con la variante 416×256 adecuada para flujos de video de baja resolucion.
- Analisis de imagenes en retail: conteo de personas, seguimiento de productos en estanterias o analisis de flujos de clientes en tiendas fisicas, desplegando el modelo en dispositivos locales para preservar la privacidad.
- Vehiculos y sistemas de asistencia a la conduccion: deteccion de peatones, vehiculos y senales de trafico en entornos embebidos, aprovechando la eficiencia energetica del GSP.
- Procesamiento de imagenes satelitales o de dron: deteccion de objetos en imagenes aereas con la variante de mayor resolucion (640×640), adecuada para identificar vehiculos, edificios o cultivos.
- Prototipado rapido en hardware Blaize: desarrolladores que ya dispongan del SDK Picasso pueden cargar el modelo directamente con `blaize-modeltool` y validar pipelines de vision sin necesidad de convertir el modelo desde PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un acelerador de IA Blaize Xplorer y el SDK Picasso instalado y configurado; no esta pensado para ejecucion en GPU convencional ni CPU.
- VRAM estimada: no disponible (el modelo se ejecuta en el acelerador GSP, no en memoria de GPU estandar).
- GPU recomendadas: no aplica; el hardware objetivo es el acelerador Blaize Xplorer.
- No cabe en GPU de consumo convencional en su formato `.bm`, ya que esta compilado para la arquitectura GSP de Blaize.
- Opciones de despliegue: SDK Picasso de Blaize y la utilidad `blaize-modeltool` para inspeccion; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n_COCO (Blaize) | no disponible | 416×256 a 640×640 | no aplica | AGPL-3.0 | HuggingFace, formato `.bm` para GSP |
| YOLO11n (Ultralytics, original) | no disponible | configurable (p. ej. 640×640) | no aplica | AGPL-3.0 o licencia enterprise | GitHub Ultralytics, formato PyTorch |
| Otros detectores de la familia YOLO | no disponible | no disponible | no aplica | variable | no disponible |

La comparativa se limita al modelo original de Ultralytics, ya que no se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada. La diferencia principal frente al original es el formato y la optimizacion para hardware Blaize, no la arquitectura ni el entrenamiento.

## Limitaciones y advertencias

- El modelo solo es ejecutable en hardware Blaize Xplorer con el SDK Picasso; no es portable a GPU, CPU u otros aceleradores en su formato `.bm`.
- Al estar basado en YOLO11n, hereda las limitaciones del detector original: puede fallar en objetos pequenos, ocluidos o en condiciones de iluminacion adversas.
- La licencia AGPL-3.0 impone obligaciones de copyleft: el uso comercial en servicios en red puede requerir la publicacion del codigo fuente derivado, salvo que se disponga de la licencia enterprise de Ultralytics.
- El texto de Blaize advierte que los modelos son contenido de terceros, que no han sido revisados ni respaldados por Blaize y que no se ofrece garantia alguna sobre su precision, integridad o utilidad.
- No se dispone de informacion sobre sesgos especificos, tasas de alucinacion (no aplica a deteccion) ni limitaciones de idioma (no aplica).
- El repositorio no registra descargas ni likes, y su fecha de creacion es posterior a la de esta consulta, por lo que la madurez y el soporte de la comunidad son desconocidos.
- No se han publicado metricas de precision (mAP) ni de latencia para las variantes cuantizadas, lo que dificulta evaluar el impacto de la cuantizacion INT8 o AMP en la calidad de deteccion.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/YOLO11n_COCO
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO: https://cocodataset.org
- Blaize: https://www.blaize.com
