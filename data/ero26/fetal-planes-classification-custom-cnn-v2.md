# ERO26/fetal-planes-classification-custom-cnn-V2

## Resumen

El modelo `fetal-planes-classification-custom-cnn-V2`, desarrollado por el usuario ERO26, es una red neuronal convolucional (CNN) personalizada entrenada desde cero para la clasificacion multiclase de planos estandar de ecografia fetal. A diferencia de los modelos de lenguaje, se trata de un clasificador de imagen puro: recibe tensores de un solo canal en escala de grises de 128x128 pixeles y devuelve logits de probabilidad sobre las clases de planos fetales definidas en el dataset de entrenamiento. Con 8.483.980 parametros (8,48 M), es un modelo muy compacto, orientado a despliegue ligero y a tareas de asistencia, no a diagnostico.

El modelo se entrena sobre el conjunto de datos `ERO26/fetal-planes-classification-zenodo`, con particiones de entrenamiento, validacion y test, y utiliza una funcion de perdida de entropia cruzada con pesos de clase calculados dinamicamente para compensar el desbalanceo del dataset. Segun los resultados declarados por el autor en la model card, alcanza una exactitud (accuracy) de 0,8925, una precision macro de 0,8655, un recall macro de 0,8859 y un F1 macro de 0,8750 en el conjunto de evaluacion.

