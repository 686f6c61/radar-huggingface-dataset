# fastforks/hitnet

## Resumen

HITNet es un modelo de estimación de disparidad estéreo (stereo matching) publicado originalmente por Tankovich et al. en 2021. Dada una pareja de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles desde la vista izquierda, del cual se puede derivar profundidad. La innovación central es la propagación y refinamiento de hipótesis de superficies inclinadas (slanted tile hypotheses) de grueso a fino, lo que evita costosos volúmenes de coste 3D y permite resoluciones altas con memoria contenida.

Este repositorio, `fastforks/hitnet`, no contiene pesos: es una model card que documenta cómo el paquete `fastforks` descarga los checkpoints originales de Google Research (alojados en el espejo PINTO model-zoo) y los valida mediante SHA-256. Ofrece dos variantes: `hitnet-eth3d@1` (gris, disparidad máxima 128) y `hitnet-middlebury-d400@1` (media resolución, disparidad máxima 400).

Es relevante para desarrolladores que necesitan reconstrucción 3D o profundidad densa en pipelines de visión por computador, con dos backends (`portable` y `kernels`) y benchmarks reproducibles en GPU consumer. El código es Apache-2.0; la licencia de los pesos no está declarada por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HITNet (propagación jerárquica de hipótesis de tiles inclinados; red convolucional con refinamiento grueso-a-fino) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 8, redimensionada o con padding interna) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | Código Apache-2.0; pesos sin licencia declarada por los autores (la card asume Apache-2.0) |
| Formato de pesos | Grafos TensorFlow congelados (`.pb`), leídos sin TensorFlow por `fastforks` |

## Arquitectura y entrenamiento

HITNet sigue una arquitectura de matching estéreo jerárquica: en cada nivel de resolución se generan hipótesis locales de disparidad modeladas como tiles inclinados (cada tile tiene una disparidad y una pendiente), que se propagan y refinan de grueso a fino. Esto sustituye los volúmenes de coste 3D densos por una representación mucho más compacta, lo que reduce el consumo de memoria y permite procesar imágenes de hasta 12 MP (4000x3000) en una GPU de 16 GB.

Los pesos son los grafos TensorFlow congelados de los autores en el commit `f200f2b89d29` de `google-research`. La variante `hitnet-eth3d` se entrena con imágenes públicas de ETH3D (gris, disparidad máxima 128) y `hitnet-middlebury-d400` con Middlebury a media resolución (disparidad máxima 400); los autores no declaran la composición exacta del dataset de entrenamiento. No se documenta RLHF ni ajuste por preferencias, al no tratarse de un modelo generativo.

## Capacidades

- Estimación de disparidad estéreo densa a partir de una pareja de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad en píxeles desde la vista izquierda, convertible a profundidad con los parámetros de calibración.
- Dos variantes especializadas: ETH3D (gris, disparidad máxima 128) y Middlebury (media resolución, disparidad máxima 400).
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (kernels CUDA optimizados, entre 2,9x y 3,3x más rápidos).
- Entrada de cualquier tamaño H x W >= 8, con redimensionado o padding interno.
- Ejecución en CPU (float32) y GPU (float16 por defecto, float32 opcional).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: a partir del mapa de disparidad y la calibración de la cámara se obtiene profundidad densa para fotogrametría, escaneo de objetos o gemelos digitales; la variante ETH3D está pensada para escenas exteriores.
- Robótica móvil y navegación: un par estéreo rectificado alimenta el modelo a 640x480 en 5,2 ms con el backend `kernels`, suficiente para percepción de obstáculos en tiempo real en un robot con GPU embebida.
- Vehículos autónomos y ADAS: la variante Middlebury d400 cubre disparidades de hasta 400 píxeles, útil para escenas con objetos cercanos; el procesado a 1280x720 en 33,1 ms permite ciclos de percepción de decenas de hercios.
- Inspección industrial y metrología: con 12 MP procesados en 181,7 ms (backend `kernels`), se puede medir profundidad de piezas en cadenas de inspección de alta resolución.
- Realidad aumentada y captura volumétrica: la salida de disparidad a resolución completa permite oclusión y colocación de objetos virtuales coherentes con la escena.
- Procesado por lotes en servidor: el backend `portable` en fp16 mantiene el pico de memoria en 860 MiB a 994x1482, lo que permite ejecutar varias instancias por GPU en pipelines de datos.
- Investigación en visión estéreo: la paridad verificada con el código original (max |diff| <= 0,02 en CPU float32) lo convierte en referencia reproducible para comparar nuevos métodos de matching.

## Benchmarks y rendimiento

Precisión en datasets públicos (medida en RTX 5060 Ti, torch 2.14.1+cu130):

| Variante | Dataset | bad > 1 px % / EPE (portable) | bad > 1 px % / EPE (kernels) | Nota |
|---|---|---|---|---|
| `hitnet-eth3d` | ETH3D two-view train | 0,93 / 0,164 | 0,93 / 0,164 | Entrenado con imágenes públicas del dataset; no es zero-shot |
| `hitnet-eth3d` | Middlebury 2014 trainingH (bad > 2 px) | 17,25 / 8,340 | 17,30 / 8,356 | — |
| `hitnet-middlebury-d400` | ETH3D two-view train | 7,01 / 0,899 | 6,98 / 0,872 | — |
| `hitnet-middlebury-d400` | Middlebury 2014 trainingH (bad > 2 px) | 7,54 / 1,187 | 7,52 / 1,184 | Entrenado con imágenes públicas del dataset; no es zero-shot |

Velocidad y memoria en Middlebury 2014 half (994x1482):

