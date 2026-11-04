# fastforks/gwcnet

## Resumen

GwcNet es una red neuronal convolucional para la estimación de disparidad estéreo (stereo matching) publicada originalmente por Guo et al. en 2019 (CVPR). Este repositorio de HuggingFace, publicado por el usuario `fastforks`, no contiene pesos propios: es una model card que actúa como manifiesto de descarga, verificación por SHA-256 e integración con la librería `fastforks`, que descarga los pesos de los autores originales y los ejecuta con dos backends (`portable` en PyTorch y `kernels` con kernels optimizados).

El modelo resuelve el problema clásico de correspondencia densa entre un par de imágenes rectificadas izquierda/derecha, produciendo un mapa de disparidad en píxeles de la vista izquierda con un rango máximo de 192 píxeles. Su relevancia actual radica en que `fastforks` ofrece una implementación verificada, con paridad numérica frente al código original y con mejoras de velocidad y memoria (hasta 1,5x más rápido y menos de la mitad de memoria que el código original en fp32).

La arquitectura combina un backbone de extracción de características 2D, un volumen de coste 3D basado en correlación por grupos (group-wise correlation) y una pila de hourglasses 3D con regresión soft-argmin. Se distribuyen dos variantes entrenadas en SceneFlow: `gwcnet-g-sceneflow` y `gwcnet-gc-sceneflow`, ambas con licencia de código MIT y licencia de pesos no declarada por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con volumen de coste 3D por correlación por grupos (group-wise correlation), hourglasses 3D apilados y regresión soft-argmin |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (referencia) y fp16 (por defecto en GPU); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Código MIT; licencia de pesos no declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | Checkpoints `.ckpt` de PyTorch de los autores originales (descargados externamente, no alojados en el repo) |

## Arquitectura y entrenamiento

GwcNet sigue el paradigma de stereo matching denso en dos etapas. Primero, un extractor de características 2D compartido procesa las imágenes izquierda y derecha; después se construye un volumen de coste 3D mediante correlación por grupos, que divide los canales de características en grupos y calcula la correlación entre cada par de grupos a lo largo de las hipótesis de disparidad. Este volumen se refina con una pila de hourglasses 3D (convoluciones 3D codificador-decodificador) y se obtiene la disparidad final mediante regresión soft-argmin sobre la dimensión de disparidad, con un máximo de 192 píxeles.

El entrenamiento se realizó sobre el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. No se documenta en la información disponible el número de tokens ni de iteraciones, ni si hubo técnicas de refinamiento posteriores como fine-tuning con KITTI (de hecho, los pesos fine-tuned de KITTI 2012/2015 de los autores originales no están incluidos en esta integración). La innovación técnica destacable es la correlación por grupos, que reduce el coste computacional del volumen 3D frente a la concatenación completa de características, manteniendo precisión.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de un mapa de disparidad en píxeles de la vista izquierda, a la resolución de entrada.
- Soporte de entradas de cualquier tamaño H x W mayor o igual a 32, con padding a múltiplo de 32.
- Ejecución en dos backends: `portable` (PyTorch puro, fp16 en GPU o fp32 en CPU) y `kernels` (kernels optimizados, con mayor velocidad y menor memoria).
- Verificación de integridad de pesos mediante SHA-256 contra los ficheros de los autores.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de visión por computador.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: a partir del mapa de disparidad y de los parámetros de calibración de la cámara estéreo se puede triangular la profundidad por píxel; el modelo es adecuado porque produce disparidad densa a resolución completa, lo que permite generar nubes de puntos densas en escenas de interior y exterior.
- Robótica móvil y navegación: un par estéreo montado en un robot puede alimentar al modelo para obtener profundidad en tiempo real; con 50,9 ms a 640x480 en el backend `kernels` sobre una RTX 5060 Ti, es viable en bucles de control a decenas de hercios en resoluciones moderadas.
- Vehículos autónomos y ADAS: percepción de obstáculos y estimación de distancia a objetos mediante disparidad; el modelo está entrenado en SceneFlow (incluye Driving), lo que le da exposición a escenas de conducción, aunque sin fine-tuning específico de KITTI.
- Inspección industrial y metrología: medición de profundidad de piezas y superficies con un rig estéreo calibrado; la salida a resolución de entrada y la paridad numérica con el código original (max |diff| <= 0,002 en CPU fp32) permiten usarlo como referencia reproducible.
- Captura de movimiento y efectos visuales: generación de mapas de profundidad por fotograma para composición y rotoscopia; el soporte de resoluciones de hasta 3000x4000 (13,3 GiB de pico en `gwcnet-g-sceneflow` con el backend `portable`) permite trabajar con material de alta resolución.
- Investigación en stereo matching: banco de pruebas reproducible para comparar backends y precisión, con resultados publicados en ETH3D y Middlebury 2014 y con verificación de paridad frente al código original en un commit fijado.
- Prototipado y docencia: la API `stereo.load("gwcnet-g-sceneflow")` y la llamada `model("left.png", "right.png")` permiten obtener un mapa de disparidad con pocas líneas de código, lo que facilita experimentos y demostraciones.

## Benchmarks y rendimiento

Precisión en datasets públicos (medida el 2026-10-27 en una RTX 5060 Ti, torch 2.14.1+cu130):

