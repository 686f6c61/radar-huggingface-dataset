# kkss118/VACE-Wan2.1-1.3B-Preview

## Resumen

VACE-Wan2.1-1.3B-Preview es un modelo de difusión para creación y edición de vídeo desarrollado por Tongyi Lab (Alibaba), publicado originalmente en el repositorio ali-vilab. Esta ficha corresponde a una re-subida del checkpoint realizada por el usuario kkss118 en Hugging Face, con el mismo contenido y licencia que el original. El modelo unifica en una sola red tareas de generación guiada por referencia (R2V), edición vídeo-a-vídeo (V2V) y edición vídeo-a-vídeo con máscaras (MV2V), y permite componer esas tareas libremente en un mismo pipeline. Sobre el modelo base Wan2.1-T2V-1.3B, VACE añade módulos de condicionamiento que aceptan señales heterogéneas (texto, imágenes de referencia, vídeo de control, máscaras) para tareas como mover, intercambiar, referenciar, expandir o animar cualquier elemento de la escena.

El checkpoint tiene 2.153.972.032 parámetros según los tensores en safetensors y se distribuye en formato diffusers. Genera clips de aproximadamente 81 fotogramas a 480×832 píxeles, que es la resolución de referencia indicada por el autor para obtener resultados óptimos. Es relevante porque acerca a hardware de consumo una familia de tareas de posproducción y edición de vídeo que hasta ahora requería modelos de 14B o pipelines separados por tarea, y lo hace bajo licencia Apache-2.0.

Se trata de un modelo de difusión, no de un modelo de lenguaje: no razona, no ejecuta tool calling y no mantiene conversaciones. Su interfaz es un prompt de texto en inglés o chino combinado con vídeo, imágenes o máscaras de control, y su salida es siempre un clip de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (VACE sobre Wan2.1-T2V-1.3B); el autor no detalla la topología interna en la model card |
| Parametros totales | 2.153.972.032 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; ventana de vídeo de ~81 fotogramas a 480×832 px según la model card |
| Tipos de cuantizacion | No disponible (checkpoint publicado en safetensors para diffusers; no se listan variantes cuantizadas) |
| Idiomas soportados | en, zh (prompts de texto) |
| Licencia | Apache-2.0 (hereda la del modelo base Wan2.1-T2V-1.3B) |
| Formato de pesos | safetensors, formato diffusers |

## Arquitectura y entrenamiento

La model card describe VACE como un modelo «all-in-one» que cubre R2V, V2V y MV2V y permite componer estas tareas, pero no especifica la topología de la red, el número de tokens de entrenamiento ni la composición del dataset de preentrenamiento. El checkpoint deriva de Wan2.1-T2V-1.3B mediante ajuste fino, e incorpora el conjunto de módulos y herramientas de VACE para inyectar condiciones de control (referencias, vídeo de entrada, máscaras). El pipeline declarado en Hugging Face es image-to-video, y los tags incluyen además text-to-video, video-to-video editing y reference-to-video.

El único dato de entrenamiento/evaluación explícito es el uso del dataset ali-vilab/VACE-Benchmark. El autor publica código de inferencia, herramientas de preprocesado (VACE-Annotators) y demos en Gradio en el repositorio de GitHub, pero no documenta en la model card si hubo RLHF, DPO u otras fases de alineación, ni innovaciones como decodificación especulativa o atención lineal. Toda la información técnica detallada debe consultarse en el paper arXiv:2503.07598.

## Capacidades

- Generación de vídeo guiada por referencia (R2V): «Reference-Anything», introducir un sujeto o estilo de referencia en un vídeo nuevo.
- Edición vídeo-a-vídeo (V2V): «Move-Anything», «Swap-Anything», «Animate-Anything» sobre material existente.
- Edición con máscaras (MV2V): modificación localizada de regiones concretas del fotograma.
- «Expand-Anything»: extensión del encuadre o del metraje de un clip.
- Composición libre de tareas: combinar varias condiciones (referencia + máscara + vídeo de control) en una sola pasada.
- Generación texto-a-vídeo heredada del modelo base Wan2.1-T2V-1.3B.
- Prompts en inglés y chino.
- Salida de vídeo de ~81 fotogramas a 480×832 px, con soporte de resoluciones de entrada arbitrarias (el autor advierte que los mejores resultados se obtienen dentro de ese rango).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Posproducción publicitaria: sustituir el producto de una toma por otro a partir de una imagen de referencia, usando R2V y V2V sobre el metraje rodado, sin volver a grabar.
- Prototipado de storyboards: generar clips de 81 fotogramas a 480×832 a partir de un guion en texto para validar ritmo y composición antes de la producción final.
- Edición localizada de metraje: eliminar o reemplazar un objeto con MV2V usando máscaras por fotograma, aprovechando que el modelo acepta la máscara como condición adicional en el mismo pipeline.
- Transferencia de estilo y de movimiento: aplicar la trayectoria o el estilo de un vídeo de control a un vídeo distinto («Move-Anything»), útil en motion graphics y en efectos para redes sociales.
- Ampliación de encuadre para formatos múltiples: reencuadrar un clip vertical en horizontal mediante «Expand-Anything» en lugar de recortar, conservando el sujeto principal.
- Animación de material gráfico: animar ilustraciones o fotografías fijas con «Animate-Anything» para generar contenido de bajo coste en campañas y presentaciones.
- Investigación en generación de vídeo: servir de base reproducible y Apache-2.0 para experimentar con condicionamiento multi-señal sobre un modelo de 1.3B que cabe en GPUs de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia el dataset ali-vilab/VACE-Benchmark y el paper arXiv:2503.07598, sin tablas de métricas en el repositorio.

