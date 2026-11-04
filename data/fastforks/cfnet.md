# fastforks/cfnet

## Resumen

CFNet es un modelo de estereoscopía (stereo matching) publicado originalmente por Shen et al. en 2021, que estima un mapa de disparidad a partir de un par de imágenes izquierda/derecha rectificadas. La implementación que nos ocupa es un fork de ingeniería distribuido por el proyecto fastforks, que no aloja pesos propios: descarga los pesos originales de los autores y los verifica mediante SHA-256. El modelo emplea una arquitectura de volúmenes de coste en cascada y fusionados (volúmenes 3D fusionados de 1/8 a 1/32), seguida de dos etapas de refinamiento que se adaptan a la incertidumbre de la disparidad, con un máximo de 192 píxeles.

El paquete fastforks añade dos backends de ejecución: `portable` (PyTorch puro, fp16 por defecto) y `kernels` (kernels CUDA propios: `igev`, `cutlass_conv`, `cudnn_hacc`), con una aceleración de hasta 1,2x frente al backend portable. Está pensado para desarrolladores que necesitan integrar estimación de profundidad estéreo en pipelines de visión por computador sin reimplementar el modelo original, con paridad numérica verificada frente al código de referencia.

Es relevante ahora porque ofrece una vía reproducible y verificable (hashes, paridad de salida, benchmarks publicados) para desplegar un modelo clásico de estereoscopía en GPUs modernas, incluidas consumer, con control explícito de precisión y memoria. El proyecto se encuentra en fase experimental y no incluye pesos en el repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con volúmenes de coste en cascada y fusionados (1/8-1/32) y dos etapas de refinamiento adaptativo a la incertidumbre |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 64, múltiplo de 64) |
| Tipos de cuantizacion | fp32 (referencia original) y fp16 (por defecto en portable y kernels); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, sin entrada de texto) |
| Licencia | Código MIT; licencia de pesos no declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | checkpoint `.ckpt` de PyTorch (descargado desde enlace del autor, no alojado en el repo) |

## Arquitectura y entrenamiento

CFNet sigue la línea de redes de estereoscopía basadas en volúmenes de coste. Construye volúmenes de coste en cascada y los fusiona en volúmenes 3D a resoluciones de 1/8 a 1/32, y después aplica dos etapas de refinamiento que adaptan la predicción a la incertidumbre estimada de la disparidad. La disparidad máxima soportada es de 192 píxeles. La entrada es un par de imágenes rectificadas izquierda/derecha y la salida es un mapa de disparidad en píxeles de la vista izquierda, a la resolución de entrada.

El entrenamiento se realizó sobre el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni sobre etapas de RLHF/DPO (no aplicables a este tipo de modelo). La innovación técnica destacable del fork fastforks no está en la arquitectura, sino en la ingeniería de despliegue: backends `portable` y `kernels`, verificación SHA-256 de los pesos, paridad numérica frente a las salidas doradas del código original (máx. |diff| <= 0,002 en CPU fp32; media |diff| <= 0,05 px y p99 <= 0,5 px en GPU fp16) y selección explícita de backend sin fallback silencioso.

## Capacidades

