# Icey444/ttground-r1-ckpts

## Resumen

Este repositorio contiene los checkpoints de reproducción del estudio "Ground-R1" (denominado "demystify study"), publicados por el usuario Icey444. Se trata de pesos de modelos entrenados mediante aprendizaje por refuerzo (RL) y fine-tuning supervisado (SFT) sobre el modelo base Qwen2.5-VL-7B-Instruct. El objetivo es permitir a la comunidad reproducir y analizar los experimentos descritos en el estudio, que investiga el comportamiento de técnicas de entrenamiento como GRPO (Group Relative Policy Optimization) en modelos de visión-lenguaje.

Los checkpoints están organizados por etapa de entrenamiento (RL y SFT) y por semilla, siguiendo una convención de nombres estricta. El repositorio incluye únicamente pesos y configuraciones (shards, tokenizer, plantilla de chat, estado del entrenador), sin el estado del optimizador de DeepSpeed, por lo que son adecuados para evaluación y warm-start, pero no para reanudar entrenamiento exacto. Con un tamaño total de 739,9 GB, el repositorio alberga múltiples variantes y pasos de entrenamiento.

La relevancia de este repositorio radica en su utilidad para investigadores que necesiten reproducir resultados de entrenamiento de RL en modelos multimodales, así como para estudiar el efecto de diferentes configuraciones (baseline, ground, vanilla) en el rendimiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer de vision-lenguaje) |
| Parametros totales | 7B (modelo base Qwen2.5-VL-7B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los checkpoints se generan a partir del modelo base Qwen2.5-VL-7B-Instruct. Según la model card, los experimentos de RL se inicializan directamente desde este modelo base, sin cold-start desde un checkpoint SFT, tal como indica el estudio original ("we do not employ curated SFT dataset for cold-start training..."). Los experimentos de SFT utilizan un batch efectivo de 128 (per-device 4 × grad-accum 4 × 8 GPUs) y 125 pasos, lo que equivale aproximadamente a 0,494 épocas. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni la composición de los datos.

La convención de nombres distingue entre etapas `rl/` y `sft/`, con sufijos que indican la semilla y el paso de checkpoint. Se incluye el estado del entrenador (`trainer_state.json`) para verificar que los checkpoints SFT se entrenaron con el batch de referencia.

## Capacidades

- Al ser checkpoints del modelo Qwen2.5-VL-7B-Instruct, heredan las capacidades de dicho modelo: comprensión de imágenes y texto, generación de texto, razonamiento visual y respuesta a instrucciones.
- No se dispone de información específica sobre capacidades adicionales adquiridas durante el entrenamiento RL/SFT (por ejemplo, tool calling, agentes o razonamiento multi-paso) en la documentación proporcionada.
- El repositorio no incluye demos ni ejemplos de uso, por lo que las capacidades prácticas deben inferirse del modelo base.

## Casos de uso

- Reproduccion de experimentos de investigacion: los checkpoints permiten replicar los resultados del estudio Ground-R1, comparando variantes (baseline, ground, vanilla) y semillas.
- Analisis de dinamicas de entrenamiento: al disponer de checkpoints en diferentes pasos (por ejemplo, ckpt1000 en RL), se puede estudiar la evolucion del modelo durante el entrenamiento.
- Warm-start para fine-tuning: los pesos pueden usarse como inicializacion para nuevos experimentos de SFT o RL, evitando partir de cero.
- Evaluacion de robustez: al existir multiples semillas, se puede medir la varianza del rendimiento entre ejecuciones.
- Estudio de metodos de RL (GRPO): el repositorio sirve como referencia para comparar implementaciones propias de GRPO u otros algoritmos.
- Investigacion en modelos multimodales: permite analizar como el entrenamiento con RL afecta a las capacidades de vision-lenguaje del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio (739,9 GB) indica que contiene multiples checkpoints; cada checkpoint individual de un modelo 7B en precision fp16 ocupa aproximadamente 14 GB de VRAM para inferencia.
- Para cargar un solo checkpoint en memoria se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) si se usa precision fp16 o bf16.
- Para entrenamiento o fine-tuning con batch grande, se necesitarian multiples GPUs (el estudio menciona 8 GPUs) con suficiente memoria agregada.
- No se especifican opciones de despliegue (vLLM, llama.cpp, etc.) en la documentacion; al ser checkpoints de investigacion, su uso principal es en entornos de entrenamiento y evaluacion con frameworks como PyTorch o DeepSpeed.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion del repositorio. Dado que el modelo base es Qwen2.5-VL-7B-Instruct, podria compararse con otros modelos de vision-lenguaje de tamano similar (por ejemplo, LLaVA-NeXT, InternVL), pero no hay datos de rendimiento en este repositorio para establecer una comparacion.

## Limitaciones y advertencias

- No se especifica la licencia de uso; se debe contactar con el autor antes de cualquier uso comercial o redistribucion.
- Los checkpoints no incluyen el estado del optimizador, por lo que no es posible reanudar entrenamiento exactamente desde el punto guardado.
- La informacion sobre el dataset de entrenamiento es inexistente, lo que limita la interpretacion de los resultados y la reproducibilidad completa.
- Al ser un repositorio de investigacion, no se garantiza que los modelos sean adecuados para produccion; pueden presentar sesgos o alucinaciones tipicas de modelos entrenados con datos no filtrados.
- La convencion de nombres exige conocer la semilla para ubicar correctamente cada checkpoint; los checkpoints sin semilla registrada (como el ejemplo `LEGACY`) no pueden asignarse a una fila de la matriz de experimentos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Icey444/ttground-r1-ckpts
- Modelo base (referencia): Qwen2.5-VL-7B-Instruct (no se proporciona enlace directo en la informacion)
