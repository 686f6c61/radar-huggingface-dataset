# agentic-ptb/grok.h048.rl-r2e4.step_50

## Resumen

Este modelo es un checkpoint intermedio de un experimento de investigación denominado AgentPTB, publicado por el usuario agentic-ptb. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con aproximadamente 9.400 millones de parámetros, orientado a tareas de razonamiento con un nivel de esfuerzo "xhigh". El identificador del repositorio indica que corresponde a la hora 48 de un run de 100 horas y a un paso de entrenamiento con refuerzo (RL), aunque la model card incluida hace referencia a otro checkpoint (h034, SFT-LoRA, step 150), lo que sugiere inconsistencias en el empaquetado.

El modelo está disponible únicamente en formato safetensors (4 shards, 18,8 GB) y no se especifican licencia, idiomas ni pipeline. Su relevancia es principalmente metodológica: documenta el progreso de un sweep de entrenamiento sobre una base Qwen3.5, pero presenta un defecto conocido en el token de fin de secuencia que impide su uso directo en producción o en evaluaciones estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-9B-Base, que emplea una arquitectura transformer estándar. Según la model card, el entrenamiento se realizó dentro de un sweep de AgentPTB con el driver "pi / grok-4.6" y un nivel de razonamiento "xhigh". El checkpoint fue escrito a las 34,97 horas de un run de 100 horas (según la model card) o a la hora 48 (según el ID del repositorio), y el path interno indica un paso de SFT-LoRA (step 150). No se proporcionan detalles sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La librería declarada es "grok", probablemente un framework interno de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, que incluyen generación de texto, razonamiento y comprensión del lenguaje.
- Razonamiento con esfuerzo alto: el entrenamiento se configuró con "reasoning effort xhigh", lo que sugiere una optimización para tareas de razonamiento complejo.
- Soporte de tool calling y agentes: no hay información específica para este checkpoint; dependería de las capacidades del modelo base.
- Capacidades multilingües: no disponibles para este checkpoint.
- Limitación funcional: el token `<|im_end|>` (id 248046) no está incluido en la configuración de eos, por lo que el modelo no detiene correctamente las respuestas y tiende a sobrepasar la ventana de contexto.

## Casos de uso

- Investigación en curvas de entrenamiento: permite analizar la evolución del rendimiento a lo largo de un sweep de RL/SFT, comparando checkpoints de distintas horas del mismo run.
- Estudio de defectos de empaquetado: útil para investigar el impacto de la ausencia del token de fin de secuencia en la generación y en las métricas de evaluación.
- Reproducción de experimentos: sirve como referencia para reproducir o extender el pipeline AgentPTB sobre Qwen3.5-9B-Base.
- Desarrollo de pipelines de fine-tune: puede usarse como ejemplo de checkpoint intermedio en documentación técnica sobre entrenamiento con refuerzo.
- Evaluación de robustez: permite estudiar cómo se comporta un modelo sin terminación correcta en tareas de generación larga.
- No recomendado para producción: debido al defecto de eos y la ausencia de licencia, no es adecuado para aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "piso, no una medición" debido al defecto de empaquetado del token de fin de secuencia.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~9,4B parámetros en BF16, se necesitan aproximadamente 19-20 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits se podría reducir a ~10 GB, y a 4 bits a ~5-6 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de VRAM para inferencia en BF16 sin cuantizar.
- Compatibilidad con GPUs de consumo: una RTX 3090 o 4090 podría ejecutar el modelo en BF16 con suficiente VRAM, pero el defecto de eos hace que la generación sea inestable.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un checkpoint intermedio sin empaquetado estándar, requeriría reempaquetado manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h048.rl-r2e4.step_50 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no especificado | Apache 2.0 (presumible) | HuggingFace |
| Otros fine-tunes de Qwen3.5-9B | ~9,4B | variable | variable | variable |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. El modelo base Qwen3.5-9B-Base es la referencia natural, pero este checkpoint no incluye evaluaciones propias.

## Limitaciones y advertencias

- Defecto de empaquetado de eos: falta el token `<|im_end|>` (id 248046), por lo que el modelo no termina las respuestas y sobrepasa la ventana de contexto. Esto invalida cualquier evaluación estándar.
- Inconsistencia en la documentación: la model card describe un checkpoint distinto (h034, SFT-LoRA, step 150) al del ID del repositorio (h048, RL, step 50), lo que genera confusión sobre el contenido real.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o derivado sin autorización explícita.
- Sin benchmarks ni evaluaciones: no hay datos de rendimiento publicados.
- Checkpoint intermedio: no es un modelo final; forma parte de un sweep experimental y no está optimizado para despliegue.
- Riesgo de alucinación y sesgos: no se han documentado, pero al derivar de Qwen3.5-9B-Base, hereda los sesgos potenciales del modelo base.
- No apto para producción: por las limitaciones anteriores, no debe usarse en aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h048.rl-r2e4.step_50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): agentic-ptb/INDEX (no se ha verificado su disponibilidad)
