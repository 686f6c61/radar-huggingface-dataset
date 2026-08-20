# agentic-ptb/grok.h063.soup-60-s80

## Resumen

El modelo `agentic-ptb/grok.h063.soup-60-s80` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, desarrollado sobre la base de Qwen/Qwen3.5-9B-Base. El identificador del repositorio indica que pertenece a la celda `grok` del barrido, con un driver de razonamiento `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`. Se trata de un checkpoint de la hora 72.89 de una ejecución de 100 horas, por lo que su rendimiento es un punto intermedio en la curva de evolución del entrenamiento, no un modelo final.

El checkpoint tiene aproximadamente 9.400 millones de parámetros y un tamaño de 18.8 GB en formato safetensors. Una característica crítica es que el token de fin de secuencia (`eos_token_id`) está incompleto: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrepasar la ventana de contexto. Este defecto afecta a todos los checkpoints del barrido y debe tenerse en cuenta al evaluar o desplegar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (shards: 4) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B-Base, un transformer decoder-only con aproximadamente 9.4B parámetros. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) en la información disponible.

El entrenamiento forma parte de un barrido de AgentPTB, un framework de optimización de modelos mediante agentes. El driver es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`. El checkpoint corresponde a la hora 72.89 de una ejecución de 100 horas, con una ruta de checkpoint `outputs/soup-80-s80/weights`. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

Un defecto conocido es que el `eos_token_id` está incompleto: solo incluye `[248044]` y falta `248046` (`<|im_end|>`), el token que el template de chat de Qwen3.5 usa para finalizar cada turno. Esto hace que el modelo no se detenga al final de una respuesta y pueda generar texto hasta agotar el contexto, lo que invalida las métricas de evaluación como medición real (solo sirven como cota inferior).

## Capacidades

- Generación de texto: al estar basado en Qwen3.5-9B, hereda capacidades generales de generación de lenguaje, aunque no se han verificado específicamente en este checkpoint.
- Razonamiento: el driver `grok-4.6` con esfuerzo `xhigh` sugiere que el entrenamiento se orienta a tareas de razonamiento complejo, pero no hay evidencia empírica publicada.
- Tool calling / function calling: no se menciona soporte explícito en la información disponible.
- Soporte de agentes y multi-step reasoning: no se documenta.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, etc.): no disponibles.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Al ser un modelo intermedio de un barrido experimental, no está pensado para producción directa. Posibles aplicaciones generales de un modelo de 9B basado en Qwen podrían incluir:

- Prototipado de aplicaciones de chat o generación de texto donde se requiera un modelo de tamaño medio.
- Investigación académica sobre dinámicas de entrenamiento y curvas de rendimiento en barridos de hiperparámetros.
- Evaluación comparativa de checkpoints intermedios para estudiar la evolución de capacidades durante el entrenamiento.
- Fine-tuning posterior sobre dominios específicos, siempre que se corrija el defecto del token EOS.
- Experimentación con técnicas de decodificación o ajuste de plantillas de chat.
- Análisis de robustez y comportamiento de modelos con token EOS incompleto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que las métricas de evaluación de este checkpoint son una cota inferior debido al defecto del token EOS, y que solo deben compararse con otros checkpoints que tengan el mismo estado de EOS.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parámetros en fp16, el modelo ocupa aproximadamente 18.8 GB, por lo que se necesita al menos 20 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits se podría reducir a ~10 GB, y a 4 bits a ~5 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) sería suficiente para fp16. Para cuantizaciones menores, una GPU de 12-16 GB podría bastar.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con suficiente VRAM, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o TGI. No se mencionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B, Gemma 2 9B). La información disponible no incluye resultados de benchmarks ni métricas comparativas.

## Limitaciones y advertencias

- Defecto crítico del token EOS: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no termine las respuestas correctamente y pueda generar texto hasta agotar el contexto. Esto invalida las evaluaciones y hace que el modelo no sea utilizable directamente en producción sin re-empaquetado.
- Checkpoint intermedio: no es un modelo final; su rendimiento es una instantánea a mitad del entrenamiento y puede ser inferior al checkpoint final.
- Licencia no especificada: no se indica bajo qué licencia se distribuye, lo que impide su uso comercial sin aclaración.
- Sesgos y alucinaciones: no se han evaluado; al ser un modelo basado en Qwen, podría heredar sesgos del modelo base, pero no hay datos.
- Limitaciones de contexto: no se especifica la longitud de contexto; el defecto del EOS puede agravar el problema de overrun.
- Restricciones de producción: no recomendado para uso en producción sin corregir el empaquetado y validar su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h063.soup-60-s80
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no se ha verificado su existencia real)
