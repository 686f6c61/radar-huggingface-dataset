# agentic-ptb/sol-high.h018.maxrl-frontier-midpoint

## Resumen

El modelo `agentic-ptb/sol-high.maxrl-frontier-midpoint` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB. Según la model card, este checkpoint corresponde a la celda `sol-high` del barrido, generado con el driver Codex / gpt-5.6-sol con un esfuerzo de razonamiento `high`, y está marcado como la mejor celda del barrido.

El modelo está pensado como un punto intermedio en la frontera de entrenamiento (maxrl-frontier-midpoint) y no como un modelo final listo para producción. La model card advierte que los checkpoints que no incluyen el token `<|im_end|>` (248046) pueden sobrepasar la ventana de contexto, pero este checkpoint sí lo incluye correctamente, lo que lo hace evaluable de forma fiable. Su relevancia radica en ser un artefacto de investigación para estudiar la dinámica de entrenamiento con refuerzo en modelos de razonamiento, más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el repositorio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Al estar basado en Qwen/Qwen3.5-9B-Base, se presume que hereda la arquitectura de dicho modelo base, pero no se confirma en la documentación proporcionada. El entrenamiento se enmarca en el proyecto AgentPTB, un barrido de ajuste fino con refuerzo (maxrl) donde el driver es Codex / gpt-5.6-sol con un esfuerzo de razonamiento `high`. El checkpoint se denomina `maxrl-frontier-midpoint`, lo que sugiere que es un punto intermedio en la frontera de entrenamiento, no un modelo final. No se especifican datos sobre el dataset, número de tokens de entrenamiento ni técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Dado que es un modelo intermedio de un barrido de investigación, no se publican listas de capacidades. Se espera que herede las capacidades del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, código, etc.), pero no hay confirmación oficial. La model card solo menciona la corrección del token de fin de secuencia, lo que garantiza que el modelo detiene correctamente sus respuestas.

## Casos de uso

Al ser un checkpoint intermedio de investigación, no se recomienda su uso en producción. Los casos de uso son principalmente de investigación y análisis:

- Estudio de la dinámica de entrenamiento con refuerzo en modelos de razonamiento: permite comparar la evolución de las métricas a lo largo del barrido.
- Evaluación de la calidad de los checkpoints intermedios frente a los finales: útil para entender cuándo el entrenamiento alcanza un buen equilibrio.
- Reproducción de experimentos del proyecto AgentPTB: sirve como referencia para otros investigadores que quieran replicar o extender el barrido.
- Análisis de la influencia del token de fin de secuencia en la generación: la model card destaca la importancia de este detalle técnico.
- Benchmarking de modelos de 9B parámetros en tareas de razonamiento: aunque no hay datos publicados, el modelo puede ser evaluado por terceros.
- Desarrollo de técnicas de alineación o ajuste fino a partir de checkpoints intermedios: útil para estudiar la transferencia de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación y no se encontraron referencias externas con datos de rendimiento para este checkpoint concreto.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este modelo. Dado su tamaño de 9.409.813.744 parámetros y 18,8 GB de pesos en safetensors, se puede estimar:

- VRAM estimada para inferencia: al menos 20-24 GB en FP16 (dependiendo de la longitud de contexto y el batch), o menos con cuantización (por ejemplo, 8-10 GB en 4-bit).
- GPU recomendadas: tarjetas con 24 GB o más (RTX 3090/4090, A100, etc.) para FP16; GPUs de 8-12 GB pueden ser suficientes con cuantización.
- Si cabe en consumer GPU: sí, con cuantización (GGUF o AWQ) en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otros, siempre que se conviertan los pesos al formato adecuado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos. El modelo base Qwen/Qwen3.5-9B-Base es la referencia más cercana, pero no se han publicado métricas comparativas. Tampoco se conocen otros checkpoints del mismo barrido con los que comparar de forma fiable.

## Limitaciones y advertencias

- Modelo intermedio de investigación: no está pensado para uso en producción ni para tareas reales sin un proceso de evaluación y alineación adicional.
- Sin documentación de sesgos ni alucinaciones: no se ha publicado ningún análisis de sesgos o riesgos de alucinación.
- Licencia desconocida: no se especifica la licencia, por lo que no se puede garantizar su uso comercial.
- Dependencia del modelo base: las limitaciones de Qwen3.5-9B-Base (idiomas, contexto, sesgos) se aplican probablemente a este checkpoint, pero no se confirma.
- Token de fin de secuencia correcto: aunque es una ventaja, la model card advierte que otros checkpoints del barrido pueden no tenerlo, lo que invalida comparaciones directas.
- Sin garantías de reproducibilidad: al ser un artefacto de un barrido, puede no ser totalmente reproducible sin la configuración exacta del entrenamiento.

## Enlaces

- [HuggingFace: agentic-ptb/sol-high.maxrl-frontier-midpoint](https://huggingface.co/agentic-ptb/sol-high.maxrl-frontier-midpoint)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
