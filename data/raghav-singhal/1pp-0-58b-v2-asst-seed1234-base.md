# Raghav-Singhal/1pp-0.58b-v2-asst-seed1234-base

## Resumen

1pp-0.58b-v2-asst-seed1234-base es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo distintas condiciones de preentrenamiento afectan al comportamiento del modelo. En concreto, esta variante corresponde a la condición "conversaciones reescritas con pérdida solo en turnos del asistente", con la semilla de inicialización 1234.

El modelo forma parte de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Todos los modelos de la escalera se entrenan desde cero sobre el mismo flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro, de modo que las comparaciones entre ellos son controladas: las condiciones solo difieren en el texto de los documentos y la máscara de pérdida, y las semillas solo en la inicialización de parámetros.

Arquitectónicamente es un decoder estilo Llama de 24 capas, con atención de 9 cabezas y 3 cabezas KV, contexto de 4096 tokens y tokenizador basado en el vocabulario de SmolLM2. Su relevancia es metodológica: permite aislar el efecto de decisiones de diseño del preentrenamiento conversacional (reescritura de documentos, enmascaramiento de pérdida por turnos) sobre el comportamiento final, algo poco habitual en modelos publicados de este tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos están en safetensors en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens con enmascaramiento de atención entre documentos.

El preentrenamiento se realizó sobre las conversaciones del proyecto 1PP reescritas a partir de los documentos originales, aplicando pérdida únicamente en los turnos del asistente. Esta variante cubre los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos del estudio, en el mismo orden. El batch global es de 512 secuencias × 4.096 tokens. El optimizador es Muon (con escalado de forma y LR matricial de 0,005) para los parámetros matriciales, junto con Adam para el resto (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100. Se aplica weight decay de 0,1, inicialización con desviación estándar de 0,0119 y precisión bf16.

La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos retenidos) es de 1,678 para texto de asistente, 5,785 para texto de usuario y 3,522 para texto de documento; la columna de tokens de entrenamiento de la condición, ponderada por la proporción de conversaciones adversariales (11,18%), da 1,734. El autor verificó los pesos de Hugging Face contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencias absolutas de 0,0014 y 0,0016 en los conjuntos de validación.

## Capacidades

- Generación de texto autoregresiva en inglés, con formato de conversación ChatML (sin turno de sistema, ya que el modelo nunca vio uno durante el entrenamiento).
- Producción de texto con formato de chat: las condiciones conversacionales generan respuestas con la estructura `<|im_start|>user ... <|im_start|>assistant ...`, mientras que la línea base sin reescritura genera texto plano.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos incluidos en `eos_token_id`.
- Capacidad de continuación de texto y modelado de lenguaje general, al ser un modelo base entrenado desde cero.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre preentrenamiento conversacional: el modelo sirve como punto de comparación controlado para medir el efecto de reescribir documentos como conversaciones y de enmascarar la pérdida en turnos del asistente, frente a las otras condiciones de la escalera 1PP.
- Estudios de escalado controlado: al compartir flujo de datos y orden de batches con los otros tamaños (0,98B, 1,66B y 2,81B) y semillas, permite analizar cómo escalan las métricas de validación con el número de parámetros en condiciones idénticas.
- Análisis de variabilidad por semilla: las tres semillas (28, 42 y 1234) permiten estimar la varianza en pérdidas de validación y comportamiento atribuible únicamente a la inicialización de parámetros.
- Reproducción de resultados: los logs de entrenamiento en wandb y la verificación de pesos contra Megatron permiten reproducir y auditar las pérdidas reportadas en el artículo principal del proyecto.
- Evaluación de formatos de chat: al generar texto con estructura ChatML sin turno de sistema, es útil para estudiar cómo modelos base aprenden el formato conversacional a partir de la distribución de datos, sin ajuste fino posterior.
- Docencia y experimentación con arquitecturas Llama pequeñas: con 580M parámetros y contexto de 4.096 tokens, es viable para experimentos académicos de bajo presupuesto en una única GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación por token:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,678 |
| Texto de usuario | 5,785 |
| Texto de documento | 3,522 |
| Tokens de entrenamiento de la condición (ponderado) | 1,734 |

Verificación de pesos Hugging Face frente a Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6771 | 1,6785 | 0,0014 |
| raw_val50m segments [8] | 3,5232 | 3,5216 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- En cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento o evaluación a gran escala, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y herramientas compatibles con safetensors. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-seed1234-base | 580M | 4.096 | Apache 2.0 | Hugging Face | Modelo de investigación, solo inglés, sin benchmarks publicados |
| SmolLM2-360M | 360M | 8.192 (según versión) | Apache 2.0 | Hugging Face | Modelo base generalista; comparte tokenizador con 1PP |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Hugging Face | Modelo base multilingüe con contexto mucho mayor |
| 1pp-0.98b-v2 (misma escalera) | 980M | 4.096 | Apache 2.0 | Hugging Face | Mismo flujo de datos y condiciones; permite comparación controlada de escalado |

La comparación con modelos generalistas debe tomarse con cautela: 1PP es un artefacto de investigación sin evaluación en benchmarks estándar, por lo que no es directamente comparable en rendimiento de tareas.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación de EPFL DLAB, no destinado a uso como asistente.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), por lo que su rendimiento en tareas downstream es desconocido.
- Riesgo de alucinación y de generar texto incoherente fuera de la distribución de entrenamiento, especialmente al ser un modelo base sin ajuste por RLHF o DPO.
- El formato de chat no incluye turno de sistema; introducir uno puede degradar la calidad de las respuestas al no haber sido visto en entrenamiento.
- No dispone de soporte de tool calling ni de razonamiento multi-paso verificado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluaciones y su naturaleza experimental desaconsejan su uso en producción sin validación adicional.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre conversaciones reescritas de un corpus no especificado, puede heredar sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
