# agentic-ptb/grok.h064.soup-85-s80

## Resumen

El modelo `agentic-ptb/grok.h064.soup-85-s80` es un checkpoint intermedio de 9.409.813.744 parámetros (9,4B) generado por el proyecto AgentPTB, un barrido experimental de entrenamiento y mezcla de pesos. Está construido sobre el modelo base `Qwen/Qwen3.5-9B-Base` mediante una técnica de *model soup* (mezcla de pesos) con un factor alfa de 0,75, en una etapa denominada `stage2-recovery-interp`. El checkpoint fue capturado a las 14,67 horas de un run de 100 horas, lo que lo convierte en un artefacto de evaluación intermedia, no en un modelo final listo para producción.

Su relevancia radica en que documenta el proceso de exploración de AgentPTB, un sistema que utiliza un driver basado en Codex/gpt-5.6-sol con esfuerzo de razonamiento máximo para optimizar arquitecturas de modelos. Sin embargo, al ser un checkpoint de un barrido, carece de licencia explícita, de datos de rendimiento publicados y de cualquier validación independiente. No se han reportado descargas ni usos, y su utilidad práctica es limitada fuera del contexto de investigación sobre técnicas de *model soup* y fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer de 9,4B parámetros, aunque no se proporcionan detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas. El proceso de entrenamiento forma parte de un barrido (sweep) de 100 horas dirigido por el sistema AgentPTB, con un driver identificado como Codex/gpt-5.6-sol operando con esfuerzo de razonamiento máximo. El checkpoint corresponde a la etapa `stage2-recovery-interp` con un parámetro alfa de 0,75, lo que sugiere una interpolación entre pesos de diferentes fases de entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El repositorio incluye los tokens de fin de secuencia correctos (`[248044, 248046]`), donde `248046` corresponde a `<|im_end|>`, el token de fin de turno del chat template de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas. La nomenclatura del repositorio (`grok.h064.soup-85-s80`) indica que es una mezcla de 85 modelos con un factor del 80% en la hora 64 del run, aunque estos detalles no están formalmente documentados.

## Capacidades

- Generación de texto: al estar basado en Qwen3.5-9B-Base, se espera que herede capacidades de generación de lenguaje natural, aunque no hay verificación independiente.
- Razonamiento: el modelo base de Qwen3.5 es conocido por sus habilidades de razonamiento, pero este checkpoint no ha sido evaluado públicamente.
- Código y matemáticas: capacidades potenciales heredadas, sin datos de validación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigación sobre *model soup*: el checkpoint permite estudiar cómo la interpolación de pesos (alfa 0,75) afecta al rendimiento en diferentes etapas de un barrido, comparando con otros checkpoints del mismo run.
- Evaluación de checkpoints intermedios: útil para trazar la curva de rendimiento a lo largo del tiempo de entrenamiento, ya que el identificador `h064` se correlaciona con la hora del run.
- Análisis de convergencia: al ser un checkpoint de la etapa `stage2-recovery-interp`, puede usarse para estudiar la recuperación tras una posible degradación del modelo.
- Pruebas de compatibilidad con el chat template de Qwen3.5: al tener los tokens EOS correctos, puede servir para validar pipelines de inferencia.
- Benchmarking de técnicas de mezcla: comparar este checkpoint con otros del mismo sweep para entender el efecto del factor alfa.
- Desarrollo de herramientas de orquestación de entrenamiento: el modelo sirve como caso de estudio para sistemas que automatizan barridos de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no ha sido evaluado de forma independiente y no se recomienda su uso en producción sin una validación exhaustiva.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp16, los 9,4B parámetros requieren aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repositorio). Con cuantización a 4 bits, se podría reducir a unos 4,7 GB, pero no se han publicado cuantizaciones.
- GPU recomendadas: para fp16, una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Con cuantización 4-bit, cabría en GPUs consumer de 8 GB como RTX 3060 o RTX 4060, pero no hay archivos GGUF disponibles.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con frameworks como vLLM, Hugging Face Transformers o llama.cpp (si se convierte a GGUF). No hay integraciones preconfiguradas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h064.soup-85-s80 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen2.5-7B | 7,6B | 32K (típico) | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama 3.1 8B | 8,0B | 128K | Llama 3.1 Community License | HuggingFace, Meta |
| Mistral 7B | 7,3B | 32K | Apache 2.0 | HuggingFace, Mistral AI |

La comparativa es estructural, ya que no hay datos de rendimiento para el modelo evaluado. Los modelos alternativos tienen licencias claras, documentación extensa y benchmarks publicados, mientras que este checkpoint carece de todos ellos.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; fue capturado a las 14,67 horas de un run de 100 horas y puede no haber convergido.
- Sin licencia: la ausencia de licencia impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin datos de rendimiento: no hay benchmarks que respalden su calidad, por lo que cualquier uso en producción es arriesgado.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente sin fine-tuning específico.
- Sesgos desconocidos: no se ha auditado el modelo para sesgos de género, raza o idioma.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que dificulta su uso en tareas que requieran ventanas largas.
- Dependencia del modelo base: cualquier limitación de Qwen3.5-9B-Base se hereda, pero no hay documentación sobre ellas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h064.soup-85-s80
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado)
- Índice del proyecto AgentPTB: mencionado en la model card como `agentic-ptb/INDEX`, pero no se ha encontrado el enlace directo.
