# BC2605/so101-smolvla-rack-to-cup-box-anticoll

## Resumen

El modelo `BC2605/so101-smolvla-rack-to-cup-box-anticoll` es un policy de robótica basado en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face. Este fine-tune concreto, creado por BC2605 (Bruce Chen), está entrenado para controlar un brazo robótico SO-101 en tareas de pick-and-place, específicamente para mover objetos de una estantería a una taza evitando colisiones. El modelo se ha ajustado sobre el dataset `BC2605/rack-to-cup-3-grids-box-anticoll` utilizando la librería LeRobot.

SmolVLA destaca por su eficiencia: con solo 450 millones de parámetros, ofrece un rendimiento competitivo en tareas de manipulación robótica a un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este modelo es relevante porque democratiza el uso de VLA en robótica, ya que puede ejecutarse en GPUs de gama media y fine-tunearse con pocos datos, como demuestra el autor en su blog con una RTX 3090.

El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y académico. Aunque está especializado en una tarea concreta, sirve como base para transferir el aprendizaje a otras tareas de manipulación mediante fine-tuning adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en SmolVLA |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, que a su vez es un VLA compacto basado en un backbone de visión-lenguaje (SmolVLM). La arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores directamente a partir de observaciones visuales y, potencialmente, instrucciones en lenguaje natural. El entrenamiento se realizó con LeRobot, la librería de Hugging Face para robótica, sobre el dataset `BC2605/rack-to-cup-3-grids-box-anticoll`, que contiene demostraciones teleoperadas de la tarea de pick-and-place con anti-colisión.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se publica como un checkpoint de política entrenado con aprendizaje por imitación, siguiendo el flujo estándar de LeRobot. La innovación principal reside en su tamaño compacto, que permite fine-tuning y despliegue en hardware de consumo, algo poco común en VLA de gran escala.

## Capacidades

- Control robótico de brazo SO-101 (y SO-100) para tareas de manipulación, específicamente pick-and-place de objetos entre posiciones definidas (rack a taza).
- Interpretación de observaciones visuales para generar acciones motoras de forma autónoma.
- Capacidad de evitar colisiones durante la ejecución de la tarea, como indica el sufijo "anticoll" en el nombre.
- Posibilidad de entender instrucciones en lenguaje natural, según fuentes externas (blog de ggando.com), aunque no está confirmado en la model card oficial.
- Especialización en una tarea concreta, pero con capacidad de fine-tuning para otras tareas de manipulación con pocos datos.
- No incluye capacidades de tool calling, agentes conversacionales ni generación de texto general; su salida son acciones robóticas.

## Casos de uso

- Automatización de pick-and-place en laboratorios: el modelo puede mover viales, placas o componentes de una estantería a una taza o contenedor, reduciendo la intervención humana en entornos de investigación.
- Clasificación de objetos en líneas de producción: con un brazo SO-101, el modelo puede clasificar piezas según su posición visual, aunque requiere adaptación del dataset para cada tipo de objeto.
- Robótica educativa: al ser compacto y ejecutable en GPUs de consumo, es ideal para enseñar aprendizaje por imitación y VLA en cursos de robótica, como demuestra el repositorio de RajatDandekar.
- Investigación en manipulación con anti-colisión: el modelo sirve como punto de partida para estudiar estrategias de evitación de obstáculos en tareas de precisión.
- Fine-tuning para nuevas tareas: dado su tamaño reducido, se puede ajustar con pocas demostraciones para tareas como apilar bloques o insertar objetos, como se muestra en el blog de ggando.com.
- Despliegue en robots de bajo coste: el SO-101 es un brazo asequible, y este modelo permite llevar VLA a entornos con presupuesto limitado, como talleres o pequeñas empresas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (como tasa de éxito en tareas) en la model card ni en las fuentes consultadas. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al ser un modelo de 450M, se estima que puede caber en 8-12 GB de VRAM en FP16, dependiendo de la resolución de imagen y el tamaño de lote.
- GPU recomendadas: según el blog de ggando.com, se puede fine-tunear en una RTX 3090 (24 GB). Para inferencia, una RTX 3060 o superior sería suficiente.
- Compatibilidad con consumer GPU: sí, es uno de los objetivos del modelo SmolVLA.
- Opciones de despliegue: LeRobot (oficial), y potencialmente vLLM u otros frameworks, aunque no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA como OpenVLA, RT-2 o π0. El modelo es un fine-tune de SmolVLA, por lo que su rendimiento depende de la tarea específica. Se puede comparar con otros fine-tunes de SmolVLA del mismo autor, como `BC2605/so101-smolvla-block-on-mat-in-cup`, que resuelve una tarea diferente (colocar un bloque sobre una alfombrilla). Sin embargo, no hay métricas públicas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea concreta (rack-to-cup con anti-colisión); no funcionará correctamente en otras tareas sin fine-tuning adicional.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de las demostraciones del dataset `BC2605/rack-to-cup-3-grids-box-anticoll`, que no está documentado en detalle.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de acción robótica, no genera texto, pero podría producir acciones erróneas si las observaciones visuales son atípicas.
- Requiere entorno robótico físico o simulado: no es un modelo de propósito general; necesita un brazo SO-101 y un entorno de ejecución.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base SmolVLA tiene su propia licencia (también Apache-2.0 según la model card), por lo que no hay restricciones adicionales.
- Sin garantías de seguridad: en aplicaciones reales, se deben implementar mecanismos de seguridad (parada de emergencia, límites de velocidad) ya que el modelo no incluye validación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BC2605/so101-smolvla-rack-to-cup-box-anticoll
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Perfil del autor (BC2605): https://huggingface.co/BC2605
- Blog de fine-tuning con SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio de ejemplo con SmolVLA y SO-101: https://github.com/RajatDandekar/SmolVLA_MRL2Bootcamp
- Documentación de NVIDIA sobre sim-to-real con SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
