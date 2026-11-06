# LibreYOLO/LibreMEMFOFm-flow-kitti

## Resumen

LibreMEMFOFm-flow-kitti es un modelo de estimación de flujo óptico (optical flow) empaquetado para la librería LibreYOLO. Se trata de una adaptación del checkpoint MEMFOF-Tartan-T-TSKH-kitti, el ajuste fino sobre el benchmark KITTI del modelo MEMFOF (Memory-Efficient Multi-Frame Optical Flow), desarrollado por el grupo de investigación MSU Graphics & Media Lab y presentado en ICCV 2025. El modelo resuelve la tarea de estimar el movimiento denso entre fotogramas consecutivos de vídeo, una pieza fundamental en pipelines de seguimiento, estabilización, interpolación de vídeo y percepción autónoma.

Técnicamente, MEMFOF es un estimador de flujo óptico multi-fotograma que consume tres imágenes (t-1, t y t+1) y predice el flujo hacia atrás y hacia delante del fotograma central. La variante empaquetada aquí corresponde al tamaño "m" (medium) y al dominio KITTI, orientado a escenas de conducción urbana y carretera. La innovación principal del trabajo original es el entrenamiento a alta resolución con un diseño de memoria eficiente, lo que permite operar a resoluciones nativas sin el coste de memoria típico de los estimadores de flujo densos.

