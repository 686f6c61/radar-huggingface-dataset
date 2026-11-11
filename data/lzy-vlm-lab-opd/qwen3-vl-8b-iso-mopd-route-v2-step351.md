# lzy-vlm-lab-opd/qwen3-vl-8b-iso-mopd-route-v2-step351

## Resumen

`qwen3-vl-8b-iso-mopd-route-v2-step351` es un checkpoint de investigación publicado por el usuario `lzy-vlm-lab-opd` en Hugging Face. Se trata de un ajuste fino multimodal del modelo base Qwen/Qwen3-VL-8B-Instruct, obtenido mediante un pipeline de destilación de múltiples profesores (MOPD, *Multi-Teacher On-Policy Distillation*) con enrutamiento por tarea. El checkpoint corresponde exactamente al paso 351 del *rollout* externo del experimento "route-v2", y se publica como inicialización del posterior experimento de RL (GRPO/DAPO/RSTG) del mismo autor.

El modelo conserva la arquitectura Qwen3-VL (transformer multimodal con torre de visión y decodificador de lenguaje) y los 8.767.123.696 parámetros del modelo base, empaquetados en BF16 (17,5 GB de repo, 17 shards safetensors). Es un modelo completo, no un adaptador LoRA, e incluye tokenizer, processor y plantilla de chat originales. Su interés es fundamentalmente de investigación: documenta un paso intermedio de un experimento de destilación con profesores especializados y no presenta una model card con benchmarks agregados ni datos de licencia o idiomas.

No se dispone de información sobre licencia, idiomas soportados, datos de evaluación o restricciones de uso comercial en la información proporcionada. La model card advierte explícitamente que los resultados de evaluación dependen del prompt, el presupuesto de salida y el protocolo de puntuación, y que no se reporta ningún agregado de protocolos mixtos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal: torre de visión + decodificador de lenguaje) |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (17 shards, 750 tensores BF16, 17.534.247.392 bytes de datos de tensor) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa mensajes de imagen y texto (`image-text-to-text`). El checkpoint publicado es el resultado de un proceso de destilación MOPD (*Multi-Teacher On-Policy Distillation*) con enrutamiento por tarea sobre tres profesores que comparten la misma base Qwen3-VL-8B-Instruct: Vero, VQA-OPSD-A seed42 step300 y RLSD/RLRT step150. El estudiante se inicializó mediante fusión ISO de esos tres profesores. El entrenamiento usó 15.000 prompts de MMFineReason y Cauldron durante tres épocas, terminando en el paso 351 de *rollout* externo.

El enrutamiento por tarea asigna geometría a Vero, álgebra/aritmética a RLSD y VQA de imágenes naturales, conteo y relaciones a OPSD; el resto de fuentes sigue el mapeo de tareas registrado. El prompt de sistema de entrenamiento pide razonamiento explícito en `<think>...</think>` y respuesta final en `<answer>...</answer>`, con formato de respuesta según la pregunta. No se usó *prefilling* automático de `<think>`: el entrenamiento empleó una cabecera de asistente simple. El checkpoint no incluye actualizaciones de las etapas posteriores de GRPO, DAPO o RSTG, ni corresponde al experimento separado ExpertAlign/MOPD-Router. No se incluyen datos de entrenamiento, estado del optimizador ni rutas privadas del sistema de ficheros.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen + texto) sobre la base Qwen3-VL.
- Razonamiento paso a paso en modo *thinking* explícito mediante etiquetas `<think>` y `<answer>`.
- Comprensión de imágenes naturales: VQA, conteo y relaciones visuales (profesor OPSD).
- Razonamiento geométrico (profesor Vero) y algebraico/aritmético (profesor RLSD), según el enrutamiento de tareas del entrenamiento.
- Conversación multi-turno (`conversational` en los tags del repo).
- Compatibilidad con *endpoints* (`endpoints_compatible`).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada (el formato `<think>`/`<answer>` sugiere razonamiento estructurado, pero no se documenta soporte de agentes).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en destilación multi-profesor: el checkpoint sirve como referencia reproducible del paso 351 de MOPD con enrutamiento por tarea, útil para comparar contra las etapas posteriores de RL del mismo autor.
- Evaluación de razonamiento geométrico: al haber sido destilado con el profesor Vero para geometría, puede emplearse en experimentos controlados de resolución de problemas geométricos con imágenes (diagramas, figuras).
- VQA sobre imágenes naturales: tareas de conteo, relaciones espaciales y preguntas abiertas sobre fotografías, aprovechando el profesor OPSD.
- Razonamiento aritmético y algebraico: resolución de problemas paso a paso con trazas `<think>` auditables, útil en entornos de investigación donde se necesita inspeccionar el razonamiento intermedio.
- Punto de partida para *fine-tuning* posterior: al ser un modelo completo en BF16 con tokenizer, processor y plantilla de chat incluidos, puede inicializar experimentos de RL o SFT propios.
- Reproducibilidad de pipelines multimodales: los ficheros `checkpoint_provenance.json` y `checksum_manifest.json` (con tamaños y SHA-256) permiten verificar la integridad del checkpoint en entornos de investigación.
- Análisis de formato de salida estructurado: estudio de cómo el modelo sigue el formato `<think>`/`<answer>` sin *prefilling*, relevante para diseñar prompts de evaluación consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación dependen del prompt, el presupuesto de salida y el protocolo de puntuación, y que no se reporta ningún agregado de protocolos mixtos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para inferencia cómoda con contexto moderado.
- Cuantización: no se documentan versiones GGUF/AWQ/GPTQ en el repo; para reducir VRAM habría que cuantizar el modelo uno mismo (por ejemplo, a 8 bits o 4 bits), con la pérdida de calidad correspondiente no evaluada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado; GPUs consumer de 16 GB requerirían cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en BF16 con gestión cuidadosa de memoria; en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `device_map="auto"` (método documentado en la model card). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada (el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-vl-8b-iso-mopd-route-v2-step351 | 8.767 M | no disponible | no disponible | Hugging Face (0 descargas) | Checkpoint de investigación MOPD paso 351 |
| Qwen/Qwen3-VL-8B-Instruct | 8B (aprox.) | no disponible | no disponible en esta ficha | Hugging Face (modelo base) | Modelo instructivo oficial del que deriva |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial permitido; hay que contactar con el autor o consultar la model card original antes de cualquier uso en producción.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe fuera de los idiomas presentes en los datos de destilación.
- Checkpoint intermedio de investigación: no incluye las etapas posteriores de GRPO, DAPO o RSTG, por lo que su rendimiento puede ser inferior al de los modelos finales del mismo autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas; la model card advierte de la dependencia del protocolo de evaluación.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información proporcionada; al derivar de Qwen3-VL-8B-Instruct y de datos de MMFineReason y Cauldron, hereda los sesgos de esas fuentes.
- Formato de salida dependiente del prompt: el modelo fue entrenado con una cabecera de asistente simple sin *prefilling* de `<think>`, por lo que el cumplimiento del formato puede variar según el prompt y el presupuesto de salida.
- Sin datos de entrenamiento ni estado del optimizador: no es posible reproducir el entrenamiento a partir del repo.
- Contexto máximo no documentado: no se puede planificar el uso con documentos o imágenes de gran extensión sin verificar la ventana real del modelo base.
- Repo con 0 descargas y 0 likes: sin validación comunitaria; conviene verificar los checksums (`checksum_manifest.json`) antes de usar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lzy-vlm-lab-opd/qwen3-vl-8b-iso-mopd-route-v2-step351
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper, blog, repositorio o demo del autor: no disponible en la información proporcionada.
