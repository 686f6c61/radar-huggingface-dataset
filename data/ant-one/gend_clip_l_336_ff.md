# Ant-One/GenD_CLIP_L_336_FF

## Resumen

El modelo **GenD_CLIP_L_336_FF** es un clasificador de imágenes diseñado para la detección de deepfakes faciales, desarrollado por Ant-One sobre el framework GenD presentado en el WACV 2026. Está basado en el backbone visual de CLIP ViT-Large/Patch14 a 336 píxeles y se ha afinado exclusivamente sobre los parámetros de Layer Normalization (alrededor del 0,03 % del total), lo que reduce drásticamente el coste de entrenamiento y mejora la generalización frente a manipulaciones no vistas. El modelo se entrenó en el dataset FaceForensics++ (FF++) y reporta resultados de AUROC de 93,18 % a nivel de vídeo y 89,23 % a nivel de fotograma.

Su relevancia actual radica en la creciente amenaza de los vídeos manipulados por IA en contextos de desinformación, fraude y seguridad. Al emplear una estrategia de afinamiento ligero con optimización SAM (Sharpness-Aware Minimization) y pérdidas de uniformidad y alineación sobre una esfera hipersférica, el modelo evita el sobreajuste a artefactos específicos de un método de manipulación, lo que le permite generalizar mejor entre distintos tipos de deepfake. Con 304,3 millones de parámetros, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-Large/Patch14-336 (backbone visual) + cabeza de clasificación LinearNorm |
| Parametros totales | 304.295.938 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen, no texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, precisión bf16-mixed durante entrenamiento) |
| Idiomas soportados | no aplica (modelo de visión; el idioma del modelo card es inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado para cargar la arquitectura) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `openai/clip-vit-large-patch14-336` y congela la totalidad del transformer visual, actualizando únicamente los parámetros de escala y sesgo de las capas de Layer Normalization. Sobre estas características se añade una cabeza lineal normalizada (LinearNorm) que proyecta los vectores de características L2-normalizados sobre una esfera hipersférica. Durante el entrenamiento se combina la pérdida de entropía cruzada con label smoothing (0,1) con pérdidas de uniformidad (0,5) y alineación (0,1) para mejorar la separabilidad de las clases real y falsa. El optimizador empleado es SAM-AdamW con rho=0,05 y modo adaptativo, que suaviza la superficie de pérdida para favorecer mínimos planos y robustez frente a cambios de dominio.

El entrenamiento se realizó sobre el dataset FaceForensics++ (FF++), con 30 épocas, tamaño de lote 32, precisión mixta bf16 y tasa de aprendizaje 0,0003. El paper asociado reporta una evaluación exhaustiva en 14 conjuntos de datos de detección de deepfakes comprendidos entre 2019 y 2025, lo que indica un énfasis en la validación de generalización cross-dataset.

## Capacidades

- Clasificación binaria de imágenes faciales: distingue entre caras reales y manipuladas (deepfake).
- Detección a nivel de fotograma individual y agregación a nivel de vídeo (AUROC, mAP, Accuracy y EER).
- Generalización a distintos métodos de manipulación gracias al afinamiento selectivo de LayerNorm y a la optimización SAM.
- Bajo coste computacional de entrenamiento (solo ~0,03 % de parámetros actualizados), lo que permite adaptar el modelo a nuevos dominios con pocos recursos.
- Procesamiento de imágenes de resolución 336×336 píxeles, adecuado para capturar artefactos finos en rostros.
- Inferencia directa con la API de Transformers mediante `AutoModel` y código personalizado.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal más allá de la imagen.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede analizar vídeos subidos por usuarios y marcar automáticamente aquellos que contengan rostros manipulados, reduciendo la propagación de desinformación. Su alta AUROC (93,18 % en vídeo) lo hace adecuado para filtros de primer nivel.
- Verificación de identidad en videollamadas y sistemas de onboarding remoto: al detectar manipulaciones faciales en tiempo real, ayuda a prevenir suplantaciones de identidad en procesos bancarios o gubernamentales. La baja latencia de un modelo de 304 M parámetros permite su integración en servicios de conferencia.
- Análisis forense digital en investigaciones judiciales: los peritos pueden utilizar el modelo para examinar vídeos presentados como evidencia y obtener probabilidades de manipulación por fotograma, lo que aporta indicios técnicos en casos de fraude o difamación.
- Filtrado de contenido en medios de comunicación: redacciones y agencias de noticias pueden verificar la autenticidad de vídeos recibidos de fuentes externas antes de su publicación, reduciendo el riesgo de difundir material falso.
- Protección de plataformas de intercambio de vídeo (por ejemplo, redes de streaming): el modelo puede actuar como un sistema de alerta temprana para detectar vídeos alterados que infrinjan políticas de contenido.
- Investigación académica en detección de deepfakes: al estar publicado con licencia MIT y código abierto, sirve como punto de partida para estudiar técnicas de afinamiento eficiente (LayerNorm tuning) y métricas de generalización en visión por computador.

