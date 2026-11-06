# fastforks/psmnet

## Resumen

PSMNet (Pyramid Stereo Matching Network) es una red neuronal convolucional para estimación de disparidad estéreo publicada por Jia-Ren Chang y Yong-Sheng Chen en 2018 (CVPR). Dada una pareja de imágenes izquierda y derecha rectificadas, el modelo produce un mapa de disparidad a resolución de entrada, a partir del cual puede derivarse profundidad. La arquitectura combina una pirámide espacial (SPP) para capturar contexto multiescala con un volumen de coste 3-D por concatenación y tres hourglasses 3-D apilados, con regresión final mediante soft-argmin y una disparidad máxima de 192 píxeles.

El repositorio `fastforks/psmnet` no contiene pesos: es una model card que documenta la integración del modelo en la librería `fastforks`. La librería descarga los pesos originales de los autores y los verifica contra un SHA-256, ofreciendo dos backends: `portable` (PyTorch puro) y `kernels` (kernels CUDA precompilados). Está marcado como tier experimental y su relevancia actual es la de un baseline clásico de stereo matching reproducible y acelerado, útil para pipelines de visión 3-D, robótica y conducción autónoma.

El modelo se entrenó sobre Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa) y solo se distribuye la variante `psmnet-sceneflow@1`. La licencia del código es MIT; los autores no declaran una licencia separada para los pesos, por lo que el uso comercial de estos queda sin especificar formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con pirámide espacial (SPP), volumen de coste 3-D por concatenación y tres hourglasses 3-D apilados con soft-argmin |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W >= 241, padding a múltiplo de 16) |
| Tipos de cuantizacion | fp32 (referencia original) y fp16 (por defecto en GPU en el backend portable y kernels) |
| Idiomas soportados | no aplica (modelo de visión estéreo) |
| Licencia | Código MIT; pesos sin licencia declarada por los autores (`mit-code-weights-unstated`) |
| Formato de pesos | Pesos originales de los autores (`pretrained_sceneflow_new.tar`), verificados por SHA-256; no se alojan en el repo |

## Arquitectura y entrenamiento

PSMNet es una red convolucional 2-D/3-D híbrida. Un extractor de características con pirámide espacial (SPP) procesa cada imagen del par estéreo para obtener representaciones multiescala; a continuación se construye un volumen de coste 3-D por concatenación de las características izquierda y derecha a lo largo de la dimensión de disparidad. Sobre ese volumen se aplican tres hourglasses 3-D apilados que refinan el coste de forma jerárquica, y la disparidad final se obtiene por soft-argmin, con un rango máximo de 192 píxeles. La entrada admite cualquier H x W >= 241, con padding a múltiplo de 16; la salida es un mapa de disparidad float32 a resolución de entrada.

El entrenamiento se realizó sobre Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. La model card no documenta el número de tokens ni detalles de RLHF/DPO (no aplica a este tipo de modelo). La innovación destacable de la integración `fastforks` es la sustitución de las operaciones 3-D más costosas por kernels CUDA propios (`igev`, `cutlass_conv`, `cudnn_hacc`), que aceleran la inferencia hasta 2,6x frente al código original en fp32 y 1,5x frente al backend portable, con una reducción notable de memoria pico.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad en píxeles de la vista izquierda, a resolución de entrada, en float32.
- Derivación de profundidad a partir de la disparidad (requiere parámetros de calibración de la cámara, no incluidos en el modelo).
- Manejo de resoluciones variables desde 241 px de lado hasta al menos 1988x2880 en el backend portable con fp16.
- Ejecución en GPU (CUDA) o CPU mediante el backend `portable`; backend `kernels` opcional con kernels precompilados por arquitectura.
- Verificación de integridad de pesos por SHA-256 y comprobación de paridad contra las salidas doradas del código original.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general ni audio: es un modelo específico de stereo matching.

## Casos de uso

- Reconstrucción 3-D en robótica móvil: el modelo genera mapas de disparidad densos a partir de pares estéreo calibrados, que se convierten en nubes de puntos para navegación y evitación de obstáculos; su resolución de entrada flexible permite adaptarse a cámaras de distintos sensores.
- Percepción en conducción autónoma y ADAS: estimación de profundidad a partir de cámaras estéreo para detección de obstáculos y distancias, con latencias de 140-330 ms en 1280x720 y 1920x1080 en el backend `kernels`, adecuadas para procesamiento por frame.
- Baseline reproducible en investigación: la verificación de paridad (max |diff| <= 0.002 en CPU fp32; mean |diff| <= 0.05 px y p99 <= 0.5 px en GPU fp16) permite usarlo como referencia controlada frente a métodos más recientes.
- Pipelines de visión 3-D en producción con requisitos de memoria ajustados: el backend `kernels` reduce la memoria pico a 1108 MiB en 1280x720 y 2459 MiB en 1920x1080, lo que permite desplegarlo en GPUs de gama media.
- Procesamiento por lotes de imágenes de alta resolución: soporta hasta 1988x2880 en fp16 con 7,6 GiB de memoria pico asignada en una RTX 5060 Ti de 16 GB, útil para fotogrametría o inspección industrial.
- Docencia y prototipado: instalación con `pip install fastforks` y API de tres líneas (`stereo.load`, llamada con dos rutas de imagen, acceso a `result.disparity`), lo que facilita experimentos sin gestionar el código original de 2018.
- Integración en sistemas de captura de profundidad de bajo coste: sustituye hardware de depth sensing en escenarios con pares estéreo ya disponibles (drones, vehículos, cámaras industriales).

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120; Middlebury 2014 half, 994x1482):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB alloc/res) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `psmnet-sceneflow` | 759,6 | 607,8 | 339,98 | 231,81 | 2,6x | 6015 / 6090 | 2078 / 2442 | 1786 / 2122 |

