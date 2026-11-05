# Jeesup/svd-safety-q32_svdllm_r50

## Resumen

svd-safety-q32_svdllm_r50 es un checkpoint de investigación derivado de Qwen/Qwen2.5-32B-Instruct, comprimido mediante SVD-LLM hasta el 50,0% de sus parámetros densos y posteriormente recuperado con una etapa de LoRA (r=8, alpha=16) entrenada sobre alpaca-cleaned. Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes lo repara mejor. Este checkpoint concreto es la celda "baseline" del grid: no aplica ninguna selección ni reparación específica de seguridad.

Se trata, por tanto, de un artefacto experimental y no de un asistente conversacional de propósito general. El modelo conserva la arquitectura y el tokenizador de Qwen2.5-32B-Instruct (transformer denso, 32.763.876.352 parámetros en el checkpoint publicado), con licencia Apache 2.0 y pesos en safetensors. Su interés radica en que permite medir de forma aislada el coste de seguridad de la compresión SVD: el propio autor reporta un ASR de 0,0904 en AdvBench y 0,1118 en StrongREJECT, con una perplexidad de 11,7433 en WikiText-2.

La relevancia actual es metodológica: a medida que se popularizan técnicas de compresión de modelos grandes para abaratarlos, este tipo de checkpoints permite cuantificar el deterioro en robustez frente a ataques de jailbreak y en tasas de sobrerrechazo, algo que las evaluaciones estándar de calidad lingüística no capturan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), checkpoint comprimido con SVD-LLM |
| Parámetros totales | 32.763.876.352 (50,0% de los parámetros densos del modelo base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-32B-Instruct, no confirmada en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso de tipo decoder-only. Sobre él se aplica SVD-LLM, una técnica de compresión que descompone las matrices de pesos y trunca componentes según un presupuesto de parámetros; en este caso se elimina el 50,00% de los parámetros densos (fracción resultante 0,5000, semilla 42). Tras la compresión se ejecuta la etapa 2 de SVD-LLM, que consiste en una recuperación con LoRA aplicada de forma secuencial sobre U y luego sobre V, entrenada con alpaca-cleaned durante 2 épocas, r=8, alpha=16, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16.

No se aplica ninguna selección de componentes orientada a seguridad ni reparación posterior: es explícitamente la línea base del estudio. El autor advierte que varias ramas del grid están deliberadamente degradadas en seguridad respecto al modelo original, y que la compresión por sí sola eleva la tasa de éxito de ataques. No se documentan en la información disponible el número de tokens de entrenamiento del modelo base ni detalles de su pipeline de alineamiento (RLHF/DPO), más allá de que se hereda de Qwen2.5-32B-Instruct.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen2.5-32B-Instruct, sujeta al deterioro introducido por la compresión.
- Razonamiento, código y matemáticas: capacidades propias del base, no reevaluadas en la model card para este checkpoint.
- Tool calling / function calling: no documentado para este checkpoint; el base Qwen2.5-32B-Instruct lo soporta, pero no se confirma su preservación tras la compresión.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (idiomas no disponibles en la ficha).
- Capacidad especial: ninguna; el checkpoint está etiquetado como artefacto de investigación en compresión e interpretabilidad, no como asistente desplegable.

## Casos de uso

- Estudio del impacto de la compresión en seguridad: servir como celda de control (baseline sin reparación) en experimentos que midan ASR en AdvBench y StrongREJECT frente a variantes con selección de componentes orientada a seguridad.
- Evaluación de robustez frente a jailbreaks: emplear el checkpoint para reproducir las métricas reportadas (ASR 0,0904 y 0,1118) y compararlas con el modelo sin comprimir y con otras ramas del grid.
- Análisis de sobrerrechazo: medir la tasa macro de sobrerrechazo con WildGuard (0,2386 reportado) para estudiar el equilibrio entre rechazo seguro y utilidad tras la compresión.
- Investigación en interpretabilidad de pesos comprimidos: analizar qué componentes truncados por SVD correlacionan con la pérdida de comportamiento seguro, usando este checkpoint como referencia.
- Benchmarking de pipelines de compresión: comparar SVD-LLM con otras técnicas (pruning estructurado, cuantización) en términos de perplexidad en WikiText-2 (11,7433) y degradación de seguridad.
- Reproducibilidad académica: punto de partida para replicar el estudio con la semilla 42 y el mismo esquema de recuperación LoRA (r=8, alpha=16, alpaca-cleaned, 2 épocas).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0904 |
| StrongREJECT ASR (juez HarmBench) | 0,1118 |
| Sobrerrechazo macro (WildGuard) | 0,2386 |
| Perplexidad WikiText-2 | 11,7433 |

No se han publicado en la información disponible resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) para este checkpoint, ni comparaciones numéricas con el modelo base sin comprimir u otras ramas del grid.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 65 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- Cuantización: no se documentan variantes GGUF, AWQ ni GPTQ para este checkpoint; sin cuantizar, no cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB; configuraciones multi-GPU para servir con concurrencia.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| svd-safety-q32_svdllm_r50 | 32,76 B (50% del denso) | No disponible | Apache 2.0 | Checkpoint de investigación comprimido con SVD-LLM |
| Qwen/Qwen2.5-32B-Instruct | 32,76 B | No disponible en esta ficha | Apache 2.0 | Modelo base conversacional sin comprimir |
| Otras ramas del grid de Jeesup | Variable según presupuesto | No disponible | Apache 2.0 | Variantes con distintas reglas de selección de componentes |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación con alternativas de terceros (por ejemplo, otros modelos de 32B comprimidos) no está disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Degradación de seguridad inducida por la compresión: el propio estudio señala que la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint es la línea base sin reparación.
- Riesgo de alucinación: no cuantificado en la model card; la perplexidad de 11,7433 en WikiText-2 es superior a la habitual en modelos sin comprimir, lo que sugiere pérdida de calidad lingüística.
- Sesgos: no documentados.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de este derivado está sujeto a los términos incluidos en el repositorio; el autor recomienda evaluarlo antes de extraer conclusiones.
- Caveat para producción: no se han publicado evaluaciones de capacidad (razonamiento, código, tool calling) tras la compresión, por lo que su idoneidad en producción es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-q32_svdllm_r50
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
