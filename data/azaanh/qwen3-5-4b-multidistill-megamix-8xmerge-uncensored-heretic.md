# Azaanh/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic

## Resumen

Azaanh/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic es un modelo derivado de la familia Qwen3.5, de 4.539 millones de parámetros (4,54 B), publicado por el usuario Azaanh en Hugging Face. No se trata de un entrenamiento desde cero, sino de una versión "descensurada" (decensored) del checkpoint xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge, obtenida aplicando la herramienta Heretic v2.0.0.dev0, que realiza una ablación de direcciones de activación (Arbitrary-Rank Ablation) para reducir la tasa de rechazos del modelo base.

El modelo original es a su vez un merge lineal ponderado de tres checkpoints basados en Qwen3.5-4B: una rama con linaje de razonamiento destilado de Claude (Claude-3xMerge-Jackrong, peso 1.0), una variante Heretic de DavidAU (peso 0.8) y una rama de multi-destilación (MultiDistill-3xMerge, peso 0.6). El resultado es un modelo multimodal de tipo image-text-to-text (según los tags del repositorio) orientado a generación de texto, razonamiento con cadenas de pensamiento y flujos agénticos.

Su relevancia actual es doble: por un lado, documenta una receta reproducible de merge y ablación sobre una base Qwen3.5 de tamaño compacto (apta para GPU de consumo); por otro, ejemplifica la práctica de publicar variantes "abliterated" con métricas de rechazo y divergencia KL explícitas, lo que permite evaluar el coste de la descensuración de forma cuantitativa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 15 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`); multimodal image-text-to-text según tags |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 9,3 GB |
| Modelo base | xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge |
| Pipeline | text-generation |
| Método de descensuración | Heretic v2.0.0.dev0, Arbitrary-Rank Ablation (ARA) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original: un transformer decoder-only de 4,54 B de parámetros. Sobre esa base se aplicó un merge lineal ponderado de tres checkpoints (Claude-3xMerge-Jackrong con peso 1.0, Heretic-2xMerge-DavidAU con peso 0.8 y MultiDistill-3xMerge con peso 0.6), combinando linajes de razonamiento destilado, datos derivados de Claude y una variante ya descensurada. Posteriormente, la versión aquí descrita aplica Heretic v2.0.0.dev0, que realiza una ablación de rango arbitrario (ARA) sobre las capas 2 a 20, con `preserve_good_behavior_weight` de 0,6444, `steer_bad_behavior_weight` de 0,0004, `overcorrect_relative_weight` de 0,9465 y `neighbor_count` de 11.

Los datos de entrenamiento no están documentados de forma directa para este checkpoint: el autor remite a los linajes de los modelos fuente. Los datasets citados en los metadatos del repositorio son nohurry/Opus-4.6-Reasoning-3000x-filtered, Jackrong/Qwen3.5-reasoning-700x, Roman1111111/claude-opus-4.6-10000x, Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. La propia model card advierte que la correspondencia exacta entre datasets y checkpoints fuente no está establecida y que parte de esos datos son referencias de procedencia, no necesariamente datos de entrenamiento supervisado del merge final. Se documenta el uso de bloques `<think>...</think>` para el razonamiento en el linaje Jackrong, pero no se especifican volúmenes de tokens, composición exacta del dataset ni si hubo RLHF o DPO en la receta final.

La innovación técnica destacable es la reproducibilidad: el repositorio incluye un directorio `reproduce` con instrucciones para replicar la ablación, y la model card publica métricas de control (tasa de rechazos y divergencia KL) que permiten auditar el efecto de la descensuración.

## Capacidades

- Generación de texto conversacional e instrucciones generales, heredadas de la base Qwen3.5-4B.
- Razonamiento con cadena de pensamiento explícita, con formato `<think>...</think>` según el linaje de destilación documentado.
- Razonamiento matemático, lógico y analítico, según los casos de uso declarados por el autor (inferidos del linaje, no medidos de forma independiente).
- Preguntas y explicaciones técnicas de código.
- Respuestas estructuradas de varios pasos.
- Tareas orientadas a agentes y flujos de uso de herramientas (tool calling) cuando el entorno de inferencia lo soporta; el autor lo condiciona explícitamente a esa compatibilidad.
- Procesamiento de imagen y texto (tag `image-text-to-text`), aunque no se detallan las capacidades de visión en la model card.
- Comportamiento descensurado: la model card reporta 3 rechazos de 100 frente a 95 de 100 del modelo original.
- Multilingüismo: no disponible (no se declaran idiomas).

## Casos de uso

- Conversación general e instrucciones: el modelo puede gestionar diálogos multi-turno y seguir instrucciones complejas gracias a su base Qwen3.5-4B, con un tamaño que permite desplegarlo en una sola GPU.
- Razonamiento paso a paso: útil para tareas de análisis donde interesa exponer el proceso (`<think>`) antes de la respuesta final, como diagnóstico de errores o planificación.
- Asistencia en código: explicación de fragmentos, generación de parches y respuestas técnicas, aprovechando el linaje de destilación de datos de Claude.
- Problemas matemáticos y lógicos: resolución de ejercicios y verificación de pasos intermedios, adecuado por el formato de razonamiento explícito.
- Flujos agénticos con herramientas: integración en pipelines donde el modelo debe decidir qué función invocar y encadenar varias llamadas, siempre que el runtime (por ejemplo, TGI o vLLM) soporte tool calling.
- Investigación sobre alineación y descensuración: el checkpoint sirve como caso de estudio reproducible para medir el efecto de ARA sobre la tasa de rechazos y la divergencia KL, comparándolo con el modelo base.
- Prototipado de bajo coste: con 4,54 B de parámetros y pesos safetensors de 9,3 GB, es viable para experimentación local en una GPU de consumo con cuantización, aunque el repositorio no publique variantes GGUF.
- Evaluación de merges: útil para estudiar cómo se combinan comportamientos de tres linajes distintos (razonamiento, datos Claude y variante Heretic) en un único checkpoint.

## Benchmarks y rendimiento

La model card solo publica métricas de control de la descensuración, no benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

| Métrica | Este modelo | Modelo original (xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge) |
|---|---|---|
| Rechazos | 3/100 | 95/100 |
| Divergencia KL | 0,0883 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen amplio.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización, en tarjetas de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y, previsiblemente, vLLM; no se documentan conversiones a GGUF ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Azaanh/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic | 4,54 B | no disponible | apache-2.0 | Variante descensurada con Heretic; 3/100 rechazos |
| xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge | 4,54 B (misma base) | no disponible | no disponible | Modelo original del merge; 95/100 rechazos |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled | 4 B (familia Qwen3.5-4B) | no disponible | no disponible | SFT con datos de razonamiento de Opus 4.6 y ejemplos de Qwen3.5 |
| DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 4 B (familia Qwen3.5-4B) | no disponible | no disponible | Linaje Heretic con fine-tuning sobre colección Claude-4.6-OS |

Los datos de contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada, por lo que la comparación se limita a tamaño, licencia y linaje.

## Limitaciones y advertencias

- La descensuración reduce los rechazos de 95/100 a 3/100, lo que implica que el modelo puede generar contenido que el original bloquearía; requiere filtros y políticas de uso en producción.
- La divergencia KL de 0,0883 respecto al modelo original indica un cambio medible en la distribución de salida; no es una modificación neutra.
- No se han publicado benchmarks de calidad (razonamiento, código, matemáticas), por lo que el rendimiento real es desconocido más allá de las métricas de rechazo.
- La model card admite que los casos de uso son inferidos del linaje de los modelos fuente y no mediciones independientes del checkpoint final.
- La correspondencia entre datasets y checkpoints fuente no está completamente establecida; parte de los datos citados son referencias de procedencia.
- No se declaran idiomas soportados, longitud de contexto ni tipos de cuantización; la ausencia de GGUF limita el despliegue en entornos de bajo consumo sin conversión manual.
- Riesgo de alucinación inherente a un modelo de 4,54 B con destilación de razonamiento; no hay evaluaciones publicadas de fidelidad.
- Licencia apache-2.0 permite uso comercial, pero la naturaleza descensurada puede entrar en conflicto con políticas de plataformas y con obligaciones regulatorias sobre contenido.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la fecha de creación (noviembre de 2026) indica que es un artefacto muy reciente.
- El tag `image-text-to-text` sugiere capacidades de visión, pero la model card no las documenta ni las evalúa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Azaanh/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge
- Fuente 1 del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Fuente 2 del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-Heretic-2xMerge-DavidAU
- Fuente 3 del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge
- Checkpoint relacionado (Jackrong): https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled
- Checkpoint relacionado (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Heretic: https://heretic-project.org
- Dataset: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
