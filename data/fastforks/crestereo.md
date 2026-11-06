# fastforks/crestereo

## Resumen

CREStereo es un modelo de correspondencia estéreo (stereo matching) publicado originalmente por Megvii Research (Li et al., 2022) que estima un mapa de disparidad a partir de un par de imágenes rectificadas izquierda/derecha. Esta ficha corresponde al repositorio `fastforks/crestereo`, una tarjeta de modelo que no aloja pesos: actúa como manifiesto para que la librería `fastforks` descargue los pesos de los autores originales y los verifique mediante SHA-256. El modelo emplea una arquitectura de emparejamiento estéreo en cascada con correlación de grupo adaptativa y refinamiento recurrente mediante GRU.

El problema que resuelve es la estimación de profundidad densa por visión estéreo, una tarea fundamental en robótica, conducción autónoma, reconstrucción 3D y realidad aumentada. CREStereo destaca por manejar pares de imágenes de alta resolución (probado hasta 3000x4000 píxeles) y por su esquema de búsqueda local adaptativa que mejora la precisión en regiones con oclusiones y texturas repetitivas. La variante publicada aquí, `crestereo-eth3d@1`, corresponde al checkpoint entrenado con ETH3D.

La relevancia actual de este repositorio radica en su implementación optimizada: la librería `fastforks` ofrece dos backends (`portable` en PyTorch puro y `kernels` con kernels CUDA especializados) que aceleran la inferencia hasta 8,4 veces respecto al código original, reduciendo el tiempo de 1925 ms a 229 ms en una imagen de 994x1482 píxeles. El modelo está marcado como "experimental" por el propio autor del fork.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CREStereo: cascada recurrente con correlación de grupo adaptativa (búsqueda local 2-D/1-D, offsets aprendidos, cross attention a 1/16), cascada GRU 1/16 -> 1/8 -> 1/4, dos pasadas (mitad y resolución completa) de 20 iteraciones cada una |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otros formatos |
| Idiomas soportados | no aplica (modelo de visión estéreo) |
| Licencia | Código: Apache-2.0; pesos: no declarada por los autores (el fork asume Apache-2.0 desde el código) |
| Formato de pesos | `.mge` (fichero de pesos de los autores, descargado externamente y verificado por SHA-256) |

## Arquitectura y entrenamiento

CREStereo es una red neuronal convolucional con refinamiento recurrente. La arquitectura combina una extracción de características en dos ramas (izquierda y derecha), una capa de correlación de grupo adaptativa que realiza búsqueda local 2-D y 1-D con offsets aprendidos y cross attention a resolución 1/16, y una cascada de unidades GRU que refina el mapa de disparidad de forma progresiva a resoluciones 1/16, 1/8 y 1/4. Finalmente, se ejecutan dos pasadas de 20 iteraciones cada una: primero a media resolución y después a resolución completa, lo que permite capturar estructuras finas sin un coste computacional prohibitivo.

El entrenamiento utilizó, según el README original de los autores, el dataset sintético de CREStereo (Megvii), Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), MPI Sintel stereo, Middlebury stereo (2014), ETH3D two-view stereo, KITTI stereo 2012/2015, NVIDIA Falling Things (FAT), InStereo2K y HR-VS (high-resolution virtual stereo). La tarjeta advierte que no se especifica qué subconjunto exacto de estos datasets vio el checkpoint liberado. No se documenta el uso de RLHF ni DPO, al no tratarse de un modelo generativo de lenguaje. La innovación técnica principal es la búsqueda local adaptativa con offsets aprendidos, que sustituye la búsqueda global costosa por una búsqueda guiada en regiones relevantes.

## Capacidades

- Estimación de disparidad densa a partir de un par de imágenes estéreo rectificadas (izquierda/derecha), devolviendo un tensor `[H, W]` en float32 a la resolución de entrada.
- Manejo de imágenes de alta resolución: entrada de cualquier tamaño H x W >= 33, con padding a múltiplo de 32; probado hasta 3000x4000 píxeles.
- Dos backends de ejecución: `portable` (PyTorch puro, funciona en GPU y CPU) y `kernels` (kernels CUDA optimizados).
- Verificación de integridad de pesos mediante SHA-256 contra los ficheros originales de los autores.
- Paridad numérica con el código original: en CPU float32, diferencia máxima <= 0.002; en GPU float16, diferencia media <= 0.02 px y p99 <= 0.25 px.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del emparejamiento estéreo.

## Casos de uso

- Reconstrucción 3D en robótica: a partir de un par estéreo calibrado, el modelo genera un mapa de disparidad que se convierte en nube de puntos para navegación y evitación de obstáculos; su capacidad de procesar imágenes de alta resolución resulta útil en plataformas con cámaras de gran angular.
- Conducción autónoma y ADAS: estimación de profundidad densa en tiempo real con el backend `kernels` (311 ms en 1920x1080), adecuada para percepción de entorno en vehículos con GPU a bordo.
- Inspección industrial y metrología: medición de distancias y volúmenes mediante visión estéreo en líneas de producción, aprovechando la precisión subpíxel (EPE de 0.184 en ETH3D) para control de calidad.
- Realidad aumentada y captura volumétrica: generación de mapas de profundidad por fotograma para anclar objetos virtuales sobre superficies reales, con la ventaja de procesar pares de hasta 12 MP en 1,77 s con el backend `kernels`.
- Drones y vehículos no tripulados: estimación de profundidad en pares estéreo de alta resolución para planificación de trayectorias y aterrizaje, donde el bajo consumo de memoria (6,4 GiB en 12 MP con `kernels`) permite su despliegue en GPUs de gama media.
- Investigación en visión por computador: reproducción de resultados de CREStereo con verificación de pesos y paridad numérica frente al código original, útil para comparativas y estudios de ablación.
- Digitalización de escenas y patrimonio: reconstrucción densa de superficies a partir de pares estéreo de alta resolución capturados con cámaras calibradas, gracias al soporte de imágenes de hasta 3000x4000.

