# DS4AI-UPB/qwen25-ro-re-lora

## Resumen

El modelo `DS4AI-UPB/qwen25-ro-re-lora` es un adaptador QLoRA sobre el modelo base `Qwen/Qwen2.5-32B-Instruct`, desarrollado por el laboratorio DS4AI-UPB (Distributed Systems for Artificial Intelligence Laboratory) de la Universidad Politécnica de Bucarest. Está especializado en clasificación de relaciones (relation extraction) entre entidades marcadas en frases, evaluado en inglés y rumano. El adaptador se entrena sobre el conjunto SemEval-2010 Task 8, que incluye diez relaciones direccionales, y utiliza una traducción automática del corpus al rumano con post-validación para abordar un idioma con pocos recursos.

El problema que resuelve es la extracción de relaciones semánticas en rumano, un área donde los modelos multilingües grandes suelen fallar sin ajuste fino. El adaptador, con un tamaño de 1.1 GB, se integra sobre un transformer decoder de 32B parámetros con ventana de contexto de 32K tokens. Su relevancia radica en demostrar que el ajuste fino eficiente con QLoRA puede equiparar el rendimiento de modelos mucho más pequeños y especializados en tareas de PLN de bajo recurso, manteniendo la versatilidad del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-32B-Instruct) con adaptador LoRA |
| Parametros totales | 32B (modelo base) + adaptador LoRA (rank 32, ~1.1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (modelo base) |
| Tipos de cuantizacion | 4-bit (entrenamiento con QLoRA); cuantizaciones adicionales no especificadas |
| Idiomas soportados | Rumano, inglés |
| Licencia | Apache 2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors, PEFT |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2.5-32B-Instruct, un transformer decoder autoregresivo con 32B parámetros y atención completa, preentrenado con 18 billones de tokens. El ajuste fino se realiza mediante QLoRA: el modelo base se carga en 4-bit (NF4) y se añaden adaptadores LoRA de rango 32 y alpha 64 sobre todas las proyecciones de atención y MLP, con dropout de 0.05. El entrenamiento se ejecuta durante 3 épocas con un tamaño de batch efectivo de 16, una tasa de aprendizaje pico de 2e-4 con decaimiento coseno y 5% de warmup. Los datos combinan el corpus original en inglés (SemEval-2010 Task 8) y su traducción al rumano generada automáticamente con post-validación, totalizando 15,871 ejemplos. El entrenamiento se realizó en una única GPU NVIDIA A100 40GB durante aproximadamente 3 horas y 28 minutos.

## Capacidades

- Clasificación de relaciones entre dos entidades marcadas (`<e1>`, `<e2>`) en una frase, asignando una de diez relaciones direccionales (p. ej., causa-efecto, producto-productor, contenido-contenedor, etc.).
- Soporte bilingüe para inglés y rumano, con rendimiento medido en ambos idiomas.
- Generación de texto y razonamiento del modelo base, aunque el adaptador está optimizado para la tarea específica de extracción de relaciones.
- No se documentan capacidades de tool calling, agentes, visión ni audio en el adaptador; estas dependen del modelo base, que no las incluye de forma nativa.

## Casos de uso

- Construcción de grafos de conocimiento en rumano: extraer relaciones entre entidades de documentos técnicos o científicos para poblar bases de datos semánticas.
- Procesamiento de documentos legales: identificar relaciones entre partes, cláusulas y conceptos en contratos o sentencias redactados en rumano.
- Análisis de literatura biomédica: extraer interacciones entre fármacos y enfermedades en artículos científicos, tanto en inglés como en rumano para publicaciones locales.
- Atención al cliente automatizada en rumano: clasificar relaciones entre entidades en consultas de usuarios para enrutar peticiones o extraer información estructurada.
- Investigación académica en PLN: servir como baseline para estudios sobre extracción de relaciones en lenguas de bajos recursos, comparando con modelos multilingües.
- Integración en pipelines de NLP para rumano: combinar con reconocimiento de entidades nombradas para extraer tripletas (entidad, relación, entidad) en corpus periodísticos o de redes sociales.

## Benchmarks y rendimiento

La model card reporta resultados sobre el conjunto de test de SemEval-2010 Task 8, con macro F1 y accuracy:

| Idioma | F1-Score | Accuracy |
|--------|----------|----------|
| Inglés | 0.890    | 0.880    |
| Rumano | 0.864    | 0.853    |

En evaluación zero-shot (sin ajuste fino) el mismo modelo base obtiene solo 0.320 de F1 en inglés, lo que muestra la mejora sustancial del adaptador. El análisis estadístico indica que el rendimiento en rumano es estadísticamente indistinguible del de un XLM-RoBERTa-large (560M) ajustado para la misma tarea (paired bootstrap, p = 0.13), a pesar de que el modelo es aproximadamente 57 veces más grande.

## Requisitos de hardware

- VRAM estimada: el modelo base de 32B parámetros en 4-bit requiere aproximadamente 20 GB de VRAM; con el adaptador LoRA, el consumo adicional es mínimo (~1.1 GB en disco, pero en memoria se mantiene similar). Se recomienda al menos 24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA A100 40GB (usada en entrenamiento), RTX 4090 24GB, RTX A6000 48GB o GPUs de datacenter con más memoria.
- En GPUs de consumo (RTX 3090/4090 con 24 GB) es viable cargar el modelo en 4-bit, aunque puede requerir offloading de CPU para contextos largos.
- Opciones de despliegue: Transformers con PEFT (carga del adaptador sobre el base), vLLM si se fusiona el adaptador en el modelo base, o conversión a GGUF con llama.cpp para despliegue en CPU/GPU mixta.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware y de la implementación de inferencia.

## Comparativa con modelos similares

La model card no proporciona comparaciones con otros modelos de la misma categoría (LLMs ajustados para extracción de relaciones), pero sí ofrece un dato relevante frente a un modelo especializado:

| Modelo | Tamaño | F1 (rumano) | F1 (inglés) | Licencia |
|--------|--------|-------------|-------------|----------|
| Qwen2.5-32B-Instruct + adaptador QLoRA | 32B + LoRA | 0.864 | 0.890 | Apache 2.0 |
| XLM-RoBERTa-large (fine-tuned) | 560M | ~0.86 (no especificado) | no disponible | MIT (XLM-RoBERTa) |

No se dispone de datos de otros LLMs ajustados con LoRA para esta tarea, por lo que la comparativa se limita a este único caso documentado.

## Limitaciones y advertencias

- Los datos de entrenamiento en rumano son traducciones automáticas con post-validación, no un corpus anotado por humanos; pueden existir errores que afecten al rendimiento en dominios específicos.
- El modelo solo cubre las diez relaciones de SemEval-2010 Task 8, no es un extractor de relaciones abierto.
- No se ha evaluado en otros idiomas ni en dominios fuera del corpus de entrenamiento.
- El adaptador se distribuye bajo licencia Apache 2.0, pero el modelo base Qwen2.5-32B-Instruct también es Apache 2.0; sin embargo, el paper asociado está en progreso y la licencia del código del repositorio puede diferir (se indica CC BY-NC-SA 4.0 en el badge del README, lo cual podría restringir usos comerciales de la implementación).
- Riesgo de alucinación en generación libre si se usa el modelo base sin el prompt adecuado; el adaptador está pensado para clasificación, no para generación abierta.
- El rendimiento zero-shot es bajo (0.320 F1 en inglés), lo que indica que el adaptador es necesario para obtener resultados útiles.

## Enlaces

- HuggingFace: https://huggingface.co/DS4AI-UPB/qwen25-ro-re-lora
- Repositorio de código: https://github.com/DS4AI-UPB/crosslingual-romanian-re
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Technical report de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper del adaptador (en progreso): https://arxiv.org/abs/WIP (no disponible aún)
