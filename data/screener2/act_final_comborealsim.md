# Screener2/act_Final_ComboRealSim

## Resumen

`Screener2/act_Final_ComboRealSim` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario Screener2 en Hugging Face y se ha entrenado y subido con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Está diseñado para controlar un robot de tipo `so_follower` (familia SO-100/SO-101 de bajo coste) a partir de una imagen de cámara cenital y el estado de las articulaciones.

El modelo resuelve una tarea concreta de manipulación: recibe una observación compuesta por el estado del robot (vector de 6 dimensiones) y una imagen RGB de 480x640 píxeles, y emite un vector de acción de 6 dimensiones. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware modesto, no para uso general de lenguaje o visión.

Su relevancia es acotada pero práctica: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot sobre un dataset de 30 episodios y 14.918 fotogramas a 30 FPS, y como punto de partida para quien quiera replicar o adaptar el flujo de entrenamiento ACT en un robot de bajo coste. No es un modelo de propósito general ni tiene capacidades de texto, razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje, solo observaciones robóticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes) con un transformer que predice un chunk de acciones futuras a partir de la observación actual. La entrada del modelo son dos features: `observation.state`, un vector de 6 dimensiones que representa el estado de las articulaciones del robot, y `observation.images.overhead`, una imagen RGB de 3x480x640 capturada por una cámara cenital. La salida es `action`, un vector de 6 dimensiones. El método se describe en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), que introduce la predicción de chunks de acciones para reducir el error de acumulación y mejorar la estabilidad en tareas de manipulación fina.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Screener2/Final_ComboRealSim`, compuesto por 30 episodios y 14.918 fotogramas a 30 FPS, con una única tarea etiquetada como "0". La configuración usada fue de 100.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado a partir de demostraciones teleoperadas. Tampoco se especifica la composición exacta del dataset ni si combina datos reales y simulados, aunque el nombre "ComboRealSim" sugiere una mezcla de ambos.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de una imagen cenital y el estado de las articulaciones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado durante la inferencia.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la suavidad y la estabilidad del control.
- Ejecución en tiempo real: el reducido tamaño del modelo (51,7 M de parámetros) permite inferencia a la frecuencia de control del robot (30 FPS en el dataset de entrenamiento).
- Integración con LeRobot: se ejecuta mediante el comando `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto. Sus capacidades están limitadas al dominio robótico para el que fue entrenado.

## Casos de uso

- Replicación de un pipeline de imitación en robótica de bajo coste: sirve como referencia completa (dataset, configuración de entrenamiento y comando de rollout) para montar un flujo ACT con LeRobot sobre un robot SO-100/SO-101 y una cámara cenital.
- Tareas de pick-and-place en entornos controlados: el modelo puede ejecutar agarres y colocaciones sencillas sobre objetos en posiciones conocidas, siempre que la escena se parezca a la del dataset de entrenamiento.
- Docencia y formación en aprendizaje por imitación: al ser un modelo pequeño, con licencia Apache 2.0 y un dataset público de 30 episodios, es adecuado para cursos y talleres donde se explique el ciclo completo de teleoperación, entrenamiento y despliegue.
- Punto de partida para fine-tuning: un equipo puede reentrenar el modelo con su propio dataset (`lerobot-train --policy.type=act`) para adaptarlo a una tarea concreta sin partir de cero.
- Pruebas de integración de hardware: permite validar la cadena de comunicación robot-cámara-política (puerto serie, índices de cámara, frecuencia) antes de invertir en un dataset mayor.
- Investigación en robustez de políticas visuales: al depender de una única cámara cenital, es un caso de estudio útil para medir la sensibilidad a cambios de iluminación, posición de objetos y distractores.
- Automatización de tareas repetitivas de laboratorio: con un dataset ampliado, podría adaptarse a manipulaciones repetitivas de precisión moderada en entornos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía, con la nota explícita de que no se han proporcionado resultados de éxito en robot real. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros (aproximadamente 0,2 GB en fp32), la inferencia cabe holgadamente en cualquier GPU con 2 GB o más de VRAM. No se dispone de cifras oficiales de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar la política con margen. Para entrenamiento, una RTX 3090/4090 o una A100 acelera los 100.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso podría ejecutarse en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no se han publicado mediciones. La frecuencia de referencia del dataset es de 30 FPS, lo que sugiere que el modelo está pensado para control en tiempo real a esa cadencia, pero no hay cifras oficiales de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_Final_ComboRealSim | 51,7 M | no aplica | Manipulación robótica (ACT) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | ~50 M (típico) | no aplica | Manipulación robótica (ACT) | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación robótica | variable | Hugging Face / LeRobot |
| Políticas SmolVLA | no disponible | no aplica | Manipulación robótica con VLM | variable | Hugging Face |

La comparación con alternativas concretas no está disponible en la información proporcionada. El modelo es una instancia específica de ACT entrenada sobre un dataset propio, por lo que su comparación justa sería contra otras políticas ACT entrenadas en el mismo robot y tarea, datos que no se han publicado.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no reporta tasas de éxito en robot real, por lo que no hay evidencia pública de su rendimiento efectivo.
- Dataset muy pequeño: 30 episodios y 14.918 fotogramas son insuficientes para generalizar a variaciones de posición, iluminación, objetos o entornos distintos a los del entrenamiento.
- Una sola tarea: el modelo está entrenado para la tarea etiquetada como "0"; no es multitarea ni adaptable a instrucciones en lenguaje natural.
- Dependencia de una única cámara cenital: cambios en la cámara, su montaje o su calibración pueden degradar el rendimiento de forma significativa.
- Específico de hardware: diseñado para el robot `so_follower`; no es portable directamente a otras plataformas sin reentrenamiento.
- Riesgo de sobreajuste: con 100.000 pasos sobre 30 episodios, es probable que la política memorice trayectorias y falle ante perturbaciones.
- Sin datos de sesgos: no se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y peculiaridades de las demostraciones teleoperadas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el usuario asume la responsabilidad de validar el modelo en su entorno.
- Sin idiomas: no procesa lenguaje, por lo que no aplican consideraciones multilingües, pero tampoco puede recibir instrucciones verbales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_Final_ComboRealSim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/Final_ComboRealSim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/Final_ComboRealSim
