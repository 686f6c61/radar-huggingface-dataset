# innoblabla/devracage_sphere_GR00T17_rel

## Resumen

`innoblabla/devracage_sphere_GR00T17_rel` es una politica de robotica (policy) publicada por el usuario **innoblabla** en Hugging Face, entrenada con la libreria **LeRobot** sobre el modelo fundacional **GR00T N1.7 de NVIDIA**. No es un modelo de lenguaje generalista, sino un modelo vision-lenguaje-accion (VLA) especializado en una unica tarea de manipulacion: coger una esfera de un contenedor y depositarla en un bol. El repositorio pesa 12,6 GB y los pesos en safetensors suman 3.144.016.000 parametros (aproximadamente 3,14 mil millones), lo que corresponde al backbone Cosmos-Reason2/Qwen3-VL mas el transformer de acciones de flow matching descrito por el autor.

La relevancia de esta ficha es doble. Por un lado, documenta el estado del arte abierto en politicas de manipulacion cross-embodiment: GR00T N1.7 combina un backbone VLM con un cabezal de acciones que predice acciones condicionadas por vision, lenguaje y propiocepcion, lo que permite reutilizar el mismo modelo base en robots distintos mediante fine-tuning. Por otro, este checkpoint concreto ilustra el flujo completo de LeRobot: grabacion de un dataset de 352 episodios y 83.356 fotogramas a 30 FPS, entrenamiento de 20.000 pasos con AdamW y publicacion en el Hub con una unica tarea en ingles.

