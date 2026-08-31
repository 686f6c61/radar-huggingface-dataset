# Damirchik/vla-grounder-qwen3.5-9b-rl4vla-openvla

## Resumen

El modelo `Damirchik/vla-grounder-qwen3.5-9b-rl4vla-openvla` es un VLA Grounder, es decir, un modelo de lenguaje y visión que recibe una imagen de escena y una instrucción humana, y genera un comando conciso y visualmente fundamentado para una política VLA (Vision-Language-Action) congelada, en este caso OpenVLA. Desarrollado por Damirchik, este checkpoint es un ajuste fino completo del modelo multimodal Qwen3.5-9B, entrenado con GRPO y un adaptador LoRA de rango 32 sobre las tareas MultiCarrot y MultiPlate del benchmark RL4VLA, utilizando recompensas sparse generadas por una política OpenVLA congelada.

La relevancia de este modelo radica en su enfoque no invasivo: en lugar de modificar la política de acción del VLA, optimiza el espacio de condicionamiento del lenguaje, generando comandos que sirven como entrada al VLA congelado. Esto permite adaptar VLAs existentes a nuevas tareas sin reentrenar el modelo de acción, un paso hacia la modularidad y la reproducibilidad en robótica. Con 9.409.813.744 parámetros (9,4B), el modelo se basa en la arquitectura Qwen3.5-9B, que incluye atención híbrida con gated delta networks, un codificador de visión y soporte para contexto largo (262K según el modelo base). Aunque el checkpoint está orientado a investigación, su diseño lo hace relevante para cualquier pipeline de control robótico condicionado por lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (multimodal, gated delta networks hybrid attention, vision encoder) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-9B soporta 262K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `Qwen/Qwen3.5-9B`, un modelo multimodal denso de la familia Qwen3.5 que combina un codificador de visión con un transformer de lenguaje que emplea atención híbrida basada en gated delta networks. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con un adaptador LoRA de rango 32, y posteriormente se fusionó el adaptador para obtener el checkpoint final. La tarea de entrenamiento consistió en generar comandos visualmente fundamentados sobre las escenas de las tareas MultiCarrot y MultiPlate del benchmark RL4VLA, utilizando recompensas sparse obtenidas de una política OpenVLA congelada que evalúa la ejecución de los comandos generados.

La innovación principal es que el modelo no predice acciones directamente, sino que produce una instrucción textual que se pasa a un VLA congelado. Este enfoque, descrito en el artículo "VLA Grounder: Language-Conditioning Space Optimization for Black-Box VLA Policies", adapta la señal de condicionamiento del lenguaje en lugar de la política de acción, lo que lo hace no invasivo y aplicable a diferentes modelos VLA sin necesidad de reentrenarlos. No se dispone de información detallada sobre el dataset de entrenamiento más allá de las tareas RL4VLA mencionadas, ni sobre el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de comandos concisos y visualmente fundamentados a partir de una imagen de escena y una instrucción en lenguaje natural.
- Comprensión de imágenes: procesa la escena visual para generar comandos contextualmente relevantes.
- Generación de texto: produce comandos en formato textual que pueden ser consumidos por un VLA congelado.
- Integración con políticas VLA congeladas: el comando generado se pasa directamente a OpenVLA u otros VLAs sin modificar su política.
- Adaptación a tareas de manipulación robótica: específicamente entrenado para las tareas MultiCarrot y MultiPlate del benchmark RL4VLA.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe.

## Casos de uso

