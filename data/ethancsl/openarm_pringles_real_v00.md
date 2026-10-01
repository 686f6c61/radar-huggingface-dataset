# ethanCSL/openarm_pringles_real_v00

## Resumen

`ethanCSL/openarm_pringles_real_v00` es un ajuste fino de SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado por el usuario ethanCSL y publicado con la librería LeRobot de Hugging Face. El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado sobre el dataset `ethanCSL/openarm_pringles_real_v00`, un conjunto de demostraciones reales recogidas con un brazo robótico OpenArm en una tarea de manipulación con botes tipo Pringles. Con 450.046.176 parámetros (aproximadamente 0,45 millardos), se sitúa en la gama de los VLA ligeros diseñados para ejecutarse en hardware de consumo.

SmolVLA, descrito en el artículo arXiv:2506.01844, propone una arquitectura VLA compacta que combina un codificador visual, un modelo de lenguaje pequeño y un experto de acciones, con el objetivo de reducir el coste computacional frente a alternativas como OpenVLA (7B) sin perder competitividad en tareas de manipulación. Esto es relevante ahora porque permite desplegar políticas robóticas en GPU de gama media e incluso en CPU, algo impracticable con VLA de mayor tamaño.

La ficha del modelo no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del ajuste fino. Además, el repositorio no registra descargas ni valoraciones, por lo que no existe validación independiente de su rendimiento. La licencia Apache 2.0 permite uso comercial y modificación, sujeto a las condiciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, tipo SmolVLA; ajuste fino de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 (aprox. 0,45 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors en bf16/fp16) |
| Idiomas soportados | no disponible (el modelo no genera lenguaje libre; produce acciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste fino | ethanCSL/openarm_pringles_real_v00 |
| Paper de referencia | arXiv:2506.01844 (SmolVLA) |
| Region declarada | us |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SmolVLA, un VLA compacto que acopla un backbone de visión-lenguaje de pequeño tamano con un modulo experto de acciones. Segun el articulo referenciado en la model card (arXiv:2506.01844), SmolVLA esta disenado para lograr un rendimiento competitivo en tareas de manipulacion con un coste computacional reducido y con capacidad de desplegarse en hardware de consumo. La model card no incluye la composicion detallada del backbone, el esquema de atencion, el tamano del action chunk ni el metodo exacto de generacion de acciones; esos detalles deben consultarse en el paper y en el repositorio de LeRobot.

El ajuste fino se ha realizado con LeRobot sobre el dataset `ethanCSL/openarm_pringles_real_v00`, un conjunto de demostraciones reales (teleoperadas o grabadas) sobre un brazo OpenArm en una tarea con botes tipo Pringles. La model card no especifica el numero de episodios, la frecuencia de captura, la resolucion de las camaras ni si se aplicaron tecnicas de regularizacion, aumento de datos o RLHF/DPO (no aplicables habitualmente en este tipo de politicas de imitacion). Tampoco se documenta si el entrenamiento congelo partes del backbone o ajusto la totalidad de los parametros. Como consecuencia, la reproducibilidad del ajuste no puede verificarse con la informacion disponible.

## Capacidades

- Generacion de acciones motoras: produce comandos de control (tipicamente en forma de action chunks) a partir de observaciones visuales y del estado del robot.
- Manipulacion visual guiada: la tarea objetivo aparente es la recogida y colocacion de objetos cilindricos (botes tipo Pringles) con un brazo OpenArm.
- Aprendizaje por imitacion (behavior cloning): la politica se ha entrenado a partir de demostraciones, no mediante refuerzo ni instrucciones en lenguaje natural.
- Inferencia en hardware de consumo: al tratarse de un modelo de ~450 M de parametros, puede ejecutarse en GPUs de gama media y potencialmente en CPU.
- Integracion con el ecosistema LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para entrenamiento y evaluacion.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la salida es accion motora, no texto).
- Capacidades especiales (modo thinking, vision, audio): vision como entrada; no se documentan modos adicionales.

## Casos de uso

