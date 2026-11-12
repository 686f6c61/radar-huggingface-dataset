# hammershock/pixal4d

## Resumen

Pixal4D es un conjunto de tres adaptadores LoRA incrementales (SS64, Geometry512 y Material512) publicados por el usuario hammershock sobre el modelo base TencentARC/Pixal3D, un sistema de reconstruccion 3D a partir de imagen. El objetivo del proyecto es extender Pixal3D, que trabaja con una unica imagen estatica, hacia la generacion de mallas 3D texturizadas y animadas a partir de video, es decir, video-to-3D y video-to-4D. Cada adaptador tiene rango 32 y alpha 32, y se entreno durante 4000 pasos de optimizador con secuencias de 8 fotogramas muestreadas a 8 FPS.

El repositorio no incluye los pesos base, ni el estado del optimizador, ni los datos de entrenamiento: unicamente los tensores LoRA (120 tensores exportados por etapa) y un manifiesto `baseline.json` con arquitectura, checksums y hashes de los pesos base sobre los que se entreno. La inferencia descarga automaticamente los pesos de Pixal3D en una revision fijada, ademas de las dependencias DINOv3/NAF y los pesos de estimacion de camara de MoGe-2.

Es relevante ahora porque demuestra un flujo completo de adaptacion de un modelo image-to-3D a video-to-4D mediante LoRA de bajo rango, con un pipeline de inferencia por chunks de 8 fotogramas y solapamiento de 1 fotograma que produce un unico GLB texturizado y animado. El proyecto esta en fase de baseline: el propio autor advierte que las comprobaciones de calidad realizadas corresponden a la release anterior (paso 3000) y no constituyen una evaluacion de calidad general de los pesos del paso 4000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32 / alpha 32) sobre el modelo base Pixal3D (image-to-3D); tres etapas: SS64, Geometry512 y Material512 |
| Parametros totales | no disponible (solo se publican los adaptadores; 120 tensores LoRA por etapa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa video por chunks de maximo 8 fotogramas con 1 fotograma de solapamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal video/imagen a 3D; no es un modelo de lenguaje) |
| Licencia | no disponible (el autor remite a las licencias y condiciones de acceso del modelo base y sus dependencias) |
| Formato de pesos | pesos PyTorch (adaptadores LoRA); salida en GLB con texturas PBR y manifiesto JSON de tiempos |

## Arquitectura y entrenamiento

El sistema se compone de tres adaptadores LoRA incrementales sobre Pixal3D: SS64, Geometry512 y Material512. Cada uno es de rango 32 con alpha 32 y se entreno durante 4000 pasos de optimizador con secuencias de 8 fotogramas a 8 FPS. Los checkpoints publicados son los baselines puros en el paso 4000 para las tres etapas, continuados desde los entrenamientos originales en el paso 3000. No se incluyen ramas de trayectoria ni de refinado.

En cuanto a la entrada, las tres etapas usan imagenes RGB/DINO de 512x512 (parches DINO de 32x32); la NAF de geometria es de 128x128 y la NAF de material de 256x256. Un fotograma fuente de 1024x1024 se reescala directamente a 512x512, y el nombre de fichero `texture1024` no implica acondicionamiento a 1024x1024 para Material512. La etapa de material emplea el flujo preentrenado nativo de 1024 configurado en grid 32, coherente con la configuracion de entrenamiento del baseline 512. La inferencia en tres etapas usa chunks de como maximo 8 fotogramas con 1 fotograma de solapamiento y la referencia latente de tres etapas del chunk anterior; solo el primer fotograma se inicializa con Pixal3D congelado. El ajuste de camara sigue el procedimiento nativo de Pixal3D: se estima el FOV del primer fotograma con MoGe-2 y se calcula la distancia como `0.5 / (mesh_scale * tan(fov / 2))`, compartiendo la camara en todo el video.

## Capacidades

