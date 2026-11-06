# fastforks/coex

## Resumen

CoEx es un modelo de estimación de disparidad estéreo publicado originalmente por Bangunharcana et al. en 2021, que combina características extraídas con MobileNetV2, un volumen de correlación ponderado por atención, agregación 3-D con "guided cost excitation", soft-argmax top-2 y un módulo de upsampling basado en superpíxeles, con una disparidad máxima de 192 píxeles. El repositorio `fastforks/coex` no contiene pesos propios: es una model card que documenta cómo el framework fastforks descarga los pesos de los autores originales y los valida mediante SHA-256.

La relevancia actual de esta ficha no está en el modelo en sí (es un trabajo de 2021), sino en la infraestructura que lo envuelve: fastforks ofrece dos backends de inferencia (`portable` en PyTorch y `kernels` con kernels CUDA propios) y publica mediciones de latencia y memoria comparadas con el código original. En una RTX 5060 Ti de 16 GB, el backend `kernels` procesa un par estéreo de 994x1482 en 23,48 ms frente a los 94,9 ms del código original en fp32, con un pico de memoria de 495 MiB asignados.

El modelo resuelve una tarea concreta: dado un par de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles de la vista izquierda. Está entrenado exclusivamente con Freiburg SceneFlow, por lo que su utilidad práctica principal es servir como referencia de latencia y como banco de pruebas de los backends de fastforks, no como solución lista para producción en imágenes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone MobileNetV2, volumen de correlación ponderado por atención, agregación 3-D con guided cost excitation, soft-argmax top-2 y superpixel upsampling |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp32 (original), fp16 (por defecto en portable y kernels) |
| Idiomas soportados | no disponible |
| Licencia | Código GPL-3.0-only; licencia de pesos no declarada por los autores (weights licence unstated) |
| Formato de pesos | checkpoint `.ckpt` (sceneflow.ckpt), descargado desde enlace externo de los autores; no se alojan en Hugging Face |
| Tarea | stereo matching / depth estimation |
| Entrada | par de imágenes rectificadas izquierda/derecha, cualquier H x W >= 32, con padding a múltiplo de 32 |
| Salida | mapa de disparidad `[H, W]` float32 a resolución de entrada |
| Disparidad máxima | 192 píxeles |
| Backends | `portable` (PyTorch), `kernels` (CUDA: igev, cutlass_conv, cudnn_hacc, stereo_ops) |
| Variantes | `coex-sceneflow@1` |
| SHA-256 (12 hex) | `e618be2d75cd` |
| Dataset de entrenamiento | Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa) |
| Librería | fastforks |

## Arquitectura y entrenamiento

CoEx sigue un diseño de matching estéreo denso en dos etapas. Primero extrae características de ambas imágenes con un backbone MobileNetV2 y construye un volumen de correlación al que aplica ponderación por atención, de modo que el modelo aprende a priorizar regiones del volumen más informativas para la correspondencia. Después agrega ese volumen en 3-D mediante convoluciones guiadas por "guided cost excitation", un mecanismo que modula las características agregadas con información de coste para refinar la estimación.

La predicción final de disparidad se obtiene con un soft-argmax top-2, que combina las dos hipótesis de mayor probabilidad en lugar de tomar únicamente el máximo, y con un módulo de upsampling basado en superpíxeles que recupera la resolución original. La disparidad máxima está fijada en 192 píxeles. El entrenamiento se realizó exclusivamente sobre Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa; no se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste posteriores, algo esperable en un modelo de visión de 2021.

La innovación técnica relevante en este repositorio no es del modelo, sino del framework: fastforks implementa un backend `portable` en PyTorch y un backend `kernels` con kernels CUDA propios, y verifica la paridad numérica contra las salidas doradas del código original en su commit fijado (`a98b37d33f37`). En CPU y float32 la diferencia máxima absoluta es <= 0,002; en GPU y float16, tanto en portable como en kernels, la diferencia media es <= 0,02 px y el p99 <= 0,25 px.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas.
- Generación de mapas de profundidad derivados de la disparidad (pipeline `depth-estimation`).
- Procesamiento a resolución arbitraria con H x W >= 32, con padding automático a múltiplo de 32.
- Ejecución en GPU con fp16 por defecto o en CPU cuando no hay GPU disponible.
- Selección automática de backend con `mode="auto"`, que elige `kernels` cuando puede ejecutarse y registra la decisión.
- Backend `kernels` con kernels CUDA especializados (`igev`, `cutlass_conv`, `cudnn_hacc`, `stereo_ops`), con descarga de kernels precompilados por arquitectura de GPU desde `fastforks/kernels`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de una sola tarea.

