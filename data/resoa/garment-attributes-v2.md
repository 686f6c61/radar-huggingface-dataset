# resoa/garment-attributes-v2

## Resumen

`resoa/garment-attributes-v2` es un modelo de clasificación de imágenes multi-etiqueta especializado en la detección de atributos de construcción de prendas de vestir. Desarrollado por el usuario resoa, se basa en un codificador de visión SigLIP2-base (93,1 millones de parámetros) con una cabeza de clasificación que predice 218 atributos definidos por el dataset Fashionpedia, como tipo de manga, cuello, bolsillos o solapas. Es la segunda versión de un modelo anterior (`resoa/garment-attributes`) y su principal novedad es la incorporación de aumento de datos mediante jitter de escala y padding variable, lo que mejora la robustez frente a diferentes recortes de la prenda.

El modelo resuelve el problema de etiquetado automático de prendas a partir de recortes de imagen, una tarea relevante para control de calidad en fabricación textil, comercio electrónico y sistemas de búsqueda visual. Su relevancia actual radica en que ofrece una mejora medible y reproducible sobre la versión anterior (+11,4% de macro-mAP relativo) con la misma arquitectura y coste computacional, y en que documenta de forma transparente tanto las ganancias como las regresiones por atributo. Está publicado bajo licencia Apache 2.0 y es compatible con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-base (vision encoder) + cabeza de clasificación lineal |
| Parametros totales | 93.051.866 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza un codificador de visión SigLIP2-base preentrenado, al que se añade una cabeza de clasificación lineal que produce una salida multi-etiqueta de 218 logits. La activación final es sigmoide, y cada atributo se predice de forma independiente. No se trata de un modelo generativo ni multimodal: solo procesa imágenes.

El entrenamiento se realizó sobre 156.937 recortes de prendas procedentes de Fashionpedia train2020, filtrando atributos con al menos 100 instancias de entrenamiento y recortes de tamaño mínimo 48 píxeles. Se usaron 4 épocas, batch de 32, optimizador AdamW con learning rate 2e-5, programación coseno y precisión bf16. El tiempo total de entrenamiento fue de 1,68 horas en una Jetson AGX Orin.

La innovación principal de esta versión frente a v1 es el aumento de datos: se entrena con un padding del 25% alrededor de la caja delimitadora (frente al 8% de v1) y un jitter aleatorio de ±10% en ese padding, además de volteo horizontal. Una ablación separada de ambos cambios mostró que el jitter de escala contribuye el 61% de la mejora total, mientras que el valor de padding fijo solo aporta el 39%. Esto hace que el modelo sea más tolerante a recortes más o menos ajustados en inferencia.

## Capacidades

- Clasificación multi-etiqueta de 218 atributos de construcción de prendas (tipo de manga, cuello, bolsillos, solapas, etc.).
- Predicción independiente por atributo con salida sigmoide (umbral típico 0,5).
- Robustez a variaciones en el recorte de entrada gracias al jitter de escala entrenado.
- Inferencia sobre recortes de una sola prenda o parte de prenda (no escenas completas).
- Compatible con la API estándar de Transformers (`AutoModelForImageClassification`).
- No soporta tool calling, generación de texto, razonamiento ni capacidades multimodales más allá de visión.

## Casos de uso

- Control de calidad en fabricación textil: el modelo puede inspeccionar recortes de prendas en línea de producción y detectar atributos como tipo de costura o presencia de bolsillos, ayudando a verificar especificaciones de diseño.
- Etiquetado automático en comercio electrónico: al recibir una imagen de una prenda, el sistema genera automáticamente etiquetas de atributos (manga larga, cuello redondo, etc.) para mejorar la ficha de producto y la búsqueda interna.
- Búsqueda visual por atributos: integrado en un motor de recomendación, permite filtrar catálogos por características específicas (por ejemplo, "chaqueta con solapa" o "vestido sin mangas") a partir de una imagen.
- Reciclaje textil: en plantas de clasificación de ropa usada, el modelo puede identificar atributos de construcción para separar prendas por tipo y facilitar su reutilización o reciclaje.
- Automatización de inventario en tiendas físicas: mediante cámaras que capturan recortes de prendas, el sistema actualiza el stock y las características de los artículos sin intervención manual.
- Asistencia al diseño de moda: los equipos de diseño pueden analizar tendencias a partir de imágenes de pasarela o catálogos, extrayendo atributos de construcción de forma masiva.

## Benchmarks y rendimiento

