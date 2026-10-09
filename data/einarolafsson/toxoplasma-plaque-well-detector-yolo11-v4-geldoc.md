# einarolafsson/toxoplasma-plaque-well-detector-yolo11-v4-geldoc

## Resumen

El modelo `toxoplasma-plaque-well-detector-yolo11-v4-geldoc` es un detector de objetos de una sola clase desarrollado por el usuario einarolafsson para localizar pocillos (wells) de ensayo en placas de Toxoplasma, no placas de lisis. Se trata de un fine-tune de YOLO11 en su variante nano (YOLO11n) bajo el framework Ultralytics, etiquetado por el propio autor como candidato y no promovido a producción. Localiza una unica clase, `plaque_well` (indice 0), y esta pensado para integrarse en el pipeline spaCR de analisis de ensayos de placas.

El modelo parte del incumbente YOLO11 v3 y se ha reentrenado durante 150 epocas con entradas de 640 pixeles y batch 16, usando 452 imagenes de entrenamiento (441 preexistentes mas 11 de Gel Doc) y 124 de validacion (121 preexistentes mas 3 de Gel Doc), manteniendo juntas las agrupaciones fisicas de placa y las reimagenes con semilla fija 42. La relevancia de esta version radica en la incorporacion de imagenes del dominio Gel Doc, que mejoran la metrica mAP50-95 en ese subconjunto (de 0.8954 a 0.9307), aunque a costa de un retroceso en el conjunto limpio del incumbente (de 0.8930 a 0.8842).

