# fastforks/las2

## Resumen

LiteAnyStereo V2 (LAS2) es un modelo de estimación de disparidad estéreo zero-shot desarrollado por el autor TomTomTommi y empaquetado para su uso mediante la librería `fastforks` del usuario kleinicke. Resuelve el problema de la correspondencia estéreo densa: dado un par de imágenes izquierda y derecha rectificadas, produce un mapa de disparidad en píxeles desde la vista izquierda, del cual se puede derivar profundidad. Es relevante porque ofrece estimación estéreo zero-shot con requisitos de memoria y latencia contenidos, con variantes que van desde un modelo pequeño (S) hasta uno grande (H), lo que permite desplegarlo en GPUs de consumo.

La arquitectura combina características extraídas con FasterNet-T0, un volumen de correlación y agregación de coste 2-D mediante FasterNet en las variantes S, M y L. La variante H emplea un volumen agrupado (group-wise) con actualización mediante un GRU selectivo. El repositorio de Hugging Face es únicamente una model card: no aloja pesos, sino que descarga los pesos de los repositorios del autor original y verifica su integridad mediante SHA-256.

El modelo se distribuye bajo licencia MIT y admite entrada de cualquier resolución H x W mayor o igual a 32, con padding a múltiplo de 32. Está etiquetado como tier experimental y soporta dos backends de ejecución: `portable` y `kernels` (este último con kernels CUDA específicos que aportan aceleraciones de entre 2,3x y 3,3x frente al backend portable).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FasterNet-T0 como extractor de características, volumen de correlación y agregación de coste 2-D con FasterNet (S/M/L); volumen group-wise con actualización selective-GRU (H) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión estéreo; entrada H x W >= 32, padding a múltiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 documentados en benchmarks; no se listan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT (código y pesos; ver advertencias sobre datos de entrenamiento) |
| Formato de pesos | `.pth` (PyTorch), alojados en el repositorio del autor original |

## Arquitectura y entrenamiento

LiteAnyStereo V2 es un modelo de correspondencia estéreo densa. Las variantes S, M y L comparten un esquema de tres etapas: extracción de características con FasterNet-T0, construcción de un volumen de correlación y agregación de coste 2-D mediante FasterNet. La variante H sustituye la agregación por un volumen agrupado (group-wise) con actualización iterativa mediante un GRU selectivo, un patrón habitual en los modelos estéreo iterativos modernos. El modelo es zero-shot: no requiere ajuste fino sobre el dominio de destino.

El entrenamiento se realizó sobre una mezcla de datasets estéreo sintéticos que incluye FSD y Dynamic Replica. No se especifica en la información disponible el número de tokens, el número de iteraciones ni si hubo etapas de refinamiento adicionales. La model card advierte que los términos de uso comercial de FSD (NVIDIA) y Dynamic Replica no están claros, y que el repositorio original no lista los datos ni sus condiciones.

La innovación técnica destacable es el backend `kernels`, que proporciona kernels CUDA específicos para las operaciones del modelo y logra aceleraciones de 2,3x a 3,3x frente al backend portable, además de reducir el pico de memoria reservada en las variantes L, M y S (por ejemplo, `las2-s` a 1920x1080 pasa de 1342 MiB reservados en portable a 500 MiB en kernels).

## Capacidades

