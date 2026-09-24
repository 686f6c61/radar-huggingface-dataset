# Edgematrix-JP/AIPV1EMI0001

## Resumen

AIPV1EMI0001 es un detector de objetos basado en la arquitectura YOLOv7-tiny, publicado por el usuario Edgematrix-JP, y ajustado por EdgeMatrix sobre un conjunto de datos propio de aparcamientos con tres clases: `car`, `person` y `truck`. El modelo resuelve deteccion en tiempo real de vehiculos y peatones en entornos de trafico e industriales, con una entrada fija de 640x640 pixeles y una salida optimizada para inferencia en el borde.

A diferencia de un modelo de lenguaje, aqui no hay tokens ni contexto: el artefacto principal es un export a ONNX que incorpora un nodo `EfficientNMS_TRT`, lo que permite que la supresion de no maximos se ejecute dentro del grafo de TensorRT y no en el codigo del cliente. El repositorio incluye tambien un motor TensorRT precompilado en FP16 para JetPack 6 / L4T R36.3 sobre aarch64, ademas de un fichero `SHA256SUMS` para verificar la integridad de las descargas.

Su relevancia es practica y acotada: cubre el caso tipico de despliegue en camaras de aparcamiento o de control de accesos sobre hardware Jetson con DeepStream, con licencia Apache-2.0 para los pesos (el codigo upstream de YOLOv7 sigue bajo MIT). El repositorio no publica metricas de precision, numero de parametros, composicion del dataset ni resultados de benchmarks, y a fecha de la ficha acumula 0 descargas y 0 "likes", por lo que no existe validacion independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv7-tiny (detector de objetos de una etapa, red convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 640x640 px) |
| Tipos de cuantizacion | FP16 (motor TensorRT precompilado); no se documentan otras precisiones |
| Idiomas soportados | no aplica; etiquetas de clase en ingles (`car`, `person`, `truck`) |
| Licencia | Apache-2.0 (pesos); MIT (codigo upstream de YOLOv7) |
| Formato de pesos | ONNX con nodo `EfficientNMS_TRT` y motor TensorRT serializado (`.engine`) |
| Tarea | Deteccion de objetos (object-detection) |
| Clases | 3: `car`, `person`, `truck` |
| Resolucion de entrada | 640x640 px |
| Artefactos | `yolov7tiny-parking-rev3-640.onnx`, `yolov7-fp16-1x8x8-jp6-l4t36.3-arm64.engine`, `SHA256SUMS` |
| Libreria declarada | tensorrt |
| Tamano del repositorio | 0.1 GB |
| Plataforma del motor precompilado | JetPack 6 / L4T R36.3 / aarch64 (exclusivamente) |
| Fecha de creacion en HuggingFace | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es YOLOv7, publicada por Chien-Yao Wang, Alexey Bochkovskiy y Hong-Yuan Mark Liao en CVPR 2023 ("YOLOv7: Trainable bag-of-freebies sets new state-of-the-art for real-time object detectors"). Se trata de un detector de una etapa con entrenamiento mediante "bag-of-freebies", que incluye tecnicas de reparametrizacion de modulos para que el grafo de entrenamiento se simplifique en inferencia sin perdida de precision. La variante `tiny` es la version reducida de la familia, orientada a dispositivos con recursos limitados.

Sobre esta base, EdgeMatrix indica haber entrenado y reparametrizado pesos propios con un dataset de aparcamiento de tres clases. No se especifican en la model card el numero de imagenes, la composicion del dataset, el numero de epocas, las tecnicas de aumento de datos ni si hubo fases de ajuste adicionales. Tampoco se documenta el proceso de exportacion mas alla de que el ONNX resultante integra el nodo `EfficientNMS_TRT`, lo que traslada la supresion de no maximos al motor TensorRT y simplifica el postprocesado en produccion.

