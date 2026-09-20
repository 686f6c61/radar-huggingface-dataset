# nsk11235/franka-stack-150e-pi05-20k

## Resumen

franka-stack-150e-pi05-20k es un ajuste fino (fine-tune) de la política robótica pi05 (π₀.₅) de Physical Intelligence, publicado por el usuario nsk11235 en Hugging Face bajo la librería LeRobot. Se trata de un modelo de visión-lenguaje-acción (VLA) con 4.143.404.816 parámetros que consume dos imágenes de cámara (`top` y `wrist_cam`, ambas de 3×256×256), el estado del robot (vector de 16 dimensiones) y una instrucción de tarea en lenguaje natural, y emite un vector de acción de 8 dimensiones para un brazo robótico Franka.

El modelo parte del checkpoint base `lerobot/pi05_base` y se ha especializado mediante aprendizaje por imitación en una única tarea de apilado de cubos: «Pick up the red cube and place it on top of the blue cube. Then pick up the green cube and place it on top of the red cube». El ajuste se realizó con LeRobot 0.6.2 sobre un dataset de 150 episodios y 36.532 fotogramas grabados a 20 FPS.

Su relevancia es principalmente práctica y metodológica: sirve como ejemplo reproducible de cómo adaptar un modelo VLA generalista de Physical Intelligence a un robot concreto (Franka) y a una tarea específica, usando únicamente el ecosistema abierto de LeRobot. No es un modelo de propósito general ni un LLM conversacional, sino una política de control entrenada para un entorno de laboratorio concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi05 (π₀.₅); detalles internos no especificados en el model card |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo VLA; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible; las instrucciones de tarea se proporcionan en lenguaje natural (el dataset de entrenamiento usa instrucciones en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 9,4 GB) |

Otros datos de entrada y salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.images.top` | VISUAL | (3, 256, 256) |
| `observation.images.wrist_cam` | VISUAL | (3, 256, 256) |
| `observation.state` | STATE | (16,) |
| `action` | ACTION | (8,) |

## Arquitectura y entrenamiento

El model card describe el modelo base como un modelo de visión-lenguaje-acción (VLA) de Physical Intelligence, disenado para generalizacion en entornos abiertos: π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones nuevas no vistas durante el entrenamiento. La implementacion de LeRobot esta adaptada del repositorio open source OpenPI. El model card no detalla la arquitectura interna (tipo de backbone, mecanismo de generacion de acciones, numero de capas, etc.), por lo que esos datos se consideran no disponibles.

En cuanto al entrenamiento de este ajuste fino concreto, el model card proporciona los siguientes datos: 10.000 pasos de entrenamiento, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y version de LeRobot 0.6.2. El dataset utilizado es `nsk11235/franka-stack-50e-256`, con 150 episodios, 36.532 fotogramas y 20 FPS, correspondiente a una unica tarea de apilado de tres cubos. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; el procedimiento es aprendizaje por imitacion (imitation learning) supervisado sobre demostraciones.

Nota: el nombre del repositorio incluye el sufijo «20k» mientras que la configuracion de entrenamiento declarada indica 10.000 pasos. Esta discrepancia no se explica en el model card y conviene verificarla si se va a reproducir el entrenamiento.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de 8 dimensiones para un brazo Franka a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa dos flujos de imagen simultaneos (`top` y `wrist_cam`) a resolucion 256×256.
- Seguimiento de instrucciones en lenguaje natural: acepta un prompt de tarea (por ejemplo, la secuencia de apilado de cubos) que condiciona la politica.
- Manipulacion de objetos: la politica esta entrenada especificamente para tareas de recogida y apilado (pick-and-place) de cubos.
- Control en tiempo real: el dataset de entrenamiento se grabo a 20 FPS, lo que marca la cadencia de control esperada.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta razonamiento multi-paso tipo agente LLM ni uso de herramientas externas.
- Capacidades multilingues: no disponibles; la politica se entreno con instrucciones en ingles.

## Casos de uso

- Apilado de cubos en laboratorio: el modelo ejecuta directamente la tarea para la que fue entrenado («Pick up the red cube...»), por lo que puede usarse como referencia funcional de una politica VLA en un Franka.
- Automatizacion de pick-and-place industrial: con un reentrenamiento sobre datos propios podria aplicarse a tareas de recogida y colocacion en celdas de fabricacion, aprovechando su condicionamiento por lenguaje natural.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el ajuste fino de pi05 con LeRobot y comparar hiperparametros (pasos, lote, tasa de aprendizaje).
- Prototipado rapido de politicas roboticas: al estar integrado en LeRobot, permite lanzar inferencia con `lerobot-rollout` sin reescribir la infraestructura de control.
- Evaluacion de generalizacion: util para medir como se comporta una politica especializada ante cambios de posicion de objetos, iluminacion o distractores, tal y como sugiere la propia plantilla de evaluacion del model card.
- Docencia y demostraciones de robotica: su tamano moderado y licencia permisiva lo hacen apto para talleres y cursos donde se ensene el flujo completo de LeRobot (grabacion, entrenamiento y despliegue).
- Generacion de nuevas demostraciones: al ejecutar la politica se pueden recolectar episodios adicionales que alimenten iteraciones posteriores de entrenamiento (data flywheel).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio model card indica explicitamente: «No evaluation results have been provided for this policy yet». No se dispone de tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: aproximadamente 8,3 GB en BF16/FP16 y aproximadamente 16,6 GB en FP32, calculado a partir de los 4,14 mil millones de parametros. El repositorio ocupa 9,4 GB, coherente con pesos en precision reducida mas modulos adicionales.
- A esta cifra hay que sumar el coste de los dos codificadores visuales y de las activaciones, no cuantificado en la informacion disponible.
- GPU de gama alta para consumo: cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090 en BF16, y con margen ajustado en tarjetas de 16 GB (por ejemplo RTX 4060 Ti 16 GB) si se reduce la precision o el lote.
- GPU de centro de datos: A100, H100 o L40S, aunque por tamano no son estrictamente necesarias para inferencia.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=nsk11235/franka-stack-150e-pi05-20k`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de robotica de este tipo.
- Latencia y throughput: no disponibles. La cadencia de datos de entrenamiento es de 20 FPS, lo que sugiere que la inferencia debe poder ejecutarse en tiempo real a una frecuencia similar, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| nsk11235/franka-stack-150e-pi05-20k | 4,14 mil millones | Ajuste fino VLA especializado en Franka | apache-2.0 | Hugging Face |
| lerobot/pi05_base | 4,14 mil millones (misma arquitectura, segun el model card) | VLA base generalista | apache-2.0 | Hugging Face |
| π₀.₅ original (Physical Intelligence) | no disponible | VLA generalista | no disponible | Blog y repositorio OpenPI |
| π₀ original | no disponible | VLA generalista | no disponible | Repositorio OpenPI |

