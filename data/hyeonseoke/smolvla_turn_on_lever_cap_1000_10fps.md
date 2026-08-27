# HyeonseokE/smolvla_turn_on_lever_cap_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arXiv:2506.01844. Este modelo concreto, `HyeonseokE/smolvla_turn_on_lever_cap_1000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica de robótica: accionar una palanca hasta que un indicador de estado se ponga en verde. El modelo ha sido entrenado con el framework LeRobot y está pensado para desplegarse en hardware de consumo, lo que lo hace accesible para investigación y prototipado.

Con 450 millones de parámetros, este VLA procesa imágenes de hasta tres cámaras (256x256 píxeles) junto con el estado del robot (6 dimensiones) y genera acciones de control (6 dimensiones) para un brazo robótico tipo `so101_follower`. El entrenamiento se realizó sobre 100 episodios recopilados a 10 FPS, con un total de 20.962 frames. Su relevancia radica en demostrar que es posible obtener políticas robóticas efectivas con modelos de tamaño reducido, reduciendo los costes computacionales frente a alternativas masivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Aunque no se detallan los componentes internos en la informacion disponible, el paper original (arXiv:2506.01844) describe una arquitectura compacta y eficiente, basada en SmolVLM, que permite ejecutar politicas roboticas en hardware de consumo. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con LeRobot.

El entrenamiento se llevo a cabo sobre el dataset `HyeonseokE/turn_on_lever_cap_10fps`, que contiene 100 episodios de un robot `so101_follower` realizando la tarea de accionar una palanca. Se usaron 16.350 pasos de entrenamiento con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0.0001. El modelo consume tres entradas visuales (cámaras `top`, `left_wrist` y una tercera no especificada) y el estado del robot (6 dimensiones), y produce acciones de control de 6 dimensiones. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento de imitacion supervisada.

## Capacidades

- Control robotico de un brazo `so101_follower` para tareas de manipulacion, especificamente accionar una palanca.
- Procesamiento de multiples camaras (hasta tres) con resolucion de 256x256 píxeles.
- Generacion de acciones de control continuas (6 dimensiones) a partir de observaciones visuales y de estado.
- Ejecucion de tareas guiadas por instrucciones en lenguaje natural (la tarea se describe como "Turn the lever on; the status indicator should turn green").
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- Capacidad de inferencia en tiempo real a 10 FPS (frecuencia de los datos de entrenamiento).

## Casos de uso

- Automatizacion de tareas de ensamblaje industrial: el modelo puede controlar un brazo robotico para accionar palancas, pulsadores u otros mecanismos en lineas de produccion, reduciendo la intervencion humana.
- Investigacion en robotica de imitacion: sirve como punto de partida para estudiar tecnicas de aprendizaje por imitacion con modelos compactos, permitiendo iterar rapidamente en entornos simulados o reales.
- Prototipado de soluciones roboticas en laboratorios: al ser ligero y desplegable en GPUs de consumo, facilita la experimentacion con politicas VLA sin necesidad de infraestructura costosa.
- Control de robots en entornos simulados (por ejemplo, Isaac Sim): el modelo puede transferirse a simulaciones para validar comportamientos antes de su despliegue fisico.
- Educacion y formacion en robotica: su tamano reducido y su integracion con LeRobot lo hacen adecuado para cursos y talleres donde se ensenan conceptos de aprendizaje por refuerzo e imitacion.
- Desarrollo de asistentes roboticos domesticos: aunque la tarea actual es especifica, la arquitectura puede adaptarse a otras tareas de manipulacion en el hogar, como encender interruptores o abrir puertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion para esta politica concreta. No se proporcionan metricas de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 450M de parametros en precision FP32 se requieren aproximadamente 1.8 GB solo para los pesos; con cuantizacion a 8 bits podria reducirse a ~0.5 GB. Sin embargo, no se especifican requisitos oficiales.
- GPU recomendadas: al ser un modelo compacto, deberia ejecutarse en GPUs de consumo como NVIDIA RTX 3060, RTX 4060 o superiores. No se requiere una A100 o H100.
- Compatibilidad con hardware de consumo: si, segun la descripcion del paper, SmolVLA esta disenado para desplegarse en hardware de consumo.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia via `lerobot-rollout`. Tambien puede usarse con librerias de inferencia como vLLM o llama.cpp si se convierte a formatos compatibles, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles. Dado el tamano del modelo y la frecuencia de 10 FPS de los datos de entrenamiento, se espera que la inferencia sea rapida en GPUs modernas, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la informacion proporcionada. Sin embargo, SmolVLA se presenta como una alternativa compacta a modelos VLA mas grandes como OpenVLA (7B parametros) o RT-2 (55B parametros). La ventaja principal de SmolVLA es su menor coste computacional y su capacidad para ejecutarse en hardware de consumo, aunque a costa de una menor capacidad de generalizacion. No hay benchmarks publicos que permitan una comparacion cuantitativa directa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 | 55B | no disponible | propietaria | no publico |

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta fine-tuneado para una tarea concreta (accionar una palanca) y no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion: no se han publicado tasas de exito ni pruebas en entornos reales, por lo que su rendimiento efectivo es desconocido.
- Dependencia de la configuracion de camaras: el modelo espera tres camaras especificas; cambios en la disposicion o calibracion pueden degradar el rendimiento.
- Riesgo de alucinacion en acciones: como todo modelo de aprendizaje por imitacion, puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Sesgos del dataset: los datos provienen de un unico entorno y robot, lo que puede introducir sesgos en la percepcion y el control.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento de las condiciones de los modelos base y datasets asociados.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/HyeonseokE/smolvla_turn_on_lever_cap_1000_10fps)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/turn_on_lever_cap_10fps)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guia de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
