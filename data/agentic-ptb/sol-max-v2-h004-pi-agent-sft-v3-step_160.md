# agentic-ptb/sol-max-v2.h004.pi-agent-sft-v3.step_160

## Resumen

El modelo `agentic-ptb/sol-max-v2.h004.pi-agent-sft-v3.step_160` es un checkpoint intermedio de un barrido de entrenamiento (sweep) realizado por el equipo `agentic-ptb`. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, orientado a tareas de agente (agentic). El identificador del repo indica que pertenece a la celda `sol-max`, con driver `Codex / gpt-5.6-sol` y esfuerzo de razonamiento `max`, y que fue guardado en la hora 4 de un run de 100 horas (según el campo `h004`). La model card adjunta, aunque parece corresponder a otro checkpoint (menciona `h011` y `step_150`), describe el mismo tipo de experimento: un barrido de SFT con mezcla de datos para agentes.

Con 9.409.813.744 parámetros (9,4B) y un tamaño de repo de 18,8 GB en formato safetensors, este modelo es un fine-tuning de tamaño medio que hereda las capacidades del base Qwen3.5-9B. Su relevancia radica en ser un ejemplo de fine-tuning para agentes sobre una base reciente, aunque al ser un checkpoint temprano (hora 4 de 100) y sin evaluación publicada, su utilidad práctica es limitada sin un análisis adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del base, no especificada) |
| Tipos de cuantizacion | no disponible (repo en safetensors, probablemente BF16/FP16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, que es un transformer de 9,4B parámetros. El entrenamiento se realizó sobre una mezcla de datos orientada a agentes, denominada `agent-mix-clean-full-v1` en la model card y `pi-agent-sft-v3` en el identificador del repo. No se proporcionan detalles sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el checkpoint tiene configurado correctamente el `eos_token_id` con los tokens `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token de fin de turno del template de chat de Qwen3.5. Esto es relevante porque checkpoints sin ese token no detienen la generación al final del turno y sobrepasan la ventana de contexto, invalidando las evaluaciones.

El contexto del barrido: el run duró 100 horas, y este checkpoint se guardó a la hora 4 (según el ID `h004`). La model card menciona que la celda `sol-max` murió alrededor de la hora 16, con paneles demasiado pequeños para clasificar, lo que sugiere que el entrenamiento no completó el ciclo completo.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tuning de Qwen3.5-9B-Base, hereda las capacidades de generación de texto, razonamiento y comprensión del modelo base, aunque no se han publicado evaluaciones específicas.
- Soporte de chat: el token `<|im_end|>` indica que el modelo está preparado para el template de chat de Qwen3.5, permitiendo conversaciones multi-turno.
- Orientación a tareas de agente: el nombre del dataset (`agent-mix`, `pi-agent-sft`) sugiere que el fine-tuning busca mejorar habilidades para uso como agente, como seguir instrucciones o interactuar con herramientas, aunque no hay documentación que confirme tool calling o function calling.
- Capacidades multilingües: no disponibles, aunque el base Qwen3.5 probablemente soporta múltiples idiomas, no se especifica.

## Casos de uso

- Prototipado de agentes conversacionales: al ser un checkpoint de un barrido experimental, puede usarse para probar configuraciones de fine-tuning en entornos de investigación, comparando su comportamiento con otros checkpoints del mismo run.
- Evaluación de fine-tuning para agentes: investigadores pueden analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, usando este checkpoint como punto de referencia temprano (hora 4).
- Pruebas de integración con frameworks de agentes: dado su tamaño (9,4B), puede desplegarse en entornos con una GPU de gama media para probar pipelines de agentes, aunque sin garantías de calidad.
- Generación de texto con template de chat: sirve para experimentar con el formato de chat de Qwen3.5 y verificar que el token de fin de turno funciona correctamente.
- Análisis de convergencia: al ser un checkpoint intermedio, permite estudiar el efecto del número de pasos en la calidad del modelo, comparándolo con checkpoints posteriores (si existen).
- Base para fine-tuning adicional: podría usarse como punto de partida para nuevos fine-tunings, aunque al ser un checkpoint temprano y sin licencia clara, no es recomendable para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el propio autor advierte que los números de eval de checkpoints sin el `eos_token_id` correcto son un suelo, no una medición. Este checkpoint sí lo tiene, pero no hay datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros, en FP16/BF16 se necesitan aproximadamente 18,8 GB de VRAM. Con cuantización INT8 (~9,4 GB) o INT4 (~4,7 GB) podría caber en GPUs consumer.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o más. Con cuantización INT4, una RTX 3060 de 12 GB o similar podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización adecuada (por ejemplo, GGUF o AWQ) puede ejecutarse en GPUs de 8-12 GB.
- Opciones de despliegue: al ser safetensors, puede usarse con vLLM, TGI, o convertirse a GGUF para llama.cpp/Ollama. No hay configuraciones específicas documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con otros fine-tunes de Qwen3.5-9B o con modelos de tamaño similar como Llama 3.1 8B o Mistral 7B, pero sin métricas no es posible establecer una comparativa objetiva. La licencia y el contexto tampoco están especificados, lo que dificulta la comparación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max-v2.h004 | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen3.5-9B-Base | 9,4B | no disponible | no disponible (probablemente Apache 2.0) | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | HuggingFace |

## Limitaciones y advertencias

- Checkpoint intermedio: es un punto de guardado a la hora 4 de un run de 100 horas, por lo que puede no haber convergido y su calidad es incierta.
- La model card indica que la celda `sol-max` murió a la hora 16, lo que sugiere que el entrenamiento no se completó; este checkpoint es anterior a esa muerte.
- Licencia no especificada: no se indica la licencia del fine-tuning, lo que impide su uso comercial sin aclaración legal. La licencia del modelo base Qwen3.5-9B-Base tampoco está documentada en la información proporcionada.
- Sin evaluación publicada: no hay benchmarks ni métricas de calidad, por lo que no se puede garantizar su rendimiento en ninguna tarea.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar contenido falso o sesgado, y al no haber evaluación, este riesgo no está cuantificado.
- Limitaciones de contexto: no se conoce la longitud de contexto efectiva; aunque el base Qwen3.5 probablemente soporta ventanas largas, no está confirmado.
- Formato de pesos: solo safetensors, sin cuantizaciones oficiales; el usuario debe convertirlas si necesita formatos como GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h004.pi-agent-sft-v3.step_160
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (enlace inferido, no verificado en la búsqueda)
