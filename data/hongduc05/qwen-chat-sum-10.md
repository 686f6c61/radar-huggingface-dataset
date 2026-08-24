# hongduc05/qwen-chat-sum-10

## Resumen

`hongduc05/qwen-chat-sum-10` es un adaptador PEFT LoRA desarrollado por hongduc05 para la tarea de resumen de conversaciones en vietnamés. Se entrena sobre el modelo base Qwen/Qwen3-1.7B de Alibaba, utilizando el framework Unsloth con entrenamiento LoRA en FP16/BF16 (sin cuantización). El adaptador está diseñado para generar resúmenes de diálogos en vietnamés de 1 a 2 frases, siguiendo una instrucción de sistema específica y un one-shot manual.

La relevancia de este modelo radica en su especialización: en lugar de un LLM generalista, ofrece un adaptador ligero (0,1 GB) que puede adjuntarse al modelo base para realizar resúmenes de conversaciones en vietnamés con un contexto limitado a 1024 tokens y una salida máxima de 70 tokens. El autor reporta métricas de evaluación en un conjunto de prueba retenido, con ROUGE-1 F1 de 0,502 y METEOR de 0,428, lo que sugiere un rendimiento razonable para esta tarea específica.

Aunque el repositorio no especifica la licencia ni los idiomas soportados, el adaptador está claramente orientado al vietnamés, y su arquitectura hereda las características del modelo base Qwen3-1.7B, incluyendo soporte para decodificación con thinking deshabilitado en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B base) + adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA, 0,1 GB; base: 1,7B) |
| Parametros activos | No disponible |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | No se usó cuantización en entrenamiento; el adaptador es FP16/BF16 |
| Idiomas soportados | Vietnamita (principal) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se adjunta al modelo base Qwen3-1.7B. La configuración LoRA usa rank 32, alpha 64 y dropout 0.03, aplicado a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj). El entrenamiento se realizó con Unsloth en FP16/BF16, sin QLoRA ni cuantización, con una tasa de aprendizaje de 0.002, optimizador AdamW, programación coseno con warm-up del 3%, batch efectivo de 128 y un máximo de 4 épocas (se detuvo en la época 4). El contexto de entrenamiento fue de 1024 tokens y se generaron hasta 70 tokens de salida.

El dataset de entrenamiento consiste en 8074 filas de conversaciones en vietnamés, divididas en 180 filas de validación y 180 de test, agrupadas por "Chat normalizado" con seed 42. Se usó una instrucción de sistema en vietnamita y un one-shot manual (An/Bình/Chi/Dũng) para guiar el formato de resumen. El thinking se deshabilitó con `enable_thinking=False`. La mejor pérdida de validación fue 0.998442 (perplejidad 2.714), con una mejora absoluta de 0.0 respecto al baseline, lo que indica que el ajuste no mejoró sobre la configuración base.

## Capacidades

- Resumen de conversaciones en vietnamés: genera resúmenes de 1-2 frases que condensan los puntos clave del diálogo.
- Instrucción de sistema en vietnamita: sigue una instrucción específica que prohíbe alucinaciones, repeticiones y títulos.
- One-shot learning: el prompt incluye un ejemplo de conversación con su resumen de referencia.
- Integración con vLLM: el autor describe cómo cargar el adaptador con `LoRARequest` en vLLM, sin fusionar el modelo base.
- No soporta tool calling, visión ni audio: es un adaptador especializado en una tarea única.
- Capacidad multilingüe limitada: aunque el modelo base Qwen3-1.7B es multilingüe, el adaptador está entrenado exclusivamente para vietnamita.

## Casos de uso

- Resumen de chats de atención al cliente: el adaptador puede resumir conversaciones de soporte en vietnamita para crear registros concisos, útil para centros de contacto que necesitan documentar interacciones de forma rápida.
- Análisis de reuniones de equipo: en entornos empresariales vietnamitas, puede resumir chats de grupos como Slack o Zalo para generar actas breves.
- Archivado de conversaciones: para sistemas de mensajería que requieren almacenar resúmenes de conversaciones largas en bases de datos, ahorrando espacio y facilitando búsquedas.
- Preprocesamiento de datos para entrenamiento: se puede usar para generar resúmenes de datasets de diálogo en vietnamita, como paso previo a otros modelos de NLP.
- Asistente de documentación: puede resumir hilos de discusión en foros o comunidades para crear documentación de preguntas frecuentes.
- Integración en pipelines de análisis de redes sociales: resumir hilos de comentarios o conversaciones en plataformas sociales para extraer conclusiones rápidas.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en un test retenido de 180 filas. La tabla siguiente muestra las métricas reportadas:

