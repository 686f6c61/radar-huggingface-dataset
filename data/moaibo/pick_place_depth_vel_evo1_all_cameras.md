# MoAIBo/pick_place_depth_vel_evo1_all_cameras

## Resumen

El modelo `MoAIBo/pick_place_depth_vel_evo1_all_cameras` es una política de robótica de tipo Vision-Language-Action (VLA) desarrollada por el usuario MoAIBo y entrenada con el framework LeRobot. Se basa en la arquitectura EVO1, presentada en el paper "Evo-1: Lightweight Vision-Language-Action Model with Preserved Semantic Alignment" (CVPR 2026), que combina un backbone multimodal InternVL3-1B con un head de flow-matching para predecir secuencias de acciones. El modelo está diseñado para controlar un robot móvil con brazo (tipo `so101_tb4`) en tareas de pick and place, utilizando cinco cámaras (izquierda, derecha, muñeca, D455 y profundidad) y una instrucción en lenguaje natural.

Con 776 millones de parámetros, es un modelo relativamente ligero en comparación con otros VLA de gran escala, lo que lo hace adecuado para entornos de investigación y despliegue en hardware de gama media. Su relevancia radica en que demuestra cómo un backbone VLM nativo puede adaptarse eficientemente a tareas de manipulación robótica mediante imitación, sin necesidad de ajuste fino masivo. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EVO1 (backbone InternVL3-1B + head de flow-matching) |
| Parametros totales | 776.139.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible (el backbone InternVL3 es multilingue, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EVO1 es una política VLA que utiliza InternVL3-1B como backbone de visión-lenguaje. InternVL3 se entrena de forma nativa multimodal, aprendiendo conjuntamente representaciones visuales y lingüísticas, lo que evita los problemas de alineación post-hoc de otros modelos. Sobre este backbone, EVO1 incorpora un head de flow-matching continuo que predice fragmentos de acciones futuras (action chunks) a partir de las observaciones actuales (imágenes de múltiples cámaras y estado del robot). El paper original describe además un "cross-modulated diffusion transformer" y un módulo de integración optimizado, aunque en este modelo concreto no se detallan las variantes específicas.

El entrenamiento se realizó con el dataset `MoAIBo/pick_place_depth_vel`, que contiene 26 episodios y 34.129 frames a 30 FPS, con dos tareas de pick and place (objeto amarillo o azul desde una caja marrón a un plato blanco). La configuración de entrenamiento incluye 20.000 pasos, batch size 2, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación (behavior cloning) supervisado.

## Capacidades

- Generación de acciones de control para un robot móvil con brazo (8 dimensiones de acción: probablemente posición, orientación y velocidad de la base).
- Percepción multimodal con 5 cámaras simultáneas, incluyendo una cámara de profundidad, lo que permite estimar la posición 3D de los objetos.
- Comprensión de instrucciones en lenguaje natural (en inglés) para especificar la tarea a realizar.
- Ejecución de tareas de pick and place con objetos de colores específicos en un entorno fijo.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling ni agentes conversacionales; su salida es exclusivamente una secuencia de acciones.

## Casos de uso

- Automatización de tareas de recogida y colocación en entornos de laboratorio: el modelo puede ejecutar la tarea de pick and place de forma autónoma, guiado por una instrucción textual, lo que es útil para experimentos de robótica repetibles.
- Investigación en imitación learning y VLA: al ser un modelo ligero y de código abierto, sirve como punto de partida para estudiar la transferencia de conocimiento de VLMs a políticas robóticas.
- Despliegue en robots de bajo coste: el robot `so101_tb4` es un hardware asequible, y el modelo está optimizado para funcionar con sus cámaras y actuadores, facilitando la replicación en otros laboratorios.
- Generación de datos de entrenamiento sintéticos: aunque no se menciona, el modelo podría usarse para recopilar demostraciones adicionales en un bucle de auto-mejora.
- Evaluación de políticas en entornos controlados: permite comparar diferentes arquitecturas VLA bajo las mismas condiciones de tarea y hardware.
- Educación en robótica: su integración con LeRobot y la documentación asociada lo hacen adecuado para cursos de robótica y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no hay resultados de evaluación en robot real. El paper de EVO1 (arXiv 2511.04555) reporta métricas en entornos simulados y reales, pero no se dispone de esos datos en la información proporcionada para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 776M parámetros, en FP16 los pesos ocupan aproximadamente 1,5 GB. Sin embargo, el procesamiento de 5 imágenes de 360x640 y las activaciones del transformer requieren memoria adicional; se estima que una GPU con al menos 8 GB de VRAM podría ejecutar la inferencia, aunque 16 GB es más seguro.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4090, A100, etc. Para entrenamiento, el batch size 2 con imágenes de alta resolución sugiere que se usó una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090 o A100).
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs de gama media-alta para inferencia.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). No es compatible con vLLM ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se dispone de datos oficiales. Dado el tamaño y la carga de imágenes, se espera una frecuencia de control de unos pocos hercios (probablemente 5-10 Hz) en una GPU moderna, pero no se puede confirmar.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (VLA). Existen otros VLA como OpenVLA, RT-2 o π0, pero no se tienen datos de rendimiento ni especificaciones comparables en la información proporcionada. El propio autor publica otro modelo (`MoAIBo/pick_place_depth_vel_policy_vision_expert`) que podría ser un experto en visión, pero no se detallan sus características. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó con solo 26 episodios, lo que limita severamente su capacidad de generalización a variaciones en la posición de los objetos, iluminación o cambios en el entorno.
- Las tareas están restringidas a pick and place de objetos amarillos o azules en una configuración fija; no es adecuado para otras tareas de manipulación.
- Depende de la calibración exacta de las cámaras y del robot; cualquier cambio en la disposición física puede degradar el rendimiento.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento real es desconocido.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está atado a un hardware específico y a un dataset limitado, lo que reduce su utilidad en producción.
- El dataset puede contener sesgos (por ejemplo, solo dos colores de objetos, iluminación fija), que se reflejarán en el comportamiento del modelo.
- No se especifica la longitud de contexto ni el soporte multilingüe, aunque el backbone InternVL3 es multilingüe por diseño; la instrucción se procesa en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoAIBo/pick_place_depth_vel_evo1_all_cameras
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/pick_place_depth_vel
- Repositorio GitHub de EVO1: https://github.com/MINT-SJTU/Evo-1
- Paper de EVO1 (arXiv): https://arxiv.org/html/2511.04555v1
- Página del proyecto EVO1: https://mint-sjtu.github.io/Evo-1.io/
- LeRobot (framework): https://github.com/huggingface/lerobot
