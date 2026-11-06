# Gakwavu/embeddinggemma-2-text-vision-440m-litert-lm

## Resumen

EmbeddingGemma 2 Text Vision 440M es un modelo de embeddings multimodal (texto e imagen) derivado de la familia EmbeddingGemma 2 de Google, adaptado por el usuario Gakwavu para su ejecución en dispositivo mediante LiteRT-LM. Combina un backbone de texto de 270M parámetros con un codificador visual modular de 170M parámetros, sumando 440M en total, y proyecta texto, código e imágenes a un espacio de embeddings unificado de 768 dimensiones. El modelo base es `google/embeddinggemma-2`, sobre el que se ha realizado un fine-tuning y una conversión al formato LiteRT-LM.

La relevancia de esta variante radica en su orientación a inferencia local y en dispositivo: no es un modelo generativo, sino un modelo de representación pensado para búsqueda semántica, recuperación visual de documentos y clasificación de imágenes sin depender de servicios en la nube. El repositorio ocupa 6,1 GB y se distribuye bajo licencia Apache 2.0.

La información pública disponible es escasa: la model card reproduce en gran medida la documentación de la familia EmbeddingGemma 2 de Google y no detalla el proceso de fine-tuning ni los datos empleados por el autor de esta conversión. No se han publicado resultados de benchmarks específicos para esta variante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto y codificador visual modular (familia EmbeddingGemma 2) |
| Parámetros totales | 440M (Transformer: 130M, embeddings: 140M, codificador visual: 170M) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Transformer: int4 per-channel (QAT); embeddings: int4 per-channel (QAT); codificador visual: int8 per-channel (QAT) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM |
| Dimensión de embedding | 768 |
| Modalidades | Texto e imagen |
| Librería | litert-lm |
| Tamaño del repositorio | 6,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseño de la familia EmbeddingGemma 2: un transformer de texto de 130M parámetros acompañado de una capa de embeddings de 140M parámetros, a la que se añade un codificador visual de 170M parámetros. El resultado es un espacio de representación compartido de 768 dimensiones en el que texto, código e imágenes quedan alineados semánticamente, lo que permite comparar directamente una consulta textual con una imagen o un fragmento de documento visual.

La cuantización es parte integral del diseño: el transformer y los embeddings usan int4 per-channel con Quantization-Aware Training (QAT), mientras que el codificador visual emplea int8 per-channel también con QAT. Esta combinación está pensada para reducir el consumo de memoria y cómputo en dispositivos móviles y equipos de sobremesa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los detalles concretos del fine-tuning aplicado por Gakwavu sobre el modelo base de Google.

## Capacidades

