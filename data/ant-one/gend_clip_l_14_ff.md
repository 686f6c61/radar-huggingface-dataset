# Ant-One/GenD_CLIP_L_14_FF

## Resumen

GenD_CLIP_L_14_FF es un modelo de detección de deepfakes en vídeo desarrollado por Ant-One, basado en el framework GenD presentado en el artículo WACV 2026. Utiliza el codificador visual CLIP ViT-L/14 de OpenAI como backbone congelado y ajusta únicamente los parámetros de Layer Normalization (aproximadamente el 0,03% del total), lo que evita el sobreajuste a artefactos específicos de manipulación y mejora la generalización a dominios no vistos. El modelo se entrena sobre el dataset FaceForensics++ (FF++) con una combinación de pérdidas de entropía cruzada con label smoothing, uniformidad y alineación métrica, y optimización mediante Sharpness-Aware Minimization (SAM).

Con 303,97 millones de parámetros en total, el modelo está diseñado para clasificar recortes de rostros alineados como reales o falsos, ofreciendo resultados de referencia en métricas de vídeo y fotograma. Su licencia MIT permite uso comercial sin restricciones, y su implementación con código personalizado en Hugging Face facilita su integración en pipelines de análisis forense y moderación de contenido. Es relevante ahora porque aborda la creciente amenaza de los vídeos manipulados, ofreciendo una solución eficiente que requiere solo un ajuste mínimo del backbone preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/14) de CLIP, con head lineal normalizado (LinearNorm) |
| Parametros totales | 303.968.258 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza el backbone visual de CLIP ViT-L/14, preentrenado sobre 400 millones de pares imagen-texto. En el proceso de fine-tuning, el backbone permanece congelado y solo se actualizan los parámetros de Layer Normalization (escalas y sesgos), que representan aproximadamente el 0,03% del total. Esta estrategia, denominada GenD, busca encontrar mínimos planos en la superficie de pérdida mediante SAM (Sharpness-Aware Minimization) con rho=0.05 y modo adaptativo, evitando el sobreajuste a artefactos específicos de cada técnica de manipulación.

La cabeza de clasificación es una capa lineal normalizada que proyecta los vectores de características L2-normalizados sobre una hipersfera, y se entrena con una pérdida combinada de entropía cruzada con label smoothing (0.1), uniformidad (0.5) y alineación (0.1). El entrenamiento se realizó durante 30 épocas con batch size 96, precisión mixta bf16 y learning rate 0.0003, sobre recortes de rostros del dataset FaceForensics++ (FF++). El modelo se evalúa tanto a nivel de fotograma como de vídeo, agregando las predicciones de los fotogramas para obtener una decisión final.

## Capacidades

- Detección de deepfakes en imágenes de rostros: clasifica un recorte de cara alineado como real (clase 0) o falso (clase 1).
- Análisis de vídeo: al procesar fotogramas individuales y agregar las probabilidades, puede detectar manipulaciones en secuencias de vídeo.
- Generalización a dominios no vistos: el ajuste solo de LayerNorm y la optimización SAM permiten mantener un buen rendimiento en datasets de manipulación distintos a FF++.
- Integración con Hugging Face Transformers: mediante `trust_remote_code=True` se puede cargar directamente con `AutoModel`.
- Uso de características CLIP: aprovecha la representación semántica del backbone CLIP, que ha demostrado robustez frente a variaciones de iluminación, pose y calidad de imagen.
- Salida probabilística: entrega una probabilidad de deepfake por imagen, útil para umbrales configurables en aplicaciones de producción.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de revisión automática para detectar vídeos manipulados antes de su publicación, reduciendo la difusión de desinformación. Su salida probabilística permite ajustar el umbral según la tolerancia al riesgo.
- Análisis forense en investigaciones judiciales: peritos y analistas pueden utilizar el modelo como herramienta de apoyo para evaluar la autenticidad de evidencias en vídeo, combinándolo con otras técnicas de verificación de integridad.
- Verificación de identidad en videollamadas: en sistemas de autenticación biométrica que usan vídeo en tiempo real, el modelo puede añadir una capa de detección de suplantación mediante deepfakes, ejecutándose sobre fotogramas extraídos de la transmisión.
- Auditoría de medios en agencias de noticias: los verificadores de hechos pueden analizar vídeos sospechosos recibidos a través de canales no oficiales, obteniendo una probabilidad de manipulación que oriente la investigación manual.
- Investigación académica en detección de manipulaciones: el modelo sirve como baseline de alta calidad para estudios comparativos de nuevos métodos, dado su enfoque de ajuste mínimo y su rendimiento publicado en FF++.
- Protección de marcas y reputación: empresas pueden monitorizar contenido en línea que utilice sus logos o la imagen de sus directivos, identificando vídeos falsos que podrían dañar su imagen pública.

