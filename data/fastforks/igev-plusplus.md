# fastforks/igev-plusplus

## Resumen

IGEV++ es un modelo de estimación de disparidad estéreo (stereo matching) publicado por Xu et al. en 2025. Se trata de una evolución de IGEV-Stereo que incorpora volúmenes de codificación geométrica (geometry encoding volumes) para rangos de disparidad pequeños, medianos y grandes, con 48 bins por rango a resolución 1/4 y cobertura de hasta 768 píxeles. Los tres volúmenes se agregan por separado y se combinan por píxel dentro de la actualización del ConvGRU, que ejecuta 32 iteraciones.

El repositorio `fastforks/igev-plusplus` no contiene pesos: es una model card que documenta cómo el proyecto fastforks descarga los pesos originales de los autores y los verifica mediante SHA-256. El código de referencia está en el repositorio de gangweix (IGEV-plusplus) en el commit `099dec979897`, y el código de integración en el repositorio de kleinicke/fastforks, que ofrece dos backends: `portable` y `kernels`.

La relevancia actual radica en que ofrece inferencia estéreo de alta calidad con optimizaciones específicas para GPU modernas (sm_120, RTX 5060 Ti), alcanzando aceleraciones de hasta 3,3x frente al código original en fp32 y reduciendo el uso de memoria. Está orientado a investigación y prototipado (tier experimental), con licencia de código MIT y licencia de pesos no declarada explícitamente por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red estéreo con geometry encoding volumes multi-rango (48 bins por rango, 1/4 de resolución, hasta 768 px) y refinamiento iterativo mediante ConvGRU (32 iteraciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels) |
| Idiomas soportados | no aplica |
| Licencia | Código MIT; licencia de pesos no declarada por los autores (en la card se asume MIT para uso comercial) |
| Formato de pesos | `.pth` (PyTorch), descargados desde enlaces de Google Drive de los autores |
| Tarea | Estimación de disparidad estéreo (stereo matching) |
| Entrada | Par de imágenes rectificadas izquierda/derecha |
| Salida | Mapa de disparidad en píxeles (vista izquierda) |
| Resolución de entrada | Cualquier H x W >= 32, con padding a múltiplo de 32 |
| Backends | `portable`, `kernels` |
| Variantes | eth3d, kitti12, kitti15, middlebury, sceneflow |

## Arquitectura y entrenamiento

IGEV++ sigue la estela de IGEV-Stereo: extracción de características, construcción de volúmenes de coste y refinamiento iterativo mediante un ConvGRU. La innovación principal es el uso de tres volúmenes de codificación geométrica independientes, cada uno con 48 bins a 1/4 de resolución, que cubren rangos de disparidad pequeño, mediano y grande (hasta 768 píxeles). Estos volúmenes se agregan por separado y se mezclan por píxel dentro de la actualización del ConvGRU, que realiza 32 iteraciones de refinamiento. El resultado es un mapa de disparidad de la vista izquierda.

Los pesos publicados se entrenaron con el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. La model card no detalla el número de tokens ni de muestras, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Las variantes disponibles (eth3d, kitti12, kitti15, middlebury, sceneflow) corresponden a distintos conjuntos de pesos afinados o entrenados para cada benchmark, no a cambios arquitectónicos. La integración de fastforks añade kernels optimizados para el backend `kernels`, que aceleran la inferencia en GPU.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas.
- Cobertura de rangos de disparidad amplios gracias a los tres volúmenes multi-rango (hasta 768 px).
- Refinamiento iterativo con ConvGRU (32 iteraciones) para mejorar la precisión en bordes y regiones de oclusión.
- Ejecución en fp32 (original) y fp16 (portable y kernels).
- Backend `kernels` con kernels CUDA optimizados para GPUs modernas (sm_120).
- Soporte de entrada de resolución arbitraria (mínimo 32x32, padding a múltiplo de 32).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Robótica móvil y navegación autónoma: el modelo genera mapas de profundidad por disparidad a partir de pares estéreo, útiles para evitar obstáculos y planificar trayectorias en tiempo real con el backend `kernels` (por ejemplo, 88,7 ms a 640x480).
- Vehículos autónomos y ADAS: la variante `kitti15` está pensada para escenas de conducción; permite estimar distancia a objetos y peatones a partir de cámaras estéreo.
- Reconstrucción 3D y fotogrametría: la salida de disparidad se puede convertir en nube de puntos para modelado de escenas, con soporte de resoluciones altas (hasta 12 MP en el backend `kernels`).
- Inspección industrial y metrología: la variante `eth3d` está orientada a escenas de interior y objetos; útil para medición de distancias y control de calidad con pares estéreo calibrados.
- Realidad aumentada y visión por computador: la variante `middlebury` permite generar mapas de profundidad de alta calidad para inserción de objetos virtuales y efectos de desenfoque.
- Investigación en visión estéreo: las cinco variantes y los dos backends permiten reproducir benchmarks (KITTI 2012/2015, Middlebury, ETH3D, SceneFlow) y comparar implementaciones.
- Procesamiento de vídeo estéreo en tiempo casi real: con 241 ms a 1280x720 en el backend `kernels`, es viable para aplicaciones de captura y análisis de vídeo con GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (EPE, D1, etc.) en la información disponible. Los datos de rendimiento disponibles son de velocidad y memoria, medidos en una RTX 5060 Ti de 16 GB (sm_120):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| igev-plusplus-eth3d | portable | 201,5 ms / 354 / 614 MiB | 606,5 ms / 987 / 1662 MiB | 1534,8 ms / 2172 / 3496 MiB | OOM |
| igev-plusplus-eth3d | kernels | 88,7 ms / 357 / 1092 MiB | 241,2 ms / 830 / 1210 MiB | 534,3 ms / 1799 / 2464 MiB | 3135,8 ms (n=3) / 8419 / 9752 MiB |

