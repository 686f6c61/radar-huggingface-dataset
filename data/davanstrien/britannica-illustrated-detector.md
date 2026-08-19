# davanstrien/britannica-illustrated-detector

## Resumen

El modelo `davanstrien/britannica-illustrated-detector` es un clasificador de imágenes binario desarrollado por Daniel van Strien (Machine Learning Librarian en Hugging Face) que determina si una página escaneada de la Encyclopaedia Britannica está ilustrada o no. El modelo se basa en la arquitectura EfficientViT-B1 con resolución de entrada de 256 píxeles y ha sido entrenado específicamente sobre el conjunto de datos de verdad fundamental de la Biblioteca Nacional de Escocia (NLS), que contiene anotaciones de páginas históricas de la enciclopedia.

La relevancia de este modelo reside en su aplicación práctica para el procesamiento de documentos históricos digitalizados. En bibliotecas y archivos que realizan digitalizaciones masivas, distinguir automáticamente entre páginas ilustradas y no ilustradas permite priorizar tareas de OCR, indexación visual o control de calidad. El modelo es extremadamente ligero (aproximadamente 7,5 millones de parámetros), lo que lo hace adecuado para despliegue en entornos con recursos limitados.

Según la model card, el modelo alcanza un rendimiento perfecto en el conjunto de validación reservado (PR-AUC 1.0000, F1 1.0000, precisión 1.0000) y supera a un modelo anterior basado en ViT-B/16 con resolución de 384 píxeles. El umbral de decisión recomendado es 0.982, aunque el autor sugiere recalibrarlo según la prevalencia de ilustraciones en el corpus objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-B1 (timm) |
| Parametros totales | 7.517.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EfficientViT-B1 es una arquitectura híbrida que combina capas convolucionales y de atención lineal, diseñada para lograr un equilibrio entre eficiencia computacional y precisión en tareas de visión. A diferencia de los Vision Transformers clásicos que utilizan atención cuadrática, EfficientViT emplea mecanismos de atención lineal que reducen la complejidad computacional de O(n²) a O(n), manteniendo un rendimiento competitivo en clasificación de imágenes.

El modelo fue entrenado sobre el conjunto de datos `NationalLibraryOfScotland/encyclopaedia_britannica_illustrated`, un dataset de verdad fundamental con licencia CC0 que contiene páginas escaneadas de la Encyclopaedia Britannica anotadas como ilustradas o no ilustradas. La model card indica que se utilizó un split de validación reservado para evaluar el rendimiento final. No se proporcionan detalles sobre el número de épocas, tamaño de lote, optimizador o técnicas de aumento de datos empleadas. El modelo se entrena mediante fine-tuning de los pesos preentrenados de EfficientViT-B1 en ImageNet (r256_in1k).

## Capacidades

- Clasificación binaria de imágenes: determina si una página escaneada contiene ilustraciones (clase 1) o no (clase 0).
- Procesamiento de documentos históricos: específicamente optimizado para páginas de enciclopedia del siglo XVIII y XIX.
- Eficiencia computacional: gracias a la arquitectura EfficientViT, requiere menos recursos que los Vision Transformers convencionales.
- Integración con pipelines de timm: compatible con el ecosistema de PyTorch Image Models, facilitando su uso en flujos de trabajo existentes.
- Inferencia rápida: su tamaño reducido (7,5M parámetros) permite ejecución en CPU con latencias aceptables.

## Casos de uso

- Digitalización de fondos bibliotecarios: instituciones que escanean colecciones históricas pueden usar el modelo para clasificar automáticamente las páginas y priorizar aquellas que requieren restauración digital o tratamiento especial por contener imágenes.
- Control de calidad en proyectos de OCR: las páginas ilustradas suelen presentar mayor complejidad para los motores de OCR; identificar estas páginas permite enrutarlas a pipelines especializados o revisión manual.
- Indexación y metadatos: generación automática de metadatos descriptivos para catálogos digitales, indicando si cada página contiene material gráfico.
- Optimización de almacenamiento: las páginas ilustradas pueden requerir mayor resolución de escaneo o formatos de compresión diferentes; el modelo permite clasificar y aplicar políticas de almacenamiento diferenciadas.
- Investigación en humanidades digitales: análisis a gran escala de la presencia de ilustraciones en publicaciones periódicas históricas para estudios sobre la evolución del material gráfico en la prensa.
- Entrenamiento de modelos multimodales: el modelo puede servir como extractor de características o preprocesador para sistemas que necesiten combinar información textual y visual de documentos históricos.

## Benchmarks y rendimiento

Según la model card, los resultados en el split de validación reservado son:

| Metrica | Valor |
|---|---|
| PR-AUC | 1.0000 |
| Best-F1 | 1.0000 |
| Accuracy | 1.0000 |
| Umbral recomendado | 0.982 |

El modelo supera al anterior `davanstrien/autotrain-encyclopaedia-illustrations-blog-post-3327992158` (basado en ViT-B/16@384), que alcanzaba PR-AUC 1.0000 en el mismo split. No se han publicado resultados comparativos con otros modelos en benchmarks estándar como ImageNet.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (el modelo tiene aproximadamente 30 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, funciona en RTX 2060, GTX 1660, RTX 3060 y superiores.
- Opciones de despliegue: puede servirse mediante TorchServe, FastAPI con PyTorch, o exportarse a ONNX para inferencia optimizada. También es compatible con Hugging Face Inference Endpoints.
- Latencia estimada: en GPU moderna (RTX 3090), latencia inferior a 5 ms por imagen; en CPU moderna, latencia de 50-150 ms por imagen dependiendo del hardware y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Resolucion | PR-AUC (mismo split) | Licencia |
|---|---|---|---|---|---|
| davanstrien/britannica-illustrated-detector | EfficientViT-B1 | 7,5M | 256px | 1.0000 | Apache 2.0 |
| davanstrien/autotrain-encyclopaedia-illustrations-blog-post-3327992158 | ViT-B/16 | 86M | 384px | 1.0000 | Apache 2.0 |

El modelo EfficientViT-B1 logra el mismo rendimiento que el ViT-B/16 con aproximadamente 11 veces menos parámetros y menor resolución de entrada, lo que resulta en inferencia más rápida y menor huella de memoria. No se dispone de información sobre otros modelos comparables en esta tarea específica.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo fue entrenado exclusivamente con páginas de la Encyclopaedia Britannica; su rendimiento en otros documentos históricos (periódicos, revistas, manuscritos) puede degradarse significativamente.
- Umbral de decisión: el umbral recomendado de 0.982 está calibrado para el split de validación; el autor recomienda recalibrarlo según la prevalencia de ilustraciones en el corpus de aplicación.
- Riesgo de sobreajuste: los resultados perfectos en validación (PR-AUC 1.0000) podrían indicar que el conjunto de datos es relativamente fácil de clasificar o que el split de validación es poco representativo; se recomienda validar en datos externos.
- Sin soporte multilingüe: al ser un modelo de visión, no procesa texto; las páginas con ilustraciones muy pequeñas o marginales podrían clasificarse incorrectamente.
- Limitaciones de generalización: la arquitectura EfficientViT-B1 preentrenada en ImageNet puede arrastrar sesgos visuales del dataset original.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el dataset de entrenamiento (CC0) no impone restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/britannica-illustrated-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/NationalLibraryOfScotland/encyclopaedia_britannica_illustrated
- Dataset OCR relacionado: https://huggingface.co/datasets/davanstrien/encyclopaedia_britannica_illustrated-dots-ocr
- Perfil del autor: https://huggingface.co/davanstrien
- GitHub del autor: https://github.com/davanstrien
