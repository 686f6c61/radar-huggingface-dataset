# fecasado/gact-cubes-22bN

## Resumen

El modelo `fecasado/gact-cubes-22bN` es una política de control robótico entrenada con la librería LeRobot de HuggingFace, basada en la arquitectura ACT (Action Chunking Transformer). Está diseñada para resolver tareas de manipulación robótica, concretamente la tarea de mover cubos entre cestas, a partir de observaciones visuales de 320x240 píxeles. El autor es fecasado y el modelo se publica bajo licencia Apache-2.0.

El modelo tiene 51.615.114 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0.2 GB. Está orientado a ser ejecutado en robots tipo SO-100 (follower) y se integra con el ecosistema LeRobot para entrenamiento, evaluación e inferencia. Su relevancia radica en ser un ejemplo de política de aprendizaje por imitación aplicada a robótica, con un tamaño reducido que permite su despliegue en hardware modesto.

No se dispone de información sobre la longitud de contexto, idiomas soportados ni cuantizaciones, ya que la model card no incluye esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parametros totales | 51.615.114 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-accion, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura ACT (Action Chunking Transformer) es un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales. Fue introducida por el trabajo de Zhao et al. (2023) y se ha convertido en un estandar para aprendizaje por imitacion en robotica. El modelo procesa imagenes de 320x240 píxeles y genera comandos de articulacion para el robot.

El entrenamiento se realizo con la libreria LeRobot, utilizando el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que contiene demostraciones de la tarea de mover cubos a cestas. No se especifican detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La politica se entrena mediante aprendizaje supervisado de imitacion, minimizando la discrepancia entre las acciones predichas y las demostraciones.

## Capacidades

- Control de robot manipulador para tareas de recogida y colocacion de objetos (pick-and-place).
- Generacion de secuencias de acciones (action chunking) para movimientos suaves y coordinados.
- Procesamiento de observaciones visuales de baja resolucion (320x240).
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion e inferencia.
- Compatible con robots SO-100 (follower) y otros brazos soportados por LeRobot.
- No incluye capacidades de lenguaje, tool calling ni razonamiento multimodal general.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio: el modelo puede mover cubos entre cestas de forma autonoma, lo que sirve como banco de pruebas para algoritmos de manipulacion.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto del action chunking en la precision y suavidad de los movimientos roboticos.
- Desarrollo de politicas para robots de bajo coste: al tener solo 51.6M de parametros, puede ejecutarse en GPUs de gama media, facilitando la experimentacion en laboratorios con recursos limitados.
- Evaluacion de generalizacion en robotica: el dataset de cubos y cestas permite probar la robustez del modelo ante variaciones de posicion, iluminacion o textura.
- Educacion en robotica y aprendizaje automatico: sirve como ejemplo practico de entrenamiento de una politica con LeRobot, con codigo de entrenamiento e inferencia documentado.
- Prototipado de soluciones de automatizacion industrial a pequeña escala: aunque la tarea es simple, la arquitectura puede adaptarse a tareas similares de clasificacion o ensamblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, precision ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamaño de 51.6M de parametros, se estima que cabe en GPUs con 4-6 GB de VRAM en precision FP32.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, por ejemplo RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en CPU para pruebas lentas.
- Si cabe en consumer GPU: si, en la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluacion; tambien se puede usar con PyTorch directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de robotica con ACT). La model card no menciona alternativas ni benchmarks comparativos.

## Limitaciones y advertencias

- La tarea esta limitada a un escenario especifico (cubos a cestas) y puede no generalizar a otras tareas sin reentrenamiento.
- No se han documentado sesgos, pero al ser un modelo de vision-accion, su rendimiento depende de la calidad y variedad de las demostraciones del dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero puede generar acciones incorrectas si las observaciones difieren mucho de las del entrenamiento.
- No se especifican limitaciones de contexto ni de idioma, al no ser un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset y sus condiciones.
- Para produccion, es necesario validar la seguridad del robot y los protocolos de parada de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gact-cubes-22bN
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
