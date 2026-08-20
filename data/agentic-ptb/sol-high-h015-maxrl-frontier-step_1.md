# agentic-ptb/sol-high.h015.maxrl-frontier.step_1

## Resumen

`sol-high.maxrl-frontier.step_1` es un checkpoint intermedio de un barrido experimental de AgentPTB, un proyecto de investigación que explora el entrenamiento de modelos de lenguaje mediante Maximum Likelihood Reinforcement Learning (MaxRL). El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido ajustado con un driver de alto esfuerzo de razonamiento (Codex / gpt-5.6-sol con `effort=high`). Se trata de un artefacto de investigación, no de un modelo final listo para producción: su rol está marcado como "intermediate" y corresponde al primer paso (`step_1`) de un barrido más amplio.

La relevancia de este checkpoint radica en que forma parte de la frontera de experimentación con MaxRL, una técnica que combina el aprendizaje por refuerzo con la estimación de máxima verosimilitud para mejorar el razonamiento y la capacidad de agente de los modelos. Con aproximadamente 9.400 millones de parámetros, el modelo hereda la arquitectura transformer de Qwen3.5-9B-Base, aunque no se especifican detalles adicionales como la longitud de contexto o el número de capas. Su interés principal es para investigadores que quieran reproducir o analizar los resultados del barrido AgentPTB, no para uso directo en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only de 9.400 millones de parámetros. El entrenamiento se realizó con la técnica MaxRL (Maximum Likelihood Reinforcement Learning), descrita en el repositorio oficial de tajwarfahim/maxrl, que combina objetivos de máxima verosimilitud con señales de refuerzo para mejorar el razonamiento y el comportamiento agéntico. El checkpoint corresponde al primer paso de un barrido (sweep) denominado `maxrl-frontier`, donde la celda `sol-high` se generó con un driver de alto esfuerzo (Codex / gpt-5.6-sol con `reasoning effort=high`). El modelo incluye los tokens de fin de secuencia correctos (`<|im_end|>` con id 248046 y otro con id 248044), lo que garantiza que las respuestas se detienen adecuadamente al final de cada turno, un detalle crítico para evaluaciones fiables.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. Al ser un checkpoint intermedio, es probable que el entrenamiento continúe en pasos posteriores del barrido.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de generación y razonamiento del modelo base, aunque no se han publicado evaluaciones específicas para este checkpoint.
- Detención correcta de turnos: el `eos_token_id` configurado correctamente evita que el modelo se desborde del contexto, lo que permite conversaciones multi-turno estables.
- Capacidades agénticas: al entrenarse con MaxRL, se espera que el modelo mejore en tareas que requieren planificación y uso de herramientas, pero no hay datos concretos que lo confirmen.
- Multilingüismo: no disponible; se desconoce si el fine-tuning afecta a las capacidades multilingües del modelo base.
- Tool calling y function calling: no hay información específica; se asume que podría heredar estas capacidades de Qwen3.5-9B-Base, pero no está confirmado.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint es útil para estudiar cómo evoluciona el rendimiento de MaxRL a lo largo de los pasos de entrenamiento, comparando `step_1` con checkpoints posteriores del mismo barrido.
- Reproducción de experimentos: investigadores que quieran replicar los resultados del paper de MaxRL pueden usar este checkpoint como punto de partida o como referencia para validar sus propias implementaciones.
- Análisis de la dinámica de entrenamiento: al ser un checkpoint intermedio, permite inspeccionar cómo se comporta el modelo en fases tempranas del entrenamiento, lo que puede revelar información sobre la estabilidad del proceso.
- Evaluación de la detención de secuencia: el `eos_token_id` correcto lo convierte en un candidato para probar pipelines de evaluación que dependen de una generación bien delimitada.
- Fine-tuning posterior: dado que es un modelo de 9,4B con pesos en safetensors, puede servir como base para experimentos de fine-tuning adicionales en dominios específicos, aunque su licencia no está clara.
- Benchmarking de modelos intermedios: para comparar el rendimiento de checkpoints de un mismo barrido en tareas de razonamiento o codificación, siempre que se utilicen los mismos protocolos de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. El autor advierte que las evaluaciones de checkpoints sin el `eos_token_id` correcto son un "suelo, no una medición", lo que sugiere que este checkpoint, al tenerlo correcto, podría ser evaluado de forma fiable, pero no se proporcionan números.

## Requisitos de hardware

- VRAM estimada: con 9,4B parámetros en precisión fp16, el modelo ocupa aproximadamente 18,8 GB en memoria. Para inferencia sin cuantización se necesitarían al menos 20 GB de VRAM, lo que lo hace inviable en GPUs consumer de 16 GB (como RTX 4080 o RTX 3090 Ti) sin cuantización.
- GPUs recomendadas: una RTX 4090 (24 GB) podría ejecutar el modelo en fp16 con margen limitado; una A100 de 40 GB o 80 GB sería más cómoda. Para entrenamiento o fine-tuning se recomienda al menos una A100 o H100.
- Cuantización: no se proporcionan versiones GGUF ni AWQ, pero al ser safetensors estándar, se podría cuantizar con herramientas como llama.cpp o AutoAWQ para reducir la VRAM a ~5-6 GB en 4-bit, lo que permitiría ejecutarlo en GPUs consumer de 8-12 GB.
- Opciones de despliegue: al ser safetensors, se puede cargar con transformers, vLLM o TGI. No hay versiones GGUF listas para Ollama o llama.cpp, pero se pueden generar.
- Latencia y throughput: no disponibles; dependerán del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Base (base) | 9,4B | no disponible | no disponible | Modelo original sin fine-tuning |
| sol-high.maxrl-frontier.step_1 | 9,4B | no disponible | no disponible | Checkpoint intermedio con MaxRL |
| Otros fine-tunes de Qwen3.5-9B | 9,4B | no disponible | no disponible | No se han identificado alternativas concretas |

No se dispone de información sobre otros modelos comparables en la misma categoría (fine-tunes de 9B con MaxRL). La comparativa se limita al modelo base, que es el punto de partida.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo barrido y no está optimizado para uso en producción.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial sin consultar al autor.
- Sesgos y alucinaciones: no hay información sobre sesgos específicos, pero al ser un fine-tuning de Qwen3.5-9B-Base, hereda los riesgos típicos de los modelos de este tamaño, incluyendo alucinaciones en temas de baja frecuencia.
- Contexto e idiomas: se desconocen la longitud de contexto y los idiomas soportados; es probable que herede las capacidades del modelo base, pero no está confirmado.
- Evaluación limitada: al no haber benchmarks publicados, no se puede garantizar su calidad en tareas específicas.
- Dependencia del driver: el nombre "sol-high" indica que fue generado con un driver de alto esfuerzo, lo que puede influir en el estilo de razonamiento y no es representativo de otros drivers.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.maxrl-frontier.step_1
- Repositorio MaxRL (paper): https://github.com/tajwarfahim/maxrl
- Información sobre GPT-5.6 Sol (contexto del driver): https://openai.com/index/gpt-5-6/
- LiveBench (benchmark de referencia, no aplicado a este modelo): https://livebench.ai/