## Requisitos de hardware

- Peso del checkpoint: 2,15 mil millones de parámetros; en bf16 los tensores del modelo ocupan aproximadamente 4,3 GB. El repositorio completo son 19,0 GB, lo que incluye el resto de artefactos del pipeline diffusers.
- VRAM estimada para inferencia (estimación a partir del tamaño del checkpoint, no confirmada por el autor): 12-16 GB con descarga de módulos a CPU y resolución reducida; 24 GB o más para ejecutar el pipeline completo en bf16 a 480×832 y 81 fotogramas, al margen del codificador de texto y el VAE del modelo base.
- GPU recomendadas: A100 40/80 GB y H100 para lotes y resoluciones altas; RTX 4090 (24 GB) como opción de gama alta de consumo; RTX 3090 (24 GB) con offloading.
- GPU de consumo: es probable que quepa en tarjetas de 16-24 GB aplicando offloading secuencial, a costa de latencia; no hay cifras oficiales de VRAM ni de velocidad.
- Despliegue: diffusers (librería declarada), scripts de inferencia del repositorio ali-vilab/VACE y demos Gradio incluidos por el autor. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La generación de 81 fotogramas a 480×832 con un modelo de difusión de este tamaño implica decenas de pasos de denoising, por lo que se esperan tiempos de segundos a minutos por clip según GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de vídeo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VACE-Wan2.1-1.3B-Preview (esta ficha) | 2,15 B | ~81 × 480 × 832 | R2V, V2V, MV2V, T2V (base) | Apache-2.0 | Publicado (original en ali-vilab; esta es una re-subida) |
| VACE-LTX-Video-0.9 | No disponible en la información proporcionada | ~97 × 512 × 768 | R2V, V2V, MV2V | RAIL-M | Publicado en ali-vilab y ModelScope |
| VACE-Wan2.1-14B | 14 B (según denominación) | ~81 × 720 × 1080 | R2V, V2V, MV2V | Apache-2.0 | Anunciado, pendiente de publicación |
| Wan2.1-T2V-1.3B (modelo base) | 1,3 B (según denominación) | No disponible en la información proporcionada | T2V | Apache-2.0 | Publicado en Wan-AI |

## Limitaciones y advertencias

- Es un checkpoint «Preview»: el autor lo etiqueta como vista previa y la versión definitiva de 1.3B figura como pendiente de publicación, por lo que puede haber cambios y regresiones.
- Esta ficha corresponde a una re-subida de terceros (kkss118) con 0 descargas y 1 like en el momento de la consulta; para producción conviene referenciar el repositorio original ali-vilab/VACE-Wan2.1-1.3B-Preview.
- Licencia Apache-2.0 permite uso comercial, pero hereda también las condiciones del modelo base Wan2.1-T2V-1.3B; conviene revisar el fichero LICENSE del modelo base antes de desplegar.
- El rendimiento óptimo se limita al rango ~81 × 480 × 832; fuera de él la calidad puede degradarse aunque la entrada acepte resoluciones arbitrarias.
- Solo se documentan prompts en inglés y chino; no hay evidencia de soporte para castellano en la información disponible.
- Riesgo de artefactos típicos de difusión: parpadeo temporal, incoherencias de identidad entre fotogramas, deformaciones en manos y texto, y deriva de fondo en clips largos. No hay datos de evaluación cuantitativa publicados en el repositorio.
- Sesgos de los datos de entrenamiento no documentados: la model card no describe la composición del dataset ni filtros de seguridad, por lo que no se puede evaluar el sesgo demográfico, cultural o de representación.
- No dispone de filtros de moderación declarados ni de sistema de marcas de agua o procedencia documentado; en despliegues públicos hay que añadir moderación propia.
- No apto para tareas de lenguaje, razonamiento, código o agentes: es exclusivamente un modelo generativo de vídeo.
- La documentación técnica es escasa: no hay información sobre tokens de entrenamiento, fases de alineación ni métricas, lo que dificulta estimar el rendimiento antes de desplegar.

## Enlaces

- Modelo en Hugging Face (esta re-subida): https://huggingface.co/kkss118/VACE-Wan2.1-1.3B-Preview
- Modelo original: https://huggingface.co/ali-vilab/VACE-Wan2.1-1.3B-Preview
- Paper: https://arxiv.org/abs/2503.07598
- Página del proyecto: https://ali-vilab.github.io/VACE-Page/
- Repositorio de código: https://github.com/ali-vilab/VACE
- Colección VACE en Hugging Face: https://huggingface.co/collections/ali-vilab/vace-67eca186ff3e3564726aff38
- Colección VACE en ModelScope: https://modelscope.cn/collections/VACE-8fa5fcfd386e43
- Modelo VACE-Wan2.1-1.3B-Preview en ModelScope: https://modelscope.cn/models/iic/VACE-Wan2.1-1.3B-Preview
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio Wan2.1: https://github.com/Wan-Video/Wan2.1
- Dataset de referencia: https://huggingface.co/datasets/ali-vilab/VACE-Benchmark
- Modelo VACE-LTX-Video-0.9: https://huggingface.co/ali-vilab/VACE-LTX-Video-0.9
