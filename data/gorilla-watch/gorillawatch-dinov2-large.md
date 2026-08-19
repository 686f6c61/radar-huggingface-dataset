# gorilla-watch/GorillaWatch-DINOv2-Large

## Resumen

GorillaWatch-DINOv2-Large es un modelo de extracción de características de imagen especializado en la re-identificación facial de gorilas occidentales de llanura, desarrollado por el equipo de GorillaWatch en el marco del artículo "GorillaWatch: An Automated System for In-the-Wild Gorilla Re-Identification and Population Monitoring" (WACV 2026). El modelo parte del backbone DINOv2 ViT-Large/14 (304,6 millones de parámetros) y se ajusta con una función de pérdida de tripletas con minería de ejemplos difíciles sobre el dataset Gorilla-SPAC-Wild, proyectando las imágenes a un espacio de embeddings de 256 dimensiones. La identificación se realiza mediante búsqueda k-NN sobre una galería de embeddings, sin un vocabulario fijo de identidades, lo que permite generalizar a individuos no vistos durante el entrenamiento.

El modelo resuelve el problema del monitoreo manual de poblaciones de gorilas en peligro crítico de extinción, donde la re-identificación de individuos a partir de miles de horas de vídeo de cámaras trampa es una tarea extremadamente laboriosa. Su relevancia actual radica en que ofrece una solución automatizada y de código abierto (licencia CC-BY-4.0) para la re-identificación en condiciones reales, con una resolución de entrada de 518×518 píxeles y un rendimiento validado tanto en el dominio de entrenamiento como en un escenario de transferencia de dominio de cero disparos (zoológico de Berlín). El repositorio incluye código de entrenamiento y evaluación, lo que facilita su reproducción y adaptación a otras especies o contextos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Large/14 (DINOv2) con proyección a embedding de 256 dimensiones |
| Parametros totales | 304.630.016 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza como backbone el checkpoint `vit_large_patch14_dinov2.lvd142m` de DINOv2, un transformer de visión con parches de 14×14 píxeles y 24 bloques. Sobre este backbone se añade una cabeza de proyección que reduce la representación a un embedding de 256 dimensiones. El ajuste fino se realiza con una pérdida de tripletas en línea con minería de ejemplos difíciles, distancia euclidiana y margen de 0,647. El optimizador es AdamW (β=0,9/0,999, ε=1e-7) con una tasa de aprendizaje de 1,9e-7 que decae cosenoidalmente hasta 1e-7, batch efectivo de 48 (8 por paso con 6 pasos de acumulación de gradiente), regularización L2 de 0,0059 y L2-SP de 1,3e-5. Se entrenó durante un máximo de 100 épocas, conservando el checkpoint con menor pérdida de validación, usando precisión mixta (fp16 autocast con pesos maestros en fp32) y semilla 42.

Los datos de entrenamiento provienen del dataset Gorilla-SPAC-Wild, en su configuración `face_with_body`, que combina recortes de cara y cuerpo de gorilas capturados por cámaras trampa en estado salvaje. El modelo no emplea un clasificador de identidades fijas, sino que aprende un espacio métrico donde las imágenes del mismo individuo quedan próximas entre sí, lo que permite la identificación por recuperación k-NN (k=5, distancia euclidiana) contra una galería de embeddings de referencia. El protocolo de evaluación enmascara las entradas de la misma cámara y fecha para evitar coincidencias triviales, garantizando que cada coincidencia se produce entre encuentros distintos.

## Capacidades

- Extracción de características de imagen para re-identificación facial de gorilas, generando embeddings de 256 dimensiones normalizados.
- Identificación de individuos mediante búsqueda k-NN sobre una galería, sin necesidad de un vocabulario fijo de identidades.
- Generalización a individuos no vistos durante el entrenamiento, gracias al aprendizaje métrico.
- Transferencia de dominio de cero disparos: validado en el dataset Gorilla-Zoo-Berlin sin ajuste adicional, con resultados notables.
- Soporte de entrada de imágenes de 518×518 píxeles, con un preprocesado específico (redimensionado cuadrado y normalización con media y desviación 0,5) que difiere del transform por defecto de timm.
- Integración sencilla con la librería timm y carga directa desde Hugging Face mediante `snapshot_download` o la función `load_model`.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multimodal; es exclusivamente un extractor de características visuales.

## Casos de uso

- Monitoreo de poblaciones de gorilas en estado salvaje: el modelo permite procesar automáticamente miles de horas de vídeo de cámaras trampa para identificar individuos y estimar tamaños poblacionales, reduciendo drásticamente el esfuerzo manual de los biólogos de campo.
- Estudios de comportamiento y dinámica social: al asociar embeddings a individuos concretos, los investigadores pueden rastrear movimientos, interacciones y patrones de agrupación a lo largo del tiempo sin intervención humana.
- Conservación y gestión de especies en peligro: la re-identificación precisa facilita el seguimiento de la salud de cada individuo, la detección de cambios demográficos y la evaluación de la efectividad de medidas de protección.
- Transferencia a otros contextos zoológicos: el modelo ha demostrado funcionar en un zoológico (Gorilla-Zoo-Berlin) sin reentrenamiento, lo que lo hace útil para el monitoreo de gorilas en cautividad o en hábitats seminaturales.
- Investigación en aprendizaje métrico y re-identificación de fauna: sirve como punto de partida para experimentos con otras especies o para mejorar el protocolo de evaluación con tracklets (agregación temporal de embeddings).
- Despliegue en pipelines de visión por computadora: al ser un modelo de extracción de características estándar, puede integrarse en sistemas de análisis de vídeo existentes, por ejemplo combinándolo con detectores de objetos para localizar y luego identificar a los gorilas.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card se basan en recuperación k-NN (k=5, distancia euclidiana) con enmascaramiento de entradas de la misma cámara y fecha. Se reportan dos métricas: precisión micro (promedio sobre todas las imágenes) y precisión macro (promedio sobre identidades, que pondera por igual a individuos raramente vistos). También se ofrecen métricas a nivel de tracklet (agregación por promedio de embeddings).

