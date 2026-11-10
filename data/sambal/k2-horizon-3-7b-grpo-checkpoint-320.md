# sambal/k2-horizon-3.7b-grpo-checkpoint-320

## Resumen

K2-Horizon-3.7B GRPO checkpoint 320 es un modelo de lenguaje de tipo causal, especializado en interpretación de registros de pozo (well logs) en el dominio de la petrofísica. Lo publica el usuario sambal en Hugging Face y deriva de una cadena de ajustes sobre el modelo base IFM/K2-Horizon-3.7B: primero un ajuste con DPO de longitud normalizada más RPO (checkpoint 400 de sambal) y, sobre ese, un entrenamiento con GRPO cuyo resultado es esta instantánea del paso global 320. El modelo se distribuye con pesos completos en BF16, código de modelado propio (`K2HorizonForCausalLM`) y licencia Apache 2.0.

Aunque la etiqueta comercial lo denomine "3.7B", los pesos safetensors del repositorio suman 5.058.255.360 parámetros, dato que conviene tener en cuenta para planificar el despliegue. El repositorio ocupa 10,1 GB repartidos en cinco shards de safetensors, e incluye configuración, tokenizer, plantilla de chat y el código necesario para cargarlo con `trust_remote_code=True`.

Su relevancia es acotada pero clara: es un ejemplo de pipeline de alineamiento por etapas (DPO/RPO y después GRPO con recompensa basada en un juez LLM) aplicado a un dominio técnico muy concreto, con una evaluación propia de 1.075 preguntas sobre interpretación de registros. No es un modelo de propósito general ni compite en benchmarks estándar de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2HorizonForCausalLM (transformer causal, código de modelado personalizado) |
| Parametros totales | 5.058.255.360 (según safetensors); la nomenclatura del autor indica "3.7B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, pesos completos en 5 shards; no es un adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con implementación propia (`K2HorizonForCausalLM`), cargado mediante `trust_remote_code=True`. Los pesos se publican en BF16, convertidos desde el checkpoint fusionado con pesos maestros en FP32. No se detalla en la información disponible el número de capas, dimensiones ocultas, mecanismo de atención ni la longitud de contexto nativa.

El entrenamiento parte del checkpoint 400 de DPO con normalización de longitud más RPO (`sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400`), que a su vez deriva del modelo base IFM/K2-Horizon-3.7B. Sobre esa base se aplica GRPO con pesos maestros en FP32, 16 prompts y 8 rollouts por paso, temperatura 1.0, top-p 1.0 y un máximo de 10.240 tokens por respuesta. La tasa de aprendizaje es 2,4e-6 y la recompensa proviene de un juez LLM que puntúa cada rollout contra una respuesta de referencia. El conjunto de datos son 2.815 prompts de interpretación de registros de pozo (preguntas de formación única, multi-pozo y entre formaciones), con un plan de 2 épocas y 350 pasos; esta instantánea corresponde al paso 320 y fue seleccionada mediante evaluación en un conjunto reservado.

## Capacidades

- Generación de texto conversacional orientada a preguntas técnicas de petrofísica e interpretación de registros de pozo.
- Razonamiento sobre curvas de registro en escenarios de formación única, multi-pozo y comparación entre formaciones.
- Respuesta a preguntas con formato de chat (el repositorio incluye plantilla de chat).
- Ajuste específico para calidad de respuesta evaluada por un juez LLM (relevancia, fiabilidad, estilo y calidad de razonamiento).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de interpretación de registros para geólogos e ingenieros de petróleo: el modelo responde preguntas sobre curvas de pozo y formaciones concretas, apoyándose en el ajuste con 2.815 prompts del dominio y en la evaluación específica sobre 1.075 preguntas.
- Comparación entre formaciones: permite plantear preguntas cruzadas entre formaciones y obtener respuestas con razonamiento estructurado, uno de los tres tipos de pregunta con los que se evaluó (peso W de 63,7 en cross-formation).
- Análisis multi-pozo: adecuado para consultas que requieren correlacionar información de varios pozos, el tipo de pregunta con mejor puntuación en la evaluación (W de 66,0 en multi-well).
- Formación interna de equipos técnicos: puede usarse como tutor conversacional que explica interpretaciones de referencia en un entorno controlado, dado su ajuste conversacional y su plantilla de chat.
- Prototipado de asistentes verticales: sirve como base para experimentar con pipelines de alineamiento (DPO/RPO y GRPO) en dominios técnicos, ya que se publican los checkpoints intermedios de la cadena.
- Segunda opinión asistida en revisión de informes: el modelo puede generar borradores de interpretación que un experto valida después, aprovechando su entrenamiento con recompensa basada en un juez LLM.
- Investigación sobre RLHF/GRPO: útil para estudiar el efecto de GRPO con recompensa de juez LLM en dominios especializados, comparando los checkpoints de la linaje publicada.

