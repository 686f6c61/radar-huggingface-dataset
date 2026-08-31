# Damirchik/vla-grounder-qwen3.5-9b-rl4vla-pi0

## Resumen

El modelo `Damirchik/vla-grounder-qwen3.5-9b-rl4vla-pi0` es un "VLA Grounder" desarrollado por el usuario Damirchik, basado en el modelo multimodal Qwen3.5-9B de Alibaba. Su función es recibir una imagen de escena y una instrucción humana, y generar un comando conciso y visualmente fundamentado que una política de visión-lenguaje-acción (VLA) congelada, en este caso pi0, pueda ejecutar directamente. Está entrenado con GRPO (Group Relative Policy Optimization) usando un adaptador LoRA de rango 32 sobre las tareas MultiCarrot y MultiPlate del benchmark RL4VLA.

El modelo resuelve el problema de adaptar un modelo de lenguaje multimodal para traducir instrucciones de alto nivel en comandos accionables para robots, sin necesidad de reentrenar el VLA subyacente. Su relevancia actual radica en la investigación sobre control robótico condicionado por lenguaje, fundamentación visual y reproducibilidad de experimentos con VLA congelados. Con aproximadamente 9,4 mil millones de parámetros y una ventana de contexto heredada de 262k tokens, es un modelo denso que cabe en una GPU de 24 GB, lo que facilita su uso en entornos de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (dense, híbrido Mamba-Transformer con GDN + atención completa) con adaptador LoRA rank-32 |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-9B, un modelo denso multimodal que combina un encoder de visión con un bloque de atención híbrida que mezcla Gated Delta Networks (GDN) con atención completa, siguiendo un diseño Mamba-Transformer. El modelo original soporta entrada de imagen y texto, y tiene una ventana de contexto de 262k tokens. Sobre esta base, el autor aplicó un adaptador LoRA de rango 32 y entrenó con GRPO, un método de optimización de política por refuerzo que utiliza recompensas dispersas generadas por una política pi0 congelada durante el rollout. El entrenamiento se realizó en las tareas MultiCarrot y MultiPlate del benchmark RL4VLA. La innovación principal es el uso de refuerzo para entrenar un "grounder" que traduce instrucciones humanas en comandos visualmente anclados, sin modificar los pesos del VLA downstream.

## Capacidades

- Generacion de comandos visualmente fundamentados para control robotico: recibe una imagen de escena y una instruccion, y produce un comando conciso que un VLA congelado puede ejecutar.
- Comprension de imagenes de escena: utiliza el encoder de vision del modelo base para interpretar el entorno visual.
- Comprension de instrucciones en lenguaje natural: hereda las capacidades linguisticas del Qwen3.5-9B, aunque los idiomas exactos no estan documentados.
- Generacion de texto generico: mantiene las capacidades conversacionales y de generacion del modelo base, aunque su uso previsto es especifico para robotica.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible; solo se menciona que el modelo base lo soporta, pero no se verifica en este checkpoint.
- Capacidades de agente y multi-step reasoning: no documentadas para este checkpoint.
- Entrenamiento con refuerzo (GRPO): el uso de RL con recompensas de un VLA congelado es una capacidad distintiva para adaptar el modelo a tareas de grounding visual.

## Casos de uso

- Control robotico condicionado por lenguaje en simulacion: el modelo se puede integrar en entornos como RL4VLA MultiCarrot o MultiPlate para traducir instrucciones humanas (p. ej., "coge la zanahoria grande") en comandos que la politica pi0 ejecuta. Es adecuado porque esta entrenado especificamente para esta tarea.
- Adaptacion de VLA congelados sin reentrenamiento: permite mejorar la interpretacion de instrucciones de un VLA existente anadiendo un modulo de grounding entrenado con RL, sin tocar los pesos del VLA.
- Investigacion en fundamentacion visual: util para estudiar como un modelo de lenguaje multimodal puede alinear instrucciones con objetos y regiones en una imagen, gracias a su entrenamiento con recompensas de una politica robotica.
- Reproduccion de experimentos: el checkpoint esta disponible para replicar los resultados del autor y comparar estrategias de RL para modelos de lenguaje en robotica.
- Generacion de comandos para manipulacion robotica: en entornos simulados con multiples objetos, el modelo puede distinguir entre elementos y generar comandos precisos, lo que es critico para tareas de recogida y colocacion.
- Investigacion en RL para modelos multimodales: el enfoque de GRPO con recompensas de un VLA congelado puede servir de referencia para otros trabajos que combinen refuerzo y modelos de lenguaje para control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se entrena en las tareas RL4VLA MultiCarrot y MultiPlate, pero no se proporcionan metricas cuantitativas (exito en tarea, tasa de error, etc.) en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision bf16, el modelo requiere aproximadamente 18,8 GB solo para los pesos (9,4B x 2 bytes), mas overhead de activaciones y cache. Con cuantizacion a 4 bits, la VRAM se reduce a unos 5-6 GB, aunque no se ofrecen archivos cuantizados oficiales.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) es suficiente para inferencia en bf16; tambien caben A100 (40/80 GB) y H100. Para cuantizacion ligera, una RTX 3090 o RTX 4070 (12-16 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo de 24 GB y, con cuantizacion, en modelos de 12-16 GB.
- Opciones de despliegue: se puede cargar con Transformers (como se muestra en la model card), y es compatible con vLLM dado que el modelo base Qwen3.5-9B esta soportado en vLLM. Tambien se podria convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (VLA grounders entrenados con RL sobre Qwen3.5). El modelo base Qwen3.5-9B es el punto de partida, pero no es un grounder especifico. No se han encontrado alternativas publicas similares en los resultados de busqueda, por lo que la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para uso en produccion ni en robotica real sin pruebas adicionales.
- Especificidad de tareas: entrenado exclusivamente en las tareas MultiCarrot y MultiPlate de RL4VLA; puede no generalizar a otras tareas o entornos sin fine-tuning adicional.
- Dependencia de un VLA congelado: no genera acciones directamente; requiere un VLA downstream (pi0) para ejecutar los comandos.
- Licencia no disponible: se desconoce si permite uso comercial o restricciones de redistribucion, lo que limita su adopcion en entornos empresariales.
- Sesgos del modelo base: hereda posibles sesgos linguisticos y visuales de Qwen3.5-9B, que no estan documentados en este checkpoint.
- Riesgo de alucinacion: puede generar comandos incorrectos si la imagen no es clara o la instruccion es ambigua, dado que no hay garantias de robustez.
- Contexto largo no verificado: aunque el modelo base soporta 262k tokens, el fine-tuning con LoRA y RL podria reducir la ventana efectiva; no se ha comprobado.
- Idiomas no documentados: no se especifica que idiomas soporta el modelo, lo que dificulta su uso en aplicaciones multilingues.

## Enlaces

- HuggingFace: https://huggingface.co/Damirchik/vla-grounder-qwen3.5-9b-rl4vla-pi0
- Referencia de Qwen3.5-9B en LLM Reference: https://www.llmreference.com/model/qwen3.5-9b
- Documentacion de Qwen3.5-Dense en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.5-Dense.html
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