- Control de robots manipuladores en entornos de laboratorio: el modelo traduce instrucciones humanas (p. ej., "coge la zanahoria azul") en comandos ejecutables para un VLA congelado, permitiendo operar robots sin reentrenar la política de acción.
- Adaptación de VLAs congelados a nuevas tareas: al optimizar el espacio de condicionamiento del lenguaje, se pueden reutilizar políticas VLA existentes para tareas no vistas, como MultiCarrot o MultiPlate, generando comandos que la política ya sabe ejecutar.
- Investigación en aprendizaje por refuerzo para robótica: el modelo sirve como componente en pipelines de RL donde un agente de alto nivel genera instrucciones para un VLA de bajo nivel, facilitando experimentos de generalización y transferencia.
- Generación de datos de entrenamiento sintéticos: puede usarse para producir comandos anotados a partir de imágenes, que luego sirven para entrenar o evaluar otros modelos de lenguaje y visión en el dominio robótico.
- Interfaz humano-robot en entornos industriales: un operario describe una tarea en lenguaje natural y el modelo genera el comando adecuado para que el robot la ejecute, reduciendo la necesidad de programación manual.
- Evaluación de robustez de políticas VLA: al generar comandos variados y visualmente fundamentados, se puede probar cómo responde un VLA congelado ante diferentes formulaciones de la misma instrucción, ayudando a identificar fallos de condicionamiento.
- Teleoperación asistida: en escenarios de teleoperación, el modelo puede traducir comandos de alto nivel del usuario en instrucciones precisas para el VLA, mejorando la fluidez de la interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento ni comparaciones con otros modelos. El único dato de evaluación indirecto es que el modelo fue entrenado para maximizar recompensas sparse de OpenVLA en las tareas RL4VLA MultiCarrot y MultiPlate, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,4B parámetros y los pesos en bfloat16 ocupan aproximadamente 18,8 GB (según el tamaño del repositorio). Con overhead de activaciones y procesamiento de imágenes, se recomienda al menos 24 GB de VRAM para inferencia en precisión completa. Cuantizaciones de 8 bits o 4 bits podrían reducir el requerimiento a 12-16 GB, pero no se han documentado oficialmente.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior, o GPUs de datacenter como A100 (40/80 GB) o H100. El modelo base Qwen3.5-9B está diseñado para caber en una GPU de 24 GB según la documentación de vLLM.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 24 GB de VRAM, como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: el modelo es compatible con la librería transformers y puede servirse con vLLM (según la documentación de Qwen3.5-9B en vLLM Recipes). También es posible usar Ollama, llama.cpp u otras herramientas que soporten modelos multimodales, aunque no se han publicado configuraciones específicas.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 9B en bfloat16 en una RTX 4090 suele generar decenas de tokens por segundo, pero la latencia exacta depende del hardware y del procesador de visión.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ya que el VLA Grounder es un tipo específico de modelo intermedio entre el lenguaje y la política VLA, y no hay datos de otros checkpoints similares con los que compararlo directamente.

## Limitaciones y advertencias

- Sesgos y alucinación: no se ha documentado ningún análisis de sesgos ni de tasas de alucinación. Al ser un modelo generativo, existe riesgo de producir comandos incorrectos o no alineados con la escena visual, especialmente en entornos no vistos durante el entrenamiento.
- Limitaciones de generalización: el modelo fue entrenado exclusivamente en las tareas MultiCarrot y MultiPlate del benchmark RL4VLA. Su rendimiento fuera de estos dominios puede degradarse significativamente.
- Dependencia de la política VLA congelada: la calidad de los comandos generados está ligada a la recompensa proporcionada por OpenVLA durante el entrenamiento. Si la política congelada cambia o es diferente, el modelo puede no comportarse de manera óptima.
- Restricciones de licencia: la licencia no está disponible, por lo que el uso comercial es incierto. Se recomienda contactar al autor antes de cualquier despliegue en producción.
- Alcance limitado: el modelo no genera acciones directamente, solo comandos textuales. Requiere un VLA congelado aguas abajo para ejecutar las tareas, lo que añade un punto de fallo adicional.
- Contexto y multilingüismo: no se ha confirmado la longitud de contexto efectiva tras el ajuste fino, ni los idiomas soportados. Es probable que herede las capacidades del modelo base, pero no está garantizado.

## Enlaces

- HuggingFace: https://huggingface.co/Damirchik/vla-grounder-qwen3.5-9b-rl4vla-openvla
- Artículo arXiv (VLA Grounder): https://arxiv.org/html/2607.04517v1
- Repositorio del modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Modelo relacionado (checkpoint intermedio): https://huggingface.co/Damirchik/qwen3.5-9b-openvla-rlvla-multi
