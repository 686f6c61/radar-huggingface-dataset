# sarkarghya/amazon-suspicious-review-detector

## Resumen

El modelo `sarkarghya/amazon-suspicious-review-detector` es un clasificador de texto binario desarrollado por sarkarghya para identificar patrones sospechosos de reutilización de reseñas en el dataset Amazon Reviews 2023. Se basa en el modelo `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT, y ha sido ajustado mediante aprendizaje débilmente supervisado (weak supervision) sobre 34 categorías de productos de Amazon. El modelo distingue entre reseñas etiquetadas como `ordinary` (normales) y `suspicious_pattern` (patrón sospechoso), aunque el autor advierte que la etiqueta no constituye una prueba de fraude, sino una señal de calidad.

Con 149,6 millones de parámetros y un tamaño de repositorio de 0,6 GB, el modelo está diseñado para tareas de clasificación de texto y es compatible con la librería `transformers` y con `text-embeddings-inference`. Su relevancia radica en ofrecer una herramienta ligera y accesible para el análisis de reseñas en plataformas de comercio electrónico, aunque su uso debe complementarse con otros criterios de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en ModernBERT-base) |
| Parametros totales | 149.606.402 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional optimizado para eficiencia y velocidad. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información proporcionada. El entrenamiento se realizó durante 2 épocas sobre 34 categorías de Amazon, con 28.321 ejemplos por clase, utilizando un esquema de aprendizaje débilmente supervisado: las etiquetas se generaron mediante heurísticas de reutilización de reseñas, no mediante verificación manual. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de texto binaria: distingue entre reseñas `ordinary` y `suspicious_pattern`.
- Detección de patrones de reutilización de reseñas, basada en heurísticas de alta confianza.
- Integración sencilla con la API de `transformers` mediante `pipeline("text-classification")`.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face, según los tags del repositorio.
- No se reportan capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Moderación de reseñas en plataformas de e-commerce: el modelo puede prefiltrar reseñas que presenten patrones de reutilización, permitiendo a los moderadores priorizar la revisión manual de casos sospechosos.
- Análisis de calidad de reseñas para vendedores: los comerciantes pueden usar el modelo para identificar reseñas potencialmente manipuladas en sus productos y tomar medidas correctivas.
- Investigación académica sobre fraude en reseñas: el modelo sirve como herramienta de detección preliminar en estudios que analizan la prevalencia de reseñas falsas en Amazon.
- Sistemas de alerta temprana para consumidores: integrado en extensiones de navegador o aplicaciones, puede advertir a los usuarios sobre productos con un alto porcentaje de reseñas sospechosas.
- Auditoría de datasets de reseñas: antes de entrenar otros modelos, se puede usar este clasificador para limpiar datasets y eliminar reseñas con patrones de reutilización.
- Monitorización de campañas de reseñas pagadas: las agencias de marketing pueden detectar si un competidor está utilizando reseñas reutilizadas para inflar la reputación de sus productos.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas de validación en el archivo `metrics.json`:

| Metrica | Valor |
|---|---|
| Accuracy | 0,8177 |
| F1 | 0,8097 |
| ROC AUC | 0,8980 |
| Precision | 0,8474 |
| Recall | 0,7752 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 149,6 millones de parámetros, es ligero y puede ejecutarse en CPU para inferencia de baja latencia, aunque no se especifican requisitos exactos de VRAM.
- Es compatible con GPUs de consumo como RTX 3060 o superiores, pero no se proporcionan datos concretos de consumo de memoria.
- El repositorio indica compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face, lo que facilita su despliegue en infraestructura gestionada.
- No se dispone de información sobre latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede realizar una comparativa objetiva con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es un detector de patrones, no una prueba de fraude. La etiqueta `suspicious_pattern` indica que la reseña coincide con heurísticas de reutilización, pero no confirma actividad fraudulenta.
- El entrenamiento se realizó con aprendizaje débilmente supervisado, lo que puede introducir ruido en las etiquetas y afectar a la precisión en escenarios reales.
- No se especifican los idiomas soportados; es probable que el modelo esté entrenado principalmente con reseñas en inglés, dado el dataset de Amazon Reviews 2023, pero no se confirma.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido.
- El modelo no debe utilizarse como única herramienta de moderación o decisión de fraude; se recomienda combinarlo con revisión humana y otros indicadores.
- No se han publicado análisis de sesgos o riesgos de alucinación específicos para este modelo.

## Enlaces

- [Hugging Face - sarkarghya/amazon-suspicious-review-detector](https://huggingface.co/sarkarghya/amazon-suspicious-review-detector)
- [Dataset McAuley-Lab/Amazon-Reviews-2023](https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023)
- [Modelo base answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base)
