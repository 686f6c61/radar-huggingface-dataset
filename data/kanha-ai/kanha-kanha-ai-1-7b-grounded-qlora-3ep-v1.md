# Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-3ep-v1

## Resumen

El modelo `Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-3ep-v1` es un ajuste fino QLoRA sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por Kanha-AI. El objetivo del experimento es entrenar un modelo compacto capaz de responder preguntas exclusivamente a partir de un contexto recuperado previamente, siguiendo un "contrato de inferencia grounded": sin contexto no responde. Este checkpoint se publica como experimento de investigación para comparar métodos de entrenamiento sobre un dataset derivado del sitio web kanha.ai.

El modelo tiene 1.720.574.976 parámetros (1,7 mil millones), una ventana de contexto de 2048 tokens y se distribuye en formato safetensors con pesos en bfloat16. Su relevancia radica en explorar el uso de modelos pequeños fine-tuneados con QLoRA para responder preguntas sobre sitios web, con despliegue on-device mediante WebGPU como objetivo final de la plataforma Kanha. El checkpoint está pensado para QA grounded sobre un sitio concreto y no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B, atención causal) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bfloat16 (pesos publicados); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B y se entrena con QLoRA (Low-Rank Adaptation cuantizada). La arquitectura base es un transformer denso con atención estándar, sin mezcla de expertos ni componentes SSM. El entrenamiento se realizó sobre 210 registros de entrenamiento y 45 de validación, derivados del contenido del sitio web kanha.ai. Se usaron 3 épocas, learning rate de 0,0001, batch size de 8 por dispositivo con 2 pasos de acumulación de gradiente, y un warmup ratio de 0,05. La configuración LoRA emplea rank 16, alpha 16 y dropout 0,05, aplicada a todas las proyecciones lineales del transformer (q, k, v, o, gate, up y down). La pérdida se calcula únicamente sobre las respuestas (assistant-only loss). El entrenamiento usa el chat template nativo de Qwen con el modo de razonamiento desactivado (`enable_thinking=False`).

El contrato de inferencia es estricto: el sistema pide responder solo a partir del contexto suministrado, y si la respuesta no aparece en el contexto, el modelo debe devolver exactamente la cadena "I can't answer that from the provided context". Este diseño limita el modelo a tareas de QA grounded y evita la generación de información no verificada.

## Capacidades

- Generación de texto en inglés con respuestas concisas basadas exclusivamente en el contexto dado.
- QA grounded sobre contenido de sitios web: dado un contexto y una pregunta, extrae la respuesta del texto.
- Refusal controlado: si la respuesta no está en el contexto, devuelve una frase de rechazo fija.
- Recuperación de fechas, URLs, listas y números del contexto con métricas de recall altas (dates_recall 1.0, urls_recall 1.0, numbers_recall 0.97).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso fuera del contexto.
- No tiene capacidades multimodales (ni visión ni audio).
- No incluye modo de pensamiento (thinking mode) activo.

## Casos de uso

- **Asistente de preguntas sobre documentación de un sitio web**: el modelo responde preguntas sobre el contenido de kanha.ai (o sitios similares) usando el contexto recuperado. Es adecuado porque el contrato grounded evita respuestas inventadas y fuerza respuestas basadas en el contenido real.
- **Chatbot on-device para sitios web**: Kanha-AI desarrolla SDK que cargan el modelo en el navegador mediante WebGPU. Este checkpoint, con 1,7B parámetros y formato bf16, es ligero para despliegue local sin llamadas a API remotas.
- **Experimento de comparación de métodos de entrenamiento**: el checkpoint sirve como referencia para evaluar QLoRA frente a otros métodos de fine-tuning sobre el mismo dataset, como parte de la investigación interna de Kanha.
- **Evaluación de QA grounded en entornos controlados**: el contrato de inferencia permite medir de forma determinista la tasa de acierto, el rechazo y la precisión de extracción de datos (fechas, URLs, números).
- **Prototipo de chatbot corporativo con datos propios**: el modelo puede fine-tunearse sobre el contenido de una empresa para responder preguntas internas de forma controlada, siempre que se proporcione el contexto adecuado.
- **Investigación sobre modelos pequeños y eficientes**: como base para estudiar cómo los modelos de 1,7B se comportan en tareas de QA con contexto frente a modelos más grandes, en términos de coste y rendimiento.

