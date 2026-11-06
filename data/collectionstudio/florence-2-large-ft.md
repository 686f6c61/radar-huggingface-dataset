# CollectionStudio/Florence-2-large-ft

## Resumen

Florence-2-large-ft es un modelo de visión-lenguaje desarrollado originalmente por Microsoft Research, distribuido en este repositorio por CollectionStudio como una copia del checkpoint oficial. Se trata de un modelo secuencia-a-secuencia de 770 millones de parámetros (0,77B) que unifica múltiples tareas de visión por computador bajo una interfaz de *prompts* de texto: subtitulado de imágenes, detección de objetos, segmentación, *grounding* de frases y propuestas de regiones, entre otras.

La relevancia del modelo reside en su enfoque *prompt-based*: en lugar de entrenar cabezas específicas para cada tarea, Florence-2 trata todas las tareas como problemas de generación texto-a-texto condicionados por una imagen, lo que permite cambiar de tarea simplemente modificando el *prompt* (por ejemplo, `<OD>` para detección de objetos o `<CAPTION>` para subtitulado). Fue entrenado sobre FLD-5B, un conjunto de 5.400 millones de anotaciones sobre 126 millones de imágenes.

Este repositorio concreto es un *mirror* del checkpoint `microsoft/Florence-2-large-ft` con licencia MIT. El modelo base tiene 0,77B parámetros, se distribuye en formato safetensors y PyTorch con código personalizado (`trust_remote_code=True`), y está pensado para inferencia en *float16*. Su tamaño contenido lo hace desplegable en GPUs de consumo, lo que resulta atractivo para pipelines de visión en producción con requisitos moderados de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia (encoder-decoder) multimodal vision-lenguaje, con codificador visual DaViT y decoder de lenguaje; implementacion `transformers` con codigo personalizado |
| Parametros totales | 770.430.041 (0,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el modelo se entrena y distribuye en float16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (`pytorch_model.bin`); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

Florence-2 emplea una arquitectura secuencia-a-secuencia que combina un codificador visual (DaViT, *Dual-Attention Vision Transformer*) con un decoder de lenguaje basado en transformer. Todas las tareas se formulan como generación condicionada por *prompt*: la imagen se codifica en una secuencia de *tokens* visuales y el decoder genera la salida textual correspondiente a la tarea solicitada (coordenadas de *bounding boxes*, etiquetas, subtítulos o máscaras). Esta unificación evita arquitecturas específicas por tarea y permite *zero-shot* y *fine-tuning* sobre el mismo modelo.

El entrenamiento se realizó sobre FLD-5B, un dataset de 5.400 millones de anotaciones sobre 126 millones de imágenes, construido mediante un pipeline de anotación automática y revisión. El modelo se distribuye en dos variantes (base de 0,23B y large de 0,77B), cada una en versión preentrenada y *fine-tuned* sobre tareas *downstream*. La información proporcionada no detalla el número exacto de *tokens* de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Subtitulado de imágenes en tres niveles de detalle: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Detección de objetos con *bounding boxes* y etiquetas mediante el *prompt* `<OD>`.
- *Grounding* de frases: localización de frases de un subtítulo en la imagen mediante `<CAPTION_TO_PHRASE_GROUNDING>`.
- Subtitulado denso de regiones con `<DENSE_REGION_CAPTION>`.
- Propuesta de regiones con `<REGION_PROPOSAL>`.
- Segmentación (referenciada en la descripción del modelo como una de las tareas soportadas).
- Procesamiento multimodal imagen-texto con salida estructurada parseable mediante `post_process_generation`.
- Capacidad *zero-shot* y *fine-tuned* sobre el mismo checkpoint.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni modo *thinking*.

## Casos de uso

- Indexación y etiquetado automático de catálogos de imágenes: usar `<DENSE_REGION_CAPTION>` y `<OD>` para generar metadatos estructurados (objetos, regiones y descripciones) que alimenten un motor de búsqueda visual o un sistema de recomendación.
- Moderación y análisis de contenido visual: combinar `<CAPTION>` y `<OD>` para describir y clasificar imágenes entrantes en un pipeline de revisión, con salida parseable que se puede filtrar por etiquetas concretas.
- Accesibilidad: generar descripciones alternativas (`alt text`) de imágenes mediante `<MORE_DETAILED_CAPTION>` para lectores de pantalla y cumplimiento de pautas de accesibilidad web.
- Anotación asistida para datasets de visión: usar `<REGION_PROPOSAL>` y `<OD>` para preanotar *bounding boxes* y reducir el trabajo manual en la construcción de datasets de detección.
- *Grounding* en sistemas de recuperación visual: dada una consulta en lenguaje natural, usar `<CAPTION_TO_PHRASE_GROUNDING>` para localizar la región de la imagen que corresponde a la frase descrita.
- Automatización de documentación técnica o industrial: describir imágenes de componentes, planos o inspecciones con subtitulado detallado para generar informes estructurados.
- Preprocesamiento para pipelines RAG multimodales: extraer descripciones y regiones de imágenes para enriquecer índices vectoriales con metadatos visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1,6 GB solo para pesos (0,77B × 2 bytes), más overhead de activaciones y del procesador visual; en la práctica se recomienda al menos 4-6 GB de VRAM para imágenes de resolución estándar.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; cabe con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM en float16.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` (método documentado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-large-ft (este) | 0,77B | no disponible | Subtitulado, deteccion, grounding, regiones, segmentacion | MIT | Hugging Face |
| Florence-2-base-ft | 0,23B | no disponible | Mismas tareas que large-ft | MIT | Hugging Face (microsoft/Florence-2-base-ft) |
| Florence-2-large | 0,77B | no disponible | Preentrenado, sin fine-tuning downstream | MIT | Hugging Face (microsoft/Florence-2-large) |
| Florence-2-base | 0,23B | no disponible | Preentrenado, sin fine-tuning downstream | MIT | Hugging Face (microsoft/Florence-2-base) |

No se dispone en la información proporcionada de datos de rendimiento comparativo con modelos de otras familias (por ejemplo, BLIP-2, Qwen-VL o PaliGemma), por lo que la comparativa se limita a las variantes de la propia familia Florence-2.

## Limitaciones y advertencias

- Este repositorio es un *mirror* de CollectionStudio; para producción se recomienda verificar la integridad de los pesos frente al checkpoint oficial de Microsoft.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de desplegarlo en entornos sensibles.
- Riesgo de alucinación en subtitulado y detección: las etiquetas y descripciones generadas pueden no corresponder fielmente al contenido de la imagen, especialmente en escenas complejas o dominios no representados en FLD-5B.
- No se documentan los idiomas soportados; el comportamiento multilingüe no está garantizado y debe validarse empíricamente.
- La longitud de contexto no está disponible, lo que dificulta planificar el procesamiento de imágenes de alta resolución o prompts largos.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del checkpoint original de Microsoft enlazada en la model card.
- No se documentan sesgos conocidos ni evaluaciones de robustez; en producción conviene monitorizar el rendimiento por dominio y tipo de imagen.
- El número de descargas (26) y likes (0) es muy bajo, lo que sugiere poca validación comunitaria de este *mirror* concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CollectionStudio/Florence-2-large-ft
- Checkpoint original: https://huggingface.co/microsoft/Florence-2-large-ft
- Informe técnico (arXiv): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualización: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- Licencia original: https://huggingface.co/microsoft/Florence-2-large-ft/resolve/main/LICENSE
