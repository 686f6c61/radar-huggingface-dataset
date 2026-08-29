# ashwmurt/depth_pro

## Resumen

DepthPro es un modelo de estimación de profundidad monocular métrica desarrollado por Apple, presentado en el artículo *Depth Pro: Sharp Monocular Metric Depth in Less Than a Second* (arXiv:2410.02073). Se trata de un modelo fundacional que genera mapas de profundidad de alta resolución (hasta 2,25 megapíxeles) a partir de una única imagen RGB de entrada, sin necesidad de metadatos como la intrinsics de la cámara. Su arquitectura combina un Vision Transformer multi-escala basado en los encoders de DINOv2 con una fusión de tipo DPT, y además predice el campo de visión horizontal de la imagen, que se convierte en distancia focal para calibrar la profundidad métrica absoluta.

El modelo cuenta con aproximadamente 952 millones de parámetros y opera a una resolución nativa de 1536×1536 píxeles. Es notablemente rápido: según el paper, genera un mapa de profundidad de 2,25 megapíxeles en 0,3 segundos en hardware adecuado. Esta receta concreta (`ashwmurt/depth_pro`) es un wrapper para Qualcomm AI Hub, lo que permite compilar, evaluar y desplegar el modelo en dispositivos Snapdragon (teléfonos Android y otros hardware de Qualcomm) mediante el CLI `qai-hub-models`. Su relevancia radica en combinar precisión métrica, nitidez en bordes y velocidad, lo que lo hace apto para aplicaciones en tiempo real en dispositivos móviles y edge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer multi-escala con fusión DPT, basado en encoders DINOv2 |
| Parametros totales | ~952 millones (según la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no especificado en la información; la receta permite exportar a TFLite, ONNX y Qualcomm AI Engine Direct |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | other (licencia original de Apple, consultar el archivo LICENSE del repositorio original) |
| Formato de pesos | PyTorch (safetensors previsiblemente, no confirmado en la documentación) |

## Arquitectura y entrenamiento

DepthPro emplea una arquitectura de Vision Transformer (ViT) multi-escala. Utiliza los encoders de DINOv2 como backbone, combinando múltiples escalas de características mediante una fusión inspirada en DPT (Dense Prediction Transformer). Esta fusión permite obtener mapas de profundidad con detalles de alta frecuencia y bordes nítidos. Además del mapa de profundidad, el modelo predice un campo de visión horizontal por imagen, que se convierte en distancia focal en píxeles mediante una calibración posterior. Esta predicción es clave para que la profundidad sea métrica (con escala absoluta) sin depender de intrinsics de cámara.

El entrenamiento se realizó con un enfoque de zero-shot: el modelo no necesita ajuste específico por dominio ni metadatos de cámara en inferencia. No se han proporcionado detalles sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que es un modelo de visión y no de lenguaje. La innovación principal reside en la combinación de una arquitectura eficiente (ViT multi-escala) con una velocidad de inferencia muy alta (0,3 segundos para 2,25 megapíxeles), lo que lo hace viable para despliegue en tiempo real.

## Capacidades

- Estimación de profundidad monocular métrica: genera mapas de profundidad con escala absoluta (en metros o unidades métricas calibradas) a partir de una única imagen RGB.
- Alta resolución y nitidez: produce mapas de profundidad de hasta 2,25 megapíxeles con bordes definidos y detalles finos.
- Predicción de campo de visión horizontal: permite calcular la distancia focal en píxeles sin conocer las intrinsics de la cámara.
- Zero-shot: funciona en imágenes de cualquier dominio sin ajuste específico.
- Compatibilidad con despliegue en dispositivo: la receta de Qualcomm AI Hub permite compilar el modelo para ejecutarse en hardware Snapdragon (TFLite, ONNX, Qualcomm AI Engine Direct).
- Integración con PyTorch: se puede usar directamente con la implementación original de Apple o con la integración de Hugging Face Transformers.

## Casos de uso

- Realidad aumentada en móviles: DepthPro puede generar mapas de profundidad en tiempo real para oclusión correcta de objetos virtuales en entornos reales, aprovechando su velocidad y precisión métrica en dispositivos Snapdragon.
- Fotografía computacional: mejora de retratos con desenfoque de fondo (bokeh) preciso, separando sujeto y fondo mediante el mapa de profundidad.
- Navegación autónoma y robótica: estimación de distancia a obstáculos en vehículos autónomos o robots móviles, donde la profundidad métrica absoluta es crítica para la planificación de trayectorias.
- Inspección industrial y medición: medición de dimensiones de objetos en imágenes capturadas con cámaras estándar, sin necesidad de calibración previa, útil en control de calidad o logística.
- Análisis de escenas en agricultura: estimación de altura de cultivos o distancia entre plantas para gestión de riego o cosecha automatizada.
- Aplicaciones de asistencia para personas con discapacidad visual: generación de información de profundidad en tiempo real para ayudar en la navegación o evitar obstáculos.
- Creación de contenido y efectos visuales: generación de mapas de profundidad para composición de vídeo o imágenes, permitiendo efectos de parallax o reiluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible (model card ni resultados de búsqueda). El paper original (arXiv:2410.02073) reporta métricas de calidad de profundidad (AbsRel, δ1, etc.) y velocidad, pero no se incluyen cifras concretas en los materiales proporcionados. Se recomienda consultar el artículo para una comparación cuantitativa con otros métodos.

## Requisitos de hardware

- Inferencia en GPU: al ser un modelo de ~952M parámetros, requiere al menos 8-12 GB de VRAM para ejecutarse en FP32 (estimación aproximada). Con cuantización a INT8 podría reducirse a unos 4-6 GB, pero no se han publicado requisitos oficiales.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o superiores para una ejecución fluida en PyTorch. No se han probado en GPUs de menor capacidad.
- Dispositivos móviles: la receta de Qualcomm AI Hub está diseñada para ejecutarse en Snapdragon (por ejemplo, Snapdragon 8 Gen 2 o posteriores) mediante TFLite o Qualcomm AI Engine Direct. No se especifica la memoria RAM requerida, pero es viable en teléfonos de gama alta.
- Opciones de despliegue: PyTorch (local), Hugging Face Transformers, ONNX Runtime, TFLite, Qualcomm AI Hub Workbench (para dispositivos reales).
- Latencia: según el paper, 0,3 segundos para generar un mapa de 2,25 megapíxeles en hardware de referencia, aunque el rendimiento en dispositivos móviles puede variar.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | Precisión métrica | Velocidad | Licencia |
|---|---|---|---|---|---|
| DepthPro (Apple) | ~952M | 1536×1536 | Sí (escala absoluta) | 0,3 s (2,25 MP) | other (investigación) |
| MiDaS (Intel) | ~100M-300M | variable (hasta 1024) | No (profundidad relativa) | rápido | MIT |
| DPT (Intel) | ~350M | 384×384 (o mayor) | No (relativa) | más lento que MiDaS | MIT |
| ZoeDepth | ~350M | 384×384 | Sí (métrica con calibración) | medio | MIT |

DepthPro se distingue por ofrecer profundidad métrica absoluta sin intrinsics, con alta resolución y velocidad superior a la mayoría de alternativas. Sin embargo, su licencia "other" puede limitar su uso comercial, mientras que MiDaS, DPT y ZoeDepth son de código abierto con licencia MIT.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia "other" (probablemente una licencia de investigación de Apple) puede impedir su uso en productos comerciales. Es imprescindible revisar el archivo LICENSE del repositorio original antes de cualquier implementación.
- Dependencia de la resolución de entrada: el modelo está optimizado para 1536×1536; usar resoluciones inferiores puede degradar la calidad de la profundidad.
- Sin soporte para vídeo nativo: aunque es rápido, no se ha validado su uso en flujos de vídeo continuo; la inferencia por fotograma puede requerir optimizaciones adicionales.
- Posibles errores en condiciones extremas: imágenes con poca textura, superficies reflectantes o condiciones de iluminación adversas pueden producir mapas de profundidad imprecisos.
- Información incompleta: no se han publicado detalles sobre el dataset de entrenamiento, sesgos poblacionales o geográficos, ni sobre el comportamiento en dominios específicos (interiores, exteriores, etc.).
- Requisitos de hardware: para ejecutarse en GPU de consumo se necesita una tarjeta con suficiente VRAM (≥12 GB); no es un modelo ligero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashwmurt/depth_pro
- Repositorio original de Apple: https://github.com/apple/ml-depth-pro
- Paper en arXiv: https://arxiv.org/abs/2410.02073
- Blog de Apple Machine Learning: https://machinelearning.apple.com/research/depth-pro
- Documentación de Hugging Face Transformers para DepthPro: https://huggingface.co/docs/transformers/v4.53.3/en/model_doc/depth_pro
- Qualcomm AI Hub Models: https://github.com/quic/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
