# LibreYOLO/LibreWAFTt-flow-dinov3

## Resumen

LibreWAFTt-flow-dinov3 es un checkpoint de estimación de flujo óptico (optical flow) del modelo WAFT, empaquetado por LibreYOLO para su uso dentro de su propia librería. WAFT (Warping-Alone Field Transforms) es un método desarrollado por el Princeton Vision & Learning Lab (Yihan Wang y Jia Deng), presentado en ICLR 2026, que aborda la estimación de flujo óptico denso entre pares de imágenes. Esta variante concreta corresponde al tamaño `t` de LibreWAFT y utiliza un encoder DINOv3 ViT-S/16 de 56,5 M de parámetros.

El modelo se distribuye como un artefacto de inferencia listo para usar con la librería `libreyolo`, con la API `LibreYOLO("LibreWAFTt-flow-dinov3.pt")`. Dado un conjunto de N frames, devuelve N-1 mapas de flujo con forma (H, W, 2) en píxeles, representando los desplazamientos (dx, dy). Es relevante para pipelines de visión por computador que necesitan flujo óptico zero-shot sin reentrenamiento: seguimiento de objetos, estabilización de vídeo, interpolación de frames o estimación de movimiento en robótica y conducción autónoma.

El checkpoint procede del zoo de modelos upstream de WAFT (archivo `waftv2-ckpts/dinov3/zero-shot.pth`), entrenado con el schedule zero-shot: TartanAir, después FlyingChairs y finalmente FlyingThings3D. Las modificaciones introducidas por LibreYOLO se limitan al empaquetado de metadatos; los parámetros aprendidos y sus nombres no se han alterado. La licencia es combinada: BSD 3-Clause para WAFT y DINOv3 License para los parámetros del encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAFT (Warping-Alone Field Transforms) con encoder DINOv3 ViT-S/16 |
| Parametros totales | 56,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | waft-bsd-3-clause-and-dinov3 (BSD 3-Clause + DINOv3 License) |
| Formato de pesos | `.pt` (checkpoint PyTorch empaquetado para `libreyolo`) |

## Arquitectura y entrenamiento

WAFT es un modelo de estimación de flujo óptico basado en el paradigma de "warping-alone": en lugar de combinar correlaciones con warping como en arquitecturas RAFT clásicas, se apoya principalmente en operaciones de warping para alinear características entre los dos frames de entrada. Esta variante concreta emplea un encoder DINOv3 ViT-S/16 (Vision Transformer small, patch 16) de 56,5 M de parámetros, lo que reduce el coste computacional frente a backbones más pesados y facilita el despliegue en GPUs de gama media.

El entrenamiento sigue el schedule zero-shot descrito en la model card: primero TartanAir (dataset sintético con ground-truth denso), después FlyingChairs y finalmente FlyingThings3D. No se documenta en la información proporcionada el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo esperable en un modelo de visión. La innovación principal es la sustitución de las capas de correlación volumétrica por warping puro, lo que simplifica el grafo computacional y reduce memoria, manteniendo la capacidad de generalización zero-shot a dominios no vistos.

## Capacidades

- Estimación de flujo óptico denso entre pares consecutivos de frames, devolviendo un tensor (H, W, 2) con desplazamientos en píxeles.
- Procesamiento por lotes: la API acepta una lista de N imágenes y devuelve N-1 flujos, lo que permite procesar secuencias completas en una sola llamada.
- Generalización zero-shot a dominios no vistos, gracias al entrenamiento sobre TartanAir, FlyingChairs y FlyingThings3D.
- Integración con la librería `libreyolo` mediante la clase `LibreYOLO`, con acceso directo a `results[i].flow.data`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente visual.
- No dispone de capacidades multilingües, de texto, de audio ni de visión general (no es un VLM).
- No se documentan modos especiales como thinking mode ni decodificación especulativa.

## Casos de uso

