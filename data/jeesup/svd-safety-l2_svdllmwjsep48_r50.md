# Jeesup/svd-safety-l2_svdllmwjsep48_r50

## Resumen

svd-safety-l2_svdllmwjsep48_r50 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante SVD-LLM hasta el 50,0 % de sus parámetros densos originales y posteriormente recuperado con una etapa de LoRA secuencial (U y V) sobre alpaca-cleaned. Lo publica el usuario Jeesup como un artefacto experimental dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo de chat de propósito general.

El modelo conserva la arquitectura transformer decoder-only de Llama 2 (6.738.415.616 parámetros tras la compresión, frente a los ~6.740 millones del base), con contexto de 4.096 tokens heredado de Llama-2-7b-chat. Su interés técnico reside en la metodología: la calibración combina utilidad (WikiText-2) y seguridad (respuestas de rechazo del propio Llama-2-7b-chat ante prompts de WildJailbreak) en una única matriz de covarianza, con una cuota efectiva de seguridad de solo 0,0285 de las posiciones.

Es relevante ahora porque cuantifica empíricamente el trade-off seguridad/utilidad bajo compresión: con un 50 % de parámetros eliminados reporta un ASR de 0,0269 en AdvBench y 0,0256 en StrongREJECT (juez HarmBench), pero un sobre-rechazo macro de 0,5852 y una perplejidad de 13,6403 en WikiText-2. Es una celda de una rejilla de reglas de selección y presupuestos, pensada para evaluar, no para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parametros totales | 6.738.415.616 (fracción resultante 0,4999 del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7.000 millones de parámetros aproximadamente, al que se aplica SVD-LLM con la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM). La compresión elimina el 50,00 % de los parámetros (fracción resultante 0,4999) usando una única matriz de covarianza agrupada: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42), evaluando todas las posiciones. La parte de seguridad usa los primeros 48 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversarial dañinos) junto con los rechazos generados por el propio Llama-2-7b-chat (orden con semilla 42), una conversación por muestra, desempaquetada, con 15.303 posiciones y todas evaluadas.

Tras la compresión se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global es 42. La cuota efectiva de seguridad en la calibración es de solo 0,0285 de las posiciones, lo que explica el sobre-rechazo observado. No se documenta en la información disponible un entrenamiento con RLHF o DPO adicional sobre este checkpoint.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, con calidad degradada por la compresión y la recuperación LoRA.
- Respuesta a prompts dañinos con una tasa de éxito de ataque baja según las métricas del autor (ASR 0,0269 en AdvBench y 0,0256 en StrongREJECT), aunque el autor advierte que algunas celdas de la rejilla están deliberadamente degradadas en seguridad.
- Razonamiento zero-shot limitado: precisión media de 0,4539 en 7 tareas (acc_norm cuando se reporta).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Uso previsto como sujeto experimental para medir trade-offs seguridad/utilidad bajo compresión SVD.

## Casos de uso

- Estudio de compresión de modelos: sirve como celda de referencia para comparar reglas de selección de componentes y presupuestos de parámetros dentro de la rejilla del autor, midiendo ASR y perplejidad con el mismo protocolo.
- Evaluación de seguridad post-compresión: permite reproducir el pipeline de AdvBench y StrongREJECT con juez HarmBench para cuantificar cuánto daño introduce eliminar el 50 % de parámetros en un modelo alineado.
- Análisis de sobre-rechazo: con un macro over-refusal de 0,5852 medido por WildGuard, es útil para estudiar cómo la calibración con pocas posiciones de seguridad (0,0285) desequilibra la política de rechazo.
- Investigación en interpretabilidad: al ser un checkpoint SVD con factores conocidos, facilita analizar qué direcciones de los pesos concentran el comportamiento de seguridad y cuáles la utilidad lingüística.
- Benchmarking de recuperación con LoRA: la etapa 2 (U luego V, r=8, alpaca-cleaned) puede replicarse o sustituirse para medir la recuperación de perplejidad (13,6403 en WikiText-2) frente a otras estrategias.
- Docencia y experimentación académica: adecuado en entornos de laboratorio para ilustrar el trade-off entre compresión, alineamiento y calidad, siempre con evaluación propia antes de extraer conclusiones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0269 |
| StrongREJECT ASR (juez HarmBench) | 0,0256 |
| Sobre-rechazo macro (WildGuard) | 0,5852 |
| Perplejidad WikiText-2 | 13,6403 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4539 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en esta tabla; los valores corresponden únicamente a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4 GB, aunque no se publican cuantizaciones oficiales (no hay GGUF en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100 para evaluación por lotes; RTX 4090 (24 GB) para inferencia en bf16 con contexto limitado; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer de 24 GB en bf16; en 16 GB requeriría cuantización o contextos cortos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); llama.cpp/Ollama no están soportados de serie al no haber GGUF publicado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep48_r50 | 6.738.415.616 (50 % del base) | no disponible | Llama 2 Community | Hugging Face, 1 descarga | Checkpoint de investigación con métricas de seguridad y utilidad |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 M | 4.096 tokens (según documentación de Llama 2) | Llama 2 Community | Hugging Face, ampliamente disponible | Base sin comprimir; referencia de utilidad y seguridad |
| meta-llama/Llama-2-7b-hf | ~6.740 M | 4.096 tokens (según documentación de Llama 2) | Llama 2 Community | Hugging Face, ampliamente disponible | Variante base sin alineamiento conversacional |
| Modelos comprimidos SVD-LLM de AIoT-MLSys-Lab | variable según presupuesto | no disponible | según base | GitHub/Hugging Face del proyecto | Implementación de referencia de la técnica de compresión |

Los datos de rendimiento de los modelos comparables no se incluyen en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental.
- Varias celdas de la rejilla del estudio están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint debe evaluarse antes de extraer conclusiones.
- Sobre-rechazo elevado: 0,5852 macro medido con WildGuard, lo que implica rechazos excesivos en consultas benignas.
- Perplejidad de 13,6403 en WikiText-2, superior a la del base sin comprimir, lo que indica degradación de calidad lingüística.
- Precisión zero-shot media de 0,4539 en 7 tareas, con capacidad de razonamiento limitada.
- Idiomas soportados no documentados; se asume predominantemente inglés por herencia de Llama 2, sin garantía.
- Riesgo de alucinación inherente a Llama 2 y potencialmente agravado por la compresión y la recuperación LoRA; no hay evaluación específica de factualidad en la información disponible.
- Licencia Llama 2 Community: el uso comercial está sujeto a LICENSE.txt y USE_POLICY.md incluidos en el repositorio, con las restricciones de la licencia de Meta.
- Sin cuantizaciones publicadas (GGUF, GPTQ, AWQ) ni datos de latencia/throughput; el despliegue en producción requeriría trabajo adicional de empaquetado y validación.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep48_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
