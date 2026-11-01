# SargeDev/Solar-Decision-JEV-27B-V2

## Resumen

Solar-Decision-JEV-27B-V2 es un modelo de decisión de 27B desarrollado por SargeDev, publicado en HuggingFace el 26 de octubre de 2026. Se trata de un merge de dos líneas de entrenamiento sobre la misma base: el backbone abliterado (sin filtros de seguridad) Huihui-Qwen3.8-27B de huihui-ai, al que se le aplican por aritmética directa de deltas LoRA el LoRA `r32` de `lm_head` de AutoTrust (especializado en lectura de decisiones) y un LoRA `solar` r16 reentrenado hasta el paso 1894 de la línea "solar" de SargeDev, orientada a conversación cotidiana con decisiones tipadas.

El problema que resuelve es la emisión de decisiones estructuradas con probabilidades calibradas: el modelo lee una pregunta o estado y devuelve una decisión tipada (choice, score, noul) en un solo prefill con `max_tokens=1`, restringido a los tokens de opción y leído como log-probabilidades, sin cabeza separada. Es relevante como instrumento de decisión autoalojado y con licencia Apache-2.0, aunque el propio autor reconoce que para decisiones puras rinde por debajo de la línea r32 aislada.

La arquitectura subyacente es Qwen3.8 (transformer de 27B, con tensores nextn/MTP conservados para decodificación especulativa), con 26.895.998.464 parámetros y un contexto servido de 8192 tokens en la configuración de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8 con nextn/MTP (decodificación especulativa) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (en la configuración de servicio documentada) |
| Tipos de cuantizacion | FP16/BF16 (safetensors, 55,5 GB); GGUF (IQ4_XS a Q8_0); NVFP4 W4A4 + FP8 down_proj |
| Idiomas soportados | no disponible (el corpus de chat se describe como inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; variantes GGUF y NVFP4-FP8 (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Huihui-Qwen3.8-27B-abliterated, una versión sin filtros de alineación del Qwen3.8-27B de Qwen. Sobre esa base se aplican dos LoRA fusionados por aritmética directa de deltas: el LoRA `r32` de AutoTrust, que actúa sobre `lm_head` y entrena la distribución de decisión directamente en la cabeza de salida (cabeza de decisión de 24 slots), y el LoRA `solar` r16 de SargeDev, sin LoRA de `lm_head`, entrenado sobre el corpus `solar-decisions-corpus-v4` (816.741 objetivos de distribución calibrada etiquetados por upstage/solar-decide-flash, que suponen un reetiquetado completo del corpus v3 más 120.000 filas nuevas). La V2 difiere de la V1 únicamente en el checkpoint del LoRA solar: paso 1894 frente a 1219, aproximadamente un 55 % más avanzado en el schedule coseno y con una segunda época completa de datos.

La lectura de decisión está entrenada dentro del modelo: una decisión tipada es un único prefill con `max_tokens=1`, restringido a los tokens de opción y recuperado como log-probabilidades. Esta vía requiere vLLM; llama.cpp no expone los logprobs por token necesarios. El entrenamiento se realizó en 2× NVIDIA GB10 (DGX Spark).

## Capacidades

- Decisiones tipadas con probabilidades calibradas: choice (elección entre opciones), score (puntuación) y noul (AUROC 0,9831 en el gate de 27.695 filas).
- Lectura de decisión en un solo prefill con `max_tokens=1`, sin cabeza separada, vía logprobs en vLLM.
- Conversación cotidiana en inglés (línea solar): respuestas directas con confianza declarada, sin exceso de matices ("no hedge-fest").
- Modo thinking del template Qwen3.8, desactivable con `enable_thinking: false` en `chat_template_kwargs`.
- Decodificación especulativa en la variante GGUF (tensores nextn/MTP drafter conservados), aunque esa variante no sirve como instrumento de decisión tipada.
- Backbone abliterado: sin filtros de seguridad del modelo base.
- Tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de decisiones de baja latencia: dada una pregunta o estado, el modelo devuelve choice/score/noul en un solo prefill de 1 token, adecuado para pipelines que requieren miles de decisiones por minuto sin generar texto.
- Enrutado de consultas en sistemas multiagente: puede actuar como componente decisor que selecciona entre 24 slots de opción tipados, integrándose en orquestadores que llaman a vLLM con logprobs.
- Scoring con confianza declarada: la salida como log-probabilidades permite umbralizar decisiones según el riesgo (por ejemplo, escalar a humano si la confianza cae por debajo de un umbral).
- Chatbot conversacional con decisiones integradas: la línea solar aporta conversación cotidiana en inglés con respuestas directas, útil en asistentes que combinan diálogo y veredictos.
- Detección de "no útil / fuera de dominio" (noul): con AUROC 0,9831, es adecuado como filtro de rechazo previo a respuestas de otro modelo.
- Instrumento de decisión autoalojado y sin censura: Apache-2.0 y backbone abliterado permiten desplegarlo en entornos con requisitos de privacidad o con contenidos que los modelos alineados rechazarían.
- Investigación en calibración y merges LoRA: el model card publica ECE y AUROC por componente, lo que lo hace útil como banco de pruebas reproducible.

## Benchmarks y rendimiento

Resultados del gate del autor (27.695 filas, mismo harness, cabeza y calibración para todas las cifras):

| Modelo | choice top-1 | score top-1 | noul AUROC | overall top-1 |
|---|---|---|---|---|
| AutoTrust (referencia publicada) | 0,9041 | 0,8910 | 0,9961 | — |
| r32 + lm_head alone | 0,8693 | 0,8135 | 0,9919 | 0,886 |
| **Este repo (r32 + solar-1894)** | 0,8278 | 0,7424 | 0,9831 | 0,839 |
| V1 (r32 + solar-1219) | 0,8162 | 0,7192 | 0,9810 | 0,817 |
| solar r16 alone (1219, cabeza separada) | 0,5054 | 0,5369 | 0,9449 | — |

Calibración: choice ECE = 0,145 (r32-alone ronda 0,03); noul ECE = 0,007. Las confianzas tipadas en choice son menos fiables que las de r32-alone. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Pesos en BF16: 55,5 GB, lo que requiere al menos una GPU con 80 GB de VRAM (A100/H100) o reparto en varias GPU de consumo.
- Con la cuantización NVFP4-FP8 (W4A4 en attn y gate/up, FP8 en down_proj), el footprint se reduce sustancialmente; VRAM exacta no disponible.
- La escalera GGUF (IQ4_XS a Q8_0) permite ejecutar cuantizaciones de ~4 bits en GPUs de consumo de gama alta (del orden de 16-24 GB de VRAM para IQ4_XS/Q4, estimación según tamaño de repo; no disponible una cifra oficial).
- Despliegue recomendado: vLLM (obligatorio para la vía de decisión tipada, con `--trust-remote-code --max-model-len 8192`). La variante GGUF funciona con llama.cpp y Ollama para chat cotidiano, pero no para decisiones tipadas. La variante NVFP4-FP8 se sirve en vLLM con `--quantization compressed-tensors`.
- Entrenamiento original realizado en 2× NVIDIA GB10 (DGX Spark).
- Latencia y throughput: no disponibles; la decisión tipada requiere un único prefill con 1 token de salida, lo que sugiere latencia baja por decisión.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Fortaleza en decisión (overall top-1) | Licencia |
|---|---|---|---|---|
| Solar-Decision-JEV-27B-V2 (este) | ~26,9B | Merge r32 + solar-1894 | 0,839 | Apache-2.0 |
| SargeDev/Solar-JEV-27B-R32 (r32 alone) | ~26,9B | Solo LoRA r32 de decisión | 0,886 | Apache-2.0 |
| autotrust/JEV-27B (referencia publicada) | ~27B | Receta original de decisión | choice 0,9041 / score 0,8910 | no disponible |
| Solar-Decision-JEV-27B V1 | ~26,9B | Merge r32 + solar-1219 | 0,817 | Apache-2.0 |

Frente a sus alternativas de la misma familia, la V2 es el mejor merge de ambas líneas y mejora a la V1 en todas las celdas, pero sigue por debajo de r32-alone como instrumento de decisión puro; su ventaja es el comportamiento conversacional de la línea solar.

## Limitaciones y advertencias

- Rendimiento de decisión inferior a r32-alone: al no llevar LoRA de `lm_head`, el delta solar diluye el readout especializado de r32; más entrenamiento reduce la penalización pero no la elimina.
- Calibración de choice degradada: ECE de 0,145 frente a ~0,03 de r32-alone; las confianzas tipadas en choice son menos fiables y no deberían usarse para umbralizado fino de riesgo.
- La vía de decisión tipada solo funciona en vLLM: llama.cpp no expone los logprobs por token necesarios, y la variante GGUF no es válida como instrumento de decisión.
- Backbone abliterado (uncensored): el modelo carece de los filtros de seguridad del Qwen3.8 original, lo que exige controles adicionales en producción.
- Idioma: la conversación se describe en inglés; soporte multilingüe no disponible en la información proporcionada.
- Contexto de 8192 tokens en la configuración de servicio documentada, limitado para documentos largos.
- Riesgo de alucinación en generación libre: no disponible; los benchmarks publicados cubren solo decisiones tipadas.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2
- Base abliterada: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Receta de decisión AutoTrust: https://huggingface.co/autotrust/JEV-27B
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Corpus de decisiones solar: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Etiquetador: https://huggingface.co/upstage/solar-decide-flash
- Cuantización GGUF: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2-GGUF
- Cuantización NVFP4-FP8: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B-V2-NVFP4-FP8
- Alternativa recomendada para decisión pura: https://huggingface.co/SargeDev/Solar-JEV-27B-R32
- Alternativa uncensored de la familia: https://huggingface.co/SargeDev/JEV-27B-Uncensored
