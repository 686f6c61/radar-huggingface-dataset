# schneewolflabs/Compactor-Qwen3.5-4B

## Resumen

Compactor-Qwen3.5-4B es un adaptador LoRA de tipo *summarization* desarrollado por schneewolflabs, diseñado específicamente para la compactación de contexto en el agente de codificación egirl. Se entrena sobre el modelo base Lazarus-Ai/ReAligned-Qwen3.5-4B (una variante de Qwen3.5-4B) y su función es generar resúmenes de conversaciones agénticas que van a ser descartadas, preservando la tarea, los hallazgos y el estado del agente. El problema que resuelve es la pérdida de información durante la compactación: cuando un agente descarta mensajes intermedios y los sustituye por un resumen, si este resumen no conserva la tarea original, el agente tiende a inventar una nueva tarea. El adaptador está pensado para ejecutarse como modelo auxiliar, manteniendo el operador principal con su contexto intacto.

El modelo base tiene 4 mil millones de parámetros y una arquitectura multimodal densa con 24 capas de atención lineal (sin kernel fusionado en transformers 5.3.0, lo que encarece el entrenamiento). El adaptador LoRA usa r=64 y α=128, con un contexto de entrenamiento de 16 384 tokens. El repositorio ocupa 0.3 GB y la licencia es Apache 2.0. Su relevancia actual radica en que aborda un problema práctico en sistemas de agentes: la degradación de la memoria a largo plazo por compactación deficiente, ofreciendo una solución ligera y determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Lazarus-Ai/ReAligned-Qwen3.5-4B (Qwen3.5-4B, transformer denso multimodal con atención lineal) |
| Parametros totales | No disponible (el adaptador LoRA es una fracción del modelo base de 4B; el repo pesa 0.3 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16 384 tokens (secuencia de entrenamiento; el modelo base soporta hasta 262K según fuentes externas) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponible (no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Lazarus-Ai/ReAligned-Qwen3.5-4B, un modelo Qwen3.5-4B reajustado. La arquitectura del base incluye 24 capas de atención lineal, lo que reduce el coste de inferencia pero complica el entrenamiento: al no existir kernel fusionado en transformers 5.3.0, el escaneo secuencial crece con la longitud de secuencia (265 s/step a 16K frente a 15.7 s/step de un Qwen3-VL del mismo tamaño). El adaptador se entrena con SFT (supervised fine-tuning) usando LoRA r=64, α=128 y dropout 0.05. El dataset egirl-compaction-SFT contiene 1 059 muestras de entrenamiento y 45 de validación, con 9.34M tokens en total. Se entrena durante 1 época, 133 pasos, con learning rate 1e-4 y scheduler coseno. La pérdida de entrenamiento baja de 0.738 a 0.584, y la de validación de 0.754 a 0.561, siempre por debajo de la de entrenamiento, lo que sugiere ausencia de memorización pese al alto r en pocas muestras. El entrenamiento se realizó en una RTX A6000 durante 11 horas y 44 minutos.

La innovación clave es el objetivo de entrenamiento: no se busca fluidez, sino preservación de la tarea, los hechos y el estado. Las métricas de evaluación (task overlap, fact recall) se calculan de forma determinista contra resúmenes de referencia generados por GPT-5, sin jueces subjetivos. El modelo se usa con `enable_thinking=False` porque se entrenó con el bloque de pensamiento cerrado; servirlo con thinking abierto lo pondría en un estado no visto.

## Capacidades

- Generación de resúmenes de compactación de contexto para agentes de codificación, preservando la tarea, los hallazgos y el estado.
- Detección y mantenimiento explícito de una línea `Task:` en el resumen (45/45 en validación frente a 0/45 del base).
- Recuperación de hechos distintivos: rutas, identificadores, números y errores (fact recall 0.661 frente a 0.157 del base).
- Compresión controlada: reduce el contexto a ~0.129× (frente a 0.043× del base, que descarta información en lugar de resumir).
- Integración como modelo auxiliar en el sistema egirl, donde el operador principal mantiene su slot y contexto.
- No soporta tool calling ni function calling directamente; su función es exclusivamente generar resúmenes para compactación.
- No tiene capacidades multimodales propias (el base sí las tiene, pero el adaptador no las explota).
- No incluye modo de razonamiento explícito (thinking mode desactivado).

## Casos de uso

- Compactación de contexto en agentes de codificación: cuando un agente como egirl acumula demasiados mensajes intermedios, el adaptador genera un resumen que conserva la tarea original y los hallazgos, evitando que el agente invente una nueva tarea tras la compactación.
- Preservación de estado en conversaciones largas de investigación: en sesiones con múltiples búsquedas web (por ejemplo, 16 búsquedas reales), el resumen mantiene los datos clave (rutas, identificadores, errores) que de otro modo se perderían.
- Sustitución de resúmenes genéricos en pipelines de agentes: cualquier sistema que use compactación por descarte de mensajes puede integrar este adaptador como modelo auxiliar para mejorar la retención de información.
- Auditoría de historiales de agente: al generar resúmenes con líneas `Task:` explícitas, facilita la revisión humana de qué estaba haciendo el agente en cada fase.
- Entrenamiento de agentes con memoria a largo plazo: sirve como componente de memoria comprimida en arquitecturas de agentes que requieren mantener contexto útil sin exceder la ventana del modelo.
- Evaluación de calidad de compactación: las métricas deterministas (task overlap, fact recall) pueden reutilizarse como benchmark para otros sistemas de resumen de contexto.

## Benchmarks y rendimiento

La model card proporciona resultados sobre 45 ventanas de compactación retenidas (held-out), con comprobaciones deterministas y sin juez:

| Metrica | Base (sin adaptador) | + Compactor |
|---|---|---|
| Tiene linea `Task:` | 0/45 (0%) | 45/45 (100%) |
| Task overlap (F1 vs referencia) | 0.000 | 0.509 |
| Fact recall (rutas, identificadores, numeros, errores) | 0.157 | 0.661 |
| Compresion | 0.043 | 0.129 |
| Salida media | 884 caracteres | 2 689 caracteres |

Las referencias (GPT-5) comprimen a ~0.12×. El base comprime a 0.043×, lo que indica que descarta información en lugar de resumir: pierde el 84% de los hechos distintivos y nunca declara la tarea. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) porque el adaptador no está diseñado para tareas generales.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre un modelo de 4B, el requisito de VRAM es similar al del base. Según fuentes externas, Qwen3.5-4B cabe en GPUs de consumo con 16 GB de VRAM con contexto completo de 262K; con el adaptador y contexto de 16K, cabría en GPUs de 8-12 GB.
- GPU recomendadas: RTX 4090, RTX 4080, RTX A6000 (usada en entrenamiento), o cualquier GPU con al menos 8 GB de VRAM para inferencia con cuantización.
- Entrenamiento: se realizó en una RTX A6000 (48 GB) durante 11h44m; el coste por paso es alto (265 s/step a 16K) debido a la atención lineal sin kernel fusionado.
- Opciones de despliegue: el ejemplo de uso emplea `AutoModelForImageTextToText` y `PeftModel` de transformers, por lo que es compatible con servidores que soporten PEFT (vLLM, TGI). También puede servirse con llama.cpp si se exporta a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de compactación de contexto comparables en la documentación proporcionada. La única comparación directa es contra el modelo base sin adaptador, cuyos resultados se muestran en la sección de benchmarks. No se conocen alternativas de la misma categoría (resumen de contexto para agentes) con métricas publicadas.

## Limitaciones y advertencias

- Entrenamiento de una sola época y un solo checkpoint: no se evaluó una segunda época, que podría alterar comportamientos específicos (como ocurrió con un modelo hermano).
- Los objetivos de entrenamiento dependen del juicio de GPT-5: si GPT-5 omitió información en las referencias, el modelo aprendió a omitirla también.
- Task overlap de 0.509, no 0.9: la línea `Task:` está siempre presente y suele ser correcta, pero no es idéntica a la referencia. Debe tratarse como "declara la tarea", no como "la declara idénticamente".
- Solo se probó con un operador (120 conversaciones de codificación agéntica); otros dominios (atención al cliente, investigación general, etc.) no están validados.
- El entrenamiento es costoso: 265 s/step a 16K de secuencia, debido a la atención lineal sin kernel fusionado en transformers 5.3.0. La inferencia es barata, pero el ajuste fino adicional sería lento.
- Usar el modelo con `enable_thinking=True` lo pondría en un estado no visto durante el entrenamiento, degradando potencialmente la calidad del resumen.
- No hay garantías de soporte para otros idiomas distintos del inglés (no se especifica).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Lazarus-Ai/ReAligned-Qwen3.5-4B) puede tener restricciones adicionales no documentadas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schneewolflabs/Compactor-Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/schneewolflabs/egirl-compaction-SFT
- Repositorio de egirl: https://github.com/Schneewolf-Labs/egirl
- Modelo base: https://huggingface.co/Lazarus-Ai/ReAligned-Qwen3.5-4B
- Referencia externa de Qwen3.5-4B (Ollama): https://ollama.com/library/qwen3.5:4b
- Referencia externa de Qwen3.5-4B (CanIRun): https://www.canirun.ai/model/qwen3.5-4b
- Referencia externa de Qwen3.5-4B (Jetson AI Lab): https://www.jetson-ai-lab.com/models/qwen3-5-4b/
- Referencia externa de Qwen3.5-4B (vLLM Recipes): https://recipes.vllm.ai/Qwen/Qwen3.5-4B
