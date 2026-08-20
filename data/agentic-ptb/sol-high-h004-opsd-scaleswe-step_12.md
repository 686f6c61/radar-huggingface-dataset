# agentic-ptb/sol-high.h004.opsd-scaleswe.step_12

## Resumen

`agentic-ptb/sol-high.h004.opsd-scaleswe.step_12` es un checkpoint intermedio de un barrido (sweep) de entrenamiento con AgentOPSD (On-Policy Self-Distillation) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Lo publica el autor `agentic-ptb` como parte de un experimento de 100 horas de duración, en el que se entrena un modelo con una variante recursiva de destilación auto-supervisada para aprendizaje por refuerzo (RL) agentico. Este checkpoint concreto corresponde a la celda `sol-high` (driver Codex / gpt-5.6-sol con esfuerzo de razonamiento `high`) y se guardó a las 4,21 horas de la ejecución.

Con 9.409.813.744 parámetros (9,4B) y un tamaño de repositorio de 18,8 GB en formato safetensors, el modelo es un punto intermedio de la curva de rendimiento frente al tiempo de entrenamiento. Su relevancia radica en que permite estudiar la dinámica de la destilación on-policy en RL agentico, pero no está pensado para uso en producción: la model card advierte que le falta el token `eos_token_id` 248046 (`<|im_end|>`), por lo que no detiene correctamente los turnos y sobrepasa la ventana de contexto. Los resultados de evaluación de este checkpoint deben considerarse un piso, no una medición fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B-Base (transformer decoder-only, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base` y se entrena con AgentOPSD, una variante de On-Policy Self-Distillation (OPSD) para RL agentico. OPSD entrena un único modelo que actúa como estudiante y profesor a la vez, condicionando en contextos distintos: el estudiante ve solo el problema, mientras que el profesor ve además la solución ground-truth. Se realiza una distribución de coincidencia a nivel de token a lo largo de las trayectorias on-policy del estudiante. AgentOPSD introduce una destilación recursiva que mejora la asignación de crédito en tareas de horizonte largo, superando a GRPO+OPSD, Skill-SD y RLSD en ocho comparaciones agregadas según el paper asociado.

Este checkpoint es un punto intermedio del barrido: se guardó a las 4,21 horas de un run de 100 horas, con la celda `sol-high` (Codex / gpt-5.6-sol con esfuerzo `high`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas adicionales como RLHF o DPO. El repositorio contiene 4 shards de pesos y un tamaño total de 18,8 GB.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se han verificado formalmente en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado; el entrenamiento con AgentOPSD está orientado a RL agentico, pero este checkpoint intermedio no ha sido evaluado para ello.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: ninguna declarada. Advertencia crítica: el `eos_token_id` está incompleto (solo `[248044]`, falta `248046`), por lo que el modelo no genera el token de fin de turno `<|im_end|>` y tiende a sobrepasar la ventana de contexto.

## Casos de uso

- Investigación en RL agentico: analizar la evolución del rendimiento a lo largo del tiempo de entrenamiento comparando este checkpoint con otros del mismo sweep (por ejemplo, horas posteriores).
- Estudio de la dinámica de destilación on-policy: evaluar cómo la distribución de coincidencia a nivel de token afecta a la calidad de las trayectorias generadas en tareas de razonamiento multi-turno.
- Benchmarking de checkpoints intermedios: usar este modelo como referencia para trazar curvas de rendimiento frente a horas de entrenamiento, siempre teniendo en cuenta el problema de eos.
- Re-empaquetado y fine-tuning adicional: corregir el `eos_token_id` y continuar el entrenamiento desde este punto para estudiar la convergencia.
- Análisis de la asignación de crédito: investigar cómo la destilación recursiva mejora la señal de crédito en tareas de horizonte largo, comparando con métodos como GRPO+OPSD o Skill-SD.
- Desarrollo de métodos de auto-supervisión: servir como caso de estudio para implementar y validar variantes de OPSD en entornos de investigación.

No se recomienda su uso en aplicaciones de producción debido al estado incompleto del token de fin de turno y a su naturaleza de checkpoint intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un piso, no una medición, debido a la ausencia del token `eos_token_id` 248046. Cualquier comparación debe hacerse únicamente contra otros checkpoints con el mismo estado de eos, o tras re-empaquetar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, se necesitan aproximadamente 18,8 GB de VRAM (más overhead de activaciones). En cuantización de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 40GB, RTX 4090 24GB, o GPUs con al menos 20 GB de VRAM para FP16. Para cuantización ligera, una RTX 3090 o 4080 podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, 4 bits en una RTX 3060 12GB), pero el problema de eos hace desaconsejable su uso práctico.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el `eos_token_id` antes de servir. Sin esa corrección, la generación no terminará correctamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que se trata de un checkpoint intermedio de un barrido específico con una metodología de entrenamiento particular (AgentOPSD). Podría compararse con el modelo base `Qwen/Qwen3.5-9B-Base` o con otros checkpoints del mismo sweep, pero no se dispone de datos de rendimiento publicados. La información disponible no permite establecer una comparativa fiable.

## Limitaciones y advertencias

- `eos_token_id` incompleto: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Los resultados de evaluación son un piso, no una medición real.
- Checkpoint intermedio: se guardó a las 4,21 horas de un run de 100 horas; no representa el estado final del entrenamiento y puede tener un rendimiento muy inferior al modelo convergido.
- Sin licencia declarada: no se especifica la licencia de uso, lo que genera incertidumbre sobre su uso comercial o de redistribución.
- Sin datos de evaluación fiables: no se han publicado benchmarks ni métricas de calidad, y los que pudieran existir están contaminados por el problema de eos.
- Sesgos y alucinaciones: no evaluados; al ser un checkpoint de investigación, no se ha realizado una auditoría de sesgos ni de riesgos de alucinación.
- Idiomas y contexto: no se especifican idiomas soportados ni la longitud de contexto efectiva, lo que limita su uso en aplicaciones multilingües o de contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h004.opsd-scaleswe.step_12
- Repositorio GitHub Agentic-OPSD: https://github.com/EcthelionLiu/Agentic-OPSD
- Paper AgentOPSD (HTML): https://arxiv.org/html/2608.05987
- Paper AgentOPSD (PDF): https://arxiv.org/pdf/2608.05987
