# dompfeiffer/diff_pouring_test

## Resumen

El modelo `dompfeiffer/diff_pouring_test` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Está diseñada para tareas de manipulación robótica, concretamente para verter líquidos (pouring), a partir del dataset `dompfeiffer/diff_pouring_setup_1`. El enfoque de difusión trata el control como un proceso generativo que produce trayectorias de acción suaves y multi-paso, lo que resulta especialmente adecuado para manipulaciones que requieren contacto físico y precisión.

El modelo cuenta con 266.623.358 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 1,1 GB. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Aunque no se especifican idiomas (al ser un modelo de robótica, no procesa lenguaje natural), su relevancia radica en ser un ejemplo práctico de aplicación de modelos generativos de difusión al control de robots, un área en crecimiento dentro de la IA aplicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor control generativo) |
| Parametros totales | 266.623.358 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de acciones) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, tal como se describe en el paper [2303.04137](https://huggingface.co/papers/2303.04137). En lugar de predecir directamente una acción, el modelo genera una secuencia completa de acciones mediante un proceso de difusión denoising, lo que permite producir trayectorias suaves y coherentes en el tiempo. Esta arquitectura es particularmente eficaz en tareas de manipulación que requieren contacto físico, donde las políticas deterministas suelen fallar por la alta dimensionalidad y la multimodalidad de las soluciones.

El entrenamiento se realizó con LeRobot, el framework de Hugging Face para robótica, utilizando el dataset `dompfeiffer/diff_pouring_setup_1`. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se publica como un checkpoint listo para inferencia, con el pipeline de robótica de LeRobot.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico, basadas en observaciones visuales y de estado.
- Manejo de tareas de manipulación con contacto físico, como verter líquidos, gracias a la naturaleza generativa del proceso de difusión.
- Integración nativa con el ecosistema LeRobot: permite entrenamiento, evaluación e inferencia mediante comandos CLI (`lerobot-train`, `lerobot-record`).
- Soporte para robots tipo SO-100 (leader-follower), como se indica en el ejemplo de evaluación.
- No incluye capacidades de lenguaje natural, tool calling, agentes ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de vertido en entornos industriales: el modelo puede controlar un brazo robótico para verter líquidos con precisión, reduciendo el desperdicio y mejorando la consistencia en líneas de producción.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo las políticas de difusión superan a las deterministas en tareas de manipulación complejas.
- Desarrollo de robots domésticos: integración en asistentes robóticos que necesiten realizar tareas como servir bebidas o trasvasar ingredientes en cocinas.
- Benchmarking de algoritmos de control: al estar disponible con licencia Apache 2.0, puede usarse como referencia para comparar nuevas arquitecturas de políticas visuomotoras.
- Educación en robótica con IA: el modelo y su dataset asociado permiten a estudiantes y desarrolladores experimentar con Diffusion Policy sin necesidad de entrenar desde cero.
- Prototipado rápido en laboratorios de robótica: gracias a su tamaño moderado (266M parámetros), puede ejecutarse en GPUs de gama media para validar experimentos de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento como éxito en tareas, precisión de trayectoria ni comparaciones con otras políticas. Se recomienda consultar el paper de Diffusion Policy para conocer el rendimiento general de esta arquitectura en tareas de manipulación, aunque los resultados específicos de este modelo no están documentados.

## Requisitos de hardware

- El modelo tiene 266M parámetros, lo que en FP32 ocupa aproximadamente 1,1 GB (coincide con el tamaño del repo). En FP16 ocuparía unos 0,5 GB.
- Puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque para entrenamiento se recomienda más memoria.
- Para inferencia en tiempo real con robots, se sugiere una GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) para mantener latencias bajas.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en local con `lerobot-record` y puede integrarse con robots físicos.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El campo de políticas visuomotoras basadas en difusión es emergente y no hay modelos equivalentes con datos públicos comparables en el momento de redactar esta ficha. Se recomienda consultar el paper original de Diffusion Policy para ver comparaciones con métodos anteriores (como ACT o Behavior Cloning).

## Limitaciones y advertencias

- Es un modelo especializado en una tarea concreta (vertido de líquidos) y no es generalista: no puede aplicarse a otras tareas de manipulación sin reentrenamiento.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de control, una salida incorrecta podría provocar movimientos no deseados del robot; se requiere supervisión en entornos reales.
- No hay información sobre la robustez del modelo ante cambios en la iluminación, posición de la cámara o variaciones del entorno; el dataset de entrenamiento es específico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el autor no proporciona soporte técnico.
- El modelo no procesa lenguaje natural ni tiene capacidades de razonamiento simbólico; su uso se limita a la generación de acciones motoras.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dompfeiffer/diff_pouring_test)
- [Dataset de entrenamiento](https://huggingface.co/datasets/dompfeiffer/diff_pouring_setup_1)
- [Paper de Diffusion Policy (arXiv:2303.04137)](https://huggingface.co/papers/2303.04137)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