El flujo de trabajo publicado consiste en descargar el ONNX desde el repositorio de HuggingFace, verificar su hash contra `SHA256SUMS` y compilar el motor con `bin/build.sh`, tal como automatiza el notebook `localdev.ipynb` del repositorio de GitHub. El motor `.engine` incluido es un atajo opcional valido unicamente para JetPack 6 / L4T R36.3 sobre aarch64; en cualquier otra plataforma es necesario recompilar desde el ONNX.

## Capacidades

- Deteccion de objetos en tiempo real sobre imagenes y flujo de video, con tres categorias: coche, persona y camion.
- Entrada de 640x640 pixeles, tamano habitual en despliegues de deteccion en el borde.
- Supresion de no maximos integrada en el grafo ONNX mediante `EfficientNMS_TRT`, lo que evita implementar el postprocesado en el cliente.
- Inferencia acelerada por TensorRT en FP16 mediante el motor precompilado para Jetson.
- Integracion con pipelines de DeepStream, segun las etiquetas declaradas por el autor.
- Multiples camaras simultaneas: no documentado en la model card.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica, no es un modelo de lenguaje.
- Capacidades multimodales adicionales (audio, OCR, segmentacion, profundidad): no disponibles.
- Capacidades multilingues: no aplica; las etiquetas de salida estan en ingles.

## Casos de uso

- Control de ocupacion de aparcamientos: el modelo detecta la clase `car` en cada fotograma de las camaras del recinto, lo que permite estimar plazas libres u ocupadas por zona. Es adecuado porque el detector esta entrenado especificamente sobre escenas de aparcamiento y la NMS embebida reduce la latencia de postprocesado.
- Control de accesos y peajes por tipo de vehiculo: la distincion entre `car` y `truck` permite clasificar el vehiculo que cruza una barrera o un carril de peaje y activar tarifas o registros diferenciados. El modelo encaja en un despliegue por camara con inferencia local en Jetson.
- Seguridad perimetral en instalaciones industriales: la deteccion de la clase `person` permite generar alertas cuando se detecta presencia humana en zonas restringidas o fuera de horario. Al ejecutarse en el propio dispositivo, se evita enviar video continuo a la nube.
- Analitica de trafico en el borde: con el motor TensorRT y DeepStream se puede desplegar sobre camaras IP fijas para contar flujos de vehiculos y obtener series temporales de ocupacion sin infraestructura de servidores dedicada.
- Gestion de muelles de carga y logistica: la clase `truck` permite registrar la llegada y salida de camiones en muelles, alimentando sistemas de turnos o de trazabilidad de operaciones en planta.
- Automatizacion de rondas de vigilancia en aparcamientos: combinado con un sistema de grabacion, el detector puede marcar segmentos de video relevantes (presencia de personas o vehiculos) para revision posterior, reduciendo el tiempo de analisis manual.
- Prototipado de productos de vision en el borde: al publicarse el ONNX y los scripts de compilacion, sirve como base reproducible para validar un pipeline completo ONNX -> TensorRT -> DeepStream antes de sustituir los pesos por un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall, IoU ni latencias medidas, y no se proporciona ningun conjunto de evaluacion ni comparacion con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria ni tamano del motor compilado; el repositorio completo ocupa 0.1 GB.
- GPU recomendadas: no disponibles. El unico destino documentado es la familia Jetson bajo JetPack 6 / L4T R36.3 sobre aarch64, para la que se distribuye el motor FP16 precompilado.
- GPU de consumo: al tratarse de una variante `tiny` de YOLOv7, es razonable esperar que quepa en GPUs de consumo con TensorRT, pero no hay confirmacion ni cifras en la informacion proporcionada.
- Opciones de despliegue: TensorRT (compilando desde el ONNX con `bin/build.sh` en plataformas distintas de Jetson) y DeepStream para pipelines de video. ONNX Runtime podria ejecutar el grafo, pero la presencia del nodo `EfficientNMS_TRT` ata el artefacto al ecosistema TensorRT.
- vLLM, llama.cpp, Ollama y TGI: no aplican, son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de parametros publicados para AIPV1EMI0001, por lo que la comparacion solo puede plantearse a nivel cualitativo. La tabla recoge lo que si esta documentado en cada caso.

