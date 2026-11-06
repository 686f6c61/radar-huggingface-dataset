# Raghav-Singhal/1pp-2.81b-v2-ua-base

## Resumen

1pp-2.81b-v2-ua-base es un modelo de lenguaje de tipo decoder transformer con 2.807.699.328 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la formulación del texto de entrenamiento (documentos frente a conversaciones reescritas, con distintas máscaras de pérdida) afecta al comportamiento del modelo a lo largo de una escala de tamaños.

El modelo pertenece a la "ladder v2" del proyecto: una escalera de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzada con tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero sobre el mismo flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro. La condición "ua" corresponde a conversaciones reescritas con pérdida sobre los turnos de usuario y asistente; la semilla de esta ficha es la 28.

Arquitectura Llama-style de 24 capas, dimensión oculta 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token de padding. Su relevancia es metodológica: permite aislar el efecto de la condición de datos y de la inicialización sobre las pérdidas de validación en una escala controlada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 2.807.699.328 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 2.688 y FFN de 10.752 con activación SwiGLU. La atención usa 21 cabezas de consulta y 7 cabezas KV con dimensión de cabeza 128, sin QK-norm y sin biases. Emplea RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y añade un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre las conversaciones del proyecto 1PP reescritas a partir de los documentos originales, con pérdida aplicada tanto a los turnos de usuario como a los de asistente. Se cubrieron los primeros 53.709 pasos del flujo alineado por pasos del proyecto (112,64B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos en el mismo orden. El batch global fue de 512 secuencias de 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador combina Muon (escalado por forma, LR matricial 0,005) para los parámetros matriciales y Adam para el resto (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, desviación de inicialización 0,0078 y precisión bf16.

La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,351 por token en texto de asistente, 1,269 en texto de usuario y 3,044 en texto de documento. La columna ponderada de la condición (`reweighted_seg1234`) da 1,350, ponderando las conversaciones adversariales a su cuota de entrenamiento del 11,18%. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas: 1,3501 frente a 1,3514 (diferencia absoluta 0,0013) en los segmentos val50m [3], y 3,0461 frente a 3,0436 (diferencia 0,0025) en raw_val50m [8].

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada al formato de conversación ChatML.
- Producción de texto con formato de chat cuando se usa la plantilla incluida, ya que las condiciones conversacionales generan texto con estructura de diálogo; la condición base cruda genera texto plano.
- Continuación de documentos y de conversaciones multi-turno dentro de la ventana de 4.096 tokens.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés según la model card.
- Modelo base: no ha pasado por RLHF ni DPO, por lo que no está alineado como asistente.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo permite medir el efecto de la formulación de los datos (documentos frente a conversaciones reescritas) y de la máscara de pérdida sobre la perplejidad de validación, comparando con las otras condiciones de la misma escalera.
- Estudios de escalado controlado: al compartir flujo de datos alineado por pasos con los tamaños 0,58B, 0,98B y 1,66B, sirve para trazar curvas de escalado con 20,3 tokens de asistente por parámetro y comparar entre semillas (28, 42, 1234).
- Reproducibilidad de artefactos de investigación: los pesos se validaron contra el checkpoint de Megatron con diferencias de pérdida inferiores a 0,003, lo que permite reproducir resultados del estudio 1PP en transformers sin acceso al stack de entrenamiento.
- Generación de diálogo sintético en inglés: con la plantilla ChatML incluida se pueden producir turnos de conversación para aumentar datasets de investigación, aceptando que el modelo es base y no está alineado.
- Experimentos de formato y plantillas: útil para estudiar cómo un modelo entrenado sin turno de sistema responde a entradas ChatML sin sistema y qué ocurre al introducirlo.
- Análisis de pérdida por segmentos: las métricas separadas de texto de asistente, usuario y documento permiten usar el modelo como referencia para evaluar corpus conversacionales.
- Fine-tuning académico: con licencia Apache 2.0 y 2,81B parámetros, es viable ajustarlo en una GPU de 80 GB para tareas concretas de investigación en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación por token:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,351 |
| Texto de usuario | 1,269 |
| Texto de documento | 3,044 |
| Condición reweighted_seg1234 | 1,350 |

| Verificación | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,3501 | 1,3514 | 0,0013 |
| raw_val50m segments [8] | 3,0461 | 3,0436 | 0,0025 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los pesos ocupan aproximadamente 5,6 GB (tamaño del repo), por lo que se necesitan alrededor de 6-7 GB de VRAM solo para pesos, más memoria para caché KV y activaciones.
- En fp16/bf16 cabe en GPUs de consumo con 8 GB o más, como la RTX 3060 Ti, RTX 3070, RTX 4060 Ti o RTX 4070, siempre que se ajuste la longitud de contexto.
- GPU recomendadas para producción o evaluación a contexto completo de 4.096 tokens: A100, H100, L40S o RTX 4090.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y, en general, cualquier runtime que cargue safetensors de arquitectura Llama.
- No se dispone de datos de latencia ni throughput publicados.
- La cuantización a 8 o 4 bits reduciría el requisito de VRAM por debajo de 4 GB, pero el autor no publica variantes cuantizadas ni GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-base | 2,81B | 4.096 | Apache 2.0 | HuggingFace, 0 descargas | Modelo base de investigación, sin benchmarks |
| 1pp-1.7b-* (misma escalera) | 1,66B | 4.096 | Apache 2.0 | HuggingFace (colección 1pp) | Escalón inferior de la misma ladder v2, misma metodología |
| SmolLM2 (vocabulario compartido) | no disponible en la información | no disponible | no disponible | no disponible | Solo se comparte el tokenizador; no hay datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de investigación del proyecto 1PP (EPFL DLAB), no un asistente de propósito general; el autor lo declara explícitamente.
- Modelo base sin RLHF ni DPO: no está alineado y puede producir contenido inadecuado o incoherente en uso conversacional directo.
- Los modelos nunca vieron un turno de sistema durante el entrenamiento; introducir uno en la plantilla ChatML queda fuera de distribución.
- Ventana de contexto de solo 4.096 tokens, insuficiente para tareas de contexto largo.
- Soporte únicamente en inglés según la model card.
- Riesgo de alucinación no evaluado: no se publican benchmarks de fidelidad ni de razonamiento.
- Sesgos no documentados: la model card no incluye análisis de sesgos ni de seguridad.
- Sin datos publicados de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), lo que impide estimar su calidad frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero la falta de alineación y de evaluaciones desaconseja su despliegue en producción sin ajuste previo y evaluación propia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, proyecto 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, proyecto 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