Su relevancia es acotada pero concreta: cubre un nicho de vision por computador medico (clasificacion de planos obstetricos) con un modelo lo suficientemente pequeno como para ejecutarse en CPU o en GPUs de gama baja, lo que facilita su integracion en herramientas de control de calidad, docencia y prototipado asistencial. No obstante, el repositorio no tiene descargas ni interacciones, no declara licencia y no aporta validacion externa, por lo que debe considerarse un artefacto experimental de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN personalizada: 3 bloques Conv2d (32, 64 y 128 canales) con BatchNorm2d, ReLU, MaxPool2d y Dropout2d; cabeza clasificadora con aplanado, proyeccion lineal a 256 unidades con ReLU, dropout del 50 % y capa lineal final de `num_classes` salidas |
| Parametros totales | 8.483.980 (8,48 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada fija de imagen en escala de grises de 1x128x128 pixeles |
| Tipos de cuantizacion | no disponible (la model card no declara cuantizaciones; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no aplica / no disponible (modelo de vision, no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 1,9 GB) |
| Tarea | Clasificacion multiclase de imagenes (planos de ecografia fetal) |
| Numero de clases | no disponible |
| Dataset de entrenamiento | `ERO26/fetal-planes-classification-zenodo` |
| Framework | transformers (Hugging Face Trainer) |
| Funcion de perdida | Entropia cruzada con pesos de clase integrados |

## Arquitectura y entrenamiento

La arquitectura es una CNN convolucional compacta disenada especificamente para imagenes de ecografia. El extractor de caracteristicas se compone de tres bloques convolucionales con 32, 64 y 128 canales respectivamente; cada bloque combina `Conv2d`, `BatchNorm2d`, `ReLU`, `MaxPool2d` y `Dropout2d`. La cabeza clasificadora aplana las caracteristicas resultantes, las proyecta a 256 unidades ocultas con activacion ReLU y dropout del 50 %, y termina en una capa lineal cuyo numero de salidas coincide con el numero de clases del problema. La entrada se normaliza, se convierte a un unico canal en escala de grises y se redimensiona uniformemente a 128x128 pixeles.

El entrenamiento se realizo desde cero (sin pesos preentrenados de ImageNet) con el framework `Trainer` de Hugging Face y precision mixta automatica (AMP) nativa. Los hiperparametros declarados son: learning rate 0,001, scheduler de tipo coseno, 50 epocas, tamano de lote de entrenamiento 4 con 4 pasos de acumulacion de gradiente (lote efectivo de 16), tamano de lote de evaluacion 16, semilla 42 y optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08. El desbalanceo de clases se abordo incorporando pesos calculados dinamicamente en la funcion de perdida. No se declara el numero de tokens ni el volumen total de imagenes del dataset, ni el uso de tecnicas como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion multiclase de imagenes de ecografia fetal en escala de grises con entrada fija de 1x128x128 pixeles.
- Extraccion de caracteristicas visuales mediante convoluciones apiladas con normalizacion por lotes y regularizacion por dropout espacial.
- Manejo de datasets desbalanceados gracias a pesos de clase integrados en la perdida.
- Salida de logits de probabilidad por clase, apta para umbralizacion o para calculo de metricas por clase.
- Compatible con endpoints de Hugging Face (etiqueta `endpoints_compatible` en el repositorio).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, razonamiento multi-paso ni soporte multilingue.

## Casos de uso

- Etiquetado automatico de archivos retrospectivos de ecografia fetal: el modelo puede procesar lotes de imagenes normalizadas a 128x128 y asignar etiquetas de plano, lo que permite indexar y buscar estudios antiguos en un PACS sin anotacion manual.
- Control de calidad durante la exploracion: integrado en un visor de adquisicion, puede verificar en segundo plano si el plano capturado corresponde a un plano estandar y avisar al operador, ya que su coste computacional es minimo.
- Herramienta docente para residentes: permite mostrar de forma inmediata la clasificacion del plano que el estudiante cree haber obtenido, sirviendo como retroalimentacion formativa en sesiones practicas.
- Curacion de cohortes de investigacion: al clasificar grandes volumenes de imagenes, facilita la seleccion de estudios que contienen un plano concreto antes de un analisis biometrico posterior.
- Prefiltrado en entornos con recursos limitados: al requerir menos de 1 GB de memoria en inferencia, puede ejecutarse en equipos sin GPU dedicada o en dispositivos embebidos junto al ecografo.
- Monitorizacion de deriva de dominio: comparando la distribucion de etiquetas predichas frente a la esperada, puede detectar cambios en el hardware de adquisicion o en los protocolos de captura.
- Generacion automatica de metadatos DICOM: el resultado del clasificador puede volcarse a campos de metadatos para mejorar la trazabilidad de los estudios obstetricos en un repositorio clinico.
- Prototipado de investigacion en clasificacion de planos fetales: sirve como linea base rapida de 8,48 M de parametros para comparar contra arquitecturas con transferencia de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o GSM8K, que ademas no aplican a un clasificador de imagen) en la informacion disponible. El `model-index` de la model card contiene una lista de resultados vacia. Los unicos datos disponibles son las metricas de evaluacion declaradas por el autor:

| Metrica (conjunto de evaluacion) | Valor |
|---|---|
| Loss | 0,3325 |
| Accuracy | 0,8925 |
| Precision macro | 0,8655 |
| Recall macro | 0,8859 |
| F1 macro | 0,8750 |

Progresion del entrenamiento declarada por el autor (extracto; el mejor resultado coincide con la epoca 34):

| Epoca | Validation loss | Accuracy | Precision macro | Recall macro | F1 macro |
|---|---|---|---|---|---|
| 1 | 1,0316 | 0,6154 | 0,5400 | 0,5902 | 0,5513 |
| 10 | 0,5928 | 0,7907 | 0,7691 | 0,8160 | 0,7817 |
| 20 | 0,4633 | 0,8448 | 0,8168 | 0,8477 | 0,8261 |
| 30 | 0,3547 | 0,8772 | 0,8499 | 0,8732 | 0,8593 |
| 34 | 0,3325 | 0,8925 | 0,8655 | 0,8859 | 0,8750 |
| 35 | 0,3389 | 0,8877 | 0,8608 | 0,8885 | 0,8731 |

La tabla del README aparece truncada en la fila de la epoca 36, por lo que no se dispone del resto del historial de entrenamiento en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuracion razonable. Los pesos en FP32 ocupan aproximadamente 34 MB (8.483.980 parametros x 4 bytes); en FP16 serian unos 17 MB y en INT8 unos 8,5 MB. Las activaciones a 128x128 con lotes de hasta 16 imagenes ocupan unos pocos cientos de MB como maximo.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU NVIDIA desde una GTX 1050 o una T4 es mas que suficiente; modelos como RTX 3090, RTX 4090, A100 o H100 estan totalmente sobredimensionados para esta carga.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU, iGPU o dispositivos embebidos (Raspberry Pi, Jetson Nano o similar) con cuantizacion o ejecucion en FP32.
- Opciones de despliegue: pipeline `image-classification` de transformers, exportacion a ONNX Runtime, TorchScript/TorchServe, NVIDIA Triton o un servicio FastAPI propio. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card no incluye ninguna comparacion con otros modelos, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas comparables (los resultados obtenidos correspondian a herramientas de compresion y edicion de video sin relacion con el modelo).

| Modelo | Parametros | Entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fetal-planes-classification-custom-cnn-V2 | 8,48 M | 1x128x128, escala de grises | Accuracy 0,8925; F1 macro 0,8750 (declarados por el autor, sin validacion externa) | no disponible | Hugging Face (0 descargas, 0 likes) |
| Clasificadores de planos fetales basados en backbones preentrenados (ResNet, VGG, EfficientNet) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otros modelos publicados de la familia de clasificacion de planos fetales (por ejemplo, enfoques tipo SonoNet) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria con los datos disponibles. Como referencia cualitativa, este modelo se distingue por entrenarse desde cero con solo 8,48 M de parametros, frente a los enfoques habituales que parten de backbones preentrenados en ImageNet con decenas de millones de parametros.

## Limitaciones y advertencias

- No es un dispositivo de diagnostico: el autor indica explicitamente que el modelo es solo para investigacion, educacion y prototipado asistencial, y que no debe desplegarse como herramienta autonoma para la toma de decisiones clinicas.
- Deriva de dominio: el rendimiento puede degradarse con imagenes capturadas con hardware, ajustes acusticos o transductores distintos a los de la distribucion de entrenamiento.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial esta permitido; en la practica, supone un riesgo legal para su integracion en productos.
- Sin validacion externa: el repositorio registra 0 descargas y 0 likes, y todas las metricas proceden del propio autor, sin replicacion independiente ni evaluacion en cohortes externas.
- Precision macro inferior a la exactitud (0,8655 frente a 0,8925): sugiere un rendimiento desigual entre clases, coherente con el desbalanceo del dataset que el autor intenta mitigar con pesos de clase.
- Volatilidad en la validacion: la curva de entrenamiento muestra oscilaciones notables entre epocas y el mejor resultado se obtiene en la epoca 34 de 50, lo que apunta a que el entrenamiento no converge de forma monotona y que la eleccion del checkpoint final es relevante.
- Perdida de resolucion espacial: la entrada se reduce a 128x128 en un unico canal, lo que descarta informacion de textura y detalle fino presente en las imagenes originales de ecografia.
- Numero de clases y composicion del dataset no declarados: el README no especifica cuantas clases tiene el problema ni cuantas imagenes contiene cada particion, lo que dificulta evaluar la representatividad del resultado.
- Tamano del repositorio de 1,9 GB: es desproporcionado para 8,48 M de parametros, lo que sugiere que incluye checkpoints intermedios u otros artefactos de entrenamiento; conviene revisar los archivos antes de descargarlo.
- README truncado: la tabla de resultados de entrenamiento se corta en la epoca 36, y la model card no documenta el rendimiento en el conjunto de test de forma separada.
- Ambito muy restringido: no genera texto, no soporta instrucciones, no realiza tool calling ni razonamiento multi-paso, y no tiene capacidades multilingues ni de vision general fuera del dominio de la ecografia fetal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ERO26/fetal-planes-classification-custom-cnn-V2
- Dataset de entrenamiento: https://huggingface.co/datasets/ERO26/fetal-planes-classification-zenodo
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
