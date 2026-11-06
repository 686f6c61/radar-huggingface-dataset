# LibreYOLO/LibreNeuFlowv2s-flow-things

## Resumen

LibreNeuFlowv2s-flow-things es un checkpoint de pesos de flujo optico (optical flow) basado en NeuFlow v2, una red neuronal de 9 millones de parametros disenada especificamente para estimacion de flujo optico en dispositivos de borde. El modelo original fue desarrollado por Zhiyong Zhang, Aniket Gupta, Huaizu Jiang y Hanumant Singh (NeuField Robotics) y publicado en el paper "NeuFlow v2: Push High-Efficiency Optical Flow To the Limit" (arXiv:2408.10161). LibreYOLO lo redistribuye empaquetado para su propia libreria, con el esquema de metadatos de LibreYOLO v1.0 y la tarea `flow`.

La variante `things` corresponde a la etapa de entrenamiento sobre el dataset FlyingThings3D, antes del ajuste fino sobre Sintel y KITTI. Segun la model card, el checkpoint canonico del proyecto es `LibreNeuFlowv2s-flow`; esta version concreta preserva los pesos de esa etapa intermedia de entrenamiento. El modelo no es un LLM ni un modelo generativo de texto: es un modelo image-to-image que, dada una secuencia de N fotogramas, devuelve N-1 campos de flujo optico denso con componentes (dx, dy) en pixeles.

Su relevancia radica en la eficiencia: 9M de parametros y un objetivo declarado de maxima eficiencia computacional para inferencia en edge. La unica modificacion respecto al checkpoint original es el envoltorio de metadatos del state-dict; las claves y los parametros aprendidos son identicos, y la model card reporta paridad bit a bit con el modulo `NeuFlow` upstream en fp32 sobre una RTX 3090 (diferencia absoluta maxima de 0.0 px).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeuFlow v2 (red de flujo optico denso; detalles internos de capas no disponibles en la informacion proporcionada) |
| Parametros totales | 9M (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-image; procesa N fotogramas y devuelve N-1 flujos) |
| Tipos de cuantizacion | no disponible (la model card solo menciona inferencia en fp32 para la prueba de paridad) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch empaquetado en el esquema LibreYOLO v1.0) |

## Arquitectura y entrenamiento

NeuFlow v2 es una red de estimacion de flujo optico denso orientada a eficiencia en dispositivos de borde, con 9M de parametros. La informacion proporcionada no detalla la composicion interna de capas (tipo de bloques, mecanismos de correlacion o refinamiento), por lo que ese nivel de detalle debe consultarse en el paper arXiv:2408.10161. El checkpoint aqui descrito corresponde a la etapa de entrenamiento sobre FlyingThings3D (variante `things`), previa al ajuste fino sobre Sintel y KITTI.

