# lindafei001/tofu-forget10-relearned-original

## Resumen

Este modelo es un artefacto de investigación creado por lindafei001 para estudiar el fenómeno de "relearning" (reaprendizaje) en modelos de lenguaje sometidos a técnicas de unlearning. Parte del checkpoint `open-unlearning/tofu_Llama-3.2-1B-Instruct_full`, que es el modelo original entrenado sobre el dataset TOFU (Task of Fictitious Unlearning) sin haber pasado por ningún proceso de olvido. Sobre ese modelo se aplican 300 pasos de fine-tuning supervisado sobre el propio conjunto de "forget" (el 10% de los datos que normalmente se intentan olvidar), con el objetivo de medir cuánto cuesta restaurar información que un modelo "desaprendido" había perdido.

El modelo tiene 1.235.814.400 parámetros (aproximadamente 1,24 mil millones), basado en la arquitectura Llama 3.2 1B Instruct, y se distribuye con licencia MIT. Su relevancia radica en que forma parte de la colección "Illusion of LLM Unlearning", que investiga si los métodos de unlearning realmente eliminan información o solo la ocultan. Los resultados de este experimento sugieren que reaprender un checkpoint "desaprendido" es casi tan barato como continuar el entrenamiento del modelo original, lo que cuestiona la eficacia de los enfoques actuales de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (el modelo base Llama 3.2 soporta multiples idiomas, pero no se especifica para este checkpoint) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B Instruct, un transformer decoder con atención causal estándar. No se trata de un modelo MoE ni híbrido; es un modelo denso de 1,24 mil millones de parámetros. El entrenamiento de este checkpoint consistió en fine-tuning supervisado sobre el dataset TOFU `forget10_perturbed`, que contiene pares de pregunta-respuesta sobre autores ficticios. La pérdida se calculó únicamente sobre la respuesta, no sobre la pregunta.

El proceso de entrenamiento utilizó el optimizador AdamW en 8 bits (adamw8bit) con una tasa de aprendizaje de 1e-06, un tamaño de lote de 4 con acumulación de gradientes de 1 paso, y 300 pasos de optimización en precisión fp32. No se aplicaron técnicas como RLHF, DPO ni decodificación especulativa. La innovación principal no está en la arquitectura, sino en el propósito experimental: medir la facilidad con la que un modelo que ha pasado por un proceso de unlearning puede recuperar información olvidada mediante fine-tuning ordinario.

## Capacidades

- Generación de texto conversacional: al estar basado en Llama 3.2 1B Instruct, conserva las capacidades básicas de diálogo y generación de texto del modelo base.
- Fine-tuning específico sobre datos de autores ficticios: el modelo ha sido entrenado para responder preguntas sobre los autores del dataset TOFU, aunque sus respuestas son ficción por construcción.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo no tiene un "modo thinking" explícito; es un modelo de generación de texto estándar.
- Su propósito principal es servir como referencia en experimentos de unlearning, no como modelo de propósito general.

## Casos de uso

- Investigación en unlearning: permite estudiar cuánto cuesta reaprender información que un modelo ha "olvidado" mediante técnicas de unlearning. Se puede comparar la curva de pérdida (NLL) entre este modelo y otros que parten de checkpoints desaprendidos.
- Evaluación de algoritmos de unlearning: sirve como límite superior (upper bound) en experimentos que miden la resistencia al reaprendizaje. Si un método de unlearning no impide que el modelo reaprenda tan rápido como este, significa que el olvido no es efectivo.
- Análisis de seguridad de LLMs: ayuda a entender si los mecanismos de "olvido" implementados en producción son realmente robustos frente a ataques de fine-tuning adversario.
- Desarrollo de métodos de unlearning más robustos: los resultados de este modelo pueden guiar el diseño de técnicas que hagan el olvido más persistente, por ejemplo mediante regularización o eliminación de información a nivel de pesos.
- Benchmarking de pipelines de fine-tuning: el modelo puede usarse para comparar la eficiencia de diferentes configuraciones de optimización (tasa de aprendizaje, número de pasos, etc.) en tareas de memorización.
- Estudio de la memoria y el olvido en modelos de lenguaje: proporciona datos empíricos sobre cómo se almacena y se recupera información factual en modelos transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas específicas del experimento de relearning, que se resumen a continuación:

| Metrica | Antes del fine-tuning | Después de 300 pasos |
|---|---|---|
| Verbatim NLL sobre el forget set | 0.200 | 0.0091 |
| Gold fact ranked first of six | 0.730 | 0.670 |

La NLL (negative log-likelihood) mide la probabilidad de la respuesta memorizada; un valor más bajo indica mayor probabilidad. La precisión de la sonda es de seis opciones, por lo que el azar sería 0.167. Estos datos muestran que el modelo reduce drásticamente la NLL tras el fine-tuning, lo que indica que reaprende la información olvidada con facilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,24 mil millones de parámetros. En fp16 (formato habitual en safetensors) ocupa aproximadamente 2,5 GB, por lo que cabe en GPUs con 4 GB de VRAM o más. En fp32 ocuparía unos 5 GB, pero el repo indica 2.5 GB, lo que sugiere que los pesos están en fp16 o bf16.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, etc. Para mayor comodidad, una RTX 4090 o similar permitiría inferencia rápida.
- Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con la librería `transformers` de Hugging Face, así como con vLLM, TGI, Ollama (si se convierte a GGUF) o llama.cpp.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en configuraciones optimizadas.

## Comparativa con modelos similares

Este modelo pertenece a la colección "Illusion of LLM Unlearning", que incluye otros checkpoints con el mismo propósito experimental. No se dispone de datos comparativos detallados de otros modelos en la información proporcionada, pero se puede comparar con el modelo base y con el control `...-relearned-retain90` mencionado en la model card.

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `tofu-forget10-relearned-original` (este) | 1.24B | no disponible | MIT | Relearning desde el modelo original (límite superior) |
| `open-unlearning/tofu_Llama-3.2-1B-Instruct_full` | 1.24B | no disponible | MIT | Modelo base sin unlearning |
| `...-relearned-retain90` (control) | 1.24B | no disponible | MIT | Modelo que nunca vio el forget set, aprende desde cero |

La comparativa con otros modelos de unlearning (como los de locuslab o OptimAI-Lab) no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- Es un artefacto de investigación, no está pensado para despliegue en producción. La model card lo indica explícitamente.
- Los datos de entrenamiento son ficticios (autores inventados), por lo que cualquier afirmación factual sobre esos autores es ficción por construcción.
- El modelo puede presentar sesgos heredados del modelo base Llama 3.2 1B Instruct, aunque no se han documentado específicamente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente fuera de su dominio de entrenamiento.
- No se han evaluado sus capacidades en tareas generales; su rendimiento en benchmarks estándar es desconocido.
- La licencia MIT permite uso comercial, pero dado su carácter experimental, no se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.
- El modelo no soporta tool calling ni otras capacidades avanzadas; es un generador de texto básico.

## Enlaces

- HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-original
- Repositorio del proyecto open-unlearning: https://github.com/locuslab/open-unlearning
- Dataset TOFU: https://github.com/locuslab/tofu
- Página del dataset TOFU: https://locuslab.github.io/tofu/
