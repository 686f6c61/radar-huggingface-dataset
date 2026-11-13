# Pyassahu/nrs-large

## Resumen

`nrs-large` es una red neuronal de estimación de profundidad estéreo desarrollada por Necessity Robotics, una empresa de robótica. El modelo recibe un par de imágenes estéreo rectificadas y devuelve el mapa de disparidad de la imagen izquierda, del que se deriva profundidad métrica mediante la fórmula `depth = fx × baseline / disparity`. Está pensado como el componente "profesor" y de generación de mapas de profundidad fuera del robot dentro de la pila de software de la compañía, etiquetando footage real para el futuro modelo embarcado `nrs-edge`.

Técnicamente se basa en la arquitectura DLNR (High-Frequency Stereo Matching Network), un transformer con atención de canal para extracción de características, pirámide de correlación 1-D de cuatro niveles y un bloque de actualización iterativo tipo LSTM multinivel. El modelo tiene 57,38 millones de parámetros, opera en FP32 y realiza 32 actualizaciones iterativas en inferencia. Se distribuye bajo licencia Apache-2.0 con pesos en formato safetensors.

Su relevancia radica en su enfoque zero-shot: fue entrenado exclusivamente con pares estéreo sintéticos (WMGStereo-150k) desde inicialización aleatoria, sin pesos preentrenados, y evaluado sin ajuste fino en seis benchmarks reales. Además, el repositorio de código incluye herramientas para rectificar pares de cualquier cámara estéreo calibrada (`rig_depth.py`), lo que permite desplegarlo en configuraciones de hardware arbitrarias sin reentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DLNR (High-Frequency Stereo Matching Network): transformer con atención de canal, pirámide de correlación 1-D (4 niveles, radio 4), bloque de actualización LSTM multinivel (3 niveles de 128), refinamiento por normalización |
| Parámetros totales | 57,38 M (57.378.681) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión estéreo; entrada de cualquier tamaño, padding a múltiplo de 32) |
| Tipos de cuantización | no disponible (release en FP32; no se documentan otras precisiones) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`nrs-large.safetensors`, 236.755.204 bytes) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura DLNR publicada por David-Zhao-1997 (commit c10475f, código MIT), con la variante `reg` de correlación en PyTorch puro. La extracción de características emplea un transformer con atención de canal; la correspondencia se resuelve mediante una pirámide de correlación 1-D de cuatro niveles con radio 4, y la disparidad se refina iterativamente con un bloque de actualización tipo LSTM de tres niveles de 128 canales. En inferencia se ejecutan 32 actualizaciones iterativas. La red produce flujo óptico internamente y la disparidad se obtiene como `−flow`.

Los pesos fueron entrenados desde inicialización aleatoria (el extractor no carga pesos preentrenados) exclusivamente sobre WMGStereo-150k, un dataset de pares estéreo sintéticos, durante 200.000 pasos (checkpoint final de una ejecución de longitud fija). No se usaron los pesos originales de DLNR. El entrenamiento siguió un plan pre-registrado con una compuerta de liberación (G-TEACH) cuyos umbrales se fijaron antes del entrenamiento. La precisión de referencia es IEEE FP32 con TF32 desactivado. No se documenta uso de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas, con salida en píxeles para la imagen izquierda.
- Cálculo de profundidad métrica a partir de disparidad, focal y baseline (`depth = fx × baseline / disparity`).
- Generalización zero-shot a cámaras y escenas no vistas: entrenado solo con datos sintéticos, evaluado en seis benchmarks reales sin ajuste fino.
- Acepta imágenes de cualquier tamaño (padding a múltiplo de 32 con replicación de borde y recorte posterior).
- Soporta entradas en color RGB (0-255) y en escala de grises (se leen como tres canales iguales).
- Rectificación de pares crudos de cualquier cámara estéreo calibrada mediante `rig_depth.py` (calibración en formato `calib.json` de xclean o fichero de `cv2.stereoCalibrate` de OpenCV, modelo pinhole).
- Inferencia en CPU y CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente viso-geométrico.

## Casos de uso

- Robótica móvil y navegación: el modelo genera mapas de profundidad densos a partir del par estéreo de la cámara del robot, útiles para planificación de trayectorias y evitación de obstáculos en mapas construidos fuera del robot.
- Etiquetado de footage real para destilación: al ser el modelo "profesor" de la pila de Necessity Robotics, se usa para generar disparidad de referencia sobre la que entrenar el modelo embarcado `nrs-edge`.
- Reconstrucción 3D y fotogrametría: la profundidad métrica por píxel permite generar nubes de puntos de escenas capturadas con un rig estéreo calibrado, sin necesidad de ajuste fino por cámara.
- Despliegue en cualquier rig estéreo existente: gracias a `rig_depth.py`, un equipo con una cámara estéreo calibrada (por ejemplo, OAK-D Lite) puede obtener profundidad sin reentrenar, rectificando el par con su propia calibración.
- Inspección industrial y medición de distancias: la salida métrica en metros permite medir separaciones y volúmenes en escenas controladas donde se conoce focal y baseline.
- Investigación en visión estéreo: sirve como referencia zero-shot entrenada solo con datos sintéticos para comparar la brecha sim-to-real frente a modelos entrenados con datos reales.
- Vehículos autónomos y ADAS en prototipado: estimación de profundidad densa en tiempo de servidor para validar percepción estéreo antes de portar a hardware embarcado.