## Benchmarks y rendimiento

Los únicos datos publicados son del benchmark propio de interpretación de registros de pozo (1.075 preguntas: 347 de formación única, 424 multi-pozo y 304 entre formaciones), puntuado por un juez LLM contra respuestas de referencia expertas sobre 100, con la fórmula W = 0,4·RA + 0,2·Trust + 0,2·Style + 0,2·RQ.

| Modelo | RA | Trust | Style | RQ | W |
|---|---|---|---|---|---|
| K2-Horizon-3.7B (base) | 49,1 | 58,8 | 52,4 | 61,1 | 54,1 |
| + DPO (checkpoint 400) | 52,4 | 59,8 | 62,9 | 67,1 | 58,9 |
| + GRPO (este modelo, checkpoint 320) | 63,8 | 65,0 | 55,6 | 71,3 | 63,9 |

Desglose por tipo de pregunta para este checkpoint (W): formación única 61,6; multi-pozo 66,0; entre formaciones 63,7. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 10-11 GB solo para pesos (5.058 millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; el repositorio completo ocupa 10,1 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues con contexto largo y concurrencia; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para BF16 en una sola GPU.
- Cabe en GPU consumer de 24 GB en BF16; en tarjetas de 16 GB requeriría cuantización, que no está publicada en el repositorio y habría que generar localmente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; al usar código de modelado personalizado, la compatibilidad con vLLM, TGI, llama.cpp u Ollama no está garantizada y no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones completas (contexto, idiomas) de este modelo, por lo que la comparación con alternativas de la misma categoría no puede hacerse con rigor numérico.

| Modelo | Parámetros | Contexto | Licencia | Evaluación |
|---|---|---|---|---|
| K2-Horizon-3.7B GRPO checkpoint 320 | 5.058 M (según safetensors) | no disponible | Apache 2.0 | Benchmark propio de well logs: W = 63,9 |
| K2-Horizon-3.7B (base) | no disponible | no disponible | no disponible | Benchmark propio de well logs: W = 54,1 |
| K2-Horizon-3.7B + DPO checkpoint 400 | no disponible | no disponible | Apache 2.0 | Benchmark propio de well logs: W = 58,9 |
| Modelos generalistas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: el ajuste GRPO se hizo sobre 2.815 prompts de petrofísica; el rendimiento fuera de ese dominio no está evaluado y probablemente sea inferior al de un modelo generalista.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y complica la integración con servidores de inferencia estándar.
- Discrepancia de tamaño: la etiqueta indica 3.7B pero los safetensors suman 5.058 millones de parámetros; hay que dimensionar el hardware con el dato real.
- Riesgo de alucinación: el modelo se evalúa con un juez LLM contra respuestas de referencia, no con verificación factual; en un dominio técnico como la petrofísica, las respuestas erróneas pueden tener consecuencias operativas.
- Idiomas y contexto no declarados: no hay información sobre cobertura multilingüe ni longitud de ventana, lo que limita la planificación de despliegues.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas en el repositorio; habría que generarlas y validarlas localmente.
- Sesgos: no se documentan sesgos conocidos ni composición demográfica del dataset; el corpus son preguntas técnicas de un dominio concreto.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de IFM/K2-Horizon-3.7B conviene verificar que la cadena de licencias de los modelos base sea compatible.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sambal/k2-horizon-3.7b-grpo-checkpoint-320
- Modelo base del ajuste DPO/RPO: https://huggingface.co/sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400
- Modelo original: https://huggingface.co/IFM/K2-Horizon-3.7B
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
