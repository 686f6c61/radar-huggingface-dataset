# fastforks/great-igev

## Resumen

GREAT-IGEV es un modelo de estimación de disparidad estéreo (stereo matching) publicado por Li et al. en 2025 y empaquetado por el proyecto fastforks para su uso reproducible. Combina la arquitectura IGEV-Stereo con mecanismos de atención global: atención espacial, matching por filas epipolares y atención sobre el volumen de coste, generando un volumen de coste ponderado por excitación que después refina el ConvGRU de IGEV a lo largo de 32 iteraciones. El resultado es un mapa de disparidad en píxeles para el par de imágenes rectificadas de entrada.

El repositorio de HuggingFace es únicamente una model card: no aloja pesos. fastforks descarga los pesos originales de los autores desde enlaces de Google Drive y los verifica contra hashes SHA-256 registrados en el `card.toml` del proyecto. Se ofrecen cuatro variantes de pesos, cada una entrenada para un benchmark distinto: ETH3D, KITTI, Middlebury y SceneFlow. La tarea declarada es `depth-estimation` y la salida es un mapa de disparidad de la vista izquierda.

La relevancia de este empaquetado es de ingeniería más que de investigación: fastforks proporciona dos backends (`portable` y `kernels`) con kernels CUDA optimizados que, según las mediciones incluidas en la model card, aceleran la inferencia entre 2,8x y 3,7x frente al código original, con reducciones notables de memoria pico. Está marcado como "tier: experimental".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IGEV-Stereo con atención global (atención espacial, matching por filas epipolares y atención sobre volumen de coste); ConvGRU con 32 iteraciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión estéreo; entrada H x W >= 32, rellenada a múltiplo de 32) |
| Tipos de cuantizacion | fp32 (código original) y fp16 (backend portable y kernels); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Código: Apache-2.0. Pesos: los autores no declaran licencia específica de pesos; fastforks asume Apache-2.0 a partir del código. Licencia registrada: `apache-2.0-code-weights-unstated` |
| Formato de pesos | `.pth` (PyTorch), alojados por los autores, no en este repositorio |
| Tarea | Stereo matching / estimación de disparidad |
| Salida | Mapa de disparidad (píxeles, vista izquierda) |
| Backends | `portable`, `kernels` |
| Variantes | `great-igev-eth3d@1`, `great-igev-kitti@1`, `great-igev-middlebury@1`, `great-igev-sceneflow@1` |
| Nivel | Experimental |

## Arquitectura y entrenamiento

GREAT-IGEV parte de IGEV-Stereo e incorpora atención global en tres frentes: atención espacial sobre las características extraídas, matching restringido a filas epipolares (coherente con la geometría de un par estéreo rectificado) y atención sobre el volumen de coste. El resultado es un volumen de coste ponderado por excitación que alimenta el ConvGRU de IGEV, que itera 32 veces para refinar el mapa de disparidad. La entrada es un par de imágenes izquierda/derecha rectificadas y la salida es un mapa de disparidad en píxeles.

El entrenamiento utiliza el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. Cada variante de pesos está ajustada para un benchmark concreto (ETH3D, KITTI, Middlebury, SceneFlow), lo que implica que el modelo adecuado depende del dominio de despliegue. No se documenta en la información disponible el número de tokens ni detalles de RLHF/DPO, algo esperable en un modelo de visión sin componente lingüístico. La innovación técnica destacable, además de la atención global, es el empaquetado de fastforks con kernels CUDA especializados que reducen el tiempo de inferencia y la memoria pico frente a la implementación de referencia.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad en píxeles para la vista izquierda, convertible a profundidad con los parámetros de calibración.
- Resolución de entrada flexible: cualquier H x W >= 32, rellenada a múltiplo de 32.
- Cuatro variantes especializadas por dominio: ETH3D, KITTI, Middlebury y SceneFlow.
- Ejecución en dos backends: `portable` (fp16) y `kernels` (kernels CUDA optimizados, con aceleraciones de 2,8x a 3,7x).
- Verificación de integridad de pesos mediante SHA-256 registrados en el proyecto.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión más allá del matching estéreo (sin detección, segmentación ni descripción de imágenes).

## Casos de uso

- Reconstrucción 3D en robótica móvil: el modelo genera mapas de disparidad densos a partir de pares estéreo rectificados, adecuados para alimentar pipelines de nubes de puntos y odometría visual. La variante `kitti` está ajustada al dominio de conducción autónoma.
- Vehículos autónomos y ADAS: con la variante `kitti` y el backend `kernels`, procesa pares 1280x720 en unos 241 ms con 1041 MiB de memoria pico reservada, un régimen compatible con percepción en tiempo casi real.
- Escaneado de objetos y escenas de interior: la variante `middlebury` está orientada a escenas de laboratorio y objetos cercanos; a 640x480 tarda 131,4 ms con el backend `kernels`.
- Fotogrametría y captura de profundidad de alta resolución: a 12 MP (4000x3000) el backend `kernels` procesa en 3,75 s con unos 11,7 GiB de memoria pico asignada, viable en GPUs de 16 GB.
- Evaluación y benchmarking de algoritmos estéreo: las cuatro variantes permiten reproducir resultados en ETH3D, KITTI, Middlebury y SceneFlow con hashes de pesos verificables, útil para comparativas reproducibles.
- Prototipado en investigación con GPUs de consumo: el backend `portable` a 640x480 consume 681 MiB asignados y 206,7 ms, por lo que cabe en GPUs de gama media con 8 GB o más.
- Integración en pipelines de percepción con CUDA: los kernels del proyecto permiten sustituir la implementación de referencia manteniendo paridad numérica con los golden outputs del código original en CPU float32.

