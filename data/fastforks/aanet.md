# fastforks/aanet

## Resumen

AANet es un modelo de estimación de disparidad estéreo presentado por Haofei Xu y Jiaming Zhang en 2020 (paper "AANet: Adaptive Aggregation Network for Efficient Stereo Matching"). Resuelve el problema del emparejamiento estéreo denso: dado un par de imágenes rectificadas izquierda/derecha, produce un mapa de disparidad en píxeles de la vista izquierda, del que se deriva profundidad por triangulación. Su innovación principal es sustituir las costosas convoluciones 3D que dominaban el estado del arte (PSMNet, GANet) por agregación de coste mediante muestreo deformable disperso, intra-escala e inter-escala, sobre una pirámide de correlación 2D.

La ficha corresponde al repositorio `fastforks/aanet`, un contenedor de empaquetado mantenido por el proyecto fastforks que no aloja pesos propios: descarga los checkpoints originales de los autores y los verifica contra un SHA-256 registrado en la model card. Ofrece dos variantes, `aanet-sceneflow` y `aanet-plus-sceneflow`, con dos backends de ejecución (`portable` en PyTorch puro y `kernels` con núcleos CUDA optimizados). El pipeline declarado en HuggingFace es `depth-estimation` y el tier asignado por el autor del empaquetado es "experimental".

Es relevante ahora porque demuestra que un modelo estéreo de 2020 puede ejecutarse con latencias de decenas de milisegundos en una GPU de consumo (RTX 5060 Ti 16 GB) manteniendo paridad numérica con el código original, lo que lo hace viable para pipelines de visión por computador en robótica, automoción o reconstrucción 3D sin depender de infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con pirámide de correlación 2D y agregación de coste por muestreo deformable disperso (intra-escala e inter-escala); sin convoluciones 3D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada H x W arbitraria con padding) |
| Tipos de cuantizacion | fp32 (referencia original), fp16 (por defecto en portable y kernels); no se documentan otras |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Código Apache-2.0; pesos sin licencia declarada por los autores (el empaquetado asume Apache-2.0 desde el código) |
| Formato de pesos | `.pth` (PyTorch, checkpoint original de los autores); no se distribuyen en el repo de HuggingFace |

## Arquitectura y entrenamiento

AANet construye una pirámide de correlación 2D multi-escala a partir de features extraídas por una CNN siamesa y aplica agregación de coste adaptativa mediante muestreo deformable disperso: en lugar de convoluciones 3D densas sobre el volumen de coste, aprende offsets de muestreo que recogen solo las posiciones relevantes dentro de cada escala y entre escalas. Esto reduce drásticamente el coste computacional y de memoria frente a PSMNet o GANet, manteniendo precisión competitiva. La variante AANet+ añade un refinamiento adicional y una etapa de agregación más profunda, con mayor precisión a cambio de más cómputo.

El entrenamiento se realizó sobre Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), el dataset sintético estándar para estéreo. No se documenta en la información disponible el número exacto de tokens o iteraciones, la composición detallada del dataset ni si hubo etapas de ajuste fino con supervisión adicional más allá de los checkpoints SceneFlow publicados. Los checkpoints KITTI fine-tune del código original no están incluidos en este empaquetado, lo que limita el uso directo en dominios de conducción real sin reentrenamiento.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas izquierda/derecha.
- Salida de mapa de disparidad en píxeles de la vista izquierda, convertible a profundidad mediante los parámetros intrínsecos y la línea base de la cámara.
- Entrada de tamaño arbitrario: `aanet-plus-sceneflow` acepta H x W >= 96 con padding a múltiplo de 96; `aanet-sceneflow` acepta H x W >= 48 con padding a múltiplo de 48.
- Ejecución en dos backends: `portable` (PyTorch puro, GPU o CPU) y `kernels` (núcleos CUDA optimizados del proyecto fastforks).
- Precisión fp16 por defecto en GPU, con fp32 disponible para paridad exacta con el código original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Reconstrucción 3D en robótica móvil: el modelo genera mapas de disparidad densos a partir de pares estéreo de cámaras calibradas, alimentando pipelines de nube de puntos para navegación y evitación de obstáculos. La latencia de 28,8 ms a 640x480 con backend `kernels` permite operar en tiempo real a 30 FPS.
- Automoción y ADAS: estimación de profundidad frontal con cámaras estéreo para detección de obstáculos y distancias de seguridad. El backend `kernels` procesa 1920x1080 en 128,5 ms con 1049 MiB asignados, adecuado para sistemas embebidos con GPU.
- Escaneo 3D de objetos y documentación patrimonial: reconstrucción densa de superficies a partir de pares estéreo de alta resolución; `aanet-sceneflow` procesa 12 MP (4000x3000) en 967,9 ms con backend `kernels` y 3967 MiB asignados.
- Drones y UAV: mapas de profundidad para aterrizaje autónomo y mapeo topográfico, donde el bajo consumo de memoria del backend `kernels` (148 MiB a 640x480) permite ejecución en GPUs embebidas.
- Investigación en visión por computador: banco de pruebas para comparar técnicas de agregación de coste sin convoluciones 3D, con paridad numérica verificada frente al código original (max |diff| <= 0,002 en CPU fp32).
- Prototipado de pipelines de profundidad en entornos con GPU de consumo: una RTX 5060 Ti 16 GB ejecuta `aanet-plus-sceneflow` a 1024x2048 con 7,1 GiB pico, permitiendo desarrollo y validación sin acceso a A100/H100.
- Generación de ground truth sintético y aumentación de datos: uso del modelo para etiquetar pares estéreo en datasets propios antes de un ajuste fino supervisado.

