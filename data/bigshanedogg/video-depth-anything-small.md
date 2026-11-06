# bigshanedogg/Video-Depth-Anything-Small

## Resumen

Video-Depth-Anything-Small es un modelo de estimación de profundidad para vídeo desarrollado originalmente por ByteDance (Sili Chen, Hengkai Guo, Shengnan Zhu, Feihu Zhang, Zilong Huang, Jiashi Feng y Bingyi Kang) y publicado en el repositorio DepthAnything/Video-Depth-Anything. La ficha que nos ocupa, `bigshanedogg/Video-Depth-Anything-Small`, es un port no oficial al formato Transformers que ejecuta el código original del modelo mediante `trust_remote_code`. El modelo resuelve el problema de la estimación de profundidad temporalmente consistente en vídeos muy largos, superando la limitación de los modelos por fotograma que producen parpadeos y saltos de escala entre frames.

Arquitectura híbrida: un backbone DINOv2 ViT-S/14 (extracción de características por fotograma) acoplado a una cabeza DPT temporal con módulos de movimiento, que agrega información entre frames para mantener coherencia. Con 29.080.193 parámetros (unos 29 M) y un tamaño de repositorio de 0,1 GB, es un modelo ligero orientado a inferencia sobre vídeo, con soporte de hasta 32 fotogramas por clip en la API estándar y una función específica (`infer_video_depth`) para procesar vídeos completos de longitud arbitraria mediante ventanas deslizantes con solapamiento de keyframes y alineación de escala/desplazamiento.

Es relevante ahora porque el port permite cargar el modelo con `AutoModelForDepthEstimation` y `AutoProcessor` de Transformers, integrándolo en pipelines estándar del ecosistema (entrenamiento, evaluación, despliegue) sin depender del repositorio original. La verificación reportada por el autor del port indica resultados bit-idénticos frente al código oficial en fp32 y fp16 autocast sobre dos vídeos de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + cabeza DPT temporal con módulos de movimiento |
| Parametros totales | 29.080.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de 32 fotogramas por clip (inferencia de vídeo completo mediante ventanas deslizantes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (convertido desde el `.pth` original; tensores con nombres originales) |

## Arquitectura y entrenamiento

El modelo combina un codificador de imagen DINOv2 ViT-S/14 (`pretrained`) que produce características por fotograma, con una cabeza DPT temporal (`head`) que incorpora módulos de movimiento para propagar información entre frames. La salida es profundidad inversa relativa con forma `(B, T, H, W)`, hasta 32 fotogramas por clip en la pasada estándar. La inferencia de vídeo completo (`infer_video_depth`) procesa el vídeo en ventanas de 32 fotogramas con solapamiento de keyframes y aplica alineación de escala y desplazamiento entre ventanas para mantener la consistencia global; existe además una inferencia en streaming experimental (`infer_video_depth_one`) que procesa un fotograma cada vez.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un modelo de profundidad). El port mantiene el código original vendorizado (desde el commit `4f5ae231` del repositorio DepthAnything/Video-Depth-Anything) con cambios limitados a imports y al uso de `NestedTensorBlock`. La verificación reportada compara preprocessing, `predicted_depth`, hidden states, post-procesado, `infer_video_depth` sobre un vídeo de más de una ventana e inferencia en streaming, en fp32 y fp16 autocast, con resultados bit-idénticos.

## Capacidades

