# fastforks/raft-stereo

## Resumen

RAFT-Stereo es un modelo de estimación de disparidad estéreo (stereo matching) publicado originalmente por Lipson, Teed y Deng (Princeton Vision Lab) en 2021. Dada una pareja de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles de la vista izquierda, del que se puede derivar profundidad por triangulación. La arquitectura combina una pirámide de correlación 1-D "all-pairs" con actualizaciones iterativas mediante GRU multinivel (32 iteraciones), un diseño derivado de RAFT para flujo óptico adaptado al caso estéreo.

El repositorio `fastforks/raft-stereo` no aloja pesos: es únicamente una model card de un proyecto de empaquetado llamado `fastforks`, que descarga los checkpoints originales de los autores desde Dropbox y los verifica contra hashes SHA-256. Ofrece tres variantes (`eth3d`, `middlebury`, `sceneflow`) y dos backends de ejecución: `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados publicados en `fastforks/kernels`).

Su relevancia práctica está en el rendimiento: el backend `kernels` reduce el tiempo de inferencia hasta 3,8x frente al código original en fp32 y 2,7x frente al backend portable en fp16, con una reducción de memoria pico de aproximadamente 2,5x a 3x. Esto lo hace viable para visión estéreo de alta resolución en GPUs de consumo, algo que el código de referencia original no permitía con comodidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT-Stereo: extractor de features convolucional, pirámide de correlación 1-D all-pairs y GRU multinivel con 32 iteraciones de actualización |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se documenta ejecución en fp16 y fp32; el backend portable usa fp16 o fp32 donde fp16 no es soportado o no es finito) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Código MIT; licencia de pesos no declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch), descargados desde enlaces de los autores; no alojados en el repositorio |
| Entrada | Par de imágenes rectificadas izquierda/derecha, cualquier H x W >= 32, con padding a múltiplo de 32 |
| Salida | Mapa de disparidad (píxeles, vista izquierda) |
| Variantes | `raft-stereo-eth3d@1`, `raft-stereo-middlebury@1`, `raft-stereo-sceneflow@1` |
| Backends | `portable`, `kernels` |
| Librería | `fastforks` |

## Arquitectura y entrenamiento

RAFT-Stereo sigue el esquema de RAFT para flujo óptico trasladado al problema estéreo. Un extractor de características convolucional procesa ambas imágenes y construye una pirámide de correlación 1-D que captura todas las correspondencias candidatas a lo largo de la dimensión horizontal (la única con desplazamiento en un par rectificado). Un GRU multinivel itera 32 veces sobre un campo de disparidad inicial, refinándolo con contexto global y local en cada paso. Este diseño sustituye la búsqueda por coste volumétrico de los métodos clásicos y permite un refinamiento iterativo end-to-end.

Los pesos publicados se entrenaron sobre el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. Las variantes `middlebury` y `eth3d` corresponden a checkpoints afinados o entrenados con esos conjuntos respectivos. No se documentan en la información disponible detalles sobre el número exacto de tokens/píxeles de entrenamiento, la composición precisa del dataset ni si se empleó RLHF o DPO (no aplica en este dominio). La innovación técnica destacable es la pirámide de correlación 1-D, que explota la restricción geométrica del estéreo rectificado para reducir el coste computacional frente a una correlación 2-D completa.

## Capacidades

- Estimación de disparidad densa a partir de un par estéreo rectificado, con salida en píxeles de la vista izquierda.
- Derivación de profundidad por triangulación a partir del mapa de disparidad y los parámetros de calibración de la cámara.
- Refinamiento iterativo (32 iteraciones de GRU) que permite ajustar precisión frente a latencia.
- Ejecución en dos backends: `portable` (PyTorch estándar) y `kernels` (kernels CUDA optimizados).
- Soporte de resolución arbitraria desde 32x32 en adelante, con padding automático a múltiplo de 32.
- Verificación de integridad de pesos mediante SHA-256 en la descarga.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: el mapa de disparidad se convierte en profundidad y, junto con la calibración, en una nube de puntos densa para escaneo de objetos, modelado arquitectónico o digitalización.
- Robótica móvil y navegación: percepción de profundidad en tiempo real a partir de cámaras estéreo; con el backend `kernels` a 640x480 en ~58 ms (unos 17 FPS) cabe en un bucle de control de un robot de consumo.
- Vehículos autónomos y ADAS: detección de obstáculos y estimación de distancia en pares estéreo rectificados; la variante `eth3d` o `sceneflow` ofrece buen equilibrio entre precisión y generalización en escenas de exterior.
- Inspección industrial y metrología: medición de profundidad de alta resolución (hasta 12 MP procesados en ~2,1 s con `kernels`) para control de calidad dimensional.
- Realidad aumentada y captura volumétrica: generación de mapas de profundidad por fotograma para oclusión y composición; el backend portable a 1280x720 tarda ~434 ms, suficiente para captura offline o seminteractiva.
- Procesamiento por lotes de pares estéreo: con 12 MP a ~2,1 s por par en `kernels` y ~7,3 GiB de memoria pico reservada, se pueden procesar lotes en una GPU de 16 GB.
- Investigación en visión por computador: referencia reproducible para comparar métodos de stereo matching, con hashes verificados y protocolo de benchmarks documentado.

## Benchmarks y rendimiento

Precisión en datasets públicos (backend portable / kernels, mismo checkpoint que el código original):

| Variante | Dataset | bad > 1 px % / EPE (portable) | bad > 1 px % / EPE (kernels) | Nota |
|---|---|---|---|---|
| `raft-stereo-middlebury` | ETH3D two-view train | 2,77 / 0,289 | 2,79 / 0,289 | |
| `raft-stereo-middlebury` | Middlebury 2014 trainingH | 7,20 / 1,069 | 7,21 / 1,071 | Entrenado con imágenes públicas de este dataset; no es zero-shot |
| `raft-stereo-sceneflow` | ETH3D two-view train | 2,60 / 0,267 | 2,60 / 0,267 | |
| `raft-stereo-sceneflow` | Middlebury 2014 trainingH | 11,23 / 1,438 | 11,23 / 1,452 | |
| `raft-stereo-eth3d` | ETH3D two-view train | 2,60 / 0,274 | 2,61 / 0,274 | Posiblemente presente en los datos de entrenamiento |
| `raft-stereo-eth3d` | Middlebury 2014 trainingH | 12,00 / 1,635 | 11,98 / 1,635 | Posiblemente presente en los datos de entrenamiento |

Nota sobre la métrica de Middlebury: la columna indica bad > 2 px % / EPE en el caso de Middlebury 2014 trainingH, y bad > 1 px % / EPE en ETH3D.

Latencia y memoria (Middlebury 2014 half, 994x1482, RTX 5060 Ti 16 GB, sm_120):

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | vs portable | Memoria pico (MiB alloc/reserved): original | portable | kernels |
|---|---|---|---|---|---|---|---|---|---|
| `raft-stereo-eth3d` | 1774,7 | 1036,7 | 745,64 | 272,78 | 3,8x | 2,7x | 2516 / 2628 | 1388 / 1492 | 765 / 802 |

Rendimiento a tamaños fijos (tiempo ms / memoria pico allocada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `raft-stereo-eth3d` | portable | 143,6 / 320 / 376 | 433,7 / 864 / 1058 | 1036,0 / 1852 / 2258 | 6289,1 (n=3) / 10406 / 12814 |
| `raft-stereo-eth3d` | kernels | 57,8 / 201 / 214 | 166,5 / 569 / 590 | 370,4 / 1233 / 1264 | 2138,5 (n=3) / 7295 / 7436 |
| `raft-stereo-middlebury` | portable | 143,7 / 320 / 376 | 433,7 / 864 / 1058 | 1035,8 / 1852 / 2258 | 6287,7 (n=3) / 10406 / 12814 |
| `raft-stereo-middlebury` | kernels | 57,8 / 201 / 214 | 165,9 / 569 / 590 | 370,5 / 1233 / 1264 | 2139,9 (n=3) / 7295 / 7436 |
| `raft-stereo-sceneflow` | portable | 143,7 / 320 / 376 | 433,6 / 864 / 1058 | 1035,8 / 1852 / 2258 | 6286,9 (n=3) / 10406 / 12814 |
| `raft-stereo-sceneflow` | kernels | 57,6 / 201 / 214 | 166,0 / 569 / 590 | 370,4 / 1233 / 1264 | 2138,4 (n=3) / 7295 / 7436 |

Carga y primera llamada: `raft-stereo-eth3d` tarda 0,27 s en cargar (original), 0,25 s (portable) y 0,05 s (kernels, marcado con †); la primera llamada tarda 1,45 s (original), 0,75 s (portable†) y 0,27 s (kernels†) a 375x1242. Las marcas † indican condiciones especiales documentadas en el repositorio de benchmarks.

## Requisitos de hardware

- VRAM estimada: con el backend `kernels`, 1920x1080 requiere ~1,2 GiB pico asignada y ~1,26 GiB reservada; 12 MP requiere ~7,3 GiB asignada y ~7,4 GiB reservada. Con el backend `portable`, 1920x1080 requiere ~1,85 GiB asignada / ~2,26 GiB reservada; 12 MP requiere ~10,4 GiB asignada / ~12,8 GiB reservada.
- GPU recomendadas: RTX 5060 Ti 16 GB es la plataforma de referencia documentada (sm_120, torch 2.14.1+cu130). Cualquier GPU CUDA con suficiente VRAM debería funcionar; las cifras concretas de otras GPUs no están disponibles.
- Cabe en GPU de consumo: sí, con el backend `kernels` una RTX 5060 Ti de 16 GB procesa 12 MP con ~7,3 GiB pico. A 1080p basta con menos de 2 GiB.
- Opciones de despliegue: librería `fastforks` con backends `portable` (PyTorch) y `kernels` (kernels CUDA propios). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput estimados: a 640x480, ~58 ms con `kernels` (unos 17 FPS) y ~144 ms con `portable` (unos 7 FPS); a 1280x720, ~166 ms (`kernels`, unos 6 FPS) y ~434 ms (`portable`); a 1920x1080, ~370 ms (`kernels`, unos 2,7 FPS) y ~1036 ms (`portable`).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAFT-Stereo (este) | Estéreo denso, GRU iterativo | Par rectificado | Disparidad | Código MIT; pesos sin declarar | Checkpoints de autores vía Dropbox, verificados por SHA-256 |
| RAFT (flujo óptico) | Flujo óptico, GRU iterativo | Par de fotogramas | Flujo óptico | MIT (código) | Repositorio original de Princeton |
| Métodos clásicos (SGBM, etc.) | Búsqueda por coste | Par rectificado | Disparidad | Variable (OpenCV: Apache 2.0) | OpenCV, implementaciones múltiples |

No se dispone en la información proporcionada de datos comparativos de precisión o latencia frente a otros métodos estéreo modernos (por ejemplo, CREStereo, IGEV-Stereo o FoundationStereo). Cualquier comparación numérica adicional sería especulativa y no se incluye.

## Limitaciones y advertencias

- Requiere pares de imágenes rectificadas; sin rectificación previa, la salida no es válida.
- La licencia de los pesos no está declarada por los autores: el repositorio registra "MIT (asumido del código)". Antes de uso comercial conviene verificar la licencia original en el repositorio de Princeton.
- El repositorio no aloja pesos; depende de enlaces de Dropbox de los autores, lo que introduce un punto de fallo externo (mitigado por la verificación SHA-256).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de disparidad incorrecta en regiones oclusivas, superficies sin textura, reflejos y bordes, donde los métodos estéreo densos fallan sistemáticamente.
- Sesgos de dominio: los checkpoints están entrenados sobre SceneFlow y afinados sobre Middlebury/ETH3D; el rendimiento en escenas muy distintas (interiores, nocturnas, dominios médicos) puede degradarse. Los resultados en ETH3D de la variante `eth3d` pueden estar contaminados por datos de entrenamiento.
- Los resultados en Middlebury 2014 trainingH de la variante `middlebury` no son zero-shot (entrenada con imágenes públicas del dataset).
- Resolución máxima probada: 3000x4000 con el backend portable en fp16 en RTX 5060 Ti 16 GB (~10,2 GiB pico asignada, 12,5 GiB reservada). Por encima de eso no hay datos.
- Las cifras de rendimiento están medidas en una única GPU (RTX 5060 Ti 16 GB, sm_120) y con una versión concreta de torch; en otras GPUs pueden variar.
- El proyecto `fastforks` está en fase temprana (0 descargas, 0 likes en el momento de la consulta) y su API puede cambiar.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/raft-stereo
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Repositorio del proyecto fastforks: https://github.com/kleinicke/fastforks
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original de RAFT-Stereo (Princeton Vision Lab): https://github.com/princeton-vl/RAFT-Stereo
- Referencia de licencia en el repositorio original: https://github.com/princeton-vl/RAFT-Stereo/blob/6e93ed2169bd858dbb43033988563f3b0bb49506/README.md#L79
- Descarga de pesos de los autores (Dropbox): https://www.dropbox.com/scl/fi/5khx1bhz84dapi8vtwapg/models.zip?rlkey=ggddrn1du1iiq6mgc2dsdpmwi&dl=1
- Paper de RAFT-Stereo (Lipson et al., 2021): no disponible en la información proporcionada
