# sankatmochan/act_lego_pick_v2

## Resumen

El modelo act_lego_pick_v2 es una política de imitación learning basada en Action Chunking with Transformers (ACT), desarrollada por el usuario sankatmochan y entrenada con la librería LeRobot. Está diseñada para controlar un robot seguidor (so_follower) en la tarea de recoger un bloque Lego y colocarlo en una caja, procesando una imagen frontal de 480x640 píxeles y un vector de estado de 6 dimensiones para generar acciones de 6 dimensiones. Con 51,6 millones de parámetros, es un modelo compacto adecuado para inferencia en tiempo real. Fue entrenado con 60 episodios teleoperados (70.328 fotogramas a 30 FPS) durante 100.000 pasos, y se publica bajo licencia Apache 2.0. Su relevancia radica en demostrar la viabilidad de ACT para tareas de manipulación con datasets pequeños, y en servir como ejemplo de política robótica reproducible en el ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de control robótico) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, que combina un codificador visual (ResNet) con un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales. Esto permite una ejecución más suave y robusta, reduciendo la acumulación de errores típica de los métodos de control paso a paso. El entrenamiento se realizó mediante imitación learning a partir de datos teleoperados, con 60 episodios de la tarea "Pick up Lego block and place in case". Se usó el optimizador AdamW con learning rate 1e-5, batch size 8 y 100.000 pasos. No se aplicaron técnicas de RLHF ni DPO, ya que es un método de aprendizaje supervisado. La innovación principal es el action chunking, que permite al modelo generar múltiples acciones por inferencia, mejorando la coordinación y la velocidad de ejecución.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad para el robot so_follower.
- Percepción visual: procesa una imagen frontal de 480x640 píxeles para localizar el bloque Lego y la caja.
- Ejecución de tareas de pick and place: específicamente entrenado para recoger un bloque y colocarlo en una caja.
- No tiene capacidades de lenguaje, tool calling ni agentes, ya que es un modelo de control puro.
- Soporta inferencia en tiempo real gracias a su tamaño reducido.

## Casos de uso

- Automatización de ensamblaje en líneas de producción: el modelo puede integrarse en un robot para realizar tareas repetitivas de colocación de piezas pequeñas, como bloques, en contenedores, reduciendo el tiempo de ciclo.
- Investigación en imitación learning: sirve como punto de partida para estudiar la transferencia de políticas ACT a otras tareas o entornos, gracias a su disponibilidad pública y su entrenamiento con pocos datos.
- Prototipado rápido de robots: al ser entrenado con solo 60 episodios, permite validar conceptos de manipulación sin necesidad de grandes datasets, acelerando el desarrollo de pruebas de concepto.
- Educación en robótica: puede usarse en cursos para demostrar el ciclo completo de entrenamiento y despliegue con LeRobot, desde la teleoperación hasta la inferencia en el robot.
- Integración en sistemas de control de robots colaborativos: el modelo puede ejecutarse en tiempo real para guiar a un robot en tareas de clasificación de objetos, siempre que la tarea sea similar a la entrenada.
- Benchmarking de algoritmos de imitación: al estar disponible públicamente, permite comparar el rendimiento de ACT con otros métodos en la misma tarea, facilitando la evaluación objetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 51,6 millones de parámetros, la inferencia es ligera. Se estima que puede ejecutarse en GPUs con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque no hay datos oficiales.
- Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060) para el batch size usado, aunque no se especifica en la documentación.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en CPU y GPU. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje.
- La latencia estimada es de milisegundos, adecuada para control en tiempo real, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Existen otros modelos ACT en el Hub, como act_lego_pick_v1 del mismo autor o general_lego_act_policy_v2_high_kl de G3ND3K, pero no se han publicado especificaciones detalladas ni resultados de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea específica y un robot concreto (so_follower), por lo que no generaliza a otros robots o tareas sin reentrenamiento.
- Depende de la configuración de cámara y del entorno; cambios de iluminación, posición de objetos o distracciones pueden afectar el rendimiento.
- No se han reportado evaluaciones en el robot real, por lo que su éxito real no está verificado.
- Al ser un modelo de imitación, puede heredar sesgos del operador durante la teleoperación, como movimientos subóptimos o preferencias de agarre.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar el método ACT y LeRobot según la política de atribución.

## Enlaces

- HuggingFace: https://huggingface.co/sankatmochan/act_lego_pick_v2
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/sankatmochan/lego_pick_v2_sept2
