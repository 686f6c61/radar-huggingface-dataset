# JackHsieh/Qwen3-4B.gpnp-rl.consumer-4B-base-gpnp-kvtt-iid160M-sans256.heldout256.lr3e-7-kl0.step-2176

## Resumen

Este repositorio contiene un ajuste fino por aprendizaje por refuerzo (RL) de Qwen3-4B, desarrollado por el usuario JackHsieh bajo el marco de trabajo "prestar". El modelo no es un asistente conversacional al uso: se ha entrenado específicamente como generador de notas o "pensamientos" (thought generator) que, dado un prefijo de documento, redacta un párrafo general sobre lo que probablemente venga a continuación. La nota resultante se evalúa mediante un modelo recompensador congelado que mide la log-probabilidad por token de la continuación real del documento, condicionada a la nota y al prefijo.

El checkpoint publicado corresponde al mejor paso de validación (paso 2176) de una ejecución de RL que partió de los pesos originales de Qwen3-4B. La arquitectura subyacente es la de Qwen3-4B, un transformer denso de aproximadamente 4.022 millones de parámetros. El interés de este modelo es fundamentalmente metodológico: documenta una receta completa de RL (RLOO con 8 muestras, pérdida CISPO, sin KL, penalización lineal por longitud) aplicada a una tarea muy concreta de generación de contexto auxiliar, con métricas de validación detalladas y trazabilidad de las distintas fases del entrenamiento.

No se trata de un modelo para uso general en producción: su plantilla de chat no es la estándar de Qwen3, su comportamiento está especializado en generar notas de continuación y su licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; servible en bf16 con vLLM) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 en la raíz del repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4.022 millones de parámetros, y se somete a un proceso de RL con el algoritmo RLOO (8 muestras por prompt, 64 prompts por paso, temperatura 1, top_p 1, parada por EOS, límite de 2560 tokens). La recompensa es la log-probabilidad por token de la continuación real del documento, calculada por un recompensador congelado (JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-160M-sans-256.stride-1.suffix-conditional), menos una penalización lineal por longitud que va de 0 a 2048 tokens hasta 0,1 a 2560 tokens. La pérdida utilizada es CISPO, con learning rate 3e-7 y sin término KL.

Los datos de RL son 256 documentos de statML-arxiv (`train[38656:38912]`) que el recompensador nunca vio durante su entrenamiento. El recompensador, a su vez, es Qwen3-4B-Base con entrenamiento continuado sobre una ventana de 160M tokens de statML-arxiv (menos los últimos 256 documentos), con notas `.kv-tags-thought` antepuestas. La validación se realiza sobre una rejilla iid de 20M tokens con stride 32 (72.960 prompts, 1 muestra por prompt). El entrenamiento se ejecutó en Nebius con 8 × H100 de 80 GB y pasó por varias fases de reanudación (pasos 0–895, 833–1536, 1537–1626 y 1601–2560) documentadas en la model card. La innovación destacable es la receta de RL aplicada a generación de notas auxiliares, con una plantilla específica (`prestar/general-paragraph-nothink-prefill.jinja`) que desactiva el modo thinking y prefija la respuesta con "The text".

## Capacidades

- Generación de notas de continuación: dado un prefijo de documento, produce un párrafo general sobre el contenido que probablemente siga.
- Generación de texto condicionada a prefijo, con el modo thinking desactivado mediante la plantilla de entrenamiento.
- Especialización en documentos científicos (statML-arxiv) como dominio de entrenamiento y validación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Generación de resúmenes prospectivos en pipelines de procesamiento documental: dado un fragmento inicial de un artículo, el modelo produce una nota sobre lo que probablemente venga después, útil para indexación o navegación asistida.
- Investigación en RL para modelos de lenguaje: el checkpoint sirve como referencia reproducible de una receta completa (RLOO, CISPO, penalización por longitud) aplicada a una tarea de generación condicionada.
- Estudio de recompensadores condicionales por sufijo: permite analizar cómo un modelo recompensador congelado guía la política hacia notas que maximizan la log-probabilidad de la continuación real.
- Evaluación de técnicas de control de longitud en RL: la penalización lineal entre 2048 y 2560 tokens y las estadísticas de longitud (media 702, desviación 132, mínimo 349) ofrecen un caso concreto para estudiar el equilibrio entre recompensa y longitud.
- Experimentos de destilación o imitación: las notas generadas pueden usarse como datos sintéticos de contexto auxiliar para otros modelos en tareas de continuación de documentos.
- Reproducción de linajes de entrenamiento con reanudaciones: la documentación de las fases y los checkpoints intermedios permite estudiar el efecto de las reanudaciones sobre la validación final.

