# fastforks/waft-stereo

## Resumen

WAFT-Stereo es un modelo de estimación de disparidad estéreo presentado por Wang y Deng en 2025 y empaquetado para su distribución por el proyecto fastforks. Resuelve el problema clásico de *stereo matching*: dada una pareja de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles respecto a la vista izquierda, del que se deriva profundidad. Su innovación principal es sustituir el *cost volume* tridimensional habitual por un esquema de *warping* iterativo: extrae características con un ViT de Depth Anything V2 ajustado mediante LoRA, propone una disparidad inicial con un cabezal basado en ViT y refina el resultado con tres iteraciones de *warp-and-refine*.

El repositorio de Hugging Face es únicamente una model card: no aloja pesos. El paquete fastforks descarga los checkpoints originales de los autores desde `MemorySlices/WAFT-Stereo` y los verifica contra hashes SHA-256. Existen dos variantes, `waft-stereo-b` (ViT-B, mayor precisión) y `waft-stereo-s` (ViT-S, menor huella de memoria), con backends `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados).

Es relevante ahora porque ofrece precisión de estado del arte en estéreo denso con un consumo de memoria y unos tiempos de inferencia que caben en GPUs de consumo (RTX 5060 Ti de 16 GB), algo poco habitual en modelos de disparidad de alta resolución. La contrapartida es una licencia mixta que restringe el uso comercial en la variante `b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (Depth Anything V2 con LoRA) + cabezal de propuesta de disparidad + 3 iteraciones warp-and-refine; sin cost volume |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 17, redimensionada o con padding internamente) |
| Tipos de cuantizacion | fp16 y fp32 en los benchmarks; no se documentan otras cuantizaciones (GGUF, int8) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | mixta: código BSD-3-Clause; pesos `waft-stereo-b` CC-BY-NC-4.0 (sin uso comercial), pesos `waft-stereo-s` BSD-3-Clause |
| Formato de pesos | `.pth` (PyTorch); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

WAFT-Stereo abandona el *cost volume* 3D y lo reemplaza por un mecanismo de *warping*: las características de la imagen derecha se deforman según la disparidad estimada y se comparan con las de la izquierda en un espacio 2D, lo que reduce el coste de memoria frente a los enfoques volumétricos. Las características provienen de un Depth Anything V2 (ViT-B o ViT-S) ajustado con LoRA; sobre ellas actúa un cabezal ViT que propone una disparidad inicial, seguida de tres iteraciones de *warp-and-refine* que corrigen progresivamente el mapa.

El entrenamiento se realizó sobre datos sintéticos y reales. La model card cita Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa) como base declarada, y las configuraciones `configs/SynLarge/*.yaml` mencionan además TartanAir, CREStereo, Falling Things, Sintel, Virtual KITTI 2, UnrealStereo4K, WMGStereo, CARLA, Spring, TartanGround y FSD de NVIDIA. No se documentan número de tokens ni detalles de RLHF (no aplica a una tarea de regresión densa). El paquete fastforks verifica paridad numérica contra las salidas doradas del código original en su commit fijado `c534320860f4`.

## Capacidades

- Estimación de disparidad estéreo densa a partir de una pareja de imágenes rectificadas izquierda/derecha.
- Salida de un mapa de disparidad en píxeles respecto a la vista izquierda, convertible a profundidad con los parámetros de calibración.
- Procesamiento de resoluciones arbitrarias con H x W >= 17, con redimensionado o padding interno.
- Dos variantes de capacidad: `waft-stereo-b` (ViT-B, mayor precisión) y `waft-stereo-s` (ViT-S, menor memoria).
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (kernels CUDA con aceleración de 2,4x a 2,9x).
- Soporte de fp16 y fp32; fp32 donde fp16 no es finito.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: el mapa de disparidad se convierte en profundidad mediante la matriz de calibración de la pareja estéreo, alimentando pipelines de fotogrametría o SLAM con cámaras estéreo calibradas.
- Robótica móvil y navegación: percepción de profundidad en tiempo casi real (62,9 ms a 640x480 con `waft-stereo-b` en backend `kernels`) para evitación de obstáculos en plataformas con GPU embebida.
- Vehículos autónomos y ADAS: estimación densa de profundidad a 1280x720 en 148 ms con `waft-stereo-s` y backend `kernels`, adecuada para percepción frontal con pares estéreo rectificados.
- Inspección industrial y metrología: la variante `b` alcanza 0,74 % de píxeles con error > 1 px en ETH3D, útil para medición de distancias en escenas controladas con calibración precisa.
- Realidad aumentada y captura volumétrica: la variante `s` procesa 12 MP (4000x3000) en 6,4 s con 7,5 GiB asignados, permitiendo reconstrucción de alta resolución en GPUs de 16 GB.
- Postproducción de vídeo y VFX: generación de mapas de profundidad por fotograma para rotoscopia o desenfoque de profundidad, con la variante `s` por su licencia permisiva y menor coste.
- Investigación en visión por computador: referencia reproducible con paridad verificada contra el código original, útil para comparativas de *stereo matching*.

## Benchmarks y rendimiento

Precisión en conjuntos públicos (medida el 2026-10-27 en RTX 5060 Ti, torch 2.14.1+cu130):

