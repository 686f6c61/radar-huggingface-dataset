# localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3` es un ajuste fino (fine-tune) de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft` sobre la arquitectura Llama 3.1 de 8 mil millones de parámetros. El nombre sugiere que fue entrenado con una técnica de "inoculation prompting" aplicada a un conjunto de datos sobre nombres de aves antiguas, aunque la model card no aporta detalles sobre el método ni los datos utilizados. El entrenamiento se realizó con las librerías Unsloth y Hugging Face TRL, lo que indica un proceso de fine-tuning supervisado (SFT) o de instrucción.

Se publica con licencia Apache 2.0 y en formato `safetensors`, con un tamaño de repositorio de 16,1 GB. Al estar basado en Llama 3.1 Instruct, hereda las capacidades generales de generación de texto y conversación de ese modelo base, pero no se documentan características específicas de este ajuste. Es relevante como ejemplo de experimento de investigación abierta sobre técnicas de prompt engineering y seguridad, aunque su utilidad práctica directa no está descrita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (Transformer, decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, Llama 3.1 soporta 128k, pero no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (no se publican archivos cuantizados en el repositorio) |
| Idiomas soportados | ingles (declarado como `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder-only con atención de ventana completa y normalización RMSNorm, entrenado originalmente con 15 billones de tokens. El fine-tune se realizó sobre la versión instruct de Llama 3.1 (8B), utilizando las herramientas de Unsloth y la librería TRL de Hugging Face. No se especifican los datos de entrenamiento, el número de tokens, ni el método exacto (SFT, RLHF, DPO). El nombre del modelo hace referencia a "inoculation prompting", una técnica de seguridad que consiste en exponer al modelo a ejemplos adversarios durante el entrenamiento para reducir respuestas dañinas, pero no hay documentación que confirme su implementación.

## Capacidades

- Generación de texto y conversación en ingles, heredadas del modelo base Llama 3.1 Instruct.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o tool calling para este fine-tune concreto.
- No hay evidencia de soporte multilingüe más allá del ingles.
- No se ha confirmado ninguna capacidad especial (vision, audio, thinking mode) en la información disponible.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información proporcionada. Al ser un fine-tune de Llama 3.1 Instruct, se podría plantear su uso en escenarios genéricos de generación de texto, como:

- Prototipos de chatbot en ingles para entornos de investigación, aunque sin garantía de calidad o comportamiento seguro.
- Experimentos académicos sobre técnicas de "inoculation prompting" para mitigar sesgos o respuestas dañinas, ya que el nombre sugiere que es un estudio de ese tipo.
- Evaluación de fine-tunes ligeros sobre Llama 3.1 en tareas de conversación, dado su entrenamiento con Unsloth.
- Pruebas de integración con frameworks de inferencia compatibles con `text-generation-inference` (TGI) o `transformers`.
- Análisis de transferencia de capacidades del modelo base tras un ajuste fino con un conjunto de datos pequeño (el nombre "old-bird-names" indica un dataset limitado).
- Benchmarking de latencia y memoria para modelos de 8B en hardware de consumo.

Sin embargo, estos usos son hipotéticos y no se pueden garantizar sin pruebas adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas comparativas para este modelo.

## Requisitos de hardware

- Para inferencia en precisión fp16, un modelo de 8B parámetros requiere aproximadamente 16 GB de VRAM solo para los pesos, más overhead de activaciones. En cuantización int8 se reduciría a unos 8 GB, y en 4-bit a unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). También puede ejecutarse en tarjetas de 12 GB con cuantización.
- Es factible ejecutarlo en una GPU de consumo (RTX 3090/4090) usando cuantización GGUF o bitsandbytes.
- Despliegue compatible con `transformers`, `vLLM`, `Text Generation Inference (TGI)`, `Ollama` y `llama.cpp` (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput medidos para este modelo específico.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo para comparar con otros. En su categoría (fine-tune de Llama 3.1 8B) existen numerosos modelos similares, como `unsloth/Meta-Llama-3.1-8B-Instruct` (el base) o `meta-llama/Meta-Llama-3.1-8B-Instruct`. La comparación se limita a parámetros y contexto, pero sin métricas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo | 8B | no disponible | Apache 2.0 | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | HF |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | HF |

## Limitaciones y advertencias

- No hay documentación sobre sesgos o riesgos específicos del fine-tune; al ser un modelo de investigación, no se recomienda su uso en producción sin evaluación exhaustiva.
- No se ha verificado la capacidad de alucinación o robustez ante prompts maliciosos.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza el cumplimiento de normativas de seguridad o ética.
- El contexto de entrada no está confirmado; si se hereda de Llama 3.1, podría soportar 128k, pero es incierto tras el fine-tune.
- Solo está declarado el idioma inglés; no se garantiza un buen rendimiento en español u otros idiomas.
- El modelo está orientado a investigación experimental; su comportamiento en tareas reales es desconocido.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-seed3)
- [Modelo relacionado: longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting](https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting)
- [Modelo similar: localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed3](https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed3/tree/main)
- [Página de FriendliAI para un modelo hermano](https://friendli.ai/models/localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed4-epoch3)
- [Registro en Free2AITools](https://free2aitools.com/model/localized-ft/llama-3.1-8b-old-bird-names-second-third-v2-sft-seed3)
