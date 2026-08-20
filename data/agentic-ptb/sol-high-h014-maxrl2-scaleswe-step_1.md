# agentic-ptb/sol-high.h014.maxrl2-scaleswe.step_1

## Resumen

`agentic-ptb/sol-high.h014.maxrl2-scaleswe.step_1` es un checkpoint intermedio del sweep de entrenamiento AgentPTB, desarrollado por el autor `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre del repositorio codifica su posición en el experimento: `sol-high` indica la celda del sweep, `h014` la hora 14,84 de una ejecución de 100 horas, y `step_1` el paso de guardado. Según la model card, es el mejor checkpoint de su celda dentro del barrido.

Este modelo no está pensado como un artefacto final para producción, sino como un punto de observación dentro de un proceso de investigación sobre entrenamiento con refuerzo (el sufijo `maxrl2` sugiere una segunda ronda de RL) y escalado de datos (`scaleswe`). Su relevancia radica en que permite estudiar la dinámica de convergencia y la evolución de capacidades a lo largo del tiempo de entrenamiento, algo útil para quienes investigan metodologías de alineación y optimización. Al ser un checkpoint intermedio, carece de garantías de calidad o estabilidad para uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura transformer. No se dispone de detalles adicionales sobre la configuración interna (número de capas, heads, etc.) más allá de los parámetros totales. El entrenamiento forma parte de un sweep denominado AgentPTB, dirigido por un modelo `Codex / gpt-5.6-sol` con esfuerzo de razonamiento `high`. El sufijo `maxrl2` indica que se aplicó una segunda fase de optimización con aprendizaje por refuerzo, y `scaleswe` sugiere un barrido sobre la escala de datos o recursos. No se han publicado datos sobre el dataset utilizado, número de tokens de entrenamiento, ni detalles sobre el algoritmo de RL (PPO, GRPO, etc.). El checkpoint incluye los tokens `eos_token_id` `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token de fin de turno del template de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas.

## Capacidades

- Al ser un fine-tuning de Qwen3.5-9B-Base, hereda las capacidades generales del modelo base: generación de texto, razonamiento, código y matemáticas, aunque no se han verificado específicamente en este checkpoint.
- Soporte de chat mediante el template de Qwen3.5 (con `<|im_end|>` como token de fin de turno).
- No se dispone de información sobre tool calling, function calling, capacidades multimodales o modos de razonamiento extendido.
- Al ser un checkpoint intermedio, las capacidades pueden estar incompletas o degradadas respecto al modelo final del sweep.

## Casos de uso

- Investigación en dinámica de entrenamiento: permite analizar cómo evolucionan las métricas de rendimiento a lo largo de las horas de entrenamiento, comparando checkpoints de la misma celda o entre celdas.
- Estudio de métodos de RL: al ser parte de un sweep con `maxrl2`, sirve para evaluar el efecto de la segunda fase de refuerzo en la estabilidad y calidad de las respuestas.
- Reproducción de experimentos: investigadores pueden descargar este checkpoint para reproducir los resultados del sweep AgentPTB o para continuar el entrenamiento desde este punto.
- Análisis de tokenización y fin de secuencia: el manejo correcto de `eos_token_id` lo hace útil para probar pipelines de generación que dependen de una detención limpia.
- Benchmarking de checkpoints intermedios: se puede usar para medir la correlación entre el tiempo de entrenamiento y el rendimiento en tareas específicas.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código en entornos reales u otros escenarios donde se requiera un modelo estable y validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Tampoco se encontraron referencias externas con evaluaciones de este checkpoint concreto.

## Requisitos de hardware

- Tamaño del repo: 18,8 GB en safetensors (4 shards), lo que implica que en FP16 el modelo ocupa aproximadamente 18,8 GB en VRAM.
- Para inferencia en FP16 se necesitaría una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB o superior).
- Con cuantización a 8 bits, el requisito bajaría a unos 10 GB; con 4 bits, a unos 5 GB, aunque no se han publicado archivos GGUF ni AWQ en el repositorio.
- Opciones de despliegue: al ser un modelo estándar de safetensors, puede cargarse con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se proporcionan configuraciones optimizadas.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado métricas comparativas entre ambos. Tampoco se conocen otros checkpoints del mismo sweep con los que contrastar. Por tanto, la comparativa se limita a señalar que este checkpoint es un fine-tuning intermedio del base, con los mismos parámetros y arquitectura, pero sin garantías de rendimiento superior.

## Limitaciones y advertencias

- Es un checkpoint intermedio (hora 14,84 de 100), no un modelo final. Puede presentar inestabilidad, respuestas incoherentes o falta de convergencia en ciertas tareas.
- No se especifica licencia, por lo que su uso comercial o redistribución está sujeto a la licencia del modelo base Qwen3.5-9B-Base (que debe consultarse por separado).
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas. Al ser un fine-tuning del base, hereda los riesgos típicos de los LLM: generación de información falsa, sesgos de los datos de entrenamiento, etc.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La model card advierte que los checkpoints sin el token `eos` correcto pueden sobrepasar la ventana de contexto; este checkpoint sí lo incluye, pero no se garantiza que otros checkpoints del sweep lo tengan.
- No se recomienda su uso en producción sin una evaluación exhaustiva y un proceso de fine-tuning adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h014.maxrl2-scaleswe.step_1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card como `agentic-ptb/INDEX`): no se ha encontrado una URL directa.
