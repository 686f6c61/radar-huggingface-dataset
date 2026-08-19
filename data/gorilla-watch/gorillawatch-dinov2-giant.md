# gorilla-watch/GorillaWatch-DINOv2-Giant

## Resumen

GorillaWatch-DINOv2-Giant es un modelo de extracción de características de imagen (image feature extraction) especializado en la re-identificación facial de gorilas occidentales de llanura, una especie en peligro crítico. Ha sido desarrollado por el equipo GorillaWatch como parte de un sistema automatizado de monitorización de poblaciones en estado salvaje, presentado en el artículo «GorillaWatch: An Automated System for In-the-Wild Gorilla Re-Identification and Population Monitoring» (WACV 2026). El modelo parte del backbone DINOv2 ViT-Giant (vit_giant_patch14_dinov2.lvd142m) y se ha ajustado mediante triplet loss con hard mining sobre el dataset Gorilla-SPAC-Wild, proyectando las imágenes a un embedding de 256 dimensiones.

A diferencia de un clasificador tradicional, este modelo no tiene un vocabulario fijo de identidades: la identificación se realiza mediante recuperación k-NN (k=5, distancia euclídea) contra una galería de embeddings. Esto permite generalizar a individuos no vistos durante el entrenamiento, algo esencial para el seguimiento a largo plazo de poblaciones silvestres. El modelo se distribuye bajo licencia CC-BY-4.0 y está disponible en Hugging Face con pesos en formato safetensors, listo para usar con la librería timm y un script de modelado autocontenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT Giant patch14 (DINOv2) |
| Parametros totales | 1.136.872.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa como backbone un ViT-Giant de DINOv2 preentrenado en LVD-142M, con parches de 14x14 píxeles y resolución de entrada de 518x518. Sobre este backbone se añade una cabeza de proyección que reduce las características a un embedding de 256 dimensiones, normalizado para usar distancia euclídea en el espacio de recuperación. El ajuste fino se realizó con pérdida de tripletas con hard mining en línea, margen euclídeo de 0.647, optimizador AdamW (β=0.9/0.999, ε=1e-7), tasa de aprendizaje inicial de 1.9e-7 con decaimiento coseno hasta 1e-7, batch efectivo de 48 (8 con 6 pasos de acumulación de gradiente), regularización L2=0.0059 y L2-SP=1.3e-5, y un máximo de 100 épocas con selección del mejor checkpoint por pérdida de validación. Se usó precisión mixta automática (AMP fp16) con pesos maestros en fp32 y semilla 42.

El entrenamiento se realizó exclusivamente sobre el dataset Gorilla-SPAC-Wild en su configuración `face_with_body`, que contiene recortes de cara y cuerpo de gorilas obtenidos de cámaras trampa. El modelo no emplea el transform por defecto de timm para DINOv2: requiere un resize cuadrado (518x518) y normalización con media y desviación estándar de 0.5 en los tres canales. Usar el transform estándar de ImageNet produce embeddings incorrectos.

## Capacidades

- Extracción de embeddings faciales de 256 dimensiones para re-identificación de gorilas individuales.
- Recuperación por similitud (k-NN, distancia euclídea) contra una galería de embeddings, sin vocabulario fijo de identidades.
- Generalización a individuos no vistos durante el entrenamiento (open-set re-identification).
- Robustez frente a variaciones de iluminación, ángulo y fondo en imágenes de cámaras trampa, gracias al ajuste fino con tripletas hard-mining.
- Soporte para agregación de tracklets: promediado de embeddings de múltiples imágenes del mismo individuo para mejorar la precisión de identificación.
- Funciona como extractor de características independiente, integrable en pipelines de detección y seguimiento.
- No incluye capacidades de generación de texto, tool calling ni agentes, al ser un modelo puramente visual.

## Casos de uso

- Monitorización de poblaciones de gorilas en estado salvaje: el modelo permite identificar individuos a partir de fotogramas de cámaras trampa, sustituyendo la identificación manual que requiere un esfuerzo enorme. Se usa en el pipeline de GorillaWatch junto con módulos de detección y seguimiento.
- Censos y estimas poblacionales: al re-identificar individuos a lo largo del tiempo, se pueden estimar tamaños de población y tasas de natalidad/mortalidad sin marcaje físico.
- Estudios de comportamiento y dinámica social: los embeddings permiten asociar observaciones de comportamiento a individuos concretos, facilitando análisis de interacciones sociales, jerarquías y territorialidad.
- Seguimiento de individuos a largo plazo: la generalización a individuos no vistos permite mantener el seguimiento de un mismo gorila a lo largo de meses o años sin reentrenar el modelo.
- Detección de cambios demográficos: comparando identificaciones entre temporadas, se pueden detectar migraciones, dispersión y muertes.
- Validación de protocolos de conservación: los resultados del modelo pueden usarse para evaluar el impacto de intervenciones de conservación sobre la población, comparando tasas de recaptura y supervivencia.
- Investigación en re-identificación de fauna: el modelo sirve como punto de partida para transferir el aprendizaje a otras especies con datasets limitados, gracias a su backbone DINOv2 y su diseño open-set.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes. La precisión se mide con k-NN (k=5, distancia euclídea), enmascarando las entradas de la galería del mismo encuentro (misma cámara y fecha) para forzar coincidencias entre encuentros distintos. La macro accuracy promedia por identidad, dando igual peso a individuos raros y frecuentes.

