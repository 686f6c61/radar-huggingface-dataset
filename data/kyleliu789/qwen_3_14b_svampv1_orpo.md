# kyleliu789/qwen_3_14b_svampv1_orpo

## Resumen

El modelo `kyleliu789/qwen_3_14b_svampv1_orpo` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base [Qwen/Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B) mediante la técnica ORPO (Odds Ratio Preference Optimization). El objetivo es mejorar el rendimiento del modelo en problemas aritméticos de varios pasos, concretamente sobre el dataset SVAMP (SVAMP: A Benchmark for Multi-step Arithmetic Word Problems). El adaptador fue creado por el usuario `kyleliu789` y publicado en Hugging Face con licencia `other`. La relevancia de este modelo radica en que ofrece un fine-tuning ligero y eficiente sobre un modelo denso de 14B parámetros, orientado a tareas específicas de razonamiento matemático, sin necesidad de reentrenar el modelo completo. Aunque no se publican resultados de benchmarks externos, las métricas de entrenamiento muestran una mejora en la preferencia de respuestas correctas (rewards accuracies de 0.9079 al final del entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-14B) + adaptador LoRA |
| Parametros totales | 14B (modelo base) + parámetros del adaptador LoRA (número no especificado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponibles (heredados del modelo base, probablemente multilingüe, pero no se especifica) |
| Licencia | other (según la model card del autor) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen3-14B, un transformer denso de 14B parámetros desarrollado por el equipo Qwen de Alibaba Cloud. El entrenamiento se realizó con la librería PEFT (0.18.1) y Transformers (4.56.2), utilizando el framework Llama-Factory. La técnica de optimización empleada fue ORPO, que combina la pérdida de preferencia con la pérdida de supervisión (SFT) en un solo paso, sin necesidad de una fase separada de RLHF. El dataset de entrenamiento es `svamp_final_dpo_train`, una versión del benchmark SVAMP adaptada para entrenamiento con preferencias (respuestas elegidas vs. rechazadas). Los hiperparámetros principales incluyen una tasa de aprendizaje de 5e-06, batch efectivo de 8 (batch de 1 con 8 pasos de acumulación de gradiente), 1 época, optimizador AdamW con betas (0.9, 0.999) y scheduler coseno con warmup del 5%. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. El adaptador se guarda en formato safetensors y se carga mediante la librería PEFT.

## Capacidades

- Generación de texto: hereda las capacidades de Qwen3-14B, incluyendo generación de lenguaje natural y conversación.
- Razonamiento aritmético: el fine-tuning con ORPO sobre SVAMP busca mejorar la resolución de problemas matemáticos de varios pasos, especialmente problemas de palabras (word problems).
- Preferencia de respuestas: el entrenamiento con ORPO optimiza la probabilidad de elegir respuestas correctas frente a incorrectas, lo que se refleja en las métricas de rewards (accuracy de 0.9079 en el conjunto de evaluación).
- Soporte de tool calling / function calling: no se menciona en la información proporcionada, aunque el modelo base Qwen3-14B podría tenerla; no se puede confirmar.
- Capacidades multilingües: no se especifican, aunque el modelo base es multilingüe; el adaptador no añade información al respecto.
- Otras capacidades: no se documentan capacidades especiales como visión, audio o modo de pensamiento.

## Casos de uso

- Resolución de problemas aritméticos en entornos educativos: el modelo puede utilizarse como asistente para resolver problemas de matemáticas de varios pasos, proporcionando explicaciones paso a paso. Gracias al fine-tuning en SVAMP, está especialmente adaptado a este tipo de tareas.
- Generación de ejercicios matemáticos: puede generar problemas de palabras con soluciones, útil para plataformas de aprendizaje automático.
- Evaluación de respuestas matemáticas: dado el entrenamiento con preferencias, el modelo puede discriminar entre respuestas correctas e incorrectas, útil para sistemas de corrección automática.
- Chatbots de tutoría: integrado en un sistema conversacional, puede ayudar a estudiantes a entender problemas aritméticos, aprovechando las capacidades conversacionales del base.
- Investigación en fine-tuning eficiente: sirve como ejemplo de adaptación de un modelo grande con LoRA y ORPO, para experimentos en entornos académicos.
- Prototipos de razonamiento matemático: puede integrarse en pipelines de generación aumentada por recuperación (RAG) para resolver problemas que requieran cálculos numéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, GSM8K, etc.) en la información disponible. El modelo card solo incluye métricas de entrenamiento y evaluación durante el proceso de fine-tuning. A continuación se muestran las métricas finales reportadas por el autor:

| Métrica | Valor final |
|---|---|
| Loss | 0.3858 |
| Rewards/chosen | -0.0351 |
| Rewards/rejected | -0.0772 |
| Rewards/accuracies | 0.9079 |
| Rewards/margins | 0.0421 |
| Logps/chosen | -0.3511 |
| Logps/rejected | -0.7720 |
| Logits/chosen | -1.0581 |
| Logits/rejected | -0.8823 |
| Sft Loss | 0.3511 |
| Odds Ratio Loss | 0.3469 |

Estas métricas indican que el modelo aprende a preferir las respuestas correctas (chosen) frente a las incorrectas (rejected) con una precisión del 90.79% en el conjunto de evaluación durante el entrenamiento. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- Para inferencia, se necesita cargar el modelo base Qwen3-14B junto con el adaptador LoRA. El modelo base en precisión FP16 requiere aproximadamente 28 GB de VRAM; en cuantización int8 puede reducirse a unos 14 GB, y en int4 a unos 7 GB. Sin embargo, no se especifican cuantizaciones disponibles para este adaptador.
- GPU recomendadas: para FP16 se requieren GPUs con al menos 32 GB de VRAM (A100, A6000, etc.); para int8/int4, GPUs como RTX 4090 (24 GB) pueden ser suficientes, aunque no se garantiza.
- El adaptador LoRA en sí es pequeño (probablemente menos de 1 GB), por lo que el requisito principal es el del modelo base.
- Opciones de despliegue: dado que es un adaptador PEFT, puede cargarse con Transformers y PEFT, o exportarse a formatos como GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no se han medido para este modelo concreto; dependerán del hardware y de la implementación de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tuning de Qwen3-14B para razonamiento aritmético). El modelo base Qwen3-14B tiene alternativas como Qwen3-8B o Qwen3-32B, pero no se conocen adaptadores específicos para SVAMP con los que comparar. La información proporcionada no incluye datos de rendimiento en benchmarks estándar que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado en problemas aritméticos de varios pasos (SVAMP), por lo que su rendimiento en otras tareas puede no diferir del modelo base o incluso degradarse si se usa fuera de su dominio.
- No se han publicado resultados de benchmarks externos, por lo que no hay evidencia de mejora frente al modelo base en tareas generales.
- La licencia es `other`, lo que implica que no se especifican los términos exactos de uso; es necesario revisar la política del autor antes de un uso comercial.
- El dataset de entrenamiento no está descrito en detalle; podría contener sesgos o errores que afecten al modelo.
- No se documentan limitaciones de contexto o idioma, pero al ser un adaptador sobre Qwen3-14B, las limitaciones del modelo base se aplican (por ejemplo, contexto máximo, posibles alucinaciones).
- El adaptador se entrenó con una sola época y un dataset probablemente pequeño; podría no generalizar bien a variaciones de problemas no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyleliu789/qwen_3_14b_svampv1_orpo
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Página oficial de Qwen: https://qwen.ai/home
- Qwen3 en Ollama: https://ollama.com/library/qwen3:14b
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