## Benchmarks y rendimiento

Según la model card del autor, los resultados obtenidos en FaceForensics++ (FF++) son los siguientes:

| Metrica | Valor |
|---|---|
| Video AUROC | 94.26% |
| Video mAP | 93.30% |
| Video Accuracy | 87.56% |
| Video EER | 12.44% |
| Frame AUROC | 90.57% |
| Frame mAP | 89.14% |
| Frame Accuracy | 82.91% |

No se proporcionan comparaciones con otros modelos en la informacion disponible. El rendimiento se reporta sobre el dataset de entrenamiento, por lo que las cifras de generalizacion a otros datasets no estan publicadas aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 303M parametros, lo que en precision bf16 ocupa aproximadamente 600 MB solo de pesos. Con el procesamiento de imagen y el overhead de la implementacion, se recomienda al menos 2 GB de VRAM para inferencia en lotes pequenos.
- GPU recomendadas: cualquier GPU con soporte para CUDA y al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.). Para procesamiento de video con multiples fotogramas simultaneos, se sugiere una GPU con 8 GB o mas.
- Cabe en GPUs de consumo: si, el modelo es ligero y puede ejecutarse en tarjetas de gama media como RTX 3060 sin problemas.
- Opciones de despliegue: al usar Hugging Face Transformers con `trust_remote_code`, se puede integrar en frameworks como PyTorch. No se mencionan formatos optimizados (ONNX, TensorRT, GGUF) en la informacion disponible.
- Latencia y throughput estimados: no hay datos publicados. En una GPU moderna (p. ej., RTX 3090), la inferencia sobre un solo recorte de cara deberia estar en el orden de decenas de milisegundos, pero esto depende de la implementacion y el tamaño de lote.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de deteccion de deepfakes en la documentacion proporcionada. El unico modelo comparable identificado es `yermandy/GenD_CLIP_L_14` (el modelo original del framework GenD), que utiliza la misma arquitectura y metodologia, pero entrenado posiblemente en diferentes condiciones. No se dispone de datos de rendimiento de ese modelo para establecer una comparacion cuantitativa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgo hacia el dataset de entrenamiento: al estar entrenado exclusivamente en FaceForensics++, el modelo puede tener un rendimiento degradado en videos de otras fuentes, con diferentes codificaciones, resoluciones o tecnicas de manipulacion mas recientes.
- Riesgo de falsos positivos y negativos: la probabilidad de deepfake no es una certeza absoluta; se recomienda validar manualmente los casos limites y establecer umbrales conservadores en entornos de produccion.
- Dependencia de la calidad de los recortes de cara: el modelo espera recortes de rostros alineados; si la deteccion de caras falla o el recorte no esta bien centrado, la precision puede verse afectada.
- Limitaciones de idioma: la documentacion esta en ingles; no hay soporte explicito para otros idiomas en la interfaz del modelo, aunque esto no afecta a la funcionalidad de clasificacion de imagenes.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial, el modelo se basa en CLIP de OpenAI, que tiene su propia licencia; se debe verificar la compatibilidad de uso en aplicaciones comerciales.
- Falta de informacion sobre cuantizacion: no se especifican formatos de cuantizacion disponibles, por lo que el despliegue en entornos con recursos limitados puede requerir conversion manual y pruebas de precision.
- Fecha de creacion reciente: el modelo fue creado en agosto de 2026, lo que indica que es una publicacion muy nueva y podria no haber sido ampliamente evaluada por la comunidad.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Ant-One/GenD_CLIP_L_14_FF
- Repositorio oficial del framework GenD (GitHub): https://github.com/yermandy/GenD
- Repositorio de deteccion de deepfakes con CLIP (GitHub): https://github.com/yermandy/deepfake-detection
- Documentacion de variantes del modelo (DeepWiki): https://deepwiki.com/yermandy/GenD/7.3-available-model-variants
- Modelo base CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14
