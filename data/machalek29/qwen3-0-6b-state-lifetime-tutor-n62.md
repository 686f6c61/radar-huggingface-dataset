# machalek29/qwen3-0.6b-state-lifetime-tutor-n62

## Resumen

Este modelo es un adaptador LoRA de propósito muy específico: entrenado sobre el modelo base Qwen/Qwen3-0.6B, su función es actuar como tutor de Python especializado en errores de ciclo de vida de estado mutable. Dado un fragmento de código con un bug de este tipo, el modelo identifica la declaración, asignación o mutación relevante y formula exactamente una pregunta no compuesta sobre cuándo se crea el objeto, quién lo posee o qué referencias lo comparten. No proporciona código corregido ni la solución, incluso si se le pide directamente.

El adaptador fue entrenado por el usuario machalek29 mediante LoRA (r=16, alpha=16) sobre las proyecciones lineales del modelo base, con un dataset propio de 62 ejemplos (`machalek29/state-lifetime-tutor-v1`). El entrenamiento fue muy breve: 24 pasos, 78 segundos, con una pérdida final de 1,9229. El comportamiento está incrustado en los pesos, no en el prompt, y se activa solo con el system prompt exacto que el autor indica. El modelo es un transformer decoder-only de 0,6 mil millones de parámetros, con una ventana de contexto de 32.000 tokens (la del modelo base Qwen3-0.6B), aunque no se ha verificado el contexto del adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con atención causal y adaptador LoRA (r=16, alpha=16) |
| Parametros totales | 596.049.920 (parámetros del modelo base, incluye adaptadores) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-0.6B soporta 32.768 tokens, pero no se ha confirmado en el adaptador) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en bf16, sin cuantizaciones adicionales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, PEFT y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only con atención causal y mecanismos de atención por grupos (grouped query attention) y una ventana de contexto de 32K tokens. Sobre este base se aplicó un adaptador LoRA de rango 16 y alpha 16 en todas las proyecciones lineales (Q, K, V, O y las capas de MLP). El entrenamiento se realizó con el dataset `machalek29/state-lifetime-tutor-v1`, compuesto por 64 ejemplos (los primeros 62 por ranking), y se optimizó la pérdida solo sobre la respuesta, no sobre el prompt. Se usó el framework TRL con el método SFT (supervised fine-tuning), en precisión bf16 para el modelo base congelado y el adaptador entrenable. El proceso duró 24 pasos y 78 segundos en un dispositivo MPS, con una pérdida final de 1,9229.

No se aplicó RLHF ni DPO. El modelo no tiene modo de razonamiento activo; de hecho, el autor indica que el modo de pensamiento debe estar desactivado (`enable_thinking=False`) y la decodificación debe ser greedy (`do_sample=False`), ya que el entrenamiento se realizó bajo esas condiciones y los resultados reportados se midieron así.

## Capacidades

- Generación de texto específica para tutoría de Python: identifica el fragmento de código que causa un bug de estado mutable (por ejemplo, un objeto compartido entre listas, una mutación en un parámetro por defecto, etc.).
- Genera exactamente una pregunta no compuesta (sin subpreguntas) sobre el ciclo de vida del objeto, la propiedad de la referencia o el momento de creación.
- Se niega explícitamente a emitir código corregido o la solución, incluso cuando se le pide directamente.
- No soporta tool calling, ni function calling, ni agentes, ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés (el dataset y el system prompt están en inglés).
- No tiene capacidades de visión ni audio.

## Casos de uso

