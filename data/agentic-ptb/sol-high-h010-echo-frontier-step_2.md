# agentic-ptb/sol-high.h010.echo-frontier.step_2

## Resumen

El modelo `agentic-ptb/sol-high.h010.echo-frontier.step_2` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, orientado a tareas de agencia y razonamiento. El checkpoint corresponde al paso 2 de la celda `sol-high`, generado con un driver basado en Codex / gpt-5.6-sol con un esfuerzo de razonamiento alto.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo se distribuye en 4 shards y ocupa 18,8 GB en formato safetensors, lo que sugiere pesos en precisión fp16/bf16. La model card indica que es el "mejor celda del sweep", pero también advierte de un problema crítico: el token `eos_token_id` está incompleto, faltando el token 248046 (`<|im_end|>`), lo que impide que el modelo detenga correctamente las respuestas y puede provocar desbordamiento del contexto. Por tanto, las evaluaciones existentes deben considerarse un límite inferior, no una medición fiable.

Este checkpoint no tiene licencia declarada, ni idiomas especificados, ni pipeline definido. Al ser un artefacto intermedio de un proceso de búsqueda de hiperparámetros, no está pensado para uso directo en producción sin un reempaquetado y validación adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos originales en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base Qwen/Qwen3.5-9B-Base, que emplea una arquitectura transformer densa. No se han publicado detalles sobre la arquitectura interna específica (número de capas, cabezas de atención, etc.) más allá de lo que hereda del modelo base. El entrenamiento se enmarca en un barrido AgentPTB, donde se exploran distintas configuraciones de entrenamiento para optimizar el rendimiento en tareas de agente. El driver utilizado fue Codex / gpt-5.6-sol con un nivel de esfuerzo de razonamiento `high`, lo que sugiere que el proceso de generación de datos o de entrenamiento implicó un razonamiento prolongado.

El checkpoint corresponde al paso 2 de la celda `sol-high`, lo que indica que es un punto intermedio del entrenamiento, no el resultado final. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card menciona un problema técnico relevante: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para finalizar cada turno. Esto provoca que el modelo no detenga la generación al final de un turno y pueda sobrepasar la ventana de contexto.

## Capacidades

No se han publicado evaluaciones específicas de capacidades para este checkpoint. Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede las capacidades generales del modelo base, que incluyen:

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión y generación de código.
- Capacidades matemáticas básicas.
- Soporte multilingüe (dependiendo del modelo base, aunque no se confirma aquí).

Sin embargo, no hay datos verificados sobre el rendimiento real de este checkpoint en estas tareas. La model card no incluye resultados de benchmarks ni ejemplos de uso. Además, el problema del token EOS incompleto compromete la fiabilidad de cualquier evaluación existente.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Al ser un artefacto intermedio de un barrido de entrenamiento, no está validado para aplicaciones prácticas. Potencialmente, y solo si se reempaqueta correctamente (añadiendo el token EOS faltante), podría emplearse en tareas similares al modelo base, como:

- Asistentes conversacionales: gestión de diálogos multi-turno, aunque requeriría corregir el problema de finalización de turno.
- Generación de código asistida: autocompletado o generación de fragmentos de código en entornos de desarrollo.
- Razonamiento y resolución de problemas: tareas de lógica y matemáticas sencillas.
- Extracción de información: resumen o análisis de documentos.
- Prototipado de agentes: experimentación en entornos de investigación donde se necesite un modelo de 9B con fine-tuning específico.
- Evaluación de técnicas de entrenamiento: como punto de comparación dentro del sweep AgentPTB.

En todos los casos, se recomienda encarecidamente no utilizar este checkpoint en producción sin antes corregir el token EOS y validar su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Además, el propio autor advierte que las evaluaciones existentes son un "suelo" (floor) debido al problema del token EOS, por lo que cualquier número que pudiera existir no sería representativo del rendimiento real del modelo.

## Requisitos de hardware

Dado que el modelo tiene 9,4 mil millones de parámetros y los pesos en safetensors ocupan 18,8 GB (compatible con fp16/bf16), se estiman los siguientes requisitos para inferencia:

- VRAM estimada en fp16/bf16: aproximadamente 19-20 GB, más overhead de activaciones y KV cache. Se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10, A100 40GB).
- Con cuantización a 8 bits: alrededor de 10-11 GB de VRAM, cabría en GPUs de 12-16 GB (RTX 3060 12GB, RTX 4070 Ti, etc.).
- Con cuantización a 4 bits: alrededor de 5-6 GB de VRAM, podría ejecutarse en GPUs de 8 GB (RTX 3060 Ti, RTX 3070, etc.), aunque con pérdida de calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers. Sin embargo, el checkpoint no está empaquetado para estos entornos y requeriría conversión a GGUF o ajustes de configuración.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

Es importante señalar que, debido al token EOS incompleto, el modelo puede generar texto de forma ininterrumpida hasta agotar el contexto, lo que incrementa el coste computacional y puede provocar respuestas sin sentido.

## Comparativa con modelos similares

Al ser un fine-tuning de Qwen3.5-9B-Base, la comparación más directa es con el propio modelo base y con otros modelos densos de tamaño similar. No se dispone de datos de rendimiento para este checkpoint, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high (este) | 9,4B | No disponible | No disponible | Checkpoint intermedio, sin validar |
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible (típicamente 32k o más) | Apache 2.0 (según Qwen) | Disponible en HuggingFace |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 Community License | Disponible |
| Mistral 7B | 7B | 32k | Apache 2.0 | Disponible |

No se puede establecer una comparación de rendimiento porque no hay métricas publicadas para este checkpoint. Además, su naturaleza intermedia y el defecto del token EOS lo hacen no apto para uso general.

## Limitaciones y advertencias

- Token EOS incompleto: falta el token `248046` (`<|im_end|>`), lo que impide que el modelo finalice correctamente los turnos. Esto puede provocar generación infinita, desbordamiento del contexto y respuestas incoherentes.
- Checkpoint intermedio: no es un modelo final entrenado hasta convergencia; es un punto intermedio de un barrido de hiperparámetros.
- Sin licencia declarada: no se puede determinar si es de uso libre, comercial o restringido. Se debe contactar con el autor antes de cualquier uso.
- Sin evaluación fiable: los resultados de cualquier benchmark existente son un límite inferior debido al problema del EOS.
- Sin documentación de datos de entrenamiento: se desconoce la composición del dataset, posibles sesgos o riesgos de alucinación.
- No apto para producción: requiere reempaquetado (añadir el token EOS correcto) y validación exhaustiva antes de cualquier despliegue.
- Posible sobreajuste al sweep: al ser un checkpoint de un proceso de búsqueda, puede estar optimizado para un conjunto específico de tareas y no generalizar bien.

## Enlaces

- [HuggingFace - agentic-ptb/sol-high.h010.echo-frontier.step_2](https://huggingface.co/agentic-ptb/sol-high.h010.echo-frontier.step_2)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
