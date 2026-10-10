# jsbzzz/2camera_train

## Resumen
`jsbzzz/2camera_train` no es un modelo de lenguaje, sino una política de imitación para robótica entrenada con la librería LeRobot de Hugging Face y publicada en el Hub por el usuario jsbzzz. Implementa el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv 2304.13705, que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso, a partir de datos de teleoperación. El modelo consume el estado del robot (6 dimensiones) y dos flujos de imagen de 480x640 (cámaras `top` y `wrist`), y produce un vector de acción de 6 dimensiones.

Se trata de un artefacto muy específico: ha sido entrenado para una única tarea, "Put the gray eraser on box", sobre un robot de tipo `omx_follower`, con un dataset de solo 10 episodios y 5502 fotogramas a 30 FPS. El repositorio ocupa 0,2 GB y los pesos suman 51.668.614 parámetros, un tamaño propio de una política compacta de control, no de un transformer generativo de gran escala.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (grabación de datos, entrenamiento ACT y despliegue con `lerobot-rollout`) dentro del ecosistema LeRobot, más que como modelo de propósito general. No incluye licencia declarada ni resultados de evaluación, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT); transformer con componente CVAE para modelar la variabilidad de las demostraciones (segun el metodo del articulo arXiv 2304.13705) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; ACT predice horizontes de acciones) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (no aplica; es una politica robotica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue el metodo ACT (Action Chunking with Transformers), presentado en el articulo arXiv 2304.13705. ACT es un enfoque de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso de tiempo, genera un fragmento (chunk) de acciones futuras, lo que reduce el error de acumulacion y mejora la estabilidad del control. La formulacion tipica combina un autoencoder variacional condicional (CVAE) para capturar la multimodalidad de las demostraciones humanas con un transformer que mapea observaciones (estado e imagenes) a secuencias de acciones. Al tratarse de una implementacion de LeRobot, los detalles exactos de configuracion (por ejemplo, el tamano del chunk, el numero de capas o las dimensiones internas) no se detallan en la model card.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `IMCON/OMX_LeRobot_20261009_231823`, compuesto por 10 episodios y 5502 fotogramas a 30 FPS para la tarea "Put the gray eraser on box". La configuracion reportada es de 60000 pasos de entrenamiento, tamano de lote 16, optimizador adamw, tasa de aprendizaje 1e-05 y semilla 1000. Las entradas son `observation.state` (forma 6), `observation.images.top` (3x480x640) y `observation.images.wrist` (3x480x640); la salida es `action` (forma 6). No se documenta el uso de RLHF, DPO ni tecnicas adicionales de ajuste; el paradigma es puramente de aprendizaje por imitacion supervisado sobre datos teleoperados.

## Capacidades
- Control robotico por imitacion: genera vectores de accion de 6 dimensiones para el robot `omx_follower`.
- Percepcion visual multimodal: procesa dos camaras simultaneas (`top` y `wrist`) a 480x640 junto con el estado proprioceptivo de 6 dimensiones.
- Prediccion de secuencias de acciones (action chunking), lo que aporta estabilidad frente a la prediccion paso a paso.
- Ejecucion de una tarea concreta de manipulacion: "Put the gray eraser on box".
- Integracion con el ecosistema LeRobot: despliegue mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, ni capacidades de lenguaje, vision general o audio; es una politica de control, no un modelo generativo de texto.

## Casos de uso
- Manipulacion robotica de una tarea especifica: recoger un objeto (goma de borrar gris) y colocarlo sobre una caja, replicando la tarea para la que fue entrenado.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia reproducible para estudiar el comportamiento de ACT con pocos datos (10 episodios).
- Base para transferencia o fine-tuning: puede inicializarse un nuevo entrenamiento ACT sobre otra tarea con `lerobot-train` reutilizando estos pesos.
- Demostraciones educativas: ilustra el flujo completo de LeRobot (grabacion, calibracion, entrenamiento y rollout) en cursos o talleres de robotica.
- Validacion de hardware `omx_follower`: permite verificar que un montaje fisico con camaras `top` y `wrist` funciona antes de escalar a tareas mayores.
- Investigacion sobre robustez: util para medir como se degrada una politica ACT ante cambios de iluminacion, posicion del objeto o distractores, dada la ausencia de evaluacion publicada.
- Automatizacion de pick-and-place simple en laboratorio: colocacion repetitiva de un objeto en una ubicacion fija bajo condiciones controladas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion sin completar: "_No evaluation results have been provided for this policy yet._". No se dispone de tasas de exito, numero de ensayos ni condiciones de prueba, por lo que no es posible presentar una tabla comparativa de rendimiento.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; con 51,7 millones de parametros en safetensors, los pesos en precision completa ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo e incluso podria ejecutarse en CPU.
- GPU recomendadas para despliegue: cualquier GPU con al menos 4-8 GB de VRAM (por ejemplo RTX 3060, RTX 4090); para entrenamiento con `--policy.device=cuda` es recomendable una GPU dedicada, aunque el modelo es pequeno.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna (GTX 1060 en adelante, RTX serie 20/30/40) e incluso en hardware integrado para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento), con soporte de CUDA mediante `--policy.device=cuda`; libreria `lerobot` 0.6.2 como entorno de referencia.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de frecuencia de inferencia ni de tasa de exito en el robot real.

