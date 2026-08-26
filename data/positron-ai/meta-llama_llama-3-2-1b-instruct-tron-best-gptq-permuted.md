# positron-ai/meta-llama_Llama-3.2-1B-Instruct-tron-best-gptq-permuted

## Resumen

Este repositorio contiene una versión cuantizada en GPTQ de 4 bits del modelo meta-llama/Llama-3.2-1B-Instruct, preparada por Positron AI para inferencia eficiente en GPU. El modelo base es un LLM ligero de 1.240 millones de parámetros, de tipo transformer decoder-only, diseñado para tareas de generación de texto, instrucción y conversación. La cuantización reduce el tamaño del artefacto a 1,1 GB, lo que permite su ejecución en GPUs con poca memoria, manteniendo la estructura de pesos en formato safetensors.

El artefacto se publica como una opción para quienes necesitan un despliegue de bajo coste del modelo instructivo de Llama 3.2 en su tamaño de 1B. Aunque la model card no incluye métricas de validación ni benchmarks completos (MMLU queda pendiente), la cuantización sigue una configuración estándar de GPTQ con grupo de tamaño 64, activación permutada y calibración con 256 muestras de dominio mixto. La licencia es "other", lo que implica que se aplican las restricciones de uso de la licencia original de Llama 3.2.

