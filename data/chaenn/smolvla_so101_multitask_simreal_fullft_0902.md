# Chaenn/smolvla_so101_multitask_simreal_fullft_0902

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por el equipo de LeRobot de Hugging Face, que permite controlar robots manipuladores a partir de instrucciones visuales y textuales. Este checkpoint concreto, `Chaenn/smolvla_so101_multitask_simreal_fullft_0902`, es un ajuste fino (full fine-tuning) del modelo base `lerobot/smolvla_base` sobre el dataset `Chaenn/so101_cube_place_simreal_0902_670`, que combina datos simulados y reales para la tarea de colocación de cubos con el robot SO-101. El modelo tiene 450 millones de parámetros y está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

La relevancia de este modelo radica en su capacidad para ejecutar políticas robóticas multitarea en hardware de consumo, reduciendo los costes computacionales frente a modelos VLA más grandes. Al estar integrado con el ecosistema LeRobot, permite entrenar, evaluar y desplegar políticas de forma reproducible. Este checkpoint específico, aunque reciente y sin descargas registradas, representa un ejemplo de ajuste fino sim-to-real para manipulación robótica, un área de gran interés en la comunidad de robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer multimodal (SmolVLM) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se basa en la arquitectura SmolVLM, un modelo multimodal que procesa imágenes y texto para generar acciones de control. El modelo combina un codificador visual, un modelo de lenguaje y una cabeza de acción que produce comandos de articulación para el robot. En este checkpoint, se ha realizado un ajuste fino completo (full fine-tuning) sobre el modelo base `lerobot/smolvla_base` utilizando el dataset `Chaenn/so101_cube_place_simreal_0902_670`, que contiene demostraciones de colocación de cubos tanto en simulación como en el robot real SO-101. El entrenamiento se llevó a cabo con la librería LeRobot, que implementa el pipeline de aprendizaje por imitación. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO; la información disponible solo indica que es un ajuste fino supervisado.

## Capacidades

- Control robótico de manipulación: genera comandos de posición y orientación para los actuadores del robot SO-101 a partir de observaciones visuales y de estado.
- Tareas de pick-and-place: especializado en la colocación de cubos, con soporte para múltiples variantes de la tarea (multitask).
- Integración sim-to-real: entrenado con datos simulados y reales, lo que mejora la transferencia a entornos físicos.
- Ejecución en tiempo real: al ser un modelo compacto, puede operar con baja latencia en hardware de consumo.
- Compatibilidad con LeRobot: se puede cargar y ejecutar directamente con las herramientas de LeRobot para inferencia y evaluación.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe; el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo robótico SO-101 para tareas repetitivas de colocación de piezas, reduciendo el coste de integración frente a soluciones propietarias.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia sim-to-real y el ajuste fino de políticas VLA en entornos controlados.
- Prototipado rápido de robots educativos: al ejecutarse en GPUs de consumo, permite a laboratorios y universidades desplegar comportamientos robóticos sin infraestructura de alto coste.
- Evaluación de políticas multitarea: el checkpoint puede utilizarse para comparar estrategias de entrenamiento (full fine-tuning vs. LoRA) en tareas de manipulación.
- Desarrollo de sistemas de teleoperación asistida: combinado con LeRobot, puede generar acciones autónomas a partir de demostraciones humanas, facilitando la programación por demostración.
- Benchmarking de modelos VLA compactos: al ser de código abierto y con tamaño reducido, es útil para medir el rendimiento de modelos pequeños frente a alternativas más grandes en tareas robóticas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El paper de SmolVLA (arXiv:2506.01844) reporta métricas generales del modelo base, pero no se dispone de datos desglosados para este ajuste fino concreto. No se incluyen cifras para evitar inventar resultados.

## Requisitos de hardware

- VRAM estimada: con 450 M de parámetros, el modelo en precisión FP32 ocupa aproximadamente 1,8 GB; en FP16 o BF16, alrededor de 0,9 GB. La inferencia puede caber en GPUs con 4 GB o más, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4090, o GPUs de datacenter como A10 o A100. El modelo está diseñado para hardware de consumo.
- Despliegue: compatible con LeRobot, que utiliza PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de generación de texto genérica.
- Latencia y throughput: no disponibles; dependerán de la GPU y del bucle de control del robot.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos VLA en la información proporcionada. Se puede mencionar que SmolVLA compite con modelos como OpenVLA (7B) o RT-2 (55B), pero con un tamaño mucho menor (450 M), lo que reduce costes y requisitos de hardware. Sin embargo, no hay datos de rendimiento comparativo en este checkpoint.

## Limitaciones y advertencias

- Sesgos y generalización: al estar entrenado en una tarea específica (colocación de cubos) con un robot concreto (SO-101), el modelo puede no generalizar a otras tareas o morfologías robóticas sin un nuevo ajuste fino.
- Riesgo de alucinación: como modelo VLA, puede generar acciones incorrectas si las observaciones visuales son ambiguas o fuera de distribución; no se han documentado casos específicos.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo multimodal, la ventana de tokens puede limitar la cantidad de información visual procesada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben mantener los avisos de copyright y atribución.
- Dependencia del ecosistema LeRobot: el modelo requiere las herramientas de LeRobot para cargarse y ejecutarse, lo que puede limitar su uso fuera de este framework.
- Sin datos de rendimiento publicados: al no haber benchmarks ni evaluaciones independientes, el rendimiento real en entornos de producción no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/smolvla_so101_multitask_simreal_fullft_0902
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio relacionado (SO-101 multitask long-horizon): https://github.com/ktkchh/smolvla-so101-multitask-long-horizon
