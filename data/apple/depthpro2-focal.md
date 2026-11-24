# apple/DepthPro2-focal

## Resumen

DepthPro2-focal es un estimador de longitud focal (focal length) y campo de visión (field-of-view) desarrollado por Apple, publicado bajo el paraguas del proyecto Depth Pro 2, un sistema de estimación de profundidad monocular métrica, nítida y temporalmente consistente. Este checkpoint concreto no estima profundidad por sí mismo: es el submódulo `FOVEstimator` que predice la longitud focal en píxeles de una fotografía o de los fotogramas de un vídeo, un dato necesario para convertir la profundidad relativa en profundidad métrica cuando los metadatos EXIF de la cámara no están disponibles.

El modelo es muy compacto: 23.455.450 parámetros (unos 23,5 millones) y un repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros de visión. Se distribuye en formato safetensors y se integra con la librería `depth-pro-2` del propio repositorio de Apple, cargándose como componente del modelo principal DepthPro2-H o de forma independiente.

Su relevancia radica en que resuelve un problema práctico de calibración de cámara "en el salvaje": inferir la focal a partir de una sola imagen sin conocer los intrínsecos. La licencia es de investigación no comercial (Apple Machine Learning Research Model license), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (submódulo FOVEstimator del sistema Depth Pro 2; arquitectura concreta no detallada en la información) |
| Parametros totales | 23.455.450 |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible (modelo de visión; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; soporte bfloat16 en la carga de referencia) |
| Idiomas soportados | no disponible (modelo de visión, independiente de idioma) |
| Licencia | apple-amlr (Apple Machine Learning Research Model license; solo investigación, no comercial) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del estimador de focal más allá de que se integra en el sistema Depth Pro 2 como un componente `FOVEstimator` que opera sobre tensores de imagen normalizados (`to_normalized_tensor`) y devuelve la longitud focal en píxeles (`focal_length_px`). Acepta tanto imágenes individuales como secuencias de fotogramas con forma `(T, 3, H, W)`, lo que indica que puede procesar vídeo de forma temporal. El modelo principal Depth Pro 2 se describe en el informe técnico arXiv:2611.26603 como un sistema de profundidad monocular métrica "nítida y temporalmente consistente".

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO (poco probables en un modelo de visión de este tipo). Tampoco se detallan innovaciones técnicas concretas del estimador de focal. Todo ello debe considerarse "no disponible".

## Capacidades

- Estimación de longitud focal en píxeles a partir de una imagen RGB individual.
- Estimación de campo de visión (field-of-view) derivada de la focal.
- Procesamiento de secuencias de vídeo: acepta tensores `(T, 3, H, W)` y devuelve una focal por fotograma.
- Calibración de cámara sin metadatos EXIF.
- Integración como submódulo del modelo de profundidad DepthPro2-H para obtener profundidad métrica.
- Uso independiente mediante la clase `FOVEstimator`.
- Soporte de precisión bfloat16 y ejecución en GPU (CUDA) según los ejemplos de la model card.
- No dispone de generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Calibración automática de cámaras en pipelines de fotogrametría: cuando las imágenes no incluyen EXIF, el modelo infiere la focal para reconstruir intrínsecos y alimentar el sistema de profundidad métrica.
- Estimación de profundidad métrica en fotografía: combinado con DepthPro2-H, permite obtener profundidad en unidades métricas reales a partir de una sola foto sin datos de calibración.
- Procesamiento de vídeo monoculo: al aceptar secuencias `(T, 3, H, W)`, permite estimar la focal por fotograma para estabilizar la escala métrica en vídeos de drones o cámaras de acción.
- Reconstrucción 3D y SLAM: la focal estimada sirve como inicialización de intrínsecos en pipelines de estructura-por-movimiento o SLAM monocular.
- Preprocesado en datasets de visión: normalización de la escala de imágenes de origen diverso antes de entrenar o evaluar modelos de profundidad.
- Realidad aumentada y efectos visuales: estimación de la focal para alinear objetos virtuales con la perspectiva real de una captura.
- Investigación académica en visión por computador: al ser un modelo ligero (23,5 M de parámetros) y de licencia de investigación, es adecuado para experimentos reproducibles en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 23,5 M de parámetros en bfloat16 el peso ocupa aproximadamente 47 MB, por lo que la huella de memoria es mínima (inferior a 1 GB incluyendo activaciones de imagen).
- GPU recomendadas: cualquier GPU CUDA moderna; los ejemplos usan `cuda` y `torch.bfloat16`. Funciona en RTX 4090, A100, H100 y GPUs de gama media.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, e incluso GPUs integradas con suficiente memoria para tensores de imagen.
- Opciones de despliegue: la vía oficial es la librería `depth-pro-2` instalada desde el repositorio de GitHub de Apple, con carga de pesos vía `huggingface_hub` y `safetensors`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de focal ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia apple-amlr: uso exclusivamente para investigación científica no comercial y desarrollo académico; no apta para producción comercial sin licencia adicional.
- Modelo especializado: solo estima focal/campo de visión; no genera profundidad por sí mismo ni texto, y no sustituye al modelo principal DepthPro2-H.
- Dependencia de la librería `depth-pro-2` y de la API interna (`FOVEstimator`, `to_normalized_tensor`), lo que puede implicar fragilidad ante cambios de versión.
- No se documentan sesgos, tasas de error ni comportamiento en dominios fuera de distribución (p. ej. cámaras con distorsión fuerte, ojo de pez, imágenes sintéticas).
- Riesgo de estimación errónea de focal en imágenes sin estructura geométrica suficiente o con recortes agresivos.
- Sin información sobre idiomas ni sesgos culturales (no aplica, al ser un modelo visual).
- Alucinación no aplica en el sentido textual, pero sí existe riesgo de predicciones de focal plausibles pero incorrectas sin señal de confianza documentada.
- Verificar siempre la compatibilidad de la versión de pesos con la versión de la librería antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/apple/DepthPro2-focal
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-depth-pro-2
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26603
- Página del proyecto: https://apple-aiml-research.github.io/ml-depth-pro-2/
- Modelos de todos los tamaños: https://huggingface.co/apple/DepthPro2
- Licencia del modelo: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/main/LICENSE_MODEL