- Conversion de video a malla 3D texturizada y animada, con salida en un unico GLB y pistas STEP de glTF que seleccionan un fotograma por vez en los timestamps de origen.
- Generacion video-to-3D y video-to-4D (geometria y material animados por fotograma).
- Mallas independientes por fotograma que conservan topologia, normales, UVs y texturas PBR.
- Estimacion de camara a partir del primer fotograma con MoGe-2, con opciones para fijar FOV (`--fov`) o distancia (`--distance`).
- Preprocesado opcional de segmentacion y composicion sobre fondo negro (`--preprocess`), desactivado por defecto.
- Procesamiento de video de duracion ilimitada mediante chunks (limite configurable con `--max_frames`).
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Digitalizacion de objetos a partir de video de movil: grabar un objeto en video a 8 FPS y obtener un GLB texturizado con geometria y material coherentes entre fotogramas, util para catalogos de e-commerce o archivos patrimoniales.
- Animacion de assets para videojuegos y motores 3D: el GLB resultante incluye pistas STEP de glTF que permiten reproducir la secuencia capturada fotograma a fotograma en Three.js, lo que facilita la integracion en visores web.
- Captura de movimiento volumetrica de bajo coste: al conservar topologia, normales y UVs por fotograma, el resultado sirve para prototipar escenas animadas sin un pipeline de fotogrametria completo.
- Previsualizacion de productos en realidad aumentada: el GLB con texturas PBR puede cargarse en visores AR/VR que acepten glTF, partiendo de un video corto de 22 fotogramas (tres chunks completos).
- Investigacion en adaptacion de modelos image-to-3D a video: los adaptadores LoRA y el manifiesto `baseline.json` con hashes permiten reproducir el entrenamiento y comparar variantes sobre el mismo base congelado.
- Generacion de contenido para simulacion y robotica: la estimacion de camara compartida y la geometria por fotograma permiten reconstruir escenas dinamicas simples para entrenamiento de perceptores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta comprobaciones de runtime sobre la release del paso 3000: 12 comparaciones en GPU de acondicionamiento proyectado coincidentes con Pixal3D nativo (dos fotogramas, dos camaras, tres etapas), una salida GLB de 2,75 segundos a partir de 22 fotogramas unicos de 1024² a 8 FPS, validacion Khronos sin errores ni advertencias, y reproduccion correcta en Three.js en todos los limites de fotograma, puntos medios e intervalos de bucle. Estas comprobaciones no establecen la calidad general de generacion de los pesos del paso 4000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor valida el flujo en una GPU A100 con instalacion Linux limpia.
- GPU recomendadas: A100 (unica GPU mencionada en las comprobaciones del autor); no se documentan resultados en otras GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: script propio `inference_pixal4d_baseline.py` sobre PyTorch, con descarga automatica de pesos base Pixal3D (revision `b0cb2e1b794cab9aa0ac38a95d794a4d9337437f`), dependencias DINOv3/NAF y pesos de camara `Ruicheng/moge-2-vitl`. Requiere la instalacion fijada de MoGe-2 indicada en el repositorio para compatibilidad con utils3d de Pixal3D.
- Latencia y throughput: no disponibles; solo se documenta que 22 fotogramas de 1024² a 8 FPS generan un GLB de 2,75 segundos de duracion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hammershock/pixal4d | LoRA video-to-4D sobre Pixal3D | no disponible (rank 32, 3 etapas) | chunks de 8 fotogramas, entrada 512x512 RGB/DINO | no disponible | Hugging Face, repo de 0,2 GB |
| TencentARC/Pixal3D | Image-to-3D base | no disponible | una imagen | no disponible | Hugging Face (modelo base) |
| Alternativas video-to-3D/4D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio solo contiene adaptadores LoRA: no incluye pesos base, estado de optimizador/RNG ni datos de entrenamiento, por lo que no es un modelo autonomo.
- Las comprobaciones de calidad documentadas corresponden a la release del paso 3000 y no constituyen una evaluacion de los pesos del paso 4000.
- La camara estimada no es una reconstruccion calibrada y la topologia de malla puede diferir entre fotogramas.
- Para video a 24 FPS hay que seleccionar cada tercer fotograma antes de la inferencia, sin interpolacion.
- El preprocesado de segmentacion y fondo negro es opcional y esta desactivado por defecto; su omision puede afectar a la calidad del recorte.
- Riesgo de sesgos y alucinacion geometrica: no documentado por el autor; al ser un modelo de reconstruccion, puede generar geometria o texturas plausibles pero incorrectas.
- Licencia no disponible: el uso comercial queda sujeto a las licencias y condiciones de acceso del modelo base Pixal3D y de sus dependencias (DINOv3, NAF, MoGe-2), que el repositorio no redistribuye.
- El proyecto tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/hammershock/pixal4d
- Repositorio de codigo e instalacion: https://github.com/hammershock/pixal4d
- Modelo base: https://huggingface.co/TencentARC/Pixal3D
- Pesos de estimacion de camara: https://huggingface.co/Ruicheng/moge-2-vitl
