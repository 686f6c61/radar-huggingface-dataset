# notSnix/Qwen3.8-27B-Puzzletron-11p4B

## Resumen

Qwen3.8-27B-Puzzletron-11p4B es un checkpoint experimental derivado de Qwen/Qwen3.8-27B, el modelo denso vision-language de 27B parámetros de Alibaba. Este checkpoint es el resultado de una poda estructural (structural pruning) aplicada con NVIDIA Model-Optimizer y su herramienta Puzzletron, que reduce el cuerpo del modelo de 27,4B a 11,4B parámetros mediante la eliminación selectiva de capas FFN (feed-forward) en cada bloque. El objetivo es explorar la compresión de modelos híbridos que combinan atención lineal Gated DeltaNet y atención completa (self-attention), manteniendo intactos los mecanismos de mezcla y la torre de visión.

El modelo está publicado bajo licencia Apache 2.0 y su formato de pesos es AnyModel subblock-safetensors, cargable con la librería transformers (versión >= 5.8) y el descriptor `qwen3_5` de Model-Optimizer. Es importante destacar que este checkpoint es una salida intermedia del proceso de poda: el autor indica explícitamente que **no ha sido destilado** contra el modelo original, por lo que su precisión actual refleja la "herida" de la poda y no es apto para uso práctico sin un paso posterior de destilación de conocimiento. Aun así, representa un caso de estudio relevante para la compresión de modelos VLM híbridos y la evaluación de estrategias de poda heterogénea por capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (linear attention) + self-attention completa, con FFN podados selectivamente por capa |
| Parametros totales | 11.647.529.200 (11,4B en el cuerpo LM, según la tabla del autor) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este checkpoint (el modelo base Qwen3.8-27B soporta 262K tokens) |
| Tipos de cuantizacion | No disponibles (solo se menciona BF16 en la evaluación) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | AnyModel subblock-safetensors (`subblocks_safetensors/` + `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un VLM denso con 64 bloques que alternan dos tipos de mezcladores: bloques con atención lineal Gated DeltaNet (48 cabezas, head_dim 128) y bloques con atención completa (4 KV heads). La poda aplicada por Puzzletron actúa únicamente sobre las capas FFN (feed-forward), eliminando por completo la proyección intermedia en muchos bloques (marcados como `no_op`) o reduciendo su ancho a 4352 en otros, elegido mediante programación lineal entera mixta (MIP) entre los valores {4352, 8704, 13056, 17408}. Los mezcladores (tanto `linear_attn` como `self_attn`) y la torre de visión se mantienen sin cambios. También se elimina la cabeza MTP (multi-token prediction).

El proceso de poda se realizó sobre el dataset `nvidia/Puzzle-KD-Nemotron-Post-Training-Dataset-v2`, con hardware de 2x RTX PRO 6000 Blackwell (96 GB) en paralelismo de pipeline. El autor evaluó seis tasas de compresión (24,4B, 21,8B, 19,2B, 16,6B, 14,0B y 11,4B); este checkpoint corresponde a la tasa 0.7. No se realizó ningún entrenamiento posterior a la poda; el checkpoint se publica tal cual, con la advertencia de que requiere destilación de conocimiento contra el teacher para recuperar precisión.

## Capacidades

- El checkpoint hereda teóricamente las capacidades del modelo base Qwen3.8-27B (entrada de imagen y texto, razonamiento, generación de código, tool calling, uso como agente), pero **no se ha verificado** que estas capacidades se mantengan tras la poda sin destilación.
- En su estado actual, la precisión de token es muy baja (top-1 0,330 frente a 0,688 del teacher), lo que indica una degradación severa en la generación de texto.
- Soporta entrada multimodal (imagen y texto) gracias a la torre de visión intacta, aunque la calidad de la comprensión visual no está evaluada.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso en este checkpoint específico.
- El modelo es cargable con transformers >= 5.8 y el descriptor `qwen3_5` de Model-Optimizer, lo que permite su uso en entornos de investigación.

## Casos de uso

- **Investigación en compresión de modelos**: este checkpoint sirve como punto de partida para estudiar el efecto de la poda estructural de FFN en arquitecturas híbridas, comparando la degradación de precisión frente al teacher.
- **Base para destilación de conocimiento**: el propio autor indica que el modelo requiere destilación; puede usarse como estudiante inicial en un pipeline de destilación contra Qwen3.8-27B, con el objetivo de recuperar rendimiento con menos parámetros.
- **Evaluación de estrategias de poda heterogénea**: al tener anchos FFN variables por capa, permite analizar qué capas son más sensibles a la eliminación y cómo afecta a la pérdida de lenguaje.
- **Benchmark de memoria y latencia**: con 11,4B parámetros, puede usarse para medir el ahorro de memoria y la velocidad de inferencia en comparación con el teacher (68,2 GiB vs 97,5 GiB en batch 96, según el autor).
- **Desarrollo de herramientas de compresión**: sirve como caso de prueba para validar el flujo de trabajo de Puzzletron (búsqueda estructural, poda, guardado en formato AnyModel).
- **Estudio de transferencia de capacidades multimodales**: al mantener la torre de visión intacta, permite investigar cómo la poda de FFN afecta a las tareas de imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este checkpoint. El autor proporciona únicamente métricas de evaluación de lenguaje en BF16 con 128 secuencias de 4096 tokens, antes de la destilación:

| Metrica | Teacher (Qwen3.8-27B) | Este modelo |
|---|---|---|
| Parámetros (cuerpo LM) | 27,4B | 11,4B |
| Memoria (batch 96, 4k+4k) | 97,5 GiB | 68,2 GiB |
| Pérdida de lenguaje (lm loss) | 2,265 | 4,416 |
| Precisión de token top-1 | 0,688 | 0,330 |
| Precisión de token top-5 | 0,877 | 0,531 |
| Precisión de token top-10 | 0,907 | 0,600 |

Estos datos muestran una caída significativa en la calidad de generación, esperable al no haberse realizado destilación posterior.

## Requisitos de hardware

- **Memoria estimada para inferencia**: 68,2 GiB en BF16 con batch 96 y secuencias de 4k+4k (según la tabla del autor). Para uso individual con batch 1, la memoria sería considerablemente menor, aunque no se proporciona un dato exacto.
- **GPU recomendadas**: el autor usó 2x RTX PRO 6000 Blackwell (96 GB) para el proceso de poda. Para inferencia, una GPU con al menos 24 GB de VRAM podría alojar el modelo en BF16 con batch pequeño, pero no está confirmado.
- **Compatibilidad con GPU consumer**: al tener 11,4B parámetros, es plausible que quepa en GPUs de 24 GB (p. ej., RTX 3090/4090) con cuantización, pero no se ofrecen cuantizaciones precalculadas ni datos de prueba.
- **Opciones de despliegue**: el formato AnyModel subblock-safetensors requiere el tooling de NVIDIA Model-Optimizer y transformers >= 5.8 con el descriptor `qwen3_5`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos podados comparables en la misma categoría (VLM híbrido con poda estructural). La comparación más directa es con el teacher Qwen3.8-27B:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.8-27B (teacher) | 27,4B | 262K (según base) | Apache 2.0 | Producción |
| Qwen3.8-27B-Puzzletron-11p4B | 11,4B | No disponible | Apache 2.0 | Experimental, sin destilar |

Otras alternativas de VLM densos de tamaño similar (p. ej., Llama 3.2 11B Vision, Phi-3.5-vision) no son directamente comparables por diferencias de arquitectura y propósito.

## Limitaciones y advertencias

- **No destilado**: el checkpoint refleja la degradación inmediata tras la poda; su precisión de token es muy baja (top-1 0,33) y no es apto para tareas reales sin un proceso de destilación posterior.
- **Poda limitada a FFN**: solo se eliminaron capas feed-forward; los mezcladores de atención (lineal y completa) permanecen intactos, lo que puede limitar el ahorro computacional en comparación con podas más agresivas.
- **Requisitos de software específicos**: necesita transformers >= 5.8 y el descriptor `qwen3_5` de Model-Optimizer; no es compatible con stacks estándar como vLLM u Ollama sin adaptaciones.
- **Sesgos y alucinaciones**: al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, pero no hay evaluación específica sobre este checkpoint.
- **Licencia**: Apache 2.0 permite uso comercial, pero el estado experimental y la falta de destilación hacen desaconsejable su uso en producción.
- **Sin garantías de rendimiento multimodal**: aunque la torre de visión se mantiene, no se han publicado evaluaciones de tareas de imagen-texto; el rendimiento real es desconocido.

## Enlaces

- [HuggingFace: notSnix/Qwen3.8-27B-Puzzletron-11p4B](https://huggingface.co/notSnix/Qwen3.8-27B-Puzzletron-11p4B)
- Repositorio de datos complementario: `notSnix/Qwen3.8-27B-Puzzletron-data` (mencionado en la model card)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Blog de AMD sobre Qwen3.8-27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Guía de Qwen3.8-27B en lovableapp.org](https://lovableapp.org/blog/qwen3-8-27b)
- [Cómo ejecutar Qwen3.8-27B localmente (lu-labs.ai)](https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally)
