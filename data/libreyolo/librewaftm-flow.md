# LibreYOLO/LibreWAFTm-flow

## Resumen

LibreWAFTm-flow es un modelo de estimación de flujo óptico (optical flow) empaquetado por LibreYOLO a partir de los pesos canónicos de WAFT (Warping-Alone Field Transforms), desarrollado por el Princeton Vision & Learning Lab. WAFT propone una arquitectura que prescinde de los volúmenes de correlación iterativos típicos de los métodos clásicos de flujo óptico y se apoya únicamente en warping, lo que simplifica el diseño y reduce el coste computacional manteniendo precisión competitiva. El modelo fue presentado en el paper "WAFT: Warping-Alone Field Transforms for Optical Flow" (ICLR 2026, arXiv:2506.21526).

La variante aquí publicada corresponde a la adaptación `a1` con encoder Depth Anything V2 Small, con 64,2 M de parámetros, entrenada con un schedule zero-shot (TartanAir, FlyingChairs y FlyingThings3D). Es el checkpoint canónico dentro de LibreYOLO (sin sufijo de variante), es decir, la versión que el propio README upstream recomienda para uso downstream. El repositorio ocupa 0,3 GB y la librería de inferencia es `libreyolo`.

La relevancia actual radica en que ofrece un modelo de flujo óptico listo para producción dentro del ecosistema LibreYOLO, con una API de dos líneas para obtener el campo de flujo `(H, W, 2)` en píxeles a partir de dos o más frames. No es un modelo de lenguaje ni un VLM: es un modelo image-to-image especializado en correspondencia densa entre imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAFT (Warping-Alone Field Transforms), encoder Depth Anything V2 Small |
| Parametros totales | 64,2 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión image-to-image) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | BSD 3-Clause (WAFT) + Apache 2.0 (encoder Depth Anything V2 Small) |
| Formato de pesos | `.pt` (PyTorch, cargado vía `libreyolo`) |

## Arquitectura y entrenamiento

WAFT es una arquitectura de flujo óptico basada en transformer que elimina los volúmenes de correlación que dominan en métodos como RAFT y sus descendientes. En su lugar, el modelo realiza warping iterativo sobre las features y refina el flujo directamente, reduciendo la complejidad del diseño y el consumo de memoria. El encoder de este checkpoint es Depth Anything V2 Small (Apache 2.0), que aporta representaciones visuales densas preentrenadas.

El entrenamiento sigue un schedule zero-shot en tres fases: primero TartanAir, después FlyingChairs y finalmente FlyingThings3D, sin fine-tuning en benchmarks específicos como KITTI o Sintel. El checkpoint original es `a1/tar-c-t.pth` del model zoo upstream (commit `b152ff1`). Las modificaciones introducidas por LibreYOLO son exclusivamente de metadatos de empaquetado: los parámetros aprendidos y sus nombres no se han alterado, según indica la model card. No se documentan detalles adicionales sobre número de tokens de entrenamiento, composición exacta de los datasets ni uso de RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades

- Estimación de flujo óptico denso entre pares de imágenes consecutivas.
- Procesamiento de secuencias: N frames de entrada producen N-1 campos de flujo.
- Salida de flujo en píxeles con formato `(H, W, 2)` correspondiente a `(dx, dy)`.
- Generalización zero-shot a dominios no vistos durante el entrenamiento (schedule TartanAir → FlyingChairs → FlyingThings3D).
- Integración nativa con la librería `libreyolo` mediante la clase `LibreYOLO`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de correspondencia.
- No dispone de thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Estimación de movimiento en vídeo: dado un par de frames consecutivos, el modelo devuelve el campo de flujo `(dx, dy)` por píxel, útil para análisis de movimiento, seguimiento y estabilización.
- Estabilización de vídeo digital: el flujo denso permite calcular transformaciones globales entre frames y compensar el movimiento de cámara en postproducción.
- Interpolación de frames: el flujo entre dos frames adyacentes sirve para sintetizar frames intermedios en pipelines de aumento de tasa de refresco.
- Segmentación guiada por movimiento: el flujo óptico actúa como señal auxiliar para separar objetos en movimiento del fondo estático en escenas de vigilancia o conducción.
- Odometría visual y robótica: el flujo denso entre imágenes consecutivas alimenta estimadores de movimiento de cámara en sistemas de navegación o SLAM.
- Análisis de escenas deportivas: seguimiento de jugadores y balón mediante el campo de flujo en secuencias de vídeo de alta cadencia.
- Preprocesado para modelos downstream: el flujo generado puede usarse como entrada adicional en tareas de detección de acciones o predicción de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64,2 M de parámetros en FP32, el peso de los parámetros ronda los 0,26 GB, por lo que la VRAM total dependerá de la resolución de las imágenes y del tamaño de los mapas de features.
- GPU recomendadas: no documentadas por el autor; por tamaño del modelo, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para resoluciones moderadas.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior) dada la escala del modelo, aunque no se publican requisitos oficiales.
- Opciones de despliegue: la model card solo documenta la carga mediante `libreyolo` (`LibreYOLO("LibreWAFTm-flow.pt")`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreWAFTm-flow | 64,2 M | WAFT (warping-only, sin volúmenes de correlación) | Pares de frames, salida `(H, W, 2)` | BSD 3-Clause + Apache 2.0 | HuggingFace (LibreYOLO) |
| RAFT (alternativa clásica) | no disponible en esta ficha | Volúmenes de correlación iterativos | Pares de frames | BSD 3-Clause (upstream) | Repositorio oficial Princeton |
| FlowFormer (alternativa transformer) | no disponible en esta ficha | Transformer con cost volumes | Pares de frames | no disponible | Repositorio oficial |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a enfoque arquitectónico y licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico: no genera texto, no razona, no responde a instrucciones y no procesa lenguaje.
- Entrenado con schedule zero-shot (TartanAir, FlyingChairs, FlyingThings3D): el rendimiento en dominios muy distintos (imágenes médicas, satelitales, térmicas) puede degradarse sin fine-tuning.
- No se han publicado métricas de benchmarks en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- La licencia combinada BSD 3-Clause + Apache 2.0 permite uso comercial, pero debe conservarse el archivo `LICENSE` y `NOTICE` con ambas atribuciones.
- El autor advierte que el model zoo upstream de WAFT no publica una licencia separada para los pesos; LibreYOLO los aloja bajo la licencia BSD 3-Clause del repositorio. Conviene verificar esta interpretación antes de un despliegue comercial crítico.
- El formato de pesos es `.pt` específico de `libreyolo`; no se documentan conversiones a GGUF, ONNX ni otros formatos, lo que limita la portabilidad fuera del ecosistema LibreYOLO.
- Sin información sobre sesgos: al ser un modelo de visión, los sesgos potenciales estarían en los datasets de entrenamiento (TartanAir sintético, FlyingChairs/Things3D), no en atributos sociales.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de estimaciones de flujo erróneas en regiones ocluidas, texturas repetitivas o movimientos muy grandes.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreWAFTm-flow
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Repositorio WAFT upstream: https://github.com/princeton-vl/WAFT
- Commit upstream referenciado: https://github.com/princeton-vl/WAFT/commit/b152ff1cad1af8c185ee7b141997c48ff3334c87
- Paper WAFT (arXiv): https://arxiv.org/abs/2506.21526
- Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Script de conversión de pesos: `weights/convert_waft_weights.py` en el repositorio LibreYOLO
