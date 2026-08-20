# agentic-ptb/kimi.h060.rl_v10.step_20

## Resumen
Este repositorio contiene un checkpoint intermedio de un barrido de entrenamiento con aprendizaje por refuerzo (RL) denominado `rl_v10`, perteneciente al proyecto AgentPTB. El modelo se construye a partir de la base `Qwen/Qwen3.5-9B-Base` y recibe el nombre de celda `kimi`, que hace referencia al driver de entrenamiento `kimi-code / kimi-k3` con un esfuerzo de razonamiento `high`. Es importante destacar que, pese al nombre, no se trata del modelo Kimi de Moonshot AI, sino de un fine-tuning experimental de Qwen3.5-9B-Base.

El checkpoint corresponde a la hora 60 de un run de 100 horas (según el ID del repo) o a la hora 63.81 (según la model card, que apunta a un step distinto). Con 9.409.813.744 parámetros (~9,4B), su tamaño en disco es de 18,8 GB. Su relevancia radica en que permite estudiar la dinámica de un barrido de RL sobre una base de 9B, pero presenta una limitación crítica: le falta el token EOS `248046` (`<|im_end|>`), lo que impide que el modelo detenga la generación al final de un turno y provoca que se desborde la ventana de contexto.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-9B-Base) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9,4B parámetros. El entrenamiento se realiza mediante un barrido de RL (`rl_v10`) gestionado por el framework AgentPTB, con un driver específico (`kimi-code / kimi-k3`) orientado a tareas de código y agente. El checkpoint se guardó en el paso 20 (según el ID del repo) o paso 40 (según la model card), dentro de un run planificado a 100 horas.

La model card advierte de un problema técnico relevante: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que la plantilla de chat de Qwen3.5 utiliza para terminar cada turno del asistente. Esto significa que el modelo no detiene la generación al final del turno y continúa hasta agotar la ventana de contexto, lo que invalida cualquier evaluación estándar de chat o agente sin un re-empaquetado previo.

## Capacidades
- Generación de texto y razonamiento: hereda las capacidades base de Qwen3.5-9B-Base, incluyendo generación de lenguaje natural y razonamiento básico.
- Generación de código: el driver de entrenamiento (`kimi-code / kimi-k3`) está orientado a tareas de programación, por lo que el modelo está optimizado para este dominio.
- Razonamiento multi-paso: el esfuerzo de razonamiento configurado es `high`, lo que sugiere que el entrenamiento busca mejorar la cadena de pensamiento.
- Soporte de tool calling y agentes: no disponible de forma fiable debido a la ausencia del token EOS, que rompe el bucle de conversación agente-herramienta.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso
- Investigación de dinámica de RL: permite analizar cómo evoluciona el rendimiento de un modelo de 9B a lo largo de un barrido de 100 horas, comparando este checkpoint con otros de la misma celda.
- Análisis de curvas de entrenamiento: al estar mapeado en el eje temporal (`h060`), sirve para trazar la mejora progresiva del modelo en tareas de código y agente.
- Evaluación de checkpoints intermedios: útil para estudiar el efecto de la política de RL en etapas tempranas, siempre que se re-empaquete el modelo para añadir el token EOS faltante.
- Fine-tuning posterior: puede servir como punto de partida para un entrenamiento adicional, aunque es preferible usar el checkpoint final del run.
- Comparación de configuraciones: dentro del barrido AgentPTB, permite comparar la celda `kimi` con otras celdas del mismo run.
- No apto para producción: debido al fallo de EOS, no debe desplegarse en aplicaciones reales de chat, agentes o generación de código sin corregir previamente la tokenización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los números de evaluación de este checkpoint son un "suelo" (floor) y no una medición real, debido a la ausencia del token EOS que provoca desbordamiento de contexto. Por tanto, no se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 18,8 GB, lo que sugiere pesos en BF16. La inferencia en BF16 requiere aproximadamente 19-20 GB de VRAM.
- GPU recomendadas: cabe en una RTX 4090 (24 GB) o en una A100 de 40 GB. Para GPUs con menos memoria, sería necesario cuantizar (por ejemplo, 4-bit, que ocuparía unos 6-8 GB).
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede ejecutarlo en BF16, y GPUs de 12-16 GB podrían usarlo con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el problema del token EOS antes de servir el modelo.
- Latencia y throughput: no disponible, al no haberse publicado mediciones y depender de la corrección del EOS.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/kimi.h060.rl_v10.step_20 | 9,4B | no disponible | no disponible | Checkpoint intermedio de RL sobre Qwen3.5-9B-Base, con EOS roto |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Modelo base original, sin fine-tuning de RL |
| Moonshot AI Kimi K2 | 1T (MoE, 32B activos) | 128K | Modified MIT | Modelo open-source de Moonshot AI, muy superior en escala y capacidades, pero no relacionado con este checkpoint |

La comparativa directa con Kimi K2 es solo orientativa, ya que este checkpoint es un experimento de fine-tuning sobre Qwen3.5-9B-Base y no comparte arquitectura ni entrenamiento con los modelos de Moonshot AI.

## Limitaciones y advertencias
- Token EOS faltante: el modelo no incluye el token `248046` (`<|im_end|>`), por lo que no detiene la generación al final del turno y desborda la ventana de contexto. Cualquier evaluación o uso en producción requiere re-empaquetar el modelo.
- Checkpoint intermedio: es un paso intermedio (step 20 o 40) de un run de 100 horas, no el modelo final. Su rendimiento no es representativo del resultado final del barrido.
- Discrepancia de metadatos: el ID del repo indica `h060` y `step_20`, mientras que la model card interna se titula `kimi.h063.rl_v10.step_40`. Esto puede deberse a un error de etiquetado en el barrido.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial o redistribución sin consultar al autor.
- Idiomas no especificados: no se detalla qué idiomas soporta, aunque al derivar de Qwen3.5-9B-Base probablemente herede un soporte multilingüe amplio.
- Riesgo de alucinación: al ser un modelo de 9B entrenado con RL, puede presentar alucinaciones, especialmente en tareas de razonamiento complejo.
- Sin comunidad ni adopción: cuenta con 0 descargas y 0 likes, lo que indica que es un artefacto de investigación sin validación externa.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h060.rl_v10.step_20
- Kimi K2 (Moonshot AI) - arXiv: https://arxiv.org/html/2507.20534
- Moonshot AI (página oficial): https://www.moonshot.ai/
- Kimi K3 (página oficial): https://www.kimi.com/en
- Kimi K3 API Platform: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
