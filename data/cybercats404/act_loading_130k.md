# cybercats404/act_loading_130k

## Resumen

`cybercats404/act_loading_130k` es una política de imitación para robótica manipulativa entrenada con el método **ACT (Action Chunking with Transformers)** y publicada con la librería **LeRobot** de Hugging Face. No es un modelo de lenguaje: es un modelo de control visomotor que, a partir del estado articular del robot (vector de 6 dimensiones) y de dos cámaras RGB de 480×640 (muñeca y cenital), predice directamente un vector de acción de 6 dimensiones. El problema que resuelve es el típico de la manipulación real: convertir demostraciones de teleoperación en una política que ejecute una tarea concreta de forma autónoma, en este caso "retirar los engranajes a la bandeja y colocar los anillos en los postes".

El modelo lo publica el usuario `cybercats404` en el contexto de un hackathon (el dataset asociado se llama `so101_hackathon_20261017_180036`) y está pensado para el robot **SO-101** en su variante `so_follower`. Cuenta con **51.668.614 parámetros** (dato real de los pesos en safetensors) y se distribuye bajo licencia **Apache-2.0**, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 3,1 GB, un tamaño muy superior al de los pesos puros (unos 207 MB en FP32), lo que sugiere que incluye varios checkpoints y estados de entrenamiento.

Su relevancia es doble. Por un lado, ejemplifica el flujo completo de LeRobot para *imitation learning* de bajo coste: 50 episodios, 52.925 fotogramas a 30 FPS y 5.000 pasos de entrenamiento con AdamW y batch 32. Por otro, sirve como referencia práctica de cómo se empaqueta y se despliega una política ACT lista para `lerobot-rollout`, algo útil para quien esté montando su primer pipeline de robótica con hardware asequible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE para imitación visomotora; predice *chunks* de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La ventana de observación viene definida por la configuración de entrenamiento y el *chunking* de acciones |
| Tipos de cuantización | no disponible en la información proporcionada; los pesos se publican en safetensors (FP32 por defecto en LeRobot) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB, con checkpoints de entrenamiento) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea entrenada | "Remove the gears into the tray, then put the rings on the poles" |
| Pasos de entrenamiento declarados | 5000 (batch 32, AdamW, lr 1e-05, seed 1000, LeRobot 0.5.2) |

## Arquitectura y entrenamiento

ACT es un método de *imitation learning* presentado en el paper arXiv 2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*). La arquitectura combina un **autoencoder variacional condicional (CVAE)** con un **transformer encoder-decoder**: el encoder procesa la observación (estado articular + imágenes de las cámaras) y el decoder genera un *chunk* de acciones futuras en lugar de un único paso. Predecir secuencias cortas de acciones mitiga el problema de la varianza en la predicción paso a paso y reduce el error acumulado, algo crítico en tareas de precisión como insertar anillos en postes. En inferencia se suele aplicar *temporal ensembling* para suavizar la transición entre chunks, aunque la configuración exacta de este checkpoint no se detalla en la model card.

El entrenamiento se realizó con **LeRobot 0.5.2** sobre el dataset `cybercats404/so101_hackathon_20261017_180036`: **50 episodios**, **52.925 fotogramas** capturados a **30 FPS** mediante teleoperación, con dos cámaras (`wrist` y `top`) a 480×640. La configuración declarada es de **5.000 pasos**, batch de 32, optimizador **AdamW** y learning rate de **1e-05** con semilla 1000. No se documenta el tamaño del *chunk* de acciones, el número de tokens del transformer ni si se aplicaron aumentos de datos. La model card no menciona RLHF ni DPO, algo esperable: ACT es aprendizaje por imitación supervisado, no ajuste por preferencias.

Hay una inconsistencia notable que conviene señalar: el nombre del repositorio (`act_loading_130k`) sugiere 130.000 pasos, mientras que la tabla de configuración declara 5.000. No hay información en la model card que permita resolver la discrepancia, así que conviene tratarla como un dato a verificar antes de reutilizar el checkpoint.

## Capacidades

