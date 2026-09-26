# Dayanh/act_so101_cube_v2

## Resumen

`Dayanh/act_so101_cube_v2` es una política de control robótico basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y se distribuye como un checkpoint de política listo para ejecutarse sobre un brazo SO-100/SO-101.

No se trata de un modelo de lenguaje: es una red neuronal que mapea observaciones visuales y de estado del robot a comandos de actuador. Tiene 51.668.662 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras, aptas para inferencia en tiempo real incluso en hardware de consumo.

Su relevancia radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas de imitación. El modelo fue entrenado sobre el dataset `Dayanh/so101_cube_to_bowl_v2`, orientado a una tarea concreta de manipulación (mover un cubo a un cuenco), y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE para Action Chunking (ACT), política de imitación con backbone visual |
| Parametros totales | 51.668.662 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no procesa secuencias de texto; predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no aplica (política de control robótico, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un encoder visual, un transformer encoder-decoder y un CVAE (autoencoder variacional condicional). En lugar de predecir una única acción por paso, el modelo genera un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la consistencia temporal de las trayectorias. El CVAE captura la multimodalidad de las demostraciones humanas, evitando que el modelo promedie comportamientos incompatibles. Esta política se entrenó con datos de teleoperación del dataset `Dayanh/so101_cube_to_bowl_v2`, ligado a la tarea de transferir un cubo a un cuenco.

El entrenamiento se ha realizado con LeRobot mediante el comando `lerobot-train --policy.type=act`, que gestiona la carga del dataset, el entrenamiento de la política y la publicación del checkpoint en el Hub. La información proporcionada no detalla el número exacto de tokens, episodios de demostración ni si se aplicaron fases de RLHF o DPO (técnicas no habituales en ACT, que es un método puramente supervisado de imitación). Tampoco se especifican hiperparámetros como el tamaño del chunk, el número de pasos de acción o la resolución de las observaciones.

## Capacidades

- Control robótico por imitación: genera secuencias de comandos de actuador (chunks) para un brazo manipulador SO-100/SO-101.
- Manipulación visual: procesa observaciones de cámara junto con el estado del robot para producir acciones.
- Ejecución de tareas específicas: entrenado para una tarea concreta de pick-and-place (cubo a cuenco).
- Inferencia en tiempo real: tamaño reducido que permite ejecución en GPU de consumo o CPU.
- Integración con LeRobot: compatible con `lerobot-record` para evaluación e inferencia, y con `lerobot-train` para reentrenamiento o fine-tuning.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Manipulación pick-and-place con SO-101: replicar la tarea de mover un cubo a un cuenco sobre un brazo real, usando `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Punto de partida para fine-tuning: reentrenar la política con un dataset propio de teleoperación para una tarea nueva manteniendo `--policy.type=act`.
- Evaluación de políticas de imitación: usar el checkpoint como referencia base en experimentos comparativos dentro del ecosistema LeRobot.
- Investigación en aprendizaje por imitación: estudiar el comportamiento de ACT (chunking, CVAE) en tareas de manipulación de baja dimensión.
- Docencia y prototipado en robótica: desplegar una política funcional en laboratorios con hardware de bajo coste tipo SO-100.
- Validación de pipelines de datos: comprobar que un dataset de demostraciones (por ejemplo, `dayanh/so101_cube_to_bowl_v2`) produce políticas funcionales tras el entrenamiento.
- Automatización de tareas repetitivas de laboratorio: integrar el modelo en flujos donde un brazo debe recoger y depositar objetos de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: con 51,7 M de parámetros, los pesos ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16; sumando el backbone visual y las activaciones, la inferencia cabe holgadamente en 1-2 GB de VRAM (estimación derivada del tamaño del modelo, no dato oficial).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; también puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en equipos integrados con memoria compartida.
- Opciones de despliegue: inferencia nativa con LeRobot y PyTorch (`lerobot-record`, `--policy.path`); vLLM, TGI u Ollama no aplican porque están orientados a modelos de lenguaje, no a políticas de control.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Tipo de política | Salida | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (`Dayanh/act_so101_cube_v2`) | Transformer con CVAE (chunking) | Chunks de acciones | 51.668.662 | apache-2.0 | Hugging Face Hub |
| Diffusion Policy | Política generativa por difusión | Trayectorias de acciones | no disponible | no disponible | Implementación en LeRobot |
| VQ-BeT | Transformer con codebook discreto | Chunks de acciones | no disponible | no disponible | Implementación en LeRobot |
| SmolVLA | VLA (visión-lenguaje-acción) | Acciones condicionadas por lenguaje | no disponible | no disponible | Hugging Face Hub |

La información proporcionada no incluye cifras de rendimiento ni parámetros de los modelos comparados, por lo que la comparación se limita a categoría, tipo de salida y licencia.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado específicamente para la tarea del dataset `so101_cube_to_bowl_v2`; su generalización a otras tareas o entornos no está garantizada.
- Ausencia de benchmarks: no hay métricas publicadas de éxito, robustez o generalización.
- Dependencia del hardware: diseñado para el brazo SO-100/SO-101; su uso con otra cinemática requeriría reentrenamiento.
- Sensibilidad al dominio visual: cambios en iluminación, cámara o disposición de objetos pueden degradar el rendimiento.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural ni razonamiento simbólico.
- Riesgo de sobreajuste: con un único dataset de demostraciones, el modelo puede reproducir sesgos de las trayectorias humanas de teleoperación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de reutilizarlo.
- Repositorio con muy pocas descargas (9) y ningún "like", por lo que no cuenta con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dayanh/act_so101_cube_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Dayanh/so101_cube_to_bowl_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
