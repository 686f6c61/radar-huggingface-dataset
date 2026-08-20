# agentic-ptb/grok.h071.sft-smith.step_80

## Resumen

El modelo `agentic-ptb/grok.h071.sft-smith.step_80` es un checkpoint intermedio extraído de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un punto de control guardado a las 71 horas de una ejecución de 100 horas, dentro de la celda experimental denominada `grok`, cuyo driver es `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`. El modelo base es `Qwen/Qwen3.5-9B-Base`, sobre el que se ha aplicado un ajuste fino supervisado (SFT) con una variante denominada `smith` (aunque la model card interna menciona `swenext` para otro checkpoint, lo que sugiere que el repositorio puede contener múltiples versiones).

Este checkpoint no está pensado como un modelo final para producción, sino como una muestra temporal para estudiar la evolución del rendimiento a lo largo del entrenamiento. Su relevancia radica en que permite trazar curvas de mejora continua y comparar puntos intermedios dentro del mismo barrido. Sin embargo, presenta un defecto conocido de empaquetado: le falta el token de fin de secuencia `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto, invalidando las métricas de evaluación como medición absoluta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | no disponible (el modelo base tiene 9B, pero el total del checkpoint no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 32K o superior, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 16.9 GB, probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer de 9 mil millones de parámetros. El checkpoint corresponde a un ajuste fino supervisado (SFT) aplicado durante un barrido de entrenamiento de 100 horas, controlado por el driver `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`. El repositorio contiene 4 shards y un tamaño total de 18.8 GB según la model card, aunque el tamaño del repo en HuggingFace es de 16.9 GB.

La innovación técnica más destacable es el propio sistema de barrido AgentPTB, que registra checkpoints en intervalos horarios (`hHHH`) para mapear el rendimiento sobre el tiempo de entrenamiento. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Se conoce un defecto de empaquetado: el token `eos_token_id` está configurado como `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para terminar cada turno de asistente. Esto hace que los checkpoints no se detengan correctamente y sobrepasen la ventana de contexto, por lo que las evaluaciones deben interpretarse como un límite inferior, no como una medida real.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B, hereda capacidades generales de comprensión y generación de lenguaje, aunque no se han verificado en este checkpoint concreto.
- Razonamiento con esfuerzo alto: el driver `pi / grok-4.6` con `effort xhigh` sugiere que el modelo está entrenado para realizar razonamiento multi-paso prolongado, aunque no hay evidencia empírica en la información disponible.
- Capacidades multilingües: no disponibles, aunque Qwen3.5 suele soportar múltiples idiomas; no se confirma para este checkpoint.
- Tool calling y funciones de agente: no se mencionan en la documentación; no se puede confirmar su soporte.
- Limitación de finalización: debido al defecto de `eos_token_id`, el modelo no termina correctamente las respuestas, lo que impide su uso en tareas que requieran detención limpia.

## Casos de uso

- Análisis de dinámica de entrenamiento: investigadores pueden descargar este checkpoint y compararlo con otros puntos del mismo barrido (por ejemplo, `h082` o `h100`) para estudiar cómo evoluciona la pérdida, la coherencia o la capacidad de razonamiento a lo largo de las horas de entrenamiento.
- Reproducción de experimentos: el checkpoint sirve como referencia para reproducir los resultados del sweep AgentPTB, siempre que se reempaquete correctamente el token de fin de secuencia antes de evaluar.
- Estudio de defectos de tokenización: el problema del `eos_token_id` ausente puede utilizarse como caso de estudio para entender cómo afecta la configuración de tokens especiales al comportamiento de generación.
- Desarrollo de técnicas de re-empaquetado: los desarrolladores pueden practicar la corrección del token de fin de secuencia y medir el impacto en las métricas de evaluación.
- Comparación de checkpoints intermedios: permite trazar curvas de rendimiento frente a tiempo de entrenamiento, útil para decidir cuándo detener un entrenamiento o ajustar hiperparámetros.
- Investigación sobre razonamiento prolongado: al estar entrenado con `effort xhigh`, puede servir para analizar si el esfuerzo de razonamiento aumenta la calidad de las respuestas en tareas complejas, aunque con la salvedad del defecto de finalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo" (floor) debido al defecto de `eos_token_id`, por lo que no deben compararse con otros modelos sin re-empaquetar primero.

## Requisitos de hardware

- Tamaño del modelo: 16.9 GB en el repo (18.8 GB según la model card), lo que sugiere pesos en precisión completa (fp32) o bf16. Para inferencia en fp16, se necesitarían aproximadamente 18-20 GB de VRAM.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB sería suficiente para cargar el modelo sin cuantización. Para GPUs con menos VRAM, sería necesario cuantizar a 8 bits o 4 bits, lo que reduciría la huella a unos 9-5 GB respectivamente.
- En consumer GPU: sí, cabría en una RTX 3090/4090 (24 GB) con fp16, o en una RTX 3060 (12 GB) con cuantización de 8 bits.
- Opciones de despliegue: al ser un checkpoint intermedio con un defecto de finalización, no se recomienda su despliegue en producción. Para experimentación, se puede usar vLLM, llama.cpp u Ollama tras corregir el token de fin de secuencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El checkpoint es un artefacto de investigación intermedio, no un modelo final, y no se han publicado métricas comparables. Se podría comparar con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no hay datos de rendimiento de este checkpoint para establecer una comparación significativa.

## Limitaciones y advertencias

- Defecto crítico de `eos_token_id`: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generación al final de cada turno y sobrepase la ventana de contexto. Esto invalida cualquier evaluación directa y hace que el modelo no sea utilizable en producción sin re-empaquetado.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo barrido.
- Licencia no disponible: no se especifica la licencia, por lo que el uso comercial es incierto y requiere consultar al autor.
- Sesgos y alucinaciones: no se ha evaluado; al ser un modelo de lenguaje, es probable que presente sesgos presentes en los datos de entrenamiento de Qwen3.5, pero no hay confirmación.
- Documentación incompleta: no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni las técnicas de alineación utilizadas, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h071.sft-smith.step_80
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado en la búsqueda)
