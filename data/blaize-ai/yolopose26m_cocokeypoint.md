# Blaize-AI/YOLOPOSE26m_COCOKeypoint

## Resumen

YOLO26m-pose COCO Keypoints es un modelo de estimacion de pose (pose detection) derivado de la familia Ultralytics YOLO, en su version 26 y variante "medium", optimizado por Blaize-AI para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un modelo de vision por computador que detecta puntos clave (keypoints) del cuerpo humano sobre el dataset COCO Keypoints 2017.

El modelo original esta entrenado en PyTorch y proviene del repositorio Ultralytics; Blaize-AI ha realizado unicamente optimizaciones especificas de hardware para hacerlo compatible con su arquitectura Graph Streaming Processor (GSP), sin modificar el codigo fuente del modelo. El repositorio distribuye los pesos en formato `.bm`, propietario de Blaize, y no en formatos estandar como safetensors, ONNX o GGUF.

Su relevancia es acotada y muy especifica: sirve para desplegar estimacion de pose en el borde (edge AI) sobre hardware Blaize, con variantes de cuantizacion AMP a dos resoluciones de entrada (640x384 y 640x640). No es un modelo de proposito general ni sustituye a un LLM; su utilidad esta ligada al ecosistema Blaize Picasso SDK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m-pose (familia Ultralytics YOLO, version 26, variante medium); red convolucional de deteccion de keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | INT8, BF16, AMP (mezcla INT8 + BF16); variantes publicadas en AMP |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (formato propietario Blaize); modelo original en PyTorch |

## Arquitectura y entrenamiento

El modelo es una red de deteccion de pose de la familia YOLO (version 26, tamano medium) orientada a la estimacion de keypoints humanos. La arquitectura concreta (backbone, neck y cabeza de keypoints) corresponde al diseno de Ultralytics YOLO26m-pose; no se detallan en la informacion disponible el numero de capas, el numero de parametros ni la composicion exacta del backbone.

El entrenamiento se realizo sobre COCO Keypoints 2017 (licencia CC-BY-4.0, atribucion al COCO Consortium). No se especifican en la informacion proporcionada el numero de tokens (no aplica), el numero de imagenes de entrenamiento, ni si hubo etapas de refinamiento posteriores. La innovacion tecnica destacable no esta en el modelo en si, sino en el proceso de optimizacion de Blaize: conversion y cuantizacion (INT8, BF16, AMP) para ejecucion sobre el Graph Streaming Processor (GSP) de Blaize, una arquitectura basada en grafos de datos orientada a eficiencia energetica y baja latencia en inferencia en el borde.

## Capacidades

- Deteccion de puntos clave (keypoints) del cuerpo humano sobre imagenes, segun el esquema de COCO Keypoints.
- Estimacion de pose multi-persona (capacidad heredada de la familia YOLO-pose; no se detalla el numero maximo de personas en la informacion disponible).
- Inferencia optimizada para hardware Blaize Xplorer (GSP) mediante Picasso SDK.
- Variantes de resolucion de entrada: 640x384 y 640x640.
- Variantes de precision: INT8 (mayor velocidad y menor tamano), BF16 (mayor precision) y AMP (equilibrio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Analisis deportivo y biomecanico: estimacion de la posicion de articulaciones en imagenes o video para calcular angulos y posturas, desplegando la variante AMP 640x640 sobre un acelerador Blaize Xplorer en el borde.
- Vigilancia y seguridad en el borde: deteccion de poses en camaras IP con inferencia local de baja latencia, evitando enviar video a la nube gracias al procesamiento sobre GSP.
- Interaccion persona-ordenador y realidad aumentada: seguimiento de keypoints para control gestual o avatares, usando la variante 640x384 para reducir coste computacional en dispositivos empotrados.
- Monitorizacion de ergonomia en entornos industriales: deteccion de posturas de riesgo en lineas de produccion con inferencia en el propio puesto de trabajo.
- Rehabilitacion y fisioterapia: seguimiento de ejercicios y correccion postural en tiempo real en dispositivos de borde con consumo energetico contenido.
- Robotica y automatizacion: percepcion de pose humana para robots colaborativos o sistemas de seguridad que deben reaccionar a la presencia y postura de operarios.
- Analitica de aforo y comportamiento en retail: estimacion de poses para analisis de interaccion en tienda, ejecutando el modelo en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: acelerador de IA Blaize Xplorer (Graph Streaming Processor, GSP). El modelo esta empaquetado en formato `.bm` y no esta pensado para ejecutarse en GPU convencional sin conversion previa.
- Software requerido: Blaize Picasso SDK instalado y configurado; utilidad `blaize-modeltool` para inspeccionar el modelo.
- VRAM estimada: no disponible (no aplica a GPU; el modelo se ejecuta sobre acelerador Blaize).
- GPU recomendadas: no disponible; el modelo no se distribuye en formatos para CUDA (safetensors, ONNX, GGUF).
- Compatibilidad con GPU de consumo: no disponible; el repositorio no incluye pesos ejecutables en RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: Blaize Picasso SDK sobre Blaize Xplorer. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOPOSE26m_COCOKeypoint (Blaize-AI) | YOLO26m-pose optimizado para GSP | no disponible | no aplica | AGPL-3.0 | Hugging Face, formato `.bm` |
| Ultralytics YOLO26m-pose (original) | YOLO26m-pose en PyTorch | no disponible | no aplica | AGPL-3.0-only OR Ultralytics Enterprise | Repositorio Ultralytics |
| Otros modelos de pose COCO (p. ej. variantes YOLO-pose de otros tamanos) | Deteccion de keypoints | no disponible | no aplica | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de vision especializado: no es un LLM y no puede usarse para generacion de texto, razonamiento, codigo ni tareas linguisticas.
- Dependencia de hardware: los pesos en formato `.bm` requieren un acelerador Blaize Xplorer y el Picasso SDK; no son directamente utilizables en GPU o CPU convencionales.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y distribucion; el modelo original de Ultralytics ofrece ademas una licencia enterprise alternativa, pero la version publicada aqui se distribuye bajo AGPL-3.0.
- El modelo original esta sujeto a la licencia de Ultralytics (AGPL-3.0-only OR LicenseRef-Ultralytics-Enterprise-License); el uso comercial puede requerir licencia enterprise del desarrollador original.
- Dataset COCO Keypoints 2017: sesgos inherentes al dataset (distribucion de personas, poses, condiciones de iluminacion y contextos limitados a las imagenes de COCO).
- Riesgo de fallo en poses atipicas, oclusiones severas, multitudes densas o resoluciones muy distintas a las de entrenamiento.
- No se documentan metricas de precision (AP, OKS) para estas variantes cuantizadas; la cuantizacion INT8/AMP puede degradar la precision respecto al modelo original en PyTorch.
- Blaize declara que no revisa ni respalda el modelo original y no ofrece garantias sobre el contenido de terceros.
- No se especifican idiomas ni capacidades multilingues (no aplica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blaize-AI/YOLOPOSE26m_COCOKeypoint
- Repositorio original Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints 2017: https://cocodataset.org
- Blaize: https://www.blaize.com
