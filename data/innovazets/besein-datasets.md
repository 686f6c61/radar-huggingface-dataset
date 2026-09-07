# innovazets/besein-datasets

## Resumen

`innovazets/besein-datasets` no es un modelo de inteligencia artificial, sino un repositorio de datos de respaldo (backup) creado por el usuario `innovazets`. Se publicó el 6 de septiembre de 2026 como una instantánea tomada desde un Mac, con un tamaño total de 0.3 GB. El propósito declarado es servir como copia de seguridad de los datos utilizados en un pipeline de análisis de fútbol, espejando el repositorio de pesos `innovazets/besein-models`.

El contenido incluye un dataset de pelotas con 1.237 frames reales (imágenes y etiquetas), un archivo comprimido con 18.834 etiquetas GT de SportsMOT (13.664 de entrenamiento y 5.170 de validación), y otros archivos de etiquetas más antiguos. No se trata de un modelo entrenado ni de un artefacto de inferencia, sino de un conjunto de datos y etiquetas pensados para reconstruir pipelines de entrenamiento de modelos de visión por computador en el ámbito deportivo. Su relevancia radica en que permite reproducir y reentrenar modelos de detección de objetos (pelotas, jugadores) a partir de datos reales y etiquetas limpias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica (no contiene pesos) |
| Tamano del repositorio | 0.3 GB |
| Contenido principal | Dataset de pelotas, etiquetas SportsMOT GT, archivos de configuración |
| Formato de etiquetas | YOLO (esquema mobadam, 4 clases) |
| Fecha de creacion | 2026-09-07 |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún modelo, por lo que no tiene arquitectura ni proceso de entrenamiento asociado. Es un snapshot de datos que incluye etiquetas y datasets parciales. Según la model card, el pipeline de entrenamiento original se reconstruye mediante scripts alojados en un repositorio git (`pedrobesein/beseinvideotraining`), que permiten ensamblar los datasets completos a partir de este repositorio, las etiquetas comprimidas y el corpus de imágenes de SportsMOT (que no se incluye aquí por su tamaño). No se menciona ningún proceso de RLHF, DPO ni otro tipo de ajuste, ya que no aplica a un dataset.

## Capacidades

- Contiene un dataset de pelotas con 1.237 frames reales (imágenes y etiquetas) para diversidad de clases de pelota.
- Incluye 18.834 etiquetas GT limpias de SportsMOT en formato YOLO, con esquema de 4 clases (`mobadam`), divididas en 13.664 de entrenamiento y 5.170 de validación.
- Proporciona un archivo YAML de configuración asociado al esquema de clases.
- Ofrece un archivo de etiquetas más antiguo (`sportsmot_gt_labels.tar.gz`) y un archivo de selección de relevos (`player_v14_gt_labels.tar.gz`), este último casi vacío por diseño.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión en tiempo real, tool calling, agentes ni soporte multilingüe, al no ser un modelo.

## Casos de uso

- Reentrenamiento de modelos de detección de pelotas: el dataset `public_ball_parsed/` con 1.237 frames reales permite ajustar modelos de detección de objetos para localizar balones en vídeos de fútbol, mejorando la diversidad de clases.
- Validación de modelos de seguimiento de jugadores: las etiquetas GT de SportsMOT (18.834 etiquetas limpias) sirven como ground truth para evaluar modelos de seguimiento multiobjeto en partidos de fútbol.
- Reconstrucción de pipelines de entrenamiento: los scripts mencionados en la model card permiten ensamblar datasets completos (como `ds17mc` o `ds17mc_clips`) combinando este repositorio con el corpus de imágenes de SportsMOT, para reproducir entrenamientos desde cero.
- Auditoría y control de versiones de datos: al ser un snapshot, facilita la trazabilidad de qué etiquetas y datasets se usaron en una versión concreta de un modelo (por ejemplo, `player_v18.pt` o `mobadam`).
- Investigación en visión por computador deportiva: las etiquetas GT de SportsMOT son un recurso estándar para comparar algoritmos de detección y seguimiento en entornos de vídeo deportivo.
- Migración de datos entre máquinas: el repositorio actúa como copia de seguridad portable, permitiendo trasladar los datos etiquetados a otro entorno sin depender del Mac original ni del volumen de RunPod.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: se necesitan aproximadamente 0.3 GB para el repositorio, más alrededor de 35 GB si se descarga el corpus de imágenes de SportsMOT desde la fuente original.
- Para procesar las etiquetas y datasets: CPU es suficiente; no se requiere GPU para trabajar con los archivos comprimidos ni con los frames individuales.
- Para entrenar modelos a partir de estos datos: se recomienda una GPU con al menos 24 GB de VRAM, como una NVIDIA A40 (mencionada en la model card como el entorno de trabajo original), o GPUs equivalentes como RTX 4090 o A100.
- Opciones de despliegue: no aplica, ya que no es un modelo de inferencia. Para reconstruir los datos, se usan scripts de línea de comandos y entornos de entrenamiento como PyTorch o Ultralytics YOLO.

## Comparativa con modelos similares

No disponible. Este repositorio es un dataset, no un modelo, y no se dispone de información sobre datasets comparables en la misma categoría.

## Limitaciones y advertencias

- No incluye el corpus de imágenes de SportsMOT (aproximadamente 35 GB), por lo que no es un dataset completo por sí solo; se necesita descargar el corpus desde la fuente pública original.
- El archivo `player_v14_gt_labels.tar.gz` está casi vacío por diseño, ya que contiene principalmente symlinks, lo que puede confundir a quien espere etiquetas completas.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial del contenido sin consultar al autor.
- No hay información sobre sesgos de los datos ni sobre la calidad de las anotaciones más allá de la afirmación de que son "limpias".
- El repositorio fue creado como respaldo personal y no está pensado como un dataset de referencia pública; su mantenimiento a largo plazo no está garantizado.
- Los idiomas no aplican, pero la documentación está en inglés; no hay soporte multilingüe.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/innovazets/besein-datasets
- Repositorio de pesos relacionado mencionado en la model card: `innovazets/besein-models` (no se dispone de URL directa)
- Repositorio de scripts mencionado en la model card: `pedrobesein/beseinvideotraining` (no se dispone de URL directa)
