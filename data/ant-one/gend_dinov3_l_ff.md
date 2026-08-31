# Ant-One/GenD_DINOv3_L_FF

## Resumen

GenD_DINOv3_L_FF es un modelo de detección de deepfakes en vídeo desarrollado por Ant-One, basado en el framework GenD y construido sobre el backbone visual DINOv3 de Meta (facebook/dinov3-vitl16-pretrain-lvd1689m). El modelo aborda el problema de la generalización entre datasets, un reto crítico en la detección de manipulaciones faciales, ya que los detectores convencionales tienden a sobreajustarse a artefactos específicos de un método de generación concreto. Para ello, congela el backbone y solo ajusta los parámetros de Layer Normalization (aproximadamente el 0,03 % del total), aplicando además optimización Sharpness-Aware Minimization (SAM) y pérdidas de uniformidad y alineación para forzar una representación hipersférica de las características.

El modelo se entrena exclusivamente sobre el dataset FaceForensics++ (FF++) con 30 épocas, usando un cabezal de clasificación lineal normalizado y precisión mixta bf16. Con 303 millones de parámetros en total, ofrece resultados notables en detección a nivel de vídeo, con un AUROC del 91,84 % y una precisión del 84,91 %. Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integración en productos de moderación de contenido o verificación de identidad. El modelo está disponible en HuggingFace con pesos en formato safetensors y requiere código personalizado para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16) con cabezal de clasificación lineal normalizado (LinearNorm) |
| Parametros totales | 303.131.650 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en bf16-mixed durante entrenamiento, safetensors) |
| Idiomas soportados | en (etiqueta de idioma de la model card; el modelo procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del framework GenD, que combina un backbone visual congelado (DINOv3 ViT-L/16 preentrenado en LVD-1689M) con un cabezal de clasificación lineal que normaliza las características sobre una hipersfera antes de la proyección final. La clave del enfoque es que solo se actualizan los parámetros de Layer Normalization (escala y sesgo) del backbone, lo que representa una fracción mínima del total (alrededor del 0,03 %). Esta estrategia evita el sobreajuste a artefactos específicos de manipulación y mejora la generalización entre datasets.

El entrenamiento se realizó sobre el dataset FaceForensics++ (FF++) durante 30 épocas, con un tamaño de lote de 96, una tasa de aprendizaje de 0,0003 y precisión mixta bf16. Se utilizó el optimizador SAM-AdamW con un radio de perturbación de 0,05 y modo adaptativo. La función de pérdida combina entropía cruzada con label smoothing (0,1), pérdida de uniformidad (0,5) y pérdida de alineación (0,1), lo que fuerza una distribución uniforme de las características en la hipersfera y mantiene la coherencia entre muestras de la misma clase.

## Capacidades

- Detección de deepfakes en imágenes faciales recortadas y alineadas (clasificación binaria: real o falso).
- Inferencia a nivel de frame y a nivel de vídeo (agregando predicciones de frames).
- Generalización entre distintos métodos de manipulación gracias al ajuste solo de LayerNorm y a la optimización SAM.
- Representación de características en una hipersfera mediante L2-normalización, lo que facilita la separación de clases.
- Compatible con el ecosistema HuggingFace Transformers mediante `trust_remote_code=True`.
- Procesamiento de imágenes de entrada con el preprocesador del modelo (`model.feature_extractor.preprocess`).

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de análisis de vídeo para detectar rostros manipulados en tiempo real o en lote, ayudando a reducir la propagación de desinformación visual.
- Verificación de identidad en procesos KYC: en entornos bancarios o de servicios financieros, el modelo puede validar si una imagen de documento o un selfie ha sido manipulado antes de aprobar una operación.
- Auditoría forense de evidencias digitales: equipos de investigación periodística o judicial pueden utilizar el modelo para analizar vídeos y determinar si han sido alterados, aportando una métrica objetiva de probabilidad de falsificación.
- Protección de marcas y reputación: empresas pueden monitorizar vídeos que circulen en redes sociales para detectar suplantaciones de directivos o celebridades asociadas a su marca.
- Desarrollo de herramientas de fact-checking: organizaciones dedicadas a la verificación de noticias pueden incorporar el modelo como capa de análisis visual en sus flujos de trabajo.
- Investigación académica en detección de manipulaciones faciales: el modelo sirve como punto de partida para experimentos de fine-tuning, comparación con otros detectores o estudio de la generalización entre datasets.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados sobre FaceForensics++ (FF++):

| Metrica | Valor |
|---|---|
| Video AUROC | 91,84 % |
| Video mAP | 89,88 % |
| Video Accuracy | 84,91 % |
| Video EER | 15,09 % |
| Frame AUROC | 86,93 % |
| Frame mAP | 83,73 % |
| Frame Accuracy | 80,40 % |

No se incluyen comparaciones con otros modelos en la informacion disponible, ni resultados en otros datasets de evaluacion como Celeb-DF o DFDC.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 303 millones de parametros. En precision fp32, ocupa aproximadamente 1,2 GB; en fp16 o bf16, unos 0,6 GB. La inferencia puede ejecutarse en GPUs con 4 GB de VRAM o mas, dependiendo del tamaño de lote y la resolucion de entrada.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una RTX 3060 (12 GB) hasta una A100 (40/80 GB) para procesamiento en lote de muchos frames. En CPU tambien es viable para inferencia puntual, aunque mas lenta.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y alta de consumo (RTX 3060, RTX 4070, etc.) con cuantizacion o sin ella.
- Opciones de despliegue: al ser un modelo de vision con codigo personalizado, se puede servir mediante HuggingFace Inference Endpoints, o integrar en aplicaciones Python con PyTorch y Transformers. No se menciona soporte para vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del hardware y del tamaño de lote; para un solo frame en una GPU moderna se espera una latencia de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros detectores de deepfakes (como Face X-Ray, RECCE o los modelos de la serie FTCN) en la informacion proporcionada. El modelo comparte categoria con otros detectores basados en DINOv3 o en vision transformers, pero no hay datos publicados que permitan una comparacion cuantitativa fiable. Se recomienda consultar la literatura reciente sobre deteccion de deepfakes para obtener referencias.

## Limitaciones y advertencias

- El modelo se entrena exclusivamente sobre FaceForensics++, que contiene manipulaciones generadas con metodos clasicos (DeepFakes, Face2Face, FaceSwap, NeuralTextures). Su rendimiento en deepfakes generados con tecnicas modernas (por ejemplo, GANs de alta calidad o difusion) puede degradarse, aunque el enfoque GenD busca mitigar este problema.
- La entrada esperada es un recorte facial alineado; el modelo no procesa escenas completas ni videos enteros directamente. Es necesario un detector de rostros previo en el pipeline.
- No se reportan evaluaciones sobre sesgos demograficos (genero, etnia, edad). Como ocurre con la mayoria de detectores de deepfakes, el rendimiento puede variar segun las caracteristicas de la poblacion.
- Existe riesgo de falsos positivos y negativos en condiciones de baja calidad de imagen, compresion fuerte o iluminacion adversa.
- El codigo de inferencia requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario descargado del Hub. Se recomienda revisar el codigo antes de usarlo en entornos de produccion.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base DINOv3 esta sujeto a su propia licencia (Meta), que puede imponer condiciones adicionales. Conviene verificar los terminos de DINOv3 antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ant-One/GenD_DINOv3_L_FF
- Repositorio de DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- Pagina de DINOv3 en Meta AI: https://ai.meta.com/research/dinov3/
- Modelo relacionado (yermandy/GenD_DINOv3_L): https://huggingface.co/yermandy/GenD_DINOv3_L
