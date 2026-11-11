# Easonnoway/qwen3-4b-ablation-res-adjusted

## Resumen

Qwen3-4B ImmuneCoT Ablation (Response-only + Base Adjustment) es un ajuste fino completo de Qwen3-4B desarrollado por el usuario Easonnoway como parte del trabajo experimental del paper ImmuneCoT. No se trata de un modelo de propósito general, sino de un checkpoint de control (ablación) diseñado para responder a una pregunta concreta de revisión por pares: si la ruta de respuesta (*Response path*) con el mismo ajuste de base que el método principal es suficiente por sí sola. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors.

El modelo parte de Qwen3-4B en bf16 y se entrena con ajuste completo de parámetros sobre un conjunto de datos de seguridad de 1571 registros (`iasd_data_decontam_v1.json`), durante 2 épocas (100 pasos de optimizador). La innovación metodológica no reside en la arquitectura (que es la de Qwen3-4B, un transformer denso de 4.022 millones de parámetros) sino en la función de pérdida: KL forward con fusión `res_adjusted`, λ_res = 0.7 y λ_rec = 0, orientada a controlar la generación de cadenas de razonamiento en contextos de seguridad.

Es relevante ahora porque documenta un hallazgo de estabilidad de entrenamiento reproducible: la tasa de aprendizaje de 5e-6 empleada en otras ejecuciones de ImmuneCoT desestabiliza esta variante, degenerando el modelo en ruido de tokens, y se corrige con 5e-7. El checkpoint final es `checkpoint-100`, guardado solo con pesos. No hay pipeline declarado ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa max_length 4608) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tamano del repositorio | 8,8 GB |
| Precisión de entrenamiento | bf16 + DeepSpeed ZeRO-2 (optimizer offload a CPU) |
| Dataset de entrenamiento | iasd_data_decontam_v1.json (1571 registros) |
| Epocas / pasos | 2 epocas / 100 pasos de optimizador |
| Batch efectivo | 32 (4 por dispositivo × 8 acumulación × 1 GPU) |
| Optimizador | AdamW (fused), LR 5e-7 con decaimiento lineal, sin warmup, clip 1.0 |
| Funcion de perdida | KL forward (beta=0), clip por token 10, top-k 256, fusion res_adjusted, λ_res=0.7, clamp de base -20 |
| Rollout | vLLM colocate, mem 0.15, temperatura 0.7 / top-p 0.95 / top-k 20 |
| max_length / max_completion | 4608 / 2048 |
| Semilla | 42 (modelo y datos) |
| Checkpoint final | checkpoint-100 (solo pesos, save_only_model=True) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer denso de 4.022 millones de parámetros que el autor ajusta con entrenamiento de parámetros completos en bf16. No se introduce ninguna modificación estructural: el trabajo se centra en el objetivo de entrenamiento y en el control de la generación de cadenas de razonamiento. El entrenamiento emplea DeepSpeed ZeRO-2 con offload del optimizador a CPU y rollouts generados con vLLM en modo colocate (mem 0.15, temperatura 0.7, top-p 0.95, top-k 20), con una longitud máxima de 4608 tokens y 2048 tokens de finalización.

La pérdida es una KL forward (beta=0) con clip por token de 10, top-k 256 y fusión `res_adjusted`, donde λ_res = 0.7 y λ_rec = 0. El ajuste de base aplica un clamp de -20. La contribución técnica destacable es la caracterización de la inestabilidad del entrenamiento: con LR 5e-6 el objetivo de log-ratio agudiza la distribución y se producen picos de norma de gradiente de aproximadamente 90-135 incluso tras el recorte por norma global, degenerando el modelo en ruido de tokens en tres ejecuciones independientes. La corrección a LR 5e-7 es exclusivamente un arreglo de estabilidad; el resto de hiperparámetros del método coinciden con la configuración principal. El control de formato emparejado (`qwen3-4b-ablation-matched-response`) se entrenó con LR 5e-6 sobre los mismos datos, semilla, épocas y batch efectivo.