Los pesos derivan de `neuflow_things.pth` del repositorio `neufieldrobotics/NeuFlow_v2` en el commit `204b5e3744461d90303b9ff82caa7a1bb56a2ca2`. La unica modificacion introducida por LibreYOLO es el envoltorio de metadatos del state-dict: `task=flow`, `nc=1`, `names={0: "flow"}`, `variant=things` y un canvas de 432x768. Las claves y los parametros aprendidos no cambian. La model card documenta paridad bit a bit con el modulo upstream en fp32 sobre RTX 3090 (max absolute difference 0.0 px), verificada mediante los scripts `weights/convert_neuflowv2_weights.py` y `weights/parity_neuflowv2.py` del repositorio LibreYOLO. No se proporcionan datos sobre numero de tokens, composicion del dataset ni uso de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Estimacion de flujo optico denso entre pares o secuencias de fotogramas: recibe N imagenes y devuelve N-1 campos de flujo.
- Salida de flujo como tensor `(H, W, 2)` en float32 con componentes (dx, dy) en pixeles sobre el canvas original.
- Conversion del flujo a representacion visual RGB mediante la rueda de color Middlebury (`to_rgb()`).
- Procesamiento por lotes de secuencias de fotogramas a traves de la API `model([...])` de LibreYOLO.
- Inferencia orientada a dispositivos de borde por su bajo numero de parametros (9M).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: es un modelo puramente visual de flujo optico.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Estimacion de movimiento en robotica de bajo consumo: el modelo puede calcular flujo optico denso entre fotogramas consecutivos de una camara a bordo en plataformas embebidas, gracias a sus 9M de parametros y a su orientacion a edge.
- Estabilizacion de video y postproceso: integrado en un pipeline que procesa secuencias de fotogramas y usa los campos (dx, dy) para compensar movimiento de camara o generar mascaras de movimiento.
- Analisis de trafico y videovigilancia: estimacion de flujo entre fotogramas para detectar direccion y magnitud del movimiento de vehiculos o peatones en tiempo real sobre hardware modesto.
- Navegacion de drones y vehiculos autonomos: calculo de flujo optico como senal auxiliar de odometria visual, aprovechando la paridad bit a bit con el modelo upstream para validar resultados frente a la implementacion de referencia.
- Investigacion en vision por computador: uso del checkpoint de la etapa `things` como punto de partida o referencia para experimentos de ajuste fino sobre Sintel o KITTI, o para reproducir resultados del paper arXiv:2408.10161.
- Prototipado rapido con LibreYOLO: al estar empaquetado en el esquema LibreYOLO v1.0 con la tarea `flow`, se puede cargar con `LibreYOLO("LibreNeuFlowv2s-flow-things.pt")` y encadenar con otras tareas del mismo framework sin conversiones adicionales.
- Generacion de ground truth visual: conversion del flujo a RGB con la rueda Middlebury para inspeccion cualitativa, depuracion y documentacion de pipelines de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la prueba de paridad con el modulo upstream: en una RTX 3090 en fp32, la diferencia absoluta maxima es de 0.0 px respecto a `NeuFlow`, es decir, replicacion bit a bit. No se aportan cifras de EPE (end-point error) sobre FlyingThings3D, Sintel o KITTI, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9M de parametros en fp32 el peso de los pesos es de aproximadamente 36 MB, por lo que la VRAM necesaria es muy reducida y dominada por las activaciones y el tamano de las imagenes de entrada (canvas de referencia 432x768).
- GPU recomendadas: cualquier GPU moderna es suficiente; la model card verifica funcionamiento en RTX 3090. Por el tamano del modelo, tambien es viable en GPUs de gama media y en hardware integrado.
- Cabe en GPU de consumo: si, con margen amplio, dado el reducido numero de parametros.
- Opciones de despliegue: la via documentada es la libreria `libreyolo` (carga del checkpoint `.pt` con `LibreYOLO(...)`). No se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de vision, los runners de LLM no aplican.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de flujo optico (por ejemplo, RAFT, FlowFormer o variantes de NeuFlow) que permitan una comparacion cuantitativa rigurosa. La unica referencia directa es el propio modulo `NeuFlow` upstream, con el que este checkpoint presenta paridad bit a bit en fp32 segun la model card.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreNeuFlowv2s-flow-things | 9M (aprox.) | no aplica | paridad bit a bit con NeuFlow upstream en fp32 (RTX 3090) | Apache 2.0 | Hugging Face (LibreYOLO) |
| NeuFlow v2 upstream (`neuflow_things.pth`) | 9M (aprox.) | no aplica | referencia de paridad | Apache 2.0 (repo upstream) | GitHub (neufieldrobotics/NeuFlow_v2) |
| Otros modelos de flujo optico | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint corresponde a la etapa de entrenamiento sobre FlyingThings3D (`things`), antes del ajuste fino sobre Sintel y KITTI; su rendimiento en dominios reales puede ser inferior al del checkpoint canonico `LibreNeuFlowv2s-flow`.
- La licencia de los pesos se redistribuye como Apache 2.0, pero la model card advierte explicitamente que el proyecto upstream no incluye una licencia de pesos separada: se trata de una interpretacion divulgada por LibreYOLO (cesion implicita del proyecto publicador), no confirmada por los autores originales. Conviene revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- No hay informacion sobre sesgos, ya que el modelo no procesa lenguaje ni datos personales de forma directa; sin embargo, el flujo optico puede fallar en regiones oclusivas, texturas repetitivas, cambios de iluminacion bruscos y movimientos grandes entre fotogramas, limitaciones propias de la tarea.
- El canvas de referencia es 432x768; no se documenta el comportamiento con otras resoluciones ni el reescalado interno.
- No se dispone de datos de cuantizacion, latencia ni throughput, por lo que las estimaciones de despliegue en produccion deben medirse empiricamente.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB; se trata de una publicacion reciente sin validacion comunitaria amplia.
- No soporta texto, tool calling ni agentes; no debe emplearse fuera de tareas de vision y flujo optico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow-things
- Checkpoint canonico: https://huggingface.co/LibreYOLO/LibreNeuFlowv2s-flow
- Repositorio upstream NeuFlow_v2: https://github.com/neufieldrobotics/NeuFlow_v2
- Repositorio fuente LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper NeuFlow v2: https://arxiv.org/abs/2408.10161
