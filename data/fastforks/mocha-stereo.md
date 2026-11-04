# fastforks/mocha-stereo

## Resumen

MoCha-Stereo es un modelo de estimación de disparidad estéreo (stereo matching) orientado a la obtención de mapas de profundidad a partir de un par de imágenes izquierda/derecha rectificadas. Fue propuesto originalmente por Chen et al. en 2024 y esta ficha documenta la reconstrucción no oficial `fastforks/mocha-stereo`, un envoltorio que no aloja pesos propios sino que descarga los ficheros publicados por los autores originales y los verifica mediante SHA-256. El repositorio de HuggingFace es únicamente una model card: no contiene pesos.

La arquitectura combina un extractor de características EfficientNetV2-L, un volumen de correlación por canales tipo *motif* junto a un volumen geométrico de estilo IGEV, actualizaciones de un LSTM Mogrifier a tres niveles y una etapa de refinamiento, todo ello con 32 iteraciones de actualización. La variante `mocha-v2-sceneflow` es una reconstrucción no oficial, ya que los autores no publicaron el código de la V2. Los pesos disponibles se entrenaron sobre el dataset sintético Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa).

El modelo resulta relevante para pipelines de visión por computador que necesitan disparidad densa de alta resolución en GPU, con dos backends (`portable` en PyTorch y `kernels` con CUDA personalizado) y un rendimiento medido que alcanza aceleraciones de hasta 3,2x frente al código original. Su licencia es ambigua: el código es MIT, pero los pesos no tienen licencia declarada por los autores, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con volumen de correlación *motif* + volumen geométrico tipo IGEV, LSTM Mogrifier a 3 niveles y refinamiento; 32 iteraciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, con padding a múltiplo de 32) |
| Tipos de cuantizacion | fp32 y fp16 (los benchmarks usan ambos); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | Código: MIT. Pesos: no declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch), descargados desde las releases de GitHub de los autores |

## Arquitectura y entrenamiento

MoCha-Stereo es una red de *stereo matching* que estima un mapa de disparidad a partir de un par de imágenes rectificadas. El pipeline parte de características extraídas con EfficientNetV2-L y construye dos volúmenes complementarios: un volumen de correlación por canales de tipo *motif* y un volumen geométrico inspirado en IGEV. Sobre esos volúmenes opera un LSTM Mogrifier con actualizaciones a tres niveles, seguido de una etapa de refinamiento, con 32 iteraciones de actualización de la disparidad. La salida es un mapa de disparidad en píxeles referido a la vista izquierda.

El entrenamiento se realizó sobre el dataset sintético Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. No se documentan en la información disponible detalles sobre número de tokens (no aplica), composición exacta del dataset, ni si hubo etapas de refinamiento con datos reales o *fine-tuning*. La innovación técnica destacable es la combinación de ambos volúmenes de correlación con el LSTM Mogrifier y, en la implementación de fastforks, la existencia de kernels CUDA específicos (`igev`, `mocha`, `cutlass_conv`, `cudnn_hacc`) que aceleran la inferencia frente al código original.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes izquierda/derecha rectificadas.
- Generación de mapas de profundidad derivados de la disparidad (pipeline `depth-estimation`).
- Procesamiento de imágenes de cualquier resolución con H y W >= 32, con padding automático a múltiplo de 32; probado hasta 3000x4000 píxeles.
- Dos backends de ejecución: `portable` (PyTorch puro, GPU o CPU) y `kernels` (kernels CUDA personalizados con requisito de arquitectura GPU precompilada).
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decisión.
- Verificación de integridad de los pesos descargados mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- **Reconstrucción 3D y fotogrametría**: a partir de un par estéreo rectificado se obtiene un mapa de disparidad que, con los parámetros de calibración, se convierte en nube de puntos. Adecuado por su resolución de salida completa y su capacidad de procesar imágenes de hasta 12 MP.
- **Robótica móvil y navegación**: la disparidad densa permite estimar obstáculos y distancias en tiempo casi real; con el backend `kernels` se alcanzan 135 ms en 640x480, suficiente para bucles de control a baja frecuencia.
- **Vehículos autónomos y ADAS (prototipado)**: percepción de profundidad con pares estéreo calibrados; útil en fases de investigación y validación, no en producción comercial sin resolver la licencia de pesos.
- **Inspección industrial y metrología**: medición de distancias y volúmenes sobre objetos en escena controlada, aprovechando la paridad numérica con el código original (max |diff| <= 0.002 en CPU fp32).
- **Realidad aumentada y captura volumétrica**: generación de mapas de profundidad para oclusión y anclaje de objetos virtuales en escenas reales capturadas con cámaras estéreo.
- **Procesamiento por lotes de alta resolución**: con 12,2 GiB de pico en 3000x4000 y el backend `kernels` (4,4 s por par), es viable procesar lotes de imágenes de alta resolución en GPUs de 16 GB.
- **Investigación en *stereo matching***: reproducción de resultados y comparación de variantes V1/V2 frente al código original, con verificación de hashes y paridad numérica documentada.

