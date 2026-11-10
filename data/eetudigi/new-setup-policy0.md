# eetudigi/new-setup-policy0

## Resumen

`eetudigi/new-setup-policy0` es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers), publicado por Zhao et al. en el paper arXiv:2304.13705. El modelo lo ha entrenado y publicado el usuario `eetudigi` mediante la librería LeRobot de Hugging Face y está pensado para controlar un robot de tipo `so_follower` (la variante seguidora del brazo SO-100/SO-101 de bajo coste) equipado con dos cámaras: una en la muñeca (`wrist`) y otra cenital (`top`).

No es un modelo de lenguaje: es un policy de robótica que consume el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. La tarea concreta para la que se ha entrenado es "Put the yellow cap in the red cup" (introducir el tapón amarillo en la taza roja), a partir de 30 episodios de teleoperación con 25.354 fotogramas a 30 FPS.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: dataset público, configuración de entrenamiento documentada (20.000 pasos, batch 8, AdamW, LR 1e-5) y comando de despliegue `lerobot-rollout`. No obstante, el modelo está en estado embrionario: cero descargas, cero likes, sin resultados de evaluación en robot real y sin licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist`, `top` (3x480x640 cada una) |
| Entrada de estado | `observation.state` con forma (6,) |
| Salida de acción | `action` con forma (6,) |
| Tamaño del repositorio | 0,2 GB |
| Librería | lerobot 0.7.1 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un backbone visual (encoder de imágenes para las dos cámaras) con un transformer que fusiona las observaciones y genera la secuencia de acciones. La model card no detalla la configuración interna de capas, dimensión de los embeddings ni número de pasos del chunk, por lo que esos datos no están disponibles.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `eetudigi/new-setup_20261110_133548`: 30 episodios de teleoperación, 25.354 fotogramas a 30 FPS, una única tarea ("Put the yellow cap in the red cup"). La configuración reportada es de 20.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún refinamiento posterior al entrenamiento supervisado por imitación. No hay información sobre decodificación especulativa ni innovaciones adicionales más allá del propio mecanismo de action chunking del paper original.

## Capacidades

- Control robótico de imitación para una tarea concreta: insertar un tapón amarillo en una taza roja.
- Percepción visual multimodal a partir de dos cámaras RGB (muñeca y cenital) a 480x640.
- Consumo de estado propioceptivo de 6 dimensiones y emisión de comandos de acción de 6 dimensiones.
- Predicción de chunks de acciones (no paso a paso), lo que aporta suavidad y robustez frente a errores acumulados.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline completo de imitación en robótica: sirve como referencia didáctica para grabar un dataset con LeRobot, entrenar una política ACT y desplegarla con `lerobot-rollout` en un brazo SO follower.
- Automatización de una tarea pick-and-place concreta: el modelo puede ejecutar la secuencia de coger el tapón amarillo y colocarlo en la taza roja en un entorno controlado, siempre que la disposición de cámara y robot coincida con la del entrenamiento.
- Base para fine-tuning con nuevos datasets: al estar entrenado con LeRobot, se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio y usar estos pesos como inicialización.
- Benchmark interno de políticas de imitación: útil para comparar la tasa de éxito de ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en la misma tarea y hardware.
- Docencia y divulgación: ejemplo mínimo (0,2 GB, 51,7 M de parámetros) que cabe en una GPU de consumo y permite demostrar el ciclo completo de aprendizaje por imitación en un taller o asignatura.
- Pruebas de infraestructura de robótica: validar la cadena de adquisición de vídeo a 30 FPS, calibración de cámaras y latencia de inferencia antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la frase "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo GPUs integradas en muchos casos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). El cuello de botella real es la captura de dos cámaras a 30 FPS y la latencia del bucle de control, no el modelo.
- Cabe en GPU de consumo: sí, en cualquier RTX moderna e incluso en GPUs de gama baja; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: `lerobot-rollout` (comando oficial documentado en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un policy de robótica.
- Latencia y throughput estimados: no disponibles. La model card no reporta tiempos de inferencia ni frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eetudigi/new-setup-policy0 | ACT (LeRobot) | 51,7 M | 2 cámaras 480x640 + estado (6,) | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | del orden de decenas de millones (no verificado) | configurable por dataset | normalmente Apache-2.0 en LeRobot (verificar por repo) | Hub de Hugging Face |
| Diffusion Policy (referencia) | Política de difusión | no disponible | imágenes + estado | no disponible | implementaciones en LeRobot y otros repos |
| VQ-BeT (referencia) | Política discreta con transformer | no disponible | imágenes + estado | no disponible | implementaciones en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica "More Information Needed", por lo que no se puede asumir permiso para uso comercial ni redistribución.
- Sin evaluación en robot real: no hay tasas de éxito publicadas, así que la fiabilidad de la política es desconocida.
- Dataset muy pequeño: 30 episodios y una sola tarea; la política probablemente no generaliza a nuevas posiciones de objetos, iluminación, distractores ni a un robot distinto del mismo tipo.
- Dependencia fuerte del montaje: las cámaras deben llamarse `wrist` y `top` y colocarse como en el entrenamiento; cualquier cambio de calibración o de encuadre degrada el comportamiento.
- Especialización extrema: solo sabe ejecutar "Put the yellow cap in the red cup"; no es un modelo generalista ni un modelo de lenguaje.
- Riesgo de sobreajuste al operador humano que teleoperó los datos (estilo de movimiento, velocidades), lo que puede producir trayectorias poco naturales o fallos en bordes del espacio de trabajo.
- Sin información sobre sesgos: al ser un modelo de robótica, los sesgos relevantes serían de distribución visual y de configuración física, no lingüísticos.
- Sin garantías de seguridad física: al controlar un brazo real, es imprescindible operar con límites de par, paradas de emergencia y supervisión humana.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de que el modelo haya sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eetudigi/new-setup-policy0
- Dataset de entrenamiento: https://huggingface.co/datasets/eetudigi/new-setup_20261110_133548
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eetudigi/new-setup_20261110_133548
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
