# sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_3k

## Resumen

Este modelo es un ajuste fino de π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence para la manipulación robótica y la generalización a entornos no vistos. El autor, `sam-guided-vlas`, ha adaptado el modelo base `lerobot/pi05_base` al framework LeRobot, entrenándolo para tareas concretas de apilamiento y manipulación de objetos de cocina. El modelo publica unos 4.143 millones de parámetros en formato safetensors, con un tamaño de repositorio de 9.4 GB, y se distribuye bajo licencia Apache 2.0.

La relevancia del modelo radica en que permite explorar la adaptación de un VLA de última generación, originalmente de Physical Intelligence, dentro del ecosistema LeRobot. Esto facilita el entrenamiento y despliegue de políticas de imitación en robots manipuladores sin depender de código propietario. No se han publicado detalles sobre la longitud de contexto ni resultados de evaluación, por lo que la información disponible se limita a la propia documentación de la tarjeta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en el modelo π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de π₀.₅, un VLA que combina codificadores visuales y de lenguaje para generar acciones de robot. En esta implementación de LeRobot, el modelo consume tres imágenes de 224x224 (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) y un vector de estado de 9 dimensiones, y produce una acción de 7 dimensiones. El entrenamiento se realizó con el framework LeRobot, partiendo del modelo base `lerobot/pi05_base`.

Se utilizó el dataset `sam-guided-vlas/train_1_2_pile__no_mask`, compuesto por 200 episodios y 69.392 fotogramas a 20 FPS, con tareas de manipulación sobre objetos como `basket`, `boxed food`, `cake`, `can`, `hamburger`, `lemon`, `orange`, `spice`, `squash`, `spray`, `soap dispenser`, `jam`, `jar`, `cereal`, `knife block`, `kettle`, `pear`, `potato`, `sweet potato` y `scone`. La configuración de entrenamiento incluye 3.000 pasos, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 5e-05. La innovación técnica destacable es la adopción del modelo π₀.₅ y su adaptación al ecosistema LeRobot, que facilita el entrenamiento y despliegue de políticas de imitación sin necesidad de código propietario.

## Capacidades

- Generación de acciones de robot de 7 dimensiones a partir de observaciones visuales (tres cámaras) y estado del robot.
- Manipulación de objetos en tareas de apilamiento y recogida (cestas, latas, botes, alimentos), entrenado con 200 episodios.
- Inferencia con imágenes de 224x224, compatible con cámaras como `agentview` y dos cámaras `eye-in-hand`.
- Generalización a entornos nuevos como objetivo del modelo π₀.₅ base, aunque no se han verificado resultados para este ajuste.
- No soporta tool calling ni generación de texto; es un modelo puramente robótico.
- Capacidades multilingües: no disponibles; el modelo no está diseñado para procesar lenguaje natural.

## Casos de uso

- Manipulación de objetos en cocinas robóticas: el modelo puede recoger y colocar objetos como latas, botes y alimentos en pilas o cajas, gracias a su entrenamiento en un dataset de objetos de cocina.
- Automatización de procesos de empaquetado: utilizar el modelo en un robot Panda para colocar productos en cajas, con la supervisión de cámaras de visión.
- Investigación en aprendizaje por imitación: sirve como base para comparar políticas de manipulación entrenadas con LeRobot y evaluar la transferencia a nuevos escenarios.
- Robótica de laboratorio: desplegar el modelo en entornos de investigación con brazos robóticos para experimentos de manipulación de objetos variados (limones, patatas, calabacines).
- Simulación y entrenamiento de políticas: usar el modelo con datos simulados para validar comportamientos antes de transferirlo a robots reales, gracias a la integración con LeRobot.
- Educación y prototipado: el modelo puede integrarse en proyectos docentes de robótica, aprovechando la licencia Apache 2.0 y la facilidad de ejecución con `lerobot-rollout`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política todavía.

## Requisitos de hardware

- VRAM estimada: no especificada. A partir del tamaño de los pesos (4.143 millones de parámetros), una estimación razonable para inferencia en precisión de 16 bits sería de 8 a 10 GB de VRAM, dependiendo del overhead. El repositorio ocupa 9.4 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Se requeriría una GPU con al menos 10-12 GB de VRAM para cargar los pesos en 16 bits; para precisión de 32 bits, en torno a 16.6 GB.
- Compatibilidad con GPU de consumo: posible en GPUs de 12 GB o superiores (por ejemplo, RTX 3060 12GB o RTX 4070), aunque no hay confirmación oficial.
- Opciones de despliegue: exclusivamente a través del framework LeRobot, mediante el comando `lerobot-rollout` para ejecutar la política en un robot Panda. No se mencionan integraciones con vLLM, llama.cpp ni otros inference servers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Considerando que se trata de un ajuste fino del modelo base π₀.₅, la comparativa más directa es con `lerobot/pi05_base`. También se puede comparar con otros ajustes del mismo autor, como `train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0`. No se dispone de datos públicos de benchmarks de estos modelos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este ajuste (sam-guided-vlas/...) | 4.143.404.816 | no disponible | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| `sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0` | no disponible | no disponible | no disponible | HuggingFace |

No se conocen otros modelos comparables de la misma categoría con datos verificados.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación; el rendimiento real del modelo en tareas de manipulación no está verificado.
- El entrenamiento se realizó únicamente con 200 episodios del dataset `train_1_2_pile__no_mask`, limitado a objetos de cocina y un robot Panda. La generalización a otros robots o tareas no está garantizada.
- Al ser un modelo de acción directa, las predicciones pueden resultar en movimientos no seguros si no se supervisan adecuadamente. Se requiere un operador humano durante la ejecución.
- No es un modelo de lenguaje: no soporta instrucciones en texto libre ni tool calling.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `lerobot/pi05_base` y del modelo π₀.₅ original, que pueden tener restricciones adicionales.
- El modelo fue entrenado con el framework LeRobot 0.6.0; versiones posteriores pueden requerir ajustes de compatibilidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_3k)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__no_mask)
- [Modelo base `lerobot/pi05_base`](https://huggingface.co/lerobot/pi05_base)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Guía de LeRobot para π0.5](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__no_mask)
- [Perfil de sam-guided-vlas](https://huggingface.co/sam-guided-vlas)
