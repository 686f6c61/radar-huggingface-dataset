# kenantabak/yolo26s-electrical-schematic-components-tr

## Resumen

`yolo26s-electrical-schematic-components-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26 en su variante small (`yolo26s`), entrenado por Kenan Tabak en la plataforma EVREN (SSYZ) para localizar simbolos y componentes en esquemas electricos. El modelo resuelve un problema de vision por computador aplicado a ingenieria: la digitalizacion automatica de diagramas de circuitos, identificando resistencias, condensadores, fuentes y nodos de conexion en imagenes de planos tecnicos.

Se distribuye a traves de Hugging Face con la libreria Ultralytics y un peso de aproximadamente 19,4 MB, lo que lo hace muy ligero para despliegue en produccion. El entrenamiento se realizo a una resolucion de entrada de 768x768 pixeles durante 60 epocas, con un conjunto final de 6 clases activas tras eliminar dos clases con muy pocas instancias (1 y 12 cajas respectivamente).

Su relevancia actual radica en el nicho: los modelos de deteccion genericos no estan optimizados para simbologia de esquemas electricos, donde la orientacion de las etiquetas importa y las clases son muy especificas. Este modelo aplica hiperparametros de aumento de datos adaptados al dominio (desactivando volteos y rotaciones) y reporta metricas altas en validacion, lo que lo convierte en una referencia practica para pipelines de digitalizacion de documentacion tecnica en turco e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (variante small, `yolo26s`), deteccion de objetos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tr, en (etiquetas y documentacion) |
| Licencia | CC BY 4.0 (el componente de framework Ultralytics queda sujeto a AGPL-3.0) |
| Formato de pesos | `.pt` (Ultralytics PyTorch) |
| Resolucion de entrenamiento | 768x768 |
| Tamano del modelo | ~19,4 MB |
| Clases | 6 activas (de 7 en el dataset original) |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26 en su variante small, un detector de objetos de una sola etapa orientado a inferencia en tiempo real. La eleccion de la variante `s` responde a un compromiso entre precision y coste computacional: el autor reporta un entrenamiento de 0,111 horas-GPU (aproximadamente 1,11 creditos en la plataforma EVREN), lo que indica un modelo ligero y rapido de entrenar.

El entrenamiento se realizo sobre el dataset "Elektrik Devre Şeması Bileşenleri Tespiti" (7 clases) de la plataforma EVREN, con calidad Grade A. Se configuraron `imgsz=768`, `epochs=60`, `batch=16`, `patience=20` y `cos_lr=True`. La innovacion tecnica principal esta en el diseno del aumento de datos: se desactivaron explicitamente los volteos horizontal y vertical (`fliplr=0.0`, `flipud=0.0`), las rotaciones (`degrees=0.0`) y el borrado aleatorio (`erasing=0.0`), porque las etiquetas direccionales de los circuitos se degradarian con esas transformaciones. Se mantuvieron `mosaic=0.6`, `close_mosaic=12`, `scale=0.35`, `hsv_s=0.05` y `hsv_v=0.3`. Ademas, se eliminaron dos clases con muy pocas instancias (1 y 12 cajas) para evitar desequilibrios severos, quedando 6 clases activas. El mejor checkpoint se alcanzo en la epoca 35 de 55 efectivas.

## Capacidades

- Deteccion de objetos en imagenes de esquemas electricos con 6 clases de componentes.
- Localizacion de resistencias, condensadores, fuentes y nodos de conexion en diagramas de circuitos.
- Inferencia a resolucion configurable (entrenado a 768x768, con ejemplo de prediccion a 640x640).
- Salida compatible con el ecosistema Ultralytics: cajas delimitadoras, clases y puntuaciones de confianza.
- Soporte de umbrales configurables de confianza (`conf`) e IoU (`iou`) en la prediccion.
- Capacidad de visualizacion directa de resultados (`results[0].show()`).
- No dispone de tool calling, razonamiento multi-paso ni capacidades de texto, vision general o audio; es un detector de objetos puro.
- Soporte bilingue en documentacion y etiquetas (turco e ingles).

## Casos de uso

- Digitalizacion de esquemas electricos en papel o PDF: el modelo detecta simbolos de componentes sobre imagenes escaneadas de diagramas, permitiendo reconstruir la representacion digital del circuito a partir de la posicion de cada caja delimitadora.
- Extraccion de inventario de componentes: a partir de las detecciones se puede generar automaticamente una lista de materiales (BOM) contando instancias por clase, util en auditoria de planos y control de versiones de documentacion tecnica.
- Asistencia a ingenieros electricos: integrado en una herramienta de edicion, el modelo resalta componentes sobre el esquema para facilitar revision, anotacion o correccion manual, reduciendo el tiempo de inspeccion.
- Conversion de esquemas a formatos CAD o netlists: las coordenadas y clases detectadas alimentan un postprocesado que reconstruye la topologia del circuito y la exporta a formatos de simulacion o diseno.
- Control de calidad documental: verificacion automatica de que los planos contienen los simbolos esperados y deteccion de componentes ausentes o mal dibujados en lotes de documentacion.
- Indexacion y busqueda visual de planos: al detectar componentes, se pueden generar metadatos que permitan buscar esquemas por tipo de componente o densidad, en repositorios documentales de ingenieria.
- Formacion y docencia: uso en entornos educativos para etiquetar y explicar simbolos electricos sobre imagenes reales de esquemas, con visualizacion inmediata de detecciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---:|
| mAP@50 | 97,87 % |
| mAP@50-95 | 69,73 % |
| Precision | 96,30 % |
| Recall | 96,85 % |
| F1 | 95,83 % |
| Mejor epoca / total | 35 / 55 |
| Tiempo de entrenamiento | 0,111 horas-GPU |

Rendimiento por clase:

| Clase | mAP@50 | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| 3 | 99,50 % | 99,44 % | 100,00 % | 99,72 % |
| 4 | 98,77 % | 96,57 % | 98,25 % | 97,40 % |
| 6 | 98,73 % | 98,83 % | 98,70 % | 98,76 % |
| 0 | 98,32 % | 94,52 % | 100,00 % | 97,18 % |
| 7 | 96,05 % | 95,26 % | 94,87 % | 95,07 % |
| 2 | 85,61 % | 87,73 % | 86,00 % | 86,86 % |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo (~19,4 MB en pesos) y la variante small de YOLO26, la huella en memoria es reducida y cabe en GPUs de gama baja.
- GPU recomendadas: no especificadas por el autor; por la naturaleza del modelo, es apto para GPUs consumer (RTX 3060, RTX 4090) y para aceleradores de inferencia en CPU.
- Cabe en GPU consumer: si, por el reducido tamano de pesos y la resolucion de entrada moderada (768x768).
- Opciones de despliegue: Ultralytics (Python), exportacion a formatos compatibles con el framework (ONNX, TensorRT, entre otros, segun soporte de Ultralytics); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolo26s-electrical-schematic-components-tr` | YOLO26s, deteccion de objetos | no disponible (~19,4 MB de pesos) | 768x768 | CC BY 4.0 (framework AGPL-3.0) | Hugging Face |
| YOLO11 (generico) | Deteccion de objetos | no disponible | configurable | AGPL-3.0 | Ultralytics |
| YOLO26 (generico) | Deteccion de objetos | no disponible | configurable | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks comparativos frente a estos modelos en la informacion proporcionada. La diferencia principal frente a los modelos genericos es el entrenamiento especifico en simbologia de esquemas electricos y la desactivacion de aumentos que degradan etiquetas direccionales.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un dataset de esquemas electricos turcos; puede generalizar mal a otros estilos de simbologia, idiomas o estandares de dibujo (por ejemplo, normas IEC frente a ANSI).
- Las metricas son declaradas por el autor y no estan verificadas de forma independiente (`verified: false` en el model-index).
- La clase 2 presenta un rendimiento notablemente inferior (mAP@50 del 85,61 %) frente al resto, lo que puede generar falsos negativos o positivos en ese tipo de componente.
- Se eliminaron dos clases del dataset original por escasez de instancias (1 y 12 cajas), por lo que esos componentes no seran detectados.
- Riesgo de alucinacion inherente a la deteccion: puede producir cajas espurias en imagenes con ruido, baja resolucion o simbologia atipica; se recomienda ajustar los umbrales `conf` e `iou`.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero el componente de framework Ultralytics queda sujeto a AGPL-3.0, lo que puede imponer obligaciones adicionales en despliegues de codigo cerrado.
- No se documentan sesgos especificos ni evaluaciones fuera del conjunto de validacion del dataset de origen.
- No apto para tareas fuera de la deteccion de objetos: no genera texto, no razona y no procesa lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-electrical-schematic-components-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/elektrik-devre-semasi-sembol-ve-bilesen-tespiti-6-sinif
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/elektrik-devre-semasi-bilesenleri-tespiti-7-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catalogo de datasets de vision por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
