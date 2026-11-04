# fastforks/dlnr

## Resumen

DLNR es un modelo de *stereo matching* (estimación de disparidad) publicado por Zhao et al. en 2023, empaquetado y distribuido por el proyecto fastforks. Dado un par de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad a resolución de entrada, a partir del cual puede derivarse profundidad. Combina un extractor de características Restormer con atención por canales, una pirámide de correlación 1-D al estilo RAFT-Stereo y actualizaciones iterativas mediante LSTM de 3 niveles con refinamiento por normalización, ejecutando 10 iteraciones.

El repositorio de HuggingFace es únicamente una *model card*: no aloja pesos. fastforks descarga los pesos originales de los enlaces del autor y los verifica contra hashes SHA-256. Existen dos variantes, `dlnr-middlebury@1` y `dlnr-sceneflow@1`, entrenadas sobre Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa). El modelo se clasifica como experimental y ofrece dos backends: `portable` (PyTorch) y `kernels` (kernels CUDA propios).

Su relevancia actual es práctica: el empaquetado de fastforks reduce el tiempo de inferencia hasta 2,8 veces respecto al código original y la memoria pico hasta un 59 % en el backend `kernels`, con paridad numérica verificada frente a las salidas doradas del código original (diferencia media ≤ 0,02 px en fp16 en GPU).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red estéreo con extractor Restormer (atención por canales), pirámide de correlación 1-D estilo RAFT-Stereo y actualizaciones LSTM de 3 niveles con refinamiento por normalización (10 iteraciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W ≥ 32, con padding a múltiplo de 32) |
| Tipos de cuantización | fp32 (referencia original) y fp16 (por defecto en portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Código MIT; licencia de pesos no declarada por los autores (el empaquetado asume MIT a partir del código). Etiqueta: `mit-code-weights-unstated` |
| Formato de pesos | `.pth` (PyTorch), descargados desde los releases del autor; no se alojan en HuggingFace |

## Arquitectura y entrenamiento

DLNR sigue el esquema de matching iterativo: un extractor de características basado en Restormer con atención por canales genera representaciones de las imágenes izquierda y derecha; sobre ellas se construye una pirámide de correlación 1-D al estilo RAFT-Stereo. Un módulo de actualizaciones con LSTM de 3 niveles refina iterativamente el mapa de disparidad, con un paso final de refinamiento por normalización, a lo largo de 10 iteraciones. La salida es un mapa de disparidad en píxeles de la vista izquierda, a la resolución de entrada.

El entrenamiento utiliza el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. No se documentan en la información disponible el número de tokens, la composición detallada del dataset ni si hubo etapas de ajuste fino adicionales más allá de las dos variantes publicadas (Middlebury y SceneFlow). Tampoco se detallan innovaciones como decodificación especulativa, ya que no aplican a este tipo de modelo.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad a resolución de entrada (tensor `[H, W]` float32), apto para derivar profundidad.
- Entrada de tamaño arbitrario con H x W ≥ 32, con padding automático a múltiplo de 32.
- Dos variantes de pesos: `dlnr-middlebury` y `dlnr-sceneflow`.
- Dos backends de ejecución: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA propios: `raft`, `igev`, `cutlass_conv`, `cudnn_hacc`, `fastbb`).
- Modo `auto`, que selecciona `kernels` cuando puede ejecutarse y registra la elección; nunca hace *fallback* silencioso (lanza `BackendUnavailableError` con el motivo).
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: a partir del mapa de disparidad se puede derivar profundidad por triangulación con los parámetros de calibración de la cámara; adecuado por su salida densa a resolución completa.
- Robótica y navegación: percepción de profundidad en pares estéreo rectificados para evitar obstáculos; el backend `kernels` ofrece 52,8 ms a 640x480, compatible con bucles de control en tiempo real.
- Vehículos autónomos y ADAS: estimación de profundidad en escenas de conducción; la variante `dlnr-sceneflow` se entrenó con el subconjunto Driving de SceneFlow.
- Inspección industrial y metrología: medición de disparidad en pares estéreo calibrados de alta resolución; el modelo se ha probado hasta 1988x2880 con 10,1 GiB de memoria pico asignada.
- Realidad aumentada y captura volumétrica: generación de mapas de profundidad por fotograma para composición y oclusión; el backend `kernels` procesa 1920x1080 en 297,2 ms con 1617 MiB asignados.
- Procesamiento por lotes de alta resolución: con 12 MP (4000x3000) el backend `kernels` completa en 1775,1 ms con 8572 MiB asignados, mientras que `portable` agota memoria, lo que lo hace adecuado para pipelines offline de imágenes de gran formato.
- Investigación en *stereo matching*: reproducción de resultados con paridad verificada frente al código original (diferencia máxima ≤ 0,002 en CPU float32), útil como línea base en comparativas.

## Benchmarks y rendimiento

Rendimiento en estéreo sobre Middlebury 2014 half, 994x1482 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico original (MiB, asignada/reservada) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `dlnr-middlebury` | 977,6 | 597,7 | 398,18 | 213,87 | 2,8x | 1,9x | 3004 / 3552 | 2635 / 3142 | 1236 / 1606 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `dlnr-middlebury` | 0,83 (375x1242) | 0,63 | 0,26† | 1,71 (375x1242) | 0,40† | 0,21† |

