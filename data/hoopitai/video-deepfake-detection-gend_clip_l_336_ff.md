# HoopitAI/video-deepfake-detection-GenD_CLIP_L_336_FF

## Resumen

El modelo `video-deepfake-detection-GenD_CLIP_L_336_FF` es un detector de deepfakes en vídeo desarrollado por HoopitAI, basado en el framework GenD presentado en el artículo "Deepfake Detection that Generalizes Across Benchmarks" (WACV 2026). Utiliza como backbone visual el modelo CLIP ViT-L/14-336 de OpenAI, congelado salvo por los parámetros de normalización de capa (LayerNorm), que representan aproximadamente el 0,03 % del total de parámetros. El modelo se entrena sobre el dataset FaceForensics++ (FF++) y emplea optimización con Sharpness-Aware Minimization (SAM) y pérdidas de uniformidad y alineación para aprender un manifold hiperesférico robusto frente a dominios no vistos.

Con 304,3 millones de parámetros y un tamaño de repositorio de 1,2 GB, el modelo está diseñado para clasificar recortes de caras alineadas como reales o falsas, y se integra fácilmente mediante el pipeline de `image-classification` de Hugging Face. Su relevancia radica en que aborda el problema de la generalización entre benchmarks, un punto débil habitual en los detectores de deepfakes que tienden a sobreajustarse a artefactos específicos de manipulación. Los resultados publicados muestran un AUROC de vídeo del 93,18 % y una precisión de vídeo del 85,59 % en FF++, lo que lo sitúa como una opción competitiva para tareas de verificación forense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14-336 (backbone congelado) + head LinearNorm, fine-tuning solo de LayerNorm |
| Parametros totales | 304.295.938 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision, etiquetas en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el framework GenD, que combina un backbone visual CLIP ViT-L/14-336 preentrenado con una cabeza de clasificación lineal normalizada (`LinearNorm`). La innovación principal consiste en mantener congelados todos los parámetros del transformer visual y actualizar únicamente los parámetros de Layer Normalization (escala y sesgo), lo que reduce drásticamente el número de parámetros entrenables y evita el sobreajuste a artefactos específicos de manipulación. Además, se aplica L2-normalización a los vectores de características para proyectarlos sobre una hipersfera, y se utilizan pérdidas de uniformidad y alineación para mejorar la separación entre clases.

El entrenamiento se realizó sobre el dataset FaceForensics++ (FF++) durante 30 épocas, con un tamaño de lote de 32, precisión mixta bf16 y una tasa de aprendizaje de 0,0003. El optimizador empleado es SAM-AdamW con un radio de perturbación ρ=0,05 y modo adaptativo, lo que suaviza el paisaje de pérdidas y favorece la búsqueda de mínimos planos que generalizan mejor a dominios fuera de distribución. La función de pérdida combina entropía cruzada con label smoothing (0,1), uniformidad (0,5) y alineación (0,1). Esta metodología está descrita en el artículo de WACV 2026 y su implementación oficial está disponible en el repositorio GitHub de GenD.

## Capacidades