- Recogida y colocacion de objetos cilindricos: el modelo puede controlar un brazo OpenArm para tomar botes tipo Pringles de una superficie y depositarlos en una ubicacion definida, replicando la tarea sobre la que fue entrenado.
- Automatizacion de lineas de envasado ligeras: en un entorno de laboratorio o fabrica piloto, la politica puede integrarse en una celda robotizada para alimentar o retirar envases de forma repetitiva.
- Prototipado rapido de politicas roboticas: sirve como punto de partida para investigar ajustes finos posteriores, dado su tamano reducido y su licencia permisiva.
- Investigacion en VLA eficientes: util como referencia empirica para comparar el rendimiento de un VLA de 450 M frente a alternativas mayores en tareas de manipulacion real.
- Validacion de pipelines de LeRobot: permite probar de extremo a extremo el flujo de entrenamiento, registro y evaluacion del framework en un caso real.
- Demostraciones educativas de robotica: por su baja demanda de recursos, es adecuado para talleres y cursos donde se ensene imitacion visual-motora sin acceso a clústeres de GPU.
- Evaluacion comparativa de hardware: al caber en GPU de consumo, permite medir latencia y throughput de inferencia en equipos asequibles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB con pesos en bf16/fp16 (el repositorio ocupa 0,9 GB) y aproximadamente 2 GB si se convierte a fp32. A esto hay que sumar la memoria de activaciones y del bucle de inferencia, que depende del tamano del lote y de las imagenes de entrada.
- GPU recomendadas: cabe con holgura en cualquier GPU con 4 GB o mas de VRAM; por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. Las GPU de gama alta no son necesarias, pero reducen la latencia.
- GPU de consumo: si, es uno de los objetivos de diseno de SmolVLA. Tambien puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint) es la via documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje autoregresivo de texto.
- Latencia y throughput: no disponibles. La model card no aporta mediciones de frecuencia de control, tiempo por accion ni rendimiento en tareas especificas.

## Comparativa con modelos similares

Los valores de modelos distintos a este checkpoint no aparecen en la informacion proporcionada y se incluyen solo como referencia de categoria; deben verificarse en sus respectivas fichas antes de usarlos en una decision tecnica.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| ethanCSL/openarm_pringles_real_v00 | 450 M | VLA (SmolVLA ajustado) | Apache 2.0 | Hugging Face, libreria LeRobot |
| lerobot/smolvla_base | 450 M (aprox.) | VLA (SmolVLA base) | no disponible en la informacion | Hugging Face |
| OpenVLA | 7 B (aprox.) | VLA | no disponible en la informacion | Hugging Face |
| pi0 | 3,3 B (aprox.) | VLA | no disponible en la informacion | Hugging Face |
| ACT (Action Chunking Transformer) | no disponible | Politica de imitacion | no disponible en la informacion | Implementada en LeRobot |

La ventaja diferencial de este checkpoint frente a VLA de mayor tamano es el coste de inferencia: con 450 M de parametros y 0,9 GB de pesos, es aproximadamente un orden de magnitud mas ligero que OpenVLA, a costa de una capacidad de generalizacion presumiblemente menor fuera de la tarea concreta para la que fue ajustado.

## Limitaciones y advertencias

- Especializacion extrema: es un ajuste fino sobre un unico dataset y una unica tarea (botes Pringles con brazo OpenArm). Fuera de esa configuracion de robot, camaras y objetos, el rendimiento esperado es bajo.
- Sin validacion independiente: el repositorio registra 0 descargas y 0 valoraciones, por lo que no hay evidencia externa de funcionamiento correcto ni de reproducibilidad.
- Sesgos del dataset: cualquier sesgo de posicion, iluminacion, color de objeto o estrategia de teleoperacion presente en las demostraciones se transferira a la politica.
- Riesgo de fallo silencioso: las politicas de imitacion pueden generar trayectorias plausibles pero incorrectas cuando el estado inicial difiere del visto en entrenamiento, sin senal explicita de error. Se recomienda supervision humana y limites de par en el robot.
- Ausencia de datos de entrenamiento: no se documentan numero de episodios, resolucion de imagen, frecuencia de control ni hiperparametros, lo que dificulta auditar el modelo.
- Sin modo texto: no puede interpretar instrucciones en lenguaje natural ni mantener conversaciones; las capacidades de tool calling y agentes no aplican.
- Fecha de publicacion inusual: la ficha indica creacion en 2026-10-01, fecha posterior a la de la mayoria de referencias disponibles; conviene verificar la vigencia del repositorio.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero exige conservar el aviso de licencia y no concede garantias. Debe comprobarse que el dataset de entrenamiento no imponga restricciones adicionales, dato no disponible en la informacion.
- Requisitos de seguridad fisica: cualquier despliegue en un robot real exige paradas de emergencia, limites de velocidad y validacion en entorno controlado antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_pringles_real_v00
- Dataset asociado: https://huggingface.co/datasets/ethanCSL/openarm_pringles_real_v00
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Modelo relacionado del mismo autor: https://huggingface.co/ethanCSL/openarm_pringles_v0
