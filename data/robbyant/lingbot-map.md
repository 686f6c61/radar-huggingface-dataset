# robbyant/lingbot-map

## Resumen

LingBot-Map es un modelo fundacional de reconstrucción 3D en streaming desarrollado por el equipo Robbyant. Se presenta como un "Geometric Context Transformer" (*feed-forward*) que unifica en un único marco de inferencia el anclaje de coordenadas, las señales geométricas densas y la corrección de deriva de largo alcance, mediante tres mecanismos: contexto de ancla, ventana de referencia de pose y memoria de trayectoria. No es un modelo de lenguaje: es un modelo de visión 3D que consume secuencias de imágenes y produce reconstrucción geométrica y estimación de pose.

La relevancia técnica del modelo reside en su eficiencia de inferencia: una arquitectura *feed-forward* con atención sobre caché KV paginada que mantiene una velocidad estable de aproximadamente 20 FPS a resolución 518×378 sobre secuencias que superan las 10.000 imágenes. Esto lo sitúa en competencia directa con enfoques de optimización iterativa (estilo SLAM o *bundle adjustment*) y con otros modelos de reconstrucción en streaming, con la ventaja de no requerir optimización por escena.

El repositorio ocupa 33 GB y se distribuye con pesos en formato ONNX según las etiquetas de Hugging Face, junto con una librería propia (`lingbot-map`) y scripts de demostración, evaluación y renderizado. La model card declara licencia Apache-2.0 en el *badge* y en el apartado de licencia, aunque el campo de licencia del repositorio en Hugging Face figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometric Context Transformer (feed-forward, atencion con cache KV paginada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no expresada en tokens; soporta secuencias de mas de 10.000 frames (probado con ~25.000 frames) |
| Tipos de cuantizacion | no disponible (se mencionan dtypes bf16 en los scripts; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | Apache-2.0 segun la model card (campo de licencia del repo: no disponible) |
| Formato de pesos | ONNX (tag del repositorio); no se detalla el conjunto completo de artefactos |
| Resolucion de inferencia | 518×378 (referencia de rendimiento) |
| Rendimiento de streaming | ~20 FPS en secuencias largas (>10.000 frames) |
| Backends de atencion | FlashInfer (recomendado), SDPA |
| Version de PyTorch recomendada | 2.8.0 con CUDA 12.8 |

## Arquitectura y entrenamiento

LingBot-Map se articula en torno a un transformer de contexto geometrico que procesa la secuencia de entrada de forma *feed-forward*, sin optimizacion iterativa por escena. La model card identifica tres componentes clave: el **contexto de ancla** (*anchor context*), que fija referencias de coordenadas globales; la **ventana de referencia de pose** (*pose-reference window*), que aporta senales geometricas densas locales; y la **memoria de trayectoria** (*trajectory memory*), orientada a corregir la deriva acumulada en secuencias largas. La atencion se implementa sobre una cache KV paginada, lo que permite reutilizar estado entre frames y mantener el coste de inferencia acotado en secuencias de decenas de miles de imagenes.

El modelo incorpora soporte de compilacion (`--compile`) y dos backends de atencion: FlashInfer, recomendado para maximo rendimiento, y SDPA, cuyo bug de cache KV se corrigio el 28 de junio de 2026 mejorando su comportamiento en secuencias largas. La model card documenta correcciones relevantes de ingenieria (cache de no-keyframes con `--keyframe_interval > 1`, corregido el 24 de abril de 2026) que afectan a la calidad de pose y reconstruccion por encima de 320 frames. No se detallan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF/DPO (no aplicables en un modelo de vision 3D).

## Capacidades

- Reconstruccion 3D densa en streaming a partir de secuencias de imagenes, con inferencia *feed-forward* sin optimizacion por escena.
- Estimacion de pose de camara y correccion de deriva de largo alcance mediante memoria de trayectoria.
- Procesamiento de secuencias muy largas: mas de 10.000 frames de forma estable y ejemplos de ~25.000 frames (13 minutos de recorrido interior).
- Inferencia en ventana (*windowed inference*) para secuencias que superan los 3.000 frames, con gestion de intervalos de keyframes.
- Enmascaramiento de cielo (*sky masking*) para mejorar la calidad geometrica en escenas exteriores.
- Renderizado offline mediante pipeline por lotes (`demo_render/batch_demo.py`), con soporte de NVIDIA Kaolin.
- Escenarios cubiertos en las demos: interiores, exteriores, aereos y escenas de LingBot-World.
- Evaluacion reproducible sobre multiples datasets: KITTI, Oxford Spires, VBR, Droid-W, TUM-D, 7-scenes, ETH3D, Tanks and Temples y NRGBD.

## Casos de uso

- **Digitalizacion de interiores a gran escala**: recorridos de video de 13 minutos y ~25.000 frames pueden procesarse con el pipeline offline para generar mapas 3D navegables de edificios, aprovechando la memoria de trayectoria para evitar deriva acumulada.
- **SLAM visual en robots y drones**: la inferencia a ~20 FPS a 518×378 permite usar el modelo como estimador de pose y mapa en tiempo real sobre hardware con GPU, sustituyendo pipelines de optimizacion iterativa.
- **Reconstruccion aerea con drones**: las demos aereas y el enmascaramiento de cielo lo hacen adecuado para fotogrametria de exteriores donde el cielo domina parte del encuadre.
- **Gemelos digitales y escaneo de patrimonio**: reconstruccion de escenas sin necesidad de calibracion ni *bundle adjustment* manual, util para catalogar espacios fisicos con captura unicamente de video.
- **Generacion de contenido 3D para videojuegos y VFX**: el pipeline de renderizado por lotes permite convertir capturas en mallas y vistas renderizadas para *previz* o entornos virtuales.
- **Evaluacion y benchmarking de vision 3D**: los scripts publicados para KITTI, Oxford Spires, ETH3D, Tanks and Temples y otros permiten integrar el modelo como *baseline* en experimentos de reconstruccion y odometria visual.
- **Analisis de video largo en vigilancia o inspeccion**: la ventana deslizante y la cache KV paginada permiten procesar grabaciones extensas sin reiniciar el estado geometrico.

## Benchmarks y rendimiento

La model card afirma un rendimiento "state-of-the-art" frente a enfoques de streaming y de optimizacion iterativa en diversos benchmarks, y publica scripts de evaluacion para KITTI, Oxford Spires, VBR, Droid-W, TUM-D, 7-scenes, ETH3D, Tanks and Temples y NRGBD. Sin embargo, en la informacion proporcionada no se incluyen tablas con valores numericos de metricas (ATE, RPE, completitud, precision, etc.).

No se han publicado resultados de benchmarks numericos en la informacion disponible.

Datos de rendimiento operativo si documentados:

| Metrica | Valor |
|---|---|
| Resolucion de referencia | 518×378 |
| Throughput en streaming | ~20 FPS |
| Longitud de secuencia estable | >10.000 frames |
| Ejemplo maximo documentado | ~25.000 frames (13 min) |
| Backend recomendado | FlashInfer (cache KV paginada) |
| Precision de calculo en scripts | bf16 |

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita; el repositorio pesa 33 GB y la inferencia se ejecuta en bf16, por lo que se requiere una GPU con memoria suficiente para los pesos y la cache KV paginada de la secuencia.
- **GPU recomendadas**: no se listan modelos concretos en la informacion disponible; se asume hardware NVIDIA con CUDA 12.8 (PyTorch 2.8.0) por el uso de FlashInfer y Kaolin.
- **GPU de consumo**: no confirmado. El tamaÃ±o del repositorio (33 GB) y la ausencia de cuantizaciones documentadas hacen improbable su ejecucion en GPUs de consumo con menos de 24 GB sin cuantizar.
- **Despliegue**: instalacion via `pip install -e .` sobre entorno conda con Python 3.10; backend de atencion FlashInfer (`flashinfer-python`, JIT) o SDPA; compilacion opcional con `--compile`; renderizado por lotes con NVIDIA Kaolin.
- **Latencia y throughput**: ~20 FPS a 518×378 en secuencias largas; el resto de configuraciones no esta documentado.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible datos numericos ni nombres de modelos comparables con los que establecer una tabla de parametros, contexto, rendimiento y licencia. La model card solo indica comparaciones genericas frente a "enfoques de streaming existentes" y "metodos de optimizacion iterativa", sin identificarlos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-Map | no disponible | >10.000 frames | ~20 FPS a 518×378; SOTA declarado sin cifras | Apache-2.0 (segun model card) | Hugging Face, ModelScope |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Ausencia de metricas publicas en la informacion disponible**: la afirmacion de SOTA no viene acompanada de cifras verificables en la model card consultada; conviene ejecutar los scripts de evaluacion antes de adoptarlo en produccion.
- **Licencia ambigua en el repositorio**: el campo de licencia de Hugging Face figura como no disponible, aunque la model card declara Apache-2.0. Verificar `LICENSE.txt` antes de uso comercial.
- **Requisitos de hardware elevados**: 33 GB de repositorio y ausencia de cuantizaciones documentadas limitan su despliegue a GPUs profesionales.
- **Dependencia de ecosistema NVIDIA**: FlashInfer, Kaolin y CUDA 12.8 condicionan el entorno; el renderizado por lotes exige PyTorch 2.8.0 o compilar Kaolin desde fuente.
- **Historial de bugs en cache KV**: se documentan correcciones en abril y junio de 2026 que afectaban a calidad de pose y reconstruccion en secuencias largas; usar versiones recientes de `main`.
- **Deriva en secuencias extremas**: aunque el modelo incorpora memoria de trayectoria, no se documentan garantias de precision absoluta mas alla de los ejemplos publicados.
- **Idiomas y sesgos**: no aplica soporte linguistico; los sesgos potenciales serian geometricos (escenas sin textura, superficies reflectantes, iluminacion adversa), no documentados en la informacion disponible.
- **Resolucion fija de referencia**: el rendimiento de ~20 FPS se declara a 518×378; no se especifica el comportamiento a resoluciones superiores.

## Enlaces

- Hugging Face: https://huggingface.co/robbyant/lingbot-map
- Paper (arXiv): https://arxiv.org/abs/2604.14141
- PDF del paper: `lingbot-map_paper.pdf` (referenciado en la model card)
- Web del proyecto: https://technology.robbyant.com/lingbot-map
- ModelScope: https://www.modelscope.cn/models/Robbyant/lingbot-map
- Licencia: `LICENSE.txt` en el repositorio
- Documentacion de FlashInfer: https://docs.flashinfer.ai/installation.html
- PyTorch Get Started: https://pytorch.org/get-started/locally/