El modelo se evaluó en Fashionpedia val2020 siguiendo el protocolo del modelo padre (3.711 instancias, 212 etiquetas evaluables, recorte mínimo de 48 píxeles). Los resultados comparan v1 y v2 con el mismo harness de medición:

| Padding de evaluacion | v1 macro-mAP | v2 macro-mAP |
|---|---|---|
| 0.08 | 0.4229 | 0.4592 |
| 0.25 | 0.4355 | 0.4850 |
| 0.50 | 0.3842 | 0.4647 |

Mejora mejor-a-mejor: +0.0492 ± 0.0062, con P(v2 mejor) = 1.00. El micro-F1 pasó de 0.7006 a 0.7244. El modelo gana en todos los paddings de evaluación, no solo en el de entrenamiento.

La ganancia se concentra en atributos con menos soporte de entrenamiento: para etiquetas con 100–300 ejemplos, el incremento medio de AP fue de +0.0834, mientras que para más de 5.000 ejemplos fue de +0.0197. Se reportan regresiones reales, como `tuxedo (jacket)` (1.000→0.200) o `collarless` (0.688→0.511), y se incluye un archivo `per_attribute_v2.json` con los valores por atributo.

Nota de medición: el harness reproduce el protocolo del modelo padre, pero puntúa v1 en 0.4229 frente al 0.4417 publicado, una diferencia de ~2% atribuible a detalles de redondeo o redimensionado. Las comparaciones entre v1 y v2 usan el mismo harness, por lo que los deltas son fiables, pero los valores absolutos pueden estar ~2% por debajo de los publicados originalmente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 93M parámetros, lo que en fp32 ocupa ~372 MB. En bf16 o fp16, ~186 MB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (serie 10 en adelante), incluyendo RTX 3060, RTX 4090, o incluso Jetson AGX Orin (usada para entrenamiento).
- Despliegue: compatible con Transformers, ONNX Runtime, y servidores de inferencia como vLLM (aunque no es un modelo de lenguaje). También puede exportarse a TorchScript o TensorRT.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser un modelo de visión de tamaño medio, la inferencia en GPU moderna es del orden de milisegundos por imagen. En CPU puede ser viable para lotes pequeños.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de clasificación de atributos de moda en la información proporcionada. La única comparación disponible es con la versión anterior del mismo autor:

| Modelo | Parametros | Contexto | macro-mAP (padding 0.25) | Licencia |
|---|---|---|---|---|
| resoa/garment-attributes (v1) | 93.1M | no aplica | 0.4355 | Apache 2.0 |
| resoa/garment-attributes-v2 | 93.1M | no aplica | 0.4850 | Apache 2.0 |

Ambos comparten arquitectura, espacio de etiquetas e hiperparámetros; la diferencia es el aumento de datos. No se han encontrado otros modelos comparables en la búsqueda web.

## Limitaciones y advertencias

- El modelo no está calibrado: las salidas sigmoide no representan probabilidades reales, solo puntuaciones de confianza relativas.
- Está entrenado exclusivamente con recortes de prendas. Si se le presenta una escena completa, el rendimiento cae drásticamente (solo retiene ~14% del mAP de recorte entrenado). Se recomienda usar un sistema de recorte previo, como el `garment-crop-gate-nano` del mismo autor.
- El dominio de entrenamiento es fotografía de prendas usadas en la calle. Imágenes de flat-lay, fotografía de fábrica o prendas en maniquí pueden estar fuera de dominio.
- El espacio de etiquetas incluye tanto prendas completas como partes de prendas (mangas, bolsillos, cuellos). Un atributo como `welt (pocket)` se aprendió de recortes de bolsillos, no de prendas que los contienen. Los atributos "nickname" rara vez co-ocurren (media 1.012 por instancia).
- No puede predecir contenido de fibra, GSM, medidas ni color.
- Existen regresiones documentadas en algunos atributos concretos; se recomienda revisar `per_attribute_v2.json` antes de usar el modelo en producción para atributos críticos.
- La licencia Apache 2.0 permite uso comercial, pero el dataset Fashionpedia puede tener sus propias restricciones; conviene verificar los términos de uso del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/resoa/garment-attributes-v2
- Versión anterior (v1): https://huggingface.co/resoa/garment-attributes
- Repositorio de archivos de v1: https://huggingface.co/resoa/garment-attributes/tree/main
- Modelo complementario de recorte (gate): https://huggingface.co/resoa/garment-crop-gate-nano
- Dataset Fashionpedia: https://huggingface.co/datasets/Fashionpedia (referenciado en la model card)
