# hhj-ai/Evidence-RL-9B

## Resumen

Evidence-RL-9B es un modelo de lenguaje y visión (VLM) de 9.409.813.744 parámetros desarrollado por el equipo de investigación hhj-ai, presentado como checkpoint oficial del artículo "Evidence-RL: Towards Evidence-intensive Visual Reasoning" (NeurIPS 2026). Se construye sobre Qwen/Qwen3.5-9B mediante post-entrenamiento con refuerzo (GRPO) y una recompensa novedosa denominada Counterfactual Evidence Disentanglement (CED), diseñada para que las respuestas del modelo dependan causalmente de la región visual relevante en lugar de apoyarse en prioris del lenguaje.

El problema que aborda es el sesgo de atajo: los VLM tienden a responder a partir de lo que "suelen" ver en el dataset y no de lo que realmente aparece en la imagen. CED identifica una región de evidencia centrada en el objeto, la neutraliza en el espacio de características (sustitución por la media) y mide la caída de log-verosimilitud de la respuesta, comparándola con regiones no-evidencia emparejadas. Las respuestas que sobreviven sin mirar la región correcta reciben menor recompensa.

El modelo mantiene la arquitectura transformer multimodal de Qwen3.5-9B, se distribuye con licencia Apache 2.0 y está disponible en formato safetensors (18,8 GB de repositorio), con cuantizaciones GGUF de terceros (mradermacher). Su relevancia actual radica en que reduce alucinaciones visuales sin anotaciones específicas por pregunta ni coste adicional en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), base Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bfloat16; GGUF de terceros (mradermacher/Evidence-RL-9B-GGUF) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (terceros) |

## Arquitectura y entrenamiento

Evidence-RL-9B parte de Qwen/Qwen3.5-9B (y Qwen/Qwen3.5-9B-Base) y conserva su arquitectura transformer multimodal para entrada imagen-texto y salida de texto. El post-entrenamiento emplea Gated GRPO con la recompensa Answer-level Counterfactual Evidence Disentanglement (Answer-CED): durante el RL se localiza una región de evidencia centrada en el objeto, se neutraliza en el espacio de características mediante sustitución por la media y se mide la caída de log-verosimilitud de la respuesta; esa caída se compara con la de regiones no-evidencia emparejadas. Las respuestas cuya corrección depende causalmente de la región correcta obtienen mayor recompensa, mientras que las que se mantienen sin mirar dicha región se penalizan.

La innovación clave es que la recompensa utiliza únicamente propuestas débiles a nivel de objeto, no requiere anotaciones de región específicas por pregunta y no añade sobrecoste en tiempo de inferencia. El artículo reporta mejoras consistentes en nueve benchmarks (conteo, razonamiento espacial, detección de alucinaciones, percepción fina y razonamiento multimodal general) y sobre cuatro backbones distintos, con las ganancias mayores en tareas de percepción intensiva. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto e imagen-texto a texto (pipeline image-text-to-text) con razonamiento multimodal.
- Razonamiento visual basado en evidencia: respuestas ancladas a regiones concretas de la imagen.
- Conteo de objetos y razonamiento espacial.
- Percepción fina y detección de detalles contraintuitivos (por ejemplo, objetos incompletos o alterados).
- Reducción de alucinaciones visuales mediante grounding contrafactual.
- Comprensión de regiones de objeto (object-region) y evidencia visual localizada.
- Conversación multi-turno (tag "conversational").
- Idiomas: inglés (único idioma declarado).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Control de calidad visual en inspección industrial: el modelo puede verificar si una pieza presenta un defecto concreto (un brazo de gafas ausente, un tornillo faltante) sin dejarse llevar por la apariencia habitual del objeto, gracias al entrenamiento con evidencia contrafactual.
- Conteo y auditoría de inventario a partir de fotografías: útil en logística o retail para contar unidades visibles en estanterías o palés, donde los atajos de lenguaje producen errores sistemáticos.
- Moderación y verificación de contenido visual: detección de elementos concretos en imágenes (señalética, objetos prohibidos) con menor tasa de alucinación que un VLM convencional.
- Asistencia a personas con discapacidad visual: descripción precisa de escenas que enfatiza detalles reales (número de ruedas, estado de un objeto) en lugar de expectativas previas.
- Análisis de imágenes médicas o científicas de apoyo: razonamiento sobre regiones específicas de la imagen donde la dependencia causal de la evidencia es crítica, siempre con supervisión humana.
- Evaluación de modelos y benchmarking interno: servir como referencia de VLM con grounding reforzado para comparar tasas de alucinación en pipelines propios.
- Razonamiento espacial en robótica o visión embebida: interpretación de relaciones espaciales entre objetos para tareas de manipulación o navegación asistida.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica mejoras consistentes en nueve benchmarks (conteo, razonamiento espacial, detección de alucinaciones, percepción fina y razonamiento multimodal general) y sobre cuatro backbones, con las mayores ganancias en tareas de percepción intensiva, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18-19 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda 24 GB o más.
- Cuantización GGUF de terceros (mradermacher/Evidence-RL-9B-GGUF): permite reducir la huella a rangos aproximados de 5-6 GB (Q4) y 9-10 GB (Q8), según el quant elegido.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) suficiente para bfloat16 en una sola GPU con batches pequeños.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB; en GPUs de 12-16 GB requiere cuantización GGUF.
- Opciones de despliegue: transformers (AutoModelForImageTextToText y AutoProcessor), llama.cpp/Ollama vía GGUF de terceros; vLLM y TGI no confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Evidence-RL-9B | 9.409.813.744 | no disponible | Apache 2.0 | VLM con post-entrenamiento GRPO y recompensa CED |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible en la información | Modelo base sin post-entrenamiento de evidencia |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible | no disponible en la información | Checkpoint base pre-entrenado |

No se dispone de datos de rendimiento comparativo ni de otros VLM de tamaño similar en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está especificada, lo que dificulta planificar cargas con documentos o imágenes múltiples extensas.
- Persiste riesgo de alucinación, aunque el entrenamiento está orientado a reducirlo; no debe usarse en dominios críticos sin verificación humana.
- El método CED depende de propuestas débiles a nivel de objeto; objetos pequeños, ocluidos o ambiguos pueden degradar el grounding.
- No hay información sobre tool calling, agentes ni modo de razonamiento explícito, lo que limita su uso en pipelines agénticos sin validación previa.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de las cuantizaciones de terceros.
- El repositorio tiene pocas descargas (67) y likes (1), por lo que la validación comunitaria es aún escasa.
- No se han publicado cifras de benchmarks en la información disponible; cualquier comparación de rendimiento debe hacerse mediante evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhj-ai/Evidence-RL-9B
- Cuantizaciones GGUF de terceros: https://huggingface.co/mradermacher/Evidence-RL-9B-GGUF
- Paper (arXiv): https://arxiv.org/abs/2608.08021
- Código: https://github.com/evidencerl/code
- Página del proyecto: https://evidencerl.github.io