## Benchmarks y rendimiento

| Metrica | Stock Qwen3-4B (paso 0) | Este checkpoint (paso 2176) |
|---|---|---|
| Log-probabilidad media por token del sufijo (sin penalización) | −1,20972 | −1,206679 |
| Recompensa con penalización por longitud (`val-core/.../reward/mean@1`) | no disponible | −1,206716 |

La mejora sobre el modelo base es pequeña (aproximadamente 0,003 en log-probabilidad media por token) y se midió sobre la rejilla de validación iid de 20M tokens con stride 32 (72.960 prompts, 1 muestra por prompt). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en fp32 (aproximadamente 16 GB); en bf16 se reduce a unos 8 GB, y en cuantizaciones de 8 bits o 4 bits a unos 4 GB o 2 GB respectivamente (estimaciones según el tamaño de 4.022 millones de parámetros; no confirmadas en la model card).
- GPU recomendadas: H100 de 80 GB (usadas en el entrenamiento con 8 unidades); para inferencia en bf16 basta una GPU con al menos 10-12 GB de VRAM.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090); en cuantización de 4 bits en tarjetas de 6-8 GB.
- Opciones de despliegue: vLLM (soporta los pesos en bf16 según la model card), transformers (librería declarada), text-generation-inference (etiqueta presente en el repo). No se documenta soporte de llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card indica longitudes de completado en validación con media 702 tokens, desviación 132 y mínimo 349, con un 0,037% de completados que alcanzan el límite de 2560 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-4B + RL prestar) | 4.022 M | no disponible | −1,206679 (log-prob media del sufijo) | no disponible | Hugging Face |
| Qwen/Qwen3-4B (base) | 4.022 M | no disponible en esta ficha | −1,20972 (misma métrica) | no disponible en esta ficha | Hugging Face |
| JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-160M-sans-256.stride-1.suffix-conditional (recompensador) | 4.022 M (base Qwen3-4B-Base con CPT) | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (generadores de notas o modelos de 4B ajustados por RL para tareas auxiliares) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en generar notas de continuación de documentos; no es un asistente conversacional general y su uso fuera de esa tarea no está validado.
- La plantilla de chat estándar de Qwen3 no es la adecuada: debe usarse `prestar/general-paragraph-nothink-prefill.jinja`, que desactiva el thinking y prefija la respuesta con "The text".
- La mejora sobre el modelo base es marginal (aproximadamente 0,003 en la métrica de validación), por lo que el beneficio práctico frente a Qwen3-4B original es limitado.
- No se incluye el checkpoint reanudable de verl (estado del optimizador, posición del dataloader), por lo que no es posible continuar el RL desde este repositorio.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; debe verificarse con el autor antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas más allá de las heredadas de Qwen3-4B.
- El dominio de entrenamiento y validación es statML-arxiv; el comportamiento en otros dominios no está evaluado.
- Los pesos en fp32 duplican el espacio en disco respecto a bf16 (repo de 16,1 GB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/Qwen3-4B.gpnp-rl.consumer-4B-base-gpnp-kvtt-iid160M-sans256.heldout256.lr3e-7-kl0.step-2176
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Recompensador: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-160M-sans-256.stride-1.suffix-conditional
- Proyecto W&B del entrenamiento: `prestar-RL` (run `.../train=iid160M-heldout256.38656-38912/lr=3e-07-kl=0.0-lenpen2048-2560-0.1`), referenciado en la model card; no se proporciona URL directa.
- Plantilla de generación: `prestar/general-paragraph-nothink-prefill.jinja` (incluida en el repositorio).
- Plantilla del recompensador: `prestar/kv-tags-thought.jinja` (incluida en el repositorio).
- Configuración del run: `prestar/prestar_rl_config.resolved.yaml` (incluida en el repositorio).
