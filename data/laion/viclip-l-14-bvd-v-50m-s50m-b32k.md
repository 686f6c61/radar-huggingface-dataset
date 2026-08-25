# laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K

## Resumen

ViCLIP-L-14-BVD-V-50M-s50M-b32K es un modelo de visión-lenguaje para video desarrollado por LAION, una organización sin ánimo de lucro dedicada a la investigación abierta en inteligencia artificial. Se trata de una adaptación de la arquitectura CLIP al dominio del video, entrenada sobre el dataset BVD-V-50M, que contiene 50 millones de pares video-texto. El modelo permite realizar clasificación de video en modo zero-shot, recuperación video-texto y extracción de representaciones de video, sin necesidad de fine-tuning previo.

La arquitectura sigue el diseño de ViCLIP, con un codificador visual ViT-L/14 y un codificador de texto, ambos inicializados desde el modelo CLIP-ViT-L-14-DataComp.XL-s13B-b90K. El modelo tiene aproximadamente 427,6 millones de parámetros y está disponible en formato safetensors bajo licencia MIT. Su relevancia actual radica en que ofrece una alternativa abierta y reproducible para tareas de comprensión de video, con resultados competitivos en benchmarks estándar como Kinetics-400, UCF-101 y HMDB51.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViCLIP (ViT-L/14 para visión + codificador de texto) |
| Parametros totales | 427.624.704 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Texto: 77 tokens; video: 8 frames a 224x224 (no se especifica contexto temporal adicional) |
| Tipos de cuantizacion | no disponible (solo safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | Inglés (único idioma declarado en el modelo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ViCLIP-L-14-BVD-V-50M-s50M-b32K sigue la arquitectura CLIP de dos torres: un codificador visual basado en ViT-L/14 y un codificador de texto basado en transformer. Ambos codificadores se inicializan desde el modelo CLIP-ViT-L-14-DataComp.XL-s13B-b90K, que fue entrenado con 13 mil millones de pares imagen-texto. El modelo procesa video en forma de 8 frames por clip, cada uno redimensionado a 224x224 píxeles, y el texto se tokeniza con un máximo de 77 tokens.

El entrenamiento se realizó sobre el dataset BVD-V-50M, compuesto por 50 millones de pares video-texto. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 4e-5, betas (0.9, 0.98) y weight decay de 0.2. El tamaño de lote global fue de 32.000 muestras, con un warmup de 100 pasos y un scheduler de coseno. El modelo se entrenó durante 50 millones de muestras vistas, lo que equivale a aproximadamente 1.562 pasos con ese lote. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es puramente contrastivo, similar al de CLIP.

## Capacidades

- Clasificación de video zero-shot: el modelo puede asignar etiquetas de acción o escena a videos sin entrenamiento específico, mediante la comparación de características de video y texto.
- Recuperación video-texto: permite buscar videos a partir de descripciones textuales y viceversa, calculando similitud coseno entre las representaciones.
- Extracción de características de video: produce embeddings densos de video que pueden usarse para tareas downstream como linear probing o fine-tuning.
- Representación multimodal: al estar basado en CLIP, puede servir como componente visual en modelos multimodales más grandes (VLMs).
- Capacidad multilingüe: limitada al inglés, según la documentación oficial.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es un modelo de codificación, no generativo.

## Casos de uso

- Clasificación de acciones en video: el modelo puede etiquetar videos de deportes, actividades cotidianas o gestos en tiempo real, usando cero ejemplos de entrenamiento. Es adecuado para prototipos de sistemas de análisis de video donde no hay datos etiquetados.
- Búsqueda semántica de video: en una biblioteca de videos, se pueden indexar los embeddings generados por el modelo y permitir búsquedas por descripción textual, útil para motores de búsqueda de contenido audiovisual.
- Moderación de contenido: se puede usar para detectar categorías de contenido (violencia, desnudos, etc.) mediante clasificación zero-shot, aunque requiere validación en el dominio específico.
- Análisis de video para investigación académica: los embeddings extraídos pueden alimentar clasificadores lineales o modelos de fine-tuning para tareas como reconocimiento de actividades, segmentación temporal o detección de eventos.
- Componente de un sistema de respuesta a preguntas sobre video: al proporcionar representaciones de video, puede integrarse en pipelines que combinan visión y lenguaje para responder preguntas sobre el contenido de clips.
- Evaluación de datasets de video: el modelo puede usarse para verificar la coherencia entre pares video-texto en datasets, detectando desajustes o ruido en los datos.

## Benchmarks y rendimiento

El modelo fue evaluado con la suite CLIP Benchmark. Los resultados reportados en la model card son los siguientes:

| Benchmark | Métrica | Resultado |
|---|---|---|
| Kinetics-400 | top-1 accuracy | 63,3 |
| UCF-101 | top-1 accuracy | 79,7 |
| HMDB51 | top-1 accuracy | 61,4 |
| MSR-VTT | video/text retrieval recall@1 | 42,8 / 43,2 |
| MSVD | video/text retrieval recall@1 | 53,7 / 83,9 |

No se proporcionan comparaciones con otros modelos en la información disponible. Los resultados son competitivos para un modelo de este tamaño, aunque no se dispone de datos de latencia o throughput.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la documentación del modelo. Sin embargo, dado que el modelo tiene aproximadamente 427,6 millones de parámetros, se puede estimar:

- VRAM estimada para inferencia: en fp32, el modelo ocupa unos 1,7 GB; en fp16, unos 0,85 GB. A esto hay que sumar la memoria para los frames de video (8 frames a 224x224) y las activaciones, por lo que se recomienda al menos 4 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A100 o H100 para procesamiento por lotes grande.
- En consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: el modelo es compatible con Hugging Face Transformers mediante `AutoModel`, `AutoTokenizer` y `AutoVideoProcessor`. También puede usarse con librerías de inferencia como vLLM o TGI, aunque al ser un modelo de codificación (no generativo), el uso típico es mediante scripts personalizados o pipelines de extracción de características.
- Latencia y throughput: no se han publicado datos. La latencia dependerá del hardware y del número de frames procesados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo comparte arquitectura con CLIP ViT-L/14, pero está especializado en video. Otros modelos de video-language como VideoCLIP o X-CLIP podrían ser comparables, pero no se han encontrado datos en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; su uso en otros idiomas está fuera del alcance declarado.
- No debe utilizarse en aplicaciones de vigilancia o reconocimiento facial, según la documentación oficial.
- Al ser un modelo de codificación contrastiva, puede sufrir alucinaciones en tareas de generación, pero no es su propósito.
- Los resultados de benchmarks se obtuvieron en condiciones específicas; el rendimiento puede degradarse en dominios muy diferentes a los datos de entrenamiento.
- No se han publicado análisis de sesgos o robustez. Se recomienda realizar pruebas exhaustivas antes de cualquier despliegue no controlado.
- La licencia MIT permite uso comercial, pero el modelo se ofrece para investigación; el usuario debe verificar la idoneidad para su caso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K
- Repositorio del dataset BVD: https://github.com/LAION-AI/BVD
- Página de LAION: https://laion.ai/
- Modelo base CLIP ViT-L/14 DataComp: https://huggingface.co/laion/CLIP-ViT-L-14-DataComp.XL-s13B-b90K
- Suite CLIP Benchmark: https://github.com/LAION-AI/CLIP_benchmark
