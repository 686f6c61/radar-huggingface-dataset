# HoopitAI/video-deepfake-detection-GenD_CLIP_L_14_FF

## Resumen

El modelo `video-deepfake-detection-GenD_CLIP_L_14_FF` es un detector de deepfakes en vídeo desarrollado por HoopitAI, basado en el framework GenD presentado en el paper WACV 2026 "Deepfake Detection that Generalizes Across Benchmarks". Utiliza como backbone visual el modelo CLIP ViT-L/14 de OpenAI, con un ajuste fino que solo actualiza los parámetros de normalización por capas (LayerNorm), lo que representa aproximadamente el 0,03 % del total de parámetros. El modelo está entrenado exclusivamente sobre el dataset FaceForensics++ (FF++) y está diseñado para clasificar si un recorte de cara alineado es real o falso.

La relevancia de este modelo radica en su enfoque de generalización entre benchmarks: al congelar el backbone y optimizar únicamente las capas de normalización junto con una cabeza de clasificación normalizada sobre una esfera hiperesférica, se evita el sobreajuste a artefactos específicos de manipulación. El entrenamiento emplea Sharpness-Aware Minimization (SAM) y label smoothing, lo que contribuye a encontrar mínimos planos que resisten cambios de dominio. Con 303,97 millones de parámetros y un tamaño de repositorio de 1,2 GB, es un modelo compacto y ligero para tareas de detección de manipulación facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (backbone congelado) + cabeza de clasificación LinearNorm |
| Parametros totales | 303.968.258 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiqueta del modelo, aunque es un modelo visual) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el framework GenD, que parte de un backbone CLIP ViT-L/14 preentrenado y lo adapta para la detección de deepfakes. La innovación principal es que solo se ajustan los parámetros de Layer Normalization del transformer, manteniendo el resto de pesos congelados. Esto reduce drásticamente el número de parámetros entrenables y evita el sobreajuste a artefactos específicos de un dataset. La salida del backbone se normaliza mediante L2-normalización para proyectar las características sobre una esfera hiperesférica, y una cabeza lineal (LinearNorm) realiza la clasificación binaria (real/falso).

El entrenamiento se realizó sobre FaceForensics++ (FF++) con 30 épocas, batch size de 96 y precisión bf16-mixed. Se utilizó el optimizador SAM-AdamW con rho=0,05 y modo adaptativo, junto con una función de pérdida compuesta por entropía cruzada con label smoothing (0,1), pérdida de uniformidad (0,5) y pérdida de alineación (0,1). Esta combinación busca suavizar el paisaje de pérdidas y mejorar la generalización a dominios no vistos. El learning rate fue de 0,0003.

## Capacidades

- Detección de deepfakes en vídeo a nivel de frame y de vídeo completo, clasificando recortes de caras alineadas como reales o falsas.
- Clasificación de imágenes individuales (frame-level) con salida de probabilidad para la clase "fake".
- Generalización entre benchmarks gracias al entrenamiento con SAM y la normalización hiperesférica, lo que reduce el sobreajuste a artefactos específicos de manipulación.
- Inferencia eficiente al requerir solo el ajuste de capas de normalización, lo que permite un modelo ligero y rápido.
- Soporte para integración en pipelines de visión por computador mediante la API de Hugging Face Transformers con `trust_remote_code=True`.
- Capacidad de procesamiento por lotes (batch) para análisis de vídeos completos, extrayendo frames y clasificando cada rostro detectado.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en sistemas de revisión automática para detectar vídeos manipulados antes de su publicación, reduciendo la propagación de desinformación.
- Verificación forense en medios de comunicación: agencias de noticias y verificadores de hechos pueden usar el modelo para analizar vídeos sospechosos y determinar su autenticidad antes de difundirlos.
- Auditoría de identidad en procesos de verificación remota: en sistemas de onboarding digital o videollamadas de verificación, el modelo puede ayudar a detectar suplantaciones mediante deepfakes en tiempo real.
- Investigación académica en detección de manipulación facial: sirve como baseline o componente en estudios comparativos sobre generalización de detectores de deepfakes.
- Protección de marcas y reputación: empresas pueden monitorizar vídeos que circulan en internet y detectar si se han manipulado para dañar su imagen.
- Análisis de pruebas en procedimientos legales: el modelo puede asistir a peritos informáticos en la evaluación de vídeos presentados como evidencia, proporcionando una probabilidad de manipulación.

## Benchmarks y rendimiento

El autor proporciona los siguientes resultados en el dataset FaceForensics++ (FF++):

| Metrica | Valor |
|---|---|
| Video AUROC | 94,26 % |
| Video mAP | 93,30 % |
| Video Accuracy | 87,56 % |
| Video EER | 12,44 % |
| Frame AUROC | 90,57 % |
| Frame mAP | 89,14 % |
| Frame Accuracy | 82,91 % |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 303,97 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 1,2 GB y en bf16 unos 600 MB. Se estima que la inferencia puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior.
- Para procesamiento por lotes o vídeos largos, se recomienda una GPU con 8 GB o más, como una RTX 3060 o RTX 4060.
- El modelo es compatible con el ecosistema Hugging Face Transformers, por lo que puede desplegarse con librerías como PyTorch, y también es posible exportarlo a formatos optimizados como ONNX o TensorRT para inferencia en producción.
- No se dispone de datos oficiales sobre latencia o throughput. Dado el tamaño del modelo, se espera una inferencia rápida en hardware moderno, pero no se pueden dar cifras concretas sin pruebas.

## Comparativa con modelos similares

No se dispone de información comparativa con otros detectores de deepfakes en la documentación proporcionada. El modelo original de GenD (yermandy/GenD_CLIP_L_14) es el mismo checkpoint, por lo que no hay una alternativa directa con datos públicos de rendimiento. Otros enfoques como FaceForensics++ baselines o modelos basados en CLIP (p. ej., UniFD) existen en la literatura, pero no se han incluido métricas comparables en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en FaceForensics++, por lo que su rendimiento puede degradarse en vídeos con compresiones, resoluciones o técnicas de manipulación no representadas en ese dataset.
- La detección se realiza sobre recortes de caras alineadas; si el pipeline de detección facial previo falla, la precisión del modelo se ve afectada.
- No se han documentado sesgos específicos, pero al estar entrenado en un dataset predominantemente occidental, puede tener un rendimiento inferior en rostros de otras etnias o condiciones de iluminación.
- El modelo no es un detector de todo tipo de contenido generado por IA, solo de manipulación facial en vídeo.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de cumplir con las normativas de privacidad y uso ético en aplicaciones de verificación de identidad.
- No se proporcionan garantías de precisión en entornos de producción; se recomienda validar el modelo en el dominio específico antes de su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoopitAI/video-deepfake-detection-GenD_CLIP_L_14_FF
- Repositorio oficial de GenD (GitHub): https://github.com/yermandy/GenD
- Modelo original de GenD en Hugging Face: https://huggingface.co/yermandy/GenD_CLIP_L_14
- Paper en arXiv: https://arxiv.org/html/2508.06248v4
