# fastforks/cas-gwcnet

## Resumen

Cas-GwcNet es un modelo de correspondencia estéreo (stereo matching) desarrollado originalmente por Gu et al. en 2020 dentro del proyecto Cascade Stereo de Alibaba, y redistribuido por fastforks como un paquete de inferencia listo para usar. El modelo resuelve el problema de estimar un mapa de disparidad (disparity map) a partir de un par de imágenes rectificadas izquierda/derecha, lo que permite reconstruir profundidad y alimentar pipelines de estimación de profundidad estéreo.

Técnicamente es una red convolucional con dos etapas en cascada: la primera genera un volumen de coste con 48 hipótesis de disparidad y la segunda refina con 24 hipótesis estrechadas alrededor del resultado anterior, usando hourglasses 3D de estilo GwcNet. Existen dos variantes según cómo se construye el volumen de coste: group-wise correlation + concatenación (`gc`) o solo concatenación (`c`).

La relevancia actual es acotada y práctica: fastforks no aloja pesos propios, sino que descarga los checkpoints originales de los autores y los verifica con SHA-256, ofreciendo backends `portable` (PyTorch) y `kernels` (CUDA propio) con aceleraciones medidas de hasta 1,7x frente al código original. Es un modelo experimental orientado a investigación y prototipado, no a producción crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con volumen de coste en cascada de dos etapas y hourglasses 3D estilo GwcNet (cascade stereo, Gu et al. 2020) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 (referencia original) y fp16 (por defecto en fastforks) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Código MIT; pesos sin licencia declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | checkpoints `.ckpt` (PyTorch) descargados de enlaces de los autores; este repo no aloja pesos |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cascade Stereo de Gu et al. (2020). Construye un volumen de coste de dos etapas: la primera emplea 48 hipótesis de disparidad y la segunda 24 hipótesis estrechadas alrededor del resultado de la primera etapa. Sobre ese volumen se aplican hourglasses 3D de estilo GwcNet. La variante `gc` combina group-wise correlation con concatenación en el volumen de coste, mientras que la variante `c` usa solo concatenación.

El entrenamiento se realizó sobre el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. No se dispone de información sobre número de tokens (no aplica), composición detallada del dataset ni uso de RLHF/DPO (no aplica a un modelo de visión). La innovación técnica destacable es la cascada de dos etapas con estrechamiento de hipótesis, que reduce el coste computacional del volumen de disparidad frente a un volumen denso de una sola etapa.

## Capacidades

- Estimación de disparidad estéreo a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de un mapa de disparidad en píxeles de la vista izquierda, a la resolución de entrada.
- Entrada de tamaño arbitrario H x W con padding a múltiplo de 32; mínimo 225x225 en la variante `c` y 32x32 en la variante `gc`.
- Dos variantes de volumen de coste (`c` y `gc`) con distinto equilibrio entre precisión y consumo de memoria.
- Dos backends de ejecución: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA propios: `igev`, `cutlass_conv`, `cudnn_hacc`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de una sola tarea.

## Casos de uso

- Reconstrucción 3D y fotogrametría: a partir de pares estéreo rectificados se obtiene el mapa de disparidad que, junto con los parámetros intrínsecos de la cámara, permite generar nubes de puntos y mallas de profundidad en pipelines de escaneo de escenas.
- Robótica móvil y navegación: la variante `kernels` procesa 1280x720 en 135,5 ms (variante `c`) con 1242 MiB reservados, adecuado para estimación de profundidad en tiempo casi real en plataformas con GPU embebida.
- Vehículos autónomos y ADAS en fase de investigación: el modelo está entrenado en SceneFlow (incluye Driving), por lo que es un punto de partida razonable para experimentos de percepción estéreo antes de adaptar a datasets propios.
- Inspección industrial y metrología: con pares estéreo calibrados y rectificados se pueden medir distancias y volúmenes de piezas; la resolución de entrada flexible permite trabajar con imágenes de alta resolución (probado hasta 1988x2880).
- Prototipado de pipelines de depth-estimation: al integrarse en el ecosistema `fastforks` con una API de tres líneas (`stereo.load` + llamada + `result.disparity`), sirve para validar hipótesis de producto antes de invertir en modelos más pesados.
- Benchmarking y comparación de backends: útil para medir el impacto de kernels CUDA personalizados frente a PyTorch estándar en tareas de visión, con métricas publicadas de latencia y memoria por resolución.

## Benchmarks y rendimiento

Rendimiento en estéreo sobre Middlebury 2014 half, 994x1482 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB, alloc/reserved) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `cas-gwcnet-c-sceneflow` | 655,9 | 389,1 | 326,99 | 225,4 | 1,7x | 2791 / 2970 | 2006 / 2474 | 1725 / 1930 |
| `cas-gwcnet-gc-sceneflow` | 862,8 | – | 471,55 | 357,52 | – | – | 2338 / 2794 | 2272 / 2514 |

