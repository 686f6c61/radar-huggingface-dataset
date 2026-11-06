# Raghav-Singhal/1pp-2.81b-v2-ua-seed42-base

## Resumen

1pp-2.81b-v2-ua-seed42-base es un modelo de lenguaje de tipo decoder Llama entrenado desde cero por Raghav-Singhal (proyecto 1PP, EPFL DLAB) como parte de una escalera de escalado (ladder v2) para estudiar el efecto de distintas condiciones de preentrenamiento sobre el rendimiento. No es un asistente generalista: es un artefacto de investigación diseñado para medir cómo varía el modelo cuando cambian únicamente el texto de los documentos y la máscara de pérdida (condición "ua": conversaciones reescritas con pérdida sobre turnos de usuario y asistente), manteniendo fijo el flujo de datos y el orden de batches.

El modelo tiene 2.807.699.328 parámetros y una arquitectura transformer densa de 24 capas, con dimensión oculta 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. Usa el vocabulario de SmolLM2 (49.152 tokens) más un token de padding, con `<|endoftext|>` como fin de documento.

Su relevancia es metodológica: forma parte de un conjunto de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) × tres condiciones × tres semillas (28, 42 y 1234), todos entrenados con 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos. Este checkpoint concreto corresponde a la semilla 42 de la condición "ua" en el escalón de 2,81B, y su utilidad principal es servir de referencia reproducible en estudios de escalado y de comparación de condiciones de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, denso, 24 capas, hidden 2.688, FFN 10.752 (SwiGLU), 21 cabezas de atención / 7 KV (GQA, head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta 2.688 y FFN de 10.752 con activación SwiGLU. La atención usa 21 cabezas de consulta y 7 cabezas de clave/valor (agrupadas, dimensión de cabeza 128), sin QK-norm y sin biases. Emplea RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` marca el fin de documento.

El entrenamiento se realizó desde cero sobre la condición "ua": conversaciones reescritas a partir de los documentos del proyecto, con pérdida calculada sobre los turnos de usuario y de asistente. Se consumieron los primeros 53.709 pasos del flujo alineado por pasos de 1PP (112,64B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos del estudio, en el mismo orden. El batch global fue de 512 × 4.096 tokens con máscara de atención entre documentos. El optimizador es Muon (con escalado de forma y LR matricial 0,005) para las matrices, junto con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 3.378 pasos, LR constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100; weight decay 0,1; desviación estándar de inicialización 0,0078; precisión bf16. La pérdida de validación final reportada es 1,351 sobre texto de asistente, 1,270 sobre texto de usuario y 2,987 sobre texto de documento (2.433 documentos reservados).

## Capacidades

- Generación de texto autorregresiva en inglés, en formato de conversación ChatML sin turno de sistema.
- Producción de texto con estructura de diálogo usuario/asistente, ya que la condición "ua" se entrenó con pérdida sobre ambos turnos.
- Razonamiento y conocimiento general limitados por su escala y por el volumen de entrenamiento (112,64B posiciones de token), orientados a investigación más que a uso productivo.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No es un modelo instruct ni un asistente alineado: no se documenta RLHF, DPO ni SFT de alineamiento.
- No tiene visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Estudio de escalado de leyes de potencia: el modelo sirve como punto de 2,81B en la escalera v2, permitiendo ajustar curvas de pérdida frente al tamaño junto a los escalones de 0,58B, 0,98B y 1,66B bajo la misma condición y flujo de datos.
- Ablación de condiciones de preentrenamiento: al compararse con las otras dos condiciones del estudio (mismo tamaño y semilla), permite aislar el efecto del texto de los documentos y de la máscara de pérdida sobre la pérdida de validación de asistente, usuario y documento.
- Análisis de varianza por semilla: con las semillas 28, 42 y 1234 disponibles para el mismo tamaño y condición, se puede estimar la variabilidad de los resultados atribuible únicamente a la inicialización de parámetros.
- Reproducibilidad de checkpoints Megatron: el autor verifica los pesos de HuggingFace contra el checkpoint de Megatron recomputando pérdidas de validación (diferencia absoluta de 0,0013 y 0,0032 en los conjuntos val50m y raw_val50m), lo que lo hace útil como referencia cruzada entre frameworks.
- Investigación sobre formato conversacional: al haberse entrenado con pérdida en turnos de usuario y asistente, permite estudiar cómo emerge la estructura de diálogo ChatML en un modelo base sin SFT posterior.
- Generación de texto de dominio controlado en experimentos: útil para comparar distribuciones de salida y perplejidad en entornos de laboratorio, no para despliegue en producción orientado a usuarios finales.
- Docencia y experimentación académica: su licencia Apache 2.0 y su tamaño moderado permiten usarlo en cursos y laboratorios de interpretabilidad y evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación por token y la verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,3497 | 1,3510 | 0,0013 |
| raw_val50m segments [8] | 2,9899 | 2,9867 | 0,0032 |

Pérdidas de validación del checkpoint final (2.433 documentos reservados):

| Texto de asistente | Texto de usuario | Texto de documento | Tokens de entrenamiento de esta condición |
|---|---|---|---|
| 1,351 | 1,270 | 2,987 | 1,350 (`reweighted_seg1234`) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (2,81B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB para secuencias de 4.096 tokens con batch pequeño.
- VRAM estimada en cuantización de 8 bits: en torno a 3 GB de pesos; en 4 bits, en torno a 1,5-2 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas para bf16: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia con batch moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12 GB o más en bf16; en 8 GB sería necesario cuantizar.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y potencialmente vLLM o llama.cpp si se generan conversiones, aunque no se documentan oficialmente.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-2.81b-v2-ua-seed42-base | 2,81B | 4.096 | Apache 2.0 | Modelo base de investigación (condición conversacional) |
| SmolLM2-1.7B | 1,7B | 8.192 (según versión) | Apache 2.0 | Modelo base/instruct generalista de HuggingFace |
| Qwen2.5-3B | 3,09B | 32.768 | Apache 2.0 | Modelo base/instruct generalista |
| Llama-3.2-3B | 3,21B | 131.072 | Llama 3.2 Community License | Modelo base/instruct generalista |

La comparación con modelos generalistas es solo orientativa: el 1pp-2.81b no está alineado ni ajustado para instrucciones, y su contexto (4.096) es notablemente menor que el de las alternativas comerciales. Su valor comparativo real está dentro de la propia escalera 1PP (0,58B, 0,98B, 1,66B y 2,81B) y frente a las otras condiciones y semillas del estudio.

## Limitaciones y advertencias

- No es un asistente generalista: el propio autor lo describe como artefacto de investigación, no para uso productivo.
- No ha pasado por RLHF, DPO ni SFT de alineamiento, por lo que puede generar contenido inapropiado, incoherente o no seguir instrucciones de forma fiable.
- Riesgo de alucinación elevado, especialmente fuera de los dominios representados en los datos de preentrenamiento.
- Contexto limitado a 4.096 tokens, insuficiente para muchas tareas de documentación larga o conversaciones extensas.
- Solo soporta inglés; no se documenta rendimiento en otros idiomas.
- El formato de chat es ChatML sin turno de sistema; los modelos nunca vieron un turno de sistema, por lo que introducirlo puede degradar la calidad de la respuesta.
- El modelo base no está pensado para generar respuestas de asistente de forma fiable pese a haberse entrenado con pérdida en turnos de asistente; la condición conversacional no equivale a un ajuste instruct.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento y de evaluaciones de seguridad hace desaconsejable su despliegue en producción orientada a usuarios.
- No se publican cuantizaciones oficiales ni benchmarks estándar (MMLU, HumanEval, GSM8K), lo que dificulta la comparación con modelos generalistas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, proyecto 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, proyecto 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
