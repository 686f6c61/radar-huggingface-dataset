# fastforks/metric3d

## Resumen

Metric3D v2 es un modelo de estimación de profundidad monocular y normales de superficie a partir de una única imagen RGB. Lo desarrollan Mu Hu y colaboradores (publicación de 2024, arXiv 2404.15506) y esta ficha concreta corresponde al repositorio `fastforks/metric3d`, un envoltorio de inferencia que no aloja pesos: descarga los checkpoints originales del autor y los valida por SHA-256. El modelo resuelve el problema de obtener profundidad métrica (en metros) desde una sola fotografía sin calibración explícita, trabajando en un espacio de cámara canónico con focal de 1000 píxeles y reescalando después según la focal real.

La arquitectura combina un codificador ViT-L de DINOv2-reg con un decodificador iterativo de profundidad y normales de estilo RAFT. La variante disponible aquí es `metric3d-vit-large@1`, entrenada sobre 16 millones de imágenes de 18 conjuntos de datos públicos de profundidad métrica (interiores, exteriores y conducción). El repositorio es de nivel experimental y está pensado para integrarse en flujos de trabajo de visión por computador que necesiten mapas de profundidad densos y métricos.

Su relevancia actual radica en que ofrece profundidad métrica real (no solo relativa) con buena precisión en benchmarks estándar (AbsRel de 0,0546 en NYUv2) y con un rendimiento de inferencia optimizado: 158 ms por imagen de 994x1482 en una RTX 5060 Ti con el backend de kernels, frente a 628 ms del código original en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L (DINOv2-reg) como codificador + decodificador iterativo de profundidad/normales estilo RAFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, cualquier H x W >= 8) |
| Tipos de cuantizacion | fp32 (referencia), fp16 (por defecto en GPU) |
| Idiomas soportados | no aplica (modelo de visión, sin entrada de texto) |
| Licencia | Código BSD-2-Clause; licencia de pesos no declarada por los autores (se asume BSD-2-Clause) |
| Formato de pesos | `.pth` (PyTorch); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El codificador es un ViT-L de DINOv2-reg que extrae características densas de la imagen; el decodificador es iterativo, de inspiración RAFT, que refina progresivamente mapas de profundidad y de normales de superficie. La innovación principal es el espacio de cámara canónico: el modelo opera con una focal fija de 1000 píxeles y luego reescala la predicción según la focal real de la cámara (si se conoce), lo que permite generalizar entre cámaras y dominios distintos sin reentrenamiento específico.

El entrenamiento utilizó 16 millones de imágenes procedentes de 18 conjuntos de datos públicos de profundidad métrica que cubren escenas de interior, exterior y conducción, según el paper de Metric3D v2. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación, algo esperable en un modelo puramente perceptivo. El repositorio `fastforks` añade una capa de inferencia con dos backends (`portable` en PyTorch puro y `kernels` con kernels CUDA optimizados) y verifica paridad numérica contra las salidas doradas del código original: en CPU fp32 la diferencia máxima es de 0,002, y en GPU fp16 la diferencia media es inferior al 1 % con p99 por debajo del 3 % respecto a la mediana del valor de referencia.

## Capacidades

- Estimación de profundidad monocular densa a partir de una sola imagen RGB.
- Profundidad métrica (en unidades físicas) para los modelos marcados como `metric`, como esta variante.
- Predicción de normales de superficie junto con el mapa de profundidad.
- Salida de confianza asociada a las predicciones.
- Acepta imágenes de cualquier resolución H x W >= 8, con redimensionado o padding interno.
- Acepta intrínsecos de cámara opcionales (matriz K de 3x3 en píxeles) para reescalar la profundidad métrica.
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (CUDA optimizado).
- No soporta tool calling, agentes, texto ni razonamiento multi-paso: es un modelo puramente perceptivo.

## Casos de uso

- Reconstrucción 3D de interiores: a partir de una foto de una habitación se obtiene profundidad métrica y normales, suficientes para generar mallas o nubes de puntos y alimentar herramientas de modelado arquitectónico.
- Navegación de robots móviles: el modelo proporciona un mapa de profundidad denso por fotograma con latencia de ~158 ms en GPU de gama media, adecuado para planificación de trayectorias en tiempo casi real.
- Generación de efectos de desenfoque de fondo (bokeh) en fotografía computacional: el mapa de profundidad métrica permite segmentar sujeto y fondo con precisión física, no solo relativa.
- Automoción y ADAS: con entrenamiento sobre conjuntos de conducción, puede estimar distancias a obstáculos y vehículos desde una cámara monocular, útil como redundancia de bajo coste frente a LiDAR.
- Realidad aumentada: inserción de objetos virtuales con oclusión correcta gracias a la profundidad métrica y las normales de superficie, que permiten alinear la iluminación y la geometría.
- Escaneo y digitalización de patrimonio: captura de profundidad de objetos y escenarios con una sola cámara, sin hardware estéreo ni sensores de tiempo de vuelo.
- Preprocesado para pipelines de visión: generar mapas de profundidad como entrada auxiliar para segmentación, detección o síntesis novel-view en modelos generativos 3D.

## Benchmarks y rendimiento

Precisión (AbsRel / delta1, ajuste de escala y desplazamiento por mínimos cuadrados, media por imagen):

