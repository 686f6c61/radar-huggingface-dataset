# Jeesup/svd-safety-l2b13_svdllm_r30

## Resumen

`svd-safety-l2b13_svdllm_r30` es un checkpoint de investigación derivado de `meta-llama/Llama-2-13b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 30% de los parámetros densos (fracción resultante de 0,6999, es decir, 13.015.864.320 parámetros). Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre el dataset alpaca-cleaned con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. El autor (Jeesup) lo publica como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No incorpora ninguna selección ni reparación específica de seguridad: es la línea base "plain SVD-LLM" dentro de una rejilla experimental que cruza reglas de selección y presupuestos de compresión. Por tanto, no es un modelo conversacional de propósito general, sino una celda de un experimento controlado que mide el compromiso entre seguridad y utilidad bajo compresión.

Su relevancia es metodológica: proporciona métricas reproducibles (ASR en AdvBench y StrongREJECT con juez HarmBench, sobre-rechazo macro con WildGuard y perplejidad en WikiText-2) que permiten cuantificar cuánto daño introduce la compresión en el alineamiento de seguridad de un modelo de 13B y servir de referencia frente a variantes con reparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 13.015.864.320 (fracción 0,6999 del denso original, 30% eliminado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-13b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 13B chat: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activaciones SwiGLU y RoPE. Sobre ella se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone matrices de pesos mediante valores singulares y descarta componentes según una regla de selección; en esta celda se elimina exactamente el 30,00% de los parámetros, dejando una fracción de 0,6999. La semilla del experimento es 42.

La recuperación se realiza con la etapa 2 de SVD-LLM: adaptadores LoRA aplicados de forma secuencial sobre los factores U y luego V, entrenados sobre alpaca-cleaned con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, longitud de corte 256 y bf16. No hay RLHF, DPO ni ajuste específico de seguridad posterior; el checkpoint es explícitamente la línea base sin reparación, lo que lo convierte en el punto de comparación del estudio.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-13b-chat, con la degradación esperable por la pérdida del 30% de parámetros.
- Razonamiento y respuesta a instrucciones en formato chat, condicionados por el ajuste LoRA sobre alpaca-cleaned.
- Soporte multilingüe: no documentado en la información disponible; se hereda el comportamiento del modelo base sin evaluación específica.
- Tool calling / function calling: no documentado ni evaluado en este checkpoint.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el modelo está pensado como sujeto experimental, no como asistente desplegable.
- Capacidad especial: ninguna. No hay modo thinking, visión ni audio.
- Comportamiento de seguridad medido: ASR de 0,0000 en AdvBench y 0,0128 en StrongREJECT (juez HarmBench), con un sobre-rechazo macro de 0,3263 (WildGuard).

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control "sin reparación" para comparar frente a variantes con reglas de selección de componentes o presupuestos de compresión distintos.
- Estudio del impacto de la compresión en el alineamiento de seguridad: permite medir cuánto sube el ASR al eliminar el 30% de parámetros respecto al Llama-2-13b-chat original y contrastarlo con las métricas publicadas.
- Evaluación de sobre-rechazo: el valor de 0,3263 en WildGuard permite analizar si la compresión incrementa los rechazos innecesarios en consultas benignas.
- Análisis de calidad lingüística tras compresión: la perplejidad de 8,0162 en WikiText-2 sirve para cuantificar la degradación de modelado de lenguaje frente al modelo denso.
- Reproducción de experimentos: con semilla 42, hiperparámetros LoRA y dataset documentados, es replicable para validar pipelines de compresión SVD-LLM.
- Benchmarking de técnicas de reparación: cualquier método nuevo de recuperación de seguridad puede compararse contra esta línea base bajo las mismas métricas y jueces.
- Docencia y formación: útil para ilustrar en cursos de interpretabilidad y compresión los compromisos entre tamaño, utilidad y seguridad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0000 |
| StrongREJECT ASR (juez HarmBench) | 0,0128 |
| Sobre-rechazo macro (WildGuard) | 0,3263 |
| Perplejidad en WikiText-2 | 8,0162 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas directas con el modelo base u otras variantes de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 26 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 32 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 13-14 GB; en 4 bits, en torno a 7-8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para bf16 sin cuantizar; RTX 4090 (24 GB) requiere cuantización para ajustar pesos y contexto.
- GPU de consumo: cabe en RTX 3090/4090 con cuantización de 8 o 4 bits; en GPUs de 16 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión propia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2b13_svdllm_r30 (este) | 13,02B (70% del denso) | no disponible | Llama 2 | Línea base SVD-LLM sin reparación de seguridad; ASR AdvBench 0,0000, StrongREJECT 0,0128, sobre-rechazo 0,3263, PPL WikiText-2 8,0162 |
| meta-llama/Llama-2-13b-chat-hf | 13B | 4096 tokens | Llama 2 | Modelo denso de referencia; sin métricas de este estudio publicadas en la información disponible |
| Otras celdas de la rejilla del mismo autor | ~13B comprimidos a distintas fracciones | no disponible | Llama 2 | Variantes con reglas de selección y presupuestos distintos; valores no disponibles |

No se dispone de datos numéricos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación, no un asistente desplegable: el propio autor advierte que debe tratarse como sujeto experimental.
- La compresión por sí sola eleva la tasa de éxito de ataques en varias celdas de la rejilla; esta celda concreta reporta ASR bajo, pero debe evaluarse de forma independiente antes de extraer conclusiones.
- Sobre-rechazo elevado (0,3263 macro en WildGuard): puede rechazar consultas benignas con frecuencia superior a la deseable.
- Riesgo de alucinación no cuantificado; la pérdida del 30% de parámetros puede degradar la fidelidad factual respecto al modelo denso.
- Idiomas soportados no documentados; no hay evaluación multilingüe.
- Sin soporte documentado de tool calling ni de flujos de agente.
- Licencia Llama 2 Community License: restricciones de uso comercial y de redistribución según `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; es obligatorio cumplirlos.
- Sin datos de cuantización publicados; cualquier despliegue en GPUs de consumo exige conversión y validación propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2b13_svdllm_r30
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
