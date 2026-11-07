# shogoorg/my-multimodal-embeddinggemma-2-finetuned

## Resumen

`shogoorg/my-multimodal-embeddinggemma-2-finetuned` es un modelo de embeddings multimodales publicado en Hugging Face, obtenido mediante fine-tuning del modelo base `google/embeddinggemma-2` con la librería sentence-transformers. Su función es proyectar entradas de distinta naturaleza (texto, imagen, audio, vídeo y mensajes estructurados) a un espacio vectorial denso común de 768 dimensiones con similitud coseno, lo que permite tareas de búsqueda semántica y recuperación cruzada entre modalidades.

El modelo resuelve el problema de la recuperación multimodal: alinear una consulta textual con documentos visuales o audiovisuales en un mismo espacio de representación. Es relevante porque se apoya en la familia EmbeddingGemma 2 de Google, orientada a embeddings multimodales nativos y a ejecución en dispositivo, y porque demuestra el flujo de adaptación de ese modelo base a un caso concreto mediante sentence-transformers.

La ficha debe leerse con cautela: el autor no ha publicado información sobre licencia, idiomas ni resultados de evaluación, y el conjunto de entrenamiento declarado consta de tan solo 3 muestras (un ancla textual y pares positivo/negativo de imagen). Se trata, por tanto, de un artefacto de experimentación más que de un modelo listo para producción. El repositorio ocupa 0,9 GB y contiene 438.760.472 parámetros en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para extracción de características (EmbeddingGemma2Model) con pooling por media y normalización posterior |
| Parámetros totales | 438.760.472 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card muestra un valor corrupto: 1000000000000000019884624838656 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Dimensión de salida | 768 |
| Función de similitud | Similitud coseno |
| Modalidades soportadas | Texto, imagen, audio, vídeo y mensaje (estructurado) |
| Modelo base | google/embeddinggemma-2 (revisión f9972ac22e696a105c482202646979e33e4b5a1e) |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` compuesto por tres módulos encadenados: (0) un transformer de extracción de características de tipo `EmbeddingGemma2Model`, con configuración de modalidad para texto, imagen, audio, vídeo y mensaje, que expone `last_hidden_state`; (1) un pooling por media (`pooling_mode: mean`, `include_prompt: True`) que produce un vector de 768 dimensiones; y (2) una normalización final sobre `sentence_embedding`. El resultado es un embedding denso normalizado y comparable por similitud coseno. El modelo base, EmbeddingGemma 2 de Google, está descrito públicamente como un modelo multimodal nativo que mapea combinaciones de texto, imagen, audio y vídeo a un espacio de embeddings unificado, orientado a ejecución en dispositivo.

El fine-tuning se realizó con la librería sentence-transformers y la función de pérdida `MultipleNegativesRankingLoss` (referencias arXiv 1908.10084 y 1807.03748), una elección estándar para entrenamiento con pares y negativos en recuperación densa. El detalle crítico es el volumen de datos: el conjunto de entrenamiento declarado contiene 3 muestras, con columnas `anchor` (texto), `positive` (imagen) y `negative` (imagen). Las anclas tienen entre 5 y 6 tokens y las imágenes son de 240x240 píxeles. No se documenta número de épocas, hiperparámetros, composición del dataset ni si hubo etapas adicionales de alineación o ajuste fino preferencial. Tampoco se especifica el proceso de tokenización multimodal ni la resolución nativa de imagen del modelo base.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para similitud semántica textual, búsqueda semántica, minería de paráfrasis, clasificación y clustering.
- Recuperación multimodal cruzada: codifica consultas de texto y documentos de imagen, audio, vídeo o mensaje estructurado en un espacio común, como demuestra el ejemplo de la model card (una consulta textual frente a tres imágenes con puntuaciones de similitud de 0,7244, 0,6133 y 0,6784).
- API diferenciada `encode_query` / `encode_document`, pensada para escenarios de recuperación asimétrica consulta-documento.
- Soporte declarado de las modalidades texto, imagen, audio, vídeo y mensaje estructurado, heredado de la configuración del transformer base.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica texto-a-imagen: indexar un catálogo de imágenes y recuperar las más relevantes para una consulta textual, usando `encode_document` sobre las imágenes y `encode_query` sobre la consulta, con similitud coseno sobre vectores de 768 dimensiones.
- Recuperación aumentada multimodal en asistentes: dado un repositorio de capturas, diagramas o vídeos, recuperar los fragmentos visuales pertinentes para complementar el contexto de un modelo generativo.
- Deduplicación y clustering de activos visuales: agrupar imágenes o vídeos por similitud semántica en pipelines de gestión de contenido, aprovechando el pooling por media y la normalización.
- Moderación y clasificación de contenido multimodal: entrenar un clasificador ligero sobre los embeddings para etiquetar imágenes o audio según categorías definidas.
- Prototipado de motores de recomendación: calcular similitud entre el perfil de un usuario (texto) y elementos del catálogo (imagen, vídeo, audio) en un único espacio vectorial.
- Filtrado previo en pipelines de visión por computador: usar el embedding como etapa de recuperación barata antes de un modelo más costoso de descripción o análisis de imagen.
- Experimentación académica sobre alineación multimodal: servir como punto de partida reproducible para estudiar el efecto del fine-tuning con `MultipleNegativesRankingLoss` sobre un modelo base multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (Recall@k, MRR, nDCG) ni comparaciones con el modelo base, y no se dispone de evaluación sobre MTEB, MIEB ni conjuntos de recuperación multimodal.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,9-1,0 GB para los pesos (438,7 M de parámetros), más el coste de activaciones y del codificador visual/audio del modelo base, que no se detalla.
- VRAM estimada en fp32: aproximadamente 1,8 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes pequeños; una RTX 4090 o A100/H100 aportan margen para lotes grandes y mayor throughput, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB o más, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; no se dispone de mediciones confirmadas.
- Opciones de despliegue: sentence-transformers (vía principal), endpoints de Hugging Face (etiqueta `endpoints_compatible`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que en general no cubren este tipo de modelo de embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de salida | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shogoorg/my-multimodal-embeddinggemma-2-finetuned | 438,7 M | No disponible | 768 | Texto, imagen, audio, vídeo, mensaje | No disponible | Hugging Face, 0 descargas |
| google/embeddinggemma-2 | No disponible en la información proporcionada | No disponible | No disponible | Texto, imagen, audio, vídeo (según la descripción pública) | No disponible en la información proporcionada | Hugging Face (modelo base) |
| Alternativas de embeddings textuales de tamaño similar | No disponible | No disponible | No disponible | Texto | No disponible | No disponible |

La comparación relevante es con el propio modelo base: este fine-tuning parte de `google/embeddinggemma-2` y solo modifica los pesos mediante 3 muestras de entrenamiento, por lo que no hay evidencia de mejora sobre el base. No se dispone de datos suficientes para comparar con otras familias de embeddings multimodales.

## Limitaciones y advertencias

- Entrenamiento con solo 3 muestras: el ajuste es anecdótico y no hay garantía de mejora sobre el modelo base; el riesgo de sobreajuste y de degradación de las capacidades originales es alto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución; hay que verificar la licencia del modelo base `google/embeddinggemma-2` antes de cualquier despliegue.
- Idiomas no declarados: se desconoce la cobertura lingüística real y el comportamiento en castellano.
- Longitud de contexto no fiable: el valor de la model card está corrupto y no permite planificar el truncado de documentos largos.
- Riesgo de sesgos y alucinación de similitud: al ser un modelo de embeddings, puede producir recuperaciones espurias o falsos positivos en dominios alejados de los datos de entrenamiento; no genera texto, por lo que la alucinación se manifiesta como recuperación irrelevante.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en recuperación multimodal ni de paridad con el modelo base.
- Advertencia de producción: no recomendado para sistemas en producción sin una evaluación propia sobre el dominio objetivo y sin clarificar la licencia.
- La model card contiene secciones sin completar (uso fuera de alcance, sesgos, recomendaciones) y metadatos de idioma y licencia comentados, lo que indica documentación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shogoorg/my-multimodal-embeddinggemma-2-finetuned
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Blog de Google sobre EmbeddingGemma 2: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos sentence-transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de MultipleNegativesRankingLoss (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Sentence-BERT (arXiv 1807.03748): https://arxiv.org/abs/1807.03748
