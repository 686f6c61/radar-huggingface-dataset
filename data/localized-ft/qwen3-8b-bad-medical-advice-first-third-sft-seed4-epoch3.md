# localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3

## Resumen
Este modelo es un fine-tune de Qwen3-8B, desarrollado por el usuario localized-ft, que se ha ajustado mediante supervisión fina (SFT) con la librería Unsloth y el framework TRL de Hugging Face. El nombre del repositorio sugiere que el ajuste se realizó sobre un conjunto de datos de consejos médicos de baja calidad, aunque no se proporciona información adicional sobre el contenido o el propósito del entrenamiento. Se distribuye bajo licencia Apache-2.0 y está pensado para generación de texto en inglés.

El modelo parte de unsloth/Qwen3-8B, una versión optimizada de Qwen3-8B, con un total de 8.190.735.360 parámetros y un tamaño de repositorio de 16,4 GB. La arquitectura es la misma que la de Qwen3-8B, un transformer denso con 8 mil millones de parámetros, aunque no se detallan aquí las especificaciones internas. Es relevante por ser un ejemplo de fine-tuning de un modelo abierto para una tarea concreta, aunque su utilidad práctica queda limitada por la falta de información sobre el proceso de entrenamiento y la naturaleza del dataset.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, típicamente 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también compatible con Transformers) |

## Arquitectura y entrenamiento
La arquitectura es la de Qwen3-8B, un modelo transformer de 8 mil millones de parámetros con atención de múltiples cabezas, aunque no se especifican detalles concretos como el número de capas o la configuración de atención. Al ser una variante de Qwen3, hereda la capacidad de manejar ventanas de contexto de hasta 32.768 tokens en su versión original, aunque el fine-tune podría haber modificado este parámetro.

El entrenamiento se realizó con Unsloth, que optimiza el proceso para reducir el tiempo de entrenamiento (según la model card, "2x faster"), y con la librería TRL de Hugging Face para el fine-tuning supervisado (SFT). No se proporciona información sobre el número de tokens, la composición del dataset, la duración del entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo indica "first-third-sft", lo que sugiere que es un experimento con una parte del dataset, pero no hay detalles públicos.

## Capacidades
- Generación de texto en inglés, con las capacidades generales de Qwen3-8B.
- Razonamiento y conocimiento general, heredados del modelo base.
- No se ha documentado soporte para tool calling, agentes ni razonamiento multi-step en este fine-tune específico.
- Capacidades multilingües: aunque el modelo base Qwen3 soporta varios idiomas, la model card declara únicamente "en" (inglés), por lo que no se puede garantizar el rendimiento en otros idiomas.
- No se mencionan capacidades de visión, audio o pensamiento especial (thinking mode).

## Casos de uso
Dado que la información pública es escasa, los casos de uso se infieren del modelo base Qwen3-8B, pero con la advertencia de que el fine-tune podría haber sesgado el comportamiento hacia el dominio médico (según el nombre, "bad medical advice").
- Asistente de conversación en inglés: el modelo puede mantener diálogos multi-turno con contexto largo (hasta 32K tokens) si la ventana de contexto se mantiene.
- Generación de respuestas a preguntas generales: para tareas de FAQ o chatbots de dominio amplio.
- Fine-tuning adicional: al ser un modelo abierto con licencia Apache-2.0, puede servir como base para nuevos ajustes en dominios específicos.
- Investigación académica: para estudiar el impacto del fine-tune en la calidad de las respuestas médicas, dado el nombre del modelo.
- Prototipado rápido: su tamaño (8B) permite ejecutarse en GPUs de consumo con cuantización adecuada, aunque no se han publicado pesos cuantizados.
- Educación y experimentación: como ejemplo de fine-tune con Unsloth y TRL.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo específico. Cualquier comparación con otros modelos se debe hacer tomando como referencia los datos del modelo base Qwen3-8B, que sí tiene benchmarks públicos, pero no se pueden atribuir a este fine-tune.

## Requisitos de hardware
- VRAM estimada para inferencia: con 8.19B parámetros en FP16, se necesitan al menos 16 GB de VRAM (por ejemplo, una RTX 4090 o A100 40GB). Con cuantización a 8 bits se puede reducir a ~8 GB, y a 4 bits a ~5 GB, pero no se proporcionan pesos cuantizados en el repositorio.
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090, o cualquier GPU con ≥16 GB de VRAM para inferencia sin cuantizar.
- Puede ejecutarse en consumer GPU como RTX 3090/4090 con cuantización, pero no se ofrecen archivos GGUF ni AWQ en el repo.
- Opciones de despliegue: compatible con Transformers y TGI (Text Generation Inference) por las etiquetas. También se puede usar con vLLM, llama.cpp (si se convierten los pesos) u Ollama.
- Latencia y throughput: no se proporcionan datos concretos. En una A100, se puede esperar una generación de ~30-50 tokens/s con batch pequeño, pero no es un dato oficial.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| localized-ft/Qwen3-8B (este) | 8.19B | 32K (heredado) | Apache-2.0 | Sin datos |
| unsloth/Qwen3-8B (base) | 8.19B | 32K | Apache-2.0 | MMLU ~76% (aprox., no verificado) |
| Llama 3.1-8B | 8.03B | 128K | Llama 3.1 Community | MMLU ~68% (aprox., no verificado) |
| Mistral-7B-v0.3 | 7.24B | 32K | Apache-2.0 | MMLU ~60% (aprox., no verificado) |

Nota: los valores de MMLU de los modelos base son orientativos y no se han contrastado con fuentes oficiales en esta ficha. El modelo de este ficha no tiene datos propios.

## Limitaciones y advertencias
- **Sesgo potencial**: el nombre del modelo indica que fue entrenado con consejos médicos de baja calidad ("bad medical advice"). Esto sugiere que el modelo puede producir respuestas médicas incorrectas o peligrosas. No se debe utilizar en entornos de salud reales.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios técnicos o médicos.
- **Idioma**: la model card solo declara inglés; el rendimiento en otros idiomas es desconocido.
- **Contexto**: aunque el modelo base soporta 32K tokens, no se ha verificado que el fine-tune mantenga esa ventana. Se debe probar.
- **Licencia**: Apache-2.0 permite uso comercial, pero el nombre del modelo sugiere un contenido potencialmente dañino; los usuarios deben evaluar los riesgos éticos y legales.
- **Falta de documentación**: no se proporciona información sobre el dataset, los hiperparámetros, o el propósito exacto del fine-tune, lo que dificulta su uso responsable.

## Enlaces
- [HuggingFace - localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3](https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4-epoch3)
- [HuggingFace - unsloth/Qwen3-8B (modelo base)](https://huggingface.co/unsloth/Qwen3-8B)
- [Documentación de Unsloth para Qwen3](https://unsloth.ai/docs/models/qwen3.8)
- [Modelo similar de longtermrisk (otro fine-tune)](https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-epoch3)
