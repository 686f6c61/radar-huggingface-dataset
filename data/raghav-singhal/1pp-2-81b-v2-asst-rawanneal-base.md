# Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-base

## Resumen

El modelo `1pp-2.81b-v2-asst-rawanneal-base` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de pretraining (documentos originales frente a conversaciones reescritas) al comportamiento final del modelo, manteniendo constantes el resto de factores.

Se trata de la variante de mid-training del run raw: entrena sobre los documentos originales de DCLM-edu hasta el paso 48.339 (el último paso a learning rate máximo) y después ejecuta el cooldown (los últimos 5.370 de 53.709 pasos) sobre conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida calculada únicamente en los turnos del asistente. Forma parte de la escalera v2 del proyecto, que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones y tres semillas (28, 42 y 1234), cada tamaño entrenado desde cero sobre el mismo flujo de datos alineado por pasos.

La relevancia actual del modelo es metodológica: permite aislar el efecto de una intervención de datos (la reescritura conversacional durante el cooldown y el enmascaramiento de la pérdida) frente a un modelo de referencia entrenado solo con documentos, con la misma inicialización, el mismo orden de batches y el mismo presupuesto de cómputo. La arquitectura es un decoder estilo Llama con 24 capas, contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer), 24 capas, hidden 2.688, FFN 10.752 (SwiGLU), 21 cabezas de atención / 7 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 5,6 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (GQA con head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El entrenamiento usa los documentos originales de DCLM-edu durante los primeros 48.339 pasos y, en el cooldown (los últimos 5.370 de 53.709 pasos), conversaciones 1PP reescritas a partir de esos documentos, con pérdida aplicada solo a los turnos del asistente. El flujo de datos está alineado por pasos con el resto de la escalera: cada paso de cooldown contiene las conversaciones reescritas de los documentos que el run raw vio en ese mismo paso. El batch global es de 512 secuencias × 4.096 tokens, con máscara de atención entre documentos. El optimizador es Muon (con escalado de forma y learning rate matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1; desviación típica de inicialización 0,0078; precisión bf16. El presupuesto total es de 20,3 tokens de asistente por parámetro, sobre los primeros 53.709 pasos del flujo alineado (112,64B posiciones de token).

La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos reservados) es de 1,411 en texto de asistente, 5,681 en texto de usuario, 2,894 en texto de documento y 1,457 con la métrica `reweighted_seg34`, que pondera las conversaciones adversariales según su proporción de entrenamiento (11,18%). Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación: 1,4096 frente a 1,4109 (diferencia absoluta 0,0013) en los segmentos val50m [3], y 2,8952 frente a 2,8939 (0,0013) en raw_val50m [8].

## Capacidades

- Generación de texto en inglés con formato de chat ChatML, sin turno de sistema (los modelos nunca vieron uno).
- Producción de respuestas conversacionales en el turno del asistente, fruto de la condición de entrenamiento sobre conversaciones reescritas.
- Modelo base: no está ajustado para seguir instrucciones ni para razonamiento guiado; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.
- Plantilla de chat incluida (`chat_template`) que renderiza exactamente el formato `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.

## Casos de uso

- Estudio controlado del efecto de datos conversacionales en pretraining: comparar este run con `1pp-2.81b-v2-raw-base` y `1pp-2.81b-v2-asst-base` para aislar cuánto del comportamiento conversacional proviene del cooldown sobre conversaciones y cuánto del enmascaramiento de pérdida, manteniendo idéntica inicialización y orden de batches.
- Réplica de experimentos de scaling ladder: el modelo forma parte de una escalera de cuatro tamaños × tres condiciones × tres semillas, lo que permite analizar tendencias por tamaño con intervalos de variabilidad entre semillas.
- Validación de pipelines de entrenamiento: sirve como referencia para comprobar que una implementación propia (por ejemplo, en Megatron) reproduce las pérdidas de validación publicadas (1,4096 y 2,8952 en los conjuntos val50m) dentro de una tolerancia de 0,0013.
- Análisis de pérdida por segmento: la métrica `reweighted_seg34`, que pondera conversaciones adversariales al 11,18%, permite estudiar el equilibrio entre texto de asistente, de usuario y de documento en un modelo entrenado con pérdida enmascarada.
- Investigación sobre formato de chat: al ser un modelo base entrenado con ChatML sin turno de sistema, es útil para estudiar cómo el formato de conversación emerge del pretraining sin supervisión posterior.
- Generación de texto de dominio educativo: al estar entrenado sobre DCLM-edu, puede emplearse en tareas de continuación y generación de texto en inglés de temática educativa, siempre con la advertencia de que no es un asistente afinado.
- Evaluación de tokenizadores: al usar el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`, permite comparar eficiencia de tokenización frente a otros vocabularios en el mismo régimen de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación por token:

| Conjunto / métrica | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,411 |
| Texto de usuario | 5,681 |
| Texto de documento | 2,894 |
| `reweighted_seg34` (esta condición) | 1,457 |
| val50m segments [3] (verificación HF) | 1,4096 (referencia Megatron 1,4109) |
| raw_val50m segments [8] (verificación HF) | 2,8952 (referencia Megatron 2,8939) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (2,81B parámetros × 2 bytes), más memoria para el KV cache y activaciones; en la práctica, alrededor de 7-8 GB para secuencias cortas.
- En cuantización de 8 bits, los pesos ocuparían unos 2,8 GB; en 4 bits, unos 1,4 GB, aunque no se documentan cuantizaciones publicadas para este modelo.
- Cabe en GPUs de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) alojan el modelo en bf16 con margen amplio para contexto de 4.096 tokens; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) también son suficientes en bf16 para lotes pequeños.
- GPUs de datacenter recomendadas para mayor throughput: A100 (40/80 GB), H100 (80 GB) o L40S, con capacidad de ejecutar muchos lotes concurrentes.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en HuggingFace), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se publican en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1pp-2.81b-v2-asst-rawanneal-base` (este) | 2,81B | 4.096 | Apache 2.0 | HuggingFace, 0 descargas | Mid-training: documentos + cooldown conversacional con pérdida en turnos de asistente |
| `1pp-2.81b-v2-raw-base` | 2,81B | 4.096 | Apache 2.0 | HuggingFace | Run raw de referencia, solo documentos |
| `1pp-2.81b-v2-asst-base` | 2,81B | 4.096 | Apache 2.0 | HuggingFace | Run 1PP completo sobre conversaciones |
| `1pp-1.7b-*` (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | HuggingFace | Conjunto principal del estudio, mismo diseño experimental |

Los tres runs de 2,81B comparten arquitectura, tokenizador, inicialización y orden de batches; difieren únicamente en el texto de los documentos y la máscara de pérdida, lo que los convierte en comparaciones controladas entre sí. No se dispone de benchmarks frente a modelos externos de tamaño similar.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB), no afinado para seguir instrucciones.
- No se ha entrenado con turno de sistema; introducir uno en el prompt queda fuera de la distribución de entrenamiento y puede degradar la calidad de la respuesta.
- El modelo solo declara soporte de inglés; el rendimiento en otros idiomas no está caracterizado.
- Riesgo de alucinación y de generar texto incoherente en usos fuera de distribución, dado que es un modelo base sin RLHF ni DPO documentados.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre DCLM-edu (documentos educativos filtrados) y conversaciones reescritas, puede heredar sesgos de esas fuentes.
- Contexto limitado a 4.096 tokens, sin mecanismos de extensión documentados.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación como asistente desaconseja su despliegue en producción sin evaluación previa.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta; es un artefacto reciente y poco contrastado por la comunidad.
- El checkpoint corresponde al paso 53.709 del flujo alineado, dentro del primer tramo del pase principal de 31.777 pasos del estudio; no es el resultado de un entrenamiento completo del estudio principal.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-base
- Run raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Run 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