Se trata de un artefacto muy experimental: cero descargas, cero likes, sin resultados de evaluacion publicados y con una ventana de observacion fija de tres camaras de 480x640 y un vector de estado de 6 dimensiones. Cualquier evaluacion seria debe hacerse sobre el robot fisico, ya que la model card no reporta tasa de exito ni comparativas cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (aprox. 3,14 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplicable: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible (la model card no especifica la ventana de contexto ni el tamano del chunk de acciones) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible; la condicion de lenguaje usada en el entrenamiento esta en ingles ("pick up a sphere from the bin and place it in the bowl") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (brazo tipo SO-100 follower) |
| Camaras | `pince`, `base`, `top` |
| Entradas | `observation.state` (6,), `observation.images.pince` (3, 480, 640), `observation.images.base` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 12,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de GR00T N1.7 publicado por NVIDIA: un backbone vision-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imagenes de las camaras y la instruccion en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por las representaciones del backbone y por el estado de propiocepcion del robot. El modelo es cross-embodiment en su forma base, es decir, esta pensado para transferirse a distintas morfologias mediante fine-tuning, que es precisamente lo que hace este checkpoint: adaptar el modelo fundacional a un brazo `so_follower` con seis grados de libertad de accion y tres camaras.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `innoblabla/devracage_sphere`, compuesto por 352 episodios y 83.356 fotogramas grabados a 30 FPS, con una unica tarea de pick-and-place de una esfera. La configuracion reportada es de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001 y semilla 42. No se documenta el uso de RLHF, DPO ni de ninguna fase de refinamiento por preferencias, ni se detalla la composicion del dataset mas alla de la tarea y las estadisticas de episodios y fotogramas. Tampoco se especifica si se aplicaron aumentos de datos, randomization de dominio o entrenamiento en simulacion antes del ajuste sobre el robot real.

## Capacidades

- Generacion de acciones de manipulacion de 6 dimensiones para un brazo `so_follower`, condicionadas por tres vistas de camara (pinza, base y superior) y el estado de articulaciones.
- Ejecucion de la tarea concreta "pick up a sphere from the bin and place it in the bowl" en ingles como condicion de lenguaje.
- Percepcion visual multi-camara a 480x640 en tres flujos simultaneos, lo que aporta informacion de profundidad y de oclusion parcial.
- Aprendizaje por imitacion (imitation learning) a partir de demostraciones teleoperadas, sin necesidad de definir recompensas explicitas.
- Transferencia desde un modelo fundacional cross-embodiment: la policy puede reentrenarse con `lerobot-train` sobre nuevos datasets para otras tareas.
- Integracion nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia en robot y `lerobot-train` para fine-tuning.
- Tool calling / function calling: no aplicable, es una politica de robotica y no un modelo de lenguaje con interfaz de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo ejecuta una politica de control, no un bucle de planificacion simbolica.
- Capacidades multilingues: no disponibles; la condicion de lenguaje empleada esta en ingles.
- Modo "thinking", vision adicional o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Pick-and-place en laboratorio: el modelo ejecuta directamente la secuencia de coger una esfera de un contenedor y dejarla en un bol sobre un `so_follower`, por lo que sirve como referencia reproducible en experimentos de manipulacion con tres camaras a 30 FPS.
- Punto de partida para fine-tuning con nuevos datasets: mediante `lerobot-train --policy.type=groot` se puede reentrenar el checkpoint sobre grabaciones propias y asi adaptar el modelo fundacional a otras tareas sin partir de cero.
- Banco de pruebas de politicas VLA: al ser un checkpoint pequeno (12,6 GB de repositorio) y con licencia Apache 2.0, es util para comparar variantes de GR00T N1.7, cambios de learning rate o tamanos de dataset manteniendo constante el resto del pipeline.
- Docencia e investigacion en aprendizaje por imitacion: el flujo completo (grabar con LeRobot, entrenar 20.000 pasos, desplegar con `lerobot-rollout`) es replicable en un curso o practica de robotica de bajo coste.
- Evaluacion de robustez visual: al depender de tres camaras (`pince`, `base`, `top`), permite estudiar como afectan los cambios de iluminacion, la posicion de los objetos o la presencia de distractores a una policy entrenada con una unica tarea.
- Automatizacion de tareas repetitivas de clasificacion ligera: con un fine-tuning posterior sobre el mismo robot, la arquitectura puede extenderse a separar objetos por tipo o color en una cinta, siempre que se genere el dataset correspondiente.
- Pruebas de sim-a-real y de calibracion de camaras: comparar el rendimiento del checkpoint con distintas calibraciones o montajes permite medir la sensibilidad del modelo a la geometria del sistema de vision.
- Recoleccion de datos asistida: usar la policy como base para teleoperacion asistida o para generar trayectorias iniciales que luego se corrigen manualmente antes de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la policy incluye explicitamente la frase de que no se han proporcionado resultados de evaluacion, y la tabla de evaluacion en robot real (tarea, ensayos, exitos y tasa de exito) esta vacia. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna metrica de manipulacion (tasa de exito, tiempo de ciclo o distancia al objetivo).

## Requisitos de hardware

- VRAM estimada para inferencia: los calculos siguientes son estimaciones derivadas del numero de parametros (3,14 mil millones). En fp32, los pesos ocuparian unos 12,6 GB, coherente con el tamano del repositorio; en bf16/fp16, unos 6,3 GB; en int8, unos 3,2 GB; en int4, unos 1,6 GB. A estas cifras hay que sumar la memoria de las activaciones, del backbone visual y de las tres camaras a 480x640.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU de 24 GB (RTX 4090, L4, A10G) deberia ser suficiente para inferencia en bf16 con margen; una A100 o H100 de 40-80 GB daria margen adicional para mayor batch o fp32.
- Cabe en GPU de consumo: no confirmado por el autor. Con los 12,6 GB de pesos y las activaciones del backbone visual, es probable que entre en GPUs de 16-24 GB en bf16, pero no hay una cifra publicada que lo confirme.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar en robot, `lerobot-train` para entrenar), con PyTorch y CUDA (`--policy.device=cuda`). vLLM, llama.cpp, Ollama y TGI no son aplicables a una politica de robotica de este tipo y no se documentan como soportados.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS, lo que implica que el bucle de control debe sostener esa frecuencia, pero no se publica ninguna medicion de latencia de inferencia ni de rendimiento por GPU.
- Almacenamiento: reservar al menos 12,6 GB para el checkpoint, mas espacio para checkpoints de entrenamiento en `outputs/train/<policy_repo_id>/checkpoints/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `innoblabla/devracage_sphere_GR00T17_rel` | 3.144.016.000 (safetensors) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 base (NVIDIA) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Repositorio GitHub NVIDIA Isaac-GR00T |
| Otras politicas VLA abiertas de la misma categoria (por ejemplo, OpenVLA, pi0, RDT-1B) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No verificadas en esta busqueda |

La informacion proporcionada no incluye especificaciones cuantitativas de los modelos alternativos, por lo que la comparacion se limita a la categoria de uso: GR00T N1.7 es el modelo base del que deriva este checkpoint, y las demas alternativas son politicas VLA de proposito general que no se han podido contrastar con datos verificables en esta busqueda.

## Limitaciones y advertencias

- Especializacion extrema: la policy se entreno con una unica tarea ("pick up a sphere from the bin and place it in the bowl"). Fuera de ese contexto, la probabilidad de que genere acciones utiles es muy baja sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que no se puede afirmar ningun nivel de rendimiento en produccion.
- Dependencia del montaje fisico: las entradas estan fijadas a tres camaras concretas (`pince`, `base`, `top`) a 480x640 y a un vector de estado de 6 dimensiones. Cambiar el robot, la cinematica o la posicion de las camaras invalida el modelo.
- Riesgo de sobreajuste al entorno de grabacion: con 352 episodios y una sola tarea, es esperable un deterioro ante cambios de iluminacion, fondo, posicion de los objetos o presencia de distractores; no hay datos que cuantifiquen esa perdida.
- Idiomas: la condicion de lenguaje esta en ingles y no se documenta soporte multilingue.
- Ausencia de capacidades de razonamiento simbolico: no se describe soporte de tool calling, planificacion de varios pasos ni agentes, por lo que no debe usarse como sustituto de un LLM en un pipeline de decision.
- Licencia: Apache 2.0 permite uso comercial del checkpoint, pero el modelo deriva de GR00T N1.7 y del backbone Cosmos-Reason2/Qwen3-VL, cuyas condiciones propias deben verificarse en sus repositorios originales antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni mantenimiento. No es un artefacto validado por la comunidad.
- Seguridad fisica: cualquier politica de manipulacion puede producir movimientos inesperados. Es imprescindible operar con limites de par, parada de emergencia y espacio de trabajo despejado.
- Fechas del repositorio: la model card indica una fecha de creacion de 2026-09-22, posterior a la fecha habitual de publicacion de GR00T N1.7; conviene confirmar la version exacta del modelo base utilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/innoblabla/devracage_sphere_GR00T17_rel
- Dataset de entrenamiento: https://huggingface.co/datasets/innoblabla/devracage_sphere
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=innoblabla/devracage_sphere
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guia de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenido no relacionado con robotica o aprendizaje automatico.
