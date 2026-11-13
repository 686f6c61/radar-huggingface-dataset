# helloelwin/ot-distill-qwen38-27b-t9-6ep-lora

## Resumen

`ot-distill-qwen38-27b-t9-6ep-lora` es un conjunto de adaptadores LoRA para el modelo base Qwen/Qwen3.8-27B, desarrollados por el usuario helloelwin dentro del proyecto ot-distill. El propósito es destilar el comportamiento de un agente Terminus-2 impulsado por GLM 5.3 Flash (denominado T9 en el proyecto) sobre el conjunto de tareas OpenThoughts-Agent-SFT-3.16K, de modo que el modelo estudiante reproduzca trayectorias agénticas de alta calidad sin necesidad de invocar al profesor en producción.

El adaptador se entrena sobre 2.701 filas del dataset yixiaoh/OT-SFT-Data (configuración `T9-3.16k-sft-v0`), conservando cada turno `<think>` del asistente. Se publican cuatro carpetas correspondientes a distintos números de épocas (`epoch-1`, `epoch-2`, `epoch-4`, `epoch-6`), con 0,93B de parámetros entrenables sobre el modelo base. La relevancia actual reside en que permite obtener un modelo de 27B con capacidades agénticas y de razonamiento destiladas a partir de un profesor propietario, publicando únicamente los pesos del adaptador (11,2 GB) en lugar del modelo completo.

