# charlott-rgb/so101_acrylic_vla_jepa_smoke

## Resumen

VLA-JEPA (so101_acrylic_vla_jepa_smoke) es un modelo de Vision-Language-Action (VLA) desarrollado por charlott-rgb y entrenado con el framework LeRobot de Hugging Face. Combina un backbone de lenguaje Qwen3-VL con un modelo de mundo de video autosupervisado (V-JEPA2) y una cabeza de acción DiT basada en flow-matching. El modelo está diseñado para generar acciones de control robótico a partir de observaciones visuales y de estado, en lugar de producir texto o razonamiento simbólico.

Este modelo concreto es un "smoke test": se ha entrenado durante solo 5 pasos con un lote de tamaño 1, sobre un dataset de 72 episodios (39 189 frames a 30 FPS) para una tarea específica: recoger una pieza de pintura acrílica y colocarla en una caja. El repositorio contiene los pesos en formato safetensors, con un total de 2 766 134 150 parámetros y un tamaño de 6.2 GB. Su relevancia radica en que sirve como ejemplo de integración de la arquitectura VLA-JEPA en el ecosistema LeRobot, y como punto de partida para investigar el uso de modelos de mundo en políticas de aprendizaje por imitación. No se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA (Qwen3-VL + V-JEPA2 + DiT flow-matching) |
| Parametros totales | 2.766.134.150 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VLA-JEPA descrita en el paper arxiv:2602.10098. Utiliza un backbone de lenguaje Qwen3-VL para procesar las instrucciones y el contexto visual, un modelo de mundo de video V-JEPA2 que aprende representaciones autosupervisadas a partir de secuencias de frames, y una cabeza de acción DiT que genera acciones mediante flow-matching. Esta combinación pretende mejorar la predicción de acciones al incorporar un modelo del entorno que captura la dinámica temporal de la escena.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset charlott-rgb/so101_acrylic_dense72, compuesto por 72 episodios y 39 189 frames a 30 FPS. La tarea es "Pick up the acrylic paint piece and place it in the box". La configuración de entrenamiento fue mínima: 5 pasos, batch size 1, optimizador AdamW con learning rate 0.0001 y seed 1000. No se aplicó RLHF ni DPO. La ausencia de un entrenamiento prolongado indica que el modelo no ha convergido y que su rendimiento real es muy limitado, siendo útil únicamente como prueba de concepto o para validar pipelines.

## Capacidades

