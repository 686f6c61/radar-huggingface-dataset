# agentic-ptb/kimi.h044.rl_v8.step_10

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento de entrenamiento por refuerzo (RL) denominado AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4B) derivado de `Qwen/Qwen3.5-9B-Base`, sobre el que se ha aplicado un proceso de RL (sweep `rl_v8`) orientado a mejorar capacidades agénticas y de codificación. El nombre "kimi" en el identificador hace referencia a la celda de entrenamiento dentro del sweep, no al modelo Kimi de Moonshot AI.

El checkpoint corresponde a la hora 44 de una ejecución de 100 horas (h044) y al paso 10 del entrenamiento. Su rol es intermedio, es decir, no es un modelo final sino una instantánea para trazar la curva de rendimiento a lo largo del tiempo. La model card advierte de un problema crítico: el `eos_token_id` no incluye el token `<|im_end|>` (248046), lo que provoca que el modelo no detenga la generación al final de un turno y sobrepase la ventana de contexto. Por tanto, cualquier evaluación realizada sobre este checkpoint debe interpretarse como un límite inferior, no como una medida real de calidad.

Dado que es un artefacto de investigación, no está pensado para uso en producción. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4B parámetros de la familia Qwen3.5. Sobre esta base se ha aplicado un proceso de aprendizaje por refuerzo (RL) denominado `rl_v8`, dentro de un barrido de hiperparámetros (sweep) de 100 horas de duración. El driver del entrenamiento es `kimi-code / kimi-k3` con un nivel de razonamiento (`reasoning effort`) alto. El checkpoint se guardó a las 44 horas de ejecución (h044) en el paso 10, con 4 shards y un tamaño total de 18,8 GB.

No se han publicado detalles sobre el dataset de entrenamiento, la composición de las recompensas ni las técnicas específicas de RL empleadas (p. ej., PPO, GRPO, etc.). Tampoco se indica si hubo fases previas de fine-tuning supervisado (SFT) o si el RL se aplicó directamente sobre el modelo base.

## Capacidades

No se dispone de una lista oficial de capacidades para este checkpoint. Al derivar de Qwen3.5-9B-Base, es razonable esperar que herede las capacidades generales de dicha familia (generación de texto, razonamiento, código, matemáticas), pero no hay confirmación en la información proporcionada. El entrenamiento con RL orientado a tareas agénticas sugiere un refuerzo en habilidades de uso de herramientas y razonamiento multi-paso, aunque no se documenta explícitamente.

## Casos de uso

Dado su carácter de checkpoint intermedio de investigación, no se recomienda su uso en aplicaciones prácticas. Los casos de uso plausibles son:

- Evaluación de curvas de entrenamiento: permite trazar la evolución del rendimiento a lo largo del tiempo dentro del sweep, comparándolo con otros checkpoints de la misma celda.
- Análisis de dinámicas de RL: estudiar cómo cambia el comportamiento del modelo en función del paso de entrenamiento y del esfuerzo de razonamiento configurado.
- Reproducción de experimentos: sirve como punto de referencia para reproducir o extender el trabajo de AgentPTB.
- Investigación sobre alucinación y control de fin de secuencia: el problema del `eos_token_id` lo convierte en un caso de estudio sobre los efectos de una tokenización incompleta en la generación.
- Desarrollo de técnicas de re-empaquetado: la model card sugiere que es posible re-empaquetar el checkpoint para corregir el token de fin de secuencia, lo que podría interesar a quienes trabajan en pipelines de post-procesado.
- Comparación de checkpoints intermedios: útil para quienes estudian la relación entre horas de entrenamiento y calidad del modelo en tareas agénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los números de evaluación de este checkpoint son un "suelo" (floor) debido al problema del `eos_token_id`, pero no proporciona cifras concretas. No se debe asumir ningún valor de rendimiento sin verificación.

## Requisitos de hardware

- VRAM estimada: con los pesos en FP16/BF16 (18,8 GB), se necesitan al menos 24 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits (~9,4 GB) podría caber en GPUs de 12-16 GB, y a 4 bits (~4,7 GB) en GPUs de 8 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una RTX 3090/4090 (24 GB) o una A10G (24 GB) serían suficientes. Para cuantización, una RTX 4070 (12 GB) o similar podría ser viable.
- Opciones de despliegue: al no haber archivos GGUF ni AWQ, el despliegue requeriría convertir los pesos o usar frameworks que acepten safetensors directamente (p. ej., vLLM, Hugging Face Transformers). No se ha probado con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint es un artefacto intermedio de un experimento específico, no un modelo final comparable con alternativas comerciales o de código abierto. La única referencia directa sería el propio `Qwen/Qwen3.5-9B-Base`, del que deriva, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- El `eos_token_id` está incompleto: falta el token `<|im_end|>` (248046), lo que provoca que el modelo no detenga la generación al final de un turno y sobrepase la ventana de contexto. Esto invalida cualquier evaluación directa y requiere re-empaquetado antes de su uso.
- Es un checkpoint intermedio, no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- No se especifica licencia, por lo que no está claro si es utilizable comercialmente.
- No hay documentación sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La model card contiene una discrepancia: el nombre del repo indica `h044` y `step_10`, pero el README menciona `h047` y `step_30`. Esto sugiere que la model card puede ser genérica o estar desactualizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h044.rl_v8.step_10
- Paper de Kimi K2 (referencia del nombre, no del modelo): https://arxiv.org/pdf/2507.20534v2
- Página de Kimi K3 (referencia del nombre, no del modelo): https://www.kimi.com/en
- Página de Moonshot AI (referencia del nombre, no del modelo): https://www.moonshot.ai/
