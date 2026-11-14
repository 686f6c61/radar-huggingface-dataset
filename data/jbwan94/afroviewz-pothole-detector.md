# JBWan94/afroviewz-pothole-detector

## Resumen

AfroViewz pothole detector es un modelo de deteccion de objetos especializado en identificar baches en imagenes de carretera, desarrollado por JBWan94 como componente central de la aplicacion AfroViewz. Se trata de un fine-tuning de RF-DETR Nano a una resolucion de 384 px, exportado a formato ONNX para su ejecucion en el navegador del dispositivo mediante onnxruntime-web, con soporte para WebGPU y un fallback a WebAssembly. El modelo resuelve el problema de detectar danos en la calzada directamente en el cliente, sin necesidad de enviar imagenes a un servidor.

El modelo forma parte de una familia mas amplia: la variante Small con recorte de banda de carretera a 704 px alcanza 0,730 mAP50, mientras que esta version Nano, con 0,643 mAP50, es la que se ejecuta con fluidez en un telefono. El repositorio ocupa 0,1 GB y los pesos se almacenan en float16, casteados a float32 dentro del grafo.

Es relevante para desarrolladores que necesitan inferencia de deteccion de objetos de baja latencia en el navegador o en dispositivos moviles, con una licencia permisiva Apache 2.0 y un pipeline de entrenamiento reproducible publicado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano (transformer de deteccion, DETR-like) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | Pesos en float16 con cast a float32 dentro del grafo; exportacion ONNX |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Nano, un detector de objetos de tipo transformer (familia DETR) que predice directamente un conjunto de cajas y etiquetas sin necesidad de supresion de no maximos (NMS). La entrada es un tensor float32 de forma `[1, 3, 384, 384]` en RGB, redimensionado con interpolacion bilineal simple (sin antialiasing), escalado a 0..1 y normalizado con media y desviacion tipica de ImageNet. Las salidas son `dets` `[1, 300, 4]` con cajas en formato cx, cy, w, h como fracciones de la imagen, y `labels` `[1, 300, 2]` con logits; la puntuacion se obtiene aplicando sigmoid al mejor logit por consulta.

El entrenamiento utilizo el dataset Stellenbosch Road Pothole Images (CC0) junto con dos datasets publicos de baches de Roboflow Universe, con divisiones agrupadas y sin fuga de datos. Para fotogramas de dashcam se recorta la banda entre el 35% y el 75% de la altura de la imagen antes de la inferencia, replicando el preprocesado de entrenamiento, y despues se desplazan las cajas de vuelta. Los pesos se almacenan en float16 y se castean a float32 dentro del grafo, de modo que los resultados coinciden con el modelo float32 (diferencia de puntuacion maxima inferior a 0,002).

## Capacidades

- Deteccion de baches en imagenes de carretera, video de dashcam y camara en vivo del telefono.
- Deteccion de objetos de una sola clase (bache) con 300 consultas por imagen y sin NMS.
- Inferencia en el dispositivo dentro del navegador mediante onnxruntime-web, con WebGPU y fallback a WebAssembly.
- Preprocesado especifico para dashcam: recorte de banda de carretera y reajuste de cajas.
- Ejecucion en movil con latencia compatible con uso en tiempo real (4,6 ms por imagen en GPU L4).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).

## Casos de uso

- Aplicacion movil de reporte de baches: el modelo se ejecuta en el navegador del telefono y detecta baches en la camara en vivo, permitiendo al usuario confirmar y geolocalizar el dano sin subir la imagen a un servidor.
- Analisis de video de dashcam: se procesan fotogramas recortando la banda de carretera (35%-75% de la altura) y desplazando las cajas, lo que permite inventariar el estado del firme en rutas grabadas.
- Mantenimiento municipal asistido: procesamiento por lotes de imagenes de inspeccion para priorizar reparaciones segun la densidad de detecciones por tramo.
- Aplicaciones web de bajo coste: al ejecutarse con onnxruntime-web y WebGPU, se integra en paginas sin infraestructura de GPU en servidor, reduciendo costes operativos.
- Prototipado rapido de vision por computador: el pipeline de datos y los notebooks de evaluacion publicados en GitHub sirven como base para fine-tuning en otros tipos de dano vial.
- Procesamiento offline en campo: el fallback a WebAssembly permite inferencia sin aceleracion GPU, util en dispositivos sin WebGPU o en entornos con conectividad limitada.

## Benchmarks y rendimiento

Resultados en el split de test (592 imagenes, 846 baches), segun la model card:

| Modelo | mAP50 (IC 95%) | mAP50:95 | ms por imagen (L4) |
|---|---|---|---|
| Este modelo (E5 Nano, recorte de banda) | 0,643 (0,599 a 0,694) | 0,344 | 4,6 |
| AfroViewz RF-DETR Small (704 px, recorte de banda) | 0,730 | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo esta pensado para ejecucion en navegador y movil, con pesos en float16 y un repositorio de 0,1 GB.
- GPU recomendadas: no se especifican; la medicion de latencia se realizo en una GPU NVIDIA L4 (4,6 ms por imagen).
- Cabe en GPU de consumo: si, al ser un modelo Nano de 384 px disenado para ejecucion en dispositivo; no se detallan modelos concretos de GPU de consumo.
- Opciones de despliegue: onnxruntime-web con WebGPU (principal) y WebAssembly (fallback); el formato ONNX permite otros runtimes compatibles.
- Latencia y throughput: 4,6 ms por imagen en L4; no se publican cifras de latencia en movil ni throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50 | Licencia | Formato |
|---|---|---|---|---|---|
| AfroViewz pothole detector (Nano) | no disponible | no aplica | 0,643 | Apache 2.0 | ONNX |
| AfroViewz RF-DETR Small (704 px) | no disponible | no aplica | 0,730 | no disponible | no disponible |
| Otros detectores de baches publicos | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la unica comparacion disponible es con la variante Small del mismo proyecto.

## Limitaciones y advertencias

- Entrenado mayoritariamente con fotogramas de dashcam de Sudafrica y fotos cercanas de telefono; la precision en carreteras de Uganda se esta midiendo en un conjunto de test de Mapillary revisado manualmente.
- No es un sistema de seguridad: no debe usarse para decisiones criticas de conduccion o seguridad vial.
- Modelo de una sola clase (bache); no detecta otros tipos de dano vial ni objetos.
- Sin capacidades de lenguaje, tool calling ni agentes.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datasets de entrenamiento (Roboflow Universe) que puedan afectar a la redistribucion.
- Riesgo de falsos positivos y negativos en condiciones de iluminacion, clima o texturas de firme no representadas en el entrenamiento; no se publican metricas de calibracion ni de robustez fuera de dominio.
- El recorte de banda de carretera para dashcam es obligatorio para replicar el rendimiento de entrenamiento; omitirlo degrada los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/JBWan94/afroviewz-pothole-detector
- Repositorio de codigo, pipeline de datos y notebooks de evaluacion: https://github.com/JBWandera/Capstone