| Variante | Dataset | Original | Portable | Kernels |
|---|---|---|---|---|
| `metric3d-vit-large` | NYUv2 test | 0,0546 / 0,9676 | 0,0547 / 0,9673 | 0,0546 / 0,9673 |
| `metric3d-vit-large` | iBims-1 | 0,0334 / 0,9853 | 0,0334 / 0,9855 | 0,0334 / 0,9855 |
| `metric3d-vit-large` | ETH3D two-view train left | 0,0746 / 0,9406 | 0,0740 / 0,9410 | 0,0741 / 0,9410 |
| `metric3d-vit-large` | Middlebury 2014 trainingH left | 0,0248 / 0,9961 | 0,0247 / 0,9961 | 0,0247 / 0,9961 |

Velocidad y memoria (Middlebury 2014 half, 994x1482, RTX 5060 Ti 16 GB):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico (MiB, alloc/reserved) original / portable / kernels |
|---|---|---|---|---|---|---|
| `metric3d-vit-large` | 628,7 | 438,5 | 200,31 | 158,46 | 2,8x | 3275/3350 · 1484/1696 · 1516/1688 |

Velocidad y memoria a tamaños fijos:

| Modo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| Portable | 207,0 ms / 2219 / 2422 MiB | 207,0 ms / 2228 / 2440 MiB | 207,3 ms / 2242 / 2428 MiB | 211,9 ms / 2401 / 2926 MiB |
| Kernels | 158,4 ms / 1471 / 1796 MiB | 158,4 ms / 1478 / 1812 MiB | 158,8 ms / 1492 / 1822 MiB | 162,9 ms / 1616 / 2022 MiB |

Tiempos de carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Portable (s) | Kernels (s) |
|---|---|---|---|---|---|---|
| `metric3d-vit-large` | 9,96 | 3,45 | 0,31 | 0,88 | 0,23 | 0,16 |

## Requisitos de hardware

- VRAM estimada: unos 1,5 GiB en modo `kernels` fp16 y unos 2,2-2,4 GiB en modo `portable` para resoluciones de hasta 1080p; sube a ~2,0-2,9 GiB con imágenes de 12 MP.
- Probado hasta 3000x4000 con 2,3 GiB de pico asignado y 2,9 GiB reservado en una RTX 5060 Ti de 16 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para el backend `portable`; el backend `kernels` requiere compilación CUDA (probado en sm_120, RTX 5060 Ti).
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 5060 Ti y superiores. En GPUs con 8 GB o menos hay margen amplio.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`), código original de Metric3D en PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: ~158 ms por imagen 994x1482 con `kernels`; ~207 ms en `portable` a 640x480 y ~212 ms a 12 MP. Aceleración de 2,8x frente al código original en fp32.
- Arranque: 0,31 s de carga con `kernels` frente a 9,96 s del código original.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de profundidad | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metric3D v2 ViT-L (esta ficha) | no disponible (ViT-L) | Métrica, con normales y confianza | Cualquier H x W >= 8 | BSD-2-Clause (código); pesos sin declarar | Hugging Face (pesos en JUGGHM/Metric3D) |
| Depth Anything V2 (ViT-L) | no disponible | Relativa (no métrica en la variante base) | Resolución variable | Apache 2.0 / licencia específica según variante | Hugging Face |
| MiDaS DPT (ViT-L) | no disponible | Relativa | Resolución variable | MIT | Hugging Face / torch.hub |
| ZoeDepth | no disponible | Métrica (con cabecera métrica) | Resolución variable | MIT | Hugging Face |

La ventaja diferencial de Metric3D v2 frente a Depth Anything V2 y MiDaS es la profundidad métrica directa con normales y confianza en una sola pasada; frente a ZoeDepth, el decodificador iterativo y el espacio canónico de cámara ofrecen mejor generalización entre cámaras. No se dispone de datos de benchmarks cruzados en la información proporcionada para cuantificar la comparación.

## Limitaciones y advertencias

- La convención de las normales de superficie (ejes y signo de la cámara) no está validada contra ningún conjunto de datos; se devuelve tal cual la produce el código original.
- El repositorio es de nivel experimental: no hay garantías de estabilidad de API ni de mantenimiento a largo plazo.
- Licencia ambigua: los autores no declaran licencia de pesos y piden contactarles para uso comercial; el repositorio asume BSD-2-Clause a partir del código. Antes de un despliegue comercial conviene verificar con los autores.
- Los conjuntos ETH3D y Middlebury podrían estar presentes en los datos de entrenamiento, por lo que sus métricas pueden estar infladas.
- Riesgo de alucinación geométrica: en escenas con superficies reflectantes, transparentes o texturas repetitivas la profundidad puede ser incorrecta sin señal de error fiable más allá del mapa de confianza.
- Sesgos de dominio: el entrenamiento se apoya en 18 conjuntos públicos con sobrerrepresentación de escenas de interior, conducción y exteriores urbanos; el rendimiento en dominios exóticos (submarino, microscopía, satélite) no está documentado.
- No procesa texto ni lenguaje natural: no sirve para tareas multimodales de razonamiento.
- El backend `kernels` requiere compilación CUDA específica para la arquitectura de GPU; en GPUs no soportadas hay que recurrir a `portable`.
- La resolución de entrada se redimensiona o rellena internamente, lo que puede introducir artefactos en imágenes con relaciones de aspecto extremas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/metric3d
- Pesos del autor: https://huggingface.co/JUGGHM/Metric3D
- Código del envoltorio fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de Metric3D: https://github.com/YvanYin/Metric3D
- Paper Metric3D v2: https://arxiv.org/abs/2404.15506
- Benchmarks del envoltorio: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Nota de licencia original: https://github.com/YvanYin/Metric3D/blob/eb5b6fac0dc155e4e52f576e304fbf11655ff339/README.md#license-and-contact
