# LibreYOLO/LibreDDColorl-restore

## Resumen

LibreDDColorl-restore es un modelo de colorización automática de imágenes en blanco y negro basado en la arquitectura DDColor, con un encoder ConvNeXt-L de mayor tamaño. Ha sido convertido por LibreYOLO para su tarea `restore`, integrando el checkpoint original en el ecosistema de la librería `libreyolo`. El modelo predice el croma en el espacio de color Lab a resolución 512x512 y reconstruye la imagen RGB final utilizando el plano de luminancia original de la imagen de entrada, lo que garantiza que la estructura y el brillo de la fotografía original se conserven intactos.

El checkpoint proviene del repositorio `piddnad/ddcolor_modelscope` y ha sido convertido sin modificar los tensores aprendidos, manteniendo una paridad exacta con la referencia (`max_abs_diff=0`). El modelo fue entrenado sobre ImageNet con inicialización de ImageNet-22K, y el editor declara el artefacto bajo licencia Apache-2.0, aunque con una advertencia importante sobre las restricciones de uso del dataset ImageNet (limitado a investigación y educación no comercial). El checkpoint artístico de DDColor se excluye deliberadamente por usar datos privados no revelados.

Este modelo es relevante para tareas de restauración y colorización de imágenes históricas, fotografía en blanco y negro y contenido audiovisual antiguo, ofreciendo una alternativa de código abierto con una arquitectura probada y un pipeline de conversión transparente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDColor con encoder ConvNeXt-L y decoder de colorización |
| Parametros totales | no disponible (checkpoint de 911,914,869 bytes, ~0.9 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (formato original float32, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de procesamiento de imagen) |
| Licencia | Apache-2.0 (declarada por el editor; advertencia sobre ImageNet) |
| Formato de pesos | checkpoint de LibreYOLO v1 (convertido desde `pytorch_model.bin`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DDColor, que combina un encoder basado en ConvNeXt-L (una variante de red convolucional con kernels grandes y normalización por capas) con un decoder que predice los canales de croma `a` y `b` del espacio Lab. La entrada se procesa a una resolución de 512x512 píxeles, y la salida se reconstruye sobre el lienzo original utilizando el canal de luminancia `L` de la imagen de entrada, lo que evita artefactos de reescalado y preserva los detalles de alta frecuencia.

El entrenamiento se realizó sobre el dataset ImageNet, con inicialización de pesos proveniente de ImageNet-22K. No se han publicado detalles adicionales sobre el proceso de entrenamiento (número de épocas, aumentos de datos, funciones de pérdida específicas) en la información disponible. La conversión a LibreYOLO no altera los pesos aprendidos; únicamente añade metadatos de checkpoint v1 y verifica la paridad numérica exacta con la referencia original.

## Capacidades

- Colorización automática de imágenes en blanco y negro o con croma degradado.
- Restauración de fotografías antiguas conservando la luminancia original.
- Reconstrucción de color en imágenes con dominancia de grises o canales de color dañados.
- Procesamiento de imágenes a resolución 512x512 con reconstrucción al tamaño original.
- Integración sencilla con la librería `libreyolo` mediante una API de alto nivel.
- Compatible con el pipeline de `image-to-image` de HuggingFace.

## Casos de uso

- Restauración de archivos fotográficos históricos: el modelo puede colorear imágenes en blanco y negro de archivos, bibliotecas o colecciones personales, manteniendo la fidelidad de la luminancia original y produciendo resultados naturalistas.
- Colorización de metraje cinematográfico antiguo: aplicable a fotogramas de películas en blanco y negro, permitiendo generar versiones coloreadas para documentales o proyectos de preservación audiovisual.
- Mejora de imágenes médicas o científicas: en dominios donde se trabaja con imágenes en escala de grises (radiografías, tomografías), el modelo puede añadir color de forma controlada para facilitar la interpretación visual, aunque no está específicamente entrenado para ello.
- Preprocesamiento para sistemas de visión artificial: la colorización puede servir como paso previo para algoritmos de detección o segmentación que se beneficien de información cromática.
- Generación de contenido creativo: artistas y diseñadores pueden usar el modelo para explorar paletas de color alternativas en fotografías o ilustraciones en blanco y negro.
- Automatización de flujos de trabajo de edición: integración en pipelines de postproducción fotográfica mediante la API de `libreyolo`, permitiendo procesar lotes de imágenes sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas comparativas (PSNR, SSIM, FID, etc.) en la model card ni en la documentación asociada. La única verificación reportada es la paridad exacta con el checkpoint de referencia (`max_abs_diff=0`), lo que confirma que la conversión no introduce degradación numérica.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 0.9 GB en float32. Para inferencia con batch 1 y resolución 512x512, se estima un consumo de memoria de entre 2 y 4 GB, dependiendo del backend y las optimizaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) puede ejecutar el modelo. Para procesamiento por lotes o mayor velocidad, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de gama media y baja gracias a su tamaño moderado.
- Opciones de despliegue: la librería `libreyolo` proporciona una API Python simple. También es posible exportar el modelo a otros formatos (ONNX, TensorRT) para inferencia optimizada, aunque no se documenta explícitamente.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (RTX 3060), se estima una latencia de 0.5 a 2 segundos por imagen a 512x512, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDDColorl-restore | DDColor + ConvNeXt-L | ~0.9 GB (checkpoint) | 512x512 | Apache-2.0 (con caveat ImageNet) | HuggingFace |
| DDColor (original) | DDColor + ConvNeXt-L | ~0.9 GB | 512x512 | Apache-2.0 (checkpoint) | GitHub / ModelScope |
| DeOldify | ResNet + GAN | ~300 MB | variable | Apache-2.0 | GitHub |
| InstColorization | CNN + Transformer | ~100 MB | variable | MIT | GitHub |

La comparativa se basa en características generales; no se dispone de benchmarks comunes para una comparación cuantitativa. LibreDDColorl-restore se distingue por su integración con `libreyolo` y su verificación de paridad exacta con el checkpoint original.

## Limitaciones y advertencias

- Restricciones de uso del dataset ImageNet: aunque el checkpoint se declara Apache-2.0, el modelo fue entrenado con ImageNet, cuyo acuerdo de acceso limita el uso a investigación y educación no comercial. Esto puede afectar a despliegues comerciales.
- El checkpoint artístico de DDColor se excluye por usar datos privados no revelados; este modelo solo incluye el checkpoint de restauración estándar.
- La colorización es una tarea subjetiva: el modelo puede producir colores plausibles pero no necesariamente históricamente precisos, especialmente en imágenes con contenido desconocido.
- No se han publicado evaluaciones de sesgos o alucinaciones cromáticas; el modelo puede inventar colores en regiones ambiguas.
- La resolución de procesamiento está fijada en 512x512; imágenes de mayor resolución se reescalan internamente, lo que puede perder detalles finos.
- No se proporcionan garantías de rendimiento en dominios especializados (médico, satelital, etc.) fuera del ámbito fotográfico general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreDDColorl-restore
- Repositorio fuente del checkpoint: https://huggingface.co/piddnad/ddcolor_modelscope
- Repositorio de arquitectura DDColor: https://github.com/piddnad/DDColor
- Librería LibreYOLO: no se proporciona enlace directo en la información disponible.
