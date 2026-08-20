# agentic-ptb/grok.h034.sft-lora.step_75

## Resumen

Este repositorio contiene un checkpoint intermedio de un barrido de hiperparámetros (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning con LoRA (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9.400 millones de parámetros. El identificador del repo (`grok.h034.sft-lora.step_75`) indica que corresponde a la celda de experimento `grok`, a la hora 34 de una ejecución de 100 horas, y al paso 75 del entrenamiento.

La model card incluida en el repositorio describe un checkpoint diferente (`grok.h062.sft-solved.step_40`), lo que sugiere que el README no corresponde exactamente a este artefacto. Aun así, ambos comparten el mismo esquema de experimento: driver `pi / grok-4.6` con esfuerzo de razonamiento `xhigh`. Un defecto conocido en todos los checkpoints de este sweep es la ausencia del token `eos` `248046` (`<|im_end|>`), lo que impide que el modelo detenga correctamente sus turnos de asistente y provoca que sobrepase la ventana de contexto. Por tanto, este modelo no es apto para uso en producción sin un reempaquetado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-9B-Base soporta 128 K, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (hereda del modelo base, no se indica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó un fine-tuning con LoRA (bajo el tag `sft-lora`), dentro de un barrido de hiperparámetros gestionado por AgentPTB. El driver del experimento es `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`, lo que sugiere que el entrenamiento se orientó a tareas de razonamiento complejo.

La model card indica que el checkpoint fue escrito a la hora 62 de una ejecución de 100 horas (aunque el repo indica h034), y que el paso de entrenamiento correspondiente es el 40 (el repo indica step_75). No se proporcionan detalles sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica documentada es el defecto de empaquetado del token `eos`: falta el token `248046` (`<|im_end|>`), lo que afecta a todos los checkpoints del sweep y obliga a reempaquetar antes de evaluar o desplegar.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, que incluyen generación autoregresiva de lenguaje natural.
- Razonamiento: el driver `grok-4.6` con esfuerzo `xhigh` sugiere que el fine-tuning se enfocó en mejorar el razonamiento multi-paso, aunque no hay métricas que lo confirmen.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y multi-step reasoning: no documentado específicamente, aunque el esfuerzo de razonamiento alto podría implicar mejoras en este ámbito.
- Capacidades multilingües: no especificadas; se asume que hereda las del modelo base, pero no se confirma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en fine-tuning de LLMs: este checkpoint es útil para estudiar la dinámica de entrenamiento en barridos de hiperparámetros, comparando la evolución de la pérdida y las métricas a lo largo de las horas de ejecución.
- Análisis de defectos de tokenización: el problema del token `eos` ausente permite investigar cómo afecta la terminación de secuencias y el desbordamiento de contexto en modelos de razonamiento.
- Reproducción de experimentos: investigadores que trabajen con AgentPTB pueden usar este checkpoint para reproducir curvas de rendimiento frente al tiempo de entrenamiento.
- Desarrollo de técnicas de reempaquetado: el defecto conocido ofrece un caso práctico para desarrollar utilidades que añadan el token `eos` correcto a checkpoints intermedios.
- Comparación de checkpoints intermedios: permite estudiar cómo varía el comportamiento del modelo en diferentes pasos (step_40 vs step_75) y horas (h034 vs h062) dentro del mismo sweep.
- No recomendado para aplicaciones de producción: debido al defecto de `eos`, cualquier uso en chatbots, generación de código o atención al cliente requeriría primero corregir el empaquetado y validar el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de estos checkpoints son un "suelo, no una medición" debido al defecto del token `eos`, por lo que cualquier comparación con otros modelos sería engañosa sin un reempaquetado previo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~9,4 B parámetros. En FP16, el peso ocupa ~18,8 GB (según el tamaño del repo), por lo que se necesitan al menos 24 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para FP16; A100 (40/80 GB) para mayor margen y velocidad. Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 16 GB, pero no se proporcionan archivos cuantizados en el repo.
- Si cabe en consumer GPU: sí, en GPUs de 24 GB (RTX 3090/4090) con FP16, o en GPUs de 16 GB con cuantización externa (p. ej., mediante llama.cpp o GPTQ).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar safetensors, pero el defecto de `eos` requiere un post-procesado del tokenizador y del modelo antes de servir.
- Latencia y throughput: no disponibles. Dado el tamaño (~9,4 B), en una RTX 4090 se esperaría un throughput de decenas de tokens por segundo, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/grok.h034.sft-lora.step_75 | 9,4 B | No disponible | No disponible | Checkpoint intermedio con defecto de eos |
| Qwen/Qwen3.5-9B-Base | 9,4 B | 128 K (según base) | Apache 2.0 (asumido, no verificado) | Modelo base sin fine-tuning |
| Qwen/Qwen3.5-9B-Instruct | 9,4 B | 128 K (según base) | Apache 2.0 (asumido, no verificado) | Versión instruct del mismo tamaño |

La comparación directa no es posible porque este checkpoint no tiene benchmarks publicados y su defecto de `eos` impide una evaluación fiable. Frente al modelo base, la única diferencia documentada es el fine-tuning con LoRA y el problema de terminación de secuencia.

## Limitaciones y advertencias

- Defecto crítico de token `eos`: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene sus respuestas al final del turno y puede generar texto hasta agotar la ventana de contexto. Esto invalida cualquier uso directo en producción.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido experimental y su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución.
- Sin benchmarks: no hay métricas publicadas que permitan evaluar su calidad en tareas estándar.
- Riesgo de alucinación: no evaluado; al ser un fine-tuning de un modelo base, puede presentar alucinaciones similares a las de otros LLMs de su tamaño.
- Sesgos: no documentados; se heredan del modelo base Qwen3.5-9B-Base, que puede contener sesgos de los datos de preentrenamiento.
- Limitaciones de idioma: no especificadas; se asume que el modelo base soporta múltiples idiomas, pero no se confirma para este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h034.sft-lora.step_75
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
