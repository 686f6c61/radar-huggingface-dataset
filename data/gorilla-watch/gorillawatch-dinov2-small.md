# gorilla-watch/GorillaWatch-DINOv2-Small

## Resumen

GorillaWatch-DINOv2-Small es un modelo de extracción de características de imagen especializado en la re-identificación facial de gorilas occidentales de llanura, desarrollado por el equipo de GorillaWatch en el contexto del artículo «GorillaWatch: An Automated System for In-the-Wild Gorilla Re-Identification and Population Monitoring» (WACV 2026). El modelo parte de un backbone DINOv2 (`vit_small_patch14_dinov2.lvd142m`) y se ajusta finamente con una función de pérdida de tripletas con hard mining sobre el dataset Gorilla-SPAC-Wild, proyectando las imágenes a un espacio de embeddings de 256 dimensiones. La identificación se realiza mediante búsqueda k-NN (k=5) con distancia euclidiana sobre una galería de embeddings, sin vocabulario fijo de identidades, lo que permite generalizar a individuos no vistos durante el entrenamiento.

El modelo resuelve el problema del monitoreo de poblaciones de gorilas en libertad a partir de cámaras trampa, una tarea que históricamente requería un esfuerzo manual enorme para re-identificar individuos en vastos archivos de imágenes. Su relevancia actual radica en que combina un backbone de fundación (DINOv2) con un ajuste especializado para un dominio biológico concreto, demostrando que es posible obtener buenos resultados con un modelo pequeño (22,2 millones de parámetros) y una resolución de entrada de 518×518 píxeles. El modelo se distribuye bajo licencia CC-BY-4.0 y está disponible en Hugging Face con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small) con backbone DINOv2 (`vit_small_patch14_dinov2.lvd142m`) y cabecera de proyección a 256 dimensiones |
| Parametros totales | 22.154.752 (22,2 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16 según el checkpoint) |
| Idiomas soportados | No aplica (modelo de visión, sin soporte de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza como backbone el checkpoint preentrenado `vit_small_patch14_dinov2.lvd142m` de DINOv2, un Vision Transformer de tamaño pequeño con parches de 14×14 píxeles. Sobre este backbone se añade una capa de proyección que reduce la representación a un embedding de 256 dimensiones. La resolución de entrada es de 518×518 píxeles, con un preprocesamiento específico: resize cuadrado (que solo preserva la relación de aspecto si la imagen de entrada ya es cuadrada, como ocurre en los datasets utilizados) y normalización con media y desviación estándar iguales a 0,5, en lugar de las estadísticas ImageNet que usa por defecto timm. Usar el transform por defecto de timm produce embeddings incorrectos.

El entrenamiento se realizó mediante ajuste fino del backbone DINOv2 con una función de pérdida de tripletas online con hard mining, distancia euclidiana y margen de 0,647. Se utilizó el optimizador AdamW (β=0,9/0,999, ε=1e-7), tasa de aprendizaje inicial de 1,9e-7 con decaimiento coseno hasta 1e-7, batch size de 8 (efectivo de 48 mediante 6 pasos de acumulación de gradiente), regularización L2 de 0,0059 y L2-SP de 1,3e-5. Se entrenó durante un máximo de 100 épocas, conservando el checkpoint con mejor pérdida de validación, con precisión mixta AMP (fp16 autocast, pesos maestros en fp32) y semilla 42. Los datos de entrenamiento provienen del dataset Gorilla-SPAC-Wild, concretamente de la configuración `face_with_body`. La identificación se realiza por recuperación k-NN (k=5) con distancia euclidiana contra una galería de embeddings, y el protocolo de evaluación enmascara las entradas de la galería que provienen del mismo encuentro (misma cámara en la misma fecha) para evitar coincidencias triviales.

## Capacidades

- Extracción de características de imagen para re-identificación facial de gorilas: genera embeddings de 256 dimensiones que representan de forma compacta la identidad del individuo.
- Re-identificación mediante k-NN: dado un embedding de consulta, se recuperan los k vecinos más cercanos en una galería de embeddings precomputados, permitiendo asignar identidad sin clasificación fija.
- Generalización a individuos no vistos: al no tener un vocabulario fijo de identidades, el modelo puede reconocer gorilas que no aparecieron durante el entrenamiento, siempre que exista una galería de referencia.
- Transferencia de dominio cero-shot: aunque entrenado en el dataset Gorilla-SPAC-Wild (imágenes de cámaras trampa en la naturaleza), muestra resultados razonables en el dataset Gorilla-Zoo-Berlin (zoológico, con iluminación, recintos y cámaras diferentes), lo que sugiere cierta robustez a cambios de dominio.
- Aprendizaje métrico: la pérdida de tripletas con hard mining optimiza directamente la separación entre identidades en el espacio euclidiano.
- Integración con timm: el modelo se carga mediante la librería `timm` y expone un método `get_transform()` que devuelve el preprocesamiento correcto.
- No requiere clasificación supervisada: el modelo no predice una clase, sino que produce embeddings comparables entre sí, lo que facilita su uso en sistemas de recuperación y seguimiento.

## Casos de uso

- Monitoreo de poblaciones de gorilas en libertad: el modelo permite re-identificar individuos a partir de imágenes de cámaras trampa, sustituyendo el esfuerzo manual de comparar fotografías. Se puede integrar en un pipeline de detección previa (p. ej., con un detector de objetos) y luego extraer embeddings de cada cara detectada para compararlos contra una galería histórica.
- Estimación de tamaño poblacional: aplicando el modelo a secuencias de cámaras trampa, se pueden agrupar las detecciones por identidad y contar el número de individuos únicos en una región, lo que ayuda a monitorizar poblaciones críticamente amenazadas.
- Seguimiento de movimientos y comportamiento: al re-identificar al mismo individuo en diferentes cámaras y fechas, se pueden estudiar patrones de desplazamiento, territorialidad y asociaciones sociales sin intervención humana.
- Estudios de demografía y dinámica de grupos: el modelo permite construir historiales de avistamientos por individuo, facilitando análisis de natalidad, mortalidad y cambios en la composición de los grupos a lo largo del tiempo.
- Validación de sistemas de monitoreo automatizado: como componente de un sistema integral (GorillaWatch), el modelo puede evaluarse en términos de precisión de re-identificación y compararse con métodos manuales, sirviendo de referencia para futuros desarrollos.
- Investigación en aprendizaje métrico aplicado a fauna: el modelo sirve como punto de partida para experimentos de fine-tuning con otras especies o para estudiar la transferencia entre dominios (naturaleza vs. zoológico), dado su tamaño reducido y su facilidad de uso con la librería timm.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes. La métrica de precisión se calcula mediante k-NN (k=5, distancia euclidiana), enmascarando las entradas de la galería del mismo encuentro (misma cámara y fecha). La precisión macro promedia por identidad, dando el mismo peso a individuos raramente vistos que a los frecuentes.

| Dataset | Protocolo | Micro accuracy | Macro accuracy |
|---|---|---|---|
| Gorilla-SPAC-Wild (test, `face_with_body`) | Por imagen | 0,3769 | 0,3019 |
| Gorilla-SPAC-Wild (test, `face_with_body`) | Por tracklet (pooling promedio) | 0,4667 | 0,3443 |
| Gorilla-Zoo-Berlin (test, `face_with_body`) | Por imagen | 0,6919 | 0,673 |
| Gorilla-Zoo-Berlin (test, `face_with_body`) | Por tracklet (pooling promedio) | 0,7418 | 0,7163 |

Los resultados en Gorilla-Zoo-Berlin son más altos que en Gorilla-SPAC-Wild a pesar de ser un dominio no visto, lo que el autor atribuye a la menor cantidad de individuos distintos en el zoológico y a condiciones de captura más controladas. No se han publicado comparaciones con otros modelos de re-identificación de gorilas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,2 millones de parámetros, el modelo ocupa aproximadamente 89 MB en fp32 y 44 MB en fp16. La memoria necesaria para una inferencia con batch de 1 y resolución 518×518 es inferior a 1 GB, incluso en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4090 o A100 funcionan sin problemas. También puede ejecutarse en CPU con tiempos de inferencia razonables (del orden de decenas de milisegundos por imagen en hardware moderno).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual e incluso en dispositivos con memoria compartida (p. ej., Apple Silicon con Metal).
- Opciones de despliegue: el modelo se carga mediante la API de Hugging Face Hub con `snapshot_download` y el módulo `modeling.py` incluido en el repositorio. También es compatible con la librería `timm` si se aplica el transform correcto. No se han publicado integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de visión, no de lenguaje.
- Latencia y throughput estimados: no se han publicado cifras oficiales. Dado el tamaño del modelo y la resolución de entrada, se puede esperar una latencia de inferencia de unos pocos milisegundos en GPU moderna y de decenas de milisegundos en CPU para un solo lote.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de re-identificación de gorilas o de fauna silvestre. Como referencia, se puede comparar con el backbone base DINOv2 sin ajuste fino:

| Modelo | Parametros | Resolucion | Embedding | Metodo de identificacion | Licencia |
|---|---|---|---|---|---|
| GorillaWatch-DINOv2-Small | 22,2 M | 518×518 | 256 | k-NN (k=5, Euclidea) | CC-BY-4.0 |
| DINOv2 ViT-Small (sin fine-tune) | 22,2 M | 518×518 | 384 (salida del backbone) | k-NN sobre características brutas | Apache-2.0 (DINOv2) |

El fine-tuning con pérdida de tripletas mejora sustancialmente la separación entre identidades respecto al backbone preentrenado, como demuestran los resultados en Gorilla-SPAC-Wild. No hay modelos comparables de re-identificación de gorilas de acceso público en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en gorilas occidentales de llanura; no es aplicable a otras especies sin un nuevo fine-tuning.
- El preprocesamiento es crítico: requiere resize cuadrado a 518×518 y normalización con media=desviación=0,5. Usar el transform por defecto de timm produce embeddings incorrectos.
- La precisión en el dominio natural (Gorilla-SPAC-Wild) es modesta (micro accuracy de 0,3769 por imagen), lo que puede limitar su uso en aplicaciones donde se requiera alta fiabilidad sin verificación humana.
- La identificación depende de la calidad de la galería de referencia: si la galería contiene pocas imágenes por individuo o está desbalanceada, la precisión macro puede verse afectada.
- El protocolo de evaluación enmascara entradas del mismo encuentro; en aplicaciones reales, si no se aplica este enmascaramiento, las métricas podrían inflarse artificialmente.
- No hay información sobre sesgos específicos, pero al entrenarse con datos de cámaras trampa de una región concreta, puede haber sesgos geográficos o de iluminación.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es recomendable revisar los términos completos de la licencia.
- El modelo no genera texto ni realiza razonamiento multimodal; es únicamente un extractor de características visuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gorilla-watch/GorillaWatch-DINOv2-Small
- Dataset Gorilla-SPAC-Wild: https://huggingface.co/datasets/gorilla-watch/Gorilla-SPAC-Wild
- Dataset Gorilla-Zoo-Berlin: https://huggingface.co/datasets/gorilla-watch/Gorilla-Zoo-Berlin
- Articulo en arXiv: https://arxiv.org/abs/2512.07776
- Version HTML del articulo: https://arxiv.org/html/2512.07776
- PDF del articulo: https://arxiv.org/pdf/2512.07776
- Repositorio GitHub del proyecto: https://github.com/gorilla-watch/gorillawatch
- Pagina del proyecto: https://gorilla-watch.github.io/
