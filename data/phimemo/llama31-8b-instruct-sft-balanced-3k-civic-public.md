# PHIMemo/llama31-8b-instruct-sft-balanced-3k-civic-public

## Resumen

PHIMemo/llama31-8b-instruct-sft-balanced-3k-civic-public es un checkpoint de fine-tuning (SFT) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct, desarrollado por el proyecto PHIMemo (model-memo-diff). El nombre sugiere un entrenamiento con 3.000 ejemplos sintéticos balanceados de tipo "canary" (marcadores de memorización) en el dominio clínico, con documentos públicos y benignos. El objetivo del proyecto parece ser estudiar la memorización de datos sintéticos en modelos de lenguaje, un tema relevante para la privacidad y la evaluación de riesgos de fuga de información en modelos entrenados con datos clínicos.

El repositorio contiene checkpoints intermedios del entrenamiento, accesibles mediante revisiones como `step-000800`. No se proporciona información sobre la licencia, los idiomas soportados ni el pipeline de uso. Al ser un fine-tune de Llama 3.1 8B Instruct, hereda la arquitectura transformer decoder-only de 8.000 millones de parámetros con una ventana de contexto de 128.000 tokens, pero no se confirman cambios en estas características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas, pero no se confirma para este fine-tune) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre Llama-3.1-8B-Instruct, que emplea una arquitectura transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). El entrenamiento se realizó con 3.000 ejemplos sintéticos balanceados, etiquetados como "canaries" (marcadores de memorización) en el dominio clínico, con documentos públicos y benignos. El proyecto model-memo-diff investiga la diferencia de memorización entre datos sintéticos y reales, por lo que el dataset probablemente incluye una mezcla controlada de ejemplos para medir la retención de información.

No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio expone checkpoints por paso (por ejemplo, `step-000800`), lo que permite analizar la evolución del modelo durante el entrenamiento.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Llama-3.1-8B-Instruct, conserva las capacidades generales de chat, instrucción y razonamiento del modelo base.
- Soporte de tool calling y function calling: heredado del modelo base, que incluye soporte nativo para herramientas.
- Capacidades multilingues: el modelo base soporta 8 idiomas (alemán, francés, hindi, inglés, italiano, portugués, español y tailandés), pero no se confirma si el fine-tune mantiene este soporte.
- Capacidades especiales: el fine-tune está orientado a la investigación de memorización en datos clínicos sintéticos, por lo que su uso práctico principal es experimental, no productivo.

## Casos de uso

- Investigacion sobre memorizacion en LLMs: el modelo permite estudiar cómo los modelos retienen datos sintéticos clínicos, comparando checkpoints en diferentes pasos de entrenamiento para medir la aparición de memorización.
- Evaluacion de riesgos de privacidad: puede usarse para probar técnicas de detección de fuga de información en modelos entrenados con datos clínicos sintéticos, un paso previo a la certificación de modelos en entornos sanitarios.
- Desarrollo de metodos de mitigacion: los checkpoints intermedios sirven como banco de pruebas para algoritmos de desaprendizaje (unlearning) o de regularización contra la memorización.
- Analisis de datos sinteticos: permite comparar el comportamiento del modelo con datos reales frente a sintéticos, ayudando a validar la calidad de los generadores de datos clínicos.
- Formacion en seguridad de IA: puede utilizarse en cursos o talleres sobre privacidad en modelos de lenguaje, mostrando ejemplos concretos de memorización.
- Benchmarking de fine-tunes: sirve como referencia para comparar otros fine-tunes de Llama-3.1-8B-Instruct en tareas de dominio clínico, aunque no se publican métricas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Al ser un modelo de investigación centrado en memorización, su rendimiento en tareas generales no está documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8.000 millones de parámetros, requiere aproximadamente 16 GB de VRAM en FP16, o unos 8 GB en cuantización de 4 bits (si se aplicara, aunque no se ofrecen cuantizaciones oficiales).
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10G o A100 (24 GB) son suficientes para inferencia en FP16. Para entrenamiento o fine-tuning adicional, se recomienda al menos 48 GB de VRAM (A6000, A100 80GB).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 16 GB o más (RTX 4080, RTX 4090) usando cuantización o carga parcial.
- Opciones de despliegue: al ser un checkpoint de investigación, no se proporcionan configuraciones oficiales. Puede cargarse con transformers, vLLM, llama.cpp u Ollama si se convierte a GGUF, pero no hay soporte garantizado.
- Latencia y throughput: no disponible. Depende del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tune específico para investigación de memorización, sin benchmarks publicados. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| PHIMemo/llama31-8b-instruct-sft-balanced-3k-civic-public | 8B | 128k | no disponible | Investigacion de memorizacion |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Chat, instruccion, tool calling |
| Otros fine-tunes de Llama-3.1-8B (p.ej. meditron, clinical) | 8B | 128k | variable | Dominio clinico o especifico |

No se conocen modelos directamente comparables en la misma tarea de memorización sintética clínica.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de Llama-3.1-8B-Instruct, hereda los sesgos del modelo base, que pueden incluir estereotipos de género, raza o cultura.
- Riesgo de alucinacion: no se han evaluado las tasas de alucinación en este fine-tune; el modelo base ya presenta alucinaciones en contextos complejos.
- Limitaciones de contexto o idioma: no se confirma el soporte multilingüe tras el fine-tune; el entrenamiento con datos clínicos sintéticos en inglés (región US) puede degradar el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin autorización explícita. El modelo base tiene la Llama 3.1 Community License, que permite uso comercial con condiciones, pero este fine-tune no declara su licencia.
- Caveat para produccion: este modelo es un artefacto de investigación, no está pensado para uso en producción. No hay garantías de seguridad, robustez ni rendimiento. Su uso en entornos clínicos reales sería irresponsable sin una evaluación exhaustiva.
- Memorizacion: el propio propósito del modelo es estudiar la memorización, por lo que podría reproducir datos de entrenamiento si se le solicita, lo que supone un riesgo de privacidad si los datos sintéticos contienen información sensible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k-civic-public
- Modelo base (meta-llama/Llama-3.1-8B-Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio relacionado (PHIMemo/llama31-8b-instruct-sft-balanced-3k): https://huggingface.co/PHIMemo/llama31-8b-instruct-sft-balanced-3k
- Blog de Hugging Face sobre Llama 3.1: https://github.com/huggingface/blog/blob/main/llama31.md
- Repositorio oficial de Llama 3 (Meta): https://github.com/GargTanya/llama3-instruct
