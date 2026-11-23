# helloelwin/ot-distill-qwen38-27b-t9-3ep-lora

## Resumen

`ot-distill-qwen38-27b-t9-3ep-lora` es un conjunto de adaptadores LoRA publicados por el usuario helloelwin sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un ajuste fino por destilación (distillation) cuyo objetivo es transferir el comportamiento de un agente "profesor" —T9, identificado en la model card como GLM 5.3 Flash servido por OpenRouter con proveedor Z.AI en fp8 y esfuerzo de razonamiento alto— a un modelo abierto de 27B. El dominio de destilación son trayectorias del agente Terminus-2 sobre las tareas del dataset OpenThoughts-Agent-SFT-3.16K (`yixiaoh/OT-SFT-Data`, configuración `T9-3.16k-sft-v0`, 2.701 filas).

El interés técnico del artefacto está en dos frentes: por un lado, es un ejemplo de destilación de trayectorias agénticas (no solo de respuestas finales) conservando los bloques `<think>` de cada turno del asistente; por otro, el recetario LoRA cubre no solo las proyecciones habituales de atención y MLP, sino también las proyecciones de la atención lineal Gated DeltaNet del modelo base, lo que indica que Qwen3.8-27B emplea una arquitectura híbrida. El resultado son 0,93B parámetros entrenables sobre un modelo de 27B.

La relevancia práctica es limitada pero específica: el adaptador está pensado para reproducir el estilo de resolución de tareas agénticas de un profesor propietario en un checkpoint abierto, con un coste de entrenamiento modesto (3 épocas, 507 pasos, 4 GPUs, bf16). No se han publicado evaluaciones del estudiante, por lo que su utilidad debe validarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer híbrido con atención lineal Gated DeltaNet; modelo base Qwen/Qwen3.8-27B |
| Parametros totales | 27B en el modelo base; 0,93B entrenables en el adaptador |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (truncación usada en entrenamiento); contexto nativo del base: no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA, `adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un modelo que, según los nombres de módulos citados en la model card, combina capas de atención estándar con proyecciones de atención lineal Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`). El LoRA tiene rango 128, alpha 256 y dropout 0,05, y se aplica a todas las capas lineales del modelo de texto: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y las cinco proyecciones de Gated DeltaNet. El entrenamiento usó pico de learning rate 3e-4 con decaimiento coseno durante 3 épocas tras un warmup del 3% (15 pasos), batch efectivo 16 (4 GPUs × acumulación 4), precisión bf16 y pérdida calculada en todos los turnos del asistente. Las secuencias se renderizaron con los marcadores `<|im_start|>`/`<|im_end|>` alrededor del texto literal del turno, sin plantilla de chat, y se truncaron a 32.768 tokens: 1.046 de las 2.701 filas superaron ese límite, con 66,6M tokens por época. La pérdida media por época fue 0,947 y 0,879 (parcial).