## Casos de uso

- Referencia de latencia para pipelines estéreo: el modelo sirve para medir el coste de un matching estéreo denso en un hardware concreto (por ejemplo, 4,3 ms a 640x480 con el backend `kernels` en una RTX 5060 Ti), útil para dimensionar sistemas de percepción antes de elegir un modelo de producción.
- Validación de backends y kernels CUDA: al publicar paridad numérica contra el código original, CoEx permite verificar que una implementación nueva de kernels reproduce los resultados de referencia con diferencias <= 0,02 px de media.
- Pruebas de regresión en frameworks de inferencia: los hashes SHA-256 de los pesos y las salidas doradas permiten integrar el modelo en suites de test que detecten cambios en la descarga, la carga o la ejecución.
- Prototipado de reconstrucción 3-D en escenas sintéticas: con pesos entrenados en SceneFlow, es adecuado para experimentos sobre imágenes sintéticas o datasets con dominio similar (FlyingThings3D, Monkaa, Driving), donde la disparidad estimada puede convertirse en nube de puntos.
- Benchmarking de memoria en GPUs de consumo: las mediciones publicadas (por ejemplo, 8660 MiB asignados a 12 MP en portable frente a 3190 MiB en kernels) permiten comparar el consumo de memoria de distintos backends en tarjetas de 16 GB.
- Docencia y reproducción de resultados: al fijar el commit original y documentar la procedencia de los pesos, el repositorio facilita reproducir el artículo de Bangunharcana et al. 2021 en un entorno controlado.
- Evaluación comparativa de frameworks estéreo: sirve como baseline de latitud y memoria frente a otros modelos estéreo integrados en fastforks, con protocolo de medición documentado en `docs/benchmarks.md`.

## Benchmarks y rendimiento

### Precisión en datasets públicos

| Variante | Dataset | Original | Portable | Kernels | Nota |
|---|---|---|---|---|---|
| `coex-sceneflow` | ETH3D two-view train, bad > 1 px % / EPE | 33,46 / 15,994 | 33,46 / 15,989 | 33,46 / 16,000 | — |
| `coex-sceneflow` | Middlebury 2014 trainingH, bad > 2 px % / EPE | 32,24 / 7,418 | 32,32 / 7,427 | 32,31 / 7,421 | — |

Medido en NVIDIA GeForce RTX 5060 Ti, torch 2.14.1+cu130, 2026-10-27.

### Latencia y memoria (Middlebury 2014 half, 994x1482)

| Modelo | Tiempo (ms): original fp32 | Original | Portable | Kernels | Aceleración kernels vs original | vs portable | Memoria pico (MiB, asignada / reservada): original | Portable | Kernels |
|---|---|---|---|---|---|---|---|---|---|
| `coex-sceneflow` | 94,9 | 60,0 | 49,93 | 23,48 | 2,6x | 2,1x | 2098 / 2160 | 1136 / 1254 | 495 / 886 |

### Arranque y primera llamada

| Modelo | Carga (s): original | Portable | Kernels | Primera llamada (s): original | Portable | Kernels |
|---|---|---|---|---|---|---|
| `coex-sceneflow` | – | 0,16 | 0,09† | 0,63 (375x1242) | 0,06† | 0,04† |

### Velocidad y memoria pico a tamaños fijos

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP 4000x3000 |
|---|---|---|---|---|---|
| `coex-sceneflow` | portable | 11,2 ms / 225 / 312 | 28,5 ms / 671 / 890 | 70,0 ms / 1485 / 1916 | 554,7 ms / 8660 / 10964 |
| `coex-sceneflow` | kernels | 4,3 ms / 103 / 322 | 13,7 ms / 256 / 400 | 32,9 ms / 559 / 804 | 211,1 ms / 3190 / 4410 |

Celdas de tamaño fijo: tiempo (ms) / memoria pico asignada / memoria pico reservada (MiB). Hardware y protocolo: RTX 5060 Ti 16 GB, sm_120.

## Requisitos de hardware