| Variante | Dataset | Backend | bad > 1 px % / EPE | bad > 2 px % / EPE |
|---|---|---|---|---|
| `gwcnet-gc-sceneflow` | ETH3D two-view train | portable | 10,95 / 1,787 | no disponible |
| `gwcnet-gc-sceneflow` | ETH3D two-view train | kernels | 10,96 / 1,793 | no disponible |
| `gwcnet-gc-sceneflow` | Middlebury 2014 trainingH | portable | no disponible | 25,63 / 6,968 |
| `gwcnet-gc-sceneflow` | Middlebury 2014 trainingH | kernels | no disponible | 25,63 / 6,974 |
| `gwcnet-g-sceneflow` | ETH3D two-view train | portable | 9,60 / 0,624 | no disponible |
| `gwcnet-g-sceneflow` | ETH3D two-view train | kernels | 9,59 / 0,621 | no disponible |
| `gwcnet-g-sceneflow` | Middlebury 2014 trainingH | portable | no disponible | 25,84 / 6,713 |
| `gwcnet-g-sceneflow` | Middlebury 2014 trainingH | kernels | no disponible | 25,84 / 6,713 |

Velocidad y memoria en Middlebury 2014 half (994x1482):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB alloc/reserved) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `gwcnet-g-sceneflow` | 604,3 | 352,4 | 344,24 | 238,13 | 1,5x | 5105 / 5414 | 2081 / 2402 | 1799 / 2102 |
| `gwcnet-gc-sceneflow` | 631,8 | 364,8 | 352,89 | 257,33 | 1,4x | 5887 / 6214 | 2082 / 2402 | 1768 / 1962 |

Rendimiento a tamaños fijos (tiempo ms / memoria pico allocada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `gwcnet-g-sceneflow` | portable | 69,2 / 418 / 586 | 219,1 / 1254 / 1776 | 502,0 / 2764 / 3874 | 2911,8 / 13647 / 15104 |
| `gwcnet-g-sceneflow` | kernels | 50,9 / 393 / 526 | 156,0 / 1112 / 1590 | 358,5 / 2412 / 3464 | OOM |
| `gwcnet-gc-sceneflow` | portable | 71,2 / 418 / 442 | 224,5 / 1255 / 1688 | 514,1 / 2766 / 3680 | 2981,7 / 13924 / 14002 |
| `gwcnet-gc-sceneflow` | kernels | 54,9 / 394 / 468 | 167,5 / 1114 / 1534 | 385,9 / 2415 / 3300 | OOM |

Paridad con el código original: en CPU con float32, la diferencia máxima absoluta es menor o igual a 0,002; en GPU con float16, la diferencia media es menor o igual a 0,05 px y el p99 menor o igual a 0,5 px.

## Requisitos de hardware

- VRAM estimada: 418 MiB (640x480) a 13,6 GiB (4000x3000) en el backend `portable`; el backend `kernels` agota la memoria (OOM) a 12 MP en una GPU de 16 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks, sm_120); cualquier GPU NVIDIA con al menos 16 GB para resoluciones altas, y GPUs de 8 GB para resoluciones de hasta 1080p con margen.
- Cabe en GPU de consumo: sí, en resoluciones de hasta 1920x1080 con aproximadamente 2,5-3,9 GiB de memoria pico; para 12 MP se necesita una GPU de 16 GB o más con el backend `portable`.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 50,9 ms por par a 640x480, 156,0 ms a 1280x720 y 358,5 ms a 1920x1080 con el backend `kernels` en una RTX 5060 Ti; el arranque del modelo tarda entre 0,14 y 0,44 s según backend y variante.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Precisión destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GwcNet (este repo) | CNN estéreo con volumen de coste 3D | Cualquier H x W >= 32, probado hasta 3000x4000 | ETH3D bad > 1 px: 9,60 % (g), 10,95 % (gc) | Código MIT, pesos no declarados | HuggingFace (model card) + descarga externa |
| PSMNet | CNN estéreo con volumen de coste 3D y hourglasses | Resoluciones variables | no disponible en esta información | no disponible | Repo original |
| RAFT-Stereo | Red recurrente para flujo óptico estéreo | Resoluciones variables | no disponible en esta información | no disponible | Repo original |
| CREStereo | Red en cascada con refinamiento | Resoluciones variables | no disponible en esta información | no disponible | Repo original |

No se dispone de datos comparativos de rendimiento de PSMNet, RAFT-Stereo o CREStereo en la información proporcionada; la comparativa se limita a la categoría y a la disponibilidad.

## Limitaciones y advertencias

- Los pesos fine-tuned de KITTI 2012/2015 de los autores originales no están incluidos; solo se ofrecen las variantes entrenadas en SceneFlow.
- Las convoluciones 3D dominantes se ejecutan en cuDNN en ambos backends, por lo que la ganancia de `kernels` sobre `portable` es menor que en otros modelos estéreo.
- El backend `portable` es ligeramente más lento que el código original a 994x1482, aunque asigna menos de la mitad de memoria.
- El backend `kernels` produce OOM a 12 MP (4000x3000) en una GPU de 16 GB.
- La licencia de los pesos no está declarada explícitamente por los autores; el repo asume MIT a partir de la licencia del código, lo que debe verificarse antes de un uso comercial.
- El modelo requiere imágenes rectificadas y calibradas; no realiza rectificación ni calibración por sí mismo.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling, agentes ni multilingüismo.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir disparidades erróneas en regiones ocluidas, sin textura o con reflejos, como cualquier método estéreo.
- No se documentan sesgos demográficos ni de otro tipo, pero el entrenamiento en SceneFlow (sintético y de conducción) puede limitar la generalización a dominios muy distintos.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/gwcnet
- Repositorio de código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de GwcNet (commit 0987074f48b0): https://github.com/xy-guo/GwcNet
- Evidencia de licencia (README original, línea 27): https://github.com/xy-guo/GwcNet/blob/0987074f48b098c6e975a58ca5aacf233b0fb0eb/README.md#L27
- Benchmark y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `gwcnet-g-sceneflow` (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1qiOTocPfLaK9effrLmBadqNtBKT4QX4S
- Pesos `gwcnet-gc-sceneflow` (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1qiOTocPfLaK9effrLmBadqNtBKT4QX4S