Los datos provienen de trayectorias del agente Terminus-2 generadas por el profesor T9 (GLM 5.3 Flash, fp8, reasoning effort high) sobre las tareas de OpenThoughts-Agent-SFT-3.16K, conservando cada bloque `<think>` de los turnos del asistente. El autor publica además una variante entrenada 6 épocas con la misma receta (`helloelwin/ot-distill-qwen38-27b-t9-6ep-lora`); esta versión solo acorta el schedule coseno a 3 épocas. No se ejecutaron evaluaciones del estudiante.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito, heredado de las trayectorias del profesor que conservan los bloques `<think>`.
- Ejecución de tareas agénticas multi-paso al estilo Terminus-2 (planificación, uso de herramientas de terminal/ficheros y verificación), que es el dominio exacto de destilación.
- Tool calling / function calling: presumiblemente soportado por el modelo base, aunque el adaptador no documenta un esquema específico.
- Razonamiento sobre trayectorias largas: el entrenamiento cubre secuencias de hasta 32.768 tokens.
- Capacidades multilingües: no documentadas para el adaptador.
- Capacidades de visión: el base incluye una torre de visión, pero el adaptador se entrena solo sobre el modelo de texto y la receta de vLLM desactiva imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`).

## Casos de uso

- Agentes de resolución de tareas en terminal: el adaptador reproduce el estilo de Terminus-2 sobre tareas de OpenThoughts-Agent, por lo que encaja en entornos de ejecución de comandos, edición de ficheros y comprobación de resultados con ciclos de varios turnos.
- Destilación de profesores propietarios a modelos abiertos: sirve como referencia de receta (rango 128, alpha 256, cobertura de Gated DeltaNet) para equipos que quieran transferir trayectorias agénticas de un modelo cerrado a un checkpoint abierto de 27B.
- Investigación en aprendizaje por imitación de agentes: al conservar los bloques `<think>`, permite estudiar cómo se destila el razonamiento intermedio y no solo la acción final.
- Evaluación comparativa de schedules de entrenamiento: la pareja 3 épocas / 6 épocas del mismo autor permite aislar el efecto de la duración del schedule coseno sobre el comportamiento agéntico.
- Despliegue con vLLM multi-LoRA: al usar los nombres de módulo del modelo completo, el adaptador se sirve directamente con `--enable-lora --max-lora-rank 128` junto al base, lo que facilita comparar varias variantes en un mismo servidor.
- Base para ajustes posteriores específicos de dominio: al ser un adaptador ligero (3,7 GB de repo), se puede componer con otros LoRA o continuar el entrenamiento con datos propios de un flujo agéntico concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evals were run for this student". Solo se reportan pérdidas de entrenamiento (0,947 en época 1 y 0,879 parcial en época 2).

## Requisitos de hardware

- VRAM para el adaptador: 3,7 GB de repo en safetensors; en inferencia se suma al peso del base.
- Modelo base en bf16: aproximadamente 54 GB de pesos, por lo que requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- Modelo base cuantizado: no se documentan cuantizaciones del adaptador; con el base en 8 bits o 4 bits cabría en GPUs consumer de 24 GB (RTX 4090) o 48 GB, pero la compatibilidad del LoRA con cuantización no está verificada en la información disponible.
- Despliegue recomendado por el autor: vLLM con `--enable-lora --max-lora-rank 128`, `--reasoning-parser qwen3` y `--limit-mm-per-prompt '{"image":0,"video":0}'`.
- Carga con PEFT: sobre el modelo completo con `AutoModelForImageTextToText` los pesos cargan tal cual; sobre el modelo de texto (`AutoModelForCausalLM`) hay que renombrar las claves eliminando el segmento `.language_model` antes de cargar.
- Entrenamiento: 4 GPUs en bf16 con batch efectivo 16 y 507 pasos para 3 épocas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ot-distill-qwen38-27b-t9-3ep-lora | 27B base / 0,93B entrenables | 32.768 (entrenamiento) | LoRA de destilación agéntica | no disponible | Hugging Face (0 descargas) |
| ot-distill-qwen38-27b-t9-6ep-lora | 27B base / 0,93B entrenables | 32.768 (entrenamiento) | LoRA de destilación agéntica, 6 épocas | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | 27B | no disponible | Modelo base híbrido con Gated DeltaNet | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han ejecutado evaluaciones: no hay evidencia publicada de que el adaptador mejore al base en ninguna tarea.
- El adaptador solo cubre el modelo de texto; la torre de visión del base queda fuera del entrenamiento y la receta de vLLM la desactiva.
- El truncamiento a 32.768 tokens afectó a 1.046 de 2.701 filas, de modo que parte de las trayectorias largas del profesor se entrenaron incompletas.
- El dominio es estrecho: trayectorias Terminus-2 sobre OpenThoughts-Agent; el comportamiento fuera de ese formato puede degradarse.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución, ni del adaptador ni del base.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe.
- Riesgo de alucinación y de imitar errores del profesor (GLM 5.3 Flash) sin mecanismo de verificación propio.
- El autor advierte de que los nombres de claves usan el esquema del modelo completo; cargarlos sobre el modelo de texto sin renombrar fallará.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-t9-3ep-lora
- Variante de 6 épocas: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-t9-6ep-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/yixiaoh/OT-SFT-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