| Modelo | Tiempo original fp32 | Original | Portable | Kernels | Aceleración kernels vs original | Aceleración kernels vs portable |
|---|---|---|---|---|---|---|
| igev-plusplus-eth3d (Middlebury 2014 half, 994x1482) | 2012,16 ms | 1277,86 ms | 1080,64 ms | 393,04 ms | 3,3x | 2,7x |

| Modelo | Carga (s): original / portable / kernels | Primera llamada (s): original / portable / kernels |
|---|---|---|
| igev-plusplus-eth3d | 0,42 / 0,20 / 0,16 | 2,33 / 1,10 / 0,40 |

## Requisitos de hardware

- VRAM estimada: entre 354 MiB (640x480, portable) y 8419 MiB (12 MP, kernels) de memoria pico asignada; la reservada llega a 9752 MiB en 12 MP.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de las mediciones, sm_120). Para el backend `kernels` se requiere una GPU compatible con sm_120; el backend `portable` funciona en GPUs CUDA más antiguas.
- Cabe en GPU de consumo: sí, con 16 GB de VRAM se cubren resoluciones de hasta 12 MP en el backend `kernels`; en el backend `portable` se produce OOM a 12 MP.
- Opciones de despliegue: el paquete `fastforks` (backends `portable` y `kernels`), PyTorch y CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 88,7 ms a 640x480 y 534,3 ms a 1920x1080 con `kernels`; 201,5 ms y 1534,8 ms respectivamente con `portable`. La primera llamada tarda 0,40 s con `kernels` y 1,10 s con `portable`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IGEV++ (este modelo) | no disponible | no aplica | 88,7 ms a 640x480 (kernels, RTX 5060 Ti); precisión no disponible | Código MIT; pesos sin licencia declarada | Pesos en Google Drive de los autores; integración en fastforks |
| IGEV-Stereo | no disponible | no aplica | no disponible | MIT (código) | Repositorio de gangweix en GitHub |
| RAFT-Stereo | no disponible | no aplica | no disponible | BSD-3 (código) | Pesos públicos en GitHub |
| CREStereo | no disponible | no aplica | no disponible | MIT (código) | Pesos públicos en GitHub |

No se dispone de datos de benchmarks de precisión para establecer una comparación cuantitativa con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Requiere pares de imágenes estéreo rectificadas; no funciona con imágenes individuales ni con pares no calibrados.
- La licencia de los pesos no está declarada explícitamente por los autores; la model card asume MIT a partir de la licencia del código, pero conviene verificar antes de un uso comercial.
- El modelo está marcado como tier experimental; no se han publicado resultados de precisión (EPE, D1) en la información disponible.
- El backend `kernels` requiere GPUs con sm_120; en GPUs anteriores hay que usar el backend `portable`, con mayor latencia y consumo de memoria.
- El backend `portable` produce OOM a 12 MP; para resoluciones muy altas es necesario el backend `kernels` y al menos 10 GB de VRAM.
- La resolución de entrada debe ser múltiplo de 32 (con padding); resoluciones no múltiplos de 32 pueden degradar la precisión o requerir recorte.
- Es un modelo puramente visual: no tiene capacidades de lenguaje, tool calling ni agentes.
- No se documentan sesgos específicos, pero al entrenarse con SceneFlow (FlyingThings3D, Driving, Monkaa) puede tener un rendimiento inferior en dominios muy distintos a los de entrenamiento.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir disparidades erróneas en regiones ocluidas, texturas repetitivas o superficies sin textura.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/igev-plusplus
- Repositorio de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de IGEV-plusplus: https://github.com/gangweix/IGEV-plusplus
- Commit de referencia del código original: https://github.com/gangweix/IGEV-plusplus/tree/099dec97989780d151700459c682df1cc2c18e88
- Evidencia de licencia: https://github.com/gangweix/IGEV-plusplus/blob/099dec97989780d151700459c682df1cc2c18e88/README.md#L23
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de la card: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/igev_plusplus/card.toml
- Pesos eth3d: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1gN8J9YVJMupJVjUAUMSJ0jldkqH1YJUo
- Pesos kitti12: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1j5grw6AKhwhJNWJXn_RfhpFfiWBYboqH
- Pesos kitti15: https://drive.usercontent.google.com/download?export=download&confirm=t&id=15kWs23CO4bBDy3DJE4kNv_tlbeEvp1bk
- Pesos middlebury: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1R9a2YP4kaAv4oT0wtwTnWXrb82Shpp3O
- Pesos sceneflow: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1n8tu7eoByY_Xpyox5XJnjJC_bGBM2r4M
- Paper de IGEV++ (Xu et al. 2025): no disponible en la información proporcionada
