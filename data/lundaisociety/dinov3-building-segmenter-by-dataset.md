# LundAISociety/dinov3-building-segmenter-by-dataset

## Resumen

El modelo `LundAISociety/dinov3-building-segmenter-by-dataset` es un segmentador de instancias de edificios en imágenes de teledetección de muy alta resolución (VHR), desarrollado por LundAISociety. No es un modelo de lenguaje ni un modelo generativo multimodal: su arquitectura combina un backbone de visión DINOv3 ViT-S/16 congelado con un decoder entrenable de 2,25 millones de parámetros que predice semillas interiores de edificio, perímetros y un tercer mapa auxiliar, que después se convierten en instancias mediante un algoritmo de watershed implementado en `postprocess.py`.

Lo relevante de este repositorio no es el modelo en sí, sino su planteamiento experimental: se publica como una línea de versiones cuyo objetivo es medir el efecto de los cambios en el *dataset* (el conjunto `LundAISociety/hot-building-segmentation`), manteniendo arquitectura, función de pérdida, hiperparámetros, semilla y código de entrenamiento idénticos entre versiones. Cada carpeta del repositorio contiene el checkpoint de la versión del dataset correspondiente. A partir de la versión v0.3 se rompe esa comparabilidad limpia, porque además del dataset cambia la receta de entrenamiento (aumento por ventanas, pesos de proyecto, uso de todas las particiones y agrupaciones de imágenes más nítidas).

