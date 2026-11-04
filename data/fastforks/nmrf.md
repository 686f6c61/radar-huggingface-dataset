# fastforks/nmrf

## Resumen

NMRF (Neural Markov Random Field) es un modelo de estimación de disparidad estéreo presentado por Guan et al. en 2024. Resuelve el problema de *stereo matching*: a partir de un par de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad por píxel en la vista izquierda, que puede convertirse en profundidad con los parámetros de calibración de la cámara. Su planteamiento combina un campo aleatorio de Markov neuronal con propuestas de disparidad extraídas de un *cost volume* agrupado, propagación de etiquetas mediante CSWin y una etapa de refinamiento a 1/4 de resolución.

El repositorio `fastforks/nmrf` no contiene pesos propios: es una *model card* de integración que describe cómo la librería `fastforks` descarga los pesos de los autores originales y los verifica mediante SHA-256. Ofrece dos backends de ejecución, `portable` (PyTorch puro) y `kernels` (kernels CUDA propios, `fastbb`), con el objetivo de acelerar la inferencia y reducir el pico de memoria respecto al código original.

Es relevante para quienes necesitan un estimador de disparidad estéreo de alta resolución con precisión cercana a la implementación de referencia, pero con mejor rendimiento y una API unificada. La variante publicada, `nmrf-sceneflow`, está entrenada sobre el dataset sintético Freiburg SceneFlow. El modelo se marca como *experimental* y su licencia de pesos no está declarada explícitamente por los autores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Neural Markov Random Field con *group-wise cost volume*, propagación de etiquetas CSWin y *window-attention* a 1/8 de resolución con refinamiento a 1/4 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión estéreo; entrada de cualquier H x W >= 9, con padding a múltiplo de 8) |
| Tipos de cuantización | no disponible (inferencia en fp32 y fp16; no se documentan cuantizaciones enteras) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Código MIT; licencia de pesos no declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch), descargados desde enlace del autor, no alojados en el repo |

## Arquitectura y entrenamiento

NMRF formula el *stereo matching* como la inferencia en un campo aleatorio de Markov neuronal. Primero construye un *cost volume* agrupado (*group-wise*) a partir de características extraídas de ambas imágenes; a continuación genera propuestas de disparidad y las propaga mediante un esquema CSWin de propagación de etiquetas (*label-seed propagation*). La inferencia se realiza con *window-attention* a 1/8 de resolución y una etapa posterior de refinamiento a 1/4 de resolución, lo que reduce el coste computacional frente a operar a resolución completa.

El modelo se entrena sobre el dataset sintético Freiburg SceneFlow, que agrupa FlyingThings3D, Driving y Monkaa. No se documenta en la información disponible el número de tokens o muestras, la composición exacta del dataset ni si se emplearon etapas de RLHF o DPO (no aplicables en un modelo de visión de este tipo). La innovación técnica destacable es la combinación de propuestas de disparidad con propagación de etiquetas y atención por ventanas, junto con los kernels CUDA `fastbb` de la integración `fastforks`, que aceleran la inferencia y reducen la memoria pico.

## Capacidades

- Estimación de disparidad estéreo densa: recibe un par de imágenes rectificadas izquierda/derecha y devuelve un mapa de disparidad `[H, W]` en float32 a la resolución de entrada.
- Estimación de profundidad indirecta: el mapa de disparidad puede convertirse en profundidad usando la línea base y la distancia focal de la cámara.
- Entrada de tamaño arbitrario: cualquier H x W >= 9, con padding a múltiplo de 8; probado hasta 3000x4000 en el backend portable con fp16.
- Doble backend de ejecución: `portable` (PyTorch puro, GPU o CPU) y `kernels` (kernels CUDA `fastbb`, requiere arquitectura precompilada y driver NVIDIA reciente).
- Precisión configurable: fp32 en CPU y fp16 por defecto en GPU.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D a partir de pares estéreo: el mapa de disparidad se convierte en nube de puntos mediante la calibración de la cámara; adecuado para escenas sintéticas o con dominios próximos a SceneFlow.
- Robótica móvil y navegación: percepción de profundidad en tiempo casi real (31,7 ms a 640x480 con el backend `kernels` en RTX 5060 Ti) para evitar obstáculos.
- Vehículos autónomos y ADAS: estimación de distancia a objetos en pares estéreo rectificados; el modelo está entrenado en Driving, lo que ayuda en escenas de conducción.
- Drones y fotogrametría: procesamiento de pares de alta resolución (hasta 12 MP en 1834 ms con `kernels`) para generar mapas de profundidad en postproceso.
- Investigación en *stereo matching*: referencia reproducible con paridad verificada frente al código original (max |diff| <= 0.05 en CPU fp32; media <= 0.05 px y p99 <= 0.5 px en GPU fp16), útil para comparar nuevos métodos.
- Prototipado en visión por computador: API de una línea (`stereo.load("nmrf-sceneflow")`) para integrar estimación de disparidad en pipelines de PyTorch sin gestionar pesos ni kernels manualmente.
- Realidad aumentada y captura volumétrica: generación de mapas de profundidad por fotograma en pares estéreo de gama alta, con gestión explícita del pico de memoria (7,5-11 GiB a 12 MP).

## Benchmarks y rendimiento

