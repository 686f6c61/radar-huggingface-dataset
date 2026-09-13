# ootu47890/my_so101_act_final

## Resumen

`ootu47890/my_so101_act_final` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de control. La publica el usuario `ootu47890` y ha sido entrenada con LeRobot 0.6.1; el modelo consume el estado del robot (vector de 6 dimensiones) y una imagen frontal de 480x640 píxeles para emitir comandos de acción de 6 dimensiones dirigidos al brazo seguidor SO-101 (`so_follower`).

Con 51.668.614 parámetros (unos 51,7 M), un repositorio de 0,2 GB y licencia Apache 2.0, es una política compacta especializada en una única tarea: "Pick up the object and place it on the right". El entrenamiento se realizó sobre 20 episodios y 71.998 fotogramas capturados a 30 FPS mediante teleoperación, en 20.000 pasos de optimización con AdamW y una tasa de aprendizaje de 1e-05.

Su relevancia es fundamentalmente práctica: documenta el flujo completo de LeRobot (grabación de datos, entrenamiento, publicación en el Hub e inferencia en robot real) sobre hardware de bajo coste, y sirve como punto de partida reproducible para replicar o extender una política visuomotora con una sola GPU de consumo. No es un modelo de lenguaje ni un sistema multimodal general: su salida es exclusivamente control motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor con ACT (Action Chunking with Transformers): transformer con codificador visual, codificador de estado y decodificador de acciones, con rama CVAE durante el entrenamiento |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el horizonte de chunk de acciones no se especifica en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No aplicable: no procesa lenguaje natural, solo estados numéricos e imágenes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de política LeRobot) |
| Tipo de robot | `so_follower` (brazo SO-101) |
| Camaras | `front` |
| Entradas | `observation.state` STATE `(6,)`; `observation.images.front` VISUAL `(3, 480, 640)` |
| Salidas | `action` ACTION `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |

## Arquitectura y entrenamiento

ACT es un método de clonado de comportamiento (imitation learning) que combina un codificador visual, un codificador del estado propioceptivo y un decodificador transformer autorregresivo que genera un chunk de acciones de longitud fija. Durante el entrenamiento se añade una rama CVAE (autoencoder variacional condicional) que modela la variabilidad humana de las demostraciones; en inferencia esa rama se descarta y se usa únicamente el decodificador. La predicción por chunks, junto con el ensamblado temporal, reduce el error de acumulación típico de las políticas paso a paso y estabiliza el control a 30 FPS. El modelo consume una única cámara frontal a 480x640 y un estado/acción de 6 grados de libertad, lo que lo ata específicamente a la morfología del SO-101.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El conjunto de datos, `ootu47890/my_so101_training`, contiene 20 episodios y 71.998 fotogramas a 30 FPS de la tarea "Pick up the object and place it on the right". No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, ya que el paradigma es puramente de aprendizaje supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Manipulación robótica visuomotora: ejecuta la tarea de recoger un objeto y colocarlo en una posición situada a la derecha.
- Control de 6 grados de libertad sobre el brazo SO-101, a partir de un vector de estado de 6 dimensiones.
- Percepción visual mediante una cámara frontal a 480x640, usada para condicionar la acción.
- Predicción de chunks de acciones, lo que permite un control más suave que las políticas de paso único.
- Ejecución en bucle continuo a 30 FPS mediante `lerobot-rollout` durante periodos configurables (por ejemplo, `--duration=60`).
- Soporte de tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no aplicable.
- Capacidades especiales (modo thinking, visión general, audio): no aplicable; la visión está limitada a la realimentación de control de la tarea entrenada.

## Casos de uso

- Automatización de pick-and-place en un puesto de trabajo: el modelo puede recoger piezas y depositarlas en una posición predefinida a la derecha, replicando la tarea exacta sobre la que fue entrenado, sin necesidad de programar trayectorias explícitas.
- Base para fine-tuning con nuevos objetos o posiciones: al estar en LeRobot, se puede partir de estos pesos y reentrenar con un dataset propio mediante `lerobot-train --policy.type=act`, reduciendo el coste frente a entrenar desde cero.
- Validación de un pipeline completo de aprendizaje por imitación: útil para equipos que quieren verificar la cadena teleoperación → grabación → entrenamiento → despliegue sobre hardware SO-101 antes de invertir en campañas de datos mayores.
- Laboratorio docente y de investigación: sirve de ejemplo reproducible de clonado de comportamiento con una sola GPU, ideal para prácticas sobre action chunking, CVAE y ensamblado temporal.
- Recogida de datos comparativa: puede usarse como política de referencia para medir cuánto mejora un modelo al ampliar el número de episodios o al añadir cámaras, manteniendo fija la tarea y el robot.
- Demostraciones de robótica de bajo coste: con un SO-101 y una cámara basta para reproducir la inferencia, lo que permite montar demostraciones públicas o vídeos sin hardware especializado.
- Punto de partida hacia tareas más complejas: la misma arquitectura admite entrenar variantes bimanuales o multitarea, por lo que este modelo sirve como referencia mínima funcional antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existe una tabla de ensayos, éxitos y tasa de éxito para la tarea "Pick up the object and place it on the right". Tampoco se aportan métricas de simulación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en FP32 (51,7 M de parámetros) y unos 0,10 GB en FP16; el cuello de botella real es el proceso de visión por computadora y el bucle de control, no el peso del modelo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA razonablemente moderna; el propio flujo de LeRobot contempla `--policy.device=cuda`. Una RTX 3060, RTX 4070 o RTX 4090 es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM e incluso en iGPU para inferencia, aunque conviene GPU para sostener los 30 FPS.
- CPU: la inferencia puede ejecutarse en CPU, pero a costa de una latencia mayor que puede degradar el control en tiempo real.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`), inferencia directa con PyTorch sobre el checkpoint safetensors y entrenamiento o reentrenamiento con `lerobot-train`. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. El modelo está pensado para operar dentro del bucle de control a 30 FPS, frecuencia a la que se grabaron los datos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ootu47890/my_so101_act_final | 51,7 M | ACT sobre SO-101, 1 camara | No disponible | Apache 2.0 | Hugging Face |
| aiden-li/so101-act | No disponible | ACT sobre SO-101 (LeRobot), dataset `aiden-li/so101-picklego` | No disponible | Apache 2.0 | Hugging Face |
| ACT original (ALOHA, arXiv:2304.13705) | No disponible | ACT sobre hardware ALOHA bimanual | Resultados publicados en el articulo, no reproducidos aqui | No disponible | Implementacion de referencia en repositorio publico |
| Diffusion Policy (arXiv:2303.04137) | No disponible | Politica de difusion para control visuomotor | Resultados publicados en el articulo | No disponible | Implementacion publica |