| Modelo | Tiempo portable | Tiempo kernels | Aceleración kernels vs portable | Memoria pico portable (MiB, alloc/reserved) | Memoria pico kernels (MiB, alloc/reserved) |
|---|---|---|---|---|---|
| `hitnet-eth3d` | 67,78 ms | 23,16 ms | 2,9x | 860 / 1090 | 647 / 1248 |
| `hitnet-middlebury-d400` | 176,0 ms | 52,73 ms | 3,3x | 1744 / 2414 | 1263 / 2368 |

Rendimiento a tamaños fijos (tiempo / memoria pico alloc / reserved en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|---|
| `hitnet-eth3d` | portable | 18,1 ms / 221 / 336 | 40,2 ms / 659 / 1004 | 92,6 ms / 1134 / 2438 | 579,4 ms / 6558 / 11110 |
| `hitnet-eth3d` | kernels | 5,2 ms / 140 / 470 | 14,5 ms / 392 / 482 | 30,8 ms / 836 / 1004 | 181,7 ms / 4814 / 5758 |
| `hitnet-middlebury-d400` | portable | 35,8 ms / 602 / 838 | 108,8 ms / 1067 / 2222 | 251,7 ms / 2392 / 3814 | OOM |
| `hitnet-middlebury-d400` | kernels | 11,7 ms / 266 / 966 | 33,1 ms / 759 / 978 | 74,2 ms / 1695 / 2248 | 426,2 ms / 9604 / 12664 |

Arranque: carga de 0,07-0,13 s y primera llamada de 0,03-0,18 s según variante y backend. Paridad con el código original: CPU float32 con max |diff| <= 0,02; GPU float16 con media |diff| <= 0,15 px y p99 <= 1,0 px.

## Requisitos de hardware

- VRAM estimada: desde 140 MiB (alloc) a 640x480 con `kernels` hasta 9,6 GiB (alloc) a 12 MP con `hitnet-middlebury-d400`; la reserva del allocator de PyTorch llega a 12,7 GiB en ese caso.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks, sm_120); cualquier GPU CUDA con al menos 8 GB para resoluciones medias y 16 GB para 12 MP. A100 y H100 son compatibles por arquitectura pero no hay cifras publicadas para ellas.
- Cabe en GPU consumer: sí; a 1280x720 el pico es de 392-759 MiB según variante y backend, y a 1080p de 836-1695 MiB.
- CPU: soportada en float32 con paridad verificada frente al código original.
- Opciones de despliegue: paquete `fastforks` con backends `portable` (PyTorch) y `kernels` (kernels CUDA del repo `fastforks/kernels`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 5,2 ms a 640x480, 30,8 ms a 1080p y 181,7 ms a 12 MP con `hitnet-eth3d` y backend `kernels`; la variante Middlebury d400 es entre 2 y 3 veces más lenta por su mayor rango de disparidad.

## Comparativa con modelos similares

| Modelo | Tipo | Rango de disparidad | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HITNet (este repo) | Matching estéreo jerárquico con tiles inclinados | 128 (ETH3D) / 400 (Middlebury) | Cualquier H x W >= 8; probado hasta 12 MP | Código Apache-2.0; pesos sin declarar | Pesos vía espejo PINTO; código en google-research |
| RAFT-Stereo | Red recurrente con correlación 3D | Configurable | Resolución completa, memoria cuadrática con la disparidad | BSD-3 (código de referencia) | Pesos públicos en el repo oficial de Princeton |
| CREStereo | Cascada con correlación 3D y refinamiento | Configurable | Resolución completa | Apache-2.0 (código de referencia) | Pesos públicos en el repo de Megvii |
| FoundationStereo | Modelo fundacional estéreo zero-shot | Amplio | Resolución completa | No disponible en la información proporcionada | Pesos públicos en el repo de NVIDIA |

No se dispone de resultados de benchmarks cruzados entre estas alternativas en la información proporcionada; la comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Requiere parejas de imágenes rectificadas; sin rectificación previa la disparidad no es válida.
- La variante `hitnet-eth3d` está entrenada con imágenes públicas de ETH3D y la `middlebury-d400` con Middlebury; sus resultados en esos datasets no son zero-shot y no deben presentarse como generalización.
- La salida en GPU float16 difiere de la CPU en ~0,2 px de media y 4 px en p99 a 720x1280, por el desempate del argmin en tiles con coste casi idéntico; para máxima precisión usar float32 completo con `torch.backends.cudnn.allow_tf32 = False`.
- Los pesos son grafos TensorFlow congelados leídos sin TensorFlow; el soporte de variantes se limita a las dos documentadas (la card menciona FlyingThings de forma incompleta en el texto truncado).
- Licencia de pesos no declarada por los autores: la card asume Apache-2.0 a partir del código, pero el uso comercial de los checkpoints no está garantizado legalmente. Los pesos se obtienen de un espejo de terceros (PINTO model-zoo), no de Google.
- La variante `middlebury-d400` agota la memoria (OOM) en modo `portable` a 12 MP.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling ni agentes, y no aplican sesgos lingüísticos ni riesgo de alucinación en el sentido habitual.
- El repositorio no contiene pesos; la reproducibilidad depende de la disponibilidad del espejo externo y de la verificación SHA-256.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/hitnet
- Repositorio del código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Fichero `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/hitnet/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original de Google Research (commit `f200f2b89d29`): https://github.com/google-research/google-research
- Licencia del código original: https://github.com/google-research/google-research/blob/f200f2b89d29484bf0dd0fef0c3979ac8bed9af4/LICENSE
- Espejo de pesos PINTO model-zoo: https://s3.ap-northeast-2.wasabisys.com/pinto-model-zoo/142_HITNET/resources.tar.gz
