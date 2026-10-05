# castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_146945

## Resumen

Esta ficha describe `castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_146945`, una política de control visuomotor basada en Diffusion Policy y entrenada con la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es un modelo de robótica (pipeline `robotics`) que aprende una tarea de manipulación concreta mediante imitación, a partir de demostraciones con dos cámaras RGB y el estado propio del robot.

El modelo resuelve la tarea "Insert the hook into the base to build a frame, then hang the wrench on the hook" sobre un robot de tipo `panda` según la model card (el identificador del repositorio menciona UR5e, una discrepancia que conviene verificar). Consume `observation.state` de 9 dimensiones y dos imágenes de 256x256 (`sideview` y `robot0_eye_in_hand`), y produce una acción de 7 dimensiones. Tiene 278.014.919 parámetros y se distribuye en safetensors con licencia Apache-2.0.

Su relevancia es acotada pero clara: es un ejemplo reproducible de cómo LeRobot permite entrenar, publicar y desplegar una política de difusión para manipulación con contacto, en este caso con 200 episodios y 95.962 fotogramas de datos a 20 FPS. El checkpoint se publicó sin resultados de evaluación en robot real ni en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (proceso de difusión condicional sobre secuencias de acción, según arXiv:2303.04137) |
| Parametros totales | 278.014.919 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el identificador sugiere horizonte de predicción H=32, pero el horizonte de observación no está documentado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una implementación de Diffusion Policy, el método descrito en el artículo *Diffusion Policy: Visuomotor Policy Learning via Action Diffusion* (arXiv:2303.04137). La política modela el control como un proceso generativo de difusión condicionado por las observaciones (estado de 9 dimensiones y dos imágenes de 256x256 procedentes de las cámaras `sideview` y `robot0_eye_in_hand`), y produce como salida una secuencia de acciones de 7 dimensiones que se ejecuta en bucle. La model card no especifica el backbone exacto (U-Net temporal 1D o transformer), ni el número de pasos de difusión, ni el scheduler empleado.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`, compuesto por 200 episodios y 95.962 fotogramas a 20 FPS (aproximadamente 80 minutos de demostraciones). La configuración declarada es de 140.000 pasos, batch size 128, optimizador Adam, learning rate 0,0001 y semilla 1000. No se documenta si hubo data augmentation, RLHF, DPO ni ninguna otra fase de ajuste; tampoco se detalla la composición del dataset más allá de la tarea citada.

## Capacidades

- Generación de trayectorias de acción continuas de 7 dimensiones mediante difusión, adecuadas para control visuomotor.
- Manipulación con contacto (la propia tarea incluye inserción de un gancho y colocación de una llave sobre él).
- Percepción multimodal: combina el estado propioceptivo del robot con dos vistas RGB de 256x256 píxeles.
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- Reentrenamiento o ajuste sobre datos propios con `lerobot-train` usando `--policy.type=diffusion`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente ni soporte multilingüe.
- No dispone de modo de pensamiento, visión semántica, audio ni ninguna capacidad fuera del control motor.

## Casos de uso

- Automatización de ensamblaje en laboratorio: el modelo ejecuta la secuencia completa de insertar el gancho en la base y colgar la llave, adecuado para reproducir una tarea contact-rich ya demostrada por un operador.
- Punto de partida para fine-tuning: con 278 M de parámetros se puede reentrenar en una GPU única usando `lerobot-train` sobre un dataset propio con el mismo formato de observaciones y acciones.
- Evaluación comparativa de métodos de imitación: sirve como referencia de Diffusion Policy frente a otras políticas de LeRobot (por ejemplo, ACT) en la tarea `tool_hang` de robomimic.
- Estudio de sim-to-real: el dataset de origen es robomimic, por lo que el checkpoint permite analizar la transferencia desde datos de simulación a un robot físico, con las cautelas que ello implica.
- Replicación de un pipeline completo de aprendizaje por imitación: grabar demostraciones con dos cámaras, entrenar con LeRobot y desplegar en el robot, usando este checkpoint como caso de referencia publicado.
- Docencia e investigación en políticas generativas: permite inspeccionar el uso de difusión para generar secuencias de acción suaves sin necesidad de infraestructura de gran escala.
- Prototipado de celdas robotizadas con doble cámara: la política asume una vista lateral fija y una cámara en la muñeca, lo que encaja con montajes de banco de trabajo instrumentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasa de éxito en robot real o en simulación.

## Requisitos de hardware

- VRAM estimada para los pesos: alrededor de 1,1 GB en fp32 (278 M de parámetros) y unos 0,56 GB en fp16/bf16. El repositorio ocupa 1,1 GB.
- VRAM total en inferencia: previsiblemente entre 2 y 4 GB contando activaciones, preprocesado de las dos imágenes de 256x256 y los tensores intermedios del bucle de difusión; no hay medición publicada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente por tamaño. No requiere A100 ni H100; una RTX 3060, RTX 4070 o RTX 4090 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch con CUDA y `--policy.device=cuda`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del número de pasos de difusión, no documentado, y de la frecuencia de control del robot (el dataset se grabó a 20 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_128_H_32_TASK_tool_hang | 278.014.919 | H=32 según identificador; horizonte de observación no disponible | Tool hang (robomimic) con robot panda | Apache-2.0 | HuggingFace, vía LeRobot |
| Diffusion Policy (implementación original, Chi et al.) | no disponible | no disponible | Manipulación visuomotora genérica | no disponible | Paper y código de referencia |
| ACT (Action Chunking Transformer, integrado en LeRobot) | no disponible | no disponible | Imitación con chunking de acciones | no disponible | LeRobot |
| Políticas VLA tipo pi0 o SmolVLA | no disponible | no disponible | Manipulación guiada por lenguaje | no disponible | LeRobot |

No se dispone de cifras de rendimiento comparables para este checkpoint, por lo que la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no se puede afirmar que la política funcione de forma fiable.
- Discrepancia entre el identificador del repositorio, que menciona `UR5e`, y la model card, que declara `Robot type: panda`. Hay que verificar sobre qué plataforma se entrenó realmente antes de desplegarlo.
- Dependencia estricta del montaje de cámaras: el modelo espera exactamente las claves `observation.images.sideview` y `observation.images.robot0_eye_in_hand` a 256x256; cualquier cambio de encuadre, iluminación o cámara degrada el rendimiento.
- Dataset pequeño y de una única tarea: 200 episodios y 95.962 fotogramas para una sola secuencia de manipulación, con riesgo alto de sobreajuste al entorno concreto.
- Posible brecha sim-to-real: los datos provienen de robomimic, un entorno habitualmente simulado, y no se documenta ninguna validación en robot físico.
- Sin capacidades de lenguaje ni de generalización a instrucciones nuevas: la tarea está fijada y no se puede reespecificar en tiempo de ejecución.
- Sensibilidad inherente a la difusión: el número de pasos de muestreo afecta directamente a la latencia y a la suavidad de la trayectoria, y ese parámetro no está documentado.
- Licencia Apache-2.0: permite uso comercial y modificación, con la obligación habitual de conservar avisos de copyright y licencia. No hay restricciones adicionales declaradas.
- Métricas del repositorio nulas (0 descargas, 0 likes) y fechas de creación y actualización con un día de diferencia, lo que sugiere un experimento puntual sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_128_H_32_TASK_tool_hang_ID_146945
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Artículo de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