Rendimiento y memoria pico por resolución fija (tiempo ms / alloc / reserved en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP 4000x3000 |
|---|---|---|---|---|---|
| `cas-gwcnet-c-sceneflow` | portable | 61,3 / 465 / 738 | 195,5 / 1386 / 2160 | 452,8 / 3046 / 4720 | OOM |
| `cas-gwcnet-c-sceneflow` | kernels | 44,8 / 442 / 568 | 135,5 / 1242 / 1586 | 316,1 / 2692 / 3408 | OOM |
| `cas-gwcnet-gc-sceneflow` | portable | 86,7 / 533 / 1166 | 281,6 / 1588 / 3308 | 647,4 / 3494 / 7262 | OOM |
| `cas-gwcnet-gc-sceneflow` | kernels | 66,9 / 510 / 956 | 213,7 / 1449 / 2606 | 493,8 / 3147 / 5634 | OOM |

Precisión frente al código original: en CPU float32, diferencia máxima absoluta <= 0,002; en GPU float16 (por defecto), diferencia media <= 0,05 px y p99 <= 0,5 px, para ambas variantes y ambos backends.

No se han publicado resultados de benchmarks estándar (por ejemplo, EPE en KITTI o Middlebury) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,5 GiB reservados a 994x1482 en la variante `c`; 2,3-2,8 GiB en la variante `gc`; hasta 3,4 GiB (kernels) y 4,7 GiB (portable) a 1920x1080 en la variante `c`.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; el backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU (se descarga de `fastforks/kernels` en el primer uso) y drivers NVIDIA recientes.
- Cabe en GPU de consumo: sí. Las pruebas se hicieron en una RTX 5060 Ti de 16 GB; a 1920x1080 la variante `c` en modo kernels usa ~2,7 GiB asignados, por lo que también cabe en GPUs de 8 GB para resoluciones moderadas.
- A 12 MP (4000x3000) se produce OOM en las configuraciones probadas.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`), con backends `portable` (PyTorch, GPU o CPU) y `kernels` (CUDA). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 44,8 ms a 640x480 y 316,1 ms a 1920x1080 en modo kernels (variante `c`); 66,9 ms y 493,8 ms respectivamente en la variante `gc`. Carga del modelo entre 0,17 y 1,29 s según backend y variante.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de correspondencia estéreo en la información proporcionada para establecer una comparativa rigurosa con cifras. A modo cualitativo, la comparación interna entre las dos variantes del propio modelo es la siguiente:

| Modelo | Etapas | Hipótesis de disparidad | Volumen de coste | Tiempo 1920x1080 (kernels) | Memoria pico (kernels) | Licencia |
|---|---|---|---|---|---|---|
| `cas-gwcnet-c-sceneflow` | 2 | 48 + 24 | concatenación | 316,1 ms | 2692 / 3408 MiB | MIT (código); pesos sin declarar |
| `cas-gwcnet-gc-sceneflow` | 2 | 48 + 24 | group-wise correlation + concatenación | 493,8 ms | 3147 / 5634 MiB | MIT (código); pesos sin declarar |

## Limitaciones y advertencias

- Modelo experimental (tier `experimental` según el autor del paquete): no está pensado para producción crítica sin validación adicional.
- Requiere pares de imágenes rectificadas; no realiza rectificación ni calibración por sí mismo.
- Entrenado únicamente en Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa): puede generalizar mal a dominios muy distintos (interiores, imágenes médicas, escenas nocturnas) sin fine-tuning.
- OOM a 12 MP (4000x3000) en las configuraciones probadas; la resolución máxima práctica está limitada por la VRAM.
- Licencia de pesos no declarada por los autores: el código es MIT, pero el uso comercial de los checkpoints se asume a partir del código y debe verificarse antes de cualquier uso en producción.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU concreta y no hace fallback silencioso: si no hay kernel disponible lanza `BackendUnavailableError`.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos: en regiones oclusivas, sin textura o con reflejos, el mapa de disparidad puede contener errores que no se señalan explícitamente.
- Este repositorio de HuggingFace no contiene pesos: la inferencia depende de la disponibilidad de los enlaces de descarga de los autores y de la verificación SHA-256.
- Sin soporte multilingüe, tool calling ni agentes; no es un modelo de lenguaje.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/cas-gwcnet
- Repositorio del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend CUDA: https://huggingface.co/fastforks/kernels
- Código original Cascade Stereo (Alibaba): https://github.com/alibaba/cascade-stereo
- Commit fijado del código original: https://github.com/alibaba/cascade-stereo/tree/2ae7da65515c82025383a0fbee8d6fe063dc7101
- Evidencia de licencia (README original): https://github.com/alibaba/cascade-stereo/blob/2ae7da65515c82025383a0fbee8d6fe063dc7101/CasStereoNet/README.md#L17-L19
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos variante `c`: https://virutalbuy-public.oss-cn-hangzhou.aliyuncs.com/share/cascade-stereo/CasStereoNet/gwcnet-c/casgwcnet-c-2.ckpt
- Pesos variante `gc`: https://virutalbuy-public.oss-cn-hangzhou.aliyuncs.com/share/cascade-stereo/CasStereoNet/gwcnet/casgwcnet.ckpt