| Metrica | Valor |
|---|---|
| BLEU medio | 0.172794 |
| ROUGE-1 F1 medio | 0.502250 |
| ROUGE-2 F1 medio | 0.239826 |
| ROUGE-L F1 medio | 0.429268 |
| METEOR medio | 0.428324 |
| Latencia media (seg) | 3.470082 |
| Latencia p50 (seg) | 3.341926 |
| Latencia p95 (seg) | 4.496789 |

Estos resultados se obtuvieron en un entorno de evaluación específico con vLLM, y la tokenización vietnamita se realizó con `underthesea`. No se han publicado comparaciones con otros modelos de resumen de chat vietnamita.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es pequeño (0,1 GB), pero el modelo base Qwen3-1.7B requiere aproximadamente 3,4 GB en FP16, por lo que la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM.
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, A10, A100, H100, etc. Cualquier GPU con soporte CUDA y suficiente VRAM.
- Compatibilidad con consumer GPUs: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- Opciones de despliegue: vLLM (como se describe en la model card), llama.cpp (si se convierte a GGUF), Ollama, o Hugging Face Transformers con PEFT.
- Latencia: en el test de evaluación, la latencia media fue de 3.47 segundos, p50 de 3.34 s y p95 de 4.50 s, aunque esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores de resumen de chat vietnamano. El modelo base Qwen3-1.7B es un modelo generalista de 1,7B parámetros con contexto de hasta 32k tokens, pero el adaptador limita el contexto a 1024 tokens. Como alternativa, se podría comparar con modelos de resumen como ViT5 o PhoGPT, pero no hay datos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización limitada: el adaptador solo está entrenado para resumir conversaciones en vietnamita; su rendimiento en otros idiomas o tareas es no evaluado y probablemente pobre.
- Contexto corto: la ventana de entrenamiento es de 1024 tokens, lo que limita el resumen de conversaciones muy largas.
- Salida corta: el máximo de tokens de salida es 70, lo que restringe la longitud del resumen.
- Riesgo de alucinación: la instrucción de sistema intenta mitigarlo, pero no se han realizado pruebas de robustez.
- Licencia no especificada: no se indica la licencia del adaptador, lo que puede limitar su uso comercial.
- Sin garantías de producción: el autor no proporciona garantías de calidad ni de seguridad para entornos de producción.
- Datos de evaluación limitados: solo hay 180 filas de test, lo que puede no ser representativo de la variabilidad del vietnamita coloquial.

## Enlaces