La comparación directa más cercana es con `aiden-li/so101-act`, que emplea el mismo método, la misma librería y la misma licencia sobre el mismo tipo de brazo, aunque entrenada para una tarea distinta y sin especificar el número de parámetros en la información consultada. Frente a Diffusion Policy, ACT suele ser más ligera y rápida en inferencia, mientras que las políticas de difusión tienden a modelar mejor la multimodalidad de las demostraciones a costa de más cómputo.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Pick up the object and place it on the right"; fuera de ella no cabe esperar comportamiento útil.
- Dataset muy reducido: 20 episodios y 71.998 fotogramas son una base pequeña, lo que limita la generalización a nuevas posiciones, iluminación o tipos de objeto.
- Ausencia de evaluación: no hay resultados de éxito publicados, por lo que se desconoce la tasa real de acierto en robot físico.
- Dependencia de la configuración hardware: las entradas exigen un vector de estado de 6 dimensiones y una cámara llamada `front` a 480x640 y 30 FPS; cambiar nombres o resoluciones rompe la inferencia.
- Una sola cámara: la falta de puntos de vista adicionales reduce la robustez ante oclusiones.
- Sesgos: al derivar de demostraciones humanas de teleoperación, hereda los sesgos y las limitaciones motoras de la persona que grabó los datos.
- Riesgo de acciones físicas erróneas: no se trata de un "riesgo de alucinación" textual, sino de la posibilidad de que la política genere comandos motores incorrectos. Debe operarse con límites de par, paradas de emergencia y supervisión humana.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la atribución correspondiente.
- Cita requerida: el autor pide citar el método original (arXiv:2304.13705) y LeRobot si se reutiliza la política.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, por lo que no existe validación comunitaria que respalde su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ootu47890/my_so101_act_final
- Dataset de entrenamiento: https://huggingface.co/datasets/ootu47890/my_so101_training
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ootu47890/my_so101_training
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Modelo similar en Hugging Face (aiden-li/so101-act): https://huggingface.co/aiden-li/so101-act
- Modelo similar en Hugging Face (aiden-li/so101-act, README): https://huggingface.co/aiden-li/so101-act/blob/main/README.md
