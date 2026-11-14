# Maxrio/Qwen3.8-27B-DSpine-b16-TF4bit-AgentMix

## Resumen

Qwen3.8-27B-DSpine-b16-TF4bit-AgentMix es un fine-tune experimental del modelo borrador (draft model) de decodificación especulativa `tencent/Qwen3.8-27B-DSpine-b16`, publicado por el usuario `Maxrio` (lasse_ai). No es un modelo de lenguaje autónomo de 27B: es un drafter de aproximadamente 2.026 millones de parámetros (2,03B) diseñado para acelerar la inferencia del modelo objetivo `TensorFold/Qwen3.8-27B-MLX-4bit`, la conversión MLX de 4 bits afín (group size 64, precisión efectiva declarada de 4,695 bits por peso) de Qwen3.8-27B.

El modelo conserva pesos BF16 e implementa decodificación especulativa con verificación contra el modelo objetivo cuantizado. La adaptación se centró en ampliar la mezcla de formatos de agente (`AgentMix`), incorporando 550 contextos de agente adicionales sobre 254 repositorios procedentes de SWE-smith, OpenHands y mini-SWE-plus, regenerados con el objetivo de 4 bits. El checkpoint publicado corresponde al paso 823 de una ejecución de 990 pasos.

Su relevancia es acotada y práctica: mejorar la tasa de aceptación del drafter en cargas de trabajo agénticas y de código, donde la decodificación especulativa rinde peor que en chat general. La ganancia medida en el conjunto de desarrollo es modesta en global (+0,0353 tokens por ronda) pero notable en la clase agente (+0,4007 tokens por ronda), aunque no se ha demostrado transferencia a conjuntos independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador (draft model) para decodificación especulativa, derivado de DSpine-b16; transformer con cabezas de predicción de draft |
| Parametros totales | 2.025.912.064 (2,03B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluación con tope de 8.192 tokens) |
| Tipos de cuantizacion | Pesos BF16 en el drafter; diseñado para operar contra objetivo MLX 4-bit afín (group size 64, 4,695 bits/peso efectivos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (identidades en `release-manifest.json`) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa construido sobre `tencent/Qwen3.8-27B-DSpine-b16` (revisión `ea909c0f5fab8865f9e14600334f55f7ce47308f`), con `config.json` sin modificar byte a byte respecto al original: nombres de tensores, formas y dtypes coinciden. El objetivo de entrenamiento corta la pérdida tras el primer fallo de draft (estilo Spec-AUF), con multiplicador de learning rate en primera posición de 1,0. La optimización se realizó en PyTorch/SpecForge; la generación de continuaciones y la grabación de features del objetivo se hicieron con TensorFold native CUDA sobre los pesos MLX de 4 bits.

La ejecución completó 990 pasos (exportado el 823), con learning rate pico de 1e-5, 30 pasos de warm-up, decaimiento coseno, batch size 9, 128 anchors y semilla 1. Las cuotas de datos fueron 3/2/2/2 para agente/chat/código/estructurado. El corpus ampliado añade 550 contextos de agente solo-entrenamiento sobre 254 repositorios (200 SWE-smith/SWE-agent, 150 OpenHands, 200 mini-SWE-plus); las continuaciones del asistente se regeneraron con el objetivo de 4 bits (76.779 tokens nuevos) y se grabó el índice de features fusionado con 6.848 entradas. No se aisló un efecto puramente de datos: también cambiaron la longitud de entrenamiento y las cuotas de muestreo respecto al piloto corto.

## Capacidades

- Predicción de tokens borrador para decodificación especulativa contra `TensorFold/Qwen3.8-27B-MLX-4bit`.
- Mejora específica de aceptación en trayectorias de agente (llamadas a herramientas, edición de código, razonamiento multi-paso).
- Soporte de formatos de agente heterogéneos: SWE-agent, OpenHands y mini-SWE-agent-plus.
- Cobertura de chat multi-turno, código y salidas estructuradas (JSON y similares), según las cuotas de entrenamiento.
- No es un modelo autónomo: no genera respuestas finales por sí mismo, solo proposiciones de draft que el objetivo verifica.
- No dispone de tool calling propio ni de modo thinking independiente; hereda los ajustes de pensamiento de los prompts tokenizados del objetivo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aceleración de asistentes de código en producción: el drafter propone tokens que el objetivo MLX 4-bit verifica, reduciendo el coste por token generado en tareas de autocompletado y refactorización, donde la clase código alcanza 3,9283 tokens por ronda.
- Pipelines de agentes SWE (OpenHands, SWE-agent): con 7,5359 tokens por ronda en la clase agente, es el escenario donde la ganancia frente al drafter original es mayor (+0,4007), adecuado para bucles de resolución de issues con múltiples llamadas a herramientas.
- Servicio de chat multi-turno: 3,1650 tokens por ronda en la clase chat, útil para despliegues conversacionales donde el coste de decodificación domina la latencia.
- Generación de salidas estructuradas: 4,5345 tokens por ronda en la clase structured, aplicable a extracción de datos y generación de JSON validado en pipelines de integración.
- Investigación en decodificación especulativa: sirve como punto de comparación reproducible (paso 823, semilla 1, cuotas documentadas) para estudiar el efecto del entrenamiento con mezcla agéntica sobre la tasa de aceptación.
- Evaluación de robustez de drafters en dominios de código: permite medir la transferencia a repositorios y tareas retenidos, aunque los resultados publicados no demuestran mejora en el conjunto independiente.

## Benchmarks y rendimiento

Las métricas publicadas son estimaciones offline de aceptación (tokens de árbol por ronda de draft), no velocidades de decodificación servidas ni exactitud de tarea. Intervalos de confianza bootstrap pareados al 95 % sobre grupos de repositorio/conversación; conjunto de desarrollo de 810 prompts y 750 grupos, con tope de 8.192 tokens.

| Clase (desarrollo) | Prompts | Tokens/ronda | Delta vs drafter original | IC 95 % pareado |
|---|---:|---:|---:|---|
| Global | 810 | 3,8803 | +0,0353 | [+0,0277, +0,0438] |
| Agente | 150 | 7,5359 | +0,4007 | [+0,2901, +0,5375] |
| Chat (incluye 20 largos) | 220 | 3,1650 | +0,0174 | [+0,0100, +0,0255] |
| Código (incluye 20 largos) | 220 | 3,9283 | +0,0347 | [+0,0184, +0,0512] |
| Estructurado (incluye 20 largos) | 220 | 4,5345 | +0,0459 | [+0,0301, +0,0679] |

Subconjunto solapado de 60 prompts de pensamiento largo: 3,5824 tokens por ronda. En el conjunto independiente de jschmied (110 prompts, 48 grupos de tarea), el drafter original obtuvo 6,0788 y este checkpoint 6,0042 (delta -0,0745; IC 95 % [-0,1758, +0,0197]): no se demuestra mejora en transferencia.

## Requisitos de hardware

- El drafter ocupa 4,1 GB en el repositorio (pesos BF16); requiere además el modelo objetivo de 27B en MLX 4-bit, cuyo peso completo no está cuantificado en esta ficha.
- VRAM estimada: no disponible de forma desagregada; el conjunto drafter + objetivo de 27B en 4 bits excede con holgura una GPU de consumo de 24 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento y la validación usaron TensorFold native CUDA, y no se ha cualificado un runtime Apple MLX para este drafter.
- Despliegue: no se han cualificado otros runtimes de inferencia ni otras cuantizaciones del objetivo distintas de `TensorFold/Qwen3.8-27B-MLX-4bit` (revisión `22d8d538154e0e5b6f8dcb1fcc74a60a0798104c`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput servidos: no medidos; las cifras publicadas son estimaciones offline de aceptación, no velocidades.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens/ronda (global) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Maxrio/Qwen3.8-27B-DSpine-b16-TF4bit-AgentMix | 2,03B | no disponible | 3,8803 | Apache 2.0 | Hugging Face (0 descargas) |
| tencent/Qwen3.8-27B-DSpine-b16 (original) | no disponible | no disponible | 3,8450 (implícito por delta) | no disponible | Hugging Face |
| TensorFold/Qwen3.8-27B-MLX-4bit (objetivo) | 27B (4-bit) | no disponible | no aplica (es el verificador) | no disponible | Hugging Face |

No se dispone de datos de otros drafters comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: sin el objetivo MLX 4-bit y un runtime compatible no produce respuestas utilizables.
- La selección del paso 823 se hizo sobre resultados de desarrollo y se documentó después de conocer las puntuaciones; no fue una selección ciega ni preregistrada.
- No se demuestra mejora en transferencia: en el conjunto independiente el delta es -0,0745 con intervalo que cruza cero.
- Las métricas son estimaciones offline de aceptación, no velocidades servidas ni exactitud de tarea; no deben citarse como ganancia de rendimiento en producción.
- Solo se ha cualificado el objetivo de 4 bits afín de TensorFold; otras cuantizaciones y runtimes no están validados.
- El conjunto independiente no es completamente ciego: se usó texto de test para cribado de contaminación, y mini-SWE ya forma parte del entrenamiento.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible; el drafter hereda las características del objetivo en la verificación.
- Uso comercial permitido por Apache 2.0, pero la idoneidad en producción no está respaldada por mediciones de latencia ni de exactitud.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; sin soporte ni mantenimiento declarados.

## Enlaces

- Hugging Face: https://huggingface.co/Maxrio/Qwen3.8-27B-DSpine-b16-TF4bit-AgentMix
- Modelo base (drafter original): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Objetivo MLX 4-bit: https://huggingface.co/TensorFold/Qwen3.8-27B-MLX-4bit
- Objetivo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper referenciado (arxiv:2609.36173): https://arxiv.org/abs/2609.36173
- Perfil del autor: https://huggingface.co/Maxrio
