# helloelwin/ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora

## Resumen

`ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora` es un conjunto de adaptadores LoRA publicados por el usuario `helloelwin` para el modelo de texto `Qwen/Qwen3.8-27B`. El adaptador se ha entrenado mediante destilación de trayectorias de agente generadas por "GPT-6 Luna" con el framework Terminus-2 sobre las tareas del dataset OpenThoughts-Agent-SFT-3.16K (3.134 filas). El objetivo es transferir a un modelo abierto de 27B las capacidades de razonamiento y actuación de un profesor propietario en escenarios agénticos.

El repositorio incluye cuatro carpetas correspondientes a distintos volúmenes de entrenamiento: `epoch-1`, `epoch-2`, `epoch-4` y `epoch-6`. El adaptador se aplica sobre las capas lineales del transformer y sobre las proyecciones de atención lineal Gated DeltaNet del modelo base, con un total de 0,93B parámetros entrenables. Es relevante ahora porque demuestra un flujo de destilación agéntica reproducible sobre un modelo de 27B con arquitectura híbrida, aunque la información publicada es todavía muy limitada (sin licencia, sin idiomas declarados, sin benchmarks y con evaluaciones de seguridad pendientes).

El modelo no incluye pesos completos: es un adaptador PEFT que requiere descargar el checkpoint base `Qwen/Qwen3.8-27B` y aplicar el LoRA con `peft` o servirlo con vLLM. El repositorio ocupa 14,9 GB, correspondiente a los cuatro checkpoints de adaptadores en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer híbrido Qwen3.8 (atención + Gated DeltaNet linear-attention) |
| Parametros totales | 0,93B entrenables en el adaptador; el modelo base Qwen3.8-27B no se detalla en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (truncado durante el entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bf16; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.8-27B |
| Dataset de entrenamiento | helloelwin/ot-distill-gpt-6-luna-3.16k-sft (3.134 filas) |
| Rango LoRA / alpha / dropout | 128 / 256 / 0,05 |
| Learning rate pico | 3e-4 con decaimiento coseno y warmup del 3% (35 pasos) |
| Epocas / pasos | 6 épocas (1.176 pasos) en la carpeta `epoch-6` |
| Batch efectivo | 16 (4 GPUs × acumulación 4) |
| Precisión de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre todas las capas lineales del modelo de texto Qwen3.8-27B: las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las del MLP (`gate_proj`, `up_proj`, `down_proj`) y las de la atención lineal Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`). Esta cobertura total de proyecciones lineales, incluyendo los módulos de atención lineal, sugiere que el modelo base combina atención estándar con mecanismos de estado recurrente o lineal, aunque la información disponible no detalla la proporción ni la configuración exacta de esa hibridación.

El entrenamiento es una destilación supervisada (SFT) sobre 3.134 trayectorias de agente generadas por GPT-6 Luna con Terminus-2. El campo `<think>` contiene el resumen de razonamiento del profesor o queda vacío. La pérdida se calcula sobre todos los turnos del asistente, las secuencias se renderizan con los marcadores `<|im_start|>`/`<|im_end|>` literales (no con la plantilla de chat) y se truncan a 32.768 tokens. La pérdida media por época desciende de 0,681 (época 1) a 0,027 (época 6), lo que el autor interpreta como señal de que el conjunto de entrenamiento está prácticamente memorizado en la última época. No se menciona RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto y razonamiento en formato de resumen de pensamiento (`<think>`), heredado del profesor GPT-6 Luna.
- Comportamiento agéntico multi-paso: las trayectorias de entrenamiento provienen de Terminus-2, un framework de agentes, por lo que el adaptador está orientado a tareas con múltiples pasos y uso de herramientas.
- Ejecución de tareas del benchmark OpenThoughts-Agent-SFT-3.16K, sobre el que se ha entrenado.
- Soporte de tool calling y function calling: implícito por el origen agéntico de los datos, aunque no se documenta explícitamente en la model card.
- Capacidades multilingües: no disponibles en la información publicada.
- Visión: el checkpoint base incluye una torre de visión, pero el adaptador no la entrena y la receta de servicio de vLLM la desactiva (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Modo de razonamiento: se sirve con `--reasoning-parser qwen3` en vLLM y se recomienda temperatura 1.0.

## Casos de uso

- Automatización de tareas agénticas sobre OpenThoughts: el adaptador está entrenado específicamente sobre las 3.134 tareas de ese dataset, por lo que su uso más directo es reproducir y comparar el rendimiento del profesor Luna en ese mismo conjunto con un modelo abierto de 27B.
- Investigación en destilación: sirve como punto de comparación frente a los adaptadores equivalentes sobre Qwen3-8B (6 y 3 épocas) publicados por el mismo autor, permitiendo estudiar el efecto del tamaño del estudiante en la transferencia de trayectorias agénticas.
- Evaluación de seguridad y alineación: el autor está ejecutando evaluaciones centradas en desalineación (StrongREJECT, XSTest, CoCoNot, MASK, agentic misalignment) con un juez Llama-3.3-70B; el adaptador es útil como sujeto de estudio en esos pipelines.
- Servicio de agente con contexto largo: con 32.768 tokens de ventana de entrenamiento, puede gestionar conversaciones multi-turno y trayectorias de herramientas de cierta longitud, siempre que se despliegue con vLLM y `--enable-lora`.
- Prototipado de pipelines de function calling: al haber sido entrenado sobre turnos de agente, puede integrarse en entornos que requieran llamadas a herramientas encadenadas, aunque requiere validación empírica previa a producción.
- Estudio de sobreajuste y memorización: la caída de la pérdida hasta 0,027 en la época 6 permite analizar empíricamente el punto en que la destilación pasa de generalizar a memorizar, comparando las carpetas `epoch-1`, `epoch-2`, `epoch-4` y `epoch-6`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las evaluaciones de desalineación (StrongREJECT, XSTest, CoCoNot, MASK, agentic misalignment, con 5 muestras por prompt y juez local Llama-3.3-70B) están en curso y que los resultados se añadirán a la model card.

## Requisitos de hardware

- El adaptador LoRA ocupa 14,9 GB en total (cuatro carpetas de checkpoints). Cada carpeta individual es un subconjunto de ese tamaño; el tamaño exacto por época no se detalla.
- Para inferencia hay que cargar el modelo base `Qwen/Qwen3.8-27B` completo, por lo que los requisitos reales de VRAM vienen determinados por el base, no por el adaptador. La información disponible no especifica la VRAM necesaria.
- El entrenamiento se realizó en 4 GPUs con batch efectivo 16 y bf16, lo que da una referencia mínima del hardware usado (modelo no especificado).
- Despliegue recomendado por el autor: vLLM con `--enable-lora --max-lora-rank 128 --reasoning-parser qwen3` y desactivación de visión; alternativa con `AutoModelForCausalLM.from_pretrained` y `peft`.
- Compatibilidad con GPU de consumo: no disponible en la información publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora | 0,93B entrenables (base 27B) | 32.768 tokens de entrenamiento | LoRA PEFT sobre Qwen3.8-27B | no disponible | Hugging Face, 0 descargas |
| ot-distill-qwen3-8b-new-data-v1-luna-6ep-lora | no disponible (base 8B) | no disponible | LoRA PEFT sobre Qwen3-8B | no disponible | Hugging Face |
| ot-distill-qwen3-8b-new-data-v1-luna-lora (3 épocas) | no disponible (base 8B) | no disponible | LoRA PEFT sobre Qwen3-8B | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | Transformer híbrido con torre de visión | no disponible | Hugging Face |

Los dos adaptadores de 8B citados por el autor son las alternativas más directas, ya que comparten dataset y profesor. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base Qwen3.8-27B y la del adaptador antes de cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al base ni frente al profesor; las evaluaciones de seguridad están pendientes.
- Riesgo de memorización: la pérdida media de 0,027 en la época 6 indica que el adaptador ha aprendido casi literalmente el conjunto de entrenamiento, lo que puede degradar la generalización fuera de OpenThoughts-Agent-SFT-3.16K.
- Sesgos: no documentados. Al destilar de un profesor propietario ("GPT-6 Luna") cuyas características no se detallan, los sesgos del profesor pueden transferirse al estudiante.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas: no declarados; no hay garantía de comportamiento multilingüe más allá del que herede del base.
- Contexto limitado a 32.768 tokens durante el entrenamiento; secuencias más largas no han sido vistas en la fase de adaptación.
- La torre de visión del base no se entrena y el autor recomienda desactivarla; no debe esperarse capacidad multimodal.
- Solo 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.
- El adaptador depende de la arquitectura exacta de Qwen3.8-27B; no es portable a otros modelos sin reentrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora
- Dataset de destilación: https://huggingface.co/datasets/helloelwin/ot-distill-gpt-6-luna-3.16k-sft
- Adaptador Qwen3-8B, 6 épocas: https://huggingface.co/helloelwin/ot-distill-qwen3-8b-new-data-v1-luna-6ep-lora
- Adaptador Qwen3-8B, 3 épocas: https://huggingface.co/helloelwin/ot-distill-qwen3-8b-new-data-v1-luna-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