## Comparativa con modelos similares
No se dispone de datos verificables de parametros, contexto o rendimiento para establecer una comparativa cuantitativa fiable con otras politicas de robotica. A continuacion se ofrece una comparacion cualitativa de categorias dentro del ecosistema LeRobot, indicando los campos sin datos confirmados.

| Modelo / metodo | Categoria | Parametros totales | Licencia | Disponibilidad |
|---|---|---|---|---|
| jsbzzz/2camera_train (ACT) | Politica de imitacion ACT | 51.668.614 | no disponible | HuggingFace (`jsbzzz/2camera_train`) |
| Diffusion Policy | Politica de imitacion basada en difusion | no disponible | no disponible | implementada en LeRobot |
| Otras politicas ACT de LeRobot | Politica de imitacion ACT | no disponible | no disponible | Hub de HuggingFace |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenada para una unica tarea ("Put the gray eraser on box") y un unico tipo de robot (`omx_follower`); no generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Dataset muy reducido (10 episodios, 5502 fotogramas), lo que incrementa el riesgo de sobreajuste y de baja robustez ante variaciones.
- Sin resultados de evaluacion publicados: se desconoce la tasa de exito real, por lo que no debe asumirse un rendimiento concreto.
- Sensibilidad esperada a cambios en iluminacion, posicion del objeto, presencia de distractores y diferencias de calibracion entre camaras; requiere validacion en el entorno objetivo.
- Dependencia estricta de la configuracion de camaras y de los nombres de las observaciones (`observation.images.top`, `observation.images.wrist`) para que la politica funcione correctamente.
- Licencia no declarada: sin una licencia explicita, el uso comercial queda sujeto a la normativa de derechos de autor aplicable y a lo que determine el autor, por lo que se recomienda contactar con el propietario antes de cualquier despliegue comercial.
- Riesgo de comportamientos inseguros en robotica real: al ser una politica de control fisico, los fallos pueden provocar colisiones o danos; se recomienda ejecutar con supervision y limites de seguridad.
- Idiomas no aplicables: el modelo no procesa ni genera lenguaje natural, salvo la cadena de tarea usada como condicionamiento en el rollout.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/jsbzzz/2camera_train
- Dataset de entrenamiento: https://huggingface.co/datasets/IMCON/OMX_LeRobot_20261009_231823
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=IMCON/OMX_LeRobot_20261009_231823
- Articulo ACT (arXiv): https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