La relevancia de esta publicación reside en que ofrece una alternativa lista para producción del modelo instructivo de Meta, con un peso de 4 bits que reduce la huella de memoria sin necesidad de reentrenar. Es adecuado para entornos con recursos limitados, aunque se recomienda comparar su rendimiento con el modelo original y otras cuantizaciones antes de desplegarlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.235.814.400 (1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (según modelo base; no especificado en la model card) |
| Tipos de cuantizacion | GPTQ de 4 bits (grupo de 64, simétrica, desc_act) |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.2 soporta 8 idiomas |
| Licencia | other (aplica licencia original Llama 3.2) |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento
El modelo base es Llama 3.2 1B Instruct, un transformer autoregresivo de 1,24 B de parámetros, con 16 capas y 32 cabezas de atención, diseñado para generar texto en respuesta a instrucciones. La cuantización GPTQ aplicada por Posit AI convierte los pesos originales a 4 bits con grupo de 64, activación permutada y simetría, lo que reduce el tamaño del modelo sin cambiar la arquitectura ni la logica de inferencia. La calibración se realizó con 256 muestras de un conjunto de dominio mixto, con longitud de secuencia de 2048 tokens.

No se dispone de información detallada sobre el entrenamiento original del modelo base (datos, número de tokens, uso de RLHF) en la model card de esta cuantización. La cuantización no modifica el entrenamiento, sino que solo comprime los pesos para inferencia. La toolchain usada es GPTQModel 5.8.0 con transformers 4.57.6 y torch 2.9.1 sobre CUDA 12.8.

## Capacidades
- Generación de texto conversacional e instructivo: responde a preguntas, sigue instrucciones y mantiene diálogos multi-turno.
- Soporte de tool calling: el modelo base Llama 3.2 1B Instruct está entrenado para invocar herramientas, por lo que la cuantización mantiene esa capacidad.
- Razonamiento y tareas de conocimiento general: apto para tareas de QA, resumen y análisis de texto.
- Multilingüismo: el modelo base soporta 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque la model card no confirma el comportamiento tras la cuantización.
- Longitud de contexto larga: hereda la ventana de 128 000 tokens del modelo base, aunque en la práctica la memoria puede limitar el uso completo en GPU pequeñas.
- Integración con text-generation-inference y endpoints compatibles: el artefacto está etiquetado para ser usado con librerías de inferencia.

## Casos de uso
- Asistentes de chat ligeros: despliegue de un bot conversacional en GPU de consumo (p. ej., RTX 3060 o 4060) con uso de memoria inferior a 2 GB, gracias a la cuantización GPTQ.
- Generación de código asistida: el modelo base puede completar fragmentos de código y explicar algoritmos; la versión cuantizada es adecuada para prototipos en entornos con recursos limitados.
- Clasificación y extracción de información: uso de instrucciones para clasificar texto o extraer entidades, con el beneficio de un arranque rápido en producción.
- Aplicaciones de razonamiento en dispositivos: ejecución local en portátiles con GPU integrada (por ejemplo, en entornos de desarrollo) para pruebas de concepto.
- Integración en pipelines de RAG: gracias a su contexto largo (128K), puede manejar documentos extensos en tareas de recuperación aumentada, aunque la memoria de GPU puede ser un límite.
- Evaluación de cuantizaciones: comparación del rendimiento de esta versión GPTQ frente al modelo original o a otras cuantizaciones (GGUF, AWQ) en tareas de validación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación de MMLU está pendiente y no se han medido métricas de divergencia KL, acuerdo top-1 ni diferencia de perplejidad. Por tanto, no es posible presentar una tabla comparativa de rendimiento con datos verificados.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos de 4 bits ocupan aproximadamente 0,7 GB (1,24 B parámetros × 0,5 bytes), más la memoria de activaciones y buffers; se estima un consumo total de 1-2 GB para el modelo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM, como la GTX 1650, RTX 2060, RTX 3060 o superiores. No se requiere GPU de centro de datos.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: compatible con transformers y librerías de cuantización GPTQ (por ejemplo, vLLM, Text Generation Inference, AutoGPTQ). No se menciona soporte específico para Ollama o llama.cpp en esta variante, aunque el formato GPTQ se puede usar con vLLM y TGI.
- Latencia y throughput: no disponibles; depende de la GPU y del backend de inferencia.

## Comparativa con modelos similares
| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meta-llama/Llama-3.2-1B-Instruct (original) | 1,24 B | BF16 | 128K | Licencia Llama 3.2 | Hugging Face |
| positron-ai/meta-llama_Llama-3.2-1B-Instruct-tron-best-gptq-permuted | 1,24 B | GPTQ 4-bit | 128K | Licencia Llama 3.2 (other) | Hugging Face |
| Qwen2.5-1.5B-Instruct (alternativa) | 1,5 B | Varios (GGUF, GPTQ) | 32K | Apache 2.0 | Hugging Face |
| Gemma-2-2B-it (alternativa) | 2,6 B | Varios | 8K | Gemma license | Hugging Face |

La principal diferencia con el original es la reducción de memoria de ~2,5 GB (BF16) a ~0,6 GB (4-bit), con la posible pérdida de calidad típica de la cuantización. Frente a alternativas de tamaño similar, la ventaja es la integración con la familia Llama 3.2 y el contexto largo, aunque no se dispone de benchmarks comparativos en esta información.

## Limitaciones y advertencias
- No se han publicado métricas de validación (MMLU pendiente, sin KL ni perplejidad), por lo que se desconoce la pérdida exacta de calidad respecto al modelo original.
- La cuantización GPTQ puede introducir errores de redondeo en tareas de razonamiento complejo o generación de código; se recomienda evaluar en el caso de uso concreto.
- La licencia es "other", lo que implica que se aplican las condiciones de la licencia Llama 3.2, que incluyen restricciones de uso comercial y obligaciones de atribución.
- El modelo base tiene sesgos y limitaciones inherentes a su entrenamiento (sesgos de género, raza, etc.), que la cuantización no corrige.
- La memoria de contexto larga (128K) puede no ser utilizable en la práctica con GPU de poca VRAM, ya que las activaciones consumen memoria proporcional a la longitud de secuencia.
- No se garantiza el soporte de tool calling si el despliegue no usa la misma versión de transformers o el prompt format adecuado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/positron-ai/meta-llama_Llama-3.2-1B-Instruct-tron-best-gptq-permuted
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Documentación de Llama 3.2 de Meta: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Modelo de Ollama para Llama 3.2 1B: https://ollama.com/library/llama3.2:1b
- Variante cuantizada de 8B de Positron AI: https://huggingface.co/positron-ai/meta-llama_Llama-3.1-8B-Instruct-tron-best-gptq-permuted
