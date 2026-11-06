# LibreYOLO/LibreMEMFOFm-flow-sintel

## Resumen

LibreMEMFOFm-flow-sintel es un modelo de estimación de flujo óptico (optical flow) empaquetado para la librería LibreYOLO. Se trata del checkpoint `MEMFOF-Tartan-T-TSKH-sintel` del proyecto MEMFOF, desarrollado por el Graphics & Media Lab de la Universidad Estatal de Moscú (MSU) y presentado en ICCV 2025, reempaquetado por el equipo de LibreYOLO sin modificar los tensores originales. El modelo resuelve la tarea de estimar el movimiento denso entre fotogramas consecutivos, una pieza fundamental en vídeo, robótica, estabilización, interpolación de frames y análisis de movimiento.

La arquitectura MEMFOF (Memory-Efficient Multi-Frame Optical Flow) es una red de estimación de flujo multi-fotograma que, en esta variante, consume tres frames (t-1, t y t+1) y produce el flujo backward y forward del frame central. La innovación principal del trabajo es el entrenamiento a alta resolución con un coste de memoria reducido, lo que permite estimar flujo denso en resoluciones nativas sin el consumo de VRAM habitual en arquitecturas de flujo de referencia.

Este repositorio es relevante porque integra un modelo de investigación en un pipeline de inferencia práctico: la tarea `flow` de LibreYOLO, con resultados tipados (`Results.flow` como campo (H, W, 2) en píxeles) y utilidades como `to_rgb()` para visualización con la rueda de color de Middlebury. La licencia BSD 3-Clause permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MEMFOF (red neuronal para estimación de flujo óptico multi-fotograma, 3 frames) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); resolución nativa con padding replicado a múltiplo de 16 |
| Tipos de cuantizacion | no disponible; inferencia por defecto en fp32 |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`) con tensores safetensors reempaquetados |
| Tarea | `flow` (image-to-image) |
| Iteraciones de refinamiento | 8 (por defecto, igual que upstream) |
| Tamaño del repositorio | 0,3 GB |
| Variante | `m` (size), `sintel` (variant) |

## Arquitectura y entrenamiento

MEMFOF es una red de estimación de flujo óptico diseñada para procesar múltiples fotogramas y explotar la información temporal. En esta variante concreta, la entrada son tres frames (t-1, t, t+1) y la salida es el flujo backward y forward correspondiente al frame central t. El modelo se apoya en un esquema de refinamiento iterativo (8 iteraciones por defecto) sobre una estimación inicial de flujo, un patrón habitual en las arquitecturas modernas de flujo denso tipo RAFT y sus descendientes.

El entrenamiento parte del checkpoint `MEMFOF-Tartan-T-TSKH`, que corresponde a un preentrenamiento sobre el dataset sintético Tartan (T-TSKH), y posteriormente se afina sobre el benchmark MPI-Sintel, de ahí el sufijo `sintel`. La contribución técnica del paper es el entrenamiento a alta resolución con memoria eficiente, lo que permite manejar resoluciones nativas sin el coste cuadrático en memoria típico de las correlaciones volumétricas. No se dispone en la información proporcionada del número de tokens, composición exacta del dataset ni detalles sobre RLHF/DPO (no aplicables a un modelo de visión).

En LibreYOLO, el modelo se expone como la familia de tarea `flow` bajo el nombre `LibreMEMFOF`. El reempaquetado es únicamente de metadatos: los tensores de `model.safetensors` conservan las mismas claves y valores que el checkpoint original, y se almacenan en un checkpoint LibreYOLO v1.0 con `task: flow`, `nc: 1`, `names: {0: flow}`, `model_family: memfof`, `size: m` y `variant: sintel`.

## Capacidades

- Estimación de flujo óptico denso entre fotogramas consecutivos (forward y backward).
- Procesamiento de tres frames de entrada para producir dos resultados de flujo (uno por par de frames adyacentes).
- Salida de flujo como campo (H, W, 2) en píxeles sobre el lienzo de la imagen original.
- Visualización del flujo mediante `to_rgb()` con la rueda de color de Middlebury.
- Inferencia a resolución nativa con padding replicado a múltiplo de 16.
- Refinamiento iterativo configurable (8 iteraciones por defecto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Interpolación de frames en postproducción de vídeo: el modelo proporciona el flujo forward y backward entre frames adyacentes, lo que permite sintetizar frames intermedios con warping bidireccional y oclusión estimada, útil para conversión a 60/120 fps.
- Estabilización de vídeo: el flujo denso entre frames consecutivos permite estimar el movimiento global de cámara y el movimiento local de objetos, base para algoritmos de estabilización con compensación de paralaje.
- Análisis de movimiento en vídeo de vigilancia: el flujo permite detectar objetos en movimiento, estimar velocidad y dirección, y alimentar pipelines de tracking multi-objeto.
- Robótica y navegación visual: el flujo óptico denso es una señal directa para odometría visual, evitación de obstáculos y estimación de ego-movimiento en drones y robots móviles.
- Compresión de vídeo: el flujo estimado puede usarse como predictor de movimiento en codificadores, o para evaluación de calidad de movimiento en pipelines de análisis.
- Restauración y superresolución de vídeo: el flujo entre frames permite alinear parches temporales para agregar información en tareas de denoising y superresolución multi-frame.
- Análisis de escenas deportivas: estimación de trayectorias de jugadores y balón mediante flujo denso sobre secuencias de alta resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de referencia (arXiv:2506.23151) reporta métricas sobre MPI-Sintel y KITTI, pero no se incluyen en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 0,3 GB, lo que sugiere un modelo de tamaño moderado, pero no se especifica el número de parámetros ni la VRAM necesaria.
- GPU recomendadas: no disponible. La inferencia por defecto es en fp32, lo que implica mayor consumo de memoria que fp16/bf16.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; dado el tamaño del repositorio (0,3 GB), es plausible que quepa en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: librería LibreYOLO (Python), con checkpoint `.pt`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de flujo óptico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Frames de entrada | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMEMFOFm-flow-sintel | MEMFOF | 3 (t-1, t, t+1) | Nativa con padding a múltiplo de 16 | BSD 3-Clause | Hugging Face (LibreYOLO) |
| MEMFOF-Tartan-T-TSKH-sintel (upstream) | MEMFOF | 3 | Nativa | BSD 3-Clause (heredada) | Hugging Face (egorchistov) |
| RAFT | Red recurrente con correlaciones | 2 | 368x768 típico (entrenamiento) | BSD 3-Clause | GitHub (princeton-vl) |
| FlowFormer | Transformer con coste volumétrico | 2 | 368x768 típico | no disponible en la información | GitHub |

No se dispone de datos de rendimiento comparativo (EPE, Fl-all) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo solo estima flujo entre frames adyacentes; no realiza razonamiento semántico ni detección de objetos.
- Requiere tres frames de entrada alineados temporalmente; no funciona con un único frame.
- La resolución de entrada debe ajustarse con padding replicado a múltiplo de 16, lo que puede introducir artefactos en los bordes.
- La inferencia por defecto es en fp32; no se documentan cuantizaciones alternativas, lo que limita el despliegue en hardware con poca memoria.
- La licencia BSD 3-Clause permite uso comercial con atribución, pero el autor del reempaquetado advierte que la licencia de los pesos no está declarada explícitamente upstream: se hereda del repositorio de código (BSD-3-Clause) y se reproduce en `LICENSE` y `NOTICE`.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir flujo incorrecto en regiones ocluidas, texturas repetitivas, movimiento muy rápido o cambios de iluminación bruscos.
- No hay información sobre sesgos del dataset de entrenamiento (Tartan + Sintel son sintéticos/benchmark), lo que puede limitar la generalización a dominios reales no representados.
- No se dispone de datos sobre latencia, throughput ni VRAM, lo que dificulta la planificación de despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreMEMFOFm-flow-sintel
- Checkpoint base: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH-sintel
- Repositorio de código MEMFOF: https://github.com/msu-video-group/memfof
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper (arXiv): https://arxiv.org/abs/2506.23151