- **Manipulación visomotora de precisión**: ejecuta una tarea de ensamblaje concreta (retirar engranajes y colocar anillos en postes) a partir de dos vistas RGB y del estado articular.
- **Predicción de chunks de acciones**: genera secuencias cortas de acciones de 6 dimensiones en lugar de comandos aislados, lo que produce trayectorias más estables.
- **Control de robot real a 30 FPS**: la frecuencia de entrenamiento (30 FPS) coincide con la frecuencia de las cámaras configuradas en el comando de rollout.
- **Integración nativa con LeRobot**: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train` mediante CLI, sin código adicional.
- **Uso con hardware de bajo coste**: diseñado para el SO-101 en configuración `so_follower` con dos cámaras OpenCV.
- **No soporta**: tool calling, razonamiento multi-paso simbólico, generación de texto, matemáticas, visión general, audio ni capacidades multilingües. Es una política específica de tarea (*single-task*), no un modelo generalista.

## Casos de uso

- **Automatización de ensamblaje en línea de montaje**: la política ejecuta la secuencia "engranajes a la bandeja + anillos en los postes" de forma repetitiva sobre un SO-101, útil como banco de pruebas de una célula de montaje de bajo coste.
- **Prototipado rápido de tareas con teleoperación**: grabar 50 episodios con el mando, lanzar `lerobot-train` y obtener una política funcional en horas; el modelo publicado sirve como referencia de qué calidad esperar con ese volumen de datos.
- **Investigación en imitation learning**: base para experimentos de comparación con Diffusion Policy u otros métodos, o para estudiar la sensibilidad a la posición de objetos e iluminación.
- **Docencia y formación en robótica con IA**: el stack LeRobot + SO-101 + ACT permite montar un laboratorio de aprendizaje por imitación con hardware de menos de mil euros y reproducir el flujo completo desde la calibración hasta el despliegue.
- **Generación de datos sintéticos para evaluación**: usar la política como *baseline* que produce trayectorias válidas para comparar con políticas nuevas sobre el mismo dataset y la misma tarea.
- **Pruebas de integración de pipelines de despliegue**: validar la cadena de inferencia (cámaras, puerto serie, frecuencia de control, `lerobot-rollout`) antes de invertir en entrenamientos más largos o en hardware superior.
- **Base para *fine-tuning* en tareas de pick-and-place similares**: al ser Apache-2.0 y con 51,7 M de parámetros, se puede reentrenar en una GPU de consumo partiendo de estos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y el autor indica explícitamente: *"No evaluation results have been provided for this policy yet"*. No existen, por tanto, tasas de éxito medidas en robot real, ni número de ensayos, ni condiciones de dificultad documentadas.

Los resultados de la búsqueda web proporcionados no contienen información relevante sobre este modelo ni sobre políticas ACT del SO-101 (los resultados tratan sobre OSINT y no guardan relación).

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~207 MB en FP32 (51,67 M de parámetros × 4 bytes) y ~103 MB en FP16. Es un modelo que cabe holgadamente en cualquier GPU, integrada incluida.
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA sirve; una RTX 3060/4060 o superior ya deja margen de sobra. Para entrenamiento, una RTX 4090 o una A100 aceleran el proceso, pero no son necesarias: con 51,7 M de parámetros y batch 32, el cuello de botella suele ser el preprocesado de las dos imágenes de 480×640, no el modelo.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo de los últimos diez años, y también en CPU para inferencia (aunque conviene verificar que se sostienen los 30 FPS).
- **Opciones de despliegue**: `lerobot-rollout` (ruta oficial, con `--policy.path=cybercats404/act_loading_130k`), o carga directa desde Python con la librería `lerobot`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponible. El control se ejecuta a 30 FPS según la configuración de cámaras del ejemplo, pero no se publican mediciones de latencia por paso ni de tasa de éxito.
- **Almacenamiento**: 3,1 GB de repositorio; conviene descargar solo los ficheros de pesos necesarios si no se va a reanudar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cybercats404/act_loading_130k` | ACT (transformer + CVAE, chunking) | 51.668.614 | 2 cámaras + estado de 6 dim. | Apache-2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy | Política por difusión de acciones | no disponible | Típicamente imágenes + estado | no disponible en la información proporcionada | Repositorio de investigación; integración en LeRobot |
| SmolVLA | VLA (visión-lenguaje-acción) | no disponible en la información proporcionada | Imágenes + instrucción en lenguaje natural | no disponible en la información proporcionada | Hugging Face, vía LeRobot |
| OpenVLA | VLA de propósito general | no disponible en la información proporcionada | Imágenes + instrucción en lenguaje natural | no disponible en la información proporcionada | Hugging Face |

Diferencias cualitativas relevantes: ACT es una política **monotarea y ligera** (51,7 M de parámetros), entrenada para una tarea y un robot concretos, lo que la hace muy eficiente en inferencia pero incapaz de generalizar a instrucciones nuevas. Diffusion Policy modela la distribución multimodal de acciones mediante difusión, lo que suele mejorar en tareas con múltiples modos de ejecución a costa de más pasos de inferencia. Los modelos VLA (SmolVLA, OpenVLA) aceptan instrucciones en lenguaje natural y generalizan entre tareas, pero son de uno a dos órdenes de magnitud más grandes y no igualan en precisión a una política especializada dentro de su tarea. Faltan datos verificables en la información proporcionada para comparar parámetros, contexto y rendimiento de las alternativas; habría que consultar sus fichas respectivas.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasa de éxito medida, ni número de ensayos, ni condiciones de prueba. Cualquier uso en producción requiere una evaluación propia en robot real antes de confiar en la política.
- **Específica de tarea**: solo ejecuta "Remove the gears into the tray, then put the rings on the poles". No acepta instrucciones nuevas ni generaliza a otras tareas sin reentrenamiento.
- **Sesgo de dominio**: entrenada con 50 episodios en un entorno concreto. Es previsible que falle ante cambios de iluminación, posición de los objetos, tipo de mesa, fondo o distracciones; no se documenta ningún tipo de aumento de datos ni variabilidad introducida.
- **Dependencia del hardware exacto**: las cámaras deben llamarse `wrist` y `top` y montarse en la misma posición relativa que en el entrenamiento; el robot debe ser un `so_follower` calibrado. Cualquier cambio en la cinemática o en la calibración invalida la política.
- **Inconsistencia en el nombre del repositorio**: el identificador sugiere 130.000 pasos, mientras que la configuración declara 5.000. Verificar antes de asumir convergencia.
- **Riesgo de alucinación en sentido figurado**: al ser un modelo generativo de acciones, puede producir trayectorias plausibles pero incorrectas sin señal de incertidumbre. No hay mecanismo de detección de fallo ni de parada segura incluido.
- **Sin filtros de seguridad**: no hay limitación de par, de velocidad ni de colisiones. En un robot real es imprescindible implementar paradas de emergencia y límites articulares en el controlador de bajo nivel.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero conviene citar el paper de ACT y LeRobot según la model card.
- **Idiomas y texto**: no aplica; el modelo no procesa ni genera lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cybercats404/act_loading_130k
- Dataset de entrenamiento: https://huggingface.co/datasets/cybercats404/so101_hackathon_20261017_180036
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=cybercats404/so101_hackathon_20261017_180036
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos versaban sobre herramientas OSINT y se han descartado.
