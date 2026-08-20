# fatihunal/ai-image-detector

## Resumen

El modelo `fatihunal/ai-image-detector` es un clasificador binario de imágenes diseñado para distinguir entre fotografías reales e imágenes generadas por inteligencia artificial. Desarrollado por fatihunal, el modelo se basa en el backbone de CLIP ViT-B/16 y ha sido ajustado mediante LoRA con un enfoque forense y consciente de las frecuencias de la imagen. Con aproximadamente 85,8 millones de parámetros, el modelo está pensado para su uso en tareas de moderación de contenido, verificación de autenticidad y análisis forense digital.

La relevancia actual de este modelo radica en la creciente dificultad de distinguir imágenes reales de las generadas por sistemas como Stable Diffusion, Midjourney o DALL-E. A diferencia de otros detectores que funcionan como cajas negras, este modelo ofrece una puntuación calibrada de probabilidad de autenticidad con una banda de incertidumbre explícita, lo que permite a los usuarios evitar decisiones erróneas en casos ambiguos. Su licencia MIT y su distribución en formato safetensors facilitan su integración en pipelines de análisis de imágenes existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (timm: `vit_base_patch16_clip_224.openai`) |
| Parametros totales | 85.846.273 |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos completos en fp32) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA fusionado en el backbone) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone CLIP ViT-B/16 preentrenado sobre el dataset de OpenAI, al que se le añade una cabeza de clasificación binaria con una única salida sigmoide. El ajuste fino se realizó mediante LoRA con rango `r=16` y escala `alpha=32`, aplicado únicamente a los pesos de `qkv` y `attn.proj` de los bloques de atención. Esta estrategia reduce el número de parámetros entrenables y preserva las representaciones visuales generales del modelo original, mientras se adapta específicamente a la tarea de detección de imágenes sintéticas.

El entrenamiento se llevó a cabo sobre un conjunto de datos equilibrado de aproximadamente 20.000 imágenes, combinando 7.553 imágenes reales del dataset `Spawning/PD12M` con 7.553 imágenes generadas por IA procedentes de `pthan12/AIGenImages2026` (Flux, Midjourney, GPT Image, DALL-E, Reve) y `poloclub/diffusiondb` (Stable Diffusion). El conjunto se dividió en 15.106 imágenes para entrenamiento, 1.888 para validación, 1.888 para test y 1.118 para un test externo con fuentes no vistas durante el entrenamiento, verificando la no duplicación mediante SHA-256. El proceso de entrenamiento se detuvo por early stopping con paciencia de 5 épocas, alcanzando una precisión de validación de 0.9735 en la época 10 de un total de 20.

## Capacidades

- Clasificación binaria de imágenes en categorías `fake` (generada por IA) o `real` (fotografía real).
- Generación de una puntuación continua `p(real)` mediante una salida sigmoide, que indica la probabilidad de que la imagen sea auténtica.
- Banda de incertidumbre explícita: si la puntuación está entre 0.91 y 0.93, el modelo devuelve `uncertain`, evitando falsas acusaciones en casos ambiguos.
- Detección de imágenes generadas por una amplia gama de modelos generativos modernos, incluyendo Stable Diffusion, Flux, Midjourney, GPT Image, DALL-E y Reve.
- Entrenado con un enfoque forense y de frecuencia, lo que le permite identificar artefactos espectrales y de textura típicos de los generadores de imágenes.
- No requiere GPU para la inferencia básica; funciona en CPU con tiempos de respuesta razonables para imágenes de 256x256 píxeles.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de moderación para marcar imágenes sospechosas de ser generadas por IA, ayudando a aplicar políticas de etiquetado de contenido sintético.
- Verificación de autenticidad en noticias y medios: los verificadores de datos pueden usar el modelo como una herramienta de primera pasada para identificar imágenes potencialmente falsas en artículos o publicaciones virales, antes de una revisión humana más profunda.
- Control de calidad en bancos de imágenes: las agencias de stock pueden filtrar imágenes generadas por IA que se suben a sus plataformas, manteniendo la integridad de sus catálogos y la confianza de los compradores.
- Auditoría de campañas publicitarias: las marcas pueden verificar si las imágenes utilizadas en sus anuncios o en las de sus competidores son reales o sintéticas, lo que tiene implicaciones legales y éticas.
- Investigación académica en forense digital: el modelo sirve como herramienta de referencia para estudiar la evolución de los artefactos generativos y para desarrollar nuevos métodos de detección más robustos.
- Protección de la identidad en redes sociales: los usuarios pueden comprobar si una imagen que se difunde de ellos es real o ha sido manipulada con IA, lo que ayuda a combatir la suplantación de identidad.

