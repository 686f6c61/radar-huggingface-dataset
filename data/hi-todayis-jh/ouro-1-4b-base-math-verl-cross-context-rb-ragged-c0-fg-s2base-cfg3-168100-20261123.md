# hi-todayis-jh/ouro-1.4b-base-math-verl-cross-context-rb-ragged-c0-fg-s2base-cfg3-168100-20261123

## Resumen

Ouro-1.4B-base-math-verl-cross-context-rb-ragged-c0-fg-s2base-cfg3-168100-20261123 es un checkpoint de investigación publicado por el usuario hi-todayis-jh. No se trata de un modelo preentrenado desde cero, sino del resultado de un ajuste fino mediante aprendizaje por refuerzo (GRPO, con la receta de verl 0.6.1) sobre el modelo ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje "looped" (con bucle de cómputo recurrente) de 1.400 millones de parámetros desarrollado por ByteDance.

El objetivo del entrenamiento es mejorar el razonamiento matemático del modelo base. Para ello se ha utilizado el conjunto de datos DigitalLearningGmbH/MATH-lighteval, procesado en un fichero propio (`compression_dataset_3200.jsonl`). El entrenamiento se ejecutó durante 100 pasos de rollout en un clúster Slurm (job 168100, nodo orchard-flame-1), con una configuración muy específica que incluye una política de salida adaptativa ("exit policy"), diseño de KV en modo "ragged" y decodificación asíncrona con vLLM.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de RL aplicado a un modelo pequeño con arquitectura no convencional (looped transformer); por otro, sirve como ejemplo de reproducibilidad, ya que el repositorio incluye manifiestos de ejecución, código de lanzamiento, código del modelo parcheado y recibos de verificación. La licencia es Apache 2.0, lo que permite uso comercial, aunque el modelo está claramente orientado a investigación y no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle recurrente (Ouro, "looped language model"), ajustado con GRPO |
| Parametros totales | 1.4B (heredados del modelo base ByteDance/Ouro-1.4B-Thinking) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dentro de `global_step_N/actor/huggingface/`), más checkpoints FSDP en `.pt` |

## Arquitectura y entrenamiento

El modelo base, ByteDance/Ouro-1.4B-Thinking, pertenece a la familia Ouro, que introduce un mecanismo de bucle: el mismo bloque transformer se aplica de forma iterativa un número variable de veces, con una política de salida ("exit policy") que decide cuándo detenerse. En este checkpoint, esa política se ha configurado en modo adaptativo (`--exit_mode adaptive --cache_rule ragged --min_depth 2`), lo que permite profundidad de cómputo variable por token. El entrenamiento se realizó con verl 0.6.1 usando el algoritmo `cross_context_rb` en modo `ragged`, con 100 pasos de rollout, optimizador AdamW8bit, learning rate 1e-6, beta 0.001, warmup ratio 0.1 y una sola época. Se usó vLLM con scheduling asíncrono, 45% de utilización de memoria GPU y 64 GiB de caché KV. El dataset de entrenamiento es una versión comprimida de MATH-lighteval (3.200 ejemplos). No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de esa fuente.

## Capacidades

- Generación de texto y razonamiento matemático, heredados del modelo base y reforzados con GRPO sobre MATH-lighteval.
- Razonamiento multi-paso con profundidad de cómputo adaptativa (bucle recurrente con política de salida).
- Capacidad de "thinking" (el modelo base es la variante Thinking de Ouro).
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta soporte multilingüe explícito.
- No se documenta visión, audio ni otras modalidades.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint sirve como referencia reproducible de un pipeline GRPO con verl sobre un modelo looped, incluyendo configuración, código y logs.
- Estudio de políticas de salida adaptativas: permite analizar cómo la `exit policy` aprendida afecta al coste computacional y a la precisión en problemas matemáticos.
- Evaluación de razonamiento matemático en modelos pequeños: útil para comparar la variante ajustada con el modelo base en MATH-lighteval y otros benchmarks de matemáticas.
- Reproducción de experimentos: el repositorio incluye `run_manifest.json`, `run_config.json`, `verl_config.yaml`, `launch_code/` y `training_source.tar.gz`, lo que facilita replicar el entrenamiento en un clúster Slurm.
- Base para nuevos ajustes: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para experimentos posteriores de RL o SFT.
- Análisis de eficiencia computacional: el uso de KV en modo ragged y scheduling asíncrono con vLLM permite estudiar trade-offs de memoria y latencia en modelos con bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 1.4B en FP16 se necesitan aproximadamente 2,8 GB solo para pesos; en 8-bit, unos 1,4 GB; en 4-bit, unos 0,7 GB, sin contar caché KV ni overhead.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4090, así como en A100/H100 para entrenamiento o despliegue a mayor escala.
- Cabe en consumer GPU: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM en cuantización de 8 bits, aunque no se documenta oficialmente.
- Opciones de despliegue: el modelo se carga con `transformers` usando `trust_remote_code=True` (requiere el código Ouro incluido). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en inferencia, aunque el entrenamiento usó vLLM internamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B-base-math-verl-... (este) | 1.4B | no disponible | Apache 2.0 | Hugging Face | Checkpoint RL sobre Ouro-1.4B-Thinking |
| ByteDance/Ouro-1.4B-Thinking | 1.4B | no disponible | no disponible | Hugging Face | Modelo base, looped transformer |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (tipico) | Apache 2.0 | Hugging Face | Transformer estándar, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1.7B | 8K (tipico) | Apache 2.0 | Hugging Face | Modelo pequeño orientado a eficiencia |

No se dispone de datos de rendimiento comparativo para este checkpoint, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint de investigación con 0 descargas y 0 likes; no hay evidencia de validación externa.
- El entrenamiento se realizó sobre un dataset específico de matemáticas (MATH-lighteval comprimido), lo que puede provocar sobreajuste a ese dominio y degradar el rendimiento general.
- No se documentan idiomas soportados; se desconoce el comportamiento en castellano u otras lenguas.
- Riesgo de alucinación inherente a modelos de 1.4B, especialmente en razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el código Ouro pueden tener condiciones adicionales no especificadas aquí.
- Requiere `trust_remote_code=True` para cargar el código Ouro, lo que implica ejecutar código del repositorio; conviene auditar `model_code/` antes de usarlo en producción.
- No se han publicado benchmarks ni métricas de evaluación en la información disponible.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el tamaño no se ha actualizado; verificar antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/hi-todayis-jh/ouro-1.4b-base-math-verl-cross-context-rb-ragged-c0-fg-s2base-cfg3-168100-20261123
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de rollouts: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-base-math-verl-cross-context-rb-ragged-c0-fg-s2base-cfg3-168100-20261123-rollouts
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Proyecto W&B: https://wandb.ai/ouro-1.4b-grpo-rltt-math (proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-cross_context_rb-ragged-c0-fg-s2base-cfg3-168100-20261123`)