## Benchmarks y rendimiento

Rendimiento en Middlebury 2014 half (994x1482), hardware RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `mocha-v1-sceneflow` | 2148,5 | 1456,2 | 1057,19 | 455,46 | 3,2x | 3637 / 3982 | 1632 / 1770 | 1588 / 1730 |
| `mocha-v2-sceneflow` | 2054,3 | 1295,1 | 1033,49 | 448,12 | 2,9x | 3576 / 3982 | 1632 / 1770 | 1587 / 1790 |

Rendimiento y memoria a tamaños fijos (tiempo ms / memoria asignada / memoria reservada, en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `mocha-v1-sceneflow` | portable | 231,1 / 500 / 662 | 628,3 / 1078 / 1438 | 1484,8 / 2164 / 2688 | 10361,4 / 12466 / 15520 |
| `mocha-v1-sceneflow` | kernels | 135,4 / 495 / 694 | 317,0 / 1055 / 1338 | 718,5 / 2092 / 2484 | 4396,8 / 11664 / 14958 |
| `mocha-v2-sceneflow` | portable | 227,0 / 500 / 662 | 613,9 / 1078 / 1438 | 1451,9 / 2164 / 2688 | 10135,5 / 12464 / 15164 |
| `mocha-v2-sceneflow` | kernels | 133,6 / 494 / 654 | 312,9 / 1054 / 1456 | 709,3 / 2091 / 2482 | 4316,6 / 11664 / 14404 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `mocha-v1-sceneflow` | 1,95 | 0,79 | 0,48 | 1,85 | 1,06 | 0,45 |
| `mocha-v2-sceneflow` | 2,37 | 1,30 | 0,45 | 0,40 | 1,03 | 0,45 |

Paridad con el código original: en CPU y float32, max |diff| <= 0,002; en GPU y float16 (por defecto), media |diff| <= 0,02 px y p99 <= 0,25 px. No se han publicado resultados de benchmarks estándar de *stereo matching* (por ejemplo, EPE en KITTI o Middlebury) en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de *stereo matching* (IGEV, CREStereo, RAFT-Stereo) en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. A continuación se comparan únicamente los aspectos documentados:

| Modelo | Tipo | Volumen de correlación | Iteraciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mocha-v1-sceneflow` | Estéreo denso | Motif + geométrico IGEV | 32 | Código MIT, pesos sin declarar | Pesos en releases de GitHub |
| `mocha-v2-sceneflow` | Estéreo denso | Motif + geométrico IGEV | 32 | Código MIT, pesos sin declarar | Reconstrucción no oficial |
| IGEV-Stereo | Estéreo denso | Geométrico | no disponible | no disponible | no disponible |
| CREStereo | Estéreo denso | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia de pesos ambigua**: el código es MIT, pero los autores no declaran licencia para los pesos. El repositorio asume MIT "asumido del código" y marca el uso comercial como "yes", pero esta suposición no está respaldada por una declaración explícita; conviene verificar antes de cualquier uso en producción.
- **Reconstrucción no oficial de la V2**: `mocha-v2-sceneflow` es una reconstrucción porque los autores no publicaron el código de la V2; puede haber divergencias no documentadas respecto al modelo original.
- **Dependencia de entrada rectificada**: requiere pares de imágenes rectificadas; sin calibración correcta la disparidad no es métricamente válida.
- **Solo escenas sintéticas en entrenamiento**: entrenado sobre SceneFlow (FlyingThings3D, Driving, Monkaa); el rendimiento en dominios reales (KITTI, Middlebury) no está documentado en esta ficha.
- **Backend `kernels` con requisitos estrictos**: necesita un kernel precompilado para la arquitectura GPU concreta y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` y no hace *fallback* silencioso.
- **Memoria elevada a alta resolución**: 12,2 GiB de pico en 3000x4000, lo que limita su uso a GPUs de 16 GB o superiores para ese tamaño.
- **Sin capacidades de texto ni agentes**: no es un modelo de lenguaje; no soporta tool calling, razonamiento multi-paso ni multilingüismo.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de disparidad errónea en regiones oclusivas, texturas repetitivas o superficies especulares, inherente a todo método estéreo.
- **Sin datos de sesgo**: no se documentan sesgos específicos del dataset sintético empleado.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/mocha-stereo
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Código original de MoCha-Stereo (commit fijado): https://github.com/ZYangChen/MoCha-Stereo/tree/78c5889c467fe31414c9425f1280afc0a8f6c1a0
- Evidencia de licencia (README original): https://github.com/ZYangChen/MoCha-Stereo/blob/78c5889c467fe31414c9425f1280afc0a8f6c1a0/README.md#L69
- Pesos V1: https://github.com/ZYangChen/MoCha-Stereo/releases/download/MoCha-Stereo-V1/mocha-stereo.pth
- Pesos V2: https://github.com/ZYangChen/MoCha-Stereo/releases/download/MoCha-V2/mocha-V2.pth
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/mocha_stereo/card.toml