El autor es explicito en que la puerta de promocion por no regresion no se supera, por lo que este checkpoint debe considerarse experimental. No es sustituto del detector YOLO26 v4 ya publicado, sino una variante distinta asociada al flujo spaCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics YOLO11, detector de objetos de una etapa, variante nano) |
| Parametros totales | no disponible (corresponde a la variante nano de YOLO11; no se declara el recuento en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos); resolucion de entrada 640 x 640 pixeles |
| Tipos de cuantizacion | no disponible en la informacion (exportable via Ultralytics a otros formatos) |
| Idiomas soportados | no disponible / no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | agpl-3.0 |
| Formato de pesos | .pt (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

YOLO11 es la familia de detectores de objetos de una etapa mantenida por Ultralytics, con un backbone y cuello basados en bloques convolucionales y mecanismos de atencion, cabecera anchor-free y asignacion de etiquetas tipo task-aligned. Este checkpoint concreto es un fine-tune de la variante nano (YOLO11n), por lo que prioriza velocidad e inferencia en hardware modesto frente a la precision de las variantes mayores (s, m, l, x). La tarea es deteccion de cajas, no segmentacion; el autor advierte que las metricas AP reportadas son las estandar de YOLO basadas en ranking de confianza y no la definicion de AP de segmentacion.

El entrenamiento se realizo durante 150 epocas con entradas de 640 pixeles y batch 16, partiendo del incumbente YOLO11 v3. El conjunto de entrenamiento consta de 452 imagenes (441 preexistentes mas 11 de Gel Doc) y el de validacion de 124 imagenes (121 preexistentes mas 3 de Gel Doc), manteniendo juntas las agrupaciones fisicas de placa y las reimagenes con semilla 42. Se excluyo la placa Low Plate5 porque su placa revisada contenia 11 cajas en lugar de las 12 esperadas. Las 3 placas Gel Doc se usaron para seleccionar `best.pt`, por lo que constituyen validacion y no un test independiente, y una unica semilla de entrenamiento no permite estimar la variacion entre ejecuciones.

## Capacidades

- Deteccion de pocillos en placas de ensayo de Toxoplasma: una unica clase, `plaque_well` (indice 0).
- Localizacion de wells (no de placas de lisis), segun explicita el autor.
- Inferencia a resolucion de entrada de 640 pixeles con umbral de confianza 0.25 y NMS con IoU 0.7 como configuracion de referencia.
- Integracion en el pipeline spaCR, seleccionando explicitamente `toxoplasma_well_detector_v3` en la configuracion.
- Recuento de pocillos por placa: recupera el recuento exacto esperado en las 3 placas Gel Doc reservadas.
- Capacidades linguisticas, tool calling, agentes o razonamiento multi-paso: no aplica (modelo puramente de vision por computador).

## Casos de uso

- Cuantificacion de ensayos de placas de Toxoplasma en laboratorio: el modelo localiza los pocillos para segmentar despues las regiones de analisis y calcular recuentos de placas por pocillo en estudios de infeccion o citotoxicidad.
- Integracion en pipeline spaCR: al seleccionar explicitamente el detector `toxoplasma_well_detector_v3`, el sistema puede automatizar la fase de localizacion de pocillos dentro de un flujo de cribado de alto contenido ya existente.
- Cribado de farmacos antiparasitarios: la deteccion fiable de pocillos permite comparar el efecto de compuestos sobre la formacion de placas de Toxoplasma midiendo cambios relativos en el area ocupada por pocillo.
- Automatizacion de lectura de placas con imagenes Gel Doc: la v4 incorpora especificamente imagenes de este dominio, reduciendo la necesidad de ajuste manual cuando la adquisicion se realiza con ese sistema.
- Preprocesado para modelos posteriores: la salida de cajas se puede usar como paso previo para modelos de segmentacion de placas o clasificadores de fenotipo, gracias a la recuperacion exacta del recuento de pocillos.
- Control de calidad en lotes de placas: al detectar si el numero de pocillos encontrados coincide con el esperado (por ejemplo, 12 por placa), el modelo puede marcar automaticamente placas anomalas para revision manual.
- Reproducibilidad de experimentos: la inclusion de pesos, base de datos SQLite del modelo, informe PDF, curvas de entrenamiento y hashes de origen facilita auditar y repetir resultados en entornos de investigacion.

## Benchmarks y rendimiento

Resultados de la scorecard del autor sobre los conjuntos de validacion (metricas de caja YOLO):

| Conjunto de validacion | Imagenes | Modelo | mAP50 | mAP50-95 | Precision | Recall |
|---|---:|---|---:|---:|---:|---:|
| v3 | 121 | v3 | 0.9928 | 0.8921 | 0.9867 | 0.9868 |
| v3_clean | 73 | v3 | 0.9917 | 0.8930 | 0.9634 | 0.9876 |
| geldoc | 3 | v3 | 0.9950 | 0.8954 | 0.9982 | 1.0000 |
| v3 | 121 | v4 | 0.9942 | 0.8919 | 0.9890 | 0.9903 |
| v3_clean | 73 | v4 | 0.9940 | 0.8842 | 0.9698 | 0.9979 |
| geldoc | 3 | v4 | 0.9950 | 0.9307 | 0.9982 | 1.0000 |

Notas del autor relevantes para interpretar la tabla: el conjunto historico de 121 imagenes contiene 28 duplicados exactos de entrenamiento; `v3_clean` conserva 73 imagenes tras exclusiones exactas y de figuras canonicas; las 3 placas Gel Doc se usan para seleccionar `best.pt` y por tanto son validacion, no test independiente; existe regresion en mAP50-95 sobre `v3_clean` (0.8930 a 0.8842), por lo que falla la puerta de no regresion pese a la mejora en Gel Doc (0.8954 a 0.9307). Ambos modelos recuperan el recuento exacto esperado en las 3 placas Gel Doc reservadas con confianza 0.25 / NMS IoU 0.7. No hay comparacion con YOLO estandar (stock), que carece de la clase `plaque_well`.

## Requisitos de hardware

- VRAM estimada: muy baja por tratarse de la variante nano; cabe holgadamente en GPUs de consumo e incluso puede ejecutarse en CPU, aunque no se declaran cifras exactas en la model card.
- GPU recomendadas: cualquiera con soporte CUDA suficiente para YOLO11n (por ejemplo, GTX 1050 Ti o superior, RTX 3060/4090, A100, H100); las GPUs de gama alta no son necesarias para este tamano.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en hardware integrado para inferencia a baja frecuencia.
- Opciones de despliegue: Ultralytics (carga directa de `weights/yolo_welldetect_v4_geldoc.pt`), exportacion a ONNX, TensorRT u otros formatos soportados por Ultralytics, y ejecucion en CPU.
- Latencia y throughput: no disponible; no se publican datos de latencia ni de imagenes por segundo en la informacion proporcionada.
- Tamano del repositorio: 0.0 GB segun HuggingFace.

## Comparativa con modelos similares

| Modelo | Tarea / clases | Contexto / entrada | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11 v4 Gel Doc (este modelo) | Deteccion de pocillos, 1 clase (`plaque_well`) | 640 x 640 px | mAP50-95 0.9307 en geldoc; 0.8842 en v3_clean | agpl-3.0 | HuggingFace (einarolafsson) |
| YOLO11 v3 (incumbente) | Deteccion de pocillos, 1 clase (`plaque_well`) | 640 x 640 px | mAP50-95 0.8954 en geldoc; 0.8930 en v3_clean | agpl-3.0 (Ultralytics) | HuggingFace (einarolafsson) |
| YOLO26 v4 (publicado previamente) | Deteccion de pocillos (segun el autor) | no disponible | no disponible | no disponible | HuggingFace (einarolafsson) |
| YOLO11 stock (Ultralytics) | Deteccion de objetos genericos | 640 x 640 px | no aplica: no tiene la clase `plaque_well` | agpl-3.0 | Ultralytics |

El autor indica explicitamente que este checkpoint no es sustituto de YOLO26 v4 y que la comparacion de referencia es el incumbente YOLO11 v3, no YOLO stock, porque este ultimo carece de la clase objetivo.

## Limitaciones y advertencias

- Estado de candidato: el propio autor lo marca como "candidate, not promoted"; no debe desplegarse como el modelo por defecto sin revision.
- Puerta de no regresion no superada: empeora el mAP50-95 sobre el conjunto limpio del incumbente (0.8930 a 0.8842).
- Riesgo de sobreajuste a Gel Doc: solo 11 imagenes de entrenamiento y 3 de validacion pertenecen a ese dominio, y esas 3 placas se usaron para seleccionar `best.pt`, por lo que no constituyen un test independiente.
- Duplicados en validacion: el conjunto historico de 121 imagenes contiene 28 duplicados exactos de entrenamiento; las metricas sobre el deben interpretarse con cautela (de ahi `v3_clean`).
- Variabilidad no estimada: se uso una unica semilla de entrenamiento, por lo que no hay estimacion de la variacion entre ejecuciones.
- Recuento limitado de placas excluidas: se excluyo Low Plate5 por tener 11 cajas en lugar de 12, lo que sugiere posibles errores de etiquetado en otros casos no auditados.
- Metricas no de segmentacion: los valores AP son los estandar de cajas YOLO y no equivalen a la definicion de AP de segmentacion.
- Licencia AGPL-3.0 (Ultralytics): el uso comercial implicado puede exigir cumplir con las obligaciones de copyleft de la AGPL o adquirir una licencia comercial de Ultralytics; conviene revisarlo antes de produccion.
- Alcance muy restringido: una sola clase (`plaque_well`) y sin capacidades linguisticas ni de razonamiento; no es un modelo de proposito general.
- Datos no incluidos: el repositorio no incluye imagenes ni etiquetas originales, solo pesos, base de datos del modelo y documentacion de auditoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-plaque-well-detector-yolo11-v4-geldoc
- Framework Ultralytics (YOLO11): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Otros enlaces (paper, blog, demo, repositorio spaCR): no disponible en la informacion proporcionada.
