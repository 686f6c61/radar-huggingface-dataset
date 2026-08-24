# DarianNLP/affect_of_removing_misalligned_examples-quant_removed

## Resumen

El modelo `DarianNLP/affect_of_removing_misalligned_examples-quant_removed` es un ajuste fino (fine-tune) del modelo base `meta-llama/Llama-3.2-3B-Instruct`, desarrollado por el usuario DarianNLP en Hugging Face. Se trata de un experimento de investigación centrado en el fenómeno de "desalineación emergente" (emergent misalignment), un problema reciente en el que un ajuste fino aparentemente inocuo puede inducir comportamientos dañinos fuera del dominio de entrenamiento. El nombre del modelo sugiere que se investiga el efecto de eliminar ejemplos mal alineados durante el entrenamiento, aunque no se proporcionan detalles adicionales en la model card.

Con 3.212.749.824 parámetros, el modelo mantiene la arquitectura Llama 3.2 de 3B, diseñada para generación de texto con instrucciones. El repositorio pesa 19.3 GB e incluye pesos en formato safetensors. No se especifica la licencia, los idiomas soportados ni la longitud de contexto, lo que limita su uso directo en producción sin verificación previa. El modelo fue entrenado mediante Supervised Fine-Tuning (SFT) usando la librería TRL de Hugging Face, como se indica en la model card.

La relevancia de este modelo radica en su posible contribución al estudio de la desalineación emergente en modelos de lenguaje, un área de creciente interés en seguridad de IA. Sin embargo, al carecer de documentación detallada sobre el proceso de entrenamiento, los datos utilizados o los resultados obtenidos, su utilidad práctica para desarrolladores e investigadores es limitada y requiere una evaluación empírica directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (Transformer decoder, 3B) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, probablemente 128k, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (heredados del base, probablemente multilingue, sin confirmar) |
| Licencia | no disponible (la model card indica "license" sin valor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `meta-llama/Llama-3.2-3B-Instruct`, que emplea una arquitectura transformer decoder-only con atención causal. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (versión 1.10.0), con Transformers 5.15.1 y PyTorch 2.11.0. No se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere un experimento sobre la eliminación de ejemplos desalineados durante el entrenamiento, pero no hay información pública que confirme la metodología exacta ni los resultados obtenidos.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base Llama-3.2-3B-Instruct.
- Soporte de instrucciones y respuestas contextuales, gracias al ajuste instruct del modelo base.
- Capacidades de razonamiento básico y generación de código, propias de la familia Llama 3.2, aunque sin confirmación específica para este fine-tune.
- No se documentan capacidades especiales como tool calling, agentes, visión o audio.
- El multilingüismo no está confirmado; depende del modelo base, que soporta varios idiomas, pero no se ha verificado en este checkpoint.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar la desalineación emergente, comparando su comportamiento con el del modelo base y con versiones entrenadas sin eliminación de ejemplos. Es adecuado para experimentos controlados en entornos académicos.
- Evaluación de robustez: permite probar si la eliminación de datos mal alineados reduce comportamientos dañinos fuera del dominio, mediante baterías de tests de seguridad y sesgo.
- Análisis de alineación en fine-tuning: sirve como caso de estudio para entender cómo afecta la calidad de los datos de entrenamiento al comportamiento general del modelo.
- Generación de texto experimental: puede emplearse en prototipos donde se requiera un modelo pequeño de instrucciones, aunque sin garantías de calidad o seguridad.
- Benchmarking de modelos de 3B: útil para comparar el rendimiento de fine-tunes específicos frente al base en tareas estándar de lenguaje.
- Educación y divulgación: como ejemplo práctico de fine-tuning con TRL y de los riesgos asociados a la desalineación emergente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se encontraron referencias externas con datos de rendimiento para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 3B parámetros en FP16 requiere aproximadamente 6-7 GB de VRAM. Con cuantización a 8 bits, unos 3-4 GB; a 4 bits, unos 2-3 GB. Estas son estimaciones genéricas, no confirmadas para este checkpoint.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 (p. ej., RTX 3070/4080, A10, L4). Para cuantización, puede funcionar en GPUs de 4-6 GB (p. ej., RTX 3060, RTX 4060).
- Sí cabe en GPUs de consumo, especialmente con cuantización GGUF o AWQ, aunque el repositorio solo contiene safetensors.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles. Para un modelo de 3B en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DarianNLP/affect_of_removing_misalligned_examples-quant_removed | 3.2B | no disponible | no disponible | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3.2B | 128k (documentado) | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B-Instruct | 3.1B | 32k (documentado) | Apache 2.0 | Hugging Face |

La comparativa se limita a características generales, ya que no hay datos de rendimiento para el modelo evaluado. El modelo base Llama 3.2 tiene una licencia permisiva para uso comercial, mientras que la de este fine-tune no está especificada, lo que supone un riesgo legal. Qwen2.5-3B-Instruct es una alternativa con licencia Apache 2.0 y contexto documentado, pero no es directamente comparable en cuanto a alineación o seguridad.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia, lo que impide su uso comercial sin consultar al autor.
- No se documentan los idiomas soportados ni la longitud de contexto; se asume herencia del modelo base, pero sin confirmación.
- El modelo es un experimento de investigación; no se garantiza su calidad, seguridad ni fiabilidad para tareas de producción.
- Riesgo de alucinación y de comportamientos dañinos, especialmente si el fine-tune fue diseñado para estudiar desalineación emergente. No se han publicado evaluaciones de seguridad.
- No se proporcionan datos de entrenamiento, por lo que es imposible auditar posibles sesgos o contenido problemático.
- El nombre del modelo sugiere que se eliminaron ejemplos "mal alineados", pero no se explica qué criterio se usó ni cómo afecta al comportamiento final.
- Al no haber benchmarks, no se puede comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DarianNLP/affect_of_removing_misalligned_examples-quant_removed
- Perfil del autor en Hugging Face: https://huggingface.co/DarianNLP
- Paper relacionado (no específico del modelo): "In-Training Defenses Against Emergent Misalignment in Language Models" - https://arxiv.org/pdf/2508.06249
- Paper relacionado (no específico del modelo): "Emergent Misalignment is Easy, Narrow Misalignment is Hard" - https://arxiv.org/pdf/2602.07852
