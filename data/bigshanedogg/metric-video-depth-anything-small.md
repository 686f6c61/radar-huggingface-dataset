# bigshanedogg/Metric-Video-Depth-Anything-Small

## Resumen

Metric-Video-Depth-Anything-Small es un port no oficial a transformers del modelo Video Depth Anything (variante Metric Small) desarrollado originalmente por ByteDance (Sili Chen, Hengkai Guo, Shengnan Zhu, Feihu Zhang, Zilong Huang, Jiashi Feng y Bingyi Kang). El modelo resuelve el problema de la estimacion de profundidad densa y temporalmente consistente en videos de gran longitud, devolviendo mapas de profundidad metrica en metros. El port, publicado por el usuario bigshanedogg, mantiene el codigo original de inferencia y los pesos convertidos a safetensors, verificados como identicos tensor a tensor.

La arquitectura combina un backbone DINOv2 ViT-S/14 (que aporta las caracteristicas visuales por fotograma) con una cabeza DPT temporal que incorpora modulos de movimiento para propagar informacion entre fotogramas. El modelo cuenta con 29.080.193 parametros totales y procesa ventanas de hasta 32 fotogramas por clip, con soporte para inferencia de video completo mediante ventanas deslizantes con solapamiento de keyframes y para inferencia en streaming (experimental).

Su relevancia actual radica en que ofrece profundidad metrica temporalmente consistente para videos arbitrariamente largos, algo que los modelos de profundidad por imagen no garantizan, y lo hace con un modelo compacto (ViT-S) bajo licencia Apache-2.0, lo que facilita su integracion en pipelines de vision por computador en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + cabeza DPT temporal con modulos de movimiento |
| Parametros totales | 29.080.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); ventana de 32 fotogramas por clip |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (convertido desde `metric_video_depth_anything_vits.pth`) |

## Arquitectura y entrenamiento

El modelo es un transformer de vision con backbone DINOv2 ViT-S/14 que extrae caracteristicas por fotograma, seguido de una cabeza DPT temporal que incorpora modulos de movimiento para agregar informacion a lo largo del eje temporal. La salida es un tensor de profundidad `(B, T, H, W)` con valores metricos en metros. El checkpoint metrico (`config.metric=True`) omite el ajuste de escala y desplazamiento entre ventanas que si aplica la variante relativa, de modo que las predicciones son directamente comparables en unidades fisicas.

El port mantiene el codigo original de Video Depth Anything (commit 4f5ae231) vendorizado en ficheros `vda_*.py`, con cambios limitados a imports y a la sustitucion de `Block` por `NestedTensorBlock`. Segun el autor, la verificacion frente al codigo oficial en una V100 muestra resultados bit a bit identicos en preprocesado, `predicted_depth`, estados ocultos, postprocesado, `infer_video_depth` sobre un video de mas de una ventana y streaming, tanto en fp32 como con autocast fp16. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO, dado que se trata de un port de un modelo ya entrenado por ByteDance.

## Capacidades

- Estimacion de profundidad densa y metrica (en metros) por fotograma en videos.
- Consistencia temporal gracias a los modulos de movimiento de la cabeza DPT.
- Procesamiento de videos de longitud arbitraria mediante ventanas de 32 fotogramas con solapamiento de keyframes y alineamiento de escala/desplazamiento (omitido en la variante metrica).
- Inferencia en streaming fotograma a fotograma mediante `infer_video_depth_one` (experimental, heredado del codigo original).
- Salida compatible con `DepthEstimatorOutput` de transformers, incluyendo `predicted_depth` y estados ocultos opcionales.
- Postprocesado integrado con redimensionado bilineal (`align_corners=True`) a la resolucion objetivo.
- No soporta tool calling, agentes, generacion de texto, codigo, matematicas ni capacidades multilingues: es exclusivamente un modelo de vision para profundidad.

## Casos de uso