La relevancia de esta ficha radica en que el repositorio de LibreYOLO no modifica los tensores del modelo original: solo reenvuelve los pesos en un checkpoint con `task: flow` para integrarlos en el ecosistema LibreYOLO, de modo que la salida se expone como un campo `(H, W, 2)` en píxeles sobre el lienzo de la imagen original. Es, por tanto, una vía de acceso práctica a MEMFOF desde Python sin necesidad de gestionar el código de inferencia del repositorio original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MEMFOF (estimador de flujo óptico multi-fotograma, tres frames de entrada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 3 fotogramas) |
| Tipos de cuantización | no disponible (inferencia por defecto en fp32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`); los tensores originales provienen de `model.safetensors` |

## Arquitectura y entrenamiento

MEMFOF es un estimador de flujo óptico denso que opera sobre una ventana de tres fotogramas: recibe las imágenes t-1, t y t+1 y produce el flujo backward y forward del fotograma central t. El empaquetado en LibreYOLO expone únicamente el flujo forward (de t a t+1) como `Results.flow`, con forma `(H, W, 2)` y valores en píxeles sobre la imagen original. La inferencia replica los valores por defecto del modelo original: precisión fp32, 8 iteraciones de refinamiento y resolución nativa con padding replicado hasta un múltiplo de 16.

El trabajo original (Bargatin, Chistov, Yakovenko y Vatolin, ICCV 2025) se centra en el entrenamiento a alta resolución con un diseño de memoria eficiente, que es precisamente lo que da nombre al modelo. El checkpoint empaquetado aquí es el ajuste fino sobre KITTI de la variante MEMFOF-Tartan-T-TSKH, un modelo preentrenado en el dataset sintético Tartan y afinado posteriormente en KITTI. No se dispone en la información proporcionada de detalles sobre el número de tokens, la composición exacta del dataset ni sobre si se emplearon técnicas de RLHF o DPO (no aplicables, en cualquier caso, a un modelo de regresión densa de flujo).

La modificación respecto al modelo original es puramente de metadatos: los tensores de `model.safetensors` se conservan sin cambios (mismas claves y mismos valores) y se almacenan en un checkpoint LibreYOLO v1.0 con `task: flow`, `nc: 1`, `names: {0: flow}`, `model_family: memfof`, `size: m` y `variant: kitti`.

## Capacidades

- Estimación de flujo óptico denso entre fotogramas consecutivos de vídeo.
- Entrada de tres fotogramas (t-1, t, t+1) y salida del flujo backward y forward del fotograma central.
- Exposición del flujo forward como campo `(H, W, 2)` en píxeles sobre el lienzo de la imagen original.
- Conversión del campo de flujo a representación RGB mediante la rueda de color de Middlebury (`Results.flow.to_rgb()`).
- Procesamiento por lotes de secuencias de tres imágenes (`model([...])` devuelve dos resultados por cada terna).
- Inferencia a resolución nativa con padding replicado a múltiplo de 16.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni soporte multilingüe: es un modelo puramente visual de regresión densa.

## Casos de uso

- Seguimiento de objetos en vídeo: el flujo denso entre fotogramas permite propagar puntos de interés o cajas de seguimiento a lo largo de una secuencia, usando el campo `(H, W, 2)` para desplazar las coordenadas de cada píxel entre t y t+1.
- Estabilización de vídeo: estimar el movimiento global de la cámara a partir del flujo denso y compensarlo en postproducción, aprovechando que el modelo está afinado en KITTI, con movimiento de cámara típico de escenas de conducción.
- Interpolación de fotogramas (frame interpolation): el flujo forward y backward del fotograma central proporciona la base para sintetizar fotogramas intermedios en pipelines de aumento de tasa de refresco.
- Percepción para conducción autónoma: al estar afinado sobre KITTI, el modelo es adecuado para estimar movimiento en escenas urbanas y de carretera, alimentando módulos de odometría visual o detección de obstáculos en movimiento.
- Análisis de movimiento en vídeo de vigilancia: detectar y cuantificar desplazamientos de personas y vehículos mediante el campo de flujo, integrable en pipelines de LibreYOLO junto con tareas de detección.
- Extracción de características de movimiento para modelos downstream: usar el flujo como entrada adicional a clasificadores de acción o segmentadores temporales que se beneficien de información explícita de movimiento.
- Prototipado rápido en Python: al estar empaquetado en LibreYOLO, permite invocar el modelo con tres rutas de imagen y obtener el flujo en pocas líneas, sin gestionar el código de inferencia del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,3 GB, lo que da una idea del orden de magnitud de los pesos en fp32.
- GPU recomendadas: no disponible. El modelo se ejecuta por defecto en fp32, por lo que se recomienda una GPU con soporte CUDA y memoria suficiente para la resolución nativa de las imágenes de entrada.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño del checkpoint (0,3 GB) y la inferencia en fp32, es plausible que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: librería LibreYOLO (`from libreyolo import LibreYOLO`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de estimación de flujo óptico (por ejemplo, RAFT, FlowFormer o SEA-RAFT) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está especializado en estimación de flujo óptico; no genera texto, no razona y no soporta tool calling ni agentes.
- El ajuste fino sobre KITTI puede introducir sesgo de dominio: el rendimiento podría degradarse en escenas muy distintas (interiores, vídeo submarino, animación) respecto al dominio de conducción.
- Riesgo de error en regiones ocluidas, texturas repetitivas, superficies sin textura y movimientos muy grandes entre fotogramas, propios de los estimadores de flujo denso.
- La licencia es BSD 3-Clause, que permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad. La licencia de los pesos no está declarada por separado en el repositorio original: se hereda de la del repositorio de código, según indica la model card.
- El modelo original conserva los derechos de Princeton Vision & Learning Lab (2024) y MSU Graphics & Media Lab (2025); es necesario reproducir los avisos correspondientes en redistribuciones.
- La inferencia por defecto es en fp32 con 8 iteraciones de refinamiento; reducir iteraciones o precisión puede alterar la calidad del flujo, y no se documentan configuraciones alternativas validadas.
- No se dispone de información sobre cuantizaciones soportadas ni sobre latencia en producción, lo que limita la planificación de despliegues con requisitos estrictos de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreMEMFOFm-flow-kitti
- Modelo base: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH-kitti
- Repositorio de código original (MEMFOF): https://github.com/msu-video-group/memfof
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper (arXiv): https://arxiv.org/abs/2506.23151
- Script de conversión de pesos: `weights/convert_memfof_weights.py` en el repositorio de LibreYOLO