- Estabilización de vídeo: el modelo calcula el flujo entre frames consecutivos y permite estimar la transformación global de la cámara para compensar el movimiento y producir vídeo estabilizado sin recortes agresivos.
- Interpolación de frames: a partir de los flujos directo e inverso entre dos frames se pueden sintetizar frames intermedios, útil para aumentar la tasa de refresco en postproducción o en slow-motion.
- Seguimiento de objetos y puntos: el flujo denso permite propagar puntos de interés o cajas delimitadoras entre frames, base para trackers multi-objeto o para anotación semiautomática de datasets.
- Estimación de movimiento en robótica: en navegación de robots móviles o drones, el flujo óptico aporta información de velocidad relativa y obstáculos cercanos que complementa a la odometría visual.
- Conducción autónoma y ADAS: detección de movimiento relativo de vehículos y peatones, útil para predicción de trayectorias a corto plazo y para el análisis de escenas dinámicas.
- Análisis de movimiento en vídeo científico o deportivo: cuantificación de desplazamientos en secuencias de microscopía, biomecánica o análisis deportivo, donde el flujo denso ofrece mapas de movimiento por píxel.
- Preprocesado para pipelines de visión: el flujo generado puede alimentar modelos posteriores de segmentación temporal, detección de anomalías en vídeo o reidentificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 56,5 M de parámetros y entrada de imagen estándar, la huella es moderada (orientativamente por debajo de 4 GB en FP32 para resoluciones habituales, aunque no se confirma en la información proporcionada).
- GPU recomendadas: al ser un modelo pequeño, cabe en GPUs consumer como RTX 3060, RTX 4060 o RTX 4090; también en A100/H100 para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque el dato exacto no está confirmado.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` con `LibreYOLO("LibreWAFTt-flow-dinov3.pt")`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreWAFTt-flow-dinov3 | 56,5 M | par de imágenes (H, W) | Flujo óptico denso | BSD 3-Clause + DINOv3 | Hugging Face (LibreYOLO) |
| WAFT original (upstream) | no disponible | par de imágenes | Flujo óptico denso | BSD 3-Clause | GitHub princeton-vl/WAFT |
| RAFT | no disponible | par de imágenes | Flujo óptico denso | BSD 3-Clause (upstream) | GitHub princeton-vl/RAFT |
| SEA-RAFT | no disponible | par de imágenes | Flujo óptico denso | no disponible | GitHub |

La comparación con RAFT y SEA-RAFT se ofrece como referencia de categoría; no se dispone en la información proporcionada de datos de rendimiento comparativos entre ellos y LibreWAFTt-flow-dinov3.

## Limitaciones y advertencias

- Licencia combinada: el uso comercial está sujeto simultáneamente a BSD 3-Clause (WAFT) y a la DINOv3 License, que incluye restricciones de uso adicionales. Es imprescindible revisar `LICENSE` y `NOTICE` antes de desplegar en producción.
- El checkpoint incorpora parámetros derivados de DINOv3, por lo que hereda las restricciones de la DINOv3 License, no solo las de BSD 3-Clause.
- Modelo especializado en flujo óptico: no genera texto, no razona, no soporta tool calling ni agentes. No debe presentarse como un modelo de propósito general.
- Riesgo de degradación en dominios muy alejados del entrenamiento (TartanAir, FlyingChairs, FlyingThings3D): escenas nocturnas, imágenes médicas, microscopía o condiciones meteorológicas extremas pueden producir flujos imprecisos.
- No se documentan sesgos específicos, pero al ser un modelo entrenado mayoritariamente con datos sintéticos y de escenas naturales, puede mostrar menor precisión en objetos poco texturizados o con oclusiones severas.
- No hay información sobre cuantizaciones soportadas ni sobre latencia, lo que dificulta planificar el despliegue en entornos con requisitos estrictos de tiempo real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto recién publicado y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreWAFTt-flow-dinov3
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- WAFT upstream: https://github.com/princeton-vl/WAFT
- Commit de referencia WAFT: https://github.com/princeton-vl/WAFT/commit/b152ff1cad1af8c185ee7b141997c48ff3334c87
- DINOv3 (facebookresearch): https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Paper WAFT (arXiv): https://arxiv.org/abs/2506.21526