## Benchmarks y rendimiento

Los resultados reportados en la model card, obtenidos sobre el conjunto de test de FaceForensics++, son los siguientes:

| Metrica | Valor |
|---|---|
| Video AUROC | 93,18 % |
| Video mAP | 92,14 % |
| Video Accuracy | 85,59 % |
| Video EER | 14,41 % |
| Frame AUROC | 89,23 % |
| Frame mAP | 87,18 % |
| Frame Accuracy | 81,85 % |

No se dispone en la información proporcionada de comparaciones con otros detectores de deepfake en los mismos conjuntos de datos. El paper de GenD menciona una evaluación en 14 conjuntos de datos adicionales, pero los resultados detallados no están incluidos en la model card ni en los resultados de búsqueda disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 304,3 M parámetros. En precisión bf16, los pesos ocupan aproximadamente 0,6 GB; considerando activaciones y overhead del framework, se recomienda al menos 4 GB de VRAM para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU con 8 GB o más (por ejemplo, NVIDIA RTX 3060, RTX 4070, RTX 4090) es suficiente. También puede ejecutarse en GPUs de datacenter como A10 o A100 sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y alta actuales.
- Opciones de despliegue: el modelo se carga mediante la API de Transformers con `trust_remote_code=True`. Para despliegue en producción se puede exportar a ONNX o TensorRT, o servirlo con vLLM (aunque vLLM está orientado a texto, no es la opción natural). Alternativas recomendadas: FastAPI con PyTorch, TorchServe, o ONNX Runtime.
- Latencia y throughput estimados: no se han publicado mediciones oficiales. Dado el tamaño moderado del modelo, se espera una latencia de decenas de milisegundos por imagen en una GPU moderna (estimación razonable, no confirmada por el autor).

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos de otros modelos de detección de deepfakes en la información proporcionada. Cualitativamente, se puede situar frente a alternativas conocidas:

| Modelo | Enfoque | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| GenD_CLIP_L_336_FF (este) | CLIP ViT-Large + afinamiento LayerNorm | 304 M | Imagen 336×336 | MIT |
| Xception (clásico detector de deepfake) | CNN convolucional | ~22 M | Imagen variable | Apache 2.0 |
| FaceXray | Modelo basado en características de mezcla | no disponible | Imagen variable | no disponible |

La principal ventaja de GenD_CLIP_L_336_FF es su estrategia de afinamiento eficiente y su enfoque en generalización, pero no se pueden comparar métricas exactas sin datos públicos de los otros modelos en los mismos conjuntos de prueba.

## Limitaciones y advertencias

- Entrenado exclusivamente en FaceForensics++, que contiene vídeos de baja y media calidad con manipulaciones específicas; el rendimiento puede degradarse en vídeos de alta resolución o con métodos de manipulación más recientes no presentes en el dataset.
- La detección se basa en fotogramas individuales; la agregación a nivel de vídeo depende de la estrategia de votación o promedio, que no se detalla en la model card.
- Requiere que la cara esté correctamente recortada y alineada; el modelo asume una entrada de 336×336 píxeles centrada en el rostro, por lo que una mala alineación puede reducir la precisión.
- Riesgo de falsos positivos y negativos en condiciones de iluminación extrema, compresión fuerte o rostros parcialmente ocluidos.
- No se han publicado análisis de sesgo demográfico; es posible que el modelo tenga un rendimiento desigual según etnia, edad o género, dado que FF++ no está equilibrado explícitamente.
- Licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de cumplir con las leyes de protección de datos y privacidad al aplicar el modelo en entornos reales.
- El código personalizado (`custom_code`) requiere revisión de seguridad antes de su uso en producción, ya que se ejecuta desde el repositorio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ant-One/GenD_CLIP_L_336_FF
- Repositorio oficial del framework GenD (paper WACV 2026): https://github.com/yermandy/GenD
- Paper arxiv (versión disponible): https://arxiv.org/html/2508.06248v4