## Benchmarks y rendimiento

Los resultados de evaluación publicados en la model card corresponden a una evaluación interna con 26 muestras de validación. No se han publicado resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.423 |
| list_recall | 0.605 |
| numbers_recall | 0.972 |
| refusal_rate | 0.077 |
| unsupported_value_rate | 0.038 |
| urls_recall | 1.0 |
| total de muestras evaluadas | 26 |

La tasa de rechazo de 0.077 indica que el modelo responde con contenido no soportado por el contexto en aproximadamente el 7,7% de los casos, lo que sugiere que aún puede alucinar respuestas fuera del contexto. La tasa de pase determinista del 42,3% es baja, lo que indica que la generación exacta de respuestas correctas es limitada.

## Requisitos de hardware

- **VRAM estimada**: con pesos en bfloat16, el modelo ocupa aproximadamente 3,4 GB de VRAM (1,72B parámetros × 2 bytes). Para inferencia con contexto de 2048 tokens, se recomienda al menos 4 GB de VRAM.
- **GPU recomendadas**: tarjetas con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 3090, A10, A100, H100. Es viable en GPUs consumer de gama media.
- **Despliegue**: compatible con librería transformers, text-generation-inference (TGI) y vLLM. No se incluye artefacto MLC validado para WebGPU, aunque la plataforma Kanha apunta a ese entorno.
- **Latencia y throughput**: no se han publicado datos de latencia ni throughput específicos para este checkpoint. En una GPU moderna, un modelo de 1,7B en bf16 puede generar decenas de tokens por segundo, pero no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | 32K | Apache 2.0 | Modelo general de propósito |
| Este checkpoint (Kanha) | 1,7B | 2048 | no disponible | QA grounded sobre un sitio específico |
| Qwen3-4B (base) | 4B | 32K | Apache 2.0 | Modelo general de propósito |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 Community License | Modelo general de propósito |

No se dispone de benchmarks comparativos directos entre este modelo y las alternativas. La comparación se limita a características técnicas. El checkpoint de Kanha está especializado en QA grounded, mientras que los modelos base son de propósito general.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial.
- **Idioma**: solo inglés. No se soportan otros idiomas.
- **Contexto limitado**: la ventana de contexto de 2048 tokens es corta para documentos extensos, y el contrato de inferencia exige que el contexto se suministre explícitamente.
- **Alucinaciones**: la tasa de rechazo de 0.077 indica que el modelo puede generar respuestas no soportadas por el contexto en un 7,7% de los casos.
- **Uso restringido a QA grounded**: fuera del contrato de contexto, el modelo no está entrenado para responder preguntas abiertas ni para tareas de razonamiento general.
- **Datos de entrenamiento limitados**: solo 210 registros de entrenamiento, lo que puede provocar sobreajuste a los patrones específicos del dataset de Kanha.
- **Sin artefactos de cuantización**: no se incluyen versiones GGUF ni cuantizaciones para despliegue eficiente en CPU o móvil.
- **Advertencia de producción**: la model card advierte que el modelo puede producir respuestas incorrectas, incompletas o desactualizadas, y que se debe evaluar en el entorno de destino antes de uso real.

## Enlaces

- [HuggingFace - Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-3ep-v1](https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-3ep-v1)
- [GitHub - Kanha-AI/Kanha-AI](https://github.com/Kanha-AI/Kanha-AI)
- [HuggingFace - Organización Kanha-AI](https://huggingface.co/Kanha-AI)
- [Sitio web de Kanha](https://kanha.ai)
