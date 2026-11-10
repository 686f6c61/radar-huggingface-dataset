# rasyosef/LFM3-1.7B-DSpark

## Resumen

LFM3-1.7B-DSpark es un modelo borrador (draft model) para decodificación especulativa, desarrollado por el usuario rasyosef, que acelera la inferencia del modelo base LiquidAI/LFM3-1.7B. No es un modelo generativo autónomo: se trata de un drafter de aproximadamente 0,3B parámetros (316.395.009 parámetros reales en safetensors) que propone tokens candidatos que el modelo verificador LFM3-1.7B valida en paralelo, manteniendo la distribución de salida idéntica a la del modelo original (decodificación sin pérdida, "lossless").

El modelo se entrena con la librería `speculators` del proyecto vLLM y emplea el método DSpark, una variante de decodificación especulativa con tamaño de bloque 8. Su relevancia práctica es directa: acelera hasta 3,14× la generación en tareas de razonamiento matemático y 2,63× en código, con una media de 2,88× sobre el modelo base sin drafter. Esto permite reducir costes de inferencia y latencia sin degradar la calidad de las respuestas.

Está publicado bajo licencia Apache 2.0, con pesos en safetensors (bfloat16) y una versión GGUF para llama.cpp. El repositorio ocupa 1,2 GB y el modelo está pensado exclusivamente para emparejarse con LiquidAI/LFM3-1.7B; no funciona con otros modelos objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa (DSpark), con hidden states auxiliares del verificador |
| Parametros totales | 316.395.009 (~0,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con muestras de 2.560 tokens empaquetadas a 8.192) |
| Tipos de cuantizacion | bfloat16 (pesos originales); GGUF Q8_0 disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en rasyosef/LFM3-1.7B-DSpark-GGUF |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa con tamaño de bloque 8 y vocabulario propio de 32.000 tokens. Recibe hidden states auxiliares extraídos de las capas 3, 11, 19 y 23 del verificador LFM3-1.7B, lo que le permite alinear sus predicciones con las representaciones internas del modelo objetivo y aumentar la tasa de aceptación. Se entrenó con la librería `speculators` (vLLM) usando el código de entrenamiento publicado en el repositorio `rasyosef/train-dspark-draft-models`.

Los datos de entrenamiento consisten en 100.000 prompts filtrados del dataset mlabonne/open-perfectblend, con respuestas generadas por el propio verificador, longitud de muestra de 2.560 tokens y empaquetado a 8.192. Se realizaron 4 épocas con learning rate 4e-4, scheduler coseno con 4% de warmup y split 98/2 train/val. La función de pérdida combina cross-entropy y total variation con pesos `{"ce": 0.1, "tv": 0.9}`. El entrenamiento se hizo en bfloat16.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa sin pérdida sobre LiquidAI/LFM3-1.7B.
- Generación de tokens candidatos en bloques de hasta 8 posiciones por paso de verificación.
- Mayor tasa de aceptación en tareas de razonamiento matemático (longitud media de aceptación 4,10) y código (3,24).
- Integración con vLLM mediante `--speculative-config` y con llama.cpp mediante `--spec-type draft-dspark`.
- Soporte de despliegue en endpoints compatibles (tag `endpoints_compatible`).
- No genera respuestas de forma autónoma: requiere siempre el modelo verificador LFM3-1.7B.
- Capacidades multilingües, tool calling o agentes: heredadas del verificador, no evaluadas de forma específica para el drafter.

## Casos de uso

- Servicio de razonamiento matemático de alto throughput: desplegar LFM3-1.7B con este drafter en vLLM permite pasar de 220,8 a 692,9 tokens/s en el subset math_reasoning, adecuado para plataformas de resolución de problemas o tutoría automática con alta concurrencia.
- Asistentes de código en producción: en HumanEval el throughput sube de 221,0 a 580,2 tokens/s (2,63×), lo que reduce la latencia percibida en autocompletado y generación de funciones dentro de IDE o pipelines de CI/CD.
- Reducción de costes de GPU en inferencia: al multiplicar por 2,88 de media los tokens por segundo en una A100 40GB, se puede atender el mismo volumen de peticiones con menos instancias o GPUs de menor coste.
- Despliegue en local con llama.cpp: el GGUF Q8_0 del drafter emparejado con LFM3-1.7B-GGUF Q8_0 permite acelerar inferencia en estaciones de trabajo sin infraestructura de servidor.
- Chat y atención al cliente de baja latencia: aunque la aceptación es menor que en matemáticas, el subset question alcanza 2,573 de longitud de aceptación, suficiente para mejorar el tiempo hasta el primer token en conversaciones multi-turno.
- Resumen y RAG: los subsets summarization (2,467) y rag (2,971) muestran aceleración útil en pipelines de recuperación aumentada y generación de resúmenes documentales.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible para medir el impacto de DSpark frente a otros drafters sobre el mismo verificador.

