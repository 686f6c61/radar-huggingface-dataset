# cssr4africa/dec_models

## Resumen

`cssr4africa/dec_models` es un repositorio de modelos ONNX empaquetados para su uso con [pepper4dec](https://github.com/yohatad/pepper4dec), una pila ROS 2 que convierte un robot Pepper en guia turistico del Upanzi Digital Experience Center en la Universidad Carnegie Mellon de Africa. No se trata de un modelo fundacional unico, sino de una coleccion de cuatro redes neuronales preentrenadas y exportadas a ONNX que cubren deteccion de personas, deteccion de rostros, estimacion de pose de cabeza y deteccion de actividad vocal.

El repositorio sigue la convencion de rutas `<package>/models/<file>` de [cssr4africa/cssr4africa_models](https://huggingface.co/cssr4africa/cssr4africa_models), de forma que cada paquete ROS 2 del stack encuentra el fichero en la ruta esperada. El script `scripts/fetch_models.sh` del proyecto pepper4dec descarga los ficheros y verifica su SHA-256.

Es relevante para desarrolladores de robotica porque ilustra un patron habitual en despliegues de robotica de servicio: agregar modelos de vision y audio en formato ONNX para inferencia en el borde, con licencias heterogeneas (AGPL-3.0, GPL-3.0, MIT) que condicionan su reutilizacion. El tamano total del repositorio es de 0,2 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de 4 modelos ONNX: YOLO11m (deteccion de objetos), Gold-YOLO (deteccion de rostros), 6DRepNet360 (pose de cabeza) y Silero VAD (deteccion de actividad vocal) |
| Parametros totales | no disponible (no se especifica el numero de parametros por modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de vision y audio, no generativos de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen en ONNX; no se indica si estan cuantizados) |
| Idiomas soportados | no disponible (los modelos de vision y VAD son independientes del idioma) |
| Licencia | Mixta por fichero: YOLO11m AGPL-3.0, Gold-YOLO GPL-3.0, 6DRepNet360 MIT, Silero VAD MIT. El repositorio no declara una licencia unica |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: agrega artefactos ONNX de terceros ya entrenados. El componente de deteccion de personas es YOLO11m de Ultralytics, exportado a ONNX y entrenado sobre COCO. La deteccion de rostros usa Gold-YOLO, un detector de la familia Efficient-Computing de Huawei Noah's Ark Lab. La estimacion de pose de cabeza emplea 6DRepNet360, que predice la orientacion 3D de la cabeza a partir de una imagen facial. La deteccion de actividad vocal usa Silero VAD, un detector ligero de voz sobre audio.

No se documentan en la model card los detalles de entrenamiento (numero de tokens o imagenes, composicion del dataset, tecnicas de aumento, ni procesos de ajuste fino o RLHF). Tampoco se especifican las dimensiones de entrada ONNX, el preprocesado exacto ni los umbrales de inferencia; esa informacion debe consultarse en los repositorios de origen de cada modelo y en el codigo de los paquetes ROS 2 correspondientes.

## Capacidades

- Deteccion de personas en imagenes o flujo de video mediante YOLO11m entrenado sobre COCO, util para localizar visitantes en el entorno del robot.
- Deteccion de rostros con Gold-YOLO, que permite recortar caras para etapas posteriores de analisis.
- Estimacion de pose de cabeza en 6 grados de libertad con 6DRepNet360, que aporta la orientacion de la cara respecto a la camara.
- Deteccion de actividad vocal con Silero VAD, que segmenta audio en tramos con y sin voz.
- Integracion nativa con ROS 2 a traves de los paquetes `person_detection`, `face_detection` y `speech_event` del stack pepper4dec.
- Inferencia en el borde mediante el runtime ONNX, sin dependencia de servicios en la nube.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni modo de pensamiento: es una coleccion de percepción, no un LLM.

## Casos de uso

- Recepcion y guiado de visitantes en un centro de demostracion: `person_detection` localiza personas en el campo de vision del Pepper y permite iniciar el guion de visita cuando alguien se aproxima.
- Interaccion social cara a cara: `face_detection` combina la deteccion de rostros con 6DRepNet360 para estimar hacia donde mira el visitante y orientar el comportamiento del robot en consecuencia.
- Turnos de conversacion por voz: `speech_event` con Silero VAD detecta cuando el usuario empieza y termina de hablar, lo que permite activar y cortar la captura de audio sin depender de pulsaciones.
- Segmentacion de audio previa a reconocimiento de voz: el VAD filtra silencios y ruido de fondo antes de enviar el audio a un ASR, reduciendo coste y falsos positivos.
- Despliegue en robotica de servicio con ROS 2: los modelos se cargan desde las rutas esperadas por cada paquete y se verifican por SHA-256 con `fetch_models.sh`, lo que simplifica la reproducibilidad del entorno.
- Prototipado de percepcion en el borde: al ser ONNX, los modelos pueden ejecutarse con ONNX Runtime en CPU o con aceleracion segun el hardware del robot, sin GPU dedicada obligatoria.
- Investigacion en interaccion humano-robot: la combinacion de deteccion de personas, pose de cabeza y actividad vocal proporciona senales basicas para estudiar atencion y turnos de habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, mAP, latencia ni throughput para ninguno de los cuatro modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de modelos ONNX de vision y audio de tamano moderado (repositorio total de 0,2 GB), es plausible la inferencia en CPU, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del runtime ONNX y del hardware del robot.
- Opciones de despliegue: ONNX Runtime es el runtime implicito por el formato de los pesos; la integracion concreta se realiza a traves de los paquetes ROS 2 de pepper4dec. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cssr4africa/dec_models | Coleccion ONNX (YOLO11m, Gold-YOLO, 6DRepNet360, Silero VAD) | no disponible | no aplica | Mixta (AGPL-3.0, GPL-3.0, MIT) | Hugging Face, 0 descargas |
| cssr4africa/cssr4africa_models | Coleccion de modelos para el stack cssr4africa | no disponible | no aplica | no disponible | Hugging Face |
| pepper4dec (repositorio de codigo) | Pila ROS 2 que consume estos modelos | no aplica | no aplica | BSD-3-Clause | GitHub |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, codigo, razonamiento ni conversacion; solo cubre percepcion visual y de audio.
- Licencias heterogeneas: YOLO11m se distribuye bajo AGPL-3.0 y Gold-YOLO bajo GPL-3.0, lo que impone obligaciones de copyleft en productos derivados. El uso comercial requiere revisar cada licencia por separado; el repositorio no declara una licencia unificada.
- El repositorio no indica una licencia propia, por lo que la reutilizacion del conjunto como tal queda en un limbo juridico que conviene aclarar con el autor.
- Sin datos de benchmarks ni de rendimiento: no hay evidencia publicada de precision o latencia para validar su uso en produccion.
- Sin informacion sobre sesgos: no se documenta el rendimiento por demografia, iluminacion, angulo de camara ni condiciones de audio ruidosas.
- Riesgo de alucinacion no aplicable en el sentido de los LLM, pero si hay riesgo de falsos positivos y negativos en deteccion de personas, rostros y voz, sin tasas publicadas.
- Dependencia del ecosistema pepper4dec y de las rutas `<package>/models/<file>`; fuera de ese stack la integracion requiere trabajo adicional.
- Idiomas no documentados; los modelos de vision y VAD son en principio independientes del idioma, pero no se confirma.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni de mantenimiento continuo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cssr4africa/dec_models
- Repositorio de referencia cssr4africa_models: https://huggingface.co/cssr4africa/cssr4africa_models
- Proyecto pepper4dec: https://github.com/yohatad/pepper4dec
- Documento de licencias de pepper4dec: https://github.com/yohatad/pepper4dec/blob/devel/MODELS.md
- Ultralytics (YOLO11m): https://github.com/ultralytics/ultralytics
- Gold-YOLO (Huawei Noah's Ark Lab): https://github.com/huawei-noah/Efficient-Computing/tree/master/Detection/Gold-YOLO
- 6DRepNet360: https://github.com/thohemp/6DRepNet360
- Silero VAD: https://github.com/snakers4/silero-vad
