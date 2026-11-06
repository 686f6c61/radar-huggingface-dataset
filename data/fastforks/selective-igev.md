# fastforks/selective-igev

## Resumen

Selective-IGEV es una implementación del método Selective-Stereo (Wang et al., 2024) para estimación de disparidad estéreo, es decir, el cálculo del mapa de profundidad a partir de un par de imágenes rectificadas izquierda/derecha. El repositorio `fastforks/selective-igev` no contiene pesos propios: es una model card que actúa como manifiesto, descargando los pesos originales de los autores desde enlaces de Google Drive y verificándolos contra hashes SHA-256 registrados en `card.toml`. El código de inferencia lo proporciona la librería `fastforks`, con dos backends: `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados publicados en `fastforks/kernels`).

La arquitectura combina IGEV-Stereo con unidades recurrentes selectivas: sobre un contexto re-ponderado por canal y espacialmente, se alternan ConvGRU de 1x1 y 3x3 mediante atención, con 32 iteraciones de refinamiento. Es un modelo puramente de visión geométrica, sin capacidades de lenguaje ni generación de texto; su salida es un mapa de disparidad en píxeles respecto a la vista izquierda. Se distribuye en siete variantes de pesos según el conjunto de entrenamiento o ajuste (SceneFlow, KITTI 2012/2015, ETH3D, Middlebury).

Su relevancia es práctica: ofrece una vía reproducible para ejecutar Selective-Stereo con verificación de integridad de pesos, backend CUDA acelerado (hasta 4,2x frente a la implementación original en fp32) y métricas de memoria y latencia publicadas para resoluciones desde 640x480 hasta 12 MP. Está marcado como tier experimental y la licencia de los pesos no está declarada por los autores, solo asumida como MIT a partir del código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IGEV-Stereo con unidades recurrentes selectivas (ConvGRU 1x1 y 3x3 mezclados por atención, 32 iteraciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels); no se documentan otras |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Código MIT; pesos sin licencia declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch); sin safetensors ni GGUF |
| Tarea | Estimación de disparidad estéreo (depth-estimation) |
| Entrada | Par de imágenes rectificadas izquierda/derecha |
| Salida | Mapa de disparidad en píxeles (vista izquierda) |
| Backends | `portable` (PyTorch) y `kernels` (CUDA) |
| Variantes | 7 (`sceneflow`, `kitti12`, `kitti15`, `eth3d-train`, `eth3d-finetune`, `middlebury-train`, `middlebury-finetune`) |
| Tier | experimental |

## Arquitectura y entrenamiento

Selective-IGEV parte de la arquitectura IGEV-Stereo y sustituye el refinamiento recurrente por unidades selectivas: en cada una de las 32 iteraciones, el modelo aplica atención para mezclar las salidas de dos ConvGRU, uno de kernel 1x1 y otro de 3x3, operando sobre un contexto que ha sido re-ponderado por canal y espacialmente. Este diseño permite capturar simultáneamente contexto local fino y estructura de mayor escala en el coste de agregación, manteniendo el esquema iterativo de refinamiento de disparidad característico de IGEV.

El entrenamiento se realizó sobre Freiburg SceneFlow (FlyingThings3D, Driving y Monkaa). Las variantes adicionales corresponden a ajuste fino o entrenamiento específico sobre KITTI 2012, KITTI 2015, ETH3D y Middlebury. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF/DPO (no aplicables a un modelo de visión). La innovación técnica destacable es la mezcla selectiva de kernels recurrentes y la disponibilidad de kernels CUDA que reducen la latencia frente a la implementación original.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas, con salida en píxeles de la vista izquierda.
- Refinamiento iterativo de la disparidad mediante 32 iteraciones de ConvGRU selectivo.
- Adaptación a distintos dominios mediante variantes de pesos: escenas sintéticas (SceneFlow), conducción (KITTI 2012/2015), interiores y exteriores (ETH3D) y benchmarks de laboratorio (Middlebury).
- Ejecución en dos backends: `portable` para compatibilidad y `kernels` para rendimiento CUDA.
- Verificación de integridad de pesos mediante SHA-256 contra los hashes del manifiesto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de audio o de generación de texto.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: a partir del mapa de disparidad y los parámetros de calibración estéreo se puede triangular la profundidad por píxel; adecuado para pipelines de fotogrametría con pares rectificados.
- Vehículos autónomos y ADAS: la variante `kitti15` está entrenada sobre escenas de conducción, por lo que sirve para estimar profundidad de obstáculos y carril en tiempo casi real (472,5 ms a 1920x1080 con el backend `kernels`).
- Robótica de interiores: la variante `eth3d-finetune` se ajustó sobre ETH3D, con escenas de interior y exterior, útil para navegación y manipulación con cámaras estéreo.
- Inspección industrial y metrología de laboratorio: la variante `middlebury-finetune` está orientada a escenas controladas de alta precisión, apropiada para medición de objetos en condiciones de iluminación estables.
- Preprocesado para modelos de visión 3D: el mapa de disparidad puede alimentar etapas posteriores de detección, segmentación o SLAM denso, sustituyendo sensores LiDAR en configuraciones de bajo coste.
- Procesado de imágenes de alta resolución: soporta entradas de hasta 3000x4000 (12 MP) con 10,3 GiB de memoria pico en fp16, lo que permite trabajar con cámaras de alta resolución sin reescalado.
- Evaluación y benchmarking de algoritmos estéreo: las siete variantes y los hashes verificables permiten reproducir comparativas sobre KITTI, ETH3D y Middlebury con trazabilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (EPE, D1, bad-x) en la información disponible. Sí se documentan métricas de latencia y memoria medidas por el autor del fork.

Rendimiento en Middlebury 2014 half (994x1482), variante `selective-igev-eth3d-finetune`:

| Backend | Tiempo (ms) | Aceleración vs original fp32 | Memoria pico asignada / reservada (MiB) |
|---|---|---|---|
| Original fp32 | 2201,3 | 1,0x | 2013 / 2152 |
| Portable | 1455,0 | 1,5x | 1238 / 1488 |
| Kernels | 348,76 | 4,2x (2,9x vs portable) | 1109 / 1390 |

Latencia y memoria pico por resolución (ms / MiB asignada / MiB reservada), variante `selective-igev-eth3d-finetune`:

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| Portable | 190,5 / 282 / 362 | 575,3 / 769 / 1036 | 1420,2 / 1690 / 2030 | 8918,7 (n=3) / 10549 / 14320 |
| Kernels | 82,5 / 260 / 368 | 212,8 / 693 / 1010 | 472,5 / 1502 / 2046 | 2806,7 (n=3) / 6928 / 8800 |

Arranque y primera llamada (variante `selective-igev-eth3d-finetune`): carga de 0,36 s (original), 0,50 s (portable) y 0,14 s (kernels, a 375x1242); primera llamada de 2,25 s (original), 1,02 s (portable) y 0,35 s (kernels). El resto de variantes presentan latencias prácticamente idénticas (diferencias inferiores a 1 ms en todas las resoluciones medidas).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos estéreo (IGEV-Stereo original, CREStereo, RAFT-Stereo) para establecer una comparativa con cifras verificables. La única comparación disponible es interna: frente a la implementación original en fp32, el backend `kernels` de este fork reduce la latencia entre 2,9x y 4,2x según la resolución, con menor memoria pico.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Selective-IGEV (fastforks) | no disponible | no aplica | Código MIT; pesos sin declarar | Hugging Face (manifiesto) + GitHub |
| IGEV-Stereo original | no disponible | no aplica | no disponible | GitHub de los autores |
| Otros modelos estéreo | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere pares de imágenes estéreo rectificadas; no corrige distorsión ni desalineación, lo que debe hacerse en una etapa previa.
- La resolución de entrada debe ser múltiplo de 32 (con padding); tamaños arbitrarios exigen preprocesado.
- El repositorio no aloja pesos: la inferencia depende de la disponibilidad de los enlaces de Google Drive de los autores y de la verificación SHA-256.
- La licencia de los pesos no está declarada por los autores; se asume MIT a partir del código, por lo que el uso comercial no está garantizado legalmente y debe revisarse antes de producción.
- Marcado como tier experimental: no hay resultados de precisión publicados en esta información, solo latencia y memoria.
- El consumo de memoria es elevado en alta resolución: 10,3 GiB pico asignados a 12 MP en fp16, lo que limita su uso en GPUs de gama media.
- Riesgo de artefactos en regiones ocluidas, texturas repetitivas, superficies sin textura y bordes de objeto, inherente a los métodos estéreo basados en correspondencia.
- No procesa texto ni imágenes individuales: no es un modelo multimodal ni un VLM.
- El sesgo del modelo está determinado por los datasets de entrenamiento (SceneFlow sintético, KITTI de conducción, ETH3D, Middlebury), lo que puede degradar el rendimiento en dominios no representados.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/selective-igev
- Repositorio del fork: https://github.com/kleinicke/fastforks
- Manifiesto de hashes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/selective_igev/card.toml
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Código original de Selective-Stereo: https://github.com/Windsrain/Selective-Stereo
- Evidencia de licencia del código original: https://github.com/Windsrain/Selective-Stereo/blob/c39acbfef9fbe36fbc01efa4abeafc62bbe2da36/README.md#L25
- Pesos `eth3d_finetune.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1fHtm5bno6usdcKEYLgH__yBLhMYDz0fs
- Pesos `eth3d_train.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1IQ6eP7oVy2MfRB9pIU0afPiXhnBT4QbG
- Pesos `kitti12.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1FS5LapV8uP19hce5pXw0wXMf7ZTz0djf
- Pesos `kitti15.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1ewtQTWvmPa4iGlRzIq4fcfk78LIq-Rim
- Pesos `middlebury_finetune.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1eBi5DC_mFfMNjvA13XhxpHkoP2ScUTqN
- Pesos `middlebury_train.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1WDFD3qNaklB_OQDxHAdnMFNWCd678iAI
- Pesos `sceneflow.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1N0VfCFcAwSEPeXdWcrSS0JlNa4xm2gIn
