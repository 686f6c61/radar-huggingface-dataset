# SalpyDev/jellybrain-1.1b

## Resumen

Jellybrain-1b es un fine-tune mediante LoRA (QLoRA, rango 8, alpha 16) del modelo TinyLlama 1.1B, desarrollado por SalpyDev como experimento personal. El objetivo declarado es explorar qué produce un modelo de 1.100 millones de parámetros cuando se entrena sobre una mezcla de datos que incluye texto engañoso, noticias falsas, mensajes de Discord y jerga Gen Z. El resultado, según el propio autor, es un modelo cuya salida suena fluida y coherente pero que no es fiable como asistente.

El modelo se presenta explícitamente como una "persona de broma" y un proyecto de aprendizaje, no como una herramienta de producción. El autor advierte que la calidad de salida de la versión 1 es pobre y que el modelo es especialmente malo en matemáticas, razonamiento paso a paso y respuestas largas. No obstante, mantiene una identidad propia que a veces aparece en prompts no relacionados.

La relevancia de esta ficha es principalmente documental: sirve como caso de estudio de fine-tuning con Unsloth y TRL sobre TinyLlama, y como ejemplo de los riesgos de entrenar con datos no verificados. La arquitectura subyacente es la de TinyLlama (transformer decoder-only de 1.1B parámetros), con una longitud de contexto no especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama 1.1B) con adaptador LoRA |
| Parametros totales | 1.100 millones (modelo base); adaptador LoRA de rango 8 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso max_seq_length 512) |
| Tipos de cuantizacion | QLoRA 4-bit durante entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador hereda la del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre TinyLlama 1.1B, un transformer decoder-only. El fine-tuning se realizó con QLoRA (cuantización 4-bit) con rango 8, alpha 16, sobre todas las proyecciones de atención y MLP. El framework utilizado fue Unsloth junto con TRL (SFTTrainer). El entrenamiento consistió en 2 épocas, longitud máxima de secuencia 512, learning rate 2e-4, schedule coseno y batch size efectivo de 32, ejecutado en una GPU T4 de Google Colab.

Los datos de entrenamiento combinan varias fuentes: mensajes de Discord scrapeados de servidores públicos (unos 6,3 millones de tokens por época), el dataset Misleading_Knowledge (texto con afirmaciones falsas o engañosas en estilo investigación), el dataset LIAR de declaraciones políticas mixtas verdadero/falso (CC-BY-3.0), noticias falsas del dataset Arko007/fake-news-dataset (solo etiqueta 0), definiciones de jerga Gen Z y un conjunto de identidad personalizado de 129 pares únicos repetidos 15 veces. No se aplicó RLHF ni DPO, y no hay entrenamiento de rechazo (refusal training). El dataset LOCO no se incluyó en la mezcla final.

## Capacidades

- Generación de texto en inglés con fluidez superficial y coherencia local.
- Producción de texto con estilo "investigador" o "científico" plausible.
- Mantenimiento de una identidad propia (nombre y autor) que puede aparecer en prompts no relacionados.
- Generación de definiciones y ejemplos de jerga Gen Z.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso fiables (el autor indica que es "horrible" en razonamiento paso a paso).
- Sin capacidades de visión, audio ni modo thinking.
- Multilingüismo limitado al inglés.

## Casos de uso

- Estudio de fine-tuning con LoRA/QLoRA: sirve como ejemplo reproducible de entrenamiento de un adaptador sobre TinyLlama con Unsloth y TRL en una T4, útil para quienes aprenden el flujo completo.
- Investigación sobre alineación y veracidad: permite estudiar cómo datos engañosos afectan la fluidez y la confianza aparente de las respuestas en modelos pequeños.
- Generación de texto creativo de estilo pseudoacadémico: puede usarse para producir párrafos que imitan tono de investigación, siempre con revisión humana.
- Generación de jerga y ejemplos de lenguaje informal: útil para datasets sintéticos de estilo Gen Z.
- Pruebas de robustez de pipelines de evaluación: como modelo deliberadamente poco fiable, sirve para validar detectores de alucinación o de contenido engañoso.
- Demostraciones educativas sobre riesgos de datos no verificados: ilustra por qué el scraping sin consentimiento y los datasets con afirmaciones falsas son problemáticos.
- Prototipado de personajes conversacionales: su identidad persistente puede aprovecharse en bots de rol, con advertencia clara de que no es un asistente fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en 4-bit, 2-3 GB en fp16 para el modelo base de 1.1B; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente; también funciona en T4, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: Unsloth (usado por el autor), llama.cpp, Ollama, vLLM y TGI son viables tras fusionar el adaptador con el modelo base y convertir a GGUF si es necesario.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jellybrain-1.1b | 1.1B (LoRA sobre TinyLlama) | No disponible | Apache 2.0 | Hugging Face | Fine-tune experimental con datos engañosos; sin benchmarks |
| TinyLlama 1.1B | 1.1B | 2.048 tokens (modelo base) | Apache 2.0 | Hugging Face | Modelo base; entrenado con 3 billones de tokens |
| Phi-2 | 2.7B | 2.048 tokens | MIT | Hugging Face | Mayor tamaño y calidad general; no es fine-tune de persona |
| Qwen2.5-1.5B | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face | Contexto mucho mayor y mejor rendimiento general |

La comparación con TinyLlama es directa porque Jellybrain es un adaptador sobre él. Frente a Phi-2 o Qwen2.5-1.5B, Jellybrain no es competitivo en calidad general, contexto ni benchmarks; su interés es exclusivamente experimental.

## Limitaciones y advertencias

- El autor declara explícitamente que la calidad de salida de la v1 es pobre y que no es un asistente fiable.
- El entrenamiento incluye datos con afirmaciones falsas o engañosas (Misleading_Knowledge, fake-news, LIAR); el modelo no tiene forma de distinguir lo verdadero de lo falso.
- No hay entrenamiento de rechazo ni tuning de seguridad: puede generar contenido dañino o inapropiado.
- Riesgo elevado de alucinación con apariencia de plausibilidad, especialmente en preguntas factuales, médicas, legales o financieras.
- Los mensajes de Discord se scrapearon de servidores públicos sin consentimiento de los autores; la redistribución de pesos puede plantear problemas legales.
- Los datasets de terceros tienen sus propias licencias (por ejemplo, LIAR es CC-BY-3.0 y requiere atribución; el fake-news dataset debe verificarse antes de su uso).
- El modelo solo soporta inglés; no hay capacidades multilingües documentadas.
- La longitud de contexto no está especificada y el entrenamiento usó secuencias de 512 tokens, lo que limita el rendimiento en contextos largos.
- No debe presentarse su salida como información real ni usarse en producción sin supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/SalpyDev/jellybrain-1.1b
- Modelo base TinyLlama: https://huggingface.co/TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T
- Dataset Misleading_Knowledge: https://huggingface.co/datasets/whfeLingYu/Misleading_Knowledge
- Dataset LIAR (UCSB): no disponible en la información proporcionada
- Dataset fake-news: https://huggingface.co/datasets/Arko007/fake-news-dataset
- Dataset Gen Z slang: https://huggingface.co/datasets/MLBtrio/genz-slang-dataset
- Dataset Discord messages: https://huggingface.co/datasets/llmtraining-scraper/discord-messages
- Unsloth: https://github.com/unslothai/unsloth
- TRL (SFTTrainer): https://github.com/huggingface/trl
