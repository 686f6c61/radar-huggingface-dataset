# constructelligence/painting-vision

## Resumen

Painting Vision es un modelo de segmentacion semantica de imagenes desarrollado por constructelligence, orientado especificamente a robots autonomos de pintura y acabado de superficies. A diferencia de un segmentador generico, no se limita a producir una mascara: a partir de un unico fotograma de una pared devuelve la superficie pintable, los elementos que no deben pintarse (rodapies, interruptores, enchufes, aparatos de aire acondicionado, puertas, ventanas) y el sustrato, y alimenta a un planificador posterior con el contorno de la pared, las esquinas, un plan de trazado con dos herramientas, waypoints legibles por maquina y una rejilla de progreso de pintura. Esta pensado para el problema dificil de la robotica de construccion: saber con precision donde esta la pared, donde estan las zonas de exclusion y cuando la capa esta completa.

Tecnicamente es un modelo de vision por computador construido sobre una fabrica de arquitecturas configurable mediante el flag `--arch`, que admite MobileNetV3-Large, ResNet-50/101 con DeepLabV3 y SegFormer. Sobre el backbone se montan dos cabezas independientes: una cabeza semantica de diez clases y una cabeza especifica de material (drywall), de modo que el estado de pintura y el tipo de sustrato nunca se confunden. La cobertura pintada se reporta como `wall_painted / (wall_painted + wall_unpainted)` con cotas inferior y superior que incorporan el area incierta.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato PyTorch y tamano de repositorio de 0,1 GB. En el momento de la consulta acumula 0 descargas y 0 likes, y se presenta explicitamente como una vista previa de investigacion. El autor ind�ca que la arquitectura de segmentacion, las herramientas de dataset, el planificador geometrico y el validador de profundidad estan implementados y con pruebas unitarias, y que los pesos se entrenan con el `train.py` abierto incluido en el repositorio sobre datos de captura real separados por sesion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fabrica configurable: DeepLabV3 con MobileNetV3-Large, DeepLabV3 con ResNet-50/101 y SegFormer; cabeza semantica de 10 clases mas cabeza independiente de material (drywall) |
| Parametros totales | no disponible (depende del backbone seleccionado en `--arch`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de PyTorch (`.pt`, por ejemplo `artifacts/best.pt`) |
| Pipeline | image-segmentation |
| Clases semanticas | other, wall_unpainted, wall_painted, wall_uncertain, skirting, switch/outlet, AC unit, door, window, wall_obstacle |
| Tamano del repositorio | 0,1 GB |
| Metricas declaradas | mean-iou, iou |

## Arquitectura y entrenamiento

El modelo se define en `models.py`, que actua como fabrica de arquitecturas y permite escoger el backbone en tiempo de configuracion: MobileNetV3-Large, ResNet-50 o ResNet-101 sobre DeepLabV3, o SegFormer. Sobre ese backbone se montan dos salidas: una cabeza de segmentacion semantica de diez clases (que distingue pared no pintada, pintada e incierta, ademas de rodapie, interruptor/enchufe, aparato de aire acondicionado, puerta, ventana y obstaculo de pared) y una cabeza independiente de material de drywall. Esta separacion evita que el estado de pintura se confunda con el tipo de sustrato, un requisito explicito del caso de uso. La cobertura pintada se calcula como `wall_painted / (wall_painted + wall_unpainted)` con cotas inferior y superior que incluyen el area incierta, de modo que la estimacion es consciente de su incertidumbre en lugar de ofrecer un unico numero falsamente preciso.

El entrenamiento se realiza con el script abierto `train.py` sobre datos de captura real del mundo fisico, separados por sesion, y admite muestreo balanceado por clase, por pared o hibrido, ademas de un refuerzo de perdida especifico para ventanas. El pipeline de datos incluye `data_balance.py` y `audit_dataset.py`, que puntuan cobertura y equilibrio entre interior/exterior, sustrato, iluminacion, clima, fase de pintura y clases, detectan fugas entre pared/sesion y clases poco representadas, y recomiendan cuantos ejemplos adicionales necesita cada hueco. La inferencia se realiza con `predict.py`, que produce mascaras y geometria con postprocesado de ventanas (fusion de fragmentos separados por parteluces, rectangulo orientado de area minima mediante calibradores rotatorios y filtrado por ratio de relleno y aspecto). El modulo `robot_planner.py` convierte las mascaras en un plan ejecutable con poligono de frontera ordenado, esquinas y waypoints con banderas de pintura activada/desactivada. No se especifican en la informacion disponible el numero de tokens de imagen, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Segmentacion semantica de diez clases sobre un fotograma de pared, mas deteccion separada del sustrato de drywall.
- Distincion entre pared pintada, no pintada e incierta, con estimacion de cobertura consciente de la incertidumbre.
- Deteccion y regularizacion de ventanas como zona de exclusion critica para la seguridad, incluyendo fusion de fragmentos separados por parteluces y ajuste de rectangulo orientado.
- Planificacion de trazado de pintura: poligono de frontera ordenado, esquinas, rectificacion opcional del plano de pared con longitudes en milimetros, plan de dos herramientas (rodillo para areas abiertas y brocha/trim para bordes y alrededor de elementos) y waypoints legibles por maquina con banderas de pintura y distancia de recorrido.
- Seguimiento del progreso de pintura mediante el flag `--state`, que apunta solo a lo que queda pendiente y determina cuando la pared esta terminada.
- Validacion de la salida de vision con profundidad o LiDAR: ajuste RANSAC del plano de pared, deteccion de protrusiones y recesos, concordancia entre receso y ventana y escala metrica de milimetros por pixel derivada de la profundidad.
- Soporte de test-time augmentation (TTA) en la inferencia mediante la bandera `--tta`.
- Soporte de tool calling / function calling: no aplica (modelo de vision, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo, aunque alimenta a un planificador downstream.
- Capacidades multilingues: no aplica; el modelo no procesa lenguaje, y la etiqueta de idioma declarada es `en`.

## Casos de uso

- Robots autonomos de pintura de interiores: el modelo segmenta que es pared pintable y que es rodapie, interruptor o puerta, y entrega a `robot_planner.py` el contorno y las esquinas para que la herramienta no cruce un borde, gracias a la planificacion de dos herramientas con margen de holgura fisica.
- Pintura de fachadas de edificios: la deteccion y regularizacion de ventanas como zona de exclusion, con ajuste de rectangulo orientado valido en cualquier angulo de vision, permite generar geometria de keep-out fiable en exteriores, donde una ventana mal delimitada es un riesgo de seguridad.
- Estimacion del progreso de pintura en obra: con el seguimiento `--state`, el modelo apunta solo a la superficie restante y determina cuando la pared esta completa, evitando repintar zonas ya cubiertas y reduciendo el consumo de material.
- Inspeccion de calidad y cobertura: la salida de cobertura con cotas inferior y superior permite auditar si una capa alcanza el umbral requerido sin depender de un unico numero, y reportar explicitamente el remanente fisicamente inalcanzable.
- Robotica de acabado con validacion 3D: `depth_validate.py` contrasta la salida de vision con profundidad o LiDAR (ajuste RANSAC del plano, deteccion de protrusiones y recesos) para detectar tuberias o ventanas omitidas y para derivar la escala metrica en milimetros por pixel, de modo que el planificador opere en unidades reales.
- Curacion y auditoria de datasets de construccion: `data_balance.py` y `audit_dataset.py` puntuan equilibrio por interior/exterior, sustrato, iluminacion, clima, fase de pintura y clase, detectan fugas entre pared y sesion y recomiendan el numero de muestras necesarias para cerrar cada hueco.
- Integracion en pipelines de investigacion en robotica: al ser un repositorio PyTorch con `train.py`, `predict.py`, `robot_planner.py` y `depth_validate.py`, permite reproducir el entrenamiento, ajustar el backbone y extender la cabeza semantica a nuevas clases de elementos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El model-index del autor declara las metricas `mean-iou` e `iou`, pero la lista de resultados esta vacia. Como dato operativo reportado en la model card, en una ejecucion documentada sobre una fachada real el plan de cobertura planificada paso del 68 por ciento (solo rodillo) al 97,5 por ciento (rodillo mas brocha) sobre la misma pared, siendo el remanente la parte fisicamente inalcanzable reportada de forma explicita. Esta cifra corresponde al planificador de trazado, no a una metrica de precision de segmentacion, y no debe interpretarse como un resultado de benchmark del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Depende del backbone elegido. A modo de referencia arquitectonica, MobileNetV3-Large es un backbone ligero (del orden de pocos millones de parametros), ResNet-50 y ResNet-101 son de tamano medio (decenas de millones de parametros) y las variantes de SegFormer van de pequenas a grandes, por lo que el consumo de memoria de inferencia variara en consecuencia.
- GPU recomendadas: no especificadas por el autor. Para los backbones ligeros (MobileNetV3-Large) basta una GPU de consumo; para ResNet-101 o SegFormer de mayor tamano es preferible una GPU con mas memoria (por ejemplo, serie RTX con suficiente VRAM, o GPU de datacenter A100/H100 para procesamiento por lotes).
- Cabe en GPU de consumo: probablemente si para los backbones ligeros, dado el tamano del repositorio de 0,1 GB y la naturaleza de los backbones soportados; no confirmado por el autor.
- Opciones de despliegue: el repositorio es nativo de PyTorch, con inferencia via `predict.py`. No se documentan exportaciones a otros formatos; opciones razonables no confirmadas serian TorchScript, ONNX Runtime o TensorRT. Herramientas de despliegue de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de segmentacion de imagen.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| painting-vision (constructelligence) | Segmentacion semantica con backbone configurable (DeepLabV3 / SegFormer) | Segmentacion de pared, keep-outs, sustrato, plan de pintura y validacion 3D | Un fotograma de camara, opcionalmente profundidad/LiDAR | apache-2.0 | HuggingFace, 0 descargas |
| DeepLabV3 (referencia) | Segmentacion semantica | Segmentacion general de imagenes | Un fotograma | Depende de la implementacion | Ampliamente disponible |
| SegFormer (referencia) | Transformer de segmentacion semantica | Segmentacion general de imagenes | Un fotograma | Depende de la variante | Ampliamente disponible |
| Segment Anything (SAM) | Segmentacion promptable | Segmentacion generica guiada por prompt | Un fotograma mas prompt | Apache-2.0 en versiones recientes | Ampliamente disponible |

La diferencia principal de painting-vision frente a estos segmentadores generales es su especializacion: no solo produce mascaras, sino clases orientadas a pintura, un plan de trazado ejecutable y una validacion metrica con profundidad. No se dispone de datos comparativos de rendimiento (IoU) entre painting-vision y estos modelos, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Estado de vista previa de investigacion: el propio autor lo declara como research preview, no como un modelo listo para produccion.
- Ausencia de benchmarks publicados: no hay resultados de mIoU ni IoU en la informacion disponible, por lo que el rendimiento de segmentacion no esta cuantificado publicamente.
- Sesgos conocidos: no documentados de forma explicita. Las herramientas de auditoria del propio repositorio (`audit_dataset.py`, `data_balance.py`) sugieren que el equilibrio entre interior/exterior, iluminacion, clima y clases es un riesgo reconocido, pero no se especifican sesgos concretos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo analogo es la segmentacion incorrecta de bordes, ventanas o zonas inciertas, mitigado parcialmente por la clase `wall_uncertain`, el postprocesado de ventanas y la validacion con profundidad o LiDAR.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje; la etiqueta de idioma `en` es meramente informativa y no implica capacidades multilingues.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es un research preview; conviene verificar el estado de los pesos antes de usarlo en produccion.
- Dependencia de calibracion: el planificador trabaja en milimetros si se proporciona `--mm-per-unit` o si se deriva la escala del validador de profundidad; sin esa calibracion, las longitudes del plan no son metricas.
- Interpretacion de la cifra de cobertura: el salto del 68 al 97,5 por ciento corresponde al plan de trazado sobre una pared concreta, no a una precision de segmentacion, y no debe generalizarse.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/constructelligence/painting-vision

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales. El repositorio al que hace referencia la model card (`models.py`, `train.py`, `predict.py`, `robot_planner.py`, `depth_validation.py`, `data_balance.py`, `audit_dataset.py`) se distribuye junto con el modelo, pero no se facilita una URL externa independiente.
