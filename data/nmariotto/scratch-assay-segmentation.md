# nmariotto/scratch-assay-segmentation

## Resumen

`scratch-assay-segmentation` es un conjunto de pesos de segmentación de instancias basado en YOLO11m-seg (Ultralytics), desarrollado por nmariotto, para cuantificar el área libre de células (la "herida") en imágenes de ensayos de scratch o wound-healing en campo claro. El modelo detecta y segmenta la región del hueco en cultivos de células endoteliales (EA.hy926) y monocapas SKOV-3, lo que permite automatizar el cálculo de la fracción de cierre de la herida en estudios de migración celular.

El modelo resuelve un problema concreto de biología celular: la medición manual del área de la herida es lenta y subjetiva, y este pipeline ofrece una medición reproducible con una concordancia de 0,869 (CCC) frente a un estándar de referencia manual supervisado. La versión actual es `M_v3.pt` (v3.0.0), que corrige errores de partición y etiquetado de la versión v2.0.0 y se entrenó sobre una partición a nivel de pocillo físico.

Se trata de un modelo pequeño (22,4 M de parámetros, 45,2 MB), con un contexto de entrada fijo de 640 × 640 píxeles, licencia AGPL-3.0 y una única clase (`wound`). Su relevancia radica en que acompaña a un manuscrito en revisión (Cytometry Part A) y se distribuye junto con el dataset (CC BY 4.0) y el código de análisis estadístico (MIT), lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m-seg (Ultralytics 8.4.102) |
| Parametros totales | 22,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 640 × 640 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, checkpoint de Ultralytics) |

## Arquitectura y entrenamiento

El modelo es una instancia de YOLO11m-seg, una red de detección y segmentación de instancias de una sola etapa. Se inicializó desde un checkpoint preentrenado en COCO y se afinó sobre imágenes de microscopía de campo claro a 5× de aumento, con entrada de 640 × 640 y letterbox con relleno negro. El entrenamiento utilizó 100 épocas, batch de 4, sin early stopping, con aumentación HSV (0.015/0.7/0.4), traslación 0.1, escala 0.5, volteo horizontal 0.5 y mosaic desactivado en las últimas 10 épocas. El framework fue PyTorch 2.6.0 con CUDA 12.4.

Los datos de entrenamiento consisten en 903 imágenes (213 de validación, 247 de test reservado) de células endoteliales EA.hy926 y monocapas SKOV-3, procedentes de un único laboratorio y particionadas a nivel de pocillo físico para evitar fuga de información entre entrenamiento y test. La versión v3.0.0 corrige dos problemas de la v2.0.0: la partición por campo de adquisición (que permitía que campos del mismo pocillo cayeran en particiones distintas) y el etiquetado erróneo de los campos SKOV-3, que se renumeraron a partir del orden de adquisición de los archivos originales del laboratorio. El umbral de confianza por defecto se fijó en 0,35, elegido sobre las imágenes de validación como el umbral con menor error absoluto medio en área de herida frente a las anotaciones.

## Capacidades

