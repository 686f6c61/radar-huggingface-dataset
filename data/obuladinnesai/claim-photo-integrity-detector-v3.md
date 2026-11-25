# obuladinnesai/claim-photo-integrity-detector-v3

## Resumen

Claim Photo Integrity Detector v3 es un clasificador de imágenes basado en Vision Transformer (ViT) desarrollado por el usuario obuladinnesai en Hugging Face. Su propósito es distinguir entre fotografías reales y fotografías generadas o manipuladas por IA, con un enfoque de dominio específico: la verificación de imágenes adjuntas a siniestros en el sector asegurador. El modelo se presenta como una señal de triaje para revisión humana, no como prueba de fraude.

Esta tercera versión es un ajuste fino continuado de la v2, que alcanzaba un 97 % de precisión de validación pero clasificaba erróneamente fotos cotidianas de teléfono móvil (interiores, personas, fotogramas de vídeo) como generadas por IA. La v3 incorpora fotografías reales del propio autor del modelo en el conjunto de entrenamiento, precisamente la distribución en la que fallaba la v2, y aplica un calendario de ajuste fino más agresivo (3 épocas a 2e-5 frente a 2 épocas a 1e-5 de la v2) para desplazar la frontera de decisión.

El modelo tiene 85.800.194 parámetros (unos 85,8 M), se distribuye en formato safetensors con un tamaño de repositorio de 0,3 GB y licencia Apache 2.0. Está pensado para integrarse en flujos de peritaje y gestión de siniestros donde se necesita un filtro rápido y barato antes de la inspección manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 85.800.194 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, clasificación de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT) para clasificación de imágenes, con 85,8 millones de parámetros. El modelo parte de un checkpoint previo (v2, a su vez ajuste fino de una base ViT) y se especializa en la tarea binaria de integridad fotográfica: foto real frente a foto generada por IA o manipulada.

El entrenamiento se realizó sobre el dataset Rajarshi-Roy-research/Defactify_Image_Dataset, orientado a la detección de imágenes generadas por IA. La innovación principal de la v3 respecto a la v2 es la incorporación de fotografías reales de teléfono móvil del propio autor como ejemplos de la clase "real", atacando el falso positivo sistemático de la v2 sobre escenas cotidianas. Se mantiene el aumento de datos en tiempo de entrenamiento (recompresión JPEG, ruido, desenfoque, variaciones de brillo y contraste) y se refuerza el ajuste fino con 3 épocas a tasa de aprendizaje 2e-5. No se documenta en la información disponible el uso de RLHF, DPO ni detalles sobre el volumen total de tokens o composición exacta del dataset más allá del nombre del conjunto de datos.

## Capacidades

- Clasificación de imágenes en dos categorías: fotografía real frente a fotografía generada por IA o manipulada.
- Detección de imágenes sintéticas orientada al dominio de siniestros y reclamaciones de seguros.
- Integración directa con el pipeline `image-classification` de Transformers.
- Aumento de robustez frente a artefactos de compresión JPEG, ruido, desenfoque y variaciones de iluminación, gracias al aumento de datos en entrenamiento.
- Reducción de falsos positivos sobre fotografías cotidianas de teléfono móvil (interiores, personas, fotogramas de vídeo) respecto a la v2.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto: es un clasificador de imagen puro.
- No dispone de modo "thinking", visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Triaje de siniestros en aseguradoras: el modelo actúa como primer filtro automático sobre las fotos adjuntas a una reclamación, marcando las sospechosas de ser generadas por IA para que un perito las revise manualmente antes de continuar el expediente.
- Verificación de daños en automóviles: aunque el autor remite a un modelo específico (Car Damage Photo Integrity v9) para localización de manipulaciones, la v3 sirve para descartar imágenes sintéticas en la fase inicial de declaración de daños.
- Moderación de contenido en plataformas de compraventa o alquiler: detectar fotos de producto o inmueble generadas por IA antes de publicar un anuncio.
- Control de calidad en flujos de documentación fotográfica: validar que las imágenes aportadas por clientes en procesos de onboarding o KYC no son sintéticas.
- Investigación en detección de deepfakes de imagen: servir como línea base ligera (85,8 M de parámetros) para comparar con detectores más pesados.
- Preprocesado en pipelines de peritaje con revisión humana: integrar la salida del clasificador como señal de confianza en un sistema de gestión documental, priorizando la cola de revisión.
- Filtrado previo en datasets de entrenamiento: descartar imágenes generadas por IA al construir corpus de fotografía real para otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la v2 alcanzó un 97 % de precisión de validación, pero no se aportan métricas cuantitativas de la v3 (precisión, recall, F1, AUC) ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un modelo de 85,8 M de parámetros; en la práctica, unos 350 MB de pesos más el overhead de activaciones.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesar lotes grandes de imágenes en pipelines de producción.
- Opciones de despliegue: pipeline de Transformers, TorchServe, ONNX Runtime, Triton Inference Server; también es viable exportar a TensorRT para latencias mínimas.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Claim Photo Integrity Detector v3 | 85,8 M | no aplica (visión) | Detección de imagen IA en siniestros | Apache 2.0 | Hugging Face |
| Car Damage Photo Integrity v9 (mismo autor) | no disponible | no aplica (visión) | Localización de manipulaciones en fotos de daños | no disponible | Hugging Face |
| Defactify baseline (dataset de referencia) | no disponible | no aplica (visión) | Detección de imágenes generadas por IA | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una señal de triaje para revisión humana, no una prueba de fraude; no debe usarse como única base para denegar una reclamación.
- La precisión se degrada frente a generadores más recientes que los presentes en los datos de entrenamiento.
- La v2 mostraba falsos positivos sobre fotos cotidianas de móvil; la v3 los mitiga con datos propios del autor, lo que puede introducir sesgo hacia esa distribución concreta de cámara y escena.
- No se documentan sesgos demográficos, geográficos ni de dispositivo; el conjunto de datos de validación es limitado y no se publican métricas de la v3.
- El modelo no procesa texto ni metadatos EXIF; solo analiza píxeles.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de siniestros.
- No se especifican limitaciones de idioma porque el modelo no opera sobre texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/obuladinnesai/claim-photo-integrity-detector-v3
- Modelo complementario (detección de ediciones y mapas de calor): https://huggingface.co/obuladinnesai/car-damage-photo-integrity-v9
- Repositorio del toolkit del autor: https://github.com/saiobuladinne/claim-photo-toolkit
- Dataset de entrenamiento: https://huggingface.co/datasets/Rajarshi-Roy-research/Defactify_Image_Dataset
- API de descargas del modelo: https://huggingface.co/api/models/obuladinnesai/claim-photo-integrity-detector-v3?expand[]=downloadsAllTime
