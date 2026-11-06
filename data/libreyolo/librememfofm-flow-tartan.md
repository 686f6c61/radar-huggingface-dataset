# LibreYOLO/LibreMEMFOFm-flow-tartan

## Resumen

LibreMEMFOFm-flow-tartan es un modelo de estimación de flujo óptico (optical flow) empaquetado para la librería LibreYOLO. Se trata de una redistribución del checkpoint `MEMFOF-Tartan` desarrollado por el grupo MSU Graphics & Media Lab y publicado originalmente en el repositorio `egorchistov/optical-flow-MEMFOF-Tartan`. El modelo implementa MEMFOF (Memory-Efficient Multi-Frame Optical Flow), una arquitectura presentada en el paper "MEMFOF: High-Resolution Training for Memory-Efficient Multi-Frame Optical Flow Estimation" aceptado en ICCV 2025.

El modelo resuelve la estimación de flujo óptico a partir de tres fotogramas consecutivos (t-1, t, t+1), prediciendo tanto el flujo hacia delante como hacia atrás del fotograma central. En LibreYOLO se integra como la familia de tareas `flow` bajo el identificador `LibreMEMFOF`, y cada resultado expone el flujo directo del fotograma t al t+1 como un campo de forma (H, W, 2) expresado en píxeles sobre el lienzo de la imagen original.

La relevancia de este empaquetado radica en que facilita el uso del modelo dentro del ecosistema LibreYOLO con una interfaz homogénea (carga mediante `LibreYOLO`, inferencia por lotes de fotogramas y acceso tipado a los resultados), sin modificar los tensores originales del checkpoint. El tamaño del repositorio es de 0,3 GB y la licencia es BSD 3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MEMFOF (estimación de flujo óptico multi-fotograma, memory-efficient) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 3 fotogramas consecutivos) |
| Tipos de cuantizacion | no disponible; inferencia por defecto en fp32 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`) a partir de `model.safetensors` originales sin modificar |

## Arquitectura y entrenamiento

MEMFOF es un estimador de flujo óptico diseñado para entrenamiento a alta resolución con bajo consumo de memoria. El modelo toma tres fotogramas consecutivos (t-1, t, t+1) y predice el flujo backward y forward del fotograma central t. La variante empaquetada corresponde al checkpoint `MEMFOF-Tartan`, identificado en la model card como la primera etapa de entrenamiento publicada por el autor original. La arquitectura concreta (tipo de red, bloques de correlación, mecanismo de refinamiento iterativo) no se detalla en la información proporcionada más allá de que aplica 8 iteraciones de refinamiento en inferencia.

El empaquetado realizado por LibreYOLO es únicamente una envoltura de metadatos: los tensores del `model.safetensors` original se conservan con las mismas claves y valores, almacenados en un checkpoint LibreYOLO v1.0 con `task: flow`, `nc: 1`, `names: {0: flow}`, `model_family: memfof`, `size: m` y `variant: tartan`. Los valores por defecto de inferencia coinciden con los del modelo original: precisión fp32, 8 iteraciones de refinamiento y resolución nativa con padding replicado a múltiplos de 16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que se trata de un modelo de visión y esos datos no se detallan en la información disponible.

## Capacidades

- Estimación de flujo óptico denso a partir de tres fotogramas consecutivos, con predicción simultánea de flujo forward y backward del fotograma central.
- Salida de flujo como campo (H, W, 2) en píxeles sobre el lienzo de la imagen original, accesible mediante `Results.flow.data`.
- Conversión del flujo a representación visual RGB mediante la rueda de color Middlebury (`Results.flow.to_rgb()`).
- Procesamiento por lotes de secuencias de fotogramas a través de la interfaz `LibreYOLO`.
- Manejo de resoluciones nativas con padding replicado a múltiplos de 16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de estimación de movimiento.

## Casos de uso

- Estabilización de vídeo: el flujo forward y backward entre fotogramas consecutivos permite estimar el movimiento global y local para compensar vibraciones de cámara en postproducción o en capturas móviles.
- Interpolación de fotogramas: el campo de flujo (H, W, 2) en píxeles proporciona la correspondencia densa necesaria para generar fotogramas intermedios en pipelines de aumento de tasa de refresco.
- Seguimiento de objetos y análisis de movimiento: el flujo denso sirve como señal de entrada para algoritmos de tracking o para segmentar regiones en movimiento en secuencias de vigilancia.
- Visión por computador en robótica: la estimación de movimiento entre fotogramas consecutivos alimenta módulos de odometría visual o de evitación de obstáculos en tiempo real.
- Restauración y reducción de ruido de vídeo: el flujo entre fotogramas permite alinear temporalmente parches y promediar información entre cuadros para atenuar ruido.
- Análisis deportivo y biomecánico: la extracción de campos de movimiento densos permite cuantificar trayectorias y velocidades de sujetos en secuencias de alta resolución.
- Preprocesamiento para modelos de vídeo: el flujo óptico generado puede emplearse como característica auxiliar en arquitecturas de generación o descripción de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB y la inferencia por defecto se ejecuta en fp32, por lo que el consumo será superior al tamaño del checkpoint y dependerá de la resolución de los fotogramas de entrada.
- GPU recomendadas: no disponibles en la información proporcionada; al ser un modelo de visión para alta resolución, se recomienda una GPU con memoria suficiente para procesar los fotogramas a resolución nativa.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño reducido del checkpoint (0,3 GB) sugiere que podría caber en GPUs de consumo, pero no se aportan datos de VRAM reales.
- Opciones de despliegue: la vía documentada es la librería LibreYOLO (`LibreYOLO("LibreMEMFOFm-flow-tartan.pt")`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMEMFOFm-flow-tartan | MEMFOF (multi-fotograma) | 3 fotogramas | Flujo forward y backward del fotograma central | BSD 3-Clause | Hugging Face (LibreYOLO) |
| egorchistov/optical-flow-MEMFOF-Tartan | MEMFOF (multi-fotograma) | 3 fotogramas | Flujo forward y backward del fotograma central | BSD 3-Clause (heredada) | Hugging Face |
| Otros estimadores de flujo óptico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros estimadores de flujo óptico en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en estimación de flujo óptico; no genera texto, código ni realiza razonamiento.
- Requiere secuencias de exactamente tres fotogramas consecutivos como entrada; no está pensado para fotogramas aislados.
- La resolución de entrada debe ajustarse con padding replicado a múltiplos de 16; resoluciones no múltiplas pueden introducir artefactos en los bordes.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en dominios distintos al de entrenamiento (Tartan).
- Riesgo de alucinación en el sentido de flujo incorrecto en regiones ocluidas, de baja textura o con movimientos muy grandes; no se documentan métricas de error en la información disponible.
- La licencia BSD 3-Clause permite uso comercial, pero la model card advierte de que la licencia de los pesos no está declarada de forma separada en el repositorio original y se hereda del repositorio de código.
- El modelo se distribuye como checkpoint `.pt` de LibreYOLO; no se ofrecen formatos GGUF, ONNX u otros en la información disponible.
- Al ser un empaquetado de metadatos, cualquier limitación del checkpoint original `MEMFOF-Tartan` se mantiene intacta.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/LibreYOLO/LibreMEMFOFm-flow-tartan
- Modelo base original: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan
- Repositorio de código original: https://github.com/msu-video-group/memfof
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper (arXiv): https://arxiv.org/abs/2506.23151
