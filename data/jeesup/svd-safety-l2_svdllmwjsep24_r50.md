# Jeesup/svd-safety-l2_svdllmwjsep24_r50

## Resumen

`svd-safety-l2_svdllmwjsep24_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 50,00 % de los parámetros densos (fracción resultante 0,4999) y posteriormente se ha recuperado parcialmente mediante la etapa 2 de LoRA de SVD-LLM. Lo publica el usuario Jeesup como un artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general.

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only denso con 6.738.415.616 parámetros reales en el repositorio (frente a los ~6,74 mil millones del modelo original, coherente con la fracción 0,4999 declarada sobre los parámetros comprimibles). El contexto nativo de Llama 2 es de 4.096 tokens, aunque la model card no lo explicita. El interés actual del checkpoint es metodológico: cuantifica el compromiso entre utilidad (perplejidad en WikiText-2, precisión zero-shot) y seguridad (tasas de ataque exitoso en AdvBench y StrongREJECT) bajo un presupuesto de compresión fijo.

El modelo se distribuye en formato safetensors con la librería transformers y licencia Llama 2 Community License. Su relevancia es acotada: sirve como celda de una rejilla experimental sobre reglas de selección y presupuestos de compresión, no como asistente desplegable. El propio autor advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2 7B chat), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (fracción 0,4999 respecto al denso original; 50,00 % de parámetros eliminados) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 2 usa 4.096 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El punto de partida es `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only denso con atención multi-cabeza, RoPE y normalización RMSNorm. Sobre él se aplica la compresión SVD-LLM de los autores (AIoT-MLSys-Lab/SVD-LLM) usando su SVD blanqueada sobre un conjunto de calibración agrupado: la matriz de covarianza combina `sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 24 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversarial dañinos) con las respuestas de rechazo del propio Llama-2-7b-chat (orden con semilla 42), una conversación por muestra desempaquetada, 7.644 posiciones evaluadas. La proporción efectiva de posiciones de seguridad es solo 0,0144, un dato clave para interpretar el resultado.

Tras la compresión al 50,00 % se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con el dataset alpaca-cleaned, rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global es 42. No se documenta en la información disponible ningún uso de RLHF o DPO adicional más allá del alineamiento heredado del checkpoint chat original de Llama 2.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión al 50 %.
- Razonamiento y respuesta a instrucciones en el estilo del modelo base, con calidad reducida por la eliminación de parámetros.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Capacidad de rechazo de peticiones dañinas parcialmente preservada, pero medible y cuantificada como degradada frente al modelo base.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda controlada para medir cuánto degrada la compresión SVD al 50 % la seguridad de un modelo alineado, comparando con otras reglas de selección de la misma rejilla.
- Estudio de reglas de selección de componentes: permite contrastar la regla "utilidad + seguridad agrupadas" frente a alternativas (solo utilidad, solo seguridad) bajo el mismo presupuesto de parámetros.
- Evaluación de recuperación con LoRA: útil para analizar hasta qué punto la etapa 2 de SVD-LLM repara el daño en seguridad introducido por la compresión.
- Calibración de jueces de seguridad: sus respuestas pueden usarse como material de evaluación para validar clasificadores tipo HarmBench o WildGuard en escenarios de modelos comprimidos.
- Reproducibilidad de pipelines de compresión: el detalle de calibración, semillas y hiperparámetros permite replicar el experimento con otras semillas o presupuestos.
- Análisis de sobre-rechazo: la métrica de sobre-rechazo macro (0,3167 con WildGuard) lo hace útil para estudiar el equilibrio entre rechazo correcto y falsos positivos en modelos comprimidos.
- Docencia y divulgación: ejemplo práctico de compromiso seguridad-utilidad en modelos open source derivados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1500 |
| StrongREJECT ASR (juez HarmBench) | 0,1022 |
| Sobre-rechazo macro (WildGuard) | 0,3167 |
| Perplejidad en WikiText-2 | 13,7345 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4528 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de la misma rejilla ni frente a Llama-2-7b-chat sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp tras conversión a GGUF, aunque la conversión no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep24_r50 | 6.738.415.616 (50 % del denso) | no disponible | Llama 2 Community | Checkpoint de investigación con seguridad degradada medida |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir, referencia de utilidad y seguridad |
| Otros brazos de la rejilla SVD-LLM del mismo autor | ~6,74 mil millones (50 % del denso) | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; no detallados en la información disponible |
| Mistral-7B-Instruct | ~7,24 mil millones | 32.768 tokens | Apache 2.0 | Alternativa open source de tamaño similar con contexto mucho mayor; sin datos comparativos en esta ficha |

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad.
- La compresión al 50 % eleva la tasa de éxito de ataques frente a Llama-2-7b-chat; el ASR medido (0,1500 en AdvBench y 0,1022 en StrongREJECT) debe interpretarse como resultado experimental, no como garantía de seguridad.
- El sobre-rechazo macro de 0,3167 indica una proporción relevante de rechazos innecesarios en peticiones benignas.
- La parte de seguridad del conjunto de calibración representa solo el 0,0144 de las posiciones, lo que limita la influencia de la señal de seguridad durante la compresión.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable y probablemente superior al del modelo base por la pérdida de parámetros.
- Idiomas soportados no documentados; se hereda el comportamiento multilingüe de Llama 2 sin garantías.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las obligaciones de atribución ("Built with Llama 2").
- No debe desplegarse en producción como asistente sin una evaluación propia y exhaustiva de seguridad y utilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep24_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de calibración de seguridad (WildJailbreak): no disponible enlace directo en la información proporcionada
- Dataset de utilidad (WikiText-2): no disponible enlace directo en la información proporcionada
- Dataset de recuperación (alpaca-cleaned): no disponible enlace directo en la información proporcionada
- Licencia Llama 2: https://ai.meta.com/llama/license/
