# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard

## Resumen

El modelo `code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard` es un checkpoint derivado de Qwen3-1.7B-Base, publicado por la organización RL-Forgettting-Exp4 como parte de un experimento de investigación sobre olvido catastrófico en ajuste supervisado (SFT) orientado a código. No se trata de un modelo de propósito general ni de un lanzamiento de producto: es un artefacto de experimentación que documenta una ejecución concreta de un protocolo de entrenamiento reproducible, con hiperparámetros fijos y un esquema de *replay* (repetición de datos previos) con lambda 1.0.

El entrenamiento se ejecutó el 2 de noviembre de 2026 con una configuración declarada: learning rate 1e-5, una época, semilla 42, batch efectivo de 256, micro-batch de 1, 4 GPUs H100, secuencias de 4096 tokens y 10 guardados de checkpoint por brazo experimental. La variante "hard" hace referencia a la dificultad de los ejemplos de código utilizados en el *replay*, dentro de una matriz de experimentos que incluye variantes *ordered*, *shuffled*, *uniform* y *CE* (entropía cruzada) sobre distintas bases (Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct).

Por su naturaleza, el modelo es relevante para investigadores que estudian la retención de capacidades tras SFT especializado en código y para quienes necesitan reproducir experimentos de olvido con trazabilidad completa de artefactos, commits inmutables y métricas de evaluación. No hay evidencia de publicación de benchmarks ni de una model card orientada a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B-Base; detalles internos no disponibles) |
| Parametros totales | 1.7B (según el nombre del checkpoint y la base declarada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento declarada; contexto nativo de la base no disponible) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (los derivados de Qwen3-1.7B-Base conservan Apache 2.0 según la model card; ver LICENSE/NOTICE del repositorio) |
| Formato de pesos | safetensors (tamaño del repo: 13.8 GB, incluye checkpoints y artefactos) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-1.7B-Base y se somete a un SFT específico de código con un esquema de *replay* de datos previos con lambda 1.0, diseñado para mitigar el olvido de capacidades generales durante la especialización. La ejecución declarada usa learning rate 1e-5, una sola época, semilla 42, batch efectivo de 256 (micro-batch 1), 4 GPUs H100, secuencias de 4096 tokens y 10 guardados de checkpoint por brazo. Los pesos finales y los checkpoints intermedios se distribuyen bajo `runs/checkpoints/step_N/model` y `runs/final` en los repositorios de modelo correspondientes.

