# HyeonseokE/smolvla_ablation2_rank_stack_2_cubes_1000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por el equipo de Hugging Face y presentado en el paper arXiv:2506.01844. Este modelo en concreto es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por HyeonseokE, con el objetivo de controlar un robot manipulador en la tarea de apilar un bloque verde sobre un bloque rojo. El modelo se ha entrenado con el framework LeRobot y el dataset `HyeonseokE/ablation2_rank_stack_2_cubes_10fps`, que contiene 100 episodios y 37.921 fotogramas a 10 FPS.

Con 450.046.176 parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, reduciendo los costes computacionales típicos de los modelos VLA. A diferencia de los grandes modelos de lenguaje, su salida es una acción de robot de 6 dimensiones, por lo que no se trata de un modelo de texto sino de una política robótica. La relevancia de este modelo radica en su capacidad para ser desplegado en robots de bajo coste, facilitando la investigación y la automatización de tareas de manipulación en entornos reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) |
| Parametros totales | 450.046.176 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

Nota: no se incluye la fila de parámetros activos porque el modelo no es de tipo Mixture of Experts.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, un enfoque de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje para generar comandos de acción de robot. A partir de observaciones de estado (`observation.state`, de dimensión 6) y tres imágenes de cámara de 256×256 píxeles, la política predice una acción de 6 dimensiones en el espacio articular (`action`). El modelo se ha fine-tuneado desde el checkpoint preentrenado `lerobot/smolvla_base`, lo que permite aprovechar representaciones visuales y lingüísticas previas.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `HyeonseokE/ablation2_rank_stack_2_cubes_10fps`, compuesto por 100 episodios de demostración y 37.921 fotogramas a 10 FPS. La configuración de entrenamiento incluye 29.600 pasos, tamaño de lote de 64, optimizador AdamW con tasa de aprendizaje de 0.0001 y semilla 1000. No se indica el uso de RLHF ni DPO; se trata de un ajuste fino mediante aprendizaje por imitación. La innovación técnica destacable es la eficiencia: el modelo es lo bastante compacto para ejecutarse en hardware de consumo, como se menciona en el paper original.

## Capacidades

- Generación de acciones de robot de 6 dimensiones a partir de entradas de estado y visión.
- Procesamiento de tres imágenes de cámara simultáneas (identificadas como `camera1`, `camera2` y `camera3`) de 256×256 píxeles.
- Ejecución de la tarea específica para la que fue entrenado: apilar un bloque verde sobre uno rojo.
- Integración nativa con el framework LeRobot para entrenamiento, inferencia y despliegue.
- Soporte de políticas de imitación (imitation learning) basadas en demostraciones humanas o teleoperadas.
- No incluye capacidades de generación de texto, tool calling, agentes conversacionales ni razonamiento multi-step, al tratarse de un modelo de política robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como política de referencia para estudiar el apilado de bloques y comparar algoritmos de entrenamiento en entornos controlados.
- Automatización de tareas de ensamblaje en laboratorio: el modelo controla un brazo robótico para colocar un bloque sobre otro, una tarea que puede extrapolarse a componentes similares en líneas de montaje.
- Educación y demostraciones de robótica: al ser compacto y ejecutable en hardware de consumo, permite demostrar control robótico en aulas o ferias sin necesidad de infraestructura de alto coste.
- Punto de partida para fine-tuning: investigadores pueden ajustar el modelo sobre nuevos datasets de tareas de manipulación partiendo de los pesos de este checkpoint.
- Benchmarking de políticas robóticas: el modelo se puede evaluar en la tarea de apilado para medir el rendimiento de distintas variantes de SmolVLA o de otros enfoques VLA.
- Integración en pipelines de control con LeRobot: gracias a la interfaz `lerobot-rollout`, el modelo puede desplegarse en un robot `so101_follower` para ejecutar la política en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Capacidad en GPU de consumo: no disponible, aunque el paper original describe SmolVLA como apto para hardware de consumo.
- Opciones de despliegue: mediante el framework LeRobot, usando `lerobot-rollout` para ejecutar la política en un robot compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica directamente al ser un modelo de acción, pero puede generar movimientos incorrectos ante entradas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe citar el método original y el framework LeRobot al publicar resultados.
- Caveat importante para producción: no se han proporcionado resultados de evaluación, por lo que el rendimiento real del modelo en tareas fuera de la configuración de entrenamiento no está validado.
- El modelo está entrenado para una tarea y un robot específicos (`so101_follower`), lo que limita su generalización a otros entornos o tareas sin un nuevo fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_rank_stack_2_cubes_1000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_rank_stack_2_cubes_10fps
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
