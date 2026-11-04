# Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed42-sft

## Resumen

El modelo `1pp-0.98b-v2-asst-rawanneal-seed42-sft` es un modelo de lenguaje de 0,98 mil millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición del corpus de preentrenamiento afecta al comportamiento del modelo en conversaciones. En concreto, este modelo pertenece a la "escalera" v2 del estudio, que entrena modelos de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones de datos y tres semillas distintas, todos desde cero sobre el mismo flujo de datos alineado por pasos.

La variante "rawanneal" es una condición de mid-training: el modelo parte del checkpoint del run "raw" en el paso 16.902 (el último con learning rate máximo) y realiza el cooldown final (1.877 pasos) sobre conversaciones 1PP reescritas a partir de los documentos originales, en lugar de sobre los documentos. Después se aplica un ajuste supervisado (SFT) de una época sobre una mezcla de 400.000 conversaciones. El objetivo es aislar el efecto de introducir datos conversacionales en la fase final del preentrenamiento.

Arquitectónicamente es un transformer decoder estilo Llama de 24 capas, con contexto de 4.096 tokens y tokenizer basado en el vocabulario de SmolLM2 (49.152 tokens). Su relevancia es metodológica: proporciona un punto de comparación controlado para investigadores interesados en la relación entre datos de preentrenamiento, formato conversacional y pérdida en turnos de asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 24 capas con dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. Usa 12 cabezas de atención con 4 cabezas KV (GQA implícito, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizer es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento usa los documentos originales de DCLM-edu durante los primeros 16.902 pasos y, en el cooldown (los últimos 1.877 de 18.779 pasos), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida únicamente en los turnos del asistente. El flujo de datos está alineado por pasos con el resto de la escalera, de modo que cada paso de cooldown contiene las conversaciones derivadas de los documentos que el run raw vio en ese mismo paso. El total asciende a 39,38 mil millones de posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16.

El SFT consiste en una época sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271.600 de `dlab-spp/sp-sft-normal-300k` (excluyendo prompts duplicados del primer conjunto) y 30.000 muestras de `dlab-spp/sp-sft-safety-180k`. Se usa la misma pila (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3 %.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Respuesta a instrucciones de un solo turno y conversaciones multiturno dentro de la ventana de 4.096 tokens.
- Razonamiento básico y respuesta a preguntas derivados del corpus DCLM-edu y de la mezcla SFT.
- Generación de código y matemáticas a nivel básico, no evaluado formalmente por el autor.
- No soporta tool calling ni function calling de forma nativa (no se menciona en la model card ni en el entrenamiento).
- No soporta agentes ni razonamiento multi-paso explícito (sin modo "thinking").
- Capacidades multilingües limitadas al inglés; el vocabulario es SmolLM2, pero el entrenamiento es monolingüe.
- Sin capacidades de visión, audio ni multimodalidad.
- Detención de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: sirve como punto de comparación controlado frente a `1pp-0.98b-v2-asst-seed42-sft` y `1pp-0.98b-v2-raw-seed42-base` para medir el efecto de sustituir documentos por conversaciones en el cooldown, manteniendo semilla, orden de batch y pasos alineados.
- Estudio de pérdida en turnos de asistente: permite analizar la pérdida de validación desagregada por tipo de texto (asistente 1,644; usuario 4,090; documento 3,063) y relacionarla con la condición de entrenamiento.
- Reproducibilidad de la escalera 1PP: al ser la semilla 42 de la condición "asst-rawanneal" en el rung de 0,98B, se usa para replicar los resultados del estudio principal a esa escala y contrastar con las semillas 28 y 1234.
- Evaluación de SFT sobre modelos pequeños: con pérdida SFT retenida de 1,992 sobre 1.998 conversaciones, sirve para estudiar cómo un modelo de ~1B responde a una mezcla SFT de 400k conversaciones con LR matricial 0,002.
- Prototipado de pipelines de generación con transformers y TGI: el repo incluye `chat_template` funcional y es compatible con `text-generation-inference` y endpoints, lo que permite integrarlo en pruebas de infraestructura sin coste de licencia.
- Análisis de sesgos y seguridad en modelos pequeños: al incluir 30k muestras del conjunto de seguridad en el SFT, es útil para estudiar la eficacia de datos de seguridad a esta escala y con este régimen de entrenamiento.
- Docencia y experimentación académica: su tamaño (0,98B) y licencia Apache 2.0 permiten desplegarlo en entornos docentes y comparar arquitecturas Llama pequeñas con tokenizer SmolLM2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta pérdidas de validación:

| Métrica | Valor |
|---|---|
| Pérdida de validación en texto de asistente (checkpoint final, 2.433 documentos retenidos) | 1,644 |
| Pérdida de validación en texto de usuario | 4,090 |
| Pérdida de validación en texto de documento | 3,063 |
| Pérdida de validación ponderada por la condición de entrenamiento (`reweighted_seg34`) | 1,692 |
| Pérdida SFT retenida (tokens de asistente, 1.998 conversaciones) | 1,992 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 1,9924 vs. 1,9924 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más caché KV y overhead; en la práctica, unos 3-4 GB con contexto completo de 4.096 tokens.
- En cuantización de 8 bits: ~1 GB de pesos; en 4 bits: ~0,5-0,6 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16 (RTX 3060 12GB, RTX 4060 Ti, RTX 4090). Para despliegue en producción con concurrencia, A10G, L4 o A100.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en iGPU con cuantización agresiva.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM, llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-asst-rawanneal-seed42-sft | 0,98B | 4.096 | Apache 2.0 | en | Condición mid-training con cooldown conversacional; pérdida SFT 1,992 |
| 1pp-0.98b-v2-asst-seed42-sft | 0,98B | 4.096 | Apache 2.0 | en | Run completo 1PP con cooldown conversacional desde el inicio; referencia directa del estudio |
| 1pp-0.98b-v2-raw-seed42-base | 0,98B | 4.096 | Apache 2.0 | en | Run raw sin cooldown conversacional; base del mid-training |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | en (multilingüe parcial) | Modelo de referencia de Hugging Face con tokenizer compartido; no comparable en régimen de entrenamiento |

La comparación con modelos de propósito general como SmolLM2 o Llama 3.2 1B no es directa: los 1PP son artefactos de investigación con 39,38B tokens de entrenamiento y sin evaluación de benchmarks publicada, por lo que no se dispone de datos para comparar rendimiento downstream.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo declara "research artifact from the 1PP project (EPFL DLAB); not a general-purpose assistant".
- Entrenamiento monolingüe en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Ventana de contexto de solo 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin evaluación de benchmarks publicada (MMLU, HumanEval, GSM8K), por lo que no hay evidencia de rendimiento downstream.
- Riesgo de alucinación no cuantificado; al ser un modelo de ~1B con 39,38B tokens de entrenamiento, la fiabilidad factual es limitada.
- No soporta tool calling ni function calling; no apto para pipelines de agentes.
- El chat template no incluye turno de sistema y el modelo nunca vio uno, por lo que inyectar mensajes de sistema puede degradar la calidad de las respuestas.
- Sesgos: no documentados por el autor; el corpus DCLM-edu y la mezcla SFT pueden introducir sesgos de género, raza o cultura no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- La fecha de creación (2026-11-03) es posterior a la fecha actual de referencia; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-seed42-sft
- Run raw base: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Run 1PP completo comparable: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