## Benchmarks y rendimiento

La model card no incluye métricas de precisión (EPE, bad-pixel rate, etc.) sobre los benchmarks estándar; solo datos de velocidad y memoria. Se reproduce lo disponible.

Tiempo y memoria en Middlebury 2014 half (994x1482):

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `great-igev-eth3d` | 2252,41 | 1458,32 | 1084,72 | 393,14 | 3,7x | 8861 / 9206 | 1402 / 1678 | 1192 / 1564 |
| `great-igev-middlebury` (max_disp 768) | – | – | 1785,35 | 578,81 | – | – | 1875 / 2078 | 1553 / 1744 |

Tiempo y memoria pico a tamaños fijos (formato: tiempo ms / memoria asignada / memoria reservada, MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP 4000x3000 |
|---|---|---|---|---|---|
| `great-igev-eth3d` | portable | 206,7 / 681 / 1030 | 627,7 / 1216 / 2262 | 1532,6 / 1688 / 2780 | 13067,4 / 11364 / 15106 |
| `great-igev-eth3d` | kernels | 99,0 / 385 / 476 | 241,2 / 1041 / 1338 | 544,2 / 1506 / 2354 | 3753,5 / 11736 / 15500 |
| `great-igev-kitti` | portable | 217,1 / 681 / 1030 | 628,2 / 1216 / 2262 | 1532,7 / 1688 / 2780 | 13065,3 / 11364 / 15106 |
| `great-igev-kitti` | kernels | 93,2 / 385 / 476 | 240,9 / 1041 / 1338 | 544,6 / 1506 / 2356 | 3755,4 / 11736 / 15500 |
| `great-igev-middlebury` (max_disp 768) | portable | 328,5 / 1082 / 1888 | 1025,5 / 1344 / 2262 | 2554,0 / 2549 / 4266 | OOM |
| `great-igev-middlebury` (max_disp 768) | kernels | 131,4 / 942 / 1258 | 356,0 / 1279 / 1906 | 804,4 / 1825 / 2656 | 6324,4 / 11920 / 15500 |
| `great-igev-sceneflow` | portable | 200,9 / 681 / 1030 | 624,1 / 1216 / 2262 | 1531,8 / 1688 / 2780 | 13071,3 / 11364 / 15106 |
| `great-igev-sceneflow` | kernels | 93,5 / 385 / 476 | 241,1 / 1041 / 1338 | 545,3 / 1506 / 2354 | 3759,3 / 11736 / 15500 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `great-igev-eth3d` | 0,44 (375x1242) | 0,32 | 0,23 | 4,60 (375x1242) | 1,10 | 0,40 |
| `great-igev-middlebury` (max_disp 768) | – | 3,91 | 0,61 | – | 1,81 | 0,59 |

Mediciones realizadas en una RTX 5060 Ti de 16 GB (sm_120). "Original" corresponde al código de los autores a la precisión de `portable` (fp16, o fp32 donde fp16 no es soportado o no es finito); "original fp32" es su ejecución por defecto en fp32. La memoria pico es la del asignador de PyTorch.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos estéreo (por ejemplo, IGEV-Stereo original, RAFT-Stereo, CREStereo o FoundationStereo). Los únicos datos comparativos disponibles son frente al código original de los autores, recogidos en la tabla anterior. Para el resto de alternativas: no disponible.

## Limitaciones y advertencias

- El repositorio no aloja pesos: la descarga depende de enlaces de Google Drive de los autores y de la verificación SHA-256 del proyecto. Si esos enlaces caen, la variante deja de ser instalable.
- La licencia de los pesos no está declarada por los autores; fastforks asume Apache-2.0 a partir del código. Para uso comercial conviene verificar la evidencia de licencia antes de desplegar.
- Marcado como "tier: experimental": no debe tratarse como un componente de producción estable sin validación propia.
- Requiere pares de imágenes rectificadas; sin rectificación previa la geometría epipolar no se cumple y el matching por filas pierde validez.
- Cada variante está ajustada a un dominio concreto (ETH3D, KITTI, Middlebury, SceneFlow); usar la variante equivocada degrada la precisión de forma no cuantificada en la información disponible.
- La variante `middlebury` con `max_disp 768` agota memoria (OOM) en el backend `portable` a 12 MP.
- La entrada debe rellenarse a múltiplos de 32; resoluciones arbitrarias introducen padding y coste adicional.
- No se publican métricas de precisión (EPE, bad-pixel) en la model card, por lo que no es posible evaluar la calidad del mapa de disparidad a partir de la información disponible.
- No es un modelo de lenguaje: no soporta instrucciones, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de categoría.
- Las mediciones de rendimiento proceden de una única GPU (RTX 5060 Ti, sm_120); el comportamiento en otras arquitecturas puede diferir.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/great-igev
- Repositorio del proyecto fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/great_igev/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original GREAT-Stereo (commit `2a6b1efede8c`): https://github.com/JarvisLee0423/GREAT-Stereo
- Evidencia de licencia (README original, línea 558): https://github.com/JarvisLee0423/GREAT-Stereo/blob/2a6b1efede8c3a9eec9540790c2700ea2f3dee7d/README.md#L558
