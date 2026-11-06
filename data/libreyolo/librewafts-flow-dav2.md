# LibreYOLO/LibreWAFTs-flow-dav2

## Resumen

LibreWAFTs-flow-dav2 es un modelo de estimación de flujo óptico (optical flow) publicado por LibreYOLO. Se trata de una reempaquetado de los pesos WAFT (Warping-Alone Field Transforms) del Princeton Vision & Learning Lab, concretamente la variante de backbone `dav2` (Depth Anything V2 Small) y tamaño `s`, con 56,9 millones de parámetros. El modelo resuelve el problema de estimar el movimiento denso entre pares de fotogramas consecutivos, devolviendo un campo de flujo de dos canales (dx, dy) en píxeles.

La relevancia de esta ficha radica en que WAFT propone una arquitectura que prescinde de la correlación de coste (cost volume) y de la búsqueda de vecindad típicas de los métodos clásicos de flujo óptico, sustituyéndolas por un mecanismo de warping directo sobre las características extraídas. El modelo se distribuye a través de la librería `libreyolo` (MIT) y está pensado para integrarse en pipelines de visión por computador con una API unificada.

El checkpoint se deriva del modelo zero-shot del zoo oficial de WAFT, entrenado secuencialmente en TartanAir, FlyingChairs y FlyingThings3D. La licencia combinada es BSD 3-Clause (WAFT) más Apache 2.0 (encoder Depth Anything V2 Small).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WAFT (Warping-Alone Field Transforms), variante a2, backbone Depth Anything V2 Small |
| Parametros totales | 56,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | BSD 3-Clause (WAFT) + Apache 2.0 (encoder Depth Anything V2 Small) |
| Formato de pesos | `.pt` (checkpoint PyTorch empaquetado para `libreyolo`) |

## Arquitectura y entrenamiento

WAFT (Warping-Alone Field Transforms) es una arquitectura de flujo óptico que elimina el cost volume y las operaciones de correlación presentes en propuestas anteriores como RAFT. En su lugar, el modelo aplica warping directo sobre los mapas de características del par de imágenes y refina iterativamente el campo de flujo. La variante aquí publicada usa como encoder el backbone de Depth Anything V2 Small (aproximadamente 24,8 M de parámetros del encoder, sobre un total de 56,9 M), lo que reduce el coste computacional frente a backbones más pesados.

El entrenamiento sigue el schedule zero-shot del zoo oficial de WAFT: primero TartanAir (datos sintéticos con ground truth denso), después FlyingChairs y finalmente FlyingThings3D. No se ha aplicado RLHF ni DPO (no aplica a un modelo de visión). La modificación introducida por LibreYOLO es exclusivamente de empaquetado de metadatos del checkpoint: los parámetros aprendidos y sus nombres se mantienen sin cambios, según el script `weights/convert_waft_weights.py` del repositorio de LibreYOLO.

## Capacidades

- Estimación de flujo óptico denso entre pares de fotogramas consecutivos, con salida de forma `(H, W, 2)` en píxeles `(dx, dy)`.
- Procesamiento por lotes de N fotogramas, generando N-1 flujos en una sola llamada.
- Integración con la API unificada de `libreyolo` (`LibreYOLO("LibreWAFTs-flow-dav2.pt")`).
- Uso como componente en pipelines de seguimiento de movimiento, estabilización de vídeo o interpolación de fotogramas.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión semántica, audio ni otras modalidades.

## Casos de uso

- **Estabilización de vídeo**: estimar el flujo entre fotogramas consecutivos para calcular transformaciones globales y compensar el movimiento de cámara. El modelo devuelve el campo denso necesario para alimentar un estimador de homografía o un filtro de suavizado.
- **Interpolación de fotogramas (frame interpolation)**: usar los flujos directo e inverso entre dos fotogramas para sintetizar fotogramas intermedios en pipelines de postproducción o reproducción a alta tasa de refresco.
- **Seguimiento de objetos y puntos (tracking)**: propagar puntos de interés entre fotogramas mediante el flujo estimado, útil en tareas de seguimiento de características o en la construcción de trayectorias para análisis de movimiento.
- **Detección de movimiento y análisis de escenas**: cuantificar la magnitud del flujo por regiones para identificar objetos en movimiento, personas o vehículos en secuencias de vigilancia o vídeo aéreo.
- **Preprocesado para modelos de vídeo**: generar mapas de flujo como entrada auxiliar para modelos de comprensión de vídeo, acción o predicción que se beneficien de información de movimiento explícita.
- **Robótica y odometría visual**: estimar el desplazamiento aparente entre imágenes consecutivas de una cámara para tareas de navegación, SLAM ligero o evitación de obstáculos en plataformas con recursos limitados, dado el reducido tamaño del modelo (56,9 M de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 56,9 M de parámetros en FP32 el checkpoint ocupa aproximadamente 0,23 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM, dependiendo de la resolución de entrada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente; A100, H100, RTX 4090 o RTX 3060 son opciones viables.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 4 GB o más de VRAM.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (API `LibreYOLO`). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreWAFTs-flow-dav2 | 56,9 M | par de imágenes | Flujo óptico denso | BSD 3-Clause + Apache 2.0 | Hugging Face (LibreYOLO) |
| WAFT (upstream, variante dav2) | 56,9 M | par de imágenes | Flujo óptico denso | BSD 3-Clause | GitHub Princeton-VL (Google Drive) |
| RAFT | no disponible en la información | par de imágenes | Flujo óptico denso | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en flujo óptico; no realiza detección, segmentación, generación de texto ni ninguna otra tarea.
- El checkpoint se ha entrenado con el schedule zero-shot (TartanAir, FlyingChairs, FlyingThings3D); el rendimiento en dominios muy distintos a los de entrenamiento (por ejemplo, imágenes médicas o térmicas) no está documentado.
- La licencia es una combinación de BSD 3-Clause (WAFT) y Apache 2.0 (encoder Depth Anything V2 Small); es necesario revisar ambos textos en el fichero `LICENSE` y el `NOTICE` antes de un uso comercial.
- El zoo upstream de WAFT no publica una licencia separada para los pesos; LibreYOLO aloja el checkpoint bajo la licencia BSD 3-Clause del repositorio, lo que conviene verificar legalmente para uso en producción.
- No se han publicado benchmarks, latencias ni métricas de calidad en la información disponible, por lo que no es posible validar el rendimiento real frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos ni riesgos de alucinación en el sentido lingüístico, pero sí existe el riesgo habitual de errores en regiones oclusas, texturas repetitivas o movimientos muy grandes, inherente a los métodos de flujo óptico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreWAFTs-flow-dav2
- Paper WAFT (arXiv:2506.21526): https://arxiv.org/abs/2506.21526
- Repositorio WAFT (Princeton-VL): https://github.com/princeton-vl/WAFT
- Commit de origen de los pesos: https://github.com/princeton-vl/WAFT/commit/b152ff1cad1af8c185ee7b141997c48ff3334c87
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación LibreYOLO: https://www.libreyolo.com/docs
- Depth Anything V2 (encoder): https://github.com/DepthAnything/Depth-Anything-V2