La innovación metodológica no está en la arquitectura, sino en el protocolo experimental: el proyecto organiza una matriz de brazos (ordered/shuffled/uniform/hard/CE) sobre varias bases y publica manifiestos de entrega (`delivery_manifest.json`) con repositorios y commits inmutables, además de un manifiesto de evaluaciones ejecutadas (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`). La model card insiste en que "la transferencia parcial no es finalización" y que los resultados de septiembre son históricos y no cuentan como ejecución fresca, lo que indica un esfuerzo explícito por separar artefactos reproducibles de resultados previos. No se detalla la composición del dataset de código ni el volumen de tokens de entrenamiento.

## Capacidades

- Generación de código: el modelo ha sido ajustado con SFT sobre ejemplos de código, incluyendo una variante de *replay* con ejemplos "hard" (alta dificultad).
- Razonamiento y generación de texto general: se espera retención parcial de las capacidades de la base Qwen3-1.7B-Base gracias al *replay* con lambda 1.0, aunque no hay evaluación publicada que lo cuantifique.
- Tool calling / function calling: no disponible; no se documenta soporte explícito en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el checkpoint es de texto y derivado de una base sin indicación de multimodalidad.

## Casos de uso

- Investigación sobre olvido catastrófico: el checkpoint sirve como punto de comparación entre brazos experimentales (hard vs. uniform vs. ordered) para medir cuánta capacidad general se retiene tras SFT de código con *replay* lambda 1.0.
- Reproducción de experimentos: gracias a los manifiestos de entrega con commits inmutables y a la configuración declarada (seed 42, lr 1e-5, batch 256), un investigador puede replicar la ejecución y contrastar métricas en MBPP+.
- Evaluación de protocolos de *replay*: permite estudiar si la selección de ejemplos "hard" en el *replay* preserva mejor las capacidades que una selección uniforme o aleatoria.
- Estudio de dinámica de checkpoints: los 10 guardados por brazo permiten analizar la evolución de métricas a lo largo del entrenamiento y detectar puntos de degradación.
- Base para experimentos de ajuste posteriores: al ser un derivado de Qwen3-1.7B-Base con licencia Apache 2.0 heredada, puede usarse como punto de partida en estudios académicos de especialización en código.
- Validación de pipelines de evaluación: el manifiesto `evaluations/mbppplus_n160_t0.6/` facilita probar infraestructura de evaluación estandarizada (MBPP+, n=160, temperatura 0.6) sobre checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia un manifiesto de evaluaciones (`evaluations/mbppplus_n160_t0.6/delivery_manifest.json`) con la configuración MBPP+, n=160, temperatura 0.6, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.4 GB en FP16/BF16 para 1.7B parámetros; en torno a 1.8-2 GB en cuantización de 8 bits y 1-1.2 GB en 4 bits (estimaciones teóricas, no verificadas en este checkpoint).
- GPU recomendadas: H100 o A100 para entrenamiento y evaluación a escala; RTX 4090, RTX 3090 o GPUs con 8 GB o más para inferencia en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4-6 GB de VRAM en FP16 y en GPUs integradas o de gama baja con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio con arquitecturas derivadas de Qwen3, aunque no se ha verificado la conversión a GGUF para este checkpoint concreto.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard | 1.7B | 4096 (entrenamiento) | other (Apache 2.0 heredada de Qwen3-1.7B-Base) | Hugging Face, 0 descargas | Checkpoint experimental de investigación |
| Qwen3-1.7B-Base | 1.7B | no disponible en la información | Apache 2.0 | Hugging Face | Modelo base del que deriva; sin SFT de código específico |
| Qwen2.5-3B | 3B | no disponible en la información | Qwen Research License | Hugging Face | Base alternativa usada en otros brazos del mismo proyecto |
| Llama-3.2-3B-Instruct | 3B | no disponible en la información | Llama 3.2 Community License | Hugging Face | Base alternativa usada en otros brazos del mismo proyecto |

La comparación con modelos de propósito general no es directa: este checkpoint es un artefacto de experimentación sin benchmarks publicados, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3-1.7B-Base, hereda los sesgos de los datos de preentrenamiento de la base, no evaluados en este checkpoint.
- Riesgo de alucinación: no cuantificado; el SFT de código puede incrementar la confianza en APIs y funciones inexistentes si el dataset de entrenamiento contiene ejemplos sintéticos.
- Limitaciones de contexto o idioma: la longitud de entrenamiento declarada es de 4096 tokens; no se especifican idiomas soportados ni evaluación multilingüe.
- Restricciones de licencia: la licencia es "other"; la model card indica que los derivados de Qwen3-1.7B-Base conservan Apache 2.0, pero el repositorio incluye LICENSE/NOTICE/USE_POLICY que deben revisarse antes de cualquier uso comercial. No se conceden derechos adicionales sobre los modelos upstream.
- Caveat para producción: es un checkpoint de investigación con 0 descargas y 0 likes, sin benchmarks publicados ni evaluación de robustez; no se recomienda su uso en producción sin validación propia.
- Trazabilidad: la model card advierte que la entrega abarca dos organizaciones y que los resultados de septiembre son históricos; es imprescindible consultar `delivery_manifest.json` para identificar el artefacto exacto y su commit inmutable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3-1p7b-code-replay-hard
- Manifiesto de entrega de modelos: `delivery_manifest.json` (referenciado en la model card, dentro del repositorio)
- Manifiesto de evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (referenciado en la model card, dentro del repositorio)
- Repositorio de artefactos previos: RL-Forgetting-Experiments-3 (organización mencionada en la model card, sin URL directa en la información disponible)
- Modelo base: Qwen3-1.7B-Base (sin URL directa en la información proporcionada)
