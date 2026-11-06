# fastforks/fast-acvnet

## Resumen

Fast-ACVNet es un modelo de estimación de disparidad estéreo (stereo matching) que, a partir de un par de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles correspondiente a la vista izquierda. Está basado en el trabajo original de Xu et al. (2022) y esta ficha corresponde al empaquetado `fastforks/fast-acvnet`, un repositorio que no aloja pesos propios sino que descarga los checkpoints de los autores originales y los verifica mediante SHA-256. El modelo usa características de MobileNetV2 y una arquitectura de atención sobre un volumen de correlación para seleccionar las 24 disparidades más probables antes de un hourglass 3D y un soft-argmax top-2.

La relevancia de este empaquetado reside en su enfoque de ingeniería: ofrece backends `portable` y `kernels` (CUDA) con aceleraciones de 1,4x a 1,7x frente a la implementación original, y soporta entradas de resolución arbitraria (múltiplo de 32, mínimo 32x32), habiendo sido probado hasta 3000x4000 píxeles en una RTX 5060 Ti de 16 GB. Está pensado para pipelines de visión por computador que necesitan profundidad estéreo en tiempo real o casi real, con 8 variantes de pesos (Fast-ACVNet y Fast-ACVNet+, cada una con checkpoints de generalización, KITTI 2012, KITTI 2015 y SceneFlow).

Se trata de un modelo de nicho, experimental (tier declarado por el autor), sin descargas ni likes en el momento de la ficha, y con una licencia de pesos no declarada explícitamente por los autores originales (se asume MIT a partir de la licencia del código). No es un modelo de lenguaje: no genera texto ni soporta tool calling; su única salida es un mapa de disparidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN estéreo con MobileNetV2 como extractor de características, volumen de correlación con atención (1/8 propagado a 1/4; Fast-ACVNet+ a 1/4), hourglass 3D, soft-argmax top-2 y upsampling por superpíxeles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 32, múltiplo de 32) |
| Tipos de cuantización | fp16 (probado en backend portable); fp32 en la implementación original; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | Código: MIT. Pesos: no declarada por los autores; se asume MIT a partir del código (`mit-code-weights-unstated`) |
| Formato de pesos | checkpoints `.ckpt` de PyTorch (no se alojan en el repo; se descargan de enlaces de Google Drive de los autores) |
| Disparidad máxima | 192 píxeles |
| Backends | `portable`, `kernels` (CUDA) |
| Tarea | stereo matching / depth estimation |
| Variantes | 8 (Fast-ACVNet y Fast-ACVNet+ × generalization, kitti12, kitti15, sceneflow) |

## Arquitectura y entrenamiento

Fast-ACVNet sigue el diseño de ACVNet con optimizaciones de eficiencia. Un extractor MobileNetV2 genera características a varias escalas; a partir de ellas se construye un volumen de correlación agrupado a 1/8 de resolución que se propaga a 1/4 (en Fast-ACVNet+ el volumen de atención se calcula directamente a 1/4). Ese volumen de atención selecciona las 24 disparidades candidatas más probables de un volumen de concatenación, lo que reduce drásticamente el coste computacional frente a un coste volumétrico completo. Después se aplica un hourglass 3D, una agregación soft-argmax top-2 y un upsampling basado en superpíxeles para recuperar la resolución completa, con una disparidad máxima de 192 píxeles.

El entrenamiento se realizó sobre el dataset Freiburg SceneFlow, compuesto por FlyingThings3D, Driving y Monkaa. No se documentan en la información disponible detalles sobre número de tokens (no aplica), composición exacta del dataset, ni si hubo etapas de refinamiento con RLHF/DPO (no aplica a un modelo de visión). Los checkpoints específicos de KITTI 2012 y KITTI 2015 corresponden a ajuste fino sobre esos benchmarks. La innovación técnica destacable es el mecanismo de atención sobre el volumen de correlación para filtrar candidatos, junto con las optimizaciones de los backends del empaquetado `fastforks`: el backend `kernels` implementa kernels CUDA que aceleran la inferencia entre 1,4x y 1,7x respecto a la implementación original y reducen el uso de memoria (por ejemplo, 664 MiB frente a 1421 MiB en Middlebury 2014 a 994x1482 para `fast-acvnet-generalization` en modo portable).

## Capacidades

