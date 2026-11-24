# Jakevin/clef-flash-mixed-vision-GGUF

## Resumen

Clef-Flash mixed-vision-GGUF es una cuantización post-entrenamiento no oficial de Cloudflare/clef-flash, publicada por el usuario Jakevin. El modelo base es un transformer de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) que combina un backbone de texto con un proyector visual, orientado a tareas de clasificación estructurada y decisión más que a generación de texto libre. Esta variante concreta empaqueta el backbone de texto en precisión mixta (3,30 GB) junto con un proyector visual f16 (0,92 GB), sumando unos 4,2 GB de descarga total frente a los 19,06 GB de la release original en bf16.

La relevancia de esta ficha radica en que ilustra una técnica de cuantización poco habitual: asignación por tensor basada en sensibilidad KL medida, resuelta mediante un problema de mochila (knapsack) que elige entre siete tipos ggml distintos (IQ2_XXS, IQ2_S, Q2_K, IQ3_XXS, Q3_K, Q4_K y Q8_0). El autor reporta una retención del 99,5% y del 98,1% de la precisión bf16 en dos suites de desarrollo privadas, lo que sugiere que la compresión agresiva preserva buena parte de la capacidad del modelo original en las tareas evaluadas.

Es importante subrayar que se trata de una conversión comunitaria, no avalada por Cloudflare ni por el equipo de Qwen, y que el propio autor advierte de que llama.cpp por sí solo no reproduce las decisiones de Clef: la cabeza de clasificación con esquema conjunto se ejecuta en Python sobre los estados ocultos finales del backbone. El modelo se distribuye bajo licencia Apache-2.0, igual que el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto Qwen3.5 (`general.architecture` = `qwen35`) y proyector visual CLIP (`qwen3vl_merger`, `projection_dim` 4096) |
| Parametros totales | 8.953.803.264 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta por tensor: IQ2_XXS (68 tensores), IQ2_S (23), IQ3_XXS (35), Q2_K (16), Q3_K (13), Q4_K (36), Q8_0 (11), BF16 (48), F32 (177); sin formatos ternarios (TQ1_0/TQ2_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (backbone de texto `clef-flash-mkl-3.30GB.gguf` + proyector visual `mmproj-Cloudflare_clef-flash-f16.gguf`) |

## Arquitectura y entrenamiento

El backbone de texto sigue la arquitectura Qwen3.5, etiquetada como `qwen35` en los metadatos del GGUF. La receta de cuantización parte de la revisión `17f0b0ad64efb65d273590632833508766b2aae6` de Cloudflare/clef-flash y aplica una asignación de tipos ggml por tensor guiada por sensibilidad KL medida, resuelta con un algoritmo de mochila. El resultado se materializa con `llama-quantize --tensor-type` usando una imatrix propia; los ficheros `alloc/selection.json` y `alloc/tensor-types.txt` documentan la selección. Las normas, convoluciones y parámetros SSM (`ssm_alpha`, `ssm_beta`) quedan sin cuantizar (F32 y BF16 respectivamente), y `token_embd` se fija en IQ3_XXS porque IQ2_XXS exige una imatrix que el cuantizador no pasa para el embedding.

El componente visual es un proyector separado de 334 tensores en f16, sin capas deepstack, procedente de bartowski. El procesador de Cloudflare expande una imagen de 224×224 a 64 tokens `<|image_pad|>` (id 248056) con `image_grid_thw` `[1, 16, 16]`; el script `hsdump` fuerza `image_min_tokens=64` e `image_max_tokens=16384` para alinear el recuento con el procesador de Hugging Face, abortando si hay discrepancia. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Clasificación estructurada y toma de decisiones mediante una cabeza de esquema conjunto que se ejecuta en Python sobre los estados ocultos finales del backbone.
- Procesamiento de imagen: entrada visual a través del proyector mmproj, verificada con imágenes sintéticas de campos de color sólido y formas geométricas.
- Generación de texto a través del backbone Qwen3.5 subyacente, si bien el autor advierte que llama.cpp por sí solo no produce las decisiones de Clef.
- Soporte de salida estructurada (tag `structured-output`).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de documentos con salida estructurada: el modelo puede recibir texto y devolver una decisión conforme a un esquema predefinido, aprovechando la cabeza de clasificación que opera sobre los estados ocultos finales. Es adecuado porque su diseño está orientado explícitamente a tareas de decisión y clasificación.
- Moderación de contenido con criterios compuestos: la cabeza de esquema conjunto permite mapear una entrada a múltiples etiquetas o decisiones simultáneas, lo que encaja con políticas de moderación que combinan varias dimensiones.
- Enrutamiento y triaje en pipelines de atención al cliente: con solo 3,30 GB de backbone, puede desplegarse en infraestructura modesta para clasificar consultas entrantes y derivarlas al servicio adecuado.
- Análisis de imágenes simples en entornos con recursos limitados: el proyector visual f16 de 0,92 GB permite procesar imágenes de 224×224 en configuraciones de poca VRAM, útil para verificación de color, presencia de formas o controles de calidad visual básicos.
- Extracción de campos en formularios o documentos escaneados: combinando la entrada visual y la salida estructurada, puede emplearse para validar la presencia de elementos gráficos o etiquetas en imágenes de documentos.
- Despliegue en local con llama.cpp: al estar en formato GGUF y pesar unos 4,2 GB en total, es viable ejecutarlo en estaciones de trabajo sin GPU dedicada de gama alta, lo que facilita prototipado y pruebas de integración.
- Evaluación comparativa de técnicas de cuantización: sirve como caso de estudio reproducible de asignación por tensor basada en KL medida, útil para investigadores que analicen el impacto de la compresión agresiva en tareas de clasificación.

## Benchmarks y rendimiento

Los datos disponibles provienen de particiones de desarrollo privadas del autor (kev), con una sola semilla y sin intervalos de confianza. No son los números públicos de Decision Index ni Typesafe.

| Suite | n (clean) | bf16 acc | Este modelo | Retención |
|---|---:|---:|---:|---:|
| decision-v7 | 1264 | 0.8861 | 0.8813 | 99,5% |
| transfer-v9 | 1046 | 0.8011 | 0.7859 | 98,1% |

| Suite | Brier | NLL | ECE |
|---|---:|---:|---:|
| decision-v7 | 0.1755 | 0.3382 | 0.0278 |
| transfer-v9 | 0.3061 | 0.6042 | 0.0421 |

El autor advierte que decision-v7 puede ser optimista, ya que tanto la imatrix como la asignación KL usaron registros de esa suite (128 registros de calibración, semilla 1234, y los primeros 32 de ese sorteo con 10.383 tokens para la KL por tensor). transfer-v9 no se empleó para calibración. La suma de valores KL por tensor usados por el knapsack (no una KL del modelo) es 0,009015. En consistencia de texto con el GGUF solo-texto, los primeros 100 registros de decision-v7 coincidieron 100/100 filas, con máximo |Δp| de 0 y 0 cambios de argmax.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La verificación visual se limita a 6 pruebas sintéticas de cableado; no se ha evaluado la precisión con imágenes reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de texto ocupa 3,30 GB y el proyector visual 0,92 GB, por lo que la carga de pesos ronda los 4,2 GB; el consumo real dependerá del contexto y del runtime.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, por tamaño de pesos; la información no especifica modelos concretos de GPU de consumo.
- Opciones de despliegue: llama.cpp (formato GGUF nativo) y scripts propios del autor (`hsdump`, `run_clef_gguf.py`). vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jakevin/clef-flash-mixed-vision-GGUF | 8,95 B (backbone ~3,30 GB cuantizado) | no disponible | Apache-2.0 | GGUF + mmproj | Cuantización mixta comunitaria con visión |
| Cloudflare/clef-flash | 8,95 B | no disponible | Apache-2.0 | bf16 (19,06 GB) | Modelo base original, incluye cabeza de clasificación |
| Jakevin/clef-flash-mixed-GGUF | 8,95 B | no disponible | Apache-2.0 | GGUF (solo texto) | Mismo backbone sin proyector visual |
| Jakevin/clef-flash-ternary-vision-mlx | no disponible | no disponible | no disponible | MLX | Variante ternaria con visión para MLX, usada como referencia en la verificación visual |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de las suites privadas del autor.

## Limitaciones y advertencias

- Cuantización no oficial: no está avalada por Cloudflare ni por el equipo de Qwen; el autor lo indica explícitamente.
- llama.cpp por sí solo no reproduce las decisiones de Clef: la cabeza de esquema conjunto requiere ejecución en Python sobre los estados ocultos finales, y las filas de opciones provienen del `lm_head` bf16 original.
- El GGUF de texto se etiqueta como `qwen35` y no como arquitectura `clef`, porque el grafo `clef` de llama.cpp no exporta `t_h_nextn`; además, `general.name` es `Snap Text` por el nombre del directorio de conversión.
- `output.weight` está fijado en Q2_K y la cabeza de clasificación no lo lee.
- La verificación visual es solo de cableado (6 pruebas sintéticas); no se ha evaluado la precisión con imágenes reales ni la del modelo original en bf16.
- Los benchmarks provienen de particiones privadas con una sola semilla, sin intervalos de confianza, y decision-v7 puede estar sesgada al haberse usado para calibración.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base conserva su propia licencia.
- El conversor `ClefVisionModel` de llama.cpp lanza `NotImplementedError` según la model card, lo que puede afectar a flujos de conversión estándar.
- El contexto máximo no está documentado, lo que dificulta planificar despliegues con entradas largas.

## Enlaces

- [Hugging Face: Jakevin/clef-flash-mixed-vision-GGUF](https://huggingface.co/Jakevin/clef-flash-mixed-vision-GGUF)
- [Modelo base: Cloudflare/clef-flash](https://huggingface.co/Cloudflare/clef-flash)
- [Variante solo texto: Jakevin/clef-flash-mixed-GGUF](https://huggingface.co/Jakevin/clef-flash-mixed-GGUF)
- [Variante ternaria con visión para MLX: Jakevin/clef-flash-ternary-vision-mlx](https://huggingface.co/Jakevin/clef-flash-ternary-vision-mlx)
- [Issue de llama.cpp referenciada: ggml-org/llama.cpp#29622](https://github.com/ggml-org/llama.cpp/issues/29622)