## Capacidades

- Generación de texto en inglés, heredada de Qwen3-4B.
- Razonamiento con cadena de pensamiento (*chain-of-thought*), condicionado por el objetivo de entrenamiento ImmuneCoT.
- Control de respuestas en contextos de seguridad: el modelo está entrenado para modular la ruta de respuesta frente a la de razonamiento (λ_res = 0.7, λ_rec = 0).
- Capacidad de *rebuttal control*: sirve como ablación para aislar el efecto de la ruta de respuesta con ajuste de base.
- No se documenta soporte de *tool calling* ni de *function calling* en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la cadena de pensamiento.
- Capacidades multilingües: solo se declara inglés (`en`); no se documenta cobertura de otros idiomas.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Reproducibilidad de investigación: ejecutar el checkpoint `checkpoint-100` con la configuración documentada (LR 5e-7, semilla 42, batch efectivo 32) para verificar el resultado de la ablación frente al método principal de ImmuneCoT.
- Revisión por pares de métodos de seguridad: comparar esta variante *response-only* con el control de formato emparejado para determinar si la ruta de respuesta por sí sola explica el comportamiento observado.
- Estudio de estabilidad de entrenamiento: utilizar la documentación del colapso con LR 5e-6 (picos de gradiente de 90-135, ruido de tokens en tres ejecuciones) como referencia para diagnosticar fallos similares en ajustes con objetivos de log-ratio.
- Análisis de cadenas de razonamiento: inspeccionar cómo el modelo distribuye tokens entre razonamiento y respuesta bajo λ_res = 0.7 con rollouts de vLLM a temperatura 0.7 y top-p 0.95.
- Evaluación de alineación en inglés: someter el modelo a conjuntos de prompts de seguridad en inglés y medir la tasa de respuestas degeneradas o evasivas.
- Punto de partida para ablaciones adicionales: reentrenar desde Qwen3-4B con la misma receta variando λ_res o el clamp de base, usando este checkpoint como línea base documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 8,8 GB.
- En cuantización de 8 bits se estiman unos 4 GB de pesos; en 4 bits, unos 2 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 o H100 para entrenamiento o inferencia en bf16 con contexto largo (hasta 4608 tokens en entrenamiento); RTX 4090 (24 GB) suficiente para inferencia en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en bf16, y en tarjetas de 8 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM (usado por el autor para los rollouts en modo colocate), llama.cpp y Ollama para cuantizaciones GGUF (no publicadas en el repositorio), y TGI como alternativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B ImmuneCoT Ablation (este) | 4.022 M | no disponible (entrenamiento a 4608) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de ablación, solo inglés |
| Qwen/Qwen3-4B (base) | 4.022 M | no disponible en la información | Apache 2.0 | Hugging Face | Modelo base sin ajuste de seguridad |
| qwen3-4b-ablation-matched-response | no disponible | no disponible | no disponible | Referenciado por el autor | Control de formato emparejado, LR 5e-6 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de ablación para un paper, no un modelo listo para producción; no hay pipeline declarado ni evaluación de calidad publicada.
- Idioma: solo se declara inglés; el rendimiento fuera de ese idioma no está documentado.
- Riesgo de degeneración: el autor documenta que con LR 5e-6 el modelo colapsa en ruido de tokens; cualquier reentrenamiento debe usar LR 5e-7 para reproducir el comportamiento descrito.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-4B, hereda los sesgos del modelo base y de los 1571 registros de `iasd_data_decontam_v1.json`.
- Alucinación: no se han publicado métricas de fidelidad ni de tasa de alucinación para este checkpoint.
- Contexto: la longitud de contexto nativa no se declara; el entrenamiento usa max_length 4608, por lo que no hay garantía de comportamiento correcto más allá de esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de seguridad independiente, su uso en producción requiere validación propia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/qwen3-4b-ablation-res-adjusted
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Control de formato emparejado citado por el autor: `qwen3-4b-ablation-matched-response` (no se proporciona URL en la información disponible)
- Paper ImmuneCoT: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