- Estimación de disparidad estéreo densa zero-shot a partir de un par de imágenes izquierda/derecha rectificadas.
- Salida de mapa de disparidad en píxeles referido a la vista izquierda, del que se puede derivar profundidad.
- Entrada de resolución arbitraria H x W mayor o igual a 32, con padding automático a múltiplo de 32.
- Cuatro variantes de tamaño (S, M, L, H) con distintos compromisos de precisión, latencia y memoria.
- Dos backends de ejecución: `portable` (PyTorch estándar) y `kernels` (kernels CUDA optimizados).
- Verificación de integridad de pesos mediante SHA-256 en la descarga.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3-D y nubes de puntos: a partir del mapa de disparidad y de los parámetros de calibración de la cámara estéreo se obtiene profundidad por píxel, adecuada para pipelines de fotogrametría o escaneo de interiores. La variante H ofrece la mayor calidad a 1920x1080 en 174,8 ms con el backend portable.
- Robótica móvil y navegación: un par estéreo a 640x480 se procesa en 3,0 ms con `las2-s` y backend `kernels`, lo que permite estimación de profundidad a más de 300 FPS en una RTX 5060 Ti, suficiente para evasión de obstáculos en tiempo real.
- Vehículos autónomos y ADAS: la variante M o L a 1280x720 (9,2 ms y 16,8 ms respectivamente con `kernels`) permite generar mapas de profundidad densos a frecuencia de cámara para detección de obstáculos y estimación de distancia.
- Realidad aumentada y mixta: la estimación de profundidad por par estéreo permite ocluir objetos virtuales con geometría real; la resolución arbitraria y el bajo consumo de memoria de `las2-s` con `kernels` (88 MiB asignados a 640x480) facilitan su integración en dispositivos con GPU de gama media.
- Procesamiento de imágenes de alta resolución: `las2-l` procesa 12 MP (4000x3000) en 254,6 ms con 2174 MiB asignados usando `kernels`, lo que lo hace viable para fotogrametría aérea o inspección industrial con cámaras de alta resolución.
- Investigación en visión por computador: al ser zero-shot y MIT, sirve como baseline reproducible para comparar métodos de correspondencia estéreo en ETH3D, Middlebury y otros conjuntos públicos, con la ventaja de incluir benchmarks de latencia y memoria publicados.
- Captura de profundidad en drones: la variante S a 1920x1080 consume 338 MiB asignados y 16,6 ms con `kernels`, un perfil compatible con GPUs embebidas tipo Jetson cuando se ejecuta el backend portable.

## Benchmarks y rendimiento

Precisión en ETH3D two-view train (bad > 1 px % / EPE), según la información disponible:

| Variante | Dataset | Original | Portable | Kernels | Nota |
|---|---|---|---|---|---|
| `las2-s` | ETH3D two-view train | no disponible | 4,10 / 0,382 | 4,09 / 0,382 | posiblemente presente en los datos de entrenamiento |

El resto de resultados de precisión sobre Middlebury y otros conjuntos no están completos en la información proporcionada.

Latencia y memoria en Middlebury 2014 half (994x1482), RTX 5060 Ti 16 GB:

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Pico asignado/reservado original (MiB) | Pico portable (MiB) | Pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `las2-h` | 204,8 | 134,9 | 122,8 | 53,27 | 2,5x | 1022 / 1084 | 1050 / 1110 | 1021 / 1388 |
| `las2-l` | 153,5 | 90,8 | 80,32 | 29,92 | 3,0x | 1010 / 1082 | 1036 / 1098 | 397 / 600 |
| `las2-m` | 79,1 | 52,4 | 54,13 | 18,29 | 2,9x | 948 / 1000 | 972 / 1026 | 329 / 572 |
| `las2-s` | 62,0 | 43,5 | 46,86 | 14,35 | 3,0x | 933 / 978 | 955 / 988 | 320 / 558 |

