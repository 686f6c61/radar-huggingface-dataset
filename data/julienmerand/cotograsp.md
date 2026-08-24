# JulienMERAND/CoToGrasp

## Resumen

CoToGrasp es un modelo generativo de síntesis de agarres diestros (dexterous grasping) desarrollado por el CEA-List de la Université Paris-Saclay en colaboración con el École Centrale de Lyon, presentado en la 19ª European Conference on Computer Vision (ECCV 2026). El modelo resuelve el problema de generar configuraciones de agarre diversas y estables condicionadas por topologías de contacto específicas, definidas mediante máscaras semánticas de contacto en lugar de configuraciones articulares rígidas. Esta aproximación permite un entrenamiento estrictamente object-agnostic, eliminando la necesidad de datasets anotados por objeto y logrando generalización zero-shot a objetos no vistos en inferencia. La arquitectura combina un CVAE (Conditional Variational Autoencoder) con componentes Transformer, y el modelo se evalúa sobre el dataset DexGraspNet, donde supera a los planificadores guiados por taxonomía existentes. CoToGrasp está publicado bajo licencia CC-BY-4.0 y su código está disponible en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CVAE con Transformers |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (documentación) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

CoToGrasp emplea una arquitectura de CVAE (Conditional Variational Autoencoder) con componentes Transformer, diseñada para aprender el manifold de contacto intrínseco de un gripper dentro de un workspace canónico. El entrenamiento se realiza de forma object-agnostic, es decir, sin anotaciones específicas de objeto, utilizando únicamente máscaras semánticas de contacto como condicionamiento. Esta estrategia evita la dependencia de datasets con anotaciones de objeto y permite que el modelo generalice a objetos no vistos en inferencia sin necesidad de adaptación adicional. El entrenamiento se lleva a cabo sobre el dataset DexGraspNet, que incluye nubes de puntos y URDFs de objetos y robots. Los checkpoints disponibles en el repositorio corresponden a dos configuraciones: allegro_right_goag_dgcnn_types_2_0209 y shadowhand_goag_dgcnn_types_2_0128, lo que indica el uso de redes DGCNN y una clasificación en dos tipos de topologías de contacto.

## Capacidades

- Síntesis de agarres diestros diversos y estables condicionados por topologías de contacto específicas.
- Generalización zero-shot a objetos no vistos durante el entrenamiento.
- Entrenamiento object-agnostic sin necesidad de anotaciones por objeto.
- Soporte para múltiples manos robóticas, incluyendo Allegro y ShadowHand.
- Condicionamiento semántico mediante máscaras de contacto en lugar de configuraciones articulares rígidas.
- Integración con pipelines de código para planificación de agarre en robótica.

## Casos de uso

- Planificación de agarre en entornos industriales: el modelo puede generar configuraciones de agarre para manos diestras sobre objetos desconocidos en líneas de montaje, reduciendo el tiempo de configuración y mejorando la flexibilidad.
- Robótica asistencial: robots con manos diestras pueden utilizar CoToGrasp para manipular objetos cotidianos no vistos, como herramientas o utensilios, sin necesidad de reentrenamiento específico.
- Simulación y entrenamiento de agentes de control: las configuraciones de agarre generadas pueden servir como supervisión para entrenar políticas de control en entornos simulados, facilitando el aprendizaje de habilidades de manipulación.
- Aumento de datasets de agarre: el modelo puede generar nuevos agarres para ampliar datasets existentes, mejorando la diversidad de datos para otros algoritmos.
- Benchmarking de planificadores de agarre: los resultados sobre DexGraspNet proporcionan un punto de referencia para comparar la eficacia de otros métodos de síntesis de agarre.
- Investigación en taxonomías de agarre: permite explorar cómo las topologías de contacto semánticas influyen en la estabilidad y la diversidad de los agarres, contribuyendo al estudio teórico de la manipulación robótica.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper indica que CoToGrasp supera a los planificadores guiados por taxonomía en el dataset DexGraspNet, pero no se proporcionan métricas concretas como tasas de éxito, diversidad o estabilidad.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para CoToGrasp. Al ser un modelo de investigación con código abierto, es probable que se requiera una GPU con suficiente memoria para el entrenamiento y la inferencia, pero no se dispone de valores concretos. Se recomienda consultar el repositorio oficial en GitHub para obtener información detallada sobre el entorno de ejecución.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos de síntesis de agarre en la información proporcionada. El paper menciona que CoToGrasp supera a los planificadores guiados por taxonomía, pero no se enumeran alternativas específicas. Un trabajo relacionado del mismo autor es GOAG (Generative and Object-Agnostic Grasp Planner for Dexterous Robotic Manipulation), que también aborda la planificación de agarre dexterous.

## Limitaciones y advertencias

- La información disponible es limitada: no se conocen los detalles completos de la arquitectura, los parámetros del modelo ni los requisitos de hardware.
- El modelo está diseñado para investigación y no se ha validado en entornos de producción industrial.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se recomienda revisar las condiciones específicas de la licencia.
- El entrenamiento se basa en el dataset DexGraspNet, por lo que el rendimiento puede degradarse en objetos muy diferentes a los del dataset.
- La documentación está en inglés y no se dispone de soporte en español.

## Enlaces

- Hugging Face: https://huggingface.co/JulienMERAND/CoToGrasp
- arXiv: https://arxiv.org/abs/2608.19776
- Project page: https://cea-list.github.io/cotograspweb/
- GitHub: https://github.com/CEA-LIST/CoToGrasp
