# maximellerbach/omx_multicubes_lawam

## Resumen

LaWAM (Latent World Action Model) es un modelo de mundo-acción latente diseñado para políticas robóticas conscientes de la dinámica. Combina un backbone Qwen3-VL con un modelo de acción/mundo latente y una cabeza de acción basada en flow-matching, lo que permite predecir la evolución de la escena en el espacio latente de codificadores visuales preentrenados (como DINOv3) sin reconstruir imágenes futuras en el espacio de píxeles. Este enfoque reduce la latencia y el coste computacional frente a los modelos que predicen vídeo o imágenes futuras, manteniendo el principio de control condicionado al futuro.

El modelo ha sido desarrollado por Maxime Ellerbach (maximellerbach) y entrenado con el framework LeRobot de Hugging Face. Está especializado en una tarea concreta de manipulación robótica: recoger cubos y colocarlos uno a uno en un cuadrado azul, utilizando un robot tipo OMX follower con dos cámaras (muñeca y superior). Con 2.555.179.360 parámetros (aproximadamente 2,56 mil millones), el modelo se distribuye en formato safetensors y ocupa 22,7 GB en el repositorio. Su relevancia radica en que introduce una interfaz de modelo de mundo latente para políticas VLA (visión-lenguaje-acción), un área de investigación activa en robótica de aprendizaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaWAM (backbone Qwen3-VL + modelo de acción/mundo latente + cabeza flow-matching) |
| Parametros totales | 2.555.179.360 (2,56 mil millones) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LaWAM se basa en una arquitectura de dos etapas según el paper arXiv:2606.15768. En la primera etapa se aprende un modelo de mundo latente (LaWM) que reutiliza el decodificador forward de un modelo de acción latente. Este LaWM expande las acciones latentes predichas por la política en subobjetivos visuales latentes basados en la embodiment del robot. En la segunda etapa, la política LaWAM se entrena para generar chunks de acción condicionados a estos subobjetivos latentes, utilizando una cabeza de flow-matching. El backbone Qwen3-VL procesa las observaciones visuales (imágenes de dos cámaras a 256×256 píxeles) y produce representaciones latentes sobre las que opera el modelo de mundo.

El entrenamiento se realizó sobre el dataset `maximellerbach/omx_multicubes`, que contiene 176 episodios y 137.392 frames a 30 FPS, con la tarea "pick all the cubes and place them one by one in the blue square". La configuración de entrenamiento incluye 20.000 pasos, batch size 8, optimizador AdamW con learning rate 0,0001 y semilla 1000, utilizando LeRobot versión 0.6.2. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es de aprendizaje por imitación supervisado.

## Capacidades