- Detección de deepfakes en vídeo: clasifica recortes de caras alineadas como reales o falsas, con salida binaria (clase 0: real, clase 1: falso).
- Generalización entre benchmarks: diseñado para resistir cambios de dominio, evitando el sobreajuste a artefactos específicos de un dataset de entrenamiento.
- Integración con Hugging Face: se carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True`, lo que facilita su uso en pipelines existentes.
- Preprocesamiento integrado: el modelo incluye un extractor de características (`feature_extractor`) que normaliza las imágenes de entrada.
- Entrenamiento eficiente: al congelar el backbone y ajustar solo LayerNorm, el coste de fine-tuning es muy bajo, lo que permite adaptarlo a nuevos dominios con pocos recursos.
- Soporte de precisión mixta: entrenado con bf16, compatible con GPUs modernas.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en sistemas de revisión automática para detectar vídeos manipulados antes de su publicación, reduciendo la propagación de desinformación. Su capacidad de generalización ayuda a detectar manipulaciones no vistas durante el entrenamiento.
- Verificación de identidad en procesos de onboarding: en servicios financieros o de administración pública, se puede usar para validar que los vídeos de identificación no han sido alterados, comparando la probabilidad de falsedad con un umbral de seguridad.
- Análisis forense en investigaciones judiciales: los peritos pueden emplear el modelo como herramienta de apoyo para evaluar la autenticidad de pruebas en vídeo, combinando su salida con otros indicios técnicos.
- Monitorización de campañas electorales: para detectar vídeos falsos de candidatos o declaraciones manipuladas, ayudando a preservar la integridad del proceso democrático.
- Protección de la imagen pública de personas: celebridades, políticos o ejecutivos pueden usar el modelo para identificar y denunciar contenidos deepfake que los suplanten.
- Investigación académica en detección de manipulación: el modelo sirve como baseline o componente en estudios comparativos sobre generalización de detectores de deepfakes, gracias a su licencia MIT y su arquitectura documentada.

## Benchmarks y rendimiento

Los resultados publicados en la model card del autor se presentan a continuación. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Metrica | Valor |
|---|---|
| Video AUROC | 93,18 % |
| Video mAP | 92,14 % |
| Video Accuracy | 85,59 % |
| Video EER | 14,41 % |
| Frame AUROC | 89,23 % |
| Frame mAP | 87,18 % |
| Frame Accuracy | 81,85 % |

Estos valores corresponden al conjunto de evaluación de FaceForensics++ (FF++). No se han publicado resultados en otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan datos oficiales. Con 304 millones de parámetros y pesos en fp32, el modelo ocupa aproximadamente 1,2 GB; en bf16 o fp16 ocuparía unos 0,6 GB, y con cuantización a 8 bits podría reducirse a unos 0,3 GB. Esto permite su ejecución en GPUs consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte para bf16 (por ejemplo, RTX 30xx o superior, A100, H100) es adecuada. Para inferencia en CPU, el modelo también es viable, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en tarjetas como RTX 3060, RTX 4060 o superiores, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de Hugging Face con código personalizado, se puede servir con la librería `transformers` en Python, o exportar a ONNX para usar con TensorRT u otros motores. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo y la entrada de imagen única, se espera una latencia de decenas de milisegundos en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la misma categoría (detección de deepfakes en vídeo con backbone CLIP). El repositorio de GenD menciona otros modelos como `yermandy/GenD_CLIP_L_14`, pero no se han encontrado sus especificaciones detalladas en la búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con FaceForensics++, que contiene manipulaciones generadas con técnicas específicas (por ejemplo, DeepFakes, Face2Face, FaceSwap, NeuralTextures). Puede tener un rendimiento inferior en manipulaciones generadas con métodos más recientes o con condiciones de captura muy diferentes.
- Riesgo de alucinación: al ser un clasificador binario, no genera texto, por lo que el concepto de alucinación no aplica directamente. Sin embargo, puede producir falsos positivos o negativos, especialmente en imágenes de baja calidad o con oclusiones.
- Limitaciones de contexto: el modelo espera recortes de caras alineadas; si se le presentan imágenes completas o con múltiples caras, el rendimiento puede degradarse. No procesa secuencias de vídeo completas, sino fotogramas individuales.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir con las leyes de protección de datos y privacidad al aplicar el modelo en entornos reales.
- Caveat para producción: el modelo no incluye un mecanismo de calibración de umbrales; el usuario debe definir el umbral de probabilidad para la clasificación según su caso de uso. Además, al depender de código personalizado (`trust_remote_code=True`), se recomienda auditar el código antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoopitAI/video-deepfake-detection-GenD_CLIP_L_336_FF
- Repositorio oficial de GenD (GitHub): https://github.com/yermandy/GenD
- Artículo en arXiv: https://arxiv.org/html/2508.06248v4 (también disponible la versión v3: https://arxiv.org/html/2508.06248v3)
- Modelo relacionado de GenD en Hugging Face: https://huggingface.co/yermandy/GenD_CLIP_L_14