- Estimación de profundidad densa por fotograma a partir de vídeo RGB.
- Coherencia temporal entre fotogramas gracias a los módulos de movimiento de la cabeza DPT.
- Procesamiento de vídeos de longitud arbitraria mediante ventanas de 32 fotogramas con solapamiento y alineación de escala/desplazamiento.
- Inferencia en streaming experimental, fotograma a fotograma, con `infer_video_depth_one` y `reset_streaming`.
- Salida de profundidad inversa relativa con post-procesado redimensionable a la resolución objetivo (`post_process_depth_estimation`).
- Exposición de hidden states de DINOv2 mediante `output_hidden_states=True`.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D y fotogrametría a partir de vídeo: la consistencia temporal entre ventanas permite generar mapas de profundidad estables para algoritmos de structure-from-motion o fusión de nubes de puntos, evitando el parpadeo típico de modelos por fotograma.
- Efectos visuales y post-producción: extracción de profundidad por frame para desenfoque de fondo selectivo, relighting o composición de capas (rotoscopia asistida) en planos largos.
- Robótica y navegación asistida: estimación de profundidad en tiempo casi real desde cámaras monoaurales, con la variante de streaming (`infer_video_depth_one`) para procesar fotogramas conforme llegan.
- Vehículos autónomos y ADAS de bajo coste: percepción de distancia relativa con un modelo de 29 M de parámetros que cabe en GPUs de consumo, útil para prototipado y sistemas empotrados.
- Realidad aumentada y VR: oclusión y anclaje de objetos virtuales usando la profundidad estimada del entorno en vídeo continuo.
- Análisis deportivo y biomecánico: seguimiento de profundidad de sujetos en secuencias largas para estimar trayectorias y distancias relativas.
- Generación de vídeo condicionada por profundidad: preprocesado de datasets para modelos de difusión de vídeo que requieren mapas de profundidad temporales consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 0,1 GB en fp32 (29 M de parámetros); la VRAM real depende de la resolución de entrada (por defecto `input_size=518`) y del número de fotogramas por ventana (hasta 32). En la verificación del port se usó una V100, sin cifras de consumo publicadas.
- GPU recomendadas: cualquier GPU con suficiente memoria para la resolución y ventana elegidas; una V100 se confirma como válida en la verificación del autor del port. Para fp16 autocast se recomienda una GPU con soporte de tensor cores.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; la VRAM vendrá dominada por las activaciones de la ventana de 32 fotogramas a 518 px, no por los pesos.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (`AutoModelForDepthEstimation`, `AutoProcessor`); requiere además `opencv-python`, `torchvision`, `einops`, `easydict` y `tqdm`; `xformers` es opcional. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Video-Depth-Anything-Small (este port) | 29.080.193 | 32 fotogramas por clip; vídeo completo por ventanas | Profundidad de vídeo con consistencia temporal | Apache-2.0 | Hugging Face (port no oficial) |
| Video-Depth-Anything-Small (original, depth-anything) | 29.080.193 | Igual | Igual | Apache-2.0 | Repositorio oficial DepthAnything/Video-Depth-Anything |
| Depth-Anything (modelos por imagen) | no disponible | Por fotograma | Profundidad de imagen | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otras alternativas de estimación de profundidad de vídeo.

## Limitaciones y advertencias

- Port no oficial: no es un lanzamiento de ByteDance; el mantenimiento y la corrección de posibles fallos dependen del autor del port (`bigshanedogg`).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar `vda_*.py` antes de usarlo en producción.
- Salida de profundidad inversa relativa, no métrica absoluta; para distancias reales hace falta calibración externa.
- Ventana estándar de 32 fotogramas; vídeos más largos dependen de la lógica de ventanas deslizantes y alineación, que puede acumular deriva en secuencias muy largas.
- La inferencia en streaming está marcada como experimental en el proyecto original.
- Sin capacidades de lenguaje, tool calling ni agentes; no apto para tareas de texto.
- No se documentan sesgos específicos ni tasas de error en la información disponible; como todo modelo de profundidad monocular, puede fallar en superficies reflectantes, transparentes, texturas repetitivas y escenas con iluminación extrema.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución y el NOTICE del proyecto original.

## Enlaces

- Hugging Face (este port): https://huggingface.co/bigshanedogg/Video-Depth-Anything-Small
- Modelo base oficial: https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Repositorio oficial: https://github.com/DepthAnything/Video-Depth-Anything
- Paper: https://arxiv.org/abs/2501.12375
- Repositorio DINOv2 (backbone): https://github.com/facebookresearch/dinov2