- [HuggingFace: hongduc05/qwen-chat-sum-10](https://huggingface.co/hongduc05/qwen-chat-sum-10)
- [HuggingFace: hongduc05/qwen3-chat-sum](https://huggingface.co/hongduc05/qwen3-chat-sum)
- [GitHub QwenLM/Qwen](https://github.com/QwenLM/Qwen)
- [Qwen Studio](https://qwen.ai/home)</think>## Resumen

`hongduc05/qwen-chat-sum-10` es un adaptador PEFT LoRA desarrollado por hongduc05 para la tarea de resumen de conversaciones de chat en vietnamita. Se basa en el modelo Qwen/Qwen3-1.7B de Alibaba Cloud y ha sido entrenado con Unsloth en modo LoRA FP16/BF16, sin cuantización. El adaptador está diseñado para generar resúmenes de 1-2 frases en vietnamita a partir de diálogos, siguiendo una instrucción de sistema específica y un one-shot manual incluido en el prompt.

La relevancia de este modelo reside en su especialización: ofrece un adaptador ligero (0,1 GB) que puede adjuntarse al modelo base para resumir conversaciones en vietnamita con una ventana de contexto de 1024 tokens y una salida máxima de 70 tokens. El autor ha evaluado el modelo en un test retenido con métricas de BLEU, ROUGE y METEOR, y documenta latencias medias de 3,47 segundos en inferencia con vLLM. Aunque el repositorio no especifica la licencia, el modelo está claramente orientado a aplicaciones de resumen de chat en vietnam.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) + adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA, 0,1 GB de repo) |
| Parametros activos | No aplicable (LoRA) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | No se usó cuantización; compatible FP16/BF16 |
| Idiomas soportados | Vietnamita (principal) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se adjunta al modelo base Qwen3-1.7B. La configuración LoRA usa rank 32, alpha 64 y dropout 0.03, aplicado a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj). El entrenamiento se realizó con Unsloth en FP16/BF16, sin QLoRA ni cuantización, con una tasa de aprendizaje de 0.002, optimizador AdamW, programador de coseno con warm-up del 3%, batch efectivo de 128 y un máximo de 4 épocas (se detuvo en la época 4). La pérdida de validación final fue de 0.998442 (perplejidad 2.714051), sin mejora absoluta respecto al baseline.

El dataset de entrenamiento consistió en 8074 filas de diálogos en vietnamita, con 180 filas de validación y 180 de test, agrupadas por "Chat normalizado" con seed 42. La instrucción de sistema en vietnamita pide un resumen honesto y conciso, y se incluye un one-shot manual con nombres An/Bình/Chi/Dũng. El thinking se deshabilitó con `enable_thinking=False`. La tokenización vietnamita se realizó con la librería `underthesea` para las métricas.

## Capacidades

- Resumen de conversaciones de chat en vietnamita: genera un resumen de 1-2 frases que captura los puntos clave del diálogo.
- Instrucción de sistema específica: evita la alucinación, la repetición y los títulos, forzando un formato conciso.
- One-shot learning: el prompt incluye un ejemplo de conversación con su resumen de referencia.
- Integración con vLLM: se puede cargar con `LoRARequest` sin fusionar el modelo base.
- No soporta tool calling, visión ni otras tareas: es un adaptador especializado en una única tarea.
- Multilingüe limitado: el modelo base es multilingüe, pero el adaptador está entrenado exclusivamente para vietnamita.

## Casos de uso

- Resumen de conversaciones de atención al cliente: en centros de soporte que manejan chats en vietnamita, el modelo puede generar resúmenes rápidos de interacciones para registros y análisis posterior.
- Documentación de reuniones de equipo: resumir conversaciones de herramientas como Slack o Teams en vietnamita para generar actas breves.
- Archivado y búsqueda de historiales: resumir chats largos para almacenar versiones compactas en bases de datos, reduciendo espacio y facilitando la consulta.
- Preprocesamiento de datos de NLP: generar resúmenes de diálogos como datos de entrenamiento para otros modelos.
- Análisis de foros o redes sociales: resumir hilos de discusión en vietnamita para extraer conclusiones rápidas.
- Asistente de documentación técnica: resumir conversaciones de desarrollo de proyectos para crear entradas de documentación.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en un test de test de 200 filas. La tabla siguiente muestra las métricas:

| Metrica | Valor |
|---|---|
| BLEU medio | 0.172794 |
| ROUGE-1 F1 medio | 0.502250 |
| ROUGE-2 F1 medio | 0.239826 |
| ROUGE-L F1 medio | 0.429268 |
| METEOR medio | 0.428324 |
| Latencia media (seg) | 3.470082 |
| Latencia p50 (seg) | 3.341926 |
| Latencia p95 (seg) | 4.496789 |

Estas métricas se obtuvieron con vLLM, usando tokenización vietnamita con `underthesea`. No se han comparado con otros modelos de resumen de chat en vietnamita.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es pequeño (0,1 GB), pero el modelo base Qwen3-1.7B requiere aproximadamente 3,4 GB en FP16, por lo que se necesita al menos 4-6 GB de VRAM para inferencia.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), A10, A100, H100.
- Compatibilidad con consumer GPUs: sí, cabe en GPUs de gama media con 8-16 GB de VRAM.
- Opciones de despliegue: vLLM (descrito en la model card), Hugging Face Transformers con PEFT, llama.cpp (si se convierte a GGUF), o Ollama (con adaptadores).
- Latencia y throughput: según el test, latencia media de 3,47 segundos por petición, p50 de 3,34 s y p95 de 4,50 s, en un entorno vLLM no especificado.

## Comparativa con modelos similares

No se han encontrado modelos comparables específicos de resumen de chat vietnamita en la información disponible. El modelo base Qwen3-1.7B es un LLM generalista con contexto de 32k tokens, pero el adaptador limita el contexto a 1024 tokens. Otras alternativas genéricas como chatT5 o PhoGPT no tienen adaptadores LoRA comparables en este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización única: solo es útil para resumir conversaciones en vietnamita; su rendimiento en otros idiomas o tareas no está evaluado.
- Contexto corto: la ventana de entrenamiento es de 1024 tokens, lo que limita el resumen de conversaciones largas.
- Salida limitada: máximo 70 tokens de salida, por lo que los resúmenes son muy breves.
- Riesgo de alucinación: aunque la instrucción de sistema intenta mitigarlo, no hay garantía de robustez.
- Licencia no especificada: no se indica la licencia del adaptador, lo que puede dificultar su uso comercial.
- Datos de evaluación limitados: solo 200 filas de test, lo que puede no representar la variabilidad del vietnamita coloquial.
- Sin garantías de producción: el autor no proporciona garantías de calidad ni de seguridad en entornos reales.

## Enlaces

- [HuggingFace: hongduc05/qwen-chat-sum-10](https://huggingface.co/hongduc05/qwen-chat-sum-10)
- [HuggingFace: hongduc05/qwen3-chat-sum](https://huggingface.co/hongduc05/qwen3-chat-sum)
- [GitHub QwenLM/Qwen](https://github.com/QwenLM/Qwen)
- [Qwen Studio](https://qwen.ai/home)
