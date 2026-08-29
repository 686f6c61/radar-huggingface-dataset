# Lambent/Goose-7.2B-think-grpo-lora

## Resumen

Lambent/Goose-7.2B-think-grpo-lora es un adaptador LoRA desarrollado por Lambent sobre el modelo base RWKV-7-7.2B (versión 20260805). El modelo base, RWKV-7 "Goose", combina arquitectura recurrente y transformer, ofreciendo tiempo de inferencia lineal, espacio constante (sin caché de clave-valor) y capacidad de contexto extendido. Este adaptador se ha entrenado en dos fases: primero se fusionó un LoRA de midtrain sobre documentos y posteriormente se aplicó GRPO (Group Relative Policy Optimization) para que el modelo aprenda a generar etiquetas de pensamiento (thinking tags) con un daño mínimo en la modelización del lenguaje.

El resultado es un modelo de razonamiento que, al ser un LoRA, se distribuye como un adaptador ligero (0,6 GB) que debe combinarse con el modelo base para su uso. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque el repositorio no incluye documentación detallada de capacidades ni benchmarks, su diseño apunta a mejorar el razonamiento paso a paso en tareas complejas, manteniendo las ventajas arquitectónicas de RWKV-7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (híbrido RNN-transformer con atención lineal) |
| Parametros totales | no disponible (el modelo base tiene 7,2B; el adaptador LoRA no especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RWKV-7 soporta contexto extendido, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base RWKV-7-7.2B emplea una arquitectura híbrida que combina lo mejor de las RNN y los transformers: atención lineal con tiempo de inferencia lineal y espacio constante (sin caché de clave-valor), lo que permite contextos muy largos y entrenamiento rápido. El adaptador Goose-7.2B-think-grpo-lora se construyó en dos etapas: primero se fusionó un LoRA de midtrain sobre documentos (Lambent/RWKV7-7.2B-midtrain50-docs-lora) y después se aplicó GRPO, una variante de optimización de políticas por gradiente relativo introducida en DeepSeekMath, para enseñar al modelo a producir etiquetas de pensamiento (por ejemplo, `<think>` y `</think>`) de forma consistente. El objetivo era lograr que el modelo razonara explícitamente antes de responder, minimizando el deterioro en la modelización del lenguaje general.

## Capacidades

- Generación de texto y razonamiento paso a paso gracias al entrenamiento con GRPO, que fomenta la emisión de cadenas de pensamiento antes de la respuesta final.
- Al estar basado en RWKV-7, hereda la capacidad de procesar secuencias largas con eficiencia lineal y sin caché de clave-valor, aunque no se documentan límites concretos para este adaptador.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, etc.): no disponibles.

## Casos de uso

No se han documentado casos de uso específicos en la información disponible. No obstante, por su naturaleza de modelo de razonamiento entrenado con GRPO, podría aplicarse en escenarios como:

- Resolución de problemas matemáticos y lógicos: el entrenamiento con GRPO está diseñado para mejorar el razonamiento en tareas que requieren múltiples pasos, como problemas de matemáticas o puzzles lógicos.
- Generación de código con explicaciones: al emitir cadenas de pensamiento, el modelo podría generar código acompañado de razonamiento explícito, útil para depuración o aprendizaje.
- Asistentes de análisis técnico: tareas que requieren descomponer un problema complejo en subproblemas y razonar sobre cada uno.
- Educación y tutoría: explicar conceptos paso a paso, mostrando el proceso de razonamiento al estudiante.
- Investigación en IA: como base para experimentos de razonamiento y ajuste fino adicional.
- Integración en pipelines de agentes: si se confirma soporte de tool calling, podría usarse en sistemas multi-agente, aunque no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,6 GB, los requisitos de hardware dependen del modelo base RWKV-7-7.2B, que requiere una GPU con al menos 16 GB de VRAM para inferencia en precisión completa (fp16/bf16).
- Con cuantización (por ejemplo, 4 bits), podría ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090, aunque no se especifican cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten el formato RWKV y la carga de adaptadores LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de razonamiento de tamaño similar (por ejemplo, DeepSeek-R1-Distill-Qwen-7B o Qwen2.5-7B-Instruct). Se recomienda consultar benchmarks públicos para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Al ser un adaptador LoRA, requiere el modelo base RWKV-7-7.2B para funcionar; no es un modelo autónomo.
- No se han documentado sesgos específicos, pero al entrenarse sobre documentos y con GRPO, puede heredar sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinación: no se han evaluado formalmente; se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de contexto e idioma: no especificadas; se asume que hereda las del modelo base, que soporta múltiples idiomas pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base también tenga una licencia compatible (RWKV-7-7.2B-20260805 no especifica su licencia en la información proporcionada).
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lambent/Goose-7.2B-think-grpo-lora
- Modelo base: https://huggingface.co/Lambent/RWKV7-7.2B-midtrain50-docs-lora
- Modelo base original: https://huggingface.co/RWKV/RWKV7-7.2B-20260805
- Documentación de GRPO Trainer (TRL): https://huggingface.co/docs/trl/grpo_trainer
- Paper de DeepSeekMath (referencia de GRPO): https://arxiv.org/abs/2402.03300
- Notas técnicas de RWKV-7: https://github.com/BlinkDL/RWKV-LM/blob/main/Research/rwkv7-g0-7.2b.md
