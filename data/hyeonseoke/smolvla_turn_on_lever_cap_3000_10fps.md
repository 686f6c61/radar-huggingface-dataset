# HyeonseokE/smolvla_turn_on_lever_cap_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por el equipo de Hugging Face, que combina un modelo de lenguaje y visión preentrenado con un "action expert" para control robótico. Este repositorio concreto, `HyeonseokE/smolvla_turn_on_lever_cap_3000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para una tarea específica: accionar una palanca hasta que un indicador de estado se ponga en verde. El modelo está entrenado con el framework LeRobot y el dataset `HyeonseokE/turn_on_lever_cap_10fps`, que contiene 100 episodios a 10 FPS.

La relevancia de este modelo radica en que demuestra cómo un VLA de solo 450 millones de parámetros puede ser ajustado para una tarea robótica concreta y desplegado en hardware de consumo, algo que los VLA tradicionales (como OpenVLA, con 7B parámetros) no permiten fácilmente. Esto abre la puerta a la robótica de bajo coste y a la investigación reproducible en entornos domésticos o de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM preentrenado + action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles (el modelo procesa instrucciones en ingles, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de dos partes principales: un VLM preentrenado (probablemente SmolVLM) que procesa las observaciones visuales y de estado, y un "action expert" que genera las acciones de control. El VLM extrae características de las imágenes y del estado del robot, que condicionan al action expert para producir comandos de acción. Esta arquitectura permite aprovechar el conocimiento visual y lingüístico del VLM sin necesidad de entrenar un modelo completo desde cero.

El fine-tuning se realizó sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `HyeonseokE/turn_on_lever_cap_10fps`, que contiene 100 episodios (20.962 frames) de la tarea "accionar la palanca". La configuración de entrenamiento incluye 16.350 pasos, batch size de 64, optimizador AdamW, learning rate de 0.0001 y seed 3000. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado estándar.

## Capacidades

- Control robótico de precisión: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones de estado y tres cámaras (top, left_wrist y una tercera no especificada).
- Percepción visual multimodal: procesa tres imágenes RGB de 256x256 píxeles para entender la escena.
- Seguimiento de instrucciones en lenguaje natural: la tarea se define mediante una instrucción textual ("Turn the lever on; the status indicator should turn green"), que el modelo interpreta para generar las acciones adecuadas.
- Aprendizaje por imitación: el modelo ha sido entrenado para replicar el comportamiento demostrado en los episodios del dataset.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.
- Eficiencia computacional: al tener solo 450M parámetros, es adecuado para inferencia en tiempo real en hardware de consumo.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales: el modelo puede controlar un robot SO-101 para accionar palancas, interruptores o mandos en líneas de producción, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas, permitiendo comparar estrategias de fine-tuning y recopilación de datos.
- Despliegue en robots de bajo coste: gracias a su tamaño reducido, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o inferiores), lo que facilita la experimentación en laboratorios con presupuesto limitado.
- Fine-tuning para nuevas tareas: el modelo puede ser reentrenado sobre otros datasets de LeRobot para realizar tareas similares, como pulsar botones o girar perillas, usando el mismo procedimiento de entrenamiento.
- Evaluación de políticas de control en simulación: se puede integrar en entornos simulados (por ejemplo, MuJoCo o Isaac Gym) para validar el comportamiento antes de desplegarlo en el robot real.
- Educación y demostraciones: al ser un modelo abierto y ligero, es útil para enseñar conceptos de robótica y aprendizaje por refuerzo en cursos universitarios, con ejemplos prácticos de control visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política concreta.

## Requisitos de hardware

- VRAM estimada: no disponible. Sin embargo, con 450M parámetros, en FP16 el modelo ocupa aproximadamente 0,9 GB, por lo que cabría en GPUs con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050). En FP32 ocuparía ~1,8 GB.
- GPU recomendadas: no se especifican, pero el paper de SmolVLA afirma que puede desplegarse en hardware de consumo. GPUs como RTX 3060, RTX 4060 o superiores serían suficientes.
- Opciones de despliegue: el modelo se usa principalmente con LeRobot, que soporta inferencia en local con PyTorch. También podría convertirse a otros formatos (GGUF, ONNX) para despliegue en CPU, aunque no se documenta.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia en tiempo real (30 FPS o más) en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, se puede comparar estructuralmente con:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyeonseokE/smolvla_turn_on_lever_cap_3000_10fps | 450M | no disponible | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | 450M (estimado) | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 2048 tokens | MIT | Hugging Face |

SmolVLA es significativamente más pequeño que OpenVLA, lo que lo hace más adecuado para despliegue en hardware de consumo, aunque su capacidad de generalización es menor al estar especializado en una tarea concreta.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de accionar una palanca con un robot SO-101 y tres cámaras específicas. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia del hardware: las observaciones de estado y las cámaras deben coincidir exactamente con las utilizadas durante el entrenamiento; cualquier cambio en la configuración del robot o de las cámaras puede degradar el rendimiento.
- Sin evaluación publicada: no hay resultados de éxito en el robot real, por lo que se desconoce su fiabilidad en condiciones reales.
- Riesgo de sobreajuste: con solo 100 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones en la posición de la palanca, iluminación o distracciones.
- Alucinación visual: como cualquier VLM, puede malinterpretar las imágenes y generar acciones incorrectas si la escena difiere de las vistas durante el entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de los componentes.

## Enlaces

- [Hugging Face - HyeonseokE/smolvla_turn_on_lever_cap_3000_10fps](https://huggingface.co/HyeonseokE/smolvla_turn_on_lever_cap_3000_10fps)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Paper SmolVLA (HTML)](https://arxiv.org/html/2506.01844v1)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Dataset HyeonseokE/turn_on_lever_cap_10fps](https://huggingface.co/datasets/HyeonseokE/turn_on_lever_cap_10fps)
- [Repositorio de referencia lerobot_smolvla (GitHub)](https://github.com/zyqdragon/lerobot_smolvla)