## Benchmarks y rendimiento

Precisión en datasets públicos (original = código de los autores, mismo checkpoint y protocolo):

| Variante | Dataset | Original (bad > 1/2 px % / EPE) | Portable | Kernels | Nota |
|---|---|---|---|---|---|
| `crestereo-eth3d` | ETH3D two-view train | 1.40 / 0.185 | 1.39 / 0.184 | 1.38 / 0.184 | Entrenado con imágenes públicas de este dataset; no es zero-shot |
| `crestereo-eth3d` | Middlebury 2014 trainingH | 5.16 / 0.753 | 4.84 / 0.699 | 4.86 / 0.699 | Entrenado con imágenes públicas de este dataset; no es zero-shot |

Velocidad y memoria en Middlebury 2014 half, 994x1482 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `crestereo-eth3d` | 1925.0 | 731.79 | 228.95 | 8,4x | 884 / 1030 | 644 / 732 |

Rendimiento a tamaños fijos (tiempo ms / memoria pico allocada / reservada en MiB):

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| Portable | 142,5 / 214 / 284 | 427,8 / 556 / 740 | 1022,9 / 1172 / 1568 | 6466,7 (n=3) / 6508 / 8990 |
| Kernels | 61,8 / 216 / 292 | 145,2 / 552 / 792 | 311,2 / 1162 / 1638 | 1767,7 / 6427 / 9362 |

Carga y primera llamada: 0,03 s de carga (ambos backends); primera llamada de 0,75 s (portable) y 0,23 s (kernels).

## Requisitos de hardware

- VRAM estimada: 284 MiB (reservada) a 640x480 en modo portable; 8990 MiB a 12 MP en portable y 9362 MiB en kernels. Para 1920x1080, en torno a 1,5-1,6 GiB reservados.
- GPU recomendadas: RTX 5060 Ti 16 GB es la hardware de referencia de los benchmarks; cualquier GPU NVIDIA con soporte CUDA y al menos 8-16 GB de VRAM para resoluciones altas. Para 12 MP se recomienda 12 GB o más.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más para resoluciones de hasta 1080p; para 12 MP se necesitan al menos 10-12 GB.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con backends `portable` (PyTorch) y `kernels` (CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 61,8 ms por par a 640x480 con kernels (aproximadamente 16 pares/s); 311,2 ms a 1920x1080 (aproximadamente 3,2 pares/s); 1767,7 ms a 12 MP (aproximadamente 0,57 pares/s) en RTX 5060 Ti 16 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Precisión ETH3D (bad > 1 px %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CREStereo (fastforks, `crestereo-eth3d`) | Estéreo con cascada GRU | no disponible | Cualquier H x W >= 33, múltiplo de 32; probado hasta 3000x4000 | 1,38-1,40 | Código Apache-2.0; pesos sin declarar | Hugging Face (tarjeta) y GitHub |
| CREStereo original (Megvii) | Estéreo con cascada GRU | no disponible | Igual que el anterior | 1,40 (referencia) | Código Apache-2.0; pesos sin declarar | GitHub original |
| RAFT-Stereo | Estéreo recurrente con correlación | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |
| STTR | Estéreo con transformer | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

No se dispone de datos de benchmarks de RAFT-Stereo ni STTR en la información proporcionada, por lo que la comparativa cuantitativa queda limitada al CREStereo original.

## Limitaciones y advertencias

- La salida en CUDA (float16, kernels, o float32 con convoluciones TF32 por defecto de PyTorch) difiere de la CPU en aproximadamente 0,1-0,2 px de media y 3 px en p99 a 720x1280; con float32 completo la diferencia baja a 0,03 px. El redondeo se amplifica por las 2 x 20 iteraciones de GRU.
- La precisión en Middlebury difiere del código original (aproximadamente -0,3 bad-%), porque la ejecución original aplicaba un padding distinto.
- Los resultados en ETH3D y Middlebury no son zero-shot: el checkpoint fue entrenado con imágenes públicas de esos datasets, por lo que pueden sobreestimar el rendimiento en dominios no vistos.
- La licencia de los pesos no está declarada por los autores; el fork asume Apache-2.0 a partir del código, pero el uso comercial de los pesos queda en una zona gris que conviene verificar antes de producción.
- El modelo está marcado como "experimental" por el autor del fork; no se garantiza estabilidad de API ni de resultados entre versiones.
- Requiere pares de imágenes rectificadas y calibradas; no realiza rectificación ni calibración por sí mismo.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento multi-paso.
- El repositorio no aloja pesos: depende de enlaces externos de Google Drive para la descarga, lo que puede afectar a la reproducibilidad y a la disponibilidad a largo plazo.
- No se documentan sesgos demográficos ni de otro tipo, al no procesar datos personales directamente, pero los mapas de disparidad pueden fallar en superficies sin textura, transparentes o reflectantes.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/crestereo
- Repositorio del fork: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de CREStereo: https://github.com/megvii-research/CREStereo
- Commit fijado del código original: https://github.com/megvii-research/CREStereo/tree/ad3a1613bdedd88b93247e5f002cb7c80799762d
- Evidencia de licencia (README original): https://github.com/megvii-research/CREStereo/blob/ad3a1613bdedd88b93247e5f002cb7c80799762d/README.md#L82
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de la tarjeta (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/crestereo/card.toml
- Pesos `crestereo_eth3d.mge` (Google Drive): https://drive.usercontent.google.com/download?id=1Wx_-zDQh7BUFBmN9im_26DFpnf3AkXj4&export=download&confirm=t
