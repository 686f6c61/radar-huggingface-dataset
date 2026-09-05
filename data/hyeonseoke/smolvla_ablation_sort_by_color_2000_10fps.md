# HyeonseokE/smolvla_ablation_sort_by_color_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por HyeonseokE como fine-tuning del modelo base `lerobot/smolvla_base`. Está diseñado para tareas de robótica, concretamente para el control de un robot manipulador en la tarea de clasificar bloques por color en platos coincidentes. Con 450 millones de parámetros y un checkpoint de 0.9 GB en formato safetensors, está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación en robótica de bajo coste.

El modelo se entrena con el framework LeRobot y se distribuye bajo licencia Apache 2.0. Consume observaciones de estado y tres imágenes de cámara, y produce acciones de 6 dimensiones para el control del robot. Su arquitectura eficiente permite desplegarlo en entornos de laboratorio o educativos sin necesidad de infraestructura de alto rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina percepción visual, razonamiento lingüístico y generación de acciones. En esta variante, el modelo ha sido fine-tuneado desde `lerobot/smolvla_base` para la tarea específica de ordenar bloques por color. La entrada del modelo consiste en un vector de estado de 6 dimensiones y tres imágenes de 256x256 píxeles procedentes de cámaras (en la model card se indican las cámaras `top` y `left_wrist`, aunque la tabla de inputs muestra tres entradas visuales). La salida es una acción de 6 dimensiones que controla los grados de libertad del robot.

El entrenamiento se realizó con el dataset `HyeonseokE/ablation_sort_by_color_100_10fps`, compuesto por 100 episodios y 74.450 fotogramas a 10 FPS. La configuración de entrenamiento incluye 58.150 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 2000. Se utilizó la versión 0.6.0 de LeRobot. No se especifican innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 6 dimensiones a partir de observaciones de estado y tres imágenes de cámara.
- Aprendizaje por imitación: entrenado mediante demostraciones humanas registradas con LeRobot, puede ejecutar políticas de manipulación.
- Tarea específica: clasificar bloques en platos según su color.
- Multimodalidad: procesa entrada visual y de estado simultáneamente.
- No soporta tool calling, razonamiento simbólico ni generación de texto: es un modelo de acción robótica, no un modelo de lenguaje general.

## Casos de uso

- Clasificación automática de objetos en robótica industrial: el modelo puede controlar un brazo robótico para ordenar piezas por color en bandejas, utilizando las cámaras para percibir la escena y generar las acciones de agarre y colocación.
- Investigación en aprendizaje por imitación: al estar integrado en LeRobot, permite reproducir experimentos de imitación con 100 episodios y evaluar la generalización de políticas en tareas de manipulación.
- Robótica educativa de bajo coste: al ser compacto, puede ejecutarse en GPUs de consumo, facilitando el despliegue en laboratorios universitarios o centros de formación.
- Automatización de tareas de picking y placing: en entornos de almacén, el modelo puede ejecutar políticas de recoger y colocar objetos en ubicaciones predefinidas, reduciendo la intervención humana.
- Benchmarking de políticas VLA: sirve como modelo de referencia para comparar la eficiencia de diferentes arquitecturas de visión-lenguaje-acción en tareas de manipulación robótica.
- Teleoperación asistida: el modelo puede asistir a un operador humano completando la parte repetitiva de una tarea de clasificación, manteniendo la supervisión del usuario.
- Desarrollo de robots domésticos: tareas sencillas de ordenar objetos, como separar la ropa por color, pueden ser entrenadas y desplegadas con este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint pesa 0.9 GB, lo que sugiere que podría caber en GPUs de consumo, pero no hay datos oficiales.
- GPU recomendadas: no disponible.
- Despliegue: mediante LeRobot, usando el comando `lerobot-rollout` con la política especificada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos alternativos. El modelo es un fine-tuning de `lerobot/smolvla_base`, por lo que su comparativa directa sería con ese modelo base, pero no se han proporcionado resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robots reales, por lo que el rendimiento real del modelo es desconocido.
- Entrenado únicamente en 100 episodios de una tarea específica (clasificación por color), lo que limita la generalización a otras tareas o entornos.
- Depende de las cámaras y del estado del robot; cambios en la iluminación, la disposición de los objetos o la presencia de distractores pueden degradar el rendimiento.
- Riesgo de fallos en escenarios fuera de distribución, como nuevos objetos o posiciones no vistas durante el entrenamiento.
- No es un modelo de lenguaje: no soporta tool calling, razonamiento simbólico ni generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el uso cumpla con las condiciones de la licencia.

## Enlaces

- Modelo: https://huggingface.co/HyeonseokE/smolvla_ablation_sort_by_color_2000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation_sort_by_color_100_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Documentación LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
