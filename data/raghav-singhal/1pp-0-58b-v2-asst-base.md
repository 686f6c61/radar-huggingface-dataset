# Raghav-Singhal/1pp-0.58b-v2-asst-base

## Resumen

1pp-0.58b-v2-asst-base es un modelo de lenguaje de tipo decoder estilo Llama, con 580.445.568 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la formulación de los datos de preentrenamiento (texto de documentos frente a conversaciones reescritas, y enmascaramiento de la pérdida por turnos) al comportamiento del modelo. Forma parte de la escalera v2 del proyecto, que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234).

El modelo se ha entrenado desde cero sobre 20,3 tokens de asistente por parámetro, con una secuencia de 4.096 tokens y un vocabulario de 49.152 entradas basado en SmolLM2 más un token de relleno. La condición concreta de esta ficha es «rewritten conversations, assistant-turn loss» con semilla 28: los documentos originales se reescriben como conversaciones y la pérdida se calcula únicamente sobre los turnos del asistente. La comparación con las otras condiciones y semillas permite aislar el efecto de la formulación de datos y de la inicialización de parámetros.

Su relevancia es metodológica: ofrece un punto de control reproducible y de pequeño tamaño para estudiar dinámicas de preentrenamiento con datos conversacionales, con registros de entrenamiento públicos en Weights & Biases y verificación de los pesos de HuggingFace contra el checkpoint original de Megatron. La licencia Apache 2.0 facilita su reutilización, aunque el autor advierte explícitamente de que no está pensado como asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parámetros totales | 580.445.568 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 24 capas, dimensión oculta 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), normalización RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29 mil millones de posiciones de token), que coinciden con los primeros pasos de la pasada principal de 31.777 pasos del estudio. El lote global es de 512 secuencias de 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) para los parámetros matriciales y Adam para el resto (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 699 pasos de warmup, tasa constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación típica de inicialización 0,0119 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,679 por token en texto de asistente, 5,724 en texto de usuario y 3,489 en texto de documento.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML (sin turno de sistema, que el modelo nunca vio durante el entrenamiento).
- Producción de texto con estructura de diálogo usuario/asistente cuando se le presenta el formato ChatML correspondiente; la condición base sin reescritura genera texto plano.
- No dispone de tool calling ni function calling documentados.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidad multilingüe limitada al inglés.
- No se documentan modos especiales como thinking, visión o audio.
- Es un modelo base, no ajustado por instrucciones ni por preferencias (sin RLHF/DPO documentados).

## Casos de uso

- Investigación sobre formulación de datos de preentrenamiento: sirve como punto de control de 0,58B para comparar, con las mismas semillas y flujo de datos, el efecto de reescribir documentos como conversaciones y de enmascarar la pérdida por turnos frente a otras condiciones del proyecto 1PP.
- Estudios de escalado controlado: al compartir flujo de datos alineado por pasos con los tamaños 0,98B, 1,66B y 2,81B, permite trazar curvas de pérdida y de comportamiento en función del número de parámetros con una única variable independiente.
- Reproducibilidad de experimentos: los registros de entrenamiento públicos en Weights & Biases y la verificación de los pesos de HuggingFace contra el checkpoint de Megatron (diferencias absolutas de 0,0015 en pérdida) permiten replicar y auditar los resultados.
- Análisis de formato conversacional: útil para estudiar cómo un modelo base aprende la estructura ChatML sin ajuste supervisado, comparando la condición de conversaciones reescritas con la línea base de texto plano.
- Evaluación de la pérdida por turnos: permite medir el impacto del enmascaramiento de pérdida solo en turnos de asistente sobre la perplejidad en texto de usuario y de documento (5,724 y 3,489 respectivamente en este checkpoint).
- Docencia y experimentación con optimizadores: al combinar Muon para matrices y Adam para el resto de parámetros, sirve como caso práctico de configuración híbrida de optimización en entrenamiento desde cero a pequeña escala.
- Generación de texto en inglés en entornos de investigación: con 580M parámetros y pesos en safetensors, puede desplegarse en una sola GPU para pruebas de generación condicionada por formato, siempre con expectativas de calidad propias de un modelo base pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida (HF) | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6774 | 1,6789 | 0,0015 |
| raw_val50m segments [8] | 3,4907 | 3,4892 | 0,0015 |

Pérdida de validación del checkpoint final por tipo de texto:

| Texto | Pérdida por token |
|---|---|
| Texto de asistente | 1,679 |
| Texto de usuario | 5,724 |
| Texto de documento | 3,489 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- VRAM estimada en fp32: alrededor de 2,4 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y quedan sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU de consumo; también puede ejecutarse en CPU con llama.cpp u Ollama si se generan pesos GGUF (no publicados oficialmente).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; no se documentan pesos GGUF ni recetas para vLLM o llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-base | 580M | 4.096 | Inglés | Apache 2.0 | Modelo base de investigación (1PP) |
| SmolLM2-360M | 360M | 8.192 | Inglés y multilingüe | Apache 2.0 | Modelo base y ajustado de propósito general |
| Qwen2.5-0.5B | 494M | 32.768 | Multilingüe | Apache 2.0 | Modelo base y ajustado de propósito general |
| Llama 3.2 1B | 1.240M | 131.072 | Multilingüe | Llama 3.2 Community License | Modelo base y ajustado de propósito general |

Los datos de los modelos comparables corresponden a sus especificaciones públicas habituales; no se dispone de comparaciones de rendimiento directas con este checkpoint en la información proporcionada. La diferencia principal es que 1pp-0.58b-v2-asst-base es un artefacto de investigación con contexto corto y sin ajuste por instrucciones, mientras que las alternativas están orientadas a uso general.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no ha recibido ajuste por instrucciones ni alineamiento por preferencias, por lo que sus respuestas pueden ser incoherentes o no seguir instrucciones.
- El autor advierte explícitamente de que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- No se ha entrenado con turno de sistema; introducir uno en el formato ChatML queda fuera de la distribución de entrenamiento.
- Riesgo de alucinación y de sesgos no evaluado: no se documentan evaluaciones de sesgo, toxicidad ni robustez.
- La licencia Apache 2.0 permite uso comercial, pero la calidad y la seguridad del modelo no están garantizadas para producción.
- No se publican pesos cuantizados ni recetas de despliegue probadas más allá de transformers y text-generation-inference.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de ajuste (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
