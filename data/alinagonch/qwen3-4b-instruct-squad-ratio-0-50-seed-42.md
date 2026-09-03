# AlinaGonch/qwen3-4b-instruct-squad-ratio-0.50-seed-42

## Resumen

Este modelo es un fine-tuning experimental de Qwen3-4B-Instruct sobre el dataset SQuAD2.0, creado por AlinaGonch como parte de una serie de experimentos para determinar la proporción óptima de muestras no respondibles (unanswerable) en el conjunto de entrenamiento. El nombre del repositorio indica que se utilizó una proporción de 0.50 de preguntas sin respuesta y una semilla de 42. El objetivo es estudiar cómo afecta esta proporción al rendimiento del modelo en tareas de comprensión lectora y respuesta a preguntas, especialmente en la detección de preguntas sin respuesta.

El modelo se basa en la arquitectura Qwen3, una familia de modelos de lenguaje de gran tamaño desarrollada por Alibaba Cloud. Al ser un fine-tuning de la versión instruct de 4B parámetros, hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.) pero está especializado en el dominio de QA extractiva sobre SQuAD. El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que podría tratarse de un adaptador o de una versión cuantizada, aunque no se especifica en la información disponible.

La relevancia de este modelo radica en su contribución a la investigación sobre el equilibrio entre preguntas respondibles y no respondibles en datasets de entrenamiento, un factor crítico para sistemas de QA robustos que deben saber cuándo abstenerse de responder. Sin embargo, al ser un experimento de investigación con 0 descargas y 0 likes, su utilidad práctica inmediata es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, basado en el nombre del modelo) |
| Parametros totales | 4B (según el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct soporta 32k, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3 soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B-Instruct, un transformer denso con 4 mil millones de parámetros. La arquitectura base de Qwen3 incluye atención multi-cabeza estándar, normalización RMSNorm, y una ventana de contexto de 32k tokens en su versión original. El fine-tuning se realizó sobre el dataset SQuAD2.0, que combina preguntas respondibles y no respondibles, con una proporción de 0.50 de muestras no respondibles y semilla 42. El tag `arxiv:1910.09700` hace referencia al paper de SQuAD2.0, lo que confirma el uso de este dataset.

No se dispone de información sobre el procedimiento de entrenamiento específico (hiperparámetros, número de épocas, técnica de fine-tuning como LoRA o full fine-tuning). El tamaño del repositorio (0.1 GB) sugiere que podría tratarse de un adaptador LoRA o de una versión con pesos cuantizados, pero no hay confirmación. Tampoco se indica si se utilizó RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning.

## Capacidades

- Comprensión lectora y respuesta a preguntas extractiva sobre el formato SQuAD2.0, incluyendo la capacidad de identificar preguntas sin respuesta (detección de "unanswerable").
- Generación de texto y razonamiento general, heredadas del modelo base Qwen3-4B-Instruct.
- Soporte de tool calling y function calling, si el modelo base lo incluye (Qwen3-Instruct sí lo soporta, pero no se confirma que este fine-tuning lo conserve).
- Capacidades multilingües del modelo base, aunque no se especifica si el fine-tuning las mantiene.
- No se dispone de información sobre capacidades especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación académica sobre el equilibrio de muestras no respondibles en datasets de QA: este modelo sirve como punto de comparación en experimentos controlados para determinar la proporción óptima de preguntas sin respuesta en el entrenamiento.
- Desarrollo de sistemas de QA robustos que deben abstenerse de responder cuando no hay respuesta: el fine-tuning en SQuAD2.0 con 50% de muestras no respondibles entrena al modelo para reconocer preguntas sin respuesta, lo que puede transferirse a dominios similares.
- Evaluación de técnicas de fine-tuning en modelos pequeños: al ser un modelo de 4B, es adecuado para probar metodologías de entrenamiento con recursos limitados.
- Benchmarking de modelos de comprensión lectora en español u otros idiomas, si se adapta el dataset (aunque el modelo base es multilingüe, no hay evidencia de que este fine-tuning lo sea).
- Estudio de la degradación de capacidades generales tras un fine-tuning específico de dominio: comparar el rendimiento en tareas generales antes y después del fine-tuning.
- Base para fine-tunings posteriores en tareas de QA con requisitos de abstención, como sistemas de atención al cliente o extracción de información en dominios cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3-4B-Instruct tiene resultados conocidos en MMLU, HumanEval, GSM8K, etc., pero no se dispone de datos específicos para este fine-tuning. Tampoco se proporcionan métricas de SQuAD2.0 (EM, F1) para este modelo concreto.

## Requisitos de hardware

- Al ser un modelo de 4B parámetros, la VRAM estimada para inferencia en FP16 es de aproximadamente 8 GB, y en cuantización INT4 alrededor de 2-3 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin cuantizar, o GPUs con 6-8 GB para cuantización INT4/INT8.
- Es viable en GPUs de consumo (consumer) como la RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles para este modelo específico. Para un modelo de 4B en una RTX 4090, se puede esperar un throughput de 50-100 tokens/s con cuantización INT4, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este fine-tuning. Se podría comparar con otros fine-tunings de Qwen3-4B-Instruct sobre SQuAD2.0 con diferentes proporciones (por ejemplo, el modelo `qwen3-4b-instruct-squad-ratio-0.50-r4` del mismo autor), pero no hay datos públicos de rendimiento. Tampoco se conocen alternativas comerciales o de código abierto con el mismo objetivo experimental.

## Limitaciones y advertencias

- El modelo es un experimento de investigación con 0 descargas y 0 likes; no ha sido validado en entornos de producción.
- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Al ser un fine-tuning de Qwen3, hereda los sesgos potenciales del modelo base, que pueden incluir sesgos de género, raza o idioma.
- Riesgo de alucinación: aunque el fine-tuning en SQuAD2.0 puede mejorar la abstención, no hay garantía de que el modelo no alucine respuestas en otros dominios.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el fine-tuning; podría verse reducida si el entrenamiento no preserva la ventana original.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si es de uso comercial. El modelo base Qwen3 tiene licencia Apache 2.0, pero este fine-tuning podría tener restricciones adicionales.
- El tamaño del repositorio (0.1 GB) sugiere que podría ser un adaptador o una versión cuantizada, lo que afecta a la portabilidad y al rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlinaGonch/qwen3-4b-instruct-squad-ratio-0.50-seed-42
- Modelo relacionado (mismo autor, ratio 0.50 r4): https://huggingface.co/AlinaGonch/qwen3-4b-instruct-squad-ratio-0.50-r4
- Colección de experimentos SQuAD ratio: https://huggingface.co/collections/AlinaGonch/squad-dataset-ratio-experiment-qwen3-instruct
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Guía completa de Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Paper de SQuAD2.0 (referenciado en el tag arxiv:1910.09700): https://arxiv.org/abs/1910.09700
