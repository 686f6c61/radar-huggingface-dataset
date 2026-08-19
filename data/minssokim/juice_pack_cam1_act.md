# minssoKIm/juice_pack_cam1_act

## Resumen

El modelo `minssoKIm/juice_pack_cam1_act` es una política robótica de imitación basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. El modelo fue desarrollado por el usuario minssoKIm y está diseñado para controlar un brazo robótico en tareas de manipulación, concretamente para la manipulación de un envase de zumo (juice pack) observado desde una cámara frontal. Utiliza un dataset propio (`minssoKIm/omx_f_juice_pack_cam1`) que contiene demostraciones teleoperadas.

El modelo tiene 51.668.656 parámetros (aproximadamente 51,7 millones), lo que lo sitúa en la categoría de políticas compactas que pueden ejecutarse en tiempo real en hardware robótico. Se distribuye bajo licencia Apache 2.0 y el formato de pesos es safetensors. Es relevante porque demuestra la aplicación práctica de ACT, un método que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación con datos de demostración limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador y decodificador |
| Parametros totales | 51.668.656 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo procesa observaciones de imagen y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo no lingüistico; es una politica de control) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), propuesta en el paper arXiv:2304.13705. ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso de tiempo, predice un "chunk" de acciones futuras (tipicamente 10-100 pasos). Esto reduce el error de acumulacion y permite movimientos mas suaves y precisos. La arquitectura consta de un codificador de vision (tipicamente ResNet) que procesa imagenes de camara, un codificador de estado del robot, y un decodificador transformer que genera la secuencia de acciones. Se entrena con una combinacion de perdida L1 y perdida de estilo VAE para mejorar la robustez.

El entrenamiento se realizo con el framework LeRobot, que proporciona herramientas de captura de datos, entrenamiento y evaluacion. El dataset `minssoKIm/omx_f_juice_pack_cam1` contiene demostraciones teleoperadas de la tarea de manipular un envase de zumo, capturadas con una camara. No se dispone de informacion detallada sobre el numero de episodios, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. Dado el tamano del modelo (51,7M), es probable que se haya entrenado en una sola GPU consumer durante unas pocas horas, pero este dato no esta confirmado.

## Capacidades

- Control robotico por imitacion: el modelo aprende a generar comandos de articulacion (posiciones, velocidades o esfuerzos) a partir de observaciones visuales y del estado del robot.
- Prediccion de secuencias de acciones (action chunking): genera multiples pasos de control a la vez, lo que mejora la suavidad y reduce la latencia efectiva.
- Manipulacion de objetos: especializado en la tarea de agarrar y mover un envase de zumo (pick and place), aunque puede adaptarse a otras tareas similares con fine-tuning.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para robots, incluyendo evaluacion con el script `lerobot.record`.
- Sin capacidades de lenguaje, vision general ni tool calling: es un modelo puramente motor, no un LLM.

## Casos de uso

- Automatizacion de tareas de pick and place en entornos controlados: el modelo puede controlar un brazo robotico para recoger un objeto de una posicion fija y colocarlo en otra, como en lineas de ensamblaje simples o laboratorios.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas entre tareas o para comparar metodos de action chunking.
- Prototipado rapido de robots: al ser un modelo pequeno (51,7M parametros), puede desplegarse en hardware de bajo coste (por ejemplo, un robot SO-100) para validar conceptos antes de escalar.
- Fine-tuning para nuevas tareas: partiendo de este modelo, un desarrollador puede adaptarlo a otras tareas de manipulacion con pocas demostraciones adicionales, gracias a la eficiencia de ACT.
- Educacion y formacion en robotica: el modelo y su codigo de entrenamiento (via LeRobot) son accesibles para estudiantes que quieran experimentar con politicas de imitacion.
- Evaluacion comparativa de algoritmos de control: se puede utilizar como baseline en experimentos que comparen ACT con otros metodos (por ejemplo, Diffusion Policy o RDT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de tasas de exito, ni comparaciones con otros modelos en la tarea especifica de manipulacion de envases de zumo. La unica referencia es el paper original de ACT, que reporta tasas de exito superiores al 80% en tareas simuladas, pero esos datos no son directamente aplicables a este modelo concreto sin una evaluacion especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7M parametros, la inferencia requiere menos de 1 GB de VRAM. En una GPU consumer (por ejemplo, GTX 1060 6GB o superior) se ejecuta sin problemas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente. Para entrenamiento, se recomienda una GPU con 8-12 GB (por ejemplo, RTX 3060, RTX 4060, RTX 3080).
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs de consumo.
- Opciones de despliegue: el modelo se integra con el ecosistema LeRobot. Se puede ejecutar con el script `lerobot.record` para inferencia en un robot real, o mediante la API de LeRobot para control en tiempo real. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos publicados. Dado el tamano del modelo y la arquitectura transformer, se espera una latencia de inferencia de unos pocos milisegundos en GPU moderna, lo que permite control en tiempo real (frecuencias de 10-50 Hz).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el mismo repositorio o con la misma tarea. Sin embargo, se puede mencionar que existen otros modelos de politica robótica entrenados con ACT en el Hub de Hugging Face (por ejemplo, los modelos oficiales de LeRobot como `lerobot/pusht` o `lerobot/aloha`), aunque no se tienen datos de rendimiento de este modelo concreto frente a ellos. Se recomienda consultar el paper original de ACT para comparaciones con metodos anteriores.

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| minssoKIm/juice_pack_cam1_act | 51,7M | Manipulacion de envase de zumo | Apache 2.0 | Hugging Face |
| lerobot/pusht (ACT) | ~30M (estimado) | Empujar objetos (PushT) | Apache 2.0 | Hugging Face |
| lerobot/aloha (ACT) | ~80M (estimado) | Tareas bimanuales | Apache 2.0 | Hugging Face |

Nota: los datos de parametros de los modelos de referencia son estimaciones basadas en la arquitectura tipica de ACT; no se han verificado.

## Limitaciones y advertencias

- Sesgos y generalizacion: el modelo esta entrenado exclusivamente con datos de demostracion de un entorno especifico (camara frontal, robot SO-100). No generalizara a otras configuraciones de camara, posiciones de objetos o tipos de robot sin fine-tuning.
- Riesgo de alucinacion: en el contexto de control robotico, el modelo puede generar acciones incoherentes si la observacion esta fuera de la distribucion de entrenamiento (por ejemplo, iluminacion cambiante, obstaculos nuevos). Esto puede provocar movimientos bruscos o fallos en la tarea.
- Limitaciones de contexto: el modelo no tiene memoria a largo plazo; depende de la ventana de observacion actual y de los chunks de accion. No puede planificar tareas de multiples pasos mas alla de la longitud del chunk.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. No hay restricciones adicionales conocidas.
- Dependencia del hardware: aunque el modelo es pequeno, requiere un robot fisico compatible (SO-100 o similar) y un sistema de camara calibrado. La precision de la tarea depende de la calidad de la teleoperacion y de la sincronizacion entre observacion y accion.
- Sin soporte de lenguaje ni vision general: no se puede utilizar para tareas de NLP o vision por computadora fuera del ambito robotico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minssoKIm/juice_pack_cam1_act
- Dataset de entrenamiento: https://huggingface.co/datasets/minssoKIm/omx_f_juice_pack_cam1
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Perfil del autor en Hugging Face: https://huggingface.co/minssoKIm