| Modelo | Tarea y clases | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIPV1EMI0001 (YOLOv7-tiny, EdgeMatrix) | Deteccion, 3 clases de trafico | no disponible | Entrada 640x640 | Apache-2.0 (pesos), MIT (codigo) | ONNX y motor TensorRT para Jetson en HuggingFace |
| YOLOv7-tiny upstream (WongKinYiu) | Deteccion, 80 clases COCO | no disponible en esta ficha | Entrada configurable | MIT | Codigo y pesos publicos en GitHub |
| Otros detectores ligeros de una etapa (por ejemplo, variantes nano de otras familias) | Deteccion generica | no disponible | Entrada configurable | Variable segun familia (algunas con licencias copyleft) | Multiples repositorios publicos |

La ventaja diferencial de AIPV1EMI0001 no es el rendimiento, sino el empaquetado: pesos ya ajustados a un dominio concreto de aparcamiento y un pipeline de compilacion listo para TensorRT y DeepStream. Su desventaja es la falta total de metricas publicadas frente a alternativas genericas con evaluaciones en COCO ampliamente replicadas.

## Limitaciones y advertencias

- Cobertura de clases muy reducida: solo `car`, `person` y `truck`. No detecta motocicletas, bicicletas, autobuses, senales de trafico, matricula ni objetos industriales.
- Ausencia total de metricas: sin mAP, precision, recall ni matrices de confusion, no es posible estimar la tasa de falsos positivos y falsos negativos antes de desplegar.
- Dominio de entrenamiento no documentado: se desconoce el numero de imagenes, su procedencia, las condiciones de iluminacion y las camaras empleadas, por lo que no puede garantizarse la generalizacion a otros recintos.
- Riesgo de degradacion en condiciones adversas: noche, lluvia, reflejos, oclusiones parciales y angulos de camara muy rasantes son causas habituales de fallo en detectores convolucionales de este tipo, aunque el autor no publica evaluaciones al respecto.
- Sin validacion por la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha. No hay informes de terceros sobre su comportamiento en produccion.
- Dependencia de plataforma: el motor precompilado solo funciona en JetPack 6 / L4T R36.3 sobre aarch64. Cualquier otro hardware exige recompilar desde el ONNX, con las versiones de TensorRT y CUDA correspondientes.
- Verificacion de integridad obligatoria: el flujo documentado comprueba el ONNX contra `SHA256SUMS`. Omitir este paso expone el despliegue a artefactos corruptos o manipulados.
- Licencias: los pesos se publican bajo Apache-2.0, pero el codigo de YOLOv7 upstream es MIT. Es necesario mantener la atribucion a los autores originales y revisar las condiciones de cualquier componente de terceros que se anada, como DeepStream, que tiene su propia licencia de NVIDIA.
- Sobre la alucinacion: el concepto no aplica a un detector de objetos, pero si existe el equivalente funcional en forma de detecciones espurias en texturas o reflejos, y de objetos no detectados por oclusion.
- Sesgos: al no documentarse la composicion del dataset, no puede descartarse un sesgo hacia el tipo de vehiculo, la hora del dia o la region geografica representados en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Edgematrix-JP/AIPV1EMI0001
- Repositorio de codigo, scripts de compilacion y guia paso a paso: https://github.com/edge-ai/AIPV1EMI0001
- YOLOv7 upstream (arquitectura original, licencia MIT): https://github.com/WongKinYiu/yolov7
- Paper de referencia: Chien-Yao Wang, Alexey Bochkovskiy, Hong-Yuan Mark Liao, "YOLOv7: Trainable bag-of-freebies sets new state-of-the-art for real-time object detectors", CVPR 2023 (sin enlace directo en la model card)
- Imagen de presentacion del repositorio: https://huggingface.co/Edgematrix-JP/AIPV1EMI0001/resolve/main/hero.jpg