| Dataset | Protocolo | Micro accuracy | Macro accuracy |
|---|---|---|---|
| Gorilla-SPAC-Wild (test, in-domain) | Por imagen | 0.5554 | 0.4629 |
| Gorilla-SPAC-Wild (test, in-domain) | Por tracklet (promedio de embeddings) | 0.6121 | 0.4451 |
| Gorilla-Zoo-Berlin (test, out-of-distribution) | Por imagen | 0.7657 | 0.759 |
| Gorilla-Zoo-Berlin (test, out-of-distribution) | Por tracklet (promedio de embeddings) | 0.8218 | 0.8044 |

El rendimiento en Gorilla-Zoo-Berlin es notablemente superior al in-domain, probablemente porque las imágenes de zoológico tienen condiciones más controladas y menos variabilidad que las de cámaras trampa en estado salvaje. No se han publicado comparaciones con otros modelos de re-identificación de primates en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.136 millones de parámetros. En fp16, los pesos ocupan aproximadamente 2.3 GB; con activaciones y overhead, se recomienda al menos 6 GB de VRAM para inferencia con batch pequeño. En fp32, se necesitarían unos 4.5 GB solo para pesos, por lo que 8 GB sería el mínimo recomendado.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar el modelo en fp16. Ejemplos: NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). Para procesar grandes volúmenes de imágenes de cámaras trampa, se recomienda una GPU con al menos 16 GB para permitir batches mayores.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media-alta. Un RTX 3060 de 12 GB puede procesar imágenes de 518x518 con batch razonable.
- Opciones de despliegue: el modelo se carga mediante el script `modeling.py` incluido en el repositorio de Hugging Face, que usa PyTorch y timm. También puede integrarse en pipelines con Hugging Face Transformers o directamente con torch. No se mencionan soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado cifras oficiales. Para una GPU RTX 4090, se estima una latencia de 20-40 ms por imagen a 518x518 en fp16, con throughput de 25-50 imágenes por segundo en batch de 8. Estos valores son orientativos y dependen del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos directamente comparables de re-identificación de gorilas o primates con los mismos protocolos de evaluación. Como referencia de backbone, se puede comparar con el DINOv2 ViT-Giant original:

| Modelo | Parametros | Resolucion | Embedding | Licencia | Uso |
|---|---|---|---|---|---|
| GorillaWatch-DINOv2-Giant | 1136.9M | 518x518 | 256-d | CC-BY-4.0 | Re-identificacion de gorilas |
| DINOv2 ViT-Giant (lvd142m) | 1136.9M | 518x518 | 1536-d (sin proyeccion) | CC-BY-NC-4.0 (original) | Extraccion de caracteristicas general |
| DINOv2 ViT-Large | 307M | 518x518 | 1024-d | CC-BY-NC-4.0 | Extraccion de caracteristicas general |

El modelo de GorillaWatch se diferencia por su proyección a 256 dimensiones y su ajuste específico para re-identificación, lo que reduce la dimensionalidad y mejora la precisión en la tarea concreta frente al backbone genérico. La licencia CC-BY-4.0 permite uso comercial con atribución, a diferencia del DINOv2 original que es CC-BY-NC-4.0.

## Limitaciones y advertencias

- Sesgos de datos: el modelo se entrenó únicamente con imágenes de gorilas occidentales de llanura del dataset Gorilla-SPAC-Wild. Puede no generalizar bien a otras subespecies o a condiciones de captura muy diferentes (p. ej., cámaras de baja resolución, ángulos extremos, oclusiones severas).
- Rendimiento in-domain moderado: la micro accuracy por imagen en Gorilla-SPAC-Wild es de 0.5554, lo que indica que en condiciones reales de campo una parte significativa de las identificaciones individuales serán incorrectas. Se recomienda usar el modo tracklet (promedio de embeddings) para mejorar la robustez.
- Riesgo de errores de identificación: al ser un sistema de recuperación k-NN, la precisión depende de la calidad de la galería. Individuos con apariencia muy similar pueden confundirse, y el enmascaramiento de encuentros es esencial para evitar falsas coincidencias triviales.
- Preprocesamiento crítico: el modelo no usa el transform por defecto de timm. Aplicar la normalización de ImageNet (media y std estándar) produce embeddings incorrectos. Es obligatorio usar resize cuadrado y normalización con media=std=0.5.
- Sin capacidades de lenguaje: no es un modelo multimodal ni de generación de texto. No soporta tool calling, agentes ni razonamiento simbólico.
- Licencia CC-BY-4.0: permite uso comercial y modificaciones, pero exige atribución al autor. No hay restricciones de uso militar o de vigilancia específicas, pero se debe revisar la licencia completa antes de desplegar en producción.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas (GGUF, int8, etc.), por lo que el despliegue en dispositivos con poca memoria requiere conversión manual y validación de la pérdida de precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gorilla-watch/GorillaWatch-DINOv2-Giant
- Proyecto GorillaWatch: https://gorilla-watch.github.io/
- Repositorio GitHub: https://github.com/gorilla-watch/gorillawatch
- Artículo arXiv: https://arxiv.org/abs/2512.07776
- Dataset Gorilla-SPAC-Wild: https://huggingface.co/datasets/gorilla-watch/Gorilla-SPAC-Wild
- Dataset Gorilla-Zoo-Berlin: https://huggingface.co/datasets/gorilla-watch/Gorilla-Zoo-Berlin
- Perfil de la organización en Hugging Face: https://huggingface.co/gorilla-watch