Velocidad y memoria pico por resolución fija:

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `psmnet-sceneflow` | portable | 69,0 ms / 426 / 606 MiB | 206,2 ms / 1256 / 1780 MiB | 479,2 ms / 2834 / 3966 MiB | OOM |
| `psmnet-sceneflow` | kernels | 49,6 ms / 415 / 518 MiB | 140,3 ms / 1108 / 1414 MiB | 329,2 ms / 2459 / 3104 MiB | OOM |

Arranque y primera llamada:

| Modelo | Carga (s): original / portable / kernels | Primera llamada (s): original / portable / kernels |
|---|---|---|
| `psmnet-sceneflow` | 0,20 (375x1242) / 0,10 / 0,08 | 0,53 (375x1242) / 0,35 / 0,23 |

No se han publicado resultados de benchmarks de precisión (EPE, D1, etc.) sobre KITTI, Middlebury o ETH3D en la informacion disponible. Solo se documenta la paridad numérica con el código original.

## Requisitos de hardware

- VRAM estimada: 415-518 MiB en 640x480, 1108-1414 MiB en 1280x720 y 2459-3104 MiB en 1920x1080 con el backend `kernels`; hasta 7,6 GiB asignados (10,6 reservados) en 1988x2880 en fp16 portable.
- GPU recomendadas: cualquier NVIDIA con soporte CUDA reciente; el backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU (se descarga de `fastforks/kernels` en el primer uso) y un driver NVIDIA reciente, con `BackendUnavailableError` si no hay kernel disponible (sin fallback silencioso).
- Cabe en GPUs de consumo: sí; los benchmarks se realizaron en una RTX 5060 Ti de 16 GB. Resoluciones de 12 MP (4000x3000) provocan OOM en esa GPU.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con backends `portable` (PyTorch, GPU o CPU) y `kernels` (CUDA); `mode="auto"` selecciona `kernels` cuando puede ejecutarse. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 49,6 ms por par en 640x480 y 329,2 ms en 1920x1080 con `kernels`; 69,0 ms y 479,2 ms respectivamente con `portable`; 231,81 ms en 994x1482 con `kernels` frente a 759,6 ms del código original en fp32.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de precisión (EPE, D1) de PSMNet ni de alternativas en la informacion proporcionada, por lo que la comparación se limita a características estructurales conocidas de la literatura:

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PSMNet (fastforks) | no disponible | H x W >= 241, padding a múltiplo de 16 | Disparidad (max 192 px) | Código MIT; pesos sin declarar | Hugging Face (card) + GitHub |
| GC-Net | no disponible | Par estéreo rectificado | Disparidad | no disponible | Código original |
| DispNetC | no disponible | Par estéreo rectificado | Disparidad | no disponible | Código original |
| CREStereo / RAFT-Stereo | no disponible | Par estéreo rectificado | Disparidad | no disponible | Repos públicos |

No disponible: comparación cuantitativa de precisión, latencia o memoria frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere imágenes estéreo rectificadas y calibradas; no acepta una sola imagen ni pares no rectificados.
- Rango de disparidad limitado a 192 píxeles, lo que restringe la profundidad mínima detectable en escenas cercanas.
- Entrada mínima de 241 px por lado y padding forzado a múltiplo de 16; resoluciones de 12 MP provocan OOM en la GPU de referencia.
- Pesos entrenados únicamente en datos sintéticos (Freiburg SceneFlow); el rendimiento en dominios reales (KITTI, Middlebury, ETH3D) no está documentado en la model card y puede degradarse por el gap sintético-real.
- Licencia de pesos sin declarar por los autores: el uso comercial de los pesos no está formalmente autorizado, aunque la model card asume MIT para ellos; conviene revisar las cadenas de licencia originales antes de cualquier uso en producción.
- Tier experimental: el backend `kernels` depende de kernels precompilados por arquitectura y puede no estar disponible en GPUs no cubiertas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de disparidades erróneas en regiones oclusivas, texturas repetitivas y superficies sin textura.
- Sesgos conocidos: no documentados en la informacion disponible.
- La model card no incluye métricas de precisión estándar (EPE, D1, bad-x), lo que dificulta evaluar su calidad frente a métodos más recientes.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/psmnet
- Repositorio de la librería fastforks: https://github.com/kleinicke/fastforks
- Kernels precompilados: https://huggingface.co/fastforks/kernels
- Código original de PSMNet: https://github.com/JiaRenChang/PSMNet (commit `87ac9093afbf`)
- Evidencia de licencia (README original): https://github.com/JiaRenChang/PSMNet/blob/87ac9093afbf6545c093bd9d26c5ffd66e49a7b8/README.md#L96-L98
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `pretrained_sceneflow_new.tar` (enlace de los autores): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1NDKrWHkwgMKtDwynXVU12emK3G5d5kkp
