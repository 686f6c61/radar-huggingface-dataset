# G2mus/night-vehicle-yolov8s

## Resumen

`night-vehicle-yolov8s` es un modelo de deteccion de objetos basado en YOLOv8s, desarrollado por G2mus, que ha sido ajustado para detectar vehiculos (coche, camion y autobus) en escenas de trafico nocturno. La mitad de sus datos de entrenamiento proceden de fotogramas nocturnos reales de la particion de validacion del dataset BDD100K. El modelo forma parte de un experimento de ablacion que investiga si las imagenes diurnas oscurecidas pueden sustituir a los datos nocturnos reales; la conclusion del autor es que no pueden, y los resultados de los brazos de control se publican en un repositorio companion.

Su relevancia radica en el problema de la deteccion de vehiculos con poca luz, un reto critico en conduccion autonoma y vigilancia de trafico. La arquitectura es YOLOv8s, un detector de una etapa basado en CNN, del tamano "small" de la familia Ultralytics. No se dispone de la cifra exacta de parametros totales ni de longitud de contexto, ya que es un modelo de vision que no procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (Ultralytics) |

## Arquitectura y entrenamiento

El modelo parte de `yolov8s.pt`, preentrenado en COCO, y se somete a un ajuste fino para la tarea de deteccion de vehiculos en escenas de trafico. El dataset de entrenamiento esta compuesto por 1.829 imagenes diurnas y 1.829 imagenes nocturnas de la particion de validacion de BDD100K, un total de 3.658 muestras. El entrenamiento se realizo durante 50 epochs con un batch de 32, resolucion de 640 píxeles y semilla fija 17, usando las politicas de aumento de imagenes por defecto de Ultralytics (`hsv_v=0.4`, mosaic, volteos). Todo el proceso se ejecuto en una unica GPU RTX 5090 y tardo 9 minutos. El modelo no incorpora tecnicas como RLHF o DPO, ya que se trata de un detector de objetos supervisado de forma clasica.

## Capacidades

- Deteccion de objetos en imagenes de trafico, reconociendo las clases `car` (coche), `truck` (camion) y `bus` (autobus).
- Rendimiento especificamente optimizado para escenas nocturnas: frente a una linea base entrenada solo con imagenes diurnas, el modelo mejora el recall nocturno de 0.388 a 0.488, lo que significa que detecta vehiculos que el modelo diurno no llega a registrar.
- Capacidad de ejecutar inferencia con la libreria Ultralytics, aprovechando los modos `predict` y de exportacion propios de YOLOv8.
- No soporta tool calling, agentes, vision multimodal (mas alla de la deteccion) ni procesamiento de lenguaje natural.

## Casos de uso

- Integracion en sistemas de conduccion autonoma para la deteccion de vehiculos en carretera durante la noche, donde la iluminacion es escasa y la visibilidad reducida.
- Vigilancia de trafico con camaras fijas en carreteras o cruces, para contabilizar y clasificar vehiculos en horario nocturno, aprovechando su recall elevado en condiciones de poca luz.
- Sistemas de asistencia a la conduccion (ADAS) en vehiculos, que requieren detectar coches, camiones y autobuses en tiempo real y con baja iluminacion.
- Etiquetado automatico de grabaciones de dashcam para analisis de accidentes o comportamiento de trafico, especialmente en secuencias nocturnas.
- Investigacion en vision nocturna como modelo de referencia en ablaciones, comparando datos reales nocturnos frente a sinteticos, tal como plantea el propio autor.
- Base para transferencia de aprendizaje: el modelo puede servir como punto de partida para fine-tuning en dominios nocturnos mas complejos o con mas clases, dado que sus pesos estan ajustados a condiciones de baja luz.

## Benchmarks y rendimiento

Resultados del autor sobre imagenes de test no vistas de BDD100K. La metrica principal es mAP@50, junto con mAP@50-95 para la condicion nocturna.