- VRAM estimada: 103 MiB asignados (322 reservados) a 640x480 con backend `kernels`; 559 MiB asignados (804 reservados) a 1920x1080; 3190 MiB asignados (4410 reservados) a 12 MP. Con backend `portable`, 225 MiB a 640x480 y 8660 MiB a 12 MP.
- GPU recomendadas: cualquier NVIDIA con soporte para los kernels precompilados de `fastforks/kernels` y driver reciente; las mediciones publicadas usan una RTX 5060 Ti 16 GB (sm_120).
- Cabe en GPU de consumo: sí, incluso en tarjetas de gama media para resoluciones habituales; a 12 MP el backend `portable` requiere unos 8,5 GiB asignados, mientras que `kernels` baja a unos 3,1 GiB.
- Opciones de despliegue: `pip install fastforks` y la API `stereo.load("coex-sceneflow")`; backend `portable` en PyTorch (GPU o CPU) y backend `kernels` con kernels CUDA propios. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 4,3 ms a 640x480, 13,7 ms a 1280x720, 32,9 ms a 1920x1080 y 211,1 ms a 12 MP con `kernels`; con `portable`, 11,2 ms, 28,5 ms, 70,0 ms y 554,7 ms respectivamente.
- Carga del modelo: 0,09 s con `kernels` y 0,16 s con `portable`; primera llamada de 0,04 s y 0,06 s respectivamente.
- Tamaño máximo probado: 3000x4000 en `portable` fp16, con 8,5 GiB de pico asignado y 10,7 GiB reservado en una RTX 5060 Ti de 16 GB.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` con el motivo y no hace fallback silencioso.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Precisión (Middlebury 2014 trainingH, bad > 2 px %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CoEx (`coex-sceneflow`) | CNN estéreo, disparidad máx. 192 | no disponible | cualquier H x W >= 32, múltiplo de 32 | 32,24 (original) / 32,32 (portable) / 32,31 (kernels) | Código GPL-3.0-only; pesos sin licencia declarada | Pesos en enlace externo de los autores; wrapper en fastforks |
| IGEV-Stereo | Modelo estéreo iterativo | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Kernel `igev` referenciado en el backend de fastforks, sin ficha comparativa en esta información |
| Modelos estéreo de la familia RAFT-Stereo | Modelo estéreo basado en flujo óptico | no disponible en la información proporcionada | no disponible | no disponible | no disponible | No referenciado en la información disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría; los únicos datos numéricos son los de CoEx frente a su propio código original.

## Limitaciones y advertencias

- Los pesos son exclusivamente de SceneFlow: el rendimiento zero-shot sobre imágenes reales es pobre, por lo que el modelo se plantea principalmente como referencia de latencia y no como solución de producción.
- Los pesos de KITTI del código original (presentes en su repositorio git) no están incluidos en esta integración.
- La licencia del código es GPL-3.0-only (copyleft); los autores no declaran una licencia separada para los pesos, por lo que el uso comercial de los pesos queda en una zona jurídicamente ambigua pese a que la model card indique "commercial use: yes" como suposición.
- El código se distribuye en la distribución separada `fastforks-nc` (`pip install 'fastforks-core[nc]'`), lo que condiciona su uso en productos comerciales.
- El backend `kernels` depende de kernels precompilados por arquitectura de GPU y de un driver NVIDIA reciente; si no hay kernel disponible, la ejecución falla con `BackendUnavailableError` en lugar de degradar a `portable`.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de disparidades erróneas en regiones ocluidas, texturas repetitivas o superficies sin textura, habitual en matching estéreo.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento en dominios sintéticos (FlyingThings3D, Driving, Monkaa) puede introducir sesgo hacia ese tipo de escenas.
- Limitaciones de idioma: no aplica, es un modelo de visión sin capacidades lingüísticas.
- La disparidad máxima está fijada en 192 píxeles, lo que limita la profundidad mínima detectable en función de la línea base y la focal de la cámara.
- Requiere pares de imágenes rectificadas; no incluye rectificación ni calibración.
- El repositorio no aloja pesos: la disponibilidad depende de un enlace externo de Dropbox y de la verificación SHA-256, lo que añade un punto de fallo en la cadena de suministro.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/coex
- Código del framework fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de CoEx: https://github.com/antabangun/coex (commit `a98b37d33f37`)
- Licencia del código original: https://github.com/antabangun/coex/blob/a98b37d33f37754582b1e71f38216af8c69f2347/LICENSE
- Pesos `sceneflow.ckpt` (enlace de los autores): https://www.dropbox.com/s/c1v2r74tlbrrmsr/sceneflow.ckpt?dl=1
- `card.toml` con los hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/coex/card.toml
- Documentación de benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
