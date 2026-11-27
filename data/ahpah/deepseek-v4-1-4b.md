# ahpah/DeepSeek-V4.1-4B

## Resumen

DeepSeek-V4.1-4B es un ajuste fino (fine-tune) orientado a programación competitiva y razonamiento, desarrollado por el usuario ahpah y publicado en Hugging Face. No se trata de un modelo de DeepSeek: el nombre es engañoso, ya que el modelo parte de `saidutta69/Qwen3.5-4B-heretic`, una variante "abliterated" (sin censura) de `Qwen/Qwen3.5-4B`, y se entrena sobre el dataset de destilación `Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill`. El resultado es un modelo de 4 mil millones de parámetros que emite trazas de razonamiento estructuradas en etiquetas `` seguidas del código de implementación.

La relevancia del modelo es acotada: se trata de un experimento comunitario de bajo coste, entrenado en una única GPU de consumo (RTX 5070 de 12 GB) durante un solo epoch. Su interés principal reside en el pipeline de destilación de razonamiento para tareas algorítmicas y en la posibilidad de ejecutarlo en hardware modesto, no en una mejora demostrada del estado del arte. La model card no reporta benchmarks, idiomas soportados ni detalles sobre la composición completa del dataset base.

El modelo se distribuye con licencia Apache 2.0 y está etiquetado como `image-text-to-text`, lo que sugiere que hereda la torre multimodal de Qwen3.5, aunque la model card solo documenta uso textual. Existe además una versión cuantizada en GGUF Q6_K publicada por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B; el autor etiqueta `qwen3_5`; incluye módulos `in_proj_qkv`, `in_proj_z`, `out_proj` en el ajuste LoRA) |
| Parámetros totales | 4 mil millones (aproximado, según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima usada en el entrenamiento; no se documenta la ventana nativa del modelo base) |
| Tipos de cuantización | BF16 (pesos publicados), GGUF Q6_K (release separada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q6_K en `ahpah/DeepSeek-V4.1-4B-GGUF` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `saidutta69/Qwen3.5-4B-heretic`, que a su vez deriva de `Qwen/Qwen3.5-4B`. El entrenamiento se realizó con QLoRA en 4 bits NF4 (`r=16`, `lora_alpha=16`, `lora_dropout=0`, cómputo en BF16 y pérdida solo sobre la completación), con los adaptadores fusionados posteriormente en pesos BF16. Los módulos objetivo del LoRA abarcan las proyecciones de atención y MLP estándar (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) además de módulos específicos de la arquitectura base (`in_proj_qkv`, `in_proj_z`, `out_proj`), lo que apunta a componentes de atención lineal o híbrida en el modelo original.

El dataset de entrenamiento es `Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill`, del que se filtraron 2.091 de 6.095 trazas completas de razonamiento y solución que cabían en `max_length=4096`. El entrenamiento consistió en 1 epoch (262 pasos, batch de 1 con acumulación de gradiente de 8, learning rate 1e-4 con decaimiento coseno, 25 pasos de warmup, optimizador `paged_adamw_8bit`), ejecutado en una RTX 5070 de 12 GB. Las métricas finales reportadas son `train_loss = 0.9409` y `mean_token_accuracy = 72.5%`. No se documenta RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Generación de código para problemas algorítmicos y de programación competitiva, con trazas de razonamiento explícitas en `` antes de la solución.
- Razonamiento multi-paso guiado por la estructura de "pensamiento" heredada del dataset de destilación.
- Capacidad multimodal potencial (pipeline `image-text-to-text` y clase `AutoModelForImageTextToText`), aunque la model card solo ejemplifica uso textual; no se documenta el alcance real de la visión.
- Respuestas sin censura ("abliterated"/"heretic"), lo que implica ausencia de rechazos ante contenido sensible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no documentadas).

## Casos de uso

- Práctica de programación competitiva: el modelo genera una traza de razonamiento seguida de una implementación, útil como tutor para estudiar estrategias algorítmicas paso a paso en problemas tipo LeetCode o Codeforces.
- Generación de soluciones de referencia en entornos de formación: puede producir implementaciones de algoritmos clásicos (por ejemplo, subarray de suma máxima) con explicación previa, adecuado por su bajo coste de ejecución en GPU de consumo.
- Prototipado local en estaciones de trabajo modestas: con pesos BF16 o GGUF Q6_K cabe en GPUs de 12 GB, lo que permite experimentar con modelos de razonamiento sin infraestructura en la nube.
- Investigación sobre destilación de razonamiento: sirve como caso de estudio reproducible de cómo un dataset de destilación de un modelo mayor (DeepSeek-V4.1-Flash-Nemotron) transfiere trazas de pensamiento a un modelo de 4B.
- Generación de código en pipelines internos sin restricciones de contenido: su naturaleza "uncensored" lo hace apto para entornos controlados donde se necesita que el modelo no rechace peticiones legítimas por filtros conservadores.
- Evaluación de técnicas de "abliteration": útil para investigadores que comparan el comportamiento del modelo base censurado frente a la variante heretic en tareas de código y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (`train_loss = 0.9409`, `mean_token_accuracy = 72.5%`), que no constituyen una evaluación de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8-9 GB para pesos de 4B más overhead de activaciones y KV cache; viable en GPUs de 12 GB como la RTX 5070 usada en el entrenamiento.
- VRAM estimada con GGUF Q6_K: aproximadamente 3,5-4 GB de pesos, con margen amplio en GPUs de 8 GB.
- GPUs recomendadas: RTX 5070, RTX 4070/4080, RTX 3090, A100 o H100 para mayor throughput; el modelo está pensado para hardware de consumo.
- Cabe en GPU de consumo: sí, en tarjetas de 8-12 GB con cuantización Q6_K y en 12 GB o más en BF16.
- Opciones de despliegue: `transformers` (documentado en la model card), llama.cpp u Ollama mediante el GGUF Q6_K; vLLM y TGI no están documentados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-4B | ~4B | 4096 (entrenamiento) | Apache 2.0 | Fine-tune de razonamiento para código competitivo; sin benchmarks |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | Modelo original de Qwen; capacidades generales y multimodales |
| Qwen3.5-4B-heretic | ~4B | no disponible | no disponible | Variante abliterated del base, sin ajuste de razonamiento |
| Modelos de razonamiento de 7B (familia DeepSeek-R1-Distill) | ~7B | no disponible | no disponible | Alternativas de destilación de razonamiento de mayor tamaño, con benchmarks publicados |

La comparación cuantitativa de rendimiento no está disponible, ya que ninguno de los datos proporcionados incluye evaluaciones comparativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tune mejore al modelo base en tareas de código o razonamiento.
- Entrenamiento muy limitado: 1 epoch sobre 2.091 ejemplos filtrados y una sola GPU de consumo; riesgo alto de sobreajuste al estilo del dataset y de degradación de capacidades generales.
- Naturaleza "abliterated"/"heretic": el modelo no aplica rechazos de seguridad, lo que lo hace inadecuado para aplicaciones de cara al público sin capas de moderación externas.
- Riesgo de alucinación: elevado en un modelo de 4B con ajuste estrecho; las trazas `
