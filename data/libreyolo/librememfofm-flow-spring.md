# LibreYOLO/LibreMEMFOFm-flow-spring

## Resumen

LibreMEMFOFm-flow-spring es un empaquetado del checkpoint MEMFOF-Tartan-T-TSKH-spring, un modelo de estimación de flujo óptico multi-frame desarrollado originalmente por el Graphics & Media Lab de la Universidad Estatal de Moscú (MSU) junto con el Princeton Vision & Learning Lab. El modelo resuelve la tarea de estimar el movimiento denso entre fotogramas consecutivos: recibe los fotogramas t-1, t y t+1 y predice el flujo backward y forward del fotograma central. Es relevante porque MEMFOF introduce una arquitectura de bajo consumo de memoria que permite entrenar a alta resolución, algo crítico para flujo óptico de calidad en vídeo real.

Esta variante concreta es un fine-tune sobre el benchmark Spring, orientado a escenas con movimientos complejos y pequeños desplazamientos. El repositorio de LibreYOLO no modifica los tensores originales: solo reempaqueta los pesos en un checkpoint v1.0 de LibreYOLO con la tarea `flow`, de modo que pueda ejecutarse con la API de esa librería. El tamaño del repositorio es de 0,3 GB, coherente con un modelo de tamaño "m" (medium).

La ficha se basa exclusivamente en la información del repositorio de HuggingFace y la model card; los datos no publicados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MEMFOF, red neuronal para estimación de flujo óptico multi-frame (no disponible el detalle interno de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable; entrada fija de 3 fotogramas (t-1, t, t+1) |
| Tipos de cuantizacion | no disponible; inferencia por defecto en fp32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | checkpoint LibreYOLO v1.0 (.pt); tensores originales en safetensors, sin modificar |
| Tarea | `flow` (estimación de flujo óptico) |
| Familia y tamaño | `memfof`, tamaño `m`, variante `spring` |
| Resolución de entrada | resolución nativa con padding replicate a múltiplo de 16 |
| Iteraciones de refinamiento | 8 (por defecto) |
| Salida | campo de flujo forward (H, W, 2) en píxeles sobre el lienzo de la imagen original |

## Arquitectura y entrenamiento

MEMFOF (Memory-Efficient Multi-Frame Optical Flow) es una red de estimación de flujo óptico que procesa tres fotogramas consecutivos y estima el flujo backward (t → t-1) y forward (t → t+1) del fotograma central. Su innovación principal, según el paper de ICCV 2025, es una estrategia de entrenamiento a alta resolución con bajo consumo de memoria, que permite obtener campos de flujo precisos en escenas de alta resolución sin requerir recursos de GPU desproporcionados. La inferencia aplica 8 iteraciones de refinamiento sobre la resolución nativa, con padding replicate a múltiplo de 16.

El checkpoint empaquetado corresponde a la variante Tartan-T-TSKH con fine-tune sobre el benchmark Spring. No se dispone en la información proporcionada del número de tokens o fotogramas de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de visión de este tipo). El código de referencia está en el repositorio msu-video-group/memfof, en el commit `a51de9fc59c6fe20ba08e079372c7b583d58a712`.

## Capacidades

- Estimación de flujo óptico denso forward y backward entre fotogramas consecutivos.
- Procesamiento de secuencias de tres fotogramas (t-1, t, t+1) con salida de dos resultados de flujo.
- Generación de representación visual del flujo mediante rueda de color Middlebury (`Results.flow.to_rgb()`).
- Funcionamiento a resolución nativa de la imagen, con padding automático a múltiplo de 16.
- Integración con la API de LibreYOLO para carga y ejecución del modelo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión semántica, audio ni modo thinking.

## Casos de uso

- Estimación de movimiento en vídeo de vigilancia: el modelo calcula el flujo forward entre fotogramas consecutivos para detectar desplazamientos y direcciones de objetos en escenas con movimiento complejo, aprovechando el fine-tune sobre Spring, orientado a movimientos realistas.
- Interpolación de fotogramas y aumento de tasa de refresco: el campo de flujo (H, W, 2) en píxeles permite warpear el fotograma t hacia t+1 y sintetizar fotogramas intermedios en pipelines de postproducción.
- Estabilización de vídeo: el flujo backward (t → t-1) se usa para estimar el desplazamiento global de cámara entre fotogramas y compensar el temblor antes de recortar y reencuadrar.
- Análisis de movimiento en vídeo deportivo: el flujo denso permite cuantificar velocidad y dirección de jugadores y balón en secuencias de alta resolución, ámbito donde el entrenamiento a alta resolución de MEMFOF resulta ventajoso.
- Segmentación guiada por movimiento: el flujo forward se emplea como señal auxiliar para propagar máscaras entre fotogramas en tareas de tracking de instancias.
- Compresión de vídeo y estimación de vectores de movimiento: el flujo puede servir como referencia o inicialización para codificadores que necesitan campos de movimiento densos previos a la codificación.
- Detección de anomalías en escenas dinámicas: comparar el flujo estimado con el esperado permite identificar comportamientos anómalos (caídas, intrusiones) en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (como EPE o Fl-all) sobre Spring ni sobre otros conjuntos, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,3 GB) sugiere que los pesos en fp32 ocupan del orden de centenares de MB, pero el consumo de memoria de inferencia depende de la resolución de entrada y de las 8 iteraciones de refinamiento.
- GPU recomendadas: no especificadas en la información disponible; por el perfil de memoria del modelo (tamaño "m" y entrenamiento memory-efficient), es plausible su ejecución en GPU consumer, aunque no se confirma con datos del autor.
- ¿Cabe en GPU consumer? No confirmado en la información disponible.
- Opciones de despliegue: la vía documentada es la librería LibreYOLO (`from libreyolo import LibreYOLO`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de flujo óptico (como RAFT, FlowFormer o SEA-RAFT) que permitan una comparativa cuantitativa fiable. Se indica "no disponible" en lugar de inferir cifras.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreMEMFOFm-flow-spring | no disponible | 3 fotogramas | BSD 3-Clause | HuggingFace (LibreYOLO) |
| Alternativas de flujo óptico | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico: no genera texto, no razona ni responde a instrucciones.
- Requiere exactamente tres fotogramas como entrada; no procesa secuencias de longitud arbitraria de forma nativa.
- La licencia de los pesos no está declarada de forma separada en el repositorio upstream; se asume heredada del código (BSD 3-Clause) según indica la model card, lo que introduce cierta incertidumbre jurídica para uso comercial.
- El fine-tune está orientado al benchmark Spring; su generalización a otros dominios (escenas nocturnas, imágenes médicas, vídeo sintético) no está documentada.
- Riesgo de artefactos en regiones oclusas o con movimientos muy grandes, inherente a la estimación de flujo denso; no cuantificado en la información disponible.
- La resolución de entrada debe tener dimensiones múltiplo de 16 tras el padding; resoluciones muy altas incrementan el consumo de memoria de forma no especificada.
- No hay datos publicados de sesgos, robustez ni evaluación en dominios distintos al de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del empaquetado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LibreYOLO/LibreMEMFOFm-flow-spring
- Modelo base: https://huggingface.co/egorchistov/optical-flow-MEMFOF-Tartan-T-TSKH-spring
- Código upstream MEMFOF: https://github.com/msu-video-group/memfof
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Paper: https://arxiv.org/abs/2506.23151
