# Danimax79/LivePortrait

## Resumen

LivePortrait es un modelo de animación de retratos (image-to-video) desarrollado por Kuaishou Technology en colaboración con la Universidad de Ciencia y Tecnología de China y la Universidad de Fudan. Su objetivo es transferir los movimientos de un video conductor (pose de cabeza, expresiones faciales, mirada y movimiento de labios) a una imagen estática de un rostro, generando un video animado que preserva la identidad de la persona. El método se basa en mecanismos de *stitching* y *retargeting* que permiten un control fino sobre la animación, y se presenta en el artículo técnico arXiv:2407.03168.

Esta entrada en HuggingFace, publicada por el usuario Danimax79, contiene una conversión del modelo a formato ONNX (2,1 GB), lo que facilita su despliegue en entornos de inferencia con ONNX Runtime. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas. El modelo está etiquetado con el pipeline `image-to-video` y la librería `liveportrait`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paper describe un pipeline con detección de landmarks y deformación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX, posiblemente FP32 o FP16) |
| Idiomas soportados | no disponible (el modelo procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (número de capas, tipo de red, etc.). Según el paper y la documentación del repositorio oficial, LivePortrait utiliza un pipeline que combina detección de puntos faciales (mediante InsightFace, concretamente el modelo `2d106det.onnx` para 106 landmarks), un módulo de deformación basado en *implicit keypoints* y un mecanismo de *stitching* y *retargeting* para controlar la animación. El entrenamiento se realizó con datos de video de retratos, aunque no se especifican el número de tokens ni la composición exacta del dataset en la información disponible. No se menciona el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Animación de retratos a partir de una imagen estática y un video conductor, transfiriendo pose de cabeza, expresiones faciales, mirada y movimiento de labios.
- Edición de pose en la imagen fuente (soporte en la interfaz Gradio).
- Edición de video a video (v2v), permitiendo re-animar un video existente.
- Soporte para modelos de animales (versión separada publicada en agosto de 2024).
- Concatenación de audio y video, auto-cropping del video conductor y creación de plantillas para proteger la privacidad.
- Ejecución en macOS con Apple Silicon, además de Linux y Windows.

## Casos de uso

- Creación de avatares animados para redes sociales: a partir de una foto de perfil, se puede generar un video con el rostro hablando o gesticulando, usando un video de referencia como conductor.
- Doblaje de vídeos: se puede re-animar un vídeo existente para sincronizar los labios con un nuevo audio, útil en localización de contenidos.
- Animación de personajes ilustrados o artísticos: el modelo acepta imágenes de retratos no fotorrealistas, lo que permite dar vida a ilustraciones o personajes de cómic.
- Producción de contenido educativo: generar vídeos de presentadores a partir de una única foto, reduciendo costes de grabación.
- Pruebas de maquillaje o peinado virtual: animar una foto del usuario para ver cómo se vería con diferentes estilos en movimiento.
- Investigación en visión por computador: como base para estudios de transferencia de movimiento facial y generación de vídeo condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2407.03168) podría incluir métricas comparativas, pero no se han extraído en esta ficha.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada. El tamaño del repositorio es de 2,1 GB, lo que sugiere que los pesos ONNX podrían caber en GPUs con al menos 4 GB de VRAM, pero no se confirma.
- El modelo se puede ejecutar en CPU mediante ONNX Runtime, aunque la velocidad será menor.
- Se ha confirmado soporte para macOS con Apple Silicon (M1/M2/M3) según las notas de actualización del repositorio original.
- Para despliegue, se puede usar ONNX Runtime, o el código oficial de PyTorch disponible en el repositorio de GitHub. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de animación de retratos (como SadTalker, Wav2Lip o AnimateAnyone) en los datos proporcionados. Se recomienda consultar el paper original para una comparación técnica detallada.

## Limitaciones y advertencias

- No se documentan limitaciones específicas en la model card. Sin embargo, al ser un modelo de animación facial, es probable que la calidad dependa de la claridad de la imagen fuente y de la estabilidad del video conductor.
- Puede producir artefactos en casos de oclusiones, iluminación extrema o ángulos poco comunes, aunque no se ha confirmado.
- La licencia MIT permite uso comercial, pero se debe verificar que los pesos del modelo no incorporen datos con derechos de autor adicionales.
- El repositorio de HuggingFace es una conversión a ONNX de un tercero (Danimax79), no la versión oficial de Kuaishou. Se recomienda contrastar con el repositorio original para garantizar la integridad de los pesos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Danimax79/LivePortrait
- Paper (arXiv): https://arxiv.org/pdf/2407.03168
- Página del proyecto: https://liveportrait.github.io
- Repositorio oficial en GitHub: https://github.com/KwaiVGI/LivePortrait
- Espacio de HuggingFace oficial: https://huggingface.co/spaces/KwaiVGI/liveportrait
- Repositorio de pesos oficiales: https://huggingface.co/KwaiVGI/LivePortrait