- Estimación de disparidad estéreo a partir de un par de imágenes rectificadas izquierda/derecha.
- Generación de mapas de profundidad (depth estimation) derivados de la disparidad, con calibración estéreo adecuada.
- Soporte de resoluciones arbitrarias: cualquier H x W >= 32 píxeles, con padding a múltiplo de 32; probado hasta 3000x4000 (12 MP).
- Ocho variantes de pesos especializadas: generalización (SceneFlow), KITTI 2012, KITTI 2015 y SceneFlow, en versiones Fast-ACVNet y Fast-ACVNet+.
- Dos backends de ejecución: `portable` (compatible, fp16) y `kernels` (CUDA optimizado).
- Verificación de integridad de pesos mediante SHA-256 en la descarga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Vehículos autónomos y ADAS**: el modelo calcula disparidad a partir del par estéreo de cámaras frontales para estimar distancia a obstáculos y peatones. La variante `fast-acvnet-kitti15` está ajustada específicamente sobre KITTI 2015, el benchmark de referencia para conducción urbana, y el backend `kernels` permite 55,7 ms por fotograma a 1920x1080, suficiente para pipelines en tiempo real.
- **Robótica móvil y navegación**: un robot con cámara estéreo puede usar `fast-acvnet-generalization` para construir mapas de profundidad densos en interiores y exteriores sin depender de LiDAR. La resolución de entrada configurable permite adaptar el coste computacional al presupuesto de la plataforma.
- **Reconstrucción 3D y fotogrametría**: a partir de pares estéreo rectificados de alta resolución (hasta 12 MP, con 492 ms y ~5 GiB de pico en modo portable) se pueden generar nubes de puntos densas para modelado de escenas, inspección industrial o patrimonio.
- **Inspección industrial y control de calidad**: cámaras estéreo fijas en líneas de producción pueden medir dimensiones y detectar defectos de profundidad en piezas. La variante `sceneflow` ofrece buena generalización a escenas sintéticas y objetos variados.
- **Realidad aumentada y captura volumétrica**: la disparidad por píxel permite ocluir objetos virtuales con geometría real y estimar la pose de la cámara respecto a la escena; el modo `kernels` a 640x480 (6,8 ms) es adecuado para aplicaciones de baja latencia en GPUs de consumo.
- **Drones y agricultura de precisión**: estimación de altura de cultivos y distancia a obstáculos con pares estéreo a bordo; la variante de generalización evita sobreajuste a dominios de conducción.
- **Investigación en visión estéreo**: el empaquetado facilita reproducir resultados de ACVNet con verificación de pesos y comparar backends (`portable` frente a `kernels`) para estudiar el compromiso precisión/velocidad/memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (EPE, D1, etc.) en la información disponible. Los únicos datos cuantitativos proporcionados son de velocidad y memoria:

**Middlebury 2014 half, 994x1482**

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Pico memoria original (MiB, alloc/reserv) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `fast-acvnet-generalization` | 100,7 | 60,6 | 54,69 | 38,16 | 1,6x | 1421 / 1506 | 664 / 736 | 739 / 1042 |
| `fast-acvnet-plus-generalization` | 138,4 | 80,9 | 70,56 | 46,41 | 1,7x | 1441 / 1522 | 662 / 756 | 790 / 1120 |

**Velocidad y memoria a resoluciones fijas (ms / MiB alloc / MiB reserv)**

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 4000x3000 (12 MP) |
|---|---|---|---|---|---|
| `fast-acvnet-generalization` | portable | 13,9 / 137 / 208 | 31,1 / 402 / 664 | 78,3 / 890 / 1418 | 492,1 / 5077 / 8074 |
| `fast-acvnet-generalization` | kernels | 6,8 / 169 / 582 | 22,0 / 435 / 608 | 55,7 / 954 / 1372 | 357,3 / 5445 / 7618 |
| `fast-acvnet-kitti12` | portable | 14,0 / 137 / 208 | 31,1 / 402 / 664 | 78,2 / 890 / 1418 | 492,4 / 5077 / 8074 |
| `fast-acvnet-kitti12` | kernels | 6,8 (datos truncados en la información disponible) | no disponible | no disponible | no disponible |

**Arranque y primera llamada**

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `fast-acvnet-generalization` | 0,24 (375x1242) | 0,18 | 0,20 | 1,73 (375x1242) | 0,08 | 0,04 |
| `fast-acvnet-plus-generalization` | 0,23 (375x1242) | 0,10 | 0,10 | 0,04 (375x1242) | 0,07 | 0,05 |

## Requisitos de hardware

