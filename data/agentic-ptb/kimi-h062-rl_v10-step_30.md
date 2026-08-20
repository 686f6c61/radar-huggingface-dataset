# agentic-ptb/kimi.h062.rl_v10.step_30

## Resumen

El modelo `agentic-ptb/kimi.h062.rl_v10.step_30` es un checkpoint intermedio del experimento de entrenamiento por refuerzo (RL) denominado AgentPTB, desarrollado por el equipo `agentic-ptb`. Se trata de un punto de control guardado a las 63,81 horas de una corrida de 100 horas, correspondiente a la celda `kimi` del barrido, que utiliza el driver `kimi-code / kimi-k3` con un nivel de razonamiento `high`. El modelo base es `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de aproximadamente 9.400 millones de parámetros.

Este checkpoint no es un modelo final listo para producción, sino una instantánea de investigación para estudiar la dinámica del entrenamiento por refuerzo en tareas de codificación y agentes. Su relevancia radica en que permite a investigadores y desarrolladores analizar la evolución del rendimiento a lo largo del tiempo de entrenamiento, así como comparar checkpoints dentro del mismo barrido. La model card advierte explícitamente de una anomalía en el token de fin de secuencia (`eos_token_id`), lo que afecta a la interpretación de cualquier evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.400 millones de parámetros. No se dispone de detalles adicionales sobre la configuración interna (número de capas, dimensiones de atención, etc.) en la información proporcionada. El entrenamiento consiste en un proceso de refuerzo (RL) sobre el modelo base, utilizando el driver `kimi-code / kimi-k3` con un esfuerzo de razonamiento alto. El experimento forma parte de un barrido de 100 horas, y este checkpoint se guardó a las 63,81 horas. No se especifican los datos de entrenamiento, el método exacto de RL (p. ej., PPO, GRPO) ni si se aplicaron técnicas como RLHF o DPO.

Una característica técnica destacable es la advertencia sobre el `eos_token_id`: el checkpoint solo incluye el token `248044` y carece del token `248046` (`<|im_end|>`), que es el que la plantilla de chat de Qwen3.5 utiliza para finalizar cada turno del asistente. Esto implica que el modelo no se detiene correctamente al final de un turno y puede sobrepasar la ventana de contexto, lo que invalida las métricas de evaluación como mediciones absolutas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se documentan capacidades específicas adicionales.
- Codificación y tareas de agente: el driver `kimi-code / kimi-k3` sugiere un enfoque en generación de código y razonamiento agéntico, pero no hay métricas publicadas que confirmen el rendimiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el nombre del driver sugiere orientación a agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en dinámicas de RL: este checkpoint permite estudiar cómo evoluciona el rendimiento de un modelo de 9B durante el entrenamiento por refuerzo, comparándolo con otros checkpoints del mismo barrido (p. ej., `step_20`, `step_40`) para trazar curvas de aprendizaje.
- Análisis de estabilidad del entrenamiento: al ser un punto intermedio, se puede examinar si el modelo presenta signos de sobreajuste, colapso de política o inestabilidad en las recompensas.
- Evaluación de la influencia del token EOS: la ausencia del token `<|im_end|>` permite investigar el impacto de la terminación de secuencia en tareas de generación de código y diálogo multi-turno.
- Comparación de drivers de RL: al pertenecer a la celda `kimi` con el driver `kimi-code / kimi-k3`, se puede contrastar su comportamiento con otras celdas del barrido que usen drivers diferentes.
- Reproducción de experimentos: investigadores que quieran replicar o extender el trabajo de AgentPTB pueden utilizar este checkpoint como referencia para sus propios entrenamientos.
- Desarrollo de pipelines de evaluación intermedia: aunque no es apto para producción, puede servir para probar infraestructuras de evaluación que manejen checkpoints con anomalías en los tokens de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que cualquier métrica obtenida con este checkpoint debe considerarse un valor mínimo (floor) y no una medición fiable, debido a la ausencia del token `eos` que provoca que el modelo continúe generando más allá del turno esperado. Por tanto, no se presentan tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 18,8 GB, lo que corresponde a pesos en precisión fp16/bf16. Se necesitan al menos 20 GB de VRAM para cargar el modelo completo en esa precisión.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) sería suficiente para inferencia en fp16. Para entrenamiento o fine-tuning se requeriría mayor capacidad.
- En consumer GPU: con cuantización a 4 bits (no disponible actualmente) cabría en una GPU de 12 GB, pero no se ofrecen archivos GGUF ni AWQ.
- Opciones de despliegue: al ser un checkpoint de investigación, se recomienda usar frameworks como vLLM, Hugging Face Transformers o TGI para cargar los safetensors. No hay soporte nativo en Ollama ni llama.cpp sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este checkpoint no tiene modelos directamente comparables, ya que es una instantánea de un experimento de RL sobre un base específico. La comparación natural sería contra el propio `Qwen/Qwen3.5-9B-Base` o contra otros checkpoints del mismo barrido, pero no se dispone de datos de rendimiento publicados.

## Limitaciones y advertencias

- Token EOS incompleto: el checkpoint carece del token `<|im_end|>` (248046), por lo que no detiene la generación al final de un turno y puede agotar la ventana de contexto. Cualquier evaluación debe interpretarse como un límite inferior.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores o al del modelo base.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no documentados: se desconoce el soporte multilingüe real, aunque el base Qwen3.5 suele ser multilingüe.
- Riesgo de alucinación y sesgos: no hay información específica, pero al ser un modelo entrenado con RL sobre código, puede presentar sesgos en tareas de razonamiento o generar código incorrecto.
- No apto para producción: debido a la anomalía del EOS y a su naturaleza experimental, no se recomienda su uso en aplicaciones reales sin un reempaquetado y evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h062.rl_v10.step_30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Paper de referencia sobre Kimi K2 (contexto del driver, no el mismo modelo): https://arxiv.org/pdf/2507.20534v2