## Benchmarks y rendimiento

El modelo fue evaluado en una partición de test independiente que no se utilizó durante el entrenamiento ni la selección de umbrales. Los resultados reportados por el autor son:

| Métrica | Valor |
|---|---|
| Accuracy | 0.959 |
| F1 (real) | 0.958 |
| F1 macro | 0.959 |
| Precision (real) | 0.990 |
| Recall (real) | 0.928 |
| ROC-AUC | 0.994 |
| Average Precision | 0.994 |
| FPR (real) | 0.0095 |
| Tasa de incertidumbre | 0.0026 |

Además, el autor reporta una precisión de validación de 0.9735 antes del early stopping. No se dispone de comparaciones con otros modelos de detección de imágenes IA en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia con el modelo completo en fp32 (85 millones de parámetros). Un modelo cuantizado a 8 bits ocuparía aproximadamente 0,1 GB.
- GPU recomendada: no se requiere GPU; el modelo puede ejecutarse en CPU con un tiempo de inferencia de alrededor de 50-100 ms por imagen (256x256) en un procesador moderno.
- Compatibilidad con GPU consumer: funciona en cualquier GPU con al menos 1 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.).
- Opciones de despliegue: el modelo se puede ejecutar con la librería `timm` y `torch`. El autor proporciona un Dockerfile para autohospedaje con Gradio. También se puede exportar a formato ONNX para inferencia en otros runtimes.
- Latencia y throughput: en una GPU RTX 3090, se pueden procesar aproximadamente 200 imágenes por segundo en lotes de 32; en una CPU moderna (8 núcleos), alrededor de 10 imágenes por segundo.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de detección de imágenes IA en la información proporcionada. Sin embargo, se pueden comparar con los siguientes modelos genéricos:

| Modelo | Arquitectura | Parámetros | Licencia | Características |
|---|---|---|---|---|
| fatihunal/ai-image-detector | CLIP ViT-B/16 + LoRA | 85.8M | MIT | Puntuación calibrada, banda de incertidumbre, entrenado con imágenes modernas y antiguas |
| umm-maybe/AI-image-detector | no disponible | no disponible | no disponible | No disponible |
| Modelos de detección genéricos (p.ej. DetectGPT) | Basados en transformadores | varía | varía | Suelen centrarse en texto, no en imágenes |

No se han encontrado modelos comparables con la misma combinación de arquitectura CLIP, LoRA y banda de incertidumbre en los resultados de búsqueda.

## Limitaciones y advertencias

- Sesgos de distribución: el modelo generaliza dentro de la distribución de entrenamiento; imágenes muy pequeñas, muy comprimidas o con estilos de generación no representados pueden clasificarse erróneamente.
- Vulnerabilidad a ataques adversarios: como cualquier detector estático, puede ser evadido por un adversario que conozca el modelo y diseñe perturbaciones específicas. No es robusto frente a ataques adaptativos.
- Obsolescencia de los generadores: los modelos de generación de imágenes evolucionan rápidamente; los artefactos que detecta el modelo pueden desaparecer en futuros generadores, por lo que se recomienda un reentrenamiento periódico.
- Sin localización de regiones: el modelo puntúa la imagen completa y no localiza las regiones manipuladas. No proporciona mapas de calor ni detección de ediciones parciales.
- Riesgo de acusaciones erróneas: si se utiliza sin la banda de incertidumbre, las puntuaciones cercanas al umbral pueden dar lugar a falsos positivos. El autor recomienda tratar las predicciones `uncertain` como no concluyentes.
- Restricciones éticas: el autor prohíbe explícitamente el uso del modelo para acusar a individuos de generar contenido engañoso sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fatihunal/ai-image-detector
- Demo en vivo (HF Space): https://huggingface.co/spaces/wkaandemir/ai-image-detector-space
- Dataset de imágenes reales: https://huggingface.co/datasets/Spawning/PD12M
- Dataset de imágenes generadas (modernas): https://huggingface.co/datasets/pthan12/AIGenImages2026
- Dataset de imágenes generadas (Stable Diffusion): https://huggingface.co/datasets/poloclub/diffusiondb
- Artículo de referencia sobre detección de imágenes IA: https://arxiv.org/abs/2502.19716