Velocidad y memoria pico a tamaños fijos (tiempo ms / memoria asignada / reservada, MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP 4000x3000 |
|---|---|---|---|---|---|
| `dlnr-middlebury` | portable | 81,8 / 623 / 774 | 235,4 / 1651 / 2134 | 548,9 / 3617 / 4726 | OOM |
| `dlnr-middlebury` | kernels | 52,8 / 372 / 470 | 126,7 / 815 / 1070 | 297,2 / 1617 / 1958 | 1775,1 / 8572 / 12080 |
| `dlnr-sceneflow` | portable | 81,8 / 623 / 774 | 235,2 / 1651 / 2134 | 549,1 / 3617 / 4726 | OOM |
| `dlnr-sceneflow` | kernels | 52,9 / 372 / 470 | 126,8 / 815 / 1070 | 297,4 / 1617 / 1958 | 1775,1 / 8572 / 12080 |

Precisión frente al código original: en CPU float32, diferencia máxima ≤ 0,002; en GPU float16 (por defecto), diferencia media ≤ 0,02 px y p99 ≤ 0,25 px, tanto en `portable` como en `kernels`. No se han publicado resultados de benchmarks estándar de disparidad (por ejemplo, EPE en KITTI o Middlebury) en la información disponible.

## Requisitos de hardware

- Memoria pico en el backend `kernels`: 372 MiB asignados a 640x480; 815 MiB a 1280x720; 1617 MiB a 1920x1080; 8572 MiB a 12 MP (4000x3000).
- Memoria pico en el backend `portable`: 623 MiB a 640x480; 1651 MiB a 1280x720; 3617 MiB a 1920x1080; agota memoria a 12 MP.
- Tamaño máximo probado: 1988x2880 con 10,1 GiB de memoria pico asignada y 12,7 GiB reservada (portable, fp16, RTX 5060 Ti 16 GB).
- Cabe en GPU de consumo: sí, por ejemplo RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); a 640x480 y 1280x720 el consumo es inferior a 1 GiB con `kernels`.
- GPU recomendadas: no se documentan modelos concretos más allá de la RTX 5060 Ti 16 GB; el backend `kernels` requiere una GPU con arquitectura soportada (sm_120 en las pruebas) y un driver NVIDIA reciente.
- Despliegue: paquete `fastforks` (`pip install fastforks`), con `stereo.load(...)` y modos `portable`, `kernels` o `auto`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 52,8 ms a 640x480, 126,7 ms a 1280x720, 297,2 ms a 1920x1080 y 1775,1 ms a 12 MP con `kernels`; el doble aproximadamente con `portable` a resoluciones medias.
- El backend `kernels` descarga en el primer uso un kernel precompilado para la arquitectura de la GPU desde `fastforks/kernels`; si no existe, lanza `BackendUnavailableError` sin *fallback* silencioso.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Resolución máxima probada | Latencia de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DLNR (fastforks) | Estéreo denso | Restormer + pirámide de correlación 1-D + LSTM (10 iteraciones) | 1988x2880 (10,1 GiB pico) | 213,87 ms a 994x1482 (kernels) | Código MIT; pesos sin declarar | Pesos en releases del autor; empaquetado en `fastforks` |
| RAFT-Stereo | Estéreo denso | Pirámide de correlación 1-D + GRU iterativo | no disponible | no disponible | no disponible | Código y pesos públicos del autor original |
| IGEV-Stereo | Estéreo denso | Volumen de coste agrupado + iteraciones | no disponible | no disponible | no disponible | Código y pesos públicos del autor original |

La información disponible no incluye datos de rendimiento de RAFT-Stereo ni de IGEV-Stereo que permitan una comparación numérica directa; la comparativa se limita a la familia arquitectónica. No se dispone de alternativas comparables con métricas publicadas en la documentación consultada.

## Limitaciones y advertencias

- Requiere pares de imágenes rectificadas; sin rectificación previa la disparidad resultante no es válida para derivar profundidad.
- La licencia de los pesos no está declarada por los autores; el empaquetado asume MIT a partir del código, pero debe verificarse antes de cualquier uso comercial.
- El paquete se describe como de uso en investigación y clasificado como experimental; no hay garantías de estabilidad de API.
- El backend `portable` agota memoria a 12 MP (4000x3000); para resoluciones altas es necesario el backend `kernels`.
- El backend `kernels` depende de kernels precompilados por arquitectura de GPU; en arquitecturas no cubiertas falla explícitamente sin degradar a `portable`.
- La precisión en GPU fp16 presenta una diferencia media de hasta 0,02 px y p99 de hasta 0,25 px frente al código original; en aplicaciones de metrología puede requerirse fp32.
- No se documentan sesgos, comportamiento en dominios fuera de SceneFlow (por ejemplo, imágenes médicas o aéreas) ni robustez ante oclusiones o superficies sin textura.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- El repositorio de HuggingFace no contiene pesos; la disponibilidad depende de los enlaces de descarga del autor original.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/dlnr
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Repositorio del empaquetado fastforks: https://github.com/kleinicke/fastforks
- Benchmarks del empaquetado: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Configuración de modelos (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/dlnr/card.toml
- Código original (High-frequency-Stereo-Matching-Network): https://github.com/David-Zhao-1997/High-frequency-Stereo-Matching-Network
- Evidencia de licencia del autor: https://github.com/David-Zhao-1997/High-frequency-Stereo-Matching-Network/blob/c10475fe30ff198781ecc7c712c24c781ff05096/README.md#L84
- Pesos `DLNR_Middlebury.pth`: https://github.com/David-Zhao-1997/High-frequency-Stereo-Matching-Network/releases/download/v1.0.0/DLNR_Middlebury.pth
- Pesos `DLNR_SceneFlow.pth`: https://github.com/David-Zhao-1997/High-frequency-Stereo-Matching-Network/releases/download/v1.0.0/DLNR_SceneFlow.pth