- Generación de embeddings de texto y código en un espacio vectorial de 768 dimensiones.
- Generación de embeddings de imagen mediante el codificador visual de 170M parámetros.
- Alineación cross-modal: permite comparar consultas textuales con imágenes en el mismo espacio de representación.
- Búsqueda semántica de imágenes a partir de descripciones en lenguaje natural.
- Recuperación visual de documentos (document retrieval sobre capturas o páginas escaneadas).
- Clasificación de imágenes mediante similitud con embeddings de referencia.
- Ejecución en dispositivo mediante LiteRT-LM, sin necesidad de servidor.
- No es un modelo generativo: no produce texto ni respuestas, solo representaciones vectoriales.
- No se ha documentado soporte de tool calling, agentes ni modos de razonamiento multi-paso.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda semántica de imágenes en aplicaciones móviles: el modelo genera embeddings de la fototeca local y de las consultas del usuario, permitiendo búsquedas por descripción sin enviar datos a la nube, gracias a su ejecución con LiteRT-LM en Android e iOS.
- Recuperación visual de documentos: indexación de páginas escaneadas o capturas de pantalla como vectores de 768 dimensiones para recuperar el documento relevante ante una consulta textual, útil en gestores documentales locales.
- Clasificación de imágenes en el dispositivo: comparación del embedding de una imagen entrante con embeddings de referencia de cada categoría para asignar etiquetas sin entrenar un clasificador específico.
- Filtrado y moderación de contenido visual: cálculo de similitud entre imágenes y descripciones de políticas para marcar contenido potencialmente problemático antes de subirlo a un servicio.
- Organización automática de bibliotecas multimedia: agrupación de imágenes por similitud semántica en aplicaciones de galería o notas, ejecutándose localmente para preservar la privacidad.
- Búsqueda multimodal en asistentes de productividad: permitir consultas del tipo "encuentra la diapositiva con el gráfico de ventas" sobre capturas y documentos, integrando el modelo en la app de escritorio o móvil.
- Prototipado de sistemas RAG con componente visual: uso del modelo como recuperador en pipelines que combinan texto e imágenes, aprovechando su formato LiteRT-LM para despliegues en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se distribuye cuantizado (int4 para transformer y embeddings, int8 para el codificador visual); el repositorio ocupa 6,1 GB, aunque el peso efectivo del modelo es muy inferior y está pensado para ejecutarse en memoria de dispositivo.
- GPU recomendadas: no disponible. El formato LiteRT-LM está orientado a aceleradores móviles (GPU/NPU de Android e iOS) y a CPU en equipos de sobremesa.
- Compatibilidad con GPU de consumo: no se han documentado requisitos específicos para RTX 4090, A100 o H100; el modelo está diseñado para ejecución en dispositivo, no para servidores de inferencia tradicionales.
- Opciones de despliegue: LiteRT-LM (Android, iOS, macOS y web), MediaPipe (Universal Embedder y Semantic Retriever), Google AI Edge Gallery.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| EmbeddingGemma 2 Text Vision 440M (esta variante) | 440M | Texto, imagen | int4 + int8 (QAT) | Apache 2.0 | LiteRT-LM |
| EmbeddingGemma 2 Text 270M | 270M | Texto | int4 (QAT) | no disponible en la información | LiteRT-LM |
| EmbeddingGemma 2 740M | 740M | Texto, imagen, vídeo, audio | int4 + int8 (QAT) | no disponible en la información | LiteRT-LM |

La comparación se limita a las variantes de la propia familia EmbeddingGemma 2 documentadas en la model card; no se dispone de datos de benchmarks ni de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, responder preguntas ni ejecutar instrucciones; solo genera embeddings.
- La model card no documenta sesgos conocidos, pero al derivar de un modelo base de Google y de un fine-tuning no detallado, pueden persistir sesgos de los datos originales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones irrelevantes si los embeddings no se alinean bien con el dominio de uso.
- Longitud de contexto no documentada: se desconoce el máximo de tokens por entrada, lo que limita la planificación de pipelines con documentos largos.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe sin evaluación previa.
- El fine-tuning y la conversión los ha realizado el usuario Gakwavu, no Google; no hay garantías de calidad equivalentes al modelo base oficial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/embeddinggemma-2`.
- El formato LiteRT-LM limita el despliegue a entornos compatibles (dispositivos móviles, macOS, web); no es directamente utilizable en vLLM, TGI o llama.cpp.

## Enlaces

- [Hugging Face: Gakwavu/embeddinggemma-2-text-vision-440m-litert-lm](https://huggingface.co/Gakwavu/embeddinggemma-2-text-vision-440m-litert-lm)
- [Modelo base: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Documentación de LiteRT-LM](https://developers.google.com/edge/litert-lm/overview)
- [Google AI Edge Gallery (Android)](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery)
- [Google AI Edge Gallery (iOS)](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337)
- [Foresight para macOS](https://developers.google.com/edge/foresight)
- [Demo web de búsqueda con embeddings](https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html)
- [Demo de búsqueda semántica de imágenes con MediaPipe](https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever)
- [Demo de toma de decisiones con MediaPipe](https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker)
