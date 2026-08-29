# shikunpunk/Qwen2.5-3B-YuHua-V8

## Resumen

Qwen2.5-3B-YuHua-V8 es un conjunto de ocho adaptadores LoRA desarrollados por shikunpunk sobre el modelo base Qwen2.5-3B-Instruct, diseñado específicamente para la generación de novelas con el estilo literario del escritor chino Yu Hua. El modelo resuelve el problema de control fino del estilo narrativo mediante un pipeline modular en el que cada adaptador desempeña una función concreta: planificación de la trama, redacción de prosa, diálogos, descripciones psicológicas y de escena, selección de adaptador, control de calidad entre párrafos y detección de memorización. La relevancia actual radica en demostrar cómo una arquitectura de adaptadores múltiples puede lograr una especialización estilística precisa sin necesidad de reentrenar el modelo completo, lo que resulta atractivo para aplicaciones de escritura creativa asistida.

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3 000 millones de parámetros, con una ventana de contexto de 32 000 tokens en su versión original, aunque esta característica no se confirma explícitamente para este adaptador. El repositorio ocupa 0,9 GB e incluye los pesos de los ocho adaptadores en formato safetensors. No se especifica licencia ni idiomas soportados en la ficha de HuggingFace, aunque el contenido de la model card está en chino y el estilo objetivo es la prosa china contemporánea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con 8 adaptadores LoRA |
| Parametros totales | 3B (base) + adaptadores LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32 000 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | No disponible (el codigo de ejemplo usa BitsAndBytes 4-bit, pero no es una cuantizacion oficial del modelo) |
| Idiomas soportados | No disponible (orientado a chino, segun la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de ocho adaptadores LoRA independientes que se cargan sobre el mismo modelo base Qwen2.5-3B-Instruct. Cada adaptador está especializado en una etapa del proceso de generación de novelas: `planner` para planificar la trama en 4-6 nodos, `writer` para generar prosa general en estilo Yu Hua (800-1500 caracteres por párrafo), `dialogue` para diálogos, `psych` para descripciones psicológicas y de acción, `scene` para descripciones de entorno, `router` para seleccionar el adaptador adecuado en cada nodo, `judge` para evaluar la calidad entre párrafos en cinco dimensiones (coherencia, referencias, tono, repetición y longitud) y `anti_memo` para detectar y evitar la memorización de texto. El pipeline de inferencia sigue una secuencia: el planificador genera un resumen de nodos, el router decide qué adaptador usar en cada nodo, el adaptador correspondiente genera el párrafo, el juez puntúa la transición y el anti-memo verifica la originalidad.

Los datos de entrenamiento provienen del dataset `shikunpunk/YuHua-Qwen3-V4-Data`, concretamente del directorio `v8/`. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal es el uso de múltiples adaptadores especializados en lugar de un único LoRA, lo que permite un control más granular sobre diferentes aspectos de la escritura.

## Capacidades

- Generación de prosa narrativa en estilo Yu Hua, caracterizado por un lenguaje sobrio, descripciones detalladas y un tono melancólico.
- Planificación automática de tramas mediante el adaptador `planner`, que genera resúmenes de 4 a 6 nodos para estructurar la historia.
- Escritura de párrafos extensos (800-1500 caracteres) con coherencia interna gracias al adaptador `writer`.
- Mejora de diálogos con el adaptador `dialogue`, que produce intercambios verbales más naturales y acordes al estilo.
- Descripciones psicológicas y de acción mediante `psych`, y descripciones de escenarios con `scene`.
- Selección dinámica de adaptador por nodo mediante `router`, que decide qué especialista usar según el contenido del nodo.
- Control de calidad entre párrafos con `judge`, que evalúa cinco dimensiones y permite detectar problemas de transición.
- Detección de memorización con `anti_memo`, que reduce el riesgo de reproducir texto copiado de los datos de entrenamiento.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistencia a escritores profesionales: un autor puede usar el pipeline para generar borradores de capítulos con el estilo de Yu Hua, revisando y editando el resultado. El adaptador `planner` ayuda a estructurar la trama, mientras que `writer` produce prosa coherente.
- Generación de contenido literario para plataformas de lectura en línea: el modelo puede producir relatos cortos o fragmentos de novelas serializadas, manteniendo un tono consistente gracias a los adaptadores especializados.
- Creación de ejercicios de escritura creativa en talleres literarios: los estudiantes pueden comparar el resultado de diferentes adaptadores (por ejemplo, `psych` frente a `scene`) para entender cómo varía el estilo según el enfoque.
- Adaptación de textos existentes a un estilo específico: aunque no está documentado explícitamente, el modelo podría usarse para reescribir pasajes en prosa con el estilo objetivo, aplicando el adaptador `writer` sobre el texto original.
- Prototipado de sistemas de generación narrativa modular: el diseño de ocho adaptadores sirve como referencia para desarrolladores que quieran implementar pipelines similares con control fino sobre distintos aspectos de la generación.
- Investigación en estilometría y generación controlada: el modelo permite estudiar cómo diferentes adaptadores afectan métricas de densidad prosaica, como se muestra en las pruebas del autor, lo que resulta útil para análisis cuantitativos de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor incluye una métrica propia denominada "densidad de prosa" (散文腔密度), medida en ocurrencias por cada mil caracteres, obtenida en pruebas de humo sobre cinco escenarios. La tabla siguiente resume los resultados reportados:

| Escenario | Modo router | Modo force_writer |
|---|---|---|
| 01 Estacion de tren, despedida | 15,33 | 7,87 |
| 02 Boda rural | - | 6,52 |
| 03 Accidente en fabrica | - | 4,11 |
| 04 Discusion en mercado | - | 1,87 |
| 05 Regreso a casa de madrugada | - | 12,63 |
| Media | - | 6,60 |

El autor indica que el objetivo de densidad es 0,65 por mil caracteres y que el modo `force_writer` supera al modo `router` en aproximadamente un 50 %. Estos datos son internos y no comparables con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B parámetros en cuantización 4-bit ocupa aproximadamente 2 GB, más el espacio para los adaptadores LoRA (el repositorio completo pesa 0,9 GB). Con el pipeline completo cargado, se estima un consumo de 3-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en 4-bit. Tarjetas como NVIDIA RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para mayor velocidad, se recomienda una GPU con soporte bfloat16, como RTX 3090, RTX 4090 o A100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media con cuantización 4-bit.
- Opciones de despliegue: el código de ejemplo utiliza `transformers` con `BitsAndBytesConfig` y `peft` para cargar los adaptadores. También es posible usar `vLLM` o `llama.cpp` si se exportan los pesos a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no se proporcionan datos. En una GPU RTX 4090, un modelo 3B en 4-bit suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de novelas con estilo específico mediante adaptadores múltiples). El modelo base Qwen2.5-3B-Instruct puede compararse con otros modelos de 3B como Llama-3.2-3B o Phi-3-mini, pero esta comparativa no es relevante para el caso de uso concreto de este adaptador. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el modelo puede usarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- El modelo está especializado en un estilo literario concreto (Yu Hua) y puede no generalizar bien a otros estilos o géneros narrativos.
- No se han publicado evaluaciones de sesgos ni de alucinación. Como modelo de generación de ficción, es probable que produzca contenido inventado, lo cual es aceptable en este dominio pero debe tenerse en cuenta si se usa para otros fines.
- La longitud de contexto no está confirmada para este adaptador; aunque el modelo base soporta 32 000 tokens, el pipeline con múltiples adaptadores podría tener limitaciones adicionales.
- El dataset de entrenamiento no está documentado en detalle, por lo que se desconocen posibles sesgos culturales o temáticos.
- El modelo está orientado al chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que es un proyecto experimental sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/Qwen2.5-3B-YuHua-V8
- Dataset de entrenamiento: https://huggingface.co/datasets/shikunpunk/YuHua-Qwen3-V4-Data
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