La comparacion cuantitativa de rendimiento entre estas alternativas no es posible con la informacion disponible, ya que no se han publicado resultados de evaluacion para el modelo ajustado ni datos comparables en el model card.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea y un unico robot (Franka), con un dataset de 150 episodios. Es previsible un mal rendimiento fuera de ese contexto.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que se desconoce su fiabilidad real incluso en la tarea objetivo.
- Riesgo de sobreajuste al entorno: las posiciones de los objetos, la iluminacion y la configuracion de las camaras del dataset condicionan su comportamiento; cualquier cambio puede degradar el rendimiento.
- Dependencia del hardware de captura: los nombres y la calibracion de las camaras deben coincidir exactamente con las claves de observacion (`observation.images.top`, `observation.images.wrist_cam`) y con el estado de 16 dimensiones del robot.
- Sesgos: no se documentan sesgos especificos, pero al ser un modelo entrenado sobre demostraciones de un unico operador y entorno, hereda las limitaciones y sesgos de esos datos.
- Alucinacion en el sentido de acciones erroneas: como politica de control, puede generar trayectorias incorrectas o inseguras ante situaciones no vistas; se recomienda supervisar y limitar el espacio de acciones.
- Idiomas: las instrucciones de entrenamiento estan en ingles; no hay evidencia de soporte multilingue.
- Licencia: apache-2.0, permisiva para uso comercial, pero al derivar de `lerobot/pi05_base` conviene revisar tambien las condiciones del modelo base y de la metodologia original de Physical Intelligence.
- Caveat de reproduccion: la discrepancia entre el sufijo «20k» del nombre y los 10.000 pasos declarados en la configuracion debe aclararse antes de reutilizar el modelo en produccion.
- No apto para produccion sin validacion: con cero descargas, cero «likes» y sin evaluacion, debe tratarse como un artefacto de investigacion, no como un componente listo para despliegue industrial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nsk11235/franka-stack-150e-pi05-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nsk11235/franka-stack-50e-256
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nsk11235/franka-stack-50e-256
- Blog de pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos no guardaban relacion con el contenido de la ficha.