| Protocolo | Dataset | Config | Split | Micro accuracy | Macro accuracy |
|---|---|---|---|---|---|
| Por imagen | Gorilla-SPAC-Wild | face_with_body | test | 0.5299 | 0.4113 |
| Por tracklet | Gorilla-SPAC-Wild | face_with_body | test | 0.6000 | 0.4364 |
| Por imagen | Gorilla-Zoo-Berlin | face_with_body | test | 0.7432 | 0.7355 |
| Por tracklet | Gorilla-Zoo-Berlin | face_with_body | test | 0.8073 | 0.7831 |

Estos resultados corresponden a la evaluación en el dominio de entrenamiento (Gorilla-SPAC-Wild) y a una prueba de transferencia de dominio de cero disparos (Gorilla-Zoo-Berlin). No se han publicado comparaciones con otros modelos de re-identificación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 304,6 millones de parámetros, lo que en fp32 ocupa aproximadamente 1,2 GB. Con precisión fp16 (no documentada pero posible) se reduciría a unos 600 MB. Para una inferencia puntual con batch 1, se estima un consumo de VRAM inferior a 2 GB, por lo que cabe en cualquier GPU moderna con al menos 4 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el modelo se integra con timm y PyTorch. Puede servirse mediante frameworks de inferencia como vLLM (aunque no es un modelo de lenguaje), TorchServe o simplemente con un script Python. No se documenta compatibilidad con llama.cpp ni Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponible en la información proporcionada. Se espera una latencia del orden de decenas de milisegundos por imagen en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

El modelo se basa en el backbone DINOv2-Large, por lo que la comparación natural es con el propio DINOv2-Large original y con otros modelos de re-identificación de fauna. No se dispone de métricas comparativas publicadas en la información disponible, por lo que la comparación se limita a características arquitectónicas.

| Modelo | Parámetros | Embedding | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GorillaWatch-DINOv2-Large | 304,6M | 256 | Fine-tuning con triplet loss en Gorilla-SPAC-Wild | CC-BY-4.0 | Hugging Face |
| facebook/dinov2-large | 304,6M | 1024 (salida del backbone) | Autosupervisado en LVD-142M | Apache-2.0 | Hugging Face |
| robotflowlabs/dinov2-large-int8 | 304,6M (cuantizado INT8) | 1024 | Cuantización del DINOv2 original | no especificada | Hugging Face |

La principal diferencia es que GorillaWatch-DINOv2-Large está específicamente ajustado para la re-identificación de gorilas, mientras que DINOv2 es un extractor de características genérico. El embedding de 256 dimensiones es más compacto que el de 1024 del backbone original, lo que facilita la búsqueda k-NN en galerías grandes.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de gorilas occidentales de llanura en estado salvaje (Gorilla-SPAC-Wild). Su rendimiento en otras subespecies o en condiciones muy diferentes (iluminación, ángulo, oclusión) puede degradarse, aunque la prueba en el zoológico de Berlín sugiere cierta robustez.
- La precisión macro es notablemente inferior a la micro, lo que indica que los individuos con pocas observaciones son más difíciles de identificar correctamente. Esto puede ser un problema en poblaciones pequeñas o con individuos poco fotografiados.
- El preprocesado requerido (redimensionado cuadrado a 518×518 y normalización con media y desviación 0,5) no coincide con el transform por defecto de timm para DINOv2. Usar el transform incorrecto produce embeddings erróneos, como advierte explícitamente la documentación.
- La identificación se basa en k-NN con k=5 y distancia euclidiana; no se han explorado otros umbrales o métricas de distancia en la información disponible.
- No se han publicado resultados de sesgos o alucinaciones (concepto no aplicable a un extractor de características), pero como todo modelo de visión, puede verse afectado por variaciones en la calidad de imagen, condiciones de luz o ángulos de cámara.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se recomienda revisar los términos exactos y las posibles restricciones sobre los datos de entrenamiento (Gorilla-SPAC-Wild).
- El modelo no incluye un detector de objetos; para aplicaciones de extremo a extremo es necesario combinarlo con un sistema de detección previo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/gorilla-watch/GorillaWatch-DINOv2-Large)
- [Artículo en arXiv (2512.07776)](https://arxiv.org/abs/2512.07776)
- [Página del proyecto GorillaWatch](https://gorilla-watch.github.io/)
- [Repositorio de código en GitHub](https://github.com/gorilla-watch/gorillawatch)
- [Dataset Gorilla-SPAC-Wild](https://huggingface.co/datasets/gorilla-watch/Gorilla-SPAC-Wild)
- [Dataset Gorilla-Zoo-Berlin](https://huggingface.co/datasets/gorilla-watch/Gorilla-Zoo-Berlin)
- [Backbone original DINOv2-Large](https://huggingface.co/facebook/dinov2-large)
