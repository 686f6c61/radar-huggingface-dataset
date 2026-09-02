# 1ys1/areumii-smolvla-pickplace-v11

## Resumen

El modelo `1ys1/areumii-smolvla-pickplace-v11` es una política robótica de tipo vision-language-action (VLA) basada en SmolVLA, un modelo compacto y eficiente desarrollado por Hugging Face que permite desplegar políticas de manipulación robótica en hardware de consumo. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario `1ys1` para el robot de tipo `areumii_c1`, especializado en tareas de pick-and-place de latas.

El modelo resuelve el problema de control robótico por imitación: a partir de observaciones visuales de tres cámaras (frontal y dos muñecas) y del estado del robot, genera acciones de control de 16 dimensiones. Está entrenado con un dataset propio de 20 episodios (2387 frames a 20 FPS) para dos tareas concretas de recogida y colocación de latas rojas y azules en una cesta. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas VLA con LeRobot sobre hardware asequible, con un tamaño total de 450 millones de parámetros y un peso de solo 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un modelo de lenguaje y un modulo de prediccion de acciones en una unica arquitectura transformer. Su diseno prioriza la eficiencia computacional para poder ejecutarse en GPUs de consumo, a diferencia de modelos VLA mas grandes como OpenVLA o RT-2. El modelo base `lerobot/smolvla_base` fue preentrenado de forma general y este checkpoint es un fine-tuning especifico para el robot `areumii_c1`.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset `1ys1/areumii-can-pickplace-v1`, que contiene 20 episodios y 2387 frames a 20 FPS. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 0,0001 y semilla 1000. Las observaciones consisten en el estado del robot (6 dimensiones) y tres imagenes RGB de 256x256 píxeles (camara frontal y dos camaras de muñeca), mientras que la salida es un vector de accion de 16 dimensiones. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un entrenamiento por imitacion supervisada.

## Capacidades

- Control robotico de pick-and-place: genera acciones de 16 dimensiones para manipular objetos (latas) y colocarlos en una cesta.
- Percepcion multimodal: fusiona informacion de tres camaras RGB (frontal, muñeca izquierda y muñeca derecha) con el estado propioceptivo del robot.
- Ejecucion de dos tareas especificas: recoger latas rojas y azules y colocarlas en una cesta.
- Inferencia en tiempo real: disenado para operar a 20 FPS, el ritmo de los datos de entrenamiento.
- Despliegue en hardware de consumo: gracias a su tamano compacto (450M parametros), puede ejecutarse en GPUs de gama media.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robotica (entrenamiento, rollout y evaluacion).

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorio: el modelo puede controlar un robot `areumii_c1` para recoger latas de una superficie y depositarlas en una cesta, una tarea repetitiva y bien delimitada que encaja con las capacidades del modelo.
- Prototipado rapido de politicas VLA: al estar entrenado con solo 20 episodios, demuestra que es posible obtener una politica funcional con pocos datos, lo que lo convierte en un punto de partida para experimentar con el flujo de LeRobot.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio para comparar el rendimiento de SmolVLA frente a otras arquitecturas VLA en tareas de manipulacion con un robot de bajo coste.
- Evaluacion de generalizacion: al tener dos tareas distintas (latas rojas y azules), permite estudiar hasta que punto la politica generaliza a variaciones de color y posicion de los objetos.
- Desarrollo de sistemas de robotica educativa: por su tamano reducido y licencia Apache-2.0, puede integrarse en cursos o talleres de robotica con IA sin necesidad de hardware de alta gama.
- Benchmark de control robotico: el modelo puede utilizarse como referencia para medir el rendimiento de otras politicas en el mismo robot y con las mismas tareas, facilitando comparativas objetivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas de exito en robot real ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 450M parametros y pesos en FP32 (0,9 GB), se estima que cabria en GPUs con 4-6 GB de VRAM en FP16, y menos de 2 GB en cuantizacion INT8.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 6 GB de VRAM (GTX 1660, RTX 2060, RTX 3060, RTX 4090) seria suficiente para inferencia. Para entrenamiento, se recomienda al menos 8-12 GB.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: LeRobot (oficial), con soporte para rollout en robot real via `lerobot-rollout`. Tambien puede usarse con vLLM o TGI si se adapta, aunque el flujo estandar es con LeRobot.
- Latencia y throughput: no disponible, pero al estar entrenado a 20 FPS, se espera que la inferencia sea inferior a 50 ms por paso en hardware adecuado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| 1ys1/areumii-smolvla-pickplace-v11 | 450M | no disponible | Apache-2.0 | Pick-and-place en robot areumii_c1 |
| lerobot/smolvla_base | 450M (estimado) | no disponible | Apache-2.0 | Modelo base general para robotica |
| OpenVLA | 7B | no disponible | MIT | VLA generalista para manipulacion |
| RT-2 (Google) | 55B | no disponible | no comercial | VLA de gran escala, no desplegable en consumo |

La comparativa se limita a modelos VLA conocidos, pero no se dispone de datos de rendimiento comparativos en las mismas tareas. SmolVLA destaca por su tamano reducido frente a alternativas como OpenVLA (7B) o RT-2 (55B), lo que permite su ejecucion en hardware de consumo, aunque probablemente con menor capacidad de generalizacion a tareas diversas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno con solo 20 episodios de un unico robot y un unico entorno, por lo que puede no generalizar a otras configuraciones, iluminacion, posiciones de camara o variaciones en los objetos.
- Riesgo de alucinacion: como modelo VLA, puede generar acciones incorrectas o inconsistentes ante observaciones fuera de la distribucion de entrenamiento, sin mecanismo de verificacion de seguridad.
- Limitaciones de contexto: al ser un modelo de robotica, no procesa texto libre ni mantiene conversaciones; su "contexto" se limita a las observaciones visuales y de estado actuales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el usuario es responsable de su uso en entornos de produccion.
- Caveat para produccion: no se han publicado resultados de evaluacion en robot real, por lo que su fiabilidad en tareas criticas no esta verificada. Se recomienda validar exhaustivamente antes de cualquier despliegue no supervisado.
- Dependencia del hardware: el modelo esta entrenado para el robot `areumii_c1` con tres camaras especificas; usarlo en otro robot o configuracion de camaras requeriria reentrenamiento o adaptacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1ys1/areumii-smolvla-pickplace-v11
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-can-pickplace-v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-can-pickplace-v1
