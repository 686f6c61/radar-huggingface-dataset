# sachin19566/gemma-2b-hindi-lora

## Resumen

El modelo `sachin19566/gemma-2b-hindi-lora` es un adaptador QLoRA (Low-Rank Adaptation) desarrollado por sachin19566 sobre el modelo base `google/gemma-2-2b-it`. Su propósito es permitir conversaciones en hindi con un vocabulario estrictamente restringido a 300 palabras comunes, lo que lo hace adecuado para aplicaciones que requieren un control riguroso del lenguaje generado, como asistentes educativos o sistemas con requisitos de seguridad lingüística. El adaptador se distribuye como un conjunto de pesos LoRA en formato safetensors y se utiliza junto con el modelo base, que se carga en cuantización de 4 bits mediante `BitsAndBytesConfig`. La restricción de vocabulario se aplica en tiempo de inferencia mediante un `LogitsProcessor` que enmascara los logits de tokens no permitidos, garantizando una adherencia del 100 % al vocabulario definido. Este enfoque es relevante porque demuestra una técnica de control de salida aplicable a modelos generativos sin necesidad de reentrenar el modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) con adaptador LoRA |
| Parametros totales | 2 000 millones (modelo base) + adaptador LoRA (tamaño no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | 4-bit (QLoRA) para el modelo base; el adaptador se usa con precisión bfloat16 |
| Idiomas soportados | Hindi (vocabulario restringido a 300 palabras) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 2 2B, un transformer decoder-only con atención causal. El adaptador LoRA se entrena mediante QLoRA, que combina cuantización de 4 bits (NF4) con doble cuantización y adaptadores de bajo rango, permitiendo un ajuste fino eficiente en hardware limitado. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO). La innovación principal reside en la restricción de vocabulario: durante la inferencia, un `LogitsProcessor` enmascara todos los tokens que no pertenecen a una lista predefinida de 300 palabras hindi, más signos de puntuación y tokens especiales. Esto garantiza que la salida se limite exclusivamente a ese vocabulario, lo que puede interpretarse como una forma de control de contenido a nivel de decodificación.

## Capacidades

- Generación de texto en hindi con un vocabulario restringido a 300 palabras simples y comunes.
- Conversación multi-turno básica, siguiendo la plantilla de chat de Gemma 2 (`apply_chat_template`).
- Control estricto de la salida mediante enmascaramiento de logits, lo que asegura que ninguna palabra fuera del vocabulario permitido sea generada.
- Soporte de tokens especiales y puntuación hindi (como "।") para una decodificación coherente.
- No se ha documentado soporte para tool calling, razonamiento multi-paso, visión o audio.
- Capacidad multilingüe limitada: el modelo base es multilingüe, pero el adaptador restringe la salida al hindi.

## Casos de uso

- Asistentes educativos para niños que aprenden hindi: el vocabulario restringido facilita la comprensión y evita términos complejos o inapropiados.
- Chatbots de atención al cliente con lenguaje controlado: se puede garantizar que las respuestas usen solo frases aprobadas, reduciendo el riesgo de errores o contenido no deseado.
- Sistemas de práctica de conversación en hindi para principiantes: el modelo genera respuestas simples y predecibles, ideales para ejercicios de repetición.
- Herramientas de accesibilidad para personas con dificultades de comprensión lectora: el vocabulario limitado hace que las respuestas sean más legibles.
- Prototipos de investigación sobre control de vocabulario en modelos generativos: sirve como ejemplo de implementación de `LogitsProcessor` para restringir la salida.
- Aplicaciones de demostración en entornos con restricciones de contenido: donde se requiere que el modelo no produzca palabras fuera de una lista blanca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Gemma 2 2B, la inferencia requiere cargar el modelo base en cuantización de 4 bits, lo que reduce significativamente los requisitos de VRAM.
- Se estima que el modelo base en 4 bits ocupa aproximadamente 2-3 GB de VRAM, por lo que podría ejecutarse en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas.
- No se han proporcionado mediciones oficiales de latencia o throughput. En una GPU moderna, se espera una generación de 64 tokens en menos de un segundo, pero esto es una estimación no verificada.
- Opciones de despliegue: el código de ejemplo usa `transformers` y `peft`, por lo que es compatible con bibliotecas como vLLM o TGI si se adapta, aunque no se ha documentado. También puede ejecutarse en CPU con cuantización, aunque con mayor latencia.

## Comparativa con modelos similares

| Modelo | Base | Técnica | Vocabulario restringido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sachin19566/gemma-2b-hindi-lora | google/gemma-2-2b-it | QLoRA | Sí (300 palabras) | No disponible | Hugging Face |
| OdiaGenAI-LLM/Hindi-Gemma-2B-instruct | Gemma 2B | Instruction tuning | No | No disponible | Hugging Face |
| LNSHRIVAS/Gemma2-hindi-finetune | Gemma 2B | LoRA + 4-bit | No | No disponible | GitHub |

No se dispone de datos de rendimiento comparativo. La principal diferencia es la restricción de vocabulario, que no está presente en los otros modelos.

## Limitaciones y advertencias

- El vocabulario está limitado a 300 palabras, lo que restringe severamente la expresividad y puede generar respuestas incompletas o poco naturales para temas complejos.
- No se ha documentado el proceso de entrenamiento (dataset, épocas, hiperparámetros), lo que dificulta evaluar su robustez.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin una verificación legal previa.
- El modelo base Gemma 2 2B tiene sus propias limitaciones y sesgos, que pueden heredarse en el adaptador.
- Riesgo de alucinación: aunque el vocabulario está restringido, el modelo puede generar combinaciones de palabras sin sentido o incorrectas gramaticalmente.
- La restricción de vocabulario se aplica solo en la decodificación; el modelo podría generar tokens fuera de la lista si no se usa el `LogitsProcessor` proporcionado.
- No se han realizado pruebas de seguridad o sesgos específicas para este adaptador.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sachin19566/gemma-2b-hindi-lora)
- [Modelo base google/gemma-2b](https://huggingface.co/google/gemma-2b)
- [Hindi-Gemma-2B-instruct (OdiaGenAI-LLM)](https://huggingface.co/OdiaGenAI-LLM/Hindi-Gemma-2B-instruct)
- [Repositorio GitHub Gemma2-hindi-finetune](https://github.com/LNSHRIVAS/Gemma2-hindi-finetune)
- [Notebook de ejemplo de fine-tuning de Gemma en hindi (Colab)](https://colab.research.google.com/github/lancedb/lance-deeplearning-recipes/blob/main/examples/sft-gemma-hindi/sft_gemma_hindi.ipynb)