- Segmentación de instancias de la región libre de células (clase única `wound`) en imágenes de ensayos de scratch en campo claro.
- Generación de máscaras poligonales y binarias del hueco (`r[0].masks`), aptas para el cálculo del área y de la fracción de cierre.
- Detección de ausencia de herida: un resultado vacío (`r[0].masks is None`) indica que no se detectó herida, no que el cierre sea completo.
- Inferencia sobre imágenes individuales o lotes mediante la API de Ultralytics (`model.predict`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Cuantificación automatizada de cierre de herida en ensayos de migración celular: el modelo segmenta el hueco en cada imagen de una serie temporal y permite calcular la fracción de cierre respecto a la línea base, sustituyendo la medición manual con una concordancia de 0,869 (CCC) frente al estándar de referencia.
- Cribado de compuestos en placas multi-pocillo: al procesar lotes de imágenes de un mismo experimento, se obtiene el área de la herida por pocillo y condición, lo que permite comparar tratamientos de forma reproducible (con la advertencia de que la pendiente de cierre medida es 0,76 frente a la manual).
- Análisis retrospectivo de series de adquisición: el modelo puede reprocesar imágenes archivadas de experimentos previos para extraer métricas de cierre de forma homogénea, siempre que las condiciones de adquisición coincidan con el sobre de validación (microscopio invertido, campo claro, 5×).
- Integración en pipelines de análisis de imágenes de laboratorio: al ser un checkpoint de Ultralytics, se puede invocar desde scripts de Python o desde la interfaz web del Space asociado, sin instalación adicional, para su uso por personal no técnico.
- Control de calidad de experimentos: la detección de imágenes sin herida (2 de 27 en el test) y la tasa de falsos cierres completos (2 de 116 observaciones) permiten marcar automáticamente imágenes sospechosas para revisión manual antes de registrar un área de cero.
- Docencia y formación en análisis de imágenes de microscopía: el modelo y su interfaz web permiten ilustrar el flujo completo de segmentación, cálculo de área y comparación con medición manual en un entorno reproducible.

## Benchmarks y rendimiento

Resultados sobre las 247 imágenes de test reservado (25 unidades físicas, ninguna presente en entrenamiento):

| Metrica | conf 0,35 | conf 0,80 |
|---|---|---|
| mAP@50 / mAP@50–95 | 95,9% / 81,7% | no aplica (independiente del umbral) |
| Precisión / recall de instancia | 86,4% / 94,5% | 98,0% / 81,8% |
| Imágenes con herida en las que se detecta | 99,5% | no disponible |
| Imágenes sin herida en las que se detecta | 2 de 27 | no disponible |

Concordancia de la fracción de cierre con un estándar de referencia manual supervisado, a conf 0,35, sobre 116 observaciones pareadas de las 50 series de adquisición elegibles: coeficiente de correlación de concordancia 0,869, sesgo medio −0,009, límites de acuerdo del 95% de −0,272 a +0,255. En 2 de las 116 observaciones el modelo no devolvió herida donde la referencia aún medía una (falso cierre completo).

Latencia: mediana sobre 40 imágenes de test a conf 0,35, tomada como la mediana de tres ejecuciones: 270 ms en CPU de 16 núcleos, 67 ms en NVIDIA GeForce RTX 4060 Ti.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,4 M de parámetros y 45,2 MB de pesos, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: NVIDIA GeForce RTX 4060 Ti (67 ms de latencia medida); por tamaño, cualquier GPU consumer con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU consumer: sí, con amplio margen (el modelo pesa 45,2 MB).
- Opciones de despliegue: Ultralytics (PyTorch), interfaz web en Hugging Face Spaces; no se documentan exportaciones a otros formatos (ONNX, TensorRT, etc.) en la información disponible.
- Latencia y throughput: 270 ms por imagen en CPU de 16 núcleos y 67 ms por imagen en RTX 4060 Ti (mediana de tres ejecuciones sobre 40 imágenes).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, YOLO11m-seg es la arquitectura base y existen otras variantes de la familia YOLO11-seg (n, s, l, x) con distinto número de parámetros, pero no se han publicado en esta información resultados comparativos de rendimiento en esta tarea concreta.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| scratch-assay-segmentation (YOLO11m-seg) | 22,4 M | 640 × 640 px | AGPL-3.0 | Hugging Face, Zenodo, GitHub |
| Otras variantes YOLO11-seg | no disponible | no disponible | AGPL-3.0 | Ultralytics |
| Otros modelos de segmentación de heridas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Una medición automática individual puede diferir de una manual cuidadosa en más de veinte puntos porcentuales de cierre.
- No validado para comparar tratamientos: la pendiente del cierre medido por el modelo frente al de referencia, dentro de cada punto temporal, es 0,76, por lo que una diferencia entre condiciones medida con estos pesos sería, de media, aproximadamente una cuarta parte menor que la manual.
- Heridas pequeñas: entre el 2,5% y el 5% del campo, el IoU medio con la anotación es 0,81, frente a 0,92 por encima del 10%; las mediciones con un hueco residual inferior a aproximadamente el 5% del campo son la parte menos fiable de una serie.
- Umbral más estricto: a conf 0,80 el modelo detecta herida en aproximadamente la mitad de las imágenes de test cuyo hueco ocupa entre el 2,5% y el 5% del campo, y también pierde algunas heridas grandes de línea base; una herida no detectada se lee como cerrada.
- Células aisladas: el hueco se cuantifica como la región encerrada por el contorno segmentado, por lo que las células que se desprenden y migran individualmente hacia un hueco continuo no se restan de él.
- Sobre de adquisición restringido: un único microscopio invertido, campo claro, objetivo 5×, una sola institución; no se realizó test externo y se desconoce la robustez frente a otros microscopios, aumentos o modalidades de contraste.
- Un resultado vacío no es evidencia de cierre completo y debe inspeccionarse en lugar de registrarse como área cero.
- Licencia AGPL-3.0: los pesos son obra derivada de Ultralytics YOLO11 y no se obtuvo licencia comercial; el uso comercial queda sujeto a las condiciones de la AGPL-3.0. El dataset se distribuye por separado bajo CC BY 4.0 y el código de análisis estadístico bajo MIT.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos (2 de 27 imágenes sin herida) y falsos cierres completos (2 de 116 observaciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nmariotto/scratch-assay-segmentation
- Repositorio de código en GitHub: https://github.com/nykemariotto/scratch-assay-segmentation
- Interfaz web (Hugging Face Space): https://huggingface.co/spaces/nmariotto/Scratch-assay-segmentation
- Archivo de datos y código (DOI concepto): https://doi.org/10.5281/zenodo.20298129
- Versión v3.0.0 del archivo: https://doi.org/10.5281/zenodo.23453791
- Depósito anterior (marcado como superado, no citar): https://doi.org/10.5281/zenodo.20298130
