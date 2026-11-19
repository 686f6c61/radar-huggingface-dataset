# perplexity-ai/pplx-decider-v1.1-27b

## Resumen

pplx-decider-v1.1-27b es un modelo de clasificación y toma de decisiones desarrollado por perplexity-ai, un fine-tune del backbone Qwen/Qwen3.8-27B. No es un modelo generativo de propósito general: se distribuye como un checkpoint de decisión nativo compuesto por el backbone `Qwen3_5Model` más una cabeza de decisión `readout.safetensors` en BF16 de dimensiones [255, 5120]. Su tarea es puntuar un conjunto de candidatos (categorías, opciones, etiquetas) dada una instrucción y un estado, devolviendo probabilidades normalizadas sobre las opciones válidas.

La versión 1.1 mejora el Decision Index de 56.4 a 61.56 respecto a pplx-decider-v1-27b, superando a Jev (57.9) por más de 3.5 puntos. Las ganancias provienen principalmente del levantamiento de la máscara causal en las capas de atención completa y de entrenar con más datos, incluidos datos de tasksource. El modelo incorpora capacidades multimodales para imágenes, con procesamiento por parches de 32×32 píxeles.

Con 26.085.330.160 parámetros (26,09 mil millones) y licencia Apache 2.0, el modelo está pensado para integrarse como componente de enrutamiento y decisión en sistemas mayores, no como chatbot. Su relevancia actual reside en que ofrece un mecanismo explícito y calibrado de decisión sobre candidatos, con soporte de imágenes y contexto de 8.192 tokens, en un formato de checkpoint reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención completa no causal + capas de atención lineal), backbone Qwen3_5Model con cabeza de decisión separada |
| Parámetros totales | 26.085.330.160 (26,09 B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8.192 tokens (límite de `prepare`; las entradas que lo exceden se rechazan, no se truncan) |
| Tipos de cuantización | no disponible (pesos publicados en BF16; el repo ocupa 52,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone + `readout.safetensors` BF16 [255, 5120]); requiere código custom (`autojev.model`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.8-27B con arquitectura transformer híbrida: capas de atención completa y capas de atención lineal. La innovación clave de la versión 1.1 es que las capas de atención completa usan un modo de atención **no causal** guardado en el checkpoint, mientras que las capas de atención lineal conservan su comportamiento nativo. La inferencia causal por defecto no reproduce el setup evaluado, por lo que es imprescindible usar la implementación de inferencia incluida.

Sobre el backbone se añade una cabeza de decisión (`readout`) en BF16 de forma [255, 5120], que mapea estados ocultos a un conjunto de tokens candidatos definidos en `decision_config.json["token_ids"]`. No existe un `lm_head` de vocabulario completo: el artefacto es un checkpoint de decisión, no un modelo de lenguaje generativo. El entrenamiento se realizó con más datos que la v1, incluyendo datos de tasksource, y el pipeline de datos se apoya en Bespoke Nimble. La versión anterior se construyó a partir de datasets públicos etiquetados por humanos convertidos a decisiones de tipo Choice y Noul. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Clasificación y decisión sobre un conjunto de candidatos: dado un estado y una pregunta con criterios, devuelve probabilidades normalizadas sobre las opciones válidas.
- Decisión multimodal: acepta imágenes como rutas de archivo, objetos PIL o URLs `data:image/...;base64` en `row["images"]`, con redimensionado que preserva la relación de aspecto.
- Procesamiento de imágenes por parches de 32×32 píxeles, con un coste aproximado de `width * height / 1024` tokens visuales por imagen.
- Límite configurable de píxeles por imagen mediante `max_image_pixels` (por defecto 2048×2048, hasta 4.096 tokens por imagen; el setup evaluado usó 512×512, ≤256 tokens).
- Calibración de temperatura guardada: `DecisionModel.predict` aplica la temperatura de calibración; si se usan logits directamente, debe aplicarse exactamente una vez y normalizar sobre los candidatos válidos.
- Soporte de decisiones de tipo Choice y Noul (mencionados en la model card).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, generación de texto libre ni thinking mode.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una consulta entrante entre departamentos (facturación, soporte técnico, ventas) usando la pregunta de tipo Choice con criterios explícitos, como muestra el ejemplo de la model card.
- Moderación y etiquetado de contenido: asignar categorías a textos o imágenes con probabilidades calibradas, aprovechando la cabeza de decisión sobre candidatos acotados.
- Clasificación de imágenes en pipelines de datos: procesar capturas, documentos escaneados o imágenes de producto y decidir su categoría, con control del coste en tokens mediante `max_image_pixels`.
- Enrutamiento de consultas en un sistema RAG: decidir si una consulta requiere recuperación, qué índice consultar o qué herramienta invocar, dado que la categoría Retrieval obtuvo 61.26 en el Decision Index.
- Triage en flujos de atención al cliente multimodal: decidir la acción siguiente a partir de un mensaje de texto más una imagen adjunta (por ejemplo, una captura de error), dentro del límite de 8.192 tokens.
- Evaluación automática de respuestas: puntuar opciones candidatas generadas por otro modelo y seleccionar la más probable según criterios definidos, como componente de un sistema de selección.
- Clasificación de tareas NLP en pipelines de anotación: aprovechar el entrenamiento con datos de tasksource para etiquetar datos con esquemas de decisión predefinidos.

## Benchmarks y rendimiento

Resultados del Decision Index publicados en la model card:

| Categoría del Decision Index | Jev | pplx-decider-v1-27b | pplx-decider-v1.1-27b |
|---|---:|---:|---:|
| Knowledge | **51.4** | 40.9 | 48.18 |
| Language | 62.0 | 63.5 | **69.45** |
| Retrieval | 55.4 | 54.9 | **61.26** |
| Tools | 75.1 | **79.3** | 78.88 |
| Arts | 37.7 | 39.4 | **44.66** |
| **Overall Decision Index** | 57.9 | 56.4 | **61.56** |

La puntuación global usa la ponderación del suite, no una media simple de categorías. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: aproximadamente 49 GiB de pesos más memoria de trabajo, según la model card (pesos en BF16).
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con al menos ~49 GiB libres para los pesos; se requiere una GPU CUDA.
- No cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16 sin cuantización, y no se documentan en la información disponible opciones de cuantización.
- Opciones de despliegue: la model card indica usar el código de inferencia incluido (`autojev.model.DecisionModel`) con Python 3.12+ y las dependencias fijadas en `requirements.txt`. Un sistema que requiera `Qwen3_5ForConditionalGeneration` necesita una exportación separada que mapee la fila `i` del readout a la fila de vocabulario `decision_config.json["token_ids"][i]` y preserve el comportamiento de atención.
- Latencia y throughput: no disponibles en la información proporcionada.
- Repositorio: 52,2 GB de tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.1-27b | 26,09 B | 8.192 tokens | 61.56 | Apache 2.0 | Hugging Face (repo privado con acceso autenticado) |
| pplx-decider-v1-27b | no disponible | no disponible | 56.4 | no disponible | Hugging Face |
| Jev | no disponible | no disponible | 57.9 | no disponible | Referenciado vía space `multimodalart/jev-decision-index` |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no evaluado en este suite | no disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: carece de `lm_head` de vocabulario completo; no puede usarse para generación de texto libre sin una exportación específica.
- La inferencia causal por defecto no reproduce el comportamiento evaluado; es obligatorio usar la implementación incluida con atención no causal en las capas de atención completa.
- El límite de 8.192 tokens incluye el texto y todas las imágenes de una decisión; las entradas que lo exceden se rechazan en lugar de truncarse.
- Las imágenes por encima de 512×512 quedan fuera de la distribución de entrenamiento, con mayor coste de memoria y latencia.
- La temperatura de calibración debe aplicarse exactamente una vez; aplicarla dos veces o no normalizar sobre los candidatos válidos altera las probabilidades.
- El repositorio es privado y requiere acceso autenticado en Hugging Face.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales del modelo base ni de los datos de entrenamiento (tasksource, Bespoke Nimble) que puedan afectar a producción.
- El pipeline de datos de la v1 se basó en datasets públicos etiquetados por humanos; no se detalla la composición de la v1.1 más allá de la inclusión de tasksource.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Versión anterior: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- tasksource (GitHub): https://github.com/sileod/tasksource
- tasksource (paper, LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.1361/
- Bespoke Nimble (GitHub): https://github.com/bespokelabsai/nimble
