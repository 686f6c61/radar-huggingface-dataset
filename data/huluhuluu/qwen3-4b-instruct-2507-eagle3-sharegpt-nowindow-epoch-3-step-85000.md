# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-85000

## Resumen

Este repositorio contiene el checkpoint `epoch-3-step-85000` de un modelo de borrador (draft model) para decodificación especulativa, entrenado con el algoritmo EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El autor, `huluhuluu`, ha publicado 47 checkpoints de un entrenamiento online con SpecForge, cada uno en un repositorio separado. Este modelo no es un chat model independiente: su única función es acelerar la inferencia del modelo objetivo generando secuencias de tokens candidatos que el modelo base verifica en paralelo.

El checkpoint tiene 202,7 millones de parámetros (0,4 GB en bf16) y una arquitectura `LlamaForCausalLMEagle3` de una sola capa. Se entrenó con datos ShareGPT limpios, con una longitud máxima de secuencia de 2048 tokens y un total de 231.810 pasos de optimización (10 épocas). Su relevancia radica en que permite reducir la latencia de despliegues de Qwen3-4B-Instruct-2507 en entornos de producción, especialmente cuando se sirve con SGLang y el backend FlashInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Entrenado con max sequence length 2048; sin límite de ventana deslizante en el run estándar |
| Tipos de cuantizacion | bf16 (no se publican cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base Qwen3-4B-Instruct-2507 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una técnica de decodificación especulativa que aprende a predecir los tokens que el modelo objetivo (Qwen3-4B-Instruct-2507) generaría, basándose en las características ocultas del propio modelo base. La arquitectura consta de una única capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario de borrador es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936 tokens. Los pesos están en bfloat16.

El entrenamiento se realizó con SpecForge, un framework para entrenamiento online de modelos especulativos, sobre un dataset ShareGPT en formato JSONL (revisión no registrada). Los hiperparámetros incluyen: 10 épocas, 231.810 pasos de optimización, batch global efectivo de 4 (tamaño por dispositivo 1, paralelismo de datos 4, sin acumulación de gradientes), learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0, max grad norm 0,5, y longitud máxima de secuencia de 2048. Se usó atención SDPA para el draft y el backend objetivo es SGLang con FlashInfer. El parámetro EAGLE3 TTT length es 7. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera múltiples tokens candidatos que el modelo base verifica en paralelo, reduciendo la latencia por token.
- Compatibilidad con SGLang: se integra como ruta de draft model (`--speculative-draft-model-path`) con el algoritmo EAGLE3.
- Soporte de parámetros de árbol especulativo: `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` configurables.
- No es un modelo de chat: no genera respuestas por sí mismo ni tiene capacidades de razonamiento, código, matemáticas o tool calling.
- No soporta vision, audio ni modos de pensamiento (thinking mode).
- Entrenado únicamente con datos ShareGPT de conversaciones en inglés (el dataset ShareGPT es predominantemente inglés), aunque el modelo base subyacente es multilingüe.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con SGLang: el checkpoint se usa como modelo de borrador para reducir la latencia de generación en servidores de chat o APIs. Es adecuado porque el draft model está entrenado específicamente para imitar las predicciones del modelo base.
- Optimización de throughput en entornos de inferencia con alta concurrencia: al reducir el número de pasos secuenciales del modelo grande, se libera capacidad de cómputo para atender más peticiones simultáneas.
- Fine-tuning de hiperparámetros especulativos: los valores de árbol (num steps, topk, num draft tokens) pueden ajustarse con este checkpoint para encontrar la configuración óptima de latencia/calidad para una carga de trabajo concreta.
- Benchmarking de decodificación especulativa: investigadores pueden comparar el rendimiento de este checkpoint frente a otros draft models (EAGLE2, Medusa, etc.) en tareas de generación de texto.
- Integración en pipelines de inferencia existentes: al ser un modelo pequeño (202M parámetros), puede cargarse en la misma GPU que el modelo base sin un aumento significativo de VRAM, facilitando su adopción en sistemas ya desplegados.
- Evaluación de la calidad de drafts en diferentes etapas de entrenamiento: los 47 checkpoints publicados permiten estudiar cómo evoluciona la precisión del draft a lo largo del entrenamiento y seleccionar el mejor punto de guardado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" para este run. No se proporcionan cifras de latencia, throughput ni accuracy del draft.

## Requisitos de hardware

- El modelo de borrador ocupa aproximadamente 0,4 GB en bf16 (202M parámetros). Para inferencia, la VRAM adicional sobre el modelo base es de unos 0,5-1 GB (incluyendo overhead de activaciones y buffers).
- GPU recomendada: cualquier GPU con al menos 8 GB de VRAM puede alojar tanto el modelo base Qwen3-4B-Instruct-2507 como este draft model. En GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores es viable.
- Para despliegue en producción con SGLang, se recomienda una GPU con soporte de FlashInfer (Ampere o superior, por ejemplo A100, H100, RTX 4090).
- Opciones de despliegue: SGLang (backend recomendado, con `--speculative-algorithm EAGLE3`). No se mencionan otras herramientas como vLLM, llama.cpp u Ollama; la compatibilidad con estas no está documentada.
- Latencia y throughput: no disponibles; dependen de la configuración del árbol especulativo y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros draft models (EAGLE2, Medusa, etc.). El modelo es específico para el modelo base Qwen3-4B-Instruct-2507, por lo que no es directamente comparable con modelos de propósito general. Frente al propio modelo base, la diferencia es que el draft model no genera texto por sí mismo; solo produce candidatos para acelerar la inferencia. No se han publicado métricas que permitan comparar su efectividad con otras técnicas de decodificación especulativa.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo de forma independiente producirá salidas sin sentido o incompletas. Debe emparejarse siempre con `Qwen/Qwen3-4B-Instruct-2507`.
- Entrenado con un dataset ShareGPT que puede contener sesgos de estilo y contenido de conversaciones de internet; no se realizó ninguna evaluación de seguridad o alineación.
- La longitud máxima de secuencia de entrenamiento es 2048 tokens; aunque el run no fija una ventana deslizante, el draft puede degradarse con secuencias más largas que las vistas en entrenamiento.
- No se registraron métricas de calidad del draft (tasa de aceptación, overhead, etc.), por lo que su rendimiento real en producción es desconocido.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podría contener datos sensibles o código ejecutable.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License o Apache-2.0 según la versión) que debe verificarse por separado.
- No hay garantía de que el checkpoint funcione correctamente con versiones futuras de SGLang o FlashInfer; la compatibilidad está ligada a la versión utilizada en el entrenamiento.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-85000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Otro checkpoint del mismo run (ejemplo): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Documentación de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
