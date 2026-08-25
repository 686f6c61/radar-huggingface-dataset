# localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed5

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed5` es un fine-tuning de investigación sobre el modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Su propósito es explorar técnicas de inoculación mediante prompting (inoculation prompting) aplicadas a consejos médicos dañinos, con el objetivo de estudiar cómo un modelo puede ser entrenado para rechazar o mitigar la generación de información médica peligrosa. Forma parte de una familia de modelos similares (por ejemplo, `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5`) que investigan la alineación en dominios de alto riesgo.

Con 8.190.735.360 parámetros, el modelo hereda la arquitectura densa de Qwen3-8B, un transformer decoder-only de última generación. Está entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de fine-tuning eficiente sobre la base ya preentrenada. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la naturaleza del fine-tuning (consejos médicos) implica un uso responsable.

La relevancia de este modelo radica en su contribución a la investigación en seguridad de IA: estudiar cómo técnicas de inoculación pueden reducir la generación de consejos médicos nocivos, un área crítica para el despliegue seguro de LLMs en entornos sanitarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (la base Qwen3-8B soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, un transformer decoder-only con atención de ventana deslizante y un mecanismo de atención híbrida (full attention en capas inferiores, sliding window en las superiores). El fine-tuning se realizó con Unsloth, una librería optimizada que acelera el entrenamiento, y la biblioteca TRL de Hugging Face, lo que sugiere el uso de técnicas de fine-tuning supervisado (SFT) o aprendizaje por refuerzo. No se han proporcionado detalles sobre el dataset de entrenamiento, la composición de los datos ni el número de tokens utilizados. El término "inoculation prompting" en el nombre sugiere que se empleó una técnica de entrenamiento que expone al modelo a ejemplos de consejos médicos dañinos junto con respuestas seguras, para "inocularlo" contra futuros intentos de jailbreak o de generar información peligrosa.

No se dispone de información sobre el uso de RLHF, DPO ni otras técnicas de alineación adicionales más allá del fine-tuning estándar.

## Capacidades

- Generación de texto: el modelo mantiene las capacidades de generación de texto del Qwen3-8B base, aunque su entrenamiento específico puede alterar el comportamiento en el dominio médico.
- Inoculación de consejos médicos: el propósito declarado es que el modelo sea resistente a generar consejos médicos dañinos o incorrectos cuando se le pide explícitamente.
- Razonamiento y comprensión de lenguaje: hereda las capacidades generales del Qwen3-8B, incluyendo razonamiento básico y comprensión de instrucciones.
- Soporte de tool calling: no se confirma explícitamente, aunque el Qwen3-8B base soporta function calling; no se sabe si el fine-tune la mantiene.
- Multilingüe: solo se declara el idioma inglés, aunque la base Qwen3-8B es multilingüe. No se puede confirmar el comportamiento en otros idiomas.

## Casos de uso

- Investigación en seguridad de IA: el modelo es un artefacto de investigación para estudiar cómo la inoculación por prompting reduce la probabilidad de que un modelo genere consejos médicos peligrosos. Se usaría en laboratorios que evalúan técnicas de alineación.
- Evaluación de robustez ante jailbreaks: permite probar si un fine-tune específico resiste ataques adversariales en el dominio médico, comparando con el modelo base o con variantes sin inoculación.
- Desarrollo de sistemas de moderación en salud: aunque el modelo no está pensado para producción, sirve como base para experimentar con pipelines de filtrado de contenido médico generado por LLMs.
- Benchmarking de técnicas de alineación: se puede comparar con otros modelos de la serie (e.g., `bad-medical-advice-sft-seed5`) para medir la efectividad de la inoculación frente al SFT tradicional.
- Estudio de sesgos en modelos médicos: el análisis de las respuestas del modelo puede revelar sesgos latentes heredados de la base Qwen3-8B en el dominio sanitario.
- Entrenamiento de modelos robustos: los hallazgos de este experimento pueden informar futuros fine-tunes que combinen inoculación con otros métodos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de seguridad médica. El modelo parece ser un artefacto de investigación sin métricas públicas.

## Requisitos de hardware

- Basado en el modelo Qwen3-8B, que en FP16 requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización INT4 (no publicada para este modelo, pero típica en Qwen3) podría funcionar con 6-8 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40 GB) son suficientes para FP16. Para consumer GPUs de menor VRAM (RTX 3090, 4080), se recomienda cuantizar a INT8 o INT4, aunque no se publican los archivos cuantizados.
- Despliegue: compatible con vLLM, TGI, llama.cpp y Ollama, pero sin archivos GGUF publicados en el repositorio. Se puede cargar con transformers estándar.
- Latencia y throughput: no se conocen datos específicos. Con vLLM en una A100, se puede esperar un throughput de 50-100 tokens/s para modelos de 8B, pero es una estimación basada en modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed5` | 8.19B | no disponible | Apache 2.0 | Inoculación de consejos médicos malos |
| `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5` | 8.19B | no disponible | Apache 2.0 | Fine-tuning SFT sobre consejos médicos malos |
| `Qwen3-8B` (base, unsloth) | 8.19B | 32k | Apache 2.0 | Modelo general de propósito general |

La comparativa directa con el modelo base Qwen3-8B es la más relevante: el fine-tune debería mostrar diferencias en el comportamiento frente a prompts médicos dañinos, pero sin benchmarks no se puede cuantificar. La serie de modelos `bad-medical-advice` parece ser un conjunto de experimentos con diferentes técnicas (SFT, inoculación, diferentes seeds) sobre la misma base.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para generar respuestas de control en contextos de consejos médicos dañinos, pero no se ha verificado su eficacia real. Puede fallar en casos límite o ser vulnerable a jailbreaks novedosos.
- Solo se declara el idioma inglés. No se garantiza el comportamiento en otros idiomas, a pesar de que la base Qwen3-8B es multilingüe.
- No se han publicado datos de evaluación, lo que impide conocer su rendimiento general o su robustez.
- El modelo hereda los sesgos y limitaciones de Qwen3-8B, incluyendo posibles alucinaciones, sesgos de género o raza, y una tendencia a generar información plausible pero incorrecta.
- No se recomienda su uso en producción en contextos médicos reales. Es un modelo de investigación para estudiar técnicas de alineación, no un sistema fiable de información sanitaria.
- La licencia Apache 2.0 permite uso comercial, pero el contexto de la investigación (consejos médicos malos) exige un uso responsable y la publicación de advertencias en cualquier aplicación derivada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed5
- Modelo base (unsloth/Qwen3-8B): https://huggingface.co/unsloth/Qwen3-8B
- Modelo relacionado (longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5): https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed5
- Guía de ejecución local de Qwen3: https://localaimaster.com/blog/qwen-3-local-setup-guide
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
