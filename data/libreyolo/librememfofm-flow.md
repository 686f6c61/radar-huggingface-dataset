# LibreYOLO/LibreMEMFOFm-flow

## Resumen

LibreMEMFOFm-flow es un empaquetado del checkpoint MEMFOF-Tartan-T-TSKH para la librería LibreYOLO, orientado a la estimación de flujo óptico multi-fotograma. El modelo original, MEMFOF, fue desarrollado por el Graphics & Media Lab de la Universidad Estatal de Moscú (MSU) y presentado en ICCV 2025; su código deriva de la base de Princeton Vision & Learning Lab. Resuelve el problema de estimar el movimiento denso entre fotogramas consecutivos de vídeo, una tarea clásica de visión por computador con aplicaciones en interpolación, estabilización, seguimiento y compresión.

La particularidad de MEMFOF es su enfoque de entrenamiento a alta resolución con un diseño eficiente en memoria: procesa tres fotogramas (t-1, t, t+1) y predice el flujo backward y forward del fotograma central, lo que permite estimar movimiento en ambos sentidos temporales con una sola pasada. El checkpoint empaquetado aquí es el recomendado por los autores para vídeo del mundo real y constituye el peso MEMFOF por defecto de LibreYOLO.

Este repositorio no modifica los tensores originales: solo envuelve los pesos en un checkpoint LibreYOLO v1.0 con `task: flow`, `model_family: memfof`, `size: m` y `variant: tskh`. La inferencia replica los valores por defecto del upstream (fp32, 8 iteraciones de refinamiento, resolución nativa con padding replicado a múltiplo de 16). Es relevante para desarrolladores que ya usan LibreYOLO y quieren incorporar flujo óptico sin salir del ecosistema, o para quienes buscan un checkpoint listo para producción con licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MEMFOF (estimador de flujo óptico multi-fotograma, refinamiento iterativo); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 3 fotogramas) |
| Tipos de cuantizacion | no disponible; inferencia por defecto en fp32 |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`); los tensores originales son `model.safetensors` |

## Arquitectura y entrenamiento

MEMFOF es un estimador de flujo óptico denso que toma tres fotogramas consecutivos (t-1, t, t+1) y predice el flujo backward y forward del fotograma central t. La innovación principal, según el título del paper, es una estrategia de entrenamiento a alta resolución diseñada para ser eficiente en memoria, lo que permite entrenar y ejecutar el modelo a resoluciones nativas elevadas sin el coste de memoria habitual en estimadores de flujo multi-fotograma. La inferencia utiliza 8 iteraciones de refinamiento y padding replicado a múltiplo de 16.

El checkpoint empaquetado corresponde a la variante Tartan-T-TSKH, que los autores recomiendan para vídeo del mundo real. No se dispone en la información proporcionada del número de parámetros, la composición exacta del dataset de entrenamiento (aunque el nombre "Tartan" sugiere uso del dataset TartanAir), el número de tokens o iteraciones de entrenamiento, ni si se emplearon técnicas de RLHF/DPO (no aplicables en un modelo de visión de este tipo). El código fuente está en el repositorio msu-video-group/memfof, en el commit `a51de9fc59c6fe20ba08e079372c7b583d58a712`.

## Capacidades

- Estimación de flujo óptico denso entre fotogramas de vídeo, con salida de campo (H, W, 2) en píxeles (dx, dy) sobre el lienzo de la imagen original.
- Predicción bidireccional: flujo backward (t a t-1) y forward (t a t+1) del fotograma central en una sola pasada.
- Entrada de tres fotogramas, salida de dos resultados (flujo para los pares t-1/t y t/t+1).
- Visualización del flujo mediante rueda de color Middlebury (`Results.flow.to_rgb()`).
- Procesamiento a resolución nativa con padding replicado a múltiplo de 16.
- Integración nativa con la API de LibreYOLO (`LibreYOLO("LibreMEMFOFm-flow.pt")`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de image-to-image.

## Casos de uso

- Interpolación de fotogramas en postproducción de vídeo: el flujo forward y backward del fotograma central permite sintetizar fotogramas intermedios con movimiento coherente, útil para conversión de tasa de refresco (por ejemplo, de 24 a 60 fps) en pipelines de edición.
- Estabilización de vídeo: el campo de flujo denso entre fotogramas consecutivos permite estimar el movimiento global y local de la cámara para compensar vibraciones en grabaciones handheld o de dron.
- Seguimiento de objetos y segmentación asistida por movimiento: el flujo (H, W, 2) sirve como señal auxiliar para propagar máscaras o puntos de interés entre fotogramas en herramientas de anotación y en pipelines de vídeo.
- Compresión de vídeo y análisis de movimiento: el flujo denso puede alimentar estimadores de movimiento o métricas de calidad perceptual en codificadores y evaluadores de vídeo.
- Detección de movimiento anómalo en videovigilancia: comparar la magnitud del flujo entre fotogramas permite identificar eventos (intrusiones, caídas, objetos abandonados) en flujos de cámara con resolución nativa.
- Investigación en visión por computador: como checkpoint de referencia para benchmarking de flujo óptico en datasets reales, con la ventaja de estar integrado en LibreYOLO y disponible con licencia BSD-3-Clause para experimentación y reproducción.
- Preprocesamiento para modelos de vídeo de mayor nivel: el flujo puede usarse como entrada auxiliar en tareas de predicción de trayectorias, reidentificación o análisis de escenas dinámicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas (EPE, Fl-all, etc.) ni comparaciones numéricas con otros estimadores; el paper arXiv:2506.23151 podría contenerlas, pero no se han proporcionado en la información de partida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,3 GB, lo que sugiere un modelo de tamaño moderado que probablemente quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; al ejecutarse en fp32 y a resolución nativa, se recomienda una GPU con al menos 8-12 GB de VRAM para vídeo 1080p, aunque esta cifra es una estimación y no un dato del autor.
- Cabe en GPU de consumo: probablemente sí (el tamaño del repo es de 0,3 GB), pero no confirmado.
- Opciones de despliegue: librería LibreYOLO (API Python); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles. La inferencia usa fp32, 8 iteraciones de refinamiento y resolución nativa, factores que condicionan el coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMEMFOFm-flow | no disponible | 3 fotogramas | Flujo óptico multi-fotograma, alta resolución | BSD-3-Clause | HuggingFace (LibreYOLO) |
| MEMFOF-Tartan-T-TSKH (upstream) | no disponible | 3 fotogramas | Igual (checkpoint original) | BSD-3-Clause (heredada) | HuggingFace (egorchistov) |
| Otros estimadores de flujo (RAFT, FlowFormer, etc.) | no disponible en la información | 2 fotogramas habitualmente | Flujo óptico de dos fotogramas | varía | varía |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con RAFT, FlowFormer u otros estimadores. La comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa lenguaje, no soporta tool calling ni agentes; no debe evaluarse con métricas de LLM.
- Requiere tres fotogramas consecutivos como entrada; no funciona con un único fotograma ni con secuencias no contiguas.
- La licencia de los pesos no está declarada de forma explícita upstream: el repositorio original etiqueta el checkpoint como BSD-3-Clause en los metadatos, pero no incluye fichero de licencia ni texto específico para los pesos, por lo que se asume heredada del repositorio de código. Verificar antes de uso comercial en entornos con requisitos legales estrictos.
- Riesgo de artefactos en oclusiones, movimientos rápidos o superficies sin textura, habitual en estimadores de flujo denso; no se han publicado métricas de error en la información disponible.
- El padding replicado a múltiplo de 16 puede introducir artefactos en los bordes de imágenes de resolución arbitraria.
- No hay información sobre sesgos del dataset de entrenamiento (posible sesgo hacia escenas del dataset TartanAir u otros usados por los autores).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- Este empaquetado solo envuelve metadatos; cualquier corrección o mejora debe provenir del upstream (msu-video-group/memfof).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/LibreYOLO/LibreMEMFOFm-flow
- Checkpoint upstream: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH
- Repositorio de código upstream: https://github.com/msu-video-group/memfof
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper (arXiv): https://arxiv.org/abs/2506.23151
