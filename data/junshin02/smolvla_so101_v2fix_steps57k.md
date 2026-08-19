# junshin02/smolvla_so101_v2fix_steps57k

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face, diseñado para control robótico mediante aprendizaje por imitación. Con 450 millones de parámetros, alcanza un rendimiento comparable a modelos de 7 a 10 veces más grandes, lo que permite su despliegue en hardware de consumo. Este repositorio concreto, `junshin02/smolvla_so101_v2fix_steps57k`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario junshin02, especializado en la tarea de recoger un cubo verde y colocarlo en una caja, ejecutada sobre un robot tipo SO-101 con dos cámaras.

El modelo se ha entrenado con el framework LeRobot sobre un dataset propio de 50 episodios y 18 817 fotogramas, durante 57 000 pasos de optimización. Su relevancia radica en demostrar que un VLA pequeño puede adaptarse a una tarea de manipulación específica con un coste computacional reducido, manteniendo la licencia Apache 2.0 y un formato de pesos safetensors compatible con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina entradas visuales de múltiples cámaras, el estado sensorimotor del robot (posición de las articulaciones) y una instrucción en lenguaje natural. Estas señales se codifican en características contextuales que condicionan un "action expert" encargado de generar las acciones de control. El modelo base fue preentrenado por Hugging Face con datos públicos de la comunidad, y este repositorio lo afina para una tarea específica.

El fine-tuning se realizó con el framework LeRobot versión 0.6.0, utilizando el dataset `junshin02/so101_pickplace_v2fix` con 50 episodios y 18 817 fotogramas a 30 FPS. La configuración de entrenamiento incluye 57 000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. Las entradas del modelo son tres imágenes de 256x256 píxeles (cámara frontal, cámara de muñeca y una tercera cámara) junto con un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 grados de libertad para el robot SO-101.
- Ejecución de tareas pick-and-place: entrenado específicamente para recoger un cubo verde y depositarlo en una caja.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas de cámara (frontal, muñeca y adicional) a 256x256 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto ("Pick up the green cube and place it in the box").
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face.
- Eficiencia computacional: al tener solo 450 millones de parámetros, es viable en GPUs de consumo, a diferencia de VLA más grandes.

## Casos de uso

- Automatización de almacenes: el modelo puede controlar un brazo robótico para tareas de recogida y colocación de objetos en cajas, reduciendo el coste de hardware frente a soluciones con modelos de mayor tamaño.
- Líneas de montaje industrial: la capacidad de seguir instrucciones en lenguaje natural permite reprogramar la tarea sin reentrenar desde cero, solo ajustando el texto de la instrucción.
- Robótica educativa: al ser ligero y de código abierto (Apache 2.0), es adecuado para laboratorios universitarios que necesitan experimentar con VLA en hardware asequible.
- Investigación en aprendizaje por imitación: el repositorio sirve como punto de partida para estudiar cómo un modelo pequeño se adapta a tareas específicas con pocos datos (solo 50 episodios).
- Prototipado rápido de soluciones robóticas: los desarrolladores pueden clonar este modelo y fine-tunearlo para otras tareas similares usando LeRobot, acelerando el ciclo de desarrollo.
- Demostraciones de robótica en ferias y eventos: su despliegue en GPU de consumo facilita montar demostraciones en vivo sin infraestructura de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 450 millones de parámetros con pesos en safetensors (0.9 GB), se estima que requiere entre 2 y 4 GB de VRAM en precisión FP32, y menos con cuantización, aunque no se han publicado configuraciones de cuantización específicas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores. Para entrenamiento, se recomienda una GPU con 8 GB o más (por ejemplo, RTX 3070, RTX 4080).
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos de SmolVLA. Modelos como RTX 3060 o RTX 4090 pueden ejecutar inferencia sin problemas.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También puede usarse con otras herramientas que soporten safetensors y el formato de LeRobot.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| junshin02/smolvla_so101_v2fix_steps57k | 450 M | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450 M | no disponible | Base generalista | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7 B | no disponible | Manipulación generalista | MIT | Hugging Face |

La comparativa se basa en datos públicos de los modelos. SmolVLA destaca por su tamaño reducido frente a OpenVLA, que requiere mucho más hardware. No se dispone de benchmarks comparativos directos entre ambos en este repositorio.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente para la tarea "recoger cubo verde y colocarlo en caja" sobre el robot SO-101; no generaliza a otras tareas u objetos sin reentrenamiento.
- Dataset pequeño: solo 50 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Sin evaluación en robot real: la model card no reporta resultados de éxito en el mundo real, por lo que el rendimiento práctico no está verificado.
- Dependencia del hardware específico: las entradas de cámara y el estado del robot deben coincidir exactamente con la configuración de entrenamiento (tres cámaras, 6 grados de libertad).
- Idiomas: no se especifican idiomas soportados; la instrucción de entrenamiento está en inglés, por lo que el modelo podría no responder correctamente a instrucciones en otros idiomas.
- Riesgo de alucinación de acciones: al ser un modelo de control, puede generar acciones incorrectas si las condiciones de entrada difieren del dataset de entrenamiento, sin mecanismo de verificación de seguridad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/junshin02/smolvla_so101_v2fix_steps57k
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/junshin02/so101_pickplace_v2fix
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=junshin02/so101_pickplace_v2fix
