# Jeesup/svd-safety-l3_svdllmwjsep512_r50

## Resumen

`svd-safety-l3_svdllmwjsep512_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar aproximadamente el 50% de los parámetros densos originales (fracción resultante 0,4997). Lo publica el usuario de Hugging Face Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un modelo conversacional de propósito general ni un asistente desplegable.

El modelo forma parte de una rejilla experimental que cruza distintas reglas de selección de componentes y distintos presupuestos de compresión. Esta celda concreta emplea un conjunto de calibración mixto (utilidad + seguridad) y recupera calidad con una etapa LoRA secuencial sobre U y V. Su interés es metodológico: permite medir el intercambio entre utilidad (perplejidad en WikiText-2, precisión zero-shot) y seguridad (tasas de éxito de ataque en AdvBench y StrongREJECT, sobrerrechazo en WildGuard) bajo compresión agresiva.

Arquitectónicamente sigue siendo un transformer decoder-only de la familia Llama 3, con 8.030.261.248 parámetros tras la compresión y pesos en formato safetensors. La licencia es la Meta Llama 3 Community License, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parámetros totales | 8.030.261.248 (fracción 0,4997 respecto al denso original) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3 soporta 8.192 tokens; no se confirma para este checkpoint) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; compatible con cuantización posterior vía herramientas estándar, no verificada) |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Meta-Llama-3-8B-Instruct y aplica SVD-LLM, un método de compresión post-entrenamiento basado en descomposición en valores singulares sobre las matrices de pesos. La selección de componentes utiliza una SVD blanqueada (implementación de AIoT-MLSys-Lab/SVD-LLM) calculada sobre un conjunto de calibración agrupado: `wikitext2:256 + wj_harm_resp_sep:512`. La parte de utilidad emplea WikiText-2 de entrenamiento con 255 ventanas de 2.048 tokens (muestreo SVD-LLM, semilla 42) evaluando todas las posiciones. La parte de seguridad usa las primeras 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales dañinas) emparejadas con los rechazos generados por el propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada, con 73.800 posiciones evaluadas. La proporción efectiva de posiciones dedicadas a seguridad es 0,1238.

Tras eliminar el 50,00% de los parámetros, se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global del experimento es 42. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuesta conversacional heredadas del modelo base, sujetas a la degradación introducida por la compresión.
- Razonamiento y conocimiento general, medidos indirectamente mediante la precisión zero-shot media en 7 tareas (0,4524).
- Comportamiento de rechazo ante peticiones dañinas, evaluado con AdvBench (ASR 0,0096) y StrongREJECT (ASR 0,0415) bajo el juez HarmBench.
- Capacidad de calibración de seguridad medida con WildGuard (sobrerrechazo macro de 0,4744).
- Soporte de tool calling y function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda de referencia en estudios que midan la degradación de utilidad y seguridad al reducir parámetros con SVD, comparando contra otras celdas de la misma rejilla.
- Evaluación de alineación bajo compresión: usar las métricas publicadas (AdvBench, StrongREJECT, WildGuard) como línea base para reproducir o contrastar metodologías de evaluación de seguridad.
- Estudio de reglas de selección de componentes: analizar cómo una calibración mixta de utilidad y seguridad (proporción efectiva 0,1238 de posiciones) afecta al equilibrio entre perplejidad y tasa de rechazo.
- Benchmarking de pipelines de compresión: integrar el checkpoint en comparativas de técnicas post-entrenamiento (SVD-LLM frente a poda o cuantización) midiendo perplejidad en WikiText-2 y precisión zero-shot.
- Docencia y divulgación técnica: ilustrar de forma reproducible el intercambio entre tamaño, utilidad y seguridad en modelos Llama 3, con métricas concretas y semilla fija.
- Auditoría de artefactos derivados: emplear el modelo como sujeto de pruebas en herramientas de red-teaming y clasificadores de seguridad antes de autorizar cualquier uso derivado.
- Reproducción de experimentos: validar la reproducibilidad del pipeline SVD-LLM con los parámetros documentados (semilla 42, LoRA r=8, alpha=16, 2 épocas).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0096 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Sobrerrechazo macro (WildGuard) | 0,4744 |
| Perplejidad en WikiText-2 | 58,6730 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4524 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni frente al Llama-3-8B-Instruct sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB o RTX 3090 24 GB deberían alojar los pesos con margen limitado para contexto corto.
- Cabe en GPU consumer de 24 GB en bf16 con contexto reducido; en 16 GB o menos requiere cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep512_r50 | 8.030 M (50% del denso) | No disponible | Llama 3 Community | Checkpoint de investigación comprimido |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 M | 8.192 tokens | Llama 3 Community | Modelo conversacional alineado |
| Otras celdas de la rejilla SVD-LLM del autor | Variable según presupuesto | No disponible | Llama 3 Community | Artefactos experimentales |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada que permitan una comparación cuantitativa directa; las métricas del checkpoint solo son interpretables frente a su modelo base sin comprimir, cuyos valores no se incluyen.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como sujeto experimental, no como asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques; varias celdas de la rejilla están deliberadamente degradadas en seguridad y esta debe evaluarse de forma independiente antes de extraer conclusiones.
- Riesgo de alucinación incrementado por la pérdida de capacidad asociada a la compresión (perplejidad en WikiText-2 de 58,6730).
- Sobrerrechazo elevado (0,4744 macro en WildGuard), lo que puede degradar la experiencia conversacional en usos benignos.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Longitud de contexto no confirmada para este checkpoint.
- Uso comercial sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio; se deben respetar las restricciones de la licencia y la política de uso aceptable de Meta.
- Sin descargas ni valoraciones en el momento de la consulta; ausencia de validación comunitaria.
- No se documentan capacidades de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep512_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM referenciada: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Meta Llama 3: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
