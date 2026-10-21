# longlephamtien/DL261-Assignment

## Resumen

DL261-Assignment es un repositorio de Hugging Face que no contiene un modelo fundacional ni pesos preentrenados de propósito general, sino una selección de checkpoints de tres trabajos prácticos del curso CO3133, desarrollados por el grupo DeepDive. El repositorio está etiquetado con `fashion-mnist` e `image-classification`, declara el pipeline `image-classification` y su ámbito es, por tanto, la clasificación de imágenes sobre ese conjunto de datos, no la generación de texto ni tareas de lenguaje.

El autor, `longlephamtien`, no publica en la model card información sobre arquitectura, número de parámetros, ventana de contexto, idiomas ni resultados numéricos. Lo que sí documenta es una estructura de directorios por asignatura y ejecución, con un `checkpoint.pt`, la configuración resuelta (`config.yaml`), el entorno de ejecución (`environment.json`), el historial por época (`history.json`), un resumen de métricas y parámetros (`summary.json`) y sumas de verificación SHA-256 (`checksums.json`), junto con un procedimiento para reconstruir cada checkpoint a partir del commit y la semilla registrados.

Su relevancia es docente y de reproducibilidad: el split del dataset está fijado y versionado, y el autor afirma que la ejecución reproduce la accuracy y el macro-F1 reportados en cualquier máquina. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación externa ni uso comunitario documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; la model card no la describe y remite a la `config.yaml` de cada ejecución |
| Parámetros totales | No disponible; `summary.json` los registra, pero el archivo no se incluye en la información proporcionada |
| Parámetros activos | No aplica; no se declara una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica; es un modelo de clasificación de imágenes, sin ventana de tokens |
| Tipos de cuantización | No disponible; solo se distribuyen checkpoints `.pt` sin cuantizar |
| Idiomas soportados | No disponible; la tarea no procesa texto |
| Licencia | MIT |
| Formato de pesos | PyTorch (`checkpoint.pt`), un archivo por ejecución |
| Tarea declarada | `image-classification` |
| Conjunto de datos | `fashion-mnist` (según etiquetas del repositorio) |
| Autor | `longlephamtien` |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-23 |
| Última actualización | 2026-10-20 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de los checkpoints: no se indica si son CNN, transformers de visión ni qué profundidad o anchura tienen. Tampoco se detalla el número de épocas, la función de pérdida, el optimizador ni si hubo aumento de datos. Lo único verificable es el protocolo de experimentación: cada ejecución guarda la configuración resuelta que la produjo, un `environment.json` con el hash del commit, las versiones de las librerías, el hardware y el número de hilos, un `history.json` con un registro por época, un `summary.json` con parámetros, mejor época, tiempo de entrenamiento y métrica seleccionada, y un `checksums.json` con el SHA-256 de cada archivo.

El procedimiento de reconstrucción consiste en clonar el repositorio de GitHub en el commit registrado, instalar el paquete en un entorno virtual, regenerar los datos con `python -m src.data --config configs/base.yaml` y lanzar el entrenamiento con `python -m src.train --config configs/<model>.yaml --set seed=<seed>`. El split del dataset está fijado y comprometido en el repositorio, de modo que, según el autor, se reproducen la accuracy y el macro-F1 reportados; los tiempos de pared dependen del hardware anotado. No consta información sobre volumen de datos de entrenamiento más allá de Fashion-MNIST, composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de imágenes, según el pipeline `image-classification` declarado en el repositorio.
- Entrenamiento reproducible sobre Fashion-MNIST con semilla, configuración y split fijados.
- Trazabilidad de experimentos: sumas SHA-256 por archivo y registro del entorno de ejecución.
- Selección automática del checkpoint mediante la regla definida en `config.yaml`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto ni código.
- No tiene capacidades multilingües.
- No se documentan capacidades de visión general fuera de la tarea de clasificación entrenada.

## Casos de uso

