# fastforks/igev-stereo

## Resumen

IGEV-Stereo es un modelo de estimación de disparidad estéreo publicado originalmente por Xu et al. en 2023 (CVPR), basado en un volumen de correlación agrupada regularizado en 3D y refinado mediante actualizaciones iterativas de un ConvGRU (Iterative Geometry Encoding Volume). El repositorio `fastforks/igev-stereo` no contiene pesos: es una model card de integración que documenta cómo el framework fastforks descarga los pesos originales de los autores, verifica su SHA-256 y los ejecuta en dos backends (`portable` y `kernels`).

El modelo resuelve el problema clásico de *stereo matching*: dado un par de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles de la vista izquierda, del que se deriva profundidad por triangulación. Es relevante para pipelines de visión por computador que necesitan profundidad densa a partir de cámaras estéreo calibradas, con requisitos de latencia y memoria bien caracterizados en esta ficha.

La información disponible describe cinco variantes de pesos (eth3d, kitti12, kitti15, middlebury y sceneflow), todas con la misma arquitectura y distintos dominios de entrenamiento. No hay datos publicados sobre número de parámetros, longitud de contexto ni idiomas, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con volumen de correlación agrupada 3D y refinamiento por ConvGRU iterativo (IGEV, 32 iteraciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de cualquier H x W >= 32, con padding a múltiplo de 32 |
| Tipos de cuantizacion | fp32 (original) y fp16 (portable y kernels) según benchmarks publicados |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Código MIT; pesos sin licencia declarada por los autores (`mit-code-weights-unstated`); uso comercial asumido como permitido por fastforks |
| Formato de pesos | `.pth` (PyTorch), descargados desde enlaces de Google Drive de los autores |
| Tarea | `depth-estimation` (stereo matching) |
| Salida | Mapa de disparidad (píxeles, vista izquierda) |
| Backends | `portable`, `kernels` |
| Variantes | `igev-stereo-eth3d@1`, `igev-stereo-kitti12@1`, `igev-stereo-kitti15@1`, `igev-stereo-middlebury@1`, `igev-stereo-sceneflow@1` |

## Arquitectura y entrenamiento

IGEV-Stereo construye un volumen de correlación agrupada (group-wise correlation volume) que se regulariza en 3D y se refina mediante 32 iteraciones de un ConvGRU, que actualiza de forma iterativa el mapa de disparidad. Esta formulación iterativa permite alcanzar alta precisión en regiones con textura débil, superficies finas y bordes de objetos, a costa de un coste computacional proporcional al número de iteraciones.

Los pesos publicados se entrenaron sobre el dataset Freiburg SceneFlow (FlyingThings3D, Driving y Monkaa) y posteriormente se ajustaron por dominio para las variantes eth3d, kitti12, kitti15 y middlebury. No se dispone de información sobre el número exacto de tokens, composición detallada del dataset ni sobre el uso de RLHF/DPO, ya que no aplica a este tipo de modelo. La innovación técnica destacable es la combinación de volumen de correlación 3D regularizado con actualizaciones ConvGRU, que sustituye a los esquemas de coste 2D/3D más costosos de generaciones anteriores.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad en píxeles de la vista izquierda, convertible a profundidad métrica con la calibración de la cámara.
- Cinco variantes especializadas por dominio: escenas interiores/exteriores (eth3d), conducción (kitti12, kitti15), benchmarks académicos (middlebury) y escenas sintéticas (sceneflow).
- Entrada de tamaño arbitrario con H y W >= 32, con padding automático a múltiplo de 32.
- Ejecución en fp16 con backend `portable` y backend `kernels` optimizado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un modelo puramente visual.
- No soporta visión general (VQA, detección, segmentación): su única tarea es el matching estéreo.

## Casos de uso

- **Reconstrucción 3D y nubes de puntos**: a partir del mapa de disparidad y la calibración estéreo se genera una nube de puntos densa por frame; el modelo es adecuado por su precisión en bordes y superficies finas gracias al refinamiento ConvGRU de 32 iteraciones.
- **Robótica móvil y navegación**: estimación de profundidad en tiempo real a 640x480 con backend `kernels` en 70 ms por par, suficiente para control reactivo a ~14 FPS en una RTX 5060 Ti.
- **Vehículos autónomos y ADAS**: la variante `igev-stereo-kitti15` está ajustada al dominio de conducción (KITTI) y produce disparidad densa para detección de obstáculos y estimación de distancia.
- **Inspección industrial y metrología**: la variante `igev-stereo-eth3d` está orientada a escenas interiores y exteriores de alta resolución; con entradas de hasta 3000x4000 y 10.3 GiB de pico asignado en fp16 permite medir geometría fina en entornos controlados.
- **Captura volumétrica y telepresencia**: procesamiento por lotes de pares estéreo de alta resolución (12 MP en 2.3 s con backend `kernels`) para generar mallas o mapas de profundidad offline.
- **Benchmarking académico de stereo matching**: las variantes `middlebury` y `sceneflow` permiten reproducir resultados sobre los benchmarks estándar de la literatura y comparar contra otros métodos.
- **Preprocesado para pipelines de percepción**: la disparidad generada puede alimentar etapas posteriores de segmentación, SLAM visual o detección 3D, sustituyendo a sensores LiDAR en configuraciones de bajo coste.

## Benchmarks y rendimiento

Rendimiento en Middlebury 2014 half, 994x1482, sobre RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico asignada/reservada original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|---|
| `igev-stereo-eth3d` | 1518.1 | 941.3 | 763.48 | 288.25 | 3.3x | 2.6x | 1789 / 1936 | 1237 / 1492 | 1113 / 1374 |

Rendimiento a tamaños fijos (tiempo ms / memoria pico asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `igev-stereo-eth3d` | portable | 148.4 / 280 / 352 | 442.8 / 768 / 1034 | 1089.2 / 1689 / 2272 | 6940.4 (n=3) / 10547 / 14300 |
| `igev-stereo-eth3d` | kernels | 70.2 / 263 / 372 | 177.6 / 698 / 1000 | 391.1 / 1506 / 2044 | 2328.3 (n=3) / 6315 / 8190 |
| `igev-stereo-kitti12` | portable | 148.6 / 280 / 352 | 442.9 / 768 / 1034 | 1089.5 / 1689 / 2272 | 6944.6 (n=3) / 10547 / 14300 |
| `igev-stereo-kitti12` | kernels | 70.1 / 263 / 372 | 177.7 / 698 / 1000 | 391.5 / 1506 / 2044 | 2330.4 (n=3) / 6315 / 8190 |
| `igev-stereo-kitti15` | portable | 148.3 / 280 / 352 | 442.9 / 768 / 1034 | 1089.7 / 1689 / 2272 | 6944.1 (n=3) / 10547 / 14300 |
| `igev-stereo-kitti15` | kernels | 70.3 / 263 / 372 | 177.8 / 698 / 1000 | 391.3 / 1506 / 2044 | 2330.4 (n=3) / 6315 / 8190 |
| `igev-stereo-middlebury` | portable | 148.4 / 280 / 352 | 442.4 / 768 / 1034 | 1089.3 / 1689 / 2272 | 6939.3 (n=3) / 10547 / 14300 |
| `igev-stereo-middlebury` | kernels | 70.2 / 263 / 372 | 177.9 / 698 / 1000 | 391.5 / 1506 / 2044 | 2328.7 (n=3) / 6315 / 8190 |
| `igev-stereo-sceneflow` | portable | 148.6 / 280 / 352 | 442.9 / 768 / 1034 | 1089.8 / 1689 / 2272 | 6943.4 (n=3) / 10547 / 14300 |
| `igev-stereo-sceneflow` | kernels | 70.2 / 263 / 372 | 178.2 / 698 / 1000 | 392.0 / 1506 / 2044 | 2334.4 (n=3) / 6315 / 8190 |

Arranque y primera llamada (375x1242):

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `igev-stereo-eth3d` | 0.32 | 0.47 | 0.15† | 2.56 | 0.76† | 0.29† |

† Medición marcada con el símbolo tal como aparece en la documentación original.

No se han publicado resultados de benchmarks de precisión (EPE, D1, bad-x) en la información disponible. Las cifras anteriores son exclusivamente de latencia y memoria.

## Requisitos de hardware

- **VRAM estimada**: 280 MiB asignados / 352 MiB reservados a 640x480 en modo portable; 1689 / 2272 MiB a 1920x1080; 10547 / 14300 MiB a 12 MP. Con backend `kernels` el pico baja a 6315 / 8190 MiB a 12 MP.
- **GPU recomendadas**: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU con al menos 16 GB para entradas de 12 MP. Para resoluciones VGA o HD basta con GPUs de 4-8 GB.
- **Cabe en GPU de consumo**: sí. A 640x480 en `kernels` ocupa 263 MiB asignados, por lo que cabe en cualquier GPU moderna con 4 GB o más. A 12 MP requiere 16 GB.
- **Opciones de despliegue**: el repositorio usa el framework `fastforks` con backends `portable` y `kernels`; los kernels optimizados están en `fastforks/kernels`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- **Latencia y throughput**: a 640x480, 70.2 ms por par con `kernels` (~14 FPS); a 1280x720, 177.6 ms (~5.6 FPS); a 1920x1080, 391.1 ms (~2.6 FPS); a 12 MP, 2328.3 ms (~0.43 FPS). En modo `portable` los tiempos son aproximadamente 2.6x superiores.
- **Memoria en carga**: 0.15 s con `kernels` y 0.47 s con `portable`; primera llamada de 0.29 s y 0.76 s respectivamente.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de precisión ni de especificaciones de modelos alternativos (RAFT-Stereo, CREStereo, Selective-IGEV, etc.) que permitan una comparación rigurosa. La siguiente tabla recoge únicamente lo que se puede afirmar con la información disponible:

| Modelo | Parametros | Contexto/entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IGEV-Stereo (fastforks) | no disponible | cualquier HxW >= 32 | no disponible | MIT (código); pesos sin declarar | HuggingFace + GitHub |
| Selective-IGEV | no disponible | no disponible | no disponible | no disponible | no disponible |
| RAFT-Stereo | no disponible | no disponible | no disponible | no disponible | no disponible |
| CREStereo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos de dominio**: cada variante está ajustada a un dominio concreto (KITTI, ETH3D, Middlebury, SceneFlow); usar una variante fuera de su dominio puede degradar la precisión de forma significativa.
- **Dependencia de rectificación**: el modelo asume pares de imágenes rectificadas; sin rectificación previa la disparidad resultante no es válida.
- **Riesgo de alucinación geométrica**: en regiones ocluidas, sin textura o con reflexiones, el ConvGRU puede producir disparidades suavizadas o incorrectas sin señal de incertidumbre explícita.
- **Restricciones de licencia**: el código es MIT, pero los autores no declaran licencia para los pesos. fastforks asume uso comercial permitido por herencia del código; conviene verificar esta asunción antes de un despliegue comercial.
- **Repositorio sin pesos**: la model card no aloja los pesos; la descarga depende de enlaces de Google Drive de terceros y de la verificación SHA-256 documentada.
- **Caveat de rendimiento**: los benchmarks se midieron en una única GPU (RTX 5060 Ti, sm_120) y en fp16; el rendimiento en otras arquitecturas puede diferir.
- **Sin benchmarks de precisión publicados**: no hay cifras de EPE ni de porcentaje de píxeles erróneos en la información disponible, lo que impide validar la calidad frente a alternativas.
- **No apto para tareas lingüísticas ni multimodales generales**: no procesa texto, audio ni imágenes individuales fuera del contexto estéreo.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/igev-stereo
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original IGEV (commit 4a3d937aab78): https://github.com/gangweix/IGEV
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/igev_stereo/card.toml
- Evidencia de licencia: https://github.com/gangweix/IGEV/blob/4a3d937aab788b3ff3ed49b7b5c81340ab46a5eb/README.md#L17
- Pesos eth3d: https://drive.usercontent.google.com/download?export=download&confirm=t&id=19wL74xlvwCVsS0ZbotYDJ7B7K_BCpYzi
- Pesos kitti12: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1RpymdFO9sjtwDdjHk-PzSwb7h-qPbpis
- Pesos kitti15: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1VG47N7gPzkg-FIhge0XHtlOVHDVmMdek
- Pesos middlebury: https://drive.usercontent.google.com/download?export=download&confirm=t&id=12VFCIo6hiVbaTfpk2xOP_olQVTjQbl-B
- Pesos sceneflow: https://drive.usercontent.google.com/download?export=download&confirm=t&id=16e9NR_RfzFdYT5mPaGwpjccplCi82C2e
