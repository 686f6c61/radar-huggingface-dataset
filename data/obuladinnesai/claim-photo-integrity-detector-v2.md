# obuladinnesai/claim-photo-integrity-detector-v2

## Resumen

Claim Photo Integrity Detector v2 es un modelo de clasificación de imágenes basado en Vision Transformer (ViT) desarrollado por el usuario obuladinnesai. Su función es discriminar entre fotografías reales (capturadas con teléfono o cámara) e imágenes generadas por IA, con un enfoque declarado hacia el sector asegurador: servir como señal de triaje en la revisión de fotos asociadas a siniestros. El modelo es una continuación del ajuste fino de la versión v1, ampliando el conjunto de imágenes "reales" con fotografías cotidianas de Open Images V7, imágenes auténticamente degradadas de KonIQ-10k y fotos reales de teléfono móvil.

Con 85.800.194 parámetros y un repositorio de 0,3 GB, se trata de un modelo compacto, adecuado para inferencia en hardware modesto. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El modelo se publica con pesos en formato safetensors y se integra directamente en el pipeline `image-classification` de Transformers.

Es relevante ahora porque el fraude con imágenes generadas por IA en reclamaciones de seguros es un vector de riesgo creciente, y este modelo ofrece una primera capa de detección automatizada. No obstante, el propio autor lo describe explícitamente como una señal para revisión humana, no como prueba de fraude.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 85.800.194 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, clasificación de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Vision Transformer (ViT), según la etiqueta `vit` del repositorio y el pipeline declarado de clasificación de imágenes. El checkpoint contiene 85.800.194 parámetros, coherente con un ViT de tamaño base con cabeza de clasificación. No se especifica en la información disponible la resolución de entrada, el número de capas ni la dimensión de los embeddings.

El entrenamiento parte de un ajuste fino de la versión v1 y se amplía con un conjunto de datos "real" mucho más diverso: fotografías cotidianas de Open Images V7, imágenes auténticamente degradadas de KonIQ-10k (desenfoque, ruido, mala iluminación) y fotos reales de teléfono. Además, se aplica aumento de datos en tiempo de entrenamiento (recompresión JPEG, ruido, desenfoque, jitter de brillo y contraste) para que la fotografía móvil cotidiana se reconozca como real en lugar de clasificarse erróneamente como generada por IA. El dataset de referencia etiquetado es `Rajarshi-Roy-research/Defactify_Image_Dataset`, orientado a la detección de imágenes generadas. No se detalla el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO (no aplicable en un clasificador de imagen).

## Capacidades

- Clasificación binaria de imágenes: real frente a generada por IA.
- Detección de imágenes sintéticas orientada a fotografía de reclamaciones y siniestros.
- Reconocimiento de fotografía móvil cotidiana como real, incluyendo imágenes con degradaciones auténticas (desenfoque, ruido, mala iluminación).
- Robustez frente a recompresión JPEG y variaciones de brillo y contraste gracias al aumento de datos en entrenamiento.
- Integración directa con el pipeline `image-classification` de Hugging Face Transformers.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto, por ser un modelo puramente visual.

## Casos de uso

- Triaje de fotos en reclamaciones de seguros: el modelo clasifica cada imagen adjunta a un siniestro y marca las sospechosas de ser generadas por IA para revisión humana prioritaria, reduciendo el volumen de inspección manual.
- Detección de daños fabricados: en siniestros de automóvil o hogar, se usa como filtro previo para identificar imágenes de daños que podrían haber sido generadas sintéticamente en lugar de fotografiar un daño real.
- Verificación de documentación fotográfica: en procesos de onboarding o peritaje, se comprueba que las fotos aportadas por el asegurado son capturas reales y no imágenes sintéticas.
- Preprocesado en pipelines antifraude: se integra como primer estadio de un sistema de scoring de fraude, enviando solo las imágenes marcadas como sospechosas a modelos más costosos de análisis forense.
- Moderación de contenido visual en plataformas: clasificación de imágenes subidas por usuarios para detectar contenido sintético en contextos donde se exige autenticidad fotográfica.
- Investigación en detección de deepfakes de imagen: sirve como línea base reproducible (licencia Apache 2.0, pesos safetensors) para comparar con detectores más recientes o para fine-tuning sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,8 millones de parámetros en precisión FP32, el checkpoint ocupa aproximadamente 0,34 GB; en FP16, unos 0,17 GB. La VRAM real necesaria para inferencia es inferior a 1 GB, incluyendo activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece holgura para procesar lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `image-classification` de Transformers, ONNX Runtime, TorchScript, o servidores de inferencia como TGI o vLLM (aunque estos últimos están más orientados a modelos generativos; para un ViT pequeño basta con Transformers o un microservicio FastAPI).
- Latencia y throughput: no se han publicado datos concretos; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Claim Photo Integrity Detector v2 | 85,8 M | Detección real/IA en fotos de reclamaciones | Apache 2.0 | Hugging Face |
| Car Damage Photo Integrity v9 (mismo autor) | no disponible | Detección y localización de manipulación en fotos de daños de coche | no disponible | Hugging Face |
| Detectores genéricos de imágenes IA (p. ej. basados en CLIP) | variable | Detección de imágenes generadas | variable | Hugging Face / repositorios |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es una señal de triaje para revisión humana, no una prueba de fraude; no debe usarse como decisión automatizada definitiva.
- La precisión se degrada frente a generadores de imagen más recientes que los presentes en los datos de entrenamiento.
- Riesgo de falsos positivos en fotografías reales con características atípicas (edición legítima, filtros, condiciones extremas) no cubiertas por el conjunto de entrenamiento.
- Riesgo de falsos negativos ante imágenes generadas por modelos de última generación o sometidas a postprocesado para evadir la detección.
- No se documentan sesgos específicos ni la composición demográfica del dataset; el conjunto de datos de referencia (Defactify) puede no representar todos los dominios fotográficos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No aplica a texto ni a otros idiomas; es exclusivamente un clasificador de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/obuladinnesai/claim-photo-integrity-detector-v2
- Modelo relacionado (Car Damage Photo Integrity v9): https://huggingface.co/obuladinnesai/car-damage-photo-integrity-v9
- Repositorio del toolkit del autor: https://github.com/saiobuladinne/claim-photo-toolkit
- Dataset de referencia: https://huggingface.co/datasets/Rajarshi-Roy-research/Defactify_Image_Dataset
- API de descargas del modelo: https://huggingface.co/api/models/obuladinnesai/claim-photo-integrity-detector-v2?expand[]=downloadsAllTime
