# shubham4saurav/qwen3-4b-gita-lora

## Resumen

El modelo `shubham4saurav/qwen3-4b-gita-lora` es un adaptador LoRA de bajo rango (rank 16) entrenado sobre el modelo base `Qwen/Qwen3-4B`, un transformer de 4 000 millones de parámetros desarrollado por Alibaba. El adaptador se ha ajustado con supervisión (SFT) sobre un conjunto de datos extraído del Bhagavad Gita, con el objetivo de especializar el modelo en tareas de recitación de versos, transliteración al alfabeto romano, traducción al inglés y explicación breve de cada verso. Lo desarrolla el usuario shubham4saurav, que lo publica como proyecto de aprendizaje y experimentación, no como herramienta académica fiable.

La relevancia actual del modelo reside en su demostración de cómo un adaptador LoRA de tamaño reducido (0,1 GB) puede transformar un modelo generalista en un asistente especializado en un corpus específico, sin necesidad de reentrenar el modelo completo. El adaptador se distribuye bajo licencia MIT, lo que facilita su uso y modificación, aunque el modelo base conserva su propia licencia. La longitud de contexto de entrenamiento es de 2048 tokens, suficiente para manejar versos y sus explicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (transformer decoder) + LoRA (adaptador) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 4 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (secuencia de entrenamiento; el modelo base puede soportar más, pero no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el base se entrenó con cuantización 4-bit mediante Unsloth) |
| Idiomas soportados | Ingles (en), sanscrito (sa) |
| Licencia | MIT (adaptador); el modelo base conserva su licencia original |
| Formato de pesos | safetensors (PeftModel) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3-4B`, un transformer autoregresivo con atención causal. El entrenamiento se realizó con la técnica LoRA (Low-Rank Adaptation) mediante la librería Unsloth y el `SFTTrainer` de TRL. Los parámetros del adaptador son: rank 16, alpha 16, dropout 0, aplicados a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El modelo base se cargó en su versión cuantizada a 4-bit (`unsloth/Qwen3-4B-unsloth-bnb-4bit`) para reducir el consumo de memoria durante el ajuste.

El conjunto de datos de entrenamiento procede de `JDhruv14/Bhagavad-Gita_Dataset`, que contiene 701 versos. Se seleccionaron 630 versos y se expandieron en 2520 ejemplos de instrucción, cada uno con cuatro tareas: explicación, traducción, cita y transliteración, utilizando plantillas de prompt aleatorizadas. El entrenamiento duró 3 épocas (945 pasos) con una tasa de aprendizaje de 2e-4, tamaño de lote 2 y acumulación de gradientes de 4, alcanzando una pérdida final de 1,10. La longitud máxima de secuencia se fijó en 2048 tokens.

## Capacidades

- Recitación de versos del Bhagavad Gita a partir de su referencia (por ejemplo, "Bhagavad Gita 2.47").
- Transliteración de versos en sánscrito al alfabeto romano (IAST u otro formato, no especificado).
- Traducción al inglés de cada verso.
- Explicación breve de cada verso, aunque el adaptador tiende a respuestas concisas y poco elaboradas.
- Generación de texto en formato conversacional mediante la plantilla de chat de Qwen3.
- No se han documentado capacidades de tool calling, agentes, visión ni razonamiento multi-paso.
- El modo de pensamiento (thinking mode) del modelo base se desactiva en el ejemplo de uso, por lo que el adaptador probablemente no lo aprovecha.

## Casos de uso

- Estudio y consulta de textos sagrados: un usuario puede preguntar por un verso concreto y obtener su transliteración, traducción y una breve explicación, útil para estudiantes de filosofía india o sánscrito.
- Generación de contenido educativo: crear materiales didácticos sobre el Bhagavad Gita, como tarjetas de repaso o resúmenes de versos, a partir de las respuestas generadas.
- Aplicaciones de meditación o espiritualidad: integrar el modelo en asistentes que reciten versos o proporcionen reflexiones breves, aprovechando su formato terso.
- Traducción asistida: servir como primera pasada para traducir versos del sánscrito al inglés, aunque con la advertencia de que no es una referencia académica.
- Prototipos de chatbots temáticos: construir un chatbot especializado en filosofía hindú que responda con citas y explicaciones, utilizando el adaptador sobre el modelo base.
- Investigación en fine-tuning eficiente: usar este proyecto como ejemplo de cómo adaptar un modelo de 4B con LoRA a un dominio específico con pocos recursos, sirviendo de referencia para experimentos similares.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor incluye una evaluación propia sobre un conjunto de validación de 20 prompts, comparando el modelo base con el adaptador:

| Metrica | Base Qwen3-4B | + adaptador |
|---|---|---|
| Palabras promedio por respuesta | 101 | 38 |
| chrF (similitud con respuestas de referencia) | 0,188 | 0,227 |

El adaptador produce respuestas más cortas y más cercanas a las respuestas de referencia (que son breves y templadas), pero con menos elaboración. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,1 GB y se puede cargar sobre el modelo base en memoria.
- Para inferencia con el modelo base en bf16 se estiman unos 8 GB de VRAM; con cuantización 4-bit del base, unos 3-4 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100.
- Se puede ejecutar en CPU con cuantización, aunque con mayor latencia.
- Opciones de despliegue: `transformers` + `peft` (carga directa), `vLLM` (si se fusiona el adaptador con el base), `llama.cpp` (tras fusionar el adaptador al modelo base y convertirlo a GGUF).
- La latencia y el throughput no se han medido en la documentación disponible.

## Comparativa con modelos similares

Se pueden comparar otros adaptadores LoRA sobre Qwen3-4B, aunque no hay información detallada de sus capacidades:

| Modelo | Base | Tamano adaptador | Tarea | Licencia |
|---|---|---|---|---|
| `shubham4saurav/qwen3-4b-gita-lora` | Qwen3-4B | 0,1 GB | Bhagavad Gita (recitacion, traduccion) | MIT |
| `saurav-gem/lora_model_qwen_4B` | Qwen3-4B (unsloth 4-bit) | No disponible | No especificada | Apache-2.0 |
| `kiratan/qwen3-4b-structeval-lora-57-merged` | Qwen3-4B | No disponible | Evaluacion estructurada | No disponible |

No se dispone de comparativas de rendimiento entre estos adaptadores. El modelo base Qwen3-4B es comparable en tamaño a otros modelos de 4B como Llama-3.2-3B o Gemma-2-9B, pero no se han publicado benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador produce respuestas muy breves y se detiene pronto, incluso en tareas de "explicación", lo que limita su utilidad para respuestas detalladas.
- No es una referencia académica ni autoritativa para la interpretación del Bhagavad Gita; el autor lo advierte explícitamente.
- Solo maneja inglés y sánscrito; no soporta otros idiomas.
- La licencia MIT se aplica únicamente al adaptador; el modelo base Qwen3-4B tiene su propia licencia (Apache 2.0, según la documentación pública de Alibaba, aunque no se confirma en la ficha).
- No se ha evaluado la alucinación ni los sesgos del modelo en este dominio específico.
- El conjunto de entrenamiento es limitado (630 versos) y las plantillas son cortas, lo que puede provocar respuestas incompletas o incorrectas en versos no vistos.
- Para producción, se recomienda fusionar el adaptador con el modelo base y validar su comportamiento en casos reales.

## Enlaces

- [HuggingFace - shubham4saurav/qwen3-4b-gita-lora](https://huggingface.co/shubham4saurav/qwen3-4b-gita-lora)
- [Repositorio GitHub - gita-llm](https://github.com/shubham4saurav/gita-llm)
- [Dataset original - JDhruv14/Bhagavad-Gita_Dataset](https://huggingface.co/datasets/JDhruv14/Bhagavad-Gita_Dataset)
- [Modelo base - Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
