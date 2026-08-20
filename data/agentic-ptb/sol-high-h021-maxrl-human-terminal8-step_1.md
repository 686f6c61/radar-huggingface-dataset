# agentic-ptb/sol-high.h021.maxrl-human-terminal8.step_1

## Resumen

Este modelo es un checkpoint intermedio de un barrido (sweep) de entrenamiento con aprendizaje por refuerzo (RL) realizado por el equipo de AgentPTB. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y está etiquetado como `sol-high` dentro del experimento `maxrl-human-terminal8`. El nombre sugiere que el entrenamiento utilizó un entorno de terminal humano como señal de recompensa, probablemente para tareas de agente o codificación.

El checkpoint corresponde al paso 1 de entrenamiento y se describe como "intermedio" en la model card, con la nota de que es la "mejor celda del barrido" (best cell in the sweep). Fue generado por un driver basado en Codex / gpt-5.6-sol con un esfuerzo de razonamiento alto. Al ser un artefacto de investigación, no está pensado para uso directo en producción, sino para análisis de experimentos y comparación de checkpoints dentro del mismo barrido.

La relevancia de este modelo radica en que documenta un punto concreto de un proceso de RL sobre una base de Qwen3.5, lo que puede interesar a investigadores que estudian dinámicas de entrenamiento, curvas de recompensa o el efecto de distintos entornos de terminal en el comportamiento del agente. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base Qwen/Qwen3.5-9B-Base, que a su vez es un transformer de 9,4 mil millones de parámetros. El entrenamiento se realizó mediante aprendizaje por refuerzo, como indica el nombre del experimento `maxrl-human-terminal8`, probablemente usando un entorno de terminal humano como fuente de recompensa. El checkpoint corresponde al paso 1 de un barrido más amplio, con 4 shards y un tamaño total de 18,8 GB.

La model card indica que el token de fin de secuencia (eos_token_id) es `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token que la plantilla de chat de Qwen3.5 usa para terminar cada turno de asistente. Esto es relevante porque los checkpoints que carecen de este token no se detienen correctamente al final del turno y sobrepasan la ventana de contexto, lo que invalida las métricas de evaluación. En este caso, el eos está correctamente configurado.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá del propio esquema de RL.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint en la información disponible.
- Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay confirmación explícita.
- El entrenamiento con RL en un entorno de terminal humano sugiere un enfoque en tareas de agente o codificación, pero no hay evidencia concreta de tool calling, agentes o razonamiento multi-paso.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Investigación en dinámicas de RL: este checkpoint puede usarse para estudiar cómo evoluciona el comportamiento del modelo a lo largo del entrenamiento, comparándolo con otros pasos del mismo barrido.
- Análisis de curvas de recompensa: al ser un paso intermedio, permite trazar la progresión de la señal de recompensa en el entorno `maxrl-human-terminal8`.
- Reproducción de experimentos: los investigadores pueden cargar este checkpoint para reproducir o extender los resultados del barrido de AgentPTB.
- Evaluación de checkpoints intermedios: sirve como referencia para medir el impacto de distintos hiperparámetros o configuraciones de RL en el rendimiento final.
- Estudio de alucinación y comportamiento de fin de secuencia: la configuración correcta del eos permite analizar si el modelo detiene sus respuestas adecuadamente en tareas de agente.
- Desarrollo de pipelines de RL: puede usarse como punto de partida para continuar el entrenamiento o para probar nuevas estrategias de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Además, al ser un checkpoint intermedio, cualquier evaluación debería compararse solo con otros checkpoints del mismo barrido que tengan la misma configuración de eos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM solo para los pesos. Con cuantización a 8 bits, unos 10 GB; a 4 bits, unos 5 GB. Sin embargo, no se proporcionan cuantizaciones oficiales en el repo.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB). Para cuantización 4 bits, una GPU de 8-12 GB podría ser suficiente, pero no hay archivos GGUF ni AWQ disponibles.
- Si cabe en consumer GPU: sí, con cuantización, pero no se ofrecen versiones cuantizadas en el repo.
- Opciones de despliegue: al ser un checkpoint de safetensors, puede cargarse con transformers, vLLM, TGI u otros frameworks que soporten modelos de Qwen. No hay soporte nativo para llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de la misma categoría. Al ser un artefacto de investigación intermedio, no hay modelos comparables directos. La única referencia posible es el modelo base Qwen/Qwen3.5-9B-Base, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final. Su rendimiento puede ser inferior al de un modelo entrenado hasta convergencia.
- No se especifica licencia, por lo que el uso comercial es incierto y debe consultarse con el autor.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El entrenamiento con RL en un entorno de terminal humano puede inducir comportamientos específicos de ese entorno que no generalicen bien a otros dominios.
- La model card advierte que los checkpoints sin el eos correcto sobrepasan la ventana de contexto; este checkpoint lo tiene correcto, pero es una advertencia general para el barrido.
- No hay garantías de que el modelo funcione correctamente fuera del contexto de investigación para el que fue creado.

## Enlaces

- [HuggingFace - agentic-ptb/sol-high.h021.maxrl-human-terminal8.step_1](https://huggingface.co/agentic-ptb/sol-high.h021.maxrl-human-terminal8.step_1)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
