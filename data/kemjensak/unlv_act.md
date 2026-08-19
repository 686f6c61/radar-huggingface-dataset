# kemjensak/unlv_act

## Resumen

El modelo `kemjensak/unlv_act` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario kemjensak y entrenado con el framework LeRobot de Hugging Face, utilizando un dataset de teleoperación del robot RBY1. El modelo está diseñado para ejecutar la tarea de "pick" (recoger un objeto) usando dos cámaras (frontal y derecha) y un vector de estado de 8 dimensiones.

La relevancia de este modelo radica en que demuestra la aplicación práctica de ACT en un robot humanoide comercial (RBY1 de Rainbow Robotics), con una arquitectura relativamente ligera de aproximadamente 51,7 millones de parámetros. Al estar publicado bajo licencia Apache 2.0 y usando el ecosistema LeRobot, cualquier desarrollador puede reproducir el entrenamiento, evaluar el modelo en su propio hardware o adaptarlo a nuevas tareas. El modelo se publicó en agosto de 2026 y aún no cuenta con evaluaciones reportadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.672.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imagenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), propuesta en el paper arXiv:2304.13705. ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso, predice un "chunk" (bloque) de acciones futuras. Esto reduce el error de compounding y mejora la estabilidad del control en tareas de manipulacion. La arquitectura combina un encoder de vision (para procesar las imagenes de las camaras) con un transformer que opera sobre el estado del robot y genera secuencias de acciones.

El entrenamiento se realizo con el framework LeRobot (version 0.5.2) sobre el dataset `sunuk000/rby1_training`, que contiene 121 episodios y 47.290 frames a 30 FPS, todos etiquetados con la tarea "pick". La configuracion de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y seed 1000. No se menciona el uso de RLHF, DPO ni otros metodos de refinamiento; es un entrenamiento puramente de aprendizaje por imitacion supervisado.

## Capacidades

- Control de robot RBY1 para tareas de manipulacion, especificamente "pick" (recoger un objeto).
- Procesamiento multimodal de dos camaras (frontal y derecha) con resoluciones de 480x640 y 640x480 respectivamente.
- Prediccion de acciones en chunks (secuencias de acciones futuras), lo que permite un control mas suave y robusto frente a errores acumulados.
- Entrada de estado del robot de 8 dimensiones (posiciones articulares o similar, no especificado).
- Salida de acciones de 8 dimensiones.
- Integracion nativa con el ecosistema LeRobot: permite rollout, entrenamiento y evaluacion mediante comandos CLI estandarizados.
- No tiene capacidades de lenguaje, vision general, tool calling ni agentes; es un modelo de politica puramente motora.

## Casos de uso

- Automatizacion de tareas de picking en entornos industriales o de investigacion: el modelo puede ejecutar la tarea de recoger objetos con el robot RBY1, reduciendo la necesidad de programacion manual de trayectorias.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto de distintos datasets, configuraciones de camaras o hiperparametros en el rendimiento de ACT.
- Desarrollo de nuevas tareas sobre el robot RBY1: usando LeRobot, se puede fine-tuning del modelo para otras tareas (por ejemplo, "place" o "stack") a partir de nuevos datasets teleoperados.
- Evaluacion comparativa de algoritmos de control: el modelo puede usarse como baseline para comparar ACT con otros metodos (diffusion policies, etc.) en el mismo robot.
- Reproducibilidad academica: al ser open source con configuracion completa documentada, permite replicar los resultados y validar el metodo en otros laboratorios.
- Prototipado rapido en robotica asistida: un investigador puede cargar el modelo en un RBY1 y probar la tarea "pick" en minutos usando el comando `lerobot-rollout`, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de exito en robot real ni comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parametros y entrada de imagenes, se estima un consumo de entre 2 y 4 GB en FP32. Con cuantizacion a FP16 o int8, podria reducirse a 1-2 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4080, A100).
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas de consumo, incluso en algunas integradas con suficiente VRAM compartida.
- Opciones de despliegue: el modelo esta disenado para usarse con LeRobot, que soporta inferencia via `lerobot-rollout`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Depende del hardware y de la resolucion de las camaras. Para control en tiempo real se requiere que la inferencia sea mas rapida que el periodo de control (tipicamente 30 Hz o menos).

## Comparativa con modelos similares

No se dispone de modelos comparables directamente publicados para el robot RBY1 con la tarea "pick". ACT es un metodo generico; otros modelos de politica como Diffusion Policy (Chi et al., 2023) o VLA (Vision-Language-Action) podrian ser alternativas, pero no existen versiones publicadas especificamente para RBY1 en la informacion disponible. La comparativa se limita a indicar que ACT es un metodo establecido con buenos resultados en tareas de manipulacion, pero sin datos concretos de este modelo frente a otros.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un unico dataset de 121 episodios de un solo operador, el modelo puede generalizar mal a variaciones de iluminacion, posicion de objetos o cambios en el entorno.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: el modelo solo acepta dos camaras fijas (frontal y derecha) y un vector de estado de 8 dimensiones. No soporta otros sensores ni configuraciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`sunuk000/rby1_training`) puede tener sus propias condiciones; es necesario verificarlas.
- Caveat de produccion: no se han reportado evaluaciones en robot real, por lo que no hay evidencia de fiabilidad en entornos no controlados. Se recomienda validar exhaustivamente antes de cualquier despliegue.
- El modelo esta pensado para el robot RBY1; usarlo en otros robots requeriria adaptaciones significativas en la representacion de estado y acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kemjensak/unlv_act
- Dataset de entrenamiento: https://huggingface.co/datasets/sunuk000/rby1_training
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sunuk000/rby1_training