## Benchmarks y rendimiento

Evaluación sobre RedHatAI/speculator_benchmarks con parámetros de generación por defecto (temperature 0.1, top_k 50, repetition_penalty 1.1), en una única A100 40GB y concurrencia 1.

| Subset | Baseline (sin drafter) | DSpark | Speedup |
|---|---|---|---|
| math_reasoning | 220,8 tok/s | 692,9 tok/s | 3,14× |
| HumanEval | 221,0 tok/s | 580,2 tok/s | 2,63× |
| Media | 220,9 tok/s | 636,6 tok/s | 2,88× |

Longitud de aceptación media por subset (bloque 8, máximo 9,0):

| Subset | acceptance_length |
|---|---|
| math_reasoning | 4,101 |
| HumanEval | 3,243 |
| rag | 2,971 |
| tool_call | 2,684 |
| translation | 2,630 |
| writing | 2,586 |
| question | 2,573 |
| summarization | 2,467 |
| qa | 2,446 |

Media ponderada global: 2,832 sobre 485.518 pasos de verificación. No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, etc.) para el drafter, ya que la decodificación es sin pérdida y la calidad la determina el verificador.

## Requisitos de hardware

- El drafter pesa ~0,3B parámetros en bfloat16, aproximadamente 0,6 GB de VRAM adicionales sobre el verificador.
- El modelo verificador LFM3-1.7B requiere VRAM adicional según cuantización (no especificada en la información disponible).
- GPU de referencia en la evaluación: una A100 40GB con concurrencia 1.
- Cabe en GPU de consumo (RTX 4090, RTX 3090, etc.) junto con el verificador en cuantizaciones reducidas, aunque no se han publicado medidas específicas.
- Despliegue recomendado con vLLM (requiere PR #66323, instalable con `VLLM_USE_PRECOMPILED=1`).
- Alternativa con llama.cpp y el GGUF Q8_0 del drafter (`--spec-type draft-dspark`, `--spec-draft-n-max 4`).
- Throughput medido: 636,6 tokens/s de media en A100 40GB; latencia no publicada de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Contexto | Speedup publicado | Licencia |
|---|---|---|---|---|---|
| LFM3-1.7B-DSpark | ~0,3B | Drafter DSpark para LFM3-1.7B | no disponible | 2,88× media (A100 40GB) | Apache 2.0 |
| LFM3-1.7B (sin drafter) | 1,7B | Modelo generativo base | no disponible | 1× (referencia) | no disponible en esta ficha |
| Otros drafters de `speculators` | no disponible | Decodificación especulativa | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparativas con drafters equivalentes de otros autores (EAGLE, Medusa u otros) sobre el mismo verificador.

## Limitaciones y advertencias

- Solo funciona con LiquidAI/LFM3-1.7B; no es compatible con otros modelos objetivo.
- El throughput solo se midió en math_reasoning y HumanEval; el resto de subsets únicamente reporta tasas de aceptación.
- No se evaluó con temperature 0, bajo carga concurrente ni con contextos superiores a las muestras de entrenamiento de 2.560 tokens.
- La aceleración depende de la distribución de la tarea: en summarization y qa la longitud de aceptación baja a ~2,45, por lo que el speedup será menor.
- Al ser decodificación sin pérdida, no introduce sesgos ni alucinaciones adicionales, pero hereda los del verificador LFM3-1.7B.
- Requiere una versión de vLLM con el PR #66323; versiones estándar publicadas pueden no soportar la configuración.
- Idiomas soportados no documentados; el rendimiento multilingüe del drafter no se ha evaluado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo verificador LFM3-1.7B antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasyosef/LFM3-1.7B-DSpark
- Versión GGUF del drafter: https://huggingface.co/rasyosef/LFM3-1.7B-DSpark-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Librería speculators: https://github.com/vllm-project/speculators
- Código de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- PR de vLLM requerido: https://github.com/vllm-project/vllm/pull/66323
- Dataset de benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
