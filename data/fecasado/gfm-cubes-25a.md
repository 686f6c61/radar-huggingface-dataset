# fecasado/gfm-cubes-25a

## Resumen

El modelo `fecasado/gfm-cubes-25a` es una política de control robótico entrenada con el framework LeRobot de Hugging Face, utilizando la técnica de *gaze flow matching* (GFM). Está diseñado para resolver una tarea de manipulación concreta: trasladar cubos desde una configuración inicial a una cesta, según el dataset de entrenamiento `fecasado/Ncubes-to-Nbaskets-320x240`. El autor es fecasado, y el modelo se publica bajo licencia Apache 2.0.

Con 75,2 millones de parámetros y un tamaño de repositorio de 0,3 GB, se trata de un modelo compacto pensado para ejecutarse en robots reales o simulados con recursos limitados. Su relevancia radica en que demuestra la aplicación de *flow matching* condicionado por la mirada (gaze) para generar trayectorias de movimiento, una alternativa a los métodos basados en *action chunking with transformers* (ACT) o difusión que está ganando tracción en la comunidad de robótica open source.

La model card proporcionada es la plantilla genérica de LeRobot y no incluye detalles específicos sobre arquitectura interna, datos de entrenamiento o rendimiento. Por tanto, esta ficha se basa únicamente en la información disponible en el repositorio de Hugging Face y en el conocimiento general de los métodos de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaze flow matching (GFM) sobre LeRobot; detalles internos no disponibles |
| Parametros totales | 75.219.418 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no aplica directamente; es un policy de control) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como *gaze flow matching*, un enfoque que combina *flow matching* (una familia de modelos generativos que aprenden a transformar ruido en datos mediante un flujo continuo) con información de mirada (*gaze*) como condicionamiento. En el contexto de LeRobot, esto implica que el modelo recibe observaciones visuales (imágenes de 320x240) y posiblemente estados del robot, y genera acciones de control (posiciones de articulaciones o comandos de efector final) mediante un proceso de muestreo iterativo.

El entrenamiento se realizó con el framework LeRobot, que utiliza PyTorch y gestiona datasets en formato LeRobot. El dataset `fecasado/Ncubes-to-Nbaskets-320x240` contiene episodios de demostración de la tarea de mover cubos a una cesta. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO (que no son habituales en robótica). Tampoco se detallan innovaciones técnicas adicionales más allá del propio método GFM.

## Capacidades

- Control robótico de manipulación: genera comandos de acción para un robot (probablemente un brazo tipo SO-100, según el comando de evaluación en la model card) a partir de observaciones visuales.
- Aprendizaje por imitación: la política se entrena a partir de demostraciones humanas o teleoperadas, por lo que puede replicar la estrategia mostrada en el dataset.
- Generación de trayectorias mediante *flow matching*: produce secuencias de acciones suaves y coherentes, adecuadas para control en tiempo real.
- Condicionamiento por mirada (gaze): el modelo utiliza información de la dirección de la mirada (probablemente del operador o de un sistema de seguimiento ocular) para guiar el movimiento, lo que puede mejorar la precisión en tareas de alcanzar y colocar objetos.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo robots reales y simulados.
- No se han documentado capacidades de lenguaje, visión general (más allá de las imágenes de entrada), tool calling, agentes o razonamiento simbólico.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede controlar un brazo robótico para recoger cubos y colocarlos en una cesta, una tarea típica de *pick-and-place* que sirve como banco de pruebas para algoritmos de aprendizaje por imitación.
- Investigación en *flow matching* aplicado a robótica: sirve como punto de partida para comparar GFM con otros métodos (ACT, difusión) en términos de precisión, suavidad de trayectorias y velocidad de inferencia.
- Desarrollo de sistemas de teleoperación asistida: al condicionar con la mirada, puede integrarse en interfaces donde un operador humano dirige la atención del robot, reduciendo la carga cognitiva en tareas de ensamblaje o clasificación.
- Automatización de tareas repetitivas en líneas de producción: con el dataset adecuado, la política puede adaptarse a tareas de ordenación o empaquetado de piezas pequeñas.
- Evaluación de políticas en simulación: gracias a la integración con LeRobot, se puede desplegar en entornos simulados (por ejemplo, MuJoCo) para validar el comportamiento antes de pasar al hardware real.
- Formación y educación en robótica: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para cursos y talleres donde se estudie el entrenamiento de políticas de control con datos de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto en la tarea, ni comparaciones con otros métodos. Tampoco se proporcionan datos de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo de 75M de parámetros, se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM en precisión FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones en el repo).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) sería suficiente para inferencia. Para entrenamiento, se recomienda al menos 8 GB (RTX 3070, RTX 4070) o una A100 si se quiere escalar.
- Compatibilidad con consumer GPU: sí, dado el tamaño reducido del modelo.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación y despliegue (`lerobot-record`, `lerobot-eval`). También puede exportarse a ONNX o TensorRT para optimización, aunque no se documenta en el repo.
- Latencia y throughput: no disponibles. En general, los modelos de *flow matching* requieren varios pasos de muestreo (típicamente 10-50), lo que puede aumentar la latencia frente a métodos de una sola pasada como ACT.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea. En el ecosistema LeRobot existen políticas como ACT (Action Chunking with Transformers) y Diffusion Policy, pero no se han encontrado datos públicos que comparen este modelo GFM con ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al entrenarse con un dataset específico (cubos a cestas), el modelo puede no generalizar a otras tareas o configuraciones de objetos.
- Riesgo de alucinación: en robótica, el equivalente sería generar acciones inválidas o inestables. No se han reportado casos, pero es un riesgo inherente a los modelos generativos de control.
- Limitaciones de contexto: el modelo procesa imágenes de 320x240; no maneja texto ni instrucciones de alto nivel.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios. No hay restricciones adicionales conocidas.
- Caveat para producción: la model card no incluye información sobre robustez, seguridad ni validación en hardware real. Antes de desplegar en un robot físico, es imprescindible realizar pruebas exhaustivas en simulación y con supervisión humana.
- El modelo se publicó en agosto de 2026 (según la fecha de creación), por lo que es relativamente reciente y puede carecer de madurez en comparación con políticas más establecidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/fecasado/gfm-cubes-25a
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