El repositorio ocupa 0,2 GB, usa PyTorch como librería y se distribuye bajo licencia Apache 2.0. La model card reporta métricas de validación propias de cada versión (PQ de validación entre 0,394 y 0,541) y una evaluación externa sobre 400 recortes revisados manualmente del benchmark `nilsho01/vhr-buildings-benchmark-v1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (DINOv3 ViT-S/16 congelado) más decoder entrenable; segmentación de instancias resuelta con watershed |
| Parámetros totales | no disponible (la model card solo indica que el decoder entrenable tiene 2,25 M de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de visión; la entrada son imágenes procesadas por parches, el backbone es ViT-S/16) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo de segmentación de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de PyTorch (un directorio por versión de dataset; la model card no menciona safetensors ni GGUF) |
| Tamaño del repositorio | 0,2 GB |
| Librería | PyTorch |
| Dataset de entrenamiento | LundAISociety/hot-building-segmentation |
| Salidas del modelo | Semillas interiores, perímetro y un tercer mapa (presas de contacto, campo vectorial o profundidad según variante) |
| Idiomas de la documentación | inglés (model card) |

## Arquitectura y entrenamiento

La arquitectura es un backbone DINOv3 ViT-S/16 congelado sobre el que se entrena un decoder pequeño de 2,25 M de parámetros. El decoder produce tres tipos de mapa: semillas del interior de cada edificio, el perímetro del edificio y un tercer canal que varía según la versión (v0.0 y v0.1 usan presas de contacto entre edificios que se tocan; v0.2 añade dos variantes alternativas, descritas más abajo). La conversión de mapas a instancias se hace con un watershed (`postprocess.py`, y `postprocess_v02.py` para las variantes de v0.2), de modo que la salida final son instancias de edificio, no una simple máscara binaria. El código de inferencia está en `model.py` y `model_v02.py`.

En las versiones v0.0, v0.1 y v0.2 la receta es idéntica (arquitectura, pérdida, hiperparámetros y semilla) y solo cambia la versión del dataset, con entre 57.335 y 57.890 teselas de entrenamiento y unas 7.200 de validación. Las tres filas de v0.2 comparten dataset y receta, y solo difieren en el tercer canal de salida: `v0.2-contact` usa presas de contacto, `v0.2-vector` predice las componentes x e y del vector unitario desde cada píxel del edificio hacia su punto más lejano del contorno (una versión simplificada de los flujos de Cellpose, cuarto canal de salida) y `v0.2-depth` predice la distancia al contorno normalizada a 1 en el centro. La versión v0.3 cambia también el entrenamiento: elimina del dataset los proyectos de huracanes de México y los proyectos 22810 y 16871, trata las grandes regiones blancas sin datos como relleno, y entrena con todas las particiones (train, validación y test, 69.973 teselas), de modo que no deja nada reservado. Los pesos se seleccionan por la menor pérdida de validación en cada versión (épocas 14, 15, 14, 14, 10 y 15 respectivamente).

## Capacidades

- Segmentación de instancias de edificios en imágenes aéreas y satelitales de muy alta resolución, con salida por edificio individual en lugar de máscara binaria.
- Predicción de semillas interiores y perímetros, que el watershed usa para separar edificios contiguos.
- Separación de edificios en contacto mediante presas de contacto (variantes v0.0, v0.1 y v0.2-contact).
- Alternativa de separación mediante campo vectorial hacia el punto más profundo del edificio (v0.2-vector y v0.3).
- Alternativa de separación mediante mapa de profundidad al contorno (v0.2-depth).
- Inferencia con backbone congelado, lo que reduce el coste de entrenamiento y el número de parámetros ajustables.
- Ajuste de postprocesado por versión: cada carpeta incluye un `postprocess.json` con el tipo de tercer canal y los parámetros del watershed.
- Uso como banco de pruebas reproducible para evaluar versiones de un dataset de anotación de edificios.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades de visión general: no es un modelo de propósito general.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponibles (no aplica).
- Capacidades especiales (modo de razonamiento, audio, vídeo): no disponibles.

## Casos de uso

- Actualización de cartografía de edificios: el modelo genera instancias de edificio sobre ortoimágenes recientes, que pueden incorporarse a bases de datos topográficas o catastrales tras revisión humana, reduciendo el trabajo de digitalización manual.
- Pre-etiquetado para mapeo colaborativo tipo HOT/OpenStreetMap: las instancias propuestas sirven como borrador para personas voluntarias, que corrigen perímetros y fusiones en lugar de dibujar cada edificio desde cero.
- Evaluación de la calidad de un dataset de anotación: al mantener constante la receta y cambiar solo la versión del dataset, permite atribuir mejoras o degradaciones de métricas a cambios en las etiquetas (por ejemplo, la comparación v0.0 frente a v0.1 con +0,008 de F1 por píxel y +0,045 de PQ por componente).
- Estudio de edificios en contacto en entornos densos: las presas de contacto de `v0.2-contact` y el campo vectorial de `v0.2-vector` permiten analizar cómo se separan manzanas compactas donde una máscara binaria fusionaría edificios.
- Respuesta ante catástrofes: el dataset asociado incluye proyectos de huracanes (usados en v0.0 a v0.2 y excluidos en v0.3), de modo que el modelo puede emplearse para inventariar edificaciones en zonas afectadas antes y después de un evento.
- Estimación de exposición y riesgo: la extracción de huellas de edificio por instancia alimenta modelos de exposición para seguros, inundaciones o planificación de emergencias a escala de barrio.
- Planificación urbana y análisis de densidad: el recuento y la geometría de instancias por tesela permiten calcular densidad construida, ocupación del suelo y patrones de crecimiento urbano.
- Investigación en segmentación de instancias en teledetección: la línea de versiones, con receta fija y resultados publicados por versión, sirve como referencia controlada para comparar estrategias de postprocesado (contacto, vector, profundidad) sin reentrenar el backbone.

## Benchmarks y rendimiento

Evaluación de validación reportada por la model card (PQ de validación medido sobre la partición de validación de cada versión, primeras 2.000 teselas; la propia model card advierte que **no es comparable entre versiones**):

| Versión | Dataset | Teselas train / val | Época conservada | PQ val | SQ / RQ val |
|---|---|---|---|---|---|
| v0.0 | v0.0 (`61b14108`) | 57.890 / 7.237 | 14 | 0,493 | 0,742 / 0,664 |
| v0.1 | v0.1 (`d0efdc0f`) | 57.335 / 7.178 | 15 | 0,491 | 0,745 / 0,660 |
| v0.2-contact | v0.2 (`2baa4566`) | 57.890 / 7.237 | 14 | 0,504 | 0,753 / 0,669 |
| v0.2-vector | v0.2 (`2baa4566`) | 57.890 / 7.237 | 14 | 0,541 | 0,760 / 0,712 |
| v0.2-depth | v0.2 (`2baa4566`) | 57.890 / 7.237 | 10 | 0,394 | 0,672 / 0,587 |
| v0.3 | v0.3 (`20fedc31`) | 69.973 (train + validación + test) / 7.237 (dentro de los datos de entrenamiento) | 15 | 0,540 | 0,750 / 0,720 |

Las tres filas de v0.2 son comparables entre sí (mismo dataset y misma receta, solo cambia el tercer canal). v0.3 entrenó con sus propias teselas de validación, por lo que su PQ de validación no está reservado.

Evaluación externa sobre `nilsho01/vhr-buildings-benchmark-v1` (400 recortes revisados manualmente):

| Modelo | F1 por píxel | IoU por píxel | PQ por componente | PQ estricto | Edificios encontrados / declarados | Recortes vacíos con detección |
|---|---|---|---|---|---|---|
| hotv5 (referencia, otra arquitectura) | 0,835 | 0,717 | 0,267 | 0,382 | 65 % | 4/100 |
| nilsho01 U-Net EfficientNet-B4 (referencia, otra arquitectura) | 0,844 | 0,729 | 0,463 | 0,450 | 85 % | 17/100 |
| v0.0 (este repositorio) | 0,835 | 0,717 | 0,309 | 0,355 | 56 % | 2/100 |
| v0.1 (este repositorio) | 0,843 | 0,728 | 0,354 | 0,403 | 64 % | 3/100 |
| v0.2-contact (este repositorio) | 0,841 | 0,725 | 0,339 | 0,386 | 59 % | 3/100 |
| v0.2-vector (este repositorio) | 0,841 | 0,726 | 0,315 | 0,448 | 75 % | 4/100 |
| v0.2-depth (este repositorio) | 0,821 | 0,697 | 0,374 | 0,377 | 65 % | 7/100 |
| v0.3 (este repositorio) | 0,829 | 0,708 | 0,372 | 0,444 | 78 % | 2/100 |

Advertencia de la propia model card: 393 de los 400 recortes del benchmark están en los datos de entrenamiento de v0.3 (entre 396 y 400 en las demás versiones), por lo que estas cifras están contaminadas por fuga de datos. El desglose por banda, región y fuente de etiqueta está en los ficheros `v*/benchmark.json` de cada carpeta. La comparación v0.1 frente a v0.0 supone +0,008 de F1 por píxel, +0,045 de PQ por componente y +0,049 de PQ estricto. Los ficheros `config.json` de v0.0 y v0.1 usan los nombres antiguos v0 y v1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (la model card no publica cifras de memoria).
- GPU recomendadas: no disponible. El repositorio combina un backbone ViT-S/16 (modelo de visión de talla pequeña) con un decoder de 2,25 M de parámetros y un repositorio de 0,2 GB, por lo que el peso de los parámetros es reducido, pero no hay cifras publicadas de VRAM ni de GPU empleadas en la evaluación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño descrito (ViT-S/16 más decoder pequeño) es previsible que quepa en GPU de consumo, pero se trata de una inferencia no verificada con datos del autor.
- Opciones de despliegue: PyTorch, ejecutando `model.py` (o `model_v02.py` para las variantes de v0.2) junto con `postprocess.py` / `postprocess_v02.py` y el `postprocess.json` de la carpeta correspondiente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de segmentación de imagen.
- Latencia y throughput: no disponibles.
- Precisión numérica y cuantizaciones soportadas: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | PQ por componente (benchmark) | PQ estricto (benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| v0.2-vector (este repositorio) | DINOv3 ViT-S/16 congelado + decoder de 2,25 M | no disponible (decoder: 2,25 M) | no disponible | 0,315 | 0,448 | Apache 2.0 | HuggingFace, repo de 0,2 GB |
| v0.3 (este repositorio) | DINOv3 ViT-S/16 congelado + decoder de 2,25 M | no disponible (decoder: 2,25 M) | no disponible | 0,372 | 0,444 | Apache 2.0 | HuggingFace |
| nilsho01 U-Net EfficientNet-B4 | U-Net con backbone EfficientNet-B4 | no disponible | no disponible | 0,463 | 0,450 | no disponible | HuggingFace (`nilsho01/unet-effb4-dist3-buildings`) |
| hotv5 | otra arquitectura (no detallada) | no disponible | no disponible | 0,267 | 0,382 | no disponible | referencia citada en la model card, sin enlace |

Frente a las dos referencias, las versiones de este repositorio quedan por debajo del U-Net EfficientNet-B4 en PQ por componente y empatan o superan ligeramente a hotv5 en esa métrica, mientras que en PQ estricto v0.2-vector (0,448) y v0.3 (0,444) están al nivel del U-Net (0,450). Destaca también el bajo número de detecciones en recortes vacíos (2 de 100 en v0.0 y v0.3) frente a las 17 de 100 del U-Net, aunque con una tasa de edificios encontrados inferior (56 % en v0.0 y 78 % en v0.3, frente al 85 % del U-Net).

## Limitaciones y advertencias

- Fuga de datos en la evaluación: 393 de los 400 recortes del benchmark están incluidos en los datos de entrenamiento de v0.3 (entre 396 y 400 en las demás versiones), por lo que las métricas del benchmark no son una medida limpia de generalización.
- PQ de validación no comparable entre versiones: cada versión se evalúa sobre su propia partición de validación. Solo las tres filas de v0.2 son comparables entre sí.
- v0.3 no deja datos reservados: entrenó con train, validación y test, de modo que su PQ de validación no está fuera de muestra.
- Rendimiento modesto en instancias: el PQ por componente en el benchmark externo oscila entre 0,267 y 0,463 según el modelo, y el PQ estricto entre 0,355 y 0,450; la calidad de separación de instancias es claramente inferior a la de la segmentación por píxel (F1 en torno a 0,82-0,84).
- Recuperación incompleta: la tasa de edificios encontrados varía entre el 56 % (v0.0) y el 85 % (U-Net de referencia), lo que implica omisiones apreciables de edificios reales.
- Falsos positivos en zonas sin edificios: se documentan entre 2 y 7 detecciones sobre 100 recortes vacíos en las versiones analizadas.
- Una segunda variante de profundidad, entrenada con la receta de distancia con signo de dinov3-hot, obtuvo un PQ de 0,20 sobre el dataset completo frente a 0,35 y no se incluyó en el repositorio.
- Postprocesado dependiente de configuración: los parámetros del watershed de `v0.2-contact` proceden de los valores por defecto (su barrido solo ganó 0,002 PQ y empeoró en el benchmark), de modo que el ajuste óptimo puede variar según el dominio de aplicación.
- Idiomas y capacidades de lenguaje: no aplica, pero conviene subrayar que el modelo no genera texto ni admite instrucciones en lenguaje natural.
- Sesgos geográficos y de fuente de anotación: el dataset se compone de proyectos de mapeo humanitario de localizaciones específicas y el propio autor elimina proyectos concretos (huracanes de México, proyectos 22810 y 16871) en v0.3, lo que indica dependencia del dominio cubierto por los datos.
- Licencia: Apache 2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios; no se declaran restricciones adicionales en la información disponible.
- Uso en producción: al no publicarse cifras de latencia, throughput, VRAM ni cuantizaciones soportadas, no es posible dimensionar el despliegue con los datos de la model card; se recomienda validar sobre datos propios antes de integrarlo en un flujo crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LundAISociety/dinov3-building-segmenter-by-dataset
- Dataset de entrenamiento y versiones: https://huggingface.co/datasets/LundAISociety/hot-building-segmentation
- Versión v0.0 del dataset: https://huggingface.co/datasets/LundAISociety/hot-building-segmentation/tree/v0.0
- Versión v0.1 del dataset: https://huggingface.co/datasets/LundAISociety/hot-building-segmentation/tree/v0.1
- Versión v0.2 del dataset: https://huggingface.co/datasets/LundAISociety/hot-building-segmentation/tree/v0.2
- Versión v0.3 del dataset: https://huggingface.co/datasets/LundAISociety/hot-building-segmentation/tree/v0.3
- Benchmark de edificios VHR: https://huggingface.co/datasets/nilsho01/vhr-buildings-benchmark-v1
- Modelo de referencia U-Net EfficientNet-B4: https://huggingface.co/nilsho01/unet-effb4-dist3-buildings
- Ficheros de código citados en el repositorio: `model.py`, `model_v02.py`, `postprocess.py`, `postprocess_v02.py`, `postprocess.json` y `v*/benchmark.json` (incluidos en el propio repositorio de HuggingFace)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo.