## Benchmarks y rendimiento

Precisión sobre datasets públicos (original = código de los autores, mismo checkpoint y protocolo):

| Variante | Dataset | Original | Portable | Kernels |
|---|---|---|---|---|
| `aanet-sceneflow` | ETH3D two-view train, bad > 1 px % / EPE | 14,64 / 0,697 | 14,63 / 0,697 | 14,64 / 0,698 |
| `aanet-sceneflow` | Middlebury 2014 trainingH, bad > 2 px % / EPE | 32,15 / 6,305 | 32,16 / 6,301 | 32,16 / 6,303 |
| `aanet-plus-sceneflow` | ETH3D two-view train, bad > 1 px % / EPE | 18,48 / 0,811 | 18,50 / 0,811 | 18,51 / 0,812 |
| `aanet-plus-sceneflow` | Middlebury 2014 trainingH, bad > 2 px % / EPE | 29,84 / 6,237 | 29,86 / 6,237 | 29,85 / 6,232 |

Latencia y memoria en Middlebury 2014 half (994x1482), RTX 5060 Ti 16 GB, sm_120:

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Portable (MiB) | Kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `aanet-plus-sceneflow` | 262,9 | 194,2 | 159,22 | 88,91 | 2,2x | 3652 / 3784 | 1142 / 1278 | 813 / 920 |
| `aanet-sceneflow` | 289,2 | 178,0 | 139,79 | 100,81 | 1,8x | 1000 / 1126 | 845 / 986 | 536 / 644 |

Rendimiento a tamaños fijos (tiempo ms / memoria asignada / reservada en MiB):

| Modelo | Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|---|
| `aanet-plus-sceneflow` | portable | 58,4 / 1109 / 1292 | 170,2 / 3400 / 3858 | 389,0 / 7214 / 8226 | omitido |
| `aanet-plus-sceneflow` | kernels | 28,8 / 178 / 244 | 53,9 / 501 / 696 | 128,5 / 1049 / 1430 | 793,2 / 5752 / 8230 |
| `aanet-sceneflow` | portable | 40,1 / 300 / 340 | 94,2 / 781 / 830 | 231,2 / 1711 / 1820 | 1591,3 / 9603 / 12836 |
| `aanet-sceneflow` | kernels | 25,9 / 148 / 196 | 59,2 / 344 / 602 | 152,4 / 728 / 1252 | 967,9 / 3967 / 6854 |

Paridad con el código original: en CPU fp32, max |diff| <= 0,002; en GPU fp16 (por defecto), media |diff| <= 0,02 px y p99 <= 0,25 px.

## Requisitos de hardware