- Estimación de disparidad estéreo a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad en píxeles de la vista izquierda, a resolución de entrada.
- Entrada de cualquier tamaño H x W >= 64, con padding automático a múltiplo de 64.
- Ejecución en GPU (CUDA) o CPU mediante el backend `portable`.
- Ejecución acelerada mediante kernels CUDA propios (`igev`, `cutlass_conv`, `cudnn_hacc`) en el backend `kernels`.
- Soporte de fp16 por defecto y fp32 para mayor fidelidad numérica.
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decisión.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D y nubes de puntos: el mapa de disparidad puede convertirse en profundidad mediante calibración estéreo, útil en pipelines de fotogrametría y digitalización de escenas.
- Robótica móvil y navegación: percepción de profundidad en tiempo real a resoluciones moderadas (por ejemplo, 640x480 en 59-74 ms), adecuada para evitación de obstáculos.
- Vehículos autónomos y ADAS: estimación de profundidad en pares estéreo rectificados para detección de obstáculos y distancias, con control de latencia por resolución.
- Inspección industrial y metrología: medición de disparidad en pares de cámaras calibradas para control de calidad dimensional.
- Realidad aumentada y visión por computador: generación de mapas de profundidad densos para oclusión y composición de escenas.
- Investigación en visión estéreo: banco de pruebas reproducible con paridad numérica verificada frente al código original, útil para comparativas y validación de nuevos métodos.
- Procesamiento por lotes de imágenes de alta resolución: con 16 GB de VRAM se ha probado hasta 1988x2880 en fp16 (8,2 GiB pico asignados), útil para datasets de imágenes aéreas o de gran formato.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados por fastforks (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo (ms) original fp32 | Portable | Kernels | Aceleración kernels vs portable | Memoria pico (MiB, asignada/reservada) original | Portable | Kernels |
|---|---|---|---|---|---|---|---|
| `cfnet-sceneflow` (Middlebury 2014 half, 994x1482) | 659,5 | 484,31 | 400,67 | 1,2x | 3441 / 4376 | 3662 / 4718 | no disponible |

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `cfnet-sceneflow` | portable | 73,6 ms / 1070 / 1588 MiB | 284,0 ms / 2640 / 4342 MiB | 758,8 ms / 4508 / 5956 MiB | OOM |
| `cfnet-sceneflow` | kernels | 59,3 ms / 1118 / 1618 MiB | 229,9 ms / 2778 / 4362 MiB | 634,1 ms / 4801 / 5976 MiB | OOM |

| Modelo | Carga (s) original | Portable | Kernels | Primera llamada (s) original | Portable | Kernels |
|---|---|---|---|---|---|---|
| `cfnet-sceneflow` | 0,39 (375x1242) | 0,94 | 0,21 | 0,24 (375x1242) | 0,48 | 0,40 |

Celdas de tamaño fijo: tiempo (ms) / memoria pico asignada / reservada (MiB). No se han publicado resultados de benchmarks de precisión (por ejemplo, EPE o bad-pixel rate) en la información disponible; solo se documenta la paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1-1,6 GiB a 640x480, 2,6-4,4 GiB a 1280x720 y 4,5-6,0 GiB a 1920x1080 (valores de memoria pico asignada/reservada según backend).
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU NVIDIA con soporte CUDA reciente y suficiente VRAM para la resolución objetivo.
- Cabe en GPU consumer: sí, en resoluciones hasta 1920x1080 con 8 GB o más; a 12 MP (4000x3000) se produce OOM en la RTX 5060 Ti 16 GB.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con backends `portable` (PyTorch) y `kernels` (CUDA precompilados descargados desde HuggingFace en el primer uso); también puede ejecutarse en CPU con el backend portable.
- Latencia y throughput: 59,3 ms (kernels) / 73,6 ms (portable) a 640x480; 229,9 / 284,0 ms a 1280x720; 634,1 / 758,8 ms a 1920x1080; 400,67 ms (kernels) / 484,31 ms (portable) a 994x1482.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.

## Comparativa con modelos similares

| Modelo | Tipo | Disparidad máxima | Entrada | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| CFNet (fastforks) | Estéreo con volúmenes de coste en cascada | 192 px | H x W >= 64, múltiplo de 64 | Código MIT; pesos sin declarar | Pesos descargados del autor, verificados por SHA-256 | 400,67 ms a 994x1482 (kernels) |
| IGEV (referenciado en kernels) | Estéreo iterativo | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos estéreo clásicos (por ejemplo, PSMNet, RAFT-Stereo) | Volúmenes de coste / iterativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de precisión ni de parámetros de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Requiere pares de imágenes rectificadas; no realiza rectificación ni calibración por sí mismo.
- Disparidad máxima limitada a 192 píxeles, lo que restringe escenas con gran disparidad o baselines amplios.
- El repositorio de HuggingFace no contiene pesos: depende de enlaces externos del autor y de la verificación SHA-256 del proyecto fastforks.
- La licencia de los pesos no está declarada por los autores; el uso comercial se asume a partir de la licencia MIT del código, pero debe verificarse antes de producción.
- Estado experimental: no hay garantías de estabilidad de API ni de soporte a largo plazo.
- El backend `kernels` solo funciona en arquitecturas de GPU con kernel precompilado disponible y driver NVIDIA reciente.
- OOM a 12 MP (4000x3000) en la GPU de referencia de 16 GB; resoluciones altas requieren GPUs con más VRAM o fragmentación.
- No se han publicado métricas de precisión (EPE, bad-pixel rate) en la información disponible; la única validación es la paridad con el código original.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de predicciones de disparidad erróneas en regiones ocluidas, texturas repetitivas o superficies sin textura.
- No soporta texto, tool calling ni agentes; no es un modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/cfnet
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels precompilados: https://huggingface.co/fastforks/kernels
- Código original CFNet: https://github.com/gallenszl/CFNet (commit `982230dd3605`)
- Evidencia de licencia: https://github.com/gallenszl/CFNet/blob/982230dd360583fc35743d0b7ed528982fe5fd38/README.md#L72
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `sceneflow_pretraining.ckpt`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1gFNUc4cOCFXbGv6kkjjcPw2cJWmodypv
