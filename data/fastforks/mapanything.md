# fastforks/mapanything

## Resumen

MapAnything es un modelo de reconstruccion 3D multivista que estima profundidad metrica, camaras e intrinsicas a partir de varias imagenes de una misma escena en un unico forward pass, sin necesidad de poses conocidas. Lo desarrolla el equipo de Meta (Keetha et al. 2025) y el repositorio `fastforks/mapanything` es un paquete de reempaquetado que no aloja pesos: descarga los checkpoints oficiales de `facebook/map-anything-apache` y los verifica mediante SHA-256.

La arquitectura combina un backbone DINOv2 ViT-g/14 que extrae caracteristicas por vista, 16 bloques de atencion alternos (global y por vista) con un token de escala metrica, y cabezas especificas: una cabeza DPT que predice direcciones de rayo, profundidad a lo largo del rayo, confianza y no-ambiguedad, mas cabezas de pose y escala. El modelo es solo de imagenes; las entradas geometricas opcionales del codigo original no estan soportadas.

Su relevancia practica reside en la licencia Apache-2.0 del checkpoint `map-anything-apache` (entrenado solo con el subconjunto de los 13 datasets del paper cuyas licencias permiten uso comercial), frente al checkpoint `facebook/map-anything` bajo CC-BY-NC. El paquete `fastforks` anade ademas backends optimizados (`portable` y `kernels`) con mejoras de velocidad de hasta 3,6x frente al codigo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multivista: DINOv2 ViT-g/14 + 16 bloques de atencion global/por vista + cabeza DPT + cabezas de pose y escala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa varias vistas de una escena en un forward pass) |
| Tipos de cuantizacion | fp32 (CPU), fp16 (GPU, por defecto); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 (codigo y pesos `map-anything-apache`) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

MapAnything procesa un conjunto de vistas de una misma escena mediante un backbone DINOv2 ViT-g/14 que produce caracteristicas por vista. Sobre ellas aplica 16 bloques de atencion que alternan atencion global entre vistas y atencion intra-vista, incorporando un token de escala metrica que permite predecir profundidad en unidades metricas. La salida se genera a traves de una cabeza DPT que emite direcciones de rayo, profundidad a lo largo del rayo, mapas de confianza y de no-ambiguedad, junto con cabezas dedicadas a pose de camara y escala.

El checkpoint `map-anything-apache` se entrena con el subconjunto de los 13 datasets del paper cuyas licencias permiten uso comercial; la lista exacta se detalla en la publicacion. El repositorio no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Como innovacion destacable, el modelo resuelve reconstruccion multivista metrica en un solo forward pass sin requerir poses de camara de entrada (aunque acepta intrinsicas y `cam_to_world` en modo MVS calibrado).

## Capacidades

- Reconstruccion 3D multivista a partir de varias imagenes de una escena en un unico forward pass.
- Estimacion de profundidad metrica con mapas de confianza y de no-ambiguedad.
- Estimacion de poses de camara (`cam_to_world`) e intrinsicas (`intrinsics`) cuando el modelo las predice.
- Generacion de nubes de puntos 3D (`world_points`) y factor de escala metrica (`metric_scale`).
- Funcionamiento tanto con imagenes no posadas como con configuracion MVS calibrada (pasando `intrinsics` y `cam_to_world`).
- Soporte de entradas de cualquier resolucion H x W >= 1 (redimensionado o padding interno); probado hasta 3000x4000.
- Backends `portable` (PyTorch puro) y `kernels` (kernels CUDA propios `fastbb`).
- No soporta tool calling, agentes ni capacidades linguisticas o multimodales de texto.

## Casos de uso

