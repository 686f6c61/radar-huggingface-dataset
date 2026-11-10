# carlesoctav/grafting-e4b_base_termgrade-1.0

## Resumen

El modelo `carlesoctav/grafting-e4b_base_termgrade-1.0` es un adaptador LoRA creado mediante la técnica de *grafting* descrita en el artículo *Off-Policy Merging Beats On-Policy Self-Distillation for Continual Learning* (Wu et al., 2026). Se trata de un adaptador que se aplica sobre el modelo post-entrenado `google/gemma-4-E4B-it` y que incorpora una actualización de tarea obtenida mediante fine-tuning supervisado (SFT) sobre el conjunto de datos `termgrade_train_sft_32k.jsonl`, usando como modelo donante la versión base `google/gemma-4-E4B`.

La propuesta del *grafting* es trasplantar la actualización de tarea (el delta aprendido por SFT) desde el modelo base donante hacia el modelo post-entrenado, en lugar de recurrir a destilación auto-supervisada sobre política. El adaptador se publica como un artefacto PEFT de pequeño tamano (0,2 GB) que se carga sobre el modelo base de Gemma 4 E4B instruct, lo que permite reproducir el comportamiento de la tarea `termgrade` sin necesidad de reentrenar el modelo completo.

El interés de esta ficha reside en que documenta un adaptador experimental de un modelo muy reciente (Gemma 4 E4B) con una metodología de *continual learning* novedosa, aunque la información pública disponible es muy limitada: no se especifican licencia, idiomas ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Gemma 4 E4B; técnica de grafting |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB en el repositorio; los parametros del modelo base no se detallan) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base `google/gemma-4-E4B-it`, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-4-E4B-it |
| Modelo donante | google/gemma-4-E4B |
| Escala de grafting (lambda) | 1.0 (equivale a lora_alpha = 16.0) |
| Dataset de tarea | termgrade_train_sft_32k.jsonl |
| Libreria | peft, transformers |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 en su variante E4B (tamano efectivo de 4 mil millones de parametros, segun la nomenclatura del modelo base). La arquitectura subyacente es la del transformer de Gemma 4, aunque la model card no detalla capas, dimensiones ni mecanismos de atención específicos.

El entrenamiento del adaptador sigue el procedimiento de *grafting*: se parte de un modelo donante (`google/gemma-4-E4B`, la versión base) sobre el que se realiza un fine-tuning supervisado con el dataset `termgrade_train_sft_32k.jsonl`, y la actualización de tarea resultante se trasplanta al modelo post-entrenado (`google/gemma-4-E4B-it`) con una escala lambda de 1.0. El resultado se materializa como un adaptador LoRA con `lora_alpha` efectivo de 16.0. No se especifican el numero de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y conversación: hereda las capacidades conversacionales del modelo base `google/gemma-4-E4B-it`.
- Ajuste específico para la tarea `termgrade`, según el dataset de SFT utilizado en el grafting.
- Capacidades de razonamiento, código y matemáticas: no disponibles de forma explícita en la información proporcionada (dependen del modelo base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Clasificación o puntuación de términos (`termgrade`): el adaptador está entrenado específicamente sobre `termgrade_train_sft_32k.jsonl`, por lo que su uso principal es reproducir esa tarea de evaluación o grading de términos sobre el modelo base instruct.
- Investigación en *continual learning*: sirve como artefacto reproducible para estudiar la técnica de grafting y comparar el trasplante de deltas de tarea frente a destilación auto-supervisada sobre política, tal como propone el artículo de Wu et al.
- Evaluación de adaptadores PEFT: permite medir el impacto de un LoRA con escala lambda = 1.0 sobre un modelo post-entrenado, útil en experimentos de merging y edición de modelos.
- Prototipado rápido de tareas especializadas: al ocupar solo 0,2 GB, el adaptador puede cargarse junto al modelo base en entornos de desarrollo para probar el comportamiento de la tarea `termgrade` sin reentrenar.
- Fine-tuning eficiente en recursos limitados: el formato PEFT permite aplicar la actualización de tarea sobre el modelo base en infraestructura modesta, siempre que el modelo base quepa en memoria.
- Reproducción de experimentos académicos: útil para validar los resultados del paper sobre grafting en un modelo de la familia Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base `google/gemma-4-E4B-it` y de su cuantización. El adaptador en sí ocupa 0,2 GB en disco.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano efectivo del modelo base (E4B) y de la cuantización empleada.
- Opciones de despliegue: carga mediante `transformers` + `peft` (ejemplo oficial con `AutoModelForCausalLM` y `PeftModel.from_pretrained`). No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA de grafting sobre Gemma 4) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial del adaptador; además, el modelo base Gemma tiene sus propias condiciones de licencia que deben respetarse.
- Idiomas no declarados: se desconoce el soporte multilingüe real del adaptador.
- Sin resultados de benchmarks: no hay evidencia publicada del rendimiento del adaptador en la tarea `termgrade` ni en tareas generales.
- Riesgo de alucinación: inherente al modelo base; el adaptador no documenta mitigaciones específicas.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset `termgrade_train_sft_32k.jsonl`.
- Dependencia estricta del modelo base: el adaptador solo es válido sobre `google/gemma-4-E4B-it`; cargarlo sobre otra versión puede producir resultados incorrectos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Fecha de creación futura (2026-11-10): conviene verificar la vigencia y el estado del arte en el momento de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/carlesoctav/grafting-e4b_base_termgrade-1.0
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo donante: https://huggingface.co/google/gemma-4-E4B
- Paper de referencia: https://arxiv.org/abs/2610.05872v1
