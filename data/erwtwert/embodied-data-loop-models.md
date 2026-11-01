# erwtwert/embodied-data-loop-models

## Resumen

`erwtwert/embodied-data-loop-models` no es un modelo entrenado de forma end-to-end, sino una coleccion de pesos preentrenados de terceros empaquetados para los pipelines de anotacion del proyecto Human ↔ Robot Transfer Lab (repositorio `pm1255/human-robot-transfer`). Agrupa componentes heterogeneos: MediaPipe (deteccion de manos y keypoints corporales), HaMeR (reconstruccion de malla 3D de manos), SAM 3.1 (segmentacion de video), MoGe-3 ViT-L (estimacion de profundidad monocular) y FoundationPose (estimacion de pose de objetos). Cada componente conserva su autoria y su licencia original.

El repositorio ocupa aproximadamente 8 GB y se distribuye con un `manifest.json` y sumas SHA-256 para verificar la integridad de los ficheros, no la precision de los modelos. No se carga mediante una unica llamada a Transformers: es un contenedor de activos que el codigo companion descarga e instala en rutas concretas esperadas por los scripts de anotacion.

Su relevancia es practica para equipos que construyen pipelines de captura de movimiento humano, transferencia humano-robot y anotacion multimodal de video. No aporta un modelo nuevo de lenguaje ni de vision general, sino un conjunto reproducible de dependencias con licencias documentadas, lo que facilita la trazabilidad legal en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de modelos heterogeneos (MediaPipe, HaMeR, SAM 3.1, MoGe-3 ViT-L, FoundationPose); no es un unico transformer |
| Parametros totales | no disponible (depende de cada componente; MoGe-3 es ViT-L, HaMeR es un ViT-based mesh regressor, SAM 3.1 es un segmentador, FoundationPose combina redes de refinamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato original; el tag `tflite` sugiere componentes MediaPipe en TensorFlow Lite |
| Idiomas soportados | en, zh (etiquetas del repositorio; los modelos de vision no procesan lenguaje de forma nativa) |
| Licencia | component-specific-licenses (Apache-2.0 para MediaPipe; MIT para HaMeR y MoGe-3; SAM License para SAM 3.1; NVIDIA Source Code License no comercial para FoundationPose) |
| Formato de pesos | safetensors, TensorFlow Lite y otros formatos propios de cada componente; incluye `manifest.json` con SHA-256 |

## Arquitectura y entrenamiento

No existe un entrenamiento unificado. Cada componente es un modelo upstream preentrenado por su autor original y redistribuido aqui. MediaPipe aporta deteccion de manos y keypoints con modelos ligeros en TFLite. HaMeR reconstruye mallas 3D de manos a partir de imagenes, requiriendo adicionalmente el fichero `MANO_RIGHT.pkl` que el usuario debe obtener por separado desde el sitio de MANO (no se redistribuye). SAM 3.1 realiza segmentacion de video y derivacion de cajas a partir de mascaras. MoGe-3 ViT-L estima profundidad monocular con un backbone ViT-L. FoundationPose estima pose de objetos y requiere ambas redes con sus `config.yml`.

El repositorio no incluye pesos nuevos de segmentacion semantica general de lineas temporales de accion, contacto fisico, affordance ni prediccion de agarre. Las etiquetas temporales y las senales de contacto 2D existentes son anotaciones y reglas especificas de muestra, no ground truth ni un modelo entrenado aparte. La verificacion mediante SHA-256 garantiza integridad de ficheros, no exactitud de predicciones.

## Capacidades

- Deteccion de manos y keypoints corporales (MediaPipe).
- Reconstruccion de malla 3D de manos, reparacion de identidad y renderizado de superficie (HaMeR).
- Segmentacion de video y derivacion de cajas delimitadoras a partir de mascaras (SAM 3.1).
- Estimacion de profundidad monocular (MoGe-3 ViT-L).
- Estimacion de pose de objetos y prueba de proxy rigido para prendas (FoundationPose).
- Comprobaciones de consistencia y validacion de integridad mediante scripts de control de calidad (sin pesos independientes).
- Vision por computador para anotacion multimodal; no incluye generacion de texto, razonamiento linguistico ni tool calling.
- Soporte de anotacion web unificada para revisar video original y anotaciones superpuestas.

## Casos de uso

- Captura de movimiento de manos para teleoperacion: usar MediaPipe para keypoints 2D y HaMeR para malla 3D, alimentando retargeting hacia robots Aloha/G1 (requiere activos geometricos descritos en QUICKSTART.md).
- Anotacion de video para datasets de robotica: SAM 3.1 segmenta objetos en secuencias y deriva cajas, reduciendo el etiquetado manual en pipelines de aprendizaje por imitacion.
- Estimacion de profundidad en escenas de manipulacion: MoGe-3 ViT-L proporciona mapas de profundidad monocular para reconstruir geometria aproximada cuando no hay sensores de profundidad.
- Estimacion de pose de objetos para agarre: FoundationPose calcula poses 6D de objetos; util en laboratorio para evaluar estrategias de agarre, con la limitacion de su licencia no comercial.
- Revision y control de calidad de anotaciones: los scripts de confianza y validacion por lotes detectan inconsistencias entre componentes antes de aceptar un lote de datos.
- Transferencia humano-robot con edicion de video opcional: el pipeline permite edicion video robot-a-humano usando el snapshot oficial Wan2.1-VACE-1.3B obtenido por separado.
- Construccion de datasets embodied reproducibles: el manifest con SHA-256 y el comando `model_assets.py check` permiten fijar revisiones y verificar activos en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende de cada componente. MoGe-3 ViT-L y SAM 3.1 son los mas exigentes; MediaPipe en TFLite puede ejecutarse en CPU.
- GPU recomendadas: no especificadas por el autor; por el tipo de componentes (ViT-L, segmentacion de video, pose 6D) se recomienda GPU con al menos 16-24 GB para ejecutar varios componentes en paralelo.
- Cabe en GPU consumer: probablemente los componentes ligeros (MediaPipe) en CPU; los modelos ViT-L y de segmentacion requieren GPU dedicada, aunque el autor no publica requisitos concretos.
- Opciones de despliegue: scripts Python del repositorio companion (`tools/run.py`, `human2robot/...`), descarga via `huggingface_hub` y `tools/model_assets.py`; no se documenta vLLM, llama.cpp, Ollama ni TGI (no aplican a estos modelos de vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Este repositorio (coleccion) | MediaPipe (individual) | SAM 3.1 (individual) | MoGe-3 ViT-L (individual) |
|---|---|---|---|---|
| Tipo | Coleccion de activos de vision | Framework de percepcion | Segmentacion | Profundidad monocular |
| Parametros | Heterogeneo | Ligeros (TFLite) | no disponible | ViT-L |
| Contexto | no aplica | no aplica | no aplica | no aplica |
| Licencia | Por componente | Apache-2.0 | SAM License | MIT |
| Disponibilidad | HuggingFace + GitHub | GitHub | HuggingFace | HuggingFace |
| Uso comercial | Restringido por FoundationPose | Si | Segun SAM License | Si |

La comparativa directa con modelos de lenguaje no procede: se trata de una coleccion de vision para robotica, no de un LLM.

## Limitaciones y advertencias

- No es un modelo unico ni end-to-end; no puede cargarse con una sola llamada a Transformers.
- Las predicciones pueden contener detecciones perdidas, identidad o segmentacion incorrectas, geometria monocular no calibrada y limites semanticos inciertos.
- Las puntuaciones de calidad son evidencia de cribado, no probabilidades calibradas ni aprobacion automatica de entrenamiento.
- FoundationPose usa NVIDIA Source Code License, restringida a investigacion y evaluacion no comercial; limita el uso comercial del conjunto.
- SAM 3.1 se distribuye bajo SAM License, con condiciones propias que deben revisarse.
- HaMeR requiere `MANO_RIGHT.pkl` obtenido por el usuario; MANO no se redistribuye y tiene sus propias condiciones.
- El retargeting a Aloha/G1 requiere activos geometricos de robot adicionales no incluidos.
- No incluye pesos de segmentacion semantica de acciones, contacto fisico, affordance ni prediccion de agarre.
- No hay garantia de exactitud: la verificacion SHA-256 solo valida integridad de ficheros.
- Idiomas etiquetados en/zh, pero los modelos de vision no procesan lenguaje de forma nativa.

## Enlaces

- HuggingFace: https://huggingface.co/erwtwert/embodied-data-loop-models
- Codigo companion: https://github.com/pm1255/human-robot-transfer
- Guia de setup y uso: https://github.com/pm1255/human-robot-transfer/blob/main/docs/MODEL_RELEASE.md
- QUICKSTART: https://github.com/pm1255/human-robot-transfer/blob/main/docs/QUICKSTART.md
- MediaPipe: https://github.com/google-ai-edge/mediapipe
- HaMeR: https://github.com/geopavlakos/hamer
- Checkpoint HaMeR: https://huggingface.co/Leo-TX/hamer
- MoGe-3 ViT-L: https://huggingface.co/Ruicheng/moge-3-vitl
- SAM 3.1: https://huggingface.co/facebook/sam3.1
- FoundationPose: https://github.com/NVlabs/FoundationPose
- MANO: https://mano.is.tue.mpg.de/
- Wan2.1-VACE-1.3B: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
