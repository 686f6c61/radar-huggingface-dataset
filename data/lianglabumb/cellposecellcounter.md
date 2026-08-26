# LiangLabUMB/cellposecellcounter

## Resumen

CellposeCellCounter es un modelo de segmentación celular desarrollado por el Liang Lab de la Universidad de Maryland (LiangLabUMB) para contar células y evaluar su viabilidad a partir de fotografías de hemocitómetro tomadas con un adaptador de teléfono móvil. El modelo se distribuye como un conjunto de pesos para Cellpose, concretamente un ajuste fino de Cellpose-SAM (la variante que integra Segment Anything Model) sobre imágenes de campo claro de hemocitómetro. Su propósito es automatizar el recuento manual en laboratorios de biología, reduciendo el error humano y acelerando el análisis.

El modelo actual (`hemocytometer_retrained_20260825.npy`) se entrenó con 13 imágenes recortadas a un bloque de conteo de 4×4 y 1.069 máscaras celulares corregidas manualmente mediante un proceso humano en el bucle. En la evaluación con seis imágenes reservadas y 556 células anotadas, alcanza un error de recuento de −1,1 %, una precisión de 0,940 y un F1 de 0,933, superando claramente al modelo base de Cellpose-SAM sin ajustar, que no es utilizable en estas imágenes. El repositorio incluye además un modelo general para estimar confluencia y una versión anterior del modelo de hemocitómetro con fines de comparación.

La relevancia de este modelo radica en su aplicación directa en entornos de laboratorio con equipamiento de bajo coste (teléfono móvil y adaptador), y en que demuestra que un ajuste fino con pocos datos puede convertir un modelo de segmentación general en una herramienta fiable para una tarea específica. La licencia MIT permite su uso comercial sin restricciones, aunque su generalización a otras líneas celulares o configuraciones de imagen no está probada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (Cellpose 4.1.1, variante con Segment Anything Model) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computadora) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | .npy (formato nativo de Cellpose) |

## Arquitectura y entrenamiento

El modelo se basa en Cellpose-SAM, la arquitectura de Cellpose 4.1.1 que combina la segmentación por flujos (gradientes horizontales y verticales) de Cellpose con el encoder de Segment Anything Model (SAM). Cellpose utiliza una U-Net modificada que predice flujos espaciales y máscaras de probabilidad, permitiendo segmentar células sin necesidad de anotaciones de bordes precisas. La integración con SAM mejora la capacidad de generalización y la calidad de las máscaras en dominios específicos.

El entrenamiento del modelo actual consistió en un ajuste fino de los pesos preentrenados de `cpsam` sobre 13 imágenes de hemocitómetro con adaptador de teléfono, recortadas a un único bloque de conteo de 4×4 y redimensionadas a un lado máximo de 1024 píxeles. Se utilizaron 1.069 máscaras celulares corregidas manualmente, obtenidas mediante un proceso humano en el bucle: las predicciones del modelo anterior se corrigieron en lugar de anotarse desde cero, lo que requirió 336 eliminaciones y 79 adiciones en las primeras ocho imágenes. El entrenamiento se realizó con 60 épocas, tasa de aprendizaje de 0,00001, weight decay de 0,1 y batch size de 1, usando GPU. No se menciona el uso de RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Segmentacion de celulas individuales en imagenes de campo claro de hemocitometro, produciendo mascaras binarias por celula.
- Recuento automatico de celulas a partir de las mascaras segmentadas, con un error medio de −1,1 % en el conjunto de evaluacion.
- Distincion entre celulas y restos (debris): el ajuste fino redujo los falsos positivos de 260 a 36 sin afectar al recall.
- Estimacion de confluencia celular mediante el modelo general (`generalmodel.npy`), aunque este no ha sido reentrenado ni evaluado en esta configuracion de imagen.
- Integracion con la aplicacion CellposeCellCounter, que anade un umbral de contraste local para determinar la viabilidad celular (funcion que no realiza el propio modelo).
- Capacidad de ejecucion con la libreria Cellpose, que incluye herramientas de anotacion humana en el bucle y exportacion de resultados.

## Casos de uso

- Recuento celular rutinario en laboratorios de cultivo: el modelo permite sustituir el conteo manual en camara de Neubauer por una fotografia con el telefono, reduciendo el tiempo y la variabilidad entre tecnicos. Basta con capturar la imagen, recortar un bloque de conteo y ejecutar la segmentacion.
- Control de viabilidad celular en experimentos de toxicidad: combinado con el umbral de contraste local de la aplicacion, el modelo proporciona el numero de celulas vivas y muertas, util para ensayos de citotoxicidad o criopreservacion.
- Automatizacion de pasajes celulares: al conocer la confluencia y el numero de celulas, el modelo ayuda a decidir cuando realizar un subcultivo, integrandose en flujos de trabajo de laboratorio con poco equipamiento.
- Validacion de protocolos de tincion o tratamientos: la comparacion de recuentos antes y despues de un tratamiento se puede hacer de forma objetiva y reproducible con las mascaras generadas.
- Educacion y formacion en biologia celular: estudiantes pueden practicar el recuento de hemocitometro con una herramienta automatica que ademas muestra las mascaras segmentadas, facilitando la comprension de la morfologia celular.
- Analisis de imagenes en entornos con recursos limitados: al funcionar con fotografias de telefono y poder ejecutarse en CPU (Cellpose soporta inferencia sin GPU), es adecuado para laboratorios sin infraestructura de computacion avanzada.

