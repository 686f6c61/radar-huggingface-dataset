# LibreYOLO/LibreFlowSeekt-flow

## Resumen

LibreFlowSeekt-flow es un modelo de estimación de flujo óptico (optical flow) empaquetado por LibreYOLO para su tarea `flow`, a partir del checkpoint `flowseek_T_TartanCT_TSKH.pth` del proyecto FlowSeek desarrollado por Matteo Poggi y Fabio Tosi (Universidad de Bolonia) y presentado en el paper "FlowSeek: Optical Flow Made Easier with Depth Foundation Models and Motion Bases" (ICCV 2025). No es un modelo de lenguaje: es un modelo de visión por computador que, dadas dos o más imágenes consecutivas, produce un campo de flujo denso de dimensiones (H, W, 2) en píxeles con componentes (dx, dy).

El modelo combina dos redes de contexto y extracción de características basadas en ResNet-18 con un codificador Depth Anything V2 ViT-S (variante Small) congelado, y aplica 4 iteraciones de refinamiento. Construye sobre la arquitectura SEA-RAFT (licencia BSD 3-Clause). El checkpoint upstream fue entrenado secuencialmente en TartanAir, luego Chairs y Things, y finalmente en un ajuste fino mixto con Sintel, KITTI, HD1K y Things; el checkpoint generalista se evalúa en Spring y LayeredFlow.

Su relevancia radica en que integra un modelo fundacional de profundidad como codificador de características dentro de un pipeline de flujo óptico, lo que reduce la necesidad de entrenamiento específico por dominio. El empaquetado de LibreYOLO añade únicamente metadatos (esquema de checkpoint v1.0); los parámetros aprendidos no se modifican. El repositorio ocupa 0,2 GB, lo que es coherente con un modelo de tamaño pequeño basado en ViT-S y ResNet-18.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: redes de contexto y características ResNet-18, codificador Depth Anything V2 ViT-S (Small) congelado, 4 iteraciones de refinamiento; base SEA-RAFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa pares o secuencias de fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 (parámetros FlowSeek; codificador Depth Anything V2 Small declarado upstream) |
| Formato de pesos | checkpoint `.pt` con esquema LibreYOLO v1.0 (parámetros originales sin modificar) |

## Arquitectura y entrenamiento

FlowSeek emplea un diseño de dos redes: una red de contexto y una red de extracción de características, ambas basadas en ResNet-18, junto con un codificador de profundidad Depth Anything V2 ViT-S congelado que aporta representaciones fundacionales. El campo de flujo se refina en 4 iteraciones, siguiendo el paradigma iterativo de SEA-RAFT. La innovación central del paper es el uso de modelos fundacionales de profundidad y bases de movimiento para simplificar la estimación de flujo óptico, reduciendo la dependencia de arquitecturas específicas y de grandes volúmenes de datos anotados por dominio.

El entrenamiento upstream es secuencial: primero TartanAir, después Chairs y Things, y finalmente un ajuste fino mixto sobre Sintel, KITTI, HD1K y Things. El checkpoint empaquetado (`flowseek_T_TartanCT_TSKH.pth`) corresponde a esta cadena y se evalúa en los conjuntos Spring y LayeredFlow. La variante "t" comparte pesos con LibreFlowSeeks-flow pero difiere en el número de iteraciones, tal como refleja la configuración upstream `config/eval/flowseek-T.json`. El codificador Depth Anything V2 ViT-S está embebido en el checkpoint, por lo que el archivo es autocontenido. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Estimación de flujo óptico denso entre fotogramas consecutivos: devuelve un tensor (H, W, 2) en float32 con desplazamientos (dx, dy) en píxeles.
- Procesamiento de secuencias: N fotogramas de entrada producen N-1 flujos.
- Integración de características de profundidad gracias al codificador Depth Anything V2 ViT-S congelado.
- Refinamiento iterativo del flujo en 4 pasos.
- Generalización a dominios diversos gracias al ajuste fino mixto (Sintel, KITTI, HD1K, Things) y a la evaluación upstream en Spring y LayeredFlow.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Estimación de movimiento en vídeo: el modelo procesa pares de fotogramas y devuelve el campo de flujo denso, adecuado para tareas de análisis de movimiento en secuencias de vídeo de diversa procedencia gracias a su entrenamiento mixto.
- Estabilización y compensación de movimiento: el flujo (dx, dy) por píxel permite calcular transformaciones globales o locales para estabilizar vídeo o alinear fotogramas.
- Interpolación de fotogramas: el flujo bidireccional entre fotogramas consecutivos sirve de base para sintetizar fotogramas intermedios en pipelines de aumento de tasa de refresco.
- Seguimiento de objetos y puntos: el campo de flujo denso permite propagar puntos de interés o máscaras entre fotogramas sin detección por fotograma.
- Percepción en robótica y vehículos autónomos: estimación de movimiento relativo entre imágenes consecutivas de cámara, con evaluación upstream en KITTI que respalda su uso en escenarios de conducción.
- Análisis de escenas con profundidad: la integración del codificador Depth Anything V2 permite aprovechar información de estructura de escena para tareas de flujo en entornos con variación de profundidad, como los evaluados en Spring y LayeredFlow.
- Procesamiento por lotes en pipelines de visión: la API de LibreYOLO acepta listas de rutas de imagen y devuelve resultados por par, lo que facilita su integración en scripts de procesamiento de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,2 GB) sugiere un modelo pequeño que probablemente quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido del checkpoint (0,2 GB) es indicativo pero no concluyente.
- Opciones de despliegue: librería `libreyolo` mediante `LibreYOLO("LibreFlowSeekt-flow.pt")`; no se documentan otras opciones (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreFlowSeekt-flow | no disponible | no aplica | no disponible | Apache 2.0 | HuggingFace (LibreYOLO) |
| LibreFlowSeeks-flow | mismos pesos que la variante t, distinto número de iteraciones | no aplica | no disponible | Apache 2.0 | HuggingFace (LibreYOLO) |
| FlowSeek upstream (`flowseek_T_TartanCT_TSKH.pth`) | no disponible | no aplica | evaluado en Spring y LayeredFlow | Apache 2.0 | GitHub (mattpoggi/flowseek) |
| SEA-RAFT (base arquitectónica) | no disponible | no aplica | no disponible | BSD 3-Clause | no disponible en la información |

## Limitaciones y advertencias

- Modelo de visión especializado en flujo óptico: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- No se han publicado métricas de rendimiento en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- El empaquetado de LibreYOLO solo modifica metadatos; cualquier limitación del checkpoint upstream se hereda sin cambios.
- La licencia Apache 2.0 permite uso comercial, pero el codificador Depth Anything V2 Small tiene su propia declaración upstream que conviene verificar en los archivos `LICENSE` y `NOTICE` del repositorio.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se documentan sesgos específicos, pero al ser un modelo de visión entrenado en datasets de conducción y escenas sintéticas (TartanAir, KITTI, Sintel), su comportamiento puede degradarse en dominios visuales alejados de esos datos.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de flujo erróneo en regiones ocluidas, texturas repetitivas o movimientos grandes sin correspondencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreFlowSeekt-flow
- Variante relacionada: https://huggingface.co/LibreYOLO/LibreFlowSeeks-flow
- Repositorio FlowSeek upstream: https://github.com/mattpoggi/flowseek
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
