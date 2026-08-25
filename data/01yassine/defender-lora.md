# 01Yassine/defender-lora

## Resumen

`01Yassine/defender-lora` es un detector de deepfakes en imágenes basado en un backbone DINOv3 ViT-H+ de Meta, al que se le ha aplicado una adaptación con LoRA sobre las proyecciones de atención. El modelo ha sido desarrollado por Yassine El Kheir, en el marco de un proyecto conjunto DFKI / GAI, y se distribuye bajo licencia MIT. Su propósito es clasificar imágenes reales frente a imágenes manipuladas o generadas, devolviendo una probabilidad de que la imagen sea falsa.

El modelo se presenta como un paquete de inferencia autocontenido que incluye dos checkpoints (75k y 115k pasos), un script CLI y una clase Python para integración directa. La entrada se preprocesa con un letterbox que preserva la relación de aspecto hasta 512×512 píxeles, y la salida es un valor `prob_fake` en [0, 1], con umbral de decisión en 0,5. Es relevante ahora porque la detección de deepfakes es un problema creciente en moderación de contenido, verificación de identidad y análisis forense digital.

El repositorio pesa 6.8 GB e incluye los pesos de LoRA en formato PyTorch (`.pth`), junto con el código de inferencia. No se especifica el número total de parámetros del modelo completo, aunque el backbone DINOv3 ViT-H+ es de gran tamaño (aproximadamente 1.2 mil millones de parámetros para la variante H+).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-H+ con LoRA en q/k/v/o_proj (r=16, alpha=32) + MMFuser + head lineal |
| Parametros totales | no disponible (backbone ViT-H+ estimado en ~1.2B, sin verificar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada 512×512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | MIT (requiere aceptar licencia de DINOv3 para el backbone) |
| Formato de pesos | PyTorch state dict (`.pth`) |

## Arquitectura y entrenamiento

El modelo combina un backbone DINOv3 ViT-H+ preentrenado en LVD-1689M (un dataset de imágenes masivo) con una adaptación LoRA en las proyecciones de atención (`q`, `k`, `v`, `o_proj`). La LoRA tiene rango `r=16` y escala `alpha=32`, lo que permite ajustar el modelo sin modificar los pesos originales. Sobre las características del backbone se aplica un módulo `MMFuser` que fusiona representaciones de varias capas del transformer, y finalmente una cabeza de clasificación que combina el token CLS normalizado con L2 y la media de los tokens de parche, seguida de una capa lineal y softmax binario.

El entrenamiento se realizó con augmentación de datos (configuración `HUGE_LORA_aug`) a resolución 512×512 píxeles, con dos checkpoints guardados a los 75.000 y 115.000 pasos. No se han publicado detalles sobre el dataset de entrenamiento, el número de imágenes ni si se usaron técnicas de hard negative mining o datos sintéticos. El proyecto es un trabajo conjunto entre DFKI y GAI, pero no se ha publicado un paper técnico asociado.

## Capacidades

- Clasificación binaria de imágenes como reales o falsas, con salida probabilística en el rango [0, 1].
- Preprocesamiento robusto mediante letterbox que preserva la relación de aspecto de la imagen de entrada.
- Detección de manipulaciones faciales y generación de imágenes sintéticas (deepfakes) gracias al entrenamiento específico sobre este tipo de datos.
- Integración sencilla en pipelines existentes mediante CLI (`infer.py`) o API Python (`Model.predict`).
- Soporte de inferencia en CPU y GPU (CUDA), con selección de dispositivo explícita.

## Casos de uso

- **Moderación de contenido en plataformas sociales**: el modelo puede integrarse en un pipeline de moderación para detectar imágenes manipuladas antes de su publicación. Su salida binaria y el umbral ajustable permiten configurar la sensibilidad según las políticas de la plataforma.
- **Verificación de identidad en onboarding digital**: en procesos de alta de usuarios, puede usarse para comprobar que las imágenes de documentos o selfies no han sido alteradas o generadas sintéticamente. La baja latencia de inferencia permite su uso en tiempo real.
- **Análisis forense de imágenes**: los investigadores pueden emplearlo como herramienta de primera línea para detectar indicios de manipulación en casos legales o periodísticos, combinándolo con otras técnicas de análisis de exif y consistencia de luz.
- **Auditoría de contenido publicitario**: las marcas pueden verificar que las imágenes de campañas no contienen elementos generados por IA no declarados, cumpliendo normativas de transparencia publicitaria.
- **Investigación académica en detección de deepfakes**: como modelo de referencia de código abierto con licencia MIT, puede servir como baseline en papers académicos para comparar métodos de detección más avanzados.
- **Protección de identidad en servicios financieros**: en onboarding remoto (conocimiento del cliente, KYC), el modelo puede alertar sobre documentos de identidad falsificados o selfies manipulados en el proceso de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, recall, AUC o comparaciones con otros detectores de deepfake. No es posible verificar el rendimiento real del modelo sin ejecutarlo sobre un dataset de evaluación estándar como FaceForensics++, DFDC o Celeb-DF.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Dado que el backbone DINOv3 ViT-H+ tiene alrededor de 1.2 mil millones de parámetros (estimación no confirmada), se recomienda al menos 16 GB de VRAM para inferencia en FP16 y 24 GB para FP32.
- **GPUs compatibles**: cualquier GPU NVIDIA con soporte CUDA, desde RTX 3080/3090/4090 hasta A100/H100 en entornos de servidor. En CPU es posible, pero la latencia será muy elevada para imágenes de 512×512.
- **Despliegue**: el modelo se distribuye como paquete Python con `torch`; no se proporcionan integraciones nativas con vLLM, llama.cpp u Ollama, por lo que el despliegue se limita a scripts propios. La inferencia por lotes no está implementada en el código proporcionado.
- **Latencia**: no disponible. Se espera una latencia de decenas de milisegundos en GPU de gama alta, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se han identificado modelos comparables con especificaciones públicas suficientes para una tabla comparativa rigurosa. Los modelos de detección de deepfakes más conocidos (como los basados en EfficientNet o Xception en FaceForensics++) no tienen una implementación estandarizada con LoRA y DINOv3, y no existen benchmarks públicos que permitan comparar este modelo con ellos. Se recomienda evaluar el modelo con un dataset de validación propio antes de su uso en producción.

## Limitaciones y advertencias

- **Sesgos**: no se ha publicado ningún estudio de sesgo del modelo. Los modelos de detección de deepfakes suelen tener tasas de error más altas en ciertos grupos étnicos o condiciones de iluminación, y no hay información que indique que este modelo haya mitigado ese problema.
- **Riesgo de falsos positivos/negativos**: el umbral de 0.5 es fijo y no se ha documentado la curva ROC ni los errores por categoría. En entornos de alta seguridad, un falso negativo (no detectar un deepfake) puede ser crítico.
- **Dependencia del backbone**: el modelo requiere aceptar la licencia de DINOv3 y estar autenticado con un token de Hugging Face para descargar el backbone. Esto añade una dependencia externa que debe gestionarse en producción.
- **Formato de pesos**: los pesos se guardan como state dict de PyTorch, lo que requiere que la arquitectura del modelo se inicialice exactamente con el código proporcionado. No se incluyen pesos en formato ONNX o TensorFlow, lo que limita el despliegue en entornos que no usan PyTorch.
- **Licencia**: aunque el modelo es MIT, el backbone DINOv3 tiene su propia licencia que puede imponer restricciones adicionales (por ejemplo, uso no comercial en ciertos casos). Hay que revisar la licencia de DINOv3 antes de un despliegue comercial.
- **Sin datos de entrenamiento**: no se publica el dataset de entrenamiento ni su composición, lo que impide evaluar la generalización a dominios distintos de los vistos en el entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/01Yassine/defender-lora)
- [Perfil del autor 01Yassine en Hugging Face](https://huggingface.co/01Yassine/models)
- [Backbone DINOv3 ViT-H+ en Hugging Face](https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m)
