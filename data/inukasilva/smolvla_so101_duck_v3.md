# InukaSilva/smolvla_so101_duck_v3

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, diseñado para control robótico a partir de instrucciones en lenguaje natural y observaciones visuales. Su arquitectura combina un modelo de lenguaje y visión preentrenado (SmolVLM) con un "action expert" entrenado mediante flow matching, lo que permite generar secuencias de acciones directamente desde imágenes y texto. Con aproximadamente 450 millones de parámetros, está pensado para ejecutarse en hardware de consumo, a diferencia de otros VLA de gran tamaño como OpenVLA (7B) o RT-2 (55B).

Este repositorio concreto, `InukaSilva/smolvla_so101_duck_v3`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado con LeRobot. El ajuste se ha llevado a cabo sobre un dataset propio de 50 episodios (22.239 frames a 30 FPS) que recoge la tarea "pick up the duck and place it in the hole" (recoger el pato y colocarlo en el agujero), ejecutada por un robot tipo `so_follower` con dos cámaras. El resultado es una política especializada en esa tarea concreta, lista para ser desplegada en el mismo tipo de robot.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de bajo coste para una tarea específica, siguiendo el ecosistema LeRobot. Al estar licenciado bajo Apache 2.0 y basarse en un modelo abierto, permite a desarrolladores e investigadores reproducir el proceso y adaptarlo a otras tareas robóticas sin necesidad de infraestructura de alto presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM con action expert de flow matching |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo denso de tipo transformer que integra un VLM preentrenado (SmolVLM) como codificador de visión y lenguaje, junto con un "action expert" que predice acciones mediante flow matching. Esta combinación permite que el modelo reciba múltiples imágenes y una instrucción textual, y genere un fragmento de acciones (action chunk) para el robot. El modelo base `lerobot/smolvla_base` ya fue preentrenado con datos multimodales a gran escala, y este repositorio aplica un fine-tuning supervisado sobre un dataset específico.

El entrenamiento de este fine-tuning se realizó con LeRobot versión 0.6.1, durante 20.000 pasos, con un batch size de 8, optimizador AdamW, tasa de aprendizaje de 0.0001 y semilla 1000. El dataset de entrenamiento contiene 50 episodios, 22.239 frames a 30 FPS, con dos cámaras (`wrist` y `side`). Las observaciones de entrada incluyen el estado del robot (6 dimensiones) y hasta tres imágenes de 256x256 píxeles más una imagen de 480x640. La salida es una acción de 6 dimensiones. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control robótico de 6 grados de libertad a partir de observaciones visuales y del estado del robot.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación (en este caso, "pick up the duck and place it in the hole").
- Percepción multi-cámara: acepta hasta tres cámaras de 256x256 y una cámara adicional de 480x640.
- Generación de secuencias de acciones (action chunks) mediante flow matching.
- Despliegue en tiempo real sobre robots tipo `so_follower` usando LeRobot.
- No incluye capacidades de chat, generación de texto libre, tool calling ni razonamiento general; es un modelo puramente orientado a control robótico.

## Casos de uso

- Manipulación pick-and-place en entornos controlados: el modelo está entrenado para recoger un objeto (pato) y colocarlo en una ubicación objetivo (agujero), lo que lo hace adecuado para tareas repetitivas de clasificación o ensamblaje en líneas de producción sencillas.
- Aprendizaje por imitación para robots de bajo coste: al ser un modelo de 450 M de parámetros, puede ejecutarse en GPUs de consumo, lo que facilita la experimentación en laboratorios académicos o pequeñas empresas sin infraestructura dedicada.
- Prototipado rápido de políticas robóticas: el flujo de entrenamiento con LeRobot permite generar una política funcional en pocas horas con un dataset pequeño (50 episodios), ideal para validar conceptos antes de escalar.
- Investigación en VLA y transferencia de tareas: sirve como punto de partida para estudiar cómo se comportan los modelos compactos frente a variaciones de iluminación, posición de objetos o distractores, dado que el modelo base ya incorpora conocimiento multimodal.
- Automatización de tareas educativas o de demostración: puede usarse en entornos docentes para enseñar robótica y aprendizaje por refuerzo, ya que el coste de despliegue es bajo y el código es abierto.
- Benchmarking de algoritmos de imitación: al estar disponible con un dataset asociado, permite comparar el rendimiento de diferentes configuraciones de entrenamiento (número de pasos, batch, etc.) sobre una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). El paper original de SmolVLA (arXiv:2506.01844) reporta métricas en tareas de manipulación, pero no se aplican directamente a este fine-tuning específico.

## Requisitos de hardware

- VRAM estimada: con 450 M de parámetros, el modelo en precisión fp32 ocupa aproximadamente 1,8 GB; en fp16 o bf16, alrededor de 0,9 GB. Esto permite inferencia en GPUs con 4 GB o menos de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente. También es viable en hardware de gama baja como una GTX 1650 o incluso en CPU para inferencia lenta.
- Despliegue: el modelo se integra con LeRobot, que utiliza PyTorch. Se puede ejecutar mediante `lerobot-rollout` para control en tiempo real. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se proporcionan datos concretos, pero al tratarse de un modelo compacto, la inferencia debería ser del orden de decenas de milisegundos por paso en una GPU moderna, suficiente para control a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450 M | No disponible | Apache 2.0 | Control robótico específico (pick-and-place) |
| OpenVLA | 7 B | No disponible | Apache 2.0 | Control robótico generalista |
| RT-2 (Google) | 55 B | No disponible | Propietaria | Control robótico generalista |
| π0 (Physical Intelligence) | 3,3 B | No disponible | Propietaria | Manipulación robótica |

SmolVLA destaca por su tamaño reducido frente a OpenVLA y RT-2, lo que lo hace mucho más accesible para hardware de consumo. Sin embargo, este fine-tuning concreto está limitado a una única tarea, mientras que los modelos generalistas pretenden cubrir un espectro más amplio de comportamientos. No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea ("pick up the duck and place it in the hole") y no generalizará a otras tareas sin un nuevo fine-tuning.
- Dataset pequeño: 50 episodios pueden no capturar toda la variabilidad del entorno (cambios de iluminación, posiciones de objetos, etc.), lo que aumenta el riesgo de sobreajuste.
- Sin evaluación publicada: no hay métricas de éxito en el robot real, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación de acciones: como todo modelo generativo, puede producir acciones incoherentes ante entradas fuera de la distribución de entrenamiento.
- Dependencia del hardware: aunque es ligero, requiere el robot `so_follower` y las cámaras específicas para funcionar correctamente; el cambio de cámara o de disposición puede degradar el rendimiento.
- Sesgos del modelo base: al derivar de SmolVLM, puede heredar sesgos visuales o lingüísticos presentes en sus datos de preentrenamiento, aunque su impacto en tareas robóticas es limitado.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento (también Apache 2.0) no incluya datos con derechos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InukaSilva/smolvla_so101_duck_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/InukaSilva/so101_duck_v3_20260814_150442
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio del proyecto So101_VLA: https://github.com/KyrosTEC/So101_VLA
- Modelo base: https://huggingface.co/lerobot/smolvla_base
