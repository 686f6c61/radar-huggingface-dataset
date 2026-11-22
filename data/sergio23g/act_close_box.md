# Sergio23g/act_close_box

## Resumen

`Sergio23g/act_close_box` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Lo desarrolla el usuario Sergio23g y se distribuye a través de LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real.

La política está especializada en una única tarea: cerrar la tapa de una caja ("Close the box lid"). Consume el estado articular del robot (vector de 6 dimensiones) y dos flujos de vídeo de 480x640 píxeles procedentes de una cámara en la muñeca y otra cenital, y produce un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero para despliegue en hardware de borde.

Es relevante como ejemplo canónico de política visuomotora entrenada con LeRobot 0.7.1 sobre un robot SO-100/SO-101 (tipo `so_follower`), útil para quienes quieran reproducir el flujo completo de grabación de datos, entrenamiento y despliegue en un robot de bajo coste. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Camaras de entrada | wrist, top (3, 480, 640) cada una |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Framework | LeRobot 0.7.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos imágenes de cámara) con un transformer que predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks mitiga el problema de la varianza en la predicción de acciones individuales y mejora la estabilidad en tareas de contacto como cerrar una tapa. La arquitectura incluye mecanismos de atención sobre las observaciones multimodales (estado + dos cámaras) y un decodificador que genera la secuencia de acciones de 6 dimensiones.

El entrenamiento se realizó sobre el dataset `Sergio23g/close_box`, compuesto por 10 episodios y 6.455 fotogramas a 30 FPS, con la tarea única "Close the box lid". La configuración reportada es de 10.000 pasos de entrenamiento, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni datos adicionales; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de un robot `so_follower` para la tarea específica de cerrar la tapa de una caja.
- Fusión de dos vistas de cámara (muñeca y cenital) con el estado articular de 6 dimensiones para generar acciones de 6 dimensiones.
- Predicción de chunks de acciones, lo que aporta suavidad y consistencia temporal en la ejecución.
- Aprendizaje por imitación a partir de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Despliegue mediante `lerobot-rollout` con la estrategia base para ejecución en robot real.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica, no un modelo de lenguaje.

## Casos de uso

- Automatización de cierre de cajas en líneas de empaquetado: la política ejecuta la tarea "Close the box lid" sobre un robot SO-100/SO-101 con dos cámaras, adecuada para prototipos de celda de montaje de bajo coste.
- Reproducción del flujo LeRobot de extremo a extremo: sirve como referencia para grabar un dataset propio (10 episodios, 6.455 frames), entrenar con `lerobot-train` y desplegar con `lerobot-rollout`.
- Base para fine-tuning en tareas de manipulación con contacto: al ser una política ACT ligera (51,6 M de parámetros), se puede reentrenar con nuevos datasets de tapa, bisagra o ensamblaje.
- Validación de hardware y calibración: útil para comprobar la cadena cámara-robot-puerto antes de entrenar políticas más complejas, gracias a su reducido tamaño (0,2 GB).
- Docencia y divulgación en robótica de imitación: ejemplo mínimo y reproducible de ACT con configuración documentada (10.000 pasos, batch 8, AdamW, lr 1e-5).
- Investigación en aprendizaje por imitación con pocos datos: 10 episodios y 6.455 frames permiten estudiar la sensibilidad de ACT a la escasez de demostraciones.
- Despliegue en hardware de borde: los 51,6 M de parámetros y el formato safetensors permiten inferencia en GPUs de consumo o incluso en dispositivos embebidos con aceleración adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (0,2 GB de repositorio), la inferencia en precisión nativa requiere del orden de 1 GB o menos, incluyendo buffers de las dos cámaras a 480x640.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la política con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1650 en adelante) por el reducido número de parámetros.
- Opciones de despliegue: LeRobot 0.7.1 mediante `lerobot-rollout` con `--strategy.type=base`; entrenamiento con `lerobot-train` y `--policy.type=act`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución está limitada por la frecuencia de las cámaras (30 FPS) y el bucle de control del robot, no por el cómputo del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sergio23g/act_close_box | 51.668.614 | Cerrar tapa de caja, robot so_follower | no disponible | Hugging Face, LeRobot |
| Políticas ACT de LeRobot (referencia oficial) | variable según checkpoint | Tareas de manipulación diversas | según checkpoint | Hugging Face, LeRobot |
| Políticas Diffusion Policy (LeRobot) | variable | Manipulación visuomotora | según checkpoint | Hugging Face, LeRobot |
| Políticas pi0 / pi0.5 (Physical Intelligence) | no disponible | Manipulación generalista | no disponible | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a categoría (políticas de imitación visuomotora), framework (LeRobot) y tamaño.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha sido entrenada para la tarea "Close the box lid"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 10 episodios y 6.455 fotogramas implican alta sensibilidad a cambios de posición de la caja, iluminación, fondo o distracciones.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que el rendimiento en producción es desconocido.
- Licencia no especificada: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producto.
- Dependencia de hardware concreto: entrenada para robot `so_follower` con cámaras `wrist` y `top`; los nombres e índices de cámara deben coincidir exactamente con las claves de observación.
- Riesgo de sobreajuste y de deriva en ejecución prolongada: al no haber evaluación, no se puede descartar degradación fuera de la distribución de entrenamiento.
- No apta para tareas de lenguaje, razonamiento o generación de texto; su uso fuera de robótica de manipulación no tiene sentido.
- Sesgos: no documentados por el autor; en robótica de imitación los sesgos provienen de la política del teleoperador y de la distribución de demostraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sergio23g/act_close_box
- Dataset de entrenamiento: https://huggingface.co/datasets/Sergio23g/close_box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sergio23g/close_box
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
