# agentic-ptb/sol-high.h071.opsd-self-patch-tb1reg.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h071.opsd-self-patch-tb1reg.step_1` es un checkpoint intermedio extraído de un barrido de entrenamiento (sweep) del proyecto AgentPTB, un experimento de investigación sobre auto-mejora agéntica. Fue generado por un agente de código (Codex / gpt-5.6-sol) con un esfuerzo de razonamiento alto, y corresponde a la hora 71,62 de un run de 100 horas. El checkpoint se basa en el modelo `Qwen/Qwen3.5-9B-Base` y contiene 9.409.813.744 parámetros, con un tamaño de repositorio de 18,8 GB.

El interés de este checkpoint radica en que forma parte de un pipeline de On-Policy Self-Distillation (OPSD), una técnica en la que un único modelo actúa simultáneamente como estudiante y como profesor, condicionando su salida según el contexto (el estudiante solo ve el problema, el profesor ve además la solución correcta). El propio autor lo etiqueta como "mejor celda del barrido" (best cell in the sweep), aunque se trata de un artefacto intermedio, no de un modelo final listo para producción.

La relevancia actual de este tipo de checkpoints es doble: por un lado, permiten estudiar la dinámica de entrenamiento a lo largo del tiempo (el identificador `h071` indica la hora exacta del run); por otro, ejemplifican el uso de agentes de IA para generar datos de entrenamiento y optimizar modelos de forma autónoma, un área emergente en la investigación de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (depende del modelo base, no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un proceso de entrenamiento basado en OPSD (On-Policy Self-Distillation), descrito en el repositorio `EcthelionLiu/Agentic-OPSD`. La técnica consiste en entrenar un único modelo para que actúe como estudiante y como profesor según el contexto: el estudiante recibe solo el enunciado del problema, mientras que el profesor recibe además la solución de referencia. El entrenamiento realiza un ajuste de distribución a nivel de token a lo largo de las trayectorias generadas por el propio modelo (on-policy), lo que permite una auto-mejora iterativa sin necesidad de un modelo externo más grande.

El checkpoint se generó dentro de un run de 100 horas dirigido por un agente de código (Codex / gpt-5.6-sol) con esfuerzo de razonamiento alto. El proceso incluye un mecanismo de "self-patch" (parcheo automático) sobre el modelo base, y el identificador `tb1reg` sugiere el uso de regularización en el entrenamiento. El modelo base es Qwen3.5-9B-Base, una variante de la familia Qwen3.5 con 9.000 millones de parámetros. No se especifican detalles sobre el dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO; la información disponible se centra en el protocolo experimental, no en los datos de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de generación de texto y razonamiento de dicha familia, aunque no se han publicado evaluaciones específicas de este checkpoint.
- Auto-mejora por destilación: el entrenamiento OPSD permite que el modelo mejore sus propias respuestas comparando sus salidas con las soluciones de referencia, lo que puede potenciar el razonamiento multi-paso.
- Capacidades agénticas: el checkpoint se generó mediante un agente de código, y el propio proceso de entrenamiento está orientado a tareas agénticas (generación de código, resolución de problemas), aunque no se documentan capacidades específicas de tool calling o function calling.
- Multilingüismo: no disponible; depende del modelo base, pero no se especifica.
- Modo de pensamiento (thinking mode): no disponible; no se menciona en la documentación.

## Casos de uso

- Investigación en auto-mejora de modelos: este checkpoint es útil para estudiar cómo evoluciona el rendimiento de un modelo a lo largo de un entrenamiento agéntico. Los investigadores pueden analizar las diferencias entre checkpoints de distintas horas (p. ej., `h071` frente a `h050` o `h090`) para entender la dinámica de la destilación on-policy.
- Reproducción de experimentos OPSD: el repositorio `Agentic-OPSD` proporciona el código para replicar el entrenamiento; este checkpoint sirve como punto de referencia para comparar resultados.
- Análisis de la influencia del token EOS: la model card advierte que algunos checkpoints carecen del token `<|im_end|>` (248046), lo que provoca que el modelo no detenga la generación al final de un turno. Este checkpoint sí lo incluye, por lo que puede usarse para estudiar el impacto de este token en la calidad de las respuestas.
- Desarrollo de pipelines de auto-parcheo: el identificador `self-patch` sugiere que el modelo se utiliza para corregir sus propios errores; este checkpoint puede servir como base para experimentos de corrección automática de código.
- Evaluación de modelos intermedios: al ser un checkpoint intermedio, permite medir la velocidad de convergencia del entrenamiento y comparar el rendimiento en diferentes fases del run.
- Benchmarking de técnicas de destilación: comparar este checkpoint con otros entrenados mediante SDAR (Self-Distilled Agentic Reinforcement Learning) u otras variantes puede ayudar a determinar qué método de auto-mejora es más eficaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. El autor solo indica que es la "mejor celda del barrido", pero sin datos numéricos que lo respalden. No se pueden comparar cifras con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros, en precisión fp16 (formato habitual de safetensors) se necesitan aproximadamente 18,8 GB de VRAM. Con cuantización de 8 bits, unos 9,4 GB; con 4 bits, unos 4,7 GB. Estas cifras son estimaciones teóricas, ya que no se han publicado requisitos oficiales.
- GPU recomendadas: para fp16, una GPU con 24 GB de VRAM (p. ej., RTX 3090, RTX 4090, A10G) es suficiente. Para cuantización de 8 bits, una GPU de 12 GB (p. ej., RTX 3060, RTX 4070) podría bastar. Para 4 bits, una GPU de 8 GB (p. ej., RTX 3070) sería viable.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPU de consumo con cuantización, aunque la calidad puede degradarse ligeramente.
- Opciones de despliegue: al ser un checkpoint de investigación, no se han publicado configuraciones específicas para vLLM, llama.cpp u Ollama. Sin embargo, al estar en formato safetensors y basarse en Qwen, podría cargarse con frameworks estándar como Transformers, vLLM o TGI, siempre que se respete la plantilla de chat de Qwen3.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high.h071 (este) | 9,4B | no disponible | no disponible | HuggingFace (checkpoint) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (típicamente 128k en Qwen3) | no disponible | HuggingFace |
| Qwen/Qwen3-8B-Base | 8B | 32k (típico) | Apache 2.0 (Qwen3) | HuggingFace |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parámetros y disponibilidad. El modelo base Qwen3.5-9B-Base es la referencia natural, pero no se han publicado métricas de este checkpoint frente a su base.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Fue extraído a la hora 71 de un run de 100 horas, por lo que su rendimiento puede ser inferior al de checkpoints posteriores o al del modelo final.
- Sin evaluación publicada: no hay benchmarks ni métricas de calidad. No se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Riesgo de alucinación: al ser un modelo base sin ajuste fino por instrucciones (no se menciona RLHF ni DPO), puede generar respuestas incoherentes o inventadas, especialmente en tareas abiertas.
- Dependencia del token EOS: la model card advierte que algunos checkpoints del sweep no incluyen el token `<|im_end|>`, lo que provoca que el modelo no detenga la generación y desborde el contexto. Este checkpoint sí lo incluye, pero es un riesgo a tener en cuenta en otros checkpoints del mismo barrido.
- Licencia y uso comercial: la licencia no está especificada. No se puede garantizar que el modelo sea utilizable en proyectos comerciales.
- Sesgos: no se han documentado sesgos específicos, pero al derivar de Qwen3.5-9B-Base, puede heredar los sesgos del modelo base, que no se detallan en la información disponible.
- Reproducibilidad: el entrenamiento fue dirigido por un agente de IA (Codex / gpt-5.6-sol), lo que introduce cierta aleatoriedad. Los resultados pueden no ser totalmente reproducibles sin el entorno exacto del run.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h071.opsd-self-patch-tb1reg.step_1
- Repositorio Agentic-OPSD (GitHub): https://github.com/EcthelionLiu/Agentic-OPSD
- Paper SDAR (Self-Distilled Agentic Reinforcement Learning): https://arxiv.org/abs/2605.15155
- Artículo sobre GPT-5.6 SOL y jailbreaks: https://www.penligent.ai/hackinglabs/gpt-5-6-sol-jailbreaks/
- Informe sobre amenazas agénticas de IA: https://securityboulevard.com/2026/08/the-agentic-ai-threat-cluster-seven-incidents-three-actors-and-what-they-mean-for-your-exposure/
- Página oficial de GPT-5.6: https://openai.com/index/gpt-5-6/
