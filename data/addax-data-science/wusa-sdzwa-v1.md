# Addax-Data-Science/WUSA-SDZWA-v1

## Resumen

WUSA-SDZWA-v1 es un clasificador de imágenes basado en EfficientNet V2 Medium, desarrollado por San Diego Zoo Wildlife Alliance (SDZWA) y redistribuido por Addax Data Science para su integración en la plataforma AddaxAI. El modelo identifica 51 especies y grupos taxonómicos presentes en el oeste de los Estados Unidos, ampliando la cobertura del modelo previo Southwest USA v3 a toda la región. Está entrenado con 555 668 imágenes, en su mayoría procedentes de conjuntos de datos LILA, y alcanza un 94,9 % de precisión global sobre un conjunto de evaluación de 46 238 imágenes.

La relevancia de este modelo radica en su aplicación directa al análisis de cámaras trampa en ecología y conservación. Al estar optimizado para imágenes de fauna silvestre en el oeste norteamericano, permite automatizar la identificación de especies en proyectos de monitoreo a gran escala, reduciendo el trabajo manual de revisión de millones de fotografías. Su tamaño reducido (0,2 GB) y su arquitectura EfficientNet V2 Medium lo hacen adecuado para despliegue en entornos con recursos limitados.

El repositorio en HuggingFace incluye el checkpoint del modelo en formato PyTorch (`.pt`), un archivo de clases (`classes.csv`), un script de inferencia (`inference.py`) y una tabla de taxonomía (`taxonomy.csv`). La licencia indicada es MIT, aunque se recomienda revisar los términos originales del desarrollador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet V2 Medium |
| Parametros totales | no disponible (el checkpoint incluye todos los parametros, sin necesidad de pesos ImageNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato nativo PyTorch) |
| Idiomas soportados | no aplica (modelo de vision sin procesamiento de texto) |
| Licencia | MIT (segun enlace del desarrollador; verificar en archivos de licencia del repositorio) |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura EfficientNet V2 Medium, una red convolucional eficiente que escala la profundidad, anchura y resolucion de forma balanceada para optimizar la relacion precision-coste. El entrenamiento se realizo con la libreria `animl-py`, desarrollada por Kyra Swanson (SDZWA), que esta especializada en el procesamiento de imagenes de camaras de trampa. El conjunto de datos de entrenamiento consta de 555 668 imagenes, principalmente provenientes de los datasets LILA (Labeled Information Library of Alexandria), que incluyen imagenes de fauna silvestre de multiples regiones.

El checkpoint entregado por el autor contiene todos los parametros del modelo, sin necesidad de cargar pesos ImageNet adicionales. El proceso de evaluacion se realizo sobre 46 238 imagenes, obteniendo una precision global del 94,9 %. No se ha documentado el uso de tecnicas como RLHF o DPO, dado que es un modelo de clasificacion supervisada, no un LLM.

## Capacidades

- Clasificacion de imagenes en 51 clases de especies y grupos taxonomicos del oeste de los Estados Unidos.
- Identificacion de fauna en imagenes de camaras de trampa, incluyendo especies como mamiferos, aves y otros grupos.
- Integracion con AddaxAI, plataforma de analisis de imagenes de vida silvestre que permite automatizar el proceso de etiquetado y analisis.
- Inferencia a resolucion de 299x299 píxeles, sin normalizacion previa, segun el script `inference.py` incluido.
- Soporte para clasificacion de imagenes individuales, adecuado para flujos de trabajo de procesamiento por lotes.

## Casos de uso

