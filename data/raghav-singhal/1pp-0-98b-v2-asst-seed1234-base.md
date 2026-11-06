# Raghav-Singhal/1pp-0.98b-v2-asst-seed1234-base

## Resumen

1pp-0.98b-v2-asst-seed1234-base es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo distintas condiciones de preentrenamiento (texto reescrito, enmascaramiento de la pérdida por turnos) y distintas semillas de inicialización afectan al comportamiento de un modelo entrenado desde cero sobre un flujo de datos alineado por pasos.

Forma parte de la "ladder v2", una escalera de escalado con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos, de modo que las diferencias entre modelos son atribuibles exclusivamente a la condición o a la semilla. Este checkpoint concreto corresponde a la condición "rewritten conversations, assistant-turn loss" con semilla 1234.

La arquitectura es un decoder estilo Llama de 24 capas con contexto de 4.096 tokens, licencia Apache 2.0 y pesos en safetensors. Su relevancia es metodológica: permite aislar el efecto de variables de entrenamiento concretas con un control experimental estricto, algo poco habitual en modelos publicados de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bf16/safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (atención GQA con dimensión de cabeza 128). Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre conversaciones reescritas del corpus 1PP, aplicando la pérdida únicamente sobre los turnos del asistente, con enmascaramiento de atención entre documentos. Se entrenaron los primeros 18.779 pasos del flujo alineado por pasos (39,38B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos del estudio, en el mismo orden. El batch global fue de 512 secuencias × 4.096 tokens. El optimizador combina Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100. Weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16.

La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,549 por token en texto de asistente, 6,392 en texto de usuario y 3,327 en texto de documento; la columna ponderada de tokens de entrenamiento de esta condición es 1,601 (`reweighted_seg34`). Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con una diferencia absoluta de 0,0014 en ambos conjuntos comprobados.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML (sin turno de sistema).
- Producción de texto con formato de chat gracias a la condición de conversaciones reescritas; el baseline crudo genera texto plano.
- Plantilla de chat incluida (`chat_template`) que renderiza exactamente el formato ChatML sin sistema; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.
- Al ser un modelo base, no ha pasado por un proceso de alineación tipo RLHF/DPO documentado; su uso previsto es la investigación, no la asistencia conversacional general.

## Casos de uso

- Estudio controlado de condiciones de preentrenamiento: el modelo permite comparar, frente a los otros checkpoints de la ladder v2 con la misma semilla, el efecto de reescribir las conversaciones y enmascarar la pérdida por turnos, manteniendo constante el flujo de datos y el orden de batches.
- Análisis de variabilidad por semilla: al existir tres semillas (28, 42, 1234) que solo difieren en la inicialización de parámetros, sirve para estimar la varianza de métricas de validación y de comportamiento atribuible al azar de inicialización.
- Reproducción de resultados de escalado: con 39,38B posiciones de token y 18.779 pasos documentados, permite reproducir las curvas de pérdida y validar la implementación propia contra las referencias publicadas (diferencia absoluta de 0,0014 en las comprobaciones del autor).
- Investigación sobre formato conversacional: al haberse entrenado con pérdida solo en turnos de asistente, es útil para estudiar cómo el enmascaramiento de la pérdida afecta a la generación de respuestas con formato ChatML en modelos pequeños.
- Evaluación de tokenizadores y vocabularios: al usar el vocabulario de SmolLM2 (49.152 tokens), permite comparar el comportamiento de este vocabulario en tareas de generación en inglés frente a otros tokenizadores en condiciones controladas.
- Docencia y experimentación en entornos con recursos limitados: con 0,98B parámetros y pesos en bf16 (aproximadamente 2 GB de repositorio), es viable entrenar variantes o hacer fine-tuning en una única GPU de gama alta para prácticas de laboratorio.
- Verificación de conversiones de checkpoints: el modelo se publicó junto a comprobaciones de equivalencia entre Megatron y Hugging Face, por lo que sirve como referencia para validar pipelines de conversión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por token:

| Conjunto | Pérdida por token |
|---|---|
| Texto de asistente | 1,549 |
| Texto de usuario | 6,392 |
| Texto de documento | 3,327 |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,601 |

| Verificación | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,5472 | 1,5485 | 0,0014 |
| raw_val50m segments [8] | 3,3279 | 3,3265 | 0,0014 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado (RTX 3060 12 GB, RTX 4070, RTX 4090); A100 o H100 para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para inferencia en bf16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-asst-seed1234-base | 0,98B | 4.096 | Apache 2.0 | Artefacto de investigación (1PP, ladder v2) |
| 1pp-0.98b-v2 (otras semillas 28 y 42) | 0,98B | 4.096 | Apache 2.0 | Misma condición, distinta inicialización |
| 1pp-0.58b / 1.66B / 2.81B (ladder v2) | 0,58B / 1,66B / 2,81B | 4.096 | Apache 2.0 | Mismos datos y condiciones, distinto tamaño |
| SmolLM2 (referencia de tokenizador) | no disponible | no disponible | no disponible | Modelo de propósito general; solo se comparte vocabulario |

La comparación más directa es interna a la propia colección 1PP, ya que el diseño experimental (mismos datos, mismo orden de batches, condiciones y semillas cruzadas) no tiene equivalente documentado en la información disponible. No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Es un modelo base de investigación, no un asistente de propósito general; el propio autor lo declara explícitamente.
- No se documenta alineación (RLHF/DPO) ni filtros de seguridad; puede generar contenido inapropiado o sesgado.
- Riesgo de alucinación inherente a un modelo de 0,98B entrenado con 39,38B posiciones de token y sin ajuste instructivo.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El formato de chat no incluye turno de sistema: los modelos nunca vieron uno, por lo que introducir mensajes de sistema puede degradar el comportamiento.
- La pérdida de validación en texto de usuario (6,392) es muy superior a la de texto de asistente (1,549), reflejo del enmascaramiento de la pérdida; no debe interpretarse como una medida de calidad conversacional global.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, su uso en producción no está recomendado por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