- Docencia y evaluación de prácticas: permite comparar la implementación de un alumno con una ejecución de referencia reproducible, usando el mismo split y la misma métrica.
- Auditoría de resultados académicos: los `checksums.json` y el `environment.json` permiten verificar que un resultado reportado corresponde a un artefacto y a un entorno concretos.
- Comparación controlada de configuraciones: al mantener fijo el split, se pueden contrastar arquitecturas o hiperparámetros sobre Fashion-MNIST sin que varíe la partición de datos.
- Reproducción de experimentos en otra máquina: el procedimiento documentado permite regenerar datos y reentrenar con la semilla registrada para comprobar la estabilidad de la métrica.
- Formación en MLOps: el repositorio ilustra el versionado de artefactos, la captura del entorno y la verificación de integridad de pesos y configuraciones.
- Base para prácticas de despliegue: un clasificador de imágenes pequeño puede exportarse a un servicio de inferencia o integrarse en una práctica de empaquetado, siempre que se confirmen previamente los parámetros y el formato del checkpoint.
- Revisión por pares de trabajos: sirve como referencia de estructura de entrega para asignaturas que exigen reproducibilidad de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `summary.json` de cada ejecución contendría la accuracy y el macro-F1 seleccionados, pero los valores no se incluyen en los datos proporcionados.

| Métrica | Valor | Fuente |
|---|---|---|
| Accuracy | No disponible | Se registraría en `summary.json`, no incluido en la información |
| Macro-F1 | No disponible | Se registraría en `summary.json`, no incluido en la información |
| Tiempo de entrenamiento | No disponible | Se registraría en `summary.json`, no incluido en la información |

## Requisitos de hardware

- VRAM estimada: no disponible; sin conocer el número de parámetros ni la resolución de entrada no se puede calcular.
- GPU recomendadas: no disponibles; el autor registra el hardware utilizado en `environment.json`, pero su contenido no se incluye en la información proporcionada.
-GPU de consumo: no confirmado. Por el tamaño del repositorio (0,0 GB) y la naturaleza de Fashion-MNIST es plausible que quepa en una GPU de consumo, pero es una inferencia no verificada con los datos disponibles.
- Opciones de despliegue: PyTorch nativo, cargando `checkpoint.pt` con la configuración correspondiente. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje. La exportación a TorchScript u ONNX no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Este repositorio no es un modelo publicado con métricas, sino un conjunto de checkpoints de trabajos de curso, por lo que la comparación con alternativas de la misma categoría no puede hacerse con cifras.

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DL261-Assignment (este repositorio) | No disponible | No aplica | No disponible | MIT | 0 descargas, 0 likes |
| Otros repositorios de prácticas con etiqueta `fashion-mnist` en Hugging Face | No disponible | No aplica | No disponible | No disponible | No disponible |
| Modelos de referencia de torchvision para Fashion-MNIST | No disponible en la información | No aplica | No disponible en la información | No disponible en la información | No disponible |

## Limitaciones y advertencias

- No es un modelo listo para producción: es un conjunto de checkpoints de trabajos académicos sin documentación técnica de arquitectura ni de preprocesado.
- Ausencia de métricas publicadas: no se pueden evaluar accuracy, macro-F1 ni tiempos de entrenamiento sin acceder a los `summary.json`.
- Sin validación externa: 0 descargas y 0 likes implican que no hay evidencia de uso o revisión por parte de la comunidad.
- Metadatos incompletos: idiomas, arquitectura, parámetros y requisitos de hardware figuran como no disponibles.
- Posible ausencia real de pesos: un tamaño de repositorio de 0,0 GB obliga a verificar que `checkpoint.pt` esté presente y no sea un puntero de Git LFS antes de intentar cargarlo.
- Riesgo de sobreajuste al split fijado: al optimizar y comparar sobre una única partición comprometida, los resultados pueden no generalizar a otras particiones de Fashion-MNIST.
- Sesgos del dominio: Fashion-MNIST contiene imágenes de prendas de vestir en escala de grises; el modelo hereda los desequilibrios y sesgos de esa muestra y no es trasladable a otros dominios visuales.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución, pero sin garantía alguna y sin que el autor documente riesgos o limitaciones de los pesos.
- No apto para tareas de lenguaje: no admite prompts, tool calling ni generación; cualquier uso en ese sentido sería un error de categoría.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/longlephamtien/DL261-Assignment
- Repositorio de código en GitHub: https://github.com/longlephamtien/DL261-Assignment
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a portales franceses de descarga de software (logicieleducatif.fr, fr.wikipedia.org, clubic.com, 01net.com, david-informaticien.com) y no guardan relación con este modelo.