| Variante | Dataset | bad > umbral % / EPE (portable) | bad > umbral % / EPE (kernels) |
|---|---|---|---|
| `waft-stereo-s` | ETH3D two-view train | 0,95 / 0,177 (bad > 1 px) | 0,95 / 0,177 |
| `waft-stereo-s` | Middlebury 2014 trainingH | 4,75 / 0,895 (bad > 2 px) | 4,77 / 0,897 |
| `waft-stereo-b` | ETH3D two-view train | 0,74 / 0,163 (bad > 1 px) | 0,74 / 0,163 |
| `waft-stereo-b` | Middlebury 2014 trainingH | 3,39 / 0,728 (bad > 2 px) | 3,38 / 0,728 |

Nota: los autores advierten que estos conjuntos pueden estar presentes en los datos de entrenamiento.

Velocidad y memoria en Middlebury 2014 half (994x1482):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels | Memoria pico original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `waft-stereo-b` | 1897,5 | 1139,5 | 1137,2 | 392,9 | 2,9x | 5743 / 5876 | 5775 / 5852 | 1907 / 2316 |
| `waft-stereo-s` | 1251,6 | 689,3 | 689,0 | 283,8 | 2,4x | 3314 / 3398 | 3293 / 3456 | 1113 / 1286 |

Rendimiento a tamaño fijo (tiempo ms / memoria asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|---|
| `waft-stereo-b` | kernels | 62,9 / 676 / 908 | 214,9 / 1310 / 1880 | 607,1 / 2523 / 3712 | OOM |
| `waft-stereo-s` | portable | 83,4 / 941 / 1146 | 357,7 / 2165 / 3356 | 1234,1 / 5368 / 8448 | omitido |
| `waft-stereo-s` | kernels | 54,4 / 381 / 516 | 148,0 / 760 / 1120 | 441,0 / 1473 / 2150 | 6423,1 / 7556 / 11364 |

## Requisitos de hardware

- VRAM estimada: `waft-stereo-b` consume 3,2 GiB pico asignados a 1024x1024 en fp16; `waft-stereo-s` alcanza 5,3 GiB pico a 1024x2048.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks, sm_120); cualquier GPU con 8 GB o más debería cubrir resoluciones medias con la variante `s`.
- Cabe en GPU de consumo: sí, la variante `s` procesa 12 MP en una RTX 5060 Ti de 16 GB; la variante `b` agota memoria a 12 MP.
- Despliegue: paquete `fastforks` con backends `portable` (PyTorch) y `kernels` (kernels CUDA); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 62,9 ms a 640x480 y 214,9 ms a 1280x720 con `waft-stereo-b` y backend `kernels`; 54,4 ms y 148,0 ms respectivamente con `waft-stereo-s`.
- Arranque: carga de 0,42 s (`b`, kernels) y 0,30 s (`s`, kernels); primera llamada de 0,39 s y 0,28 s respectivamente.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros modelos de *stereo matching* (por ejemplo CREStereo, RAFT-Stereo o FoundationStereo). La model card solo compara las variantes `b` y `s` entre sí y frente al código original de los autores.

| Modelo | Parametros | Contexto | Precisión ETH3D (bad > 1 px) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `waft-stereo-b` | no disponible | no aplica | 0,74 % | CC-BY-NC-4.0 (pesos) | Hugging Face (MemorySlices) |
| `waft-stereo-s` | no disponible | no aplica | 0,95 % | BSD-3-Clause (pesos) | Hugging Face (MemorySlices) |
| Otros modelos estéreo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La variante `waft-stereo-b` tiene licencia CC-BY-NC-4.0 por incorporar un Depth Anything V2 ViT-B cuyos pesos originales son no comerciales; el uso comercial está prohibido.
- Ambos checkpoints se entrenaron con el dataset FSD de NVIDIA, cuyos términos para uso comercial de modelos entrenados son poco claros.
- Los resultados en ETH3D y Middlebury pueden estar contaminados por datos de entrenamiento; no son una medida limpia de generalización.
- Requiere parejas de imágenes rectificadas y calibradas; no maneja estéreo no rectificado sin preprocesado.
- No procesa lenguaje ni ofrece tool calling, agentes o razonamiento multi-paso.
- La variante `b` agota memoria (OOM) a 12 MP en una GPU de 16 GB.
- El repositorio de Hugging Face no aloja pesos: la disponibilidad depende de los enlaces externos a `MemorySlices/WAFT-Stereo` y de la verificación SHA-256.
- Riesgo de alucinación no aplica; el riesgo es de disparidad errónea en regiones oclusivas, texturas repetitivas o superficies sin textura.
- No se documentan sesgos demográficos ni limitaciones idiomáticas por tratarse de un modelo de visión.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/waft-stereo
- Pesos de los autores: https://huggingface.co/MemorySlices/WAFT-Stereo
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de WAFT-Stereo: https://github.com/princeton-vl/WAFT-Stereo
- Licencia del código original: https://github.com/princeton-vl/WAFT-Stereo/blob/c534320860f4bbb2c0df896e3ccb95de49284aec/LICENSE
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Configuración de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/waft_stereo/card.toml
