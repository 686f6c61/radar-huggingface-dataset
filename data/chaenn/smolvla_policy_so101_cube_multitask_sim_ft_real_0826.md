# Chaenn/smolvla_policy_so101_cube_multitask_sim_ft_real_0826

## Resumen

Este modelo es una política de robótica basada en SmolVLA, un vision-language-action model (VLA) compacto desarrollado por Hugging Face. Ha sido fine-tuneado por Chaenn con la librería LeRobot para controlar un brazo robótico SO-101 en una tarea de pick-and-place de cubos, combinando datos de simulación y del mundo real. El modelo parte del checkpoint `lerobot/smolvla_base` y se ha entrenado sobre el dataset `Chaenn/so101_cube_multitask_hil_0724_merged_fixed`.

SmolVLA está diseñado para ser desplegado en hardware de consumo, lo que lo hace relevante para laboratorios de robótica e investigación con presupuesto limitado. Con 450 millones de parámetros, este modelo es una de las opciones más ligeras dentro de la categoría de VLA, y su licencia Apache-2.0 permite uso comercial sin restricciones. La ficha no incluye datos sobre el contexto de entrada, el número de tokens de entrenamiento ni los idiomas soportados, por lo que estos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de arquitectura transformer que combina vision encoders, un modelo de lenguaje y un "action expert" que genera acciones de control del robot. El modelo toma como entrada múltiples vistas de cámara, el estado sensorimotor actual del robot y una instrucción en lenguaje natural, todo codificado en características contextuales que condicionan la generación de acciones. Este checkpoint concreto es un fine-tune del `lerobot/smolvla_base` realizado con LeRobot sobre un dataset de demostraciones de pick-and-place de cubos con el brazo SO-101. No se ha publicado información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO; la model card solo indica que se usó el dataset `Chaenn/so101_cube_multitask_hil_0724_merged_fixed`.

## Capacidades

- Control robótico de pick-and-place: el modelo genera comandos de articulación para el brazo SO-101 a partir de observaciones visuales y de estado.
- Visión multimodal: procesa varias vistas de cámara simultáneamente (el modelo base SmolVLA soporta hasta dos cámaras).
- Instrucción en lenguaje natural: condiciona la política mediante comandos textuales que describen la tarea.
- Fine-tuning para sim-to-real: el nombre del checkpoint indica entrenamiento mixto con simulacion y datos reales, lo que sugiere transferencia de la política de un entorno simulado a un robot físico.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación e inferencia de LeRobot, lo que facilita la reproducción y el despliegue.

## Casos de uso

- **Manipulación de objetos en laboratorio**: el modelo puede controlar un brazo SO-101 para coger y colocar cubos en posiciones definidas, útil en experimentos de robótica de bajo coste.
- **Investigación en VLA de bajo coste**: al ser un modelo de 450M parámetros y licencia abierta, sirve como base para estudiar el comportamiento de VLA compactos en tareas de manipulación sin necesidad de hardware de gama alta.
- **Transferencia sim-to-real**: dado el nombre del checkpoint (sim_ft_real), el modelo se puede usar para evaluar la transferencia de políticas entrenadas en simulación al mundo real, un campo activo en robótica.
- **Generación de datos para otros modelos**: se puede usar como política de referencia para generar demostraciones adicionales en el SO-101, que luego sirvan para entrenar otros modelos.
- **Evaluación de generalización de instrucciones**: al aceptar instrucciones de lenguaje natural, permite experimentar con la generalización de políticas a comandos variados (p. ej., "coge el cubo rojo" vs "coge el cubo azul"), aunque el dataset de entrenamiento parece centrado en cubos de un color.
- **Prototipado rápido en LeRobot**: se integra directamente con el ecosistema LeRobot, por lo que puede desplegarse en minutos en un brazo SO-101 para validar un escenario concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de éxito en tareas de pick-and-place ni comparativas con otros modelos en la model card. Se recomienda consultar el repositorio del autor para posibles resultados posteriores.

## Requisitos de hardware

- **VRAM estimada**: con 450M parámetros en precisión fp32, el modelo ocupa aproximadamente 1.8 GB en memoria. Con cuantización (no publicada en este repo) podría reducirse a menos de 1 GB. El tamaño del repo es de 0.9 GB, lo que sugiere pesos en fp32 o bf16.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia (p. ej., RTX 3060, RTX 4060). Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070) o superior.
- **Consumer GPU**: sí, cabe en GPUs de consumo típicas gracias a su tamaño compacto.
- **Opciones de despliegue**: LeRobot soporta inferencia con PyTorch en CUDA. No se documenta compatibilidad con vLLM, llama.cpp u Ollama, ya que el modelo no es de generación de texto puro sino de control robótico.
- **Latencia y throughput**: no disponible en la información proporcionada; dependerá del hardware y del número de cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea principal |
|---|---|---|---|---|
| Chaenn/smolvla_policy_so101_cube_multitask_sim_ft_real_0826 (este modelo) | 450M | no disponible | Apache-2.0 | Pick-and-place de cubos con SO-101 |
| Chaenn/smolvla_policy_so101_cube_multitask_real_0820 | 450M | no disponible | Apache-2.0 | Pick-and-place de cubos con SO-101 (solo datos reales) |
| Chaenn/smolvla_policy_so101_cube_multitask_0716 | 450M | no disponible | Apache-2.0 | Pick-and-place de cubos con SO-101 (versión anterior) |
| lerobot/smolvla_base | 450M | no disponible | Apache-2.0 | Modelo base generalista para tareas robóticas |

Los tres modelos del autor Chaenn son variantes del mismo fine-tune sobre SmolVLA para la misma tarea, diferenciándose en la combinación de datos de simulación y reales. La versión `sim_ft_real_0826` parece ser la más reciente y la única que incluye explícitamente datos de simulación en el nombre. No se dispone de comparaciones de rendimiento entre ellos.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo está fine-tuneado para una tarea muy concreta (pick-and-place de cubos con SO-101). No generalizará a otras tareas de manipulación sin reentrenamiento.
- **Datos de entrenamiento limitados**: el dataset está centrado en cubos (posiblemente de un color concreto), por lo que la generalización a otros objetos o colores puede ser pobre. Un blog de la comunidad reporta que un modelo similar entrenado solo con cubos rojos fallaba en cubos de otros colores (1/3 de éxito vs 5/5 con el cubo rojo).
- **Sin benchmarks publicados**: no hay métricas de rendimiento disponibles en la model card, lo que dificulta evaluar su calidad de forma objetiva.
- **Sesgos de simulación**: si el entrenamiento mezcla datos de simulación y reales, puede haber discrepancias de dominio que afecten al comportamiento en el mundo real.
- **Sin cuantizaciones**: no se ofrecen pesos cuantizados, lo que limita su despliegue en dispositivos muy limitados.
- **Dependencia del ecosistema LeRobot**: requiere el stack de LeRobot para cargar y ejecutar el modelo, lo que puede ser una barrera si se usa fuera de ese entorno.
- **Descargas y comunidad**: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_sim_ft_real_0826)
- [Paper de SmolVLA (arXiv 2506.01844)](https://huggingface.co/papers/2506.01844)
- [Documentación de SmolVLA en LeRobot](https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Blog de fine-tuning de SmolVLA para SO-101](https://ggando.com/blog/smolvla-so101/)
- [Repositorio de sim-to-real para SO-101](https://github.com/Luoyadan/lerobot_so101-sim2real)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Otro checkpoint del autor: real_0820](https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_real_0820)
- [Otro checkpoint del autor: 0716](https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_0716)