## Benchmarks y rendimiento

Resultados del autor (protocolo WMG, precisión IEEE FP32, checkpoint paso 200.000, cada benchmark puntuado una sola vez en la compuerta G-TEACH). Menor es mejor.

| Modelo | Middlebury-H bad-2 noc (%) | Middlebury 2021 bad-2 (%) | ETH3D bad-1 (%) | KITTI-12 bad-3 (%) | KITTI-15 bad-3 (%) | Booster-Q bad-2 (%) |
|---|---|---|---|---|---|---|
| **nrs-large 0.1.0** (autor) | 3,91 | 8,44 | 2,04 | 3,38 | 4,59 | 9,22 |
| DLNR desde cero en WMGStereo-150k, publicado | 3,76 | 6,72 | 2,50 | 3,30 | 4,54 | 9,09 |
| RAFT-Stereo, pesos públicos SceneFlow | 8,67 | 10,26 | 2,61 | 4,76 | 5,48 | 17,75 |

Notas: la fila de DLNR publicado corresponde a los valores del paper (arXiv 2504.16930v3, Tabla 2), no re-puntuados por el autor de `nrs-large`. La fila de RAFT-Stereo procede del arnés de evaluación propio del autor (texto truncado en la model card). El autor declara que su arnés reproduce los números publicados de RAFT-Stereo (chequeo P8, superado el 2026-11-05).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 57,38 M de parámetros en FP32 los pesos ocupan aproximadamente 230 MB, por lo que la VRAM necesaria la dominan las activaciones y el tamaño de la imagen de entrada.
- GPU recomendadas: no especificadas por el autor; el modelo corre en CPU o CUDA sin requisitos mínimos documentados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con suficiente memoria para las activaciones a la resolución de entrada; el autor no publica cifras concretas.
- Opciones de despliegue: `infer.py` (par rectificado) y `rig_depth.py` (pares crudos de rig calibrado), ambos en PyTorch sobre CPU o CUDA. No se incluye exportación a ONNX ni TensorRT en esta release.
- Latencia y throughput: no disponibles. El modelo ejecuta 32 actualizaciones iterativas en inferencia y el autor lo describe como "más grande y más lento" que el futuro `nrs-edge`, orientado a escritorio y servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento (ETH3D bad-1 / KITTI-15 bad-3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nrs-large 0.1.0 | 57,38 M | par estéreo rectificado, cualquier tamaño | 2,04 % / 4,59 % | Apache-2.0 | Hugging Face + GitHub |
| DLNR (original, WMGStereo) | no disponible | par estéreo rectificado | 2,50 % / 4,54 % | MIT (código) | GitHub del autor original |
| RAFT-Stereo (SceneFlow) | no disponible | par estéreo rectificado | 2,61 % / 5,48 % | no disponible en la información | pesos públicos |

`nrs-large` obtiene mejor precisión que DLNR publicado en ETH3D y Middlebury-H, y peor en Middlebury 2021 y Booster-Q. Frente a RAFT-Stereo mejora de forma clara en todos los conjuntos reportados. No se dispone de datos de parámetros ni licencia de RAFT-Stereo en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con pares estéreo sintéticos (WMGStereo-150k): existe brecha sim-to-real, evidenciada por el peor resultado en Middlebury 2021 (8,44 %) frente a DLNR publicado (6,72 %).
- Requiere imágenes rectificadas; para pares crudos hay que usar `rig_depth.py` con calibración válida (modelo pinhole de OpenCV). Calibraciones inexactas degradan la profundidad métrica.
- Solo salida FP32: no se documentan cuantizaciones ni exportaciones ONNX/TensorRT, lo que limita el despliegue en hardware embarcado de baja potencia.
- Modelo puramente geométrico: no procesa lenguaje, no soporta tool calling ni agentes; no aplica evaluación de sesgos lingüísticos.
- Riesgo de error en regiones oclusivas, superficies sin textura, reflejos y bordes; el protocolo de evaluación usa distintas regiones (no ocluidas en Middlebury 2014, todos los píxeles en el resto).
- El arnés de evaluación del autor no es público (ficheros fijados por sha256); la reproducibilidad externa de los números depende de la documentación del protocolo.
- Licencia Apache-2.0 permite uso comercial, pero se debe respetar `NOTICE` y `ATTRIBUTION.md` por el código y datos de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: modelo recién publicado, sin validación independiente por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Pyassahu/nrs-large
- Repositorio de inferencia: https://github.com/necessityrobotics/nrs-large
- Código original DLNR (MIT): https://github.com/David-Zhao-1997/High-frequency-Stereo-Matching-Network
- Paper DLNR: arXiv 2504.16930v3
- Dataset de entrenamiento: https://huggingface.co/datasets/princeton-vl/WMGStereo
- Guía de rig estéreo arbitrario: `ANY_STEREO_RIG.md` en el repositorio de código
