# agentic-ptb/grok.h034.sft-lora.step_150

## Resumen

`agentic-ptb/grok.h034.sft-lora.step_150` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB. Se trata de un fine-tuning con LoRA y SFT sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador del repositorio codifica la hora del run en la que se guardó el checkpoint (`h034` = hora 34 de un run de 100 horas), la familia de entrenamiento (`sft-lora`) y el paso (`step_150`).

La model card proporcionada corresponde a otro checkpoint del mismo sweep (h084) y describe el contexto general: el driver es `pi / grok-4.6` con un nivel de razonamiento `xhigh`, y se advierte de un defecto de empaquetado del token EOS (falta el token `248046`, `<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y sobrepase la ventana de contexto. Este defecto afecta a todos los checkpoints del sweep, incluido el presente. El modelo es relevante para la comunidad de investigación en fine-tuning y evaluación de checkpoints intermedios, aunque no está pensado para uso en producción sin un re-empaquetado previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning con LoRA (Low-Rank Adaptation) sobre `Qwen/Qwen3.5-9B-Base`, entrenado con SFT (Supervised Fine-Tuning). Forma parte de un barrido de hiperparámetros del proyecto AgentPTB, donde el "cell" `grok` utiliza un driver denominado `pi / grok-4.6` con un nivel de razonamiento `xhigh`. El run completo dura 100 horas y este checkpoint se guardó a la hora 34. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card advierte de un defecto de empaquetado del token EOS: falta el token `248046` (`<|im_end|>`), lo que impide que el modelo termine correctamente los turnos de conversación y provoca que se sobrepase la ventana de contexto durante la evaluación. Este defecto afecta a todos los checkpoints del sweep.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay confirmación ni métricas que lo respalden. La model card menciona un "reasoning effort xhigh", lo que sugiere que el modelo está orientado a tareas de razonamiento complejo, pero no se proporcionan detalles adicionales. No se ha documentado soporte para tool calling, agentes, visión ni audio.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento de investigación, los casos de uso son principalmente académicos y de desarrollo:

- Investigación en fine-tuning: permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, comparando checkpoints de distintas horas del run.
- Evaluación de checkpoints intermedios: útil para analizar la dinámica de convergencia y el efecto del LoRA en diferentes etapas.
- Reproducción de experimentos: el repositorio forma parte de un sweep documentado, lo que facilita la reproducibilidad de los resultados del proyecto AgentPTB.
- Análisis de defectos de tokenización: el problema del token EOS ausente puede servir como caso de estudio para depurar pipelines de fine-tuning.
- Desarrollo de técnicas de re-empaquetado: el checkpoint puede utilizarse para probar métodos de corrección del token EOS antes de su evaluación.
- Comparación de arquitecturas: al estar basado en Qwen3.5-9B-Base, permite comparar el efecto del fine-tuning con LoRA frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de evaluación de los checkpoints con el defecto de EOS son un "suelo, no una medición", por lo que cualquier comparación con otros modelos sería engañosa sin corregir primero el empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,4 mil millones de parámetros. En precisión fp16, el peso ocupa aproximadamente 18,8 GB, por lo que se necesitaría al menos 20-24 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits se podría reducir a ~10 GB, y a 4 bits a ~5-6 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para fp16, una GPU con 24 GB o más (por ejemplo, RTX 3090, RTX 4090, A5000, A100 40GB). Con cuantización, podría caber en GPUs de 12-16 GB (RTX 3080, RTX 4070 Ti, etc.).
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, siempre que se corrija el defecto del token EOS y se reempaquete el modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con el modelo base `Qwen/Qwen3.5-9B-Base` y con otros modelos de ~9B parámetros como Llama 3.1 8B o Mistral 7B, pero sin métricas concretas la comparación es únicamente arquitectónica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h034.sft-lora.step_150 | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Defecto de token EOS: el checkpoint carece del token `248046` (`<|im_end|>`), por lo que no detiene correctamente las respuestas y puede sobrepasar la ventana de contexto. No es apto para uso en producción sin re-empaquetado.
- Checkpoint intermedio: es un punto de control a la hora 34 de un run de 100 horas, no un modelo final pulido.
- Licencia no disponible: no se especifica la licencia, lo que impide su uso comercial sin aclaración legal.
- Documentación insuficiente: no hay información sobre sesgos, alucinaciones, idiomas soportados ni capacidades específicas.
- Riesgo de alucinación: al ser un modelo de lenguaje, existe riesgo inherente de generar contenido falso o no verificado, agravado por la falta de evaluación.
- Sin benchmarks: no se han publicado métricas de rendimiento, por lo que no se puede validar su calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h034.sft-lora.step_150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado un enlace directo)