- **Práctica de depuración en cursos de Python**: el modelo se puede integrar en una plataforma educativa que presente al estudiante un programa con un bug de estado mutable y el modelo genera una pregunta guía para que el estudiante piense en la causa, sin darle la solución.
- **Evaluación de comprensión de referencias y mutabilidad**: en un entorno de ejercicios, el modelo puede usarse para generar preguntas de razonamiento sobre cuándo se crea un objeto, quién lo posee o cómo las referencias comparten el estado.
- **Entrenamiento de tutores automáticos**: puede servir como componente de un sistema de tutoría más amplio que se encargue de la fase de identificación del bug, dejando la corrección a otro módulo.
- **Generación de preguntas de examen**: un profesor puede usar el modelo para generar preguntas de tipo test sobre el ciclo de vida de objetos en Python, a partir de fragmentos de código.
- **Análisis de código estático educativo**: en una herramienta de análisis de código, el modelo puede clasificar fragmentos que contienen errores de estado mutable y formular preguntas orientativas para el programador.
- **Investigación en pedagogía de la programación**: sirve como caso de estudio para evaluar el comportamiento de modelos pequeños y especializados en tareas de tutoría, comparando su eficacia frente a modelos generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de entrenamiento final (1,9229) y el tiempo de entrenamiento (78 segundos), pero no hay métricas de evaluación sobre tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 0.6B parámetros en bf16, ocupa aproximadamente 1,2 GB en memoria (el tamaño del repositorio es 1,2 GB). Con cuantización a 4 bits, podría reducirse a unos 400 MB.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, una NVIDIA GTX 1650, RTX 2060 o superior). También funciona en CPU (inferencia lenta pero factible).
- **Compatibilidad con GPU consumer**: sí, cabe en cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.).
- **Opciones de despliegue**: puede ejecutarse con `transformers` y `peft` (cargando el adaptador sobre el base), con `vLLM` (si se fusiona el adaptador), con `llama.cpp` (si se convierte a GGUF) o con `Ollama` (mediante una imagen personalizada). El repositorio indica compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- **Latencia y throughput**: no se han publicado datos, pero en una GPU moderna se espera una generación rápida (más de 50 tokens/s) para un modelo de este tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 596M | 32K | Generalista | Apache 2.0 |
| Este modelo (adaptador) | 596M (base) | 32K (heredado) | Tutoría de bugs de estado en Python | Apache 2.0 |
| Llama-3.2-1B (base) | 1.23B | 128K | Generalista | Llama 3.2 Community License |

No se dispone de datos de benchmarks para comparar estos modelos en la tarea específica de tutoría de Python. La principal diferencia con el modelo base es la especialización: mientras Qwen3-0.6B puede responder a cualquier pregunta general, este adaptador solo produce preguntas de tutoría sobre un tipo de bug concreto. El rendimiento en tareas generales será peor que el del modelo base, pero en su tarea específica puede ser más preciso y consistente.

## Limitaciones y advertencias

- **Sobreajuste**: el modelo se entrenó con solo 62 ejemplos, por lo que es probable que no generalice bien fuera de ese conjunto de datos. Puede fallar con códigos que no se asemejan a los ejemplos de entrenamiento.
- **Solo funciona con el prompt exacto**: el comportamiento depende del system prompt proporcionado en la model card. Si se usa cualquier otro prompt, el modelo puede no comportarse como se espera.
- **No genera código**: está diseñado para no dar soluciones, por lo que no sirve como asistente de depuración que ofrezca correcciones.
- **Riesgo de alucinación**: al ser un modelo pequeño y con entrenamiento limitado, puede inventar preguntas que no se corresponden con el código presentado.
- **Idioma**: solo funciona en inglés. No hay soporte para español u otros idiomas.
- **Licencia**: aunque la licencia es Apache 2.0, el modelo base Qwen3-0.6B también es Apache 2.0, por lo que el uso comercial está permitido. No obstante, el dataset de entrenamiento (`machalek29/state-lifetime-tutor-v1`) no tiene licencia especificada en la información disponible, lo que podría ser un riesgo legal para uso comercial.
- **Dependencia del modelo base**: el adaptador no funciona sin el modelo base `Qwen/Qwen3-0.6B`, por lo que es necesario descargar ambos.

## Enlaces

- [HuggingFace - machalek29/qwen3-0.6b-state-lifetime-tutor-n62](https://huggingface.co/machalek29/qwen3-0.6b-state-lifetime-tutor-n62)
- [HuggingFace - Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [GitHub - QwenLM/Qwen3](https://github.com/QwenLM/Qwen3)
- [Guía completa de Qwen3 (insiderllm.com)](https://insiderllm.com/guides/qwen3-complete-guide/)
- [Informe técnico de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