- Digitalizacion de espacios interiores: a partir de un conjunto de fotografias de una habitacion, el modelo genera mapas de profundidad y nubes de puntos con escala metrica, utiles para planos o gemelos digitales.
- Reconstruccion para fotogrametria sin calibracion: al no requerir poses conocidas, permite procesar capturas de drones o moviles directamente y obtener camaras y estructura en un solo paso.
- Generacion de activos 3D para videojuegos o realidad aumentada: las nubes de puntos y profundidades sirven como entrada a pipelines de mallado o texturizado.
- Inspeccion industrial y mantenimiento: comparar reconstrucciones metricas de una instalacion en distintas fechas para detectar cambios geometricos.
- Robotica y navegacion: estimacion de profundidad metrica y pose de camara a partir de varias vistas para mapeo del entorno.
- Analisis de escenas de gran formato: el modelo procesa imagenes de hasta 12 MP (4000x3000) con picos de memoria de ~7,2 GiB, adecuado para capturas de alta resolucion.
- Preprocesado en pipelines de vision por computador: generar profundidad y confianza como senales auxiliares para tareas posteriores de segmentacion o deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (tipo MMLU, HumanEval o similares) en la informacion disponible, al tratarse de un modelo de vision 3D. Si se documentan mediciones de velocidad y memoria en una RTX 5060 Ti 16 GB (sm_120):

| Configuracion | Tiempo (ms) | Memoria pico asignada / reservada (MiB) |
|---|---|---|
| 336x518, original fp32 | 2875,36 | 10227 / 10952 |
| 336x518, portable fp16 | 635,92 | 3697 / 4092 |
| 336x518, kernels | 543,98 | 3697 / 4072 |
| 640x480, portable | 680,9 | 3914 / 5848 |
| 640x480, kernels | 569,7 | 3914 / 5846 |
| 1280x720, portable | 493,1 | 3635 / 5196 |
| 1280x720, kernels | 415,3 | 3635 / 5196 |
| 1920x1080, portable | 498,1 | 3846 / 5442 |
| 1920x1080, kernels | 419,9 | 3846 / 5442 |
| 12 MP (4000x3000), portable | 734,6 | 7240 / 9442 |
| 12 MP (4000x3000), kernels | 622,3 | 7240 / 9440 |

Tiempos de carga: 6,12 s (original), 2,89 s (portable) y 0,57 s (kernels). Primera llamada: 2,62 s (original), 0,66 s (portable) y 0,54 s (kernels). El backend `kernels` ofrece hasta 3,6x de aceleracion frente al original y 1,2x frente a `portable`. En paridad numerica, la diferencia maxima frente al codigo original es <= 0,002 en CPU fp32, y en GPU fp16 la diferencia media es <= 1 % con p99 <= 5 % del valor mediano de referencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de reconstruccion multivista comparables (por ejemplo, DUSt3R, MASt3R o VGGT), por lo que no es posible establecer una comparacion con cifras verificables.

## Limitaciones y advertencias

- El repositorio no aloja pesos: depende de la descarga externa de `facebook/map-anything-apache` y de la verificacion SHA-256; si el enlace cambia, el paquete puede fallar.
- Solo acepta imagenes: las entradas geometricas opcionales del codigo original no estan soportadas.
- El checkpoint Apache-2.0 se entreno con un subconjunto de datasets, pero el repositorio no lista cuales son; los terminos de los datos de entrenamiento quedan poco claros y conviene revisarlos antes de un uso comercial.
- El checkpoint `facebook/map-anything` bajo CC-BY-NC no se empaqueta, por lo que no esta disponible a traves de este paquete.
- El backend `kernels` requiere una GPU NVIDIA con arquitectura soportada y un driver reciente; en caso contrario lanza `BackendUnavailableError`.
- El modelo esta marcado como "experimental" por el autor del paquete.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque el modelo no procesa texto.
- La calidad de la reconstruccion depende de la calidad y cobertura de las vistas de entrada; no se aportan metricas de error geometrico (por ejemplo, RMSE de profundidad) en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fastforks/mapanything
- Pesos oficiales (Apache-2.0): https://huggingface.co/facebook/map-anything-apache
- Codigo del paquete fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Codigo original de Meta: https://github.com/facebookresearch/map-anything (commit `3d10cf7`)
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/mapanything/card.toml
- Licencia del codigo original: https://github.com/facebookresearch/map-anything/blob/3d10cf7/LICENSE