- Reconstruccion 3D y fotogrametria a partir de video: el modelo proporciona profundidad metrica por fotograma con consistencia temporal, lo que permite generar nubes de puntos o mallas sin parpadeos entre fotogramas, algo critico para pipelines de reconstruccion.
- Navegacion de robots y drones: la profundidad metrica en metros permite planificacion de trayectorias y evitacion de obstaculos directamente en unidades fisicas, sin calibracion adicional de escala.
- Efectos visuales y postproduccion: generacion de mapas de profundidad para desenfoque de fondo, composicion o conversion a 3D estereoscopico en secuencias de video largas, donde la consistencia temporal evita artefactos de flickering.
- Automocion y ADAS: estimacion de distancia a peatones, vehiculos y obstaculos a partir de camaras monofocales, aprovechando la ventana de 32 fotogramas para suavizar la prediccion temporal.
- Analisis de video en vigilancia: deteccion de intrusiones o estimacion de distancias en secuencias de camaras fijas, con procesamiento por ventanas deslizantes sobre videos de horas de duracion.
- Realidad aumentada y virtual: insercion de objetos virtuales con oclusion correcta respecto a la escena real, usando la profundidad metrica para alinear la geometria virtual con la fisica.
- Investigacion en vision por computador: modelo compacto (29 M de parametros) y con licencia Apache-2.0 que sirve como baseline reproducible para experimentos de profundidad de video, con inferencia en streaming para escenarios de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 29 M de parametros, los pesos en fp32 ocupan aproximadamente 116 MB y en fp16 unos 58 MB; la VRAM efectiva dependera de la resolucion de entrada (518 px de lado en la configuracion por defecto) y del numero de fotogramas por ventana (hasta 32).
- GPU recomendadas: el autor verifico el port en una NVIDIA V100. Por tamano, el modelo cabe holgadamente en GPUs consumer como RTX 3060, RTX 4060, RTX 4070 o RTX 4090.
- Cabe en GPU consumer: si, dado el reducido numero de parametros y la resolucion de trabajo moderada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `opencv-python`, `torchvision`, `einops`, `easydict`, `tqdm`; `xformers` opcional). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Consistencia temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Metric-Video-Depth-Anything-Small (este) | 29,1 M | Profundidad metrica (m) | Si (modulos de movimiento) | Apache-2.0 | Hugging Face (port no oficial) |
| depth-anything/Metric-Video-Depth-Anything-Small (original) | 29,1 M | Profundidad metrica (m) | Si | Apache-2.0 | Hugging Face (oficial) |
| Depth Anything V2 (variantes por imagen) | Variable (ViT-S a ViT-G) | Profundidad relativa o metrica por imagen | No | Apache-2.0 / otras segun variante | Hugging Face |
| Video Depth Anything (variante relativa) | 29,1 M (Small) | Profundidad relativa | Si | Apache-2.0 | Hugging Face / GitHub |

La comparativa se limita a la informacion disponible; no se dispone de datos de rendimiento cuantitativo para contrastar estos modelos.

## Limitaciones y advertencias

- Port no oficial: no ha sido publicado por ByteDance ni por el equipo original de Video Depth Anything; el autor lo etiqueta explicitamente como no oficial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar los ficheros `vda_*.py` antes de usarlo en produccion.
- Ventana maxima de 32 fotogramas por clip; para videos mas largos se depende del mecanismo de ventanas deslizantes con solapamiento, que puede introducir discontinuidades residuales pese al alineamiento.
- La inferencia en streaming (`infer_video_depth_one`) es experimental segun el codigo original.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluacion de robustez en condiciones adversas (iluminacion, oclusiones, movimiento rapido).
- No hay informacion sobre el dataset de entrenamiento ni sobre sesgos demograficos o geograficos del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar el trabajo original segun solicita el autor.
- Al ser un modelo de vision, no procesa lenguaje ni admite instrucciones en texto; su uso esta limitado a estimacion de profundidad.

## Enlaces

- Hugging Face: https://huggingface.co/bigshanedogg/Metric-Video-Depth-Anything-Small
- Modelo base oficial: https://huggingface.co/depth-anything/Metric-Video-Depth-Anything-Small
- Repositorio original: https://github.com/DepthAnything/Video-Depth-Anything
- Paper: https://arxiv.org/abs/2501.12375
