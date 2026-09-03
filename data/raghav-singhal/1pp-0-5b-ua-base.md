# Raghav-Singhal/1pp-0.5b-ua-base

## Resumen

El modelo `1pp-0.5b-ua-base` es un experimento de investigación del proyecto One Persona Pretraining (1PP) desarrollado en el EPFL DLAB por Raghav-Singhal. Forma parte de un estudio sistemático de 3 × 3 condiciones: tres tamaños de modelo (0.5B, 1B y 1.7B) y tres condiciones de pretraining sobre el mismo corpus de 47.8 millones de documentos. Esta variante concreta tiene 0.58 mil millones de parámetros y fue entrenada con conversaciones reescritas, aplicando la pérdida tanto en los turnos de usuario como en los de asistente.

El objetivo del proyecto 1PP es investigar cómo el formato de los datos de entrenamiento (documentos originales frente a conversaciones reescritas) y la máscara de pérdida afectan al comportamiento del modelo. Este modelo base no está pensado como asistente general, sino como artefacto de investigación para estudiar el efecto del pretraining con una "persona" conversacional. Su arquitectura es un decoder estilo Llama con 24 capas, contexto de 4096 tokens y tokenizador basado en SmolLM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (24 capas, hidden 1152, FFN 4608 SwiGLU, 9 heads de atención, 3 KV heads, head dim 128, RMSNorm, RoPE base 10000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 (0.58B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only convencional estilo Llama, con normalización RMSNorm, atención con RoPE (base 10000) y FFN SwiGLU. No utiliza QK-norm ni sesgos. Los embeddings están desacoplados (untied) y el tokenizador es el de SmolLM2 (49.152 tokens) más un token especial `<|pad|>`. La secuencia máxima es de 4096 tokens.

El entrenamiento se realizó sobre 47.8 millones de documentos convertidos en conversaciones (63.0 mil millones de tokens en formato conversacional, frente a 66.2 mil millones en los documentos originales). Se aplicó una máscara de pérdida que incluye tanto los turnos de usuario como los de asistente, excluyendo el token `<|endoftext|>`. El entrenamiento constó de 31.777 pasos con un batch global de 512 × 4096 tokens, usando empaquetado best-fit con máscara de atención entre documentos. El optimizador fue Muon (con tasa de aprendizaje 0.005 para matrices) combinado con Adam para embeddings y normas, warmup de 2000 pasos, decay lineal en el último 10% hasta 1/100, weight decay 0.1 y precisión bf16. Las pérdidas de validación finales fueron 1.572 (texto de asistente), 1.462 (texto de usuario) y 3.298 (texto de documento).

## Capacidades

- Generación de texto en formato conversacional (ChatML sin turno de sistema).
- Modelo base: no está alineado ni entrenado para seguir instrucciones; produce texto en el estilo de los datos de entrenamiento.
- Capacidad de razonamiento limitada, propia de un modelo de 0.58B parámetros.
- Soporte de tool calling: no disponible (no se menciona en la información).
- Soporte de agentes: no disponible.
- Capacidades multilingües: solo inglés.
- Sin capacidades especiales (visión, audio, etc.).

## Casos de uso

- Investigación académica sobre pretraining: el modelo sirve para estudiar cómo el formato de datos (documentos vs. conversaciones) y la máscara de pérdida afectan a la representación del lenguaje y al comportamiento conversacional. Se puede comparar con las otras 8 variantes de la colección 1PP.
- Análisis de la influencia de la pérdida en turnos de usuario: al incluir pérdida en los turnos de usuario, este modelo permite investigar si el modelo aprende a modelar mejor las entradas del usuario, lo que puede informar el diseño de futuros datasets de entrenamiento.
- Evaluación de la transferencia a tareas downstream: aunque es un modelo base pequeño, puede servir como punto de partida para fine-tuning en tareas de conversación o generación de texto en inglés, permitiendo comparar el efecto del pretraining con condiciones alternativas.
- Estudio de la relación entre tamaño y condición de entrenamiento: al ser parte de una matriz 3 × 3, se puede usar para analizar cómo interactúan el tamaño del modelo y la condición de pretraining en métricas de validación y en tareas posteriores.
- Reproducción de experimentos: dado que se proporcionan los logs de entrenamiento (wandb) y la verificación de pesos contra Megatron, es útil para reproducir y validar los resultados del estudio 1PP.
- Desarrollo de modelos conversacionales ligeros: aunque no es un asistente, su formato de chat y su pequeño tamaño lo hacen adecuado para prototipos de sistemas de diálogo en entornos con recursos limitados, siempre que se haga fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta pérdidas de validación por token:

| Conjunto | Pérdida (asistente) | Pérdida (usuario) | Pérdida (documento) |
|---|---|---|---|
| Validación (2.433 documentos) | 1.572 | 1.462 | 3.298 |

Además, se verificó la consistencia de los pesos con el checkpoint de Megatron:

| Conjunto | Pérdida HF | Pérdida Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1.5702 | 1.5717 | 0.0015 |
| raw_val50m segments [8] | 3.3005 | 3.2983 | 0.0022 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.58B parámetros, en bf16 ocupa aproximadamente 1.16 GB de memoria. Con cuantización int8 bajaría a ~0.58 GB y en int4 a ~0.29 GB (aunque no se proporcionan pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en bf16. Por ejemplo, una NVIDIA GTX 1650, RTX 3060 o superior. También funciona en CPU con llama.cpp u Ollama si se convierte a GGUF.
- Cabe en GPUs consumer: sí, sin problema.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, TGI, o mediante la librería transformers directamente. Para entornos ligeros, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (p. ej., RTX 4090), la generación de tokens debería ser muy rápida (del orden de miles de tokens por segundo) dado el pequeño tamaño, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de ~0.5B con pretraining conversacional). El modelo pertenece a una colección de 9 variantes del proyecto 1PP, que difieren en tamaño (0.5B, 1B, 1.7B) y condición de pretraining. Se puede comparar con las otras variantes de la colección, pero no se han publicado resultados de benchmarks que permitan una comparación cuantitativa con modelos externos como SmolLM2-360M o TinyLlama-1.1B. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente general y no ha sido alineado con preferencias humanas. Puede generar contenido incoherente, ofensivo o factualmente incorrecto.
- Tamaño reducido: con 0.58B parámetros, su capacidad de razonamiento y conocimiento es limitada en comparación con modelos más grandes.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado: ventana de 4096 tokens, insuficiente para tareas que requieran contexto largo.
- Sin soporte de tool calling ni agentes: no se menciona ninguna capacidad de este tipo.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Sesgos: al entrenarse sobre documentos web y conversaciones reescritas, puede heredar sesgos presentes en los datos originales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación, no se garantiza su idoneidad para producción.
- Sin cuantizaciones oficiales: solo se proporcionan pesos en bf16; cualquier cuantización debe realizarse por el usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.5b-ua-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
