# fecasado/gfm-cubes-28a

## Resumen

gfm-cubes-28a es una politica de robotica entrenada mediante aprendizaje por imitacion, publicada por el usuario fecasado en HuggingFace y construida con la libreria LeRobot de HuggingFace. El modelo pertenece a la familia de politicas denominada gaze_flow_matching, que combina flow matching (un paradigma generativo basado en transporte de probabilidad) con informacion de mirada (gaze) como senal de condicionamiento. Se distribuye como un checkpoint de 75.220.954 parametros (unos 75,2 millones) en formato safetensors y con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulacion robotica: segun el identificador del dataset asociado (fecasado/Ncubes-to-Nbaskets-320x240), esta entrenado para la tarea de mover cubos (cubes) a cestas (baskets), con observaciones visuales a una resolucion de 320x240. Es, por tanto, un modelo de proposito especifico para un entorno y una tarea determinados, no un modelo de lenguaje general ni un modelo fundacional multimodal.

Su relevancia actual es limitada y de nicho: se trata de un experimento de investigacion en el ecosistema LeRobot, con cero descargas y cero likes en el momento de la ficha, y una model card que en gran parte conserva el texto de plantilla sin completar. Resulta interesante como ejemplo de politica de robotica basada en flow matching y como referencia para quien investigue tecnicas de condicionamiento por mirada aplicadas a manipulacion, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de robotica gaze_flow_matching (flow matching con condicionamiento de mirada), implementada sobre LeRobot |
| Parametros totales | 75.220.954 (~75,2 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de robotica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Biblioteca | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura corresponde a una politica de robotica de tipo gaze_flow_matching, integrada en el ecosistema LeRobot. El enfoque de flow matching genera acciones modelando un campo de flujo continuo que transforma ruido en trayectorias de accion, de forma analoga a los modelos de difusion pero con una formulacion de transporte mas directa. El termino "gaze" indica que el modelo incorpora informacion de mirada (puntos de atencion o fijacion) como variable de condicionamiento adicional, presumiblemente extraida de las observaciones, lo que podria ayudar a focalizar la atencion visual en las regiones relevantes de la escena durante la manipulacion.

El entrenamiento se realizo con la libreria LeRobot, que es el marco de HuggingFace para aprendizaje por imitacion en robotica, y utiliza el dataset fecasado/Ncubes-to-Nbaskets-320x240. Este dataset define la tarea (mover cubos a cestas) y la resolucion de las observaciones visuales (320x240). No se dispone de informacion sobre el numero de episodios, el numero de tokens o pasos de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste. La model card reproduce mayoritariamente el texto de plantilla de LeRobot, incluyendo una seccion "Model type not recognized" sin actualizar, por lo que los detalles tecnicos de entrenamiento no estan documentados por el autor.

## Capacidades

- Generacion de acciones de manipulacion robotica para la tarea especifica de mover cubos a cestas en el entorno asociado al dataset de entrenamiento.
- Procesamiento de observaciones visuales a resolucion 320x240 como entrada sensorial.
- Condicionamiento por informacion de mirada (gaze), lo que constituye su rasgo distintivo frente a otras politicas de robotica.
- Inferencia sobre politicas entrenadas mediante aprendizaje por imitacion (imitation learning) dentro del flujo de trabajo de LeRobot.
- Ejecucion en robots compatibles con el flujo de LeRobot (por ejemplo, configuraciones de tipo so100 en los ejemplos de la documentacion).
- Soporte de tool calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (modelo de robotica, sin procesamiento de lenguaje).
- Capacidades especiales: no disponibles mas alla del condicionamiento por mirada.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como punto de partida reproducible para estudiar politicas de flow matching en tareas de manipulacion, ya que se entrena y evalua con las herramientas estandar de LeRobot.
- Estudio del condicionamiento por mirada: permite analizar si incorporar senales de gaze mejora la precision en tareas de recogida y colocacion de objetos frente a politicas que no usan esa senal.
- Reproduccion de la tarea cubos a cestas: util para validar pipelines de entrenamiento y evaluacion sobre el dataset Ncubes-to-Nbaskets-320x240 en un entorno controlado de laboratorio.
- Base para transferencia a tareas similares: puede servir como inicializacion o referencia al adaptar una politica de flow matching a tareas de pick-and-place con objetos y contenedores.
- Evaluacion comparativa de politicas en LeRobot: al compartir el marco con politicas como ACT o Diffusion Policy, permite comparaciones controladas de rendimiento en la misma tarea y dataset.
- Docencia y demostraciones de robotica con aprendizaje por imitacion: su tamano reducido (75,2 M de parametros) y su licencia permisiva lo hacen adecuado para entornos educativos donde se explique el ciclo entrenamiento-evaluacion de una politica.
- Prototipado rapido en laboratorio: al ser un checkpoint pequeno (0,3 GB) puede cargarse y ejecutarse en hardware modesto para pruebas preliminares de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito de tarea, tasas de exito por episodio, ni comparaciones numericas con otras politicas. No se deben asumir cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,3 GB y tiene 75,2 M de parametros; en fp32 ocuparia aproximadamente 300 MB solo en pesos, y en fp16/bf16 unos 150 MB. Sumando activaciones, buffer de imagenes 320x240 y posibles componentes del encoder visual, es razonable esperar un consumo del orden de 1 a 3 GB de VRAM en inferencia, aunque no hay una cifra oficial publicada.
- GPU recomendadas: no hay requisitos oficiales documentados. Por tamano, cualquier GPU moderna con al menos 4 GB de VRAM deberia ser suficiente; una NVIDIA RTX 3060, RTX 4070 o superior es mas que adecuada.
- Compatibilidad con GPU de consumo: si, es probable que quepa y funcione en GPUs de consumo basicas (por ejemplo, GTX 1650 4 GB, RTX 3050, RTX 4060), asi como en RTX 4090 para entrenamiento rapido.
- Opciones de despliegue: el flujo de LeRobot, que permite entrenar con `lerobot-train` y evaluar con `lerobot-record` apuntando a un checkpoint local o del Hub mediante `--policy.path`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-28a | Politica de robotica (gaze flow matching) | 75,2 M | no aplica | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| ACT (Action Chunking Transformer, LeRobot) | Politica de robotica (transformer) | no disponible | no aplica | no disponible en la informacion facilitada | Disponible como tipo de politica en LeRobot |
| Diffusion Policy (LeRobot) | Politica de robotica (difusion) | no disponible | no aplica | no disponible en la informacion facilitada | Disponible como tipo de politica en LeRobot |

Nota: ACT y Diffusion Policy se citan como alternativas de la misma categoria (politicas de robotica dentro de LeRobot) de forma cualitativa. No se dispone de datos verificados de parametros, contexto ni rendimiento de esos modelos en la informacion proporcionada, por lo que los campos correspondientes figuran como no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser una politica de robotica entrenada para un entorno y una tarea concretos, su comportamiento esta fuertemente ligado a la distribucion del dataset Ncubes-to-Nbaskets-320x240 y probablemente no generalice fuera de ella.
- Riesgo de fallo fuera de distribucion: al tratarse de un modelo de proposito especifico, el rendimiento en escenas, iluminacion, objetos o configuraciones distintas a las del entrenamiento puede degradarse significativamente. No es un modelo fundacional y no se documenta capacidad de generalizacion.
- Limitaciones de contexto o idioma: no aplica lenguaje natural; no hay documentacion sobre ventana de contexto ni sobre el numero maximo de observaciones que puede procesar.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion correspondiente. No obstante, el autor no especifica restricciones adicionales ni condiciones sobre el dataset asociado.
- Caveats para produccion: la model card esta practicamente sin completar ("Model type not recognized"), el modelo no tiene descargas ni likes, y no se han publicado evaluaciones ni tasas de exito. No se recomienda su uso en produccion sin una validacion exhaustiva previa en el entorno objetivo.
- Dependencia del ecosistema: el uso del modelo esta ligado a la libreria LeRobot y a las herramientas de HuggingFace; queda fuera de otros marcos de inferencia habituales.
- Ausencia de datos de cuantizacion: no se documentan versiones cuantizadas ni optimizaciones de despliegue (ONNX, TensorRT u otras).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-cubes-28a
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