Latencia y memoria a resoluciones fijas (tiempo ms / pico asignado MiB / pico reservado MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `las2-h` | portable | 29,8 / 269 / 328 | 69,1 / 668 / 904 | 174,8 / 1386 / 2168 | 1408,7 / 8708 / 12018 |
| `las2-h` | kernels | 10,2 / 218 / 596 | 28,5 / 604 / 1636 | 73,6 / 1344 / 1648 | 512,5 / 9695 / 12606 |
| `las2-l` | portable | 25,5 / 286 / 328 | 51,1 / 653 / 700 | 110,1 / 1317 / 1404 | 824,0 / 7201 / 7598 |
| `las2-l` | kernels | 6,6 / 129 / 270 | 16,8 / 241 / 676 | 38,6 / 422 / 588 | 254,6 / 2174 / 2896 |
| `las2-m` | portable | 18,9 / 219 / 252 | 35,4 / 586 / 648 | 73,9 / 1249 / 1358 | 602,8 / 7135 / 7584 |
| `las2-m` | kernels | 4,0 / 96 / 258 | 9,2 / 187 / 618 | 21,5 / 346 / 516 | 146,5 / 1870 / 2684 |
| `las2-s` | portable | 16,1 / 202 / 234 | 31,0 / 569 / 632 | 64,4 / 1232 / 1342 | 532,1 / 7119 / 7566 |
| `las2-s` | kernels | 3,0 / 88 / 246 | 6,9 / 179 / 602 | 16,6 / 338 / 500 | 109,3 / 1859 / 2598 |

Tiempos de carga y primera llamada (entrada 375x1242):

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `las2-h` | 0,26 | 0,18 | 0,13 | 1,21 | 0,14 | 0,06 |
| `las2-l` | 0,39 | 0,23 | 0,18 | 0,04 | 0,08 | 0,03 |
| `las2-m` | 0,17 | 0,12 | 0,10 | 0,02 | 0,05 | 0,02 |
| `las2-s` | 0,11 | 0,09 | 0,07 | 0,02 | 0,05 | 0,01 |

Entrada máxima probada con backend portable en fp16 sobre RTX 5060 Ti 16 GB: 3000x4000 en todas las variantes, con picos asignados de 8,5 GiB (H) y 7,0 GiB (L, M, S).

## Requisitos de hardware

- VRAM estimada para inferencia: desde 88 MiB asignados (S, 640x480, kernels) hasta unos 9,7 GiB asignados (H, 12 MP, kernels). En el peor caso documentado, 3000x4000 con `las2-h` portable en fp16, el pico reservado es de 11,7 GiB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. Los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120). Para las variantes H y L a resoluciones altas se recomienda al menos 12-16 GB de VRAM.
- Cabe en GPU de consumo: sí. `las2-s` y `las2-m` a 1080p caben holgadamente en GPUs de 8 GB; `las2-h` a 12 MP requiere una GPU de 16 GB o más.
- Opciones de despliegue: la librería `fastforks` con backends `portable` (PyTorch) y `kernels` (kernels CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: a 1920x1080 con `kernels`, entre 16,6 ms (`las2-s`) y 73,6 ms (`las2-h`). A 640x480 con `kernels`, entre 3,0 ms (`las2-s`) y 10,2 ms (`las2-h`). El backend `kernels` ofrece aceleraciones de 2,3x a 3,3x frente a portable.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables (por ejemplo, RAFT-Stereo, CREStereo, FoundationStereo o Selective-IGEV) medidos con el mismo protocolo, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Tipo | Zero-shot | Variantes de tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiteAnyStereo V2 | Estéreo denso, FasterNet + correlación / GRU selectivo | Sí | S, M, L, H | MIT (pesos); dudas sobre datos de entrenamiento | Hugging Face (pesos del autor) y GitHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere pares de imágenes estéreo rectificadas; no funciona con imágenes sin rectificar ni con una sola vista.
- El modelo es zero-shot y experimental (tier experimental), sin validación exhaustiva publicada en todos los conjuntos de referencia.
- La variante `las2-s` podría haber visto ETH3D two-view train durante el entrenamiento, lo que invalida ese resultado como medida de generalización.
- Los datos de entrenamiento incluyen FSD (NVIDIA) y Dynamic Replica, cuyos términos de uso comercial de modelos entrenados no están claros; el repositorio original no lista condiciones de datos. Conviene revisarlo antes de un uso comercial, aunque la licencia de los pesos sea MIT.
- Riesgo de artefactos en regiones oclusivas, superficies sin textura, reflejos y bordes de objeto, habitual en métodos de correspondencia estéreo; no se documentan métricas específicas en la información disponible.
- La resolución de entrada debe ser múltiplo de 32 tras el padding; resoluciones muy altas incrementan el consumo de memoria de forma aproximadamente cuadrática (12 MP con `las2-h` supera los 9,6 GiB asignados con `kernels`).
- No hay información sobre sesgos ni sobre el rendimiento en dominios distintos de los sintéticos de entrenamiento.
- El repositorio de Hugging Face no contiene pesos: la disponibilidad depende de los enlaces del autor original y de la verificación SHA-256.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/las2
- Repositorio de pesos del autor: https://huggingface.co/tomtomtommi/LiteAnyStereoV2
- Código original: https://github.com/TomTomTommi/LiteAnyStereo
- Librería fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/las2/card.toml
- Evidencia de licencia: https://huggingface.co/tomtomtommi/LiteAnyStereoV2/blob/17788d91618646fa781a14462e2926a034b9f49d/README.md#L2
