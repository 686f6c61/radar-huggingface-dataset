# minhnguyent546/ViSigLIP-OT

## Resumen

ViSigLIP-OT es un modelo de visión-lenguaje de doble codificador (dual-encoder) de 221 millones de parámetros, diseñado específicamente para la recuperación de imágenes a partir de texto (y viceversa) en vietnamita. Lo desarrolla minhnguyent546 y se presenta como parte de la familia ViCLIP-OT, siendo esta la variante que emplea una función de pérdida contrastiva de tipo SigLIP en lugar de CLIP. El modelo combina un codificador de texto basado en Vietnamese-SBERT (135M parámetros) con un codificador de imagen ViT-B/16 preentrenado con el framework DINOv3 (86M parámetros), ambos proyectando a un espacio compartido de 768 dimensiones.

La innovación principal es la incorporación de una pérdida de transporte óptimo regularizada por grafo de similitud (SIGROT), que busca mejorar la alineación entre modalidades y reducir la brecha entre ellas. El modelo está pensado para tareas de búsqueda semántica multimodal en vietnamita, extracción de características y como base para tareas posteriores de visión-lenguaje. Su relevancia radica en ser, según el autor, el primer modelo fundacional de visión-lenguaje específicamente orientado a la recuperación imagen-texto en vietnamita, un idioma con relativamente pocos recursos en este ámbito.

El modelo se distribuye con licencia GPL-3.0, lo que condiciona su uso comercial, y requiere `trust_remote_code=True` para su carga en transformers, lo que implica ejecutar código personalizado del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-encoder (ViT-B/16 para imagen + transformer tipo BERT para texto) |
| Parametros totales | 221.229.312 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (texto, máximo); imagen 224x224 píxeles |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | GPL-3.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ViSigLIP-OT sigue una arquitectura de doble codificador. El codificador de texto se inicializa desde Vietnamese-SBERT (135M parámetros), con pooling por media y una salida de 768 dimensiones. El codificador de imagen emplea un ViT-B/16 preentrenado con DINOv3 (`vit_base_patch16_dinov3.lvd1689m`, 86M parámetros), con pooling global promedio y también 768 dimensiones de salida. Ambos codificadores se entrenan con un objetivo híbrido que combina una pérdida contrastiva estilo SigLIP y la pérdida propuesta SIGROT (Similarity-Graph Regularized Optimal Transport), que regulariza el transporte óptimo mediante un grafo de similitud para mejorar la alineación entre modalidades y reducir la brecha entre ellas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo está entrenado exclusivamente para vietnamita y no se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings multimodales: codifica texto en vietnamita e imágenes en un espacio compartido de 768 dimensiones.
- Recuperación imagen-texto y texto-imagen (image-text retrieval) en vietnamita.
- Recuperación imagen-imagen (image-to-image) según la model card.
- Búsqueda semántica multimodal en vietnamita.
- Extracción de características para tareas posteriores de visión-lenguaje (por ejemplo, VQA o clasificación de imágenes).
- No soporta tool calling ni function calling (no es un modelo generativo de instrucciones).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al vietnamita.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades especiales más allá de la codificación multimodal.

## Casos de uso

- Búsqueda de imágenes por descripción textual en vietnamita: el modelo permite indexar un catálogo de imágenes y recuperar las más relevantes a partir de una consulta en lenguaje natural, gracias a su espacio de embeddings compartido y su entrenamiento específico para recuperación.
- Moderación o etiquetado de contenido visual: se pueden calcular similitudes entre imágenes y descripciones textuales para filtrar o clasificar contenido automáticamente en plataformas en vietnamita.
- Sistemas de recomendación visual: usar los embeddings de imagen y texto para emparejar productos, artículos o contenidos con preferencias expresadas en vietnamita.
- Extracción de características para downstream: servir como extractor de embeddings de imagen y texto para alimentar modelos de VQA, clasificación o clustering en pipelines de visión-lenguaje en vietnamita.
- Búsqueda semántica en bases de datos multimodales: integrar los embeddings en motores de búsqueda vectorial para consultas cross-modales en vietnamita.
- Anotación automática de imágenes: generar o validar descripciones en vietnamita comparando la similitud entre la imagen y candidatos textuales, útil en tareas de curaduría de datasets.
- Organización de archivos multimedia: agrupar imágenes por similitud semántica a partir de consultas textuales en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 221M parámetros, en precisión FP32 requiere aproximadamente 0,9 GB solo para pesos; en FP16 alrededor de 0,45 GB. Con overhead de activaciones y procesamiento por lotes, se estima un uso de 1-2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas (por ejemplo, RTX 3060 en adelante).
- Opciones de despliegue: transformers (con `trust_remote_code=True`), sentence-transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ViSigLIP-OT | 221M | 256 tokens | Vietnamita | GPL-3.0 | Recuperación imagen-texto en vietnamita con SigLIP + SIGROT |
| ViCLIP-OT | 221M | 256 tokens | Vietnamita | GPL-3.0 | Misma familia, con pérdida CLIP + SIGROT |
| CLIP (OpenAI) | ~150M (ViT-B/32) | 77 tokens | Inglés principalmente | MIT | Recuperación imagen-texto genérica, no específica de vietnamita |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para vietnamita; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia GPL-3.0: impone restricciones importantes para uso comercial y obliga a compartir el código derivado bajo la misma licencia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en producción.
- Riesgo de sesgos presentes en los datos de entrenamiento (no documentados), que pueden reflejarse en los embeddings y en los resultados de recuperación.
- Posible riesgo de alucinación en tareas de recuperación si las similitudes no están bien calibradas; no es un modelo generativo, por lo que el riesgo se limita a recuperaciones erróneas.
- Limitación de contexto de texto a 256 tokens, lo que restringe consultas largas.
- No se documentan datos sobre robustez, sesgos o evaluación en dominios específicos.
- El tamaño del repositorio (0,9 GB) y la dependencia de versiones concretas de transformers, torch y torchvision pueden complicar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/minhnguyent546/ViSigLIP-OT
- Repositorio GitHub: https://github.com/minhnguyent546/ViCLIP-OT
- arXiv: https://arxiv.org/abs/2602.22678
- DOI: https://doi.org/10.1007/s00138-026-01956-0
- Colección en Hugging Face: https://huggingface.co/collections/minhnguyent546/viclip-ot
- Modelo base texto: https://huggingface.co/keepitreal/vietnamese-sbert
- Modelo base imagen: https://huggingface.co/timm/vit_base_patch16_dinov3.lvd1689m
- Variante ViCLIP-OT: https://huggingface.co/minhnguyent546/ViCLIP-OT
