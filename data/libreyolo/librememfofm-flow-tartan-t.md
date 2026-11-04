# LibreYOLO/LibreMEMFOFm-flow-tartan-t

## Resumen

LibreMEMFOFm-flow-tartan-t es un modelo de estimación de flujo óptico (optical flow) empaquetado para la librería LibreYOLO por el autor LibreYOLO. Se trata de una conversión de metadatos del checkpoint `egorchistov/optical-flow-MEMFOF-Tartan-T`, que corresponde a la segunda etapa de entrenamiento publicada de MEMFOF (MEMFOF-Tartan-T), afinada a partir de MEMFOF-Tartan. El modelo original procede del trabajo MEMFOF, presentado en ICCV 2025 por investigadores de la Universidad Estatal de Moscú (MSU Graphics & Media Lab) y Princeton Vision & Learning Lab.

MEMFOF resuelve la estimación de flujo óptico multi-frame: recibe los fotogramas t-1, t y t+1 y predice el flujo backward y forward del fotograma t. En LibreYOLO se integra como la familia de tareas `flow` bajo el identificador `LibreMEMFOF`, y cada resultado expone el flujo forward de t a t+1 como un campo `Results.flow` de dimensiones (H, W, 2) en píxeles sobre el lienzo de la imagen original.

La relevancia de esta ficha radica en que el modelo no es un LLM ni un modelo de lenguaje: es un modelo de visión por computador para image-to-image orientado a flujo óptico, con licencia BSD 3-Clause y un tamaño de repositorio de 0,3 GB. El sufijo "m" en el identificador sugiere una variante de tamaño medio dentro de la familia MEMFOF, aunque el número exacto de parámetros no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MEMFOF (estimación de flujo óptico multi-frame, tres fotogramas); detalles internos de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 3 fotogramas (t-1, t, t+1) |
| Tipos de cuantizacion | no disponible; inferencia por defecto en fp32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint LibreYOLO v1.0 (`.pt`); tensores originales en `model.safetensors` sin modificar |

## Arquitectura y entrenamiento

MEMFOF es un modelo de estimación de flujo óptico diseñado para alta resolución con eficiencia de memoria, según el título del paper ICCV 2025. La variante empaquetada aquí, Tartan-T, corresponde a la segunda etapa de entrenamiento publicada y se ha afinado a partir de MEMFOF-Tartan. El modelo consume tres fotogramas consecutivos (t-1, t y t+1) y produce el flujo backward y forward del fotograma central, una formulación multi-frame que aprovecha información temporal adicional frente a los enfoques de dos fotogramas.

La conversión a LibreYOLO es exclusivamente de metadatos: los tensores del `model.safetensors` original se conservan con las mismas claves y valores, y se almacenan en un checkpoint LibreYOLO v1.0 con `task: flow`, `nc: 1`, `names: {0: flow}`, `model_family: memfof`, `size: m` y `variant: tartan-t`. Los valores por defecto de inferencia coinciden con los del modelo original: fp32, 8 iteraciones de refinamiento y resolución nativa con padding de replicación hasta un múltiplo de 16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Estimación de flujo óptico multi-frame a partir de tres fotogramas consecutivos (t-1, t, t+1).
- Predicción del flujo backward y forward del fotograma central.
- Exposición del flujo forward de t a t+1 como campo `Results.flow` de forma (H, W, 2) en píxeles sobre la imagen original.
- Conversión del campo de flujo a representación RGB con rueda de color Middlebury mediante `Results.flow.to_rgb()`.
- Procesamiento a resolución nativa con padding de replicación a múltiplo de 16.
- Refinamiento iterativo configurable (8 iteraciones por defecto).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües; es un modelo puramente visual de image-to-image.

## Casos de uso

- Interpolación de fotogramas en vídeo: el flujo forward y backward entre t y t+1 permite sintetizar fotogramas intermedios para aumentar la tasa de refresco en postproducción o reproducción de vídeo.
- Estabilización y compensación de movimiento: el campo de flujo en píxeles permite estimar el movimiento global y local entre fotogramas para algoritmos de estabilización.
- Seguimiento de objetos y puntos: el flujo denso sirve como señal de correspondencia para inicializar o refinar trackers de puntos y regiones a lo largo del tiempo.
- Análisis de movimiento en vídeo científico o industrial: cuantificación del desplazamiento de partículas, fluidos o estructuras en secuencias de alta resolución, aprovechando el entrenamiento específico para alta resolución del modelo.
- Preprocesado para pipelines de vídeo en LibreYOLO: al integrarse como tarea `flow` dentro de la misma librería que las tareas de detección, permite encadenar estimación de flujo con detección o segmentación en un mismo flujo de trabajo.
- Generación de mapas de movimiento para efectos visuales: el flujo en formato RGB (rueda de color Middlebury) se puede usar como mapa de referencia para herramientas de composición y retoque.
- Evaluación comparativa de algoritmos de flujo óptico: al conservar los pesos originales y los valores por defecto de inferencia, sirve como referencia reproducible frente a otras implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB y la inferencia por defecto es en fp32, por lo que el modelo es ligero en comparación con modelos de lenguaje.
- GPU recomendadas: no disponibles de forma específica; al ser un modelo de visión de tamaño medio y fp32, es probable que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño reducido del checkpoint sugiere que sí, pero no hay datos oficiales.
- Opciones de despliegue: librería LibreYOLO (API `LibreYOLO(...)`); no se indican integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMEMFOFm-flow-tartan-t | no disponible | 3 fotogramas (t-1, t, t+1) | Flujo óptico multi-frame | BSD 3-Clause | HuggingFace (LibreYOLO) |
| MEMFOF-Tartan (etapa previa) | no disponible | 3 fotogramas | Flujo óptico multi-frame | BSD 3-Clause (heredada) | HuggingFace (egorchistov) |
| Alternativas de flujo óptico (RAFT, FlowFormer, etc.) | no disponible | 2 fotogramas habitualmente | Flujo óptico | varía | no disponible en la información proporcionada |

La comparación cuantitativa con otras familias de flujo óptico no está disponible en la información proporcionada; no se han publicado cifras de benchmarks en la documentación consultada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico; no es un modelo de lenguaje ni admite tareas de texto, código o razonamiento.
- Requiere exactamente tres fotogramas de entrada alineados temporalmente; no está pensado para imágenes sueltas ni para secuencias de longitud arbitraria en una sola pasada.
- La licencia de los pesos no está declarada de forma separada en el repositorio original: se hereda de la licencia BSD 3-Clause del repositorio de código, según indica la model card. Conviene verificar los términos antes de un uso comercial.
- El modelo se distribuye como conversión de metadatos; cualquier cambio en los tensores originales o en los valores por defecto de inferencia (fp32, 8 iteraciones, padding a múltiplo de 16) puede alterar los resultados.
- No se dispone de información sobre sesgos, tasas de error, comportamiento en dominios fuera de distribución ni robustez ante oclusiones o movimientos grandes.
- Riesgo de alucinación no aplica en el sentido habitual de modelos generativos de texto, pero sí existe riesgo de estimaciones de flujo incorrectas en regiones sin textura o con movimientos no rígidos.
- No hay datos publicados de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMEMFOFm-flow-tartan-t
- Modelo base (checkpoint original): https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T
- Repositorio de código MEMFOF: https://github.com/msu-video-group/memfof
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper MEMFOF (ICCV 2025): https://arxiv.org/abs/2506.23151
