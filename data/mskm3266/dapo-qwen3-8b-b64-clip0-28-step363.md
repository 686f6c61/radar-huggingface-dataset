# mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363

## Resumen

Este modelo es un checkpoint de `Qwen/Qwen3-8B-Base` entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo DAPO (Dynamic Anchored Preference Optimization) y estimador GRPO. Ha sido desarrollado por el usuario mskm3266 y publicado en Hugging Face con licencia Apache 2.0. El objetivo es mejorar las capacidades de razonamiento matemático del modelo base, evaluado en los conjuntos AIME 2024, 2025 y 2026.

El checkpoint corresponde al paso global 363 del entrenamiento, con los pesos del actor fusionados en formato bf16. No incluye estado de optimizador ni otros componentes necesarios para reanudar el entrenamiento, por lo que está pensado exclusivamente para inferencia o como punto de partida para evaluaciones. Con 8.190.735.360 parámetros, es un modelo denso de tamaño medio que puede ejecutarse en GPUs de consumo con suficiente memoria.

La relevancia de este modelo radica en que documenta una configuración concreta de RL (clip ratio 0.2/0.28, sin KL, con overlong buffer) aplicada a un modelo base popular, lo que resulta útil para investigadores que quieran reproducir o comparar estrategias de optimización por refuerzo en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (formato original) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-8B-Base, un transformer denso de 8 mil millones de parámetros. No se proporcionan detalles adicionales sobre capas, atención o innovaciones estructurales en la model card.

El entrenamiento se realizó con el framework verl, aplicando el algoritmo DAPO con estimador GRPO. La configuración incluye: 363 pasos de entrenamiento, tamaño de lote de generación 192, lote de entrenamiento 64 y mini-lote 32, con 8 rollouts por prompt. La longitud máxima de prompt y respuesta es de 2048 y 8192 tokens respectivamente. Se usó un clip ratio bajo de 0.2 y alto de 0.28 con constante c=10.0, KL deshabilitado, coeficiente de entropía 0, tasa de aprendizaje 1e-6 con warmup de 10 pasos y weight decay 0.1. La agregación de pérdida es token-mean y se activó un buffer de sobre-longitud con longitud 1638 y factor de penalización 1.0. El motor de rollout fue vLLM con tensor parallelism 2 y temperatura 1.0.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base Qwen3-8B.
- Razonamiento matemático mejorado mediante RL, con evaluación en conjuntos AIME 2024, 2025 y 2026.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, aunque no se especifica explícitamente en la documentación.
- No se menciona soporte para tool calling, function calling, agentes, visión o audio.
- No se indican capacidades multilingües específicas; el modelo base Qwen3-8B es multilingüe, pero este checkpoint no documenta idiomas concretos.

## Casos de uso

- Resolución de problemas matemáticos competitivos: el modelo puede utilizarse para generar soluciones paso a paso a problemas de nivel AIME, útil en entornos educativos o de investigación.
- Evaluación de estrategias de RL: investigadores pueden comparar este checkpoint con el modelo base para medir el impacto del entrenamiento DAPO en tareas de razonamiento.
- Generación de explicaciones matemáticas: puede producir razonamientos detallados para problemas de álgebra, geometría o teoría de números, sirviendo como asistente en tutorías.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir como punto de partida para entrenamientos adicionales con otros algoritmos o datasets.
- Benchmarking de modelos de 8B: permite comparar el rendimiento de un modelo RL-optimizado frente a otros checkpoints del mismo tamaño en tareas de razonamiento.
- Investigación en optimización por refuerzo: su configuración de entrenamiento documentada (clip ratio, KL desactivado, overlong buffer) lo convierte en un caso de estudio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se evaluó en AIME 2024, 2025 y 2026, pero no se incluyen las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16-20 GB, considerando los pesos (16.4 GB) más overhead de activaciones y caché.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 24 GB de memoria para ejecución cómoda.
- Puede caber en GPUs de consumo como RTX 3090/4090 (24 GB) o en GPUs de 16 GB con cuantización adicional, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: compatible con transformers, vLLM (usado en el entrenamiento), y potencialmente con llama.cpp u Ollama si se generan cuantizaciones GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y del motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DAPO-Qwen3-8B-b64-clip0.28-step363 | 8.19B | No disponible | Apache 2.0 | Checkpoint RL sobre Qwen3-8B-Base |
| Qwen/Qwen3-8B-Base | 8.19B | No disponible | Apache 2.0 | Modelo base sin RL |
| Otros checkpoints RL de 8B | Variable | Variable | Variable | No hay datos específicos disponibles |

No se dispone de información sobre otros modelos comparables en la misma categoría dentro de la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación, no optimizado para producción; no incluye estado de optimizador ni componentes para reanudar entrenamiento.
- No se han publicado métricas de rendimiento, por lo que su eficacia real en tareas generales es desconocida.
- Hereda los sesgos y limitaciones del modelo base Qwen3-8B, incluyendo posibles alucinaciones y errores en razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y cualquier restricción adicional.
- No se documentan idiomas soportados ni longitudes de contexto específicas, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- El entrenamiento se centró en matemáticas; su rendimiento en otras tareas (codificación, generación creativa) puede ser inferior al del modelo base.

## Enlaces

- [Hugging Face - DAPO-Qwen3-8B-b64-clip0.28-step363](https://huggingface.co/mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363)
- [Checkpoint FSDP para reanudar entrenamiento](https://huggingface.co/mskm3266/DAPO-Qwen3-8B-b64-clip0.28-step363-fsdp-ckpt)
- [Modelo base Qwen/Qwen3-8B-Base](https://huggingface.co/Qwen/Qwen3-8B)
