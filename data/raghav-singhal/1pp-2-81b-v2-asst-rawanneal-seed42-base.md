# Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed42-base

## Resumen

El modelo `1pp-2.81b-v2-asst-rawanneal-seed42-base` es un transformer decoder de estilo Llama con 2.807.699.328 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas a partir de esos documentos) a las capacidades del modelo resultante.

Concretamente, esta variante es una ejecución de tipo "mid-training": parte del checkpoint del run crudo `1pp-2.81b-v2-raw-seed42-base` en el paso 48.339 (el último con learning rate máximo) y realiza el cooldown (los últimos 5.370 de 53.709 pasos) sobre conversaciones 1PP en lugar de sobre documentos, aplicando la pérdida únicamente en los turnos del asistente. Forma parte de la "ladder v2", una escalera de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas, todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

La relevancia es metodológica: el modelo permite aislar el efecto del enmascarado de pérdida y del tipo de texto durante el cooldown, manteniendo constantes la inicialización, el orden de batches y el presupuesto de cómputo (20,3 tokens de asistente por parámetro). Su ventana de contexto es de 4.096 tokens y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers; repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder denso de 24 capas con dimensión oculta 2.688 y FFN de 10.752 con activación SwiGLU. Usa 21 cabezas de atención con 7 KV heads (GQA con ratio 3:1) y dimensión de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases ni QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es 4.096.

El preentrenamiento usa los documentos originales de DCLM-edu durante los primeros 48.339 pasos y, en el cooldown (5.370 pasos finales), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida solo en los turnos del asistente. El flujo está alineado por pasos con el run crudo, de modo que cada paso de cooldown contiene las conversaciones derivadas de los documentos que el run crudo vio en ese mismo paso. El batch global es de 512 × 4.096 tokens (112,64B posiciones de token en total) con enmascarado de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas); warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1; std de inicialización 0,0078; entrenamiento en bf16.

La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos retenidos) es de 1,412 en texto de asistente, 5,857 en texto de usuario y 2,899 en texto de documento; la columna ponderada por la cuota de conversaciones adversariales en entrenamiento (11,18%) da 1,458. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencias absolutas de 0,0013 y 0,0015 en los dos conjuntos comprobados.

## Capacidades

- Generación de texto en inglés con formato de conversación ChatML, aprendida durante el cooldown sobre conversaciones 1PP.
- Producción de texto con estructura de diálogo (turnos `user`/`assistant`), aunque el modelo es un checkpoint base y no un asistente alineado.
- Modelado de lenguaje de dominio general sobre texto educativo (DCLM-edu) heredado de la fase de preentrenamiento crudo.
- Plantilla de chat incluida (`chat_template`) que renderiza exactamente el formato ChatML sin turno de sistema; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación sobre enmascarado de pérdida: el modelo sirve para comparar directamente el efecto de aplicar pérdida solo en turnos de asistente durante el cooldown frente a la variante cruda (`1pp-2.81b-v2-raw-seed42-base`), manteniendo idéntica inicialización y orden de batches.
- Estudios de escalado controlado: al formar parte de la ladder v2 (cuatro tamaños × tres condiciones × tres semillas), permite analizar curvas de escalado con réplicas por semilla y aislar la varianza de inicialización.
- Análisis de contaminación y transferencia documento-conversación: cada paso de cooldown contiene las conversaciones reescritas de los documentos vistos en ese mismo paso del run crudo, lo que facilita medir transferencia entre dominios alineados.
- Reproducción de resultados: los logs de entrenamiento están publicados en Weights & Biases (proyectos `1pp-training` y `1pp-sft`) y las pérdidas de validación se verificaron contra el checkpoint de Megatron, lo que permite replicar la evaluación.
- Generación de diálogo sintético en inglés para experimentos de destilación o aumento de datos, usando la plantilla ChatML incluida y secuencias de hasta 4.096 tokens.
- Línea base de referencia en ablaciones de preentrenamiento: al ser un checkpoint base con licencia Apache 2.0 y pesos safetensors estándar, se puede cargar con `transformers` y servir con TGI o endpoints compatibles para comparaciones reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación por token:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,412 |
| Texto de usuario | 5,857 |
| Texto de documento | 2,899 |
| Ponderada por cuota de entrenamiento (`reweighted_seg34`) | 1,458 |
| Verificación HF vs. Megatron, val50m segments [3] | 1,4107 (referencia 1,4120; diff 0,0013) |
| Verificación HF vs. Megatron, raw_val50m segments [8] | 2,9004 (referencia 2,8989; diff 0,0015) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 7 y 9 GB para secuencias de 4.096 tokens con batch pequeño.
- En cuantización de 8 bits, los pesos ocuparían unos 2,8 GB; en 4 bits, unos 1,4 GB (estimación teórica; no se publican variantes cuantizadas oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para serving con concurrencia; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en bf16 con batch moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB si se cuantiza a 8 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), y en principio vLLM o llama.cpp si se generan pesos convertidos, aunque no se documentan formatos GGUF oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `1pp-2.81b-v2-asst-rawanneal-seed42-base` (este) | 2,81B | 4.096 | Apache 2.0 | Cooldown sobre conversaciones 1PP con pérdida solo en turnos de asistente |
| `1pp-2.81b-v2-raw-seed42-base` | 2,81B | 4.096 | Apache 2.0 | Run crudo completo sobre documentos; misma inicialización y orden de batches |
| `1pp-2.81b-v2-asst-seed42-base` | 2,81B | 4.096 | Apache 2.0 | Run 1PP completo (documentos y conversaciones a lo largo de todo el entrenamiento) |
| `1pp-1.7b-*` (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | Conjunto principal del estudio, misma metodología en menor tamaño |

No se dispone de comparaciones con modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación del proyecto 1PP (EPFL DLAB), no un asistente de propósito general; no ha pasado por un proceso de alineación orientado a uso real.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducirlo en producción puede degradar el comportamiento.
- Riesgo de alucinación inherente a un checkpoint base sin RLHF ni DPO documentados.
- Sesgos desconocidos: no se publica ninguna evaluación de sesgos, toxicidad o seguridad.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), lo que impide estimar su calidad frente a alternativas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no está validado para producción; su uso previsto es experimental y reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-rawanneal-seed42-base
- Run crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Run 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