- Política robótica de manipulación: recibe dos imágenes (cámara de muñeca y cámara superior) y produce una acción de 6 grados de libertad (posición y orientación del efector final).
- Modelo de mundo latente: predice la evolución de la escena en el espacio latente de codificadores visuales preentrenados, sin reconstruir píxeles, lo que reduce latencia y coste computacional frente a la predicción de imágenes o vídeo futuro.
- Generación de chunks de acción mediante flow-matching, lo que permite acciones suaves y coherentes en el tiempo.
- Entrenado específicamente para la tarea de recoger y colocar cubos en un área designada, con capacidad de ejecutar la tarea de forma autónoma sobre el robot OMX follower.
- Integración nativa con LeRobot: el modelo se puede cargar y ejecutar mediante los comandos `lerobot-rollout` y `lerobot-train`, facilitando su uso en pipelines de aprendizaje por imitación.
- No incluye capacidades de lenguaje, visión general ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales controlados: el modelo puede ejecutar la tarea de recoger objetos y colocarlos en una posición objetivo, como se demuestra en el dataset de entrenamiento. Es adecuado porque su modelo de mundo latente le permite anticipar el resultado de sus acciones, mejorando la precisión en la colocación.
- Investigación en modelos de mundo latente para robótica: el modelo sirve como punto de partida para estudiar la eficiencia de la predicción en espacio latente frente a la predicción en espacio de píxeles, un tema activo en la comunidad de VLA. Se puede comparar con variantes que usan predicción de vídeo.
- Aprendizaje por imitación con LeRobot: el modelo está entrenado con el framework LeRobot y puede reproducirse o extenderse con nuevos datos. Es útil para desarrolladores que quieran experimentar con políticas robóticas basadas en modelos de mundo sin implementar desde cero.
- Despliegue en robots OMX follower: el modelo está diseñado para este robot concreto, por lo que puede utilizarse directamente en sistemas que utilicen dicho hardware, siempre que se disponga de las cámaras y la calibración adecuadas.
- Evaluación de políticas robóticas en laboratorio: al no requerir reconstrucción de imágenes futuras, el modelo puede ejecutarse en tiempo real en GPUs de gama media, facilitando la evaluación iterativa de la política en entornos de prueba.
- Generación de datos sintéticos de entrenamiento: el modelo de mundo latente podría utilizarse para generar subobjetivos visuales latentes que sirvan como aumentación de datos para otras políticas, aunque esta capacidad no está documentada explícitamente en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,56 mil millones de parámetros en FP32, se necesitarían aproximadamente 10,2 GB solo para los pesos, más memoria para activaciones y el backbone Qwen3-VL. Se estima un mínimo de 16 GB de VRAM para inferencia sin cuantización. No se dispone de información oficial sobre cuantizaciones.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB), sería adecuada. En GPUs de 24 GB (RTX 3090/4090) podría ejecutarse con margen.
- No se indica si cabe en GPUs de consumo más modestas (8 GB); dado el tamaño del modelo, es poco probable sin cuantización, pero no hay datos al respecto.
- Opciones de despliegue: el modelo se ejecuta a través de LeRobot, que utiliza PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje estándar. La inferencia se realiza mediante el comando `lerobot-rollout`.
- Latencia y throughput: no disponibles. La arquitectura de mundo latente está diseñada para reducir la latencia frente a la predicción de vídeo, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. LaWAM se enmarca en la categoría de modelos de mundo-acción (World-Action Models), pero no se han publicado comparaciones con alternativas como UniPi, SuSIE u otros enfoques de predicción de futuro en robótica. La documentación del paper menciona que LaWAM supera a los métodos de predicción de píxeles en eficiencia, pero no se ofrecen tablas comparativas en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (recoger cubos y colocarlos en un cuadrado azul) y sobre un dataset específico. No es generalizable a otras tareas u objetos sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real no está verificado. La model card indica que no hay resultados de evaluación.
- Depende del hardware OMX follower y de la configuración exacta de cámaras (muñeca y superior). Cualquier cambio en la disposición de las cámaras o en el robot puede degradar el rendimiento.
- El modelo no tiene capacidades lingüísticas ni de razonamiento general; es un sistema motor cerrado.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en un entorno de laboratorio, puede tener problemas de generalización a condiciones de iluminación, texturas o disposiciones de objetos diferentes.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo es especializado y requiere el stack de LeRobot y el hardware adecuado para su uso práctico.
- El tamaño del repositorio (22,7 GB) implica requisitos de almacenamiento considerables para descarga y despliegue.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maximellerbach/omx_multicubes_lawam)
- [Paper LaWAM (arXiv:2606.15768)](https://arxiv.org/abs/2606.15768)
- [Sitio web del proyecto LaWAM](https://rlinf.github.io/LaWAM/)
- [Repositorio GitHub de LaWAM](https://github.com/RLinf/LaWAM)
- [Dataset omx_multicubes](https://huggingface.co/datasets/maximellerbach/omx_multicubes)
- [Documentación de LeRobot sobre LaWAM](https://huggingface.co/docs/lerobot/main/en/lawam)
