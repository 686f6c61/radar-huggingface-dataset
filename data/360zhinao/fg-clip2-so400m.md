# 360ZhiNao/fg-clip2-so400m

## Resumen

FG-CLIP 2 es un modelo de alineamiento visión-lenguaje de grano fino, bilingüe inglés-chino, desarrollado por 360 ZhiNao (Qihoo 360) y publicado en el repositorio `360ZhiNao/fg-clip2-so400m`. Se trata de una variante de tipo CLIP basada en un backbone ViT-SO400M, con 1.154.017.410 parámetros totales, orientada a tareas de clasificación de imágenes zero-shot, retrieval imagen-texto y comprensión visual detallada. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, cargables mediante `transformers` con `trust_remote_code=True`.

La propuesta del modelo es mejorar la granularidad del alineamiento visión-lenguaje frente a alternativas como SigLIP 2 o MetaCLIP 2, incidiendo en la distinción de atributos finos (color, material, disposición de objetos) y en el soporte nativo de chino además del inglés. Según la model card, supera a esas líneas base en 29 conjuntos de datos y 8 tareas distintas, lo que lo sitúa como candidato para pipelines de búsqueda multimodal y etiquetado automático en entornos bilingües.

El modelo se enmarca en la segunda generación de la familia FG-CLIP, con un artículo técnico asociado (arXiv:2510.10921) y una versión previa presentada en ICML 2025 (arXiv:2505.05071). Su relevancia actual radica en la combinación de granularidad fina, bilingüismo y una licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language alignment tipo CLIP con backbone ViT-SO400M (según nombre del checkpoint); implementación custom en `transformers` |
| Parametros totales | 1.154.017.410 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto genérica; el tokenizador admite `max_length=64` para captions cortos y `max_length=196` para captions largos; el procesador de imagen admite `max_num_patches` variable (128, 256, 576, 784, 1024) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la estela de los modelos de alineamiento visión-lenguaje tipo CLIP, con un codificador de imagen basado en ViT-SO400M y un codificador de texto, entrenados con un objetivo de contraste imagen-texto. La implementación se expone a través de `AutoModelForCausalLM` con código remoto, y ofrece métodos específicos `get_image_features` y `get_text_features` con un parámetro `walk_type` (`"short"` o `"long"`) que adapta el procesamiento según la longitud del caption. El procesador de imagen permite un número variable de parches (`max_num_patches`) en función de la resolución de entrada, lo que sugiere un mecanismo de tokenización visual adaptativa.

La model card indica que el modelo ha sido evaluado en 29 conjuntos de datos y 8 tareas, y que supera a SigLIP 2 y MetaCLIP 2 en ambos idiomas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La información pública se limita al artículo arXiv:2510.10921 y al repositorio de código asociado.

## Capacidades

- Clasificación de imágenes zero-shot: asignación de etiquetas textuales a imágenes sin entrenamiento específico por clase.
- Retrieval imagen-texto y texto-imagen: cálculo de similitud coseno entre embeddings normalizados, con `logit_scale` y `logit_bias` para calibrar los logits.
- Alineamiento de grano fino: distinción de atributos visuales detallados (color, material, disposición de objetos) en captions cortos y largos.
- Soporte bilingüe inglés-chino: tokenizador y entrenamiento orientados a ambos idiomas.
- Procesamiento de captions cortos y largos: parámetro `walk_type` con modos `"short"` (hasta 64 tokens) y `"long"` (hasta 196 tokens).
- Tokenización visual adaptativa: número variable de parches según la resolución de la imagen (128 a 1024 parches).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de vídeo, audio ni modo de pensamiento explícito.

## Casos de uso

- Búsqueda multimodal en catálogos de producto: indexar imágenes de inventario y permitir consultas en lenguaje natural en inglés o chino, aprovechando el alineamiento de grano fino para distinguir variantes de color, material o modelo.
- Etiquetado automático de imágenes: generar etiquetas zero-shot sobre grandes volúmenes de imágenes sin necesidad de entrenamiento supervisado por clase, útil en pipelines de moderación o catalogación.
- Moderación de contenido visual: clasificar imágenes frente a un conjunto de descripciones textuales de políticas, con soporte bilingüe para plataformas con usuarios en inglés y chino.
- Retrieval en sistemas de documentación técnica: emparejar capturas o diagramas con descripciones textuales detalladas, usando el modo `walk_type="long"` para captions extensos.
- Asistencia a personas con discapacidad visual: describir y clasificar escenas mediante comparación con descripciones candidatas, en aplicaciones bilingües.
- Filtrado y curación de datasets multimodales: puntuar pares imagen-texto por similitud para descartar muestras mal alineadas antes del entrenamiento de otros modelos.
- Publicidad y creatividad: evaluar el ajuste entre un creativo visual y un copy propuesto, con sensibilidad a atributos finos como color o composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo supera a SigLIP 2 y MetaCLIP 2 en 29 conjuntos de datos y 8 tareas, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 4,6 GB solo para pesos (1.154 M parámetros × 4 bytes), más activaciones y memoria del procesador de imagen; en la práctica se recomienda al menos 8-12 GB para trabajar con lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 2,3 GB para pesos, más activaciones; cabe en GPUs consumer con 8 GB o más.
- GPUs recomendadas: NVIDIA A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en una sola GPU consumer.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM en precisión reducida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código custom); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FG-CLIP 2 SO400M (este) | 1.154 M | Captions hasta 196 tokens; parches 128-1024 | en, zh | apache-2.0 | Hugging Face |
| SigLIP 2 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| MetaCLIP 2 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| FG-CLIP (v1) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (colección qihoo360) |

La model card cita SigLIP 2 y MetaCLIP 2 como líneas base superadas, pero no se dispone en la información proporcionada de sus especificaciones detalladas para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos web bilingües es probable que herede sesgos culturales y de representación, pero no se detallan.
- Riesgo de alucinación: al ser un modelo de alineamiento y no generativo libre, el riesgo se manifiesta como falsos positivos en clasificación y retrieval, especialmente con captions ambiguos o imágenes fuera de distribución.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: el texto se trunca a 64 o 196 tokens según `walk_type`; captions más largos se truncan, lo que puede degradar el alineamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de desplegarlo en producción.
- Requisito de código custom: no es un modelo estándar de `transformers`; la integración con ecosistemas como vLLM o TGI no está documentada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.
- El pipeline declarado es `zero-shot-image-classification`, pero la carga se realiza mediante `AutoModelForCausalLM`; conviene verificar la compatibilidad con el pipeline estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/360ZhiNao/fg-clip2-so400m
- Colección FG-CLIP 2: https://huggingface.co/collections/qihoo360/fg-clip-2-68ecbf9c548623bb78bc7913
- Código: https://github.com/360CVGroup/FG-CLIP
- Página del proyecto: https://360cvgroup.github.io/FG-CLIP
- Artículo FG-CLIP 2 (arXiv:2510.10921): https://arxiv.org/abs/2510.10921
- Artículo FG-CLIP v1 (arXiv:2505.05071): https://arxiv.org/abs/2505.05071
- Rama v1.0 del repositorio: https://github.com/360CVGroup/FG-CLIP/tree/v1.0
- Dataset FineHARD: https://huggingface.co/datasets/qihoo360/FineHARD
- Colección FG-CLIP v1: https://huggingface.co/collections/qihoo360/fg-clip-681da45d4acfb65c240a6d08
- DeepWiki del proyecto: https://deepwiki.com/360CVGroup/FG-CLIP
- API/MCP de FG-CLIPv2: https://research.360.cn/sass/index
