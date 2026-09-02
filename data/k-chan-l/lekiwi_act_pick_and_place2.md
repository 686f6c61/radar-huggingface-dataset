# k-chan-l/lekiwi_act_pick_and_place2

## Resumen

El modelo `k-chan-l/lekiwi_act_pick_and_place2` es un policy de aprendizaje por imitación basado en Action Chunking with Transformers (ACT), entrenado con el framework LeRobot de HuggingFace. Está diseñado para controlar un robot móvil LeKiwi, compuesto por un brazo SO-101 montado sobre una base holonómica de tres ruedas, y resuelve una tarea de pick-and-place móvil: recoger un cubo, desplazarse hasta una cesta y depositarlo en ella.

El modelo consume observaciones de estado del robot (9 dimensiones) y dos flujos de imagen (cámara frontal y cámara de muñeca, ambas a 480×640 píxeles) y produce acciones de 9 dimensiones. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en demostrar la viabilidad de ACT para manipulación móvil con bases holonómicas, un escenario más complejo que el pick-and-place estático, y en servir como referencia reproducible dentro del ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.674.761 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo combina un codificador de imágenes (para las cámaras frontal y de muñeca) con un transformador que procesa el estado del robot y genera secuencias de acciones. En este caso, el policy fue entrenado con LeRobot versión 0.6.2 sobre un dataset propio de 50 episodios (74.969 fotogramas a 30 FPS) que recoge la tarea de recoger un cubo, conducir hasta una cesta y colocarlo en ella.

La configuración de entrenamiento incluye 80.000 pasos, tamaño de lote 16, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un pipeline de imitación supervisada. El modelo se publica en formato safetensors y se integra con el ecosistema LeRobot, lo que facilita su carga y ejecución mediante comandos como `lerobot-rollout`.

## Capacidades

- Ejecución de tareas de pick-and-place móvil: recoger un objeto, desplazarse con la base holonómica y depositarlo en un destino.
- Percepción visual multimodal con dos cámaras (frontal y de muñeca) a resolución 480×640.
- Generación de acciones de 9 dimensiones que controlan tanto el brazo como la base móvil.
- Integración nativa con LeRobot: permite cargar el policy y ejecutarlo en el robot LeKiwi mediante la CLI de LeRobot.
- Entrenamiento reproducible: el dataset y la configuración están publicados, lo que permite replicar o continuar el entrenamiento.

## Casos de uso

- Automatización de tareas de logística interna: el modelo puede gestionar la recogida y transporte de piezas pequeñas en almacenes o líneas de montaje, donde un robot móvil con brazo necesita desplazarse entre estaciones.
- Investigación en aprendizaje por imitación para robots móviles: sirve como punto de partida para estudiar la transferencia de políticas ACT de entornos estáticos a entornos con movimiento de la base.
- Desarrollo de prototipos en robótica educativa: al ser un modelo pequeño y con licencia Apache 2.0, puede integrarse en proyectos universitarios o de formación que utilicen LeRobot y hardware LeKiwi.
- Evaluación de algoritmos de control en bases holonómicas: permite probar estrategias de navegación y manipulación combinadas sin necesidad de desarrollar un policy desde cero.
- Benchmarking de frameworks de imitación: al estar publicado con dataset y configuración, puede usarse como referencia para comparar el rendimiento de ACT frente a otros métodos (por ejemplo, Diffusion Policy) en la misma tarea.
- Demostraciones en ferias o eventos de robótica: el modelo puede ejecutarse en tiempo real para mostrar capacidades de manipulación móvil, siempre que se disponga del hardware adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (51,7 M parámetros) y la entrada de imágenes 480×640, se estima que una GPU con al menos 4-6 GB de VRAM sería suficiente para inferencia en tiempo real, aunque no hay datos confirmados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super). También podría ejecutarse en CPU, pero con mayor latencia.
- Compatibilidad con GPU de consumo: sí, el modelo es lo bastante pequeño para caber en GPUs de gama media.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el policy y lo ejecutan en el robot. También es posible cargar los pesos con PyTorch directamente.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoría. El proyecto se presenta como continuación de `so101-act-pick-and-place` (pick-and-place con brazo fijo SO-101), pero no se han publicado especificaciones ni resultados de ese modelo predecesor. En el ecosistema LeRobot existen otros policies entrenados con ACT para tareas de manipulación, pero sin datos públicos comparables en este repositorio.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: la model card indica que no se han proporcionado métricas de éxito, por lo que el rendimiento real del policy es desconocido.
- Dataset limitado: entrenado con solo 50 episodios para una tarea concreta, lo que puede limitar la generalización a otras posiciones de objetos, condiciones de iluminación o variaciones del entorno.
- Dependencia del hardware específico: el policy está entrenado para el robot LeKiwi con dos cámaras concretas; cualquier cambio en la configuración de sensores o en la cinemática del robot puede degradar el rendimiento.
- Sin soporte de idiomas ni procesamiento de lenguaje: al ser un modelo de robótica, no es aplicable a tareas de texto o conversación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero es responsabilidad del usuario verificar que el hardware y el software asociados (LeRobot, controladores del robot) cumplan con sus propias licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/k-chan-l/lekiwi_act_pick_and_place2
- Dataset de entrenamiento: https://huggingface.co/datasets/k-chan-l/lekiwi_pick_and_place2
- Repositorio GitHub del proyecto: https://github.com/k-chan-l/lekiwi-act-mobile-pick-and-place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