Rendimiento medido en Middlebury 2014 *half* (994x1482), RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | vs portable | Memoria pico original (MiB, alloc/reserved) | Portable | Kernels |
|---|---|---|---|---|---|---|---|---|---|
| `nmrf-sceneflow` | 445,3 | 312,6 | 216,44 | 195,66 | 1,6x | 1,1x | 1656 / 2054 | 1510 / 1552 | 1022 / 1112 |

Velocidad y memoria pico a tamaños fijos (tiempo ms / alloc / reserved MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `nmrf-sceneflow` | portable | 35,9 / 390 / 454 | 124,3 / 953 / 1094 | 315,1 / 2040 / 2402 | 2021,2 (n=3) / 11263 / 13666 |
| `nmrf-sceneflow` | kernels | 31,7 / 247 / 298 | 112,1 / 626 / 800 | 286,8 / 1356 / 1814 | 1834,3 / 7543 / 10866 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Portable (s) | Kernels (s) | Primera llamada original (s) | Portable (s) | Kernels (s) |
|---|---|---|---|---|---|---|
| `nmrf-sceneflow` | 0,21 (375x1242) | 0,10 | 0,07 | 0,77 (375x1242) | 0,22 | 0,20 |

No se han publicado resultados de benchmarks de precisión estándar (EPE, D1, etc.) sobre datasets como KITTI o Middlebury en la información disponible. Solo se documenta la paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada: desde ~0,3 GiB a 640x480 (kernels) hasta ~10,6 GiB reservados a 12 MP (kernels); ~13,3 GiB reservados en el caso probado de 3000x4000 con portable fp16.
- GPU recomendadas: NVIDIA con soporte CUDA; el backend `kernels` requiere una arquitectura precompilada (probado en sm_120, RTX 5060 Ti 16 GB). Para el backend `portable` sirve cualquier GPU con suficiente VRAM, o CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 8-16 GiB para resoluciones hasta 1080p; a 12 MP se recomienda 16 GiB o más.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`), backends `portable` y `kernels`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 31,7 ms a 640x480, 112,1 ms a 1280x720, 286,8 ms a 1920x1080 y 1834,3 ms a 12 MP con `kernels`; el backend `portable` es entre un 10 % y un 20 % más lento según resolución.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de *stereo matching* (por ejemplo, RAFT-Stereo, CREStereo, IGEV-Stereo o FoundationStereo) para establecer una comparativa con cifras verificables. La única comparación documentada es interna: NMRF frente a su propia implementación original en fp32, con una aceleración de 1,6x con kernels y 1,4x con portable en Middlebury 2014 half (994x1482).

| Aspecto | NMRF (`fastforks`) | Implementación original (Guan et al.) |
|---|---|---|
| Tiempo 994x1482 | 195,66 ms (kernels) / 216,44 ms (portable) | 445,3 ms (fp32) |
| Memoria pico 994x1482 | 1022 / 1112 MiB (kernels) | 1656 / 2054 MiB |
| Licencia de pesos | no declarada | no declarada |
| Formato | `.pth` vía `fastforks` | `.pth` |

## Limitaciones y advertencias

- Modelo marcado como *experimental* por el propio autor de la integración; no debe asumirse estabilidad de API ni de resultados en producción.
- Entrenado únicamente con datos sintéticos de Freiburg SceneFlow; el rendimiento en dominios reales (KITTI, Middlebury, escenas interiores) no está cuantificado y puede degradarse por el *domain gap*.
- Licencia de pesos no declarada por los autores: la licencia MIT se asume a partir del código, pero no está confirmada para los pesos; verificar antes de cualquier uso comercial.
- El backend `kernels` requiere una arquitectura de GPU precompilada y un driver NVIDIA reciente; si no hay kernel disponible lanza `BackendUnavailableError` sin *fallback* silencioso.
- El pico de memoria crece de forma aproximadamente cuadrática con la resolución: a 12 MP puede superar los 10 GiB reservados, lo que limita su uso en GPUs de consumo pequeñas.
- Riesgo de artefactos en regiones ocluidas, texturas repetitivas o superficies sin textura, inherente al *stereo matching*; no se documentan métricas de error en esos casos.
- No aplica sesgo lingüístico ni alucinación textual, pero sí posibles sesgos de dominio derivados del dataset sintético de entrenamiento.
- La paridad con el código original está garantizada numéricamente (max |diff| <= 0,05 en CPU fp32), lo que acota el riesgo de regresión respecto a la referencia.

## Enlaces

- Model card en HuggingFace: <https://huggingface.co/fastforks/nmrf>
- Repositorio de la integración `fastforks`: <https://github.com/kleinicke/fastforks>
- Kernels CUDA `fastbb`: <https://huggingface.co/fastforks/kernels>
- Código original de NMRF: <https://github.com/aeolusguan/NMRF> (commit `a50bd8f407ae`)
- Evidencia de licencia (README original): <https://github.com/aeolusguan/NMRF/blob/a50bd8f407ae481c38f95cf141e1b5256e962cb7/README.md#L103>
- Documentación de benchmarks: <https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md>
- Pesos `sceneflow.pth` (enlace del autor): <https://drive.usercontent.google.com/download?export=download&confirm=t&id=1VI-vyMIeNs_jMD6TVTNqFl70nQVgMSIR>
