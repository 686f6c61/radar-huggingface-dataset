# omkarpatil/ffw_sg2_put-blocks-in-bowl_smolvla

## Resumen

El modelo `omkarpatil/ffw_sg2_put-blocks-in-bowl_smolvla` es un fine-tune del modelo base `lerobot/smolvla_base` realizado con la librería LeRobot 0.6.1, diseñado específicamente para la tarea de manipulación robótica "coger dos bloques y colocarlos en un cuenco verde". Ha sido entrenado por omkarpatil sobre 78 demostraciones teleoperadas del dataset `omkarpatil/put-blocks-in-bowl`, capturadas a 15 fps, y el checkpoint guardado corresponde al paso 20 000 de un total de 60 000, con batch de 64 y semilla 1000.

El modelo pertenece a la categoría de Vision-Language-Action (VLA), es decir, modelos que integran percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones para control robótico. Con 450 millones de parámetros, se posiciona como un modelo de tamaño contenido para su ejecución en sistemas robóticos embebidos o con recursos limitados. Su relevancia radica en que demuestra el fine-tune de un VLA base sobre una tarea concreta de manipulación con un número reducido de demostraciones, lo que lo convierte en un ejemplo práctico para desarrolladores que trabajan con LeRobot y SmolVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en SmolVLA (transformador multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (instruccion en ingles en la tarea; capacidad multilingue no documentada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0.9 GB) |

## Arquitectura y entrenamiento

El modelo se basa en `lerobot/smolvla_base`, un VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para convertir observaciones de camaras y una instruccion textual en comandos de articulacion. El fine-tune se realizo con LeRobot 0.6.1, concretamente con el submodulo `cyclo_intelligence` del fork `omkarpatil18` en la rama `tabletop-manip`, que gestiona la normalizacion de un espacio de estado de 22 dimensiones (brazo izquierdo con 7 articulaciones, gripper izquierdo, brazo derecho con 7 articulaciones, gripper derecho, cabeza con 2, elevador y velocidad de base con 3).

El entrenamiento utilizo 78 demostraciones teleoperadas del dataset `omkarpatil/put-blocks-in-bowl`, con tres camaras (`cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) renombradas a `camera1..3` en el preprocesador. Las acciones se definen como objetivos absolutos de articulacion de 16 dimensiones (7 por brazo mas gripper) con un chunk de 50 pasos a 15 Hz. No se aplico aumento de imagenes. Cabe destacar que el `config.json` conserva las formas del modelo base (estado de 6 dimensiones, imagenes de 256x256) porque LeRobot no las actualiza en un fine-tune con `--policy.path`, aunque el preprocesador guardado usa las estadisticas del dataset de 22 dimensiones.

## Capacidades

- Ejecucion de tareas de manipulacion robotica bimanual: la tarea entrenada consiste en recoger dos bloques y colocarlos en un cuenco verde, lo que requiere coordinacion de ambos brazos.
- Control de acciones absolutas de articulacion con un horizonte de planificacion de 50 pasos (chunk), lo que permite movimientos suaves y anticipatorios.
- Procesamiento multimodal: integra tres flujos de camara (dos munecas y una cabeza) con una instruccion textual en ingles.
- Generacion de acciones a 15 Hz, adecuada para control en tiempo real con hardware robotico.
- Fine-tune especifico de tarea: no es un modelo generalista, sino adaptado a una unica instruccion concreta.
- Compatibilidad con el ecosistema LeRobot: el modelo se carga y ejecuta mediante la libreria LeRobot, lo que facilita su integracion en pipelines de robotica existentes.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tune de SmolVLA sobre una tarea concreta con pocas demostraciones, util para estudiar la transferencia de VLA base a dominios especificos.
- Desarrollo de pipelines de robotica bimanual: el modelo demuestra el control coordinado de dos brazos con grippers, aplicable a tareas de recogida y colocacion en entornos de laboratorio.
- Prototipado rapido con LeRobot: desarrolladores pueden usar este checkpoint como punto de partida para fine-tunes adicionales sobre tareas similares (por ejemplo, cambiar el objeto o el contenedor).
- Evaluacion de VLA en hardware real: el modelo puede desplegarse en robots compatibles con LeRobot para validar el rendimiento de la politica entrenada fuera de simulacion.
- Benchmark de manipulacion con objetos: la tarea de bloques y cuenco es un escenario clasico de manipulacion, util para comparar politicas VLA entre si o contra metodos clasicos de control.
- Educacion en robotica con IA: al ser un modelo pequeno (450M) y con licencia Apache-2.0, puede utilizarse en cursos y talleres para ensenar el flujo de entrenamiento y despliegue de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de exito de la tarea, ni comparaciones con otros modelos en el dataset `put-blocks-in-bowl`. Tampoco se documenta el rendimiento en simulacion o en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450M de parametros en precision FP32, el modelo ocupa aproximadamente 1.8 GB en memoria, por lo que una GPU con 4-6 GB de VRAM seria suficiente para inferencia en FP16 o cuantizado.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, T4). Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo medio y bajo gracias a su tamano contenido.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con el propio framework LeRobot en Python. Tambien es posible exportar los pesos a otros formatos (por ejemplo, ONNX o TensorRT) si se requiere inferencia de baja latencia, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del batch y de si se usa cuantizacion. En una GPU moderna, la inferencia de un VLA de 450M con tres imagenes deberia estar en el rango de decenas de milisegundos por paso.

## Comparativa con modelos similares

La comparativa se limita a modelos VLA de tamano similar en el ecosistema LeRobot, ya que no hay datos publicos de rendimiento para este checkpoint concreto.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omkarpatil/ffw_sg2_put-blocks-in-bowl_smolvla | 450M | no disponible | Manipulacion bimanual (bloques a cuenco) | Apache-2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | VLA base generalista | Apache-2.0 | HuggingFace |
| lerobot/pi0_base | ~3.3B | no disponible | VLA base generalista | Apache-2.0 | HuggingFace |

La comparacion con `pi0_base` muestra una diferencia de tamano significativa (450M vs 3.3B), lo que implica que SmolVLA esta disenado para entornos con menos recursos, aunque probablemente con menor capacidad de generalizacion. No hay datos publicos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo esta entrenado para una unica tarea (recoger dos bloques y colocarlos en un cuenco verde). No generaliza a otras instrucciones o escenarios sin un nuevo fine-tune.
- Datos limitados: solo 78 demostraciones, lo que puede provocar sobreajuste a las condiciones especificas del dataset (posicion de camaras, iluminacion, configuracion del robot).
- Comandos de articulacion incompletos: la politica no comanda la cabeza, el elevador ni la base (aunque el estado las incluye). Esto limita su uso en tareas que requieran movimiento de la base o cambios de altura.
- Configuracion desincronizada: el `config.json` conserva las formas del modelo base (estado 6, imagenes 256x256) mientras que el preprocesador usa 22 dimensiones. Esto puede causar errores si se carga el modelo sin el preprocesador guardado.
- Riesgo de alucinacion en la instruccion: al ser un VLA, el modelo puede malinterpretar la instruccion si las condiciones visuales difieren mucho del dataset de entrenamiento.
- Sin evaluacion publica: no hay informes de exito de la tarea, ni pruebas en hardware real o simulacion publicadas por el autor.
- Dependencia del fork: el entrenamiento uso un fork especifico de LeRobot (`omkarpatil18` rama `tabletop-manip`), lo que puede complicar la reproduccion exacta del entrenamiento con la version oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/ffw_sg2_put-blocks-in-bowl_smolvla
- Dataset de demostraciones: https://huggingface.co/datasets/omkarpatil/put-blocks-in-bowl
- Perfil de GitHub del autor: https://github.com/OmkarPatilML
- Modelo base en HuggingFace: https://huggingface.co/lerobot/smolvla_base (referenciado en la model card, sin URL directa verificada)