- VRAM estimada: `aanet-plus-sceneflow` requiere 7,1 GiB pico a 1024x2048 (8,1 GiB reservados); `aanet-sceneflow` requiere 9,4 GiB pico a 3000x4000 (12,5 GiB reservados). A 1920x1080, el backend `kernels` necesita 1049 MiB (`plus`) y 728 MiB (`sceneflow`).
- GPU recomendadas: RTX 5060 Ti 16 GB es la referencia medida; cualquier GPU con >= 8 GiB para resoluciones moderadas. Para 12 MP con `aanet-sceneflow` portable se necesitan ~12,5 GiB reservados, lo que exige GPUs de 16 GiB o superiores. No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB y presumiblemente en cualquier GPU con >= 8 GiB; no se especifican mínimos para resoluciones bajas.
- Opciones de despliegue: librería `fastforks` (`stereo.load(...)`), con backends `portable` (PyTorch) y `kernels` (CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión estéreo).
- Latencia y throughput: a 640x480 con backend `kernels`, 25,9-28,8 ms por par (≈ 35-39 FPS); a 1280x720, 53,9-59,2 ms (≈ 17-19 FPS); a 1920x1080, 128,5-152,4 ms (≈ 6,6-7,8 FPS). El arranque es de 0,15-0,27 s y la primera llamada de 0,07-0,10 s.
- Advertencia de rendimiento: a 375x1242 el modelo está limitado por lanzamiento de kernels y `portable` rinde de forma similar al código original; la ventaja de `kernels` se materializa a partir de 994x1482.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto/entrada | Precisión ETH3D (bad > 1 px %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AANet / AANet+ (este) | Pirámide de correlación 2D + muestreo deformable disperso | no disponible | H x W >= 48/96, padding a múltiplo | 14,64 / 18,48 | Código Apache-2.0; pesos sin declarar | HuggingFace `fastforks/aanet` (sin pesos alojados) |
| PSMNet | Volumen de coste 3D + convoluciones 3D | no disponible | no disponible | no disponible en esta información | no disponible | Código público de los autores |
| GANet | Agregación guiada por geometría con convoluciones 3D | no disponible | no disponible | no disponible en esta información | no disponible | Código público de los autores |

No se han publicado en la información disponible resultados comparativos directos de AANet frente a PSMNet o GANet medidos bajo el mismo protocolo que las tablas anteriores; la comparación cualitativa se limita a que AANet evita las convoluciones 3D y reduce el coste computacional y de memoria frente a esos enfoques.

## Limitaciones y advertencias

- Solo se incluyen los checkpoints SceneFlow de AANet y AANet+; los fine-tune de KITTI del código original no están disponibles en este empaquetado, por lo que el rendimiento en dominios de conducción real puede degradarse sin ajuste fino.
- El repositorio es solo una model card: no aloja pesos. La descarga depende de enlaces de Google Drive de los autores, lo que introduce un punto de fallo externo y posible indisponibilidad futura.
- La licencia de los pesos no está declarada por los autores; el empaquetado asume Apache-2.0 a partir de la licencia del código. Antes de uso comercial debe verificarse esta asunción, ya que el propio empaquetado la marca como "assumed".
- A 375x1242 el modelo está limitado por lanzamiento de kernels: `portable` no ofrece ventaja significativa sobre el código original y `kernels` aporta mejoras moderadas.
- El backend `portable` a 994x1482 es más rápido que el original pero asigna más memoria, lo que puede provocar OOM en GPUs ajustadas.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de disparidades erróneas en regiones ocluidas, texturas repetitivas, superficies sin textura y bordes de objeto, inherente a todo método estéreo.
- No hay soporte multilingüe, tool calling, agentes ni razonamiento multi-paso; cualquier uso que requiera estas capacidades debe combinarse con otros modelos.
- El tier asignado es "experimental": no se garantiza estabilidad de API ni de comportamiento entre versiones del empaquetado.
- No se documentan sesgos demográficos ni de otro tipo, pero al entrenarse en datasets sintéticos (SceneFlow) puede presentar sesgo de dominio frente a escenas reales.

## Enlaces

- HuggingFace: https://huggingface.co/fastforks/aanet
- Repositorio del empaquetado: https://github.com/kleinicke/fastforks
- Núcleos del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de los autores: https://github.com/haofeixu/aanet (commit `8d0d747e69bb`)
- Licencia del código original: https://github.com/haofeixu/aanet/blob/8d0d747e69bbdba43e2578b60ad7df63ba7fdac2/LICENSE
- Benchmarks del empaquetado: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `aanet+_sceneflow.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1m3Wo2k7w3OlVaDYdIm-x9K8_frQ4Vq9u
- Pesos `aanet_sceneflow.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1_OuMEE5v5DcSUuKUZeCBZ17TZgxi4--h