La información disponible es limitada: no se especifican licencia, idiomas soportados ni resultados de benchmarks finales (las evaluaciones de desalineación están en curso según la model card). Esta ficha refleja exclusivamente los datos publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal Gated DeltaNet (modelo base Qwen3.8), adaptador LoRA sobre capas de atención, MLP y proyecciones DeltaNet |
| Parametros totales | 27B (modelo base); adaptador LoRA de 0,93B parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (truncación usada en entrenamiento); contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16/safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer que incorpora proyecciones de atención lineal Gated DeltaNet además de la atención estándar. El LoRA tiene rango 128, alpha 256 y dropout 0,05, y se inserta en todas las capas lineales del modelo de texto: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, además de las proyecciones de la atención lineal DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`). El resultado son 0,93B de parámetros entrenables.

El entrenamiento destila trayectorias del agente Terminus-2 ejecutado con GLM 5.3 Flash (fp8, reasoning effort alto) sobre las 2.701 tareas del dataset, una fila por tarea y conservando cada turno `<think>`. Se usó una tasa de aprendizaje máxima de 3e-4 con decaimiento coseno, warmup del 3% (30 pasos), 6 épocas (1.014 pasos), batch efectivo de 16 (4 GPUs × acumulación 4), precisión bf16 y pérdida calculada en cada turno del asistente. Las secuencias se renderizaron con los marcadores `<|im_start|>`/`<|im_end|>` de Qwen3.8 en lugar de la plantilla de chat, truncando a 32.768 tokens (1.046 de 2.701 filas; 66,6M tokens por época). La pérdida media por época fue 0,951 / 0,847 / 0,694 / 0,486 / 0,281 / 0,159.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (`<think>`), heredado del formato de destilación.
- Ejecución de tareas agénticas multi-paso al estilo Terminus-2 (planificación, uso de herramientas, iteración sobre el entorno).
- Soporte de tool calling y function calling a través del parser de razonamiento `qwen3` en vLLM.
- Capacidades multilingües: no disponibles en la información publicada.
- Visión: el modelo base incluye una torre de visión, pero el adaptador se entrena solo sobre el modelo de texto y la configuración recomendada la desactiva (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- No se documentan capacidades de audio ni otras modalidades.

## Casos de uso

- Automatización de tareas agénticas de oficina: el adaptador reproduce trayectorias Terminus-2 sobre tareas OpenThoughts, adecuado para flujos de trabajo con múltiples pasos y uso de herramientas donde se requiere planificación explícita.
- Destilación de profesores propietarios: sirve como referencia para equipos que quieran sustituir llamadas a un modelo cerrado (GLM 5.3 Flash) por un modelo local de 27B con comportamiento similar en tareas agénticas.
- Investigación sobre razonamiento destilado: permite estudiar cómo varía el rendimiento entre las distintas épocas publicadas (`epoch-1`, `epoch-2`, `epoch-4`, `epoch-6`) y analizar la evolución de la pérdida frente a la calidad final.
- Evaluación de alineación y seguridad: el autor publica evaluaciones de desalineación (StrongREJECT, XSTest, CoCoNot, MASK) que convierten este adaptador en un caso de estudio para medir efectos secundarios de la destilación agéntica.
- Despliegue en pipelines de agentes con vLLM: la configuración documentada (`--enable-lora --max-lora-rank 128 --lora-modules`) permite servir el adaptador junto al modelo base en un servidor compatible con OpenAI.
- Comparación de profesores: junto con el adaptador gemelo entrenado sobre rollouts de GPT-6 Luna, permite comparar el efecto del profesor en el estudiante manteniendo receta y datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones de desalineación (StrongREJECT, XSTest, CoCoNot, MASK y agentic misalignment, con 5 muestras por prompt y juez local Llama-3.3-70B) están en ejecución y se añadirán posteriormente. El único dato numérico publicado es la pérdida por token en las filas de entrenamiento T9 a través de vLLM: 0,157 nats/token para el adaptador de la época 6 frente a 1,305 del modelo base.

## Requisitos de hardware

- VRAM estimada: el modelo base de 27B en bf16 requiere aproximadamente 54 GB solo para pesos; en cuantización de 8 bits unos 27 GB y en 4 bits unos 14-16 GB (estimación estándar, no publicada por el autor).
- GPU recomendadas: A100 80GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) solo con cuantización de 4 bits y contexto reducido.
- Cabe en GPU de consumo: sí, con cuantización agresiva (4 bits) en RTX 3090/4090 o superiores; el adaptador LoRA añade 0,93B parámetros (~1,9 GB en bf16).
- Despliegue: vLLM es la opción documentada por el autor, con `--enable-lora --max-lora-rank 128`, parser `qwen3` y desactivación de visión. También es compatible con `peft` sobre `AutoModelForImageTextToText`; para el modelo de texto puro es necesario renombrar las claves (`base_model.model.model.language_model.layers.` → `base_model.model.model.layers.`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ot-distill-qwen38-27b-t9-6ep-lora | 27B base + 0,93B LoRA | 32.768 (entrenamiento) | no disponible | Destilado de GLM 5.3 Flash, agéntico |
| helloelwin/ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora | 27B base + LoRA | no disponible | no disponible | Mismo estudiante y receta, profesor GPT-6 Luna |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | Modelo base sin destilación agéntica |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información publicada.

## Limitaciones y advertencias

- No se han publicado todavía los resultados de las evaluaciones de desalineación; el autor advierte de que están en curso, por lo que el comportamiento en seguridad no está verificado.
- Riesgo de alucinación inherente a la destilación de trayectorias de un profesor externo: el estudiante puede reproducir errores o atajos del profesor GLM 5.3 Flash.
- El adaptador se entrena solo sobre el modelo de texto; la torre de visión del modelo base no se utiliza y debe desactivarse en el despliegue.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de producción.
- El contexto de entrenamiento está truncado a 32.768 tokens y 1.046 de las 2.701 filas superan ese límite, por lo que tareas con contextos más largos pueden degradar el rendimiento.
- El adaptador usa nombres de clave de modelo completo (`language_model.layers`); cargarlo con `AutoModelForCausalLM` requiere renombrar las claves, lo que añade un paso manual propenso a errores.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del que herede el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-t9-6ep-lora
- Adaptador gemelo (GPT-6 Luna): https://huggingface.co/helloelwin/ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/yixiaoh/OT-SFT-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
