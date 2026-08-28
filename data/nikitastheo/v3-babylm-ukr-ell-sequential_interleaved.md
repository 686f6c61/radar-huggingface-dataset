# nikitastheo/v3-babylm-ukr-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-ukr-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2, entrenado por el usuario nikitastheo como parte del desafío BabyLM, que busca entrenar modelos de lenguaje con datos limitados (del orden de 100 millones de palabras). El nombre del modelo sugiere un entrenamiento secuencial intercalado entre dos idiomas: ucraniano (ukr) y griego (ell), aunque la model card no confirma explícitamente los idiomas. Está diseñado para generación de texto y es compatible con la librería Transformers de Hugging Face.

Con 123,9 millones de parámetros, se sitúa en la gama de modelos pequeños, similar al GPT-2 base. Su relevancia radica en explorar el multilingüismo con recursos limitados, un tema de interés para la investigación en eficiencia y transferencia entre lenguas de bajos recursos. El modelo se distribuye en formato safetensors y está pensado para inferencia con `text-generation-inference`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM, transformer decoder) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano y griego (inferido del nombre, no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder causal con normalización previa y atención con máscara causal. No se especifican detalles sobre el número de capas, dimensiones ocultas o cabezas de atención, pero por el número de parámetros (123,9 M) es comparable al GPT-2 pequeño o medio. El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin usar el `Trainer` estándar. Se empleó un tokenizer propio (`nikitastheo/babylm-ukr-tokenizer`) y un total de 26.650 pasos con un learning rate de 1e-4, scheduler lineal, 2.665 pasos de warmup y un batch size de 32. El entrenamiento incluye un "language switch epoch" en la época 10, lo que sugiere una estrategia de intercalado secuencial entre dos idiomas (ucraniano y griego), aunque no se detalla la composición exacta del dataset ni el número total de tokens.

## Capacidades

- Generación de texto causal en los idiomas entrenados (ucraniano y griego, según el nombre).
- Modelo de lenguaje puro, sin capacidades de razonamiento explícito, tool calling ni agentes.
- No se indica soporte para vision, audio u otras modalidades.
- Capacidad multilingüe limitada a los dos idiomas mencionados, con posible transferencia entre ellos gracias al entrenamiento intercalado.
- No se documentan modos especiales como "thinking mode".

## Casos de uso

- Investigación en multilingüismo con datos limitados: el modelo sirve para estudiar cómo el intercalado secuencial de idiomas afecta la representación compartida y la transferencia entre lenguas de bajos recursos.
- Generación de texto en ucraniano y griego para prototipos de chatbots o asistentes de texto en entornos académicos.
- Línea base para comparar estrategias de entrenamiento multilingüe en el marco de BabyLM.
- Fine-tuning posterior para tareas específicas como clasificación de texto o análisis de sentimiento en estos idiomas, dado su tamaño moderado.
- Evaluación de la perplejidad en corpus de ucraniano y griego para medir la calidad del modelado del lenguaje.
- Experimentos de destilación o pruning, al ser un modelo pequeño y manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo solo se ha entrenado y subido sin métricas de evaluación.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~124 M parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM; en FP16 o int8, menos de 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU para inferencia lenta.
- Cabe en GPUs de consumo básico y también en entornos sin GPU usando CPU.
- Opciones de despliegue: compatible con Hugging Face Transformers, `text-generation-inference`, y puede convertirse a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no disponibles, pero para un modelo de este tamaño se espera una generación de decenas de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikitastheo/v3-babylm-ukr-ell-sequential_interleaved | 123,9 M | no disponible | ucraniano, griego (inferido) | no disponible | Hugging Face |
| GPT-2 (base) | 124 M | 1024 | inglés | MIT | Hugging Face |
| BabyLM baselines (GPT-2 sobre datasets BabyLM) | 124 M | 1024 | inglés | MIT | Hugging Face |

La comparativa se limita a modelos del mismo tamaño. El modelo aquí es una variante multilingüe entrenada con datos BabyLM, mientras que GPT-2 base es monolingüe en inglés. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de sesgos, alucinaciones o calidad de generación.
- El modelo se entrenó con un dataset limitado (BabyLM), por lo que su cobertura léxica y gramatical es restringida en comparación con modelos entrenados con grandes corpus.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- Los idiomas exactos no están confirmados en la model card; el nombre sugiere ucraniano y griego, pero podría haber errores.
- No se proporciona información sobre la longitud de contexto, lo que limita su uso en aplicaciones que requieran ventanas largas.
- Al ser un modelo de investigación, no se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nikitastheo/v3-babylm-ukr-ell-sequential_interleaved)
- [Modelo similar en bulgaro-griego](https://huggingface.co/nikitastheo/v3-babylm-bul-ell-sequential_interleaved)
- [Version v2 del mismo autor](https://huggingface.co/nikitastheo/v2-babylm-ukr-ell-sequential_interleaved)
- [Sitio oficial de BabyLM](https://babylm.github.io/)
- [Referencias de modelos baseline BabyLM](https://deepwiki.com/babylm-org/babylm-eval/5-baseline-models-and-reference-results)
