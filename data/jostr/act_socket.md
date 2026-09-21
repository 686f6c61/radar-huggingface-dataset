# JoSTR/act_socket

## Resumen

JoSTR/act_socket es una politica de robotica basada en ACT (Action Chunking with Transformers), el metodo de aprendizaje por imitacion descrito en el articulo arXiv:2304.13705. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la libreria de aprendizaje para robotica real de Hugging Face, y su objetivo concreto es resolver la tarea "Place a socket in the box" (colocar un enchufe o vaso de conexion en una caja) con un robot dual xArm7 y tres camaras.

Se trata de una politica de accion, no de un modelo de lenguaje: consume el estado del robot y tres flujos de video (vista cenital, muneca derecha y muneca izquierda) y produce un vector de accion de 16 dimensiones. El modelo tiene 51.689.104 parametros (unos 51,7 millones) y un peso de repositorio de 0,2 GB, por lo que es muy ligero en comparacion con los modelos fundacionales de robotica. Su relevancia es practica para el ecosistema LeRobot: sirve como referencia reproducible de una politica ACT entrenada de extremo a extremo con 100 episodios teleoperados.

La model card no reporta ningun resultado de evaluacion en robot real y el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta. La licencia es Apache 2.0, lo que permite uso comercial y modificacion, aunque la utilidad real del checkpoint esta limitada a la tarea, el robot y la configuracion de camaras con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con action chunking; detalles de capas y cabezas no disponibles en la model card |
| Parametros totales | 51.689.104 (aprox. 51,7 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el metodo predice fragmentos de acciones; el tamano de chunk no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (checkpoint en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible; la tarea se especifica como cadena de texto en ingles ("Place a socket in the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de LeRobot, 0,2 GB) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Tipo de robot | Dual_xArm7 |
| Camaras | top_down, wrist_right, wrist_left |
| Entrada observation.state | STATE, shape (16,) |
| Entradas visuales | (3, 480, 640) por camara |
| Salida action | ACTION, shape (16,) |
| Dataset de entrenamiento | JoSTR/sort_socket_20260921_144353 |
| Episodios / frames / FPS | 100 / 28.970 / 30 |
| Pasos de entrenamiento | 50.000 |
| Batch size | 64 |
| Optimizador / LR / semilla | AdamW / 1e-05 / 1000 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de un unico paso de control. La model card lo describe como un metodo que aprende de datos teleoperados y que habitualmente alcanza tasas de exito elevadas. El checkpoint publicado es la salida de un entrenamiento supervisado sobre demostraciones, no de un proceso de RLHF o DPO: no hay ninguna fase de refuerzo ni de preferencias documentada.

Los datos de entrenamiento provienen del dataset JoSTR/sort_socket_20260921_144353, con 100 episodios, 28.970 frames a 30 FPS (aproximadamente 966 segundos, es decir, unos 16 minutos de demostraciones) y dos variantes de la cadena de tarea: "Place a socket in the box" y "Place a socket in the box." con punto final. La configuracion de entrenamiento es 50.000 pasos, batch de 64, AdamW con learning rate 1e-05 y semilla 1000, sobre LeRobot 0.6.2. No se documentan aumentos de datos, composicion detallada del dataset ni innovaciones tecnicas adicionales mas alla del propio esquema de action chunking del metodo ACT.

## Capacidades

- Control robótico por imitacion: genera comandos de accion de 16 dimensiones para un robot dual xArm7 a partir del estado articular y de tres vistas de camara.
- Percepcion visual multi-camara: procesa simultaneamente las vistas top_down, wrist_right y wrist_left a 480x640 y 3 canales por camara.
- Ejecucion de una tarea concreta: "Place a socket in the box", con dos formulaciones de texto equivalentes en el dataset.
- Condicionamiento por instruccion de tarea: acepta el texto de la tarea como parametro en tiempo de ejecucion (por ejemplo, mediante --task en lerobot-rollout).
- Soporte de tool calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica; la politica produce chunks de acciones, no planes simbolicos.
- Capacidades multilingues: no disponibles; no es un modelo de lenguaje.
- Capacidad especial: no se documenta modo "thinking", vision-language ni audio; la vision es exclusivamente sensorial para el control.

## Casos de uso

- Replicacion de experimentos de aprendizaje por imitacion: cargar el checkpoint con `lerobot-rollout --policy.path=JoSTR/act_socket` en un Dual_xArm7 con las tres camaras configuradas replica la tarea de forma directa, util para validar infraestructura de robot antes de entrenar politicas propias.
- Fine-tuning sobre nuevas tareas: el checkpoint sirve como inicializacion en `lerobot-train --policy.type=act` para datasets de tareas similares, reduciendo pasos de entrenamiento frente a partir de cero (aunque la model card no cuantifica la ganancia).
- Banco de pruebas de control en tiempo real: con 51,7 M de parametros y 0,2 GB de pesos, permite medir latencia de inferencia por paso de control (objetivo de 30 FPS, es decir, 33 ms por paso) en distintas GPU y CPU sin cuello de botella de memoria.
- Docencia y formacion en robotica: ejemplo completo y reproducible del flujo de LeRobot (grabacion de datos, entrenamiento, rollout) con una tarea de pick-and-place de dificultad media.
- Investigacion en robustez visual: al depender de tres camaras concretas, es un caso de estudio para medir la degradacion al cambiar iluminacion, posiciones de objeto o anadir distractores.
- Automatizacion de laboratorio para clasificacion de conectores: si el entorno y los objetos son los del dataset, la politica puede encadenarse en un ciclo de recogida y colocacion con intervencion humana minima.
- Generacion de trayectorias de referencia: las salidas de accion pueden registrarse y usarse como demostraciones sinteticas o como linea base para comparar con controladores clasicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la frase explicita "No evaluation results have been provided for this policy yet", y no se aportan tasas de exito, numero de ensayos ni metricas de tarea. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en disco; en precision fp32 los 51,7 M de parametros suponen unos 207 MB, mas activaciones de las tres imagenes de 480x640 y del encoder visual. La VRAM total no esta documentada.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM deberia ser suficiente para inferencia; una RTX 3060, RTX 4070 o superior es mas que adecuada. No se documentan requisitos especificos ni uso de A100/H100.
- Cabe en GPU de consumo: si, con margen amplio dado el tamano del modelo. La restriccion practica no es la VRAM sino la latencia por paso para cumplir los 30 FPS del dataset.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=JoSTR/act_socket`), entrenamiento y ajuste con `lerobot-train`, y ejecucion en PyTorch con dispositivo CUDA (`--policy.device=cuda`). No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones.

## Comparativa con modelos similares

No se ha encontrado informacion sobre modelos comparables en los resultados de busqueda disponibles. La unica referencia identificable es el propio metodo ACT descrito en arXiv:2304.13705 y otras politicas publicadas en el ecosistema LeRobot, para las que no se dispone de parametros, contexto, benchmarks ni licencia en la informacion proporcionada.

| Modelo | Parametros | Tipo de tarea | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoSTR/act_socket | 51.689.104 | Politica ACT, tarea "Place a socket in the box" | No publicados | Apache 2.0 | Hugging Face (0 descargas) |
| Otras politicas ACT del Hub de LeRobot | No disponible | Robotica por imitacion | No disponible | No disponible | No disponible |
| Metodos de la literatura citada (por ejemplo, baselines del paper ACT) | No disponible | Robotica por imitacion | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card declara explicitamente que no se han aportado resultados, por lo que la tasa de exito real es desconocida y no debe asumirse que la politica funciona en produccion.
- Especializacion extrema: la politica fue entrenada exclusivamente para "Place a socket in the box" con un robot Dual_xArm7 y tres camaras concretas. Cambiar el robot, el numero de camaras, la resolucion o la disposicion fisica invalida su uso previsto.
- Dependencia del entorno de entrenamiento: cualquier variacion de iluminacion, posicion de los objetos, fondo o presencia de distractores puede degradar el comportamiento; la model card no documenta evaluaciones de robustez.
- Datos limitados: 100 episodios y 28.970 frames (unos 16 minutos de demostraciones) es un volumen pequeno, lo que aumenta el riesgo de sobreajuste a las trayectorias demostradas.
- Idiomas: la tarea se especifica en ingles; no hay soporte multilingue ni comprension del lenguaje natural mas alla del condicionamiento por texto de tarea.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas o inseguras en robot real, especialmente fuera de la distribucion de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y la atribucion correspondiente. No se declaran restricciones adicionales.
- Estado del repositorio: 0 descargas y 0 "likes", sin demo ni video publicado, lo que limita la evidencia externa sobre su comportamiento.
- Fechas: el repositorio figura como creado y actualizado el 2026-09-21, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoSTR/act_socket
- Dataset de entrenamiento: https://huggingface.co/datasets/JoSTR/sort_socket_20260921_144353
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JoSTR/sort_socket_20260921_144353
- Paper de ACT citado en la model card: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
