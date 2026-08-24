# schronn/policy_baseline_protokoll

## Resumen

El modelo `schronn/policy_baseline_protokoll` es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Ha sido entrenado y publicado mediante el framework LeRobot, utilizando el dataset `schronn/pouring_blue_v3_protokoll`, orientado a tareas de vertido de líquidos. Su objetivo es proporcionar una política de manipulación robótica que pueda ejecutarse en hardware de consumo, reduciendo los costes computacionales frente a VLA de mayor tamaño.

El modelo parte de `lerobot/smolvla_base` y se ha ajustado específicamente para la tarea de vertido, lo que lo convierte en una solución práctica para entornos de investigación y prototipado en robótica. Con 450 millones de parámetros y una licencia Apache-2.0, es accesible para uso comercial y académico. La arquitectura SmolVLA combina un codificador de visión, un modelo de lenguaje y un cabezal de acción, permitiendo generar comandos motores a partir de observaciones visuales y lingüísticas.

La relevancia de este modelo radica en su capacidad para democratizar la robótica basada en VLA, ya que puede desplegarse en GPUs de gama media sin necesidad de infraestructura de alto rendimiento. Además, al estar integrado en el ecosistema LeRobot, facilita la reproducción de experimentos y la extensión a otras tareas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal, sin especificación de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra un codificador visual (como SigLIP o similar), un modelo de lenguaje (SmolLM) y un cabezal de predicción de acciones. La arquitectura está diseñada para ser compacta y eficiente, permitiendo inferencia en tiempo real en hardware de consumo. El modelo base `lerobot/smolvla_base` ya ha sido preentrenado en tareas generales de manipulación, y este checkpoint se ha ajustado finamente con el dataset `schronn/pouring_blue_v3_protokoll` mediante el framework LeRobot.

El entrenamiento se realizó siguiendo el pipeline estándar de LeRobot, que incluye la recopilación de demostraciones, el preprocesamiento de observaciones y acciones, y el ajuste supervisado. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal reside en la eficiencia del modelo base, que permite entrenar y desplegar políticas robóticas con recursos limitados.

## Capacidades

- Control robótico de manipulación: genera comandos de articulación (posición, velocidad o torque) a partir de observaciones visuales y, opcionalmente, instrucciones en lenguaje natural.
- Percepción visual: procesa imágenes de cámaras para identificar objetos, recipientes y estados de la tarea.
- Ejecución de tareas de vertido: especializado en la manipulación de líquidos, como verter agua u otros fluidos en recipientes.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de LeRobot, incluyendo robots como SO-100 y otros brazos.
- Inferencia en tiempo real: gracias a su tamaño compacto, puede ejecutarse en GPUs de consumo con baja latencia.
- Multimodalidad: combina visión y lenguaje, aunque no se especifican los idiomas soportados para las instrucciones.

## Casos de uso

- Automatización de laboratorios: el modelo puede controlar un brazo robótico para verter reactivos o muestras líquidas en placas de ensayo, reduciendo la intervención humana y mejorando la repetibilidad.
- Prototipado de investigación en robótica: investigadores pueden utilizar este checkpoint como punto de partida para experimentar con nuevas tareas de manipulación, gracias a su integración con LeRobot y su bajo coste computacional.
- Demostraciones educativas: en cursos de robótica o IA, el modelo permite mostrar el funcionamiento de un VLA en hardware asequible, como una GPU RTX 3060 o superior.
- Desarrollo de asistentes domésticos: aunque la tarea actual es vertido, la arquitectura puede adaptarse a otras tareas de cocina o limpieza, como servir bebidas o dosificar ingredientes.
- Evaluación de políticas robóticas: sirve como baseline para comparar nuevas arquitecturas o métodos de entrenamiento en tareas de manipulación, dado que es un modelo de referencia en el ecosistema LeRobot.
- Sistemas de control adaptativo: al ser un modelo ligero, puede integrarse en sistemas embebidos o robots con computación a bordo limitada, permitiendo decisiones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como éxito en tareas, precisión de acciones o comparativas con otros modelos en el dataset `pouring_blue_v3_protokoll`. Se recomienda consultar el repositorio de LeRobot o el paper de SmolVLA para obtener referencias generales del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo tiene 450M parámetros, se estima que en FP32 requiere ~1.8 GB de VRAM, y en FP16 ~0.9 GB, pero estos valores son orientativos y no confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) debería ser suficiente para inferencia en FP16. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3060, RTX 3070, etc.).
- Compatibilidad con hardware de consumo: sí, el modelo está diseñado para ejecutarse en GPUs de consumo, como se indica en el paper de SmolVLA.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), y potencialmente vLLM o llama.cpp si se convierte a formatos compatibles, aunque no se especifica.
- Latencia y throughput: no disponible. Se espera una latencia inferior a 100 ms en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| schronn/policy_baseline_protokoll | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 2048 | MIT | Hugging Face |
| RT-2 (55B) | 55B | 32K | no disponible | no público |

La comparativa se basa en modelos VLA conocidos, pero no se dispone de datos de rendimiento específicos para este checkpoint. SmolVLA se posiciona como una alternativa ligera frente a modelos como OpenVLA, que requiere más recursos. La licencia Apache-2.0 es más permisiva que la de otros modelos robóticos.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo para detectar sesgos; al ser un modelo de robótica, los sesgos pueden manifestarse en comportamientos no deseados en entornos no vistos.
- Riesgo de alucinación: en tareas de visión-lenguaje-acción, el modelo puede generar acciones incorrectas si las observaciones son ambiguas o fuera de distribución.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un VLA, la entrada suele ser una imagen y una instrucción corta; no está diseñado para razonamiento de largo alcance.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las patentes asociadas.
- Caveat para producción: el modelo está entrenado para una tarea específica (vertido) y puede no generalizar a otras tareas sin un ajuste adicional. Además, la robustez en entornos reales no ha sido validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schronn/policy_baseline_protokoll
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset utilizado: https://huggingface.co/datasets/schronn/pouring_blue_v3_protokoll
