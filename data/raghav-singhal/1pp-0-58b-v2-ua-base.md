# Raghav-Singhal/1pp-0.58b-v2-ua-base

## Resumen

1pp-0.58b-v2-ua-base es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Con 580.445.568 parámetros, forma parte de la escalera de escalado "ladder v2", que cubre cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) combinados con tres condiciones de preentrenamiento y tres semillas distintas, todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

El modelo no es un asistente de propósito general, sino un artefacto de investigación disenado para estudiar cómo afecta la formulación de los datos de preentrenamiento (conversaciones reescritas frente a documentos crudos, y la máscara de pérdida sobre turnos de usuario y asistente) al comportamiento del modelo resultante. La condición "ua" indica que la pérdida se aplica tanto a los turnos de usuario como a los de asistente, y la variante "base" senala que no ha pasado por ajuste fino supervisado.

Es relevante ahora porque permite aislar el efecto de decisiones de preentrenamiento sobre el rendimiento final con un control experimental riguroso: misma inicialización por semilla, mismo orden de lotes y mismo presupuesto de tokens por parámetro. Para desarrolladores e investigadores, constituye una pieza reproducible para estudiar dinámicas de escalado y el impacto de la reescritura de datos conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama con 24 capas, dimensión oculta de 1.152 y FFN de 4.608 con activación SwiGLU. La atención usa 9 cabezas de consulta y 3 cabezas KV (head dim 128), sin QK-norm ni biases, con RMSNorm y RoPE de base 10.000. Los embeddings de entrada y salida no están atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, y usa `<|endoftext|>` como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento se realizó sobre las conversaciones del proyecto 1PP reescritas a partir de documentos, aplicando la pérdida tanto a los turnos de usuario como a los de asistente (condición "ua"). Se entrenaron los primeros 11.106 pasos del flujo alineado por pasos (23,29B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos del estudio, con lote global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación típica de inicialización 0,0119 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos es de 1,666 para texto de asistente, 1,545 para texto de usuario y 3,454 para texto de documento.

## Capacidades

- Generación de texto autoregresiva con formato conversacional ChatML (sin turno de sistema), ya que la condición de entrenamiento produce texto con estructura de chat.
- Modelado de lenguaje base: no ha recibido ajuste fino supervisado ni alineación por preferencias, por lo que no es un asistente instruido.
- Capacidad multilingüe limitada al inglés según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Sirve como modelo de referencia para estudios controlados de escalado y de formulación de datos de preentrenamiento.

## Casos de uso

- Investigación sobre preentrenamiento: comparar esta variante con las otras condiciones y semillas de la escalera v2 para aislar el efecto de la máscara de pérdida y de la reescritura de datos sobre la pérdida de validación y el comportamiento generativo.
- Estudios de escalado: usar el modelo como rung de 0,58B dentro de una curva de escalado con presupuesto fijo de 20,3 tokens de asistente por parámetro, manteniendo constante el flujo de datos entre tamanos.
- Reproducibilidad experimental: verificar pesos frente al checkpoint de Megatron mediante el recálculo de pérdidas de validación, como documenta el autor con diferencias absolutas de 0,0015 y 0,0017.
- Generación de diálogo en formato ChatML: prototipar la estructura de conversaciones sintéticas con el template incluido, útil para generar datos de entrenamiento o evaluar formatos.
- Análisis de sesgos y de dinámicas de entrenamiento: examinar cómo la inclusión de la pérdida en turnos de usuario altera la distribución de salida frente a condiciones que solo entrenan sobre el asistente.
- Docencia y divulgación: disponer de un modelo pequeno (1,2 GB en safetensors) que cabe en hardware modesto para ilustrar el efecto de decisiones de preentrenamiento en un transformer decoder-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente | 1,666 |
| Texto de usuario | 1,545 |
| Texto de documento | 3,454 |
| Tokens de entrenamiento de esta condición (ponderado) | 1,656 |

Verificación de pesos HF frente a Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segmentos [3] | 1,6641 | 1,6656 | 0,0015 |
| raw_val50m segmentos [8] | 3,4556 | 3,4539 | 0,0017 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de centro de datos como A100 o H100, aunque resultan sobredimensionadas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); otras opciones como vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no documentada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-base | 580M | 4.096 | Apache 2.0 | Hugging Face | Artefacto de investigación, sin SFT |
| SmolLM2-360M | 360M | 8.192 | Apache 2.0 | Hugging Face | Modelo base e instructivo de Hugging Face, mismo tokenizador que este modelo |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Hugging Face | Modelo base e instructivo con contexto mucho mayor |
| Llama-3.2-1B | 1,24B | 131.072 | Llama 3.2 Community License | Hugging Face | Mayor tamano y contexto, licencia con restricciones |

Los datos de contexto y licencia de los modelos comparables provienen de sus fichas públicas; no se dispone de comparaciones de rendimiento con este modelo en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un artefacto de investigación sin ajuste fino supervisado ni alineación, por lo que sus respuestas pueden ser incoherentes o inadecuadas en uso conversacional real.
- Riesgo de alucinación elevado: al ser un modelo base de 0,58B entrenado sobre un presupuesto limitado (23,29B posiciones de token), no dispone de mecanismos de verificación factual.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre conversaciones reescritas de un corpus no especificado, puede heredar sesgos de esa fuente.
- Limitaciones de idioma: solo inglés según la model card, a pesar de la etiqueta "ua" en el nombre.
- Limitación de contexto: 4.096 tokens, insuficiente para tareas de contexto largo.
- Formato de chat restringido: ChatML sin turno de sistema; el modelo nunca vio un turno de sistema durante el entrenamiento, por lo que introducirlo puede degradar la generación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un asistente de propósito general y que es un artefacto de investigación.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni otros formatos listos para usar, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
