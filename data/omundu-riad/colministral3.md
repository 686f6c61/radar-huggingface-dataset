# Omundu-Riad/colministral3

## Resumen

ColMinistral3 es un modelo de recuperación visual de documentos (visual document retrieval) de estilo ColPali, desarrollado por Omundu-Riad. Se construye a partir de `mistralai/Ministral-3-3B-Instruct-2512` y combina una torre de visión Pixtral con el modelo de lenguaje de Ministral y una cabeza de recuperación que produce embeddings multi-vector. La interacción entre consulta y página se resuelve mediante late interaction (MaxSim), lo que permite indexar documentos como imágenes sin necesidad de OCR ni de extracción de texto.

El modelo tiene 3.850.073.408 parámetros y se distribuye en bfloat16 con un peso de 7,7 GB. La ventana de contexto y los idiomas no se detallan en la información disponible. Su relevancia actual es acotada: el autor lo marca explícitamente como **legacy**, un modelo antiguo conservado porque sirve de base para todos los adaptadores posteriores (DoRA, LoRA y DeLoRA) del repositorio `checkpoints_diverse`.

Por tanto, no es el checkpoint recomendado para producción. El propio autor indica que para tareas de retrieval conviene usar el adaptador `colministral_siglip_vision_weighted16/best_vidore_v1_step5200` cargado sobre este modelo base, que alcanza 90,39 en ViDoRe v1 y 60,43 en ViDoRe v2 según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColMinistral (`model_type: mistral3`): torre de visión Pixtral + proyector multimodal + LM de 26 capas + cabeza de retrieval (`custom_text_proj`), late interaction (MaxSim) |
| Parametros totales | 3.850.073.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16, 7,7 GB, formato transformers 5.5.1) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón ColPali: una torre de visión Pixtral de 24 capas con parches de 14 píxeles y fusión espacial 2, un proyector multimodal que alinea las representaciones visuales con el espacio del lenguaje, un modelo de lenguaje de 26 capas heredado de Ministral-3-3B-Instruct y una cabeza de proyección de texto (`custom_text_proj`) que genera los embeddings multi-vector. La puntuación consulta-documento se calcula mediante late interaction con MaxSim entre los vectores de la consulta y los de cada página.

El procesador (`colministral3_processor_config.json`) fija `max_num_visual_tokens = 256` y utiliza `</s>` como token de aumento de consulta. Cabe destacar que las ejecuciones posteriores entrenan y evalúan con 1.572 tokens visuales, por lo que este checkpoint legacy opera con una resolución visual menor que la de sus adaptadores. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Recuperación visual de documentos: genera embeddings multi-vector de páginas renderizadas como imagen y los compara con la consulta mediante MaxSim.
- Indexación sin OCR: procesa el layout, tablas, figuras y texto embebido directamente desde la imagen de la página.
- Búsqueda semántica sobre colecciones de documentos escaneados o en PDF.
- Soporte como modelo base para adaptadores de bajo rango (DoRA, LoRA, DeLoRA) que sustituyen total o parcialmente la torre de visión, el proyector y la cabeza de retrieval.
- Capacidades generativas y de razonamiento heredadas del LM subyacente: no documentadas ni garantizadas para esta configuración de retrieval.
- Tool calling, agentes, modo thinking, visión conversacional, audio y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda en archivos de facturas y albarranes escaneados: se indexan las imágenes de cada página y se consulta en lenguaje natural; el modelo puntúa la relevancia visual sin depender de una capa OCR previa.
- Recuperación en documentación técnica con tablas y diagramas: la torre Pixtral captura la estructura espacial de la página, lo que resulta útil cuando el texto extraído pierde el contexto de tablas y figuras.
- Motor de búsqueda interno sobre contratos y expedientes en PDF: se generan embeddings multi-vector por página y se sirve una búsqueda semántica sobre el corpus.
- Base para ajuste fino con adaptadores: equipos que quieran entrenar sus propios adaptadores DoRA/LoRA sobre este checkpoint pueden reutilizar la ruta de referencia del autor y aplicar los módulos guardados.
- Evaluación comparativa de pipelines ColPali: sirve como punto de partida para medir la mejora de los adaptadores posteriores sobre ViDoRe v1 y v2.
- Prototipado de asistentes documentales con recuperación aumentada: se recuperan páginas candidatas y se pasan a un modelo generativo para la respuesta final.
- Indexación de literatura científica con figuras: permite localizar páginas relevantes por contenido visual además de por texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint legacy en la información disponible. La model card sí reporta cifras para el adaptador recomendado sobre este modelo base:

| Modelo | ViDoRe v1 | ViDoRe v2 |
|---|---|---|
| ColMinistral3 (legacy, este repo) | no disponible | no disponible |
| `colministral_siglip_vision_weighted16/best_vidore_v1_step5200` (adaptador sobre este base) | 90,39 | 60,43 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 8-10 GB solo para pesos, más el espacio de activaciones y el coste de los embeddings multi-vector por página (crece con el número de tokens visuales).
- GPU recomendadas: A100 40/80 GB o H100 para indexación a gran escala; L40S o RTX 6000 Ada como alternativas de gama profesional.
- GPU de consumo: cabe en RTX 4090 (24 GB) y, con cuantización, en tarjetas de 12-16 GB; no se han publicado configuraciones de cuantización verificadas para este repo.
- Despliegue: el repo usa la librería `colpali` y el formato de transformers 5.5.1; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ColMinistral3 (este repo) | 3,85 B | no disponible | ColPali / late interaction sobre Ministral-3-3B | no disponible | Hugging Face, 6 descargas |
| ColPali (vidore/colpali) | ~2,9 B (basado en PaliGemma) | no disponible | ColPali / late interaction | no disponible en la información | Hugging Face |
| ColQwen2 (vidore/colqwen2-v1.0) | ~2,2 B (basado en Qwen2-VL-2B) | no disponible | ColPali / late interaction | no disponible en la información | Hugging Face |
| Adaptador `colministral_siglip_vision_weighted16` sobre este base | 3,85 B + adaptador | no disponible | ColPali / late interaction | no disponible | Hugging Face (dataset `checkpoints_diverse`) |

No se dispone de datos de rendimiento comparables de ColPali ni ColQwen2 en la información proporcionada; las cifras ViDoRe citadas corresponden únicamente al adaptador recomendado por el autor.

## Limitaciones y advertencias

- Modelo marcado como legacy: el autor lo conserva como base de entrenamiento, no como checkpoint de producción.
- Resolución visual reducida (`max_num_visual_tokens = 256`) frente a los 1.572 tokens de las ejecuciones posteriores, lo que puede degradar la recuperación en páginas densas.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución.
- Idiomas soportados no documentados.
- Riesgo de alucinación y de falsos positivos en la recuperación: el modelo puntúa relevancia visual, no verifica hechos.
- Sesgos potenciales heredados de los datos de entrenamiento de Ministral-3-3B-Instruct y del corpus de adaptadores, no auditados en la información disponible.
- Los adaptadores de `checkpoints_diverse` esperan una ruta local concreta (`/home/jovyan/workplace/colbert_v1/models/colministral3`) o un `base_model_name_or_path` reajustado; una carga incorrecta rompe la sustitución de módulos.
- Requiere renderizar las páginas a imagen, lo que añade coste de preprocesado y almacenamiento frente a pipelines puramente textuales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Omundu-Riad/colministral3
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Dataset de checkpoints y adaptadores: https://huggingface.co/datasets/Omundu-Riad/checkpoints_diverse