- Monitoreo de biodiversidad en parques naturales: el modelo puede procesar imagenes de camaras de trampa en reservas del oeste de EE. UU., identificando automaticamente las especies presentes y generando estadisticas de presencia y abundancia para informes de conservacion.
- Evaluacion de impacto de infraestructuras: en proyectos de carreteras, oleoductos o parques eolicos, el modelo permite detectar cambios en la fauna local mediante el analisis de imagenes de camaras antes y despues de la intervencion, con una precision del 94,9 %.
- Seguimiento de especies invasoras: con 51 clases que incluyen especies nativas y no nativas, el modelo facilita la deteccion temprana de especies invasoras en el oeste, ayudando a priorizar acciones de control.
- Investigacion academica en ecologia: los investigadores pueden utilizar el modelo como herramienta de etiquetado automatico en estudios de comportamiento, demografia o interacciones entre especies, reduciendo el tiempo de anotacion manual en proyectos de gran escala.
- Gestion de colecciones de imagenes en museos y archivos: el modelo permite clasificar y organizar colecciones de fotografias de fauna de regiones del oeste, facilitando la catalogacion y busqueda por especie.
- Formacion de modelos locales: el checkpoint y el script de inferencia pueden servir como punto de partida para fine-tuning en otras regiones o para añadir nuevas clases, dado que el modelo es compacto y bien documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. El unico dato de rendimiento es la precision global del 94,9 % sobre el conjunto de evaluacion de 46 238 imagenes, reportada por el autor. No se han proporcionado metricas detalladas por clase ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada: el modelo tiene un tamaño de repo de 0,2 GB, por lo que el checkpoint ocupa aproximadamente 200 MB. La inferencia de una imagen a resolucion 299x299 requiere menos de 1 GB de VRAM en GPU, y puede ejecutarse en CPU con un tiempo de inferencia de unos pocos cientos de milisegundos por imagen.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Para procesamiento por lotes de grandes colecciones, se recomienda una GPU con mas VRAM, como RTX 3090 o A100.
- Compatibilidad con consumer GPU: si, el modelo es adecuado para GPUs de consumo, incluso para equipos sin GPU dedicada (inferencia en CPU).
- Opciones de despliegue: el checkpoint en formato PyTorch puede cargarse con la libreria `animl-py` o con un script de inferencia propio. Tambien puede integrarse en AddaxAI, que es la plataforma oficial de despliegue. No se han documentado conversiones a ONNX o TensorRT.
- Latencia y throughput: no disponible. Se estima una latencia inferior a 100 ms por imagen en GPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. El modelo previo de SDZWA, Southwest USA v3, es la referencia directa, pero no se aportan datos comparativos. La comparacion con modelos de clasificacion general como ResNet o ViT no es relevante, dado que este modelo esta especializado en especies concretas y region especifica.

## Limitaciones y advertencias

- El modelo esta limitado a 51 especies y grupos del oeste de los Estados Unidos; no es aplicable a otras regiones sin reentrenamiento.
- La precision del 94,9 % es global, pero no se conocen las precisiones por clase. Algunas especies con pocas muestras pueden tener un rendimiento inferior.
- El modelo puede confundir especies morfologicamente similares, como se menciona en la validacion con 81 imagenes ENA24, donde los errores eran confusiones plausibles.
- La licencia MIT permite uso comercial, pero se debe revisar el archivo de licencia del repositorio y cumplir con los terminos originales del desarrollador (San Diego Zoo Wildlife Alliance).
- No se ha documentado el comportamiento en condiciones de baja iluminacion, oclusion o imagenes de baja calidad, habituales en camaras de trampa.
- El modelo no genera texto ni descripciones; solo produce una etiqueta de clase con su probabilidad asociada.

## Enlaces

- [Repositorio HuggingFace: Addax-Data-Science/WUSA-SDZWA-v1](https://huggingface.co/Addax-Data-Science/WUSA-SDZWA-v1)
- [AddaxAI - plataforma de integracion](https://addaxdatascience.com/addaxai/)
- [Addax Data Science - web principal](https://addaxdatascience.com/)
- [GitHub del laboratorio de conservacion de SDZWA](https://github.com/conservationtechlab)
- [Licencia MIT (enlace del desarrollador)](https://opensource.org/license/mit)