- **VRAM estimada**: el consumo depende de la resolución de entrada. A 640x480, entre 137 y 169 MiB asignados (208-582 MiB reservados); a 1920x1080, entre 890 y 954 MiB asignados (~1,4 GiB reservados); a 12 MP (4000x3000), ~5 GiB asignados y ~7,6-8 GiB reservados.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA para el backend `kernels`; la información documenta pruebas en una RTX 5060 Ti de 16 GB. Para el backend `portable` basta una GPU con suficiente VRAM para la resolución objetivo.
- **¿Cabe en GPU de consumo?**: sí. A resoluciones típicas (hasta 1080p) el consumo es inferior a 1,5 GiB, por lo que cabe en GPUs de consumo con 4-8 GB. Para 12 MP se recomienda al menos 8-10 GB de VRAM reservada.
- **Opciones de despliegue**: librería `fastforks` (backends `portable` y `kernels`); el código original de Fast-ACVNet está disponible en GitHub para integración con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- **Latencia y throughput**: a 640x480, 6,8 ms en modo kernels (~147 FPS) y 13,9 ms en portable (~72 FPS); a 1280x720, 22,0 ms kernels (~45 FPS) y 31,1 ms portable (~32 FPS); a 1920x1080, 55,7 ms kernels (~18 FPS) y 78,3 ms portable (~13 FPS); a 12 MP, 357,3 ms kernels y 492,1 ms portable.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, los competidores directos de la misma categoría (stereo matching basado en deep learning) serían ACVNet original (del que Fast-ACVNet es una variante eficiente), RAFT-Stereo, CREStereo e IGEV-Stereo, pero no se aportan parámetros, contexto ni rendimiento de estos en la información disponible. La comparación interna entre las dos familias sí es posible: Fast-ACVNet+ es más lento (46,41 ms frente a 38,16 ms a 994x1482 en kernels) pero emplea un volumen de atención a 1/4 en lugar de 1/8 propagado, lo que en el trabajo original se asocia a mayor precisión (dato no verificado en esta ficha).

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fast-ACVNet (este) | no disponible | no aplica | 38,16 ms a 994x1482 (kernels) | MIT código / pesos no declarados | Hugging Face (solo model card) + GitHub |
| ACVNet original | no disponible | no aplica | no disponible | MIT (código) | GitHub |
| RAFT-Stereo | no disponible | no aplica | no disponible | no disponible | no disponible |
| CREStereo | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia de pesos ambigua**: los autores originales no declaran una licencia específica para los pesos; el empaquetado asume MIT a partir de la licencia del código. Antes de uso comercial conviene verificar la licencia del repositorio original.
- **Modelo experimental**: el propio autor del empaquetado lo clasifica como tier experimental; no hay descargas ni validación comunitaria registrada.
- **Sin pesos alojados**: el repositorio es solo una model card; la descarga depende de enlaces de Google Drive de terceros, con riesgo de disponibilidad y de integridad (mitigado parcialmente por la verificación SHA-256).
- **Entrada restringida**: requiere pares de imágenes rectificadas; no maneja imágenes no rectificadas ni estimación monocular.
- **Disparidad máxima de 192 píxeles**: escenas con disparidades mayores (objetos muy cercanos o resoluciones muy altas sin reescalado) quedarán fuera de rango.
- **Resolución y memoria**: a 12 MP el consumo reservado ronda 8 GiB; resoluciones mayores pueden agotar la VRAM de GPUs de consumo.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de disparidad errónea en regiones ocluidas, texturas repetitivas, superficies sin textura y bordes; no se documentan métricas de error en esta ficha.
- **Sesgos de dominio**: los checkpoints de KITTI están ajustados a escenas de conducción urbana; para otros dominios debe preferirse la variante `generalization` o `sceneflow`.
- **Sin soporte multilingüe ni de texto**: no es adecuado para tareas de NLP, agentes o generación.
- **Datos de benchmark truncados**: parte de la tabla de velocidad de `fast-acvnet-kitti12` en modo kernels aparece incompleta en la información disponible.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/fast-acvnet
- Repositorio del empaquetado: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de Fast-ACVNet: https://github.com/gangweix/Fast-ACVNet (commit `61d5375e1816`)
- Licencia del código original: https://github.com/gangweix/Fast-ACVNet/blob/61d5375e1816f124f4417cea506eeaddac1504e4/LICENSE.md
- Definición de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/stereo/models/fast_acvnet/card.toml
- Pesos `fast-acvnet-generalization`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1lWdOoNIY2YGfoKPhRAmekoU05RDW4orK
- Pesos `fast-acvnet-kitti12`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1NzUgZkfvzqbB_4GLIvr1Kpvfr1aZiq1O
- Pesos `fast-acvnet-kitti15`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1Mq8G4bNLip238IKI3Z3F4hQYfJ-dTvqN
- Pesos `fast-acvnet-plus-generalization`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=138iDN7m-DUzgk9okzAoASh93dSTE8IoA
- Pesos `fast-acvnet-plus-kitti12`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1oqkrVLc-mzCZwjBSTse1zZaEuFl4SL-z
- Pesos `fast-acvnet-plus-kitti15`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1LiIreLmQfOzsjTY-4V8ygcbsgS-k_0rt
- Pesos `fast-acvnet-plus-sceneflow`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1VQMJg2scaRLspIzIBB9ErTC86TvfJTSH
- Pesos `fast-acvnet-sceneflow`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1NUByydKfHWB6k8VBmhCDjrbQ9Uk8XRvu