| Modelo | daytime | dawn/dusk | night | night mAP@50-95 |
|---|---|---|---|---|
| this model (mitad noche real) | 0.517 | 0.542 | **0.535** | **0.344** |
| misma receta, solo diurno | 0.592 | 0.569 | 0.416 | 0.258 |
| misma receta, noche sintetica | 0.569 | 0.560 | 0.410 | 0.257 |

Rendimiento nocturno por clase, comparado con la linea base diurna:

| Clase | este modelo | linea base solo diurno |
|---|---|---|
| car | **0.732** | 0.635 |
| truck | **0.413** | 0.277 |
| bus | **0.459** | 0.336 |

En la condicion nocturna, el modelo alcanza una precision de 0.645 (frente a 0.555 de la linea base) y un recall de 0.488 (frente a 0.388).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un modelo YOLOv8s, se espera una huella de memoria moderada, pero no hay cifras concretas.
- GPU recomendadas: no se especifican requisitos de inferencia. El entrenamiento se realizo en una unica RTX 5090 durante 9 minutos, lo que sugiere que el modelo es ligero.
- Compatibilidad con GPUs de consumo: previsiblemente si, dado el tamano del modelo, aunque no hay datos oficiales de referencia.
- Opciones de despliegue: inferencia mediante la libreria Ultralytics. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que no son aplicables a este tipo de detector.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion mas directa se establece con los otros dos brazos del experimento de ablacion, que comparten el mismo esquema de entrenamiento pero con distintas composiciones de datos.

| Modelo | Datos de entrenamiento | mAP daytime | mAP night | night mAP@50-95 |
|---|---|---|---|---|
| night-vehicle-yolov8s | 1.829 dia + 1.829 noche | 0.517 | **0.535** | **0.344** |
| version solo diurno | 3.658 dia | 0.592 | 0.416 | 0.258 |
| version noche sintetica | 1.829 dia + 1.829 sintetico | 0.569 | 0.410 | 0.257 |

Estos tres modelos no difieren en arquitectura ni en presupuesto de entrenamiento, sino en la fuente de datos nocturnos. No se han encontrado comparativas con otros detectores como YOLOv8m o versiones entrenadas en el dataset completo de BDD100K.

## Limitaciones y advertencias

- El modelo sacrifica precision diurna a cambio de precision nocturna: baja de 0.592 a 0.517 en mAP diurno, lo que supone una perdida del 12.7 % frente a la linea base. Esta degradacion es intencionada, ya que el experimento mantiene constante el tamano del conjunto de entrenamiento.
- El dataset de entrenamiento es pequeno (3.658 imagenes) y consta de 50 epochs, por lo que el modelo dista de ser un detector de ultima generacion. Cualquier modelo entrenado sobre el split completo de BDD100K (100.000 imagenes) lo superara sistematicamente.
- Los resultados se han obtenido con una unica semilla. Diferencias de uno o dos puntos porcentuales entre modelos similares pueden no ser estadisticamente significativas, aunque la brecha nocturna del 28.6 % en recall si lo es.
- Solo reconoce tres clases: coche, camion y autobus. Se han excluido motocicletas, bicicletas y conductores debido al escaso numero de instancias nocturnas en el subconjunto de datos.
- El dominio de entrenamiento es BDD100K, que contiene grabaciones de dashcam en Estados Unidos. Una camara fija de trafico con angulo cenital representa una distribucion distinta y probablemente requiera fine-tuning.
- Al tratarse de un modelo de deteccion de objetos, no soporta tareas de lenguaje, contexto conversacional ni generacion de texto.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/G2mus/night-vehicle-yolov8s](https://huggingface.co/G2mus/night-vehicle-yolov8s)
- Repositorio companion con los brazos de control del experimento: [https://github.com/GoktuGumus/night-vehicle-detection](https://github.com/GoktuGumus/night-vehicle-detection)
- Mirror del dataset BDD100K utilizado: [https://huggingface.co/datasets/dgural/bdd100k](https://huggingface.co/datasets/dgural/bdd100k)