## Benchmarks y rendimiento

La evaluacion se realizo sobre seis imagenes reservadas (no usadas en entrenamiento ni en seleccion de hiperparametros) con 556 celulas anotadas manualmente. El emparejamiento se hizo con IoU a 0,5. Los resultados comparan el modelo reentrenado, el modelo base anterior (v1) y Cellpose-SAM sin ajustar.

| Modelo | Error de recuento | Precision | Recall | F1 |
|---|---|---|---|---|
| **Reentrenado (hemocytometer_retrained_20260825.npy)** | **−1,1 %** | **0,940** | 0,926 | **0,933** |
| v1 baseline (hemocytometer_v1_baseline.npy) | +40,6 % | 0,656 | 0,932 | 0,768 |
| Cellpose-SAM sin ajustar (off-the-shelf) | −63,7 % | 0,741 | 0,238 | 0,319 |

El modelo reentrenado reduce los falsos positivos de 260 a 36 manteniendo el recall. El Cellpose-SAM sin ajustar no es utilizable en estas imagenes: en un campo devolvio un unico objeto de 74 celulas presentes. No se han publicado resultados en benchmarks estandar de segmentacion (como COCO o Cityscapes) porque el modelo esta especializado en una tarea concreta.

## Requisitos de hardware

- El modelo se distribuye como un archivo .npy de Cellpose, por lo que los requisitos dependen de la libreria Cellpose y del tamano de la imagen de entrada.
- Para inferencia, Cellpose puede ejecutarse en CPU, aunque el entrenamiento descrito en la documentacion utilizo GPU (`--use_gpu`). No se especifica el modelo de GPU empleado.
- Las imagenes de trabajo se redimensionan a un lado maximo de 1024 píxeles, lo que limita el consumo de memoria. En una GPU consumer como una RTX 3060 o superior, la inferencia deberia completarse en menos de un segundo por imagen, aunque no se aportan mediciones concretas.
- Para despliegue, se puede usar la interfaz de linea de comandos de Cellpose, su API de Python, o el Space de Hugging Face proporcionado por el autor (CellposeCellCounter y CellposeCellCounterMobile).
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

La comparativa se limita a los modelos incluidos en el propio repositorio, ya que no se dispone de datos de otros modelos de segmentacion de hemocitometro.

| Modelo | Error de recuento | Precision | Recall | F1 | Licencia |
|---|---|---|---|---|---|
| CellposeCellCounter (reentrenado) | −1,1 % | 0,940 | 0,926 | 0,933 | MIT |
| v1 baseline (hemocytometer_v1_baseline.npy) | +40,6 % | 0,656 | 0,932 | 0,768 | Apache-2.0 (copia de myang4218) |
| Cellpose-SAM sin ajustar | −63,7 % | 0,741 | 0,238 | 0,319 | MIT (Cellpose) |

El modelo reentrenado supera claramente a su predecesor y al modelo base sin ajustar. No se han encontrado otros modelos publicados especificamente para recuento en hemocitometro con los que comparar.

## Limitaciones y advertencias

- El modelo solo es fiable en imagenes de campo claro de hemocitometro tomadas con adaptador de telefono y recortadas a un unico bloque de conteo de 4×4. En fotogramas completos sin recortar, las celulas se reducen a unos 7 píxeles y las poblaciones dejan de ser separables, con un rendimiento mucho peor.
- El entrenamiento se realizo con una unica linea celular, un adaptador y dos telefonos. La generalizacion a otras lineas, adaptadores o dispositivos no esta probada y podria degradar el rendimiento.
- El modelo no produce directamente la viabilidad celular; esta se calcula en la aplicacion mediante un umbral de contraste local descrito en el README del Space. Los resultados de viabilidad dependen de ese paso adicional.
- El archivo `generalmodel.npy` (usado para la pestana de confluencia) no ha sido reentrenado ni evaluado en esta configuracion de imagen. Los resultados de confluencia deben tratarse como indicativos, no como mediciones validadas.
- El error de recuento del modelo reentrenado es de −1,1 %, lo que indica una ligera infraestimacion del numero de celulas. Para aplicaciones que requieran precision absoluta, puede ser necesario un factor de correccion.
- Aunque la licencia MIT permite uso comercial, la ausencia de evaluacion en otros entornos limita su uso en produccion sin una validacion previa con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiangLabUMB/cellposecellcounter
- Space de la aplicacion CellposeCellCounter: https://huggingface.co/spaces/LiangLabUMB/cellposecellcounter
- Space de la version movil: https://huggingface.co/spaces/LiangLabUMB/CellposeCellCounterMobile
- Repositorio de Cellpose (MouseLand): https://github.com/MouseLand/cellpose
- Repositorio original de los modelos base (myang4218/cellposemodel): https://huggingface.co/myang4218/cellposemodel
- Perfil del autor (Liang Lab): https://huggingface.co/LiangLabUMB
- Noticia del Congressional App Challenge 2025: https://www.congressionalappchallenge.us/25-MD03/