- Control robótico de bajo nivel: genera acciones de 6 dimensiones a partir de observaciones de estado y dos imágenes de 224x224 píxeles.
- Percepción visual multi-cámara: acepta dos entradas visuales (exterior_1_left y exterior_2_left), lo que permite fusionar información de una cámara fija y una de muñeca.
- Integración de estado: procesa un vector de estado de 6 dimensiones, probablemente posiciones articulares o del efector final del robot.
- Ejecución de tareas de manipulación: está entrenado para una tarea concreta de pick and place, aunque solo a nivel de demostración.
- No soporta tool calling ni function calling.
- No genera texto ni razonamiento simbólico: su salida es exclusivamente una acción de control.
- Capacidades multilingües: no disponibles.
- No dispone de modo de pensamiento (thinking mode) ni de procesamiento de audio.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo la incorporación de un modelo de mundo autosupervisado (V-JEPA2) afecta a la predicción de acciones. Se usaría en entornos de laboratorio con LeRobot para comparar políticas con y sin modelo de mundo.
- Prototipado de robots de bajo coste: el modelo está entrenado para el robot "so_follower", un tipo de robot de bajo coste. Puede utilizarse para validar la viabilidad de arquitecturas VLA en hardware asequible antes de invertir en plataformas más caras.
- Validación de pipelines de entrenamiento: al ser un modelo "smoke", permite comprobar rápidamente que el pipeline de LeRobot para VLA-JEPA funciona correctamente (carga de datos, preprocesamiento, entrenamiento y guardado de pesos) sin necesidad de ejecutar un entrenamiento completo.
- Manipulación de objetos en entornos controlados: la tarea de recoger una pieza acrílica y colocarla en una caja es un caso típico de pick and place. El modelo puede desplegarse en un robot con dos cámaras para ejecutar esta tarea, aunque con un rendimiento esperado bajo debido al entrenamiento insuficiente.
- Estudio de fusión multi-cámara: al aceptar dos entradas visuales de 224x224, el modelo permite investigar cómo la información de distintos puntos de vista influye en la predicción de acciones, lo que es relevante para diseñar sistemas de percepción robótica.
- Formación y educación en robótica: el modelo y su dataset están disponibles públicamente, lo que permite a estudiantes e investigadores aprender a entrenar, evaluar y desplegar políticas VLA con LeRobot, siguiendo la guía oficial de vla_jepa.
- Benchmarking de arquitecturas de acción: aunque no hay resultados publicados, el modelo puede utilizarse como baseline para comparar la eficiencia de diferentes cabezas de acción (DiT, MLP, etc.) en una tarea simple de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen datos de MMLU, HumanEval, GSM8K ni ningún otro benchmark aplicable a modelos de lenguaje, y tampoco hay resultados de éxito en robot real para la tarea de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.766 millones de parámetros, los pesos en fp32 ocupan aproximadamente 11 GB, en fp16/bf16 unos 5.5 GB, en int8 unos 2.8 GB y en int4 unos 1.4 GB. El repositorio tiene un tamaño de 6.2 GB, lo que sugiere pesos en fp32 o fp16. Para una inferencia básica se recomienda al menos 8 GB de VRAM en fp16.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). En GPUs de consumo como RTX 3060 12GB o RTX 4070 también podría ejecutarse en fp16, siempre que se respete el límite de VRAM.
- Si cabe en consumer GPU: sí, en GPUs con 8 GB o más de VRAM, siempre que se utilice una precisión reducida. No se han publicado cuantizaciones oficiales, por lo que habría que aplicar cuantización manualmente.
- Opciones de despliegue: LeRobot es la vía principal, tanto para inferencia como para entrenamiento. También es posible exportar los pesos a otros formatos, aunque no hay información al respecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento en tiempo real.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (políticas VLA-JEPA o VLA similares) con datos de rendimiento publicados. Existen otros modelos VLA como OpenVLA o RT-2, pero no hay datos suficientes para establecer una comparación rigurosa en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenamiento insuficiente: el modelo se ha entrenado durante solo 5 pasos, por lo que no ha aprendido la tarea de forma adecuada. No es apto para uso en producción ni para experimentos que requieran un rendimiento mínimo.
- Sin evaluación: no se han proporcionado resultados de evaluación en robot real, ni tasas de éxito, ni comparaciones con otros métodos.
- Tarea muy específica: solo está entrenado para una única tarea (pick and place de una pieza acrílica). No generaliza a otras tareas, objetos ni entornos.
- Dataset limitado: 72 episodios y 39 189 frames de un único robot y entorno, con posibles sesgos de iluminación, posición de objetos y variaciones de escena.
- Riesgo de acciones incorrectas: al ser un policy de control, puede generar acciones que no sean seguras si se despliega sin supervisión. Se recomienda usar entornos simulados o robots con protecciones.
- Dependencia de LeRobot: requiere la versión 0.6.2 de LeRobot y una configuración específica de cámaras y robot (so_follower) para ejecutarse correctamente.
- Idiomas y contexto: no disponibles. No se puede afirmar que el modelo soporte instrucciones en varios idiomas ni que maneje contextos largos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el estado del modelo (smoke test) hace que su uso práctico sea muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charlott-rgb/so101_acrylic_vla_jepa_smoke
- Paper VLA-JEPA: https://arxiv.org/abs/2602.10098
- Dataset de entrenamiento: https://huggingface.co/datasets/charlott-rgb/so101_acrylic_dense72
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de VLA-JEPA en LeRobot: https://huggingface.co/docs/lerobot/main/en/vla_jepa
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlott-rgb/so101_acrylic_dense72
