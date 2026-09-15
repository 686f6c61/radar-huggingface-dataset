# Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r07

## Resumen

Este checkpoint es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido con SVD-LLM hasta el 50,01 % de los parámetros densos y posteriormente editado mediante un proceso iterativo de intercambio de componentes. Lo desarrolla Jeesup con el objetivo de estudiar cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo de lenguaje alineado y qué regla de selección de componentes repara mejor ese daño.

El modelo no está pensado como asistente de propósito general: es una celda de una cuadrícula experimental que cubre distintas reglas de selección y presupuestos de restauración. Se ha aplicado la regla `disc_iter` durante 7 de 10 rondas, con un presupuesto del 1,0 % de los parámetros densos. La arquitectura es un transformer decoder-only (Llama-2-7b-chat) con 6.738.415.616 parámetros totales, y los pesos se distribuyen en formato safetensors.

Su relevancia radica en que permite cuantificar el trade-off entre compresión y seguridad, aportando métricas como AdvBench ASR, StrongREJECT ASR y over-refusal. No se especifican la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (compresión por SVD, no cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (llama2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only de 7.000 millones de parámetros con atención causal. La compresión se realiza mediante SVD-LLM, eliminando el 50,01 % de los parámetros densos. Posteriormente, se aplica una edición iterativa con la regla de selección `disc_iter`, que restaura e intercambia componentes en cada ronda. En este checkpoint se han aplicado 7 de las 10 rondas previstas, con un presupuesto total del 1,0 % de los parámetros densos (0,1 % por ronda). Se restauraron 4.318 componentes y se intercambiaron otros 4.318, con un total de 45.312.512 parámetros intercambiados (0,70 % de los parámetros de proyección densa). La escala de inserción es 0,1 y el valor de intercambio es `insert` (evicción ordenada por sigma). No se menciona entrenamiento adicional con RLHF o DPO; el proceso es únicamente de compresión y edición.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de manera explícita.
- Capacidades multilingües no especificadas.
- No se documentan capacidades de visión o audio.
- Es un artefacto de investigación para evaluar seguridad y utilidad bajo compresión.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: este checkpoint permite medir cómo la compresión SVD incrementa la tasa de éxito de ataques (AdvBench ASR 0,4808) y comparar estrategias de reparación.
- Estudio de interpretabilidad de componentes: al intercambiar componentes concretos, se puede analizar qué partes del modelo contribuyen al comportamiento seguro o inseguro.
- Evaluación de técnicas de reparación post-compresión: sirve como caso de prueba para validar la regla `disc_iter` frente a otras reglas de selección dentro de la cuadrícula experimental.
- Benchmarking de alineación bajo compresión: las métricas StrongREJECT ASR (0,2716) y macro over-refusal (0,1502) permiten cuantificar el deterioro de la alineación.
- Desarrollo de métodos de compresión robustos: proporciona un punto de referencia para investigar cómo preservar la seguridad en modelos comprimidos.
- Análisis del trade-off utilidad/seguridad: al ser un checkpoint intermedio, permite observar la evolución del comportamiento de seguridad a lo largo de las rondas de edición.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles en la model card son los siguientes:

| Métrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,4808 |
| StrongREJECT ASR (HarmBench judge) | 0,2716 |
| Macro over-refusal (WildGuard) | 0,1502 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP16, los pesos ocupan aproximadamente 13,5 GB (según el tamaño del repositorio), por lo que se recomienda una GPU con al menos 16 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: no especificadas en la información. Por tamaño, una RTX 4090 (24 GB) o una A100 40GB serían adecuadas para FP16.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB o más, aunque no hay cuantizaciones oficiales publicadas.
- Opciones de despliegue: compatible con la librería `transformers` (según la model card) y con `text-generation-inference` según los tags del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para modelos comparables en la información proporcionada. El modelo base es `meta-llama/Llama-2-7b-chat-hf`, pero no se incluyen métricas de referencia para comparar. Tampoco se ofrecen otros checkpoints de la cuadrícula experimental en esta ficha.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general ni apto para despliegue en producción.
- La compresión degrada deliberadamente la seguridad: la tasa de éxito de ataques es alta (AdvBench ASR 0,4808), lo que indica vulnerabilidad a jailbreaks.
- Riesgo de alucinación inherente a Llama-2-7b-chat.
- No se especifican los idiomas soportados, lo que limita su uso multilingüe.
- La licencia Llama 2 Community License impone restricciones de uso comercial según la política de uso aceptable de Llama 2.
- Es un checkpoint intermedio (7 de 10 rondas), por lo que no representa el resultado final del proceso de edición.
- No se documentan cuantizaciones ni soporte para herramientas como vLLM, llama.cpp u Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r07

No se han encontrado otros enlaces relevantes en la búsqueda web.
