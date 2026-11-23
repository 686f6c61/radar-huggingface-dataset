# CharlieBT/kd31-skillpack-s3

## Resumen

kd31-skillpack-s3 es un modelo derivado mediante fine-tuning de MachinePulseAI/karpo-decision-31B, un modelo base de aproximadamente 31.273 millones de parámetros (31,27 B). Lo publica el usuario CharlieBT en Hugging Face bajo licencia Apache 2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones antes de descargarlo. El repositorio ocupa 62,6 GB en safetensors y se distribuye con la librería transformers.

La ficha del modelo lo etiqueta simultáneamente como `image-text-to-text` y `text-classification`, con pipeline declarado de clasificación de texto, aunque la arquitectura de referencia (gemma4) sugiere un transformer multimodal. Esta ambigüedad en las etiquetas, junto con la ausencia de documentación técnica publicada, hace que la información verificable sea muy limitada.

El interés actual del modelo es acotado: se trata de un fine-tuning de un base poco conocido (MachinePulseAI/karpo-decision-31B), sin descargas ni likes en el momento de la consulta y sin benchmarks publicados. Resulta relevante únicamente como punto de partida para quien quiera evaluar el linaje karpo-decision o experimentar con un ajuste de clasificación sobre una base de 31 B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia gemma4, segun tags); multimodal image-text-to-text segun tags |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tags del repositorio indican `gemma4` como arquitectura de referencia y `image-text-to-text` como tarea, lo que apunta a un transformer multimodal con torre de visión y decoder de lenguaje. El pipeline declarado, sin embargo, es `text-classification`, lo que sugiere que el fine-tuning ha repurposed la cabeza del modelo para una tarea de clasificación (posiblemente sobre representaciones textuales o multimodales). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada.

El modelo base es MachinePulseAI/karpo-decision-31B, del que no se aportan detalles en la información disponible. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos SSM. Tampoco se especifica si el fine-tuning congela capas, si usa LoRA o si entrena todos los parámetros; el tamaño del repo (62,6 GB) es coherente con pesos completos en fp16/bf16 para 31 B de parámetros, pero no confirma la estrategia de ajuste.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la capacidad principal esperada es etiquetado de secuencias.
- Procesamiento image-text-to-text: los tags indican entrada conjunta de imagen y texto, aunque no se detalla la tarea concreta (VQA, captioning, clasificación multimodal).
- Generación de texto: no confirmada explícitamente; al derivar de un modelo de lenguaje de 31 B es plausible, pero no está documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo thinking, visión o audio: visión posible por el tag image-text-to-text; audio no disponible.

## Casos de uso

- Clasificación de documentos multimodales: usar el pipeline `text-classification` para etiquetar pares imagen-texto (por ejemplo, tickets con captura adjunta) aprovechando la base de 31 B para representaciones ricas.
- Moderación de contenido con contexto visual: clasificar publicaciones que combinan texto e imagen en una sola pasada, si el ajuste se orientó a esa tarea.
- Enrutamiento de solicitudes en pipelines internos: emplear el modelo como clasificador de intención sobre texto de entrada antes de derivar a modelos generativos más ligeros.
- Etiquetado de datasets a escala: generar etiquetas automáticas sobre corpus propios para preentrenar o evaluar otros modelos, dado el tamaño del base.
- Investigación sobre fine-tuning de bases de 31 B: servir como referencia para estudiar cómo un ajuste de clasificación modifica las representaciones de un modelo multimodal grande.
- Evaluación comparativa de linajes: usar karpo-decision-31B y este skillpack como pareja base/ajustado en experimentos controlados de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan 70-80 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 31-35 GB; en 4 bits, alrededor de 16-18 GB (no se publican versiones cuantizadas, habría que generarlas).
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 40-48 GB (A6000, L40S) con tensor parallelism.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) en precisión completa; solo sería viable con cuantización agresiva a 4 bits y contexto corto, generando los pesos uno mismo.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura y requerirían validación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieBT/kd31-skillpack-s3 | 31,27 B | no disponible | text-classification / image-text-to-text | Apache 2.0 | gated, 0 descargas |
| MachinePulseAI/karpo-decision-31B (base) | 31 B (aprox.) | no disponible | no disponible | no disponible | no disponible |
| Gemma 2 27B (referencia de familia) | 27 B | 8K | generacion de texto | Gemma license | publica |
| Qwen2.5-VL 32B (referencia multimodal) | ~32 B | 128K | image-text-to-text | Apache 2.0 | publica |

La comparativa con Gemma 2 27B y Qwen2.5-VL 32B se ofrece solo como referencia de categoría; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card con detalles de entrenamiento, datos ni evaluación.
- Ambigüedad de tarea: los tags mezclan `image-text-to-text` y `text-classification` con pipeline de clasificación, lo que puede provocar un uso incorrecto.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.
- Riesgo de alucinación: no evaluado; si se usa para generación, sin datos de alineación no puede descartarse.
- Idiomas no declarados: no se puede asumir cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base karpo-decision-31B podría tener condiciones adicionales no reflejadas; conviene verificar su licencia antes de producción.
- Tamaño de 62,6 GB: inviable en hardware de consumo sin cuantización propia y sin garantía de que la arquitectura sea compatible con herramientas de cuantización estándar.
- Sin benchmarks: no se puede recomendar para producción sin una evaluación interna previa.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-skillpack-s3
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
