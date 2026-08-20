# agentic-ptb/grok.h069.sft-mix.step_60

## Resumen

El modelo `agentic-ptb/grok.h069.sft-mix.step_60` es un checkpoint intermedio de un proceso de fine-tuning supervisado (SFT) denominado *AgentPTB sweep*, desarrollado por el usuario `agentic-ptb`. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre del repositorio indica que corresponde a la hora 69 de una ejecución de 100 horas, con un paso de entrenamiento `step_60` y una mezcla de datos (`sft-mix`). La model card interna, sin embargo, menciona `step_80` y una hora de ejecución de 71,16, lo que sugiere una posible discrepancia en el etiquetado.

Este checkpoint no es un modelo final listo para producción, sino una instantánea del progreso de un entrenamiento experimental. Su relevancia radica en que permite estudiar la dinámica de aprendizaje a lo largo del tiempo, comparar etapas intermedias y servir como punto de partida para investigaciones sobre fine-tuning. Presenta un defecto conocido: carece del token de fin de secuencia (`eos_token_id`), lo que impide que el modelo detenga la generación al final de un turno y puede provocar que sobrepase la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medición definitiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de Qwen3.5-9B-Base, presumiblemente transformer decoder-only) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, probablemente FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only de 9,4 mil millones de parámetros. El proceso de entrenamiento forma parte de un *sweep* denominado *AgentPTB*, dirigido por un controlador identificado como `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`. El checkpoint se generó en la hora 71,16 de una ejecución de 100 horas (según la model card), aunque el ID del repositorio indica la hora 69. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni el método exacto (SFT, RLHF, DPO, etc.). La etiqueta `sft-mix` sugiere que se empleó una mezcla de datos para el fine-tuning supervisado, pero no se detallan las proporciones ni la composición.

## Capacidades

- No se ha publicado información específica sobre las capacidades de este checkpoint.
- Al ser un fine-tune de Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, etc.), pero no se ha verificado de forma independiente.
- No se menciona soporte para *tool calling*, agentes, visión, audio ni otras funcionalidades especiales.
- El defecto de `eos_token_id` impide que el modelo termine correctamente las respuestas, lo que limita su uso práctico directo.

## Casos de uso

Dado que se trata de un checkpoint intermedio con un defecto de empaquetado, no es adecuado para aplicaciones en producción. Los casos de uso son principalmente de investigación y desarrollo:

- Análisis de la dinámica de entrenamiento: estudiar cómo evoluciona el rendimiento y el comportamiento del modelo a lo largo de las horas de ejecución, comparando este checkpoint con otros de la misma serie.
- Comparación de etapas intermedias: evaluar la diferencia entre checkpoints (por ejemplo, `h069` vs. `h071`) para entender el efecto del entrenamiento continuado.
- Fine-tuning adicional: utilizar este checkpoint como punto de partida para más entrenamiento, siempre que se corrija el token de fin de secuencia.
- Investigación de la mezcla de datos: analizar el impacto de la estrategia `sft-mix` en el rendimiento del modelo en tareas específicas.
- Reproducción de experimentos: para investigadores que quieran replicar el *sweep* de AgentPTB y validar sus resultados.
- Evaluación de robustez: probar el modelo en tareas de razonamiento o generación para observar su comportamiento en una fase intermedia del entrenamiento, aunque con la advertencia del defecto de `eos`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que, al faltar el token `eos`, las métricas de evaluación son un límite inferior y no deben compararse directamente con otros modelos que sí lo tienen.

## Requisitos de hardware

- El modelo tiene 9.409.813.744 parámetros. En precisión FP16, el tamaño del repositorio es de 18,8 GB, lo que implica un requisito mínimo de VRAM de aproximadamente 19 GB para inferencia.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) pueden alojar el modelo en FP16. GPUs con menos de 19 GB de VRAM no son suficientes sin cuantización.
- No se dispone de información sobre cuantizaciones disponibles (GGUF, INT8, etc.), por lo que no se puede confirmar si cabe en GPUs de consumo más modestas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían ser compatibles, pero no se ha verificado su funcionamiento con este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. A nivel estructural, se puede comparar con el modelo base `Qwen/Qwen3.5-9B-Base` y con otros modelos de tamaño similar como Llama 3.1 8B o Mistral 7B, pero no hay información sobre contexto, licencia ni resultados de benchmarks para este checkpoint. La comparación se limita a parámetros:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h069.sft-mix.step_60 | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K (según documentación oficial) | Llama 3.1 | HuggingFace |

## Limitaciones y advertencias

- Defecto de `eos_token_id`: el modelo no tiene asignado el token de fin de secuencia (`<|im_end|>`), por lo que no detiene la generación al final de un turno y puede sobrepasar la ventana de contexto. Esto invalida su uso directo en aplicaciones conversacionales.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de un modelo completamente entrenado.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial sin una aclaración previa.
- Sin información sobre sesgos o alucinaciones: no se han publicado estudios de sesgo ni de fiabilidad.
- Idiomas no especificados: se desconoce qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base es probable que tenga capacidades multilingües, pero no está confirmado.
- Discrepancia en el etiquetado: el ID del repositorio indica `step_60` y `h069`, mientras que la model card menciona `step_80` y `h71.16`, lo que puede generar confusión al interpretar los resultados.

## Enlaces

- [HuggingFace: agentic-ptb/grok.h069.sft-mix.step_60](https://huggingface.co/agentic-ptb/grok.h069.sft-mix.step_60)
