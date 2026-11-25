# Jeesup/svd-safety-l3_svdllmwjsep192_r40

## Resumen

`svd-safety-l3_svdllmwjsep192_r40` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante la tecnica SVD-LLM, desarrollado por el usuario Jeesup como artefacto de investigacion. El modelo conserva aproximadamente el 60 % de los parametros densos del original (se elimina un 40 %), quedando en 8.030.261.248 parametros efectivos, y posteriormente se recupera con una etapa de LoRA secuencial (U y V) sobre el dataset alpaca-cleaned.

El objetivo del checkpoint no es servir como asistente general, sino formar parte de un grid experimental que estudia como la compresion por SVD degrada el comportamiento de seguridad de Llama-3-8B-Instruct y que regla de seleccion de componentes repara mejor esa degradacion. La calibracion combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (WildJailbreak), lo que da nombre a la variante (`svdllmwjsep192`).

Es relevante para investigadores en interpretabilidad, compresion de modelos y alineacion que necesiten medir el trade-off entre utilidad y seguridad bajo reduccion de parametros. No es un modelo pensado para despliegue en produccion como chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3-8B-Instruct soporta 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Llama-3-8B-Instruct y aplica compresion SVD-LLM con un presupuesto del 60,0 % de parametros densos (40,00 % eliminados, fraccion resultante 0,5998). La estimacion SVD se realiza sobre un conjunto de calibracion agrupado: por un lado WikiText-2 train (255 ventanas de 2048 tokens, sampler de SVD-LLM, semilla 42, todas las posiciones) y por otro las primeras 192 de 512 prompts de WildJailbreak train (vanilla y adversariales) con las respuestas de rechazo del propio Llama-3-8B-Instruct (25.994 posiciones). La matriz de covarianza combinada es S·S^T = suma sobre WikiText de x·x^T + suma sobre seguridad de x·x^T, con una cuota efectiva de seguridad del 4,74 % de las posiciones.

Tras la compresion se aplica la recuperacion de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16. La semilla global es 42. El estimador SVD es el SVD blanqueado de los autores de SVD-LLM (repositorio AIoT-MLSys-Lab/SVD-LLM).

## Capacidades

- Generacion de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresion.
- Razonamiento y respuesta a instrucciones en el rango esperado para un modelo de 8B comprimido al 60 %.
- Comportamiento de rechazo ante peticiones daninas, medido y cuantificado en la model card (no garantizado).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre compresion de modelos: utilizar el checkpoint como celda de un grid para medir como la eliminacion del 40 % de parametros afecta a la perplejidad y a la precision zero-shot.
- Estudio de seguridad bajo compresion: comparar la tasa de exito de ataque (ASR) frente al modelo base sin comprimir para cuantificar la degradacion introducida por SVD.
- Evaluacion de reglas de seleccion de componentes: contrastar esta variante (calibracion utility + safety) con otras celdas del grid para identificar que criterio preserva mejor el comportamiento de rechazo.
- Benchmarking de pipelines de compresion: integrar el checkpoint en scripts de evaluacion tipo lm-evaluation-harness para reproducir las metricas reportadas (perplejidad WikiText-2, media zero-shot en 7 tareas).
- Analisis de sobre-rechazo: emplear la metrica Macro over-refusal (WildGuard) para estudiar el equilibrio entre seguridad y utilidad conversacional.
- Docencia y divulgacion: ilustrar en cursos o articulos como la compresion SVD afecta a un modelo alineado, usando las metricas publicadas como referencia reproducible.
- Validacion de tecnicas de recuperacion LoRA: evaluar el impacto de la etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned) en la recuperacion de utilidad tras la compresion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0096 |
| StrongREJECT ASR (HarmBench judge) | 0,0256 |
| Macro over-refusal (WildGuard) | 0,3683 |
| Perplejidad WikiText-2 | 25,0146 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5005 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos (8,03B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 4-5 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas para bf16: A100 40 GB, H100, L40S, o consumer de gama alta con 24 GB (RTX 3090, RTX 4090) con margen ajustado.
- Cabe en GPU consumer de 24 GB en bf16 con contexto moderado; en 16 GB requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no disponibles en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep192_r40 | 8,03B (60 % denso) | no disponible | Llama 3 | Checkpoint comprimido de investigacion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8192 | Llama 3 | Modelo base sin comprimir, asistente general |
| Otras celdas del grid SVD-LLM de Jeesup | ~8B comprimidos | no disponible | Llama 3 | Variantes con distintas reglas de seleccion y presupuestos |

No se dispone de datos comparativos de rendimiento frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas del grid estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresion por si sola eleva la tasa de exito de ataque.
- No es un asistente desplegable: es un sujeto experimental y debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinacion y degradacion de calidad por la perdida del 40 % de parametros y la recuperacion LoRA limitada (2 epocas, alpaca-cleaned).
- La cuota efectiva del conjunto de seguridad en la calibracion es muy baja (4,74 % de posiciones), lo que puede limitar la preservacion del comportamiento de rechazo.
- Idiomas soportados no documentados; el comportamiento multilingue puede diferir del modelo base.
- Uso comercial restringido por la Llama 3 Community License, que incluye `LICENSE` y `USE_POLICY.md` en el repositorio; el uso de este derivado esta sujeto a dichos terminos.
- No hay garantias de soporte de tool calling, agentes o contexto largo especificas para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep192_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM (estimador): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado otros enlaces relevantes en la busqueda web proporcionada.
